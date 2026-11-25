"use client";

// W2D2-FE: The registration form on /register. Checks the fields in the
// browser with the same Zod schema the API uses, posts to
// POST /api/auth/register, and shows the plan's three form states:
// sending, success and error.

import { useRef, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import { registerSchema } from "@/lib/validation";

// Fields in the order they appear, so focus goes to the first one that's wrong.
const FIELDS = ["name", "email", "password"];

// Turn Zod issues ([{ path: ["email"], message }]) into { email: "message" }.
// The browser check and the API both return this shape, so one helper reads both.
// Only the first message per field is kept: one clear problem at a time.
function issuesToErrors(issues = []) {
  const errors = {};
  for (const issue of issues) {
    const field = issue.path?.[0];
    if (FIELDS.includes(field) && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

export default function RegisterForm() {
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  // "idle" | "sending" | "success"
  const [status, setStatus] = useState("idle");
  // Problems that aren't about one field (server down, no network).
  const [formError, setFormError] = useState("");
  const [user, setUser] = useState(null);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const formErrorRef = useRef(null);
  const successRef = useRef(null);

  const sending = status === "sending";

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    // Clear a field's error as soon as it's edited, so old messages don't linger.
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  // Move focus to the first invalid field, so keyboard and screen reader
  // users land on the problem (plan: "Moving focus").
  function focusFirstError(fieldErrors) {
    const refs = { name: nameRef, email: emailRef, password: passwordRef };
    const first = FIELDS.find((field) => fieldErrors[field]);
    // Wait one frame: after a server reply the fields are still disabled
    // from "sending" until React re-renders, and disabled fields can't take focus.
    requestAnimationFrame(() => refs[first]?.current?.focus());
  }

  // Show a problem that isn't tied to one field and move focus to it.
  // requestAnimationFrame waits until the message is on the page.
  function showFormError(message) {
    setFormError(message);
    requestAnimationFrame(() => formErrorRef.current?.focus());
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (sending) return; // A double click shouldn't send twice.

    setFormError("");

    // 1. Check in the browser first: instant messages, no wasted request.
    const check = registerSchema.safeParse(values);
    if (!check.success) {
      const fieldErrors = issuesToErrors(check.error.issues);
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("sending");

    // 2. Send it. The server checks everything again: the browser check is
    //    only for convenience, anyone can skip it.
    let response;
    let data = {};
    try {
      response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      data = await response.json().catch(() => ({}));
    } catch {
      setStatus("idle");
      showFormError("We couldn't reach the server. Check your connection and try again.");
      return;
    }

    // 3. Show what happened.
    if (response.status === 201) {
      setUser(data.user);
      setStatus("success");
      requestAnimationFrame(() => successRef.current?.focus());
      return;
    }

    setStatus("idle");

    if (response.status === 400 && data.errors) {
      const fieldErrors = issuesToErrors(data.errors);
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        focusFirstError(fieldErrors);
        return;
      }
    }

    if (response.status === 409) {
      // The email is taken: put the message on the email field itself.
      const fieldErrors = { email: data.error ?? "An account with this email already exists." };
      setErrors(fieldErrors);
      focusFirstError(fieldErrors);
      return;
    }

    showFormError(data.error ?? "Something went wrong. Please try again.");
  }

  if (status === "success") {
    return (
      <div className="mt-10 rounded-lg border border-line p-6">
        {/* tabIndex={-1} lets us move focus here without adding it to the Tab order. */}
        <h2
          ref={successRef}
          tabIndex={-1}
          className="text-xl font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Welcome{user?.name ? `, ${user.name}` : ""}!
        </h2>
        <p className="mt-2 text-muted">
          Your account is ready. Log in with{" "}
          <span className="font-medium text-foreground">{user?.email ?? values.email}</span> to
          see your dashboard.
        </p>
        <Button href="/login" className="mt-6">
          Log in
        </Button>
      </div>
    );
  }

  return (
    // noValidate turns off the browser's own pop-up bubbles so our messages,
    // which screen readers can find again, are the only ones shown.
    <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-6">
      {formError && (
        <p
          ref={formErrorRef}
          tabIndex={-1}
          role="alert"
          className="rounded-md border border-danger bg-danger/5 px-4 py-3 text-sm text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {formError}
        </p>
      )}

      <FormField
        ref={nameRef}
        label="Name"
        name="name"
        autoComplete="name"
        required
        value={values.name}
        onChange={update}
        error={errors.name}
        disabled={sending}
      />
      <FormField
        ref={emailRef}
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        required
        value={values.email}
        onChange={update}
        error={errors.email}
        disabled={sending}
      />
      <FormField
        ref={passwordRef}
        label="Password"
        name="password"
        type="password"
        // "new-password" tells password managers to suggest a strong one.
        autoComplete="new-password"
        required
        hint="At least 12 characters. A short sentence works well."
        value={values.password}
        onChange={update}
        error={errors.password}
        disabled={sending}
      />

      <div className="flex flex-wrap items-center gap-4">
        {/* aria-disabled instead of disabled keeps focus on the button while it sends. */}
        <Button type="submit" aria-disabled={sending || undefined}>
          {sending ? "Creating account…" : "Create account"}
        </Button>
        <p className="text-sm text-muted">
          Already a member?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-4 hover:text-accent"
          >
            Log in
          </Link>
        </p>
      </div>

      {/* Announces "sending" without moving focus. */}
      <p role="status" className="sr-only">
        {sending ? "Creating your account…" : ""}
      </p>
    </form>
  );
}
