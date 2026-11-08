# Creatives — feature inventory (top-up, 8 Nov 2026, build kos-redraw-1 @ 2e40f2b)

Creatives code is unchanged since the first audit (git diff 56b1a8c..HEAD touches no cr* file).
Sources: js/core/creatives.js, js/modules/creatives.js, crtopic.js, crwrite.js, crdrills.js,
crrefs.js, crsketch.js, js/labs/cr-refs.js, js/data/creatives.js, goals.js (cr-*), report.js
(creativeFacts), aitools.js (creatives_*), store.js (backup), search.js.
Fixture scripts: audit-evidence/2026-11/qa/cr2/*.js. "P" = presentation, "B" = behaviour.

## Curriculum (KOS_CR)
- 4 tracks: Art (A1–A13), Graphic design (D1–D8), Editing (E1–E8, none released), Writing (W1–W9)
- Released units: A1–A3, D1–D2, W1–W3 (24 lessons, 2 studies each, 4–6 theory cards, 5 notes pages, check of 2 rows)
- Study tools: sketch (Art; A1.1a/b, A1.2a, A1.3a offer Momentum), desk (Writing), drill:<type> (Design a-studies), outside (Design b-studies → Add your work)
- Unit projects: 8 (3 milestones each); 48 imported pictures (KOS_CR.ART)

## Routes / pages
| Route | P checked (sizes) | B checked | Result |
|---|---|---|---|
| #/subject/creatives desk (hero ring, track bars, hero path, Daily, Continue, analytics, Portfolio card, track path ‹ ›) | mac/ipad/ipadl/iphone, empty+dense, Dawn, shop theme | Continue vs path, Daily states | F-old desk hero, Daily paused; NEW Continue/path mismatch, rest-day card |
| Daily Creative states: today / paused / rest / clear / project / cards-only / phone split | paused (dense), rest (mac), today+phone split (iphone) | planDay fixture (days, minutes, rest, season) | NEW minutes dead, rest card; clear/project/cards-only verified by code only |
| Welcome card (empty account) | mac/ipad/iphone | Start A1.1 opens lesson | OK |
| #/creatives (Tracks) | 3 sizes + ipadl | unit rows open lesson; outline disabled | old 33% vs 0/3 holds |
| #/creatives/write (drafts list) | 3 sizes | New draft; rows | old: drafts never deletable holds |
| #/creatives/write/<id> Writing Desk (title, paper, count/target bar, autosave 600ms, Save to Log, Save as milestone) | mac, iphone | save twice, setup text saved, study draft duplication, milestone path (code) | old findings hold |
| Sprint card (words, minutes, start) | mac | code read | NEW word target never measured, focus lost after rerender |
| Versions (keep, compare/diff dialog) | mac | code read; no restore | QoL (restore) |
| #/creatives/drills index + 6 drills (kerning, pairing, hierarchy, palette, grid, measure) | 3 sizes + ipadl | each drill run end to end through Check/Next; summary; pay; drill from a study (@D1.2.a) -> Save and check | NEW pay with no interaction, pairing 32px; old Bold/hue hold |
| #/creatives/refs (kinds forms/perspective/mannequin/head, Next seed, Show construction, zoom) | 3 sizes + ipadl | prefs persist (code) | NEW lab zoom 24px on iPad; QoL seed back/entry |
| #/creatives/sketch/<lesson.study> (ink pad, timer, Momentum, reference "Another", step strip, Save) | mac, ipad, iphone | Momentum toggle -> toolbar Pen only + persists per device; timer present; NOT: synthetic ink did not draw, so Save-after-draw and leave-with-ink not exercised | old iPad portrait canvas holds |
| #/creatives/check/<work> (piece, beginner output, bar, ignore list, Yes/Not yet, note, Save, pass/not-yet bands, Promote…, One more rep, critique) | mac, ipad, ipadl, iphone, shop theme | setCheck pass/fail/pay-once fixture | NEW 32px choices, iPhone title clip + form far down, dead-end empty state; old blank-form overwrite + beginner picture hold |
| Critique dialog (What is sent, Cancel first, Send, stray, Keep, Pin tip) | mac | dialog opens, Cancel focused, 5 sections; stray() tested on 8 replies; Send NOT pressed (no network/provider in harness) | OK; stray is keyword-only (misses "vanishing point" for A2.1) — noted, not filed |
| #/creatives/log[/<id>] Practice Log + work dialog (Check, Promote…, Take out, Delete confirm) | mac, Dawn, ipad, iphone | delete via UI (confirm focuses Cancel; evidence recomputed), promote with edited fields, take out | old P1 dialog reopen/stack holds; QoL filters/undo |
| #/creatives/portfolio | 3 sizes | promote/unpromote fixture | OK |
| #/creatives/project/<unit> (milestones, Write it, Mark done/Undo, pay) | 3 sizes | 3 taps pay; undo/redo; footer | old pay-by-taps holds; NEW footer promises pay again |
| #/creatives/add[/<lesson.study>] (title, file, link, Save) | 3 sizes | 8 cases through the real form (none, link, bad link, .md, .txt to study, .png to study, file+link, pdf) | NEW input/validation finding; old bare form holds |
| #/creatives/settings (Your days, Minutes, Exam pause, Portfolio in month reports) | 3 sizes, Dawn contrast 4.99:1 | days/minutes/rest/all-off fixture | NEW minutes dead, last day silent; old day letters + gear on iPhone hold |
| #/ref/creatives/<lesson> lesson page: Notes (dwell 2.5 s / Next 1.5 s), Micro-studies (study cards, Start/Another rep/Do the check/Open in Log, tip), Theory cards (flashcards engine), Project tab/teaser, inspector (status, RAG, 4 checks, one skill) | 3 sizes + ipadl | dwell fixture (page 0 after 2.5 s, fast Next not counted, slow Next counted); Theory cards Good via UI | NEW P1 card check never synced; old inspector label gap, iPhone tab strip, spine clip hold |

## Model / evidence / pay (js/core/creatives.js)
| Item | Fixture | Result |
|---|---|---|
| markPage -> check 1 | read pages | OK |
| studies saved -> check 2 | addWork a, b | OK |
| check passed -> check 3; pay 8 XP/1 gold once per study | setCheck pass, pass again, fail then pass, delete + re-add + pass | OK (pay once; deletion keeps paid) |
| theory card held -> check 4 | KOS.srs.rate and the Theory cards tab | BUG: progress not updated (syncAll never called) |
| status Started/Completed | 1111 -> done | OK |
| logDrill 6 XP once a day per type | two kerning, one grid | OK; batch logged even unpaid; pays with no interaction (NEW) |
| markMilestone / project pay 150/40/+10 once | taps, undo, redo | pays for taps (old), footer (NEW) |
| removeWork, promote, editWork | via UI | OK |
| planDay: days, minutes, examPause, rest, nextDay | setPrefs fixtures | minutes unused (NEW) |
| stats / weekMinutes / cardsDue | desk tiles vs fixture | OK |
| firsts | code read | not drawn anywhere checked (desk shows no Firsts) |
| critiqueRequest / stray / keepCritique / pinTip / tip | request built, stray on 8 replies; keep/pin not exercised (needs a reply) | partly |
| files store (kurenai-os-creatives): put/get/del/all, export/import in full backup | code read store.js:577-580, :703 | verified by code only |

## Joins
| Join | Checked | Result |
|---|---|---|
| Goals cr-studies / cr-drill-days / cr-words | code read goals.js:749-768 | cr-words counts setup text and double saves (folded into old findings) |
| Reports creativeFacts + Portfolio strip (reportStrip) | code read report.js:644-665, reports.js:984; compute() not run (gather signature) | NOT run |
| Achievements (touch on addWork/promote/markMilestone) | overlay seen on desk ('Studies I') | OK |
| Assistant creatives_overview / creatives_portfolio | code read aitools.js:897-924 | OK (counts; log only on includeLog) |
| Global search | KOS.search.run | lessons yes, works/drafts no (NEW) |
| Focus (Start focus, sprint) | code read | weekMinutes reads parts by subject |
| Cloud merge of state.creatives | code read (keyed maps) | NOT exercised (no second device) |
