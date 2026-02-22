'use client';

import React, { useState, useMemo, useCallback } from "react";
import YearGroup from "./yearGroup";
import CoursePopup from "./PopUp";
import Course from "../../types/Course";
import { getCoursesByYear } from "../../lib/degreeParser";

type Props = {
  courses: Course[];
  minTotalSHU?: number;
};

export default function DashboardClient({ courses, minTotalSHU = 120 }: Props) {
  const [allCourses, setAllCourses] = useState<Course[]>(courses);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const coursesByYear = useMemo(() => getCoursesByYear(allCourses), [allCourses]);

  const shuByCategory = useMemo(() => {
    const totals = { mns: 0, hass: 0, ce: 0 };
    for (const c of allCourses) {
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
    (completed: boolean) => {
      if (!selectedCourse) return;
      const updated = { ...selectedCourse, started: completed };
      setAllCourses((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setSelectedCourse(updated);
    },
    [selectedCourse]
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