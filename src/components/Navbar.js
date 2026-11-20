import { Suspense } from "react";
import Link from "next/link";
import NavLinks, { NavLinkList } from "@/components/NavLinks";
import MobileMenu from "@/components/MobileMenu";
import { site } from "@/lib/site";

// With cacheComponents on, usePathname() suspends on dynamic routes that
// aren't known at build time (e.g. /projects/[id] later on). The Suspense
// fallback renders the same links without an active state, so the build
// never fails and the navbar never flashes empty.
export default function Navbar() {
  return (
    <header className="relative border-b border-line">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight">
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
      </div>
    </header>
  );
}
