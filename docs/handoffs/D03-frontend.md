# Handoff — Day 3 Frontend: reusable components

**Branch:** `D03` (from `main` @ `f9d4f82`, which already includes D02)
**Plan task:** "Make reusable components (Button, Card, Container) using the style guide colors/fonts"

## What's done

- **`Container`** (`src/components/Container.js`) centers content and adds the side padding. Default width is `max-w-5xl` (1024px). `size="narrow"` gives `max-w-2xl` (672px) for forms and long text. `as="section"` changes the element. The navbar, footer, `PagePlaceholder` and the 404 page all use it now, so the site width lives in one place.
- **`Button`** (`src/components/Button.js`) has three variants and two sizes:
  - `primary`: accent fill, for the one main action on a screen
  - `secondary`: outlined, for other actions
  - `ghost`: text only, for things like "Cancel"
  - `size="sm"` (36px tall) or `md` (44px, the default, a comfortable tap size)
  - With an internal `href` it renders a Next `<Link>`. With an `http(s):`, `mailto:` or `tel:` href it renders `<a>`, and `http(s)` links open in a new tab. Otherwise it renders `<button type="button">`. Pass `type="submit"` for forms.
  - `disabled` (or `aria-disabled` on links) fades the button and blocks clicks. Keyboard focus shows an accent outline.
- **`Card`** (`src/components/Card.js`) is a bordered box with optional `media` (image on top, cropped to 4:3), `eyebrow` (small line such as a date), `title`, body text and `footer` (pinned to the bottom).
  - Pass `href` and the whole card becomes clickable. The link is on the title, so screen readers announce the project name. Hover darkens the border, and keyboard focus outlines the whole card.
  - Cards fill their grid cell, so a row lines up even when descriptions differ in length.
  - `titleAs` sets the heading level (default `h3`).
- **`/styleguide`** is a hidden page with every color, the type scale, all buttons, sample project cards and both container widths. It's not in the navbar or footer and is set to `noindex`. Use it to review components and to show the look at Friday's club review.
- **Color tokens** in `globals.css`: added `accent-hover` and `on-accent` (text on accent). Tailwind classes: `bg-accent`, `hover:bg-accent-hover`, `text-on-accent`.

## Decisions to check with design

- **Colors are still placeholders.** The approved style guide isn't in the repo yet, so the components use the Day 2 grays plus the blue accent (`#2b59c3`, 6.1:1 contrast with white text). When design hands over the colors, change the hex values in `src/app/globals.css` only. If the accent changes, keep white text on it at 4.5:1 or better, or change `--on-accent`.
- **Corner radius:** buttons use 6px (`rounded-md`), cards 8px (`rounded-lg`). Easy to change in the two component files.
- **Font:** still Geist, one family, as the design rule asks.

## Using them on Day 4 (Projects list)

```jsx
import Card from "@/components/Card";
import Container from "@/components/Container";

<Container as="section" className="py-16">
  <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
  <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {projects.map((p) => (
      <li key={p.id}>
        <Card
          href={`/projects/${p.id}`}
          media={p.photo_url && <img src={p.photo_url} alt="" />}
          eyebrow={p.date}
          title={p.title}
          footer={p.team && `Team: ${p.team}`}
        >
          {p.description}
        </Card>
      </li>
    ))}
  </ul>
</Container>
```

`media` takes any element. A plain `<img>` is simplest. To use `next/image` with Supabase Storage URLs, add the Storage host to `images.remotePatterns` in `next.config.mjs` first.

## Things the next person should know

- **Keep the `<Suspense>` wrappers in `Navbar.js`** (see the D02 handoff).
- Pass extra classes through `className`. To override a class the component already sets (e.g. Container's `px-6`), use Tailwind v4's important suffix: `px-0!`.

## Verification

- `npm run lint`: 0 problems.
- `npm run build` (Turbopack): passes; 7 routes prerender as static (the D02 six plus `/styleguide`).
- Browser check at 1280px and 390px: `/`, `/projects`, `/styleguide` return 200 and `/nope` returns 404 with correct tab titles. No sideways overflow at phone size. Clicking a card opens its link. The 404 "Back to home" button works. Tabbing to a card shows the focus outline. No console errors besides the expected 404 on the made-up URL.
- Claude's sandbox can't reach Google Fonts, so its build used a local copy of Geist. The committed code still loads Geist from Google.
