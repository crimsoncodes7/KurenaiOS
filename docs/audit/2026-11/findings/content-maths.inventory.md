# content-maths — feature inventory (top-up, 8 Nov 2026, sw kos-redraw-1)

Source of the inventory: `js/data/maths.js` (spine), `js/data/content/maths-*.js` and `bank-maths-*.js`
(KOS_CONTENT), `js/core/content.js` (block renderer, examFromWorked, CALLOUT_META), `js/core/figures.js`,
`js/engines/quiz.js`, `js/engines/flashcards.js`, `js/labs/worked*.js`, `js/labs/sims*.js`/`lab.js`,
`js/core/edits.js`, `js/modules/rag.js`, `js/modules/hub.js` (topic tabs, inspector), `js/data/intel.js`,
`tools/gen_data.py` (titles, spec text). Enumerated by `cm/inv.js`, `cm/beh1.js`, `cm/figs.js`.
Content files have had NO commit since the first audit (56b1a8c..HEAD is empty for every path above).

## 1. Leaves (89)
P1.1–P10.5 (64 Pure), S1.1–S5.3 (14), M6.1–M9.1 (11). Every leaf has notes, flashcards, quiz, exam.

## 2. Content entry keys and block types
- entry keys: notes, flashcards, quiz, exam (all 89); sims/gens wired externally (sims 19 leaves, generators 43 leaves; 40 leaves have neither)
- note blocks: string paragraph (1,144), worked (674), callout (415), h (368), page (344, 86 leaves; 3 leaves single-page: 6.2, 8.1, 8.4), table (139), ul (129), fig (124 + 60 inside worked steps = 184), kv (91), ol (37), p (17), steps (8)
- worked tags: exam (604), variation (35), example (33), check (2, 4.1); worked keys tag/title/steps/result/q/src
- callout kinds used: info, def, tip, warn, miscon, mnemonic, memorise, formula + undefined `key` (7)
- figure kinds: graph (x/y ranges, 127) and free diagram (w, 57); items fn/param/shade/line/poly/circle/arc/rangle/pt/text/vline/hline/ticks
- flashcards: [q,a] (901) and [q,a,schedKey] (641); 1,542 cards
- quiz: {q, opts, ans, why} 1,058 items (498 base, 560 bank)
- exam: derived from worked (592 parts), base, bank (298 items, 234 with parts/ctx), level AS (98), code (2)
- intel: 89 Maths entries (Chief examiner intel + Pitfalls on the Spec tab)

## 3. Topic page tabs (Maths)
Specification (content, guidance, intel, pitfalls, Your notes on this spec point), Notes N (paged; page select, ‹ ›, Next page), Flashcards N, Quiz N, Exam questions N, Handwritten, Simulations/Worked examples (when wired), Files; Working, Edit; inspector (status, RAG R/A/G, four checks, Recall record, Quiz best, Quiz attempts, Exam questions logged, Next review, Quick note).

## 4. Engines and controls
- Worked card: Copy, "Write it out" (opens ink drill), Given, Step N with mark codes, Answer
- Quiz (MCQ): options 1–4 (click/keys), Correct/Your answer verdicts, why, Next (Enter/→), Shuffle (question order), Retry, See your score, "Retry the N missed", head "score · best x/n"
- Exam questions: Reveal/Hide mark scheme, self-mark ticks per point, Awarded, "Log self-mark", Logged x/y, tally, answer pads (Type/Write/On paper), Mark with Kurenai (ink area)
- Flashcards: Study / Deck (N) / + New card, Type · Write · Think, flip card, Again/Hard/Good/Easy with interval previews, Shuffle, Restart, Card stats
- Worked generators (36 Maths): Generate working, Reveal next step, Reveal all, search
- Simulations (19 leaves): lab bar (inputs, sliders, toggles), Reset/Run/Step, Speed, stage, readout, Open full page
- Curriculum fork (KOS.edits set/reset) and its effect on the shipped notes
- RAG auto band from cards, quiz lastPct, tracker records

## 5. Behaviour checks done (fixtures → result)
see the coverage matrix in content-maths.json `coverage`.
