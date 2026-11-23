import Button from "@/components/Button";
import Card from "@/components/Card";
import Container from "@/components/Container";

// Internal reference page: every shared component and color on one screen.
// Not linked from the navbar or footer and hidden from search engines.
// Use it to check the style guide and to review new components.

export const metadata = {
  title: "Style guide",
  robots: { index: false, follow: false },
};

const colors = [
  { token: "foreground", use: "Text, headings" },
  { token: "background", use: "Page background" },
  { token: "accent", use: "Primary buttons, focus rings" },
  { token: "muted", use: "Secondary text" },
  { token: "line", use: "Borders, dividers" },
];

const sampleProjects = [
  {
    id: "solar-tracker",
    title: "Solar panel tracker",
    date: "Spring 2026",
    description: "A panel that turns to follow the sun, built from an Arduino and two servos.",
    team: "Ana, Lee, Sam",
  },
  {
    id: "water-rocket",
    title: "Water bottle rocket",
    date: "Fall 2025",
    description: "Pressurized launches to test fin shapes.",
    team: "Priya, Jon",
  },
  {
    id: "weather-station",
    title: "Campus weather station",
    date: "Fall 2025",
    description:
      "Temperature, humidity and wind readings posted every ten minutes. A longer description shows that cards in a row stay the same height.",
    team: "Maya, Theo, Kai, Rin",
  },
];

function Section({ title, children }) {
  return (
    <section className="border-t border-line py-12">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export default function StyleguidePage() {
  return (
    <Container className="py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Style guide</h1>
      <p className="mt-4 max-w-xl text-muted">
        Shared components and colors. Change colors in{" "}
        <code className="text-foreground">src/app/globals.css</code>.
      </p>

      <div className="mt-12">
        <Section title="Colors">
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {colors.map(({ token, use }) => (
              <li key={token}>
                <div
                  className="h-16 rounded-md border border-line"
                  style={{ background: `var(--${token})` }}
                />
                <p className="mt-2 text-sm font-medium">{token}</p>
                <p className="text-xs text-muted">{use}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Type">
          <p className="text-3xl font-semibold tracking-tight">Page heading</p>
          <p className="mt-3 text-lg font-semibold tracking-tight">Section heading</p>
          <p className="mt-3">Body text for descriptions and paragraphs.</p>
          <p className="mt-3 text-sm text-muted">Secondary text for dates and details.</p>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button size="sm">Small primary</Button>
            <Button size="sm" variant="secondary">
              Small secondary
            </Button>
            <Button href="/register">Link button</Button>
          </div>
        </Section>

        <Section title="Cards">
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sampleProjects.map((p) => (
              <li key={p.id}>
                <Card
                  href="/projects"
                  media={<div className="h-full w-full" aria-hidden="true" />}
                  eyebrow={p.date}
                  title={p.title}
                  footer={`Team: ${p.team}`}
                >
                  {p.description}
                </Card>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">Without a link or image:</p>
          <div className="mt-3 max-w-sm">
            <Card title="Next general meeting" eyebrow="Thu, Dec 3 · 5 pm">
              Room 204, Engineering Building.
            </Card>
          </div>
        </Section>

        <Section title="Container widths">
          <div className="space-y-3">
            <div className="rounded-md bg-line py-3 text-center text-xs text-muted">
              default · max-w-5xl (1024px)
            </div>
            <Container size="narrow" className="px-0!">
              <div className="rounded-md bg-line py-3 text-center text-xs text-muted">
                narrow · max-w-2xl (672px)
              </div>
            </Container>
          </div>
        </Section>
      </div>
    </Container>
  );
}
