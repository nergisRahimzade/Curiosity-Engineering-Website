// Activities page (/activities). Added in setup/frontend-plan-alignment so
// the route exists; photos and content come in W3D3-FE.
import PagePlaceholder from "@/components/PagePlaceholder";

export const metadata = { title: "Activities" };

export default function ActivitiesPage() {
  return (
    <PagePlaceholder
      title="Activities"
      description="Past club activities with photos."
      task="W3D3-FE"
    />
  );
}
