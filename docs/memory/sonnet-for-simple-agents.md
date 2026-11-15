---
name: sonnet-for-simple-agents
description: "Spawn Sonnet subagents for deterministic, well-specified tasks to save usage; keep Opus for judgement-heavy work"
metadata:
  node_type: memory
  type: feedback
  originSessionId: cfbc10b9-3e9d-4e51-9613-b7f4c14742f6
  modified: 2026-11-15T11:06:22.592Z
---

For deterministic, simple, well-specified subagent tasks (mechanical rewrites with a checker script, renames, listing/scanning, applying a clear rule file by file), spawn the agent with `model: "sonnet"` rather than inheriting Opus.

**Why:** the user's 5-hour usage limit ran out twice on 15–16 Nov 2026 while three Opus agents rewrote quiz options; they asked (16 Nov 2026) to use Sonnet where it can handle the task, so less usage is spent.

**How to apply:** default agent model choice — Sonnet when the task has a precise spec and a mechanical check (e.g. `tools/quiz_bias.mjs`, smoke tests); Opus only for design, subtle correctness (invariant 87 schedule keys, maths accuracy that needs real judgement) or review. Still at most 3 agents at once ([[max-three-agents]]).
