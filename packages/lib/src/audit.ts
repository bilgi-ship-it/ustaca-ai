export const auditEventNames = [
  "customer.created",
  "trial.started",
  "trial.expired",
  "payment.received",
  "payment.past_due",
  "site.suspended",
  "site.reactivated",
  "support.created",
  "domain.issue_detected",
  "special_project.flagged",
  "site_generation.failed"
] as const;

export type AuditEventName = (typeof auditEventNames)[number];

export type AuditEvent = {
  eventName: AuditEventName;
  actorRole: "system" | "super_admin" | "ops_admin" | "customer";
  customerId?: string;
  occurredAt: string;
  metadata?: Record<string, string | number | boolean>;
};

