type PrereqNode = (
  | {
    type: "AND" | "OR";
    children: PrereqNode[];
  }
  | {
    type: "MIN_K";
    k: number;
    children: PrereqNode[];
  }
  | {
    type: "COURSE";
    courseId: string;
  }
  | {
    type: "CONDITION";
    text: string;
  }
);

export default PrereqNode;
