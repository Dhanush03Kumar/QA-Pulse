---
name: fix-error
description: Fixes ONE specific error the user pastes in (console/build/runtime error message or stack trace), with the minimum necessary change. Use when the user shares an exact error, not for general review or new features.
---

# Fix Error — targeted repair, build-verified

## Step 1 — Diagnose
Read docs/CLAUDE.md for project conventions. Read the actual file/line the
error points to — don't guess based on the error text alone.

## Step 2 — Check before creating
Before touching anything, confirm whether the fix requires a new file. It
almost never should for a single error. If you think it does, stop and ask
first per docs/CLAUDE.md's file creation policy.

## Step 3 — Fix minimally
Change only what's needed to resolve this specific error. Do not refactor
unrelated code, rename things, or "improve" surrounding logic while you're
in there.

## Step 4 — Verify, don't assume
Run the type-check and build commands. Show actual output. Only declare it
fixed once both pass cleanly with evidence shown in this response.

## Step 5 — Flag side effects
If the fix involves a schema/data change (e.g. IndexedDB version bump),
explicitly state whether the user needs to clear browser storage or if it
migrates automatically.

## Error to fix
$ARGUMENTS