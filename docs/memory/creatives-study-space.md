---
name: creatives-study-space
description: "Creatives (roadmap 5.7 item 3) build state — branch feat/creatives, Platform 1 begun 2026-10-29, invariants 154–156, smoke108"
metadata:
  node_type: memory
  type: project
  originSessionId: eea9cc91-8a22-4666-af78-27b9cc4e2f98
  modified: 2026-10-29T16:13:55.072Z
---

Creatives implementation began 2026-10-29 on branch `feat/creatives` (from main 70def76). Design handoff: `~/Downloads/design_handoff_kurenaios_creatives` (turn 31, frames 31a–31t; served by launch.json "design-handoff-creatives", port 8133).

Built in the first session: Moegi hue `--cr` in every theme (themes where Code took the green-yellow slot give Moegi the sky 224), subject id `creatives`, `KOS.creatives` model, `kurenai-os-creatives` IDB, desk, lesson on topic page, check page, Practice Log, Portfolio, project, add, settings, Writing Desk, Writing units W1–W3 (3 lessons each), Assistant read tools, smoke108.

**Why:** the plan's draft invariants 142–144 collided with Routines (142–149) and Files (150–153), so Creatives took 154–156.

Done since: Design drills + D1–D2 (e78cc24), the reference generator (ca771e4), the critique dialog and the Goals/Reports joins (30 October).

Platform 1 finished in code 2026-10-30: phone desk (31s), opt-in "Made this month" strip, art manifest (art-source/creatives/manifest.json, 48 pictures, sheet prototypes/creatives-space/art.html; ids go into KOS_CR.ART once imported).

Art units 1–3 built 2026-10-30 on the new sketchbook (js/modules/crsketch.js, Momentum via inkPad.mount({momentum})); All 48 pictures imported (the 12 redos landed 2026-10-30, 3a777c4).

**How to apply:** for new pictures: review, import with `python3 -I prototypes/japanese-space/art_import.py art-source/creatives assets/creatives/img` (move report.json out of assets), add ids to KOS_CR.ART. Next build: Art 4–5 or Design 3+. Ask before a production deploy ([[act-without-asking]]); never SVG stand-ins ([[user-made-assets]]).
