// W3D1-FE: "← All projects" link at the top of /projects/[id], used by the
// page and its loading state, so the way back is always in the same place.
import Button from "@/components/Button";

export default function BackToProjects() {
  return (
    <Button href="/projects" variant="ghost" size="sm" className="-ml-3">
      <span aria-hidden="true">←</span> All projects
    </Button>
  );
}
