# KurenaiOS quality programme — audit handoff (2 Nov 2026)

**Read this first if you are continuing the audit from another Claude account.**
It is self-contained: you should not need the user to re-explain anything. The
original request is reproduced in §1; everything found so far is in
[`FINDINGS.md`](FINDINGS.md) (generated) and the raw auditor output in
[`findings/`](findings/).

**Phase right now: INVESTIGATION (audit), not implementation.** Nothing in the
app has been changed. The user has NOT approved any plan. Do not start
remediation until the user has reviewed the consolidated findings + plan and
explicitly approved it (they plan to start implementation on Sunday 8 Nov 2026
from their first account, unless the audit and plan are finished sooner).

---

## 0. TL;DR for the next account

1. Read §1 (what the user asked for), §3 (where things stand), §6 (root causes).
2. **First check the checkout is production code:** `git fetch && git status`
   — the branch must contain `origin/main` (`grep VERSION sw.js` →
   `kos-redraw-1` or later). See §2.2: two areas were audited on a stale tree.
3. Finish the audit EXHAUSTIVELY (§5.2b: a feature inventory + behaviour checks
   for every area, not just its pages): run the areas in §4 marked **not run** /
   **partial**, then the inventory pass over the rest, with
   the harness (§5), in batches of ≤ 3 auditors, each saving findings as it
   goes (the usage limit killed 3 earlier full runs — see §5.3).
4. Re-run `python3 -I docs/audit/2026-11/harness/consolidate.py` after adding
   findings to `findings/` (ids are frozen once issued; new ones get the next
   number).
5. Run a completeness critic + adversarial spot-verify of the P0/P1 list.
6. Write the remediation plan (draft outline in §8) as the user's first
   deliverable, then STOP and ask for approval.

---

## 1. The user's request (the programme), in full

The user (sole user/developer of KurenaiOS; A-Level student: AQA CS 7517,
Edexcel Maths 9MA0, OCR IT; uses it daily) asked for a comprehensive quality,
reliability and maintainability programme — **not new features** — so that
KurenaiOS becomes a production-quality *personal operating system* (not a set
of separate apps: everything interlinked, coherent).

### 1.1 Scope of the audit
- **UI/visual** on desktop, iPad and iPhone, all orientations, states, themes.
- **UX/usability**: how it feels, navigation, workflows, consistency.
- **Functionality/correctness**: bugs, edge cases, broken features.
- **Reliability/data integrity**: persistence, sync, state, imports, exports,
  backups, recovery.
- **Performance**: real bottlenecks.
- **Integration**: how modules/shared systems/external services interact.
- **Architecture/refactoring**: tech debt, duplication, coupling — classify as
  necessary / high-value / optional; no rewrites for their own sake.
- **HCI needs** must all be met: Purpose, Layout, Navigation, Colour,
  Accessibility, Messages, Audio, Haptic.
- Use the real app (browser, Computer Use), not only source reading. Be truly
  exhaustive — the user wants to find almost nothing left when they review.

### 1.2 Process the user mandated
1. Repo assessment + safe baseline → 2. exhaustive audits → 3. **consolidated
   findings + remediation plan (priorities, dependencies, root causes,
   approaches) presented for approval** → 4. only after explicit approval:
   implementation (bug fixes, UX, reliability, perf, justified refactors),
   validated by tests + manual + regression checks → 5. a **new interactive
   HTML review checklist** for the user's own acceptance review, modelled on
   the *Graphite Review* checklist — **the reference file is
   [`reference/graphite-review.html`](reference/graphite-review.html)** (the
   user supplied it on 2 Nov; it was a claude.ai artifact with a `db`). Keep
   its concept and presentation: sections with a kanji mark and a done count,
   items as title + "what to check" detail, per-item ticks for EACH account
   (Full/Sample and Empty — for this programme add the three devices
   Mac/iPad/iPhone), an Issue flag with a note box that opens on flag, a
   sticky summary bar (checked counts, issues, a meter, All / To do / Issues
   filter), "Copy issues and notes" for pasting into chat, local-first saving
   with the artifact `db` (`claude.use("db")`, collection `checks`) when
   available, light/dark tokens. It must be far more comprehensive than the
   original (that one was desktop-only, one theme, ~60 items): cover every
   area, device, theme, workflow, sync, data-integrity and regression check of
   this programme, and link each item to the finding ids it verifies → 6. a **final technical report** (what was found,
   changed, verified, outstanding, overall state).
- If something needs a **redesign**, write a **Claude Design prompt** (not for
  small changes; see `docs/design-prompts.md` for the existing ones). If
  **assets** are needed, add them to a **Gemini art sheet/manifest** (CLAUDE.md
  "Assets the user makes"); never draw raster art in SVG.
- After the main audit+fixes: suggest **QoL improvements** (small); bigger
  ideas go in a **backlog**, not the immediate plan.
- Maintainability practice to add to CLAUDE.md/AGENTS.md (the user insisted):
  - **Question the user** about necessary things before building a feature
    (e.g. Money was built without asking which bank/exports they use).
  - **Keep docs in sync**: docs are constantly out of date and full of stale
    content; README, PROGRESS, ROADMAP, docs/*.md, CLAUDE.md must be updated
    with each feature, stale content removed.
  - **Help & Guide in the app must be updated** with every feature (it has
    nothing on Money and Goals — confirmed SH-10/SH-11).
  - **No laziness after a feature lands**: check the UI/UX on all three
    devices, every state, before calling it done.

### 1.3 The user's devices (prioritise exactly these)
| Device | CSS viewport | Harness size |
|---|---|---|
| MacBook Air 13" M4 | 1470×956 screen; Chrome viewport ≈ 1470×832 | `mac` |
| iPad Air 11" M4 (Home Screen app, touch, Pencil Pro) | 820×1180 portrait, 1180×820 landscape | `ipad`, `ipadl` |
| iPhone 17 (6.3") | 402×874; Safari's visible area ≈ 402×760 | `iphone`, `iphonesafari` |

### 1.4 Standing design rules the user repeats
- **No dead space** — including in WIDTH (a full-width row using a quarter of
  it; a card far taller than its content; an empty right column).
- Alignment; things centred in their panel/button/circle; circles not ovals;
  icons not too small for their button; consistent sizes of equivalent
  elements (e.g. study-space heroes all different heights — confirmed ST-08);
  remove generally bad-looking things. Reuse existing components.
- Design handoffs are a guide, not 1:1 (memory `design-handoff-not-1to1`).

### 1.5 Specific complaints the user raised (and where they stand)
| User's complaint | Status | Finding(s) |
|---|---|---|
| Governor "⋯" menu (HP preview) clipped behind the hero | **Confirmed**, root cause: stage overflow/z-index | SH-03, AG-01 |
| Code Daily 20 card: chips one per line, CONTINUE clipped | **Confirmed** | CO-02, CO-03 |
| Creatives settings: day letters not centred in circles | **Confirmed** (letters at the left edge; circles become ovals on touch) | CR-07 |
| Money: midata CSV fails; data not useful; duplicates; no delete/overwrite of an import | **Confirmed, all root-caused** | MG-01 (P0) … MG-10 |
| Gold shop (art release) lazy: avatars not centred | **Confirmed** | SC-01 |
| Frame rings don't fit | **Confirmed** (55px avatar in 179px frame) | SC-06, SC-03, SC-07, SC-08 |
| Bought items never show (shelf skins, Shrine cards) | **Confirmed**: art URLs resolve to `/css/views/assets/…` → 404 | SC-05; also seals SC-04, unused repainted art SC (P2) |
| Old low-quality CSS cosmetics/themes kept | **Not judged yet** (the theme review was not reached) | — |
| Study spaces & A-Level content: Maths M7.3 "basically bare" | **Root cause confirmed live**: a 2 KB personal notes FORK on the user's account hides the shipped 8-page notes; no stale-fork warning | LA-23, CM (stale fork P2) |
| Flashcards redundant / ill-fitting | **Confirmed** (bank files duplicate base cards; ~30 CS decks ask the same definition twice; wrong leaf) | CM, CC findings |
| Agenda calendar on desktop and iPad | **Confirmed missing** (Agenda only < 700px) | PR-06 |
| Device dimensions recorded | Done | §1.3 |
| Afternoon review "Place in a free block" does nothing | **Root cause**: `KOS.ui.menu` z-index 110 below modal 120 — menu opens behind the dialog (also breaks About to Study "Change") | PR-01 |
| Afternoon review times overlap on the right edge | **Confirmed** | PR-05 |
| Badge medal set overview: current-badge circle is an oval | **Confirmed** | AG-06 (also AG-15, AG-02) |
| Mind & Creatives not in Home's Continue | **Confirmed**: fixed subject order, 4 visible, no scroll | HR-01 |
| iPad: cloud sync resets flashcards to card 1, notes to page 1, etc. | **Confirmed and root-caused (systemic)** | SY-01…SY-08, SH-05 |
| HCI 8 needs | **Swept on the stale build** (§2.2): accessibility, colour, messages, audio (only the Focus chime, silent on iOS, no setting), haptics (none) | AX-01…AX-21; plus SH/ST/PR touch and layout findings |
| Assistant composer "Shift + Enter" hint misaligned | **Confirmed** | AA-03 |
| Help & Guide lacks Money/Goals etc. | **Confirmed** | SH-10, SH-11 |
| Docs out of sync | **Confirmed** (README, AGENTS, PROGRESS, HANDOFF disagree on the current release and gate; Help & Guide stale) — AP ran on the stale build, re-check | AP-05, AP-06, AX-20, SH-10, SH-11 |
| Reminders ↔ Todoist problems | **Several confirmed** (live + code). Sections → Inbox **reproduced live and root-caused** (LA-24); moving to an unlinked project deletes locally (LA-25) | DI-01, DI-02, LA-1, LA-20…22, LA-24, LA-25 |
| Google Calendar one-off edits not shown (2 Nov) | **Confirmed**: they arrive within a cycle but no page redraws after a pull (LA-26) | LA-26, UR-1 |
| Focus session lost after closing the audit's tab (1 Nov) | **Explained**: two tabs, last-writer-wins (DI-04) | UR-4, LA-29, DI-04 |
| The user's other reports of 2 Nov (ink clip duplicates, Side by side empty scroll, avatar HP ring half-shown, Kurenai off-centre/cut off, ovals, Pacing shift, device continuity, QoL for ink) | **Recorded, not verified** | `findings/user-reports-2026-11-02.md` (UR-1…19) |
| Goals: "Complete 3 titles" this week Met at once at 666/3, paid a badge (UR-20) | **Verified with fixtures** (every Collection type but spend-below reads the whole vault) | GO-02 |
| RAG: one 0% quiz reads "Data says Green" (UR-22) | **Verified**, also completes "Move topics to Green" goals | GO-23 |
| QoL: Agenda everywhere; anime "where I'm watching" hyperlinks; routines inside routines | Agenda PR-06; hyperlinks CL-11; routines-in-routines model sketched (productivity QoL list, `findings/productivity.json`) | — |

### 1.6 Answers the user gave (decisions already made)
- **Santander exports available:** Online Banking "Download transactions"
  (Excel/TXT, Quicken QIF, Microsoft Money OFX), midata CSV, and app PDF
  statements. Money's import must handle these (see MG-02…MG-04; PDF has no
  path at all).
- **Browser for the live account:** Claude in Chrome (their real sign-ins:
  AniList, VNDB, Google, Todoist are already connected there).
- **Live data:** "Do mainly on yours (the empty/seeded harness accounts), but
  you are also free to test on mine, just be careful." So: read freely; any
  write must be a clearly marked test item that you remove afterwards.
- CLAUDE.md memory: commit/push/tests/migrations without asking; **only a
  production deploy needs a go-ahead**; never `commit -a` (stage by name; leave
  Live2D art, `.claude/` and untracked scratch alone).

---

## 2. Repository state (2 Nov 2026)

- `main` = `origin/main` = `feat/art-shop` = `56b1a8c` (last release sw
  `kos-artshop-1`, production). Local `main` had been 23 commits behind
  `origin/main` and was fast-forwarded on 2 Nov.
- **Audit branch: `audit/quality-2026-11`**, rebased onto `56b1a8c`, pushed. It
  contains ONLY `docs/audit/2026-11/` (this folder). No app code changed.
- Uncommitted files in the working tree that are **the user's, not ours —
  leave them alone**: `.claude/launch.json`, `.claude/settings.local.json`,
  Live2D art under `art-source/assistant/live2d/source/`, `media_budget_planner.html`,
  `prompt.md`, `prototypes/code-space/`.
- **Baseline gate** (1 Nov, before any change): 112/113 smoke suites pass.
  smoke75 failed once under load and **passes alone** (timing-flaky under
  CPU load; Code content gate, 179 lessons) — a test-infra finding
  (`data/baseline-gate.txt`).
- Untracked evidence (git-ignored, on this Mac only):
  `audit-evidence/2026-11/qa/` — a full mirror of the auditors' working folder:
  **all screenshots (216 MB, `shots/<area>/…`)**, measurement JSON, the seeded
  backup used for the round-trip test (`aa-backup.json`), the CS/IT content
  dump. Tracked copies of everything small are in this folder.

### 2.1b Shipped since the audit began (the only app change so far)
- **3 Nov 2026 — sw `kos-redraw-1`** (`4c3fc33`, branch
  `fix/background-redraw-stopgap`, main fast-forwarded to it, deployed:
  https://8c7677a7.kurenai-os.pages.dev). At the user's request, a STOPGAP for
  SY-01…SY-08: `KOS.rerender({background: "hard"|"soft"})` — a background
  redraw (cloud pull = hard; habit auto-tick, picture loads, Google read-only
  load, the Daily Review closing = soft) is held on study/work pages
  (`TASK_VIEWS` in js/core/ui.js) until the user navigates, and elsewhere
  while typing, under a dialog, or (hard) within 45 s of a touch, retried
  every 15 s; every redraw restores the real scroller (`#stage`/the document).
  Verified in the harness at iPad size (flashcard set and notes page 4 of 7
  survive a pull; scroll kept on a topic and the Calendar), gate 113/113.
  **Not covered by it:** redraws the user triggers on the same page still
  reset the notes page/quiz (SY-02/SY-04 need per-view state); remote changes
  on a task page appear only after navigating (no "Updated · Refresh" chip
  yet); the flashcard batch is still logged only at its end (ST-04/SY-03).
  W2 (the proper redraw policy) replaces this — re-check all of SY then.
- **5 Nov 2026 (second account):** the audit branch was rebased onto
  `4c3fc33` and force-pushed. A plain rebase replays both sides of the
  `d5ae5c0` merge (which superseded the stale first history and kept only its
  first side's tree), so the 15 first-parent commits were cherry-picked onto
  `origin/main`; the resulting tree equals the old branch plus the stopgap's
  8 files exactly. Every run from batch 1 (5 Nov) on is on `kos-redraw-1`.

### 2.2 Which build each area was audited on (important)
- Every area **except AP and AX**, and the live-account checks, ran on
  `56b1a8c` = production (`kos-artshop-1`): the working tree was
  `feat/art-shop` until 2 Nov ~11:15.
- **AP (architecture/perf) and AX (a11y/HCI) ran on `f4fa493`
  (`kos-creatives-1`)**, 23 commits older (no Achievements, no art/shop
  release), because the audit branch was first created from a stale local
  `main`. Their findings are kept, flagged "Build audited" in FINDINGS.md;
  re-check counts/sizes on main and sweep the pages they could not see
  (Badge Wall, Seat, shop). AP's finding "the checkout is 23 commits behind"
  (AP-02) was this mistake, not an app defect, and was withdrawn — the id
  AP-02 is deliberately unused.
- A Creatives auditor started on the stale tree was stopped; its 2 lines
  are set aside as `audit-evidence/2026-11/qa/findings/creatives.OLD-BUILD-f4fa493.jsonl`
  (do not use). Creatives was then re-audited on main (24 findings).

### 2.1 Path mapping for evidence strings
Findings cite paths from the auditors' scratch folder. Map them like this:
- `shots/<area>/<file>.png` or `scratchpad/qa/shots/...` →
  `audit-evidence/2026-11/qa/shots/<area>/<file>.png`
- `scratchpad/qa/<x>`, `cm/…`, `content-cs-it/…`, `money-samples/…` →
  `audit-evidence/2026-11/qa/<x>`; small ones are also tracked under
  `docs/audit/2026-11/data/` and scripts under `docs/audit/2026-11/harness/`.
- `${QA:-audit-evidence/2026-11/qa}` in harness scripts = the QA folder; set
  `QA=` to wherever you run from.

---

## 3. Where the audit stands

**Method.** A CDP harness (`harness/kos.mjs`) gives each auditor its own
isolated origin (dev server on port 9100+n, headless Chrome on CDP 9300+n,
profile `/tmp/kosqa-<n>`), seeds the dense sample account
(`tools/responsive_audit.mjs --seed`: ~1,900 media, 600 sessions, calendar,
reminders, assignments…) or resets to an empty account, emulates the three
devices (touch + `hover:none` for iPad/iPhone) and screenshots routes. One
auditor agent per area (19 areas), each told to cover every page/tab/dialog/
state at the three sizes, root-cause in code (file:line), and save findings
with evidence. Plus live checks on the user's production account in Chrome
(read via the app's own `KOS.*` APIs; one Todoist round-trip with a marked
test item, created and deleted).

**Counts (6 Nov, after batch 2):** 461 open findings (P0 2 · P1 83 · P2 218 · P3 158), plus SH-05 resolved by the stopgap. After batch 2 was first stopped: 435. After batch 1: 405 findings (+ 29 live-account notes, 23
user reports): **P0 2 · P1 81 · P2 190 · P3 132** (was 325 / P0 1 · P1 71
before Goals, Japanese and Mind were re-audited). Severity: P0 data loss/corruption or core flow broken; P1 clear bug or
badly broken UI on a primary device; P2 noticeable polish/UX; P3 minor.

**What "complete" means:** the auditor finished, wrote coverage notes and
re-checked its own P0/P1 once. It is NOT an independent verification — the
planned second-pass adversarial verifier never ran (usage limits). Spot-verify
before acting (see §7).

## 4. Coverage by area

| ID | Area | Status | Findings | Not covered (from the auditor, or unknown) |
|---|---|---|---|---|
| SH | Shell, nav, search, toasts, dialogs, Help | **complete, inventoried** (6 Nov, `kos-redraw-1`; `findings/shell.inventory.md`) | 44 open (+ SH-05 resolved) | Real offline behaviour (dev host always online, harness signed out), the iOS Home Screen status bar, the service-worker update prompt (needs two deploys) |
| HR | Home + Reports | **partial** | 15 | Interrupted. Likely unchecked: story player fully, share export formats, month/term/year pages at all sizes |
| AG | Achievements + Governor's Seat | **partial** | 16 | Interrupted. Titles, unlock overlay timing, Session Log likely thin |
| SC | Gold Shop + cosmetics + themes | **partial** | 19 | Interrupted. **The 26-theme quality review (which to remove) not done**; not every item verified bought→applied |
| ST | Study core (desks, topic page, Review, Assignments) | complete | 24 | Simulate tab beyond locked state, Files tab with a real PDF, Handwritten with a pen, shop theme, landscape iPhone |
| SY | Sync/redraw disruption | complete | 17 | Routine auto-tick redraw, a Japanese session with due items, Creatives Writing Desk, Focus stage & exam tally (judged safe from code) |
| CM | Maths content | complete | 13 | Every fact's correctness (spot reads only) |
| CC | CS + IT content | complete | 13 | Flashcard/Quiz UI (ST's), shop themes, every CS fact, IT F200/F202 (completed units) — per-leaf worklist in `data/content-cs-it/worklist.txt` (162 leaves) |
| CO | Code space | **partial** | 16 | Interrupted. Track pages, capstones, Rider project pages, kata likely thin |
| JM | Japanese (split from Mind on 5 Nov) | **complete, inventoried** (5 Nov, `kos-redraw-1`; `findings/ja-mind.inventory.md`) | 39 (P0 JM-06; P1 JM-07…09) | See the auditor's coverage matrix in FINDINGS.md. JM-02/JM-04 are the earlier Mind findings, kept |
| MI | Mind | **complete, inventoried** (5 Nov; `findings/mind.inventory.md`) | 19 (P1 MI-01, MI-02) | Tensions (none authored, `TENSIONS=[]`); the 59/60% explain-back boundary (every concept has 4 key points, so only 50/75% are constructible); Ask Kurenai's live reply (no AI route in the harness) |
| GO | Goals (every type's measurement) | **complete, inventoried** (5 Nov; `findings/goals.inventory.md`) | 27 (P1 GO-02 = UR-20, GO-06, GO-07, GO-23 = UR-22, GO-25) | Paper-score and finish-unit types and plan-ticked read in code only (no tracker/plan fixture); see the matrix in FINDINGS.md |
| CR | Creatives | complete (on main, after the stale-build attempt was discarded, §2.2) | 24 | Kurenai's critique request/reply (needs a live AI route), a sprint in Focus end to end, Momentum drawing with a real pen, reference kinds other than Forms, the iPhone Safari 760px viewport, VoiceOver/keyboard beyond names and target sizes |
| PR | Focus, Reminders, Routines, Daily Review, Calendar, Pacing | complete | 22 | Idle watch end to end, Stopwatch/Custom/Study-until running, Morning "pick three", Templates detail, routine step ⋯ menu, habit editor with real habits, Reminders edit inspector / sub-tasks / recurrence editor, Calendar event modal, Pacing edit dialogs, Dawn + shop theme, iPad standalone |
| MG | Money + Goals | complete | 22 | iPad landscape, import dialog on iPhone/iPad, goal editor type forms + exam goals, Wishlist purchase handoff, kos_money cloud sync, PDF statements (no code path) |
| EX | Exams hub, Files, ink | **partial** | 27 | Interrupted. Unknown remainder (companion/deep pages, paper viewer timed mode, scan, share target likely thin) |
| CL | Collection | **partial** | 15 | Interrupted. Perf numbers on the dense vault, editors, Mangaka, Shrine tie-order, Sync page likely thin |
| AA | Assistant, notifications, Archive | **partial** | 10 | Interrupted. Backup export→import round trip was started (`aa-*` files in evidence) — result not recorded as a finding; notifications page, Storage, Connections UI |
| DI | Data integrity | complete | 15 | Google Calendar recurrence mapping in depth, ink per-stroke merge, mind/reports sync bodies, real provider servers, Dawn/shop visual pass |
| AP | Architecture, perf, docs drift, repo clutter | **complete, re-checked on main** (6 Nov, top-up; every carried-over finding has a verdict; `findings/architecture-perf.inventory.md`) | 19 | iPad/iPhone timing (desktop Chrome, shared machine), Edge Function code; stale-build results kept in `architecture-perf.f4fa493.json` |
| AX | Cross-cutting a11y + HCI sweep | **complete, re-checked on main** (6 Nov, top-up; Badge Wall, Seat, shop swept; `findings/a11y-hci.inventory.md`) | 45 | Screen-reader order inside labs, ink and the code editor; 22 shop themes spot-checked, not all; stale-build results in `a11y-hci.f4fa493.json` |
| LA | Live account (production, Chrome) | done for integrations | 23 notes | Google Calendar/Tasks two-way edit round trip not done (only Todoist); AniList/VNDB pages viewed on Mac only |

**Known harness limitation:** `kos.mjs shot --theme atelier-dawn` sets
`data-theme`, but the app re-applies its own theme, so Dawn could not be judged
(MG auditor). To test Dawn: set `KOS.store.state.governor.theme =
"atelier-dawn"` (or the follow flag off) via `eval`, then `KOS.rerender()`.

## 5. How to continue the audit

### 5.1 The harness
```sh
QA=$PWD/audit-evidence/2026-11/qa           # or any folder; scripts read $QA
H=docs/audit/2026-11/harness/kos.mjs
node $H start 1          # dev server :9101 + headless Chrome CDP :9301 (first boot ~30-60 s)
node $H seed 1           # dense sample account (1-2 min)  |  node $H reset 1  → empty account
node $H shot 1 "#/creatives/settings" iphone $QA/shots/creatives/settings-iphone.png [--dpr 2] [--full] [--js "<code>"]
node $H eval 1 "KOS.store.state.creatives" [--size ipad]
node $H stop 1
```
Sizes: `mac` 1470×832, `ipad` 820×1180, `ipadl` 1180×820, `iphone` 402×874,
`iphonesafari` 402×760 (touch + no-hover emulated for iPad/iPhone). Its
`ROOT` constant points at `/Users/fj/Developer/KurenaiOS - Web`.

### 5.2 Re-running the auditors
The auditor prompts (areas, focus text, common rules, output schema) are in
`harness/workflow-audit.js` (a Workflow script). Run it with
`args: {order: [...area ids...], batch: 3}`. Each auditor appends findings to
`$QA/findings/<area>.jsonl` as it goes, continues an existing `.jsonl` without
repeating it, and writes `<area>.json` when finished. Then copy new files into
`docs/audit/2026-11/findings/` and run `consolidate.py`.
**Before running, check the `QA` constant** at the top of the script points at
your QA folder (it is `audit-evidence/2026-11/qa` in this repo since 5 Nov).
Since 5 Nov: `ja-mind` is Japanese only and `mind` (prefix MI) is its own
area; inserting it moved every later area's slot up by one (a slot is just
its ports and profile). Auditors may number their own titles (`GO-02 …`):
`consolidate.py` keeps such an id when it is new to the area (so the
auditor's cross-references stay right) and strips it from the title before
matching the incremental saves; `UR-`/`LA-` prefixes are never stripped.
The per-auditor budget is ~150 tool calls, with an explicit NOT checked list
if it runs long. Batch 1 (3 auditors) used ~1.05 M subagent tokens, 403
tool calls and 30 min.

### 5.2b Exhaustiveness — the user's requirement for EVERY area
The user reviewed the results and found Goals' audit far too thin: its
auditor (shared with Money) only looked at the Goals pages, so a goal type
that counts the whole vault (UR-20) and a RAG rule that rates one 0% quiz
Green (UR-22) went unnoticed. **Every auditor must be completely exhaustive,
behaviour as well as presentation.** `workflow-audit.js` now requires each
auditor to (1) write a FEATURE INVENTORY of its area from the code (every
type, option, setting, mode, route, dialog, state) to
`findings/<area>.inventory.md`, (2) check every item's behaviour with
fixtures against what its label/editor promises — boundaries, thin and
contradictory evidence for any automatic judgement (auto-tracking, RAG,
readiness, badges, rewards) — and (3) report a coverage matrix in which
"no finding" means "exercised and verified OK", never "not looked at".
The runs before 2 Nov evening did NOT have this instruction: treat every
area, including the "complete" ones, as **presentation-checked but not
behaviour-inventoried** until it has an inventory file. Plan for a second
pass over every area with the new prompt (Goals has its own area, `goals`,
id prefix GO).

### 5.3 Lessons about the usage limit
19 auditors at once burned a whole 5-hour window in ~2 minutes of wall time
(all failed); batches of 4 still exhausted it. What worked: batches of 3,
"measure the DOM first, screenshot only what is flagged, aim for ~100 tool
calls", and saving findings incrementally. Expect ~4 auditors per window.

### 5.3b Folding in a run
Auditors write to `$QA/findings/` (by default `audit-evidence/2026-11/qa/findings/`):
copy `<area>.json` and `<area>.jsonl` into `docs/audit/2026-11/findings/`,
re-run `consolidate.py`, commit. An area with only a `.jsonl` is partial —
re-running its auditor continues from the `.jsonl` without repeating it.
**Before any run, confirm the tree is production code** (§2.2).

### 5.4 Recommended order for the remaining work
1. ~~**goals** (new area: every goal type's measurement) and **JM** Japanese +
   Mind (barely started: 5 findings).~~ **Done 5 Nov (batch 1).**
1a. ~~Batch 2 stopped~~ **Done 6 Nov: the resumed batch 2 finished** (AP 19, AX 45, SH 44 + SH-05 resolved; ~0.87 M subagent tokens, 53 min). `TOPUP_PARTIAL` is now empty and the AP/AX build notes say "re-checked on main". Earlier note, kept for the record: batch 2 (AP + AX top-up on main, and shell) was STOPPED on 5 Nov at
   ~18:35 before the usage limit**, to end cleanly. Saved and folded in: AP
   3 new findings, AX 13 (Badge Wall, Seat, shop — incl. the Wall's
   'Owned 8' vs 21 earned, Buy with no confirm, Edit seat losing drafts,
   7–12 s re-measures, Dawn plaque contrast), shell 14 (new P1s SH-20 Enter
   on Cancel confirms, SH-21 Skip to content goes Home, SH-22 iPhone Money/
   Goals tabs unreachable); inventories for AP and AX. **Lost:** the
   re-check verdicts (`recheck`) of the 33 old AP/AX findings — they live
   only in a final file the auditors never wrote — and the shell inventory
   and coverage matrix. `consolidate.py` marks AP and AX "partial"
   (`TOPUP_PARTIAL`) until a top-up finishes; remove them from that set
   then. **To resume:** `Workflow({scriptPath:
   "docs/audit/2026-11/harness/workflow-audit.js", args: {order:
   ["architecture-perf", "a11y-hci", "shell"], batch: 3, topup:
   ["architecture-perf", "a11y-hci"]}})` — each auditor reads its
   `.jsonl` and continues without repeating; the top-ups still find their
   old findings in `<area>.json` (backups `*.f4fa493.json`). Rebase the
   audit branch onto main first (main gained the docs-only VN capstone
   proposal, `0e4a781`).
1b. Then the **inventory pass (§5.2b) over every other area**, including the
   "complete" ones — behaviour, not just pages.
2. ~~Re-check **AP** and **AX** on main~~ **Done 6 Nov (batch 2).** ~~and sweep what they could not see
   (Badge Wall, Seat, shop; Achievements/art code) — a short top-up, not a
   rerun.~~
4. Continue the partial UI areas: SC (theme review!), ~~SH~~ (done 6 Nov), EX, CL, AA, CO, HR, AG.
5. Live: Google Calendar two-way round trip with a marked test event (user
   allowed careful writes; delete it after); AniList/VNDB pages at iPad/iPhone.
6. Completeness critic ("what's missing?") over the whole of FINDINGS.md.
7. Adversarial spot-verify of every P0/P1 (≥ 2 skeptics each), drop or fix.

## 6. Cross-cutting root causes (the synthesis so far)

These explain many symptoms each. The plan should fix the cause once.

1. **Blanket redraws destroy transient state (SY, SH-05).** Every applied
   cloud state (pull, merge, a lost CAS race) ends in
   `cloudsync.rerenderCurrent()` → `KOS.rerender()`, a full remount of `#main`
   with no check of what changed or whether the user is mid-task (only the ink
   pen has a 1.5 s guard). Pulls fire on Realtime notes, every return to the
   app, and after the device's own ratings. A remount loses everything held in
   render closures: note page, flashcard queue (and the batch's ledger entry —
   pay/streak lost, ST-04/SY-03), quiz/exam progress, typed answers, Code edits,
   menus, keyboard focus; and **scroll**: rerender saves `#main.scrollTop` but
   `#stage` is the scroller, so every redraw jumps to the top on all devices.
   `KOS.rerender` is also misused as a change broadcast (Daily Review close,
   routine auto-ticks, boot loaders). → A redraw policy: background changes
   carry changed keys; views declare what they read; redraw deferred while the
   user is mid-task (session/typing/dialog) and applied at a safe point;
   transient view state in a per-view session store; fix the scroller.
2. **Layering: menus below modals (PR-01, SH-03, AG-01).** `--z-menu` 110 <
   modal 120, and stage `overflow` clips popovers → menus inside dialogs or on
   the Stage are invisible/clipped. One token/portal fix.
3. **No layout tier between 1240 and 700 px for master-detail/side columns
   (ST-01/05/06, CO-02/03, HR-03, CL-01, MG-09, EX-02/03).** iPad portrait
   (820) and iPhone (402) fall into broken intermediate layouts, sections
   become unreachable on phone (Money sub-pages, Goals tabs), details open
   off-screen. → Audit each master-detail against the five breakpoints.
4. **Hand-kept allowlists that new domains never joined (DI).**
   `stateMeaningful()` (first sign-in discards reminders, assignments, exams,
   routines… DI-03), cloudmerge `RECORDS` refs, backup coverage, Storage page.
   → Derive from a registry each domain registers in.
5. **Whole-document last-writer-wins in localStorage (DI-04, LA-9).** Two tabs
   overwrite each other; the state document is 1.35 MB live (440 KB of it the
   Governor's avatar/banner as data-URLs), so every save and push carries it.
   → BroadcastChannel/lock or per-key writes; move pictures to the file store.
6. **Integration sync bookkeeping (DI-01/02, LA-1, LA-20…22).** Link state
   replicated async while the provider cursor is per device; multi-request
   pushes assume all-or-nothing; reminders made before 5.15 and never edited
   have no `uid` and are silently skipped forever; absence/404 read as
   deletion; recurrence outside 5 local repeat types is opaque locally;
   sub-tasks are text only; Todoist sections flattened.
7. **Generated spec text from PDF extraction is garbled (CM-01, CC-01/02).**
   `tools/gen_data.py` copies raw extracted lines; no section boundaries; no
   ref-uniqueness assertion (IT F206.6.1 duplicate makes a leaf unreachable);
   Stats/Mech titles are 80-char cut sentences.
8. **Authored practice layers have no automated quality gates (CM-02, CC-03,
   bank duplicates).** Quiz answers sit at A/B ~94–95% and options are never
   shuffled; bank files duplicate base cards; same-definition cards. → Shuffle
   options at render (stable seed), add near-duplicate / answer-position /
   duplicate-src gates to the content smokes, then a content clean-up pass.
9. **Curriculum forks never notice upstream changes (LA-23).** A fork made
   before a content rewrite hides it silently (M7.3). → Store the shipped
   hash on each fork; warn + compare/merge when it changes.
10. **Cosmetics shipped without end-to-end checks (SC).** Asset URL resolved
    relative to the CSS file (`/css/views/assets/…` 404), previews that don't
    match the applied effect, items with no surface (seals), worn item leaking
    into other previews, try-on that ends on leaving the shop. → A cosmetics
    registry where each item declares its surface, plus a smoke that buys,
    applies and checks every item renders.
11. **Money import is a single-format CSV parser (MG).** First-line header
    with exact names only, no preamble/delimiter detection, thousands
    separators break columns, no QIF/OFX/TXT/PDF, de-dupe key includes payee
    (→ P0 duplicates on re-import), recurring confirm double-counts the bank
    row, no import batches (no undo/replace later), no merchant normalisation
    or categorisation, Type/Balance discarded. → Money import revamp (likely a
    design prompt for the information side: what a student with a Santander
    account wants to see).
12. **Two readers, two units / two definitions** (ST-03 quiz best % vs count;
    HR-05 Home Study hours vs Reports Studied; AG "Owned" 8 vs 21). → One
    derivation per figure (invariant 26d), enforced.
13. **Help, search and docs not part of "done"** (SH-07 search can't find
    pages; SH-10/11 Help stale; AP: README, AGENTS, PROGRESS and HANDOFF each
    name a different current release and gate). → The CLAUDE.md rules in §1.2.
14. **Boot weight (AP).** ~16.6 MB of JS in 340 synchronous scripts + 1.2 MB
    CSS, mostly curriculum content no first view needs (cold launch seconds
    of compile/run; worst on the iPad). Derived reads have no memoisation
    (first render of Exams/Code map/Calendar 0.5–2.8 s). → Lazy-load content
    per subject/topic; memoise the heavy derived reads.
15. **No view lifecycle (AP).** `KOS.show` empties `#main` with no unmount;
    global listeners are removed only when they next fire, so visited pages
    leak (~16,000 detached nodes after 30 topic pages); `KOS.rerender` drops
    focus to `<body>` (breaks invariant 65; SY-08 is the user-visible side).
    → A `view.dispose()` contract, which also gives §6.1 its hook.
16. **Duplicated study-space machinery (AP).** Code, Japanese, Mind and
    Creatives each re-implement the paged lesson reader with dwell, evidence,
    `syncChecks` and award, and have drifted; hub.js is 3,899 lines (a
    953-line topic-page function); date/format helpers copied per file.
    → Extract one lesson-reader/evidence module; split hub.js by surface.
17. **Shared CSS undoing accessibility (AX).** The phone 16px input guard is
    in `@layer base`, so component font sizes override it and iOS zooms on
    nearly every field (P1); `.k-pill-select`, `.k-switch`, checkboxes undo
    the 44px touch floor; role-tinted status chips fail AA in both themes;
    tab strips lack arrow keys; toast Undo unreachable by keyboard. Audio:
    only the Focus chime exists, silent on iOS, no setting; no haptics; the
    document title never changes.
18. **Pay and activity are logged only on an explicit "end" (batch 1).** A
    Japanese session (JM-08), a kana set switched mid-way, and an unfinished
    flashcard batch (ST-04/SY-03) reschedule each answer at once but write
    the ONE ledger entry only when the user reaches the end or confirms ✕;
    navigating away, Back, an iPad edge swipe or closing the app loses the
    XP, the streak day and everything that reads the ledger (goals,
    auto-tracked habits, badges, Reports). → One "session in progress"
    contract: log on teardown (`view.dispose`, §6.15) and on `pagehide`.
19. **Evidence that changes off the page never reaches the progress record
    (batch 1).** Japanese's "Held in reviews" (JM-07) and Mind's checkpoint
    lesson (MI-01) are derived live for the inspector but `syncChecks` runs
    only on page/line/finish events, so status, spine counts and mastery lag
    or never complete; Japanese and Mind also have no Goals types, Reports
    facts, Today/Home entries or Assistant tools (islands, cf. §6.16/W7).
    → Sync checks after every scheduler write and once at boot; register
    every study space with the joins.
20. **Automatic judgements are too lenient (batch 1, cf. UR-22).** RAG
    (GO-23), Mind's ladder (Apply after the answer is revealed, Explain from
    one one-character bullet, a checkpoint that pays with nothing right),
    Japanese's facet grading ("held a week" read from one Easy, `accepted`
    upgraded to `correct`, an all-wrong learn session pays) and Collection
    goals (GO-02) all reward thin or contrary evidence. → A shared rule:
    every automatic judgement names its minimum evidence and is tested with
    thin and contradictory fixtures.

## 7. Verification status — be honest about it
- Every finding was saved with evidence by its auditor (screenshots,
  measurements, repro via `eval`, or file:line), and the complete areas
  re-checked their own P0/P1 once. **No independent adversarial verification
  has run.** Treat P0/P1 as "very likely", verify before fixing.
- I (first account) personally confirmed: the Todoist uid skip (LA-1, code +
  live), the M7.3 stale fork (LA-23, live), the state-document size (LA-9,
  live), the AniList/VNDB page issues (LA-12…17, live screenshots), the
  Todoist round trip (LA-19…22), the toast/home/money first-run screenshots.
- Japanese + Mind (JM) has only 5 findings because its auditor was cut off
  almost at once — it has **not** passed anything. AP and AX ran on an older
  build (§2.2).

## 8. Draft remediation plan outline (NOT approved; for the next account to complete)

Order by dependency and impact; each workstream fixes root causes from §6.

- **W0 Safety net first:** fix smoke75 flakiness; add the content/cosmetics
  gates; a backup-before-change step; no data migration without a test.
- **W1 Data integrity (P0/P1):** MG-01 dedupe + import batches; DI-03 first
  sign-in; DI-04 multi-tab; DI-01/02 Todoist duplicates; LA-1 uid migration;
  move pictures out of the state document.
- **W2 Redraw policy (SY):** the systemic fix in §6.1 + scroller fix; regression
  smokes per view (card index, notes page, quiz, typed text survive a pull).
- **W3 Layering & responsive tiers:** menus/z-index/portal; the 1240–700
  master-detail pass on the user's three devices; phone reachability.
- **W4 Money revamp:** Santander formats (midata CSV, Online Banking CSV/TXT,
  QIF, OFX; PDF via pdf.js text if feasible), import history/undo/replace,
  merchant normalisation, rules, recurring detection; design prompt for the
  information views.
- **W5 Cosmetics repair:** asset URLs, centring/fit of avatars and frames,
  every item has a surface or is withdrawn (refund policy?), theme cull
  (needs the SC theme review), try-on behaviour.
- **W6 Content:** option shuffle; spec regeneration (gen_data.py parser fixes,
  IT duplicate ref); bank de-duplication; thin leaves (Maths 8.4, 8.1, 6.1, 7.2,
  8.2, 6.3, 8.6; IT F201); stale-fork detection + the user's 3 forks.
- **W7 Connected OS:** Home "what next" across Code/Japanese/Mind/Creatives/
  Money; Continue shows all spaces; Agenda on Mac/iPad; one definition per
  figure; search finds pages; deep links for Wall tabs.
- **W8 Polish backlog** (all P2/P3 by area) + HCI (audio/haptic) after AX.
- **W9 Maintainability:** AP's refactor list; repo clutter; docs re-baseline;
  Help & Guide rewrite; CLAUDE.md/AGENTS.md rules (§1.2).
- **W10 Deliverables:** the interactive HTML review checklist (artifact, db)
  + the final technical report.

Open questions to ask the user when presenting the plan:
1. Money: which views matter most (spend by merchant/category/week,
   subscriptions, budget pace, balance tracking)? OK to drop PDF import if
   text extraction is unreliable?
2. Cosmetics that have no surface (seals): build the surface, or withdraw and
   refund the gold?
3. Theme cull: confirm which themes to remove once SC's review lists them.
4. Redraw policy: is "apply remote changes when you leave the page / finish
   the set" acceptable, with a small "Updated from another device · Refresh"
   chip?
5. The 3 personal forks (maths M7.3 notes, CS 4.1.1.6 / 4.1.1.8 cards): keep,
   merge, or reset to the shipped versions?
6. What exactly went wrong with Todoist from their side (duplicates?
   recurring items? sub-tasks? sections?) — to confirm DI/LA findings match.

## 9. Files in this folder
- `HANDOFF.md` — this file.
- `FINDINGS.md` / `findings.json` / `findings.csv` — consolidated, generated
  by `harness/consolidate.py` (ids like `MG-01`; stable for a given input).
- `findings/user-reports-2026-11-02.md` — the user's own reports of 2 Nov (UR-1…19), to verify and fold into the plan.
- `findings/<area>.json` — finished auditors' full result (summary, coverage,
  findings, QoL, backlog); `findings/<area>.jsonl` — incremental saves;
  `findings/live-account.md` — LA-1…29; `content-maths.audit1.json`.
- `harness/` — `kos.mjs` (the CDP harness), `consolidate.py`,
  `workflow-audit.js` (the auditor workflow), and the auditors' own probe
  scripts (`*-measure.js`, `*-run.sh`, `sd*.js` redraw experiments, `td.js`
  Todoist experiment, `mg-*.js` Money import experiments…).
- `reference/graphite-review.html` — the user's original Graphite Review checklist: THE reference for the final review checklist (§1.2 step 5).
- `data/` — `money-samples/` (six reconstructed Santander exports: midata
  comma/semicolon, Online Banking CSV and TXT, QIF, OFX — synthetic data),
  `content-maths/` and `content-cs-it/` metrics, duplicate lists and worklists,
  `baseline-gate.txt`.
