# Tibu — review a branch

Review the diff of the current branch against main (`git diff main`) as a strict senior reviewer. **Do not edit code.**

Check, one by one:
1. `AGENTS.md` §3 architecture rules: page → `src/queries` → `src/services/index.js` → adapter; price is integer rupees in the UI (paise only in `src/services/supabase/mappers.js`); phones only via `revealContact()`; URLs `/p/:productId`, `/b/:slug`, `/category/:slug` loaded from the URL; slugs from the seed; server data in TanStack Query.
2. `docs/CONTRACT.md` (check its version line): any field not in the contract, any shape mismatch, `??` vs `||` on booleans that can be `false`.
3. Legacy rule: replaced legacy files deleted and removed from `scripts/legacy-allowlist.json`; no legacy file restyled or extended.
4. UI: loading / empty / error / data states; `aria-label` on icon buttons; touch targets ≥ 44px; no inline styles; lucide icons only; nothing breaks at 360px.
5. Security: secrets; phone exposure; anything that trusts the client to enforce access instead of RLS; storage paths must start with the business id (CONTRACT §13).
6. SOW Rev2 (`docs/Tibu_SoW_Phase1_Rev2.md`): anything Phase 2 sneaking in; anything Rev2 requires that this task should have covered.
7. Files changed that the task didn't need.

Output three lists — **MUST FIX**, **SHOULD FIX**, **NICE TO HAVE** — each item with `file:line` and a one-line reason.
