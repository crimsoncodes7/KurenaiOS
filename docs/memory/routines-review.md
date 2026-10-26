---
name: routines-review
description: Roadmap 5.10 Daily Review and Routines (replaces Habits); RELEASED kos-routines-1, follow-up kos-routines-2 + runner v6 (words ahead); Files plan 5.11 drafted
metadata:
  node_type: memory
  type: project
  originSessionId: 2c0c35d5-15b0-4a79-b9e6-9474cbaf9f58
  modified: 2026-10-25T18:06:46.185Z
---

Asked for 2026-10-25. RELEASED 2026-10-26 as sw kos-routines-1 (3c471b2, https://5598f36e.kurenai-os.pages.dev); main fast-forwarded to feat/routines (ec95d06) after merging main's ink/polish in; gate 104/104 — main's ink suite is smoke100, Routines are smoke101–104. Plan docs/routines-plan.md rev 2 (decisions A–J approved). Invariants 142–149 now in CLAUDE.md. Follow-up RELEASED 2026-10-26 as kos-routines-2 (https://ff0df878.kurenai-os.pages.dev) with the runner Edge Function v6 writing review words ahead: Daily habits = one fixed routine (#/routines/edit/habits, auto-tracking via KOS.routines.autoSync), History read-only. Next asked-for work: Files (roadmap 5.11, docs/files-plan.md, decisions A–H await the user); app-icon badge offered.

**Why:** Habits → multi-step Routines; three daily check-ins; "where does it show" made derived.
**How to apply:** CSS class prefixes collide silently across view sheets (k-rv-/k-pl- broke Review and Wishlist) — grep other sheets before naming. User said the design's layouts (esp. Home) need not be followed blindly — keep existing layouts, take the visual design, never leave dead space. Review is KOS.dayReview (KOS.review is the flashcard page). Screenshots: headless Chrome + scratchpad shot.mjs with fixed clock; clear the SW (Storage.clearDataForOrigin) and reload ignoreCache or shots are stale. See [[mind-study-space]], [[user-made-assets]].
