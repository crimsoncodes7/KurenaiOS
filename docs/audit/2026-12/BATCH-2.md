# Batch 2: what Carbon verifies

**App head: `0c93408a`** (main, sw `kos-qol-5`, which holds Batch 1's hotfixes).
It is merged into this branch, so Batch 2 ran on it; `git diff fa4264d0..0c93408a`
is the hotfixes alone. One exception: the copy pass measured Money, Goals and
Japanese on the copy's cached `kos-qol-4` pages before it activated the waiting
`kos-qol-5` worker, and the hotfixes touch none of those areas.

Areas: money-goals (MG), goals (GO), ja-mind/Japanese (JM), mind (MI) and
code-space (CO), all complete, plus one pass on the user's own data. 67
findings: 1 P0, 11 P1, 28 P2 and 27 P3.

- **Findings:** `findings/<area>.json`, `.jsonl` and `.md`.
- **Copy pass:** its new findings are in `findings/<area>.copy.jsonl`, with ids
  from 90 up. Its measurements of existing findings are in
  `findings/copy-batch2.md`.

## 1. A quick check of the final SY-38 follow-up (shipped in kos-qol-5)

Carbon held `fix/2026-12-SY-38` on its first version (`34e21d43`). The
follow-up, `19afe3f0`, answered the hold and shipped in `kos-qol-5` with the
other two fixes. Please sanity-check that diff:

```sh
git diff 34e21d43 19afe3f0      # 5 files, +150 / −14
```

- **`js/core/store.js` `assignList`:**
  - Two rows under one id whose creation stamps differ (`ts`, `created`,
    `createdAt`, `addedAt`, `added`) are two records.
  - A displaced live object follows the row that carries its own stamp to the
    new id. That is the clean-adopt case.
- **`js/core/cloudmerge.js` `rekeyCollisions`, the new first pass:**
  - It handles a remote that holds a DIFFERENT record under an id, with this
    side's record under a new id.
  - This side's copy and the base's both move there first, so an unsaved
    change merges into its own record. That is the dirty-merge case.
- **`js/core/store.js`:** mirrorTakeIn, overwrittenWrite and recoverFromMirror
  now pass `renames`.
- **`js/modules/assignments.js`:** the detail body follows its live record
  (`rid()`).
- **`tools/smoke196.test.js` G3:** another tab's write in the clean and the
  dirty state. It fails on `34e21d43` and checks that each goal keeps its own
  target. Invariant 33d says the same.

## 2. The P0 of this batch, fixed at once (not merged)

| Branch | Fixes | Test |
|---|---|---|
| `fix/2026-12-GO-28` (`42682ed6`, from `0c93408a`) | **GO-28 (P0):** the goal page's ⋯ menu and its other buttons hold a row COPY with the old id. After a pull re-keys this device's goal, Delete (confirmed with the dialog open) and Archive acted on the other device's goal, and the deletion replicated. Every action now resolves the live goal when pressed: the same id while it is the same goal (`createdAt`), else the goal carrying the row's `createdAt`, else nothing, with a toast. Gate 183/183. | smoke196 G4 (fails on `kos-qol-5`) |

| `fix/2026-12-small` (`893b8ffa`, ON TOP of `fix/2026-12-GO-28`) | Three findings of a line or two each. **ST-47/EX-57/AP-22:** `openCapture` called `KOS.lazy.ensure`, which does not exist, and now calls `KOS.lazy.need`; the first capture on a lazy boot now opens the sheet. **CARBON-1-1:** search's `examsDomain` treated the assessments map as an array, and now reads `KOS.exams.all()`; an added assessment is found under "Exams & Papers". **MI-91:** Save to Journal (Ask Kurenai and a dialogue's end card) saved again on its second press, and now saves once and then only opens the Journal. Gate 183/183. | Checked in Node; no new suite step |

Merging `fix/2026-12-small` brings GO-28 with it. The user asked for Carbon's
check before both are merged and deployed together.

**Not done:** random string ids for goals, the finding's fuller fix. The router
parses goal ids as numbers, and on the copy all 10 goals have counter ids
1–11. The notification ids and links, and the Google Calendar uids, that name
a goal by id are still not re-keyed (GO-28's last paragraph).

## 3. Severities the lead questions

- **MG-61** is filed P1 and may be P0. An import that shares even one day with
  an earlier one offers "Replace it", and that deletes EVERY entry of the
  earlier import: 73 entries of a three-month statement for a 3-day overlap.
  Undo removes only the new rows. The button does say the old entries go, but
  the extent and the lack of an Undo break invariant 5a. Rule CONFIRMED or
  RECLASSIFY. On the copy there are no import records, so it cannot bite
  today.
- **MG-90** (copy pass) is P1. The user's real Money data holds one statement
  imported twice, on 31 Oct before W4: 393 entries, with every month May–Oct
  read about 2× out and 2× in. There is no import record, so nothing can undo
  it. It needs a repair on the user's own account (`KOS.repairs`), which only
  the user can approve.

## 4. Worth knowing

- **Unshipped W4 fixes:** several November W4 fixes marked fixed were never
  shipped. MG-26/27/28/31/32 are re-filed as MG-54 to MG-58 and
  MG-35/36/41/42/44 as MG-59. MG-07 and MG-24 regressed (MG-48, MG-60).
- **One fix for three:** JM-40, JM-41 and JM-51 share one fix, a once-guard in
  `KOS.jaRun.mount`.
- **Same cause:** MI-27 and CO-43 are the same tab-row collapse on phones,
  from two different switches.
- **SY-33 on real devices:** the user's devices get the fix only once they
  accept the update.

## What Carbon can do while the lead is paused (until the weekly reset)

1. **This batch:** the verdicts, the omission hunt and the §1 sanity check.
2. **The two fix branches:** review `fix/2026-12-GO-28` and `fix/2026-12-small`
   (diff each against `0c93408a`), and run smoke196 and the gate on each.
3. **Horizontal Sweep 2:** lifecycle, routing and contract drift (CARBON.md),
   not run yet. Batch 3 covers the shell and routing, so its results feed
   straight in.
4. **Optional, read-only:** a diff-scoped omission hunt for Batch 3's areas
   ahead of time (content-cs-it, content-maths, home-reports, shell,
   assistant-archive). Number its findings `CARBON-3-pre-<n>` so the Batch 3
   auditors can verify them instead of finding them twice.

## Verify first

GO-28 (and its branch), MG-61, MG-90, MG-51, GO-29, GO-31, JM-40, JM-41,
MI-20, MI-22, MI-27, CO-43 and MI-91. Then the Phase 1 P2s (the README's
`phase1` field) and the omission hunt over `f479433b..0c93408a` for these
areas.
