# KurenaiOS quality audit — instructions for Gemini (independent reviewer)

Written 7 Nov 2026 by the Claude account that ran the audit so far. Read this whole
file before you do anything. It is self-contained: you do not need the
conversation that produced it.

**Your role: an INDEPENDENT investigator and verifier. You do NOT fix anything.**
You run two workstreams:

- **A. Completeness critic: "what did we miss?"** (§7)
- **B. Independent re-check of every open P0/P1 finding** (§8)

A Claude reviewer will assess your output afterwards. The user makes the final
decision. Your results are **proposals**. They never become canonical findings
by themselves (§10).

---

## 0. Hard rules (read twice)

1. **No remediation.** Do not change application code, CSS, data, tests, tools,
   `sw.js`, migrations or Edge Functions. Do not "just fix" an obvious bug. The
   user has not approved any remediation. Describe the fix in your finding
   instead.
2. **Only write inside `docs/audit/2026-11/gemini/`** (tracked outputs) and
   `audit-evidence/2026-11/gemini/` (large, gitignored evidence such as
   screenshots). Do not edit `HANDOFF.md`, `FINDINGS.md`, `findings.json`,
   `findings.csv` or anything in `docs/audit/2026-11/findings/`. Those are
   Claude's canonical audit record.
   - Two exceptions: probe scripts you write go in
     `docs/audit/2026-11/gemini/probes/`, and you may read every file in the
     repository.
3. **Never touch the user's real account or real services.**
   - Do not open https://kurenai-os.pages.dev signed in.
   - Do not use Supabase with real credentials.
   - Do not call AniList, VNDB, Todoist or Google.
   - Do not deploy (`tools/deploy_pages.sh`), and do not run
   `supabase functions deploy`.

   Work only in the local harness (§5), which runs an isolated, signed-out
   browser profile with seeded or empty test data.
   - Findings that need the live account (the `LA-*` notes, some `UR-*`) are
     verified from code and the recorded evidence.
   - Mark what only a live check could settle as "needs live check". Claude
     will do those checks with the user present.
4. **Git:**
   - Never commit to `main`, and never commit to or push `audit/quality-2026-11`.
   - Never force-push. Never rebase or reset a shared branch.
   - Never run `git add -A`, `git add .` or `commit -a`; stage files by name.
   - Work on your own branch, `audit/gemini-2026-11`, created from
     `audit/quality-2026-11` (§9).
   - The working tree has the user's own uncommitted files (`.claude/`, Live2D
     art under `art-source/assistant/live2d/`, `media_budget_planner.html`,
     `prompt.md`, `prototypes/code-space/`). Never stage, move, discard or
     "clean up" them.
5. **Do not fabricate.**
   - "Confirmed" means you saw it happen (harness run, experiment output) or
     traced it end to end in code with file:line.
   - Being unable to reproduce something is not proof it is absent. Say what
     you tried and use `inconclusive` or `not-reproducible` honestly.
   - Never invent screenshots, measurements or line numbers.
6. **Disagree when the evidence says so.** You are not here to validate
   Claude. A verdict that agrees with the original needs the same evidence as
   one that does not.
7. **Save incrementally.** Append each result as soon as you have it (one JSON
   line). Do not hold a long run's results in memory: a run can be cut off at
   any time. Commit your outputs at least after every ~20 findings verified.
8. **Antigravity loads `AGENTS.md` and the root `GEMINI.md` automatically.**
   `AGENTS.md` says the whole repository is editable. For this task, these
   rules override it.

---

## 1. The project

KurenaiOS is a personal "operating system" PWA built and used daily by one
person, an A-Level student (AQA Computer Science 7517, Edexcel Maths 9MA0,
OCR Cambridge Technicals IT). It covers:

- **Study:** CS, Maths, IT, Code (C#), Japanese, Mind and Creatives. This
  includes notes, flashcards on FSRS-6, quizzes, an Exams hub, Pacing,
  handwriting with the Apple Pencil, and Files.
- **Productivity:** Focus timer, Reminders, Routines and the Daily Review,
  Calendar, Money and Goals.
- **Collection:** anime, books, visual novels and games vaults synced with
  AniList and VNDB, plus the Shrine and the Wishlist.
- **Gamification:** the Governor (XP, gold, HP), a Gold Shop of cosmetics and
  themes, and the Achievements Badge Wall.
- **An AI assistant**, "Kurenai".
- **Optional cloud replication** to Supabase, plus Google Calendar, Google
  Tasks and Todoist integrations.

**The user's devices** (prioritise exactly these):

| Device | CSS viewport | Harness size |
|---|---|---|
| MacBook Air 13" M4 | Chrome ≈ 1470×832 | `mac` |
| iPad Air 11" M4 (Home Screen app, touch, Pencil Pro) | 820×1180 portrait, 1180×820 landscape | `ipad`, `ipadl` |
| iPhone 17 | 402×874; Safari's visible area ≈ 402×760 | `iphone`, `iphonesafari` |

**Standing design rules the user repeats:**
- No dead space, including in width.
- Things are aligned and centred in their containers.
- Circles are never ovals.
- Equivalent elements are the same size.
- Shared components are reused.

These count as defects when broken.

## 2. Repository structure and architecture: where to read

Read these before forming any view.
- **`CLAUDE.md`:** the canonical engineering reference.
  - Runtime shape and load order.
  - Persistence: every localStorage and IndexedDB store.
  - The ownership map: which file owns which contract.
  - **The numbered invariants (1–163).** Treat them as the specification. A
    behaviour that breaks an invariant is a defect; one that matches it is
    intended, even if you would design it differently. You may still argue in
    workstream A that an invariant itself is wrong.
- `AGENTS.md`: the short contract. `README.md`: the product. `docs/ROADMAP.md`:
  what is planned. `docs/*-plan.md`: per-feature design plans.
- **Code layout:**
  - `index.html`: classic script tags, no bundler, one global `KOS`; the load
    order is an API.
  - `js/core/`: shared services and engines (store, ui, router, cloud*, sync,
    goals, money, fsrs, ink, files, routines, achievements, ext*).
  - `js/modules/`: pages and views (`KOS.views.<id>`).
  - `js/engines/`: quiz and flashcards.
  - `js/labs/`: simulations, the C# interpreter, workers.
  - `js/data/`: generated specs and authored content.
  - `css/`: tokens, base, layout, components, `views/*.css`, themes.
  - `supabase/`: migrations and Edge Functions.
  - `tools/`: tests (`tools/smoke*.test.js`, 113 suites under jsdom),
    generators and audits.
- **Key mechanisms you will meet in many findings:**
  - `KOS.store.state`: one synced state document in localStorage.
  - `KOS.rerender()`: a full remount of `#main`. Since sw `kos-redraw-1` a
    background redraw is held on task pages (`js/core/ui.js`, `TASK_VIEWS`).
  - `js/core/cloudmerge.js`: the three-way merge.
  - `KOS.ui.openDialog` / `KOS.ui.menu`: the z-index tokens in `css/tokens.css`.
  - `KOS.sessions.log()`: the only path that pays rewards (invariant 1).
- Run the tests (read-only for the app) with:
  `for i in "" {2..113}; do node "tools/smoke${i}.test.js"; done`. They need
  `npm install jsdom fake-indexeddb` once. The baseline was 112–113 of 113;
  smoke75 is timing-flaky under load and passes alone.

**Understand before judging.** Spend your first phase (§6, phase 0) building
your own model of the app: run it in the harness, read the ownership map, and
trace a few flows end to end. Only then read the audit's conclusions. Do not
produce findings from reading the handoff alone.

## 3. The audit so far

- **Branch:** `audit/quality-2026-11`. It equals production code
  (`origin/main`, sw `kos-redraw-1`) plus the folder `docs/audit/2026-11/`.
  Check with `grep VERSION sw.js`.
- **`docs/audit/2026-11/HANDOFF.md`:** the master handoff. It holds the
  user's request (§1), what the user complained about (§1.5), coverage by area
  (§4), method (§5), **the 21 cross-cutting root causes (§6)** and the draft
  plan (§8).
- **`docs/audit/2026-11/FINDINGS.md`:** a human-readable list of every
  finding. Generated; do not edit.
- **`docs/audit/2026-11/findings.json`:** the canonical machine list. Each
  finding has:
  - `id`, `area`, `severity` and `category`;
  - `title`, `detail`, `evidence`, `rootCause`, `fix`, `effort`, `devices`;
  - `needsDesign` and `needsArt`;
  - optionally `recheck` (a later auditor's re-check verdict) and `resolved`.
- **`docs/audit/2026-11/findings/<area>.json`** (full auditor output with its
  coverage matrix), **`<area>.jsonl`** (incremental saves) and
  **`<area>.inventory.md`** (the feature inventory, where one exists).
- **`findings/live-account.md`:** checks on the user's real account (LA-1…29).
- **`findings/user-reports-2026-11-02.md`:** the user's own reports
  (UR-1…24), only some verified.
- **`docs/audit/2026-11/data/`:** samples and metrics.
- **Big evidence:** screenshots are under `audit-evidence/2026-11/qa/shots/<area>/`.
  This folder is gitignored and exists on this Mac only. The path mapping for
  evidence strings is in HANDOFF §2.1.

**Areas (id prefix: area):**
- SH: shell, navigation, search, dialogs and Help.
- HR: Home and Reports.
- AG: Achievements and the Governor's Seat.
- SC: Gold Shop, cosmetics and themes.
- ST: Study core.
- SY: background-redraw / sync disruption.
- CM: Maths content.
- CC: CS and IT content.
- CO: Code.
- JM: Japanese.
- MI: Mind.
- CR: Creatives.
- PR: Productivity (Focus, Reminders, Routines, Daily Review, Calendar, Pacing).
- MG: Money (also the Goals pages).
- GO: Goals types.
- EX: Exams hub, Files and ink.
- CL: Collection.
- AA: Assistant, notifications and Archive.
- DI: data integrity.
- AP: architecture, performance and docs.
- AX: accessibility and HCI.

**Status at hand-over:** see HANDOFF §3 for the current counts and §4 for each
area's status.

| Area state | Areas |
|---|---|
| Inventoried, with a `.inventory.md` file | All except CM, CC, CR and MG |
| SY and DI | Inventoried on 7 Nov if their batch finished; check whether `findings/sync-disruption.inventory.md` and `findings/data-integrity.inventory.md` exist |
| Still due their inventory pass from Claude | CM, CC, CR, MG (and SY/DI if those files are missing) |

You may still look at the remaining areas in workstream A. Do not run a full
feature inventory of them, because that is Claude's next job.

**Severity definitions** (use them exactly):

| Severity | Meaning |
|---|---|
| P0 | Data loss or corruption, or a core flow broken |
| P1 | A clear bug, or badly broken UI on one of the user's primary devices |
| P2 | Noticeable polish or UX problem |
| P3 | Minor |

The audit's own verification standard (HANDOFF §7) is honest about its limits:
- Each auditor re-checked its own P0/P1 once.
- **No independent verification has been run yet. That is workstream B.**

## 4. Method the audit used (match it)

- One auditor per area. Each wrote:
  - a feature inventory from the code (every type, option, setting, mode,
    route, dialog and state);
  - behaviour checks with fixtures against what each label promises, including
    boundaries and thin or contradictory evidence for every automatic
    judgement (RAG, readiness, auto-tracking, rewards, badges, goals);
  - a coverage matrix, where "no finding" means "exercised and OK", never "not
    looked at".
- Every finding cites evidence:
  - a harness screenshot path or DOM measurement;
  - an `eval` repro;
  - a node/jsdom experiment;
  - file:line.
- Severity follows §3. Root cause is stated as a hypothesis unless traced.
- The method's known weaknesses are yours to criticise. Pre-6-Nov areas were
  presentation-first, and nothing was independently verified.

## 5. The harness (verify it works before relying on it)

`docs/audit/2026-11/harness/kos.mjs` is a small CDP harness. Slot `n` is its
own dev server on port `9100+n` and headless Chrome on CDP `9300+n`, with
profile `/tmp/kosqa-<n>`. Each slot is an isolated, signed-out origin.

```sh
H=docs/audit/2026-11/harness/kos.mjs
node $H start 31                 # first boot 30–60 s
node $H seed 31                  # dense sample account (~1,900 media, 600 sessions, calendar, reminders…), 1–2 min
node $H reset 31                 # empty account instead
node $H shot 31 "#/money" ipad audit-evidence/2026-11/gemini/shots/x.png [--full] [--dpr 2] [--js "<code first>"]
node $H eval 31 "KOS.store.state.goals" [--size iphone]   # prints JSON, awaits promises
node $H errors 31
node $H stop 31
```

- **Use slots 30–39 only.** Claude's auditors use 0–21; never stop a slot you
  did not start.
- It needs Node 18+ and Google Chrome at
  `/Applications/Google Chrome.app`. Check both first.
- `ROOT` defaults to `/Users/fj/Developer/KurenaiOS - Web`. To serve another
  checkout, such as a git worktree, set `KOS_ROOT=/path/to/checkout`.
- iPad and iPhone sizes emulate touch and `hover:none`. This is emulation, not
  real Safari or WebKit: say so when a verdict depends on real iOS behaviour.
- Themes: `--theme` is overridden by the app. To test one, run
  `eval "KOS.store.state.governor.theme='atelier-dawn';KOS.rerender()"`.
- There is no cloud sign-in and no AI route in the harness. Two-device
  behaviour can be simulated with two slots, or by calling the merge in
  node/jsdom (see how `tools/smoke*.test.js` load modules).
- Existing probe scripts are in `harness/` (`sd*.js` redraw experiments,
  `mg-*.js` Money imports, `td.js` Todoist logic, and others). Reuse them.

If a command or capability does not work in your environment, record it in
`UNRESOLVED_QUESTIONS.md` and continue with what does.

## 6. How to work in Antigravity

Antigravity 2.0 (from May 2026) lets the main agent spawn subagents, which may
run in temporary git worktrees that are cleaned up automatically. It also has a
browser subagent (`/browser`) for sandboxed interactive testing. Workspace
rules come from `AGENTS.md`, `GEMINI.md` and `.agents/rules/`. **Check what
your installed version actually offers before planning around it.**

Recommended:
- **The main agent owns every file in `gemini/`.** Subagents investigate and
  return a structured result, and the main agent appends it. Worktrees are
  deleted on cleanup, so a file a subagent wrote in one is lost. If a
  subagent must write, it writes one shard,
  `gemini/shards/<task-id>.jsonl`, in the MAIN checkout (absolute path), and
  never a shared file.
- **Keep each subagent task small and well defined.** For example: "verify
  findings ST-25, ST-26, MG-01 as skeptic A". Keep the batches small, about
  3–5 subagents at a time.
- **Give each subagent its own harness slot** (30, 31, 32 …). Two agents on one
  slot overwrite each other's storage.
- **The browser subagent** may be used against the local harness
  (`http://127.0.0.1:91NN/index.html`) only. Never use it against production or
  any provider.
- Antigravity may ask you to review an "implementation plan" artifact. There is
  nothing to implement: your plan is an investigation plan.

**Phases:**
0. **Orientation (no findings yet).**
   - Read `CLAUDE.md` (ownership map and invariants) and skim the code layout.
   - Start a slot, seed it, and walk the main flows at mac, ipad and iphone.
   - Write `gemini/ORIENTATION.md`: your own map of subsystems, data stores
     and cross-cutting mechanisms, about one or two pages, before you open
     FINDINGS.md.
1. **Workstream B (§8).** Do it first, because it is bounded.
2. **Workstream A (§7).**
3. **Write** the summary deliverables (§9).

## 7. Workstream A: completeness critic

The goal is to find what the audit did not look at or got wrong at a systemic
level. This is not a re-read of the existing findings.

1. **Build your own feature and workflow map** from the code and the running
   app:
   - routes (`KOS.views`, `js/core/router.js`);
   - state and stores (`CLAUDE.md` Persistence);
   - registries (goal types, badges, cosmetics, notification kinds, Assistant
     tools in `js/core/aitools.js`);
   - background work (timers, tickers, sync cycles, the service worker);
   - integrations.
2. **Compare it with the audit's coverage:**
   - the inventories (`findings/*.inventory.md`);
   - the coverage matrices in `findings/<area>.json`;
   - HANDOFF §4's "Not covered" column.

   List every feature, workflow or state with no coverage or only shallow
   coverage. Pay particular attention to:
   - **Cross-subsystem interactions:** for example, Focus with Routines
     auto-tracking, Goals and Achievements; a cloud pull during an Exam Room
     session; the Daily Review triaging through owners; a backup import
     against a later sync.
   - **Account states:** empty, dense, very old data with migrations
     (pre-1.1 refs, SM-2 cards, Habits), corrupt or partial imports, quota
     full.
   - **Error and offline states**, and the service-worker update path.
   - **Time:** midnight, the routine day at 04:00, DST, the week and month
     boundaries Reports uses, a device clock change.
   - **Multi-device and multi-tab.**
   - **Accessibility:** keyboard, screen reader, reduced motion, zoom.
   - **Performance** on a dense account.
   - **Recovery:** undo, restore, rebaseline.
   - **Security and privacy:** what reaches the AI payloads, tokens out of
     backups, RLS assumptions in `supabase/migrations`.
3. **Probe the gaps.** For each gap worth it, investigate it with the
   harness, an experiment or a code trace. A gap only counts as a finding with
   evidence; otherwise record it as "recommended investigation".
4. **Challenge the 21 root causes** in HANDOFF §6. For each one, say whether
   it is:
   - correct;
   - incomplete;
   - wrongly grouped;
   - a symptom of something deeper, such as no view lifecycle, no domain
     registry, or no evidence contract;
   - or missing a relationship with another.

   Propose new root causes with the findings they explain.
5. **Classify every candidate** against `findings.json`:

   | Classification | Meaning |
   |---|---|
   | `new` | Not covered by any existing finding |
   | `duplicate` | Give the existing id |
   | `new-symptom` | Existing root cause, a symptom not yet listed: give the id |
   | `needs-investigation` | Not enough evidence yet |

   Search `findings.json` by file path and keyword before calling anything new.

## 8. Workstream B: independent P0/P1 re-check

**The list:** `gemini/p0p1-ids.txt`, with the blind worklist
`gemini/p0p1-blind.json` (id, area, severity, devices and title only).
- Regenerate both with `python3 -I docs/audit/2026-11/harness/gemini_worklists.py`
  if `findings.json` is newer.
- The count was 94 on 6 Nov. It may differ after batch 6. Verify every id in
  the file.

**Protocol, per finding:**
1. **Blind step.** From the title alone, plus the code and the app, write your
   own expectation:
   - what would have to be true for this to be real;
   - where in the code it would live;
   - how to reproduce it.

   Record it **before** opening the full record in `findings.json`.
2. **Two independent skeptics.** Run them as two separate subagents or
   contexts. Skeptic B must not see A's conclusion.

   | Skeptic | Approach |
   |---|---|
   | A, runtime | Tries to reproduce in the harness or a node/jsdom experiment on this build. Records the exact commands, outputs and screenshot paths. |
   | B, code and specification | Traces the code path independently to a root cause (file:line), checks the governing invariant in CLAUDE.md, and actively looks for evidence that the finding is wrong: a guard elsewhere, a later fix, a misread of intended behaviour. |

   If only one approach is possible (for example, a live-account finding),
   say so, and make B's search for contrary evidence explicit.
3. **Compare** with the original record: detail, evidence, rootCause and fix.
4. **Final verdict**, one of:
   - `confirmed`
   - `partially-confirmed`
   - `not-reproducible`
   - `incorrectly-described`
   - `incorrect-severity` (give the proposed severity)
   - `duplicate` (give the id)
   - `inconclusive`

   Each verdict comes with its evidence and reasoning. Also answer:
   - Is the severity justified?
   - Is the root cause right?
   - Are there other workflows or components affected?
   - Does it overlap another finding?
   - Is there contradicting evidence?

   Not reproducing something is not proof of absence: say what was tried.
   - A finding marked with a `recheck` is not exempt.
   - SH-05 is resolved. SY-01 is the same defect from the sync side, so judge
     it against the `kos-redraw-1` stopgap.

## 9. Deliverables

**All of these go in `docs/audit/2026-11/gemini/`:**

| File | Content |
|---|---|
| `ORIENTATION.md` | Phase 0: your independent map of the app. |
| `P0_P1_INDEPENDENT_VERIFICATION.md` | Method, the verdict table (id, original severity, verdict, proposed severity, one-line reason), disagreements in detail, and patterns found (for example, "auditors over-rate layout issues on emulated iPad"). |
| `p0p1-verification.jsonl` | **The structured record**, one JSON line per finding per step. Schema below. Every id in `p0p1-ids.txt` must have a `final` line. |
| `COMPLETENESS_CRITIC_REPORT.md` | Overall coverage judgement (per area: deep, adequate, shallow, missing); missing areas and workflows; new findings in summary; root-cause review; methodology weaknesses; recommended further investigations, ranked. |
| `proposed-findings.jsonl` | One line per proposed new finding. Schema below. |
| `proposed-root-causes.md` | New, revised, merged or split root causes, each with the finding ids it explains and its evidence. |
| `evidence/` | Small evidence such as text outputs, JSON measurements and repro scripts. Screenshots go in `audit-evidence/2026-11/gemini/shots/`, referred to by path. Probe scripts go in `probes/`. |
| `UNRESOLVED_QUESTIONS.md` | Questions for the user or Claude: things needing the live account or real devices, ambiguous intended behaviour, and harness gaps. |
| `EXECUTIVE_SUMMARY.md` | One page: what you did, coverage verdict, headline new issues, how many P0/P1 held, the biggest disagreements, and confidence. |

**`p0p1-verification.jsonl` schema:**

```json
{"id":"ST-25","step":"blind|skepticA|skepticB|final","by":"gemini-4-argon","at":"2026-11-08T10:00Z",
 "build":"<git sha> sw kos-redraw-1",
 "expectation":"(blind) …",
 "method":"harness slot 31 seed; eval …; node probes/st25.js",
 "observed":"…", "evidence":["audit-evidence/2026-11/gemini/shots/st25-a.png","evidence/st25.txt","js/core/assignments.js:203-208"],
 "verdict":"confirmed|partially-confirmed|not-reproducible|incorrectly-described|incorrect-severity|duplicate|inconclusive",
 "proposedSeverity":"P0|P1|P2|P3|null","duplicateOf":null,
 "rootCauseAgrees":true,"rootCauseNote":"…","alsoAffects":["…"],"overlaps":["…"],
 "contraryEvidence":"…","confidence":"high|medium|low","needsLiveCheck":false}
```

**`proposed-findings.jsonl` schema.** The schema mirrors the canonical one so
that Claude can import accepted items. Ids are `GEM-001`, `GEM-002` … (never
an area prefix: Claude assigns the final id if accepted).

```json
{"id":"GEM-001","classification":"new|duplicate|new-symptom|needs-investigation","relatedTo":["DI-04"],
 "area":"data-integrity","severity":"P1","category":"data|ui|ux|function|perf|a11y|arch|content|security",
 "title":"…","detail":"…","repro":"numbered steps","evidence":"…","files":["js/core/x.js:120-140"],
 "rootCause":"…","fix":"described, not applied","devices":"…","workflows":["…"],
 "whyMissed":"…","confidence":"high|medium|low","openQuestions":"…"}
```

**Git (§0.4):**
- Create your branch: `git switch -c audit/gemini-2026-11 audit/quality-2026-11`.
- Commit only paths under `docs/audit/2026-11/gemini/`, staged by name.
- Use commit messages like `docs(audit-gemini): B — 30/94 verified`.
- Push your own branch: `git push -u origin audit/gemini-2026-11`, never with
  force.
- Do not merge it anywhere. Claude reviews it and merges what the user
  accepts.

## 10. How your work will be used

The second Claude account reviews your deliverables. It will judge:
- whether the critic report is useful;
- whether "new" findings are really new;
- whether the evidence supports each verdict;
- whether all P0/P1 were adequately verified;
- whether the architecture was understood;
- what was omitted;
- whether the method was followed.

It then recommends to the user one of three outcomes: accept, accept with
specific follow-up, or reject and redo. Nothing you write changes
`findings.json` until then. The clearer your evidence trail (exact commands,
outputs and file:line), the more of your work will be accepted.
