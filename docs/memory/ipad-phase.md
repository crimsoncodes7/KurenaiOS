---
name: ipad-phase
description: iPad Air 11" M4 (bought 2026-10-22) — roadmap Phase 6 (ink/Pencil) planned; 6.0 iPad layout RELEASED 87f9437 kos-ipad-1; Creatives plan waits on §12 answers
metadata:
  type: project
---

On 2026-10-22 the user got an iPad Air 11" (M4) and a Metapen A8 stylus (an Apple Pencil Pro later). They want it to be their study notes device: Pencil notes per topic, handwritten exam answers, PDF/past-paper annotation, handwritten Maths working.

- Roadmap Phase 6, docs/ipad-plan.md rev 1: one ink engine (`KOS.ink`, web Pointer Events, pen only), then 6.2–6.9. Next step is three spikes ON THE DEVICE (P: what the Metapen reports; D: pdf.js on a whole paper; H: AI reading handwritten Maths). Draft invariants 132–133.
- 6.0 iPad layout RELEASED 2026-10-22 (87f9437, sw kos-ipad-1). `responsive_audit.mjs --ipad` and `--sizes WxH --touch` exist; run them for layout work.
- Creatives (roadmap 5.7 item 3): docs/creatives-plan.md rev 1, one subject with four tracks. It waits on the user's answers to its §12 questions (level, purpose, apps, video or photo editing, time, which track first), then design prompt 15. The iPad's is prompt 14.

**Feedback from this work:** the user caught the main rail's toggle (hidden in portrait, a squashed oval in landscape) that the audit missed, so check shell controls by eye at iPad sizes, not just spill numbers. On touch, keep controls looking like the desktop ones (the toggle stays an edge-hung circle); do not move them into their own row.

Related: [[project-branch-and-release-state]], [[japanese-study-space]], [[code-study-space]].
