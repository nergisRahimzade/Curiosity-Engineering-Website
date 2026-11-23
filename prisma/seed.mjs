// W1D5-BE: seed script. Fills the database with the first officer account and,
// only when SEED_SAMPLE_DATA=true, some sample data so pages have something to show.
//
// Run it with:  npx prisma db seed
// (prisma.config.ts tells Prisma to run this file.)
//
// Needs Node 22.18+ from nodejs.org or nvm (not Ubuntu's apt package): it loads
// Prisma's generated client, which is TypeScript, and only official Node builds
// can run .ts files directly.
//
// Safe to run more than once: every step looks for an existing row first, so a
// second run doesn't create duplicates. If an officer already exists, it's
// reused, so later runs (for example, just to add sample data) don't need
// SEED_OFFICER_PASSWORD.

import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";

// Set in main() once the client has loaded.
let prisma;

// A setup problem the person can fix (wrong Node, missing .env value...).
// These print as one clear message instead of a stack trace.
class SetupError extends Error {}

// Load Prisma's generated client. If that fails, explain the two usual causes
// instead of showing a long stack trace.
async function loadPrismaClient() {
  try {
    const { PrismaClient } = await import("../src/generated/prisma/client.ts");
    // Same connection setup as src/lib/db.js. This script runs outside Next.js,
    // so it can't use the "@/lib/db" shortcut and makes its own client.
    return new PrismaClient({
      adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
    });
  } catch (error) {
    if (error.code === "ERR_UNKNOWN_FILE_EXTENSION") {
      throw new SetupError(
        `This Node (${process.version} at ${process.execPath}) can't run TypeScript files.\n` +
          "The seed needs Node 22.18+ from nodejs.org or nvm, not Ubuntu's apt package.\n" +
          'Check with: node -p "process.features.typescript"  (it should print "strip").',
      );
    }
    // Only when the generated client file itself is missing. A package missing
    // *inside* the client (say, after a partial `npm ci`) is a different problem,
    // so it falls through and keeps its full error.
    const clientFileMissing = /Cannot find module '[^']*generated[\\/]prisma[\\/]client\.ts'/.test(error.message);
    if (error.code === "ERR_MODULE_NOT_FOUND" && clientFileMissing) {
      throw new SetupError("Prisma's client hasn't been generated yet. Run `npx prisma generate`, then seed again.");
    }
    throw error;
  }
}

// bcrypt "cost": how much work each hash takes. 10 is the common default:
// fast enough for login, slow enough to make guessing passwords expensive.
const BCRYPT_ROUNDS = 10;

// ---------------------------------------------------------------------------
// 1. First officer (architecture, "Role rules": created once by a seed script)
// ---------------------------------------------------------------------------

async function seedFirstOfficer() {
  const name = process.env.SEED_OFFICER_NAME?.trim();
  // Lowercase so "Alex@School.edu" and "alex@school.edu" are the same account.
  const email = process.env.SEED_OFFICER_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_OFFICER_PASSWORD;

  // The seed only ever creates the *first* officer. If one exists, reuse it:
  // more officers are added by promoting members (officer members page, W5D4),
  // which re-checks permissions. So no password is needed on later runs.
  const existingOfficer = await prisma.user.findFirst({
    where: { role: "officer" },
    orderBy: { id: "asc" },
  });
  if (existingOfficer) {
    console.log(`An officer already exists: ${existingOfficer.email} (id ${existingOfficer.id}). Not creating another one.`);
    if (email && email !== existingOfficer.email) {
      console.log("SEED_OFFICER_EMAIL is ignored: promote members to officer from the officer members page instead.");
    }
    return existingOfficer;
  }

  // No officer yet, so we need their details. They live in .env, never in
  // this file, so no real person's email or password is committed to GitHub.
  if (!name || !email || !password) {
    throw new SetupError(
      "No officer exists yet. Set SEED_OFFICER_NAME, SEED_OFFICER_EMAIL and SEED_OFFICER_PASSWORD in .env first (see .env.example).",
    );
  }
  if (password.length < 12) {
    throw new SetupError("SEED_OFFICER_PASSWORD must be at least 12 characters.");
  }

  // Never turn an existing member into an officer here: that would skip the
  // role-change flow. Stop and let the person pick a different email.
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new SetupError(
      `${email} already belongs to a member account (id ${existingUser.id}). Use a different SEED_OFFICER_EMAIL for the first officer.`,
    );
  }

  const officer = await prisma.user.create({
    data: {
      name,
      email,
      // Store only the bcrypt hash, never the password itself.
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      role: "officer",
    },
  });

  console.log(`First officer created: ${officer.email} (id ${officer.id})`);
  return officer;
}

// ---------------------------------------------------------------------------
// 2. Sample data (opt-in with SEED_SAMPLE_DATA=true, so seeding the production
//    database in W6D3 creates only the first officer by default)
// ---------------------------------------------------------------------------

// Every sample title ends in "(sample)". That makes sample rows obvious on the
// pages, and it means findOrCreate below can never match (and attach sample
// data to) a real project or event that happens to have the same name.
const sample = (text) => `${text} (sample)`;

// For tables without a unique column (projects, events...), find a row by a
// field like its title, and create it only if it's missing.
async function findOrCreate(model, where, data) {
  const existing = await model.findFirst({ where });
  return existing ?? model.create({ data });
}

async function seedSampleData(officer) {
  // Projects. Status is free text until the team agrees on values (W1D3 handoff).
  const robot = await findOrCreate(
    prisma.project,
    { title: sample("Line-Following Robot") },
    {
      title: sample("Line-Following Robot"),
      summary: "A small robot that follows a black line using infrared sensors.",
      status: "completed",
      startDate: new Date("2026-09-08"),
      endDate: new Date("2026-11-14"),
      isPublic: true,
    },
  );

  const weather = await findOrCreate(
    prisma.project,
    { title: sample("Campus Weather Station") },
    {
      title: sample("Campus Weather Station"),
      summary: "Sensors on the engineering building roof that log temperature and wind.",
      status: "active",
      startDate: new Date("2026-10-01"),
      isPublic: true,
    },
  );

  const website = await findOrCreate(
    prisma.project,
    { title: sample("Club Website") },
    {
      title: sample("Club Website"),
      summary: "This website: projects, calendar and officer tools.",
      status: "active",
      startDate: new Date("2026-11-16"),
      // Left private to show that new projects start hidden.
      isPublic: false,
    },
  );

  // The officer leads the robot project, so lead-only pages have data to test with.
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: robot.id, userId: officer.id } },
    update: {},
    create: { projectId: robot.id, userId: officer.id, projectRole: "lead" },
  });

  await prisma.projectOverview.upsert({
    where: { projectId: robot.id },
    update: {},
    create: {
      projectId: robot.id,
      goals: "Finish a lap of the test track in under 30 seconds.",
      plan: "Build the chassis, tune the sensors, then tune the steering.",
      budgetNotes: "Sensors and motors came from the fall budget.",
      risks: "Sensors are sensitive to room lighting.",
    },
  });

  // The officer is also a regular member of the website project, so the task
  // below is assigned to someone on that project (tasks are for project members,
  // and show on /projects/[id]/tasks for "a project I'm on").
  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId: website.id, userId: officer.id } },
    update: {},
    create: { projectId: website.id, userId: officer.id, projectRole: "member" },
  });

  await findOrCreate(
    prisma.task,
    { title: sample("Write the setup guide"), projectId: website.id },
    {
      projectId: website.id,
      title: sample("Write the setup guide"),
      description: "Steps for a new teammate to run the site locally.",
      status: "todo",
      dueDate: new Date("2026-12-11"),
      assigneeId: officer.id,
      createdById: officer.id,
    },
  );

  // Events: one of each of the plan's four types. Times are written in Pacific
  // time (-08:00); Postgres stores them in UTC, as the data rules require.
  const generalMeeting = await findOrCreate(
    prisma.event,
    { title: sample("Winter General Meeting") },
    {
      title: sample("Winter General Meeting"),
      type: "general_meeting",
      startsAt: new Date("2026-12-02T18:00:00-08:00"),
      endsAt: new Date("2026-12-02T19:00:00-08:00"),
      location: "Engineering Building, Room 101",
    },
  );

  await findOrCreate(
    prisma.event,
    { title: sample("Weather Station Check-in") },
    {
      title: sample("Weather Station Check-in"),
      type: "project_meeting",
      startsAt: new Date("2026-12-04T16:00:00-08:00"),
      endsAt: new Date("2026-12-04T17:00:00-08:00"),
      location: "Makerspace",
      projectId: weather.id,
    },
  );

  await findOrCreate(
    prisma.event,
    { title: sample("Regional Robotics Challenge") },
    {
      title: sample("Regional Robotics Challenge"),
      type: "competition",
      startsAt: new Date("2027-01-23T09:00:00-08:00"),
      endsAt: new Date("2027-01-23T17:00:00-08:00"),
      location: "Convention Center",
    },
  );

  await findOrCreate(
    prisma.event,
    { title: sample("Student Engineering Conference") },
    {
      title: sample("Student Engineering Conference"),
      type: "conference",
      startsAt: new Date("2027-02-12T09:00:00-08:00"),
      endsAt: new Date("2027-02-13T16:00:00-08:00"),
      // No location yet: location is optional.
    },
  );

  // An RSVP form for the general meeting. eventId is unique, so upsert by it.
  await prisma.rsvpForm.upsert({
    where: { eventId: generalMeeting.id },
    update: {},
    create: {
      eventId: generalMeeting.id,
      title: sample("Winter General Meeting RSVP"),
      questions: [
        { label: "Will you attend?", type: "choice", options: ["Going", "Not going"] },
        { label: "Dietary needs?", type: "text" },
      ],
      closesAt: new Date("2026-12-01T23:59:00-08:00"),
    },
  });

  // Past activities.
  await findOrCreate(
    prisma.activity,
    { title: sample("Soldering Workshop") },
    {
      title: sample("Soldering Workshop"),
      description: "Members learned to solder by building a small LED badge.",
      date: new Date("2026-10-15"),
    },
  );

  await findOrCreate(
    prisma.activity,
    { title: sample("Robot Demo Day") },
    {
      title: sample("Robot Demo Day"),
      description: "The line-following robot ran laps for visitors at the campus fair.",
      date: new Date("2026-11-14"),
    },
  );

  // Budget for the term, and one expense against it. Money is in whole cents.
  // The term label stays "2026-fall" (no suffix) because it names a real term;
  // update is empty, so a real budget for that term is never changed.
  await prisma.budget.upsert({
    where: { term: "2026-fall" },
    update: {},
    create: { term: "2026-fall", totalCents: 50000 }, // $500.00
  });

  await findOrCreate(
    prisma.expense,
    { description: sample("Infrared sensors for the line-following robot") },
    {
      date: new Date("2026-09-20"),
      amountCents: 4599, // $45.99
      category: "parts",
      description: sample("Infrared sensors for the line-following robot"),
      projectId: robot.id,
      recordedById: officer.id,
    },
  );

  console.log("Sample data ready: 3 projects, 4 events, 1 RSVP form, 2 activities, 1 task, budget + 1 expense.");
}

// ---------------------------------------------------------------------------

async function main() {
  // Without DATABASE_URL the pg driver silently falls back to a local Postgres
  // (localhost:5432) and would seed *that* while reporting success. Stop first.
  if (!process.env.DATABASE_URL?.trim()) {
    throw new SetupError("Set DATABASE_URL in .env first (see .env.example).");
  }

  prisma = await loadPrismaClient();
  const officer = await seedFirstOfficer();

  // Sample data is opt-in: forgetting the setting is then the safe mistake.
  // Production never gets sample data, even if the setting is left on.
  if (process.env.NODE_ENV === "production") {
    console.log("NODE_ENV is production: sample data is never added here.");
    return;
  }
  if (process.env.SEED_SAMPLE_DATA !== "true") {
    console.log("Skipping sample data (set SEED_SAMPLE_DATA=true in .env to add it).");
    return;
  }
  await seedSampleData(officer);
}

main()
  .catch((error) => {
    // Setup problems print just the message; anything unexpected keeps its full details.
    console.error(error instanceof SetupError ? error.message : error);
    process.exitCode = 1;
  })
  .finally(() => prisma?.$disconnect());
