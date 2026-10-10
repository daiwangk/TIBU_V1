# 01 · Decisions (copy to the repo as docs/DECISIONS.md)

Locked unless both of you agree to change one; record the change here in the same PR. **[CLIENT]** = confirm with Laiba in writing (messages in `08_CLIENT_COMMS.md` §2).

## Build approach
- **D1 Continue in this repo (strangler rebuild).** Keep router, services seam, AppShell/BottomNav, tokens, mock data. Rebuild each screen under `src/pages/`, switch the route, delete the legacy file in the same PR. *Why:* a fresh scaffold would redo working infrastructure and re-plan everything; patching legacy screens means polishing code that has to be rewritten against real data anyway.
- **D2 JavaScript + JSDoc.** No TypeScript in `src/`, no shadcn/ui. Cloudflare Pages Functions in `functions/` may stay TypeScript (Pages compiles them). *Why:* the repo and its AGENTS.md are JS; migrating costs a week you don't have.
- **D3 Supabase with the dev kit's migrations as written.** SQL is the source of truth. After the first successful push, changes are new migration files only.
- **D4 One data path:** page → `src/queries` (TanStack Query) → `src/services/index.js` → adapter (`mock` | `supabase`) chosen by `VITE_DATA_SOURCE`.
- **D5 The contract (`docs/CONTRACT.md`) is fixed.** Changing it = one PR that updates the doc, both adapters and the contract test.

## Data rules
- **D6 Category slugs = DB seed slugs** (`desserts, food, handmade, crochet, embroidery, resin-art, candles, fashion, womens-fashion, mens-fashion, jewellery, gifts`; `food` is displayed as "Home Food"). Verified against `0006_seed_categories.sql`. A parent slug includes its children in search. **[CLIENT]** final list.
- **D7 Public URLs `/p/:productId` and `/b/:slug`**, matching the OG preview functions `functions/p/[id].ts` and `functions/b/[slug].ts`.
- **D8 `price` is integer rupees at the UI boundary;** DB stores `price_paise`; conversion only in `services/supabase/mappers.js`.
- **D9 Phones only via `revealContact()`**, never on public shapes, never joined in catalog queries.

## Product behaviour
- **D10 Guests browse and search everything.** Contact (WhatsApp/Call), save, enquiry and review require a customer login. **[CLIENT]** (SOW §6 open item).
- **D11 Login-gate resume** stores the pending action in `localStorage` (`tibu.pendingAction`) with a 30-minute expiry, so it survives the email-confirmation tab.
- **D12 Email confirmation stays ON** (Supabase default). The callback page resumes the pending action. **[CLIENT]** — turning it off removes friction but allows fake emails.
- **D13 State:** TanStack Query for server data; zustand for `auth`, `location`, `loginGate`. `ProfileContext` and `SavedContext` are deleted in Week 3.
- **D14 Styling:** Tailwind v4 + `theme.css` tokens; zero inline styles in new folders (CI guard); legacy is deleted, not restyled.
- **D15 UI primitives are in-house** (`src/components/ui/`); bottom sheets and dialogs use the native `<dialog>` element. No component library.
- **D16 Phase-2 screens removed:** Offers, OfferDetails, Discover, Addresses, AddAddress now; Reel and ReelsViewAll when Home and category pages are rebuilt (B2.4). **[CLIENT]**
- **D17 Videos:** Instagram reel embed iframe built from the parsed shortcode; no Meta token; no video storage.
- **D18 Images:** compressed in the browser to WebP (~1200px long edge). If WhatsApp won't render WebP in link previews (tested in A2.3/A4.2), also upload a small JPEG cover used only for `og:image`.
- **D19 Hosting:** Cloudflare Pages (free plan allows commercial use). OG tags injected by Pages Functions on `/p/*` and `/b/*`.
- **D20 Enquiries are non-real-time:** unread counts poll every 60 s and refetch on window focus. No websockets.
- **D21 Notifications are in-app only.** Grouped digest via the kit's pg_cron job. First item to cut if late.
- **D22 Available Today** is a manual toggle, reset nightly at midnight IST by cron. **[CLIENT]**
- **D23 Editing an approved business doesn't send it back to review;** admin can unpublish. **[CLIENT]**
- **D24 One business per seller** in Phase 1 (`businesses.owner_id` unique).

- **D29 Onboarding requires one product with an image,** even though `submit_business_for_review()` only requires an active product. Stricter UI, same SQL.
- **D30 Home "New" and "Available today" rows are city-wide** (`radiusKm: null`, distance still shown); "Near you", Search and Category use the SQL default 15 km radius when a location is set.
- **D31 Admins can read enquiry threads** (RLS `is_admin()`); state this in the privacy policy. **[CLIENT]**

## Process
- **D25 Superseded kit parts:** `07_Roadmap_and_Steps.md` Week 0–1 task lists, the whole `10_Prompt_Pack`, README "Quick start" step 1 (new Vite project). Still valid: kit docs 01, 02, 03, 04, 06, 08, 09 — where they conflict with this file, this file wins.
- **D26 Lighter agent process:** plan-first always; one screenshot-compare pass only on page UI tasks; no walkthrough artifact required. Convert styles only in components being rewritten.
- **D27 Milestone 1 = customer-facing frontend stabilised and rebuilt** (Home, Search, Category, Business, Product, static pages), every audit bug fixed / eliminated / removed with Phase-2 screens, demoed on a phone, end of Week 2. Seller flow bugs close in Week 4. **[CLIENT]** (SOW §8 wording).
- **D28 Accounts in the client's name** (GitHub org, Supabase org, Cloudflare, Resend, domain). If her Supabase org isn't ready by Day 2, create `tibu-dev` in your org and transfer the project later.

## SOW Revision 2 (added 2 Oct 2026)
- **D32 Rev2 governs.** The signed scope is `docs/Tibu_SoW_Phase1_Rev2.md` (25 Sep 2026). Where the original PDF differs, Rev2 wins.
- **D33 Push notifications (replaces "in-app only" in D21).** Web Push mirrors the in-app notification rows: same events, same text, same link. A Database Webhook on `notifications` INSERT calls the Edge Function `send-push`. Permission is requested only when the user turns on the switch in Notification settings, never on page load. Works on Android Chrome and desktop browsers; on iPhone only after "Add to Home Screen" (iOS 16.4+). The app is fully usable without permission. Cut rule: if push isn't working on a real Android phone by Thu 29 Oct, ship in-app notifications only and send the SOW §12 notice (`11_SOW_REV2_CHANGES.md` §6.5). [CLIENT] informed.
- **D34 "In-app chatbox" (Rev2 wording) = the enquiry system.** D20 still applies (non-real-time, 60 s polling). UI copy says "Chat" / "Messages"; code, database and routes keep "enquiries" (the database writes `/enquiries/<id>` into notifications — CONTRACT §14).
- **D35 Payments 40/30/30 (SOW Rev2 §8).** M1, 40% (₹4,800): D27 definition, end of Week 2. M2, 30% (₹3,600): backend, database and the core loop working on real data — accounts, WhatsApp/Call after login, saved / recently viewed / previously connected, seller signup + onboarding with photos + dashboard, admin approve/reject/unpublish, chat backend — end of Week 4. M3, 30% (₹3,600): chat, reviews and notifications screens, push, production on her domain, handover. [CLIENT] confirm the M2 definition in writing.
- **D36 Product custom fields = `products.details` as an ordered jsonb array** `[{ "label": "Weight", "value": "500g" }]`. Read both the array form and the seed's object form (`detailsFromDb()` in `src/services/supabase/details.js`); always write the array form. Max 12 rows, label ≤ 40, value ≤ 200. Category templates prefill empty label rows: desserts & food → Weight / Quantity, Serves, Shelf life, Veg / Eggless; fashion, womens-fashion, mens-fashion → Sizes available, Size chart, Fabric, Fit; jewellery → Material, Size; crochet, embroidery, resin-art, handmade → Dimensions, Material, Made to order; candles → Burn time, Wax, Fragrance; gifts → What's included, Personalisation. Size charts are detail rows and/or one product photo. No per-category database schema.
- **D37 Delivery fields (migration 0008).** Business: `delivery_time` (preset chips "Same day", "Next day", "2–3 days", "Within a week", or custom ≤ 40 chars) and optional `established_year`. Product: override columns where NULL = same as the business. A product override with a blank delivery time shows the shop's time.
- **D38 Seller location privacy.** Many sellers work from home. Store `lat`/`lng` rounded to 3 decimals (about 100 m) — distance sorting is unaffected. The address line is optional and labelled "shown publicly". Public pages show locality and distance only; sellers share an exact pick-up address over WhatsApp.
