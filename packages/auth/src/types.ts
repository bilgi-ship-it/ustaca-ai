import type { AuthUser, UserRole } from "@ustaca/domain";

import type { Permission } from "./permissions";

export type AuthApplication = "admin" | "panel";

export type AppAccessRule = {
  cookieName: string;
  loginPath: string;
  unauthorizedPath: string;
  defaultRedirectPath: string;
  allowedRoles: readonly UserRole[];
};

export type AuthSession = {
  kind: "single-tenant";
  app: AuthApplication;
  user: AuthUser;
  businessId: string | null;
  siteId: string | null;
  permissions: readonly Permission[];
  issuedAt: string;
  expiresAt: string;
};

export type SingleTenantSession = AuthSession;

export type SessionTokenPayload = Omit<AuthSession, "kind" | "permissions">;

export type LoginCredentials = {
  email: string;
  password: string;
};

export type BootstrapAccount = {
  app: AuthApplication;
  user: AuthUser;
  password: string;
  businessId: string | null;
  siteId: string | null;
};

export type AuthenticationResult =
  | {
      ok: true;
      session: AuthSession;
    }
  | {
      ok: false;
      reason: "invalid_credentials" | "unauthorized_role";
    };

export type DemoCredential = {
  role: UserRole;
  email: string;
  password: string;
};

