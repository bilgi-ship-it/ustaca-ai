import { z } from "zod";

export const userRoleSchema = z.enum(["super_admin", "ops_admin", "customer"]);
export const customerStateSchema = z.enum([
  "draft",
  "trial_active",
  "trial_expired",
  "payment_waiting",
  "active",
  "suspended",
  "special_project",
  "archived"
]);
export const domainStateSchema = z.enum(["connected", "pending_verification", "dns_issue"]);
export const paymentStateSchema = z.enum(["paid", "trialing", "past_due"]);
export const paymentWorkflowStatusSchema = z.enum([
  "pending",
  "trialing",
  "paid",
  "past_due",
  "cancelled",
  "payment_confirmed",
  "payment_under_review"
]);
export const paymentVerificationStateSchema = z.enum([
  "unverified",
  "pending_api_check",
  "verified",
  "manual_review",
  "failed"
]);
export const paymentVerificationSourceSchema = z.enum(["api", "manual"]);
export const ticketPrioritySchema = z.enum(["low", "medium", "high"]);
export const ticketStateSchema = z.enum([
  "open",
  "in_progress",
  "waiting_on_customer",
  "resolved",
  "closed"
]);
export const requestStateSchema = z.enum(["new", "contacted", "quoted", "scheduled"]);
export const siteActivationStateSchema = z.enum(["trial_live", "active", "suspended"]);
export const productModuleCodeSchema = z.enum([
  "website",
  "map_visibility",
  "review_collection",
  "menu_pricing",
  "appointment_requests",
  "quote_forms",
  "multilingual",
  "visibility_report",
  "site_ai_assistant",
  "whatsapp_ai_assistant"
]);
export const assistantChannelSchema = z.enum(["site", "whatsapp"]);

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: userRoleSchema
});

export const trialSnapshotSchema = z.object({
  startsAt: z.string(),
  endsAt: z.string(),
  daysRemaining: z.number().int(),
  planName: z.string(),
  status: customerStateSchema
});

export const paymentRecordSchema = z.object({
  id: z.string(),
  planName: z.string(),
  amount: z.number(),
  currency: z.string(),
  billingModel: z.enum(["setup", "annual"]),
  installments: z.number().int().min(1).max(12),
  dueAt: z.string(),
  paidAt: z.string().nullable(),
  status: paymentStateSchema,
  invoiceCode: z.string(),
  rawStatus: paymentWorkflowStatusSchema.optional(),
  verificationStatus: paymentVerificationStateSchema.optional(),
  verificationSource: paymentVerificationSourceSchema.nullable().optional(),
  orderId: z.string().nullable().optional(),
  verificationSummary: z.string().optional(),
  verifiedAt: z.string().nullable().optional(),
  lastCheckedAt: z.string().nullable().optional()
});

export const domainRecordSchema = z.object({
  id: z.string(),
  hostname: z.string(),
  registrar: z.string(),
  dnsTarget: z.string(),
  managedByUstaca: z.boolean(),
  sslEnabled: z.boolean(),
  status: domainStateSchema,
  expiresAt: z.string()
});

export const supportTicketSchema = z.object({
  id: z.string(),
  subject: z.string(),
  category: z.string(),
  priority: ticketPrioritySchema,
  status: ticketStateSchema,
  channel: z.enum(["chat", "email", "whatsapp"]),
  createdAt: z.string(),
  updatedAt: z.string(),
  summary: z.string(),
  customerNote: z.string(),
  opsNote: z.string()
});

export const serviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  summary: z.string(),
  priceFrom: z.number(),
  durationMinutes: z.number().int(),
  featured: z.boolean()
});

export const pricingPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  cadence: z.enum(["single", "monthly"]),
  tagline: z.string(),
  features: z.array(z.string())
});

export const galleryAssetSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.string(),
  imageUrl: z.string().url(),
  publishedAt: z.string(),
  highlight: z.boolean()
});

export const formRequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  service: z.string(),
  phone: z.string(),
  source: z.string(),
  submittedAt: z.string(),
  status: requestStateSchema,
  message: z.string(),
  notes: z.string()
});

export const appointmentRequestSchema = z.object({
  id: z.string(),
  name: z.string(),
  requestedService: z.string(),
  requestedAt: z.string(),
  phone: z.string(),
  status: requestStateSchema,
  notes: z.string()
});

export const productModuleSchema = z.object({
  code: productModuleCodeSchema,
  label: z.string(),
  tier: z.enum(["core", "addon"]),
  enabled: z.boolean()
});

export const aiAssistantSchema = z.object({
  channel: assistantChannelSchema,
  enabled: z.boolean(),
  greeting: z.string(),
  primaryGoal: z.string(),
  escalationRoute: z.string()
});

export const businessProfileSchema = z.object({
  id: z.string(),
  name: z.string(),
  sector: z.string(),
  city: z.string(),
  phone: z.string(),
  email: z.string().email(),
  address: z.string(),
  targetDomain: z.string(),
  onboardingState: z.enum(["setup", "ready", "live"])
});

export const siteSettingsSchema = z.object({
  brandName: z.string(),
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  primaryCta: z.string(),
  secondaryCta: z.string(),
  themeAccent: z.string()
});

export const siteProfileSchema = z.object({
  id: z.string(),
  subdomain: z.string(),
  customDomain: z.string().nullable(),
  publicUrl: z.string(),
  template: z.string(),
  activationState: siteActivationStateSchema,
  siteStatus: z.enum(["draft", "published"]),
  lastPublishedAt: z.string(),
  settings: siteSettingsSchema
});

export const customerWorkspaceSchema = z.object({
  systemStatus: customerStateSchema,
  user: authUserSchema,
  business: businessProfileSchema,
  site: siteProfileSchema,
  trial: trialSnapshotSchema,
  payments: z.array(paymentRecordSchema),
  domains: z.array(domainRecordSchema),
  supportTickets: z.array(supportTicketSchema),
  services: z.array(serviceSchema),
  pricingPlans: z.array(pricingPlanSchema),
  productModules: z.array(productModuleSchema),
  aiAssistants: z.array(aiAssistantSchema),
  gallery: z.array(galleryAssetSchema),
  formRequests: z.array(formRequestSchema),
  appointmentRequests: z.array(appointmentRequestSchema)
});

export const adminCustomerSchema = z.object({
  id: z.string(),
  businessName: z.string(),
  ownerName: z.string(),
  sector: z.string(),
  city: z.string(),
  planName: z.string(),
  mrr: z.number(),
  status: customerStateSchema,
  domainStatus: domainStateSchema,
  trialEndsAt: z.string(),
  openTickets: z.number().int()
});

export const adminPaymentLedgerItemSchema = z.object({
  id: z.string(),
  businessName: z.string(),
  planName: z.string(),
  amount: z.number(),
  status: paymentStateSchema,
  dueAt: z.string(),
  rawStatus: paymentWorkflowStatusSchema.optional(),
  verificationStatus: paymentVerificationStateSchema.optional(),
  verificationSource: paymentVerificationSourceSchema.nullable().optional(),
  orderId: z.string().nullable().optional(),
  verificationSummary: z.string().optional(),
  verifiedAt: z.string().nullable().optional(),
  lastCheckedAt: z.string().nullable().optional()
});

export const adminDomainOverviewItemSchema = z.object({
  id: z.string(),
  businessName: z.string(),
  hostname: z.string(),
  status: domainStateSchema,
  sslEnabled: z.boolean(),
  expiresAt: z.string()
});

export const platformSupportTicketSchema = z.object({
  id: z.string(),
  businessName: z.string(),
  subject: z.string(),
  priority: ticketPrioritySchema,
  status: ticketStateSchema,
  updatedAt: z.string()
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type CustomerState = z.infer<typeof customerStateSchema>;
export type DomainState = z.infer<typeof domainStateSchema>;
export type PaymentState = z.infer<typeof paymentStateSchema>;
export type PaymentWorkflowStatus = z.infer<typeof paymentWorkflowStatusSchema>;
export type PaymentVerificationState = z.infer<typeof paymentVerificationStateSchema>;
export type PaymentVerificationSource = z.infer<typeof paymentVerificationSourceSchema>;
export type TicketState = z.infer<typeof ticketStateSchema>;
export type RequestState = z.infer<typeof requestStateSchema>;
export type SiteActivationState = z.infer<typeof siteActivationStateSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type TrialSnapshot = z.infer<typeof trialSnapshotSchema>;
export type PaymentRecord = z.infer<typeof paymentRecordSchema>;
export type DomainRecord = z.infer<typeof domainRecordSchema>;
export type SupportTicket = z.infer<typeof supportTicketSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type PricingPlan = z.infer<typeof pricingPlanSchema>;
export type ProductModuleCode = z.infer<typeof productModuleCodeSchema>;
export type ProductModule = z.infer<typeof productModuleSchema>;
export type AiAssistant = z.infer<typeof aiAssistantSchema>;
export type GalleryAsset = z.infer<typeof galleryAssetSchema>;
export type FormRequest = z.infer<typeof formRequestSchema>;
export type AppointmentRequest = z.infer<typeof appointmentRequestSchema>;
export type BusinessProfile = z.infer<typeof businessProfileSchema>;
export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type SiteProfile = z.infer<typeof siteProfileSchema>;
export type CustomerWorkspace = z.infer<typeof customerWorkspaceSchema>;
export type AdminCustomer = z.infer<typeof adminCustomerSchema>;
export type AdminPaymentLedgerItem = z.infer<typeof adminPaymentLedgerItemSchema>;
export type AdminDomainOverviewItem = z.infer<typeof adminDomainOverviewItemSchema>;
export type PlatformSupportTicket = z.infer<typeof platformSupportTicketSchema>;
