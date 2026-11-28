"use client";
// Error state for /projects and /projects/[id]. Added in W3D1-FE.
// Shown when reading projects fails (for example the database is down).
// Next 16 passes retry(), which reads the data again without a reload.
// Never shows error details: in production they could leak server info.
import { useEffect } from "react";
import Button from "@/components/Button";
import Container from "@/components/Container";
import { site } from "@/lib/site";

export default function ProjectsError({ error, retry }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container as="section" size="narrow" className="py-24">
      {/* When a page fails, Next sends no <title> at all, so the tab would
          be blank. React moves this tag into <head>. */}
      <title>{`Projects couldn't load · ${site.name}`}</title>
      <div role="alert">
        <h1 className="text-3xl font-semibold tracking-tight">
          Projects couldn&apos;t load
        </h1>
        <p className="mt-4 text-muted">
          Something went wrong on our side. Please try again in a few minutes.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => retry()}>Try again</Button>
        <Button href="/projects" variant="secondary">
          See all projects
        </Button>
      </div>
    </Container>
  );
}
