# W1D1-BE handoff for repository setup

- **Branch** `W1D1-BE` from `origin/main` at `ba3ebbb`.
- **Plan task** “Create the Next.js repo, folder layout, ESLint, `.env.example`; set GitHub branch rules”
- **Status** The local setup is ready for review. Branch protection and the default Turbopack build are still pending.

## What's done

- Confirmed the Next.js App Router uses `src/app/` and `npm run lint` runs ESLint with the Next.js configuration.
- Added a root `.env.example` with blank backend variables. The Git ignore exception applies only to the root template.

## Setup

- Use an ignored root `.env` for `DATABASE_URL`, `JWT_SECRET`, and `CRON_SECRET` when the relevant tasks need them.
- The current `/projects` page optionally uses `NEXT_PUBLIC_SUPABASE_URL` and one public key. The template lists the current publishable key and the legacy anon key as commented examples.

## Decisions to check with the team

- GitHub currently reports `main` as unprotected and lists no active rulesets for it. Confirm the proposed pull-request and one-approval requirements with the project lead.
- Confirm Azure PostgreSQL and Prisma for Day 2 with Nergis. The current projects reader uses Supabase and the frontend handoff refers to Vercel, while the architecture specifies Azure PostgreSQL and Azure App Service.
- The architecture leaves the notification channel open. Add the email credential name once the team picks a provider and defines its variable.

## Things the next person should know

- The shared plan, AI usage log, and PR template are on `setup/agent-docs`. The Day 1 branch starts from the fetched `main` and depends on the setup PR for those documents.
- Codex checked the setup, wrote the template and handoff, and ran verification. At handoff, the local Graphify query needed a follow-up source search to answer the `/projects` question. The trial notes and generated graph are ignored by Git.

## Verification

- `npm run lint` passed.
- `npm run build` failed because Turbopack could not bind its worker port. The first attempt also could not reach Google Fonts.
- `npm run build -- --webpack` passed and prerendered `/projects` and the other application pages.
- `git ls-files` found the root example as an untracked, addable file. `git check-ignore` confirmed that `.env`, `.env.local`, `.env.production`, and nested `.env.example` files are ignored.

## Next up

`W1D2-BE` provisions the approved development database and verifies the Prisma connection with a read-only query.
