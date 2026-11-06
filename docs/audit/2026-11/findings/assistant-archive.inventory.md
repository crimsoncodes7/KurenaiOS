# assistant-archive inventory (batch 4, slot 18) — item → presentation → behaviour → result

## Assistant (#/assistant, js/modules/assistant.js PAGE_TABS 1751)
| Item | Presentation | Behaviour | Result |
|---|---|---|---|
| Chat thread, composer, starters | mac/ipad/iphone, Dusk+Dawn | earlier run: send signed-out, tool add, approval | earlier findings 1,5-10 (composer hint, undo never offered P1, scroll P1...); header chips 21px (new) |
| Thread header: Project picker, Pin, model chip | ipad measured | — | Pin/Project 21px tall (finding) |
| History | mac/ipad/iphone | signed-out only | earlier finding (wrong 'Account & Cloud Sync' route); signed-in NOT checked (no cloud account) |
| Settings: 4 task routes x provider/model/fallback, Ollama URL, voice | all sizes | code trace of every category caller | 'Simple data requests' route dead (finding); voice/Ollama endpoint presentation OK |
| Memory | all sizes | signed-out only | earlier finding; signed-in NOT checked |
| Scheduled: form, day picker, add, row On/Run now/Delete | all sizes | add (validation, toast, next time), delete confirm | ovals on touch, no edit, duplicate time (findings); delete confirm OK; Run now NOT checked (needs a model) |
| Permissions: tier chips, filter, 151 tool selects, Reset | all sizes | Ask-first semantics traced in orchestrator; reset confirm read | read-tool Ask first ignored (finding); iPhone chevron/filter (finding); Reset confirm OK |
| Activity | mac | earlier run | earlier finding (Proposed…Started forever) |

## Notifications (#/notifications, bell)
| Item | Presentation | Behaviour | Result |
|---|---|---|---|
| Feed, day groups, 15 kind filters tabs | mac/ipad/iphone, empty+dense | mute Calendar → feed 19→11, unread 19→11, restored | OK, verified; focus lost on toggle (finding) |
| Notification filters (15 switches) | all | setMuted persists in state.ui.notifyMuted | OK; focus loss (finding) |
| Device alerts + quiet hours | all | headless permission denied → switch disabled/toast; inQuiet logic read (midnight window OK) | OK (permission-granted path NOT checked: headless denies) |
| When the app is closed (2 switches) | all | disabled signed out | OK, verified |
| Bell popover: 5 items, Mark all, View all | mac | click item → marks read (19→18), routes to #/exams/season, closes | OK, verified |
| Review notification click | — | earlier finding (lands on Routines) | earlier |
| Row text | dense | Morning Review template | double full stop (finding); 'Exam season is on' id keyed to series end (noted in summary) |
| Fresh-install feed | empty | — | backdated carry-over notice (finding) |

## Archive
| Item | Presentation | Behaviour | Result |
|---|---|---|---|
| Backup & Restore: Export full backup | all sizes | snapshotFull on dense seed + fixtures in every store | file lacks reports + pot pics (finding) |
| Import backup | all | real file input into an EMPTY slot; state deep-equal (0 diffs); IDB counts equal except reports 11→5 | no confirmation (P1), ink merged not replaced (finding), HUD/files index stale after restore (finding) |
| Export revision summary | — | NOT checked (opens a print window) |
| What a backup covers | all | compared with snapshotFull | incomplete (finding) |
| Reset everything dialog | mac | focus to input, Enter refused, Esc closes | OK (focus returns to page header, not the trigger: minor, not filed) |
| Account & Cloud Sync card | all, signed out | sign-in/out NOT exercised (prohibited: no real credentials) | stale copy (finding) |
| Help & Guide: sections, search, Next, Ask Kurenai | mac/iphone | search 6 queries | badly stale (finding) |
| Storage: 7 cards, auto-upload switch, Ask to keep | mac/ipad/iphone, empty+dense | file index vs IDB | dead space, 0 KB rounding, stale index after restore (findings) |
| Pen and ink: 4 switches, ink storage line | all | each switch writes state.ui (finger, float, focusWake, inkRead) | OK; focus drops to MAIN after each toggle (same cause as notifications) |
| Connections: Google, Todoist, Reminders lists | all | Connect signed out → toast 'Sign in to cloud sync first.', Sync now disabled | OK; signed-in flows NOT checked (no cloud) |
| Themes | Dawn: chat mac, data ipad | — | no contrast problem seen; shop theme NOT checked |
