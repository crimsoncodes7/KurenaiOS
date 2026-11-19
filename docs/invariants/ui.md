# UI, layout, routing, accessibility, redraws and loading

Release contracts, moved out of `CLAUDE.md` on 17 November 2026 (W8)
word for word; `CLAUDE.md` keeps a one-line index. The historical
numbering is kept: tests, source comments and audit notes cite it.
Read this file before editing or testing anything in its domain.
### Content, UI and Collection composition (24–30)

24. `js/data/compsci.js`, `maths.js` and `it.js` are generated. Change parsers and
    regenerate. `js/data/code.js` and `code-u*.js` are AUTHORED (Code has no
    published specification) and held by smoke75 and `tools/cs_diff.mjs`
    instead (invariant 104). For the generated ones, use `--format-existing` only for a payload-preserving format pass.
    The IT units not taken (F203, F205) are left out by the generator
    (`IT_NOT_TAKEN` in `tools/gen_data.py`; `--scope-it` applies it to the
    checked-in payload), so no reader filters them. `--tidy-it` repairs the
    checked-in IT spec text (W6, CC-01/CC-02: the assessment pages the
    extraction ran into each unit's last leaf, empty bullets, run-on
    "include:" guidance, and the qualification overview that duplicated
    F206.6.1), to a fixed point, refusing duplicate refs. The Maths spec text
    is the hand-typeset table `tools/maths_spec.py` (W6, CM-01: the PDF
    extraction lost every exponent and fraction): each leaf's content, info
    and short title, the maths in `$…$` that the Spec tab typesets;
    `--maths-spec` applies it to the checked-in payload and refuses a leaf
    missing from the table or a row naming no leaf (smoke138 F refuses a
    fragment line). Maths refs are P1–P10,
    S1–S5 (Statistics) and M6–M9 (Mechanics): Edexcel numbers Paper 3 as one
    run, so Mechanics keeps its section numbers and takes "M"
    (`MECH_SECTIONS`; `--mech-refs` applies it to the checked-in payload).
    Stored state named by an old S6–S9 ref is renamed at the store's own
    gate (`scrubLegacy` → `renameRefs`, so boot, import and every cloud pull)
    and topic attachments once per boot (`KOS.attach.renameRefs`).
25. Authored content keys target visible leaf refs only. Callout objects need two
    closing braces; validate every edited JS file.
26. Classes are presentation only and carry the `k-` prefix; logic and tests
    read `data-ui` hooks, ARIA/native state and `data-state` (smoke55 refuses a
    legacy name, a `[data-ui]` selector, a colour literal outside tokens/themes
    and a raw px outside `tokens.css`). Keep the four subject hues (invariant 103). Extend
    shared tokens/components rather than hard-coding a page patch.
26a. Graphite (= Atelier Dusk, `css/tokens.css`) is the default;
    `css/themes.css` holds Atelier Dawn (its light twin) as colour-ROLE
    overrides only (the shop's 27 recolour themes were retired on 16
    November 2026 and refunded once by the `theme-refund` repair; designed
    themes come back through roadmap 5.20) (design part 2, frames 21a–21h).
    Every derived token in `tokens.css` is written relative to a role
    (`oklch(from var(--crimson) …)`, chroma scaled), with offsets that
    reproduce Graphite exactly, so a theme re-tints it without restating
    it; only Dawn restates the few tokens bound to a dark ground. A theme
    block applies to `:root` and to any element carrying `data-theme` (a
    shop card's live miniature). The theme on screen is
    `KOS.governor.effectiveTheme()`: a shop "Try on" (transient — it ends
    when the shop is left and is never saved), else "Follow the system"
    (`g.themeFollow`: Dawn while the device is light, the chosen theme —
    Graphite if Dawn is the choice — while it is dark), else the choice
    (`g.theme`). The choice and the follow flag sync; amber, green, red,
    gold and the medium hues are the same in every theme. STATUS IS NOT THE
    ACCENT: overdue, late, Critical and error states read `--alarm`
    (`-soft`/`-ink`/`-wash`, from the fixed `--red`) and the Critical washes
    derive from `--red`; `--crimson` is the theme's accent and a status
    painted in it turned teal or white in a shop theme. Markup marks such a
    chip `data-tone="danger"`.
26b. Theme variants target `:root[data-theme="..."]` as semantic-token
    overrides only; unknown legacy ids map to the default.
26c. `KOS.imageCrop` is the only crop/focal workflow. Persist source and
    `{x,y,zoom}` separately; cancel/reset do not write.
26d. Study statistics and formatting are derived once in `hub.js`; every surface
    reads the same functions and a bar describes the value printed beside it.
26e. A stored topic link is a `"sid:ref"` string, and a record's links are ONE
    field, `refs`, passed through `KOS.spec.normaliseRefs()` by the owner's
    normaliser (assignments, calendar events, Exams & Papers, Focus sessions
    and the session ledger). A unit or parent pick is stored as picked and
    read as its leaves (`KOS.spec.resolve()`); an unknown ref is dropped and
    an ambiguous bare ref is never guessed. Where an older reader needs one
    topic, `subject`/`ref` are DERIVED from `refs` (the first leaf) on every
    write. Pre-1.1 shapes (`topics` pairs, a lone `ref`) are migrated once at
    boot and stay readable through each owner's `refsOf()`. Every form that
    names topics uses `KOS.topicPicker` (Assignments, Exams & Papers, Focus,
    the Calendar event and exam, the Pacing row); it writes nothing and an
    owner whose contract is leaves only expands on save. Above the units sits
    the PAPER level (`KOS.spec.papers`): CS "Paper 1"/"Paper 2", Maths
    "Pure"/"Statistics"/"Mechanics", synthetic nodes whose refs collide with
    nothing; IT's units are their own papers, so the picker offers its units
    there. A paper pick is stored as picked and resolves to its leaves.
26f. `state.itUnits` is the one IT unit record (per-unit `status`
    done/sitting/not-taken, `raw`, `ums`, `series`, `year`, `date`), behind
    `KOS.itUnits.normalise*`, seeded once like the plan. `js/data/it-grades.js`
    is the one table of unit scales and grade boundaries, taken from the
    specification (p. 91): a unit is graded D 48 / M 36 / P 24 UMS and has no
    D*; H019 is 108/96/72/48 and H119 270/240/180/120. A boundary not checked
    against OCR would say `confirmed: false` and be reported provisional.
    Unit grades, the aggregate and "marks needed" are derived only in
    `KOS.hub.it`; a stored UMS (the results slip) wins over the straight-line
    raw conversion, which is flagged an estimate because OCR converts pro rata
    between each series' own boundaries; a
    not-taken unit counts and prints nothing (invariant 77). Study state keyed
    to a unit that left the specification is pruned at boot; the session
    ledger is history and is kept. Zero Governor traffic. ARCHIVED AND
    CURRENT (5.19 item 2, design 44f): a unit done at school is archived
    (its own `archive` flag, else F200, F202, F204 and any unit with a
    result) and leaves the spine, the desk's unit cards, the topic picker
    (unless already picked) and the subject's review analytics, while it
    keeps counting in marks, grades, hours and history; "Show completed
    units" (per device, `state.ui.itShowDone`) brings it back, and the open
    topic's own unit always shows. The CURRENT unit (`state.itUnits.current`,
    else F201, else the first still to sit by date) sits in the IT desk's
    course units row beside its unit cards — its topics, mastery, the next
    unit and Change (`KOS.itDesk.current`); Continue is the side column's,
    as on every desk. The IT desk keeps the shared order (top row,
    analytics and dates, course units) with its grades after them, and has
    no Resources card (16 November 2026); smoke154.
27. Navigate via `KOS.show()`. Assignments, reminders and events each have one
    canonical store; other surfaces derive from them. Use `KOS.workspaceTabs` for
    Review and Sync. (The Planner's Planner/Goals switch is gone: Goals is a
    Productivity page and the Planner is the Collection's Wishlist, 27a/27n.)
28. Vault editors register in `KOS.mediaEditors`; hooks register in
    `KOS.mediaEditorHooks`. Never wrap the dispatcher.
29. VN CG gallery is a counter only; content warnings are manual.
30. Vault hero selection/banner/crop lives in `hero.<module>` kv, not on the entry.
    VN and Games heroes are upload-only; no new network fallback. A NEW
    upload needs the "Vault heroes and Seasonal" unlock (`KOS.art.canUpload`,
    roadmap 5.14); with none the painted Spotlight (`app.spotlight.<vault>`)
    stands where the blurred cover stood, and a title's own banner still wins.

### PWA, responsive foundations and shared primitives (37–50)

37. The service worker never caches APIs or non-GET requests. Same-origin statics
    are stale-while-revalidate; a navigation serves the `index.html` cached with
    that worker's own version (network only when none is cached, and always on
    local dev hosts), so a page never pairs a new shell with the previous
    version's scripts; a deploy arrives through the waiting worker. Shell
    precache derives from `index.html`. The one POST the worker answers is
    the Web Share Target (`./share-target`): the shared files are handed to
    the page through the `kos-share-inbox` cache, never a cached request.
38. `skipWaiting()` runs only after the user confirms. Bump `sw.js` `VERSION` for
    every asset deployment; the app works without a service worker.
39. Persistent storage is requested sparingly and never promised (once, by
    itself, when the files pass 200 MB; Archive › Storage can ask again).
    Background Sync is an enhancement, not the correctness path.
40. Phone composition begins at 700px: bottom tabs, canonical tree drawer, bottom
    sheets, 16px inputs and safe-area support (the 16px field rule lives in
    the LAST cascade layer, `floors` (`css/floors.css`, declared last in
    `css/tokens.css`), so no component or view class can bring back iOS's
    zoom on focus (AX-01); only true floors belong in that layer). Generate icons with
    `tools/gen_icons.mjs` (the header's bloom on
    the Graphite ground; never hand-edit the PNGs).
41. `KOS.calendar.normalise()` is the event schema gate; `state.calendar.v` is not
    placed in store defaults. `time` remains the start-time field.
42. Event alerts are per-record. New exam/deadline defaults are applied only in
    `addEvent()`, never by normalisation.
43. Recurrence is computed from one record, never materialised into copies.
    A monthly or yearly repeat keeps the day of the month it was set on
    (a reminder's `recurDay`; an event's own date): 31 Jan → 28 Feb → 31 Mar,
    never stuck on the 28th after a short month (PR-26).
44. Countdowns merge canonical calendar deadlines and assignment reads; assignment
    and reminder chips are derived and never written as events, and so are
    the Exams hub's start-by chips (kind `startby`, hidden per device like
    the other derived chips).
45. Add/edit uses one event modal. A study block links by assignment id and copies
    nothing; validate before writing and keep Delete separate from Save.
46. Calendar category colour flows through `--ev-hue` everywhere.
47. Only five width breakpoints exist: 1240, 1080, 860, 700 and 560. Reflow other
    needs intrinsically; feature queries are not extra breakpoints.
48. Within a component, media tiers are written widest-first.
49. `KOS.ui.openDialog()` is the only modal insertion route. It owns name, modal
    semantics, focus trap/restore, scroll lock and Escape. Danger dialogs focus
    Cancel and never confirm on Enter.
50. Repeated UI uses `KOS.ui.tabs`, `emptyState`, `statTile`, `scroller`,
    `pageHeader`, `sectionHeader` and `num`. Horizontal overflow must be declared.
    The compact section `<nav>` is the sole scroller exception: preserve its nav
    landmark inside one external scroller shell. A rendered notes table is
    wrapped by `KOS.content.typeset` (`scrollTables`), a tab stop only while
    it overflows (`scroller({tabWhenScrolls})`).
50a. A page description is the page header's sub-line
    (`data-ui="ui.page-sub"` > `part.board`, 14px on `--muted`), and
    `KOS.ui.pageHeader({sub})` emits exactly that. It is one line, not a
    paragraph: rules a reader needs once belong in Help & Guide, not in prose
    the page re-teaches on every open.
50b. A page's in-page workspace switcher rides the page header's action slot
    (`pageHeader({actions})`, or the second child of `.dash-head`), as Planner
    and Sync do. Never restate the SECTION nav in-page — Reminders, Habits and
    Calendar are already the Productivity strip, and offering the same three
    destinations twice 60px apart is the drift the tabs primitive exists to
    stop. Week-scoped actions belong with the week, not in the page header.
50c. Three figures do not need three card-sized boxes. `statTile` is for a
    genuine metric strip; a short set of week/page facts belongs on the owning
    section header's sub-line, still under the invariant 77 zero rule.

### Category 7 Study and Collection (51–63)

51. The specification spine is Study's only section list. It owns expansion,
    current-location marking and the compact overlay drawer.
52. Topic pages are content-first: one header, one static study-nav row (it was
    sticky and covered the text it introduced) and one inspector as the sole
    state surface. Do not duplicate counts/mastery.
53. Home asks “what next?” from canonical recommendations and keeps empty states
    compact; do not restore decorative fold-filling panels.
53a. Home's Focus card has its own ladder (`KOS.homeFocusPlan`), never the
    review queue and never an in-class item: a calendar study block from 30
    minutes before it starts until it ends (goal = its length), an exam
    inside its kind's lead time (`KOS.calendar.EXAM_LEVELS`: real 7 days,
    mock 5, end-of-topic 3, retrieval 1; goal = that kind's revision time,
    counting only time FOR that exam — a session started from its card or
    one on its linked topics, never a bare timer),
    then the Exams hub's two rungs (a deadline whose milestone has gone
    overdue, "Deadline at risk"; then an assessment whose start-by is
    today, "Start today · advisory"),
    an open assignment due within 7 days (goal = what its estimate has
    left), THE STUDY SPACES' DAILIES not done today (design turn 40:
    Code's Daily 20, Japanese's reviews then its next lesson, Mind's Daily
    15, the Daily Creative; only spaces started, `KOS.today.spaces`; the
    card opens the space, which runs its own session, and says "Then" for
    the rest), the next exam within six weeks, then the plan row carried
    over or where you left off, each measured by the time spent ON IT today
    (a session started from the card, or a stretch on its topics; never the
    day's total, and no bar, since a row has no estimate: the user, 19 Nov
    2026), and last a clear board with the 2-hour daily goal. The Review side is one row a queue — the
    flashcards (Due today), then each space's own (Japanese, Code's
    retrieval, Mind's cards, Creatives' theory cards, which then leave the
    Flashcards row) — each opening its review, the tab counting them all.
    Money speaks on Home as one row inside Upcoming (no card of its own,
    HR-04): its notice when it has one, else its next bill, then what is
    left this month; none when Money has no rules or its kind is muted,
    and Hide amounts masks every figure. Below 1080 the hero's day list (Today's three) folds
    under the greeting. An exam's kind is `examLevel`, kept on exams only;
    one saved without it reads its kind from its title.
54. Study and Home use shared derivations and preserve navigation/focus on redraw.
55. Mangaka owns its compact discovery grammar; do not restore the old permanent
    filter wall.
56. All four vaults use the shared `medview` shell/editor/filter/action contracts.
57. Collection Overview summarises the vaults without becoming a second vault or
    duplicating provider controls.
57a. The Shrine's order for tied scores is per score in the SYNCED state
    document, `state.media.shrine.order["<score>"] = [syncId, …]`
    (`KOS.media.shrineOrder`); only the Shrine's module/sort filters are per
    device. It moves titles only inside a run of EQUAL scores, and only under
    the score sort: stored titles first in their order, then any title that
    joined the tier later, at its end. Under a medium filter the order dialog
    shows that medium's titles only; their new order fills THEIR slots in
    the tier's stored order and the others keep theirs, and Reset sends only
    the shown titles back to date order (CL-17). `apply()` is a pure read.
58. Collection filters and action surfaces move canonical nodes on compact screens;
    they do not clone state or logic.
59. Image/hero actions remain with the owning editor or toolbar, not every image.
60. Vault hero finish is shared across modules; VN/Games remain network-free.
61. Placeholder hue is deterministic from title, with no canvas/network work.
62. Taxonomy display groups the fields where they are read; it does not invent a
    second schema field.
63. `KOS.media.progressText/progressPct/progressFill` own media progress
    formatting and the bar: a known total is the fraction, a series still
    releasing (`current > 0`, no total) is a half-full `open` bar whose title
    says so, a Books row read by the volume (no chapters, `volumes > 0`)
    counts volumes against the series' volume count the same way, nothing
    started is no bar. `progressBar()` is the ONE card bar — every vault
    card appends it, none draws its own. Charts use labelled axes/marks, an
    11px label floor and honest low-data states.

### Accessibility, routing and search (64–71)

64. The browser owns history. `router.js` wraps `KOS.show()` and uses hash routes
    for `file://`/static-host compatibility. Back/Forward, browser chrome and OS
    gestures are one stack.
65. A redraw is not navigation: `_nav`/`KOS.rerender()` changes no URL, history,
    focus or announcement. Invalid routes replace with Home.
66. `KOS.a11y.announce()` is the sole live-region route. `#toast` is visible but
    `aria-hidden`; reserve assertive output for required action.
67. A card with interactive descendants is not an ARIA button. Prefer native
    buttons; otherwise use `KOS.a11y.activate()` for Enter and Space.
68. Placeholder/state text is not an accessible name. `el()` omits null/undefined
    attributes rather than stringifying them.
69. Increase actual visual hit areas (32px, 44px for coarse pointer) without
    overlapping invisible pseudo-targets. Dense calendar chips use the documented
    24px-with-spacing exception. The touch minimum raises HEIGHT for every
    button, so a round control must raise its width too (a circle, never a
    28×44 oval) and a `.k-btn` never narrows below 44px; a tiny inline mark
    (a chip's ✕, a tick) takes the dense size instead of stretching.
70. Use shared `--z-*` tokens and account for ancestor stacking contexts.
71. `KOS.search.run()` is a pure cross-domain disclosure layer. It searches user
    study/organisation/Collection data but never credentials, provider kv/logs,
    sessions or Assistant audits; async results revalidate the active query.
71a. The Assistant has tools for every domain (`js/core/aitools.js`), and the
    same privacy line: no tool reads credentials, cloud sessions or audit
    logs. A change to a topic's material (`study_edit_*`, `study_set_spec_break`,
    `study_quick_note`) is consequential: it waits for the approval card, which
    binds to the topic's fork (an edit made elsewhere first invalidates it).
    The system prompt carries the feature map. A tool-free answer to a
    question that asked for no change ends where the answer ends: a closing
    "I have not made any modifications…" line is stripped
    (`stripNoChangeTail`); when a change WAS asked for, that truth stays.
    One online request carries at most `LIMITS.cloudTools` tools, which IS
    `ai-chat`'s `MAX_TOOLS` (smoke27); past it the tools are ranked by
    category and view and cut, never sent whole. A retired model id
    (`RETIRED_MODELS` in `ai.js`) moves to its successor on read. A
    provider that answers "overloaded" (HTTP 503) ran nothing and is retried
    once, never after a tool ran.
71b. A scheduled message (`state.assistant.schedules`, synced; cloudmerge
    keys it on its random string `id`) is sent at its time while the app is
    open, or on the first open later THAT day — a day never opened is
    skipped (invariant 98: no push server). Its run is `readOnly` (only
    `read` tools are offered, any other call is refused, so navigation
    never moves the screen) and `isolated` (the live conversation's
    in-memory history is neither read nor written). One run at a time,
    never while the user's own request runs; the day is CLAIMED (synced)
    after a pull and before the model is called. The reply is kept on the
    schedule (`last`), in its own conversation when signed in, and pushed
    as an `assistant` notification. "Run now" does not claim the day.
    With `state.notifyCloud.serverRuns` on, the SERVER owns every run
    (invariant 131): a device never runs a schedule itself, the runner
    answers from the published brief with no tools (one metered request,
    `runner/model.ts`; an Ollama route cannot run there and says so), and
    the device takes the reply in through `KOS.push.pull` →
    `KOS.ai.schedule.applyServerRun` (`lastRun`, `last.server`, and the
    ledger's own `asst:<id>:<day>`, once).

### The redraw policy, the view lifecycle and sessions in progress (164–167)

164. A CHANGE SAYS WHAT MOVED, A VIEW SAYS WHAT IT READS (W2,
    `js/core/redraw.js`). A background change — a cloud pull, another tab's
    write, a habit ticking itself, a picture loading, the Daily Review
    closing — reaches the page only through `KOS.rerender({background,
    changed, source})` (or `KOS.changes.note`), naming the top-level keys
    of the state document that moved (`KOS.changes.snapshot()`/`diff()`;
    this device's `ui` is never one) and the stores outside it (`db:media`,
    `db:files`, `db:money`, `db:ink`, `db:mind`, `db:reports`,
    `db:reviews`, `art`, `ext:gcal`). Each view's reads are declared in
    one table there; a view not listed reads everything, and smoke139 N
    holds every list to what the view reads while it draws
    (`tools/lib/view-surfaces.js`). A change that touches nothing the page
    on screen reads redraws nothing and shows nothing. No keys = unknown =
    everything. A new state key a view draws from goes in that table.
165. NEVER UNDER THE READER (decision B4). A change the page reads is
    applied at a safe point. On a TASK page (work lives in the page: a
    topic, a review, a lesson, a study space, the Exams hub, a vault, the
    Assistant, a lab, Files) and while a page says it holds unsaved work
    (`KOS.view.hold`) it is HELD (design turn 36): a chip in the page
    header's action slot — beside a topic's ‹ ›, in the app's header on the
    phone, floating at the foot only where a page has no header — says
    "Updated on another device · Refresh" ("in another window" for another
    tab, "3 updates" when more came) and opens the shared menu: where it
    came from and when, one line an area with counts only (never a
    record's contents), Refresh and Later. In a flashcard or quiz run the
    chip gives way to a line under the progress (`[data-run-line]`) and
    nothing applies until the run ends, when the chip comes back; a card
    rated on another device during the run is shown for a beat and skipped,
    never asked or counted twice. It is applied by itself only at a SAFE
    MOMENT — a note page turned, a tab changed, two minutes untouched — and
    never under unsaved work, a field in use, a dialog, a pen or a run
    (`KOS.changes.safePoint`); leaving draws the next page from the fresh
    state. Applied, only the short values on the page that changed take a
    one-second ring (`data-state="changed"`). What
    THIS device did behind such a page is not news: no pill. Elsewhere it
    is applied at once, unless the reader is typing, a dialog is open, a
    pointer is down or (a pull, another tab) the page was touched in the
    last four seconds — then when that ends. EVERY redraw keeps the page
    scroll, each inner scroller and keyboard focus with its caret; a
    background redraw (and Refresh) also keeps text typed into a field and
    not yet submitted, put back only where the page still draws the field
    as it was before the typing. A redraw the page asked for itself never
    puts text back. A redraw is still not navigation (invariant 65), and
    never happens under a pen (132).
166. A RENDER HAS A LIFE. `KOS.show` ends the render on screen first
    (`KOS.view._enter`): its `onDispose` callbacks run, its `signal()`
    aborts and its `token()` turns false, so async work started for a page
    acts on nothing once that page is gone (a Wall left before its badges
    were measured opens no dialog over the next page). A page's own state
    lives in `KOS.view.memo` (this visit: it survives every redraw and is
    dropped when another page opens — Edit your seat's draft and tab, a
    vault's scroll depth) or `KOS.view.keep` (while the app stays loaded —
    a topic's notes page), never in a render's closure. A REAL navigation
    (another page, not the same page shown again) closes every dialog open
    over the page it leaves, through the dialog's own close path
    (`KOS.ui.closeDialogs`; a dialog opened `{persist: true}` stays), and
    first asks when the page says leaving would lose unsaved work
    (`KOS.view.guard`: "Leave without saving?", Stay focused; `KOS.show`
    returns false and the address does not move; Back is undone the same
    way). The page already on screen, shown again, is not a second history
    entry; a view this build does not have is Home; `#main` (the skip
    link) is an in-page anchor, never a route; Back is Alt+← and ⌘[ (no
    bare Backspace), never while a dialog is open; Enter on a focused
    Cancel cancels. The Daily Review never opens by itself over a task
    page or before this page load holds the account's copy; one finished
    on another device closes here, and a finished review is never
    downgraded to skipped. A listener on what outlives the page (window,
    document) is added through `KOS.view.listen(node, target, type, fn)`
    and goes when its render ends and `node` has left the page — never the
    next time the event happens to fire (AP-08). A redraw for later (a
    timer, a sync that resolves) is `KOS.view.redrawIfStill()`, which
    redraws only the page that asked (SY-25). A deep link that opens a
    dialog (a Practice Log piece, a Wall set) opens it once, on arrival,
    never on a redraw, and closing it takes the id out of the address
    through `KOS.router.replaceArg`, which draws nothing (CR-01, AX-24).
    The Wall's tabs and sets, one assignment, one reminder, a review run
    and Card stats have addresses (SH-37). The unlock overlay waits out a
    task page (`KOS.achievements.quiet(true)`); the ping does not (SY-23).

167. A SESSION IN PROGRESS IS IN THE LEDGER AND CAN BE PICKED UP (W2, §A6,
    decision B3). A flashcard batch, a Due-today review, a Japanese review
    or learn session and a kana set are ONE ledger entry from their FIRST
    answer, found again by `metrics.sid`: `KOS.sessions.upsert(sid, entry)`
    makes it or brings its metrics up to date, and the Governor pays only
    the DIFFERENCE between what it is worth now (`KOS.governor.sessionPrice`,
    the one definition `onSession` reads too) and its `receipt` — never
    negative, so a figure that fell takes nothing back, and a retry, a
    restore or the same figures again pay nothing. While it is in progress
    (`metrics.done: false`) a flashcard pays as it leaves the queue (1 XP,
    2 in a Due-today review) and says nothing; the flat part (15 XP, 3
    gold, 4 HP; a review 20, 5, 6 and the backlog bonus, kept on the entry
    as `cleared`) comes once, when the batch is finished, and is named
    then. An entry with no `done` is a finished one: history is never
    re-priced. A Japanese session's pay is still `KOS.ja.award` under the
    day's cap, counted against the day's OTHER sessions
    (`KOS.ja.syncSession`). `ts` and `date` stay the session's start, and
    time spent rating is `metrics.secs`, never `dur` (other readers sum
    `dur` as study time). WHERE IT STANDS is per device,
    `state.ui.runs[key]` (`KOS.sessions.run`: get is a pure read, a record
    lasts its day, typed exam answers three): a batch's remaining queue
    (`fc:<sid>:<ref>`, `due:<run>`), a quiz's order, shuffles, picks and
    place (`quiz:…`; a finished attempt shows its score again and is never
    logged or counted twice; Retry and Shuffle start over), the exam tab's
    question, filter and typed answers (`exam:…`), a Japanese session's
    answers (`ja:reviews`, `ja:learn-<lesson>`; what is still to ask is
    what is still due, and a question already answered in the session is
    asked as practice only) and a kana set's (`ja:kana`). Coming back the
    same day — a redraw, another page, a reload — picks it up and says so
    ("Picked up where you left off", with Start fresh); a redraw of the
    page says nothing. Restart and Start fresh begin a new session and
    leave the old entry as logged. A redo item still pays nothing and
    alone makes no session (invariant 129).

### Loading on first use (168)

168. BOOT LOADS THE APP, NOT THE CURRICULUM (W2, AP-01; `js/core/lazy.js`,
    smoke142). The scripts inside a `<template data-lazy="NAME">` block of
    `index.html` are a BUNDLE (`exam-index`, `exams-deep`, `content-compsci`,
    `content-maths`, `content-it`, `content-code`, `code-projects`): inert at
    boot and injected, in order, the first time something needs them. The
    tags ARE the manifest: the service worker's precache and every test
    loader read the same tags, so nothing else lists the files, and a file
    is in one bundle or at boot, never both. PAGE MODULES ride bundles too
    (W8, AP-01 stage 2): `exams-pages`, and `page-money`, `page-governor`,
    `page-code`, `page-mind`, `page-ja`, `page-help`, `page-shrine`,
    `page-reports` and `page-sync`, each named for its view in `lazy.js`'s
    `PAGES` (a study space's desk and Mind's topic pages by subject). A
    module goes into one only if nothing at boot runs or reads it: no
    listener, ticker or registration at load, and its exports called only
    by its own pages, by pages that wait for it, or behind a fallback.
    Until it is in, `KOS.views.<view>` is a stand-in that waits the same way
    (so a route to it is valid from the first moment) and `KOS.openShop`
    forwards to the shop once `page-governor` is in. Japanese, Mind and
    Creatives content, the labs and every other module still load at boot.
    Until a bundle
    is in, `js/data/lazy-index.js` (GENERATED; `node tools/gen_lazy_index.mjs`
    after changing a lazy file, smoke142 B fails when it is stale) puts a
    STAND-IN where each of its objects will register, in the order the
    files would have filled the registry (a deck, the due queue and a task
    list break ties by it): the light fields kept whole and a SUMMARY of
    the structure — a topic's pages, each flashcard's schedule key
    (invariant 87), quiz and exam counts, a Code lesson's listing and
    practice ids, a task's tier and concepts. The past-paper index keeps
    its papers, questions and A-level-only leaves at boot, because
    readiness, a scope and a goal are COMPUTED from them; only its topic
    packs wait. Whatever is computed, saved or scheduled reads the
    structure (`KOS.lazy.summary`; `KOS.code` `pageCount`, `listingsOf`,
    `practiceOf`, `hasLesson`; `KOS.edits.shippedFlashcards`), so a figure
    is the same before and after the words arrive. Reading a field a
    stand-in leaves out is a MISS: it returns nothing, the bundle loads and
    the page redraws. A miss is right for a page that only shows words and
    WRONG for anything that computes or writes, so smoke142 holds boot,
    Home, the background passes and every page that names what it needs to
    ZERO misses, and the same account booted eager and lazy to the same
    saved state. A page names its bundles in `NEEDS` (or
    `KOS.lazy.needs.<view>`): `KOS.show` then draws a short "Loading…"
    (`role="status"`), draws the page as its FIRST draw once they are in
    and only if the reader is still on it, and the router names and
    focuses the page then, not before; offline with nothing cached the
    page says it could not be loaded. `KOS.edits.set`, `keepMine` and
    `takeNew` REFUSE while the shipped kind is a stand-in (a fork would
    hold none of the shipped words) and `stale` says no; the Assistant's
    tools wait for every bundle before the first one runs, and the first
    search takes in every subject's content. A few seconds after boot the
    bundles are fetched one at a time in idle moments (`KOS.lazy.warm`, the
    subject last studied first; never when the device asks to save data),
    so later pages open at once and a 30-minute tick finds the real
    thing. Boot is timed: the marks `kos-boot-start` and `kos-interactive`
    and the measure `kos-boot`. A new lazy subject or registry means: its
    template block, its rows in the generator, its stand-in in `install`,
    its page's `NEEDS`, and its readers checked by smoke142's sweep.

### Responsive integration and visual release quality (72–79)

72. `mobile-shell.js` moves canonical search, filter and section controls into
    dialogs and restores them. JS-dependent hiding is gated by
    `:root[data-shell="ready"]`, set only after every enhancement mounted, so
    the unenhanced fallback stays usable. Its sheets are the shared
    `k-dialog`, its section strip the shared `k-scroller`, and every node
    carries its own hook.
73. Search behaviour remains in the canonical controller. Mobile presentation may
    call only `dismissSearch({preserveQuery:true})` and `onSearchChosen()`; it never
    races result click/Enter or duplicates routing/ranking.
74. Calendar changes composition, not data, at 700px. Breakpoint redraw waits for
    an open dialog to close and restores equivalent focus or `#main`.
75. `#app` uses `100vh` then `100dvh`; main content reserves one tab-bar height and
    safe area. The phone Focus dock is two rows with measured clearance.
76. A chart needs enough evidence to make a claim. Card Stats requires at least
    three tracked cards and three reviews; otherwise show a useful low-data state.
77. Suppress zero-only supporting facts. Preserve zero when it is the primary,
    decision-relevant value.
78. A spendable balance is formatted context, not a progress bar.
79. Elevation is theme-derived through `--shadow-ink`/`--elev-*` and is for
    floating layers only. Dawn keeps the hierarchy with a warm, soft shadow
    of its own (on a light ground elevation reads from the shadow), never a
    hard-coded black one.
