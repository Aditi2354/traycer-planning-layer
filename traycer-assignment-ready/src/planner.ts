import crypto from "crypto";
import { Plan, PlanStep, FileInfo } from "./types";

function id() { return crypto.randomBytes(4).toString("hex"); }

function derivePatternsFromGoal(goal: string): RegExp {
  const g = goal.toLowerCase();
  const keys: string[] = [];

  if (/(dark\s*mode|theme|light\s*\/\?\s*dark|color\s*scheme)/i.test(g)) {
    keys.push("dark", "theme", "toggle", "color", "scheme");
  }
  if (/(navbar|nav|header|app\s*bar|topbar)/i.test(g)) {
    keys.push("navbar", "header", "layout");
  }

  if (/(skeleton|loading|placeholder)/i.test(g)) {
    keys.push("skeleton", "loading", "placeholder");
  }

  if (/(axios|fetch|http|request)/i.test(g)) {
    keys.push("axios", "fetch", "api", "service");
  }

  // fallback
  if (keys.length === 0) keys.push("util", "config", "index", "app", "layout");

  return new RegExp(keys.map(k => k.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")).join("|"), "i");
}

function pick(paths: string[], rx: RegExp, fallback: string[]): string[] {
  const hits = paths.filter(p => rx.test(p));
  return hits.length ? hits : fallback;
}

export async function buildPlan(goal: string, repoSummary: { files: FileInfo[] }): Promise<Plan> {
  const rx = derivePatternsFromGoal(goal);
  const allPaths = repoSummary.files.map(f => f.path);

  const candidates = repoSummary.files.filter(f => rx.test(f.path)).slice(0, 20);
  const candidatePaths = candidates.map(c => c.path);

  const navbarTargets = pick(
    candidatePaths,
    /(navbar|header|app[-_/]?bar|topbar)/i,
    ["src/components/Navbar.tsx", "src/components/Header.tsx"]
  );

  const styleTargets = pick(
    allPaths,
    /(global\.css|globals\.css|styles?\/.*\.css|tailwind\.config\.(js|ts))/i,
    ["src/styles/global.css", "tailwind.config.js"]
  );

  const utilTargets = pick(
    allPaths,
    /(utils?\/.*theme.*\.(ts|tsx)|utils?\/.*(http|api|request).*\.(ts|tsx))/i,
    ["src/utils/theme.ts"]
  );

  // Simple branching on common goals to adjust wording
  const isDarkMode = /dark\s*mode|theme/i.test(goal);

  const steps: PlanStep[] = isDarkMode ? [
    {
      id: id(),
      title: "Inventory theme entry points & Navbar mount",
      rationale: "Dark mode ke liye pehle relevant touchpoints identify karna zaroori hai.",
      targetFiles: [...new Set([...candidatePaths, ...navbarTargets, ...styleTargets]).values()],
      instructions: [
        "Search terms: 'Navbar', 'Header', 'ThemeProvider', 'dark', 'tailwind.config', 'global.css'.",
        "List all files where theme ya color-scheme handle ho raha hai."
      ],
      acceptanceCriteria: [
        "A checklist of affected components/styles is added to plan notes.",
        "No obvious Navbar/theme file is missed (spot-check by search)."
      ],
      risk: "low", estimatedEffort: "S"
    },
    {
      id: id(),
      title: "Introduce theme manager utility",
      rationale: "Centralized toggle logic → reusable & testable.",
      targetFiles: utilTargets,
      instructions: [
        "Create/extend 'src/utils/theme.ts' with: getPreferredTheme(), applyTheme(theme), toggleTheme().",
        "Implement: data-theme attribute on <html>, media query '(prefers-color-scheme: dark)'.",
        "Persist choice via localStorage (key: 'theme')."
      ],
      acceptanceCriteria: [
        "Toggling works without page reload.",
        "Theme preference persists across refresh and new tabs.",
        "No TypeScript errors."
      ],
      risk: "low", estimatedEffort: "S"
    },
    {
      id: id(),
      title: "Wire Navbar toggle control",
      rationale: "User-facing switch is needed to trigger theme changes.",
      targetFiles: navbarTargets,
      instructions: [
        "Add a toggle button/icon in Navbar; onClick → toggleTheme().",
        "Use accessible pattern: role='switch' or aria-pressed; visible focus states.",
        "Show current state (icon/sr-only text) based on data-theme."
      ],
      acceptanceCriteria: [
        "Toggle is keyboard-accessible.",
        "Navbar reflects theme instantly on click.",
        "No layout shift/regression."
      ],
      risk: "medium", estimatedEffort: "M"
    },
    {
      id: id(),
      title: "Define light/dark design tokens & Tailwind config",
      rationale: "Consistent colors via CSS vars/Tailwind prevents drift.",
      targetFiles: styleTargets,
      instructions: [
        "In global.css: define :root vars for light, and [data-theme='dark'] overrides.",
        "Tailwind: set darkMode: 'class'; map colors to CSS vars where applicable.",
        "Audit key components (Navbar, body bg, text, links) to use tokens."
      ],
      acceptanceCriteria: [
        "Both themes readable with sufficient contrast (WCAG AA for text).",
        "No hardcoded hex colors remain in Navbar.",
        "Tailwind builds successfully."
      ],
      risk: "medium", estimatedEffort: "M"
    },
    {
      id: id(),
      title: "Add tests & guardrails",
      rationale: "Prevent regressions and enforce correct theme usage.",
      targetFiles: ["src/**/__tests__/*.test.{ts,tsx}", ".eslintrc.*"],
      instructions: [
        "Unit tests: theme util functions (applyTheme/toggleTheme).",
        "Component test: Navbar renders correct icon/state under both themes.",
        "ESLint rule/config: forbid hardcoded color literals in specified folders."
      ],
      acceptanceCriteria: [
        "Tests pass locally/CI.",
        "ESLint flags hardcoded colors if reintroduced."
      ],
      risk: "medium", estimatedEffort: "M"
    }
  ] : [
    {
      id: id(),
      title: "Clarify scope & find relevant files",
      rationale: "Right files ko target kiye bina plan flaky hoga.",
      targetFiles: [...new Set([...candidatePaths]).values()],
      instructions: [
        "Search by goal keywords across repo; list affected files.",
        "Confirm scope with brief notes (what’s in/out)."
      ],
      acceptanceCriteria: [
        "Short scope note present.",
        "At least 3 likely target files identified (or rationale if fewer)."
      ],
      risk: "low", estimatedEffort: "S"
    },
    {
      id: id(),
      title: "Introduce supporting utility/module",
      rationale: "Centralize logic to avoid duplication.",
      targetFiles: utilTargets.length ? utilTargets : ["src/utils/index.ts"],
      instructions: [
        "Create/extend utility with minimal API for this goal.",
        "Add unit tests for the utility."
      ],
      acceptanceCriteria: [
        "No TS errors; tests pass.",
        "Call sites can import the utility cleanly."
      ],
      risk: "low", estimatedEffort: "S"
    },
    {
      id: id(),
      title: "Refactor target components/services",
      rationale: "Apply utility and remove ad-hoc patterns.",
      targetFiles: candidatePaths,
      instructions: [
        "Replace ad-hoc logic with utility calls.",
        "Keep changes small and commit logically."
      ],
      acceptanceCriteria: [
        "No runtime regressions in changed areas.",
        "Type checks pass across refactored files."
      ],
      risk: "medium", estimatedEffort: "M"
    },
    {
      id: id(),
      title: "Add tests & guardrails",
      rationale: "Prevent regressions for this goal’s patterns.",
      targetFiles: ["src/**/__tests__/*.test.{ts,tsx}", ".eslintrc.*"],
      instructions: [
        "Write tests covering new behavior.",
        "Lint/CI check for anti-patterns linked to this goal."
      ],
      acceptanceCriteria: [
        "Tests pass locally/CI.",
        "ESLint flags known anti-patterns if reintroduced."
      ],
      risk: "medium", estimatedEffort: "M"
    }
  ];

  return {
    goal,
    repoSummary,
    steps,
    notes: [
      "Planner auto-focuses on files matching goal-derived keywords.",
      "You can reorder/remove steps before export."
    ]
  };
}
