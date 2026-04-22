import type {
  CustomerState,
  DomainState,
  PaymentState,
  PaymentVerificationState,
  TicketState
} from "@ustaca/domain";
import { opsAdminUser, superAdminUser } from "@ustaca/domain";
import type { InfoPair, MetricItem, TimelineItem } from "@ustaca/types";

export const systemStateTone: Record<CustomerState, MetricItem["tone"]> = {
  draft: "neutral",
  trial_active: "accent",
  trial_expired: "warning",
  payment_waiting: "warning",
  active: "positive",
  suspended: "critical",
  special_project: "warning",
  archived: "neutral"
};

export const systemStateLabel: Record<CustomerState, string> = {
  draft: "Taslak",
  trial_active: "Trial Aktif",
  trial_expired: "Trial Bitti",
  payment_waiting: "Odeme Bekliyor",
  active: "Aktif",
  suspended: "Askida",
  special_project: "Ozel Proje",
  archived: "Arsiv"
};

export const domainStateLabel: Record<DomainState, string> = {
  connected: "Bagli",
  pending_verification: "Dogrulaniyor",
  dns_issue: "DNS Sorunu"
};

export const paymentStateLabel: Record<PaymentState, string> = {
  paid: "Odendi",
  trialing: "Odeme Akista",
  past_due: "Gecikmede"
};

export const paymentVerificationStateLabel: Record<PaymentVerificationState, string> = {
  unverified: "Dogrulanmadi",
  pending_api_check: "API Kontrol Bekliyor",
  verified: "Dogrulandi",
  manual_review: "Manuel Inceleme",
  failed: "Basarisiz"
};

export const ticketStateLabel: Record<TicketState, string> = {
  open: "Acik",
  in_progress: "Islemde",
  waiting_on_customer: "Musteri Bekleniyor",
  resolved: "Cozuldu",
  closed: "Kapatildi"
};

export const toneFromDomainState = (state: DomainState): MetricItem["tone"] => {
  if (state === "connected") {
    return "positive";
  }

  if (state === "pending_verification") {
    return "warning";
  }

  return "critical";
};

export const toneFromPaymentState = (state: PaymentState): MetricItem["tone"] => {
  if (state === "paid") {
    return "positive";
  }

  if (state === "trialing") {
    return "accent";
  }

  return "critical";
};

export const toneFromPaymentVerificationState = (
  state: PaymentVerificationState | undefined
): MetricItem["tone"] => {
  if (!state) {
    return "neutral";
  }

  if (state === "verified") {
    return "positive";
  }

  if (state === "pending_api_check" || state === "manual_review") {
    return "warning";
  }

  if (state === "failed") {
    return "critical";
  }

  return "neutral";
};

export const toneFromTicketState = (state: TicketState): MetricItem["tone"] => {
  if (state === "resolved" || state === "closed") {
    return "positive";
  }

  if (state === "waiting_on_customer" || state === "in_progress") {
    return "warning";
  }

  return "critical";
};

export const adminLifecycle: TimelineItem[] = [
  {
    label: "Lead -> Trial",
    detail:
      "Tanitim sitesinden gelen kayitlar icin veri toplanir, blueprint olusturulur ve gecici subdomain acilir.",
    meta: "7 gun",
    tone: "accent"
  },
  {
    label: "Trial -> Odeme",
    detail: "Gercek urun kullanilir, hedef domain kayda alinir, trial sonunda tam aktivasyon odeme ile acilir.",
    meta: "yillik plan",
    tone: "warning"
  },
  {
    label: "Odeme -> Aktivasyon",
    detail: "Taksit secenegi belirlenir, yayin tam aktive edilir, domain operasyon tarafindan baglanir.",
    meta: "kontrollu gecis",
    tone: "positive"
  },
  {
    label: "Gecikme -> Aski",
    detail: "Odeme gecikirse yayin askiya alinir; veri silinmez, odeme sonrasi tekrar acilabilir.",
    meta: "otomatik uyari",
    tone: "critical"
  }
];

export const adminRoleGuardrails: InfoPair[] = [
  {
    label: superAdminUser.role,
    value: "Tum sistem, finans ve rol ayarlari",
    hint: "Sistem duzeyi mudahale, askiya alma ve raporlama yetkisi.",
    tone: "accent"
  },
  {
    label: opsAdminUser.role,
    value: "Trial, odeme, domain ve destek operasyonu",
    hint: "Sistem ayarlarini degistirmez; gunluk akisi ve musteri yasam dongusunu yonetir.",
    tone: "warning"
  },
  {
    label: "Musteri",
    value: "Sadece kendi site ve panel verisi",
    hint: "Ikinci kullanici, ikinci site ve coklu sube yoktur.",
    tone: "positive"
  }
];

export const adminModuleHighlights = [
  {
    title: "Musteri Listesi",
    description: "Durum, odeme, domain ve destek sinyallerini tek satirda verip hizli aksiyon aldirir."
  },
  {
    title: "Musteri Detay",
    description: "Bir kaydin trial, domain, odeme, moduller ve destek gecmisi tek odakta toplanir."
  },
  {
    title: "Trial Yonetimi",
    description: "7 gunluk gercek urun denemesini baslatma, takip etme ve ucretliye gecis hazirligi."
  },
  {
    title: "Odeme / Taksit",
    description: "Yillik plan, dogrulama, taksit ve askiya alma kurallari icin operasyon masasi."
  },
  {
    title: "Domain Yonetimi",
    description: "Kapali sistemde subdomain ve hedef domain gecisi operasyon merkezinden izlenir."
  },
  {
    title: "Raporlama Ozeti",
    description: "Trial donusumu, gecikme, domain riski ve destek yogunlugu tek bir karar katmaninda gorulur."
  }
];

export const supportHighlights: TimelineItem[] = [
  {
    label: "Yeni destek kaydi",
    detail: "Panel ici ticket acildiginda veya destek hattina mesaj geldiginde ops kuyruguna duser.",
    meta: "e-posta bildirimli",
    tone: "accent"
  },
  {
    label: "Domain sorunu",
    detail: "DNS ve gecis sorunlari domain yonetimi moduluyle birlikte islenir.",
    meta: "ops admin",
    tone: "warning"
  },
  {
    label: "Site uretim hatasi",
    detail: "Otomasyon, yeniden uretim ve ozel proje ayrimi icin takip notlari buradan gorulur.",
    meta: "teknik ekip",
    tone: "critical"
  }
];
