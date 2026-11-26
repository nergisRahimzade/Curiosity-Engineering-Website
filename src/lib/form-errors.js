// W2D3-FE: Shared helpers for showing Zod errors on form fields. Moved out of
// the register form (W2D2-FE) once the login form needed the same thing.
// Safe in the browser: no secrets, no server-only imports.

// Turn Zod issues ([{ path: ["email"], message }]) into { email: "message" }.
// The browser check and the API's 400 reply both use this shape, so one
// helper reads both. Only the first message per field is kept (one clear
// problem at a time), and issues for fields the form doesn't show are ignored.
export function issuesToErrors(issues = [], fields) {
  const errors = {};
  for (const issue of issues) {
    const field = issue?.path?.[0];
    if (fields.includes(field) && !errors[field]) errors[field] = issue.message;
  }
  return errors;
}

// The first field (in page order) that has an error, so focus goes there.
export function firstInvalidField(errors, fields) {
  return fields.find((field) => errors[field]);
}
