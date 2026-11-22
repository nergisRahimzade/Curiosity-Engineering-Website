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
