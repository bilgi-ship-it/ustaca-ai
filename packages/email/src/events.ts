import { z } from "zod";

import { brand } from "@ustaca/config";

export const notificationEventSchema = z.enum([
  "user_registered",
  "trial_started",
  "trial_expired",
  "payment_received",
  "payment_past_due",
  "site_suspended",
  "support_created",
  "special_project_flagged",
  "site_generation_failed",
  "domain_issue_detected"
]);

export type NotificationEvent = z.infer<typeof notificationEventSchema>;

export const emailTemplates: Record<
  NotificationEvent,
  {
    subject: string;
    preview: string;
  }
> = {
  user_registered: {
    subject: `${brand.name} | Yeni uyelik`,
    preview: "Yeni trial veya musteri kaydi olusturuldu."
  },
  trial_started: {
    subject: `${brand.name} | Trial basladi`,
    preview: "7 gunluk gercek urun trial'i aktif edildi."
  },
  trial_expired: {
    subject: `${brand.name} | Trial kapandi`,
    preview: "Trial suresi doldu, yayin askiya alinmis olabilir."
  },
  payment_received: {
    subject: `${brand.name} | Odeme alindi`,
    preview: "Odeme kaydi islenerek aktivasyon akisina gecildi."
  },
  payment_past_due: {
    subject: `${brand.name} | Odeme gecikmesi`,
    preview: "Vadesi gecen odeme nedeniyle yayin riski olustu."
  },
  site_suspended: {
    subject: `${brand.name} | Yayin askiya alindi`,
    preview: "Site yayini odeme veya operasyon sebebiyle askiya alindi."
  },
  support_created: {
    subject: `${brand.name} | Yeni destek talebi`,
    preview: "Panel veya destek hattindan yeni kayit olustu."
  },
  special_project_flagged: {
    subject: `${brand.name} | Ozel proje etiketi`,
    preview: "Standart akistan cikan kayit teknik degerlendirmeye alindi."
  },
  site_generation_failed: {
    subject: `${brand.name} | Site uretim hatasi`,
    preview: "Site generation pipeline hata verdi."
  },
  domain_issue_detected: {
    subject: `${brand.name} | Domain sorunu`,
    preview: "Domain gecis veya DNS asamasinda aksiyon gerekiyor."
  }
};

