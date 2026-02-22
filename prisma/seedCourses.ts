/**
 * Seeds the database with course data from cs_courses.json.
 * Populates Course records and builds PrereqExpression/PrereqNode for prerequisites.
 *
 * Run: npx tsx prisma/seedCourses.ts
 */

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

type CourseEntry = {
  subject: string;
  title: string;
  units: string;
  typically_offered: string;
  requirements: string;
  attributes: string;
  description: string;
  grading_basis: string;
};

type CoursesJson = Record<string, CourseEntry>;

/** Normalize course key "CS 0011" -> id "CS0011", subject "CS", number "0011" */
function parseCourseKey(key: string): { id: string; subject: string; number: string } | null {
  const match = key.match(/^([A-Za-z]+)\s+(\d+)$/);
  if (!match) return null;
  const [, subject, number] = match;
  const id = `${subject}${number}`;
  return { id, subject, number };
}

/** Parse units string "4.00" or "2.00 - 3.00" -> credits number */
function parseCredits(units: string): number | null {
  if (!units || units.trim() === "") return null;
  const first = units.match(/^(\d+(?:\.\d+)?)/);
  if (!first) return null;
  const n = parseFloat(first[1]);
  return Number.isNaN(n) ? null : Math.round(n);
}

/** Extract course codes from text. Handles "CS 10", "ES 2", "MATH 32", "MATH/CS 61" */
function extractCourseCodes(text: string): string[] {
  if (!text || text.trim() === "") return [];
  const codes = new Set<string>();
  const regex = /\b([A-Z][A-Za-z]*)(?:\/([A-Z][A-Za-z]*))?\s+(\d+)\b/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(text)) !== null) {
    const subj1 = m[1];
    const subj2 = m[2];
    const num = m[3];
    if (subj2) {
      codes.add(`${subj1}${num}`);
      codes.add(`${subj2}${num}`);
    } else {
      codes.add(`${subj1}${num}`);
    }
  }
  return [...codes];
}

/** Resolve extracted id (e.g. CS15) to a DB id from existingIds (e.g. CS0015). */
function resolveToExistingId(extractedId: string, existingIds: Set<string>): string | null {
  if (existingIds.has(extractedId)) return extractedId;
  const match = extractedId.match(/^([A-Za-z\/]+)(\d+)$/i);
  if (match) {
    const [, subj, num] = match;
    const padded = `${subj}${num.padStart(4, "0")}`;
    const stripped = `${subj}${parseInt(num, 10)}`;
    if (existingIds.has(padded)) return padded;
    if (existingIds.has(stripped)) return stripped;
  }
  return null;
}

/** Build prereq raw text from requirements + description (Recommendations, Prerequisite) */
function buildPrereqRawText(entry: CourseEntry): string {
  const parts: string[] = [];
  if (entry.requirements?.trim()) parts.push(entry.requirements.trim());
  const desc = entry.description || "";
  const recMatch = desc.match(/(?:Recommendations?|Prerequisite)[:\s]+([^.]+)/i);
  if (recMatch) parts.push(recMatch[1].trim());
  return parts.join(". ");
}

/** Generate a CUID-like id */
function genId(): string {
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 11)}`;
}

/** Build prereq tree. Uses raw SQL; requires deferrable FK migration. */
async function createPrereqWithCourses(
  prisma: PrismaClient,
  courseId: string,
  rawText: string,
  validIds: string[],
  _existingCourseIds: Set<string>
) {
  const hasCourses = validIds.length > 0;

  if (!rawText?.trim() && validIds.length === 0) return;

  const raw = rawText?.trim() || null;
  const rootId = genId();
  const exprId = genId();

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    if (hasCourses && validIds.length === 1) {
      await tx.$executeRaw`
        INSERT INTO prereq_nodes (id, expression_id, node_type, course_id, created_at, updated_at)
        VALUES (${rootId}, ${exprId}, 'COURSE', ${validIds[0]}, ${now}, ${now})
      `;
    } else if (hasCourses && validIds.length > 1) {
      await tx.$executeRaw`
        INSERT INTO prereq_nodes (id, expression_id, node_type, created_at, updated_at)
        VALUES (${rootId}, ${exprId}, 'OR', ${now}, ${now})
      `;
      for (let i = 0; i < validIds.length; i++) {
        const childId = genId();
        await tx.$executeRaw`
          INSERT INTO prereq_nodes (id, expression_id, parent_node_id, position, node_type, course_id, created_at, updated_at)
          VALUES (${childId}, ${exprId}, ${rootId}, ${i}, 'COURSE', ${validIds[i]}, ${now}, ${now})
        `;
      }
    } else {
      await tx.$executeRaw`
        INSERT INTO prereq_nodes (id, expression_id, node_type, condition_text, created_at, updated_at)
        VALUES (${rootId}, ${exprId}, 'CONDITION', ${raw}, ${now}, ${now})
      `;
    }

    await tx.$executeRaw`
      INSERT INTO prereq_expressions (id, course_id, raw_text, root_node_id, created_at, updated_at)
      VALUES (${exprId}, ${courseId}, ${raw}, ${rootId}, ${now}, ${now})
    `;
  });
}

async function main() {
  const jsonPath = path.join(process.cwd(), "cs_courses.json");
  if (!fs.existsSync(jsonPath)) {
    console.error("cs_courses.json not found at", jsonPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, "utf-8")) as CoursesJson;
  const entries = Object.entries(data).filter(([k]) => parseCourseKey(k) !== null);

  console.log(`Found ${entries.length} courses to seed`);

  const createdIds = new Set<string>();

  for (const [key, entry] of entries) {
    const parsed = parseCourseKey(key);
    if (!parsed) continue;

    const { id, subject, number } = parsed;
    const credits = parseCredits(entry.units);

    await prisma.course.upsert({
      where: { id },
      update: {
        title: entry.title || null,
        credits,
      },
      create: {
        id,
        subject,
        number,
        title: entry.title || null,
        credits,
      },
    });
    createdIds.add(id);
  }

  console.log(`Upserted ${createdIds.size} courses`);

  for (const [key, entry] of entries) {
    const parsed = parseCourseKey(key);
    if (!parsed) continue;
    const { id } = parsed;

    const rawText = buildPrereqRawText(entry);
    let extractedIds = extractCourseCodes(rawText);
    extractedIds = extractedIds.filter((cid) => cid !== id && cid !== `${parsed.subject}${parseInt(parsed.number, 10)}`);
    const validIds = extractedIds.map((eid) => resolveToExistingId(eid, createdIds)).filter((x): x is string => x !== null);

    if (!rawText && validIds.length === 0) continue;

    await prisma.prereqExpression.deleteMany({ where: { courseId: id } });

    await createPrereqWithCourses(prisma, id, rawText, validIds, createdIds);
  }

  console.log("Prerequisites seeded");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
