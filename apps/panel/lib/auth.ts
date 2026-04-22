import { authApplications, readSessionFromCookieValue, roleLabel, type AuthSession } from "@ustaca/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const panelApp = authApplications.panel;

export const getPanelSession = async (): Promise<AuthSession | null> => {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(panelApp.cookieName)?.value;

  return readSessionFromCookieValue("panel", cookieValue);
};

export const requireCustomerSession = async () => {
  const session = await getPanelSession();

  if (!session) {
    redirect(panelApp.loginPath);
  }

  if (session.user.role !== "customer") {
    redirect(`${panelApp.unauthorizedPath}?reason=unauthorized_role`);
  }

  return session;
};

export const redirectPanelLoginIfAuthenticated = async () => {
  const session = await getPanelSession();

  if (session) {
    redirect(panelApp.defaultRedirectPath);
  }
};

export const panelSessionSummary = (session: AuthSession) => ({
  title: session.user.name,
  detail: `${roleLabel(session.user.role)} · ${session.user.email}`
});
