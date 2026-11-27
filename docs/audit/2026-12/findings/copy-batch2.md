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
