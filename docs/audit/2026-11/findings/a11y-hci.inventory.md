# a11y-hci — feature inventory (top-up on kos-redraw-1, 5 Nov 2026)

Cross-cutting area: the inventory is the set of VIEWS (tools/responsive_audit.mjs VIEWS
plus the routes added since f4fa493) crossed with the HCI/a11y CHECKS below.

## Views (responsive_audit.mjs list)
home, subject, ref, review, assignments, tracker, focus, reminders, calendar, routines
(+ routines / templates / history / settings), pacing, pacing-braid, matrix, anime, books,
vn, game, mangaka, shrine, wishlist, goals, mediasync, governor, assistant, data, help,
money, exams, notifications, reports (+ week, week-study/focus/collection, month, term,
year), code-desk, code-lesson, code-map, code-task, code-retrieval, code-skills,
code-settings, code-track, code-capstone, code-bridge, code-project, code-project-setup.

## Views NOT in that list (added by hand for this top-up)
- Badge Wall: #/achievements, /sets, /recent, /showcase, /titles, /set/<id> (21 sets:
  app, focus, streaks, study, exams, code, ja, mind, creatives, routines, organised,
  goals, collection, ink, kurenai, u-cs, u-maths, u-it, u-code, u-code-t, ...);
  the badge dialog (‹ › nav, strip of chips, tiers); filter select; List view switch;
  sort menu; the showcase picker (six max, shake + toast); titles plaques + detail +
  Equip; the unlock overlay (queue, "And N more", View / Next / Close, skip on key);
  the pings (aria-hidden); first-run silent toast.
- Governor's Seat as the Stage: #/governor (status), /shop, /avatar, /history, /edit
  (Edit your seat: Preview, Background / Title / Sigil / Showcase tabs, banner upload,
  Discard / Save, dirty state).
- Gold Shop: departments, ware cards (Preview, Try on, Buy, "N more", Use, Take off,
  chips In use / Owned / Free / Trying on), the preview sheet (Try on / Stop trying on,
  Pin as a goal), Try on transient theme.
- KOS.art painted slots (js/core/art.js, js/modules/artslot.js): page header bands,
  desks, Spotlights, Home seasons, empty-state spots; the picture drawer (One picture,
  Rotate by time / condition, Shuffle, Your own: locked state "Open in the shop",
  Upload / Change or position, Remove).
- Assistant redesign: Hide Kurenai, Voice on/off, states.
- Also scanned: files, storage, mind, creatives, japanese, connections, pen.

## Checks applied to every view (where measurable)
1. Unnamed controls (accessible name) — a11y-scan.js
2. Touch targets < 44px under coarse pointer (iPad/iPhone) — a11y-scan.js
3. Round controls rendered as ovals — a11y-scan.js
4. Text contrast < 4.5 (3 for large) on the computed background, both themes — a11y-scan.js
5. Inputs < 16px on the phone (iOS zoom) — a11y-scan.js
6. Images without alt — a11y-scan.js
7. Visible focus indicator on every focusable — a11y-focus.js
8. Horizontal overflow / clipped text / glyph not centred / tiny glyph in big button — a11y2-geo.js
9. Spill / amputated text — tools/responsive_audit.mjs (4 sizes x 2 themes, touch)
10. Keyboard: tab order, arrow keys in tablists / dialogs, Escape, Backspace
11. Reduced motion (CSS and JS smooth scroll)
12. Audio: every sound source and its control (focus chime, Assistant voice, Japanese audio)
13. Haptics: navigator.vibrate or equivalent
14. Messages: toasts, error text, empty states, button wording
15. Navigation: document title, search reach, back/forward, dead ends
16. Destructive / spending actions: confirm or undo

## Coverage matrix (top-up, 6 Nov 2026, slot 21, kos-redraw-1)
Measured by a11y-scan.js + a11y2-geo.js (a11y21-{mac,ipad,iphone}.jsonl seeded, a11y21-empty-{mac,iphone}.jsonl empty)
and screenshots under shots/a11y-hci/n-*.png.

| Item | Presentation checked | Behaviour checked | Result |
|---|---|---|---|
| Home (hero art, season chip, Upcoming) | mac/ipad/iphone, Graphite+Dawn+Washi Morning; empty+seeded | contrast over art sampled from pixels | Dawn XP/HP ~3:1 (new); Washi dots 1.32:1 (new) |
| Picture drawer (One / Rotate / Shuffle / Your own, conditions, lock) | mac, ipadl | every mode tapped, cfg read back | Rotate thumbs dead (new); Your own while locked rewrites rule (new) |
| Page header art bands (Money etc.) | mac Graphite/Dawn | actions over art legible | OK, verified |
| Subject desk art | mac Dawn | visual | OK (layout gaps belong to Study area) |
| Exams hero cover | mac Graphite/Dawn | visual | no cover on sample exam; OK |
| Focus scene | iphone Dawn | visual | OK |
| Badge Wall Sets | mac/ipad/iphone, empty+seeded | keyboard focus visible (48/48), names, set dialog focus | OK; earlier findings hold |
| Wall Recent/Showcase/Titles/set routes | mac | route → tab | still open Sets (carried) |
| Badge set dialog | mac Graphite/Dawn | initial focus Close, strip names, persists across navigation | survives navigation (new cross-cutting) |
| Showcase picker (Edit seat compact) | mac | names | 21 unnamed buttons (new) |
| Save toasts (Seat/Showcase) | code | announce path | spoken twice (new) |
| Unlock overlay | code (achievements.js:620-672, css :260) | reduced motion, focus, teardown | OK, verified in code (not triggered live) |
| Governor's Seat / Avatar & profile / History | mac/ipad/iphone, empty+seeded | focus visible, switches | switches 34x20 (carried) |
| Edit your seat | mac/iphone empty+seeded | preview scale | iPhone preview 4.5px text (new) |
| Gold Shop + Try on | mac/ipad/iphone | names, truncation, Dawn Buy contrast | iPhone names truncated (new); Buy 5.79:1 OK |
| Assistant redesign (Hide/Show/Voice) | ipad/ipadl | focus after toggle, chip size | focus to BODY, 21px chips (new) |
| Files empty state | mac/iphone | controls enabled while faded | new P3 |
| Shop theme spot-check | Washi Morning on Home | contrast scan | new P2 |
| All 21 carried findings | re-measured / re-read | see recheck field | 19 hold, 2 changed, 0 gone |
| tools/responsive_audit.mjs full matrix | NOT run to completion | — | started at 4 sizes x 2 themes; at ~3 s/shot x 400 cells it needed ~2 h and shares the slot's single tab, so it was stopped and replaced by the targeted scans above |
| Share-card finishes, notebook papers, pen sets, story covers | NOT checked | — | budget; belong mostly to Reports/ink areas |
| VoiceOver / real iOS device behaviour | NOT checked | — | headless Chrome only; iOS zoom inferred from computed font sizes |
