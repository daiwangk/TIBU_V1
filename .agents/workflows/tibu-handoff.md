---
description: End the session: write the PROGRESS entry and tell me if the branch is safe to commit
---

# Tibu — handoff (end of session or quota running out)

Stop coding now. Do these four things:

1. Run `git status` and `git diff --stat` and paste them.
2. Append an entry to `docs/PROGRESS.md` using its template: date · task ID · who (ask me if you don't know) · tool + model; what is done; files; how it was verified; what is NOT done and why; the exact next step; gotchas for the next person.
3. Update the "Now" section: last green commit on main, in progress, next task, blocked, waiting on client.
4. Tell me whether this branch is safe to commit as a normal commit, safe only as `wip:`, or should be reverted — and why.
