<!-- W2D4-FE: Home page handoff. -->
# Handoff — W2D4-FE Frontend: Home page with placeholder data

**Branch:** `W2D4-FE` (from `main` @ `d47419a`)
**Plan task:** "Home page with placeholder data"
**Status:** Done

## What's done

- **`src/app/(public)/page.js`:** replaces the placeholder with the Home page, built only from existing components (`Container`, `Button`, `Card`, `Badge`):
  - **Hero:** club name, a one-line pitch, a primary **See projects** button (`/projects`) and a secondary **Join the club** button (`/register`).
  - **Featured projects:** three `Card`s that link to `/projects`.
  - **Next events:** three rows, each a link to `/calendar`, with the date in a `<time>` tag and the event type as a `Badge`. Rows stack on phones and sit in one line from the `sm` width up.
- **`src/lib/sample-home.js` (new):** fake projects and events. Event types use the plan's list (general meeting, project meeting, competition).

## Setup

No new packages or env vars. A fresh clone needs `npx prisma generate` once before `npm run build`, because the build imports the generated Prisma client (this is not new to this task).

## Decisions to check with the team

- **Plain styling on purpose.** Colours and fonts are still placeholders, and the dark-blue/gears idea from the team's Discord isn't approved yet, so none of it is used.
- **"See projects" is the primary button and "Join the club" is secondary.** Agreed with coby.
- **The pitch sentence lives in `page.js`,** not `site.js`, so the site-wide description is unchanged. Check it matches what the club does.
- **Project cards link to `/projects`,** not to detail pages, which arrive in W3D1-FE.
- **No "Meet the officers" or "Next Event with RSVP" section.** Neither is in the plan's Home page. RSVP needs login (Week 4).

## Things the next person should know

- **Replace `sample-home.js` when real data exists:** projects in W3D1-FE and events in W3D4-FE. Delete the file then.
- The page is static (no data fetching), so it prerenders at build time.

## Verification

- `npm run lint`: 0 problems.
- `npm run build`: passes.
- Manual checks (as a visitor, `npm run dev`): the page loads, the buttons and cards open `/projects`, `/register` and `/calendar`, and the event rows stack on a narrow window.

## Next up

W2D5-FE: navbar shows links by role using `/api/auth/me`; test the full auth flow together.
