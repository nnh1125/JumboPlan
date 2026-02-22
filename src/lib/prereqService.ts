/**
 * Fetches prerequisite data from the database for eligibility computation.
 */

import { prisma } from "./prisma";
import { evaluatePrereqNode, normalizeCourseId } from "./prereqEval";
import type { PrereqNodeData } from "./prereqEval";

/** Resolve course ID to DB format. Tries "CS11" and "CS0011" etc. */
export async function resolveCourseId(id: string): Promise<string | null> {
  const norm = normalizeCourseId(id);
  const course = await prisma.course.findUnique({
    where: { id: norm },
    select: { id: true },
  });
  if (course) return course.id;
  const match = norm.match(/^([A-Za-z\/]+)(\d+)$/i);
  if (match) {
    const [, subject, num] = match;
    const padded = `${subject}${num.padStart(4, "0")}`;
    const stripped = `${subject}${parseInt(num, 10)}`;
    const alt = await prisma.course.findFirst({
      where: { id: { in: [padded, stripped] } },
      select: { id: true },
    });
    return alt?.id ?? null;
  }
  return null;
}

type NodeRow = { id: string; nodeType: string; kValue: number | null; courseId: string | null; conditionText: string | null };

/** Build PrereqNodeData tree from DB nodes */
function buildNodeTree(root: NodeRow, nodesByParent: Map<string | null, NodeRow[]>): PrereqNodeData {
  const children = nodesByParent.get(root.id) ?? [];
  return {
    id: root.id,
    nodeType: root.nodeType as PrereqNodeData["nodeType"],
    kValue: root.kValue,
    courseId: root.courseId,
    conditionText: root.conditionText,
    children: children.map((c) => buildNodeTree(c, nodesByParent)),
  };
}

/**
 * Fetch prereq expressions for a list of course IDs (degree format: "CS11", "MATH32", etc.).
 * Returns a Map: normalizedCourseId -> root PrereqNodeData, or null if no prereqs.
 */
export async function getPrereqMapForCourses(
  courseIds: string[]
): Promise<Map<string, PrereqNodeData | null>> {
  const resolved = new Map<string, string>();
  for (const id of courseIds) {
    const dbId = await resolveCourseId(id);
    if (dbId) resolved.set(normalizeCourseId(id), dbId);
  }

  const dbIds = [...new Set(resolved.values())];
  const expressions = await prisma.prereqExpression.findMany({
    where: { courseId: { in: dbIds } },
    include: {
      rootNode: true,
      nodes: true,
    },
  });

  const nodesByParent = new Map<string | null, NodeRow[]>();
  for (const expr of expressions) {
    for (const n of expr.nodes) {
      const key = n.parentNodeId;
      if (!nodesByParent.has(key)) nodesByParent.set(key, []);
      nodesByParent.get(key)!.push({
        id: n.id,
        nodeType: n.nodeType,
        kValue: n.kValue,
        courseId: n.courseId,
        conditionText: n.conditionText,
      });
    }
  }

  const result = new Map<string, PrereqNodeData | null>();
  for (const [normId, dbId] of resolved) {
    const expr = expressions.find((e) => e.courseId === dbId);
    if (!expr) {
      result.set(normId, null);
      continue;
    }
    const root = buildNodeTree(expr.rootNode, nodesByParent);
    result.set(normId, root);
  }
  return result;
}

/**
 * Check if a course's prerequisites are satisfied.
 */
export function arePrereqsSatisfied(
  prereqRoot: PrereqNodeData | null | undefined,
  completedIds: Set<string>
): boolean {
  if (!prereqRoot) return true;
  return evaluatePrereqNode(prereqRoot, completedIds);
}
