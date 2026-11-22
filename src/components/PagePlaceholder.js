import Container from "@/components/Container";

// Temporary body for routes that haven't been built yet. Each page swaps
// this out when its plan task lands. `task` is the task ID from
// docs/plan/tasks.md (e.g. "W2D4-FE"), so anyone can look up what's coming.
export default function PagePlaceholder({ title, description, task }) {
  return (
    <Container as="section" className="py-24">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-xl text-muted">{description}</p>
      {task && (
        <p className="mt-10 inline-block rounded-full border border-line px-3 py-1 text-xs text-muted">
          Planned for {task}
        </p>
      )}
    </Container>
  );
}
