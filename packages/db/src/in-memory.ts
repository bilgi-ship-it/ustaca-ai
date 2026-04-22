import type {
  AiAssistantDocument,
  AppointmentDocument,
  AuditLogDocument,
  CustomerDocument,
  DomainDocument,
  FirestoreSeedDataset,
  FormSubmissionDocument,
  NotificationDocument,
  PaymentDocument,
  SiteDocument,
  SpecialProjectFlagDocument,
  SupportTicketDocument,
  TrialDocument,
  UserDocument
} from "./schema";
import type { UstacaRepositoryBundle } from "./repositories";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const createMap = <T extends { id: string }>(items: readonly T[]) =>
  new Map(items.map((item) => [item.id, clone(item)]));

const toList = <T>(items: Iterable<T>) => Array.from(items, (item) => clone(item));

const isVisible = (document: { is_deleted: boolean }) => !document.is_deleted;

const activeList = <T extends { is_deleted: boolean }>(items: Iterable<T>) =>
  toList(items).filter(isVisible);

const matchesFilters = <T extends Record<string, unknown>>(document: T, filters: Partial<T>) =>
  Object.entries(filters).every(([key, expected]) =>
    expected === undefined ? true : document[key as keyof T] === expected
  );

const getCreatedAt = (document: { created_at: string; createdAt: string }) =>
  document.created_at ?? document.createdAt;

const getCustomerId = (document: { customer_id?: string | null; customerId?: string | null }) =>
  document.customer_id ?? document.customerId ?? null;

const getStatus = <TStatus extends string>(
  document: { status: TStatus } & Record<string, unknown>,
  legacyKey: keyof typeof document
) => (document.status ?? document[legacyKey]) as TStatus;

export const createInMemoryRepositoryBundle = (seed: FirestoreSeedDataset): UstacaRepositoryBundle => {
  const users = createMap<UserDocument>(seed.users);
  const customers = createMap<CustomerDocument>(seed.customers);
  const sites = createMap<SiteDocument>(seed.sites);
  const trials = createMap<TrialDocument>(seed.trials);
  const payments = createMap<PaymentDocument>(seed.payments);
  const domains = createMap<DomainDocument>(seed.domains);
  const formSubmissions = createMap<FormSubmissionDocument>(seed.formSubmissions);
  const appointmentRequests = createMap<AppointmentDocument>(seed.appointmentRequests);
  const supportTickets = createMap<SupportTicketDocument>(seed.supportTickets);
  const aiAssistants = createMap<AiAssistantDocument>(seed.aiAssistants);
  const notifications = createMap<NotificationDocument>(seed.notifications);
  const specialProjectFlags = createMap<SpecialProjectFlagDocument>(seed.specialProjectFlags);
  const auditLogs = createMap<AuditLogDocument>(seed.auditLogs);

  return {
    users: {
      async getById(userId) {
        const document = users.get(userId);
        return document && isVisible(document) ? clone(document) : null;
      },
      async getByEmail(email) {
        const normalized = email.toLowerCase();
        return (
          activeList(users.values()).find((document) => document.email.toLowerCase() === normalized) ?? null
        );
      },
      async upsert(document) {
        users.set(document.id, clone(document));
      }
    },
    customers: {
      async getById(customerId) {
        const document = customers.get(customerId);
        return document && isVisible(document) ? clone(document) : null;
      },
      async getByOwnerUserId(userId) {
        return (
          activeList(customers.values()).find(
            (document) => document.owner_user_id === userId || document.ownerUserId === userId
          ) ?? null
        );
      },
      async listByStatus(status) {
        return activeList(customers.values()).filter(
          (document) => getStatus(document, "customer_status") === status
        );
      },
      async listByAdminFilters(filters) {
        return activeList(customers.values()).filter((document) => matchesFilters(document, filters));
      },
      async listAll() {
        return activeList(customers.values());
      },
      async upsert(document) {
        customers.set(document.id, clone(document));
      }
    },
    sites: {
      async getById(siteId) {
        const document = sites.get(siteId);
        return document && isVisible(document) ? clone(document) : null;
      },
      async getByCustomerId(customerId) {
        return activeList(sites.values()).find((document) => getCustomerId(document) === customerId) ?? null;
      },
      async listByStatus(status) {
        return activeList(sites.values()).filter((document) => getStatus(document, "site_status") === status);
      },
      async listByAdminFilters(filters) {
        return activeList(sites.values()).filter((document) => matchesFilters(document, filters));
      },
      async upsert(document) {
        sites.set(document.id, clone(document));
      }
    },
    trials: {
      async getById(trialId) {
        const document = trials.get(trialId);
        return document && isVisible(document) ? clone(document) : null;
      },
      async getActiveByCustomerId(customerId) {
        return (
          activeList(trials.values()).find(
            (document) => getCustomerId(document) === customerId && getStatus(document, "trial_status") === "active"
          ) ?? null
        );
      },
      async listExpiringBefore(isoDate) {
        const threshold = new Date(isoDate).getTime();
        return activeList(trials.values()).filter(
          (document) =>
            getStatus(document, "trial_status") === "active" &&
            new Date(document.endsAt).getTime() <= threshold
        );
      },
      async upsert(document) {
        trials.set(document.id, clone(document));
      }
    },
    payments: {
      async getById(paymentId) {
        const document = payments.get(paymentId);
        return document && isVisible(document) ? clone(document) : null;
      },
      async listByCustomer(customerId) {
        return activeList(payments.values()).filter((document) => getCustomerId(document) === customerId);
      },
      async getLatestByCustomer(customerId) {
        const customerPayments = activeList(payments.values())
          .filter((document) => getCustomerId(document) === customerId)
          .sort((left, right) => new Date(getCreatedAt(right)).getTime() - new Date(getCreatedAt(left)).getTime());

        return customerPayments[0] ?? null;
      },
      async listByStatus(status) {
        return activeList(payments.values()).filter(
          (document) => getStatus(document, "payment_status") === status
        );
      },
      async listByAdminFilters(filters) {
        return activeList(payments.values()).filter((document) => matchesFilters(document, filters));
      },
      async upsert(document) {
        payments.set(document.id, clone(document));
      }
    },
    domains: {
      async getById(domainId) {
        const document = domains.get(domainId);
        return document && isVisible(document) ? clone(document) : null;
      },
      async listByCustomer(customerId) {
        return activeList(domains.values()).filter((document) => getCustomerId(document) === customerId);
      },
      async getPrimaryByCustomer(customerId) {
        return (
          activeList(domains.values()).find(
            (document) =>
              getCustomerId(document) === customerId &&
              (getStatus(document, "domain_status") === "connected" ||
                getStatus(document, "domain_status") === "pending_verification")
          ) ?? null
        );
      },
      async listByStatus(status) {
        return activeList(domains.values()).filter((document) => getStatus(document, "domain_status") === status);
      },
      async listByAdminFilters(filters) {
        return activeList(domains.values()).filter((document) => matchesFilters(document, filters));
      },
      async upsert(document) {
        domains.set(document.id, clone(document));
      }
    },
    formSubmissions: {
      async listByCustomer(customerId) {
        return activeList(formSubmissions.values()).filter((document) => getCustomerId(document) === customerId);
      },
      async create(document) {
        formSubmissions.set(document.id, clone(document));
      },
      async upsert(document) {
        formSubmissions.set(document.id, clone(document));
      }
    },
    appointmentRequests: {
      async listByCustomer(customerId) {
        return activeList(appointmentRequests.values()).filter((document) => getCustomerId(document) === customerId);
      },
      async create(document) {
        appointmentRequests.set(document.id, clone(document));
      },
      async upsert(document) {
        appointmentRequests.set(document.id, clone(document));
      }
    },
    supportTickets: {
      async getById(ticketId) {
        const document = supportTickets.get(ticketId);
        return document && isVisible(document) ? clone(document) : null;
      },
      async listByCustomer(customerId) {
        return activeList(supportTickets.values()).filter((document) => getCustomerId(document) === customerId);
      },
      async listOpen() {
        return activeList(supportTickets.values()).filter(
          (document) => getStatus(document, "support_status") !== "resolved" && getStatus(document, "support_status") !== "closed"
        );
      },
      async listByAdminFilters(filters) {
        return activeList(supportTickets.values()).filter((document) => matchesFilters(document, filters));
      },
      async upsert(document) {
        supportTickets.set(document.id, clone(document));
      }
    },
    aiAssistants: {
      async listByCustomer(customerId) {
        return activeList(aiAssistants.values()).filter((document) => getCustomerId(document) === customerId);
      },
      async upsert(document) {
        aiAssistants.set(document.id, clone(document));
      }
    },
    notifications: {
      async listPending() {
        return activeList(notifications.values()).filter(
          (document) => getStatus(document, "notification_status") === "queued"
        );
      },
      async listByCustomer(customerId) {
        return activeList(notifications.values()).filter((document) => getCustomerId(document) === customerId);
      },
      async enqueue(document) {
        notifications.set(document.id, clone(document));
      },
      async upsert(document) {
        notifications.set(document.id, clone(document));
      }
    },
    specialProjectFlags: {
      async getByCustomerId(customerId) {
        return (
          activeList(specialProjectFlags.values()).find((document) => getCustomerId(document) === customerId) ??
          null
        );
      },
      async listOpen() {
        return activeList(specialProjectFlags.values()).filter(
          (document) => getStatus(document, "special_project_status") !== "closed"
        );
      },
      async upsert(document) {
        specialProjectFlags.set(document.id, clone(document));
      }
    },
    auditLogs: {
      async append(document) {
        auditLogs.set(document.id, clone(document));
      },
      async listByCustomer(customerId) {
        return activeList(auditLogs.values()).filter((document) => getCustomerId(document) === customerId);
      }
    }
  };
};
