export type FileInfo = { path: string; lang: string; exports?: string[]; imports?: string[] };

export type PlanStep = {
  id: string;
  title: string;
  rationale: string;
  targetFiles: string[];
  instructions: string[];
  acceptanceCriteria: string[];
  risk: "low" | "medium" | "high";
  estimatedEffort: "S" | "M" | "L";
  dependsOn?: string[];
};

export type Plan = {
  goal: string;
  repoSummary: { files: FileInfo[] };
  steps: PlanStep[];
  notes: string[];
};
