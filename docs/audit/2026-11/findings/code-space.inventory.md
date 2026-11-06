# Code study space — feature inventory (batch 4 continuation)

Sources: js/modules/code.js (KOS.views.code route switch :1565-1580, desk KOS.codeDesk :85, pages), js/core/code.js (KOS.code API :919-940),
js/modules/codecap.js (capstones, CAP_STEPS), js/modules/coderider.js (Rider projects), js/core/coderun.js (runners), js/core/codeui.js,
js/core/ui.js:1486-1491 (Code section strip), js/core/goals.js:726-745 (code goal types), router.js:52/123.

Legend: P = presentation checked (sizes), B = behaviour exercised (fixture/result). Earlier auditor = E (code-space.jsonl lines 1-17).

## Routes / pages
| Item | P | B | Result |
|---|---|---|---|
| Desk #/subject/code (hero, stage path, Daily 20, Continue, analytics, retrieval due, core path units, skill map card, Projects, For the computer) | mac/ipad/ipadl/iphone empty+seeded (E + now) | Daily 20, Continue, later list, analytics tiles | E findings; new: tasks tile semantics, later card cap |
| Curriculum map #/code/map + strand filter | all sizes (E, measured now) | filter (E) | OK beyond E |
| Skill map #/code/skills + band filter + unit folds | all sizes seeded | band counts read | new: truncation (ipadl), 40px rows |
| Task #/code/task/<id> (C# interp) | mac/iphone (E), mac now | pass/pay once, re-check no pay, see answer (dialog + no pay), compile error, Problems count, drafts persist on navigation | new: see-answer wording, error-head contrast, Problems count |
| Task, SQL runner (T1A) | mac | cold Check, warm Check, listing Run | new: cold-start timeout finding, examples layout/STDIN |
| Task, full runtime (unit 7+) | mac | no runtime → card, Check → 'Compile error RUNTIME', offer dialog, download (csw-1.1, 30 MB), pass 7.1-rect paid | new: runtime card copy, RUNTIME label |
| Phone task / Best on a computer | iphone (E), phoneTasks off now | toggle off → card | new: wrong reason copy |
| Retrieval #/code/retrieval | empty mac; seeded mac (8 due) | listbox keyboard, cap logic read (CARD_CAP 10) | new: listbox a11y, truncation; E: SM-2 next-review dates |
| Katas #/code/kata | empty mac, E for run | nav state | new: strip lights Code not Katas |
| Settings #/code/settings | mac (E), ipad now | runtime states, clear drafts confirm (read), phone toggles, practice slider | new: dead slider, time-limit copy |
| GitHub card (token / App) | ipad | NOT exercised: would send a token/requests to api.github.com (not a local host) | NOT checked (safety) |
| Track pages T1, T2 (written), T3-T9, D1-D6 (coming later) | T1 (E), T2 mac now, T3 mac | needs chips | new: T2 grid dead cell, needs copy |
| Capstones C1-C4, CT1, CT2 | C1 mac/iphone, C2 mac (shop theme), C4 build mac, CT1 mac | C1 full flow: milestones, rubric, write-up, submit → paid once, badge overlay | new: brief width; E: step bar sizes |
| Rider projects (13) | rp-bridge-hello, rp-t1b, rp-ct2, rp-t2b (mac/iphone) | import tampered → practice only; solved → paid 120/30/8 once; same file → 'Already imported' | OK verified; E: lessons string-sorted |
| Lesson on topic page #/ref/code/<ref> | 1.1 (E), T1.2 mac/ipadl/iphone, B.3 mac | SQL listing Run (cold timeout) | new: iPhone listing head squeeze |
| Invalid ids (task/capstone/project/track/page) | - | URL vs content | new: bad URL kept |
| Section strip active state | all Code pages | - | new: Katas |
| Goal types code-tasks / code-retrievals / code-capstone | - | measure code read (excludes seen/topup) | OK (read) |
| Search integration | - | queries LINQ, Gradebook, Avalonia | new: capstones/projects/tasks not searchable |
| Themes: Graphite, Dawn (E), shop theme crimson-moth | capstone/task | - | error-head contrast repeats |

## Not checked (and why)
- GitHub connect/push/CI check (needs real GitHub host and credentials).
- Kurenai capstone review send (metered AI request to a non-local host).
- Weekend projects card on a weekend day (today is a Friday; read code only).
- Interpreter timing: this harness's Chrome ran the interpreter 10-60x slower than Node (empty program 59 ms vs 2 ms), so C# timeouts seen in-browser for the C1 reference answer were NOT reported as product bugs (the answer passes in Node in <100 ms).
- Cloud merge of state.code (no second device in the harness).
