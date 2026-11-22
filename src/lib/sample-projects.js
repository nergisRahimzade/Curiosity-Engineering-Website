// Stand-in rows for the `projects` table, used by src/lib/projects.js
// until the Prisma schema and projects API exist (W1D3 and W3D1).
// Delete this file once getProjects() reads from the database.

export const sampleProjects = [
  {
    id: "solar-tracker",
    title: "Solar panel tracker",
    description:
      "A panel that turns to follow the sun, built from an Arduino and two servos.",
    date: "2026-03-14",
    team: ["Ana", "Lee", "Sam"],
    lead: "Ana",
    open_to_join: true,
  },
  {
    id: "weather-station",
    title: "Campus weather station",
    description:
      "Temperature, humidity and wind readings from the roof, posted every ten minutes.",
    date: "2025-11-02",
    team: ["Maya", "Theo", "Kai", "Rin"],
    lead: "Maya",
  },
  {
    id: "water-rocket",
    title: "Water bottle rocket",
    description: "Pressurized launches to test which fin shape flies highest.",
    date: "2025-10-05",
    team: ["Priya", "Jon"],
    lead: "Priya",
  },
  {
    id: "line-robot",
    title: "Line-following robot",
    description: "A small robot that reads a taped track with two light sensors.",
    date: "2025-04-20",
    team: ["Omar", "Lena"],
    lead: "Omar",
    open_to_join: true,
  },
  {
    id: "bridge-challenge",
    title: "Popsicle-stick bridge",
    description:
      "Our entry for the regional bridge competition. It held 41 kg before it broke.",
    date: "2025-02-08",
    team: ["Iris", "Ben", "Sofia"],
    lead: "Iris",
  },
];
