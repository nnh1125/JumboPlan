import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-20">
      <div className="rounded-3xl bg-sky-100/80 px-8 py-16 text-center backdrop-blur">
        <h2 className="Jersey25 text-4xl font-bold text-slate-900 sm:text-3xl">
          Ready to plan your journey?
        </h2>
        <p className="WorkSans mx-auto mt-4 max-w-xl text-slate-600">
          Create your account and start building your Tufts degree plan today.
        </p>
        <Link
          href="/sign-up"
          className="mt-8 WorkSans inline-block rounded-full bg-[#5E94CE] px-8 py-3 text-base font-medium text-white hover:bg-sky-700 transition-colors"
        >
          Create Free Account
        </Link>
      </div>
    </section>
  );
}
