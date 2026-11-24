// W2D3-BE: Log out by clearing the session cookie.
import { cookies } from "next/headers";
import { isSameOrigin, SESSION_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/auth";

export async function POST(request) {
  // Stops another site from logging our visitors out (see isSameOrigin).
  if (!isSameOrigin(request)) {
    return Response.json({ error: "Log out from this site." }, { status: 403 });
  }

  // Same name, path and flags as login, but empty and with maxAge 0, so the
  // browser replaces the login cookie and drops it at once. Works even when
  // nobody is logged in, so the frontend can always call it.
  (await cookies()).set(SESSION_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 });
  return Response.json({ ok: true });
}
