import type { MetricItem } from "@ustaca/types";

import { StatusBadge } from "./badge";

type MetricGridProps = {
  items: MetricItem[];
};

export const MetricGrid = ({ items }: MetricGridProps) => (
  <div className="metric-grid">
    {items.map((item) => (
      <article className="metric-card" key={item.label}>
        <div className="metric-card__topline">
          <span className="metric-card__label">{item.label}</span>
          <StatusBadge label={item.tone ?? "neutral"} tone={item.tone ?? "neutral"} />
        </div>
        <strong className="metric-card__value">{item.value}</strong>
        <p className="metric-card__detail">{item.detail}</p>
      </article>
    ))}
  </div>
);

