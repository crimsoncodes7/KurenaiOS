# Productivity: notifications, routines, integrations, the closed app, Reports and the weekly plan

Release contracts, moved out of `CLAUDE.md` on 17 November 2026 (W8)
word for word; `CLAUDE.md` keeps a one-line index. The historical
numbering is kept: tests, source comments and audit notes cite it.
Read this file before editing or testing anything in its domain.
### The notification centre (95–98)

95. `state.notify` is ONE ledger of things that happened TO THE USER
    (`items`, natural string ids `kind:record:occurrence`, capped at 200
    and 45 days) plus `read` and `airing` keyed maps. Kinds are calendar,
    reminder, assignment, airing, wishlist, pacing (the plan's carry-over
    notice), focus (the idle watch, invariant 4d), assistant (a
    scheduled message's reply, invariant 71b), reports (a saved week,
    "Your week in review is ready", id `reports:<report id>`), goal
    (invariant 5b, id `goal:<goal>:<event>`), exam (a start-by that is
    today, an overdue milestone, a topic test or quiz tomorrow, exam season
    turning on; id `exam:<assessment>:<event>`, `KOS.exams.notices`) and money (a trial ending
    tomorrow, a bill two days ahead, income a day late, id
    `money:<rule>:<date>`) only; Goals and Money are filters of their own: sync cycles, cloud
    state and repairs are housekeeping, never notifications. Nothing in it re-derives a due date:
    the calendar, reminder and assignment tickers keep their own alert
    rules and once-only `notified`/`alerted` maps (invariant 42) and hand
    each FIRED alert to `KOS.notify.push()`, whose id is the ticker's own
    key, so the feed can never disagree with the toast or repeat it.
96. The two things nobody else watched are watched here: an episode airing
    (`KOS.notify.recordAiring` remembers every WATCHED title's next episode
    from the airing cache; `tick()` announces it once it has aired, even
    after the cache moved on) and a Planner item reaching its release day.
    Airing data is still never written to the vault (invariant 23).
97. The bell in the global header (`#notify-mount`, a `KOS.ui.menu`
    popover) shows the five most recent items; the whole feed is the
    `notifications` view under Archive. Read state syncs with the state
    document (cloudmerge knows `notify.items` as a natural-key array).
98. Device alerts are a per-device opt-in: `state.ui.notifyDevice` AND a
    granted Notification permission, requested from a user gesture on the
    page. They fire only for an item that is new AND fresh on this device
    while the page is not in front, through the service-worker
    registration when one controls the page (an installed phone app) and
    the constructor otherwise; `sw.js` `notificationclick` focuses a client
    and posts `kos-open`, which `pwa.js` routes through `KOS.show()`. A
    CLOSED app is reached only through closed-app delivery (invariant 131):
    a per-device Web Push subscription (`KOS.push.subscribe`, from a
    gesture, needing cloud sign-in and `KOS_ENV.VAPID_PUBLIC_KEY`), with
    the account's switch `state.notifyCloud.on` (synced).
    Filters (`state.ui.notifyMuted`, per device, frame 14b) hide a kind
    from the feed, the bell, the unread count and device alerts while the
    ledger keeps it; quiet hours (`state.ui.notifyQuiet`, a window that may
    run past midnight) hold device alerts only.

### Routines and the Daily Review (142–149)

142. ONE ROUTINE RECORD. A habit is a one-step routine — or, SEVERAL
    TIMES A DAY (`times`, 2–6 HH:MM), a step per time (`t0800`, its `at`),
    each ticked on its own, a reminder at each time not yet ticked, and the
    day kept and paid once every time is ticked; no auto-tracking then. `state.routines`
    (synced, random string ids, `KOS.routines.normalise`) is canonical; its
    log is a keyed map `"<routine>|<routine day>"` that merges per key and
    per step; the first tick of a day freezes the steps into `snap`, so
    editing a routine never rewrites a past day. Habits moved in once at
    boot under deterministic ids (`h:<id>`); `state.todo.habits` is kept,
    frozen, for a rollback, and every older reader goes through
    `KOS.routines.habitsView`. A habit's schedule is days of the week or
    every N days (`every` 2–14 from `from`). Every habit lives in ONE
    fixed routine, Daily habits: a routine card like the others and its
    own editor (`#/routines/edit/habits`: a row per habit, each opening
    its repeats, time and reminder, and auto-tracking in place; it can't
    be renamed or removed). Today only ticks; History only READS (its week
    grid has no tick and no add).
143. ROUTINES PAY ONCE. A day records how it was paid (`log.paidAs`: min,
    done or capped); a minimum day later kept in full is topped up ONCE by the
    difference (a `todo` entry with `metrics.topUp`, outside the daily cap,
    skipped when the ledger already holds a full pay for that day); a routine
    whose every step is optional is refused ("At least one step must be
    required", `KOS.routines.check`); a tick's Undo puts back only what the
    tick wrote and reverses its pay through `KOS.sessions.undo`. A routine's completion (every required step, or
    its minimum) pays `KOS.governor.routineAward` once per routine day,
    logged as a `todo` session carrying `metrics.routine`; steps, rest
    days, on-demand routines (About to Study) and unticking pay nothing; at
    most 8 rewarded completions a calendar day. A completion is activity
    for the day, never study. An AUTO-TRACKED habit (`auto` {src, subject,
    n}) ticks itself through `KOS.routines.autoSync` — after each session
    the ledger logs and on the review ticker — once the day's own record
    meets n: Focus minutes by stretch (`KOS.sessions.parts`), or the Goals
    engine's own measure for cards, plan rows, Code tasks and retrievals,
    or a Japanese review session. It only ever ticks, pays once like any
    tick, and a tick by hand still works.
144. REVIEWS READ, OWNERS WRITE. A review stores only its own state
    (`state.dayReview.days`); everything else it changes, it changes
    through that record's owner at the moment you act, with Undo. It keeps
    refs, never copies. Zero Governor traffic; no review has a streak.
145. ONE REVIEW ON SCREEN. `KOS.dayReview.due(now)` is pure and offers at
    most one review; missed earlier slots fold into it and a passed slot
    is never offered. It opens by itself only once a review has been
    opened at least once, only on the first open inside its slot, and
    never over Focus, a dialog, the Exam Room or a deep link — otherwise
    it waits as the header chip. Skip, Later and Esc never penalise. A review FINISHED
    or skipped stays on the chip (`KOS.dayReview.recent`, pure) until the
    next review starts or 8 hours pass, and opened again it is the whole
    review — steps tick, the three can be picked — with only Skip gone.
146. TEMPLATE FIRST. A review's template words render at once; Kurenai's
    (the default) replace them when they arrive, from one request with
    `KOS.dayReview.payload` (titles, times and counts; never a note, card
    text, an amount, mood, energy or chat), printed exactly by "What is
    sent". Any failure keeps the template, and the next try waits: 20
    minutes for the ticker (2 when the review is opened by hand), and a
    spent quota (`rate`) stops automatic tries until the next UTC day
    (asked again every 30 s, a failure spent a whole day's quota on 26
    October 2026). Kurenai never picks, triages or
    ticks. With closed-app delivery on, the coming reviews (today's and
    tomorrow's with no words yet, `KOS.dayReview.ahead`: the exact two
    messages the device would send) ride the outlook with the generation
    route; the `runner` writes each within ten minutes of its slot while no
    device is open, claimed once in `kos_runs` as `review:<slot>` on its
    day, read by the device's own rule (`parseWords`), and its push carries
    her line; `KOS.push.pull` keeps them on the day
    (`applyServerWords`) unless the device wrote its own.
147. WHERE IT SHOWS IS DERIVED. A record's surfaces (Calendar, Countdowns,
    Today, the reviews, Home) follow from its own fields; no form asks
    where something appears. An assignment counts down by
    `KOS.assignments.isMajor` (coursework, NEA or project, High, 3 h or
    more, due within 3 days); Pin and Unpin on the record are the one
    manual choice (`countdown: "pin"|"hide"`). Pacing's unticked rows show
    in Reminders' Today as "From your plan", derived, never copied.
148. THE ROUTINE DAY. Routines and reviews use the routine day
    (`dayStart`, default 04:00). Last night's evening routine stays open
    until the Morning Review closes or noon: a late tick, or a step checked
    in the morning, counts for that night and pays once into the day it
    was ticked. The session ledger, streaks and the Governor keep the
    calendar day (invariant 4).
149. TODAY IS A READ. `KOS.today.build` is pure: it calls the owners'
    reads, writes nothing, and is the one source for the reviews, Home's
    three and the Assistant's day; its `next` is Home's Focus ladder
    (invariant 53a), never re-derived. `KOS.today.spaces(day)` (design
    turn 40) is the study spaces' dailies read from each space's own
    `planDay`/`due` — started spaces only, each with its mark (碼 語 心 創),
    whether today's is done, what opens it and its review queue — and a
    Today's three pick may be one (kind `space`, id the subject): resolved
    from the space, never ticked, opened where it is done; About to Study
    leaves it out (it runs its own session).

### Google Calendar, Google Tasks and Todoist (157–160; docs/integrations-plan.md)

157. SIGN-IN LIKE THE GITHUB APP. Google (Calendar and Tasks, one
    sign-in) and Todoist connect through the `ext-token` Edge Function:
    the refresh token is kept in `kos_ext` (RLS on, no policy), and a
    device asks for a one-hour access token and holds it in MEMORY only
    (`KOS.ext.token`) — never the media kv, the state document, a backup
    or a log. A connect needs cloud sign-in and an http(s) address; the
    code comes back only to the app's own URL or a local dev host, with a
    one-time state `ext-<provider>-<nonce>` (sessionStorage) that GitHub's
    return handler leaves alone. One device syncs a provider at a time: a
    cycle takes the lease (`kos_ext_lease`, the database's clock, two
    minutes) or waits. One TAB at a time too (Web Lock `kos-ext-<provider>`,
    the lease held as that page load's own holder), renewed between chunks
    and lists (a renewal refused stops the cycle and releases nothing) and
    given back at pagehide, so a reload is not locked out. The switches and links (`state.ext`) sync; sync
    tokens, mirrors, the read-only copy and the last status are per
    device in the media kv (`ext.<p>.*.<uid>`). THE LINKS TRAVEL WITH THE
    LEASE (RC6, DI-01): a link lives in the state document and a provider's
    cursor is per device, so the holder runs one whole cloud-sync cycle
    after it takes the lease and before it reads the provider, and another
    before it gives the lease up (`cloudCycle` in `runProvider`, through
    `KOS.cloudsync.cycleNow`: an AUTOMATIC cycle that keeps every wait a
    manual "Sync now" may jump, the first link's backup backoff above all;
    never longer than 20 seconds, and the provider's cycle goes ahead when
    the cloud cannot be reached). A DIFFERENT ACCOUNT (DI-08): `disconnect` remembers the
    account the links were made with (`state.ext.<p>.was`); connecting
    another one clears every link of that provider on records and lists,
    its delete queue and this device's cursors (`KOS.ext.forget`, each
    adapter's `forget`), deletes nothing anywhere and says so; the same
    account picks up where it left.
158. LINKED, NEVER ECHOED. A synced Calendar event or reminder carries
    `uid` (32 hex: random at birth, derived from its id and `created` for
    one made before, so every device agrees) and `ext` — the link and
    `base`, the mapped fields both sides last agreed on. A field changed on
    one side takes that side; on both, this app's (`KOS.ext.merge3`; no
    clock is compared). Every write a PULL makes runs inside
    `KOS.ext.inbound`, which sets the base to what it wrote, and the
    owners' change note (`KOS.ext.noteLocal`, called by `addEvent`,
    `updateEvent`, `deleteEvent` and every Reminders write) is silent
    there — so a pulled change is never pushed back. A Google event id is
    `KOS.ext.gcalId(uid)` (base32hex: a–v, 0–9, 5–1024), so two devices
    inserting one event make one (a 409 links). A deletion goes through
    an explicit queue (`state.ext.deletes`, a keyed map), written by the
    owner's delete of a LINKED record and never inferred from absence, so
    restoring a backup deletes nothing remotely. "NOT FOUND" IS NOT A
    DELETION (DI-08): an update the provider answers with 404 (Google
    Calendar, Google Tasks) or "item not found" (Todoist) UNLINKS the
    record and keeps it, counted as `unlinked` on Connections; only a pull
    that names the item deleted or cancelled (and Google's 410 on an event)
    deletes it here. An unlinked record in a linked list or calendar is
    sent again as a new one. A queued deletion is known to the pull
    (DI-23): a task edited there while its deletion waits is never imported
    back.
159. TWO CALENDARS. The Calendar's own events sync two-way with the
    PRIMARY Google calendar: one day (all-day or timed), the five repeats
    with an end date or a count, alerts as popup reminders (none =
    Google's default). What it can't hold as one event (another rule,
    several days, past midnight) is READ-ONLY: this device's copy of its
    showings for six months (`KOS.extGcal.roOn`), drawn as derived chips
    (kind `google`), never stored (invariants 43, 44); a showing Google
    cancelled or moved is a date the record skips (`ext.g.skip`, read by
    `occursOn`). Events ended over 30 days ago are neither imported nor
    sent. What the Calendar DERIVES (assessments, assignments due,
    start-by dates, class milestones, bills without amounts, goal
    deadlines; the next 120 days) goes ONE WAY to the app's own
    "KurenaiOS" calendar (scope `calendar.app.created`), read through
    `derivedOn(date, {all: true})` so no device's Show menu changes it,
    each item named by a hash of its key; edits made there are replaced.
160. REMINDERS LINK BY LIST, AND A PULLED TICK PAYS NOTHING. A Reminders
    list (or "no list", `state.ext.noList`) links to ONE Todoist project or
    ONE Google Tasks list (`list.ext`), never both. Todoist carries title,
    notes, date and time, the four repeats (another Todoist rule is kept
    as written, `ext.rs`, and sent back unchanged), priority (0–3 ↔ 1–4),
    labels and sub-tasks; Google Tasks title, notes, the date, done and
    sub-tasks, the rest staying here. Completed remote tasks are not
    imported. A completion pulled in ticks the reminder without
    `KOS.reminders.complete` (which pays) and the cycle logs ONE `todo`
    session with `metrics.external`, which the Governor prices at nothing
    (decision A): activity for the day, never study, never pay; it is
    logged even when the push that followed was stopped. A Todoist push's
    bookkeeping (links, bases, dequeued deletions) is applied as each chunk
    is answered, never held to the last; an add answered with no id is
    marked `ext.pending` and linked by the next pull, never linked to
    `undefined` or imported as a second reminder. RC6 (smoke143):
    ONE REMINDER, ONE TASK (DI-01) — under the lease rule (157) the import
    knows its own: a remote task with no link here is LINKED to a reminder
    of the same title in its list that is not linked yet and not done
    (`unlinkedTwin`), never imported beside it — ONE TO ONE within a cycle
    (a reminder joins at most one task and a task at most one reminder;
    of several the one with the task's date, else the oldest) and LOSING
    NOTHING on either side (`join`: an empty field here takes the task's,
    both notes are kept when they differ, sub-tasks are joined, and what
    only this reminder has goes up). Two reminders found on one task fold
    into the smaller `uid` (`foldTwins`, the same choice on every device)
    with every non-empty field of the other kept, only after a VERIFIED
    checkpoint (`KOS.backup.withCheckpoint`; with none nothing is folded
    and Connections says so); nothing is deleted there. A FULL READ ONLY ADDS (DI-05): Todoist's whole read (`*`)
    holds what is still open, so when the linked projects change the cycle
    reads the changes first with its own token (which does name deletions
    and completions) and the whole second; the mirror is never emptied, a
    done sub-task the read left out is taken to be there still
    (`assumeDone`), and a sub-task with a remote id is never sent again as
    an add unless that read said it was deleted. A REPEAT TODOIST OWNS IS
    CLOSED THERE (DI-06): ticking a linked reminder that repeats (one of
    the four rules, or `ext.rs`) rolls it here, counts a close
    (`ext.close`; `ext.cn` names each command once; `ext.closeDue` is the
    date it was rolled to) and the push sends `item_close`, never a due
    string; Todoist's next date is read back in the same cycle
    (`KOS.ext.soon` asks for one at once) and REPLACES the date rolled
    here, which is only a stand-in until then and is never advanced
    again; a close made in Todoist brings its date down the same way,
    with no roll here; Undo before the sync takes the close back. A rule only Todoist can read keeps its date until
    Todoist's arrives. THE LIST IS THREE-WAY (DI-16): `ext.list` is the
    project both sides last agreed on; a task moved there moves the
    reminder to the list that project is linked to, a reminder moved here
    moves the task, both: this app's. A MOVE OUT ONLY UNLINKS (DI-17, the
    user's decision of 16 November 2026): a reminder moved by hand to a
    list with no link, or the other service's, gives up its link and its
    task is LEFT WHERE IT IS, never deleted (`KOS.extTasks.onMove`, called
    by `KOS.reminders.update`). That task is remembered
    (`state.ext.ignored["<p>:task:<id>"] = {uid, list}`, synced) and not
    imported while its reminder lives elsewhere, so it never returns as a
    second reminder; moved back into the list the task is in, the two are
    joined again (never a second task); once the reminder is deleted the
    task is the list's own again. Unlinking a list, linking it to the
    other service or deleting it only UNLINKS its reminders
    (`unlinkList`), kept on both sides. What is left of a given-up
    link is `ext = {gen}`, so a later add is a new command and never the
    first add again. A REFUSED COMMAND IS NAMED (DI-12): a command Todoist
    answers with an error is counted and worded on Connections ("1 change
    refused (…)"), remembered against what was sent (`ext.refused`) and not
    sent again until the reminder changes; a refused deletion is asked
    again a day later. The SHAPE of Todoist's answers is not relied on:
    any answer that is not `"ok"` is a refusal worded from whatever text
    it carries ("Todoist refused it" when none), an answer with no
    answers in it books nothing, and nothing in the push can throw; a
    whole read that did hold finished sub-tasks gives the same result as
    one that does not.

### What reaches a closed app (131)

131. THE DEVICE COMPUTES, THE SERVER DELIVERS (roadmap 5.7,
    `docs/server-runner-plan.md`). `KOS.outlook.build` is a pure read: the
    next seven days of notices under the ledger's own ids — the calendar,
    reminder and assignment tickers' `forecast(from, to)` (each ticker and
    its forecast share one `notice()`), and `KOS.exams`/`KOS.money`/
    `KOS.goals` `notices(day)` at the morning time (`ui.notifyMorning`,
    08:00; reached/missed goals are never forecast) — with this device's
    muted kinds, Exam Season's hold and quiet hours applied (a day notice
    waits for the window's end, a short alert inside it is dropped), and
    NO money figure (`notices(day, {hide: true})`); plus the brief, the
    read tools' answers for the week (never notes, card text, amounts or
    chat). `KOS.push` publishes it to `kos_outlook` when its hash changes
    (at most every 5 minutes, at least every 6 hours) with the schedules
    and model route only when the server owns runs, beats presence
    (`seen_at`) every 2 minutes only while a page is IN USE (visible,
    focused and touched in the last 2.5 minutes — a window merely left
    open held every push for days until 25 October 2026), heals this
    device's subscription at start (one the browser dropped clears the
    switch; a live one is saved again), and pulls `kos_runs`. "Send a
    test" publishes one item of kind `test` due now. The `runner` Edge Function (pg_cron every 5 minutes,
    `CRON_SECRET` compared in constant time, `verify_jwt = false`) reads
    only `kos_outlook`, `kos_push_subs`, `kos_push_sent` and `kos_runs`,
    never `kos_state`, media, files or a credential: it holds every push
    but a `test` while a device was seen in the last 5 minutes, drops an item 30
    minutes late, sends each item once (`kos_push_sent`) as an RFC 8291
    payload signed with VAPID (WebCrypto, no library; the private key is a
    function secret), with a Topic of 32 base64url characters (24 bytes of
    the item id's SHA-256 — Apple refuses any other shape with
    BadWebPushTopic, which blocked every Safari push until 25 October
    2026), returns each device's status and reason in its reply, deletes a subscription a push service calls gone,
    and claims each due schedule in `kos_runs` before its one request.
    `sw.js` shows a push under its id as the tag. AIRING AND RELEASE DAYS
    (phase C): the outlook forecasts the next episode the airing cache knew
    (`air:<anilist id>:<ep>`) and a Wishlist release day at 09:00
    (`wish:<item>:<date>`) under the notification centre's own ids
    (invariant 96), and publishes `airing` {ids, titles, quiet} — the
    watched shows' AniList ids, left out when airing is muted or held —
    so the runner asks AniList's PUBLIC airing schedule (no token, one
    request a tick, the ids only) for an episode that aired in the last
    half hour and sends it under the same id (`airingItems`, dropped in
    quiet hours). Zero Governor traffic.

### Reports (99–102)

99. A media row carries its own ACTIVITY JOURNAL (`journal: [[ts, kind,
    from, to], …]`, `mediadb.js`): kinds progress (Anime/Books), volumes,
    status, score, route, chapter and hours (VN/Games journal the source,
    never derived progress, invariant 10). `put()` appends what the save
    changed against the stored row, and a bulkUpsert merge what the pull
    moved; same-day steps of one kind collapse, so a step taken back
    cancels out. Inserts are silent (a first import is not activity), a
    no-op merge appends nothing (invariant 36a), enrichment never moves
    it. A row arriving with events the store has never seen (a cloud pull)
    UNIONS its history rather than appending a second account, and a fold
    (`foldLocal`, `mergeRows`) unions both. Capped at 200 events and 400
    days; it is not an index, so no DB version. WHAT COUNTS AS DOING
    SOMETHING is ONE definition, `KOS.mediadb.activeEvent` (HR-31): a step
    forward from a real number in progress, volumes, chapters, routes or
    hours, a finish, or a start from planned — never a score, a pause, a
    move back to planned, a step back or a step FROM NOTHING (an import, or
    DI-27's echo). Reports' Collection and month strip read it. A row's
    `activityAt` (CL-45) is when you last did something with it: AniList's
    list-entry `updatedAt`, VNDB's `lastmod`, or a local list-state or
    notes edit; never earlier than it was, and VOLATILE (alone it is no
    edit). "Recently updated" sorts by it, falling back to `updatedAt` only
    for a row with none. The DI-27 traces in a collided Books row's journal
    are tidied ONCE PER DEVICE (`di27-journal-scrub`, a device-scoped
    repair whose receipt is in the media kv) at start-up, before cloud sync
    starts, and only once the clean-up itself was approved.
100. A session entry records what the Governor paid it (`award: {xp,
    gold}`, written in `onSession`, zero when forfeited): "earned this
    week" is a sum of awards, never a difference of balances that
    purchases and merges also move. The Assistant keeps a daily TALLY in
    `state.assistant.tally["YYYY-MM-DD"]` (`c` chats, `s` scheduled sends,
    `a` areas by tool category, once per request): counts only, never
    text, 400 days.
101. `KOS.reportStore` writes the state at each period BOUNDARY (a Monday
    or the 1st of a month) the first time the app is open on or after it,
    and never refreshes it: topic band/status/mastery, the Governor,
    streaks and the Collection's status counts, with `takenAt` so a late
    snapshot says so. A boundary never opened has none. The store is its
    own IndexedDB, `kurenai-os-reports`, derived data only, carried by the
    full backup (`reports`: the saved reports and the snapshots, AA-13); the snapshot
    taken the day it shipped (12 October 2026) is the baseline.
102. A report is DERIVED once and SAVED: `KOS.report.compute(input, period)`
    is pure, reads only what `gather()` hands it from the single sources
    (invariant 26d), and applies the README's rules at build — a
    supporting zero is absent (77), recall needs 50 reviews, a day chart
    three active days, a persona five Focus blocks, a story without
    evidence is dropped and a week keeps four, earnings are the recorded
    awards or nothing (100), a status move needs both boundary snapshots.
    A week is saved on the first open after the following Monday 07:00
    (`ensureReports`), then never recomputed; only `words` change
    (`setWords`). ONE recorded exception: the DI-27 rebuild
    (`js/core/repair-reports.js`, a consent repair run once): items saved
    before the clean-up lose exactly the phantom pay, rest-streak days and
    echo titles the clean-up's checkpoint proves, and nothing else; a
    rebuilt item carries `fix.di27` and a higher `factsRev` (a snapshot
    `rev`), which wins the cross-device merge, so every device must run a
    version that knows `factsRev` before it runs. Weeks since 1 September are backfilled; one from before
    the first snapshot is `rebuilt` (no status moves, no invented ranges)
    and an empty one is not saved. Words: `KOS.reportWords.template` is
    deterministic; comparisons go through `compare()` ("same as", "new
    this week", never a bare 0 or "+∞%"). Zero Governor traffic.
102a. Reports lives under Home with no rail item (`#/reports`, the
    Reports page 24a; `#/reports/week/<start>`, one week 25a;
    `#/reports/week/<start>/<study|focus|collection>`, its full overview
    25b–25d). Every card's "Full overview ›" opens a page inside Reports,
    never an app page. The pages only READ saved facts: a render writes
    nothing (smoke56, smoke70) and selecting a past report swaps the view
    without recomputing; the Collection filter, layout and sort are per
    visit, never stored. A report's own clicks may write (Next up's "Add to
    plan" adds a plan row). The words in full (headline, narrative, the
    Template | ✦ Kurenai switch, Share/Export) are read on the Reports
    page; a report's own page keeps only the headline, in its story hero
    beside ▶ Play and the words pill (25a). No page leaves dead space: a
    grid row's last card widens to close it (`pack`), uneven cards deal
    into measured masonry columns, and of two side-by-side columns the
    shorter rides along (sticky). It is reached from the bell (kind `reports`,
    invariant 95), the Home card, Home's Study hours card and search.
102b. The words are the template's unless the user picks ✦ Kurenai for
    that report: ONE `KOS.ai.chat("generation")` request carrying
    `KOS.reportWords.payload(rep)` — totals only, never notes, card text,
    topic or title names, or chat history — and "What is sent" prints
    exactly that payload. Generating is transient (skeleton lines,
    Cancel; a reply after Cancel is ignored); a failure falls back to the
    template in place with a calm note and the switch on Template, so a
    headline is never empty; written words are saved through `setWords`
    (facts untouched) and kept when switching back to Template.
102c. The story (`KOS.reportStory`) draws the saved `facts.stories` list
    as a dialog: 7.2 s a story, scaled by a per-device speed
    (`state.ui.reportSpeed`); ← → / taps / swipes move and resume, Space
    pauses, a quiz waits for a guess that is never stored, reduced motion
    shows each story finished. The share card and export
    (`KOS.reportShare`) are made on the device from the saved report; the
    Collection's titles are OFF by default in every format. The Home card
    sits in Home's middle row (Study hours · the report · the week's plan,
    under Up next · Today · Upcoming) and shows the newest report as the
    full card: "New" until its notification is read (by a click, "Read
    the report" or the bell, never by a render), and never shrunk to a
    row after reading; other reports new that morning list under it. With
    none saved the slot is hidden and the plan takes its column.
102d. Months, terms and years are saved like weeks, on their first
    morning (a month on the 1st, a term the morning after its last week, a
    year on 1 September) and built by the same pure `compute`. A TERM is a
    run of SCHOOL weeks (`schoolWk`) split by two or more weeks without one
    — the personal plan studying through Christmas does not join two
    terms. The longer periods add mastery by unit (from the two boundary
    snapshots; units that did not move are left out), results dated in the
    period with the IT units still to sit, the plan against class from the
    braid, weakest/strongest from 20+ reviews, the strip of their saved
    weeks or months, records and milestones (a year). When the session
    ledger (2,000 entries) no longer reaches a term's or year's start, the
    headline totals ROLL UP from the saved weeks/months and the report says
    so (`rolledUp`). One study day in a month is marked, not charted (24g).
102e. Saved reports and snapshots replicate to the owner-only table
    `kos_reports` (`KOS.reportStore.syncCloud`, after each saving tick and
    a words change): local first (invariant 31 — signed out or in a review
    namespace nothing is sent), pull-merge-push with a per-item stamp in
    the media kv (`reports.sync.<uid>`) so nothing is echoed. A report on
    two devices converges on the FACTS of the copy saved first and the
    WORDS changed last (`words.changedAt`); a snapshot keeps the one taken
    first. The facts are derived data only — no credential ever rides it.

### The integrated weekly plan (80–83)

80. `js/data/pacing.js` is a SEED, not a feed. It was imported once from the four
    Notion databases (school scheme of work, both personal curriculums, IT F201)
    plus the week hub that carries the alignment; `KOS.pacing.ensureSeeded()`
    copies it into `state.pacing` once and is a no-op afterwards, so a user edit
    or a cloud pull is never overwritten by the file that shipped. Nothing in
    this domain performs a network request, and Notion is never read again.
81. `KOS.pacing.normalise()` is the schema gate. A plan row's `refs` are
    generated specification leaves (checked against `KOS.spec`) and are
    dropped if the leaf does not exist; a picker expands a unit or parent pick
    to its leaves before it reaches the row.
    An EMPTY `refs` array is a deliberate statement that the published
    specification does not name that topic — never back-fill a near-enough leaf,
    because the plan would then open the wrong topic page.
82. Pacing stores no progress, mastery or confidence. Coverage is READ from
    `state.progress` through the linked leaves, so the plan row and the topic
    page cannot disagree; the per-row state it owns is a note and the tick
    (`done`/`doneAt`, `KOS.pacing.setDone`) — "I did the week's item" on a
    personal row. A class row's lessons (`lessonsOf`, split from its
    detail) each take their own tick (`sat`, the lesson texts,
    `KOS.pacing.setLessonSat`) and the row is `done` once every lesson is
    sat (Graphite review B) — the plan's own bookkeeping, never a claim
    about mastery. Only a personal row carries over. Pacing is logistics like the Budget
    Planner: zero Governor traffic, zero sessions.
82a. An unticked personal row whose week has ENDED (before today's plan
    week) CARRIES OVER: `carriedInto(wb)` derives it into every later week
    with `weeksLate`, marked behind, until it is ticked or moved
    (`updateEntry({wb})`, the "→ here" action). The record itself never
    changes weeks — carry-over is a read, like recurrence (invariant 43).
    The week we are in carries nothing forward yet; a future week never
    carries anything.
82b. The plan lends itself to the rest of the app by READS only: class
    milestones (Mock, Assessment, NEA Milestone) stand in
    `KOS.calendar.countdowns()` as kind `pacing`, dated by their week, never
    written as events (invariant 44); Home carries the week's tickable card
    (`KOS.pacingHomeCard`, capped at the fold) and "Behind on the plan" in
    the next-action ladder after dated countdowns; the week page lists
    assignments due inside the week; "Remind me" creates one real reminder
    (due the week's Sunday, tagged `pacing`) — a link by text, not a copy;
    the rollover notice `pace:carry:<wb>` is one notification per plan week.
    A class row's lessons are DATED by the class timetable
    (`KOS.pacing.timetable`, read with a default, stored in
    `state.pacing.timetable` only once edited): lesson i on the subject's
    i-th class day, extras on the last, a single lesson on every class day;
    a lesson moved by hand is `lessonDays[text]` (back on its timetabled day
    stores nothing). Home's Today card lists the day's lessons
    (`lessonsOn`); a milestone counts down to its milestone lesson's FIRST
    day and leaves the countdowns once that day has passed.
83. Ahead/aligned/behind/unplanned is set arithmetic over linked refs, measured
    from FIRST contact in the personal plan, and a week whose class rows carry
    no refs makes no claim at all rather than an empty verdict.
84. The plan is fully editable through `KOS.pacing`. A row always belongs to a
    week that exists, and its `wk` number is DERIVED from that week on every
    write (school rows take the school number, personal rows the personal one)
    rather than carried. Moving a week re-points its rows in the same write;
    deleting a week that still holds rows refuses unless the caller passes
    `cascade`. A week begins on a Monday: a date inside a week is snapped
    to its Monday, a beginning inside another week's seven days is refused,
    and a label still reading the default follows the date (PR-28). Deletes ask through `KOS.ui.confirm({danger:true})` and Delete
    never shares a control group with Save.
85. The braid is the alignment evidence as a picture, not a second dataset:
    a commit graph, ONE subject at a time, picked by a page-wide toggle
    (`state.ui.paceBraidSubject`, per device) that the diagram and the
    merges table both follow. The subject's spine is class, my plan a
    dotted row beneath it, and every shared spec point a branch between
    the weeks that cover it, packed into depths so crossings stay
    readable; △ marks what class teaches that my plan never schedules. A
    non-scrolling key column names the rows. (Review B tried a two-line
    arc picture; it could not be read at a real term's density and was
    reverted.) The diagram is one `role="img"`; beneath it every plan row
    that met class is a real button in five columns (reference, title,
    when, verdict, Open), which is the keyboard and screen-reader route. A
    row names ONE reference — the shared leaf, or the majority parent when
    it shares several — and its dialog links every leaf. No shared refs
    draws no diagram. The legend names every mark, so the tab carries no
    explanatory header — the long version is a Help & Guide entry.
