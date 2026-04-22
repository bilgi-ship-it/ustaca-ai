import type { NotificationStatus } from "@ustaca/domain";

import { createLifecycleService } from "./lifecycle";
import type { UstacaRepositoryBundle } from "./repositories";
import type { NotificationDocument, PaymentDocument } from "./schema";

const nowIso = () => new Date().toISOString();

const getCreatedAt = (document: { created_at: string; createdAt: string }) =>
  document.created_at ?? document.createdAt;

const sortByCreatedAtAscending = <T extends { created_at: string; createdAt: string }>(documents: T[]) =>
  [...documents].sort(
    (left, right) => new Date(getCreatedAt(left)).getTime() - new Date(getCreatedAt(right)).getTime()
  );

const shouldMarkPaymentPastDue = (payment: PaymentDocument, referenceTime: string) =>
  (payment.payment_status === "pending" || payment.payment_status === "trialing") &&
  payment.paidAt === null &&
  payment.is_overdue === false &&
  new Date(payment.dueAt).getTime() <= new Date(referenceTime).getTime();

const updateNotificationStatus = (
  notification: NotificationDocument,
  timestamp: string,
  status: NotificationStatus,
  patch: Partial<NotificationDocument> = {}
): NotificationDocument => ({
  ...notification,
  ...patch,
  status,
  notification_status: status,
  status_changed_at:
    status === notification.notification_status ? notification.status_changed_at : timestamp,
  updated_at: timestamp,
  updatedAt: timestamp
});

export type NotificationSendResult =
  | {
      ok: true;
      providerMessageId?: string | null;
    }
  | {
      ok: false;
      error: string;
      retryable?: boolean;
    };

export type NotificationSender = {
  name: string;
  send(notification: NotificationDocument): Promise<NotificationSendResult>;
};

export const createConsoleNotificationSender = (): NotificationSender => ({
  name: "console",
  async send(notification) {
    console.info("[notification-worker] console delivery", {
      id: notification.id,
      channel: notification.channel,
      eventName: notification.eventName,
      recipient: notification.recipient,
      subject: notification.subject
    });

    return { ok: true };
  }
});

export const createNoopNotificationSender = (): NotificationSender => ({
  name: "noop",
  async send() {
    return { ok: true };
  }
});

export type BackgroundJobService = ReturnType<typeof createBackgroundJobService>;

export const createBackgroundJobService = (
  repositories: UstacaRepositoryBundle,
  options: {
    sender?: NotificationSender;
    maxNotificationAttempts?: number;
  } = {}
) => {
  const lifecycle = createLifecycleService(repositories);
  const sender = options.sender ?? createConsoleNotificationSender();
  const maxNotificationAttempts = options.maxNotificationAttempts ?? 3;

  const runTrialExpirationSweep = async (input: { now?: string; batchSize?: number } = {}) => {
    const referenceTime = input.now ?? nowIso();
    const candidates = sortByCreatedAtAscending(
      await repositories.trials.listExpiringBefore(referenceTime)
    );
    const batch = input.batchSize ? candidates.slice(0, input.batchSize) : candidates;
    const errors: Array<{ trialId: string; message: string }> = [];
    let expired = 0;
    let skipped = 0;

    for (const trial of batch) {
      try {
        const result = await lifecycle.expireTrial(trial.id, {
          actorRole: "system",
          metadata: {
            jobName: "trial-expiration-sweep",
            referenceTime
          }
        });

        if (result.changed) {
          expired += 1;
        } else {
          skipped += 1;
        }
      } catch (error) {
        errors.push({
          trialId: trial.id,
          message: error instanceof Error ? error.message : "trial_expiration_failed"
        });
      }
    }

    return {
      scanned: batch.length,
      expired,
      skipped,
      errors
    };
  };

  const runPaymentOverdueSweep = async (input: { now?: string; batchSize?: number } = {}) => {
    const referenceTime = input.now ?? nowIso();
    const [pendingPayments, trialingPayments] = await Promise.all([
      repositories.payments.listByStatus("pending"),
      repositories.payments.listByStatus("trialing")
    ]);

    const candidates = sortByCreatedAtAscending([...pendingPayments, ...trialingPayments]).filter(
      (payment) => shouldMarkPaymentPastDue(payment, referenceTime)
    );
    const batch = input.batchSize ? candidates.slice(0, input.batchSize) : candidates;
    const errors: Array<{ paymentId: string; message: string }> = [];
    let markedPastDue = 0;
    let skipped = 0;

    for (const payment of batch) {
      try {
        const result = await lifecycle.markPaymentPastDue(payment.id, {
          actorRole: "system",
          metadata: {
            jobName: "payment-overdue-sweep",
            referenceTime,
            dueAt: payment.dueAt
          }
        });

        if (result.changed) {
          markedPastDue += 1;
        } else {
          skipped += 1;
        }
      } catch (error) {
        errors.push({
          paymentId: payment.id,
          message: error instanceof Error ? error.message : "payment_overdue_failed"
        });
      }
    }

    return {
      scanned: batch.length,
      markedPastDue,
      skipped,
      errors
    };
  };

  const processNotificationQueue = async (input: { batchSize?: number } = {}) => {
    const candidates = sortByCreatedAtAscending(await repositories.notifications.listPending());
    const batch = input.batchSize ? candidates.slice(0, input.batchSize) : candidates;
    const errors: Array<{ notificationId: string; message: string }> = [];
    let sent = 0;
    let retried = 0;
    let failed = 0;

    for (const notification of batch) {
      if (notification.attemptCount >= maxNotificationAttempts) {
        const failedNotification = updateNotificationStatus(notification, nowIso(), "failed");
        await repositories.notifications.upsert(failedNotification);
        failed += 1;
        continue;
      }

      const attemptTime = nowIso();

      try {
        const delivery = await sender.send(notification);

        if (delivery.ok) {
          const sentNotification = updateNotificationStatus(notification, attemptTime, "sent", {
            attemptCount: notification.attemptCount + 1,
            lastAttemptAt: attemptTime,
            sentAt: attemptTime
          });

          await repositories.notifications.upsert(sentNotification);
          sent += 1;
          continue;
        }

        const nextAttemptCount = notification.attemptCount + 1;
        const nextStatus =
          delivery.retryable === false || nextAttemptCount >= maxNotificationAttempts
            ? "failed"
            : "queued";

        const updatedNotification = updateNotificationStatus(notification, attemptTime, nextStatus, {
          attemptCount: nextAttemptCount,
          lastAttemptAt: attemptTime
        });

        await repositories.notifications.upsert(updatedNotification);

        if (nextStatus === "failed") {
          failed += 1;
        } else {
          retried += 1;
        }

        errors.push({
          notificationId: notification.id,
          message: delivery.error
        });
      } catch (error) {
        const nextAttemptCount = notification.attemptCount + 1;
        const nextStatus =
          nextAttemptCount >= maxNotificationAttempts ? "failed" : "queued";
        const updatedNotification = updateNotificationStatus(notification, attemptTime, nextStatus, {
          attemptCount: nextAttemptCount,
          lastAttemptAt: attemptTime
        });

        await repositories.notifications.upsert(updatedNotification);

        if (nextStatus === "failed") {
          failed += 1;
        } else {
          retried += 1;
        }

        errors.push({
          notificationId: notification.id,
          message: error instanceof Error ? error.message : "notification_processing_failed"
        });
      }
    }

    return {
      scanned: batch.length,
      sent,
      retried,
      failed,
      sender: sender.name,
      errors
    };
  };

  return {
    runTrialExpirationSweep,
    runPaymentOverdueSweep,
    processNotificationQueue
  };
};
