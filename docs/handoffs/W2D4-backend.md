<!-- W2D4-BE: Session lookup and page protection handoff for the next backend and frontend tasks. -->
# Handoff — W2D4-BE Backend: `/api/auth/me` and page protection

**Branch:** `W2D4-BE`, stacked on `W2D3-BE` @ `525ff5c` (PR #14, not merged yet). Rebase onto
`origin/main` once #14 merges, before opening this PR.
**Plan task:** "`GET /api/auth/me`; middleware protecting member and `/officer` pages"
**Status:** Done. Verified against the Azure dev database. Scoped lint
(`npx eslint --ignore-pattern 'notes/**'`) and build pass.

## What's done

- `src/app/api/auth/me/route.js`: public `GET /api/auth/me`.
  - `200` `{ user: { id, name, email, role } }` with `Cache-Control: no-store`.
  - **Name and role come from the database**, not the token, so a role change or a removed
    account shows up at once.
  - `401` `{ error: "Not logged in." }` for no cookie, a forged, broken or expired token, or an
    account that no longer exists.
  - `500` generic `{ error }` for a missing `JWT_SECRET`, a missing `DATABASE_URL` (checked
    only after the `401`, so visitors never need the database), or a database failure.
    Logs hold only the error code/name (or the setup message for `JWT_SECRET`).
- `src/proxy.js` (Next 16's name for middleware): runs only on the plan's protected pages:
  `/dashboard`, `/rsvp/*`, `/projects/[id]/tasks`, `/projects/[id]/overview`, `/officer/*`.
  - No valid session → `307` to `/login`.
  - Signed in but not an officer, on `/officer/*` → `307` to `/`. The path is decoded first,
    because the matcher matches decoded paths (`/%6Ffficer` counts as `/officer`); a broken
    encoding counts as an officer path.
  - Reads only the token, never the database (Next's docs: proxy also runs on every prefetch).

## Setup

- No new packages, env vars or migrations.

## Decisions to check with the team

- **Non-officers are sent to `/`**, because `/dashboard` doesn't exist yet. Switch to
  `/dashboard` in `src/proxy.js` once that page is built.
- **No `?next=` return link** after login: not in the plan, and the login form would need it.
- **The proxy trusts the role in the token** (as the plan describes). A demoted officer can still
  open officer *pages* until the token expires (up to 1 day), so officer data must come only from
  route handlers that re-check the role in the database (W2D5).
- **`/me` has no Origin check**: a `GET` changes nothing, and another site can't read the answer.
- **The `DATABASE_URL` guard now has a third copy** (register, login, me). Agreed to move it into
  one helper in W2D5, where `requireUser` is built, so this PR doesn't touch W2D3's files.

## Things the next person should know

- **Frontend (Navbar, W2D5-FE):** call `GET /api/auth/me` from the browser. `200` → show links by
  `user.role`; `401` → treat as a visitor. The browser never reads the JWT itself.
- **Proxy is a convenience, not the security.** Every route handler that returns or changes
  private data must check the session and role itself (W2D5 helpers).
- **Project lead pages** (`/projects/[id]/overview`): the proxy only checks for a login. Whether
  the user leads that project is a database check, done by the page/API (`requireProjectLead`).
- **`GET` handlers whose answer depends on the request (like `/me`): read `cookies()`/`headers()`
  first, outside any `try`.** This app has `cacheComponents: true`, so `next build` prerenders
  `GET` handlers until they touch request data
  (`node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md`, "With Cache
  Components"). Anything returned before that, such as the `DATABASE_URL` guard's `500`, would be
  saved as a static answer, and a `try` around `cookies()` catches Next's "stop prerendering"
  signal and logs it as an error (the first W2D4 build did exactly that). Public `GET` handlers
  that don't need the request shouldn't read cookies just for this: they can stay prerendered.
- New member or officer page outside these paths? Add it to `matcher` in `src/proxy.js`.
  `/projects` and `/projects/[id]` must stay public; `/api/*` must never be matched (API callers
  would get HTML redirects instead of `401`).

## Verification

- `npx eslint --ignore-pattern 'notes/**'`: clean. `npm run build`: passes.
- Manual checks with `curl` against `npm run dev` and the Azure dev database (2026-11-24):
  - registered two test members (`w2d4-test-a-1795515246@example.com` id 3,
    `w2d4-test-b-1795515246@example.com` id 4; both stay in the dev database; their random
    passwords were never saved) and logged both in;
  - `/me` with A's cookie → A only; with B's cookie → B only; `Cache-Control: no-store`;
  - `/me` → `401` for no cookie, a garbage cookie, an expired token, a token signed with another
    key, and a valid token for a user id that doesn't exist;
  - a valid token for A with `role: "officer"` (made by a throwaway script): the proxy lets it
    into `/officer`, while `/me` still answers `role: "member"` from the database;
  - proxy, visitor (no cookie, expired or wrongly signed token): all six protected paths → `/login`;
  - proxy, member: `/officer` and `/officer/expenses` → `/`; `/dashboard` and
    `/projects/1/tasks` pass through (404, because those pages aren't built yet);
  - after the Codex review fix: a member on `/%6Ffficer`, `/%6ffficer`, `/officer%2Fexpenses`,
    `/%6Ffficer/members` or `/officer/%E0` → `/` (before the fix, `/%6Ffficer` got no redirect);
    an officer passes through; a visitor → `/login`;
  - stays public, never redirected: `/`, `/projects`, `/projects/1` (404, not built yet),
    `/login`, and `/api/auth/me` (`401` JSON, not a redirect).
- Not checked: a real browser, and a real officer account (none exists yet).

## Next up

W2D5-BE: `requireUser`, `requireOfficer`, `requireProjectLead`, `requireOfficerOrLead`. Reuse
`SESSION_COOKIE` + `verifyToken`, re-check the role in the database for sensitive actions, and move
the `DATABASE_URL` guard into one shared helper.
