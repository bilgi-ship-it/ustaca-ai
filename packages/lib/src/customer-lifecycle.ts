import type { CustomerState } from "@ustaca/domain";

export const customerStateTransitions: Record<CustomerState, CustomerState[]> = {
  draft: ["trial_active", "special_project", "archived"],
  trial_active: ["trial_expired", "payment_waiting", "active", "special_project", "archived"],
  trial_expired: ["payment_waiting", "active", "archived"],
  payment_waiting: ["active", "suspended", "archived"],
  active: ["suspended", "special_project", "archived"],
  suspended: ["active", "archived"],
  special_project: ["archived"],
  archived: []
};

export const canTransitionCustomerState = (from: CustomerState, to: CustomerState) =>
  customerStateTransitions[from].includes(to);

export const terminalCustomerStates: CustomerState[] = ["archived"];

export const requiresPaymentBeforeActivation = (state: CustomerState) =>
  state === "trial_active" || state === "trial_expired" || state === "payment_waiting";

