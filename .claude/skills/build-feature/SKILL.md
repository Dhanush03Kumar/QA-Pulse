---
name: build-feature
description: Plans and implements a feature or task completely, preserving the exported Figma UI exactly, with no duplicate files and build-verified correctness. Use when the user wants to build, implement, or complete a specific feature.
---

# Build Feature — plan, confirm, implement, verify

## Step 1 — Understand before planning
Read docs/CLAUDE.md as background context. Read the actual relevant
source files yourself — do not trust prior session summaries or plan
files as current truth without spot-checking them.

## Step 2 — Preserve the exported UI, and search before creating
The JSX structure, className list, and inline styles of exported
components are correct and untouchable by default — they came from
Figma. Only add: state, props, event handlers, data fetching/wiring,
conditional rendering logic (e.g. loading/empty/error states) using the
SAME markup pattern already present. If you believe visual/structural
change is genuinely required, stop and flag it explicitly in the plan —
don't silently restyle. Before proposing any new file, search the codebase
for existing files/components/services that already do this or something
similar. Prefer extending an existing file over creating a new one.

## Step 3 — Propose a plan, then stop
Present:
- What the feature requires, in plain terms
- Exactly which files will be modified (should rarely need new files,
  since UI already exists — flag clearly if a new file is proposed)
- Confirmation that markup/styling will remain unchanged, or an explicit
  flag if it can't
- The approach — reusing existing patterns/helpers/state
- Anything ambiguous or requiring a decision

Do not write code yet. Wait for explicit approval.

## Step 4 — Implement in one continuous pass
Once approved, implement the whole feature without stopping for
check-ins, unless you hit something genuinely ambiguous. Stay strictly
within the approved file list.

## Step 5 — Verify by actually running the build, not by reading
1. Change to the project root directory (by executing: dir="$PWD"; while [ ! -f "$dir/package.json" ] && [ ! -f "$dir/tsconfig.json" ] && [ "$dir" != "/" ]; do dir=$(dirname "$dir"); done; cd "$dir") and run the project's type-check command (e.g. `npx tsc --noEmit`) — show full actual output.
2. Change to the project root directory (by executing: dir="$PWD"; while [ ! -f "$dir/package.json" ] && [ ! -f "$dir/tsconfig.json" ] && [ "$dir" != "/" ]; do dir=$(dirname "$dir"); done; cd "$dir") and run the build command (e.g. `npm run build`) — show full actual output.
3. Only report success if both actually pass, with evidence shown.

## Step 6 — Report cleanly
End with:
- Files created / modified (should match the approved plan exactly)
- Confirmation type-check and build passed, with output shown
- Whether this change touched any UI-rendering component — if yes,
  recommend the user run /regression-check before committing
- Anything the user should manually verify in the browser

## What this skill requires as input
$ARGUMENTS