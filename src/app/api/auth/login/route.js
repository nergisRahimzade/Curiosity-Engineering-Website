// W2D3-BE: Log in with email and password. On success, set the session cookie.
import { cookies } from "next/headers";
import {
  isSameOrigin,
  SESSION_COOKIE,
  SESSION_COOKIE_OPTIONS,
  signToken,
  verifyPassword,
} from "@/lib/auth";
import { databaseUrlMissing, prisma } from "@/lib/db";
import { loginSchema } from "@/lib/validation";

// One answer for "no such email" and "wrong password", so a stranger can't use
// login to find out which emails have accounts.
const WRONG_LOGIN = { error: "Email or password is incorrect." };
const SERVER_ERROR = { error: "Unable to log you in. Please try again later." };
const CROSS_SITE = { error: "Log in from this site's own login page." };

export async function POST(request) {
  if (!isSameOrigin(request)) {
    return Response.json(CROSS_SITE, { status: 403 });
  }

  if (databaseUrlMissing("POST /api/auth/login")) {
    return Response.json(SERVER_ERROR, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send a valid JSON body." }, { status: 400 });
  }

  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: "Invalid login details.", errors: result.error.issues },
      { status: 400 },
    );
  }

  const { email, password } = result.data;
  let user;
  try {
    user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, role: true, passwordHash: true },
    });
    // An unknown email skips bcrypt, so it answers a bit faster. Accepted while
    // register's 409 reveals which emails exist anyway (see the W2D3 handoff).
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return Response.json(WRONG_LOGIN, { status: 401 });
    }
  } catch (error) {
    // Log only the code/name: full errors can contain queries and password hashes.
    console.error("POST /api/auth/login failed:", error?.code ?? error?.name);
    return Response.json(SERVER_ERROR, { status: 500 });
  }

  try {
    // userId and role come from the database row, never from the request body.
    const token = await signToken({ userId: user.id, role: user.role });
    (await cookies()).set(SESSION_COOKIE, token, SESSION_COOKIE_OPTIONS);
  } catch (error) {
    // Signing errors hold no credentials (e.g. "JWT_SECRET is missing"), so the
    // message is safe to log and says exactly what to fix.
    console.error("POST /api/auth/login: could not sign the session token:", error?.message);
    return Response.json(SERVER_ERROR, { status: 500 });
  }

  // The token stays in the httpOnly cookie; the body only names the user.
  return Response.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}
