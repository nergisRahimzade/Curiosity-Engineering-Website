# Handoff — W1D4-BE Backend: Prisma schema part 2

**Branch:** `W1D4-BE` (from `main` @ `91fd74c`, which includes W1D3-BE)
**Plan task:** "Schema part 2: `events`, `activities`, `tasks`, `meeting_notes`, `attendance`"
**Status:** Done, ready for review. No migration yet: the first migration is part of W1D5-BE.

## What's done

Five models added to `prisma/schema.prisma`, with table and column names from the architecture's
Data section:

| Model (client call) | Table | Keys and relations |
| --- | --- | --- |
| `Event` (`prisma.event`) | `events` | `type` is an `event_type` enum. `starts_at` and `ends_at` are `timestamptz`. Optional `project_id` → `projects`. |
| `Activity` (`prisma.activity`) | `activities` | `date` is a `DATE`, `image_url` is optional. No relations. |
| `Task` (`prisma.task`) | `tasks` | `project_id` → `projects`. `assignee_id` (optional) and `created_by` (required) → `users` through two named relations, `TaskAssignee` and `TaskCreator`. |
| `MeetingNote` (`prisma.meetingNote`) | `meeting_notes` | `event_id` → `events`, `author_id` → `users`, `created_at` is `timestamptz`. |
| `Attendance` (`prisma.attendance`) | `attendance` | Primary key (`event_id`, `user_id`): one row per person per event. `status` is an `attendance_status` enum (present / absent). |

- Every foreign key uses the existing `Int` IDs of `User` and `Project`.
- `User` gains `assignedTasks`, `createdTasks`, `meetingNotes` and `attendance` lists. `Project`
  gains `tasks` and `events`.
- Indexes: `events.starts_at` (calendar and reminders search by start time), plus one per foreign
  key used for lookups (`events.project_id`, `tasks.project_id`, `tasks.assignee_id`,
  `meeting_notes.event_id`, `attendance.user_id`). PostgreSQL doesn't index foreign keys by itself.

## Setup

- No new packages or env vars. Run `npx prisma generate` after pulling, so the local client knows
  the new models.

## Decisions to check with the team

- **Event types** are stored as `conference`, `competition`, `general_meeting` and
  `project_meeting`. Enum values can't contain spaces, so the calendar turns them into labels.
- **`ends_at` is required and `location` is optional** (online or not-yet-booked events). The
  database doesn't check that `ends_at` is after `starts_at`. The events API (W3D4) should check
  that with Zod.
- **Deleting events:** W3D4 lets officers delete events, but every relation uses `Restrict`. An
  event that has meeting notes or attendance can't be deleted until those rows are handled. That
  protects records officers rely on. If the team would rather keep old events, an `archived` flag
  like the one on projects is the alternative.
- **Task status is text with no default**, like `projects.status`, until the team agrees on the
  values (for example to do / in progress / done).
- **Tasks can be unassigned** (`assignee_id` empty) until an officer assigns them. The creator is
  always required.
- **Not checked by the database:** that a task's assignee is a member of that task's project, and
  that meeting notes belong only to project-meeting events. The tasks API (W4D1) and notes API
  (W4D2) must check these on the server, and re-read the database per the "sensitive actions" rule.
- **Activity description is required**, like a project's summary. `image_url` stays optional until
  photo upload (W3D3).
- No `created_at` on events, activities or tasks, because the plan doesn't list one. Easy to add in
  W1D5 before the first migration if the team wants it.

## Things the next person should know

- Prisma returns camelCase fields (`startsAt`, `assigneeId`, `createdById`). The `created_by` column
  is `createdById` in code, and `task.createdBy` is the related user.
- Every relation uses `onDelete: Restrict`, matching W1D3. Nothing is deleted along with its parent.
- The local Graphify trial skips `schema.prisma`, so this schema was reviewed with Prisma's own
  tools (`validate`, `generate`, `migrate diff`).

## Verification

- `npx prisma format`, `npx prisma validate` and `npx prisma generate` (Prisma 7.10.1) pass.
- Offline SQL: `npx prisma migrate diff` from `main`'s schema to this one creates only the five
  tables, two enums, six indexes and eight foreign keys listed above. The four W1D3 tables are
  unchanged. Nothing was applied to a database.
- `npm run lint`: passes.
- `npm run build` (default Turbopack): passes.
- Manual checks (by role): N/A, schema only.

## Next up

**W1D5-BE**, schema part 3: `rsvp_forms`, `rsvp_responses`, `expenses`, `budget`,
`notification_log` (with its unique (`event_id`, `user_id`, `kind`) key), then the first migration
and the seed script. `rsvp_forms` and `notification_log` point at `events` from this task.
