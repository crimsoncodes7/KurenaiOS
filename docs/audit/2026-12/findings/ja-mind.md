# ja-mind (Japanese) — December 2026 audit, Batch 2

Slot 3, code `0c93408a` (sw kos-qol-5). 12 findings: 2 P1, 3 P2, 7 P3, no P0. The worst is one shared defect: KOS.jaRun.mount leaves an exercise live after it is graded, and the two callers without the session's once-guard count every press — a checkpoint can be passed and paid (60 XP · 15 gold · +5 HP) with every first answer wrong (JM-40), and the kana page records, logs and pays one answer once per Enter (JM-41). Phase 1's Japanese features work as specified (practice-only re-practice, leech recovery with Undo and re-flag, immersion through Focus paid by focusAward, lesson returns, checkpoint ✕ confirm, misses + '+ Log' on the end card) with gaps at their edges: the checkpoint guard covers ✕ only (JM-42), leech rows stretch the desk (JM-43), ✕ still goes to the desk (JM-45), a retry exit revives a finished run (JM-47), immersion readers not updated (JM-48). japanese.facets merge whole by `last` (FACET_PATH) so leechBase is safe; study-cleanup batch 7 touched no Japanese file and every lesson item resolves (28 lessons, 440 items). Baked audio: all 759 pack files exist and resolve.

## Findings

- **JM-40** P1 bug — A checkpoint counts every Check press: answer wrong, then retype (or pick the other option, or redraw) and press again, and the question scores right — Reading shows '200%', and a run whose every first answer was wrong passes and pays 60 XP · 15 gold · +5 HP
- **JM-41** P1 bug — Kana page: pressing Check or Enter again on one answer records it again — each press is another FSRS review of the same facet, another review-log row, another '+1 XP' and another 'Next ›' (5 presses: reps 5, 5 log rows, +5 XP, set '5 of 20')
- **JM-42** P2 bug — A checkpoint in progress is lost without asking when left by Back, the rail or any link: only its ✕ asks 'Leave the checkpoint?' (1D ja-mind#3), the page registers no KOS.view.guard
- **JM-43** P2 layout — Desk: each set-aside (leech) row in the Rework side card is ~156 px tall, so the row grid stretches Subject analytics with it — 253 px with no leech, 481 px with two, 717 px with four — and its eight tiles float in a mostly empty card (mac 1470)
- **JM-44** P2 bug — Lesson inspector 'Due now' and the lesson's Reviews tab count facets the queue holds back today: H1 just passed says 'Due now 10' and lists ten Writing facets as 'due' while Reviews has nothing due (KOS.ja.due() 0)
- **JM-45** P3 bug — ✕ on a lesson's session leaves to the desk, not the lesson: always on 'Practise again' (it has no results, so no confirm) and on a learn session before its first answer — 1D ja-mind#1 made only the end card go back to the lesson
- **JM-46** P3 copy — A Japanese miss logged with '+ Log' reaches the Error Log as internal codes and gives its answer away: 'あ (a) — missed R', topic 'k:あ', context 'R · a'; 'Turn into flashcard' then makes a card whose question already holds the answer
- **JM-47** P3 bug — Leaving a finished review session during 'Try the misses again' re-saves the finished run: the next visit to Reviews opens on 'Picked up · 30 answered' and the old end card instead of 'Nothing due right now' (and the ✕ warns 'kept and scheduled' about practice answers)
- **JM-48** P3 bug — Immersion is now logged through Focus (Phase 1) but three readers still look at the dead tally: the Immersion badge counts state.japanese.input (nothing writes it) and stays 'soon', the Today plan still drops Input as not in the app, and About to Study suggests 'Open the notes for Japanese and read the first heading' for a Watching session
- **JM-49** P3 bug — An unknown lesson in a learn route throws and bounces to Home (#/japanese/session/learn-bogus), while practice-bogus says 'Nothing to practise' and #/ref/ja/ZZ9 opens the desk
- **JM-50** P3 layout — Japanese settings: the side 'Licences & credits' card is stretched to the settings card's height (~460 px) around three lines of text, a mostly empty block beside the form (mac)
- **JM-51** P3 bug — Review session: after an answer is graded the input stays live, so a second Enter repaints the verdict — the card reads '✗ Wrong · It reads su' above 'Grade, from your answer · Easy' (the first answer is the one recorded)

## Coverage

Routes, dialogs and states:
- #/subject/ja (desk)
- #/japanese/path
- #/japanese/skills
- #/japanese/kana
- #/japanese/reviews
- #/japanese/checkpoints
- #/japanese/checkpoints/cp-H|cp-K (run)
- #/japanese/settings
- #/japanese/licences
- #/japanese/session/reviews
- #/japanese/session/learn-H1|H2|H3|1.1
- #/japanese/session/practice-H1|1.1
- #/ref/ja/H1|1.1|2.1 (Notes, Practice, Reviews tabs; inspector; Core/Media spine)
- #/focus (immersion field, About to Study, completion)
- #/errorlog (ja entry)
- bogus ids (learn-bogus, practice-bogus, ref ZZ9)

Dialogs and states: leave-session confirm, leave-checkpoint confirm (✕), Focus About to Study and completion, toast Undo (unleech, '+ Log'), learn pass / not passed / misses retry, review end card with misses and '+ Log' + Undo, practice end card, checkpoint pass / fail / weaker retake, resume after reload, daily cap reached, Rework with 0/2/4 leeches, empty states on Empty.

Sizes: mac, ipadl, ipad, iphone, split, slide (route sweep at all six on dense; Empty swept on iPhone and screenshotted on mac; runner and writing square on iPhone, Slide Over, Split View, iPad landscape).

Accounts: dense (mine) and Empty.

Not covered:
- Sample account (it carries no Japanese data, same as Empty for this area)
- the copy account (slot 7 not used)
- audio playback itself (headless): requests and files checked instead
- Speech recognition (sends to Google; not exercised)
- multi-device merge run live (reviewed in code: cloudmerge FACET_PATH)
- mining (no caller of KOS.ja.mine in this build)

## Phase 1 features exercised

- bk:ja-mind#1 practise a passed lesson: facets, ledger, governor and the review log unchanged after 20 answers (16 right). ✕ goes to the desk (JM-45).
- bk:ja-mind#4 leech recovery: unleech sets leechBase, back in the queue, Undo removes it, re-flags at +4 lapses; desk layout (JM-43).
- bk:ja-mind#5 immersion via Focus: field prefilled from the desk, 21-min stopwatch paid 24/2/4 by focusAward, desk shows 21 m Watching; stale readers (JM-48).
- 1D #1/#3: end cards go back to the lesson; checkpoint ✕ asks, Back/rail do not (JM-42). #2 misses + retry (retry is practice; JM-47 on leaving it). #4 'Hiragana checkpoint' named.
- U8 '+ Log' pills: entry created and Undone; content of the entry (JM-46).
- 1F page-ja: cold loads of the topic, sessions, checkpoint and kana routes render.
- study-cleanup batch 7: no Japanese file changed; all 440 items and 28 lessons resolve.

## November re-check

- JM-06: fixed — Media spine on #/ref/ja/1.1, then 1.2, H1, 2.1 all open; no throw, no bounce (spine stays 'media').
- JM-07: fixed — A review of an H4 item wrote check[3] 'Held in reviews' to the progress record (null → [F,F,F,T]).
- JM-08: fixed — Reload mid-review: one ledger entry (done:false, paid by difference), 'Picked up · 3 answered', finished as one entry. (Redraw renumbering is SY-35.)
- JM-10: fixed — Learn 1.1 asks every Reading facet first; Listening waits (sibling rule).
- JM-11: fixed — Kana W facets due today stay out of the queue after their R sibling was reviewed today (see JM-44 for the readers that ignore this).
- JM-12: fixed — A brand-new facet answered in 0.5 s grades Good (3), s 2.31.
- JM-13: fixed — H3 answered all wrong: 'Not passed yet', session entry 0 XP, no lesson pay, no doneAt, misses kept.
- JM-14: fixed — Phase 1 bk:ja-mind#4: set-aside rows, 'Back in the schedule' with Undo, leechBase re-flags after 4 more lapses (pure check 10/11/12 no, 13 yes). Layout issue filed as JM-43.
- JM-15: still open — Partly addressed: 'Input this week' now fills from Focus immersion; addInput still has no caller and the Immersion badge reads it (JM-48); Speaking switch and Licences lines unchanged (Phase 3).
- JM-16: fixed — Kana W shows its model only with no reps (practice of a passed lesson shows it for never-written kana); checkpoint Writing shows none.
- JM-18: fixed — Phase 1 bk:ja-mind#1: 'Practise again' runs the lesson's facets as practice; facets, ledger, governor and review log unchanged (verified).
- JM-19: fixed — Timeline says Calibrating with thin evidence.
- JM-20: fixed — cp-H draws a fresh seed per visit; Listening uses six distinct pairs; Writing shows no model.
- JM-21: fixed — ja-reviews / ja-lessons / ja-facets / ja-kana-held / ja-words-stable measure the ledger (56 passed = ledger 56; 2 lessons = 2).
- JM-26: fixed — Assistant has ja_ tools (aitools.js).
- JM-27: fixed — After the pass, an all-wrong retake keeps the passing rows and adds 'Last attempt · Reading 0% …'.
- JM-32: fixed — Unearnable badges are marked soon (Immersion still reads the dead tally: JM-48).
- JM-38: fixed — planDay leaves input/output out of the total (now stale since immersion exists: JM-48).
- JM-03: still open — Path checkpoint stones 24x24 and unit stones 28x44, Daily-minutes slider 129x16 on every touch size (Phase 3).
- JM-05: still open — Inspector still says '0 of 1 sessions' (Phase 3).
- JM-09: still open — Topic tab strip still collapsed on iPhone/Slide Over (ui.tab 29x44, Learn/Reference cut at 381 px on 375) (Phase 3).
- JM-23: still open — Kana chart columns past the left edge at 402 and 375 (Phase 3).
- JM-34: still open — Practice tab copy unchanged (Phase 3).

JM-01, JM-02, JM-04 are Mind/visual Phase 3 or MI's; not re-reported.
