# Tibu — pull-request description

Don't change code. Write the PR description for the current branch using `.github/pull_request_template.md` exactly.

Use: the task ID and title (from the branch name and `docs/build/prompts/`), `git diff main --stat`, the latest `docs/PROGRESS.md` entry, and the task's Verify list. In "How to verify", list the steps my partner should do by hand at 390px (and on a phone if the task says so). Mention anything left out and why.

Output it as Markdown I can paste into GitHub.
