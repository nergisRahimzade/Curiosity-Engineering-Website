// Login page (/login). Added in setup/frontend-plan-alignment so the route
// exists; the form comes in W2D3-FE ("Login page with loading, error and success states").
import PagePlaceholder from "@/components/PagePlaceholder";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <PagePlaceholder
      title="Log in"
      description="Members and officers will log in here."
      task="W2D3-FE"
    />
  );
}
