import { DataTable, InfoList, StatusBadge, SurfaceCard } from "@ustaca/ui";

import { requireCustomerSession } from "@/lib/auth";
import {
  buildBillingInfo,
  buildPaymentRows,
  getCustomerWorkspaceForSession
} from "@/lib/data";

export default async function BillingPage() {
  const session = await requireCustomerSession();
  const workspace = await getCustomerWorkspaceForSession(session);
  const billingInfo = buildBillingInfo(workspace);
  const paymentRows = buildPaymentRows(workspace);

  return (
    <div className="page-stack">
      <div className="two-column">
        <SurfaceCard
          eyebrow="odeme durumu"
          title="Odeme ve aktivasyon ozeti"
          description="Sana en gerekli bilgiler gosterilir: toplam tutar, vade ve gerekiyorsa bir sonraki adim."
        >
          <InfoList items={billingInfo} />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="finans guardrail"
          title="Bu ekran neden bu kadar sade?"
          description="Amacimiz seni finans detayiyle bogmak degil; odeme durumunu rahat anlamani saglamak."
        >
          <p className="help-copy">
            Gecikme olursa yayin gecici olarak beklemeye alinabilir. Odeme tamamlandiginda sistem kaldigi
            yerden devam eder ve veri korunur.
          </p>
        </SurfaceCard>
      </div>

      <SurfaceCard
        eyebrow="kayitlar"
        title="Odeme gecmisin"
        description="Kurulum ve ana hizmet kayitlarini ayni yerde gorur, gerekirse destekten yardim istersin."
      >
        <DataTable
          caption="Odeme kayitlari"
          columns={[
            {
              key: "plan",
              header: "Urun",
              render: (row) => <strong>{row.planName}</strong>
            },
            {
              key: "amount",
              header: "Tutar",
              render: (row) => <strong>{row.amount}</strong>
            },
            {
              key: "model",
              header: "Model",
              render: (row) => (
                <div className="cell-stack">
                  <strong>{row.billingModel}</strong>
                  <span className="cell-muted">{row.installments}</span>
                </div>
              )
            },
            {
              key: "due",
              header: "Vade",
              render: (row) => <span>{row.dueAt}</span>
            },
            {
              key: "status",
              header: "Durum",
              render: (row) => <StatusBadge label={row.statusLabel} tone={row.statusTone} />
            }
          ]}
          rows={paymentRows}
        />
      </SurfaceCard>
    </div>
  );
}
