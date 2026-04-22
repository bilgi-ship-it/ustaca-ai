import type { AuthSession } from "@ustaca/auth";
import {
  createDataAccessService,
  createInMemoryRepositoryBundle,
  firestoreSeedData
} from "@ustaca/db";
import type { CustomerWorkspace } from "@ustaca/domain";
import type { InfoPair, MetricItem, NavItem, TimelineItem } from "@ustaca/types";
import { notFound } from "next/navigation";

import {
  customerStateLabel,
  domainStateLabel,
  panelModuleCards,
  paymentStateLabel,
  requestStateLabel,
  supportChannels,
  ticketStateLabel,
  toneFromCustomerState,
  toneFromDomainState,
  toneFromPaymentState,
  toneFromProductModule,
  toneFromRequestState,
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

const getPrimaryDomain = (workspace: CustomerWorkspace) => workspace.domains[0] ?? null;

const getAnnualPayment = (workspace: CustomerWorkspace) =>
  workspace.payments.find((payment) => payment.billingModel === "annual") ?? workspace.payments[0] ?? null;

const getOpenSupportCount = (workspace: CustomerWorkspace) =>
  workspace.supportTickets.filter(
    (ticket) => ticket.status !== "resolved" && ticket.status !== "closed"
  ).length;

const getEnabledAiCount = (workspace: CustomerWorkspace) =>
  workspace.aiAssistants.filter((assistant) => assistant.enabled).length;

const getAssistantByChannel = (workspace: CustomerWorkspace, channel: "site" | "whatsapp") =>
  workspace.aiAssistants.find((assistant) => assistant.channel === channel) ?? null;

export const getCustomerIdForSession = async (session: AuthSession) =>
  session.businessId ?? (await repositories.customers.getByOwnerUserId(session.user.id))?.id ?? null;

export const getCustomerWorkspaceForSession = async (session: AuthSession) => {
  const customerId = await getCustomerIdForSession(session);

  if (!customerId) {
    notFound();
  }

  const workspace = await dataAccess.getCustomerWorkspace(customerId);

  if (!workspace) {
    notFound();
  }

  return workspace;
};

export const buildPanelNavigation = (workspace: CustomerWorkspace): NavItem[] => [
  {
    href: "/",
    label: "Genel Bakis",
    description: "Site, odeme, domain ve destek ozeti.",
    badge: customerStateLabel[workspace.systemStatus]
  },
  {
    href: "/site",
    label: "Site Bilgileri",
    description: "Tanitim metinleri, iletisim ve ana butonlar.",
    badge: "kolay guncelle"
  },
  {
    href: "/services",
    label: "Hizmet / Fiyat",
    description: "Hizmetlerini ve fiyatlarini duzenle.",
    badge: `${workspace.services.length} hizmet`
  },
  {
    href: "/gallery",
    label: "Galeri",
    description: "Gorsellerini ve kapak secimlerini yonet.",
    badge: `${workspace.gallery.length} gorsel`
  },
  {
    href: "/form-requests",
    label: "Form Talepleri",
    description: "Teklif ve bilgi taleplerini gor.",
    badge: `${workspace.formRequests.length} kayit`
  },
  {
    href: "/appointments",
    label: "Randevu Talepleri",
    description: "Randevu isteyen kisileri tek yerde takip et.",
    badge: `${workspace.appointmentRequests.length} talep`
  },
  {
    href: "/domain",
    label: "Domain Durumu",
    description: "Trial yayin adresi ve hedef domain bilgisi.",
    badge: getPrimaryDomain(workspace)
      ? domainStateLabel[getPrimaryDomain(workspace)!.status]
      : "Hazirlaniyor"
  },
  {
    href: "/billing",
    label: "Odeme Durumu",
    description: "Yillik hizmet ve vade bilgisini gor.",
    badge: getAnnualPayment(workspace)
      ? paymentStateLabel[getAnnualPayment(workspace)!.status]
      : "Kayit yok"
  },
  {
    href: "/support",
    label: "Destek",
    description: "Panel ici destek kayitlari ve yardim kanallari.",
    badge: `${getOpenSupportCount(workspace)} acik`
  },
  {
    href: "/site-ai",
    label: "Site AI",
    description: "Site icindeki AI yardimcisinin ayarlari.",
    badge: getAssistantByChannel(workspace, "site")?.enabled ? "hazir" : "kapali"
  }
];

export const buildPanelMetrics = (workspace: CustomerWorkspace): MetricItem[] => {
  const primaryDomain = getPrimaryDomain(workspace);
  const openSupportCount = getOpenSupportCount(workspace);
  const leadCount = workspace.formRequests.length + workspace.appointmentRequests.length;

  return [
    {
      label: "Site Durumu",
      value:
        workspace.site.activationState === "active"
          ? "Tam aktif"
          : workspace.site.activationState === "suspended"
            ? "Beklemede"
            : "Deneme yayinda",
      detail: workspace.site.publicUrl,
      tone:
        workspace.site.activationState === "active"
          ? "positive"
          : workspace.site.activationState === "suspended"
            ? "critical"
            : "accent"
    },
    {
      label: "Aktivasyon",
      value:
        workspace.systemStatus === "trial_active" || workspace.systemStatus === "payment_waiting"
          ? `${workspace.trial.daysRemaining} gun`
          : customerStateLabel[workspace.systemStatus],
      detail:
        workspace.systemStatus === "active"
          ? "Her sey hazir; sadece iceriklerini guncel tutman yeterli."
          : "Odeme tamamlandiginda tam aktivasyon akisi devam eder.",
      tone: toneFromCustomerState(workspace.systemStatus)
    },
    {
      label: "Domain",
      value: primaryDomain ? domainStateLabel[primaryDomain.status] : "Hazirlaniyor",
      detail: primaryDomain?.hostname ?? workspace.business.targetDomain,
      tone: primaryDomain ? toneFromDomainState(primaryDomain.status) : "warning"
    },
    {
      label: "Talep / Destek",
      value: `${leadCount} talep`,
      detail:
        openSupportCount > 0
          ? `${openSupportCount} destek konusu acik.`
          : `${getEnabledAiCount(workspace)} AI modulu yardimci olmaya hazir.`,
      tone: openSupportCount > 0 ? "warning" : "accent"
    }
  ];
};

export const buildPanelNextActions = (workspace: CustomerWorkspace): TimelineItem[] => {
  const primaryDomain = getPrimaryDomain(workspace);
  const openSupportCount = getOpenSupportCount(workspace);

  return [
    {
      label:
        workspace.systemStatus === "active"
          ? "Site bilgilerini guncel tut"
          : "Odeme planini netlestir",
      detail:
        workspace.systemStatus === "active"
          ? "Hizmet ve fiyat alanlarini guncelleyerek siteni canli tutabilirsin."
          : "Deneme suresi bitmeden odeme plani belirlenirse gecis daha rahat tamamlanir.",
      meta:
        workspace.systemStatus === "active"
          ? fullDate.format(new Date(workspace.site.lastPublishedAt))
          : fullDate.format(new Date(workspace.trial.endsAt)),
      tone: workspace.systemStatus === "active" ? "positive" : "warning"
    },
    {
      label: "Hizmet ve fiyatlarini gozden gecir",
      detail:
        "En cok teklif almak istedigin hizmetleri ustte tut, aciklamalari daha net hale getir.",
      meta: `${workspace.services.length} hizmet`,
      tone: "accent"
    },
    {
      label: openSupportCount > 0 ? "Destek notunu kontrol et" : "Domain surecini takip et",
      detail:
        openSupportCount > 0
          ? "Destek kaydindaki son notu okuyup gerekiyorsa onay veya ek bilgi gonderebilirsin."
          : "Domain ve SSL gecisini teknik detayla ugrasman gerekmeden operasyon ekibi tamamlar.",
      meta: openSupportCount > 0 ? `${openSupportCount} acik konu` : primaryDomain?.hostname ?? workspace.business.targetDomain,
      tone: openSupportCount > 0 ? "warning" : "positive"
    }
  ];
};

export const buildPanelAlerts = (workspace: CustomerWorkspace): InfoPair[] => {
  const primaryDomain = getPrimaryDomain(workspace);
  const annualPayment = getAnnualPayment(workspace);
  const openSupportCount = getOpenSupportCount(workspace);

  return [
    {
      label: "Yayin durumu",
      value:
        workspace.site.activationState === "suspended"
          ? "Yayin beklemede"
          : workspace.site.activationState === "active"
            ? "Yayin saglikli"
            : "Deneme yayini acik",
      hint: workspace.site.publicUrl,
      tone:
        workspace.site.activationState === "suspended"
          ? "critical"
          : workspace.site.activationState === "active"
            ? "positive"
            : "accent"
    },
    {
      label: "Domain",
      value: primaryDomain ? domainStateLabel[primaryDomain.status] : "Hazirlaniyor",
      hint: primaryDomain?.hostname ?? workspace.business.targetDomain,
      tone: primaryDomain ? toneFromDomainState(primaryDomain.status) : "warning"
    },
    {
      label: "Odeme",
      value: annualPayment ? paymentStateLabel[annualPayment.status] : "Kayit bekleniyor",
      hint: annualPayment ? fullDate.format(new Date(annualPayment.dueAt)) : "Odeme plani daha sonra gorunecek",
      tone: annualPayment ? toneFromPaymentState(annualPayment.status) : "warning"
    },
    {
      label: "Destek",
      value: openSupportCount > 0 ? `${openSupportCount} konu acik` : "Acil konu yok",
      hint: openSupportCount > 0 ? "Son notlari kontrol etmeyi unutma" : "Her sey yolunda gorunuyor",
      tone: openSupportCount > 0 ? "warning" : "positive"
    }
  ];
};

export const buildRecentRequestRows = (workspace: CustomerWorkspace) => {
  const formRows = workspace.formRequests.map((request) => ({
    id: `form-${request.id}`,
    person: request.name,
    topic: request.service,
    channel: "Form talebi",
    date: new Date(request.submittedAt).toISOString(),
    dateLabel: shortDate.format(new Date(request.submittedAt)),
    statusLabel: requestStateLabel[request.status],
    statusTone: toneFromRequestState(request.status)
  }));

  const appointmentRows = workspace.appointmentRequests.map((request) => ({
    id: `appointment-${request.id}`,
    person: request.name,
    topic: request.requestedService,
    channel: "Randevu talebi",
    date: new Date(request.requestedAt).toISOString(),
    dateLabel: shortDate.format(new Date(request.requestedAt)),
    statusLabel: requestStateLabel[request.status],
    statusTone: toneFromRequestState(request.status)
  }));

  return [...formRows, ...appointmentRows]
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .slice(0, 5);
};

export const buildSiteProfileInfo = (workspace: CustomerWorkspace): InfoPair[] => [
  {
    label: "Isletme adi",
    value: workspace.business.name,
    hint: workspace.business.sector,
    tone: "accent"
  },
  {
    label: "Kisa tanitim",
    value: workspace.site.settings.heroSubtitle,
    hint: "Ana sayfada ilk gorunen aciklama",
    tone: "neutral"
  },
  {
    label: "Iletisim",
    value: workspace.business.phone,
    hint: workspace.business.email,
    tone: "positive"
  },
  {
    label: "Adres",
    value: workspace.business.address,
    hint: workspace.business.city,
    tone: "neutral"
  }
];

export const buildCtaInfo = (workspace: CustomerWorkspace): InfoPair[] => [
  {
    label: "Ana baslik",
    value: workspace.site.settings.heroTitle,
    hint: "Ilk ekranda verdigin ana soz",
    tone: "accent"
  },
  {
    label: "Ana buton",
    value: workspace.site.settings.primaryCta,
    hint: "Insanlarin ilk tiklayacagi alan",
    tone: "positive"
  },
  {
    label: "Ikinci buton",
    value: workspace.site.settings.secondaryCta,
    hint: "Bilgi almak veya iletisime gecmek icin kullanilir",
    tone: "warning"
  },
  {
    label: "Yayin adresi",
    value: workspace.site.publicUrl,
    hint: workspace.site.template,
    tone: "accent"
  }
];

export const buildAssistantInfo = (workspace: CustomerWorkspace): InfoPair[] =>
  workspace.aiAssistants.map((assistant) => ({
    label: assistant.channel === "site" ? "Site AI asistani" : "WhatsApp AI",
    value: assistant.enabled ? "Hazir" : "Ek hizmet olarak acilir",
    hint: assistant.primaryGoal,
    tone: assistant.enabled ? "accent" : "neutral"
  }));

export const buildServiceRows = (workspace: CustomerWorkspace) =>
  workspace.services.map((service) => ({
    id: service.id,
    name: service.name,
    summary: service.summary,
    priceFrom: money.format(service.priceFrom),
    duration: `${service.durationMinutes} dk`,
    featuredLabel: service.featured ? "One cikan" : "Standart",
    featuredTone: service.featured ? ("accent" as const) : ("neutral" as const)
  }));

export const buildPricingRows = (workspace: CustomerWorkspace) =>
  workspace.pricingPlans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    tagline: plan.tagline,
    price: money.format(plan.price),
    cadence: plan.cadence === "single" ? "Tek sefer" : "Aylik / tekrarli",
    features: plan.features.join(", ")
  }));

export const buildModuleRows = (workspace: CustomerWorkspace) =>
  workspace.productModules.map((module) => ({
    id: module.code,
    label: module.label,
    tierLabel: module.tier === "core" ? "Ana urun" : "Ek hizmet",
    stateLabel: module.enabled ? "Aktif" : "Kapali",
    stateTone: toneFromProductModule(module)
  }));

export const buildGalleryRows = (workspace: CustomerWorkspace) =>
  workspace.gallery.map((asset) => ({
    id: asset.id,
    title: asset.title,
    category: asset.category,
    publishedAt: shortDate.format(new Date(asset.publishedAt)),
    highlightLabel: asset.highlight ? "Kapakta oncelikli" : "Galeride",
    highlightTone: asset.highlight ? ("accent" as const) : ("neutral" as const)
  }));

export const buildFormRows = (workspace: CustomerWorkspace) =>
  workspace.formRequests.map((request) => ({
    id: request.id,
    name: request.name,
    service: request.service,
    phone: request.phone,
    source: request.source,
    submittedAt: shortDate.format(new Date(request.submittedAt)),
    message: request.message,
    statusLabel: requestStateLabel[request.status],
    statusTone: toneFromRequestState(request.status)
  }));

export const buildAppointmentRows = (workspace: CustomerWorkspace) =>
  workspace.appointmentRequests.map((request) => ({
    id: request.id,
    name: request.name,
    service: request.requestedService,
    phone: request.phone,
    requestedAt: fullDate.format(new Date(request.requestedAt)),
    notes: request.notes,
    statusLabel: requestStateLabel[request.status],
    statusTone: toneFromRequestState(request.status)
  }));

export const buildDomainInfo = (workspace: CustomerWorkspace): InfoPair[] => {
  const primaryDomain = getPrimaryDomain(workspace);

  return [
    {
      label: "Deneme yayin adresi",
      value: workspace.site.subdomain,
      hint: "Sitenin ilk yayina alindigi gecici adres",
      tone: "accent"
    },
    {
      label: "Hedef domain",
      value: workspace.business.targetDomain,
      hint: "Uygunluk ve gecis sureci bizde takip edilir",
      tone: "warning"
    },
    {
      label: "Aktif domain",
      value: primaryDomain?.hostname ?? "Hazirlaniyor",
      hint: primaryDomain ? `SSL ${primaryDomain.sslEnabled ? "hazir" : "beklemede"}` : "Dogrulama sirasinda",
      tone: primaryDomain ? toneFromDomainState(primaryDomain.status) : "warning"
    },
    {
      label: "Yonetim sekli",
      value: primaryDomain ? (primaryDomain.managedByUstaca ? "Biz yonetiyoruz" : "Harici") : "Hazirlaniyor",
      hint: "Ilk surumde teknik DNS adimlarini sana birakmiyoruz",
      tone: "positive"
    }
  ];
};

export const buildDomainTimeline = (workspace: CustomerWorkspace): TimelineItem[] => {
  const primaryDomain = getPrimaryDomain(workspace);

  return [
    {
      label: "Site deneme yayini acildi",
      detail: "Ilk bakis, kontrol ve icerik duzenlemeleri bu adres uzerinden ilerler.",
      meta: workspace.site.subdomain,
      tone: "accent"
    },
    {
      label: "Hedef domain siraya alindi",
      detail: "Teknik kontrol ve gecis adimlari operasyon ekibinde takip edilir.",
      meta: workspace.business.targetDomain,
      tone: "warning"
    },
    {
      label: primaryDomain?.status === "connected" ? "Domain baglandi" : "Tam aktivasyon sonrasi baglanir",
      detail:
        primaryDomain?.status === "connected"
          ? "Artik ana alan adin uzerinden yayindasin."
          : "Odeme ve uygunluk adimlari tamamlandiginda gecis otomatik plana alinacak.",
      meta: primaryDomain?.hostname ?? "operasyon takibi",
      tone: primaryDomain?.status === "connected" ? "positive" : "accent"
    }
  ];
};

export const buildBillingInfo = (workspace: CustomerWorkspace): InfoPair[] => {
  const annualPayment = getAnnualPayment(workspace);

  if (!annualPayment) {
    return [
      {
        label: "Odeme bilgisi",
        value: "Henuz kayit yok",
        hint: "Kurulum tamamlandiginda burada detaylari goreceksin.",
        tone: "warning"
      }
    ];
  }

  return [
    {
      label: "Paket",
      value: annualPayment.planName,
      hint: "1 yillik hizmet mantigi ile ilerler",
      tone: "accent"
    },
    {
      label: "Toplam bedel",
      value: money.format(annualPayment.amount),
      hint: `${annualPayment.installments} taksit secenegi`,
      tone: "warning"
    },
    {
      label: "Odeme durumu",
      value: paymentStateLabel[annualPayment.status],
      hint: `Vade: ${fullDate.format(new Date(annualPayment.dueAt))}`,
      tone: toneFromPaymentState(annualPayment.status)
    },
    {
      label: "Yayin etkisi",
      value:
        annualPayment.status === "past_due"
          ? "Gecikmede yayin beklemeye alinabilir"
          : "Odeme tamamlaninca tam aktivasyon devam eder",
      hint: "Veri silinmez, surec kaldigi yerden devam eder",
      tone: annualPayment.status === "past_due" ? "critical" : "positive"
    }
  ];
};

export const buildPaymentRows = (workspace: CustomerWorkspace) =>
  workspace.payments.map((payment) => ({
    id: payment.id,
    planName: payment.planName,
    amount: money.format(payment.amount),
    billingModel: payment.billingModel === "annual" ? "1 yillik hizmet" : "Kurulum",
    installments: `${payment.installments} taksit`,
    dueAt: fullDate.format(new Date(payment.dueAt)),
    statusLabel: paymentStateLabel[payment.status],
    statusTone: toneFromPaymentState(payment.status)
  }));

export const buildSupportRows = (workspace: CustomerWorkspace) =>
  workspace.supportTickets.map((ticket) => ({
    id: ticket.id,
    subject: ticket.subject,
    category: ticket.category,
    channelLabel:
      ticket.channel === "chat"
        ? "Panel ici"
        : ticket.channel === "email"
          ? "E-posta"
          : "WhatsApp",
    statusLabel: ticketStateLabel[ticket.status],
    statusTone: toneFromTicketState(ticket.status),
    summary: ticket.summary,
    updatedAt: fullDate.format(new Date(ticket.updatedAt))
  }));

export const buildSiteAiSettings = (workspace: CustomerWorkspace) => {
  const siteAssistant = getAssistantByChannel(workspace, "site");
  const whatsappAssistant = getAssistantByChannel(workspace, "whatsapp");

  return {
    siteAssistant,
    whatsappAssistant
  };
};

export const panelStaticContent = {
  moduleCards: panelModuleCards,
  supportChannels
};
