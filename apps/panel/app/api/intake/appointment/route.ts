import { createAdminFilterKey } from "@ustaca/domain";
import { NextResponse } from "next/server";

import { repositories } from "@/lib/data";

const nowIso = () => new Date().toISOString();

const generateId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type IntakeBody = {
  customerId?: string;
  name?: string;
  phone?: string;
  requestedService?: string;
  requestedAt?: string;
  notes?: string;
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
  const requestedService = body.requestedService?.trim() ?? "randevu";
  const requestedAt = body.requestedAt?.trim() || nowIso();
  const notes = body.notes?.trim() ?? "";

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
  const id = generateId("appt");

  await repositories.appointmentRequests.create({
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
    requested_service_key: createAdminFilterKey(requestedService) ?? "randevu",
    name,
    phone,
    requestedService,
    requestedAt,
    notes
  });

  return NextResponse.json({ success: true, id });
};
