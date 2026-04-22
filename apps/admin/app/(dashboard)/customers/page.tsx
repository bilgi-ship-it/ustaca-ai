import { DataTable, InfoList, StatusBadge, SurfaceCard } from "@ustaca/ui";

import { adminRoleGuardrails } from "@/lib/content";
import { getCustomerRows } from "@/lib/data";

export default async function CustomersPage() {
  const customerRows = await getCustomerRows();

  return (
    <div className="page-stack">
      <div className="two-column">
        <SurfaceCard
          eyebrow="musteri listesi"
          title="Tek hesap, tek isletme, tek site"
          description="Musteri listesindeki her kayit standart urun akisinin bir instance'idir; coklu sube ve ikinci kullanici ilk surumde yoktur."
        >
          <DataTable
            caption="Musteri durumu, odeme, domain ve trial ozeti"
            columns={[
              {
                key: "customer",
                header: "Musteri",
                render: (row) => (
                  <div className="cell-stack">
                    <a className="text-link" href={row.href}>
                      {row.businessName}
                    </a>
                    <span className="cell-muted">{row.ownerName}</span>
                  </div>
                )
              },
              {
                key: "sector",
                header: "Sektor",
                render: (row) => (
                  <div className="cell-stack">
                    <strong>{row.sector}</strong>
                    <span className="cell-muted">{row.planName}</span>
                  </div>
                )
              },
              {
                key: "status",
                header: "Durum",
                render: (row) => <StatusBadge label={row.statusLabel} tone={row.statusTone} />
              },
              {
                key: "payment",
                header: "Odeme",
                render: (row) => (
                  <div className="cell-stack">
                    <strong>{row.paymentSummary}</strong>
                    <span className="cell-muted">yillik plan karsiligi aylik gelir gorunumu</span>
                  </div>
                )
              },
              {
                key: "domain",
                header: "Domain",
                render: (row) => (
                  <div className="cell-stack">
                    <StatusBadge label={row.domainLabel} tone={row.domainTone} />
                    <span className="cell-muted">trial bitis: {row.trialEndsAt}</span>
                  </div>
                )
              },
              {
                key: "support",
                header: "Destek",
                render: (row) => <span>{row.openTickets}</span>
              },
              {
                key: "action",
                header: "Aksiyon",
                render: (row) => (
                  <a className="text-link" href={row.href}>
                    Detaya git
                  </a>
                )
              }
            ]}
            rows={customerRows}
          />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="operasyon notu"
          title="Musteri detayina gecmeden once"
          description="Liste ekraninda bile karar vermeyi hizlandiran guardrail'ler admin tarafinda net tutulur."
        >
          <InfoList items={adminRoleGuardrails} />
        </SurfaceCard>
      </div>
    </div>
  );
}
