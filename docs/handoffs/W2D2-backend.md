<!-- W2D2-BE: Registration API handoff for the next backend and frontend tasks. -->
# Handoff — W2D2-BE Backend: member registration

**Branch:** `W2D2-BE`, rebuilt from fetched `origin/main` at `704ce24`.
**Plan task:** "`POST /api/auth/register` with Zod validation; new users start as `member`"
**Status:** Review fixes verified and ready for review. Lint and production build pass. The original implementation was committed as `f6575f6`; that history is preserved locally on `backup/W2D2-BE-before-review`. This replacement changeset contains only Tuesday's work and the review fixes.

## What's done

- `src/app/api/auth/register/route.js`: public `POST /api/auth/register` accepts JSON `{ name, email, password }`. No existing login is required.
- `src/lib/validation.js`: Zod checks the input before hashing or writing. Trims names and emails, lowercases emails to match the seed, and preserves passwords exactly.
- Uses Monday's `hashPassword` and the shared Prisma client. Only explicitly named fields are inserted; the role is always `member`, regardless of extra submitted fields.
- Returns `201` with `{ user: { id, name, email, role } }`. Never returns the password or hash, and does not sign a token or set a cookie.
- Invalid fields: `400` with `{ error, errors }`, where `errors` is Zod's issues array (including each field's `path` and `message`). Malformed JSON: `400` with `{ error }`.
- Duplicate email: `409` with `{ error }`. Catches Prisma `P2002` from the database unique constraint, including simultaneous submissions.
- Hashing or database failure: `500` with a generic `{ error }`. Server logs contain only the error code or name, never the full error, query, password hash or credentials.
- A missing or blank `DATABASE_URL` is logged and returns `500` before parsing, hashing or database access. This prevents the PostgreSQL driver from falling back to a local database. The check runs during a request so builds do not require database credentials.
- Rebuilt the branch from clean main, excluding the old W1D2 commit and broken merges. Main's README, environment template, Azure setup instructions and previous handoffs are restored; the duplicate `prisma.config.mjs`, `postinstall` hook and stale skills paragraph are excluded. No schema or frontend files differ from main.
- Clarified in `AGENTS.md` that registration and login are public exceptions to the JWT requirement.

## Setup

- Declared the already locked Zod `4.6.7` as a direct production dependency.
- No new environment variables. Registration uses the existing `DATABASE_URL`; it does not require `JWT_SECRET` until login is implemented.
- After installing dependencies with `npm ci`, run `npx prisma generate` manually, following main's setup instructions. `prisma.config.ts` is the sole Prisma config; no database migration is required.

## Decisions to check with the team

- Input limits are implementation choices: name 1–100 characters after trimming, email at most 254 characters, password at least 12 characters (matching the seed) and at most 72 UTF-8 bytes (bcrypt's limit). Multibyte characters can use more than one byte.
- Extra fields are ignored; they cannot grant officer access. Duplicate email uses HTTP `409`, which the plan does not specify and which reveals whether an email is already registered.
- The endpoint creates members immediately, as Tuesday's task describes. Officer approval remains an open product decision in `architecture.md`; no approval workflow is added here.
- Seed the first officer before opening public registration. If a member has already registered that email, the seed intentionally refuses to promote the account.

## Things the next person should know

- `/register` remains the frontend placeholder; the registration form belongs to W2D2-FE. Submit the three fields above and display the documented error responses.
- Login should apply the same email trimming/lowercasing and must not trim passwords.
- No Azure requests, migrations or seed operations were run. `origin/main` was fetched with the user's approval before rebuilding the branch.
- The user authorized committing and pushing the rebuilt `W2D2-BE` branch after verification. Updating the existing PR requires a force-with-lease push because its history was rebuilt; preserve the local backup until review is complete. No merge into main is authorized.

## Verification

- Review of the original `f6575f6` reported that `npm ci`, lint and build passed on the reviewer's machine. Those are historical results, not verification of this rebuild.
- Rebuilt working tree: `npm install zod@^4.6.7 --no-audit --no-fund`, `npm run lint`, and `npm run build` passed on 2026-11-23. The build used the real Google font download with telemetry disabled; `/api/auth/register` is a dynamic route. Unrelated npm peer-metadata changes were removed from the lockfile so only Zod dependency changes remain.
- Throwaway Node checks passed with real Zod and bcrypt and a stubbed database: validation, malformed JSON, normalization, forced member role, safe response fields, duplicate/concurrent registrations, password spaces and UTF-8 byte limits, missing/empty/blank database URL, hashing failures before writes, and server logs restricted to error code/name. No test framework was added.
- No conflict markers remain in tracked project files. Setup files match `origin/main`; the replacement changeset starts directly from `704ce24`, excluding the old W1D2 and broken merge commits.
- Real signup against Azure remains untested.

## Next up

W2D3-BE: `POST /api/auth/login` and `/logout`; set and clear the httpOnly cookie. Reuse Monday's password comparison and JWT helpers, and keep email normalization consistent with registration.
