<!-- W2D1-FE: Shared form, table, modal and badge components handoff. -->
# Handoff — W2D1-FE Frontend: shared FormField, Table, Modal, Badge

**Branch:** `W2D1-FE` (from `main` @ `46833d5`)
**Plan task:** "Shared `FormField`, `Table`, `Modal` and `Badge` components"
**Status:** Code done, lint passes, browser-checked. `npm run build` still needs to run on a Mac (see Verification). Not committed yet.

## What's done

All four are in `src/components/`, next to `Button` and `Card`, as `architecture.md` lists. Each file starts with a usage example.

- **`FormField`** (client component): label + `input`, `textarea` or `select` (`as="textarea"` / `as="select"`, options as children).
  - `useId()` links `<label htmlFor>` to the field, so repeated forms don't clash.
  - `error="…"` sets `aria-invalid="true"`, a red border and a message linked with `aria-describedby`. `hint="…"` is linked the same way. The error comes first, so it's read first.
  - `required` adds the HTML attribute and a visible "(required)" (words, not a red star).
  - Every other prop (`value`, `onChange`, `autoComplete`, `defaultValue`…) goes to the field. Inputs and selects are 44px tall.
- **`Table`** (server-safe, no hooks): `caption`, `columns` (`key`, `header`, optional `align: "right"`, optional `render(row)`), `rows`, `rowKey`, optional `rowHeader`, `empty`.
  - `<caption>` always present (`hideCaption` makes it screen-reader-only), `<th scope="col">`, and the `rowHeader` column becomes `<th scope="row">`.
  - Right-aligned columns use tabular numbers, so money lines up.
  - Empty `rows` shows the `empty` message in one full-width row (plan's "Empty" state).
  - Wide tables scroll sideways inside their own box on phones; the box is keyboard-focusable and named by the caption.
- **`Modal`** (client component): native `<dialog>` opened with `showModal()`, controlled by `open` / `onClose`, plus `title` and optional `footer` for buttons.
  - The browser handles focus going in, Tab staying out of the page behind, Esc to close and focus returning to the opener.
  - Icon-only × button has `aria-label="Close"` and is 44px.
  - Page scroll is locked while it's open (`html:has(dialog[open]:modal)` in `globals.css`).
- **`Badge`**: `tone` = `neutral` (default), `accent`, `success`, `danger`. The text carries the meaning; the colour only helps scanning.
- **`/styleguide`**: new Badges, Form fields, Table (filled + empty) and Modal sections. `src/app/styleguide/ModalDemo.js` is the small client wrapper for the live modal.
- **`globals.css`**: two status colours, `--danger` and `--success`, exposed as `text-danger`, `bg-success/10` etc.

## Setup

No new packages or env vars.

## Decisions to check with the team

- **Two new colours.** `danger` (#b42318) and `success` (#116329) go beyond the "2–3 colours" note in `globals.css`. Errors and Paid/Overdue badges need them; they're only used for status, always with words. Design can swap the hex values like the other placeholders.
- **Clicking the dark backdrop does not close the Modal**, on purpose: a stray tap shouldn't wipe a half-filled form. Close with ×, Esc or a Cancel button.
- **No checkbox or radio group in `FormField`.** The plan's RSVP radios need `<fieldset>` + `<legend>`; add a small `FieldGroup` with W4D5-FE when it's needed rather than guessing now.
- **Badge tones by meaning:** success = paid/done/present, danger = overdue/absent, accent = highlighted role or type. Calendar event types (4) need text labels anyway; they can all be `neutral` or `accent`.

## Things the next person should know

- **W2D2-FE (register page):** use `FormField` for name, email and password. The API returns Zod issues as `errors: [{ path, message }]`; map `path[0]` to each field's `error` prop. Move focus to the first invalid field on submit (plan: "Moving focus").
- `FormField` is a client component (it uses `useId`). That's fine: every form is a client component.
- `Table` takes `render` functions, so build columns in the page or component that renders the table. Don't pass `columns` from a server component into a client component (functions can't cross that line).
- `Table`'s caption id is made from the caption text. Pass `id` if two tables on one page share a caption.
- The `eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex` in `Table.js` is deliberate: axe requires scrollable regions to be focusable and jsx-a11y doesn't know that.
- In Chrome, Tab from the last button in a Modal briefly goes to the browser's own toolbar, then back to ×. That's normal `<dialog>` behaviour; page content behind is never reached.

## Verification

- `npm run lint`: 0 problems.
- `npm run build`: **not run to the end in the sandbox.** It stops at `src/lib/db.js` because `npx prisma generate` can't download Prisma's engine there (blocked network). That's the backend's register route and unrelated to this task. Run `npx prisma generate && npm run build` on your Mac before opening the PR.
- Browser (Playwright on `next dev`, `/styleguide`, 1280px and 390px):
  - axe-core (WCAG 2 A/AA + best practice): **0 violations**, with the modal closed and open. The first green was 4.43:1 on the badge tint, so it was darkened to 6.3:1.
  - FormField: every input/select/textarea has a label; the email error is linked via `aria-describedby` with `aria-invalid="true"`; the hint is linked on the password field.
  - Table: caption present, all header cells `scope="col"`, item names `scope="row"`, scroll region named by the caption, empty message shown, sideways scroll only inside the table at 390px.
  - Modal: opens from the keyboard with focus on ×, named by its title, Esc / × / Cancel all close it and it reopens afterwards, focus returns to "Open modal", page scroll locked while open and unlocked after, 358px wide on a 390px phone.
  - No page-level sideways scroll at 390px; no console errors.

## Next up

W2D2-FE: Register page with form validation and error messages, built from `FormField` and `Button`, posting to `POST /api/auth/register` (see `W2D2-backend.md` for responses).
