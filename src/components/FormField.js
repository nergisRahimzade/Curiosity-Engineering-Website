"use client";

// W2D1-FE: One labelled form field (input, textarea or select) with an
// optional hint and error message. The register, login, RSVP and officer
// forms all use it, so every field is labelled and announces its error the
// same way.
//
//   <FormField label="Email" name="email" type="email" autoComplete="email" required />
//   <FormField label="Password" name="password" type="password"
//     hint="At least 12 characters." error={errors.password} />
//   <FormField as="textarea" label="Notes" name="notes" rows={4} />
//   <FormField as="select" label="Event type" name="type">
//     <option value="meeting">Meeting</option>
//     <option value="workshop">Workshop</option>
//   </FormField>
//
// Any other prop (value, onChange, defaultValue, placeholder, min, …) goes
// straight to the input. It's a client component because useId only works
// there, and every form that uses it is interactive anyway.

import { useId } from "react";

const control =
  "mt-1.5 block w-full rounded-md border bg-background px-3 text-base text-foreground " +
  "transition-colors motion-reduce:transition-none placeholder:text-muted " +
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent " +
  "disabled:cursor-not-allowed disabled:opacity-50";

// Inputs and selects are 44px tall, the plan's ideal tap size.
const heights = {
  input: "h-11",
  select: "h-11",
  textarea: "min-h-24 py-2.5",
};

export default function FormField({
  label,
  name,
  as: Tag = "input",
  type = "text",
  id,
  hint,
  error,
  required = false,
  className = "",
  children,
  ...props
}) {
  // useId gives each field its own id, so labels and messages still link
  // up when the same form appears twice on a page.
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  // The error is listed first so screen readers say what's wrong before the hint.
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  const shared = {
    id: fieldId,
    name,
    required,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
    className: `${control} ${heights[Tag] ?? heights.input} ${
      error ? "border-danger" : "border-line hover:border-foreground"
    }`,
    ...props,
  };

  return (
    <div className={className}>
      <label htmlFor={fieldId} className="block text-sm font-medium">
        {label}
        {/* Spelled out, not a red star, so it doesn't rely on colour. */}
        {required && <span className="font-normal text-muted"> (required)</span>}
      </label>

      {Tag === "textarea" && <textarea {...shared} />}
      {Tag === "select" && <select {...shared}>{children}</select>}
      {Tag !== "textarea" && Tag !== "select" && <input type={type} {...shared} />}

      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      )}
    </div>
  );
}
