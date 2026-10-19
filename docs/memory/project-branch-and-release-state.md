---
name: project-branch-and-release-state
description: Which git branch is live, what is deployed, what is unpushed — check git before trusting this; it was true on 2026-10-19
metadata:
  type: project
---

On 2026-10-19 the live line of work is branch `claude/roadmap-code-study-space`. It holds every release since the Reports work and was fast-forwarded into `main` on 2026-10-19, so the two are identical (both pushed; an earlier note that main was 49 behind came from a stale local main — always `git fetch` first). The production site (https://kurenai-os.pages.dev) is deployed from it: last release `ff7a8e3` (Code capstone 3, sw `kos-code-18`, immutable https://6c888d02.kurenai-os.pages.dev). The 12 commits after it (the Japanese plan + slice, last `bc75349`) and the docs commit `fdd02bd` are pushed.

**Why:** the user ran releases as direct Cloudflare uploads from this branch and never merged to main; a git push does not deploy.

**How to apply:** start every session with `git status -sb` and `git log --oneline -5`, and run `git fetch` first, then work from `main` or `claude/roadmap-code-study-space` (identical on 2026-10-19). Merge, push and deploy only when the user asks. Related: [[code-study-space]], [[japanese-study-space]], [[two-account-workflow]].
