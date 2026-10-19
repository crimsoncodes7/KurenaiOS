---
name: two-account-workflow
description: The user works on this project from two Claude accounts (the second is a Pro account added 2026-10-19 for more usage); how memory and state are shared so either can continue
metadata:
  type: user
---

From 2026-10-19 the user works on KurenaiOS from two Claude accounts, because weekly usage limits had paused content work. Either account must be able to continue cold, so shared state lives in the repo, not in one account's private memory.

**Why:** auto-memory is per account/machine config dir (`~/.claude/projects/<path>/memory`); only git is common to both.

**How to apply:**
- The canonical shared copy of this memory is `docs/memory/` in the repo; `docs/HANDOFF.md` explains the protocol and `tools/sync_memory.sh` moves files between the repo copy and the local auto-memory dir (`status`, `pull`, `push`).
- At session start: read `docs/HANDOFF.md`, run `tools/sync_memory.sh status`, pull if the repo is newer.
- When you save or change a memory, run `tools/sync_memory.sh push` and tell the user it is ready to commit (stage by name). Never commit or push without being asked.
- Keep scratch needed across turns in the repo, not `/tmp` (see [[code-study-space]]). Related: [[project-branch-and-release-state]].
