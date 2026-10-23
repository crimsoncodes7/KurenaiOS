# KurenaiOS roadmap

Everything still to build or deliberately deferred, in one place and in the
order it should happen. Written 27 September 2026, after the Graphite rebuild
shipped (`8ea878d`).

Sources:
- the Graphite review checklist (Tier C and the items set aside);
- `docs/ui-rebuild/PLAN.md` (M13, M14);
- `PROGRESS.md`, `CATEGORY6_PLAN.md` §10;
- the assistant-assets README;
- earlier sessions' notes.

Each item says what it touches and which invariants it moves. When an item
changes an invariant, rewrite the invariant in `CLAUDE.md` in the same commit.

**Legend**

| Mark | Meaning |
|---|---|
| **◆** | Take it to Claude Design first: there is no frame for it, and a guessed layout would be rebuilt later. |
| **◇** | One small frame would help; it can be built without one. |
| No mark | Engineering only; it follows existing frames and primitives. |

The Claude Design prompts for every ◆ and ◇ item are in
[design-prompts.md](design-prompts.md).

---

## Phase 1 — Tier C: new features on the current design

Build first. Everything here except the OOP IDE fits the Graphite frames
that already exist.

**Status (27 September 2026, branch `feat/tier-c-backend`):** the backend of
every item is built and gated: data, normalisers and migrations, the
`KOS.*` APIs, cloud-merge rules and the Assistant tools, with smoke57–62. What
remains is the views, built on those APIs from the Claude Design handoffs:

| Item | Backend (built) | View still to build |
|---|---|---|
| 1.1 | `KOS.spec` tree/search/resolve; `refs` on assignments, events, papers, Focus, sessions | `KOS.ui.topicPicker` and its five placements |
| 1.2 | F203/F205 removed by the generator; `KOS.itUnits`; `js/data/it-grades.js` (boundaries from the specification, p. 91); `KOS.hub.it` | the IT units panel on the IT desk |
| 1.3 | `KOS.edits.setDraft/appendSpec/fileQuickNotes`, filed on leave by `KOS.show` | the inspector's quick-note box |
| 1.4 | `KOS.edits.move/moveBy`, `setSpecBreak/specColumns` | drag handles, drop shadow, keys; the Spec renderer honouring a stored break |
| 1.5 | `KOS.media.shrineOrder` (synced state) | "Set order" on a tier |
| 1.6 | stopwatch and study-until; the per-10-minute rule; the idle watch; `state.ui.focusMini` + `clampMini` | the four-mode setup, the award tick, the draggable mini-player |
| 1.7 | `KOS.oop` gate, identity, validation, transpile, canvas view | the IDE (frames 19a–19f) |
| 1.8 | tools for all of the above plus pacing, reminders, assignments, notifications | — |

**Status (28 September 2026, branch `feat/graphite-part-2`):** every view in
the table is built from design part 2 (frames 15–23): the phone views, the
Focus modes and mini-player, the topic picker in its five placements, the IT
units panel, the drag pattern, the quick note, the Shrine's "Set order", the
OOP IDE (19a–19f), the lab system (20a, 20f overflow rule, 20g–20i), Dawn and
the 23 shop themes, and the cosmetics. Not merged or deployed. Left over:

- the per-simulation rebuilds on the archetypes (20b–20e) and Trace Lab's
  three-column layout (20f) — done on `feat/lab-archetypes` (see 3.3);
- the OOP IDE on a phone — done (12 October): the toolbar is two even rows
  (view switch and Add class; C# tab, Copy C#, Clear), a long class list
  scrolls inside its own box, and the C# tab's header keeps its buttons
  inside the card at 360px.

The design's second unlock route for a locked lab ("or finish two Focus
sessions", 20i) is dropped: the gold unlock stays the only one (invariant 2).

### 1.1 One topic picker, used everywhere ◇

- **What:** a dropdown instead of a free-text "related topic" box.
  - It is searchable and multi-select.
  - A level switch picks the unit, the parent topic or the leaf. For
    example: *Fundamentals of programming* › *Programming* › *Data types*.
  - Chosen topics show as chips.
- **Where:**
  - Assignments (related topics);
  - Exams & Papers;
  - Focus setup;
  - the Calendar study block (it links an assignment; it may also take topics);
  - Pacing's existing `refPicker`, which becomes this component.
- **How:**
  - A shared `KOS.ui.topicPicker` in `ui.js`.
  - `ref` becomes `refs[]` on assignments, papers and Focus sessions, through
    each owner's normaliser. The migration keeps the old single `ref`.
  - A unit-level or parent-level pick resolves to its leaves wherever progress
    is read.
- **Invariants:**
  - 33a: add every new `refs` array to `RECORDS[].refs` so the cloud merge
    re-keys it.
  - 81: never back-fill a leaf.
  - 4a: Focus payment is unchanged, and a session still logs one subject.
- **Tests:** smoke33/34 (assignments, Focus), smoke41 (merge re-keys), smoke49
  (Pacing picker), smoke56 (control parity).

### 1.2 IT units: marks, grades and what is still needed ◇

- **Given (27 September):** F200 51/60, F202 54/60; Year 1 grade Distinction.
- **What:**
  - F203 and F205 leave every statistic, the spine's progress and the IT
    desk. The spec tree itself is generated and is not edited.
  - F200 and F202 are archived as completed, with their marks.
  - A unit table on the IT desk shows:
    - each unit's mark, maximum and grade;
    - the grade boundaries from the specification;
    - the aggregate across the units being counted;
    - "marks needed for <target grade>": the minimum still needed across the
      remaining papers.
  - F201, F204 and F206 fill in as you sit them.
- **How:**
  - `state.itUnits` (per-unit status `sitting | done | not-taken`, marks,
    series) behind one normaliser.
  - The hub's IT statistics read it.
  - Boundaries live in one table in `js/data/`.
- **Invariants:** 26d (statistics are derived once, in `hub.js`) and 77 (a
  not-taken unit prints nothing).

### 1.3 Inspector quick note → Spec

- **What:** an open box in the inspector, just above Ask Kurenai.
  - What you type stays while you are on the topic.
  - When you leave the page it files into the topic's Spec tab as a dated note
    block, and the box starts empty next time.
- **How:**
  - A per-device draft in `state.ui`, like `ui.editing`.
  - On leave, `KOS.edits.set(sid:ref, "spec", …)` appends a `{md}` block with
    an `id`.
  - An empty draft writes nothing.
- **Invariants:** 89 says the study editor is the *only* surface that
  changes a topic's material. Rewrite it to name the quick note as the second
  one, append-only.

### 1.4 Editor: drag blocks to reorder

- **What:** drag a block by a handle. A drop shadow shows where it will land.
  Keyboard: move up and down with a key.
- **The Spec case:** Spec is drawn in two balanced columns, so the columns are
  derived rather than stored. Two options:
  - **Decided:** store an optional column break (one block id) in the Spec
    fork, and let dragging across the columns move that break. Without a
    stored break the columns keep balancing themselves.
- **Invariants:** 87 (a card keeps its SM-2 key through a reorder) and 88
  (rows keep their ids).
- **Tests:** smoke51.

### 1.5 Shrine: your order for tied scores

- **What:** when several titles share a score (for example five tens), a
  "Set order" control on that tier opens a short drag list. The podium and
  the ledger follow it.
- **How:**
  - A per-score order list in media kv (`shrine.order.<score>`), next to the
    hero picks.
  - A new title with that score joins the end of its tier.
- **Tests:** smoke12 (Shrine).

### 1.6 Focus: stopwatch, "study until", and a movable mini-player ◇

- **Stopwatch mode:** counts up and stops when you press Stop.
- **Study until HH:MM:** the countdown is derived from the clock.
- **Mini-player:** the minimised player can be dragged and resized. Its place
  and size are saved per device and it snaps inside the viewport. The phone
  dock is unchanged (invariant 75).
- **Invariants:**
  - 4a (**decided**): a base award for every full 10 minutes, the same rule
    for the stopwatch and the Custom timer. Pomodoro keeps its current
    award. Rewrite 4a with the rule and update smoke34.
  - 4b, 4c: reload banks the stopwatch the same way.
- **Tests:** smoke34.

### 1.7 The OOP sandbox as an IDE ◆

- **What:** most of the screen is given to the sandbox.
  - A file tree of classes on the left.
  - A code editor in the middle.
  - A toggle between Code and Diagram.
  - The diagram is an infinite canvas: pan, zoom and fit, with the class cards
    and inheritance arrows.
  - Copy C# and Clear keep working.
- **How:** the view lives beside the model in `js/labs/oop.js`;
  draft-until-first-edit stays (render purity, smoke56).
- **Built** from frames 19a–19f: file tree (drag a file onto another to set
  its base; a cycle is refused), class editor, C# as a side panel or a tab,
  the diagram canvas with minimap, and a status bar.

### 1.8 Assistant: tools for everything added since Category 6

`aitools.js` has no tools for most of what came after it.

- **New tools:**
  - **Pacing:** read the week and the braid verdicts, tick a row or a lesson,
    move a carried row "→ here", add a row. Every one is a write through
    `KOS.pacing` with zero Governor traffic.
  - **Reminders:** list, add, complete.
  - **Assignments:** list, add, update, including subtasks.
  - **Notifications:** list, mark read.
  - **Curriculum edits:** propose notes, spec or flashcard edits through
    `KOS.edits`, shown on the approval card.
  - **Collection's newer fields:**
    - Books volumes and VN chapters;
    - quote logs for every medium (only `vn_add_quote` exists today);
    - the x.x/10 score.
  - **Shrine order**, once 1.5 exists.
- **Also:**
  - Refresh the system prompt's feature map.
  - Check that the "I have not made any modifications…" reply is gone from
    tool-free answers.
  - Re-check Gemini's Markdown (lists, code, line breaks) against the
    renderer's allowlist.
- **Invariants:** 71 (never read credentials, sessions or audits); a
  consequential write stays gated.
- **Tests:** smoke21–28.
- **Follow-ups done (12 October 2026):**
  - **"Bad tools list."** From late September every online request failed:
    the registry had grown to 115 tools against `ai-chat`'s limit of 96, a
    check that runs before anything is logged. The limit is now 128 (the
    most DeepSeek accepts), the client mirrors it (`LIMITS.cloudTools`),
    ranks its tools by the request's category and view and cuts past it,
    and smoke27 holds the two limits equal. The refusal names the count.
  - **The model.** Google retired `gemini-3.5-flash` on 10 October
    (requests redirect to 3.6 Flash). The default is `gemini-3.8-flash`
    (stable since 2 September, priced like 3.6); a stored retired id moves
    to it on read, and so does the untouched old DeepSeek generation
    default — this deployment holds no DeepSeek key, so it could never
    answer. "Check availability & usage" now lists the models the server
    key can call and names a routed model the provider no longer offers;
    the model fields suggest the live list.
  - **Feature map** gains the labs, with `labs_list` (every lab, its area,
    archetype, lock and price) and `app_navigate` to a lab, the Trace Lab,
    the OOP sandbox and the seven views it could not reach.
  - **The no-change tail** is also stripped in the shapes Gemini 3.x
    writes it (bold "Note:", quoted, "No changes made.", "Nothing in your
    app was changed."), with a rule that only introduced it (smoke22).
  - **Markdown:** `user_id`-style names and `2 * 3 * 4` are no longer
    emphasis (CommonMark flanking), and the `<br>` Gemini puts in table
    cells is a line break — still the only tag that is not text (smoke29).

---

## Phase 2 — Finish M14: the rebuild's clean-up

Engineering only. Do it before the design work in Phase 3, so the
new themes and the phone layout build on a clean base.

**Status (27 September 2026, branch `feat/m14-cleanup`, stacked on
`feat/tier-c-backend`):** done (the optional sample covers were dropped).

- The token bridge is gone: every reader uses the Graphite names, and
  smoke15 fails if a legacy token is defined or read again.
- `mobile-shell.js`, `figures.js` and `worked-extra.js` are rebuilt and in
  `tools/ui-migration.json` (the 77 figures are pixel-identical).
  `ui-hooks.js` is deleted; the two hooks it still derived (the Collection
  workspace tabs, Review's tabs) are explicit. smoke55 refuses the file.
- `tools/mobile_audit.mjs` no longer touches `.tree-closed`.
- `tools/visual_audit.mjs` passes against Graphite. Its pre-Graphite
  expectations (hero heights, the Governor's and Shrine's compositions, the
  share card's shape, the backup buttons, Help's search) now read the design
  tokens or the frame they came from.
- Fixed on the way:
  - Home's transient overflow from the Collection desk's meta line;
  - the page header squeezing its title beside the actions on a phone;
  - a four-tab switcher pushing the page sideways at 390px;
  - the Goals grid's fixed 352px minimum;
  - Home's level line and week-plan head running off a phone;
  - the Collection status key and the Mangaka toolbar spilling;
  - the profile chip overflowing the icon rail between 700 and 1080px;
  - the empty Assistant drawer clipping its composer on a short phone;
  - the Budget Planner's "PRIORITYITEM" header collision and the
    "Visual Novels" chip wrapping;
  - the Compare dialog's footer gap (the note now stands apart on the left).
- **Left for the phone design (3.1):** at 360–390px, the tab strips on
  Exams & Papers, the Budget Planner and the Shrine, and the Governor's
  four tabs, are
  bare sideways scrollers, which the responsive audit counts as findings. A
  wide code block in notes scrolls sideways too, which is normal for code.
  Whether these wrap or become `KOS.ui.scroller`s is a design call.
  - **Done (12 October): scrollers.** The three strips are the edge-marked
    tab scroller (`KOS.ui.tabs({edge})`, design 15n) and the Governor's
    two-tab switch fits. The last finding, a notes table wider than a
    phone, now sits in the shared scroller (`content.js` `scrollTables`,
    run by `typeset`), with tighter cells below 700px; a table that fits
    shows no arrows and is no tab stop. The audit at 390 and 360, Graphite
    and Dawn, reports 0 findings (52 before).

- **The legacy token bridge:**
  - `css/tokens.css` still aliases `--bg0`, `--panel`, `--text2`, `--kurenai`,
    `--sans` and the rest for the labs, charts and figures.
  - Move those readers to the Graphite names, then delete the bridge.
- **Migration coverage:**
  - `mobile-shell.js`, `figures.js`, `worked-extra.js` and `ui-hooks.js` are
    not in `tools/ui-migration.json`.
  - Rebuild or confirm them, then retire `ui-hooks.js` (the legacy-class
    bridge) once nothing emits a legacy class.
- **Audit drift:** `tools/mobile_audit.mjs` still toggles the retired
  `.tree-closed`.
- **Re-run the release audits against Graphite:**
  - the full breakpoint and device matrix;
  - `tools/visual_audit.mjs`.
  - The Category 7 numbers in `PROGRESS.md` predate the rebuild.
- **Sample covers:** dropped (12 October). The Sample account keeps its
  placeholder tiles; the responsive audit seeds its own cover images.

---

## Phase 3 — Design-led work (Claude Design first)

These are the big deferred extras. None has a frame, so each starts in
Claude Design and comes back as a handoff, the way Graphite did.

### 3.1 Phone views ◆ — **the most valuable next design**

- **Why first:** the handoff was desktop-only (1280px). Below 700px the app runs
  the old composition on the new shell, and it works but is not designed.
- **Frames needed:**
  - **The shell:** bottom tabs, More sheet, search sheet, header.
  - **Home.**
  - **A topic page:**
    - spine drawer and inspector sheet;
    - tabs;
    - flashcards and quiz;
    - the study editor on a phone, or read-only.
  - **The Focus dock** and running state.
  - **Calendar:** day and agenda.
  - **Reminders.**
  - **Pacing:** week and braid.
  - **A vault:** grid and filter sheet.
  - **The record editor as a full sheet.**
  - **The Assistant drawer.**
  - **Governor status.**
- **Contracts that must survive:** invariants 40, 58 and 72–75. Mobile moves
  canonical controls, never clones them. There are five breakpoints only.
- **Status (28 September):** built from frames 15a–15n. The responsive audit
  at 390 and 360px, both Graphite and Dawn, reports no spill and no cut text.

### 3.2 Dawn, the shop themes and the cosmetics ◆

- **Dawn:** a light companion to Graphite with equivalent hierarchy
  (invariant 79).
- **Shop themes:** 25 theme items, 23 of them to design, all as semantic-token
  overrides in `css/themes.css`, with swatches synced to `governor.js`.
- **Cosmetics:** the 4 profile frames, 3 Books shelf skins, 3 shrine styles, and
  the share-card finish.
- **Retire leftover item kinds:** 4 banners and 6 seals are still defined
  but are no longer sold or shown.
- **What to ask Claude Design for:**
  - Dawn as a complete token table, like Graphite's.
  - One specimen board showing all 23 themes against the same three
    surfaces (Home hero, a card, a chart).
  - A second board for frames and skins.
- **Invariants:** rewrite 26a when Dawn ships (the default may stay Graphite;
  your call).
- **Status (28 September):** Dawn, the 23 themes (frames 21a–21h) and the
  cosmetics (frame 22) are built; 26a is rewritten. The share card keeps the
  version built in review B and takes the new finish on top of it.

### 3.3 The labs ◆ — deferred at your request during review

- **The problem:** many simulations look poor, and some overflow their stage
  (Linked List, Binary Tree). The same applies to Trace Lab and Worked
  Examples. There are about 55 simulations across `sims.js`, `sims-cs.js` and
  `sims-maths.js`.
- **What to ask Claude Design for:** a *lab system* rather than 55 frames:
  - the stage and its fixed aspect;
  - the control bar;
  - how a data-structure diagram draws (nodes, pointers, highlights, overflow
    → pan or zoom);
  - a function plot;
  - a step trace;
  - the worked-example step list.
  - Three or four archetype frames cover every sim.
- **Then:** rebuild the sims per archetype, in batches.
- **Status (28 September):** the lab system from design part 2 is built —
  area rail and grouped index, the shared sim header, the locked state, the
  embedded lab in a topic's Simulate tab, the stage overflow rule (fit to a
  70% floor, then pan with a zoom chip) and the worked-example steps. The
  per-sim archetype rebuilds are still to do.
- **Status (12 October 2026, branch `feat/lab-archetypes`, not merged or
  deployed):** every simulation is rebuilt on `js/labs/lab.js` — one SVG
  stage, the overflow rule, the transport and the readout — by archetype:
  20a diagrams and algorithms (list, BST, hash table, dictionary, sorting,
  searches, RPN, recursion), 20b graph (Dijkstra · BFS · DFS on one
  editable graph), 20c plots (all 15 maths sims and seven more), 20d bits
  (register, floating point, codes, bitmap, error checks, subnet, bases,
  both logic labs), 20e machines (Turing, FSM, fetch–execute) and the 20f
  Trace Lab (code · structure · trace). Left as text sandboxes, outside the
  archetypes: BNF, compression, cipher, SQL, regex, LMC and the NEA tools.
- **Phones (12 October):** below 480px of stage the viewBox closes in on
  what a sim drew (the crop only grows, so stepping never jumps the
  stage): registers, codes, square plots, recursion and the logic gates
  draw 1.4–2.8× larger. `lab.narrow()` lets a sim lay itself out for a
  phone: floating point stacks its exponent under the mantissa, and
  subnetting draws each address as two rows of 16 bits. The Trace Lab's
  structure column, which had collapsed to zero width below 700px, now
  stacks under the code. Labs that use the whole frame (graphs, wide
  plots, the Turing tape) are unchanged.
- **The text labs (12 October):** the eight that were not on the system
  are now its TEXT kind (`KOS.lab.create({work})`): the editor and its
  output fill the stage's column as panes, the readout beside them works
  as it does for a drawn lab. BNF shows the leftmost derivation; SQL its
  query plan; LMC assembles once into frames the lab transport replays
  (Reset · Run · Step, the counter, speed); compression names the winner;
  regex lists each match; the NEA checker and estimator read their totals
  in the readout (a verdict is a card on a phone). The cipher's frequency
  chart is SVG in theme tones — the last canvas a lab drew, so
  `KOS.sims.canvas`/`COL` are gone. Code surfaces show `>=` as typed
  (ligatures off).
- **Still small on a phone:** the labs that fill the whole frame — Dijkstra
  and BFS/DFS, binary search, error checking, the bitmap, the Turing
  machine, fetch–execute and the wide plots. Each would need its own
  `lab.narrow()` layout, as floating point and subnetting have.

---

## Phase 4 — Content

- **Statistics S1–S5 and Mechanics M6–M9 at full depth**, the same way as Pure
  P1–P10:
  - paged notes;
  - Edexcel-modelled worked examples with M1/A1/B1 marks;
  - inline `{fig}` diagrams;
  - an exam toolkit per section;
  - exam items derived from the worked examples.
- **Starting point:** the earlier S1–S2 draft sat in a session scratchpad that
  no longer exists, so this starts from `maths-applied.js`.
- **Pace:** one spec section per commit, each followed by the smoke gate
  (smoke50 counts).
- **Status (1 October 2026, released as `fdc954a`):** Statistics is done and deployed —
  `maths-stats-s1.js` … `s5.js`, 14 leaves, 64 pages, 137 worked examples,
  125 derived exam items, every number checked with scipy; smoke63 guards
  it. Mechanics was renamed from S6–S9 to **M6–M9** first (Paper 3 sections
  6–9 keep their numbers; the "S" read as Statistics), with stored state
  migrated at the store's gate.
- **Status (1 October 2026, released as `9eac539`):** Mechanics is done and deployed —
  `maths-mech-m7.js` (M6.1, M7.1–M7.5), `maths-mech-m8.js` (M8.1–M8.6) and
  `maths-mech-m9.js` (M9.1): 13 leaves, 59 pages, 125 worked examples (every
  Mechanics question in the Topic Practice packs, Specimen to June 2025),
  91 derived exam items, 46 force, motion and projectile diagrams, every
  number recomputed. `maths-applied.js` is retired; smoke63 guards both
  halves. Phase 4 content is complete.
- **Computer Science at full depth (2 October 2026, released with service
  worker `kos-cs-depth-1`):** both AQA papers and the NEA.
  - Paper 2 (4.5–4.13): `cs-p2-*.js`, 88 leaves, 419 pages, 653 worked
    examples, 600 derived exam items; smoke65 guards it.
  - Paper 1 (4.1–4.4): `cs-p1-*.js`, 63 leaves, 311 pages, 312 worked
    examples, 226 derived exam items, 100 C# listings (every one compiled
    and run under .NET 10); smoke66 guards it.
  - The NEA: six project-guide leaves (`cs-nea.js`, NEA.0–NEA.5 following
    the AQA criteria) and two free labs in a new "NEA project" area — an
    objective checker and a mark estimator (`js/labs/nea-tools.js`).
  - Every pre-rewrite CS content file is retired.

---

## Phase 5 — New features (asked for 12 October 2026)

### 5.1 Reports: the week, month, term and year in review ◆

- **Status (12 October 2026):** designs in (`design_handoff_kurenaios_reports`);
  the build follows [`reports-plan.md`](reports-plan.md), decisions A–D taken
  as recommended. Phase 1 (collecting the history: the media journal,
  AniList tags/country/length and VNDB language, awards on session
  entries, the Assistant tally, boundary snapshots) is built (smoke68,
  invariants 99–101). Phase 2 (periods, the facts builder with the zero
  and evidence rules, template words, saving at period end and the
  backfill) is built (smoke69, invariant 102). Phase 3 (the Reports page,
  the weekly report and its Study, Focus and plan, and Collection
  overviews, low-data tiles, phone, the `reports` bell kind) is built
  (smoke70, invariant 102a). Phases 4 and 5 (Kurenai's words; the story
  player, share card and export, the Home card and search) are built
  (smoke70, invariants 102b–102c) and released with 1–3. Phases 6 and 7
  (months, terms and years; replication to `kos_reports` and the audits)
  are built (smoke71, smoke72, invariants 102d–102e). Voice actors and
  creator portraits (decision C) remain deferred.

- **What:** a report like Claude's *Reflect* page, but across the whole
  app — Study, Productivity, Collection, the Assistant and the profile
  (Governor) — for four periods, each deeper than the last:
  - **Weekly:** the headline numbers and what moved — study time and
    sessions, cards reviewed and recall, topics touched, Focus blocks,
    the plan's ticks and carry-overs, tasks and reminders done, what was
    watched/read/played, XP, gold and the streaks.
  - **Monthly:** adds trends against the previous month, the busiest day
    and hour, subject balance, mastery changes by unit, the Collection's
    completions and score spread, the Assistant's use.
  - **Termly** (the plan's school terms): adds the plan against class
    (ahead/aligned/behind from the braid), exam and paper results, IT unit
    marks, the weakest and strongest topics, Focus habits.
  - **Yearly** (the academic year, September–August): adds the long view
    — month-by-month charts, every grade and paper, the year's
    Collection, records and milestones.
- **The shape (from Reflect):** a one-line headline, a short narrative
  paragraph, a stat row (most active day, peak hour, totals), an activity
  chart with a metric toggle, a "what it was about" bar by area, then one
  card per domain. Each section links to the page it summarises.
- **Two ways to write the words:**
  - **Template** (always available, offline, free): sentences built from
    the numbers by rule — the default, and the fallback.
  - **Kurenai** (optional): the Assistant writes the headline and the
    narrative from the report's AGGREGATES only (never raw notes, titles
    or messages it does not need), read-only, as one metered request; the
    text is saved with the report and can be regenerated.
- **How:**
  - One derivation module (`js/core/report.js`, `KOS.report.build(period,
    range)`) that READS the existing single sources — the session ledger,
    `KOS.hub` statistics (invariant 26d), SRS, pacing, the tracker,
    `KOS.itUnits`, the Collection's indexes, the Governor's ledger,
    `kos_ai_usage` — and returns plain data. Nothing new is recorded.
  - Saved reports (the data snapshot plus any generated text) so a past
    week reads as it was; a "report ready" notification on Monday morning
    / the 1st / a term's end, built on the scheduled-message ticker.
  - A Reports page (and a Home card for the latest), plus export through
    the existing share card or as a file.
- **Invariants:** zero Governor traffic; derived, never a second
  dataset (26d, 82); invariant 77's zero rule; invariant 76's evidence
  floor for every chart; the Assistant's privacy line (71, 71a).
- **Design first:** frames for the four depths, phone included.

### 5.2 Scheduled messages — done (12 October 2026)

- The Assistant's **Scheduled** tab and the `schedule_*` tools: a prompt
  Kurenai sends for you at a time on chosen days ("Tell me the plan for
  today", 07:00, weekdays). It runs while the app is open, or on the
  first open later that day; read-only and isolated from the live
  conversation; the reply lands in its own conversation, on the schedule
  and in the notification centre (kind `assistant`), with a device alert
  where allowed. A run is claimed (synced) before the model is called, so
  two open devices do not both send it. `js/core/aischedule.js`; smoke27.
- Sending while the app is CLOSED is parked below: it needs a server.

### 5.3 Code: a C# study space ◆ (asked for 13 October 2026)

> **Status (23 October 2026): the core path is complete.** Stage 4 —
> unit 10 (testing and design, in Rider, with its project *The Lending
> Library*), unit 11 (async, events and I/O) and unit 12 (data structures
> and algorithms), both on the full runtime — and capstone 4, *The Revision
> Planner*, a four-project service built in Rider whose build is its
> validator milestones. The validator is 1.1.0 (own tests, source checks, a
> warnings ceiling and planted bugs); reports from 1.0.0 are still
> accepted for Bridge B. Left: the deepening modules and the tracks.
>
> **Status (15 October 2026): the platform and unit 1 are built** from the
> Claude Design handoff (turn 26). In the app:
> - Code is the fourth subject (`KOS.subjects`, the Sky `--code` hue in
>   every theme), with its desk (26a), curriculum map (26b), lessons on the
>   shared topic page with Learn and Reference, runnable listings and an
>   evidence inspector (26c–26d), the Practice tab (26e), the task editor
>   with every result state (26f), retrieval with derived grades (26h), the
>   skill map (26i), settings (26r), track pages (26t) and the phone (26u–26v).
> - The in-app runner (`js/labs/cs-interp.js`) in a sandboxed worker, held to
>   .NET by `tools/cs_diff.mjs` (245 of 245 programs identical).
> - Units 1–3 at full depth: 25 lessons, 51 tasks, 25 retrieval cards
>   (1,062 of 1,062 programs identical to .NET).
> - Capstone 1, the text adventure engine, on the capstone checkpoint (26l):
>   six steps — the quiz (the study quiz engine), brief & build in the 26k
>   workspace (editor, tool window, Milestones window with the brief) against five milestones of
>   acceptance tests, rubric, the Kurenai review's What is sent, write-up and
>   result (1,073 of 1,073 programs identical to .NET). Stage 1 (R1's
>   content) is complete.
> - smoke73–76 (runner and checker, pay and evidence, the content gate,
>   capstones); invariants 103–108.
>
> - Unit 4 (collections: arrays, List, Dictionary, HashSet, queues and
>   stacks, 2-D arrays, tuples, sorting and searching): 11 lessons, 22 tasks,
>   10 retrieval cards; 1,445 of 1,445 programs identical to .NET.
>
> - Unit 5 (text: immutability, Split and Join, formatting, TryParse,
>   StringBuilder, culture and comparison, characters and Unicode, a first
>   look at regular expressions): 8 lessons, 16 tasks, 8 retrieval cards;
>   1,730 of 1,730 programs identical to .NET.
>
> - Unit 6 (files, exceptions and debugging, on an in-memory disk the
>   runner and the .NET differential share): 9 lessons, 18 tasks, 6
>   retrieval cards; 2,045 of 2,045 programs identical to .NET.
>
> - Topic gaps closed (16 October 2026): 5.9 dates, times and durations
>   (`DateTime`, `TimeSpan`, `DateOnly`, formats, parsing; 2 tasks, a
>   card), three-dimensional arrays in 4.6, empty and ended input in 2.8;
>   ten lessons added to the unwritten units — 8.5 interface or abstract
>   class, 8.8 value and reference types (the stack and the heap), 8.9
>   operator overloading (a vector type and the dot product), 8.11
>   aggregation and composition, 9.5 higher-order functions, 9.6 extension
>   methods, 11.2 binary files, 12.2 bitwise operators, 12.9 Reverse Polish
>   notation, 12.13 Dijkstra and A* — so the core path is 131 lessons.
>
> - Capstone 2, the gradebook from a CSV: five milestones over three files
>   on the in-app disk (clean, messy, empty); stage 2 is complete
>   (2,088 of 2,088 programs identical to .NET).
>
> - Binary files (16 October 2026): lesson 6.10 — bytes, encodings,
>   `File.WriteAllBytes`, `BinaryWriter`/`BinaryReader`, hex dumps, file
>   signatures, XOR — with the runner's `byte`, `FileStream` and the file
>   locks .NET keeps on macOS and Linux; the core path stays 131 lessons
>   (11.2 moved here).
>
> - Bridge B and the Rider workflow v1: eight lessons (the SDK and Rider,
>   the dotnet CLI, solutions and NuGet, the debugger, Git, GitHub, docs,
>   validation) with command retrieval cards; the Bridge project "Hello,
>   Kurenai" (five milestones) exported as a zip made on the device,
>   validated by `assets/code/validator/validate.cs` (SARIF, TRX, scripted
>   runs, Git, protected-file hashes) and imported through the §9.4 checks
>   with a preview (26m–26n). Spike V passed on macOS; Windows, Linux and
>   CI-verified evidence remain.
>
> - The prerequisite for units 7+: the full C# runtime (Spike W passed —
>   unit 7 is the boundary). Roslyn and .NET 10 in WebAssembly, an optional
>   11 MB download kept offline, in a worker with no network, nullable
>   warnings shown, 26 of 26 stage 3–4 programs identical to native .NET;
>   `cs_diff` runs units 7+ content through it. A real-phone measurement is
>   still owed.
>
> **Next, one unit at a time:** stage 3 (R3), with katas,
> in-app projects, Rider, GitHub and the .NET runtime (R2–R3) as planned in
> code-plan.md §12. Not built yet: 26g's runtime download, 26j–26k and
> 26m–26q (katas, the project IDE, Rider hub and import, export and
> portfolio, GitHub, checkpoints) and the Code chapter in Reports.

> **Plan:** [code-plan.md](code-plan.md), revision 2 (13 October 2026). It
> supersedes the details below wherever they differ.
>
> **Curriculum:** a core path (stages 1–4 plus Bridge B, about 131 lessons)
> with optional deepening modules (D1–D6) and tracks (T1–T9: persistence,
> Avalonia UI, AI/ML/LLMs, web and more).
>
> **Notes:** a layered long-term reference with a depth contract.
>
> **Running code:**
> - Units 1–6 run on the in-app interpreter.
> - WebAssembly takes over from unit 7, or from unit 8 if Spike W says so.
> - Real-IDE work uses a Rider workflow: a validation script whose JSON report
>   is imported as evidence.
> - The optional "Kurenai Programming" GitHub repository uses API commits,
>   with an outbox.
>
> **Rewards:**
> - A task pays on its first pass only, with +3 HP.
> - Phone tasks are for units 1–3 only, at a reduced reward.
>
> **Releases:** R1–R4 are the initial release; the tracks follow, one per
> release.
>
> **Design:** [prompt 10](design-prompts.md), frames 26a–26x.

- **What:** a fourth space beside Computer Science, Maths and IT, for
  programming alone. It is built like the general subjects (a spine of
  units and topics, notes, flashcards, quizzes, the same status/mastery
  bands, Focus and the topic picker all work on it) and adds what a
  programming course needs and an exam subject does not: a curriculum from
  the first `Console.WriteLine` to advanced C#, code that is run and
  checked in the page, a daily task, a weekend project, capstones at
  checkpoints, and retrieval that makes the early skills come back.
- **Not the A-level:** AQA Computer Science stays as it is. This space
  teaches the language and the craft; each lesson that overlaps a Paper 1
  topic links to it both ways (the same cross-link the OOP sandbox has).

**The curriculum** (authored, about 12 units, each ending in a checkpoint):

| Stage | Units |
|---|---|
| Foundations | 1 Hello, values and types · 2 Decisions and loops · 3 Methods and scope |
| Working with data | 4 Arrays, `List<T>`, `Dictionary`, tuples · 5 Strings, parsing, formatting · 6 Errors, exceptions and debugging |
| Object-oriented C# | 7 Classes, properties, encapsulation · 8 Inheritance, interfaces, polymorphism, records · 9 Generics, delegates, events, LINQ |
| Professional practice | 10 Testing (xUnit), refactoring, clean code, SOLID · 11 Files, JSON, `async`/`await`, the .NET CLI and Git · 12 Data structures, algorithms and complexity in C#; then web APIs and a database as an elective track |

Each lesson follows the content contract's shape for code: a short paged
note, a worked listing the learner runs and edits, "predict the output",
"find the bug" and "fill the gap" items, flashcards, a quiz and a first
task. Every listing in the shipped lessons is compiled and run under the
current .NET before it ships (as CS Paper 1's 100 listings were).

**The five practice streams** (a day has a shape, set by the weekday):

- **Daily 20:** one task of about 20 minutes, chosen from the learner's
  frontier plus one retrieval item (below). A task has a statement, starter
  code, visible examples and hidden tests; ladders of difficulty per unit
  (warm-up, core, stretch). A graduated hint ladder: nudge, pointer, shape of
  the answer; the full solution opens only after real attempts and marks the
  task "seen the answer".
- **Weekend mini project:** Saturday and Sunday, two to four hours, built
  from what the learner has covered so far and nothing else. A spec, a
  scaffold with tests, milestones, stretch goals. Planned on the calendar as
  a study block and ticked on the plan.
- **Capstones** at the checkpoints (after units 3, 6, 9 and 12): a larger
  multi-file project that needs everything so far, with a written brief, an
  acceptance test suite, a rubric the learner marks against, an optional
  Kurenai review, and a short write-up. Passing a capstone is what opens
  the next stage's lessons as "recommended", never as locked (invariant 2).
- **Katas and debugging drills:** short, repeatable: fix a failing program,
  read code and say what it does, refactor to a smell list, write the tests
  for given code (checked by running them against a correct and several
  broken implementations).
- **Retrieval** (the point of the space): see below.

**Automated checking (how a task is marked)**

- Two check modes, both deterministic: *program* (stdin → expected stdout,
  CS50 `check50` style) and *method* (call the learner's method with
  inputs, compare the return value), plus *tests* for the write-the-tests
  kind. A run reports each case as pass/fail with a diff, timeouts and
  compiler errors translated into plain words (CS0103 "the name does not
  exist in this context" with the likely cause). Hidden cases stay hidden;
  the visible ones are examples.
- **Decision A, the runner (take first, as a spike, before any lesson is
  written):** the app is a script-tag PWA with no build step, no server for
  code and a rule that signed-out/offline use stays complete (invariant 31).
  Recommended: (1) a C#-subset interpreter written in JS, in a worker, for
  stages 1–2 and the early part of 3 (console I/O, types, control flow,
  methods, arrays, strings, `List`/`Dictionary`, classes, exceptions, a
  focused LINQ) with an honest "not supported yet" error; offline, instant,
  no download. (2) For the later units, a lazily loaded .NET WebAssembly
  runtime and compiler, fetched on first use, cached by the service worker,
  and presented as an optional download with its size shown. A server runner
  (a container behind an Edge Function) is the third option and is not
  recommended: it needs a network, a cost and a sandbox against hostile
  code. The spike decides whether (1) alone covers units 1–6 and whether
  (2) is affordable on a phone; the curriculum is written against whatever
  the spike supports, so the choice moves the schedule, not the design.
- Learner code never leaves the device by itself. It runs in a worker with a
  step and time budget, no network and no DOM, and it can read no app data.

**Retrieval practice (so early material is not forgotten)**

- **Skill cards on the existing scheduler.** Besides flashcards, each lesson
  contributes small code retrievals: write this three-line snippet from
  memory, predict the output, spot the bug. They are scheduled by SM-2 under
  the same key scheme (`code:<ref>:<id>`, invariants 86–87), so a card's
  schedule survives a reword. Because a run is checked automatically, the
  grade is derived, not self-reported: first-try pass fast = Easy, pass with a
  hint = Hard, fail = Again.
- **Variation, not repeats.** A retrieval task that has been solved is
  re-asked later in a parameterised form (different names, values and a
  twist), so recognition cannot stand in for recall. Interleaved: the daily
  retrieval item comes from any earlier unit, weighted to the oldest and
  weakest.
- **Cumulative review week:** every fourth week the Daily 20 is a mixed
  set from all earlier units, and a checkpoint opens with a closed-book
  quiz before the capstone's brief is shown.
- **The skill map:** every concept with the date it was last *proven* by
  passing code (not read), coloured by how long ago; "Getting rusty" lists
  what has gone longest without being proven and offers one retrieval item
  for each. Decay is derived from the ledger and the card schedule, never a
  second record of mastery (invariants 26d, 82).

**Other things recommended (all small, all in the same space)**

- **Code reading and "explain it back":** read an unfamiliar listing and say
  what it does; the learner's explanation may be sent to Kurenai for
  feedback, only on request, with the same "What is sent" disclosure as the
  Reports words (invariant 102b).
- **Error-message decoder:** paste or click a compiler error to get the
  meaning, a cause and a fix, from a shipped table (offline).
- **Reference and glossary:** a searchable cheat sheet (syntax, the common
  `System` types, LINQ operators), entering cross-domain search.
- **Algorithm ladder:** after unit 12, interview-style problems with a
  complexity note, reusing the Trace Lab to step through a solution.
- **A portfolio page:** each finished project exports as a folder with a
  README (a zip, made on the device) ready for GitHub.
- **Assistant tools:** read-only (progress, due retrievals, today's task,
  rusty topics, a hint for the task open on screen at the current rung);
  a code review is consequential and waits for the approval card
  (invariant 71a). The Assistant never writes the solution into the editor.
- **Reports:** a Programming section in the weekly report (tasks done,
  retrieval pass rate, projects, concepts proven) and capstones as
  milestones in the yearly one.
- **Phone:** typing code on a phone is the weak case, so on a phone the
  space leads with lessons, retrieval, predict-the-output and fill-the-gap;
  full editing works but the Daily 20 offers the short-answer form first.
  Bluetooth keyboards are supported as on desktop.

**How it fits the app**

- **A fourth subject** (`code` in `KOS.spec`; stored links `"code:U4.2"`).
  Its spine is authored, not generated from a board's specification, so it
  is a new data kind beside invariant 24's generated files:
  `js/data/code.js` (the tree) and `js/data/content/code-*.js` (lessons),
  both validated by a new smoke. It needs a fourth hue, a deliberate change
  to "keep the three subject hues" in invariant 26; the Topic picker, the
  inspector, search, Focus links and the session ledger take the subject
  with no further code.
- **Own storage.** Learner source, run history and project files live in a
  new IndexedDB, `kurenai-os-code`, separate from the media and files
  stores (invariant 7), and are included in the full backup (credentials
  still are not). Passed-task facts and the retrieval
  schedules ride the state document; the source replicates to a new
  owner-only table `kos_code`, local-first like `kos_reports` (invariants
  31, 102e).
- **Governor, decision B.** A first pass of a task is one `KOS.sessions.log()`
  study entry (invariants 1, 5): XP and gold once per task, never for a
  re-run, a seen solution, or a retrieval already paid that day; a daily cap
  on retrieval pay so cards cannot be farmed. It does not move HP (invariant
  2) and gates nothing. Recommended as written; the alternative is Focus-style
  time-based pay only.
- **Plan and calendar:** the Daily 20 and the weekend project are offered as
  plan rows and study blocks by READ (never copied, invariants 45, 82b);
  the phone dock and Home's next-action ladder show "Today's task" and
  "N retrievals due".

**Build order** (each phase ships and passes the gate on its own)

1. **Spike A:** the runner, one worker, one checker, twenty tasks across
   the two modes; decide A and size the download.
2. **Spine and one unit end to end:** the subject, tree, picker, the unit 1
   lessons, the editor/run/check view, error decoder.
3. **Daily practice, hints and the Governor payout (B).**
4. **Retrieval:** skill cards, variation, the skill map, review weeks.
5. **Weekend projects and the first capstone** (the checkpoint view, rubric).
6. **Units 2–6**, then capstone 2.
7. **Units 7–12** and capstones 3 and 4, katas, debugging drills, reference.
8. **Replication, Assistant tools, Reports section, portfolio export, phone
   audit.**

- **Invariants moved:** 26 (a fourth hue), 24 (an authored, validated
  specification beside the generated ones), 7 and 36 (the new store and its
  backup/sync rules), 95 and 102 if a notification kind or report section
  is added. Zero Governor traffic from the editor and the checker; only a
  first-pass task pays, through the ledger.
- **Design first:** frames for the space's home (today's task, retrievals
  due, the skill map, the stage path), the lesson page, the editor with
  results and hints, a capstone checkpoint, the weekend project, and phone
  ([prompt 10](design-prompts.md)).

### 5.4 Money and Goals, beyond the Collection ◆ (asked for 13 October 2026)

> **Status (20 October 2026): RELEASED** — `084a628`, sw `kos-money-1`,
> immutable https://d8bccd88.kurenai-os.pages.dev; `main` fast-forwarded
> to `feat/money-goals`. **Built whole.** The design handoff (frames 27a–27s) arrived and
> every page is built to it: Money's six views (Overview with the day
> chart and Safe to spend, Transactions with splits, refunds, tags, bulk
> actions and CSV, Budgets with rollover and the Collection breakdown,
> Recurring with due cards and subscriptions, Pots with the saving-for
> hero, Month and year), Goals (the hero ring, domain filter, card grid,
> "Every period, kept", Done) and a goal's page (pace chart, history,
> milestones, how it is counted), the new-goal picker and form, Home's
> Upcoming | Goals switch, the Wishlist (the Planner renamed, its
> allowance read from Money, "Mark purchased" as a dialog that says what
> it will do), the Calendar's derived chips with their toggles, Reports'
> Money and Goals cards with "What Kurenai sees", and the Goals/Money
> notification filters. Placement (27a): Money and Goals join the
> Productivity strip; the Collection keeps the Wishlist. Held by
> smoke84–87 and smoke56 (all six Money views under render purity).
> Next: whatever the user's review of the live pages turns up.

> **Status (19 October 2026, branch `feat/money-goals`, not merged or
> deployed):** started from the second account. Design prompt 11 was
> revised for the new Claude Design project (frames 27a–27s, adding the
> placement, month/year, Reports and Calendar frames) and is with Claude
> Design. Built meanwhile, with no new screens:
> - **Phase 1, the Money core** (`js/core/money.js`, smoke84): the
>   `state.money` gate with the default categories, string-keyed
>   categories, rules and pots in the cloud merge, transactions in
>   `kurenai-os-money` with tombstones and the full backup, payday months,
>   summaries with budgets, a one-month rollover and over-budget, honest
>   insights (left, safe to spend, a projection only after 7 days and 5
>   data days), recurring rules with confirm / skip / leave and price
>   history, subscriptions per month and year, pots from transfers, lazy
>   60-row lists, and the CSV parser, preview with duplicates, import and
>   export. **Decided differently from the build order:** the migration is
>   a live MIRROR, not a one-time copy — the Budget Planner keeps owning
>   its purchases and Money derives a Collection transaction from each one
>   before every read, so the two can never disagree; the Collection
>   budget reads the planner's monthly limit. The planner's own page is
>   unchanged.
> - **Phase 3, the Goals engine** (`js/core/goals.js`,
>   `js/core/goals-collection.js`, smoke85): the type registry, `state.goals`
>   v3 (domain, links, params, milestones, repeat, outcomes; a v2 goal
>   loses nothing), repeating goals whose ended periods are judged once,
>   pace and the projected finish, and types for Study (hours, cards,
>   recall with the 50-review floor, topics to Green from a baseline),
>   Productivity (Focus hours and blocks, ticks, plan rows), Money (spend
>   under, income, no-spend days, saving into a pot), Code (tasks, proven
>   retrievals, a capstone) and the Governor (streak and level, display
>   only, `payout: "none"`). The Planner's Goals page draws on the engine
>   and still offers only the Collection's types until 27i–27k.
> - **Phase 5's joins that need no design** (smoke86): `kos_money`
>   replication (migration `20261019000001_kos_money.sql`, APPLIED to Supabase on
>   19 October 2026; the table is unused until the app with Money is
>   deployed), the Assistant's `money_*` tools (totals by default, every write
>   undoable) and `goals_types` with `goals_add` for every domain and
>   repeat, `f.money` and `f.goals` in every saved report with totals-only
>   words, and the `goal` notification kind with its ticker.
> - **With design:** phase 2 (the Money pages), phase 4 (the Goals pages,
>   the Home card, calendar reads), the Reports cards that draw `f.money`
>   and `f.goals`, a bill-due notification once Money has a page to open,
>   search, and the move to the Productivity strip.

- **Today:** the Budget Planner (`js/modules/wishlist.js`, `state.wishlist`)
  is a Collection purchase queue against ONE monthly pool for Books, Games
  and Visual Novels; Goals (`js/modules/goals.js`, `state.goals`) has 14
  fixed types, nearly all reading the vault. Both live under Collection's
  Planner tabs. Neither knows about income, bills, study or productivity.
- **What:** make both general, so they describe the whole of life in the
  app and the Collection becomes one part of them:
  - **Money:** the Budget Planner grows into a full personal budget:
    income and outgoings, recurring payments and subscriptions, many
    categories, per-category budgets and a month view. The Collection's
    purchase queue stays (it is a wishlist, and it is Collection-specific)
    and feeds Money.
  - **Goals:** the same page and engine, but a goal can be about Study,
    Productivity, Money, Code (5.3), the Governor or the Collection, and
    can repeat (every week, every month).
- **Not a bank:** no bank connection and no network traffic from either
  (invariant 5a stays). Entries are typed, imported from a CSV on the
  device, or created by a recurring rule or the wishlist handoff.
  Open-banking links need a provider, keys and a server, and are parked.

**Money**

- **Transactions:** amount, date, category, payee, note, tags, income or
  outgoing; split across categories; a refund; a transfer between pots that
  is never counted as spend. Single base currency (the existing `currency`
  setting); several currencies are parked.
- **Income:** sources (allowance, part-time job, gifts, grants), one-off or
  recurring, shown as expected against received so a late payment reads as
  late, not as missing.
- **Categories:** a good default set in groups (Food, Transport, Bills,
  Subscriptions, Education and exams, Health, Clothing, Social, Gifts,
  Savings, Collection, Other), all renameable, addable, archivable. A
  category has a monthly budget, an optional rollover and a colour taken
  from the shared tokens. "Collection" carries the existing monthly limit
  and keeps its per-module breakdown (Books, Games, VN) as a sub-field, so
  the current chart survives.
- **Recurring payments:** a rule (every N days, weeks, months or years, a
  day of month, an end date) is computed from ONE record and never
  materialised into copies (invariant 43). A due occurrence is confirmed
  (becomes a transaction, optionally with a changed amount), skipped, or
  left as upcoming. Upcoming bills read onto the calendar as derived chips,
  never written as events (invariants 44, 82b).
- **Subscriptions:** a view over the recurring rules flagged as one: the
  next renewal, the cost normalised to per month and per year, a free-trial
  end with a "cancel before" alert, the price history (and a "this went up"
  note), the total, and a review list ("no activity in the linked
  Collection list for 90 days" is a hint the user can confirm; it never
  cancels anything). "Remind me" creates a real reminder, a link by text as
  the plan does.
- **Budgets:** an overall figure and one per category for the month, with an
  optional month start on payday (the 25th, say). Left to spend this month,
  a "safe to spend today" figure, and a month-end projection that appears
  only once there are enough days of data (invariant 76).
- **Pots (sinking funds):** named amounts set aside (holiday, laptop,
  exam fees, emergency), with a yearly or lumpy cost shown as a monthly
  set-aside. A savings goal reads a pot (below).
- **Views:** Overview (income, outgoings, left, the category bar, upcoming
  bills, the subscriptions total); Transactions (searchable, filter by
  category/date/tag, 60-entry lazy batches, invariant 8); Budgets;
  Recurring and Subscriptions; Pots; Month and Year summaries that feed
  Reports. A privacy toggle hides amounts on screen.
- **Import and export:** CSV import with a column-mapping step, a preview
  and duplicate detection; CSV export of any view; the data is in the full
  backup.

**Goals**

- **A type registry, not a fixed list.** `KOS.goals.register(def)` takes a
  domain, a unit, a direction (reach or stay under), a period and a derive
  function that READS the single source (invariant 26d); each owner
  registers its own (the vault's 14 types move to the Collection's module
  as they are, so no existing goal changes). New types:
  - **Study:** hours studied this week; flashcards reviewed; recall at or
    above X% over 50 reviews; N topics to Green in a subject or unit; a mock
    or paper score at or above a target; finish a unit; revise a topic by an
    exam date (a calendar link).
  - **Productivity:** Focus hours or blocks; tasks and reminders done; a
    habit's streak; plan rows ticked; no overdue assignment; carry-overs
    cleared.
  - **Money:** spend a category below an amount; save an amount in a pot by a
    date; a no-spend day count; the subscriptions total below an amount;
    income above an amount.
  - **Code** (once 5.3 ships): daily tasks done; retrievals kept; a capstone
    passed.
  - **Governor:** a streak length or a level, shown only; reading a value
    never pays for it.
  - **Manual:** the existing custom goal, with a tick or a counter.
- **Repeating goals:** "10 hours a week" is one goal with a period; each
  finished period is saved as its outcome (met, missed, the figure) like a
  report, so a streak of weeks met is read from them. Only the period
  outcomes are stored; progress is always derived.
- **Pace:** target, deadline, milestones, and an on-track chip (ahead,
  on track, behind) from the straight-line expectation; behind is the fixed
  alarm red, never the accent (invariant 26a). A projected finish date once
  there is enough data.
- **Links:** a goal may link a topic (the topic picker, invariant 26e), a
  subject (its hue), an assignment or exam, a pot, or a title; deleting what
  it links to leaves the goal, marked.
- **Templates:** a short list of good starting goals ("10 hours of study a
  week", "Five topics to Green this month", "A no-spend weekend", "Finish
  the series I am on") so an empty page is not a blank form.
- **Archive, not fail:** a missed deadline marks the goal missed and keeps it
  in history; a goal can be archived or restarted for the next period.
- **Where it shows:** the Goals page (filter by domain, this week/month,
  done); a compact card in Home's next-action ladder (a goal behind, or a
  period ending soon); a Goals section in the weekly/monthly/termly/yearly
  report; the `goal` notification kind for a deadline or the end of a period
  (needs invariant 95 widened); search.

**How it fits the app**

- **Placement, decision A (the design confirms it):** recommended is that
  Money and Goals leave Collection and join the Productivity strip, with
  Collection keeping a Wishlist tab (the purchase queue) under Planner. Old
  routes `#/wishlist` and `#/goals` keep resolving (the first to the
  Wishlist, the second to Goals), so notifications, search results and links
  never break. `KOS.collectionWorkspaceTabs` loses its Budget Planner and
  Goals entries; Productivity gains two. If two more items overload the
  strip, the alternative is a new "Plan and money" rail group.
- **Storage, decision B:** recommended is the small and slow-changing part in
  the synced state document (categories, budgets, recurring rules,
  subscriptions, pots, goals and their period outcomes; cloudmerge keys each
  record array by its id, invariant 33a), and the large part, TRANSACTIONS,
  in its own IndexedDB, `kurenai-os-money`, with `syncId` and tombstones as
  the Collection has (invariant 32) and replication to an owner-only table
  `kos_money`, local-first like `kos_reports` (invariants 31, 102e). Years of
  entries do not belong in `localStorage` or the state document.
- **Migration:** a one-time, idempotent boot pass behind a new gate
  (`KOS.money.normalise`, `KOS.goals.normalise`): `wishlist.budget.history`
  and the purchased items become transactions in the Collection category
  with their original module and date, `monthlyLimit` becomes that
  category's budget, and `state.goals` moves to a version with a `domain`
  field (derived from the type for existing goals). Nothing is lost, the old
  chart reads the same, and a re-run changes nothing.
- **Governor:** Money has zero Governor traffic and zero provider traffic
  (invariants 5a, 5b; smoke14 widened to the new module). Goals keep one
  idempotent `payout: "activity-only"` receipt per goal and never create a
  second event: a study goal reads sessions that already paid, a money goal
  has nothing to pay. A goal that targets a Governor value is displayed, never
  rewarded, so a goal cannot be set to farm itself.
- **Assistant, decision C:** `money_*` and extended `goals_*` tools through
  `aitools.js`. Recommended: tools return totals and category aggregates by
  default and individual transactions only when asked; writes are
  undoable, deletes and imports wait for the approval card (invariant 71a);
  Kurenai's report words get totals only, never payees, notes or titles
  (invariant 102b). The privacy toggle also hides amounts from screenshots
  of the page.
- **Reports and search:** Reports gets a Money section (income, outgoings,
  the biggest categories, the subscriptions total, against last month with
  `compare()`) and a Goals section; a supporting zero stays absent
  (invariant 77); a balance is context, not a bar (invariant 78).
- **Plan and calendar:** recurring bills and goal deadlines read onto the
  calendar and the plan by derivation only; nothing is copied.

**Build order** (each phase ships on its own and keeps today's pages working)

1. **Money core, no new screens:** `KOS.money` (the normaliser, categories,
   rules, the IndexedDB), the migration, and the existing Budget Planner
   reading it. The user sees no change; the gate proves nothing was lost.
2. **Money pages:** Overview, Transactions, Budgets, Recurring and
   Subscriptions, Pots; phone; CSV import and export.
3. **Goals engine:** the registry, `normalise` and the version bump, the
   existing 14 types re-registered unchanged, repeating goals and period
   outcomes, pace.
4. **Goals pages and the new types:** the page, templates, Home card,
   notification kind, calendar and plan reads.
5. **Joins:** wishlist handoff into Money, savings goals reading pots,
   Reports sections, search, Assistant tools, the `kos_money` replication.
6. **Audits:** phone, Dawn and the shop themes, accessibility, the CSV
   import on messy files.

- **Invariants moved:** 5a (rewrite as Money: still zero Governor and
  provider traffic, the wishlist handoff still exact and local), 5b (goals
  are general; the one-receipt rule stays), 7 and 36 (the new store and its
  backup and sync rules), 8 (cursor caps on transactions), 27 and 50b (the
  workspace tabs), 95 (the `goal` and, if chosen, `money` bill-due kinds),
  102 (the new report sections), 26 (category colours from shared tokens;
  one more domain hue is not needed).
- **Design first:** Money's Overview, a transaction, the budget and the
  subscriptions views, the goals page with domains, a repeating goal and its
  history, the Home card, phone ([prompt 11](design-prompts.md)).

### 5.5 Japanese: a study space for the four skills ◆ (asked for 17 October 2026)

> **Status (22 October 2026): PLATFORM RELEASED** (`d061169`, sw
> `kos-japanese-1`, https://6a6bcfa7.kurenai-os.pages.dev). Plan §17 step 1:
> the backend (model, facet scheduler, kana, conjugation, validators,
> strokes), the pages drawn to design turn 28 (the desk, the lesson, the
> session, Kana, Skills, the path, checkpoints, settings, licences) and
> Stage 0's sixteen kana lessons; smokes 80–83. Next: Stage 1, one unit a
> release; the reader, media and immersion pages (28h, 28i, 28l); the baked
> audio packs (KOS Akari 2, KOS Yota 2, VOICEVOX).

> **Status (17 October 2026): slice closed; integration next.** The plan is
> [japanese-plan.md](japanese-plan.md) revision 3.1. The throwaway vertical
> slice in `prototypes/japanese-space/` (plan §16) met every criterion on
> real data (commit `03505a9`; voice bake-off `bc75349`): speech is an
> intelligibility check only (decision D), the handwriting checker caught
> all 8 performed mistakes, and a real episode's subtitle coverage works.
> Nothing in the app has changed. Next is the platform release (plan §17:
> registry, hue, routes, desk, model, scheduler, validators, engine, audio,
> Stage 0 Kana, smokes 80–83), only when you ask. The slice's results file
> lives in `~/Downloads` on the machine that ran it and is not committed.

- **What:** a fifth subject (`exam:false`, the 朱 vermilion `--ja` hue),
  built like Code: its own desk, lessons on the shared topic page, a
  practice engine and evidence-derived status. The aim is reading, writing,
  listening and speaking well enough to use anime, J-dramas, J-pop, manga,
  light novels and VNs without English. It starts from zero at 30–45
  minutes a day.
- **The method:** input-led, frequency-ordered vocabulary aimed at your own
  media, mined sentences, and shadowing. It is not a tap-the-answer game.
- **The pieces:**
  - six stages (Kana → Advanced) of units with checkpoints;
  - an exercise engine covering recognition, grammar, reading, listening and
    production;
  - answer validators that understand Japanese (readings, conjugation,
    particles, word order, mora alignment, strokes, pitch);
  - mastery tracked per item × skill (R/W/L/S) with an FSRS-style scheduler;
  - a media-path timeline projecting when each media milestone is in reach;
  - subtitle-file coverage ("you know 87% of this episode");
  - immersion through Focus;
  - original manga panels and VN scenes from a reusable cast, plus your own
    clips kept on the device.
- **Spikes in the slice:** S (speech recognition, measured on deliberate
  mistakes) and T (the tokeniser).
- **Art:** generated by hand in the Gemini app (no API spend), in the
  Kurenai master art's style, as base poses with swapped expressions.
- **Invariants it would add:** 112–118 (plan §19; 111 is FSRS's). Those it touches: 2, 3,
  4a, 26a, 26d, 27, 31, 77, 103, 106 and 107.
- **Design first:** the desk, the path timeline, a lesson, the exercise
  states, the reader, a checkpoint, the media components and phone
  ([prompt 12](design-prompts.md)).

### 5.6 FSRS: one scheduler for every card (asked for 20 October 2026)

> **Status (22 October 2026): phase 3 RELEASED** (`13cef94`, sw
> `kos-runner-2`). The optimiser is `KOS.fsrsOpt` (`js/core/fsrsopt.js`): pure
> JS, not fsrs-browser, whose threaded WebAssembly needs a
> cross-origin-isolated page that would block every hot-linked image. It
> pretrains w0–w3, trains w4–w20 by Adam with a pull towards the defaults,
> and is kept only when it beats the parameters in use. "Optimise" on Card
> stats is off until 1,000 reviews are logged; its preview says what
> changes; the fit syncs as `state.srsCfg.fit` and "Back to the defaults"
> undoes it. The review log replicates to `kos_reviews` (migration
> `20261022000001`). Held by smoke96.

> **Status (20 October 2026): RELEASED** — `fbea5d5`, sw `kos-fsrs-1`,
> immutable https://a6e211c9.kurenai-os.pages.dev; `main` fast-forwarded
> to `feat/fsrs`. Phases 1 and 2 shipped together. The plan is [fsrs-plan.md](fsrs-plan.md); decisions A–G are
> taken (§9). It includes one FSRS-6 core held to py-fsrs, flashcards and
> Code on it, the SM-2 switch at boot, the review log, the FSRS figures
> and the target retention on Card stats, and smoke88 (invariant 111).
> **Phase 2 is built too:** the exam-aware cap against an exam-day target
> (default 95%) with the 7–14 day pre-exam spread; leeches go to Rework
> after 8 lapses; topic memory feeds RAG, the inspector, Due today and Home
> (invariants 111a, 111b). Next comes the Exams &
> Deadlines hub (test classifications, flexible scopes, study guides and
> predicted papers, Goals), which will own exam dates.

- **What:** a pure FSRS-6 core (`KOS.fsrs`) that replaces the SM-2 step in
  `srs.js` and Code's copy of it. The Japanese facets use it when they
  arrive.
- **The migration:** the SM-2 cards convert the way Anki does
  (`memory_state_from_sm2`). Due dates don't move, and the next on-time
  Good matches SM-2.
- **New data:** a review log starts in a local IndexedDB store, for a later
  optimiser.
- **Needs no design:** it follows existing frames, with the ease figures
  replaced by difficulty, stability and recall.

### 5.8 Exams & Deadlines Hub ◆ (asked for 20 October 2026)

> **Status (21 October 2026): phases 1–5 built on `feat/exams-hub`, not
> deployed.** The plan is [exams-plan.md](exams-plan.md), revision 2
> (decisions A–N approved with refinements R1–R5). Built: the assessment
> record and migration, the Scope Builder, the cap by scope, the widened
> attempt with redo items, start-by dates (smoke89); the past-paper index,
> boundaries and the report fetcher (smoke90); readiness (four signals and
> the band), analytics, the planner and its send, Exam Season and the Exam
> Room, the joins, the post-mortem, the Paper library, timetable import,
> the load view, teacher feedback, what changed since the mock and results
> day (smoke91), styled to design turn 29 (frames 29a–29ac); the five
> exam goal types, their templates and the Assistant's hub tools (smoke92);
> the archetype catalogue, the assembled Companion, three playbooks, trend
> and likelihood, the paper engine, the revision pack and accessibility
> (smoke93); phase 6's first paper, the exhaustive Companion for CS
> Paper 2 — every shape of 4.5–4.12 worked with AQA mark points, practice
> sets, subtopic packs, predicted papers and the recognition drill
> (smoke94). Next: the same for CS Paper 1, then Maths Papers 1–3 and
> F201, one paper per release.

- **What:** Study → Exams & Papers grows into the hub where assessments,
  readiness, practice evidence, revision planning and goals meet.
- **The pieces:**
  - one assessment record with five tiers (real exam, mock, topic test,
    retrieval test, deadline);
  - a composable Scope Builder ("Covered in Pacing so far", exclusions);
  - the FSRS cap by scope;
  - four-signal readiness, never blended;
  - fast logging with optional per-question tags and redo items;
  - prescriptive analytics (the next ten marks, a predicted grade range,
    pace, calibration);
  - a read-only weekly planner with one approved send to Pacing;
  - start-by dates, Exam Season and the Exam Room;
  - a tier-scaled Companion: an exhaustive authored layer per paper,
    driven by the real past-paper index in `~/Downloads/A-level`,
    examiner's reports and original predicted papers;
  - five exam goal types.
- **Releases:**
  - core;
  - the evidence pipeline;
  - readiness and planning;
  - goals;
  - the assembled Companion and paper engine;
  - then the exhaustive Companion, one paper per release.
- **Numbering:** invariants 120–129, smokes 89+.

### 5.7 After FSRS (asked for 20 October 2026, in this order)

> **22 October 2026:** items 1 and 2 are RELEASED (`13cef94`, sw
> `kos-runner-2`); the functions, secrets, cron job and App are live. Item 1: [server-runner-plan.md](server-runner-plan.md), the
> outlook, Web Push and the `runner` function (invariant 131, smoke97).
> Item 2: [github-app-plan.md](github-app-plan.md), the GitHub App and the
> `github-token` function (invariant 110, smoke98). Their migrations are
> applied; the functions, their secrets, the cron job and the App itself
> need your accounts (each doc's "What you run once"). A small extra asked
> for the same day is built too: switching a Focus session's subject,
> topic or assignment mid-way without stopping the clock (invariant 4a,
> smoke95).

1. **A server-side runner, Web Push and which notifications reach a closed
   app** (an exploration doc; it unparks "Scheduled messages while the app
   is closed").
2. **Code → GitHub as a GitHub App** (a short doc; it uses the same Edge
   Function pattern).
3. **A Creatives study space** (art, graphic design, editing, writing): a
   plan first, then Claude Design. **Planned and approved 22 October
   2026:** [creatives-plan.md](creatives-plan.md) revision 2 (decisions
   A–H). One subject, four tracks, built for a complete beginner:
   micro-studies before pieces, a private Practice Log apart from the
   Portfolio, Momentum mode and best-of-five, "Good for this unit" in
   every rubric, and a procedural reference generator. Free apps first.
   20–30 minutes a day, paused in Exam Season. First release: the
   platform, the Writing Desk and the design drills, then Art units 1–3
   on the ink engine. Next: [design prompt 15](design-prompts.md).
4. **Code content** — DONE 23 October 2026: units 10–12 and capstone 4
   complete the core path (unit 10 and capstone 4 in Rider, validator
   1.1.0; units 11–12 on the full runtime). What remains is the deepening
   modules and the tracks (parked below).

---

## Phase 6 — The iPad and the Pencil (asked for 22 October 2026)

> **Status (22 October 2026): 6.0 RELEASED** (`87f9437`, sw `kos-ipad-1`,
> https://982f307b.kurenai-os.pages.dev); the rest is
> planned in [ipad-plan.md](ipad-plan.md) revision 1. Next come its three
> spikes on the device: P (what the Metapen A8 reports), D (pdf.js on a
> whole paper) and H (how well Kurenai reads your Maths working).

The iPad Air 11" (M4) becomes a first-class device and then the study
notes device, written with a stylus: the Metapen A8 now, an Apple Pencil
Pro later. It stays a web app. Everything Pencil-related is built on one
ink engine.

- **6.0 Layout for the iPad** (done):
  - the audit's `--ipad` mode (820 × 1156 and 1180 × 796, touch, no
    hover) and `--sizes` for Split View;
  - fixed: the main rail (in portrait it could not be opened, its toggle
    hidden under 1080px, and now it opens over the page; in landscape the
    toggle was a squashed oval on the subject spine, and now it is the
    desktop's 24px circle), topic pages collapsing at 1081–1240px (the iPad in
    landscape),
    page headers squeezing their titles, the Shrine's podium, the
    Notification filters' overflow, Review's rows at 375, and hover-only
    row controls on touch;
  - `KOS.ui.device()` so an iPad is called an iPad.
- **6.1 The ink engine** (`KOS.ink`):
  - pen only with palm rejection;
  - pen, highlighter, eraser, lasso, shape snap, ruler and papers;
  - vector strokes in `kurenai-os-ink`, synced a page at a time.
- **6.2 A topic's Handwritten tab**, side by side with the notes, with
  "Clip to page".
- **6.3 Answering by hand:** an answer pad under every question, the
  mark-point tally, and "Mark with Kurenai" (opt-in, after Spike H).
- **6.4 Past papers and PDFs:** the Paper library in an in-app viewer
  with ink, timed sitting, the mark scheme beside it, attempts logged by
  question, and flattened export.
- **6.5 Maths working:** squared paper beside the calculator panel, the
  "Write it out" drill and "Check my working".
- **6.6 Retrieval by hand:** blurting against the notes, diagram drills
  with the model answer overlaid, and handwritten flashcard answers.
- **6.7 Japanese writing** with its platform release: kana on a guide
  square, checked by the slice's stroke checker.
- **6.8 The Creatives sketchbook** (layers-lite, brushes, drill tools).
- **6.9 The iPad as a study desk:**
  - keyboard shortcuts;
  - Stage Manager and Split View;
  - Focus with the screen kept on;
  - a check of Code's full runtime on the M4.
- **Invariants it would add:** 132 (ink is vector and local first) and 133
  (handwriting is read only when asked). Those it touches: 89, 102b, 111,
  124, 125 and 127.
- **Design first:** the toolbar, the Handwritten tab, the answer pad, the
  PDF viewer, the drills and the Split View compositions (prompt 14).

---

## Parked — not scheduled

| Item | Why it waits | Unblocks when |
|---|---|---|
| Live2D Kurenai | Cubism licence classification (`LICENSE_REQUEST.md`) and the hand-drawn rig | written licence answer |
| Assistant voice (TTS) | needs a `tts-speak` Edge Function (JWT + server key), a speaker button behind an off-by-default toggle; Category 6 left the resume note | you want it |
| Automation engine | never existed; Category 6 refused a placeholder | a concrete use case |
| Syncing media kv (hero picks, per-season scenery, other view picks) | kv also holds provider credentials, so it needs a whitelist of syncable keys, and an uploaded hero is a data URL too large for the state document (it would ride the attachment path instead). The Shrine's tie order already syncs, in the state document | you schedule it (asked for as a nice-to-have, 27 Sep) |
| Alternate mascots and logo families (Fallen Crown / Faded Oath), re-polished overlays | art work, not code | art exists (◆ for their presentation) |
| Code's deepening modules and the tracks | the core path is complete (units 1–12, Bridge B and capstones 1–4, 23 October 2026). Every module's project and every track's taster, projects and capstone are planned in [code-plan.md](code-plan.md) §3.5 (Games is now T5, with Unity; the Gacha Lab); the Python path (PY1–PY3, Data analytics, AI/ML/LLMs; T3 narrowed to AI in .NET apps) is decided in §3.6, and the order in §3.7: T1 → T2 → D1–D3 → T5 → Python → PA → PB → T3 → D4–D6 → the rest. **T1 started 23 October 2026**: Spike S done; T1A, Databases, RELEASED (8 lessons in the SQL sandbox and The Case of the Missing Mug); T1B, SQL from C# (3 Rider lessons and Contacts on SQLite), and T1C, Entity Framework Core (6 Rider lessons and The Lending Library on EF Core), on `feat/code-t1b` | — |
| Code's full runtime on a phone | Code is studied on a Mac, not a phone (17 October 2026). The M4 iPad may run it; checking that is part of 6.9 | you want to code on a phone |
| The Rider validator on Windows and Linux | macOS is the only machine in use; it is verified there (17 October 2026) | another operating system is used |
| CI-verified evidence for Code (the GitHub App is built, 5.7) | needs a workflow in the repository that runs the validator and the App's Checks: read permission (docs/github-app-plan.md §7) | CI evidence is wanted |
| Airing and release-day pushes to a closed app (phase C of 5.7 item 1) | airing needs AniList's schedule on the server; release days need the Wishlist in the outlook | you want them |

---

## Suggested order

1. Phase 1:
   - 1.2 IT units;
   - 1.1 topic picker;
   - 1.3 quick note;
   - 1.4 drag-and-drop;
   - 1.5 Shrine order;
   - 1.6 Focus;
   - 1.8 Assistant tools (last, so the new tools cover 1.1–1.6).
2. Meanwhile in Claude Design: **3.1 phone**, then **1.7 OOP IDE**, then
   **3.3 lab system**, then **3.2 Dawn and themes**.
3. Phase 2 clean-up (done), then the phone views
   from their handoff.
4. The OOP IDE and the labs from their handoffs; then Dawn and the themes.
5. Phase 4 content can run between any two of these. It shares no files
   with the UI work.
6. Phase 5: 5.1 Reports, from its Claude Design frames; then 5.3 Code,
   starting with its runner spike (decision A), which needs no design and
   decides the schedule, while its frames are drawn in Claude Design.
7. Phase 5.4 Money and Goals: its phase 1 (the core and the migration, no
   new screens) and the Goals engine need no design and can run any time
   after Reports; the pages wait for their frames. Do the Goals engine
   before 5.3 reaches its goals, so Code's goal types register in it.
8. Phase 5.5 Japanese: the vertical slice first (no design needed, and it
   decides speech and the tokeniser), while its frames are drawn in Claude
   Design; then the platform with Stage 0.
9. Phase 6, the iPad: the three spikes on the device, then the ink engine
   and the topic notebook, while prompt 14 is drawn. Creatives' platform
   follows the ink engine, because its sketchbook is built on it.

Deploy after each phase, or sooner when you ask. The pre-deploy checklist
in `CLAUDE.md` applies every time.
