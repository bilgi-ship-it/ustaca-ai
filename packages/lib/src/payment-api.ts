export type VerifyPaymentRequest = {
  email: string;
  tier: string;
  amount: number;
};

export type VerifyPaymentResponse = {
  verified: boolean;
  orderId?: string;
  summary?: string;
  rawResponse?: unknown;
};

export type VerifyPaymentClientOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
};

const DEFAULT_BASE_URL = "";

export const verifyPayment = async (
  request: VerifyPaymentRequest,
  options: VerifyPaymentClientOptions = {}
): Promise<VerifyPaymentResponse> => {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const fetchImpl = options.fetchImpl ?? fetch;

  const params = new URLSearchParams({
    email: request.email,
    tier: request.tier,
    amount: String(request.amount)
  });

  const url = `${baseUrl}/api/verify-payment?${params.toString()}`;

  const response = await fetchImpl(url, {
    method: "GET",
    headers: { accept: "application/json" },
    signal: options.signal
  });

  if (!response.ok) {
    return {
      verified: false,
      summary: `verify_payment_http_${response.status}`,
      rawResponse: { status: response.status }
    };
  }

  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  return {
    verified: body.verified === true,
    orderId: typeof body.orderId === "string" ? body.orderId : undefined,
    summary: typeof body.summary === "string" ? body.summary : undefined,
    rawResponse: body
  };
};
