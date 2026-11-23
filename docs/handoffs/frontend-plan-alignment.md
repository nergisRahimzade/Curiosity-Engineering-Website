# Handoff — Frontend: align D01–D03 with the new plan

**Branch:** `setup/frontend-plan-alignment` (from `main` @ `8fe9457`)
**Plan tasks it brings up to date:** W1D4-FE "Choose colours and fonts; install Tailwind and set them in `@theme`" (Tailwind part only) and W1D5-FE "Root layout, navbar and footer; shared `Button` and `Card` components". Not a plan task itself, so it has a descriptive branch name.
**Status:** Done

## What's done

The old D01–D03 work was checked against `docs/plan/tasks.md` and `docs/plan/architecture.md`. The review found 11 gaps; 2 were already fixed on `main` by W1D1-BE (`.env.example`, README). This branch fixes the other 9.

**Routes and route groups (gaps 1, 2, 4, 5)**
- Pages are now in the plan's route groups. The brackets don't change URLs.
  - `src/app/(public)/`: `/`, `/projects`, `/activities` (new), `/calendar`, `/register` (was `/join`), `/login` (new)
  - `src/app/officer/`: `/officer` (was `/admin`)
  - `/styleguide` and `not-found.js` stay at the top of `src/app/`.
- `/join` and `/admin` now 404. Nothing linked to them from outside the site yet.
- Navbar: Home, Projects, Activities, Calendar, Join (→ `/register`). Footer adds **Log in**. The old footer **Admin** link is gone: officers reach `/officer` after logging in, and W2D5-FE adds role-based links.
- Placeholders say "Planned for W2D4-FE" etc. instead of the old "Coming Day 6". `PagePlaceholder`'s prop is now `task` (was `comingOn`).

**Accessibility (gaps 3, 6, 7, 8)**
- **Skip link**: "Skip to content" is the first thing Tab reaches. It's hidden until focused and jumps to `<main id="main">`.
- **New-tab links**: `Button` works out where a link really opens (web links default to a new tab; a caller's `target` wins) and adds hidden "(opens in new tab)" text whenever it's `_blank`, on both external and internal links.
- **Reduced motion**: `motion-reduce:transition-none` on `Button`, `Card` and nav links.
- **Tap targets**: mobile "Menu" button 44px tall, desktop nav links and brand link 36px, footer links 28px (all were ~20px; plan minimum is 24px).

**Lint (gap 9)**
- `eslint-plugin-jsx-a11y` added to `devDependencies` (6.10.2, the same copy `eslint-config-next` already uses). `eslint.config.mjs` turns on its full recommended rule set (34 rules, up from 6).

## Setup

Run `npm install` after pulling (new devDependency). No new env vars.

## Decisions to check with the team

- **Routes**: this settles AGENTS.md known conflict #2 in favour of the plan. Nergis approves by merging.
- **No `(member)/` folder yet.** Empty route groups do nothing; add it with `/dashboard`.
- **`/officer` is a public placeholder** until `proxy.js` (W2D4-BE) blocks it. It has no data and is hidden from search engines.
- Colours and the Geist font are still placeholders until the team's W1D1–W1D4 design tasks pick the real ones.

## Things the next person should know

- `package-lock.json` in this PR also drops about 15 `"peer": true` lines. That's npm-version noise, not a real change; another npm version may add them back on `npm install`. Harmless either way.

- New pages go in the right group: public pages in `(public)/`, member pages in `(member)/`, officer pages in `officer/`.
- The jsx-a11y rules config only copies the **rules**. Don't add `jsxA11y.flatConfigs.recommended` as a whole: Next already registers the plugin, and registering it twice is an ESLint error.
- `loading.js` / `error.js` per route group are planned for W5D4-FE; they can go into the groups now if a page needs them earlier.
- `src/lib/projects.js` still has an old "Day 12" comment (line 16); that file belongs to W3D1 and wasn't changed here.

## Verification

- `npm run lint`: 0 problems. A throwaway file with an `<img>` without alt, an unlabelled `<label>` and a clickable `<div>` gave 4 jsx-a11y errors, so the rules are active.
- `npm run build`: passes; `/`, `/activities`, `/calendar`, `/login`, `/officer`, `/projects`, `/register`, `/styleguide` prerender. (The sandbox can't reach Google Fonts, so the build was run with the font temporarily removed. That change isn't committed.)
- Browser (Playwright, 1280px and 390px): first Tab focuses "Skip to content", Enter moves focus to `<main>`; tap heights measured as above; every new route returns 200 with the right title and one `<h1>`; `/join` and `/admin` return 404; `aria-current="page"` is on "Join" at `/register`.

## Next up

W2D1-FE: shared `FormField`, `Table`, `Modal` and `Badge` components. The jsx-a11y rules will now flag missing labels on `FormField`.
