---
name: max-three-agents
description: At most 3 agents at once (ceiling 5); on Fable spawn NO reviewer agents — review inline or ask the user to run reviewers on Opus
metadata:
  node_type: memory
  type: feedback
  originSessionId: 083a292e-9158-4ad4-8d86-0c9b8abd3917
  modified: 2026-11-13T17:23:40.232Z
---

Run at most 3 agents/auditors concurrently in any workflow (hard ceiling 5), even when ultracode or "exhaustive" is on.

**On Fable, spawn no reviewer agents at all.** Do the review inline in the main session, or tell the user to switch reviewers to Opus first and let them decide. (My interpretation: this covers any fan-out of subagents while the session model is Fable, not only reviewers.)

**Why:** on 7–8 Nov 2026 a 17-agent Gemini-review workflow used 2.6 M tokens and hit the weekly limit; earlier 19 parallel auditors burned the usage window. The user said "never again run anything more than 5 auditors in a row at max. Reasonably we should be sticking to 3." On 13–14 Nov 2026, three Fable review agents for the RC5 re-review hit the 5-hour limit twice within seconds of starting (and again when resumed), producing nothing. The user said: "Don't use any reviewers at all it drains the 5 hour limits in seconds on fable, clearly. Either do it yourself, or tell me to use opus for reviewers."

**How to apply:** batch workflows in groups of 3 (pipeline with ≤3 items in flight, or sequential batches); prefer inline checks for mechanical work. Before any Agent or Workflow call, check the session model: if it is Fable, do not spawn — review inline, or ask. Never resume agents that died on a rate limit without asking. Related: [[quality-audit-2026-11]].
