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
| 1.2 | F203/F205 removed by the generator; `KOS.itUnits`; `js/data/it-grades.js` (placeholder boundaries except H119 D* = 270); `KOS.hub.it` | the IT units panel on the IT desk |
| 1.3 | `KOS.edits.setDraft/appendSpec/fileQuickNotes`, filed on leave by `KOS.show` | the inspector's quick-note box |
| 1.4 | `KOS.edits.move/moveBy`, `setSpecBreak/specColumns` | drag handles, drop shadow, keys; the Spec renderer honouring a stored break |
| 1.5 | `KOS.media.shrineOrder` (synced state) | "Set order" on a tier |
| 1.6 | stopwatch and study-until; the per-10-minute rule; the idle watch; `state.ui.focusMini` + `clampMini` | the four-mode setup, the award tick, the draggable mini-player |
| 1.7 | `KOS.oop` gate, identity, validation, transpile, canvas view | the IDE (frames 19a–19f) |
| 1.8 | tools for all of the above plus pacing, reminders, assignments, notifications | — |

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
- **How:** `js/labs/sandboxes.js`; draft-until-first-edit stays (render purity,
  smoke56).
- **Design first:** no frame exists for either mode. The prompt is in
  [design-prompts.md](design-prompts.md).

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

---

## Phase 2 — Finish M14: the rebuild's clean-up

Engineering only. Do it before the design work in Phase 3, so the
new themes and the phone layout build on a clean base.

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
- **Sample covers:** the Sample account's covers are placeholder tiles.
  - Optionally ship a few licence-free covers, or generated art, so review
    screenshots show real cover art.
  - Sample mode never syncs, so this touches no provider.

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

---

## Phase 4 — Content

- **Statistics S1–S5 and Mechanics S6–S9 at full depth**, the same way as Pure
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

---

## Parked — not scheduled

| Item | Why it waits | Unblocks when |
|---|---|---|
| Live2D Kurenai | Cubism licence classification (`LICENSE_REQUEST.md`) and the hand-drawn rig | written licence answer |
| Assistant voice (TTS) | needs a `tts-speak` Edge Function (JWT + server key), a speaker button behind an off-by-default toggle; Category 6 left the resume note | you want it |
| Automation engine | never existed; Category 6 refused a placeholder | a concrete use case |
| Syncing media kv (hero picks, per-season scenery, other view picks) | kv also holds provider credentials, so it needs a whitelist of syncable keys, and an uploaded hero is a data URL too large for the state document (it would ride the attachment path instead). The Shrine's tie order already syncs, in the state document | you schedule it (asked for as a nice-to-have, 27 Sep) |
| Alternate mascots and logo families (Fallen Crown / Faded Oath), re-polished overlays | art work, not code | art exists (◆ for their presentation) |

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
3. Phase 2 clean-up, then the phone views from their handoff.
4. The OOP IDE and the labs from their handoffs; then Dawn and the themes.
5. Phase 4 content can run between any two of these. It shares no files
   with the UI work.

Deploy after each phase, or sooner when you ask. The pre-deploy checklist
in `CLAUDE.md` applies every time.
