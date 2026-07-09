/* Kurenai OS — modules/medview.js
   The vault-view toolkit (refactor step 6, audit item A1).

   Builds 3a→3e grew the four vault views (anime → books → vn → games) by
   copy-paste before the "reuse existing X" convention crystallised — every
   view carried its own byte-identical cover renderer, lazy batch renderer,
   dropdown filler, status pill row, empty states and editor scaffolding.
   This file is the single implementation they now share. It is VIEW-layer
   (it renders DOM), so it lives with the modules it serves, not in core.

   Class names are load-bearing: the smoke suites key off .med-card,
   .med-grid, .med-empty, .med-field, .modal-ov and friends — everything
   here emits exactly the markup the four views emitted before extraction.

   A fifth media module (Music/Competitions — backlog #5) should build on
   this toolkit + KOS.mediaEditors instead of copying a sibling view.      */
(function () {
  "use strict";
  var el = KOS.ui.el;

  var BATCH = 60;   // lazy-render batch size (the 3a scale rule)
  /* display order for pills + editor status dropdowns — deliberately NOT
     mediadb.STATUSES (which is schema order, planned first) */
  var STATUSES = ["inProgress", "planned", "onHold", "completed", "dropped"];

  /* ================= availability ================= */
  var NEEDS_IDB = "The Collection Matrix needs IndexedDB, which this browser/context doesn't provide.";
  /* the canonical guard every Matrix view opens with:
     if (KOS.medview.unavailable(main)) return; */
  function unavailable(main) {
    if (KOS.mediadb.available()) return false;
    main.appendChild(el("p", { class: "fc-empty", text: NEEDS_IDB }));
    return true;
  }

  /* ================= shared display bits ================= */
  /* cover image with lazy load + kanji placeholder fallback (offline or
     broken URL) — the glyph is the module's kanji */
  function cover(e, kanji) {
    var box = el("div", { class: "med-cover" });
    function ph() { return el("span", { class: "med-cover-ph", "aria-hidden": "true", text: kanji }); }
    if (e.coverUrl) {
      var img = el("img", { src: e.coverUrl, alt: "", loading: "lazy", decoding: "async" });
      img.addEventListener("error", function () {
        box.removeChild(img);
        box.appendChild(ph());
      });
      box.appendChild(img);
    } else {
      box.appendChild(ph());
    }
    return box;
  }

  /* dropdown option fill from real index keys, preserving the selection */
  function fillSel(sel, values, blank) {
    var cur = sel.value;
    sel.innerHTML = "";
    sel.appendChild(el("option", { value: "", text: blank }));
    values.forEach(function (v) { sel.appendChild(el("option", { value: v, text: v })); });
    sel.value = values.indexOf(cur) !== -1 ? cur : "";
  }

  /* the vault search box */
  function searchInput(ariaLabel) {
    return el("input", { type: "search", class: "todo-in med-search",
      placeholder: "Search titles…", "aria-label": ariaLabel });
  }

  /* the vault sort select — labels for score/progress vary per module
     (books: Rating / vn: Routes cleared / games: Playtime) */
  function sortSelect(pref, labels) {
    labels = labels || {};
    var sel = el("select", { class: "status-sel", "aria-label": "Sort" }, [
      ["updated", "Recently updated"], ["title", "Title A–Z"],
      ["score", labels.score || "Score"], ["progress", labels.progress || "Progress"]
    ].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    sel.value = pref || "updated";
    return sel;
  }

  /* the two-way grid ⇄ list layout toggle (books cycles three layouts per
     tab and keeps its own) */
  function layoutToggle(p, onChange) {
    var btn = el("button", { class: "btn", text: p.layout === "list" ? "▦ Grid" : "☰ List",
      title: "Toggle grid / list", onclick: function () {
        p.layout = p.layout === "list" ? "grid" : "list";
        KOS.store.save();
        btn.textContent = p.layout === "list" ? "▦ Grid" : "☰ List";
        onChange();
      } });
    return btn;
  }

  /* status pill row: All + the five statuses; extra = [[label, applyFn]]
     (books adds a DNF pill). onPick(statusOrNull) sets the filter and
     refreshes; the row manages its own active state. */
  function statusPills(onPick, extra) {
    var pills = el("div", { class: "study-tabs med-pills", role: "tablist" });
    function pill(label, apply) {
      var b = el("button", { class: "study-tab", role: "tab", onclick: function () {
        pills.querySelectorAll(".study-tab").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        apply();
      } }, [label]);
      return b;
    }
    var all = pill("All", function () { onPick(null); });
    all.classList.add("active");
    pills.appendChild(all);
    STATUSES.forEach(function (s) {
      pills.appendChild(pill(KOS.media.STATUS_LABEL[s], function () { onPick(s); }));
    });
    (extra || []).forEach(function (x) { pills.appendChild(pill(x[0], x[1])); });
    return pills;
  }

  /* the standard vault empty state — message + centred action buttons */
  function emptyState(message, buttons) {
    return el("div", { class: "med-empty" }, [
      el("p", { class: "fc-empty", text: message }),
      el("div", { class: "lab-controls", style: "justify-content:center" }, buttons || [])
    ]);
  }

  /* ================= the results area + lazy batch renderer =================
     countLine + holder + IntersectionObserver sentinel, and the batched
     renderer behind them: the DOM never holds every card at once — BATCH
     rows at a time as the sentinel scrolls into view, with a render-all-in-
     idle-chunks fallback where IO doesn't exist (old engines / jsdom).
     makeItem(row, index) builds one card/row. */
  function resultsArea(main, makeItem) {
    var countLine = el("p", { class: "sub med-count" });
    main.appendChild(countLine);
    var holder = el("div", { class: "med-grid" });
    main.appendChild(holder);
    var sentinel = el("div", { class: "med-sentinel", "aria-hidden": "true" });
    main.appendChild(sentinel);

    var results = [], rendered = 0, io = null;
    function renderBatch() {
      var end = Math.min(rendered + BATCH, results.length);
      var frag = document.createDocumentFragment();
      for (var i = rendered; i < end; i++) frag.appendChild(makeItem(results[i], i));
      holder.appendChild(frag);
      rendered = end;
      if (rendered >= results.length && io) { io.disconnect(); io = null; }
    }
    /* re-render the current results without a re-query (rank moves etc.) */
    function repaint() {
      if (io) { io.disconnect(); io = null; }
      holder.innerHTML = "";
      rendered = 0;
      renderBatch();
      if (rendered >= results.length) return;
      if (typeof IntersectionObserver === "undefined") {
        (function chunk() { if (rendered < results.length) { renderBatch(); setTimeout(chunk, 0); } })();
        return;
      }
      io = new IntersectionObserver(function (ents) {
        if (ents.some(function (x) { return x.isIntersecting; })) renderBatch();
      }, { root: null, rootMargin: "600px" });
      io.observe(sentinel);
    }
    function start(rows) {
      results = rows;
      repaint();
    }

    return {
      countLine: countLine,
      holder: holder,
      sentinel: sentinel,
      start: start,
      repaint: repaint,
      results: function () { return results; }
    };
  }

  /* ================= the everyday +1 action =================
     mode "progress": +1 episode/chapter — completes at total, moves
     planned/onHold to inProgress, logs one activity, schedules a push.
     mode "hours": games' +1 playtime hour — no total to complete against
     and NEVER a push (games have no sync, invariant #12). */
  function bumpUnit(e, mode, done) {
    var finished = false;
    if (mode === "hours") {
      e.playtimeHours = (e.playtimeHours || 0) + 1;
    } else {
      e.progress.current = (e.progress.current || 0) + 1;
      finished = !!(e.progress.total && e.progress.current >= e.progress.total);
      if (finished) {
        e.progress.current = e.progress.total;
        e.status = "completed";
        if (!e.dates.finished) e.dates.finished = KOS.srs.todayISO();
      }
    }
    if (!finished && (e.status === "planned" || e.status === "onHold")) {
      e.status = "inProgress";
      if (!e.dates.started) e.dates.started = KOS.srs.todayISO();
    }
    KOS.mediadb.put(e, function (err, rec) {
      if (err) { KOS.ui.toast("Save failed: " + err.message, true); return; }
      KOS.media.logActivity(rec, finished ? "completed" : "progress");
      if (mode !== "hours") KOS.mediapush.schedule(rec);   // 3d: coalesces rapid +1 clicks
      done && done(rec);
    });
  }

  KOS.medview = {
    BATCH: BATCH,
    STATUSES: STATUSES,
    NEEDS_IDB: NEEDS_IDB,
    unavailable: unavailable,
    cover: cover,
    fillSel: fillSel,
    searchInput: searchInput,
    sortSelect: sortSelect,
    layoutToggle: layoutToggle,
    statusPills: statusPills,
    emptyState: emptyState,
    resultsArea: resultsArea,
    bumpUnit: bumpUnit
  };
})();
