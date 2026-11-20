# Handoff — Day 2 Frontend: layout shell

**Branch:** `D02` (from `main` @ `f1edaea`)
**Plan task:** "Build the layout shell: navbar, footer, empty page for each route"

## What's done

- **Routes:** `/`, `/projects`, `/calendar`, `/join`, `/admin` each have a placeholder page. There's also a custom 404 page (`not-found.js`). Each placeholder says which plan day replaces it (Home → Day 6, Projects → Day 4, Calendar → Day 7, Join → Day 9, Admin → Day 11).
- **Navbar** (`src/components/Navbar.js`) shows the site name and links to Home, Projects, Calendar and Join. The current page's link is bold and has `aria-current="page"`. On `/projects/<id>` the Projects link stays active. Below 640px the links collapse into a "Menu" toggle that closes after you tap a link.
- **Footer** (`src/components/Footer.js`) has the club name and links, including Admin. Admin is kept out of the main nav on purpose.
- **Routes and the site name** are defined once, in `src/lib/site.js`. Adding a route means adding one line there.
- **Page titles** follow the pattern `Projects · Curiosity Engineering Club`. `/admin` is set to `noindex`.
- **Cleanup:** the create-next-app starter content and the unused starter SVGs in `public/` are gone. Geist Mono is dropped too, because the design rule allows one font.

## Decisions to check with design

- **Colors are placeholders.** The style guide wasn't in the repo, so `globals.css` sets neutral tokens: `background`, `foreground`, `muted`, `line`, plus an `accent` that nothing uses yet. Tailwind exposes them as `bg-background`, `text-muted`, `border-line` and so on. On Day 3, swap in the approved colors there and every component picks them up.
- **Dark mode is removed.** The starter template's auto dark mode would have doubled the palette. Add it back only if the style guide asks for it.

## Things the next person should know

- **Keep the `<Suspense>` wrappers in `Navbar.js`.** This app runs with `cacheComponents: true`. Under that setting, `usePathname()` suspends on dynamic routes that aren't prerendered, such as the Day 5 `/projects/[id]`. Without a Suspense boundary, the build fails. The fallback renders the same links without the active state.
- This Next.js version (16.4) differs from older docs. `AGENTS.md` says to read `node_modules/next/dist/docs/` before writing code.

## Verification

- `npm run lint`: passes with 0 problems.
- `npm run build` (Turbopack): passes. All 6 routes prerender as static.
- Tested in a browser: every route returns 200 and an unknown path returns 404. The active link and page titles are correct. The mobile menu opens, navigates and closes, with no console errors.
- The repo has no test suite and no GitHub Actions workflow yet, so lint and build are the checks that apply here (they're also what Vercel runs).

## Next up (Day 3 frontend)

Build reusable `Button`, `Card` and `Container` components. `PagePlaceholder` and the navbar/footer already use the `max-w-5xl px-6` container width, so that's the natural thing to extract into `Container`.
