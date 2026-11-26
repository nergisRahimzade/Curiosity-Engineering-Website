import { Suspense } from "react";
import Link from "next/link";
import NavLinks, { NavLinkList } from "@/components/NavLinks";
import MobileMenu from "@/components/MobileMenu";
import SessionNotice from "@/components/SessionNotice";
import Container from "@/components/Container";
import { site } from "@/lib/site";

// With cacheComponents on, usePathname() suspends on dynamic routes that
// aren't known at build time (e.g. /projects/[id] later on). The Suspense
// fallback renders the same links without an active state, so the build
// never fails and the navbar never flashes empty.
// W2D5-FE: the links change by role; see NavLinks and src/lib/session.js.
export default function Navbar() {
  return (
    <header className="relative border-b border-line">
      <Container className="flex h-16 items-center justify-between">
        <Link href="/" className="py-2 text-sm font-semibold tracking-tight">
          {site.shortName}
        </Link>

        <nav aria-label="Main" className="hidden sm:block">
          <Suspense fallback={<NavLinkList />}>
            <NavLinks />
          </Suspense>
        </nav>

        <Suspense fallback={null}>
          <MobileMenu />
        </Suspense>
      </Container>

      {/* W2D5-FE: announces "You're logged out." and shows logout errors. */}
      <SessionNotice />
    </header>
  );
}
