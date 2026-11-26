"use client";

// W2D3-FE: The login form on /login. Checks the fields in the browser with
// the same Zod schema the API uses, posts to POST /api/auth/login, and shows
// the plan's three form states: sending ("loading"), success and error.
// It follows the register form (W2D2-FE) on purpose, so both forms behave the
// same for keyboard and screen reader users.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import FormField from "@/components/FormField";
import { firstInvalidField, issuesToErrors } from "@/lib/form-errors";
import { roleHome } from "@/lib/site";
import { loginSchema } from "@/lib/validation";

// Fields in the order they appear, so focus goes to the first one that's wrong.
const FIELDS = ["email", "password"];

// Used only if the server's reply has no message of its own.
const WRONG_LOGIN = "Email or password is incorrect.";
const SERVER_ERROR = "Something went wrong. Please try again.";
const NO_NETWORK = "We couldn't reach the server. Check your connection and try again.";

export default function LoginForm() {
  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  // "idle" | "sending" | "success"
  const [status, setStatus] = useState("idle");
  // Problems that aren't about one field: a wrong email/password pair, server down, no network.
  const [formError, setFormError] = useState("");
  const [user, setUser] = useState(null);
  // Where focus should go after React has drawn the next screen:
  // { target: "email" | "password" | "formError" | "success", count }.
  // count changes on every request, so the same target can be focused again.
  const [focusRequest, setFocusRequest] = useState(null);

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const formErrorRef = useRef(null);
  const successRef = useRef(null);
  // A ref, not state: it updates instantly, so a second Enter or click in
  // the same moment can't send a second request before React re-renders.
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
    moveFocusTo(firstInvalidField(fieldErrors, FIELDS));
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
    const check = loginSchema.safeParse(values);
    if (!check.success) {
      showFieldErrors(issuesToErrors(check.error.issues, FIELDS));
      return;
    }

    setErrors({});
    setStatus("sending");
    sendingRef.current = true;

    // 2. Send it. The server checks everything again: the browser check is
    //    only for convenience, anyone can skip it. The reply sets the httpOnly
    //    session cookie itself; this code never sees the token.
    let response;
    let data = {};
    try {
      response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      // An error page from the host (HTML or empty) isn't JSON; treat it as no details.
      data = await response.json().catch(() => ({}));
    } catch {
      sendingRef.current = false;
      setStatus("idle");
      showFormError(NO_NETWORK);
      return;
    }

    sendingRef.current = false;

    // 3. Show what happened.
    if (response.ok && data.user) {
      setUser(data.user);
      setStatus("success");
      moveFocusTo("success");
      return;
    }

    setStatus("idle");

    if (response.status === 400 && data.errors) {
      const fieldErrors = issuesToErrors(data.errors, FIELDS);
      if (firstInvalidField(fieldErrors, FIELDS)) {
        showFieldErrors(fieldErrors);
        return;
      }
    }

    if (response.status === 401) {
      // The server doesn't say whether the email or the password was wrong
      // (so strangers can't test which emails have accounts), so neither do we:
      // one message above the form, not on a field.
      showFormError(data.error ?? WRONG_LOGIN);
      return;
    }

    // 403 (request from another site), 500, other codes and HTML error pages.
    showFormError(data.error ?? SERVER_ERROR);
  }

  if (status === "success") {
    // Officers go to /officer, everyone else to their dashboard.
    const next = roleHome[user?.role] ?? roleHome.member;
    return (
      <div className="mt-10 rounded-lg border border-line p-6">
        {/* tabIndex={-1} lets us move focus here without adding it to the Tab order. */}
        <h2
          ref={successRef}
          tabIndex={-1}
          className="text-xl font-semibold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          Welcome back{user?.name ? `, ${user.name}` : ""}!
        </h2>
        <p className="mt-2 text-muted">
          You&apos;re logged in as{" "}
          <span className="font-medium text-foreground">{user?.email ?? values.email}</span>.
        </p>
        <Button href={next.href} className="mt-6">
          {next.label}
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
        // "current-password" tells password managers to fill in the saved one.
        autoComplete="current-password"
        required
        value={values.password}
        onChange={update}
        error={errors.password}
        readOnly={sending}
      />

      <div className="flex flex-wrap items-center gap-4">
        {/* The label stays the same so a focused button isn't re-announced.
            aria-disabled only greys it out; sendingRef is what blocks a resend. */}
        <Button type="submit" aria-disabled={sending || undefined}>
          Log in
        </Button>
        {/* The one "loading" announcement: visible text in a status region,
            read politely without moving focus. */}
        <p role="status" className="text-sm text-muted">
          {sending ? "Logging you in…" : ""}
        </p>
      </div>

      <p className="text-sm text-muted">
        New here?{" "}
        <Link
          href="/register"
          className="font-medium text-foreground underline underline-offset-4 hover:text-accent"
        >
          Join the club
        </Link>
      </p>
    </form>
  );
}
