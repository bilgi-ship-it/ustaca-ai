import {
  buildAdminCustomerProjection,
  buildAdminDomainProjection,
  buildAdminPaymentProjection,
  buildPlatformSupportProjection,
  createDataAccessService,
  createInMemoryRepositoryBundle,
  firestoreSeedData
} from "@ustaca/db";
import type {
  CustomerDataBundle,
  PaymentActivationOpsStatus,
  PaymentVerificationState,
  ProductModule
} from "@ustaca/domain";
import type { InfoPair, MetricItem, NavItem } from "@ustaca/types";

import {
  domainStateLabel,
  paymentStateLabel,
  paymentVerificationStateLabel,
  supportHighlights,
  systemStateLabel,
  systemStateTone,
  ticketStateLabel,
  toneFromDomainState,
  toneFromPaymentState,
  toneFromPaymentVerificationState,
  toneFromTicketState
} from "@/lib/content";

export const repositories = createInMemoryRepositoryBundle(firestoreSeedData);
export const dataAccess = createDataAccessService(repositories);

const money = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0
});

const shortDate = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "short"
});

const fullDate = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "long",
  year: "numeric"
});

const sortByUpdatedDescending = <T extends { updated_at?: string; updatedAt?: string; created_at?: string; createdAt?: string }>(
  rows: T[]
) =>
  [...rows].sort((left, right) => {
    const rightDate = right.updated_at ?? right.updatedAt ?? right.created_at ?? right.createdAt ?? "";
    const leftDate = left.updated_at ?? left.updatedAt ?? left.created_at ?? left.createdAt ?? "";
    return new Date(rightDate).getTime() - new Date(leftDate).getTime();
  });

const getVerificationLabel = (state?: PaymentVerificationState, source?: string | null) => {
  if (!state) {
    return "Kayit yok";
  }

  const sourceLabel = source === "manual" ? "Manuel" : source === "api" ? "API" : "Kaynak yok";
  return `${paymentVerificationStateLabel[state]} · ${sourceLabel}`;
};

const getActivationOpsLabel = (state?: PaymentActivationOpsStatus) => {
  if (!state) {
    return "Hazirlik kaydi yok";
  }

  if (state === "activation_completed") {
    return "Yayin aktif";
  }

  if (state === "activation_pending_ops") {
    return "Ops onayi bekliyor";
  }

  return "Odeme dogrulanmadi";
};

const getActivationOpsTone = (state?: PaymentActivationOpsStatus) => {
  if (!state) {
    return "neutral" as const;
  }

  if (state === "activation_completed") {
    return "positive" as const;
  }

  if (state === "activation_pending_ops") {
    return "warning" as const;
  }

  return "neutral" as const;
};

const getVerifiedByLabel = (verifiedBy?: string | null, verifiedByRole?: string | null) => {
  if (!verifiedBy) {
    return "Kayit yok";
  }

  return verifiedByRole ? `${verifiedBy} · ${verifiedByRole}` : verifiedBy;
};

const getPrimaryPayment = (bundle: CustomerDataBundle) =>
  sortByUpdatedDescending(bundle.payments)[0] ?? null;

const getPrimaryDomain = (bundle: CustomerDataBundle) =>
  sortByUpdatedDescending(bundle.domains)[0] ?? null;

const getLatestSupportTicket = (bundle: CustomerDataBundle) =>
  sortByUpdatedDescending(bundle.supportTickets)[0] ?? null;

const getModuleStateTone = (module: ProductModule): MetricItem["tone"] =>
  module.enabled ? (module.tier === "core" ? "accent" : "positive") : "neutral";

export const getAdminNavigation = async (): Promise<NavItem[]> => {
  const [customers, payments, support] = await Promise.all([
    dataAccess.listAdminCustomers(),
    dataAccess.listAdminPaymentLedger(),
    dataAccess.listPlatformSupportTickets()
  ]);

  return [
    {
      href: "/",
      label: "Dashboard",
      description: "Toplam musteri, risk ve karar sinyalleri.",
      badge: "ana ekran"
    },
    {
      href: "/customers",
      label: "Musteriler",
      description: "Tek hesap, tek isletme, tek site kayitlari.",
      badge: `${customers.length} kayit`
    },
    {
      href: "/trials",
      label: "Trial",
      description: "7 gunluk gercek urun denemesi ve gecis adimlari.",
      badge: `${customers.filter((customer) => customer.status === "trial_active").length} aktif`
    },
    {
      href: "/payments",
      label: "Odeme",
      description: "Yillik plan, taksit ve dogrulama takibi.",
      badge: `${payments.filter((payment) => payment.status === "past_due").length} risk`
    },
    {
      href: "/domains",
      label: "Domain",
      description: "Subdomain ve yonetilen domain operasyonu.",
      badge: "kapali sistem"
    },
    {
      href: "/support",
      label: "Destek",
      description: "Panel, WhatsApp ve e-posta destek kayitlari.",
      badge: `${support.filter((ticket) => ticket.status !== "resolved" && ticket.status !== "closed").length} acik`
    },
    {
      href: "/access",
      label: "Erisim",
      description: "Super admin ve ops admin gorunurlugu ile guardrail'ler.",
      badge: "rbac"
    },
    {
      href: "/reporting",
      label: "Raporlama",
      description: "Donusum, gecikme ve operasyon yogunlugu ozeti.",
      badge: "ozet"
    }
  ];
};

export const getAdminMetrics = async (): Promise<MetricItem[]> => {
  const [customers, payments, domains, support] = await Promise.all([
    dataAccess.listAdminCustomers(),
    dataAccess.listAdminPaymentLedger(),
    dataAccess.listAdminDomainOverview(),
    dataAccess.listPlatformSupportTickets()
  ]);

  return [
    {
      label: "Toplam Musteri",
      value: String(customers.length),
      detail: "Admin panelde aktif operasyon takibindeki musteri kayitlari.",
      tone: "accent"
    },
    {
      label: "Aktif Trial",
      value: String(customers.filter((customer) => customer.status === "trial_active").length),
      detail: "7 gunluk gercek urun denemesinde olan kayitlar.",
      tone: "warning"
    },
    {
      label: "Odeme Riski",
      value: String(payments.filter((payment) => payment.status === "past_due").length),
      detail: "Gecikme veya manuel inceleme nedeniyle aksiyon bekleyen odemeler.",
      tone: "critical"
    },
    {
      label: "Domain / Destek",
      value: `${domains.filter((domain) => domain.status !== "connected").length} + ${support.filter((ticket) => ticket.status !== "resolved" && ticket.status !== "closed").length}`,
      detail: "Domain sorunu ve acik destek kuyrugu bir arada izlenir.",
      tone: "accent"
    }
  ];
};

export const getCustomerRows = async () => {
  const customers = await dataAccess.listAdminCustomers();

  return customers.map((customer) => ({
    id: customer.id,
    businessName: customer.businessName,
    ownerName: customer.ownerName,
    sector: customer.sector,
    planName: customer.planName,
    statusLabel: systemStateLabel[customer.status],
    statusTone: systemStateTone[customer.status],
    paymentSummary: money.format(customer.mrr),
    domainLabel: domainStateLabel[customer.domainStatus],
    domainTone: toneFromDomainState(customer.domainStatus),
    trialEndsAt: shortDate.format(new Date(customer.trialEndsAt)),
    openTickets: `${customer.openTickets} acik kayit`,
    href: `/customers/${customer.id}`
  }));
};

export const getTrialRows = async () => {
  const customers = await dataAccess.listAdminCustomers();

  return customers
    .filter((customer) =>
      customer.status === "trial_active" ||
      customer.status === "trial_expired" ||
      customer.status === "payment_waiting"
    )
    .map((customer) => ({
      id: customer.id,
      businessName: customer.businessName,
      ownerName: customer.ownerName,
      endDate: shortDate.format(new Date(customer.trialEndsAt)),
      stateLabel: systemStateLabel[customer.status],
      stateTone: systemStateTone[customer.status],
      nextStep:
        customer.status === "trial_active"
          ? "Odeme plani secimi ve domain operasyon onayi"
          : customer.status === "trial_expired"
            ? "Yeniden aktivasyon veya arsiv karari"
            : "Odeme dogrulamasi ve tam aktivasyon",
      href: `/customers/${customer.id}`
    }));
};

export const getPaymentRows = async () => {
  const customers = await repositories.customers.listAll();
  const rows = await Promise.all(
    customers.map(async (customer) => {
      const bundle = await dataAccess.getCustomerRecordBundle(customer.id);

      if (!bundle) {
        return [];
      }

      return bundle.payments.map((payment) => {
        const row = buildAdminPaymentProjection(payment, bundle.customer);

        return {
          id: row.id,
          businessName: row.businessName,
          planName: row.planName,
          amount: money.format(row.amount),
          stateLabel: paymentStateLabel[row.status],
          stateTone: toneFromPaymentState(row.status),
          dueAt: shortDate.format(new Date(row.dueAt)),
          actionLabel:
            row.status === "past_due"
              ? "Yayini askiya al / ac"
              : row.activationOpsStatus === "activation_pending_ops"
                ? "Go-live onayi bekliyor"
                : "Taksit akisini guncelle",
          verificationLabel: getVerificationLabel(
            row.verificationStatus,
            row.verificationSource ?? null
          ),
          verificationTone: toneFromPaymentVerificationState(row.verificationStatus),
          activationLabel: getActivationOpsLabel(row.activationOpsStatus),
          activationTone: getActivationOpsTone(row.activationOpsStatus),
          activationHoldReason: row.activationHoldReason ?? "Ek bekleme notu yok",
          verificationSummary: row.verificationSummary ?? "API veya manuel kontrol kaydi bekleniyor",
          orderId: row.orderId ?? "Kayit yok",
          verifiedBy: getVerifiedByLabel(row.verifiedBy, row.verifiedByRole),
          manualNote: row.manualNote || "Manuel not yok",
          href: `/customers/${customer.id}`
        };
      });
    })
  );

  return rows.flat();
};

export const getDomainRows = async () => {
  const customers = await repositories.customers.listAll();
  const rows = await Promise.all(
    customers.map(async (customer) => {
      const domains = await repositories.domains.listByCustomer(customer.id);

      return domains.map((domain) => {
        const row = buildAdminDomainProjection(domain, customer);

        return {
          id: row.id,
          businessName: row.businessName,
          hostname: row.hostname,
          stateLabel: domainStateLabel[row.status],
          stateTone: toneFromDomainState(row.status),
          sslLabel: row.sslEnabled ? "SSL aktif" : "SSL bekliyor",
          expiresAt: shortDate.format(new Date(row.expiresAt)),
          href: `/customers/${customer.id}`
        };
      });
    })
  );

  return rows.flat();
};

export const getSupportRows = async () => {
  const customers = await repositories.customers.listAll();
  const rows = await Promise.all(
    customers.map(async (customer) => {
      const tickets = await repositories.supportTickets.listByCustomer(customer.id);

      return tickets.map((ticket) => {
        const row = buildPlatformSupportProjection(ticket, customer);

        return {
          id: row.id,
          businessName: row.businessName,
          subject: row.subject,
          priority: row.priority === "high" ? "Yuksek" : row.priority === "medium" ? "Orta" : "Dusuk",
          stateLabel: ticketStateLabel[row.status],
          stateTone: toneFromTicketState(row.status),
          updatedAt: shortDate.format(new Date(row.updatedAt)),
          href: `/customers/${customer.id}`
        };
      });
    })
  );

  return rows.flat();
};

export const getReportingMetrics = async (): Promise<MetricItem[]> => {
  const [customers, payments, domains, support] = await Promise.all([
    dataAccess.listAdminCustomers(),
    dataAccess.listAdminPaymentLedger(),
    dataAccess.listAdminDomainOverview(),
    dataAccess.listPlatformSupportTickets()
  ]);

  const activeTrialCount = customers.filter((customer) => customer.status === "trial_active").length;
  const activeCount = customers.filter((customer) => customer.status === "active").length;
  const overdueCount = payments.filter((payment) => payment.status === "past_due").length;
  const domainRiskCount = domains.filter((domain) => domain.status !== "connected").length;
  const supportOpenCount = support.filter((ticket) => ticket.status !== "resolved" && ticket.status !== "closed").length;

  return [
    {
      label: "Trial Donusum Hatti",
      value: `${activeTrialCount} / ${activeCount}`,
      detail: "Trial ve aktif ucretli musteri gorunumu.",
      tone: "accent"
    },
    {
      label: "Odeme Riski",
      value: String(overdueCount),
      detail: "Gecikmede olan kayitlar manuel aksiyon istiyor.",
      tone: overdueCount > 0 ? "critical" : "positive"
    },
    {
      label: "Domain Sorunu",
      value: String(domainRiskCount),
      detail: "Connected disindaki domainler ayrik izlenir.",
      tone: domainRiskCount > 0 ? "warning" : "positive"
    },
    {
      label: "Destek Yogunlugu",
      value: String(supportOpenCount),
      detail: supportHighlights[0]?.detail ?? "Destek kuyrugu izlenir.",
      tone: supportOpenCount > 0 ? "warning" : "positive"
    }
  ];
};

export const getReportingBreakdown = async (): Promise<InfoPair[]> => {
  const [customers, payments, domains, support] = await Promise.all([
    dataAccess.listAdminCustomers(),
    dataAccess.listAdminPaymentLedger(),
    dataAccess.listAdminDomainOverview(),
    dataAccess.listPlatformSupportTickets()
  ]);

  return [
    {
      label: "Aktif ucretli musteri",
      value: String(customers.filter((customer) => customer.status === "active").length),
      hint: "Tam aktivasyon ve domain baglantisi tamamlananlar",
      tone: "positive"
    },
    {
      label: "Trial bitisi yaklasanlar",
      value: String(customers.filter((customer) => customer.status === "trial_active").length),
      hint: "Odeme ve gecis operasyonu hazirligi gerekenler",
      tone: "warning"
    },
    {
      label: "Odeme gecikmesi",
      value: String(payments.filter((payment) => payment.status === "past_due").length),
      hint: "Yayini askiya alma riski olan kayitlar",
      tone: "critical"
    },
    {
      label: "Domain / destek",
      value: `${domains.filter((domain) => domain.status !== "connected").length} / ${support.filter((ticket) => ticket.status !== "resolved" && ticket.status !== "closed").length}`,
      hint: "Domain sorunu ve acik destek kaydi",
      tone: "accent"
    }
  ];
};

export const getAdminCustomerDetail = async (customerId: string) => {
  const bundle = await dataAccess.getCustomerRecordBundle(customerId);

  if (!bundle) {
    return null;
  }

  const customerSummary = buildAdminCustomerProjection(bundle);
  const primaryPayment = getPrimaryPayment(bundle);
  const primaryDomain = getPrimaryDomain(bundle);
  const latestTicket = getLatestSupportTicket(bundle);
  const primaryPaymentProjection = primaryPayment
    ? buildAdminPaymentProjection(primaryPayment, bundle.customer)
    : null;
  const moduleRows = bundle.site.enabledModules.map((module) => ({
    label: module.label,
    tierLabel: module.tier === "core" ? "Ana urun" : "Ek hizmet",
    stateLabel: module.enabled ? "Aktif" : "Kapali",
    stateTone: getModuleStateTone(module)
  }));

  const supportRows = sortByUpdatedDescending(bundle.supportTickets).map((ticket) => ({
    subject: ticket.subject,
    category: ticket.category,
    priority: ticket.priority === "high" ? "Yuksek" : ticket.priority === "medium" ? "Orta" : "Dusuk",
    statusLabel: ticketStateLabel[ticket.support_status],
    statusTone: toneFromTicketState(ticket.support_status),
    updatedAt: fullDate.format(new Date(ticket.updated_at)),
    opsNote: ticket.opsNote
  }));

  const operationNotes: InfoPair[] = [
    {
      label: "Son operasyon notu",
      value: latestTicket?.opsNote ?? "Henüz operasyon notu yok",
      hint: latestTicket ? latestTicket.subject : "Ilk aksiyon girildiginde burada gorunur",
      tone: latestTicket ? "warning" : "neutral"
    },
    {
      label: "Ozel proje durumu",
      value: bundle.specialProjectFlag?.reason ?? "Standart akis icinde",
      hint: bundle.specialProjectFlag?.opsNote ?? "Ek teknik degerlendirme gerekmiyor",
      tone: bundle.specialProjectFlag ? "warning" : "positive"
    },
    {
      label: "Destek gecmisi",
      value: `${bundle.supportTickets.length} kayit`,
      hint: `${bundle.supportTickets.filter((ticket) => ticket.support_status !== "resolved" && ticket.support_status !== "closed").length} acik konu`,
      tone: "accent"
    }
  ];

  return {
    ids: {
      customerId: bundle.customer.id,
      siteId: bundle.site.id,
      trialId: bundle.trial?.id ?? null,
      trialStatus: bundle.trial?.trial_status ?? null,
      paymentId: primaryPayment?.id ?? null,
      paymentAmount: primaryPayment?.totalAmount ?? null,
      paymentStatus: primaryPayment?.payment_status ?? null,
      paymentWorkflowStatus: primaryPaymentProjection?.rawStatus ?? null,
      activationOpsStatus: primaryPaymentProjection?.activationOpsStatus ?? null,
      ownerEmail: bundle.user.email,
      domainId: primaryDomain?.id ?? null,
      domainHostname: primaryDomain?.requestedHostname ?? bundle.customer.targetDomain,
      customerStatus: customerSummary.status
    },
    header: {
      businessName: bundle.customer.businessName,
      ownerName: bundle.user.name,
      ownerEmail: bundle.user.email,
      statusLabel: systemStateLabel[customerSummary.status],
      statusTone: systemStateTone[customerSummary.status],
      description: bundle.customer.shortDescription
    },
    basicInfo: [
      {
        label: "Isletme",
        value: bundle.customer.businessName,
        hint: `${bundle.customer.sector} · ${bundle.customer.contact.city}`,
        tone: "accent"
      },
      {
        label: "Musteri sahibi",
        value: bundle.user.name,
        hint: bundle.user.email,
        tone: "positive"
      },
      {
        label: "Hedef domain",
        value: bundle.customer.targetDomain,
        hint: bundle.customer.contact.phone,
        tone: "warning"
      },
      {
        label: "Kisa aciklama",
        value: bundle.customer.shortDescription,
        hint: bundle.customer.contact.address,
        tone: "neutral"
      }
    ] satisfies InfoPair[],
    siteInfo: [
      {
        label: "Slug / trial",
        value: bundle.site.slug,
        hint: bundle.site.previewHostname,
        tone: "accent"
      },
      {
        label: "Yayin durumu",
        value: bundle.site.site_status,
        hint: bundle.site.customDomain ?? "Henuz aktif custom domain yok",
        tone: bundle.site.site_status === "active" ? "positive" : bundle.site.site_status === "suspended" ? "critical" : "warning"
      },
      {
        label: "Tema ailesi",
        value: bundle.site.themeFamily,
        hint: bundle.site.themeVariant ?? "varsayilan varyant",
        tone: "neutral"
      },
      {
        label: "Son yayin",
        value: fullDate.format(new Date(bundle.site.publishedAt ?? bundle.site.updated_at)),
        hint: bundle.site.content.primaryCta,
        tone: "positive"
      }
    ] satisfies InfoPair[],
    trialInfo: bundle.trial
      ? [
          {
            label: "Trial durumu",
            value: bundle.trial.trial_status,
            hint: `${bundle.trial.daysGranted} gun`,
            tone: bundle.trial.trial_status === "active" ? "accent" : "warning"
          },
          {
            label: "Baslangic",
            value: fullDate.format(new Date(bundle.trial.startsAt)),
            hint: `Bitis: ${fullDate.format(new Date(bundle.trial.endsAt))}`,
            tone: "neutral"
          },
          {
            label: "Gecici yayin",
            value: bundle.trial.temporaryHostname,
            hint: bundle.trial.targetDomain,
            tone: "warning"
          }
        ] satisfies InfoPair[]
      : [
          {
            label: "Trial durumu",
            value: "Aktif trial yok",
            hint: "Kayit ucretli veya trial disi akista",
            tone: "neutral"
          }
        ] satisfies InfoPair[],
    paymentInfo: primaryPayment && primaryPaymentProjection
      ? [
          {
            label: "Odeme durumu",
            value: paymentStateLabel[primaryPaymentProjection.status],
            hint: `Workflow: ${primaryPaymentProjection.rawStatus ?? primaryPayment.payment_status}`,
            tone: toneFromPaymentState(primaryPaymentProjection.status)
          },
          {
            label: "Toplam bedel",
            value: money.format(primaryPayment.totalAmount),
            hint: `${primaryPayment.installmentsPaid}/${primaryPayment.installmentsTotal} taksit`,
            tone: "accent"
          },
          {
            label: "Dogrulama",
            value: getVerificationLabel(
              primaryPaymentProjection.verificationStatus,
              primaryPaymentProjection.verificationSource
            ),
            hint:
              primaryPaymentProjection.verificationSummary ?? "API veya manuel dogrulama notu yok",
            tone: toneFromPaymentVerificationState(primaryPaymentProjection.verificationStatus)
          },
          {
            label: "Aktivasyon ops",
            value: getActivationOpsLabel(primaryPaymentProjection.activationOpsStatus),
            hint:
              primaryPaymentProjection.activationHoldReason ||
              "Yayin acilisi icin ek operasyon beklemiyor",
            tone: getActivationOpsTone(primaryPaymentProjection.activationOpsStatus)
          },
          {
            label: "Dogrulayan",
            value: getVerifiedByLabel(
              primaryPaymentProjection.verifiedBy,
              primaryPaymentProjection.verifiedByRole
            ),
            hint:
              primaryPaymentProjection.verifiedAt
                ? `Dogrulama tarihi: ${fullDate.format(new Date(primaryPaymentProjection.verifiedAt))}`
                : "Dogrulama zamani henuz kayitli degil",
            tone: primaryPaymentProjection.verifiedBy ? "positive" : "neutral"
          },
          {
            label: "Manuel not",
            value: primaryPaymentProjection.manualNote || "Ops notu yok",
            hint: primaryPaymentProjection.orderId ?? primaryPayment.invoiceCode,
            tone: primaryPaymentProjection.manualNote ? "warning" : "neutral"
          },
          {
            label: "Aktivasyon hold",
            value:
              primaryPaymentProjection.activationHoldReason ||
              "Aktivasyon bloklayan acik neden yok",
            hint: `Vade: ${fullDate.format(new Date(primaryPayment.dueAt))}`,
            tone: primaryPaymentProjection.activationHoldReason ? "warning" : "positive"
          }
        ] satisfies InfoPair[]
      : [
          {
            label: "Odeme durumu",
            value: "Kayit bulunamadi",
            hint: "Ilk odeme kaydi acilmamis olabilir",
            tone: "warning"
          }
        ] satisfies InfoPair[],
    domainInfo: primaryDomain
      ? [
          {
            label: "Domain durumu",
            value: domainStateLabel[buildAdminDomainProjection(primaryDomain, bundle.customer).status],
            hint: primaryDomain.liveHostname ?? primaryDomain.requestedHostname,
            tone: toneFromDomainState(buildAdminDomainProjection(primaryDomain, bundle.customer).status)
          },
          {
            label: "Registrar",
            value: primaryDomain.registrar,
            hint: primaryDomain.sslEnabled ? "SSL aktif" : "SSL bekliyor",
            tone: primaryDomain.sslEnabled ? "positive" : "warning"
          },
          {
            label: "DNS hedefi",
            value: primaryDomain.dnsTarget,
            hint: primaryDomain.lastCheckAt ? `Son kontrol: ${fullDate.format(new Date(primaryDomain.lastCheckAt))}` : "Kontrol bekleniyor",
            tone: "neutral"
          }
        ] satisfies InfoPair[]
      : [
          {
            label: "Domain durumu",
            value: "Kayit bulunamadi",
            hint: "Domain akisi henuz acilmamis olabilir",
            tone: "warning"
          }
        ] satisfies InfoPair[],
    moduleRows,
    supportRows,
    operationNotes
  };
};
