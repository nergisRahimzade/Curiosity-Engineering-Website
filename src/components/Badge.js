// W2D1-FE: A small label for a status or category: "Paid", "Overdue",
// "Officer", "Workshop", "Done". The text always carries the meaning; the
// colour only helps people scan (the plan's "colour plus text" rule).
//
//   <Badge>Member</Badge>
//   <Badge tone="accent">Officer</Badge>
//   <Badge tone="success">Paid</Badge>
//   <Badge tone="danger">Overdue</Badge>
//
// Pick tones by meaning, not looks, so the same word is the same colour on
// every page: success = done/paid/present, danger = overdue/absent/needs
// action, accent = highlighted role or type, neutral = everything else.

const tones = {
  neutral: "border-line bg-line/40 text-foreground",
  accent: "border-accent/30 bg-accent/10 text-accent-hover",
  success: "border-success/30 bg-success/10 text-success",
  danger: "border-danger/30 bg-danger/10 text-danger",
};

export default function Badge({ tone = "neutral", className = "", children, ...props }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        tones[tone] ?? tones.neutral
      } ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
