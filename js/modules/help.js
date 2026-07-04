/* Kurenai OS — modules/help.js
   The in-app guide: what every tab and feature does, in a paragraph or less. */
(function () {
  "use strict";
  var el = KOS.ui.el;

  var SECTIONS = [
    ["Getting around", [
      ["Overview", "The home dashboard: overall completion ring, today's to-do, deadline countdowns, streaks, flagged topics, and the entry point for focus sessions. Click a subject card to open its dashboard."],
      ["Subjects (rail)", "Each subject shows its spec tree on the left. Click any leaf to open the topic page. The % next to each subject is spec points marked Completed."],
      ["Search (topbar)", "Press / anywhere to search every spec point and flashcard across all three subjects. Arrow keys + Enter to jump."],
      ["Back / Forward", "The ‹ › buttons (or Alt+←/→, Backspace) step through your page history like a browser."]
    ]],
    ["The topic page", [
      ["Specification", "The verbatim board wording, split into content and guidance columns, plus examiner intel (definitions, tips, pitfalls) and your personal note box."],
      ["Notes", "The deep revision content — paginated sections, worked processes, callouts, tables and code. This is the main study surface."],
      ["Flashcards", "Reviews the topic's deck with the 4-point SM-2 scale (Again / Hard / Good / Easy). Again retests the card in the same session AND reschedules it. ⚙ Manage cards lets you add, edit and delete your own custom cards and see each card's full history (ⓘ)."],
      ["Quiz / Exam Qs", "Instant-feedback multiple choice, and exam-style questions with reveal-the-mark-scheme self-marking. Both log to your session history."],
      ["Worked / Simulate", "Worked-example generators with your own numbers, and interactive simulations. Sims are part of the enrichment layer — some are gold unlocks."],
      ["Files", "Attach documents (PDFs, images, anything) to this topic. Stored in the browser's IndexedDB; images and PDFs preview inline, and every file has its own notes field."],
      ["Status, checklist & confidence", "The status dropdown and four checkboxes track completion. The R/A/G confidence dots are separate — how solid the topic feels. The app also computes its own R/A/G from your data and shows when it disagrees with you."]
    ]],
    ["Study systems", [
      ["Due Today", "The global SM-2 queue: every card whose review date has arrived, across all subjects, most-overdue first. Cards join the schedule the first time you rate them. Clearing this daily is the single highest-value habit."],
      ["Focus Timer", "Pomodoro (25/5) or custom timed sessions, with an optional subject/topic link. Starting one enters a minimal focus mode; “Study while focused” brings back the sidebar so you can work through pages while the clock runs. Everything you complete during the session is attributed to it. First pause is free; extra pauses shave the reward; switching tabs mid-focus is logged and costs HP after the first; ending early keeps the log but forfeits the award."],
      ["Calendar", "Month/week grid for exams, deadlines, study blocks, lessons (weekly repeat supported) and personal events. Exams and deadlines drive the countdown widgets and in-app reminders — set the reminder threshold at the top."],
      ["Today's directives", "The auto-generated daily list on the home page: due cards, near deadlines and today's study blocks, plus anything you add yourself. Ticks earn XP."],
      ["Exams & Papers", "Log every exam, assessment and practice paper: marks, grade, what went well, what didn't, mistakes, and a reviewed checkbox. Topic-linked results feed the RAG flags."],
      ["Card Stats", "The flashcard analytics dashboard: reviews per day, due forecast, ease distribution, rating mix, and a per-topic breakdown sorted by lapses."],
      ["Recommended next", "The flagged-topics panel on the home and subject dashboards — your manual R/A/G plus the computed one, worst first. That's the app telling you what to study next."],
      ["Resources", "Each subject dashboard has a link table for reference sheets, textbook PDFs and useful sites, optionally tagged to a topic."]
    ]],
    ["The Behavioural Governor", [
      ["HP", "Health drains on days with zero study and when the due-card backlog piles up (past " + (KOS.governor ? KOS.governor.BACKLOG_LIMIT : 30) + "). Below 60 the enrichment layer (labs, sims, shop) suspends; below 30 you're in Recovery Mode. Core revision — spec, notes, cards, quizzes, exam Qs — never locks, ever."],
      ["Gold", "Earned from sessions, streak milestones, quiz scores ≥80% and clearing the due queue. Spent in the Governor's shop on permanent lab/sim unlocks and cosmetics (themes, kanji seals, avatar frames, bookshelf skins for the Books Physical tab, Shrine card styles). Prices were rebalanced in 3j around real earning rates — a big lab is about a week of steady study, small cosmetics two or three days."],
      ["XP & level", "A pure progress meter — it gates nothing except the avatar seal library, which unlocks by level. The HUD in the topbar shows avatar, level, gold, HP and XP at a glance; click it for the full panel."],
      ["Avatar", "Pick a procedural seal or upload your own image (auto-cropped to a circle and compressed before storing)."],
      ["Streaks", "Consecutive days with at least one completed session — overall and per subject. Early-stopped focus sessions don't count; everything else does."]
    ]],
    ["The Collection Matrix (Build 3a–3j)", [
      ["Collection Matrix", "The cross-media home: what you're currently consuming across every module, an “airing soon” list with live countdowns, aggregate charts, and the rest streak — consecutive days with at least one media log, fully independent of the study streak. All four modules are live: Anime, Books, Visual Novels and Games."],
      ["Anime vault", "Grid or list of your whole anime collection. Filter by status, genre or tag and search titles — all against database indexes, so 650 entries stay instant; cards render as you scroll. Click a card to edit everything; “+1 ep” on an in-progress card is the everyday logging action. Since 3f: airing entries carry a live “EP n · countdown” badge, and the watch-history heatmap below the vault mirrors Books' reading heatmap — same log, same chart."],
      ["Seasonal Watching (3f)", "Your vault one season at a time — defaults to today (device date onto AniList's own season calendar: Winter Jan–Mar, Spring Apr–Jun, Summer Jul–Sep, Fall Oct–Dec), and the season/year picker walks any past or future season. Next-episode countdowns on anything airing, and the palette follows the selected season (cool for winter, warm for summer). Season data comes from AniList sync/enrichment; manual or unenriched entries simply don't appear here — that's the honest scope. Airing times refresh when the view loads (plus a ⟳ button); there is no background polling."],
      ["AniList Profile (3f/3j)", "Your account behind the sync, in-app, split into five tabs — Overview (stats + charts), Favourites, Social (followers & following), Activity, Notifications — all served from ONE API request, cached a few minutes; switching tabs never refetches. Strictly read-only: viewing notifications here never marks them read on the site."],
      ["VNDB Profile (3j)", "The VN account behind the sync, built from what VNDB's API genuinely offers: your labels with live counts (custom labels included), your play-length vote contributions, list statistics from the synced vault, and the size of the database itself. What you won't find — favourites, followers, activity, notifications — doesn't exist in VNDB's API, and the page says so instead of showing empty panels."],
      ["Books vault", "Manga & light novels, dual-tracked on one entry: the digital reading half (status, chapters/volumes read, half-star rating — synced from AniList or manual) AND the physical half (each owned volume with condition, purchase date and price; the range tool adds a whole box set in one go). The card bar shows owned % in gold against read % in crimson. Extras: mood tags, custom shelves, DNF tracking, and the reading heatmap fed by your logs."],
      ["Bookshelf & Mangaka", "The Shelf layout renders your physically-owned volumes as spines — deterministic colours per series, or upload a custom cover for any volume. The Mangaka page groups every work by author (as-written name grouping) with aggregate owned/read stats."],
      ["Visual Novels vault", "VNDB fills the metadata (title, developer, cover, content tags as genres, length estimate); the tracking that matters is manual by design — VNDB has no structured route data, so the route list is yours to build, and a VN's progress IS its routes cleared. Since 3j there's also an optional chapters/parts layer — your own division of a VN's internal structure, parallel to routes (each chapter has the shared status and a note; most VNs just leave it empty). Plus: a CG counter (numbers only, never artwork), your own content-warning tags, and the quote log — any kept line can be sent to the flashcard system's Personal deck, where it joins the normal SM-2 schedule without being forced into a subject."],
      ["Sync & Import", "Three ways in: connect your AniList (one-time Client ID + token via their PIN page) for anime & manga; connect your VNDB (a personal token from vndb.org/u/tokens — simpler, no OAuth) for visual novels; or import the zero-setup AniList XML export and run the public enrichment. All paths feed the same vault, matched by AniList/MAL/VNDB id — no duplicates, and your physical volumes, routes, chapters, quotes and warnings always survive a sync."],
      ["Autonomous sync (3j)", "Once connected, the app keeps itself current in BOTH directions: local edits push automatically (as before), and your AniList + VNDB lists are pulled every 15 minutes, on coming back online, and when the tab wakes — so mal-sync marking an episode watched shows up here by itself. Progress a pull discovers was made elsewhere earns the normal XP/gold trickle, sized to what actually advanced; a per-entry watermark recognises echoes of this app's own pushes so nothing is ever rewarded twice, and progress that went DOWN (a rewatch, a correction) is never punished. Toggle + last-cycle report live on Sync & Import. Still last-write-wins between the app and the sites."],
      ["Write-back (3d)", "Editing a synced entry's status, progress or score pushes the change back to the connected account automatically — rapid edits (repeated +1) coalesce into one push, failures show a ⚠ chip on the card with one-tap retry, and every push lands in the Write activity log on Sync & Import. ONLY list state ever leaves the machine: the physical vault, mood, shelves, notes, quotes, routes, CG counts and content warnings are local by construction. Two plain-spoken limits: (1) it's last-write-wins — no conflict detection, so an edit made on the site between local edits just gets overwritten by whichever side writes last; (2) VNDB pushes currently fail because VNDB's CORS policy blocks browser PATCH requests (their side, not your token) — AniList push works fully."],
      ["Find new (3d)", "The ⊕ Find new button in each vault searches the whole external database (AniList for anime/manga, VNDB for VNs) — deliberately separate from the vault search box, which only filters what you already track. Pick a status on a result and it's created on your remote list and mirrored locally in one step; if the remote create can't happen (not connected, or VNDB's CORS wall), it's added locally with the external id kept so a later sync claims it instead of duplicating."],
      ["Games vault (3e)", "Manual-first, permanently and honestly: no game service lets a browser pull a library (Steam's data API blocks CORS, and Steam sign-in was tested live and abandoned — the OpenID verification response can't be read from a browser page, and verifying it would need a server this app deliberately doesn't have). The real quick-start is ▤ Bulk add: paste titles one per line — Steam's own library page copy-pastes cleanly — and each becomes a Planned draft to flesh out later. Games-only axes: completion tier (story complete / full completion / platinum / abandoned — finer than the shared status), platform, manual playtime (a game's progress IS its hours, so “+1 hr” is the everyday log), backlog priority, publisher, and a hand-entered Steam App ID that gives a working store-page link. Analytics under the vault: tier/platform/genre breakdowns and the backlog burn-down — added vs finished per week, is the pile growing or shrinking."],
      ["The Shrine", "Everything you've marked ♥, ranked by your scores, across all modules. The hall of fame."],
      ["Governor boundary", "Logging media earns a small XP/gold trickle and feeds the rest streak; a sync that discovers progress made elsewhere logs ONE proportional reward per sync. HP is untouched in both directions — media days don't drain it, and can't heal it."]
    ]],
    ["Data & housekeeping", [
      ["Backup & Restore", "Study data lives in one localStorage JSON — export it regularly and when moving machines. Attached files and the Collection Matrix vault (media entries + the AniList/VNDB tokens) live separately in IndexedDB and are NOT in the backup file; the vault re-fills from a sync. Manual-only VN data (routes, quotes) has no cloud copy — treat the vault with care."],
      ["Autosave", "Every change saves automatically (the AUTOSAVE dot pulses). There is no save button anywhere."],
      ["Sample data", "Calendar events marked SAMPLE are placeholders — edit or delete them and add your real dates."]
    ]]
  ];

  KOS.views.help = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", { text: "Help & Guide" }),
      el("p", { class: "sub", text: "What everything is and how to use it — one short description per feature." })
    ]));
    SECTIONS.forEach(function (sec) {
      main.appendChild(el("h3", { class: "n-h", text: sec[0] }));
      var grid = el("div", { class: "help-grid" });
      sec[1].forEach(function (item) {
        grid.appendChild(el("div", { class: "help-card" }, [
          el("b", { text: item[0] }),
          el("p", { text: item[1] })
        ]));
      });
      main.appendChild(grid);
    });
    main.appendChild(el("p", { class: "sub", style: "margin-top:20px", text:
      "Shortcuts: /  search · Alt+← / Alt+→ (or Backspace)  history · Esc  close search/modals." }));
  };
})();
