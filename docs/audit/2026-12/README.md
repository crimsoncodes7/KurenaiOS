# KurenaiOS audit, December 2026 (Phase 2)

Phase 2 of `docs/qol/PLAN.md`: the same 21-area audit as November's, run on
what Phase 1 shipped. Branch `audit/2026-12`, cut from `main` at **`fa4264d0`**
(sw `kos-qol-4`, 26 Nov 2026). **Docs only:** no app code changes on this
branch. A P0 is fixed on its own branch, `fix/2026-12-<id>`, cut from `main`.

## Baselines

| What | Commit | Diff |
|---|---|---|
| The code audited now | `fa4264d0` (main, sw `kos-qol-4`) | |
| November's audit | `4c3fc33` (sw `kos-redraw-1`, 3 Nov; every run from 5 Nov on; the first runs of 1–4 Nov used `7371325c`, sw `kos-artshop-1`) | `git diff 4c3fc33..fa4264d0`: the November remediation (W0–W8) and Phase 1, 370 files |
| Phase 1 alone | `f479433b` (the QoL plan approved, 1A started, 19 Nov; no app change since `f8478101`, sw `kos-integrity-23`) | `git diff f479433b..fa4264d0`: 1A–1F and Neon's batches, 235 files |

## Batches

Heaviest Phase 1 change first. The run stops after each batch and
`audit/2026-12` is pushed, so Gemini 4 Carbon can verify the batch (`CARBON.md`).

| Batch | Areas (prefix, next id) |
|---|---|
| 1 | productivity (PR-44), exams-files-ink (EX-50), study-core (ST-44), sync-disruption (SY-28), data-integrity (DI-28), architecture-perf (AP-21) |
| 2 | money-goals (MG-45), goals (GO-28), ja-mind (JM-40), mind (MI-20), code-space (CO-39) |
| 3 | content-cs-it (CC-29), content-maths (CM-29), home-reports (HR-32), shell (SH-46), assistant-archive (AA-30) |
| 4 | collection (CL-46), creatives (CR-40), achievements-governor (AG-32), shop-cosmetics (SC-42), a11y-hci (AX-46) |

Ids continue November's numbers in each area, so an id is unique across both
audits and Phase 3 can cite either.

## Accounts

All three run in the harness's isolated origins, signed out, so nothing syncs
and no provider is ever called. Nothing touches production or the real account.

- **dense**: the slot's default ("mine") namespace, filled by `seed`
  (`tools/responsive_audit.mjs --seed`: ~1,900 Collection rows, sessions,
  calendar, reminders, assignments, plan, money).
- **sample**: the app's own Sample account (`KOS.dataMode` "sample").
- **empty**: the app's own Empty account (`KOS.dataMode` "empty").
- **copy**: the user's own data, restored from a full backup into a slot's
  default namespace. **Not run in Batch 1:** the backup path was not supplied.
  When it is, each batch's areas get a copy pass. Privacy: screenshots of the
  copy are never committed, and no finding quotes a Journal entry, a note's
  text or a Money amount from it.

## Viewports

| Name | CSS px | Input |
|---|---|---|
| `mac` | 1470×832 | mouse, hover |
| `ipadl` | 1180×820 (iPad landscape) | touch, hover:none, pointer:coarse |
| `ipad` | 820×1180 (iPad portrait) | touch |
| `iphone` | 402×874 | touch |
| `split` | 590×796 (iPad Split View) | touch |
| `slide` | 375×796 (iPad Slide Over) | touch |

## The harness

```sh
H=docs/audit/2026-12/harness/kos.mjs
EV=/Users/fj/Developer/KurenaiOS-519/audit-evidence/2026-12
node $H start <n>                 # dev server :910n, headless Chrome CDP :930n, profile /tmp/kosqa-<n>
node $H seed <n>                  # dense account in the default namespace (1–2 min)
node $H account <n> sample        # or empty, or mine (the dense/copy namespace)
node $H shot <n> "#/pacing" ipad $EV/shots/productivity/pacing-ipad-sample.png [--full] [--js "<code>"]
node $H eval <n> "KOS.pacing.weeks().length" [--size iphone]
node $H reset <n>                 # wipe every namespace
node $H stop <n>
```

Slots in Batch 1: productivity 1, exams-files-ink 2, study-core 3,
sync-disruption 4, data-integrity 5, architecture-perf 6.

## Evidence

Screenshots and measurement output live OUTSIDE git, in
**`/Users/fj/Developer/KurenaiOS-519/audit-evidence/2026-12/shots/<area>/`**
(`audit-evidence/` is git-ignored). A finding names its screenshot by that
absolute path. File names say route, size and account:
`<surface>-<size>-<account>[-<state>].png`.

## The finding

One JSON object per finding, appended to `findings/<area>.jsonl` as it is
found (a later line with the same id replaces an earlier one):

```json
{"id": "PR-44", "severity": "P1", "category": "bug",
 "title": "One line: what is wrong, where",
 "detail": "Steps, what happened, what should happen. Numbers measured, not guessed.",
 "rootCause": "js/modules/pacing.js:412 — why it happens",
 "evidence": "/Users/fj/Developer/KurenaiOS-519/audit-evidence/2026-12/shots/productivity/pacing-ipad-sample.png; eval {...}; file:line",
 "fix": "The smallest correct fix, naming the helper or invariant",
 "effort": "S", "devices": ["ipad", "split"], "accounts": ["sample"],
 "phase1": "U4 (25a1b650) — the Phase 1 change involved, or null",
 "regressionOf": "PR-12 or null", "invariants": ["84"]}
```

- **category:** bug, data, ui, layout, touch, a11y, perf, content, copy, arch, docs.
- **Severity:**
  - **P0:** data loss or corruption, or a core flow broken with no way round.
  - **P1:** a feature that does not work, a wrong number of money, pay, time or progress, or a layout that hides or blocks a control.
  - **P2:** it works but is wrong or awkward: a layout defect, a misleading word, a missing Undo on a reversible action.
  - **P3:** polish.
- Every finding is reproduced at least twice and root-caused in the code
  (`file:line`) before it is written. A suspicion that cannot be reproduced is
  not a finding.
- When the area ends, `findings/<area>.json` holds the final list
  (`{area, summary, coverage, findings, novRecheck}`) and
  `findings/<area>.md` says what was covered: every route, tab, dialog and
  state, on which sizes and accounts.
- `novRecheck` lists each November finding re-checked, with its id and a
  verdict: `fixed`, `regressed` (then a new finding with `regressionOf`),
  `still open` or `not reproducible`.

`python3 -I docs/audit/2026-12/harness/consolidate.py` writes `FINDINGS.md`,
`findings.json` and `findings.csv`.

## November's findings, per area

`data/nov/<area>.json` lists every November finding of the area with its
workstream and what is expected now:

- `fixed`: W0, W1, W2, W4, W5, W6 or W7 shipped it;
- `partly`: W8 did only what paid off;
- `open (Phase 3)`: W3 or W9.

Every `fixed` P0 and P1 is re-checked, and `fixed` P2/P3s are sampled. An
`open (Phase 3)` finding is not reported again, unless Phase 1 made it worse.

## Rules for every auditor

- **Read-only on the app.** Do not edit anything outside
  `docs/audit/2026-12/findings/<your area>.*`. A P0 is written as a finding at
  once, committed and pushed, and reported in the final summary's first line;
  the lead fixes it on a fix branch.
- Read `docs/invariants/<domain>.md` before citing an invariant, and
  `docs/ownership.md` to find where a feature lives.
- Only the harness. Never Claude in Chrome, never production, never a cloud
  sign-in, never AniList, VNDB, Google, Todoist or Steam.
- **Save as you go:** append each finding to the `.jsonl` when it is found, and commit and push after every
  surface or every five findings, whichever comes first:
  `git add <your files> && git commit -m "audit(2026-12): <area> — …" -- <your files> && git push origin audit/2026-12`.
  Stage by name. Never `commit -a`, stash, rebase, force-push or switch
  branch. If `.git/index.lock` exists, wait a few seconds and retry.
- The evidence folder above, and nowhere in the repo.
- Stop your harness slot when you finish (`node $H stop <n>`).
