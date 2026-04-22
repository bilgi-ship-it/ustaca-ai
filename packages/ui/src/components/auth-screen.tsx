import type { ReactNode } from "react";

type AuthScreenProps = {
  productLabel: string;
  title: string;
  description: string;
  badge?: string;
  aside?: ReactNode;
  children: ReactNode;
};

export const AuthScreen = ({
  productLabel,
  title,
  description,
  badge,
  aside,
  children
}: AuthScreenProps) => (
  <section className="auth-screen">
    <div className="auth-screen__hero">
      <p className="section-eyebrow">{productLabel}</p>
      <h1 className="hero-title">{title}</h1>
      <p className="lead">{description}</p>
      {badge ? <span className="auth-badge">{badge}</span> : null}
      {aside ? <div className="auth-screen__aside">{aside}</div> : null}
    </div>
    <div className="auth-screen__panel">{children}</div>
  </section>
);
