import type { TrialStatus } from "@ustaca/domain";

export const DEFAULT_TRIAL_DAYS = 7;

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const addDaysIso = (iso: string, days: number) =>
  new Date(new Date(iso).getTime() + days * MS_PER_DAY).toISOString();

export const calculateTrialDaysRemaining = (endsAt: string, now: Date = new Date()) =>
  Math.max(0, Math.ceil((new Date(endsAt).getTime() - now.getTime()) / MS_PER_DAY));

export const isTrialExpired = (endsAt: string, now: Date = new Date()) =>
  new Date(endsAt).getTime() <= now.getTime();

export type TrialTransition =
  | { from: TrialStatus; to: TrialStatus; allowed: true }
  | { from: TrialStatus; to: TrialStatus; allowed: false; reason: string };

const trialAllowed: Record<TrialStatus, TrialStatus[]> = {
  scheduled: ["active", "cancelled"],
  active: ["expired", "converted", "cancelled"],
  expired: ["converted", "cancelled"],
  converted: [],
  cancelled: []
};

export const canTransitionTrial = (from: TrialStatus, to: TrialStatus) =>
  trialAllowed[from].includes(to);

export const evaluateTrialTransition = (from: TrialStatus, to: TrialStatus): TrialTransition =>
  canTransitionTrial(from, to)
    ? { from, to, allowed: true }
    : { from, to, allowed: false, reason: `Trial durumu ${from} -> ${to} gecisi desteklenmiyor.` };
