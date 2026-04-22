import { createHmac, timingSafeEqual } from "node:crypto";

import { authUserSchema, type AuthUser, type UserRole } from "@ustaca/domain";

import { createSessionScope, permissionMatrix, type Permission } from "./permissions";
import type {
  AppAccessRule,
  AuthApplication,
  AuthSession,
  SessionTokenPayload,
  SingleTenantSession
} from "./types";

const SESSION_LIFETIME_SECONDS = 60 * 60 * 12;

const roleLabels = {
  super_admin: "Super Admin",
  ops_admin: "Operasyon Admini",
  customer: "Musteri"
} as const satisfies Record<UserRole, string>;

export const authApplications = {
  admin: {
    cookieName: "ustaca_admin_session",
    loginPath: "/login",
    unauthorizedPath: "/unauthorized",
    defaultRedirectPath: "/",
    allowedRoles: ["super_admin", "ops_admin"]
  },
  panel: {
    cookieName: "ustaca_panel_session",
    loginPath: "/login",
    unauthorizedPath: "/unauthorized",
    defaultRedirectPath: "/",
    allowedRoles: ["customer"]
  }
} as const satisfies Record<AuthApplication, AppAccessRule>;

const isAuthApplication = (value: unknown): value is AuthApplication =>
  value === "admin" || value === "panel";

const isNullableString = (value: unknown): value is string | null =>
  typeof value === "string" || value === null;

const resolveAuthSecret = () =>
  process.env.AUTH_SECRET?.trim() || "ustaca-dev-auth-secret-change-before-production-2026";

const encodeBase64Url = (value: string) => Buffer.from(value, "utf8").toString("base64url");

const decodeBase64Url = (value: string) => Buffer.from(value, "base64url").toString("utf8");

const createSignature = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

const compareSignature = (expected: string, provided: string) => {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
};

const parsePayload = (payload: unknown): SessionTokenPayload | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as Record<string, unknown>;
  const user = authUserSchema.safeParse(candidate.user);

  if (!user.success) {
    return null;
  }

  if (
    !isAuthApplication(candidate.app) ||
    !isNullableString(candidate.businessId) ||
    !isNullableString(candidate.siteId) ||
    typeof candidate.issuedAt !== "string" ||
    typeof candidate.expiresAt !== "string"
  ) {
    return null;
  }

  return {
    app: candidate.app,
    user: user.data,
    businessId: candidate.businessId,
    siteId: candidate.siteId,
    issuedAt: candidate.issuedAt,
    expiresAt: candidate.expiresAt
  };
};

const toSession = (payload: SessionTokenPayload): AuthSession => ({
  kind: "single-tenant",
  ...payload,
  permissions: permissionMatrix[payload.user.role]
});

export const roleLabel = (role: UserRole) => roleLabels[role];

export const createSessionForApp = (app: AuthApplication, user: AuthUser): SingleTenantSession => {
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + SESSION_LIFETIME_SECONDS * 1000);
  const scope = createSessionScope(user);

  return {
    kind: "single-tenant",
    app,
    user,
    businessId: scope.businessId,
    siteId: scope.siteId,
    permissions: scope.permissions,
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString()
  };
};

export const createSessionForRole = (user: AuthUser) =>
  createSessionForApp(user.role === "customer" ? "panel" : "admin", user);

export const canAccessAdmin = (session: AuthSession) =>
  (authApplications.admin.allowedRoles as readonly UserRole[]).includes(session.user.role);

export const canAccessOwnerPanel = (session: AuthSession) =>
  (authApplications.panel.allowedRoles as readonly UserRole[]).includes(session.user.role);

export const hasPermission = (session: AuthSession, permission: Permission) =>
  session.permissions.includes(permission);

export const isRoleAllowedForApp = (app: AuthApplication, role: UserRole) =>
  (authApplications[app].allowedRoles as readonly UserRole[]).includes(role);

export const assertSessionRole = (session: AuthSession, allowedRoles: readonly UserRole[]) =>
  allowedRoles.includes(session.user.role);

export const createSignedSessionToken = (session: AuthSession) => {
  const payload: SessionTokenPayload = {
    app: session.app,
    user: session.user,
    businessId: session.businessId,
    siteId: session.siteId,
    issuedAt: session.issuedAt,
    expiresAt: session.expiresAt
  };

  const serializedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = createSignature(serializedPayload, resolveAuthSecret());

  return `${serializedPayload}.${signature}`;
};

export const readSessionFromCookieValue = (
  app: AuthApplication,
  cookieValue: string | undefined
): AuthSession | null => {
  if (!cookieValue) {
    return null;
  }

  const [serializedPayload, providedSignature] = cookieValue.split(".");

  if (!serializedPayload || !providedSignature) {
    return null;
  }

  const expectedSignature = createSignature(serializedPayload, resolveAuthSecret());

  if (!compareSignature(expectedSignature, providedSignature)) {
    return null;
  }

  try {
    const parsedJson = JSON.parse(decodeBase64Url(serializedPayload)) as unknown;
    const payload = parsePayload(parsedJson);

    if (!payload || payload.app !== app || !isRoleAllowedForApp(app, payload.user.role)) {
      return null;
    }

    if (new Date(payload.expiresAt).getTime() <= Date.now()) {
      return null;
    }

    return toSession(payload);
  } catch {
    return null;
  }
};

export const createSessionCookie = (session: AuthSession) => ({
  name: authApplications[session.app].cookieName,
  value: createSignedSessionToken(session),
  options: {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_LIFETIME_SECONDS
  }
});

export const createClearedSessionCookie = (app: AuthApplication) => ({
  name: authApplications[app].cookieName,
  value: "",
  options: {
    httpOnly: true,
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    expires: new Date(0)
  }
});
