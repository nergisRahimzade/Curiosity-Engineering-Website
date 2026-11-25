# AI use on this project

We use AI coding assistants openly. This file says which ones, how, and where to see what they did.

## Tools

- **Claude Code** (Anthropic): reads `CLAUDE.md`, which imports `AGENTS.md`.
- **Codex** (OpenAI): reads `AGENTS.md`.

Both follow the same rules in [`AGENTS.md`](../AGENTS.md).

## Rules

- A person reviews and understands every change before it's committed. The person who opens
  the PR is responsible for it, not the tool.
- AI never commits, pushes, merges, or touches GitHub or Azure without the person's OK.
- Commits made with an AI tool say so with a `Co-Authored-By` trailer when the tool provides one.
- Every PR has an **"AI use"** section saying which tool was used, for what, and what the person
  checked themselves.
- No secrets, passwords or member personal data are pasted into an AI tool.

## Log

| Date | Branch / PR | Tool | What it helped with |
| --- | --- | --- | --- |
| 2026-11-21 | `setup/agent-docs` | Claude Code | Wrote `AGENTS.md`/`CLAUDE.md`, the PR and handoff templates, and Markdown copies of the plan PDFs |
| 2026-11-21 | `W1D2-BE` | Claude Code | Removed Supabase/Vercel code and config, wrote the Azure database guide and `src/lib/db.js`, reviewed the Prisma setup, wrote the handoff |
| 2026-11-22 | PR #9 | Codex | Reviewed and clarified the planned Azure deployment and the branch approval and bypass guidance |
| 2026-11-22 | `W1D3-BE` | Codex | Defined the first four Prisma models, validated the schema and generated SQL offline, and wrote the backend handoff |
| 2026-11-22 | `W1D4-BE` | Claude Code | Defined the five schema part 2 models, checked them with Prisma validate/generate and an offline SQL diff, and wrote the backend handoff |
| 2026-11-22 | `setup/frontend-plan-alignment` | Claude Code | Compared the D01–D03 frontend with the new plan, moved pages to the plan's routes and route groups, fixed the accessibility gaps, turned on the jsx-a11y lint rules, wrote the handoff |
| 2026-11-23 | `W2D1-BE` | Claude Code | Wrote `src/lib/auth.js` (bcrypt + jose helpers), tested it with a throwaway script, ran lint and build, wrote the backend handoff |
| 2026-11-23 | `W2D2-BE` | Codex | Implemented registration in `f6575f6`; addressed review by rebuilding the local branch from `origin/main`, adding safe server logging and a missing-database guard, clarifying public auth routes, and updating the handoff; see the handoff for current verification results |
| 2026-11-24 | `W2D3-BE` | Claude Code | Wrote the login and logout routes, the shared session-cookie settings and login validation, checked them with curl against the Azure dev database, ran lint and build, wrote the handoff; fixed the Codex review findings |
| 2026-11-24 | `W2D3-BE` | Codex | Reviewed login/logout before commit (cross-site check, password limit) |
