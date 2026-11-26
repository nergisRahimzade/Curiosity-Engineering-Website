"use client";

// W2D5-FE: The navbar's "Log out" button. Posts to POST /api/auth/logout
// (W2D3-BE), which clears the httpOnly cookie, then sends the user home so a
// member or officer page isn't left on screen.

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { clearSession, setSessionNotice } from "@/lib/session";

const LOGGED_OUT = { kind: "info", text: "You're logged out." };
const FAILED = {
  kind: "error",
  text: "We couldn't log you out. Check your connection and try again.",
};

export default function LogoutButton({ onLoggedOut }) {
  const router = useRouter();
  const [sending, setSending] = useState(false);
  // A ref, not state, so a fast double click can't send two requests.
  const sendingRef = useRef(false);

  async function logOut() {
    if (sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setSessionNotice(null);

    let ok = false;
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      ok = response.ok;
    } catch {
      // No network: ok stays false.
    }

    sendingRef.current = false;
    setSending(false);

    if (!ok) {
      // Still logged in, so the button stays; the message says what happened.
      setSessionNotice(FAILED);
      return;
    }

    // The button disappears now, so focus would fall to the page's <body>.
    // Put it on <main> (the skip link's target); the status line announces
    // "You're logged out." for screen readers.
    clearSession(LOGGED_OUT);
    onLoggedOut?.();
    router.push("/");
    // Drop server-rendered pages kept from while the user was logged in.
    router.refresh();
    document.getElementById("main")?.focus();
  }

  return (
    <button
      type="button"
      onClick={logOut}
      // aria-disabled, not disabled: the button keeps focus while it works.
      aria-disabled={sending || undefined}
      className="block py-2 text-left text-sm text-muted transition-colors hover:text-foreground aria-disabled:opacity-50 motion-reduce:transition-none"
    >
      Log out
    </button>
  );
}
