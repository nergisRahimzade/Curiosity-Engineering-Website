import Link from "next/link";

// One button style for the whole site. Renders a <Link> when given an
// internal href, a plain <a> for external URLs, and a <button> otherwise.
//
//   <Button href="/register">Join the club</Button>
//   <Button variant="secondary" href="/projects">See projects</Button>
//   <Button type="submit" disabled={saving}>Save</Button>
//
// Variants:
//   primary   – the one main action on a screen (accent fill)
//   secondary – other actions (outlined)
//   ghost     – low-key actions such as "Cancel" (text only)

const base =
  "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors motion-reduce:transition-none " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent " +
  "disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variants = {
  primary: "bg-accent text-on-accent hover:bg-accent-hover",
  secondary:
    "border border-line bg-background text-foreground hover:border-foreground",
  ghost: "text-muted hover:text-foreground",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
};

function isExternal(href) {
  return typeof href === "string" && /^(https?:|mailto:|tel:)/.test(href);
}

export default function Button({
  href,
  variant = "primary",
  size = "md",
  type = "button",
  className = "",
  children,
  ...props
}) {
  const classes = `${base} ${variants[variant] ?? variants.primary} ${
    sizes[size] ?? sizes.md
  } ${className}`;

  if (href && isExternal(href)) {
    // Web links open in a new tab; mailto:/tel: open the user's app instead.
    const newTab = href.startsWith("http");
    return (
      <a
        href={href}
        className={classes}
        {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        {...props}
      >
        {children}
        {/* Screen readers are told before the tab switches under them. */}
        {newTab && <span className="sr-only"> (opens in new tab)</span>}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
