<!-- W2D5-FE: Navbar by role handoff. -->
# Handoff — W2D5-FE Frontend: navbar shows links by role

**Branch:** `W2D5-FE` (from `main` @ `2726e8a`, which includes W2D4-FE / PR #20)
**Plan task:** "Navbar shows links by role using `/api/auth/me`; test the full auth flow together"
**Status:** Built and checked against mocked API replies. Lint and build pass. **Blocked on
backend for a real end-to-end test:** `/api/auth/me` isn't on `main` yet (see the first decision).

## What's done

- **`src/lib/session.js` (new):** one shared copy of "who is logged in" for the page.
  - The first navbar component to need it calls `GET /api/auth/me` once. The desktop links and the
    phone menu share that one request.
  - `200 { user }` → logged in. `401`, `500`, an HTML error page or no network → visitor.
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
  The Suspense fallback still works and shows the loading links.
- **`LoginForm.js`:** calls `refreshSession()` on a `200`, so the navbar shows the member or officer
  links straight away (one line).

## Setup

No new packages or env vars.

## Decisions to check with the team

- **`/api/auth/me`, `proxy.js` and the role helpers are not on `main`.** PR #15 (W2D4-BE) was merged
  into `W2D3-BE`, and PR #16 (W2D5-BE) into `W2D4-BE`, *after* `W2D3-BE` had already been merged into
  `main` (#14). So the backend work is stranded on `W2D4-BE`. Backend needs to open
  **`W2D4-BE` → `main`**. It merges into today's `main` with no conflicts (checked with
  `git merge-tree`). Until then this navbar gets a `404` from `/me` and
  shows the visitor links to everyone, which is safe but means nobody sees "Log out" yet.
  This PR deliberately doesn't copy backend files in.
- **Officers see both "Dashboard" and "Officer".** Officers can lead projects, and "Projects I lead"
  lives on the dashboard. If the team wants officers to see only "Officer", change `roleLinks.officer`.
- **Visitors now get "Log in" in the navbar**, not only in the footer. Logged-in users have no way to
  reach the logout route otherwise, and visitors need the matching way in.
- **Logout always goes to `/`**, even from a public page like `/projects`. That's simpler than
  checking which pages are protected, and it never leaves a member page on screen.
- **A `500` from `/me` shows the visitor links.** A logged-in user would briefly see "Log in" if the
  database is down. The alternative (showing nothing) hides the public links too.
- **The footer doesn't change by role.** It's a server component, so it can't know who is logged in
  without making every page dynamic. It still shows "Join" and "Log in" to members.
- **No "Hi, {name}" in the navbar.** It's not in the plan, and it would crowd the phone layout.

## Things the next person should know

- **Another tab logging out isn't noticed** until this tab reloads or logs in. Refreshing on
  `visibilitychange` would fix that, at one database query per tab switch. Not done.
- **Back after logout** can still show a cached member page (Next keeps pages alive with
  `cacheComponents`). Member and officer pages must load their data from API routes that check the
  role (W2D5-BE helpers), so a cached screen never shows anything new.
- **Pre-existing, not from this task:** axe's `heading-order` fails on `/projects` because the project
  cards use `h3` straight after the page's `h1`. Fix in W3D1-FE (make them `h2`).
- **When `/dashboard` is built,** the "Dashboard" link and `proxy.js`'s member redirect both start
  working. Nothing to change here.

## Full auth flow to test together (Friday check-in)

Once `W2D4-BE` is on `main`, run `npm run dev` with a `.env` holding `DATABASE_URL` and
`JWT_SECRET`, in Chrome or Firefox (Safari may drop the `Secure` cookie on localhost):

1. Logged out: the navbar shows Join and Log in. `/officer` and `/dashboard` redirect to `/login`.
2. Register a new account at `/register`. The navbar still shows the visitor links (register doesn't log you in).
3. Log in. The navbar switches to Dashboard + Log out **without reloading**.
4. Open `/officer` as that member: you're sent to `/`.
5. Log out from the navbar (desktop, then again from the phone menu at a narrow width): you land on
   `/` with Join + Log in, and `/dashboard` redirects to `/login` again.
6. Log in as the seeded officer: Dashboard, Officer and Log out show. `/officer` opens, and "Officer" is highlighted.
7. Stop the server, then click Log out: the error message appears, and you're still logged in after restarting.

## Verification

Run on 2026-11-26.

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
- **Not verified:** a real login/logout against the Azure dev database (blocked: `/me` isn't on
  `main`), Safari and Firefox, a real screen reader.

## Next up

W3D1-FE: Projects list page and project detail page.
