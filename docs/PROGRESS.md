# PROGRESS — living log (newest entry on top)

Every AI session starts by reading **Now** and ends by adding a **Log** entry. When a tool runs out of quota mid-task, write the entry anyway (or ask the tool to) so the next tool or person can continue.

## Now
- Week: 1 (28 Sep – 2 Oct 2026) · Milestone 1 target: end of Week 2
- Data source on preview: `mock` · Production URL: `https://tibu-v1.pages.dev`
- Last green commit on main: `57da7c4` (merge PR #7 — B1.6 UI kit)
- In progress: `B1.5` — branch `feat/b1-5-queries` (providers + catalog hooks); not committed yet
- Next task: commit/PR B1.5; then B1.7 (product page) or A1.5 (Supabase catalog adapter)
- Blocked: —
- Waiting on client: accounts-request message (docs/build/08_CLIENT_COMMS.md §3) — sent 27 Sep for GitHub + Supabase org; Resend and domain access still to be requested (Cloudflare Pages setup complete in A1.6) · decisions list (docs/build/08_CLIENT_COMMS.md §2) not yet sent
- Unavailable evenings this week: —

## Log

### 2026-09-30 · B1.5 · dk · Cursor (Composer)
- Done:
  - Installed `@tanstack/react-query`, `zustand` (unused until A2.2), `sonner`
  - `src/app/providers.jsx` — QueryClientProvider (staleTime 60_000, retry 1, refetchOnWindowFocus true) + sonner Toaster top-center richColors
  - `src/app/ErrorBoundary.jsx` — class boundary; full-screen recovery; Reload + Home (`<a href="/">`); `console.error` only in DEV
  - `src/main.jsx` — ErrorBoundary → Providers → legacy ProfileProvider/SavedProvider → App
  - `src/queries/keys.js` — exactly CONTRACT §8
  - `src/queries/catalog.js` — catalog hooks via `src/services/index.js`; infinite search pages of 20 via offset (limit never grows); `useCategory` key `[...qk.categories, slug]`
- Files created: `src/app/providers.jsx`, `src/app/ErrorBoundary.jsx`, `src/queries/keys.js`, `src/queries/catalog.js`
- Files modified: `src/main.jsx`, `package.json`, `package-lock.json`, `docs/PROGRESS.md`
- How verified:
  - `npm run check` green (guards OK · lint 0 errors / 1 pre-existing legacy warning · 15/15 tests · build OK)
  - Smoke: temporary `useProductSearch({ limit: 3 })` on `/dev/ui` → console `B1.5 smoke useProductSearch 3` + three product objects; probe removed after
- Not done / left out (why):
  - No zustand stores yet (A2.2)
  - No page consumers yet (B1.7+)
  - Commit/PR not created (wait for explicit ask)
- Next step (exact): commit `feat(b1.5): query client, error boundary, catalog hooks` and open PR; then B1.7 or A1.5
- Gotchas for the next person:
  - Infinite hooks strip `offset` from the key and force `limit: 20`; `pageParam` is the offset
  - ErrorBoundary sits outside BrowserRouter — Home must stay an `<a href="/">`, not `<Link>`
  - `useCategory` intentionally does not add a factory to `qk` (CONTRACT §8 exact)

### 2026-09-30 · B1.6 · dk · Antigravity (Claude Sonnet 4.6 / Gemini 3.8 Flash)
- Done:
  - Built full in-house UI kit per DECISIONS D14, D15. All Tailwind tokens; no `style={{}}` in new folders; lucide-react only; JSDoc on all props.
  - `src/components/ui/`: Button, IconButton, Card, Badge, Chip, Input, Textarea, Select, Switch, Tabs, Sheet, Dialog, Skeleton, Spinner, EmptyState, ErrorState, PageHeader, Avatar, ImagePlaceholder (19 components).
  - `src/components/brand/Logo.jsx` (new, no inline styles; same fallback wordmark). Legacy `src/legacy/components/brand/Logo.jsx` left untouched (not imported by any file — confirmed by grep).
  - `src/components/`: Price, Rating, Distance, ProductCard (row + grid variants), BusinessCard, SectionHeader, HorizontalScroller, CategoryChips.
  - `src/pages/dev/UiGalleryPage.jsx` — all components in all states with inline fake data; no mock adapter imports.
  - `src/index.css` — added `@utility no-scrollbar` and `@utility line-clamp-2`.
  - `src/App.jsx` — lazy-loaded UiGalleryPage behind `import.meta.env.DEV` guard; `/dev/ui` route (Suspense-wrapped).
  - `src/layouts/BottomNav.jsx` — added `'/dev/'` to `HIDDEN_PREFIXES`.
- Files created (36): all files listed above.
- Files modified (3): `src/App.jsx`, `src/layouts/BottomNav.jsx`, `src/index.css`.
- How verified: `npm run check` exits 0 — guards OK (125 files, 8 allowlist), lint 0 errors / 1 pre-existing legacy warning, 15/15 tests pass, build OK. Production bundle does NOT include UiGalleryPage (lazy + DEV guard → tree-shaken out).
- Not done / left out (why):
  - `brand/Logo` audit: `git grep "brand/Logo" src/` → 0 results; legacy Logo is orphaned, safe to create new one. Deletion deferred to its strangler task.
  - `BottomNav.jsx` still has `style={{}}` (pre-existing legacy code) — only added the `'/dev/'` string, did not restyle.
- Next step (exact): merge PR #7; then B1.5 (AppProviders + TanStack Query hooks).
- Gotchas for the next person:
  - `Avatar.size` accepts one of 32 | 36 | 40 | 48 | 56 | 64 (Tailwind static class map). Custom sizes → use `className` with `w-/h-` utilities.
  - `ImagePlaceholder.aspect` accepts `'1/1' | '4/3' | '3/4' | '16/9'` (mapped to Tailwind aspect-* classes). The old `aspectRatio` string prop is gone.
  - `Skeleton.variant='rect'` no longer takes `width`/`height` props — control those via `className` (e.g. `className="h-20 w-full"`).

### 2026-09-30 · A1.4 · dk · Cursor
- Done:
  - Idempotent `scripts/seed-dev.mjs` for `tibu-dev`: `SEED_ALLOWED_REF` guard before any DB work; 12 sellers + 2 customers; 12 businesses (10 approved / 1 pending / 1 rejected); contacts; 45 products + 81 images; 17 reviews; optional `REELS` → videos
  - Deletes of reviews / videos / products scoped with `.in('business_id', businessIds)` from this run’s upserted seed slugs only
  - Added `@supabase/supabase-js` (OK’d for A1.5; used here by the Node seed)
  - Optional `REELS=` documented in `.env.seed.example`
- Files: `scripts/seed-dev.mjs`, `package.json`, `package-lock.json`, `.env.seed.example`, `docs/PROGRESS.md`
- How verified:
  - Seed run ×2 → identical summary counts (14 users, 12 businesses, 12 contacts, 45 products, 81 images, 0 videos, 17 reviews)
  - Service-role check: all 12 seed businesses have `location`; all 10 approved have `rating_avg > 0`
  - Anon RLS probe: `businesses?status=neq.approved` → `[]`; `business_contacts` → `[]`; approved rows still visible
  - `npm run check` green (guards OK · lint 0 errors / 1 pre-existing legacy warning · 15/15 tests · build OK)
- Not done / left out (why):
  - `REELS` not set locally → `business_videos` skipped (by design)
  - `src/lib/geo.js` / `MUMBAI_AREAS` still A1.3; seed inlines `AREAS`
  - A1.5 adapter not started
- Next step (exact): merge PR #6 after conflict resolution; then A1.5 or parallel B1.5 / B1.6 / A1.3
- Gotchas for the next person:
  - Never commit `.env.seed` (service-role). Example only is tracked
  - Anon may see more than 10 approved businesses if non-seed approved rows already exist on `tibu-dev`
  - Password for seed users remains `Test@12345` (dev only)

### 2026-09-30 · A1.4 (WIP, stopped mid-task) · dk · Cursor
- Done: draft seed script + supabase-js + REELS note in example; session stopped before verify
- Files: same as A1.4 completion entry (was uncommitted WIP)
- How verified: not yet (superseded by completion entry above)
- Not done / left out (why): verify + commit deferred to same-day follow-up
- Next step (exact): run seed twice + check — done in completion entry
- Gotchas for the next person: superseded

### 2026-09-30 · A1.6 · dk · Antigravity (Gemini 3.8 Flash)
- Done:
  - Connected repo to Cloudflare Pages (`tibu-v1.pages.dev`)
  - Configured build settings: build command `npm run build`, output directory `dist`, root `/`
  - Added environment variables for Production & Preview: `NODE_VERSION=22`, `VITE_DATA_SOURCE=mock`, `VITE_SITE_URL=https://tibu-v1.pages.dev`
  - Verified SPA deep links (`/p/anything`, `/b/anything`) return HTTP 200 and serve `index.html` (not Cloudflare 404)
  - Verified app boots with production Vite bundle from `dist/`
- URLs:
  - Production URL: `https://tibu-v1.pages.dev`
  - Deployment URL: `https://be9f1995.tibu-v1.pages.dev`
- Files: `docs/PROGRESS.md`
- How verified:
  - Terminal `curl` on `https://tibu-v1.pages.dev/p/anything` and `/b/anything` returned HTTP 200 with index.html root and compiled asset scripts
  - Local `npm run check` (guards, lint, test, build) all green
- Not done / left out (why):
  - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` skipped per runbook (will set in A2.3 after A1.2 finishes)
- Next step (exact): A1.2 leftovers or A1.5 / B1.5 (B1.4 already on main)
- Gotchas for the next person:
  - In Cloudflare Pages project settings, the build output directory must remain `dist` (default `/` serves raw unbundled source files)

### 2026-09-29 · B1.4 · daiwang · Cursor
- Done:
  - Service contract seam: `AppError`, `FUNCTION_NAMES` + JSDoc typedefs, adapter switch on `VITE_DATA_SOURCE`
  - Deterministic mock adapter (taxonomy, fixtures from legacy raw data, catalog search/get/listReviews); other functions throw `unavailable_in_mock`
  - Supabase adapter stubs throw `config` (for A1.5)
  - `formatPrice` / `formatDistance` / `formatRating` / `formatRelativeTime` + vitest coverage
- Files: `src/services/errors.js`, `src/services/contract.js`, `src/services/contract.test.js`, `src/services/index.js`, `src/services/mock/taxonomy.js`, `src/services/mock/fixtures.js`, `src/services/mock/index.js`, `src/services/mock/mock.test.js`, `src/services/supabase/index.js`, `src/lib/format.js`, `src/lib/format.test.js`
- How verified: `npm run check` green (guards OK · lint 0 errors / 1 pre-existing legacy warning · 15/15 tests · build OK). Legacy `*Service.js` / pages untouched.
- Not done / left out (why):
  - No PR yet; not on `main`
  - `src/queries/` and app providers (B1.5) not started
  - Supabase adapter still stubs only (A1.5)
  - Legacy pages still on old `*Service.js` path by design until later strangler tasks
- Next step (exact): push `feat/b1-4-contract` and open PR for contract review (S9); then start B1.5 on a new branch from main (or from this PR once merged)
- Gotchas for the next person:
  - Working tree was already committed as `87ffc51` -- do not re-add the same files as a `wip:` commit
  - PROGRESS.md "Now"/log update in this session is uncommitted until you decide to amend or add a docs commit
  - Legacy Home still uses old services; empty fashion row can still happen until taxonomy is wired through queries/pages

### 2026-09-29 · B1.3 follow-up · daiwang · Cursor
- Done:
  - Compared local Cursor B1.3 tree vs merged PR #3 (`ba93136`); kept merged main as source of truth
  - Removed leftover Notification offer branch that merged B1.3 had only redirected: deleted mock `offers` array, type `"offer"` notifications, `handleOffer`, offer tap/label branch, and `setSelectedOffer` prop
  - Removed dead `selectedOffer` from `App.jsx` LegacyPage props
- Files: `src/legacy/pages/Notification.jsx`, `src/App.jsx`
- How verified: greps clean for offer/`selectedOffer` in those files; commit `f234296` on `main`
- Not done / left out (why): —
- Next step (exact): finish A1.2 or proceed to B1.4
- Gotchas for the next person:
  - `Notification.jsx` still has no real branch for enquiry/review/digest types (only business remains). Needs proper handling when rebuilt against Supabase notifications.

### 2026-09-28 · B1.3 · dk · Antigravity (Gemini 3.7 Flash)
- Done:
  - Removed Phase-2 screens (Offers, OfferDetails, Discover, Addresses, AddAddress, offerService.js) per DECISIONS D16
  - Cleaned up routing, imports, and URL map keys in `App.jsx` and `useSetPage.js`
  - Removed `normalizedOffers` from `normalize.js`
  - Removed `addresses` state, defaultAddresses, and addresses count from `ProfileContext.jsx`
  - Removed Addresses stat and Manage Addresses / Tibu Offers quick actions from `Profile.jsx`
  - Updated `Home.jsx` location line to static "Mumbai" and removed addresses props
  - Redirected remaining `setPage('offers' | 'discover')` in `Reel.jsx` and `Notification.jsx` to `setPage('home')`
  - Removed `src/Discover.jsx` from `scripts/legacy-allowlist.json`
- Files: `src/Offers.jsx` (del), `src/OfferDetails.jsx` (del), `src/Discover.jsx` (del), `src/Addresses.jsx` (del), `src/AddAddress.jsx` (del), `src/services/offerService.js` (del), `src/App.jsx`, `src/hooks/useSetPage.js`, `src/services/mock/normalize.js`, `src/contexts/ProfileContext.jsx`, `src/Profile.jsx`, `src/Home.jsx`, `src/Reel.jsx`, `src/legacy/pages/Notification.jsx`, `scripts/legacy-allowlist.json`
- How verified: `npm run check` (guards + lint + tests + build) all green
- Not done / left out (why):
  - `Reel.jsx` and `ReelsViewAll.jsx` kept for now (scheduled for deletion in B2.4)
  - Notification offer mock/handler left as redirect-only — cleaned up next day by daiwang (`f234296`)
- Next step (exact): finish A1.2 or proceed to B1.4 (Build mock/supabase seam & queries folder)
- Gotchas for the next person: none

### 2026-09-27 · B1.1 / B1.2 / A1.2 · dk · Cursor
- Done:
  - Solo session: dk covered both A and B tracks (no partner session)
  - B1.1: done, merged to main (`f27d73b`) — boot patch + Desserts category filtering
  - B1.2: done, merged to main (`a7a66a0`) — hygiene (AGENTS.md, rules, guards, CI, legacy folders)
  - A1.2 (partial): `tibu-dev` Supabase project created; migrations pushed; cron scheduled and verified
  - `tibu-prod` project also created today (ahead of Week 5 / A5.2) — left untouched (no migrations, no seed)
- Files: `src/Desserts.jsx`, `src/Home.jsx`, `src/App.jsx`, ViewAll defaults, `AGENTS.md`, `.agents/`, `.cursor/`, `.github/`, `scripts/` (B1.2)
- How verified: `npm run build` green; B1.1/B1.2 on `main` (`f27d73b`, `a7a66a0`); A1.2 cron verified on `tibu-dev`
- Not done / left out (why):
  - A1.2 still open: `supabase/` folder (migrations, cron.sql, tests) not yet copied into this repo
  - `docs/kit/rpc-signatures.txt` not yet saved
- Next step (exact): finish A1.2 (copy `supabase/` into repo + save rpc-signatures), then proceed to B1.3
- Gotchas for the next person:
  - Cursor does **not** auto-load `AGENTS.md` from `.cursor/rules/tibu.mdc` — attach `@AGENTS.md` explicitly each new chat, or paste Session Opener (`docs/build/prompts/00_SESSION_AND_RESCUE.md` S1) first

### YYYY-MM-DD · <task id> · <who> · <tool + model>
- Done:
- Files:
- How verified:
- Not done / left out (why):
- Next step (exact):
- Gotchas for the next person:
