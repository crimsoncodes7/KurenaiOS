# Governor, Focus, rewards, Money, Goals and Achievements

Release contracts, moved out of `CLAUDE.md` on 17 November 2026 (W8)
word for word; `CLAUDE.md` keeps a one-line index. The historical
numbering is kept: tests, source comments and audit notes cite it.
Read this file before editing or testing anything in its domain.
### Governor, Focus and rewards (1–5)

1. Streaks, XP, HP and gold flow from `KOS.sessions.log()` only. Never write them
   directly. Pay given in error is taken back the same way: ONE `correction`
   entry with a negative award, clamped at 0 (`governor.onSession`), which is
   not activity, study or rest, earns no milestone and is left out of
   Reports' "earned" and the badge rollup (the DI-27 clean-up). It may carry
   a negative HP too. The one correction that GIVES gold is a refund
   (`metrics.refund`: what a retired item cost, W5's theme cull), still no
   activity and not "earned". UNDO (RC21): `KOS.sessions.undo(entryId, title)` is the
   one route that reverses what an entry paid — ONE correction (XP, gold less
   the streak bonus `award.ms`, and the HP the entry actually restored,
   `award.hp`), marking the entry `metrics.undone`; it runs once, the entry
   stays in the ledger, and an undone entry is neither the day's activity
   nor counted against a daily cap. Streak milestones: when several are new
   at once only the highest pays (the rest are recorded unpaid), named once.
1a. ONE-OFF REPAIRS AND MIGRATIONS go through `KOS.repairs`
   (`js/core/repairs.js`): a `plan()` that is a dry run (computed from the
   data, so it is idempotent), a preview with a hash, a consent repair run
   only with the hash the user approved (data moved since → refused), the
   change made only inside `KOS.backup.withCheckpoint` (a VERIFIED full
   checkpoint in `kurenai-os-backups`, scoped by the data namespace, last
   five kept), re-planned after to `needed: false`, a receipt in
   `state.repairs` (synced, so no device runs it twice) and an audit record
   in the media kv (`repair.audit.<id>`). The checkpoints are listed on
   Backup & Restore in words, each with Download and Restore (the copy is
   read and verified first, then one of the device as it is now is taken,
   `KOS.backup.restoreSafe`). Import backup reads the file,
   asks (a danger dialog with its date and counts) and takes a verified
   checkpoint of this device before it replaces anything. An AUTOMATIC
   repair (no consent) runs only while its `ready()` holds: the two that
   move data out of the state document are `ja-mined-to-local` (at start)
   and `profile-pictures-to-files`, which waits until this page load holds
   the account's copy or knows there is none (`KOS.cloudsync.settled`) —
   run before the first pull, its change met a newer cloud copy as this
   device's own edit and won. The sync engine starts the automatic repairs
   again after the first good cycle and after any cycle that brought a
   document in. A file the browser can no longer read rides a backup by its
   record alone and the checkpoint names it (`unreadable`); it never fails
   the backup.
2. Gold gates only labs and simulations (one-time unlocks) and, since
   roadmap 5.14, UPLOADING a picture of your own ("Your own picture", per
   area or all; a picture set before keeps showing) — the profile banner
   included, wherever it can be uploaded: Avatar & profile, the picture
   drawer and Edit your seat (SC-32). Everything else gold
   buys is cosmetic (design turn 34g). HP gates NOTHING:
   it is a wellbeing signal (state label, drains, the recovery checklist, and a
   halved restore trickle while Critical) — low HP used to suspend labs, sims
   and the shop, and study material behind a health bar was the wrong trade.
   Specification, notes, flashcards, quizzes, exam questions and Focus never
   lock.
3. Media/leisure never changes HP and feeds only the separate rest streak. Reading
   sessions do not take distraction penalties.
4. Study streak, rest streak and the HP day-activity test are separate derivations
   of the session ledger. An incomplete Focus entry does not count for a streak but
   still counts as activity for the day-drain check; so does a `todo` tick (a
   habit, reminder, task or assignment completion) — activity, never study
   (`studyEntry` in `sessions.js`).
4a. `KOS.governor.focusAward({complete, mins, secs, pauses, rule|mode})` is the
   one pure definition used by previews and payment; the completion screen
   reports `lastAward()`. The mode picks the rule (`focusRule`):
   - Pomodoro — a completed session pays XP 10 + minutes, gold 3 + 2 per full
     25 minutes, HP 6; ending before the first full cycle forfeits it.
   - Custom, Stopwatch and Study-until — every FULL 10 minutes of focus is a
     block paying 12 XP and 1 gold, and 2 HP up to 6 a session
     (`FOCUS_BLOCK`). Ending early keeps the blocks earned; under 10 minutes
     pays nothing and is not complete (no streak). 30 min pays 36/3/6,
     60 min 72/6/6, 120 min 144/12/6.
   - Both rules: the first pause is free, each further one takes 15% off XP
     and gold (floor 25%).
   Stopwatch and Study-until may carry a break NUDGE (`nudgeMin`: a chime and
   one line, never a stop), and a stopwatch a self-stop LIMIT (`limitMin`,
   ended and paid exactly like Stop, `ended: "limit"`).
   A focus entry records its `rule`, `secs` and `blocks`; an entry from before
   the blocks rule carries none and reads as Pomodoro, so history is never
   re-priced. Each STRETCH of a Focus session links ONE subject: its `refs`
   may name several topics in it, and `ref` is the first leaf they cover.
   "Switch…" (`KOS.focus.switchTo`, the `focus_switch` tool) moves a
   running study session to another subject, topic or assignment without
   stopping the clock: the session stays ONE entry, paid once on its whole
   time, and the stretches (`segs`, each starting at the focus second of
   its switch, so breaks and pauses belong to none) are logged as
   `metrics.segments` [{subject, ref, refs, assignmentId, secs}] when there
   is more than one. A stretch under a minute is a correction and is
   replaced. The entry's own `subject`/`ref`/`refs` are the longest
   stretch; every reader that splits time by subject or topic (goals,
   Reports, Home, a topic's minutes, a subject's streak) reads
   `KOS.sessions.parts(e)`, and a completed session banks each stretch's
   minutes on its own assignment. Reading sessions do not switch.
4b. A Focus session is logged and paid before its review opens. Review may annotate
   that record and linked work but must never log or pay again.
4c. Page hide banks the live clock with `KOS.store.flush()` — the count-up
   stopwatch included. Reload/navigation is not a session, pause or
   distraction; recovery returns paused. Study-until ends at its clock time
   (`untilTs`); a pause never moves it. THE SCREEN GOING OFF (UR-5): a
   running session hidden banks its heartbeat at once and records when
   (`hiddenAt`, never a pause; a page closed or reloaded on purpose clears
   it). Restored after the system discarded the page, it comes back paused
   and OFFERS the minutes the screen was off ("Count the N minutes…"),
   capped by the phase, the study-until time or the stopwatch's limit, six
   hours at most; counting adds them (`screenOff`). On a touch-first device
   (coarse pointer, no hover — a phone or an iPad) hiding the page is not a
   distraction: a screen lock and an app switch look the same to a browser,
   and a screen lock is not one. Desktop tab switches count as before.
4d. The idle watch: any interaction with the app restarts a 30-minute clock.
   A RUNNING study session untouched for 30 minutes is warned (toast, live
   region, a `focus` notification); 5 minutes later, still untouched, it
   ends itself, logged and paid ONLY for the focus done before the last
   interaction (`activeWork`), `ended: "idle"`, and its review waits on
   screen for the return. While the warning stands a pointer sweep is not
   an answer (a key, click, scroll or "I'm here" is), and answering marks
   the warning read in the bell. Reading and paused sessions are never
   watched. The mini-player's place and size are per device
   (`state.ui.focusMini`); `KOS.focus.clampMini` is the one rule: two widths
   (236/340), 20px in from the viewport, rail and header, and always docked
   (a corner within 64px, else the nearest edge). The phone dock does not
   read it.
4e. THE FOCUS PAGE OWNS A SESSION'S SET-UP (asked for 14 November 2026).
   Mode, length, break, Study until, the nudge and the limit are chosen on
   the Focus page only. Every other way in — Home's Up next ("Set up focus
   →") and Today's three, the Daily Review, a routine step's Focus link, a
   topic, an assignment, a Calendar study block, Compare Topics — opens the
   page with what to link (`KOS.show("focus", {subject, refs,
   assignmentId, objective, mins})`: the form is filled, nothing starts and
   nothing is saved until Start; several topics are the whole subject;
   `mins` is a calendar study block's own length). About to Study
   (`KOS.routinePlayer.preflight`) is that page's pre-flight: it has no mode
   or length, says the page's timer in words and hands back exactly the
   page's set-up — only the objective, and the link when its Change picks a
   task, are its own; "General study — no link" stays unlinked. Called
   without the page's `onStart` it opens the page instead. Purpose-built
   sessions keep their own start: the Assistant's `focus_start`, the
   Writing Desk's sprint, Mind's Daily 15 and a book's reading session.
   UNDER A RUNNING SESSION (design turn 40f) the page is the LIVE card in
   the set-up's place — the clock, the objective, quick notes, Pause or
   Resume, Switch…, End early, Return to the stage — beside the record
   (Focused today counting the session, live) and the session's deal (what
   it has earned so far, live); while it is on screen the mini-player
   hides (`data-fx-page` on the root) and it returns on leaving.
5. One deliberate bulk/sync action produces at most one session. Autonomous
   multi-provider sync batches rewards; XML import does not reward.
5a. Money (`KOS.money`, roadmap 5.4) and the Budget Planner are logistics:
   zero Governor traffic and zero provider/network traffic. Purchase handoff
   is exact, local and cannot downgrade Collection data. Decision B: the small
   part (`state.money`: currency, `monthStart`, categories, rules, pots) is
   in the synced state document under `KOS.money.normalise`, every record
   keyed by a STRING id (fixed for the default categories, random otherwise)
   so the merge never re-keys what a transaction points at; TRANSACTIONS
   live in their own IndexedDB, `kurenai-os-money` (`tx` by `syncId`,
   indexed by date; `del` tombstones), in the full backup, and replicated to
   the owner-only table `kos_money` (migration `20261019000001`;
   `KOS.money.syncCloud`): local first, push then pull, a per-row stamp in
   the media kv (`money.sync.<uid>`) so this device's echo is skipped, a
   remote deletion applied without a tombstone of its own (never sent
   back), and the planner's mirror never sent. Amounts are integer minor
   units (`minor`). An IMPORTED row is known by what the bank wrote
   (`imp`: the date, amount, kind and the source row's other cells,
   normalised and order-free; a FITID/"Transaction ID" column wins), with
   its occurrence ordinal within the statement (`occ`), so two identical
   same-day payments both import and a re-import — another payee column,
   reordered columns — flags exactly the rows already stored; the source
   row rides on the transaction (`raw`) and the statement has a
   fingerprint (`imp.stmt`). Rows imported before carry no `imp` and are
   matched by date, amount and payee, each used once. THE IMPORT ENGINE
   (W4, smoke149): a file is read by the pure `KOS.moneyImport` — its
   bytes (UTF-8, else Windows-1252), its format sniffed from the text (CSV
   with a sniffed delimiter and a header row FOUND below any preamble,
   OFX/QFX, QIF, Santander's text export, and the app's own export by its
   exact header), a trailer left out, an unquoted thousands separator put
   back (a row that still does not fit its header is reported with its
   cell count, never imported). A header the app cannot place is not a
   failure: the preview returns `needs` and the reader maps the columns.
   An imported row's `payee` is the MERCHANT made from the bank's words
   (`KOS.moneyImport.merchant`: the bank's noise stripped, then the
   authored table `js/data/money-merchants.js`, else title-cased), its
   category a learned payee rule's, else the table's, else Other; the
   bank's own words and Type stay on the row (`bank`), never a balance.
   A LEARNED PAYEE RULE (`state.money.payees`, a keyed map; `learnPayee`)
   acts on future imports only and never rewrites a stored entry. The same
   payment through ANOTHER export (the month as CSV, then as OFX) is known
   by its day, amount, direction and merchant, counted like the identity
   (`dupOf: "similar"`); two rows that both carry the bank's id are never
   compared that way. A STATEMENT MEETS THE RULES (MG-07): a row that pays
   an occurrence — the same direction, its exact amount, within three days;
   by name, or by amount alone only when each is the other's one candidate
   — is written under the occurrence's own id `r:<rule>:<date>` and marks
   it done (a Confirm on another device is the same record), and the rule
   learns what the bank calls it (`aliases`); an occurrence already
   confirmed makes the row a duplicate and its entry takes the row's
   identity (`adopt`); a skipped one is never matched. A STATEMENT MEETS
   WHAT YOU TYPED (money-goals#2): a row with no match, of the same
   direction and exact amount as an entry typed by hand within three days
   — by name, or by amount alone only when each is the other's one
   candidate — is skipped as "Same as …" (`dupOf: "typed"`, the preview
   can import it anyway) and the typed entry takes its identity (`adopt`).
   The Bookkeeper badge counts DISTINCT entries: an imported row stored
   twice is one, by its identity and ordinal (money-goals#7). Confirm OFFERS a
   stored bank entry of that amount instead of making a second one
   (`bankMatches`, `confirmWith`; "Your statement already has this"),
   refuses an occurrence a statement already paid,
   and an occurrence that lets go of a BANK's row unlinks it and keeps it
   under an id of its own (`releaseTx`): only an entry Confirm made goes
   with its mark. AN IMPORT IS ON RECORD (`state.money.imports`, synced:
   file, format, the days it covers, how many it added, the statement's
   fingerprint and its closing balance — one figure per import): Undo
   removes exactly its entries and its record, re-opens the occurrences it
   paid and takes back what it gave an adopted entry; Replace writes the
   new import first and only then undoes the old. THE APP'S OWN EXPORT
   reads back without loss (MG-24): the kind from Type, the category and
   the pot by name (made when this device has none, and named in the
   preview), a transfer's `Pot direction`, and a split's lines joined
   again by their `Entry`. THE PAGES (design turn 39, smoke161) only read
   and write through the engine: a category set by hand in the preview
   OFFERS a rule under its row (Always / Just this one) and never makes one
   by itself; the rule switch on an entry and the category on a merchant's
   page are rules for the NEXT statement and change no stored entry; the
   Overview's Balance is the newest import's closing balance (and the
   entries dated since), Runway needs an income rule in Grants still to
   come, a known balance and two weeks of spend, By week two weeks with
   spend and By merchant two merchants in the period (invariant 76). The Assistant reads Money as TOTALS (`money_overview`);
   single entries only through `money_transactions`, when asked; every
   `money_*` write is undoable and none touches the Governor.
   The planner OWNS its purchases: each archived purchase is mirrored as a
   Collection transaction `wl:<item>:<purchasedAt>` before every read, cannot
   be edited or deleted from Money and is not backed up twice; the Collection
   category's budget IS `wishlist.budget.monthlyLimit` (`budgetFrom`). A
   recurring rule is computed, never copied (invariant 43): an occurrence is
   confirmed (one transaction `r:<rule>:<date>`), skipped, or left
   (`marks`). A figure about the rest of the month (left, safe to spend, the
   projection) is null without its evidence (invariant 76). The pages only
   READ (smoke56 holds all six views): Hide amounts is per device
   (`state.ui.moneyHidden`) and masks every `KOS.ui.amount` on every
   surface, Reports included; the Wishlist's "Mark purchased" says what it
   will do before it does it; the Calendar draws bills, income and trial
   ends as DERIVED chips (`derivedOn`, never written as events, invariant
   44), hidden per device by `state.ui.calDerived`.
5b. Goals (`KOS.goals`, `js/core/goals.js`) are a registry of types, each
   registered by the domain that owns its data and measured by READING it
   (invariant 26d); `state.goals` v3 under `KOS.goals.normalise`, which keeps
   a type id it does not know. A repeating goal (`repeat` week/month) is one
   record: the current period is measured live and each ENDED period is
   judged once into `outcomes[periodKey]`; only types that can be read over
   any past range repeat. A period counts only from the goal's start
   (GO-03): a first period begun before it is measured from the start day
   and marked `partial`, and short of its target it is neither met nor
   missed (no run broken, no miss in Reports). A change of the period grid
   (the repeat, or the day the week runs from) keeps only outcomes on the
   new grid and judges the rest again from the start (GO-04). An edit of
   what a goal reads or is judged against (type, links, params, target,
   dates, a manual count) is a new judgement: a reached goal is reopened
   and its one receipt kept (GO-05), and a baseline taken at creation is
   taken again when what it reads changes (GO-24; a fromBase goal whose
   figure cannot be read yet has no baseline, no line and no pace until
   the first figure, GO-27). A stay-under goal on LIVE state (`live`:
   overdue work, carry-overs, subscriptions) records the first breach
   inside its range after its first day (`params.breach`) and is missed
   from then; it is kept only if never breached by the deadline (GO-08).
   Money goals judge only what Money can speak for (`KOS.money.evidence`:
   from the first to the last day with an entry or under an imported
   statement): a period with no record is not judged and a day with no
   record around it is not a no-spend day (GO-18, MG-30). A met or missed
   goal leaves the pins (GO-26). Completion records one idempotent
   `payout:"activity-only"` receipt (`"none"` for a Governor-value goal,
   which is display only) and never creates a second economic event or a
   session. The Collection's types measure the GOAL'S OWN PERIOD (GO-02): titles
   completed and steps of progress, volumes, routes and hours from each
   title's activity journal (`KOS.mediadb.periodStats`), titles added by
   `createdAt`, purchases by `purchasedAt`, favourites from a baseline taken
   when the goal is made — never the vault as it stands, so most of them
   repeat. A topic's colour (`KOS.rag.auto`, GO-23) is evidence-weighted:
   recall, quiz and papers each scored and weighed, the band following the
   score, and Green only with recall from three rated cards AND a quiz or
   paper, each at 70 or more (else Amber, `thin`). A goal speaks through the `goal` notification kind
   (`KOS.goals.notices`, pure; `tick` every 30 minutes): a period ending
   tomorrow, a deadline tomorrow, reached, missed — one notice each by id,
   none for a display-only or archived goal, reached/missed only within two
   days (a miss from when its deadline passed; ids keyed by the day reached
   and the deadline missed, GO-10). In Reports a repeating goal's period
   belongs to the report holding its END (GO-09); `f.money` (totals, the three biggest categories, a
   month's over-budget categories) and `f.goals` (periods met and missed,
   goals reached and missed in the period) are facts like the rest; the
   words' payload gets their totals and counts only, never a payee,
   category or goal title (invariant 102b). The Reports pages draw them as
   the Money and Goals cards with "What Kurenai sees" (27o).

### Achievements, the Badge Wall (161–163; docs/achievements-plan.md)

161. BADGES READ, NEVER PAY. Every badge is registered with the domains it
    reads (`owners`) and its `measure` READS that owner's record — the
    session ledger, the topic bands, Code's evidence, the vault, Money —
    tracking nothing new (a badge the app has no evidence for is not
    registered; the plan lists them). Progress is never stored: the one
    record is `state.achievements.earned[id] = {tier, at, t}` (synced),
    plus the ledger's monthly ROLLUP (`months`, max per field: the ledger
    keeps 2,000 entries, so every month before this one — and this one,
    when the ledger is about to cut — is folded in, and a lifetime count is
    the sum over months of the larger of the stored and the live figure),
    the showcase (six) and the title. A badge pays no XP, gold or HP and
    logs no session; a title is cosmetic. Pages only read (smoke113 I).
162. EARNED ONLY GOES UP. A tier once earned is never taken back — not by
    deleting its evidence, not by a new unit or shop item raising an "all"
    target (a fully earned badge draws at p = 1). The cloud merge treats
    `achievements.earned.*` and `achievements.months.*` monotonically
    (`MONO_PATH`: numbers by the larger, times by the earlier). Progress is
    relative to the CURRENT tier interval, `(current − previous) / (next −
    previous)`, for the rim ring and the pings alike; an unearned hidden
    badge is p = 0, masked, never pinged, and listed last. ONE RECORDED
    EXCEPTION (the user's decision, 13 November 2026): the repair
    `goal-getter-whole-vault` (`js/core/repair-goals.js`) took back Goal
    getter tiers earned by Collection goals the whole vault met on the day
    they were made (GO-02), once, after a verified checkpoint; the lowered
    tier travels by the three-way merge, since only that side moved it.
163. QUIET, AND ONCE. Owner events re-measure only the badges that read
    that domain (`touch`, 400 ms); the full sweep is the boot's (2.5 s) and
    the 30-minute tick's. An owner name is one of `KOS.achievements.DOMAINS`,
    each with a call site that touches it (AP-19, smoke191). A device's first sweep and the two minutes after
    it are SILENT (earned, no overlay or ping; one toast says how many tiers
    you already had), and `state.ui.achSeen` is per device, so another
    device's pull never pings. The unlock overlay and the ping never show
    while Focus runs, a dialog is open or the Exam Room is on screen (the
    overlay waits for a calm moment). Each tier earned is ONE notification
    (kind `achievement`, id `ach:<badge>:<tier>`); pings are never in the
    ledger and come at most once per badge per 10 seconds, every step for a
    target of 20 or fewer, else each quarter of the tier's interval
    (`state.ui.achPings`).
