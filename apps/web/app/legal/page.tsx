import { MarketingFrame } from "@/components/marketing-frame";

const legalCards = [
  {
    title: "KVKK Aydinlatma",
    description: "Veri toplama, isleme, saklama ve silme kurallari icin zorunlu iskelet."
  },
  {
    title: "Hizmet Sartlari",
    description: "Trial, odeme, aktivasyon, aski ve destek sinirlari icin temel hukuki zemin."
  },
  {
    title: "Uyelik Sozlesmesi",
    description: "Tek kullanici, tek isletme, tek site kuralinin resmi karsiligi."
  },
  {
    title: "Veri Silme Politikasi",
    description: "Aski ve arsiv durumlarinda verinin nasil tutuldugu ve silinecegi."
  }
];

export default function LegalPage() {
  return (
    <MarketingFrame
      eyebrow="sozmeler"
      title="Hukuk ve guven metinleri icin hazir alan"
      description="Sirketi koruyan, musteri sorumlulugunu netlestiren ve veri risklerini azaltan temel sozlesme iskeleti."
    >
      <div className="surface-grid surface-grid--two">
        {legalCards.map((card) => (
          <article className="feature-card" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.description}</p>
          </article>
        ))}
      </div>
    </MarketingFrame>
  );
}
