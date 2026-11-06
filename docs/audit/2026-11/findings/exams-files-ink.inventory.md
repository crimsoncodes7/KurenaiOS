# exams-files-ink — feature inventory and check matrix (batch 4 continuation)

Earlier auditor (27 findings in exams-files-ink.jsonl, shots in a previous scratchpad) covered: hub season/readiness/planner pages at
iPhone, Exam Room (Mac/iPad/iPhone), marks-by-question, practice list, analytics, the predicted paper viewer (iPad landscape),
Files list/aria-live, Pen and ink page layout, the Handwritten tab, the floating palette on iPhone/iPad, PNG paste.
This pass: inventory from code, DOM measurement of 25 routes x 3 sizes (seeded) + 17 routes (empty, iPad), and the items below.

Legend: P = presentation checked (sizes), B = behaviour checked (fixture/result).

## Routes (js/core/router.js:90-136, js/modules/exams.js:1315-1340)
| Route | P | B | Result |
|---|---|---|---|
| #/exams (landing: Season when on, else Timetable) | mac/ipad/iphone measured | season on/off seen | earlier findings; limiting-on-thin (new) |
| #/exams/timetable, /past | measured 3 sizes; Dawn + azure-butterfly shots | tier filter select 30px (touch) | start-by finding, sample-mock finding |
| #/exams/timetable/load | ipad shot | load flags incl. deadlines | OK (deadline counted, card says hand-in) |
| #/exams/readiness | measured | thin fixture | limiting-on-thin |
| #/exams/plan | measured | — | earlier findings |
| #/exams/season | measured, Dawn mac | — | earlier findings |
| #/exams/results | ipad + mac shots | IT units read | IT grade overflow (new) |
| #/exams/practice (Attempts/Papers) | measured, empty iPhone shot | — | empty-state wording (new); reviewed checkbox (earlier) |
| #/exams/practice/analytics | measured, empty iPad shot | — | OK empty; earlier finding |
| #/exams/practice/library | ipad shot | — | wording contradiction (new) |
| #/exams/guide (Companion hub) | mac shot, empty iPad shot | drill with 0 items run | hard-coded '· 15' (new) |
| #/exams/<id> (assessment page) | measured 3 sizes | — | earlier touch-target finding |
| #/exams/<id>/scope | ipad shot | exclusion-wins fixture | OK (excluded leaf absent); preset subtitles ellipsised (P3, not filed separately) |
| #/exams/<id>/room | measured | — | earlier findings |
| #/exams/<id>/readiness | measured | — | — |
| #/exams/<id>/deep | ipad shot + geometry | — | unlabeled columns (new) |
| #/exams/<id>/trend | measured (th ellipsis only) | — | NOT screenshot-judged (budget) |
| #/exams/<id>/paper[/n] viewer | measured | tally opened | tally finding (new) |
| timed mode | ipadl/iphone/mac geometry + shots | start, reload, pause | navigator P1, pause P2, reload P3 (new) |
| #/exams/attempt/<uid> | mac shot | max=null record | 'of null' (new) |
| #/exams/attempt/<uid>/marks | measured | — | earlier P1/P2 |
| #/exams/nonexistent, /attempt/zzz | measured | — | OK ('Not found' / 'That attempt is gone') |
| #/tracker | measured | — | same page as Practice |
| #/files | ipad/iphone shots, measured | add 5 files (pdf, same-hash copy, png, empty, txt), text search, menu, delete confirm | chips inverted (new); dedupe/linked/skipped OK, search inside PDF OK after indexing, Delete everywhere confirm focuses Cancel OK |
| scan pages | ipad shots | photo → straighten → PDF | handles 30px, styling (new); PDF added OK |
| #/storage | ipad shot | sizes vs Files | formatter finding (new) |
| #/pen | ipad Dawn shot, measured | — | switches 34x20 (same as earlier switch finding) |
| Handwritten tab | ipadl dock, iphone | synthetic pen stroke, undo, redo, count | OK (written n=1, tab count 1, undo/redo work); iPhone palette P1 re-verified |
| Side by side (>1080) | ipadl shot + geometry | — | bar scroll hides undo (new) |
| Ruler | ipadl shot | tool on | OK on page; leaks into strips (new) |
| Answer pad Type/Write/On paper | ipad shots | Write with ruler pref | tool-leak finding (new) |
| Assessment editor | ipad shot, iphone font sizes | — | holes / prefilled title (new) |

## Engines exercised by fixture (API)
| Item | Fixture | Result |
|---|---|---|
| Scope include/exclude (inv. 121) | include 4.10, exclude 4.10.1 | excluded leaf absent — OK |
| Readiness bands (inv. 123), thin evidence | new mock, no evidence | band thin, silent rag/recall/practice — OK; display issue filed |
| Result attempt links/unlinks (inv. 124) | add role=result, then delete | result set then null — OK |
| Redo item (inv. 124) | question redo:true, then false, then delete | srs key x:<uid>:1 appears, then removed — OK |
| Start-by (inv. 121/§start-by) | 1-leaf topic test 3d, quiz 2d, mock 10d, real 30d | three born 'passed' — filed |
| Files dedupe by hash (inv. 150) | same PDF twice, other name | 'linked', alias kept — OK |
| Files skip report (inv. 153) | empty file | 'skipped: empty' — OK |
| Files text search (inv. 152) | 'Dijkstra' inside PDF | found with snippet after ~10 s indexing — OK |
| Scan → PDF | synthetic photo | 34 KB PDF added, toast — OK |
| Ink stroke/undo/redo (inv. 132, 134) | synthetic pen pointer events | saved, counted, undo/redo — OK |

## NOT checked (budget / environment)
- Trend and likelihood page and Playbook dialog visual judgement; recognition drill run; pack/set papers; print output.
- Import timetable dialog and goal templates dialog behaviour; milestone editing on a deadline.
- PDF viewer layers/attempts, pins, Clip to notes, Ask Kurenai (earlier auditor shot the viewer only).
- Share Target (needs installed PWA), camera capture (headless), Keep in my cloud / cloud sync of files and ink (signed out).
- Lasso, shape snap, text box, image tool, eraser modes, export PNG/PDF, two-finger tap undo, long-press tooltips (real touch needed).
- Kurenai marking/compare (network AI), Exam Room wake lock on device.
