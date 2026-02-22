import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { CourseStatus } from "@prisma/client";

type PutBody = {
  courseId: string;               // "CS40"
  status: CourseStatus | "NOT_STARTED"; // allow NOT_STARTED from UI even though DB doesn't store it
  term?: string;
  note?: string;
};

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.upsert({
    where: { authId: userId },
    update: {},
    create: { authId: userId },
  });

  const rows = await prisma.userCourseStatus.findMany({
    where: { userId: user.id },
    select: { courseId: true, status: true, term: true, note: true },
  });

  const progress: Record<string, { status: CourseStatus; term?: string; note?: string }> = {};
  for (const r of rows) {
    progress[r.courseId] = {
      status: r.status,
      term: r.term ?? undefined,
      note: r.note ?? undefined,
    };
  }

  return NextResponse.json({ ok: true, progress });
}

export async function PUT(req: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: PutBody;
  try {
    body = (await req.json()) as PutBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { courseId, status, term, note } = body;

  if (!courseId || typeof courseId !== "string") {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 });
  }

  // status can be "NOT_STARTED" (client convenience) or a real Prisma enum value
  const isDbStatus = Object.values(CourseStatus).includes(status as CourseStatus);
  const isNotStarted = status === "NOT_STARTED";
  if (!isDbStatus && !isNotStarted) {
    return NextResponse.json(
      { error: `status must be one of: NOT_STARTED, ${Object.values(CourseStatus).join(", ")}` },
      { status: 400 }
    );
  }

  // Ensure User exists
  const user = await prisma.user.upsert({
    where: { authId: userId },
    update: {},
    create: { authId: userId },
  });

  // If NOT_STARTED => delete row (since your enum doesn't store it)
  if (isNotStarted) {
    await prisma.userCourseStatus.deleteMany({
      where: { userId: user.id, courseId },
    });
    return NextResponse.json({ ok: true, deleted: true });
  }

  // Optional: validate course exists in DB (recommended if you're storing courses there)
  const courseExists = await prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true },
  });
  if (!courseExists) {
    return NextResponse.json({ error: `Unknown courseId: ${courseId}` }, { status: 404 });
  }

  // Upsert progress row
  const row = await prisma.userCourseStatus.upsert({
    where: {
      // because @@unique([userId, courseId]) => Prisma generates this compound unique input
      userId_courseId: { userId: user.id, courseId },
    },
    update: {
      status: status as CourseStatus,
      term: term ?? null,
      note: note ?? null,
    },
    create: {
      userId: user.id,
      courseId,
      status: status as CourseStatus,
      term: term ?? null,
      note: note ?? null,
    },
  });

  return NextResponse.json({ ok: true, row });
}