# Shell and navigation — feature inventory (audit 2026-11, build sw kos-redraw-1)

Sources: index.html (shell markup), js/main.js (keys, rail), js/core/router.js (ENCODE/DECODE route table),
js/core/ui.js (SECTION_OF, openDialog, confirm, toast, menu, rerender), js/modules/mobile-shell.js (phone sheets),
js/modules/hub.js (search controller, spine drawer), js/core/search.js, js/core/desk.js (hold-⌘ sheet, wake lock),
js/modules/notifications.js (bell), js/modules/dayreview.js (review chip), js/modules/cloudui.js (sync chip),
js/core/pwa.js (SW, theme-color, kos-open), js/core/aitools.js (app_navigate), js/modules/help.js, docs/GUIDE.md.

## Global header (#topbar)
- Brand (Go to Home) · Search box (+ "/" badge, listbox, count live region) · Clock (time/date) · Review chip
  (menu: Open / Skip; slots morning/evening/...; recent finished/skipped state) · Bell (menu: five latest, Mark all
  read, All notifications) · Assistant trigger (+ trigger dot) · Sync chip (#sync-status: synced/syncing/pending/
  error/idle(signed out, offline)/unconfigured hidden) · page-actions slot.

## Rail (#rail)
- 7 destinations: Home, Study (+due count), Productivity (last page), Collection, Governor, Assistant, Archive (#/data).
- Collapse toggle; three remembered states: ui.railOpen (desktop), ui.railOpenSpine (beside spec spine),
  ui.railOpenNarrow (701-1080 overlay rail). Profile chip (level, HP state, gold) -> Governor.
- SECTION_OF map view -> rail section (ui.js:426-439).

## Phone shell (<=700px)
- Bottom tab bar (Home, Study, Productivity, Collection, More 余), phone title bar with ▾ section sheet and ⋯ tools,
  More sheet (Governor/Assistant/Archive/notifications), search sheet, moved-node sheets (filters, data-phone-more),
  vault disclosure, subnav edge buttons. Safe-area top/bottom.

## Router
- Hash routes; codecs for ref, subject, governor, code, japanese, creatives, mind, sims, money, routines, exams,
  goals, assistant, help, reports, pacing. Aliases planner->wishlist, tasks->routines. Invalid hash -> Home.
- Back/Forward = browser; Backspace and ⌥←/⌥→ shortcuts; duplicate-entry rule; focusView + announce on navigation.
- Deep links (cold load), kos-open from SW notification click, Assistant app_navigate (NAV_VIEWS enum).

## Overlays
- KOS.ui.openDialog (modal, focus trap/restore, scroll lock data-scroll-lock, Escape), confirm (danger/non-danger,
  Enter shortcut), menus/popovers (KOS.ui.menu; page <details> popovers e.g. Governor ⋯), toasts (single #toast,
  optional action, 2.6 s / 8 s), achievements unlock overlay/ping, spine overlay drawer (Escape/scrim).

## Keyboard
- "/" search; Backspace back; ⌥← ⌥→; Escape (dialogs, menus, search, spine drawer); hold ⌘ shortcut sheet;
  skip link; view-level keys (Money, Daily Review, routine player, story, quiz, ink, PDF, flashcards).

## Themes / PWA
- Graphite default, Atelier Dawn, 27 shop themes, Follow the system, Try on; theme-color meta follows --bg;
  SW update prompt; offline (cloudsync offline status); first run (sample events, pacing seed).

## Help
- js/modules/help.js (8 sections, 79 entries), docs/GUIDE.md.

## Coverage matrix

| Item | Presentation (sizes) | Behaviour (fixture/result) | Result |
|---|---|---|---|
| Brand / Go to Home | mac, ipad, iphone (34x44 on phone) | click -> home | OK (phone width 34 noted in measurements, minor) |
| Search box + listbox | mac, iphone (earlier) | 'binary' arrows/Enter -> topic, focus main, value cleared; 'calendar'/'money' no page results | earlier findings (pages not searchable, ranking, phone chips, raw sub-lines); keyboard OK, verified |
| "/" shortcut | mac | focuses search; ignored in fields/dialogs (code) | OK; "/" badge shown on touch -> finding sync-dot/'/' |
| Clock | mac/ipad/iphone | day change does not redraw page | earlier finding |
| Review chip | mac, ipad, ipadl, iphone | menu opens 300px, focus Open; Skip no undo | earlier finding; iPhone 44x40 oval, iPad 40px tall -> touch finding |
| Bell | mac, iphone, dawn | focus lands on Mark all read | earlier finding |
| Assistant trigger | mac, dawn | emblem near-invisible | earlier finding |
| Sync chip | mac, ipad, iphone (first-snow) | signed out = idle grey dot, click -> #/data | new finding |
| Rail destinations + counts | mac, ipad, ipadl, 874x402 | Productivity opens last page; current marking per route | Reports unmarked (new); collapsed tooltip/badge earlier; touch size new |
| Rail toggle / states | ipad 24x24 | overlay rail Escape/persist earlier | touch finding new; earlier finding |
| Profile chip | 874x402 | clipped past viewport | new (landscape) |
| Phone tab bar | iphone, iphonesafari | labels clipped to 1px | earlier P1, re-verified |
| Phone title bar / ▾ sheet / ⋯ tools / More | iphone | Money/Goals tabs unreachable; sheets stay open past 700 | earlier findings |
| Router codecs | mac | achievements/assignments/reminders/review args dropped from URL | new finding |
| Invalid hash / unknown view | mac | hash -> Home; KOS.show(unknown) blank + pushed | new finding |
| Deep links (cold load) | mac | money/budgets, code/kata, routines/edit/habits, reports/week, creatives/drills, governor/edit, files OK; achievements/sets rewritten | OK except achievements (finding) |
| Back/Forward, duplicate entries | mac | earlier findings; focus moves to main + announce on navigation verified | OK (focus/announce), earlier findings |
| Backspace = Back | mac | fires over handled keys/dialogs | earlier P1, re-verified in code |
| ⌥← ⌥→ | code | router delegates to history | OK by code |
| Hold-⌘ sheet | mac | static list, misaligned | new finding |
| Skip link | mac | navigates to Home | earlier P1, re-verified |
| openDialog Escape/focus restore/scroll lock | mac | Escape closes, focus back to opener, #stage locked | OK, verified |
| confirm Enter | code + eval | Enter anywhere confirms non-danger | earlier P1, re-verified in code |
| Dialog survives navigation | mac | earlier finding | earlier |
| Event dialog sizing | ipadl 920x561 centred, ipad 788 wide, iphone sheet 402x736 scrolls | autofocus 13.5px input (iOS zoom on phone, a11y area) | OK layout; zoom covered by a11y-hci |
| Menus/popovers | mac/ipad/ipadl | review chip popover fits; Governor ⋯ clipped when header has art | earlier P1 re-verified (cold load with has-art) |
| Toasts | iphone, code | wraps at half width (earlier P1 re-verified); single slot drops Undo; fixed 2.6 s | new finding + earlier |
| Toast Undo keyboard | earlier | | earlier finding |
| Achievements unlock overlay | iphonesafari | appears over pages, Escape closes | OK (presentation in achievements area) |
| Spine drawer Escape/scrim | code | Escape closes only overlay drawer, not over dialogs | OK by code |
| Live regions | mac | #node-count announces bare number | new finding |
| Safe areas | iphone portrait (top/bottom OK by CSS), 874x402 landscape | no left/right insets | new finding |
| Themes: Dawn | real setTheme | hero kickers OK in real app; harness --theme mixes tokens | new P3 (body data-theme) + audit note |
| Shop theme spot-check | first-snow, iphone | shell legible | OK, verified |
| theme-color meta | Graphite/Dawn | follows --bg (oklch string) | OK |
| First run (empty account) | mac, ipad, iphone | 3 unread, 23 behind, no sign-in prompt | new finding (+ earlier SAMPLE finding) |
| Assistant navigation (app_navigate) | code + eval | 13 views missing | new finding |
| Notification open routing (kos-open) | earlier | | earlier finding |
| Help & Guide coverage | mac/ipad/iphone (earlier) | missing features listed | earlier findings |
| document.title | earlier | | earlier finding |
| Offline behaviour | NOT checked in the browser: the dev server is a local host where the SW always goes to network (invariant 37), and the harness account is signed out, so cloudsync's offline status (cloudsync.js:1182, 1542-1546) cannot be exercised; code read only |
| iOS standalone status bar (status-bar-style default) | NOT checked: needs a real Home Screen install |
| SW update prompt (skipWaiting on confirm) | NOT checked: needs two deployed versions |
