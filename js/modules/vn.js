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

  /* ================= send-a-quote-to-flashcards ================= */
  /* The quote lands in the PERSONAL deck (sid "personal") — a VN line has
     no A-level subject and is not forced into one. Pre-filled but fully
     editable before saving, so the user shapes the recall prompt. */
  function quoteToCardForm(e, quote, onDone) {
    var q = el("textarea", { class: "k-input", "data-ui": "ui.note-area", rows: 2, "aria-label": "Front of the card" });
    q.value = "Complete the quote — " + e.title + (quote.context ? " (" + quote.context + ")" : "") +
      ": “" + quote.text.slice(0, Math.min(30, Math.ceil(quote.text.length / 3))) + "…”";
    var a = el("textarea", { class: "k-input", "data-ui": "ui.note-area", rows: 2, "aria-label": "Back of the card" });
    a.value = quote.text;
    return el("div", { class: "k-vn-qform", "data-ui": "vn.quote-form" }, [
      el("p", { class: "k-field-hint", text: "Send to flashcards — lands in the Personal deck, not a subject" }),
      q, a,
      el("div", { class: "k-cluster" }, [
        el("button", { type: "button", class: "k-btn k-btn--sm k-btn--primary", "data-intent": "primary", text: "+ Add to Personal deck", onclick: function (ev) {
          ev.preventDefault();
          if (!q.value.trim() || !a.value.trim()) { KOS.ui.toast("Both sides are needed.", true); return; }
          KOS.srs.addCustom(KOS.srs.PERSONAL_SID, "vn", q.value.trim(), a.value.trim(),
            { src: { module: "vn", entryId: e.id != null ? e.id : null, title: e.title } });
          KOS.ui.toast("Card added to the Personal deck — study it from Due Today → Personal deck.");
          onDone();
        } }),
        el("button", { type: "button", class: "k-btn k-btn--sm", text: "Cancel", onclick: function (ev) { ev.preventDefault(); onDone(); } })
      ])
    ]);
  }

  /* ================= the editor modal (shared medview shell) ================= */
  function vnEditor(entry, onSaved) {
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
    var modeSel = el("select", { class: "k-input", "data-ui": "ui.status-select", "aria-label": "What counts as progress" }, [
      ["", "Automatic — routes, chapters, hours, then a percentage"],
      ["routes", "Routes cleared"],
      ["chapters", "Chapters / parts completed"],
      ["time", "Hours played vs VNDB's length"],
      ["percent", "A percentage I set"]
    ].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    modeSel.value = e.progressMode || "";
    var pctIn = el("input", { type: "number", class: "k-input", "data-ui": "ui.quick-add vault.num", min: "0", max: "100", step: "1",
      value: e.progressPercent != null ? String(e.progressPercent) : "", placeholder: "0–100",
      "aria-label": "How far through, as a percentage" });
    var pctField = field("How far through (%)", pctIn);
    var hoursIn = el("input", { type: "number", class: "k-input", "data-ui": "ui.quick-add vault.num", min: "0", step: "0.5",
      value: e.playtimeHours != null ? String(e.playtimeHours) : "", placeholder: "0",
      "aria-label": "Hours played" });
    var hoursField = field("Hours played", hoursIn);
    var lengthNoteEl = el("p", { class: "k-field-hint k-medit-wide", "data-ui": "part.sub vn.progress-note vn.length-note vault.span-2" });
    var progressNoteEl = el("p", { class: "k-vn-counting k-medit-wide", "data-ui": "part.sub vn.progress-note vault.span-2" });
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
      hoursField.hidden = !timing;
      lengthNoteEl.hidden = !timing;
      lengthNoteEl.textContent = lengthNote(e);
      progressNoteEl.textContent = progressNote(e);
    }
    modeSel.addEventListener("change", syncProgressUI);
    pctIn.addEventListener("input", syncProgressUI);
    hoursIn.addEventListener("input", syncProgressUI);
    renderRoutes();

    /* --- chapters/parts (Build 3j — manual, parallel to routes) ---
       For VNs with internal structure the routes list doesn't capture:
       the user names their own chapters/arcs/parts, each with the shared
       status enum and a note. Independent of routes (not nested), never
       auto-filled from VNDB. A kinetic novel counts its progress here. */
    var chaptersWrap = el("div", { class: "k-vn-list k-medit-wide", "data-ui": "vn.routes vn.chapters" });
    function renderChapters() {
      chaptersWrap.innerHTML = "";
      var cp = chapterProgress(e);
      chaptersWrap.appendChild(el("div", { class: "k-vn-head" }, [
        el("b", { text: "Chapters / parts" }),
        el("span", { class: "k-mono k-muted", text: cp.total ? "Completed: " + cp.done + " / " + cp.total : "" }),
        el("p", { class: "k-field-hint", "data-ui": "part.sub", text: cp.total
          ? cp.done + " of " + cp.total + " completed — your own division, independent of the routes above"
          : "for VNs with chapters/arcs the route list doesn't capture — a kinetic novel counts progress by these" })
      ]));
      e.chapters.forEach(function (c) {
        var st = el("select", { class: "k-pill-select", "data-ui": "ui.status-select vn.chapter-status", "aria-label": "Status: " + c.name }, STATUSES.map(function (s) {
          return el("option", { value: s, text: KOS.media.STATUS_LABEL[s] });
        }));
        st.value = c.status;
        st.addEventListener("change", function () { c.status = st.value; renderChapters(); });
        var name = el("input", { type: "text", class: "k-vn-name", "data-ui": "ui.quick-add vn.route-name", value: c.name,
          "aria-label": "Chapter name" });
        name.addEventListener("change", function () { c.name = name.value.trim() || c.name; });
        var note = el("input", { type: "text", class: "k-vn-name k-vn-note", "data-ui": "ui.quick-add vn.chapter-note", value: c.notes, placeholder: "notes…",
          "aria-label": "Notes on " + c.name });
        note.addEventListener("change", function () { c.notes = note.value; });
        var rowC = el("div", { class: "k-vn-row k-vn-row--ch", "data-ui": "vn.route-row vn.ch-row" }, [
          name, st, note,
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Remove chapter " + c.name, text: "✕", onclick: function (ev) {
            ev.preventDefault();
            e.chapters = e.chapters.filter(function (x) { return x !== c; });
            renderChapters();
          } })
        ]);
        if (c.status === "completed") KOS.ui.state(rowC, "cleared", true);
        chaptersWrap.appendChild(rowC);
      });
      var newName = el("input", { type: "text", class: "k-vn-name", "data-ui": "ui.quick-add vn.route-name", "aria-label": "New chapter name", placeholder: "Chapter name — “Chapter 1”, “Answer arc”…" });
      function addChapter(ev) {
        ev.preventDefault();
        if (!newName.value.trim()) { KOS.ui.toast("Name the chapter first.", true); return; }
        e.chapters.push(KOS.mediadb.normChapter({ name: newName.value.trim() }));
        renderChapters();
      }
      newName.addEventListener("keydown", function (ev) { if (ev.key === "Enter") addChapter(ev); });
      chaptersWrap.appendChild(el("div", { class: "k-vn-add", "data-ui": "vn.route-add" }, [
        newName,
        el("button", { type: "button", class: "k-btn k-btn--sm", text: "+ Add chapter", onclick: addChapter })
      ]));
      syncProgressUI();
    }
    renderChapters();

    /* --- CG gallery counter (numbers only, never artwork) --- */
    var cgUn = el("input", { type: "number", class: "k-input", "data-ui": "ui.quick-add vault.num", min: "0", value: String(e.cgGallery.unlockedCount || 0) });
    var cgTot = el("input", { type: "number", class: "k-input", "data-ui": "ui.quick-add vault.num", min: "0", placeholder: "?", value: e.cgGallery.totalKnown != null ? String(e.cgGallery.totalKnown) : "" });

    /* --- quote log --- */
    var quotesWrap = el("div", { class: "k-vn-list k-vn-quotes", "data-ui": "vn.quotes" });
    function renderQuotes() {
      quotesWrap.innerHTML = "";
      quotesWrap.appendChild(el("div", { class: "k-vn-head" }, [
        el("b", { text: "Quote log" }),
        el("p", { class: "k-field-hint", "data-ui": "part.sub", text: e.quotes.length
          ? e.quotes.length + (e.quotes.length === 1 ? " line kept" : " lines kept") + " — any of them can become a flashcard"
          : "lines worth keeping — text, optional context, and a route to the flashcard system" })
      ]));
      e.quotes.slice().reverse().forEach(function (q) {
        var row = el("div", { class: "k-vn-quote", "data-ui": "vn.quote" });
        var formHolder = el("div", {});
        row.appendChild(el("blockquote", { class: "k-vn-quote-text", text: "“" + q.text + "”" }));
        row.appendChild(el("div", { class: "k-vn-quote-meta" }, [
          el("span", { text: (q.context ? q.context + " · " : "") + new Date(q.loggedAt).toLocaleDateString() }),
          el("button", { type: "button", class: "k-link k-spacer", text: "+ Add to Personal deck", title: "Send to the Personal deck (editable first)", onclick: function (ev) {
            ev.preventDefault();
            formHolder.innerHTML = "";
            formHolder.appendChild(quoteToCardForm(e, q, function () { formHolder.innerHTML = ""; }));
          } }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Delete quote", text: "✕", onclick: function (ev) {
            ev.preventDefault();
            e.quotes = e.quotes.filter(function (x) { return x !== q; });
            renderQuotes();
          } })
        ]));
        row.appendChild(formHolder);
        quotesWrap.appendChild(row);
      });
      var qText = el("textarea", { class: "k-input", "data-ui": "ui.note-area vn.quote-in", rows: 2, "aria-label": "Quote text", placeholder: "“The universe has a beginning, but no end.” — the line itself" });
      var qCtx = el("input", { type: "text", class: "k-input", "data-ui": "ui.quick-add", "aria-label": "Quote context or route (optional)", placeholder: "context / route (optional)" });
      quotesWrap.appendChild(el("div", { class: "k-vn-qadd", "data-ui": "vn.quote-add" }, [
        qText, qCtx,
        el("button", { type: "button", class: "k-btn k-btn--sm k-btn--primary", "data-intent": "primary", text: "❝ Log quote", onclick: function (ev) {
          ev.preventDefault();
          if (!qText.value.trim()) { KOS.ui.toast("The quote text is needed.", true); return; }
          e.quotes.push(KOS.mediadb.normQuote({ text: qText.value.trim(), context: qCtx.value.trim() }));
          renderQuotes();
        } })
      ]));
    }
    renderQuotes();

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

    var overlay = mv.editorModal({
      isNew: isNew, label: "Visual Novels", hook: "vn.editor",
      subtitle: e.syncSource === "vndb" ? "synced from VNDB — a Sync overwrites list state, keeps your routes/quotes/CG/warnings" : "manual entry",
      form: [
        mv.editorSection("identity", "Identity & artwork", "The title, studio and cover used throughout the vault.", [
          field("Title", title, "med-span-2"),
          field("Developer", developer),
          field("Cover URL", el("div", { class: "k-stack k-medit-cover" }, [coverU, coverPosition.node]))
        ]),
        mv.editorSection("progress", "Progress", "Status, and whichever of routes, chapters, hours played or a set percentage counts as this VN's progress.", [
          field("Status", status),
          field("Score /10", score),
          field("What counts", modeSel),
          hoursField,
          pctField,
          lengthNoteEl,
          progressNoteEl,
          routesWrap,
          chaptersWrap
        ]),
        mv.editorSection("ownership", "Ownership", "How you own it and whether it belongs in the Shrine.", [
          field("Ownership", own),
          field("Favourite ♥", el("span", { class: "k-check" }, [fav]))
        ]),
        mv.editorSection("dates", "Dates", "When play started and finished.", [
          field("Started", started),
          field("Finished", finished)
        ]),
        mv.editorSection("structure", "CG gallery", "A counter only; no artwork is stored.", [
          field("Unlocked", cgUn),
          field("Total known", cgTot)
        ]),
        mv.editorSection("highlights", "Quote log", "Lines worth keeping can become personal flashcards.", [
          quotesWrap
        ], { raw: true }),
        mv.editorSection("taxonomy", "Genres & tags", "Shared filters plus your own content warnings.", [
          field("Genres", genres, "med-span-2"),
          field("Tags", tags, "med-span-2"),
          field("Content warnings", warns, "med-span-2")
        ]),
        mv.editorSection("lists", "Lists", "Your personal collection groupings.", [
          field("Custom lists", mv.customListChips(e), "med-span-2")
        ]),
        mv.editorSection("source", "Source & sync", "VNDB identity and fields that may refresh.", [
          mv.sourceInfo(e, e.syncSource === "vndb" ? "VNDB" : "Local record"),
          field("VNDB id", vndbId),
          lengthText(e.extra) ? el("p", { class: "k-field-hint k-medit-wide", "data-ui": "part.sub vault.span-2", text: "VNDB length estimate · " + lengthText(e.extra) }) : null
        ]),
        mv.editorSection("notes", "Notes", "Your private play notes and route context.", [
          field("Notes", notes, "med-span-2")
        ])
      ],
      onSave: save,
      onDelete: function () {
        mv.deleteEntry(e, "Delete “" + e.title + "” — including its routes, chapters and quote log?",
          function () { overlay.close(); }, onSaved);
      },
      focus: title
    });
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
  function listRow(e, rerender) {
    var bump = quickBump(e);
    return KOS.medview.listRow(e, mod(), rerender, {
      hook: "vn.card",
      subline: e.developer || e.genres.slice(0, 2).join(" · "),
      prog: metaLine(e),
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
    var layoutBtn = mv.layoutToggle(p, function () { persist(p); refresh(); });
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
      return p.layout === "list" ? listRow(e, refreshAll) : gridCard(e, refreshAll);
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
        area.layout(p.layout);
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
            filtered
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
