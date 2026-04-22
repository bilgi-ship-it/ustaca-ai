import { notFound } from "next/navigation";

import { DataTable, InfoList, StatusBadge, SurfaceCard } from "@ustaca/ui";

import {
  approveGoLiveAction,
  checkDomainAvailabilityAction,
  expireTrialAction,
  manualConfirmPaymentAction,
  markPaymentPastDueAction,
  reactivateCustomerAction,
  registerDomainAction,
  startTrialAction,
  suspendCustomerAction,
  verifyPaymentAction
} from "@/lib/actions";
import { adminRoleGuardrails } from "@/lib/content";
import { getAdminCustomerDetail } from "@/lib/data";

type CustomerDetailPageProps = {
  params: Promise<{
    customerId: string;
  }>;
};

export default async function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { customerId } = await params;
  const detail = await getAdminCustomerDetail(customerId);

  if (!detail) {
    notFound();
  }

  return (
    <div className="page-stack">
      <SurfaceCard
        eyebrow="musteri detay"
        title={detail.header.businessName}
        description={detail.header.description}
        actions={
          <div className="card-actions">
            <StatusBadge label={detail.header.statusLabel} tone={detail.header.statusTone} />
            <a className="button-secondary" href="/payments">
              Odeme yonetimi
            </a>
            <a className="button-ghost" href="/customers">
              Listeye don
            </a>
          </div>
        }
      >
        <div className="detail-hero">
          <div className="detail-inline">
            <strong>{detail.header.ownerName}</strong>
            <span className="cell-muted">{detail.header.ownerEmail}</span>
          </div>
          <p className="rule-copy">
            Trial, odeme, domain ve destek bloklari ayni kayit altinda birlestirilir; admin
            aksiyonu buradan dallanir.
          </p>
        </div>
      </SurfaceCard>

      <div className="two-column">
        <SurfaceCard
          eyebrow="temel bilgi"
          title="Musteri ve sahiplik"
          description="Tek kullanici ve tek isletme modeliyle gerekli sahiplik ve hedef domain verileri."
        >
          <InfoList items={detail.basicInfo} />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="site durumu"
          title="Yayin ve tema omurgasi"
          description="Site durumu, trial slug ve son yayin bilgisi tek blokta okunur."
        >
          <InfoList items={detail.siteInfo} />
        </SurfaceCard>
      </div>

      <div className="two-column">
        <SurfaceCard
          eyebrow="trial durumu"
          title="Deneme akisi"
          description="7 gunluk trial, gecici yayin ve sonraki gecis adimlari."
        >
          <InfoList items={detail.trialInfo} />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="odeme durumu"
          title="Aktivasyon ve dogrulama"
          description="Odeme sonucu, dogrulama sinyali ve fatura referansi operasyon kararini belirler."
        >
          <InfoList items={detail.paymentInfo} />
        </SurfaceCard>
      </div>

      <div className="two-column">
        <SurfaceCard
          eyebrow="domain durumu"
          title="Gecici ve hedef domain akisi"
          description="Kapali sistem domain operasyonu icin registrar, DNS hedefi ve SSL gorunumu."
        >
          <InfoList items={detail.domainInfo} />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="rol gorunurlugu"
          title="Bu kayitta kim ne yapabilir?"
          description="Operasyon akisinda rol sinirlari bu detay ekraninda da net kalir."
        >
          <InfoList items={adminRoleGuardrails} />
        </SurfaceCard>
      </div>

      <div className="two-column">
        <SurfaceCard
          eyebrow="urun ve moduller"
          title="Aktif urun paketi"
          description="Ana urun ve ek hizmetler ayni site kaydi uzerinden aktif veya kapali tutulur."
        >
          <DataTable
            caption="Musterinin aktif urun ve modulleri"
            columns={[
              {
                key: "module",
                header: "Modul",
                render: (row) => <strong>{row.label}</strong>
              },
              {
                key: "tier",
                header: "Tip",
                render: (row) => <span>{row.tierLabel}</span>
              },
              {
                key: "state",
                header: "Durum",
                render: (row) => <StatusBadge label={row.stateLabel} tone={row.stateTone} />
              }
            ]}
            rows={detail.moduleRows}
          />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="operasyon notu"
          title="Takip edilmesi gereken sinyaller"
          description="Destek gecmisi, ozel proje etiketi ve operasyon notlari burada toplanir."
        >
          <InfoList items={detail.operationNotes} />
        </SurfaceCard>
      </div>

      <SurfaceCard
        eyebrow="operasyon aksiyonlari"
        title="Trial, odeme ve domain operasyonu"
        description="Ops admin bu bloktan yasam dongusu adimlarini tetikler. Tum aksiyonlar audit log'a yazilir."
      >
        <div className="two-column">
          <form action={startTrialAction} className="form-stack">
            <input name="customerId" type="hidden" value={detail.ids.customerId} />
            <div className="field">
              <label>Trial gun sayisi</label>
              <input defaultValue={7} min={1} name="daysGranted" type="number" />
            </div>
            <div className="field">
              <label>Plan adi</label>
              <input defaultValue="Web Sitesi Yillik" name="planName" />
            </div>
            <button className="button-primary" type="submit">
              Trial baslat
            </button>
          </form>

          {detail.ids.trialId ? (
            <div className="form-stack">
              <form action={expireTrialAction}>
                <input name="trialId" type="hidden" value={detail.ids.trialId} />
                <button className="button-secondary" type="submit">
                  Trial'i sonlandir
                </button>
              </form>
              <span className="cell-muted">
                Mevcut trial: {detail.ids.trialStatus ?? "-"} · go-live acilisi odeme onayi sonrasi ayrica verilir
              </span>
            </div>
          ) : (
            <div className="cell-stack">
              <span className="cell-muted">Aktif trial kaydi yok.</span>
            </div>
          )}
        </div>

        {detail.ids.paymentId ? (
          <div className="two-column">
            <form action={verifyPaymentAction} className="form-stack">
              <input name="paymentId" type="hidden" value={detail.ids.paymentId} />
              <input name="email" type="hidden" value={detail.ids.ownerEmail} />
              <input
                name="amount"
                type="hidden"
                value={String(detail.ids.paymentAmount ?? 0)}
              />
              <div className="field">
                <label>Plan tier (API)</label>
                <input defaultValue="standard" name="tier" />
              </div>
              <div className="field">
                <label>Ops notu</label>
                <input name="manualNote" placeholder="API kontrol kaydi" />
              </div>
              <button className="button-primary" type="submit">
                API ile dogrula
              </button>
            </form>

            <form action={manualConfirmPaymentAction} className="form-stack">
              <input name="paymentId" type="hidden" value={detail.ids.paymentId} />
              <div className="field">
                <label>Manuel karar</label>
                <select defaultValue="yes" name="confirm">
                  <option value="yes">Onayla</option>
                  <option value="no">Manuel incelemeye al</option>
                </select>
              </div>
              <div className="field">
                <label>Siparis / referans</label>
                <input name="orderId" placeholder="ORDER-..." />
              </div>
              <div className="field">
                <label>Ozet</label>
                <input name="summary" placeholder="Banka havalesi dogrulandi" />
              </div>
              <div className="field">
                <label>Ops notu</label>
                <input name="manualNote" placeholder="Eksik evrak yok, yayina hazir" />
              </div>
              <div className="button-row">
                <button className="button-primary" type="submit">
                  Manuel kaydet
                </button>
              </div>
            </form>

            <div className="form-stack">
              <form action={approveGoLiveAction} className="form-stack">
                <input name="paymentId" type="hidden" value={detail.ids.paymentId} />
                <div className="field">
                  <label>Go-live notu</label>
                  <input name="manualNote" placeholder="Icerik ve yayin kontrolu tamam" />
                </div>
                <div className="field">
                  <label>Ozet</label>
                  <input name="summary" placeholder="Go-live onayi verildi" />
                </div>
                <button className="button-primary" type="submit">
                  Go-live onayi ver
                </button>
              </form>

              <form action={markPaymentPastDueAction}>
                <input name="paymentId" type="hidden" value={detail.ids.paymentId} />
                <button className="button-secondary" type="submit">
                  Gecikmeye dustu olarak isaretle
                </button>
              </form>
            </div>
          </div>
        ) : null}

        <div className="two-column">
          <form action={suspendCustomerAction} className="form-stack">
            <input name="customerId" type="hidden" value={detail.ids.customerId} />
            <div className="field">
              <label>Aski sebebi</label>
              <input defaultValue="odeme bekleniyor" name="reason" />
            </div>
            <button className="button-secondary" type="submit">
              Yayini askiya al
            </button>
          </form>
          <form action={reactivateCustomerAction}>
            <input name="customerId" type="hidden" value={detail.ids.customerId} />
            <button className="button-primary" type="submit">
              Yeniden aktiflestir
            </button>
          </form>
        </div>

        {detail.ids.domainId ? (
          <div className="two-column">
            <form action={checkDomainAvailabilityAction} className="form-stack">
              <input name="domainId" type="hidden" value={detail.ids.domainId} />
              <div className="field">
                <label>Domain</label>
                <input defaultValue={detail.ids.domainHostname ?? ""} name="hostname" />
              </div>
              <button className="button-primary" type="submit">
                Uygunluk sorgula
              </button>
            </form>

            <form action={registerDomainAction} className="form-stack">
              <input name="domainId" type="hidden" value={detail.ids.domainId} />
              <input name="hostname" type="hidden" value={detail.ids.domainHostname ?? ""} />
              <div className="field">
                <label>Firebase id token</label>
                <input name="firebaseIdToken" placeholder="eyJ..." />
              </div>
              <button className="button-primary" type="submit">
                Domain kaydet ve bagla
              </button>
            </form>
          </div>
        ) : null}
      </SurfaceCard>

      <SurfaceCard
        eyebrow="destek gecmisi"
        title="Acik ve kapanmis ticket akisi"
        description="Musteri destek kayitlari, kategori ve operasyon notlariyla birlikte okunur."
      >
        <DataTable
          caption="Destek gecmisi"
          columns={[
            {
              key: "subject",
              header: "Konu",
              render: (row) => (
                <div className="cell-stack">
                  <strong>{row.subject}</strong>
                  <span className="cell-muted">{row.category}</span>
                </div>
              )
            },
            {
              key: "priority",
              header: "Oncelik",
              render: (row) => <span>{row.priority}</span>
            },
            {
              key: "status",
              header: "Durum",
              render: (row) => <StatusBadge label={row.statusLabel} tone={row.statusTone} />
            },
            {
              key: "updatedAt",
              header: "Guncellendi",
              render: (row) => <span>{row.updatedAt}</span>
            },
            {
              key: "opsNote",
              header: "Operasyon Notu",
              render: (row) => <span className="cell-muted">{row.opsNote}</span>
            }
          ]}
          rows={detail.supportRows}
        />
      </SurfaceCard>
    </div>
  );
}
