# Curiosity Engineering Club Website — System Architecture & Design

> Text copy of [`architecture.pdf`](architecture.pdf) (Nov 20, 2026, by Nergis), so coding agents
> can read it cheaply. **The PDF is the source of truth.** If they ever differ, follow the PDF and
> fix this file. The architecture diagram on PDF page 14 is described in words under
> "Hosting and deployment".

## Overview

The site is one Next.js app on Azure with a Postgres database. It serves five kinds of users, and
each sees only the pages their role allows. The design goal is minimalistic.

### Who uses the site

| Role | Who they are | What they can do |
| --- | --- | --- |
| Visitor | Anyone, not logged in | See past projects and activities, the event calendar, and register for the club |
| Member | A registered student | Everything a visitor can, plus RSVP to events and see their own dashboard |
| Project member | A member assigned to a project | See that project's tasks page |
| Project lead | A member who leads a project; can be an officer or a regular member | Edit their project (public info and the private overview and details) from the lead section of their member dashboard |
| Officer | A club officer | Manage everything on the officer side (list below) |

### Officer-side features

- Expense log of the club budget
- Project meeting notes
- Attendee lists of meetings
- RSVP form creation
- Task distribution (assigning tasks to project members)
- Adding new projects, activities and events
- Notifications to everyone about a meeting, conference or project, 30 minutes and 5 minutes
  before it starts

## Tech stack

One Next.js app does both the pages and the API, so there is one codebase and one deployment.

| Layer | Choice | Why |
| --- | --- | --- |
| Frontend | React + JavaScript, inside Next.js (App Router) | Matches what the team is learning (HTML/CSS, then JS, then React) |
| Styling | Tailwind CSS | Fast way to a consistent minimal look; each class maps to one CSS property, so the team still learns CSS |
| Backend / API | Next.js Route Handlers (`app/api/.../route.js`) | No separate Express server, no CORS, one deployment |
| Auth | Custom JWT, built by hand (`bcrypt` + `jose`, httpOnly cookie) | Learning goal |
| Validation | Zod | Same rules check forms in the browser and requests on the server |
| Database | PostgreSQL on Azure (Flexible Server) | Free for 12 months; standard SQL; common in jobs and tutorials |
| Database access | Prisma (ORM) | Write JavaScript instead of raw SQL; easy schema changes (migrations) |
| File storage | Azure Blob Storage | Project photos and expense receipts; files never go in the database |
| Scheduled reminders | Azure Functions timer trigger | Runs every minute to send 30 and 5 minute reminders |
| Hosting | Azure App Service (Linux, Node), B1 tier | Runs Next.js as a normal Node server; paid by student credit |
| Code and deploys | GitHub + GitHub Actions | Push to `main` deploys to Azure |

## Backend

The backend is the API folder inside the Next.js app. Every request that changes data goes through
a route handler that checks who the user is and what they may do.

### Auth: how login works

In plain words: we give a logged-in user a signed ID card, and the browser shows it on every request.

1. **Sign up:** hash the password with `bcrypt`, save the user with role `member`.
2. **Log in:** compare the typed password to the hash. If it matches, sign a JWT with `jose`.
3. **Store the token:** in a cookie with `httpOnly`, `secure` and `sameSite=lax`, so page
   JavaScript cannot read it.
4. **Every request:** the server verifies the signature, then reads `userId` and `role`.
5. **Log out:** clear the cookie.

Token contents: `userId`, `role` (`member` or `officer`), expiry of 1 day. The signing key is
`JWT_SECRET` in `.env`, never committed to GitHub.

### Authorization: who can do what

- **Middleware** (`proxy.js` in Next.js 16) blocks `/officer/*` pages for non-officers. This is a
  convenience for the user, not the security.
- **Every officer-only route handler checks the role again on the server.** Hiding a button never
  makes an action safe.
- **Project roles stay out of the token.** "Lead" or "member of project X" is looked up in the
  database when a project page or task API is called, because these change often. A project lead
  can be an officer or a regular member. Editing a project is allowed when the user is an officer
  OR the lead of that project; the lead check uses the project role, not the officer role.
- **Sensitive actions re-check the database** (expense log, task assignment, role changes). A JWT
  cannot be taken back until it expires, so a removed officer could otherwise keep access for up
  to a day.

### Role rules

- Everyone who registers starts as `member`.
- Only an officer can promote a member to officer or set a project lead.
- The first officer account is created once by a seed script.

### Notifications

In plain words: a small timer wakes up every minute and asks, "Does anything start in 30 or 5
minutes? Then send reminders."

1. An Azure Functions timer trigger runs every minute.
2. It calls a protected route, `POST /api/cron/reminders`, with a secret header.
3. The route finds events starting in 30 or 5 minutes and sends the messages.
4. Each send is saved in the `notification_log` table, so nobody gets the same reminder twice if
   the timer runs late or twice.

The channel (email, browser push or text) is still open. Email is the simplest start.

### Later

- Password reset (needs email sending, same as notifications)
- Login rate limiting (stops password guessing)

## Data

The database has 14 tables in Azure PostgreSQL, defined in one Prisma schema file. Photos and
receipts live in Azure Blob Storage; the database stores only their links.

### Tables

In plain words: each table is one list of things, like a spreadsheet tab. `id` columns connect them.

| Table | What it holds | Key columns | Who can see it |
| --- | --- | --- | --- |
| `users` | Everyone with an account | `id`, `name`, `email` (unique), `password_hash`, `role` (member / officer), `created_at` | Officers see all; members see their own |
| `projects` | Public project info (edited by officers and that project's lead) | `id`, `title`, `summary`, `status`, `image_url`, `start_date`, `end_date`, `is_public` | Everyone |
| `project_overviews` | Private project details | `project_id`, `goals`, `plan`, `budget_notes`, `risks` | Project lead + officers |
| `project_members` | Who is on which project | `project_id`, `user_id`, `project_role` (lead / member) | Officers; members see their own projects |
| `tasks` | Project tasks | `id`, `project_id`, `title`, `description`, `assignee_id`, `status`, `due_date`, `created_by` | Members of that project; only officers assign |
| `activities` | Past club activities | `id`, `title`, `description`, `date`, `image_url` | Everyone |
| `events` | Calendar items | `id`, `title`, `type` (conference / competition / general meeting / project meeting), `starts_at`, `ends_at`, `location`, `project_id` (optional) | Everyone |
| `meeting_notes` | Notes from project meetings | `id`, `event_id`, `content`, `author_id`, `created_at` | Officers |
| `attendance` | Who came to a meeting | `event_id`, `user_id`, `status` (present / absent) | Officers |
| `rsvp_forms` | Forms officers create | `id`, `event_id`, `title`, `questions` (JSON), `closes_at` | Members can fill; officers create |
| `rsvp_responses` | Answers to RSVP forms | `id`, `form_id`, `user_id`, `answers` (JSON), `created_at` | Officers; members see their own |
| `expenses` | Budget log | `id`, `date`, `amount_cents`, `category`, `description`, `receipt_url`, `project_id` (optional), `recorded_by` | Officers |
| `notification_log` | Reminders already sent | `event_id`, `user_id`, `kind` (30 min / 5 min), `sent_at` | System only |
| `budget` | Budget per term | `id`, `term`, `total_cents` | Officers |

### How the tables connect

- A user joins many projects, and a project has many users, through `project_members`
  (a many-to-many link).
- A project has many tasks, one private overview, and optional events.
- An event can have one RSVP form, many attendance rows, and many meeting notes.
- Expenses can be tied to a project, so officers can see spending per project.

### Data rules

- **Money as whole cents** (`amount_cents` integer), never decimals. $12.50 is stored as `1250`,
  which avoids rounding errors.
- **Times stored in UTC** (`timestamptz`), shown on screen in Pacific time. Reminders depend on
  this being right.
- **Unique keys stop duplicates:** one row per (`event_id`, `user_id`, `kind`) in
  `notification_log`; one RSVP per user per form; one membership per user per project.
- **Store as little personal data as possible:** name, email and role only. Never store plain
  passwords.
- **Nothing important is truly deleted:** use an `archived` flag on projects and expenses, so the
  budget history stays correct.
- **Backups:** Azure Postgres keeps automatic backups; restore once to test it before launch.
- **Schema changes go through Prisma migrations,** committed to GitHub, so every teammate's
  database matches.

## Frontend

The frontend is React pages inside Next.js, grouped into four areas by who can see them. It uses
Tailwind CSS. The visual design is up to the frontend team.

### Pages and routes

In plain words: each URL is a folder in `app/`. Folders in brackets like `[id]` are pages that
change per item.

| Area | Route | What's on it |
| --- | --- | --- |
| Public | `/` | Club intro, next 3 events, featured projects, Join button |
| Public | `/projects`, `/projects/[id]` | Past and current projects |
| Public | `/activities` | Past activities with photos |
| Public | `/calendar` | Upcoming events, filter by type |
| Public | `/register`, `/login` | Club registration and login |
| Member | `/dashboard` | My projects, my tasks, my upcoming RSVPs, plus a "Projects I lead" section shown only to project leads |
| Member | `/projects/[id]/tasks` | Tasks for a project I'm on (view and update my own status) |
| Member | `/rsvp/[formId]` | Fill an RSVP form |
| Project lead | `/projects/[id]/overview` | Lead side, opened from the dashboard: edit the project's public info and its private overview and details |
| Officer | `/officer` | Officer home: quick links and stats |
| Officer | `/officer/expenses` | Expense log and budget remaining |
| Officer | `/officer/meetings/[id]` | Meeting notes + attendee list |
| Officer | `/officer/rsvp` | Create forms, view responses |
| Officer | `/officer/tasks` | Create and assign tasks |
| Officer | `/officer/events`, `/officer/projects`, `/officer/activities` | Add and edit calendar, projects, activities |
| Officer | `/officer/members` | Member list, change roles, set project leads |
| Officer | `/officer/notifications` | See and send event reminders |

Folder layout with route groups (folders in parentheses don't appear in the URL):

```
app/
  (public)/        page.js, projects/, activities/, calendar/, register/, login/
  (member)/        dashboard/, rsvp/[formId]/
  projects/[id]/   tasks/, overview/
  officer/         expenses/, meetings/, rsvp/, tasks/, events/, members/ ...
  api/             auth/, events/, tasks/, expenses/, rsvp/, cron/reminders/
components/        Button, Card, Table, FormField, Modal, Badge, Navbar
lib/               auth.js, db.js (Prisma client), validation.js (Zod)
```

### Server vs client components

In plain words: some parts of a page are built on the server (fast, can read the database), and
some run in the browser (needed for clicks and typing).

- **Server components (default):** pages that show data, such as the projects list and calendar.
  They can call Prisma directly.
- **Client components (`"use client"`):** anything interactive, such as forms, the calendar's
  month switcher, and task status dropdowns.
- **Writes go through the API:** forms send `fetch` requests to route handlers, which check auth
  and validate with Zod.

### Forms

- One Zod schema per form, used in the browser (instant error messages) and on the server (the
  real check).
- Every form shows three states: sending, success, error.
- The RSVP form builder stores questions as JSON, for example
  `[{"label": "Dietary needs?", "type": "text"}]`. The RSVP page renders inputs from that list.

### Calendar

- Start with a library such as FullCalendar or react-big-calendar, plus a simple list view for phones.
- Make each of the 4 event types identifiable by a text label, not by colour alone.
- Show times in Pacific time.

### Design

- **The look is the frontend team's call:** colours, fonts, layout, spacing and component styles
  are theirs to design. The club's only ask is a minimalistic feel.
- **Keep it consistent:** whatever they choose, put colours and fonts in the Tailwind theme
  (`@theme` in `globals.css`) and build pages from shared components, so many beginners still
  produce one coherent site.
- **Must work on phones:** students will check the calendar and RSVP on their phones.

### States every page needs

- **Loading:** a `loading.js` file per route group.
- **Empty:** for example "No upcoming events yet", plus an action for officers.
- **Error:** an `error.js` file with a retry button.
- **Not allowed:** redirect to `/login`, or show "Officers only".

### Accessibility

In plain words: small attributes and habits that let people using screen readers, only a keyboard,
or zoom use the site. All of these work with plain HTML, CSS and React; no extra library is needed.

**HTML**

| Technique | Example | What it does |
| --- | --- | --- |
| Alt text on images | `<img src="robot.jpg" alt="Team testing the line-following robot">`; decorative images get `alt=""` | Screen readers describe the photo, or skip it if it's decoration |
| Page language | `<html lang="en">` | Screen readers pronounce words correctly |
| Semantic elements | `<header>`, `<nav>`, `<main>`, `<footer>`, `<button>`, `<a>` | Gives landmarks users can jump between; buttons work with Enter and Space for free |
| Headings in order | One `<h1>` per page, then `<h2>`, `<h3>` without skipping | Screen reader users browse the page by its headings |
| Labels on inputs | `<label for="email">Email</label>` | Each field is read with its name |
| Grouped choices | `<fieldset>` + `<legend>` around RSVP radio buttons | The question is read with each option |
| Error messages linked to fields | `aria-invalid="true"` + `aria-describedby="email-error"` | The error is read when the field is focused |
| Autofill hints | `autocomplete="email"`, `autocomplete="name"` | Browsers fill forms, less typing |
| Clear link text | "View Robotics project", not "click here" | Links make sense when read out of context |
| Data tables | `<caption>`, `<th scope="col">` | Expense log and attendee lists are read with their column names |
| Skip link | `<a href="#main">Skip to content</a>` as the first element | Keyboard users skip the navbar |
| Icon-only buttons | `<button aria-label="Delete expense">` | Buttons with only an icon still have a name |
| Current page | `aria-current="page"` on the active nav link | Users hear which page they're on |
| Status messages | `role="status"` or `aria-live="polite"` | "RSVP saved" is announced without moving focus |
| Menus and toggles | `aria-expanded="true"` on the menu button | Users hear whether the menu is open |
| Pop-ups | `<dialog>` element | Built-in focus handling and Esc to close |
| Event times | `<time datetime="2026-12-01T18:00">Dec 1, 6 PM</time>` | Machines and assistive tech read the exact date |

**CSS (and the Tailwind equivalent)**

| Technique | Example | What it does |
| --- | --- | --- |
| Visible focus | `:focus-visible { outline: 2px solid; }` / `focus-visible:ring-2` | Keyboard users see where they are; never remove outlines without a replacement |
| Colour contrast | At least 4.5:1 for body text, 3:1 for large text and icons | Readable for low-vision users and in sunlight |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` / `motion-reduce:` | Turns off animations for users who get dizzy |
| Screen-reader-only text | `.sr-only` / `sr-only` | Adds hidden text for screen readers, such as "(opens in new tab)" |
| Relative sizes | `rem` for font sizes (Tailwind uses rem by default) | The site still works at 200% zoom |
| Big enough tap targets | At least 24 x 24 px, ideally 44 x 44 px | Easier to tap on phones |
| Colour plus text | Status badges say "Paid" or "Overdue", not only green or red | Colour-blind users get the same information |

**React and Next.js**

| Technique | Example | What it does |
| --- | --- | --- |
| JSX attribute names | `htmlFor`, `autoComplete`, `className`; `aria-*` stays hyphenated | Same HTML features, React spelling |
| Unique ids | `const id = useId();` → `<label htmlFor={id}>` + `<input id={id}>` | Labels and errors link correctly even when a component repeats |
| Moving focus | `useRef` + `ref.current.focus()` after opening a modal or on a form error | Keyboard and screen reader users land in the right place |
| Toggle state | `aria-expanded={isOpen}` | The attribute updates with React state |
| Images | Next.js `<Image src=... alt="...">` (alt is required) | Same as alt text, with optimised images |
| Links | `next/link` | Renders a real `<a>`, so keyboard and screen readers work |
| Page titles | `export const metadata = { title: "Calendar · CE Club" }` per page | Users hear which page loaded |

**How to check it**

- Add `eslint-plugin-jsx-a11y` to catch missing alt text and labels while coding.
- Run Lighthouse or the axe DevTools extension on each page.
- Use every page with only the keyboard (Tab, Shift+Tab, Enter, Esc).
- Try a screen reader once: VoiceOver on Mac, NVDA on Windows.

### Security reminders for the frontend

- Hiding officer links in the navbar is for looks only. The API is what protects data.
- Never put secrets in client code or in `NEXT_PUBLIC_` variables.
- The browser never reads the JWT; it only knows the user's name and role from a `/api/auth/me` call.

## Hosting and deployment

Everything runs on Azure, paid by the Azure for Students credit ($100 a year, no credit card). The
Postgres database is free for the first 12 months.

**Diagram (PDF page 14), in words:** one Next.js app on Azure App Service serves every page and API
call. Inside it, requests from the browser (visitors, members, officers) over HTTPS pass an
**auth check** (verifies JWT cookie and role), then reach **Pages** (React server and client
components) or **API route handlers** (Zod validation, Prisma queries). The app talks to four
supporting services: **Azure PostgreSQL** (14 tables via Prisma, automatic backups), **Azure Blob
Storage** (photos and receipts), an **email service** (channel still open), and is called by an
**Azure Functions timer** (every minute: `/api/cron/reminders`). **GitHub Actions** deploys on push.

Every browser request passes the auth check before it reaches a page or the API. Only the API and
server pages talk to the database, storage and email.

### Environments and secrets

- **Local:** each teammate runs the Next.js app with a local or shared development database.
- **Production:** Azure App Service + Azure PostgreSQL.
- **Secrets** (`DATABASE_URL`, `JWT_SECRET`, `CRON_SECRET`, email key) live in `.env` locally and in
  App Service settings on Azure. They are never committed to GitHub.

### Deploys

- A push to `main` makes GitHub Actions build the app and deploy it to App Service.
- Teammates work on branches and open pull requests; the project lead reviews before merging.
- Each deploy runs `prisma migrate deploy`, so the production database matches the schema.

## Handover

- An Azure for Students subscription belongs to one student's school email. Ask college IT for a
  club subscription, or plan a yearly transfer to a new officer.
- Create every other account (GitHub org, email service) on a club email.
- Keep a README with setup steps and a short user guide for officers.

## Open questions and next steps

### Open questions

- [ ] Notification channel: email, browser push, or text message?
- [ ] RSVP forms: custom questions, or a fixed Going / Not going form?
- [ ] Registration: does a new member need officer approval, or is signup instant?
- [ ] Can a project have two leads? Should a lead also see their project's meeting notes and attendance?
- [ ] Who is the first officer account (seed script)?
- [ ] After 12 months, does the club pay for Azure Postgres, or move to the free Azure SQL Database offer?
- [ ] Can college IT give the club its own Azure subscription for handover?

### Next steps

- [ ] Answer the open questions with the club officers
- [ ] Write the Prisma schema for the 14 tables
- [ ] Sketch wireframes for the home, calendar and officer pages
- [ ] Set up the repo: Next.js app, folder layout, Tailwind theme, shared components
- [ ] Build auth (sign up, log in, log out, middleware, role checks)
