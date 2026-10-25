---
name: ipad-phase
description: iPad Air 11" M4 — Phase 6; 6.0 layout + 6.1–6.2 ink RELEASED; feat/ipad-polish (iPad fixes + 30e side by side) built, not released; match desktop on iPad
metadata:
  type: project
---

On 2026-10-22 the user got an iPad Air 11" (M4) and a Metapen A8 stylus (an Apple Pencil Pro later). They want it to be their study notes device: Pencil notes per topic, handwritten exam answers, PDF/past-paper annotation, handwritten Maths working.

- Roadmap Phase 6, docs/ipad-plan.md rev 1: one ink engine (`KOS.ink`, web Pointer Events, pen only), then 6.2–6.9. Next step is three spikes ON THE DEVICE (P: what the Metapen reports; D: pdf.js on a whole paper; H: AI reading handwritten Maths). Draft invariants 132–133.
- 6.0 iPad layout RELEASED 2026-10-22 (87f9437, sw kos-ipad-1). `responsive_audit.mjs --ipad` and `--sizes WxH --touch` exist; run them for layout work.
- Creatives (roadmap 5.7 item 3): docs/creatives-plan.md rev 2, decisions A–H APPROVED 2026-10-22. The user is a complete beginner who quits over the "taste gap", so the beginner mechanics are requirements: micro-studies before pieces, a private Practice Log apart from the Portfolio, Momentum (no-eraser) mode, best-of-5, "Good for this unit" calibration, unit-bound critique, and a procedural reference generator. Apps are FREE-FIRST (never require paid apps). 20–30 min a day, paused in Exam Season. Design prompts 14 (iPad, frames 30a+) and 15 (Creatives, 31a+) are written; the user is drawing frames next.
- The Pencil arrives around 2026-10-25. The user's weekly usage was 91% spent until the Sunday reset, so before then do only light work (plans, design, small backend), no big builds.

**Feedback from this work:** the user caught the main rail's toggle (hidden in portrait, a squashed oval in landscape) that the audit missed, so check shell controls by eye at iPad sizes, not just spill numbers. On touch, keep controls looking like the desktop ones (the toggle stays an edge-hung circle); do not move them into their own row.

Related: [[project-branch-and-release-state]], [[japanese-study-space]], [[code-study-space]].

- 2026-10-25: design turn 30 (frames 30a–30t) is in ~/Downloads/design_handoff_kurenaios_ipad_pencil. 6.1 ink engine + 6.2 Handwritten tab RELEASED 2026-10-25 (052b27c, sw kos-ink-1, https://f47cbd39.kurenai-os.pages.dev), built in its own worktree /Users/fj/Developer/KurenaiOS-ink (server "kurenai-ink", port 8132), Ink invariants are 132–136 (design said 130–134); Creatives moved to 142–144; Mind holds 137–141. smoke100. Next: 30e side by side + Clip to page, 30b floating palette + ruler, 30p sync (kos_ink table) + 30s settings, export; then 30f answer pad, 30h PDF viewer.
- The Metapen was cancelled; an Apple Pencil (USB-C or Pro, unknown) arrives 2026-10-26.
- Testing in the built-in browser: the service worker serves stale scripts, so unregister it and clear caches before each reload.
- 2026-10-25 (later): branch `feat/ipad-polish` (worktree /Users/fj/Developer/KurenaiOS-ink, pushed, NOT released): every view fixed at 1180×796 / 820×1156 with touch (83849cd) and 30e side by side + Clip to page (fda5436, smoke100 G). Next: 30b floating palette + ruler, 30p sync + 30s settings, export, 30f, 30h.
- The user wants iPad views to MATCH DESKTOP (e.g. the running Focus stage: same three-column layout and clock size, clock dead centre), not a reflowed tablet variant.
- Touch checks: drive headless Chrome (port 9222) over CDP with Emulation.setTouchEmulationEnabled + pointer:coarse/hover:none media and Input.dispatchTouchEvent; a Node CDP script must call process.exit or a pending timer keeps it alive.
