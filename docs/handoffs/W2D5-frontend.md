<!-- W2D5-FE: Navbar by role handoff. -->
# Handoff — W2D5-FE Frontend: navbar shows links by role

**Branch:** `W2D5-FE` (from `main` @ `2726e8a`, which includes W2D4-FE / PR #20)
**Plan task:** "Navbar shows links by role using `/api/auth/me`; test the full auth flow together"
**Status:** Built, plus fixes for the Codex review on PR #21. Lint and build pass. Checked
against mocked API replies and against the real `/me` and `proxy.js` (without a database).

## What's done

- **`src/lib/session.js` (new):** one shared copy of "who is logged in" for the page.
  - The first navbar component to need it calls `GET /api/auth/me` once. The desktop links and the
    phone menu share that one request.
  - `200 { user }` → logged in. `401` → visitor (a real answer, never retried).
  - `500`, `404`, an HTML error page or no network → **unknown** (`failed: true`). The navbar shows
    the visitor links meanwhile and **tries again** (Codex review P2):
    - on a timer that waits longer each time: 2s, 5s, 15s, 30s, then every 60s;
    - straight away when the browser comes back online, the tab is shown again, or the user opens
      another page;
    - those instant retries need at least 1s since the last reply, so events that fire together
      (or a failure while the page is still drawing) send one request, not a burst.
    - A success, a `401` or a logout stops the retries.
  - `refreshSession()` asks again (the login form calls it). `clearSession()` is for after logout.
  - Each request is numbered and only the newest may update the navbar, so a slow reply from before
    a login can't put the visitor links back.
  - `useSession()` is the hook components read. The server always renders the "loading" state,
    because nobody is logged in during prerendering.
- **`src/lib/site.js`:** `roleLinks` and `navLinksFor(session)`, the one place that decides the links:
  | Who | Links |
  | --- | --- |
  | loading | Home, Projects, Activities, Calendar |
  | visitor | … + Join, Log in |
  | member | … + Dashboard, then a **Log out** button |
  | officer | … + Dashboard, Officer, then **Log out** |

  An unknown role gets the member links. `/dashboard` and `/officer` come from `roleHome`
  (W2D3-FE), so they can't drift apart. `navLinks` and `footerLinks` are unchanged.
- **`src/components/LogoutButton.js` (new):** posts to `POST /api/auth/logout`.
  - A double click sends **one** request (`sendingRef`). It's `aria-disabled` while sending.
  - Success: the navbar switches to visitor links, the phone menu closes, the page goes to `/`
    and `router.refresh()` drops server-rendered pages from while you were logged in. Focus moves to
    `<main>`, because the button it was on disappears.
  - Failure (`500` or no network): the user stays logged in and on the same page, with a visible
    message ("We couldn't log you out…"). Clicking again retries.
- **`src/components/SessionNotice.js` (new):** a `role="status"` line under the navbar that's always
  on the page, so screen readers hear changes. "You're logged out." is screen-reader only (everyone
  else sees the links change). The logout error shows for everyone.
- **`NavLinks.js` / `MobileMenu.js` / `Navbar.js`:** read the session and pass it to `NavLinkList`.
  The Suspense fallback still works and shows the loading links. `NavLinks` calls
  `recheckIfFailed()` on every page change.
- **Merged `W2D4-BE` into this branch (Codex review P1):** `/api/auth/me`, `src/proxy.js`,
  `src/lib/permissions.js` (the W2D5-BE role helpers), the shared `DATABASE_URL` check in
  `src/lib/db.js`, and the W2D4/W2D5 backend handoffs. This is a plain merge of the
  already-reviewed PRs #15 and #16, with no edits.
- **`LoginForm.js`:** calls `refreshSession()` on a `200`, so the navbar shows the member or officer
  links straight away (one line).

## Setup

No new packages or env vars.

## Decisions to check with the team

- **This PR now carries backend work.** `/api/auth/me`, `proxy.js` and the role helpers were merged
  only into the stacked `W2D3-BE`/`W2D4-BE` branches (PRs #15, #16), after `W2D3-BE` had already
  reached `main` (#14), so they never got there. The navbar needs `/me`, so (Codex review P1)
  `W2D4-BE` is merged in here unchanged. That breaks "one task = one PR". The alternative was a
  separate `W2D4-BE` → `main` PR merged first. **Backend, please look over the merge commit.**
  Merging this PR brings W2D4-BE and W2D5-BE to `main`.
- **After this merges, member and officer pages need a login, also locally** (the proxy). See the
  W2D4-backend handoff's "Frontend impact" for making a test account.
- **Officers see both "Dashboard" and "Officer".** Officers can lead projects, and "Projects I lead"
  lives on the dashboard. If the team wants officers to see only "Officer", change `roleLinks.officer`.
- **Visitors now get "Log in" in the navbar**, not only in the footer. Logged-in users have no way to
  reach the logout route otherwise, and visitors need the matching way in.
- **Logout always goes to `/`**, even from a public page like `/projects`. That's simpler than
  checking which pages are protected, and it never leaves a member page on screen.
- **While `/me` is failing, the navbar shows the visitor links.** A logged-in user would briefly see
  "Log in" if the database is down, until a retry succeeds. The alternative (showing nothing) hides
  the public links too.
- **The footer doesn't change by role.** It's a server component, so it can't know who is logged in
  without making every page dynamic. It still shows "Join" and "Log in" to members.
- **No "Hi, {name}" in the navbar.** It's not in the plan, and it would crowd the phone layout.

## Things the next person should know

- **Another tab logging out isn't noticed** until this tab reloads or logs in. Retries on
  `visibilitychange` happen only after a *failed* check, so a tab switch normally sends no request.
- **Back after logout** can still show a cached member page (Next keeps pages alive with
  `cacheComponents`). Member and officer pages must load their data from API routes that check the
  role (W2D5-BE helpers), so a cached screen never shows anything new.
- **Pre-existing, not from this task:** axe's `heading-order` fails on `/projects` because the project
  cards use `h3` straight after the page's `h1`. Fix in W3D1-FE (make them `h2`).
- **When `/dashboard` is built,** the "Dashboard" link and `proxy.js`'s member redirect both start
  working. Nothing to change here.

## Full auth flow to test together (Friday check-in)

On this branch (or `main` once it merges), run `npm run dev` with a `.env` holding `DATABASE_URL` and
`JWT_SECRET`, in Chrome or Firefox (Safari may drop the `Secure` cookie on localhost):

1. Logged out: the navbar shows Join and Log in. `/officer` and `/dashboard` redirect to `/login`.
2. Register a new account at `/register`. The navbar still shows the visitor links (register doesn't log you in).
3. Log in. The navbar switches to Dashboard + Log out **without reloading**.
4. Open `/officer` as that member: you're sent to `/`.
5. Log out from the navbar (desktop, then again from the phone menu at a narrow width): you land on
   `/` with Join + Log in, and `/dashboard` redirects to `/login` again.
6. Log in as the seeded officer: Dashboard, Officer and Log out show. `/officer` opens, and "Officer" is highlighted.
7. Stop the server, then click Log out: the error message appears, and you're still logged in after restarting.
8. Logged in, stop the server and reload: you see the visitor links. Start it again: within about a
   minute (or at once when you click another page), your links come back without reloading.

## Verification

Run on 2026-11-26, then again after the Codex review fixes.

- **`npm run lint`:** 0 problems (Mac checkout).
- **`npm run build`:** passes on a clean copy (`npm ci`, 511 packages) in the cloud sandbox. As in
  W2D3, the Mac's `node_modules` can't run in the remote Linux shell. The sandbox blocks Google
  Fonts and Prisma's engine download, so **for that build only** Geist was mocked
  (`NEXT_FONT_GOOGLE_MOCKED_RESPONSES`) and the Mac's generated Prisma client was copied in. No repo
  file was changed for this. **Please run `npm run build` once on a Mac before merging.**
- **Browser (Playwright, Chromium, `next start`, `/api/auth/*` mocked, no database): 47 of 50
  checks passed.** The 3 that failed were axe's `heading-order` on `/projects`, the pre-existing
  issue above. Re-run on `/`, axe found **0 violations** (WCAG 2/2.1 A and AA plus best practice)
  for visitor, member and officer at 1280px and 390px, with the phone menu open.
  - The prerendered HTML has only the four public links, so no "Join" flash for members.
  - Links are right for visitor, member and officer, an unknown role, a `500`, a `502` HTML page and no network. Each case sends 1 `/me` request.
  - On `/officer`, "Officer" has `aria-current="page"`.
  - Logging in on `/login` switches the navbar to member links without a reload, and the success message still shows.
  - Race: a `/me` reply delayed 2.5s (visitor) that arrives after login doesn't undo the member links.
  - Logout: a double click sends 1 POST, lands on `/` with visitor links, focus is on `<main>`, and the status says "You're logged out." (screen-reader only).
  - Logout `500` and network failure: a visible error, the user stays logged in on the same page, and a retry works and clears the error.
  - Phone (390px): the menu shows officer links + Log out. Logging out closes the menu, and reopening it shows visitor links. No sideways scroll.
  - Keyboard: Tab reaches Log out, and Enter logs out.
  - No page errors.
- **Codex review fixes: 16/16 checks passed, run twice.** The server was started with a test-only
  `JWT_SECRET` and no database:
  - **Real endpoint, no mock (P1):** `GET /api/auth/me` answers `401` JSON for a visitor. The navbar
    shows visitor links and sends 1 request in 3s (a `401` isn't retried). The real proxy sends
    `/officer` without a login to `/login` with a `307`.
  - **Recovery (P2):**
    - one network error, then a good reply: the timer retries after about 2s and member links return
      with no user action, then no more requests;
    - a `500` + clicking another page, a network error + the `online` event, and a `404` + the tab
      shown again: each retries at once;
    - from the phone menu, opening another page retries;
    - server down for 8.5s: at most 3 requests (0s, 2s, 7s), and visitor links meanwhile;
    - a `500` while the page loads gives no instant second request, and `online` + visibility +
      `online` fired together give one request.
  - **Re-run of the 50 navbar checks:** 47 passed, the same 3 pre-existing `/projects` failures.
    `/officer` was checked with a token signed with the test secret, because the real proxy
    now checks it.
- **Not verified:** a real login/logout against the Azure dev database, Safari and Firefox, a real
  screen reader.

## Next up

W3D1-FE: Projects list page and project detail page.
