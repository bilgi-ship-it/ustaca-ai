import type { UstacaRepositoryBundle } from "./repositories";
import { collectionNames } from "./schema";
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

// ─── lazy Firestore singleton ─────────────────────────────────────────────────

let _db: import("firebase-admin/firestore").Firestore | null = null;

const getDb = async (): Promise<import("firebase-admin/firestore").Firestore> => {
  if (_db) return _db;
  const { initializeApp, getApps } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");
  if (!getApps().length) {
    initializeApp();
  }
  _db = getFirestore();
  return _db;
};

// ─── shared helpers ───────────────────────────────────────────────────────────

const isActive = (d: Record<string, unknown>): boolean => d["is_deleted"] !== true;

const getDoc = async <T>(collection: string, id: string): Promise<T | null> => {
  const db = await getDb();
  const snap = await db.collection(collection).doc(id).get();
  if (!snap.exists) return null;
  const data = snap.data() as Record<string, unknown>;
  return isActive(data) ? (data as T) : null;
};

const listActive = async <T>(collection: string): Promise<T[]> => {
  const db = await getDb();
  const snap = await db.collection(collection).where("is_deleted", "==", false).get();
  return snap.docs.map((d) => d.data() as T);
};

const upsertDoc = async (collection: string, id: string, data: object): Promise<void> => {
  const db = await getDb();
  await db.collection(collection).doc(id).set(data);
};

const matchFilters = (doc: Record<string, unknown>, filters: Record<string, unknown>): boolean =>
  Object.entries(filters).every(([k, v]) => (v === undefined ? true : doc[k] === v));

const getStatus = (doc: Record<string, unknown>, legacyKey: string): string =>
  ((doc["status"] ?? doc[legacyKey] ?? "") as string);

const getCustomerId = (doc: Record<string, unknown>): string | null =>
  ((doc["customer_id"] ?? doc["customerId"] ?? null) as string | null);

const getCreatedAt = (doc: Record<string, unknown>): string =>
  ((doc["created_at"] ?? doc["createdAt"] ?? "") as string);

// ─── factory ──────────────────────────────────────────────────────────────────

export const createFirestoreRepositoryBundle = (): UstacaRepositoryBundle => {
  const col = collectionNames;

  return {
    users: {
      async getById(userId) {
        return getDoc<UserDocument>(col.users, userId);
      },
      async getByEmail(email) {
        const db = await getDb();
        const normalized = email.toLowerCase();
        const snap = await db
          .collection(col.users)
          .where("is_deleted", "==", false)
          .where("email", "==", email)
          .limit(1)
          .get();
        if (!snap.empty) return snap.docs[0]!.data() as UserDocument;
        const snap2 = await db
          .collection(col.users)
          .where("is_deleted", "==", false)
          .where("email_key", "==", normalized)
          .limit(1)
          .get();
        return snap2.empty ? null : (snap2.docs[0]!.data() as UserDocument);
      },
      async upsert(document) {
        await upsertDoc(col.users, document.id, document);
      }
    },

    customers: {
      async getById(customerId) {
        return getDoc<CustomerDocument>(col.customers, customerId);
      },
      async getByOwnerUserId(userId) {
        const db = await getDb();
        const snap = await db
          .collection(col.customers)
          .where("is_deleted", "==", false)
          .where("owner_user_id", "==", userId)
          .limit(1)
          .get();
        if (!snap.empty) return snap.docs[0]!.data() as CustomerDocument;
        const snap2 = await db
          .collection(col.customers)
          .where("is_deleted", "==", false)
          .where("ownerUserId", "==", userId)
          .limit(1)
          .get();
        return snap2.empty ? null : (snap2.docs[0]!.data() as CustomerDocument);
      },
      async listByStatus(status) {
        const all = await listActive<CustomerDocument>(col.customers);
        return all.filter((d) => getStatus(d as Record<string, unknown>, "customer_status") === status);
      },
      async listByAdminFilters(filters) {
        const all = await listActive<CustomerDocument>(col.customers);
        return all.filter((d) => matchFilters(d as Record<string, unknown>, filters as Record<string, unknown>));
      },
      async listAll() {
        return listActive<CustomerDocument>(col.customers);
      },
      async upsert(document) {
        await upsertDoc(col.customers, document.id, document);
      }
    },

    sites: {
      async getById(siteId) {
        return getDoc<SiteDocument>(col.sites, siteId);
      },
      async getByCustomerId(customerId) {
        const db = await getDb();
        const snap = await db
          .collection(col.sites)
          .where("is_deleted", "==", false)
          .where("customer_id", "==", customerId)
          .limit(1)
          .get();
        if (!snap.empty) return snap.docs[0]!.data() as SiteDocument;
        const snap2 = await db
          .collection(col.sites)
          .where("is_deleted", "==", false)
          .where("customerId", "==", customerId)
          .limit(1)
          .get();
        return snap2.empty ? null : (snap2.docs[0]!.data() as SiteDocument);
      },
      async listByStatus(status) {
        const all = await listActive<SiteDocument>(col.sites);
        return all.filter((d) => getStatus(d as Record<string, unknown>, "site_status") === status);
      },
      async listByAdminFilters(filters) {
        const all = await listActive<SiteDocument>(col.sites);
        return all.filter((d) => matchFilters(d as Record<string, unknown>, filters as Record<string, unknown>));
      },
      async upsert(document) {
        await upsertDoc(col.sites, document.id, document);
      }
    },

    trials: {
      async getById(trialId) {
        return getDoc<TrialDocument>(col.trials, trialId);
      },
      async getActiveByCustomerId(customerId) {
        const all = await listActive<TrialDocument>(col.trials);
        return (
          all.find(
            (d) =>
              getCustomerId(d as Record<string, unknown>) === customerId &&
              getStatus(d as Record<string, unknown>, "trial_status") === "active"
          ) ?? null
        );
      },
      async listExpiringBefore(isoDate) {
        const threshold = new Date(isoDate).getTime();
        const all = await listActive<TrialDocument>(col.trials);
        return all.filter(
          (d) =>
            getStatus(d as Record<string, unknown>, "trial_status") === "active" &&
            new Date(d.endsAt).getTime() <= threshold
        );
      },
      async upsert(document) {
        await upsertDoc(col.trials, document.id, document);
      }
    },

    payments: {
      async getById(paymentId) {
        return getDoc<PaymentDocument>(col.payments, paymentId);
      },
      async listByCustomer(customerId) {
        const all = await listActive<PaymentDocument>(col.payments);
        return all.filter((d) => getCustomerId(d as Record<string, unknown>) === customerId);
      },
      async getLatestByCustomer(customerId) {
        const all = await listActive<PaymentDocument>(col.payments);
        const filtered = all
          .filter((d) => getCustomerId(d as Record<string, unknown>) === customerId)
          .sort(
            (a, b) =>
              new Date(getCreatedAt(b as Record<string, unknown>)).getTime() -
              new Date(getCreatedAt(a as Record<string, unknown>)).getTime()
          );
        return filtered[0] ?? null;
      },
      async listByStatus(status) {
        const all = await listActive<PaymentDocument>(col.payments);
        return all.filter((d) => getStatus(d as Record<string, unknown>, "payment_status") === status);
      },
      async listByAdminFilters(filters) {
        const all = await listActive<PaymentDocument>(col.payments);
        return all.filter((d) => matchFilters(d as Record<string, unknown>, filters as Record<string, unknown>));
      },
      async upsert(document) {
        await upsertDoc(col.payments, document.id, document);
      }
    },

    domains: {
      async getById(domainId) {
        return getDoc<DomainDocument>(col.domains, domainId);
      },
      async listByCustomer(customerId) {
        const all = await listActive<DomainDocument>(col.domains);
        return all.filter((d) => getCustomerId(d as Record<string, unknown>) === customerId);
      },
      async getPrimaryByCustomer(customerId) {
        const all = await listActive<DomainDocument>(col.domains);
        return (
          all.find(
            (d) =>
              getCustomerId(d as Record<string, unknown>) === customerId &&
              (getStatus(d as Record<string, unknown>, "domain_status") === "connected" ||
                getStatus(d as Record<string, unknown>, "domain_status") === "pending_verification")
          ) ?? null
        );
      },
      async listByStatus(status) {
        const all = await listActive<DomainDocument>(col.domains);
        return all.filter((d) => getStatus(d as Record<string, unknown>, "domain_status") === status);
      },
      async listByAdminFilters(filters) {
        const all = await listActive<DomainDocument>(col.domains);
        return all.filter((d) => matchFilters(d as Record<string, unknown>, filters as Record<string, unknown>));
      },
      async upsert(document) {
        await upsertDoc(col.domains, document.id, document);
      }
    },

    formSubmissions: {
      async listByCustomer(customerId) {
        const all = await listActive<FormSubmissionDocument>(col.formSubmissions);
        return all.filter((d) => getCustomerId(d as Record<string, unknown>) === customerId);
      },
      async create(document) {
        await upsertDoc(col.formSubmissions, document.id, document);
      },
      async upsert(document) {
        await upsertDoc(col.formSubmissions, document.id, document);
      }
    },

    appointmentRequests: {
      async listByCustomer(customerId) {
        const all = await listActive<AppointmentDocument>(col.appointmentRequests);
        return all.filter((d) => getCustomerId(d as Record<string, unknown>) === customerId);
      },
      async create(document) {
        await upsertDoc(col.appointmentRequests, document.id, document);
      },
      async upsert(document) {
        await upsertDoc(col.appointmentRequests, document.id, document);
      }
    },

    supportTickets: {
      async getById(ticketId) {
        return getDoc<SupportTicketDocument>(col.supportTickets, ticketId);
      },
      async listByCustomer(customerId) {
        const all = await listActive<SupportTicketDocument>(col.supportTickets);
        return all.filter((d) => getCustomerId(d as Record<string, unknown>) === customerId);
      },
      async listOpen() {
        const all = await listActive<SupportTicketDocument>(col.supportTickets);
        return all.filter(
          (d) =>
            getStatus(d as Record<string, unknown>, "support_status") !== "resolved" &&
            getStatus(d as Record<string, unknown>, "support_status") !== "closed"
        );
      },
      async listByAdminFilters(filters) {
        const all = await listActive<SupportTicketDocument>(col.supportTickets);
        return all.filter((d) => matchFilters(d as Record<string, unknown>, filters as Record<string, unknown>));
      },
      async upsert(document) {
        await upsertDoc(col.supportTickets, document.id, document);
      }
    },

    aiAssistants: {
      async listByCustomer(customerId) {
        const all = await listActive<AiAssistantDocument>(col.aiAssistants);
        return all.filter((d) => getCustomerId(d as Record<string, unknown>) === customerId);
      },
      async upsert(document) {
        await upsertDoc(col.aiAssistants, document.id, document);
      }
    },

    notifications: {
      async listPending() {
        const all = await listActive<NotificationDocument>(col.notifications);
        return all.filter((d) => getStatus(d as Record<string, unknown>, "notification_status") === "queued");
      },
      async listByCustomer(customerId) {
        const all = await listActive<NotificationDocument>(col.notifications);
        return all.filter((d) => getCustomerId(d as Record<string, unknown>) === customerId);
      },
      async enqueue(document) {
        await upsertDoc(col.notifications, document.id, document);
      },
      async upsert(document) {
        await upsertDoc(col.notifications, document.id, document);
      }
    },

    specialProjectFlags: {
      async getByCustomerId(customerId) {
        const all = await listActive<SpecialProjectFlagDocument>(col.specialProjectFlags);
        return all.find((d) => getCustomerId(d as Record<string, unknown>) === customerId) ?? null;
      },
      async listOpen() {
        const all = await listActive<SpecialProjectFlagDocument>(col.specialProjectFlags);
        return all.filter(
          (d) => getStatus(d as Record<string, unknown>, "special_project_status") !== "closed"
        );
      },
      async upsert(document) {
        await upsertDoc(col.specialProjectFlags, document.id, document);
      }
    },

    auditLogs: {
      async append(document) {
        await upsertDoc(col.auditLogs, document.id, document);
      },
      async listByCustomer(customerId) {
        const all = await listActive<AuditLogDocument>(col.auditLogs);
        return all.filter((d) => getCustomerId(d as Record<string, unknown>) === customerId);
      }
    }
  };
};
