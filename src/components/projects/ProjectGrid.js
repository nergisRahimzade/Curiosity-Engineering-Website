import Image from "next/image";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { getProjects, isUsingSampleData } from "@/lib/projects";

const gridClass = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

// Fetches projects and lays them out as cards. Wrap in <Suspense> with
// <ProjectGridSkeleton /> as the fallback.
export default async function ProjectGrid() {
  let projects;
  try {
    projects = await getProjects();
  } catch (error) {
    console.error(error);
    return <ProjectsError />;
  }

  if (projects.length === 0) return <ProjectsEmpty />;

  // Only reserve an image area when at least one project has a photo, so
  // a list with no photos doesn't fill up with empty grey boxes.
  const showMedia = projects.some((p) => p.photoUrl);

  return (
    <>
      {isUsingSampleData && <SampleDataNotice />}
      <ul className={gridClass}>
        {projects.map((p, i) => (
          <li key={p.id}>
            <ProjectCard project={p} showMedia={showMedia} priority={i < 3} />
          </li>
        ))}
      </ul>
    </>
  );
}

function ProjectCard({ project: p, showMedia, priority }) {
  const footer = [p.lead && `Lead: ${p.lead}`, p.team && `Team: ${p.team}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card
      href={`/projects/${p.slug}`}
      media={
        showMedia &&
        (p.photoUrl ? (
          <Image
            src={p.photoUrl}
            alt=""
            width={800}
            height={600}
            sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
            priority={priority}
            className="block"
          />
        ) : (
          <div aria-hidden="true" className="h-full w-full" />
        ))
      }
      eyebrow={
        (p.dateLabel || p.openToJoin) && (
          <span className="flex items-center justify-between gap-3">
            <span>{p.dateLabel}</span>
            {p.openToJoin && (
              <span className="-my-1 rounded-full border border-accent px-2 py-0.5 leading-4 font-medium text-accent">
                Open to join
              </span>
            )}
          </span>
        )
      }
      title={p.title}
      footer={footer || null}
    >
      {p.summary}
    </Card>
  );
}

// "No projects yet" state. Shown when no public projects exist.
export function ProjectsEmpty() {
  return (
    <div className="rounded-lg border border-dashed border-line px-6 py-16 text-center">
      <h2 className="text-lg font-semibold tracking-tight">No projects yet</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
        The club&apos;s projects will show up here once they&apos;re added.
        Want to start one?
      </p>
      <Button href="/join" variant="secondary" className="mt-6">
        Join the club
      </Button>
    </div>
  );
}

function ProjectsError() {
  return (
    <div
      role="alert"
      className="rounded-lg border border-line px-6 py-16 text-center"
    >
      <h2 className="text-lg font-semibold tracking-tight">
        Projects couldn&apos;t load
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
        Something went wrong on our side. Please try again in a few minutes.
      </p>
      <Button href="/projects" variant="secondary" className="mt-6">
        Try again
      </Button>
    </div>
  );
}

// Visible on purpose, so nobody mistakes sample data for real projects.
// Remove it when getProjects() reads from the database (W3D1-BE).
function SampleDataNotice() {
  return (
    <p className="mb-6 rounded-md border border-line px-4 py-3 text-sm text-muted">
      Showing sample projects. Real projects will load from the club
      database once it is connected.
    </p>
  );
}

// Same grid with grey blocks, shown while projects load.
export function ProjectGridSkeleton() {
  return (
    <ul className={gridClass} aria-busy="true" aria-label="Loading projects">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="h-48 animate-pulse rounded-lg border border-line bg-line/40"
        />
      ))}
    </ul>
  );
}
