import { DataTable, StatusBadge, SurfaceCard } from "@ustaca/ui";

import { requireCustomerSession } from "@/lib/auth";
import { buildFormRows, getCustomerWorkspaceForSession } from "@/lib/data";

export default async function FormRequestsPage() {
  const session = await requireCustomerSession();
  const workspace = await getCustomerWorkspaceForSession(session);
  const formRows = buildFormRows(workspace);

  return (
    <div className="page-stack">
      <SurfaceCard
        eyebrow="form talepleri"
        title="Teklif ve bilgi taleplerini gor"
        description="Karmasik CRM yerine sana geri donmen gereken temel bilgileri acik sekilde gosterir."
      >
        <DataTable
          caption="Teklif / iletisim form kayitlari"
          columns={[
            {
              key: "customer",
              header: "Kisi",
              render: (row) => (
                <div className="cell-stack">
                  <strong>{row.name}</strong>
                  <span className="cell-muted">{row.phone}</span>
                </div>
              )
            },
            {
              key: "service",
              header: "Talep",
              render: (row) => (
                <div className="cell-stack">
                  <strong>{row.service}</strong>
                  <span className="cell-muted">{row.source}</span>
                </div>
              )
            },
            {
              key: "message",
              header: "Mesaj",
              render: (row) => <span>{row.message}</span>
            },
            {
              key: "status",
              header: "Durum",
              render: (row) => <StatusBadge label={row.statusLabel} tone={row.statusTone} />
            },
            {
              key: "date",
              header: "Tarih",
              render: (row) => <span>{row.submittedAt}</span>
            }
          ]}
          rows={formRows}
        />
      </SurfaceCard>
    </div>
  );
}
