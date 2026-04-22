import { z } from "zod";

import {
  aiAssistantEntitySchema,
  appointmentRequestEntitySchema,
  auditLogEntitySchema,
  customerDataBundleSchema,
  customerEntitySchema,
  domainEntitySchema,
  formSubmissionEntitySchema,
  notificationEntitySchema,
  paymentEntitySchema,
  siteEntitySchema,
  specialProjectFlagEntitySchema,
  supportTicketEntitySchema,
  trialEntitySchema,
  userEntitySchema
} from "@ustaca/domain";

export const collectionNames = {
  users: "users",
  customers: "customers",
  sites: "sites",
  trials: "trials",
  payments: "payments",
  domains: "domains",
  formSubmissions: "form_submissions",
  appointmentRequests: "appointment_requests",
  supportTickets: "support_tickets",
  aiAssistants: "ai_assistants",
  notifications: "notifications",
  specialProjectFlags: "special_project_flags",
  auditLogs: "audit_logs"
} as const;

export type FirestoreCollectionName = (typeof collectionNames)[keyof typeof collectionNames];

export const firestoreCollectionList = Object.values(collectionNames);

export const firestoreSchemas = {
  users: userEntitySchema,
  customers: customerEntitySchema,
  sites: siteEntitySchema,
  trials: trialEntitySchema,
  payments: paymentEntitySchema,
  domains: domainEntitySchema,
  formSubmissions: formSubmissionEntitySchema,
  appointmentRequests: appointmentRequestEntitySchema,
  supportTickets: supportTicketEntitySchema,
  aiAssistants: aiAssistantEntitySchema,
  notifications: notificationEntitySchema,
  specialProjectFlags: specialProjectFlagEntitySchema,
  auditLogs: auditLogEntitySchema
} as const;

export const firestoreSeedDatasetSchema = z.object({
  users: z.array(userEntitySchema),
  customers: z.array(customerEntitySchema),
  sites: z.array(siteEntitySchema),
  trials: z.array(trialEntitySchema),
  payments: z.array(paymentEntitySchema),
  domains: z.array(domainEntitySchema),
  formSubmissions: z.array(formSubmissionEntitySchema),
  appointmentRequests: z.array(appointmentRequestEntitySchema),
  supportTickets: z.array(supportTicketEntitySchema),
  aiAssistants: z.array(aiAssistantEntitySchema),
  notifications: z.array(notificationEntitySchema),
  specialProjectFlags: z.array(specialProjectFlagEntitySchema),
  auditLogs: z.array(auditLogEntitySchema)
});

export const customerRecordBundleSchema = customerDataBundleSchema;

export type UserDocument = z.infer<typeof userEntitySchema>;
export type CustomerDocument = z.infer<typeof customerEntitySchema>;
export type SiteDocument = z.infer<typeof siteEntitySchema>;
export type TrialDocument = z.infer<typeof trialEntitySchema>;
export type PaymentDocument = z.infer<typeof paymentEntitySchema>;
export type DomainDocument = z.infer<typeof domainEntitySchema>;
export type FormSubmissionDocument = z.infer<typeof formSubmissionEntitySchema>;
export type AppointmentDocument = z.infer<typeof appointmentRequestEntitySchema>;
export type SupportTicketDocument = z.infer<typeof supportTicketEntitySchema>;
export type AiAssistantDocument = z.infer<typeof aiAssistantEntitySchema>;
export type NotificationDocument = z.infer<typeof notificationEntitySchema>;
export type SpecialProjectFlagDocument = z.infer<typeof specialProjectFlagEntitySchema>;
export type AuditLogDocument = z.infer<typeof auditLogEntitySchema>;
export type FirestoreSeedDataset = z.infer<typeof firestoreSeedDatasetSchema>;
export type CustomerRecordBundle = z.infer<typeof customerRecordBundleSchema>;

export const collectionPath = (collectionName: FirestoreCollectionName) => collectionName;
export const documentPath = (collectionName: FirestoreCollectionName, id: string) =>
  `${collectionPath(collectionName)}/${id}`;

export const relationshipKeys = {
  customerToUser: "owner_user_id",
  customerToSite: "site_id",
  customerToTrial: "active_trial_id",
  customerToPayment: "active_payment_id",
  customerToDomain: "primary_domain_id",
  customerToSpecialProjectFlag: "special_project_flag_id"
} as const;

export const adminFilterKeys = {
  customers: ["status", "business_name_key", "owner_email_key", "city_key", "sector_key", "target_domain_key"],
  sites: ["status", "slug_key", "preview_hostname_key", "custom_domain_key", "theme_family_key"],
  payments: ["status", "customer_id", "site_id", "invoice_code_key", "due_on_day", "is_overdue"],
  domains: ["status", "customer_id", "site_id", "hostname_key", "registrar_key"],
  supportTickets: ["status", "customer_id", "site_id", "priority", "category_key"]
} as const;
