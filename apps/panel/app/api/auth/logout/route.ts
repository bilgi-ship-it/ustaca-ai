import { authApplications, createClearedSessionCookie } from "@ustaca/auth";
import { NextResponse } from "next/server";

const app = "panel" as const;

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL(authApplications[app].loginPath, request.url), 303);
  const cookie = createClearedSessionCookie(app);

  response.cookies.set(cookie.name, cookie.value, cookie.options);

  return response;
}
