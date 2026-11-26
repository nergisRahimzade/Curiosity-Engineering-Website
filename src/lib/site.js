// Single source of truth for the site name and the main routes.
// The navbar, footer and page titles all read from here, so adding a
// route later is a one-line change.
// Routes follow docs/plan/architecture.md ("Pages and routes"), updated in
// setup/frontend-plan-alignment.

export const site = {
  name: "Curiosity Engineering Club",
  shortName: "Curiosity Engineering",
  description:
    "Projects, events and membership for the Curiosity Engineering Club.",
};

// Public pages everyone sees in the navbar.
const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/activities", label: "Activities" },
  { href: "/calendar", label: "Calendar" },
];

// What a visitor sees. "Join" is the plan's /register page. The footer uses
// this list too, so it stays the same for everyone (it's a server component
// and doesn't know who is logged in).
export const navLinks = [...publicLinks, { href: "/register", label: "Join" }];

// The footer adds "Log in". Officers reach /officer after logging in, so
// there's no public link to it.
const loginLink = { href: "/login", label: "Log in" };
export const footerLinks = [...navLinks, loginLink];

// W2D3-FE: where each role goes after logging in (architecture doc, "Pages
// and routes"). The login page's success button reads this, and the W2D5
// navbar can too. /dashboard is built later in the plan, so until then the
// member link shows the 404 page.
export const roleHome = {
  officer: { href: "/officer", label: "Go to officer home" },
  member: { href: "/dashboard", label: "Go to your dashboard" },
};

// W2D5-FE: the navbar's links by role (architecture doc, "Pages and routes").
// Officers can lead projects too, and the "Projects I lead" section lives on
// the dashboard, so they get both links. Logged-in users don't need "Join".
const dashboardLink = { href: roleHome.member.href, label: "Dashboard" };
export const roleLinks = {
  member: [dashboardLink],
  officer: [dashboardLink, { href: roleHome.officer.href, label: "Officer" }],
};

// The navbar's links for a session from src/lib/session.js. While it's still
// loading, only the public pages show, so a member never sees "Join" flash
// before their own links. An unknown role gets the member links.
export function navLinksFor(session) {
  if (session.status === "user") {
    return [...publicLinks, ...(roleLinks[session.user.role] ?? roleLinks.member)];
  }
  if (session.status === "visitor") return [...navLinks, loginLink];
  return publicLinks;
}
