import { buildNotificationDocument } from "@ustaca/lib";

import type { UstacaRepositoryBundle } from "./repositories";

const nowIso = () => new Date().toISOString();

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const isSupportCreatedNotification = (
  notification: {
    eventName: string;
    recipient: string;
    notification_status: string;
    payload: Record<string, unknown>;
  },
  ticketId: string,
  recipient: string
) =>
  notification.eventName === "support.created" &&
  notification.recipient.trim().toLowerCase() === recipient.trim().toLowerCase() &&
  notification.notification_status !== "failed" &&
  notification.payload.ticketId === ticketId;

export type EventProcessingService = ReturnType<typeof createEventProcessingService>;

export const createEventProcessingService = (repositories: UstacaRepositoryBundle) => {
  const processSupportCreated = async (input: {
    ticketId: string;
    recipient: string;
    actorUserId?: string | null;
    occurredAt?: string;
  }) => {
    const ticket = await repositories.supportTickets.getById(input.ticketId);
    if (!ticket) {
      throw new Error(`Destek kaydi bulunamadi: ${input.ticketId}`);
    }

    const customer = await repositories.customers.getById(ticket.customer_id);
    if (!customer) {
      throw new Error(`Musteri bulunamadi: ${ticket.customer_id}`);
    }

    const existingNotifications = await repositories.notifications.listByCustomer(customer.id);
    const existing = existingNotifications.find((notification) =>
      isSupportCreatedNotification(notification, ticket.id, input.recipient)
    );

    if (existing) {
      return { notification: existing, changed: false as const };
    }

    const timestamp = input.occurredAt ?? nowIso();
    const notification = buildNotificationDocument({
      id: generateId("notif"),
      eventName: "support.created",
      channel: "email",
      recipient: input.recipient,
      subject: `Yeni destek talebi · ${customer.businessName}`,
      customerId: customer.id,
      siteId: ticket.site_id,
      userId: input.actorUserId ?? null,
      payload: {
        ticketId: ticket.id,
        customerId: customer.id,
        businessName: customer.businessName,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        channel: ticket.channel
      },
      now: timestamp
    });

    await repositories.notifications.enqueue(notification);

    return { notification, changed: true as const };
  };

  return {
    processSupportCreated
  };
};
