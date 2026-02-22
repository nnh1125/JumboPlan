'use client';

import React, { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import YearGroup from "./yearGroup";
import CoursePopup from "./PopUp";
import Course from "../../types/Course";
import { getCoursesByYear, recomputeCourseEligibility, type PrereqMapSerialized } from "../../lib/degreeParser";

type Props = {
  courses: Course[];
  prereqMap?: PrereqMapSerialized;
  minTotalSHU?: number;
};

export default function DashboardClient({ courses, prereqMap, minTotalSHU = 120 }: Props) {
  const router = useRouter();
  const [allCourses, setAllCourses] = useState<Course[]>(courses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const coursesWithEligibility = useMemo(
    () => recomputeCourseEligibility(allCourses, prereqMap),
    [allCourses, prereqMap]
  );
  const coursesByYear = useMemo(() => getCoursesByYear(coursesWithEligibility), [coursesWithEligibility]);

  const shuByCategory = useMemo(() => {
    const totals = { mns: 0, hass: 0, ce: 0 };
    for (const c of coursesWithEligibility) {
      if (!c.started) continue;
      const units = c.units ?? 0;
      const groupIds = c.groupIds ?? [];
      const g = groupIds[0];
      if (g === 'math_natural_sciences') totals.mns += units;
      else if (g === 'hass' || g === 'breadth_electives') totals.hass += units;
      else if (g === 'cs_core' || g === 'engineering_soe') totals.ce += units;
    }
    return totals;
  }, [allCourses]);

  const handleCourseChange = (year: number) => (updated: Course) => {
    setAllCourses((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    if (selectedCourse?.id === updated.id) {
      setSelectedCourse(updated);
    }
  };

  const handleCourseClick = useCallback((course: Course) => {
    setSelectedCourse(course);
    setPanelOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setPanelOpen(false);
    setTimeout(() => setSelectedCourse(null), 300);
  }, []);

  const handleToggleComplete = useCallback(
    async (completed: boolean) => {
      if (!selectedCourse) return;
      const updated = { ...selectedCourse, started: completed };

      // Optimistic update: show change immediately
      setAllCourses((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setSelectedCourse(updated);

      const courseId = selectedCourse.id.replace(/\s/g, "");
      const status = completed ? "COMPLETED" : "NOT_STARTED";
      const res = await fetch("/api/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, status }),
      });

      if (!res.ok) {
        // Revert on failure
        setAllCourses((prev) =>
          prev.map((c) => (c.id === selectedCourse.id ? selectedCourse : c))
        );
        setSelectedCourse(selectedCourse);
        return;
      }

      router.refresh(); // Sync in background, don't block UI
    },
    [selectedCourse, router]
  );

  return (
    <>
      <div className="flex flex-col gap-8">
        {[1, 2, 3, 4].map((year) => (
          <YearGroup
            key={year}
            yearNumber={year}
            courses={coursesByYear[year] ?? []}
            totalSlots={12}
            onCourseClick={handleCourseClick}
            onCourseChange={handleCourseChange(year)}
          />
        ))}
      </div>

      <CoursePopup
        open={panelOpen}
        course={selectedCourse}
        shuByCategory={shuByCategory}
        onClose={handleClose}
        onToggleComplete={handleToggleComplete}
      />
    </>
  );
}