"use client";

// W2D2-FE: The registration form on /register. Checks the fields in the
// browser with the same Zod schema the API uses, posts to
// POST /api/auth/register, and shows the plan's three form states:
// sending, success and error.

import { useEffect, useRef, useState } from "react";
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

function firstInvalidField(fieldErrors) {
  return FIELDS.find((field) => fieldErrors[field]);
}

export default function RegisterForm() {
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  // "idle" | "sending" | "success"
  const [status, setStatus] = useState("idle");
  // Problems that aren't about one field (server down, no network).
  const [formError, setFormError] = useState("");
  const [user, setUser] = useState(null);
  // Where focus should go after React has drawn the next screen:
  // { target: "name" | "email" | "password" | "formError" | "success", count }.
  // count changes on every request, so the same target can be focused again.
  const [focusRequest, setFocusRequest] = useState(null);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const formErrorRef = useRef(null);
  const successRef = useRef(null);
  // A ref, not state: it updates instantly, so a second Enter or click in
  // the same moment can't slip past before React re-renders.
  const sendingRef = useRef(false);
  // Whether the form is on screen. Next.js keeps a page alive but hidden
  // after you navigate away (cacheComponents), and runs effect cleanups then.
  const visibleRef = useRef(false);
  // The last focus request already carried out, so showing the page again
  // doesn't replay an old one.
  const handledFocusRef = useRef(0);

  const sending = status === "sending";

  // Effects run after React has put the new elements on the page, so the
  // field, error message or heading exists and can take focus.
  useEffect(() => {
    if (!focusRequest || focusRequest.count === handledFocusRef.current) return;
    handledFocusRef.current = focusRequest.count;
    const targets = {
      name: nameRef,
      email: emailRef,
      password: passwordRef,
      formError: formErrorRef,
      success: successRef,
    };
    targets[focusRequest.target]?.current?.focus();
  }, [focusRequest]);

  // Track whether the form is on screen (see visibleRef above).
  useEffect(() => {
    visibleRef.current = true;
    return () => {
      visibleRef.current = false;
    };
  }, []);

  function moveFocusTo(target) {
    // A reply that arrives after the visitor left must not pull focus when
    // they come back. The message is still shown; only focus stays put.
    if (!visibleRef.current) return;
    setFocusRequest((current) => ({ target, count: (current?.count ?? 0) + 1 }));
  }

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    // Clear a field's error as soon as it's edited, so old messages don't linger.
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function showFieldErrors(fieldErrors) {
    setErrors(fieldErrors);
    moveFocusTo(firstInvalidField(fieldErrors));
  }

  // A problem that isn't tied to one field. Focus moves to the message, and
  // that's how screen readers hear it (no role="alert", which would say it twice).
  function showFormError(message) {
    setFormError(message);
    moveFocusTo("formError");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    // Blocks double clicks, a second Enter and Space on the button.
    if (sendingRef.current) return;

    setFormError("");

    // 1. Check in the browser first: instant messages, no wasted request.
    const check = registerSchema.safeParse(values);
    if (!check.success) {
      showFieldErrors(issuesToErrors(check.error.issues));
      return;
    }

    setErrors({});
    setStatus("sending");
    sendingRef.current = true;
    // The request isn't cancelled if the visitor leaves: cancelling can't undo
    // an account the server already made, and the result should still show
    // if they come back to this page.

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
      // An error page from the host (HTML or empty) isn't JSON; treat it as no details.
      data = await response.json().catch(() => ({}));
    } catch {
      sendingRef.current = false;
      setStatus("idle");
      showFormError("We couldn't reach the server. Check your connection and try again.");
      return;
    }

    sendingRef.current = false;

    // 3. Show what happened.
    if (response.status === 201) {
      setUser(data.user);
      setStatus("success");
      moveFocusTo("success");
      return;
    }

    setStatus("idle");

    if (response.status === 400 && data.errors) {
      const fieldErrors = issuesToErrors(data.errors);
      if (firstInvalidField(fieldErrors)) {
        showFieldErrors(fieldErrors);
        return;
      }
    }

    if (response.status === 409) {
      // The email is taken: put the message on the email field itself.
      showFieldErrors({ email: data.error ?? "An account with this email already exists." });
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
          className="rounded-md border border-danger bg-danger/5 px-4 py-3 text-sm text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {formError}
        </p>
      )}

      {/* readOnly, not disabled, while sending: a disabled field drops keyboard
          focus to the page, which happens when someone presses Enter in it. */}
      <FormField
        ref={nameRef}
        label="Name"
        name="name"
        autoComplete="name"
        required
        value={values.name}
        onChange={update}
        error={errors.name}
        readOnly={sending}
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
        readOnly={sending}
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
        readOnly={sending}
      />

      <div className="flex flex-wrap items-center gap-4">
        {/* The label stays the same so a focused button isn't re-announced.
            aria-disabled only greys it out; sendingRef is what blocks a resend. */}
        <Button type="submit" aria-disabled={sending || undefined}>
          Create account
        </Button>
        {/* The one "sending" announcement: visible text in a status region,
            read politely without moving focus. */}
        <p role="status" className="text-sm text-muted">
          {sending ? "Creating your account…" : ""}
        </p>
      </div>

      <p className="text-sm text-muted">
        Already a member?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground underline underline-offset-4 hover:text-accent"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
