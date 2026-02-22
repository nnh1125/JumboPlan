'use client';

import React, { useEffect } from 'react';
import Course from '@/types/Course';

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700">
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
      : 'bg-slate-200 text-slate-700';

  return (
    <span className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-sm font-extrabold ${cls}`}>
      {label}
    </span>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-300 bg-white p-5">
      <div className="mb-3 text-xl font-extrabold text-slate-700">{title}</div>
      <div className="min-h-[120px] text-slate-600">{children}</div>
    </div>
  );
}

export default function CoursePopup({
  open,
  course,
  onClose,
  onToggleComplete,
  onNotesChange,
}: Props) {
  // ESC to close + lock scroll
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

  if (!open) return null;

  const {
    id,
    title,
    term = 'Spring / Fall',
    shu = 4,
    grading = 'Letter Grade',
    doubleCounting = false,
    completed = false,
    notes = '',
    prerequisites = [],
    recommended = [],
    tags = [],
    progress = { done: 0, total: 34 },
  } = course;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <button
        aria-label="Close popup"
        className="absolute inset-0 cursor-default bg-black/40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-start justify-center p-4 sm:p-8">
        <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
          {/* top bar */}
          <div className="relative px-6 pt-6">
            {/* close X */}
            <button
              onClick={onClose}
              className="absolute left-4 top-4 text-3xl leading-none text-slate-500 hover:text-slate-700"
              aria-label="Close"
            >
              ×
            </button>

            {/* complete checkbox */}
            <div className="flex items-center justify-end gap-3">
              <span className="text-lg text-slate-600">Mark as Complete</span>
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => onToggleComplete?.(e.target.checked)}
                className="h-6 w-6 accent-slate-700"
                aria-label="Mark as Complete"
              />
            </div>
          </div>

          {/* content */}
          <div className="px-6 pb-6 pt-2 sm:px-10 sm:pb-10">
            {/* header */}
            <div className="mt-4">
              <div className="text-5xl font-black tracking-wide text-slate-700">
                {id}
              </div>
              <div className="mt-2 text-2xl font-semibold text-slate-700">
                {title}
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Chip>{term}</Chip>
                <Chip>{shu} SHU</Chip>
                <Chip>{grading}</Chip>
                <Chip>{doubleCounting ? 'Double Counting' : 'NO Double Counting'}</Chip>
              </div>
            </div>

            {/* sections */}
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <SectionCard title="Prerequisites">
                {prerequisites.length ? (
                  <ul className="list-disc pl-5">
                    {prerequisites.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-slate-400">—</div>
                )}
              </SectionCard>

              <SectionCard title="Notes">
                <textarea
                  value={notes}
                  onChange={(e) => onNotesChange?.(e.target.value)}
                  placeholder="Write notes here…"
                  className="h-28 w-full resize-none rounded-xl border border-slate-200 p-3 text-slate-700 outline-none focus:ring-2 focus:ring-slate-300"
                />
              </SectionCard>

              <SectionCard title="Recommended">
                {recommended.length ? (
                  <ul className="list-disc pl-5">
                    {recommended.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-slate-400">—</div>
                )}
              </SectionCard>

              {/* blank card to mirror layout */}
              <div className="rounded-2xl border border-transparent bg-transparent" />
            </div>

            {/* footer */}
            <div className="mt-10 flex items-center justify-end gap-4">
              <div className="text-3xl font-semibold text-slate-900">
                {progress.done}/{progress.total} SHU
              </div>

              <div className="flex items-center gap-3">
                {tags.map((t) => (
                  <PillTag key={t} label={t} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}