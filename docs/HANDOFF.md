# Working on KurenaiOS from more than one Claude account or machine

The project is worked on from several places: more than one Claude account
(a second, Pro account was added on 19 October 2026 for more usage) and possibly
more than one computer. Each account's Claude has its **own private memory**, so
the only things both can rely on are **Git** and the **files in the repo**.
This page is the protocol that keeps them seamless. Nothing in it needs the
accounts to talk to each other.

## 0. The current handover (16 November 2026, evening — supersedes the list below)

The Opus account is paused until Thursday 19 November (weekly limit). The
OTHER account works alone until then: on **Fable** while it lasts, then on
**Opus**. This account keeps **W3** (with design turn 37) and **W9** (its
polish lands after W3); leave both alone. Production is sw
`kos-integrity-15`; `origin/main` is at this commit or later.

**For the other account, in this order:**
1. **Merge `main` into `feat/w4-import` first** (it is behind kos-integrity-11
   to -15). Regenerate `js/data/lazy-index.js` after the merge.
2. **Fable: W4's import engine** — MG-02, MG-03, MG-04, MG-05, MG-06, MG-07,
   MG-08, MG-24 on `feat/w4-import` (Santander fixtures are already there:
   midata CSV, Online Banking CSV and text, QIF, OFX).
3. **Fable, if time is left: W1's sync remainder** — DI-09's second half (a
   streamed backup for very large file sets). AP-01 stage 2 stays parked
   (the user's decision: 8.4 MB at boot is fine).
4. **Opus: W4's Money pages from design turn 39** — the two import steps,
   learned rules (Settings › Rules), Transactions › Imports with Undo and
   Replace, the overview cards (Runway, Balance, By category, By merchant,
   By week, Subscriptions), a merchant's page, MG-10 (the wide import
   dialog), MG-25 (a row opens as a sheet on the phone and at 820).
5. **Opus: design turn 36, held updates** — the "Updated on another device"
   chip and its states in `redraw.js`'s pill (see the turn's README).
6. **Opus: design turn 40** — the spaces' dailies on Home (with W7's HR-04),
   the Wardrobe, Edit your seat on the phone, Focus minimised.
7. **Opus: design turn 41, first open** — the welcome, sign-in landing, a
   Start-fresh Home, the SAMPLE events seed removed (W1's SH-27/EX-39).
8. **Opus, any time: the W1 and W7 P2/P3s that need no design**, then
   **W8** (Help & Guide for every area, docs re-baselined, one shared
   lesson reader, splitting `hub.js`, memoised heavy reads).

**Smoke numbers from now:** the other account uses **160–179**; this
account continues at 157–159 and then 180+. (142, 143, 149 and 150 stay the
other account's.)

**Releases:** each batch its own branch from `main`, the full gate, and the
user's go-ahead before a deploy; bump `sw.js` from `kos-integrity-15`.

## 0a. The earlier handover (16 November 2026)

The user is moving to the OTHER account for a while, which has Fable for a
limited time. That account takes the list below; this account (Opus) keeps
W3, W5, W8, W10 and roadmap 5.19, and does not touch the other account's
files while it works.

**State.** Production is sw `kos-integrity-9` (https://6ed1a44d.kurenai-os.pages.dev),
commit `557169f`, and `origin/main` is at it. The quality programme's plan
is `docs/audit/2026-11/REMEDIATION_PLAN.md` on branch `audit/quality-2026-11`
(read it with `git show origin/audit/quality-2026-11:docs/audit/2026-11/REMEDIATION_PLAN.md`;
its W-sections carry a progress note after each batch, and the appendix lists
every finding with its id; `findings.json` there has each finding's detail,
evidence and proposed fix). Done and live: W0, W1 (all but RC6), W2 (all
but AP-01), W6, W7 (all but HR-04, a design), W3's global fixes.

**For the other account, in this order:**
1. **W2 AP-01, lazy loading** (Fable). Boot loads every script; load the
   study spaces, labs and big content files on first use. Keep `file://`
   working (invariant: classic script tags) and every smoke green.
2. **W1 RC6, Todoist and Google bookkeeping** (Fable): DI-01, DI-05, DI-06,
   DI-07 (re-keyed references), DI-08, DI-12, DI-16, DI-17, DI-23 — see
   the W1 section and the appendix. Invariants 157–160.
3. **W4's import engine, no design needed:** MG-02, MG-03, MG-04, MG-05,
   MG-06, MG-07, MG-08, MG-24 (the table in W4; fixtures in
   `docs/audit/2026-11/data/money-samples/` on the audit branch). MG-10 and
   the views wait for design prompt D-Money (§A8).
4. **The rest of W1's and W7's P2/P3s** that are not design work (filter
   the appendix by workstream; skip anything marked "✎design" or with a
   decision open).
5. ~~Roadmap 5.19 item 2~~ — MOVED to the Opus account on 16 November
   2026 (it is built with design turn 44); leave it.

**Design turns 36–44 arrived 16 November 2026** (the package is in the
user's Downloads, `design_handoff_kurenaios_turns_36_44/`; its README says
what is new per turn and that the app wins over the frames). This account
(Opus) builds 37 with W3, 42 with W5, 43–44 with 5.19, 40–41, then 36 once
AP-01 is on main and 39 once the import engine (MG-02–08) is. W5's first
batch (16 November, `feat/w5-shop`, smoke151): every shop theme retired
and refunded once (`theme-refund`, roadmap 5.20 for designed themes),
Buy behind a confirm, the worn seal beside the brand mark and on the share
card, the CSS frames retired, absolute shelf-skin URLs, the twelve
avatars recomposed as discs. RELEASED with the second batch (share-card
finishes, pen sets on new strokes only, frames sized by their measured
openings) as sw `kos-integrity-10` (https://13f349d3.kurenai-os.pages.dev),
`origin/main` = `d1e9853`: merge main into `feat/w2-lazy` before going on.

**Released 16 November 2026 as sw `kos-integrity-11`**
(https://bd390f7c.kurenai-os.pages.dev, `origin/main` = `30cec4f`, from
`feat/519-figures`): the rest of W5 (smoke151 K–Q, smoke152) and roadmap
5.19 items 2–3 — figures and parts to fill in on the notes' worked examples
across Maths, CS and the CS Paper 2 Companion (`js/core/fillins.js`,
`tools/fill_check.mjs`, smoke153, invariant 89b) and IT's archived and
current units (smoke154, invariant 26f). **Both other-account branches
(`feat/w2-lazy`, `feat/w1-rc6`) must merge main again.** Expect overlap in
`index.html` (one new script, `js/core/fillins.js`, after content.js),
`js/modules/hub.js` (IT desk), `css/views/study.css` and the gate list.
Still to do on this account: 5.19 item 4 (the review schedule for quiz and
exam questions, question history, continuing an unmarked iPad attempt) and
item 1 (IT notes, F201 first); then W3 with 37, 40–41.

**Released 16 November 2026 as sw `kos-integrity-12`**
(https://31f24680.kurenai-os.pages.dev, `origin/main` = `d08ce52`; the
Fable account's two branches MERGED into main, `feat/w2-lazy` first, then
`feat/w1-rc6`): items 1 and 2 of the list above are DONE and live.
AP-01 stage 1, loading on first use (invariant 168, smoke142: boot parses
8.4 MB of 17.0 MB; stage 2, splitting the page modules, is deliberately
LEFT for a later release — the user's decision), and W1 RC6 (invariants
33a, 157, 158, 160; smoke143). The user's decisions in RC6: a reminder
moved out of a Todoist-linked list is only UNLINKED (its task stays in
Todoist and is remembered in `state.ext.ignored` so it is not imported as
a second reminder); a twin is joined one to one and loses no field; two
reminders on one task are folded only after a verified checkpoint;
Todoist's answers are read whatever their shape. Checked against the
suite's fakes only: nobody has tried it against a live Todoist or Google
account yet. The gate is **152 suites** (`""`, 2–148 and 151–154); only
**149 and 150** are still reserved for the Fable account. A new lazy file
or content file needs `node tools/gen_lazy_index.mjs` (smoke142 B fails
when the index is stale). Every other branch must merge main again.
Left on the Fable account's list: items 3 and 4.

**Released 16 November 2026 as sw `kos-integrity-15`**
(https://d2c8c870.kurenai-os.pages.dev, from `feat/519-it-notes`; -14 an
hour before, the same release less a label fix): roadmap 5.19 item 1 for
F201 — all fifteen leaves rewritten from the OCR specification and SAM in
`it-f201a/b/c.js` (replacing `it-f201.js`; smoke156). Expect overlap in
`index.html` (the content-it bundle), `js/data/lazy-index.js` (regenerate),
`js/core/content.js` (examFromWorked: a "<board>-style" source) and the gate
list (156). **`feat/w4-import` must merge main again.** F206 waits until
January 2027.

**Released 16 November 2026 as sw `kos-integrity-13`**
(https://b21cbcf3.kurenai-os.pages.dev, `origin/main` = `5d306ae`, from
`feat/519-review`): 5.19 item 4 below, and the IT desk in the shared order
(Continue in the side column, the current unit beside the course units, no
Resources card). **`feat/w4-import` must merge main again.**

**5.19 item 4 (16 November 2026, `feat/519-review`, from main at
`5c3d699`):** quiz and exam questions on the review schedule
(`js/core/questions.js`, invariant 111c, smoke155), their history, an
unmarked iPad attempt carried on (invariant 132 widened), the subject
desk's review strip, and 78 several-step Maths cards moved to exam
questions (`tools/gen_moved_cards.mjs`). Expect overlap in `index.html`
(two scripts after `js/core/srs.js`, one at the end of the Maths bank
bundle), `js/data/lazy-index.js` (regenerate it after merging),
`js/modules/hub.js`, `js/engines/quiz.js`, `js/core/inkpad.js` and the gate
list. Next on this account: item 1 (IT notes, F201 first).

**Worktrees.** The two accounts collided in one folder on 16 November (the
Fable session switched branches in the main checkout while this account had
uncommitted work there). Each account now works in its OWN folder: this
account's 5.19 work is in `/Users/fj/Developer/KurenaiOS-519`. Never leave
uncommitted work in a folder the other account uses.

**Rules for both accounts now:**
- Smoke suite numbers: the other account uses **149 and 150** (142 and 143
  are taken: AP-01 and RC6); this account uses 151 onwards. `npm test` finds suites by number.
- Branch from `origin/main` after `git fetch`; one branch per batch
  (`feat/<ws>-…`); stage by name; commit and push after every batch; never
  `git stash` with worktrees in use; never force-push.
- At most three agents at once. Use Sonnet agents (`model: "sonnet"`) for
  well-specified, mechanical work with a checker; Opus for judgement.
- A production deploy needs the user's fresh go-ahead every time; the
  release steps are in CLAUDE.md "Run, test and deploy".
- Never write to AniList or VNDB; ask before touching the user's real
  account; leave the user's own files alone (`.claude/`, Live2D art,
  `media_budget_planner.html`, `prompt.md`, `prototypes/code-space/`,
  untracked `docs/audit/`).
- After each batch add a progress note to the plan's W-section on the audit
  branch (a temporary worktree of `origin/audit/quality-2026-11`, commit,
  push, remove it) and update the shared memory (`tools/sync_memory.sh push`).

## 1. Start of every session (either account)

1. Open the repo and read `CLAUDE.md` (architecture and invariants),
   `AGENTS.md` (execution contract) and `PROGRESS.md` (what is released).
2. Check where you are:

   ```sh
   git status -sb
   git log --oneline -5
   git fetch && git log --oneline HEAD..@{u}      # anything new from the other account?
   ```

3. Pick the branch. `main` is the line (27 October 2026: at the kos-japanese-5
   release, with the art audit merged); new work branches from it. The older
   `claude/roadmap-code-study-space` is behind it with nothing of its own.
   Run `git log --oneline main..origin/<branch>` to see if anything moved.
4. Read the shared memory: `docs/memory/MEMORY.md`, then the notes relevant to
   the task. Then load it into this account's own memory:

   ```sh
   tools/sync_memory.sh status    # what differs
   tools/sync_memory.sh pull      # repo -> this account's local memory
   ```

5. Install test dependencies once: `npm install jsdom fake-indexeddb`.

## 2. Where each kind of knowledge lives

| Knowledge | Home | Notes |
|---|---|---|
| Architecture, invariants | `CLAUDE.md` | The numbered invariants are release contracts |
| Execution rules | `AGENTS.md` | Short; read it first |
| What is released / in flight | `PROGRESS.md` | One current snapshot, no diary |
| What is still to build, in order | `docs/ROADMAP.md` | |
| Per-feature plans | `docs/code-plan.md`, `reports-plan.md`, `japanese-plan.md`, `exams-plan.md`, `fsrs-plan.md`, `ipad-plan.md`, `design-prompts.md` |
| A plain-language tour of the app, for people | `docs/GUIDE.md` | | |
| Preferences, decisions, gotchas, project state | `docs/memory/` | Mirrors each account's private memory |
| History | Git | Commit messages and the `docs: baseline at <hash>` commits |

Rule of thumb: if the next session would need it, it goes in one of those
places. Never leave it only in `/tmp`, a scratchpad, a chat, or one account's
private memory. (A scratch file in `/private/tmp` was lost once on a usage-limit
pause.)

## 3. Sharing memory

The shared copy is `docs/memory/`; each account's private copy is
`~/.claude/projects/<project path with every / and space turned into ->/memory/`.
`tools/sync_memory.sh` computes that path itself, so a different checkout
location or home directory still works (override with `CLAUDE_MEMORY_DIR`).

- **Save a memory** (a decision, a correction from the user, a finished piece
  of work): write it as usual (one fact per file, frontmatter `name`,
  `description`, `metadata.type` of `user`, `feedback`, `project` or
  `reference`, a line in `MEMORY.md`), then run `tools/sync_memory.sh push`.
- **Get the other account's memory**: `git pull`, then
  `tools/sync_memory.sh pull`. A replaced file is kept beside it as `.bak`.
- **Both changed the same file**: `status` shows `differs`. Merge by hand, keep
  the newer facts, and keep `MEMORY.md` to one line per memory. Do not let one
  side's whole-file copy drop the other's index lines.
- The script never deletes. Remove a wrong or finished memory from both copies
  yourself, in the same commit.
- Commit memory changes with the work they describe, or on their own as
  `docs(memory): …`. Stage by name.
- The repository is public. A memory must never hold a token, key, password,
  provider credential or exported personal data (backups, the Japanese results
  file). The `STEAM_API_KEY`, `TWITCH_*` and similar secrets live only in the
  platform secret stores and in the untracked `js/env.local.js`.

Links to things only one account can open (a claude.ai artifact such as the
Graphite review checklist, a Claude Design project) will not open from the other
account; ask the user to share them or copy the content into the repo.

## 4. Handing work over

Before stopping (a usage limit, switching account, end of day):

1. Finish or clearly mark the unit of work; do not leave a half-edited generated
   file. Run `node --check` on what you edited and the smoke suites that cover it.
2. Update the doc that owns each fact you changed (`PROGRESS.md`, the roadmap
   status line, the plan), and the matching memory.
3. Commit with a scoped message and **push the branch**, so the other account
   sees it. Commit and push only when the user asks; if they have not, say what
   is uncommitted instead of leaving it silent.
4. Tell the user, in the final message, what is done, what is half done, and the
   next step, so they can paste it into the other account's first message.

A good first message to the other account:

> Continue KurenaiOS from `main` (branch from it for new work). Read
> `docs/HANDOFF.md`, run `tools/sync_memory.sh pull`, and read `PROGRESS.md`.
> Last session: <what was done>. Next: <what to do>.

## 5. Things both accounts must respect

- **Never `git commit -a` or `git add -A`.** The tree usually carries Live2D art
  (`art-source/assistant/live2d/`, licence-gated), `.claude/launch.json`,
  `.claude/settings.local.json` and untracked scratch (`prompt.md`,
  `media_budget_planner.html`, `prototypes/code-space/`). Stage files by name.
- A Git push does not deploy. Production is only
  `tools/deploy_pages.sh --stage` then `tools/deploy_pages.sh`, after the full gate
  and a `sw.js` `VERSION` bump, and only when the user asks.
- Merge, push, deploy and force-push are the user's call.
- Both accounts may have the app's service worker cached in a browser pane:
  unregister it and reload twice before judging a local edit.
- `.claude/settings.local.json` is per machine and is not shared. Permissions
  one account granted do not carry to the other.
- Two sessions must not edit the same files at once. If both accounts are
  active, give each its own feature, and its own branch or worktree
  (`git worktree add ../KurenaiOS-<name> -b feat/<name>`), and merge through the user.
- Weekly usage limits shape the work: Code content is written a unit at a time
  and only when asked. Do not start a large content release unprompted.

## 6. Quick reference

```sh
python3 tools/dev_server.py 8765                          # local server
for i in "" {2..99}; do node "tools/smoke${i}.test.js"; done   # the gate (99 suites)
node tools/cs_diff.mjs                                    # Code content vs real .NET
tools/sync_memory.sh status|pull|push                     # shared memory
```
