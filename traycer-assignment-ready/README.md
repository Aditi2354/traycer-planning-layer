# traycer-lite (multi-plan batch)

**Plan here, execute anywhere.** A TypeScript CLI that turns one or **many** natural-language goals into file-aware, step-by-step plans and exports agent-ready JSON.

## Features
- Repo scan → lightweight code map
- Goal → plan (rationale, targets, acceptance criteria)
- **Batch mode**: generate multiple plans in one run
- Interactive refine (remove steps) or `--yes` non-interactive
- Per-plan JSON + a manifest `plans/index.json`

## Quick start
```bash
npm i
# Single plan (interactive)
npx ts-node src/index.ts "Add dark mode to Navbar"

# Batch (non-interactive)
npx ts-node src/index.ts --yes --goals "Add dark mode to Navbar|Add loading skeleton to Products page|Migrate axios to fetch"
# Or read from file:
# goals.txt:
# Add dark mode to Navbar
# Add loading skeleton to Products page
# Migrate axios to fetch
npx ts-node src/index.ts --yes --goals-file goals.txt
```

Outputs will be written to `./plans/*.json` with `plans/index.json` manifest.
