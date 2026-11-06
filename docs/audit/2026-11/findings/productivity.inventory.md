# Productivity — feature inventory and behaviour matrix (top-up, 6 Nov 2026, sw kos-redraw-1, e6c08b1)

Slot 13. Seeded account (dense sample) and empty account (reset). Sizes: mac 1470x832, ipad 820x1180, ipadl (Calendar), iphone 402x874.
Fixture scripts: audit-evidence/2026-11/qa/prod2/*.js (focusmodes, idle, switch, rt1, rtnew, auto, player, rem, pace, place).
Measurement sweeps: prod2/s-<size>-*.json (seeded), prod2/e-<size>-*.json (empty). Screenshots: shots/productivity/inv/.

Legend: P = presentation checked (sizes), B = behaviour checked (fixture → result), → finding title or OK.

## Focus timer (js/modules/focus.js, js/core/governor.js)
| Item | P | B | Result |
|---|---|---|---|
| Pomodoro 25/5: cycle → break, End ✓, pay | mac | 26 min → break, cycles 1, award 35 XP / 5 gold (+54 streak-bonus gold) | OK (bonus gold display: "Session review repeats '36-day streak'…") |
| Pomodoro ended before first cycle | — | 10 min → forfeited, complete false | OK |
| Custom 45/0 auto-complete | — | 46 min → ends itself at 2700 s, 4 blocks 48/4 | OK |
| Custom under 10 min | — | 9 min → 0 blocks, not complete | OK |
| Custom 25/5 ended early at 21 min | — | 2 blocks kept, complete true | OK (invariant 4a) |
| Stopwatch, no limit | mac/ipad/iphone setup | 35 min → 3 blocks | OK |
| Stopwatch limit 60 | — | ends itself, ended:'limit', 6 blocks | OK |
| Study-until | — | 31 min → 3 blocks | OK |
| Break nudge (Off/25/50/90) | setup sizes | code read only (chime + line) | NOT exercised (needs real-time audio) |
| Penalise tab-switches / distraction +1 | setup | code read | NOT exercised (visibility events) |
| Idle watch: warn at 30 min, end 5 min later, credit to last touch | — | warned (toast + focus notification), ended 'idle', paid 1140 s = 1 block | OK |
| Switch… mid-session (stretch < 1 min folds) | earlier shot | maths for 30 s then back → one compsci stretch | OK |
| About to Study preflight overriding 'no link' | mac | general start → compsci + assignment | "Focus: 'General study — no link' is overridden…" (holds) |
| Running stage (long assignment title) | mac, iphone | ctx −131..485 | "Running Focus: a long assignment title runs off…" (holds) |
| Break header End early + End session | code | focus.js:1206 | "Running Focus in a break…" (holds) |
| Minimise / mini player / page under a live session | mac | page content ends at 320 px | "Focus page while a session is minimised…" (holds) |
| Phone dock | earlier run | — | presentation only (1–2 Nov), not re-run |
| Completion review (session review) | dialog text seen | — | "Session review repeats…" (holds, focus.js unchanged) |
| Reading session | — | code read (logs media, no forfeits) | NOT exercised |
| Touch sizes on setup | ipad/iphone | selects 39 px, switch 34x20 | "Touch sizes on Focus setup and Routines settings…" |

## Reminders (js/core/reminders.js, js/modules/reminders.js)
| Item | P | B | Result |
|---|---|---|---|
| Smart sections All/Today/Scheduled/Upcoming/Overdue/Completed | mac, ipad, iphone, shop theme | timed-earlier-today item in Overdue AND Today; yesterday not in Today | "Reminders 'Today' leaves out overdue reminders" (holds) |
| Recurrence daily/weekly/monthly/yearly | — | monthly from 31 Jan → 28 Feb → 28 Mar | "Monthly reminders drift…" |
| Completing a repeating reminder | — | rolls to next future date, no record, no undo | "Completing a repeating reminder cannot be undone…" |
| Repeat with no due date | — | recur cleared by the gate | OK |
| Sub-tasks reset on recurrence | — | reset to not done | OK |
| Reward cap 8/day, once per item/day | — | 10 completions after 2 earlier → 6 logged | OK |
| Lists: add/delete (items keep, unlisted) | sidebar | delete list → item listId null | OK |
| Tags: rename merges | — | ['alpha','beta'] rename alpha→beta → ['beta'] | OK |
| Alerts (6 offsets) / forecast | — | forecast ids and times right; wording | "Reminder alert notifications read 'due 10 minutes to go'" |
| Quick add in a section | code | Today/Upcoming set a date, Scheduled/Overdue add undated (selected in inspector) | OK (minor) |
| Inspector hint column | mac | — | "Reminders: the right inspector column…" (holds) |
| Complete circles touch size | ipad/iphone 32x32 | — | "Reminders: complete circles are 32x32 on touch" (holds) |
| Sort / priority filters | mac | sort keys read | OK (touch size in the touch finding) |
| From your plan (Today) | earlier | toast with Undo | OK |

## Routines (js/core/routines.js, js/modules/routines.js, routineplayer.js)
| Item | P | B | Result |
|---|---|---|---|
| Kinds morning/evening/study/custom/habit | — | normalise kinds | OK |
| Required / optional / minimum / checkMorning steps | — | all-optional never kept; min-first locks out full pay | two P2 findings |
| Snapshot on first tick (edits never rewrite a day) | — | edit after ticks → day still judged on old 3 steps | OK |
| Untick / re-tick pays once | — | no second award | OK |
| Days of week / every N days / weekend override | — | every 3 from today: 6,9,12 Nov; weekend days [6] → Sat window 09–10, Sun off | OK |
| On demand (days null) | — | done, no pay, no streak | OK |
| Rest days (one in seven, not in the past) | — | +1 ok, +5 refused, +8 ok, −1 refused | OK |
| Streak / best / summary with rest days | — | 4 / 4 / scheduled 5 | OK |
| Evening late ticks until noon / Morning Review | — | 10:00 yes, 12:00 no, habit no | OK |
| Window (time) never closes a day | — | Morning played 19:03, paid and kept | "A routine's time window never closes it…" |
| Pay cap 8/day | — | CAP 8 (code) | OK (not filled to 8) |
| Several times a day (times) | habits editor mac | steps t0800/t1300/t2000, auto dropped, one time → null | OK |
| Auto-tracked habits (7 sources) | habits editor | focus counts aborted sessions; reading excluded; general study counts for Focus not Study; calendar vs routine day | "Auto-tracked Focus habits count aborted sessions…" |
| New routine with one step | editor mac | saved as habit in Daily habits | "'+ New routine' with a single step…" |
| Templates / fromTemplate / offer card | mac, iphone | Morning Routine created and played | "Routine offer checkboxes…", "Routines 'Start with these?'…" (hold) |
| Player (Done · next, Skip, Back, finish) | — | 7 of 7, +23/2/+4, '炎 1 days' | "Routine player's finish screen says '炎 1 days'" |
| Daily habits editor (#/routines/edit/habits) | mac with 4 habits | options open in place | "Daily habits editor: Save and Cancel…" |
| Today tab cards | mac, dawn, iphone, empty | three equal columns; Today's three rows | "Routines Today: three equal columns…" (holds), "'Today's three' rows clip…" |
| History tab | sweeps | read-only | OK (no measurement flags) |
| Settings (review times, day start ≤ 06:00, weekend days, kit) | ipad/iphone sizes | slot order not validated | "Review times can be set out of order…", touch sizes |
| Page header Templates vs tab | dawn | — | "Routines: page-header 'Templates' button…" (holds) |
| Empty Daily habits card | iphone empty | 'Add habits ›' now present | "Daily habits card repeats the page sub-line…" (changed) |
| Routines inside routines (QoL idea) | — | model read | backlog design |

## Daily Review (js/core/dayreview.js, js/modules/dayreview.js, js/core/today.js)
| Item | P | B | Result |
|---|---|---|---|
| due(): one review, folding, never a passed slot | — | out-of-order times fold a future morning | "Review times can be set out of order…" |
| Morning: Today, Three (pick/swap/use these three), Start | ipad | picks stored, swap offered when full | OK; summary text ".." | "Morning review summary prints '11 days away..'…" |
| Afternoon: So far, Three, Still today, Time left, Next | mac | Place menu behind dialog; strip labels | "Afternoon review: 'Place in a free block'…" (holds), "Afternoon review time strip…" (holds, time-dependent), "Time-left strip's end label…", "'Tomorrow' on a plan row…" |
| Evening: numbers, unfinished triage, tomorrow, prep, wind-down | earlier run | triage code read (reminder 'done' undo does not undo a repeat) | "Evening review: 'Tomorrow's first task'…" (holds); undo issue folded into the repeating-reminder finding |
| Step tabs focus ring | code | .k-dr-strip overflow-x:auto | "Daily Review step tabs…" (holds) |
| Later / Skip / Esc / header chip / recent | mac | chip states seen | OK |
| Kurenai's words (template first) | mac | "Kurenai's words aren't available right now" (no key in harness) | NOT exercised (no AI route) |
| Calendar marks for reviews | code | all derived in the all-day band | "Daily Review marks sit in the Week view's all-day row…" (holds) |

## Calendar (js/modules/calendar.js)
| Item | P | B | Result |
|---|---|---|---|
| Month / Week (desktop, iPad), Agenda / Month (phone) | mac, ipad, iphone, dawn | — | "Calendar has no Agenda (or Day) view on Mac or iPad…" (holds), "iPad portrait Calendar: '+ New event' wraps…" (holds) |
| Event types (5), colours (9), alerts (9, max 4), priorities | modal mac | validate() rules read | OK; "Calendar event modal: Cancel floats…" |
| Recurrence none/daily/weekly/fortnightly/monthly/yearly + until | — | monthly anchored (clamp), yearly 29 Feb only leap years | OK (yearly edge noted in the reminders drift finding) |
| Per-showing edit/skip, overnight events | — | not offered; end ≤ start refused | "Calendar: a repeating event can only be edited or deleted as a whole series…" |
| New one-off exam → assessment | — | only the modal converts; KOS.calendar.addEvent stores an exam event | OK per boot migration (not a finding) |
| Derived chips (assignments, reminders, exams, money, goals, reviews, routines) and Show menu | dawn mac | unknown event types render without hue (qol) | qol |
| Delete confirm (danger, whole series wording) | code | — | OK |

## Pacing (js/core/pacing.js, js/modules/pacing.js)
| Item | P | B | Result |
|---|---|---|---|
| Week strip, hero, three subject columns | mac, ipad, iphone, empty | — | OK (scroller arrows 32x32 within the touch finding family) |
| Personal row carry-over (weeksLate, → here) | — | prev-week row carried 1 week; move to this week stops the carry | OK |
| Class row lessons, sat ticks, done when all sat | — | all sat → done, unsat one → not done | OK |
| Lesson ticks / lesson-day selects touch sizes | ipad/iphone | 18x18, 62x24 | "Pacing week: lesson ticks…" (holds) |
| Edit week (date, label, numbers, note, delete) | mac, iphone | mid-week date accepted, overlaps, steals current week | "Pacing 'Edit week' accepts any date…", "'Edit week' dialog on Mac: 'My week'…" |
| Delete week with rows (cascade) | — | refused without cascade, removed with it | OK |
| Class days (timetable) dialog | — | the click did not open a dialog in the shot (ping covered the strip) | NOT re-checked visually |
| Braid | mac, ipad, iphone | — | OK (no flags) |

## Not checked (and why)
- Nudge chime, distraction penalties, Wake Lock, haptics/audio: need real time / visibility / device APIs headless Chrome does not give.
- Kurenai's review words and critique routes: no AI key in the harness.
- iPad Home Screen standalone mode and real Safari: harness is Chrome.
- Google/Todoist sync of Calendar and Reminders: covered by the integrations area, no sign-in here.
- Phone Focus dock and mini-player drag: presentation from the 1–2 Nov run, not re-run.
