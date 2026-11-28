// Project data for the public pages (/, /projects, /projects/[id]).
// Added in setup; W3D1-FE reshaped it to the Prisma schema and added
// getPublicProject(id) for the detail page.
//
// This is the ONE place that decides what "public project info" means.
// Server components call these functions directly (the architecture lets
// them read the database). When W3D1-BE adds GET /api/projects and
// GET /api/projects/[id], those route handlers should call the same two
// functions, so the page and the API can never disagree.
//
// TODO W3D1-BE: replace the sample-data lines in getPublicProjects() and
// getPublicProject() with the Prisma queries written next to them, set
// isUsingSampleData to false, and delete sample-projects.js. Let database
// errors throw: the pages show an error state, never an empty list.

import { cacheLife, cacheTag } from "next/cache";
import { sampleProjects } from "@/lib/sample-projects";

// The pages show a visible "sample projects" notice while this is true.
export const isUsingSampleData = true;

// Cache tag for project data. When the officer forms land (W3D5-FE), call
// revalidateTag("projects") after a create or edit so pages update at once.
export const PROJECTS_TAG = "projects";

// Only these columns may leave the server for public pages. Members, leads,
// overviews and the isPublic/archived flags are left out on purpose.
// Pass it as Prisma's `select`, so private data is never even loaded.
export const publicProjectSelect = {
  id: true,
  title: true,
  summary: true,
  status: true,
  imageUrl: true,
  startDate: true,
  endDate: true,
};

// A project is public when an officer or lead made it public and it
// isn't archived. Use as Prisma's `where`.
export const publicProjectWhere = { isPublic: true, archived: false };

// W3D1-FE: Lead, Team and "Open to join" were removed from the public pages.
// Nergis: lead and team names come from project_members (memberships and
// people's names, which the plan keeps off public pages), and "open to join"
// isn't a column in the schema. To bring them back: (1) decide which
// membership info is public, (2) backend adds it (e.g. an `openToJoin`
// column via a migration, or `members: { where: { projectRole: "lead" },
// select: { user: { select: { name: true } } } }` in the select above),
// (3) add the field in toProject() and show it in ProjectGrid.js and the
// detail page. The old versions are in git history before W3D1-FE.

// Every public page reads projects through toProject(), so the shape the
// pages use stays the same whatever the database returns.
function toProject(row) {
  const startDate = toIsoDate(row.startDate);
  const endDate = toIsoDate(row.endDate);
  return {
    id: String(row.id),
    title: row.title,
    summary: row.summary ?? "",
    status: row.status ?? "",
    statusLabel: formatStatus(row.status),
    // Photos are skipped until W3D3 allows the Blob Storage host in
    // next.config.mjs; a remote URL next/image doesn't allow would crash
    // the page. Site paths ("/photos/x.jpg") work already.
    imageUrl: row.imageUrl?.startsWith("/") ? row.imageUrl : null,
    startDate,
    endDate,
    dateLabel: formatDateRange(startDate, endDate),
  };
}

// Prisma returns a Date for DATE columns; the sample rows use strings.
// Either way, keep "YYYY-MM-DD" so <time dateTime> gets a valid value.
function toIsoDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

// "2026-03-14" → "Mar 2026". DATE columns have no time zone, so read them
// in UTC; otherwise Pacific time would show the day (and month) before.
export function formatMonth(isoDate) {
  if (!isoDate) return "";
  return new Date(isoDate).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatDateRange(start, end) {
  if (start && end) {
    const a = formatMonth(start);
    const b = formatMonth(end);
    return a === b ? a : `${a} – ${b}`;
  }
  if (start) return `Since ${formatMonth(start)}`;
  if (end) return `Ended ${formatMonth(end)}`;
  return "";
}

// Status is free text until the team agrees on values (W1D3 handoff), so
// just tidy it for display: "in_progress" → "In progress".
function formatStatus(status) {
  if (!status) return "";
  const words = String(status).replace(/[_-]+/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function byNewest(a, b) {
  return (Date.parse(b.startDate ?? "") || 0) - (Date.parse(a.startDate ?? "") || 0);
}

// The URL's [id] must be a whole number that fits PostgreSQL's Int
// (1 to 2147483647), the same rule as the backend's projectIdParam.
// Anything else ("abc", "0", "1.5", "solar-tracker") returns null, and the
// page shows "Project not found" without asking the database.
export function parseProjectId(value) {
  if (typeof value !== "string" || !/^[1-9]\d{0,9}$/.test(value)) return null;
  const id = Number(value);
  return id <= 2147483647 ? id : null;
}

// All public projects, newest first.
export async function getPublicProjects() {
  "use cache";
  cacheLife("minutes");
  cacheTag(PROJECTS_TAG);

  // W3D1-BE: const rows = await prisma.project.findMany({
  //   where: publicProjectWhere, select: publicProjectSelect,
  //   orderBy: { startDate: "desc" },
  // });
  const rows = sampleProjects.filter(isPublicRow);
  return rows.map(toProject).sort(byNewest);
}

// One public project by its number id, or null when it doesn't exist, is
// private or is archived. Those cases look the same on purpose, so nobody
// can tell a private project exists. Pass a number from parseProjectId().
export async function getPublicProject(id) {
  "use cache";
  cacheLife("minutes");
  cacheTag(PROJECTS_TAG);

  // W3D1-BE: const row = await prisma.project.findFirst({
  //   where: { id, ...publicProjectWhere }, select: publicProjectSelect,
  // });
  const row = sampleProjects.find((p) => p.id === id && isPublicRow(p));
  return row ? toProject(row) : null;
}

function isPublicRow(row) {
  return row.isPublic === publicProjectWhere.isPublic &&
    row.archived === publicProjectWhere.archived;
}
