---
name: git-stage-by-name
description: Never git commit -a or git add -A in this repo; stage by name, and leave Live2D art, .claude/ files and untracked prototypes alone
metadata:
  type: feedback
---

The working tree normally carries changes that must never be committed: Live2D art under `art-source/assistant/live2d/`, `.claude/launch.json`, `.claude/settings.local.json`, and untracked scratch (`prompt.md`, `media_budget_planner.html`, `prototypes/code-space/`).

**Why:** Live2D material is licence-gated (CLAUDE.md "Live2D development gate"), and the others are the user's local work.

**How to apply:** `git add <exact paths>`, then check `git diff --cached --stat` before committing. Commit messages are scoped (`feat(code): …`, `docs: …`). After a release a separate `docs: baseline at <hash> (kos-code-N)` commit updates CLAUDE.md/PROGRESS.md/README. Related: [[maths-notes-depth-rewrite]].
