import { cacheLife, cacheTag } from "next/cache";
import { sampleProjects } from "@/lib/sample-projects";

// Project data for the public pages.
//
// The plan stores projects in Azure PostgreSQL, read through Prisma
// (src/lib/db.js, added in W1D2-BE). The schema and the projects API
// arrive in W1D3 and W3D1, so until then this file serves the sample
// projects. When W3D1 lands, replace the body of getProjects() with a
// prisma.project query and delete sample-projects.js. Prisma returns
// camelCase fields (startDate, imageUrl), so update toProject() too.

// The page shows a visible notice while this is true.
export const isUsingSampleData = true;

// Cache tag for project data. When the admin forms land (Day 12), call
// revalidateTag("projects") after a create, edit or delete so the list
// updates straight away instead of on the next cache refresh.
export const PROJECTS_TAG = "projects";

// Every project-reading page goes through toProject(), so if the
// backend names a column differently, only the fallbacks below change.
function toProject(row) {
  const date = row.date ?? row.start_date ?? row.created_at ?? null;
  return {
    id: String(row.id),
    slug: row.slug ?? String(row.id),
    title: row.title ?? row.name ?? "Untitled project",
    summary: row.summary ?? row.description ?? "",
    date,
    dateLabel: formatDate(date),
    team: Array.isArray(row.team) ? row.team.join(", ") : (row.team ?? ""),
    // Not every project lead is an officer, so this is just a name.
    lead: row.lead ?? row.lead_name ?? "",
    photoUrl: row.photo_url ?? row.cover_url ?? row.image_url ?? null,
    // New members can see which projects are taking people.
    openToJoin: Boolean(
      row.open_to_join ?? row.accepting_members ?? row.status === "open",
    ),
  };
}

// "2026-03-14" → "Mar 2026". Free text such as "Spring 2026" is kept.
function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function byNewest(a, b) {
  const ta = Date.parse(a.date ?? "") || 0;
  const tb = Date.parse(b.date ?? "") || 0;
  return tb - ta;
}

// All projects, newest first. Once the database is used, let errors
// throw so the page can show a message instead of a misleading empty state.
export async function getProjects() {
  "use cache";
  cacheLife("minutes");
  cacheTag(PROJECTS_TAG);

  return sampleProjects.map(toProject).sort(byNewest);
}
