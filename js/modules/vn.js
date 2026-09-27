/* Kurenai OS — modules/vn.js
   The Visual Novels module (Build 3c). VNDB sync populates the metadata
   half (title, developer, cover, tags-as-genres, length estimate); the
   layer that makes the module worth having is MANUAL, built up per VN:

   - Routes: VNDB has no clean structured route data for most titles, so
     the route list is the user's own — name it, clear it, date it.
   - Progress source: a VN's "progress" is derived (mediadb.normalise)
     from ONE of routes cleared, chapters/parts completed, hours played
     against VNDB's length estimate, or a percentage the user sets —
     because a kinetic novel (Higurashi) has no routes and counts by
     chapter, a first playthrough of an unstructured title (Danganronpa-
     likes) can only say how long it has been and let VNDB's crowd-sourced
     length answer "how far", and a percentage is the last resort for a VN
     you already know. `progressMode` picks explicitly; unset, the entry
     counts whatever it carries, routes first. Chapters get the card's
     "+1 ch", hours its "+1 hr".
   - CG gallery: an honest counter — "X of Y unlocked" — never actual CG
     artwork (copyright, and VNDB doesn't expose galleries anyway).
   - Content warnings: a manual axis, deliberately not auto-filled from
     VNDB's tags (their ero/violence flags are crowd-sourced spoiler-ware;
     what warrants a warning is personal).
   - Quote log (the Kaguya feature): lines worth keeping, with optional
     context, timestamped. Any quote can be sent to the flashcard system —
     it lands in the "personal" deck (sid "personal", ref "vn"), NOT in a
     curriculum subject, and joins the same SM-2 schedule as everything
     else. See due.js for the Personal Deck study surface.

   Same scale rules as anime.js/books.js: DB-index filters, lazy batch
   rendering, lazy covers. Governor contract unchanged: deliberate log
   actions → KOS.media.logActivity (+4 XP/+1 gold, 0 HP, rest streak only);
   bulk sync never logs.                                                   */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var BATCH = 60;
  var STATUSES = ["inProgress", "planned", "onHold", "completed", "dropped"];
  var LENGTH_LABEL = { 1: "very short", 2: "short", 3: "medium", 4: "long", 5: "very long" };

  /* read without creating: the prefs attach to the store the first time
     one actually changes (a render writes nothing, §0.2.3) */
  function prefs() {
    var m = store.state.media;
    return (m && m.vn) || { layout: "grid", sort: "updated" };
  }
  function persist(p) {
    var m = store.state.media = store.state.media || {};
    m.vn = p;
    store.save();
  }


  /* ================= domain helpers (exposed as KOS.vn) ================= */
  function routeProgress(e) {
    var total = e.routes ? e.routes.length : 0;
    var cleared = e.routes ? e.routes.filter(function (r) { return r.cleared; }).length : 0;
    return { cleared: cleared, total: total, pct: total ? Math.round(100 * cleared / total) : null };
  }
  function cgText(e) {
    var g = e.cgGallery || {};
    if (g.totalKnown == null && !g.unlockedCount) return null;
    return g.unlockedCount + (g.totalKnown != null ? "/" + g.totalKnown : "") + " CG";
  }
  /* chapters (Build 3j) — user-defined parts PARALLEL to routes, never
     derived from VNDB and never driving progress (routes keep that job) */
  function chapterProgress(e) {
    var total = e.chapters ? e.chapters.length : 0;
    var done = e.chapters ? e.chapters.filter(function (c) { return c.status === "completed"; }).length : 0;
    return { done: done, total: total };
  }
  function lengthText(extra) {
    if (!extra) return null;
    if (extra.lengthMinutes) return "~" + Math.round(extra.lengthMinutes / 60) + " h";
    if (extra.length) return LENGTH_LABEL[extra.length] || null;
    return null;
  }
  /* which source is counting (routes | chapters | percent | null) — the
     one definition lives in mediadb so the card, the editor and the
     derived progress can never disagree */
  function progressSource(e) { return KOS.mediadb.vnSource(e); }
  /* VNDB's length for the editor: what the hours are measured against */
  function lengthNote(e) {
    var len = KOS.mediadb.vnLengthHours(e);
    if (!len) return "VNDB has no length for this title yet — hours still show, with nothing to measure against until it does";
    if (len.rough) return "VNDB only rates it “" + (LENGTH_LABEL[e.extra.length] || "") + "” (~" + len.hours + " h as a rough figure) — no play-time votes yet";
    return "measured against VNDB's crowd-sourced play time, ~" + len.hours + " h";
  }
  /* what is counting, in words, for the editor's sub-line */
  function progressNote(e) {
    var src = progressSource(e);
    if (src === "routes") { var rp = routeProgress(e); return "Counting routes — " + rp.cleared + " of " + rp.total + " cleared"; }
    if (src === "chapters") { var cp = chapterProgress(e); return "Counting chapters — " + cp.done + " of " + cp.total + " completed"; }
    if (src === "time") {
      var len = KOS.mediadb.vnLengthHours(e);
      return "Counting hours played — " + (e.playtimeHours || 0) + (len ? " of ~" + len.hours + " h" : " h, no VNDB length to compare against");
    }
    if (src === "percent") return "Counting the percentage you set — " + (e.progressPercent || 0) + "%";
    return "Nothing counts yet — add routes or chapters as you meet them, log hours played, or set a percentage";
  }
  /* "+1 hr" for a VN counting time — the shared hours bump games use */
  function bumpHour(e, done) { KOS.medview.bumpUnit(e, "hours", done); }
  /* "+1 ch" for a VN counting chapters: the first chapter not yet completed
     is completed, mirroring anime's +1 ep (a finished last chapter completes
     the entry). Logs one deliberate act; never pushes — VNDB has no
     progress concept and the push snapshot is status|score only. */
  function bumpChapter(e, done) {
    var next = (e.chapters || []).find(function (c) { return c.status !== "completed"; });
    if (!next) { done && done(e); return; }
    next.status = "completed";
    var finished = e.chapters.every(function (c) { return c.status === "completed"; });
    var today = KOS.srs.todayISO();
    if (finished) {
      e.status = "completed";
      if (!e.dates.finished) e.dates.finished = today;
    } else if (e.status === "planned" || e.status === "onHold") {
      e.status = "inProgress";
      if (!e.dates.started) e.dates.started = today;
    }
    var before = KOS.mediapush.snapshot(e);
    KOS.mediadb.put(e, function (err, rec) {
      if (err) { KOS.ui.toast("Save failed: " + err.message, true); return; }
      KOS.media.logActivity(rec, finished ? "completed" : "chapter");
      if (KOS.mediapush.snapshot(rec) !== before) KOS.mediapush.schedule(rec);   // a completion is a status change
      done && done(rec);
    });
  }

  KOS.vn = {
    routeProgress: routeProgress,
    chapterProgress: chapterProgress,
    progressSource: progressSource,
    progressNote: progressNote,
    lengthNote: lengthNote,
    bumpChapter: bumpChapter,
    bumpHour: bumpHour,
    quickBump: quickBump,
    cgText: cgText,
    lengthText: lengthText
  };

  /* ================= little shared bits ================= */
  var mod = function () { return KOS.media.module("vn"); };
  function cwChip(e) {
    return (e.contentWarnings && e.contentWarnings.length)
      ? KOS.medview.chip("⚠ " + e.contentWarnings.length, "crimson", { "data-ui": "vn.cw", title: "Content warnings: " + e.contentWarnings.join(", ") })
      : null;
  }
  function cover(e) { return KOS.medview.cover(e, mod().kanji); }
  function metaLine(e) {
    /* the counting source first, in the shared grammar; the other list
       still shows as a fact ("2/5 routes") when it exists */
    var src = progressSource(e);
    var bits = [KOS.media.progressText(e)].filter(Boolean);
    var rp = routeProgress(e);
    if (rp.total && src !== "routes") bits.push(rp.cleared + "/" + rp.total + " routes");
    var cp = chapterProgress(e);
    if (cp.total && src !== "chapters") bits.push(cp.done + "/" + cp.total + " ch");
    var cg = cgText(e);
    if (cg) bits.push(cg);
    var len = lengthText(e.extra);
    if (len && src !== "time") bits.push(len);   // the hours already measure against it
    return bits.join(" · ");
  }

  /* ================= the editor modal (shared medview shell) ================= */
  /* opts.chapter: open on that chapter's own tab (Chapter select) */
  function vnEditor(entry, onSaved, opts) {
    opts = opts || {};
    var mv = KOS.medview;
    var isNew = !entry || entry.id == null;
    var e = mv.editDraft(entry, "vn");
    var pushBefore = KOS.mediapush.snapshot(e);   // status|score only for VN
    var field = mv.field, splitList = mv.splitList;

    /* deltas for honest activity logging: one deliberate act per save */
    var clearedAtOpen = routeProgress(e).cleared;
    var quotesAtOpen = e.quotes.length;
    var chaptersDoneAtOpen = chapterProgress(e).done;
    var hoursAtOpen = e.playtimeHours || 0;

    /* --- identity + list state --- */
    var title = el("input", { type: "text", class: "k-input", "data-ui": "ui.quick-add", value: e.title === "Untitled" && isNew ? "" : e.title, placeholder: "Title" });
    var developer = el("input", { type: "text", class: "k-input", "data-ui": "ui.quick-add", value: e.developer, placeholder: "Developer (filled by sync when linked)" });
    var vndbId = el("input", { type: "text", class: "k-input", "data-ui": "ui.quick-add vault.num vn.id", value: e.externalIds.vndbId || "",
      placeholder: "v17", title: "The id from the VNDB page URL — linking it lets enrichment fill cover/developer/tags" });
    var status = el("select", { class: "k-input", "data-ui": "ui.status-select" }, STATUSES.map(function (s) {
      return el("option", { value: s, text: KOS.media.STATUS_LABEL[s] });
    }));
    status.value = e.status;
    var score = el("input", { type: "number", class: "k-input", "data-ui": "ui.quick-add vault.num", min: "0", max: "10", step: "0.5", value: String(e.score || 0) });
    var own = el("select", { class: "k-input", "data-ui": "ui.status-select" }, [["digital", "Digital"], ["physical", "Physical"], ["steam", "Steam"], ["unset", "—"]].map(function (o) {
      return el("option", { value: o[0], text: o[1] });
    }));
    own.value = e.ownership;
    var started = el("input", { type: "date", class: "k-input", "data-ui": "ui.quick-add", value: e.dates.started || "" });
    var finished = el("input", { type: "date", class: "k-input", "data-ui": "ui.quick-add", value: e.dates.finished || "" });
    var fav = el("input", { type: "checkbox", class: "k-box" });
    fav.checked = e.favourite;

    /* --- taxonomy --- */
    var genres = el("input", { type: "text", class: "k-input", "data-ui": "ui.quick-add", value: e.genres.join(", "), placeholder: "Mystery, Drama… (filled from VNDB content tags on sync)" });
    var tags = el("input", { type: "text", class: "k-input", "data-ui": "ui.quick-add", value: e.tags.join(", "), placeholder: "replay, untranslated…" });
    var warns = el("input", { type: "text", class: "k-input", "data-ui": "ui.quick-add", value: e.contentWarnings.join(", "), placeholder: "your own warnings — never auto-filled from VNDB tags" });
    var coverU = el("input", { type: "url", class: "k-input", "data-ui": "ui.quick-add", value: e.coverUrl || "", placeholder: "https://… (filled by sync/enrichment)" });
    var coverPosition = mv.coverPositionControl(e, coverU);
    var notes = el("textarea", { class: "k-input", "data-ui": "ui.note-area", rows: 3, placeholder: "Notes…" });
    notes.value = e.notes || "";

    /* --- routes (manual — VNDB gives no structured route data) --- */
    var routesWrap = el("div", { class: "k-vn-list k-medit-wide", "data-ui": "vn.routes" });
    function renderRoutes() {
      routesWrap.innerHTML = "";
      var rp = routeProgress(e);
      routesWrap.appendChild(el("div", { class: "k-vn-head" }, [
        el("b", { text: "Routes" }),
        el("span", { class: "k-mono k-muted", text: rp.total ? "Cleared: " + rp.cleared + " / " + rp.total : "" }),
        el("p", { class: "k-field-hint", "data-ui": "part.sub", text: rp.total
          ? rp.cleared + " of " + rp.total + " cleared — your own list; VNDB doesn't know a VN's routes"
          : "none yet — add the routes as you meet them; a kinetic novel can leave this empty" })
      ]));
      e.routes.forEach(function (r) {
        var done = el("input", { type: "checkbox", class: "k-vn-tick", "aria-label": "Cleared: " + r.name });
        done.checked = r.cleared;
        done.addEventListener("change", function () {
          r.cleared = done.checked;
          r.completedAt = done.checked ? (r.completedAt || KOS.srs.todayISO()) : null;
          renderRoutes();
        });
        var name = el("input", { type: "text", class: "k-vn-name", "data-ui": "ui.quick-add vn.route-name", value: r.name,
          "aria-label": "Route name" });
        name.addEventListener("change", function () { r.name = name.value.trim() || r.name; });
        var rowR = el("div", { class: "k-vn-row", "data-ui": "vn.route-row" }, [
          el("label", { class: "k-vn-tickwrap" }, [done]),
          name,
          el("span", { class: "k-mono k-muted k-vn-date", text: r.cleared ? (r.completedAt || "") : "" }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Remove route " + r.name, text: "✕", onclick: function (ev) {
            ev.preventDefault();
            e.routes = e.routes.filter(function (x) { return x !== r; });
            renderRoutes();
          } })
        ]);
        if (r.cleared) KOS.ui.state(rowR, "cleared", true);
        routesWrap.appendChild(rowR);
      });
      var newName = el("input", { type: "text", class: "k-vn-name", "data-ui": "ui.quick-add vn.route-name", "aria-label": "New route name", placeholder: "Route name — “Kurisu”, “True End”…" });
      function addRoute(ev) {
        ev.preventDefault();
        if (!newName.value.trim()) { KOS.ui.toast("Name the route first.", true); return; }
        e.routes.push(KOS.mediadb.normRoute({ name: newName.value.trim() }));
        renderRoutes();
      }
      newName.addEventListener("keydown", function (ev) { if (ev.key === "Enter") addRoute(ev); });
      routesWrap.appendChild(el("div", { class: "k-vn-add", "data-ui": "vn.route-add" }, [
        newName,
        el("button", { type: "button", class: "k-btn k-btn--sm", text: "+ Add route", onclick: addRoute })
      ]));
      syncProgressUI();
    }

    /* --- the progress source ---
       Which of the three counts: routes, chapters, or a percentage. Unset
       ("automatic") takes whatever the entry carries, routes first. The
       percentage field shows only while it is the thing counting, so a
       routed VN never carries an idle slider. */
    /* 11e: the choice as a radio list, one line per source */
    var modeName = "vn-mode-" + Math.random().toString(36).slice(2, 8);
    var modeSel = el("div", { class: "k-vn-modes", role: "radiogroup", "data-ui": "vn.mode", "aria-label": "What counts as progress" }, [
      ["", "Automatic", "routes, then chapters, then hours"],
      ["routes", "Routes cleared"],
      ["chapters", "Chapters / parts completed"],
      ["time", "Hours played vs VNDB's length"]
    ].map(function (o) {
      var r = el("input", { type: "radio", class: "k-vn-mode-in", name: modeName, value: o[0] });
      r.checked = (e.progressMode || "") === o[0];
      return el("label", { class: "k-vn-mode", "data-ui": "vn.mode-opt" }, [r, el("span", { text: o[1] }),
        o[2] ? el("small", { class: "k-muted", text: o[2] }) : null].filter(Boolean));
    }));
    Object.defineProperty(modeSel, "value", {
      get: function () { var on = modeSel.querySelector("input:checked"); return on ? on.value : ""; },
      set: function (v) { Array.prototype.forEach.call(modeSel.querySelectorAll("input"), function (r) { r.checked = r.value === (v || ""); }); }
    });
    var pctIn = el("input", { type: "number", class: "k-input", "data-ui": "ui.quick-add vault.num", min: "0", max: "100", step: "1",
      value: e.progressPercent != null ? String(e.progressPercent) : "", placeholder: "0–100",
      "aria-label": "How far through, as a percentage" });
    var pctField = field("How far through (%)", pctIn);
    var hoursIn = el("input", { type: "number", class: "k-input", "data-ui": "ui.quick-add vault.num", min: "0", step: "0.5",
      value: e.playtimeHours != null ? String(e.playtimeHours) : "", placeholder: "0",
      "aria-label": "Hours played" });
    var hoursField = field("Hours played", hoursIn);
    var lengthNoteEl = el("p", { class: "k-field-hint k-medit-wide", "data-ui": "part.sub vn.progress-note vn.length-note vault.span-2" });
    var progressNoteEl = el("span", { class: "k-vn-counting", "data-ui": "part.sub vn.progress-note" });
    var countPct = el("span", { class: "k-mono k-medit-pct" });
    var countFill = el("span", { class: "k-medit-bar-fill" });
    var countBox = el("div", { class: "k-field k-medit-wide k-medit-prog", "data-ui": "vn.counting vault.span-2" }, [
      el("span", { class: "k-medit-prog-h" }, [progressNoteEl, countPct]),
      el("span", { class: "k-medit-bar", "aria-hidden": "true" }, [countFill])
    ]);
    /* how far, by whatever counts — the bar under the counting line */
    function sourcePct() {
      var src = progressSource(e), n = null;
      if (src === "routes") { var rp = routeProgress(e); n = rp.total ? rp.cleared / rp.total : null; }
      else if (src === "chapters") { var cp = chapterProgress(e); n = cp.total ? cp.done / cp.total : null; }
      else if (src === "time") { var len = KOS.mediadb.vnLengthHours(e); n = len && len.hours ? (e.playtimeHours || 0) / len.hours : null; }
      else if (src === "percent") n = (e.progressPercent || 0) / 100;
      return n == null ? null : Math.max(0, Math.min(100, Math.round(100 * n)));
    }
    function readProgressFields() {
      e.progressMode = modeSel.value || null;
      e.progressPercent = pctIn.value === "" ? null : Math.max(0, Math.min(100, parseInt(pctIn.value, 10) || 0));
      var h = parseFloat(hoursIn.value);
      e.playtimeHours = hoursIn.value === "" || isNaN(h) ? null : Math.max(0, h);
    }
    function syncProgressUI() {
      readProgressFields();
      var src = progressSource(e);
      pctField.hidden = !(src === "percent" || modeSel.value === "percent");
      var timing = src === "time" || modeSel.value === "time";
      /* hours played is always there to fill in (review B), whatever is
         counting; VNDB's length note shows only while hours count */
      lengthNoteEl.hidden = !timing;
      lengthNoteEl.textContent = lengthNote(e);
      progressNoteEl.textContent = progressNote(e);
      var pc = sourcePct();
      countPct.textContent = pc == null ? "" : pc + "%";
      countFill.style.setProperty("--pct", (pc || 0) + "%");
    }
    modeSel.addEventListener("change", syncProgressUI);
    pctIn.addEventListener("input", syncProgressUI);
    hoursIn.addEventListener("input", syncProgressUI);
    renderRoutes();

    /* --- chapters/parts (Build 3j; review B: the Books shelf's grammar) ---
       For VNs with internal structure the routes list doesn't capture —
       Higurashi's question arcs, a kinetic novel's parts. Like a series'
       volumes, a chapter is something you OWN (its art, where you have it,
       what it cost) and something you PLAY (its own status, hours, score,
       dates). The tab is the shelf: owned vs played on one scale, the
       figures, a tile per chapter, the selected chapter's purchase row; a
       second tab holds the selected chapter's play record. Never
       auto-filled from VNDB. A kinetic novel counts its progress here. */
    var chaptersWrap = el("div", { class: "k-bk-phys", "data-ui": "vn.chapters" });
    var selectedCh = opts.chapter != null && e.chapters[opts.chapter] ? e.chapters[opts.chapter] : null, chRangeOpen = false;
    var chTotalIn = el("input", { type: "number", class: "k-input k-bk-of-in", "data-ui": "ui.quick-add vault.num", min: "1", placeholder: "?",
      "aria-label": "Chapters in the work" });
    if (e.chaptersTotal) chTotalIn.value = String(e.chaptersTotal);
    chTotalIn.addEventListener("change", function () {
      var n = parseInt(chTotalIn.value, 10);
      e.chaptersTotal = n > 0 ? Math.min(n, 999) : null;
      renderChapters();
    });
    function platformSelect(value, aria) {
      var sel = el("select", { class: "k-input", "data-ui": "ui.status-select", "aria-label": aria },
        [el("option", { value: "", text: "—" })].concat(KOS.mediadb.PLATFORMS.map(function (pl) {
          return el("option", { value: pl, text: KOS.media.PLATFORM_LABEL[pl] || pl });
        })));
      sel.value = value || "";
      return sel;
    }
    function nextChapterName() { return "Chapter " + (e.chapters.length + 1); }
    function renderChapters() {
      chaptersWrap.innerHTML = "";
      var chs = e.chapters;
      var owned = chs.filter(function (c) { return c.owned; });
      var played = chs.filter(function (c) { return c.status === "completed"; });
      var total = e.chaptersTotal || chs.length;
      var spent = owned.reduce(function (a, c) { return a + (c.price || 0); }, 0);
      if (selectedCh && chs.indexOf(selectedCh) === -1) selectedCh = null;
      if (!selectedCh) selectedCh = chs[0] || null;

      /* owned vs played, ONE scale */
      var cmp = el("div", { class: "k-bk-compare k-bk-box", "data-ui": "vn.ch-compare" }, [el("h4", { class: "k-bk-box-h", text: "Owned vs played" })]);
      function row(label, n, tone) {
        var pct = total ? Math.round(100 * n / total) : 0;
        var bar = el("div", { class: "k-bar k-bar--6", role: "img", "aria-label": label + ": " + n + " of " + total }, [el("i", { "data-ui": "media.bar-fill" })]);
        bar.style.setProperty("--p", pct + "%");
        bar.style.setProperty("--bar-c", tone);
        return el("div", { class: "k-bk-compare-row", "data-ui": "books.compare-row" }, [
          el("span", { class: "k-muted", text: label }), bar,
          el("span", { class: "k-mono", text: total ? n + " of " + total + " · " + pct + "%" : "none yet" })
        ]);
      }
      cmp.appendChild(row("Owned", owned.length, "var(--vn)"));
      cmp.appendChild(row("Played", played.length, "var(--green)"));
      chaptersWrap.appendChild(cmp);

      /* the figures — the shelf's own band */
      chaptersWrap.appendChild(el("dl", { class: "k-bk-band k-bk-box" }, [
        el("div", { class: "k-bk-fig" }, [el("dt", { text: "On the shelf" }),
          el("dd", { class: "k-bk-of" }, [el("span", { text: String(owned.length) }), el("span", { class: "k-bk-of-w", text: "of" }), chTotalIn])])
      ].concat([
        ["Played", String(played.length)],
        ["Owned, unplayed", String(owned.filter(function (c) { return c.status !== "completed"; }).length)],
        ["Shelf value", spent ? "£" + spent.toFixed(2) : "—"]
      ].map(function (c) {
        return el("div", { class: "k-bk-fig" }, [el("dt", { text: c[0] }), el("dd", { "data-tone": c[0] === "Owned, unplayed" && c[1] !== "0" ? "amber" : null, text: c[1] })]);
      }))));
      if (!chTotalIn.value) chTotalIn.placeholder = String(chs.length || "?");

      /* the chapters card: add the next one, or a run of them */
      var card = el("section", { class: "k-bk-box k-bk-volcard", "aria-label": "Chapters" }, [
        el("div", { class: "k-bk-box-head" }, [
          el("h4", { class: "k-bk-box-h", text: "Chapters" }),
          el("span", { class: "k-bk-box-sub", text: "Owned vs played are tracked separately" }),
          el("div", { class: "k-cluster k-spacer" }, [
            el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "vn.ch-range-toggle", "aria-expanded": String(chRangeOpen), text: "Add range",
              onclick: function (ev) { ev.preventDefault(); chRangeOpen = !chRangeOpen; renderChapters(); } }),
            el("button", { type: "button", class: "k-btn k-btn--sm k-btn--primary", "data-intent": "primary", "data-ui": "vn.route-add vn.ch-add",
              text: "+ Add next · Ch " + (chs.length + 1), onclick: function (ev) {
                ev.preventDefault();
                e.chapters.push(KOS.mediadb.normChapter({ name: nextChapterName(), owned: true, purchaseDate: KOS.srs.todayISO() }));
                selectedCh = e.chapters[e.chapters.length - 1];
                renderChapters();
              } })
          ])
        ])
      ]);
      if (chRangeOpen) {
        var rFrom = el("input", { type: "number", class: "k-input", "data-ui": "ui.quick-add vault.num", min: "1", value: String(chs.length + 1), "aria-label": "From chapter" });
        var rTo = el("input", { type: "number", class: "k-input", "data-ui": "ui.quick-add vault.num", min: "1", placeholder: "to", "aria-label": "To chapter" });
        var rPl = platformSelect("", "Platform for the range");
        var rDate = el("input", { type: "date", class: "k-input", "data-ui": "ui.quick-add" });
        var rPrice = el("input", { type: "number", class: "k-input", "data-ui": "ui.quick-add", min: "0", step: "0.01", placeholder: "£ each" });
        card.appendChild(el("div", { class: "k-bk-range-grid", "data-ui": "vn.ch-range" }, [
          field("From", rFrom), field("To", rTo), field("Platform", rPl), field("Purchase date", rDate), field("Price each", rPrice),
          el("div", { class: "k-bk-range-go" }, [el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Add", onclick: function (ev) {
            ev.preventDefault();
            var a = parseInt(rFrom.value, 10), b = parseInt(rTo.value, 10);
            if (isNaN(a) || isNaN(b) || b < a || b - a > 199) { KOS.ui.toast("Give the range as from ≤ to, e.g. 1 to 4.", true); return; }
            var p = parseFloat(rPrice.value);
            for (var n = a; n <= b; n++) {
              var nm = "Chapter " + n;
              if (e.chapters.some(function (c) { return c.name === nm; })) continue;
              e.chapters.push(KOS.mediadb.normChapter({ name: nm, owned: true, platform: rPl.value || null,
                purchaseDate: rDate.value || null, price: isNaN(p) ? null : p }));
            }
            chRangeOpen = false;
            renderChapters();
          } })])
        ]));
      }
      if (!chs.length) card.appendChild(el("p", { class: "k-bk-none", text: "No chapters yet — add the first, or a run of them. A kinetic novel counts its progress here." }));
      else {
        var grid = el("div", { class: "k-bk-vols", role: "list", "aria-label": "Chapters" });
        chs.forEach(function (c, i) {
          var done = c.status === "completed";
          var tile = el("button", { type: "button", class: "k-bk-vol", "data-ui": "books.vol vn.ch-tile", role: "listitem",
            "aria-label": c.name + " — " + (c.owned ? "owned" : "not owned") + ", " + KOS.media.STATUS_LABEL[c.status],
            "aria-pressed": c === selectedCh ? "true" : "false",
            onclick: function (ev) { ev.preventDefault(); selectedCh = c; renderChapters(); } }, [
            el("span", { class: "k-bk-vol-art", "aria-hidden": "true" }, [
              c.coverUrl ? KOS.imageCrop.image(c.coverUrl, { alt: "", loading: "lazy" }, c.coverCrop) : null,
              el("span", { class: "k-bk-vol-n k-mono", text: String(i + 1) }),
              done ? el("span", { class: "k-bk-vol-read", text: "✓" }) : null
            ].filter(Boolean)),
            el("span", { class: "k-bk-vol-l k-ellipsis", title: c.name, text: c.name })
          ]);
          tile.style.setProperty("--spine", KOS.books && KOS.books.spineColor ? KOS.books.spineColor((title.value || e.title) + i) : "var(--s3)");
          if (!c.owned) KOS.ui.state(tile, "missing", true);
          grid.appendChild(tile);
        });
        card.appendChild(grid);
      }
      chaptersWrap.appendChild(card);

      /* the selected chapter's purchase row: platform stands where a
         volume's condition does */
      if (selectedCh) {
        var c = selectedCh;
        var own = el("input", { type: "checkbox", class: "k-box", "aria-label": "Own " + c.name });
        own.checked = c.owned;
        own.addEventListener("change", function () { c.owned = own.checked; renderChapters(); });
        var pl = platformSelect(c.platform, "Platform of " + c.name);
        pl.addEventListener("change", function () { c.platform = pl.value || null; });
        var date = el("input", { type: "date", class: "k-input", "data-ui": "ui.quick-add", "aria-label": "Purchase date of " + c.name });
        date.value = c.purchaseDate || "";
        date.addEventListener("change", function () { c.purchaseDate = date.value || null; });
        var price = el("input", { type: "number", class: "k-input", "data-ui": "ui.quick-add", min: "0", step: "0.01", placeholder: "£", "aria-label": "Price of " + c.name });
        if (c.price != null) price.value = String(c.price);
        price.addEventListener("change", function () { var p = parseFloat(price.value); c.price = isNaN(p) ? null : p; });
        var cov = el("button", { type: "button", class: "k-input k-bk-cov", text: c.coverUrl ? "Custom ⌖" : "Add art", onclick: function (ev) {
          ev.preventDefault();
          KOS.imageCrop.open({
            title: "Art for " + c.name, description: "Nothing is saved until you save the VN.",
            source: c.coverUrl || "", crop: c.coverCrop, aspect: 2 / 3, allowUpload: true, allowUrl: true,
            fileOptions: { maxWidth: 900, maxHeight: 1350, maxBytes: 420 * 1024, quality: 0.84 },
            onSave: function (result) { c.coverUrl = result.source; c.coverCrop = result.crop; renderChapters(); }
          });
        } });
        chaptersWrap.appendChild(el("div", { class: "k-bk-volrec k-bk-box k-vn-chrec", "data-ui": "vn.ch-record" }, [
          el("span", { class: "k-mono k-bk-volrec-n", text: "Ch " + (e.chapters.indexOf(c) + 1) }),
          field("Owned", el("span", { class: "k-check" }, [own])),
          field("Platform", pl), field("Purchase date", date), field("Price", price), field("Art", cov),
          el("button", { type: "button", class: "k-btn k-btn--sm k-bk-remove", "data-intent": "danger", "aria-label": "Remove chapter " + c.name, text: "✕ Remove",
            onclick: function (ev) {
              ev.preventDefault();
              e.chapters = e.chapters.filter(function (x) { return x !== c; });
              selectedCh = null;
              renderChapters();
            } })
        ]));
      }
      renderChapterTab();
      syncProgressUI();
    }

    /* the selected chapter's own play record — its tab (review B) */
    var chTab = e.chapters.length > 0;
    var chHost = el("div", { class: "k-medit-grid", "data-ui": "vn.ch-tab" });
    var overlayRef = null;
    function renderChapterTab() {
      if (!chTab) return;
      chHost.innerHTML = "";
      var c = selectedCh;
      if (overlayRef) overlayRef.renameTab("chapter", c ? "Ch " + (e.chapters.indexOf(c) + 1) : "Chapter");
      if (!c) { chHost.appendChild(el("p", { class: "k-muted k-medit-wide", text: "Pick a chapter on the Chapters tab." })); return; }
      function bind(input, key, parse) {
        input.addEventListener("change", function () { c[key] = parse ? parse(input) : (input.value || null); if (key === "status" || key === "name") renderChapters(); });
        return input;
      }
      var nm = bind(el("input", { type: "text", class: "k-input", "data-ui": "ui.quick-add vn.route-name", "aria-label": "Chapter name", value: c.name }),
        "name", function (i) { return i.value.trim() || c.name; });
      var st = bind(el("select", { class: "k-input", "data-ui": "ui.status-select vn.chapter-status", "aria-label": "Status: " + c.name }, STATUSES.map(function (x) {
        return el("option", { value: x, text: KOS.media.STATUS_LABEL[x] });
      })), "status");
      st.value = c.status;
      var hrs = bind(el("input", { type: "number", class: "k-input", "data-ui": "ui.quick-add vault.num", min: "0", step: "0.5", placeholder: "0",
        "aria-label": "Hours played on " + c.name, value: c.playtimeHours != null ? String(c.playtimeHours) : "" }), "playtimeHours", mv.readNum);
      var sc = mv.scoreInput(c.score, "Score for " + c.name);
      bind(sc.querySelector("input"), "score", function (i) { var n = mv.readNum(i); return n == null ? null : Math.min(10, n); });
      var cs = bind(el("input", { type: "date", class: "k-input", "data-ui": "ui.quick-add", "aria-label": "Started " + c.name, value: c.started || "" }), "started");
      var cf = bind(el("input", { type: "date", class: "k-input", "data-ui": "ui.quick-add", "aria-label": "Finished " + c.name, value: c.finished || "" }), "finished");
      var cn = bind(el("textarea", { class: "k-input", "data-ui": "ui.note-area vn.chapter-note", rows: 3, placeholder: "Notes on this chapter…", "aria-label": "Notes on " + c.name }),
        "notes", function (i) { return i.value; });
      cn.value = c.notes || "";
      [field("Name", nm), field("Status", st), field("Hours played", hrs),
        field("Score", sc), field("Started", cs), field("Finished", cf),
        field("Notes", cn, "med-span-2")
      ].forEach(function (n) { chHost.appendChild(n); });
    }
    renderChapters();

    /* --- CG gallery counter (numbers only, never artwork) --- */
    var cgUn = el("input", { type: "number", class: "k-input", "data-ui": "ui.quick-add vault.num", min: "0", value: String(e.cgGallery.unlockedCount || 0) });
    var cgTot = el("input", { type: "number", class: "k-input", "data-ui": "ui.quick-add vault.num", min: "0", placeholder: "?", value: e.cgGallery.totalKnown != null ? String(e.cgGallery.totalKnown) : "" });

    /* --- quote log: the shared one every medium now has (review B) --- */
    var quotesWrap = mv.quoteLog(e);

    function save() {
      if (!title.value.trim()) { KOS.ui.toast("A title is needed.", true); return; }
      var oldStatus = e.status;
      e.title = title.value.trim();
      e.developer = developer.value.trim();
      readProgressFields();
      var vid = vndbId.value.trim();
      e.externalIds.vndbId = vid ? (/^v\d+$/i.test(vid) ? vid.toLowerCase() : "v" + vid.replace(/\D/g, "")) || null : null;
      e.status = status.value;
      e.score = Math.max(0, Math.min(10, parseFloat(score.value) || 0));
      e.ownership = own.value;
      e.dates.started = started.value || null;
      e.dates.finished = finished.value || null;
      e.genres = splitList(genres.value);
      e.tags = splitList(tags.value);
      e.contentWarnings = splitList(warns.value);
      e.cgGallery = {
        unlockedCount: Math.max(0, parseInt(cgUn.value, 10) || 0),
        totalKnown: cgTot.value === "" ? null : Math.max(0, parseInt(cgTot.value, 10) || 0)
      };
      e.coverUrl = coverPosition.sourceFor();
      e.coverCrop = coverPosition.cropFor(e.coverUrl);
      e.favourite = fav.checked;
      e.notes = notes.value;
      mv.saveEntry(e, {
        isNew: isNew, pushBefore: pushBefore,
        /* one deliberate act per save, most significant first — bulk sync
           never comes through here, so the trickle stays honest */
        activity: function (rec) {
          if (oldStatus !== rec.status) return "status";
          if (routeProgress(rec).cleared > clearedAtOpen) return "route";
          if (chapterProgress(rec).done > chaptersDoneAtOpen) return "chapter";
          if ((rec.playtimeHours || 0) > hoursAtOpen) return "progress";
          if (rec.quotes.length > quotesAtOpen) return "quote";
          return null;
        },
        close: function () { overlay.close(); }, onSaved: onSaved
      });
    }

    /* the banner's +1, by what counts (11e): the next route cleared, the
       next chapter completed, or an hour played — all in the draft, kept
       only when the editor saves */
    function quickBumpIn() {
      var src = progressSource(e);
      if (src === "routes") return {
        label: function () { return e.routes.some(function (r) { return !r.cleared; }) ? "+1 route" : null; },
        run: function () {
          var r = e.routes.find(function (x) { return !x.cleared; });
          if (!r) return;
          r.cleared = true; r.completedAt = KOS.srs.todayISO();
          renderRoutes();
        } };
      if (src === "chapters") return {
        label: function () { return e.chapters.some(function (c) { return c.status !== "completed"; }) ? "+1 chapter" : null; },
        run: function () {
          var c = e.chapters.find(function (x) { return x.status !== "completed"; });
          if (!c) return;
          c.status = "completed";
          renderChapters();
        } };
      if (src === "percent") return null;
      return { input: hoursIn, label: function () { return "+1 hour played"; } };
    }
    var tabs = [
      { label: "Progress", ids: ["progress", "dates"] },
      { label: "Routes", ids: ["routes"] },
      { label: "Chapters", ids: ["chapters"] },
      chTab ? { label: "Chapter", ids: ["chapter"] } : null,
      { label: "Quote log", ids: ["highlights"] },
      { label: "Your layer", ids: ["taxonomy", "lists", "structure", "notes"] },
      { label: "Record", ids: ["identity", "ownership"] }
    ].filter(Boolean);
    var bump = isNew ? null : quickBumpIn();
    var overlay = mv.editorModal({
      isNew: isNew, label: "Visual Novels", hook: "vn.editor",
      subtitle: e.syncSource === "vndb" ? "synced from VNDB — a Sync overwrites list state, keeps your routes/quotes/CG/warnings" : "manual entry",
      entry: e, altTitle: [e.developer, e.genres.slice(0, 2).join(", ")].filter(Boolean).join(" · "),
      chips: [KOS.media.STATUS_LABEL[e.status], { steam: "Steam", physical: "Physical", digital: "Digital" }[e.ownership], e.syncSource === "vndb" ? "VNDB-synced" : null],
      bump: bump, fav: isNew ? null : fav,
      tabs: isNew ? [tabs[tabs.length - 1]].concat(tabs.slice(0, -1)) : tabs,
      form: [
        mv.editorSection("identity", "Identity & artwork", "The title, studio and cover used throughout the vault.", [
          field("Title", title, "med-span-2"),
          field("Developer", developer),
          field("VNDB id", vndbId),
          field("Ownership", own),
          /* the cover's URL and its position side by side (review B) */
          field("Cover URL", el("div", { class: "k-medit-coverrow" }, [coverU, coverPosition.node]), "med-span-2"),
          lengthText(e.extra) ? el("p", { class: "k-field-hint k-medit-wide", "data-ui": "part.sub vault.span-2", text: "VNDB length estimate · " + lengthText(e.extra) }) : null
        ]),
        /* status, score and hours; the dates directly under them; then what
           counts, then the bar that measures it (review B) */
        mv.editorSection("progress", "Progress", "", [
          field("Status", status),
          field("Score /10", score),
          hoursField,
          field("Started", started),
          field("Finished", finished),
          el("div", { class: "k-field k-medit-wide", "data-ui": "vault.span-2" }, [el("span", { class: "k-field-label", text: "What counts as progress" }), modeSel]),
          pctField,
          countBox,
          lengthNoteEl
        ]),
        mv.editorSection("routes", "Routes", "", [routesWrap]),
        mv.editorSection("chapters", "Chapters", "", [chaptersWrap], { raw: true }),
        chTab ? mv.editorSection("chapter", "One chapter", "", [chHost], { raw: true }) : null,
        isNew ? mv.editorSection("ownership", "Shrine", "", [
          field("Favourite ♥", el("span", { class: "k-check" }, [fav]))
        ]) : null,
        mv.editorSection("highlights", "Quote log", "", [
          quotesWrap
        ], { raw: true }),
        /* your layer as one set of halves, no half-empty rows (review B) */
        mv.editorSection("taxonomy", "Your layer", "", [
          field("Genres", genres),
          field("Tags", tags),
          field("Content warnings", warns),
          field("Custom lists", mv.customListChips(e)),
          field("CG unlocked", cgUn),
          field("CG total known", cgTot),
          field("Notes", notes, "med-span-2")
        ], { cols: 2 })
      ],
      onSave: save,
      onDelete: function () {
        mv.deleteEntry(e, "Delete “" + e.title + "” — including its routes, chapters and quote log?",
          function () { overlay.close(); }, onSaved);
      },
      focus: isNew ? title : status
    });
    overlayRef = overlay;
    renderChapterTab();
    if (opts.chapter != null && chTab) overlay.showSection("chapter");
    return overlay;
  }
  KOS.vnEditor = vnEditor;

  /* The Shrine and Matrix open entries through KOS.mediaEditor — register
     with the dispatcher (core/media.js) */
  KOS.mediaEditors.vn = vnEditor;

  /* ================= cards ================= */
  /* the card's everyday log action, by what counts: "+1 ch" where a
     chapter is the unit, "+1 hr" where hours are; routes are named and a
     percentage is set in the editor, so those get none. null = no button. */
  function quickBump(e) {
    if (e.status !== "inProgress") return null;
    var src = progressSource(e);
    if (src === "chapters" && (e.chapters || []).some(function (c) { return c.status !== "completed"; })) {
      return { unit: "ch", title: "Complete the next chapter", run: bumpChapter };
    }
    if (src === "time") return { unit: "hr", title: "Log another hour played", run: bumpHour };
    return null;
  }
  function gridCard(e, rerender) {
    var bump = quickBump(e);
    return KOS.medview.card(e, rerender, {
      hook: "vn.card", kanji: mod().kanji,
      chips: [cwChip(e), e.developer ? el("span", { class: "k-mcard-sub", "data-ui": "books.author", text: e.developer }) : null],
      prog: metaLine(e) || "nothing tracked yet",
      unit: bump ? bump.unit : "", bumpTitle: bump ? bump.title : "",
      onBump: bump ? function () { bump.run(e, rerender); } : null,
      open: function () { vnEditor(e, rerender); }
    });
  }
  /* Chapter select (review B): the vault as a visual novel's own chapter
     menu — each VN tracked by chapter is a panel with its chapters laid out
     as art cards in play order, played ones marked, the next unplayed one
     flagged "Next", unowned ones dimmed. A card opens that chapter's tab. */
  function chapterSelect(e, rerender) {
    var chs = e.chapters || [];
    var next = chs.findIndex(function (c) { return c.status !== "completed"; });
    var done = chs.filter(function (c) { return c.status === "completed"; }).length;
    var strip = el("div", { class: "k-vn-chs-strip", role: "list", "aria-label": e.title + " chapters" }, chs.map(function (c, i) {
      var card = el("button", { type: "button", class: "k-vn-chs-card", "data-ui": "vn.chs-card", role: "listitem",
        "aria-label": c.name + " — " + KOS.media.STATUS_LABEL[c.status] + (c.owned ? "" : ", not owned") + (i === next ? ", next to play" : ""),
        onclick: function () { vnEditor(e, rerender, { chapter: i }); } }, [
        el("span", { class: "k-vn-chs-art", "aria-hidden": "true" }, [
          c.coverUrl ? KOS.imageCrop.image(c.coverUrl, { alt: "", loading: "lazy" }, c.coverCrop) : el("span", { class: "k-vn-chs-no", text: String(i + 1) }),
          c.status === "completed" ? el("span", { class: "k-bk-vol-read", text: "✓" }) : null,
          i === next ? el("span", { class: "k-vn-chs-next", text: "▶ Next" }) : null
        ].filter(Boolean)),
        el("span", { class: "k-vn-chs-n k-mono", text: "Chapter " + (i + 1) }),
        el("span", { class: "k-vn-chs-t k-ellipsis", title: c.name, text: c.name })
      ]);
      card.style.setProperty("--spine", KOS.books && KOS.books.spineColor ? KOS.books.spineColor(e.title + i) : "var(--s3)");
      if (!c.owned) KOS.ui.state(card, "missing", true);
      if (c.status === "completed") KOS.ui.state(card, "done", true);
      return card;
    }));
    return el("section", { class: "k-vn-chs", "data-ui": "vault.card vn.chs", "aria-label": e.title }, [
      el("header", { class: "k-vn-chs-head" }, [
        el("span", { class: "k-vn-chs-cover" }, [KOS.medview.cover(e, mod().kanji)]),
        el("div", { class: "k-vn-chs-id" }, [
          el("button", { type: "button", class: "k-vn-chs-title", "data-ui": "vault.title", text: e.title, onclick: function () { vnEditor(e, rerender); } }),
          el("span", { class: "k-vn-chs-sub", text: [e.developer, done + " of " + (e.chaptersTotal || chs.length) + " played"].filter(Boolean).join(" · ") })
        ])
      ]),
      /* horizontal overflow is declared through the shared scroller (invariant 50) */
      KOS.ui.scroller(strip, { className: "k-vn-chs-scroll", label: e.title + " chapters", prevLabel: "Earlier chapters", nextLabel: "Later chapters" })
    ]);
  }

  var LIST_COLS = ["Progress", "Played", "Length"];
  function listRow(e, rerender) {
    var bump = quickBump(e);
    return KOS.medview.listRow(e, mod(), rerender, {
      hook: "vn.card",
      subline: [e.developer].concat(e.genres.slice(0, e.developer ? 1 : 2)).filter(Boolean).join(" · "),
      chips: [cwChip(e)],
      cols: [KOS.media.progressText(e), e.playtimeHours ? e.playtimeHours + " h" : null, lengthText(e.extra)],
      unit: bump ? bump.unit : "", bumpTitle: bump ? bump.title : "",
      onBump: bump ? function () { bump.run(e, rerender); } : null,
      open: function () { vnEditor(e, rerender); }
    });
  }

  /* ================= the VN view ================= */
  KOS.views.vn = function (main) {
    KOS.shell.tree("none");
    var p = prefs();
    var mv = KOS.medview;

    if (mv.unavailable(main)) return;

    var page = mv.vaultPage(main, { kicker: "Collection · 選", title: "Visual Novels",
      sub: "VNDB fills the covers and tags — the routes, quotes and warnings are yours." });

    /* toolbar — the shared pieces come from the medview toolkit */
    var search = mv.searchInput("Search visual novel titles");
    var genreSel = mv.facetSelect("Filter by genre");
    var devSel = mv.facetSelect("Filter by developer");
    var sortSel = mv.sortSelect(p.sort, { progress: "Progress" });
    var layoutBtn = mv.layoutToggle(p, function () { persist(p); refresh(); },
      [{ id: "chapters", glyph: "章", label: "Chapter select" }]);
    var rail = mv.filterRail("vn", function () { refresh(); });

    /* the shared toolbar (Category 7 Phase D) — the same controls the
       other three vaults show, in the same order */
    var bar = mv.toolbar({
      label: "Visual novel vault controls",
      search: search, sort: sortSel, layout: layoutBtn,
      filters: [
        mv.selFacet("Genre or tag", genreSel, refresh),
        mv.selFacet("Developer", devSel, refresh)
      ],
      onClear: refresh,
      actions: [
        { heading: "This vault" },
        { label: "The numbers", glyph: "◫", hint: "Composition, taste and pace",
          onSelect: function () { mv.statsModal("vn", mod()); } },
        { label: "Find new titles…", glyph: "⊕", hint: "Search all of VNDB, not your vault",
          onSelect: function () { KOS.mediaSearch.open("vn", refreshAll); } },
        { heading: "Elsewhere" },
        { label: "Personal deck", glyph: "❝", hint: "The flashcards your quotes became",
          onSelect: function () { KOS.show("personaldeck"); } },
        { label: "Your VNDB profile", glyph: "＠", hint: "Labels, length votes, list stats",
          onSelect: function () { KOS.show("vndbprofile"); } },
        { label: "Sync & Import", glyph: "⇅", onSelect: function () { KOS.show("mediasync"); } }
      ],
      primary: mv.primaryButton("+ Add", null, function () { vnEditor(null, refreshAll); })
    });
    page.setBar(bar);
    page.setRail(rail.root);

    function refreshAll() { rail.reload(); refresh(); }

    var area = mv.resultsArea(page.mainCol, function (e) {
      return p.layout === "list" ? listRow(e, refreshAll) : p.layout === "chapters" ? chapterSelect(e, refreshAll) : gridCard(e, refreshAll);
    }, { countHost: page.controls });

    /* Facet fills. VNDB content tags are written into `genres` by the sync
       mapper (invariant #29), so this one select genuinely carries both,
       split for display: real genres first, common tags next, rare tags
       last, each option carrying its own count (invariant 62). */
    KOS.mediadb.query({ module: "vn" }, function (err, rows) {
      if (err) return;
      mv.fillFacetSel(genreSel, mv.tallyFacet(rows, "genres"), "All genres and tags");
      mv.fillFacetSel(devSel, mv.tallyFacet(rows, "developer"), "All developers",
        { genreLabel: "Developers", tagLabel: "Developers", rareBelow: 0 });
    });

    function refresh() {
      bar.sync();
      /* claim the render generation before the query so a slow result for a
         filter you already left can never paint over the current one */
      var token = area.begin();
      KOS.mediadb.query({
        module: "vn", status: rail.status() || undefined,
        customList: rail.customList() || undefined,
        genre: genreSel.value || undefined,
        developer: devSel.value || undefined,
        search: search.value.trim() || undefined, sort: sortSel.value
      }, function (err, rows) {
        if (!area.current(token)) return;
        area.layout(p.layout, LIST_COLS);
        /* Chapter select lists the VNs you track by chapter */
        if (!err && p.layout === "chapters") rows = rows.filter(function (e) { return e.chapters && e.chapters.length; });
        if (err) {
          area.clear();
          area.countLine.textContent = "Query failed: " + err.message;
          return;
        }
        var filtered = rail.status() || rail.customList() || genreSel.value || devSel.value || search.value;
        area.countLine.textContent = rows.length + (rows.length === 1 ? " visual novel" : " visual novels") + (filtered ? " (filtered)" : "");
        if (!rows.length) {
          area.clear();
          area.holder.appendChild(mv.emptyState(
            p.layout === "chapters"
              ? "No visual novel is tracked by chapter yet — open one and add its chapters on the Chapters tab."
              : filtered
              ? "Nothing matches this filter."
              : "The VN vault is empty. Connect your VNDB (a personal token — one paste, no OAuth dance) or add a title by hand, then build its route list as you play.",
            [
              el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }),
              el("button", { type: "button", class: "k-btn", text: "+ Add manually", onclick: function () { vnEditor(null, refreshAll); } })
            ]));
          return;
        }
        area.start(rows);
      });
    }

    /* the facet selects are wired by mv.selFacet inside the toolbar */
    search.addEventListener("input", KOS.ui.debounce(refresh, 220));
    sortSel.addEventListener("change", function () { p.sort = sortSel.value; persist(p); refresh(); });

    function mountHero() { mv.heroCard(page.heroHolder, "vn", mod(), function () { refreshAll(); mountHero(); }); }
    mountHero();
    refresh();
  };
})();
