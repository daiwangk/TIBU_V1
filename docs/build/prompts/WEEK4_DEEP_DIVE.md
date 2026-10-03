# Week 4 — Deep Dive (Mon 19 – Fri 23 Oct 2026, + Sat 24 as buffer)

The seller side, the admin panel, the image pipeline, the chat backend — and Milestone 2. Prompt text: `prompts/W4_seller_admin_enquiry_backend.md`, plus the **R3, R4 and A4.2 add-ons** in `REV2_TASKS.md`.

---

## The week in one sentence

A brand-new seller signs up from `/sell` on her phone, builds her shop with real photos, delivery time and products with sizes or weights, submits it; Laiba approves it in `/admin`; a guest in an incognito tab finds it on Home — and nobody can see or touch anyone else's shop.

That loop is Milestone 2 (30%, ₹3,600 — D35).

## The calendar is against you this week

Navratri ends with Dussehra on **Tuesday 20 Oct**. Plan three working evenings plus Saturday 24 Oct, and book the **M2 demo for Monday 26 Oct**. Tell Laiba the date in last Friday's update so it reads as a plan, not a slip.

This is also the heaviest week: about 24 AI-hours across both tracks (≈ 36 real) against roughly 32 real hours of evenings plus Saturday. Three changes make it fit:
1. **B4.2 is split in two** (S11): steps 1–3 need only A4.1; steps 4–7 need A4.2's uploads.
2. **A builds the admin panel (B4.4)** right after its own admin services (A4.3) — same mental context, and B's week is full.
3. **Seller stats** on the dashboard stay to one simple card (cut-order item 5). Rev2 §4 puts "analytics beyond basic figures" in Phase 2 anyway.

```
Mon 19   A: A4.1 seller services (+R3)            B: B4.1 sell landing → B4.2a steps 1–3
Tue 20   Dussehra — off (anyone working: A4.3 admin services)
Wed 21   A: A4.2 image pipeline (+fix)            B: B4.2a finish → test on phone
Thu 22   A: A4.3 → B4.4 admin panel               B: B4.2b steps 4–7 (+R4)
Fri 23   A: A4.4 chat backend                     B: B4.3 seller dashboard
Sat 24   A: A4.5 RLS matrix                       B: B4.3 finish · both: M2 rehearsal
Mon 26   M2 demo + invoice
```

## Before Monday

- **Logo.** Onboarding and the auth screens look unfinished with a placeholder. If Laiba hasn't sent the final logo, use the current wordmark and say so in the demo.
- **Her admin account on dev.** If SMTP isn't live yet, she can't confirm an email sign-up (Supabase only emails your own team). Create it for her: Supabase → Authentication → Users → Add user → her email + a temporary password + **Auto Confirm User**. Then promote it (runbook `06` §9). She changes the password after the demo.
- **Send `11` §6.6** — real sellers for 30 Oct – 4 Nov. Diwali is 8 Nov; sellers decide this week whether they'll have time.

---

## Monday 19 Oct

### A: A4.1 — Seller services (3 h + R3 add-on, Antigravity)

Paste the A4.1 prompt, then the **R3 add-on** from `REV2_TASKS.md` in the same message.

**What this is:** every seller write in one module. Three things to check in the plan:
- `saveMyBusiness` never writes `status`, `owner_id` or `rating_*`. The database's guard trigger would silently ignore them anyway, but code that tries hides real bugs.
- `saveMyContacts` stores **ten digits** (`9876543210`). The DB's CHECK rejects `+91…` and `91…`. Links add `91` later; storage never does.
- Location is rounded to three decimals before saving (D38). A home baker's exact coordinates would otherwise be one API call away for anyone — `businesses.lat/lng` are public so distance search works.

**Verify:** from the browser console as a test seller: `becomeSeller()` → `saveMyBusiness({...})` creates a draft with a slug like `sweet-crumbs-7k2p` · `getSubmitChecklist()` lists the missing items · `saveProduct({ price: 350, ... })` stores `price_paise = 35000` · a product with `deliveryOverride: null` has all three override columns NULL in the Table Editor (not `false`).

### B: B4.1 — Sell landing + seller gate (1.5 h, Cursor), then start B4.2a

B4.1 is small: the `/sell` page, the gate around `/seller/*`, and the hooks file. Then start **B4.2a** — use S11 to split B4.2 and take the first half:

> **B4.2a:** wizard shell (OnboardingPage, ProgressHeader, Back/Next, resume-at-first-incomplete-step), steps 1 Basics, 2 Location, 3 Contact, each saving on Next. Paste the B4.2 prompt *and* the R4 add-on, and say "only the wizard shell and steps 1–3 in this session".

**Why step 1 must save immediately:** storage only accepts uploads into the folder of a business you own (CONTRACT §13). No draft row → no folder → every logo upload in step 4 fails.

---

## Tuesday 20 Oct — Dussehra

Take it off. If one of you has an hour: **A4.3 admin services** (1.5 h, Cursor) is self-contained and unblocks Thursday.

---

## Wednesday 21 Oct

### A: A4.2 — Image pipeline (2 h, Cursor) — paste the fix below with it

**Correction to the A4.2 prompt.** It says uploads go to "typically `<bucket>/<uid>/<uuid>.webp`". That's wrong for this database: the storage policy (`0005`) checks `owns_business(first folder)`, so the first folder must be the **business id**, exactly as CONTRACT §13 lists. A `uid` path fails with "new row violates row-level security policy". Paste the **A4.2 add-on** from `REV2_TASKS.md` after the prompt.

**Verify on a real phone with real photos** (the whole point of this task):
- A 5 MB camera photo from an iPhone and one from an Android phone → the stored file is WebP and well under 500 KB (Storage browser shows sizes).
- iPhones usually convert HEIC to JPEG when a web page asks for an image; some Android phones (Samsung) can hand over HEIC files the browser can't decode. If compression throws, the user must see "Please choose a JPG or PNG photo", not a spinner forever.
- Remove an image → its file is gone from Storage too.
- Logged in as seller B, try uploading into seller A's folder from the console → refused.

**The WhatsApp preview check (D18).** Upload a real photo as a product's first image, approve the business (SQL editor, dev only), then paste its `/p/` link into WhatsApp on both phones with `?v=10`. If the preview shows the photo, WebP is fine and you're done. If it shows no image, do D18's JPEG cover now — it's a migration (prompt D1) plus a few lines here, and it matters more than any other polish this week.

### B: finish B4.2a and test it on a phone

Fill steps 1–3 on a phone, close the tab, reopen `/seller/onboarding` → it resumes at step 4 with everything kept. Check the location-privacy line is visible under the location picker and the delivery-time chips appear only when Delivery is on.

---

## Thursday 22 Oct

### A: A4.3 (if not done Tuesday) → B4.4 — Admin panel (3 h, Antigravity)

**Why A builds this:** you just wrote the admin services; the panel is a thin screen over them, and B's week is full. Use the B4.4 prompt as written.

The detail Laiba will use most: the application page must show everything she needs to **verify a seller without leaving the page** — tap-to-call phone, `wa.me` link, Instagram handle linking to the profile, a Google Maps link from the coordinates, every photo. Rev2 §3 lists "check phone number, WhatsApp number, Instagram ID and business information" — each of those is a tap.

**Verify with the seeded data:** approve the pending seed business → it appears on Home in an incognito tab · reject the other with a reason → its owner sees the reason on `/seller` · unpublish an approved one → it disappears for guests, still visible to its owner · a customer account opening `/admin` gets the friendly 403.

### B: B4.2b — Steps 4–7 (Antigravity)

Branding (logo required, banner, gallery up to 6), Products (the shared ProductForm with the R4 add-on: delivery override, category templates for details, up to 5 images), Videos (Instagram reel links), Review & submit.

**Things to try on purpose:**
- A Fashion product: the details rows prefill "Sizes available, Size chart, Fabric, Fit" and the size-chart hint appears.
- A Desserts product with "Different for this product" → no delivery, pick-up only → after approval its product page shows pick-up only while the shop shows delivery.
- Submit with no logo → the checklist links back to step 4.
- Paste a private or deleted reel link → a clear validation message, not a broken embed.

**Verify (from the prompt, still the bar):** `git grep -n "1234\|otp" src` → nothing. The fake OTP leaves with `SellerRegister.jsx`.

---

## Friday 23 Oct

### A: A4.4 — Chat backend (2 h, Cursor)

Services and hooks for the enquiry system (Rev2's "in-app chatbox", D34). No screens yet — those are B5.1. Test from the browser console with two accounts:

```
customer: sendEnquiry({ businessId, productId, body: 'Is the cake eggless?' }) → threadId
seller:   listMyThreads({ as: 'seller' }) → one thread, unreadCount 1, customerName set
seller:   sendMessage({ threadId, body: 'Yes, fully eggless!' })
customer: getUnreadCounts() → { enquiries: 1, notifications: 1 }
seller:   sendEnquiry({ businessId: <own business> ... }) → AppError forbidden
```
Customer messages always go through `sendEnquiry` (it carries the 20/hour rate limit); only sellers use `sendMessage`.

### B: B4.3 — Seller dashboard (4 h, Antigravity; finish Saturday)

Replaces the 2,037-line `SellerDashboard.jsx`. The Available Today switch matters most: Rev2 §3 makes "Available Today" a manual seller toggle, and the Home section depends on it. Keep stats to one card (WhatsApp taps, calls and messages in 30 days, rating) — that's Rev2's "basic figures".

**Verify:** toggle Available Today → Home's section shows the shop within a minute (React Query stale time) · edit the description of an approved shop → it stays approved (D23) · delete a product → gone from the public page · `ls src/SellerDashboard.jsx src/SellerProductDetail.jsx` → no such files.

---

## Saturday 24 Oct

### A: A4.5 — RLS role matrix (1.5 h, you + Claude.ai)

**Why it's not optional:** this is the test that real customers rely on and will never see. Four accounts on dev (customer, seller A, seller B, admin). For each, get the access token: log in on the dev app → DevTools → Application → Local Storage → the `sb-<ref>-auth-token` key → copy `access_token`. Then:

```bash
URL=https://<dev-ref>.supabase.co; ANON=<anon key>; JWT=<seller B's access_token>
# seller B must NOT see seller A's contacts, draft, or chats:
curl -s "$URL/rest/v1/business_contacts?select=*" -H "apikey: $ANON" -H "Authorization: Bearer $JWT"
curl -s "$URL/rest/v1/businesses?select=slug,status&status=neq.approved" -H "apikey: $ANON" -H "Authorization: Bearer $JWT"
curl -s "$URL/rest/v1/enquiries?select=*" -H "apikey: $ANON" -H "Authorization: Bearer $JWT"
# and must not approve itself:
curl -s -X POST "$URL/rest/v1/rpc/admin_set_business_status" -H "apikey: $ANON" -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" -d '{"p_business":"<B business id>","p_status":"approved","p_reason":null}'
```
Expected: only B's own rows; the RPC refuses. Walk the full matrix in `docs/kit/09_Testing_QA_Launch.md` §3 and record pass/fail per row in PROGRESS. **Tokens are credentials** — don't paste them into any AI chat; they expire in an hour anyway. If a row fails, paste the policy and the result (not the token) into Claude.ai with prompt D4.

### Both: M2 rehearsal (1 h)

Run the demo script below once, end to end, on two phones. Fix only what blocks it.

---

## Milestone 2 demo (Mon 26 Oct, 20 minutes)

Laiba on her own phone; you on yours.

1. **She signs up as a seller** at `/sell` (or logs into the pre-made seller account if SMTP isn't live) and does the onboarding with photos from her gallery: name, category, area, delivery time, phone/WhatsApp, Instagram, logo, one product with a size or weight row. Submit.
2. **She approves it** in `/admin` from her admin account — calling attention to the phone, WhatsApp and Instagram links she can tap to verify.
3. **Incognito tab:** her shop appears on Home ("New businesses") and in Search.
4. **As a customer**, open her product → tap WhatsApp → log in → WhatsApp opens with the pre-filled message and link; paste the link into a chat → preview with her photo.
5. Back in her seller dashboard, switch **Available Today** on → refresh Home → it's there.
6. Close with: "Next week: the chat screens, reviews, notifications on the phone, and going live on your domain."

Then send `11_SOW_REV2_CHANGES.md` §6.3 with the **₹3,600 (30%)** invoice. Log new requests in `PHASE2_BACKLOG.md`.

---

## End-of-week review

1. PROGRESS: RLS matrix results; every remaining legacy file in `scripts/legacy-allowlist.json` (it should be down to the notification screens, contexts and `LegacyPage`).
2. Waiting on client: domain (critical now — production is next week), privacy policy and terms text, support phone/email, logo, launch sellers.
3. Next week has production. If the domain isn't bought by Monday, production goes live on `tibu-v1.pages.dev` with a promise to switch — say it plainly in the update.
