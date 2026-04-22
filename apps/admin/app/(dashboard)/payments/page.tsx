import { DataTable, InfoList, StatusBadge, SurfaceCard } from "@ustaca/ui";

import { getPaymentRows } from "@/lib/data";

const billingRules = [
  {
    label: "Ana ilke",
    value: "Once odeme, sonra tam aktivasyon",
    hint: "Trial sirasinda bile domain ve tam yayin acilimi odeme sonrasina baglidir.",
    tone: "accent"
  },
  {
    label: "Taksitler",
    value: "2, 3, 4, 5, 6, 9, 12",
    hint: "Tum urunler yillik hizmet mantiginda sunulur.",
    tone: "warning"
  },
  {
    label: "Gecikme",
    value: "Yayin askiya alinabilir",
    hint: "Odeme tamamlandiginda veri silinmeden tekrar aktive edilir.",
    tone: "critical"
  }
] as const;

export default async function PaymentsPage() {
  const paymentRows = await getPaymentRows();

  return (
    <div className="page-stack">
      <div className="two-column">
        <SurfaceCard
          eyebrow="odeme yonetimi"
          title="Yillik plan ve taksit operasyonu"
          description="Abonelik dili yerine yillik hizmet mantigi kullanildigi icin panel, toplam bedel ve taksit operasyonuna odaklanir."
        >
          <DataTable
            caption="Toplam tutar, vade ve gecikme durumlari"
            columns={[
              {
                key: "customer",
                header: "Musteri",
                render: (row) => (
                  <div className="cell-stack">
                    <strong>{row.businessName}</strong>
                    <span className="cell-muted">{row.planName}</span>
                  </div>
                )
              },
              {
                key: "amount",
                header: "Toplam Bedel",
                render: (row) => <strong>{row.amount}</strong>
              },
              {
                key: "status",
                header: "Odeme Durumu",
                render: (row) => <StatusBadge label={row.stateLabel} tone={row.stateTone} />
              },
              {
                key: "verification",
                header: "Dogrulama",
                render: (row) => (
                  <div className="cell-stack">
                    <StatusBadge label={row.verificationLabel} tone={row.verificationTone} />
                    <span className="cell-muted">{row.verifiedBy}</span>
                  </div>
                )
              },
              {
                key: "activation",
                header: "Aktivasyon Ops",
                render: (row) => (
                  <div className="cell-stack">
                    <StatusBadge label={row.activationLabel} tone={row.activationTone} />
                    <span className="cell-muted">{row.activationHoldReason}</span>
                  </div>
                )
              },
              {
                key: "due",
                header: "Vade",
                render: (row) => <span>{row.dueAt}</span>
              },
              {
                key: "action",
                header: "Hizli Islem",
                render: (row) => (
                  <div className="cell-stack">
                    <a className="text-link" href={row.href}>
                      Musteriyi ac
                    </a>
                    <span className="cell-muted">{row.orderId}</span>
                    <span className="cell-muted">{row.actionLabel}</span>
                  </div>
                )
              }
            ]}
            rows={paymentRows}
          />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="kurallar"
          title="Aktivasyon ve aski prensipleri"
          description="Odeme ekraninin gorevi finans kaydi tutmaktan cok yayin durumunu dogru yansitmak ve operasyonu tetiklemektir."
        >
          <InfoList items={[...billingRules]} />
        </SurfaceCard>
      </div>
    </div>
  );
}
