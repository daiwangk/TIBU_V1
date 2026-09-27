# Week 2 — Catalog screens, real data, Milestone 1 (5 – 9 Oct)

**Exit check (= Milestone 1):** on a phone, the preview (on real Supabase data) shows the rebuilt Home, Category, Search, Business and Product pages; nearest sorting works after picking an area; a seeded product link pasted into WhatsApp shows its image; no legacy customer screen is reachable except Profile/Saved/Notifications (rebuilt in Weeks 3 and 5). Demo + invoice.

Order for B: B2.1 → B2.2 → B2.3 → B2.6 → B2.4 → B2.5. Order for A: A2.1 → A2.2 → A2.3 → A2.4 (A2.2 before B2.6).

---

## B2.1 · Home page
**Owner** B · **Branch** `feat/b2-1-home` · **Tool** Antigravity · **Est** 3 h · **Needs** B1.5–B1.8

```
TASK B2.1 — Rebuild Home. Replaces src/Home.jsx.
Read: AGENTS.md, docs/CONTRACT.md §2–§3, docs/kit/06_Feature_Specs.md (Home), .agents/rules/design-system.md, design/mockups/welcome-modal.png (style reference), src/queries/catalog.js, src/components/*, src/lib/categoryIcons.js.
src/pages/home/HomePage.jsx plus section components in src/pages/home/:
1. HomeHeader: Logo left; a location slot right (render `<LocationChip />` if src/components/LocationChip.jsx exists, else nothing — B2.6 adds it); bell icon placeholder (no badge yet).
2. Hero: a short brand line (e.g. "Discover homegrown businesses near you") in font-heading on a pastel surface, with the search field inside it. Submitting the search navigates to `/search?q=<text>`; focusing an empty field navigates to `/search`.
3. CategoryShortcuts: top-level categories from useCategories() (parentSlug === null), each a round pastel tile with its lucide icon and name → `/category/<slug>`; horizontal scroller.
4. Sections, each a SectionHeader + HorizontalScroller, each with skeleton / EmptyState / ErrorState:
   - "New businesses" — useBusinessSearch({ sort: 'newest', limit: 8, near, radiusKm: null }) → BusinessCard; View all → `/search?tab=businesses&sort=newest`
   - "New products" — useProductSearch({ sort: 'newest', limit: 8, near, radiusKm: null }) → ProductCard row; View all → `/search?tab=products&sort=newest`
   - "Available today" — useProductSearch({ availableToday: true, sort: near ? 'distance' : 'newest', limit: 8, near, radiusKm: null }) → ProductCard row; View all → `/search?tab=products&today=1`
   - "Near you" — only when a location is set: useBusinessSearch({ sort: 'distance', limit: 8, near }) (default 15 km radius).
   radiusKm: null keeps the "new" and "today" rows city-wide while still showing distances (DECISIONS D30).
   `near` comes from `useSearchOrigin()` in src/stores/location.js if it exists (A2.2), otherwise null.
5. src/App.jsx: route '/' → HomePage (not LegacyPage). Delete src/Home.jsx and remove it from scripts/legacy-allowlist.json.
Plan first.
```
**Verify:** all 4 states per section (throttle; an empty category; wrong Supabase URL for error) · every card links to `/p/…` or `/b/…` · category tiles open `/category/<slug>` (legacy pages until B2.2 — acceptable today) · 360/390/430px no horizontal page scroll · compare once with the mockup style.
**Commit:** `feat(b2.1): rebuilt Home page`

---

## B2.2 · Generic CategoryPage
**Owner** B · **Branch** `feat/b2-2-category` · **Tool** Antigravity · **Est** 2 h · **Needs** B2.1

```
TASK B2.2 — One CategoryPage at /category/:slug replaces 11 legacy pages.
Read: AGENTS.md, docs/CONTRACT.md §2–§3, src/queries/catalog.js, src/components/*.
1. src/pages/category/CategoryPage.jsx (+ CategoryFilters.jsx): useParams().slug → useCategory(slug); unknown slug → NotFound state with link Home.
   - PageHeader with the category name.
   - If the category has children: CategoryChips "All" + children, synced to `?sub=`. The effective slug is `sub` or the category itself (parents include children in search).
   - Products | Businesses toggle synced to `?tab=` (default products).
   - Filters row: "Available today" Chip (`?today=1`), Sort select synced to `?sort=` with the SQL values (CONTRACT §3): businesses `distance` (label "Nearest" — disabled with hint "Set your location" when no origin), `newest`, `rating`; products `distance`, `newest`, `price_asc`, `price_desc`, and for products a price range Select (Any, Under ₹500, ₹500–₹1,000, Above ₹1,000) → minPrice/maxPrice numbers synced to `?price=`.
   - Results: grid of ProductCard 'grid' or list of BusinessCard via useInfiniteProductSearch / useInfiniteBusinessSearch (pages of 20); "Load more" fetches the next page by offset and hides when the last page had fewer than 20 rows. Never grow limit (SQL caps it at 50).
   - All URL params use setSearchParams with replace: true.
2. src/App.jsx: route `/category/:slug` → CategoryPage. Remove the 11 legacy category routes and their imports.
3. Delete src/Desserts.jsx, Crochet.jsx, Resin.jsx, Candles.jsx, Embroidery.jsx, Jewellery.jsx, WomenFashion.jsx, MenFashion.jsx, Gifts.jsx, Fashion.jsx, Handmade.jsx; remove their allowlist entries; remove their urlMap keys in LegacyPage and hooks/useSetPage.js. Any remaining legacy setPage('<category>') call → navigate to `/category/<new slug>` via the urlMap pointing at the new slugs (resin → resin-art, womenfashion → womens-fashion, menfashion → mens-fashion).
Plan first.
```
**Verify:** `/category/handmade` shows chips Crochet/Embroidery/Resin Art/Candles and results from all four · `?sub=candles&tab=businesses&today=1` reloads into the same view · price filter numeric · `/category/nope` → not found · `git ls-files src | grep -E "Desserts|Crochet|Handmade"` → nothing.
**Commit:** `feat(b2.2): generic CategoryPage replaces 11 legacy pages`

---

## B2.3 · Search page
**Owner** B · **Branch** `feat/b2-3-search` · **Tool** Antigravity · **Est** 3 h · **Needs** B1.6

```
TASK B2.3 — Search at /search with URL state. Replaces src/Search.jsx and src/legacy/components/SearchBar.jsx.
Read: AGENTS.md, docs/CONTRACT.md §3 (SearchParams), docs/kit/06_Feature_Specs.md (Search), src/queries/catalog.js.
1. src/pages/search/SearchPage.jsx (+ SearchFiltersSheet.jsx, RecentSearches.jsx):
   - Search input autofocused; debounced 300 ms → `?q=` (replace). Clear button.
   - With no q and no filters: RecentSearches (last 8 from localStorage via src/lib/storage.js key 'tibu.recentSearches'; tap to reuse; "Clear") and the top-level category tiles.
   - Tabs Products | Businesses (`?tab=`), each tab label with a result count when known.
   - Filters button opens SearchFiltersSheet (Sheet): category Select (all categories, children indented), Available today Switch, Sort (as in CategoryPage), price range (products). "Apply" writes URL params `cat`, `today`, `sort`, `price`; "Reset" clears them. Active filter count on the button.
   - Results use useProductSearch / useBusinessSearch with { q, category, availableToday, sort, minPrice, maxPrice, near, limit }; "Load more" as in CategoryPage. EmptyState "No results for “q”" with a Reset filters action.
   - Save q to recent searches when results load and q.length ≥ 2.
2. src/App.jsx: '/search' → SearchPage. Delete src/Search.jsx and src/legacy/components/SearchBar.jsx if nothing else imports it (check with git grep; if a legacy file still imports it, leave it and say which). Update the allowlist.
Plan first.
```
**Verify:** type "cake" → results update without pressing enter · reload keeps query, tab and filters · Back returns to the previous search state · Crochet products appear (audit bug) · recent searches persist and clear.
**Commit:** `feat(b2.3): search with URL state and filters`

---

## B2.6 · Location UX
**Owner** B · **Branch** `feat/b2-6-location-ux` · **Tool** Cursor Agent · **Est** 2 h · **Needs** A2.2

```
TASK B2.6 — Location chip, area picker and first-visit prompt, using src/stores/location.js (A2.2).
Read: AGENTS.md, src/stores/location.js, src/lib/geo.js, src/components/ui/Sheet.jsx.
1. src/components/LocationChip.jsx: MapPin + label ("Set location" when none, else the store label, truncated); opens AreaPickerSheet. aria-label "Change location".
2. src/components/AreaPickerSheet.jsx: "Use my current location" button (calls requestGps; shows Spinner; on error shows the message inline and keeps the sheet open), then a filterable list of MUMBAI_AREAS (search input + list, tap to setArea), and "Clear location".
3. First visit on Home: if the store has `asked === false`, show a small inline card under the hero ("See what's near you" + "Use my location" + "Choose area"), and call markAsked() when dismissed or used. Never auto-trigger the browser permission prompt on page load.
4. Add LocationChip to HomeHeader (B2.1 left a slot) and to SearchPage and CategoryPage headers.
Plan first.
```
**Verify:** pick "Andheri West" → distances appear on cards, Nearest sort enabled and increasing · reload keeps the area · deny GPS in the browser → friendly message, area list still works · on the preview (HTTPS) GPS works on a real phone.
**Commit:** `feat(b2.6): location chip, area picker, first-visit prompt`

---

## B2.4 · Cleanup, static pages, 404
**Owner** B · **Branch** `chore/b2-4-cleanup` · **Tool** Cursor Agent · **Est** 2 h · **Needs** B2.1–B2.3

```
TASK B2.4 — Port static pages, add the 404 page, and delete dead legacy code.
1. src/pages/static/AboutPage.jsx, PrivacyPage.jsx, TermsPage.jsx, HelpPage.jsx: same text content as src/AboutTibu.jsx, PrivacySecurity.jsx, TermsConditions.jsx, HelpFeedback.jsx, rebuilt with PageHeader + Tailwind typography (headings font-heading, body text-body, max line length ~70ch). Mark placeholder legal text with a visible "Draft — final text from Tibu" note (the client supplies real text by Week 5).
2. src/pages/NotFoundPage.jsx: friendly message, Home and Search buttons. Route '*' → NotFoundPage.
3. Update routes /about, /privacy, /terms, /help to the new pages. Delete the four legacy files and src/legacy/pages/NotFound.jsx.
4. Delete src/ProductsViewAll.jsx, src/BusinessViewAll.jsx, src/ReelsViewAll.jsx, src/Reel.jsx and their routes/urlMap keys (links now go to /search or /category).
5. Delete legacy service files that nothing imports any more: check each of src/services/productService.js, businessService.js, reelService.js, searchService.js, categoryService.js, reviewService.js, enquiryService.js, types.js, mock/normalize.js, src/utils/distance.js with `git grep -n "<module name>" src`. Delete only unused ones; list the ones still used and by which file. (If mock/index.js uses utils/distance.js, switch it to src/lib/geo.js haversineMeters first.)
6. Update scripts/legacy-allowlist.json and remove unused LegacyPage props.
Plan first.
```
**Verify:** `npm run check` green · every BottomNav item and every Profile row still works · `/about`, `/privacy`, `/terms`, `/help`, `/random` render the new pages · `node scripts/check-guards.mjs` prints no stale-allowlist warnings.
**Commit:** `chore(b2.4): static pages, 404, remove view-all and reel pages`

---

## B2.5 · Mobile QA and Milestone 1 prep
**Owner** B (A joins for the demo) · **Tool** Antigravity browser agent · **Est** 2 h · **Needs** everything above

Browser agent prompt:
```
QA pass, do not edit code. Using the preview URL <url>, for each viewport 360×800, 390×844, 430×932:
visit /, /search?q=cake, /category/handmade, /category/handmade?sub=candles&tab=businesses, one /b/<slug> (all three tabs), one /p/<id>, /about, /nope.
For each page report: horizontal overflow, text truncation that hides meaning, touch targets under 44px, missing loading/empty/error handling you can trigger, console errors, broken links, anything that looks unlike the design system (.agents/rules/design-system.md).
Output a table: page · viewport · issue · severity (blocker/major/minor) · suggested fix.
```
Then fix blockers and majors in one or two small tasks (prompt S7 per bug). Fill the audit closure table (`docs/build/07_QA_AND_SIGNOFF.md` §3) with evidence, rehearse the demo script (§4) on a real phone, and send the demo invite (`08` §4).

---

## A2.1 · Real data on preview
**Owner** A · **Branch** `chore/a2-1-real-data` · **Tool** you + Cursor for mapper fixes · **Est** 1.5 h · **Needs** A1.4, A1.5
1. Run the seed on dev. 2. In Cloudflare Pages → Preview env set `VITE_DATA_SOURCE=supabase` + the dev URL/anon key; redeploy. 3. Walk every page on the preview; any shape mismatch → fix in `mappers.js` (never in pages). 4. Keep `mock` as the local default so B can work offline.
**Verify:** preview shows seeded businesses with picsum images, real distances after picking an area, ratings from seeded reviews; pending/rejected businesses never appear.
**Commit:** `chore(a2.1): preview on Supabase data, mapper fixes`

## A2.2 · Location store
**Owner** A · **Branch** `feat/a2-2-location-store` · **Tool** Cursor Agent · **Est** 2 h · **Needs** A1.3, B1.5
```
TASK A2.2 — Persisted location store feeding every search.
Read: AGENTS.md, docs/kit/06_Feature_Specs.md (F6 location), src/lib/geo.js, src/queries/catalog.js.
1. src/stores/location.js (zustand + persist middleware, key 'tibu.location'): state { lat, lng, label, source: 'gps'|'area'|'profile'|null, asked }; actions requestGps() (getBrowserLocation → label "Current location"), setArea(name) (from MUMBAI_AREAS), setFromProfile({ lat, lng, label }), clear(), markAsked().
2. export useSearchOrigin() → { lat, lng } | null (memoised so the object identity only changes when coordinates change — otherwise query keys churn).
3. src/queries/catalog.js: the list and detail hooks default `near` to useSearchOrigin() when the caller doesn't pass it; keep `near` inside the query key.
4. Tests: store actions (mock getBrowserLocation), useSearchOrigin stability.
Plan first.
```
**Verify:** set an area in the console via the store, Home "Near you" appears and distances show · reload keeps it · clearing removes distances.
**Commit:** `feat(a2.2): persisted location store and search origin`

## A2.3 · WhatsApp link previews (OG functions)
**Owner** A · **Branch** `feat/a2-3-og-previews` · **Tool** Antigravity or Cursor · **Est** 2.5 h · **Needs** A1.6, B1.7, A2.1
```
TASK A2.3 — Per-item Open Graph tags for /p/:id and /b/:slug via Cloudflare Pages Functions (DECISIONS D19). TypeScript is allowed in functions/.
Read: docs/kit/snippets/functions/p/[id].ts and b/[slug].ts (starting point), docs/kit/08_Setup_Deployment_Ops.md (Pages Functions), supabase/migrations/20260925000001_init_schema.sql and 20260925000003_rls_policies.sql (what anon can read).
1. functions/p/[id].ts and functions/b/[slug].ts: fetch the approved product/business with the public anon key over the REST API using context.env.SUPABASE_URL / SUPABASE_ANON_KEY (no supabase-js; plain fetch with ?select=… limited to name, price_paise, description, cover image, business name/slug). Then `const res = await context.env.ASSETS.fetch(new URL('/', context.request.url))` and use HTMLRewriter to replace <title> and inject og:title, og:description (e.g. "₹350 · Sweet Crumbs, Bandra West"), og:image (absolute URL), og:url (context.env.SITE_URL + path), og:type, twitter:card=summary_large_image. On not found or any error, return the unmodified index.html (never a 500 — the SPA shows its own not-found state).
2. Response header Cache-Control: public, max-age=300.
3. Validate the id/slug format before fetching (uuid for products; kebab slug for businesses).
4. Add a short docs/build/og-testing.md: how to test with curl and WhatsApp.
Plan first.
```
**Verify:**
```bash
curl -s -A "WhatsApp/2.23.20" https://<preview>/p/<seeded-uuid> | grep -E "og:(title|image|description)"
```
shows the product's tags · the page still boots in a browser · send the link to yourself on WhatsApp (Android and iPhone): a card with the image, name and price appears. WhatsApp caches previews per URL — to re-test after a change, append `?v=2`, `?v=3`. If the picsum JPEGs preview but real uploads (WebP) later don't, apply D18 (JPEG cover) in A4.2.
**Commit:** `feat(a2.3): WhatsApp/OG link previews for products and businesses`

## A2.4 · Error mapping → toasts
**Owner** A · **Branch** `feat/a2-4-errors` · **Tool** Cursor · **Est** 1 h · **Needs** A1.5
```
TASK A2.4 — Consistent error handling for queries and mutations.
1. src/app/providers.jsx: QueryCache and MutationCache onError → if the error is an AppError with code 'network' show toast "You're offline — check your connection"; 'rate_limited' → "Too many requests, try again in a minute"; 'auth_required' → do nothing (the login gate handles it); 'forbidden' → "You don't have access to that"; 'unknown' → "Something went wrong". Queries that render ErrorState should set meta: { silent: true } to skip the toast.
2. src/lib/errors.js: `userMessage(error)` returning the same strings, used by ErrorState.
3. Tests for userMessage.
Plan first.
```
**Commit:** `feat(a2.4): error toasts and user-facing messages`

## M1 · Milestone 1 demo and invoice
Both, 1 h. Script: `docs/build/07_QA_AND_SIGNOFF.md` §4. Messages: `08` §4. After the call, record her confirmations of the decisions list in PROGRESS.
