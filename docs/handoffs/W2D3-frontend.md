<!-- W2D3-FE: Login page handoff. -->
# Handoff — W2D3-FE Frontend: login page

**Branch:** `W2D3-FE` (from `main` @ `7f6c769`, which includes W2D2-FE and W2D3-BE)
**Plan task:** "Login page with loading, error and success states"
**Status:** Committed on `W2D3-FE`, PR open for review. Lint and build pass (see Verification for how the build was run; please re-run `npm run build` once on a Mac).

## What's done

- **`src/app/(public)/login/page.js`**: replaces the placeholder. It's a server component (so it can set the "Log in" tab title) with the heading, one line of intro and the form.
- **`src/app/(public)/login/LoginForm.js`** (client component): Email and Password built from `FormField`, and a submit `Button`. It posts JSON `{ email, password }` to `POST /api/auth/login`. It copies the register form's pattern on purpose, as the W2D2 handoff asked:
  - **Same rules in the browser and on the server:** it uses `loginSchema` from `src/lib/validation.js`.
  - **Loading:**
    - Fields become read-only (not disabled), so pressing Enter in a field leaves focus on that field.
    - The button keeps its label and gets `aria-disabled`.
    - "Logging you in…" appears in a visible `role="status"` region.
    - `sendingRef` blocks a second request from a click, Enter or Space.
  - **Errors:**
    - `400` with field issues: the message goes on the field, and focus moves to the first wrong field.
    - `401`: "Email or password is incorrect." goes **above the form**, not on a field, because the server deliberately doesn't say which one was wrong. Focus moves to the message.
    - `403` (cross-site), `500`, other codes, HTML or empty error pages and network failures: a general message above the form, which gets focus. The server's `error` text is used when there is one.
  - **Success (`200`):** the form is replaced by "Welcome back, {name}!" and "You're logged in as {email}", with a button chosen by role:
    - officer → **Go to officer home** (`/officer`)
    - member → **Go to your dashboard** (`/dashboard`)

    Focus moves to the heading. The token stays in the httpOnly cookie, and this code never sees it.
  - **Focus and leaving mid-request** work the same as on `/register`: a `focusRequest` plus `useEffect`, and `visibleRef` so a reply that arrives while the page is hidden (`cacheComponents`) never moves focus.
  - `autocomplete` = `email` and `current-password`, so password managers fill in the saved login. `noValidate` turns off the browser's own bubbles.
  - A "New here? Join the club" link goes to `/register`.
- **`src/lib/form-errors.js` (new):** `issuesToErrors(issues, fields)` and `firstInvalidField(errors, fields)`, moved out of `RegisterForm.js` now that a second form needs them (the W2D2 handoff's suggestion). `RegisterForm.js` imports them and behaves the same, which was checked in the browser.
- **`src/lib/site.js`:** new `roleHome` map, the one place that says where each role goes after login. The W2D5 navbar can reuse it.

## Setup

No new packages or env vars. To try a real login locally you need `DATABASE_URL` and `JWT_SECRET` in `.env` (see the W2D3-BE handoff). Test in **Chrome or Firefox**: the cookie is `Secure`, and Safari may refuse it on `http://localhost`.

## Decisions to check with the team

- **Success shows a message and a button; it doesn't redirect automatically.** This matches register's success state and the plan's "success state". Coby chose the role-based button.
- **`/dashboard` doesn't exist yet**, so members' "Go to your dashboard" shows the 404 page until the dashboard task is built. `/officer` is still a placeholder.
- **No `?next=` return-to-page after login.** The plan doesn't mention it. If W2D4's `proxy.js` redirects to `/login`, decide then whether it should send people back to where they were. If so, only accept paths on this site (starting with a single `/`), or the link could send people to another website.
- **The navbar doesn't change after login yet.** That's W2D5-FE (it reads `/api/auth/me`). Coming back to `/login` in the same visit still shows the success message, because Next keeps the page alive.
- **No "Forgot password?" link and no show/hide password toggle.** Neither is in the plan.
- **The password stays filled in after a `401`,** so someone who mistyped only the email doesn't have to retype it.

## Things the next person should know

- **Files changed in someone else's area:** `RegisterForm.js` (import only) and `src/lib/site.js` (one new export).
- **The register and login forms now repeat the same focus/visibility code** (`focusRequest`, `visibleRef`, `handledFocusRef`, `sendingRef`). If a third form (RSVP, officer forms) needs it, move it into one hook such as `useFormFocus` instead of copying it a third time.
- **W2D5-FE (navbar by role):** read `roleHome` from `site.js` for the "Dashboard" / "Officer" link. Logging out is `POST /api/auth/logout`, and that button belongs in the navbar.
- Chrome logs "Failed to load resource: 401" in the console after a wrong password. That's the browser, not a bug.

## Verification

Run on 2026-11-25.

- **`npm run lint`:** 0 problems, on the Mac's checkout and on a clean copy (`npm ci`, 511 packages).
- **`npm run build`:** passes. All routes build, and `/login` prerenders as static.
  - It couldn't run on the Mac checkout from the remote shell: the Mac's `node_modules` holds macOS binaries, and that shell is Linux with no npm access.
  - So it ran on a clean copy of the working tree in the cloud sandbox instead.
  - That sandbox blocks Google Fonts, so **for that build only** the Geist response was mocked with Next's `NEXT_FONT_GOOGLE_MOCKED_RESPONSES`. No repo file was changed for this.
  - Please run `npm run build` once on a Mac before merging, to confirm with the real font.
- **Browser (Playwright, Chromium, `next start`, API replies mocked, no database touched): 150/150 checks passed** at 1280px and 390px:
  - **axe-core** (WCAG 2/2.1 A and AA plus best practice): 0 violations on the empty form, field errors, the `401`, `500` and network states, and success for member and officer.
  - **Browser check:** an empty submit focuses Email and sends nothing. A valid email with no password shows "Enter your password." and focuses Password. Editing a field clears its error.
  - **`401` run twice in a row:** the message is focused both times, the fields are editable again, and no field is marked invalid.
  - **Other errors:**
    - `400` with a `password` issue: the message goes on Password, which gets focus.
    - `400` with no field issues: a general message.
  - **General-message cases, each run twice:** `403`, `500`, `502` HTML, `502` empty and network failure all focused the right message with the fields editable again.
  - **Request body** holds only `email` and `password`, sent as typed.
  - **Enter in Email and in Password:** focus stayed in the field, which was read-only, with the status "Logging you in…" and the button `aria-disabled`. A following Enter, a forced click, Space and Enter still sent **1** request.
  - **Tab order:** Email → Password → Log in → Join the club.
  - **Success:**
    - member: focus on "Welcome back, Ada Lovelace!", and the button goes to `/dashboard`.
    - officer: the button goes to `/officer`.
    - Both show the email the server returned.
  - **Leaving for `/register` mid-request** with a `401` or `200` reply: focus on `/register` didn't move. On Back, the result was shown, the form wasn't stuck on "Logging you in…" and focus wasn't pulled to the old target.
  - **Register regression** after moving `issuesToErrors`: an empty submit focuses Name and sends nothing, and a `409` shows on the Email field.
  - There was no sideways scroll at 390px and no page errors.
- **Not verified:**
  - a real login against the Azure dev database
  - Safari and Firefox
  - a real screen reader (VoiceOver/NVDA)
  - real browser autofill and password managers

## Next up

W2D4-FE: Home page with placeholder data.
