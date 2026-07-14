/* Kurenai OS — modules/anime.js
   The Anime module (Build 3a, deepened in 3f). Full CRUD, grid/list,
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
  var SEASON_META = {
    WINTER: { label: "Winter", kanji: "冬", cls: "s-winter" },
    SPRING: { label: "Spring", kanji: "春", cls: "s-spring" },
    SUMMER: { label: "Summer", kanji: "夏", cls: "s-summer" },
    FALL:   { label: "Fall",   kanji: "秋", cls: "s-fall" }
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
     plausibly be airing — inProgress, or planned from the last year. */
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
  function progressText(e, mod) {
    var c = e.progress.current || 0, t = e.progress.total;
    return c + (t ? "/" + t : "") + " " + mod.unit;
  }
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

  /* ---------------- the editor modal (create + edit) ---------------- */
  /* built on the shared medview editor shell — the working copy is a
     NORMALISED clone (aligned with books/vn/games; audit A11) */
  function editorModal(entry, onSaved) {
    var mv = KOS.medview;
    var isNew = !entry || entry.id == null;
    var e = mv.editDraft(entry, "anime");
    var pushBefore = KOS.mediapush.snapshot(e);
    var mod = KOS.media.module(e.module);
    var field = mv.field, splitList = mv.splitList;

    var title = el("input", { type: "text", class: "todo-in", value: e.title === "Untitled" && isNew ? "" : e.title, placeholder: "Title" });
    var status = el("select", { class: "status-sel" }, STATUSES.map(function (s) {
      return el("option", { value: s, text: KOS.media.STATUS_LABEL[s] });
    }));
    status.value = e.status;
    var cur = el("input", { type: "number", class: "todo-in med-num", min: "0", value: String(e.progress.current || 0) });
    var tot = el("input", { type: "number", class: "todo-in med-num", min: "0", placeholder: "?", value: e.progress.total != null ? String(e.progress.total) : "" });
    var score = el("input", { type: "number", class: "todo-in med-num", min: "0", max: "10", step: "0.5", value: String(e.score || 0) });
    var own = el("select", { class: "status-sel" }, [["digital", "Digital"], ["physical", "Physical"], ["steam", "Steam"], ["unset", "—"]].map(function (o) {
      return el("option", { value: o[0], text: o[1] });
    }));
    own.value = e.ownership;
    var started = el("input", { type: "date", class: "todo-in", value: e.dates.started || "" });
    var finished = el("input", { type: "date", class: "todo-in", value: e.dates.finished || "" });
    var genres = el("input", { type: "text", class: "todo-in", value: e.genres.join(", "), placeholder: "Drama, Romance…" });
    var tags = el("input", { type: "text", class: "todo-in", value: e.tags.join(", "), placeholder: "comfort, rewatch…" });
    var coverU = el("input", { type: "url", class: "todo-in", value: e.coverUrl || "", placeholder: "https://… (filled by sync/enrichment)" });
    var coverPosition = mv.coverPositionControl(e, coverU);
    var fav = el("input", { type: "checkbox" });
    fav.checked = e.favourite;
    var notes = el("textarea", { class: "note-area", rows: 3, placeholder: "Notes…" });
    notes.value = e.notes || "";

    function save() {
      if (!title.value.trim()) { KOS.ui.toast("A title is needed.", true); return; }
      var oldStatus = e.status;
      e.title = title.value.trim();
      e.status = status.value;
      e.progress.current = Math.max(0, parseInt(cur.value, 10) || 0);
      e.progress.total = tot.value === "" ? null : Math.max(0, parseInt(tot.value, 10) || 0) || null;
      e.score = Math.max(0, Math.min(10, parseFloat(score.value) || 0));
      e.ownership = own.value;
      e.dates.started = started.value || null;
      e.dates.finished = finished.value || null;
      e.genres = splitList(genres.value);
      e.tags = splitList(tags.value);
      e.coverUrl = coverPosition.sourceFor();
      e.coverCrop = coverPosition.cropFor(e.coverUrl);
      e.favourite = fav.checked;
      e.notes = notes.value;
      mv.saveEntry(e, {
        isNew: isNew, pushBefore: pushBefore,
        activity: function (rec) { return oldStatus !== rec.status ? "status" : null; },
        close: function () { overlay.close(); }, onSaved: onSaved
      });
    }

    var overlay = mv.editorModal({
      isNew: isNew, label: mod.label,
      subtitle: e.syncSource === "anilist" ? "synced from AniList — a Sync now overwrites list state, keeps your notes/tags" : e.syncSource === "import" ? "from XML import" : "manual entry",
      form: [
        el("div", { class: "med-form-row" }, [
          field("Title", title, "bk-grow"),
          field("Cover URL", el("div", { class: "image-field" }, [coverU, coverPosition.node]), "bk-grow")
        ]),
        el("div", { class: "med-form-row" }, [
          field("Status", status),
          field(mod.unitName + " done", cur),
          field("of (total)", tot),
          field("Score /10", score)
        ]),
        el("div", { class: "med-form-row" }, [
          field("Ownership", own),
          field("Started", started),
          field("Finished", finished),
          field("Favourite ♥", el("span", { class: "med-favwrap" }, [fav]))
        ]),
        field("Genres (comma-separated, shared taxonomy)", genres),
        field("Tags (comma-separated, shared taxonomy)", tags),
        field("Custom lists", mv.customListChips(e), "wl-notes-full"),
        field("Notes", notes, "wl-notes-full")
      ],
      onSave: save,
      onDelete: function () {
        mv.deleteEntry(e, "Delete “" + e.title + "” from the collection?",
          function () { overlay.close(); }, onSaved);
      },
      focus: title
    });
    return overlay;
  }
  /* the generic base editor — KOS.mediaEditor (core/media.js) dispatches
     by module and falls back to this one */
  KOS.mediaEditors.anime = editorModal;

  /* ---------------- cards ---------------- */
  function gridCard(e, mod, rerender) {
    var card = el("div", { class: "med-card", role: "button", tabindex: "0",
      onclick: function () { editorModal(e, rerender); },
      onkeydown: function (ev) { if (ev.key === "Enter") { ev.preventDefault(); editorModal(e, rerender); } }
    }, [
      cover(e, mod),
      el("button", { class: "med-fav" + (e.favourite ? " on" : ""), title: "Favourite — appears in the Shrine",
        "aria-label": "Toggle favourite", text: "♥", onclick: function (ev) {
          ev.stopPropagation();
          e.favourite = !e.favourite;
          KOS.mediadb.put(e, function () {});
          ev.target.classList.toggle("on", e.favourite);
        } }),
      el("div", { class: "med-card-body" }, [
        el("div", { class: "med-title", title: e.title, text: e.title }),
        el("div", { class: "med-meta" }, [
          airingChip(e),
          el("span", { class: "med-prog", text: progressText(e, mod) }),
          KOS.medview.pushChip(e, rerender)
        ]),
        el("div", { class: "med-meta med-quickrow" }, [
          KOS.medview.quickEdit(e, rerender),
          e.status === "inProgress" ? el("button", { class: "mini-btn med-plus", text: "+1 " + mod.unit,
            title: "Log the next " + mod.unitName.replace(/s$/, ""), onclick: function (ev) {
              ev.stopPropagation();
              bumpProgress(e, rerender);
            } }) : null
        ])
      ])
    ]);
    if (e.progress.total) {
      card.appendChild(el("div", { class: "subj-track med-track" }, [
        el("span", { class: "subj-fill", style: "width:" + Math.min(100, Math.round(100 * (e.progress.current || 0) / e.progress.total)) + "%" })
      ]));
    }
    return card;
  }
  function listRow(e, mod, rerender) {
    return KOS.medview.listRow(e, mod, rerender, {
      genres: e.genres.slice(0, 3).join(" · "),
      chips: [airingChip(e)],
      prog: progressText(e, mod),
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
          el("span", { class: "board", text: "What you're watching, what's waiting, and what the season is doing." })
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
    mainCol.appendChild(el("div", { class: "med-toolbar" }, [
      search, genreSel, tagSel, sortSel, layoutBtn,
      el("button", { class: "btn", text: KOS.anime.SEASON_META[KOS.anime.currentSeason().season].kanji + " Seasonal",
        title: "Everything airing this season, with countdowns", onclick: function () { KOS.show("seasonal"); } }),
      el("button", { class: "btn", text: "＠ Profile", title: "Your AniList profile — stats, favourites, activity",
        onclick: function () { KOS.show("aniprofile"); } }),
      el("button", { class: "btn", text: "◫ Stats", title: "This vault, in numbers", onclick: function () { mv.statsModal("anime", mod); } }),
      el("button", { class: "btn", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }),
      el("button", { class: "btn gold", text: "⊕ Find new", title: "Search all of AniList — not your vault — and add with one click",
        onclick: function () { KOS.mediaSearch.open("anime", refreshAll); } }),
      el("button", { class: "btn primary", text: "+ Add", onclick: function () { editorModal(null, refreshAll); } })
    ]));
    main.appendChild(el("div", { class: "med-layout" }, [rail.root, mainCol]));

    /* a mutation (add/edit/quick-edit) can change list/status membership, so
       reload the rail counts too; a plain filter/search change does not */
    function refreshAll() { rail.reload(); refresh(); }

    /* countLine + holder + sentinel + the lazy batch renderer */
    var area = mv.resultsArea(mainCol, function (e) {
      return p.layout === "list" ? listRow(e, mod, refreshAll) : gridCard(e, mod, refreshAll);
    });

    /* dropdown option fill from the real index keys */
    KOS.mediadb.distinct("genres", function (err, gs) { if (!err) mv.fillSel(genreSel, gs, "All genres"); });
    KOS.mediadb.distinct("tags", function (err, ts) { if (!err) mv.fillSel(tagSel, ts, "All tags"); });

    function refresh() {
      KOS.mediadb.query({
        module: "anime", status: rail.status() || undefined,
        customList: rail.customList() || undefined,
        genre: genreSel.value || undefined, tag: tagSel.value || undefined,
        search: search.value.trim() || undefined, sort: sortSel.value
      }, function (err, rows) {
        area.holder.className = p.layout === "list" ? "med-list" : "med-grid";
        if (err) {
          area.holder.innerHTML = "";
          area.countLine.textContent = "Query failed: " + err.message;
          return;
        }
        area.countLine.textContent = rows.length + (rows.length === 1 ? " entry" : " entries") +
          (rail.status() || rail.customList() || genreSel.value || tagSel.value || search.value ? " (filtered)" : "");
        if (!rows.length) {
          area.holder.innerHTML = "";
          area.holder.appendChild(mv.emptyState(
            search.value || rail.status() || rail.customList() || genreSel.value || tagSel.value
              ? "Nothing matches this filter."
              : "The vault is empty. Connect your AniList (or import its XML export) and 650 entries land in one sync — or add titles by hand.",
            [
              el("button", { class: "btn primary", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }),
              el("button", { class: "btn", text: "+ Add manually", onclick: function () { editorModal(null, refreshAll); } })
            ]));
          return;
        }
        area.start(rows);
      });
    }

    search.addEventListener("input", KOS.ui.debounce(refresh, 220));
    genreSel.addEventListener("change", refresh);
    tagSel.addEventListener("change", refresh);
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
  /* The vault filtered to ONE season — defaulting to the current one
     (device date mapped onto AniList's enum by calendar quarter), with a
     season + year picker (3j) to walk any past or future season: the same
     view, the same extra.season/seasonYear data the sync already carries,
     just a different filter value. Entries with no season data (manual,
     unenriched, unlinked) don't appear here: accepted limitation, stated
     in the header, not worked around. The palette follows the SELECTED
     season via the s-* CSS classes — token-system modes, not skins. */
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
    wrap.appendChild(el("div", { class: "lab-h season-hero" }, [
      heroTitle,
      el("p", { class: "sub", text: "Your vault, one season at a time — live countdowns on anything airing. Only entries with season data from AniList appear here." })
    ]));

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
        /* airing entries first, soonest episode first; the rest A–Z
           (past seasons naturally have nothing airing → pure A–Z) */
        var known = airingList(seasonal).map(function (x) { return x.entry; });
        var knownIds = {};
        known.forEach(function (e) { knownIds[e.id] = true; });
        var rest = seasonal.filter(function (e) { return !knownIds[e.id]; })
          .sort(function (a, b) { return a.titleLower < b.titleLower ? -1 : 1; });
        var list = known.concat(rest);
        refreshedLine.textContent = list.length
          ? list.length + (list.length === 1 ? " title" : " titles") + " from " + meta.label + " " + sel.year +
            " in your vault" + (known.length ? " · " + known.length + " with a known next episode" : "") +
            (airing.at && known.length ? " · airing data as of " + new Date(airing.at).toLocaleTimeString() : "")
          : "";
        if (!list.length) {
          holder.appendChild(el("div", { class: "med-empty" }, [
            el("p", { class: "fc-empty", text: "Nothing from " + meta.label + " " + sel.year + " in the vault. Sync your AniList (season data rides along automatically), or run enrichment on imported entries — season can't be filled in by hand here." }),
            el("div", { class: "lab-controls", style: "justify-content:center" }, [
              el("button", { class: "btn primary", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }),
              el("button", { class: "btn gold", text: "⊕ Find new", onclick: function () { KOS.mediaSearch.open("anime", render); } })
            ])
          ]));
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
