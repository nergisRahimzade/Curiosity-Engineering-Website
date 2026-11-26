// W2D5-FE: Who is logged in, as the browser sees it. The navbar reads this to
// pick its links. It asks GET /api/auth/me (W2D4-BE), which reads the httpOnly
// cookie on the server, so this code never sees the token.
//
// There is one shared copy for the whole page, so the desktop links and the
// phone menu make one request, not one each. Hiding links is for looks only:
// proxy.js and the API's role checks are what protect member and officer data.

import { useSyncExternalStore } from "react";

// status: "loading" (not asked yet) | "visitor" (not logged in) | "user".
// failed: true when /me couldn't answer (no network, 500, error page), so we
//   don't really know who it is. The navbar shows the visitor links meanwhile
//   and tries again (see "Trying again" below).
// notice: a short message for the navbar's status line, or null.
const LOADING = { status: "loading", user: null, failed: false, notice: null };
const VISITOR = { status: "visitor", user: null, failed: false, notice: null };
const UNKNOWN = { ...VISITOR, failed: true };

let session = LOADING;
let started = false;
// Every request gets a number, and only the newest may change `session`.
// So a slow reply from before a login or logout can't undo it.
let latest = 0;
// How many requests are still waiting for a reply, and when the last one ended.
let pending = 0;
let lastAnsweredAt = 0;
const listeners = new Set();

function setSession(next) {
  session = next;
  listeners.forEach((listener) => listener());
}

// The first component that needs the session starts the first request and
// the browser events that let a failed check recover.
function subscribe(listener) {
  listeners.add(listener);
  if (!started) {
    started = true;
    window.addEventListener("online", recheckIfFailed);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") recheckIfFailed();
    });
    refreshSession();
  }
  return () => listeners.delete(listener);
}

// Ask the server again. Call it after logging in: /me is never cached
// (Cache-Control: no-store), so the reply always matches the current cookie.
export async function refreshSession() {
  const request = ++latest;
  pending++;
  let next = UNKNOWN;
  try {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    if (response.status === 401) {
      // A real answer: not logged in. Nothing to retry.
      next = VISITOR;
    } else if (response.ok) {
      const data = await response.json().catch(() => ({}));
      if (data.user?.role) next = { status: "user", user: data.user, failed: false, notice: null };
    }
    // Anything else (500, 404, an HTML error page) stays UNKNOWN.
  } catch {
    // No network: stays UNKNOWN.
  } finally {
    pending--;
    lastAnsweredAt = Date.now();
  }
  if (request !== latest) return;

  if (next.failed) {
    scheduleRetry();
  } else {
    stopRetrying();
  }
  setSession(next);
}

// After POST /api/auth/logout succeeds. No need to ask /me: the cookie is gone.
export function clearSession(notice = null) {
  latest++;
  stopRetrying();
  setSession({ ...VISITOR, notice });
}

// A message for the status line (for example a failed logout), keeping who is logged in.
export function setSessionNotice(notice) {
  setSession({ ...session, notice });
}

// --- Trying again -----------------------------------------------------------
// One failed check mustn't leave a logged-in user with visitor links for the
// rest of the visit. We retry on a timer that waits longer each time (so a
// server that's down isn't flooded), and straight away when the browser comes
// back online, the tab is shown again, or the user opens another page.

const RETRY_DELAYS_MS = [2000, 5000, 15000, 30000, 60000];
// Those events can fire together, or right after a failure while the page is
// still drawing. Waiting this long between them keeps it to one request.
const MIN_RECHECK_GAP_MS = 1000;
let failures = 0;
let retryTimer = null;

function scheduleRetry() {
  clearTimeout(retryTimer);
  const delay = RETRY_DELAYS_MS[Math.min(failures, RETRY_DELAYS_MS.length - 1)];
  failures++;
  retryTimer = setTimeout(() => {
    retryTimer = null;
    refreshSession();
  }, delay);
}

function stopRetrying() {
  clearTimeout(retryTimer);
  retryTimer = null;
  failures = 0;
}

// Retry now, but only if the last check failed, none is already waiting and
// the last reply wasn't a moment ago. The navbar calls this on every page change.
export function recheckIfFailed() {
  if (!session.failed || pending > 0) return;
  if (Date.now() - lastAnsweredAt < MIN_RECHECK_GAP_MS) return;
  refreshSession();
}

// ---------------------------------------------------------------------------

// The page is built on the server, where nobody is logged in yet, so the first
// screen always shows "loading". The browser then swaps in the real answer.
export const loadingSession = LOADING;

export function useSession() {
  return useSyncExternalStore(subscribe, () => session, () => LOADING);
}
