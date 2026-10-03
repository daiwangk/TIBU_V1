---
description: Start one Tibu task: load the rules, then reply with a plan only
---

# Tibu — start a task session

You are starting ONE task in the Tibu repo. The task prompt (and any ADD-ON block under it) is in my message after this command. If my message has no task prompt, ask me to paste it and stop.

1. Read `AGENTS.md` fully, then `docs/PROGRESS.md` (the "Now" section and the latest log entry).
2. In 3 short bullets, tell me what AGENTS.md says about: the data flow, styling in new folders, and legacy files. (This proves the rules loaded.)
3. Read the task and every file it lists. If it touches data, read the `docs/CONTRACT.md` sections it names; if it touches the database, read the SQL in `supabase/migrations/`.
4. Reply with a **PLAN only**:
   - files to create / modify / delete (full paths)
   - dependencies to add (or "none")
   - how you will verify it: the commands you'll run, and what I should check by hand
   - anything unclear, or anything that conflicts with AGENTS.md, docs/CONTRACT.md, docs/DECISIONS.md or the SQL

Do not write or change any code until I reply "OK".
