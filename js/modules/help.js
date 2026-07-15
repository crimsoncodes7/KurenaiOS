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
    ["The Collection Matrix", [
      ["Collection Matrix", "The cross-media home: what you're currently consuming across every module, an “airing soon” list with live countdowns, aggregate charts, and the rest streak — consecutive days with at least one media log, fully independent of the study streak. All four modules are live: Anime, Books, Visual Novels and Games."],
      ["Anime vault", "Grid or list of your whole anime collection. Filter by status, genre or tag and search titles — all against database indexes, so 650 entries stay instant; cards render as you scroll. Click a card to edit everything; “+1 ep” on an in-progress card is the everyday logging action. Since 3f: airing entries carry a live “EP n · countdown” badge, and the watch-history heatmap below the vault mirrors Books' reading heatmap — same log, same chart."],
      ["Seasonal Watching (3f)", "Your vault one season at a time — defaults to today (device date onto AniList's own season calendar: Winter Jan–Mar, Spring Apr–Jun, Summer Jul–Sep, Fall Oct–Dec), and the season/year picker walks any past or future season. Next-episode countdowns on anything airing, and the palette follows the selected season (cool for winter, warm for summer). Season data comes from AniList sync/enrichment; manual or unenriched entries simply don't appear here — that's the honest scope. Airing times refresh when the view loads (plus a ⟳ button); there is no background polling."],
      ["AniList Profile", "Your account behind the sync: Overview, Analytics, Favourites, Social, Activity and Notifications. The profile is read-only; viewing notifications here never marks them read on AniList."],
      ["VNDB Profile", "Your VN account behind the sync: profile identity, label statistics, play-length votes and collection analytics. VNDB does not expose favourites, followers, social activity or notifications, so those panels are deliberately absent."],
      ["Books vault", "Manga & light novels, dual-tracked on one entry: the digital reading half (status, chapters/volumes read, half-star rating — synced from AniList or manual) AND the physical half (each owned volume with condition, purchase date and price; the range tool adds a whole box set in one go). The card bar shows owned % in gold against read % in crimson. Extras: mood tags, custom shelves, DNF tracking, and the reading heatmap fed by your logs."],
      ["Bookshelf & Mangaka", "The Shelf layout renders your physically-owned volumes as spines — deterministic colours per series, or upload a custom cover for any volume. The Mangaka page groups every work by author (as-written name grouping) with aggregate owned/read stats."],
      ["Visual Novels vault", "VNDB fills the metadata (title, developer, cover, content tags as genres, length estimate); the tracking that matters is manual by design — VNDB has no structured route data, so the route list is yours to build, and a VN's progress IS its routes cleared. Since 3j there's also an optional chapters/parts layer — your own division of a VN's internal structure, parallel to routes (each chapter has the shared status and a note; most VNs just leave it empty). Plus: a CG counter (numbers only, never artwork), your own content-warning tags, and the quote log — any kept line can be sent to the flashcard system's Personal deck, where it joins the normal SM-2 schedule without being forced into a subject."],
      ["Sync & Import", "Three ways in: connect your AniList (one-time Client ID + token via their PIN page) for anime & manga; connect your VNDB (a personal token from vndb.org/u/tokens — simpler, no OAuth) for visual novels; or import the zero-setup AniList XML export and run the public enrichment. All paths feed the same vault, matched by AniList/MAL/VNDB id — no duplicates, and your physical volumes, routes, chapters, quotes and warnings always survive a sync."],
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
      ["Autosave", "Every change saves automatically (the AUTOSAVE dot pulses). There is no save button anywhere."],
      ["Sample data", "Calendar events marked SAMPLE are placeholders — edit or delete them and add your real dates."]
    ]]
  ];

  /* Keep the guide as a practical launch point. Entries without a route remain
     explanatory rather than pretending every help subject is a destination. */
  var RELATED = {
    "Overview": ["Open Home", "home"],
    "Subjects (rail)": ["Open Study", "subject", "compsci"],
    "Due Today": ["Open Due Today", "due"],
    "Focus Timer": ["Open Focus Timer", "focus"],
    "Calendar": ["Open Calendar", "calendar"],
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
    "Backup & Restore": ["Open Data & Backup", "data"]
  };
  function slug(value) { return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

  KOS.views.help = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "The manual" }),
        el("h1", { text: "Help & Guide" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "What everything is and how to use it. Search, or open a topic to read." })
        ])
      ])
    ]));

    /* Documentation desk: navigation, a deliberately narrow reading column,
       and a practical context rail on wide screens. */
    var wrap = el("div", { class: "help-wrap" });
    main.appendChild(wrap);
    var nav = el("nav", { class: "help-nav", "aria-label": "Guide sections" });
    var searchShell = el("div", { class: "help-search-shell" });
    var content = el("div", { class: "help-content" });
    var aside = el("aside", { class: "help-aside", "aria-label": "Guide context" });
    wrap.appendChild(nav);
    wrap.appendChild(searchShell);
    wrap.appendChild(content);
    wrap.appendChild(aside);

    var searchLabel = el("label", { class: "help-search-label", text: "Search the manual" });
    var search = el("input", { type: "search", class: "todo-in help-search", placeholder: "Search pages, study systems and shortcuts…", "aria-describedby": "help-search-hint" });
    searchShell.appendChild(searchLabel);
    searchShell.appendChild(search);
    searchShell.appendChild(el("span", { id: "help-search-hint", class: "help-search-hint", text: "Results expand automatically. Press Esc to clear the search." }));
    var list = el("div", { class: "help-list" });
    content.appendChild(list);

    var contextTitle = el("b", { text: "Getting around" });
    aside.appendChild(el("div", { class: "help-aside-card" }, [
      el("span", { class: "help-aside-kicker", text: "Guide context" }), contextTitle,
      el("p", { text: "Choose a section, scan the headings, then open only the detail you need." })
    ]));
    aside.appendChild(el("div", { class: "help-aside-card help-aside-shortcuts" }, [
      el("span", { class: "help-aside-kicker", text: "Useful shortcuts" }),
      el("div", {}, [el("kbd", { text: "/" }), el("span", { text: "Search the app" })]),
      el("div", {}, [el("kbd", { text: "Alt+← / →" }), el("span", { text: "Back / forward" })]),
      el("div", {}, [el("kbd", { text: "Esc" }), el("span", { text: "Close overlays" })])
    ]));

    function setDeepLink(id) {
      if (window.history && window.history.replaceState) window.history.replaceState(null, "", "#" + id);
    }
    function openRow(row, head, id) {
      row.classList.add("open"); head.setAttribute("aria-expanded", "true"); setDeepLink(id);
    }

    SECTIONS.forEach(function (sec, si) {
      var secId = "help-" + slug(sec[0]);
      nav.appendChild(el("button", { class: "help-nav-item" + (si === 0 ? " active" : ""), "data-si": String(si), "aria-current": si === 0 ? "true" : "false",
        onclick: function () {
          nav.querySelectorAll(".help-nav-item").forEach(function (b) { b.classList.remove("active"); b.setAttribute("aria-current", "false"); });
          this.classList.add("active"); this.setAttribute("aria-current", "true"); contextTitle.textContent = sec[0]; setDeepLink(secId);
          var target = document.getElementById(secId);
          if (target && target.scrollIntoView) target.scrollIntoView({ block: "start", behavior: "smooth" });
        } }, [sec[0]]));
    });

    SECTIONS.forEach(function (sec, si) {
      var secId = "help-" + slug(sec[0]);
      var block = el("section", { class: "help-block", id: secId, "data-sec": String(si) });
      block.appendChild(el("h2", { class: "help-block-h", text: sec[0] }));
      sec[1].forEach(function (item) {
        var rowId = secId + "-" + slug(item[0]);
        var body = el("div", { class: "help-row-body", id: rowId + "-detail" }, [el("p", { text: item[1] })]);
        var row = el("article", { class: "help-row", id: rowId, "data-q": (item[0] + " " + item[1]).toLowerCase() });
        var head = el("button", { class: "help-row-head", "aria-expanded": "false", onclick: function () {
          var open = row.classList.toggle("open");
          head.setAttribute("aria-expanded", String(open));
          if (open) setDeepLink(rowId);
        } }, [
          el("span", { class: "help-row-t", text: item[0] }),
          el("span", { class: "help-row-arr", "aria-hidden": "true", text: "▾" })
        ]);
        head.setAttribute("aria-controls", rowId + "-detail");
        var tools = el("div", { class: "help-row-tools" }, [
          el("a", { class: "help-deeplink", href: "#" + rowId, text: "Link", onclick: function () { setDeepLink(rowId); } }),
          RELATED[item[0]] ? el("button", { class: "help-related", text: RELATED[item[0]][0] + " →", onclick: function () { KOS.show(RELATED[item[0]][1], RELATED[item[0]][2]); } }) : null
        ].filter(Boolean));
        row.appendChild(head);
        row.appendChild(body);
        body.appendChild(tools);
        block.appendChild(row);
      });
      list.appendChild(block);
    });

    search.addEventListener("input", KOS.ui.debounce(function () {
      var q = search.value.trim().toLowerCase();
      list.querySelectorAll(".help-row").forEach(function (r) {
        var hit = !q || r.dataset.q.indexOf(q) !== -1;
        r.style.display = hit ? "" : "none";
        r.classList.toggle("open", !!q && hit);
        var head = r.querySelector(".help-row-head");
        if (head) head.setAttribute("aria-expanded", String(!!q && hit));
      });
      list.querySelectorAll(".help-block").forEach(function (b) {
        var any = [].some.call(b.querySelectorAll(".help-row"), function (r) { return r.style.display !== "none"; });
        b.style.display = any ? "" : "none";
      });
    }, 150));

    search.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && search.value) { search.value = ""; search.dispatchEvent(new Event("input")); search.focus(); }
    });

    if (location.hash && location.hash.indexOf("#help-") === 0) {
      var linked = document.getElementById(location.hash.slice(1));
      if (linked) {
        var linkedRow = linked.classList.contains("help-row") ? linked : null;
        if (linkedRow) openRow(linkedRow, linkedRow.querySelector(".help-row-head"), linkedRow.id);
        setTimeout(function () { linked.scrollIntoView({ block: "start" }); }, 0);
      }
    }

    main.appendChild(el("p", { class: "sub", style: "margin-top:20px", text:
      "Shortcuts: /  search · Alt+← / Alt+→ (or Backspace)  history · Esc  close search/modals." }));
  };
})();
