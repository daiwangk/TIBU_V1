# Week 1 — Stabilise and wire the foundations (28 Sep – 2 Oct)

**Exit check:** on the preview URL, opening a `/p/<id>` link in an incognito phone browser renders the product (mock data); `/b/<slug>` renders the business with its tabs. `db push`, cron and the smoke test are green on `tibu-dev`; seeded data is visible in the Table Editor; the Supabase adapter returns it locally.

Order for B: B1.1 → B1.2 → (B1.3 ∥ B1.4 ∥ B1.6) → B1.5 → B1.7 → B1.8. Order for A: A1.1 → A1.2 → A1.4 → A1.5; A1.3, A1.6, A1.7 fit anywhere after B1.2.

---

## B1.1 · Boot fix
**Owner** B · **Branch** `fix/b1-1-boot` · **Tool** none (patch) · **Est** 30 min · **Needs** —

Steps:
```bash
git checkout -b fix/b1-1-boot
git apply --check ../tibu-build-kit/patches/0001-boot-fix.patch && git apply ../tibu-build-kit/patches/0001-boot-fix.patch
npm ci && npm run build && npm run preview
```
If `git apply --check` fails (your repo moved past commit `444aa7d`), use this prompt in Cursor instead:
```
TASK B1.1 — Make the app build and boot. Minimal fixes only; these legacy files are replaced later, so don't refactor or restyle.
1. src/App.jsx: `import NotFound from './pages/NotFound'` → './Pages/NotFound' (the folder is capital P; Linux builds are case-sensitive).
2. src/Home.jsx: delete the module-level arrays `fashionProducts`, `fashionBusinesses`, `handmadeBusinesses` at the top of the file (they spread variables that only exist inside the component → ReferenceError). Inside the component, right after the loading early-return, define:
   const fashionBusinesses = [...(womenFashionBusinesses || []), ...(menFashionBusinesses || [])];
   const handmadeBusinesses = [...(crochetBusinesses || []), ...(resinBusinesses || []), ...(candleBusinesses || []), ...(embroideryBusinesses || [])];
3. src/Home.jsx: every `listProducts('x')` becomes `listProducts({ category: 'x' })`. Fix slugs: 'candle'→'candles', 'fahion'→'fashion', 'rein'→'resin'. In `listBusinesses(...)`: 'candle'→'candles', 'desert'→'desserts', 'rein'→'resin'.
4. src/Home.jsx: array literals made only of `something[0]` items can contain undefined — append `.filter(Boolean)` to each such literal.
5. src/Fashion.jsx and src/Handmade.jsx reference `fashionProducts` / `handmadeProducts` that are never defined. At the top of each component add:
   const { data: fashionData } = useAsync(() => listProducts({}));
   const fashionProducts = fashionData || [];
   (and the same with handmadeData / handmadeProducts in Handmade.jsx).
6. src/ProductsViewAll.jsx, src/BusinessViewAll.jsx, src/ReelsViewAll.jsx: default the list prop to [] and title to ''.
Don't remove eslint-disable lines, rename files, or touch any other file. Plan first.
```
**Verify:** `npm run build` passes. With `npm run preview`, hard-load each route and check the DevTools console has no red errors: `/`, `/search`, `/saved`, `/profile`, `/notifications`, `/category/desserts`, `/category/fashion`, `/category/handmade`, `/viewall/products`, `/viewall/businesses`, `/viewall/reels`, `/seller/register`, `/seller/dashboard`, `/nope`. (Some sections are empty or show blank labels — expected; they're rebuilt later.)
**Commit:** `fix(b1.1): app builds on Linux and every route renders`

---

## B1.2 · Repo hygiene, guards and CI
**Owner** B · **Branch** `chore/b1-2-hygiene` · **Tool** you + Cursor for the fallback · **Est** 1.5 h · **Needs** B1.1 merged

Steps:
```bash
git checkout main && git pull && git checkout -b chore/b1-2-hygiene
git apply --check ../tibu-build-kit/patches/0002-legacy-folders.patch && git apply ../tibu-build-kit/patches/0002-legacy-folders.patch
git rm -r scratch
cp -r ../tibu-build-kit/repo-files/. .          # AGENTS.md, .agents/rules, .cursor/rules, .github, scripts, docs/PROGRESS.md, env examples
mkdir -p docs/build && cp -r ../tibu-build-kit/docs/. docs/build/ && cp -r ../tibu-build-kit/prompts docs/build/prompts && cp ../tibu-build-kit/START_HERE.md docs/build/
cp docs/build/01_DECISIONS.md docs/DECISIONS.md
cp docs/build/04_SERVICE_CONTRACT.md docs/CONTRACT.md
npm i -D vitest
```
Then edit by hand:
- `package.json` scripts: `"test": "vitest run --passWithNoTests"` and `"check": "node scripts/check-guards.mjs && npm run lint && npm run test && npm run build"`.
- `.gitignore`: add `.env`, `.env.*`, `!.env.example`, `!.env.seed.example`, `backups/`.
- `eslint.config.js`: add `'functions'` and `'supabase'` to `globalIgnores([...])`.

Patch 0002 moves `src/Components/*` and `src/Pages/*` into `src/legacy/`, and `src/Data/*` into `src/services/mock/data/`, fixing every import. If it doesn't apply, use this prompt:
```
TASK B1.2 fallback — Move legacy folders so they never collide with new lowercase folders (Windows/macOS treat Components and components as the same folder; Linux doesn't).
Use `git mv` for every move (keeps history):
- src/Components/{Banner,BusinessCard,ProductCard,ReelCard,SearchBar}.jsx → src/legacy/components/
- src/Components/brand/Logo.jsx → src/legacy/components/brand/Logo.jsx (fix its assets import: '../../../assets/logo.png')
- src/Pages/{NotFound,Notification}.jsx → src/legacy/pages/ (fix Notification's '../services' and '../hooks' imports to '../../…')
- src/Data/*.js → src/services/mock/data/ (fix imports in src/services/mock/normalize.js to './data/…')
Update every import in src/*.jsx and src/App.jsx. Afterwards src/Components, src/Pages and src/Data must not exist. No other changes. Plan first, then run `npm run build`.
```
**Verify:** `node scripts/check-guards.mjs` → OK · `npm run check` green · `ls src` shows no `Components`, `Pages`, `Data` · push → the CI workflow runs on GitHub and is green · in the tool, run the Rules smoke test (S2) once.
**Commit:** `chore(b1.2): legacy folders, guards, CI, agent rules`

---

## B1.3 · Remove Phase-2 screens
**Owner** B · **Branch** `chore/b1-3-phase2-cut` · **Tool** Cursor Agent · **Est** 1 h · **Needs** B1.2

```
TASK B1.3 — Remove screens that are Phase 2 per the SOW (DECISIONS D16). This task explicitly allows editing the legacy files listed below.
Delete files: src/Offers.jsx, src/OfferDetails.jsx, src/Discover.jsx, src/Addresses.jsx, src/AddAddress.jsx, src/services/offerService.js.
Then:
1. src/App.jsx: remove their imports, routes (/offers, /discover, /addresses, /addresses/new) and urlMap keys (offers, discover, addresses, addaddress). Remove `addresses`, `setAddresses` from LegacyPage props.
2. src/hooks/useSetPage.js: remove the same keys.
3. src/services/mock/normalize.js: remove `normalizedOffers`.
4. src/contexts/ProfileContext.jsx: remove defaultAddresses, addresses state/setter and profileStats.addresses.
5. src/Profile.jsx: remove the Addresses stat and the "Manage Addresses" and "Tibu Offers" rows.
6. src/Home.jsx: it reads `addresses` to show a location line — replace that with the static text "Mumbai" (Home is rebuilt in B2.1).
7. Any remaining setPage('offers' | 'discover' | 'addresses' | 'addaddress') call in legacy files: replace with setPage('home').
8. scripts/legacy-allowlist.json: remove src/Discover.jsx.
Keep Reel.jsx and ReelsViewAll.jsx for now (they go in B2.4). No styling changes. Plan first.
```
**Verify:** `npm run check` green · `git grep -n -i "offer\|discover\|addaddress" src` returns nothing except unrelated words · at 390px tap every BottomNav item and every Profile row → no blank screens, no console errors.
**Commit:** `chore(b1.3): remove Phase 2 screens (offers, discover, addresses)`

---

## B1.4 · Service contract + deterministic mock adapter
**Owner** B (A reviews) · **Branch** `feat/b1-4-contract` · **Tool** Antigravity planning mode (strong model) · **Est** 3 h · **Needs** B1.2

```
TASK B1.4 — Implement the service contract (docs/CONTRACT.md) with a mock adapter, WITHOUT breaking legacy pages.
Read: AGENTS.md, docs/CONTRACT.md (all sections), docs/DECISIONS.md D4–D9, src/services/mock/normalize.js, the raw files in src/services/mock/data/, and supabase/migrations/*_seed_categories.sql if it exists (otherwise use CONTRACT §2).
Legacy pages keep using the old src/services/*Service.js + normalize.js — do not modify those files.

Create:
1. src/services/errors.js — AppError + isAppError exactly as CONTRACT §8.
2. src/services/contract.js — `export const FUNCTION_NAMES = [...]` listing every function in CONTRACT §7, plus JSDoc typedefs copied from CONTRACT §2–6.
3. src/services/mock/taxonomy.js — CATEGORIES (CONTRACT §2 table) and two maps from raw legacy values to slugs:
   - product `page`: desserts, crochet, candles, embroidery, jewellery, gifts → same; resin → resin-art; womenfashion → womens-fashion; menfashion → mens-fashion
   - business `category`: "Desserts"→desserts, "Crochet"→crochet, "Candles"→candles, "Embroidery"→embroidery, "Jewellery"→jewellery, "Gifts"→gifts, "Resin Art"→resin-art, "Women's Fashion"→womens-fashion, "Men's Fashion"→mens-fashion
   Unknown raw values must throw at import time (fail loudly). Export `descendantSlugs(slug)` (the slug plus its children).
4. src/services/mock/fixtures.js — build contract-shaped arrays from the raw data:
   - IDs and slugs IDENTICAL to what normalize.js produces today (business id = its normalized id, which becomes `slug` too; product id = `${businessId}-${slugify(name)}`), so legacy cards still link correctly.
   - Deterministic: lat/lng = MOCK_USER_LOCATION + an offset derived from a string hash of the slug (±0.05°); businesses get approvedAt and products createdAt = 2026-09-01 minus (index × 1 day). No Math.random, no Date.now.
   - price: integer rupees parsed from "₹899". imageUrl/logoUrl/bannerUrl: null (never emoji). description from `about`. rating/reviewCount parsed as in normalize.js. availableToday from the raw product; a business is availableToday if any of its products is. videos: [] (mock reels have no Instagram URL). details: [] unless raw data has obvious key/values.
   - NO phone, whatsapp or instagram fields on public shapes.
   - Reviews: from raw business reviews → Review shape (isMine false).
5. src/services/mock/index.js — implements every name in FUNCTION_NAMES:
   - listCategories, getCategory, searchBusinesses, searchProducts, getBusinessBySlug, getProductById, listReviews — real behaviour over fixtures that mirrors the SQL exactly (CONTRACT §3 and docs/build/09_SQL_RECONCILIATION.md §3): q matches name/description/businessName (case-insensitive); category uses descendantSlugs; availableToday (boolean); minPrice/maxPrice; businessId; sort values are the SQL ones — businesses distance|newest|rating, products distance|newest|price_asc|price_desc; default 'distance' when `near` is set else 'newest'; unknown sort → newest. With `near`: compute distanceM with the haversine in src/utils/distance.js and apply a 15 km radius when radiusKm is undefined (radiusKm null = no limit); without `near` distanceM is null. limit default 20, capped at 50; offset. Always return copies — never sort or mutate fixture arrays. 150 ms artificial delay.
   - every other function: `throw new AppError('unavailable_in_mock', 'Needs the real backend')`.
6. src/services/supabase/index.js — same export names, each throwing AppError('config', 'Supabase adapter not implemented yet'). Person A fills these in (A1.5).
7. src/services/index.js — adapter switch exactly as CONTRACT §8, exporting every FUNCTION_NAMES entry, plus `dataSource`.
8. src/lib/format.js — formatPrice, formatDistance, formatRating, formatRelativeTime per CONTRACT §9.
9. Tests (vitest): src/services/contract.test.js — both adapters export every FUNCTION_NAMES entry as a function; src/services/mock/mock.test.js — (a) category 'handmade' returns only crochet/embroidery/resin-art/candles products, (b) two calls return the same order and distances, (c) searchProducts({ sort: 'price_asc' }) is ascending and doesn't change a later unsorted call, (c2) limit: 100 returns at most 50, (c3) with near and no radiusKm nothing beyond 15 km is returned, (d) no returned object has a key matching /phone|whatsapp/i, (e) getProductById('does-not-exist') → null; src/lib/format.test.js for the CONTRACT §9 examples.
Don't touch legacy files. Plan first.
```
**Verify:** `npm run check` green (tests run) · the app still behaves exactly as after B1.3 (legacy pages untouched) · A reviews the PR against CONTRACT.md with prompt S9.
**Commit:** `feat(b1.4): service contract, deterministic mock adapter, format helpers`

---

## B1.5 · Providers, error boundary, catalog query hooks
**Owner** B · **Branch** `feat/b1-5-queries` · **Tool** Cursor Agent · **Est** 1.5 h · **Needs** B1.4

```
TASK B1.5 — Data layer and app providers.
Add dependencies: @tanstack/react-query, zustand, sonner (OK'd).
Create:
1. src/app/providers.jsx — QueryClientProvider (defaults: staleTime 60_000, retry 1, refetchOnWindowFocus true) and sonner <Toaster position="top-center" richColors />. Export <Providers>.
2. src/app/ErrorBoundary.jsx — class component; on error shows a friendly full-screen message ("Something went wrong") with a Reload button and a Home link, styled with Tailwind tokens. Logs the error with console.error only in dev.
3. src/main.jsx — wrap <App/> in <Providers> and <ErrorBoundary>, keeping the legacy ProfileProvider/SavedProvider for now.
4. src/queries/keys.js — exactly CONTRACT §8.
5. src/queries/catalog.js — hooks calling src/services/index.js:
   useCategories(), useCategory(slug), useBusinessSearch(params, options), useProductSearch(params, options), useInfiniteBusinessSearch(params) and useInfiniteProductSearch(params) (useInfiniteQuery, pages of 20 via offset, getNextPageParam returns undefined when a page has fewer than 20 rows — the SQL caps limit at 50, so never grow limit), useBusiness(slug, near), useProduct(id, near), useReviews(businessId, { limit, offset }).
   Every key includes all params (so changing a URL param refetches). `enabled: !!slug` / `!!id` where relevant. Options pass through (e.g. { enabled }).
Don't touch legacy pages or useAsync. Plan first.
```
**Verify:** `npm run check` green · add a temporary `console.log(useProductSearch({ limit: 3 }).data)` in a scratch component, see 3 products, then remove it (or wait until B1.7 uses the hooks).
**Commit:** `feat(b1.5): query client, error boundary, catalog hooks`

---

## B1.6 · UI primitives and shared components
**Owner** B · **Branch** `feat/b1-6-ui-kit` · **Tool** Antigravity (browser for the gallery check) · **Est** 3 h · **Needs** B1.2 (format helpers from B1.4 for Price/Distance)

```
TASK B1.6 — Build the in-house UI kit (DECISIONS D14, D15). Tailwind v4 classes using tokens from src/styles/theme.css only; no style={{}}; lucide-react icons; each component < 150 lines, one per file, JSDoc for props.
Read: AGENTS.md §5, .agents/rules/design-system.md, design/mockups/*.png, src/styles/theme.css.

src/components/ui/:
Button (variants primary | secondary | ghost | danger; sizes sm | md | lg; `loading` shows Spinner and disables; renders <a> when `href` given, <Link> when `to` given), IconButton (required `label` → aria-label; 44×44 min), Card, Badge (tones neutral | success | warning | plum), Chip (toggleable, aria-pressed), Input, Textarea, Select (native <select>), Switch (role="switch"), Tabs (controlled: `value`, `onChange`, items), Sheet (bottom sheet on native <dialog>: open/onClose, drag-free, closes on backdrop click and Escape, locks body scroll, focus returns to trigger), Dialog (centred, same mechanics), Skeleton (rect | circle | text lines), Spinner, EmptyState (icon, title, text, optional action), ErrorState (message, onRetry), PageHeader (back button — navigate(-1) if history.length > 1 else to `fallbackTo`; title; right-side actions slot), Avatar (image or initials), ImagePlaceholder (pastel background + lucide ImageOff icon, aspect ratio prop).

src/components/:
brand/Logo.jsx (rewrite of src/legacy/components/brand/Logo.jsx without inline styles; same fallback wordmark),
Price (formatPrice; size sm | md | lg), Rating (star icon + formatRating + "(count)"), Distance (MapPin + formatDistance; renders nothing when null),
ProductCard (props: product: ProductSummary; variants 'row' (fixed 160px wide, for horizontal scrollers) and 'grid' (fills its grid cell); image or ImagePlaceholder; name 2-line clamp; Price; businessName · Distance; "Today" badge; whole card is a <Link to={`/p/${id}`}>; optional `action` slot top-right for SaveButton),
BusinessCard (business: BusinessSummary; logo/placeholder, name, category, locality · Distance, Rating; <Link to={`/b/${slug}`}>),
SectionHeader (title + optional "View all" <Link>), HorizontalScroller (scroll-snap row with 16px gutters, no scrollbar), CategoryChips (list of Category; value; onChange).

src/pages/dev/UiGalleryPage.jsx: shows every component in its states with fake data. Route `/dev/ui` added in src/App.jsx ONLY when import.meta.env.DEV (not a LegacyPage). Add '/dev/' to BottomNav HIDDEN_PREFIXES.
Plan first; group the plan by file.
```
**Verify:** `npm run check` green · `npm run dev` → `/dev/ui` at 390px: everything readable, touch targets ≥ 44px, focus rings visible on Tab, Sheet opens/closes with Escape and backdrop · `npm run build && npm run preview` → `/dev/ui` shows the 404 (dev-only route).
**Commit:** `feat(b1.6): UI primitives, cards, dev gallery`

---

## B1.7 · Product page at `/p/:productId`
**Owner** B · **Branch** `feat/b1-7-product-page` · **Tool** Antigravity · **Est** 2 h · **Needs** B1.5, B1.6

```
TASK B1.7 — New Product page loaded from its URL (DECISIONS D7). Replaces src/Product.jsx.
Read: AGENTS.md, docs/CONTRACT.md §3 (ProductDetail), docs/kit/06_Feature_Specs.md (Product page feature), design/mockups/product-page.png, src/queries/catalog.js.
1. src/pages/product/ProductPage.jsx (+ subcomponents in src/pages/product/ if > 150 lines): useParams().productId → useProduct(id). States: loading skeleton matching the layout; not found → EmptyState "This product isn't available" + link Home; error → ErrorState with retry.
   Layout (mobile-first, per mockup): PageHeader (back, fallback '/'); ImageGallery (src/components/ImageGallery.jsx: swipeable scroll-snap row of images with dots; ImagePlaceholder when none); name (font-heading); Price size lg; "Available today" badge if true; business row → <Link to={`/b/${business.slug}`}> with logo, name, locality, Distance, Rating; description; details as a label/value list (hide section if empty); sticky bottom bar with ContactButtons.
2. src/components/ContactButtons.jsx: two buttons, "WhatsApp" (primary, MessageCircle icon) and "Call" (secondary, Phone icon). Props: business, product (optional), onContact(channel). For now the page passes an onContact that shows a sonner toast "Contact opens after login — coming soon". (Wired for real in B3.3.)
3. src/components/SaveButton.jsx: heart IconButton, props kind/id; for now toast "Saving arrives with accounts". (Real in B3.5.)
4. src/App.jsx: add route `/p/:productId` → ProductPage (not wrapped in LegacyPage). Remove routes `/product/view` and `/product/:productId` and the urlMap key `product`. In LegacyPage, `setSelectedProduct(p)` must store p in a ref (useRef) and `setPage('product')` must navigate to `/p/${ref.current.id}` — so legacy cards link to the new page.
5. src/layouts/BottomNav.jsx: add '/p/' and '/b/' to HIDDEN_PREFIXES.
6. Delete src/Product.jsx.
Plan first.
```
**Verify:** from Home (legacy) tap a product → URL is `/p/<id>` and the product renders · copy the URL into a new incognito window → same product · hard refresh keeps it · `/p/nope` → not-found state · browser Back returns to the previous page · all 4 states seen (DevTools throttling for loading) · 390px matches the mockup's structure.
**Commit:** `feat(b1.7): product page at /p/:productId`

---

## B1.8 · Business page at `/b/:slug`
**Owner** B · **Branch** `feat/b1-8-business-page` · **Tool** Antigravity · **Est** 3 h · **Needs** B1.7

```
TASK B1.8 — New Business page loaded from its URL. Replaces src/Business.jsx.
Read: AGENTS.md, docs/CONTRACT.md §3 (BusinessDetail, Video, Review), docs/kit/06_Feature_Specs.md (Business page), src/queries/catalog.js, src/components/*.
1. src/pages/business/BusinessPage.jsx (+ BusinessHeader.jsx, ProductsTab.jsx, VideosTab.jsx, ReviewsTab.jsx): useParams().slug → useBusiness(slug). Not found / error / loading states as in ProductPage.
   Header: banner (or pastel placeholder, aspect 16/9), logo overlapping the banner, name, category name, locality · Distance, Rating, Delivery/Pickup badges, description (clamp 4 lines with "Read more"), ContactButtons (same toast behaviour as B1.7), SaveButton.
   Tabs Products | Videos | Reviews synced to `?tab=` (default products; replace history entry on change).
   - Products: 2-column grid of ProductCard variant 'grid'; EmptyState if none.
   - Videos: src/components/ReelEmbed.jsx renders an iframe `https://www.instagram.com/reel/${shortcode}/embed` with title, loading="lazy", 9:16 aspect via Tailwind, and a caption; EmptyState "No videos yet" when the list is empty (mock data has none — that's expected).
   - Reviews: rating summary (average + count) and a list via useReviews(business.id); each review: first name, stars, relative date, body. A "Write a review" button shows a toast "Reviews open with accounts" (real in B5.2). EmptyState if none.
2. src/App.jsx: route `/b/:slug` → BusinessPage. Remove `/business/view`, `/business/:businessId` and the urlMap key `business`. LegacyPage: setSelectedBusiness stores in a ref; setPage('business') navigates to `/b/${ref.current.id}` (legacy business ids equal the new slugs).
3. Delete src/Business.jsx.
Plan first.
```
**Verify:** tap a business from legacy Home → `/b/<slug>` renders · `?tab=reviews` in the URL opens Reviews directly and survives refresh · product cards open `/p/<id>` · back navigation works · `/b/nope` → not found · 4 states.
**Commit:** `feat(b1.8): business page at /b/:slug with tabs`

---

## A1.1 · Accounts (manual)
**Owner** A · **Est** 1 h + waiting · Send `docs/build/08_CLIENT_COMMS.md` §3 on Day 1. Track each account in PROGRESS "Waiting on client". If Supabase isn't ready by Day 2, proceed in your own org (D28).

## A1.2 · Supabase dev + import the dev kit
**Owner** A · **Branch** `chore/a1-2-supabase` · **Tool** you (+ Claude.ai for errors, prompt D3) · **Est** 2 h · **Needs** —
Follow `docs/build/06_BACKEND_RUNBOOK.md` §2–§5 exactly — including copying `supabase-fixes/20260927000007_fix_connected_order.sql` into `supabase/migrations/` **before** the first push (it fixes a real ordering bug; see `docs/build/09_SQL_RECONCILIATION.md` §2). Save the RPC list (§4 query 3) to `docs/kit/rpc-signatures.txt` and commit it with `supabase/` and `docs/kit/`.
**Verify:** 17 tables · zero tables without RLS · categories match CONTRACT §2 (if not, update CONTRACT §2 *and* B1.4's taxonomy in one PR) · cron jobs listed · smoke test all OK · curl probes return `[]` for private tables.
**Commit:** `chore(a1.2): supabase migrations and dev kit docs`

## A1.3 · `src/lib` utilities in JavaScript
**Owner** A · **Branch** `feat/a1-3-lib` · **Tool** Cursor Agent · **Est** 2 h · **Needs** B1.2 (vitest), ideally B1.4 (format.js exists)
```
TASK A1.3 — Port the dev kit's TypeScript snippets to JavaScript utilities with tests.
Read: AGENTS.md, docs/CONTRACT.md §9–§10, docs/kit/snippets/src/lib/*.ts (reference only).
Create (JSDoc types, no TypeScript):
1. src/lib/whatsapp.js — normalizeIndianMobile, productMessage, businessMessage, whatsappLink, callLink exactly per CONTRACT §10 (message text must match character for character, including the curly apostrophes if the SOW uses them — use straight ASCII apostrophes consistently and note it).
2. src/lib/instagram.js — parseInstagramShortcode(url) accepting /reel/, /reels/, /p/, /tv/ URLs with or without query strings and trailing slashes → shortcode or null; reelEmbedUrl(shortcode).
3. src/lib/geo.js — haversineMeters(a, b); getBrowserLocation({ timeoutMs = 10000 }) → Promise<{lat,lng}> rejecting with AppError('validation', …) on denial/timeout/unsupported; MUMBAI_AREAS (port from the snippet: name, lat, lng).
4. src/lib/image.js — compressImage(file, { maxEdge = 1200, type = 'image/webp', quality = 0.8 }) using browser-image-compression (add the dependency), and fileToObjectUrl helper. No upload code here (uploads live in the Supabase adapter, A4.2).
5. src/lib/storage.js — safe localStorage helpers: readJSON(key, fallback), writeJSON(key, value), withExpiry helpers (setWithExpiry(key, value, ms), getWithExpiry(key)).
6. src/lib/categoryIcons.js — map each CONTRACT §2 slug to a lucide-react icon component (e.g. desserts → CakeSlice, food → UtensilsCrossed, handmade → Scissors, crochet → Spool or a close alternative that exists in lucide, candles → Flame, resin-art → Droplets, embroidery → Shirt, fashion → Shirt, womens-fashion → Sparkles, mens-fashion → Shirt, jewellery → Gem, gifts → Gift); fall back to Tag. Only use icon names that exist in the installed lucide-react version.
7. Tests next to each file: whatsapp (valid/invalid numbers, +91/0/spaces, the exact SOW sentence for "Chocolate Chunk Cookies" at ₹350, URL encoding), instagram (5 URL shapes + garbage), geo (haversine Bandra→Andheri ≈ 7–9 km), storage (expiry).
Replace nothing in legacy code. Plan first.
```
**Verify:** `npm run check` green; test count increases.
**Commit:** `feat(a1.3): whatsapp, instagram, geo, image and storage utilities`

## A1.4 · Dev seed script
**Owner** A · **Branch** `chore/a1-4-seed` · **Tool** Antigravity · **Est** 2 h · **Needs** A1.2
```
TASK A1.4 — Write scripts/seed-dev.mjs (Node 22, ESM, not imported by src/). Run with: node --env-file=.env.seed scripts/seed-dev.mjs
Read: supabase/migrations/20260925000001_init_schema.sql (exact columns), 20260925000006_seed_categories.sql, docs/kit/rpc-signatures.txt, src/lib/geo.js (MUMBAI_AREAS).
Safety: read SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SEED_ALLOWED_REF from process.env; refuse to run (exit 1 with a clear message) unless SUPABASE_URL contains SEED_ALLOWED_REF. Print the target URL before writing.
Idempotent (re-running must not duplicate): fixed emails, upsert businesses by slug, delete-and-recreate child rows per business.
Create:
1. 12 sellers seller1…seller12@tibu.test (password Test@12345, email_confirm true, user_metadata { full_name, signup_as: 'seller' }) via supabase.auth.admin.createUser (skip if exists).
2. 2 customers customer1/2@tibu.test (signup_as 'customer'); customer1 home_locality 'Andheri West', home_lat 19.1364, home_lng 72.8296.
3. One business per seller spread over MUMBAI_AREAS with small offsets, covering every leaf category at least once; realistic Indian homegrown names/descriptions; instagram_handle; logo/banner URLs from https://picsum.photos/seed/<slug>-logo/400/400 and /seed/<slug>-banner/1200/675. Statuses: 10 approved (approved_at spread over the last 30 days), 1 pending, 1 rejected with a rejection_reason (for the admin panel in Week 4). The service role may set status directly.
4. business_contacts for each: fake numbers 90000000NN.
5. 3–5 products per business (~45) with price_paise (e.g. 35000), description, details jsonb (2–4 keys), 1–3 product_images from picsum; ~20% available_today.
6. business_videos for 3 businesses using REAL public Instagram reel URLs if I provide them in REELS env var (comma-separated), otherwise skip and print a reminder.
7. 1–3 reviews per approved business from the two customers so ratings aggregate.
Print a summary table (counts per table). Plan first.
```
**Verify:** run it twice → same counts · Table Editor shows `location` filled on businesses and non-zero `rating_avg` · pending/rejected businesses are **not** visible via the anon curl probe.
**Commit:** `chore(a1.4): idempotent dev-only seed script`

## A1.5 · Supabase client + catalog adapter
**Owner** A · **Branch** `feat/a1-5-supabase-catalog` · **Tool** Antigravity or Cursor · **Est** 3 h · **Needs** A1.2, B1.4
```
TASK A1.5 — Implement the read side of the Supabase adapter.
Add dependency: @supabase/supabase-js (OK'd).
Read: AGENTS.md, docs/CONTRACT.md §1–§3 and §7, docs/kit/04_API_and_Data_Access.md (Home, Search, Category, Business, Product, Reviews rows), docs/kit/rpc-signatures.txt, supabase/migrations/20260925000004_rpc.sql (exact RPC names, params, return columns, RAISE error codes). If this prompt and the SQL disagree, the SQL wins — tell me.
1. src/services/supabase/client.js — getSupabase(): lazily creates ONE client from import.meta.env.VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY; throws AppError('config', …) if either is missing (so the mock build works without env vars). auth options: persistSession true, autoRefreshToken true, detectSessionInUrl true.
2. src/services/supabase/errors.js — mapSupabaseError(err) → AppError exactly per CONTRACT §11 (match the message prefix first — P0002 is used by both business_not_available and not_found; incomplete_application:<keys> → validation with cause.missing). Unit-test the mapping table.
3. src/services/supabase/mappers.js — row → contract shape for Category, BusinessSummary, BusinessDetail, ProductSummary, ProductDetail, Review, Image, Video. price = Math.round(price_paise / 100). distance_m → distanceM (null if absent). Sort images/videos/products by sort_order. details jsonb → [{label, value}]. Never map contact columns.
4. src/services/supabase/catalog.js — listCategories (active, ordered, with parent slug), getCategory, searchBusinesses → rpc('search_businesses', …), searchProducts → rpc('search_products', …) mapping SearchParams to the SQL parameter names: p_lat/p_lng from near; p_radius_km omitted when radiusKm is undefined, sent as null when null; p_available_today ALWAYS a boolean (null would return only available-today rows); p_sort passed through unchanged (distance|newest|rating|price_asc|price_desc); p_limit min(limit, 50); p_offset; minPrice/maxPrice × 100 → p_min/max_price_paise. Map approved_at → approvedAt, business_logo_url → businessLogoUrl, rating_avg → businessRating on products. getBusinessBySlug (nested select of categories, business_images, business_videos, products with product_images — no business_contacts; filter products to is_active in the mapper; distanceM via haversine from lat/lng when near is given; null if not found/not visible), getProductById (nested select incl. its business with lat/lng; same distance rule; null if not found), listReviews (select user_id too, only to compute isMine — never return it).
5. src/services/supabase/index.js — export the implemented functions; keep the AppError('config', 'not implemented yet') stubs for the rest, so every FUNCTION_NAMES entry still exists.
6. Keep src/services/contract.test.js passing.
Plan first.
```
**Verify:** `.env.local` with `VITE_DATA_SOURCE=supabase` + dev keys → `npm run dev` → `/p/<seeded uuid>` and `/b/<seeded slug>` render real data; prices show ₹350 for 35000 paise · switch back to `mock` → still works · `npm run check` green with no env vars.
**Commit:** `feat(a1.5): supabase client and catalog adapter`

## A1.6 · Cloudflare Pages previews
**Owner** A · **Est** 1 h · **Needs** B1.2 merged · Follow `06_BACKEND_RUNBOOK.md` §8. **Verify:** push a branch → preview URL → hard-load `/p/anything` → the app boots (not a Cloudflare 404). Put the preview URL in PROGRESS.

## A1.7 · Auth settings (dev)
**Owner** A · **Est** 1 h · **Needs** A1.2 (SMTP needs the domain; defer SMTP to Week 3 if the domain isn't ready) · Follow `06` §7. **Verify:** Site URL and redirect URLs saved; a test signup on dev sends an email (built-in mailer is fine for now).
