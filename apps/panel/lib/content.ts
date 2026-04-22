import { brand } from "@ustaca/config";
import type {
  CustomerState,
  DomainState,
  PaymentState,
  ProductModule,
  RequestState,
  TicketState
} from "@ustaca/domain";
import type { InfoPair, StatusTone } from "@ustaca/types";

export const customerStateLabel: Record<CustomerState, string> = {
  draft: "Kurulum asamasinda",
  trial_active: "Deneme yayinda",
  trial_expired: "Deneme bitti",
  payment_waiting: "Odeme bekleniyor",
  active: "Tam aktif",
  suspended: "Yayin beklemede",
  special_project: "Ozel degerlendirme",
  archived: "Arsivde"
};

export const domainStateLabel: Record<DomainState, string> = {
  connected: "Bagli",
  pending_verification: "Hazirlaniyor",
  dns_issue: "Kontrol gerekiyor"
};

export const paymentStateLabel: Record<PaymentState, string> = {
  paid: "Odeme tamamlandi",
  trialing: "Odeme bekleniyor",
  past_due: "Gecikme var"
};

export const requestStateLabel: Record<RequestState, string> = {
  new: "Yeni",
  contacted: "Donus yapildi",
  quoted: "Teklif gonderildi",
  scheduled: "Planlandi"
};

export const ticketStateLabel: Record<TicketState, string> = {
  open: "Acik",
  in_progress: "Islemde",
  waiting_on_customer: "Senden onay bekliyor",
  resolved: "Cozuldu",
  closed: "Kapatildi"
};

export const toneFromCustomerState = (state: CustomerState): StatusTone => {
  if (state === "active") {
    return "positive";
  }

  if (state === "trial_active" || state === "payment_waiting") {
    return "accent";
  }

  if (state === "trial_expired" || state === "special_project") {
    return "warning";
  }

  if (state === "suspended") {
    return "critical";
  }

  return "neutral";
};

export const toneFromDomainState = (state: DomainState): StatusTone => {
  if (state === "connected") {
    return "positive";
  }

  if (state === "pending_verification") {
    return "warning";
  }

  return "critical";
};

export const toneFromPaymentState = (state: PaymentState): StatusTone => {
  if (state === "paid") {
    return "positive";
  }

  if (state === "trialing") {
    return "accent";
  }

  return "critical";
};

export const toneFromRequestState = (state: RequestState): StatusTone => {
  if (state === "quoted" || state === "scheduled") {
    return "positive";
  }

  if (state === "contacted") {
    return "warning";
  }

  return "accent";
};

export const toneFromTicketState = (state: TicketState): StatusTone => {
  if (state === "resolved" || state === "closed") {
    return "positive";
  }

  if (state === "waiting_on_customer" || state === "in_progress") {
    return "warning";
  }

  return "critical";
};

export const toneFromProductModule = (module: ProductModule): StatusTone =>
  module.enabled ? (module.tier === "core" ? "accent" : "positive") : "neutral";

export const panelModuleCards = [
  {
    title: "Genel Bakis",
    description: "Site, odeme, trial ve destek durumunu seni yormadan bir araya getirir."
  },
  {
    title: "Site Bilgileri",
    description: "Isletme tanitimi, iletisim ve ana buton metinlerini kolayca guncellersin."
  },
  {
    title: "Hizmet / Fiyat",
    description: "Hizmetlerini ve fiyatlarini duzenlersin; tasarim omurgasi bozulmaz."
  },
  {
    title: "Galeri",
    description: "Gorsellerini toplar, kapak gorunumu icin uygun alanlari secersin."
  },
  {
    title: "Form ve Randevu",
    description: "Gelen talepleri tek bakista gorur, geri donus sirani ayarlarsin."
  },
  {
    title: "Destek ve AI",
    description: "Destek kayitlari ile Site AI ayarlari ayni sade panel mantiginda kalir."
  }
];

export const supportChannels = [
  {
    label: "Panel ici destek",
    value: "Yeni destek kaydi ac",
    hint: "Kisa bir aciklama yazman yeterli; teknik detay yazmak zorunda degilsin.",
    tone: "accent"
  },
  {
    label: "WhatsApp destek",
    value: "+90 850 000 00 00",
    hint: "Hizli operasyon sorulari icin yardim hattimiz.",
    tone: "warning"
  },
  {
    label: "E-posta",
    value: brand.supportEmail,
    hint: "Resmi bildirimler ve yazili takip bu kanal uzerinden ilerler.",
    tone: "positive"
  }
] satisfies InfoPair[];
