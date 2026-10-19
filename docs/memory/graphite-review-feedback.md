---
name: graphite-review-feedback
description: "The user's Graphite UI review (2026-09-26) lives in the checklist artifact's db; lab visual overhaul is explicitly deferred"
metadata:
  node_type: memory
  type: project
  originSessionId: e3ef9a42-d290-440c-816f-6de2fe2143f1
  modified: 2026-09-26T22:23:31.456Z
---

The Graphite rebuild review notes are in artifact https://claude.ai/artifact/Xsx4PbEzc3MZzhk8oHxiYB, db collection `checks` (one doc per item: full, empty, issue, note). Read with ArtifactData list.

Deferred by the user (not for the base release): many lab visuals (Simulations, Trace Lab, Worked Examples) look poor and some overflow their area (e.g. Linked List, Binary Tree sims). The user called it a lengthy task and said to note it and leave it for now.

**Why:** base release first, then extras (Dawn, themes, skins, mobile views).
All deferred work (Tier C, M14 clean-up, the Claude Design items: phone, OOP IDE, lab system, Dawn/themes) is now ordered in the repo's `docs/ROADMAP.md` (2026-09-27); work from that.

**How to apply:** don't start the per-sim redesign during review fixes; surface it again when the extras phase begins. Related: [[it-units-sitting]].
