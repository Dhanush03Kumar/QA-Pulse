---
name: code-check
description: Read-only verification that the current code actually builds and works — never fixes anything. Use after any implementation or before continuing work, when you need to confirm state rather than fix a known error.
---

# Code Check — verify only, never fix

Do NOT modify any files under any circumstances. This skill reports; it
does not repair. If the user wants a fix, they should use /fix-error or
/build-feature instead.

## Mandatory steps, in order
1. Run the project's type-check command (e.g. `npx tsc --noEmit`) — show
   full actual output.
2. Run the build command (e.g. `npm run build`) — show full actual output.
3. Only after 1-2, do a logic-level read-through of the scope below: null
   safety, correct helper usage, conditional rendering, scope compliance
   with docs/CLAUDE.md.

## Reporting rules
- Never write "no errors detected" or "production-ready" without command
  output proving it in this same response.
- If either command fails, lead with that, quote the exact error, and stop
  there — do not proceed to logic review on a broken build.
- End with a verdict: BUILD PASSES / BUILD FAILS.

## Scope to check
$ARGUMENTS