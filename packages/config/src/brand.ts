export const brand = {
  name: "Ustaca AI",
  tagline: "Tek kullanicili, tek isletmeli SaaS site omurgasi",
  supportEmail: "bilgi@ustacacozum.com",
  adminAppName: "Ustaca Admin",
  panelAppName: "Ustaca Panel"
} as const;

export const appRegistry = [
  {
    key: "web",
    name: "Web",
    summary: "Karanlik neon landing deneyimi ve donusum odakli public site."
  },
  {
    key: "admin",
    name: "Admin",
    summary: "Musteri, trial, odeme, domain ve destek operasyonlari icin merkezi ekran."
  },
  {
    key: "panel",
    name: "Panel",
    summary: "Tek isletmenin site, teklif, odeme ve talep yonetimi icin musteri cockpit'i."
  }
] as const;
