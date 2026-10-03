# Week 6 — Deep Dive (Mon 2 – Fri 6 Nov 2026) — revision round, launch, handover

The buffer week. Its job is to turn "it works on our phones" into "real sellers are live before Diwali, Laiba owns everything, and the final 30% is paid". Prompt sources: `prompts/W5_W6_…` (Week 6 section), `08_CLIENT_COMMS.md` §6–§7, `11_SOW_REV2_CHANGES.md` §6.4, `07_QA_AND_SIGNOFF.md` §7.

---

## The week in one sentence

By Thursday the app is launched on her domain with 3–5 real sellers and working WhatsApp previews; by Friday she has the handover pack and the final invoice; after she pays, she owns the repo and every account.

## Why the revision round starts before this week

SOW §12 includes one consolidated revision round. If you send the request on Monday and give her 48 hours, her list arrives Wednesday, and fixes collide with launch on Thursday — three days before Diwali. So send it **Friday 30 Oct** (end of Week 5), with her list due **Sunday 1 Nov night**. She'll be clicking through the app with her first real sellers that weekend anyway.

Use `08` §6 and set the dates. Ask for **one list, in one message**.

```
Fri 30 Oct   revision request sent; first real sellers onboard
Sun 1 Nov    her consolidated list due
Mon 2        triage her list + fix B5.5 blockers
Tue 3–Wed 4  in-scope fixes (small PRs) · more sellers onboard · OG check on real products
Thu 5        launch checklist → launch
Fri 6        handover pack + final invoice → transfers after payment
Sun 8        Diwali — watch the dashboards, nothing else
```

---

## Monday 2 Nov — triage

Put her list into a table in PROGRESS, one row per item, and decide each with these rules:

| Her item is… | Decision | Reply |
|---|---|---|
| Something in SOW Rev2 §3 that's broken or missing | **Fix** (in scope, no charge) | "Fixing this — it's part of Phase 1." |
| A wording, colour or spacing change to a screen that works as specified | Fix if it's under ~30 min and you're on schedule (SOW §12 lets you add small things when ahead); otherwise Phase 2 | "Done" or "Noted for Phase 2" |
| A new feature or a change to how something works (new filter, new page, payments, a feed) | **Phase 2** → `PHASE2_BACKLOG.md` | "Great idea — added to the Phase 2 list; we'll quote it together." |
| Content (her text, photos, categories) | She supplies; you paste | "Send the final text and we'll put it in." |

Send her the decided table the same evening, so there's no ambiguity about what "revision round done" means. Disagreements are cheaper on Monday than on Friday.

Also tonight: fix anything still marked blocker from Friday's B5.5 regression.

---

## Tuesday 3 – Wednesday 4 Nov — fixes and sellers

**Fixes:** one S7-sized task per item, one branch and PR each, `npm run check` green, reviewed by the other tool. No refactors this week. Every merge to `main` deploys production, so test the risky ones on their preview URL first (Preview points at dev).

**Sellers:** as each real seller is approved, paste one of their product links into WhatsApp on an Android phone and an iPhone. A real seller's first WhatsApp preview is the SOW's core promise working on real data — check it, don't assume it. If one shows no image, open the product and check its first photo uploaded (most often it's a seller who added only a gallery image).

**Watch the onboarding.** If two sellers get stuck at the same step, that's a bug, not a training issue — fix it this week.

---

## Thursday 5 Nov — launch

Walk `07_QA_AND_SIGNOFF.md` §7 line by line on production and tick it in PROGRESS:

- Prod RLS probes pass (runbook §5, prod anon key).
- Sign-up emails from her domain land in the inbox at Gmail and one other provider.
- Privacy policy and terms show her real text (no "Draft" note), with the support phone and email.
- No seed or test data: `select email from auth.users order by created_at;` shows only real people.
- Laiba is admin; 3–5 real sellers approved.
- OG preview works on the real domain.
- Keep-alive green; first backup in her Drive.
- `npm audit --omit=dev` clean.
- Lighthouse (Chrome DevTools, mobile) on Home and a Product page — note the scores in PROGRESS; don't chase them today.

Then she announces it (her Instagram, her WhatsApp groups). Stay reachable for the evening: the first hour of real traffic is when a missing env var or a full quota shows up.

**Free-tier limits to watch during Diwali week** (Supabase → Usage; Resend → Usage):
- **Resend free tier: 100 emails a day.** Every sign-up and password reset is one email. A good launch day can hit this; if the dashboard passes ~70 by evening, tell Laiba the next step is Resend's paid tier, billed to her account (SOW §5).
- Supabase database, storage and bandwidth: the Usage page shows each against the free limit. Images are the biggest consumer.
- Cloudflare Pages Functions (the WhatsApp previews): 100,000 requests a day on the free plan — far above what launch needs.

---

## Friday 6 Nov — handover pack and final invoice

Send `08` §7 with the final invoice line from `11` §6.4 (**30% — ₹3,600**). Ownership transfers **after** payment (SOW §11). Until then she has admin access to the app, not the code or the accounts.

### What goes in the handover pack

1. **Admin how-to** (one page, with screenshots): approve, reject with a reason, unpublish, republish; what each status means for the seller; how to promote another admin (the SQL in runbook §9 — or ask you during support).
2. **Operations guide:** where the app runs (Cloudflare Pages), the database (Supabase, Mumbai), email (Resend), push (Supabase Edge Function), the weekly backup routine, the keep-alive, and **the first upgrade to buy as she grows** — Supabase Pro (no pausing, daily backups), billed to her.
3. **Credentials** through a password manager share, never WhatsApp or email: Supabase, Cloudflare, Resend, the domain registrar, both VAPID key pairs, the push webhook secret.
4. **Phase 2 backlog:** every item from `PHASE2_BACKLOG.md`, plus your real hours from PROGRESS — that's what a fair Phase 2 quote is based on.
5. **Support window:** 30 days from today, so **until Sun 6 Dec 2026** (SOW §10), and what it covers.

### Transfers, after payment — one evening, in this order

Do them together on a call so she can accept each invitation live.

1. **GitHub:** repo → Settings → Danger Zone → Transfer ownership → her account or organisation. She accepts. Then re-add yourselves as collaborators only if she wants support access.
2. **Cloudflare Pages:** after the repo moves, the Pages project can lose access to it. Open Pages → the project → Settings → Builds → check the Git connection, reconnect if needed, and **trigger a deploy to prove it still builds**. If the Pages project lives in *your* Cloudflare account, plan this one in advance: as far as I know Pages projects can't be moved between accounts, so the clean path is to create the production project in her account (connected to the transferred repo, same env vars, same custom domain) and delete yours after it serves the domain. Check this in Week 5, not on handover night.
3. **Supabase:** Project → Settings → General → Transfer project → her organisation (you need to be a member of both; she can remove you afterwards). Transfer `tibu-prod`, and `tibu-dev` if she wants a staging copy. Data and settings move with the project. Check her organisation has room on the free plan before you start.
4. **Resend:** if the sending domain was verified in your Resend account, she creates her own account, adds the domain, adds the new DNS records Resend gives her, then you put **her** API key into Supabase → Auth → SMTP. Send one test sign-up afterwards. (If Resend was set up in her account from the start in Week 3, skip this.)
5. **Rotate secrets** now that they've changed hands: new Resend API key (done above), new push webhook secret (update the function secret and the webhook header together), and have her change every password.
6. **Re-test once on the domain:** sign up, WhatsApp a seller, receive a notification. Write "Handover complete" with the date in PROGRESS.

---

## Sunday 8 Nov — Diwali

Don't deploy anything. Look at the Supabase and Resend usage pages once in the morning and once in the evening. If something breaks, fix only that, in the smallest possible change.

---

## After handover — the 30-day support routine

Add a **Support log** section to PROGRESS. Every report gets one line: date, what she reported, in scope (bug in Phase 1 scope) or not (new feature, content change, third-party outage or quota — SOW §10), fix PR, date closed.

Weekly for the 30 days (15 minutes): Supabase usage, Resend usage, keep-alive green, take the weekly backup (or confirm she did), skim the browser-error reports if you set up Sentry.

When the window closes (6 Dec), send a short note: what was fixed under support, and the Phase 2 quote if she wants one.

---

## End of project

Tick the last rows of the tracker, archive the PROGRESS log, and write down your real hours per week. You built a production marketplace for ₹12,000 on free tiers — the real-hours number is the most useful thing you'll take into pricing the next one.
