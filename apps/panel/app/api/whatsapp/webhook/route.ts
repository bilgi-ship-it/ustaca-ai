import { NextResponse } from "next/server";

const VERIFY_TOKEN_ENV_KEY = "WHATSAPP_VERIFY_TOKEN";

type WhatsAppWebhookBody = {
  object?: string;
  entry?: Array<{
    id?: string;
    changes?: Array<{
      field?: string;
      value?: unknown;
    }>;
  }>;
};

const getVerifyToken = () => process.env[VERIFY_TOKEN_ENV_KEY]?.trim();

export const GET = (request: Request) => {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const verifyToken = getVerifyToken();

  if (!verifyToken) {
    return NextResponse.json(
      { success: false, message: "verify_token_not_configured", key: VERIFY_TOKEN_ENV_KEY },
      { status: 500 }
    );
  }

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ success: false, message: "verification_failed" }, { status: 403 });
};

export const POST = async (request: Request) => {
  let body: WhatsAppWebhookBody;

  try {
    body = (await request.json()) as WhatsAppWebhookBody;
  } catch {
    return NextResponse.json({ success: false, message: "invalid_json" }, { status: 400 });
  }

  const totalEntries = body.entry?.length ?? 0;

  return NextResponse.json({
    success: true,
    receivedObject: body.object ?? null,
    totalEntries
  });
};
