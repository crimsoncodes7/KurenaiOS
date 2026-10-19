---
name: run-tests-yourself
description: Always run the full smoke gate (and any other checks) myself; never tell the user to run it or hand them a test command as a to-do
metadata:
  node_type: memory
  type: feedback
  originSessionId: 2e2dc728-9366-4708-9ad8-6718d38edac2
  modified: 2026-10-19T17:52:42.953Z
---

Run the full smoke suite myself, every time it matters, and report the result. Never ask or tell the user to run it, and don't phrase a test command as their next step.

**Why:** the user said (19 Oct 2026) "You can run the full suite on you never should ask me to do so" after I closed with "run the full test suite with: …".
**How to apply:** after any code change run the gate in the background (`for i in "" {2..79} 84 85; do node "tools/smoke${i}.test.js"; done` on feat/money-goals) and state pass/fail with evidence. Mention a command only as documentation, never as an instruction to the user. Related: [[money-goals]].
