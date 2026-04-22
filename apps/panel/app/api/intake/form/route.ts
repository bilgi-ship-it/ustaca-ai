import { createAdminFilterKey } from "@ustaca/domain";
import { buildNotificationDocument } from "@ustaca/lib";
import { NextResponse } from "next/server";

import { repositories } from "@/lib/data";

const nowIso = () => new Date().toISOString();

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type IntakeBody = {
  customerId?: string;
  name?: string;
  phone?: string;
  email?: string | null;
  service?: string;
  source?: string;
  message?: string;
};

export const POST = async (request: Request) => {
  let body: IntakeBody;

  try {
    body = (await request.json()) as IntakeBody;
  } catch {
    return NextResponse.json({ success: false, message: "invalid_json" }, { status: 400 });
  }

  const name = body.name?.trim();
  const phone = body.phone?.trim();
  const service = body.service?.trim() ?? "genel";
  const message = body.message?.trim() ?? "";
  const source = body.source?.trim() ?? "public_form";

  if (!name || !phone) {
    return NextResponse.json(
      { success: false, message: "name_and_phone_required" },
      { status: 400 }
    );
  }

  let customerId = body.customerId?.trim();

  if (!customerId) {
    const allCustomers = await repositories.customers.listAll();
    customerId = allCustomers[0]?.id;
  }

  if (!customerId) {
    return NextResponse.json({ success: false, message: "customer_not_found" }, { status: 404 });
  }

  const customer = await repositories.customers.getById(customerId);

  if (!customer || !customer.site_id) {
    return NextResponse.json({ success: false, message: "customer_not_ready" }, { status: 404 });
  }

  const timestamp = nowIso();
  const id = generateId("form");

  await repositories.formSubmissions.create({
    id,
    status: "new",
    created_at: timestamp,
    updated_at: timestamp,
    status_changed_at: timestamp,
    is_archived: false,
    archived_at: null,
    is_deleted: false,
    deleted_at: null,
    createdAt: timestamp,
    updatedAt: timestamp,
    customer_id: customer.id,
    customerId: customer.id,
    site_id: customer.site_id,
    siteId: customer.site_id,
    request_status: "new",
    service_key: createAdminFilterKey(service) ?? "genel",
    source_key: createAdminFilterKey(source) ?? "public_form",
    name,
    phone,
    email: body.email?.trim() ? body.email.trim() : null,
    service,
    source,
    message,
    notes: "",
    submittedAt: timestamp
  });

  await repositories.notifications.enqueue(
    buildNotificationDocument({
      id: generateId("notif"),
      eventName: "support.created",
      channel: "email",
      recipient: customer.contact.email,
      subject: `Yeni form talebi: ${service}`,
      customerId: customer.id,
      siteId: customer.site_id,
      payload: { formSubmissionId: id, source },
      now: timestamp
    })
  );

  return NextResponse.json({ success: true, id });
};
