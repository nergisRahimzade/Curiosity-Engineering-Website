import { Suspense } from "react";
import Container from "@/components/Container";
import ProjectGrid, {
  ProjectGridSkeleton,
} from "@/components/projects/ProjectGrid";

export const metadata = {
  title: "Projects",
  description: "Past and current projects from the Curiosity Engineering Club.",
};

export default function ProjectsPage() {
  return (
    <Container as="section" className="py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-4 max-w-xl text-muted">
        What club members have built, tested and taken to competitions.
        Projects marked <span className="text-foreground">Open to join</span>{" "}
        are looking for new members.
      </p>

      <div className="mt-10">
        <Suspense fallback={<ProjectGridSkeleton />}>
          <ProjectGrid />
        </Suspense>
      </div>
    </Container>
  );
}
