import type { ReactNode } from "react";

type MarketingFrameProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export const MarketingFrame = ({ eyebrow, title, description, children }: MarketingFrameProps) => (
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
        <a href="/">Ana Sayfa</a>
        <a href="/how-it-works">Urun</a>
        <a href="/pricing">Fiyatlar</a>
        <a href="/addons">Ek Hizmetler</a>
        <a href="/about">Hakkimizda</a>
        <a href="/contact">Iletisim</a>
        <a href="/legal">Sozlesmeler</a>
      </nav>
    </header>

    <section className="page-hero">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="section-title">{title}</h2>
      <p className="surface-meta">{description}</p>
    </section>

    <div className="marketing-section">{children}</div>
  </div>
);

