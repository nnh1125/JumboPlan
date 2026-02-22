"use client";

import { useState } from "react";

export default function HumanitiesElectivePage() {
  const [classTaken, setClassTaken] = useState("");
  const [completed, setCompleted] = useState(false);
  const [shu, setShu] = useState(0);

  const handleDone = () => {
    if (classTaken.trim() === "") return;
    setCompleted(true);
    setShu(3);
  };

  return (
    <div className="min-h-screen bg-white p-8" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Jersey+25&display=swap');
        .jersey { font-family: 'Jersey 25', sans-serif; font-weight: 400; }
      `}</style>

      {/* Back arrow */}
      <button className="mb-6 text-gray-500 hover:text-gray-800 transition-colors">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Title */}
      <h1 className="jersey mb-3" style={{ color: "#5C4C4C", fontSize: 60, lineHeight: 1 }}>Humanities Elective</h1>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["Spring / Fall", "3 SHU", "Letter Grade", "NO Double Counting"].map((tag) => (
          <span key={tag} className="px-3 py-1 rounded-full text-sm border border-gray-300 text-gray-600">
            {tag}
          </span>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-3 gap-6">

        {/* Left column */}
        <div className="col-span-2 flex flex-col gap-6">

          {/* NOT Eligible card */}
          <div className="rounded-2xl border border-gray-200 p-6" style={{ width: 847, height: 170 }}>
            <h2 className="jersey" style={{ color: "#5C4C4C", fontSize: 30 }}>NOT Eligible</h2>
          </div>

          {/* Eligible card */}
          <div className="rounded-2xl border border-gray-200 p-6" style={{ width: 847, height: 170 }}>
            <h2 className="jersey mb-3" style={{ color: "#5C4C4C", fontSize: 30 }}>Eligible</h2>
            <p className="text-gray-600" style={{ fontSize: 20 }}>Any course having attribute SOE-HASS-Humanities</p>
          </div>

          {/* Notes card */}
          <div className="rounded-2xl border border-gray-200 p-6" style={{ width: 847, height: 170 }}>
            <h2 className="jersey mb-3" style={{ color: "#5C4C4C", fontSize: 30 }}>Notes</h2>
            <div className="overflow-y-auto" style={{ maxHeight: 60 }}>
              <p className="text-gray-600 mb-2" style={{ fontSize: 20 }}>Requirement may not be satisfied with:</p>
              <ul className="text-gray-600 list-disc list-inside space-y-1" style={{ fontSize: 20 }}>
                <li>Pre-matriculation credits,</li>
                <li>ENG 1, ENG 3,</li>
                <li>A course satisfying the Social Sciences Elective,</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">

          {/* Mark as Complete card — toggles green when done */}
          <div
            className="rounded-2xl p-6 transition-all duration-300"
            style={{
              height: 170,
              background: completed ? "#D7F1C5" : "white",
              border: completed ? "none" : "1px solid #e5e7eb",
            }}
          >
            <h2 className="jersey mb-4" style={{ color: "#5C4C4C", fontSize: 30 }}>Mark as Complete</h2>

            {completed ? (
              /* Completed state: show class name in white input-like box */
              <div
                className="w-full rounded-lg px-3 py-2 text-gray-600"
                style={{ background: "rgba(255,255,255,0.7)", fontSize: 20 }}
              >
                {classTaken}
              </div>
            ) : (
              /* Default state: input + done button */
              <>
                <input
                  type="text"
                  placeholder="Enter class taken"
                  value={classTaken}
                  onChange={(e) => setClassTaken(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 outline-none focus:border-gray-400 mb-3"
                />
                <div className="flex justify-end">
                  <button
                    onClick={handleDone}
                    className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                    style={{ background: "#D7F1C5", color: "#5C4C4C" }}
                  >
                    Done
                  </button>
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      {/* Bottom right: SHU counter + HASS badge */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3">
        <span className="text-sm text-gray-500 font-medium">{shu}/24 SHU</span>
        <span className="px-3 py-1.5 rounded-full text-sm font-bold text-white" style={{ background: "#C4A435" }}>
          HASS
        </span>
      </div>

    </div>
  );
}