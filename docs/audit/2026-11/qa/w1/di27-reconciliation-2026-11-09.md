# DI-27 reconciliation (read-only, before anything runs)

Read on 9 November 2026 from production (https://kurenai-os.pages.dev) in
a fresh Chrome tab on the Mac, with the classifier of `repair-di27.js`
(feat/w1-integrity) run read-only in the page. Nothing was written.

## What collided
| Books row | MAL id | Anime with that MAL id | Manga status | Anime status |
|---|---|---|---|---|
| Aku no Kyouten | 48483 | Mieruko-chan | completed | planned |
| Death Note | 21 | ONE PIECE | onHold | planned |

The Death Note *anime* is also on the list; it has no activity in its
journal on any day, so no batch is ambiguous.

## The ledger
- 2,000 entries (the cap), oldest 27 Sep 2026; 1,745 sync rewards.
- **Phantom: 1,628 entries**, every one a Books sync naming exactly these
  two titles (`entries: 2`). 27 Sep – 8 Nov (last at 18:27 UTC, six
  minutes after the hotfix commit; none since). By month: Sep 151, Oct
  1,132, Nov 345. 514 carry no recorded award.
- **Kept: 107 mixed batches** (they also name 81 other titles; real
  activity). Estimated phantom share inside them: about 4,494 XP and
  1,138 gold (each batch's price less its price without the 36 units and
  2 advances the pair adds). **Decided 9 Nov: keep them** — the entries
  stay as they are and nothing is deducted for them (the classifier's
  behaviour as built).
- Kept: 0 ambiguous.

## The pay to take back
- Each phantom entry's sync-reward price: **74,888 XP and 19,536 gold**.
- Kept: 222 gold of streak-milestone bonus that rode on 18 phantom
  entries (genuine).

## Before and after
| | Before | After |
|---|---|---|
| XP | 224,176 (level 94) | 149,288 (level 76) |
| Gold | 45,994 | 26,458 |
| Ledger entries | 2,000 | 373 (+1 correction) |

No clamp needed. Badge tiers are kept (decision B1, invariant 162).

## Journals (this Mac's copy)
- Aku no Kyouten: 158 of 198 events are traces.
- Death Note: 176 of 199 events are traces.
Each device tidies its own copy at start-up after approval.

## How it runs (after approval)
1. Deploy feat/w1-integrity (staging, checked, then production).
2. On one device: preview `di27-phantom-sync`, compare with this record.
   Any material difference stops the run.
3. Run with the preview's hash: a verified checkpoint, then the entries
   go and one correction is logged; the receipt syncs.
4. Each device scrubs its journals on its next start.
5. The one-off Reports rebuild (HR-02, HR-31) follows separately.

## The run (9 Nov 2026, ~00:51 UTC)
- Deployed: sw `kos-integrity-1`, commit `c5aac79` (staging
  https://e2303c3a.kurenai-os.pages.dev, checked; production
  https://0dc52dbb.kurenai-os.pages.dev). Gate 127/127.
- In-app preview on the Mac matched this record exactly (1,628 entries,
  74,888 XP, 19,536 gold, 107 mixed and 0 ambiguous kept, 222 milestone
  gold kept, the same before/after, 334 journal traces). Hash
  `682472274ffd61d00da9abaa6bef8f16f44f4bcce5baed780597f72be3a09472`.
- Run with that hash: verified checkpoint `bk-1794185462471-94ix5w`
  (37.3 MB; state 2,000, media 1,951, kv 28, attachments 18, money 393,
  reviews 243, ink 152), then 1,628 entries removed and one correction
  logged (−74,888 XP, −19,536 gold). 8 seconds.
- After: XP 149,288 (level 76), gold 26,458, ledger 373, no phantom left,
  the re-plan finds nothing, the receipt synced, the checkpoint still
  verifies, the audit record holds all 1,628 items. Streak 15, 38 badges.
- Journal scrub on the Mac at the next start: its own verified checkpoint,
  then 158 + 176 = 334 traces removed, as approved.

## Found after the run: traces the rule did not catch
63 events remain (Aku no Kyouten 40, Death Note 23), every one touching
the anime's value: Aku `progress 36→0` ×18, `completed→planned` ×17,
`0→36` ×3, `planned→completed` ×2; Death Note `onHold→planned` ×21,
`planned→onHold` ×2 — flips that lasted longer than a day. Both rows were
imported on 2 Jul 2026 (an import journals nothing); Aku no Kyouten was
finished on 22 Aug 2025 and Death Note started in 2024, so no genuine
event exists in either journal. A report built now still lists Aku no
Kyouten in last week (its `0→36` reads as a finish). Removing them leaves
both journals empty. NOT done: it goes beyond what was approved.
