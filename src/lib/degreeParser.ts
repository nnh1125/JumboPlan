/**
 * Parses degree.json and transforms it into Course objects for the dashboard.
 * Maps requirements to years based on the BSCS suggested course sequence.
 */

import Course from "../types/Course";
import CourseTag from "../types/CourseTag";
import { evaluatePrereqNode, hasCoursePrereqs } from "./prereqEval";

// Degree JSON types (from degree.json structure)
type DegreeGroup = {
  groupId: string;
  title: string;
  items: DegreeItem[];
};

type DegreeItem =
  | {
      type: "course";
      data: { course: string; title: string; shu: number };
    }
  | {
      type: "course_or";
      data: {
        label: string;
        options: Array<{ course?: string; title?: string; shu?: number; type?: string; label?: string }>;
        minGrade?: string;
      };
    }
  | {
      type: "elective_rule";
      data: { label: string; minSHU?: number; count?: number; eachMinSHU?: number; rulesRef?: string };
    }
  // elective_rule with count expands to multiple slots
  | {
      type: "elective_set";
      data: { label: string; count: number; eachMinSHU?: number; rulesRef?: string };
    };

export type DegreeData = {
  groups: DegreeGroup[];
};

// Map groupId to SOE attribute tags
const GROUP_TO_TAGS: Record<string, CourseTag[]> = {
  math_natural_sciences: [CourseTag.M, CourseTag.NS],
  hass: [CourseTag.HASS],
  engineering_soe: [CourseTag.E],
  cs_core: [CourseTag.C],
  breadth_electives: [CourseTag.HASS],
};

// Suggested course sequence by year (from BSCS Course Selection Guidance)
// Maps course codes or elective labels to year 1-4
const COURSE_SEQUENCE: Record<string, number> = {
  // Year 1
  "EN 1": 1,
  "MATH 32": 1,
  "MATH 39": 1,
  "ENG 1": 1,
  "ENG 3": 1,
  "CS 11": 1,
  "MATH 34": 1,
  "MATH 44": 1,
  // Year 2
  "CS 15": 2,
  "CS/MATH 61": 2,
  "MATH 61": 2,
  "MATH 65": 2,
  "EM 52": 2,
  "MATH 42": 2,
  "CS 40": 2,
  "MATH 70": 2,
  "MATH 72": 2,
  "ES 2": 2,
  // Year 3
  "CS 160": 3,
  "CS 105": 3,
  "CS 80": 3,
  // Year 4
  "CS 97": 4,
  "CS 98": 4,
  "CS 170": 4,
};

const ELECTIVE_YEAR: Record<string, number> = {
  "BIO-CHEM-PHY Electives (two courses from different departments)": 1,
  "Math & Natural Sciences Elective": 3,
  "MNS Elective": 3,
  "Probability & Statistics Elective": 3,
  "Humanities Elective": 1,
  "Social Science Elective": 1,
  "Ethics & Social Context Elective": 2,
  "Technical Writing (Technical and Managerial Communication)": 2,
  "Intro Computing in Engineering OR Engineering/Computing Elective": 2,
  "Systems Elective": 2,
  "CS Elective (j)": 3,
  "CS Elective (k)": 3,
  "CS Elective (l)": 3,
  "CS Social Context Elective (m)": 4,
  "Breadth Electives": 3,
  "Unrestricted Elective": 4,
};

// Curriculum prereqs: course -> required course IDs (OR: any one satisfies). BSCS core sequence.
const CURRICULUM_PREREQS: Record<string, string[]> = {
  "CS15": ["CS11", "CS10"],
  "CS40": ["CS15"],
  "CS160": ["CS15", "CS40"],
  "CS105": ["CS15"],
  "CS80": ["CS15"],
  // Math sequence: MATH 32 -> MATH 34 -> MATH 42, and MATH 34 -> MATH 70
  "MATH34": ["MATH32"],
  "MATH42": ["MATH34"],
  "MATH70": ["MATH34"],
};

function isCurriculumPrereqSatisfied(code: string, completedIds: Set<string>): boolean {
  const prereqs = CURRICULUM_PREREQS[code];
  if (!prereqs) return true;
  return prereqs.some((p) => {
    const pNorm = p.replace(/\s/g, "");
    if (completedIds.has(pNorm)) return true;
    const m = pNorm.match(/^([A-Za-z\/]+)(\d+)$/i);
    if (m) {
      const [, subj, num] = m;
      return completedIds.has(`${subj}${num.padStart(4, "0")}`) || completedIds.has(`${subj}${parseInt(num, 10)}`);
    }
    return false;
  });
}

// Prerequisite order for locked/eligible (fallback when no curriculum prereq defined)
const PREREQ_ORDER: string[] = [
  "MATH 32",
  "MATH 39",
  "EN 1",
  "ENG 1",
  "ENG 3",
  "CS 11",
  "MATH 34",
  "MATH 44",
  "MATH 42",
  "MATH 43",
  "CS 15",
  "CS/MATH 61",
  "MATH 61",
  "MATH 65",
  "EM 52",
  "MATH 70",
  "MATH 72",
  "CS 40",
  "ES 2",
  "CS 160",
  "CS 105",
  "CS 80",
  "CS 170",
  "CS 97",
  "CS 98",
];

function getYearForItem(
  item: DegreeItem,
  groupId: string,
  indexInGroup: number
): number {
  if (item.type === "course") {
    const code = item.data.course.replace(/\s/g, " ");
    return COURSE_SEQUENCE[code] ?? Math.min(4, Math.floor(indexInGroup / 2) + 1);
  }
  if (item.type === "course_or") {
    const first = item.data.options[0];
    if (first && "course" in first && first.course) {
      return COURSE_SEQUENCE[first.course] ?? Math.min(4, Math.floor(indexInGroup / 2) + 1);
    }
    return ELECTIVE_YEAR[item.data.label] ?? 2;
  }
  if (item.type === "elective_rule" || item.type === "elective_set") {
    return ELECTIVE_YEAR[item.data.label] ?? 2;
  }
  return 2;
}

function getDisplayLabel(item: DegreeItem): string {
  if (item.type === "course") {
    return item.data.course;
  }
  if (item.type === "course_or") {
    const opts = item.data.options;
    const codes = opts
      .filter((o): o is { course: string } => "course" in o && !!o.course)
      .map((o) => o.course);
    const electiveOpt = opts.find((o) => o.type === "elective_rule" && o.label);
    if (electiveOpt && electiveOpt.label) {
      return codes.length > 0 ? `${codes.join(" / ")} / ${electiveOpt.label}` : electiveOpt.label;
    }
    if (codes.length > 0) return codes.join(" / ");
    return item.data.label;
  }
  if (item.type === "elective_rule" || item.type === "elective_set") {
    let label = item.data.label
      .replace(/\s*\(beyond SOE HASS requirement\)\s*$/i, "")
      .replace(/\s*\(two courses from different departments\)\s*$/i, "")
      .trim() || item.data.label;
    if (label === "Math & Natural Sciences Elective") label = "MNS Elective";
    return label;
  }
  return "Unknown";
}

function getCourseId(item: DegreeItem, index: number): string {
  if (item.type === "course") {
    return item.data.course.replace(/\s/g, "");
  }
  if (item.type === "course_or") {
    const first = item.data.options[0];
    if (first && "course" in first && first.course) {
      return first.course.replace(/\s/g, "");
    }
  }
  return `req-${index}`;
}

function getUnits(item: DegreeItem): number {
  if (item.type === "course") return item.data.shu;
  if (item.type === "course_or") {
    const first = item.data.options[0];
    if (first && "shu" in first && typeof first.shu === "number") return first.shu;
  }
  if (item.type === "elective_rule") return item.data.minSHU ?? item.data.eachMinSHU ?? 3;
  if (item.type === "elective_set") return item.data.eachMinSHU ?? 5;
  return 3;
}

function parseCourseId(id: string): { subject: string; number: string } {
  const match = id.match(/^([A-Z]+(?:\s*\/\s*[A-Z]+)?)\s*(\d+)$/i);
  if (match) {
    return { subject: match[1].trim(), number: match[2] };
  }
  return { subject: id, number: "" };
}

export type PrereqMap = Map<string, import("./prereqEval").PrereqNodeData | null>;

/** Extract all concrete course IDs from degree (for prereq lookup). Excludes elective slots (req-X). */
export function getDegreeCourseIds(degree: DegreeData): string[] {
  const ids = new Set<string>();
  let idx = 0;
  for (const group of degree.groups) {
    for (const item of group.items) {
      const count = item.type === "elective_set" ? item.data.count : item.type === "elective_rule" && item.data.count ? item.data.count : 1;
      for (let i = 0; i < count; i++) {
        const baseId = getCourseId(item, idx);
        if (!baseId.startsWith("req-")) {
          const norm = baseId.replace(/\s/g, "");
          ids.add(norm);
          if (norm.includes("-")) ids.add(norm.split("-")[0]);
          if (item.type === "course_or" && item.data.options) {
            for (const opt of item.data.options) {
              if ("course" in opt && opt.course) ids.add(opt.course.replace(/\s/g, ""));
            }
          }
        }
        idx++;
      }
    }
  }
  return [...ids];
}

export function parseDegreeToCourses(
  degree: DegreeData,
  completedCourseIds?: Set<string>,
  prereqMap?: PrereqMap
): Course[] {
  const courses: Course[] = [];
  let globalIndex = 0;

  for (const group of degree.groups) {
    const tags = GROUP_TO_TAGS[group.groupId] ?? [];

    group.items.forEach((item, indexInGroup) => {
      const count =
        item.type === "elective_set"
          ? item.data.count
          : item.type === "elective_rule" && item.data.count
            ? item.data.count
            : 1;
      for (let i = 0; i < count; i++) {
        const year = getYearForItem(item, group.groupId, indexInGroup);
        const displayLabel = getDisplayLabel(item);
        const id = count > 1 ? `${getCourseId(item, globalIndex)}-${i + 1}` : getCourseId(item, globalIndex);
        const units = getUnits(item);
        const { subject, number } = parseCourseId(id);

        const idNorm = id.replace(/\s/g, "");
        const started = completedCourseIds?.has(idNorm) ?? false;

        const course: Course = {
          id,
          subject,
          number,
          title: displayLabel,
          units,
          started,
          eligible: true,
          tags: tags.length > 0 ? tags : undefined,
          yearBucket: year,
          groupIds: [group.groupId],
        };

        courses.push(course);
        globalIndex++;
      }
    });
  }

  // Compute eligibility: use prereqMap (DB) when available, else fallback to PREREQ_ORDER
  const completedIds = completedCourseIds ?? new Set<string>();
  for (const c of courses) {
    if (c.started) completedIds.add(c.id.replace(/\s/g, ""));
  }
  for (const c of courses) {
    if (c.started) continue;
    const code = c.id.replace(/\s/g, "");
    const baseCode = code.includes("-") ? code.split("-")[0] : code;
    const prereqRoot = prereqMap?.get(code) ?? prereqMap?.get(baseCode);
    if (CURRICULUM_PREREQS[baseCode]) {
      c.eligible = isCurriculumPrereqSatisfied(baseCode, completedIds);
    } else if (prereqRoot !== undefined && prereqRoot !== null && hasCoursePrereqs(prereqRoot)) {
      c.eligible = evaluatePrereqNode(prereqRoot, completedIds);
    } else if (prereqRoot !== undefined && prereqRoot !== null && !hasCoursePrereqs(prereqRoot)) {
      const prereqIndex = PREREQ_ORDER.findIndex((p) => p.replace(/\s/g, "") === code || p.replace(/\s/g, "") === baseCode);
      if (prereqIndex > 0) {
        const prev = PREREQ_ORDER[prereqIndex - 1].replace(/\s/g, "");
        c.eligible = completedIds.has(prev);
      } else {
        c.eligible = true;
      }
    } else {
      if (prereqMap) {
        const prereqIndex = PREREQ_ORDER.findIndex((p) => p.replace(/\s/g, "") === code || p.replace(/\s/g, "") === baseCode);
        if (prereqIndex > 0) {
          const prev = PREREQ_ORDER[prereqIndex - 1].replace(/\s/g, "");
          c.eligible = completedIds.has(prev);
        } else {
          c.eligible = true;
        }
      } else {
        const prereqIndex = PREREQ_ORDER.findIndex((p) => p.replace(/\s/g, "") === code);
        if (prereqIndex > 0) {
          const prev = PREREQ_ORDER[prereqIndex - 1].replace(/\s/g, "");
          c.eligible = completedIds.has(prev);
        }
      }
    }
  }

  return courses;
}

/** PrereqMap as plain object (JSON-serializable for client). */
export type PrereqMapSerialized = Record<string, import("./prereqEval").PrereqNodeData | null>;

/**
 * Recompute eligibility for courses based on current `started` state.
 * Call this on the client whenever course progress changes so dependent courses unlock instantly.
 */
export function recomputeCourseEligibility(
  courses: Course[],
  prereqMap?: PrereqMap | PrereqMapSerialized
): Course[] {
  const map = prereqMap instanceof Map ? prereqMap : new Map(Object.entries(prereqMap ?? {}));
  const completedIds = new Set<string>();
  for (const c of courses) {
    if (c.started) completedIds.add(c.id.replace(/\s/g, ""));
  }
  return courses.map((c) => {
    if (c.started) return { ...c, eligible: true };
    const code = c.id.replace(/\s/g, "");
    const baseCode = code.includes("-") ? code.split("-")[0] : code;
    const prereqRoot = map.get(code) ?? map.get(baseCode);
    let eligible: boolean;
    if (CURRICULUM_PREREQS[baseCode]) {
      eligible = isCurriculumPrereqSatisfied(baseCode, completedIds);
    } else if (prereqRoot !== undefined && prereqRoot !== null && hasCoursePrereqs(prereqRoot)) {
      eligible = evaluatePrereqNode(prereqRoot, completedIds);
    } else if (prereqRoot !== undefined && prereqRoot !== null && !hasCoursePrereqs(prereqRoot)) {
      const prereqIndex = PREREQ_ORDER.findIndex((p) => p.replace(/\s/g, "") === code || p.replace(/\s/g, "") === baseCode);
      eligible = prereqIndex > 0 ? completedIds.has(PREREQ_ORDER[prereqIndex - 1].replace(/\s/g, "")) : true;
    } else {
      const prereqIndex = PREREQ_ORDER.findIndex((p) => p.replace(/\s/g, "") === code || p.replace(/\s/g, "") === baseCode);
      eligible = prereqIndex > 0 ? completedIds.has(PREREQ_ORDER[prereqIndex - 1].replace(/\s/g, "")) : true;
    }
    return { ...c, eligible };
  });
}

export function getCoursesByYear(courses: Course[]): Record<number, Course[]> {
  const byYear: Record<number, Course[]> = { 1: [], 2: [], 3: [], 4: [] };
  for (const c of courses) {
    const year = c.yearBucket ?? 2;
    if (year >= 1 && year <= 4) {
      byYear[year].push(c);
    }
  }
  return byYear;
}
