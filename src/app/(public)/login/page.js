// Login page (/login). Added in setup/frontend-plan-alignment so the route existed.
// W2D3-FE: Login page with loading, error and success states. The page is a
// server component so it can set the tab title; the form lives in LoginForm.js.
import Container from "@/components/Container";
import LoginForm from "./LoginForm";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Container as="section" size="narrow" className="py-16 sm:py-24">
      <h1 className="text-3xl font-semibold tracking-tight">Log in</h1>
      <p className="mt-4 max-w-xl text-muted">
        Members and officers log in here to see their dashboard.
      </p>
      <LoginForm />
    </Container>
  );
}
