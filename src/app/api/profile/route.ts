import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthId } from "@/lib/auth";

export async function POST(req: Request) {
  const authId = await getAuthId();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { programId } = body as { programId?: string };
  if (!programId || typeof programId !== "string") {
    return NextResponse.json({ error: "programId is required" }, { status: 400 });
  }

  // Ensure user exists
  const user = await prisma.user.upsert({
    where: { authId: authId },
    update: {},
    create: { authId: authId },
  });

//   Optional: validate program exists (recommended)
  const program = await prisma.program.findUnique({
    where: { id: programId },
  });
  if (!program) {
    return NextResponse.json({ error: "Program not found" }, { status: 404 });
  }

  // Upsert profile (one per user)
  const profile = await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: { programId: programId },
    create: { userId: user.id, programId: programId },
    include: { program: true },
  });

  return NextResponse.json({ ok: true, profile });
}