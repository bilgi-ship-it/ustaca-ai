import type { ReactNode } from "react";

import type { NavItem } from "@ustaca/types";

type AppShellProps = {
  productLabel: string;
  title: string;
  subtitle: string;
  nav: NavItem[];
  actions?: ReactNode;
  children: ReactNode;
};

export const AppShell = ({ productLabel, title, subtitle, nav, actions, children }: AppShellProps) => (
  <div className="shell">
    <aside className="shell__sidebar">
      <div className="brand-lockup">
        <span className="brand-lockup__pulse" />
        <div>
          <p className="brand-lockup__eyebrow">{productLabel}</p>
          <h1 className="brand-lockup__title">Ustaca AI</h1>
        </div>
      </div>
      <nav className="shell__nav" aria-label={`${productLabel} navigation`}>
        {nav.map((item) => (
          <a className="shell__nav-link" href={item.href} key={item.href}>
            <span>{item.label}</span>
            <small>{item.description}</small>
            {item.badge ? <em>{item.badge}</em> : null}
          </a>
        ))}
      </nav>
      <div className="shell__sidebar-footer">
        <p>Single-tenant auth ve tek site is akisi icin sade operasyon omurgasi.</p>
      </div>
    </aside>
    <main className="shell__main">
      <header className="shell__header">
        <div>
          <p className="page-eyebrow">{productLabel}</p>
          <h2 className="page-title">{title}</h2>
          <p className="page-subtitle">{subtitle}</p>
        </div>
        {actions ? <div className="shell__actions">{actions}</div> : null}
      </header>
      <div className="shell__content">{children}</div>
    </main>
  </div>
);

