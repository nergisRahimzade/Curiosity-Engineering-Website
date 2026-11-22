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
// second run doesn't create duplicates.

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
    if (error.code === "ERR_MODULE_NOT_FOUND") {
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

  // The officer's details live in .env, never in this file, so no real
  // person's email or password is committed to GitHub.
  if (!name || !email || !password) {
    throw new SetupError(
      "Set SEED_OFFICER_NAME, SEED_OFFICER_EMAIL and SEED_OFFICER_PASSWORD in .env first (see .env.example).",
    );
  }
  if (password.length < 12) {
    throw new SetupError("SEED_OFFICER_PASSWORD must be at least 12 characters.");
  }

  // upsert = "update if it exists, otherwise create". update is empty on
  // purpose: re-running the seed never overwrites an existing account.
  const officer = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      name,
      email,
      // Store only the bcrypt hash, never the password itself.
      passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS),
      role: "officer",
    },
  });

  console.log(`First officer ready: ${officer.email} (id ${officer.id})`);
  return officer;
}

// ---------------------------------------------------------------------------
// 2. Sample data (opt-in with SEED_SAMPLE_DATA=true, so seeding the production
//    database in W6D3 creates only the first officer by default)
// ---------------------------------------------------------------------------

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
    { title: "Line-Following Robot" },
    {
      title: "Line-Following Robot",
      summary: "A small robot that follows a black line using infrared sensors.",
      status: "completed",
      startDate: new Date("2026-09-08"),
      endDate: new Date("2026-11-14"),
      isPublic: true,
    },
  );

  const weather = await findOrCreate(
    prisma.project,
    { title: "Campus Weather Station" },
    {
      title: "Campus Weather Station",
      summary: "Sensors on the engineering building roof that log temperature and wind.",
      status: "active",
      startDate: new Date("2026-10-01"),
      isPublic: true,
    },
  );

  const website = await findOrCreate(
    prisma.project,
    { title: "Club Website" },
    {
      title: "Club Website",
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

  await findOrCreate(
    prisma.task,
    { title: "Write the setup guide", projectId: website.id },
    {
      projectId: website.id,
      title: "Write the setup guide",
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
    { title: "Winter General Meeting" },
    {
      title: "Winter General Meeting",
      type: "general_meeting",
      startsAt: new Date("2026-12-02T18:00:00-08:00"),
      endsAt: new Date("2026-12-02T19:00:00-08:00"),
      location: "Engineering Building, Room 101",
    },
  );

  await findOrCreate(
    prisma.event,
    { title: "Weather Station Check-in" },
    {
      title: "Weather Station Check-in",
      type: "project_meeting",
      startsAt: new Date("2026-12-04T16:00:00-08:00"),
      endsAt: new Date("2026-12-04T17:00:00-08:00"),
      location: "Makerspace",
      projectId: weather.id,
    },
  );

  await findOrCreate(
    prisma.event,
    { title: "Regional Robotics Challenge" },
    {
      title: "Regional Robotics Challenge",
      type: "competition",
      startsAt: new Date("2027-01-23T09:00:00-08:00"),
      endsAt: new Date("2027-01-23T17:00:00-08:00"),
      location: "Convention Center",
    },
  );

  await findOrCreate(
    prisma.event,
    { title: "Student Engineering Conference" },
    {
      title: "Student Engineering Conference",
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
      title: "Winter General Meeting RSVP",
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
    { title: "Soldering Workshop" },
    {
      title: "Soldering Workshop",
      description: "Members learned to solder by building a small LED badge.",
      date: new Date("2026-10-15"),
    },
  );

  await findOrCreate(
    prisma.activity,
    { title: "Robot Demo Day" },
    {
      title: "Robot Demo Day",
      description: "The line-following robot ran laps for visitors at the campus fair.",
      date: new Date("2026-11-14"),
    },
  );

  // Budget for the term, and one expense against it. Money is in whole cents.
  await prisma.budget.upsert({
    where: { term: "2026-fall" },
    update: {},
    create: { term: "2026-fall", totalCents: 50000 }, // $500.00
  });

  await findOrCreate(
    prisma.expense,
    { description: "Infrared sensors for the line-following robot" },
    {
      date: new Date("2026-09-20"),
      amountCents: 4599, // $45.99
      category: "parts",
      description: "Infrared sensors for the line-following robot",
      projectId: robot.id,
      recordedById: officer.id,
    },
  );

  console.log("Sample data ready: 3 projects, 4 events, 1 RSVP form, 2 activities, 1 task, budget + 1 expense.");
}

// ---------------------------------------------------------------------------

async function main() {
  prisma = await loadPrismaClient();
  const officer = await seedFirstOfficer();

  // Sample data is opt-in: forgetting the setting is then the safe mistake.
  // Production never gets sample data, even if the setting is left on.
  const wantsSampleData = process.env.SEED_SAMPLE_DATA === "true";
  if (!wantsSampleData || process.env.NODE_ENV === "production") {
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
