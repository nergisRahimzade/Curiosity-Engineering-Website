// Projects grid for /projects. Added in setup; W3D1-FE links cards to
// /projects/[id], uses h2 titles and shows only public fields.
import Image from "next/image";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import { getPublicProjects, isUsingSampleData } from "@/lib/projects";

const gridClass = "grid gap-6 sm:grid-cols-2 lg:grid-cols-3";

// Fetches projects and lays them out as cards. Wrap in <Suspense> with
// <ProjectGridSkeleton /> as the fallback.
export default async function ProjectGrid() {
  let projects;
  try {
    projects = await getPublicProjects();
  } catch (error) {
    console.error(error);
    return <ProjectsError />;
  }

  if (projects.length === 0) return <ProjectsEmpty />;

  // Only reserve an image area when at least one project has a photo, so
  // a list with no photos doesn't fill up with empty grey boxes.
  const showMedia = projects.some((p) => p.imageUrl);

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
  return (
    <Card
      href={`/projects/${p.id}`}
      // W3D1-FE: h2, because the cards sit straight under the page's h1
      // (axe heading-order). Card's default stays h3 for sections like the
      // Home page's "Featured projects" h2.
      titleAs="h2"
      media={
        showMedia &&
        (p.imageUrl ? (
          // alt="" because the card title right below already names the
          // project; repeating it would make screen readers say it twice.
          <Image
            src={p.imageUrl}
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
      eyebrow={p.dateLabel || null}
      title={p.title}
      footer={p.statusLabel && <ProjectStatus label={p.statusLabel} />}
    >
      {p.summary}
    </Card>
  );
}

// The status as a text label ("Active", "Completed"), never colour alone.
// Status is free text for now, so every value gets the neutral tone.
export function ProjectStatus({ label, className = "" }) {
  return (
    <Badge className={className}>
      <span className="sr-only">Status: </span>
      {label}
    </Badge>
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
      <Button href="/register" variant="secondary" className="mt-6">
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
// Shown on the list and detail pages while isUsingSampleData is true; it
// disappears by itself when W3D1-BE switches projects.js to the database.
export function SampleDataNotice({ className = "mb-6" }) {
  return (
    <p className={`rounded-md border border-line px-4 py-3 text-sm text-muted ${className}`}>
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
