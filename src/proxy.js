// W2D4-BE: Send visitors away from member and officer pages before they load.
// Next.js 16 calls middleware "proxy". This is a convenience, not the security:
// every route handler that returns or changes private data checks the role
// itself (W2D5-BE), so a stale or forged cookie gets nothing from the API.
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifyToken } from "@/lib/auth";

export async function proxy(request) {
  // Reads only the token, never the database: proxy also runs on every link
  // prefetch, and Next's docs warn against slow lookups here.
  const session = await verifyToken(request.cookies.get(SESSION_COOKIE)?.value);

  // null = not logged in (or the token is broken or expired).
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Members may not open officer pages. Home for now: /dashboard isn't built yet.
  if (isOfficerPath(request.nextUrl.pathname) && session.role !== "officer") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

// The matcher compares the decoded path (/%6Ffficer counts as /officer), but
// pathname arrives still encoded, so decode it before comparing.
function isOfficerPath(pathname) {
  let path;
  try {
    path = decodeURIComponent(pathname);
  } catch {
    return true; // broken encoding, e.g. "%E0": treat it as officer-only to be safe
  }
  return path === "/officer" || path.startsWith("/officer/");
}

// Only the plan's member, project-lead and officer pages. Everything else,
// including /projects, /projects/[id] and all /api routes, skips the proxy, so
// public pages stay public and API callers never get an HTML redirect.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/rsvp/:path*",
    "/projects/:id/tasks/:path*",
    "/projects/:id/overview/:path*",
    "/officer/:path*",
  ],
};
