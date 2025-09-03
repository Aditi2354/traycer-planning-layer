# Traycer-style Planning Layer — Submission Notes

## What to review
- **TypeScript CLI** showing a *planning layer* separated from execution:
  - Repo scan → file-aware plan steps (targets, rationale, acceptance criteria)
  - Interactive refine (remove steps) or `--yes` batch mode
  - Agent-ready JSON export for Cursor/Claude Code/etc.
- **Batch generation** of multiple plans in one run

## How to run
```bash
npm i
# Single plan
npx ts-node src/index.ts "Add dark mode to Navbar"
# Batch from file
npx ts-node src/index.ts --yes --goals-file goals.txt
```

## Why this matches the brief
- Distills Traycer’s vision: *Plan here, execute anywhere*
- Clean, modular TS code (`repoAnalyzer`, `planner`, `refiner`, `exporter`)
- Creative touches: goal-derived file targeting, acceptance criteria, batch mode, manifest
