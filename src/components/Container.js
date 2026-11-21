// Centers content and gives every page the same side padding.
// The navbar, footer and pages all use this, so changing the site width
// is a one-line change here.
//
//   <Container>…</Container>                  → 1024px wide (default)
//   <Container size="narrow">…</Container>    → 672px, for forms and long text
//   <Container as="section" className="py-24"> → any element, extra classes

const sizes = {
  narrow: "max-w-2xl",
  default: "max-w-5xl",
};

export default function Container({
  as: Tag = "div",
  size = "default",
  className = "",
  children,
  ...props
}) {
  return (
    <Tag
      className={`mx-auto w-full px-6 ${sizes[size] ?? sizes.default} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
