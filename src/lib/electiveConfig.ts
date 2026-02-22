/**
 * Elective configuration - defines UI and rules for each elective type.
 * Each elective has a different interface based on its requirements.
 */

export type ElectiveInputType = "free-text" | "course-picker" | "multi-slot";

export type ElectiveCategory = "mns" | "hass" | "ce";

export type ElectiveConfig = {
  slug: string;
  title: string;
  inputType: ElectiveInputType;
  /** Number of slots for multi-slot electives (e.g. BIO-CHEM-PHY = 2) */
  count?: number;
  /** Min SHU per slot */
  minSHU?: number;
  tags: string[];
  /** Course codes that count toward this elective (displayed in Eligible section) */
  eligibleCourses?: string[];
  /** Course codes that do NOT count (displayed in NOT Eligible section) */
  notEligibleCourses?: string[];
  /** Fallback text when no course lists */
  eligibleText?: string;
  notEligibleText?: string;
  notes: string[];
  /** For course-picker: options to choose from */
  options?: { value: string; label: string }[];
  /** For multi-slot: constraint description (e.g. "from different departments") */
  slotConstraint?: string;
  category: ElectiveCategory;
  shuTotal: number;
};

export const ELECTIVE_CONFIGS: ElectiveConfig[] = [
  {
    slug: "bio-chem-phy",
    title: "BIO-CHEM-PHY Electives",
    inputType: "multi-slot",
    count: 2,
    minSHU: 5,
    tags: ["Spring / Fall", "5 SHU each", "C- or Better", "NO Double Counting"],
    eligibleCourses: ["PHY 11", "CHEM 1", "CHEM 11", "CHEM 16", "BIO 13", "BIO 14"],
    notEligibleText: "BIO 13 cannot be taken in the first year",
    notes: ["Choose two courses from different departments"],
    slotConstraint: "Must be from different departments (BIO, CHEM, PHY)",
    category: "mns",
    shuTotal: 34,
  },
  {
    slug: "mns",
    title: "MNS Elective",
    inputType: "free-text",
    minSHU: 3,
    tags: ["Spring / Fall", "≥3 SHU", "C- or Better", "NO Double Counting"],
    eligibleText: "Any course with SOE-Mathematics or SOE-Natural Sciences attribute",
    notes: ["May not be used to fulfill any other course requirement"],
    category: "mns",
    shuTotal: 34,
  },
  {
    slug: "prob-stat",
    title: "Probability & Statistics Elective",
    inputType: "course-picker",
    minSHU: 3,
    tags: ["Spring / Fall", "≥3 SHU", "C- or Better", "NO Double Counting"],
    eligibleCourses: ["MATH 166", "ES 56", "EE 24", "EE 104", "BME 141", "PHY 153"],
    notes: ["May not be used to fulfill any other course requirement"],
    options: [
      { value: "MATH 166", label: "MATH 166" },
      { value: "ES 56", label: "ES 56" },
      { value: "EE 24", label: "EE 24" },
      { value: "EE 104", label: "EE 104" },
      { value: "BME 141", label: "BME 141" },
      { value: "PHY 153", label: "PHY 153" },
    ],
    category: "mns",
    shuTotal: 34,
  },
  {
    slug: "humanities",
    title: "Humanities Elective",
    inputType: "free-text",
    minSHU: 3,
    tags: ["Spring / Fall", "3 SHU", "C- or Better", "NO Double Counting"],
    eligibleText: "Any course having attribute SOE-HASS-Humanities",
    notes: [
      "Requirement may not be satisfied with:",
      "Pre-matriculation credits, ENG 1, ENG 3",
      "A course satisfying the Social Sciences Elective",
      "A course satisfying the Ethics & Social Context Elective",
    ],
    category: "hass",
    shuTotal: 24,
  },
  {
    slug: "social-science",
    title: "Social Science Elective",
    inputType: "free-text",
    minSHU: 3,
    tags: ["Spring / Fall", "3 SHU", "Letter Grade", "NO Double Counting"],
    eligibleText: "Any course having attribute SOE-HASS-Social Sciences",
    notes: [
      "Requirement may not be satisfied with:",
      "Pre-matriculation credits",
      "A course satisfying the Humanities Elective",
      "A course satisfying the Ethics & Social Context Elective",
      "Technical Writing (EM 52)",
    ],
    category: "hass",
    shuTotal: 24,
  },
  {
    slug: "ethics-social-context",
    title: "Ethics & Social Context Elective",
    inputType: "course-picker",
    minSHU: 3,
    tags: ["Spring / Fall", "3-4 SHU", "C- or Better", "NO Double Counting"],
    eligibleCourses: ["PHIL 24", "EM 54"],
    notes: [],
    options: [
      { value: "PHIL 24", label: "PHIL 24 - Ethics & Social Context" },
      { value: "EM 54", label: "EM 54 - Ethics & Social Context" },
    ],
    category: "hass",
    shuTotal: 24,
  },
  {
    slug: "eng-cs",
    title: "ENG-CS Elective",
    inputType: "course-picker",
    minSHU: 3,
    tags: ["Spring / Fall", "≥3 SHU", "Letter Grade", "NO Double Counting"],
    eligibleText: "ES 2 or any course with SOE-Computing or SOE-Engineering attribute (≥3 SHU)",
    notes: ["May not be used to fulfill any other course requirement"],
    options: [
      { value: "ES 2", label: "ES 2 - Intro. Computing in Eng." },
      { value: "other", label: "Other ENG-CS Elective (enter below)" },
    ],
    category: "ce",
    shuTotal: 55,
  },
  {
    slug: "systems",
    title: "Systems Elective",
    inputType: "multi-slot",
    count: 2,
    minSHU: 3,
    tags: ["Spring / Fall", "3 SHU", "C- or Better", "NO Double Counting"],
    eligibleCourses: ["ES 4", "EE 14", "EE 20", "CS 45"],
    notEligibleCourses: ["CS 111", "CS 112", "CS 114", "CS 116", "CS 117", "CS 118", "CS 119", "CS 120", "CS 121", "CS 122", "CS 124", "CS 140", "CS 146", "CS 147"],
    notes: [],
    options: [
      { value: "ES 4", label: "ES 4" },
      { value: "EE 14", label: "EE 14" },
      { value: "EE 20", label: "EE 20" },
      { value: "CS 45", label: "CS 45" },
      { value: "CS 111", label: "CS 111" },
      { value: "CS 112", label: "CS 112" },
      { value: "CS 114", label: "CS 114" },
      { value: "CS 116", label: "CS 116" },
      { value: "CS 117", label: "CS 117" },
      { value: "CS 118", label: "CS 118" },
      { value: "CS 119", label: "CS 119" },
      { value: "CS 120", label: "CS 120" },
      { value: "CS 121", label: "CS 121" },
      { value: "CS 122", label: "CS 122" },
      { value: "CS 124", label: "CS 124" },
      { value: "CS 140", label: "CS 140" },
      { value: "CS 146", label: "CS 146" },
      { value: "CS 147", label: "CS 147" },
    ],
    category: "ce",
    shuTotal: 55,
  },
  {
    slug: "cs-elective-j",
    title: "CS Elective (j)",
    inputType: "multi-slot",
    count: 2,
    minSHU: 3,
    tags: ["Spring / Fall", "≥3 SHU each", "Letter Grade", "NO Double Counting"],
    eligibleText: "CS courses numbered 100-179, excluding CS 153-155",
    notes: ["May not be used to fulfill any other course requirement"],
    category: "ce",
    shuTotal: 55,
  },
  {
    slug: "cs-elective-k",
    title: "CS Elective (k)",
    inputType: "free-text",
    minSHU: 3,
    tags: ["Spring / Fall", "≥3 SHU", "Letter Grade", "NO Double Counting"],
    eligibleText: "CS courses 16-199, excluding CS 53-55, 61, 97-99, 153-155, 182-188",
    notes: ["May not be used to fulfill any other course requirement"],
    category: "ce",
    shuTotal: 55,
  },
  {
    slug: "cs-elective-l",
    title: "CS Elective (l)",
    inputType: "free-text",
    minSHU: 3,
    tags: ["Spring / Fall", "≥3 SHU", "Letter Grade", "NO Double Counting"],
    eligibleText: "CS 16-179 (excl. 53-55, 61, 93-99, 153-155) or MATH 42, 44, 51, 63, 70, 72, etc.",
    notes: ["May not be used to fulfill any other course requirement"],
    category: "ce",
    shuTotal: 55,
  },
  {
    slug: "cs-social-context",
    title: "CS Social Context Elective",
    inputType: "course-picker",
    minSHU: 2,
    tags: ["Spring / Fall", "≥2 SHU", "Letter Grade", "NO Double Counting"],
    eligibleText: "Select from approved list",
    notes: ["May not be used to fulfill any other course requirement"],
    options: [
      { value: "CS 27", label: "CS 27" },
      { value: "CS 28", label: "CS 28" },
      { value: "CS 55", label: "CS 55" },
      { value: "CS 116", label: "CS 116" },
      { value: "CS 120", label: "CS 120" },
      { value: "CS 139", label: "CS 139" },
      { value: "CS 155", label: "CS 155" },
      { value: "CS 182", label: "CS 182-188" },
    ],
    category: "ce",
    shuTotal: 55,
  },
  {
    slug: "breadth",
    title: "Breadth Electives",
    inputType: "free-text",
    minSHU: 6,
    tags: ["Spring / Fall", "≥6 SHU", "Letter Grade", "NO Double Counting"],
    eligibleText: "SOE-HASS, BME 50, CEE 32, ME 10/20/30/40/50, ENP/ENT/EM, CS 99, ES 85, EXP, PE",
    notes: ["Beyond SOE HASS requirement", "May not satisfy any other requirement"],
    category: "hass",
    shuTotal: 24,
  },
];

export function getElectiveConfig(slug: string): ElectiveConfig | undefined {
  return ELECTIVE_CONFIGS.find((c) => c.slug === slug);
}

export function getAllElectiveSlugs(): string[] {
  return ELECTIVE_CONFIGS.map((c) => c.slug);
}

/** Map course title (from degree parser) to elective slug for navigation */
const TITLE_TO_SLUG: Record<string, string> = {
  "Humanities Elective": "humanities",
  "Social Science Elective": "social-science",
  "Ethics & Social Context Elective": "ethics-social-context",
  "BIO-CHEM-PHY Electives": "bio-chem-phy",
  "BIO-CHEM-PHY Electives (1)": "bio-chem-phy",
  "BIO-CHEM-PHY Electives (2)": "bio-chem-phy",
  "MNS Elective": "mns",
  "Probability & Statistics Elective": "prob-stat",
  "Intro Computing in Engineering OR Engineering/Computing Elective": "eng-cs",
  "ES 2 / ENG-CS Elective": "eng-cs",
  "Systems Elective": "systems",
  "Systems Elective (1)": "systems",
  "Systems Elective (2)": "systems",
  "CS Elective (j)": "cs-elective-j",
  "CS Elective (j) (1)": "cs-elective-j",
  "CS Elective (j) (2)": "cs-elective-j",
  "CS Elective (k)": "cs-elective-k",
  "CS Elective (l)": "cs-elective-l",
  "CS Social Context Elective (m)": "cs-social-context",
  "Breadth Electives": "breadth",
  "Breadth Electives (1)": "breadth",
  "Breadth Electives (2)": "breadth",
};

export function getElectiveSlugFromTitle(title: string): string | undefined {
  return TITLE_TO_SLUG[title];
}
