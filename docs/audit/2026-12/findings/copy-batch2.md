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
