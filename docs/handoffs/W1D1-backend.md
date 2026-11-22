# W1D1-BE handoff for repository setup

> **Update (Nov 22, 2026):** a few things below have changed since this handoff:
> - Nergis settled the database and hosting in W1D2-BE (Azure PostgreSQL + Prisma, Azure App Service). Supabase and its variables are removed from `.env.example`.
> - The default `npm run build` (Turbopack) passed on a WSL machine on Nov 21. Only Codex's sandbox couldn't open the worker port.
> - `main` is now protected. See "Branch rule for `main`" below.

- **Branch** `W1D1-BE` from `origin/main` at `ba3ebbb`.
- **Plan task** “Create the Next.js repo, folder layout, ESLint, `.env.example`; set GitHub branch rules”
- **Status** The local setup is ready for review. Branch protection and the default Turbopack build are still pending.

## What's done

- Confirmed the Next.js App Router uses `src/app/` and `npm run lint` runs ESLint with the Next.js configuration.
- Added a root `.env.example` with blank backend variables. The Git ignore exception applies only to the root template.

## Setup

- Use an ignored root `.env` for `DATABASE_URL`, `JWT_SECRET`, and `CRON_SECRET` when the relevant tasks need them.
- The current `/projects` page optionally uses `NEXT_PUBLIC_SUPABASE_URL` and one public key. The template lists the current publishable key and the legacy anon key as commented examples.

## Branch rule for `main`

**What the plan says** (architecture, "Deploys"; page 14 of `docs/plan/architecture.pdf`): "Teammates work on branches and open pull requests; the project lead reviews before merging." A push to `main` also deploys to Azure, so nobody should push to it directly.

**What GitHub enforces** (ruleset "Protect Main Branch", active, checked Nov 22, 2026):

- Changes to `main` need a pull request.
- Force pushes and deleting `main` are blocked.
- Required approving reviews: **0**.
- Required status checks: none yet. They can be added once CI exists.

**Gap:** with 0 required approvals, any teammate with push access can merge their own pull request without the project lead's review. That review is the step the plan asks for. GitHub doesn't let people approve their own pull requests. So the usual setup is: require **1** approval, and add the repository admin (Nergis) to the ruleset's bypass list, so she can still merge her own PRs. Only an admin can change the ruleset.

## Decisions to check with the team

- Raise the `main` ruleset to 1 required approval with an admin bypass (see "Branch rule for `main`"), or confirm that 0 is intended.
- Confirm Azure PostgreSQL and Prisma for Day 2 with Nergis. The current projects reader uses Supabase and the frontend handoff refers to Vercel, while the architecture specifies Azure PostgreSQL and Azure App Service.
- The architecture leaves the notification channel open. Add the email credential name once the team picks a provider and defines its variable.

## Things the next person should know

- The shared plan, AI usage log, and PR template are on `setup/agent-docs`. The Day 1 branch starts from the fetched `main` and depends on the setup PR for those documents.
- Codex checked the setup, wrote the template and handoff, and ran verification. At handoff, the local Graphify query needed a follow-up source search to answer the `/projects` question. The trial notes and generated graph are ignored by Git.

## Verification

- `npm run lint` passed.
- `npm run build` failed because Turbopack could not bind its worker port. The first attempt also could not reach Google Fonts.
- `npm run build -- --webpack` passed and prerendered `/projects` and the other application pages.
- `.env.example` is committed. `git check-ignore` confirmed that `.env`, `.env.local`, `.env.production`, and nested `.env.example` files are ignored.

## Next up

`W1D2-BE` provisions the approved development database and verifies the Prisma connection with a read-only query.
