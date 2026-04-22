import { defaultGenerationPipeline, themeFamilyCatalog } from "@ustaca/ai";
import { appRegistry, brand } from "@ustaca/config";
import { emailTemplates } from "@ustaca/email";
import type { InfoPair, MetricItem, TimelineItem } from "@ustaca/types";

export const heroMetrics: MetricItem[] = [
  {
    label: "Trial",
    value: "7 gun",
    detail: "Demo degil, gercek urun gecici slug ile acilir.",
    tone: "accent"
  },
  {
    label: "Tema Ailesi",
    value: "3-5",
    detail: "Standartlasmis ama birbirinin aynisi olmayan uretim varyasyonlari.",
    tone: "positive"
  },
  {
    label: "Taksit",
    value: "12'ye kadar",
    detail: "1 yillik hizmet mantigi, kontrollu aktivasyon ve aski kuralari.",
    tone: "warning"
  },
  {
    label: "Panel Yuzu",
    value: "3 uygulama",
    detail: "Web, admin ve musteri paneli ayni tasarim sistemini kullanir.",
    tone: "accent"
  }
];

export const promiseInfo: InfoPair[] = [
  {
    label: "Ana urun",
    value: "Web Sitesi",
    hint: "Kucuk isletmeler icin hizli, uygun fiyatli ve tekrar uretilebilir giris urunu.",
    tone: "accent"
  },
  {
    label: "Cekirdek kural",
    value: "Tek kullanici = tek isletme = tek site",
    hint: "Sadelik marji korur, destek yukunu dusurur.",
    tone: "positive"
  },
  {
    label: "Domain modeli",
    value: "Kapali ve operasyon yonetimli",
    hint: "Disaridan domain kabul edilmez, teknik surec musteriden gizlenir.",
    tone: "warning"
  },
  {
    label: "Aktivasyon",
    value: "Once odeme, sonra tam yayin",
    hint: "Odeme gecikirse yayin askiya alinir; veri korunur.",
    tone: "critical"
  }
];

export const addonServices = [
  "Haritada Cik",
  "Yorum Topla",
  "Menu Fiyat",
  "Randevu Iste",
  "Fiyat Sor / Teklif Al",
  "Cok Dilli Site",
  "Gorunurluk Raporu",
  "Site AI Asistani",
  "WhatsApp AI Asistani"
];

export const howItWorksTimeline: TimelineItem[] = [
  {
    label: "Kayit ve veri toplama",
    detail: "Sektor, hizmet, renk, CTA ve hedef domain bilgisi kisa alanlarla toplanir.",
    meta: "1",
    tone: "accent"
  },
  {
    label: "AI blueprint ve uretim",
    detail: "Tema ailesi secilir, kontrollu spec uretilir ve site generation pipeline calisir.",
    meta: "2",
    tone: "warning"
  },
  {
    label: "Trial, odeme, aktivasyon",
    detail: "Site slug.ustaca.app uzerinde acilir; odeme tamamlaninca tam aktivasyon ve domain gecisi baslar.",
    meta: "3",
    tone: "positive"
  }
];

export const pipelineTimeline: TimelineItem[] = defaultGenerationPipeline.map((stage) => ({
  label: stage.stage.toUpperCase(),
  detail: stage.description,
  meta: "site_generation_pipeline",
  tone: stage.stage === "publish" ? "positive" : stage.stage === "validate" ? "warning" : "accent"
}));

export const architectureInfo: InfoPair[] = [
  {
    label: "Deploy omurgasi",
    value: "Cloud Run + GitHub monorepo",
    hint: "Dev / staging / prod ayrimi ile moduler tek API yaklasimi.",
    tone: "accent"
  },
  {
    label: "Veri katmani",
    value: "Firestore + audit odakli domain modeli",
    hint: "Musteri, site, trial, odeme, domain, destek ve AI kayitlari.",
    tone: "positive"
  },
  {
    label: "Arka plan",
    value: "Cloud Tasks + Scheduler",
    hint: "Trial bitisi, odeme gecikmesi ve bildirim olaylari icin.",
    tone: "warning"
  },
  {
    label: "Bildirim",
    value: "E-posta once, diger kanallar sonra",
    hint: `${brand.supportEmail} uzerinden baslayan kontrol odakli kanal mantigi.`,
    tone: "critical"
  }
];

export const roadmapCards = [
  {
    range: "0-6 ay",
    title: "Omurga ve satisa cikis",
    points: [
      "Auth, panel, trial, odeme, domain, e-posta ve temel loglama",
      "Web Sitesi ana urununun satilabilir hale gelmesi",
      "Haritada Cik, Yorum Topla, Menu Fiyat, Randevu ve Teklif modulleri"
    ]
  },
  {
    range: "6-12 ay",
    title: "Olgunlastirma ve verimlilik",
    points: [
      "Tema varyasyonlari ve sektor bazli blueprint iyilestirmeleri",
      "Daha iyi raporlama, odeme takibi ve destek etiketleme",
      "Site AI, WhatsApp AI ve Cok Dilli modullerin kontrollu guclenmesi"
    ]
  },
  {
    range: "12-24 ay",
    title: "Derinlesme ve olcekleme",
    points: [
      "Gercekten calisan sektorlerde derinlesme",
      "Mobil uygulama ve coklu kullanici gibi alanlara veriye bakarak karar verme",
      "Premium tema, yeni kanal ve urun hatlarini ayiklayarak buyutme"
    ]
  }
];

export const themeCards = Object.values(themeFamilyCatalog).map((theme) => ({
  title: theme.label,
  description: theme.intent
}));

export const notificationEvents = Object.values(emailTemplates).map((template) => template.subject);

export const productSurfaces = appRegistry;

export const sectorCards = [
  {
    title: "Berber / Kuafor",
    description: "Hizli fiyat, WhatsApp yonlendirmesi ve randevu talebi ile hizli donusum."
  },
  {
    title: "Lokanta / Kafe",
    description: "Menu fiyat ve kampanya alanlariyla her zaman guncel gorunum."
  },
  {
    title: "Klinik / Guzellik",
    description: "Guven hissi, premium vitrin ve net CTA ile hasta / musteri kazanim akisi."
  },
  {
    title: "Tamir / Tesisat",
    description: "Mobil agirlikli, saha hizmeti odakli, hizli teklif ve arama yonlendirmesi."
  },
  {
    title: "Emlak / Danismanlik",
    description: "Portfoy, randevu ve bilgi talebi alanlariyla sade ama profesyonel vitrin."
  },
  {
    title: "Diger yerel isletmeler",
    description: "Tema ailesi ve moduller sektor hissine gore esneklesir ama sistem dagilmaz."
  }
];

export const pricingCards = [
  {
    title: "Web Sitesi",
    price: "Ana fiyat burada sabitlenir",
    subtitle: "Ana urun",
    bullets: [
      "1 yillik hizmet mantigi",
      "Tek kullanici, tek site, tek isletme",
      "Trial ile gor, odeme ile tam aktivasyon al"
    ]
  },
  {
    title: "Donusum Modulleri",
    price: "Ek hizmet",
    subtitle: "Sepet buyutucu",
    bullets: [
      "Randevu Iste",
      "Fiyat Sor / Teklif Al",
      "Menu Fiyat"
    ]
  },
  {
    title: "AI ve Gorunurluk",
    price: "Ek hizmet",
    subtitle: "Premium katman",
    bullets: [
      "Site AI Asistani",
      "WhatsApp AI Asistani",
      "Haritada Cik ve Yorum Topla"
    ]
  }
];

export const trustInfo: InfoPair[] = [
  {
    label: "Neden Ustaca AI",
    value: "AI + insan operasyon dengesi",
    hint: "Yalnizca otomasyon degil, kontrollu teslim ve destek mantigi.",
    tone: "accent"
  },
  {
    label: "Guncellenebilirlik",
    value: "Musteri panelden kucuk duzenlemeleri yapar",
    hint: "Tam serbest editor verilmeden bagimsizlik saglanir.",
    tone: "positive"
  },
  {
    label: "Hiz hissi",
    value: "Mobil once ve net CTA",
    hint: "Telefon kullanan kucuk isletme sahibi icin okunur ve hizli akis.",
    tone: "warning"
  },
  {
    label: "Guven",
    value: "Gercek teslim, loglanan operasyon",
    hint: "Trial, odeme, domain ve destek olaylari iz birakir.",
    tone: "critical"
  }
];

export const faqInfo: InfoPair[] = [
  {
    label: "Trial nasil calisir?",
    value: "7 gun boyunca gercek urun slug.ustaca.app uzerinde yayinda olur.",
    hint: "Demo degil, gercek sitedir; sure bitince erisim kapanir ama veri tutulur.",
    tone: "accent"
  },
  {
    label: "Domain nasil oluyor?",
    value: "Hedef domain trial basinda kaydedilir, teknik sureci operasyon yonetir.",
    hint: "Ilk surumde disaridan domain kabul edilmez.",
    tone: "warning"
  },
  {
    label: "Icerigim hazir degilse?",
    value: "Sistem sizi gorsel ve icerik eksikliginde durdurmaz.",
    hint: "Baslangic yapi AI/tasarim destegi ile kurulur, sonra guncellenir.",
    tone: "positive"
  },
  {
    label: "Odeme gecikirse ne olur?",
    value: "Yayin askiya alinabilir fakat veri silinmez.",
    hint: "Odeme tamamlaninca tekrar aktive edilebilir.",
    tone: "critical"
  }
];
