import type { ReactNode } from "react";

import { cn } from "./utils";

type SurfaceCardProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
};

export const SurfaceCard = ({
  eyebrow,
  title,
  description,
  actions,
  className,
  children
}: SurfaceCardProps) => (
  <section className={cn("surface-card", className)}>
    <header className="surface-card__header">
      <div>
        {eyebrow ? <p className="surface-card__eyebrow">{eyebrow}</p> : null}
        <h2 className="surface-card__title">{title}</h2>
        {description ? <p className="surface-card__description">{description}</p> : null}
      </div>
      {actions ? <div className="surface-card__actions">{actions}</div> : null}
    </header>
    {children ? <div className="surface-card__content">{children}</div> : null}
  </section>
);

