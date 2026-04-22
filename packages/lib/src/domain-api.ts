export type DomainAvailabilityRequest = {
  name: string;
};

export type DomainAvailabilityResponse = {
  available: boolean;
  summary?: string;
  rawResponse?: unknown;
};

export type RegisterDomainRequest = {
  name: string;
  firebaseIdToken: string;
};

export type RegisterDomainResponse = {
  registered: boolean;
  registrar?: string;
  expiresAt?: string;
  summary?: string;
  rawResponse?: unknown;
};

export type DomainApiClientOptions = {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
};

const DEFAULT_BASE_URL = "";

export const checkDomainAvailability = async (
  request: DomainAvailabilityRequest,
  options: DomainApiClientOptions = {}
): Promise<DomainAvailabilityResponse> => {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const fetchImpl = options.fetchImpl ?? fetch;

  const params = new URLSearchParams({ name: request.name });
  const url = `${baseUrl}/api/domain-availability?${params.toString()}`;

  const response = await fetchImpl(url, {
    method: "GET",
    headers: { accept: "application/json" },
    signal: options.signal
  });

  if (!response.ok) {
    return {
      available: false,
      summary: `domain_availability_http_${response.status}`,
      rawResponse: { status: response.status }
    };
  }

  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  return {
    available: body.available === true,
    summary: typeof body.summary === "string" ? body.summary : undefined,
    rawResponse: body
  };
};

export const registerDomain = async (
  request: RegisterDomainRequest,
  options: DomainApiClientOptions = {}
): Promise<RegisterDomainResponse> => {
  const baseUrl = options.baseUrl ?? DEFAULT_BASE_URL;
  const fetchImpl = options.fetchImpl ?? fetch;

  const url = `${baseUrl}/api/register-domain`;

  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json",
      authorization: `Bearer ${request.firebaseIdToken}`
    },
    body: JSON.stringify({ name: request.name }),
    signal: options.signal
  });

  if (!response.ok) {
    return {
      registered: false,
      summary: `register_domain_http_${response.status}`,
      rawResponse: { status: response.status }
    };
  }

  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;

  return {
    registered: body.registered === true,
    registrar: typeof body.registrar === "string" ? body.registrar : undefined,
    expiresAt: typeof body.expiresAt === "string" ? body.expiresAt : undefined,
    summary: typeof body.summary === "string" ? body.summary : undefined,
    rawResponse: body
  };
};
