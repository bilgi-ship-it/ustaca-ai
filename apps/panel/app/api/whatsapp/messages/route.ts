import { NextResponse } from "next/server";

import { sendWhatsAppText } from "@/lib/whatsapp";

type SendMessageBody = {
  to?: string;
  body?: string;
};

export const POST = async (request: Request) => {
  let body: SendMessageBody;

  try {
    body = (await request.json()) as SendMessageBody;
  } catch {
    return NextResponse.json({ success: false, message: "invalid_json" }, { status: 400 });
  }

  const to = body.to?.trim();
  const text = body.body?.trim();

  if (!to || !text) {
    return NextResponse.json({ success: false, message: "to_and_body_required" }, { status: 400 });
  }

  try {
    const result = await sendWhatsAppText({ to, body: text });

    if (!result.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "whatsapp_api_error",
          status: result.status,
          payload: result.payload
        },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, status: result.status, payload: result.payload });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown_error";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
};
