<!-- W2D4-FE: Home page handoff. -->
# Handoff — W2D4-FE Frontend: Home page with placeholder data

**Branch:** `W2D4-FE` (from `main` @ `d47419a`)
**Plan task:** "Home page with placeholder data"
**Status:** Done

## What's done

- **`src/app/(public)/page.js`:** replaces the placeholder with the Home page, built only from existing components (`Container`, `Button`, `Card`, `Badge`):
  - **Hero:** club name, a one-line pitch, a primary **See projects** button (`/projects`) and a secondary **Join the club** button (`/register`).
  - **Sample-data notice:** a small visible note that projects and events are samples, like the one on `/projects`.
  - **Featured projects:** the first three from `getProjects()` (`src/lib/projects.js`), the same data layer `/projects` uses. If it fails or returns nothing, the section is hidden.
  - **Next events:** three rows, each a link to `/calendar`, with the time in a `<time>` tag (formatted in Pacific time by `formatEventTime`) and the event type as a `Badge`. Rows stack on phones and sit in one line from the `sm` width up.
- **`src/lib/sample-home.js` (new):** placeholder events only (January 2027 dates, so they stay upcoming through the Jan 4 deadline). Each event stores just `startsAt`.

## Setup

No new packages or env vars. A fresh clone needs `npx prisma generate` once before `npm run build`, because the build imports the generated Prisma client (this is not new to this task).

## Decisions to check with the team

- **Plain styling on purpose.** Colours and fonts are still placeholders, and the dark-blue/gears idea from the team's Discord isn't approved yet, so none of it is used.
- **"See projects" is the primary button and "Join the club" is secondary.** This was the frontend author's choice. If the club's main goal for the site is new members, "Join" could be primary instead.
- **The pitch sentence lives in `page.js`,** not `site.js`, so the site-wide description is unchanged. Check it matches what the club builds.
- **Featured projects are the first three of `getProjects()`,** which sorts newest first. There is no "featured" flag in the data yet.
- **Project cards link to `/projects`,** not to detail pages, which arrive in W3D1-FE.
- **No "Meet the officers" or "Next Event with RSVP" section.** Neither is in the plan's Home page. RSVP needs login (Week 4).

## Things the next person should know

- **W3D1:** the Home page needs no change when `getProjects()` switches to Prisma, except the card link, which becomes `/projects/${p.slug}` once detail pages exist. Remove the sample-data notice's project wording when `isUsingSampleData` is false.
- **W3D4 (events):** replace `nextEvents` from `sample-home.js` with real events, then delete that file and the notice. The section takes the first three items as given, so the real query must drop past events and sort by `startsAt` first, or old meetings will show.
- Move `formatEventTime` to a shared file (for example `src/lib/events.js`) when the calendar page also needs it.

## Verification

- `npm run lint`: 0 problems.
- `npm run build`: passes.
- Manual checks (as a visitor, `npm run dev`): the page shows the sample-data note, the same three newest projects as `/projects`, and January event times; the buttons, cards and event rows open `/projects`, `/register` and `/calendar`; the event rows stack in a narrow window.

## Next up

W2D5-FE: navbar shows links by role using `/api/auth/me`; test the full auth flow together.
