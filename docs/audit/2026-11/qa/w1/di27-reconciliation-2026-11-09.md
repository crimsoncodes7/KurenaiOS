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
  2 advances the pair adds). Decision needed: keep, or deduct the estimate.
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
