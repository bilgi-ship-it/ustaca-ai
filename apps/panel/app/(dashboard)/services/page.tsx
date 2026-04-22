import { DataTable, StatusBadge, SurfaceCard } from "@ustaca/ui";

import { saveFeaturedServiceAction, savePrimaryPlanAction } from "@/lib/actions";
import { requireCustomerSession } from "@/lib/auth";
import { resolvePanelFeedback } from "@/lib/feedback";
import {
  buildModuleRows,
  buildPricingRows,
  buildServiceRows,
  getCustomerWorkspaceForSession
} from "@/lib/data";

export default async function ServicesPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireCustomerSession();
  const workspace = await getCustomerWorkspaceForSession(session);
  const feedback = await resolvePanelFeedback(searchParams, {
    saved: {
      service_saved: "One cikan hizmet bilgisi kaydedildi.",
      plan_saved: "Ana fiyat plani guncellendi."
    },
    error: {
      service_invalid: "Hizmet alanlarini eksiksiz ve sayisal degerlerle doldur.",
      plan_invalid: "Paket alanlarini tekrar kontrol et.",
      save_failed: "Kayit sirasinda bir sorun oldu. Birazdan tekrar deneyebilirsin."
    }
  });
  const serviceRows = buildServiceRows(workspace);
  const pricingRows = buildPricingRows(workspace);
  const moduleRows = buildModuleRows(workspace);
  const featuredService = workspace.services.find((service) => service.featured) ?? workspace.services[0];
  const primaryPlan = workspace.pricingPlans[0];

  return (
    <div className="page-stack">
      {feedback ? (
        <p className={feedback.tone === "critical" ? "form-message form-message--critical" : "form-message"}>
          {feedback.message}
        </p>
      ) : null}

      <div className="two-column">
        <SurfaceCard
          eyebrow="hizli duzenleme"
          title="One cikan hizmetini guncelle"
          description="En cok talep almak istedigin hizmeti kisa aciklama ve fiyatla burada guclendirebilirsin."
        >
          <form action={saveFeaturedServiceAction} className="form-stack">
            <input name="serviceId" type="hidden" value={featuredService?.id ?? ""} />

            <div className="field">
              <label htmlFor="serviceName">Hizmet adi</label>
              <input
                defaultValue={featuredService?.name ?? ""}
                id="serviceName"
                name="name"
              />
            </div>

            <div className="field">
              <label htmlFor="serviceSummary">Kisa aciklama</label>
              <textarea
                defaultValue={featuredService?.summary ?? ""}
                id="serviceSummary"
                name="summary"
                rows={4}
              />
            </div>

            <div className="three-column">
              <div className="field">
                <label htmlFor="servicePrice">Baslangic fiyati</label>
                <input
                  defaultValue={featuredService?.priceFrom.toString() ?? ""}
                  id="servicePrice"
                  name="priceFrom"
                />
              </div>

              <div className="field">
                <label htmlFor="serviceDuration">Sure (dk)</label>
                <input
                  defaultValue={featuredService?.durationMinutes.toString() ?? ""}
                  id="serviceDuration"
                  name="durationMinutes"
                />
              </div>

              <div className="field">
                <label htmlFor="serviceFeatured">Vitrinde goster</label>
                <select
                  defaultValue={featuredService?.featured ? "yes" : "no"}
                  id="serviceFeatured"
                  name="featured"
                >
                  <option value="yes">Evet</option>
                  <option value="no">Hayir</option>
                </select>
              </div>
            </div>

            <div className="button-row">
              <button className="button-primary" type="submit">
                Hizmeti guncelle
              </button>
              <button className="button-secondary" type="reset">
                Yeni hizmet hazirla
              </button>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard
          eyebrow="paket duzeni"
          title="Teklifte gorunen fiyat blogu"
          description="Musteri adaylarinin daha rahat karar vermesi icin paket ismini ve icerigini sade tutabilirsin."
        >
          <form action={savePrimaryPlanAction} className="form-stack">
            <input name="planId" type="hidden" value={primaryPlan?.id ?? ""} />

            <div className="field">
              <label htmlFor="planName">Paket adi</label>
              <input defaultValue={primaryPlan?.name ?? ""} id="planName" name="name" />
            </div>

            <div className="field">
              <label htmlFor="planTagline">Kisa slogan</label>
              <input
                defaultValue={primaryPlan?.tagline ?? ""}
                id="planTagline"
                name="tagline"
              />
            </div>

            <div className="field">
              <label htmlFor="planPrice">Paket fiyati</label>
              <input
                defaultValue={primaryPlan?.price.toString() ?? ""}
                id="planPrice"
                name="price"
              />
            </div>

            <div className="field">
              <label htmlFor="planFeatures">Paket icerigi</label>
              <textarea
                defaultValue={primaryPlan?.features.join("\n") ?? ""}
                id="planFeatures"
                name="features"
                rows={5}
              />
            </div>

            <div className="button-row">
              <button className="button-primary" type="submit">
                Paketi guncelle
              </button>
              <button className="button-ghost" type="reset">
                Sadece onizleme yap
              </button>
            </div>
          </form>
        </SurfaceCard>
      </div>

      <SurfaceCard
        eyebrow="hizmet / fiyat"
        title="Hizmetlerini daha net anlat"
        description="Insanlarin senden daha kolay teklif almasi icin hizmet ve fiyat alanlarini sade bicimde guncellersin."
      >
        <DataTable
          caption="Ana hizmet listesi"
          columns={[
            {
              key: "name",
              header: "Hizmet",
              render: (row) => (
                <div className="cell-stack">
                  <strong>{row.name}</strong>
                  <span className="cell-muted">{row.summary}</span>
                </div>
              )
            },
            {
              key: "price",
              header: "Baslangic Fiyati",
              render: (row) => <strong>{row.priceFrom}</strong>
            },
            {
              key: "duration",
              header: "Sure",
              render: (row) => <span>{row.duration}</span>
            },
            {
              key: "featured",
              header: "Vitrin",
              render: (row) => <StatusBadge label={row.featuredLabel} tone={row.featuredTone} />
            }
          ]}
          rows={serviceRows}
        />
      </SurfaceCard>

      <div className="two-column">
        <SurfaceCard
          eyebrow="paketler"
          title="Teklifte kullanilan fiyat bloklari"
          description="Paketlerini tek tek degistirmen gerekmeden anlasilir kartlar halinde korursun."
        >
          <DataTable
            caption="Plan kartlari"
            columns={[
              {
                key: "plan",
                header: "Plan",
                render: (row) => (
                  <div className="cell-stack">
                    <strong>{row.name}</strong>
                    <span className="cell-muted">{row.tagline}</span>
                  </div>
                )
              },
              {
                key: "price",
                header: "Fiyat",
                render: (row) => <strong>{row.price}</strong>
              },
              {
                key: "cadence",
                header: "Tur",
                render: (row) => <span>{row.cadence}</span>
              },
              {
                key: "features",
                header: "Icerik",
                render: (row) => <span>{row.features}</span>
              }
            ]}
            rows={pricingRows}
          />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="urun modulleri"
          title="Acik olan moduller"
          description="Sana acilan ana urun ve ek hizmetler burada gorunur; satin alma durumuna gore otomatik acilip kapanir."
        >
          <DataTable
            columns={[
              {
                key: "label",
                header: "Modul",
                render: (row) => <strong>{row.label}</strong>
              },
              {
                key: "tier",
                header: "Seviye",
                render: (row) => <span>{row.tierLabel}</span>
              },
              {
                key: "state",
                header: "Durum",
                render: (row) => <StatusBadge label={row.stateLabel} tone={row.stateTone} />
              }
            ]}
            rows={moduleRows}
          />
        </SurfaceCard>
      </div>
    </div>
  );
}
