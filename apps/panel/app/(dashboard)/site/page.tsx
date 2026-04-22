import { InfoList, SurfaceCard } from "@ustaca/ui";

import { saveSiteCtaAction, saveSiteInfoAction } from "@/lib/actions";
import { requireCustomerSession } from "@/lib/auth";
import { resolvePanelFeedback } from "@/lib/feedback";
import {
  buildAssistantInfo,
  buildCtaInfo,
  buildSiteProfileInfo,
  getCustomerWorkspaceForSession
} from "@/lib/data";

export default async function SitePage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireCustomerSession();
  const workspace = await getCustomerWorkspaceForSession(session);
  const feedback = await resolvePanelFeedback(searchParams, {
    saved: {
      site_info_saved: "Site bilgileri ve iletisim alanlari kaydedildi.",
      site_cta_saved: "Ana mesaj ve buton alanlari guncellendi."
    },
    error: {
      site_info_invalid: "Lutfen site bilgileri alanlarini eksiksiz doldur.",
      site_cta_invalid: "Lutfen baslik ve CTA alanlarini tekrar kontrol et.",
      save_failed: "Kayit sirasinda bir sorun oldu. Birazdan tekrar deneyebilirsin."
    }
  });
  const siteProfileInfo = buildSiteProfileInfo(workspace);
  const ctaInfo = buildCtaInfo(workspace);
  const assistantInfo = buildAssistantInfo(workspace);
  const siteSettings = workspace.site.settings;
  const business = workspace.business;

  return (
    <div className="page-stack">
      {feedback ? (
        <p className={feedback.tone === "critical" ? "form-message form-message--critical" : "form-message"}>
          {feedback.message}
        </p>
      ) : null}

      <div className="two-column">
        <SurfaceCard
          eyebrow="site bilgileri"
          title="Sitenin gorunen yuzunu guncelle"
          description="Metinlerini ve iletisim bilgilerini kolayca yenilersin; tasarimin omurgasi guvenli bicimde korunur."
        >
          <InfoList items={siteProfileInfo} />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="cta / stil"
          title="Insanlari aksiyona tasiyan alanlar"
          description="Ana baslik ve buton metinleri, ziyaretcinin seni daha rahat anlamasi icin burada durur."
        >
          <InfoList items={ctaInfo} />
        </SurfaceCard>
      </div>

      <div className="two-column">
        <SurfaceCard
          eyebrow="duzenle"
          title="Temel site bilgilerini yenile"
          description="Buradaki alanlar sitende gordugun metinleri gunceller. Teknik yapi sabit kalir."
        >
          <form action={saveSiteInfoAction} className="form-stack">
            <div className="field">
              <label htmlFor="brandName">Isletme adi</label>
              <input defaultValue={siteSettings.brandName} id="brandName" name="businessName" />
            </div>

            <div className="field">
              <label htmlFor="heroSubtitle">Kisa tanitim metni</label>
              <textarea
                defaultValue={siteSettings.heroSubtitle}
                id="heroSubtitle"
                name="heroSubtitle"
                rows={4}
              />
            </div>

            <div className="three-column">
              <div className="field">
                <label htmlFor="phone">Telefon</label>
                <input defaultValue={business.phone} id="phone" name="phone" />
              </div>

              <div className="field">
                <label htmlFor="email">E-posta</label>
                <input defaultValue={business.email} id="email" name="email" />
              </div>

              <div className="field">
                <label htmlFor="city">Sehir</label>
                <input defaultValue={business.city} id="city" name="city" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="address">Adres</label>
              <textarea defaultValue={business.address} id="address" name="address" rows={3} />
            </div>

            <p className="form-message">
              Bu ilk surumde sadece icerigi guncellersin; sayfa duzeni ve teknik SEO omurgasi guvenli
              kalir.
            </p>

            <div className="button-row">
              <button className="button-primary" type="submit">
                Bilgileri guncelle
              </button>
              <button className="button-secondary" type="reset">
                Once taslak kaydet
              </button>
            </div>
          </form>
        </SurfaceCard>

        <SurfaceCard
          eyebrow="cta / stil"
          title="Ana mesaj ve butonlari netlestir"
          description="Ziyaretcinin seni daha hizli anlamasi icin ilk ekrandaki metinleri sade tutabilirsin."
        >
          <form action={saveSiteCtaAction} className="form-stack">
            <div className="field">
              <label htmlFor="heroTitle">Ana baslik</label>
              <input defaultValue={siteSettings.heroTitle} id="heroTitle" name="heroTitle" />
            </div>

            <div className="field">
              <label htmlFor="primaryCta">Ana buton metni</label>
              <input defaultValue={siteSettings.primaryCta} id="primaryCta" name="primaryCta" />
            </div>

            <div className="field">
              <label htmlFor="secondaryCta">Ikinci buton metni</label>
              <input
                defaultValue={siteSettings.secondaryCta}
                id="secondaryCta"
                name="secondaryCta"
              />
            </div>

            <div className="field">
              <label htmlFor="themeAccent">Vurgu rengi</label>
              <select defaultValue={siteSettings.themeAccent} id="themeAccent" name="themeAccent">
                <option value="violet-cyan">Mor + neon cyan</option>
                <option value="gold-cyan">Altin + neon cyan</option>
                <option value="violet-gold">Mor + altin</option>
              </select>
            </div>

            <div className="button-row">
              <button className="button-primary" type="submit">
                Butonlari guncelle
              </button>
              <button className="button-ghost" type="reset">
                Mevcut gorunumu koru
              </button>
            </div>
          </form>
        </SurfaceCard>
      </div>

      <SurfaceCard
        eyebrow="ai asistan"
        title="AI yardimci durumu"
        description="AI modulleri aciksa ziyaretciyi karsilar, bilgi verir ve dogru talep alanina yonlendirir."
      >
        <InfoList items={assistantInfo} />
      </SurfaceCard>
    </div>
  );
}
