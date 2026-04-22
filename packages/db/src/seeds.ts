import {
  type AiAssistantEntity,
  type AppointmentRequestEntity,
  type AuditLogEntity,
  defaultSocialLinks,
  defaultWorkingHours,
  type FormSubmissionEntity,
  opsAdminUser,
  singleTenantWorkspace,
  superAdminUser,
  type CustomerDataBundle,
  type CustomerEntity,
  type CustomerStatus,
  type DomainEntity,
  type DomainStatus,
  type NotificationEntity,
  type PaymentEntity,
  type PaymentStatus,
  type SiteEntity,
  type SpecialProjectFlagEntity,
  type SupportTicketEntity,
  type TrialEntity,
  type TrialStatus,
  type UserEntity,
  type UserStatus,
  createAdminFilterKey,
  createEntityTimestamps,
  siteStatusFromCustomerStatus
} from "@ustaca/domain";

import type { FirestoreSeedDataset } from "./schema";

const now = "2026-04-22T12:00:00.000Z";

const userTimestamps = createEntityTimestamps(now);

const createUser = (
  id: string,
  email: string,
  name: string,
  role: UserEntity["role"],
  customerId: string | null,
  user_status: UserStatus,
  lastLoginAt: string | null
): UserEntity => ({
  id,
  status: user_status,
  customer_id: customerId,
  email,
  email_key: createAdminFilterKey(email) ?? email.toLowerCase(),
  name,
  role,
  customerId,
  user_status,
  last_login_at: lastLoginAt,
  lastLoginAt,
  ...userTimestamps
});

const createCustomer = (
  input: {
    id: string;
    ownerUserId: string;
    siteId: string;
    businessName: string;
    shortDescription: string;
    sector: string;
    subSector: string | null;
    phone: string;
    email: string;
    address: string;
    city: string;
    whatsapp: string | null;
    targetDomain: string;
    customer_status: CustomerStatus;
    activeTrialId: string | null;
    activePaymentId: string | null;
    primaryDomainId: string | null;
    specialProjectFlagId: string | null;
  }
): CustomerEntity => ({
  id: input.id,
  status: input.customer_status,
  owner_user_id: input.ownerUserId,
  ownerUserId: input.ownerUserId,
  site_id: input.siteId,
  siteId: input.siteId,
  active_trial_id: input.activeTrialId,
  active_payment_id: input.activePaymentId,
  primary_domain_id: input.primaryDomainId,
  special_project_flag_id: input.specialProjectFlagId,
  businessName: input.businessName,
  legalName: null,
  shortDescription: input.shortDescription,
  sector: input.sector,
  subSector: input.subSector,
  contact: {
    phone: input.phone,
    email: input.email,
    address: input.address,
    city: input.city,
    whatsapp: input.whatsapp,
    workingHours: defaultWorkingHours,
    socialLinks: defaultSocialLinks
  },
  targetDomain: input.targetDomain,
  customer_status: input.customer_status,
  activeTrialId: input.activeTrialId,
  activePaymentId: input.activePaymentId,
  primaryDomainId: input.primaryDomainId,
  specialProjectFlagId: input.specialProjectFlagId,
  business_name_key: createAdminFilterKey(input.businessName) ?? input.businessName.toLowerCase(),
  owner_email_key: createAdminFilterKey(input.email) ?? input.email.toLowerCase(),
  city_key: createAdminFilterKey(input.city) ?? input.city.toLowerCase(),
  sector_key: createAdminFilterKey(input.sector) ?? input.sector.toLowerCase(),
  sub_sector_key: createAdminFilterKey(input.subSector),
  target_domain_key: createAdminFilterKey(input.targetDomain) ?? input.targetDomain.toLowerCase(),
  ...createEntityTimestamps(now)
});

const createSite = (input: {
  id: string;
  customerId: string;
  slug: string;
  previewHostname: string;
  customDomain: string | null;
  themeFamily: string;
  themeVariant: string | null;
  customerStatus: CustomerStatus;
  publishedAt: string | null;
  suspendedAt: string | null;
  content: SiteEntity["content"];
  services: SiteEntity["services"];
  pricingPlans: SiteEntity["pricingPlans"];
  gallery: SiteEntity["gallery"];
  enabledModules: SiteEntity["enabledModules"];
}): SiteEntity => ({
  id: input.id,
  status: siteStatusFromCustomerStatus(input.customerStatus),
  customer_id: input.customerId,
  customerId: input.customerId,
  slug: input.slug,
  slug_key: createAdminFilterKey(input.slug) ?? input.slug.toLowerCase(),
  preview_hostname: input.previewHostname,
  previewHostname: input.previewHostname,
  preview_hostname_key:
    createAdminFilterKey(input.previewHostname) ?? input.previewHostname.toLowerCase(),
  custom_domain: input.customDomain,
  customDomain: input.customDomain,
  custom_domain_key: createAdminFilterKey(input.customDomain),
  themeFamily: input.themeFamily,
  theme_family_key: createAdminFilterKey(input.themeFamily) ?? input.themeFamily.toLowerCase(),
  themeVariant: input.themeVariant,
  site_status: siteStatusFromCustomerStatus(input.customerStatus),
  publishedAt: input.publishedAt,
  suspendedAt: input.suspendedAt,
  content: input.content,
  services: input.services,
  pricingPlans: input.pricingPlans,
  gallery: input.gallery,
  enabledModules: input.enabledModules,
  ...createEntityTimestamps(now)
});

const createTrial = (
  id: string,
  customerId: string,
  siteId: string,
  trial_status: TrialStatus,
  startsAt: string,
  endsAt: string,
  temporaryHostname: string,
  targetDomain: string,
  planName: string
): TrialEntity => ({
  id,
  status: trial_status,
  customer_id: customerId,
  customerId,
  site_id: siteId,
  siteId,
  trial_status,
  startsAt,
  endsAt,
  expiredAt: trial_status === "expired" ? endsAt : null,
  convertedAt: trial_status === "converted" ? now : null,
  temporaryHostname,
  temporary_hostname_key: createAdminFilterKey(temporaryHostname) ?? temporaryHostname.toLowerCase(),
  targetDomain,
  target_domain_key: createAdminFilterKey(targetDomain) ?? targetDomain.toLowerCase(),
  planName,
  daysGranted: 7,
  ...createEntityTimestamps(now)
});

const createPayment = (input: {
  id: string;
  customerId: string;
  siteId: string;
  payment_status: PaymentStatus;
  totalAmount: number;
  paidAmount: number;
  dueAt: string;
  invoiceCode: string;
  installmentsTotal: number;
  installmentsPaid: number;
  items: PaymentEntity["items"];
}): PaymentEntity => ({
  id: input.id,
  status: input.payment_status,
  customer_id: input.customerId,
  customerId: input.customerId,
  site_id: input.siteId,
  siteId: input.siteId,
  payment_status: input.payment_status,
  billingCycle: "annual",
  installmentsTotal: input.installmentsTotal,
  installmentsPaid: input.installmentsPaid,
  currency: "TRY",
  totalAmount: input.totalAmount,
  paidAmount: input.paidAmount,
  dueAt: input.dueAt,
  due_on_day: input.dueAt.slice(0, 10),
  paidAt: input.payment_status === "paid" ? now : null,
  suspendedAt: input.payment_status === "past_due" ? now : null,
  is_overdue: input.payment_status === "past_due",
  invoiceCode: input.invoiceCode,
  invoice_code_key: createAdminFilterKey(input.invoiceCode) ?? input.invoiceCode.toLowerCase(),
  items: input.items,
  ...createEntityTimestamps(now)
});

const createDomain = (input: {
  id: string;
  customerId: string;
  siteId: string;
  domain_status: DomainStatus;
  requestedHostname: string;
  previewHostname: string;
  liveHostname: string | null;
  registrar: string;
  sslEnabled: boolean;
  expiresAt: string | null;
}): DomainEntity => ({
  id: input.id,
  status: input.domain_status,
  customer_id: input.customerId,
  customerId: input.customerId,
  site_id: input.siteId,
  siteId: input.siteId,
  domain_status: input.domain_status,
  requested_hostname: input.requestedHostname,
  requestedHostname: input.requestedHostname,
  normalized_hostname: input.requestedHostname.toLowerCase(),
  normalizedHostname: input.requestedHostname.toLowerCase(),
  trial_hostname: input.previewHostname,
  trialHostname: input.previewHostname,
  live_hostname: input.liveHostname,
  liveHostname: input.liveHostname,
  hostname_key:
    createAdminFilterKey(input.liveHostname ?? input.requestedHostname) ??
    (input.liveHostname ?? input.requestedHostname).toLowerCase(),
  dnsTarget: "cname.ustaca.app",
  registrar: input.registrar,
  registrar_key: createAdminFilterKey(input.registrar) ?? input.registrar.toLowerCase(),
  managedByUstaca: true,
  sslEnabled: input.sslEnabled,
  verifiedAt: input.domain_status === "connected" ? now : null,
  expiresAt: input.expiresAt,
  lastCheckAt: now,
  ...createEntityTimestamps(now)
});

const createSupportTicket = (input: {
  id: string;
  customerId: string;
  siteId: string;
  support_status: SupportTicketEntity["support_status"];
  subject: string;
  category: string;
  priority: SupportTicketEntity["priority"];
  channel: SupportTicketEntity["channel"];
  customerMessage: string;
  opsNote: string;
  updatedAt: string;
}): SupportTicketEntity => ({
  id: input.id,
  status: input.support_status,
  customer_id: input.customerId,
  customerId: input.customerId,
  site_id: input.siteId,
  siteId: input.siteId,
  support_status: input.support_status,
  category_key: createAdminFilterKey(input.category) ?? input.category.toLowerCase(),
  subject_key: createAdminFilterKey(input.subject) ?? input.subject.toLowerCase(),
  subject: input.subject,
  category: input.category,
  priority: input.priority,
  channel: input.channel,
  customerMessage: input.customerMessage,
  opsNote: input.opsNote,
  resolvedAt:
    input.support_status === "resolved" || input.support_status === "closed" ? input.updatedAt : null,
  lastResponseAt: input.updatedAt,
  created_at: input.updatedAt,
  updated_at: input.updatedAt,
  status_changed_at: input.updatedAt,
  is_archived: false,
  archived_at: null,
  is_deleted: false,
  deleted_at: null,
  createdAt: input.updatedAt,
  updatedAt: input.updatedAt
});

const adminUsers: UserEntity[] = [
  createUser(superAdminUser.id, superAdminUser.email, superAdminUser.name, "super_admin", null, "active", now),
  createUser(opsAdminUser.id, opsAdminUser.email, opsAdminUser.name, "ops_admin", null, "active", now),
  createUser(
    singleTenantWorkspace.user.id,
    singleTenantWorkspace.user.email,
    singleTenantWorkspace.user.name,
    "customer",
    "cus_01",
    "active",
    now
  ),
  createUser("usr_owner_02", "arda@novaklima.com", "Arda Koc", "customer", "cus_02", "active", now),
  createUser("usr_owner_03", "ece@ritimnakliyat.com", "Ece Temel", "customer", "cus_03", "suspended", now)
];

const customerSites: SiteEntity[] = [
  createSite({
    id: "site_01",
    customerId: "cus_01",
    slug: "isik-temizlik",
    previewHostname: "isik-temizlik.ustaca.app",
    customDomain: "isiktemizlik.com",
    themeFamily: "Hareketli startup hissi",
    themeVariant: "electric-cyan",
    customerStatus: "trial_active",
    publishedAt: "2026-04-21T19:20:00.000Z",
    suspendedAt: null,
    content: {
      heroTitle: singleTenantWorkspace.site.settings.heroTitle,
      heroSubtitle: singleTenantWorkspace.site.settings.heroSubtitle,
      about:
        "Ayni gun teklif, mobil onceklikli vitrin ve talep toplayan yapisal panel ile temizlik operasyonunu dijitale tasir.",
      primaryCta: singleTenantWorkspace.site.settings.primaryCta,
      secondaryCta: singleTenantWorkspace.site.settings.secondaryCta,
      themeAccent: singleTenantWorkspace.site.settings.themeAccent
    },
    services: singleTenantWorkspace.services,
    pricingPlans: singleTenantWorkspace.pricingPlans,
    gallery: singleTenantWorkspace.gallery,
    enabledModules: singleTenantWorkspace.productModules
  }),
  createSite({
    id: "site_02",
    customerId: "cus_02",
    slug: "nova-klima",
    previewHostname: "nova-klima.ustaca.app",
    customDomain: "novaklima.com",
    themeFamily: "Modern hizmet odakli",
    themeVariant: "premium-service",
    customerStatus: "active",
    publishedAt: "2026-04-10T10:15:00.000Z",
    suspendedAt: null,
    content: {
      heroTitle: "Klima servisinde ayni gun kesif ve teklif",
      heroSubtitle: "Bakim, montaj ve ariza talepleri tek panelden toplanir.",
      about: "Haritada gorunurluk ve teklif formu odakli servis vitrini.",
      primaryCta: "Servis Talebi Birak",
      secondaryCta: "WhatsApp'tan Yaz",
      themeAccent: "neon-gold"
    },
    services: [],
    pricingPlans: [],
    gallery: [],
    enabledModules: [
      { code: "website", label: "Web Sitesi", tier: "core", enabled: true },
      { code: "map_visibility", label: "Haritada Cik", tier: "addon", enabled: true },
      { code: "quote_forms", label: "Fiyat Sor / Teklif Al", tier: "addon", enabled: true }
    ]
  }),
  createSite({
    id: "site_03",
    customerId: "cus_03",
    slug: "ritim-nakliyat",
    previewHostname: "ritim-nakliyat.ustaca.app",
    customDomain: null,
    themeFamily: "Kurumsal sade",
    themeVariant: null,
    customerStatus: "suspended",
    publishedAt: "2026-04-11T13:00:00.000Z",
    suspendedAt: now,
    content: {
      heroTitle: "Sehir ici ve sehirler arasi nakliyat icin hizli teklif",
      heroSubtitle: "Askida olmasina ragmen veri korunur; odeme sonrasi yayin tekrar acilabilir.",
      about: "Operasyon odakli teklif ve randevu toplama vitrini.",
      primaryCta: "Tasima Teklifi Al",
      secondaryCta: "Bizi Ara",
      themeAccent: "purple"
    },
    services: [],
    pricingPlans: [],
    gallery: [],
    enabledModules: [{ code: "website", label: "Web Sitesi", tier: "core", enabled: true }]
  })
];

const customers = [
  createCustomer({
    id: "cus_01",
    ownerUserId: singleTenantWorkspace.user.id,
    siteId: "site_01",
    businessName: singleTenantWorkspace.business.name,
    shortDescription: "Teklif ve randevu toplayan temizlik hizmet vitrini",
    sector: "Temizlik",
    subSector: "Ev ve ofis temizligi",
    phone: singleTenantWorkspace.business.phone,
    email: singleTenantWorkspace.business.email,
    address: singleTenantWorkspace.business.address,
    city: singleTenantWorkspace.business.city,
    whatsapp: "+90 532 123 45 67",
    targetDomain: singleTenantWorkspace.business.targetDomain,
    customer_status: "trial_active",
    activeTrialId: "trial_01",
    activePaymentId: "pay_01",
    primaryDomainId: "dom_01",
    specialProjectFlagId: null
  }),
  createCustomer({
    id: "cus_02",
    ownerUserId: "usr_owner_02",
    siteId: "site_02",
    businessName: "Nova Klima",
    shortDescription: "Haritada gorunur, teklif toplayan klima servisi vitrini",
    sector: "Klima Servisi",
    subSector: "Bakim ve montaj",
    phone: "+90 532 555 44 33",
    email: "hello@novaklima.com",
    address: "Cankaya / Ankara",
    city: "Ankara",
    whatsapp: "+90 532 555 44 33",
    targetDomain: "novaklima.com",
    customer_status: "active",
    activeTrialId: null,
    activePaymentId: "pay_02",
    primaryDomainId: "dom_02",
    specialProjectFlagId: null
  }),
  createCustomer({
    id: "cus_03",
    ownerUserId: "usr_owner_03",
    siteId: "site_03",
    businessName: "Ritim Nakliyat",
    shortDescription: "Odeme gecikmesi nedeniyle askida bekleyen nakliyat vitrini",
    sector: "Nakliyat",
    subSector: null,
    phone: "+90 505 321 11 00",
    email: "operasyon@ritimnakliyat.com",
    address: "Bornova / Izmir",
    city: "Izmir",
    whatsapp: "+90 505 321 11 00",
    targetDomain: "ritimnakliyat.com",
    customer_status: "suspended",
    activeTrialId: null,
    activePaymentId: "pay_03",
    primaryDomainId: "dom_03",
    specialProjectFlagId: "spf_01"
  })
];

const trials: TrialEntity[] = [
  createTrial(
    "trial_01",
    "cus_01",
    "site_01",
    "active",
    "2026-04-21T09:00:00.000Z",
    "2026-04-28T23:59:00.000Z",
    "isik-temizlik.ustaca.app",
    "isiktemizlik.com",
    "Web Sitesi Yillik"
  )
];

const payments: PaymentEntity[] = [
  createPayment({
    id: "pay_01",
    customerId: "cus_01",
    siteId: "site_01",
    payment_status: "trialing",
    totalAmount: 23880,
    paidAmount: 1800,
    dueAt: "2026-04-28T23:59:00.000Z",
    invoiceCode: "INV-2026-042",
    installmentsTotal: 12,
    installmentsPaid: 1,
    items: [
      { productCode: "website", label: "Web Sitesi Yillik", amount: 22490 },
      { productCode: "setup", label: "Operasyonel Kurulum", amount: 1390 }
    ]
  }),
  createPayment({
    id: "pay_02",
    customerId: "cus_02",
    siteId: "site_02",
    payment_status: "paid",
    totalAmount: 33480,
    paidAmount: 33480,
    dueAt: "2026-04-20T23:59:00.000Z",
    invoiceCode: "INV-2026-051",
    installmentsTotal: 12,
    installmentsPaid: 12,
    items: [
      { productCode: "website", label: "Web Sitesi", amount: 24990 },
      { productCode: "map_visibility", label: "Haritada Cik", amount: 8490 }
    ]
  }),
  createPayment({
    id: "pay_03",
    customerId: "cus_03",
    siteId: "site_03",
    payment_status: "past_due",
    totalAmount: 23880,
    paidAmount: 3980,
    dueAt: "2026-04-14T23:59:00.000Z",
    invoiceCode: "INV-2026-063",
    installmentsTotal: 12,
    installmentsPaid: 2,
    items: [{ productCode: "website", label: "Web Sitesi Yillik", amount: 23880 }]
  })
];

const domains: DomainEntity[] = [
  createDomain({
    id: "dom_01",
    customerId: "cus_01",
    siteId: "site_01",
    domain_status: "connected",
    requestedHostname: "isiktemizlik.com",
    previewHostname: "isik-temizlik.ustaca.app",
    liveHostname: "isiktemizlik.com",
    registrar: "Cloudflare",
    sslEnabled: true,
    expiresAt: "2027-03-18T10:00:00.000Z"
  }),
  createDomain({
    id: "dom_02",
    customerId: "cus_02",
    siteId: "site_02",
    domain_status: "connected",
    requestedHostname: "novaklima.com",
    previewHostname: "nova-klima.ustaca.app",
    liveHostname: "novaklima.com",
    registrar: "Cloudflare",
    sslEnabled: true,
    expiresAt: "2027-02-11T10:00:00.000Z"
  }),
  createDomain({
    id: "dom_03",
    customerId: "cus_03",
    siteId: "site_03",
    domain_status: "dns_issue",
    requestedHostname: "ritimnakliyat.com",
    previewHostname: "ritim-nakliyat.ustaca.app",
    liveHostname: null,
    registrar: "Cloudflare",
    sslEnabled: false,
    expiresAt: "2026-08-02T18:00:00.000Z"
  })
];

const formSubmissions: FormSubmissionEntity[] = [
  {
    id: "frm_01",
    status: "quoted" as const,
    customer_id: "cus_01",
    customerId: "cus_01",
    site_id: "site_01",
    siteId: "site_01",
    request_status: "quoted" as const,
    service_key: "standart ev temizligi",
    source_key: "landing form",
    name: "Sibel K.",
    phone: "+90 505 444 12 21",
    email: null,
    service: "Standart Ev Temizligi",
    source: "Landing Form",
    message: "Cumartesi sabahi 2+1 ev temizligi icin fiyat bilgisi istiyorum.",
    notes: "Cumartesi sabah ekip istiyor.",
    submittedAt: "2026-04-21T09:44:00.000Z",
    ...createEntityTimestamps("2026-04-21T09:44:00.000Z")
  },
  {
    id: "frm_02",
    status: "contacted" as const,
    customer_id: "cus_01",
    customerId: "cus_01",
    site_id: "site_01",
    siteId: "site_01",
    request_status: "contacted" as const,
    service_key: "bos ev temizligi",
    source_key: "meta lead ads",
    name: "Atakan D.",
    phone: "+90 530 100 88 90",
    email: null,
    service: "Bos Ev Temizligi",
    source: "Meta Lead Ads",
    message: "Tasima sonrasi ayni gun ekip gelebilir mi?",
    notes: "Tasima tarihi 28 Nisan.",
    submittedAt: "2026-04-20T15:08:00.000Z",
    ...createEntityTimestamps("2026-04-20T15:08:00.000Z")
  }
];

const appointmentRequests: AppointmentRequestEntity[] = [
  {
    id: "apt_01",
    status: "scheduled" as const,
    customer_id: "cus_01",
    customerId: "cus_01",
    site_id: "site_01",
    siteId: "site_01",
    request_status: "scheduled" as const,
    requested_service_key: "ofis rutin bakim",
    name: "Nilgun A.",
    phone: "+90 542 781 22 11",
    requestedService: "Ofis Rutin Bakim",
    requestedAt: "2026-04-24T11:00:00.000Z",
    notes: "Aylik teklif istiyor.",
    ...createEntityTimestamps("2026-04-22T10:00:00.000Z")
  },
  {
    id: "apt_02",
    status: "new" as const,
    customer_id: "cus_01",
    customerId: "cus_01",
    site_id: "site_01",
    siteId: "site_01",
    request_status: "new" as const,
    requested_service_key: "standart ev temizligi",
    name: "Burak Y.",
    phone: "+90 553 000 55 66",
    requestedService: "Standart Ev Temizligi",
    requestedAt: "2026-04-23T16:30:00.000Z",
    notes: "Kartal lokasyonu.",
    ...createEntityTimestamps("2026-04-22T11:00:00.000Z")
  }
];

const supportTickets: SupportTicketEntity[] = [
  createSupportTicket({
    id: "sup_01",
    customerId: "cus_01",
    siteId: "site_01",
    support_status: "waiting_on_customer",
    subject: "WhatsApp CTA rengi mobilde fazla parlak",
    category: "tasarim",
    priority: "medium",
    channel: "email",
    customerMessage: "Buton daha premium ama goz yormayan gorunsun.",
    opsNote: "Yeni accent varyanti panelde onay bekliyor.",
    updatedAt: "2026-04-21T14:48:00.000Z"
  }),
  createSupportTicket({
    id: "sup_02",
    customerId: "cus_03",
    siteId: "site_03",
    support_status: "open",
    subject: "DNS kaydi dogrulanmiyor",
    category: "domain",
    priority: "high",
    channel: "email",
    customerMessage: "Domain hala yayina gecmedi.",
    opsNote: "DNS issue nedeniyle once domain kontrolden gecmeli.",
    updatedAt: "2026-04-22T08:10:00.000Z"
  })
];

const aiAssistants: AiAssistantEntity[] = [
  {
    id: "ai_01",
    status: true,
    customer_id: "cus_01",
    customerId: "cus_01",
    site_id: "site_01",
    siteId: "site_01",
    channel: "site" as const,
    enabled: true,
    greeting: "Merhaba, hizmetlerimiz ve teklif sureci konusunda yardimci olabilirim.",
    primaryGoal: "Ziyaretciyi form ve randevu akislariyla donusume tasimak.",
    escalationRoute: "Panel formu ve WhatsApp hatti",
    maxCatalogItems: 10,
    knowledgeScope: ["services", "pricing", "appointments"],
    ...createEntityTimestamps(now)
  },
  {
    id: "ai_02",
    status: false,
    customer_id: "cus_01",
    customerId: "cus_01",
    site_id: "site_01",
    siteId: "site_01",
    channel: "whatsapp" as const,
    enabled: false,
    greeting: "WhatsApp AI modulu satin alindiginda aktiflesir.",
    primaryGoal: "Calisma saatleri, adres ve en fazla 10 hizmet bilgisi vermek.",
    escalationRoute: "Canli ekip / WhatsApp destek",
    maxCatalogItems: 10,
    knowledgeScope: ["hours", "address", "services"],
    ...createEntityTimestamps(now)
  }
];

const notifications: NotificationEntity[] = [
  {
    id: "not_01",
    status: "sent",
    customer_id: "cus_01",
    customerId: "cus_01",
    site_id: "site_01",
    siteId: "site_01",
    user_id: singleTenantWorkspace.user.id,
    userId: singleTenantWorkspace.user.id,
    channel: "email",
    eventName: "trial.started",
    event_name_key: "trial.started",
    notification_status: "sent",
    recipient: singleTenantWorkspace.user.email,
    recipient_key: "merve@isiktemizlik.com",
    subject: "Trial surecin basladi",
    attemptCount: 1,
    lastAttemptAt: "2026-04-21T09:05:00.000Z",
    sentAt: "2026-04-21T09:05:00.000Z",
    payload: { trialId: "trial_01" },
    ...createEntityTimestamps("2026-04-21T09:05:00.000Z")
  },
  {
    id: "not_02",
    status: "queued",
    customer_id: "cus_03",
    customerId: "cus_03",
    site_id: "site_03",
    siteId: "site_03",
    user_id: "usr_owner_03",
    userId: "usr_owner_03",
    channel: "email",
    eventName: "payment.past_due",
    event_name_key: "payment.past_due",
    notification_status: "queued",
    recipient: "ece@ritimnakliyat.com",
    recipient_key: "ece@ritimnakliyat.com",
    subject: "Odeme gecikmesi nedeniyle yayin askiya alinabilir",
    attemptCount: 0,
    lastAttemptAt: null,
    sentAt: null,
    payload: { paymentId: "pay_03" },
    ...createEntityTimestamps(now)
  }
];

const specialProjectFlags: SpecialProjectFlagEntity[] = [
  {
    id: "spf_01",
    status: "flagged",
    customer_id: "cus_03",
    customerId: "cus_03",
    site_id: "site_03",
    siteId: "site_03",
    special_project_status: "flagged",
    reason_key: "musteri online odeme ve agir rezervasyon talep ediyor.",
    reason: "Musteri online odeme ve agir rezervasyon talep ediyor.",
    requestedFeature: "online odeme",
    priority: "high",
    opsNote: "Standart akistan cikarilip teknik degerlendirmeye alinacak.",
    routedAt: null,
    ...createEntityTimestamps(now)
  }
];

const auditLogs: AuditLogEntity[] = [
  {
    id: "aud_01",
    status: "recorded" as const,
    customer_id: "cus_01",
    customerId: "cus_01",
    site_id: "site_01",
    siteId: "site_01",
    actor_user_id: superAdminUser.id,
    actorUserId: superAdminUser.id,
    actorRole: "super_admin" as const,
    action: "trial.started",
    action_key: "trial.started",
    targetCollection: "trials",
    targetId: "trial_01",
    summary: "7 gunluk gercek urun trial'i baslatildi.",
    metadata: { temporaryHostname: "isik-temizlik.ustaca.app" },
    ...createEntityTimestamps("2026-04-21T09:00:00.000Z")
  },
  {
    id: "aud_02",
    status: "recorded" as const,
    customer_id: "cus_03",
    customerId: "cus_03",
    site_id: "site_03",
    siteId: "site_03",
    actor_user_id: opsAdminUser.id,
    actorUserId: opsAdminUser.id,
    actorRole: "ops_admin" as const,
    action: "payment.past_due",
    action_key: "payment.past_due",
    targetCollection: "payments",
    targetId: "pay_03",
    summary: "Odeme gecikmesi kayda alindi ve yayin aski riski olusturuldu.",
    metadata: { invoiceCode: "INV-2026-063" },
    ...createEntityTimestamps(now)
  }
];

export const firestoreSeedData: FirestoreSeedDataset = {
  users: adminUsers,
  customers,
  sites: customerSites,
  trials,
  payments,
  domains,
  formSubmissions,
  appointmentRequests,
  supportTickets,
  aiAssistants,
  notifications,
  specialProjectFlags,
  auditLogs
};

export const defaultCustomerSeedBundle = {
  user: adminUsers[2]!,
  customer: customers[0]!,
  site: customerSites[0]!,
  trial: trials[0]!,
  payments: payments.filter((payment) => payment.customer_id === "cus_01"),
  domains: domains.filter((domain) => domain.customer_id === "cus_01"),
  formSubmissions: formSubmissions.filter((submission) => submission.customer_id === "cus_01"),
  appointmentRequests: appointmentRequests.filter((request) => request.customer_id === "cus_01"),
  supportTickets: supportTickets.filter((ticket) => ticket.customer_id === "cus_01"),
  aiAssistants: aiAssistants.filter((assistant) => assistant.customer_id === "cus_01"),
  notifications: notifications.filter((notification) => notification.customer_id === "cus_01"),
  specialProjectFlag: null
} satisfies CustomerDataBundle;
