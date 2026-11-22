# Handoff — Day 4 Frontend: Projects list page

> **Superseded (Nov 21, 2026):** the project now uses Azure PostgreSQL + Prisma and Azure App Service.
> Supabase and Vercel, mentioned below, are no longer used. `/projects` shows sample data until W3D1-BE.

**Branch:** `D04` (from `main` @ `263c515`, which already includes D03)
**Plan task:** "Projects list page: fetch and show project cards"

## What's done

- **`/projects` shows project cards from Supabase.** Newest first, 3 columns on laptop, 2 on tablet, 1 on phone. Each card links to `/projects/<slug or id>` (the Day 5 detail page; until then those links 404).
- **Data layer** (`src/lib/projects.js`): `getProjects()` reads the `projects` table through Supabase's REST API with plain `fetch`. No new npm package needed. It uses only the public (anon/publishable) key, so Row Level Security decides what visitors see.
  - Cached with `"use cache"` + `cacheLife("minutes")`: the page is prerendered at build and refreshed at most once a minute, so a row added in the Supabase dashboard shows up within about a minute.
  - Tagged `projects`. When the add/edit forms land, call `revalidateTag("projects")` after saving so changes show straight away.
  - `toProject()` is the one place that maps table columns to what the page uses (see "Columns the page reads" below).
- **Card details:** date as "Mar 2026" (or free text like "Spring 2026" as typed), title, short description, and a footer with **Lead** and **Team**. Projects that are looking for people get an **"Open to join"** tag.
- **Photos:** shown with `next/image` when a project has `photo_url`. `next.config.mjs` now allows images from the Supabase project's public Storage path (`/storage/v1/object/public/**`), read from `NEXT_PUBLIC_SUPABASE_URL`. If no project has a photo, cards skip the image area so the page doesn't fill with empty grey boxes. If some do, the ones without get a plain tinted block so rows still line up.
- **Empty state:** "No projects yet" with a "Join the club" button, shown when the table returns no rows (or RLS hides them all). Design's Day 4 empty-state mockup can replace the wording.
- **Loading state:** three grey placeholder cards (`ProjectGridSkeleton`) inside a `<Suspense>`. Because the page is prerendered, visitors will rarely see it.
- **No keys = sample data.** Without the Supabase env vars, the page shows 5 sample projects (`src/lib/sample-projects.js`) under a visible note saying so. Anyone can work on the frontend without the keys. If that note ever appears on the live site, the env vars are missing on Vercel.

## Setup

Add these to `.env.local` (and Vercel → Settings → Environment Variables) if they aren't there from Day 1:

```
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon or publishable key>
```

`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` works too (newer Supabase key name). Restart `npm run dev` after editing `.env.local`.

## Columns the page reads (for the backend)

The page asks for `select=*` and picks what it needs, so extra columns are fine and it won't break while the table is still changing. If a column has a different name, add it to `toProject()` in `src/lib/projects.js`.

| Shown as | Column it reads (first one found) |
| --- | --- |
| link | `slug`, else `id` |
| Title | `title`, `name` |
| Description | `summary`, `description` |
| Date + sort order | `date`, `start_date`, `created_at` |
| Team | `team` (text, or an array of names) |
| Lead | `lead`, `lead_name` |
| Photo | `photo_url`, `cover_url`, `image_url` |
| "Open to join" tag | `open_to_join`, `accepting_members`, or `status = 'open'` |

RLS must allow `select` on `projects` for the `anon` role. Otherwise the page shows the empty state.

## How the project lead's announcement affects this page

The scope grew on Nov 21 (officer and member pages, audit log, meeting notes, forms, task distribution; deadline moved to Jan 4). For the Projects list:

- **"See which projects are available":** that's the "Open to join" tag. A filter ("Only open projects") is easy to add later if the club wants one.
- **Project leads don't have to be officers:** the card shows the lead as a plain name, with no tie to officer status. Suggestion for the backend: store the lead as `lead_member_id` → `members.id` rather than in an officers table. Then the "edit project overview" permission can be "officer **or** this project's lead" in RLS, and the card can show the member's name.
- **Editing project overview/details:** whoever builds that form calls `revalidateTag("projects")` after saving.

## Things the next person should know

- **Day 5 detail page:** add `getProject(slug)` next to `getProjects()` in `src/lib/projects.js` and reuse `toProject()`. `/projects/[id]` is a dynamic route, so under `cacheComponents` it needs `generateStaticParams` or a `<Suspense>` around the part that reads `params` (see the D02 note about Navbar).
- **A Supabase error during `next build` fails the build.** On Vercel that's a safety net: a wrong key blocks the deploy and the previous version stays live. After launch, if Supabase errors during the once-a-minute refresh, visitors keep seeing the last good list and the error goes to the server log.
- `ProjectsError` ("Projects couldn't load") is what you'll see in `npm run dev` when the key or RLS is wrong.
- Keep the `<Suspense>` wrappers in `Navbar.js` (D02).

## Verification

- `npm run lint`: 0 problems.
- `npm run build` (Turbopack): passes. `/projects` prerenders as static with a 1-minute refresh (`Revalidate 1m, Expire 1h`).
- Tested against a local mock of Supabase's REST API at 1280px and 390px:
  - **3 rows, 2 with photos:** photos load through `next/image`, the "Open to join" tag shows, newest first, cards line up (image areas, titles and card heights match to the pixel), no sideways scroll on phone. The request sends the `apikey` header.
  - **Empty table:** "No projects yet" with a working button.
  - **401 from Supabase at build:** build fails with the Supabase message, as intended.
  - **401 after launch:** the page keeps serving the last good list; the error is logged.
  - **No env vars:** 5 sample projects plus the note.
  - Clicking a card, or Tab to it then Enter, opens `/projects/<id>`. Keyboard focus outlines the whole card.
  - Only console errors: 404s from Next prefetching `/projects/<id>`, which is Day 5's page.
- Same caveat as Days 2–3: the sandbox can't reach Google Fonts, so its build used a local Geist. The sandbox also needed `images.dangerouslyAllowLocalIP` to load photos from a `localhost` mock. Neither change is in the commit.
