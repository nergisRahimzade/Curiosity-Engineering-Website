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

  // Work out where a link really opens, once, for both link branches below.
  // Web links open in a new tab unless the caller picks a target;
  // mailto:/tel: open the user's app instead. A caller's target="_blank"
  // on an internal link counts too, so the note below always matches.
  const target =
    props.target ??
    (href && isExternal(href) && href.startsWith("http") ? "_blank" : undefined);
  const newTab = target === "_blank";
  // rel="noopener" stops the new tab from controlling this page.
  const newTabProps = newTab
    ? { target, rel: props.rel ?? "noopener noreferrer" }
    : {};
  // Screen readers are told before the tab switches under them.
  const newTabNote = newTab && (
    <span className="sr-only"> (opens in new tab)</span>
  );

  if (href && isExternal(href)) {
    return (
      <a href={href} className={classes} {...props} {...newTabProps}>
        {children}
        {newTabNote}
      </a>
    );
  }

  if (href) {
    return (
      <Link href={href} className={classes} {...props} {...newTabProps}>
        {children}
        {newTabNote}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
