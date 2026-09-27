# Tibu Phase 1 — Master Guide

One document to understand the whole project and how to finish it. Read it once end to end, then use §5 as your tracker. Everything here points into the build kit (`tibu-build-kit/`) for detail.

---

## 1. The project in one page

**What Tibu is.** A mobile-first web app where people discover homegrown local businesses near them (desserts, handmade, fashion, jewellery, gifts), browse their products, and contact the seller on WhatsApp or by phone. Sellers sign up, build a shop profile, and go live after an admin approves them. No payments in Phase 1.

**What Phase 1 must deliver (SOW §3).** Guest browsing; customer accounts (login required to contact a seller); Home with New Businesses / New Products / Available Today; search and category browsing with real distance sorting; Business and Product pages with WhatsApp (pre-filled message + product link) and Call; saved items, recently viewed, previously connected; reviews; seller signup, onboarding and product management with photos and Instagram reel videos; an in-app enquiry box with notifications; an admin approval panel; a real backend and database; deployment.

**Money and milestones.** ₹12,000 total. 50% at Milestone 1 (stabilised, refined customer-facing frontend). 50% at completion, deployment and handover. Code ownership transfers after the final payment. One consolidated revision round. 30 days of bug-fix support after handover.

**Timeline.** 4–5 weeks from sign-off, weekday evenings, plus a buffer week for client pauses and the revision round. Milestone 1 target: **Fri 9 Oct 2026**. Launch and handover target: **week of 2 Nov 2026**.

**Team.** Two people, part-time. **A** = backend, data, integrations, deploy. **B** = frontend screens and UX. Each reviews the other's work.

---

## 2. Where things stand (27 Sep 2026)

- The repo **does not build** on Linux and **every screen crashes** today. Two verified patches in the kit fix this (boot fix, legacy-folder move).
- The prototype's data is inconsistent (four different category lists, random distances, phone numbers in public data). The new data contract replaces all of it.
- The backend has **never** been connected. The database schema exists in the earlier dev kit (six Supabase migrations). They now apply cleanly on Postgres + PostGIS and pass the smoke test; one real bug was found and fixed (migration 0007). They have not yet been pushed to a real Supabase project.
- There is **no** auth, seller flow, admin panel or enquiry system yet.
- **Nothing in the build kit has been applied to the repo yet.** Every task in §5 is open.

The strategy: keep the repo and JavaScript; rebuild each screen once, cleanly, against one fixed data contract; delete the old screen in the same PR; push the database in parallel from Day 1.

---

## 3. How the pieces fit

| Piece | What it is | Where it lives |
|---|---|---|
| The repo | The React app (JavaScript, Vite, Tailwind) | GitHub, `TIBU_V1-main` |
| Build kit (new) | Plan, contract, prompts, patches, repo config files | `tibu-build-kit/` → copied into the repo as `docs/build/` in task B1.2 |
| Dev kit (earlier) | Database migrations, RLS, RPCs, feature specs, snippets | `tibu-phase1-dev-kit/` → `supabase/` and `docs/kit/` in task A1.2 |
| Contract | The exact data shapes and functions the screens use | `docs/CONTRACT.md` (from build kit doc 04) |
| Decisions | Locked choices (D1–D28) | `docs/DECISIONS.md` (from build kit doc 01) |
| Progress log | Current state + one entry per work session | `docs/PROGRESS.md` |
| Agent rules | What every AI tool must follow | `AGENTS.md`, `.agents/rules/`, `.cursor/rules/` |

**How data flows in the finished app:** screen → query hook (`src/queries`) → service function (`src/services/index.js`) → adapter (mock data now, Supabase later) → database. Screens never talk to the database directly, which is why you can build screens on mock data this week and switch to real data next week without rewriting them.

---

## 4. The plan at a glance

| Week | Dates | Goal | You know it's done when |
|---|---|---|---|
| 1 | 28 Sep – 2 Oct | App boots; CI; contract + mock data; new Product and Business pages; Supabase dev live and seeded | A `/p/<id>` link opens the product in an incognito phone browser; `db push` and the smoke test are green |
| 2 | 5 – 9 Oct | Home, Category, Search rebuilt; real data on preview; location; WhatsApp link previews | **Milestone 1 demo + invoice.** A product link pasted into WhatsApp shows its image |
| 3 | 12 – 16 Oct | Accounts, login gate, live WhatsApp/Call, profile, saved, recent, connected | Incognito → tap WhatsApp → sign up → WhatsApp opens with the right message |
| 4 | 19 – 23 Oct | Seller signup/onboarding/dashboard, image upload, admin panel, enquiry backend | New seller onboards → admin approves → a guest sees the business |
| 5 | 26 – 30 Oct | Enquiry screens, reviews, notifications, production | Every SOW checklist row passes; prod is live on the client's domain |
| 6 | 2 – 6 Nov | Buffer: revision round, real sellers, launch, handover | Live, handover pack sent, final invoice |

---

## 5. Full task tracker

Tick each box when its **Verify** list (in the week's prompt file) passes and the PR is merged. Estimates are AI-assisted build time; real time is about 1.5×.

### Week 1 — `prompts/W1_stabilize_and_backend.md`
| ✓ | ID | Task | Who | Est | Needs |
|---|---|---|---|---|---|
| ☐ | B1.1 | Boot fix (apply patch 0001) | B | 0.5 h | — |
| ☐ | B1.2 | Legacy folders (patch 0002), delete `scratch/`, copy repo-files and kit docs, vitest, `npm run check`, CI green | B | 1.5 h | B1.1 |
| ☐ | B1.3 | Remove Phase-2 screens (Offers, Discover, Addresses) | B | 1 h | B1.2 |
| ☐ | B1.4 | Contract modules + deterministic mock adapter + format helpers + tests | B | 3 h | B1.2 |
| ☐ | B1.5 | Providers, error boundary, catalog query hooks | B | 1.5 h | B1.4 |
| ☐ | B1.6 | UI primitives, cards, `/dev/ui` gallery | B | 3 h | B1.2 |
| ☐ | B1.7 | Product page at `/p/:productId` | B | 2 h | B1.5, B1.6 |
| ☐ | B1.8 | Business page at `/b/:slug` with tabs | B | 3 h | B1.7 |
| ☐ | A1.1 | Accounts request to the client (GitHub, Supabase, Cloudflare, Resend, domain) | A | 1 h | — |
| ☐ | A1.2 | Import dev kit **+ fix migration 0007**, create `tibu-dev`, `db push`, cron, smoke test (psql), verification SQL | A | 2 h | — |
| ☐ | A1.3 | `src/lib` utilities (WhatsApp, Instagram, geo, image, storage) + tests | A | 2 h | B1.2 |
| ☐ | A1.4 | Dev-only seed script | A | 2 h | A1.2 |
| ☐ | A1.5 | Supabase client + catalog adapter | A | 3 h | A1.2, B1.4 |
| ☐ | A1.6 | Cloudflare Pages previews | A | 1 h | B1.2 |
| ☐ | A1.7 | Auth URLs (+ Resend SMTP if the domain is ready) | A | 1 h | A1.1 |

### Week 2 — `prompts/W2_catalog_and_milestone1.md`
| ✓ | ID | Task | Who | Est | Needs |
|---|---|---|---|---|---|
| ☐ | B2.1 | Home page | B | 3 h | B1.5–B1.8 |
| ☐ | B2.2 | Generic CategoryPage (delete 11 legacy pages) | B | 2 h | B2.1 |
| ☐ | B2.3 | Search page with URL state and filters | B | 3 h | B1.6 |
| ☐ | B2.6 | Location chip, area picker, first-visit prompt | B | 2 h | A2.2 |
| ☐ | B2.4 | Static pages, 404, delete view-all/reel pages and dead services | B | 2 h | B2.1–B2.3 |
| ☐ | B2.5 | Mobile QA pass, audit closure table, demo rehearsal | B | 2 h | all above |
| ☐ | A2.1 | Preview on real Supabase data | A | 1.5 h | A1.4, A1.5 |
| ☐ | A2.2 | Location store feeding searches | A | 2 h | A1.3, B1.5 |
| ☐ | A2.3 | WhatsApp/OG link previews (tested on real phones) | A | 2.5 h | A1.6, B1.7 |
| ☐ | A2.4 | Error mapping → toasts | A | 1 h | A1.5 |
| ☐ | M1 | **Milestone 1 demo + invoice (₹6,000)** | both | 1 h | — |

### Week 3 — `prompts/W3_accounts_contact_retention.md`
| ✓ | ID | Task | Who | Est | Needs |
|---|---|---|---|---|---|
| ☐ | A3.1 | Auth + profile services, auth store, route guards | A | 2.5 h | A1.5 |
| ☐ | A3.2 | Login gate with resume + reveal contact | A | 2.5 h | A3.1 |
| ☐ | A3.3 | Saved items service + hooks | A | 2 h | A3.1 |
| ☐ | A3.4 | Recently viewed (guest merge) + previously connected | A | 2 h | A3.1 |
| ☐ | A3.5 | Profile location default; SMTP live | A | 1 h | A3.1, A2.2 |
| ☐ | B3.1 | Login, signup, reset, callback pages | B | 3 h | A3.1 |
| ☐ | B3.2 | Login sheet | B | 2 h | A3.2 |
| ☐ | B3.3 | WhatsApp and Call live | B | 1.5 h | A3.2 |
| ☐ | B3.4 | Profile + Edit profile | B | 2 h | A3.1 |
| ☐ | B3.5 | Saved, Recently viewed, Previously connected | B | 3 h | A3.3, A3.4 |

### Week 4 — `prompts/W4_seller_admin_enquiry_backend.md`
| ✓ | ID | Task | Who | Est | Needs |
|---|---|---|---|---|---|
| ☐ | A4.1 | Seller services | A | 3 h | A3.1 |
| ☐ | A4.2 | Image compression + upload | A | 2 h | A4.1 |
| ☐ | A4.3 | Admin services | A | 1.5 h | A3.1 |
| ☐ | A4.4 | Enquiry services + hooks | A | 2 h | A3.1 |
| ☐ | A4.5 | RLS role matrix (guest, customer, seller A, seller B, admin) | A | 1.5 h | A4.1–A4.4 |
| ☐ | B4.1 | `/sell` landing, seller signup, seller route gate | B | 1.5 h | A4.1 |
| ☐ | B4.2 | 7-step onboarding wizard with autosave | B | 4 h | B4.1, A4.2 |
| ☐ | B4.3 | Seller dashboard, products, videos, business edit | B | 4 h | B4.2 |
| ☐ | B4.4 | Admin panel (approve / reject / unpublish) | B | 3 h | A4.3 |

### Week 5 — `prompts/W5_W6_enquiry_reviews_notifications_launch.md`
| ✓ | ID | Task | Who | Est | Needs |
|---|---|---|---|---|---|
| ☐ | A5.1 | Notifications service; digest verified | A | 1.5 h | A3.1 |
| ☐ | A5.2 | Production environment on the client's domain | A | 3 h | client domain |
| ☐ | A5.3 | Keep-alive, backups, optional Sentry | A | 1.5 h | A5.2 |
| ☐ | A5.4 | Lazy routes, image lazy-loading | A | 1 h | — |
| ☐ | B5.1 | Enquiry inbox and threads (customer + seller) | B | 4 h | A4.4 |
| ☐ | B5.2 | Reviews write/edit/delete; seller reviews page | B | 2.5 h | A3.1 |
| ☐ | B5.3 | Notifications screens; delete the last legacy code | B | 2 h | A5.1 |
| ☐ | B5.4 | States + accessibility audit | B | 1.5 h | — |
| ☐ | B5.5 | Real-device regression (Android + iPhone) | B | 2 h | A5.2 |

### Week 6 — buffer, launch, handover
| ✓ | Task | Who |
|---|---|---|
| ☐ | Send the revision-round request; fix regressions | both |
| ☐ | Triage her list (in scope vs. Phase 2 backlog); implement in-scope fixes | both |
| ☐ | Onboard 3–5 real sellers on prod; launch checklist (`07` §7) | both + client |
| ☐ | Handover pack, final invoice (₹6,000), ownership transfer after payment | A |

---

## 6. How to work, day to day

**Each evening (per person):**
1. Pull `main`. Read `docs/PROGRESS.md` "Now". Pick the next unticked task whose "Needs" are done.
2. Create the branch named in the task. Open a **new** chat in the tool the task suggests.
3. Paste the Session Opener (`prompts/00` S1) + the task prompt. Read the plan; approve or correct it (S3).
4. Let it build. Run `npm run check`. Walk the task's **Verify** list yourself at 390px.
5. Ask the agent for the handoff entry (S4), commit, push, open the PR.
6. Review your partner's open PR with a different tool (S9). Merge what's green.

**Each Monday (15 minutes together):** tick last week's boxes, check free-tool quotas, note unavailable evenings, confirm the week's order, send the client a 3-line status update.

**Each Friday:** run the week's exit check on a real phone. If it fails, the first task next week is fixing it, not new features.

**Rules that save the most time:**
- One task per chat, one branch per task. Split anything that runs past twice its estimate (S11).
- Don't restyle or fix legacy screens; replace and delete them.
- Never invent data fields in code; change `docs/CONTRACT.md` first.
- New client requests go into `docs/PHASE2_BACKLOG.md`, not into the code.

---

## 7. What you need from the client (and when)

| Need | Why | By |
|---|---|---|
| Accounts: GitHub org, Supabase org, Cloudflare, Resend, domain DNS | SOW §11: everything in her name | Day 2 (else start in your org, transfer later) |
| Written answers to the 8 decisions (`08` §2) | Guest vs. login, email confirmation, categories, Available Today reset, edit-after-approval, removed Phase-2 screens, M1 definition, launch content | End of Week 1 |
| 3–4 real public Instagram reel links from sellers | Demo the Videos tab at M1 | Week 2 |
| Final logo | Header, auth screens, link previews | Week 4 |
| Privacy policy, terms, support phone/email | Static pages before launch | Week 5 |
| 3–5 real sellers ready to onboard | Launch without fake data | Week 6 |

Log every request with its date under "Waiting on client" in PROGRESS: SOW §9 says those pauses don't count against your timeline.

---

## 8. When things go wrong

| Situation | Do this |
|---|---|
| A task is taking twice its estimate | Stop, split it (S11), ship the working half, add the rest as a new row |
| An AI tool's quota runs out mid-task | Handoff (S4) or write 3 lines in PROGRESS yourself; commit `wip:`; continue in another tool with S5 |
| The agent keeps failing on the same error | `git restore .`; paste the exact error into S7 or S8; or ask Claude.ai with the file attached |
| `db push` or a Supabase query fails | Runbook `06` §3; prompts D3 / D4 in Claude.ai |
| WhatsApp preview doesn't show | `curl` test in A2.3; `?v=2` to bypass WhatsApp's cache; JPEG fallback (D18) |
| The week's exit check fails on Friday | Fix it first thing Monday; don't start the next week's features on a broken base |
| You're behind overall | Use the cut order (roadmap §Cut order) and tell the client under SOW §12 (`08` §5) |
| The client asks for something new | "Noted for Phase 2", add it to the backlog |
| A secret key was pasted into a chat or committed | Rotate it in Supabase the same day; note it in PROGRESS |

---

## 9. Glossary

- **Adapter** — the code that fetches data from one source (mock files or Supabase) and returns it in the contract's shape.
- **Contract** — `docs/CONTRACT.md`: the agreed shape of every piece of data and every service function. Both sides code against it.
- **Strangler rebuild** — replacing an old system one piece at a time: build the new screen, switch the route, delete the old one.
- **Legacy files** — the prototype's screens and helpers still in the repo, waiting to be replaced and deleted.
- **Migration** — a SQL file that changes the database schema. Once pushed, never edited; changes go in a new file.
- **RLS (Row-Level Security)** — rules inside Postgres deciding who can read or write each row. This is what keeps seller phone numbers and unapproved businesses private, even if someone calls the API directly.
- **RPC** — a database function the app calls by name (e.g. `reveal_contact`, `search_products`).
- **Anon key vs. service-role key** — the anon (publishable) key is public and limited by RLS; the service-role (secret) key bypasses RLS and must never leave your machine.
- **Paise** — 1/100 of a rupee. The database stores prices in paise; the app shows rupees.
- **Slug** — the readable URL part of a business (`sweet-crumbs-7k2p`) or category (`resin-art`).
- **OG tags / link preview** — hidden page tags WhatsApp reads to show an image, title and price when a link is pasted. Generated per product by a small Cloudflare function.
- **Login gate** — when a guest taps WhatsApp/Save/Enquiry, the app asks them to log in, remembers what they tapped, and completes it afterwards.
- **Preview deploy** — a live URL Cloudflare builds for every branch, for testing on phones before merging.
- **CI** — the GitHub check that runs guards, lint, tests and a Linux build on every push.

---

## 10. Where to find what

| I want to… | Open |
|---|---|
| Understand what's broken and why | `docs/00_STATUS_VERIFIED.md` |
| Know why we chose X | `docs/01_DECISIONS.md` |
| See the week plan, risks, cut order | `docs/02_ROADMAP.md` |
| Know where a file should go / which legacy file a task deletes | `docs/03_ARCHITECTURE_TARGET.md` |
| Check a data field or function name | `docs/04_SERVICE_CONTRACT.md` |
| Decide which AI tool to use | `docs/05_AI_TOOLS_PLAYBOOK.md` |
| Set up or fix Supabase, Cloudflare, email | `docs/06_BACKEND_RUNBOOK.md` |
| Know if something is "done"; prepare a demo | `docs/07_QA_AND_SIGNOFF.md` |
| Message the client | `docs/08_CLIENT_COMMS.md` |
| Get the prompt for a task | `prompts/W1…W5_W6` |
| Start, hand off, rescue, review, debug | `prompts/00_SESSION_AND_RESCUE.md` |
