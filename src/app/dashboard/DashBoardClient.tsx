'use client';

import React, { useState, useMemo } from "react";
import YearGroup from "./yearGroup";
import Course from "../../types/Course";
import { getCoursesByYear } from "../../lib/degreeParser";

type Props = {
  courses: Course[];
};

export default function DashboardClient({ courses }: Props) {
  const [allCourses, setAllCourses] = useState<Course[]>(courses);

  const coursesByYear = useMemo(() => getCoursesByYear(allCourses), [allCourses]);

  const handleCourseChange = (year: number) => (updated: Course) => {
    setAllCourses((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  };

  return (
    <div className="flex flex-col gap-8">
      {[1, 2, 3, 4].map((year) => (
        <YearGroup
          key={year}
          yearNumber={year}
          courses={coursesByYear[year] ?? []}
          totalSlots={12}
          onCourseClick={(course) => console.log("Clicked course", course)}
          onCourseChange={handleCourseChange(year)}
        />
      ))}
    </div>
  );
}