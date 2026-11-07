# sync-disruption — inventory (top-up, 7 Nov 2026, build sw kos-redraw-1)

Scope: every path by which something the user did not just ask for redraws, replaces or covers the page,
and every piece of transient state that a redraw can lose. Harness slot 6, seeded account, iPad 820x1180
unless noted (iPhone 402x874 and iPad landscape 1180x820 spot-checked).

## A. Redraw triggers (sources)

| # | Trigger | Path | Kind | Behaviour checked | Result |
|---|---|---|---|---|---|
| A1 | Cloud state pull (clean replace) | cloudsync.js:768-775 -> rerenderCurrent :723-733 | background "hard" | r1/r3/r9/r5 | held on task pages; elsewhere redrawn after 45 s idle -> vault scroll, strips, in-page tabs, seat draft, unsent input lost (new findings) |
| A2 | Cloud state pull (three-way merge) | cloudsync.js:487-497 -> rerenderCurrent | hard | code-read (same function) | as A1 |
| A3 | Lost CAS race / conflict path | cloudsync.js:1279 -> rerenderCurrent | hard | code-read | as A1 |
| A4 | Realtime "changed" note / focus / visibility cycle | cloudsync.js:1480-1495, 1541 | hard (via A1) | code-read | as A1; on the iPad a return to the app is usually > 45 s since the last touch, so non-task pages redraw at once |
| A5 | Habit auto-tick after a session | routines.js:697-700 | soft; DROPPED (not deferred) when a dialog is open | code-read | held on task pages; elsewhere immediate |
| A6 | Daily Review close / finish / skip | dayreview.js:92, 103, 661, 709 | soft | sd8 rerun (r12 variant) | held on task pages (notes page kept) |
| A7 | Daily Review AUTO-OPEN on return | dayreview.js:722-749 | overlay | code-read; no review due in harness (r12) | blocked() has no task-page check -> carried finding |
| A8 | Boot: sample seed / own art loaded | main.js:303, 307 | soft | code-read | held on task pages |
| A9 | Boot: Google read-only copy loaded | ext.js:364 | soft | code-read | held on task pages |
| A10 | Achievement earned while on the Wall | achievements.js:760 | plain (hash-guarded) | code-read | OK (only the Wall) |
| A11 | Achievement unlock overlay | achievements.js:603-640, core 500-506 | modal | r10 | opens over a flashcard set, takes focus (new) |
| A12 | Exams planner "Sent · Undo" timer | examviews.js:264 | PLAIN, unscoped | code-read | redraws whatever page is current after 8 s (new) |
| A13 | Connections "Sync now" resolve | connections.js:66-70 | PLAIN, unscoped | code-read | same (new) |
| A14 | Mind journal ready | mind.js:52, 217 | PLAIN, weak guard | code-read | same (new) |
| A15 | Focus minimise on #/focus | focus.js:1080 | plain, view-guarded | code-read | OK (user action) |
| A16 | Calendar breakpoint change | mobile-shell.js:624-640 | plain, dialog-guarded | code-read | OK |
| A17 | Files index / cloud files events | files.js:319-320 | page-local repaint, no hold | r13 | opener detached (new P3) |
| A18 | Ink events (kos-ink) | hub.js:2744, 3188; inktab.js:528 | targeted count repaint | code-read | OK |
| A19 | Evidence events (kos:code/ja/mind/cr-evidence) | codetopic.js:219, jatopic.js:326, mindtopic.js:385, crtopic.js:251 | targeted | code-read | OK |
| A20 | Ink sync / pen busy | ui.js:394-399 (inkUI.busy) | defers 1.2 s | sd11 rerun (r8a) | OK under the hold |
| A21 | Media autosync / provider pulls | autosync.js:191 | NO redraw | code-read | vault pages stale until navigation (carried #17 widened) |
| A22 | Money, Mind journal, review log, reports, ink pulls | money.js:1227, mindjournal.js:268, reviewlog.js:217, reportstore.js:427, inksync.js:353 | NO redraw | code-read | stale pages (carried #17 widened) |
| A23 | Google / Todoist sync | ext.js:325-337, 366 | NO redraw | code-read | carried #17 |
| A24 | HUD / rail counters every 30 min and after pulls | main.js:199-204, cloudsync.js:728-729 | header only | code-read | OK |
| A25 | OAuth returns (ext, GitHub App) | ext.js:348-358, codegit.js:336-344 | navigation up to 20 s after boot | code-read | P3 note (not filed) |
| A26 | Toasts | ui.js toast, components.css:389-400 | covers controls | sd10 rerun (iphone) | carried, holds |
| A27 | Idle-watch end of Focus | focus.js (invariant 4d) | review dialog | code-read | intended |

## B. Transient state per surface vs a background redraw (this build)

| Surface | State | Checked | Result |
|---|---|---|---|
| Topic notes | page n | r1 (bg hard/soft), plain | kept under bg; lost on plain rerender |
| Topic flashcards | position, rated cards | r9 | kept under bg |
| Topic quiz / exam | question, typed answer | r3 | kept under bg; lost on plain |
| Topic editor | in-memory rows | r11 | kept — and then WRITES STALE ROWS over pulled ones (P0) |
| Handwritten Side by side | both pane scrolls | r8a (ipadl) | kept |
| Code listings / retrieval | edits, tries, clock | task hold (mechanism, r1/r3) | kept under bg; lost on Learn/Reference switch (codetopic.js:123) |
| Japanese session | results | r9 | held |
| Header bell / menus | open | r4 | held (menu counts as topDialog) |
| Dialogs | values, opener | r8b | held, opener kept |
| Page scroll (#stage / document) | scrollTop | r5 (40 routes), iphone | kept except lazily batched vaults (P1 new) |
| Horizontal strips | scrollLeft | r5, r6 | lost on desks' units, Home desks, Collection Now row (P2 new) |
| details | open | r5 | lost on desks (in the strips finding) |
| In-page tabs | selection | r5 | lost on #/matrix, #/notifications, #/governor/edit (P2 new) |
| Edit your seat | draft | r7 | lost (P1 new) |
| Calendar | month shown | r14 | kept |
| Money search | text | r4 | kept |
| Unsent input after blur | text | reminders, 50 s | lost (P2 new) |
| Focus on typing field | focus, keyboard | reminders | held while focused |
| Files list | menu opener | r13 | detached (P3 new) |

## C. Not checked (and why)
- Daily Review auto-open reproduced only by code (no slot due at harness time; r12 returned due:null).
- Real two-device Supabase sync: no cloud account in the harness; pulls simulated with store.replaceState + KOS.rerender({background}).
- Shop Try on under redraw: r5 showed no diff on #/governor/shop but Try on itself was not engaged.
- Dawn and shop themes: not relevant to redraw behaviour; not re-screenshot.
- Exam paper viewer, Exam Room, pdfView over a redraw: task views / overlays outside #main; mechanism verified, not exercised.
