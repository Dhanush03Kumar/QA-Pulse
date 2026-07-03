---
name: checkpoint
description: Creates a clean git commit for a verified, working change. Use when the user confirms something is working and wants to save progress.
---

1. Run `git status` and `git diff` — show what will be committed.
2. Confirm: does this match only the intended change (no unexpected files)?
   If anything unexpected is staged, flag it and stop.
3. Run the build/type-check one more time to confirm it's still passing.
4. If clean, stage and commit with a clear, specific message describing
   what was fixed/added (not "updates" or "wip").
5. Show the commit hash and message as confirmation.