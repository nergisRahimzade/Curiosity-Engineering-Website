# Handoff — W1D2-BE Backend: Prisma setup and Azure database

**Branch:** `W1D2-BE` (from `main` @ `c2fedae`)
**Plan task:** "Create the development Postgres database on Azure; install Prisma and connect"
**Status:** In progress. The code side is done. Still to do: a teammate creates the Azure database
by following [`docs/setup/azure-database.md`](../setup/azure-database.md), then the connection is
checked with a `SELECT 1` query.

## What's done

- **Supabase and Vercel removed** (decision by Nergis, Nov 21, 2026, matching the architecture doc):
  - `src/lib/projects.js` no longer calls Supabase. `getProjects()` returns the sample projects
    until the projects API exists (W3D1).
  - `ProjectGrid.js` uses `isUsingSampleData` and shows a "sample projects" notice.
  - `next.config.mjs` no longer allows Supabase image hosts. W3D3 adds the Azure Blob host.
  - The Supabase variables are removed from `.env.example`, and `.vercel` from `.gitignore`.
  - `README.md` is rewritten. `AGENTS.md` records the decision. The D02–D04 handoffs have superseded notes.
- **Prisma 7.10.1 installed**:
  - `prisma/schema.prisma`: a PostgreSQL datasource and no tables yet.
  - `prisma.config.ts`: the schema and migrations paths. It loads `DATABASE_URL` from `.env` through `dotenv`.
  - `src/lib/db.js`: one shared `prisma` client that connects through the `@prisma/adapter-pg`
    driver adapter. It keeps one client on `globalThis` in development, so hot reload doesn't open
    new database connections.
- **`docs/setup/azure-database.md`**: step-by-step guide for creating the development database
  with an Azure for Students subscription.

## Setup

- Packages: `@prisma/client`, `@prisma/adapter-pg` (dependencies), plus `prisma` and `dotenv`
  (dev dependencies).
- After cloning or changing the schema, run `npm install` and then `npx prisma generate`.
- In `.env`: `DATABASE_URL="postgresql://USER:PASSWORD@SERVER.postgres.database.azure.com:5432/ceclub_dev?sslmode=require"`.
  Get the values privately from the teammate who owns the Azure subscription, and ask them to add
  your IP to the server's firewall.
- No migrations yet. The first one is W1D5.

## Decisions to check with the team

- **Two packages the plan doesn't name**, approved by Nergis:
  - `@prisma/adapter-pg`: Prisma 7 can't connect to a database without a driver adapter.
  - `dotenv`: Prisma 7 no longer loads `.env` on its own.
- **Generated TypeScript:** Prisma 7's `prisma-client` generator writes only `.ts`, `.mts` or
  `.cts` files. They're git-ignored and never edited. Next.js compiles them, and the build doesn't
  turn the repo into a TypeScript project. Our own code stays JavaScript.

## Things the next person should know

- Import the client with `import { prisma } from "@/lib/db";`, and only in server code. Never
  import it in a `"use client"` component.
- `src/generated/prisma/` is missing on a fresh clone until you run `npx prisma generate`.
- ESLint skips `src/generated/**` because Prisma's generated files trigger warnings.
- `/projects` shows sample data on purpose until W3D1.

## Verification

- `npm run lint`: passes, with no warnings.
- `npm run build`: passes with the default Turbopack build. No `tsconfig.json` is created.
- `npx prisma validate`: the schema is valid.
- `npx prisma generate`: the client is generated into `src/generated/prisma/`.
- Database connection: **pending** until the Azure database exists.

## Next up

- Finish this task: put `DATABASE_URL` in `.env`, run a throwaway `SELECT 1` script through
  `src/lib/db.js`, then record the result here.
- **W1D3-BE**, schema part 1: add `users`, `projects`, `project_members` and `project_overviews`
  to `prisma/schema.prisma`.
