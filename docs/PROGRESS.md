# PROGRESS — living log (newest entry on top)

Every AI session starts by reading **Now** and ends by adding a **Log** entry. When a tool runs out of quota mid-task, write the entry anyway (or ask the tool to) so the next tool or person can continue.

## Now
- Week: 1 (28 Sep – 2 Oct 2026) · Milestone 1 target: end of Week 2
- Data source on preview: `mock`
- Last green commit on main: `f234296` (B1.3 follow-up — Notification offer branch + selectedOffer cleanup)
- In progress: `B1.4` on branch `feat/b1-4-contract` (`87ffc51`) — contract + mock adapter + format helpers committed; not yet PR'd / merged
- Next task: open PR for B1.4 (A reviews against CONTRACT.md / S9), then `B1.5` (providers + catalog query hooks) or finish `A1.2`
- Blocked: —
- Waiting on client: accounts-request message (docs/build/08_CLIENT_COMMS.md §3) — sent 27 Sep for GitHub + Supabase org; Cloudflare, Resend, and domain access still to be requested · decisions list (docs/build/08_CLIENT_COMMS.md §2) not yet sent
- Unavailable evenings this week: —

## Log

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
  - Working tree was already committed as `87ffc51` (`feat(b1.4): …`) — do not re-add the same files as a `wip:` commit
  - PROGRESS.md "Now"/log update in this session is uncommitted until you decide to amend or add a docs commit
  - Legacy Home still uses old services; empty fashion row can still happen until taxonomy is wired through queries/pages

### 2026-09-29 · B1.3 follow-up · daiwang · Cursor
- Done:
  - Compared local Cursor B1.3 tree vs merged PR #3 (`ba93136`); kept merged main as source of truth
  - Removed leftover Notification offer branch that merged B1.3 had only redirected (`setPage("offers")` → `"home"`): deleted mock `offers` array, type `"offer"` notifications, `handleOffer`, offer tap/label branch, and `setSelectedOffer` prop
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
