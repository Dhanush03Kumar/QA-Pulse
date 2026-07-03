---
name: db-check
description: Verifies the Dexie/IndexedDB schema in src/lib/database.ts is valid — correct keyPath syntax, version numbers, and store definitions. Use when hitting IndexedDB errors or before changing the schema.
---

1. Read src/lib/database.ts (or wherever the Dexie schema lives).
2. Check every store definition for valid keyPath syntax (++id for
   auto-increment primary keys, correct comma-separated index syntax,
   no empty/malformed keyPaths).
3. Check version number consistency — if the schema changed, was the
   version bumped?
4. Flag anything that would cause createObjectStore or upgrade errors
   BEFORE the user hits them at runtime.
5. Report findings only. Do not modify the schema unless explicitly asked.