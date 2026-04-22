import { MarketingFrame } from "@/components/marketing-frame";
import { addonServices } from "@/lib/content";

export default function AddonsPage() {
  return (
    <MarketingFrame
      eyebrow="ek hizmetler"
      title="Ana urunu bozmadan sepet buyuten moduller"
      description="Haritada gorunurlukten AI asistanlara kadar ek hizmetler, standart urun mantigini koruyacak sekilde konumlanir."
    >
      <div className="surface-grid">
        {addonServices.map((service) => (
          <article className="feature-card" key={service}>
            <h3>{service}</h3>
            <p>Web Sitesi ana urununun etrafinda upsell olarak konumlanan, kontrollu kapsamli modul.</p>
          </article>
        ))}
      </div>
    </MarketingFrame>
  );
}
