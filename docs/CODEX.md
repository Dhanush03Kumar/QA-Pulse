# CODEX.md ?? QA Nexus (FigmaExported UI ?? Functional App)

## Mission
The UI in this project was exported directly from Figma and is the frozen,
correct source of truth ?? it does NOT need to be redesigned, restyled, or
visually improved. Your job is to make it functional: wire up state, data,
routing, and logic WITHOUT changing how anything looks or is structured
visually, unless a change is strictly required to make something work
(e.g. turning a static list into a mapped list) ?? and even then, the
rendered output must look pixelidentical to before.

## Critical rule ?? read this first
Before touching any exported component, treat its current JSX structure,
className list, and inline styles as correct and untouchable by default.
If implementing a feature seems to require changing markup/styling, stop
and explain why before doing it ?? dont assume functionality requires a
visual change.

## Stack
React + TypeScript + Vite (confirm exact exported config on first read).
Add only whats needed to make things functional: state management
(local component state preferred), IndexedDB + Dexie for persistence,
React Hook Form + Zod for forms, React Router for navigation ?? same
constraints as before, dont introduce Redux/Zustand/other libraries
without justification.

## Text & character encoding ?? STRICT
This codebase has repeatedly picked up mojibake (e.g. `??????`) and wrong
character substitutions (semicolon for comma, stray/duplicate braces or
divs) from prior agent edits. To prevent this:
1. Use plain ASCII only in all code, JSX text nodes, strings, and comments.
   No curly/smart quotes, no em/en dashes, no ellipsis character, no non
   breaking spaces, no other typographic Unicode. Use `` not `??`/`??`,
   straight ``/`` not curly quotes, `...` not `???`, a normal space not
   U+00A0.
2. If content copied from a design tool, spec, or another file contains
   any nonASCII typographic characters, normalize them to plain ASCII
   equivalents before writing them into the codebase ?? never carry them
   through verbatim.
3. Every file you write or edit must be valid UTF8 with no BOM. Do not
   assume Latin1/Windows1252 anywhere in the toolchain.
4. Before declaring a task finished, reopen any file you edited and scan
   it for `\uFFFD`, `??????`, or any nonASCII character outside of strings
   that intentionally need it (e.g. genuine i18n content, if any). If
   found, fix it and say so in your response ?? dont silently patch and
   move on.
5. Make edits as small, targeted diffs rather than fullfile rewrites.
   Fullfile rewrites are the main source of duplicated braces/divs and
   dropped closing tags ?? if you must rewrite a whole file, reread the
   result afterward and diff it mentally against the original structure
   before declaring done.
6. If you notice mojibake or corrupted characters already present in a
   file youre touching (even if unrelated to your task), flag it in your
   response rather than silently leaving it or silently fixing it as a
   driveby edit.

## Session 1 ?? mandatory first step
Before wiring any functionality, do an honest structural assessment:
1. Is the exported code clean, semantic React (reusable components, props,
   reasonable structure), or is it a flat pile of absolutepositioned divs
   typical of Figmatocode plugin output?
2. If its messy: propose a light cleanup pass (extract obviouslyrepeated
   markup into components, replace any hardcoded Figma placeholder data
   with props/state placeholders) that preserves the EXACT visual output ??
   confirm this with a before/after screenshot comparison, not just a
   claim. Get approval before doing this cleanup.
3. If its already reasonably clean: skip cleanup, proceed straight to
   wiring functionality feature by feature.
Report findings and wait for direction before writing any code.

## Principles
Simplicity  Maintainability  Readability  Consistency. No enterprise
architecture ?? single user, localfirst. Small changes/PRs/commits.

## Rules
1. Only touch files required for the task ?? no unrelated refactoring
2. NEVER change className, inline styles, or JSX structure unless the
   functional change genuinely requires it ?? and if so, say so explicitly
   before doing it
3. Dont rename files or move between folders unless asked
4. Dont add new libraries without justification ?? use existing deps
5. No premature abstraction ?? only abstract after 3+ repeats
6. Local component state preferred. Context only for Theme, Notifications,
   Global Search. No Redux/Zustand.
7. Preserve current folder structure
8. Before declaring any task finished, you MUST run `npx tsc noEmit` and
   `npm run build`, and paste the actual command output in your response.
   Never state no errors or builds successfully without that output
   shown in the same response.
9. No tasktracking files. Do not create current_task.md, sprint docs, or
   any progresslog file. Track work via git history and /buildfeature
   plans only.

## File creation policy ?? STRICT
 Before creating any new file, search the codebase for existing files
  that already do this or something similar. Prefer extending/refactoring
  an existing file over creating a new one.
 Never create a second version of something that already exists
  (e.g. TaskTable, TaskTableV2). Fix the existing implementation in place.
 If a new file is genuinely necessary, state why before creating it.

## Data & backups
Data lives only in browser IndexedDB ?? it does not travel with the code
across machines or versions. Export/Import (backup to JSON / restore from
JSON) is a core feature, not optional polish. Any Dexie schema change must
bump the version number and include a migration where feasible.

## Verification approach ?? visual regression, not Figma comparison
Since the UI already came from Figma, you dont need to check does this
match the design ?? it already does. What you DO need to check: did this
functional change accidentally alter the visual output? Use /regression
check (screenshot before vs. after) whenever a change touches a component
that renders UI, not just logiconly files.

## Available skills
 `/buildfeature` ?? plan ?? approve ?? implement (UIpreserving) ?? buildverify
 `/fixerror` ?? fix one specific pasted error, minimal scope, no styling changes
 `/codecheck` ?? readonly build verification, no fixes
 `/regressioncheck` ?? before/after screenshot comparison to catch accidental visual breakage
 `/peerreview` ?? independent skeptical review before you commit
 `/resume` ?? recover accurate state after a crash/timeout

## Response format
Summary ?? Files Modified ?? Verification output (tsc + build, actual text)
?? Visual impact (did this touch anything that renders UI? if yes, was a
regression check done?) ?? Encoding check (did you scan for mojibake? any
found/fixed?) ?? Why (short).
A completion summary must be accompanied by git diff stat output showing which files actually changed. A summary of intended changes without diff evidence is not acceptable

## If unsure
Stop. Explain options. Ask before any decision that could affect the UIs
visual output or the apps architecture.