import {
  createAdminFilterKey,
  type CustomerStatus,
  type PaymentStatus,
  type SiteStatus,
  type TrialStatus
} from "@ustaca/domain";
import {
  DEFAULT_TRIAL_DAYS,
  addDaysIso,
  buildNotificationDocument,
  canTransitionTrial,
  createCustomerSlug,
  createTrialHostname,
  type NotificationEventName
} from "@ustaca/lib";

import type { UstacaRepositoryBundle } from "./repositories";
import type {
  AuditLogDocument,
  CustomerDocument,
  DomainDocument,
  PaymentDocument,
  SiteDocument,
  TrialDocument
} from "./schema";

const nowIso = () => new Date().toISOString();

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type LifecycleAuditOptions = {
  actorUserId?: string | null;
  actorRole?: AuditLogDocument["actorRole"];
  metadata?: Record<string, unknown>;
};

type StartTrialInput = {
  customerId: string;
  daysGranted?: number;
  planName?: string;
};

type PaymentVerificationInput = {
  paymentId: string;
  source: "api" | "manual";
  verified: boolean;
  orderId?: string | null;
  summary?: string;
  verifiedAt?: string | null;
  rawResponse?: unknown;
};

type DomainRequestInput = {
  customerId: string;
  requestedHostname: string;
  registrar?: string;
  dnsTarget?: string;
};

type DomainAvailabilityInput = {
  domainId: string;
  available: boolean;
  summary?: string;
};

type DomainRegisteredInput = {
  domainId: string;
  registrar?: string;
  expiresAt?: string;
  sslEnabled?: boolean;
};

const appendAudit = async (
  repositories: UstacaRepositoryBundle,
  params: {
    action: string;
    customerId: string | null;
    siteId: string | null;
    targetCollection: string;
    targetId: string;
    summary: string;
    actorUserId?: string | null;
    actorRole?: AuditLogDocument["actorRole"];
    metadata?: Record<string, unknown>;
  }
) => {
  const timestamp = nowIso();
  await repositories.auditLogs.append({
    id: generateId("audit"),
    status: "recorded",
    created_at: timestamp,
    updated_at: timestamp,
    status_changed_at: timestamp,
    is_archived: false,
    archived_at: null,
    is_deleted: false,
    deleted_at: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    customer_id: params.customerId,
    customerId: params.customerId,
    site_id: params.siteId,
    siteId: params.siteId,
    actor_user_id: params.actorUserId ?? null,
    actorUserId: params.actorUserId ?? null,
    actorRole: params.actorRole ?? "system",
    action: params.action,
    action_key: params.action.toLowerCase().replace(/\s+/g, "_"),
    targetCollection: params.targetCollection,
    targetId: params.targetId,
    summary: params.summary,
    metadata: params.metadata ?? {}
  });
};

const setCustomerStatus = (
  customer: CustomerDocument,
  status: CustomerStatus,
  timestamp: string,
  patch: Partial<CustomerDocument> = {}
): CustomerDocument => ({
  ...customer,
  ...patch,
  status,
  customer_status: status,
  status_changed_at: timestamp,
  updated_at: timestamp,
  updatedAt: timestamp
});

const setSiteStatus = (
  site: SiteDocument,
  status: SiteStatus,
  timestamp: string,
  patch: Partial<SiteDocument> = {}
): SiteDocument => ({
  ...site,
  ...patch,
  status,
  site_status: status,
  status_changed_at: timestamp,
  updated_at: timestamp,
  updatedAt: timestamp
});

const setTrialStatus = (
  trial: TrialDocument,
  status: TrialStatus,
  timestamp: string,
  patch: Partial<TrialDocument> = {}
): TrialDocument => ({
  ...trial,
  ...patch,
  status,
  trial_status: status,
  status_changed_at: timestamp,
  updated_at: timestamp,
  updatedAt: timestamp
});

const setPaymentStatus = (
  payment: PaymentDocument,
  status: PaymentStatus,
  timestamp: string,
  patch: Partial<PaymentDocument> = {}
): PaymentDocument => ({
  ...payment,
  ...patch,
  status,
  payment_status: status,
  status_changed_at: timestamp,
  updated_at: timestamp,
  updatedAt: timestamp
});

const enqueueNotification = async (
  repositories: UstacaRepositoryBundle,
  params: {
    eventName: NotificationEventName;
    customer: CustomerDocument;
    siteId?: string | null;
    payload?: Record<string, unknown>;
    now?: string;
  }
) => {
  await repositories.notifications.enqueue(
    buildNotificationDocument({
      id: generateId("notif"),
      eventName: params.eventName,
      channel: "email",
      recipient: params.customer.contact.email,
      subject: params.eventName.replaceAll("_", " "),
      customerId: params.customer.id,
      siteId: params.siteId ?? params.customer.site_id ?? null,
      payload: params.payload,
      now: params.now
    })
  );
};

export type LifecycleService = ReturnType<typeof createLifecycleService>;

export const createLifecycleService = (repositories: UstacaRepositoryBundle) => {
  const requireCustomer = async (customerId: string) => {
    const customer = await repositories.customers.getById(customerId);
    if (!customer) {
      throw new Error(`Musteri bulunamadi: ${customerId}`);
    }
    return customer;
  };

  const requireSite = async (siteId: string | null | undefined) => {
    if (!siteId) {
      throw new Error("Site id gerekli.");
    }
    const site = await repositories.sites.getById(siteId);
    if (!site) {
      throw new Error(`Site bulunamadi: ${siteId}`);
    }
    return site;
  };

  const requirePayment = async (paymentId: string) => {
    const payment = await repositories.payments.getById(paymentId);
    if (!payment) {
      throw new Error(`Odeme bulunamadi: ${paymentId}`);
    }
    return payment;
  };

  const requireDomain = async (domainId: string) => {
    const domain = await repositories.domains.getById(domainId);
    if (!domain) {
      throw new Error(`Domain bulunamadi: ${domainId}`);
    }
    return domain;
  };

  const startTrial = async (input: StartTrialInput, audit: LifecycleAuditOptions = {}) => {
    const customer = await requireCustomer(input.customerId);
    const site = await requireSite(customer.site_id);
    const timestamp = nowIso();
    const days = input.daysGranted ?? DEFAULT_TRIAL_DAYS;
    const endsAt = addDaysIso(timestamp, days);
    const temporaryHostname = createTrialHostname(customer.businessName);
    const trialId = customer.active_trial_id ?? generateId("trial");

    const existing = customer.active_trial_id
      ? await repositories.trials.getById(customer.active_trial_id)
      : null;

    const trial: TrialDocument = {
      id: trialId,
      status: "active",
      created_at: existing?.created_at ?? timestamp,
      updated_at: timestamp,
      status_changed_at: timestamp,
      is_archived: false,
      archived_at: null,
      is_deleted: false,
      deleted_at: null,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
      customer_id: customer.id,
      customerId: customer.id,
      site_id: site.id,
      siteId: site.id,
      trial_status: "active",
      startsAt: timestamp,
      endsAt,
      expiredAt: null,
      convertedAt: null,
      temporaryHostname,
      temporary_hostname_key: createAdminFilterKey(temporaryHostname) ?? temporaryHostname,
      targetDomain: customer.targetDomain,
      target_domain_key: createAdminFilterKey(customer.targetDomain) ?? customer.targetDomain,
      planName: input.planName ?? "Web Sitesi Yillik",
      daysGranted: days
    };

    await repositories.trials.upsert(trial);

    await repositories.customers.upsert(
      setCustomerStatus(customer, "trial_active", timestamp, {
        active_trial_id: trialId,
        activeTrialId: trialId
      })
    );

    await repositories.sites.upsert(
      setSiteStatus(site, "trial_live", timestamp, {
        previewHostname: temporaryHostname,
        preview_hostname: temporaryHostname,
        preview_hostname_key: createAdminFilterKey(temporaryHostname) ?? temporaryHostname
      })
    );

    await enqueueNotification(repositories, {
      eventName: "trial_started",
      customer,
      siteId: site.id,
      payload: { trialId, endsAt, days },
      now: timestamp
    });

    await appendAudit(repositories, {
      action: "trial.started",
      customerId: customer.id,
      siteId: site.id,
      targetCollection: "trials",
      targetId: trialId,
      summary: `Trial ${days} gunluk olarak baslatildi`,
      ...audit
    });

    return { trial, endsAt };
  };

  const expireTrial = async (trialId: string, audit: LifecycleAuditOptions = {}) => {
    const trial = await repositories.trials.getById(trialId);
    if (!trial) {
      throw new Error(`Trial bulunamadi: ${trialId}`);
    }

    if (!canTransitionTrial(trial.trial_status, "expired")) {
      return { trial, changed: false as const };
    }

    const timestamp = nowIso();
    const updatedTrial = setTrialStatus(trial, "expired", timestamp, { expiredAt: timestamp });
    await repositories.trials.upsert(updatedTrial);

    const customer = await requireCustomer(trial.customer_id);
    await repositories.customers.upsert(
      setCustomerStatus(customer, "trial_expired", timestamp)
    );

    const site = await requireSite(trial.site_id);
    await repositories.sites.upsert(
      setSiteStatus(site, "suspended", timestamp, { suspendedAt: timestamp })
    );

    await enqueueNotification(repositories, {
      eventName: "trial_expired",
      customer,
      siteId: site.id,
      payload: { trialId },
      now: timestamp
    });

    await appendAudit(repositories, {
      action: "trial.expired",
      customerId: customer.id,
      siteId: site.id,
      targetCollection: "trials",
      targetId: trialId,
      summary: "Trial doldu, site askiya alindi; veri korunuyor.",
      ...audit
    });

    return { trial: updatedTrial, changed: true as const };
  };

  const convertTrialToActive = async (
    trialId: string,
    audit: LifecycleAuditOptions = {}
  ) => {
    const trial = await repositories.trials.getById(trialId);
    if (!trial) {
      throw new Error(`Trial bulunamadi: ${trialId}`);
    }

    if (!canTransitionTrial(trial.trial_status, "converted")) {
      return { trial, changed: false as const };
    }

    const timestamp = nowIso();
    const updatedTrial = setTrialStatus(trial, "converted", timestamp, {
      convertedAt: timestamp
    });
    await repositories.trials.upsert(updatedTrial);

    const customer = await requireCustomer(trial.customer_id);
    await repositories.customers.upsert(setCustomerStatus(customer, "active", timestamp));

    const site = await requireSite(trial.site_id);
    await repositories.sites.upsert(
      setSiteStatus(site, "active", timestamp, {
        publishedAt: site.publishedAt ?? timestamp,
        suspendedAt: null
      })
    );

    await appendAudit(repositories, {
      action: "trial.converted",
      customerId: customer.id,
      siteId: site.id,
      targetCollection: "trials",
      targetId: trialId,
      summary: "Trial odeme ile aktiflestirildi.",
      ...audit
    });

    return { trial: updatedTrial, changed: true as const };
  };

  const suspendCustomer = async (
    customerId: string,
    reason: string,
    audit: LifecycleAuditOptions = {}
  ) => {
    const customer = await requireCustomer(customerId);
    const timestamp = nowIso();

    await repositories.customers.upsert(setCustomerStatus(customer, "suspended", timestamp));

    if (customer.site_id) {
      const site = await requireSite(customer.site_id);
      await repositories.sites.upsert(
        setSiteStatus(site, "suspended", timestamp, { suspendedAt: timestamp })
      );
    }

    await enqueueNotification(repositories, {
      eventName: "site_suspended",
      customer,
      payload: { reason },
      now: timestamp
    });

    await appendAudit(repositories, {
      action: "site.suspended",
      customerId: customer.id,
      siteId: customer.site_id,
      targetCollection: "customers",
      targetId: customer.id,
      summary: `Yayin askiya alindi: ${reason}`,
      metadata: { reason, ...(audit.metadata ?? {}) },
      actorUserId: audit.actorUserId,
      actorRole: audit.actorRole
    });

    return { customer };
  };

  const reactivateCustomer = async (
    customerId: string,
    audit: LifecycleAuditOptions = {}
  ) => {
    const customer = await requireCustomer(customerId);
    const timestamp = nowIso();

    await repositories.customers.upsert(setCustomerStatus(customer, "active", timestamp));

    if (customer.site_id) {
      const site = await requireSite(customer.site_id);
      await repositories.sites.upsert(
        setSiteStatus(site, "active", timestamp, {
          suspendedAt: null,
          publishedAt: site.publishedAt ?? timestamp
        })
      );
    }

    await appendAudit(repositories, {
      action: "site.reactivated",
      customerId: customer.id,
      siteId: customer.site_id,
      targetCollection: "customers",
      targetId: customer.id,
      summary: "Yayin yeniden aktiflestirildi.",
      ...audit
    });

    return { customer };
  };

  const recordPaymentVerification = async (
    input: PaymentVerificationInput,
    audit: LifecycleAuditOptions = {}
  ) => {
    const payment = await requirePayment(input.paymentId);
    const timestamp = nowIso();
    const verifiedAt = input.verified ? input.verifiedAt ?? timestamp : null;
    const verificationState = input.verified
      ? "verified"
      : input.source === "manual"
        ? "manual_review"
        : "failed";
    const workflowStatus = input.verified
      ? "payment_confirmed"
      : input.source === "manual"
        ? "payment_under_review"
        : payment.payment_status;

    const nextStatus: PaymentStatus = input.verified ? "paid" : payment.payment_status;
    const extraFields = {
      payment_workflow_status: workflowStatus,
      payment_verification_status: verificationState,
      payment_verification_source: input.source,
      payment_order_id: input.orderId ?? null,
      payment_verification_summary:
        input.summary ?? (input.verified ? "Dogrulama basarili" : "Manuel inceleme gerekli"),
      payment_verified_at: verifiedAt,
      payment_last_checked_at: timestamp,
      payment_verification_raw: input.rawResponse ?? null
    } as unknown as Partial<PaymentDocument>;

    const updated = setPaymentStatus(payment, nextStatus, timestamp, {
      paidAt: input.verified ? verifiedAt : payment.paidAt,
      paidAmount: input.verified ? payment.totalAmount : payment.paidAmount,
      installmentsPaid: input.verified ? payment.installmentsTotal : payment.installmentsPaid,
      is_overdue: input.verified ? false : payment.is_overdue,
      ...extraFields
    });

    await repositories.payments.upsert(updated);

    const customer = await requireCustomer(payment.customer_id);

    if (input.verified) {
      await enqueueNotification(repositories, {
        eventName: "payment_received",
        customer,
        siteId: payment.site_id,
        payload: { paymentId: payment.id, orderId: input.orderId ?? null, source: input.source },
        now: timestamp
      });

      if (customer.active_trial_id) {
        await convertTrialToActive(customer.active_trial_id, {
          actorUserId: audit.actorUserId,
          actorRole: audit.actorRole
        });
      } else {
        await repositories.customers.upsert(setCustomerStatus(customer, "active", timestamp));
      }
    }

    await appendAudit(repositories, {
      action: input.verified ? "payment.verified" : "payment.review_pending",
      customerId: customer.id,
      siteId: payment.site_id,
      targetCollection: "payments",
      targetId: payment.id,
      summary: input.summary ?? (input.verified ? "Odeme dogrulandi" : "Odeme manuel incelemede"),
      metadata: {
        source: input.source,
        orderId: input.orderId ?? null,
        verificationState,
        ...(audit.metadata ?? {})
      },
      actorUserId: audit.actorUserId,
      actorRole: audit.actorRole
    });

    return { payment: updated, verificationState, workflowStatus };
  };

  const markPaymentPastDue = async (paymentId: string, audit: LifecycleAuditOptions = {}) => {
    const payment = await requirePayment(paymentId);
    const timestamp = nowIso();

    const updated = setPaymentStatus(payment, "past_due", timestamp, {
      is_overdue: true,
      suspendedAt: timestamp
    });
    await repositories.payments.upsert(updated);

    const customer = await requireCustomer(payment.customer_id);
    await enqueueNotification(repositories, {
      eventName: "payment_past_due",
      customer,
      siteId: payment.site_id,
      payload: { paymentId: payment.id, dueAt: payment.dueAt },
      now: timestamp
    });

    await appendAudit(repositories, {
      action: "payment.past_due",
      customerId: customer.id,
      siteId: payment.site_id,
      targetCollection: "payments",
      targetId: payment.id,
      summary: `Odeme gecikmeye dustu (vade: ${payment.dueAt}).`,
      ...audit
    });

    return { payment: updated };
  };

  const submitDomainRequest = async (
    input: DomainRequestInput,
    audit: LifecycleAuditOptions = {}
  ) => {
    const customer = await requireCustomer(input.customerId);
    if (!customer.site_id) {
      throw new Error("Site hazir degil, domain talebi olusturulamaz.");
    }

    const normalized = createCustomerSlug(input.requestedHostname);
    const hostname = input.requestedHostname.trim().toLowerCase();
    const timestamp = nowIso();

    const existingDomains = await repositories.domains.listByCustomer(customer.id);
    const existing = existingDomains.find(
      (domain) => domain.normalized_hostname === normalized || domain.hostname_key === normalized
    );

    const domainId = existing?.id ?? generateId("domain");
    const trialHostname = createTrialHostname(customer.businessName);

    const domain: DomainDocument = {
      id: domainId,
      status: "requested",
      created_at: existing?.created_at ?? timestamp,
      updated_at: timestamp,
      status_changed_at: timestamp,
      is_archived: false,
      archived_at: null,
      is_deleted: false,
      deleted_at: null,
      createdAt: existing?.createdAt ?? timestamp,
      updatedAt: timestamp,
      customer_id: customer.id,
      customerId: customer.id,
      site_id: customer.site_id,
      siteId: customer.site_id,
      domain_status: "requested",
      requested_hostname: hostname,
      requestedHostname: hostname,
      normalized_hostname: normalized,
      normalizedHostname: normalized,
      trial_hostname: trialHostname,
      trialHostname,
      live_hostname: existing?.live_hostname ?? null,
      liveHostname: existing?.liveHostname ?? null,
      hostname_key: normalized,
      dnsTarget: input.dnsTarget ?? existing?.dnsTarget ?? "dns.ustaca.app",
      registrar: input.registrar ?? existing?.registrar ?? "ustaca_managed",
      registrar_key:
        createAdminFilterKey(input.registrar ?? existing?.registrar ?? "ustaca_managed") ??
        "ustaca_managed",
      managedByUstaca: true,
      sslEnabled: existing?.sslEnabled ?? false,
      verifiedAt: existing?.verifiedAt ?? null,
      expiresAt: existing?.expiresAt ?? null,
      lastCheckAt: null
    };

    await repositories.domains.upsert(domain);

    await repositories.customers.upsert({
      ...customer,
      targetDomain: hostname,
      target_domain_key: normalized,
      primary_domain_id: domainId,
      primaryDomainId: domainId,
      updated_at: timestamp,
      updatedAt: timestamp
    });

    await appendAudit(repositories, {
      action: "domain.requested",
      customerId: customer.id,
      siteId: customer.site_id,
      targetCollection: "domains",
      targetId: domainId,
      summary: `Hedef domain talebi: ${hostname}`,
      ...audit
    });

    return { domain };
  };

  const recordDomainAvailability = async (
    input: DomainAvailabilityInput,
    audit: LifecycleAuditOptions = {}
  ) => {
    const domain = await requireDomain(input.domainId);
    const timestamp = nowIso();
    const nextStatus = input.available ? "pending_verification" : "dns_issue";

    const updated: DomainDocument = {
      ...domain,
      status: nextStatus,
      domain_status: nextStatus,
      status_changed_at: timestamp,
      updated_at: timestamp,
      updatedAt: timestamp,
      lastCheckAt: timestamp
    };

    await repositories.domains.upsert(updated);

    if (!input.available) {
      const customer = await requireCustomer(domain.customer_id);
      await enqueueNotification(repositories, {
        eventName: "domain_issue_detected",
        customer,
        siteId: domain.site_id,
        payload: { domainId: domain.id, hostname: domain.requestedHostname },
        now: timestamp
      });
    }

    await appendAudit(repositories, {
      action: input.available ? "domain.available" : "domain.unavailable",
      customerId: domain.customer_id,
      siteId: domain.site_id,
      targetCollection: "domains",
      targetId: domain.id,
      summary: input.summary ?? (input.available ? "Domain uygun" : "Domain uygun degil"),
      ...audit
    });

    return { domain: updated };
  };

  const confirmDomainRegistered = async (
    input: DomainRegisteredInput,
    audit: LifecycleAuditOptions = {}
  ) => {
    const domain = await requireDomain(input.domainId);
    const timestamp = nowIso();

    const updated: DomainDocument = {
      ...domain,
      status: "connected",
      domain_status: "connected",
      status_changed_at: timestamp,
      updated_at: timestamp,
      updatedAt: timestamp,
      live_hostname: domain.requestedHostname,
      liveHostname: domain.requestedHostname,
      registrar: input.registrar ?? domain.registrar,
      registrar_key:
        createAdminFilterKey(input.registrar ?? domain.registrar) ?? domain.registrar_key,
      sslEnabled: input.sslEnabled ?? true,
      verifiedAt: timestamp,
      expiresAt: input.expiresAt ?? domain.expiresAt,
      lastCheckAt: timestamp
    };

    await repositories.domains.upsert(updated);

    const site = await requireSite(domain.site_id);
    await repositories.sites.upsert({
      ...site,
      custom_domain: domain.requestedHostname,
      customDomain: domain.requestedHostname,
      custom_domain_key: createAdminFilterKey(domain.requestedHostname),
      updated_at: timestamp,
      updatedAt: timestamp
    });

    await appendAudit(repositories, {
      action: "domain.connected",
      customerId: domain.customer_id,
      siteId: domain.site_id,
      targetCollection: "domains",
      targetId: domain.id,
      summary: `Domain baglandi: ${domain.requestedHostname}`,
      ...audit
    });

    return { domain: updated };
  };

  return {
    startTrial,
    expireTrial,
    convertTrialToActive,
    suspendCustomer,
    reactivateCustomer,
    recordPaymentVerification,
    markPaymentPastDue,
    submitDomainRequest,
    recordDomainAvailability,
    confirmDomainRegistered
  };
};
