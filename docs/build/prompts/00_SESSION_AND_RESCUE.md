# 00 · Session, handoff and rescue prompts

Placeholders in `<angle brackets>` are yours to fill. Every week file's task prompt is designed to be pasted **after** the Session Opener.

---

## S1 · Session opener (paste first in every new chat inside Cursor / Antigravity / Codex)
```
New task session for the Tibu repo.
1. Read AGENTS.md fully, then docs/PROGRESS.md (the "Now" section and the latest log entry).
2. In 3 short bullets, tell me what AGENTS.md says about: the data flow, styling in new folders, and legacy files. (This confirms you loaded the rules.)
3. Then read the task below and the files it lists, and reply with a PLAN only:
   - files to create / modify / delete (full paths)
   - dependencies to add (or "none")
   - how you will verify it
   - anything unclear or conflicting with AGENTS.md / docs/CONTRACT.md
Do not write code until I reply "OK".

TASK:
<paste the task prompt here>
```

## S2 · Rules smoke test (first time in a tool, or when it misbehaves)
```
Without opening any files, list the five most important rules you have been given for this project. If you don't have any project rules loaded, say so.
```
If it can't name the data-flow rule, the rupee rule and the legacy rule, attach `AGENTS.md` manually (`@AGENTS.md`) and check the tool's rules settings.

## S3 · Plan check (when the plan looks too big or vague)
```
Stop. Before any code, revise the plan so that:
- it touches only these files: <list>
- it adds no dependencies (or only: <list>)
- it deletes these legacy files instead of editing them: <list>
- every data shape matches docs/CONTRACT.md §<n> exactly (no new fields)
Reply with the revised plan only.
```

## S4 · Handoff (end of session, or when quota is about to run out)
```
Stop coding now. Do three things:
1. Run `git status` and `git diff --stat` and paste them.
2. Append an entry to docs/PROGRESS.md using its template: what is done, which files, how it was verified, what is NOT done, the exact next step, and gotchas.
3. Update the "Now" section (in progress / blocked).
Then tell me whether the branch is safe to commit as "wip:" or should be reverted.
```

## S5 · Continue from a handoff (new tool or new person)
```
You are continuing a task another session started. Read AGENTS.md, then the latest entry in docs/PROGRESS.md, then run `git diff main --stat` on this branch.
Summarise in 5 bullets what's done and what's left, then propose a PLAN for the remaining work only. Don't redo finished work. Wait for OK.
Task being continued: <task id + paste the original task prompt>
```

## S6 · Off track → reset
```
Revert every change you made in this session (`git restore .` and delete any new untracked files you created — list them first and wait for my OK).
The problems were: <1, 2, 3>.
Re-read AGENTS.md and the task. Redo it touching only: <files>. Plan first.
```

## S7 · Fix one bug
```
Bug: <what happens>. Expected: <what should happen>.
Steps: 1. <…> 2. <…> 3. <…>   Viewport: 390px, <browser>.
Exact error (console/terminal):
<paste>
Find the root cause first and explain it in 2–3 sentences with the file and line. Then propose the smallest fix. Don't refactor anything else. Wait for OK before editing.
```

## S8 · White screen / build failure triage
```
The app <white-screens on route X | fails `npm run build`>. Output:
<paste build output or the first console error with stack>
1. Identify the exact module and line.
2. Say whether it's a case-sensitivity import, an undefined variable, a bad import path, or a runtime error in render.
3. Propose the minimal fix. Also say whether the root ErrorBoundary (src/app/ErrorBoundary.jsx) should have caught it and why it didn't.
```

## S9 · Review a branch (use a DIFFERENT tool from the one that wrote the code)
```
Review the diff of the current branch against main (`git diff main`) as a strict senior reviewer. Do not edit code.
Check, one by one:
1. AGENTS.md §3 architecture rules (data flow, rupees, phones, URLs, slugs, state).
2. docs/CONTRACT.md: any field not in the contract, any shape mismatch.
3. Legacy rule: replaced legacy files deleted and removed from scripts/legacy-allowlist.json; no legacy file restyled.
4. UI: loading / empty / error / data states; aria-labels; 44px targets; no inline styles; lucide icons only.
5. Security: secrets, phone exposure, anything that assumes the client enforces access instead of RLS.
6. Files changed that the task didn't need.
Output three lists: MUST FIX, SHOULD FIX, NICE TO HAVE — each item with file:line.
```

## S10 · Explain code to me
```
Explain <file or function> like a teammate would: what it does, why it's written this way, and what breaks if I change <X>. Short and concrete. No code changes.
```

## S11 · Split a task that's too big
```
This task is too big for one session. Split it into 2–4 sub-tasks, each finishable in under 2 hours, each leaving `npm run check` green and the app working. For each: title, files, done-when. Don't write code.
Task: <paste>
```

## S12 · Write tests for a module
```
Write vitest unit tests for <src/lib/x.js or a service function> covering: normal cases, edge cases (<list>), and invalid input. Put them next to the file as <name>.test.js. Import describe/it/expect from 'vitest'. Don't change the module unless a test exposes a real bug — then stop and tell me.
```

## S13 · Visual compare with a mockup (Antigravity browser agent, UI tasks only)
```
Open http://localhost:5173<route> at 390×844. Screenshot it. Compare with design/mockups/<file>.png.
List visible differences (spacing, radius, colour, font weight, alignment, icon style) in order of how noticeable they are. Fix the top 5 using Tailwind token classes only. Re-screenshot once. Don't change layout structure or data.
```

---

## Database prompts (Person A)

## D1 · New migration
```
I need: <change>. Read supabase/migrations/ to see existing tables, helpers (is_admin() etc.) and policy patterns.
Create ONE new migration file supabase/migrations/<YYYYMMDDHHMMSS>_<short_name>.sql. Don't edit existing files.
If it adds a table: enable RLS and add policies in the same file, following 20260925000003_rls_policies.sql.
In your reply, explain every policy in plain English: who can select, insert, update, delete, and why.
I will run `npx supabase db push` myself after reviewing.
```

## D2 · RLS review (after any migration; works well in Claude.ai with the SQL pasted)
```
Here is a migration: <paste SQL, or @file>.
For each table and function it touches, fill this matrix: guest, customer, seller who owns the row, another seller, admin × select/insert/update/delete/execute.
Flag: any row readable or writable by someone who shouldn't have access; SECURITY DEFINER functions that don't check auth.uid() / is_admin() or don't set search_path; anything that exposes business_contacts outside reveal_contact.
```

## D3 · Supabase migration failed (Claude.ai: paste the error and the failing statement)
```
`npx supabase db push` failed on a hosted Supabase project (Postgres 15+/PostGIS). These migrations were previously tested only on plain Postgres 16 + PostGIS with stubbed auth and storage schemas.
Error:
<paste full error>
Failing statement (and the 20 lines around it):
<paste>
Explain the cause (common ones: extension schema — Supabase installs extensions in `extensions`; auth.users trigger permissions; storage.objects policy syntax; pg_cron not enabled). Give the corrected SQL. The migration has not applied yet, so editing this file is allowed.
```

## D4 · "Why does Supabase return this?" (Claude.ai)
```
Tibu uses Supabase with RLS. Query (from src/services/supabase/<file>.js):
<paste the code>
Logged in as: <guest | customer | seller | admin>. Result: <empty array | error text>. Expected: <…>.
Relevant policies:
<paste policies for the table from 20260925000003_rls_policies.sql>
Explain which policy (or missing grant) causes this and the correct fix — app-side if the query is wrong, a new migration if the policy is wrong.
```
