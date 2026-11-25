// W2D2-BE: Validate registration details before hashing or writing to the database.
// W2D3-BE: Validate login details, using the same email and password-length rules.
import { z } from "zod";

// Match the seed's lowercase emails so the unique key catches duplicates and
// login finds the account however the email was typed.
const email = z.string().trim().toLowerCase().max(254).email("Enter a valid email address.");

// bcrypt ignores bytes after 72, so reject longer passwords. Login needs this too:
// otherwise it would accept the real password plus any extra characters.
const fitsBcrypt = [
  (password) => new TextEncoder().encode(password).length <= 72,
  "Password must be at most 72 bytes (some characters use more than one byte).",
];

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  email,
  // Keep spaces intact (no trim).
  password: z.string().min(12, "Use at least 12 characters.").refine(...fitsBcrypt),
});

export const loginSchema = z.object({
  email,
  // Exactly as typed (no trim): it must match what was hashed at registration.
  password: z.string().min(1, "Enter your password.").refine(...fitsBcrypt),
});
