import { DataTable, StatusBadge, SurfaceCard } from "@ustaca/ui";

import { requireCustomerSession } from "@/lib/auth";
import { buildAppointmentRows, getCustomerWorkspaceForSession } from "@/lib/data";

export default async function AppointmentsPage() {
  const session = await requireCustomerSession();
  const workspace = await getCustomerWorkspaceForSession(session);
  const appointmentRows = buildAppointmentRows(workspace);

  return (
    <div className="page-stack">
      <SurfaceCard
        eyebrow="randevu talepleri"
        title="Randevu isteyenleri tek yerde topla"
        description="Kim ne zaman hizmet istiyor, bunu sade bir listede gorur ve rahatca geri donersin."
      >
        <DataTable
          caption="Randevu talepleri"
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
              header: "Hizmet",
              render: (row) => <strong>{row.service}</strong>
            },
            {
              key: "date",
              header: "Tercih",
              render: (row) => (
                <div className="cell-stack">
                  <strong>{row.requestedAt}</strong>
                  <span className="cell-muted">{row.notes}</span>
                </div>
              )
            },
            {
              key: "status",
              header: "Durum",
              render: (row) => <StatusBadge label={row.statusLabel} tone={row.statusTone} />
            }
          ]}
          rows={appointmentRows}
        />
      </SurfaceCard>
    </div>
  );
}
