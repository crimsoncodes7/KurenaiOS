---
name: project-branch-and-release-state
description: Which git branch is live, what is deployed, what is unpushed — check git before trusting this; it was true on 2026-10-19
metadata:
  type: project
---

On 2026-10-19 the live line of work is branch `claude/roadmap-code-study-space`. It holds every release since the Reports work and is NOT merged into `main` (main was 49 commits behind it, 0 ahead). The production site (https://kurenai-os.pages.dev) is deployed from it: last release `ff7a8e3` (Code capstone 3, sw `kos-code-18`, immutable https://6c888d02.kurenai-os.pages.dev). 12 commits after it (the Japanese plan + slice, last `bc75349`) were local only, not pushed.

**Why:** the user ran releases as direct Cloudflare uploads from this branch and never merged to main; a git push does not deploy.

**How to apply:** start every session with `git status -sb` and `git log --oneline -5`, and check out `claude/roadmap-code-study-space` (or whatever `docs/HANDOFF.md` and PROGRESS.md say is live). Do not branch from `main` for new work without asking. Merge, push and deploy only when the user asks. Related: [[code-study-space]], [[japanese-study-space]], [[two-account-workflow]].
