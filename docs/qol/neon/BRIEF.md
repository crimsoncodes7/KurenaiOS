# Neon handoff brief — first branch (probation)

How to use this file:

- **The prompt (§1)** is what you paste into Antigravity, set up as in §0.
- **The tickets (§2)** are what Neon works through.
- **Grading:** the reviewer (Claude) grades the branch against `docs/qol/neon/REVIEW.md`.
  Neon may read that file; nothing in it is secret.

## 0 · Setting up Antigravity (you, once)

1. **Make a folder of its own on a branch of its own**, so Neon never shares a working tree with Claude:

   ```bash
   cd "/Users/fj/Developer/KurenaiOS - Web" && git fetch origin && git worktree add ../KurenaiOS-neon -b neon/qol-starter-1 origin/main
   ```

2. **Open `/Users/fj/Developer/KurenaiOS-neon` as the workspace in Antigravity.**
3. **Model:** Gemini 4 Neon.
   - **Thinking:** set HIGH if the picker offers it. It is the default, and Google recommends it for multi-step agent loops. Don't pick XHIGH: these tickets are small.
4. **Project settings:**
   - **Agent Behaviour:** the Implementation Plan needs your review before it runs.
   - **Security preset:** terminal commands need review. **Not Turbo.**
   - **Local Permissions:** this folder only. Deny `../KurenaiOS-519`, `../KurenaiOS - Web` and `~/.claude`.
5. **Commands to refuse if Neon asks:**
   - `git push` to anything but `origin neon/qol-starter-1`;
   - `git push --force`, `git stash`, `git reset --hard`, `git clean`;
   - `tools/deploy_pages.sh`;
   - `supabase …`;
   - `rm -rf`;
   - any `npm install` beyond `npm install jsdom fake-indexeddb`.
6. **Credentials:** don't give it a GitHub token or `js/env.local.js`. It doesn't need them. If you'd rather it didn't push at
   all, tell it to commit locally only. Claude can read the branch from the shared repository either way.

## 1 · The prompt to paste

> You are a junior developer on KurenaiOS, on probation. This is your first branch, and you have
> never seen this codebase. A senior reviewer (Claude) will grade your diff line by line. Whether you
> get more tickets depends on that grade. Careful and small beats fast and clever.
>
> **Repository and branch.** You are in a git worktree on branch `neon/qol-starter-1`, cut from
> `origin/main`. Work only here. Never switch branch, merge, rebase, stash, reset or force-push.
> Never push to `main`. Never run `tools/deploy_pages.sh` or anything under `supabase`.
>
> **Read before you plan anything:**
> 1. `AGENTS.md` (the working contract).
> 2. `CLAUDE.md`: "Architecture", the "Invariants" index, "Extension notes" and "Files to edit
>    deliberately".
> 3. `docs/ownership.md`, to find who owns what.
> 4. For each ticket, the `docs/invariants/<domain>.md` file it names. Read the full text of every
>    invariant you cite. The one-line index in CLAUDE.md is not the contract.
> 5. `docs/qol/neon/REVIEW.md`, which is how you will be graded.
> 6. The tickets: `docs/qol/neon/BRIEF.md` §2.
>
> **One-time setup:** `npm install jsdom fake-indexeddb` (test-only dependencies).
>
> **How to work:**
> - Use `/plan`. Before any edit, write an Implementation Plan with one short section per ticket. Each
>   section gives:
>   - (a) the exact file and line you will change;
>   - (b) the existing helper or pattern you will reuse, and where it lives (search first: `KOS.ui`,
>     `css/tokens.css`, `css/components.css`, the same file's neighbours);
>   - (c) the invariants that apply, with their ids;
>   - (d) how you will test it.
>
>   Wait for approval.
> - Do the tickets in order, one commit each. Use the message
>   `fix(qol): <ticket key> — <what changed>` and the trailer `Agent: Gemini 4 Neon (Antigravity)`. Stage
>   files by name; never use `git add -A` or `git commit -a`. After each commit, push the branch:
>   `git push origin neon/qol-starter-1`. The session can end at any time, and pushed work survives.
> - Change only what the ticket asks:
>   - no renaming, reformatting, reordering imports or "while I'm here" fixes;
>   - no new files unless the ticket says so;
>   - no new global helper.
>
>   If you see something else wrong, write it in the Walkthrough under "Noticed, not touched".
> - Never hand-edit `js/data/compsci.js`, `js/data/maths.js`, `js/data/it.js` or `js/data/lazy-index.js`.
>   Don't touch these files at all:
>   - `js/core/store.js`, `js/core/cloud*.js`, `js/core/redraw.js`, `js/core/router.js`;
>   - `js/core/sessions.js`, `js/core/governor.js`, `js/core/ui.js`, `js/core/lazy.js`;
>   - `sw.js`, `index.html`, `js/env*.js`;
>   - `supabase/`, `art-source/`, `.claude/`, `docs/memory/`, `prototypes/`.
>
>   If a ticket seems to need one of them, stop and say so in the Walkthrough instead.
> - Style:
>   - classes are presentation only and start with `k-`;
>   - tests and logic read `data-ui`, ARIA or `data-state`, never classes (invariant 26);
>   - colours, spacing, radii, fonts and z-index come from tokens (`var(--…)`), never raw values;
>   - only the five width breakpoints exist (1240, 1080, 860, 700, 560; invariant 47);
>   - spoken messages go through `KOS.a11y.announce` (invariant 66);
>   - dialogs open and close through `KOS.ui.openDialog` and its close path (invariant 49).
>
> **Testing (required):**
> - After each ticket, run the suites that cover it (named in the ticket; find others with
>   `grep -l <the thing you changed> tools/smoke*.test.js`). Each suite runs as `node tools/smokeN.test.js`.
> - After the last ticket, run the whole gate once: `SMOKE_JOBS=3 npm test`. It must end with every suite
>   passing (177 / 177 at the time of writing). Paste its final summary lines into the Walkthrough. A red gate is
>   never "unrelated": if a suite fails, find out why. If your change caused it, fix it. If it fails on
>   `origin/main` too, show that by running it there (`git stash` is not allowed; use a second worktree or
>   say so plainly), and report it.
> - Browser check: run `python3 tools/dev_server.py 8765` and open `http://localhost:8765/` with
>   `/browser`. For each ticket, show the changed screen at 1470×832 and 820×1180. Take a screenshot
>   of each into the Walkthrough. The app's data here is a local test copy; you may use
>   Settings › Data › Sample to get a filled-in account. Never sign in to anything.
>
> **Finish with a Walkthrough artifact** containing:
> - per ticket: the commit hash, the files and lines changed, the helper reused, the invariants
>   checked, the suites run, and screenshots;
> - the full gate's summary;
> - "Noticed, not touched";
> - anything you were unsure about.
>
> Don't claim something passed unless you ran it and saw it pass.

## 2 · The tickets

Seven small, independent tickets, all from the plan's batch 1D or 1B. Each one names where to
look. It doesn't say how to fix it: that is part of the test.

### T1 · `content-cs-it#2` — a typo in a worked example's title

- **Where:** `js/data/content/cs-p2-46b.js:319`. The worked example is titled "The 7-segment segment".
- **What to do:** give it a correct, specific title for what the example works through. Change nothing else in the file.
- **Before you change it:** check whether a worked title is used as an identity anywhere (for example a key
  that stores your handwriting or an exam item's history). Say what you found.
- **Invariants:** `docs/invariants/study.md` (25, 87) and `ui.md` (24).
- **Tests:** `node tools/validate_content.js`, `node tools/smoke116.test.js`.

### T2 · `mind#4` — "1 bullets"

- **Where:** `js/modules/mindrun.js:274` prints `n + " bullets"`, which reads "1 bullets" for one.
- **What to do:** fix it, and any other count in the same file with the same fault.
- **How:** look at how other modules write a count that may be one. Don't add a shared helper.
- **Invariants:** `docs/invariants/spaces.md` (137–141, for what Mind's run may and may not do).
- **Notes:** this file is inside the lazily loaded bundle `page-mind` (invariant 168, `ui.md`). Run
  `node tools/gen_lazy_index.mjs --check` and say what it reported.
- **Tests:** `node tools/smoke109.test.js`, `node tools/smoke111.test.js`.

### T3 · `goals#5` — editing an exam goal says "Goal added"

- **Where:** `js/modules/goals.js:1057` always announces "Goal added: …", even when an existing goal was edited
  (`existing` is set).
- **What to do:** an edit should be announced the way the general goal editor already announces a save. Find
  that line in the same file and match it.
- **Invariants:** `docs/invariants/ui.md` (66) and `core.md` (5b).
- **Tests:** `node tools/smoke92.test.js`, plus any suite that greps "Goal added".

### T4 · `money-goals#5` — Money's kicker says "The month" on every page

- **Where:** `js/modules/money.js:132` (`kicker: "円 · The month"`) is the same on Pots, Recurring,
  Transactions and Settings.
- **What to do:** each page's kicker should name that page. Keep the 円 mark.
- **How:** use the `VIEWS` table that is already beside it, rather than a new list.
- **Invariants:** `docs/invariants/core.md` (5a) and `ui.md` (50, 50a, 168: `money.js` is in the `page-money` bundle;
  run `node tools/gen_lazy_index.mjs --check`).
- **Tests:** `node tools/smoke119.test.js`, plus any suite that reads Money's page header.

### T5 · `study-core#9` — the assignment subject list ignores the subject registry

- **Where:** `js/modules/assignments.js:89` (the filter) and `:357` (the editor's subject select) build the
  list from `Object.keys(window.KOS_DATA)`. That gives the wrong order and bypasses the one subject list.
- **What to do:** use the subject registry. Read `js/core/subjects.js`'s header and choose the right call. The
  rows that qualify today must still qualify, and the order must be the registry's.
- **Invariants:** `docs/invariants/spaces.md` (103) and `ui.md` (27).
- **Tests:** `node tools/smoke102.test.js`, `smoke103`, `smoke104`.

### T6 · `assistant-archive#4` — cancelling Reset everything loses keyboard focus

- **Where:** `js/modules/dataview.js`, in `resetDialog`. Cancel does `overlay.remove()`, so focus is
  not returned to the "Reset everything…" button.
- **What to do:** close the dialog through the shared dialog's own close path, so focus returns as it does for every other
  dialog. Read `KOS.ui.openDialog` in `js/core/ui.js` (read only: don't edit `ui.js`) to see how.
- **Invariants:** `docs/invariants/ui.md` (49, 66, 166).
- **Tests:** `node tools/smoke134.test.js`, `smoke149`. In the browser, Tab to the button, press Enter, Cancel,
  and show where focus is.

### T7 · `shell#2` — the "/" search key badge shows on touch screens

- **Where:** `index.html:81` holds `<kbd class="k-search-key">/</kbd>`; its style is in `css/layout.css:68`.
- **What to do:** on a device with no hover and a coarse pointer (an iPad or a phone held by hand) the badge
  shouldn't show. On the Mac it stays. CSS only: don't edit `index.html`.
- **How:** follow the pattern the CSS already uses for touch (search `css/` for `hover: none`), and put the
  rule where its neighbours are.
- **Invariants:** `docs/invariants/ui.md` (26, 40, 47, 69).
- **Tests:** `node tools/smoke135.test.js`; `node tools/responsive_audit.mjs --ipad` (or show the 820×1180 page with touch emulation).
