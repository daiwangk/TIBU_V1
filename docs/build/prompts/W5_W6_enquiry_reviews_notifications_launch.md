# Week 5 — Enquiries, reviews, notifications, production (26 – 30 Oct)
# Week 6 (buffer) — Revision round, launch, handover (2 – 6 Nov)

**Week 5 exit check:** every row of `docs/build/07_QA_AND_SIGNOFF.md` §2 passes on dev; production is deployed on the client's domain with no seed data; `src/legacy/`, `src/contexts/`, `src/hooks/` and the allowlist are empty.

---

## A5.1 · Notifications + digest
**Owner** A · **Branch** `feat/a5-1-notifications` · **Tool** Cursor · **Est** 1.5 h · **Needs** A3.1
```
TASK A5.1 — Notifications service and hooks.
Read: docs/CONTRACT.md §6, §7 (notifications), supabase migrations (notifications table, column-level grant on read_at, triggers, job_new_business_digest), supabase/cron.sql.
1. src/services/supabase/notifications.js: listNotifications({ limit, offset }) newest first (ids are bigint → String), markNotificationsRead(ids | 'all') (update only read_at — the only writable column; 'all' = where read_at is null), getUnreadCounts() → rpc('unread_counts') → { notifications, enquiries }.
2. src/queries/notifications.js: useNotifications, useMarkNotificationsRead, useUnreadCounts (qk.unread; refetchInterval 60_000 + on focus; marking read or opening a thread invalidates it).
Plan first.
```
Manual: in the SQL editor check `select * from cron.job_run_details order by start_time desc limit 10;` → the digest and available-today jobs have run successfully; create a new approved business near customer1's home area and run the digest job manually (`select public.job_new_business_digest();` or the exact name in cron.sql) → customer1 gets one grouped notification; set `notify_digest = false` → no notification.
**Commit:** `feat(a5.1): notifications service and hooks`

## A5.2 · Production environment
**Owner** A · **Est** 3 h · **Needs** client domain + accounts · Follow `docs/build/06_BACKEND_RUNBOOK.md` §10 step by step. Record the prod project ref and "CLI linked to: dev" in PROGRESS when done.

## A5.3 · Ops
**Owner** A · **Est** 1.5 h · keep-alive workflow with prod secrets (`repo-files/.github/workflows/keepalive.yml`), first backup (`06` §11), optional Sentry (frontend DSN only; no PII in breadcrumbs).

## A5.4 · Performance
**Owner** A · **Branch** `perf/a5-4-lazy-routes` · **Tool** Cursor · **Est** 1 h
```
TASK A5.4 — Lazy-load route groups. In src/App.jsx wrap each page area (seller, admin, auth, enquiries, notifications, static, dev) in React.lazy + Suspense with a centred Spinner fallback; keep Home, Search, Category, Product, Business eager. Add loading="lazy" and decoding="async" to all non-first-screen <img> in cards. Report the build output chunk sizes before and after. No behaviour changes.
```
**Verify:** `npm run build` no longer warns about a > 500 kB chunk (or the main chunk shrank noticeably) · every route still loads.

---

## B5.1 · Enquiry UI
**Owner** B · **Branch** `feat/b5-1-enquiries` · **Tool** Antigravity · **Est** 4 h (split with S11 if needed) · **Needs** A4.4
```
TASK B5.1 — Non-real-time enquiry box (SOW Enquiry & Notification system). Visual reference: design/mockups/chat-empty.png, chat-compose.png, chat-sent.png. Out of scope: typing indicators, online presence, read receipts, live updates (DECISIONS D20).
1. "Send enquiry" secondary Button on ProductPage and BusinessPage (next to ContactButtons). If findMyThread(businessId) returns an id → navigate to /enquiries/:threadId. Otherwise open src/components/EnquirySheet.jsx (Textarea, product context chip, Send): guest → loginGate.request({ type: 'enquiry', payload: { businessId, productId, body } }); authenticated → sendEnquiry → navigate to /enquiries/:threadId.
2. src/pages/enquiries/InboxPage.jsx (/enquiries, RequireAuth): list of threads (logo, business name, product name if any, preview, relative time, unread dot). Empty state per chat-empty mockup.
3. src/pages/enquiries/ThreadPage.jsx (/enquiries/:threadId): header with business (link to /b/:slug) and product context chip (link to /p/:id); messages as bubbles (mine right in plum, theirs left on surface), day separators; composer (Textarea auto-grow, max 2000, Send disabled when empty; Enter = newline on mobile); after sending, append optimistically and show "Sent" state; a small note "Replies appear here — we'll notify you." markThreadRead on open. A "Refresh" IconButton and refetch on focus (no live updates).
   Customer messages in a thread are sent with sendEnquiry (keeps the rate limit); seller messages with sendMessage.
4. Seller side: /seller/enquiries and /seller/enquiries/:threadId reuse the same components with as='seller' (customer name instead of business in the header). These exact routes are written into notifications by the database (CONTRACT §14).
5. Unread badges: BottomNav Profile icon shows a dot when useUnreadCounts().enquiries > 0; SellerHomePage "Enquiries" card shows the sum of unreadCount over listMyThreads({ as: 'seller' }); Profile page gets an "Enquiries" row.
Plan first.
```
**Verify:** customer sends from a product → seller account sees it within 60 s (or on refresh) with the product context → replies → customer sees the reply and a notification (A5.1) · long messages wrap · keyboard doesn't hide the composer on iOS.
**Commit:** `feat(b5.1): enquiry inbox and threads for customers and sellers`

## B5.2 · Reviews
**Owner** B · **Branch** `feat/b5-2-reviews` · **Tool** Cursor · **Est** 2.5 h · **Needs** A3.1
```
TASK B5.2 — Write and manage reviews.
1. Services first if missing: src/services/supabase/reviews.js getMyReview, saveMyReview (upsert on business_id+user; rating 1–5, body ≤ 1000), deleteMyReview; hooks in src/queries/reviews.js invalidating the business, its reviews and qk.me.
2. src/components/ReviewSheet.jsx: 5 tappable stars (radio group semantics, aria-labels "1 star"… "5 stars"), textarea with counter, Save / Delete (edit mode).
3. BusinessPage Reviews tab: "Write a review" → guest → loginGate 'review'; authenticated → ReviewSheet (prefilled if getMyReview returns one; button label "Edit your review"). The owner of the business doesn't see the button; if the RPC/RLS still rejects (e.g. own business), show the mapped error.
4. /seller/reviews: list of reviews for my business with the rating summary (read-only).
Plan first.
```
**Commit:** `feat(b5.2): write, edit and delete reviews; seller reviews page`

## B5.3 · Notifications UI + final legacy removal
**Owner** B · **Branch** `feat/b5-3-notifications` · **Tool** Antigravity · **Est** 2 h · **Needs** A5.1
```
TASK B5.3 — Notifications screens, and delete the last legacy code.
1. src/pages/notifications/NotificationsPage.jsx (/notifications, RequireAuth): grouped by Today / Earlier; each item icon by type, title, body, relative time, unread style; tap → mark read + navigate to item.link; "Mark all as read".
2. src/pages/notifications/NotificationSettingsPage.jsx (/notifications/settings): the digest Switch (updateMe({ notifyDigest })) with a one-line explanation. No browser push permission anywhere.
3. HomeHeader bell → /notifications with useUnreadCounts().notifications as the badge (hidden when 0; "9+" cap).
4. Delete src/legacy/pages/Notification.jsx, src/NotificationPreferences.jsx, LegacyPage and the L() helper in src/App.jsx, src/hooks/useAsync.js, src/hooks/useSetPage.js, and any remaining file under src/legacy/ and src/contexts/ (check with git grep that nothing imports them). scripts/legacy-allowlist.json ends with an empty list.
Plan first.
```
**Verify:** `ls src/legacy src/contexts src/hooks` → gone or empty · `node scripts/check-guards.mjs` → 0 allowlist entries · every route in `docs/build/03_ARCHITECTURE_TARGET.md` §3 loads.
**Commit:** `feat(b5.3): notifications; remove the last legacy code`

## B5.4 · States and accessibility audit
**Owner** B · **Tool** Antigravity browser agent, then small fixes · **Est** 1.5 h
```
Audit only, no edits. For every route in docs/build/03_ARCHITECTURE_TARGET.md §3 (log in as customer, seller and admin where needed) at 390×844: can you see a loading state, an empty state and an error state (try offline mode)? Are all interactive elements reachable by Tab with a visible focus ring? Do icon-only buttons have accessible names? Any image without alt? Any text below 4.5:1 contrast on its background? Output a table: route · issue · severity · fix.
```
Fix blockers/majors with S7.

## B5.5 · Real-device regression
**Owner** B (A helps) · **Est** 2 h · Walk `docs/build/07_QA_AND_SIGNOFF.md` §2 end to end on an Android phone (Chrome) and an iPhone (Safari), on the prod domain once A5.2 is done. Log every failure as a task in PROGRESS.

---

## Week 6 — buffer, revision, launch, handover
1. **Mon:** send the revision-round message (`08` §6). Fix anything open from B5.5.
2. **Tue–Wed:** triage her list into in-scope fixes vs. Phase 2 (log those in `docs/PHASE2_BACKLOG.md`); implement in-scope fixes with S7-sized tasks.
3. **Thu:** onboard 3–5 real sellers with her on prod (they use `/sell`; she approves in `/admin`). Paste one real product link into WhatsApp → preview works on the real domain. Run the launch checklist (`07` §7).
4. **Fri:** send the handover pack (`08` §7) and the final invoice; after payment transfer repo and account ownership (SOW §11). Start the 30-day support log in PROGRESS.
