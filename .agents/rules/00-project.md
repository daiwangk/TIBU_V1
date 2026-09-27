---
trigger: always_on
description: Tibu project rules — always apply
---

# Always follow /AGENTS.md

Read `AGENTS.md` at the repository root before planning any task and follow it exactly. If you cannot see it, say so and ask me to attach it.

The rules you must never break (summary of AGENTS.md):
1. JavaScript only in `src/` (no TypeScript, no shadcn, no new Vite project). New dependencies need my OK.
2. Data flow: page → `src/queries/*` hook → `src/services/index.js` → adapter. Pages never import `services/mock`, `services/supabase` or the Supabase client.
3. Match `docs/CONTRACT.md` exactly. `price` is integer rupees; the DB uses `price_paise`.
4. Seller phone/WhatsApp only via `revealContact()` after login.
5. Routes: `/p/:productId`, `/b/:slug`, `/category/:slug`; entities load from the URL.
6. Legacy files (root `src/*.jsx`, `src/legacy/**`, `src/contexts/**`, old `*Service.js`) are replaced and deleted, never restyled or extended.
7. Tailwind with theme tokens; no `style={{}}` in new folders; lucide icons; 4 states on every data view.
8. Plan first, minimal diff, run `npm run check`, append to `docs/PROGRESS.md`.
9. Never touch production, never expose secret keys, never edit pushed migrations.
10. Phase 2 features are out of scope (see AGENTS.md §7).
