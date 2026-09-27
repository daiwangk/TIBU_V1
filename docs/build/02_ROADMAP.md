# 02 · Roadmap

**Capacity:** two people × weekday evenings (6–10 PM) ≈ 20 h/person/week. Task estimates below are AI-assisted build time; plan on 1.4–1.5× for review, debugging and client back-and-forth. Total estimated task time ≈ 115 h → ≈ 165 h real, in line with the dev kit's 160–200 h.

**Tracks:** **A** = backend, data, integrations, deploy. **B** = frontend screens and UX. Each reviews the other's PRs. Dates assume Week 1 starts Monday 28 Sep 2026; shift everything if you start later.

## At a glance

| Week | Dates | Goal | Exit check (demo this to yourselves) |
|---|---|---|---|
| 1 | 28 Sep – 2 Oct | App boots, CI on Linux, contract + mock adapter, new Product and Business pages; Supabase dev live and seeded | Preview URL: open a `/p/<id>` link in incognito on a phone → product renders. `db push` + smoke test green |
| 2 | 5 – 9 Oct | Home, Category, Search rebuilt; preview on real Supabase data; location; WhatsApp link previews | **Milestone 1 demo + 50% invoice.** Seeded product link pasted into WhatsApp shows its image |
| 3 | 12 – 16 Oct | Auth, login gate, live WhatsApp/Call, profile, saved, recently viewed, previously connected | Incognito → browse → tap WhatsApp → sign up → WhatsApp opens with the right message and link → it appears under "Previously connected" |
| 4 | 19 – 23 Oct | Seller signup + onboarding + dashboard, image upload, admin panel, enquiry backend | New seller onboards → submits → admin approves → guest sees the business on Home/Search |
| 5 | 26 – 30 Oct | Enquiry UI, reviews, notifications + digest, production environment | Every row of the SOW checklist (`07` §2) passes on dev; prod deploy works |
| 6 (buffer) | 2 – 6 Nov | Client revision round, fixes, real sellers, launch, handover | Live on the client's domain; handover pack sent; **final 50%** |

SOW §9 says 4–5 weeks from sign-off and that pauses for client feedback don't count. Week 6 absorbs those pauses and the revision round. Tell the client about the buffer now, not in Week 5 (`08` §1).

```mermaid
gantt
  dateFormat YYYY-MM-DD
  title Tibu Phase 1 — continue-in-place plan
  section B frontend
  Boot, CI, contract, primitives, Product/Business :b1, 2026-09-28, 5d
  Home, Category, Search, location UX              :b2, after b1, 5d
  Auth pages, login sheet, contact, profile, saved :b3, after b2, 5d
  Seller onboarding, dashboard, admin panel        :b4, after b3, 5d
  Enquiry UI, reviews, notifications, QA           :b5, after b4, 5d
  section A backend
  Accounts, Supabase dev, db push, seed, adapter   :a1, 2026-09-28, 5d
  Real data on preview, location store, OG previews:a2, after a1, 5d
  Auth, login gate, reveal, saved, activity        :a3, after a2, 5d
  Seller, upload, admin, enquiry services, RLS test:a4, after a3, 5d
  Notifications, prod, ops, performance            :a5, after a4, 5d
  section Milestones
  Milestone 1 demo (50%)                           :milestone, m1, 2026-10-09, 0d
  Buffer: revision round, launch, handover         :w6, 2026-11-02, 5d
  Handover (50%)                                   :milestone, m2, 2026-11-06, 0d
```

## Week 1 — Stabilise and wire the foundations

| ID | Task | Owner | Est | Needs |
|---|---|---|---|---|
| B1.1 | Boot fix (patch 0001) | B | 0.5 h | — |
| B1.2 | Repo hygiene: legacy folders (patch 0002), delete `scratch/`, drop in `repo-files/`, vitest, `npm run check`, CI | B | 1.5 h | B1.1 |
| B1.3 | Remove Phase-2 screens (Offers, OfferDetails, Discover, Addresses, AddAddress) | B | 1 h | B1.2 |
| B1.4 | Taxonomy + contract modules + deterministic mock adapter + `lib/format.js` + contract test | B | 3 h | B1.2 |
| B1.5 | Providers (TanStack Query, sonner), root error boundary, `src/queries/*` catalog hooks | B | 1.5 h | B1.4 |
| B1.6 | UI primitives + shared components + dev-only `/dev/ui` gallery | B | 3 h | B1.2 |
| B1.7 | Product page at `/p/:productId` (delete `Product.jsx`) | B | 2 h | B1.5, B1.6 |
| B1.8 | Business page at `/b/:slug` with Products/Videos/Reviews tabs (delete `Business.jsx`) | B | 3 h | B1.7 |
| A1.1 | Accounts in the client's name (manual) | A | 1 h + wait | — |
| A1.2 | Import dev kit (`supabase/`, `docs/kit/`), create `tibu-dev`, `db push`, cron, smoke test, verification SQL | A | 2 h | — |
| A1.3 | `src/lib/` utilities in JS (whatsapp, instagram, geo, image) + unit tests | A | 2 h | B1.2 |
| A1.4 | Dev seed script (Node, dev-only guard) | A | 2 h | A1.2 |
| A1.5 | Supabase client + catalog adapter (reads) + error mapping | A | 3 h | A1.2, B1.4 |
| A1.6 | Cloudflare Pages project + branch previews | A | 1 h | B1.2 |
| A1.7 | Auth settings: Site URL, redirects, Resend SMTP (or defer SMTP to Week 3) | A | 1 h | A1.1 |

B ≈ 15.5 h · A ≈ 12 h.

## Week 2 — Catalog screens, real data, Milestone 1

| ID | Task | Owner | Est | Needs |
|---|---|---|---|---|
| B2.1 | Home page (hero, search, category shortcuts, New Businesses, New Products, Available Today) — delete `Home.jsx` | B | 3 h | B1.5–B1.6 |
| B2.2 | `CategoryPage` at `/category/:slug` — delete the 11 category pages | B | 2 h | B2.1 |
| B2.3 | Search page with URL state, filters sheet, tabs, load more — delete `Search.jsx` | B | 3 h | B1.6 |
| B2.4 | Cleanup: static pages ported, 404, delete view-all pages, Reel pages and dead legacy services | B | 2 h | B2.1–B2.3 |
| B2.5 | Mobile QA pass, audit-bug closure table, demo rehearsal | B | 2 h | all above |
| B2.6 | Location UX: location chip, area picker sheet, first-visit prompt | B | 2 h | A2.2 |
| A2.1 | Seed dev, switch preview to `VITE_DATA_SOURCE=supabase`, fix mapper gaps | A | 1.5 h | A1.4, A1.5 |
| A2.2 | Location store (zustand, persisted) + origin passed into search hooks | A | 2 h | A1.3, B1.5 |
| A2.3 | OG link-preview functions deployed and tested in WhatsApp | A | 2.5 h | A1.6, B1.7 |
| A2.4 | Error mapping → toasts; query error handling | A | 1 h | A1.5 |
| M1 | Milestone 1 demo on a phone + invoice | both | 1 h | — |

B ≈ 14 h · A ≈ 7 h. If A is ahead, start A3.1 (auth service) this week.

## Week 3 — Accounts, contact, retention

| ID | Task | Owner | Est | Needs |
|---|---|---|---|---|
| A3.1 | Auth + me services, auth store, `AuthBootstrap`, route guards | A | 2.5 h | A1.5 |
| A3.2 | Login gate store (localStorage resume) + `revealContact` + `useContactAction` | A | 2.5 h | A3.1 |
| A3.3 | Saved service + optimistic toggle hooks | A | 2 h | A3.1 |
| A3.4 | Activity: `trackView` (DB for users, localStorage for guests, merge on login), recent, connected | A | 2 h | A3.1 |
| A3.5 | Profile home location → location default; avatar upload | A | 1 h | A3.1, A2.2 |
| B3.1 | Auth pages: login, signup, forgot, reset, callback | B | 3 h | A3.1 |
| B3.2 | `LoginSheet` driven by the gate store | B | 2 h | A3.2 |
| B3.3 | `ContactButtons` live on Product and Business | B | 1.5 h | A3.2 |
| B3.4 | Profile + Edit profile (delete legacy Profile/EditProfile, `ProfileContext`) | B | 2 h | A3.1, A3.5 |
| B3.5 | Saved (2 tabs), Recently viewed, Previously connected, `SaveButton` live (delete `Saved.jsx`, `SavedContext`) | B | 3 h | A3.3, A3.4 |

B ≈ 11.5 h · A ≈ 10 h. Also send the client the email-confirmation decision (D12) before B3.1 merges.

## Week 4 — Seller, admin, enquiry backend

| ID | Task | Owner | Est | Needs |
|---|---|---|---|---|
| A4.1 | Seller services (become seller, business, contacts, products, videos, submit, available today, stats) | A | 3 h | A3.1 |
| A4.2 | Image pipeline: compress → Storage upload → image rows; delete cleanup | A | 2 h | A4.1 |
| A4.3 | Admin services (list, detail with contacts, decide, history) | A | 1.5 h | A3.1 |
| A4.4 | Enquiry services (send enquiry, find thread, list, thread, reply, mark read) | A | 2 h | A3.1 |
| A4.5 | RLS role matrix run as guest / customer / seller A / seller B / admin | A | 1.5 h | A4.1–A4.4 |
| B4.1 | `/sell` landing, seller signup, seller guard + routing | B | 1.5 h | A4.1 |
| B4.2 | Onboarding wizard, 7 steps, autosave (delete `SellerRegister.jsx`) | B | 4 h | A4.1, A4.2 |
| B4.3 | Seller home, products list + form, videos, edit business (delete `SellerDashboard.jsx`, `SellerProductDetail.jsx`) | B | 4 h | B4.2 |
| B4.4 | Admin panel: tabs, detail, approve / reject / unpublish / republish | B | 3 h | A4.3 |

B ≈ 12.5 h · A ≈ 10 h.

## Week 5 — Enquiries, reviews, notifications, production

| ID | Task | Owner | Est | Needs |
|---|---|---|---|---|
| A5.1 | Notifications service; verify cron jobs and digest in dev | A | 1.5 h | A3.1 |
| A5.2 | Production: `tibu-prod`, db push, cron, SMTP, auth URLs, Pages prod env, custom domain, first admin | A | 3 h | client domain |
| A5.3 | Ops: keep-alive workflow, backups, optional Sentry | A | 1.5 h | A5.2 |
| A5.4 | Performance: lazy routes, image lazy-loading, bundle check | A | 1 h | — |
| B5.1 | Enquiry UI: sheet, customer inbox + thread, seller inbox + thread, unread badges | B | 4 h | A4.4 |
| B5.2 | Reviews: write/edit sheet, list, seller reviews page | B | 2.5 h | A3.1 |
| B5.3 | Notifications page, bell badge, digest opt-out (delete last legacy files and `LegacyPage`) | B | 2 h | A5.1 |
| B5.4 | States + accessibility audit across every screen | B | 1.5 h | — |
| B5.5 | Real-device regression (Android Chrome, iOS Safari) | B | 2 h | — |

## Week 6 (buffer) — Revision, launch, handover
- Mon–Tue: send the one consolidated revision list request (`08` §6); fix regressions.
- Wed: implement agreed revisions; final regression on prod.
- Thu: onboard 3–5 real sellers with the client; admin approves them. Soft launch.
- Fri: handover pack (`08` §7), invoice the final 50%, transfer ownership after payment (SOW §11). The 30-day support window starts (SOW §10).

## Dependency rules (what really blocks what)
- Boot fix → everything on the frontend.
- Contract modules (B1.4) → query hooks (B1.5) → every page. Supabase adapter (A1.5) needs B1.4's `services/index.js`.
- `db push` (A1.2) → seed (A1.4) → real data on preview (A2.1).
- Real `/p/:id` pages (B1.7) → OG functions (A2.3) → the WhatsApp message link (B3.3).
- Auth (A3.1) → contact reveal, saved, recent sync, enquiries, reviews, seller, admin.
- Storage policies (in the kit migrations) → image upload (A4.2) → onboarding branding step (B4.2).
- **Not blocking (don't wait):** `db push` doesn't wait for the frontend; the admin panel can be built against seeded `pending` businesses before onboarding exists; B keeps building on mock data if A is late.

## Cut order if you fall behind (tell the client as it happens — SOW §12)
1. Grouped daily digest (keep per-event in-app notifications).
2. DB-synced recently viewed (keep localStorage only).
3. Review editing (keep create + delete).
4. Business gallery images (keep logo + banner).
5. Seller stats cards.
6. Map pin picker for seller location (keep "use my location" + locality text).

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| WhatsApp link previews don't render (tags, image type, caching) | Medium | SOW promise fails silently | Built in Week 2 (A2.3), tested on real phones; JPEG fallback (D18); `?v=` to bust WhatsApp's cache |
| Free AI tool quotas run out mid-week | High | Lost evenings | Four tools × two people; rotate (`05`); tasks small enough to finish by hand |
| Supabase differences vs. the stub-tested SQL (auth triggers, storage policies, pg_cron) | Medium | Backend delay | Push on Day 1; runbook verification SQL; fixes via migration edits only before the first successful push |
| Client slow on accounts, domain, decisions | High | Blocks prod and SMTP | Request on Day 1; build in your own org and transfer; log waits in PROGRESS (SOW §9: pauses don't count) |
| Scope creep via the WhatsApp group | High | Timeline | `docs/PHASE2_BACKLOG.md`; SOW §12 wording in `08` |
| Email deliverability (confirmation mails in spam) | Medium | Signups stall | Resend with verified domain (SPF/DKIM) before Week 3 goes live |
| Free Supabase project pauses after inactivity | Medium | Site down | Keep-alive workflow (A5.3); first Phase-2 upgrade is Supabase Pro |
| Festival-season evenings (Oct–Nov) | Medium | Lost capacity | Mark unavailable evenings in PROGRESS each Monday; Week 6 buffer |
| Price vs. effort (₹12,000 for ~165 h) | Certain | Motivation, cutting corners | Log hours per task in PROGRESS; use the §12 flex clause openly; use the real numbers to quote Phase 2 |
