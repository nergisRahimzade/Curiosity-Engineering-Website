"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navLinks } from "@/lib/site";

// "/projects/abc" should still highlight "Projects".
function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinkList({ pathname = null, onNavigate }) {
  return (
    <ul className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6">
      {navLinks.map(({ href, label }) => {
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
    </ul>
  );
}

// Reads the current path to mark the active link. Kept in its own
// client component so the rest of the navbar stays a server component.
export default function NavLinks() {
  const pathname = usePathname();
  return <NavLinkList pathname={pathname} />;
}
