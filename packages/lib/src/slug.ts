const asciiPattern = /[^a-z0-9-]/g;
const dashPattern = /-+/g;

export const createCustomerSlug = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(asciiPattern, "")
    .replace(dashPattern, "-")
    .replace(/^-|-$/g, "");

export const createTrialHostname = (value: string, rootDomain = "ustaca.app") =>
  `${createCustomerSlug(value)}.${rootDomain}`;

