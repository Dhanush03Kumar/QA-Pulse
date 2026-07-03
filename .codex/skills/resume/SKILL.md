---
name: resume
description: Resumes work after an interrupted, crashed, or timed-out session. Checks actual repo state before continuing. Use when the user says the previous attempt failed, crashed, or lost connection.
---

1. Run `git status` and `git diff` — show the real output.
2. For any modified or untracked files, briefly check them for signs of
   truncation, incomplete writes, or corruption (unclosed tags/brackets,
   cut-off strings).
3. Summarize: what's genuinely done, what's partial/broken, what's untouched.
4. Do NOT resume implementation yet — wait for the user to confirm how to
   proceed based on your findings.