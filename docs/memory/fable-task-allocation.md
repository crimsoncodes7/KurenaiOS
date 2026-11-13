---
name: fable-task-allocation
description: "Which quality-programme work goes to Fable (scarce, fast-draining) and which to Opus; decided 2026-11-13"
metadata:
  node_type: memory
  type: feedback
  originSessionId: daa53891-533f-4fa9-8b8d-f62117a0dc58
  modified: 2026-11-13T19:02:56.262Z
---

Fable is far more capable but drains the 5-hour limit fast, so it gets only work that needs deep cross-cutting reasoning about correctness. Mechanical, visual or content-volume work goes to Opus.

- **Fable:** W2's core (the change bus and redraw policy, the view lifecycle with dispose/AbortController, resumable sessions with one upserted ledger entry and delta pay, lazy content loading at boot) and W1's sync remainder (DI-20 side replicators, the rest of RC6 Todoist/Google bookkeeping).
- **Opus:** RC4 store registry, W3 (menus over dialogs, layout tiers and touch, even its global RC2 primitive), W4 Money and the exam-items rework after their design prompts, W5, W6 content, W7, W8, the small fixes (UR-25 Edit seat, Cram, the drill), and every review.

**Why:** the user said W3 "is tedious and would just waste time" on Fable, and asked that only tasks needing Fable's higher reasoning and coding use it, since it runs its limit out quickly.

**How to apply:** before starting a workstream, say which model it is meant for; if the session is on Fable and the work is on the Opus list, suggest switching. No reviewer agents on Fable ([[max-three-agents]]). Related: [[quality-audit-2026-11]].
