import Link from "next/link";

export default function Nav() {
  return (
    <nav className="flex items-center justify-between py-6">
      <Link href="/" className="text-xl font-semibold text-slate-900">
        JumboPlan
      </Link>
      <div className="flex items-center gap-4">
        <Link
          href="/sign-in"
          className="text-slate-600 hover:text-slate-900 font-medium"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700 transition-colors"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
