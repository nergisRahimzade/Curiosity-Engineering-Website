// Shared Prisma client: the one object server code uses to talk to the
// Azure PostgreSQL database. Added in W1D2-BE.
//
// Use it only in server code (route handlers, server components, scripts).
// Never import it into a "use client" component: it needs DATABASE_URL,
// which must never reach the browser.
//
//   import { prisma } from "@/lib/db";
//   const projects = await prisma.project.findMany();

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 connects through a "driver adapter". PrismaPg uses the `pg`
// package and the DATABASE_URL from .env (Azure needs ?sslmode=require).
function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

// In development, Next.js reloads files on every save. Without this check,
// each reload would create a new client with its own database connections,
// and Azure would soon refuse new ones. globalThis survives reloads, so we
// keep one client there and reuse it.
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// W2D5-BE: the one copy of the "is DATABASE_URL set?" check. Without a URL,
// the PostgreSQL driver silently connects to localhost instead. Call it inside
// a request, never at import, so `next build` works without secrets.
// Logs once and returns true when it's missing; the caller answers with a 500.
export function databaseUrlMissing(where) {
  if (process.env.DATABASE_URL?.trim()) return false;
  console.error(`${where}: DATABASE_URL is not set`);
  return true;
}
