# AGENTS.md — Tibu project rules (read fully before every task)

Tibu is a mobile-first discovery marketplace for homegrown local businesses in India (prices in ₹).
This repo delivers Phase 1 (MVP) as scoped in `docs/Tibu_SoW_Phase1_Final.pdf`. A two-person, part-time team builds it with AI help. You are helping one of them.

## 1. Stack (don't change it without a decision recorded in docs/DECISIONS.md)
- React 19 + Vite 8. **JavaScript** (`.jsx`/`.js`) with JSDoc comments. No TypeScript in `src/`. No shadcn/ui.
- react-router-dom 7 · @tanstack/react-query · zustand · @supabase/supabase-js · Tailwind CSS v4 (tokens in `src/styles/theme.css`) · lucide-react · sonner (toasts) · vitest.
- Backend: Supabase (Postgres + PostGIS, Auth, Storage, pg_cron). The SQL in `supabase/migrations/` is the source of truth.
- Hosting: Cloudflare Pages. Link-preview functions live in `functions/` (TypeScript is allowed there, nowhere else).
- Adding any dependency requires my explicit OK in your plan.

## 2. Documents
- `docs/CONTRACT.md` — every data shape and service function. Your code MUST match it. If you think it's wrong, stop and say so.
- `docs/DECISIONS.md` — locked decisions (D1…). Follow them.
- `docs/PROGRESS.md` — current state. Read the "Now" section at the start of a session; append an entry at the end.
- `docs/kit/04_API_and_Data_Access.md`, `docs/kit/06_Feature_Specs.md` — behaviour and acceptance criteria.
- `supabase/migrations/*.sql` — exact table, column, RPC and bucket names. If a doc disagrees with the SQL, the SQL wins; tell me.
- `design/mockups/*.png` and `.agents/rules/design-system.md` — visual reference.
- **SUPERSEDED — never follow:** `docs/kit/07_Roadmap_and_Steps.md` Week 0–1 task lists, `docs/kit/10_Prompt_Pack*`, the kit README "Quick start", or any instruction to create a new Vite project, add TypeScript, or add shadcn.

## 3. Architecture rules
1. Data flow is always: page/component → hook in `src/queries/` → function exported by `src/services/index.js` → adapter (`src/services/mock/` or `src/services/supabase/`). Pages and components never import an adapter, the Supabase client, or mock data. CI enforces this.
2. Service functions return contract shapes (camelCase). Only adapter files know database column names.
3. Money: `price` is an **integer number of rupees** everywhere in the UI and contract. The DB stores `price_paise`. Convert only in `src/services/supabase/mappers.js`. Display with `formatPrice()` from `src/lib/format.js` (→ "₹1,250").
4. Seller phone and WhatsApp numbers come **only** from `revealContact()` after login. Never add phone fields to public shapes. Never select `business_contacts` in catalog queries.
5. URLs: product `/p/:productId`, business `/b/:slug`, category `/category/:slug`. Pages load their entity from the URL (`useParams`), never from `location.state`.
6. Category slugs are exactly the slugs in `supabase/migrations/*_seed_categories.sql` (listed in CONTRACT §2).
7. Server data lives in TanStack Query (query keys from `src/queries/keys.js`, params inside the key). Client state lives in zustand stores in `src/stores/`. Don't create React contexts for server data.

## 4. Legacy code — the strangler rule
- Legacy = the `.jsx` files directly in `src/`, everything in `src/legacy/`, `src/hooks/useAsync.js`, `src/hooks/useSetPage.js`, `src/contexts/`, the old `src/services/*Service.js` files, `src/services/mock/normalize.js`, and `LegacyPage` in `src/App.jsx`.
- Do not refactor, restyle, lint-fix or extend legacy files. To replace a screen: build it new under `src/pages/`, point the route at it, then delete the legacy file(s) in the same task and remove them from `scripts/legacy-allowlist.json`.
- The only exception is a legacy fix that the task explicitly asks for.

## 5. Code rules
- New code goes in lowercase folders only: `src/app/`, `src/pages/<area>/`, `src/components/`, `src/components/ui/`, `src/queries/`, `src/stores/`, `src/lib/`, `src/services/`.
- Components are PascalCase `.jsx`, one per file, under 250 lines. Hooks are `useX.js`.
- Styling: Tailwind classes built on the theme tokens (`bg-bg`, `bg-surface`, `bg-primary`, `text-primary-fg`, `text-ink`, `text-body`, `text-muted`, `bg-lavender`, `bg-blush`, `bg-lime`, `bg-mint`, `border-border`, `rounded-card`, `rounded-card-lg`, `rounded-btn`, `font-heading`, `font-body`, `px-screen`). No `style={{}}` in the new folders (CI fails). Mobile-first; above 640px the app sits in the centred 480px column from AppShell.
- Icons: lucide-react only. No emoji as UI icons or product images — use `ImagePlaceholder`.
- Every data view handles 4 states: loading (skeleton), empty (`EmptyState`), error (`ErrorState` with retry), data.
- Accessibility: real `<button>`/`<a>` elements, `aria-label` on icon buttons, touch targets ≥ 44px, `alt` on images, visible focus rings.
- Prices via `formatPrice`, distances via `formatDistance`. No `console.log` in committed code. No file-level `/* eslint-disable */` (CI fails); if you must, disable one rule on one line with a reason.

## 6. Security
- Never put a service-role or secret key in `src/`, in any `VITE_*` variable, or in a chat. The only browser variables are `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE_URL`, `VITE_DATA_SOURCE`.
- Never edit a migration that has been pushed. DB changes are one new migration file, with RLS enabled and policies in the same file, each policy explained in plain English in your reply.
- Never run commands against production. The seed script runs against dev only.

## 7. Scope
- Phase 2 — do NOT build: cart, checkout, payments, UPI/QR, offers/coupons, a Discover/reels feed, saved reels, real-time chat/typing/presence/read receipts, advanced analytics, a desktop redesign, an address book.
- Must keep even if a mockup lacks it: Call + WhatsApp buttons on Product and Business pages; a pre-filled WhatsApp message containing the product name, price and its `/p/` link; guests browse freely but contacting requires login; enquiries are non-real-time.

## 8. How to work (every task)
1. Read the task, `docs/PROGRESS.md` ("Now"), and the files the task lists. Reply with a **PLAN**: files to create / modify / delete, dependencies to add, questions. Wait for my OK.
2. Implement only the approved plan. Minimal diff. No drive-by refactors or renames.
3. Run `npm run check` (guards + lint + tests + build) and fix until it's green. Paste the last lines of the output.
4. UI tasks only: open the page at 390×844, check all 4 states, compare once with the matching mockup and fix obvious gaps (spacing, radius, colour, type). Skip this for non-UI tasks.
5. Finish with: what you did, files changed, how I can verify it by hand, what you left out and why. Append an entry to `docs/PROGRESS.md` using its template.

If something is unclear, ask. If a task conflicts with these rules, stop and tell me instead of working around it.
