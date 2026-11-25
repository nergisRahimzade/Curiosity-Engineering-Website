<!-- W2D5-BE: Permission helpers handoff for the Week 3 API tasks. -->
# Handoff — W2D5-BE Backend: role helpers

**Branch:** `W2D5-BE`, stacked on `W2D4-BE` (@ `68ce33a`), which is stacked on `W2D3-BE`
(PR #14, not merged yet). Rebase onto `origin/main` after #14 and the W2D4 PR merge.
**Plan task:** "Role helpers: `requireUser`, `requireOfficer`, `requireProjectLead`,
`requireOfficerOrLead`"
**Status:** Done. Verified against the Azure dev database. Scoped lint
(`npx eslint --ignore-pattern 'notes/**'`) and build pass.

## What's done

- `src/lib/permissions.js` (new): four helpers for route handlers. Each returns `{ user }` when
  allowed, or `{ response }` (a ready `401`/`403`/`500` answer) when not:

  ```js
  import { z } from "zod";
  import { requireOfficerOrLead } from "@/lib/permissions";

  // "12" from the URL → 12. Must fit a PostgreSQL Int column.
  const projectIdParam = z.coerce.number().int().min(1).max(2147483647);

  export async function PATCH(request, { params }) {
    const id = projectIdParam.safeParse((await params).id); // params is a Promise in Next 16
    if (!id.success) {
      return Response.json({ error: "Invalid project id.", errors: id.error.issues }, { status: 400 });
    }
    const auth = await requireOfficerOrLead(id.data);
    if (auth.response) return auth.response;
    // auth.user = { id, name, email, role }, read from the database just now.
    // Officers pass without a project lookup: answer 404 here if the project doesn't exist.
  }
  ```

  | Helper | Allowed | Otherwise |
  | --- | --- | --- |
  | `requireUser()` | logged in, account still exists | `401` |
  | `requireOfficer()` | officer | `401` / `403` |
  | `requireProjectLead(projectId)` | lead of **that** project. Being an officer doesn't count: an officer passes only if they really lead it | `401` / `403` |
  | `requireOfficerOrLead(projectId)` | any officer (no project lookup, so the route still checks the project exists), or lead of that project | `401` / `403` |

  - **The role always comes from the database**, never the token, so a demotion or a removed
    account counts on the very next request.
  - **Project roles** are looked up in `project_members` for the requested project on every
    call (never in the token). Not on the project, or no such project → `403`.
  - `projectId` must already be a whole number from 1 to 2147483647 (PostgreSQL `Int`). Validate
    the route param with Zod and answer `400` yourself, as in the example. Anything else (e.g. the
    raw string `"12"`) is a coding mistake and throws a `TypeError` (→ `500`) with a fixed message
    that never includes the value.
  - `500` `{ error }` for a missing `JWT_SECRET` or `DATABASE_URL`, or a database failure; logs
    hold only the error code/name.
- `src/lib/db.js`: `databaseUrlMissing(where)`, the one copy of the `DATABASE_URL` check (logs and
  returns `true`; the caller answers `500`). Used by `requireUser`, register and login.
- `src/app/api/auth/me/route.js`: now just `requireUser()` plus its answer. Same contract as W2D4.
- `src/app/api/auth/register/route.js` and `login/route.js`: their 5-line `DATABASE_URL` checks
  became one `databaseUrlMissing(...)` line each. No other change.

## Setup

- No new packages, env vars or migrations.

## Decisions to check with the team

- **Always re-check the role in the database** (the plan only requires it for sensitive
  actions). One primary-key lookup per protected request; simpler and safer than deciding per
  route which actions count as sensitive. The token's `role` is now used only by `src/proxy.js`
  for page redirects.
- **New file `src/lib/permissions.js`** (the plan's `lib/` list names only `auth.js`, `db.js`,
  `validation.js`): `src/proxy.js` imports `auth.js`, so putting Prisma lookups there would load
  Prisma on every page request.
- **Being an officer doesn't count in `requireProjectLead`**: an officer passes only if they
  really lead that project. Use `requireOfficerOrLead` for "officer or lead" actions, as the plan
  names them separately.
- **Archived projects aren't treated specially** yet: a lead of an archived project still passes.
  Decide in W3D1/W3D2 whether archived projects can be edited.

## Things the next person should know

- **Week 3 routes:** call a helper first (it reads the cookie before anything else, which also
  keeps `GET` handlers from being prerendered), then validate the body with Zod, then do the work.
- Files touched outside this task: `register/route.js` (W2D2-BE) and `login/route.js` (W2D3-BE,
  PR #14), one line each. If #14 changes those lines in review, the rebase stops there once: keep
  the `databaseUrlMissing(...)` line.

## Frontend impact

- **None directly**: these are server helpers. `GET /api/auth/me` keeps the same contract
  (`200 { user }` / `401`); only its rare `500` message text changed.
- From Week 3, protected APIs answer `401` (not logged in) or `403` (logged in, not allowed)
  with `{ error }`. Show `error` as is, and send users to `/login` on a `401`.

## Verification

- `npx eslint --ignore-pattern 'notes/**'`: clean. `npm run build`: passes.
- Manual checks (2026-11-24) through a temporary route (`src/app/api/w2d5-check`, deleted before
  committing) against `npm run dev` and the Azure dev database, with tokens from a throwaway
  script. Test data, all left in the dev database: private projects "W2D5 test project 1" (id 4)
  and "W2D5 test project 2" (id 5), archived after the test; test member A (id 3) lead of project
  4, test member B (id 4) plain member of project 4.
  - visitor → `401` from all four helpers; a token for a user id that doesn't exist → `401`;
  - A: `requireUser` `200`, `requireOfficer` `403`, lead of 4 → `200` for both lead helpers,
    project 5 → `403` for both;
  - B (plain member of 4): `403` from both lead helpers and from `requireOfficer`;
  - B promoted to officer in the database, still holding a **member**-role token:
    `requireOfficer` `200`, `requireOfficerOrLead` `200` for 4 and 5, `requireProjectLead(5)` `403`;
  - B demoted again, holding an **officer**-role token: `requireOfficer` `403`,
    `requireOfficerOrLead(5)` `403`;
  - `projectId` `"4"` (string) or `0` → `500` with the `TypeError` in the server log;
  - after the Codex review fix: `2147483647` reaches the lookup (`403`, no Prisma error);
    `2147483648`, `0` and `"4"` throw, and the log shows only the fixed message, never the value;
    the Zod example above accepts `"12"` and `"2147483647"` and rejects `"abc"`, `"0"`, `"-3"`,
    `"1.5"`, `"2147483648"` and `""`;
  - `/me` unchanged: `200` with `Cache-Control: no-store`, `401` without a cookie;
  - login (wrong password → `401`) and register (existing email → `409`) still reach the database.
- Not checked: a real browser, a real officer account (B was promoted by a script).

## Next up

W3D1-BE: Projects API: list and get (public), create (`requireOfficer`), update
(`requireOfficerOrLead`).
