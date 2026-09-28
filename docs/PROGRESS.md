# PROGRESS — living log (newest entry on top)

Every AI session starts by reading **Now** and ends by adding a **Log** entry. When a tool runs out of quota mid-task, write the entry anyway (or ask the tool to) so the next tool or person can continue.

## Now
- Week: 1 (28 Sep – 2 Oct 2026) · Milestone 1 target: end of Week 2
- Data source on preview: `mock`
- Last green commit on main: `b69c05e` (PR #3 — B1.3 remove Phase-2 screens)
- In progress: —
- Next task: `A1.2` (finish copy `supabase/` into repo + save `docs/kit/rpc-signatures.txt`) or `B1.4`
- Blocked: —
- Waiting on client: accounts-request message (docs/build/08_CLIENT_COMMS.md §3) — sent 27 Sep for GitHub + Supabase org; Cloudflare, Resend, and domain access still to be requested · decisions list (docs/build/08_CLIENT_COMMS.md §2) not yet sent
- Unavailable evenings this week: —

## Log

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
  - `Notification.jsx` internal mock offer payload kept for Week 5 notification rewrite
- Next step (exact): finish A1.2 or proceed to B1.4 (Build mock/supabase seam & queries folder)
- Gotchas for the next person: none
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
