<!-- W2D2-FE: Register page handoff. -->
# Handoff — W2D2-FE Frontend: register page

**Branch:** `W2D2-FE` (from `main` @ `379ea5d`, which includes W2D1-FE and W2D2-BE)
**Plan task:** "Register page with form validation and error messages"
**Status:** PR 18. First version committed as `ddf2ea9` (its build passed on a Mac). The review fixes below are **not committed yet**, and **`npm run build` has not been run on them**: it couldn't finish in the sandbox (see Verification). Run `npx prisma generate && npm run build` on a Mac before committing them.

## What's done

- **`src/app/(public)/register/page.js`**: replaces the placeholder. Server component (so it can set the "Join the club" tab title) with the heading, one line of intro and the form.
- **`src/app/(public)/register/RegisterForm.js`** (client component): Name, Email and Password built from `FormField`, submit with `Button`, posting JSON `{ name, email, password }` to `POST /api/auth/register`.
  - **Same rules in the browser and on the server:** it imports `registerSchema` from `src/lib/validation.js`, the schema the API uses (architecture: "One Zod schema per form").
  - **Error messages:** Zod issues from the browser check and from a `400` reply go through one helper, `issuesToErrors`, which maps `path[0]` to each field's `error` prop (first message per field). `FormField` links each one with `aria-invalid` and `aria-describedby`. A field's error clears as soon as it's edited.
  - **Three states (plan):**
    - *Sending:* fields become **read-only** (not disabled), so pressing Enter in a field leaves focus on that field. The button keeps its label "Create account" and gets `aria-disabled`. Next to it, "Creating your account…" appears in a visible `role="status"` region. A `sendingRef` blocks a second request from a click, Enter or Space.
    - *Success (`201`):* the form is replaced by "Welcome, {name}!", the email to log in with (as the server saved it, lowercased) and a **Log in** button.
    - *Error:* `400` with field issues and `409` (email taken) show on the field. `500`, other codes, an HTML or empty error page (e.g. `502`) and network failures show one message above the form.
  - **Focus, done after React updates the page:** focus requests are stored in state and carried out in a `useEffect`, which runs only once the new elements are on the page and the fields are editable again.
    - Field errors focus the first wrong field, in page order.
    - A general error focuses the message.
    - Success focuses the welcome heading.
    - A counter makes the same target focus again on a repeat attempt.
  - **Leaving the page mid-request:** this repo has `cacheComponents: true`, so Next.js keeps `/register` alive but hidden after navigating away. The request isn't cancelled: cancelling can't undo an account the server already created, and the result should be there if the visitor comes back. A reply that arrives while the page is hidden updates the message but **never moves focus**, and a focus request that was already carried out isn't repeated when the page shows again.
  - **One announcement per event:**
    - Field errors are read when their field is focused.
    - A general error is read because focus moves to it. It no longer has `role="alert"`, which would have announced it a second time.
    - "Sending" is announced once through the status region.
    - The button's name no longer changes, so a focused button isn't announced again.
  - `autocomplete` = `name`, `email`, `new-password`. `noValidate` turns off the browser's own bubbles.

## Setup

No new packages or env vars.

## Decisions to check with the team

- **No automatic login after registering.** The API returns the user but sets no cookie (W2D2-BE handoff), so success sends people to `/login`.
- **"Email already registered" is shown on the field.** That tells anyone whether an email has an account; the backend handoff flags the same trade-off with `409`.
- **No "confirm password" field and no show/hide toggle.**
- **The page says nothing about officer approval.** `architecture.md` still lists approval as open.

## Things the next person should know

- **W2D3-FE (login page):** copy the pattern: `loginSchema`, `issuesToErrors` (move it to `src/lib/` once a second form needs it), `focusRequest` + `useEffect` for focus, read-only fields and `sendingRef` while sending. Don't move focus with `requestAnimationFrame` or `setTimeout`: neither waits for React.
- **Pages stay alive when you navigate away** (`cacheComponents: true`). Effect cleanups run when the page is hidden, and effects run again when it's shown, with state kept. Don't "cancel on unmount" without checking what the visitor sees on Back. An earlier version of this fix did that, and the form came back stuck on "Creating your account…".
- Chrome trims spaces from `type="email"` fields itself. The server lowercases.
- Twelve 😀 emoji are 48 UTF-8 bytes and pass. Three 👨‍👩‍👧‍👦 family emoji are 33 characters but 75 bytes, and the shared schema rejects them with the "at most 72 bytes" message.
- Refs are separate `useRef` constants on purpose: an object of refs built during render trips the React Compiler rule `react-hooks/refs`.
- The only `role="alert"` on the page belongs to Next.js's own route announcer (`<next-route-announcer>`), not this form.
- Chrome logs "Failed to load resource: 409/400/500" in the console when the API answers with an error. That's the browser, not a bug.

## Verification

Run in the sandbox on 2026-11-25, on the PR branch at `9ab010f` plus the uncommitted fixes:

- `npm ci`: passed (511 packages).
- `npx prisma generate`: **failed (environment)**, `403 Forbidden` from the sandbox proxy fetching `binaries.prisma.sh/.../schema-engine.sha256`.
- `npm run lint`: 0 problems, before and after the fixes.
- `npm run build`: **failed (environment), so build is unverified for these fixes.** There were two errors: Google Fonts couldn't be fetched for Geist (`layout.js`), and `@/generated/prisma/client` was missing because `prisma generate` failed. Neither involves this page. The first commit's build passed on a Mac.
- **Before the fixes**, a probe reproduced the keyboard bug: after Enter in Password, focus fell to `<body>` while sending.
- **Browser (Playwright, Chromium, `next dev` with React Strict Mode, API replies mocked, no database touched).** The main suite passed 102/102 at 1280px and 390px, and the leave-and-return suite passed 22/22:
  - axe-core (WCAG 2 A/AA + best practice): 0 violations on the empty form, field errors, the `400` and `500` states and success.
  - Client validation: empty submit focuses Name and sends nothing; an all-spaces name shows "Name is required." and focuses Name.
  - `Ada@Example.COM` with spaces passes the client check. Chrome sends it trimmed, and success shows the server's lowercased email. (The schema's trim/lowercase was also checked directly with Node.)
  - Each of `400` field error, `409`, `500`, `502` HTML, `502` empty and network failure was run twice in a row. Focus landed on the right target both times, the fields were editable again, and no `role="alert"` was in the form.
  - Enter from each of Name, Email and Password: focus stayed on that field while sending, the field was read-only and the status read "Creating your account…". A following Enter + forced click + Space + Enter still sent **1** request.
  - Tab order: Name → Email → Password → Create account → Log in.
  - Leaving for `/login` mid-request with a `500` or `201` reply: focus on `/login` didn't move when the reply arrived. On Back, the result was shown, the form wasn't stuck sending and focus wasn't pulled to the old target. A retry after returning focused the error again. An already-handled `409` focus wasn't replayed on Back.
  - Autofill-style input (value set natively, then `input`/`change` events, as Chrome autofill does) reached the request body.
  - No page-level sideways scroll at 390px; no console or page errors other than the expected network lines.
- **Not verified:**
  - **A real screen reader** (VoiceOver/NVDA). The announcement strategy above is based on how these ARIA patterns are specified; it wasn't listened to.
  - **Real browser autofill and password managers.** Headless Chromium has neither, so only the simulated events were tested; no autofill problem was reproduced.
  - **Browsers other than Chromium.**
  - **A real signup against Azure.**

## Next up

W2D3-FE: Login page with loading, error and success states, posting to `POST /api/auth/login` (see `W2D3-backend.md` for responses).
