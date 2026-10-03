---
description: Check the current branch before I commit: run the gate and walk the task's Verify list
---

# Tibu — verify before committing

Do not change any code in this step.

1. Run `npm run check` and paste its last 15 lines.
2. Run `git branch --show-current` and `git diff main --stat`. List every changed file and flag any that weren't in the approved plan.
3. From the branch name, find the task ID (e.g. `feat/b2-1-home` → B2.1, `chore/r1-rev2-schema` → R1). Find that task's **Verify** list in `docs/build/prompts/W*.md` or `docs/build/prompts/REV2_TASKS.md`, and the matching day in `docs/build/prompts/WEEK*_DEEP_DIVE.md`. Print the Verify items.
4. For each item: if you can check it from the terminal (grep, ls, a test, a build), do it and report pass/fail with the evidence. If it needs a browser or a phone, mark it **MANUAL** and tell me exactly what to open, what to tap, and what I should see.
5. Always also check:
   - no file under `src/` starts with a blanket `/* eslint-disable */` unless it's in `scripts/legacy-allowlist.json`
   - no `style={{` in `src/pages`, `src/components` or `src/app` (unless the line has `// allow-inline-style`)
   - no service-role / secret key names in `src/`
   - no `phone` or `whatsapp` field added to any public shape in `src/services`
   - legacy files this task replaces are deleted and removed from the allowlist

Output one table: item · how checked · result (PASS / FAIL / MANUAL).
