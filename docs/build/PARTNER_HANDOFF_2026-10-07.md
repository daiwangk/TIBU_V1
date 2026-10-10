# Handoff — what's left before Milestone 1 (written 7 Oct 2026)

For: the teammate who will run the hosted-service steps (Supabase dashboard, Cloudflare dashboard, a real phone). You don't need to have followed the build; this page is self-contained. Everything that could be done inside the repo is done and on `main`. What remains needs **logins, dashboards and physical phones** — things that can't be done from code.

> **Golden rule for this handoff: do the steps in order.** The database must be updated *before* Cloudflare is switched to real data. If you switch the hosted site to `supabase` first, the Product and Business pages will error, because the app now asks for database columns that don't exist yet.

---

## 0. Where things stand

**Merged and pushed on `main`:** all of Week 2 on the website side — Home, Search, Category, Product, Business pages; location chip and area picker; error toasts; static pages and 404; Rev2 fields (delivery time, "Est. year", details, rating line); the QA sweep and its fixes; link-preview functions (code); and a code review with its fixes. `npm run check` is green (144 tests).

**Not done, and why (this is your list):**

| # | What | Why it's not done | Who |
|---|---|---|---|
| 1 | Push migrations 0008, 0009, 0010 to `tibu-dev` | needs the Supabase login + DB password | you |
| 2 | Auth URLs on dev (A1.7) | Supabase dashboard | you |
| 3 | Recreate the Cloudflare Pages project (A1.6) | the old project is attached to a different repo | you (may need Daiwang's approval of the Cloudflare GitHub app) |
| 4 | Switch the hosted site to real data (A2.1) | needs steps 1 and 3 | you |
| 5 | Check link previews on real phones (A2.3) | needs step 3 and 4 | you |
| 6 | Seed 3–4 real Instagram reels | needs links from the client | Daiwang → you |
| 7 | Send the client message; M1 demo invite | client-facing | Daiwang |
| 8 | Rehearse the 15-minute demo on a real phone | needs steps 1–6 | both |

Rough time: steps 1–2 about 1 hour, step 3–4 about 1.5 hours, step 5 about 45 minutes, step 8 about 1 hour.

---

## 1. Before you start (10 minutes)

**Accounts you need to be able to open:** Supabase (project `tibu-dev` — never `tibu-prod`), Cloudflare (Workers & Pages), GitHub (`daiwangk/TIBU_V1`). Ask Daiwang for access to any you can't open. The database password for `tibu-dev` is in their password manager.

**Get the code:**
```bash
git clone https://github.com/daiwangk/TIBU_V1.git     # skip if you already have it
cd TIBU_V1
git checkout main && git pull
npm ci
npm run check            # must end green: guards OK, 144 tests, build OK
```
If `npm run check` isn't green on a fresh `main`, stop and tell Daiwang before touching anything hosted. Node 22 is expected (`.node-version`).

**Rules that apply to everything below** (they're in `AGENTS.md` §6 too):
- Only ever run commands against **`tibu-dev`**. Never production.
- The **service-role / secret key** never goes into Cloudflare variables, `src/`, a `VITE_*` variable, or a chat. The app now throws an error (and CI fails) if you paste one into `VITE_SUPABASE_ANON_KEY`. The only key the website uses is the **anon / publishable** key.
- A migration that has been pushed is never edited. Fixes are always a *new* file.

---

## 2. Database: push the three new migrations (R1 part 1, F5, migration 0010)

### 2a. Confirm what's already on the hosted database (F5)
```bash
npx supabase login                                  # opens a browser; log in
npx supabase projects list                          # the row marked ● LINKED must be tibu-dev
```
If nothing is linked (or it's the wrong one):
```bash
npx supabase link --project-ref <tibu-dev ref>      # asks for the DB password
npx supabase projects list                          # check again
```
```bash
npx supabase migration list
```
Read the table. **Remote** should list `20260925000001` … `20260927000007` (seven rows). The *Local* column will also show `20261002000008`, `20261002000009` and `20261006000010` with an empty Remote cell — those are the three you're about to push.
- If 0007 is missing remotely, that's fine: `db push` below applies it too (it applies anything missing, in order).
- If anything *newer* than those appears under Remote only, stop and ask — someone changed the database by hand.

### 2b. Push
```bash
npx supabase db push
```
It lists what it will apply and asks to confirm. Expect **0008** (delivery fields), **0009** (push subscriptions table + two functions), **0010** (stable search ordering) — plus 0007 if it was missing. Then:
```bash
npx supabase migration list      # Local and Remote columns must now match exactly
```
**If `db push` fails:** copy the *whole* error and the failing statement and send it to Daiwang (or paste it into Claude.ai with the "Supabase migration failed" prompt in `docs/build/prompts/00_SESSION_AND_RESCUE.md`). Notes:
- 0008 and 0009 were tested on Postgres 16 + PostGIS before; the one thing nobody could test is Supabase's own ownership rules for `SECURITY DEFINER` functions — if anything fails it's most likely 0009.
- 0010 has **not** been run anywhere yet. It only appends the row id to the sort order of the two search functions. If it errors, don't improvise: send the error. Skipping it is safe (it only affects "Load more" occasionally repeating a row when values tie).
- A failed push applies nothing from the failing file, so you can retry after the fix.

### 2c. Verify (Supabase dashboard → SQL editor; paste each, run, compare)
```sql
-- 1) the five new columns (expect 5 rows)
select table_name, column_name from information_schema.columns
where table_schema = 'public'
  and ((table_name = 'businesses' and column_name in ('delivery_time','established_year'))
    or (table_name = 'products'   and column_name in ('delivery_available','pickup_available','delivery_time')));

-- 2) tables (expect 18 — the old 17 plus push_subscriptions)
select count(*) from information_schema.tables where table_schema='public' and table_type='BASE TABLE';

-- 3) row-level security must be ON everywhere (expect ZERO rows)
select c.relname from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity;

-- 4) the new functions exist (expect save_push_subscription and delete_push_subscription)
select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and proname in ('save_push_subscription','delete_push_subscription');
```
Anything other than the expected result → stop and report; don't continue to step 3.

### 2d. Optional but recommended: the SQL test suite (needs `psql`)
Connection string: Supabase dashboard → **Connect** → **Session pooler** (the direct host is IPv6-only on free projects).
```bash
psql "postgresql://postgres.<ref>:<db-password>@<pooler-host>:5432/postgres" -f supabase/tests/rls_smoke_test.sql
```
Expect the "OK blocked: …" lines described in `docs/build/06_BACKEND_RUNBOOK.md` §3 step 4. Then delete the test users it created (Authentication → Users). The two new tests `supabase/tests/rev2_0008_test.sql` and `rev2_0009_test.sql` exist too, but they were written for a local database with test stubs; don't run them on the hosted project unless you've read them first.

### 2e. Refresh the function list
Run the query from `docs/build/06_BACKEND_RUNBOOK.md` §4 item 3 (list of functions and arguments) and overwrite `docs/kit/rpc-signatures.txt` with the result. (Two rows were added by hand earlier — it should now include `save_push_subscription` and `delete_push_subscription` straight from the database.) Commit that file on a branch (see §9).

---

## 3. Auth URLs on dev (A1.7, 30 minutes)

Supabase dashboard → **Authentication → URL configuration**:
- **Site URL:** `https://tibu-app.pages.dev` (or the new Cloudflare production URL if step 4 gives you a different name — update it afterwards).
- **Redirect URLs** (add all three, using your Cloudflare project's name — not a bare `*.pages.dev`, which is too broad): `http://localhost:5173/**`, `https://*.<your-pages-project>.pages.dev/**` and `https://<your-pages-project>.pages.dev/**`.
- Providers: email + password **on**; **Confirm email stays ON** (decision D12).

Why now: sign-up and "forgot password" land in Week 3 and silently fail if these URLs are missing. Nothing in the current app uses them yet, so there is nothing to test beyond saving.

**SMTP/Resend (custom email sending) waits for the client's domain.** Until then the built-in mailer only emails people who are members of your Supabase team. This is why the domain request in the client message matters.

---

## 4. Cloudflare Pages: recreate the project (A1.6, 1 hour)

**Why:** the existing Pages project (`tibu-v1.pages.dev`) was created by importing a *different* repository (`Thipak3/tibu-v1`), so it never builds `daiwangk/TIBU_V1` and shows old code. A project's Git source can't be changed afterwards — it has to be recreated.

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**. Authorize the Cloudflare GitHub app for `daiwangk/TIBU_V1` (this is the step that may need Daiwang, as owner of the repo, to approve).
2. Select `TIBU_V1`, production branch **`main`**.
3. Build settings: framework preset *None*; **Build command** `npm run build`; **Build output directory** `dist`; root directory empty.
4. **Environment variables** — set *Production and Preview separately* (it's easy to fill one and forget the other):

| Variable | Value | Kind | Notes |
|---|---|---|---|
| `NODE_VERSION` | `22` | build | |
| `VITE_DATA_SOURCE` | **`mock` for now** | build | switched to `supabase` in step 5 |
| `VITE_SITE_URL` | the project's URL, e.g. `https://tibu-app.pages.dev` | build | |
| `VITE_SUPABASE_URL` | `https://<tibu-dev ref>.supabase.co` | build | public |
| `VITE_SUPABASE_ANON_KEY` | the **anon / publishable** key | build | Project settings → API. If this ever holds a `service_role` or `sb_secret_…` key the app throws and CI fails — rotate that key immediately |
| `SUPABASE_URL` | same URL | **runtime** (Functions) | read by the link-preview functions |
| `SUPABASE_ANON_KEY` | same anon key | **runtime** | |
| `SITE_URL` | same as `VITE_SITE_URL` | **runtime** | used for `og:url` |

   `VITE_*` values are baked into the build: change one → you must **redeploy** (Deployments → ⋯ → Retry). The three non-`VITE_` ones are read live by the functions, but a new deployment is still needed for a variable change to apply.
5. Save and deploy. First build takes a couple of minutes.
6. If the name `tibu-v1` is taken by the old project, either delete the old project first (it points at the wrong repo and is of no use) or pick a new name and use the new URL in §3, §5 and the table above.
7. **The check that matters** (a deep link must boot the app, not show Cloudflare's own 404):
```bash
curl -s -o /dev/null -w "%{http_code}\n" https://<your-project>.pages.dev/p/anything     # expect 200
```
Then open the home page in a browser: it should show the new app (location chip, "Set location") with mock data.

---

## 5. Switch the hosted site to real data (A2.1, 1.5 hours)

Only after step 2 passed all four SQL checks.

1. In Cloudflare, set `VITE_DATA_SOURCE = supabase` for **Production and Preview**, then redeploy.
2. Walk the site **on a phone** (and once in a private/incognito tab). Checklist:
   - Home: New businesses, New products, Available today all show seeded data with images (placeholder pictures are expected).
   - Tap **Set location → Andheri West**: distances appear on cards; the "Near you" row appears; Category → **Nearest** sort is enabled and distances increase.
   - Search "cake": Products and Businesses tabs both have results; try a nonsense word → friendly empty state.
   - Category → Handmade → sub-chips; **Today** chip filters.
   - A business page: all three tabs; delivery pills and "Est. <year>" only if the seed has them (the seed doesn't set Rev2 fields — an empty look there is correct and not a bug).
   - A product page: price in rupees, seller block, rating line, buttons "WhatsApp" and "Call" (they show "Contact opens after login" — that's expected until Week 3).
   - **Pending / rejected businesses must never appear.** The seed has one of each; search for them by name — nothing should come back.
3. If a page crashes or shows "Something went wrong": open the browser console (on desktop: F12), copy the red error, and send it to Daiwang. Most likely causes: step 2 not complete (missing columns), wrong anon key, or `VITE_DATA_SOURCE` not redeployed.
4. Keep local development on `mock` (`.env.local` default) so the team can work offline.

**Seeding the reels** (needed for the demo's "Videos" tab):
- Daiwang gets 3–4 **public** Instagram reel links from the client (`https://www.instagram.com/reel/<code>/`).
- In `.env.seed` (copy from `.env.seed.example`; **git-ignored; contains the service-role key — never commit, never paste anywhere**) set `REELS=url1,url2,url3`, then:
```bash
node --env-file=.env.seed scripts/seed-dev.mjs
```
The seed is idempotent (running it again gives the same counts) and refuses to run unless `SUPABASE_URL` is exactly `<SEED_ALLOWED_REF>.supabase.co`. Afterwards a business's **Videos** tab plays the reels.

---

## 6. Link previews (A2.3, 45 minutes)

The functions are in `functions/` and run automatically once the project from step 4 is deployed with the three runtime variables. Full guide: `docs/build/og-testing.md`. The short version:

1. Get a real product id: Supabase → Table editor → `products` → copy an `id` of an active product of an approved business, and a business `slug`.
2. Prove the server side (run in a terminal):
```bash
curl -s -A "WhatsApp/2.23.20" https://<project>.pages.dev/p/<product-uuid> | grep -E "og:(title|image|description)"
curl -s -A "WhatsApp/2.23.20" https://<project>.pages.dev/b/<business-slug> | grep -E "og:(title|image|description)"
```
   Expect the product's name, a description like `₹350 · Sweet Crumbs, Bandra West`, and an absolute `https://…` image URL. If you get nothing: check the three runtime variables and that you redeployed.
3. Open the same URL in a normal browser: the app must still load normally.
4. **WhatsApp itself:** send yourself the product link in WhatsApp on an **Android** phone and an **iPhone**. A card with image, name and price should appear. WhatsApp caches per URL — to re-test after any change, add `?v=2`, `?v=3` to the end.
5. If the image never shows: images must be `https`, publicly reachable and reasonably small. Facebook's Sharing Debugger (`developers.facebook.com/tools/debug`) shows what a scraper sees.

Record the result (pass/fail per phone) in PROGRESS.

---

## 7. Things only Daiwang can do (for coordination)

- **Send the client message** `docs/build/11_SOW_REV2_CHANGES.md` §6.1: eleven yes/no confirmations (including the M1/M2 payment definitions and "no advance payment") **and the domain request**. The domain blocks customer sign-up emails in Week 3, so this is the item with the longest lead time. Write the date asked in `docs/TRACKER.md` → "Waiting on client".
- Collect **3–4 public reel links**, the final logo (Week 4), privacy/terms text and support contact (by Fri 30 Oct), and the 3–5 real sellers list.
- Send the **demo invite** (`11` §6.2) once step 8 is rehearsed. Decide Fri 9 Oct vs Mon 12 Oct (the plan says: demo Friday only if the preview is on real data and previews work; otherwise book Monday and tell the client Thursday morning).

---

## 8. Rehearsal and the demo (1 hour + 15 minutes)

Use the script in `docs/build/07_QA_AND_SIGNOFF.md` §4 on a real phone with the Cloudflare URL:
1. Home with real seeded data → 2. set location (her area: Andheri West is in the list) → distances and Nearest → 3. Category → Handmade → sub-category → Today → 4. Search "cake", switch tabs → 5. a business: Products, **Videos (a real reel)**, Reviews → 6. a product: price, details, delivery pills, buttons → 7. paste the product link into WhatsApp → preview card → 8. show the **audit closure table** (`07_QA_AND_SIGNOFF.md` §3) and the Week 3–6 plan → 9. ask for written confirmation of the wording in the §6.1 message, then send the invoice (40% = ₹4,800).

Honest status of the audit table: every reviewed bug is fixed or removed on every rebuilt screen; a few items remain only inside **legacy** screens that are replaced in Weeks 3–5 (a few `console.log` calls, hard-coded Arial, one card width). The table says exactly which — say so if asked; don't claim "all fixed".

Known and expected on the demo, so don't be surprised: WhatsApp/Call buttons say "Contact opens after login" (Week 3); Saved and Profile are the old design (Week 3); the Help form says feedback isn't connected; some business logos/photos are placeholders.

---

## 9. Recording what you did

Work on a branch, not directly on `main`:
```bash
git checkout -b chore/hosted-setup-2026-10-07
```
- Add an entry at the top of `docs/PROGRESS.md` ("Log") using its template: what you ran, the **results** of the four SQL checks, the `migration list` output, the curl results for step 6, which phones you tested.
- In `docs/TRACKER.md`: tick **F5**, **R1-1**, **A1.7**, **A2.1**, **A2.3** (and **A1.6** in the "Done before" line) — only after their checks passed.
- Update the "Blocked" and "Needs you" lines at the top of PROGRESS.
- Commit, push the branch, open a PR on GitHub, have Daiwang review and merge.

---

## 10. If something goes wrong

| Symptom | Likely cause | What to do |
|---|---|---|
| Product/Business page shows "Something went wrong" on the hosted site | `VITE_DATA_SOURCE=supabase` but migrations 0008/0009 not pushed | set it back to `mock`, redeploy, finish §2 |
| Everything blank, console says "Missing VITE_SUPABASE_URL…" | variables set only for Preview or only for Production, or no redeploy | set both environments, redeploy |
| Console says "VITE_SUPABASE_ANON_KEY holds a privileged key" | the wrong (secret) key was pasted | use the **anon/publishable** key; rotate the secret key you pasted |
| `db push` error | see §2b | send the full error text |
| `/p/anything` shows Cloudflare's 404 | wrong output directory | build output must be `dist` |
| Link preview card missing | WhatsApp cache, or runtime variables missing | add `?v=2`; check the three non-`VITE_` variables; redeploy |
| Pending/rejected business visible | should be impossible | stop, screenshot, tell Daiwang — that's a data-privacy bug |
| Seed refuses to run | `SEED_ALLOWED_REF` doesn't match the URL host | fix `.env.seed`; this guard exists so production is never seeded |

Nothing in this handoff requires changing application code. If you think it does, tell Daiwang first.

---

## 11. What comes after (so you know where this is heading)

After Milestone 1: Week 3 (12–16 Oct) builds accounts — sign-up/login, the login gate before WhatsApp/Call, saved items, recently viewed, profile. That needs the **domain + Resend SMTP** (item in §7) and `docs/build/prompts/WEEK3_DEEP_DIVE.md`. Several parked items from the code review are noted for it in the PROGRESS entry "Review fixes" (auth subscription shape, clearing the query cache on sign-out, the database hardening list).
