import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthId } from "@/lib/auth";
import YearGroup from "./yearGroup";
import Course from "@/types/Course";
import DashboardClient from "./DashBoardClient";

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

  const courses: Course[] = [
    {
      id: "CS11",
      subject: "CS",
      number: "11",
      title: "Intro to Computer Science",
      units: 5,
      started: true,
      eligible: true,
    },
    {
      id: "MATH22",
      subject: "MATH",
      number: "22",
      title: "Calculus I",
      units: 4,
      started: false,
      eligible: true,
    }
  ]; // TODO: load real courses for this user

  // load data + render dashboard
  return (
  <div className="flex flex-col p-10 gap-5">
    <h1>Dashboard</h1>
    <DashboardClient courses={courses} />
  </div>

  );
}