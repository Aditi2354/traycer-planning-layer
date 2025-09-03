//!/usr/bin/env node
import fs from "fs";
import path from "path";
import { analyzeRepo } from "./repoAnalyzer";
import { buildPlan } from "./planner";
import { refinePlanInteractive } from "./refiner";
import { exportPlan } from "./exporter";

type CLI = {
  goals: string[];
  yes: boolean;
  outDir: string;
};

function parseCLI(argv: string[]): CLI {
  const args = argv.slice(2);
  let goals: string[] = [];
  let yes = false;
  let outDir = "plans";

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--yes" || a === "-y") yes = true;
    else if (a === "--out" || a === "-o") { outDir = args[++i] ?? outDir; }
    else if (a === "--goals") {
      const val = args[++i] ?? "";
      goals = val.split("|").map(s => s.trim()).filter(Boolean);
    } else if (a === "--goals-file") {
      const p = args[++i];
      const text = fs.readFileSync(p, "utf8");
      goals = text.split(/\r?\n/).map(l => l.trim()).filter(l => l && !l.startsWith("#"));
    } else {
      // positional goal
      goals.push(a);
    }
  }

  if (goals.length === 0) {
    goals = ["Refactor button props to shallow-merge deprecated & new slotProps"];
  }
  return { goals, yes, outDir };
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60) || "plan";
}

async function main() {
  const cli = parseCLI(process.argv);

  console.log("🧭 Goals:", cli.goals.map(g => `"${g}"`).join(", "));
  const repo = await analyzeRepo(process.cwd());

  const manifest: { goal: string; file: string }[] = [];
  for (const goal of cli.goals) {
    const plan = await buildPlan(goal, repo);
    const finalPlan = cli.yes ? plan : await refinePlanInteractive(plan);
    const fname = path.join(cli.outDir, `${slug(goal)}.json`);
    const out = await exportPlan(finalPlan, { format: "agent-json", file: fname });
    console.log(`✅ Plan ready: ${out.path}`);
    manifest.push({ goal, file: out.path });
  }

  // write a manifest to list all batch outputs
  fs.mkdirSync(cli.outDir, { recursive: true });
  const manifestPath = path.join(cli.outDir, "index.json");
  fs.writeFileSync(manifestPath, JSON.stringify({ plans: manifest }, null, 2), "utf8");
  console.log(`📦 Manifest written: ${manifestPath}`);
  console.log("➡️  Hand these JSON files to your coding agent (Cursor/Claude Code).");
}

main().catch(err => { console.error(err); process.exit(1); });
