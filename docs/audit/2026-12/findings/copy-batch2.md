# Batch 2, the copy-account pass

The user's full backup of 26 Nov restored into harness slot 7 (offline,
signed out, default namespace), on `0c93408a` (sw `kos-qol-5`). Measured
27 Nov 2026. Shapes only: no titles, notes, Journal text or amounts.
New findings are in `<area>.copy.jsonl` (MG-90 up, GO-90 up, JM-90 up,
MI-90 up, CO-90 up).

## Money

What the copy holds: 395 entries (1 May – 30 Oct 2026, none in November):
393 from two CSV batches made 64 s apart on 31 Oct (194 rows with no payee,
then 199 with payees, both covering 1 May – 30 Oct) and 2 Collection
mirrors. 348 out, 47 in, no transfers. 0 recurring rules, 0 pots, 16
categories (1 with a budget), 0 learned payees, month starts on the 1st.
No entry carries an import identity (`imp`), bank text or `adopt`; there is
no `imports` record at all (both batches pre-date W4). New: **MG-90** (the
two batches are one statement twice, invisible to Imports and Undo, every
month reads double) and **MG-91** (the Overview shows first run because
November is empty).

- **MG-51** (typed entry that took a statement's identity is imported
  again): measured on the copy: 0 typed entries and 0 entries with `adopt`
  or `imp` — nothing can be matched twice today. It starts to matter with
  the first typed entry a later statement also lists.
- **MG-61** (Replace deletes a whole overlapping import): measured on the
  copy: 0 import records, so no preview can offer Replace against the
  existing data; the two legacy batches overlap each other completely
  (1 May – 30 Oct both) but neither has a record. The first import made
  from now on becomes the first record; a later file touching its days by
  one day would then offer Replace.
- **MG-48** (Confirm all writes a second entry): measured on the copy: 0
  recurring rules, so no occurrence to confirm — no impact.
- **MG-60** (re-importing the app's own export duplicates statement
  entries): measured on the copy: does NOT bite. Exporting October (109
  rows) and September (132) with `KOS.money.csv.export` and previewing them
  back: 109 of 109 and 132 of 132 'Already here', 0 new — the legacy
  entries have no identity, so the legacy day|amount|payee index finds
  them (MG-60 needs entries that carry `imp`).
- **MG-63** (negative Left to spend with no income): measured on the copy:
  every month May–Oct has income, so the case does not arise; Left to spend
  is negative in July, August and October (a 4-digit figure each) — the
  sign is the data's, but its size is doubled by MG-90. November has no
  entry at all, and instead of a £0.00 hero the page shows the first-run
  onboarding (MG-91).

## Goals

What the copy holds: 10 goals (ids 1, 2, 3, 5–11; `nextId` 12), 2
archived: 1 custom manual (due 27 Nov, 0 of 1), 1 weekly study-hours goal
(Mon–Sun, 5 judged weeks, all missed), 1 Collection count goal (missed,
archived) and 7 exam goals (2 on the 13 Nov topic test, 5 on the 15 Jan IT
F201 exam). Completion ledger empty; 8 notification items name a goal.
Every `links.examId` resolves. No new finding.

- Measured against their sources: the study-hours goal reads 6.4 h this
  week = the ledger's Focus parts for 23–27 Nov exactly (5 entries); the
  weeks of 9 and 16 Nov were stored at exactly the ledger's figure (11.9 h,
  10.0 h). Three older outcomes differ from today's reading and are kept,
  as invariant 5b wants (judged once): 19 Oct stores 9.8 h measured over
  the whole Mon–Sun week although the goal began on Sun 25 Oct (today's
  code would read 0 h for that one day), and 26 Oct / 2 Nov store 10.2 h /
  6.2 h where the ledger now holds 12.0 h / 8.9 h (judged on 2 and 10 Nov
  by pre-remediation code; no entry was added after the judgement). All
  five verdicts are 'not met' either way (target 21 h), so no verdict is
  wrong. The exam goals read correctly: grade goals 'Measured once the
  result is logged' (no result logged; the 13 Nov one stays active, by
  design of resultJudge), recall 'Appears after 20 rated cards' (0 rated of
  236 in scope), topics green 0 of 15, papers 0 of 4, checklist 2 of 19.
- **GO-28** (actions after a re-key act on the other device's goal):
  measured on the copy: all 10 goals carry small counter ids (1–11, next
  12), so any goal made on a second device before a pull collides; 8
  notifications reference goals by id. Exposure is the whole list.
- **GO-29** (title goals store a per-device vault id): measured on the
  copy: 0 goals of a title type (no `linkedEntryId`) — no impact today.
- **GO-31** (Restart on a start-day weekly goal deletes history): measured
  on the copy: the one repeating goal runs Monday to Sunday (`weekFrom`
  unset), the control case that keeps its outcomes — its 5 recorded weeks
  are not at risk.
- **GO-32** (editing a passed exam's goal shows another exam): measured on
  the copy: it bites. Goal 5 (the 13 Nov topic test, passed, no result)
  opens its editor with the Exam select holding one option, the 15 Jan
  exam, and not its own; the dialog was cancelled without saving.
- **GO-34** (Daily 15 days), **GO-35** (Money goal amounts): no such goal
  on the copy.
- **GO-37** (hero counts too-early goals as on track): measured on the
  copy: the hero reads 4 behind · 0 on track · 0 met — no too-early goal
  today, so no inflation.

## Note on the code measured

Slot 7's page was still controlled by the `kos-qol-4` service worker, with
`kos-qol-5` installed and WAITING (invariant 38: it activates only when the
user accepts the update), so the Money, Goals and Japanese measurements
above ran on `fa4264d0`'s pages — `git diff fa4264d0..0c93408a` touches
none of Money, Goals or Japanese. The Mind cards page threw SY-33's
'KOS.fsrs.recall is not a function' on it; at ~18:00 the waiting worker
was activated (SKIP_WAITING, as the app's own update prompt does) and the
page reloaded, so everything from Mind on runs on `kos-qol-5`. The same
holds for the user's own devices: SY-33's fix reaches them only once they
accept the update.

## Japanese

What the copy holds: no Japanese answer at all — 0 facets, 0 checkpoints,
0 Japanese ledger entries, 0 `ja:` rows in the review log (481 rows, none
Japanese), 0 mined lines, 0 Focus parts on `ja`, `japanese.input` empty.
Only lesson pages were opened (H1 two pages, with 13 audio lines heard; H2,
H4 and K1 one page each). The desk reads Mastery 0%, Lessons 0 / 28, Today
'H1 · Reviews 0 · New 25 · ≈ 25 min', the Media path 'Calibrating'
everywhere (mac and iPhone). No new finding.

- **JM-40** (a checkpoint counts every Check press): measured on the copy:
  0 checkpoints taken, so no checkpoint pay exists, none with a score
  above 1.
- **JM-41** (kana Check/Enter records again): measured on the copy: 0
  facets and 0 Japanese review-log rows, so no duplicate rows in one
  second for one facet — no impact yet. It bites the first kana session.
- **JM-44** (Due now counts held-back facets): measured on the copy:
  `KOS.ja.due()` 0 and no facet exists, so lesson inspectors and the queue
  agree (0). No impact yet.

## Mind

What the copy holds: 10 card records (6 rated once on 22 Nov, 4 only
introduced by a lesson), all 10 due on 27 Nov (4–3 days overdue); lessons
F1.1 and F1.2 done and paid, F1.3 started; 2 explain-backs; 0 positions,
parked prompts, checkpoints or tensions. Journal: 4 entries (2 insights, 2
reflections), counted only. Ledger: 2 lesson entries (12 XP each), 1
reviews entry (6 cards, 6 XP), 3 Focus entries with the Daily 15's
objective (21, 22 and 24 Nov; 2.6, 2.6 and 4.8 min, 0 pay). The per-device
Daily 15 record is stale (24 Nov, left on 'reviews', its Focus long
ended); today's Daily 15 plans 10 reviews, F1.3 from page 2 and the week's
Big Question. New: **MI-91** (P2, 'In your Journal ›' saves again — the
real Journal holds one such duplicate) and **MI-90** (P3, '10 learnt'
counts 4 never-reviewed cards).

- **SY-33** (Mind card reviews throw): measured on the copy: still thrown
  by the `kos-qol-4` page the slot was running (see the note above);
  after the `kos-qol-5` worker took over, #/mind/cards opens at mac and
  iPhone with 10 due and shows the reviewed card's 'recall ≈ 79%'.
- **MI-20** (One more card set logs nothing): measured on the copy: the
  Daily 15 has not been finished today, so the extra set is not offered;
  no unlogged set in the data (every rated card has its 22 Nov reviews
  entry: 6 rated, 6 logged).
- **MI-22** (#/mind/cards run lost on reload): measured on the copy: 10
  cards due, so a run interrupted on the iPad could rate up to 10 cards
  with no ledger entry. The data shows no sign of it yet (6 cards rated,
  6 in the ledger).
- **MI-24** (a lesson's Cards tab rates with no ledger entry): measured on
  the copy: every rated card's last review (22 Nov) matches the one
  reviews entry; nothing rated outside a logged run.
- **MI-27** (lesson tabs collapse on iPhone): measured on the copy: it
  bites the real lesson in progress — #/ref/mind/F1.3 at iPhone has a 3 px
  tab scroller holding 6 tabs (mac: 382 px).
- **MI-21 / MI-23 / MI-25 / MI-26 / MI-28**: not reachable without
  running today's Daily 15 or a position on the copy; no data shows them.
