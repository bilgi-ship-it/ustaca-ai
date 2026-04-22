import { z } from "zod";

import {
  aiAssistantSchema,
  assistantChannelSchema,
  galleryAssetSchema,
  paymentActivationOpsStatusSchema,
  paymentVerificationSourceSchema,
  paymentVerificationStateSchema,
  pricingPlanSchema,
  productModuleSchema,
  paymentWorkflowStatusSchema,
  requestStateSchema,
  serviceSchema,
  ticketPrioritySchema,
  userRoleSchema
} from "./models";

const isoDatetimeSchema = z.string().min(1);
const nullableDatetimeSchema = isoDatetimeSchema.nullable();
const filterKeySchema = z.string().min(1);
const nullableFilterKeySchema = filterKeySchema.nullable();
const referenceIdSchema = z.string().min(1);
const nullableReferenceIdSchema = referenceIdSchema.nullable();

export const customerStatusSchema = z.enum([
  "draft",
  "trial_active",
  "trial_expired",
  "payment_waiting",
  "active",
  "suspended",
  "special_project",
  "archived"
]);

export const siteStatusSchema = z.enum(["draft", "trial_live", "active", "suspended", "archived"]);
export const trialStatusSchema = z.enum(["scheduled", "active", "expired", "converted", "cancelled"]);
export const paymentStatusSchema = z.enum(["pending", "trialing", "paid", "past_due", "cancelled"]);
export const domainStatusSchema = z.enum([
  "requested",
  "pending_verification",
  "connected",
  "dns_issue",
  "archived"
]);
export const supportStatusSchema = z.enum([
  "open",
  "in_progress",
  "waiting_on_customer",
  "resolved",
  "closed"
]);
export const notificationStatusSchema = z.enum(["queued", "processing", "sent", "failed"]);
export const userStatusSchema = z.enum(["active", "suspended"]);
export const specialProjectStatusSchema = z.enum(["flagged", "reviewing", "routed", "closed"]);
export const notificationChannelSchema = z.enum(["email", "sms", "whatsapp"]);
export const supportChannelSchema = z.enum(["chat", "email", "whatsapp"]);
export const billingCycleSchema = z.enum(["setup", "annual"]);

const createBaseEntityShape = <TStatus extends z.ZodTypeAny>(statusSchema: TStatus) => ({
  id: z.string(),
  status: statusSchema,
  created_at: isoDatetimeSchema,
  updated_at: isoDatetimeSchema,
  status_changed_at: isoDatetimeSchema,
  is_archived: z.boolean(),
  archived_at: nullableDatetimeSchema,
  is_deleted: z.boolean(),
  deleted_at: nullableDatetimeSchema,
  createdAt: isoDatetimeSchema,
  updatedAt: isoDatetimeSchema
});

export const socialLinkSchema = z.object({
  label: z.string(),
  url: z.string().url()
});

export const workingHourSchema = z.object({
  label: z.string(),
  opensAt: z.string().nullable(),
  closesAt: z.string().nullable(),
  closed: z.boolean()
});

export const customerContactSchema = z.object({
  phone: z.string(),
  email: z.string().email(),
  address: z.string(),
  city: z.string(),
  whatsapp: z.string().nullable(),
  workingHours: z.array(workingHourSchema),
  socialLinks: z.array(socialLinkSchema)
});

export const siteContentSchema = z.object({
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  about: z.string(),
  primaryCta: z.string(),
  secondaryCta: z.string(),
  themeAccent: z.string()
});

export const paymentLineItemSchema = z.object({
  productCode: z.string(),
  label: z.string(),
  amount: z.number().nonnegative()
});

export const auditActorRoleSchema = z.enum(["system", ...userRoleSchema.options]);

export const userEntitySchema = z.object({
  ...createBaseEntityShape(userStatusSchema),
  customer_id: nullableReferenceIdSchema,
  customerId: nullableReferenceIdSchema,
  email: z.string().email(),
  email_key: filterKeySchema,
  name: z.string(),
  role: userRoleSchema,
  user_status: userStatusSchema,
  last_login_at: nullableDatetimeSchema,
  lastLoginAt: nullableDatetimeSchema
});

export const customerEntitySchema = z.object({
  ...createBaseEntityShape(customerStatusSchema),
  owner_user_id: referenceIdSchema,
  ownerUserId: referenceIdSchema,
  site_id: nullableReferenceIdSchema,
  siteId: nullableReferenceIdSchema,
  active_trial_id: nullableReferenceIdSchema,
  activeTrialId: nullableReferenceIdSchema,
  active_payment_id: nullableReferenceIdSchema,
  activePaymentId: nullableReferenceIdSchema,
  primary_domain_id: nullableReferenceIdSchema,
  primaryDomainId: nullableReferenceIdSchema,
  special_project_flag_id: nullableReferenceIdSchema,
  specialProjectFlagId: nullableReferenceIdSchema,
  businessName: z.string(),
  legalName: z.string().nullable(),
  shortDescription: z.string(),
  sector: z.string(),
  subSector: z.string().nullable(),
  contact: customerContactSchema,
  targetDomain: z.string(),
  customer_status: customerStatusSchema,
  business_name_key: filterKeySchema,
  owner_email_key: filterKeySchema,
  city_key: filterKeySchema,
  sector_key: filterKeySchema,
  sub_sector_key: nullableFilterKeySchema,
  target_domain_key: filterKeySchema
});

export const siteEntitySchema = z.object({
  ...createBaseEntityShape(siteStatusSchema),
  customer_id: referenceIdSchema,
  customerId: referenceIdSchema,
  slug: z.string(),
  slug_key: filterKeySchema,
  preview_hostname: z.string(),
  previewHostname: z.string(),
  preview_hostname_key: filterKeySchema,
  custom_domain: z.string().nullable(),
  customDomain: z.string().nullable(),
  custom_domain_key: nullableFilterKeySchema,
  themeFamily: z.string(),
  theme_family_key: filterKeySchema,
  themeVariant: z.string().nullable(),
  site_status: siteStatusSchema,
  publishedAt: nullableDatetimeSchema,
  suspendedAt: nullableDatetimeSchema,
  content: siteContentSchema,
  services: z.array(serviceSchema),
  pricingPlans: z.array(pricingPlanSchema),
  gallery: z.array(galleryAssetSchema),
  enabledModules: z.array(productModuleSchema)
});

export const trialEntitySchema = z.object({
  ...createBaseEntityShape(trialStatusSchema),
  customer_id: referenceIdSchema,
  customerId: referenceIdSchema,
  site_id: referenceIdSchema,
  siteId: referenceIdSchema,
  trial_status: trialStatusSchema,
  startsAt: isoDatetimeSchema,
  endsAt: isoDatetimeSchema,
  expiredAt: nullableDatetimeSchema,
  convertedAt: nullableDatetimeSchema,
  temporaryHostname: z.string(),
  temporary_hostname_key: filterKeySchema,
  targetDomain: z.string(),
  target_domain_key: filterKeySchema,
  planName: z.string(),
  daysGranted: z.number().int().positive()
});

export const paymentEntitySchema = z.object({
  ...createBaseEntityShape(paymentStatusSchema),
  customer_id: referenceIdSchema,
  customerId: referenceIdSchema,
  site_id: referenceIdSchema,
  siteId: referenceIdSchema,
  payment_status: paymentStatusSchema,
  billingCycle: billingCycleSchema,
  installmentsTotal: z.number().int().min(1).max(12),
  installmentsPaid: z.number().int().min(0).max(12),
  currency: z.string(),
  totalAmount: z.number().nonnegative(),
  paidAmount: z.number().nonnegative(),
  dueAt: isoDatetimeSchema,
  due_on_day: filterKeySchema,
  paidAt: nullableDatetimeSchema,
  suspendedAt: nullableDatetimeSchema,
  is_overdue: z.boolean(),
  payment_workflow_status: paymentWorkflowStatusSchema,
  activation_ops_status: paymentActivationOpsStatusSchema,
  payment_verification_status: paymentVerificationStateSchema,
  payment_verification_source: paymentVerificationSourceSchema.nullable(),
  payment_order_id: z.string().nullable(),
  payment_verification_summary: z.string(),
  payment_verified_at: nullableDatetimeSchema,
  payment_last_checked_at: nullableDatetimeSchema,
  payment_verification_raw: z.unknown().nullable(),
  activation_ready_at: nullableDatetimeSchema,
  activation_completed_at: nullableDatetimeSchema,
  verified_by_user_id: nullableReferenceIdSchema,
  verified_by_role: auditActorRoleSchema.nullable(),
  manual_note: z.string(),
  invoiceCode: z.string(),
  invoice_code_key: filterKeySchema,
  items: z.array(paymentLineItemSchema)
});

export const domainEntitySchema = z.object({
  ...createBaseEntityShape(domainStatusSchema),
  customer_id: referenceIdSchema,
  customerId: referenceIdSchema,
  site_id: referenceIdSchema,
  siteId: referenceIdSchema,
  domain_status: domainStatusSchema,
  requested_hostname: z.string(),
  requestedHostname: z.string(),
  normalized_hostname: z.string(),
  normalizedHostname: z.string(),
  trial_hostname: z.string(),
  trialHostname: z.string(),
  live_hostname: z.string().nullable(),
  liveHostname: z.string().nullable(),
  hostname_key: filterKeySchema,
  dnsTarget: z.string(),
  registrar: z.string(),
  registrar_key: filterKeySchema,
  managedByUstaca: z.boolean(),
  sslEnabled: z.boolean(),
  verifiedAt: nullableDatetimeSchema,
  expiresAt: nullableDatetimeSchema,
  lastCheckAt: nullableDatetimeSchema
});

export const formSubmissionEntitySchema = z.object({
  ...createBaseEntityShape(requestStateSchema),
  customer_id: referenceIdSchema,
  customerId: referenceIdSchema,
  site_id: referenceIdSchema,
  siteId: referenceIdSchema,
  request_status: requestStateSchema,
  service_key: filterKeySchema,
  source_key: filterKeySchema,
  name: z.string(),
  phone: z.string(),
  email: z.string().email().nullable(),
  service: z.string(),
  source: z.string(),
  message: z.string(),
  notes: z.string(),
  submittedAt: isoDatetimeSchema
});

export const appointmentRequestEntitySchema = z.object({
  ...createBaseEntityShape(requestStateSchema),
  customer_id: referenceIdSchema,
  customerId: referenceIdSchema,
  site_id: referenceIdSchema,
  siteId: referenceIdSchema,
  request_status: requestStateSchema,
  requested_service_key: filterKeySchema,
  name: z.string(),
  phone: z.string(),
  requestedService: z.string(),
  requestedAt: isoDatetimeSchema,
  notes: z.string()
});

export const supportTicketEntitySchema = z.object({
  ...createBaseEntityShape(supportStatusSchema),
  customer_id: referenceIdSchema,
  customerId: referenceIdSchema,
  site_id: referenceIdSchema,
  siteId: referenceIdSchema,
  support_status: supportStatusSchema,
  category_key: filterKeySchema,
  subject_key: filterKeySchema,
  subject: z.string(),
  category: z.string(),
  priority: ticketPrioritySchema,
  channel: supportChannelSchema,
  customerMessage: z.string(),
  opsNote: z.string(),
  resolvedAt: nullableDatetimeSchema,
  lastResponseAt: nullableDatetimeSchema
});

export const aiAssistantEntitySchema = z.object({
  ...createBaseEntityShape(z.boolean()),
  customer_id: referenceIdSchema,
  customerId: referenceIdSchema,
  site_id: referenceIdSchema,
  siteId: referenceIdSchema,
  channel: assistantChannelSchema,
  enabled: z.boolean(),
  greeting: z.string(),
  primaryGoal: z.string(),
  escalationRoute: z.string(),
  maxCatalogItems: z.number().int().min(0).max(100),
  knowledgeScope: z.array(z.string())
});

export const notificationEntitySchema = z.object({
  ...createBaseEntityShape(notificationStatusSchema),
  customer_id: nullableReferenceIdSchema,
  customerId: nullableReferenceIdSchema,
  site_id: nullableReferenceIdSchema,
  siteId: nullableReferenceIdSchema,
  user_id: nullableReferenceIdSchema,
  userId: nullableReferenceIdSchema,
  channel: notificationChannelSchema,
  eventName: z.string(),
  event_name_key: filterKeySchema,
  notification_status: notificationStatusSchema,
  recipient: z.string(),
  recipient_key: filterKeySchema,
  subject: z.string(),
  attemptCount: z.number().int().min(0),
  lastAttemptAt: nullableDatetimeSchema,
  sentAt: nullableDatetimeSchema,
  payload: z.record(z.unknown())
});

export const specialProjectFlagEntitySchema = z.object({
  ...createBaseEntityShape(specialProjectStatusSchema),
  customer_id: referenceIdSchema,
  customerId: referenceIdSchema,
  site_id: nullableReferenceIdSchema,
  siteId: nullableReferenceIdSchema,
  special_project_status: specialProjectStatusSchema,
  reason_key: filterKeySchema,
  reason: z.string(),
  requestedFeature: z.string().nullable(),
  priority: ticketPrioritySchema,
  opsNote: z.string(),
  routedAt: nullableDatetimeSchema
});

export const auditLogEntitySchema = z.object({
  ...createBaseEntityShape(z.enum(["recorded", "archived"])),
  customer_id: nullableReferenceIdSchema,
  customerId: nullableReferenceIdSchema,
  site_id: nullableReferenceIdSchema,
  siteId: nullableReferenceIdSchema,
  actor_user_id: nullableReferenceIdSchema,
  actorUserId: nullableReferenceIdSchema,
  actorRole: auditActorRoleSchema,
  action: z.string(),
  action_key: filterKeySchema,
  targetCollection: z.string(),
  targetId: z.string(),
  summary: z.string(),
  metadata: z.record(z.unknown())
});

export const customerDataBundleSchema = z.object({
  user: userEntitySchema,
  customer: customerEntitySchema,
  site: siteEntitySchema,
  trial: trialEntitySchema.nullable(),
  payments: z.array(paymentEntitySchema),
  domains: z.array(domainEntitySchema),
  formSubmissions: z.array(formSubmissionEntitySchema),
  appointmentRequests: z.array(appointmentRequestEntitySchema),
  supportTickets: z.array(supportTicketEntitySchema),
  aiAssistants: z.array(aiAssistantEntitySchema),
  notifications: z.array(notificationEntitySchema),
  specialProjectFlag: specialProjectFlagEntitySchema.nullable()
});

export type CustomerStatus = z.infer<typeof customerStatusSchema>;
export type SiteStatus = z.infer<typeof siteStatusSchema>;
export type TrialStatus = z.infer<typeof trialStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type DomainStatus = z.infer<typeof domainStatusSchema>;
export type SupportStatus = z.infer<typeof supportStatusSchema>;
export type NotificationStatus = z.infer<typeof notificationStatusSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export type SpecialProjectStatus = z.infer<typeof specialProjectStatusSchema>;
export type NotificationChannel = z.infer<typeof notificationChannelSchema>;
export type SupportChannel = z.infer<typeof supportChannelSchema>;
export type CustomerContact = z.infer<typeof customerContactSchema>;
export type SiteContent = z.infer<typeof siteContentSchema>;
export type PaymentLineItem = z.infer<typeof paymentLineItemSchema>;
export type UserEntity = z.infer<typeof userEntitySchema>;
export type CustomerEntity = z.infer<typeof customerEntitySchema>;
export type SiteEntity = z.infer<typeof siteEntitySchema>;
export type TrialEntity = z.infer<typeof trialEntitySchema>;
export type PaymentEntity = z.infer<typeof paymentEntitySchema>;
export type DomainEntity = z.infer<typeof domainEntitySchema>;
export type FormSubmissionEntity = z.infer<typeof formSubmissionEntitySchema>;
export type AppointmentRequestEntity = z.infer<typeof appointmentRequestEntitySchema>;
export type SupportTicketEntity = z.infer<typeof supportTicketEntitySchema>;
export type AiAssistantEntity = z.infer<typeof aiAssistantEntitySchema>;
export type NotificationEntity = z.infer<typeof notificationEntitySchema>;
export type SpecialProjectFlagEntity = z.infer<typeof specialProjectFlagEntitySchema>;
export type AuditLogEntity = z.infer<typeof auditLogEntitySchema>;
export type CustomerDataBundle = z.infer<typeof customerDataBundleSchema>;

export const defaultWorkingHours: CustomerContact["workingHours"] = [
  { label: "Pazartesi - Cuma", opensAt: "09:00", closesAt: "18:00", closed: false },
  { label: "Cumartesi", opensAt: "10:00", closesAt: "15:00", closed: false },
  { label: "Pazar", opensAt: null, closesAt: null, closed: true }
];

export const defaultSocialLinks: CustomerContact["socialLinks"] = [];

export const createAdminFilterKey = (value: string | null | undefined) =>
  value ? value.trim().toLowerCase().replace(/\s+/g, " ") : null;

export const createEntityTimestamps = (timestamp: string) => ({
  created_at: timestamp,
  updated_at: timestamp,
  status_changed_at: timestamp,
  is_archived: false,
  archived_at: null,
  is_deleted: false,
  deleted_at: null,
  createdAt: timestamp,
  updatedAt: timestamp
});

export const customerStatusFromTrialStatus = (trialStatus: TrialStatus): CustomerStatus => {
  if (trialStatus === "active") {
    return "trial_active";
  }

  if (trialStatus === "expired") {
    return "trial_expired";
  }

  if (trialStatus === "converted") {
    return "active";
  }

  if (trialStatus === "cancelled") {
    return "archived";
  }

  return "draft";
};

export const customerStatusFromPaymentStatus = (paymentStatus: PaymentStatus): CustomerStatus => {
  if (paymentStatus === "paid") {
    return "active";
  }

  if (paymentStatus === "past_due") {
    return "suspended";
  }

  if (paymentStatus === "cancelled") {
    return "archived";
  }

  return "payment_waiting";
};

export const siteStatusFromCustomerStatus = (status: CustomerStatus): SiteStatus => {
  if (status === "active") {
    return "active";
  }

  if (status === "trial_active") {
    return "trial_live";
  }

  if (status === "suspended") {
    return "suspended";
  }

  if (status === "archived") {
    return "archived";
  }

  return "draft";
};

export const supportStatusToneOrder: Record<SupportStatus, number> = {
  open: 5,
  in_progress: 4,
  waiting_on_customer: 3,
  resolved: 2,
  closed: 1
};

export const coreAiAssistantRecordSchema = aiAssistantSchema.extend({
  id: z.string(),
  customer_id: z.string(),
  customerId: z.string(),
  site_id: z.string(),
  siteId: z.string()
});
