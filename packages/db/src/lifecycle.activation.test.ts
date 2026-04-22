import assert from "node:assert/strict";
import test from "node:test";

import { createInMemoryRepositoryBundle } from "./in-memory";
import { createLifecycleService } from "./lifecycle";
import { firestoreSeedData } from "./seeds";

const createHarness = () => {
  const repositories = createInMemoryRepositoryBundle(structuredClone(firestoreSeedData));
  const lifecycle = createLifecycleService(repositories);

  return { repositories, lifecycle };
};

const adminAudit = {
  actorUserId: "usr_ops_admin",
  actorRole: "ops_admin" as const
};

test("verified payment does not automatically activate customer or site", async () => {
  const { repositories, lifecycle } = createHarness();

  await lifecycle.recordPaymentVerification(
    {
      paymentId: "pay_01",
      source: "manual",
      verified: true,
      orderId: "ORDER-100",
      summary: "Banka havalesi dogrulandi",
      manualNote: "Dekont eslesti"
    },
    adminAudit
  );

  const payment = await repositories.payments.getById("pay_01");
  const customer = await repositories.customers.getById("cus_01");
  const site = await repositories.sites.getById("site_01");
  const trial = await repositories.trials.getById("trial_01");

  assert.ok(payment);
  assert.ok(customer);
  assert.ok(site);
  assert.ok(trial);

  assert.equal(payment.payment_status, "paid");
  assert.equal(payment.payment_workflow_status, "payment_confirmed");
  assert.equal(payment.activation_ops_status, "activation_pending_ops");
  assert.equal(payment.activation_ready_at, payment.payment_verified_at);
  assert.equal(payment.activation_completed_at, null);
  assert.equal(payment.verified_by_user_id, adminAudit.actorUserId);
  assert.equal(payment.verified_by_role, adminAudit.actorRole);
  assert.equal(payment.manual_note, "Dekont eslesti");
  assert.equal(customer.customer_status, "payment_waiting");
  assert.equal(customer.active_trial_id, null);
  assert.equal(customer.active_payment_id, "pay_01");
  assert.equal(site.site_status, "trial_live");
  assert.equal(trial.trial_status, "converted");
});

test("go-live approval is required before the customer can become active", async () => {
  const { repositories, lifecycle } = createHarness();

  await lifecycle.recordPaymentVerification(
    {
      paymentId: "pay_01",
      source: "manual",
      verified: true,
      summary: "Odeme kontrol edildi"
    },
    adminAudit
  );

  await assert.rejects(
    lifecycle.reactivateCustomer("cus_01", adminAudit),
    /go-live onayi/i
  );

  const customer = await repositories.customers.getById("cus_01");
  const site = await repositories.sites.getById("site_01");

  assert.equal(customer?.customer_status, "payment_waiting");
  assert.equal(site?.site_status, "trial_live");
});

test("approveGoLive activates the customer, site and payment ops state", async () => {
  const { repositories, lifecycle } = createHarness();

  await lifecycle.recordPaymentVerification(
    {
      paymentId: "pay_01",
      source: "api",
      verified: true,
      orderId: "ORDER-200",
      summary: "API odeme dogruladi",
      manualNote: "Yayin kontrol listesi acildi"
    },
    adminAudit
  );

  const result = await lifecycle.approveGoLive(
    {
      paymentId: "pay_01",
      summary: "Go-live onayi verildi",
      manualNote: "Icerik ve yayin kontrolu tamam"
    },
    adminAudit
  );

  const payment = await repositories.payments.getById("pay_01");
  const customer = await repositories.customers.getById("cus_01");
  const site = await repositories.sites.getById("site_01");
  const notifications = await repositories.notifications.listByCustomer("cus_01");

  assert.equal(result.changed, true);
  assert.equal(payment?.activation_ops_status, "activation_completed");
  assert.ok(payment?.activation_completed_at);
  assert.equal(payment?.manual_note, "Icerik ve yayin kontrolu tamam");
  assert.equal(customer?.customer_status, "active");
  assert.equal(site?.site_status, "active");
  assert.equal(site?.suspendedAt, null);
  assert.ok(
    notifications.some(
      (notification) =>
        notification.eventName === "site.activated" &&
        notification.notification_status === "queued"
    )
  );
});

test("approveGoLive is idempotent on repeated calls", async () => {
  const { repositories, lifecycle } = createHarness();

  await lifecycle.recordPaymentVerification(
    {
      paymentId: "pay_01",
      source: "manual",
      verified: true,
      summary: "Odeme kontrol edildi"
    },
    adminAudit
  );

  const first = await lifecycle.approveGoLive(
    {
      paymentId: "pay_01",
      summary: "Ilk go-live onayi"
    },
    adminAudit
  );
  const notificationsAfterFirst = await repositories.notifications.listByCustomer("cus_01");
  const firstActivationCount = notificationsAfterFirst.filter(
    (notification) => notification.eventName === "site.activated"
  ).length;

  const second = await lifecycle.approveGoLive(
    {
      paymentId: "pay_01",
      summary: "Tekrar go-live onayi"
    },
    adminAudit
  );
  const notificationsAfterSecond = await repositories.notifications.listByCustomer("cus_01");
  const secondActivationCount = notificationsAfterSecond.filter(
    (notification) => notification.eventName === "site.activated"
  ).length;

  assert.equal(first.changed, true);
  assert.equal(second.changed, false);
  assert.equal(secondActivationCount, firstActivationCount);
});
