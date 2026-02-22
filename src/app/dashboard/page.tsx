import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthId } from "@/lib/auth";
import DashboardClient from "./DashBoardClient";
import { parseDegreeToCourses, getDegreeCourseIds, type DegreeData, type PrereqMapSerialized } from "@/lib/degreeParser";
import { getPrereqMapForCourses } from "@/lib/prereqService";
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

  const statusRows = await prisma.userCourseStatus.findMany({
    where: { userId: user.id, status: "COMPLETED" },
    select: { courseId: true },
  });
  const completedIds = new Set<string>();
  for (const r of statusRows) {
    completedIds.add(r.courseId);
    const m = r.courseId.match(/^([A-Za-z\/]+)(\d+)$/i);
    if (m) {
      const [, subj, num] = m;
      completedIds.add(`${subj}${parseInt(num, 10)}`);
      completedIds.add(`${subj}${num.padStart(4, "0")}`);
    }
  }

  const degreeCourseIds = getDegreeCourseIds(degreeData as DegreeData);
  const prereqMap = await getPrereqMapForCourses(degreeCourseIds);
  const prereqMapSerialized: PrereqMapSerialized = Object.fromEntries(prereqMap);

  const courses = parseDegreeToCourses(degreeData as DegreeData, completedIds, prereqMap);

  const minTotalSHU = (degreeData as { minTotalSHU?: number }).minTotalSHU ?? 120;

  return (
    <div className="flex flex-col p-10 gap-5">
      <h1>Dashboard</h1>
      <DashboardClient courses={courses} prereqMap={prereqMapSerialized} minTotalSHU={minTotalSHU} />
    </div>
  );
}