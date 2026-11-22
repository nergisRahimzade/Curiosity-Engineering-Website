# Curiosity Engineering Club Website

One Next.js 16 app (App Router, JavaScript, Tailwind) that serves the pages and the API. Data lives in
Azure PostgreSQL, read through Prisma. It is hosted on Azure App Service.

Plan and architecture: [`docs/plan/tasks.md`](docs/plan/tasks.md) and
[`docs/plan/architecture.md`](docs/plan/architecture.md). Rules for coding agents: [`AGENTS.md`](AGENTS.md).

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the values; .env is never committed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

See [`.env.example`](.env.example): `DATABASE_URL` (Azure PostgreSQL), `JWT_SECRET`, `CRON_SECRET`.

## Checks

```bash
npm run lint
npm run build
```

The full setup steps and handover notes are written in the last week of the plan.
