import type { StatusTone } from "@ustaca/types";

const toneClassName: Record<StatusTone, string> = {
  accent: "badge-accent",
  neutral: "badge-neutral",
  positive: "badge-positive",
  warning: "badge-warning",
  critical: "badge-critical"
};

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
};

export const StatusBadge = ({ label, tone = "neutral" }: StatusBadgeProps) => (
  <span className={`status-badge ${toneClassName[tone]}`}>{label}</span>
);

