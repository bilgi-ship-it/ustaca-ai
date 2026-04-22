import { InfoList, SurfaceCard } from "@ustaca/ui";

import { MarketingFrame } from "@/components/marketing-frame";
import { architectureInfo, promiseInfo } from "@/lib/content";

export default function AboutPage() {
  return (
    <MarketingFrame
      eyebrow="hakkimizda"
      title="Ajans degil, urunlesmis teknoloji girisimi"
      description="Ustaca AI, kucuk isletmeler icin tekrar uretilebilir, yonetilebilir ve startup hissi tasiyan dijital cozumler sunar."
    >
      <div className="two-column">
        <SurfaceCard
          eyebrow="marka vaadi"
          title="Modern, hizli, guven veren"
          description="Kucuk isletmeyi yabancilastirmadan startup hissi ureten cizgi."
        >
          <InfoList items={promiseInfo} />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="teknik denge"
          title="AI + operasyon + tasarim sistemi"
          description="Kontrolsuz uretim yerine theme family, ortak token yapisi ve loglanan operasyon kararlari."
        >
          <InfoList items={architectureInfo} />
        </SurfaceCard>
      </div>
    </MarketingFrame>
  );
}

