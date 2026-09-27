/* Kurenai OS — modules/help.js
   The in-app guide: what every tab and feature does, in a paragraph or less.
   Graphite step 8 (frame 14c) is the view at the foot of this file;
   review B gave it one entry per page and figures. */
(function () {
  "use strict";
  var el = KOS.ui.el;

  var SECTIONS = [
    ["Getting around", [
      ["Overview", "The home dashboard: overall completion ring, today's to-do, deadline countdowns, streaks, flagged topics, and the entry point for focus sessions. Click a subject card to open its dashboard."],
      ["Subjects (rail)", "Each subject shows its spec tree on the left. Click any leaf to open the topic page. The % next to each subject is spec points marked Completed — the subject desk calls that figure “secure”, and shows it alongside mastery, which averages the four progress checks over every topic."],
      ["Search (topbar)", "Press / anywhere to search every spec point and flashcard across all three subjects. Arrow keys + Enter to jump."],
      ["Back / Forward", "The ‹ › buttons (or Alt+←/→, Backspace) step through your page history like a browser."]
    ]],
    ["The topic page", [
      ["Specification", "The verbatim board wording, split into content and guidance columns, plus examiner intel (definitions, tips, pitfalls) and your personal note box."],
      ["Notes", "The deep revision content — paginated sections, worked processes, callouts, tables and code. This is the main study surface."],
      ["Flashcards", "Reviews the topic's deck with the 4-point SM-2 scale (Again / Hard / Good / Easy). Again retests the card in the same session AND reschedules it. The Deck view lists every card with its full review history; Edit deck opens the study editor, where any card — curriculum or your own — can be reworded, reordered, removed or added. A reworded curriculum card keeps its schedule."],
      ["Editing a topic", "Every topic tab — Specification, Notes, Flashcards, Quiz and Exam questions — has an Edit control on the tab row. It opens the study editor beside the page (the page itself is the live preview) and edits are saved as you type, permanently, on this device and your account. Notes and the Specification are lists of blocks you can add, reorder, duplicate and remove: paragraphs, Markdown, headings, lists, key terms, tables, code, every callout type (information, definition, tip, watch out, misconception, mnemonic, must-memorise, formula), step-by-step, worked examples, diagram links, SVG figures and page breaks. Text takes the inline markup (`code`, **bold**, *italic*, [links]) and KaTeX maths ($x^2$ inline, $$…$$ display); the Markdown block takes a whole fragment. Editing forks the shipped material for that topic and tab only; Reset to curriculum restores the shipped version exactly. Curriculum files are never written."],
      ["Quiz / Exam questions", "Instant-feedback multiple choice, and exam-style questions with reveal-the-mark-scheme self-marking. Both log to your session history."],
      ["Worked examples / Simulations", "Worked-example generators with your own numbers, and interactive simulations. Sims are part of the enrichment layer — some are gold unlocks."],
      ["Files", "Attach documents (PDFs, images, anything) to this topic. Stored in the browser's IndexedDB; images and PDFs preview inline, and every file has its own notes field."],
      ["Topic status", "One component at the top of every topic page: the status dropdown, the four progress checks and the R/A/G confidence dots, headed by a live mastery figure. Mastery is the four checks averaged (a topic marked Completed reads 100% and says so). The confidence dots are separate — how solid the topic feels — and the app computes its own R/A/G from your data and shows when it disagrees with you."]
    ]],
    ["Study & review", [
      ["Review", "The Study review workspace keeps the global Due Today queue and Card Stats together. Clear the cards that are ready, then switch to the ledger to understand review volume, scheduling health and lapses."],
      ["Due Today", "The global SM-2 queue: every card whose review date has arrived, across all subjects, most-overdue first. Cards join the schedule the first time you rate them. Clearing this daily is the single highest-value habit."],
      ["Card Stats", "The flashcard analytics dashboard: reviews per day, due forecast, ease distribution, rating mix, and a per-topic breakdown sorted by lapses."],
      ["Exams & Papers", "Log every exam, assessment and practice paper: marks, grade, what went well, what didn't, mistakes, and a reviewed checkbox. Topic-linked results feed the RAG flags."],
      ["Recommended next", "The flagged-topics panel on the home and subject dashboards — your manual R/A/G plus the computed one, worst first. That's the app telling you what to study next."],
      ["Resources", "Each subject dashboard has a link table for reference sheets, textbook PDFs and useful sites, optionally tagged to a topic."]
    ]],
    ["Productivity", [
      ["Focus Timer", "Pomodoro (25/5), Custom, Stopwatch (counts up until you press Stop) or Study until (ends at a clock time you pick; pausing never moves it), with an optional subject/topic link. Starting one enters a minimal focus mode; “Study while focused” brings back the sidebar so you can work through pages while the clock runs. Everything you complete during the session is attributed to it. Pomodoro pays for completed cycles, and ending one before the first cycle forfeits the award. Custom, Stopwatch and Study until pay for every full 10 minutes (12 XP and 1 gold each, and HP up to 6), and ending early keeps what you have earned; under 10 minutes earns nothing. First pause is free; extra pauses shave the reward; switching tabs mid-focus is logged and costs HP after the first. If nothing in the app is touched for 30 minutes you get a warning, and 5 minutes later the session ends itself, counting only the time before you stepped away."],
      ["Calendar", "Month grid or a week time-grid, for exams, deadlines, study blocks, lessons and personal events. A busy day collapses into a “+N more” sheet that lists everything on it; clicking anything opens a read-only detail card with Edit and Delete, so you can look without touching. Repeats run daily, weekly, fortnightly, monthly or yearly with an optional end date — a repeating event is ONE record, so editing it changes every showing and deleting it removes them all."],
      ["Event alerts", "There is no global “remind me N days out” setting any more: alerts belong to each event, chosen from the same list reminders and assignments use (from “at the time” up to two weeks before), up to four per event. A new exam or deadline starts with a three-day warning, which you can change or clear — clearing sticks. Alerts are in-app only and fire while Kurenai is open; the app never pushes. Anything you already had is migrated automatically, including events you'd silenced."],
      ["The event editor", "One modal adds and edits. Title, date, optional start and end time (or all day), type and colour stay visible; details, repeat and alerts sit behind sections that open when you need them, and a section already holding data opens by itself. The type decides what else you're asked: an exam adds paper, duration, room and related topics; a deadline adds priority, status and whether it shows on the Countdown rail; a study block adds an intended duration, a link to an assignment and a shortcut that saves the block and starts a focus session on it. Dates and times are checked before anything is written, and Delete sits apart from Save."],
      ["Countdowns", "The rail merges upcoming calendar exams and deadlines with the assignments you've marked major, nearest first. Both sides are read from their own record — nothing is copied to make a countdown appear, and hiding one is a setting on the record, not a deletion."],
      ["Assignment Tracker", "Study → Assignments (also a tab on each subject desk). ONE record per assignment carries title, subject, type, description, assigned and due date/time, status, progress, priority, estimated and actual effort, subtasks, notes, attachments, related topics and alerts. Statuses run Not started → In progress → Blocked → Submitted → Complete, and reopening clears the submitted/completed stamps rather than leaving the record claiming to be finished."],
      ["Assignments elsewhere", "The Calendar, the Countdown rail, Home and the Focus Timer all READ that one record — none of them keeps a copy. A deadline is therefore not a calendar event: the grid asks the tracker what is due, so deleting an assignment removes its calendar chip, countdown row and Home card at once and can never leave an orphan behind. Countdown visibility is a field you set per assignment, so ordinary homework doesn't crowd out real exams. A focus session can be linked to an assignment; completing that session banks its minutes as actual effort (an abandoned session banks nothing). Completing an assignment pays the usual small trickle exactly once — reopening and re-completing earns nothing further."],
      ["Reminders", "A full task store on its own page (Productivity → Reminders): due date and time, priority, notes, sub-tasks, repeat and alert rules. LISTS are containers — a reminder belongs to one; TAGS are cross-list labels — it can carry many. The two are deliberately separate concepts and never merge. Smart sections (Today, Scheduled, Upcoming, Overdue, Completed) are derived, never stored, so nothing has to be filed twice."],
      ["Reminder rewards", "Completing a reminder pays the same small trickle as any tick, but it is bounded so a list of trivial items can't be farmed: at most 8 rewarded completions a day, one reward per reminder per day (re-ticking pays nothing), and sub-task ticks pay nothing at all. Completing always WORKS past the cap — it just stops paying. Creating, editing and deleting never move the economy."],
      ["Reminders elsewhere", "Home shows a read-only digest with a link through — management lives on the page. Dated reminders appear quietly on the Calendar grid, but an ordinary reminder never becomes a major Countdown; Countdowns stay reserved for calendar exams and deadlines. Alerts are in-app only, firing while Kurenai is open — there is no background push."],
      ["Habits", "Repeatable daily habits with their own streaks, on Productivity \u2192 Habits. Ticking one pays the same small trickle as a reminder."],
      ["Pacing", "Productivity \u2192 Pacing: the school scheme of work, both personal curriculums and IT F201 on ONE week-indexed timeline. School week N is your week N \u2212 1, so the two are always matched on the week beginning and never on a bare number. The Week tab is a term ribbon (per-subject load, half term, mock weeks, the week you are in) over one week: a banner with how many of your rows are ticked and how many are behind, three subject columns each listing what class covers and what your own plan covers, then what is due that week and a note for the week. Every week is linkable: #/pacing/2026-12-14 reopens the week of the mocks."],
      ["Ticking off the plan", "Every row has a tick beside it. On your own plan (and on the Home card) tick it when you have done that week's item; on a class row tick each lesson as you sit it. Either way it is the plan's own bookkeeping, not a mastery claim: the topic page still owns that, and nothing is paid for a tick. An unticked row of YOUR plan whose week has ended carries over into every later week \u2014 it sits first in My plan with a \u201ccarried\u201d chip (hover it for the week it came from), and the banner counts how many rows are behind, until you tick it or press \u2192 here to move it into the week you are looking at. Class rows never carry. A class row lists its lessons under it, each with its own tick; the row counts as sat once every lesson is. Class mocks, assessments and NEA milestones stand in the Countdowns; assignments, exams and deadlines inside the week show under Due this week; a row's dialog can set a reminder for the week's end; and the week rolling over with work left is one line in Notifications."],
      ["Who got there first", "The braid's merges are the one place the plan makes an argument rather than a list, and the reason the three plans had to become one store: for each specification point class teaches, did your own plan reach it first, the same week, or after class? It is set arithmetic over linked spec points, measured from the FIRST week your plan reaches each one. A class row that links to no spec point makes no claim at all."],
      ["Linked spec points", "A plan row points at generated specification leaves, which is what makes the alignment real and what lets a row open the topic page. Coverage on a row (\u201c2/3\u201d) is READ from your study record through those links \u2014 Pacing stores no progress of its own, so a row and the topic page it opens can never disagree, and nothing here moves HP, gold, XP or the session log. Some rows are deliberately unlinked: where the published specification does not name a topic (bitwise masking and linked lists in AQA 7517, for instance) the row says so rather than pointing at a near-enough leaf that would open the wrong page."],
      ["Editing the plan", "The plan was imported once and this app is the source of truth now, so it is fully editable. \u201c+ Add row\u201d sits on the week's banner beside Edit week and opens on your own CS plan (the dialog picks the subject and the register); clicking any row opens it for editing with a searchable specification picker; the ribbon ends with a \u201c+ Week\u201d cell and each week has Edit week. Moving a week to a different beginning takes its rows with it, and deleting a week that still holds rows tells you how many it would take before you confirm. Delete always sits apart from Save and never confirms on Enter."],
      ["The braid", "The second Pacing tab draws the same evidence as a branch diagram, one subject at a time \u2014 the CS / Maths / IT toggle beside Week and Braid switches the whole page. The subject's spine is the room's timeline, with your own planned weeks ticked beneath it. Every specification point the two share becomes a BRANCH: it leaves your row and merges into the spine when you got there first (teal), runs straight up when it was the same week (green), or leaves the spine and ends on your row when class got there first. Branches are packed into depths the way a commit graph packs lanes, and a thicker branch shares more spec points. \u25b3 on the spine marks points class teaches that your plan never schedules. Press a week's column to open it. Under the diagram, \u201cEvery merge, in words\u201d lists each of your rows that met class, one per line: its topic (the parent of the spec points it shares), when each side reached it, and who got there first. Press a row for its dialog, which links every spec point to its topic page."],
      ["Today's directives", "The auto-generated daily list on the home page: due cards, near deadlines and today's study blocks. Ticks earn XP. Your own reminders are reported underneath, read-only \u2014 manage them on the Reminders page."],
    ]],
    ["The Behavioural Governor", [
      ["HP", "Health drains on days with zero study and when the due-card backlog piles up (past " + (KOS.governor ? KOS.governor.BACKLOG_LIMIT : 30) + "). Below 60 you're Strained and below 30 you're in Recovery Mode, where HP restores at half rate — but nothing locks: labs, sims and the shop stay open at any HP, and core revision — spec, notes, cards, quizzes, exam Qs — never locks, ever."],
      ["Gold", "Earned from sessions, streak milestones, quiz scores ≥80% and clearing the due queue. Spent in the Governor's shop on permanent lab/sim unlocks and cosmetics (themes, kanji seals, avatar frames, bookshelf skins for the Books Physical tab, Shrine card styles). Prices were rebalanced in 3j around real earning rates — a big lab is about a week of steady study, small cosmetics two or three days."],
      ["XP & level", "A pure progress meter — it gates nothing except the avatar seal library, which unlocks by level. The HUD in the topbar shows avatar, level, gold, HP and XP at a glance; click it for the full panel."],
      ["Avatar", "Pick a procedural seal or upload your own image (auto-cropped to a circle and compressed before storing)."],
      ["Status & about", "A short status line and a few lines about yourself, edited from the Governor's Seat, the Home profile band or the topbar profile popover. All three surfaces read the ONE record, so editing anywhere updates everywhere — there is no second copy to fall out of step."],
      ["The ledger vs the session log", "The Governor's Seat shows meaningful acts only: sessions finished, directives sealed, papers logged, media completed. Background integration traffic (the entry an autosync cycle writes) is filed under Session Log → Sync history, collapsed to one line per provider per day. Nothing is deleted — the governor still prices from the full log — it just stops drowning out what you actually did."],
      ["Streaks", "Consecutive days with at least one completed session — overall and per subject. Early-stopped focus sessions don't count; everything else does."]
    ]],
    ["The Collection Matrix", [
      ["Collection Matrix", "The cross-media home: what you're currently consuming across every module, an “airing soon” list with live countdowns, aggregate charts, and the rest streak — consecutive days with at least one media log, fully independent of the study streak. All four modules are live: Anime, Books, Visual Novels and Games."],
      ["Anime vault", "Grid or list of your whole anime collection. Filter by status, genre or tag and search titles — all against database indexes, so 650 entries stay instant; cards render as you scroll. Click a card to edit everything; “+1 ep” on an in-progress card is the everyday logging action. Since 3f: airing entries carry a live “EP n · countdown” badge, and the watch-history heatmap below the vault mirrors Books' reading heatmap — same log, same chart."],
      ["Seasonal Watching (3f)", "Your vault one season at a time — defaults to today (device date onto AniList's own season calendar: Winter Jan–Mar, Spring Apr–Jun, Summer Jul–Sep, Fall Oct–Dec), and the season/year picker walks any past or future season. Next-episode countdowns on anything airing, and the palette follows the selected season (cool for winter, warm for summer). Season data comes from AniList sync/enrichment; manual or unenriched entries simply don't appear here — that's the honest scope. Airing times refresh when the view loads (plus a ⟳ button); there is no background polling."],
      ["AniList Profile", "Your account behind the sync: Overview, Analytics, Favourites, Social, Activity and Notifications. The profile is read-only; viewing notifications here never marks them read on AniList."],
      ["VNDB Profile", "Your VN account behind the sync: profile identity, label statistics, play-length votes and collection analytics. VNDB does not expose favourites, followers, social activity or notifications, so those panels are deliberately absent."],
      ["Books vault", "Manga & light novels, dual-tracked on one entry: the digital reading half (status, chapters and volumes read as \u201cx of y\u201d, a score out of 10 beside Favourite — synced from AniList or manual) AND the physical half (each owned volume with condition, purchase date and price; the range tool adds a whole box set in one go, and \u201cOn the shelf 2 of 12\u201d takes the number of volumes in print). Owned vs read share one scale, so the two bars compare. From the Physical Vault lens a book with volumes gets a tab for one volume — its own status, chapters and pages, score, dates, book type and ISBN; pressing a spine opens straight on it. A hand-made book can find itself on AniList (added to your list there, then mirrored with its shelf kept) or fill its details from Open Library / Google Books. Extras: mood tags, custom shelves, a quote log, and the reading heatmap fed by your logs."],
      ["Bookshelf & Mangaka", "The Shelf layout renders your physically-owned volumes as spines — deterministic colours per series, or upload a custom cover for any volume. The Mangaka page groups every work by author (as-written name grouping) with aggregate owned/read stats."],
      ["Visual Novels vault", "VNDB fills the metadata (title, developer, cover, content tags as genres, length estimate); the tracking that matters is manual by design — VNDB has no structured route data, so the route list is yours to build. A VN's progress comes from ONE of four things you choose in the editor's “What counts”: routes cleared (the default when routes exist), chapters/parts completed (your own division of a VN's structure — how a kinetic novel like Higurashi counts, and it gets a “+1 ch” on the card), or hours played measured against VNDB's crowd-sourced length (for a first playthrough of something with no clean structure — you can't know a percentage, but you know how long you've played; “+1 hr” on the card, and the length bucket stands in as a rough figure until VNDB has play-time votes). Left on Automatic, it counts routes, then chapters, then hours. The Chapters tab treats chapters like a series' volumes: owned vs played on one scale, “On the shelf 4 of 4”, a card per chapter with its own art, and the selected chapter's platform, date and price; its own tab holds that chapter's status, hours, score and dates. The vault's Chapter select layout (章) shows every VN you track by chapter as a chapter menu, the next one to play flagged. Plus: a CG counter (numbers only, never artwork), your own content-warning tags, and the quote log — any kept line can be sent to the flashcard system's Personal deck, where it joins the normal SM-2 schedule without being forced into a subject."],
      ["Sync & Import", "Three ways in: connect your AniList (one-time Client ID + token via their PIN page) for anime & manga; connect your VNDB (a personal token from vndb.org/u/tokens — simpler, no OAuth; VNDB blocks list writes from browser pages, so status/score pushes to VNDB go through the cloud relay and need you signed in to cloud sync with a token that has “modify my list” ticked) for visual novels; or import the zero-setup AniList XML export and run the public enrichment. All paths feed the same vault, matched by AniList/MAL/VNDB id. Anime and the digital half of Books are a 1:1 MIRROR of your AniList lists: every pull (Sync now, and the background cycle) removes what the list no longer carries and folds any duplicate rows into one, so there is no manual add, edit or delete for them — status, progress and score still change here and push back within seconds, and your favourites, notes, tags and lists ride along. Physical volumes are outside AniList's reach and always survive; so do routes, chapters, quotes and warnings on Visual Novels."],
      ["Notifications", "The bell in the header collects everything the app would have tapped you on the shoulder for: calendar and assignment alerts, reminders, an episode airing for a title you're watching, a Budget Planner item reaching its release day. The popover shows the five most recent; View all opens the full page under Archive with filters by section. Reading one anywhere reads it on every synced device. Device alerts — a system notification on your Mac or an installed phone app — are a per-device opt-in on that page; they fire while Kurenai is open in a tab or as an app (there is no push server, so a closed app stays quiet)."],
      ["Planner", "The Planner workspace holds Budget Planner and Goals under one secondary tab bar. Use it for collection budgeting and personal goals without crowding the archive navigation."],
      ["Autonomous sync", "Once connected, the app keeps AniList and VNDB current in both directions: local edits push automatically and connected lists are pulled every 15 minutes, on coming back online and when the tab wakes. Sync & Import shows the toggle, last cycle and technical history."],
      ["Write-back", "Editing a synced entry's status, progress or score pushes the change back to the connected account automatically. Rapid edits coalesce, failures expose a retry chip, and only list state ever leaves the device; personal media details remain local."],
      ["Find new", "The ⊕ Find new button in each vault searches the external database, separately from the local-vault search. Pick a status to add a result to the appropriate collection."],
      ["Games vault", "Manual-first by design: bulk-add titles, then track completion tier, platform, playtime, backlog priority, publisher and an optional Steam store link. The analytics area shows tier/platform/genre breakdowns and backlog burn-down."],
      ["The Shrine", "Everything you've marked ♥, ranked by your scores, across all modules. The hall of fame."],
      ["Governor boundary", "Logging media earns a small XP/gold trickle and feeds the rest streak; a sync that discovers progress made elsewhere logs ONE proportional reward per sync. HP is untouched in both directions — media days don't drain it, and can't heal it."]
    ]],
    ["Data & housekeeping", [
      ["Backup & Restore", "The full export covers everything in one file: study progress, governor state, the entire media vault across all four modules (including routes, quotes, physical volumes, chapters — all the data only you can build), and document attachments. Import is a complete restore for disaster recovery or moving to a new machine. AniList/VNDB tokens are intentionally not included — a backup file can end up in less-secure places than your browser; after restoring, reconnect from Sync & Import the same way you did originally (a minor inconvenience, the correct trade-off). Old-format backups (pre-R3, missing the media vault) import the study data they contain and tell you clearly what was not covered."],
      ["Cloud Sync", "Optional multi-device sync through a personal Supabase account (Archive → Account & Cloud Sync). Signing in syncs three things automatically: the study/Governor state, the media vault (entry by entry) and attachment DETAILS; attachment FILES upload only when you press “Sync files now”, and files never uploaded stay on the device they were added on. Devices MERGE rather than overwrite: every record (sessions, events, reminders, assignments, cards, planner rows) is matched by id, additions from both devices survive, a deletion on either device wins, and a record edited on both keeps the later edit field by field. Gold, XP and HP combine by what each device earned or spent, so two sessions logged on two devices pay once each; owned cosmetics union. The first sign-in on a device is automatic too — an empty device adopts the account, an empty account receives the device, and two histories combine. Media entries sync individually, newest copy wins. A device that has just saved tells the others straight away, so a change on the laptop is on the phone in a couple of seconds. The topbar chip shows the true sync state (synced / syncing / changes pending / offline / signed out / error with tap-to-retry). Everything works signed out or offline — sync is a replication layer, not a gate — and it complements backups rather than replacing them: the export file remains the strongest protection. AniList/VNDB tokens and your cloud password never sync anywhere."],
      ["Install as an app (PWA)", "Served over HTTPS (or localhost), Kurenai OS installs to your home screen / dock and works offline: the app shell is cached by a service worker, so it opens without a connection and everything local keeps working (live AniList/VNDB/cloud features naturally need the network). Updates are safe by default — a new version downloads in the background and asks before switching; it never swaps code out from under a running session. Four honest facts about storage: (1) Kurenai OS requests persistent browser storage where supported, at a meaningful moment (installing the app, or signing in to cloud sync) — never as a nag; (2) even granted, browsers and especially iOS can still evict local data under storage pressure or long disuse — persistence is a request, not a guarantee; (3) the backup export remains the strongest protection against local storage loss, full stop; (4) cloud sync gives multi-device continuity but is not a substitute for deliberate backups in every failure scenario. Note the browser treats file://, localhost and a hosted address as separate stores — use cloud sync or a backup file to move between them."],
      ["Autosave", "Every change saves automatically (the AUTOSAVE dot pulses). There is no save button anywhere."],
      ["Sample data", "Calendar events marked SAMPLE are placeholders — edit or delete them and add your real dates."]
    ]]
  ];

  /* Keep the guide as a practical launch point. Entries without a route remain
     explanatory rather than pretending every help subject is a destination. */
  var RELATED = {
    "Overview": ["Open Home", "home"],
    "Subjects (rail)": ["Open Study", "subject", "compsci"],
    "Review": ["Open Review", "review"],
    "Due Today": ["Open Due Today", "due"],
    "Focus Timer": ["Open Focus Timer", "focus"],
    "Calendar": ["Open Calendar", "calendar"],
    "Pacing": ["Open Pacing", "pacing"],
    "The braid": ["Open the braid", "pacing", { tab: "braid" }],
    "Today's directives": ["Open Tasks", "tasks"],
    "Exams & Papers": ["Open Exams & Papers", "tracker"],
    "Card Stats": ["Open Card Stats", "cardstats"],
    "HP": ["Open Governor Status", "governor", "status"],
    "Gold": ["Open Gold Shop", "governor", "shop"],
    "Avatar": ["Open Avatar", "governor", "avatar"],
    "Collection Matrix": ["Open Collection Overview", "matrix"],
    "Anime vault": ["Open Anime", "anime"],
    "AniList Profile": ["Open AniList", "aniprofile"],
    "VNDB Profile": ["Open VNDB", "vndbprofile"],
    "Books vault": ["Open Books", "books"],
    "Visual Novels vault": ["Open Visual Novels", "vn"],
    "Games vault": ["Open Games", "game"],
    "The Shrine": ["Open Shrine", "shrine"],
    "Sync & Import": ["Open Sync & Import", "mediasync"],
    "Backup & Restore": ["Open Data & Backup", "data"],
    "Cloud Sync": ["Open Cloud Sync", "data"],
    "Install as an app (PWA)": ["Open Data & Backup", "data"]
  };
  function slug(value) { return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  /* each section marked like the main rail */
  var SECTION_MARK = ["灯", "学", "習", "整", "守", "蒐", "蔵"];

  /* ---------------- figures (review B, frame 14c) ----------------
     The guide was all text. An entry that is about something you look at
     carries a small drawing of it, built from the same palette, with
     numbered marks and a legend underneath. The drawing is decoration
     (aria-hidden) — the legend and the paragraph carry the meaning. A
     part: { t, s (sub-line), tone, n (mark), kind: "kbd"|"chip"|"dot"|
     "bar"|"ring" , p (bar %) }. */
  var FIG = {
    "Search (topbar)": { rows: [[{ t: "⌕  Search everything", kind: "field", n: 1 }, { t: "/", kind: "kbd", n: 2 }]],
      notes: ["Every spec point, flashcard, note, event and title in one box.", "Press / from anywhere to jump into it; ↑ ↓ and Enter pick a result."] },
    "Back / Forward": { rows: [[{ t: "‹", kind: "key" }, { t: "›", kind: "key" }, { t: "Alt ←", kind: "kbd", n: 1 }, { t: "Alt →", kind: "kbd" }, { t: "Backspace", kind: "kbd", n: 2 }]],
      notes: ["The arrows step through your page history like a browser.", "Backspace goes back too, unless you are typing."] },
    "Flashcards": { rows: [[{ t: "Again", s: "< 1 min", tone: "red", n: 1 }, { t: "Hard", s: "1 day", tone: "amber", n: 2 }, { t: "Good", s: "3 days", tone: "green", n: 3 }, { t: "Easy", s: "7 days", tone: "teal", n: 4 }]],
      notes: ["Again — you did not know it: it comes back this session and the interval resets.", "Hard — you got there slowly: the interval grows a little.", "Good — the normal step.", "Easy — it jumps well ahead."] },
    "Topic status": { rows: [[{ t: "◐ Started", kind: "chip", n: 1 }, { t: "R", kind: "dot", tone: "red", n: 2 }, { t: "A", kind: "dot", tone: "amber" }, { t: "G", kind: "dot", tone: "green" }, { t: "75%", kind: "big", n: 3 }]],
      notes: ["Where the topic stands: not started, started, completed.", "How solid it feels — your call; the app shows when its own read disagrees.", "Mastery: the four progress checks, averaged."] },
    "Quiz / Exam questions": { rows: [[{ t: "A  Integer", kind: "opt" }], [{ t: "C  Real", kind: "opt", tone: "green", s: "Correct", n: 1 }], [{ t: "☑ 1 mark · names the type", kind: "chip", n: 2 }, { t: "−  2  +", kind: "chip" }]],
      notes: ["A quiz answers instantly and says why.", "An exam question reveals its mark scheme as a checklist; tick what you earned."] },
    "Due Today": { rows: [[{ t: "Review 57 due cards", s: "About 29 minutes · oldest 2 days overdue", kind: "wide", tone: "crimson", n: 1 }], [{ t: "Start reviewing →", kind: "cta", n: 2 }]],
      notes: ["Every card whose day has come, across all three subjects, most overdue first.", "One run through it is the day's most valuable habit."] },
    "Exams & Papers": { rows: [[{ t: "A*", kind: "grade", tone: "gold" }, { t: "A", kind: "grade", tone: "green" }, { t: "B", kind: "grade", tone: "teal", n: 1 }, { t: "C", kind: "grade", tone: "amber" }, { t: "U", kind: "grade", tone: "red" }], [{ t: "72%", kind: "bar", p: 72, tone: "amber", n: 2 }]],
      notes: ["The grade takes its colour from its tier (IT reads Distinction/Merit/Pass).", "The score bar is the marks you logged over the marks available."] },
    "Focus Timer": { rows: [[{ t: "25:00", kind: "ring", n: 1 }, { t: "Focus", s: "25 min", kind: "chip", n: 2 }, { t: "Break", s: "5 min", kind: "chip" }]],
      notes: ["The stage: the clock, the phase, pause and finish.", "Pick the length; the award is previewed before you start."] },
    "Pacing": { rows: [[{ t: "0 of 10 plan rows ticked", kind: "wide", n: 1 }, { t: "10 behind", kind: "chip", tone: "amber", n: 2 }], [{ t: "In class", kind: "kick" }, { t: "○ SQL DDL · 4.10.4", kind: "opt" }], [{ t: "My plan", kind: "kick" }, { t: "○ Programming constructs", kind: "opt" }, { t: "carried", kind: "chip", tone: "amber", n: 3 }]],
      notes: ["The week's one figure.", "How many of your rows are behind.", "An unticked row from an ended week carries into this one until you tick or move it."] },
    "Ticking off the plan": { rows: [[{ t: "✓", kind: "dot", tone: "teal", n: 1 }, { t: "Data types", kind: "opt" }], [{ t: "○", kind: "dot" }, { t: "Recursion", kind: "opt" }, { t: "carried", kind: "chip", tone: "amber" }, { t: "→ here", kind: "link", n: 2 }]],
      notes: ["A tick is the plan's own bookkeeping — not a mastery claim.", "Move a carried row into the week you are looking at."] },
    "The braid": { svg: true, notes: ["The spine is class, the dotted row your plan; a branch runs between the weeks that share a spec point.", "Straight up: the same week. \u25b3: class only.", "Pick the subject with the CS / Maths / IT toggle."] },
    "HP": { rows: [[{ t: "Healthy", kind: "bar", p: 86, tone: "green", n: 1 }], [{ t: "Critical < 40", kind: "bar", p: 30, tone: "red", n: 2 }]],
      notes: ["A wellbeing signal fed by what you log — it never locks study.", "Below 40 the day turns into three recovery wins."] },
    "Gold": { rows: [[{ t: "◈ 640", kind: "chip", tone: "amber", n: 1 }, { t: "Unlock · 120 ◈", kind: "cta", n: 2 }]],
      notes: ["What sessions have earned you.", "Spent once, on labs, simulations and cosmetics — never on core revision."] },
    "Streaks": { rows: [[{ t: "12", s: "study streak", kind: "big", n: 1 }, { t: "best 21", kind: "chip", n: 2 }]],
      notes: ["Days in a row with a completed study session.", "Your longest run, kept."] },
    "Notifications": { rows: [[{ t: "Reminder · Email Mr Hart", s: "Today 20:30", kind: "wide", n: 1 }], [{ t: "Airing episodes", kind: "chip", n: 2 }, { t: "on", kind: "switch" }, { t: "Quiet hours 23:00–07:00", kind: "chip", n: 3 }]],
      notes: ["One feed of what happened to you, read everywhere once read here.", "Filters hide a kind without deleting it.", "Quiet hours hold device alerts only."] },
    "The Shrine": { rows: [[{ t: "01", s: "Your top title", kind: "big", tone: "gold", n: 1 }, { t: "02", kind: "chip", n: 2 }, { t: "03", kind: "chip" }]],
      notes: ["Your favourites ranked by score — rank 01 takes the hero.", "Ties are yours to order."] }
  };
  /* the commit-graph braid in miniature: spine, my row, branches packed
     below the row with square corners, a straight same-week stub */
  var BRAID_SVG = '<svg viewBox="0 0 320 100" width="320" height="100" class="k-hfig-svg">'
    + '<line x1="20" y1="20" x2="300" y2="20" class="k-hfig-line" data-line="class"/>'
    + '<line x1="20" y1="44" x2="300" y2="44" class="k-hfig-line" data-line="mine"/>'
    + '<path d="M60,44 L60,66 L130,66 L130,20" class="k-hfig-arc k-hfig-branch" data-tone="ahead"/>'
    + '<path d="M200,44 L200,20" class="k-hfig-arc k-hfig-branch" data-tone="same"/>'
    + '<path d="M240,20 L240,82 L290,82 L290,44" class="k-hfig-arc k-hfig-branch" data-tone="behind"/>'
    + [60, 130, 200, 240, 290].map(function (x) { return '<circle cx="' + x + '" cy="20" r="5" class="k-hfig-node" data-line="class"/><circle cx="' + x + '" cy="44" r="5" class="k-hfig-node" data-line="mine"/>'; }).join("")
    + "</svg>";
  function figure(spec) {
    var vis = el("div", { class: "k-hfig-vis", "aria-hidden": "true" });
    if (spec.svg) vis.appendChild(el("div", { class: "k-hfig-row", html: BRAID_SVG }));
    (spec.rows || []).forEach(function (row) {
      vis.appendChild(el("div", { class: "k-hfig-row" }, row.map(function (part) {
        var n = el("span", { class: "k-hfig-part", "data-kind": part.kind || "tile", "data-tone": part.tone || null }, [
          part.kind === "bar" ? el("span", { class: "k-hfig-bar" }, [el("i", { style: "--p: " + (part.p || 0) + "%" })]) : null,
          el("b", { text: part.t }),
          part.s ? el("small", { text: part.s }) : null,
          part.n ? el("span", { class: "k-hfig-n", text: String(part.n) }) : null
        ].filter(Boolean));
        return n;
      })));
    });
    return el("figure", { class: "k-hfig", "data-ui": "help.figure" }, [
      vis,
      spec.notes && spec.notes.length ? el("ol", { class: "k-hfig-notes" }, spec.notes.map(function (t) { return el("li", { text: t }); })) : null
    ].filter(Boolean));
  }

  /* Graphite step 8 (frame 14c): a documentation desk — the sections on
     the left, ONE entry read as an article in the middle (review B: a
     section's entries are picked from "On this page", not stacked), and
     on the right what is on this page, the shortcuts and a way to ask
     Kurenai. The route carries both (#/help/<section>/<entry>), so a link
     to one part of the guide survives being sent. */
  KOS.views.help = function (main, arg) {
    KOS.shell.tree("none");
    var want = typeof arg === "string" ? { section: arg } : (arg || {});
    var si = Math.max(0, SECTIONS.findIndex(function (s) { return slug(s[0]) === want.section; }));
    var sec = SECTIONS[si];
    var ei = Math.max(0, sec[1].findIndex(function (item) { return slug(item[0]) === want.entry; }));
    var entry = sec[1][ei];
    main.appendChild(KOS.ui.pageHeader({ kicker: "The archive · 導", title: "Help & Guide",
      sub: "What everything is and how to use it. Search, or open a section to read." }));

    var nav = el("nav", { class: "k-help-nav", "data-ui": "help.nav", "aria-label": "Guide sections" });
    var article = el("article", { class: "k-card k-help-article", "data-ui": "help.content", "aria-labelledby": "help-title" });
    var aside = el("aside", { class: "k-help-aside", "data-ui": "help.aside", "aria-label": "On this page" });
    main.appendChild(el("div", { class: "k-help", "data-ui": "help.wrap" }, [nav, article, aside]));

    /* the search, then every section */
    var search = el("input", { type: "search", class: "k-input k-help-search", "data-ui": "help.search",
      placeholder: "Search the guide…", "aria-label": "Search the guide" });
    nav.appendChild(search);
    var navList = el("div", { class: "k-help-nav-list" });
    nav.appendChild(navList);
    function go(s, name) {
      KOS.show("help", name ? { section: slug(SECTIONS[s][0]), entry: slug(name) } : slug(SECTIONS[s][0]));
    }
    SECTIONS.forEach(function (s, i) {
      var open = i === si;
      var group = el("div", { class: "k-help-group" });
      /* the rail lists the sections only; a section's entries are its
         "On this page" (review A). A search still matches inside them. */
      group.appendChild(el("button", { type: "button", class: "k-help-group-h", "data-ui": "help.nav-item help.section",
        "aria-label": s[0], "aria-current": open ? "page" : null,
        "data-q": (s[0] + " " + s[1].map(function (item) { return item[0] + " " + item[1]; }).join(" ")).toLowerCase(),
        onclick: function () { go(i); } }, [
        el("span", { class: "k-help-mark", lang: "ja", "aria-hidden": "true", text: SECTION_MARK[i] || "·" }), s[0],
        el("span", { class: "k-help-count k-mono", text: String(s[1].length) })
      ]));
      navList.appendChild(group);
    });

    /* the article: the one entry, its drawing, its paragraph */
    var rel = RELATED[entry[0]];
    article.appendChild(el("div", { class: "k-help-crumb", text: sec[0] + " · " + entry[0] }));
    article.appendChild(el("h2", { id: "help-title", class: "k-help-title", text: entry[0] }));
    var body = el("div", { class: "k-help-body", "data-ui": "help.block" }, [
      el("section", { class: "k-help-entry", "data-ui": "help.row", "data-q": (entry[0] + " " + entry[1]).toLowerCase() }, [
        el("p", { text: entry[1] }),
        FIG[entry[0]] ? figure(FIG[entry[0]]) : null,
        rel ? el("button", { type: "button", class: "k-link k-help-related", text: rel[0] + " →",
          onclick: function () { KOS.show(rel[1], rel[2]); } }) : null
      ].filter(Boolean))
    ]);
    article.appendChild(body);
    /* search results replace the article body while there is a query */
    var results = el("div", { class: "k-help-body", "data-ui": "help.results", hidden: "" });
    article.appendChild(results);
    /* previous / next walk every entry of the guide, in order */
    var flat = [];
    SECTIONS.forEach(function (s, i) { s[1].forEach(function (item) { flat.push([i, item[0]]); }); });
    var at = flat.findIndex(function (f) { return f[0] === si && f[1] === entry[0]; });
    var pager = el("div", { class: "k-help-pager" }, [
      at > 0 ? pageLink(flat[at - 1], "← Previous") : el("span"),
      at < flat.length - 1 ? pageLink(flat[at + 1], "Next →") : el("span")
    ]);
    article.appendChild(pager);
    function pageLink(f, dir) {
      return el("button", { type: "button", class: "k-help-page", "data-dir": dir.charAt(0) === "←" ? "prev" : "next",
        onclick: function () { go(f[0], f[1]); } }, [el("span", { class: "k-help-page-k", text: dir }), el("b", { text: f[1] })]);
    }

    /* on this page: the section's entries — the switch between them */
    var onPage = el("section", { class: "k-card k-help-card", "aria-label": "On this page" }, [el("div", { class: "k-kicker", text: "On this page" })]);
    sec[1].forEach(function (item, i) {
      onPage.appendChild(el("button", { type: "button", class: "k-help-toc", "data-ui": "help.toc", "aria-current": i === ei ? "page" : null,
        text: item[0], onclick: function () { go(si, item[0]); } }));
    });
    aside.appendChild(onPage);
    var keys = el("section", { class: "k-card k-help-card", "aria-label": "Useful shortcuts" }, [el("div", { class: "k-kicker", text: "Useful shortcuts" })]);
    [["/", "Search the app"], ["Alt ← / →", "Back / forward"], ["Esc", "Close overlays"], ["1–4", "Rate a card"]].forEach(function (k) {
      keys.appendChild(el("div", { class: "k-card-row" }, [el("kbd", { class: "k-help-kbd", text: k[0] }), el("span", { class: "k-card-row-k", text: k[1] })]));
    });
    aside.appendChild(keys);
    if (KOS.assistant && KOS.assistant.ask) aside.appendChild(el("button", { type: "button", class: "k-help-ask", onclick: function () {
      KOS.assistant.ask("I'm reading the KurenaiOS guide on “" + entry[0] + "”. Explain how it works in practice, briefly.", "tutor");
    } }, [
      el("img", { src: "assets/assistant/logo/whispering-bloom-emblem-production.png", alt: "" }),
      el("span", {}, ["Still stuck? ", el("b", { text: "Ask Kurenai" }), " about this page."])
    ]));

    /* search across every section */
    search.addEventListener("input", KOS.ui.debounce(function () {
      var q = search.value.trim().toLowerCase();
      navList.querySelectorAll("[data-ui~='help.nav-item']").forEach(function (b) { b.hidden = !!q && b.dataset.q.indexOf(q) === -1; });
      results.innerHTML = "";
      body.hidden = pager.hidden = !!q;
      results.hidden = !q;
      if (!q) return;
      var hits = [];
      SECTIONS.forEach(function (s, i) {
        s[1].forEach(function (item) { if ((item[0] + " " + item[1]).toLowerCase().indexOf(q) !== -1) hits.push([i, item]); });
      });
      if (!hits.length) { results.appendChild(KOS.ui.emptyState({ compact: true, mark: "導", title: "Nothing matches", body: "Try a page name, a feature, or a word from what it does." })); return; }
      hits.forEach(function (h) {
        results.appendChild(el("section", { class: "k-help-entry" }, [
          el("div", { class: "k-help-crumb", text: SECTIONS[h[0]][0] }),
          el("h3", { class: "k-help-entry-h" }, [el("button", { type: "button", class: "k-help-hit", "data-ui": "help.hit", text: h[1][0], onclick: function () { go(h[0], h[1][0]); } })]),
          el("p", { text: h[1][1] })
        ]));
      });
    }, 150));
    search.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && search.value) { search.value = ""; search.dispatchEvent(new Event("input")); search.focus(); }
    });
  };
})();
