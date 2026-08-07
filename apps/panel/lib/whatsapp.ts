const GRAPH_API_VERSION = "v22.0";

const trimEnv = (key: string) => process.env[key]?.trim();

const getRequiredEnv = (key: string) => {
  const value = trimEnv(key);

  if (!value) {
    throw new Error(`missing_env:${key}`);
  }

  return value;
};

type SendWhatsAppTextParams = {
  to: string;
  body: string;
};

export const sendWhatsAppText = async ({ to, body }: SendWhatsAppTextParams) => {
  const token = getRequiredEnv("WHATSAPP_TOKEN");
  const phoneNumberId = getRequiredEnv("WHATSAPP_PHONE_NUMBER_ID");

  const response = await fetch(
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body }
      })
    }
  );

  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      payload
    };
  }

  return {
    ok: true as const,
    status: response.status,
    payload
  };
};
