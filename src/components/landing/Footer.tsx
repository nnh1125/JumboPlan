import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 py-12">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} JumboPlan</p>
        <div className="flex gap-6">
          <Link href="/sign-in" className="text-sm text-slate-500 hover:text-slate-700">
            Sign In
          </Link>
          <Link href="/sign-up" className="text-sm text-slate-500 hover:text-slate-700">
            Sign Up
          </Link>
        </div>
      </div>
    </footer>
  );
}
