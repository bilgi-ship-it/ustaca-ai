export const consentDocumentTypes = [
  "terms_of_service",
  "privacy_kvkk",
  "content_responsibility",
  "membership_agreement"
] as const;

export type ConsentDocumentType = (typeof consentDocumentTypes)[number];

export type ConsentRecord = {
  document: ConsentDocumentType;
  version: string;
  acceptedAt: string;
  actorUserId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export const consentAuditAction = "consent.recorded" as const;

export const buildConsentAuditMetadata = (record: ConsentRecord) => ({
  document: record.document,
  version: record.version,
  acceptedAt: record.acceptedAt,
  ipAddress: record.ipAddress ?? null,
  userAgent: record.userAgent ?? null
});
