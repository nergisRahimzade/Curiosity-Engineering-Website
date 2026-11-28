// Loading state for /projects/[id]. Added in W3D1-FE.
// Shown while the page reads the project. The back link is real, so a
// keyboard user can leave straight away.
import Container from "@/components/Container";
import BackToProjects from "@/components/projects/BackToProjects";

export default function ProjectLoading() {
  return (
    <Container size="narrow" className="py-16">
      <BackToProjects />
      <div role="status" className="mt-8">
        <span className="sr-only">Loading project…</span>
        <div aria-hidden="true">
          <div className="h-9 w-2/3 animate-pulse rounded-md bg-line/60 motion-reduce:animate-none" />
          <div className="mt-4 h-5 w-40 animate-pulse rounded-md bg-line/60 motion-reduce:animate-none" />
          <div className="mt-8 h-24 animate-pulse rounded-md bg-line/40 motion-reduce:animate-none" />
        </div>
      </div>
    </Container>
  );
}
