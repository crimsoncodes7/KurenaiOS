# Money (and the Money side of Goals) — feature inventory

Build: sw `kos-redraw-1`, checkout 2e40f2b (branch audit/quality-2026-11). Slot 14.
Accounts: seeded (harness seed + `mg-seedmoney.js`: 117 typed entries over 95 days, 4 rules, 2 pots, 3 budgets) and EMPTY (`kos.mjs reset`).
Sources: `js/core/money.js` (engine), `js/modules/money.js` (pages), `css/views/money.css`, `js/core/goals.js:669-722` (money goal types), `js/core/aitools.js:2341-2520` (Assistant money tools).
Legend: P = presentation checked (sizes), B = behaviour checked (fixture → result), ids = findings (titles in money-goals.json; N-x = new this run, C-x = carried, index in the final file).

## Routes / views
| Item | P | B | Result |
|---|---|---|---|
| `#/money` Overview (first-run + seeded) | mac, ipad, ipadl, iphone; Graphite, Dawn | low-data rule, chips, links | C (tabs jump, header art), N (no-spend chip with 1 day of entries — folded into the goals-leniency finding), dead gap in Safe-to-spend side card (P3 note) |
| `#/money/transactions` | mac, ipad, ipadl, iphone; shop theme azure-butterfly | filters, search, range, selection, bulk | C (partial totals, touch sizes), N (phone selection unreachable, search scope, bulk Set category) |
| `#/money/budgets` | mac, ipad, iphone | month nav, edit inline, Edit budgets dialog, rollover, archive/restore, payday | N (payday picker dead, income categories unmanaged); rollover verified OK |
| `#/money/recurring` | mac, ipad, iphone | due cards, confirm/skip/leave, rule editor | C (iPhone tile clipped), N (14-day due window, a11y row, setPrice unreachable) |
| `#/money/pots` | mac, ipad, iphone | hero choice, move money, close | C (dead column, clipped tabs), N (closed pot unrecoverable) |
| `#/money/month` Month | mac | same-length comparison, row links, export | C (In = expected, Never printed), N (row link → Everything, export range) |
| `#/money/month` Year | mac (azure theme) | 12-month strip, figures | N (Set aside · N pots, income line has no height) |
| Phone section switch (Money's six views) | iphone | navigation | C (unreachable views, stale sheet — now also seen surviving onto Mac size) |

## Engine features (js/core/money.js)
| Feature | B fixture | Result |
|---|---|---|
| Categories: 16 defaults, groups, tones, archive, Collection = Wishlist budget | addCategory/updateCategory/setBudget('collection') | OK, verified (Wishlist limit 75 ← setBudget) |
| Budgets with one-month rollover (overspend rolls as smaller budget) | budget 100, Jan 120 spent, Feb 30 out + 5 refund | OK: rollover −20, effective 80, net 25, left 55 |
| Payday month start (1–28) | monthStart 25 | OK: 24 Jan → "2026-12", range 25 Jan–24 Feb; UI picker N-finding |
| Recurring units day/week/month/year, every N | 2-weekly count 3, monthly dom 31, yearly 29 Feb, end date | OK: 31→28/30, count stops at 3rd, 29 Feb→28 Feb, end honoured |
| Ends: never / date / after N | as above | OK |
| Price history (setPrice/priceChange) | setPrice(12 from Mar) | engine OK; no UI/Assistant caller → N-finding |
| Confirm / confirm other amount / move date / skip / unmark | confirm then updateTx; skip of a done one | skip removes its entry OK; edited amount not reflected → N-finding |
| Free trial (listed not counted), Remind me → real reminder | notices fixture | OK |
| Subscriptions per month/year | seeded Spotify+Google One | OK (£8.58/£102.96) |
| Pots: target, by-date, set-aside per month, pin, close | 780 to go, 7 months | OK £111.43; close → N-finding |
| Transfers (main↔pot, pot↔pot) | Move money form, editor | form validates balance OK; editor edit → N-finding |
| Splits (must add up) | 6+3 ≠ 10 | OK (dropped), editor refuses unbalanced |
| Refunds reduce category net | 5 refund | OK |
| Wishlist mirror (wl:<item>:<ts>, read-only) | markPurchased £24.99 | OK: appears, deleteTx refused, Collection row by module |
| Lazy list (60 per batch, cursor) | 117 rows | OK; totals partial (carried finding) |
| Search | 'TestRoll' (category), '120' (amount) | N-finding (payee/note/tags only) |
| Hide amounts (per device) | Overview, Money pages, goals | masks OK; goal page leaves "– / of ·" → N-finding |
| Notices (trial tomorrow, bill in 2 days, income late) | three rules relative to today, hidden on/off | OK, figures dropped when hidden |
| CSV parse / guess / preview / import / undo batch | 9 sample files through the REAL dialog (DataTransfer on the file input) | see import table |
| CSV export (all / month / this view) and selection export | round trip of October's export | N-finding (re-import = income); CSV formula cells not neutralised (P3 note in qol) |
| Backup exportAll/importAll | code read | NOT exercised (data-integrity area owns restore) |
| Cloud replication kos_money | code read | NOT checked: needs a signed-in Supabase account; code path read only |
| Achievements reading Money (Bookkeeper 50 entries) | seen firing on seed | OK (counts duplicates too — noted) |

## Import formats (real dialog)
| Sample (audit-evidence/2026-11/qa/money-samples/) | Result |
|---|---|
| midata-comma.csv (Date,Type,Merchant/Description,Debit/Credit,Balance) | refused: "no header row with a date and an amount" (C) |
| midata-cp1252.csv (Windows-1252 £) | refused (C) |
| midata-semicolon.csv (blank first line, ';') | refused (C) |
| santander-online-excel.csv (Account:/From: preamble) | refused (C) |
| santander-online.txt (Date:/Description:/Amount: blocks) | refused (C) |
| santander.qif | refused (C) |
| santander.ofx | refused (C) |
| midata-workaround.csv (headers renamed) | imports; raw strings, all Other (C); the second identical Heron Foods payment skipped as "Already have" (N) |
| odd-amounts.csv ((3.45), 3.45 DR, 3.45-, '06 Oct 2026') | (3.45) and DR → income; trailing minus and text-month date rejected (N); "no date i can read" (N) |
| Re-import with Description → Note | 0 duplicates, all added again (C, P0) |
| App's own export | every row 'in' (N) |
| Thousands '£1,234.56' unquoted | +£1.00 (C) |
| Undo on the Done step | OK (3 → 0); no later undo (C) |
| PDF statement | no path exists (not supported; covered by the formats finding) |

## Goals (Money domain only; the rest is the 'goals' area)
| Type | B fixture | Result |
|---|---|---|
| money-no-spend (repeat) | empty account, weekly target 5 | "✓ Met · 7 of 5" with zero entries → N-finding |
| money-spend-under (repeat, category) | empty account, monthly 100; seeded 200 | reads 0 → met by an empty month → same N-finding |
| money-income (repeat, category) | code read | OK by reading; same zero-evidence caveat |
| money-subs-under | empty account | £0 "Under" (no subscriptions: true) OK |
| money-save (pot) | code read + Pots hero link | OK by reading |
| Goal page with Hide amounts | seeded | N-finding |

## Assistant money tools (inventory only)
money_overview, money_transactions, money_add_transaction, money_delete_transaction, money_set_budget, money_add_rule, money_confirm_bill, money_skip_bill, money_add_pot, money_transfer — NOT exercised here (assistant-archive area runs the tool suite).
