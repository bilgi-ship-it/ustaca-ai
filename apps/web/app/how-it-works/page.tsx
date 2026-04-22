import { InfoList, SurfaceCard, TimelineList } from "@ustaca/ui";

import { MarketingFrame } from "@/components/marketing-frame";
import { architectureInfo, howItWorksTimeline, pipelineTimeline } from "@/lib/content";

export default function HowItWorksPage() {
  return (
    <MarketingFrame
      eyebrow="urun / nasil calisir"
      title="Kayit, AI uretim, trial ve aktivasyon ayni akista"
      description="Korkutmayan ama kontrolu kaybetmeyen bir urun yolculugu: veri topla, blueprint olustur, gercek trial ac, odeme ile aktive et."
    >
      <div className="two-column">
        <SurfaceCard
          eyebrow="3 adim"
          title="Kullaniciya gorunen akis"
          description="Satis tarafinda her sey hizli ve anlasilir kalir."
        >
          <TimelineList items={howItWorksTimeline} />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="teknik akis"
          title="Arkadaki generation pipeline"
          description="Kod, tema ailesi ve preview akisina giden AI destekli ama kontrollu hat."
        >
          <TimelineList items={pipelineTimeline} />
        </SurfaceCard>
      </div>

      <SurfaceCard
        eyebrow="mimari"
        title="Monorepo ve Cloud Run merkezli omurga"
        description="Panel, web ve admin uygulamalari ortak tasarim sistemi ve ortak domain kurallariyla ilerler."
      >
        <InfoList items={architectureInfo} />
      </SurfaceCard>
    </MarketingFrame>
  );
}

