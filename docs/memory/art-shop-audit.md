---
name: art-shop-audit
description: Roadmap 5.13/5.14 art and shop plan — approved 2026-10-27/28; build plan docs/app-art.md (328 images, 23 waves; waves 1-5 made); next release 1, the Assistant's redesign
metadata:
  type: project
---
The art and shop audit (roadmap 5.13) was APPROVED by the user on 27 October 2026. The build plan, decisions, shop prices and art waves are in docs/app-art.md (the one place); report artifact https://claude.ai/artifact/6u9Wg3fQ6ugEN9w41zy5Ck. 328 Gemini images (round two on 28 October added batches 14-25: the missing desks incl. Japanese, page headers, Exams covers, avatars, painted frames/shelves/Shrine cards, seal stamps, badges for every Code/Japanese/Mind/Creatives/A-level unit; waves 1-5 already made, in the inbox, not imported) in `art-source/app/manifest.json` (each asset has a `wave`, 1–23, ~15 per Gemini usage window; the sheet is prototypes/app-art/art.html). The shop adds 116,700 gold of new items (incl. 'your own picture' unlocks, 3,000 an area / 20,000 all, roadmap 5.14, which also adds free rotation by time or condition and moves today's free uploads behind the unlock) (outfits 4,500, prestige gala 10,000, halls 2,500, scenes 1,800, painted banners 1,200…). Design prompt 18 is now ONE combined prompt (art slots, Assistant, shop, cosmetics; 30 Oct); the small passes 18.1/18.2/18.4/18.6 were built directly without Claude Design (user: small ones go straight to code). CSS banners retired; seals kept.

**Why:** the user holds ~43k gold and the Collection pays a lot, so they want a long grind (70k+), all outfits, and a slow art rollout limited by Gemini's windows. Mind's desk and badges were later requested (28 Oct); Routines stays out. Don't skip a place because it already has its own art.

**How to apply:** build one release at a time in app-art.md's order, only with the art that has arrived (no SVG stand-ins); next is release 1, the Assistant's redesign (wave 1). Ask before deploying. The handover is docs/HANDOFF.md §0. See [[user-made-assets]], [[act-without-asking]].


30 October 2026: all 322 made; reviewed (contact sheets, import report, macOS Vision OCR via a small swift tool); 9 marked `redo` with rewritten prompts, then remade by the user and passed the same day (manifest `redone`; the four badges imported). Import fixed: `bg` kind was skipped, and the green key ate moegi; now only the ground is keyed and badges are `solid`. Achievements (roadmap 5.16/5.17, docs/achievements-plan.md) replace step 7b. See [[achievements-badge-wall]].
