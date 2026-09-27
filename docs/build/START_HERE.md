# Tibu Phase 1 — Build Kit (continue-in-place edition)

Prepared 27 Sep 2026 for Daiwang Khera and Deepak Bangari. This kit replaces the "fresh TypeScript scaffold" parts of the earlier dev kit and is written against the real repo (`TIBU_V1-main`, commit `444aa7d`), which I built and ran on Linux before writing it.

## The strategy in one paragraph

Keep the repo, keep JavaScript, keep what already works (router, services seam, AppShell/BottomNav, Tailwind tokens, mock data). Stop repairing legacy screens. Rebuild each screen once, cleanly, under `src/pages/` against one fixed data contract (`docs/CONTRACT.md`), switch its route, and delete the old file in the same PR. The backend is the dev kit's Supabase schema, pushed in Week 1 in parallel with the frontend repair. Every AI session is small, plans first, is verified by you, and ends with a note in `docs/PROGRESS.md` so any tool or person can pick up where the last one stopped.

## What's in the kit

| Path | Use it for |
|---|---|
| `HOW_TO_USE_THE_KIT.md` | Manual for the kit: where every file lives, how to use it in Cursor, Antigravity, Codex and Claude, one task end to end |
| `TIBU_MASTER_GUIDE.md` | One-document overview: status, plan, full task tracker, routines, client inputs, glossary |
| `docs/00_STATUS_VERIFIED.md` | What is actually broken today, with commands to reproduce |
| `docs/01_DECISIONS.md` | Locked decisions (D1–D28). Copy into the repo as `docs/DECISIONS.md` |
| `docs/02_ROADMAP.md` | Week-by-week plan, both tracks, hours, milestones, cut order, risks |
| `docs/03_ARCHITECTURE_TARGET.md` | Target folders, routes, data flow, and the legacy-file replacement map |
| `docs/04_SERVICE_CONTRACT.md` | Data shapes + service functions. Copy into the repo as `docs/CONTRACT.md` |
| `docs/05_AI_TOOLS_PLAYBOOK.md` | How to split work across free Cursor, Antigravity, Codex and Claude |
| `docs/06_BACKEND_RUNBOOK.md` | Supabase dev → prod, step by step, with verification SQL and RLS probes |
| `docs/07_QA_AND_SIGNOFF.md` | Definition of done, SOW checklist → tasks, audit-bug closure, demo script |
| `docs/08_CLIENT_COMMS.md` | Ready-to-send messages to Laiba (status, decisions, M1, cuts, handover) |
| `docs/09_SQL_RECONCILIATION.md` | Dev-kit SQL tested on Postgres + PostGIS: what passed, the bug fixed, traps the frontend must respect |
| `supabase-fixes/` | Migration `0007` (fixes "Previously connected" ordering) — copy into `supabase/migrations/` before the first push; local test stubs |
| `prompts/00_SESSION_AND_RESCUE.md` | Session opener, handoff, rescue, review, debug and SQL prompts |
| `prompts/WEEK1_DEEP_DIVE.md` | Day-by-day Week 1 walkthrough: what to do each evening, why, what "done" really looks like, common failure points |
| `prompts/W1_…` → `prompts/W5_W6_…` | Every task: owner, tool, estimate, dependencies, prompt, verify, commit |
| `repo-files/` | Drop-in files for the repo root: AGENTS.md, rules for Antigravity and Cursor, CI, guard script, PR template, PROGRESS log, env examples |
| `patches/` | Two verified patches: boot fix, and legacy-folder move |

## Day 1 (Monday 28 Sep) — both people, about 2 hours each

**Person B (frontend)**
1. `git checkout -b fix/boot && git apply patches/0001-boot-fix.patch && npm run build` → open every route (list in `prompts/W1…` B1.1). Commit, PR, merge.
2. Task B1.2: apply `patches/0002-legacy-folders.patch`, delete `scratch/`, copy `repo-files/` into the repo, add the `check` script, push → CI must be green.
3. B1.2 also copies this kit into the repo: `docs/*` → `docs/build/`, `prompts/` → `docs/build/prompts/`, plus `docs/DECISIONS.md` and `docs/CONTRACT.md` (exact commands in the B1.2 task).

**Person A (backend)**
1. Send the accounts request (`docs/08_CLIENT_COMMS.md` §3).
2. Task A1.2: copy the earlier dev kit's `supabase/` into the repo and its `docs/01–09` into `docs/kit/`, create `tibu-dev`, run `npx supabase db push`, `cron.sql`, the smoke test, and the verification SQL in `docs/06_BACKEND_RUNBOOK.md` §4.

**Together (15 min):** read `docs/01_DECISIONS.md`, fill the "Now" section of `docs/PROGRESS.md`, decide who is A and who is B, and send the client status note (`docs/08` §1).

## "Should we build the DB first?"

No single thing comes first. The schema already exists (the dev kit's six migrations); pushing it is a two-hour job with no frontend dependency, so do it on Day 1 to find Supabase-specific surprises early. The frontend can't use it until the app boots and pages are built against the contract, which is B's Week 1. What must exist first is the **contract** — both sides code against it — and it's written: `docs/04_SERVICE_CONTRACT.md`. The frontend is wired to real data in Week 2 (task A2.1).

## Rules of the road

- One task per AI session, one branch per task, one PR per task. Tasks are sized at 1–4 hours.
- The agent plans first; you approve; the agent runs `npm run check`; **you** verify by hand using the task's Verify list.
- Code written by one tool is reviewed by the other person or a different tool.
- Anything the client asks for that isn't in the SOW goes into `docs/PHASE2_BACKLOG.md`, not into the code.
- Tell the client early when something slips or gets simplified (SOW §9, §12). Templates are in `docs/08`.
