import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const { userId } = await auth();

  // Not signed in -> show marketing landing (or redirect to sign-in)
  if (!userId) {
    return (
      <main className="min-h-screen bg-white text-slate-900">
      {/* Soft background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-sky-200/50 blur-3xl" />
        <div className="absolute top-28 -left-24 h-[420px] w-[420px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[520px] w-[520px] rounded-full bg-cyan-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-6xl px-6">
        <Nav />

        <Hero />

        <Features />

        <CTA />

        <Footer />
      </div>
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