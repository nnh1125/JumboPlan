"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type ProgramOption = {
  label: string;
  programId: string;
};

const YEARS = ["2027"]; // add more later
const MAJORS = ["BSCS"]; // add more later

// Map (year, major) -> programId you store in DB
function toProgramId(year: string, major: string) {
  if (year === "2027" && major === "BSCS") return "BSCS";
  return `${year}-${major}`.toUpperCase();
}

export default function OnboardingPage() {
  const router = useRouter();

  const [year, setYear] = useState(YEARS[0]);
  const [major, setMajor] = useState(MAJORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onContinue() {
    setLoading(true);
    setError(null);

    const programId = toProgramId(year, major);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }),
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || "Failed to save profile");
      }

      router.push("/dashboard");
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-2xl font-bold">Set up your plan</h1>
      <p className="mt-2 text-gray-600">Choose your catalog year and major.</p>

      <div className="mt-8 max-w-md space-y-5">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Catalog year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Major</label>
          <select
            value={major}
            onChange={(e) => setMajor(e.target.value)}
            className="w-full rounded-lg border px-3 py-2"
          >
            {MAJORS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          onClick={onContinue}
          disabled={loading}
          className="w-full rounded-lg bg-black px-4 py-2 text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Continue"}
        </button>

        <p className="text-xs text-gray-500">
          Selected programId: <span className="font-mono">{toProgramId(year, major)}</span>
        </p>
      </div>
    </main>
  );
}