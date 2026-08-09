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

  function prefs() {
    var m = store.state.media = store.state.media || {};
    m.books = m.books || { layout: "grid", sort: "updated" };
    /* Build 3i — the Physical/Digital tab split is NAVIGATION ONLY: one
       vault, two lenses. tab + a separate layout per lens are view prefs.
       Migration: the shelf layout now lives on the Physical tab — a saved
       pre-3i "shelf" pref lands its owner there, spines intact. */
    if (m.books.layout === "shelf") {
      m.books.tab = "physical";
      m.books.physLayout = "shelf";
      m.books.layout = "grid";
    }
    if (m.books.tab !== "physical" && m.books.tab !== "digital") m.books.tab = "digital";
    if (m.books.physLayout !== "shelf" && m.books.physLayout !== "grid" && m.books.physLayout !== "list") {
      m.books.physLayout = "shelf";
    }
    return m.books;
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
    var readPct = null;
    if (e.progress.total) readPct = Math.min(100, Math.round(100 * (e.progress.current || 0) / e.progress.total));
    else if (tv.n && e.progress.volumes != null) readPct = Math.min(100, Math.round(100 * e.progress.volumes / tv.n));
    return { ownedVols: ownedVols, totalVols: tv.n, est: tv.est, ownedPct: ownedPct, readPct: readPct };
  }

  /* Deterministic spine colour: same series → same colour every session.
     A curated dark-jewel palette (not random hues) so the shelf sits inside
     the crimson/gold theme instead of fighting it. */
  var SPINES = ["#8a2f3d", "#a83a4a", "#9a7b2f", "#2f6e5a", "#31548f",
                "#5d3a8a", "#7a4a2f", "#2f4858", "#6e2f5d", "#3d3d70"];
  function spineColor(title) {
    var h = 5381;
    String(title).split("").forEach(function (c) { h = ((h << 5) + h + c.charCodeAt(0)) | 0; });
    return SPINES[Math.abs(h) % SPINES.length];
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
    var wrap = el("div", { class: "bk-stars", role: "slider", tabindex: "0",
      "aria-label": "Rating out of 5, half-star steps",
      "aria-valuemin": "0", "aria-valuemax": "5" });
    var out = el("span", { class: "bk-stars-val" });
    function paint() {
      wrap.querySelectorAll(".bk-star").forEach(function (st, i) {
        var lit = val - i * 2;   // 2 half-units per star
        st.className = "bk-star" + (lit >= 2 ? " full" : lit === 1 ? " half" : "");
      });
      out.textContent = val ? (val / 2).toFixed(1) + " / 5" : "unrated";
      wrap.setAttribute("aria-valuenow", String(val / 2));
      onChange && onChange(val);
    }
    for (var i = 0; i < 5; i++) {
      (function (idx) {
        var st = el("span", { class: "bk-star", text: "★" });
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
    return e.format ? el("span", { class: "med-chip bk-fmt", text: KOS.media.FORMAT_LABEL[e.format] || e.format }) : null;
  }
  function dnfChip(e) {
    return (e.dnf && e.dnf.isDnf)
      ? el("span", { class: "med-chip bk-dnf", title: e.dnf.reason || "Did not finish", text: "DNF" })
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
  function cover(e) { return KOS.medview.cover(e, mod().kanji); }

  /* the owned-vs-read payoff bar: gold = volumes on the shelf, crimson =
     chapters actually read */
  function dualBar(e) {
    var o = ownership(e);
    if (o.ownedPct == null && o.readPct == null) return null;
    var wrap = el("div", { class: "bk-dual", title:
      (o.ownedPct != null ? "Owned: " + o.ownedVols + "/" + o.totalVols + (o.est ? " vols (estimated from chapters)" : " vols") : "Nothing owned") +
      " · " + (o.readPct != null ? "Read: " + o.readPct + "%" : "read progress unknown") });
    wrap.appendChild(el("span", { class: "bk-dual-own", style: "width:" + (o.ownedPct || 0) + "%" }));
    wrap.appendChild(el("span", { class: "bk-dual-read", style: "width:" + (o.readPct || 0) + "%" }));
    return wrap;
  }

  /* +1 chapter — the everyday logging action, mirroring anime's +1 ep
     (shared bump, mode "progress") */
  function bumpChapter(e, done) { KOS.medview.bumpUnit(e, "progress", done); }

  /* ================= the editor modal (shared medview shell) ================= */
  function booksEditor(entry, onSaved) {
    /* a lookup-prefilled draft (3i) arrives as an entry with no id — still
       a NEW entry: shows "Add", logs "added" on save */
    var mv = KOS.medview;
    var isNew = !entry || entry.id == null;
    var e = mv.editDraft(entry, "books");
    var pushBefore = KOS.mediapush.snapshot(e);
    var field = mv.field, splitList = mv.splitList;

    /* --- identity + reading state --- */
    var title = el("input", { type: "text", class: "todo-in", value: e.title === "Untitled" && isNew ? "" : e.title, placeholder: "Series title" });
    var author = el("input", { type: "text", class: "todo-in", value: e.author, placeholder: "Author / mangaka (filled by sync when linked)" });
    var fmt = el("select", { class: "status-sel" }, [["manga", "Manga"], ["lightNovel", "Light Novel"], ["oneShot", "One-shot"]].map(function (o) {
      return el("option", { value: o[0], text: o[1] });
    }));
    fmt.value = e.format || "manga";
    var status = el("select", { class: "status-sel" }, STATUSES.map(function (s) {
      return el("option", { value: s, text: KOS.media.STATUS_LABEL[s] });
    }));
    status.value = e.status;
    var chCur = el("input", { type: "number", class: "todo-in med-num", min: "0", value: String(e.progress.current || 0) });
    var chTot = el("input", { type: "number", class: "todo-in med-num", min: "0", placeholder: "?", value: e.progress.total != null ? String(e.progress.total) : "" });
    var vlCur = el("input", { type: "number", class: "todo-in med-num", min: "0", placeholder: "—", value: e.progress.volumes != null ? String(e.progress.volumes) : "" });
    var vlTot = el("input", { type: "number", class: "todo-in med-num", min: "0", placeholder: "?", value: e.progress.totalVolumes != null ? String(e.progress.totalVolumes) : "" });
    var stars = starWidget(e.score ? Math.round(e.score) : 0, null);
    var started = el("input", { type: "date", class: "todo-in", value: e.dates.started || "" });
    var finished = el("input", { type: "date", class: "todo-in", value: e.dates.finished || "" });

    /* --- DNF (orthogonal to status; ticking it defaults status → dropped) --- */
    var dnfBox = el("input", { type: "checkbox" });
    dnfBox.checked = e.dnf.isDnf;
    var dnfReason = el("input", { type: "text", class: "todo-in", value: e.dnf.reason, placeholder: "why it lost you (optional)" });
    dnfReason.style.display = e.dnf.isDnf ? "" : "none";
    dnfBox.addEventListener("change", function () {
      dnfReason.style.display = dnfBox.checked ? "" : "none";
      if (dnfBox.checked && status.value !== "completed") status.value = "dropped";
    });

    /* --- taxonomy --- */
    var genres = el("input", { type: "text", class: "todo-in", value: e.genres.join(", "), placeholder: "Drama, Fantasy…" });
    var tags = el("input", { type: "text", class: "todo-in", value: e.tags.join(", "), placeholder: "reread, gift…" });
    var mood = el("input", { type: "text", class: "todo-in", value: e.mood.join(", "), placeholder: "dark, hopeful, tense… (its own axis, not genre)" });
    var shelves = el("input", { type: "text", class: "todo-in", value: e.shelves.join(", "), placeholder: "top-shelf, to-lend… (your own shelf names)" });
    var coverU = el("input", { type: "url", class: "todo-in", value: e.coverUrl || "", placeholder: "https://… (filled by sync/enrichment)" });
    var coverPosition = mv.coverPositionControl(e, coverU);
    var fav = el("input", { type: "checkbox" });
    fav.checked = e.favourite;
    var notes = el("textarea", { class: "note-area", rows: 3, placeholder: "Notes…" });
    notes.value = e.notes || "";

    /* --- the owned% vs read% comparison (3b's payoff, kept front-and-centre
       through the 3i tab split: the entry detail carries it no matter which
       tab — Physical or Digital — it was opened from) --- */
    function comparePanel() {
      var o = ownership(e);
      var wrap = el("div", { class: "bk-compare" });
      wrap.appendChild(el("div", { class: "bk-compare-h" }, [
        el("b", { text: "Owned vs read" }),
        el("span", { class: "sub", text: "the two halves of this one entry — the shelf and the eyes" })
      ]));
      if (o.ownedPct == null && o.readPct == null) {
        wrap.appendChild(el("p", { class: "sub bk-compare-none", text:
          "Nothing to compare yet — add owned volumes below and/or reading progress above, and the bars appear." }));
        return wrap;
      }
      function row(label, pct, detail, cls) {
        return el("div", { class: "bk-compare-row" }, [
          el("span", { class: "bk-compare-k", text: label }),
          el("div", { class: "bk-compare-track" }, [
            el("span", { class: "bk-compare-fill " + cls, style: "width:" + (pct || 0) + "%" })
          ]),
          el("span", { class: "bk-compare-v", text: detail })
        ]);
      }
      wrap.appendChild(row("Owned", o.ownedPct,
        o.ownedPct != null
          ? o.ownedVols + "/" + o.totalVols + " vols" + (o.est ? " (est.)" : "") + " · " + o.ownedPct + "%"
          : "no volumes recorded", "own"));
      wrap.appendChild(row("Read", o.readPct,
        o.readPct != null ? o.readPct + "%" : "progress unknown", "read"));
      return wrap;
    }

    /* --- physical vault --- */
    var physWrap = el("div", { class: "bk-phys" });
    function renderPhys() {
      physWrap.innerHTML = "";
      var vols = e.physical ? e.physical.volumes : [];
      var spent = vols.reduce(function (a, v) { return a + (v.price || 0); }, 0);
      physWrap.appendChild(el("div", { class: "bk-phys-h" }, [
        el("b", { text: "Physical vault" }),
        el("span", { class: "sub", text: vols.length
          ? vols.length + (vols.length === 1 ? " volume owned" : " volumes owned") + (spent ? " · £" + spent.toFixed(2) : "")
          : "nothing owned yet — this half is optional" })
      ]));

      if (vols.length) {
        var list = el("div", { class: "bk-vol-list" });
        vols.forEach(function (v) {
          var cond = el("select", { class: "status-sel bk-vol-cond" }, KOS.mediadb.CONDITIONS.map(function (c) {
            return el("option", { value: c, text: KOS.media.CONDITION_LABEL[c] });
          }));
          cond.value = v.condition;
          cond.addEventListener("change", function () { v.condition = cond.value; });
          var date = el("input", { type: "date", class: "todo-in bk-vol-date", value: v.purchaseDate || "" });
          date.addEventListener("change", function () { v.purchaseDate = date.value || null; });
          var price = el("input", { type: "number", class: "todo-in bk-vol-price", min: "0", step: "0.01", placeholder: "£", value: v.price != null ? String(v.price) : "" });
          price.addEventListener("change", function () {
            var p = parseFloat(price.value);
            v.price = isNaN(p) ? null : p;
          });
          var covBtn = el("button", { class: "mini-btn", text: v.coverUrl ? "⌖ cover" : "＋ cover",
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
          list.appendChild(el("div", { class: "bk-vol-row" }, [
            el("span", { class: "bk-vol-n", style: "--spine:" + spineColor(title.value || e.title), text: "Vol " + v.number }),
            cond, date, price, covBtn,
            el("button", { class: "mini-btn bk-vol-del", "aria-label": "Remove volume " + v.number, text: "✕", onclick: function (ev) {
              ev.preventDefault();
              e.physical.volumes = e.physical.volumes.filter(function (x) { return x !== v; });
              if (!e.physical.volumes.length) e.physical = null;
              renderPhys();
            } })
          ]));
        });
        physWrap.appendChild(list);
      }

      /* quick add — picking up the newest release one at a time */
      var quick = el("button", { class: "btn", text: "+ Add next · Vol " + nextVolumeNumber(e), onclick: function (ev) {
        ev.preventDefault();
        addVolumeRange(e, nextVolumeNumber(e), nextVolumeNumber(e), { purchaseDate: KOS.srs.todayISO() });
        renderPhys();
      } });

      /* range tool — a 40-volume series is one action, not forty */
      var rFrom = el("input", { type: "number", class: "todo-in med-num", min: "1", placeholder: "from", value: String(nextVolumeNumber(e)) });
      var rTo = el("input", { type: "number", class: "todo-in med-num", min: "1", placeholder: "to" });
      var rCond = el("select", { class: "status-sel" }, KOS.mediadb.CONDITIONS.map(function (c) {
        return el("option", { value: c, text: KOS.media.CONDITION_LABEL[c] });
      }));
      rCond.value = "good";
      var rDate = el("input", { type: "date", class: "todo-in bk-vol-date" });
      var rPrice = el("input", { type: "number", class: "todo-in bk-vol-price", min: "0", step: "0.01", placeholder: "£ each" });
      var rBtn = el("button", { class: "btn primary", text: "Add range", onclick: function (ev) {
        ev.preventDefault();
        var a = parseInt(rFrom.value, 10), b = parseInt(rTo.value, 10);
        if (isNaN(a) || isNaN(b) || b < a) { KOS.ui.toast("Give the range as from ≤ to, e.g. 1 to 15.", true); return; }
        if (b - a > 499) { KOS.ui.toast("That's over 500 volumes in one go — check the numbers.", true); return; }
        var p = parseFloat(rPrice.value);
        var n = addVolumeRange(e, a, b, {
          condition: rCond.value, purchaseDate: rDate.value || null, price: isNaN(p) ? null : p
        });
        KOS.ui.toast(n ? "Added " + n + (n === 1 ? " volume" : " volumes") + " — each is editable above." : "Those volumes are already on the shelf.");
        renderPhys();
      } });
      physWrap.appendChild(el("div", { class: "bk-vol-actions" }, [
        el("div", { class: "bk-vol-quick" }, [
          quick,
          el("span", { class: "sub", text: "Adds today’s next numbered volume with default condition." })
        ]),
        el("div", { class: "bk-range-tool" }, [
          el("div", { class: "bk-range-head" }, [
            el("b", { text: "Add a volume range" }),
            el("span", { class: "sub", text: "Use one purchase date, condition and per-volume price for the batch." })
          ]),
          el("div", { class: "bk-range-grid" }, [
            field("From volume", rFrom),
            field("To volume", rTo),
            field("Condition", rCond),
            field("Purchase date", rDate),
            field("Price each", rPrice),
            el("div", { class: "bk-range-submit" }, [rBtn])
          ])
        ])
      ]));
    }
    renderPhys();

    function save() {
      if (!title.value.trim()) { KOS.ui.toast("A title is needed.", true); return; }
      var oldStatus = e.status;
      e.title = title.value.trim();
      e.author = author.value.trim();
      e.format = fmt.value;
      e.status = status.value;
      e.progress.current = Math.max(0, parseInt(chCur.value, 10) || 0);
      e.progress.total = chTot.value === "" ? null : Math.max(0, parseInt(chTot.value, 10) || 0) || null;
      e.progress.volumes = vlCur.value === "" ? null : Math.max(0, parseInt(vlCur.value, 10) || 0);
      e.progress.totalVolumes = vlTot.value === "" ? null : Math.max(0, parseInt(vlTot.value, 10) || 0) || null;
      e.score = Math.max(0, Math.min(10, stars.value()));
      e.dates.started = started.value || null;
      e.dates.finished = finished.value || null;
      e.dnf = { isDnf: dnfBox.checked, reason: dnfBox.checked ? dnfReason.value.trim() : "" };
      e.genres = splitList(genres.value);
      e.tags = splitList(tags.value);
      e.mood = splitList(mood.value);
      e.shelves = splitList(shelves.value);
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
      isNew: isNew, label: "Books", className: "bk-modal",
      subtitle: e.syncSource === "anilist" ? "synced from AniList — a Sync overwrites reading state, keeps your vault/notes/shelves" : e.syncSource === "import" ? "from XML import" : "manual entry",
      form: [
        mv.editorSection("identity", "Identity & artwork", "The bibliographic details used across the collection.", [
          field("Title", title, "med-span-2"),
          field("Author / mangaka", author),
          field("Format", fmt)
        ]),
        mv.editorSection("artwork", "Cover", "The series default; individual physical volumes can override it.", [
          field("Cover URL", el("div", { class: "image-field" }, [coverU, coverPosition.node]), "med-span-2")
        ]),
        mv.editorSection("progress", "Reading progress", "Reading state is separate from what you physically own.", [
          field("Status", status),
          field("Chapters read", chCur),
          field("Chapters total", chTot),
          field("Volumes read", vlCur),
          field("Volumes total", vlTot),
          field("Rating", stars),
          field("DNF — did not finish", el("span", { class: "med-favwrap" }, [dnfBox])),
          field("Reason", dnfReason, "bk-grow")
        ]),
        mv.editorSection("dates", "Dates & favourite", "Reading dates and Shrine placement.", [
          field("Started", started),
          field("Finished", finished),
          field("Favourite ♥", el("span", { class: "med-favwrap" }, [fav]))
        ]),
        mv.editorSection("ownership", "Physical ownership", "Volumes on your shelf are tracked independently from reading progress.", [
          comparePanel(),
          physWrap
        ], { raw: true }),
        mv.editorSection("taxonomy", "Taxonomy & shelves", "What it is, how it feels and where you organise it.", [
          field("Genres", genres),
          field("Mood", mood),
          field("Shelves", shelves),
          field("Tags", tags)
        ]),
        mv.editorSection("lists", "Lists", "Your personal collection groupings.", [
          field("Custom lists", mv.customListChips(e), "med-span-2")
        ]),
        mv.editorSection("source", "Source & sync", "Where this record came from and what may refresh.", [
          mv.sourceInfo(e, e.syncSource === "anilist" ? "AniList" : e.syncSource === "import" ? "XML import" : "Local record")
        ]),
        mv.editorSection("notes", "Notes", "Your private reading notes and edition context.", [
          field("Notes", notes, "med-span-2")
        ])
      ],
      onSave: save,
      onDelete: function () {
        mv.deleteEntry(e, "Delete “" + e.title + "” — including its physical vault records?",
          function () { overlay.close(); }, onSaved);
      },
      focus: title
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
    var overlay = KOS.medview.modalOverlay();   // click-outside + Esc close
    var close = overlay.close;

    var last = (store.state.focus && store.state.focus.lastReading) || {};
    var mins = el("input", { type: "number", class: "cal-in fx-num", min: "5", max: "480",
      value: String(last.workMin || 30) });
    var bookSel = el("select", { class: "status-sel bk-rs-book" },
      [el("option", { value: "", text: "No specific book — just reading" })]);
    KOS.mediadb.query({ module: "books", status: "inProgress", sort: "updated" }, function (err, rows) {
      if (err) return;
      rows.forEach(function (r) {
        var o = el("option", { value: String(r.id), text: r.title });
        bookSel.appendChild(o);
      });
      if (last.bookId != null && rows.some(function (r) { return r.id === last.bookId; })) {
        bookSel.value = String(last.bookId);
      }
    });

    var box = el("div", { class: "modal bk-rs-modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", {}, [el("span", { class: "kanji-inline", text: "読書" }), " Reading session"]),
        el("span", { class: "sub", text: "the Focus Timer's clock, on rest rules: logs to the reading heatmap and rest streak — XP/gold trickle only, HP and the study streak untouched, pause freely" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", "aria-label": "Close", onclick: close })
      ]),
      el("div", { class: "fx-link-row" }, [
        el("label", { class: "cal-field" }, [el("span", { text: "Minutes" }), mins]),
        el("label", { class: "cal-field bk-rs-grow" }, [el("span", { text: "Reading (optional)" }), bookSel])
      ]),
      el("div", { class: "lab-controls med-modal-foot" }, [
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "Cancel", onclick: close }),
        el("button", { class: "btn primary", text: "◉ Start reading", onclick: function () {
          var m = Math.max(5, Math.min(480, parseInt(mins.value, 10) || 30));
          var book = null;
          if (bookSel.value) {
            var opt = bookSel.options[bookSel.selectedIndex];
            book = { id: parseInt(bookSel.value, 10), title: opt.textContent };
          }
          close();
          KOS.focus.start({ kind: "reading", mode: "custom", workMin: m, breakMin: 0, book: book });
        } })
      ])
    ]);
    overlay.appendChild(box);
    KOS.ui.openDialog(overlay);
    mins.focus();
  }

  /* ================= external book lookup (3i) =================
     Title or ISBN in, prefilled add form out — Open Library first, Google
     Books fallback (see bookapi.js for the live findings). Barcode scanning
     rides the native BarcodeDetector API where the browser has it; where it
     doesn't (or the camera is refused), the typed-ISBN path IS the feature,
     not a consolation. */
  function openLookup(physicalIntent, onDone) {
    var stream = null, pollTimer = null;
    function stopScan() {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      if (stream) {
        stream.getTracks().forEach(function (t) { t.stop(); });
        stream = null;
      }
      scanWrap.style.display = "none";
    }
    /* click-outside + Esc close; the camera stops on every close path */
    var overlay = KOS.medview.modalOverlay(stopScan);
    var close = overlay.close;

    var titleIn = el("input", { type: "search", class: "todo-in msch-in",
      placeholder: "Search by title or author…", "aria-label": "Search books by title" });
    var isbnIn = el("input", { type: "text", class: "todo-in bk-isbn-in", inputmode: "numeric",
      placeholder: "…or ISBN (10 or 13, hyphens fine)", "aria-label": "ISBN" });
    var isbnBtn = el("button", { class: "btn", text: "Look up", onclick: function () { doIsbn(); } });
    var statusNote = el("p", { class: "sub msch-note" });
    var results = el("div", { class: "msch-results" });

    /* capability detection, stated honestly either way */
    var canScan = typeof window.BarcodeDetector !== "undefined" &&
      !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    var video = el("video", { class: "bk-scan-video", autoplay: "", muted: "", playsinline: "" });
    var scanWrap = el("div", { class: "bk-scan", style: "display:none" }, [
      video,
      el("div", { class: "bk-scan-hint" }, [
        el("span", { text: "Hold the back-cover barcode steady in frame" }),
        el("button", { class: "mini-btn", text: "✕ Stop", onclick: function () { stopScan(); } })
      ])
    ]);
    var scanBtn = canScan
      ? el("button", { class: "btn gold", text: "📷 Scan barcode", onclick: function () { startScan(); } })
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
          scanWrap.style.display = "";
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
      if (meta && meta.note) results.appendChild(el("p", { class: "sub", text: meta.note }));
      if (!list.length) {
        results.appendChild(el("p", { class: "fc-empty",
          text: (titleIn.value.trim() || isbnIn.value.trim()) ? "No matches in either book database." : "" }));
        return;
      }
      list.forEach(function (r) {
        var metaBits = [];
        if (r.author) metaBits.push(r.author);
        if (r.year) metaBits.push(String(r.year));
        if (r.pages) metaBits.push(r.pages + " pp");
        if (r.isbn13) metaBits.push(r.isbn13);
        var row = el("div", { class: "msch-row" }, [
          r.coverUrl
            ? el("img", { class: "msch-cover", src: r.coverUrl, alt: "", loading: "lazy" })
            : el("span", { class: "msch-cover med-cover-ph", "aria-hidden": "true", text: "本" }),
          el("div", { class: "msch-body" }, [
            el("div", { class: "msch-title", text: r.title }),
            el("div", { class: "sub", text: metaBits.join(" · ") }),
            el("span", { class: "med-chip bk-src-chip", text: SOURCE_LABEL[r.source] || r.source })
          ]),
          el("div", { class: "msch-act" }, [
            el("button", { class: "btn primary msch-add", text: "+ Use", onclick: function () { useResult(r); } })
          ])
        ]);
        results.appendChild(row);
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

    var box = el("div", { class: "modal med-modal msch-modal bk-lookup" }, [
      el("div", { class: "modal-h" }, [
        el("b", {}, [el("span", { class: "kanji-inline", text: "本" }), " Find book — Open Library / Google Books"]),
        el("span", { class: "sub", text: "search by title, or type/scan an ISBN — the match prefills the add form" +
          (physicalIntent ? " with volume 1 already on the shelf" : "") }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", "aria-label": "Close", onclick: close })
      ]),
      titleIn,
      el("div", { class: "bk-isbn-row" }, [isbnIn, isbnBtn, scanBtn]),
      canScan ? null : el("p", { class: "sub bk-scan-none", text:
        "Barcode scanning isn't available in this browser (no BarcodeDetector) — the typed ISBN does the same job." }),
      scanWrap,
      statusNote,
      results
    ]);
    overlay.appendChild(box);
    KOS.ui.openDialog(overlay);
    titleIn.focus();
  }
  /* exposed for the Matrix home / other modules to reuse */
  KOS.books.openLookup = openLookup;
  KOS.books.openReadingSession = openReadingSession;

  /* ================= cards ================= */
  function gridCard(e, rerender) {
    /* Phase F: the card is NOT a button. It contained the favourite
       toggle, a status <select> and "+1" — an ARIA button may not hold
       interactive descendants, and a keyboard user who pressed Space on
       it scrolled the page. The card keeps its pointer shortcut; the
       TITLE is the real control, so the tab order reads
       favourite → title → status → +1 and a screen reader announces the
       entry by name instead of "button". */
    var card = el("div", { class: "med-card bk-card",
      onclick: function () { booksEditor(e, rerender); }
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
          onclick: function (ev) { ev.stopPropagation(); booksEditor(e, rerender); } }),
        e.author ? el("div", { class: "bk-author", text: e.author }) : null,
        el("div", { class: "med-meta" }, [
          formatChip(e),
          dnfChip(e),
          el("span", { class: "med-prog", text: progressText(e) }),
          e.score ? el("span", { class: "med-score", text: "★ " + starText(e.score) }) : null,
          KOS.medview.pushChip(e, rerender)
        ]),
        e.physical && e.physical.volumes.length ? el("div", { class: "bk-owned-line",
          text: "📚 " + e.physical.volumes.length + " vol" + (e.physical.volumes.length === 1 ? "" : "s") + " owned" }) : null,
        el("div", { class: "med-meta med-quickrow" }, [
          KOS.medview.quickEdit(e, rerender),
          e.status === "inProgress" ? el("button", { class: "mini-btn med-plus", text: "+1 ch",
            title: "Log the next chapter", onclick: function (ev) {
              ev.stopPropagation();
              bumpChapter(e, rerender);
            } }) : null
        ])
      ])
    ]);
    var bar = dualBar(e);
    if (bar) card.appendChild(bar);
    return card;
  }
  function listRow(e, rerender) {
    return KOS.medview.listRow(e, mod(), rerender, {
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
    var row = el("div", { class: "bk-shelf-series" });
    row.appendChild(el("div", { class: "bk-shelf-h" }, [
      el("b", { text: e.title }),
      el("span", { class: "sub", text: (e.author ? e.author + " · " : "") + o.ownedVols +
        (o.totalVols ? " of " + o.totalVols + (o.est ? " (est.)" : "") : "") + " volumes" }),
      el("button", { class: "mini-btn", text: "edit →", onclick: function () { booksEditor(e, rerender); } })
    ]));
    var shelf = el("div", { class: "bk-shelf", role: "list" });
    e.physical.volumes.forEach(function (v) {
      var spine;
      if (v.coverUrl) {
        spine = el("div", { class: "bk-spine bk-spine-img", role: "listitem",
          title: e.title + " vol " + v.number + " · " + KOS.media.CONDITION_LABEL[v.condition] }, [
          KOS.imageCrop.image(v.coverUrl, { alt: e.title + " volume " + v.number, loading: "lazy" }, v.coverCrop)
        ]);
      } else {
        spine = el("div", { class: "bk-spine", role: "listitem", style: "--spine:" + colour,
          title: e.title + " vol " + v.number + " · " + KOS.media.CONDITION_LABEL[v.condition] +
            (v.purchaseDate ? " · " + v.purchaseDate : "") + (v.price ? " · £" + v.price.toFixed(2) : "") }, [
          el("span", { class: "bk-spine-n", text: String(v.number) }),
          el("span", { class: "bk-spine-t", text: e.title })
        ]);
      }
      if (v.condition === "damaged" || v.condition === "worn") {
        spine.appendChild(el("span", { class: "bk-spine-cond " + v.condition, "aria-hidden": "true" }));
      }
      spine.addEventListener("click", function () { booksEditor(e, rerender); });
      shelf.appendChild(spine);
    });
    shelf.appendChild(el("div", { class: "bk-shelf-board", "aria-hidden": "true" }));
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
      KOS.charts.heatmap(days, { color: "#F2C46D" }));
  }

  /* ================= the Books view ================= */
  KOS.views.books = function (main, arg) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var p = prefs();
    if (arg && (arg.tab === "physical" || arg.tab === "digital")) { p.tab = arg.tab; store.save(); }
    var filt = { status: null, dnf: false };
    var mv = KOS.medview;

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "Collection · 本" }),
        el("h1", { text: "Books" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "What you're reading and what's on the shelf — one entry, both lives." })
        ])
      ])
    ]));

    if (mv.unavailable(main)) return;

    /* Build 4.0: the per-module spotlight hero (medview.heroCard) */
    var heroHolder = el("div", { class: "vh-holder" });
    main.appendChild(heroHolder);

    /* ---- the Physical/Digital tab split (3i) — navigation only ----
       Category 7 Phase B: this was the app's THIRD tab idiom (audit G-23);
       it now builds through KOS.ui.tabs's "card" variant, which is the same
       two-line-with-a-kanji shape it always had, shared. The .bk-tabs class
       stays on the container so the Books-specific rules still apply. */
    var LENSES = [
      ["digital", "読", "Digital", "reading progress — every tracked series"],
      ["physical", "蔵", "Physical Vault", "owned volumes only — the real shelf"]
    ];
    var tabBar;
    function buildLenses() {
      return KOS.ui.tabs(LENSES.map(function (t) {
        return { label: t[2], glyph: t[1], hint: t[3], active: p.tab === t[0], className: "bk-tab",
          onSelect: function () {
            if (p.tab === t[0]) return;
            p.tab = t[0];
            store.save();
            var fresh = buildLenses();
            tabBar.replaceChildren.apply(tabBar, Array.prototype.slice.call(fresh.childNodes));
            syncToolbar();
            refresh();
          } };
      }), { variant: "card", label: "Books lens", className: "bk-tabs" });
    }
    tabBar = buildLenses();
    main.appendChild(tabBar);

    /* toolbar — the shared pieces come from the medview toolkit */
    var search = mv.searchInput("Search book titles");
    var fmtSel = el("select", { class: "status-sel", "aria-label": "Filter by format" }, [
      ["", "All formats"], ["manga", "Manga"], ["lightNovel", "Light Novels"], ["oneShot", "One-shots"]
    ].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    var genreSel = el("select", { class: "status-sel", "aria-label": "Filter by genre" });
    var moodSel = el("select", { class: "status-sel", "aria-label": "Filter by mood" });
    var shelfSel = el("select", { class: "status-sel", "aria-label": "Filter by shelf" });
    var sortSel = mv.sortSelect(p.sort, { score: "Rating" });

    /* layout is a per-tab pref: the Digital lens reads as grid/list, the
       Physical lens defaults to the bookshelf (its whole point is volume-
       level detail) with grid/list as alternatives */
    var LAYOUTS = { grid: "▦ Grid", list: "☰ List", shelf: "📚 Shelf" };
    function layoutOrder() { return p.tab === "physical" ? ["shelf", "grid", "list"] : ["grid", "list"]; }
    function curLayout() {
      var ord = layoutOrder();
      var cur = p.tab === "physical" ? p.physLayout : p.layout;
      return ord.indexOf(cur) !== -1 ? cur : ord[0];
    }
    function nextLayout() {
      var ord = layoutOrder();
      return ord[(ord.indexOf(curLayout()) + 1) % ord.length];
    }
    var layoutBtn = el("button", { class: "btn", title: "Cycle layout", onclick: function () {
        if (p.tab === "physical") p.physLayout = nextLayout(); else p.layout = nextLayout();
        store.save();
        syncToolbar();
        refresh();
      } });
    function syncToolbar() { layoutBtn.textContent = LAYOUTS[nextLayout()]; }
    syncToolbar();

    var rail = mv.filterRail("books", function () { refresh(); });
    var mainCol = el("div", { class: "med-main" });
    /* the shared toolbar (Category 7 Phase D). This is the vault the audit
       measured at SEVENTEEN controls in three rows before a single cover
       (VLT-3/U-13): the lens cards, then search + five selects + layout,
       then eight action chips with no grouping at all. Six controls now,
       one row, and every one of those actions is still one click away —
       DNF joins the facets because it is a filter, Mangaka / reading
       sessions / lookups / sync join the ⋯ menu because they are not. */
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
        { label: "Find new titles…", glyph: "⊕", hint: "Search AniList's manga database",
          onSelect: function () { KOS.mediaSearch.open("books", refreshAll); } },
        { label: "Look up a book or ISBN…", glyph: "◫",
          hint: "Open Library, or scan the barcode",
          onSelect: function () { openLookup(p.tab === "physical", refreshAll); } },
        { heading: "This vault" },
        { label: "The numbers", glyph: "◫", hint: "Composition, taste and pace",
          onSelect: function () { mv.statsModal("books", mod()); } },
        { label: "Sync & Import", glyph: "⇅", onSelect: function () { KOS.show("mediasync"); } }
      ],
      primary: el("button", { class: "btn primary", text: "+ Add", onclick: function () { booksEditor(null, refreshAll); } })
    });
    mainCol.appendChild(bar.root);
    main.appendChild(el("div", { class: "med-layout" }, [rail.root, mainCol]));

    function refreshAll() { rail.reload(); refresh(); }

    /* countLine + holder + sentinel + the lazy batch renderer (makeItem is
       hoisted — the shelf-ranking block below defines it) */
    var area = mv.resultsArea(mainCol, function (e, i) { return makeItem(e, i); });

    /* dropdown fills from the real index keys (books rows only for
       mood/shelves — those axes exist only here anyway) */
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
      var wrap = el("div", { class: "bk-rank-row", draggable: "true", "data-id": String(e.id) }, [
        el("span", { class: "bk-rank-n", "aria-hidden": "true", text: String(idx + 1) }),
        el("span", { class: "bk-rank-grip", title: "Drag to reorder", "aria-hidden": "true", text: "⠿" }),
        listRow(e, refresh),
        el("span", { class: "bk-rank-ctl" }, [
          el("button", { class: "mini-btn", "aria-label": "Move “" + e.title + "” up", text: "▲",
            onclick: function (ev) { ev.stopPropagation(); moveRank(idx, idx - 1); } }),
          el("button", { class: "mini-btn", "aria-label": "Move “" + e.title + "” down", text: "▼",
            onclick: function (ev) { ev.stopPropagation(); moveRank(idx, idx + 1); } })
        ])
      ]);
      wrap.addEventListener("dragstart", function (ev) {
        dragIdx = idx;
        wrap.classList.add("dragging");
        if (ev.dataTransfer) {
          ev.dataTransfer.effectAllowed = "move";
          try { ev.dataTransfer.setData("text/plain", String(e.id)); } catch (_) { /* older engines */ }
        }
      });
      wrap.addEventListener("dragend", function () { wrap.classList.remove("dragging"); dragIdx = null; });
      wrap.addEventListener("dragover", function (ev) { ev.preventDefault(); wrap.classList.add("dragover"); });
      wrap.addEventListener("dragleave", function () { wrap.classList.remove("dragover"); });
      wrap.addEventListener("drop", function (ev) {
        ev.preventDefault();
        wrap.classList.remove("dragover");
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
      /* the Physical lens IS a filter on the same vault: owned volumes only */
      if (physical) opts.owned = true;
      /* claim the render generation BEFORE the query: switching lens mid-flight
         (or typing in search) must not let the older query paint the newer
         lens — and it tears down the previous lens's lazy observer at once,
         so nothing from it can ever be appended again */
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
             class on the shelf layout — the default look is its absence */
          var skin = lay === "shelf" && KOS.governor.shelfSkin && KOS.governor.shelfSkin();
          area.holder.className = lay === "list" ? "med-list" : lay === "shelf" ? "bk-shelves" + (skin ? " " + skin : "") : "med-grid";
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
                  ? "No physical volumes recorded yet — open any series and add what you own (the range tool takes a whole box set in one go), or scan a barcode with ◫ Find book."
                  : "The Books vault is empty. Sync your AniList manga list, import an XML export, look a book up by ISBN, or add a series by hand.",
              [
                el("button", { class: "btn primary", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }),
                el("button", { class: "btn gold", text: "◫ Find book / ISBN", onclick: function () { openLookup(physical, refreshAll); } }),
                el("button", { class: "btn", text: "+ Add manually", onclick: function () { booksEditor(null, refreshAll); } })
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
    sortSel.addEventListener("change", function () { p.sort = sortSel.value; store.save(); refresh(); });

    function mountHero() { mv.heroCard(heroHolder, "books", mod(), function () { refreshAll(); mountHero(); }); }
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
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
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
    var search = el("input", { type: "search", class: "todo-in med-search",
      placeholder: "Search authors…", "aria-label": "Search authors" });
    var sortSel = el("select", { class: "status-sel med-sort", "aria-label": "Sort authors" }, [
      ["name", "A–Z"], ["works", "Most works"], ["volumes", "Most volumes owned"],
      ["chapters", "Most chapters read"]
    ].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    sortSel.addEventListener("change", function () { sortBy = sortSel.value; paint(); });

    var fmtSel = el("select", { class: "status-sel", "aria-label": "Filter by format" }, [
      ["", "All formats"], ["manga", "Manga"], ["lightNovel", "Light novels"], ["oneShot", "One-shots"]
    ].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    var stSel = el("select", { class: "status-sel", "aria-label": "Filter by reading status" },
      [el("option", { value: "", text: "Any status" })].concat(mv.STATUSES.map(function (s) {
        return el("option", { value: s, text: KOS.media.STATUS_LABEL[s] });
      })));
    var minSel = el("select", { class: "status-sel", "aria-label": "Minimum works by this author" }, [
      ["", "Any number of works"], ["2", "2 or more works"], ["3", "3 or more works"],
      ["5", "5 or more works"], ["10", "10 or more works"]
    ].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));

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
      className: "mk-toolbar",
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
    main.appendChild(bar.root);

    /* the jump rail can only mean something in name order, so it hides
       itself under any other ranking rather than lying about position */
    var jump = el("div", { class: "mk-jump", role: "group", "aria-label": "Jump to letter" });
    main.appendChild(jump);

    /* one lazy row = one author card (or a letter divider before it) */
    var area = mv.resultsArea(main, function (name, i) {
      var card = authorCard(name);
      if (sortBy !== "name") return card;
      var letter = mkLetter(name);
      if (i > 0 && mkLetter(shown[i - 1]) === letter) return card;
      var frag = document.createDocumentFragment();
      frag.appendChild(el("div", { class: "mk-letter", "aria-hidden": "true" }, [
        el("span", { text: letter })
      ]));
      frag.appendChild(card);
      return frag;
    });
    area.holder.className = "mk-wall";

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
      return el("button", { type: "button", class: "mk-work", title: e.title,
        "aria-label": e.title, onclick: open }, [
        e.coverUrl
          ? el("span", { class: "mk-work-cover" }, [KOS.imageCrop.image(e.coverUrl,
              { alt: "", loading: "lazy", decoding: "async" }, e.coverCrop)])
          : el("span", { class: "med-cover-ph mk-ph", "aria-hidden": "true",
              style: "--spine:" + spineColor(e.title), text: "本" }),
        el("div", { class: "mk-work-body" }, [
          el("span", { class: "mk-work-t", text: e.title }),
          el("span", { class: "sub mk-work-m", text: [
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

      /* the meta line prints only figures that carry something — a "£0"
         or "0 ch read" beside a name is noise, not information */
      var meta = [
        works.length + (works.length === 1 ? " work" : " works"),
        owned ? owned + (owned === 1 ? " volume owned" : " volumes owned") : null,
        chapters ? chapters + " ch read" : null,
        spent ? "£" + spent.toFixed(0) + " spent" : null,
        avg ? "★ " + starText(Math.round(avg)) : null
      ].filter(Boolean).join(" · ");

      var wall = el("div", { class: "mk-works" }, visible.map(workTile));
      var card = el("div", { class: "mk-card", "data-letter": mkLetter(name) }, [
        el("div", { class: "mk-h" }, [
          el("span", { class: "mk-mark", "aria-hidden": "true", style: "--spine:" + spineColor(name),
            text: name === MK_UNATTRIBUTED ? "?" : name.slice(0, 1) }),
          el("div", { class: "mk-h-txt" }, [
            el("b", { class: "mk-name", text: name }),
            el("span", { class: "sub mk-meta", text: meta })
          ])
        ]),
        wall
      ]);
      if (works.length > MK_SHOWN) {
        var more = el("button", { class: "btn subtle mk-more", type: "button",
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

    /* The rail FILTERS to a letter rather than scrolling to it. Scrolling
       would mean mounting every author above the target — on a real
       library that is the whole 732-card wall again, which is the bug this
       view exists to have fixed. Filtering keeps the DOM bounded and still
       reaches any author in one tap. Tapping the active letter clears it. */
    function jumpTo(letter) {
      activeLetter = activeLetter === letter ? "" : letter;
      main.scrollTop = 0;
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
      jump.classList.toggle("hidden", !byName);
      jump.innerHTML = "";
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("").forEach(function (L) {
        var key = el("button", { class: "mk-jump-key" + (letters[L] ? "" : " off") +
            (activeLetter === L ? " active" : ""),
          type: "button", text: L, "aria-pressed": String(activeLetter === L),
          "aria-label": L === "#" ? "Names outside A to Z" : "Authors starting with " + L,
          onclick: function () { jumpTo(L); } });
        /* el() would setAttribute("disabled", false) — which still disables */
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
          filtered ? [el("button", { class: "btn", text: "Clear everything", onclick: function () {
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
      if (err) { main.appendChild(el("p", { class: "fc-empty", text: "Could not read the vault: " + err.message })); return; }
      if (!rows.length) {
        area.clear();
        area.countLine.textContent = "";
        jump.classList.add("hidden");
        bar.root.classList.add("hidden");
        area.holder.appendChild(mv.emptyState(
          "No books tracked yet — the author pages build themselves from the vault.",
          [el("button", { class: "btn primary", text: "本 Open the Books vault", onclick: function () { KOS.show("books"); } })]));
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
