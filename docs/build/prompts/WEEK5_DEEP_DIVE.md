# Week 5 — Deep Dive (Mon 26 – Fri 30 Oct 2026)

Chat screens, reviews, notifications (in-app and push), the last legacy code, and production on Laiba's domain. Prompt text: `prompts/W5_W6_enquiry_reviews_notifications_launch.md`, plus `REV2_TASKS.md` (R5, R6, the B5.1 add-on and the B5.3 change). Push guide: `docs/build/12_PUSH_NOTIFICATIONS.md`.

---

## The week in one sentence

By Friday, Tibu is live on her domain with an empty production database, every SOW Rev2 item passes on a real Android phone and a real iPhone, and the first real sellers can start onboarding in time for Diwali (Sun 8 Nov).

## The order, and why production can't wait until Friday

Production (A5.2) is the task most likely to hit something outside your control: DNS propagation, a paused Supabase project, an email landing in spam. So it goes **Tuesday**, not Friday, leaving three evenings to fix surprises before sellers arrive.

Hours: A about 12 AI-hours (≈ 18 real), B about 12 (≈ 18 real) — with one change from the original file: **A builds reviews (B5.2)**, because B carries chat, notifications and push UI.

```
Mon 26   both: M2 demo (30 min) · A: A5.1 notifications service   B: B5.1a chat — customer side
Tue 27   A: A5.2 production                                         B: B5.1b chat — seller side + badges
Wed 28   A: R5 push backend (dev)                                   B: B5.3 notifications UI + last legacy deletion
Thu 29   A: B5.2 reviews → A5.4 lazy routes                         B: R6 push frontend  → push cut decision tonight
Fri 30   A: A5.3 ops + push on prod                                 B: B5.4 a11y fixes → B5.5 real-device regression on prod
         Laiba starts onboarding real sellers on prod
```

## Before Monday

- **Domain:** bought, and you have DNS access. If not, production goes live on `tibu-v1.pages.dev` this week and moves to the domain later. Links people share keep working because the `pages.dev` address stays live after a custom domain is added.
- **Legal text:** her privacy policy, terms, and support phone/email are needed by Friday (static pages from B2.4 still show "Draft"). The privacy policy must mention three things you built: admins can read chat messages (D31), push notifications are optional, and seller locations are shown approximately (D38). You can help her draft it in Claude.ai, but she owns the text and should have it checked — you aren't lawyers.
- **Icons for push and the home-screen install:** `icon-192.png`, `icon-512.png`, `icon-512-maskable.png`, `badge-72.png` from the final logo (R6).

---

## Monday 26 Oct

### Both: the M2 demo (30 min)

Script at the end of `WEEK4_DEEP_DIVE.md`. Invoice (`11` §6.3, ₹3,600) the same day.

### A: A5.1 — Notifications service + digest check (1.5 h, Cursor)

Small, but three things wait on it: B5.3's screens, the unread badges, and push (every push is a copy of a notification row).

**Manual check that matters more than the code:** `select * from cron.job_run_details order by start_time desc limit 10;` → both nightly jobs show `succeeded`. Then create an approved business near a test customer's home area, run the digest job by hand (the exact call is in `supabase/cron.sql`), and confirm the customer gets **one** grouped notification ("… new businesses joined Tibu near Andheri West"), not one per business. That's Rev2's grouped-updates sentence.

### B: B5.1a — Chat, customer side (Antigravity)

Use S11 to split B5.1. Paste the B5.1 prompt **and the B5.1 add-on** (Rev2 naming), then say: "this session: the Chat-with-seller button, EnquirySheet, InboxPage and ThreadPage for the customer only".

**Naming (D34):** the button says "Chat with seller", the inbox is "Messages" — but routes stay `/enquiries/...`, because the database writes those exact paths into notifications (CONTRACT §14). Rename a route and every notification link breaks silently.

---

## Tuesday 27 Oct

### A: A5.2 — Production (3 h, you; runbook `06` §10)

Step by step, with the traps:

1. **Restore `tibu-prod`.** It was created on 27 Sep and has almost certainly paused (free projects pause after about a week idle). Dashboard → the project → Restore. Confirm the region is Mumbai.
2. **Link and push — carefully:**
   ```bash
   npx supabase link --project-ref <prod-ref>
   npx supabase projects list           # ● LINKED = tibu-prod
   npx supabase db push                 # 0001–0009
   ```
   **No seed script and no smoke test on prod** — the smoke test creates fake users.
3. Enable pg_cron, run `supabase/cron.sql`.
4. **Auth:** Site URL `https://<domain>`; redirect URLs `https://<domain>/**` (and `https://tibu-v1.pages.dev/**` while both exist). SMTP exactly as dev (Resend, same verified domain). Copy the branded templates.
5. **Cloudflare Pages → Production environment** (it pointed at dev since A2.1): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` → prod; `VITE_SITE_URL` and `SITE_URL` → `https://<domain>`. Preview keeps pointing at dev — that's your staging. Redeploy `main`.
   **Whose Cloudflare account is this?** If the Pages project lives in your account rather than Laiba's, decide now: as far as I know Pages projects can't be moved between accounts, so the clean path is to create the production Pages project in her account (connected to this repo, same build settings and env vars) and attach her domain there. Doing it now avoids redoing DNS on handover night (`WEEK6_DEEP_DIVE.md`, transfers step 2).
6. **Custom domain:** Pages → Custom domains → add `<domain>` and `www.<domain>`. An apex domain (no `www`) needs the domain's nameservers on Cloudflare (free). If you move the nameservers, check that the Resend SPF/DKIM records came across in Cloudflare DNS before you switch — otherwise sign-up emails stop.
7. **RLS probes against prod** (runbook §5) with the prod anon key. Record the results.
8. **Laiba's admin account:** she signs up on the domain (real email confirmation now), then you promote it in the SQL editor (runbook §9).
9. **Re-link the CLI to dev** and write "CLI linked to: dev" in PROGRESS. The most dangerous moment in the whole project is next week's `db push` going to prod by accident.

**Verify:** on your phone, `https://<domain>` loads with an empty Home (designed empty states, not errors) · sign up with a new Gmail address → email arrives, not in spam → logged in · `/admin` works for Laiba.

### B: B5.1b — Chat, seller side + unread badges

`/seller/enquiries` and the thread view reusing the customer components with `as: 'seller'`; the Profile dot and the dashboard "Messages" card.

**Verify (two phones, two accounts):** customer sends from a product → seller sees it within 60 s or on refresh, with the product chip → replies → customer sees the reply and a notification · on iPhone, focusing the composer doesn't hide it behind the keyboard · a 2,000-character message wraps · non-real-time is the design (D20): no typing dots, no "seen".

---

## Wednesday 28 Oct

### A: R5 — Push backend on dev (2.5 h)

`REV2_TASKS.md` R5 and `12_PUSH_NOTIFICATIONS.md` §4. Part 1 is dashboard and terminal (keys, secrets, deploy, webhook); part 2 is a small Cursor task for the two services.

**The test that proves the backend before any UI exists** (`12` §5 test 1): insert a notification row for your test user in the SQL editor → Edge Functions → `send-push` → Logs shows `{"sent":0}`. A `401` means the webhook's header secret doesn't match the function's secret.

### B: B5.3 — Notifications screens + the last legacy code (2 h, Antigravity)

Apply the **B5.3 change** from `REV2_TASKS.md` before pasting: the sentence "No browser push permission anywhere" becomes "No browser permission prompt here; R6 adds the push switch below the digest switch."

This task empties `src/legacy/`, `src/contexts/`, `src/hooks/` and the allowlist. **Verify:** `node scripts/check-guards.mjs` reports 0 allowlist entries · every route in `03_ARCHITECTURE_TARGET.md` §3 loads · the bell badge caps at "9+".

---

## Thursday 29 Oct

### A: B5.2 — Reviews (2.5 h, Cursor)

Write, edit and delete a review; the seller's read-only reviews page. Rev2 confirms the rating is a simple average (the database trigger already does this).

**Verify:** customer gives 4★ → the business rating and count update on the next load · the shop owner doesn't see "Write a review" on their own business · editing replaces, not duplicates (one review per customer per business).

### A: A5.4 — Lazy routes (1 h, Cursor)

Report the bundle size before and after. The 580 kB warning from Week 1 should be gone. Then load every route once — a lazy route with a wrong import path only fails when you open it.

### B: R6 — Push frontend (2.5 h, Cursor)

Copy the tested files from the update kit first (`REV2_TASKS.md` R6), then paste the prompt. The rule that keeps this in scope: the browser asks for permission **only** when someone flips the switch in Notification settings. Rev2 says customers must be able to use Tibu fully without granting permission.

### ⏱ Thursday night: the push cut decision (D33)

On a real Android phone, on the dev preview: turn push on → have a second account send a chat message → does the notification arrive with the phone locked? 

- **Yes** → keep it; set up push on prod Friday.
- **No, and the cause isn't obvious** → stop. Hide the switch, leave the table and function in place, send `11` §6.5 to Laiba, log push in `PHASE2_BACKLOG.md`. In-app notifications (bell, badges, pop-up toasts) cover the SOW's main requirement; push is "where the platform supports them". A Friday spent debugging push is a Friday not spent on the regression run.

---

## Friday 30 Oct

### A: A5.3 — Ops (1.5 h) + push on prod (30 min)

- **Keep-alive:** enable `.github/workflows/keepalive.yml` with repo secrets `SUPABASE_URL` and `SUPABASE_ANON_KEY` (prod). Run it once by hand from the Actions tab → green.
- **First backup:** `npx supabase db dump --linked -f backups/prod-$(date +%F).sql` while linked to prod, then **re-link to dev**. If the CLI says it needs Docker, use `pg_dump` with the Session pooler connection string instead (your local `pg_dump` must be at least the server's Postgres version — check Settings → Infrastructure). Store the file in Laiba's Google Drive, never in git — it contains personal data.
- **Push on prod** (only if it passed Thursday): new VAPID keys for prod, secrets on the prod project, deploy `send-push` to prod, the prod webhook, `VITE_VAPID_PUBLIC_KEY` in Pages Production env, redeploy.

### B: B5.4 — Accessibility fixes, then B5.5 — Real-device regression on prod

Run B5.4's browser-agent audit; fix blockers and majors only. Then walk `07_QA_AND_SIGNOFF.md` §2 **on the production domain** with an Android phone and an iPhone — plus these Rev2 rows, which aren't in that table:

| # | Rev2 item | Test |
|---|---|---|
| 34 | Expected delivery time + est. since on the Business page | A shop with both set shows "Delivers in 1–2 days" and "Est. 2019" |
| 35 | Product delivery override | A product set to pick-up only shows pick-up only while its shop shows delivery |
| 36 | Per-product custom fields by category | A Fashion product shows size rows; a Desserts product shows weight/serves |
| 37 | Multiple images per product | Five photos, swipeable, first is the card cover |
| 38 | In-app chat named as chat | "Chat with seller" beside WhatsApp and Call on both pages |
| 39 | Push where supported; usable without it | Android: arrives locked. iPhone tab: "Add to Home Screen" text. Denied: switch disabled, bell still works |

Every failure becomes a line in PROGRESS with a task ID. Blockers are fixed before sellers arrive; the rest go into Week 6's revision round.

### Laiba: real sellers start onboarding (from Friday evening)

They use `https://<domain>/sell`; she approves in `/admin`. Sit in on the first one (a call or WhatsApp video) — you'll learn more about the onboarding wizard in 15 minutes than from any QA pass. Note anything confusing; fix the small things Monday.

---

## Week 5 exit check

- Every row of `07` §2 (1–33) and the Rev2 rows above (34–39) passes on the production domain on both phones.
- Production has no seed or test data: `select count(*) from auth.users` shows only real people.
- `src/legacy`, `src/contexts`, `src/hooks` gone; allowlist empty; `npm run check` green; no build-size warning.
- Keep-alive green, first backup in her Drive, CLI linked to dev (written in PROGRESS).
- Prod RLS probes pass.

If something here is red on Saturday, it's Monday's first task — before the revision round message goes out.
