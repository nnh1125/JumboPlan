import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAuthId } from "@/lib/auth";

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
  return <div className="p-10">Dashboard</div>;
}