/**
 * Evaluates prerequisite expressions against a set of completed course IDs.
 * Used to determine if a course is eligible (unlocked) based on user progress.
 */

import type { PrereqNodeType } from "@prisma/client";

export type PrereqNodeData = {
  id: string;
  nodeType: PrereqNodeType;
  kValue: number | null;
  courseId: string | null;
  conditionText: string | null;
  children?: PrereqNodeData[];
};

/** Normalize course ID for comparison. "CS 11" -> "CS11", "CS 0011" -> "CS0011". Handles both formats. */
export function normalizeCourseId(id: string): string {
  return id.replace(/\s/g, "");
}

/** Check if completedIds contains a course, trying multiple ID formats (CS11 vs CS0011). */
function isCourseCompleted(
  courseId: string,
  completedIds: Set<string>
): boolean {
  const norm = normalizeCourseId(courseId);
  if (completedIds.has(norm)) return true;
  // Try alternate format: CS11 <-> CS0011 (pad or strip leading zeros)
  const match = norm.match(/^([A-Za-z\/]+)(\d+)$/i);
  if (match) {
    const [, subject, num] = match;
    const padded = `${subject}${num.padStart(4, "0")}`;
    const stripped = `${subject}${parseInt(num, 10)}`;
    if (completedIds.has(padded) || completedIds.has(stripped)) return true;
  }
  return false;
}

/** Returns true if the tree contains any COURSE nodes (evaluable prereqs). */
export function hasCoursePrereqs(node: PrereqNodeData): boolean {
  if (node.nodeType === "COURSE") return true;
  for (const c of node.children ?? []) {
    if (hasCoursePrereqs(c)) return true;
  }
  return false;
}

/**
 * Evaluate a prereq node tree. Returns true if prerequisites are satisfied.
 * - COURSE: satisfied if courseId is in completedIds
 * - CONDITION: cannot evaluate programmatically → treat as satisfied (user can take it)
 * - AND: all children must be satisfied
 * - OR: at least one child satisfied
 * - MIN_K: at least kValue children satisfied
 */
export function evaluatePrereqNode(
  node: PrereqNodeData,
  completedIds: Set<string>
): boolean {
  switch (node.nodeType) {
    case "COURSE":
      if (node.courseId) {
        return isCourseCompleted(node.courseId, completedIds);
      }
      return true;

    case "CONDITION":
      // Free-text condition (e.g. "First Years or Sophomores") - can't evaluate
      return true;

    case "AND": {
      const children = node.children ?? [];
      return children.every((c) => evaluatePrereqNode(c, completedIds));
    }

    case "OR": {
      const children = node.children ?? [];
      return children.some((c) => evaluatePrereqNode(c, completedIds));
    }

    case "MIN_K": {
      const k = node.kValue ?? 1;
      const children = node.children ?? [];
      const satisfied = children.filter((c) => evaluatePrereqNode(c, completedIds));
      return satisfied.length >= k;
    }

    default:
      return true;
  }
}
