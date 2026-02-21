import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const { userId } = await auth();

  // Not signed in -> show marketing landing (or redirect to sign-in)
  if (!userId) {
    return (
      <main className="p-10">
        <h1 className="text-2xl font-bold">JumboPlan</h1>
        <p className="mt-2 text-gray-600">Visualize your degree progress.</p>
      </main>
    );
  }

  // Ensure user exists in DB
  const user = await prisma.user.upsert({
    where: { authId: userId },
    update: {},
    create: { authId: userId },
  });

  // Check onboarding status
  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.id },
  });

  if (!profile) redirect("/onboarding");
  redirect("/dashboard");
}