// Officer home (/officer), the plan's name for the old /admin page.
// proxy.js will block it for non-officers (W2D4-BE). Officer pages start
// with the add/edit forms in W3D5-FE.
import PagePlaceholder from "@/components/PagePlaceholder";

export const metadata = {
  title: "Officer home",
  robots: { index: false, follow: false },
};

export default function OfficerPage() {
  return (
    <PagePlaceholder
      title="Officer home"
      description="Quick links and stats for officers: expenses, meetings, RSVP forms, tasks, events, projects, activities and members."
      task="W3D5-FE onward"
    />
  );
}
