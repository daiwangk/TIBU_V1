# Week 3 — Deep Dive (Mon 12 – Fri 16 Oct 2026)

Accounts, the login gate, live WhatsApp and Call, and the retention screens. Prompt text: `prompts/W3_accounts_contact_retention.md` (+ the B3.4 add-on in `REV2_TASKS.md`).

---

## The week in one sentence

By Friday, a stranger on their phone can tap WhatsApp on a product, sign up, confirm their email, and land in WhatsApp with the seller's chat open and the message already written — "Hi! I discovered your business through Tibu and I'm interested in your Chocolate Chunk Cookies (₹350)…" plus the `/p/` link.

That's the single most important sentence in the SOW. Everything this week serves it.

## Why the order matters

```
A3.1 auth services + store + guards ──┬── A3.2 login gate + reveal ── B3.2 login sheet ── B3.3 contact live
                                      ├── A3.3 saved ─────────────┐
                                      ├── A3.4 recent + connected ┴── B3.5 saved / recent / connected
                                      └── B3.1 auth pages ── B3.4 profile (also needs A3.5)
A3.5 profile location + SMTP (needs the domain)
```

A3.1 blocks everything. It's only 2.5 hours, so it goes first on Monday. B starts B3.1's screens the same evening on mock data (forms, validation, layout) and wires them to the real services Tuesday once A3.1 merges.

## Before Monday: the two client answers this week depends on

1. **The domain.** Without it Resend can't send from a verified domain, and Supabase's built-in mailer only delivers to your own project team (`10_REPO_REVIEW` F6). You can build and test the whole week with your own addresses, but no real customer can confirm an account. If she still hasn't bought it, say so in Monday's status note — it's now blocking launch, not just a nice-to-have.
2. **Email confirmation on or off (D12).** Build for "on" (the default). Get her answer in writing before B3.1 merges.

## Hours

A: about 10 AI-hours (15 real). B: about 11.5 (17 real). Both fit five evenings; neither has much slack. If you're behind by Wednesday, the cut order in `02_ROADMAP.md` starts with the digest and DB-synced recently viewed — not with anything in this week's exit check.

---

## Monday 12 Oct

*(If Milestone 1 moved to today, demo first — 30 minutes — then start.)*

### A: A3.1 — Auth plumbing, auth store, route guards (2.5 h, Antigravity)

**What this is:** the session, the profile and the guards, with no pages. Every later task asks "is someone logged in, and who?" — this is where that answer comes from.

**Three details worth checking in the plan before you approve it:**
- `signUp` passes `emailRedirectTo: ${VITE_SITE_URL}/auth/callback` and `options.data.signup_as`. The database's `handle_new_user` trigger reads `signup_as` to create the profile with the right role — a typo here makes every seller a customer.
- **Don't set `flowType: 'pkce'`** in the Supabase client. Keep the default. With PKCE, the confirmation link only works in the same browser that started sign-up; on an iPhone the Gmail app opens links in its own browser, and the confirmation fails with "code verifier not found". The default flow works in any browser.
- On `SIGNED_OUT`, `queryClient.clear()`. Otherwise the next person on a shared phone sees the previous user's saved items for a few seconds.

**Verify:** in a scratch route, `<RequireAuth>` sends a guest to `/login?next=…` · `signIn` from the browser console flips the store to `authenticated` · sign out clears cached queries · `npm run check` passes with no env vars set.

### B: start B3.1 — Auth pages (layout and forms on mock)

Build the five pages and the zod schemas tonight. In mock mode the auth services throw `unavailable_in_mock` — that's fine; you're building layout, validation messages, and the four states. Wire and test against Supabase on Tuesday after A3.1 merges.

---

## Tuesday 13 Oct

### A: A3.2 — Login gate + reveal contact (2.5 h, Antigravity)

**What this is:** the machinery behind "tap WhatsApp as a guest → log in → WhatsApp opens anyway". The pending action goes into `localStorage` with a 30-minute expiry (D11), so it survives the trip to the inbox and back.

**The two lines in the prompt that real phones punish if they're wrong:**
- Open WhatsApp and the dialler with `window.location.href = link`, **not** `window.open`. iOS Safari blocks a new window that opens after an `await`, and `revealContact` is an await.
- `whatsappLink` needs the `91` prefix (`normalizeIndianMobile` returns `91XXXXXXXXXX` for links). The database stores ten digits; links need twelve.

### A: A3.3 — Saved items (2 h, Cursor)

Optimistic save with rollback. Test the rollback on purpose: DevTools → Network → Offline, tap save — the heart fills, then un-fills with the offline toast. If it stays filled, the rollback is missing.

### B: finish B3.1 — wire the auth pages to Supabase (2 h)

Now test the real flow end to end with your own email address.

**The iPhone email trap, and how the pages handle it:** on iPhone, the Gmail app opens the confirmation link in its own in-app browser, which doesn't share storage with Safari. The person ends up confirmed and logged in *inside Gmail*, while the Safari tab they started in is still logged out — and the pending WhatsApp action is in Safari. Two small additions make this survivable (add them to the B3.1 plan):
1. The "Check your inbox" screen has a **"I've confirmed — log in"** button that opens the login form in the same tab, keeping `?next`. Logging in there resumes the pending action.
2. `AuthCallbackPage`, when there's no pending action in this browser, says: "Email confirmed. If you started on another tab or app, go back there and log in." — not a blank redirect to Home.

**Verify:** full sign-up with a real inbox, on an Android phone and an iPhone (Gmail app *and* the iOS Mail app) · wrong password → "Email or password is incorrect" · reset-password round trip · `?next=/saved` honoured · on a phone, the keyboard doesn't cover the submit button.

---

## Wednesday 14 Oct

### A: A3.4 — Recently viewed + previously connected (2 h, Cursor)

Guests' views go to `localStorage`; on login they're pushed to the database oldest-first and the local list is cleared. "Previously connected" calls `my_connected_businesses`, which returns newest first only because of migration 0007 — the F5 check confirmed it's applied. If the list ever looks random, check that first.

Rev2 §3 defines previously connected as "contacted **or viewed** before". Connected (WhatsApp/Call taps) and Recently viewed are two lists on the Profile page; together they cover that sentence.

### B: B3.2 — Login sheet (2 h, Cursor)

A bottom sheet with the same login form, titled by what the person tried to do ("Log in to contact Sweet Crumbs"). Extract `LoginForm.jsx` from `LoginPage` and reuse it — two copies of a login form drift apart within a week.

### B: B3.3 — WhatsApp and Call live (1.5 h, Cursor)

Small diff, biggest moment. Test on two real phones and read the message character by character against CONTRACT §10. Then check "Previously connected" shows the business at the top.

---

## Thursday 15 Oct

### A: A3.5 — Profile location default + SMTP live (1 h + DNS waiting)

**Resend setup** (when the domain exists):
1. Resend → Domains → Add `mail.<her-domain>` (a subdomain keeps her main domain's email reputation separate).
2. Add the DNS records Resend shows (SPF, DKIM) at her DNS provider. If the domain is on Cloudflare, it's two minutes. Add a DMARC record too: `_dmarc.mail` TXT `v=DMARC1; p=none;` — Gmail is stricter about unauthenticated senders.
3. Wait for "Verified" (minutes to a few hours).
4. Supabase → Authentication → SMTP: host `smtp.resend.com`, port `465`, user `resend`, password = a Resend API key with sending access only, sender `Tibu <hello@mail.<domain>>`.
5. Brand the "Confirm signup" and "Reset password" templates; keep `{{ .ConfirmationURL }}`.

**Verify:** sign up with a Gmail address and one other provider (Outlook or Yahoo) — both land in the inbox, not spam. Resend free tier allows 100 emails a day and 3,000 a month; that's plenty for launch.

If the domain still isn't ready: note it under "Waiting on client" with the date you first asked, and keep testing with your own addresses. Under SOW §9 this pause doesn't count against your timeline — but only if it's written down.

### B: B3.4 — Profile and Edit profile (2 h, Antigravity)

Paste the **B3.4 add-on** from `REV2_TASKS.md` after the prompt (the settings link goes to `/notifications/settings`). This task deletes `ProfileContext.jsx`; `git grep -n useProfile src` must return nothing before the PR goes up.

The phone number on a customer profile is optional (Rev2: "name and phone/account information"). Validate it only when entered.

---

## Friday 16 Oct

### B: B3.5 — Saved, Recently viewed, Previously connected (3 h, Antigravity)

Three screens and a live `SaveButton` everywhere. Deletes `SavedContext.jsx`, `Saved.jsx` and the legacy cards, if nothing imports them.

**Verify:** save as a guest → login sheet → after login the item is saved · unsave from the Saved list removes it immediately · view three products as a guest, log in → they appear in Recently viewed in the right order.

### Both: the exit check (on two real phones)

Incognito, on `https://tibu-v1.pages.dev`:
1. Open a product → tap WhatsApp → login sheet → "Create an account" → sign up.
2. Confirm from the email (Android: Gmail app; iPhone: Gmail app, then the iOS Mail app on a second account).
3. Back in the original tab, log in if needed → **WhatsApp opens** with the right number and the exact message and link.
4. Profile → Previously connected shows the business; Recently viewed shows the product.
5. Save a business and a product → both appear under Saved.
6. Call from the Business page opens the dialler with +91.

If any step fails, it's Monday's first task — don't start seller work on a broken contact flow.

---

## End-of-week review (20 minutes)

1. PROGRESS: tick merged tasks; record which phones/apps you tested sign-up on.
2. Supabase → Authentication → Users: delete the test sign-ups you don't need (keep one customer, one seller and one admin for Week 4's RLS matrix).
3. Waiting on client: domain, D12 answer, logo (needed for Week 4's auth screens and Week 5's push icons), reel links, the 3–5 launch sellers (ask now — Diwali is 8 Nov, `11` §6.6).
4. Week 4 has Dussehra on Tuesday 20 Oct. Agree now which evenings you're each working, and write them in PROGRESS "Unavailable evenings".
5. Send the client the three-line Friday update. Mention the second payment (30%) is planned for the end of next week, with the definition she confirmed (D35).
