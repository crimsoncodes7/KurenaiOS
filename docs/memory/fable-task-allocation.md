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

**16 Nov 2026 hand-over:** the user moved to the other account (Fable for a limited time). There Fable does AP-01 (lazy loading) then RC6; the rest of that account's list (W4's import engine, open W1/W7 P2/P3s, roadmap 5.19 item 2 IT units archived) can run on Opus or Sonnet agents. This account keeps W3, W5, W8, W10 and the other 5.19 items. Smoke numbers: other account 142, 143, 149, 150; this account 151+. Full list: docs/HANDOFF.md §0.

**19 Nov 2026: Fable is no longer available (the user).** Everything runs on Opus (judgement, reviews) or Sonnet agents (well-specified mechanical work). W1's sync remainder is done anyway: DI-02 was fixed by RC6 (6b4d8a6; smoke143 J holds the audit's case) and DI-13 by RC5 (smoke133 G).
