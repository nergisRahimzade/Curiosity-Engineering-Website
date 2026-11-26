"use client";

// The navbar's links. W2D5-FE: the list now depends on who is logged in
// (src/lib/session.js): visitors get "Join" and "Log in", members get
// "Dashboard", officers get "Dashboard" and "Officer", and anyone logged in
// gets a "Log out" button.

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { loadingSession, useSession } from "@/lib/session";
import { navLinksFor } from "@/lib/site";

// "/projects/abc" should still highlight "Projects".
function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Draws the list for a given path and session. With no session (the
// navbar's Suspense fallback), it shows the public links only.
export function NavLinkList({ pathname = null, session = loadingSession, onNavigate }) {
  return (
    <ul className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
      {navLinksFor(session).map(({ href, label }) => {
        const active = pathname !== null && isActive(pathname, href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`block py-2 text-sm transition-colors motion-reduce:transition-none ${
                active
                  ? "font-medium text-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          </li>
        );
      })}
      {session.status === "user" && (
        <li>
          <LogoutButton onLoggedOut={onNavigate} />
        </li>
      )}
    </ul>
  );
}

// Reads the current path (to mark the active link) and the session. Kept in
// its own client component so the rest of the navbar stays a server component.
export default function NavLinks() {
  const pathname = usePathname();
  const session = useSession();
  return <NavLinkList pathname={pathname} session={session} />;
}
