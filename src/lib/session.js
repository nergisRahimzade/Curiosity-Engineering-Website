// W2D5-FE: Who is logged in, as the browser sees it. The navbar reads this to
// pick its links. It asks GET /api/auth/me (W2D4-BE), which reads the httpOnly
// cookie on the server, so this code never sees the token.
//
// There is one shared copy for the whole page, so the desktop links and the
// phone menu make one request, not one each. Hiding links is for looks only:
// proxy.js and the API's role checks are what protect member and officer data.

import { useSyncExternalStore } from "react";

// status: "loading" (not asked yet) | "visitor" (not logged in) | "user".
// notice: a short message for the navbar's status line, or null.
const LOADING = { status: "loading", user: null, notice: null };
const VISITOR = { status: "visitor", user: null, notice: null };

let session = LOADING;
let started = false;
// Every request gets a number, and only the newest may change `session`.
// So a slow reply from before a login or logout can't undo it.
let latest = 0;
const listeners = new Set();

function setSession(next) {
  session = next;
  listeners.forEach((listener) => listener());
}

// The first component that needs the session starts the first request.
function subscribe(listener) {
  listeners.add(listener);
  if (!started) {
    started = true;
    refreshSession();
  }
  return () => listeners.delete(listener);
}

// Ask the server again. Call it after logging in: /me is never cached
// (Cache-Control: no-store), so the reply always matches the current cookie.
export async function refreshSession() {
  const request = ++latest;
  let next = VISITOR;
  try {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    // 200 { user } = logged in. 401 = visitor. A 500 or an HTML error page
    // also falls back to visitor: the links a visitor sees work for everyone.
    const data = response.ok ? await response.json().catch(() => ({})) : {};
    if (data.user?.role) next = { status: "user", user: data.user, notice: null };
  } catch {
    // No network: show the visitor links rather than nothing.
  }
  if (request === latest) setSession(next);
}

// After POST /api/auth/logout succeeds. No need to ask /me: the cookie is gone.
export function clearSession(notice = null) {
  latest++;
  setSession({ ...VISITOR, notice });
}

// A message for the status line (for example a failed logout), keeping who is logged in.
export function setSessionNotice(notice) {
  setSession({ ...session, notice });
}

// The page is built on the server, where nobody is logged in yet, so the first
// screen always shows "loading". The browser then swaps in the real answer.
export const loadingSession = LOADING;

export function useSession() {
  return useSyncExternalStore(subscribe, () => session, () => LOADING);
}
