import { DataTable, InfoList, MetricGrid, StatusBadge, SurfaceCard, TimelineList } from "@ustaca/ui";

import {
  adminLifecycle,
  adminModuleHighlights,
  adminRoleGuardrails
} from "@/lib/content";
import {
  processNotificationQueueAction,
  runPaymentOverdueSweepAction,
  runTrialExpirationSweepAction
} from "@/lib/actions";
import { getAdminMetrics, getCustomerRows, getSupportRows } from "@/lib/data";

export default async function AdminDashboardPage() {
  const [metrics, customerRows, supportRows] = await Promise.all([
    getAdminMetrics(),
    getCustomerRows(),
    getSupportRows()
  ]);

  return (
    <div className="page-stack">
      <MetricGrid items={metrics} />

      <SurfaceCard
        eyebrow="background jobs"
        title="Operasyonel sweep ve worker tetikleri"
        description="Cloud scheduler baglanmadan once trial bitisi, odeme gecikmesi ve bildirim kuyrugu ayni repo deseniyle manuel olarak tetiklenebilir."
      >
        <div className="route-grid">
          <form action={runTrialExpirationSweepAction} className="mini-card">
            <h3>Trial expiration sweep</h3>
            <p>Vadesi dolmus aktif trial kayitlarini `trial.expired` akisiyla isler.</p>
            <button className="button-primary" type="submit">
              Trial sweep calistir
            </button>
          </form>

          <form action={runPaymentOverdueSweepAction} className="mini-card">
            <h3>Payment overdue sweep</h3>
            <p>Vadesi gecmis odemeleri `payment.past_due` ve gerekirse `site.suspended` akisina tasir.</p>
            <button className="button-primary" type="submit">
              Odeme sweep calistir
            </button>
          </form>

          <form action={processNotificationQueueAction} className="mini-card">
            <h3>Notification worker</h3>
            <p>`queued` bildirimleri console sender ile isler; basari ve retry alanlarini gunceller.</p>
            <button className="button-secondary" type="submit">
              Kuyrugu isle
            </button>
          </form>
        </div>
      </SurfaceCard>

      <div className="two-column">
        <SurfaceCard
          eyebrow="yasam dongusu"
          title="Lead'den aktivasyona tek akis"
          description="Trial, odeme, domain ve askiya alma kurallari her musteri kaydinda ayni operasyon dilini kullanir."
        >
          <TimelineList items={adminLifecycle} />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="rol sinirlari"
          title="Sade yetki modeli"
          description="Super admin, operasyon admini ve musteri arasindaki rol sinirlari karmasik RBAC yerine net bir operasyon hatti sunar."
        >
          <InfoList items={adminRoleGuardrails} />
        </SurfaceCard>
      </div>

      <SurfaceCard
        eyebrow="operasyon odagi"
        title="Aksiyon isteyen musteri kayitlari"
        description="Liste artik statik mock yerine hazir projection katmanindan besleniyor; trial, odeme ve domain sinyalleri ayni tabloda okunuyor."
      >
        <DataTable
          caption="Musteri yasam dongusundeki oncelikli kayitlar"
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
              key: "status",
              header: "Durum",
              render: (row) => <StatusBadge label={row.statusLabel} tone={row.statusTone} />
            },
            {
              key: "payment",
              header: "Odeme",
              render: (row) => <span>{row.paymentSummary}</span>
            },
            {
              key: "domain",
              header: "Domain",
              render: (row) => <StatusBadge label={row.domainLabel} tone={row.domainTone} />
            },
            {
              key: "action",
              header: "Aksiyon",
              render: (row) => (
                <a className="text-link" href={row.href}>
                  Kaydi ac
                </a>
              )
            }
          ]}
          rows={customerRows.slice(0, 5)}
        />
      </SurfaceCard>

      <SurfaceCard
        eyebrow="destek sinyali"
        title="Platform genelindeki acik destek akisi"
        description="Acik veya musteri bekleyen destek konulari tek bakista operasyon kuyrugunu gosterir."
      >
        <div className="route-grid">
          {supportRows.slice(0, 6).map((ticket) => (
            <article className="mini-card" key={ticket.id}>
              <div className="detail-inline">
                <StatusBadge label={ticket.stateLabel} tone={ticket.stateTone} />
                <span className="cell-muted">{ticket.updatedAt}</span>
              </div>
              <h3>{ticket.businessName}</h3>
              <p>{ticket.subject}</p>
              <a className="text-link" href={ticket.href}>
                Musteri detayina git
              </a>
            </article>
          ))}
        </div>
      </SurfaceCard>

      <SurfaceCard
        eyebrow="moduller"
        title="Ilk surum admin kapsami"
        description="Kullanici talebindeki ana ekranlar ile belgeye eklenen operasyon modullerini ayni sistem mantiginda toplar."
      >
        <div className="route-grid">
          {adminModuleHighlights.map((module) => (
            <article className="mini-card" key={module.title}>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </article>
          ))}
        </div>
      </SurfaceCard>
    </div>
  );
}
