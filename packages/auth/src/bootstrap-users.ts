import { timingSafeEqual } from "node:crypto";

import { opsAdminUser, singleTenantWorkspace, superAdminUser } from "@ustaca/domain";

import { createSessionScope } from "./permissions";
import type {
  AuthApplication,
  AuthenticationResult,
  BootstrapAccount,
  DemoCredential,
  LoginCredentials
} from "./types";
import { createSessionForApp } from "./session";

const readBootstrapPassword = (envKey: string, fallback: string) => process.env[envKey]?.trim() || fallback;

const compareSecrets = (expected: string, provided: string) => {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, providedBuffer);
};

export const bootstrapAccounts: readonly BootstrapAccount[] = [
  {
    app: "admin",
    user: superAdminUser,
    password: readBootstrapPassword("AUTH_BOOTSTRAP_SUPER_ADMIN_PASSWORD", "Ustaca!SuperAdmin2026"),
    ...createSessionScope(superAdminUser)
  },
  {
    app: "admin",
    user: opsAdminUser,
    password: readBootstrapPassword("AUTH_BOOTSTRAP_OPS_ADMIN_PASSWORD", "Ustaca!OpsAdmin2026"),
    ...createSessionScope(opsAdminUser)
  },
  {
    app: "panel",
    user: singleTenantWorkspace.user,
    password: readBootstrapPassword("AUTH_BOOTSTRAP_CUSTOMER_PASSWORD", "Ustaca!Customer2026"),
    ...createSessionScope(singleTenantWorkspace.user)
  }
] as const;

export const demoCredentialsByApp: Record<AuthApplication, readonly DemoCredential[]> = {
  admin: bootstrapAccounts
    .filter((account) => account.app === "admin")
    .map((account) => ({
      role: account.user.role,
      email: account.user.email,
      password: account.password
    })),
  panel: bootstrapAccounts
    .filter((account) => account.app === "panel")
    .map((account) => ({
      role: account.user.role,
      email: account.user.email,
      password: account.password
    }))
};

export const authenticateBootstrapCredentials = (
  app: AuthApplication,
  credentials: LoginCredentials
): AuthenticationResult => {
  const normalizedEmail = credentials.email.trim().toLowerCase();
  const password = credentials.password.trim();

  if (!normalizedEmail || !password) {
    return {
      ok: false,
      reason: "invalid_credentials"
    };
  }

  const accountForApp = bootstrapAccounts.find(
    (account) => account.app === app && account.user.email.toLowerCase() === normalizedEmail
  );

  if (accountForApp) {
    if (!compareSecrets(accountForApp.password, password)) {
      return {
        ok: false,
        reason: "invalid_credentials"
      };
    }

    return {
      ok: true,
      session: createSessionForApp(app, accountForApp.user)
    };
  }

  const accountOnDifferentApp = bootstrapAccounts.find(
    (account) =>
      account.app !== app &&
      account.user.email.toLowerCase() === normalizedEmail &&
      compareSecrets(account.password, password)
  );

  if (accountOnDifferentApp) {
    return {
      ok: false,
      reason: "unauthorized_role"
    };
  }

  return {
    ok: false,
    reason: "invalid_credentials"
  };
};

