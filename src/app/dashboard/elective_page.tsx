"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ElectiveConfig } from "../../lib/electiveConfig";

const CATEGORY_BADGES: Record<string, { bg: string; label: string }[]> = {
  mns: [{ bg: "#FE959E", label: "M" }, { bg: "#BAC55C", label: "NS" }],
  hass: [{ bg: "#C4A435", label: "HASS" }],
  ce: [{ bg: "#5E94CE", label: "C" }, { bg: "#82CDEA", label: "E" }],
};

type Props = {
  config: ElectiveConfig;
};

export default function ElectivePage({ config }: Props) {
  const [completed, setCompleted] = useState(false);
  const [shu, setShu] = useState(0);
  const [userNotes, setUserNotes] = useState("");

  const [classTaken, setClassTaken] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [otherValue, setOtherValue] = useState("");
  const [slotValues, setSlotValues] = useState<string[]>(
    Array(config.count ?? 1).fill("")
  );

  const handleDone = () => {
    if (config.inputType === "free-text") {
      if (classTaken.trim() === "") return;
      setCompleted(true);
      setShu(config.minSHU ?? 3);
    } else if (config.inputType === "course-picker") {
      const value = selectedOption === "other" ? otherValue : selectedOption;
      if (value.trim() === "") return;
      setCompleted(true);
      setShu(config.minSHU ?? 3);
    } else if (config.inputType === "multi-slot") {
      const filled = slotValues.filter((v) => v.trim() !== "");
      if (filled.length < (config.count ?? 1)) return;
      setCompleted(true);
      setShu((config.minSHU ?? 3) * (config.count ?? 1));
    }
  };

  const canComplete =
    config.inputType === "free-text"
      ? classTaken.trim() !== ""
      : config.inputType === "course-picker"
        ? (selectedOption !== "" && (selectedOption !== "other" || otherValue.trim() !== ""))
        : slotValues.filter((v) => v.trim() !== "").length >= (config.count ?? 1);

  const displayValue =
    config.inputType === "free-text"
      ? classTaken
      : config.inputType === "course-picker"
        ? selectedOption === "other"
          ? otherValue
          : config.options?.find((o) => o.value === selectedOption)?.label ?? selectedOption
        : slotValues.filter((v) => v.trim() !== "").join(", ");

  const eligibleDisplay = config.eligibleCourses?.length
    ? config.eligibleCourses.join(", ")
    : config.eligibleText ?? "—";

  const notEligibleDisplay = config.notEligibleCourses?.length
    ? config.notEligibleCourses.join(", ")
    : config.notEligibleText ?? null;

  const badges = CATEGORY_BADGES[config.category] ?? [{ bg: "#888", label: config.category }];

  return (
    <div
      className="min-h-screen bg-white p-8"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Jersey+25&display=swap');
        .jersey { font-family: 'Jersey 25', sans-serif; font-weight: 400; }
      `}</style>

      <Link
        href="/dashboard"
        className="mb-6 inline-block text-gray-500 hover:text-gray-800 transition-colors"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M19 12H5M5 12L12 19M5 12L12 5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      <h1
        className="jersey mb-3"
        style={{ color: "#5C4C4C", fontSize: 48, lineHeight: 1 }}
      >
        {config.title}
      </h1>

      <div className="flex flex-wrap gap-2 mb-8">
        {config.tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1 rounded-full text-sm border border-gray-300 text-gray-600"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left column - NOT Eligible, Eligible, Notes */}
        <div className="col-span-2 flex flex-col gap-6">
          <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 min-h-[140px]">
            <h2 className="jersey mb-2" style={{ color: "#5C4C4C", fontSize: 24 }}>
              NOT Eligible
            </h2>
            <p className="text-gray-600" style={{ fontSize: 18 }}>
              {notEligibleDisplay ?? "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 min-h-[140px]">
            <h2 className="jersey mb-2" style={{ color: "#5C4C4C", fontSize: 24 }}>
              Eligible
            </h2>
            <p className="text-gray-600" style={{ fontSize: 18 }}>
              {eligibleDisplay}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-6 min-h-[140px]">
            <h2 className="jersey mb-2" style={{ color: "#5C4C4C", fontSize: 24 }}>
              Notes
            </h2>
            <textarea
              placeholder="Add your notes here..."
              value={userNotes}
              onChange={(e) => setUserNotes(e.target.value)}
              className="w-full min-h-[80px] resize-none rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-600 outline-none focus:border-gray-400"
              style={{ fontSize: 16 }}
            />
          </div>
        </div>

        {/* Right column - Mark as Complete */}
        <div className="flex flex-col">
          <div
            className="rounded-2xl p-6 transition-all duration-300"
            style={{
              minHeight: 140,
              background: completed ? "#D7F1C5" : "white",
              border: completed ? "none" : "1px solid #e5e7eb",
            }}
          >
            <h2 className="jersey mb-4" style={{ color: "#5C4C4C", fontSize: 24 }}>
              Mark as Complete
            </h2>

            {completed ? (
              <div
                className="w-full rounded-lg px-3 py-2 text-gray-600 bg-white/70"
                style={{ fontSize: 18 }}
              >
                {displayValue}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {config.inputType === "free-text" && (
                  <input
                    type="text"
                    placeholder="Enter class taken"
                    value={classTaken}
                    onChange={(e) => setClassTaken(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-gray-400"
                  />
                )}

                {config.inputType === "course-picker" && config.options && (
                  <div className="flex flex-col gap-2">
                    {config.options.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="elective-option"
                          value={opt.value}
                          checked={selectedOption === opt.value}
                          onChange={() => setSelectedOption(opt.value)}
                          className="accent-gray-600"
                        />
                        <span className="text-gray-700 text-sm">{opt.label}</span>
                      </label>
                    ))}
                    {config.options?.some((o) => o.value === "other") && selectedOption === "other" && (
                      <input
                        type="text"
                        placeholder="Enter course code"
                        value={otherValue}
                        onChange={(e) => setOtherValue(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mt-1"
                      />
                    )}
                  </div>
                )}

                {config.inputType === "multi-slot" && (
                  <div className="flex flex-col gap-2">
                    {slotValues.map((val, i) =>
                      config.options ? (
                        <select
                          key={i}
                          value={val}
                          onChange={(e) => {
                            const next = [...slotValues];
                            next[i] = e.target.value;
                            setSlotValues(next);
                          }}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-gray-400"
                        >
                          <option value="">Enter class taken</option>
                          {config.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          key={i}
                          type="text"
                          placeholder="Enter class taken"
                          value={val}
                          onChange={(e) => {
                            const next = [...slotValues];
                            next[i] = e.target.value;
                            setSlotValues(next);
                          }}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-gray-400"
                        />
                      )
                    )}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleDone}
                    disabled={!canComplete}
                    className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: canComplete ? "#D7F1C5" : "#e5e7eb",
                      color: "#5C4C4C",
                    }}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom right: SHU counter + category badges */}
      <div className="fixed bottom-8 right-8 flex items-center gap-3">
        <span className="text-sm text-gray-500 font-medium">
          {shu}/{config.shuTotal} SHU
        </span>
        <div className="flex gap-2">
          {badges.map((b) => (
            <span
              key={b.label}
              className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: b.bg }}
            >
              {b.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
