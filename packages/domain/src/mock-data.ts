import type {
  AdminCustomer,
  AdminDomainOverviewItem,
  AdminPaymentLedgerItem,
  CustomerWorkspace,
  PlatformSupportTicket
} from "./models";

export const superAdminUser = {
  id: "usr_super_admin_01",
  email: "ops@ustaca.ai",
  name: "Ustaca Super Admin",
  role: "super_admin"
} as const;

export const opsAdminUser = {
  id: "usr_ops_admin_01",
  email: "operasyon@ustacacozum.com",
  name: "Ustaca Operasyon",
  role: "ops_admin"
} as const;

export const singleTenantWorkspace: CustomerWorkspace = {
  systemStatus: "trial_active",
  user: {
    id: "usr_owner_01",
    email: "merve@isiktemizlik.com",
    name: "Merve Isik",
    role: "customer"
  },
  business: {
    id: "biz_01",
    name: "Isik Temizlik",
    sector: "Ev ve ofis temizligi",
    city: "Istanbul",
    phone: "+90 532 123 45 67",
    email: "hello@isiktemizlik.com",
    address: "Kadikoy / Istanbul",
    targetDomain: "isiktemizlik.com",
    onboardingState: "live"
  },
  site: {
    id: "site_01",
    subdomain: "isik-temizlik.ustaca.app",
    customDomain: "isiktemizlik.com",
    publicUrl: "isik-temizlik.ustaca.app",
    template: "Neon Service Pulse",
    activationState: "trial_live",
    siteStatus: "published",
    lastPublishedAt: "2026-04-21T19:20:00.000Z",
    settings: {
      brandName: "Isik Temizlik",
      heroTitle: "Ev ve ofis temizliginde ayni gun teklif",
      heroSubtitle: "Ustaca AI ile hizmet, fiyat, galeri ve talep akisi tek panelden yonetilir.",
      primaryCta: "Teklif Al",
      secondaryCta: "WhatsApp ile Ulas",
      themeAccent: "electric-cyan"
    }
  },
  trial: {
    startsAt: "2026-04-21T09:00:00.000Z",
    endsAt: "2026-04-28T23:59:00.000Z",
    daysRemaining: 6,
    planName: "Web Sitesi Yillik",
    status: "trial_active"
  },
  payments: [
    {
      id: "pay_01",
      planName: "Web Sitesi Yillik",
      amount: 23880,
      currency: "TRY",
      billingModel: "annual",
      installments: 12,
      dueAt: "2026-04-28T23:59:00.000Z",
      paidAt: null,
      status: "trialing",
      invoiceCode: "INV-2026-042"
    },
    {
      id: "pay_00",
      planName: "Operasyonel Kurulum",
      amount: 1800,
      currency: "TRY",
      billingModel: "setup",
      installments: 1,
      dueAt: "2026-04-21T12:00:00.000Z",
      paidAt: "2026-04-21T12:07:00.000Z",
      status: "paid",
      invoiceCode: "INV-2026-011"
    }
  ],
  domains: [
    {
      id: "dom_01",
      hostname: "isiktemizlik.com",
      registrar: "Cloudflare",
      dnsTarget: "cname.ustaca.app",
      managedByUstaca: true,
      sslEnabled: true,
      status: "connected",
      expiresAt: "2027-03-18T10:00:00.000Z"
    }
  ],
  supportTickets: [
    {
      id: "sup_01",
      subject: "WhatsApp CTA rengi mobilde fazla parlak",
      category: "tasarim",
      priority: "medium",
      status: "waiting_on_customer",
      channel: "chat",
      createdAt: "2026-04-19T09:12:00.000Z",
      updatedAt: "2026-04-21T14:48:00.000Z",
      summary: "Mobil CTA parlakligini azaltmak icin yeni bir theme token onerildi.",
      customerNote: "Buton daha premium ama goz yormayan gorunsun.",
      opsNote: "Yeni accent varyanti panelde onay bekliyor."
    },
    {
      id: "sup_00",
      subject: "Galeri sirasini degistirme talebi",
      category: "icerik",
      priority: "low",
      status: "resolved",
      channel: "email",
      createdAt: "2026-04-15T11:10:00.000Z",
      updatedAt: "2026-04-16T08:35:00.000Z",
      summary: "Surukle-birak siralama akisi aciklandi ve uygulanabilir backlog'a alindi.",
      customerNote: "Kapak gorselini ilk siraya almak istiyor.",
      opsNote: "Ilk surumde manuel destek islemi olarak ilerleyecek."
    }
  ],
  services: [
    {
      id: "srv_01",
      name: "Standart Ev Temizligi",
      summary: "2+1 evler icin tek seferlik detayli temizlik",
      priceFrom: 3200,
      durationMinutes: 180,
      featured: true
    },
    {
      id: "srv_02",
      name: "Bos Ev Temizligi",
      summary: "Tasima sonrasi cam ve mutfak odakli paket",
      priceFrom: 4800,
      durationMinutes: 300,
      featured: true
    },
    {
      id: "srv_03",
      name: "Ofis Rutin Bakim",
      summary: "Haftalik tekrarli kurumsal temizlik plani",
      priceFrom: 7500,
      durationMinutes: 240,
      featured: false
    }
  ],
  pricingPlans: [
    {
      id: "price_01",
      name: "Hizli Teklif",
      price: 3200,
      cadence: "single",
      tagline: "Tek seferlik hizmetler icin giris paketi",
      features: ["3 saat ekip", "malzeme dahil", "ayni gun geri donus"]
    },
    {
      id: "price_02",
      name: "Aylik Abonelik",
      price: 9900,
      cadence: "monthly",
      tagline: "Kurumsal ve tekrarli musteriler icin",
      features: ["haftada 1 ziyaret", "oncelikli destek", "otomatik hatirlatma"]
    }
  ],
  productModules: [
    { code: "website", label: "Web Sitesi", tier: "core", enabled: true },
    { code: "quote_forms", label: "Fiyat Sor / Teklif Al", tier: "addon", enabled: true },
    { code: "appointment_requests", label: "Randevu Iste", tier: "addon", enabled: true },
    { code: "site_ai_assistant", label: "Site AI Asistani", tier: "addon", enabled: true },
    { code: "whatsapp_ai_assistant", label: "WhatsApp AI Asistani", tier: "addon", enabled: false }
  ],
  aiAssistants: [
    {
      channel: "site",
      enabled: true,
      greeting: "Merhaba, hizmetlerimiz ve teklif sureci konusunda yardimci olabilirim.",
      primaryGoal: "Ziyaretciyi form ve randevu akislariyla donusume tasimak.",
      escalationRoute: "Panel formu ve WhatsApp hatti"
    },
    {
      channel: "whatsapp",
      enabled: false,
      greeting: "WhatsApp AI modulu satin alindiginda aktiflesir.",
      primaryGoal: "Calisma saatleri, adres ve en fazla 10 hizmet bilgisi vermek.",
      escalationRoute: "Canli ekip / WhatsApp destek"
    }
  ],
  gallery: [
    {
      id: "gal_01",
      title: "Parlak mutfak teslimi",
      category: "Once / Sonra",
      imageUrl: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85",
      publishedAt: "2026-04-12T16:00:00.000Z",
      highlight: true
    },
    {
      id: "gal_02",
      title: "Ofis ortak alan yenileme",
      category: "Kurumsal",
      imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
      publishedAt: "2026-04-17T10:15:00.000Z",
      highlight: false
    },
    {
      id: "gal_03",
      title: "Bos ev derin temizlik",
      category: "Tasima",
      imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858",
      publishedAt: "2026-04-19T13:40:00.000Z",
      highlight: true
    }
  ],
  formRequests: [
    {
      id: "frm_01",
      name: "Sibel K.",
      service: "Standart Ev Temizligi",
      phone: "+90 505 444 12 21",
      source: "Landing Form",
      submittedAt: "2026-04-21T09:44:00.000Z",
      status: "quoted",
      message: "Cumartesi sabahi 2+1 ev temizligi icin fiyat bilgisi istiyorum.",
      notes: "Cumartesi sabah ekip istiyor."
    },
    {
      id: "frm_02",
      name: "Atakan D.",
      service: "Bos Ev Temizligi",
      phone: "+90 530 100 88 90",
      source: "Meta Lead Ads",
      submittedAt: "2026-04-20T15:08:00.000Z",
      status: "contacted",
      message: "Tasima sonrasi ayni gun ekip gelebilir mi?",
      notes: "Tasima tarihi 28 Nisan."
    }
  ],
  appointmentRequests: [
    {
      id: "apt_01",
      name: "Nilgun A.",
      requestedService: "Ofis Rutin Bakim",
      requestedAt: "2026-04-24T11:00:00.000Z",
      phone: "+90 542 781 22 11",
      status: "scheduled",
      notes: "Aylik teklif istiyor."
    },
    {
      id: "apt_02",
      name: "Burak Y.",
      requestedService: "Standart Ev Temizligi",
      requestedAt: "2026-04-23T16:30:00.000Z",
      phone: "+90 553 000 55 66",
      status: "new",
      notes: "Kartal lokasyonu."
    }
  ]
};

export const adminCustomers: AdminCustomer[] = [
  {
    id: "cus_01",
    businessName: "Isik Temizlik",
    ownerName: "Merve Isik",
    sector: "Temizlik",
    city: "Istanbul",
    planName: "Web Sitesi Yillik",
    mrr: 1990,
    status: "trial_active",
    domainStatus: "connected",
    trialEndsAt: "2026-04-28T23:59:00.000Z",
    openTickets: 1
  },
  {
    id: "cus_02",
    businessName: "Nova Klima",
    ownerName: "Arda Koc",
    sector: "Klima Servisi",
    city: "Ankara",
    planName: "Web Sitesi + Haritada Cik",
    mrr: 2790,
    status: "active",
    domainStatus: "connected",
    trialEndsAt: "2026-03-12T23:59:00.000Z",
    openTickets: 0
  },
  {
    id: "cus_03",
    businessName: "Ritim Nakliyat",
    ownerName: "Ece Temel",
    sector: "Nakliyat",
    city: "Izmir",
    planName: "Web Sitesi Yillik",
    mrr: 1990,
    status: "suspended",
    domainStatus: "dns_issue",
    trialEndsAt: "2026-04-18T23:59:00.000Z",
    openTickets: 2
  },
  {
    id: "cus_04",
    businessName: "Luna Guzellik",
    ownerName: "Yasemin T.",
    sector: "Guzellik Merkezi",
    city: "Bursa",
    planName: "Web Sitesi Trial",
    mrr: 0,
    status: "trial_active",
    domainStatus: "pending_verification",
    trialEndsAt: "2026-05-03T23:59:00.000Z",
    openTickets: 1
  }
];

export const adminPaymentLedger: AdminPaymentLedgerItem[] = [
  {
    id: "ledger_01",
    businessName: "Isik Temizlik",
    planName: "Web Sitesi Yillik",
    amount: 23880,
    status: "trialing",
    dueAt: "2026-04-28T23:59:00.000Z"
  },
  {
    id: "ledger_02",
    businessName: "Nova Klima",
    planName: "Web Sitesi + Haritada Cik",
    amount: 33480,
    status: "paid",
    dueAt: "2026-04-20T23:59:00.000Z"
  },
  {
    id: "ledger_03",
    businessName: "Ritim Nakliyat",
    planName: "Web Sitesi Yillik",
    amount: 23880,
    status: "past_due",
    dueAt: "2026-04-14T23:59:00.000Z"
  }
];

export const adminDomainOverview: AdminDomainOverviewItem[] = [
  {
    id: "adom_01",
    businessName: "Isik Temizlik",
    hostname: "isiktemizlik.com",
    status: "connected",
    sslEnabled: true,
    expiresAt: "2027-03-18T10:00:00.000Z"
  },
  {
    id: "adom_02",
    businessName: "Luna Guzellik",
    hostname: "lunaguzellik.com",
    status: "pending_verification",
    sslEnabled: false,
    expiresAt: "2026-12-12T09:00:00.000Z"
  },
  {
    id: "adom_03",
    businessName: "Ritim Nakliyat",
    hostname: "ritimnakliyat.com",
    status: "dns_issue",
    sslEnabled: false,
    expiresAt: "2026-08-02T18:00:00.000Z"
  }
];

export const platformSupportTickets: PlatformSupportTicket[] = [
  {
    id: "plat_sup_01",
    businessName: "Ritim Nakliyat",
    subject: "DNS kaydi dogrulanmiyor",
    priority: "high",
    status: "open",
    updatedAt: "2026-04-22T08:10:00.000Z"
  },
  {
    id: "plat_sup_02",
    businessName: "Isik Temizlik",
    subject: "Mobil CTA parlakligi",
    priority: "medium",
    status: "waiting_on_customer",
    updatedAt: "2026-04-21T14:48:00.000Z"
  },
  {
    id: "plat_sup_03",
    businessName: "Luna Guzellik",
    subject: "Domain baglama asamasinda yardim",
    priority: "low",
    status: "in_progress",
    updatedAt: "2026-04-20T16:21:00.000Z"
  }
];
