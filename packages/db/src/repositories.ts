import type {
  AiAssistantDocument,
  AppointmentDocument,
  AuditLogDocument,
  CustomerDocument,
  DomainDocument,
  FormSubmissionDocument,
  NotificationDocument,
  PaymentDocument,
  SiteDocument,
  SpecialProjectFlagDocument,
  SupportTicketDocument,
  TrialDocument,
  UserDocument
} from "./schema";

export type CustomerAdminFilters = Partial<
  Pick<
    CustomerDocument,
    "status" | "business_name_key" | "owner_email_key" | "city_key" | "sector_key" | "target_domain_key" | "is_archived"
  >
>;

export type SiteAdminFilters = Partial<
  Pick<SiteDocument, "status" | "customer_id" | "slug_key" | "preview_hostname_key" | "custom_domain_key" | "theme_family_key">
>;

export type PaymentAdminFilters = Partial<
  Pick<PaymentDocument, "status" | "customer_id" | "site_id" | "invoice_code_key" | "due_on_day" | "is_overdue">
>;

export type DomainAdminFilters = Partial<
  Pick<DomainDocument, "status" | "customer_id" | "site_id" | "hostname_key" | "registrar_key">
>;

export type SupportAdminFilters = Partial<
  Pick<SupportTicketDocument, "status" | "customer_id" | "site_id" | "priority" | "category_key">
>;

export type UserRepository = {
  getById(userId: string): Promise<UserDocument | null>;
  getByEmail(email: string): Promise<UserDocument | null>;
  upsert(document: UserDocument): Promise<void>;
};

export type CustomerRepository = {
  getById(customerId: string): Promise<CustomerDocument | null>;
  getByOwnerUserId(userId: string): Promise<CustomerDocument | null>;
  listByStatus(status: CustomerDocument["customer_status"]): Promise<CustomerDocument[]>;
  listByAdminFilters(filters: CustomerAdminFilters): Promise<CustomerDocument[]>;
  listAll(): Promise<CustomerDocument[]>;
  upsert(document: CustomerDocument): Promise<void>;
};

export type SiteRepository = {
  getById(siteId: string): Promise<SiteDocument | null>;
  getByCustomerId(customerId: string): Promise<SiteDocument | null>;
  listByStatus(status: SiteDocument["site_status"]): Promise<SiteDocument[]>;
  listByAdminFilters(filters: SiteAdminFilters): Promise<SiteDocument[]>;
  upsert(document: SiteDocument): Promise<void>;
};

export type TrialRepository = {
  getById(trialId: string): Promise<TrialDocument | null>;
  getActiveByCustomerId(customerId: string): Promise<TrialDocument | null>;
  listExpiringBefore(isoDate: string): Promise<TrialDocument[]>;
  upsert(document: TrialDocument): Promise<void>;
};

export type PaymentRepository = {
  getById(paymentId: string): Promise<PaymentDocument | null>;
  listByCustomer(customerId: string): Promise<PaymentDocument[]>;
  getLatestByCustomer(customerId: string): Promise<PaymentDocument | null>;
  listByStatus(status: PaymentDocument["payment_status"]): Promise<PaymentDocument[]>;
  listByAdminFilters(filters: PaymentAdminFilters): Promise<PaymentDocument[]>;
  upsert(document: PaymentDocument): Promise<void>;
};

export type DomainRepository = {
  getById(domainId: string): Promise<DomainDocument | null>;
  listByCustomer(customerId: string): Promise<DomainDocument[]>;
  getPrimaryByCustomer(customerId: string): Promise<DomainDocument | null>;
  listByStatus(status: DomainDocument["domain_status"]): Promise<DomainDocument[]>;
  listByAdminFilters(filters: DomainAdminFilters): Promise<DomainDocument[]>;
  upsert(document: DomainDocument): Promise<void>;
};

export type FormSubmissionRepository = {
  listByCustomer(customerId: string): Promise<FormSubmissionDocument[]>;
  create(document: FormSubmissionDocument): Promise<void>;
  upsert(document: FormSubmissionDocument): Promise<void>;
};

export type AppointmentRepository = {
  listByCustomer(customerId: string): Promise<AppointmentDocument[]>;
  create(document: AppointmentDocument): Promise<void>;
  upsert(document: AppointmentDocument): Promise<void>;
};

export type SupportTicketRepository = {
  getById(ticketId: string): Promise<SupportTicketDocument | null>;
  listByCustomer(customerId: string): Promise<SupportTicketDocument[]>;
  listOpen(): Promise<SupportTicketDocument[]>;
  listByAdminFilters(filters: SupportAdminFilters): Promise<SupportTicketDocument[]>;
  upsert(document: SupportTicketDocument): Promise<void>;
};

export type AiAssistantRepository = {
  listByCustomer(customerId: string): Promise<AiAssistantDocument[]>;
  upsert(document: AiAssistantDocument): Promise<void>;
};

export type NotificationRepository = {
  listPending(): Promise<NotificationDocument[]>;
  listByCustomer(customerId: string): Promise<NotificationDocument[]>;
  enqueue(document: NotificationDocument): Promise<void>;
  upsert(document: NotificationDocument): Promise<void>;
};

export type SpecialProjectFlagRepository = {
  getByCustomerId(customerId: string): Promise<SpecialProjectFlagDocument | null>;
  listOpen(): Promise<SpecialProjectFlagDocument[]>;
  upsert(document: SpecialProjectFlagDocument): Promise<void>;
};

export type AuditLogRepository = {
  append(document: AuditLogDocument): Promise<void>;
  listByCustomer(customerId: string): Promise<AuditLogDocument[]>;
};

export type UstacaRepositoryBundle = {
  users: UserRepository;
  customers: CustomerRepository;
  sites: SiteRepository;
  trials: TrialRepository;
  payments: PaymentRepository;
  domains: DomainRepository;
  formSubmissions: FormSubmissionRepository;
  appointmentRequests: AppointmentRepository;
  supportTickets: SupportTicketRepository;
  aiAssistants: AiAssistantRepository;
  notifications: NotificationRepository;
  specialProjectFlags: SpecialProjectFlagRepository;
  auditLogs: AuditLogRepository;
};
