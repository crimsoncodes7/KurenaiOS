# content-cs-it — feature inventory (top-up, build kos-redraw-1, HEAD f84962c)

Area: AQA 7517 Computer Science content (cs-p1-*, cs-p2-*, cs-m-*, cs-nea, bank-cs-*),
OCR IT content (it.js generated spec, it-f201-spec.js override, it-core/f201/f204/f206),
the shared content renderer (js/core/content.js) as it presents this content, and the
content-derived behaviour (examFromWorked, extend, merges/aliases, schedule keys, intel).
The quiz/exam/flashcard ENGINES' own UI (tally buttons, shuffle, retry, scoring records)
belong to study-core; they are exercised here only where content shape drives behaviour.

Sources read: js/core/content.js (renderBlocks 315-405, inline/markdown, LANG_NAME 70,
CALLOUT_META 49-57, extend 515, examFromWorked 535-572, copy handler 455-500),
js/engines/quiz.js (mountMCQ 53-187, mountExam/partBlock 199-380), js/core/store.js
(REF_ALIASES 324, renameRefs 350), js/core/srs.js (shippedKey 375), js/modules/hub.js
(flatten 28-56 incl. KOS_SPEC_FIX, renderIntel 3132), js/labs/sims.js WIRE, js/labs/worked.js
GENWIRE/register, js/data/intel.js, js/data/it-grades.js, js/data/it-f201-spec.js,
tools/smoke66.test.js NOT_EXAMINED, css/views/ink.css:300 (.k-n-writeout).

Scripts (all under audit-evidence/2026-11/qa/content-cs-it/): dump.js (jsdom dump of every
leaf + content), metrics.js, quiz.js, dupes.js, strict.js, cross.js, fit.js, fmt.js (carried
from audit 1, re-run on this build: outputs byte-identical), inv.js (new: structure/schema),
alias2.js (merge fixture), exam1.js/exam2.js (exam tally in the browser), ovf.js / sweep.js
(browser sweeps).

## 1. Specification trees
| item | what it should do |
|---|---|
| CS tree, 131 leaves after CS_MERGES | one leaf per teachable point, unique refs |
| IT tree (F200 F201 F202 F204 F206; F203/F205 excluded) | unique refs, clean spec text |
| KOS_SPEC_FIX (it-f201-spec.js, 15 F201 leaves) | replaces garbled generated F201 content/info at flatten |
| leaves with no content lines (F201.5.3 "NEA Units") | skipped by flatten (not a leaf) |
| Spec tab text (content/info) | readable bullet rows |

## 2. Content coverage per leaf
| item | expectation |
|---|---|
| every CS leaf has KOS_CONTENT | depth contract (smoke65/66) |
| IT leaves with content | F201, F204, F206 (to sit / NEA); F200/F202 done, spec only |
| NOT_EXAMINED (4.4.4.1) | says so on the page |
| content keys only on visible leaf refs (inv. 25) | no orphan keys |

## 3. Note block types (renderBlocks) and their use
page (826 CS / 148 IT), p, md, h (398/43), sec, ul (48/19), ol (137/1), kv (139/121),
table (500/49), code (152; langs csharp 114, text 14, sql 9, pseudo 6, asm 4, xml 2,
javascript/json/python 1), run (0 in CS/IT), callout (1103/450; kinds info 371, tip 366,
miscon 197, warn 187, def 172, mnemonic 146, memorise 95, formula 19 — all in CALLOUT_META),
diagram (34, opens a sim), worked (941: exam 801, variation 132, example 8, check 0),
fig (188), svg (0), steps (118/6). Inline: `code`, **bold**, *italic*, $math$/$$math$$ (KaTeX).
Copy button on code, callout, table, kv, steps, worked. "Write it out" on worked with >1 step.

## 4. Practice layers
| item | expectation |
|---|---|
| flashcards [q, a, key?] | non-empty, one fact once, schedule key stable (inv. 87), on-topic |
| quiz {q, opts, ans, why} | ans in range, 4 options, no duplicates, balanced answer position, useful why |
| exam {q, marks, ms, src, level, parts, code, note} | ms adds up to marks, one copy per past-paper question |
| examFromWorked (exam-tagged worked cards → items) | marks from src, ms from steps, AS level from src |
| bank extend (bank-cs-*.js) | concatenates practice, unions sims/gens |
| tariff filter (All / 1–2 / 3–5 / 6+) | counts per tariff |
| AS label (433 CS items) | "AS level · modelled on …" |

## 5. Links out of content
| item | expectation |
|---|---|
| sims auto-wire by subject+ref, WIRE extras (23 keys) | targets exist |
| gens (bin, float, bigo) and GENWIRE | targets exist |
| diagram blocks (34) | sim id exists, button opens it |
| intel.js (137 entries: CS 130/131, IT 7/87) | keys are leaves; Spec tab callouts |
| merges: REF_ALIASES (12 groups, 27 old refs) | stored state renamed at the store gate without loss |
| merged decks' whole-key cards | no schedule-key collisions |

## 6. IT grade data (it-grades.js)
unit D48/M36/P24, H019 108/96/72/48, H119 270/240/180/120 (inv. 26f).

## 7. Presentation sweeps
all note pages of all 181 leaves (CS 131 + IT 50 with content) at mac/iphone (audit 1) and
iPad landscape (this run): overflow, KaTeX errors, literal markdown; screenshots at mac,
ipad, ipadl, iphone; Dawn and one shop theme.

The coverage matrix (item → presentation → behaviour → result) is in content-cs-it.json
`coverage`.
