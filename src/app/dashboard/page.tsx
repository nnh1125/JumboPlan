import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthId } from "@/lib/auth";
import YearGroup from "./yearGroup";

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

  // load data + render dashboard
  return (
  <div className="flex flex-col p-10 gap-5">
    <h1>Dashboard</h1>
    <YearGroup
      yearNumber={1}
      courses={[]}
      totalSlots={8}
      onCourseClick={(course) => console.log("Clicked course", course)}
      onCourseChange={(course) => console.log("Changed course", course)}
    />
    <YearGroup
      yearNumber={2}
      courses={[]}
      totalSlots={8}
      onCourseClick={(course) => console.log("Clicked course", course)}
      onCourseChange={(course) => console.log("Changed course", course)}
    />
  </div>

  );
}