import type { InfoPair } from "@ustaca/types";

import { StatusBadge } from "./badge";

type InfoListProps = {
  items: InfoPair[];
};

export const InfoList = ({ items }: InfoListProps) => (
  <dl className="info-list">
    {items.map((item) => (
      <div className="info-list__row" key={item.label}>
        <dt>
          <span>{item.label}</span>
          {item.tone ? <StatusBadge label={item.tone} tone={item.tone} /> : null}
        </dt>
        <dd>
          <strong>{item.value}</strong>
          {item.hint ? <span>{item.hint}</span> : null}
        </dd>
      </div>
    ))}
  </dl>
);

