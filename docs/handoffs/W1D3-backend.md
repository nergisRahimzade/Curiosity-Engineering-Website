# W1D3-BE backend handoff for Prisma schema part 1

- **Branch** `W1D3-BE` from `origin/main` at `3e4fe4b`, including PRs #5 and #6.
- **Plan task** “Prisma schema part 1: `users`, `projects`, `project_members`, `project_overviews`”
- **Status** Schema implemented and ready for review. The initial database migration is scheduled for W1D5-BE.

## What's done

- Added the four Prisma models and mapped their tables and columns to the architecture's PostgreSQL names.
- `User` has a unique email, a password hash field, a `member` default role, and a timestamp with time zone for account creation.
- `Project` starts private and unarchived. `ProjectMember` uses the project and user IDs as a composite primary key, with a separate role for each membership. `ProjectOverview` uses the project ID as its primary key, giving each project at most one overview.

## Setup

- Run `npx prisma generate` to update the ignored local client after changing the schema. Day 3 adds no dependencies or environment variables.
- The project lead approved Azure PostgreSQL and Prisma in W1D2-BE. Azure provisioning and the live connection check remain open in the Day 2 handoff.

## Decisions to check with the team

- `User.id` and `Project.id` are auto-incrementing integers. Use `Int` for Day 4 foreign keys to these models.
- Project status is text until the team defines its allowed values. Project dates are optional PostgreSQL `DATE` columns. A timestamp such as `createdAt` uses `timestamptz`.
- Overview text is optional so the club can fill it in as details become available. Related records restrict deletion of their parent rows. Archive projects by setting `archived`.
- Memberships allow more than one lead per project pending the team decision in the architecture.

## Things the next person should know

- Club roles and per-project roles use separate enums. A future authorization check must read the project role from the membership row.
- The unique email index compares stored values. Normalize email consistently during registration and login in Week 2.
- The projects page still serves the sample data established by W1D2-BE. The plan connects the public API in W3D1-BE.
- Graphify's local code-only trial skipped `schema.prisma`. Review the schema directly.

## Verification

- `npx prisma validate` and `npx prisma generate` passed with Prisma 7.10.1.
- An offline `prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script` produced the four tables, role enums, unique email, composite membership key, overview key, and foreign keys. The command only printed SQL.
- `npm run lint` passed.
- `npm run build` passed with the default Turbopack build.

## Next up

After this PR merges, W1D4-BE adds `events`, `activities`, `tasks`, `meeting_notes`, and `attendance`. Use these project and user models for relations. Keep the first migration with W1D5-BE.
