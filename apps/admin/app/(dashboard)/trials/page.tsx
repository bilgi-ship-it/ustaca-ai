import { DataTable, StatusBadge, SurfaceCard } from "@ustaca/ui";

import { getTrialRows } from "@/lib/data";

export default async function TrialsPage() {
  const trialRows = await getTrialRows();

  return (
    <div className="page-stack">
      <SurfaceCard
        eyebrow="trial yonetimi"
        title="7 gunluk gercek urun denemeleri"
        description="Trial demoya benzer sahte bir alan degil; gercek urun gecici subdomain ile acilir, sure bitince erisim kapanir ama veri korunur."
        actions={
          <div className="card-actions">
            <a className="button-primary" href="/">
              Yeni trial kural seti
            </a>
            <a className="button-ghost" href="/domains">
              Domain gecisleri
            </a>
          </div>
        }
      >
        <DataTable
          caption="Trial baslatma, izleme ve ucretliye gecis hazirligi"
          columns={[
            {
              key: "customer",
              header: "Musteri",
              render: (row) => (
                <div className="cell-stack">
                  <strong>{row.businessName}</strong>
                  <span className="cell-muted">{row.ownerName}</span>
                </div>
              )
            },
            {
              key: "status",
              header: "Durum",
              render: (row) => <StatusBadge label={row.stateLabel} tone={row.stateTone} />
            },
            {
              key: "endDate",
              header: "Bitis",
              render: (row) => <span>{row.endDate}</span>
            },
            {
              key: "next",
              header: "Siradaki Adim",
              render: (row) => <span>{row.nextStep}</span>
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
          rows={trialRows}
        />
      </SurfaceCard>
    </div>
  );
}
