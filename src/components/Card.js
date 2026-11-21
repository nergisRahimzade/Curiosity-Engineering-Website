import Link from "next/link";

// A bordered box for one item: a project, an event, a stat.
// Pass href to make the whole card a link (the title carries the link
// text, so screen readers hear the project name, not "card").
//
//   <Card
//     href="/projects/robot-arm"
//     media={<img src="…" alt="" />}     // optional, shown edge to edge on top
//     eyebrow="Spring 2026"              // optional small line above the title
//     title="Robot arm"
//     footer="Team: Ana, Lee"            // optional, pinned to the bottom
//   >
//     A three-axis arm built from recycled parts.
//   </Card>
//
// Cards stretch to fill their grid cell, so a row of cards lines up even
// when descriptions differ in length.

export default function Card({
  href,
  media,
  eyebrow,
  title,
  titleAs: Title = "h3",
  footer,
  className = "",
  children,
}) {
  const interactive = Boolean(href);

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-background transition-colors ${
        interactive
          ? "hover:border-foreground has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-accent"
          : ""
      } ${className}`}
    >
      {media && (
        <div className="aspect-[4/3] overflow-hidden border-b border-line bg-line [&>img]:h-full [&>img]:w-full [&>img]:object-cover">
          {media}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5">
        {eyebrow && <p className="text-xs text-muted">{eyebrow}</p>}

        {title && (
          <Title className={`font-semibold tracking-tight ${eyebrow ? "mt-1" : ""}`}>
            {interactive ? (
              // The ::after stretches this link over the whole card.
              <Link
                href={href}
                className="outline-none after:absolute after:inset-0 after:content-['']"
              >
                {title}
              </Link>
            ) : (
              title
            )}
          </Title>
        )}

        {children && (
          <div className={`text-sm text-muted ${title ? "mt-2" : ""}`}>
            {children}
          </div>
        )}

        {footer && (
          <div className="mt-auto pt-5 text-xs text-muted">{footer}</div>
        )}
      </div>
    </article>
  );
}
