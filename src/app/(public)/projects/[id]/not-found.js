// "Project not found" for /projects/[id]. Added in W3D1-FE.
// Used for a bad id, a missing project AND a private or archived one, with
// the same words for all, so the page never reveals a private project.
import Button from "@/components/Button";
import Container from "@/components/Container";

export default function ProjectNotFound() {
  return (
    <Container as="section" size="narrow" className="py-24">
      <h1 className="text-3xl font-semibold tracking-tight">
        Project not found
      </h1>
      <p className="mt-4 text-muted">
        This project doesn&apos;t exist or isn&apos;t public.
      </p>
      <Button href="/projects" variant="secondary" className="mt-8">
        See all projects
      </Button>
    </Container>
  );
}
