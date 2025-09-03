import inquirer from "inquirer";
import { Plan } from "./types";

export async function refinePlanInteractive(plan: Plan): Promise<Plan> {
  console.log("\n📋 Proposed Plan:");
  plan.steps.forEach((s, i) => console.log(`  [${i+1}] ${s.title} (${s.estimatedEffort}) → ${s.targetFiles.join(", ")}`));

  const { toRemove } = await inquirer.prompt([{
    type: "checkbox",
    name: "toRemove",
    message: "Remove any steps? (space to toggle, enter to confirm)",
    choices: plan.steps.map(s => ({ name: s.title, value: s.id }))
  }]);

  plan.steps = plan.steps.filter(s => !(toRemove as string[]).includes(s.id));
  return plan;
}
