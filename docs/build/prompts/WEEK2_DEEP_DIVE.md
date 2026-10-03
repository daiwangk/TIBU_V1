# Week 2 — Deep Dive (weekend 3–4 Oct + Mon 5 – Fri 9 Oct 2026)

Day-by-day walkthrough for closing Week 1 and building Milestone 1. The prompt text lives in `prompts/W2_catalog_and_milestone1.md` (and `REV2_TASKS.md` for R-tasks). This file tells you when to do each task, why, what "done" really looks like, and where it usually breaks.

Read it once on Saturday morning. Then each evening, open only that day's section.

---

## The week in one sentence

By Friday, Laiba opens a link on her phone, sees the rebuilt Home, Category, Search, Business and Product pages on **real database data**, picks her area and gets real distances, pastes a product link into WhatsApp and sees its photo — and agrees that's worth the first 40%.

## Where you're starting from

Merged on `main` (`5212f7e`): B1.1–B1.6, A1.2–A1.4, A1.6. Open: **B1.7, B1.8, A1.5, A1.7**, plus the F5 database checks and R1 from `10_REPO_REVIEW_2026-10-02.md`. Five evenings can't hold both those and all of Week 2, so the weekend closes Week 1.

## Who does what this week

B's original Week 2 list is about 23 real hours (AI estimates × 1.5); five evenings of 6–10 PM is 20. A's list is about 12. So two tasks move to A: **R2** (Rev2 page fields) and **B2.4** (cleanup — mechanical, perfect for Cursor). With that change both tracks fit.

```
Weekend   A: F5 checks → R1 part 1 → A1.5 (patch 0003) → R1 part 2 → A1.7        B: B1.7 → B1.8
Mon 5     A: A2.1 real data on preview                      B: B2.1 Home
Tue 6     A: A2.2 location store                            B: B2.2 Category
Wed 7     A: A2.3 WhatsApp previews                         B: B2.3 Search
          ── checkpoint: decide Fri or Mon demo ──
Thu 8     A: R2 page fields → A2.4 errors → B2.4 cleanup    B: B2.6 location UX
Fri 9     both: B2.5 QA, fixes, rehearsal → M1 demo (or Mon 12)
```

If only five things happen this week, make them A1.5, A2.1, B2.1, B2.3 and A2.3. That's "real data, the front door, search, and the WhatsApp preview" — the core of the demo.

---

## Weekend (Sat 3 – Sun 4 Oct) — close Week 1

### A: the F5 checks (15 min — do these before anything else)

PROGRESS says the migrations were pushed on 27 Sep before the `supabase/` folder entered the repo. Confirm the hosted database matches the repo:

```bash
git checkout main && git pull
npx supabase projects list        # the ● LINKED project must be tibu-dev
npx supabase migration list       # Remote column: ...0001 through ...0007
```
If `20260927000007` is missing on the remote side, run `npx supabase db push` — it applies only what's missing. Then run the zero-rows RLS query and the psql smoke test (runbook `06` §3–§4). Write all three results in PROGRESS. These are the guarantees every later week stands on: if a table had no RLS, seller phone numbers would be one API call away.

### A: R1 — Rev2 schema and contract v1.2 (1.5 h)

Prompt in `REV2_TASKS.md`. Part 1 is you in the terminal (copy migrations 0008 and 0009, `db push`); part 2 is Cursor updating `CONTRACT.md`, `DECISIONS.md`, `AGENTS.md` and the mock.

**Why now and not Week 4:** contract v1.2 adds `deliveryTime`, `establishedYear` and the product delivery values. Doing it before A1.5 means the Supabase mapper is written once, with the new fields, instead of written Saturday and patched Thursday. Both migrations are additive (new nullable columns, a new table) — they can't break anything B1.7/B1.8 are building.

**Common trip-up:** the agent "helpfully" renames contract fields or reformats the whole file. The R1 prompt says "apply §4 exactly". Check `git diff docs/CONTRACT.md` — you should see only additions plus the header line.

### A: A1.5 — Supabase client and catalog adapter (30 min with the patch, the pivot)

**Use the tested patch:** `patches/0003-a1-5-supabase-catalog.patch` in the update kit implements the whole task and was tested against a live PostgREST. Follow `patches/README.md`: apply → `npm run check` → run the live test against tibu-dev (12 passed) → PR → `/tibu-review` in Antigravity. Order: R1 Part 1 → this patch → R1 Part 2. The prompt route below still works if you prefer to build it with an agent.


Prompt in `W1_stabilize_and_backend.md`, **plus the A1.5 add-on** from `REV2_TASKS.md`. First copy the tested details helper:
```bash
git checkout -b feat/a1-5-supabase-catalog
cp ../tibu-update-2026-10-02/reference/src/services/supabase/details.* src/services/supabase/
```

**Why the add-on matters:** the seed stores product details as `{"weight":"500g","shelf_life":"10 days"}`, but every page expects `[{label:"Weight", value:"500g"}]`. Without `detailsFromDb()`, the Details section on every real product is blank — and nobody notices until the client opens a product during the demo.

**Verify like Week 1 taught you** (full list in `WEEK1_DEEP_DIVE.md` Thursday): `.env.local` with `VITE_DATA_SOURCE=supabase`, open a seeded `/p/<uuid>` — the price must read **₹350**, not ₹35,000 (paise bug); Details shows "Shelf life: 3 days"; flip back to `mock`, restart, everything still works.

### A: A1.7 — Auth URLs (30 min)

Supabase → Authentication → URL configuration: Site URL `https://tibu-v1.pages.dev`; redirect URLs `http://localhost:5173/**` and `https://*.tibu-v1.pages.dev/**` and `https://tibu-v1.pages.dev/**`. SMTP waits for the domain (Week 3).

### B: B1.7 — Product page (2 h), then B1.8 — Business page (3 h)

Prompts in `W1_stabilize_and_backend.md`; the full verify ritual is in `WEEK1_DEEP_DIVE.md` (Friday). The one test that matters most: copy a `/p/<id>` URL, paste it into a **fresh incognito window**, hard-refresh. If it only renders when you navigate from inside the app, WhatsApp links are still broken.

Build on mock data (`VITE_DATA_SOURCE=mock`) — don't wait for A1.5. If R1 merges first, the mock already has `deliveryTime` and friends; leave them for R2, don't add them now.

**Sunday night:** both of you update PROGRESS "Now", tick the tracker, and check quotas. Antigravity resets weekly — if it reset over the weekend, B has a full allowance for Monday's Home page.

> **If the weekend didn't happen:** do the weekend list Monday and Tuesday, start Week 2 on Wednesday, and send the client a one-line note Monday: "Milestone 1 demo will be Monday 12 Oct instead of Friday." SOW §9 covers it; a Monday message reads as planning, a Friday message reads as a slip.

---

## Monday 5 Oct

### A: A2.1 — Real data on the preview (1.5 h)

**What this is:** the moment the hosted app stops showing fake data. Cloudflare Pages → Settings → Environment variables. Set **both Preview and Production** (Production is what `tibu-v1.pages.dev` serves from `main`, and that's the URL you'll demo):
```
VITE_DATA_SOURCE = supabase
VITE_SUPABASE_URL = https://<dev-ref>.supabase.co
VITE_SUPABASE_ANON_KEY = <anon key>
VITE_SITE_URL = https://tibu-v1.pages.dev
```
Redeploy (Deployments → ⋯ → Retry deployment). `VITE_*` values are baked in at build time — changing them without a rebuild does nothing.

Keep `.env.local` defaulting to `mock` on B's machine so B can work offline and on fixtures.

**Verify:** walk every rebuilt page on the deployed URL. Seeded businesses appear with photos; the pending and rejected seed businesses never appear anywhere (search for their names); ratings show; no console errors. Any shape mismatch is fixed in `src/services/supabase/mappers.js`, never in a page.

**Common trip-up:** the page shows "Something went wrong" only on the deployed site, not locally. Nine times out of ten that's a missing or misspelt env var in one of the two environments. Open DevTools → Network → the failing request's URL.

### B: B2.1 — Home page (3 h, Antigravity planning mode)

**What this is:** the front door, and the screen Laiba will judge the whole milestone on. Rev2 §3 lists exactly what it needs: branding, hero, search bar, category shortcuts, New Businesses, New Products, Available Today. The prompt adds "Near you" when a location is set.

**Two details the prompt encodes that are easy to "fix" wrongly:**
- "New" and "Available today" rows pass `radiusKm: null` (D30). Without it, the SQL's default 15 km radius hides most of Mumbai the moment someone sets a location.
- The Available Today row shows products, and its "View all" opens Search with the today filter, where the Businesses tab shows shops marked available. That's how both halves of Rev2's "businesses/products marked available" are covered.

**Verify:** each section in all four states (DevTools → Network → Slow 4G for skeletons; an empty category; a wrong Supabase URL for the error state) · every card opens `/p/…` or `/b/…` · 360, 390 and 430 px with no sideways scroll · one S13 mockup comparison pass, not three.

---

## Tuesday 6 Oct

### A: A2.2 — Location store (2 h, Cursor)

**What this is:** one persisted place for "where is the customer", feeding every search. The detail that matters is in step 2 of the prompt: `useSearchOrigin()` must return the **same object** until the coordinates actually change. If it returns a new `{lat, lng}` every render, every query key changes every render and the app refetches in a loop — the network tab fills with identical requests.

**Verify:** in the console, set an area through the store → Home's "Near you" appears and cards show distances · reload keeps it · clear removes distances · Network tab: no repeated identical search calls while idle.

### B: B2.2 — Generic CategoryPage (2 h)

One page replaces eleven. The test that proves the taxonomy is finally right: `/category/handmade` shows chips for Crochet, Embroidery, Resin Art and Candles, and the results include items from all four. That exact bug class (four different slug schemes) white-screened half the prototype.

"Load more" must page with `offset` and hide when a page returns fewer than 20 rows. Never raise `limit` — SQL caps it at 50 silently (`09_SQL_RECONCILIATION` T3), so a growing limit just stops working after the second tap.

**Verify:** the prompt's list, plus `git ls-files src | grep -E "Desserts|Crochet|Handmade"` → nothing.

---

## Wednesday 7 Oct

### A: A2.3 — WhatsApp link previews (2.5 h)

**Why this is the most important backend task of the milestone:** Rev2 §3 promises that the seller sees the product image when a customer's WhatsApp message arrives. That only happens if WhatsApp's crawler, fetching `/p/<id>`, gets per-product Open Graph tags. A single-page app serves the same generic `index.html` for every URL, so without this function every preview shows the Tibu logo at best.

The starting code is in `docs/kit/snippets/functions/` (restored by the update kit). The prompt already includes the two known fixes: fetch `/` rather than `/index.html` (Pages redirects the latter, which breaks the rewrite), and return the plain page on any error, never a 500.

Add to Cloudflare Pages env (Preview and Production): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SITE_URL` — **without** the `VITE_` prefix; functions read them from `context.env`.

**Verify — on real phones, not just curl:**
```bash
curl -s -A "WhatsApp/2.23.20" https://tibu-v1.pages.dev/p/<seeded-uuid> | grep -E "og:(title|image|description)"
```
Then send the link to yourself on WhatsApp from an Android phone and an iPhone. You need a card with the photo, name and price. WhatsApp caches previews per URL: after any change, test with `?v=2`, `?v=3`. The seed's images are JPEGs, so they should preview; real uploads (WebP) are tested again in A4.2 (D18).

### B: B2.3 — Search page (3 h)

URL state is the whole point: `/search?q=cake&tab=businesses&today=1` must reload into exactly the same view, and Back must step through searches, not dump you on Home. Debounce input to 300 ms; write URL params with `replace: true` so typing doesn't create forty history entries.

**Verify:** the prompt's list; plus search "crochet" and confirm crochet products appear (an audit bug).

### ⏱ Wednesday checkpoint (10 minutes, together)

If B2.1 and B2.2 are merged and A2.1 and A2.2 are merged: keep the **Friday** demo. If not: book **Monday 12 Oct** and message the client Thursday morning. Don't spend Thursday and Friday rushing — a rushed demo that shows a bug costs more than a weekend's delay.

---

## Thursday 8 Oct

### B: B2.6 — Location UX (2 h, Cursor)

The chip, the area picker and the first-visit prompt. Non-negotiable detail: **never trigger the browser's location prompt on page load.** It appears only when the person taps "Use my location". Browsers remember a "Block" forever, and a first-second popup gets blocked most of the time.

**Verify on a real phone over HTTPS** (geolocation doesn't work on plain `http://` LAN addresses): pick "Andheri West" → distances appear and "Nearest" sorts increasing · deny GPS → friendly message, area list still works.

### A: R2 — Rev2 fields on the public pages (1.5 h, Cursor)

Prompt in `REV2_TASKS.md`. Delivery/pick-up chips with the expected time, "Est. 2019", the Details rows (now real, thanks to the A1.5 add-on), and the rating line on the product page. These are Rev2 items Laiba will look for by name in the demo, so they belong in Milestone 1 even though they look small.

**Verify:** the product with an override shows its own values; a product without one shows its business's.

### A: A2.4 — Error toasts (1 h), then B2.4 — Cleanup (2 h)

A2.4 makes failures consistent (offline → "You're offline", no toast for `auth_required`). B2.4 ports the static pages, adds the 404, and **deletes** the view-all, reel and dead service files. It needs B2.1–B2.3 merged (Wednesday night). It's mechanical and Cursor does it well — mostly `git grep` and deletion.

The B2.4 verify item that's easy to skip: `node scripts/check-guards.mjs` must print **no stale-allowlist warnings**. Every deleted legacy file must leave the allowlist in the same PR.

---

## Friday 9 Oct — B2.5 QA, then the demo

### Both: B2.5 — QA pass (2 h)

Run the Antigravity browser-agent prompt from `W2…` against `https://tibu-v1.pages.dev` at 360, 390 and 430 px. Fix **blockers and majors only**, each as a small S7 task. Minor issues go into PROGRESS for Week 3 — don't polish on demo day.

Then fill the audit closure table (`07_QA_AND_SIGNOFF.md` §3): every bug from the original review, with "fixed (PR #)", "eliminated by rebuild (PR #)" or "removed as Phase 2 (PR #)". **This table is the 40% payment.** Rev2 §8 ties the first payment to "all identified bugs fixed"; the table is how she checks it in two minutes.

Also confirm every remaining legacy screen (Profile, Saved, Notifications, Edit profile, seller pages) still opens without a console error. They're rebuilt in later weeks, but nothing reachable may crash at a milestone.

### Rehearse once on a real phone, then demo

Use `07` §4's script with three changes for Rev2:
- Step 5: on the Business page, point out the delivery/pick-up chips, delivery time and "Est." badge.
- Step 6: on the Product page, show the Details rows and the rating line.
- Step 7: the WhatsApp preview — do this live; it's the moment that sells the milestone.

For the Videos tab you need one real public Instagram reel. If Laiba hasn't sent any links yet (master guide §7), ask for one today; add it to a seeded business with the seed's `REELS` variable and re-run the seed.

After the call: send `11_SOW_REV2_CHANGES.md` §6.2 with the **₹4,800 (40%)** invoice, and record in PROGRESS which decisions she confirmed (D10, D12, D22, D23, D27, D33, D35, D38). Anything new she asks for → `docs/PHASE2_BACKLOG.md` with today's date, and "Noted for Phase 2" in the chat.

---

## End-of-week review (Saturday, 20 minutes)

1. **Exit check:** on a phone, incognito, `https://tibu-v1.pages.dev`: Home → set area → Category → Search → Business (three tabs) → Product → paste the link into WhatsApp. All real data, no console errors.
2. RLS zero-rows query once more.
3. PROGRESS: tick what's merged; "Waiting on client" — domain (date asked), decisions (date asked), reel links, logo.
4. **Domain check:** if she hasn't bought it by now, say plainly this week that customer sign-up testing in Week 3 is limited to your own email addresses until she does (`10` F6).
5. Quotas: who has Antigravity left for Week 3's B3.1 and B3.5 (both multi-file)?
