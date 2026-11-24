// Password hashing (bcrypt) and login tokens (JWTs signed with jose).
// Added in W2D1-BE. The register, login and logout routes (W2D2-BE, W2D3-BE)
// and the role helpers (W2D5-BE) build on these functions.
//
// Server code only: it reads JWT_SECRET, which must never reach the browser.
// Never import this file into a "use client" component.

import bcrypt from "bcrypt";
import { SignJWT, jwtVerify } from "jose";

// Same cost as prisma/seed.mjs, so every password is hashed the same way.
// Higher is slower to guess but also slower to log in; 10 is the usual default.
const BCRYPT_ROUNDS = 10;

// The architecture doc: tokens expire after 1 day. W2D3-BE: the session cookie
// uses the same number, so the browser drops the cookie when its token expires.
const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24;

// The only algorithm we sign with. verifyToken accepts nothing else, so a
// forged token can't claim a weaker algorithm to get past the check.
const ALGORITHM = "HS256";

// --- Session cookie (W2D3-BE) -------------------------------------------------

// The cookie that carries the login token. Login sets it, logout clears it,
// and /api/auth/me (W2D4-BE) reads it.
export const SESSION_COOKIE = "session";

// Login and logout must use the same settings: a browser only replaces a
// cookie when the name and path match.
export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true, // page JavaScript can't read the token
  secure: true, // HTTPS only (browsers treat http://localhost as secure too)
  sameSite: "lax", // not sent with cross-site form posts, which blocks most CSRF
  path: "/", // sent to every page and API route
  maxAge: TOKEN_LIFETIME_SECONDS,
};

// Login and logout change the cookie without needing one, so sameSite can't
// protect them: a form on another site could log a visitor into the attacker's
// account. Same rule Next.js uses for Server Actions: the Origin header must
// name this host. No Origin means no browser (browsers send it on every POST),
// e.g. curl, which can't act for a visitor anyway.
export function isSameOrigin(request) {
  const origin = request.headers.get("origin");
  if (origin === null) return true;
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  // "null" or a malformed Origin can't be parsed, so it fails the check.
  return URL.canParse(origin) && new URL(origin).host === host;
}

// --- Passwords ---------------------------------------------------------------

// Turns a password into a one-way hash. Save the hash, never the password.
export async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

// True if the typed password matches the saved hash, false otherwise.
export async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

// --- Tokens ------------------------------------------------------------------

// jose needs the secret as bytes. Stop with a clear message if it's missing or
// short, instead of signing tokens with a weak key that anyone could forge.
function getSecretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET is missing or shorter than 32 characters. Set it in .env (see .env.example).",
    );
  }
  return new TextEncoder().encode(secret);
}

// Makes the signed "ID card" for a logged-in user: who they are and their site
// role (member or officer). Project roles (lead/member of a project) are left
// out on purpose: they change often, so routes look them up in the database.
export async function signToken({ userId, role }) {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_LIFETIME_SECONDS}s`)
    .sign(getSecretKey());
}

// Checks that a token is real (our signature) and not expired.
// Returns { userId, role }, or null for a missing, fake, edited or expired
// token, so a route can simply answer 401 (not logged in).
export async function verifyToken(token) {
  if (!token) return null;

  // Outside the try on purpose: a missing JWT_SECRET is a setup mistake and
  // should fail loudly, not look like "not logged in".
  const key = getSecretKey();

  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: [ALGORITHM],
    });
    return { userId: payload.userId, role: payload.role };
  } catch {
    return null;
  }
}
