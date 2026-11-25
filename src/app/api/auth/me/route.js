// W2D4-BE: Tell the frontend who is logged in, read from the session cookie.
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

const NOT_LOGGED_IN = { error: "Not logged in." };
const SERVER_ERROR = { error: "Unable to load your account. Please try again later." };

export async function GET() {
  // Read the cookie first, outside any try. With cacheComponents, Next tries to
  // prerender GET handlers at build time and stops at cookies(); returning
  // anything before this line would be saved and served as a static answer.
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  let session;
  try {
    // null = no cookie, or a token that is forged, broken or expired.
    session = await verifyToken(token);
  } catch (error) {
    // verifyToken only throws for setup mistakes, e.g. "JWT_SECRET is missing".
    console.error("GET /api/auth/me: could not check the session token:", error?.message);
    return Response.json(SERVER_ERROR, { status: 500 });
  }
  if (!session) {
    return Response.json(NOT_LOGGED_IN, { status: 401 });
  }

  // Same check as register and login: without a URL, the PostgreSQL driver can
  // silently connect to localhost instead. After the 401, so visitors never
  // need the database. (W2D5 moves this into one helper.)
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("GET /api/auth/me: DATABASE_URL is not set");
    return Response.json(SERVER_ERROR, { status: 500 });
  }

  let user;
  try {
    // Look the user up every time: the name and role come from the database,
    // not the token, so a role change or a removed account shows up at once.
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, role: true },
    });
  } catch (error) {
    // Log only the code/name: full errors can contain queries.
    console.error("GET /api/auth/me failed:", error?.code ?? error?.name);
    return Response.json(SERVER_ERROR, { status: 500 });
  }

  // null = the account no longer exists, so the old token means nothing.
  if (!user) {
    return Response.json(NOT_LOGGED_IN, { status: 401 });
  }
  // no-store: the answer depends on who is asking, so no browser or proxy may
  // keep a copy and hand one person's details to another.
  return Response.json({ user }, { headers: { "Cache-Control": "no-store" } });
}
