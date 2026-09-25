/* Kurenai OS — modules/books.js
   The Books module (Build 3b): manga, light novels and one-shots in one
   vault, with the schema's core idea made visible — DUAL TRACKING. One
   entry carries both halves at once: the digital reading state (status,
   chapters/volumes read, score — synced from AniList or tracked by hand)
   and the physical vault (per-volume condition, purchase date, price).
   Either half is optional; the owned-vs-read bar is the payoff.

   Also here: the virtual bookshelf (deterministic spine colours, optional
   per-volume custom covers via the Build 2a canvas-compress pattern), the
   Mangaka author pages (name-based grouping — no entity resolution), the
   reading heatmap (session log + KOS.charts, nothing new), and the
   StoryGraph-lite axes: mood tags, half-star ratings, DNF, custom shelves.

   Same scale rules as anime.js: filters run on the DB indexes, cards render
   in batches via an IntersectionObserver sentinel, covers lazy-load.
   Governor contract unchanged from 3a: deliberate log actions →
   KOS.media.logActivity (+4 XP/+1 gold, 0 HP, rest streak only).

   Build 3i on top: the Physical/Digital TAB SPLIT (navigation only — one
   vault, two lenses; a series tracked both ways shows in both, and the
   owned-vs-read comparison moved INTO the editor so the split can't bury
   it), the external book lookup (Open Library primary / Google Books
   fallback — see bookapi.js for the live findings — with BarcodeDetector
   scanning where the browser has it and typed ISBN everywhere), reading
   sessions on the Focus Timer's state machine (kind "reading" → logs
   type "media", rest rules), and ranked shelves (per-shelf manual order
   in the media kv store, drag/▲▼ when a shelf filter is active).          */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var BATCH = 60;
  var STATUSES = ["inProgress", "planned", "onHold", "completed", "dropped"];
  var CH_PER_VOL = 9;   // volume estimate when AniList doesn't know the count

  /* The view prefs, read without writing (§0.2.3): a working copy the
     view mutates and persist()s when you actually change something.
     Build 3i — the Physical/Digital lens split is NAVIGATION ONLY: tab + a
     separate layout per lens are view prefs. A saved pre-3i "shelf" pref
     reads as the Physical lens's shelf, spines intact. */
  function prefs() {
    var m = store.state.media;
    var b = Object.assign({ layout: "grid", sort: "updated" }, (m && m.books) || {});
    if (b.layout === "shelf") {
      b.tab = "physical";
      b.physLayout = "shelf";
      b.layout = "grid";
    }
    if (b.tab !== "physical" && b.tab !== "digital") b.tab = "digital";
    if (b.physLayout !== "shelf" && b.physLayout !== "grid" && b.physLayout !== "list") b.physLayout = "shelf";
    return b;
  }
  function persist(p) {
    var m = store.state.media = store.state.media || {};
    m.books = p;
    store.save();
  }

  /* ================= domain helpers (exposed as KOS.books) ================= */

  /* How many volumes does the series run to? Real count from sync/XML if we
     have one, else a chapter-derived estimate (flagged as such). */
  function totalVolumes(e) {
    var real = e.progress.totalVolumes || (e.extra && e.extra.volumes) || null;
    if (real) return { n: real, est: false };
    if (e.progress.total) return { n: Math.max(1, Math.ceil(e.progress.total / CH_PER_VOL)), est: true };
    return { n: null, est: false };
  }

  /* The dual-tracking payoff in numbers: what fraction is OWNED (physical
     volumes / series volumes) vs what fraction is READ (chapters, falling
     back to volumes-read when chapters are unknown). */
  function ownership(e) {
    var tv = totalVolumes(e);
    var ownedVols = e.physical ? e.physical.volumes.length : 0;
    var ownedPct = tv.n ? Math.min(100, Math.round(100 * ownedVols / tv.n)) : null;
    var readPct = null, readOpen = false, readTitle = null;
    if (e.progress.total) readPct = Math.min(100, Math.round(100 * (e.progress.current || 0) / e.progress.total));
    else if (tv.n && e.progress.volumes != null) readPct = Math.min(100, Math.round(100 * e.progress.volumes / tv.n));
    else {
      /* volumes read, or a series still releasing: the shared rule
         (KOS.media.progressFill) so the card and this panel agree */
      var fill = KOS.media.progressFill(e);
      if (fill) { readPct = fill.pct; readOpen = fill.open; readTitle = fill.title; }
    }
    return { ownedVols: ownedVols, totalVols: tv.n, est: tv.est, ownedPct: ownedPct, readPct: readPct, readOpen: readOpen, readTitle: readTitle };
  }

  /* Deterministic spine colour: same series → same colour every session.
     A curated dark-jewel palette (the --spine-N tokens, not random hues)
     so the shelf sits inside the theme instead of fighting it. */
  var SPINE_COUNT = 10;
  function spineColor(title) {
    var h = 5381;
    String(title).split("").forEach(function (c) { h = ((h << 5) + h + c.charCodeAt(0)) | 0; });
    return "var(--spine-" + (Math.abs(h) % SPINE_COUNT) + ")";
  }

  /* Half-star rating: stored on the shared 0–10 score (0 = unrated), shown
     as /5 stars in .5 steps — StoryGraph-style. */
  function starText(score) {
    var half = Math.round(score);          // score 0–10 → half-stars 0–10
    var s = "";
    for (var i = 0; i < Math.floor(half / 2); i++) s += "★";
    if (half % 2) s += "½";
    return s || "";
  }
  function starWidget(initial, onChange) {
    var val = initial || 0;   // 0–10 half-star units
    var wrap = el("div", { class: "k-bk-stars", "data-ui": "books.stars", role: "slider", tabindex: "0",
      "aria-label": "Rating out of 5, half-star steps",
      "aria-valuemin": "0", "aria-valuemax": "5" });
    var out = el("span", { class: "k-mono k-muted" });
    function paint() {
      wrap.querySelectorAll("[data-ui~='books.star']").forEach(function (st, i) {
        var lit = val - i * 2;   // 2 half-units per star
        KOS.ui.state(st, "full", lit >= 2);
        KOS.ui.state(st, "half", lit === 1);
      });
      out.textContent = val ? (val / 2).toFixed(1) + " / 5" : "unrated";
      wrap.setAttribute("aria-valuenow", String(val / 2));
      onChange && onChange(val);
    }
    for (var i = 0; i < 5; i++) {
      (function (idx) {
        var st = el("span", { class: "k-bk-star", "data-ui": "books.star", text: "★" });
        st.addEventListener("click", function (ev) {
          var left = ev.offsetX < st.offsetWidth / 2;
          var next = idx * 2 + (left ? 1 : 2);
          val = (val === next) ? 0 : next;   // click the same value again to clear
          paint();
        });
        wrap.appendChild(st);
      })(i);
    }
    wrap.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowRight") { val = Math.min(10, val + 1); paint(); ev.preventDefault(); }
      if (ev.key === "ArrowLeft") { val = Math.max(0, val - 1); paint(); ev.preventDefault(); }
    });
    wrap.appendChild(out);
    paint();
    wrap.value = function () { return val; };
    return wrap;
  }

  /* ---- physical vault mutations (pure, then the caller puts) ---- */
  function ensurePhysical(e) {
    if (!e.physical) e.physical = { owned: true, volumes: [] };
    return e.physical;
  }
  function nextVolumeNumber(e) {
    var vols = e.physical ? e.physical.volumes : [];
    return vols.reduce(function (a, v) { return Math.max(a, v.number); }, 0) + 1;
  }
  /* Range tool: "Add volumes 1–15" with shared defaults → individual volume
     records, each editable afterwards. Numbers already owned are skipped,
     never duplicated. Returns how many were actually added. */
  function addVolumeRange(e, from, to, defaults) {
    defaults = defaults || {};
    var ph = ensurePhysical(e);
    var have = {};
    ph.volumes.forEach(function (v) { have[v.number] = true; });
    var added = 0;
    for (var n = from; n <= to; n++) {
      if (have[n]) continue;
      ph.volumes.push(KOS.mediadb.normVolume({
        number: n, condition: defaults.condition,
        purchaseDate: defaults.purchaseDate, price: defaults.price
      }));
      added++;
    }
    ph.volumes.sort(function (a, b) { return a.number - b.number; });
    return added;
  }

  /* Legacy/public helper retained for callers and tests. It now compresses
     the whole source; the per-volume `coverCrop` owns the visible 2:3 view. */
  function compressVolumeCover(file, done) {
    KOS.imageCrop.prepareFile(file, { maxWidth: 900, maxHeight: 1350, maxBytes: 420 * 1024, quality: 0.84 }, done);
  }

  /* ---- shelf ranking (Build 3i) ----
     Shelves stay what they were (string tags on entries); a shelf becomes a
     RANKED list by storing an id order per shelf name in the media kv store
     ("books.shelfOrder"), beside the vault it describes — never in the
     localStorage backup. applyShelfOrder is pure: ranked ids first in their
     stored order, unranked rows appended in the incoming (sorted) order. */
  function applyShelfOrder(rows, orderIds) {
    if (!Array.isArray(orderIds) || !orderIds.length) return rows.slice();
    var pos = {};
    orderIds.forEach(function (id, i) { pos[id] = i; });
    var ranked = [], rest = [];
    rows.forEach(function (r) { (pos[r.id] != null ? ranked : rest).push(r); });
    ranked.sort(function (a, b) { return pos[a.id] - pos[b.id]; });
    return ranked.concat(rest);
  }
  function getShelfOrders(cb) {
    KOS.mediadb.getKV("books.shelfOrder", function (err, v) { cb(err, v || {}); });
  }
  function setShelfOrder(shelf, ids, cb) {
    getShelfOrders(function (err, all) {
      if (err) { cb && cb(err); return; }
      all[shelf] = ids;
      KOS.mediadb.setKV("books.shelfOrder", all, cb);
    });
  }

  KOS.books = {
    totalVolumes: totalVolumes,
    ownership: ownership,
    spineColor: spineColor,
    starText: starText,
    nextVolumeNumber: nextVolumeNumber,
    addVolumeRange: addVolumeRange,
    compressVolumeCover: compressVolumeCover,
    applyShelfOrder: applyShelfOrder,
    getShelfOrders: getShelfOrders,
    setShelfOrder: setShelfOrder
  };

  /* ================= little shared bits ================= */
  var mod = function () { return KOS.media.module("books"); };
  function formatChip(e) {
    return e.format ? KOS.medview.chip(KOS.media.FORMAT_LABEL[e.format] || e.format, "format", { "data-ui": "books.format" }) : null;
  }
  function dnfChip(e) {
    return (e.dnf && e.dnf.isDnf)
      ? KOS.medview.chip("DNF", "crimson", { "data-ui": "books.dnf", title: e.dnf.reason || "Did not finish" })
      : null;
  }
  /* the shared grammar (audit MTX-6/U-30), plus the volume half Books
     alone tracks — "36 / 96 ch · 7 / 8 vol", spaced like everything else */
  function progressText(e) {
    var s = KOS.media.progressText(e) || "0 ch";
    if (e.progress.volumes != null) {
      var tv = totalVolumes(e);
      s += " · " + e.progress.volumes + (tv.n ? " / " + tv.n : "") + " vol";
    }
    return s;
  }

  /* +1 chapter — the everyday logging action, mirroring anime's +1 ep
     (shared bump, mode "progress") */
  function bumpChapter(e, done) { KOS.medview.bumpUnit(e, "progress", done); }

  function input(type, attrs, value) {
    var n = el("input", Object.assign({ type: type, class: "k-input", "data-ui": "ui.quick-add" }, attrs || {}));
    if (value != null) n.value = value;
    return n;
  }
  function numInput(attrs, value) {
    var n = el("input", Object.assign({ type: "number", class: "k-input", "data-ui": "ui.quick-add vault.num" }, attrs || {}));
    if (value != null) n.value = value;
    return n;
  }
  function select(options, value, attrs) {
    var s = el("select", Object.assign({ class: "k-input", "data-ui": "ui.status-select" }, attrs || {}), options.map(function (o) {
      return el("option", { value: o[0], text: o[1] });
    }));
    if (value != null) s.value = value;
    return s;
  }

  /* ================= the editor (shared medview drawer) ================= */
  /* Is this row the digital half's business — i.e. AniList's? Such a row
     is a MIRROR: bibliographic identity, totals and genres are shown, not
     edited, and there is no Delete (remove it on AniList and the next
     pull mirrors that — invariant 92). Reading state still edits and
     pushes back; the physical shelf and the personal layer are yours. */
  function mirrored(e) {
    return !!(e && (e.syncSource === "anilist" || (e.externalIds && e.externalIds.anilistId)));
  }
  KOS.books.mirrored = mirrored;

  function booksEditor(entry, onSaved) {
    /* a lookup-prefilled draft (3i) arrives as an entry with no id — still
       a NEW entry: shows "Add", logs "added" on save. New entries are the
       PHYSICAL vault's: a hand-made book must go on the shelf with at
       least one volume, because the digital half is AniList's alone. */
    var mv = KOS.medview;
    var isNew = !entry || entry.id == null;
    var e = mv.editDraft(entry, "books");
    var mirror = mirrored(e);
    if (isNew && !e.physical) e.physical = { owned: true, volumes: [] };
    var pushBefore = KOS.mediapush.snapshot(e);
    var field = mv.field, splitList = mv.splitList;
    /* a read-only AniList fact — omitted when AniList has none (invariant 77) */
    function ro(label, text, wide) {
      return text ? field(label, el("div", { class: "k-mro", "data-ui": "vault.ro", text: String(text) }), wide) : null;
    }

    /* --- identity + reading state --- */
    var title = input("text", { placeholder: "Series title" }, e.title === "Untitled" && isNew ? "" : e.title);
    var author = input("text", { placeholder: "Author / mangaka (filled by sync when linked)" }, e.author);
    var fmt = select([["manga", "Manga"], ["lightNovel", "Light Novel"], ["oneShot", "One-shot"]], e.format || "manga");
    var status = select(STATUSES.map(function (s) { return [s, KOS.media.STATUS_LABEL[s]]; }), e.status);
    var chCur = numInput({ min: "0" }, String(e.progress.current || 0));
    var chTot = numInput({ min: "0", placeholder: "?" }, e.progress.total != null ? String(e.progress.total) : "");
    var vlCur = numInput({ min: "0", placeholder: "—" }, e.progress.volumes != null ? String(e.progress.volumes) : "");
    var vlTot = numInput({ min: "0", placeholder: "?" }, e.progress.totalVolumes != null ? String(e.progress.totalVolumes) : "");
    var stars = starWidget(e.score ? Math.round(e.score) : 0, null);
    var started = input("date", null, e.dates.started || "");
    var finished = input("date", null, e.dates.finished || "");

    /* --- DNF (orthogonal to status; ticking it defaults status → dropped) --- */
    var dnfBox = el("input", { type: "checkbox", class: "k-box" });
    dnfBox.checked = e.dnf.isDnf;
    var dnfReason = input("text", { placeholder: "why it lost you (optional)", "aria-label": "Why it lost you" }, e.dnf.reason);
    var reasonField = field("Reason", dnfReason);
    reasonField.hidden = !e.dnf.isDnf;
    dnfBox.addEventListener("change", function () {
      reasonField.hidden = !dnfBox.checked;
      if (dnfBox.checked && status.value !== "completed") status.value = "dropped";
    });

    /* --- taxonomy --- */
    var genres = input("text", { placeholder: "Drama, Fantasy…" }, e.genres.join(", "));
    var tags = input("text", { placeholder: "reread, gift…" }, e.tags.join(", "));
    var mood = input("text", { placeholder: "dark, hopeful, tense… (its own axis, not genre)" }, e.mood.join(", "));
    var shelves = input("text", { placeholder: "top-shelf, to-lend… (your own shelf names)" }, e.shelves.join(", "));
    var coverU = input("url", { placeholder: "https://… (filled by sync/enrichment)" }, e.coverUrl || "");
    var coverPosition = mv.coverPositionControl(e, coverU);
    var fav = el("input", { type: "checkbox", class: "k-box" });
    fav.checked = e.favourite;
    var notes = el("textarea", { class: "k-input", "data-ui": "ui.note-area", rows: 3, placeholder: "Notes…" });
    notes.value = e.notes || "";

    /* --- the owned% vs read% comparison (3b's payoff): the two halves of
       one entry, the shelf and the eyes, on the shared bar --- */
    function comparePanel() {
      var o = ownership(e);
      var wrap = el("div", { class: "k-bk-compare", "data-ui": "books.compare" }, [
        el("div", { class: "k-vn-head" }, [
          el("b", { text: "Owned vs read" }),
          el("p", { class: "k-field-hint", text: "the two halves of this one entry — the shelf and the eyes" })
        ])
      ]);
      if (o.ownedPct == null && o.readPct == null) {
        wrap.appendChild(el("p", { class: "k-muted", text:
          "Nothing to compare yet — add owned volumes below and/or reading progress above, and the bars appear." }));
        return wrap;
      }
      function row(label, pct, detail, open, tone) {
        var bar = el("div", { class: "k-bar k-bar--6", role: "img", "aria-label": label + ": " + detail }, [el("i", { "data-ui": "media.bar-fill" })]);
        bar.style.setProperty("--p", (pct || 0) + "%");
        bar.style.setProperty("--bar-c", tone);
        if (open) KOS.ui.state(bar, "open", true);
        return el("div", { class: "k-bk-compare-row", "data-ui": "books.compare-row" }, [
          el("span", { class: "k-muted", text: label }), bar, el("span", { class: "k-mono", text: detail })
        ]);
      }
      wrap.appendChild(row("Owned", o.ownedPct,
        o.ownedPct != null
          ? o.ownedVols + "/" + o.totalVols + " vols" + (o.est ? " (est.)" : "") + " · " + o.ownedPct + "%"
          : "no volumes recorded", false, "var(--books)"));
      wrap.appendChild(row("Read", o.readPct,
        o.readPct == null ? "progress unknown"
          : o.readTitle ? o.readTitle
          : o.readPct + "%", o.readOpen, "var(--green)"));
      return wrap;
    }

    /* --- the physical vault (frame 11d): what is on the shelf in figures,
       every volume as a tile (read ✓ / owned / not owned), the selected
       volume's own record, then the quick add and the range tool --- */
    var physWrap = el("div", { class: "k-bk-phys" });
    var selectedVol = null;
    function renderPhys() {
      physWrap.innerHTML = "";
      var vols = e.physical ? e.physical.volumes : [];
      var spent = vols.reduce(function (a, v) { return a + (v.price || 0); }, 0);
      var tv = totalVolumes(e);
      var readVols = e.progress.volumes || 0;
      var readOwned = vols.filter(function (v) { return v.number <= readVols; }).length;
      var ownedUnread = vols.length - readOwned;

      physWrap.appendChild(el("dl", { class: "k-bk-band" }, [
        ["On the shelf", vols.length + (tv.n ? " of " + tv.n : "")],
        ["Read", String(readVols || 0)],
        ["Owned, unread", String(Math.max(0, ownedUnread)), ownedUnread > 0 ? "amber" : null],
        ["Shelf value", spent ? "£" + spent.toFixed(2) : "—"]
      ].map(function (c) {
        return el("div", { class: "k-bk-fig" }, [el("dt", { text: c[0] }), el("dd", { "data-tone": c[2] || null, text: c[1] })]);
      })));

      var head = el("div", { class: "k-vn-head" }, [
        el("b", { text: "Volumes" }),
        el("p", { class: "k-field-hint", text: vols.length
          ? vols.length + (vols.length === 1 ? " volume owned" : " volumes owned") + (spent ? " · £" + spent.toFixed(2) : "") + " — owned vs read are tracked separately"
          : "nothing owned yet — this half is optional" })
      ]);
      physWrap.appendChild(head);

      /* the tiles: every owned number, plus the gaps up to the series
         length, so a missing volume shows as not owned */
      var maxN = Math.max(tv.n || 0, vols.reduce(function (a, v) { return Math.max(a, v.number); }, 0));
      if (maxN) {
        var byN = {};
        vols.forEach(function (v) { byN[v.number] = v; });
        if (!selectedVol || vols.indexOf(selectedVol) === -1) selectedVol = vols[vols.length - 1] || null;
        var grid = el("div", { class: "k-bk-vols", role: "list", "aria-label": "Volumes" });
        for (var n = 1; n <= Math.min(maxN, 200); n++) {
          (function (num) {
            var v = byN[num];
            var read = num <= readVols;
            var label = v ? (read ? "Read" : "Owned") : "Not owned";
            var tile = el("button", { type: "button", class: "k-bk-vol", "data-ui": "books.vol", role: "listitem",
              "aria-label": "Volume " + num + " — " + label + (v ? "" : " (add it with the range tool)"),
              "aria-pressed": v && v === selectedVol ? "true" : "false", disabled: v ? null : "",
              onclick: function (ev) { ev.preventDefault(); if (v) { selectedVol = v; renderPhys(); } } }, [
              el("span", { class: "k-bk-vol-art", "aria-hidden": "true" }, [
                v && v.coverUrl ? KOS.imageCrop.image(v.coverUrl, { alt: "", loading: "lazy" }, v.coverCrop) : null,
                el("span", { class: "k-bk-vol-n k-mono", text: String(num) }),
                read && v ? el("span", { class: "k-bk-vol-read", text: "✓" }) : null
              ].filter(Boolean)),
              el("span", { class: "k-bk-vol-l", text: label })
            ]);
            tile.style.setProperty("--spine", spineColor(title.value || e.title));
            if (!v) KOS.ui.state(tile, "missing", true);
            grid.appendChild(tile);
          })(n);
        }
        physWrap.appendChild(grid);
      }

      /* the selected volume's record */
      if (selectedVol) {
        var v = selectedVol;
        var cond = select(KOS.mediadb.CONDITIONS.map(function (c) { return [c, KOS.media.CONDITION_LABEL[c]]; }), v.condition, { "aria-label": "Condition of volume " + v.number });
        cond.addEventListener("change", function () { v.condition = cond.value; });
        var date = input("date", { "aria-label": "Purchase date of volume " + v.number }, v.purchaseDate || "");
        date.addEventListener("change", function () { v.purchaseDate = date.value || null; });
        var price = input("number", { min: "0", step: "0.01", placeholder: "£", "aria-label": "Price of volume " + v.number }, v.price != null ? String(v.price) : "");
        price.addEventListener("change", function () {
          var p = parseFloat(price.value);
          v.price = isNaN(p) ? null : p;
        });
        var covBtn = el("button", { type: "button", class: "k-btn k-btn--sm", text: v.coverUrl ? "⌖ Cover" : "＋ Cover",
          title: "Choose and position a custom cover for this volume", onclick: function (ev) {
            ev.preventDefault();
            KOS.imageCrop.open({
              title: "Position volume " + v.number + " cover",
              description: "Preview the 2:3 physical-shelf frame. Nothing is saved until you save the book entry.",
              source: v.coverUrl || "", crop: v.coverCrop, aspect: 2 / 3, allowUpload: true,
              fileOptions: { maxWidth: 900, maxHeight: 1350, maxBytes: 420 * 1024, quality: 0.84 },
              onSave: function (result) {
                v.coverUrl = result.source;
                v.coverCrop = result.crop;
                renderPhys();
                KOS.ui.toast("Volume " + v.number + " cover positioned — save to keep it.");
              }
            });
          } });
        physWrap.appendChild(el("div", { class: "k-bk-volrec", "data-ui": "books.vol-record" }, [
          el("span", { class: "k-mono k-bk-volrec-n", text: "Vol " + v.number }),
          field("Condition", cond), field("Purchase date", date), field("Price", price),
          el("div", { class: "k-cluster" }, [covBtn,
            el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Remove volume " + v.number, text: "✕", onclick: function (ev) {
              ev.preventDefault();
              e.physical.volumes = e.physical.volumes.filter(function (x) { return x !== v; });
              if (!e.physical.volumes.length) e.physical = null;
              selectedVol = null;
              renderPhys();
            } })])
        ]));
      }

      /* quick add — picking up the newest release one at a time */
      var quick = el("button", { type: "button", class: "k-btn k-btn--sm k-btn--primary", text: "+ Add next · Vol " + nextVolumeNumber(e), onclick: function (ev) {
        ev.preventDefault();
        addVolumeRange(e, nextVolumeNumber(e), nextVolumeNumber(e), { purchaseDate: KOS.srs.todayISO() });
        selectedVol = null;
        renderPhys();
      } });
      head.appendChild(el("div", { class: "k-cluster k-spacer" }, [quick]));

      /* range tool — a 40-volume series is one action, not forty */
      var rFrom = numInput({ min: "1", placeholder: "from" }, String(nextVolumeNumber(e)));
      var rTo = numInput({ min: "1", placeholder: "to" });
      var rCond = select(KOS.mediadb.CONDITIONS.map(function (c) { return [c, KOS.media.CONDITION_LABEL[c]]; }), "good");
      var rDate = input("date");
      var rPrice = input("number", { min: "0", step: "0.01", placeholder: "£ each" });
      var rBtn = el("button", { type: "button", class: "k-btn k-btn--sm", text: "Add range", onclick: function (ev) {
        ev.preventDefault();
        var a = parseInt(rFrom.value, 10), b = parseInt(rTo.value, 10);
        if (isNaN(a) || isNaN(b) || b < a) { KOS.ui.toast("Give the range as from ≤ to, e.g. 1 to 15.", true); return; }
        if (b - a > 499) { KOS.ui.toast("That's over 500 volumes in one go — check the numbers.", true); return; }
        var p = parseFloat(rPrice.value);
        var n = addVolumeRange(e, a, b, {
          condition: rCond.value, purchaseDate: rDate.value || null, price: isNaN(p) ? null : p
        });
        KOS.ui.toast(n ? "Added " + n + (n === 1 ? " volume" : " volumes") + " — each is editable above." : "Those volumes are already on the shelf.");
        selectedVol = null;
        renderPhys();
      } });
      physWrap.appendChild(el("details", { class: "k-bk-range" }, [
        el("summary", { text: "Add a volume range — one purchase date, condition and price for the batch" }),
        el("div", { class: "k-bk-range-grid", "data-ui": "books.range" }, [
          field("From volume", rFrom),
          field("To volume", rTo),
          field("Condition", rCond),
          field("Purchase date", rDate),
          field("Price each", rPrice),
          el("div", { class: "k-bk-range-go", "data-ui": "books.range-submit" }, [rBtn])
        ])
      ]));
    }
    renderPhys();

    function save() {
      if (!mirror && !title.value.trim()) { KOS.ui.toast("A title is needed.", true); return; }
      if (isNew && !(e.physical && e.physical.volumes.length)) {
        KOS.ui.toast("Put at least one volume on the shelf — the physical vault is what a hand-made book is for; digital reading lives on AniList.", true);
        return;
      }
      var oldStatus = e.status;
      if (!mirror) {
        e.title = title.value.trim();
        e.author = author.value.trim();
        e.format = fmt.value;
        e.progress.total = chTot.value === "" ? null : Math.max(0, parseInt(chTot.value, 10) || 0) || null;
        e.progress.totalVolumes = vlTot.value === "" ? null : Math.max(0, parseInt(vlTot.value, 10) || 0) || null;
        e.dates.started = started.value || null;
        e.dates.finished = finished.value || null;
        e.genres = splitList(genres.value);
      }
      e.status = status.value;
      e.progress.current = Math.max(0, parseInt(chCur.value, 10) || 0);
      e.progress.volumes = vlCur.value === "" ? null : Math.max(0, parseInt(vlCur.value, 10) || 0);
      e.score = Math.max(0, Math.min(10, stars.value()));
      e.dnf = { isDnf: dnfBox.checked, reason: dnfBox.checked ? dnfReason.value.trim() : "" };
      e.tags = splitList(tags.value);
      e.mood = splitList(mood.value);
      e.shelves = splitList(shelves.value);
      e.coverUrl = coverPosition.sourceFor() || (mirror ? e.coverUrl : null);
      e.coverCrop = coverPosition.cropFor(e.coverUrl);
      e.favourite = fav.checked;
      e.notes = notes.value;
      mv.saveEntry(e, {
        isNew: isNew, pushBefore: pushBefore,
        activity: function (rec) { return oldStatus !== rec.status ? "status" : null; },
        close: function () { overlay.close(); }, onSaved: onSaved
      });
    }

    var x = e.extra || {};
    var overlay = mv.editorModal({
      isNew: isNew, label: "Books", hook: "books.dialog" + (mirror ? " anime.mirror-dialog" : ""),
      subtitle: mirror ? "mirrored from AniList — reading state pushes back; the shelf and your notes are yours"
        : e.syncSource === "import" ? "from XML import" : "physical vault entry",
      form: [
        mirror
          ? mv.editorSection("identity", "Record", "As AniList has it. Change the title or artwork there and the next pull brings it over.", [
              ro("Title", e.title, true),
              x.titleRomaji && x.titleRomaji !== e.title ? ro("Romaji", x.titleRomaji, true) : null,
              ro("Author / mangaka", e.author),
              ro("Format", KOS.media.FORMAT_LABEL[e.format] || e.format),
              ro("Chapters", e.progress.total != null ? String(e.progress.total) : null),
              ro("Volumes", e.progress.totalVolumes != null ? String(e.progress.totalVolumes) : null),
              ro("Genres", e.genres.join(", "), true),
              ro("Started", e.dates.started),
              ro("Finished", e.dates.finished)
            ])
          : mv.editorSection("identity", "Identity & artwork", "The bibliographic details used across the collection.", [
              field("Title", title, true),
              field("Author / mangaka", author),
              field("Format", fmt)
            ]),
        mv.editorSection("artwork", "Cover", mirror
          ? "AniList's artwork; only its position (or a local replacement image) is yours."
          : "The series default; individual physical volumes can override it.", [
          field(mirror ? "Cover position" : "Cover URL", el("div", { class: "k-stack k-medit-cover" }, [mirror ? null : coverU, coverPosition.node].filter(Boolean)), true)
        ]),
        mv.editorSection("progress", mirror ? "Reading state" : "Reading progress", mirror
          ? "Yours to change — pushed to AniList when you save."
          : "Reading state is separate from what you physically own.", [
          field("Status", status),
          field("Chapters read" + (mirror && e.progress.total ? " / " + e.progress.total : ""), chCur),
          mirror ? null : field("Chapters total", chTot),
          field("Volumes read" + (mirror && e.progress.totalVolumes ? " / " + e.progress.totalVolumes : ""), vlCur),
          mirror ? null : field("Volumes total", vlTot),
          field("Rating", stars),
          field("DNF — did not finish", el("span", { class: "k-check" }, [dnfBox])),
          reasonField
        ]),
        mirror
          ? mv.editorSection("dates", "Favourite", "Shrine placement — not on AniList.", [
              field("Favourite ♥", el("span", { class: "k-check" }, [fav]))
            ])
          : mv.editorSection("dates", "Dates & favourite", "Reading dates and Shrine placement.", [
              field("Started", started),
              field("Finished", finished),
              field("Favourite ♥", el("span", { class: "k-check" }, [fav]))
            ]),
        mv.editorSection("ownership", "Physical vault", "Volumes on your shelf are tracked independently from reading progress.", [
          comparePanel(),
          physWrap
        ], { raw: true }),
        mv.editorSection("taxonomy", mirror ? "Mood, shelves & tags" : "Taxonomy & shelves", mirror
          ? "Your own axes — AniList has no field for them."
          : "What it is, how it feels and where you organise it.", [
          mirror ? null : field("Genres", genres),
          field("Mood", mood),
          field("Shelves", shelves),
          field("Tags", tags)
        ]),
        mv.editorSection("lists", "Lists", "Your personal collection groupings.", [
          field("Custom lists", mv.customListChips(e), true)
        ]),
        mv.editorSection("source", "Source & sync", "Where this record came from and what may refresh.", [
          mv.sourceInfo(e, mirror ? "AniList" : e.syncSource === "import" ? "XML import" : "Local record",
            mirror ? "A 1:1 mirror of your AniList manga list: removed there means removed here on the next pull — unless volumes are on the shelf, which AniList cannot see. Status, chapters, volumes and rating push back within seconds." : null)
        ]),
        mv.editorSection("notes", "Notes", "Your private reading notes and edition context.", [
          field("Notes", notes, true)
        ])
      ],
      onSave: save,
      /* a mirrored row has no Delete: that is AniList's call */
      onDelete: mirror ? null : function () {
        mv.deleteEntry(e, "Delete “" + e.title + "” — including its physical vault records?",
          function () { overlay.close(); }, onSaved);
      },
      focus: mirror ? status : title
    });
    return overlay;
  }
  KOS.booksEditor = booksEditor;

  /* The Shrine and Matrix open entries through KOS.mediaEditor — register
     with the dispatcher (core/media.js), which also folds the legacy
     "manga"/"ln" module ids into books */
  KOS.mediaEditors.books = booksEditor;

  /* ================= reading sessions (3i) =================
     The Focus Timer's state machine wearing the Collection Matrix contract:
     kind "reading" → the finished session logs type "media" (module books),
     feeding the heatmap, rest streak and media trickle — never HP, never
     the study streak. This is only the START surface; focus.js owns the
     clock, pause/resume, reload restore, everything. */
  function openReadingSession() {
    if (KOS.focus.state() !== "idle") {
      KOS.ui.toast("A session is already on the clock — finish it first.", true);
      return;
    }
    var mv = KOS.medview;
    var overlay = mv.modalOverlay();
    var close = overlay.close;

    var last = (store.state.focus && store.state.focus.lastReading) || {};
    var mins = el("input", { type: "number", class: "k-input", "data-ui": "ui.number-input", min: "5", max: "480" });
    mins.value = String(last.workMin || 30);
    var bookSel = el("select", { class: "k-input", "data-ui": "ui.status-select" },
      [el("option", { value: "", text: "No specific book — just reading" })]);
    KOS.mediadb.query({ module: "books", status: "inProgress", sort: "updated" }, function (err, rows) {
      if (err) return;
      rows.forEach(function (r) {
        bookSel.appendChild(el("option", { value: String(r.id), text: r.title }));
      });
      if (last.bookId != null && rows.some(function (r) { return r.id === last.bookId; })) {
        bookSel.value = String(last.bookId);
      }
    });

    mv.dialogBox(overlay, "books.reading", "読書 Reading session",
      "the Focus Timer's clock, on rest rules: logs to the reading heatmap and rest streak — XP/gold trickle only, HP and the study streak untouched, pause freely",
      el("div", { class: "k-dialog-body k-fx-pair", "data-ui": "focus.link-row" }, [
        mv.calField("Minutes", mins),
        mv.calField("Reading (optional)", bookSel)
      ]),
      el("div", { class: "k-dialog-foot" }, [
        el("button", { type: "button", class: "k-btn k-spacer", text: "Cancel", onclick: function () { close(); } }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "◉ Start reading", onclick: function () {
          var m = Math.max(5, Math.min(480, parseInt(mins.value, 10) || 30));
          var book = null;
          if (bookSel.value) {
            var opt = bookSel.options[bookSel.selectedIndex];
            book = { id: parseInt(bookSel.value, 10), title: opt.textContent };
          }
          close();
          KOS.focus.start({ kind: "reading", mode: "custom", workMin: m, breakMin: 0, book: book });
        } })
      ]));
    KOS.ui.openDialog(overlay);
    mins.focus();
  }

  /* ================= external book lookup (3i) =================
     Title or ISBN in, prefilled add form out — Open Library first, Google
     Books fallback (invariant 21). Barcode scanning rides the native
     BarcodeDetector API where the browser has it; where it doesn't (or the
     camera is refused), the typed-ISBN path IS the feature. */
  function openLookup(physicalIntent, onDone) {
    var stream = null, pollTimer = null;
    var scanWrap;
    function stopScan() {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      if (stream) {
        stream.getTracks().forEach(function (t) { t.stop(); });
        stream = null;
      }
      if (scanWrap) scanWrap.hidden = true;
    }
    /* the camera stops on every close path */
    var mv = KOS.medview;
    var overlay = mv.modalOverlay(stopScan);
    var close = overlay.close;

    var titleIn = el("input", { type: "search", class: "k-input", "data-ui": "ui.quick-add msearch.input",
      placeholder: "Search by title or author…", "aria-label": "Search books by title" });
    var isbnIn = el("input", { type: "text", class: "k-input", "data-ui": "ui.quick-add books.isbn-in", inputmode: "numeric",
      placeholder: "…or ISBN (10 or 13, hyphens fine)", "aria-label": "ISBN" });
    var isbnBtn = el("button", { type: "button", class: "k-btn", text: "Look up", onclick: function () { doIsbn(); } });
    var statusNote = el("p", { class: "k-muted", "data-ui": "part.sub", role: "status" });
    var results = el("div", { class: "k-mpick" });

    /* capability detection, stated honestly either way */
    var canScan = typeof window.BarcodeDetector !== "undefined" &&
      !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    var video = el("video", { class: "k-bk-scan-video", autoplay: "", muted: "", playsinline: "" });
    scanWrap = el("div", { class: "k-bk-scan", hidden: "" }, [
      video,
      el("div", { class: "k-cluster" }, [
        el("span", { class: "k-muted", text: "Hold the back-cover barcode steady in frame" }),
        el("button", { type: "button", class: "k-btn k-btn--sm", text: "✕ Stop", onclick: function () { stopScan(); } })
      ])
    ]);
    var scanBtn = canScan
      ? el("button", { type: "button", class: "k-btn", text: "📷 Scan barcode", onclick: function () { startScan(); } })
      : null;

    function startScan() {
      var BD = window.BarcodeDetector;
      var begin = function (formats) {
        var detector;
        try { detector = new BD({ formats: formats }); }
        catch (err) { statusNote.textContent = "The barcode detector refused to start — type the ISBN instead."; return; }
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } }).then(function (s) {
          stream = s;
          video.srcObject = s;
          scanWrap.hidden = false;
          statusNote.textContent = "Scanning…";
          pollTimer = setInterval(function () {
            detector.detect(video).then(function (codes) {
              for (var i = 0; i < codes.length; i++) {
                var raw = KOS.bookapi.cleanIsbn(codes[i].rawValue);
                if (KOS.bookapi.isValidIsbn(raw)) {
                  stopScan();
                  isbnIn.value = raw;
                  statusNote.textContent = "Scanned " + raw + ".";
                  doIsbn();
                  return;
                }
              }
            }, function () { /* a frame that fails to decode is normal */ });
          }, 350);
        }, function (err) {
          statusNote.textContent = (err && err.name === "NotAllowedError")
            ? "Camera permission refused — type the ISBN instead."
            : "No usable camera — type the ISBN instead.";
        });
      };
      if (BD.getSupportedFormats) {
        BD.getSupportedFormats().then(function (fmts) {
          if (fmts && fmts.indexOf("ean_13") !== -1) begin(["ean_13"]);
          else statusNote.textContent = "This browser's barcode detector can't read EAN-13 (book) barcodes — type the ISBN instead.";
        }, function () { begin(["ean_13"]); });
      } else {
        begin(["ean_13"]);
      }
    }

    var SOURCE_LABEL = { openlibrary: "Open Library", googlebooks: "Google Books" };
    function render(list, meta) {
      results.innerHTML = "";
      if (meta && meta.note) results.appendChild(el("p", { class: "k-muted", text: meta.note }));
      if (!list.length) {
        var none = (titleIn.value.trim() || isbnIn.value.trim()) ? "No matches in either book database." : "";
        if (none) results.appendChild(el("p", { class: "k-muted", text: none }));
        return;
      }
      list.forEach(function (r) {
        var metaBits = [];
        if (r.author) metaBits.push(r.author);
        if (r.year) metaBits.push(String(r.year));
        if (r.pages) metaBits.push(r.pages + " pp");
        if (r.isbn13) metaBits.push(r.isbn13);
        results.appendChild(el("div", { class: "k-mpick-row", "data-ui": "msearch.row" }, [
          r.coverUrl
            ? el("span", { class: "k-mrow-cover" }, [el("img", { src: r.coverUrl, alt: "", loading: "lazy" })])
            : el("span", { class: "k-mrow-cover", "aria-hidden": "true", text: "本" }),
          el("span", { class: "k-mrow-main" }, [
            el("b", { class: "k-mrow-title", text: r.title }),
            el("span", { class: "k-mrow-sub", text: metaBits.join(" · ") }),
            el("span", { class: "k-chip", "data-ui": "books.src-chip", text: SOURCE_LABEL[r.source] || r.source })
          ]),
          el("button", { type: "button", class: "k-btn k-btn--sm k-btn--primary", "data-ui": "msearch.add", "data-intent": "primary", text: "+ Use", onclick: function () { useResult(r); } })
        ]));
      });
    }

    /* prefill the ordinary add form — the lookup never writes the vault
       itself, the user confirms/edits everything in the editor */
    function useResult(r) {
      var draft = {
        module: "books", title: r.title, author: r.author || "",
        coverUrl: r.coverUrl || null,
        externalIds: { isbn13: r.isbn13 || null },
        physical: physicalIntent
          ? { owned: true, volumes: [{ number: 1, condition: "good", purchaseDate: KOS.srs.todayISO() }] }
          : null
      };
      var openDraft = function () {
        close();
        booksEditor(draft, onDone);
      };
      /* soft duplicate check by exact title — advisory, never blocking */
      KOS.mediadb.query({ module: "books", search: r.title }, function (err, rows) {
        var exact = !err && rows.find(function (x) { return x.titleLower === String(r.title).toLowerCase(); });
        if (exact) {
          KOS.ui.confirm({ title: "Already in the vault", body: "“" + exact.title + "” is already tracked. Open the existing entry instead of adding a copy?", confirm: "Open existing", cancel: "Add a copy" },
            function () { close(); booksEditor(exact, onDone); },
            function () { openDraft(); });
        } else openDraft();
      });
    }

    var seq = 0;
    function handle(mySeq) {
      return function (err, list, meta) {
        if (mySeq !== seq) return;
        statusNote.textContent = err ? err.message : "";
        render(err ? [] : list, meta);
      };
    }
    function runTitle() {
      var term = titleIn.value.trim();
      if (term.length < 2) { render([], null); return; }
      var mySeq = ++seq;
      statusNote.textContent = "Searching…";
      KOS.bookapi.search(term, handle(mySeq));
    }
    function doIsbn() {
      var mySeq = ++seq;
      statusNote.textContent = "Looking up ISBN…";
      KOS.bookapi.byIsbn(isbnIn.value, handle(mySeq));
    }
    titleIn.addEventListener("input", KOS.ui.debounce(runTitle, 220));
    isbnIn.addEventListener("keydown", function (ev) { if (ev.key === "Enter") { ev.preventDefault(); doIsbn(); } });

    mv.dialogBox(overlay, "vault.dialog msearch.dialog books.lookup", "本 Find book — Open Library / Google Books",
      "search by title, or type/scan an ISBN — the match prefills the add form" + (physicalIntent ? " with volume 1 already on the shelf" : ""),
      el("div", { class: "k-dialog-body k-bk-lookup" }, [
        titleIn,
        el("div", { class: "k-cluster k-bk-isbn" }, [isbnIn, isbnBtn, scanBtn].filter(Boolean)),
        canScan ? null : el("p", { class: "k-field-hint", "data-ui": "part.sub books.scan-none", text:
          "Barcode scanning isn't available in this browser (no BarcodeDetector) — the typed ISBN does the same job." }),
        scanWrap,
        statusNote,
        results
      ].filter(Boolean)), null, "k-mwide");
    KOS.ui.openDialog(overlay);
    titleIn.focus();
  }
  /* exposed for the Matrix home / other modules to reuse */
  KOS.books.openLookup = openLookup;
  KOS.books.openReadingSession = openReadingSession;

  /* ================= cards (the shared overlay card, frame 11b) ================= */
  function gridCard(e, rerender) {
    var owned = e.physical && e.physical.volumes.length;
    return KOS.medview.card(e, rerender, {
      hook: "books.card", kanji: mod().kanji,
      chips: [formatChip(e), dnfChip(e), owned ? KOS.medview.chip("📚 " + owned + " vol" + (owned === 1 ? "" : "s") + " owned", "owned", { "data-ui": "books.owned" }) : null],
      extra: [e.author ? el("span", { class: "k-mcard-sub", "data-ui": "books.author", text: e.author }) : null],
      prog: progressText(e),
      unit: "ch", bumpTitle: "Log the next chapter",
      onBump: e.status === "inProgress" ? function () { bumpChapter(e, rerender); } : null,
      open: function () { booksEditor(e, rerender); }
    });
  }
  function listRow(e, rerender) {
    return KOS.medview.listRow(e, mod(), rerender, {
      hook: "books.card",
      subline: e.author || e.genres.slice(0, 2).join(" · "),
      prog: progressText(e),
      onBump: e.status === "inProgress" ? function () { bumpChapter(e, rerender); } : null,
      open: function () { booksEditor(e, rerender); }
    });
  }

  /* ================= the virtual bookshelf ================= */
  /* One shelf row per physically-owned series: a spine per volume. Spines
     are generated (deterministic colour + volume number + title) unless the
     volume carries a custom cover. AniList has no per-volume art, so the
     generated spine IS the default presentation, not a fallback state. */
  function shelfFor(e, rerender) {
    var colour = spineColor(e.title);
    var o = ownership(e);
    var row = el("section", { class: "k-bk-series", "data-ui": "books.series", "aria-label": e.title }, [
      el("div", { class: "k-bk-series-h" }, [
        el("b", { text: e.title }),
        el("span", { class: "k-muted", text: (e.author ? e.author + " · " : "") + o.ownedVols +
          (o.totalVols ? " of " + o.totalVols + (o.est ? " (est.)" : "") : "") + " volumes" }),
        el("button", { type: "button", class: "k-link k-spacer", text: "edit →", onclick: function () { booksEditor(e, rerender); } })
      ])
    ]);
    var shelf = el("div", { class: "k-bk-shelf", "data-ui": "books.shelf", role: "list" });
    e.physical.volumes.forEach(function (v) {
      var spine;
      var tip = e.title + " vol " + v.number + " · " + KOS.media.CONDITION_LABEL[v.condition] +
        (v.purchaseDate ? " · " + v.purchaseDate : "") + (v.price ? " · £" + v.price.toFixed(2) : "");
      if (v.coverUrl) {
        spine = el("div", { class: "k-bk-spine", "data-ui": "books.spine", role: "listitem", title: tip }, [
          KOS.imageCrop.image(v.coverUrl, { alt: e.title + " volume " + v.number, loading: "lazy" }, v.coverCrop)
        ]);
        KOS.ui.state(spine, "img", true);
      } else {
        spine = el("div", { class: "k-bk-spine", "data-ui": "books.spine", role: "listitem", title: tip }, [
          el("span", { class: "k-bk-spine-n k-mono", text: String(v.number) }),
          el("span", { class: "k-bk-spine-t", text: e.title })
        ]);
        spine.style.setProperty("--spine", colour);
      }
      if (v.condition === "damaged" || v.condition === "worn") {
        var mark = el("span", { class: "k-bk-spine-cond", "data-ui": "books.spine-cond", "aria-hidden": "true" });
        KOS.ui.state(mark, v.condition, true);
        spine.appendChild(mark);
      }
      spine.addEventListener("click", function () { booksEditor(e, rerender); });
      shelf.appendChild(spine);
    });
    row.appendChild(shelf);
    return row;
  }

  /* ================= reading heatmap ================= */
  /* Same activity log that powers the rest streak (sessions, type "media"),
     filtered to Books, drawn with the shared KOS.charts helpers. */
  function isBooksSession(s) {
    if (s.type !== "media" || !s.metrics) return false;
    var m = s.metrics.module;
    return m === "books" || m === "manga" || m === "ln";
  }
  function heatmapCard(weeks) {
    var today = KOS.srs.todayISO();
    var span = weeks * 7;
    var byDay = {};
    KOS.sessions.all().forEach(function (s) {
      if (isBooksSession(s)) byDay[s.date] = (byDay[s.date] || 0) + 1;
    });
    var days = [], total = 0;
    for (var i = span - 1; i >= 0; i--) {
      var d = KOS.srs.addDays(today, -i);
      var n = byDay[d] || 0;
      total += n;
      days.push({ date: d, value: n, hint: d + ": " + n + (n === 1 ? " reading log" : " reading logs") });
    }
    return KOS.charts.chartCard("Reading heatmap", total + " logs in " + weeks + " weeks — chapters, volumes and status changes",
      KOS.charts.heatmap(days, { color: "var(--books)" }));
  }

  /* ================= the Books view (the 11b vault template) ================= */
  KOS.views.books = function (main, arg) {
    KOS.shell.tree("none");
    var p = prefs();
    if (arg && (arg.tab === "physical" || arg.tab === "digital")) { p.tab = arg.tab; persist(p); }
    var filt = { status: null, dnf: false };
    var mv = KOS.medview;

    if (mv.unavailable(main)) return;

    /* ---- the Physical/Digital lens (3i) — navigation only, one vault,
       two readings; it rides the page header's action slot ---- */
    var LENSES = [
      ["digital", "読", "Digital", "your AniList manga list, mirrored"],
      ["physical", "蔵", "Physical Vault", "owned volumes only — the real shelf"]
    ];
    var tabBar;
    function buildLenses() {
      return KOS.ui.tabs(LENSES.map(function (t) {
        return { label: t[2], glyph: t[1], hint: t[3], active: p.tab === t[0], hook: "books.lens",
          onSelect: function () {
            if (p.tab === t[0]) return;
            p.tab = t[0];
            persist(p);
            var fresh = buildLenses();
            tabBar.replaceChildren.apply(tabBar, Array.prototype.slice.call(fresh.childNodes));
            syncLayout();
            syncPrimary();
            refresh();
          } };
      }), { variant: "card", label: "Books lens" });
    }
    tabBar = buildLenses();

    var page = mv.vaultPage(main, { kicker: "Collection · 本", title: "Books",
      sub: "What you're reading, mirrored from AniList, and what's on the shelf — one entry, both lives.",
      actions: [tabBar] });

    /* toolbar — the shared pieces come from the medview toolkit */
    var search = mv.searchInput("Search book titles");
    var fmtSel = mv.facetSelect("Filter by format");
    [["", "All formats"], ["manga", "Manga"], ["lightNovel", "Light Novels"], ["oneShot", "One-shots"]]
      .forEach(function (o) { fmtSel.appendChild(el("option", { value: o[0], text: o[1] })); });
    var genreSel = mv.facetSelect("Filter by genre");
    var moodSel = mv.facetSelect("Filter by mood");
    var shelfSel = mv.facetSelect("Filter by shelf");
    var sortSel = mv.sortSelect(p.sort, { score: "Rating" });

    /* layout is a per-lens pref: the Digital lens reads as grid/list, the
       Physical lens defaults to the bookshelf (its whole point is volume-
       level detail) with grid/list as alternatives */
    var LAYOUTS = { grid: ["▦", "Grid"], list: ["≡", "List"], shelf: ["📚", "Shelf"] };
    function layoutOrder() { return p.tab === "physical" ? ["shelf", "grid", "list"] : ["grid", "list"]; }
    function curLayout() {
      var ord = layoutOrder();
      var cur = p.tab === "physical" ? p.physLayout : p.layout;
      return ord.indexOf(cur) !== -1 ? cur : ord[0];
    }
    var layoutBtn = el("span", { class: "k-seg k-seg--quiet k-mlayout", role: "group", "aria-label": "Layout" });
    function syncLayout() {
      layoutBtn.innerHTML = "";
      layoutOrder().forEach(function (id) {
        layoutBtn.appendChild(el("button", { type: "button", class: "k-seg-item", "aria-label": LAYOUTS[id][1], title: LAYOUTS[id][1],
          "aria-pressed": String(curLayout() === id), text: LAYOUTS[id][0], onclick: function () {
            if (curLayout() === id) return;
            if (p.tab === "physical") p.physLayout = id; else p.layout = id;
            persist(p);
            syncLayout();
            refresh();
          } }));
      });
    }
    syncLayout();

    var rail = mv.filterRail("books", function () { refresh(); });
    var bar = mv.toolbar({
      label: "Books vault controls",
      search: search, sort: sortSel, layout: layoutBtn,
      filters: [
        mv.selFacet("Format", fmtSel, refresh),
        mv.selFacet("Genre", genreSel, refresh),
        mv.selFacet("Mood", moodSel, refresh),
        mv.selFacet("Shelf", shelfSel, refresh),
        mv.toggleFacet("Did not finish",
          function () { return filt.dnf; },
          function (v) { filt.dnf = v; },
          function () { refresh(); },
          "Only books you set down")
      ],
      onClear: function () { refresh(); },
      actions: [
        { heading: "Read" },
        { label: "Start a reading session", glyph: "⏱",
          hint: "The Focus Timer's clock — feeds the rest streak, never HP",
          onSelect: function () { openReadingSession(); } },
        { label: "Mangaka", glyph: "作", hint: "Every author on your shelves",
          onSelect: function () { KOS.show("mangaka"); } },
        { heading: "Add to the vault" },
        { label: "Find new titles…", glyph: "⊕", hint: "Search AniList's manga database — added to your list there, then mirrored",
          onSelect: function () { KOS.mediaSearch.open("books", refreshAll); } },
        { label: "Look up a book or ISBN…", glyph: "◫",
          hint: "Open Library, or scan the barcode — goes on the physical shelf",
          onSelect: function () { openLookup(true, refreshAll); } },
        { heading: "This vault" },
        { label: "The numbers", glyph: "◫", hint: "Composition, taste and pace",
          onSelect: function () { mv.statsModal("books", mod()); } },
        { label: "Sync & Import", glyph: "⇅", onSelect: function () { KOS.show("mediasync"); } }
      ],
      /* the primary action follows the lens: the digital half is AniList's
         (Find new creates there first), the physical half is hand-made */
      primary: mv.primaryButton("+ Add", null, function () {
        if (p.tab === "physical") booksEditor(null, refreshAll);
        else KOS.mediaSearch.open("books", refreshAll);
      })
    });
    page.setBar(bar);
    page.setRail(rail.root);

    function refreshAll() { rail.reload(); refresh(); }
    function syncPrimary() {
      var btn = bar.root.querySelector('button[data-intent~="primary"]');
      if (!btn) return;
      btn.textContent = p.tab === "physical" ? "+ Add to shelf" : "⊕ Find new";
      btn.title = p.tab === "physical" ? "A hand-made book with its volumes" : "Search AniList — the title is added to your list there, then mirrored here";
    }
    syncPrimary();

    /* countLine + holder + sentinel + the lazy batch renderer (makeItem is
       hoisted — the shelf-ranking block below defines it) */
    var area = mv.resultsArea(page.mainCol, function (e, i) { return makeItem(e, i); }, { countHost: page.controls });

    /* dropdown fills from the real index keys */
    KOS.mediadb.distinct("mood", function (err, ms) { if (!err) mv.fillSel(moodSel, ms, "All moods"); });
    KOS.mediadb.distinct("shelves", function (err, ss) { if (!err) mv.fillSel(shelfSel, ss, "All shelves"); });
    KOS.mediadb.query({ module: "books" }, function (err, rows) {
      if (err) return;
      mv.fillFacetSel(genreSel, mv.tallyFacet(rows, "genres"), "All genres");
    });

    /* ---- shelf ranking (3i): drag / ▲▼ within a selected shelf ---- */
    var reorderMode = false, activeShelf = null, dragIdx = null;
    function moveRank(from, to) {
      var results = area.results();   // the live array behind the lazy renderer
      if (to < 0 || to >= results.length || from === to) return;
      var moved = results.splice(from, 1)[0];
      results.splice(to, 0, moved);
      KOS.books.setShelfOrder(activeShelf, results.map(function (r) { return r.id; }), function (err) {
        if (err) KOS.ui.toast("Could not save the order: " + err.message, true);
      });
      area.repaint();
    }
    function rankRow(e, idx) {
      var wrap = el("div", { class: "k-bk-rank", "data-ui": "books.rank-row", draggable: "true", "data-id": String(e.id) }, [
        el("span", { class: "k-mono k-muted", "aria-hidden": "true", text: String(idx + 1) }),
        el("span", { class: "k-bk-grip", title: "Drag to reorder", "aria-hidden": "true", text: "⠿" }),
        listRow(e, refresh),
        el("span", { class: "k-cluster" }, [
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Move “" + e.title + "” up", text: "▲",
            onclick: function (ev) { ev.stopPropagation(); moveRank(idx, idx - 1); } }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Move “" + e.title + "” down", text: "▼",
            onclick: function (ev) { ev.stopPropagation(); moveRank(idx, idx + 1); } })
        ])
      ]);
      wrap.addEventListener("dragstart", function (ev) {
        dragIdx = idx;
        KOS.ui.state(wrap, "dragging", true);
        if (ev.dataTransfer) {
          ev.dataTransfer.effectAllowed = "move";
          try { ev.dataTransfer.setData("text/plain", String(e.id)); } catch (_) { /* older engines */ }
        }
      });
      wrap.addEventListener("dragend", function () { KOS.ui.state(wrap, "dragging", false); dragIdx = null; });
      wrap.addEventListener("dragover", function (ev) { ev.preventDefault(); KOS.ui.state(wrap, "dragover", true); });
      wrap.addEventListener("dragleave", function () { KOS.ui.state(wrap, "dragover", false); });
      wrap.addEventListener("drop", function (ev) {
        ev.preventDefault();
        KOS.ui.state(wrap, "dragover", false);
        if (dragIdx != null && dragIdx !== idx) moveRank(dragIdx, idx);
        dragIdx = null;
      });
      return wrap;
    }

    /* what the lazy renderer builds per row: rank rows only in reorder mode */
    function makeItem(e, i) {
      if (curLayout() === "list") return reorderMode ? rankRow(e, i) : listRow(e, refreshAll);
      return gridCard(e, refreshAll);
    }

    function refresh() {
      bar.sync();
      var lay = curLayout();
      var physical = p.tab === "physical";
      var opts = {
        module: "books", status: rail.status() || undefined,
        customList: rail.customList() || undefined,
        format: fmtSel.value || undefined,
        genre: genreSel.value || undefined,
        mood: moodSel.value || undefined,
        shelf: shelfSel.value || undefined,
        dnf: filt.dnf || undefined,
        search: search.value.trim() || undefined, sort: sortSel.value
      };
      /* the Physical lens IS a filter on the same vault: owned volumes only.
         The Digital lens is the AniList mirror: AniList-sourced rows only
         (invariant 91) */
      if (physical) opts.owned = true;
      else opts.source = "anilist";
      /* claim the render generation BEFORE the query: switching lens mid-
         flight must not let the older query paint the newer lens */
      var token = area.begin();
      KOS.mediadb.query(opts, function (err, rows) {
        if (!area.current(token)) return;              // a newer lens/filter won
        if (err) {
          area.clear();
          area.countLine.textContent = "Query failed: " + err.message;
          return;
        }
        activeShelf = shelfSel.value || null;
        /* ranking edits only make sense on the WHOLE shelf in list layout —
           any extra filter would silently save a partial order */
        reorderMode = !!activeShelf && lay === "list" && !rail.status() && !rail.customList() && !filt.dnf &&
          !fmtSel.value && !genreSel.value && !moodSel.value && !search.value.trim();
        sortSel.disabled = !!activeShelf;
        sortSel.title = activeShelf ? "A selected shelf keeps its own ranked order" : "";
        function paint(rowsOrdered) {
          /* shelf skin (3j): a purchased Gold Shop cosmetic sets one extra
             state on the shelf layout — the default look is its absence */
          var skin = lay === "shelf" && KOS.governor.shelfSkin && KOS.governor.shelfSkin();
          area.layout(lay);
          if (skin) area.holder.setAttribute("data-skin", skin); else area.holder.removeAttribute("data-skin");
          area.holder.setAttribute("data-ui", lay === "shelf" ? "books.shelves" : "vault.grid");
          var filtered = rail.status() || rail.customList() || filt.dnf || fmtSel.value || genreSel.value || moodSel.value || shelfSel.value || search.value;
          area.countLine.textContent = rowsOrdered.length + " series" +
            (physical ? " with owned volumes" : "") + (filtered ? " (filtered)" : "") +
            (activeShelf ? (reorderMode ? " · drag or ▲▼ to rank this shelf" : " · List layout (no other filters) unlocks ranking") : "");
          if (!rowsOrdered.length) {
            area.clear();
            area.holder.appendChild(mv.emptyState(
              filtered
                ? "Nothing matches this filter."
                : physical
                  ? "No physical volumes recorded yet — add a book to the shelf (the range tool takes a whole box set in one go), or scan a barcode with ◫ Find book."
                  : "The digital shelf mirrors your AniList manga list. Connect AniList and the whole list lands in one sync.",
              physical ? [
                el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "◫ Find book / ISBN", onclick: function () { openLookup(true, refreshAll); } }),
                el("button", { type: "button", class: "k-btn", text: "+ Add to shelf", onclick: function () { booksEditor(null, refreshAll); } })
              ] : [
                el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }),
                el("button", { type: "button", class: "k-btn", text: "⊕ Find new", onclick: function () { KOS.mediaSearch.open("books", refreshAll); } })
              ]));
            return;
          }
          if (lay === "shelf") {
            /* through the area, not around it — the shelf paints every row at
               once but must still reset the lazy observer */
            area.paintAll(rowsOrdered, function (e) { return shelfFor(e, refreshAll); });
            return;
          }
          area.start(rowsOrdered);
        }
        if (activeShelf) {
          KOS.books.getShelfOrders(function (e2, orders) {
            paint(KOS.books.applyShelfOrder(rows, (orders || {})[activeShelf]));
          });
        } else {
          paint(rows);
        }
      });
    }

    /* the facet selects are wired by mv.selFacet inside the toolbar */
    search.addEventListener("input", KOS.ui.debounce(refresh, 220));
    sortSel.addEventListener("change", function () { p.sort = sortSel.value; persist(p); refresh(); });

    function mountHero() { mv.heroCard(page.heroHolder, "books", mod(), function () { refreshAll(); mountHero(); }); }
    mountHero();
    refresh();
  };

  /* ================= Mangaka (Category 7 Phase D full overhaul) =================
     NAME-BASED grouping, deliberately: entries group on the author string,
     whether it arrived from AniList staff data or was typed by hand. Two
     spellings of the same person are two groups — accepted limitation,
     not entity resolution.

     SCALE, the original sin (audit MNG-1). This page used to build every
     author and every work in one synchronous pass: ~882 author cards,
     1,107 <img> elements, 12,833 DOM nodes and a 142,062px scroll height,
     against the vault rule that no view renders everything at once
     (invariant #8). Phase A put it on the shared lazy area, one AUTHOR per
     lazy row, which fixed the page height but not the page: a prolific
     author still printed all 28 of their works inline, so sixty lazy rows
     were still hundreds of covers, and the only ways through 882 names
     were a text search and a letter.

     What this rewrite adds, on top of the lazy area:

       · a BOUNDED author card — the eight most relevant works, with the
         rest one click away, so one row costs one row whoever the author
         is (an author with 28 works was a 900px slab);
       · real FILTERING (audit MNG-2): format, status, physically-owned,
         and a "prolific only" threshold that is the actual question this
         page answers — who do I collect?
       · sort by what the page is about: name, works, volumes owned,
         chapters read;
       · sticky LETTER DIVIDERS in the flow, so a long scroll always says
         where it is, which a jump rail alone cannot do;
       · the shared toolbar (search + sort + Filters ▾ + ⋯), so this page
         is not a fifth arrangement of the same controls.

     Everything the filters touch also recomputes the author's own figures,
     so "12 works · 40 vols owned" always describes the works you can see
     rather than the ones the filter removed.                             */
  var MK_UNATTRIBUTED = "— unattributed —";
  var MK_SHOWN = 8;             // works printed before "show all"
  function mkVols(list) {
    return list.reduce(function (n, e) { return n + (e.physical ? e.physical.volumes.length : 0); }, 0);
  }
  function mkChapters(list) {
    return list.reduce(function (n, e) { return n + (e.progress.current || 0); }, 0);
  }
  /* the jump letter for an author name: A–Z, "#" for everything else */
  function mkLetter(name) {
    if (name === MK_UNATTRIBUTED) return "#";
    var c = String(name).trim().charAt(0).toUpperCase();
    return c >= "A" && c <= "Z" ? c : "#";
  }
  KOS.views.mangaka = function (main) {
    KOS.shell.tree("none");
    var mv = KOS.medview;

    main.appendChild(KOS.ui.pageHeader({
      kicker: "Collection · 作",
      title: "Mangaka",
      sub: "Every author on your shelves — who you actually collect, and what of theirs you have."
    }));

    if (mv.unavailable(main)) return;

    /* ---- state ---- */
    var filt = { format: "", status: "", owned: false, min: "" };
    var sortBy = "name";
    var activeLetter = "";
    var groups = {}, allNames = [], totalSeries = 0, shown = [];
    var expanded = {};            // author name -> works fully printed

    /* ---- controls, through the shared toolbar ---- */
    var search = mv.searchInput("Search authors");
    var sortSel = el("select", { class: "k-pill-select", "data-ui": "ui.status-select vault.sort", "aria-label": "Sort authors" }, [
      ["name", "Sort: A–Z"], ["works", "Sort: most works"], ["volumes", "Sort: most volumes owned"],
      ["chapters", "Sort: most chapters read"]
    ].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    sortSel.addEventListener("change", function () { sortBy = sortSel.value; paint(); });

    function facet(label, options) {
      var s = mv.facetSelect(label);
      options.forEach(function (o) { s.appendChild(el("option", { value: o[0], text: o[1] })); });
      return s;
    }
    var fmtSel = facet("Filter by format", [["", "All formats"], ["manga", "Manga"], ["lightNovel", "Light novels"], ["oneShot", "One-shots"]]);
    var stSel = facet("Filter by reading status", [["", "Any status"]].concat(mv.STATUSES.map(function (s) { return [s, KOS.media.STATUS_LABEL[s]]; })));
    var minSel = facet("Minimum works by this author", [
      ["", "Any number of works"], ["2", "2 or more works"], ["3", "3 or more works"],
      ["5", "5 or more works"], ["10", "10 or more works"]
    ]);

    var facets = [
      mv.selFacet("Format", fmtSel, function () { filt.format = fmtSel.value; paint(); }),
      mv.selFacet("Reading status", stSel, function () { filt.status = stSel.value; paint(); }),
      mv.selFacet("Prolific only", minSel, function () { filt.min = minSel.value; paint(); }),
      mv.toggleFacet("The physical shelf",
        function () { return filt.owned; },
        function (v) { filt.owned = v; },
        function () { paint(); },
        "Only authors you own volumes of")
    ];
    /* one clear path, whether it is pressed inside the Filters panel or
       from the empty state — the facet controls own their own reset */
    function clearFacets() {
      facets.forEach(function (f) { if (f.clear) f.clear(); });
      filt = { format: "", status: "", owned: false, min: "" };
    }

    var bar = mv.toolbar({
      label: "Mangaka controls",
      search: search,
      sort: sortSel,
      filters: facets,
      onClear: function () { filt = { format: "", status: "", owned: false, min: "" }; paint(); },
      actions: [
        { heading: "Go to" },
        { label: "Books vault", glyph: "本", hint: "The series list this page is built from",
          onSelect: function () { KOS.show("books"); } },
        { label: "The numbers", glyph: "◫", hint: "Books, in charts",
          onSelect: function () { mv.statsModal("books", KOS.media.module("books")); } },
        { sep: true },
        { label: "Sync & Import", glyph: "⇅", onSelect: function () { KOS.show("mediasync"); } }
      ]
    });
    mv.addHook(bar.root, "mangaka.toolbar");
    var controls = el("div", { class: "k-mcontrols" }, [bar.root]);
    main.appendChild(controls);

    /* the jump rail can only mean something in name order, so it hides
       itself under any other ranking rather than lying about position */
    var jump = el("div", { class: "k-mk-jump", role: "group", "aria-label": "Jump to letter" });
    main.appendChild(jump);

    /* one lazy row = one author card (or a letter divider before it) */
    var area = mv.resultsArea(main, function (name, i) {
      var card = authorCard(name);
      if (sortBy !== "name") return card;
      var letter = mkLetter(name);
      if (i > 0 && mkLetter(shown[i - 1]) === letter) return card;
      var frag = document.createDocumentFragment();
      frag.appendChild(el("div", { class: "k-mk-letter", "data-ui": "mangaka.letter", "aria-hidden": "true" }, [
        el("span", { text: letter })
      ]));
      frag.appendChild(card);
      return frag;
    }, { countHost: controls });
    area.layout("wall");

    /* ---- the works that survive the current filters, for one author ---- */
    function worksOf(name) {
      return (groups[name] || []).filter(function (e) {
        if (filt.format && e.format !== filt.format) return false;
        if (filt.status && e.status !== filt.status) return false;
        if (filt.owned && !(e.physical && e.physical.volumes.length)) return false;
        return true;
      });
    }

    function workTile(e) {
      var o = ownership(e);
      function open() { booksEditor(e, function () { KOS.show("mangaka", undefined, { _nav: true }); }); }
      /* Phase F: a leaf tile is a real button (Enter AND Space, one
         accessible name, no invented role) */
      var ph = el("span", { class: "k-mk-cover", "data-ui": "vault.cover-placeholder", "aria-hidden": "true", text: "本" });
      ph.style.setProperty("--spine", spineColor(e.title));
      return el("button", { type: "button", class: "k-mk-work", "data-ui": "mangaka.work", title: e.title,
        "aria-label": e.title, onclick: open }, [
        e.coverUrl
          ? el("span", { class: "k-mk-cover" }, [KOS.imageCrop.image(e.coverUrl,
              { alt: "", loading: "lazy", decoding: "async" }, e.coverCrop)])
          : ph,
        el("span", { class: "k-mk-work-body" }, [
          el("span", { class: "k-mk-work-t", text: e.title }),
          el("span", { class: "k-mrow-sub", text: [
            KOS.media.STATUS_LABEL[e.status],
            o.ownedVols ? o.ownedVols + " vols" : null,
            e.score ? "★ " + starText(e.score) : null
          ].filter(Boolean).join(" · ") })
        ])
      ]);
    }

    function authorCard(name) {
      var works = worksOf(name);
      var owned = mkVols(works);
      var chapters = mkChapters(works);
      var spent = works.reduce(function (n, e) {
        return n + (e.physical ? e.physical.volumes.reduce(function (s, v) { return s + (v.price || 0); }, 0) : 0);
      }, 0);
      var scored = works.filter(function (e) { return e.score; });
      var avg = scored.length ? scored.reduce(function (s, e) { return s + e.score; }, 0) / scored.length : 0;
      var open = !!expanded[name];
      var visible = open ? works : works.slice(0, MK_SHOWN);

      /* the meta line prints only figures that carry something (invariant 77) */
      var meta = [
        works.length + (works.length === 1 ? " work" : " works"),
        owned ? owned + (owned === 1 ? " volume owned" : " volumes owned") : null,
        chapters ? chapters + " ch read" : null,
        spent ? "£" + spent.toFixed(0) + " spent" : null,
        avg ? "★ " + starText(Math.round(avg)) : null
      ].filter(Boolean).join(" · ");

      var mark = el("span", { class: "k-mk-mark", "aria-hidden": "true",
        text: name === MK_UNATTRIBUTED ? "?" : name.slice(0, 1) });
      mark.style.setProperty("--spine", spineColor(name));
      var wall = el("div", { class: "k-mk-works" }, visible.map(workTile));
      var card = el("section", { class: "k-card k-mk-card", "data-ui": "mangaka.card", "data-letter": mkLetter(name), "aria-label": name }, [
        el("div", { class: "k-mk-h" }, [
          mark,
          el("div", { class: "k-mk-h-txt", "data-ui": "mangaka.h-txt" }, [
            el("b", { class: "k-mk-name", "data-ui": "mangaka.name", text: name }),
            el("span", { class: "k-mrow-sub", "data-ui": "part.sub mangaka.meta", text: meta })
          ])
        ]),
        wall
      ]);
      if (works.length > MK_SHOWN) {
        var more = el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "mangaka.more",
          text: open ? "Show fewer" : "Show all " + works.length + " works",
          "aria-expanded": String(open),
          onclick: function () {
            expanded[name] = !expanded[name];
            var nowOpen = !!expanded[name];
            wall.replaceChildren.apply(wall,
              (nowOpen ? works : works.slice(0, MK_SHOWN)).map(workTile));
            more.textContent = nowOpen ? "Show fewer" : "Show all " + works.length + " works";
            more.setAttribute("aria-expanded", String(nowOpen));
          } });
        card.appendChild(more);
      }
      return card;
    }

    /* The rail FILTERS to a letter rather than scrolling to it, which keeps
       the DOM bounded (invariant 8) and still reaches any author in one
       tap. Tapping the active letter clears it. */
    function jumpTo(letter) {
      activeLetter = activeLetter === letter ? "" : letter;
      var scroller = document.getElementById("stage");
      if (scroller) scroller.scrollTop = 0;
      paint();
    }

    function activeFilters() {
      return !!(filt.format || filt.status || filt.owned || filt.min);
    }

    function paint() {
      bar.sync();
      var q = search.value.trim().toLowerCase();
      var byName = sortBy === "name";
      if (!byName) activeLetter = "";          // a ranked list has no alphabet

      var minWorks = parseInt(filt.min, 10) || 0;
      var names = allNames.filter(function (n) {
        if (q && n.toLowerCase().indexOf(q) === -1) return false;
        if (activeLetter && mkLetter(n) !== activeLetter) return false;
        var w = worksOf(n);
        if (!w.length) return false;           // every work filtered away
        if (minWorks && w.length < minWorks) return false;
        return true;
      });
      names.sort(function (a, b) {
        /* the unattributed bucket sinks to the bottom of every ordering */
        if (a === MK_UNATTRIBUTED) return 1;
        if (b === MK_UNATTRIBUTED) return -1;
        if (byName) return a.localeCompare(b);
        if (sortBy === "works") return worksOf(b).length - worksOf(a).length || a.localeCompare(b);
        if (sortBy === "chapters") return mkChapters(worksOf(b)) - mkChapters(worksOf(a)) || a.localeCompare(b);
        return mkVols(worksOf(b)) - mkVols(worksOf(a)) || a.localeCompare(b);
      });

      /* the alphabet reflects the SEARCH and the filters, not the letter
         already chosen — otherwise picking one letter would grey out
         every other one */
      var letters = {};
      allNames.forEach(function (n) {
        if (q && n.toLowerCase().indexOf(q) === -1) return;
        var w = worksOf(n);
        if (!w.length || (minWorks && w.length < minWorks)) return;
        letters[mkLetter(n)] = true;
      });
      jump.hidden = !byName;
      jump.innerHTML = "";
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("").forEach(function (L) {
        var key = el("button", { type: "button", class: "k-mk-key", "data-ui": "mangaka.jump", text: L,
          "aria-pressed": String(activeLetter === L),
          "aria-label": L === "#" ? "Names outside A to Z" : "Authors starting with " + L,
          onclick: function () { jumpTo(L); } });
        if (activeLetter === L) KOS.ui.state(key, "active", true);
        key.disabled = !letters[L];
        jump.appendChild(key);
      });

      var seriesShown = names.reduce(function (n, x) { return n + worksOf(x).length; }, 0);
      var filtered = !!(q || activeLetter || activeFilters());
      area.countLine.textContent = names.length + (names.length === 1 ? " author" : " authors") +
        " · " + seriesShown + (seriesShown === 1 ? " series" : " series") +
        (filtered ? " of " + totalSeries + " (filtered" + (activeLetter ? " · " + activeLetter : "") + ")" : "");

      shown = names;
      if (!names.length) {
        area.clear();
        area.holder.appendChild(mv.emptyState(
          activeFilters()
            ? "No author has a work matching these filters."
            : "No author matches that search.",
          filtered ? [el("button", { type: "button", class: "k-btn", text: "Clear everything", onclick: function () {
            search.value = "";
            activeLetter = "";
            clearFacets();
            paint();
          } })] : []));
        return;
      }
      area.start(names);
    }

    KOS.mediadb.query({ module: "books", sort: "title" }, function (err, rows) {
      if (err) { main.appendChild(KOS.ui.emptyState({ mark: "作", body: "Could not read the vault: " + err.message })); return; }
      if (!rows.length) {
        area.clear();
        area.countLine.textContent = "";
        jump.hidden = true;
        bar.root.hidden = true;
        area.holder.appendChild(mv.emptyState(
          "No books tracked yet — the author pages build themselves from the vault.",
          [el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "本 Open the Books vault", onclick: function () { KOS.show("books"); } })]));
        return;
      }
      totalSeries = rows.length;
      groups = {};
      rows.forEach(function (e) {
        var a = (e.author || "").trim() || MK_UNATTRIBUTED;
        (groups[a] = groups[a] || []).push(e);
      });
      allNames = Object.keys(groups);
      paint();
    });

    search.addEventListener("input", KOS.ui.debounce(paint, 220));
  };
})();
