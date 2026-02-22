'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Course from '../../types/Course';
import { getElectiveSlugFromTitle } from '../../lib/electiveConfig';

type ShuByCategory = { mns: number; hass: number; ce: number };

type Props = {
  open: boolean;
  course: Course | null;
  shuByCategory?: ShuByCategory;
  onClose: () => void;
  onToggleComplete?: (completed: boolean) => void;
  onNotesChange?: (notes: string) => void;
}; 

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-2 py-0.5 text-xs text-slate-700">
      {children}
    </span>
  );
}

function PillTag({ label }: { label: string }) {
  const upper = label.toUpperCase();
  const cls =
    upper === 'M'
      ? 'bg-rose-300 text-rose-900'
      : upper === 'NS'
      ? 'bg-lime-300 text-lime-900'
      : upper === 'HASS'
      ? 'bg-amber-300 text-amber-900'
      : upper === 'C'
      ? 'bg-indigo-300 text-indigo-900'
      : upper === 'E'
      ? 'bg-sky-300 text-sky-900'
      : 'bg-slate-200 text-slate-700';

  return (
    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-extrabold ${cls}`}>
      {label}
    </span>
  );
}

function SectionCard({
  title,
  children,
  compact,
  grow,
  className = '',
}: {
  title: string;
  children?: React.ReactNode;
  compact?: boolean;
  grow?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col rounded-xl border border-slate-300 bg-white ${compact ? 'p-3' : 'p-5'} ${className}`}>
      <div className={`shrink-0 font-extrabold text-slate-700 ${compact ? 'mb-1 text-sm' : 'mb-3 text-xl'}`}>{title}</div>
      <div className={`text-slate-600 ${grow ? 'min-h-0 flex-1 flex flex-col' : ''}`}>{children}</div>
    </div>
  );
}

const CATEGORY_TOTALS = { mns: 34, hass: 24, ce: 55 };

export default function CoursePopup({
  open,
  course,
  shuByCategory = { mns: 0, hass: 0, ce: 0 },
  onClose,
  onToggleComplete,
  onNotesChange,
}: Props) {
  const [notes, setNotes] = React.useState('');

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!course) return null;

  const electiveSlug = course.id.startsWith('req-') ? getElectiveSlugFromTitle(course.title) : undefined;

  const term = course.typically_offered ?? 'Spring / Fall';
  const shu = course.units ?? 4;
  const grading = course.letterGradeRequired ? 'Letter Grade' : 'Pass/Fail';
  const doubleCounting = course.noDoubleCounting === false;
  const tags = course.tags ?? [];

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop - click to close */}
      <button
        aria-label="Close panel"
        className={`absolute inset-0 cursor-default bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Slide-out panel from right - half screen width, no scroll */}
      <div
        className={`absolute right-0 top-0 bottom-0 z-10 flex h-screen w-1/2 min-w-[320px] flex-col overflow-hidden bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* top bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
          <button
            onClick={onClose}
            className="text-2xl leading-none text-slate-500 hover:text-slate-700"
            aria-label="Close"
          >
            ×
          </button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Mark as Complete</span>
            <input
              type="checkbox"
              checked={course.started}
              onChange={(e) => onToggleComplete?.(e.target.checked)}
              className="h-6 w-6 accent-slate-700"
              aria-label="Mark as Complete"
            />
          </div>
        </div>

        {/* content - flex to fit viewport */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-4">
          {/* header - compact */}
          <div className="shrink-0">
            {course.id.startsWith('req-') ? (
              <div className="text-2xl font-black tracking-wide text-slate-700">
                {course.title}
              </div>
            ) : (
              <>
                <div className="text-2xl font-black tracking-wide text-slate-700">
                  {course.id}
                </div>
                <div className="mt-1 text-base font-semibold text-slate-700">
                  {course.title}
                </div>
              </>
            )}

            <div className="mt-2 flex flex-wrap gap-2">
              <Chip>{term}</Chip>
              <Chip>{shu} SHU</Chip>
              <Chip>{grading}</Chip>
              <Chip>{doubleCounting ? 'Double Counting' : 'NO Double Counting'}</Chip>
            </div>
          </div>

          {/* sections - stacked vertically, Notes expands to fill space */}
          <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
            <SectionCard title="Prerequisites" compact>
              {course.prereq_raw ? (
                <p className="text-sm">{course.prereq_raw}</p>
              ) : (
                <div className="text-sm text-slate-400">—</div>
              )}
            </SectionCard>

            <SectionCard title="Notes" compact grow className="min-h-0 flex-1">
              <textarea
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  onNotesChange?.(e.target.value);
                }}
                placeholder="Write notes here…"
                className="min-h-24 flex-1 w-full resize-none rounded-lg border border-slate-200 p-2 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
              />
            </SectionCard>

            <SectionCard title="Recommended" compact>
              <div className="text-sm text-slate-400">—</div>
            </SectionCard>

            {electiveSlug && (
              <Link
                href={`/dashboard/elective/${electiveSlug}`}
                className="mt-2 inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Fill out elective →
              </Link>
            )}
          </div>

          {/* footer - only show SHU for categories relevant to this course */}
          <div className="mt-4 flex shrink-0 flex-col gap-2">
            {tags.some((t) => String(t) === 'M' || String(t) === 'NS') && (
              <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                <span>M + NS</span>
                <span>{shuByCategory.mns}/{CATEGORY_TOTALS.mns} SHU</span>
              </div>
            )}
            {tags.some((t) => String(t) === 'HASS') && (
              <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                <span>HASS</span>
                <span>{shuByCategory.hass}/{CATEGORY_TOTALS.hass} SHU</span>
              </div>
            )}
            {tags.some((t) => String(t) === 'C' || String(t) === 'E') && (
              <div className="flex items-center justify-between text-sm font-semibold text-slate-900">
                <span>C + E</span>
                <span>{shuByCategory.ce}/{CATEGORY_TOTALS.ce} SHU</span>
              </div>
            )}
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <PillTag key={tag} label={String(tag)} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
