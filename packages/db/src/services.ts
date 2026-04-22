import type {
  AdminCustomer,
  AdminDomainOverviewItem,
  AdminPaymentLedgerItem,
  CustomerWorkspace,
  DomainState,
  DomainStatus,
  FormRequest,
  PaymentState,
  PaymentStatus,
  PaymentVerificationSource,
  PaymentVerificationState,
  PlatformSupportTicket,
  RequestState,
  SiteActivationState
} from "@ustaca/domain";
import { customerStatusFromPaymentStatus, customerStatusFromTrialStatus } from "@ustaca/domain";

import type { UstacaRepositoryBundle } from "./repositories";
import type {
  CustomerDocument,
  CustomerRecordBundle,
  DomainDocument,
  FormSubmissionDocument,
  PaymentDocument,
  SiteDocument,
  SupportTicketDocument
} from "./schema";

const MILLISECONDS_IN_DAY = 1000 * 60 * 60 * 24;

const calculateDaysRemaining = (endsAt: string) =>
  Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / MILLISECONDS_IN_DAY));

const getCreatedAt = (document: { created_at: string; createdAt: string }) =>
  document.created_at ?? document.createdAt;

const getUpdatedAt = (document: { updated_at: string; updatedAt: string }) =>
  document.updated_at ?? document.updatedAt;

const getEntityStatus = <TStatus extends string>(
  document: { status: TStatus } & Record<string, unknown>,
  legacyKey: keyof typeof document
) => (document.status ?? document[legacyKey]) as TStatus;

const toLegacyPaymentStatus = (status: PaymentStatus): PaymentState => {
  if (status === "paid") {
    return "paid";
  }

  if (status === "past_due") {
    return "past_due";
  }

  return "trialing";
};

type PaymentVerificationFields = Partial<{
  payment_workflow_status: AdminPaymentLedgerItem["rawStatus"];
  payment_verification_status: PaymentVerificationState;
  payment_verification_source: PaymentVerificationSource | null;
  payment_order_id: string | null;
  payment_verification_summary: string;
  payment_verified_at: string | null;
  payment_last_checked_at: string | null;
}>;

const getPaymentVerificationFields = (payment: PaymentDocument): PaymentVerificationFields =>
  payment as PaymentDocument & PaymentVerificationFields;

const toLegacyDomainStatus = (status: DomainStatus): DomainState => {
  if (status === "connected") {
    return "connected";
  }

  if (status === "dns_issue") {
    return "dns_issue";
  }

  return "pending_verification";
};

const toSiteActivationState = (status: SiteDocument["site_status"]): SiteActivationState => {
  if (status === "active") {
    return "active";
  }

  if (status === "suspended") {
    return "suspended";
  }

  return "trial_live";
};

const sortPaymentsDescending = (payments: PaymentDocument[]) =>
  [...payments].sort((left, right) => new Date(getCreatedAt(right)).getTime() - new Date(getCreatedAt(left)).getTime());

const sortDomainsDescending = (domains: DomainDocument[]) =>
  [...domains].sort((left, right) => new Date(getUpdatedAt(right)).getTime() - new Date(getUpdatedAt(left)).getTime());

const sortSupportDescending = (tickets: SupportTicketDocument[]) =>
  [...tickets].sort((left, right) => new Date(getUpdatedAt(right)).getTime() - new Date(getUpdatedAt(left)).getTime());

const mapFormStatus = (status: FormSubmissionDocument["request_status"]): RequestState => status;

const mapFormRequest = (submission: FormSubmissionDocument): FormRequest => ({
  id: submission.id,
  name: submission.name,
  service: submission.service,
  phone: submission.phone,
  source: submission.source,
  submittedAt: submission.submittedAt,
  status: mapFormStatus(submission.request_status),
  message: submission.message,
  notes: submission.notes
});

export const buildCustomerWorkspaceProjection = (bundle: CustomerRecordBundle): CustomerWorkspace => ({
  systemStatus: getEntityStatus(bundle.customer, "customer_status"),
  user: {
    id: bundle.user.id,
    email: bundle.user.email,
    name: bundle.user.name,
    role: bundle.user.role
  },
  business: {
    id: bundle.customer.id,
    name: bundle.customer.businessName,
    sector: bundle.customer.subSector ?? bundle.customer.sector,
    city: bundle.customer.contact.city,
    phone: bundle.customer.contact.phone,
    email: bundle.customer.contact.email,
    address: bundle.customer.contact.address,
    targetDomain: bundle.customer.targetDomain,
    onboardingState:
      getEntityStatus(bundle.customer, "customer_status") === "draft"
        ? "setup"
        : getEntityStatus(bundle.customer, "customer_status") === "active"
          ? "live"
          : "ready"
  },
  site: {
    id: bundle.site.id,
    subdomain: bundle.site.previewHostname,
    customDomain: bundle.site.customDomain,
    publicUrl: bundle.site.customDomain ?? bundle.site.previewHostname,
    template: bundle.site.themeVariant
      ? `${bundle.site.themeFamily} / ${bundle.site.themeVariant}`
      : bundle.site.themeFamily,
    activationState: toSiteActivationState(getEntityStatus(bundle.site, "site_status")),
    siteStatus: getEntityStatus(bundle.site, "site_status") === "draft" ? "draft" : "published",
    lastPublishedAt: bundle.site.publishedAt ?? getUpdatedAt(bundle.site),
    settings: {
      brandName: bundle.customer.businessName,
      heroTitle: bundle.site.content.heroTitle,
      heroSubtitle: bundle.site.content.heroSubtitle,
      primaryCta: bundle.site.content.primaryCta,
      secondaryCta: bundle.site.content.secondaryCta,
      themeAccent: bundle.site.content.themeAccent
    }
  },
  trial: bundle.trial
    ? {
        startsAt: bundle.trial.startsAt,
        endsAt: bundle.trial.endsAt,
        daysRemaining: calculateDaysRemaining(bundle.trial.endsAt),
        planName: bundle.trial.planName,
        status: customerStatusFromTrialStatus(getEntityStatus(bundle.trial, "trial_status"))
      }
    : {
        startsAt: bundle.customer.created_at,
        endsAt: bundle.customer.updated_at,
        daysRemaining: 0,
        planName: "Web Sitesi Yillik",
        status: getEntityStatus(bundle.customer, "customer_status")
      },
  payments: sortPaymentsDescending(bundle.payments).map((payment) => ({
    id: payment.id,
    planName: payment.items.map((item) => item.label).join(" + "),
    amount: payment.totalAmount,
    currency: payment.currency,
    billingModel: payment.billingCycle,
    installments: payment.installmentsTotal,
    dueAt: payment.dueAt,
    paidAt: payment.paidAt,
    status: toLegacyPaymentStatus(getEntityStatus(payment, "payment_status")),
    invoiceCode: payment.invoiceCode
  })),
  domains: sortDomainsDescending(bundle.domains).map((domain) => ({
    id: domain.id,
    hostname: domain.liveHostname ?? domain.requestedHostname,
    registrar: domain.registrar,
    dnsTarget: domain.dnsTarget,
    managedByUstaca: domain.managedByUstaca,
    sslEnabled: domain.sslEnabled,
    status: toLegacyDomainStatus(getEntityStatus(domain, "domain_status")),
    expiresAt: domain.expiresAt ?? getUpdatedAt(domain)
  })),
  supportTickets: sortSupportDescending(bundle.supportTickets).map((ticket) => ({
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.category,
    priority: ticket.priority,
    status: getEntityStatus(ticket, "support_status"),
    channel: ticket.channel,
    createdAt: ticket.created_at,
    updatedAt: ticket.updated_at,
    summary: ticket.customerMessage,
    customerNote: ticket.customerMessage,
    opsNote: ticket.opsNote
  })),
  services: bundle.site.services,
  pricingPlans: bundle.site.pricingPlans,
  productModules: bundle.site.enabledModules,
  aiAssistants: bundle.aiAssistants.map((assistant) => ({
    channel: assistant.channel,
    enabled: assistant.enabled,
    greeting: assistant.greeting,
    primaryGoal: assistant.primaryGoal,
    escalationRoute: assistant.escalationRoute
  })),
  gallery: bundle.site.gallery,
  formRequests: bundle.formSubmissions.map(mapFormRequest),
  appointmentRequests: bundle.appointmentRequests.map((request) => ({
    id: request.id,
    name: request.name,
    requestedService: request.requestedService,
    requestedAt: request.requestedAt,
    phone: request.phone,
    status: request.request_status,
    notes: request.notes
  }))
});

export const buildAdminCustomerProjection = (bundle: CustomerRecordBundle): AdminCustomer => {
  const primaryPayment = sortPaymentsDescending(bundle.payments)[0];
  const primaryDomain = sortDomainsDescending(bundle.domains)[0];
  const openTickets = bundle.supportTickets.filter(
    (ticket) => getEntityStatus(ticket, "support_status") !== "resolved" && getEntityStatus(ticket, "support_status") !== "closed"
  ).length;

  return {
    id: bundle.customer.id,
    businessName: bundle.customer.businessName,
    ownerName: bundle.user.name,
    sector: bundle.customer.sector,
    city: bundle.customer.contact.city,
    planName: primaryPayment?.items.map((item) => item.label).join(" + ") ?? "Web Sitesi",
    mrr: Math.round((primaryPayment?.totalAmount ?? 0) / 12),
    status:
      bundle.trial && getEntityStatus(bundle.trial, "trial_status") === "active"
        ? customerStatusFromTrialStatus(getEntityStatus(bundle.trial, "trial_status"))
        : primaryPayment
          ? customerStatusFromPaymentStatus(getEntityStatus(primaryPayment, "payment_status"))
          : getEntityStatus(bundle.customer, "customer_status"),
    domainStatus: primaryDomain ? toLegacyDomainStatus(getEntityStatus(primaryDomain, "domain_status")) : "pending_verification",
    trialEndsAt: bundle.trial?.endsAt ?? bundle.customer.updated_at,
    openTickets
  };
};

export const buildAdminPaymentProjection = (
  payment: PaymentDocument,
  customer: CustomerDocument
): AdminPaymentLedgerItem => {
  const verification = getPaymentVerificationFields(payment);

  return {
    id: payment.id,
    businessName: customer.businessName,
    planName: payment.items.map((item) => item.label).join(" + "),
    amount: payment.totalAmount,
    status: toLegacyPaymentStatus(getEntityStatus(payment, "payment_status")),
    dueAt: payment.dueAt,
    rawStatus: verification.payment_workflow_status ?? payment.payment_status,
    verificationStatus: verification.payment_verification_status,
    verificationSource: verification.payment_verification_source ?? null,
    orderId: verification.payment_order_id ?? null,
    verificationSummary: verification.payment_verification_summary,
    verifiedAt: verification.payment_verified_at ?? null,
    lastCheckedAt: verification.payment_last_checked_at ?? null
  };
};

export const buildAdminDomainProjection = (
  domain: DomainDocument,
  customer: CustomerDocument
): AdminDomainOverviewItem => ({
  id: domain.id,
  businessName: customer.businessName,
  hostname: domain.liveHostname ?? domain.requestedHostname,
  status: toLegacyDomainStatus(getEntityStatus(domain, "domain_status")),
  sslEnabled: domain.sslEnabled,
  expiresAt: domain.expiresAt ?? getUpdatedAt(domain)
});

export const buildPlatformSupportProjection = (
  ticket: SupportTicketDocument,
  customer: CustomerDocument
): PlatformSupportTicket => ({
  id: ticket.id,
  businessName: customer.businessName,
  subject: ticket.subject,
  priority: ticket.priority,
  status: getEntityStatus(ticket, "support_status"),
  updatedAt: ticket.updated_at
});

export const createDataAccessService = (repositories: UstacaRepositoryBundle) => ({
  async getCustomerRecordBundle(customerId: string): Promise<CustomerRecordBundle | null> {
    const customer = await repositories.customers.getById(customerId);

    if (!customer) {
      return null;
    }

    const [user, site, payments, domains, formSubmissions, appointmentRequests, supportTickets, aiAssistants] =
      await Promise.all([
        repositories.users.getById(customer.owner_user_id),
        customer.site_id ? repositories.sites.getById(customer.site_id) : Promise.resolve(null),
        repositories.payments.listByCustomer(customerId),
        repositories.domains.listByCustomer(customerId),
        repositories.formSubmissions.listByCustomer(customerId),
        repositories.appointmentRequests.listByCustomer(customerId),
        repositories.supportTickets.listByCustomer(customerId),
        repositories.aiAssistants.listByCustomer(customerId)
      ]);

    if (!user || !site) {
      return null;
    }

    const [trial, notifications, specialProjectFlag] = await Promise.all([
      customer.active_trial_id ? repositories.trials.getById(customer.active_trial_id) : Promise.resolve(null),
      repositories.notifications.listByCustomer(customerId),
      repositories.specialProjectFlags.getByCustomerId(customerId)
    ]);

    return {
      user,
      customer,
      site,
      trial,
      payments,
      domains,
      formSubmissions,
      appointmentRequests,
      supportTickets,
      aiAssistants,
      notifications,
      specialProjectFlag
    };
  },

  async getCustomerWorkspace(customerId: string) {
    const bundle = await this.getCustomerRecordBundle(customerId);

    return bundle ? buildCustomerWorkspaceProjection(bundle) : null;
  },

  async listAdminCustomers() {
    const customers = await repositories.customers.listAll();
    const rows = await Promise.all(
      customers.map(async (customer) => {
        const bundle = await this.getCustomerRecordBundle(customer.id);
        return bundle ? buildAdminCustomerProjection(bundle) : null;
      })
    );

    return rows.filter((row): row is AdminCustomer => Boolean(row));
  },

  async listAdminPaymentLedger() {
    const customers = await repositories.customers.listAll();
    const ledgerRows = await Promise.all(
      customers.map(async (customer) => {
        const payments = await repositories.payments.listByCustomer(customer.id);
        return payments.map((payment) => buildAdminPaymentProjection(payment, customer));
      })
    );

    return ledgerRows.flat();
  },

  async listAdminDomainOverview() {
    const customers = await repositories.customers.listAll();
    const rows = await Promise.all(
      customers.map(async (customer) => {
        const domains = await repositories.domains.listByCustomer(customer.id);
        return domains.map((domain) => buildAdminDomainProjection(domain, customer));
      })
    );

    return rows.flat();
  },

  async listPlatformSupportTickets() {
    const customers = await repositories.customers.listAll();
    const rows = await Promise.all(
      customers.map(async (customer) => {
        const tickets = await repositories.supportTickets.listByCustomer(customer.id);
        return tickets.map((ticket) => buildPlatformSupportProjection(ticket, customer));
      })
    );

    return rows.flat();
  }
});
