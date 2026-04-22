import { DataTable, InfoList, MetricGrid, StatusBadge, SurfaceCard, TimelineList } from "@ustaca/ui";

import { requireCustomerSession } from "@/lib/auth";
import { panelModuleCards } from "@/lib/content";
import {
  buildAssistantInfo,
  buildPanelAlerts,
  buildPanelMetrics,
  buildPanelNextActions,
  buildRecentRequestRows,
  getCustomerWorkspaceForSession
} from "@/lib/data";

export default async function PanelDashboardPage() {
  const session = await requireCustomerSession();
  const workspace = await getCustomerWorkspaceForSession(session);
  const metrics = buildPanelMetrics(workspace);
  const alerts = buildPanelAlerts(workspace);
  const nextActions = buildPanelNextActions(workspace);
  const assistantInfo = buildAssistantInfo(workspace);
  const recentRequestRows = buildRecentRequestRows(workspace);

  return (
    <div className="page-stack">
      <MetricGrid items={metrics} />

      <div className="two-column">
        <SurfaceCard
          eyebrow="siradaki adimlar"
          title="Bugun bakman gerekenler"
          description="Panel seni teknik detaylarla yormaz; once hangi isi yapman gerektigini acik sekilde soyler."
        >
          <TimelineList items={nextActions} />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="kisa uyari"
          title="Bugun aklinda olsun"
          description="Site, domain, odeme ve destek tarafinda o gun onemli olan kisa notlar burada gorunur."
        >
          <InfoList items={alerts} />
        </SurfaceCard>
      </div>

      <div className="two-column">
        <SurfaceCard
          eyebrow="son gelen talepler"
          title="Kacirmaman gereken son hareketler"
          description="Form ve randevu talepleri ayni bakista gorunur; once kimi arayacagini hizlica secersin."
        >
          <DataTable
            caption="En son gelen talepler"
            columns={[
              {
                key: "person",
                header: "Kisi",
                render: (row) => <strong>{row.person}</strong>
              },
              {
                key: "topic",
                header: "Talep",
                render: (row) => (
                  <div className="cell-stack">
                    <strong>{row.topic}</strong>
                    <span className="cell-muted">{row.channel}</span>
                  </div>
                )
              },
              {
                key: "date",
                header: "Tarih",
                render: (row) => <span>{row.dateLabel}</span>
              },
              {
                key: "status",
                header: "Durum",
                render: (row) => <StatusBadge label={row.statusLabel} tone={row.statusTone} />
              }
            ]}
            rows={recentRequestRows}
          />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="ai ve yardim"
          title="Hazir yardimci moduller"
          description="Acik olan AI modulleri seni ve ziyaretcilerini yonlendirmek icin hazir bekler."
        >
          <InfoList items={assistantInfo} />
        </SurfaceCard>
      </div>

      <SurfaceCard
        eyebrow="kapsam"
        title="Bu panelde neleri yonetebilirsin?"
        description="Icerigini rahatlatici bir dille guncellersin; sitenin teknik yapisi ise guvenli tarafta sabit kalir."
      >
        <div className="module-grid">
          {panelModuleCards.map((module) => (
            <article className="panel-mini-card" key={module.title}>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </article>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
