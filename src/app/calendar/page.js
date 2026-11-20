import PagePlaceholder from "@/components/PagePlaceholder";

export const metadata = { title: "Calendar" };

export default function CalendarPage() {
  return (
    <PagePlaceholder
      title="Calendar"
      description="Upcoming conferences, competitions, general meetings and project meetings."
      comingOn="Day 7"
    />
  );
}
