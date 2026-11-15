# Working on KurenaiOS from more than one Claude account or machine

The project is worked on from several places: more than one Claude account
(a second, Pro account was added on 19 October 2026 for more usage) and possibly
more than one computer. Each account's Claude has its **own private memory**, so
the only things both can rely on are **Git** and the **files in the repo**.
This page is the protocol that keeps them seamless. Nothing in it needs the
accounts to talk to each other.

## 0. The current handover (16 November 2026)

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

**Rules for both accounts now:**
- Smoke suite numbers: the other account uses **142, 143, 149 and 150**;
  this account uses 151 onwards (151 is W5's first batch). `npm test` finds suites by number.
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
