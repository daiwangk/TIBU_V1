# 05 · Frontend Architecture

## 1. Decision: fresh scaffold, port screens

The audit (`sources/CODEBASE_AUDIT.md`) shows no router, ~95% inline styles, ten cloned category pages and 1,800-line files. We create a **new Vite + TypeScript project** and port each screen using the old app as the visual reference. The old repo stays read-only in `legacy/` (or a separate branch) until Phase 1 ships.

Tell the client up front: Milestone 1 = "stabilized frontend foundation, all audit bugs resolved or eliminated, UI refined" (see §8 for the bug-by-bug mapping).

## 2. Stack

| Concern | Library | Why |
|---|---|---|
| Build | Vite 8 + `@vitejs/plugin-react` | already used |
| Language | TypeScript (strict) | generated DB types; AI agents make fewer mistakes |
| Routing | React Router 7 (data router, `createBrowserRouter`) | real URLs, deep links, back button, route guards |
| Server state | TanStack Query 5 | caching, loading/error states, invalidation |
| Client state | Zustand | auth session, location, login-gate pending action |
| Styling | Tailwind CSS 4 + shadcn/ui | design tokens, accessible primitives |
| Forms | react-hook-form + zod + `@hookform/resolvers` | seller onboarding, product form |
| Icons | lucide-react | consistent icon set (replace emoji UI) |
| Map picker | react-leaflet + OSM tiles | seller location pin |
| Images | browser-image-compression | shrink before upload |
| Toasts | sonner (via shadcn) | |
| Errors | @sentry/react | |
| PWA (optional) | vite-plugin-pwa | "Add to home screen", offline shell |

## 3. Folder structure

```
src/
  main.tsx                 # QueryClientProvider, RouterProvider, Toaster
  router.tsx               # all routes + guards
  styles/globals.css       # Tailwind + CSS variables (tokens)
  lib/                     # supabase.ts, format.ts, whatsapp.ts, instagram.ts, geo.ts, image-upload.ts, utils.ts
  types/database.ts        # GENERATED — do not edit
  api/                     # plain async functions per domain
    catalog.ts  business.ts  product.ts  reviews.ts  me.ts  saved.ts
    enquiries.ts  notifications.ts  seller.ts  admin.ts
    hooks/                 # useBusinesses, useProduct, useRevealContact, …
  stores/                  # auth.ts, location.ts, loginGate.ts
  components/
    ui/                    # shadcn generated
    layout/                # AppShell, BottomNav, TopBar, PageHeader, SellerShell, AdminShell
    cards/                 # ProductCard, BusinessCard, ProductRow, SkeletonCard
    contact/               # ContactButtons, LoginSheet, EnquirySheet
    common/                # Rating, Price, Distance, EmptyState, ErrorState, ImageGallery, ReelEmbed, SaveButton
    forms/                 # ImageUploader, LocationPicker, CategorySelect, PhoneInput
  features/
    home/HomePage.tsx
    search/SearchPage.tsx, FiltersSheet.tsx
    category/CategoryPage.tsx          # ONE page replaces 10 clones
    business/BusinessPage.tsx, tabs/{Products,Videos,Reviews}Tab.tsx, WriteReviewSheet.tsx
    product/ProductPage.tsx
    auth/{Login,Signup,ForgotPassword,ResetPassword,AuthCallback}Page.tsx
    profile/{Profile,EditProfile,Saved,RecentlyViewed,Connected}Page.tsx
    enquiries/{EnquiryList,EnquiryThread}Page.tsx
    notifications/NotificationsPage.tsx
    seller/{SellerHome,Onboarding(steps/*),EditBusiness,Products,ProductForm,Videos,Enquiries,Reviews}Page.tsx
    admin/{AdminApplications,AdminBusinessDetail}Page.tsx
    legal/{Privacy,Terms}Page.tsx
    NotFoundPage.tsx
```

## 4. Routes

| Path | Page | Access | Bottom nav |
|---|---|---|---|
| `/` | Home | public | ✅ |
| `/search?q=&cat=&tab=&sort=&min=&max=&radius=` | Search | public | ✅ |
| `/category/:slug` | Category | public | ✅ |
| `/b/:slug` | Business | public | ❌ (sticky contact bar instead) |
| `/p/:id` | Product | public | ❌ (sticky contact bar) |
| `/login`, `/signup`, `/forgot-password`, `/auth/reset`, `/auth/callback` | Auth | guest | ❌ |
| `/profile` | Profile hub | login | ✅ |
| `/profile/edit`, `/saved`, `/recent`, `/connected` | | login (recent also guest) | ✅ |
| `/enquiries`, `/enquiries/:id` | Customer inbox | login | ✅ / ❌ |
| `/notifications` | Inbox | login | ✅ |
| `/sell` | Seller landing / signup CTA | public | ✅ |
| `/seller` | Seller home (status, stats, checklist) | seller | seller nav |
| `/seller/onboarding/:step` | Onboarding wizard | seller | ❌ |
| `/seller/business`, `/seller/products`, `/seller/products/new`, `/seller/products/:id`, `/seller/videos`, `/seller/enquiries(/:id)`, `/seller/reviews` | | seller | seller nav |
| `/admin`, `/admin/b/:id` | Admin | admin | ❌ |
| `/privacy`, `/terms` | Legal | public | ❌ |
| `*` | 404 | | |

Guards are loader/wrapper components: `RequireAuth`, `RequireRole('seller'|'admin')`. They redirect to `/login?next=<path>`. This is UX only; RLS enforces access.

## 5. Design system

Tokens in `globals.css` as CSS variables, mapped into Tailwind's theme:

```css
:root {
  --brand: 314 57% 22%;        /* #5A1848 from the prototype */
  --brand-foreground: 0 0% 100%;
  --accent: 330 70% 85%;       /* soft pink used in gradients */
  --background: 30 33% 98%;
  --foreground: 314 30% 12%;
  --muted: 30 20% 94%;
  --radius: 0.875rem;
  --font-sans: "Inter", system-ui, sans-serif;
  --font-display: "Fraunces", Georgia, serif;   /* headings; confirm with client brand */
}
```

Rules:
- **No inline `style={{}}`** except truly dynamic values (e.g. image aspect ratio).
- Mobile-first, max content width 480px centered on desktop (SOW: desktop redesign is Phase 2) — but grids must not break at 1024px+.
- Touch targets ≥ 44px. Bottom nav respects `env(safe-area-inset-bottom)`.
- Every data view has 4 states: loading skeleton, empty, error (retry), data.
- Images: `loading="lazy"`, fixed aspect ratio boxes to avoid layout shift, `alt` text.
- Prices via `formatPrice()`, distances via `formatDistance()` only.

## 6. State

| State | Where |
|---|---|
| Anything from the DB | TanStack Query |
| Session / user / role | `stores/auth.ts` (Zustand) fed by `onAuthStateChange` |
| Current location `{lat,lng,label,source}` | `stores/location.ts`, persisted to localStorage |
| Pending contact action after login | `stores/loginGate.ts` `{ type:'whatsapp'|'call'|'enquiry'|'save'|'review', payload }` |
| Search filters | URL query params (shareable, back-button safe) |
| Guest recently viewed | localStorage `tibu.recent` (max 20), merged via `track_view` on login |

## 7. Key components (contracts)

- `ContactButtons({ business, product? })` — Call + WhatsApp. On tap: `reveal_contact` → login sheet on `login_required` → resume → `location.href` link.
- `LoginSheet` — bottom sheet with email/password + "create account"; on success calls `loginGate.resume()`.
- `EnquirySheet({ business, product? })` — textarea (1–2000 chars), sends via `send_enquiry`, success toast + link to thread.
- `SaveButton({ type, id })` — optimistic toggle; guests → login sheet.
- `ReelEmbed({ shortcode })` — lazy iframe, 9:16, fallback link.
- `LocationPicker({ value, onChange })` — Leaflet map, "use my location", draggable marker, returns `{lat,lng}`. Include OSM attribution.
- `ImageUploader({ kind, businessId, productId?, max })` — compress → upload → returns `{path,url}`; progress + remove.
- `ProductCard / BusinessCard` — accept API row types directly; show distance if present.

## 8. Audit bug → resolution map (for Milestone 1 sign-off)

| Audit bug (§5) | Resolution in new build |
|---|---|
| Undefined `selectedSellerProduct` (ReferenceError) | Eliminated: route `/seller/products/:id` loads by id |
| Missing seller sub-routes (blank pages) | Implemented as real routes: products/new, videos, enquiries, reviews |
| WhatsApp/Call unusable (no phone data) | `business_contacts` + `reveal_contact` RPC |
| Fashion price/distance filters broken (string compare) | Server-side numeric filters on `price_paise` / `distance_m` |
| Handmade price filter uses nonexistent field | Same — one `SearchPage`/`CategoryPage` filter implementation |
| Splash imports wrong path / missing logo | Splash removed; brand shown in AppShell; assets in `/public` |
| Seller registration not connected to dashboard | Onboarding writes to DB; dashboard reads the seller's own business |
| Crochet missing from search | Search is a DB query across all categories |
| Discover heart / Reel actions no-op | Discover feed is Phase 2 → removed; Business Videos tab has working embeds |
| OfferDetails buttons dead; Notification vs Offers mismatch | Offers not in Phase 1 → removed; notifications come from DB |
| `profileStats.addresses` always 0 | Stats computed from real data; address book not in SOW → removed |
| console.log in Saved | ESLint `no-console` (warn) + CI lint |
| Bottom nav on all screens | Nav shown per-route (table §4) |
| `sellerMode` dead prop | Role comes from auth store |
| ID casing inconsistency / export ≠ filename | uuid PKs, lowercase slugs; static data deleted |
| Horizontal overflow / Arial hardcoding | Tailwind layout + tokens + brand fonts |
| Unused vulnerable `react-router-dom` | Current React Router actually used; `npm audit` clean in CI |

## 9. Code quality gates

- ESLint (typescript-eslint, react-hooks) + Prettier; `npm run lint && npm run typecheck && npm run build` must pass before merge.
- GitHub Action on PR runs the above.
- No file > 300 lines without a reason; split components.
- PR template: screenshots (mobile), which audit/SOW item it closes, RLS impact yes/no.
