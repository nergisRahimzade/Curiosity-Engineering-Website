// Home page (/). Added in W2D4-FE with placeholder data from sample-home.js.
import Link from "next/link";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import Card from "@/components/Card";
import Container from "@/components/Container";
import { featuredProjects, nextEvents } from "@/lib/sample-home";
import { site } from "@/lib/site";

// The one-line pitch. Kept here, not in site.js, so the shared site
// description (used for search engines) stays unchanged.
const pitch =
  "Build real-world hardware and software projects together—from robotics to autonomous systems.";

export default function HomePage() {
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

      {/* Featured projects */}
      <Container as="section" className="py-12">
        <h2 className="text-2xl font-semibold tracking-tight">Featured projects</h2>
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProjects.map((p) => (
            <li key={p.id}>
              {/* Detail pages come in W3D1-FE, so cards go to the list for now. */}
              <Card href="/projects" title={p.title} footer={`Team: ${p.team}`}>
                {p.summary}
              </Card>
            </li>
          ))}
        </ul>
      </Container>

      {/* Next three events. Each row opens the calendar for full details. */}
      <Container as="section" className="py-12">
        <h2 className="text-2xl font-semibold tracking-tight">Next events</h2>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {nextEvents.map((e) => (
            <li key={e.id}>
              {/* Stacked on phones, one line from the "sm" width up. */}
              <Link
                href="/calendar"
                className="flex flex-col gap-1 py-4 hover:bg-line/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none sm:flex-row sm:items-center sm:gap-4"
              >
                <time dateTime={e.startsAt} className="text-sm text-muted sm:w-36">
                  {e.label}
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
