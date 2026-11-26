// W2D4-FE: placeholder data for the Home page. Replaced by real data from
// the API in W3D1-FE (projects) and W3D4-FE (events).

export const featuredProjects = [
  { id: "robot-arm", title: "Robot arm", summary: "A three-axis arm built from recycled parts.", team: "Ana, Lee" },
  { id: "autonomous-rover", title: "Autonomous rover", summary: "A small rover that maps a room and drives around obstacles.", team: "Sam, Priya" },
  { id: "weather-station", title: "Weather station", summary: "Solar-powered sensors that report to a web dashboard.", team: "Jo, Mika" },
];

// "type" uses the plan's four event types: conference, competition,
// general meeting, project meeting. startsAt is an ISO time (Pacific) so
// the page can print it in a <time> tag; "label" is what visitors read.
export const nextEvents = [
  { id: 1, title: "Welcome meeting", type: "General meeting", startsAt: "2026-12-03T18:00:00-08:00", label: "Dec 3, 6 PM" },
  { id: 2, title: "Rover build session", type: "Project meeting", startsAt: "2026-12-10T17:30:00-08:00", label: "Dec 10, 5:30 PM" },
  { id: 3, title: "Regional robotics competition", type: "Competition", startsAt: "2026-12-17T09:00:00-08:00", label: "Dec 17, 9 AM" },
];
