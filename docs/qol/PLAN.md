# KurenaiOS — the plan after the QoL review (APPROVED 19 Nov 2026; 1A started)

This plan uses your marks on the review page (https://claude.ai/artifact/RtRTKuMeBuLp5994CKZoNx, 210 marks:
167 Build, 30 Later, 13 No) and your 15 notes. It puts every Build item in exactly
one place (`docs/qol/placement.json`; the full list is in the appendix below).
It was approved on 19 November 2026 with decisions D1–D4 below.

The six phases run in order. Within a phase, batches can overlap when they touch
different files. The rules in force still hold:

- audit before fixing;
- test every aspect before a release;
- at most three agents, and agents commit and push after each item;
- Opus for judgement, Sonnet for mechanical work;
- the boot budget only goes down;
- no deploy without your go-ahead.

Each batch ends the same way: a full gate, a browser check (Mac 1470×832, iPad 1180×820
and 820×1180, iPhone 402×874), and then I ask you about the deploy.

## Your notes, and what each one changed

| Item | Your note | In the plan |
|---|---|---|
| `bk:study-core#5` | Due today isn't personalised: a CS Focus session fills the "Do Quadratics" bar | Treated as a **bug**, first in 1A: audit the Today/Due item's measure, then make a Focus session count only towards its own subject and topic. `rm:due-subject` merges into it. |
| `rm:help-guide` | A Changelog page and a What's New overlay after an update | Phase 4. The Changelog lists the user-facing lines from `docs/RELEASES.md`. What's New shows once per version, after you accept the update (invariant 38). |
| `bk:assistant-archive#2` (Later) | Build at the end, with annotated visuals / a full page picture with callouts | Phase 4 is that end point. Help entries sit next to each view, each with an annotated picture of its page. |
| `rm:creatives-assistant` | Send reviews out to Gemini/Claude on the web, as Exams does, and keep Ask Kurenai | 1E: Creatives gets a "review pack" (export → paste the JSON reply back) beside Ask Kurenai. **New Later item:** the same pattern for the rest of the app. |
| `collection#1`, `collection#2` | Show the company's icon, not the full text | 1C. Needs a decision (D1 below). |
| `bk:productivity#4` | Fold into W3's layering pass | Phase 3, W3. |
| `bk:productivity#1` (No) | Duplicate, but yes I want it | It is `routines-in-routines`, which stays in 1C. |
| `bk:shell#5` (No) | Include, but it's a duplicate | Covered by Help & Guide in Phase 4. |
| `bk:shell#2` (No) | Only if truly beneficial | Left out. It changes nothing you would see. |
| `bk:shell#4` (No) | Would practically never use it | Dropped. |
| `bk:architecture-perf#4` (Later) | When building a new study space or heavily modifying one | Later, triggered by that event. The shared lesson reader comes first in that work. |
| `bk:a11y-hci#3` (Later) | Build when new themes are introduced | Later, tied to `rm:5.20`. Both move together (see below). |
| `rm:live2d` (Later) | Permission granted; you'll send it later | Later. The Live2D gate (`LICENSE_REQUEST.md`) stays shut until the written permission is in the repository. |
| `rm:validator-os` (No) | A separate backlog I won't look at until you mention it | Moved to `docs/qol/dormant.md`, which is not part of any plan. |

## Duplicates removed

**Phase 1 items that are the same fix as a W3 finding go to W3:**

| Item | W3 finding |
|---|---|
| `bk:study-core#2` | ST-17 |
| `bk:study-core#3` | ST-08, JM-24, CR-04 |
| `bk:creatives#3` | CR-18 |
| `bk:money-goals#5` | MG-25 |
| `ja-mind#6` | CR-22, CO-11 |
| `exams-files-ink#2` | EX-38, EX-03 |
| `exams-files-ink#5` | EX-31 |
| `shell#1` | AX-06, SH-17 |
| `goals#6` | AX-05 |
| `creatives#5` | CR-04 |
| `money-goals#6` | phone tier |
| `bk:productivity#4` | your note |

**Phase 1 items that are the same fix as a W9 finding go to W9:**

| Item | W9 finding |
|---|---|
| `a11y-hci#3` | AX-16 |
| `a11y-hci#5` | AX-08, SH-15 |
| `bk:a11y-hci#1` | AX-03, AX-09 |
| `bk:a11y-hci#2` | AX-17 |
| `assistant-archive#3` | AA-03 |
| `mind#1` | MI-18 |
| `exams-files-ink#4` | EX-48 |
| `study-core#2` | keyboard hints on touch |

**One exception goes the other way.** Phase 1 adds several Undo toasts:

- `collection#4`
- `creatives#9`
- `study-core#7`
- `achievements-governor#1`
- `productivity#7`

These need **the toast queue with keyboard-reachable Undo**, which is `bk:shell#3`,
`a11y-hci#4` and `shell#3`. That fixes W9's SH-36, SH-28 and AX-02. It moves *forward* into
1A, and those three findings close there.

**Other merges and moves:**

- `rm:due-subject` merges into `bk:study-core#5`.
- `code-space#1` and `bk:code-space#1` become one item.
- `creatives#2` and `creatives#8` become one item.
- `a11y-hci#6` (Help's eighth section mark) goes to Phase 4.

**Four test gates and helpers move to Phase 5,** where they are what that phase is for:

- the content lints (`bk:content-cs-it#2`, `bk:content-maths#3`);
- the coarse-pointer gate (`a11y-hci#1`);
- the cosmetic contract (`bk:shop-cosmetics#1`);
- the helpers and registries (`a11y-hci#2`, `architecture-perf#5`, `bk:assistant-archive#1`, `bk:assistant-archive#3`).

## Build items moved to Later (approved, D3)

These don't pay off now. None is a daily friction fix or a data-integrity fix.

| Item | Why it can wait |
|---|---|
| `rm:automation` ("when X, do Y") | Large, and new rather than a fix. Better designed once routines-in-routines and Goals' entry points exist. |
| `rm:5.20` themes designed as themes | Large, and needs your art. Your note ties the chip-ink contrast gate (`bk:a11y-hci#3`, `a11y-hci#8`) to it, so all three move together. |
| `bk:goals#4` (goal page lists what counted) | Large, and a nicety: the goal's number is already right. |
| `bk:creatives#1` (Portfolio per track, lightbox, share) | The Portfolio exists. This is presentation. |
| `bk:code-space#2` (language-aware task layout) | A redesign of a page that works. |
| `bk:architecture-perf#3` (a memo layer) | A refactor. W8 already memoised the heavy reads. |
| `architecture-perf#3` (content-hashed precache) | Only matters on a deploy, not in daily use. Worth doing with Phase 5's infrastructure if you want it sooner. |

I kept the large items that are your own requests (UR-9, UR-12, UR-13, UR-23, UR-29,
routines inside routines). I also kept the exam-season content because of the December mocks
and January's IT exam.

## Decisions (approved 19 Nov 2026)

The plan is approved with these decisions.

- **D1 · The icons on Collection links: no live favicon fetching** (CORS, offline).
  - **Default:** a local icon set for the common services, shipped as files with the app and drawn as `<img>`.
    The proposed source is the CC0 Simple Icons set, to confirm at 1C.
  - **Fallback:** a monogram for any other service.
  - **Your own icon:** you can upload one per service or domain. It is stored on the device (media kv)
    and rasterised to a PNG when you add it, so no inline SVG from you ever enters the page.
- **D2 · Copying maths as TeX (UR-13): approved.** It uses the web review-pack flow: export the page, paste the TeX
  reply back, and the app checks that it renders before saving. No in-app model reads the writing.
- **D3 · The seven moves to Later: all approved.**
- **D4 · The Neon trial: approved as written.** Neon works in its own folder on `neon/qol-starter-1` and pushes only
  `neon/*` branches.
  - **Files Neon has:** while its branch is open, 1A avoids the ones its tickets touch:
    - `goals.js`, `money.js`, `mindrun.js`, `assignments.js`;
    - `dataview.js`'s `resetDialog`;
    - `css/layout.css`'s search key;
    - `cs-p2-46b.js`.
  - **1A's restore report:** it touches `dataview.js` elsewhere, so it lands after Neon's branch is merged.

## The phases

### Phase 1 — Build and QoL (≈ 20–24 sessions)

1A and 1B run side by side: 1B's mocks are close and the two touch different files.

| Batch | Contents | Size |
|---|---|---|
| **1A · Bugs and data integrity** (21) | The Due today bug; review counts from the review log; the Writing Desk draft saved on close; flashcard and Japanese/Mind/Code runs that survive a reload; one "what changed" report after a restore or first link (merging `data-integrity#3/#4/#6`, `assistant-archive#1`, `bk:collection#2`); random ids for assignments, reminders and events; provider sync around each cycle; a replication version column (a migration, applied by hand and recorded); the stale-copy audit; Money import identity; the Bookkeeper badge counting distinct entries; the server-function clean-ups; the toast queue. | ≈ 4 sessions |
| **1B · Exam-season content** (11) | F201 papers 2–3; Maths' seven thin Pure topics; CS's thin topics and quiz top-ups; the flashcard quality pass (5.21); exam labels, the mark total beside codes, and other CS/IT fixes. Done by the mock dates first, then the rest. | ≈ 5 sessions, Opus |
| **1C · Your requests** (11) | Routines inside routines; pacing shift (UR-19) and pacing in calendar blocks (UR-29); folders for loose notes; paste a picture; ink tables and formatting; lasso across pages; copy as TeX (D2); Roslyn completion in Code; the watch link with the service's icon (D1). Each starts with a short design check with you. | ≈ 6 sessions |
| **1D · Daily friction** (57 small items) | Grouped by area, one commit each. Neon's seven starter tickets come from here. | ≈ 3 sessions |
| **1E · Features across areas** (23) | "Make this a goal" everywhere and Japanese/Mind goal types; Japanese practise-again, leech recovery and immersion logging; Money import steps 3–5 and the Recurring queue; Year view income; Mind review outside the Daily; Reminders → a free block or Focus; skip one showing of a repeat; Practice Log filters, thumbnails and milestone links; Creatives review packs; the showcase reorder and autosave; Reports from the subject registry; one Code runner status. | ≈ 4 sessions |
| **1F · Speed** (4) | Boot towards ~4 MB (Focus, Assistant, aitools, calendar, vaults and labs split into a boot part and a page part); the sample account off the boot; boot marks shown in Storage; 192 px badge art for the Wall. | ≈ 2 sessions |

**1A's working order** (branch `feat/qol-1a`; ✓ = done):

1. ✓ **The Due today bug** (your note) and `rm:due-subject`, in `6df150e` and `3f4211a`, with smoke196.
   - A plan row on Home's Focus card is measured by the time spent on it ("Today · 25 min on this").
   - A mixed Due today run counts its cards per subject for that subject's goals.
2. ✓ **`bk:study-core#1`** (`122a129`): Card stats' Reviews per day and Rating mix, and Today so far, read the review log.
   Reports stay on the session ledger: `compute` is pure and synchronous, and its facts are saved.
3. ✓ **`creatives#6`** (`f0cc5b8`): the Writing Desk draft is written on `pagehide`, on hiding and on leaving.
4. ✓ **`sync-disruption#3` and `bk:sync-disruption#2`:** already true, so now tested (smoke196 E), with no code change.
   - Japanese's sessions keep their place (`ja:reviews`, `ja:learn-…`, `ja:kana`).
   - Mind's Daily 15 keeps its place in `state.mind.ui.daily`.
   - Code keeps its drafts per device, and a retrieval keeps `code-rt:…`.
   - A part-rated Due today run picks up from its chip.
   - My 19 Nov check had marked these "partly" in error.
5. ✓ **The toast queue with keyboard Undo** (`61e3d83`, `286eb3f`).
   - Covers `bk:shell#3`, `a11y-hci#4` and `shell#3`, and closes W9's SH-36, SH-28 and AX-02, plus W3's SH-01: the stack is now centred and full-width on a phone.
   - Undo rows stack, three at most.
   - ⌘Z / Ctrl+Z outside a text field runs the newest Undo, and the spoken message says so.
6. ✓ **`bk:data-integrity#3`:** already built, with no code change.
   - Each provider cycle runs a cloud cycle before it reads the provider and before it gives the lease up (DI-01, smoke143 A).
   - A pending add is kept on the reminder as `ext.pending`, in the synced document (smoke135).
   - My 19 Nov check had marked it "partly" in error.
7. **`bk:data-integrity#4`: held, not built** (see the reply of 19 Nov).
   - A Postgres sequence number is handed out when a write starts, not when it commits. A slow write can therefore commit with a lower number after a reader's cursor has passed it: the same gap `updated_at` has.
   - The two-minute overlap (`KOS.sideSync.since`, invariant 36d) already covers it.
   - Making a cursor exact needs a snapshot horizon (`pg_snapshot_xmin`) served by an Edge Function. Built only if a missed row is ever seen.
8. ✓ **`bk:data-integrity#5`:** the audit for stale copies of state.
   - It found that `KOS.store.replaceState`, the cloud pull's take-in, replaced every top-level object. A page or module holding part of the state then wrote into a detached copy.
   - It now takes the document in place, as a tab merge already did (invariant 33d; smoke196 G).
   - The rest is clear: the only arrays of rows without ids are the plan's weeks, edited only through `KOS.pacing`, by `wb`. The `state.ui` writes are per device.
8a. ✓ **The gate's two findings on 19 Nov, both from 1A:**
   - smoke17: `cloudsync`'s snapshot of the device's own keys held references, which the in-place replace overwrote. It now takes copies.
   - smoke142: boot went 9 KB over budget, so `architecture-perf#2` (from 1F) came forward. The sample account (`sample.js`, 25 KB) is its own lazy bundle, fetched only in the Sample namespace, and the warm-up skips it elsewhere.
   - The boot budget moves from 7.89 to 7.87 MB.
9. ✓ **`rm:edge-hygiene`:** EF-01 to EF-08, in the code and NOT DEPLOYED. The functions deploy separately, on your go-ahead.
   - Every browser-facing function serves through `handler()`, so an uncaught error answers with CORS headers and an `error`.
   - A missing configuration, or an auth server that can't be reached, is a 503 with its `kind`, never "sign in".
   - The gateway's own 401 reads as an expired session on the client.
   - The AI health check survives one failed metering read.
   - github-token's status says `configured` when linked too.
   - The runner keeps one account's failure to that account (`failed` in the reply), and its result rows are per invocation.
   - Steam unreachable gives a page that says so.
   - Checked with the TypeScript compiler's syntax pass and smoke196 H (no Deno on this machine).
10. **Item 10** (20 Nov):
    - ✓ **`bk:money-goals#2`** (`64248eb`): a statement row of the same direction and exact amount as an entry typed by hand
      within three days (by name, or by amount when each is the other's one candidate) is skipped as "Same as …" and the
      typed entry takes the row's identity; Undo takes it back (smoke149 L, invariant 5a).
      **Held:** comparing the bank's balance with Money's own running total. Money's entries include cash and pot moves
      the bank never sees, so the comparison needs a decision on which entries count as the bank account.
    - ✓ **`money-goals#7`** (`64248eb`): the Bookkeeper counts distinct entries (a row imported twice is one).
    - ✓ **Boot** (`895b53b`): the commit above took boot 3 KB over budget. Creatives' pages (88 KB) moved to
      `page-creatives`, so the budget moves 7.87 → 7.80 MB (invariant 168).
    - ✓ **The one report** (`339c1d6`): `data-integrity#3/#4/#6`, `assistant-archive#1` and `bk:collection#2`.
      A restore and a first link say what they changed, counted per domain, in a toast with Details and on Backup &
      Restore; a link waiting on a backup offers "Download a copy of this device first"; Sync & Import says what the
      last pull changed (invariant 34; smoke150 H, smoke135 U, smoke196 I).
    - ✓ **`bk:data-integrity#2`** (`62e9e16`), after Neon's batch 2 merged: random string ids for assignments,
      reminders, lists, steps and events (`KOS.store.newId`), old numbers kept and read back by `KOS.store.idOf`;
      the Assistant's tools take either (invariant 33a; smoke196 J).

### Phase 2 — A full audit pass, the same as November's (≈ 3 sessions)

- **Areas:** the same 21 areas the November audit used, from a11y-hci to sync-disruption.
- **Findings:** the same schema (area prefix id, P0–P3, root cause, evidence as `file:line` plus a
  screenshot), and the same three accounts (yours as a copy, Empty, Sample).
- **Devices:** Mac, iPad in both orientations, iPhone, Split View 590 and Slide Over 375.
- **Focus:** heavier on what Phase 1 changed, but every area is swept for regressions.
- **Verification:** an adversarial pass checks each finding before it counts, as in November.
- **Output:** written to `docs/audit/2026-12/` on the audit branch, three Opus agents at a time, each committing after each area.
- **P0s:** a P0 (data loss, a broken flow) is fixed immediately, not held for Phase 3.

### Phase 3 — W3 and W9 with every new finding (≈ 6–7 sessions)

- **W3:** the 1240–700 tier (RC3), contrast inks and focus rings, the dead-space cluster, the page-by-page P2/P3s, the 13 items folded in above, and Phase 2's layout and touch findings.
- **W9:** the 200 findings, less the three the toast queue closed in 1A, plus Neon's Safari note (a dialog opened by a mouse click returns focus to the body, since Safari does not focus a clicked button; `openDialog` could remember the opener), plus the items folded in above and Phase 2's polish findings. W9 was frozen at 200; **folding Phase 2 in unfreezes it, as you asked.**

### Phase 4 — Help & Guide (≈ 3 sessions)

- **Help entries:** registered next to each view, with an annotated picture of the page (your Later note). A smoke test checks that every view has one, and the eighth section mark is added.
- **The written docs:** `docs/GUIDE.md`, plus the re-baseline of README, AGENTS, PROGRESS, ROADMAP and HANDOFF (AP-05, AP-06).
- **New pages:** the Changelog page and the What's New overlay.

### Phase 5 — Rules and infrastructure, so the same problems don't build up again (≈ 2 sessions)

- **Rules in CLAUDE.md and AGENTS.md** (Antigravity reads AGENTS.md, so Neon gets these too):
  - W8's four: ask before building, keep docs in sync, keep Help in sync, check every device;
  - use an existing helper before writing one;
  - colours, z-index and breakpoints only from tokens (invariants 26a, 47, 70);
  - cite and check the invariant a change touches;
  - a Changelog line with every user-facing release.
- **Gates:**
  - the content lints (markdown in steps, label-only explanations, two-option items, stems that depend on another);
  - the coarse-pointer 44 px / 16 px gate;
  - the cosmetic contract;
  - a CSS lint (raw colours, z-index and media widths outside the tokens);
  - a duplicate-helper lint (private copies of toast, plural, date and size formatters, matchMedia);
  - the store registry driving backup and restore;
  - the "state replaced" event;
  - badge measure errors logged.
- **Review checklist:** Neon's checklist (`docs/qol/neon/REVIEW.md`) becomes the review checklist for every contributor.

### Phase 6 — W10 (≈ 1–2 sessions)

- **The interactive review checklist:** an artifact with a database, modelled on the Graphite review. A tick per device and per account; each item cites the finding ids, the smoke suite and the device check that closed it.
- **The final technical report:** what was found, what changed, what was verified, what is still open.

## The Gemini 4 Neon trial (runs during Phase 1)

What the research found (sources in the reply):

- **Neon** came out on 18 November 2026, between Gemini 4 Hydrogen and Carbon.
- **Thinking levels:** LOW, MEDIUM, HIGH (the default) and XHIGH. Google suggests HIGH for multi-step agent tool loops and MEDIUM for routine coding.
- **Context:** a 1 M-token window, and temperature is ignored.
- **Benchmarks:** strong on agent benchmarks; on Terminal-bench and FrontierCode it is level with Opus 5.5 or a little behind.
- **Antigravity** plans with `/plan` (an Implementation Plan you approve), keeps a Task List, ends with a Walkthrough, and can drive Chrome with `/browser`. Terminal and plan review policies are set per project. It reads `AGENTS.md` (and `GEMINI.md`, `.agents/rules/`) from the workspace.
- **Not confirmed:** I couldn't confirm that the Antigravity app exposes the thinking level. If it doesn't, the default is HIGH.

How the trial is set up:

- **Tickets:** seven small, independent tickets from 1D.
  - None touches the store, sync, the router, the redraw policy, sessions, the Governor, `ui.js` or the service worker.
  - Each tests one habit: reusing a helper, keeping a style token, citing an invariant, or making the smallest diff.
- **The brief:** `docs/qol/neon/BRIEF.md`.
- **How I grade its branch:** `docs/qol/neon/REVIEW.md`.
- **Who does what:** I review and merge. Neon never merges, pushes to main or deploys.

---

# Appendix — every Build item, placed once

Generated from your marks (`decisions` on the review page, read 19 Nov) and `docs/qol/placement.json`. ⓝ = in Neon's starter batch.

**1B's progress** (branch `feat/qol-1a`; all done 20 November):

- ✓ `rm:5.22` F201 practice papers 2 and 3 (`c0c67c3`): Calderford City Council and Freshway. With paper 1 they reach
  every leaf of F201 (smoke181 B).
- ✓ `bk:content-maths#1`: all seven thin Pure leaves deepened with pages, figures, worked examples and an exam toolkit
  (4.3 `c5b5639`; 6.1 and 6.2 `9bd4eaf`; 7.2 `a2e337b`; 8.1 `af800d2`; 8.4 `c0b0ffd`; 8.6 `fb01ca8`).
  - Every new card and quiz item sits at the end of its leaf's bank block with a fixed key (100+), so no learner's
    schedule moves (`6f4e237`, `306d269`; each leaf's keys compared with the commit before).
  - The past papers hold few questions on these leaves, so they are deepened with the exam types those topics feed,
    not padded to a word count.
- ✓ `content-cs-it#4`: 4.3.4.3 (`9ac869e`), 4.2.7.1, 4.13.1.5, 4.4.4.1, 4.9.4.3, 4.9.4.6 and 4.9.4.9 each gain pages,
  figures and worked examples (all now above the old 10th percentile), with cards and quiz items keyed 100+.
- ✓ `content-cs-it#5`: 4.5.3.1, 4.5.4.1, 4.5.5.1 and 4.4.4.6 reach 11 quiz questions (keyed `qk` 100+).
- ✓ `rm:5.21` the flashcard pass: `tools/card_lint.mjs` (smoke197) flags label fronts, bare yes/no backs, backs over
  35 words and CS worked calculations. Every CS, Maths and IT card now passes: about 500 rewritten in place under
  their own keys, and the CS calculations moved to the quiz (`qk` 150+), with the later cards pinned so no key moved.
- ✓ `content-cs-it#2` (the 7-segment title was already fixed), `content-maths#2` (a Total row beside a worked
  example's codes), `content-cs-it#6` (every tariff chip shows its count), `#7` (the exam card reads "Q5 of 17") and
  `#8` (no "score 0" before an answer), in `3f9763a` with smoke196 K.
- ✓ `content-cs-it#3`: exam source labels in one shape, "AQA 2019 · P1 Q02" / "Edexcel June 2022 · P1 Q3": the
  separator before the paper, AQA's two-digit question numbers, "1 mark"/"n marks", and an AS item names its board
  (its level is its own chip). No month is invented where a label has none.
  - The one shape showed nine Maths questions listed twice, as an item and again from a worked card ("Edexcel
    Oct 2020 · P2 Q4" in 4.1, …): recorded in smoke116's baseline, not removed, since removing an item moves the
    keys after it. A later content pass merges each pair.

**1C's progress** (branch `feat/qol-1a`; no design checks needed, as you said on 20 November — a piece that needs a
Claude Design handoff or Gemini art asks for it):

- ✓ `routines-in-routines`: a step can run another routine ("↻ Run a routine…" in the editor). The inner routine keeps
  its own log, streak and pay; the outer step mirrors it both ways (ticked while the inner day is kept), ticking the
  run step ticks the inner routine, the player plays the inner steps in place under its name, and one Undo takes back
  the chain. Loops, itself and missing routines are refused (invariant 142; smoke196 M). Boot: Settings › Storage
  moved to first use (`page-storage`), budget 7.78 → 7.77 MB.
- ✓ Neon's batch 3 (C1–C5) passed with one note and is merged (`docs/qol/neon/REPORT-3.md`); with it in, Settings ›
  Connections moved to first use too (`page-connections`), keeping boot under 7.77 MB.

## 1A · Bugs and data integrity (21)

- `bk:study-core#5` Give Due today sessions per-subject segments so every subject/topic read counts review time. (open, S) — *your note: Due Today is not even currently personalised at all, say the task is Do Quadratics from pacing, even if I do CS Focus session that ber is being fille up.*
- `rm:due-subject` A mixed Due run counts toward each subject's goals (open, S)
- `bk:study-core#1` Read every review count (Today so far, Reviews per day, Rating mix, Reports) from KOS.reviewLog instead of session metrics. (open, S)
- `creatives#6` Writing Desk drafts autosave on a 600 ms debounce only; flush on pagehide so a draft typed just before closing the iPad app is kept. (open, S)
- `sync-disruption#3` Keep a partly rated flashcard batch resumable from the Due today chip after leaving the page (partly, S)
- `bk:sync-disruption#2` Per-view session store for transient study state, so engines resume after any remount, reload or iPad app kill (partly, M)
- `data-integrity#3` After a restore or first link, toast what was merged or replaced, naming the counts per domain. (partly, M)
- `assistant-archive#1` Show the backup file's date and counts in the restore toast and on the Data page after a restore (partly, S)
- `data-integrity#6` Restore report: say which sections the file did not carry (saved Reports) and which per-device sync records were reset. (partly, S)
- `bk:collection#2` A 'unchanged' count in bulkUpsert results and a since-last-sync summary on Sync & Import. (partly, S)
- `data-integrity#4` Add a 'Download a copy of this device first' button to the first-link dialog. (open, S)
- `bk:data-integrity#2` Replace per-device counter ids for assignments, reminders and events with random string ids, as Money, Routines and Exams already use, retiring rek… (open, M)
- `bk:data-integrity#3` Make provider sync state-consistent: pull and push the cloud state around each leased cycle, and keep pending provider adds in synced state so any… (partly, M)
- `bk:data-integrity#4` Use a monotonic version column (bigserial) as the replication cursor for every kos_* table. (open, M)
- `bk:data-integrity#5` Audit every view for sub-objects of KOS.store.state captured at render and written later (stale after replaceState); with redraws held on task page… (open, M)
- `bk:money-goals#2` Import revamp, step 2 — identity and reconciliation: store per row its source (bank, account, FITID or a hash of date+amount+description+balance+oc… (partly, M)
- `money-goals#7` The Bookkeeper badge counts imported duplicates; once identity exists, count distinct entries. (open, S)
- `rm:edge-hygiene` Server function clean-ups EF-01 to EF-08 (clearer errors, one failing user never stops the runner's tick) (open, M)
- `bk:shell#3` A toast queue with stacked Undo actions, and inline Undo on Daily Review rows. (partly, S)
- `a11y-hci#4` Pause the toast timer while it is hovered or focused, and give Undo toasts a Cmd/Ctrl+Z shortcut (open, S)
- `shell#3` Scale toast duration to message length and pause it on hover/focus. (open, S)

## 1B · Exam-season content (11)

- `rm:5.22` F201 practice papers 2 and 3, to the SAM's blueprint (roadmap 5.22) (open, M)
- `bk:content-maths#1` Deepen the thin core leaves (8.4, 8.1, 6.1, 6.2, 4.3, 7.2, 8.6) to the 4.1/M7.x depth with figures (open, L)
- `content-cs-it#4` Thin CS leaves to top up: 4.9.4.6 (584 words), 4.9.4.9 (634), 4.9.4.3 (765), 4.2.7.1 (776, 3 exam), 4.3.4.3 (779), 4.13.1.5 (798, 2 exam), 4.4.4.1… (open, L)
- `content-cs-it#5` Merged leaves 4.5.3.1, 4.5.4.1, 4.5.5.1 have only 8 quiz questions, 4.4.4.6 has 7 (open, M)
- `rm:5.21` A flashcard quality pass: vague prompts, bare yes/no answers, over-long 'Describe' cards, CS calculations moved to the quiz, plus a card checker (r… (open, L)
- `content-cs-it#2` Typos: 4.6.4.1 worked title 'The 7-segment segment' (open, S) ⓝ
- `content-cs-it#3` Normalise exam source labels to one format ('AQA June 2025 · P1 Q01.1') (partly, M)
- `content-maths#2` Show the mark total beside each worked example's codes so authors and learners see a mismatch (open, S)
- `content-cs-it#6` Tariff chips could show their counts ('3–5 marks · 5') like 'All · 17'. (partly, S)
- `content-cs-it#7` Exam card header 'Q5' while the filtered list reads 'Question 1 of 5': say 'Q5 of 17' or renumber within the filter. (open, S)
- `content-cs-it#8` Inspector prints 'Quiz best 0%' and the quiz header 'score 0' on an untouched topic (invariant 77) — study-core's to fix. (partly, S)

## 1C · Your own requests (11)

- `routines-in-routines` Routines inside routines: a routine step that is itself another routine (e.g. a Morning routine that runs your Skincare routine) (open, L)
- `UR-19` Pacing: shift the plan by N weeks in one action (open, M)
- `UR-29` Pacing inside the calendar's blocks: a Maths lesson or study block carries that week's plan rows, ticked from the block (UR-29) (open, L)
- `UR-14` Folders for loose notes (UR-14) (open, M)
- `UR-10` Ink: paste a picture on the iPad, with a Paste button (partly, S)
- `UR-12` Ink: tables and rich formatting (bold, lists) in handwritten pages (UR-12) (open, L)
- `UR-9` Ink: lasso across pages and parts of a picture (open, L)
- `UR-13` Ink: copy maths as TeX (open, L)
- `UR-23` Code editor intelligence: live error underlines and completion while you type, from Roslyn in the existing worker (UR-23) (partly, L)
- `collection#1` Per-title 'Where I watch/read it' link: add a manual-layer field `watchUrl` (plus optional `watchLabel`) to mediadb.normalise (no new index, so no… (open, L) — *your note: Show Company Icon rather than full text.*
- `collection#2` Add 'Open on AniList / VNDB ↗' from externalIds in the editor header. (partly, S) — *your note: Show Company Icon rather than full text.*

## 1D · Daily friction (small fixes, by area) (57)

- `productivity#1` Daily Review Time left: after placing a block, mark the row 'Placed 15:30' (and remove that free block) so the same item isn't placed twice. (partly, S)
- `productivity#2` Week view: open on the first event or 07:00 when 'now' is outside working hours, instead of centring on 05:00. (open, S)
- `productivity#3` Focus mini player (Mac): show the subject or objective beside the clock; the tiny progress ring next to the time is barely readable. (open, S)
- `productivity#4` Routine player (Mac): it has both an ✕ and a 'Close' in the side panel; keep one. (open, S)
- `productivity#6` Calendar: stored events with unknown types (e.g. 'other' from imports or the seeder) render with no hue at all; run the stored events through KOS.c… (open, S)
- `productivity#7` Reminders: offer 'Remind me again tomorrow' (snooze) on an overdue row and in the reviews, instead of only Tomorrow/Done. (open, S)
- `productivity#8` Routines: show 'kept late' in History when a day was kept after its window. (partly, S)
- `study-core#1` Reveal the selected tab whenever a scroller's selection changes (topic tabs, flashcard modes). (partly, S)
- `study-core#3` Print relative dates in the study editor and assignment rows ('due 29 Oct', '4 days overdue'). (partly, S)
- `study-core#4` Give the 'charts →' column in Card stats a header, or make the whole row the link. (open, S)
- `study-core#5` Resource removal dialog says it 'will be removed from the table' — there is no table (hub.js Remove resource?). (open, S)
- `study-core#6` Retention / exam-day target selects give no confirmation toast when changed. (open, S)
- `study-core#7` Subtask ✕ deletes with no undo. (open, S)
- `study-core#8` 'Session complete · N cards graduated' says graduated for cards that only moved a few days; 'N reviewed' is plainer. (open, S)
- `study-core#9` Assignment subject filter lists every space (Code, Japanese, Creatives, Mind) in KOS_DATA order rather than KOS.subjects' order. (open, S) ⓝ
- `money-goals#2` Day chart: tapping a day opens Transactions filtered to that day. (partly, M)
- `money-goals#3` Pots 'Recent moves → Transactions' should open Transactions filtered to pot moves (there is no transfer filter today). (open, S)
- `money-goals#4` Overview's Safe to spend side card has a ~77px empty spacer above the In/Out rows in the low-data state (seen at mac and iPad landscape). (open, S)
- `money-goals#5` The page kicker reads '円 · The month' on Pots, Recurring and Transactions too. (open, S) ⓝ
- `goals#2` Show the measure's meta ('Needs 50 reviews to measure') on the goal page, not only on cards (partly, S)
- `goals#3` Restart button says 'Restart for <Month>' but sets the old span from today; name the new dates (open, S)
- `goals#4` Label the Home ring's number ('days left') (open, S)
- `goals#5` Exam goal Save announces 'Goal added' on edit too (goals.js:942) (open, S) ⓝ
- `mind#2` Let the Journal's 'Make it the Big Question' also work from the Daily's capture step (capture a question and set it in one go) (open, S)
- `mind#4` Pluralise '1 bullets' and other counts in Mind sheets (open, S) ⓝ
- `mind#5` Show HEADERS[].purpose lines on the Path page section heads (open, S)
- `ja-mind#1` 'Back to the desk' at the end of a learn session opened from a lesson should return to that lesson (open, S)
- `ja-mind#2` Show which answers were missed on the session end card with a 'Try the misses again' (no pay) (partly, S)
- `ja-mind#3` Confirm before leaving a checkpoint mid-way (✕ discards it silently) (open, S)
- `ja-mind#4` Name the two 'Hiragana' badges apart (all 46 held vs the Hiragana checkpoint) (open, S)
- `creatives#3` Empty Practice Log and Writing Desk empty states have no action ('Start A1.1', 'New draft'). (partly, S)
- `creatives#7` The subject strip lights 'Creatives' on every page outside KOS.crPages (log, settings, check, project); a lit 'Practice Log'/'Settings' state would… (partly, S)
- `creatives#9` Taking a piece out of the Portfolio has no toast or Undo. (open, S)
- `creatives#10` Writing Desk versions: add 'Restore this version' beside 'Compare with now'. (open, S)
- `creatives#11` References: a Back / 'Previous seed' and a way to type a seed, since 'the same seed is the same drawing' but the page only offers Next. (open, S)
- `creatives#12` Sketchbook brief: the Given / Your one variable list wraps into a narrow 4-line column beside a wide label column (shots/creatives/t/sketch-mac.png… (open, S)
- `code-space#2` Make the 'missing' items on a capstone's Result step look like links (they are buttons styled as muted text). (open, S)
- `code-space#3` Offer download size and on-device size together in the runtime dialog ('≈ 11 MB download · 30 MB on this device'). (partly, S)
- `code-space#5` Add a 'Next task' / 'Back to lesson' button after a task passes (the earlier pass also noted the clock keeps running). (open, S)
- `home-reports#1` Show the habit count in the Routines header even while a routine is due (open, S)
- `home-reports#2` Give Reports' Topics tile a caption (partly, S)
- `achievements-governor#1` Undo on the purchase toast (partly, S)
- `achievements-governor#2` Group a badge's tiers earned in one sweep in Recent (open, S)
- `achievements-governor#4` Scroll the title detail into view on tap (open, S)
- `shop-cosmetics#1` Shop stage's owned chips show only the first 5 kinds (of up to 13) with no '+N more'. (open, S)
- `shop-cosmetics#3` The preview sheet for an unaffordable item says 'Pinned' but has no Unpin there; add Unpin. (partly, S)
- `shop-cosmetics#4` 7-item Outfits grid leaves an empty 4th cell at 1470px; centre the last row or use 7-friendly columns. (open, S)
- `shop-cosmetics#5` The empty Edit-seat 'Upload an image' tile wraps 'or larger' onto its own line and leaves its row half empty. (open, S)
- `collection#4` Undo on vault delete and on Mark purchased. (partly, S)
- `collection#5` Clear filters as the primary action of a filtered empty state. (open, S)
- `assistant-archive#2` Let the Permissions filter also match tier ('ask', 'blocked') to find changed tools quickly (open, S)
- `assistant-archive#4` Return focus to 'Reset everything…' when its dialog is cancelled (open, S) ⓝ
- `shell#2` Hide the '/' search badge on touch devices without a keyboard. (open, S) ⓝ
- `shell#4` Give the hold-⌘ sheet a per-page group so each view lists its own keys. (open, S)
- `shell#5` Mark Home as current on Reports pages. (open, S)
- `content-maths#4` Phone layout for worked steps: label above the working so maths gets the full width (open, S)
- `exams-files-ink#3` One shared file-size formatter (partly, S)

## 1E · Features across areas (23)

- `bk:goals#2` A 'Make this a goal' entry point from routines, pots, exams' readiness, Collection titles and Money budgets so goals are created where the data lives (partly, M)
- `bk:goals#3` Japanese and Mind goal types (facets reviewed, lessons finished, Daily 15 days) to match the other study spaces (partly, S)
- `bk:ja-mind#1` Unscheduled 'practise this lesson again' mode that moves no facet (partly, S)
- `bk:ja-mind#4` Leech recovery flow (relearn from the lesson, Back in the schedule) (partly, M)
- `bk:ja-mind#5` Input logging through a Japanese immersion Focus choice (partly, M)
- `bk:money-goals#3` Import revamp, step 3 — information a Santander student needs: merchant normalisation ('HERON FOODS HOYLAND (VIA APPLE PAY), ON 29-10-2026' / 'CARD… (partly, S)
- `bk:money-goals#4` Import history page (Archive or Money › Imports): every batch with file name, date range, counts (added, duplicates, unreadable), and Undo / Delete… (partly, S)
- `bk:money-goals#6` A 'Not yet confirmed' queue for Recurring covering every past occurrence, with Confirm all / Skip all and automatic matching to imported rows. (partly, M)
- `money-goals#1` Year view: draw income at its height so in vs out reads at a glance. (open, M)
- `mind#3` Add a 'Just review my Mind cards' entry outside the Daily 15 (Review › Due today does not include Mind cards) (open, M)
- `productivity#5` Reminders: a 'Place in a free block' / 'Focus on this' action on a reminder, to tie Reminders to Focus and the Calendar. (open, M)
- `productivity#9` Calendar: 'Skip this showing' for a repeating event (the model already has a skip list for Google). (open, M)
- `creatives#1` Practice Log rows show the track glyph instead of a thumbnail for picture works; a small thumbnail would make the log scannable (js/modules/creativ… (open, M)
- `creatives#2` Practice Log has no filter by track or lesson and renders every work at once; add a track filter and 60-row lazy batches before it grows. (open, M)
- `creatives#8` Practice Log: filter by track / study / 'check to do', and show 'check to do' on saved-but-unchecked rows (the study card says it, the log does not). (open, M)
- `creatives#4` Project page milestones that are done do not link to the work that reached them, and the page has no link back to its unit's lessons. (open, M)
- `rm:creatives-assistant` A per-lesson Creatives tool for the Assistant (open, S) — *your note: Although, while this is kinda separate too, for all creative parts where relevant lets outsource reviewing and everything to Gemini/Claude on the web via my subscription, similar to how we've done it for Exams & Papers. This could actually be applicable to many other areas within the app (not just creatives) - so we'll add that to the to-do list. But we can also include the option to ask Kurenai too.*
- `rm:showcase-reorder` Drag to reorder the Badge Wall's showcase (open, S)
- `achievements-governor#3` Autosave the Wall's showcase (open, S)
- `shop-cosmetics#2` 'Pin as a goal' is a shop-only pin; offer it as a Goals 'save gold for X' goal so it shows with other goals. (open, M)
- `bk:home-reports#2` Use one subject registry (KOS.subjects) for every Reports surface (partly, S)
- `code-space#1` Show the remaining-time limit and 'Loading SQLite…' / 'Starting .NET…' states on Run while a runner boots. (partly, S)
- `bk:code-space#1` A single runner-status model shared by tasks, listings, retrieval and capstones (booting / ready / busy / failed) so timeouts during boot never rea… (partly, M)

## 1F · Speed (4)

- `rm:boot-4mb` Boot down to about 4 MB (now 7.89 MB) by loading more page code on first use (partly, L)
- `architecture-perf#1` Add performance.mark('kos-boot')/('kos-ready') in main.js and print them in Archive > Storage, so boot time is visible and testable (partly, S)
- `architecture-perf#2` Ship js/core/sample.js (25 KB dev-only sample account) only to dev hosts or behind a lazy load (open, S)
- `architecture-perf#6` Badge art is 384 px for 56-80 px medals (299 files, 11.7 MB); a 192 px variant for the Wall grid would halve its 3.7 MB first load (open, M)

## Phase 3 · folded into W3 (13)

- `rm:W3` Quality workstream W3: layering, layout tiers and touch (160 findings; with design turn 37's topic inspector strip) (partly, L)
- `bk:productivity#4` Unify KOS.ui.menu layering: a single top-layer root (or native popover API) that every menu, picker and toast uses above modals. (partly, M) — *your note: Fold into W3's layering pass*
- `bk:study-core#2` An iPad-portrait design for the topic page: the inspector and the spine as overlay sheets, the tools in the header. (partly, M)
- `bk:study-core#3` A shared study-space hero with a path strip of one fixed height for CS/Maths/IT as well as Code, Japanese, Mind and Creatives. (partly, M)
- `bk:creatives#3` A phone composition for the sketchbook and Writing Desk on iPad portrait (toolbar-first, side panel as a drawer). (partly, M)
- `bk:money-goals#5` Touch layout for Transactions: tap opens the entry in a sheet; 'This view' totals computed for the whole range (a count query), shown above the list. (partly, S)
- `ja-mind#6` Spine subject pills clip 'Creatives' at iPad landscape width (partly, S)
- `exams-files-ink#2` Put Undo/Redo first in any narrow ink bar (open, S)
- `exams-files-ink#5` Label the Full Companion's number columns (open, S)
- `shell#1` Show the routing target of each rail item as a tooltip/long-press label on the collapsed rail and iPad tile rail. (open, S)
- `goals#6` Domain pills 29px tall on mac; raise to 32px (open, S)
- `creatives#5` The desk's 'Start here' card (empty account) is 340 px tall for a sentence and a button. (open, S)
- `money-goals#6` The phone FAB covers the amount column of the row under it while scrolling Transactions (r2-tx-iphone.png). (open, S)

## Phase 3 · folded into W9 (9)

- `rm:W9` Quality workstream W9: polish and HCI (200 findings: keyboard, toasts, page titles, sound, haptics) (open, L)
- `a11y-hci#3` Use one KOS.ui.addBtn(label) helper so '+'/'＋' and the 'New/Add' verbs stay consistent (open, M)
- `a11y-hci#5` Set document.title per view from the router (open, S)
- `bk:a11y-hci#1` A feedback-channel setting (sound on/off and volume for the Focus chime and the idle warning, plus 'notify me when a cycle ends' for when the page… (partly, M)
- `bk:a11y-hci#2` Implement the ARIA tabs pattern once in KOS.ui.tabs (roving tabindex, arrows, aria-controls/tabpanel), or move view switchers to aria-current buttons (partly, M)
- `assistant-archive#3` Hide 'Shift + Enter for a new line' on touch devices without a hardware keyboard (open, S)
- `mind#1` Show the next revisit date on each position and in the Daily intro (open, S)
- `exams-files-ink#4` Empty states carry their own action button (Practice, Library) (partly, S)
- `study-core#2` Say 'tap to flip' on touch devices and hide keyboard badges (↵, Space, 1-4) there. (open, S)

## Phase 4 · Help & Guide (2)

- `rm:help-guide` Help & Guide for every area, and the docs brought up to date (W8's last part) (open, L) — *your note: Separate to this but I also want a Chanellog page that lists a history of new user-facing features, and a What's New overlay after a deploy and update.*
- `a11y-hci#6` Add an eighth Help section mark (Data & housekeeping shows '·') (open, S)

## Phase 5 · rules and infrastructure (8)

- `a11y-hci#1` Add one smoke check that, at pointer:coarse, fails on any visible interactive box under 44px and any field under 16px at 402px (partly, M)
- `a11y-hci#2` Add KOS.ui.reducedMotion() and KOS.ui.scrollBehavior() helpers to replace five private matchMedia copies and twelve literal 'smooth' calls (open, S)
- `architecture-perf#5` Log measure exceptions in achievements.js measureOne (console.warn once per badge) instead of silently returning null (open, S)
- `bk:assistant-archive#1` A single registry of persisted stores that drives snapshotFull/importFull, the coverage card and a smoke check (partly, M)
- `bk:assistant-archive#3` A 'state replaced' event that every in-memory cache (HUD, files index, theme, ink index) subscribes to (partly, S)
- `bk:content-cs-it#2` A content lint in the smoke gate: validate_content, near-duplicate flashcards, quiz answer-position balance, duplicate exam src per leaf, markdown… (partly, S)
- `bk:content-maths#3` A content lint in validate_content for Maths: duplicate cards across base/bank, worked mark sums, label-only whys, callout kinds, two-option items,… (partly, S)
- `bk:shop-cosmetics#1` One cosmetic contract: every item kind declares its surfaces, and a smoke test wears each item and asserts its art/CSS renders on each surface (wou… (partly, M)

## Phase 6 · W10 (1)

- `rm:W10` Quality workstream W10: the interactive review checklist and the final report (open, M)

## Moved from Build to Later (7)

- `rm:automation` An automation engine ('when X happens, do Y') (open, L)
- `rm:5.20` Themes designed as themes, not recolours: each with its own ground, surfaces, header and art (roadmap 5.20) (open, L)
- `bk:goals#4` Goal page: list what counted (the sessions, titles or transactions inside the range) with links, so a goal is auditable (open, L)
- `bk:creatives#1` A Portfolio view per track with a lightbox and export/share of a chosen piece. (partly, M)
- `bk:code-space#2` Language-aware task layout (console, method, SQL, Rider command) instead of one console template. (partly, M)
- `bk:architecture-perf#3` A small memo layer keyed on a store revision for readiness, code unit state, calendar derived items, srs.allCards and badge values (partly, M)
- `architecture-perf#3` Content-hash or ETag-revalidate the precache so a sw VERSION bump does not re-download all ~18 MB of unchanged scripts (open, L)

## Already Later in your marks (30)

- `rm:mediakv-sync` Sync your per-device picks (vault heroes, season scenery) across devices
- `bk:data-integrity#1` Move the state document (or its big parts: srs, sessions, facets) from localStorage to IndexedDB with per-record writes 
- `rm:mind-f2` Mind units after F1
- `rm:tts` The Assistant speaking aloud (text to speech)
- `rm:5.18` The portfolio capstone: a visual novel made with what Code, Creatives, Japanese and Mind teach (roadmap 5.18)
- `data-integrity#2` Connections: show the last cycle's refused commands and duplicate links, with a 'Fold duplicates' action.
- `bk:architecture-perf#1` Lazy content loading: a per-subject/unit content manifest behind KOS.content.get, loading files on first open and a preb
- `rm:creatives-more` More Creatives units: Art 4 onwards, Design 3 onwards, Writing 4 onwards, and the Editing track
- `rm:cs-p1-companion` The full exam Companion for CS Paper 1 (every question shape, worked, per topic, as Paper 2 has)
- `bk:shop-cosmetics#2` Tag scenes/halls/banners with season and time of day for real seasonal rotation.
- `bk:mind#1` Author apply/explain/evaluate routes for every F1 concept (or per-concept rung sets) before F2
- `rm:wallpaper` The art audit's leftover: a Wallpaper area of painted art
- `bk:content-cs-it#1` An IT depth contract and smoke (like smoke65/66) for F201 and F206: worked levels-of-response answers, 6+ exam items, 10
- `bk:architecture-perf#4` Extract a shared lesson reader and checks-sync helper before the next study space — *your note: Implement either when building a new study space, or heavily modifying the current ones.*
- `rm:code-tracks` Code's deepening modules and the tracks after T1 and T2
- `a11y-hci#8` Give light themes a shared paper-restatement block so new light shop themes inherit Dawn's contrast fixes.
- `bk:architecture-perf#5` Split hub.js (home, topic page, backup, search listbox), aitools.js (per-domain tool registration) and governor-ui.js (s
- `bk:collection#1` One shared editor scaffold for all four vaults (score, cover, progress, bump, delete) so modules only add their own sect
- `bk:mind#3` Tension pairs content (TENSIONS is empty; the UI path is unreachable)
- `UR-6` Device continuity: pick up a running Focus or routine timer on another device, as an option (invariant 33b: a timer is p
- `bk:exams-files-ink#1` Auto-detect page corners in Scan pages
- `creatives#13` Critique stray filter is keyword-only: 'converge to a vanishing point' passes for A2.1 although perspective is on its ig
- `rm:ja-reader` Japanese's reader, media and immersion pages (design 28h, 28i, 28l)
- `bk:assistant-archive#2` Help & Guide generated from per-view help entries registered next to each view — *your note: Build at the end of the audit/implementation phase. Also would need to update existing features and include more visualisations/diagrams with annoted features of what the page includes. Maybe even a full visual of the page with callout labels on every aspect.*
- `rm:reports-voices` Reports' voice actors and creator portraits (decision C, deferred)
- `rm:live2d` Live2D Kurenai (an animated assistant) — *your note: They've granted permission i'll send you that later, but this isn't a priortiy at the moment.*
- `rm:maths-companions` Full exam Companions for Maths Papers 1–3
- `bk:a11y-hci#3` A 'chip ink' token per role for Dawn and dark themes, with an automated contrast gate over chips and buttons in every sh — *your note: Build when new themes are introduced.*
- `rm:mascots` Alternate mascots and logo families (Fallen Crown, Faded Oath)
- `rm:ja-f3-f6` Japanese Stage 1 units F3–F6

## No (13)

- `goals#1` Undo toast after a manual +1 and a -1 step
- `bk:shell#5` Bring Help & Guide and docs/GUIDE.md up to date with Money, Goals, Reports, the Exams hub, Code, Japanese, Mind, Creativ — *your note: Include, but it's a Duplication.*
- `bk:shell#4` A short-landscape composition for iPhone sideways (phone shell by height feature query) with left/right safe areas. — *your note: Would practically never use it that way.*
- `bk:productivity#1` Routines inside routines: a step can reference another routine. Model: add step.sub = <routineId> in normaliseStep (js/c — *your note: Isn't this a duplicate of what you listed earlier, but yes I want.*
- `rm:validator-os` The Rider validator on Windows and Linux — *your note: I'm only using mac so this isn't needed. But it may be good as a just in case later on, put it in some seperate backlog that we don't look at at all until i mention it.*
- `collection#finding` No link out to the title's AniList/VNDB page, and nowhere to keep 'where I watch/read it' (QoL) — Add the field to norma
- `bk:shell#2` Per-view route codecs declared beside each KOS.views registration, with a smoke test that round-trips every KOS.show cal — *your note: Only if its truly benefical.*
- `UR-18` Kurenai drawer: a clear collapse control (the Hide chip is easy to miss)
- `bk:achievements-governor#2` A refund or return window for shop items
- `bk:productivity#2` Calendar Agenda view for Mac and iPad: a 2-week scrolling day list beside the Today/Countdowns column, sharing the phone
- `rm:code-phone` Code's full C# runtime on a phone
- `content-cs-it#1` Show the per-leaf worklist /Users/fj/Developer/KurenaiOS - Web/audit-evidence/2026-11/qa/content-cs-it/worklist2.txt to 
- `CL-11` Anime: where I am watching links
