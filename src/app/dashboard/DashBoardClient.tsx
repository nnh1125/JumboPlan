'use client';

import React, { useState } from "react";
import YearGroup from "./yearGroup";
import Course from "@/types/Course";

type Props = {
  courses: Course[];
};

export default function DashboardClient({ courses }: Props) {
  const [year1Courses, setYear1Courses] = useState<Course[]>(courses);
  const [year2Courses, setYear2Courses] = useState<Course[]>([]);

  return (
    <div className="flex flex-col p-10 gap-5">
      <h1>Dashboard</h1>

      <YearGroup
        yearNumber={1}
        courses={year1Courses}
        totalSlots={8}
        onCourseClick={(course) => console.log("Clicked course", course)}
        onCourseChange={(updated) => {
          console.log("Changed course", updated);
          setYear1Courses((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          );
        }}
      />

      <YearGroup
        yearNumber={2}
        courses={year2Courses}
        totalSlots={8}
        onCourseClick={(course) => console.log("Clicked course", course)}
        onCourseChange={(updated) => {
          console.log("Changed course", updated);
          setYear2Courses((prev) =>
            prev.map((c) => (c.id === updated.id ? updated : c))
          );
        }}
      />
    </div>
  );
}