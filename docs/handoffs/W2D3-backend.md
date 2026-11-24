<!-- W2D3-BE: Login and logout API handoff for the next backend and frontend tasks. -->
# Handoff — W2D3-BE Backend: login and logout

**Branch:** `W2D3-BE` (from `origin/main` @ `46833d5`)
**Plan task:** "`POST /api/auth/login` and `/logout`; set and clear the httpOnly cookie"
**Status:** Done, with Codex review fixes. Verified against the Azure dev database. Scoped lint
(`npx eslint --ignore-pattern 'notes/**'`) and build pass.

## What's done

- `src/app/api/auth/login/route.js`: public `POST /api/auth/login`, JSON `{ email, password }`.
  - A request from another site (its `Origin` doesn't match this host): `403` `{ error }`.
  - `200` with `{ user: { id, name, email, role } }`, and sets the `session` cookie holding a
    signed JWT (`userId`, `role`, 1-day expiry). The token is never in the response body.
  - `userId` and `role` come from the database row, never from the request.
  - Unknown email and wrong password both return the same `401`
    `{ error: "Email or password is incorrect." }`, and set no cookie.
  - Malformed JSON: `400` `{ error }`. Invalid fields: `400` `{ error, errors }` (Zod issues).
  - Missing `DATABASE_URL`, database/bcrypt failure, or signing failure: generic `500`. Logs hold
    only the error code/name; signing failures log the message (e.g. "JWT_SECRET is missing"),
    which contains no credentials.
- `src/app/api/auth/logout/route.js`: public `POST /api/auth/logout`. Clears the cookie (same
  name, path and flags, empty value, `maxAge: 0`). `200` `{ ok: true }`, even when nobody is
  logged in; `403` `{ error }` for a request from another site.
- `src/lib/auth.js`: `TOKEN_LIFETIME_SECONDS = 86400` now drives both the JWT expiry and the
  cookie's `maxAge`, so they expire together. New exports `SESSION_COOKIE` (`"session"`) and
  `SESSION_COOKIE_OPTIONS` (`httpOnly`, `secure`, `sameSite: "lax"`, `path: "/"`, `maxAge`),
  and `isSameOrigin(request)` (see Decisions).
- `src/lib/validation.js`: one shared `email` rule (trim, lowercase, max 254, email format) and
  one shared 72-byte password check, used by `registerSchema` and the new `loginSchema`. The
  login password is `min(1)`, at most 72 bytes, and never trimmed. Registration's rules and
  error codes are unchanged.

## Setup

- No new packages and no migrations. Login needs `DATABASE_URL` and `JWT_SECRET` in `.env`
  (both already in `.env.example`). Make `JWT_SECRET` with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
- After cloning or pulling: `npm ci`, then `npx prisma generate`.

## Decisions to check with the team

- **Cookie name** `session` is our choice; the plan doesn't name it.
- **Origin check on login and logout (beyond the plan, from the Codex review).** `sameSite=lax`
  stops other sites from *sending* our cookie, but login and logout don't need one, and their
  response can still *set* it. Without a check, a form on another site could log a visitor into
  the attacker's account, or log them out. `isSameOrigin` compares the `Origin` header to
  `X-Forwarded-Host`/`Host`, the same rule Next.js applies to Server Actions (Route Handlers get
  no such check). A request with no `Origin` (curl, server tools) is allowed, since browsers
  always send one on a POST. Routes that need a login are already covered by `sameSite=lax`.
  On Azure, App Service passes the original `Host` through; re-test once deployed (W6D2).
- **No dummy bcrypt compare for unknown emails.** An unknown email answers slightly faster than
  a wrong password, so timing could reveal which emails exist. Not worth fixing while
  registration's `409` reveals the same thing directly. If Nergis drops the `409`, add one.
- **Logout only clears the cookie.** A copied JWT stays valid until it expires (up to 1 day).
  The architecture doc accepts this; sensitive actions re-check the database (W2D5).
- **`secure: true` on localhost:** Chrome and Firefox accept it on `http://localhost`; Safari may
  refuse to store it, so test login in Chrome or Firefox locally.
- **Pre-existing, not fixed here:** `prisma/seed.mjs` checks only that `SEED_OFFICER_PASSWORD`
  is at least 12 characters. A password over 72 bytes is silently cut short by bcrypt. Add the
  same 72-byte check to the seed before the first officer is created (W6D3).

## Things the next person should know

- **Read the session with** `(await cookies()).get(SESSION_COOKIE)?.value`, then `verifyToken()`
  from `src/lib/auth.js`. `verifyToken` returns `{ userId, role }` or `null`.
- In Next 16, `cookies()` is async, and `.set`/`.delete` only work in Route Handlers and Server
  Functions (`node_modules/next/dist/docs/01-app/03-api-reference/04-functions/cookies.md`).
- **The `DATABASE_URL` guard is now copied in two routes** (register, login). W2D4's `/me` would
  be the third copy: move it into one shared helper then, or make `src/lib/db.js` fail at
  request time.
- The dev server prints a `pg` warning that `sslmode=require` is now treated as `verify-full`.
  Connections to Azure work; it predates this task.
- On the author's machine, plain `npm run lint` fails only because of old build output in a
  local, untracked `notes/` folder; `npx eslint --ignore-pattern 'notes/**'` is clean. Other
  clones aren't affected.
- If Azure connections time out (Prisma `P1001`), your public IP changed: Azure portal →
  Networking → Add current client IP address.

## Verification

- `npx eslint --ignore-pattern 'notes/**'`: clean (see the note above about plain `npm run lint`).
- `npm run build`: passes; `/api/auth/login` and `/api/auth/logout` are dynamic routes. The build
  downloads the Geist font from Google Fonts.
- `npx prisma migrate status` against the Azure dev database: up to date (1 migration).
- Manual checks with `curl` against `npm run dev` and the Azure dev database (2026-11-24):
  - registered one test member (`w2d3-test-1795508955@example.com`, id 2, stays in the dev
    database; its random password was never saved);
  - login with the email in capitals plus spaces → `200`, cookie
    `HttpOnly; Secure; SameSite=lax; Path=/; Max-Age=86400`;
  - wrong password and unknown email → identical `401` bodies, no cookie;
  - malformed JSON, invalid email, empty password → `400`;
  - the token passes the app's own `verifyToken`: `userId` 2 and `role` `member` match the
    database row; HS256; `exp - iat` = 86400 s;
  - logout → `200`, `session=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=lax`.
- After the Codex review fixes (same day; wrong password, so `401` = the Origin check passed):
  - login with no `Origin`, `Origin: http://localhost:3000`, or a matching `X-Forwarded-Host`
    → `401`; `Origin` of another site, another port, `null` or a malformed value → `403`;
  - logout with no `Origin` or the same origin → `200` and clears the cookie; another site → `403`;
  - login password of 73 ASCII bytes, or 37 × `é` (74 bytes) → `400`; 72 bytes → `401`;
  - registration still answers `too_small` (under 12 characters) and the 72-byte error, as before.
- Not checked: a real browser (including Safari), officer login (no officer account exists yet),
  and the Origin check behind Azure App Service (re-test at deploy, W6D2).

## Next up

W2D4-BE: `GET /api/auth/me` reads `SESSION_COOKIE`, verifies it with `verifyToken`, and looks
the user up in the database; plus `src/proxy.js` redirects for member and officer pages.
