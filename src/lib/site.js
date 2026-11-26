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

// Public routes shown in the navbar. "Join" is the plan's /register page.
// Member and officer links are added by role in W2D5-FE (Navbar reads
// /api/auth/me), so none are listed here.
export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/activities", label: "Activities" },
  { href: "/calendar", label: "Calendar" },
  { href: "/register", label: "Join" },
];

// The footer adds "Log in". Officers reach /officer after logging in, so
// there's no public link to it.
export const footerLinks = [...navLinks, { href: "/login", label: "Log in" }];

// W2D3-FE: where each role goes after logging in (architecture doc, "Pages
// and routes"). The login page's success button reads this, and the W2D5
// navbar can too. /dashboard is built later in the plan, so until then the
// member link shows the 404 page.
export const roleHome = {
  officer: { href: "/officer", label: "Go to officer home" },
  member: { href: "/dashboard", label: "Go to your dashboard" },
};
