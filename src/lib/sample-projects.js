// Stand-in rows for the `projects` table, used by src/lib/projects.js
// until the projects data layer reads from the database (W3D1-BE).
// Delete this file once getPublicProjects() uses Prisma.
//
// W3D1-FE: reshaped to match the Prisma `Project` model exactly (number ids,
// camelCase fields), so swapping in prisma.project.findMany() changes
// nothing else. Only public columns plus the two filter flags are here:
// no members, leads or private overviews.
//
// Row 6 is private on purpose: /projects/6 must show "Project not found",
// which proves a private project can't be opened by guessing its URL.

export const sampleProjects = [
  {
    id: 1,
    title: "Solar panel tracker",
    summary:
      "A panel that turns to follow the sun, built from an Arduino and two servos.",
    status: "active",
    imageUrl: null,
    startDate: "2026-03-14",
    endDate: null,
    isPublic: true,
    archived: false,
  },
  {
    id: 2,
    title: "Campus weather station",
    summary:
      "Temperature, humidity and wind readings from the roof, posted every ten minutes.",
    status: "completed",
    imageUrl: null,
    startDate: "2025-11-02",
    endDate: "2026-05-20",
    isPublic: true,
    archived: false,
  },
  {
    id: 3,
    title: "Water bottle rocket",
    summary: "Pressurized launches to test which fin shape flies highest.",
    status: "completed",
    imageUrl: null,
    startDate: "2025-10-05",
    endDate: "2025-12-12",
    isPublic: true,
    archived: false,
  },
  {
    id: 4,
    title: "Line-following robot",
    summary:
      "A small robot that reads a taped track with two light sensors.",
    status: "active",
    imageUrl: null,
    startDate: "2025-04-20",
    endDate: null,
    isPublic: true,
    archived: false,
  },
  {
    id: 5,
    title: "Popsicle-stick bridge",
    summary:
      "Our entry for the regional bridge competition. It held 41 kg before it broke.",
    status: "completed",
    imageUrl: null,
    startDate: "2025-02-08",
    endDate: "2025-03-01",
    isPublic: true,
    archived: false,
  },
  {
    id: 6,
    title: "Private test project",
    summary: "Not public yet. This must never appear on a public page.",
    status: "planning",
    imageUrl: null,
    startDate: "2026-09-01",
    endDate: null,
    isPublic: false,
    archived: false,
  },
];
