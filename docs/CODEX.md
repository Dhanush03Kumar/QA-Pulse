# CODEX.md — QA Nexus (Figma-Exported UI → Functional App)

## Mission
The UI in this project was exported directly from Figma and is the frozen,
correct source of truth — it does NOT need to be redesigned, restyled, or
visually improved. Your job is to make it functional: wire up state, data,
routing, and logic WITHOUT changing how anything looks or is structured
visually, unless a change is strictly required to make something work
(e.g. turning a static list into a mapped list) — and even then, the
rendered output must look pixel-identical to before.

## Critical rule — read this first
Before touching any exported component, treat its current JSX structure,
className list, and inline styles as correct and untouchable by default.
If implementing a feature seems to require changing markup/styling, stop
and explain why before doing it — don't assume functionality requires a
visual change.

## Stack
React + TypeScript + Vite (confirm exact exported config on first read).
Add only what's needed to make things functional: state management
(local component state preferred), IndexedDB + Dexie for persistence,
React Hook Form + Zod for forms, React Router for navigation — same
constraints as before, don't introduce Redux/Zustand/other libraries
without justification.

## Session 1 — mandatory first step
Before wiring any functionality, do an honest structural assessment:
1. Is the exported code clean, semantic React (reusable components, props,
   reasonable structure), or is it a flat pile of absolute-positioned divs
   typical of Figma-to-code plugin output?
2. If it's messy: propose a light cleanup pass (extract obviously-repeated
   markup into components, replace any hardcoded Figma placeholder data
   with props/state placeholders) that preserves the EXACT visual output —
   confirm this with a before/after screenshot comparison, not just a
   claim. Get approval before doing this cleanup.
3. If it's already reasonably clean: skip cleanup, proceed straight to
   wiring functionality feature by feature.
Report findings and wait for direction before writing any code.

## Principles
Simplicity > Maintainability > Readability > Consistency. No enterprise
architecture — single user, local-first. Small changes/PRs/commits.

## Rules
1. Only touch files required for the task — no unrelated refactoring
2. NEVER change className, inline styles, or JSX structure unless the
   functional change genuinely requires it — and if so, say so explicitly
   before doing it
3. Don't rename files or move between folders unless asked
4. Don't add new libraries without justification — use existing deps
5. No premature abstraction — only abstract after 3+ repeats
6. Local component state preferred. Context only for Theme, Notifications,
   Global Search. No Redux/Zustand.
7. Preserve current folder structure
8. Before declaring any task finished, you MUST run `npx tsc --noEmit` and
   `npm run build`, and paste the actual command output in your response.
   Never state "no errors" or "builds successfully" without that output
   shown in the same response.
9. No task-tracking files. Do not create current_task.md, sprint docs, or
   any progress-log file. Track work via git history and /build-feature
   plans only.

## File creation policy — STRICT
- Before creating any new file, search the codebase for existing files
  that already do this or something similar. Prefer extending/refactoring
  an existing file over creating a new one.
- Never create a second version of something that already exists
  (e.g. TaskTable, TaskTableV2). Fix the existing implementation in place.
- If a new file is genuinely necessary, state why before creating it.

## Data & backups
Data lives only in browser IndexedDB — it does not travel with the code
across machines or versions. Export/Import (backup to JSON / restore from
JSON) is a core feature, not optional polish. Any Dexie schema change must
bump the version number and include a migration where feasible.

## Verification approach — visual regression, not Figma comparison
Since the UI already came from Figma, you don't need to check "does this
match the design" — it already does. What you DO need to check: did this
functional change accidentally alter the visual output? Use /regression-
check (screenshot before vs. after) whenever a change touches a component
that renders UI, not just logic-only files.

## Available skills
- `/build-feature` — plan → approve → implement (UI-preserving) → build-verify
- `/fix-error` — fix one specific pasted error, minimal scope, no styling changes
- `/code-check` — read-only build verification, no fixes
- `/regression-check` — before/after screenshot comparison to catch accidental visual breakage
- `/peer-review` — independent skeptical review before you commit
- `/resume` — recover accurate state after a crash/timeout

## Response format
Summary → Files Modified → Verification output (tsc + build, actual text)
→ Visual impact (did this touch anything that renders UI? if yes, was a
regression check done?) → Why (short).

## If unsure
Stop. Explain options. Ask before any decision that could affect the UI's
visual output or the app's architecture.
