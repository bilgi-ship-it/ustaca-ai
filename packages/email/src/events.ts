import { z } from "zod";

import { brand } from "@ustaca/config";

export const notificationEventSchema = z.enum([
  "user.registered",
  "trial.started",
  "trial.expired",
  "payment.received",
  "payment.past_due",
  "site.activated",
  "site.suspended",
  "support.created",
  "special_project.flagged",
  "site_generation.failed",
  "domain.issue_detected"
]);

export type NotificationEvent = z.infer<typeof notificationEventSchema>;

export const emailTemplates: Record<
  NotificationEvent,
  {
    subject: string;
    preview: string;
  }
> = {
  "user.registered": {
    subject: `${brand.name} | Yeni uyelik`,
    preview: "Yeni trial veya musteri kaydi olusturuldu."
  },
  "trial.started": {
    subject: `${brand.name} | Trial basladi`,
    preview: "7 gunluk gercek urun trial'i aktif edildi."
  },
  "trial.expired": {
    subject: `${brand.name} | Trial kapandi`,
    preview: "Trial suresi doldu, yayin askiya alinmis olabilir."
  },
  "payment.received": {
    subject: `${brand.name} | Odeme alindi`,
    preview: "Odeme kaydi islenerek aktivasyon akisina gecildi."
  },
  "payment.past_due": {
    subject: `${brand.name} | Odeme gecikmesi`,
    preview: "Vadesi gecen odeme nedeniyle yayin riski olustu."
  },
  "site.activated": {
    subject: `${brand.name} | Yayin aktif`,
    preview: "Odeme ve operasyon onayi tamamlandi, yayin acildi."
  },
  "site.suspended": {
    subject: `${brand.name} | Yayin askiya alindi`,
    preview: "Site yayini odeme veya operasyon sebebiyle askiya alindi."
  },
  "support.created": {
    subject: `${brand.name} | Yeni destek talebi`,
    preview: "Panel veya destek hattindan yeni kayit olustu."
  },
  "special_project.flagged": {
    subject: `${brand.name} | Ozel proje etiketi`,
    preview: "Standart akistan cikan kayit teknik degerlendirmeye alindi."
  },
  "site_generation.failed": {
    subject: `${brand.name} | Site uretim hatasi`,
    preview: "Site generation pipeline hata verdi."
  },
  "domain.issue_detected": {
    subject: `${brand.name} | Domain sorunu`,
    preview: "Domain gecis veya DNS asamasinda aksiyon gerekiyor."
  }
};
