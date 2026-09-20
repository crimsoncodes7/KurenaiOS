/* Kurenai OS — modules/anime.js
   The Anime module (Build 3a, deepened in 3f). A 1:1 MIRROR of the
   AniList anime list since the Collection mirror release: no manual
   add, no title/cover/metadata editing, no delete — every pull mirrors
   the list (mediadb.bulkUpsert replace.mirror), and the only writes the
   vault makes are list state (status, progress, score) which push back
   to AniList, plus the personal layer AniList has no field for
   (favourite, notes, tags, custom lists, cover position). Grid/list,
   filter by status/genre/tag, title search — plus, since 3f:
   - Seasonal Watching: the vault filtered to the CURRENT season, computed
     from the device date via calendar quarters onto AniList's own enum
     (WINTER Jan–Mar, SPRING Apr–Jun, SUMMER Jul–Sep, FALL Oct–Dec).
     Entries without season data (manual, unenriched, unlinked) simply
     don't appear — accepted limitation, stated in the view.
   - Airing countdowns: live nextAiringEpisode data (verified shape:
     airingAt unix seconds + episode), fetched on view load and cached in
     MEMORY only — airing schedules are live data, never vault data. No
     background polling; a manual refresh supplements the on-load fetch.
   - Watch-history heatmap: the same sessions log that backs the rest
     streak, filtered to module:"anime", drawn with KOS.charts.heatmap —
     the 3b helper, not a reimplementation.

   Scale rules (650 real entries):
   - every filter runs through KOS.mediadb.query, which walks the narrowest
     IndexedDB index — never an in-memory scan of a cached array;
   - the DOM never holds every card at once: results render in batches of
     BATCH via an IntersectionObserver sentinel at the bottom of the grid;
   - cover <img>s are loading="lazy" and fall back to a kanji placeholder
     offline — online is strictly additive.                                 */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var BATCH = 60;
  var STATUSES = ["inProgress", "planned", "onHold", "completed", "dropped"];

  /* ================= season + airing domain (Build 3f, exposed as KOS.anime) ================= */
  /* Calendar quarters onto AniList's season enum — their own convention. */
  var SEASONS = ["WINTER", "WINTER", "WINTER", "SPRING", "SPRING", "SPRING",
                 "SUMMER", "SUMMER", "SUMMER", "FALL", "FALL", "FALL"];
  /* Each season carries one piece of scenery art for the Seasonal hero —
     found by browsing for the picture that best says the season, hot-
     linked from safebooru (which serves cross-origin) in two sizes so a
     phone loads the 850px sample and a desktop the full frame. `credit`
     names the artist as tagged there. */
  var SEASON_META = {
    WINTER: { label: "Winter", kanji: "冬", cls: "s-winter", credit: "niko_p",
      art: "https://safebooru.org/images/1323/c3ac6320262aea767e893d98837f904aac931a67.jpg",
      artSmall: "https://safebooru.org/samples/1323/sample_c3ac6320262aea767e893d98837f904aac931a67.jpg",
      artWidth: 1519, focus: "50% 60%" },
    SPRING: { label: "Spring", kanji: "春", cls: "s-spring", credit: "kagumanikusu",
      art: "https://safebooru.org/images/2416/000c9d43d083a39e792be2a913cee24a023d333a.png",
      artSmall: "https://safebooru.org/samples/2416/sample_000c9d43d083a39e792be2a913cee24a023d333a.jpg",
      artWidth: 1535, focus: "50% 40%" },
    SUMMER: { label: "Summer", kanji: "夏", cls: "s-summer", credit: "liuying_jp",
      art: "https://safebooru.org/images/3947/927599d841985b79557210bea2e2c4ad99999f3d.jpg",
      artSmall: "https://safebooru.org/samples/3947/sample_927599d841985b79557210bea2e2c4ad99999f3d.jpg",
      artWidth: 1920, focus: "50% 35%" },
    FALL:   { label: "Fall",   kanji: "秋", cls: "s-fall", credit: "kamo_nasus",
      art: "https://safebooru.org/images/3140/eb447f39a1d0b6843f08aabcb6a26aaa67fadea1.png",
      artSmall: "https://safebooru.org/samples/3140/sample_eb447f39a1d0b6843f08aabcb6a26aaa67fadea1.jpg",
      artWidth: 1920, focus: "50% 45%" }
  };
  function currentSeason(date) {
    var d = date || new Date();
    return { season: SEASONS[d.getMonth()], year: d.getFullYear() };
  }
  function fmtCountdown(secs) {
    if (secs == null) return "";
    if (secs <= 0) return "airing now";
    var d = Math.floor(secs / 86400), h = Math.floor((secs % 86400) / 3600), m = Math.floor((secs % 3600) / 60);
    if (d >= 1) return d + "d " + h + "h";
    if (h >= 1) return h + "h " + m + "m";
    return m + "m";
  }

  /* In-memory airing cache — live data, deliberately NOT in the vault.
     Refreshed whenever the Anime module / Seasonal view / Matrix home
     loads (TTL guards rapid navigation against the 30 req/min limit);
     the ⟳ button forces. Candidates: synced/linked entries that could
     plausibly be airing — inProgress, or planned from the last year — so
     the Seasonal view (every status) can count down a planned title too;
     the overview's schedule and the notification feed read the
     in-progress rows only. */
  var TTL = 10 * 60 * 1000;
  var airing = { at: 0, byId: {} };
  function airingCandidates(rows, now) {
    var yr = currentSeason(now).year;
    return rows.filter(function (e) {
      if (!e.externalIds || !e.externalIds.anilistId) return false;
      if (e.status === "inProgress") return true;
      return e.status === "planned" && e.extra && e.extra.seasonYear >= yr - 1;
    }).slice(0, 150).map(function (e) { return e.externalIds.anilistId; });
  }
  function refreshAiring(force, cb) {
    cb = cb || function () {};
    if (!force && Date.now() - airing.at < TTL) { cb(null, airing.byId, true); return; }
    if (!KOS.mediadb.available()) { cb(null, airing.byId, true); return; }
    KOS.mediadb.query({ module: "anime" }, function (err, rows) {
      if (err) { cb(err, airing.byId, true); return; }
      var ids = airingCandidates(rows, new Date());
      if (!ids.length) { airing.at = Date.now(); airing.byId = {}; cb(null, {}, false); return; }
      KOS.anilist.fetchAiring(ids, function (err2, byId) {
        if (err2) { cb(err2, airing.byId, true); return; }
        airing.at = Date.now();
        airing.byId = byId;
        /* the notification centre remembers the next episode of every
           watched title, so the moment it airs is announced */
        if (KOS.notify) KOS.notify.recordAiring(byId, rows);
        cb(null, byId, false);
      });
    });
  }
  function airingInfo(e) {
    var id = e.externalIds && e.externalIds.anilistId;
    return (id && airing.byId[id]) || null;
  }
  /* every airing entry of the vault, next episode first — the Matrix
     home's "airing soon" list reads this straight off the cache */
  function airingList(rows) {
    return rows
      .map(function (e) { var a = airingInfo(e); return a ? { entry: e, airing: a } : null; })
      .filter(Boolean)
      .sort(function (x, y) { return x.airing.airingAt - y.airing.airingAt; });
  }

  KOS.anime = {
    currentSeason: currentSeason,
    SEASON_META: SEASON_META,
    fmtCountdown: fmtCountdown,
    refreshAiring: refreshAiring,
    airingInfo: airingInfo,
    airingList: airingList,
    airingCandidates: airingCandidates,
    _airingCache: airing
  };

  function prefs() {
    var m = store.state.media = store.state.media ||
      { layout: "grid", sort: "updated" };
    return m;
  }

  /* ---------------- little shared bits (toolkit: medview.js) ---------------- */
  /* one grammar for progress across the whole app (audit MTX-6/U-30) —
     "36 / 96 ep", never a second local spacing convention */
  function progressText(e) { return KOS.media.progressText(e); }
  function cover(e, mod) { return KOS.medview.cover(e, mod.kanji); }
  /* the 3f airing badge — only exists when the live cache knows the entry */
  function airingChip(e) {
    var a = airingInfo(e);
    if (!a) return null;
    return el("span", { class: "med-chip an-airing",
      title: "Episode " + a.episode + " airs " + new Date(a.airingAt * 1000).toLocaleString(),
      text: "EP " + a.episode + " · " + fmtCountdown(a.timeUntilAiring) });
  }

  /* +1 episode — the everyday logging action (shared bump, mode "progress") */
  function bumpProgress(e, done) { KOS.medview.bumpUnit(e, "progress", done); }

  /* ---------------- the record editor (mirror) ----------------
     AniList owns the record: title, artwork, episode count, genres and
     dates are shown, not edited, and there is no Delete — removing a
     title happens on AniList and the next pull mirrors it. What CAN be
     changed is list state (status, episodes seen, score — pushed back)
     and the personal layer AniList has no field for. */
  function editorModal(entry, onSaved) {
    var mv = KOS.medview;
    if (!entry || entry.id == null) {
      KOS.ui.toast("Anime is a 1:1 mirror of AniList — add the title there, or use Find new titles.", true);
      return null;
    }
    var e = mv.editDraft(entry, "anime");
    var pushBefore = KOS.mediapush.snapshot(e);
    var mod = KOS.media.module(e.module);
    var field = mv.field, splitList = mv.splitList;

    var status = el("select", { class: "status-sel" }, STATUSES.map(function (s) {
      return el("option", { value: s, text: KOS.media.STATUS_LABEL[s] });
    }));
    status.value = e.status;
    var cur = el("input", { type: "number", class: "todo-in med-num", min: "0", max: e.progress.total != null ? String(e.progress.total) : null, value: String(e.progress.current || 0) });
    var score = el("input", { type: "number", class: "todo-in med-num", min: "0", max: "10", step: "0.5", value: String(e.score || 0) });
    var tags = el("input", { type: "text", class: "todo-in", value: e.tags.join(", "), placeholder: "comfort, rewatch…" });
    /* the cover URL is AniList's; only its POSITION (and an optional local
       replacement image, display intent per invariant 26c) is yours */
    var coverU = el("input", { type: "hidden", value: e.coverUrl || "" });
    var coverPosition = mv.coverPositionControl(e, coverU, { allowUpload: true });
    var fav = el("input", { type: "checkbox" });
    fav.checked = e.favourite;
    var notes = el("textarea", { class: "note-area", rows: 3, placeholder: "Notes…" });
    notes.value = e.notes || "";

    /* a read-only AniList fact — omitted when AniList has none (invariant 77:
       an empty supporting fact is not printed as a dash) */
    function ro(label, text, cls) {
      return text ? field(label, el("div", { class: "med-ro", text: String(text) }), cls) : null;
    }
    function save() {
      var oldStatus = e.status;
      e.status = status.value;
      e.progress.current = Math.max(0, parseInt(cur.value, 10) || 0);
      if (e.progress.total) e.progress.current = Math.min(e.progress.total, e.progress.current);
      e.score = Math.max(0, Math.min(10, parseFloat(score.value) || 0));
      e.tags = splitList(tags.value);
      e.coverUrl = coverPosition.sourceFor() || e.coverUrl;
      e.coverCrop = coverPosition.cropFor(e.coverUrl);
      e.favourite = fav.checked;
      e.notes = notes.value;
      mv.saveEntry(e, {
        isNew: false, pushBefore: pushBefore,
        activity: function (rec) { return oldStatus !== rec.status ? "status" : null; },
        close: function () { overlay.close(); }, onSaved: onSaved
      });
    }

    var x = e.extra || {};
    var overlay = mv.editorModal({
      isNew: false, label: mod.label, className: "med-mirror-modal",
      subtitle: "mirrored from AniList — status, episodes and score push back; everything else is AniList's",
      form: [
        mv.editorSection("identity", "Record", "As AniList has it. Change the title or artwork there and the next pull brings it over.", [
          ro("Title", e.title, "med-span-2"),
          x.titleRomaji && x.titleRomaji !== e.title ? ro("Romaji", x.titleRomaji, "med-span-2") : null,
          ro("Format", x.format),
          ro("Season", x.season ? x.season.charAt(0) + x.season.slice(1).toLowerCase() + (x.seasonYear ? " " + x.seasonYear : "") : null),
          ro("Studio", x.studio),
          ro("Genres", e.genres.join(", "), "med-span-2"),
          ro("Started", e.dates.started),
          ro("Finished", e.dates.finished)
        ]),
        mv.editorSection("progress", "List state", "Yours to change — pushed to AniList when you save.", [
          field("Status", status),
          field("Episodes seen" + (e.progress.total ? " / " + e.progress.total : ""), cur),
          field("Score /10", score)
        ]),
        mv.editorSection("personal", "Your layer", "Not on AniList — kept here, on every device.", [
          field("Favourite ♥", el("span", { class: "med-favwrap" }, [fav])),
          field("Tags", tags),
          field("Cover position", el("div", { class: "image-field" }, [coverPosition.node]), "med-span-2"),
          field("Custom lists", mv.customListChips(e), "med-span-2"),
          field("Notes", notes, "med-span-2")
        ]),
        mv.editorSection("source", "Source & sync", "Where this record comes from.", [
          mv.sourceInfo(e, "AniList", "A 1:1 mirror: removed on AniList means removed here on the next pull. Status, progress and score push back within seconds of a change.")
        ])
      ],
      onSave: save,
      onDelete: null,
      focus: status
    });
    return overlay;
  }
  /* the generic base editor — KOS.mediaEditor (core/media.js) dispatches
     by module and falls back to this one */
  KOS.mediaEditors.anime = editorModal;

  /* ---------------- cards ---------------- */
  function gridCard(e, mod, rerender) {
    /* Phase F: the card is NOT a button. It contained the favourite
       toggle, a status <select> and "+1" — an ARIA button may not hold
       interactive descendants, and a keyboard user who pressed Space on
       it scrolled the page. The card keeps its pointer shortcut; the
       TITLE is the real control, so the tab order reads
       favourite → title → status → +1 and a screen reader announces the
       entry by name instead of "button". */
    /* the score rides the cover's top-left corner (the ♥ has the right);
       the hover row is status + "+1", one line, never clipped */
    var card = el("div", { class: "med-card",
      onclick: function () { editorModal(e, rerender); }
    }, [
      cover(e, mod),
      KOS.medview.quickScore(e, rerender, { corner: true }),
      el("button", { class: "med-fav" + (e.favourite ? " on" : ""), title: "Favourite — appears in the Shrine",
        "aria-label": "Toggle favourite", text: "♥", onclick: function (ev) {
          ev.stopPropagation();
          e.favourite = !e.favourite;
          KOS.mediadb.put(e, function () {});
          ev.target.classList.toggle("on", e.favourite);
        } }),
      el("div", { class: "med-card-body" }, [
        el("button", { type: "button", class: "med-title", title: e.title, text: e.title,
          onclick: function (ev) { ev.stopPropagation(); editorModal(e, rerender); } }),
        el("div", { class: "med-meta" }, [
          airingChip(e),
          el("span", { class: "med-prog", text: progressText(e) }),
          KOS.medview.pushChip(e, rerender)
        ]),
        KOS.medview.quickRow(e, rerender, {
          unit: mod.unit, title: "Log the next " + mod.unitName.replace(/s$/, ""),
          onBump: e.status === "inProgress" ? function () { bumpProgress(e, rerender); } : null
        })
      ])
    ]);
    /* the shared bar — half full and fading when the series is still
       releasing (no total yet), the honest fraction otherwise */
    var track = KOS.media.progressBar(e);
    if (track) card.appendChild(track);
    return card;
  }
  function listRow(e, mod, rerender) {
    return KOS.medview.listRow(e, mod, rerender, {
      genres: e.genres.slice(0, 3).join(" · "),
      chips: [airingChip(e)],
      prog: progressText(e),
      onBump: e.status === "inProgress" ? function () { bumpProgress(e, rerender); } : null,
      open: function () { editorModal(e, rerender); }
    });
  }

  /* ---------------- the view ---------------- */
  KOS.views.anime = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var mod = KOS.media.module("anime");
    var p = prefs();
    var mv = KOS.medview;

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "Collection · 映" }),
        el("h1", { text: "Anime" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "Your AniList anime list, mirrored — what you're watching, what's waiting, and what the season is doing." })
        ])
      ])
    ]));

    if (mv.unavailable(main)) return;

    /* Build 4.0: the per-module spotlight hero (medview.heroCard) */
    var heroHolder = el("div", { class: "vh-holder" });
    main.appendChild(heroHolder);

    /* toolbar — the shared pieces come from the medview toolkit */
    var search = mv.searchInput("Search anime titles");
    var genreSel = el("select", { class: "status-sel", "aria-label": "Filter by genre" });
    var tagSel = el("select", { class: "status-sel", "aria-label": "Filter by tag" });
    var sortSel = mv.sortSelect(p.sort);
    var rail = mv.filterRail("anime", function () { refresh(); });
    var layoutBtn = mv.layoutToggle(p, function () { refresh(); });

    var mainCol = el("div", { class: "med-main" });
    /* the shared toolbar (Category 7 Phase D): search + sort + layout
       visible, facets behind Filters ▾, commands behind Actions ▾ */
    var bar = mv.toolbar({
      label: "Anime vault controls",
      search: search, sort: sortSel, layout: layoutBtn,
      filters: [
        mv.selFacet("Genre", genreSel, refresh),
        mv.selFacet("Tag", tagSel, refresh)
      ],
      onClear: refresh,
      actions: [
        { heading: "This season" },
        { label: "Seasonal watching", glyph: KOS.anime.SEASON_META[KOS.anime.currentSeason().season].kanji,
          hint: "Everything airing now, with countdowns", onSelect: function () { KOS.show("seasonal"); } },
        { heading: "This vault" },
        { label: "The numbers", glyph: "◫", hint: "Composition, taste and pace",
          onSelect: function () { mv.statsModal("anime", mod); } },
        { label: "Find new titles…", glyph: "⊕", hint: "Search all of AniList, not your vault",
          onSelect: function () { KOS.mediaSearch.open("anime", refreshAll); } },
        { heading: "AniList" },
        { label: "Your profile", glyph: "＠", hint: "Stats, favourites, activity",
          onSelect: function () { KOS.show("aniprofile"); } },
        { label: "Sync & Import", glyph: "⇅", onSelect: function () { KOS.show("mediasync"); } }
      ],
      /* the one way in is AniList: Find new titles creates THERE first */
      primary: el("button", { class: "btn primary", text: "⊕ Find new", title: "Search all of AniList — the title is added to your AniList list, then mirrored here",
        onclick: function () { KOS.mediaSearch.open("anime", refreshAll); } })
    });
    mainCol.appendChild(bar.root);
    main.appendChild(el("div", { class: "med-layout" }, [rail.root, mainCol]));

    /* a mutation (add/edit/quick-edit) can change list/status membership, so
       reload the rail counts too; a plain filter/search change does not */
    function refreshAll() { rail.reload(); refresh(); }

    /* countLine + holder + sentinel + the lazy batch renderer */
    var area = mv.resultsArea(mainCol, function (e) {
      return p.layout === "list" ? listRow(e, mod, refreshAll) : gridCard(e, mod, refreshAll);
    });

    /* Facet fill from the vault's OWN rows, with counts (audit VLT-8):
       a facet you cannot size is a facet you cannot use, and `distinct`
       walks every module's index rather than this one's. */
    KOS.mediadb.query({ module: "anime" }, function (err, rows) {
      if (err) return;
      mv.fillFacetSel(genreSel, mv.tallyFacet(rows, "genres"), "All genres");
      mv.fillFacetSel(tagSel, mv.tallyFacet(rows, "tags"), "All tags", { genreLabel: "Common tags", tagLabel: "Other tags" });
    });

    function refresh() {
      bar.sync();
      /* claim the render generation before the query so a slow result for a
         filter you already left can never paint over the current one */
      var token = area.begin();
      KOS.mediadb.query({
        module: "anime", status: rail.status() || undefined,
        customList: rail.customList() || undefined,
        genre: genreSel.value || undefined, tag: tagSel.value || undefined,
        search: search.value.trim() || undefined, sort: sortSel.value
      }, function (err, rows) {
        if (!area.current(token)) return;
        area.holder.className = p.layout === "list" ? "med-list" : "med-grid";
        if (err) {
          area.clear();
          area.countLine.textContent = "Query failed: " + err.message;
          return;
        }
        area.countLine.textContent = rows.length + (rows.length === 1 ? " entry" : " entries") +
          (rail.status() || rail.customList() || genreSel.value || tagSel.value || search.value ? " (filtered)" : "");
        if (!rows.length) {
          area.clear();
          area.holder.appendChild(mv.emptyState(
            search.value || rail.status() || rail.customList() || genreSel.value || tagSel.value
              ? "Nothing matches this filter."
              : "The vault is a mirror of your AniList anime list. Connect AniList and the whole list lands in one sync.",
            [
              el("button", { class: "btn primary", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }),
              el("button", { class: "btn", text: "⊕ Find new", onclick: function () { KOS.mediaSearch.open("anime", refreshAll); } })
            ]));
          return;
        }
        area.start(rows);
      });
    }

    /* the facet selects are wired by mv.selFacet inside the toolbar — a
       second listener here would run every query twice */
    search.addEventListener("input", KOS.ui.debounce(refresh, 220));
    sortSel.addEventListener("change", function () { p.sort = sortSel.value; store.save(); refresh(); });

    function mountHero() { mv.heroCard(heroHolder, "anime", mod, function () { refreshAll(); mountHero(); }); }
    mountHero();
    refresh();
    /* airing badges (3f): render immediately from the cache, kick a live
       refresh, repaint once when fresh data lands (never a polling loop) */
    KOS.anime.refreshAiring(false, function (err, byId, fromCache) {
      if (!err && !fromCache && document.body.contains(area.holder)) refresh();
    });
  };

  /* ================= watch-history heatmap (Build 3f) ================= */
  /* Books' heatmapCard, retargeted: same sessions log, same chart helper. */
  function watchHeatmapCard(weeks) {
    var today = KOS.srs.todayISO();
    var span = weeks * 7;
    var byDay = {};
    KOS.sessions.all().forEach(function (s) {
      if (s.type === "media" && s.metrics && s.metrics.module === "anime") {
        byDay[s.date] = (byDay[s.date] || 0) + 1;
      }
    });
    var days = [], total = 0;
    for (var i = span - 1; i >= 0; i--) {
      var d = KOS.srs.addDays(today, -i);
      var n = byDay[d] || 0;
      total += n;
      days.push({ date: d, value: n, hint: d + ": " + n + (n === 1 ? " watch log" : " watch logs") });
    }
    return KOS.charts.chartCard("Watch history", total + " logs in " + weeks + " weeks — episodes, status changes and adds",
      KOS.charts.heatmap(days, { color: "#B85C50" }));
  }
  KOS.anime.watchHeatmapCard = watchHeatmapCard;

  /* ================= Seasonal Watching (Build 3f + 3j picker) ================= */
  /* The vault filtered to ONE season — every status, defaulting to the
     current season (device date mapped onto AniList's enum by calendar
     quarter), with a season + year picker (3j) to walk any past or future
     season: the same view, the same extra.season/seasonYear data the sync
     already carries, just a different filter value. Watching first with
     its countdowns, then the rest A–Z — the overview's schedule is the
     watching-only surface, this page is the season as a whole. The
     palette follows the SELECTED season via the s-* CSS classes, and the
     hero carries that season's scenery: the shipped art
     (SEASON_META.art) or a picture of your own, kept in the media kv
     store as "hero.season.<SEASON>" (invariant 30's home for hero art). */
  var SEASON_ORDER = ["WINTER", "SPRING", "SUMMER", "FALL"];
  KOS.views.seasonal = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var mod = KOS.media.module("anime");
    var now = currentSeason();
    var sel = { season: now.season, year: now.year };   // default: today

    var wrap = el("div", { class: "season-view " + SEASON_META[sel.season].cls });
    main.appendChild(wrap);

    var heroTitle = el("h1", {});
    var heroArt = el("img", { class: "season-art", alt: "", "aria-hidden": "true", decoding: "async", sizes: "100vw" });
    var heroCredit = el("span", { class: "season-credit" });
    var heroCount = el("span", { class: "season-hero-count" });
    var heroNode = el("div", { class: "lab-h season-hero" });
    /* the art menu: your own picture (upload or URL, positioned with the
       shared cropper — invariant 26c) or back to the shipped scenery */
    var artMenu = KOS.ui.menu({ label: "Art", className: "btn ghost season-art-btn", hint: "Change this season's picture",
      items: [
        { label: "Choose a picture…", glyph: "✎", hint: "Upload or paste a URL, then position it", onSelect: function () { editArt(); } },
        { label: "Use the shipped scenery", glyph: "↺", onSelect: function () { setCustomArt(null); } }
      ] });
    heroNode.appendChild(heroArt);
    heroNode.appendChild(el("div", { class: "season-hero-scrim", "aria-hidden": "true" }));
    heroNode.appendChild(el("div", { class: "season-hero-body" }, [
      el("span", { class: "dh-kicker season-hero-kicker", text: "Seasonal watching" }),
      heroTitle,
      el("p", { class: "sub", text: "Everything you have from the season — what you're watching first, with live countdowns to the next episode." }),
      heroCount
    ]));
    heroNode.appendChild(el("div", { class: "season-hero-tools" }, [heroCredit, artMenu]));
    wrap.appendChild(heroNode);

    var customArt = {};   // SEASON → { source, crop } | null, read from kv on first use
    function artKey(season) { return "hero.season." + season; }
    function loadCustomArt(season, cb) {
      if (customArt[season] !== undefined) { cb(customArt[season]); return; }
      KOS.mediadb.getKV(artKey(season), function (err, v) {
        customArt[season] = (!err && v && v.source) ? { source: v.source, crop: KOS.imageCrop.normalise(v.crop) } : null;
        cb(customArt[season]);
      });
    }
    function setCustomArt(v) {
      customArt[sel.season] = v;
      var done = function () { heroArt.removeAttribute("data-season"); paintArt(); };
      if (v) KOS.mediadb.setKV(artKey(sel.season), v, done);
      else KOS.mediadb.delKV(artKey(sel.season), done);
    }
    function editArt() {
      var meta = SEASON_META[sel.season];
      var cur = customArt[sel.season];
      KOS.imageCrop.open({
        title: "Picture for " + meta.label,
        description: "A wide picture works best — it sits behind the season title on every " + meta.label + " page.",
        source: cur ? cur.source : "", crop: cur ? cur.crop : null,
        aspect: 16 / 6, allowUrl: true, allowUpload: true,
        fileOptions: { maxWidth: 1800, maxHeight: 700, maxBytes: 700 * 1024, quality: 0.84 },
        removeLabel: "Back to the shipped scenery",
        onRemove: cur ? function () { setCustomArt(null); } : null,
        onSave: function (result) { setCustomArt({ source: result.source, crop: result.crop }); }
      });
    }
    /* paints whichever art the season has: yours from kv (through the
       shared crop vars), else the shipped scenery — its 850px sample as
       the hero's background at once, so the full frame (up to 2.5 MB)
       fades in over a picture, not a void */
    function paintArt() {
      var meta = SEASON_META[sel.season];
      if (heroArt.getAttribute("data-season") === sel.season) return;
      heroArt.setAttribute("data-season", sel.season);
      loadCustomArt(sel.season, function (custom) {
        if (custom) {
          heroArt.removeAttribute("srcset");
          heroArt.style.objectPosition = "";
          heroArt.src = custom.source;
          KOS.imageCrop.apply(heroArt, custom.crop);
          heroNode.style.setProperty("--season-art", "url(\"" + custom.source + "\")");
          heroNode.style.setProperty("--season-art-pos", custom.crop.x + "% " + custom.crop.y + "%");
          heroCredit.textContent = "your picture";
          return;
        }
        heroArt.classList.remove("crop-media");
        heroArt.srcset = meta.artSmall + " 850w, " + meta.art + " " + meta.artWidth + "w";
        heroArt.src = meta.artSmall;
        heroArt.style.objectPosition = meta.focus || "50% 50%";
        heroNode.style.setProperty("--season-art", "url(\"" + meta.artSmall + "\")");
        heroNode.style.setProperty("--season-art-pos", meta.focus || "50% 50%");
        heroCredit.textContent = meta.credit ? "art · " + meta.credit : "";
      });
    }

    if (KOS.medview.unavailable(wrap)) return;

    /* ---- the picker (3j) ---- */
    var seasonSel = el("select", { class: "status-sel", "aria-label": "Season" },
      SEASON_ORDER.map(function (s) {
        return el("option", { value: s, text: SEASON_META[s].kanji + " " + SEASON_META[s].label });
      }));
    var yearIn = el("input", { type: "number", class: "todo-in season-yr", min: "1960", max: String(now.year + 2),
      "aria-label": "Year" });
    function stepSeason(dir) {
      var i = SEASON_ORDER.indexOf(sel.season) + dir;
      if (i < 0) { i = SEASON_ORDER.length - 1; sel.year--; }
      if (i >= SEASON_ORDER.length) { i = 0; sel.year++; }
      sel.season = SEASON_ORDER[i];
      applySelection();
    }
    var todayBtn = el("button", { class: "btn", text: "◎ Today", title: "Back to the current season", onclick: function () {
      sel = { season: currentSeason().season, year: currentSeason().year };
      applySelection();
    } });
    function applySelection() {
      seasonSel.value = sel.season;
      yearIn.value = String(sel.year);
      var meta = SEASON_META[sel.season];
      wrap.className = "season-view " + meta.cls;
      heroTitle.innerHTML = "";
      heroTitle.appendChild(el("span", { class: "kanji-inline season-kanji", text: meta.kanji }));
      heroTitle.appendChild(document.createTextNode(" " + meta.label + " " + sel.year));
      paintArt();
      var isNow = sel.season === currentSeason().season && sel.year === currentSeason().year;
      todayBtn.style.display = isNow ? "none" : "";
      render();
    }
    seasonSel.addEventListener("change", function () { sel.season = seasonSel.value; applySelection(); });
    yearIn.addEventListener("change", function () {
      var y = parseInt(yearIn.value, 10);
      if (!isNaN(y)) sel.year = Math.max(1960, Math.min(now.year + 2, y));
      applySelection();
    });

    var refreshedLine = el("p", { class: "sub med-count" });
    var refreshBtn = el("button", { class: "btn", text: "⟳ Refresh airing", title: "Airing times refresh automatically when this view loads — this forces it", onclick: function () {
      refreshBtn.disabled = true;
      refreshBtn.textContent = "⟳ Refreshing…";
      KOS.anime.refreshAiring(true, function (err) {
        refreshBtn.disabled = false;
        refreshBtn.textContent = "⟳ Refresh airing";
        if (err) { KOS.ui.toast(err.message, true); return; }
        render();
      });
    } });
    wrap.appendChild(el("div", { class: "lab-controls season-picker" }, [
      el("button", { class: "btn", text: "‹", "aria-label": "Previous season", onclick: function () { stepSeason(-1); } }),
      seasonSel, yearIn,
      el("button", { class: "btn", text: "›", "aria-label": "Next season", onclick: function () { stepSeason(1); } }),
      todayBtn,
      el("span", { style: "flex:1" }),
      refreshBtn,
      el("button", { class: "btn", text: "映 Anime vault", onclick: function () { KOS.show("anime"); } }),
      el("button", { class: "btn", text: "← Collection Matrix", onclick: function () { KOS.show("matrix"); } })
    ]));
    wrap.appendChild(refreshedLine);

    var holder = el("div", { class: "med-grid" });
    wrap.appendChild(holder);

    function render() {
      var meta = SEASON_META[sel.season];
      KOS.mediadb.query({ module: "anime" }, function (err, rows) {
        holder.innerHTML = "";
        if (err) { refreshedLine.textContent = "Query failed: " + err.message; return; }
        var seasonal = rows.filter(function (e) {
          return e.extra && e.extra.season === sel.season && e.extra.seasonYear === sel.year;
        });
        /* airing entries first, soonest episode first; then the rest of
           what is being watched, then everything else A–Z (past seasons
           naturally have nothing airing → watching, then A–Z) */
        var known = airingList(seasonal).map(function (x) { return x.entry; });
        var knownIds = {};
        known.forEach(function (e) { knownIds[e.id] = true; });
        var byTitle = function (a, b) { return a.titleLower < b.titleLower ? -1 : 1; };
        var watching = seasonal.filter(function (e) { return !knownIds[e.id] && e.status === "inProgress"; }).sort(byTitle);
        var rest = seasonal.filter(function (e) { return !knownIds[e.id] && e.status !== "inProgress"; }).sort(byTitle);
        var list = known.concat(watching, rest);
        var nWatching = known.length + watching.length;
        heroCount.textContent = list.length
          ? list.length + (list.length === 1 ? " title" : " titles") + " from the season" +
            (nWatching ? " · watching " + nWatching : "") +
            (known.length ? " · " + known.length + " with a next episode scheduled" : "")
          : "";
        refreshedLine.textContent = airing.at && known.length
          ? "Airing data as of " + new Date(airing.at).toLocaleTimeString()
          : "";
        if (!list.length) {
          holder.appendChild(KOS.ui.emptyState({
            compact: true,
            className: "seasonal-empty",
            mark: "季",
            title: "No " + meta.label + " " + sel.year + " titles in this vault",
            body: "Season data arrives with the AniList sync; whatever you have listed from a season — watching, planned or finished — appears here.",
            action: el("div", { class: "lab-controls seasonal-empty-actions" }, [
              el("button", { class: "btn primary", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }),
              el("button", { class: "btn gold", text: "⊕ Find new", onclick: function () { KOS.mediaSearch.open("anime", render); } })
            ])
          }));
          return;
        }
        list.forEach(function (e) { holder.appendChild(gridCard(e, mod, render)); });
      });
    }

    applySelection();
    KOS.anime.refreshAiring(false, function (err, byId, fromCache) {
      if (!err && !fromCache && document.body.contains(holder)) render();
    });
  };
})();
