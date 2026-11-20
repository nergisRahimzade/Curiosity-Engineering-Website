// Single source of truth for the site name and the main routes.
// The navbar, footer and page titles all read from here, so adding a
// route later is a one-line change.

export const site = {
  name: "Curiosity Engineering Club",
  shortName: "Curiosity Engineering",
  description:
    "Projects, events and membership for the Curiosity Engineering Club.",
};

// Public routes shown in the navbar. Admin is kept out of the main nav
// (officers reach it directly or from the footer).
export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/calendar", label: "Calendar" },
  { href: "/join", label: "Join" },
];

export const footerLinks = [...navLinks, { href: "/admin", label: "Admin" }];
