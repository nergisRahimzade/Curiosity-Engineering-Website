// W2D2-BE: Public registration creates a member account with a hashed password.
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { registerSchema } from "@/lib/validation";

export async function POST(request) {
  // Without a URL, the PostgreSQL driver can silently connect to localhost.
  // Keep this request-time check here so missing build-time secrets are allowed.
  if (!process.env.DATABASE_URL?.trim()) {
    console.error("POST /api/auth/register: DATABASE_URL is not set");
    return Response.json(
      { error: "Unable to create your account. Please try again later." },
      { status: 500 },
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Send a valid JSON body." }, { status: 400 });
  }

  const result = registerSchema.safeParse(body);
  if (!result.success) {
    return Response.json(
      { error: "Invalid registration details.", errors: result.error.issues },
      { status: 400 },
    );
  }

  const { name, email, password } = result.data;
  try {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      // Never accept a role or other database fields from the submitted body.
      data: { name, email, passwordHash, role: "member" },
      select: { id: true, name: true, email: true, role: true },
    });
    return Response.json({ user }, { status: 201 });
  } catch (error) {
    // The database unique key also catches two registrations arriving together.
    if (error?.code === "P2002") {
      return Response.json(
        { error: "An account with this email already exists." },
        { status: 409 },
      );
    }

    // Log only the code/name: full errors can contain queries and password hashes.
    console.error("POST /api/auth/register failed:", error?.code ?? error?.name);
    return Response.json(
      { error: "Unable to create your account. Please try again later." },
      { status: 500 },
    );
  }
}
