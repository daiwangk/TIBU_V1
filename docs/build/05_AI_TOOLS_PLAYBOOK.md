# 05 · AI tools playbook — building on free tiers

## 1. The reality of free tiers (Sep 2026)

All four free tiers are limited and change often, so the workflow assumes any tool can run dry mid-week:
- **Cursor Hobby:** limited Agent requests and limited Tab completions; Cursor doesn't publish exact numbers. Treat Agent requests as scarce.
- **Antigravity (free individual tier):** a usage quota that resets weekly, metered by how much work the agent does per prompt. Big, vague prompts burn it fastest.
- **Codex on a free ChatGPT account:** limited trial-level access.
- **Claude.ai free:** a chat with message limits and no access to your repo; you paste or attach files.

Check each tool's usage page every Monday and note in `docs/PROGRESS.md` who has quota left. Two people × four tools = eight separate quotas. Each person uses their own accounts; never share logins.

## 2. Which tool for which job

| Job | First choice | Fallback | Why |
|---|---|---|---|
| New page or feature touching 3–8 files | Antigravity (planning mode, strongest model) | Cursor Agent | Plans across files, can open the browser to check its work |
| Small change in 1–2 files, a bug fix | Cursor (inline edit `Ctrl/Cmd+K` or Agent) | Codex | Cheapest per change; Tab completion when you type it yourself |
| Mechanical moves/renames | You: `git mv` + editor search-and-replace | — | Never spend quota on this |
| Reviewing a PR / branch diff | A **different** tool from the one that wrote it (Codex or Claude) | the other person | Fresh eyes catch contract and security slips |
| SQL, RLS, migrations, "why does Supabase return this?" | Claude.ai (paste the SQL + error) | Codex | Reasoning-heavy, few files |
| Debugging from a stack trace or console error | Claude.ai or Cursor Ask mode | Codex | Paste the error + the file |
| Click-through QA at several widths | Antigravity browser agent | You, with DevTools device mode | The agent reports issues; you decide fixes |
| Writing copy, client messages | Claude.ai | — | No repo needed |

## 3. Load the rules once, check they loaded

- **Cursor** reads `AGENTS.md` and `.cursor/rules/tibu.mdc` (`alwaysApply: true`).
- **Codex** reads `AGENTS.md` natively.
- **Antigravity**: current versions read workspace rules from `.agents/rules/` (the repo already has this folder) and some versions also read `AGENTS.md`. The kit's `.agents/rules/00-project.md` is set to always-on and summarises AGENTS.md so it works either way. In Antigravity's Customizations → Rules panel, confirm both rule files are listed and active.
- **Claude.ai**: attach `AGENTS.md`, `docs/CONTRACT.md` and the relevant files every time (or keep them as project knowledge if your plan has Projects).

**Rules smoke test** (first session in each tool, and whenever behaviour looks off): paste "Without opening any files, list the five most important rules for this project." If it can't name the data-flow rule, the rupee rule and the legacy rule, the rules aren't loaded — attach `AGENTS.md` manually.

## 4. The session loop (every task)

1. **Before:** `git checkout main && git pull && git checkout -b <branch>`. Commit or stash anything open, so `git restore .` can undo an agent run cleanly.
2. **Open a new chat for each task.** Long chats drift and burn quota re-reading history.
3. **Opener:** paste the Session Opener from `prompts/00` followed by the task prompt from the week file.
4. **Plan gate:** read the plan. Reject it if it touches files not listed, adds dependencies, edits legacy files it should delete, or invents contract fields. Use the Plan Check prompt.
5. **Build:** let it implement. Don't chat mid-way unless it's going wrong.
6. **Verify yourself:** run `npm run check`, then the task's Verify list by hand at 390px. "Done" from an agent means nothing until you've checked.
7. **Handoff:** the agent appends to `docs/PROGRESS.md`. If quota runs out first, write the entry yourself (three lines is fine) and commit `wip:` to the branch.
8. **PR:** push, open the PR with the template, the other person (or another tool) reviews with the Review prompt, merge, delete the branch.

## 5. Spending quota wisely

- **Plan with the cheap, build with the strong, verify by hand.** Ask for the plan with a fast model if the tool lets you choose; switch to the strongest model to implement multi-file tasks; use fast models for one-file edits.
- **Name the files.** Every prompt lists the files to read and touch. "Look around the codebase" is the most expensive instruction there is.
- **One task, one outcome.** If a prompt contains "and also", split it.
- **Stop loops early.** Two failed attempts at the same error → stop, `git restore .`, run the Fix-one-bug prompt with the exact error, or shrink the task.
- **No screenshot loops on plumbing tasks.** Browser compare only on page UI tasks, one pass (D26).
- **Do small things yourself.** Renaming a variable, changing a colour class or fixing an import costs one agent request; it's faster by hand.

## 6. Tool notes

**Cursor.** Use *Ask* mode to understand code (no edits), *Agent* for tasks, `Ctrl/Cmd+K` for inline edits in one file. Reference files with `@path`. Turn off auto-run for terminal commands, so you approve anything that could delete files or install packages.

**Antigravity.** Use planning mode for tasks and read the plan it proposes before approving. Use the browser agent for the QA prompts in B2.5 and B5.4 (it drives Chrome at a set viewport and reports issues). Keep one agent working per branch; parallel agents on one branch create conflicting edits.

**Codex.** Good for: "review the diff of this branch against main with the Review prompt", and well-scoped single tasks. It reads AGENTS.md automatically. If you use Codex's cloud mode, it works from GitHub, so push the branch first.

**Claude.ai (chat).** No repo access. For SQL and RLS questions paste the migration section; for bugs paste the error, the file, and the relevant CONTRACT section. Ask for a diff or complete replacement file, then apply it yourself. Good for turning this kit's prompts into client-facing wording and for thinking through a tricky flow before coding it.

## 7. Git hygiene with agents

- Branch names: `fix/…`, `feat/…`, `chore/…`, prefixed with the task ID: `feat/b2-2-category-page`.
- Commit messages: `feat(b2.2): generic CategoryPage replaces 11 legacy pages`.
- Never let an agent push to `main`, force-push, or run `git reset --hard` without asking. If your GitHub plan allows branch protection on this repo, require CI on `main`.
- Review `git diff --stat` before every commit: unexpected files are the first sign of drift.
- Both people pull `main` before starting a task; rebase your branch if main moved (`git pull --rebase origin main`).

## 8. Secrets hygiene

- Never paste into any AI chat: the service-role/secret key, the database password, the Resend API key, anyone's personal passwords.
- The anon/publishable key is public by design (RLS protects data), so it can appear in `.env.local` and in chats if needed.
- `.env.local` and `.env.seed` are git-ignored. The guard script fails CI if a secret key name appears in `src/` or in a `VITE_*` variable.
- If a secret leaks (pasted into a chat, committed): rotate it in the Supabase dashboard the same day and note it in PROGRESS.

## 9. When you're stuck

1. Re-read the task's Verify list — is it actually broken, or is it an expected gap?
2. Reproduce with the smallest steps; copy the exact error (console + terminal).
3. Fix-one-bug prompt in the tool you have quota in.
4. If the fix touches the contract or the SQL, stop and discuss with your partner first.
5. If a task balloons past 2× its estimate, split it, finish the half that works, and record the rest as a new task in PROGRESS.
