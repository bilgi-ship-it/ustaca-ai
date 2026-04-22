import { InfoList, SurfaceCard } from "@ustaca/ui";

import { MarketingFrame } from "@/components/marketing-frame";
import { pricingCards, promiseInfo } from "@/lib/content";

export default function PricingPage() {
  return (
    <MarketingFrame
      eyebrow="fiyatlar"
      title="Ana urun net, ek hizmetler kontrollu"
      description="Abonelik degil, 1 yillik hizmet mantigi. Once odeme, sonra tam aktivasyon; gecikmede yayin askiya alinabilir."
    >
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

      <SurfaceCard
        eyebrow="fiyat prensibi"
        title="Sadelik marji korur"
        description="Dusuk fiyat stratejisinin calismasi icin urun standart, destek kontrollu ve panel yapisal olarak sinirli kalir."
      >
        <InfoList items={promiseInfo} />
      </SurfaceCard>
    </MarketingFrame>
  );
}

