"use server";

import {
  createBackgroundJobService,
  createConsoleNotificationSender,
  createLifecycleService
} from "@ustaca/db";
import { checkDomainAvailability, registerDomain, verifyPayment } from "@ustaca/lib";
import { revalidatePath } from "next/cache";

import { requireAdminRole } from "@/lib/auth";
import { repositories } from "@/lib/data";

const lifecycle = createLifecycleService(repositories);
const backgroundJobs = createBackgroundJobService(repositories, {
  sender: createConsoleNotificationSender()
});

const toStringValue = (value: FormDataEntryValue | null): string => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const warn = (message: string, detail?: unknown) => {
  if (detail !== undefined) {
    console.warn(`[admin-action] ${message}`, detail);
  } else {
    console.warn(`[admin-action] ${message}`);
  }
};

const revalidateOperational = () => {
  revalidatePath("/");
  revalidatePath("/customers");
  revalidatePath("/trials");
  revalidatePath("/payments");
  revalidatePath("/domains");
  revalidatePath("/support");
};

const getAdminLifecycleAudit = async () => {
  const session = await requireAdminRole(["super_admin", "ops_admin"]);
  return {
    actorUserId: session.user.id,
    actorRole: session.user.role
  } as const;
};

export const startTrialAction = async (formData: FormData): Promise<void> => {
  const customerId = toStringValue(formData.get("customerId"));
  if (!customerId) {
    warn("startTrial: customerId required");
    return;
  }

  const daysRaw = toStringValue(formData.get("daysGranted"));
  const days = daysRaw ? Number(daysRaw) : undefined;
  const planName = toStringValue(formData.get("planName")) || undefined;

  try {
    await lifecycle.startTrial({
      customerId,
      daysGranted: Number.isFinite(days) ? days : undefined,
      planName
    });
  } catch (error) {
    warn("startTrial failed", error);
    return;
  }

  revalidateOperational();
};

export const expireTrialAction = async (formData: FormData): Promise<void> => {
  const trialId = toStringValue(formData.get("trialId"));
  if (!trialId) {
    warn("expireTrial: trialId required");
    return;
  }

  try {
    await lifecycle.expireTrial(trialId);
  } catch (error) {
    warn("expireTrial failed", error);
    return;
  }

  revalidateOperational();
};

export const convertTrialAction = async (formData: FormData): Promise<void> => {
  const trialId = toStringValue(formData.get("trialId"));
  if (!trialId) {
    warn("convertTrial: trialId required");
    return;
  }

  try {
    await lifecycle.convertTrialToActive(trialId);
  } catch (error) {
    warn("convertTrial failed", error);
    return;
  }

  revalidateOperational();
};

export const suspendCustomerAction = async (formData: FormData): Promise<void> => {
  const customerId = toStringValue(formData.get("customerId"));
  const reason = toStringValue(formData.get("reason")) || "manuel aski";
  if (!customerId) {
    warn("suspendCustomer: customerId required");
    return;
  }

  try {
    await lifecycle.suspendCustomer(customerId, reason);
  } catch (error) {
    warn("suspendCustomer failed", error);
    return;
  }

  revalidateOperational();
};

export const reactivateCustomerAction = async (formData: FormData): Promise<void> => {
  const customerId = toStringValue(formData.get("customerId"));
  if (!customerId) {
    warn("reactivateCustomer: customerId required");
    return;
  }

  try {
    await lifecycle.reactivateCustomer(customerId);
  } catch (error) {
    warn("reactivateCustomer failed", error);
    return;
  }

  revalidateOperational();
};

export const verifyPaymentAction = async (formData: FormData): Promise<void> => {
  const paymentId = toStringValue(formData.get("paymentId"));
  const email = toStringValue(formData.get("email"));
  const tier = toStringValue(formData.get("tier")) || "standard";
  const amountRaw = toStringValue(formData.get("amount"));
  const amount = Number(amountRaw);
  const manualNote = toStringValue(formData.get("manualNote")) || undefined;

  if (!paymentId || !email || !Number.isFinite(amount)) {
    warn("verifyPayment: paymentId, email and amount required");
    return;
  }

  let result;
  try {
    result = await verifyPayment({ email, tier, amount });
  } catch (error) {
    warn("verifyPayment api failed", error);
    result = { verified: false, summary: "api_unreachable" } as const;
  }

  try {
    const audit = await getAdminLifecycleAudit();
    await lifecycle.recordPaymentVerification({
      paymentId,
      source: "api",
      verified: result.verified,
      orderId: result.orderId ?? null,
      summary: result.summary,
      rawResponse: result.rawResponse,
      manualNote
    }, audit);
  } catch (error) {
    warn("recordPaymentVerification failed", error);
    return;
  }

  revalidateOperational();
};

export const manualConfirmPaymentAction = async (formData: FormData): Promise<void> => {
  const paymentId = toStringValue(formData.get("paymentId"));
  const confirm = toStringValue(formData.get("confirm")) === "yes";
  const orderId = toStringValue(formData.get("orderId")) || null;
  const summary = toStringValue(formData.get("summary")) || undefined;
  const manualNote = toStringValue(formData.get("manualNote")) || undefined;

  if (!paymentId) {
    warn("manualConfirmPayment: paymentId required");
    return;
  }

  try {
    const audit = await getAdminLifecycleAudit();
    await lifecycle.recordPaymentVerification({
      paymentId,
      source: "manual",
      verified: confirm,
      orderId,
      summary: summary ?? (confirm ? "Manuel dogrulama" : "Manuel inceleme"),
      manualNote
    }, audit);
  } catch (error) {
    warn("manualConfirmPayment failed", error);
    return;
  }

  revalidateOperational();
};

export const approveGoLiveAction = async (formData: FormData): Promise<void> => {
  const paymentId = toStringValue(formData.get("paymentId"));
  const summary = toStringValue(formData.get("summary")) || undefined;
  const manualNote = toStringValue(formData.get("manualNote")) || undefined;

  if (!paymentId) {
    warn("approveGoLive: paymentId required");
    return;
  }

  try {
    const audit = await getAdminLifecycleAudit();
    await lifecycle.approveGoLive(
      {
        paymentId,
        summary: summary ?? "Go-live onayi verildi",
        manualNote
      },
      audit
    );
  } catch (error) {
    warn("approveGoLive failed", error);
    return;
  }

  revalidateOperational();
};

export const markPaymentPastDueAction = async (formData: FormData): Promise<void> => {
  const paymentId = toStringValue(formData.get("paymentId"));
  if (!paymentId) {
    warn("markPaymentPastDue: paymentId required");
    return;
  }

  try {
    await lifecycle.markPaymentPastDue(paymentId);
  } catch (error) {
    warn("markPaymentPastDue failed", error);
    return;
  }

  revalidateOperational();
};

export const runTrialExpirationSweepAction = async (): Promise<void> => {
  try {
    await backgroundJobs.runTrialExpirationSweep();
  } catch (error) {
    warn("runTrialExpirationSweep failed", error);
    return;
  }

  revalidateOperational();
};

export const runPaymentOverdueSweepAction = async (): Promise<void> => {
  try {
    await backgroundJobs.runPaymentOverdueSweep();
  } catch (error) {
    warn("runPaymentOverdueSweep failed", error);
    return;
  }

  revalidateOperational();
};

export const processNotificationQueueAction = async (): Promise<void> => {
  try {
    await backgroundJobs.processNotificationQueue();
  } catch (error) {
    warn("processNotificationQueue failed", error);
    return;
  }

  revalidateOperational();
};

export const checkDomainAvailabilityAction = async (formData: FormData): Promise<void> => {
  const domainId = toStringValue(formData.get("domainId"));
  const hostname = toStringValue(formData.get("hostname"));

  if (!domainId || !hostname) {
    warn("checkDomainAvailability: domainId and hostname required");
    return;
  }

  let result;
  try {
    result = await checkDomainAvailability({ name: hostname });
  } catch (error) {
    warn("checkDomainAvailability api failed", error);
    result = { available: false, summary: "api_unreachable" } as const;
  }

  try {
    await lifecycle.recordDomainAvailability({
      domainId,
      available: result.available,
      summary: result.summary
    });
  } catch (error) {
    warn("recordDomainAvailability failed", error);
    return;
  }

  revalidateOperational();
};

export const registerDomainAction = async (formData: FormData): Promise<void> => {
  const domainId = toStringValue(formData.get("domainId"));
  const hostname = toStringValue(formData.get("hostname"));
  const firebaseIdToken = toStringValue(formData.get("firebaseIdToken"));

  if (!domainId || !hostname || !firebaseIdToken) {
    warn("registerDomain: domainId, hostname and firebaseIdToken required");
    return;
  }

  let result;
  try {
    result = await registerDomain({ name: hostname, firebaseIdToken });
  } catch (error) {
    warn("registerDomain api failed", error);
    return;
  }

  if (!result.registered) {
    warn("registerDomain: registrar reported failure", result.summary);
    return;
  }

  try {
    await lifecycle.confirmDomainRegistered({
      domainId,
      registrar: result.registrar,
      expiresAt: result.expiresAt
    });
  } catch (error) {
    warn("confirmDomainRegistered failed", error);
    return;
  }

  revalidateOperational();
};
