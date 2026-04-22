import { InfoList, SurfaceCard } from "@ustaca/ui";

import { MarketingFrame } from "@/components/marketing-frame";
import { faqInfo, trustInfo } from "@/lib/content";

const contactInfo = [
  {
    label: "Ana destek e-postasi",
    value: "bilgi@ustacacozum.com",
    hint: "Trial, demo ve genel urun sorulari icin ana kanal.",
    tone: "accent"
  },
  {
    label: "Ana CTA",
    value: "Canli Demoyu Gor",
    hint: "Urunu hizli gosteren ana aksiyon.",
    tone: "positive"
  },
  {
    label: "Ikincil CTA",
    value: "Demo Talep Et",
    hint: "Insan destekli takip ve donusum aksiyonu.",
    tone: "warning"
  }
] as const;

export default function ContactPage() {
  return (
    <MarketingFrame
      eyebrow="iletisim"
      title="Kisa funnel, net CTA, hizli geri donus"
      description="Tanitim sitesi ziyaretciyi uzatmadan urun fit'ine ve demo talebine tasimak icin tasarlanir."
    >
      <div className="two-column">
        <SurfaceCard
          eyebrow="iletisim"
          title="Temas ve demo akisi"
          description="Ana CTA'lar ve destek e-postasi bu iskelette sabit yuzeyler olarak hazir."
        >
          <InfoList items={[...contactInfo]} />
        </SurfaceCard>

        <SurfaceCard
          eyebrow="guven"
          title="Sik sorulan ilk sorular"
          description="Kullaniciyi dusundurmeyen ama guven veren net cevaplar."
        >
          <InfoList items={faqInfo} />
        </SurfaceCard>
      </div>

      <SurfaceCard
        eyebrow="neden ulasilir"
        title="Urunu anlayan, teknik dili sade tutan ekip"
        description="Modern startup gorunumu ile kucuk isletmeye uygun dil arasindaki denge, iletisim sayfasinda da korunur."
      >
        <InfoList items={trustInfo} />
      </SurfaceCard>
    </MarketingFrame>
  );
}

