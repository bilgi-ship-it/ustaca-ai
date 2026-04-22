import { InfoList, StatusBadge, SurfaceCard } from "@ustaca/ui";

import { saveSiteAiAction } from "@/lib/actions";
import { requireCustomerSession } from "@/lib/auth";
import { resolvePanelFeedback } from "@/lib/feedback";
import { buildSiteAiSettings, getCustomerWorkspaceForSession } from "@/lib/data";

export default async function SiteAiPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireCustomerSession();
  const workspace = await getCustomerWorkspaceForSession(session);
  const feedback = await resolvePanelFeedback(searchParams, {
    saved: {
      site_ai_saved: "Site AI ayarlari kaydedildi."
    },
    error: {
      site_ai_invalid: "AI ayarlari alanlarini tekrar kontrol et.",
      save_failed: "AI ayarlari kaydedilirken bir sorun oldu. Birazdan tekrar deneyebilirsin."
    }
  });
  const { siteAssistant, whatsappAssistant } = buildSiteAiSettings(workspace);

  return (
    <div className="page-stack">
      {feedback ? (
        <p className={feedback.tone === "critical" ? "form-message form-message--critical" : "form-message"}>
          {feedback.message}
        </p>
      ) : null}

      <div className="two-column">
        <SurfaceCard
          eyebrow="site ai"
          title="Site icindeki AI yardimcisini yonet"
          description="Bu yardimci ziyaretciyi karsilar, hizmetlerini anlatir ve dogru talep alanina yonlendirir."
        >
          <form action={saveSiteAiAction} className="form-stack">
            <div className="field">
              <label htmlFor="siteAiEnabled">AI yardimci durumu</label>
              <select
                defaultValue={siteAssistant?.enabled ? "enabled" : "disabled"}
                id="siteAiEnabled"
                name="enabled"
              >
                <option value="enabled">Aktif</option>
                <option value="disabled">Pasif</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="siteAiGreeting">Karsilama mesaji</label>
              <textarea
                defaultValue={siteAssistant?.greeting ?? ""}
                id="siteAiGreeting"
                name="greeting"
                rows={4}
              />
            </div>

            <div className="field">
              <label htmlFor="siteAiGoal">Ana gorev</label>
              <input
                defaultValue={siteAssistant?.primaryGoal ?? ""}
                id="siteAiGoal"
                name="primaryGoal"
              />
            </div>

            <div className="field">
              <label htmlFor="siteAiRoute">Yonlendirme alani</label>
              <input
                defaultValue={siteAssistant?.escalationRoute ?? ""}
                id="siteAiRoute"
                name="escalationRoute"
              />
            </div>

            <div className="button-row">
              <button className="button-primary" type="submit">
                AI ayarlarini guncelle
              </button>
              <button className="button-secondary" type="reset">
                Yanit tonunu sade tut
              </button>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard
          eyebrow="durum"
          title="Bugunku AI gorunumu"
          description="Bu ozet, ziyaretciye gore AI yardimcisinin nasil davrandigini tek bakista gormen icin hazirlandi."
        >
          <InfoList
            items={[
              {
                label: "Site AI",
                value: siteAssistant?.enabled ? "Hazir" : "Kapali",
                hint: siteAssistant?.primaryGoal ?? "Henuz etkinlestirilmedi",
                tone: siteAssistant?.enabled ? "accent" : "neutral"
              },
              {
                label: "Yonlendirme",
                value: siteAssistant?.escalationRoute ?? "Panel formu",
                hint: "Ziyaretci daha fazla yardim isterse bu hatta yonlenir",
                tone: "positive"
              }
            ]}
          />
        </SurfaceCard>
      </div>

      <SurfaceCard
        eyebrow="whatsapp ai"
        title="Opsiyonel modulu simdiden gorebilirsin"
        description="Bu alan ilk surumde placeholder olarak durur. Satin alma durumuna gore daha sonra aktif edilir."
      >
        <div className="two-column">
          <div className="cell-stack">
            <StatusBadge
              label={whatsappAssistant?.enabled ? "aktif modul" : "opsiyonel"}
              tone={whatsappAssistant?.enabled ? "positive" : "neutral"}
            />
            <p className="help-copy">
              WhatsApp AI, ilk surumde sade bir bilgi ve yonlendirme modulu olarak konumlanir.
            </p>
          </div>

          <form className="form-stack">
            <div className="field">
              <label htmlFor="whatsappGreeting">Ornek karsilama mesaji</label>
              <textarea
                defaultValue={whatsappAssistant?.greeting ?? "Merhaba, nasil yardimci olabilirim?"}
                id="whatsappGreeting"
                name="whatsappGreeting"
                rows={3}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsappGoal">Beklenen kullanim</label>
              <input
                defaultValue={
                  whatsappAssistant?.primaryGoal ?? "Saat, adres ve temel hizmet bilgisini paylasmak"
                }
                id="whatsappGoal"
                name="whatsappGoal"
              />
            </div>

            <div className="button-row">
              <button className="button-primary" type="button">
                Modulu incele
              </button>
              <button className="button-ghost" type="button">
                Su an kapali kalsin
              </button>
            </div>
          </form>
        </div>
      </SurfaceCard>
    </div>
  );
}
