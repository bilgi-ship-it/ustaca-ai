export type StatusTone = "accent" | "neutral" | "positive" | "warning" | "critical";

export type NavItem = {
  href: string;
  label: string;
  description: string;
  badge?: string;
};

export type MetricItem = {
  label: string;
  value: string;
  detail: string;
  tone?: StatusTone;
};

export type InfoPair = {
  label: string;
  value: string;
  hint?: string;
  tone?: StatusTone;
};

export type TimelineItem = {
  label: string;
  detail: string;
  meta: string;
  tone?: StatusTone;
};

