import { PrereqNode } from "./prereq"

export type CourseStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PLANNED";

export interface Course {
  id: string;              // "CS40"
  subject: string;         // "CS"
  number: string;          // "40"
  title: string;
  units: number;           // 5

  typically_offered?: string; // "Spring / Fall" or "Various Terms"

  prereq_raw?: string;
  prereq?: PrereqNode | null;

  tags?: string[];         // ["M", "E", "C", "HASS"]
  noDoubleCounting?: boolean;
  letterGradeRequired?: boolean;

  recommended?: boolean;
  yearBucket?: number;     // 1,2,3,4
  groupIds?: string[];     // requirement groups this satisfies
}