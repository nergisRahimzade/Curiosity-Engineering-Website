// W2D5-BE: Permission checks for route handlers: who is logged in, and may they do this?
//
// Each helper returns { user } when the request is allowed, or { response } (a ready
// 401/403/500 answer) when it isn't:
//
//   const auth = await requireOfficer();
//   if (auth.response) return auth.response;
//   // auth.user = { id, name, email, role }, read from the database just now
//
// Kept out of auth.js on purpose: src/proxy.js imports auth.js, and the proxy
// must not load Prisma on every page request.
import { cookies } from "next/headers";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";
import { databaseUrlMissing, prisma } from "@/lib/db";

const SERVER_ERROR = "Something went wrong on our side. Please try again later.";

// Builds the "not allowed" result every helper returns.
function deny(status, error) {
  return { response: Response.json({ error }, { status }) };
}

// Logged in, with an account that still exists. 401 otherwise.
export async function requireUser() {
  // Read the cookie first, outside any try: with cacheComponents, `next build`
  // prerenders GET handlers until they touch request data (see the W2D4 handoff).
  const token = (await cookies()).get(SESSION_COOKIE)?.value;

  let session;
  try {
    // null = no cookie, or a token that is forged, broken or expired.
    session = await verifyToken(token);
  } catch (error) {
    // verifyToken only throws for setup mistakes, e.g. "JWT_SECRET is missing".
    console.error("requireUser: could not check the session token:", error?.message);
    return deny(500, SERVER_ERROR);
  }
  if (!session) return deny(401, "Not logged in.");

  if (databaseUrlMissing("requireUser")) return deny(500, SERVER_ERROR);

  let user;
  try {
    // Always ask the database, never trust the token's role: a token can't be
    // taken back, so this is what makes a demotion or removal count at once.
    user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, role: true },
    });
  } catch (error) {
    // Log only the code/name: full errors can contain queries.
    console.error("requireUser failed:", error?.code ?? error?.name);
    return deny(500, SERVER_ERROR);
  }

  // null = the account no longer exists, so the old token means nothing.
  if (!user) return deny(401, "Not logged in.");
  return { user };
}

// Logged in and an officer right now. 401 / 403 otherwise.
export async function requireOfficer() {
  const auth = await requireUser();
  if (auth.response) return auth;
  if (auth.user.role !== "officer") return deny(403, "Only officers can do this.");
  return auth;
}

// Logged in and the lead of this project. Being an officer doesn't count here
// (an officer passes only if they really lead this project); use
// requireOfficerOrLead for "officer or lead" actions.
export async function requireProjectLead(projectId) {
  checkProjectId(projectId);
  const auth = await requireUser();
  if (auth.response) return auth;
  return checkLead(auth, projectId, "Only this project's lead can do this.");
}

// Logged in and either an officer or the lead of this project (e.g. editing a project).
// Officers pass without any project lookup, so the route must still answer 404
// when the project doesn't exist.
export async function requireOfficerOrLead(projectId) {
  checkProjectId(projectId);
  const auth = await requireUser();
  if (auth.response || auth.user.role === "officer") return auth;
  return checkLead(auth, projectId, "Only officers or this project's lead can do this.");
}

// Largest id a PostgreSQL Int column can hold.
const MAX_INT_ID = 2147483647;

// Route params arrive as strings ("12"). The route must check and convert them
// first with Zod and answer 400 itself, so a wrong value here is a coding
// mistake: fail loudly. Fixed message: never echo the value, which could be
// something holding private data, into the server log.
function checkProjectId(projectId) {
  if (!Number.isInteger(projectId) || projectId < 1 || projectId > MAX_INT_ID) {
    throw new TypeError(`projectId must be a whole number from 1 to ${MAX_INT_ID}`);
  }
}

// Project roles are never in the token: look up this user's role in this project.
async function checkLead(auth, projectId, message) {
  let membership;
  try {
    membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: auth.user.id } },
      select: { projectRole: true },
    });
  } catch (error) {
    console.error("project lead check failed:", error?.code ?? error?.name);
    return deny(500, SERVER_ERROR);
  }

  // null = not on this project at all (or no such project).
  if (membership?.projectRole !== "lead") return deny(403, message);
  return auth;
}
