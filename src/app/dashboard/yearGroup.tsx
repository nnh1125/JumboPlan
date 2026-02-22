import React from 'react';
import Course from '@/types/Course';
import CourseCard from '../../components/Dashboard/CourseCard/CourseCard';
import flag from "../../icons/material-symbols_flag.svg"

type Props = {
  /** e.g. 1 for Year 1 (also controls number of flags) */
  yearNumber: number;

  /** courses to render in this year */
  courses: Course[];

  /** how many "slots" the grid should show total (including empty placeholders) */
  totalSlots?: number;

  /** called when a course card is clicked */
  onCourseClick?: (course: Course) => void;

  /** called when a course is changed (if you support editing) */
  onCourseChange?: (course: Course) => void;
};

export default function YearGroup({
  yearNumber,
  courses,
  totalSlots = 10, // matches your screenshot vibe: 8 filled + 2 empty
  onCourseClick,
  onCourseChange,
}: Props) {
  const emptyCount = Math.max(0, totalSlots - courses.length);

  return (
    <section className="w-full">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3 text-slate-700">
        <div className="flex items-center gap-1">
          {Array.from({ length: yearNumber }).map((_, i) => (
            <span key={i} aria-hidden>
              <img src={flag.src} alt="Flag icon" className="h-5 w-5" />
            </span>
          ))}
        </div>
        <div className="text-lg font-semibold">Year {yearNumber}</div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((course) => (
          <div key={course.id} className="cursor-pointer">
            <CourseCard
              empty={false}
              course={course}
              onClick={() => onCourseClick?.(course)}
              onCourseChange={(updated) => onCourseChange?.(updated)}
            />
          </div>
        ))}

        {Array.from({ length: emptyCount }).map((_, i) => (
          <CourseCard key={`empty-${i}`} empty={true} />
        ))}
      </div>
    </section>
  );
}