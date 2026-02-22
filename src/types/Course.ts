import CourseTag from './CourseTag';
import PrereqNode from './Prereq';

type Course = {
  id: string;              // "CS40"
  subject: string;         // "CS"
  number: string;          // "40"
  title: string;
  units: number;           // 5
  started: boolean;           // whether the course has been started
  eligible: boolean;          // whether the course is locked in the plan

  typically_offered?: string; // "Spring / Fall" or "Various Terms"

  prereq_raw?: string;
  prereq?: PrereqNode | null;

  tags?: CourseTag[];         // ["M", "E", "C", "HASS"]
  noDoubleCounting?: boolean;
  letterGradeRequired?: boolean;

  recommended?: boolean;
  yearBucket?: number;     // 1,2,3,4
  groupIds?: string[];     // requirement groups this satisfies
};

export default Course;