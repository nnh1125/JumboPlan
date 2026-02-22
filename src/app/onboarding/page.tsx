"use client";
import { useRouter } from "next/dist/client/components/navigation";
import { useState } from "react";

function toProgramId(year: string, major: string) {
  if (year === "2027" && major === "BSCS") return "BSCS";
  return `${year}-${major}`.toUpperCase();
}

type ProgramOption = {
  label: string;
  programId: string;
};

export default function OnboardingPage() {
  const router = useRouter();

  const [year, setYear] = useState("2027");
  const [major, setMajor] = useState("BSCS");
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
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(180deg, #E3F1F9 0%, #BAE3FA 100%)" }}
    >
      <style>{`
        @keyframes jp-spin { to { transform: rotate(360deg); } }
        .jp-ring { animation: jp-spin 18s linear infinite; transform-origin: 100.5px 98.75px; }
        .jp-input::placeholder { color: #8AACBB; }
        .jp-input:focus { border-color: #5B9DB8 !important; box-shadow: 0 0 0 3px rgba(91,157,184,0.18) !important; outline: none; }
        .jp-btn:hover { transform: translateY(-1px); }
        .jp-btn:active { transform: translateY(0); }
      `}</style>

      <div className="flex flex-col items-center w-full max-w-[393px] px-6">

        {/* Logo */}
        <div className="relative flex items-center justify-center mb-[30px]"
          style={{ width: 201, height: 197.5 }}>

          {/* Orbit ring */}
          <svg className="jp-ring absolute top-0 left-0" style={{ width: 201, height: 197.5 }} viewBox="0 0 212 208" fill="none">
            <path d="M82.356 202.483C72.5669 200.253 63.1641 196.579 54.456 191.582M127.356 5.00098C149.723 10.1093 169.693 22.66 183.996 40.5983C198.299 58.5366 206.088 80.7996 206.088 103.742C206.088 126.685 198.299 148.948 183.996 166.886C169.693 184.824 149.723 197.375 127.356 202.483M21.3697 161.038C15.2395 152.119 10.5791 142.274 7.56598 131.878M5.00098 86.8672C6.80098 76.1797 10.266 66.0547 15.126 56.7735L17.0272 53.3422M47.5597 20.256C58.092 13.0209 69.8985 7.84475 82.356 5.00098" stroke="#B7D3E3" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          {/* Elephant */}
          <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" width={110} height={110} viewBox="0 0 120 120" fill="none">
            <path d="M40 120H70V90H80V120H110V50H100V110H90V80H60V110H50V80H40V120ZM10 110H30V90H20V100H10V110ZM0 100H10V40H0V100ZM20 80H40V70H20V80ZM20 60H30V50H20V60ZM10 40H20V30H10V40ZM30 40H40V20H20V30H30V40ZM40 60H60V50H50V40H40V60ZM70 30H60V50H100V40H70V30ZM70 30H80V10H40V20H70V30Z" fill="#5C4C4C"/>
          </svg>

          {/* Yellow block (left) */}
          <svg className="absolute" style={{ top: "50%", left: 17.5, transform: "translateY(calc(-50% + 10px))" }} width={24} height={24} viewBox="0 0 24 24" fill="none">
            <path d="M9 9H15V15H9V9ZM15 9H21V15H15V9ZM3 9H9V15H3V9ZM9 15H15V21H9V15ZM9 3H15V9H9V3Z" fill="#EEBE4F"/>
            <path d="M9 9H15M9 9V15M9 9H3V15H9M9 9V3H15V9M15 9V15M15 9H21V15H15M15 15H9M15 15V21H9V15" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          {/* Green block (upper right) */}
          <svg className="absolute" style={{ top: 34, left: 124.5 }} width={24} height={24} viewBox="0 0 30 30" fill="none">
            <path d="M26.25 11.25L26.25 18.75L18.75 18.75L18.75 11.25L26.25 11.25Z" fill="#D7F1C5" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M26.25 18.75L26.25 26.25L18.75 26.25L18.75 18.75L26.25 18.75Z" fill="#D7F1C5" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M26.25 3.75L26.25 11.25L18.75 11.25L18.75 3.75L26.25 3.75Z" fill="#D7F1C5" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.75 3.75L18.75 11.25L11.25 11.25L11.25 3.75L18.75 3.75Z" fill="#D7F1C5" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.25 3.75L11.25 11.25L3.75 11.25L3.75 3.75L11.25 3.75Z" fill="#D7F1C5" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

          {/* Blue block (below elephant) */}
          <svg className="absolute" style={{ top: 158, left: "calc(50% + 12px)", transform: "translateX(-50%)" }} width={24} height={24} viewBox="0 0 24 24" fill="none">
            <path d="M3 15H9V21H3V15ZM15 3H21V9H15V3ZM15 9H21V15H15V9ZM9 9H15V15H9V9ZM3 9H9V15H3V9Z" fill="#82CDEA"/>
            <path d="M3 15H9M3 15V21H9V15M3 15V9H9M9 15H15M9 15V9M21 9V3H15V9M21 9H15M21 9V15H15M15 9V15M15 9H9" stroke="#5C4C4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>

        </div>

        {/* Title */}
        <h1 className="mb-[30px] leading-none" style={{ fontSize: 60, fontWeight: 400, fontFamily: "'Jersey 25', sans-serif", color: "#5C4C4C" }}>
          JumboPlan
        </h1>

        {/* Form */}
        <div className="w-full flex flex-col gap-[14px]">
          {/* Year dropdown */}
          <select
            className="jp-input w-full h-[61px] px-[26px] rounded-[14px] text-[15px] backdrop-blur-md transition-all appearance-none"
            defaultValue=""
            style={{
              border: "1.5px solid rgba(255,255,255,0.9)",
              background: "rgba(255,255,255,0.65)",
              color: "#2C3E50",
            }}
          >
            <option value="" disabled>
              Select your year
            </option>
            {Array.from({ length: 7 }, (_, i) => 2025 + i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          {/* Major dropdown */}
          <select
            className="jp-input w-full h-[61px] px-[26px] rounded-[14px] text-[15px] backdrop-blur-md transition-all appearance-none"
            defaultValue=""
            style={{
              border: "1.5px solid rgba(255,255,255,0.9)",
              background: "rgba(255,255,255,0.65)",
              color: "#2C3E50",
            }}
          >
            <option value="" disabled>
              Select your major
            </option>
            <option value="cs">Computer Science</option>
          </select>

          <button
            onClick={onContinue}
            disabled={loading}
            className="jp-btn w-full h-[61px] mt-1 rounded-[14px] text-white text-[15px] font-semibold cursor-pointer transition-all"
            style={{
              background: "linear-gradient(135deg, #5B9DB8 0%, #7AAABB 100%)",
              boxShadow: "0 4px 14px rgba(91,157,184,0.4)",
              border: "none",
            }}
          >
            {loading ? "Loading..." : "Continue"}
          </button>
          <p className="text-xs text-gray-500">
            Selected programId: <span className="font-mono">{toProgramId(year, major)}</span>
          </p>
        </div>

      </div>
    </div>
  );
}