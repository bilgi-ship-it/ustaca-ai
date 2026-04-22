import type { TimelineItem } from "@ustaca/types";

import { StatusBadge } from "./badge";

type TimelineListProps = {
  items: TimelineItem[];
};

export const TimelineList = ({ items }: TimelineListProps) => (
  <ul className="timeline-list">
    {items.map((item) => (
      <li className="timeline-list__item" key={`${item.label}-${item.meta}`}>
        <div className="timeline-list__copy">
          <strong>{item.label}</strong>
          <p>{item.detail}</p>
        </div>
        <div className="timeline-list__meta">
          <span>{item.meta}</span>
          {item.tone ? <StatusBadge label={item.tone} tone={item.tone} /> : null}
        </div>
      </li>
    ))}
  </ul>
);

