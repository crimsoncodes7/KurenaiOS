---
name: max-three-agents
description: Never run more than 5 agents/auditors at once in a workflow; aim for 3
metadata:
  node_type: memory
  type: feedback
  originSessionId: 083a292e-9158-4ad4-8d86-0c9b8abd3917
  modified: 2026-11-08T08:08:42.446Z
---

Run at most 3 agents/auditors concurrently in any workflow (hard ceiling 5), even when ultracode or "exhaustive" is on.

**Why:** on 7–8 Nov 2026 a 17-agent Gemini-review workflow used 2.6 M tokens and hit the weekly limit; earlier 19 parallel auditors burned the usage window. The user said "never again run anything more than 5 auditors in a row at max. Reasonably we should be sticking to 3."

**How to apply:** batch workflows in groups of 3 (pipeline with ≤3 items in flight, or sequential batches); prefer inline checks for mechanical work. Related: [[quality-audit-2026-11]].
