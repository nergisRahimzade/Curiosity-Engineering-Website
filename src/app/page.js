import PagePlaceholder from "@/components/PagePlaceholder";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <PagePlaceholder
      title={site.name}
      description="A short intro, our latest projects and the next three events will live here."
      comingOn="Day 6"
    />
  );
}
