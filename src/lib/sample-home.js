// W2D4-FE: placeholder events for the Home page. Replaced by the events API
// in W3D4-FE. Projects are NOT here: the Home page reads them from
// getProjects() in src/lib/projects.js, like the /projects page does.
//
// Only startsAt is stored; the page formats it. Dates are in January so they
// are still upcoming at the Jan 4 deadline. "type" uses the plan's event
// types: conference, competition, general meeting, project meeting.
export const nextEvents = [
  { id: 1, title: "Welcome meeting", type: "General meeting", startsAt: "2027-01-12T18:00:00-08:00" },
  { id: 2, title: "Project build session", type: "Project meeting", startsAt: "2027-01-19T17:30:00-08:00" },
  { id: 3, title: "Regional bridge competition", type: "Competition", startsAt: "2027-01-26T09:00:00-08:00" },
];
