// W2D2-BE: Validate registration details before hashing or writing to the database.
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
  // Match the seed's lowercase emails so the unique key catches duplicates.
  email: z.string().trim().toLowerCase().max(254).email("Enter a valid email address."),
  // Keep spaces intact. bcrypt ignores bytes after 72, so reject longer passwords.
  password: z.string().min(12, "Use at least 12 characters.").refine(
    (password) => new TextEncoder().encode(password).length <= 72,
    "Password must be at most 72 bytes (some characters use more than one byte).",
  ),
});
