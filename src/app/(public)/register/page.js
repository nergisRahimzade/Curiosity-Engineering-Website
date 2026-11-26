// Club registration (/register), the plan's name for the old /join page.
// W2D2-FE: Register page. The page itself is a server component so it can
// set the tab title; the interactive form lives in RegisterForm.js.
import Container from "@/components/Container";
import RegisterForm from "./RegisterForm";

export const metadata = { title: "Join the club" };

export default function RegisterPage() {
  return (
    <Container as="section" size="narrow" className="py-16 sm:py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Join the club</h1>
      <p className="mt-4 max-w-xl text-muted">
        Create a member account to RSVP to events and see your dashboard.
      </p>
      <RegisterForm />
    </Container>
  );
}
