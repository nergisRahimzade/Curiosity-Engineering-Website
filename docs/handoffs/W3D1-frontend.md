<!-- W3D1-FE: Projects list and detail pages handoff. -->
# Handoff — W3D1-FE Frontend: Projects list page and project detail page

**Branch:** `W3D1-FE` (from `main` @ `f0342c3`, which includes W2D5-FE / PR #21)
**Plan task:** "Projects list page and project detail page"
**Status:** Done with sample data. Lint and build pass. The pages switch to real data when
W3D1-BE changes two functions in `src/lib/projects.js` (see "Backend dependency").

## What's done

- **`/projects` (`src/app/(public)/projects/page.js`, `src/components/projects/ProjectGrid.js`):**
  - Cards link to `/projects/<id>` (the plan's ID route) instead of the old text slugs.
  - Card titles are **`h2`** (`titleAs="h2"`), which fixes the W2D5 axe `heading-order` failure.
    `Card`'s default stays `h3`: the Home page uses it under the "Featured projects" `h2`, and the
    styleguide uses it under section `h2`s, so both are correct as they are.
  - Each card shows the date range ("Nov 2025 – May 2026", "Since Mar 2026") and the status as a
    `Badge` with text ("Active", "Completed"). "Status:" is read out to screen readers.
  - The intro no longer mentions "Open to join". The empty, error and loading states are unchanged
    and still separate, so a failed read never looks like an empty list.
- **`/projects/[id]` (new, `src/app/(public)/projects/[id]/`):**
  - `page.js` is a server component: "← All projects" link, sample-data notice, `h1` title, status
    badge, dates in `<time dateTime>` tags, photo (if any) and summary. The tab title is the
    project's name (`generateMetadata`).
  - `loading.js` shows a skeleton plus a working back link, with "Loading project…" in a
    `role="status"` for screen readers.
  - `not-found.js` ("Project not found" plus "See all projects") is shown for **every** id that has
    no public project: badly formed (`abc`, `0`, `1.5`, `-1`, too big for `Int`), the old slugs
    (`solar-tracker`), missing (`999`), **private or archived**. The page, wording and tab title are
    the same for all, so nobody can tell a private project exists.
- **`src/app/(public)/projects/error.js` (new):** a client component for when reading projects
  throws. It shows "Projects couldn't load" in a `role="alert"`, a **Try again** button (Next 16's
  `retry()` prop, not `reset`) and "See all projects". It sets its own `<title>`, because Next sends
  none when a page fails. It never shows the error message.
- **`src/lib/projects.js`:** now the single place that decides what "public project info" is.
  - `getPublicProjects()` and `getPublicProject(id)` (number id; `null` for missing, private or
    archived). Both are cached with the `"projects"` tag.
  - `publicProjectWhere` (`isPublic: true, archived: false`) and `publicProjectSelect` (only `id`,
    `title`, `summary`, `status`, `imageUrl`, `startDate`, `endDate`) are ready to pass to Prisma.
  - `parseProjectId()` uses the same rule as the backend's `projectIdParam` (whole number 1–2147483647).
  - `toProject()` reads the Prisma field names (camelCase), which fixes the W1D3 handoff warning
    about `start_date`/`image_url`. `getProjects()` was renamed `getPublicProjects()`.
- **`src/lib/sample-projects.js`:** rows shaped exactly like the Prisma `Project` model (number ids).
  Row 6 is **private on purpose**, to prove `/projects/6` shows "Project not found".
- **`src/components/projects/BackToProjects.js` (new):** the shared "← All projects" link.
- **Home page (`src/app/(public)/page.js`):** Featured cards now link to `/projects/<id>` and show
  the dates. The `Team:` line is gone.

## Setup

No new packages, env vars or migrations.

## Backend dependency (W3D1-BE)

There is no projects API yet, and this task doesn't add one. The plan has W3D1-BE build it.

- **Proposed shared approach:** in W3D1-BE, replace the two sample lines in `getPublicProjects()`
  and `getPublicProject()` with the Prisma queries written in the comments beside them, set
  `isUsingSampleData = false` and delete `sample-projects.js`. The server components keep calling
  these functions directly (the architecture allows it). `GET /api/projects` and
  `GET /api/projects/[id]` should call the **same** functions, so the page and the API can't
  disagree about what's public. Let database errors **throw**: the pages already show an error state.
- **Until then the data is sample data,** labelled with a visible notice on `/`, `/projects` and
  `/projects/[id]`. The notice disappears by itself when `isUsingSampleData` is `false`.

## Decisions to check with the team

- **Lead, Team and "Open to join" were removed from all public pages** (approved by Coby). Lead and
  team names come from `project_members` (memberships and people's names), and "open to join" isn't
  a column. **Nergis:** the comment above `toProject()` in `projects.js` explains how to bring them
  back if you want them (decide what membership info is public, backend adds it to the select or a
  migration, frontend shows it). The old versions are in git history before this branch.
- **`next build` will need the database once W3D1-BE switches to Prisma.** `/` and `/projects` are
  prerendered at build time (cached for 1 minute, then refreshed). In a test where
  `getPublicProjects()` threw, **the build failed**, even though both pages catch the error. So a
  build with no `DATABASE_URL` or no network to Azure (CI, a teammate without `.env`) would fail.
  Options for backend/Nergis: accept it (Azure App Service builds can reach the database), or have
  those pages read at request time (e.g. `await connection()` before reading). Not changed here.
- **"Project not found" pages answer HTTP `200`, not `404`.** The detail page sends its static shell
  first and streams the content, so the status is already sent when the project turns out to be
  missing. Next adds `<meta name="robots" content="noindex">`, so search engines skip it. Getting a
  real `404` would mean making the whole page wait (no shell). Not worth it for now.
- **Photos only show from site paths** (`/photos/x.jpg`). Remote URLs are skipped, because
  `next.config.mjs` allows no image hosts until W3D3 adds Blob Storage, and an unlisted host would
  crash the page. W3D3: add the host there and widen the `startsWith("/")` check in `toProject()`.
- **No alt-text column.** Card photos use `alt=""` (the title right beside them names the project).
  The detail photo uses "Photo of the <title> project". W3D3 could add an `image_alt` column.
- **Status is free text** (W1D3 handoff), so every status gets the neutral badge, tidied for display
  ("in_progress" → "In progress"). Colour per status can come once the values are agreed.

## Things the next person should know

- **Next keeps the previous page mounted but hidden** after client-side navigation
  (`cacheComponents`). Browser tests that count elements must count only visible ones.
- **`notFound()` works by throwing.** Never wrap it in `try/catch` (use `unstable_rethrow` if you must).
- **W3D5-FE officer forms:** call `revalidateTag("projects")` after a create or edit.
- **W3D2-FE** builds `/projects/[id]/overview` (lead or officer). Nothing private is read here.

## Verification

Run on 2026-11-27.

- **`npm run lint`:** 0 problems (on the Mac checkout, through the linked shell).
- **`npm run build`:** passes on a clean copy (`npm ci`) in the cloud sandbox. As in W2D3/W2D5, the
  Mac's `node_modules` can't run in the Linux shell, and the sandbox blocks Google Fonts, so **for
  that build only** Geist was mocked (`NEXT_FONT_GOOGLE_MOCKED_RESPONSES`). No repo file was changed
  for this. `/projects` is static (1m revalidate); `/projects/[id]` is partial prerender. **Please
  run `npm run build` once on a Mac before merging.**
- **Browser (Playwright + Chromium, `next start`, axe-core WCAG 2/2.1 A+AA + best practice): 70/70.**
  - At 1280px and 390px: `/projects` has one `h1` then five card `h2`s. Links are `/projects/1`–`5`.
    The private project isn't listed. No Lead/Team/Open to join. The sample notice and status text
    show. No sideways scroll. **axe 0 violations** (heading-order fixed).
  - Clicking a card opens its detail page with the right `h1`, tab title, `<time>` values and sample
    notice. **axe 0 violations**. The back link returns to the list.
  - Keyboard: Tab reaches the first card link, the card shows a 2px focus outline, Enter opens it.
  - Direct URLs `/projects/1` and `/5` render. `/6` (private), `/999`, `/0`, `/abc`, `/1.5`, `/-1`,
    `/solar-tracker`, `/99999999999` and `/2147483648` all show "Project not found" with `noindex`.
    The private one is identical to `/999` and never contains its title. axe 0 on that page.
  - Home: Featured cards link to `/projects/1`–`3`, no `Team:`. axe 0 at both widths.
  - **States, using throwaway sandbox copies of `projects.js` (not in the repo):** a runtime read
    failure shows `error.js` with its title and `role="alert"`, no error text leaked, not disguised
    as "not found" or sample data; Try again re-requests (axe 0). An empty list shows "No projects
    yet" under the `h1` (axe 0) and Home hides Featured projects. A 3s delay shows the loading
    skeleton with a working back link, which is then replaced by the project.
  - No page errors in any run.
- **Not verified:** real data (no W3D1-BE yet), Safari/Firefox, a real screen reader, the list's
  own error card at runtime (`/projects` is prerendered, so a runtime failure serves the last good
  copy; the build-time case is the build failure above).

## Next up

W3D2-FE: Dashboard "Projects I lead" section; project edit and private overview pages.
