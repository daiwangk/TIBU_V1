# 00 · Verified status of the repo (27 Sep 2026)

Source: `TIBU_V1-main` at commit `444aa7d`, built with Node 22 on Ubuntu (same case-sensitive filesystem as GitHub Actions and Cloudflare), then run headless in Chromium at 390×844.

## 1. Blocking problems

| # | Problem | Evidence | Fixed by |
|---|---|---|---|
| 1 | Build fails on Linux: `src/App.jsx` imports `./pages/NotFound`, folder is `src/Pages/` | `npm run build` → `UNRESOLVED_IMPORT './pages/NotFound'` | patch 0001 (B1.1) |
| 2 | Every route white-screens: `ReferenceError: womenFashionProducts is not defined` (module-level spreads in `Home.jsx`; one broken module kills the app because `App.jsx` imports every page up front) | 12/12 routes blank in Chromium | patch 0001 |
| 3 | After #2, Home still crashes: `Cannot read properties of undefined (reading 'businessName')` — category filters return nothing, then `x[0].businessName` | see §2 | patch 0001 (guards) + B1.4 (taxonomy) |
| 4 | `Fashion.jsx` and `Handmade.jsx` use `fashionProducts` / `handmadeProducts` that are never defined | ESLint `no-undef` | patch 0001 |
| 5 | `/viewall/businesses` and `/viewall/reels` crash: pages expect props `businesses`/`reels`/`title`, `LegacyPage` passes `viewAllBusinesses`/`viewAllReels`/… | `Cannot read properties of undefined` | patch 0001 (defaults); pages deleted in B2.4 |
| 6 | Entity pages ignore their URL: `Product.jsx` and `Business.jsx` read only `location.state`; the `setPage` shim navigates without the state it just set | `/product/view` renders only "← Back" | B1.7, B1.8 (`/p/:id`, `/b/:slug`) |

With patches 0001 + 0002 applied, all 37 routes in `App.jsx` render with zero runtime errors, `npm run lint` has 0 errors, and `node scripts/check-guards.mjs` passes.

## 2. The category taxonomy is four different lists

| Where | Resin | Women's fashion | Men's fashion |
|---|---|---|---|
| `services/categoryService.js` | `resin` | `women-fashion` | `men-fashion` |
| `normalize.js` businesses (`"Resin Art"` → lower + first space) | `resin-art` | `women's-fashion` | `men's-fashion` |
| `normalize.js` products (`page` field) | `resin` | `womenfashion` | `menfashion` |
| Dev-kit DB seed (`0006_seed_categories.sql`) | `resin-art` | `womens-fashion` | `mens-fashion` |

Plus call-site typos in `Home.jsx`: `'candle'`, `'desert'`, `'rein'`, `'fahion'`. **Decision D6:** the DB seed slugs are the only slugs (CONTRACT §2).

## 3. Hidden and structural problems

| # | Problem | Why it matters | Fixed by |
|---|---|---|---|
| 7 | 9 files start with a blanket `/* eslint-disable */` (bulk-inserted by `scratch/disable_lint.cjs`). `npx eslint --no-inline-config src` shows **38 errors** (10 `no-undef`, 22 `no-unused-vars`, 2 `no-dupe-keys`, …) | This is what hid the crash | CI guard + allowlist (B1.2); files deleted as screens are rebuilt |
| 8 | `src/Components/` and `src/Pages/` would collide with new lowercase `src/components/`, `src/pages/` — the same folder on Windows/macOS, two folders on Linux | Silent merge locally, broken CI build | patch 0002 moves legacy to `src/legacy/`; guard checks case collisions |
| 9 | Mock businesses get `lat/lng` from `Math.random()` and every item's `createdAt` is "now" | Distances change on every reload; "newest" means nothing | B1.4 (deterministic fixtures) |
| 10 | `useAsync` takes no inputs, so it never refetches when params change | `/p/1` → `/p/2` in place would keep showing product 1 | B1.5 (TanStack Query, params in keys) |
| 11 | The public `Business` shape carries `phone`/`whatsapp` (`9876543210`), and WhatsApp links are built without the `91` country code | Defeats the RLS design; links don't open the right chat | CONTRACT §1 rule 4; `lib/whatsapp.js` (A1.3); `revealContact` (A3.2) |
| 12 | `listProducts(filters)` expects an object; `Home.jsx` passes strings; `listBusinesses(key)` expects a string — two signatures. `.sort()` mutates the shared array | Wrong products per section; order changes between renders | Replaced by the contract (B1.4) |
| 13 | 1,176 `style={{` blocks vs 2 `className=` in `src/`; Tailwind installed but unused | Restyling legacy would swallow the timeline | Strangler rule: rebuild, don't restyle |
| 14 | `SellerRegister.jsx` still fakes OTP `1234` via `alert()`; registration leads to a hardcoded seller | Not a real flow | B4.2 |
| 15 | `.agents/rules/design-system.md` has two stacked frontmatter blocks | Antigravity may not load the rule | fixed copy in `repo-files/` |
| 16 | No `supabase/` folder, no `@supabase/supabase-js`, no `.env` handling | Backend has never touched this repo | A1.2, A1.5 |
| 17 | Zero auth and admin code (`grep -ri "admin\|password" src` → nothing) | Both are greenfield | Weeks 3–4 |

## 4. Good news

- `npm audit --omit=dev` → **0 vulnerabilities** (the audit's 6 high/1 moderate are gone).
- The router, AppShell (centred 480px column), BottomNav (per-route hiding) and theme tokens are sound and are kept.
- The services seam exists, so swapping mock for Supabase is a contained change.
- The mock data is rich enough to build every public screen before real data exists.

## 5. Kit corrections found while checking

- Kit prompt A-2.3 stores the login-gate pending action in `sessionStorage`. The email-confirmation link opens a new tab, where `sessionStorage` is empty, so the action is lost. Use `localStorage` with a 30-minute expiry (D11).
- Kit docs 07 (Week 0–1) and 10 (prompt pack) assume a fresh TypeScript + shadcn project. Pasting them into this repo would scaffold TypeScript into a JavaScript app. They are superseded (D23).

## 6. Reproduce

```bash
npm ci
npm run build                                   # finding 1
npx eslint --no-inline-config src | tail -3     # finding 7
grep -rln "^/\* eslint-disable \*/" src         # the 9 files
grep -c "style={{" src/*.jsx | awk -F: '{s+=$2} END {print s}'
```
