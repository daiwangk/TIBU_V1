---
description: Find the root cause of one bug before changing anything
---

# Tibu — fix one bug

My message after this command describes the bug: what happens, what should happen, steps, viewport/browser, and the exact error. If any of that is missing, ask for it first.

1. Find the root cause. Explain it in 2–3 sentences with the file and line.
2. Say whether the bug is in a legacy file (root `src/*.jsx`, `src/legacy/`, `src/contexts/`, old `*Service.js`). If it is, and that file is scheduled for replacement (`docs/build/03_ARCHITECTURE_TARGET.md` §5), say so and recommend leaving it unless I insist.
3. Propose the smallest fix. Don't refactor anything else.
4. Wait for my "OK" before editing. After the fix, run `npm run check`.
