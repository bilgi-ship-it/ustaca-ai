import { DataTable, InfoList, StatusBadge, SurfaceCard } from "@ustaca/ui";

import { getDomainRows } from "@/lib/data";

const domainRules = [
  {
    label: "Trial yayin modeli",
    value: "musteriadi.ustaca.app",
    hint: "Trial gercek urunle gecici subdomain uzerinden akar.",
    tone: "accent"
  },
  {
    label: "Domain prensibi",
    value: "Disaridan domain kabul edilmez",
    hint: "Hedef domain trial basinda kaydedilir, teknik sureci operasyon yurutur.",
    tone: "warning"
  },
  {
    label: "Yonetim",
    value: "Kapali ve kontrollu sistem",
    hint: "Musteri DNS akisina dahil edilmez.",
    tone: "positive"
  }
] as const;

export default async function DomainsPage() {
  const domainRows = await getDomainRows();

  return (
    <div className="page-stack">
      <div className="two-column">
        <SurfaceCard
          eyebrow="domain yonetimi"
          title="Subdomain ve hedef domain gecisi"
          description="Domain akisinda musteri teknik surece sokulmaz; slug, trial yayini ve odeme sonrasi gecis ops merkezinden yonetilir."
        >
          <DataTable
            caption="Slug, aktif domain ve gecis durumu"
            columns={[
              {
                key: "business",
                header: "Isletme",
                render: (row) => <strong>{row.businessName}</strong>
              },
              {
                key: "domain",
                header: "Aktif Domain",
                render: (row) => (
                  <div className="cell-stack">
                    <strong>{row.hostname}</strong>
                    <span className="cell-muted">{row.sslLabel}</span>
                  </div>
                )
              },
              {
                key: "status",
                header: "Durum",
                render: (row) => <StatusBadge label={row.stateLabel} tone={row.stateTone} />
              },
              {
                key: "expiresAt",
                header: "Bitis",
                render: (row) => <span>{row.expiresAt}</span>
              },
              {
                key: "action",
                header: "Aksiyon",
                render: (row) => (
                  <a className="text-link" href={row.href}>
                    Musteriyi ac
                  </a>
                )
              }
            ]}
            rows={domainRows}
          />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="guardrail"
          title="Domain akisi neden kapali?"
          description="Ilk surumde sade ve tekrarlanabilir kalmak icin domain yonetimi tamamen operasyon tarafinda tutulur."
        >
          <InfoList items={[...domainRules]} />
        </SurfaceCard>
      </div>
    </div>
  );
}
