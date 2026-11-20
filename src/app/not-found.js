import Link from "next/link";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="mt-4 text-muted">That page doesn&apos;t exist.</p>
      <Link href="/" className="mt-8 inline-block text-sm font-medium underline underline-offset-4">
        Back to home
      </Link>
    </section>
  );
}
