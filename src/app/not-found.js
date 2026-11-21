import Button from "@/components/Button";
import Container from "@/components/Container";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <Container as="section" className="py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-4 text-muted">That page doesn&apos;t exist.</p>
      <Button href="/" variant="secondary" className="mt-8">
        Back to home
      </Button>
    </Container>
  );
}
