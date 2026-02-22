import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { CourseStatus } from "@prisma/client";
import { resolveCourseId } from "@/lib/prereqService";

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

  const resolvedId = (await resolveCourseId(courseId)) ?? courseId.replace(/\s/g, "");

  if (isNotStarted) {
    await prisma.userCourseStatus.deleteMany({
      where: { userId: user.id, courseId: resolvedId },
    });
    return NextResponse.json({ ok: true, deleted: true });
  }

  let courseRecord = await prisma.course.findUnique({
    where: { id: resolvedId },
    select: { id: true },
  });

  // Auto-create Course for degree-required courses not yet in DB (e.g. MATH 34 from degree.json)
  if (!courseRecord) {
    const match = resolvedId.match(/^([A-Za-z\/]+)(\d+)$/i);
    if (match) {
      const [, subject, number] = match;
      await prisma.course.upsert({
        where: { id: resolvedId },
        create: { id: resolvedId, subject, number },
        update: {},
      });
    } else {
      return NextResponse.json({ error: `Unknown courseId: ${courseId}` }, { status: 404 });
    }
  }

  const row = await prisma.userCourseStatus.upsert({
    where: {
      userId_courseId: { userId: user.id, courseId: resolvedId },
    },
    update: {
      status: status as CourseStatus,
      term: term ?? null,
      note: note ?? null,
    },
    create: {
      userId: user.id,
      courseId: resolvedId,
      status: status as CourseStatus,
      term: term ?? null,
      note: note ?? null,
    },
  });

  return NextResponse.json({ ok: true, row });
}