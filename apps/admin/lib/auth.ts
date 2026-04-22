import {
  authApplications,
  readSessionFromCookieValue,
  roleLabel,
  type AuthSession
} from "@ustaca/auth";
import type { UserRole } from "@ustaca/domain";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const adminApp = authApplications.admin;

export const getAdminSession = async (): Promise<AuthSession | null> => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(adminApp.cookieName)?.value;

  return readSessionFromCookieValue("admin", cookieValue);
};

export const requireAdminSession = async () => {
  const session = await getAdminSession();

  if (!session) {
    redirect(adminApp.loginPath);
  }

  return session;
};

export const requireAdminRole = async (allowedRoles: readonly ("super_admin" | "ops_admin")[]) => {
  const session = await requireAdminSession();

  if (!(allowedRoles as readonly UserRole[]).includes(session.user.role)) {
    redirect(`${adminApp.unauthorizedPath}?reason=unauthorized_role`);
  }

  return session;
};

export const redirectAdminLoginIfAuthenticated = async () => {
  const session = await getAdminSession();

  if (session) {
    redirect(adminApp.defaultRedirectPath);
  }
};

export const adminSessionSummary = (session: AuthSession) => ({
  title: session.user.name,
  detail: `${roleLabel(session.user.role)} · ${session.user.email}`
});
