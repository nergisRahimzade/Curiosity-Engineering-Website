// Home page (/). Added in W2D4-FE. Featured projects come from getPublicProjects()
// (the same data layer as /projects); events are still placeholder data.
import Link from "next/link";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Container from "@/components/Container";
import { getPublicProjects, isUsingSampleData } from "@/lib/projects";
import { nextEvents } from "@/lib/sample-home";
import { site } from "@/lib/site";

// The one-line pitch. Kept here, not in site.js, so the shared site
// description (used for search engines) stays unchanged.
const pitch =
  "Build real-world hardware and software projects together—from robotics to autonomous systems.";

// "Jan 12, 6:00 PM". The time zone is fixed so every visitor sees Pacific
// time, whatever zone the server runs in. Real events from the W3D4 API
// only have a timestamp, so this works for them too.
function formatEventTime(startsAt) {
  return new Date(startsAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Los_Angeles",
  });
}

export default async function HomePage() {
  // Same source as the /projects page. If it fails, hide the section
  // instead of breaking the whole Home page.
  let featured = [];
  try {
    featured = (await getPublicProjects()).slice(0, 3);
  } catch (error) {
    console.error(error);
  }

  return (
    <>
      {/* Hero: text only. "See projects" is the main action, Join sits next to it. */}
      <Container as="section" className="py-20">
        <h1 className="text-4xl font-semibold tracking-tight">{site.name}</h1>
        <p className="mt-4 max-w-xl text-muted">{pitch}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/projects">See projects</Button>
          <Button href="/register" variant="secondary">Join the club</Button>
        </div>
      </Container>

      {/* Visible on purpose, so nobody mistakes sample data for real data.
          The events are always sample for now; remove this when W3D4-FE
          brings real events. */}
      <Container>
        <p className="rounded-md border border-line px-4 py-3 text-sm text-muted">
          {isUsingSampleData
            ? "Showing sample projects and events."
            : "Showing sample events."}{" "}
          Real ones will load from the club database once it is connected.
        </p>
      </Container>

      {/* Featured projects */}
      {featured.length > 0 && (
        <Container as="section" className="py-12">
          <h2 className="text-2xl font-semibold tracking-tight">Featured projects</h2>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <li key={p.id}>
                {/* W3D1-FE: links to the project's page. The team line was
                    removed (names are membership data; see projects.js). */}
                <Card
                  href={`/projects/${p.id}`}
                  eyebrow={p.dateLabel || null}
                  title={p.title}
                >
                  {p.summary}
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      )}

      {/* Next three events. Each row opens the calendar for full details. */}
      <Container as="section" className="py-12">
        <h2 className="text-2xl font-semibold tracking-tight">Next events</h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {nextEvents.map((e) => (
            <li key={e.id}>
              {/* Stacked on phones, one line from the "sm" width up. The side
                  padding keeps the hover highlight off the text edge. */}
              <Link
                href="/calendar"
                className="-mx-3 flex flex-col gap-1 rounded-md px-3 py-4 hover:bg-line/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none sm:flex-row sm:items-center sm:gap-4"
              >
                <time dateTime={e.startsAt} className="text-sm text-muted sm:w-40">
                  {formatEventTime(e.startsAt)}
                </time>
                <span className="font-medium sm:flex-1">{e.title}</span>
                <Badge className="self-start">{e.type}</Badge>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <Button href="/calendar" variant="ghost">See full calendar</Button>
        </div>
      </Container>
    </>
  );
}
