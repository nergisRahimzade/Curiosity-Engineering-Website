import { cacheLife, cacheTag } from "next/cache";
import { sampleProjects } from "@/lib/sample-projects";

// Reads projects from Supabase for the public pages.
//
// Talks to Supabase's REST API with fetch, so the site needs no extra
// package for public reads. Row Level Security decides what the public
// key can see; this file never uses the service-role key.
//
// Env vars (in .env.local and on Vercel):
//   NEXT_PUBLIC_SUPABASE_URL           https://<project>.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY      or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
//
// With neither set, the page shows sample projects and says so, so the
// frontend can be worked on without database keys.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

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

// All projects, newest first. Throws if Supabase answers with an error,
// so the page can show a message instead of a misleading empty state.
export async function getProjects() {
  "use cache";
  cacheLife("minutes");
  cacheTag(PROJECTS_TAG);

  if (!isSupabaseConfigured) {
    return sampleProjects.map(toProject).sort(byNewest);
  }

  // select=* keeps this working while the table's columns settle.
  const res = await fetch(`${SUPABASE_URL}/rest/v1/projects?select=*`, {
    headers: { apikey: SUPABASE_KEY, Accept: "application/json" },
  });

  if (!res.ok) {
    throw new Error(
      `Supabase returned ${res.status} for projects: ${await res.text()}`,
    );
  }

  const rows = await res.json();
  return rows.map(toProject).sort(byNewest);
}
