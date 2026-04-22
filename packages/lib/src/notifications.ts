import type {
  NotificationChannel,
  NotificationEntity,
  NotificationStatus
} from "@ustaca/domain";
import { createEntityTimestamps } from "@ustaca/domain";

export type NotificationEventName =
  | "user.registered"
  | "trial.started"
  | "trial.expired"
  | "payment.received"
  | "payment.past_due"
  | "site.activated"
  | "site.suspended"
  | "support.created"
  | "special_project.flagged"
  | "site_generation.failed"
  | "domain.issue_detected";

export type NotificationDraft = {
  id: string;
  eventName: NotificationEventName;
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  customerId?: string | null;
  siteId?: string | null;
  userId?: string | null;
  payload?: Record<string, unknown>;
  now?: string;
};

const initialStatus: NotificationStatus = "queued";

export const buildNotificationDocument = (draft: NotificationDraft): NotificationEntity => {
  const timestamp = draft.now ?? new Date().toISOString();
  const recipientKey = draft.recipient.trim().toLowerCase();
  const eventKey = draft.eventName.toLowerCase();
  const customerId = draft.customerId ?? null;
  const siteId = draft.siteId ?? null;
  const userId = draft.userId ?? null;

  return {
    id: draft.id,
    status: initialStatus,
    ...createEntityTimestamps(timestamp),
    customer_id: customerId,
    customerId,
    site_id: siteId,
    siteId,
    user_id: userId,
    userId,
    channel: draft.channel,
    eventName: draft.eventName,
    event_name_key: eventKey,
    notification_status: initialStatus,
    recipient: draft.recipient,
    recipient_key: recipientKey,
    subject: draft.subject,
    attemptCount: 0,
    lastAttemptAt: null,
    sentAt: null,
    payload: draft.payload ?? {}
  };
};
