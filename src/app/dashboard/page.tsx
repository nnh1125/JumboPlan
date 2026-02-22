import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthId } from "@/lib/auth";
import Course from "@/types/Course";
import DashboardClient from "./DashBoardClient";
import { parseDegreeToCourses, type DegreeData } from "@/lib/degreeParser";
import degreeData from "@/data/degree.json";

export default async function DashboardPage() {
  const authId = await getAuthId();

  const user = await prisma.user.upsert({
    where: { authId },
    update: {},
    create: { authId },
  });

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) {
    redirect("/onboarding");
  }

  // Demo: completed course IDs to match design (TODO: load from user progress/DB)
  const completedIds = new Set([
    "MATH32",
    "EN1",
    "ENG1",
    "ENG3",
    "CS11",
    "MATH34",
    "MATH42",
    "CS15",
    "CS/MATH61",
    "EM52",
    "MATH70",
  ]);

  // Parse degree.json into courses with user progress and eligibility
  const courses = parseDegreeToCourses(degreeData as DegreeData, completedIds);

  const minTotalSHU = (degreeData as { minTotalSHU?: number }).minTotalSHU ?? 120;

  return (
    <div className="flex flex-col p-10 gap-5">
      <h1>Dashboard</h1>
      <DashboardClient courses={courses} minTotalSHU={minTotalSHU} />
    </div>
  );
}