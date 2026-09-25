# Tibu Frontend — Production-Readiness Audit

**Date:** 20 September 2026  
**Codebase path:** `tibu frontend/tibu frontend/` (nested project root containing `package.json`)  
**Stack:** React 19 + Vite 8 (JavaScript/JSX)  
**Purpose:** Scope input for a client Statement of Work  

**Overall verdict:** This is a large, polished **client-side UI demo / prototype**, not a production marketplace. Customer browsing against hardcoded Mumbai-local data is relatively complete. There is **no backend**, **no auth**, **no admin**, **no real location**, and **no real media**. Several seller routes crash or blank out. Wiring a real API will require schema decisions first because product/business/offer/review shapes are inconsistent across the app.

---

## 1. Tech Stack & Dependencies

### 1.1 Declared dependencies (`package.json`)

| Package | Declared version | Lockfile resolved | Role |
|---------|------------------|-------------------|------|
| `react` | `^19.2.7` | `19.2.7` | UI library |
| `react-dom` | `^19.2.7` | `19.2.7` | DOM renderer |
| `react-router-dom` | `^7.18.1` | `7.18.1` | **Declared but unused** (see routing) |

### 1.2 Dev dependencies

| Package | Declared version | Lockfile resolved | Role |
|---------|------------------|-------------------|------|
| `vite` | `^8.1.1` | `8.1.2` | Build / dev server |
| `@vitejs/plugin-react` | `^6.0.3` | `6.0.3` | React Fast Refresh (Oxc) |
| `eslint` | `^10.6.0` | (via lock) | Linting |
| `@eslint/js` | `^10.0.1` | (via lock) | ESLint recommended |
| `eslint-plugin-react-hooks` | `^7.1.1` | (via lock) | Hooks rules |
| `eslint-plugin-react-refresh` | `^0.5.3` | (via lock) | Vite HMR lint |
| `globals` | `^17.7.0` | (via lock) | ESLint globals |
| `@types/react` | `^19.2.17` | (via lock) | Types (JS project; unused for typecheck) |
| `@types/react-dom` | `^19.2.3` | (via lock) | Types |

**Project metadata:** `name: "tibu"`, `version: "0.0.0"`, `private: true`, `"type": "module"`.

**Scripts:** `dev` (vite), `build`, `lint`, `preview`. No test script. No CI config found.

**Install state note:** At audit time, `npm ls` reported **UNMET DEPENDENCY** for all packages and `node_modules` was missing from the project folder. A lockfile exists; a clean `npm install` is required before build/run. Treat this as an environment/setup risk for handoff.

### 1.3 Outdated / deprecated / vulnerable packages

`npm audit` (against lockfile) reported **7 vulnerabilities (1 moderate, 6 high)**:

| Issue | Severity | Package | Notes |
|-------|----------|---------|-------|
| React Router RSC CSRF bypass | **high** | `react-router` / `react-router-dom` `7.12.0–7.18.1` | Package is **unused in source**; still a dependency risk if left installed. Fix: upgrade or **remove** the unused dep. |
| brace-expansion DoS | **high** | `brace-expansion` (transitive) | Dev/build toolchain |
| browserslist unbounded memory / crash | **high** | `browserslist` (transitive) | Dev/build toolchain |
| nanoid infinite loop | **high** | `nanoid` (transitive) | Dev/build toolchain |
| PostCSS source map path issues | **high** | `postcss` (transitive) | Dev/build toolchain |
| baseline-browser-mapping DoS | **moderate** | `baseline-browser-mapping` | Dev/build toolchain |

None of these are classic “API key leaked” production runtime vulns in app code — the bigger issue is **an unused vulnerable router package** and an unpatched lockfile. `npm audit fix` claims fixes are available.

**Deprecated packages:** None of the direct deps are known-deprecated. Stack choices (React 19, Vite 8) are current as of audit date. React 19.3.0 / react-router-dom 7.18.4 appear as newer wanted versions when resolved.

**Not present (and typically needed for production):** state library, HTTP client (`fetch` wrapper / axios), form library, UI kit, map/geolocation SDK, image upload SDK, analytics, error monitoring, auth SDK, PWA tooling, testing libraries.

### 1.4 Build tool config

**File:** `vite.config.js`

```js
export default defineConfig({
  plugins: [react()],
})
```

- No path aliases (`@/` etc.)
- No env prefix customization
- No proxy to a backend
- No build optimizations / chunk splitting config
- No PWA / SSR

**Env handling:** No `.env`, `.env.example`, or `import.meta.env` usage anywhere in `src/`. Config (cities, OTP demo code, copy) is hardcoded in components.

**Entry:** `index.html` → `src/main.jsx` → `App.jsx`. Global CSS: `src/index.css` (mostly Vite template defaults). `App.css` is unused by the app shell.

### 1.5 Routing setup

**Declared:** `react-router-dom@^7.18.1`  
**Actual:** **Zero imports** of React Router in `src/`. Navigation is a giant string state machine in `App.jsx`:

```js
const [page, setPage] = useState("home");
// then: {page === "home" && <Home .../>} {page === "search" && <Search .../>} ...
```

**Implications:** no URL deep-links, no browser back/forward, no shareable product/business URLs, no route guards. Bottom tab bar is always rendered outside page conditionals.

---

## 2. Architecture & Code Structure

### 2.1 Folder tree (major nodes)

```
tibu frontend/                 # workspace wrapper
└── tibu frontend/             # real Vite app
    ├── public/                # favicon.svg, icons.svg
    ├── src/
    │   ├── assets/            # hero.png, vite/react SVGs (no logo.png)
    │   ├── Components/        # ProductCard, BusinessCard, ReelCard, Banner, SearchBar
    │   ├── Data/              # 29 static JS data modules (products/businesses/reels)
    │   ├── Pages/             # Splash (orphaned), Notification
    │   ├── Style/             # splash.css only (orphaned path mismatch)
    │   ├── App.jsx            # God-component: all routing + global state
    │   ├── main.jsx
    │   ├── Home.jsx           # customer home feed
    │   ├── Search.jsx, Discover.jsx, Saved.jsx, Profile.jsx, ...
    │   ├── *Fashion/Crochet/… # one near-duplicate page per category
    │   ├── SellerRegister.jsx, SellerDashboard.jsx, SellerProductDetail.jsx
    │   └── Product.jsx, Business.jsx, Reel.jsx, Offers.jsx, …
    ├── package.json
    ├── vite.config.js
    └── eslint.config.js
```

| Path | One-line note |
|------|----------------|
| `src/App.jsx` | Central router + all shared state; ~670 lines of conditional page mounts + bottom nav |
| `src/Components/` | Presentational cards + filter SearchBar; almost entirely inline styles |
| `src/Data/` | Entire marketplace catalog as static JS arrays |
| `src/Pages/` | Only Notification + unused Splash |
| `src/Style/` | Orphan splash stylesheet |
| Category `*.jsx` pages | Copy-pasted hubs (Desserts, Candles, …) with near-identical structure |
| Seller `*.jsx` | Large multi-tab dashboard + multi-step register demo |

### 2.2 State management

**Approach:** Local `useState` only — lifted almost entirely into `App.jsx`, then prop-drilled.

**No** Redux, Zustand, Context, React Query, or URL state.

**Held in `App.jsx`:** `page`, `sellerMode`, `searchText`, `selectedProduct/Business/Reel`, `currentReels`, view-all payloads/titles, `previousPage`, `profile`, `filters`, `savedProducts/Businesses/Reels`, `addresses`, `selectedOffer`, `availableTodayCategory`.

**Consistency:** Same pattern everywhere, but inconsistent prop completeness (e.g. Discover receives `savedReels` props it never uses). No persistence — refresh wipes saves, profile edits, addresses, seller form progress.

### 2.3 Routing & page structure

Pages are string IDs switched in `App.jsx`. Category pages hardcode `page: "desserts"` etc. on product objects for back-navigation. `previousPage` is manually threaded for some flows.

### 2.4 Anti-patterns

**Prop drilling:** Severe. Category pages take 10–15 setter props. `App.jsx` repeats nearly identical prop blocks for every category.

**Giant components (>300 lines):**

| File | ~Lines |
|------|--------|
| `src/SellerDashboard.jsx` | **1826** |
| `src/Home.jsx` | **1134** |
| `src/SellerRegister.jsx` | **1001** |
| `src/Business.jsx` | **820** |
| `src/MenFashion.jsx` | **608** |
| `src/Crochet.jsx` | **607** |
| `src/SellerProductDetail.jsx` | **606** |
| `src/Candles.jsx` | **604** |
| `src/Embroidery.jsx` | **603** |
| `src/Jewellery.jsx` | **601** |
| `src/Resin.jsx` | **590** |
| `src/App.jsx` | **588** |
| `src/Gifts.jsx` | **585** |
| `src/Profile.jsx` | **584** |
| `src/WomenFashion.jsx` | **583** |
| `src/Desserts.jsx` | **581** |
| `src/Product.jsx` | **424** |
| `src/Search.jsx` | **341** |
| `src/Handmade.jsx` | **324** |
| `src/AddAddress.jsx` | **324** |
| `src/Components/SearchBar.jsx` | **312** |
| `src/Fashion.jsx` | **310** |

**Duplicated logic:** Category pages (Desserts/Candles/Crochet/…) are near clones. Category chip arrays duplicated ~11 times. Product aggregation (`allProducts` spreads) reimplemented in Home, Search, Saved, Product, Discover.

**Inline styles mixed with CSS:** App UI is ~95% inline `style={{...}}`. CSS files are Vite boilerplate (`index.css`, unused `App.css`) plus orphaned splash CSS. Fonts often hardcode `"Arial"` — conflicts with any future brand typography system.

**Dead / unused code:**

| Item | Issue |
|------|--------|
| `react-router-dom` | Installed, never imported |
| `Pages/Splash.jsx` | Never mounted; wrong CSS path; missing `logo.png` |
| `Style/splash.css` | Orphaned (`Splash` imports `../styles/splash.css`) |
| `App.css` | Not imported by app shell |
| `sellerMode` / `setSellerMode` | Set from dashboard, passed to Product, unused in Product |
| `crochetProducts` import in Search | Imported but omitted from `allProducts` |
| `OfferDetails.jsx` | Used by Offers; contact buttons dead (not orphaned) |

**Other structural issues:**

- Nested folder name `tibu frontend/tibu frontend` is confusing for deploy/CI.
- No TypeScript despite `@types/*` present.
- No shared design tokens / theme module (colors like `#5A1848` repeated everywhere).
- Products have **no stable numeric `id`** in catalog Data (identity is often `name` + `businessId`); seller products use numeric `id` — collision risk when unifying.

---

## 3. Static / Local Data Inventory

> This section is exhaustive by shape. Counts are approximate. All marketplace content is local JS — there are **no API calls**.

### 3.1 `src/Data/` — catalog modules

#### Shape P1 — Catalog product (no circular `products`)

**Used by:** `crochetProducts`, `giftsProducts`, `menFashionProducts`, `resinProducts`, `womenFashionProducts` (+ aggregates that spread them).

```ts
{
  name: string,                 // "Cotton Kurti"
  businessId: string,           // "style-studio"
  seller: string,               // "Style Studio"  // MISSING on womenFashionProducts[5]
  price: string,                // "₹899"  (NOT a number)
  rating: string,               // "4.9"
  distance: string,             // "2 km" | "900 m"
  emoji: string,                // "👗"  (acts as image)
  about: string,
  location: string,             // "Bandra, Mumbai"
  delivery: string,             // "Seller Delivery Available"
  pickup: string,               // "Pickup Available"
  businessReviews: string,      // "320 Reviews"  (includes word "Reviews")
  businessEmoji: string,
  businessName: string,
  color1: string,               // "#F4A8C8" gradient stop
  color2: string,
  availableToday: boolean,
  page: string                  // app page id e.g. "womenfashion"
}
```

#### Shape P2 — Catalog product + circular self-array

**Used by:** `candleProducts`, `dessertProducts`, `embroideryProducts`, `jewelleryProducts`.

Same as P1, plus after module init:

```ts
products: Product[]  // === the entire category array (circular reference)
```

| File | Export | Represents | Count | Shape | `page` |
|------|--------|------------|-------|-------|--------|
| `candleProducts.js` | `candleProducts` | Candle products | 6 | P2 | `candles` |
| `crochetProducts.js` | `crochetProducts` | Crochet products | 6 | P1 | `crochet` |
| `dessertProducts.js` | `dessertProducts` | Dessert products | 6 | P2 | `desserts` |
| `embroideryProducts.js` | `embroideryProducts` | Embroidery products | 6 | P2 | `embroidery` |
| `giftsProducts.js` | `giftsProducts` | Gift products | 6 | P1 | `gifts` |
| `jewelleryProducts.js` | `jewelleryProducts` | Jewellery products | 6 | P2 | `jewellery` |
| `menFashionProducts.js` | `menFashionProducts` | Men's fashion | 6 | P1 | `menfashion` |
| `resinProducts.js` | `resinProducts` | Resin art | 6 | P1 | `resin` |
| `womenFashionProducts.js` | `womenFashionProducts` | Women's fashion | 6 | P1 | `womenfashion` |
| `fashionProducts.js` | `fashionProducts` | women + men aggregate | 12 | P1 | mixed |
| `handmadeProducts.js` | `handmadeProducts` | crochet+embroidery+resin+candle | 24 | **mixed P1/P2** | mixed |

**Inconsistencies:** `seller` missing on one women fashion item; `handmadeProducts` only some items carry circular `products`; **no `id` field**; **no phone/WhatsApp fields**.

#### Shape B1 — Business record

```ts
{
  id: string,                   // "sweet-crumbs" | "Whisk-Wonders" (casing inconsistent)
  businessName: string,
  businessEmoji: string,
  category: string,             // "Desserts" | "Candles" | "Resin Art" | ...
  rating: string,               // "4.9"
  businessReviews: string,      // "320"  (NO " Reviews" suffix — unlike products)
  location: string,
  about: string,
  delivery: string,
  pickup: string,
  products: Product[],          // filtered from category products
  reels: ReelNested[],          // see R-short vs R-full
  reviews: ReviewNested[]
}
```

**Nested reel R-short** (most business files):

```ts
{ business: string, caption: string, emoji: string }
```

**Nested reel R-full** (`resinBusinesses`, `womenFashionBusinesses` via filter from reel files):

```ts
{
  id: number,
  businessId: string,
  business: string,
  caption: string,
  emoji: string,
  area: string,
  color: string,
  distance: string
}
```

**Nested review (Data businesses):**

```ts
{ name: string, rating: string /* "⭐⭐⭐⭐⭐" */, review: string }
```

| File | Export | Category | Count | Nested reels | Review notes |
|------|--------|----------|-------|--------------|--------------|
| `candleBusinesses.js` | `candleBusinesses` | Candles | 6 | R-short | present |
| `crochetBusinesses.js` | `crochetBusinesses` | Crochet | 6 | R-short | present |
| `dessertBusinesses.js` | `dessertBusinesses` | Desserts | 6 | R-short | present |
| `embroideryBusinesses.js` | `embroideryBusinesses` | Embroidery | 6 | R-short | present |
| `giftsBusinesses.js` | **`giftBusinesses`** (name ≠ filename) | Gifts | 4 | R-short | present |
| `jewelleryBusinesses.js` | `jewelleryBusinesses` | Jewellery | 3 | R-short | present |
| `menFashionBusinesses.js` | `menFashionBusinesses` | Men's Fashion | 3 | R-short | present |
| `resinBusinesses.js` | `resinBusinesses` | Resin Art | 6 | **R-full** (some empty) | present |
| `womenFashionBusinesses.js` | `womenFashionBusinesses` | Women's Fashion | 3 | **R-full** | **`reviews: []` always** |

**Open question:** Is `businessId` casing intentional (`sweet-crumbs` vs `Whisk-Wonders`)? Backend should normalize.

#### Shape R-full — Standalone reels (`*Reels.js`)

```ts
{
  id: number,
  businessId: string,
  business: string,
  caption: string,
  emoji: string,
  area: string,        // "Bandra"
  color: string,       // background hex
  distance: string     // "2.3 km"
}
```

| File | Count |
|------|-------|
| `candleReels.js` | 4 |
| `crochetReels.js` | 6 |
| `dessertReels.js` | 6 |
| `embroideryReels.js` | 6 |
| `giftsReels.js` | 4 |
| `jewelleryReels.js` | 4 |
| `menFashionReels.js` | 4 |
| `resinReels.js` | 4 |
| `womenFashionReels.js` | 4 |

**Rough totals:** ~54 products, ~43 businesses, ~42 reels (non-aggregate).

---

### 3.2 Hardcoded data outside `Data/`

#### `App.jsx` — defaults

**Profile (~L50–57):**
```ts
{
  fullName: string,      // "Laiba Merchant"
  username: string,      // "laiba"
  phone: string,         // ""
  avatar: string,        // "👩"
  avatarUrl: null | string,
  avatarFile: null | File
}
```

**Filters (~L63–67):**
```ts
{ category: "All", distance: "Anywhere", price: "All" }
```

**profileStats (~L71–79):**
```ts
{ saved: number /* computed */, reviews: 0 /* hardcoded */, addresses: 0 /* hardcoded even when addresses exist */ }
```

**Addresses seed (~L80–93):**
```ts
{ id: number, label: string /* Home|Work */, address: string, selected: boolean }
```

#### `Offers.jsx` (~L35–63) — 2 offers

```ts
{
  id: number,
  businessId: string,    // "pearl-bloom" | "gift-studio"
  business: string,
  title: string,
  discount: string,      // "15% OFF" | "₹100 OFF"
  description: string,
  code: string,
  validTill: string
}
```

#### `Pages/Notification.jsx`

**Inline offers (~L33–53)** — **different from Offers.jsx** (no `businessId`; different business names `"ABC Bakery"`, `"Handmade by Sara"`):

```ts
{ id, business, title, discount, description, code, validTill }
```

**Notifications (~L57–117)** — 6 items, two subtypes:

```ts
// type: "business"
{ id, type: "business", icon, title, message, time, businessId }

// type: "offer"
{ id, type: "offer", icon, title, message, time, offerId }
```

#### `SellerDashboard.jsx` — seller mock (distinct domain)

**Seller (~L16–30):**
```ts
{
  businessName, category, city, locality, phone, whatsapp, description,
  deliveryAvailable: boolean, pickupAvailable: boolean,
  deliveryCharge: string,   // "₹50"
  logo: string,             // emoji
  bannerEmoji: string
}
```

**Seller products Shape S1 (~L38–141)** — **not the same as P1/P2:**

```ts
{
  id: number,
  name: string,
  price: number,            // numeric, not "₹99"
  category: string,
  stockStatus: string,      // "In Stock" | "Made to Order"
  availableToday: boolean,
  views: number,
  saves: number,
  rating: number,           // numeric
  distance: string,
  emoji: string,
  color1: string, color2: string,
  businessName: string,
  businessPhone: string     // present here; absent on catalog products
}
```

**Posts (~L147–172):**
```ts
{ id, caption, views, saves, emoji, business }
```

**Reviews (~L178–200)** — distinct from Data reviews:

```ts
{ name, rating: number /* 4|5 */, review, date: string, product: string }
```

#### `SellerRegister.jsx` option lists

- `mumbaiLocalities`: `string[]` (~27 + `"Other"`)
- `categories`: `["Desserts","Fashion","Jewellery","Crochet","Handmade","Gifts"]`
- `radiusOptions`: `["1","2","3","5","7","10","15","20"]` (km as strings)
- Default city: `"Mumbai"`
- Demo OTP: `"1234"` (hardcoded)

#### `Search.jsx`

- `recent`: `string[]` seed search history  
- `trending`: `string[]`  
- `categories`: `{ label: string, page: string }[]`  
- `allProducts`: spread of Data arrays (**omits crochetProducts despite import**)

#### `Home.jsx`

- Aggregated product/business arrays from Data  
- `categories`: `{ name, icon, color, page }[]` — **different chip shape than category pages**  
- Fallback address display: `"Mumbai, Maharashtra"`

#### Category switcher chips (duplicated)

```ts
{ name: string, emoji: string, page: string }[]
```

Present in Desserts, Fashion, Handmade, Jewellery, Crochet, Gifts, Candles, Embroidery, Resin, WomenFashion, MenFashion.

#### Fashion / Handmade explore tiles

```ts
{ emoji, title, subtitle, page }[]
```

#### `Gifts.jsx` / `ProductsViewAll.jsx` string chips

```ts
string[] // e.g. ["All","Desserts","Fashion",...]
```

#### `Components/SearchBar.jsx` filter option lists

- Categories: `["All","Desserts","Handmade","Fashion","Jewellery","Crochet","Gifts"]`
- Distance: `["Within 2 km","Within 5 km","Within 10 km","Within 15 km","Anywhere"]`
- Price: `["All","Under ₹250","₹250–500","₹500–1000","₹1000+"]`

**Mismatch:** Fashion/Handmade/Resin filter code references different price labels (`Under ₹500`, `₹500–₹1000`, `Above ₹1000`) that SearchBar never emits.

#### `AddAddress.jsx`

**Places mock:**
```ts
{ name: string, address: string }[]  // 3 items
```

**Label options:** `["Home","Work","Other"]`  
**Created address:** `{ id: Date.now(), label, address, selected: true }`

#### Notification preferences / Help / static pages

- `NotificationPreferences.jsx`: boolean toggles only (local)  
- `HelpFeedback.jsx`: free-text message (local submit flag)  
- `AboutTibu.jsx`, `TermsConditions.jsx`, `PrivacySecurity.jsx`: static copy strings

### 3.3 Persistence

**No `localStorage`, `sessionStorage`, cookies, or IndexedDB.** All state is in-memory React state.

### 3.4 Media model

| Pattern | Where |
|---------|-------|
| Emoji as product/business/reel image | All Data + cards |
| Gradient via `color1`/`color2` | Product cards / detail |
| Optional `avatarUrl` blob | EditProfile upload preview |
| `hero.png` | Present in assets; **not referenced by main app pages** |
| `logo.png` | **Referenced by Splash, file missing** |

There are **no product image URLs, no video URLs for reels**, and no upload pipeline beyond local File preview alerts saying “connect to backend later”.

### 3.5 Entity model open questions (schema-critical)

1. **Is a “listing” a Product, a Business, or both?** UI treats them as separate entities, but Product embeds many business fields (`businessName`, `businessEmoji`, `delivery`, `pickup`, `location`) — denormalized for the demo.
2. **Are reels first-class media posts or business attachments?** Both: standalone `*Reels.js` and nested `business.reels` with different shapes.
3. **Price as string with `₹` vs number** — seller vs customer catalogs disagree.
4. **Reviews** use star-emoji strings in customer Data vs numeric in seller dashboard; women fashion businesses have empty reviews.
5. **Offers** duplicated with conflicting content between Notification and Offers screens.
6. **Categories** taxonomy is inconsistent (Home has Desserts/Fashion/Handmade/…; Handmade expands to crochet/resin/candles/embroidery; SearchBar category list differs from SellerRegister categories).

---

## 4. Existing Features vs Planned Features

### 4.1 What exists and works (demo-level)

| Feature / page | Status |
|----------------|--------|
| Home feed with categories, carousels, filters UI, save | Works against static data |
| Category hubs (desserts, jewellery, crochet, resin, candles, embroidery, women/men fashion, gifts) | Works |
| Product detail (save, view business) | Works for browsing |
| Business profile tabs (products / reels / reviews display) | Works for display |
| Search text + category chips navigation | Mostly works |
| Saved tab (products / businesses / reels) | Works in-memory |
| Edit profile (name, username, phone, avatar emoji/file preview) | Works locally |
| Addresses list + add address (mock places) | Works locally |
| Products / businesses / reels “View all” | Works |
| Profile settings nav to About / Terms / Privacy / Help / Notification prefs | Screens render |
| Seller register multi-step UI | Renders; demo OTP |
| Seller dashboard multi-tab UI | Renders with mock data |

### 4.2 Partial / placeholder / broken

| Feature | Issue |
|---------|-------|
| Fashion / Handmade filter bars | Distance/price logic broken |
| Global search product pool | Crochet omitted from `allProducts` |
| WhatsApp / Call on Product & Business | Code present; catalog data has no phones → always “not available” |
| Offer detail contact buttons | No `onClick` |
| Discover save heart | Noop; props from App unused |
| Reel viewer WhatsApp / View Shop / heart | No handlers |
| Notifications | Static; offer payload mismatches Offers page |
| Notification preferences | Local toggles only |
| Help & Feedback | Local “submitted” only |
| Profile logout | Only `setPage("home")` |
| Profile stats reviews/addresses | Hardcoded `0` |
| Seller register → dashboard | Registration data **not** applied; dashboard shows hardcoded “Sweet Crumbs” |
| Seller add product / video / posts / reviews routes | `setPage` targets **do not exist** → blank screen |
| Seller product detail page | Undefined state vars → would crash |
| Seller edit actions | `alert(...)` placeholders |
| Splash screen | Orphaned / broken imports |
| Real images / reel video | Emoji placeholders |
| Auth | None |

### 4.3 Planned feature cross-reference

| Planned feature | Status | Evidence |
|-----------------|--------|----------|
| Customer browsing & discovery | **Fully built** (static demo) | Home, categories, Discover, Product, Business |
| Seller/vendor profile & listing management | **Partially built** | Register + Dashboard UI; CRUD routes missing; data not persisted |
| Admin panel | **Not started** | No admin pages/components |
| Location/radius-based search | **Partially built** | Static distance strings + UI filters; seller radius form-only; no GPS/maps |
| Categories, search & filters | **Partially built** | Works on Home/Search with caveats; Fashion/Handmade broken; taxonomy inconsistent |
| Images/media handling | **Partially built** | Emoji/gradients; avatar File preview; no CDN/upload API |
| Offers / promotional banners | **Partially built** | Hardcoded offers + Banner component; contact incomplete; data duplicated |
| Wishlist/save | **Fully built** (in-memory only) | Three save arrays in App |
| Reviews & ratings | **Partially built** | Display-only static reviews; no create/edit; profile reviews stuck at 0 |
| WhatsApp/call integration | **Partially built** | `wa.me` / `tel:` wired; missing phone fields on catalog → non-functional for customers |
| Notifications | **Partially built** | Static inbox + preference toggles; no push/realtime |

---

## 5. Bugs & Broken Functionality

### 5.1 Blocking (breaks core or seller flows)

| Bug | Location | Detail |
|-----|----------|--------|
| Undefined `selectedSellerProduct` | `App.jsx` ~L587–592 | Used without `useState` → **ReferenceError** if `page === "sellerproduct"` |
| Missing seller sub-routes | `SellerDashboard.jsx` ~527, ~1407, ~1417, ~1645, ~1746 | `setPage("selleraddproduct"|"selleraddvideo"|"sellerposts"|"sellerreviews")` — **not handled in App** → blank content (bottom nav still shows) |
| Catalog WhatsApp/Call unusable | `Product.jsx` ~304–336; `Business.jsx` ~285–324; Data modules | Requires `businessPhone`; **absent on all catalog products/businesses** |
| Fashion price/distance filters broken | `Fashion.jsx` ~L22–37 | Compares string price `"₹899"` to numbers; distance exact-matches filter labels like `"Within 2 km"` against values like `"2 km"` |
| Handmade price filter broken | `Handmade.jsx` ~L26–37 | Uses nonexistent `shop.priceValue` |
| Splash broken if ever mounted | `Pages/Splash.jsx` L1–2 | Imports `../styles/splash.css` (folder is `Style/`) and missing `../assets/logo.png` |
| Seller registration not connected | `SellerRegister.jsx` → `SellerDashboard.jsx` | Success navigates to dashboard with unrelated hardcoded seller |

### 5.2 Cosmetic / minor / incomplete

| Bug | Location | Detail |
|-----|----------|--------|
| Crochet missing from Search results | `Search.jsx` L8 vs L50–56 | Imported, not spread |
| Discover heart noop | `Discover.jsx` ~93–111 | Does not use `setSavedReels` |
| Reel actions noop | `Reel.jsx` ~50–145 | Heart / WhatsApp / View Shop |
| OfferDetails contact buttons | `OfferDetails.jsx` ~257–280 | No handlers |
| Notification vs Offers data mismatch | both files | Same offer ids, different businesses/copy; Notification offers lack `businessId` |
| `profileStats.addresses` always 0 | `App.jsx` ~71–78 | Ignores `addresses.length` |
| Leftover console.log | `Saved.jsx` ~L54 | Debug log in production path |
| Bottom nav on all screens | `App.jsx` ~594–665 | Overlaps seller flows / full-screen reels; Discover height risks content under nav |
| `sellerMode` unused | Product flow | Dead prop |
| ID casing inconsistency | Data business ids | `sweet-crumbs` vs `Whisk-Wonders` |
| Export name ≠ filename | `giftsBusinesses.js` → `giftBusinesses` | Easy import mistake |
| Horizontal overflow risk | ProductCard `minWidth: 260px` etc. | Relies on scroll parents; no responsive card sizing |
| Arial hardcoding | Many pages | Brand/typography debt |

---

## 6. Responsiveness & UI

### 6.1 Breakpoint coverage

**App pages have essentially no responsive CSS.** The only `@media` rules live in unused/boilerplate `index.css` / `App.css` (Vite template at `max-width: 1024px` + dark color scheme). **No mobile/tablet breakpoints in product UI.**

### 6.2 Observed layout risks (from code)

| Issue | Files / pattern |
|-------|-----------------|
| Heavy padding (`padding: "40px"`) on small screens | Profile, Search, Offers, EditProfile, Addresses |
| Fixed bottom nav always on | `App.jsx` — no safe-area / hide-on-detail logic |
| Discover full-viewport cards vs bottom nav | `Discover.jsx` `100vh` / `minHeight: 92vh` without reliable bottom inset |
| Splash mock device frame | `Style/splash.css` fixed `390×844` (irrelevant while orphaned) |
| Cards assume phone carousel widths | `minWidth` 169–260px; desktop becomes sparse horizontal strips, not a real desktop layout |
| Touch targets | Icon buttons ~38px in bottom nav (borderline); many emoji hearts depend on hit area of small buttons |
| No tablet-specific layouts | — |
| Desktop | App is a phone UI stretched to full width — not a multi-column marketplace desktop |

### 6.3 CSS organization

**Ad hoc inline styles dominate.** No CSS Modules, no Tailwind, no shared component library styles. A proper responsive pass is **hard** because every layout constant is duplicated inside JSX across 20+ giant files — estimate requires either (a) a design-system extraction first, or (b) a painful file-by-file media-query retrofit.

**Effort to do a proper responsive pass:** **Large** (see §9).

---

## 7. What's Needed to Wire Up a Backend

### 7.1 Concrete API endpoints (suggested)

Based on static inventory — method / rough path / purpose:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/categories` | Category taxonomy (resolve Home vs Search vs Seller lists) |
| `GET` | `/products` | List/filter products (`q`, `category`, `priceMin/Max`, `lat/lng`, `radiusKm`, `availableToday`, `businessId`) |
| `GET` | `/products/:id` | Product detail (needs real IDs) |
| `GET` | `/businesses` | List/filter businesses |
| `GET` | `/businesses/:id` | Business profile + nested products/reels/reviews summary |
| `GET` | `/reels` | Discover feed |
| `GET` | `/reels/:id` | Single reel |
| `GET` | `/offers` | Active offers |
| `GET` | `/offers/:id` | Offer detail |
| `GET` | `/notifications` | User notification inbox |
| `PATCH` | `/notifications/:id/read` | Mark read (UI implies this later) |
| `GET/PUT` | `/me` | Customer profile |
| `POST` | `/me/avatar` | Avatar upload |
| `GET/POST/PATCH/DELETE` | `/me/addresses` | Address book |
| `GET/POST/DELETE` | `/me/saved/products` | Wishlist products |
| `GET/POST/DELETE` | `/me/saved/businesses` | Saved businesses |
| `GET/POST/DELETE` | `/me/saved/reels` | Saved reels |
| `POST` | `/auth/otp/request` | Phone OTP (customer + seller) |
| `POST` | `/auth/otp/verify` | Verify OTP / issue session |
| `POST` | `/auth/logout` | Logout |
| `POST` | `/sellers/register` | Seller onboarding (maps SellerRegister fields) |
| `GET/PATCH` | `/sellers/me` | Seller profile |
| `POST` | `/sellers/me/logo` / `/banner` | Media uploads |
| `GET/POST/PATCH/DELETE` | `/sellers/me/products` | Listing CRUD |
| `GET/POST/PATCH/DELETE` | `/sellers/me/reels` or `/posts` | Reel/post CRUD |
| `GET` | `/sellers/me/reviews` | Incoming reviews |
| `GET` | `/sellers/me/analytics` | Views/saves (dashboard metrics) |
| `POST` | `/businesses/:id/reviews` | Create review (not in UI yet but profile implies) |
| `GET/PUT` | `/me/notification-preferences` | Pref toggles |
| `POST` | `/support/feedback` | Help & Feedback |
| `GET` | `/geo/places` or Places API proxy | Address search (replaces AddAddress mock) |
| `GET` | `/config` | Localities, radius options, category enums |

**Admin (not started — future):** CRUD for users, listings, offers, reports, category management.

### 7.2 Schema decisions required before coding APIs

1. **Normalize Product vs Business** — stop embedding full business copy on every product; keep `businessId` FK + join/API expand.
2. **Stable IDs** — replace name-based identity; fix casing (`Whisk-Wonders`).
3. **Price as integer paise/rupees** — stop `"₹899"` strings in API; format in UI.
4. **Distance** — compute from lat/lng at query time; do not store `"2 km"` as source of truth.
5. **Unify reel shape** — one Reel entity; drop R-short vs R-full split.
6. **Unify review shape** — numeric 1–5 + optional productId; render stars in UI.
7. **Phone fields** — `phone`, `whatsapp` on Business (required for contact CTAs).
8. **Media** — image/video URLs (and upload); emoji can remain as fallback icon only.
9. **Offers** — single source; Notification references `offerId` FK.
10. **Categories** — hierarchical? (Fashion → Women/Men; Handmade → Crochet/Resin/…) — UI implies hierarchy but data is flat page strings.

### 7.3 Auth-related UI that already exists

| UI | Auth implication |
|----|------------------|
| **No customer login/signup screens** | Backend auth layer is greenfield for customers |
| SellerRegister phone + WhatsApp OTP (`1234` demo) | Backend needs OTP for seller (and likely customer) phone verification |
| Profile Logout button | Needs real session clear |
| Privacy & Security static page | Policy only |
| EditProfile phone field | Profile update API |
| Hardcoded profile “Laiba Merchant” | Replace with `/me` |

---

## 8. Security & Production Readiness Flags

| Flag | Finding |
|------|---------|
| Hardcoded API keys / secrets | **None found** in source |
| Hardcoded demo credentials | OTP `"1234"` in `SellerRegister.jsx`; demo phones `9876543210` in SellerDashboard |
| `.env` setup | **Missing** — no env files, no `import.meta.env` |
| Sensitive data in localStorage | **N/A** (no persistence) — when added, avoid storing raw tokens in plaintext without deliberate design |
| Input sanitization | Minimal client checks; no XSS-focused sanitization (React text escaping helps for plain text; still need server-side validation) |
| Auth | None — any future admin/seller APIs must not trust client-only “sellerMode” |
| Dependency vulns | 6 high / 1 moderate in lockfile; unused vulnerable `react-router-dom` should be removed or upgraded |
| `node_modules` missing at audit | Deploy/dev handoff risk |
| HTTPS / CORS / CSP | Not applicable yet (static Vite SPA, no API) |
| PII | Hardcoded Mumbai addresses and phone numbers in seed data |

**Honest assessment:** Security exposure is low today because nothing is real. Production readiness is **far** from shipping — the gap is functionality and architecture, not just hardening.

---

## 9. Effort Estimate Inputs

Rough scale for SOW pricing sanity-checks (frontend-only unless noted):

| Area | Scale | One-line reason |
|------|-------|-----------------|
| Fix blocking bugs (seller routes, undefined state, WhatsApp phones, search crochet, filter logic) | **Small–Medium** | Localized fixes, but seller “missing pages” may expand into new screens |
| Remove dead deps / Splash orphan / cleanup | **Small** | Mechanical |
| Deduplicate category pages into one parameterized CategoryPage | **Medium–Large** | ~10 near-clone files; high regression surface |
| Replace static Data with API client + loading/error/empty states | **Large** | Touches almost every page; schema normalization first |
| Auth (customer login + seller OTP real) + session handling | **Large** | UI mostly missing for customer auth; seller OTP is demo-only |
| Real location / radius search (Maps + geolocation + backend geo query) | **Large** | Only string filters exist today |
| Media upload (products, reels/video, logos) | **Large** | Currently emoji-only; needs storage + UI rewrite of cards |
| Offers/notifications real-time or polled | **Medium** | UI shells exist; data model cleanup needed |
| Wishlist persistence | **Small–Medium** | UI done; needs auth + API |
| Reviews write-flow | **Medium** | Display exists; create/edit UX not built |
| Admin panel | **Large** | Not started |
| Responsive / desktop pass | **Large** | Inline styles everywhere; phone-first stretched layout |
| Design system extraction (tokens, shared layout, hide tab bar rules) | **Medium–Large** | Prerequisite to sane responsive work |
| Backend + DB to match §3 shapes | **Large** (backend SOW) | Multiple conflicting shapes; marketplace domain modeling |

---

## Appendix A — Files over 300 lines (quick list)

`SellerDashboard.jsx`, `Home.jsx`, `SellerRegister.jsx`, `Business.jsx`, `MenFashion.jsx`, `Crochet.jsx`, `SellerProductDetail.jsx`, `Candles.jsx`, `Embroidery.jsx`, `Jewellery.jsx`, `Resin.jsx`, `App.jsx`, `Gifts.jsx`, `Profile.jsx`, `WomenFashion.jsx`, `Desserts.jsx`, `Product.jsx`, `Search.jsx`, `Handmade.jsx`, `AddAddress.jsx`, `SearchBar.jsx`, `Fashion.jsx`.

## Appendix B — Open questions for the client

1. Target platforms: mobile web only, responsive web, or later React Native?
2. Should “reels” be short-form **video** (Instagram-like) or image/caption cards as currently mocked?
3. Is Tibu discovery-only (WhatsApp handoff) or will cart/checkout be in scope later? (No cart exists today.)
4. Service area: Mumbai-only forever, or multi-city? (Localities are Mumbai-hardcoded.)
5. Who creates offers — sellers, admins, or both?
6. Customer accounts required before browse, or browse-first / auth-later?

---

*End of audit.*
