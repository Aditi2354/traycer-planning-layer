import fs from "fs";
import path from "path";
import { Plan } from "./types";

export async function exportPlan(plan: Plan, opts: { format: "agent-json", file: string }) {
  const agentPayload = {
    kind: "plan.v1",
    goal: plan.goal,
    steps: plan.steps.map(s => ({
      id: s.id,
      title: s.title,
      rationale: s.rationale,
      targets: s.targetFiles,
      instructions: s.instructions,
      acceptance: s.acceptanceCriteria,
      dependsOn: s.dependsOn ?? []
    })),
    repoHints: plan.repoSummary.files.slice(0, 50),
    notes: plan.notes
  };

  fs.mkdirSync(path.dirname(opts.file), { recursive: true });
  fs.writeFileSync(opts.file, JSON.stringify(agentPayload, null, 2), "utf8");
  return { path: opts.file };
}
