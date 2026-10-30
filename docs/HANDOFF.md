# Working on KurenaiOS from more than one Claude account or machine

The project is worked on from several places: more than one Claude account
(a second, Pro account was added on 19 October 2026 for more usage) and possibly
more than one computer. Each account's Claude has its **own private memory**, so
the only things both can rely on are **Git** and the **files in the repo**.
This page is the protocol that keeps them seamless. Nothing in it needs the
accounts to talk to each other.

## 0. The current handover (28 October 2026)

The first account is near its weekly limit (it resets on Sunday 1 November),
so the art and shop work continues on the other account.

- **Done:** the art and shop audit (roadmap 5.13), the user's two rounds of
  decisions, and roadmap 5.14 (rotating art and your own pictures).
  Everything needed is in [app-art.md](app-art.md): the decisions, the shop
  at 116,700 gold, the 322 Gemini images in 23 waves, and the build order.
  The prompts are `art-source/app/manifest.json` (sheet:
  `prototypes/app-art/art.html`); the Claude Design passes are
  [design-prompts.md](design-prompts.md) §18, now ONE combined prompt
  (art slots, the Assistant, the shop, the cosmetics); the small passes
  18.1, 18.2, 18.4 and 18.6 were built directly on 30 October 2026.
- **Art made:** waves 1–5 (the Assistant, Home's seasons, the subject desks,
  Focus scenes, spotlights, halls, empty states, story covers, finishes,
  banners, the seven outfit bases, Code's capstone badges, the Exam Room),
  saved in `art-source/app/inbox/`, NOT imported yet. Next for the user:
  waves 6–8 (the outfits' faces), then 8 onwards.
- **Live:** sw `kos-japanese-5` (https://fc302f55.kurenai-os.pages.dev).
- **Nothing is built yet.** Next: release 1 in app-art.md, the
  Assistant's redesign (its six images are in the inbox), then Home's
  seasons. Ask before any deploy.
- Another Claude session may be releasing Pencil fixes on
  `feat/pencil-fixes` (worktree `../KurenaiOS-ink`): always fetch and branch
  from the latest `main`.

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
