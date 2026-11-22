# CE Club Website — 6-Week Task Distribution

> Text copy of [`task-distribution.pdf`](task-distribution.pdf) (Nov 20, 2026, by Nergis), so
> coding agents can read it cheaply. **The PDF is the source of truth.** If they ever differ,
> follow the PDF and fix this file.

## How to read this plan

- The build takes 6 weeks, one task per layer each weekday. Weekends have no tasks, so anyone
  who falls behind can catch up.
- **Backend column:** backend and data work combined. A task marked **\*** is a **data** task
  (database schema, seed data, storage, money and log tables).
- **Frontend column:** frontend and design work combined. A task marked **\*** is a **design**
  task (wireframes, theme, design reviews, accessibility).
- **Friday** tasks end with a short check-in: demo what works, move unfinished tasks to the
  weekend or the next week.
- Week 1 starts on the Monday the team picks; the plan uses weekdays, not dates.

**Task IDs used in this repo:** `W<week>D<day>-BE` / `W<week>D<day>-FE`, where Mon = D1 … Fri = D5.
Example: Week 2 Tuesday backend = `W2D2-BE`. (This ID scheme is a repo convention, not part of the PDF.)

| Week | Goal by Friday |
| --- | --- |
| 1 | Repo, database schema and seed data ready; wireframes and theme agreed |
| 2 | Users can register, log in and log out; shared components built |
| 3 | Projects, activities and the calendar work end to end |
| 4 | Officer tools work: tasks, meetings, expenses, RSVP |
| 5 | Reminders send on time; every page polished and accessible |
| 6 | Live on Azure, tested by role, handed over to the club |

## Week 1: Setup, schema, wireframes

| Day | Backend | Frontend |
| --- | --- | --- |
| Mon (W1D1) | Create the Next.js repo, folder layout, ESLint, `.env.example`; set GitHub branch rules | \* Collect design inspiration; agree on the minimalistic direction as a team |
| Tue (W1D2) | \* Create the development Postgres database on Azure; install Prisma and connect | \* Wireframes: home, projects, activities, calendar |
| Wed (W1D3) | \* Prisma schema part 1: `users`, `projects`, `project_members`, `project_overviews` | \* Wireframes: member dashboard (with lead section), project tasks, officer pages |
| Thu (W1D4) | \* Schema part 2: `events`, `activities`, `tasks`, `meeting_notes`, `attendance` | \* Choose colours and fonts; install Tailwind and set them in `@theme` |
| Fri (W1D5) | \* Schema part 3: `rsvp_forms`, `rsvp_responses`, `expenses`, `budget`, `notification_log`; run first migration; seed script with first officer and sample data | Root layout, navbar and footer; shared `Button` and `Card` components |

## Week 2: Auth and shared components

| Day | Backend | Frontend |
| --- | --- | --- |
| Mon (W2D1) | `lib/auth.js`: hash and compare passwords with `bcrypt`; sign and verify JWTs with `jose` | Shared `FormField`, `Table`, `Modal` and `Badge` components |
| Tue (W2D2) | `POST /api/auth/register` with Zod validation; new users start as `member` | Register page with form validation and error messages |
| Wed (W2D3) | `POST /api/auth/login` and `/logout`; set and clear the httpOnly cookie | Login page with loading, error and success states |
| Thu (W2D4) | `GET /api/auth/me`; middleware protecting member and `/officer` pages | Home page with placeholder data |
| Fri (W2D5) | Role helpers: `requireUser`, `requireOfficer`, `requireProjectLead`, `requireOfficerOrLead` | Navbar shows links by role using `/api/auth/me`; test the full auth flow together |

## Week 3: Projects, activities, calendar

| Day | Backend | Frontend |
| --- | --- | --- |
| Mon (W3D1) | Projects API: list and get (public), create (officer), update (officer or project lead) | Projects list page and project detail page |
| Tue (W3D2) | Project members API (officer adds members, sets lead); project overview API (lead or officer) | Dashboard "Projects I lead" section; project edit and private overview pages |
| Wed (W3D3) | Activities API; \* image upload to Azure Blob Storage, save the link | Activities page with photos; shared image upload component |
| Thu (W3D4) | Events API: list (public); create, edit, delete (officer) | Calendar page with a calendar library, plus a list view for phones |
| Fri (W3D5) | \* Seed realistic projects, events and activities; test every route as visitor, member, lead and officer | Officer forms to add and edit projects, activities and events |

## Week 4: Officer tools

| Day | Backend | Frontend |
| --- | --- | --- |
| Mon (W4D1) | Tasks API: officers create and assign; project members view tasks and update their own status | Officer task assignment page |
| Tue (W4D2) | Meeting notes API and attendance API (officer only) | Member project tasks page; "My tasks" on the dashboard |
| Wed (W4D3) | \* Expenses and budget API: amounts in cents, totals per term and per project; receipt upload | Officer meeting page: notes and attendee list |
| Thu (W4D4) | RSVP forms API: officers create forms with questions stored as JSON | Expense log page with budget remaining |
| Fri (W4D5) | \* RSVP responses API: one response per user per form; responses list for officers | RSVP form builder (officer) and RSVP fill page (member) |

## Week 5: Notifications, members, polish

| Day | Backend | Frontend |
| --- | --- | --- |
| Mon (W5D1) | Set up the email service; write a `sendEmail` helper | Officer members page: list members, change roles, set project leads |
| Tue (W5D2) | \* `POST /api/cron/reminders`: find events starting in 30 or 5 minutes; record each send in `notification_log` to avoid duplicates | Officer notifications page: upcoming reminders and manual send |
| Wed (W5D3) | Azure Functions timer that calls the reminders route every minute with a secret header; test it | \* Design review: consistency across all pages; phone layouts |
| Thu (W5D4) | Members and roles API (promote, demote; re-check the database); login rate limiting | Loading, empty, error and "not allowed" states on every page |
| Fri (W5D5) | Security review: every route checks the role on the server and validates with Zod | \* Accessibility pass: alt text, labels, focus, contrast (Lighthouse or axe) |

## Week 6: Deploy, test, hand over

| Day | Backend | Frontend |
| --- | --- | --- |
| Mon (W6D1) | Create production Azure resources: App Service, Postgres, Blob Storage; add secrets to App Service settings | \* Fix accessibility issues; keyboard-only test of every page |
| Tue (W6D2) | GitHub Actions deploy with `prisma migrate deploy`; first production deploy | Test on phones and different browsers using the live URL |
| Wed (W6D3) | \* Seed production with the first officer account; test a backup restore | Fix bugs found in testing |
| Thu (W6D4) | End-to-end test by role (visitor, member, lead, officer); fix backend bugs | Fix frontend bugs; \* final design polish |
| Fri (W6D5) | README with setup steps and handover notes | Short officer user guide; demo the site to the club officers |
