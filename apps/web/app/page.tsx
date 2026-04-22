import { InfoList, MetricGrid, SurfaceCard, TimelineList } from "@ustaca/ui";

import {
  addonServices,
  architectureInfo,
  faqInfo,
  heroMetrics,
  howItWorksTimeline,
  notificationEvents,
  pipelineTimeline,
  pricingCards,
  productSurfaces,
  promiseInfo,
  roadmapCards,
  sectorCards,
  themeCards
} from "@/lib/content";

export default function WebPage() {
  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <div className="marketing-brand">
          <span className="marketing-brand__dot" />
          <div className="marketing-brand__copy">
            <p>Ustaca Cozum</p>
            <h1>Ustaca AI</h1>
          </div>
        </div>

        <nav className="marketing-nav" aria-label="marketing navigation">
          <a href="#urun">Urun</a>
          <a href="#mimari">Mimari</a>
          <a href="#yol-haritasi">Yol Haritasi</a>
          <a href="#iletisim">Iletisim</a>
        </nav>
      </header>

      <section className="hero-grid">
        <SurfaceCard
          className="hero-panel"
          eyebrow="startup estetigi"
          title="Kucuk isletmeler icin gercek site, gercek panel, kontrollu AI"
          description="Ustaca AI; web sitesi ana urununu, trial -> odeme -> aktivasyon zincirini ve admin/musteri operasyonunu tek omurgada birlestiren karanlik neon bir SaaS iskeleti sunar."
          actions={
            <div className="button-row">
              <a className="button-primary" href="/how-it-works">
                Canli Demoyu Gor
              </a>
              <a className="button-secondary" href="/contact">
                Demo Talep Et
              </a>
            </div>
          }
        >
          <div className="hero-copy">
            <p>
              Demo degil gercek urun, tek kullanici ve tek site mantigi, kapali domain operasyonu ve
              yillik hizmet modeli ile kucuk isletmenin anlayabilecegi kadar sade ama startup gibi hissettiren
              bir deneyim.
            </p>
            <div className="hero-pills">
              <span>tek kullanici</span>
              <span>tek isletme</span>
              <span>tek site</span>
              <span>yapi bozulmaz panel</span>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard
          eyebrow="urun vaadi"
          title="Uygun fiyat, hizli kurulum, kontrollu buyume"
          description="Marj buluttan degil, standartlasmis urun ve dusuk manuel is yukunden korunur."
        >
          <InfoList items={promiseInfo} />
        </SurfaceCard>
      </section>

      <section className="marketing-section" id="urun">
        <div className="section-head">
          <div>
            <p className="eyebrow">cekirdek urun</p>
            <h2 className="section-title">Tek platform, uc gorunum</h2>
          </div>
          <p className="surface-meta">Web, admin ve musteri paneli ayni tasarim sistemini paylasir.</p>
        </div>

        <MetricGrid items={heroMetrics} />

        <div className="surface-grid">
          {productSurfaces.map((surface) => (
            <article className="feature-card" key={surface.key}>
              <h3>{surface.name}</h3>
              <p>{surface.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section">
        <div className="two-column">
          <SurfaceCard
            eyebrow="nasil calisir"
            title="Kayit -> uretim -> teslim"
            description="Uzun ama daginik olmayan ana sayfa akisi, kullaniciyi 3 adimda korkutmadan urune tasir."
          >
            <TimelineList items={howItWorksTimeline} />
          </SurfaceCard>

          <SurfaceCard
            eyebrow="ek hizmetler"
            title="Sepeti buyuten standart moduller"
            description="Ana urun web sitesi olarak net kalir; ek hizmetler ayni sistem mantiginda kontrollu upsell olarak ilerler."
          >
            <div className="addon-pills">
              {addonServices.map((service) => (
                <span key={service}>{service}</span>
              ))}
            </div>
          </SurfaceCard>

          <SurfaceCard
            eyebrow="uretim hatti"
            title="Kontrollu AI site generation"
            description="Yapilandirilmis veri toplama ile baslar, blueprint/spec uretir, tema ailesi secip preview ve publish ile biter."
          >
            <TimelineList items={pipelineTimeline} />
          </SurfaceCard>
        </div>
      </section>

      <section className="marketing-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">sektor uyumlulugu</p>
            <h2 className="section-title">Bu sistem benim isime de uyuyor hissi</h2>
          </div>
          <p className="surface-meta">Sektor kartlari sadece dekor degil, uyum ve guven sinyali uretir.</p>
        </div>

        <div className="surface-grid">
          {sectorCards.map((sector) => (
            <article className="feature-card" key={sector.title}>
              <h3>{sector.title}</h3>
              <p>{sector.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section">
        <div className="section-head">
          <div>
            <p className="eyebrow">fiyat akisi</p>
            <h2 className="section-title">Ana fiyat net, ek hizmet ikinci katmanda</h2>
          </div>
          <p className="surface-meta">Abonelik dili yerine 1 yillik hizmet mantigi ve taksit secenekleri anlatilir.</p>
        </div>

        <div className="price-grid">
          {pricingCards.map((pricing) => (
            <article className="price-card" key={pricing.title}>
              <span className="price-card__tag">{pricing.subtitle}</span>
              <h3>{pricing.title}</h3>
              <p className="surface-meta">{pricing.price}</p>
              <ul>
                {pricing.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section" id="mimari">
        <div className="section-head">
          <div>
            <p className="eyebrow">teknik mimari</p>
            <h2 className="section-title">Google Cloud merkezli, monorepo tabanli, buyumeye acik</h2>
          </div>
          <p className="surface-meta">Cloud Run, Firestore, Tasks, Scheduler ve e-posta once bildirim katmani.</p>
        </div>

        <div className="two-column">
          <SurfaceCard
            eyebrow="altyapi"
            title="Moduler tek API ve veri katmani"
            description="Apps ayri, paylasilan domain kurallari ortak. Bu sayede hizli ama daginik olmayan bir kod tabani korunur."
          >
            <InfoList items={architectureInfo} />
          </SurfaceCard>

          <SurfaceCard
            eyebrow="tema motoru"
            title="3-5 tema ailesi, yuksek varyasyon"
            description="Tek tema tekrarini kirmak ama sistemi dagitmamak icin tema ailesi + kontrollu varyasyon mantigi uygulanir."
          >
            <div className="surface-grid">
              {themeCards.map((theme) => (
                <article className="theme-card" key={theme.title}>
                  <h3>{theme.title}</h3>
                  <p>{theme.description}</p>
                </article>
              ))}
            </div>
          </SurfaceCard>
        </div>
      </section>

      <section className="marketing-section">
        <div className="two-column">
          <SurfaceCard
            eyebrow="guven alani"
            title="Neden Ustaca AI?"
            description="Tasarimin amaci guzel gorunmek degil; modern, hizli ve guvenilir bir urun hissi ile donusum yaratmaktir."
          >
            <InfoList items={promiseInfo} />
          </SurfaceCard>

          <SurfaceCard
            eyebrow="sss"
            title="Trial, domain ve odeme sorulari"
            description="Ziyaretciyi dusunduren degil ilerleten, kademeli karmasikliga sahip acik cevaplar."
          >
            <InfoList items={faqInfo} />
          </SurfaceCard>
        </div>
      </section>

      <section className="marketing-section" id="yol-haritasi">
        <div className="section-head">
          <div>
            <p className="eyebrow">yol haritasi</p>
            <h2 className="section-title">Once omurga, sonra satis, sonra otomasyon</h2>
          </div>
          <p className="surface-meta">Ilk surumde eksiksiz olmak degil, dagilmadan calisir olmak hedeflenir.</p>
        </div>

        <div className="roadmap-grid">
          {roadmapCards.map((card) => (
            <article className="roadmap-card" key={card.range}>
              <span className="roadmap-card__range">{card.range}</span>
              <h3>{card.title}</h3>
              <ul>
                {card.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="marketing-section" id="iletisim">
        <SurfaceCard
          className="cta-banner"
          eyebrow="bildirim ve destek"
          title="E-posta once, diger kanallar sonra"
          description="Ilk surumde sistem olaylari e-posta ile akar. Bu kanal daha sonra SMS ve WhatsApp'a genisleyebilecek sekilde tasarlanir."
          actions={
            <div className="button-row">
              <a className="button-primary" href="mailto:bilgi@ustacacozum.com">
                bilgi@ustacacozum.com
              </a>
              <a className="button-ghost" href="/pricing">
                Urun kapsamini incele
              </a>
            </div>
          }
        >
          <div className="notification-pills">
            {notificationEvents.map((event) => (
              <span key={event}>{event}</span>
            ))}
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}
