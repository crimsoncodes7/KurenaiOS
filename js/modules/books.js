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

  /* Per-volume custom cover: the Build 2a avatar pattern with the circle
     crop swapped for a 2:3 rectangle — cover-fit, compressed JPEG base64.
     Lives inside the IndexedDB entry, never localStorage. */
  function compressVolumeCover(file, done) {
    var reader = new FileReader();
    reader.onload = function () {
      var img = new Image();
      img.onload = function () {
        try {
          var W = 200, H = 300;
          var cv = document.createElement("canvas");
          cv.width = W; cv.height = H;
          var ctx = cv.getContext("2d");
          /* cover-fit: crop whichever axis overflows the 2:3 frame, centred */
          var scale = Math.max(W / img.width, H / img.height);
          var sw = W / scale, sh = H / scale;
          ctx.drawImage(img, (img.width - sw) / 2, (img.height - sh) / 2, sw, sh, 0, 0, W, H);
          var data = cv.toDataURL("image/jpeg", 0.8);
          if (data.length > 150 * 1024) data = cv.toDataURL("image/jpeg", 0.6);
          done(null, data);
        } catch (err) { done(err); }
      };
      img.onerror = function () { done(new Error("Not a readable image")); };
      img.src = reader.result;
    };
    reader.onerror = function () { done(new Error("Could not read the file")); };
    reader.readAsDataURL(file);
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
  function progressText(e) {
    var c = e.progress.current || 0, t = e.progress.total;
    var s = c + (t ? "/" + t : "") + " ch";
    if (e.progress.volumes != null) {
      var tv = totalVolumes(e);
      s += " · " + e.progress.volumes + (tv.n ? "/" + tv.n : "") + " vol";
    }
    return s;
  }
  function cover(e) {
    var box = el("div", { class: "med-cover" });
    if (e.coverUrl) {
      var img = el("img", { src: e.coverUrl, alt: "", loading: "lazy", decoding: "async" });
      img.addEventListener("error", function () {
        box.removeChild(img);
        box.appendChild(el("span", { class: "med-cover-ph", "aria-hidden": "true", text: mod().kanji }));
      });
      box.appendChild(img);
    } else {
      box.appendChild(el("span", { class: "med-cover-ph", "aria-hidden": "true", text: mod().kanji }));
    }
    return box;
  }

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

  /* +1 chapter — the everyday logging action, mirroring anime's +1 ep */
  function bumpChapter(e, done) {
    e.progress.current = (e.progress.current || 0) + 1;
    var finished = e.progress.total && e.progress.current >= e.progress.total;
    if (finished) {
      e.progress.current = e.progress.total;
      e.status = "completed";
      if (!e.dates.finished) e.dates.finished = KOS.srs.todayISO();
    } else if (e.status === "planned" || e.status === "onHold") {
      e.status = "inProgress";
      if (!e.dates.started) e.dates.started = KOS.srs.todayISO();
    }
    KOS.mediadb.put(e, function (err) {
      if (err) { KOS.ui.toast("Save failed: " + err.message, true); return; }
      KOS.media.logActivity(e, finished ? "completed" : "progress");
      KOS.mediapush.schedule(e);   // 3d: coalesces rapid +1 clicks into one push
      done && done(e);
    });
  }

  /* ================= the editor modal ================= */
  function booksEditor(entry, onSaved) {
    /* a lookup-prefilled draft (3i) arrives as an entry with no id — still
       a NEW entry: shows "Add", logs "added" on save */
    var isNew = !entry || entry.id == null;
    var e = entry ? KOS.mediadb.normalise(JSON.parse(JSON.stringify(entry))) : KOS.mediadb.normalise({ module: "books" });
    if (entry && entry.id != null) e.id = entry.id;
    var pushBefore = KOS.mediapush.snapshot(e);

    var overlay = el("div", { class: "modal-ov", onclick: function (ev) { if (ev.target === overlay) close(); } });
    function close() { overlay.remove(); }
    function field(label, input, cls) {
      return el("label", { class: "med-field" + (cls ? " " + cls : "") }, [el("span", { class: "k", text: label }), input]);
    }
    function splitList(v) { return v.split(",").map(function (s) { return s.trim(); }).filter(Boolean); }

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
          var covBtn = el("button", { class: "mini-btn", text: v.coverUrl ? "🖼 replace" : "🖼 cover",
            title: "Custom cover for this volume (cropped to 2:3, compressed)", onclick: function (ev) {
              ev.preventDefault();
              var f = el("input", { type: "file", accept: "image/*" });
              f.addEventListener("change", function () {
                if (!f.files[0]) return;
                compressVolumeCover(f.files[0], function (err, data) {
                  if (err) { KOS.ui.toast(err.message, true); return; }
                  v.coverUrl = data;
                  renderPhys();
                  KOS.ui.toast("Volume " + v.number + " cover set — save to keep it.");
                });
              });
              f.click();
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
      var quick = el("button", { class: "btn", text: "+ Vol " + nextVolumeNumber(e), onclick: function (ev) {
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
      physWrap.appendChild(el("div", { class: "bk-vol-add" }, [
        quick,
        el("span", { class: "bk-vol-add-sep", text: "or range" }),
        rFrom, el("span", { class: "sub", text: "–" }), rTo, rCond, rDate, rPrice, rBtn
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
      e.coverUrl = coverU.value.trim() || null;
      e.favourite = fav.checked;
      e.notes = notes.value;
      KOS.mediadb.put(e, function (err, rec) {
        if (err) { KOS.ui.toast("Save failed: " + err.message, true); return; }
        if (isNew) KOS.media.logActivity(rec, "added");
        else if (oldStatus !== rec.status) KOS.media.logActivity(rec, "status");
        else KOS.ui.toast("Saved.");
        if (KOS.mediapush.snapshot(rec) !== pushBefore) KOS.mediapush.schedule(rec);
        close();
        onSaved && onSaved(rec);
      });
    }

    var box = el("div", { class: "modal med-modal bk-modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: (isNew ? "Add to " : "Edit — ") + "Books" }),
        el("span", { class: "sub", text: e.syncSource === "anilist" ? "synced from AniList — a Sync overwrites reading state, keeps your vault/notes/shelves" : e.syncSource === "import" ? "from XML import" : "manual entry" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", "aria-label": "Close", onclick: close })
      ]),
      el("div", { class: "med-form" }, [
        comparePanel(),
        el("div", { class: "med-form-row" }, [
          field("Title", title, "bk-grow"),
          field("Format", fmt)
        ]),
        field("Author / mangaka", author),
        el("div", { class: "med-form-row" }, [
          field("Status", status),
          field("Chapters read", chCur),
          field("of (total)", chTot),
          field("Volumes read", vlCur),
          field("of (total)", vlTot)
        ]),
        el("div", { class: "med-form-row" }, [
          field("Rating", stars),
          field("Started", started),
          field("Finished", finished),
          field("Favourite ♥", el("span", { class: "med-favwrap" }, [fav]))
        ]),
        el("div", { class: "med-form-row bk-dnf-row" }, [
          field("DNF — did not finish", el("span", { class: "med-favwrap" }, [dnfBox])),
          field("Reason", dnfReason, "bk-grow")
        ]),
        field("Genres (comma-separated, shared taxonomy)", genres),
        field("Mood (comma-separated — how it feels, not what it is)", mood),
        field("Shelves (comma-separated — your own collections)", shelves),
        field("Tags (comma-separated, shared taxonomy)", tags),
        field("Cover URL (series default; volumes can override below)", coverU),
        physWrap,
        field("Notes", notes)
      ]),
      el("div", { class: "lab-controls med-modal-foot" }, [
        !isNew ? el("button", { class: "btn danger", text: "Delete", onclick: function () {
          if (!confirm("Delete “" + e.title + "” — including its physical vault records?")) return;
          KOS.mediadb.remove(e.id, function (err) {
            if (err) { KOS.ui.toast("Delete failed: " + err.message, true); return; }
            KOS.ui.toast("Deleted.");
            close();
            onSaved && onSaved(null);
          });
        } }) : null,
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "Cancel", onclick: close }),
        el("button", { class: "btn primary", text: isNew ? "Add" : "Save", onclick: save })
      ])
    ]);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    title.focus();
  }
  KOS.booksEditor = booksEditor;

  /* The Shrine and Matrix open entries through KOS.mediaEditor — route Books
     entries to the Books editor, everything else to the original (anime's). */
  var baseEditor = KOS.mediaEditor;
  KOS.mediaEditor = function (entry, onSaved) {
    if (entry && (entry.module === "books" || entry.module === "manga" || entry.module === "ln")) {
      booksEditor(entry, onSaved);
    } else {
      baseEditor(entry, onSaved);
    }
  };

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
    var overlay = el("div", { class: "modal-ov", onclick: function (ev) { if (ev.target === overlay) close(); } });
    function close() { overlay.remove(); }

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
    document.body.appendChild(overlay);
    mins.focus();
  }

  /* ================= external book lookup (3i) =================
     Title or ISBN in, prefilled add form out — Open Library first, Google
     Books fallback (see bookapi.js for the live findings). Barcode scanning
     rides the native BarcodeDetector API where the browser has it; where it
     doesn't (or the camera is refused), the typed-ISBN path IS the feature,
     not a consolation. */
  function openLookup(physicalIntent, onDone) {
    var overlay = el("div", { class: "modal-ov", onclick: function (ev) { if (ev.target === overlay) close(); } });
    var stream = null, pollTimer = null;
    function stopScan() {
      if (pollTimer) { clearInterval(pollTimer); pollTimer = null; }
      if (stream) {
        stream.getTracks().forEach(function (t) { t.stop(); });
        stream = null;
      }
      scanWrap.style.display = "none";
    }
    function close() { stopScan(); overlay.remove(); }

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
        if (exact && confirm("“" + exact.title + "” is already in the vault — open the existing entry instead?\n\n(Cancel adds a separate copy.)")) {
          close();
          booksEditor(exact, onDone);
          return;
        }
        openDraft();
      });
    }

    var deb = null, seq = 0;
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
    titleIn.addEventListener("input", function () {
      clearTimeout(deb);
      deb = setTimeout(runTitle, 220);
    });
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
    document.body.appendChild(overlay);
    titleIn.focus();
  }
  /* exposed for the Matrix home / other modules to reuse */
  KOS.books.openLookup = openLookup;
  KOS.books.openReadingSession = openReadingSession;

  /* ================= cards ================= */
  function gridCard(e, rerender) {
    var card = el("div", { class: "med-card bk-card", role: "button", tabindex: "0",
      onclick: function () { booksEditor(e, rerender); },
      onkeydown: function (ev) { if (ev.key === "Enter") { ev.preventDefault(); booksEditor(e, rerender); } }
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
        el("div", { class: "med-title", title: e.title, text: e.title }),
        e.author ? el("div", { class: "bk-author", text: e.author }) : null,
        el("div", { class: "med-meta" }, [
          formatChip(e),
          dnfChip(e),
          el("span", { class: "med-prog", text: progressText(e) }),
          e.score ? el("span", { class: "med-score", text: "★ " + starText(e.score) }) : null,
          KOS.media.pushChip(e, rerender)
        ]),
        e.physical && e.physical.volumes.length ? el("div", { class: "bk-owned-line",
          text: "📚 " + e.physical.volumes.length + " vol" + (e.physical.volumes.length === 1 ? "" : "s") + " owned" }) : null,
        el("div", { class: "med-meta med-quickrow" }, [
          KOS.media.quickEdit(e, rerender),
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
    return el("div", { class: "med-row bk-row", role: "button", tabindex: "0",
      onclick: function () { booksEditor(e, rerender); },
      onkeydown: function (ev) { if (ev.key === "Enter") { ev.preventDefault(); booksEditor(e, rerender); } }
    }, [
      el("span", { class: "med-row-fav" + (e.favourite ? " on" : ""), text: e.favourite ? "♥" : "" }),
      el("span", { class: "med-row-title", text: e.title, title: e.title }),
      el("span", { class: "med-row-genres", text: e.author || e.genres.slice(0, 2).join(" · ") }),
      KOS.media.quickEdit(e, rerender),
      el("span", { class: "med-prog", text: progressText(e) }),
      KOS.media.pushChip(e, rerender),
      e.status === "inProgress" ? el("button", { class: "mini-btn med-plus", text: "+1", onclick: function (ev) {
        ev.stopPropagation();
        bumpChapter(e, rerender);
      } }) : el("span", { class: "med-plus-gap" })
    ]);
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
          el("img", { src: v.coverUrl, alt: e.title + " volume " + v.number, loading: "lazy" })
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
      KOS.charts.heatmap(days, { color: "#ecc15a" }));
  }

  /* ================= the Books view ================= */
  KOS.views.books = function (main, arg) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var p = prefs();
    if (arg && (arg.tab === "physical" || arg.tab === "digital")) { p.tab = arg.tab; store.save(); }
    var filt = { status: null, dnf: false };

    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", {}, [el("span", { class: "kanji-inline", text: mod().kanji }), " Books"]),
      el("p", { class: "sub", text: "One vault, two lenses: the Digital tab is reading progress (AniList-synced or manual), the Physical Vault tab is what's actually on your shelves, volume by volume. A series tracked both ways appears in both — open any entry for its owned-vs-read comparison." })
    ]));

    if (!KOS.mediadb.available()) {
      main.appendChild(el("p", { class: "fc-empty", text: "The Collection Matrix needs IndexedDB, which this browser/context doesn't provide." }));
      return;
    }

    /* ---- the Physical/Digital tab split (3i) — navigation only ---- */
    var tabBar = el("div", { class: "bk-tabs", role: "tablist", "aria-label": "Books lens" });
    function tabBtn(id, kanji, label, hint) {
      var b = el("button", { class: "bk-tab" + (p.tab === id ? " active" : ""), role: "tab",
        "aria-selected": p.tab === id ? "true" : "false", "data-tab": id, title: hint,
        onclick: function () {
          if (p.tab === id) return;
          p.tab = id;
          store.save();
          tabBar.querySelectorAll(".bk-tab").forEach(function (x) {
            x.classList.toggle("active", x.dataset.tab === id);
            x.setAttribute("aria-selected", x.dataset.tab === id ? "true" : "false");
          });
          syncToolbar();
          refresh();
        } }, [
        el("span", { class: "bk-tab-k", "aria-hidden": "true", text: kanji }),
        el("span", {}, [el("b", { text: label }), el("span", { class: "sub bk-tab-hint", text: hint })])
      ]);
      return b;
    }
    tabBar.appendChild(tabBtn("digital", "読", "Digital", "reading progress — every tracked series"));
    tabBar.appendChild(tabBtn("physical", "蔵", "Physical Vault", "owned volumes only — the real shelf"));
    main.appendChild(tabBar);

    /* toolbar */
    var search = el("input", { type: "search", class: "todo-in med-search", placeholder: "Search titles…", "aria-label": "Search book titles" });
    var fmtSel = el("select", { class: "status-sel", "aria-label": "Filter by format" }, [
      ["", "All formats"], ["manga", "Manga"], ["lightNovel", "Light Novels"], ["oneShot", "One-shots"]
    ].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    var genreSel = el("select", { class: "status-sel", "aria-label": "Filter by genre" });
    var moodSel = el("select", { class: "status-sel", "aria-label": "Filter by mood" });
    var shelfSel = el("select", { class: "status-sel", "aria-label": "Filter by shelf" });
    var sortSel = el("select", { class: "status-sel", "aria-label": "Sort" }, [
      ["updated", "Recently updated"], ["title", "Title A–Z"], ["score", "Rating"], ["progress", "Progress"]
    ].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    sortSel.value = p.sort || "updated";

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

    var pills = el("div", { class: "study-tabs med-pills", role: "tablist" });
    function pill(label, apply) {
      var b = el("button", { class: "study-tab", role: "tab", onclick: function () {
        apply();
        pills.querySelectorAll(".study-tab").forEach(function (x) { x.classList.remove("active"); });
        b.classList.add("active");
        refresh();
      } }, [label]);
      return b;
    }
    var allPill = pill("All", function () { filt.status = null; filt.dnf = false; });
    allPill.classList.add("active");
    pills.appendChild(allPill);
    STATUSES.forEach(function (s) {
      pills.appendChild(pill(KOS.media.STATUS_LABEL[s], function () { filt.status = s; filt.dnf = false; }));
    });
    pills.appendChild(pill("DNF", function () { filt.status = null; filt.dnf = true; }));

    main.appendChild(el("div", { class: "med-toolbar" }, [
      search, fmtSel, genreSel, moodSel, shelfSel, sortSel, layoutBtn,
      el("button", { class: "btn", text: "作 Mangaka", title: "Every author you own or track, aggregated", onclick: function () { KOS.show("mangaka"); } }),
      el("button", { class: "btn", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }),
      el("button", { class: "btn", text: "⏱ Reading session", title: "A timed reading session on the Focus Timer's clock — logs to the reading heatmap and rest streak, never HP or the study streak",
        onclick: function () { openReadingSession(); } }),
      el("button", { class: "btn gold", text: "⊕ Find new", title: "Search all of AniList's manga database — not your vault — and add with one click",
        onclick: function () { KOS.mediaSearch.open("books", refresh); } }),
      el("button", { class: "btn gold", text: "◫ Find book / ISBN", title: "Look a book up by title or ISBN (type or scan the barcode) — Open Library, with Google Books as fallback — and prefill the add form",
        onclick: function () { openLookup(p.tab === "physical", refresh); } }),
      el("button", { class: "btn primary", text: "+ Add", onclick: function () { booksEditor(null, refresh); } })
    ]));
    main.appendChild(pills);

    var countLine = el("p", { class: "sub med-count" });
    main.appendChild(countLine);
    var holder = el("div", { class: "med-grid" });
    main.appendChild(holder);
    var sentinel = el("div", { class: "med-sentinel", "aria-hidden": "true" });
    main.appendChild(sentinel);

    /* stats + heatmap under the vault */
    var statsWrap = el("div", { class: "bk-stats" });
    main.appendChild(statsWrap);
    function renderStats() {
      statsWrap.innerHTML = "";
      KOS.mediadb.stats(function (err, agg) {
        if (err || !agg) return;
        var b = agg.modules.books || { total: 0, inProgress: 0, completed: 0, episodes: 0, volumesOwned: 0, spent: 0 };
        function stat(v, k) {
          return el("div", { class: "stat-card" }, [
            el("div", { class: "v", text: String(v) }), el("div", { class: "k", text: k })]);
        }
        statsWrap.appendChild(el("div", { class: "stat-strip" }, [
          stat(b.total, "Series tracked"),
          stat(b.inProgress || 0, "Reading now"),
          stat(b.completed || 0, "Completed"),
          stat(b.episodes || 0, "Chapters logged"),
          stat(b.volumesOwned || 0, "Volumes on the shelf"),
          stat(b.spent ? "£" + b.spent.toFixed(0) : "£0", "Spent on volumes")
        ]));
        statsWrap.appendChild(el("div", { class: "cs-grid bk-heat" }, [heatmapCard(16)]));
      });
    }
    renderStats();

    /* dropdown fills from the real index keys (books rows only for
       mood/shelves — those axes exist only here anyway) */
    function fillSel(sel, values, blank) {
      var cur = sel.value;
      sel.innerHTML = "";
      sel.appendChild(el("option", { value: "", text: blank }));
      values.forEach(function (v) { sel.appendChild(el("option", { value: v, text: v })); });
      sel.value = values.indexOf(cur) !== -1 ? cur : "";
    }
    KOS.mediadb.distinct("mood", function (err, ms) { if (!err) fillSel(moodSel, ms, "All moods"); });
    KOS.mediadb.distinct("shelves", function (err, ss) { if (!err) fillSel(shelfSel, ss, "All shelves"); });
    KOS.mediadb.query({ module: "books" }, function (err, rows) {
      if (err) return;
      var gs = {};
      rows.forEach(function (r) { r.genres.forEach(function (g) { gs[g] = true; }); });
      fillSel(genreSel, Object.keys(gs).sort(), "All genres");
    });

    /* ---- shelf ranking (3i): drag / ▲▼ within a selected shelf ---- */
    var reorderMode = false, activeShelf = null, dragIdx = null;
    function moveRank(from, to) {
      if (to < 0 || to >= results.length || from === to) return;
      var moved = results.splice(from, 1)[0];
      results.splice(to, 0, moved);
      KOS.books.setShelfOrder(activeShelf, results.map(function (r) { return r.id; }), function (err) {
        if (err) KOS.ui.toast("Could not save the order: " + err.message, true);
      });
      repaint();
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

    /* ---- lazy batch renderer (grid/list) ---- */
    var results = [], rendered = 0, io = null;
    function makeItem(e, i) {
      if (curLayout() === "list") return reorderMode ? rankRow(e, i) : listRow(e, refresh);
      return gridCard(e, refresh);
    }
    function renderBatch() {
      var end = Math.min(rendered + BATCH, results.length);
      var frag = document.createDocumentFragment();
      for (var i = rendered; i < end; i++) frag.appendChild(makeItem(results[i], i));
      holder.appendChild(frag);
      rendered = end;
      if (rendered >= results.length && io) { io.disconnect(); io = null; }
    }
    function startLazy() {
      if (io) { io.disconnect(); io = null; }
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
    /* re-render the current results without a re-query (rank moves) */
    function repaint() {
      holder.innerHTML = "";
      rendered = 0;
      startLazy();
    }

    var emptyBox = null;
    function refresh() {
      var lay = curLayout();
      var physical = p.tab === "physical";
      var opts = {
        module: "books", status: filt.status || undefined,
        format: fmtSel.value || undefined,
        genre: genreSel.value || undefined,
        mood: moodSel.value || undefined,
        shelf: shelfSel.value || undefined,
        dnf: filt.dnf || undefined,
        search: search.value.trim() || undefined, sort: sortSel.value
      };
      /* the Physical lens IS a filter on the same vault: owned volumes only */
      if (physical) opts.owned = true;
      KOS.mediadb.query(opts, function (err, rows) {
        if (err) {
          if (emptyBox) { emptyBox.remove(); emptyBox = null; }
          holder.innerHTML = "";
          countLine.textContent = "Query failed: " + err.message;
          return;
        }
        activeShelf = shelfSel.value || null;
        /* ranking edits only make sense on the WHOLE shelf in list layout —
           any extra filter would silently save a partial order */
        reorderMode = !!activeShelf && lay === "list" && !filt.status && !filt.dnf &&
          !fmtSel.value && !genreSel.value && !moodSel.value && !search.value.trim();
        sortSel.disabled = !!activeShelf;
        sortSel.title = activeShelf ? "A selected shelf keeps its own ranked order" : "";
        function paint(rowsOrdered) {
          if (emptyBox) { emptyBox.remove(); emptyBox = null; }
          holder.innerHTML = "";
          rendered = 0;
          /* shelf skin (3j): a purchased Gold Shop cosmetic sets one extra
             class on the shelf layout — the default look is its absence */
          var skin = lay === "shelf" && KOS.governor.shelfSkin && KOS.governor.shelfSkin();
          holder.className = lay === "list" ? "med-list" : lay === "shelf" ? "bk-shelves" + (skin ? " " + skin : "") : "med-grid";
          results = rowsOrdered;
          var filtered = filt.status || filt.dnf || fmtSel.value || genreSel.value || moodSel.value || shelfSel.value || search.value;
          countLine.textContent = rowsOrdered.length + " series" +
            (physical ? " with owned volumes" : "") + (filtered ? " (filtered)" : "") +
            (activeShelf ? (reorderMode ? " · drag or ▲▼ to rank this shelf" : " · List layout (no other filters) unlocks ranking") : "");
          if (!rowsOrdered.length) {
            emptyBox = el("div", { class: "med-empty" }, [
              el("p", { class: "fc-empty", text: filtered
                ? "Nothing matches this filter."
                : physical
                  ? "No physical volumes recorded yet — open any series and add what you own (the range tool takes a whole box set in one go), or scan a barcode with ◫ Find book."
                  : "The Books vault is empty. Sync your AniList manga list, import an XML export, look a book up by ISBN, or add a series by hand." }),
              el("div", { class: "lab-controls", style: "justify-content:center" }, [
                el("button", { class: "btn primary", text: "⇅ Sync & Import", onclick: function () { KOS.show("mediasync"); } }),
                el("button", { class: "btn gold", text: "◫ Find book / ISBN", onclick: function () { openLookup(physical, refresh); } }),
                el("button", { class: "btn", text: "+ Add manually", onclick: function () { booksEditor(null, refresh); } })
              ])
            ]);
            holder.appendChild(emptyBox);
            return;
          }
          if (lay === "shelf") {
            rowsOrdered.forEach(function (e) { holder.appendChild(shelfFor(e, refresh)); });
            return;
          }
          startLazy();
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

    var deb = null;
    search.addEventListener("input", function () {
      clearTimeout(deb);
      deb = setTimeout(refresh, 220);
    });
    [fmtSel, genreSel, moodSel, shelfSel].forEach(function (s) { s.addEventListener("change", refresh); });
    sortSel.addEventListener("change", function () { p.sort = sortSel.value; store.save(); refresh(); });

    refresh();
  };

  /* ================= Mangaka pages ================= */
  /* NAME-BASED grouping, deliberately: entries group on the author string,
     whether it arrived from AniList staff data or was typed by hand. Two
     spellings of the same person are two groups — accepted limitation,
     not entity resolution. */
  KOS.views.mangaka = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", {}, [el("span", { class: "kanji-inline", text: "作" }), " Mangaka"]),
      el("p", { class: "sub", text: "Every author across the Books vault — works, volumes owned, chapters read. Grouping is by the author name as written (synced or manual); differing spellings stay separate groups." })
    ]));

    if (!KOS.mediadb.available()) {
      main.appendChild(el("p", { class: "fc-empty", text: "The Collection Matrix needs IndexedDB, which this browser/context doesn't provide." }));
      return;
    }

    KOS.mediadb.query({ module: "books", sort: "title" }, function (err, rows) {
      if (err) { main.appendChild(el("p", { class: "fc-empty", text: "Could not read the vault: " + err.message })); return; }
      if (!rows.length) {
        main.appendChild(el("div", { class: "med-empty" }, [
          el("p", { class: "fc-empty", text: "No books tracked yet — the author pages build themselves from the vault." }),
          el("div", { class: "lab-controls", style: "justify-content:center" }, [
            el("button", { class: "btn primary", text: "本 Open the Books vault", onclick: function () { KOS.show("books"); } })
          ])
        ]));
        return;
      }

      var groups = {};
      rows.forEach(function (e) {
        var a = (e.author || "").trim() || "— unattributed —";
        (groups[a] = groups[a] || []).push(e);
      });
      var names = Object.keys(groups).sort(function (a, b) {
        /* the unattributed bucket sinks to the bottom */
        if (a === "— unattributed —") return 1;
        if (b === "— unattributed —") return -1;
        var va = vols(groups[a]), vb = vols(groups[b]);
        return vb - va || (a < b ? -1 : 1);
      });
      function vols(list) {
        return list.reduce(function (n, e) { return n + (e.physical ? e.physical.volumes.length : 0); }, 0);
      }

      main.appendChild(el("p", { class: "sub med-count", text: (names.length - (groups["— unattributed —"] ? 1 : 0)) + " authors · " + rows.length + " series" }));

      var wall = el("div", { class: "mk-wall" });
      names.forEach(function (name) {
        var works = groups[name];
        var owned = vols(works);
        var chapters = works.reduce(function (n, e) { return n + (e.progress.current || 0); }, 0);
        var spent = works.reduce(function (n, e) {
          return n + (e.physical ? e.physical.volumes.reduce(function (s, v) { return s + (v.price || 0); }, 0) : 0);
        }, 0);
        var scored = works.filter(function (e) { return e.score; });
        var avg = scored.length ? scored.reduce(function (s, e) { return s + e.score; }, 0) / scored.length : 0;

        var card = el("div", { class: "mk-card" }, [
          el("div", { class: "mk-h" }, [
            el("span", { class: "mk-mark", "aria-hidden": "true", style: "--spine:" + spineColor(name), text: name === "— unattributed —" ? "?" : name.slice(0, 1) }),
            el("div", {}, [
              el("b", { class: "mk-name", text: name }),
              el("span", { class: "sub", text: works.length + (works.length === 1 ? " work" : " works") +
                " · " + owned + " vols owned" + (spent ? " · £" + spent.toFixed(0) : "") +
                " · " + chapters + " ch read" + (avg ? " · ★ " + starText(Math.round(avg)) : "") })
            ])
          ]),
          el("div", { class: "mk-works" }, works.map(function (e) {
            var o = ownership(e);
            return el("div", { class: "mk-work", role: "button", tabindex: "0",
              onclick: function () { booksEditor(e, function () { KOS.show("mangaka", undefined, { _nav: true }); }); },
              onkeydown: function (ev) { if (ev.key === "Enter") { ev.preventDefault(); booksEditor(e, function () { KOS.show("mangaka", undefined, { _nav: true }); }); } }
            }, [
              e.coverUrl
                ? el("img", { src: e.coverUrl, alt: "", loading: "lazy", decoding: "async" })
                : el("span", { class: "med-cover-ph mk-ph", "aria-hidden": "true", style: "--spine:" + spineColor(e.title), text: "本" }),
              el("div", { class: "mk-work-body" }, [
                el("span", { class: "mk-work-t", text: e.title }),
                el("span", { class: "sub", text: KOS.media.STATUS_LABEL[e.status] +
                  (o.ownedVols ? " · " + o.ownedVols + " vols" : "") +
                  (e.score ? " · ★ " + starText(e.score) : "") })
              ])
            ]);
          }))
        ]);
        wall.appendChild(card);
      });
      main.appendChild(wall);
    });

    main.appendChild(el("div", { class: "lab-controls", style: "margin-top:14px" }, [
      el("button", { class: "btn", text: "← Books vault", onclick: function () { KOS.show("books"); } })
    ]));
  };
})();
