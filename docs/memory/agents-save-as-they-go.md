---
name: agents-save-as-they-go
description: "Every agent must commit and push work-in-progress as it goes, because the usage limit can stop it at any moment"
metadata:
  node_type: memory
  type: feedback
  originSessionId: fe87dd3a-94c9-4c98-af54-e757b41b5c6c
  modified: 2026-11-19T07:02:56.754Z
---

Any agent (subagent, workflow agent, session) must be run on the assumption that the usage limit can stop it mid-task. It saves as it works: commit + push a WIP commit on its own feature branch after EACH finding/step and before any long test run; never more than one step's work uncommitted. Every agent brief says this explicitly, and states the branch to push to.

**Why:** 18–19 Nov 2026 three W7 agents hit the 5-hour limit and a session restart; their edits sat uncommitted in worktrees, one worktree was auto-removed with nothing saved, and the agents could not be resumed (no transcript), so their work had to be re-briefed twice. The user: "You've reset them twice now and lost it… They must save while they do stuff."

**How to apply:** put the save rule in every agent prompt (WIP commits, push after each item, before long runs); prefer an explicit branch/worktree path over auto-removed isolation worktrees; when an agent stops, check its branch/worktree before re-briefing, and re-brief from saved commits. Run full gates one at a time (SMOKE_JOBS=3 when agents share the machine). Related: [[max-three-agents]], [[sonnet-for-simple-agents]].
