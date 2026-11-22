"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { NavLinkList } from "@/components/NavLinks";

// Small-screen menu: a single toggle button that reveals the nav links.
// Hidden from sm (640px) up, where the inline links take over.
export default function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        // 44px tall so it's easy to tap (plan: at least 24px, ideally 44px).
        // The negative margin keeps the text lined up with the page edge.
        className="-mr-3 inline-flex h-11 items-center px-3 text-sm font-medium text-foreground"
      >
        {open ? "Close" : "Menu"}
      </button>

      {open && (
        <nav
          id="mobile-nav"
          aria-label="Main"
          className="absolute inset-x-0 top-full z-10 border-b border-line bg-background px-6 pb-4"
        >
          <NavLinkList pathname={pathname} onNavigate={() => setOpen(false)} />
        </nav>
      )}
    </div>
  );
}
