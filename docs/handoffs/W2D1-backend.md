# Handoff — W2D1-BE Backend: password hashing and JWT helpers

**Branch:** `W2D1-BE` (from `main` @ `cf392e1`)
**Plan task:** "`lib/auth.js`: hash and compare passwords with `bcrypt`; sign and verify JWTs with `jose`"
**Status:** Done, ready for review.

## What's done

- New file `src/lib/auth.js` with four functions. No routes, cookies or pages use it yet.
  - `hashPassword(password)` → bcrypt hash (cost 10, same as `prisma/seed.mjs`).
  - `verifyPassword(password, passwordHash)` → `true` / `false`.
  - `signToken({ userId, role })` → JWT with `userId` and `role`, signed HS256 with `JWT_SECRET`, expires in 1 day (architecture: "Auth: how login works").
  - `verifyToken(token)` → `{ userId, role }` for a valid token, or `null` for a missing, fake, edited or expired one.
- If `JWT_SECRET` is missing or shorter than 32 characters, `signToken` and `verifyToken` throw a clear error instead of signing with a weak key or treating everyone as logged out.

## Setup

- New package: `jose` (named in the plan). After pulling, run `npm ci`.
- `JWT_SECRET` must be set in `.env` (the name is already in `.env.example`). Use a long random string, at least 32 characters. One way to make one:
  `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
- No schema changes, no migrations.

## Decisions to check with the team

- **Minimum secret length of 32 characters.** The plan only says "a long random string". 32 is a common minimum for HS256 keys.
- **One shared `JWT_SECRET` for the team's dev setups is fine**, but production (W6D1) needs its own, set in App Service settings only.

## Things the next person should know

- `verifyToken` returns `null` rather than throwing for bad tokens, so routes can answer `401` without a `try`. A missing `JWT_SECRET` still throws on purpose: it's a setup mistake, not a logged-out user.
- Only `HS256` is accepted when verifying, so a token can't pick a weaker algorithm to skip the check.
- Project roles (lead / member of a project) are **not** in the token, per the architecture. Look them up in the database (W2D5-BE helpers).
- Server code only. Never import `auth.js` into a `"use client"` component.
- The cookie itself (name, `httpOnly`, `secure`, `sameSite=lax`) is W2D3-BE's job.
- Running `auth.js` with plain Node (outside Next.js) prints a harmless `MODULE_TYPELESS_PACKAGE_JSON` warning. Inside Next.js there's no warning.

## Verification

- `npm run lint`: 0 problems.
- `npm run build`: passes. (Nothing imports `auth.js` yet, so the build doesn't run it; the script check below does.)
- Throwaway Node script (not committed), 10/10 passed: hash differs from the password and starts with `$2b$10$`; right password matches, wrong one doesn't; a token reads back as `{ userId: 7, role: "member" }`; a token edited from `member` to `officer`, one signed with a different key, an expired one, a missing one and garbage all return `null`; a missing `JWT_SECRET` throws.

## Next up

W2D2-BE: `POST /api/auth/register` with Zod validation; new users start as `member`. It uses `hashPassword` before saving the user. W2D3-BE (login) uses `verifyPassword` and `signToken`; W2D4/W2D5-BE use `verifyToken`.
