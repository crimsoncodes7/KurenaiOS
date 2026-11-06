# Study-core inventory (audit 2026-11, top-up on kos-redraw-1, slot 5)

Sources: js/modules/hub.js (KOS.views.subject 1956, KOS.views.ref 2364), js/engines/flashcards.js,
js/engines/quiz.js (+ exam engine), js/modules/review.js, due.js, cardstats.js, js/core/srs.js,
js/modules/assignments.js + js/core/assignments.js, js/modules/itdesk.js + js/core/itunits.js,
js/modules/editor.js + js/core/edits.js.

## Routes
#/subject/compsci · #/subject/maths · #/subject/it (subject desks; Code/Japanese/Mind/Creatives desks only for hero comparison)
#/ref/<sid>/<ref>[?tab] (topic page) · #/review (tab due|stats) · #/due (straight into the queue) · #/cardstats ·
#/personaldeck · #/assignments[/<id>]

## Subject desk (hub.js 1956-2363)
Hero (title, mastery ring, Start focus) · subject pills (KOS.subjects.group) · Weakest / Continue card ·
Course units (cards, "completed · started") · Deadlines · Subject analytics · Resources (Add a resource,
Remove resource? confirm) · "What do these mean?" · Deep revision content line · IT desk blocks (itdesk.js:
unit marks table, aggregate/qualification boundary chart, target).

## Spec spine (KOS.shell.tree)
expansion, current-location mark, compact drawer (<=1080 overlay), RAG dots.

## Topic page tabs (hub.js 2559-2570)
spec · notes (paged; Next page ›, page select, dwell) · cards (Flashcards) · quiz · exam (Exam questions) ·
ink (Handwritten) · worked (only when generators) · sim (only when sims) · files.
Tab fold "+N ▾" above 700px; phone single scroller. Working pane button, Edit button (study editor).

## Inspector
Topic status (Not started/Started/Paused/Completed select) · Confidence (1-5) · Progress checks (4) ·
Note pages · Quiz best · Pages written · Quick note (append-only, filed on leave) · Ask Kurenai ·
Calculator · booklet (Maths) · RAG / topic memory (KOS.srs.topicMemory).

## Flashcard engine
Answer modes: Type · Write · Think (state.ui.fcMode, per device) · Show answer (disabled until answered for
Type/Write) · ratings Again/Hard/Good/Easy with FSRS preview · keyboard (Space/1-4) · meter pips ·
Tracking history panel · Deck (new/learnt/due) · Edit card / Delete card (confirm) · Shuffle/Restart ·
Session complete + ONE sessions.log per finished batch (redo items excluded) · leech (8th lapse) → Rework.

## Quiz engine
MCQ answer, Correct/feedback, Next question (↵ hint), Previous, Shuffle, Retry, See your score, best/attempts
record (state.study.quiz), "Solid — review the misses" / "Worth another pass".
## Exam engine
Tariff filter, Your answer textarea / pad, Reveal mark scheme, tick mark points (A needs M), One mark more/fewer,
Log self-mark, Mark with Kurenai (needs connection + inkRead), Confirm all suggested.

## Review
Due today overview: hero (queue, subject split), Start review · all, Overdue first, Next 7 days, By topic
(Sort: most due / most overdue), Personal deck, Rework (Back in the schedule, Read the notes), backlog warning,
Today so far (Reviewed, Accuracy, Time). Run modes: all | overdue | sid:ref.
Card stats: retention target, exam-day target, charts (due forecast, reviews, recall), RAG table, fitted
parameters (optimiser preview, off < 1000 reviews), low-data state (<3 cards/3 reviews).

## Assignments
List with filters: subject (All + 7 subjects) · status (Any + 5) · deadline (Any/Overdue/Due today/Next 7 days/
No deadline) · sort (deadline/priority/progress/title); prefs per device state.ui.assignments.
Record: title, subject, type (7), priority (4), status (5), due date+time, estimate, effort log, alerts (5 options,
max 4), refs (topic picker), subtasks (add/toggle/remove, progress), notes, attachments (Files), countdown Pin/Unpin.
Detail actions: Focus on this, Complete, Submitted, Blocked, Edit, Delete.

## Study editor (editor.js)
Kinds spec/notes/flashcards/quiz/exam; blocks add/edit/reorder (KOS.ui.reorder), Spec column break, reset fork,
preview re-render; state.ui.editing reopens.
