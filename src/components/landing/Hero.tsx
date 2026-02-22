import Link from "next/link";

export default function Hero() {
  return (
    <section className="py-20 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl">
        Plan your Tufts degree
      </h1>
      <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
        Track your progress, visualize your path, and stay on top of your CS
        requirements with JumboPlan.
      </p>
      <div className="mt-10 flex justify-center gap-4">
        <Link
          href="/sign-up"
          className="rounded-full bg-sky-600 px-6 py-3 text-base font-medium text-white hover:bg-sky-700 transition-colors"
        >
          Get Started
        </Link>
        <Link
          href="/sign-in"
          className="rounded-full border border-slate-300 px-6 py-3 text-base font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Sign In
        </Link>
      </div>
    </section>
  );
}
