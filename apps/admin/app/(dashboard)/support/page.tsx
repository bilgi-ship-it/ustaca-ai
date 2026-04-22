import { DataTable, StatusBadge, SurfaceCard, TimelineList } from "@ustaca/ui";

import { supportHighlights } from "@/lib/content";
import { getSupportRows } from "@/lib/data";

export default async function SupportPage() {
  const supportRows = await getSupportRows();

  return (
    <div className="page-stack">
      <div className="two-column">
        <SurfaceCard
          eyebrow="destek merkezi"
          title="WhatsApp, panel ve e-posta kayitlari"
          description="Destek akisi acik, islemde, musteri bekleniyor, cozuldu ve kapatildi durumlariyla ilerler; operasyon notlari bu kuyruktan tetiklenir."
        >
          <DataTable
            caption="Tum musteri destek kayitlari"
            columns={[
              {
                key: "customer",
                header: "Musteri",
                render: (row) => <strong>{row.businessName}</strong>
              },
              {
                key: "subject",
                header: "Konu",
                render: (row) => (
                  <div className="cell-stack">
                    <strong>{row.subject}</strong>
                    <span className="cell-muted">oncelik: {row.priority}</span>
                  </div>
                )
              },
              {
                key: "status",
                header: "Durum",
                render: (row) => <StatusBadge label={row.stateLabel} tone={row.stateTone} />
              },
              {
                key: "updatedAt",
                header: "Guncellendi",
                render: (row) => <span>{row.updatedAt}</span>
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
            rows={supportRows}
          />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="destek akisi"
          title="Bildirim ve escalasyon mantigi"
          description="Ilk surumde operasyonel bildirimler e-posta tabanli kalsa da destek kayitlari panelde merkezi olarak izlenir."
        >
          <TimelineList items={supportHighlights} />
        </SurfaceCard>
      </div>
    </div>
  );
}
