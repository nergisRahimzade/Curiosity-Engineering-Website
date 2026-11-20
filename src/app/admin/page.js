import PagePlaceholder from "@/components/PagePlaceholder";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <PagePlaceholder
      title="Admin"
      description="Officer login and the dashboard for adding projects and events."
      comingOn="Day 11"
    />
  );
}
