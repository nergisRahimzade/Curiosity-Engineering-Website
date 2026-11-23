// Home page (/). Placeholder until W2D4-FE ("Home page with placeholder data").
import PagePlaceholder from "@/components/PagePlaceholder";
import { site } from "@/lib/site";

export default function HomePage() {
  return (
    <PagePlaceholder
      title={site.name}
      description="A short intro, featured projects, the next three events and a Join button will live here."
      task="W2D4-FE"
    />
  );
}
