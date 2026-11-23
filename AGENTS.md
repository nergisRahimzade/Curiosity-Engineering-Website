<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Curiosity Engineering Club Website: agent guide

Shared instructions for every coding agent on this repo. **Codex** reads this file directly.
**Claude Code** reads it through `CLAUDE.md` (which only says `@AGENTS.md`). Put new rules here,
not in `CLAUDE.md`, so both tools always follow the same rules. Keep this file short, because
every agent reads all of it at the start of every session.

## The project

The website for a student engineering club. It's one Next.js 16 app (App Router, JavaScript, Tailwind)
that serves the pages **and** the API. The plan has it running on Azure App Service with Azure PostgreSQL through
Prisma. There are five kinds of users: visitor, member, project member, project lead, officer. The
team are beginners learning as they build, so code and explanations are written for them.

## Source of truth

- **Plan:** [`docs/plan/tasks.md`](docs/plan/tasks.md) (6-week task list, one task per day per
  layer) and [`docs/plan/architecture.md`](docs/plan/architecture.md) (roles, stack, tables,
  routes, rules). Read these Markdown copies, not the PDFs next to them: they hold the same text
  and cost far fewer tokens. If a copy and its PDF ever differ, the PDF wins.
- Read only the section your task needs (for example the task's row plus the matching
  "Backend" or "Data" section).
- If existing code, a handoff, a tutorial or a tool's suggestion goes beyond or against the plan,
  **flag it** to the user and in the PR. Don't silently follow it.

## Where things are (Nov 21, 2026)

- `src/app/`: plan routes since `setup/frontend-plan-alignment` (Nov 22). `(public)/` holds `/`,
  `/projects`, `/activities`, `/calendar`, `/register`, `/login`; `officer/` holds `/officer`. Also
  `/styleguide` (hidden) and the 404. `(member)/` is added with its first page.
- `src/components/`: `Navbar`, `Footer`, `Button`, `Card`, `Container`, `projects/ProjectGrid`.
- `src/lib/site.js` (routes + site name), `src/lib/projects.js` (project data, sample data for now), `sample-projects.js`.
- `docs/handoffs/`: one note per finished task. Read the newest ones for your layer first.
- `.env.example` (root): names of the env variables, no values. Real values go in the ignored `.env`.
- Prisma 7 (W1D2-BE): `prisma/schema.prisma` (no tables yet), `prisma.config.ts`, shared client in
  `src/lib/db.js`. The client is generated into `src/generated/prisma/` (git-ignored; run
  `npx prisma generate` after cloning or changing the schema).
- `docs/setup/azure-database.md`: how the development database on Azure is created.
- **Not built yet:** tables, API routes, auth, tests, CI.

## Decisions settled by the project lead (Nergis, Nov 21, 2026)

- **Database:** Azure PostgreSQL + Prisma only. Supabase is not used. `src/lib/projects.js` serves
  sample data until the Prisma schema and projects API exist (W1D3, W3D1).
- **Hosting:** Azure App Service. Vercel is not used. The D02–D04 handoffs mention Supabase and
  Vercel because they predate this decision.

## Known conflicts: ask the project lead (Nergis), don't settle them in code

1. **Day numbers:** the D02–D04 frontend handoffs follow an older plan. New work uses `W#D#` IDs (below).
2. **Routes:** `setup/frontend-plan-alignment` switches `/join` → `/register` and `/admin` → `/officer`
   to match the plan. Settled once Nergis merges that PR.

## Backend rules (from the architecture doc)

- API = Route Handlers at `src/app/api/**/route.js` (the plan writes `app/`; this repo uses `src/app/`).
- **Every request that changes data:** read the JWT from the httpOnly cookie, check the role
  **on the server**, then validate the body with **Zod**. Hiding a button never protects anything.
- `proxy.js` (Next 16's name for middleware) only redirects for convenience. It isn't the security.
- JWT holds `userId`, `role` (`member`/`officer`) and a 1-day expiry, signed with `JWT_SECRET` using `jose`.
  Passwords are hashed with `bcrypt`.
- **Project roles (lead/member) are never in the token.** Look them up in the database on each request.
  Editing a project = officer **or** that project's lead.
- **Sensitive actions re-check the database** (expenses, task assignment, role changes), because
  a JWT can't be taken back before it expires.
- **Data:** money in integer cents (`amount_cents`). Times are `timestamptz` in UTC, shown in Pacific.
  Unique keys stop duplicates. Projects and expenses are archived, never deleted. Store only
  name/email/role. Never store plain passwords.
- **Schema changes only through Prisma migrations**, committed with the task.
- **Secrets** (`DATABASE_URL`, `JWT_SECRET`, `CRON_SECRET`, email key) go in `.env` (ignored by
  `.env*`). List the names, with no values, in a committed `.env.example`. Never put a secret in a
  `NEXT_PUBLIC_` variable.
- Response codes: `400` with the Zod errors, `401` not logged in, `403` wrong role, `404` not
  found. Never invent data. "Not found" is an explicit result.

## Code style

- JavaScript (no TypeScript), matching the existing code.
- Each file starts with a comment saying what it's for and which task added it (e.g. `W2D1-BE`).
- Comments explain **why**, in plain words for a beginner teammate: about one short comment per
  meaningful block, not essays.
- Small functions. Keep one place for each mapping or rule (like `toProject()` in `projects.js`).
- Don't add npm packages the plan doesn't name (it names `prisma`, `@prisma/client`, `bcrypt`,
  `jose`, `zod`) without asking first.

## Workflow for every task

1. **Check the real state first:** `git status`, `git branch`, `git log --oneline -5`. Start new
   work from an up-to-date `main`.
2. **Ask the user before** changing files, installing packages, committing, pushing, opening a PR,
   or running anything that contacts a network service (GitHub, Azure, email, and the Next.js
   agent-feedback reporting step). Explain what each command does: the user is learning Git
   and the command line.
3. **One plan task = one branch = one PR.**
   - Task ID: `W<week>D<day>-BE` or `-FE`, Mon = D1 … Fri = D5 (Week 2 Tuesday backend = `W2D2-BE`).
   - Branch = the task ID. Commit messages: `W2D2-BE: short summary`.
   - Work that isn't a plan task gets a descriptive branch (e.g. `setup/agent-docs`).
4. **Never push to or merge into `main`.** The project lead reviews and merges.
5. **Before saying "done":** `npm run lint` and `npm run build` pass. There's no test suite yet. Add
   one only when the team picks a test runner.
6. **Write the handoff in the same PR:** `docs/handoffs/W#D#-backend.md` (or `-frontend.md`),
   copied from [`docs/handoffs/TEMPLATE-backend.md`](docs/handoffs/TEMPLATE-backend.md).
7. **Open the PR with the template filled in** ([`.github/pull_request_template.md`](.github/pull_request_template.md)):
   plan task, each commit and why, what was checked, AI use, open questions.
8. If you change a file another teammate owns (e.g. a frontend component), say so in the PR.

## Claude Code and Codex on the same repo

- Shared memory lives in **Git and the handoffs**, not in either tool's chat history. Start each
  session by reading this file, the task's row in `tasks.md` and the newest handoff for your layer.
- **Don't run both agents on the same branch at the same time.** They'll overwrite each other's
  edits. Hand over by committing (with the user's OK) and updating the handoff's "Status" section.
- AI use is disclosed openly: a `Co-Authored-By` trailer on the commit when the tool provides one,
  the PR's "AI use" section, and [`docs/AI_USAGE.md`](docs/AI_USAGE.md).

## Tools looked at and not adopted

- **Graphify** (code knowledge graph): one teammate is trying it locally. It's not part of the repo.
  Don't commit `graphify-out/`, `.graphifyignore`, `.graphifyrc` or Graphify skill or hook files.
  Look at it again around Week 4, when the API has grown. It doesn't list Prisma schema support.
