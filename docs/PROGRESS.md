# PROGRESS — living log (newest entry on top)

Every AI session starts by reading **Now** and ends by adding a **Log** entry. When a tool runs out of quota mid-task, write the entry anyway (or ask the tool to) so the next tool or person can continue.

## Now
- Week: 2 (5–9 Oct 2026) · Milestone 1 target: end of Week 2
- Data source on preview: `mock` · Production URL: `https://tibu-v1.pages.dev`
- Last green commit on main: `19d5ac6` (merge PR #17 — B2.3 Search page)
- Merged this week: A2.1 real-data setup, A2.2 location store, B2.1 Home, B2.2 Category page, and B2.3 Search page
- In progress: A2.2 origin-stability gap-close on `feat/a2-2-location-store`
- Next task: B2.4 cleanup after A2.2 gap-close merges
- Deferred follow-ups: B2.4 moves `CategoryShortcuts` to `src/components/` and adds search-shaped loading skeletons; Home follow-up adds the conditional “Near you” row and distance sorting for Available today when a location is set.
- Blocked: Cloudflare preview build requires Pages project recreation via Connect to Git on `daiwangk/TIBU_V1` (waiting on Daiwang Cloudflare GitHub app approval if needed)
- Waiting on client: accounts-request message (docs/build/08_CLIENT_COMMS.md §3) — sent 27 Sep for GitHub + Supabase org; Resend and domain access still to be requested · decisions list (docs/build/08_CLIENT_COMMS.md §2) not yet sent
- Unavailable evenings this week: —

## Log

### 2026-10-06 · A2.2 · dk · Cursor Grok 4.6
- Done: Gap-close on the persisted location store. `toOrigin` / `selectSearchOrigin` now cache `{ lat, lng }` so object identity only changes when coordinates change (`useSearchOrigin` is a zustand selector, no `useMemo`). Tests stub `localStorage` with `vi.stubGlobal`, assert persist includes `asked`, and assert `clear()` resets coords/label/source while keeping `asked`.
- Files: `src/stores/location.js`, `src/stores/location.test.js`, `docs/PROGRESS.md`
- How verified: `npm run check` green — guards OK (166 source files, 4 legacy allowlist entries); ESLint 0 errors / 1 pre-existing legacy warning; 13 test files / 74 tests passed; production build OK.
- Not done / left out (why): Pages and catalog hooks untouched (already default `near` only when the caller passes `undefined`). No LocationChip / first-visit sheet (B2.6). No Home “Near you” row (Home follow-up).
- Next step (exact): Merge `feat/a2-2-location-store`; then continue to B2.4 cleanup.
- Gotchas for the next person: `useSearchOrigin()` returns the cached origin object — do not wrap it in a new `{ lat, lng }` in callers. Omit `near` to use the store; pass `near: null` to disable origin. Persist key is `tibu.location` and includes `asked`.

### 2026-10-04 - B2.3 - Antigravity (Gemini 3.1 Pro (High))
- Done: SearchPage at /search with URL-synced q, tab, cat, today, sort, price; 300 ms debounce with replace:true; SearchFiltersSheet; RecentSearches (max 8); infinite "Load more" by offset in pages of 20; Reset filters keeps q; src/Search.jsx deleted.
- Files: created src/pages/search/{SearchPage,SearchFiltersSheet,RecentSearches}.jsx; modified src/App.jsx and docs/PROGRESS.md; deleted src/Search.jsx.
- How verified: npm run check green (70 tests), plus hand checks by me: debounce, Back-button sync, Reset filters keeping q, the three Home deep links, crochet search, distance sort, 390px.
- Not done / left out (why): src/legacy/components/SearchBar.jsx kept because legacy category pages still import it (B2.2/B2.4 remove it).
- Next step (exact): B2.4 cleanup after B2.2 merges; Home follow-up: add NearYouSection and sort Available today by distance when a location is set.
- Gotchas for the next person: omit the `near` key so the stored origin applies; explicit `null` means no origin.

### 2026-10-04 · B2.2 · dk · Antigravity (Claude Sonnet 4.6)
- Done:
  - Built `CategoryPage` at `/category/:slug` replacing 11 legacy category pages.
  - `CategoryPage.jsx`: reads `useParams().slug` → `useCategory(slug)`; unknown slug → `EmptyState` with "Go Home". Drives all filters through URL params (`?sub=`, `?tab=`, `?sort=`, `?today=`, `?price=`) with `replace: true`.
  - `CategoryFilters.jsx`: tab toggle (Products/Businesses), sub-category chips row (All + children, hidden when no children), sort `<Select>` with `distance` disabled + hint when no location origin (`useSearchOrigin()` from A2.2), "Today" `Chip`, price range `<Select>` for products only.
  - On tab change: drops `?sort=` if invalid for new tab; drops `?price=` when switching to Businesses.
  - `ProductGrid.jsx`: `useInfiniteProductSearch` → 2-column grid of `ProductCard variant="grid"`. All 4 states (skeleton/empty/error/data). Load More button hidden when last page < 20 rows.
  - `BusinessList.jsx`: `useInfiniteBusinessSearch` → `BusinessCard` list. Same 4 states + Load More.
  - `CategorySkeleton.jsx`: chips + tab + filters row + 6-card grid skeleton.
  - `src/App.jsx`: replaced 11 legacy `<Route>` elements + 11 imports with single `/category/:slug → <CategoryPage />`. Fixed 3 slug typos in `urlMap` (`resin→resin-art`, `womenfashion→womens-fashion`, `menfashion→mens-fashion`).
  - `src/hooks/useSetPage.js`: same 3 slug fixes in `PAGE_URL_MAP`.
  - `scripts/legacy-allowlist.json`: removed `Desserts.jsx`, `Fashion.jsx`, `Handmade.jsx`.
  - Deleted 11 legacy files: `Candles`, `Crochet`, `Desserts`, `Embroidery`, `Fashion`, `Gifts`, `Handmade`, `Jewellery`, `MenFashion`, `Resin`, `WomenFashion`.
- Files created (5): `src/pages/category/CategoryPage.jsx`, `src/pages/category/CategoryFilters.jsx`, `src/pages/category/ProductGrid.jsx`, `src/pages/category/BusinessList.jsx`, `src/pages/category/CategorySkeleton.jsx`.
- Files modified (3): `src/App.jsx`, `src/hooks/useSetPage.js`, `scripts/legacy-allowlist.json`, `docs/PROGRESS.md`.
- Files deleted (11): `src/Candles.jsx`, `src/Crochet.jsx`, `src/Desserts.jsx`, `src/Embroidery.jsx`, `src/Fashion.jsx`, `src/Gifts.jsx`, `src/Handmade.jsx`, `src/Jewellery.jsx`, `src/MenFashion.jsx`, `src/Resin.jsx`, `src/WomenFashion.jsx`.
- How verified:
  - `npm run check` green: guards OK (164 source files, 4 legacy allowlist entries); ESLint 0 errors / 1 pre-existing legacy warning; 13 test files / 70 tests passed; production build OK (549 kB, smaller than before due to 11 deleted files).
- Not done / left out (why):
  - BottomNav is NOT hidden on `/category/` — it is a hub/discovery page, not a detail page; BottomNav stays visible by design.
  - No browser-level UI check run (localhost dev server running on port 5174).
- Next step (exact): B2.3 (Search page `/search`).
- Gotchas for the next person:
  - `?sort=` is omitted from search params when absent; the hooks default to `distance` if origin is set, else `newest`.
  - Old bookmarks to `/category/resin`, `/category/women-fashion`, `/category/men-fashion` will show the NotFound EmptyState since those aren't valid DB slugs. No redirect added (MVP scope).
  - `availableToday: false` is always passed explicitly (not omitted) per CONTRACT §3 note that SQL treats `null` as "only available today".

### 2026-10-04 · A2.2 · Antigravity (Gemini 3.1 Pro (High))
- Done:
  - Created `src/stores/location.js` using zustand and persist middleware for `tibu.location`.
  - Added store actions `requestGps()`, `setArea()`, `setFromProfile()`, `clear()`, and `markAsked()`.
  - Implemented `useSearchOrigin()` to return memoized `{ lat, lng }` coordinates.
  - Implemented a `guardedStorage` mechanism to prevent errors when `localStorage` is unavailable in the Node environment (vitest).
  - Modified `src/queries/catalog.js` search hooks (`useBusinessSearch`, `useProductSearch`, `useInfiniteBusinessSearch`, `useInfiniteProductSearch`) and detail hooks (`useBusiness`, `useProduct`) to use `useSearchOrigin()` as the default `near` argument when not explicitly provided.
  - Added test suite `src/stores/location.test.js` validating pure function `toOrigin` and store actions without browser dependencies.
- Files created (2): `src/stores/location.js`, `src/stores/location.test.js`.
- Files modified (2): `src/queries/catalog.js`, `docs/PROGRESS.md`.
- How verified:
  - `npm run check` green: guards OK (170 source files, 7 legacy allowlist entries); ESLint 0 errors / 1 pre-existing legacy warning; 70/70 tests pass; production build OK.
- Not done / left out (why):
  - "Near you" section in Home and LocationChip not modified as per constraints ("Nothing in pages or legacy").
- Next step (exact): B2.2 (Category page `/category/:slug`).
- Gotchas for the next person:
  - `useBusiness` and `useProduct` pass `near: undefined` intentionally when the caller leaves it blank, which allows the query hook to substitute `useSearchOrigin()`. An explicit `null` overrides the origin.

### 2026-10-04 · A2.1 · dk · Antigravity (Gemini 3.8 Flash)
- Done:
  - Verified the Supabase adapter locally (`VITE_DATA_SOURCE=supabase`, `localhost:5174`) against tibu-dev.
  - Checked `/p/:id` (₹350, image, no phone) and `/b/:slug` (products, reviews, `?tab=reviews`), plus pending, rejected, and nonexistent slugs → not-found.
  - No mapper changes needed. `npm run check` green.
- Files created: —
- Files modified (1): `docs/PROGRESS.md`.
- Files deleted: —
- How verified:
  - `npm run check` green (guards OK, lint 0 errors, 12 test files / 61 tests passed, build OK).
  - Verified local dev server connected to tibu-dev database.
- Not done / left out (why):
  - Home, Search, and Category (still legacy until B2.1–B2.3).
  - Distance check waits for A2.2 (no location store yet).
  - Preview on Cloudflare: A1.6 is open; the Pages project was created via "source repo import" (`Thipak3/tibu-v1`, `tibu-v12`), so it never builds `daiwangk/TIBU_V1`.
- Next step (exact): Recreate the Pages project through Connect to Git on `daiwangk/TIBU_V1` (Daiwang may need to approve the Cloudflare GitHub app), then set Preview env vars and re-check `/p/<uuid>` on a phone. Next feature task is B2.2 (Category page `/category/:slug`).
- Gotchas for the next person:
  - Vite bakes env vars in at build time, so redeploy after changing them.
  - The two Supabase variable names must match the code exactly (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).

### 2026-10-03 · B2.1 · dk · Antigravity (Gemini 3.8 Flash)
- Done:
  - Rebuilt Home screen (`src/pages/home/HomePage.jsx`) per AGENTS.md, CONTRACT §2–§3, Feature Spec F3, and design system.
  - Implemented `HomeHeader`: brand `Logo` on the left, empty location slot reserved for B2.6 (`<LocationChip />`), and notifications bell icon linking to `/notifications` with 44px touch target.
  - Implemented `HomeHero`: lavender card (`bg-lavender rounded-card-lg`) with brand line in `font-heading font-extrabold text-ink`, subtitle in `text-body`, and search field. Empty-field tap/click navigates to `/search`; form submission navigates to `/search?q=<text>`. Keyboard focus does not trigger navigation (WCAG 3.2.1).
  - Implemented `CategoryShortcuts`: loads top-level categories via `useCategories()`, renders 4-color cycling pastel round tiles (`bg-lavender`, `bg-blush`, `bg-lime`, `bg-mint`) with `getCategoryIcon()` Lucide icons, pulsing circular skeletons when loading, and error retry state.
  - Implemented 3 discovery sections with `SectionHeader` + `HorizontalScroller`:
    - "New businesses" via `useBusinessSearch({ sort: 'newest', limit: 8, radiusKm: null })` with `BusinessRowSkeleton`, `EmptyState`, and `ErrorState`.
    - "New products" via `useProductSearch({ sort: 'newest', limit: 8, radiusKm: null })` with `ProductRowSkeleton`, `EmptyState`, and `ErrorState`.
    - "Available today" via `useProductSearch({ availableToday: true, sort: 'newest', limit: 8, radiusKm: null })` with `ProductRowSkeleton`, `EmptyState`, and `ErrorState`.
    - "Near you" deferred with TODO comment until location store (`useSearchOrigin`) is added in A2.2.
  - Added `min-w-0 w-full` to `HorizontalScroller` and constrained `HomePage` with `overflow-x-hidden` to guarantee zero page-level horizontal overflow at 360, 390, and 430 px viewports.
  - Updated `src/components/SectionHeader.jsx` to satisfy the ≥44px touch-target rule with `min-h-11 px-2 -mr-2`.
  - Updated `src/App.jsx`: route `/` now renders `<HomePage />` directly without `LegacyPage`.
  - Deleted legacy `src/Home.jsx` and removed it from `scripts/legacy-allowlist.json`.
- Files created (9): `src/pages/home/HomePage.jsx`, `src/pages/home/HomeHeader.jsx`, `src/pages/home/HomeHero.jsx`, `src/pages/home/CategoryShortcuts.jsx`, `src/pages/home/HomeSection.jsx`, `src/pages/home/ProductRowSkeleton.jsx`, `src/pages/home/BusinessRowSkeleton.jsx`, `src/pages/home/NewBusinessesSection.jsx`, `src/pages/home/NewProductsSection.jsx`, `src/pages/home/AvailableTodaySection.jsx`.
- Files modified (4): `src/App.jsx`, `scripts/legacy-allowlist.json`, `src/components/HorizontalScroller.jsx`, `src/components/SectionHeader.jsx`, `docs/PROGRESS.md`.
- Files deleted (1): `src/Home.jsx`.
- How verified:
  - `npm run check` green: guards OK (168 source files, 7 legacy allowlist entries); ESLint 0 errors / 1 pre-existing legacy warning; 61/61 Vitest tests pass; production build OK.
  - Headless Chrome CDP device emulation test verified at 360px, 390px, and 430px: `hasHorizontalScroll: false` and `scrollWidth === innerWidth` across all widths.
- Not done / left out (why):
  - "Near you" section skipped until location store is built in A2.2.
  - `<LocationChip />` in header omitted until B2.6.
- Next step (exact): B2.2 (Category page `/category/:slug`).
- Gotchas for the next person:
  - Skeletons and cards in horizontal scrollers require `min-w-0 w-full` on flex parent containers to prevent expanding the 480px AppShell column on narrow viewports.

### 2026-10-03 · B1.8 · dk · Antigravity (Gemini 3.8 Flash)
- Done:
  - Built new Business page loaded from URL (`/b/:slug`) per CONTRACT §3, Feature Spec F8, and design system.
  - Implemented 4 states: `BusinessSkeleton` matching layout, `EmptyState` when not found with Home redirect, `ErrorState` with retry, and full data view.
  - Header: banner image (16:9 with gradient) falling back to `ImagePlaceholder`, overlapping 64px `Avatar` logo, name, category, locality + distance, rating, delivery/pickup badges, description with 4-line clamp toggle.
  - Sticky tabs (Products | Videos | Reviews) synced with URL query param `?tab=`, replacing history entry on change.
  - Products tab: 2-column grid of `ProductCard variant="grid"`, `EmptyState` when no products.
  - Videos tab: Instagram reel embeds via new `ReelEmbed` component using `reelEmbedUrl()` fallback, `EmptyState` when empty.
  - Reviews tab: aggregate rating summary, "Write a review" action with toast, review list with star ratings and relative dates via `formatRelativeTime`, `EmptyState` when empty.
  - Added sticky bottom bar with `ContactButtons` (WhatsApp/Call toasts) and header `SaveButton` + `Share` action.
  - Updated `App.jsx`: route `/b/:slug` -> `BusinessPage`, removed `/business/view` and `/business/:businessId`, updated `LegacyPage` shim for `setSelectedBusiness` and `setPage('business')`.
  - Deleted legacy `src/Business.jsx`.
- Files created (7): `src/components/ReelEmbed.jsx`, `src/pages/business/BusinessPage.jsx`, `src/pages/business/BusinessHeader.jsx`, `src/pages/business/BusinessSkeleton.jsx`, `src/pages/business/ProductsTab.jsx`, `src/pages/business/VideosTab.jsx`, `src/pages/business/ReviewsTab.jsx`.
- Files modified (2): `src/App.jsx`, `docs/PROGRESS.md`.
- Files deleted (1): `src/Business.jsx`.
- How verified:
  - `npm run check` green (guards OK with 159 files, 8 legacy allowlist entries; lint 0 errors / 1 pre-existing legacy warning; 61/61 tests pass; production build OK).
  - Verified `/b/:slug` route and legacy shim redirect normalisation for `whisk-wonders` and `cocoa corner`.
- Not done / left out (why):
  - Real contact reveal / enquiry flow deferred to B3.3.
  - Real saving persistence deferred to B3.5.
  - Real review submission deferred to B5.2.
  - `near` location in `useBusiness` omitted until location store is built in A2.2.
- Next step (exact): B2.1 (Category page `/category/:slug`).
- Gotchas for the next person:
  - Tabs are synced with `?tab=` and replace history on change.
  - Legacy business IDs from mock data equal the URL slugs after lowercasing and URL-encoding (e.g. `cocoa%20corner`).

### 2026-10-02 · B1.7 · dk · Antigravity (Gemini 3.8 Flash)
- Done:
  - Built new Product page loaded from URL (`/p/:productId`) per DECISIONS D7, CONTRACT §3, and mockup.
  - Implemented 4 states: `ProductSkeleton` matching layout, `EmptyState` when not found with Home redirect, `ErrorState` with retry, and full data view.
  - Added `ImageGallery` with horizontal scroll-snap and dot indicators, falling back to `ImagePlaceholder`.
  - Added `ContactButtons` with WhatsApp (primary) and Call (secondary) wired to sonner toast until B3.3.
  - Added `SaveButton` with heart icon wired to sonner toast until B3.5.
  - Integrated with query & provider infrastructure: `src/queries/keys.js` (CONTRACT §8), `src/queries/catalog.js` (`useProduct`), and `src/app/providers.jsx` (`QueryClientProvider` + `Toaster`).
  - Updated `App.jsx`: added route `/p/:productId`, removed `/product/view` and `/product/:productId`, updated `LegacyPage` shim so `setSelectedProduct` ref + `setPage('product')` redirect to `/p/${ref.current.id}`.
  - Added `'/p/'` and `'/b/'` to `HIDDEN_PREFIXES` in `src/layouts/BottomNav.jsx`.
  - Deleted legacy `src/Product.jsx` per the strangler rule.
- Files created (9): `src/queries/keys.js`, `src/queries/catalog.js`, `src/app/providers.jsx`, `src/components/ImageGallery.jsx`, `src/components/ContactButtons.jsx`, `src/components/SaveButton.jsx`, `src/pages/product/ProductPage.jsx`, `src/pages/product/ProductDetailsList.jsx`, `src/pages/product/ProductSkeleton.jsx`.
- Files modified (5): `package.json`, `package-lock.json`, `src/main.jsx`, `src/App.jsx`, `src/layouts/BottomNav.jsx`.
- Files deleted (1): `src/Product.jsx`.
- How verified:
  - `npm run check` exits 0 (guards OK with 133 source files, 8 legacy allowlist entries; lint 0 errors / 1 pre-existing legacy warning; 15/15 tests pass; build OK).
  - Browser verification at 390×844: validated loading & data view on `/p/crochet-by-sarah-crochet-flowers`, Save toast ("Saving arrives with accounts"), WhatsApp/Call toasts ("Contact opens after login — coming soon"), business card link to `/b/crochet-by-sarah`, EmptyState on `/p/nonexistent-item-999` with "Back to Home" navigation, and confirmed BottomNav is hidden.
- Not done / left out (why):
  - Real contact reveal / enquiry flow deferred to B3.3.
  - Real saving persistence deferred to B3.5.
  - `near` location store in `useProduct` omitted per task step 8 (location store scheduled for A2.2).
- Next step (exact): B1.8 (Business page `/b/:slug`).
- Gotchas for the next person:
  - `useProduct(id)` does not pass `near` yet; will receive `near` once the location store is built in A2.2.

### 2026-10-02 · A1.5 · Codex
- Done:
  - Supabase client, error mapping, mappers, and catalog adapter: `searchBusinesses`, `searchProducts`, `getBusinessBySlug`, `getProductById`, `listReviews`, `listCategories`, and `getCategory`.
  - Fixed invalid IDs so `getProductById` returns `null` and `listReviews` returns `[]` for non-UUID IDs without making a network call.
- Files: `src/services/supabase/*` (client, errors, mappers, catalog, index, and tests); `docs/PROGRESS.md` for this log only. No other files.
- How verified: hand-tested on `tibu-dev` with `VITE_DATA_SOURCE=supabase` from the browser console: prices are rupees; pending/rejected businesses and their products return `null`; `handmade` returns only crochet/embroidery/resin-art/candles; limits cap correctly; a privacy regex on `BusinessDetail` finds no `phone`/`whatsapp`/`userId`/`contacts` keys; reviews return `isMine: false`. `npm run check` is green (60/60 tests) with no env vars.
- Not done / left out (why): Cloudflare/OG work, auth and other adapter functions (still `AppError('config')` stubs), and any missing PROGRESS entries from earlier sessions are outside A1.5.
- Next step (exact): Codex S9 review on `git diff main` (including the A1.5 SQL-trap checks), squash into one commit, push, open the PR, partner review, merge, then tick A1.5.
- Gotchas for the next person:
  - `.env.local` holds the anon key and must stay git-ignored; `VITE_*` variables are read only when the dev server starts.
  - Temporary `main.jsx` lines were removed.
  - `searchBusinesses` returned 11 approved businesses on dev (the seed prompt predicted 10); confirm the count in SQL if it matters.

### 2026-10-02 · A1.5 review fixes · Codex
- Done:
  - Public detail reads now query only approved businesses and active products, including an inner approved-business filter for product detail.
  - Product searches reject the unsupported `businessId` filter with a validation error; RPC support remains deferred to a later migration.
  - Mapper distance precedence is RPC `distance_m`, then haversine fallback, then `null`; incomplete-application errors retain the original Supabase error as `cause` with `cause.missing`.
  - Added catalog query-builder, validation, mapper-distance, and error-cause tests.
- Files: `src/services/supabase/catalog.js`, `catalog.test.js`, `mappers.js`, `mappers.test.js`, `errors.js`, `errors.test.js`, `docs/PROGRESS.md`
- How verified: `npm run check` green — guards OK (148 files), lint 0 errors / 1 pre-existing legacy warning, 57/57 tests pass, production build OK.
- Not done / left out (why): `SearchParams.businessId` needs a `p_business_id` parameter in a later RPC migration, which is outside A1.5 and this review-fix scope.

### 2026-10-02 · A1.5 · Cursor (Composer)
- Done:
  - Supabase read adapter: lazy `getSupabase()` client, `mapSupabaseError` (§11), mappers (rupees, distanceM, sort_order, details, no contacts), catalog RPCs + nested getBusinessBySlug / getProductById / listReviews.
  - `buildSearchArgs` pure helper (always-boolean `p_available_today`, radius omit/null, limit cap 50, price×100, near → lat/lng, CONTRACT default sort).
  - Unit tests: errors, mappers, buildSearchArgs; contract export test still green.
- Files: `src/services/supabase/client.js`, `errors.js`, `errors.test.js`, `mappers.js`, `mappers.test.js`, `catalog.js`, `catalog.test.js`, `index.js`, `docs/PROGRESS.md`
- How verified: `npm run check` green — guards OK (148 files), lint 0 errors / 1 pre-existing legacy warning, 52/52 tests pass, production build OK.
- Not done / left out (why): `SearchParams.businessId` not supported yet (no consumer in `src/queries` / `src/pages` / `src/components`; Business page products come from `getBusinessBySlug` nested select). Write/auth/seller/admin still stubs.
- Next step (exact): merge A1.5 PR; smoke against `tibu-dev` with `VITE_DATA_SOURCE=supabase` when ready.
- Gotchas for the next person:
  - `getSupabase()` throws `config` without Vite anon env — mock builds stay fine.
  - `incomplete_application:<keys>` → `AppError('validation')` with `cause.missing`.

### 2026-10-01 · A1.3 review fixes · Cursor (Composer)
- Done:
  - `reelEmbedUrl` returns null when the shortcode fails CONTRACT §12; tests for valid + invalid shortcodes (incl. length 4/5/40/41 boundaries).
  - JSDoc on `normalizeIndianMobile`: returns `'91'+10` digits for wa.me; DB writes must use the 10-digit form.
  - Geo timeout (`code === 3`) → validation AppError covered in tests; `MUMBAI_AREAS` sync comment vs `scripts/seed-dev.mjs`.
  - `categoryIcons.test.js` asserts every CONTRACT §2 slug maps to an explicit icon (not Tag).
- Files: `src/lib/instagram.js`, `src/lib/instagram.test.js`, `src/lib/whatsapp.js`, `src/lib/geo.js`, `src/lib/geo.test.js`, `src/lib/categoryIcons.test.js`, `docs/PROGRESS.md`
- How verified: `npm run check` green — guards OK (140 files), lint 0 errors / 1 pre-existing legacy warning, 38/38 tests pass, production build OK.
- Not done / left out (why): A1.3 review nice-to-haves deferred: revokeObjectUrl, maxSizeMB, NaN guard in haversine, getWithExpiry null ambiguity, 00/0091 tests.
- Next step (exact): open/merge A1.3 PR.
- Gotchas for the next person:
  - `normalizeIndianMobile` is for links; strip leading `91` before writing contacts to the DB.

### 2026-10-01 · A1.3 · Codex
- Done:
  - Added contract-aligned WhatsApp/call links, Instagram shortcode parsing and reel embed URLs, browser location helpers, a seed-aligned `MUMBAI_AREAS` list, browser image compression, safe localStorage helpers, and category-icon mapping.
  - Added `browser-image-compression` as the only dependency; WhatsApp messages use straight ASCII apostrophes consistently.
  - Added focused Vitest coverage for all runtime utilities except the static category-icon map.
- Files: `src/lib/whatsapp.js`, `src/lib/whatsapp.test.js`, `src/lib/instagram.js`, `src/lib/instagram.test.js`, `src/lib/geo.js`, `src/lib/geo.test.js`, `src/lib/image.js`, `src/lib/image.test.js`, `src/lib/storage.js`, `src/lib/storage.test.js`, `src/lib/categoryIcons.js`, `package.json`, `package-lock.json`, `docs/PROGRESS.md`
- How verified: `npm run check` green — guards OK (140 files), lint 0 errors / 1 pre-existing legacy warning, 34/34 tests pass, production build OK.
- Not done / left out (why): A1.4 keeps its local seed area array; moving it to the browser utility is optional and would couple the Node-only seed to application source.
- Next step (exact): commit and open the A1.3 PR; A1.5 can import `haversineMeters` from `src/lib/geo.js` for detail distances.
- Gotchas for the next person:
  - `MUMBAI_AREAS` is an array of `{ name, lat, lng }` records, deliberately aligned with the current seed data; do not create a second UI areas list.
  - `getBrowserLocation` rejects with `AppError('validation', ...)`, including denied, timeout, and unsupported cases.


### 2026-09-30 · B1.5 follow-up · dk · Cursor (Composer)
- Done:
  - Fixed catalog hooks so caller `options` cannot override `queryKey` / `queryFn`: `...options` first in every options-aware hook
  - `enabled` gates now `!!id|slug|businessId && (options.enabled ?? true)` on useCategory / useBusiness / useProduct / useReviews
- Files: `src/queries/catalog.js`, `docs/PROGRESS.md`
- How verified: `npm run check` green; `grep` shows six `...options` spreads, all first in their objects; `git diff --stat` was catalog-only before this PROGRESS update
- Not done / left out (why): —
- Next step (exact): push fix; open/merge B1.5 PR; then B1.7 or A1.5
- Gotchas for the next person:
  - Always put hook-owned `queryKey`/`queryFn`/`enabled` after `...options` so callers can only tighten `enabled`, never replace the service seam

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
- Next step (exact): open/merge B1.5 PR; then B1.7 or A1.5
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
