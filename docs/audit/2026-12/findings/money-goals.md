# money-goals — December 2026 audit (Batch 2)

Money on 0c93408a (kos-qol-5). No P0. 22 findings: 2 P1, 13 P2, 7 P3. The two P1s are both in the import engine: an entry you typed that adopted a statement row's identity (money-goals#2) is not recognised by the same month's other export, so OFX/QIF/CSV import the payment again (MG-51); and 'Replace it' is offered for any one-day overlap and deletes every entry of the earlier import (a 3-row file wiped 73, MG-61). Phase 1 features mostly work end to end (day chart → Transactions, Select all, Imported source, Imports route, monthly card repeats → Make it recurring, Not yet confirmed with Confirm all/Skip all and Undo, typed matches with adoption and Undo, Make this a goal from pots and budgets) but with gaps: Confirm all double-counts statement matches (MG-48), pot cards make duplicate goals (MG-46), the budget goal starts today and reads 'Under' for an over-budget month (MG-62), the Pots Moves link opens an empty list (MG-64), the Imports page has no way in (MG-50). Several November W4 P2/P3s listed as fixed were never shipped (MG-26, 27, 28, 31, 32, 35, 36, 41, 42, 44 → MG-54..59). Money stayed free of Governor and network traffic (sessions/gold/XP/HP unchanged; only font requests).

## Coverage

- **Routes:** #/money, #/money/transactions, #/money/budgets, #/money/recurring, #/money/pots, #/money/month (Month and Year), #/money/settings, #/money/imports, #/money/merchant/greggs, #/goals/<id> for pot and budget goals
- **Sizes:** all six (mac, ipadl, ipad, iphone, split, slide) for every Money route on the dense account; mac, iphone, split on Empty; low-data Overview on mac, ipadl, iphone.
- **Accounts:** dense (no seeded Money, so it was built through the app's own calls and imports: 6 rules, 2 pots, ~100 typed entries, a generated 75-row three-month midata statement and the six Santander fixtures), Empty, Sample (has no Money data).
- **Flows:** import File→Preview→Done for all six fixtures and a generated 75-row statement; typed-entry matches (name and amount) with adoption and Undo; Undo import from the Imports page; Replace; monthly card repeats suggestion → Make it recurring; Not yet confirmed: Confirm all, Skip all, Undo, statement match; day chart → Transactions for a day; Select all + bulk actions; Source: Imported (all files); Pots Moves link; Make this a goal from pot hero, pot card and budget; Hide amounts on every page; cold load of every sub-route; entry editor kind switch; transfer edit; payday picker; own-export round trip.
- **Contract checks:** zero Governor traffic (sessions, gold, XP, HP unchanged over confirm/import); zero network (only Google Fonts requests); money's READS (money, wishlist, goals, db:money…) cover what the pages read synchronously; money.categories/rules/pots/imports are in cloudmerge RECORDS with string ids; kurenai-os-money is in the full backup (Carbon sweep 1); search has no Money domain (MG-66).
- **Not covered:** the user's copy (slot 7, separate pass); pot pictures (upload) — not exercised; Money settings › Rules: learning and forgetting a payee rule end to end; cloud sync of kos_money (signed out by protocol); multi-tab and background redraw on Money pages beyond READS; keyboard/screen-reader pass of the new queue and preview.

## Findings

| id | sev | title |
|---|---|---|
| MG-45 | P3 | Overview's late-income card reads 'the job pay pay has not arrived yet' |
| MG-46 | P2 | Pots: a non-lead pot's ⋯ › Make this a goal makes a new goal every time and the card never shows the goal it has |
| MG-47 | P3 | Goal dialog from a pot: the money line reads 'one about every 1 days' / '4.8 a day' with no currency |
| MG-48 | P2 | Recurring › Confirm all writes a second entry for an occurrence the statement already holds (it only warns) |
| MG-49 | P2 | Import preview: a row that pays a recurring rule shows 'Other income', counts as 'to categorise', and the category you pick is thrown away |
| MG-50 | P3 | The new Imports page (#/money/imports) has no way in, and does not show the counts the QoL item asked for |
| MG-51 | P1 | A typed entry that took a statement's identity is not recognised by the same month's other export: OFX/QIF import the payment again |
| MG-52 | P2 | Money's bar charts: By week heights do not follow the printed amounts, and outgoing bars (By week, Year view) are drawn darker than the card |
| MG-53 | P3 | Overview chip says 'Pay due Fri 27 Nov · in 0 days' on the day itself |
| MG-54 | P2 | Transactions bulk 'Set category' still files income under a spending category (MG-28 not fixed) |
| MG-55 | P2 | New entry: switching Out to In still saves the Out category while the picker shows Job (MG-32 not fixed) |
| MG-56 | P2 | Import reads '(3.45)' and '3.45 DR' as money in, and '=1+1' as £11.00 (MG-26 not fixed) |
| MG-57 | P2 | Editing a pot move into a between-pots move still keeps the original and adds two (MG-27 not fixed) |
| MG-58 | P2 | Budgets › Payday picker still does nothing while the month starts on the 1st (MG-31 not fixed) |
| MG-59 | P3 | November P3s marked fixed by W4 are still open: search by category or amount (MG-35), reopen a closed pot (MG-36), record a price rise (MG-42), CSV formula cells (MG-44), Year view's pot count (MG-41) |
| MG-60 | P2 | Importing the app's own CSV export over the same data brings back every statement-imported entry as new |
| MG-61 | P1 | Import preview offers 'Replace it' for any one-day overlap, and replacing deletes the whole earlier import (a 3-row file wiped 73 entries) |
| MG-62 | P2 | Budgets › Make this a goal on an over-budget category shows the month as 'Under · No spending recorded' |
| MG-63 | P2 | Overview's 'Left to spend' shows a negative figure (−£10.50) when the month has no income at all |
| MG-64 | P2 | Pots › Recent moves › 'Transactions →' opens an empty list: it sets Moves but keeps the old date range and Source filter |
| MG-65 | P3 | Phone import preview: a skipped row's chip pushes the bank-text toggle ▾ onto a line of its own, and the date drops to the bottom |
| MG-66 | P3 | Cross-app search has no Money domain: pots, recurring rules, merchants and the Imports page are unfindable |

## November re-check

| id | verdict | note |
|---|---|---|
| MG-01 | fixed | Re-importing midata-autumn.csv: 75 of 75 rows 'Already here'; two identical Greggs rows on 13 Nov both import. Adopted typed entries are a new gap: MG-51. |
| MG-02 | fixed | midata-comma.csv read by itself (Santander midata CSV, columns named). |
| MG-03 | fixed | midata-semicolon.csv (leading blank line, ';') and santander-online-excel.csv (3-line preamble) both read. |
| MG-04 | fixed | santander-online.txt, santander.qif and santander.ofx all read and previewed. |
| MG-05 | fixed | Imports list (Transactions › Imports and #/money/imports) with See entries, Replace…, Undo…; Undo removes exactly the batch, re-opens its occurrences and takes back adoptions (typed Heron Foods/Lunch out lose imp/bank/adopt). Replace is a new data-loss path: MG-61. |
| MG-06 | fixed | '£1,234.56' read as 1234.56 in midata-comma and the generated statement. |
| MG-07 | regressed | Import→rule matching and Confirm's 'Your statement already has this' work; the Phase 1 Confirm all bypasses it: MG-48. |
| MG-08 | fixed | Merchants made from bank words (Heron Foods, Greggs, Stagecoach…), Type chip and bank text kept, categories from the merchant table. |
| MG-10 | fixed | Preview footer pinned with Import N entries visible at mac, iphone and slide. |
| MG-23 | fixed | Two GREGGS £2.10 rows on 13 Nov in one statement both imported. |
| MG-24 | regressed | The own export reads back (types, categories), but re-importing it over the same data duplicates every statement-imported entry: MG-60. |
| MG-11 | not reproducible | Month view's In shows received; expected shown apart (not re-measured in detail). |
| MG-17 | fixed | Money shows the jar header, Goals the mountain, after navigating between them. |
| MG-19 | fixed | This view totals come from listTotals (75 entries, Everything, with 60 rows loaded). |
| MG-26 | still open | Brackets and DR still read as money in: new finding MG-56. |
| MG-27 | still open | Editing a move into between-pots still adds two: MG-57. |
| MG-28 | still open | Bulk Set category still files income under spending categories: MG-54. |
| MG-29 | fixed | Phase 1 'Not yet confirmed' lists every past occurrence (26), with Confirm all / Skip all and Undo. |
| MG-30 | fixed | Money goals read KOS.money.evidence (code, js/core/goals.js:837-876). |
| MG-31 | still open | Payday picker ignored while the month starts on the 1st: MG-58. |
| MG-32 | still open | Out→In still saves the Out category: MG-55. |
| MG-33 | fixed | 'No date I can read' (js/core/money.js:1197). |
| MG-35 | still open | Search by category name or amount finds nothing: MG-59. |
| MG-36 | still open | No Reopen for a closed pot: MG-59. |
| MG-37 | fixed | With Hide amounts on, a money goal's page shows masked figures (hidden-goal10-mac-dense.png). |
| MG-41 | still open | Year view 'Set aside · 2 pots' counts the empty Laptop pot: MG-59. |
| MG-42 | still open | setPrice still has no caller: MG-59. |
| MG-43 | fixed | Preview shows 150 rows then 'Show all N'. |
| MG-44 | still open | Export quotes but does not neutralise =, +, -, @ cells: MG-59. |

Evidence: `/Users/fj/Developer/KurenaiOS-519/audit-evidence/2026-12/shots/money-goals/`.
