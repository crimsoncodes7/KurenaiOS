---
name: achievements-badge-wall
description: Roadmap 5.16/5.17 Achievements page after Reverse 1999's Fourth Wall brochure; plan docs/achievements-plan.md (2026-10-30); waits for 5.13's art
metadata:
  type: project
---
Asked 30 October 2026: a badge page like Reverse: 1999's "Fourth Wall" brochure (sets as painted panoramas with medallions, owned/total, list toggle, filter, showcase); badges start dim and light up with progress, full colour + unlock overlay when earned, a top-left progress notice per step (e.g. 8/10 physical books). Then a wide game-style catalogue for every area (5.17, ~120 badges in 15 sets).

**Why:** the existing badges were only unit/section completion; the user wants variety like game achievements.

**How to apply:** decisions taken (recommended four). The engine and catalogue are done; the page is functional on shared components and the user expects Claude Design (prompt 19, frames 35a-35h) to own the look — don't polish visuals by hand, restyle from the handoff (as a guide). Batch 26 (26 set panoramas) was made, checked (OCR + zoom) and imported 30 Oct; batch 27 (101 domain badges) comes later; tools/gen_ach_art.py lists imported art. Blocked badges (no evidence) are documented in the plan; never invent tracking. See [[art-shop-audit]], [[design-handoff-not-1to1]].

31 October 2026: Claude Design's handoff for prompt 19 (design turn 35, ~/Downloads/design_handoff_kurenaios_badge_wall) is BUILT: the Wall restyled (sections, two-column panels, the lay, dialog, list, showcase, Titles as plaques) and the Governor's Seat redesigned as the Stage with Edit your seat (#/governor/edit, governor.seatBg/seatFocus). 46 of batch 27's badges imported; batch 28 (19 set spots) added to the manifest. Not built: drag-reorder of the showcase, leave-with-changes prompt.
