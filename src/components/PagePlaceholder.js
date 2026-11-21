import Container from "@/components/Container";

// Temporary body for routes that haven't been built yet. Each page swaps
// this out on the day its real content lands (see the build plan).
export default function PagePlaceholder({ title, description, comingOn }) {
  return (
    <Container as="section" className="py-24">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-xl text-muted">{description}</p>
      {comingOn && (
        <p className="mt-10 inline-block rounded-full border border-line px-3 py-1 text-xs text-muted">
          Coming {comingOn}
        </p>
      )}
    </Container>
  );
}
