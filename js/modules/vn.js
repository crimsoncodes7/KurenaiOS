/* Kurenai OS — modules/vn.js
   The Visual Novels module (Build 3c). VNDB sync populates the metadata
   half (title, developer, cover, tags-as-genres, length estimate); the
   layer that makes the module worth having is MANUAL, built up per VN:

   - Routes: VNDB has no clean structured route data for most titles, so
     the route list is the user's own — name it, clear it, date it. A VN's
     "progress" IS its routes cleared (derived in mediadb.normalise).
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

  function prefs() {
    var m = store.state.media = store.state.media || {};
    m.vn = m.vn || { layout: "grid", sort: "updated" };
    return m.vn;
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

  KOS.vn = {
    routeProgress: routeProgress,
    chapterProgress: chapterProgress,
    cgText: cgText,
    lengthText: lengthText
  };

  /* ================= little shared bits ================= */
  var mod = function () { return KOS.media.module("vn"); };
  function cwChip(e) {
    return (e.contentWarnings && e.contentWarnings.length)
      ? el("span", { class: "med-chip vn-cw", title: "Content warnings: " + e.contentWarnings.join(", "),
          text: "⚠ " + e.contentWarnings.length })
      : null;
  }
  function cover(e) { return KOS.medview.cover(e, mod().kanji); }
  function metaLine(e) {
    var bits = [];
    var rp = routeProgress(e);
    if (rp.total) bits.push(rp.cleared + "/" + rp.total + " routes");
    var cp = chapterProgress(e);
    if (cp.total) bits.push(cp.done + "/" + cp.total + " ch");
    var cg = cgText(e);
    if (cg) bits.push(cg);
    if (e.quotes && e.quotes.length) bits.push("❝ " + e.quotes.length);
    var len = lengthText(e.extra);
    if (len) bits.push(len);
    return bits.join(" · ");
  }

  /* ================= send-a-quote-to-flashcards ================= */
  /* The quote lands in the PERSONAL deck (sid "personal") — a VN line has
     no A-level subject and is not forced into one. Pre-filled but fully
     editable before saving, so the user shapes the recall prompt. */
  function quoteToCardForm(e, quote, onDone) {
    var q = el("textarea", { class: "note-area fc-form-q", rows: 2 });
    q.value = "Complete the quote — " + e.title + (quote.context ? " (" + quote.context + ")" : "") +
      ": “" + quote.text.slice(0, Math.min(30, Math.ceil(quote.text.length / 3))) + "…”";
    var a = el("textarea", { class: "note-area fc-form-a", rows: 2 });
    a.value = quote.text;
    return el("div", { class: "fc-form vn-quote-form" }, [
      el("div", { class: "fc-form-h", text: "Send to flashcards — lands in the Personal deck, not a subject" }),
      q, a,
      el("div", { class: "lab-controls" }, [
        el("button", { class: "btn primary", text: "+ Add to Personal deck", onclick: function (ev) {
          ev.preventDefault();
          if (!q.value.trim() || !a.value.trim()) { KOS.ui.toast("Both sides are needed.", true); return; }
          KOS.srs.addCustom(KOS.srs.PERSONAL_SID, "vn", q.value.trim(), a.value.trim(),
            { src: { module: "vn", entryId: e.id != null ? e.id : null, title: e.title } });
          KOS.ui.toast("Card added to the Personal deck — study it from Due Today → Personal deck.");
          onDone();
        } }),
        el("button", { class: "btn", text: "Cancel", onclick: function (ev) { ev.preventDefault(); onDone(); } })
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

    /* --- identity + list state --- */
    var title = el("input", { type: "text", class: "todo-in", value: e.title === "Untitled" && isNew ? "" : e.title, placeholder: "Title" });
    var developer = el("input", { type: "text", class: "todo-in", value: e.developer, placeholder: "Developer (filled by sync when linked)" });
    var vndbId = el("input", { type: "text", class: "todo-in med-num vn-id", value: e.externalIds.vndbId || "",
      placeholder: "v17", title: "The id from the VNDB page URL — linking it lets enrichment fill cover/developer/tags" });
    var status = el("select", { class: "status-sel" }, STATUSES.map(function (s) {
      return el("option", { value: s, text: KOS.media.STATUS_LABEL[s] });
    }));
    status.value = e.status;
    var score = el("input", { type: "number", class: "todo-in med-num", min: "0", max: "10", step: "0.5", value: String(e.score || 0) });
    var own = el("select", { class: "status-sel" }, [["digital", "Digital"], ["physical", "Physical"], ["steam", "Steam"], ["unset", "—"]].map(function (o) {
      return el("option", { value: o[0], text: o[1] });
    }));
    own.value = e.ownership;
    var started = el("input", { type: "date", class: "todo-in", value: e.dates.started || "" });
    var finished = el("input", { type: "date", class: "todo-in", value: e.dates.finished || "" });
    var fav = el("input", { type: "checkbox" });
    fav.checked = e.favourite;

    /* --- taxonomy --- */
    var genres = el("input", { type: "text", class: "todo-in", value: e.genres.join(", "), placeholder: "Mystery, Drama… (filled from VNDB content tags on sync)" });
    var tags = el("input", { type: "text", class: "todo-in", value: e.tags.join(", "), placeholder: "replay, untranslated…" });
    var warns = el("input", { type: "text", class: "todo-in", value: e.contentWarnings.join(", "), placeholder: "your own warnings — never auto-filled from VNDB tags" });
    var coverU = el("input", { type: "url", class: "todo-in", value: e.coverUrl || "", placeholder: "https://… (filled by sync/enrichment)" });
    var coverPosition = mv.coverPositionControl(e, coverU);
    var notes = el("textarea", { class: "note-area", rows: 3, placeholder: "Notes…" });
    notes.value = e.notes || "";

    /* --- routes (manual — VNDB gives no structured route data) --- */
    var routesWrap = el("div", { class: "vn-routes" });
    function renderRoutes() {
      routesWrap.innerHTML = "";
      var rp = routeProgress(e);
      routesWrap.appendChild(el("div", { class: "vn-sec-h" }, [
        el("b", { text: "Routes" }),
        el("span", { class: "sub", text: rp.total
          ? rp.cleared + " of " + rp.total + " cleared — your own list; VNDB doesn't know a VN's routes"
          : "none yet — add the routes as you meet them (this is what drives a VN's progress)" })
      ]));
      e.routes.forEach(function (r) {
        var done = el("input", { type: "checkbox" });
        done.checked = r.cleared;
        done.addEventListener("change", function () {
          r.cleared = done.checked;
          r.completedAt = done.checked ? (r.completedAt || KOS.srs.todayISO()) : null;
          renderRoutes();
        });
        var name = el("input", { type: "text", class: "todo-in vn-route-name", value: r.name });
        name.addEventListener("change", function () { r.name = name.value.trim() || r.name; });
        routesWrap.appendChild(el("div", { class: "vn-route-row" + (r.cleared ? " cleared" : "") }, [
          el("label", { class: "vn-route-done" }, [done]),
          name,
          el("span", { class: "sub vn-route-date", text: r.cleared ? (r.completedAt || "") : "" }),
          el("button", { class: "mini-btn vn-route-del", "aria-label": "Remove route " + r.name, text: "✕", onclick: function (ev) {
            ev.preventDefault();
            e.routes = e.routes.filter(function (x) { return x !== r; });
            renderRoutes();
          } })
        ]));
      });
      var newName = el("input", { type: "text", class: "todo-in vn-route-name", "aria-label": "New route name", placeholder: "Route name — “Kurisu”, “True End”…" });
      function addRoute(ev) {
        ev.preventDefault();
        if (!newName.value.trim()) { KOS.ui.toast("Name the route first.", true); return; }
        e.routes.push(KOS.mediadb.normRoute({ name: newName.value.trim() }));
        renderRoutes();
      }
      newName.addEventListener("keydown", function (ev) { if (ev.key === "Enter") addRoute(ev); });
      routesWrap.appendChild(el("div", { class: "vn-route-add" }, [
        newName,
        el("button", { class: "btn", text: "+ Add route", onclick: addRoute })
      ]));
    }
    renderRoutes();

    /* --- chapters/parts (Build 3j — manual, parallel to routes) ---
       For VNs with internal structure the routes list doesn't capture:
       the user names their own chapters/arcs/parts, each with the shared
       status enum and a note. Independent of routes (not nested), never
       auto-filled from VNDB, never drives progress. Most VNs simply
       leave this empty. */
    var chaptersWrap = el("div", { class: "vn-routes vn-chapters" });
    function renderChapters() {
      chaptersWrap.innerHTML = "";
      var cp = chapterProgress(e);
      chaptersWrap.appendChild(el("div", { class: "vn-sec-h" }, [
        el("b", { text: "Chapters / parts" }),
        el("span", { class: "sub", text: cp.total
          ? cp.done + " of " + cp.total + " completed — your own division, independent of the routes above"
          : "optional — for VNs with chapters/arcs the route list doesn't capture; define your own, or leave empty" })
      ]));
      e.chapters.forEach(function (c) {
        var st = el("select", { class: "status-sel vn-ch-status" }, STATUSES.map(function (s) {
          return el("option", { value: s, text: KOS.media.STATUS_LABEL[s] });
        }));
        st.value = c.status;
        st.addEventListener("change", function () { c.status = st.value; renderChapters(); });
        var name = el("input", { type: "text", class: "todo-in vn-route-name", value: c.name });
        name.addEventListener("change", function () { c.name = name.value.trim() || c.name; });
        var note = el("input", { type: "text", class: "todo-in vn-ch-note", value: c.notes, placeholder: "notes…" });
        note.addEventListener("change", function () { c.notes = note.value; });
        chaptersWrap.appendChild(el("div", { class: "vn-route-row vn-ch-row" + (c.status === "completed" ? " cleared" : "") }, [
          name, st, note,
          el("button", { class: "mini-btn vn-route-del", "aria-label": "Remove chapter " + c.name, text: "✕", onclick: function (ev) {
            ev.preventDefault();
            e.chapters = e.chapters.filter(function (x) { return x !== c; });
            renderChapters();
          } })
        ]));
      });
      var newName = el("input", { type: "text", class: "todo-in vn-route-name", "aria-label": "New chapter name", placeholder: "Chapter name — “Chapter 1”, “Answer arc”…" });
      function addChapter(ev) {
        ev.preventDefault();
        if (!newName.value.trim()) { KOS.ui.toast("Name the chapter first.", true); return; }
        e.chapters.push(KOS.mediadb.normChapter({ name: newName.value.trim() }));
        renderChapters();
      }
      newName.addEventListener("keydown", function (ev) { if (ev.key === "Enter") addChapter(ev); });
      chaptersWrap.appendChild(el("div", { class: "vn-route-add" }, [
        newName,
        el("button", { class: "btn", text: "+ Add chapter", onclick: addChapter })
      ]));
    }
    renderChapters();

    /* --- CG gallery counter (numbers only, never artwork) --- */
    var cgUn = el("input", { type: "number", class: "todo-in med-num", min: "0", value: String(e.cgGallery.unlockedCount || 0) });
    var cgTot = el("input", { type: "number", class: "todo-in med-num", min: "0", placeholder: "?", value: e.cgGallery.totalKnown != null ? String(e.cgGallery.totalKnown) : "" });

    /* --- quote log --- */
    var quotesWrap = el("div", { class: "vn-quotes" });
    function renderQuotes() {
      quotesWrap.innerHTML = "";
      quotesWrap.appendChild(el("div", { class: "vn-sec-h" }, [
        el("b", { text: "Quote log" }),
        el("span", { class: "sub", text: e.quotes.length
          ? e.quotes.length + (e.quotes.length === 1 ? " line kept" : " lines kept") + " — any of them can become a flashcard"
          : "lines worth keeping — text, optional context, and a route to the flashcard system" })
      ]));
      e.quotes.slice().reverse().forEach(function (q) {
        var row = el("div", { class: "vn-quote" });
        var formHolder = el("div", {});
        row.appendChild(el("blockquote", { class: "vn-quote-text", text: "“" + q.text + "”" }));
        row.appendChild(el("div", { class: "vn-quote-meta" }, [
          el("span", { class: "sub", text: (q.context ? q.context + " · " : "") + new Date(q.loggedAt).toLocaleDateString() }),
          el("button", { class: "mini-btn", text: "⇢ flashcard", title: "Send to the Personal deck (editable first)", onclick: function (ev) {
            ev.preventDefault();
            formHolder.innerHTML = "";
            formHolder.appendChild(quoteToCardForm(e, q, function () { formHolder.innerHTML = ""; }));
          } }),
          el("button", { class: "mini-btn danger", "aria-label": "Delete quote", text: "✕", onclick: function (ev) {
            ev.preventDefault();
            e.quotes = e.quotes.filter(function (x) { return x !== q; });
            renderQuotes();
          } })
        ]));
        row.appendChild(formHolder);
        quotesWrap.appendChild(row);
      });
      var qText = el("textarea", { class: "note-area vn-quote-in", rows: 2, "aria-label": "Quote text", placeholder: "“The universe has a beginning, but no end.” — the line itself" });
      var qCtx = el("input", { type: "text", class: "todo-in", "aria-label": "Quote context or route (optional)", placeholder: "context / route (optional)" });
      quotesWrap.appendChild(el("div", { class: "vn-quote-add" }, [
        qText, qCtx,
        el("button", { class: "btn", text: "❝ Log quote", onclick: function (ev) {
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
          if (rec.quotes.length > quotesAtOpen) return "quote";
          return null;
        },
        close: function () { overlay.close(); }, onSaved: onSaved
      });
    }

    var overlay = mv.editorModal({
      isNew: isNew, label: "Visual Novels", className: "vn-modal",
      subtitle: e.syncSource === "vndb" ? "synced from VNDB — a Sync overwrites list state, keeps your routes/quotes/CG/warnings" : "manual entry",
      form: [
        mv.editorSection("identity", "Identity & artwork", "The title, studio and cover used throughout the vault.", [
          field("Title", title, "med-span-2"),
          field("Developer", developer),
          field("Cover URL", el("div", { class: "image-field" }, [coverU, coverPosition.node]))
        ]),
        mv.editorSection("progress", "Progress", "Status and route completion are the primary progress record.", [
          field("Status", status),
          field("Score /10", score),
          routesWrap
        ]),
        mv.editorSection("ownership", "Ownership", "How you own it and whether it belongs in the Shrine.", [
          field("Ownership", own),
          field("Favourite ♥", el("span", { class: "med-favwrap" }, [fav]))
        ]),
        mv.editorSection("dates", "Dates", "When play started and finished.", [
          field("Started", started),
          field("Finished", finished)
        ]),
        mv.editorSection("structure", "Chapters & gallery", "Optional detail that stays independent of route progress.", [
          chaptersWrap,
          el("div", { class: "vn-cg" }, [
            el("div", { class: "vn-sec-h" }, [
              el("b", { text: "CG gallery" }),
              el("span", { class: "sub", text: "A progress counter only; no artwork is stored." })
            ]),
            el("div", { class: "med-form-row" }, [
              field("Unlocked", cgUn),
              field("Total known", cgTot)
            ])
          ])
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
          lengthText(e.extra) ? el("p", { class: "sub vn-length med-span-2", text: "VNDB length estimate · " + lengthText(e.extra) }) : null
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
  function gridCard(e, rerender) {
    var rp = routeProgress(e);
    /* Phase F: the card is NOT a button. It contained the favourite
       toggle, a status <select> and "+1" — an ARIA button may not hold
       interactive descendants, and a keyboard user who pressed Space on
       it scrolled the page. The card keeps its pointer shortcut; the
       TITLE is the real control, so the tab order reads
       favourite → title → status → +1 and a screen reader announces the
       entry by name instead of "button". */
    var card = el("div", { class: "med-card vn-card",
      onclick: function () { vnEditor(e, rerender); }
    }, [
      cover(e),
      el("button", { class: "med-fav" + (e.favourite ? " on" : ""), title: "Favourite — appears in the Shrine",
        "aria-label": "Toggle favourite", text: "♥", onclick: function (ev) {
          ev.stopPropagation();
          e.favourite = !e.favourite;
          KOS.mediadb.put(e, function () {});
          ev.target.classList.toggle("on", e.favourite);
        } }),
      el("div", { class: "med-card-body" }, [
        el("button", { type: "button", class: "med-title", title: e.title, text: e.title,
          onclick: function (ev) { ev.stopPropagation(); vnEditor(e, rerender); } }),
        e.developer ? el("div", { class: "bk-author", text: e.developer }) : null,
        el("div", { class: "med-meta" }, [
          cwChip(e),
          el("span", { class: "med-prog", text: metaLine(e) || "no routes yet" }),
          KOS.medview.pushChip(e, rerender)
        ]),
        el("div", { class: "med-meta med-quickrow" }, [
          KOS.medview.quickEdit(e, rerender)
        ])
      ])
    ]);
    if (rp.total) {
      card.appendChild(el("div", { class: "subj-track med-track" }, [
        el("span", { class: "subj-fill", style: "width:" + rp.pct + "%" })
      ]));
    }
    return card;
  }
  function listRow(e, rerender) {
    return KOS.medview.listRow(e, mod(), rerender, {
      subline: e.developer || e.genres.slice(0, 2).join(" · "),
      prog: metaLine(e),
      open: function () { vnEditor(e, rerender); }
    });
  }

  /* ================= the VN view ================= */
  KOS.views.vn = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var p = prefs();
    var mv = KOS.medview;

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "Collection · 選" }),
        el("h1", { text: "Visual Novels" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "VNDB fills the covers and tags — the routes, quotes and warnings are yours." })
        ])
      ])
    ]));

    if (mv.unavailable(main)) return;

    /* Build 4.0: the per-module spotlight hero (medview.heroCard) */
    var heroHolder = el("div", { class: "vh-holder" });
    main.appendChild(heroHolder);

    /* toolbar — the shared pieces come from the medview toolkit */
    var search = mv.searchInput("Search visual novel titles");
    var genreSel = el("select", { class: "status-sel", "aria-label": "Filter by genre" });
    var devSel = el("select", { class: "status-sel", "aria-label": "Filter by developer" });
    var sortSel = mv.sortSelect(p.sort, { progress: "Routes cleared" });
    var layoutBtn = mv.layoutToggle(p, function () { refresh(); });
    var rail = mv.filterRail("vn", function () { refresh(); });

    var mainCol = el("div", { class: "med-main" });
    /* the shared toolbar (Category 7 Phase D) — the same six controls the
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
      primary: el("button", { class: "btn primary", text: "+ Add", onclick: function () { vnEditor(null, refreshAll); } })
    });
    mainCol.appendChild(bar.root);
    main.appendChild(el("div", { class: "med-layout" }, [rail.root, mainCol]));

    function refreshAll() { rail.reload(); refresh(); }

    /* countLine + holder + sentinel + the lazy batch renderer */
    var area = mv.resultsArea(mainCol, function (e) {
      return p.layout === "list" ? listRow(e, refreshAll) : gridCard(e, refreshAll);
    });

    /* Facet fills. VNDB content tags are written into `genres` by the sync
       mapper (invariant #29 — they are not auto-filled from anywhere else
       and never will be), so this one select genuinely carries both. The
       audit's 64-option soup (VLT-8/G-31) is fixed by SPLITTING THE
       DISPLAY rather than the data: real genres first, common tags next,
       rare tags last, each option carrying its own count. */
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
        area.holder.className = p.layout === "list" ? "med-list" : "med-grid";
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
              el("button", { class: "btn primary", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }),
              el("button", { class: "btn", text: "+ Add manually", onclick: function () { vnEditor(null, refreshAll); } })
            ]));
          return;
        }
        area.start(rows);
      });
    }

    /* the facet selects are wired by mv.selFacet inside the toolbar */
    search.addEventListener("input", KOS.ui.debounce(refresh, 220));
    sortSel.addEventListener("change", function () { p.sort = sortSel.value; store.save(); refresh(); });

    function mountHero() { mv.heroCard(heroHolder, "vn", mod(), function () { refreshAll(); mountHero(); }); }
    mountHero();
    refresh();
  };
})();
