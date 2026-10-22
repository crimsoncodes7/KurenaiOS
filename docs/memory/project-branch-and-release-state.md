---
name: project-branch-and-release-state
description: "Which git branch is live, what is deployed, what is unpushed — check git before trusting this; it was true on 2026-10-20"
metadata:
  node_type: memory
  type: project
  originSessionId: 2e2dc728-9366-4708-9ad8-6718d38edac2
  modified: 2026-10-20T16:16:29.892Z
---

On 2026-10-20, `main` was fast-forwarded to `feat/money-goals` and pushed for the Money and Goals release, so `main` is now the line. `claude/roadmap-code-study-space` is still at `771e967`: it is behind `main` and has nothing of its own.

The production site (https://kurenai-os.pages.dev) is the release `fbea5d5`: FSRS, sw `kos-fsrs-1`, immutable https://a6e211c9.kurenai-os.pages.dev. On the same day `main` was fast-forwarded to `feat/fsrs`. Before it came `084a628` (Money and Goals, sw `kos-money-1`). The release was deployed from the worktree `.claude/worktrees/money-goals`, which needed a copy of the gitignored `js/env.local.js` from the main checkout.

The main checkout's LOCAL `main` ref was not moved (it belongs to that checkout). Run `git pull` there before working.

**Why:** releases are direct Cloudflare uploads (`tools/deploy_pages.sh`), and a git push does not deploy.

**How to apply:**
- Start every session with `git fetch`, `git status -sb` and `git log --oneline -5`.
- Branch new work from `main`.
- Commit and push freely, but deploy only when the user says go ([[act-without-asking]]).

Related: [[money-goals]], [[code-study-space]], [[japanese-study-space]], [[two-account-workflow]].


2026-10-21: main fast-forwarded to feat/exams-hub; release 3b39ae1 (Exams & Deadlines hub, phases 1–6 with CS Paper 2), sw kos-exams-1, https://e94eede7.kurenai-os.pages.dev.
2026-10-22: main fast-forwarded to feat/ipad; release 87f9437, sw kos-ipad-1, https://3191f2e6.kurenai-os.pages.dev — see [[after-fsrs-branch]].
