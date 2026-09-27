# Week 1 — Deep Dive (28 Sep – 2 Oct 2026)

This is the detailed walkthrough for Week 1. It doesn't replace `prompts/W1_stabilize_and_backend.md` — that file has the exact prompt text to paste into each AI tool. This document tells you *when* to do each task, *why* it matters, what "done" looks like beyond a green checkmark, and what to do when something breaks.

Read this once tonight. Then each evening, open only the section for that day.

---

## The week in one sentence

By Friday, a stranger should be able to open a product link on their phone and see it render — on real (seeded) data, from a database you control, on a codebase that actually builds.

## Why the order matters

Nothing productive can happen on the frontend until the app **boots**. Nothing on the backend can be tested from the app until the **contract** exists (the agreed shape of the data). The two tracks only truly meet at task A1.5, when the Supabase adapter starts filling in the same functions the mock adapter already implements. Everything before that point is table-setting — necessary, not optional, and mostly mechanical rather than creative, which is exactly why it should happen first while your AI-tool quotas are freshest.

```
B1.1 boot fix
  └─ B1.2 hygiene/CI ──┬─ B1.3 remove Phase-2 screens
                        ├─ B1.4 contract + mock data ──┬─ B1.5 query hooks ──┬─ B1.7 Product page ── B1.8 Business page
                        │                               │                    │
                        └─ B1.6 UI kit ─────────────────┘                    │
                                                                              │
A1.1 accounts (parallel, mostly waiting)                                     │
A1.2 supabase dev + db push ── A1.4 seed script ── A1.5 supabase adapter ────┘ (fills in B1.4's stubs)
A1.3 lib utilities (needs B1.2 for vitest)
A1.6 cloudflare pages (needs B1.2 pushed)
A1.7 auth settings (needs A1.1's domain, or defer)
```

If you only do five things this week, do B1.1, B1.2, B1.4, A1.2, A1.5 — that's the whole skeleton. Everything else fills it in.

---

## Monday 28 Sep

**Before you sit down:** confirm who is A and who is B (if not already decided), and send the three client messages from `docs/08_CLIENT_COMMS.md` §1–§3, ideally in the morning so the accounts request has all week to land.

### B: B1.1 — Boot fix (30–45 min)

**What this actually is.** Your repo currently fails `npm run build` on Linux, and every route white-screens with `womenFashionProducts is not defined`. This task is not a feature — it's the difference between "a project" and "a pile of files." Nothing else this week can be verified until this is done.

**Steps:**
```bash
git checkout main && git pull
git checkout -b fix/b1-1-boot
git apply --check ../tibu-build-kit/patches/0001-boot-fix.patch
```
If that second command prints nothing, the patch will apply cleanly. Run it for real:
```bash
git apply ../tibu-build-kit/patches/0001-boot-fix.patch
npm ci
npm run build
```
`npm run build` must end with `✓ built in ...ms` and no red text. If it doesn't, your repo has diverged from the exact commit the patch was built against — stop and use the fallback prompt in `prompts/W1…` under B1.1 instead (paste it into Cursor, following the Session Opener from `prompts/00`).

**Now actually look at it**, don't just trust the build:
```bash
npm run preview
```
Open it and click through by hand, not just by eyeballing the terminal: Home, Search, a category (Desserts and Fashion — those two had the worst bugs), Saved, Profile, Notifications, a product card, a business card, the seller dashboard, and a nonsense URL like `/nope`. Open DevTools → Console on each one. **Zero red errors** is the bar. Sections showing empty or with wrong labels is fine and expected — that's fixed later, not this task.

**Common trip-up:** if you see the fashion business row on Home stay empty even with no console error, that's expected — the category slugs across the mock data don't all agree yet (fixed properly in B1.4/B2.2). Don't chase it now.

**Commit and merge:**
```bash
git add -A && git commit -m "fix(b1.1): app builds on Linux and every route renders"
git push -u origin fix/b1-1-boot
```
Open the PR, have your partner glance at the diff (it should touch exactly 7 files — `App.jsx`, `Fashion.jsx`, `Handmade.jsx`, `Home.jsx`, and the three view-all pages), merge it.

### A: A1.1 — Accounts request (30 min + waiting all week)

Send the message from `08_CLIENT_COMMS.md` §3 if you haven't already. Then don't wait on it — move straight to A1.2. If Supabase isn't set up by tomorrow evening, create `tibu-dev` in your own personal/organisation account (Decision D28) and transfer it to hers later; a transferred project keeps its data and config, so this costs you nothing but a few minutes down the line.

### A: A1.2 — Supabase dev + import the dev kit (start tonight, 2 h — can spill into Tuesday)

**What this is.** The database schema for the whole app — 17 tables, RLS policies, RPC functions, cron jobs — already exists as SQL in the earlier dev kit. Tonight's job is purely mechanical: get that SQL into this repo and pushed to a real, running Postgres database. No original thinking required, which is exactly why it's a good first-evening task.

**Step 1 — bring the files in:**
```bash
git checkout -b chore/a1-2-supabase
cp -r ../tibu-phase1-dev-kit/supabase ./supabase
mkdir -p docs/kit
cp ../tibu-phase1-dev-kit/docs/0[1-9]*.md docs/kit/
cp ../tibu-build-kit/supabase-fixes/20260927000007_fix_connected_order.sql supabase/migrations/
ls supabase/migrations
```
You should see seven files: six starting `20260925…` and the fix `20260927000007…` (it corrects a real bug in "Previously connected" ordering — `docs/build/09_SQL_RECONCILIATION.md` §2). If `../tibu-phase1-dev-kit` isn't the right path on your machine, find wherever you saved that download first — this whole task depends on it.

**Step 2 — create the project.** Supabase dashboard → New project → name `tibu-dev` → region **Mumbai (ap-south-1)**, not the default — this matters for real distance-search latency later. Generate a strong DB password and put it in your shared password manager now, not in a sticky note.

**Step 3 — link and push:**
```bash
npx supabase login
npx supabase link --project-ref <dev-ref>
npx supabase db push
```
Watch it apply all six migrations in order. **If this fails, stop and read the error carefully before doing anything else** — this is the single riskiest step of Week 1, because these migrations were tested against a stubbed Postgres, not real Supabase, and there are three classic failure points: extensions installed in the wrong schema, a trigger on `auth.users` needing different permissions on hosted Supabase, or storage policy syntax that hosted Supabase is stricter about. Paste the exact error and the failing SQL statement into Claude.ai using the "Supabase migration failed" prompt in `prompts/00` (D3) — it's written for exactly this. **Because nothing has applied successfully yet, you're allowed to edit these migration files directly to fix it.** The moment `db push` fully succeeds, that permission ends — every change after that is a new migration file.

**Step 4 — cron:**
Dashboard → Database → Extensions → enable **pg_cron**. Then open the SQL editor and paste the entire contents of `supabase/cron.sql`, run it.

**Step 5 — the smoke test (use psql, not the SQL editor):** the script's first line is a psql command and the SQL editor only shows the last result, so you'd miss the OK lines. Follow `06_BACKEND_RUNBOOK.md` §3 step 4 (Session pooler connection string, then `psql … -f supabase/tests/rls_smoke_test.sql`). You're looking for `OK blocked: role_change_not_allowed`, `OK anon reveal blocked: login_required` and `OK self-review blocked`, not errors. (I already ran this exact test on a local Postgres + PostGIS and it passed — on Supabase you're checking the hosted environment behaves the same.) This test exercises the exact security guarantees the app depends on — sellers can't approve themselves, guests can't read phone numbers, and so on. Afterwards, go to Authentication → Users and delete the test accounts it created; they shouldn't linger in a project you're about to seed real-looking data into.

**Step 6 — verify, properly, not just "it ran":**
Run each query in `docs/06_BACKEND_RUNBOOK.md` §4 in the SQL editor:
```sql
select count(*) as tables from information_schema.tables
  where table_schema = 'public' and table_type = 'BASE TABLE';   -- expect 17
```
```sql
select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;  -- expect ZERO rows
```
That second query is not a formality. If it returns even one table name, that table has no row-level security at all — meaning anyone with the public key could read or write every row in it. This is the single most important check in the whole runbook. If it's not empty, do not proceed to A1.4 (seeding real-looking data) until it is.

```sql
select p.proname, pg_get_function_identity_arguments(p.oid) as args
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' order by 1;
```
Save this output — literally copy-paste it — into `docs/kit/rpc-signatures.txt`. Every backend task for the rest of the project (A1.5, A3.2, A4.1…) tells the AI agent to read this file for the exact function names and parameters, instead of guessing from the prompt text.

```sql
select slug, name, (select slug from categories p where p.id = c.parent_id) as parent
  from categories c order by sort_order;
```
Compare this list against `docs/CONTRACT.md` §2. If they don't match (they might not — the contract doc was written from an earlier prompt pack, not from this exact SQL), that's important enough to flag to your partner tonight, because both B1.4 and B2.2 hard-code category slugs. Fix the contract doc to match the real database, not the other way around — the SQL is always the source of truth.

```bash
git add -A && git commit -m "chore(a1.2): supabase migrations and dev kit docs"
git push -u origin chore/a1-2-supabase
```

---

## Tuesday 29 Sep

### B: B1.2 — Repo hygiene, guards, CI (1.5 h)

**What this is, and why it's not optional.** Nine files in your repo currently start with a blanket `/* eslint-disable */`. That's not a style nitpick — it's literally what hid the crash that made every screen white-screen before B1.1. This task installs a permanent tripwire so that never happens silently again, moves the old `Components/` and `Pages/` folders somewhere that won't collide with the new lowercase `components/` and `pages/` folders you'll create starting Thursday, and wires up CI so a broken build shows up as a red X on GitHub instead of a surprise three weeks from now.

**Steps:**
```bash
git checkout main && git pull   # picks up B1.1
git checkout -b chore/b1-2-hygiene
git apply --check ../tibu-build-kit/patches/0002-legacy-folders.patch
git apply ../tibu-build-kit/patches/0002-legacy-folders.patch
git rm -r scratch
cp -r ../tibu-build-kit/repo-files/. .
mkdir -p docs/build
cp -r ../tibu-build-kit/docs/. docs/build/
cp -r ../tibu-build-kit/prompts docs/build/prompts
cp ../tibu-build-kit/START_HERE.md docs/build/
cp ../tibu-build-kit/TIBU_MASTER_GUIDE.md docs/build/
cp docs/build/01_DECISIONS.md docs/DECISIONS.md
cp docs/build/04_SERVICE_CONTRACT.md docs/CONTRACT.md
npm i -D vitest
```
By hand, edit two files:
- `package.json` → add to `"scripts"`:
  ```json
  "test": "vitest run --passWithNoTests",
  "check": "node scripts/check-guards.mjs && npm run lint && npm run test && npm run build"
  ```
- `eslint.config.js` → change `globalIgnores(['dist'])` to `globalIgnores(['dist', 'functions', 'supabase'])`.
- `.gitignore` → add `.env`, `.env.*`, `!.env.example`, `!.env.seed.example`, `backups/`.

**Run the whole gate once, on purpose:**
```bash
npm run check
```
Read what each stage actually checks, don't just wait for green:
- `check-guards.mjs` catches the blanket eslint-disable files, case-sensitive folder collisions, leaked secret keys, and (later, once you start writing new code) pages importing data adapters directly or using inline styles.
- `lint` is your normal ESLint.
- `test` runs vitest — it'll say "no tests found" and pass, that's fine for now.
- `build` is the real Linux build.

Push it and **watch the Actions tab on GitHub**, don't just assume it's green because it worked locally — this is the first real test of whether your CI workflow file is correct.
```bash
git add -A && git commit -m "chore(b1.2): legacy folders, guards, CI, agent rules"
git push -u origin chore/b1-2-hygiene
```

**One more thing tonight — the rules smoke test.** In whichever AI tool you're about to use for B1.3 or B1.4, paste this before anything else:
> Without opening any files, list the five most important rules you have been given for this project.

If it can't name the data-flow rule (pages never import an adapter directly), the rupee rule (price is an integer in the UI, paise in the database), and the legacy rule (replace and delete, never restyle), the rules file isn't loading. Fix that now — it's cheap to fix today and expensive to discover on Thursday after an agent has spent its quota restyling a file that was supposed to be deleted.

### A: continue A1.2 if it spilled over, else start A1.4

If Monday's `db push` succeeded cleanly, jump ahead to A1.4 tonight (seeding) — there's no reason to wait. If A1.2 is still open, finish it first; everything downstream depends on it.

---

## Wednesday 30 Sep

### B: B1.3 — Remove Phase-2 screens (1 h)

**What this is.** Offers, Discover, and the address book are explicitly out of scope for Phase 1 (SOW §4, Decision D16). Removing them now, before you rebuild anything, means you're never tempted to "just quickly fix" a screen that shouldn't exist in six months. Paste the B1.3 prompt from `prompts/W1…` into Cursor. This one is genuinely small — it's mostly deletions and a few `git grep` checks to make sure nothing still references what you removed.

**Verify by hand, not just by the build passing:** at 390px, tap every single item in the bottom nav and every row on the Profile screen. The bar is "no blank screens," not "the build compiles" — those aren't the same thing, and this repo has taught you that lesson once already.

### B: B1.4 — Service contract + mock adapter (3 h — the most important task of the week)

**Why this is the pivot point of the whole project.** Right now your data comes from nine scattered files with four different category-naming schemes, random `Math.random()` coordinates that change every reload, and a `.sort()` that mutates a shared array. This task doesn't fix any of that in place — it builds a **second, clean adapter** next to the messy one, matching an explicit contract (`docs/CONTRACT.md`) that both the frontend and the eventual real database will honor. Every page you write from Thursday onward talks to this contract, never to the raw data. This is what lets you build five weeks of screens on fake data this week, and swap in the real database in Week 2 without touching a single page.

This is also the task most worth using your strongest available model on (Antigravity's planning mode, or Cursor with the best model you have quota for) — it's the one place where getting the taxonomy and the shapes subtly wrong will cost you real time three weeks from now.

Paste the B1.4 prompt from `prompts/W1…` in full — don't summarize it yourself, the file lists nine specific things to create and the exact rules for each (deterministic fixtures with no `Math.random`, IDs that match what the legacy pages already link to, no phone number anywhere in a public shape).

**What "done" actually looks like, beyond the tests passing:**
- Open the mock adapter's category taxonomy file and read it once yourself. Does `resin-art` map correctly from both `"Resin Art"` (business data) and `resin` (product data)? This is the exact bug class that caused Fashion and Handmade to be silently broken before.
- Run the app locally and confirm you can still click through every legacy screen exactly as before — this task should be invisible to anyone just using the app tonight. The new adapter isn't wired into any screen yet; that's B1.5 onward.
- Look at the test file it wrote. Does it actually assert "no key matches `/phone|whatsapp/i`" on the public shapes? That's not a nice-to-have — it's the test that would have caught the audit's biggest security-shaped bug.

Have A review this PR with the review prompt (`prompts/00` S9) before merging, even though A didn't write the frontend code — the contract is the one thing both of you need to agree matches what the real database will actually return.

### A: A1.4 — Dev seed script (2 h)

**What this is.** An empty database is useless for building screens against. This script populates `tibu-dev` with 12 realistic-looking sellers, their businesses spread across real Mumbai neighborhoods, and roughly 45 products — so that from Tuesday next week, Home and Search show something that looks like a real, populated marketplace instead of three test rows.

```bash
cp .env.seed.example .env.seed
```
Fill in the dev project's URL, its **service-role (secret) key** — found in Supabase dashboard → Settings → API, never the anon key — and `SEED_ALLOWED_REF` set to the dev project's ref. **This file is git-ignored; double-check `git status` shows it as untracked before you do anything else, and never paste its contents into an AI chat.**

Paste the A1.4 prompt from `prompts/W1…`. Once written:
```bash
node --env-file=.env.seed scripts/seed-dev.mjs
```
Run it a **second time** immediately — this is the actual test, not the first run. The script is supposed to be idempotent (safe to re-run without duplicating data); if the second run doubles your business count, that's a bug worth catching tonight rather than after you've built three weeks of screens on top of duplicated data.

**Check in the Table Editor, not just the script's printed summary:** open the `businesses` table, confirm `location` (the PostGIS geography column, not just `lat`/`lng`) is actually filled in — some seed scripts populate the plain columns and forget the trigger-derived geography column, which silently breaks every distance search later. Confirm `rating_avg` is non-zero on a few rows.

---

## Thursday 1 Oct

### B: B1.5 — Providers, error boundary, query hooks (1.5 h)

**What this is.** This wires React Query into the app (so pages can ask for data and get automatic loading/caching/refetching) and adds a root error boundary — meaning a bug in one new page shows a friendly "something went wrong" screen instead of white-screening the entire app the way `Home.jsx` did last week. This is short and mechanical; don't over-think it.

**Verify concretely:** temporarily add `console.log(useProductSearch({ limit: 3 }).data)` inside any component that's actually rendered, load the page, and confirm you see three product objects in the console — real objects with the contract's shape (camelCase, `price` as a plain number), not `undefined` and not a promise. Delete the log line before committing.

### B: B1.6 — UI primitives and shared components (3 h — budget the whole evening)

**What this is.** Every screen from here on is built out of a small set of reusable pieces — buttons, cards, a bottom sheet, skeletons, empty states. Building them once now, deliberately, against the design tokens in `theme.css`, is what stops the next four weeks from turning into 1,176 more inline `style={{}}` blocks like the ones already haunting the legacy code.

This is a long list (the prompt names about twenty components). Don't try to review every one individually tonight — instead, lean on the thing this task builds specifically so you *can* review it fast: the `/dev/ui` gallery page. When it's done:
```bash
npm run dev
```
Open `http://localhost:5173/dev/ui` at 390px width. This one page should show every component in every state — a button loading, a card with no image, an empty state, a bottom sheet open. **Tab through it with your keyboard** — every interactive element needs a visible focus ring, and every icon-only button needs to announce its name (check with a screen reader if you have one handy, or just verify each has an `aria-label` in the code). Open the Sheet and confirm Escape and clicking the backdrop both close it.

Then confirm this gallery route **disappears** in a production build — it's dev-only:
```bash
npm run build && npm run preview
```
Visit `/dev/ui` on the preview server — it should 404. If it doesn't, that's a real bug (a dev-only tool shouldn't be reachable by a customer in production), not a nitpick.

### A: A1.5 — Supabase client + catalog adapter (3 h — the second pivot point)

**Why this matters.** This is where the two tracks actually converge. Everything you built in A1.2 and A1.4 (a real, seeded database) and everything B built in B1.4 (a contract both sides agree on) meet here: this task implements the *same function names* the mock adapter already has, but backed by real Supabase queries instead of fake in-memory arrays.

Paste the A1.5 prompt. Critically, it tells the agent to read `docs/kit/rpc-signatures.txt` (the file you saved from A1.2) rather than guessing RPC parameter names from a template — that file is the ground truth for exactly what the database actually expects.

**Verify like you mean it, not just "the build passed":**
```bash
# .env.local
VITE_DATA_SOURCE=supabase
VITE_SUPABASE_URL=https://<dev-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<the ANON key, never the service-role key>
```
```bash
npm run dev
```
Open a seeded product's `/p/<uuid>` and a seeded business's `/b/<slug>` (grab real IDs from the Table Editor). Confirm the price shows correctly formatted in rupees — if the database stores `35000` paise and the page shows "₹35,000" instead of "₹350", that's the rupee/paise conversion bug happening in exactly the place the contract was written to prevent. Now switch `VITE_DATA_SOURCE` back to `mock`, restart the dev server, and confirm the app still works — this proves the two adapters are genuinely interchangeable, which is the entire point of today's work.

---

## Friday 2 Oct

### B: B1.7 — Product page at `/p/:productId` (2 h)

**Why this specific page, this specific week.** The single most important line in the whole SOW is that a seller can see a product's image when a customer's WhatsApp message arrives — and that only works if products live at a real, shareable URL instead of being passed around as in-memory navigation state (the way the legacy `Product.jsx` does today, which is why it shows nothing if you open it directly or refresh the page).

Paste the B1.7 prompt. When it's done, this is the task where "the code compiles" and "it actually works" are most likely to diverge, so verify literally every item:
- Click a product card from the (still legacy) Home page → confirm the URL bar shows `/p/<id>`.
- **Copy that URL, open a new incognito window, paste it.** This is the real test — if the product only renders when you navigate to it from within the app but not from a cold link, the whole WhatsApp feature is still broken, just less obviously than before.
- Hard-refresh the page (not just re-navigate) — it must still show the product.
- Visit `/p/nope` — you should see a designed "not found" state, not a crash and not a blank page.
- Press the browser's Back button — you should land on wherever you were before, not get stuck.

### B: B1.8 — Business page at `/b/:slug` (3 h — the longest single task this week, budget accordingly)

Same pattern as B1.7, but bigger: three tabs (Products, Videos, Reviews), each synced to the URL so a direct link to `/b/<slug>?tab=reviews` opens straight into reviews. The Videos tab is worth a specific look — it embeds a real Instagram reel via iframe with no video files ever stored by Tibu (that's a deliberate SOW cost-saving decision, not a shortcut you're taking); since the seed data has no real reel URLs yet, confirming the empty state ("No videos yet") looks intentional rather than broken is the actual bar here, not seeing a video play.

Delete `src/Business.jsx` in this same task, same as `Product.jsx` was deleted in B1.7 — this is the strangler pattern in action: build the replacement, switch the route, delete the original, all in one PR. Don't let a "temporarily keep both" instinct creep in; that's how repos accumulate dead code.

### A: A1.6 — Cloudflare Pages previews (1 h)

Connect the repo, set the build command and output directory, add environment variables for **both** Preview and Production separately (they're easy to fill in for one and forget for the other). The one test that actually matters:
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://<preview>.pages.dev/p/anything
```
This should return `200` and load the SPA shell (which then shows its own not-found state) — **not** Cloudflare's generic 404 page. If you see Cloudflare's 404, your SPA routing fallback isn't configured, and every deep link (every product link, every business link) will break the moment someone opens it fresh, exactly the SOW's core feature.

### A: A1.7 — Auth settings (1 h)

Site URL and redirect URLs in Supabase's Auth settings. If the client's domain and Resend account aren't ready yet, that's fine — defer the SMTP half specifically to Week 3, but do set the redirect URLs now so a test signup this week doesn't silently fail.

---

## End-of-week review (Friday night or Saturday morning, together)

Don't skip this — it's 20 minutes and it's what stops small gaps from compounding into a Week 3 crisis.

1. **Run the actual exit check**, not a mental checklist: on a phone, in a private/incognito browser tab, open a `/p/<uuid>` link pointing at a real seeded product on the Cloudflare preview URL. It must render. This one check proves B1.1 through B1.8 and A1.2 through A1.6 all actually work together, not just individually.
2. In the Supabase SQL editor, re-run the RLS check from A1.2 §Step 6 one more time — a task later in the week could theoretically have added a table without RLS.
3. Fill in `docs/PROGRESS.md`: tick every task that's actually merged (not just "written"), note anything still open as "In progress" with the exact next step, and log what you're still waiting on from the client under "Waiting on client" with the date you asked — this line is what lets you invoke SOW §9 honestly later if the timeline slips.
4. Check each of your four AI tools' usage dashboards. Note who has quota left going into Week 2, so Monday's task assignments can route around whoever's already low.
5. Send the client a three-line update: what's built, that Milestone 1 is still on track for Friday 9 Oct, anything you're still waiting on from her.

If something from this week isn't done by Saturday, the honest move is to start Week 2 with it, not to quietly skip verification and hope it surfaces later — this repo has already shown you exactly what "hope it surfaces later" costs.
