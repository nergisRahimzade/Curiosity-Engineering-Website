# Handoff — W1D5-BE Backend: schema part 3, first migration, seed

**Branch:** `W1D5-BE` (from `main` @ `0b86e85`, which includes W1D3-BE and W1D4-BE)
**Plan task:** "Schema part 3: `rsvp_forms`, `rsvp_responses`, `expenses`, `budget`, `notification_log`; run first migration; seed script with first officer and sample data"
**Status:** Done, ready for review. The migration and seed have been applied to the development database `ceclub_dev`.

## What's done

- **Schema part 3** in `prisma/schema.prisma`, mapped to the architecture's table and column names:
  - `RsvpForm` (`rsvp_forms`): `event_id` is unique, so an event has at most one form. `questions` is JSON. `closes_at` is optional.
  - `RsvpResponse` (`rsvp_responses`): unique (`form_id`, `user_id`), so one response per user per form. `answers` is JSON.
  - `Expense` (`expenses`): `amount_cents` integer, optional `project_id`, `recorded_by` user, `archived` flag (default `false`).
  - `Budget` (`budget`): `term` is unique, so one budget per term. `total_cents` integer.
  - `NotificationLog` (`notification_log`): primary key (`event_id`, `user_id`, `kind`), so a reminder can't be logged twice. New enum `NotificationKind`: `thirty_minutes`, `five_minutes`.
- **First migration:** `prisma/migrations/20261122091540_init/` creates all 14 tables. Applied to `ceclub_dev`.
- **Seed:** `prisma/seed.mjs`, run with `npx prisma db seed`:
  - Creates the first officer from `SEED_OFFICER_NAME`, `SEED_OFFICER_EMAIL`, `SEED_OFFICER_PASSWORD` (12+ characters). The email is lowercased, and the password is stored only as a bcrypt hash (cost 10).
  - Outside production, adds sample data: 3 projects (one private), the officer as lead of one project with an overview, 1 task, 4 events (one per type), 1 RSVP form, 2 activities, a `2026-fall` budget of $500.00 and one $45.99 expense.
  - Safe to re-run: the officer, memberships, overview, RSVP form and budget use `upsert`. Other rows are found by title (or description) before creating.

## Setup

- New package: `bcrypt` (named in the plan). Run `npm ci` after pulling.
- New env vars (names in `.env.example`): `SEED_OFFICER_NAME`, `SEED_OFFICER_EMAIL`, `SEED_OFFICER_PASSWORD`.
- On a new or empty database: `npx prisma migrate dev`, then `npx prisma db seed`.
- Your IP must be in the Azure server's firewall (see `docs/setup/azure-database.md`).

## Decisions to check with the team

- **Who is the first officer?** Still open in the architecture. The seed takes the officer from `.env`, so no name or password is in the code. The dev database currently has a placeholder officer.
- **Delete rules:** every relation is `Restrict`, matching W1D3/W1D4. Ryan's question (events: `Restrict` or an `archived` flag) is still open. Changing it now needs a new migration, not an edit to `init`.
- `notification_log.kind` uses `thirty_minutes` / `five_minutes`, because enum values can't start with a digit.
- `expenses.category` and sample `projects.status` / `tasks.status` values (`completed`, `active`, `todo`, `parts`) are placeholder text until the team agrees on allowed values.
- Added indexes the plan doesn't list: `expenses(project_id)`, `expenses(date)`, `rsvp_responses(user_id)`, `notification_log(user_id)`.

## Things the next person should know

- **Never edit `prisma/migrations/*_init/migration.sql`.** Schema changes go in `schema.prisma`, then `npx prisma migrate dev --name <what-changed>` creates a new migration.
- The seed is `.mjs` and imports Prisma's generated client (`.ts`) directly. Node 22.18+ runs it without extra packages. The `--disable-warning` flag in `prisma.config.ts` hides a harmless Node notice about that.
- The seed can't use `@/lib/db`, because it runs outside Next.js. It creates its own client the same way.
- Re-running the seed never overwrites the existing officer (`update: {}`), so changing `SEED_OFFICER_PASSWORD` later doesn't change their password.
- W6D3 ("seed production with the first officer") can reuse this script: with `NODE_ENV=production`, it creates only the officer.
- `bcrypt` is already installed for W2D1-BE (`lib/auth.js`). Use the same cost (10) there.

## Verification

- `npx prisma validate`, `npx prisma format`, `npx prisma generate`: pass.
- Offline `prisma migrate diff` from `main`'s schema: only the 5 new tables, 1 enum, indexes and foreign keys. The W1D3/W1D4 tables are unchanged.
- `npx prisma migrate dev --name init`: applied to `ceclub_dev`. Prisma Studio shows all 14 tables and one row in `_prisma_migrations`.
- `npx prisma db seed`: ran. It stops with a clear message when an officer variable is missing or the password is under 12 characters (checked by hand).
- `npm run lint`: passes. `npm run build`: passes.

## Next up

- **W2D1-BE** `lib/auth.js`: hash and compare passwords with `bcrypt` (already installed), sign and verify JWTs with `jose`.
- **W2D2-BE** register route: creates `User` rows with role `member`. Lowercase emails like the seed does, so the unique email check works.
