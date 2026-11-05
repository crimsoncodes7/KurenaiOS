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
