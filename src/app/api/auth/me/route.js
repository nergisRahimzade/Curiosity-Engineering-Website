// W2D4-BE: Tell the frontend who is logged in, read from the session cookie.
// W2D5-BE: the checks moved into requireUser, shared with every protected route.
import { requireUser } from "@/lib/permissions";

export async function GET() {
  // 401 for no cookie, a forged/broken/expired token or a removed account.
  // The name and role come from the database, not the token.
  const auth = await requireUser();
  if (auth.response) return auth.response;

  // no-store: the answer depends on who is asking, so no browser or proxy may
  // keep a copy and hand one person's details to another.
  return Response.json({ user: auth.user }, { headers: { "Cache-Control": "no-store" } });
}
