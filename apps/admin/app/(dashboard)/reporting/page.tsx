import { DataTable, InfoList, MetricGrid, StatusBadge, SurfaceCard } from "@ustaca/ui";

import { getDomainRows, getPaymentRows, getReportingBreakdown, getReportingMetrics, getSupportRows } from "@/lib/data";

export default async function ReportingPage() {
  const [metrics, breakdown, paymentRows, domainRows, supportRows] = await Promise.all([
    getReportingMetrics(),
    getReportingBreakdown(),
    getPaymentRows(),
    getDomainRows(),
    getSupportRows()
  ]);

  return (
    <div className="page-stack">
      <MetricGrid items={metrics} />

      <div className="two-column">
        <SurfaceCard
          eyebrow="raporlama ozeti"
          title="Donusum, gecikme ve operasyon dengesi"
          description="Ilk surumde agir BI yerine karar verdiren ozet sinyaller kullanilir."
        >
          <InfoList items={breakdown} />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="yorum"
          title="Panelin baktigi esas denge"
          description="Bu ekran sayi gostermek icin degil, hangi kuyruga once bakilacagini soylemek icin var."
        >
          <ul className="note-list">
            <li>Trial donusum hattini yavaslatan kayitlar once odeme ekraninda temizlenir.</li>
            <li>Domain riski ve destek yogunlugu birlikte bakilarak operasyon onceligi verilir.</li>
            <li>Tek kullanici ve tek site modeli sayesinde rapor kartlari sade kalir.</li>
          </ul>
        </SurfaceCard>
      </div>

      <div className="two-column">
        <SurfaceCard
          eyebrow="odeme riski"
          title="Gecikme ve dogrulama kuyrugu"
          description="Otomatik veya manuel dogrulama gerektiren odemeler burada izlenir."
        >
          <DataTable
            caption="Odeme risk listesi"
            columns={[
              {
                key: "customer",
                header: "Musteri",
                render: (row) => (
                  <a className="text-link" href={row.href}>
                    {row.businessName}
                  </a>
                )
              },
              {
                key: "status",
                header: "Durum",
                render: (row) => <StatusBadge label={row.stateLabel} tone={row.stateTone} />
              },
              {
                key: "verification",
                header: "Dogrulama",
                render: (row) => <StatusBadge label={row.verificationLabel} tone={row.verificationTone} />
              }
            ]}
            rows={paymentRows.slice(0, 5)}
          />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="domain ve destek"
          title="Yayin sagligi"
          description="Domain ve destek kuyruklari birlikte goruldugunde operasyon baskisi netlesir."
        >
          <div className="route-grid">
            <article className="mini-card">
              <h3>Domain sorunu</h3>
              <p>{domainRows.filter((row) => row.stateLabel !== "Bagli").length} kayit aktif takipte.</p>
            </article>
            <article className="mini-card">
              <h3>Acik destek</h3>
              <p>
                {
                  supportRows.filter(
                    (row) => row.stateLabel !== "Cozuldu" && row.stateLabel !== "Kapatildi"
                  ).length
                }{" "}
                kayit operasyon sirasi bekliyor.
              </p>
            </article>
            <article className="mini-card">
              <h3>Bagli domain</h3>
              <p>{domainRows.filter((row) => row.stateLabel === "Bagli").length} domain canli yayinda.</p>
            </article>
          </div>
        </SurfaceCard>
      </div>
    </div>
  );
}
