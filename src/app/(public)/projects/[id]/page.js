// Project detail page (/projects/[id]). Added in W3D1-FE.
// A server component: it reads the project through projects.js on the
// server. Only public fields are shown; a missing, private, archived or
// badly formed id all show the same "Project not found" page.
import Image from "next/image";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import BackToProjects from "@/components/projects/BackToProjects";
import {
  ProjectStatus,
  SampleDataNotice,
} from "@/components/projects/ProjectGrid";
import {
  formatMonth,
  getPublicProject,
  isUsingSampleData,
  parseProjectId,
} from "@/lib/projects";

// Looks the project up once per request. Both functions below call it, and
// getPublicProject() is cached, so the data is only read once.
async function findProject(params) {
  const { id } = await params;
  const projectId = parseProjectId(id);
  if (!projectId) return null; // "abc", "0", an old text slug...
  return getPublicProject(projectId);
}

// The browser tab shows the project's name. The same title is used for
// missing and private projects, so it gives nothing away.
export async function generateMetadata({ params }) {
  const project = await findProject(params);
  if (!project) return { title: "Project not found" };
  return { title: project.title, description: project.summary };
}

// params is a Promise in Next 16. loading.js shows a skeleton while this
// waits. A database error throws on purpose and reaches ../error.js.
export default async function ProjectPage({ params }) {
  const project = await findProject(params);
  if (!project) notFound(); // shows ./not-found.js

  return (
    <Container as="article" size="narrow" className="py-16">
      <BackToProjects />

      {isUsingSampleData && <SampleDataNotice className="mt-6" />}

      <header className="mt-8">
        <h1 className="text-3xl font-semibold tracking-tight">
          {project.title}
        </h1>
        {(project.statusLabel || project.dateLabel) && (
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            {project.statusLabel && (
              <ProjectStatus label={project.statusLabel} />
            )}
            <ProjectDates project={project} />
          </div>
        )}
      </header>

      {project.imageUrl && (
        <div className="mt-8 overflow-hidden rounded-lg border border-line bg-line">
          {/* The schema has no alt-text column yet, so the alt names the
              project. Ask backend for one when uploads land (W3D3). */}
          <Image
            src={project.imageUrl}
            alt={`Photo of the ${project.title} project`}
            width={1200}
            height={900}
            sizes="(min-width: 672px) 624px, 100vw"
            priority
            className="block h-auto w-full"
          />
        </div>
      )}

      {project.summary && (
        <p className="mt-8 text-base leading-7">{project.summary}</p>
      )}
    </Container>
  );
}

// "Mar 2026 – May 2026" with each date in a <time> tag, so assistive tech
// and search engines get the exact date.
function ProjectDates({ project: p }) {
  const start = p.startDate && (
    <time dateTime={p.startDate}>{formatMonth(p.startDate)}</time>
  );
  const end = p.endDate && (
    <time dateTime={p.endDate}>{formatMonth(p.endDate)}</time>
  );
  if (start && end) {
    return (
      <p>
        {start} – {end}
      </p>
    );
  }
  if (start) return <p>Since {start}</p>;
  if (end) return <p>Ended {end}</p>;
  return null;
}
