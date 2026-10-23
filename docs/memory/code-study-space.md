---
name: code-study-space
description: Code (roadmap 5.3) core path COMPLETE — stages 1–4, Bridge B, capstones 1–4; released 2026-10-23 (a1bc5c5, kos-code-19); only deepening modules and tracks remain, when asked
metadata:
  node_type: memory
  type: project
  originSessionId: 3d5afeb1-07c4-4170-ae80-798d64481d12
  modified: 2026-10-15T18:17:00.286Z
---

Code, the fourth study space, shipped 15 October 2026: platform from design turn 26 plus unit 1 (release d8f90be, sw kos-code-1, gate 75 suites).

**Why:** the user asked to build the core/shell/design first, deploy, then write content "1 unit at a time".

**How to apply:**
- A new unit = one file `js/data/content/code-uN.js` (lessons via `lesson()`, `K.add({concepts,tasks,cards})`), loaded after `code-u1.js` in index.html; the whole unit ships at once (smoke75 A).
- Gate per unit: `node tools/smoke75.test.js` (notes contract, answers pass, starters fail, 20 card variations) and `node tools/cs_diff.mjs` (every program identical to .NET 10; needs `#:property InvariantGlobalization=false` + en-GB culture, already in the script).
- Interpreter gaps are fixed in `js/labs/cs-interp.js` when the differential disagrees (done so far: Math.Round, F-format ties, long, checked, CS0165/0128/0029/0220/0019).
- In the browser pane, unregister the service worker before testing local edits — it serves stale scripts.
- Not built yet: katas, project IDE, capstones 3–4, Rider/import, GitHub, .NET WASM runtime, Reports chapter (see docs/ROADMAP.md 5.3 status). Related: [[cs-paper1-nea]].
- Author lessons as layers via `K.lesson()`; `KOS_CODE.compose` folds only short text-only layers (user asked: never fold pages with code). Unit 2 shipped with the runner's static checks for CS0163/0139/1656/0173/0019.
- Unit 3 (ad8fce8) taught the runner named/optional args, out/ref on local methods, decimal scale and CS0161/0177/1620/1503/1737/1739/0136/8421. A pitfall that recurses for ever is fine (cs_diff maps .NET's "Stack overflow."), but a practice bug that loops for ever is not — .NET hangs to the timeout.
- The Code inspector has the status menu (user asked 15 Oct): auto from evidence, settable by hand.
- Capstones: one file `js/data/content/code-cN.js` via `K.capstone(id, {...})` (quiz, brief, starter, milestones of acceptance cases, rubric with one auto row, reference `answer` in the stage's language only); page `js/modules/codecap.js`; gate smoke76 + cs_diff. Capstone 1 shipped 6be96f1; after review (1b6d4de, kos-code-6) it has six steps — the quiz is the study quiz engine (`KOS.quiz.mountMCQ(..., {onFinish})`) and Brief & build is one 26k-style workspace (editor, Run/Tests/Problems tool window, Milestones window with the whole brief). See [[no-dead-space-layout]].
- Unit 4 (b33d2ab): the runner now has int[,] grids (flat CsList + dims), Sorted*, OrdinalIgnoreCase comparers, tuples copied by value, list element types (elT). .NET 10/C# 14 lets arrays call Sort/IndexOf/BinarySearch as Span extensions, so those are NOT errors.
- Unit 5 (0a35674): the runner checks the using directives .NET doesn't import implicitly (System.Text, System.Globalization, System.Text.RegularExpressions); cs_diff hoists usings above its culture line. ICU en-GB: N and P default to 3 decimals; de-DE uses a plain space before € and %. .NET 10 StringBuilder.Equals(string) is true by content.
- Unit 6: the runner has an in-memory disk (`req.fs` → final `fs`); content carries `fs` on listings/tasks/cards/capstones and cs_diff runs each such program in a folder holding the same files.
- 16 Oct 2026, from the user's topic list: added 5.9 dates/times (runner gained DateTime/TimeSpan/DateOnly/TimeOnly, formats per culture, Parse/ParseExact), 3-D arrays in 4.6, ReadLine null/empty in 2.8, and ten spine lessons in units 8, 9, 11, 12 (core path now 131; smoke73 counts it). When the user lists topics, check the spine (`js/data/code.js`) and put each gap in the unit it belongs to — a released unit gets the full lesson written then.
- Capstone 2 (gradebook, stage 2 reward 200/50/10): smoke76 runs answers with `x.fs || m.fs || c.fs` and bans classes/LINQ for stage 2.
- Bridge B + Rider workflow v1 (16 Oct): scaffold is REAL files in tools/code-projects/<folder>/ → `node tools/gen_code_projects.mjs` → js/data/content/code-projects-files.js; validator assets/code/validator/validate.cs; `node tools/validator_check.mjs` runs it end to end and refreshes tools/fixtures/bridge-report-*.json (smoke78's import matrix). Command retrieval cards (kind "command", accept patterns, label must not reveal the answer). Humanizer.Core 3.0.8 is broken (MSB4190): pin 3.0.10.
- Full C# runtime (units 7+, runner "wasm" for where:"sandbox"): tools/cs-wasm (Roslyn 5.0 in .NET 10 WASM) → `tools/build_cs_wasm.sh` → assets/code/runtime/<id>/ (gitignored; deploy builds it). Gotchas: must stay TRIMMED with TrimmerRootAssembly (untrimmed won't load in 10.0.10); no PDB (Task wait deadlocks) so Instrument.cs marks statements; worker must use addEventListener, never self.onmessage (dotnet hangs); boot at module load, not inside a message handler; Console.In can't be read. Check with `node tools/cs_wasm_check.mjs`. Phone not measured yet.
- cs_diff now runs every program in a temp folder (it used to drop unit 6's output files in the repo root).
- Scratch files in /private/tmp can vanish between sessions (lost once on a usage-limit pause): keep anything needed across turns in the repo.

**Progress standard (user, 2026-10-16):** a page glanced at is not progress. A lesson is "covered" only with Read notes + Ran listings ticked (or work passed); only covered lessons feed the Daily 20, the frontier and the skill map's "not proven". User studies linearly. Skill map = stacked foldable unit cards, equal-size status pills, aligned columns.

**Paused (user, 2026-10-16):** further units are written only when asked (weekly usage limits). Asked for and shipped 2026-10-17: unit 7, units 8 and 9, then capstone 3 ("complete stage 3"). Units 10–12 and capstone 4 show "Coming later". Shipped since: katas (#/code/kata), Code → GitHub v1 (fine-grained token, codegit.js, smoke79, invariant 110), kos-code-14. GitHub not yet tried against the real API — first real connect is the user's.

- Units 8–9 workflow (17 Oct): author each unit in parts in the scratchpad, concatenate into js/data/content/code-uN.js, and run a scratch checker (loads code via tools/lib/code-content.js, runs every listing/practice/task/card on loadWasm()) before smoke75 and cs_diff. Full-runtime gotchas: a listing with only type declarations fails with CS5001 (add a top-level statement); local functions cannot be overloaded; `-=` on a delegate makes it nullable (warnings). The error decoder (KOS_CODE.ERRORS) now covers the unit 7–9 codes.
- Capstone 3 (shop with plugins, where "sandbox"): authored as a real answer.cs + a template whose expected outputs come from running the reviewed reference on the runtime. smoke76 routes sandbox capstones to loadWasm() and refuses compiler warnings; codecap.js offers the runtime download and skips recording when nothing ran.

- Stage 4 (released 2026-10-23, a1bc5c5, kos-code-19): units 11–12 on the full runtime (U12 moved to where:"sandbox"); unit 10 in Rider (Rider form lessons, command cards) with project rp-u10-library (tools/code-projects/library-legacy); capstone 4 is a RIDER capstone: `K.capstone("C4", {project: "rp-c4-planner"})` — buildView reads the project's validator milestones, the project has reward:null and the capstone pays (300/75/+10). Validator 1.1.0 adds owntests/source/warnings/mutants checks; codeproj.js `EARLIER` maps old validator versions to their validate.cs hash so Bridge B 1.0.0 reports still import. `node tools/validator_check.mjs` runs all three projects (fresh/solved/weak) and refreshes tools/fixtures/{bridge,library,planner}-report-*.json. `node tools/code_unit_check.js 12.` checks one unit fast (skips Rider-form lessons).
- Browser pane gotcha: localhost:8123's service worker got stuck after clearing caches; open 127.0.0.1:8123 instead (a fresh origin).
- 2026-10-23 planning: every deepening project and track taster/projects/capstone is in docs/code-plan.md §3.5. User swapped Games to T5 (Systems to T8) and wanted Unity added; the Gacha Lab (pull simulator: odds engine, DP vs Monte Carlo, Unity banner, Python analysis sequel) is a T5 project. A Python path (PY1–PY3 core, PA Data analytics, PB AI/ML/LLMs, T3 narrowed to AI in .NET apps) is PROPOSED in §3.6 — awaiting the user's decision.
