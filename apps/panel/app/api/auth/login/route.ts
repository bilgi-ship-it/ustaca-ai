import { authenticateBootstrapCredentials, authApplications, createSessionCookie } from "@ustaca/auth";
import { NextResponse } from "next/server";

const app = "panel" as const;

export async function POST(request: Request) {
  const formData = await request.formData();
  const result = authenticateBootstrapCredentials(app, {
    email: String(formData.get("email") ?? ""),
    password: String(formData.get("password") ?? "")
  });

  if (!result.ok) {
    const redirectUrl = new URL(
      result.reason === "unauthorized_role"
        ? authApplications[app].unauthorizedPath
        : authApplications[app].loginPath,
      request.url
    );

    redirectUrl.searchParams.set(
      result.reason === "unauthorized_role" ? "reason" : "error",
      result.reason
    );

    return NextResponse.redirect(redirectUrl, 303);
  }

  const sessionCookie = createSessionCookie(result.session);
  const response = NextResponse.redirect(new URL(authApplications[app].defaultRedirectPath, request.url), 303);

  response.cookies.set(sessionCookie.name, sessionCookie.value, sessionCookie.options);

  return response;
}
