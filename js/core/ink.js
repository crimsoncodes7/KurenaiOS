/* Kurenai OS — core/ink.js
   The ink engine's model (roadmap 6.1, docs/ipad-plan.md §3, design turn
   30): documents of A4 pages, pages of items (strokes, text, pictures),
   the pure geometry every surface draws with, and the store.

   ONE ENGINE (draft invariant 132). Every place a pen writes is a mount of
   KOS.ink with a DOC KEY: "topic:<sid>:<ref>" (a topic's Handwritten tab),
   later "answer:<uid>:<q>", "paper:<fileId>", "review:<rowId>". No surface
   keeps its own ink. The surface, the toolbar and the gestures are
   js/core/inkui.js; the Handwritten tab is js/modules/inktab.js.

   A page is W units wide (1000) and H tall: an A4 sheet is 1000 × 1414,
   whatever size it is drawn at; a page with its own `h` is another shape
   (an answer strip, a PDF page at the PDF's own proportions, a pad that
   grows). An item:
     stroke {id, k:"pen"|"hl", role, w (0 Fine · 1 Medium · 2 Bold),
             p: [x, y, pr, dt, …] — x and y in tenths of a unit, pr the
             pen's pressure 1–255 (0 = it reported none), dt the ms since
             the point before; sh: "line"|"rect"|"tri"|"ellipse" once
             snapped}
     text   {id, k:"text", role, x, y, s}
     image  {id, k:"img", x, y, w, h, src (a data URL)}
   A colour is a ROLE (ink, accent, teal, amber, green; highlighters amber,
   teal, bloom), never a hex: it is read live from the theme (draft
   invariant 133), so a page reads in Dawn, Graphite and every shop theme.

   Storage is its own IndexedDB, `kurenai-os-ink` (draft invariant 136):
   `docs` {key, pages: [pageId…], paper, inked: {pageId: n}, at, title?,
   local?} and `pages` {id, doc, paper, h?, items, at, created}; since v2
   also `base` (each page as cloud and device last agreed, for the
   per-stroke three-way merge of js/core/inksync.js) and `dead`
   (tombstones of deleted pages and docs, so a deletion replicates). A doc
   marked `local` (a past paper kept "this device only", decision D) never
   leaves the device. It is never in the synced state
   document; it rides the full backup. Writing moves no XP, gold or HP and
   logs no session (draft invariant 134).                                  */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var W = 1000, H = 1414;
  var PAPERS = [
    ["blank", "Blank"], ["lined", "Lined"], ["squared", "Squared 5 mm"],
    ["dotted", "Dotted"], ["cornell", "Cornell"], ["booklet", "Answer booklet"]
  ];
  var PEN_ROLES = [["ink", "Ink"], ["accent", "Accent"], ["teal", "Teal"], ["amber", "Amber"], ["green", "Green"]];
  var HL_ROLES = [["amber", "Amber"], ["teal", "Teal"], ["bloom", "Bloom"]];
  var WIDTHS = [["Fine", 0.4], ["Medium", 0.6], ["Bold", 1.0]];
  /* a millimetre of an A4 page in units; a pen width in mm becomes units */
  var MM = W / 210;
  var HL_WIDTH = 5 * MM, HL_ALPHA = 0.36;

  function uid() {
    var a = new Uint8Array(8);
    try { (window.crypto || {}).getRandomValues(a); } catch (e) { for (var i = 0; i < 8; i++) a[i] = Math.random() * 256; }
    return Array.prototype.map.call(a, function (b) { return (b + 256).toString(16).slice(1); }).join("");
  }

  /* ================= geometry (pure; also in Node) ================= */

  /* unpack a stroke's points: [{x, y, pr, dt}] in page units */
  function pts(s) {
    var p = s.p || [], out = [];
    for (var i = 0; i + 3 < p.length; i += 4) out.push({ x: p[i] / 10, y: p[i + 1] / 10, pr: p[i + 2] || 0, dt: p[i + 3] || 0 });
    return out;
  }
  function pack(list) {
    var p = [];
    list.forEach(function (q) {
      p.push(Math.round(q.x * 10), Math.round(q.y * 10), Math.max(0, Math.min(255, Math.round(q.pr || 0))), Math.max(0, Math.min(60000, Math.round(q.dt || 0))));
    });
    return p;
  }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  /* the width of each point: pressure when the pen reports it, else speed
     (faster is thinner) — the Metapen and the USB-C Pencil send none.
     Deterministic from the stored points, so a page always redraws the
     same. Ends taper over a few points. */
  function widths(list, base) {
    var n = list.length, out = new Array(n), hasPr = list.some(function (q) { return q.pr > 0; });
    for (var i = 0; i < n; i++) {
      var f;
      if (hasPr) f = 0.5 + 0.9 * (list[i].pr / 255);
      else {
        var a = list[Math.max(0, i - 1)], b = list[Math.min(n - 1, i + 1)];
        var t = 0;
        for (var j = Math.max(1, i); j <= Math.min(n - 1, i + 1); j++) t += list[j].dt;
        var v = t > 0 ? dist(a, b) / t : 0;
        f = Math.max(0.62, Math.min(1.12, 1.12 - v * 0.55));
      }
      var taper = Math.min(1, 0.55 + 0.15 * Math.min(i, n - 1 - i));
      out[i] = base * f * (n > 6 ? taper : 1);
    }
    /* smooth the widths so a speed jump is not a step */
    for (var k = 1; k < n - 1; k++) out[k] = (out[k - 1] + 2 * out[k] + out[k + 1]) / 4;
    return out;
  }
  /* a light smoothing of the path itself (two passes of 1-2-1) */
  function smooth(list) {
    if (list.length < 3) return list.slice();
    var a = list;
    for (var pass = 0; pass < 2; pass++) {
      var b = [a[0]];
      for (var i = 1; i < a.length - 1; i++) b.push({ x: (a[i - 1].x + 2 * a[i].x + a[i + 1].x) / 4, y: (a[i - 1].y + 2 * a[i].y + a[i + 1].y) / 4, pr: a[i].pr, dt: a[i].dt });
      b.push(a[a.length - 1]);
      a = b;
    }
    return a;
  }
  function baseWidth(s) {
    if (s.k === "hl") return HL_WIDTH;
    return (WIDTHS[s.w == null ? 1 : s.w] || WIDTHS[1])[1] * MM;
  }

  /* Ramer–Douglas–Peucker: the corners of a hand-drawn line */
  function rdp(list, eps) {
    if (list.length < 3) return list.slice();
    var a = list[0], b = list[list.length - 1], best = 0, at = 0;
    for (var i = 1; i < list.length - 1; i++) {
      var d = segDist(list[i], a, b);
      if (d > best) { best = d; at = i; }
    }
    if (best <= eps) return [a, b];
    var l = rdp(list.slice(0, at + 1), eps), r = rdp(list.slice(at), eps);
    return l.slice(0, -1).concat(r);
  }
  function segDist(p, a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
    var t = L ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L)) : 0;
    return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
  }
  function bbox(list) {
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    list.forEach(function (q) { x0 = Math.min(x0, q.x); y0 = Math.min(y0, q.y); x1 = Math.max(x1, q.x); y1 = Math.max(y1, q.y); });
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  /* Shape snap (30a: hold the pen still 400 ms at the end of a stroke, or
     the Shape tool): a line, a rectangle, a triangle or an ellipse, else
     nothing. Returns {sh, pts} in page units, or null. */
  function snap(list) {
    if (list.length < 4) return null;
    var b = bbox(list), d = Math.hypot(b.w, b.h);
    if (d < 12) return null;
    var closed = dist(list[0], list[list.length - 1]) < 0.22 * d;
    if (!closed) {
      var c = rdp(list, 0.07 * d);
      if (c.length !== 2) return null;
      var a = c[0], e = c[1], ang = Math.atan2(e.y - a.y, e.x - a.x);
      /* within 8° of level or upright, it is level or upright */
      var step = Math.PI / 2, near = Math.round(ang / step) * step;
      if (Math.abs(ang - near) < 8 * Math.PI / 180) {
        var len = dist(a, e);
        e = { x: a.x + Math.cos(near) * len, y: a.y + Math.sin(near) * len };
      }
      return { sh: "line", pts: [a, e] };
    }
    var loop = list.concat([list[0]]);
    var cs = rdp(loop, 0.1 * d);
    var corners = cs.length - 1; /* the closing point repeats the first */
    if (corners === 3) return { sh: "tri", pts: cs.slice(0, 3).concat([cs[0]]) };
    if (corners === 4) {
      /* near-level sides: the bounding box; else the four corners */
      var lev = cs.slice(0, 4).every(function (p, i) {
        var q = cs[i + 1], ang = Math.atan2(q.y - p.y, q.x - p.x);
        return Math.abs(Math.sin(2 * ang)) < Math.sin(16 * Math.PI / 180);
      });
      if (lev) return { sh: "rect", pts: [{ x: b.x, y: b.y }, { x: b.x + b.w, y: b.y }, { x: b.x + b.w, y: b.y + b.h }, { x: b.x, y: b.y + b.h }, { x: b.x, y: b.y }] };
      return { sh: "rect", pts: cs.slice(0, 4).concat([cs[0]]) };
    }
    /* round: an ellipse in the box, a circle when the sides are close */
    var rx = b.w / 2, ry = b.h / 2;
    if (Math.abs(rx - ry) < 0.15 * Math.max(rx, ry)) rx = ry = (rx + ry) / 2;
    var cx = b.x + b.w / 2, cy = b.y + b.h / 2, out = [];
    for (var i = 0; i <= 48; i++) { var t = i / 48 * Math.PI * 2; out.push({ x: cx + rx * Math.cos(t), y: cy + ry * Math.sin(t) }); }
    return { sh: "ellipse", pts: out };
  }

  /* the eraser (30b): "partial" splits a stroke where it is touched, a
     run of untouched points staying a stroke of its own; "stroke" takes
     the whole stroke. Returns the new item list, or null for no change. */
  function erase(items, x, y, r, mode) {
    var changed = false, out = [];
    items.forEach(function (it) {
      if (it.k !== "pen" && it.k !== "hl") {
        if (mode === "stroke" && hitItem(it, x, y, r)) { changed = true; return; }
        out.push(it); return;
      }
      var list = pts(it), pad = r + baseWidth(it) / 2, hit = list.map(function (q, i) {
        if (Math.hypot(q.x - x, q.y - y) <= pad) return true;
        return i > 0 && segDist({ x: x, y: y }, list[i - 1], q) <= pad;
      });
      if (!hit.some(Boolean)) { out.push(it); return; }
      changed = true;
      if (mode === "stroke" || it.sh) return;
      var run = [];
      function flush() {
        if (run.length >= 2) out.push(Object.assign({}, it, { id: uid(), p: pack(run) }));
        run = [];
      }
      list.forEach(function (q, i) { if (hit[i]) flush(); else run.push(q); });
      flush();
    });
    return changed ? out : null;
  }
  function itemBox(it) {
    if (it.k === "pen" || it.k === "hl") {
      var b = bbox(pts(it)), pad = baseWidth(it) / 2;
      return { x: b.x - pad, y: b.y - pad, w: b.w + 2 * pad, h: b.h + 2 * pad };
    }
    if (it.k === "text") {
      var lines = String(it.s || "").split("\n");
      var wide = Math.max.apply(null, lines.map(function (l) { return l.length; }));
      return { x: it.x, y: it.y, w: Math.max(20, wide * TEXT_SIZE * 0.52), h: lines.length * TEXT_SIZE * 1.3 };
    }
    return { x: it.x, y: it.y, w: it.w, h: it.h };
  }
  var TEXT_SIZE = 22;
  function hitItem(it, x, y, r) {
    var b = itemBox(it);
    return x >= b.x - r && x <= b.x + b.w + r && y >= b.y - r && y <= b.y + b.h + r;
  }
  function inPoly(poly, x, y) {
    var c = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var a = poly[i], b = poly[j];
      if (((a.y > y) !== (b.y > y)) && (x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x)) c = !c;
    }
    return c;
  }
  /* the lasso: an item is taken when most of it is inside the loop */
  function lassoPick(items, poly) {
    if (poly.length < 3) return [];
    return items.filter(function (it) {
      if (it.k === "pen" || it.k === "hl") {
        var list = pts(it), n = 0;
        list.forEach(function (q) { if (inPoly(poly, q.x, q.y)) n++; });
        return n >= Math.max(1, list.length * 0.6);
      }
      var b = itemBox(it);
      return inPoly(poly, b.x + b.w / 2, b.y + b.h / 2);
    }).map(function (it) { return it.id; });
  }
  /* move and scale the chosen items (the lasso's Move and Resize) */
  function transform(items, ids, fn) {
    var set = {};
    ids.forEach(function (id) { set[id] = 1; });
    return items.map(function (it) {
      if (!set[it.id]) return it;
      if (it.k === "pen" || it.k === "hl") {
        var moved = pts(it).map(function (q) { var m = fn(q.x, q.y); return { x: m.x, y: m.y, pr: q.pr, dt: q.dt }; });
        return Object.assign({}, it, { p: pack(moved) });
      }
      var a = fn(it.x, it.y), copy = Object.assign({}, it, { x: a.x, y: a.y });
      if (it.k === "img") { var b = fn(it.x + it.w, it.y + it.h); copy.w = Math.max(8, b.x - a.x); copy.h = Math.max(8, b.y - a.y); }
      return copy;
    });
  }
  function boxOf(items, ids) {
    var set = {}, x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    ids.forEach(function (id) { set[id] = 1; });
    items.forEach(function (it) {
      if (!set[it.id]) return;
      var b = itemBox(it);
      x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h);
    });
    return x0 === Infinity ? null : { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  }

  /* ================= the store ================= */
  var DB_NAME = "kurenai-os-ink" + ((KOS.dataMode && KOS.dataMode.suffix) || ""), DB_VER = 2;
  var db = null, index = {}, loaded = false, loading = false, waiting = [];
  function available() { return !!window.indexedDB; }
  function open(cb) {
    if (!available()) { cb(new Error("IndexedDB unavailable")); return; }
    if (db) { cb(null, db); return; }
    var rq = window.indexedDB.open(DB_NAME, DB_VER);
    rq.onupgradeneeded = function (e) {
      var d = e.target.result;
      if (!d.objectStoreNames.contains("docs")) d.createObjectStore("docs", { keyPath: "key" });
      if (!d.objectStoreNames.contains("pages")) d.createObjectStore("pages", { keyPath: "id" }).createIndex("doc", "doc", { unique: false });
      if (!d.objectStoreNames.contains("base")) d.createObjectStore("base", { keyPath: "id" });
      if (!d.objectStoreNames.contains("dead")) d.createObjectStore("dead", { keyPath: "id" });
    };
    rq.onsuccess = function () {
      db = rq.result;
      db.onversionchange = function () { db.close(); db = null; };
      cb(null, db);
    };
    rq.onerror = function () { cb(rq.error); };
  }
  function tx(stores, mode, fn, done) {
    open(function (err, d) {
      if (err) { if (done) done(err); return; }
      var t;
      try { t = d.transaction(stores, mode); } catch (e) { if (done) done(e); return; }
      var out;
      t.oncomplete = function () { if (done) done(null, out); };
      t.onerror = t.onabort = function () { if (done) done(t.error || new Error("ink write failed")); done = null; };
      out = fn(t);
    });
  }
  function req(r, cb) { r.onsuccess = function () { cb(r.result); }; }

  /* the doc index is small (one row a notebook) and kept in memory, so the
     tab's count and the inspector's "Pages written" read synchronously */
  function ready(cb) {
    if (loaded) { if (cb) cb(); return; }
    if (cb) waiting.push(cb);
    if (loading) return;
    loading = true;
    if (!available()) { loaded = true; flushWaiting(); return; }
    tx(["docs"], "readonly", function (t) {
      req(t.objectStore("docs").getAll(), function (rows) { (rows || []).forEach(function (d) { index[d.key] = d; }); });
    }, function () { loaded = true; flushWaiting(); notify(null); });
  }
  function flushWaiting() { var w = waiting; waiting = []; w.forEach(function (f) { try { f(); } catch (e) { /* a listener's own error */ } }); }

  function notify(key) {
    try { window.dispatchEvent(new CustomEvent("kos-ink", { detail: { doc: key } })); } catch (e) { /* no events */ }
  }
  function doc(key) { return index[key] || null; }
  /* "Pages written": pages with ink, and when the last was written (null
     with none, so nothing prints a zero; invariant 77) */
  /* a page not saved yet: a blank sheet the first stroke turns into page 1 */
  function blankPage(key, paper, h) {
    var p = { id: uid(), doc: key, paper: paper || (index[key] && index[key].paper) || "lined", items: [], at: 0, created: 0 };
    if (h) p.h = h;
    return p;
  }
  function pageH(p) { return (p && p.h > 0) ? p.h : H; }
  function written(key) {
    var d = index[key];
    if (!d) return null;
    var n = d.pages.filter(function (id) { return (d.inked || {})[id] > 0; }).length;
    return n ? { n: n, at: d.at || 0 } : null;
  }
  function putDoc(t, d) { index[d.key] = d; t.objectStore("docs").put(d); }

  function listPages(key, cb) {
    var d = index[key];
    if (!d || !d.pages.length) { cb(null, []); return; }
    tx(["pages"], "readonly", function (t) {
      var out = [], os = t.objectStore("pages");
      d.pages.forEach(function (id, i) { req(os.get(id), function (p) { out[i] = p || null; }); });
      return out;
    }, function (err, out) { cb(err, (out || []).filter(Boolean)); });
  }
  function getPage(id, cb) {
    tx(["pages"], "readonly", function (t) { var box = {}; req(t.objectStore("pages").get(id), function (p) { box.p = p; }); return box; },
      function (err, box) { cb(err, box && box.p || null); });
  }
  /* a new page at `at` (default the end), the doc made with it */
  function addPage(key, opts, cb) {
    opts = opts || {};
    var d = index[key] ? JSON.parse(JSON.stringify(index[key])) : { key: key, pages: [], paper: opts.paper || "lined", inked: {}, at: 0 };
    var now = Date.now(), page = { id: uid(), doc: key, paper: opts.paper || d.paper || "lined", items: opts.items || [], at: now, created: now };
    if (opts.h) page.h = opts.h;
    if (opts.title && !d.title) d.title = opts.title;
    var at = opts.at == null ? d.pages.length : Math.max(0, Math.min(d.pages.length, opts.at));
    d.pages.splice(at, 0, page.id);
    if (page.items.length) { d.inked[page.id] = page.items.length; d.at = now; }
    tx(["docs", "pages"], "readwrite", function (t) { t.objectStore("pages").put(page); putDoc(t, d); },
      function (err) { if (!err) notify(key); if (cb) cb(err, page); });
  }
  /* save a page's items; the doc's count follows */
  function savePage(page, cb) {
    /* the first stroke on a notebook's empty page makes the notebook: the
       tab writes nothing until the pen does (30c) */
    var d = index[page.doc] ? JSON.parse(JSON.stringify(index[page.doc])) : { key: page.doc, pages: [], paper: page.paper || "lined", inked: {}, at: 0 };
    if (d.pages.indexOf(page.id) < 0) { d.pages.push(page.id); page.created = page.created || Date.now(); }
    var n = (page.items || []).length, was = (d.inked || {})[page.id] || 0;
    page.at = Date.now();
    d.inked = d.inked || {};
    if (n) d.inked[page.id] = n; else delete d.inked[page.id];
    if (n !== was || n) d.at = page.at;
    if (page.paper) d.paper = d.paper || page.paper;
    tx(["docs", "pages"], "readwrite", function (t) { t.objectStore("pages").put(page); putDoc(t, d); },
      function (err) {
        if (!err && (n > 0) !== (was > 0)) notify(page.doc);
        if (!err && KOS.inkSync) KOS.inkSync.soon();
        if (cb) cb(err);
      });
  }
  function setDocPaper(key, paper) {
    if (!index[key]) return;
    var d = Object.assign({}, index[key], { paper: paper });
    tx(["docs"], "readwrite", function (t) { putDoc(t, d); });
  }
  function movePage(key, from, to, cb) {
    var d = index[key];
    if (!d || from === to || from < 0 || to < 0 || from >= d.pages.length || to >= d.pages.length) { if (cb) cb(null); return; }
    d = JSON.parse(JSON.stringify(d));
    var id = d.pages.splice(from, 1)[0];
    d.pages.splice(to, 0, id);
    tx(["docs"], "readwrite", function (t) { putDoc(t, d); }, function (err) { if (!err) notify(key); if (cb) cb(err); });
  }
  function deletePage(key, id, cb) {
    var d = index[key];
    if (!d) { if (cb) cb(null); return; }
    d = JSON.parse(JSON.stringify(d));
    d.pages = d.pages.filter(function (x) { return x !== id; });
    delete d.inked[id];
    tx(["docs", "pages", "dead"], "readwrite", function (t) {
      t.objectStore("pages").delete(id); putDoc(t, d);
      t.objectStore("dead").put({ id: id, kind: "page", doc: key, at: Date.now() });
    }, function (err) { if (!err) notify(key); if (cb) cb(err); });
  }
  /* a whole doc and its pages (an answer pad abandoned, a working page
     deleted); its tombstones replicate the deletion */
  function deleteDoc(key, cb) {
    var d = index[key];
    if (!d) { if (cb) cb(null); return; }
    delete index[key];
    tx(["docs", "pages", "dead"], "readwrite", function (t) {
      var now = Date.now();
      d.pages.forEach(function (id) { t.objectStore("pages").delete(id); t.objectStore("dead").put({ id: id, kind: "page", doc: key, at: now }); });
      t.objectStore("docs").delete(key);
      t.objectStore("dead").put({ id: "doc:" + key, kind: "doc", doc: key, at: now });
    }, function (err) { if (!err) notify(key); if (cb) cb(err); });
  }
  /* a doc's own words: a title ("Blurt", "Working · Q3"), `local` for a
     paper kept on this device, `meta` for the surface that owns it */
  function setDocMeta(key, patch, cb) {
    var d = index[key] ? JSON.parse(JSON.stringify(index[key])) : { key: key, pages: [], paper: "lined", inked: {}, at: 0 };
    Object.keys(patch || {}).forEach(function (k) { if (patch[k] == null) delete d[k]; else d[k] = patch[k]; });
    tx(["docs"], "readwrite", function (t) { putDoc(t, d); }, function (err) { if (!err) notify(key); if (cb) cb(err); });
  }
  /* every doc whose key starts with `prefix`, newest first: an item's
     earlier working, a paper's attempts */
  function docsWith(prefix) {
    return Object.keys(index).filter(function (k) { return k.indexOf(prefix) === 0; })
      .map(function (k) { return index[k]; }).sort(function (a, b) { return (b.at || b.created || 0) - (a.at || a.created || 0); });
  }
  function allDocs() { return Object.keys(index).map(function (k) { return index[k]; }); }
  function duplicatePage(key, id, cb) {
    var d = index[key];
    if (!d) { if (cb) cb(null); return; }
    getPage(id, function (err, p) {
      if (err || !p) { if (cb) cb(err); return; }
      addPage(key, { paper: p.paper, at: d.pages.indexOf(id) + 1, items: p.items.map(function (it) { return Object.assign({}, it, { id: uid() }); }) }, cb);
    });
  }

  /* a picture added to a notebook without a surface open (a region of a
     file clipped to a topic, asked for 26 October 2026): under the last
     ink of the last page, or on a new page when it does not fit */
  function appendImage(key, item, cb) {
    ready(function () {
      listPages(key, function (err, pages) {
        if (err) { if (cb) cb(err); return; }
        var last = pages[pages.length - 1];
        var box = last && last.items.length ? boxOf(last.items, last.items.map(function (x) { return x.id; })) : null;
        var y = box ? box.y + box.h + 30 : 60;
        var it = Object.assign({ id: uid(), k: "img", x: 60 }, item);
        if (!last || y + it.h > pageH(last) - 40) {
          it.y = 60;
          addPage(key, { paper: (index[key] && index[key].paper) || "lined", items: [it] }, function (e2, page) { if (cb) cb(e2, page, 0); });
          return;
        }
        it.y = Math.round(y);
        last.items = last.items.concat([it]);
        savePage(last, function (e3) { notify(key); if (cb) cb(e3, last, pages.length - 1); });
      });
    });
  }

  /* the full backup (store.snapshotFull / importFull) */
  function exportAll(cb) {
    if (!available()) { cb(null, null); return; }
    tx(["docs", "pages"], "readonly", function (t) {
      var out = {};
      req(t.objectStore("docs").getAll(), function (r) { out.docs = r; });
      req(t.objectStore("pages").getAll(), function (r) { out.pages = r; });
      return out;
    }, cb);
  }
  /* the sync engine's own reads and writes (js/core/inksync.js): the base
     copies and tombstones, and a page put from the cloud */
  function syncRead(cb) {
    if (!available()) { cb(null, { docs: [], pages: [], base: [], dead: [] }); return; }
    tx(["docs", "pages", "base", "dead"], "readonly", function (t) {
      var out = {};
      ["docs", "pages", "base", "dead"].forEach(function (n) { req(t.objectStore(n).getAll(), function (r) { out[n] = r || []; }); });
      return out;
    }, cb);
  }
  function syncWrite(w, cb) {
    tx(["docs", "pages", "base", "dead"], "readwrite", function (t) {
      (w.pages || []).forEach(function (p) { t.objectStore("pages").put(p); });
      (w.dropPages || []).forEach(function (id) { t.objectStore("pages").delete(id); });
      (w.base || []).forEach(function (b) { t.objectStore("base").put(b); });
      (w.dropBase || []).forEach(function (id) { t.objectStore("base").delete(id); });
      (w.docs || []).forEach(function (d) { putDoc(t, d); });
      (w.dropDocs || []).forEach(function (k) { delete index[k]; t.objectStore("docs").delete(k); });
      (w.dead || []).forEach(function (x) { t.objectStore("dead").put(x); });
    }, function (err) {
      if (!err) {
        var keys = {};
        (w.docs || []).forEach(function (d) { keys[d.key] = 1; });
        (w.pages || []).forEach(function (p) { keys[p.doc] = 1; });
        (w.dropDocs || []).forEach(function (k) { keys[k] = 1; });
        Object.keys(keys).forEach(notify);
        try { window.dispatchEvent(new CustomEvent("kos-ink-sync", { detail: { pages: (w.pages || []).map(function (p) { return p.id; }) } })); } catch (e) { /* no events */ }
      }
      if (cb) cb(err);
    });
  }
  function importAll(dump, cb) {
    if (!dump || !Array.isArray(dump.docs) || !Array.isArray(dump.pages)) { cb(null, { docs: 0, pages: 0 }); return; }
    tx(["docs", "pages"], "readwrite", function (t) {
      dump.pages.forEach(function (p) { if (p && typeof p.id === "string" && typeof p.doc === "string" && Array.isArray(p.items)) t.objectStore("pages").put(p); });
      dump.docs.forEach(function (d) { if (d && typeof d.key === "string" && Array.isArray(d.pages)) putDoc(t, d); });
    }, function (err) {
      if (!err) Object.keys(index).forEach(notify);
      cb(err, { docs: dump.docs.length, pages: dump.pages.length });
    });
  }

  /* the page's own units for the surfaces */
  KOS.ink = {
    W: W, H: H, MM: MM, pageH: pageH, PAPERS: PAPERS, PEN_ROLES: PEN_ROLES, HL_ROLES: HL_ROLES, WIDTHS: WIDTHS,
    HL_WIDTH: HL_WIDTH, HL_ALPHA: HL_ALPHA, TEXT_SIZE: TEXT_SIZE,
    uid: uid,
    topicDoc: function (sid, ref) { return "topic:" + sid + ":" + ref; },
    geo: { pts: pts, pack: pack, widths: widths, smooth: smooth, baseWidth: baseWidth, rdp: rdp, bbox: bbox, snap: snap,
      erase: erase, lassoPick: lassoPick, inPoly: inPoly, transform: transform, boxOf: boxOf, itemBox: itemBox, hitItem: hitItem },
    available: available, ready: ready, doc: doc, written: written,
    listPages: listPages, getPage: getPage, blankPage: blankPage, addPage: addPage, savePage: savePage, setDocPaper: setDocPaper,
    movePage: movePage, deletePage: deletePage, duplicatePage: duplicatePage,
    deleteDoc: deleteDoc, setDocMeta: setDocMeta, docsWith: docsWith, allDocs: allDocs, appendImage: appendImage,
    exportAll: exportAll, importAll: importAll, syncRead: syncRead, syncWrite: syncWrite, notify: notify,
    _reset: function () { if (db) { try { db.close(); } catch (e) { /* closed */ } } db = null; index = {}; loaded = false; loading = false; waiting = []; }
  };
})();
