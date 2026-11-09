# Saved-reports rebuild — read-only preview (for approval)

Read on 9 November 2026 on the Mac, production sw `kos-integrity-4`
(`1112f54`), `KOS.repairs.preview("reports-rebuild-di27")`. Nothing was
written. Hash `a9600cce6e99e7f41b8d937bc5c5d9cf781e30ba6b392414e16a3afe917d4cb2`.

Evidence: the 1,628 entries the DI-27 clean-up removed, read back from its
verified checkpoint by its audit ids; that ledger reaches back to 27 Sep.
Only items saved before the clean-up (9 Nov 00:51 UTC) are touched.

## Snapshots (6) — balance as of each Monday/1st
| Snapshot | XP | Gold | Level | Rest streak |
|---|---|---|---|---|
| 12 Oct | 164,616 → 140,972 | 36,234 → 30,066 | 80 → 74 | — |
| 19 Oct | 176,290 → 142,848 | 39,425 → 30,701 | 83 → 75 | 39 → 6 |
| 26 Oct | 190,078 → 144,676 | 43,211 → 31,367 | 86 → 75 | 46 → 13 |
| 1 Nov | 206,153 → 147,135 | 47,453 → 32,057 | 90 → 76 | 45 → 19 |
| 2 Nov | 208,617 → 147,621 | 41,788 → 25,876 | 90 → 76 | 45 → 20 |
| 9 Nov | 224,171 → 149,283 | 45,969 → 26,433 | 94 → 76 | 43 → 1 |

## Reports (9)
| Report | Earned XP/gold | Level | Rest | Collection |
|---|---|---|---|---|
| Sep (month) | — | — | — | 30 → 26 |
| w/c 7 Sep | — | — | — | 4 → 2 |
| w/c 14 Sep | — | — | — | 9 → 6 |
| w/c 21 Sep | — | — | — | 9 → 8 |
| w/c 5 Oct | — | 80 → 74 | — | — |
| w/c 12 Oct | — | 83 → 75 | 39 → 5 | 29 → 27 (Aku no Kyouten, Death Note) |
| w/c 19 Oct | 13,788/3,786 → 1,828/666 (260 phantom) | 86 → 75 | 46 → 12 | 21 → 18 (+ The Fable) |
| w/c 26 Oct | 17,810/4,664 → 2,216/596 (339 phantom) | 90 → 76 | 44 → 19 | 57 → 43 |
| Oct (month) | — | 90 → 76 | 45 → 18 | 86 → 72 |

"—" = unchanged (a report with no saved "earned" figure kept none; Reports
leaves it out when any entry in the period had no recorded award).

Collection removals other than the two collided titles are titles that
had no progress that period — a score, a status or a sync's echo only
(HR-31): Kimi to Kanojo to Kanojo no Koi., This Monster Wants to Eat Me,
Higurashi no Naku Koro ni, Bu/cunzai de Ni, he Wo (Sep); The Fable (w/c 19
Oct); BLEACH TYBW ×3, Bleach ×2, Monster, Kaguya-sama ×3, Vinland Saga ×2,
Hell's Paradise (w/c 26 Oct and October). No title with a range or minutes
is removed. Saved titles keep their own name, cover and score.

Three reports also get their comparison with the report before
re-derived (`prev`). No week was frozen empty.

## Left alone
- w/c 2 Nov (saved 9 Nov 07:26, after the clean-up — already clean);
  w/c 28 Sep and w/c 31 Aug (nothing the bug reached).
- October's words were written by Kurenai and still quote the old figures;
  switch them to Template, or regenerate, after the rebuild.

## Before it runs
Every other device (the iPad) must open kos-integrity-4 once (open, close
fully, open again): an older version would push the uncorrected copies
back. Every original is kept in the media kv before writing.

## The run (9 Nov 2026, approved; the iPad updated first)
- Re-preview on the Mac matched the approved hash exactly.
- Run with that hash: verified checkpoint `bk-1794211081478-ajh9zq`
  (37.1 MB), every original kept in the media kv
  (`repair.originals.reports-rebuild-di27`: 9 reports, 6 snapshots), then
  6 snapshots and 9 reports written with `factsRev`/`rev` 1. 3 seconds.
- After: w/c 19 Oct earned 1,828 XP / 666 gold, level 75, rest 12, 18
  titles; w/c 26 Oct 2,216 / 596, level 76, rest 19, 43 titles, no Death
  Note; w/c 12 Oct 27 titles, rest 5; October 72 titles, level 76, rest
  18; the 9 Nov snapshot 149,283 XP, 26,433 gold, level 76, rest 1. w/c 2
  Nov untouched. The re-plan finds nothing; receipt and audit settled;
  synced to the cloud. The Reports page, w/c 26 Oct and October render.
- October's words are still Kurenai's: switch to Template or regenerate.
