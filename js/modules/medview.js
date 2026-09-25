/* Kurenai OS — modules/medview.js
   The vault-view toolkit (refactor step 6, audit item A1).

   Builds 3a→3e grew the four vault views (anime → books → vn → games) by
   copy-paste before the "reuse existing X" convention crystallised — every
   view carried its own byte-identical cover renderer, lazy batch renderer,
   dropdown filler, status pill row, empty states and editor scaffolding.
   This file is the single implementation they now share. It is VIEW-layer
   (it renders DOM), so it lives with the modules it serves, not in core.

   Graphite (frame 11b) is built ONCE here and every medium uses it: the
   spotlight hero, the Status + Lists rail, one controls row above the grid
   and the overlay card (everything on the cover; status and +1 on hover).
   The behavioural contract is the data-ui hooks (vault.*), which the smoke
   suites and the parity harness key off; classes are presentation only.

   A fifth media module (Music/Competitions — backlog #5) should build on
   this toolkit + KOS.mediaEditors instead of copying a sibling view.      */
(function () {
  "use strict";
  var el = KOS.ui.el;

  var BATCH = 60;       // lazy-render batch size (the 3a scale rule)
  var IO_MARGIN = 600;  // how far past the scroll container we render ahead
  /* display order for pills + editor status dropdowns — deliberately NOT
     mediadb.STATUSES (which is schema order, planned first) */
  var STATUSES = ["inProgress", "planned", "onHold", "completed", "dropped"];

  /* a hook added to a node whose own hooks came from elsewhere (a primitive) */
  function addHook(node, hook) {
    node.setAttribute("data-ui", ((node.getAttribute("data-ui") || "") + " " + hook).trim());
    return node;
  }

  /* ================= availability ================= */
  var NEEDS_IDB = "The Collection Matrix needs IndexedDB, which this browser/context doesn't provide.";
  /* the canonical guard every Matrix view opens with:
     if (KOS.medview.unavailable(main)) return; */
  function unavailable(main) {
    if (KOS.mediadb.available()) return false;
    main.appendChild(KOS.ui.emptyState({ mark: "蒐", body: NEEDS_IDB }));
    return true;
  }

  /* ================= shared display bits ================= */
  /* cover image with lazy load + kanji placeholder. The glyph is painted
     from the first frame on a wash derived from the title (invariant 61)
     and the image cross-fades over it on load; on error the image never
     arrives and the glyph is already there. */
  function cover(e, kanji) {
    var box = el("div", { class: "k-mcover", "data-ui": "vault.cover" });
    box.style.setProperty("--ph-hue", String(titleHue(e.title)));
    function ph(behind) {
      var n = el("span", { class: "k-mcover-ph", "data-ui": "vault.cover-placeholder", "aria-hidden": "true", text: kanji });
      if (behind) KOS.ui.state(n, "behind", true);
      return n;
    }
    if (!e.coverUrl) KOS.ui.state(box, "no-art", true);
    if (e.coverUrl) {
      var mark = ph(true);
      var img = KOS.imageCrop.image(e.coverUrl, { alt: "", loading: "lazy", decoding: "async" }, e.coverCrop);
      KOS.ui.state(img, "is-loading", true);
      KOS.ui.state(box, "is-loading", true);
      function settled(loaded) {
        KOS.ui.state(box, "is-loading", false);
        KOS.ui.state(img, "is-loading", false);
        if (loaded && mark.parentNode) mark.parentNode.removeChild(mark);
        if (!loaded && img.parentNode) img.parentNode.removeChild(img);
      }
      img.addEventListener("load", function () { settled(true); });
      img.addEventListener("error", function () { settled(false); KOS.ui.state(box, "no-art", true); });
      box.appendChild(mark);
      box.appendChild(img);
      /* a cached image can finish before the listeners attach */
      if (img.complete && img.naturalWidth) settled(true);
    } else {
      box.appendChild(ph());
    }
    return box;
  }

  /* Shared media-editor control. URL edits and uploads both feed the one
     cropper; metadata remains draft-local until the parent editor saves. */
  function coverPositionControl(entry, urlInput, opts) {
    opts = opts || {};
    var draftCrop = KOS.imageCrop.normalise(entry.coverCrop);
    var positionedSource = String(entry.coverUrl || "");
    var originalPlaceholder = urlInput.placeholder;
    var masked = false;
    var note = el("span", { class: "k-field-hint", "data-ui": "part.sub", text: draftCrop ? "position saved" : "centred by default" });

    function showSource(source) {
      masked = !!opts.maskDataUrl && /^data:image\//i.test(source);
      urlInput.value = masked ? "" : source;
      urlInput.placeholder = masked
        ? "Local cover selected — position it to edit or remove"
        : originalPlaceholder;
    }
    function candidateSource() {
      var typed = urlInput.value.trim();
      return typed || (masked ? positionedSource : "");
    }
    showSource(positionedSource);

    var button = el("button", { type: "button", class: "k-btn k-btn--sm", text: "⌖ Position cover…", onclick: function () {
      var candidate = candidateSource();
      var candidateCrop = candidate && candidate === positionedSource ? draftCrop : null;
      KOS.imageCrop.open({
        title: "Position the cover",
        description: "Preview the portrait frame used throughout the Collection Matrix. The source URL or upload is saved only with this entry.",
        source: candidate,
        originalSource: positionedSource,
        originalCrop: draftCrop,
        originalLabel: "Use saved cover",
        crop: candidateCrop, aspect: 2 / 3, allowUrl: true, allowUpload: !!opts.allowUpload,
        fileOptions: { maxWidth: 1000, maxHeight: 1500, maxBytes: 520 * 1024, quality: 0.84 },
        removeLabel: "Remove cover",
        onRemove: candidate ? function () {
          positionedSource = "";
          draftCrop = null;
          showSource("");
          note.textContent = "cover removed — save the entry to keep it";
        } : null,
        onSave: function (result) {
          positionedSource = result.source;
          draftCrop = result.crop;
          showSource(positionedSource);
          note.textContent = "position ready — save the entry to keep it";
        }
      });
    } });
    return {
      node: el("div", { class: "k-cluster" }, [button, note]),
      set: function (source, crop) {
        positionedSource = String(source || "");
        draftCrop = KOS.imageCrop.normalise(crop);
        showSource(positionedSource);
        note.textContent = draftCrop ? "linked position copied" : "centred by default";
      },
      sourceFor: function () { return candidateSource() || null; },
      cropFor: function (source) {
        source = String(source || "");
        return source && source === positionedSource ? KOS.imageCrop.normalise(draftCrop) : null;
      }
    };
  }

  /* dropdown option fill from real index keys, preserving the selection */
  function fillSel(sel, values, blank) {
    var cur = sel.value;
    sel.innerHTML = "";
    sel.appendChild(el("option", { value: "", text: blank }));
    values.forEach(function (v) { sel.appendChild(el("option", { value: v, text: v })); });
    sel.value = values.indexOf(cur) !== -1 ? cur : "";
  }

  /* ---- the genre facet, split (audit VLT-8 / G-31 / U-26) ----
     VNDB content tags arrive in `genres` beside real genres. The taxonomy
     is fixed where it is read (invariant 62): real genres first, tags
     after, rare tags last, each option carrying its own count. Nothing is
     hidden — a one-title tag is still reachable. */
  var CANON_GENRES = ["Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy", "Horror",
    "Mahou Shoujo", "Mecha", "Music", "Mystery", "Psychological", "Romance", "Sci-Fi",
    "Slice of Life", "Sports", "Supernatural", "Thriller"];
  var RARE_BELOW = 5;
  function fillFacetSel(sel, counts, blank, opts) {
    opts = opts || {};
    var cur = sel.value;
    sel.innerHTML = "";
    sel.appendChild(el("option", { value: "", text: blank }));
    var names = Object.keys(counts || {});
    var genres = [], tags = [], rare = [];
    names.forEach(function (n) {
      if (CANON_GENRES.indexOf(n) !== -1) genres.push(n);
      else if ((counts[n] || 0) >= (opts.rareBelow || RARE_BELOW)) tags.push(n);
      else rare.push(n);
    });
    function byCount(a, b) { return (counts[b] || 0) - (counts[a] || 0) || (a < b ? -1 : 1); }
    genres.sort(byCount); tags.sort(byCount); rare.sort();
    function group(label, list) {
      if (!list.length) return;
      var g = el("optgroup", { label: label + " (" + list.length + ")" });
      list.forEach(function (n) {
        g.appendChild(el("option", { value: n, text: n + " · " + (counts[n] || 0) }));
      });
      sel.appendChild(g);
    }
    group(opts.genreLabel || "Genres", genres);
    group(opts.tagLabel || "Tags", tags);
    group("Rare tags", rare);
    sel.value = names.indexOf(cur) !== -1 ? cur : "";
  }
  /* tally a facet across a module's rows: {value: count} */
  function tallyFacet(rows, key) {
    var out = {};
    (rows || []).forEach(function (r) {
      var v = r[key];
      if (Array.isArray(v)) v.forEach(function (x) { if (x) out[x] = (out[x] || 0) + 1; });
      else if (v) out[v] = (out[v] || 0) + 1;
    });
    return out;
  }

  /* the vault search box */
  function searchInput(ariaLabel) {
    return el("input", { type: "search", class: "k-msearch", "data-ui": "ui.quick-add vault.search",
      placeholder: "⌕ " + (ariaLabel || "Search titles…"), "aria-label": ariaLabel });
  }

  /* the vault sort select — labels for score/progress vary per module
     (books: Rating / vn: Routes cleared / games: Playtime) */
  function sortSelect(pref, labels) {
    labels = labels || {};
    /* vault.sort marks this as the toolbar's own control rather than a
       module facet — the facets all live behind Filters ▾ (smoke44 A) */
    var sel = el("select", { class: "k-pill-select", "data-ui": "ui.status-select vault.sort", "aria-label": "Sort" }, [
      ["updated", "Sort: recently updated"], ["title", "Sort: title A–Z"],
      ["score", "Sort: " + (labels.score || "score").toLowerCase()], ["progress", "Sort: " + (labels.progress || "progress").toLowerCase()]
    ].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    sel.value = pref || "updated";
    return sel;
  }

  /* the two-way grid ⇄ list layout switch (books cycles three layouts per
     tab and keeps its own) */
  function layoutToggle(p, onChange) {
    var seg = el("span", { class: "k-seg k-seg--quiet k-mlayout", role: "group", "aria-label": "Layout" });
    function btn(id, glyph, label) {
      return el("button", { type: "button", class: "k-seg-item", "data-layout": id, "aria-label": label, title: label,
        "aria-pressed": String((p.layout === "list" ? "list" : "grid") === id), text: glyph,
        onclick: function () {
          if ((p.layout === "list" ? "list" : "grid") === id) return;
          p.layout = id;
          KOS.store.save();
          seg.querySelectorAll("button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-layout") === id)); });
          onChange();
        } });
    }
    seg.appendChild(btn("grid", "▦", "Grid"));
    seg.appendChild(btn("list", "≡", "List"));
    return seg;
  }

  /* ================= the one vault toolbar (Category 7 Phase D) =================
     One arrangement, the same object in all four vaults, right-aligned in
     one row directly above the grid (frame 11b):

       [ count ] ……… [ search ] [ sort ] [ Filters ▾ ] [ ▦ ≡ ] [ Actions ▾ ] [ ⊕ primary ]

     Module facets live behind Filters ▾ with a badge counting what is
     applied; commands live behind Actions ▾ under real headings. The rail
     keeps Status and custom Lists — the two axes every medium shares.

     opts: { search, sort, layout, filters: [{label, node, active, clear}],
             actions: [{label, glyph, hint, onSelect} | {heading} | {sep}],
             primary, label, onClear }
     Returns { root, sync } — call sync() after any facet changes so the
     badge and the "clear" affordance stay honest.                        */
  function toolbar(opts) {
    opts = opts || {};
    var facets = (opts.filters || []).filter(Boolean);

    var clearBtn = el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "vault.toolbar-clear", text: "Clear filters",
      onclick: function () {
        facets.forEach(function (f) { if (f.clear) f.clear(); });
        sync();
        if (opts.onClear) opts.onClear();
      } });

    var panel = el("div", { class: "k-mfilters" }, [
      el("div", { class: "k-mfilters-grid" }, facets.map(function (f) {
        return el("label", { class: "k-field", "data-ui": "ui.field vault.facet" }, [
          el("span", { class: "k-field-label", "data-ui": "part.label", text: f.label }), f.node
        ]);
      })),
      el("div", { class: "k-mfilters-foot" }, [clearBtn])
    ]);

    var filtersBtn = facets.length
      ? addHook(KOS.ui.menu({ label: "Filters", className: "k-btn--sm k-mtool", align: "start",
          hint: "Narrow this vault by " + facets.map(function (f) { return f.label.toLowerCase(); }).join(", "),
          badge: "", content: panel, panelClass: "k-menu-panel--wide" }), "vault.filters-button")
      : null;

    var actionsBtn = (opts.actions || []).filter(Boolean).length
      ? addHook(KOS.ui.menu({ label: opts.actionsLabel || "Actions", className: "k-btn--sm k-mtool",
          hint: "Everything else this vault can do", items: opts.actions }), "vault.toolbar-actions-btn")
      : null;

    var root = el("div", { class: "k-mtoolbar" + (opts.className ? " " + opts.className : ""), "data-ui": "vault.toolbar vault.tools",
      role: "group", "aria-label": opts.label || "Vault controls" }, [
      opts.search || null,
      opts.sort || null,
      filtersBtn,
      opts.layout || null,
      actionsBtn,
      opts.primary || null
    ].filter(Boolean));

    function activeCount() {
      return facets.filter(function (f) { return f.active && f.active(); }).length;
    }
    function sync() {
      var n = activeCount();
      if (filtersBtn) {
        filtersBtn.setBadge(n);
        KOS.ui.state(filtersBtn, "has-filters", !!n);
        filtersBtn.setAttribute("title", n
          ? n + (n === 1 ? " filter applied" : " filters applied")
          : "Narrow this vault");
      }
      clearBtn.disabled = !n;
    }
    sync();
    return { root: root, sync: sync, filtersBtn: filtersBtn, actionsBtn: actionsBtn };
  }
  /* the primary action every vault toolbar carries (one per view) */
  function primaryButton(text, title, onclick) {
    return el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: text, title: title || null, onclick: onclick });
  }

  /* the value-or-nothing helpers a caller passes as a facet */
  function selFacet(label, sel, onChange) {
    sel.addEventListener("change", onChange);
    return { label: label, node: sel,
      active: function () { return !!sel.value; },
      clear: function () { sel.value = ""; } };
  }
  function toggleFacet(label, get, set, onChange, text) {
    var box = el("input", { type: "checkbox", class: "k-box" });
    box.checked = !!get();
    box.addEventListener("change", function () { set(box.checked); onChange(); });
    return { label: label,
      node: el("span", { class: "k-check" }, [box, el("span", { text: text || "" })]),
      active: get,
      clear: function () { box.checked = false; set(false); } };
  }
  /* a facet select, in the shared vocabulary */
  function facetSelect(ariaLabel) {
    return el("select", { class: "k-input", "data-ui": "ui.status-select", "aria-label": ariaLabel });
  }

  /* status pill row: All + the five statuses; extra = [[label, applyFn]]
     (books adds a DNF pill). onPick(statusOrNull) sets the filter and
     refreshes; the row manages its own active state. */
  function statusPills(onPick, extra) {
    var pills = el("div", { class: "k-seg k-seg--quiet", "data-ui": "ui.tabs", role: "tablist" });
    function pill(label, apply) {
      var b = el("button", { type: "button", class: "k-seg-item", "data-ui": "ui.tab", role: "tab", "aria-selected": "false", onclick: function () {
        pills.querySelectorAll("[data-ui~='ui.tab']").forEach(function (x) { KOS.ui.state(x, "active", false); x.setAttribute("aria-selected", "false"); });
        KOS.ui.state(b, "active", true);
        b.setAttribute("aria-selected", "true");
        apply();
      } }, [label]);
      return b;
    }
    var all = pill("All", function () { onPick(null); });
    KOS.ui.state(all, "active", true);
    all.setAttribute("aria-selected", "true");
    pills.appendChild(all);
    STATUSES.forEach(function (s) {
      pills.appendChild(pill(KOS.media.STATUS_LABEL[s], function () { onPick(s); }));
    });
    (extra || []).forEach(function (x) { pills.appendChild(pill(x[0], x[1])); });
    return pills;
  }

  /* the standard vault empty state — message + centred action buttons,
     through the shared KOS.ui.emptyState */
  function emptyState(message, buttons) {
    return el("div", { class: "k-mempty", "data-ui": "vault.empty" }, [
      KOS.ui.emptyState({ mark: "蒐", body: message,
        action: (buttons || []).length ? el("div", { class: "k-cluster" }, buttons) : null })
    ]);
  }

  /* ================= the results area + lazy batch renderer =================
     countLine + holder + IntersectionObserver sentinel, and the batched
     renderer behind them: the DOM never holds every card at once — BATCH
     rows at a time as the sentinel scrolls into view, with a render-all-in-
     idle-chunks fallback where IO doesn't exist (old engines / jsdom).
     makeItem(row, index) builds one card/row. The count line sits at the
     start of the controls row when the caller hands it over (11b). */
  function resultsArea(main, makeItem, opts) {
    opts = opts || {};
    var countLine = el("p", { class: "k-mcount", "data-ui": "vault.count part.sub", role: "status" });
    if (opts.countHost) opts.countHost.insertBefore(countLine, opts.countHost.firstChild);
    else main.appendChild(countLine);
    var holder = el("div", { class: "k-mgrid", "data-ui": "vault.grid" });
    main.appendChild(holder);
    var sentinel = el("div", { class: "k-msentinel", "data-ui": "vault.sentinel", "aria-hidden": "true" });
    main.appendChild(sentinel);

    var results = [], rendered = 0, io = null, gen = 0;

    /* GENERATION GUARD. Every entry point bumps `gen`; a batch from a
       superseded generation is dropped on the floor, so an observer still
       live against an old result set can never append it under a new one. */
    function stop() {
      gen++;
      if (io) { io.disconnect(); io = null; }
      results = [];
      rendered = 0;
      return gen;
    }
    /* stop + empty the holder: the one way to leave nothing mounted */
    function clear() {
      var g = stop();
      holder.innerHTML = "";
      return g;
    }
    function renderBatch(myGen) {
      if (myGen !== gen) return;                       // superseded — drop it
      var end = Math.min(rendered + BATCH, results.length);
      var frag = document.createDocumentFragment();
      for (var i = rendered; i < end; i++) frag.appendChild(makeItem(results[i], i));
      holder.appendChild(frag);
      rendered = end;
      if (rendered >= results.length && io) { io.disconnect(); io = null; }
    }
    /* the scroll container the observer must measure against */
    function scrollRoot() {
      var m = document.getElementById("stage") || document.getElementById("main");
      return m && holder.ownerDocument && m.contains(holder) ? m : null;
    }
    /* IntersectionObserver fires on a TRANSITION: after a batch, keep
       appending while the sentinel is still in range — measured for real —
       until it clears or the results run out. */
    function fillWhileVisible(myGen) {
      var root = scrollRoot();
      var guard = 0;
      while (myGen === gen && rendered < results.length && ++guard <= 200) {
        var sRect = sentinel.getBoundingClientRect();
        var rRect = root ? root.getBoundingClientRect()
          : { top: 0, bottom: (window.innerHeight || document.documentElement.clientHeight || 0) };
        /* layout-less hosts report all-zero rects: cannot measure, stop */
        if (!sRect.height && !sRect.bottom && !rRect.bottom) return;
        if (sRect.top > rRect.bottom + IO_MARGIN) return;   // clear of the margin
        renderBatch(myGen);
      }
    }
    /* re-render the current results without a re-query (rank moves etc.) */
    function repaint() {
      var rows = results;
      var myGen = clear();
      results = rows;
      renderBatch(myGen);
      if (rendered >= results.length) return;
      if (typeof IntersectionObserver === "undefined") {
        (function chunk() {
          if (myGen !== gen) return;
          if (rendered < results.length) { renderBatch(myGen); setTimeout(chunk, 0); }
        })();
        return;
      }
      io = new IntersectionObserver(function (ents) {
        if (myGen !== gen) return;
        if (ents.some(function (x) { return x.isIntersecting; })) {
          renderBatch(myGen);
          fillWhileVisible(myGen);
        }
      }, { root: scrollRoot(), rootMargin: IO_MARGIN + "px" });
      io.observe(sentinel);
    }
    function start(rows) {
      results = rows;
      repaint();
    }
    /* paint every row at once through this area (the Books shelf lens), so
       the observer state is reset exactly as it is for a lazy list */
    function paintAll(rows, build) {
      var myGen = clear();
      results = rows;
      rendered = rows.length;
      var frag = document.createDocumentFragment();
      rows.forEach(function (r, i) { frag.appendChild(build(r, i)); });
      if (myGen !== gen) return;
      holder.appendChild(frag);
    }
    /* async callers claim a generation before querying and check it on the
       way back, so a slow query for a lens you already left can't paint */
    function begin() { return stop(); }
    function current(token) { return token === gen; }
    /* the holder's arrangement: "grid" (cards) or "list" (rows) */
    function layout(kind) { holder.setAttribute("data-layout", kind === "list" ? "list" : kind || "grid"); }

    return {
      countLine: countLine,
      holder: holder,
      sentinel: sentinel,
      start: start,
      repaint: repaint,
      stop: stop,
      clear: clear,
      paintAll: paintAll,
      begin: begin,
      current: current,
      layout: layout,
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

  /* ================= the editor shell (Phase B) ================= */
  /* field(): a label whose first span names the control; calField(): the
     calendar/tracker form flavour of the same thing */
  /* a third argument (any truthy value — callers still name it) spans the
     field across both columns of the section grid */
  function field(label, input, wide) {
    return el("label", { class: "k-field" + (wide ? " k-medit-wide" : ""), "data-ui": "ui.field" + (wide ? " vault.span-2" : "") },
      [el("span", { class: "k-field-label", "data-ui": "ui.field-label part.label", text: label }), input]);
  }

  /* One information grammar for every media editor. A section owns a real
     subject (identity, progress, dates, taxonomy, lists, source or notes),
     while its body owns the same two-column field grid. */
  function editorSection(id, title, description, children, opts) {
    opts = opts || {};
    var bodyChildren = (children || []).filter(Boolean);
    var body = opts.raw
      ? el("div", { class: "k-medit-body", "data-ui": "vault.editor-body" }, bodyChildren)
      : el("div", { class: "k-medit-body", "data-ui": "vault.editor-body" }, [
          el("div", { class: "k-medit-grid" }, bodyChildren)
        ]);
    var sid = "med-edit-" + id + "-" + (++editorSectionSeq);
    return el("section", {
      class: "k-medit-sec" + (opts.className ? " " + opts.className : ""),
      "data-edit-section": id,
      "aria-labelledby": sid
    }, [
      el("div", { class: "k-medit-index" }, [
        el("h3", { id: sid, class: "k-kicker", text: title }),
        description ? el("p", { text: description }) : null
      ].filter(Boolean)),
      body
    ]);
  }
  var editorSectionSeq = 0;

  function sourceInfo(entry, provider, detail) {
    var synced = entry.syncSource === "anilist" || entry.syncSource === "vndb";
    var imported = entry.syncSource === "import";
    var source = provider || (entry.syncSource === "anilist" ? "AniList"
      : entry.syncSource === "vndb" ? "VNDB"
      : entry.syncSource === "import" ? "Imported file" : "Local record");
    var node = el("div", { class: "k-msource", "data-ui": "vault.source" }, [
      el("span", { class: "k-msource-mark", "aria-hidden": "true", text: synced ? "⇅" : imported ? "↥" : "⌂" }),
      el("div", {}, [
        el("b", { text: source }),
        el("p", { text: detail || (synced
          ? "Synced list fields may refresh from the source; your local notes and personal organisation stay yours."
          : imported ? "Imported metadata stays local until you deliberately import or sync again."
          : "This record is stored locally and changes only when you edit it.") })
      ])
    ]);
    if (synced || imported) KOS.ui.state(node, "is-linked", true);
    return node;
  }
  function calField(label, input) {
    return el("label", { class: "k-field", "data-ui": "cal.field ui.field" }, [el("span", { class: "k-field-label", text: label }), input]);
  }
  function splitList(v) {
    return v.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  }

  /* the overlay every Matrix modal starts from. openDialog owns Escape,
     focus and the scroll lock (invariant 49); onClose (optional) runs
     first, for teardown like stopping the barcode scanner's camera.
     overlay.close is the one close path. */
  function modalOverlay(onClose) {
    var overlay = el("div", { class: "k-dialog-overlay", "data-ui": "ui.dialog-overlay" });
    overlay.close = function () {
      if (onClose) onClose();
      overlay.remove();
    };
    return overlay;
  }
  /* a titled dialog box on that overlay */
  function dialogBox(overlay, hook, title, sub, body, foot, cls) {
    overlay.appendChild(el("div", { class: "k-dialog" + (cls ? " " + cls : ""), "data-ui": "ui.dialog" + (hook ? " " + hook : "") }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("div", { class: "k-medit-heading" }, [
          el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: title }),
          sub ? el("span", { class: "k-muted", text: sub }) : null
        ].filter(Boolean)),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✕", "aria-label": "Close", onclick: function () { overlay.close(); } })
      ]),
      body,
      foot || null
    ].filter(Boolean)));
    return overlay;
  }

  /* the editor's working copy: a NORMALISED deep clone (id preserved), or
     a normalised blank of the module */
  function editDraft(entry, module) {
    var e = entry ? KOS.mediadb.normalise(JSON.parse(JSON.stringify(entry)))
                  : KOS.mediadb.normalise({ module: module });
    if (entry && entry.id != null) e.id = entry.id;
    return e;
  }

  /* the record drawer (frame 11c): header (kicker, title, subtitle, ✕),
     the section form, and Delete kept apart from Cancel/Save. opts:
     { isNew, label, subtitle, className, hook, form: node[], onSave, onDelete
     (null hides the button), focus }. Returns the overlay. */
  function editorModal(opts) {
    var overlay = modalOverlay();
    KOS.ui.state(overlay, "drawer", true);
    overlay.appendChild(el("div", { class: "k-dialog k-medit" + (opts.className ? " " + opts.className : ""), "data-ui": "ui.dialog vault.dialog vault.editor" + (opts.hook ? " " + opts.hook : "") }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("div", { class: "k-medit-heading" }, [
          el("span", { class: "k-kicker", text: opts.isNew ? "New collection record" : "Collection record" }),
          el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: (opts.isNew ? "Add to " : "Edit — ") + opts.label }),
          opts.subtitle ? el("span", { class: "k-muted", text: opts.subtitle }) : null
        ].filter(Boolean)),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✕", "aria-label": "Close", onclick: function () { overlay.close(); } })
      ]),
      el("div", { class: "k-dialog-body k-medit-form", "data-ui": "ui.form" }, opts.form.filter(Boolean)),
      el("div", { class: "k-dialog-foot k-medit-foot" }, [
        el("div", { class: "k-cluster", "data-ui": "vault.delete-actions" }, [
          !opts.isNew && opts.onDelete ? el("button", { type: "button", class: "k-btn k-btn--danger", "data-intent": "danger", text: "Delete record", onclick: opts.onDelete }) : null
        ].filter(Boolean)),
        el("div", { class: "k-cluster", "data-ui": "vault.save-actions" }, [
          el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: function () { overlay.close(); } }),
          el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: opts.isNew ? "Add to collection" : "Save changes", onclick: opts.onSave })
        ])
      ])
    ]));
    KOS.ui.openDialog(overlay);
    if (opts.focus) opts.focus.focus();
    return overlay;
  }

  /* the shared save tail: put → ONE deliberate activity log ("added" for
     new entries, else the module's own precedence via ctx.activity(rec) —
     null means just a "Saved." toast) → push when the remote-mapped state
     moved (a no-op for never-eligible modules like games) → close. */
  function saveEntry(e, ctx) {
    KOS.mediadb.put(e, function (err, rec) {
      if (err) { KOS.ui.toast("Save failed: " + err.message, true); return; }
      var action = ctx.isNew ? "added" : (ctx.activity ? ctx.activity(rec) : null);
      if (action) KOS.media.logActivity(rec, action);
      else KOS.ui.toast("Saved.");
      if (KOS.mediapush.snapshot(rec) !== ctx.pushBefore) KOS.mediapush.schedule(rec);
      ctx.close();
      ctx.onSaved && ctx.onSaved(rec);
    });
  }

  /* ================= per-card affordances ================= */
  /* inline quick-edit (Build 3d): status + score editable straight on a
     vault card. Status changes log a session ("status", same as the
     editors); score-only changes just save+push. */
  function quickSave(e, rerender) {
    var before = KOS.mediapush.snapshot(e);
    return function saved(action) {
      KOS.mediadb.put(e, function (err, rec) {
        if (err) { KOS.ui.toast("Save failed: " + err.message, true); return; }
        if (action) KOS.media.logActivity(rec, action);
        if (KOS.mediapush.snapshot(rec) !== before) KOS.mediapush.schedule(rec);
        rerender && rerender(rec);
      });
    };
  }
  /* the status half — the grid card's hover row holds this beside "+1",
     with the score in the cover's top-left corner (quickScore) */
  function quickStatus(e, rerender) {
    var saved = quickSave(e, rerender);
    var sel = el("select", { class: "k-mqsel", "data-ui": "ui.status-select vault.qsel", "aria-label": "Status",
      title: "Change status — " + (e.module === "game"
        ? "saved locally (games have no live sync)"
        : "pushes to " + (e.module === "vn" ? "VNDB" : "AniList") + " when this entry is synced") },
      Object.keys(KOS.media.STATUS_LABEL).map(function (s) {
        return el("option", { value: s, text: KOS.media.STATUS_LABEL[s] });
      }));
    sel.value = e.status;
    sel.addEventListener("click", function (ev) { ev.stopPropagation(); });
    sel.addEventListener("change", function (ev) {
      ev.stopPropagation();
      e.status = sel.value;
      var today = KOS.srs.todayISO();
      if (e.status === "inProgress" && !e.dates.started) e.dates.started = today;
      if (e.status === "completed" && !e.dates.finished) e.dates.finished = today;
      saved("status");
    });
    return sel;
  }
  /* the score half: a number field that saves on change (and pushes when
     the entry is synced). opts.corner marks the grid card's top-left pill */
  function quickScore(e, rerender, opts) {
    var saved = quickSave(e, rerender);
    var corner = opts && opts.corner;
    var score = el("input", { type: "number", class: corner ? "k-mscore" : "k-input k-mqscore",
      "data-ui": "ui.quick-add vault.quick-score" + (corner ? " vault.score-corner" : ""),
      min: "0", max: "10", step: "0.5", value: e.score ? String(e.score) : "", placeholder: "★",
      title: "Score out of 10", "aria-label": "Score out of 10" });
    score.addEventListener("click", function (ev) { ev.stopPropagation(); });
    score.addEventListener("keydown", function (ev) { ev.stopPropagation(); });
    score.addEventListener("change", function (ev) {
      ev.stopPropagation();
      e.score = Math.max(0, Math.min(10, parseFloat(score.value) || 0));
      saved(null);
    });
    return score;
  }
  function quickEdit(e, rerender) {
    return el("span", { class: "k-cluster k-mquick" }, [quickStatus(e, rerender), quickScore(e, rerender)]);
  }
  /* the grid card's hover row: status + "+1" on one line, nothing else —
     onBump null (not in progress) leaves the status alone on the row */
  function quickRow(e, rerender, opts) {
    opts = opts || {};
    return el("div", { class: "k-mquickrow", "data-ui": "vault.quickrow" }, [
      quickStatus(e, rerender),
      opts.onBump ? el("button", { type: "button", class: "k-mplus", "data-ui": "vault.plus", text: "+1 " + (opts.unit || ""),
        title: opts.title || "Log the next one", onclick: function (ev) {
          ev.stopPropagation();
          opts.onBump();
        } }) : null
    ].filter(Boolean));
  }

  /* ================= the overlay card (frame 11b) =================
     Everything sits on the cover: the score top-left, ♥ top-right, the
     title, any chips and the progress over a bottom gradient, the bar on
     the bottom edge. The status select and +1 appear on hover (and on
     focus-within), nothing below the card.

     The card is NOT a button (Phase F): it holds the favourite, a select
     and +1. It keeps a pointer shortcut; the TITLE is the real control.

     opts: { hook (extra data-ui), kanji, chips: [node], prog, onBump,
             unit, bumpTitle, open, onFav, noScore, extra: [node] }     */
  function card(e, rerender, opts) {
    opts = opts || {};
    var node = el("div", { class: "k-mcard", "data-ui": "vault.card" + (opts.hook ? " " + opts.hook : ""),
      "data-status": e.status,
      onclick: function () { opts.open && opts.open(); }
    }, [
      cover(e, opts.kanji),
      opts.noScore ? null : quickScore(e, rerender, { corner: true }),
      favButton(e, opts.onFav),
      el("div", { class: "k-mcard-body", "data-ui": "vault.card-body" }, [
        el("button", { type: "button", class: "k-mcard-title", "data-ui": "vault.title", title: e.title, text: e.title,
          onclick: function (ev) { ev.stopPropagation(); opts.open && opts.open(); } }),
        el("div", { class: "k-mcard-meta" }, (opts.chips || []).filter(Boolean).concat([
          opts.prog ? el("span", { class: "k-mcard-prog k-mono", "data-ui": "vault.card-progress", text: opts.prog }) : null,
          pushChip(e, rerender)
        ]).concat(opts.extra || []).filter(Boolean)),
        quickRow(e, rerender, { unit: opts.unit, title: opts.bumpTitle, onBump: opts.onBump })
      ])
    ].filter(Boolean));
    var track = KOS.media.progressBar(e);
    if (track) node.appendChild(track);
    if (e.favourite) KOS.ui.state(node, "fav", true);
    return node;
  }
  function favButton(e, onFav) {
    var b = el("button", { type: "button", class: "k-mfav", title: "Favourite — appears in the Shrine",
      "aria-label": "Toggle favourite", "aria-pressed": String(!!e.favourite), text: "♥", onclick: function (ev) {
        ev.stopPropagation();
        e.favourite = !e.favourite;
        b.setAttribute("aria-pressed", String(e.favourite));
        KOS.ui.state(b, "on", e.favourite);
        if (onFav) onFav(e); else KOS.mediadb.put(e, function () {});
      } });
    if (e.favourite) KOS.ui.state(b, "on", true);
    return b;
  }
  /* an overlay chip in the card's own voice (airing, format, tier…) */
  function chip(text, tone, attrs) {
    return el("span", Object.assign({ class: "k-mchip", "data-tone": tone || null, text: text }, attrs || {}));
  }

  /* the shared list-view row — a robust flex layout so nullable chips never
     shift columns. opts: { genres|subline, chips:[nodes], prog, onBump,
     open, extra:[nodes], hook } */
  function listRow(e, mod, rerender, opts) {
    opts = opts || {};
    var thumb = e.coverUrl
      ? el("span", { class: "k-mrow-cover" }, [KOS.imageCrop.image(e.coverUrl, { alt: "", loading: "lazy" }, e.coverCrop)])
      : el("span", { class: "k-mrow-cover", "data-ui": "vault.cover-placeholder", "aria-hidden": "true", text: mod.kanji });
    var main = el("div", { class: "k-mrow-main" }, [
      el("button", { type: "button", class: "k-mrow-title", "data-ui": "vault.title", text: e.title, title: e.title,
        onclick: function (ev) { ev.stopPropagation(); opts.open(); } }),
      (opts.genres || opts.subline) ? el("span", { class: "k-mrow-sub", text: opts.subline || opts.genres }) : null
    ].filter(Boolean));
    var side = el("div", { class: "k-mrow-side" },
      (opts.chips || []).filter(Boolean)
        .concat([quickEdit(e, rerender)])
        .concat((opts.extra || []).filter(Boolean))
        .concat([
          opts.prog ? el("span", { class: "k-mono k-mrow-prog", "data-ui": "vault.card-progress", text: opts.prog }) : null,
          pushChip(e, rerender),
          opts.onBump ? el("button", { type: "button", class: "k-mplus", "data-ui": "vault.plus", text: "+1", onclick: function (ev) {
            ev.stopPropagation(); opts.onBump();
          } }) : null
        ].filter(Boolean)));
    /* Phase F: the row holds a quick-edit select, a push-retry chip and
       "+1", so it cannot be a button. The title is. */
    var row = el("div", { class: "k-mrow", "data-ui": "vault.row" + (opts.hook ? " " + opts.hook : ""), "data-status": e.status, onclick: opts.open }, [
      el("span", { class: "k-mrow-fav", "aria-hidden": "true", text: e.favourite ? "♥" : "" }),
      thumb, main, side
    ]);
    return row;
  }

  /* the pending/failed push indicator + manual retry, per card */
  function pushChip(e, rerender) {
    if (e.push && e.push.state === "failed") {
      return el("button", { type: "button", class: "k-mchip k-mchip--btn", "data-tone": "crimson", "data-ui": "vault.push-fail", text: "⚠ sync",
        title: (e.push.error || "Push failed.") + " — click to retry",
        "aria-label": "Sync failed — retry", onclick: function (ev) {
          ev.stopPropagation();
          KOS.ui.toast("Retrying the push…");
          KOS.mediapush.flush(e.id);
          setTimeout(function () { rerender && rerender(); }, 400);
        } });
    }
    if (KOS.mediapush.isPending(e.id)) {
      return el("span", { class: "k-mchip", "data-ui": "vault.push-pending", title: "Syncing to " +
        (e.module === "vn" ? "VNDB" : "AniList") + "…", text: "⇅" });
    }
    return null;
  }

  /* the shared delete tail — every editor's Delete button */
  function deleteEntry(e, confirmMsg, close, onSaved) {
    KOS.ui.confirm({ title: "Delete this entry?", body: confirmMsg, danger: true, confirm: "Delete" }, function () {
      KOS.mediadb.remove(e.id, function (err) {
        if (err) { KOS.ui.toast("Delete failed: " + err.message, true); return; }
        KOS.ui.toast("Deleted.");
        close();
        onSaved && onSaved(null);
      });
    });
  }

  /* ================= the vault hero (Build 4.0 / frame 11b) =================
     One user-selectable spotlight PER MODULE, carried by a genuine banner
     image — AniList's bannerImage where synced, a user-uploaded wide image
     otherwise. Selection + upload live in the media kv store
     ("hero.<module>"), NOT on the entry (invariant 30).
     Network discipline: the ONLY fetch is the read-only AniList banner
     lookup, and only for syncSource:"anilist" entries missing one. Games
     and VN entries never trigger network from here (invariants #12/#20). */
  function heroKey(modId) { return "hero." + modId; }

  /* the spotlight picker: search-as-you-type over the module's vault */
  function heroPicker(modId, kanji, onPick) {
    var overlay = modalOverlay();
    var input = el("input", { type: "search", class: "k-input", "data-ui": "msearch.input", placeholder: "Search your vault…", "aria-label": "Search your vault" });
    var list = el("div", { class: "k-mpick" });
    function run() {
      KOS.mediadb.query({ module: modId, search: input.value.trim() || undefined, sort: "updated" }, function (err, rows) {
        if (err) return;
        list.innerHTML = "";
        rows.slice(0, 40).forEach(function (e) {
          list.appendChild(el("button", { type: "button", class: "k-mpick-row", "data-ui": "msearch.row",
            onclick: function () { overlay.close(); onPick(e); } }, [
            e.coverUrl ? el("span", { class: "k-mrow-cover" }, [KOS.imageCrop.image(e.coverUrl, { alt: "" }, e.coverCrop)])
                       : el("span", { class: "k-mrow-cover", "aria-hidden": "true", text: kanji }),
            el("span", { class: "k-mrow-main" }, [
              el("b", { class: "k-mrow-title", text: e.title }),
              el("span", { class: "k-mrow-sub", text: KOS.media.STATUS_LABEL[e.status] })
            ])
          ]));
        });
        if (!rows.length) list.appendChild(el("p", { class: "k-muted", text: "Nothing in this vault yet." }));
      });
    }
    input.addEventListener("input", KOS.ui.debounce(run, 200));
    dialogBox(overlay, "msearch.dialog", "Choose the spotlight", null, el("div", { class: "k-dialog-body" }, [input, list]));
    KOS.ui.openDialog(overlay);
    input.focus();
    run();
    return overlay;
  }

  /* the one human sentence under the spotlight title — the entry's own
     unit, spelt out */
  var LONG_UNIT = { ep: "episodes", ch: "chapters", route: "routes", hr: "hours" };
  function heroLine(e, mod) {
    var cur = (e.progress && e.progress.current) || 0;
    var total = e.progress && e.progress.total;
    var unit = LONG_UNIT[e.progress && e.progress.unit] || mod.unitName || mod.unit || "units";
    if (e.progress && e.progress.unit === "%") {
      if (e.status === "completed") return "Finished" + (e.score ? " — you gave it ★ " + e.score + "." : ".");
      if (e.status === "inProgress") return cur ? cur + "% through" + (cur >= 90 ? " — nearly there." : ".") : "Just started.";
      if (e.status === "onHold") return "Resting at " + cur + "%.";
      if (e.status === "dropped") return "Set down at " + cur + "%.";
      return "Waiting on the shelf.";
    }
    if (e.module === "game") {
      if (e.status === "completed") return "Finished" + (e.score ? " — you gave it ★ " + e.score + "." : ".");
      if (e.playtimeHours) return e.playtimeHours + " hours in" + (e.status === "inProgress" ? " — the save file is waiting." : ".");
      return "Not started yet — it's on the pile.";
    }
    switch (e.status) {
      case "inProgress":
        if (total) {
          var left = Math.max(0, Math.round((total - cur) * 10) / 10);
          if (e.progress.estimate) return cur + " " + unit + " in — about " + left + " to go by VNDB's estimate.";
          return cur + " " + unit + " in — " + (left === 0 ? "the last one is next." : left + " to go.");
        }
        return cur ? cur + " " + unit + " so far." : "Just started.";
      case "completed": return "Finished" + (e.score ? " — you gave it ★ " + e.score + "." : ".");
      case "onHold": return "Resting at " + cur + (total ? " of " + total : "") + " " + unit + ".";
      case "dropped": return "Set down at " + cur + " " + unit + ".";
      default: return total ? total + " " + unit + ", ready when you are." : "Waiting on the shelf.";
    }
  }

  /* ---- the hero backdrop (audit VLT-4 / VLT-5 / U-14) ----
     ONE composition and a three-step fallback for its backdrop:
       1. a banner (uploaded, or AniList's — invariant #30 is untouched);
       2. the entry's OWN COVER, blown up and blurred behind the scrim;
       3. a deterministic wash in the module's accent, hue-shifted by title.
     Every step is followed by the same scrim, unconditionally, so hero
     text never depends on the artwork. Nothing here fetches. */
  /* a stable hue for a title — the same string always lands on the same
     colour, so a spotlight does not change character when you revisit it */
  /* the scrim every backdrop path ends with — banner, cover or wash */
  var HERO_SCRIM = "vault.hero-scrim";
  function titleHue(s) {
    var h = 0, str = String(s || "");
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
    return h;
  }
  function heroBackdrop(hero, e, mod, banner, crop) {
    hero.style.setProperty("--vh-accent", mod.accent || "var(--crimson)");
    hero.style.setProperty("--vh-hue", String(titleHue(e.title)));
    if (banner) {
      KOS.ui.state(hero, "has-banner", true);
      /* the banner goes through the one crop workflow (invariant 26c) */
      KOS.imageCrop.background(hero, banner, crop, { className: "k-vhero-art" });
    } else {
      KOS.ui.state(hero, "vh-fallback", true);
      if (e.coverUrl) {
        KOS.ui.state(hero, "vh-fromcover", true);
        hero.appendChild(el("span", { class: "k-vhero-art", "data-ui": "vault.hero-art", "aria-hidden": "true" }, [
          KOS.imageCrop.image(e.coverUrl, { alt: "", loading: "lazy", decoding: "async" }, e.coverCrop)
        ]));
      } else {
        hero.appendChild(el("span", { class: "k-vhero-art", "data-ui": "vault.hero-art", "aria-hidden": "true" }));
      }
    }
    hero.appendChild(el("span", { class: "k-vhero-scrim", "data-ui": HERO_SCRIM, "aria-hidden": "true" }));
    hero.appendChild(el("span", { class: "k-vhero-mark", "aria-hidden": "true", text: mod.kanji }));
  }

  function heroCard(holder, modId, mod, rerender) {
    holder.innerHTML = "";
    KOS.mediadb.getKV(heroKey(modId), function (err, pref) {
      if (err) return;
      pref = pref || {};
      function renderWith(e) {
        if (!e) return;   // empty vault — no hero
        var remoteBanner = (e.extra && e.extra.bannerImage) || null;
        var banner = pref.banner || remoteBanner;
        var hero = el("section", { class: "k-vhero", "data-ui": "vault.hero", role: "region", "aria-label": "Spotlight" });
        heroBackdrop(hero, e, mod, banner, pref.crop);

        function pickSpotlight() {
          heroPicker(modId, mod.kanji, function (picked) {
            KOS.mediadb.setKV(heroKey(modId), { entryId: picked.id, banner: null, crop: null }, function () {
              /* synced AniList entries that predate the banner field:
                 one read-only lookup, saved into extra so it sticks */
              if (picked.syncSource === "anilist" && picked.externalIds && picked.externalIds.anilistId
                  && !(picked.extra && picked.extra.bannerImage)) {
                KOS.anilist.fetchBanner(picked.externalIds.anilistId, function (err2, url) {
                  if (!err2 && url) {
                    picked.extra = picked.extra || {};
                    picked.extra.bannerImage = url;
                    KOS.mediadb.put(picked, function () { rerender && rerender(); });
                    return;
                  }
                  rerender && rerender();
                });
              } else { rerender && rerender(); }
            });
          });
        }
        function editBanner() {
          KOS.imageCrop.open({
            title: "Position the spotlight banner",
            description: "This preview matches the shared Collection hero. Drag the focal point so it stays useful at narrower widths. With no banner the cover art is used instead.",
            source: banner || "", originalSource: remoteBanner,
            originalLabel: "Use title banner", crop: pref.crop,
            aspect: 3.2, allowUpload: true,
            fileOptions: { maxWidth: 1800, maxHeight: 1200, maxBytes: 520 * 1024, quality: 0.82 },
            removeLabel: remoteBanner ? "Use automatic banner" : "Use the cover art",
            onRemove: function () {
              KOS.mediadb.setKV(heroKey(modId), { entryId: e.id, banner: null, crop: null }, function () {
                KOS.ui.toast(remoteBanner ? "Using the title banner." : "Using the cover art.");
                rerender && rerender();
              });
            },
            onSave: function (result) {
              var custom = remoteBanner && result.source === remoteBanner ? null : result.source;
              KOS.mediadb.setKV(heroKey(modId), { entryId: e.id, banner: custom, crop: result.crop }, function () {
                KOS.ui.toast("Banner position saved.");
                rerender && rerender();
              });
            }
          });
        }

        var prog = KOS.media.progressText(e);
        var bump = null;
        if (e.status === "inProgress" && e.module !== "game" && e.module !== "vn") {
          bump = { label: "▶ +1 " + mod.unit, run: function () { bumpUnit(e, "progress", function () { rerender && rerender(); }); } };
        } else if (e.module === "vn" && KOS.vn && KOS.vn.quickBump(e)) {
          var vb = KOS.vn.quickBump(e);
          bump = { label: "▶ +1 " + vb.unit, run: function () { vb.run(e, function () { rerender && rerender(); }); } };
        }
        var menu = addHook(KOS.ui.menu({ label: "⋯", className: "k-btn--quiet k-vhero-more",
          hint: "Choose what this hero shows, and the art behind it",
          items: [
            { label: "Choose a different title…", glyph: "☆", onSelect: pickSpotlight },
            { label: banner ? "Reposition the banner…" : "Add a banner image…", glyph: "✎",
              hint: banner ? null : "Without one, the cover art is used", onSelect: editBanner }
          ] }), "vault.hero-menu");
        menu.setAttribute("aria-label", "Spotlight options");
        var body = el("div", { class: "k-vhero-body" }, [
          el("p", { class: "k-kicker k-vhero-kicker" }, [
            el("span", { text: "Spotlight " }),
            el("span", { class: "k-muted", text: "/ " + mod.label })
          ]),
          el("h2", { class: "k-vhero-title", "data-ui": "vault.hero-title", title: e.title, text: e.title }),
          el("p", { class: "k-vhero-line", text: heroLine(e, mod) }),
          el("div", { class: "k-cluster k-vhero-chips" }, [
            el("span", { class: "k-chip k-status-chip", "data-status": e.status, text: KOS.media.STATUS_LABEL[e.status] }),
            prog ? el("span", { class: "k-chip", text: prog }) : null,
            e.score ? el("span", { class: "k-chip", text: "★ " + e.score }) : null
          ].filter(Boolean)),
          KOS.media.progressBar(e, "k-vhero-bar"),
          el("div", { class: "k-cluster k-vhero-actions", "data-ui": "vault.hero-actions" }, [
            bump ? el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: bump.label, onclick: bump.run }) : null,
            el("button", { type: "button", class: "k-btn k-vhero-open", text: "Open entry", onclick: function () {
              KOS.mediaEditor(e, function () { rerender && rerender(); });
            } }),
            menu
          ].filter(Boolean))
        ].filter(Boolean));

        /* the cover plate stands on every hero, banner or not */
        hero.appendChild(e.coverUrl
          ? el("span", { class: "k-vhero-cover", "data-ui": "vault.hero-cover" }, [KOS.imageCrop.image(e.coverUrl, { alt: "" }, e.coverCrop)])
          : el("span", { class: "k-vhero-cover", "data-ui": "vault.hero-placeholder", "aria-hidden": "true", text: mod.kanji }));
        hero.appendChild(body);
        holder.appendChild(hero);
      }
      if (pref.entryId != null) {
        KOS.mediadb.get(pref.entryId, function (err2, e) {
          if (!err2 && e && e.module === modId) { renderWith(e); return; }
          autoPick();
        });
      } else autoPick();
      function autoPick() {
        /* nothing chosen: spotlight the most recently updated in-progress
           entry, falling back to the most recent anything */
        KOS.mediadb.query({ module: modId, status: "inProgress", sort: "updated" }, function (err2, rows) {
          if (!err2 && rows && rows.length) { renderWith(rows[0]); return; }
          KOS.mediadb.query({ module: modId, sort: "updated" }, function (err3, all) {
            renderWith(!err3 && all && all.length ? all[0] : null);
          });
        });
      }
    });
  }


  /* ================= per-module statistics ================= */
  /* One dialog per vault: composition, taste and pace — donut, bars,
     horizontal bars and a trend line, all KOS.charts (invariant #27). */
  function monthKey(iso) { return iso ? iso.slice(0, 7) : null; }
  function statsModal(modId, mod) {
    KOS.mediadb.query({ module: modId }, function (err, rows) {
      if (err) { KOS.ui.toast("Could not read the vault: " + err.message, true); return; }
      var overlay = modalOverlay();
      var body = el("div", { class: "k-dialog-body k-mstats" });

      /* headline band */
      var inProg = 0, completed = 0, scored = 0, scoreSum = 0, favs = 0, units = 0;
      rows.forEach(function (e) {
        if (e.status === "inProgress") inProg++;
        if (e.status === "completed") completed++;
        if (e.score) { scored++; scoreSum += e.score; }
        if (e.favourite) favs++;
        units += modId === "game" ? (e.playtimeHours || 0) : ((e.progress && e.progress.current) || 0);
      });
      function cell(v, k) {
        return el("div", { class: "k-mstat" }, [el("dd", { class: "k-mono", text: String(v) }), el("dt", { text: k })]);
      }
      body.appendChild(el("dl", { class: "k-mstat-band" }, [
        cell(rows.length, "in the vault"),
        cell(inProg, modId === "books" ? "reading" : modId === "anime" ? "watching" : "playing"),
        cell(completed, "finished"),
        cell(modId === "game" ? Math.round(units) + " hr" : units, modId === "game" ? "logged" : mod.unitName + " logged"),
        cell(scored ? (scoreSum / scored).toFixed(1) : "—", "mean score"),
        cell(favs, "in the Shrine")
      ]));

      var grid = el("div", { class: "k-mstats-grid" });
      body.appendChild(grid);

      /* 1 — composition donut */
      var statusData = STATUSES.map(function (s) {
        return { label: KOS.media.STATUS_LABEL[s], value: rows.filter(function (e) { return e.status === s; }).length,
          color: "var(--st-" + s + ")" };
      });
      grid.appendChild(KOS.charts.chartCard("By status", "the shape of the vault",
        KOS.charts.donutWithLegend(statusData, { centre: rows.length, centreSub: "titles" })));

      /* 2 — score distribution */
      var scores = [];
      for (var i = 1; i <= 10; i++) {
        scores.push({ label: String(i), value: rows.filter(function (e) { return Math.round(e.score) === i && e.score; }).length,
          color: i >= 8 ? "var(--gold)" : i >= 5 ? "var(--green)" : "var(--red)" });
      }
      if (scored) grid.appendChild(KOS.charts.chartCard("Scores", "everything you have rated, out of 10",
        KOS.charts.barChart(scores)));

      /* 3 — top genres, ranked */
      var gCount = {};
      rows.forEach(function (e) { (e.genres || []).forEach(function (g) { gCount[g] = (gCount[g] || 0) + 1; }); });
      var gTop = Object.keys(gCount).map(function (g) { return { label: g, value: gCount[g] }; })
        .sort(function (a, b) { return b.value - a.value; }).slice(0, 8);
      if (gTop.length) grid.appendChild(KOS.charts.chartCard("Genres", "where your taste actually lives",
        KOS.charts.hbarChart(gTop, { color: mod.accent })));

      /* 4 — finishes over the last 12 months */
      var months = [], now = new Date();
      for (var j = 11; j >= 0; j--) {
        var d = new Date(now.getFullYear(), now.getMonth() - j, 1);
        var key = d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2);
        months.push({ key: key, label: ["J","F","M","A","M","J","J","A","S","O","N","D"][d.getMonth()], value: 0 });
      }
      rows.forEach(function (e) {
        var mk = monthKey(e.dates && e.dates.finished);
        var hit = months.find(function (x) { return x.key === mk; });
        if (hit) hit.value++;
      });
      if (months.some(function (x) { return x.value; })) {
        grid.appendChild(KOS.charts.chartCard("Finished, by month", "the last twelve months",
          KOS.charts.lineChart(months, { color: mod.accent })));
      }

      /* the activity heatmap — sessions logged against this module */
      var byDay = {}, total = 0;
      KOS.sessions.all().forEach(function (s) {
        if (s.type === "media" && s.metrics && s.metrics.module === modId) byDay[s.date] = (byDay[s.date] || 0) + 1;
      });
      var days = [];
      for (var h = 16 * 7 - 1; h >= 0; h--) {
        var dd = KOS.srs.addDays(KOS.srs.todayISO(), -h);
        var n = byDay[dd] || 0; total += n;
        days.push({ date: dd, value: n, hint: dd + ": " + n });
      }
      if (total) {
        var verb = modId === "books" ? "reading" : modId === "anime" ? "watch" : modId === "vn" ? "reading" : "play";
        grid.appendChild(KOS.charts.chartCard("Activity", total + " " + verb + " logs · 16 weeks",
          KOS.charts.heatmap(days, { color: mod.accent })));
      }

      /* 5 — module-specific extras */
      if (modId === "game") {
        var pCount = {};
        rows.forEach(function (e) { if (e.platform) pCount[e.platform] = (pCount[e.platform] || 0) + 1; });
        var pData = Object.keys(pCount).map(function (p) {
          return { label: KOS.media.PLATFORM_LABEL && KOS.media.PLATFORM_LABEL[p] || p, value: pCount[p] };
        }).sort(function (a, b) { return b.value - a.value; });
        if (pData.length) grid.appendChild(KOS.charts.chartCard("Platforms", "where the hours went",
          KOS.charts.hbarChart(pData, { color: mod.accent })));
      }
      if (modId === "books") {
        var owned = 0;
        rows.forEach(function (e) { owned += (e.physical && e.physical.volumes ? e.physical.volumes.length : 0); });
        if (owned) body.appendChild(el("p", { class: "k-muted", text: owned + " physical volumes on the shelf across " +
            rows.filter(function (e) { return e.physical && e.physical.volumes && e.physical.volumes.length; }).length + " series." }));
      }
      if (modId === "vn") {
        var routes = 0, quotes = 0;
        rows.forEach(function (e) {
          routes += (e.routes || []).filter(function (r) { return r.cleared; }).length;
          quotes += (e.quotes || []).length;
        });
        if (routes || quotes) body.appendChild(el("p", { class: "k-muted", text: routes + " routes cleared · " + quotes + " quotes kept." }));
      }

      dialogBox(overlay, "vault.stats", mod.label + " — the numbers", rows.length + (rows.length === 1 ? " entry" : " entries"), body, null, "k-mstats-dialog");
      KOS.ui.openDialog(overlay);
    });
  }

  /* ---------------- filter rail (Build 3k / frame 11b) ----------------
     Status + shared Custom Lists (the two axes every medium shares), each
     row with a live count. onChange() fires when the selection changes →
     the caller re-runs its query reading rail.status() / rail.customList(). */
  function filterRail(module, onChange) {
    var sel = { status: null, customList: null };
    var statusBox = el("div", { class: "k-mrail-group" });
    var listBox = el("div", { class: "k-mrail-group" });
    var root = el("nav", { class: "k-mrail", "data-ui": "vault.filter-rail", "aria-label": "Filters" }, [statusBox, listBox]);

    /* audit VLT-7: AniList custom lists whose names are pure decoration
       ("—— ☆ ——") keep their name exactly (it round-trips to AniList), but
       the row says what it is and how many titles are on it. */
    function isDecorative(name) {
      return !/[0-9A-Za-zÀ-ɏ぀-ヿ一-鿿]/.test(String(name || ""));
    }
    function rowBtn(label, active, count, onClick, opts) {
      opts = opts || {};
      var deco = !!opts.list && isDecorative(label);
      var b = el("button", {
        type: "button", class: "k-mrail-row", "data-status": opts.status || null,
        "aria-current": active ? "true" : null,
        title: deco ? "An imported list whose name is decoration: " + label : null,
        onclick: onClick
      }, [
        opts.status ? el("span", { class: "k-mrail-dot", "aria-hidden": "true" }) : null,
        el("span", { class: "k-mrail-lbl" }, deco
          ? [el("span", { class: "k-mono k-muted", text: label }), el("em", { text: " unnamed list" })]
          : [document.createTextNode(label)]),
        count != null ? el("span", { class: "k-mrail-n k-mono", text: String(count) }) : null
      ].filter(Boolean));
      if (active) KOS.ui.state(b, "active", true);
      if (deco) KOS.ui.state(b, "deco", true);
      return b;
    }
    function pick(what, val) {
      sel[what] = val;
      if (what === "status" && val) sel.customList = null;   // one primary axis at a time keeps counts honest
      if (what === "customList" && val) sel.status = null;
      render();
      onChange();
    }

    var counts = { status: {}, list: {}, total: 0 };
    function render() {
      statusBox.innerHTML = "";
      statusBox.appendChild(el("h2", { class: "k-kicker k-mrail-h", text: "Status" }));
      statusBox.appendChild(rowBtn("All", sel.status == null && sel.customList == null, counts.total, function () { pick("status", null); }));
      STATUSES.forEach(function (s) {
        statusBox.appendChild(rowBtn(KOS.media.STATUS_LABEL[s], sel.status === s, counts.status[s] || 0, function () { pick("status", s); }, { status: s }));
      });

      listBox.innerHTML = "";
      listBox.appendChild(el("h2", { class: "k-kicker k-mrail-h" }, [
        el("span", { text: "Lists" }),
        el("button", { type: "button", class: "k-link k-mrail-manage", title: "New / rename / delete lists", text: "Manage", onclick: function () { manageLists(module, reload); } })
      ]));
      var names = Object.keys(counts.list);
      if (!names.length) {
        listBox.appendChild(el("p", { class: "k-mrail-empty", text: "No custom lists yet." }));
      } else {
        names.sort(function (a, b) { return a.toLowerCase() < b.toLowerCase() ? -1 : 1; }).forEach(function (n) {
          listBox.appendChild(rowBtn(n, sel.customList === n, counts.list[n], function () { pick("customList", sel.customList === n ? null : n); }, { list: true }));
        });
      }
      listBox.appendChild(el("button", { type: "button", class: "k-mrail-row k-mrail-new", text: "＋ New list", onclick: function () { newList(module, reload); } }));
    }

    function reload() {
      KOS.media.customLists(module, function (e0, names) {
        KOS.mediadb.query({ module: module }, function (err, rows) {
          counts = { status: {}, list: {}, total: (rows || []).length };
          (names || []).forEach(function (n) { counts.list[n] = 0; });
          (rows || []).forEach(function (e) {
            counts.status[e.status] = (counts.status[e.status] || 0) + 1;
            (e.customLists || []).forEach(function (n) { counts.list[n] = (counts.list[n] || 0) + 1; });
          });
          /* a filter whose list vanished falls back to All */
          if (sel.customList && counts.list[sel.customList] == null) { sel.customList = null; onChange(); }
          render();
        });
      });
    }
    render();
    reload();
    return {
      root: root,
      status: function () { return sel.status; },
      customList: function () { return sel.customList; },
      reload: reload
    };
  }

  function newList(module, done) {
    var overlay = modalOverlay();
    var nameIn = el("input", { type: "text", class: "k-input", "data-ui": "ui.quick-add", placeholder: "List name — e.g. “Comfort reads”, “100% club”", "aria-label": "List name" });
    function create() {
      var n = nameIn.value.trim();
      if (!n) { KOS.ui.toast("Give the list a name first.", true); return; }
      KOS.media.registerList(module, n, function () { overlay.close(); KOS.ui.toast("List created."); done && done(); });
    }
    nameIn.addEventListener("keydown", function (ev) { if (ev.key === "Enter") create(); });
    dialogBox(overlay, "cl.dialog", "New custom list", null,
      el("div", { class: "k-dialog-body", "data-ui": "ui.form" }, [field("Name", nameIn)]),
      el("div", { class: "k-dialog-foot" }, [
        el("button", { type: "button", class: "k-btn k-spacer", text: "Cancel", onclick: function () { overlay.close(); } }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Create", onclick: create })
      ]));
    KOS.ui.openDialog(overlay);
    setTimeout(function () { nameIn.focus(); }, 30);
  }

  function manageLists(module, done) {
    var overlay = modalOverlay(function () { done && done(); });
    var body = el("div", { class: "k-dialog-body k-mlists" });
    function fill() {
      body.innerHTML = "";
      KOS.media.customLists(module, function (e0, names) {
        if (!names.length) { body.appendChild(el("p", { class: "k-muted", text: "No custom lists yet — create one from the filter rail." })); return; }
        names.forEach(function (n) {
          var nameIn = el("input", { type: "text", class: "k-input", "data-ui": "ui.quick-add", "aria-label": "List name" });
          nameIn.value = n;
          body.appendChild(el("div", { class: "k-mlists-row" }, [
            nameIn,
            el("button", { type: "button", class: "k-btn k-btn--sm", text: "Rename", onclick: function () {
              var to = nameIn.value.trim();
              if (!to || to === n) return;
              KOS.media.renameList(module, n, to, function () { KOS.ui.toast("Renamed."); fill(); });
            } }),
            el("button", { type: "button", class: "k-btn k-btn--sm k-btn--danger", "data-intent": "danger", text: "Delete", onclick: function () {
              KOS.ui.confirm({ title: "Delete “" + n + "”?", danger: true, confirm: "Delete",
                body: "The list is removed from every entry that's on it. The entries themselves stay." }, function () {
                KOS.media.deleteList(module, n, function () { KOS.ui.toast("List deleted."); fill(); });
              });
            } })
          ]));
        });
      });
    }
    dialogBox(overlay, "cl.dialog", "Manage custom lists", null, body,
      el("div", { class: "k-dialog-foot" }, [
        el("button", { type: "button", class: "k-btn k-spacer", text: "＋ New list", onclick: function () { newList(module, fill); } }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Done", onclick: function () { overlay.close(); } })
      ]));
    KOS.ui.openDialog(overlay);
    fill();
  }

  /* the per-entry custom-list assignment control for editors (all modules).
     Known lists as toggle pills + a free-text add. Mutates
     entry.customLists in place; the editor's normal save persists it. */
  function customListChips(entry) {
    entry.customLists = Array.isArray(entry.customLists) ? entry.customLists : [];
    var wrap = el("div", { class: "k-cluster k-mlist-chips", "data-ui": "cl.chips" });
    function render() {
      wrap.innerHTML = "";
      KOS.media.customLists(entry.module, function (e0, names) {
        var known = {};
        names.forEach(function (n) { known[n] = true; });
        entry.customLists.forEach(function (n) { known[n] = true; });
        Object.keys(known).sort().forEach(function (n) {
          var on = entry.customLists.indexOf(n) !== -1;
          wrap.appendChild(el("button", { type: "button", class: "k-qz-pill", "data-ui": "cl.chip", "aria-pressed": String(on), text: (on ? "✓ " : "") + n, onclick: function () {
            if (on) entry.customLists = entry.customLists.filter(function (x) { return x !== n; });
            else entry.customLists.push(n);
            render();
          } }));
        });
        var addIn = el("input", { type: "text", class: "k-pill-select", "data-ui": "ui.quick-add", placeholder: "＋ new list…", "aria-label": "Add to a new list" });
        addIn.addEventListener("keydown", function (ev) {
          if (ev.key !== "Enter") return;
          ev.preventDefault();
          var n = addIn.value.trim();
          if (!n) return;
          if (entry.customLists.indexOf(n) === -1) entry.customLists.push(n);
          KOS.media.registerList(entry.module, n, function () { render(); });
        });
        wrap.appendChild(addIn);
      });
    }
    render();
    return wrap;
  }

  /* ================= the vault page (frame 11b) =================
     The page head, the spotlight holder, and the rail beside a column
     whose first row is the count + controls. Every medium mounts this;
     what differs is the toolbar content and the card builder.
     Returns { hero, rail slot, column, controls row }. */
  function vaultPage(main, opts) {
    main.appendChild(KOS.ui.pageHeader({ kicker: opts.kicker, title: opts.title, sub: opts.sub, actions: opts.actions }));
    var heroHolder = el("div", { class: "k-vhero-holder" });
    main.appendChild(heroHolder);
    var mainCol = el("div", { class: "k-mmain", "data-ui": "vault.main" });
    var controls = el("div", { class: "k-mcontrols" });
    mainCol.appendChild(controls);
    var layout = el("div", { class: "k-mlayout-grid", "data-ui": "vault.layout" }, [mainCol]);
    main.appendChild(layout);
    return {
      heroHolder: heroHolder, mainCol: mainCol, controls: controls, layout: layout,
      setRail: function (node) { layout.insertBefore(node, mainCol); },
      setBar: function (bar) { controls.appendChild(bar.root || bar); }
    };
  }

  KOS.medview = {
    BATCH: BATCH,
    heroCard: heroCard,
    filterRail: filterRail,
    customListChips: customListChips,
    statsModal: statsModal,
    listRow: listRow,
    card: card,
    chip: chip,
    favButton: favButton,
    vaultPage: vaultPage,
    primaryButton: primaryButton,
    facetSelect: facetSelect,
    dialogBox: dialogBox,
    addHook: addHook,
    STATUSES: STATUSES,
    NEEDS_IDB: NEEDS_IDB,
    unavailable: unavailable,
    cover: cover,
    coverPositionControl: coverPositionControl,
    fillSel: fillSel,
    fillFacetSel: fillFacetSel,
    tallyFacet: tallyFacet,
    CANON_GENRES: CANON_GENRES,
    toolbar: toolbar,
    selFacet: selFacet,
    toggleFacet: toggleFacet,
    titleHue: titleHue,
    heroBackdrop: heroBackdrop,
    searchInput: searchInput,
    sortSelect: sortSelect,
    layoutToggle: layoutToggle,
    statusPills: statusPills,
    emptyState: emptyState,
    resultsArea: resultsArea,
    bumpUnit: bumpUnit,
    field: field,
    editorSection: editorSection,
    sourceInfo: sourceInfo,
    calField: calField,
    splitList: splitList,
    modalOverlay: modalOverlay,
    editDraft: editDraft,
    editorModal: editorModal,
    saveEntry: saveEntry,
    deleteEntry: deleteEntry,
    quickEdit: quickEdit,
    quickStatus: quickStatus,
    quickScore: quickScore,
    quickRow: quickRow,
    pushChip: pushChip
  };
})();
