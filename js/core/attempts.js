/* Kurenai OS — core/attempts.js · KOS.attempts
   Recorded attempts (docs/exams-rework-plan.md §8.1–8.2, decision D1).

   While a paper, a set of questions or one timed question runs in the app,
   this records what happened to each PART as events — never video, never
   the ink itself (that stays in kurenai-os-ink): when a part was opened,
   every stroke (its start time and length), erasures, undos, keystrokes,
   flags, pauses and the end. From the events `figures()` derives, the same
   way every time and with no model, the time to the first mark, writing
   time, idle gaps, returns, minutes per mark against the paper's budget,
   the order and the pacing line. Marks, when the attempt is marked, add
   what was lost where.

   Record (one row of IndexedDB `kurenai-os-attempts`, keyPath `uid`):
     {uid, kind: "paper"|"set"|"question", aid, title, board, paper, seed,
      started, ended, allowedMs, budget (min a mark),
      parts: [{id, label, marks, topic, command}],
      ev: [[t, code, part, x]]  t = ms since `started`; codes:
        o open · s stroke (x = ms) · e erase · u undo · k keys (x = count)
        f flag (x = 1 on, 0 off) · p pause · r resume · z end
      marks: {part: got} · by: "self"|"teacher" · tracker (the attempt uid)
      feedback: {id: {...}} (KOS.reviewPack.parse) · updatedAt}

   Ink reaches it through the window event `kos-ink-act` that the ink UI
   fires for each stroke, erasure and undo ({doc, kind, t0, dur}); a doc is
   tied to a part by `bindDoc`. Typed answers call `keys`. Nothing is sent
   anywhere; the store rides the full backup and is in the store registry
   (invariant 7). Replication to `kos_attempts` (D1) is the next batch.  */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var DB_NAME = "kurenai-os-attempts" + ((KOS.dataMode && KOS.dataMode.suffix) || ""), DB_VER = 1;
  var OS = "att";
  var db = null;
  var MAX_EV = 20000;
  var IDLE_MS = 20000;
  var CODES = { o: 1, s: 1, e: 1, u: 1, k: 1, f: 1, p: 1, r: 1, z: 1 };

  function available() { return !!window.indexedDB; }
  function open(cb) {
    if (!available()) { cb(new Error("IndexedDB unavailable")); return; }
    if (db) { cb(null, db); return; }
    var rq = window.indexedDB.open(DB_NAME, DB_VER);
    rq.onupgradeneeded = function (e) {
      var d = e.target.result;
      if (!d.objectStoreNames.contains(OS)) {
        var os = d.createObjectStore(OS, { keyPath: "uid" });
        os.createIndex("aid", "aid", { unique: false });
        os.createIndex("started", "started", { unique: false });
      }
    };
    rq.onsuccess = function () { db = rq.result; db.onversionchange = function () { db.close(); db = null; }; cb(null, db); };
    rq.onerror = function () { cb(rq.error); };
  }
  function txn(mode, fn) {
    open(function (err, d) {
      if (err) { fn(err); return; }
      try { fn(null, d.transaction(OS, mode)); } catch (e) { fn(e); }
    });
  }
  function rid() {
    var a = new Uint8Array(8);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(a);
    else for (var i = 0; i < 8; i++) a[i] = Math.floor(Math.random() * 256);
    return Array.prototype.map.call(a, function (b) { return (b < 16 ? "0" : "") + b.toString(16); }).join("");
  }
  function str(v, n) { return typeof v === "string" ? v.slice(0, n || 200) : v == null ? "" : String(v).slice(0, n || 200); }
  function numOr(v, d) { v = +v; return isFinite(v) ? v : d; }

  /* ---------- the record's gate ---------- */
  function normalise(r) {
    if (!r || typeof r.uid !== "string" || !/^[0-9a-f]{8,32}$/.test(r.uid)) return null;
    var parts = Array.isArray(r.parts) ? r.parts.slice(0, 200).map(function (p) {
      return p && p.id != null ? { id: str(p.id, 24), label: str(p.label || p.id, 40), marks: Math.max(0, numOr(p.marks, 0)),
        topic: str(p.topic, 60), command: str(p.command, 30) } : null;
    }).filter(Boolean) : [];
    var ev = Array.isArray(r.ev) ? r.ev.filter(function (x) {
      return Array.isArray(x) && isFinite(+x[0]) && CODES[x[1]];
    }).slice(0, MAX_EV).map(function (x) { return [Math.max(0, Math.round(+x[0])), x[1], x[2] == null ? "" : str(x[2], 24), x[3] == null ? null : +x[3]]; }) : [];
    var marks = {};
    if (r.marks && typeof r.marks === "object") Object.keys(r.marks).forEach(function (k) { var v = +r.marks[k]; if (isFinite(v)) marks[str(k, 24)] = v; });
    return {
      uid: r.uid, kind: ["paper", "set", "question"].indexOf(r.kind) >= 0 ? r.kind : "paper",
      aid: r.aid == null ? null : str(r.aid, 40), title: str(r.title, 120), board: str(r.board, 20), paper: str(r.paper, 40),
      seed: r.seed == null ? null : str(r.seed, 40), started: numOr(r.started, 0), ended: r.ended == null ? null : numOr(r.ended, null),
      allowedMs: r.allowedMs == null ? null : Math.max(0, numOr(r.allowedMs, 0)), budget: Math.max(0, numOr(r.budget, 0)),
      parts: parts, ev: ev, marks: marks, by: r.by === "teacher" ? "teacher" : r.by === "self" ? "self" : null,
      tracker: r.tracker == null ? null : str(r.tracker, 40),
      feedback: r.feedback && typeof r.feedback === "object" ? r.feedback : {},
      updatedAt: numOr(r.updatedAt, 0)
    };
  }

  /* ---------- the live recorders on this page ---------- */
  var live = {};          // uid → record
  var docs = {};          // ink doc key → {uid, part}
  var saveT = {};
  function persist(uid, now) {
    var r = live[uid];
    if (!r) return;
    clearTimeout(saveT[uid]);
    var go = function () { delete saveT[uid]; r.updatedAt = Date.now(); put(r, function () {}); };
    if (now) go(); else saveT[uid] = setTimeout(go, 1500);
  }
  function begin(meta) {
    meta = meta || {};
    var r = normalise({ uid: rid(), kind: meta.kind, aid: meta.aid, title: meta.title, board: meta.board, paper: meta.paper,
      seed: meta.seed, started: meta.started || Date.now(), allowedMs: meta.allowedMs, budget: meta.budget, parts: meta.parts, ev: [] });
    live[r.uid] = r;
    persist(r.uid, true);
    return r.uid;
  }
  /* pick a recorder up again after a reload (it was saved as it went) */
  function resume(uid, cb) {
    if (live[uid]) { cb && cb(null, live[uid]); return; }
    get(uid, function (err, r) {
      if (!err && r && !r.ended) live[uid] = r;
      cb && cb(err, live[uid] || null);
    });
  }
  function log(uid, code, part, x, at) {
    var r = live[uid];
    if (!r || r.ended || !CODES[code] || r.ev.length >= MAX_EV) return false;
    var t = Math.max(0, Math.round((at || Date.now()) - r.started));
    r.ev.push([t, code, part == null ? "" : String(part), x == null ? null : +x]);
    persist(uid, code === "z" || code === "p");
    return true;
  }
  function openPart(uid, part, at) { return log(uid, "o", part, null, at); }
  function keys(uid, part, n, at) { return log(uid, "k", part, n || 1, at); }
  function flag(uid, part, on, at) { return log(uid, "f", part, on ? 1 : 0, at); }
  function pause(uid, at) { return log(uid, "p", "", null, at); }
  function resumeClock(uid, at) { return log(uid, "r", "", null, at); }
  function end(uid, at) {
    var r = live[uid];
    if (!r || r.ended) return false;
    log(uid, "z", "", null, at);
    r.ended = at || Date.now();
    Object.keys(docs).forEach(function (k) { if (docs[k].uid === uid) delete docs[k]; });
    persist(uid, true);
    delete live[uid];
    return true;
  }
  function bindDoc(uid, doc, part) { if (doc) docs[doc] = { uid: uid, part: String(part) }; }
  function unbindDoc(doc) { delete docs[doc]; }
  function current() {
    var ids = Object.keys(live);
    return ids.length ? live[ids[ids.length - 1]] : null;
  }
  /* the ink UI's event: a stroke, an erasure or an undo on a bound doc */
  function onInk(e) {
    var d = e && e.detail;
    if (!d || !d.doc || !docs[d.doc]) return;
    var b = docs[d.doc];
    if (d.kind === "stroke") log(b.uid, "s", b.part, Math.max(0, Math.round(+d.dur || 0)), +d.t0 || Date.now());
    else if (d.kind === "erase") log(b.uid, "e", b.part, null, d.at);
    else if (d.kind === "undo") log(b.uid, "u", b.part, null, d.at);
  }
  if (typeof window.addEventListener === "function") {
    window.addEventListener("kos-ink-act", onInk);
    window.addEventListener("pagehide", function () { Object.keys(live).forEach(function (u) { persist(u, true); }); });
  }

  /* ---------- the store ---------- */
  function put(r, cb) {
    var n = normalise(r);
    if (!n) { cb && cb(new Error("not an attempt")); return; }
    txn("readwrite", function (err, t) {
      if (err) { cb && cb(err); return; }
      t.objectStore(OS).put(n);
      t.oncomplete = function () { cb && cb(null, n); };
      t.onerror = function () { cb && cb(t.error); };
    });
  }
  function get(uid, cb) {
    if (live[uid]) { cb(null, live[uid]); return; }
    txn("readonly", function (err, t) {
      if (err) { cb(err); return; }
      var rq = t.objectStore(OS).get(uid);
      rq.onsuccess = function () { cb(null, rq.result ? normalise(rq.result) : null); };
      rq.onerror = function () { cb(rq.error); };
    });
  }
  function list(opts, cb) {
    if (typeof opts === "function") { cb = opts; opts = {}; }
    opts = opts || {};
    txn("readonly", function (err, t) {
      if (err) { cb(err, []); return; }
      var rq = t.objectStore(OS).getAll();
      rq.onsuccess = function () {
        var rows = (rq.result || []).map(normalise).filter(Boolean)
          .filter(function (r) { return opts.aid == null || r.aid === opts.aid; })
          .sort(function (a, b) { return b.started - a.started; });
        cb(null, rows);
      };
      rq.onerror = function () { cb(rq.error, []); };
    });
  }
  function remove(uid, cb) {
    delete live[uid];
    txn("readwrite", function (err, t) {
      if (err) { cb && cb(err); return; }
      t.objectStore(OS).delete(uid);
      t.oncomplete = function () { cb && cb(null); };
      t.onerror = function () { cb && cb(t.error); };
    });
  }
  /* the attempt's marks, once marked (self or teacher) */
  function setMarks(uid, marks, by, tracker, cb) {
    get(uid, function (err, r) {
      if (err || !r) { cb && cb(err || new Error("no such attempt")); return; }
      r.marks = marks || {}; r.by = by === "teacher" ? "teacher" : "self";
      if (tracker) r.tracker = String(tracker);
      put(r, cb);
    });
  }
  function addFeedback(uid, fb, cb) {
    get(uid, function (err, r) {
      if (err || !r) { cb && cb(err || new Error("no such attempt")); return; }
      var id = rid();
      r.feedback[id] = Object.assign({ id: id, at: Date.now() }, fb);
      put(r, function (e2, n) { cb && cb(e2, id, n); });
    });
  }
  function count(cb) {
    txn("readonly", function (err, t) {
      if (err) { cb(err, null); return; }
      var rq = t.objectStore(OS).count();
      rq.onsuccess = function () { cb(null, rq.result); };
      rq.onerror = function () { cb(rq.error, null); };
    });
  }
  function exportAll(cb) { list({}, cb); }
  function importAll(rows, cb) {
    rows = (Array.isArray(rows) ? rows : []).map(normalise).filter(Boolean);
    if (!rows.length) { cb(null, { rows: 0 }); return; }
    txn("readwrite", function (err, t) {
      if (err) { cb(err); return; }
      var os = t.objectStore(OS);
      rows.forEach(function (r) { os.put(r); });
      t.oncomplete = function () { cb(null, { rows: rows.length }); };
      t.onerror = function () { cb(t.error); };
    });
  }

  /* ---------- figures (pure, no DOM, also in Node) ---------- */
  function figures(rec) {
    var r = normalise(rec);
    if (!r) return null;
    var parts = {}, order = [], firsts = {};
    r.parts.forEach(function (p) {
      parts[p.id] = { id: p.id, label: p.label, marks: p.marks, topic: p.topic, command: p.command,
        timeMs: 0, opens: 0, firstMarkMs: null, writeMs: 0, strokes: 0, keys: 0, erasures: 0, undos: 0,
        idleGaps: 0, idleMs: 0, flagged: false };
    });
    function P(id) {
      if (!parts[id]) parts[id] = { id: id, label: id, marks: 0, timeMs: 0, opens: 0, firstMarkMs: null, writeMs: 0, strokes: 0, keys: 0, erasures: 0, undos: 0, idleGaps: 0, idleMs: 0, flagged: false };
      return parts[id];
    }
    var ev = r.ev.slice().sort(function (a, b) { return a[0] - b[0]; });
    var cur = null, since = null, paused = false, pausedMs = 0, pauseAt = null, pauses = 0, endT = null;
    var lastAct = null, activeBefore = 0;    // the part's active time before its first mark
    function close(t) {
      if (cur == null || since == null || paused) return;
      var p = P(cur), span = Math.max(0, t - since);
      p.timeMs += span;
      if (lastAct != null) { var g = t - lastAct; if (g > IDLE_MS) { p.idleGaps++; p.idleMs += g; } }
      since = null; lastAct = null;
    }
    function act(t, part) {
      var p = P(part);
      if (cur !== part) { close(t); cur = part; since = t; lastAct = t; p.opens++; }
      if (lastAct != null) { var g = t - lastAct; if (g > IDLE_MS) { p.idleGaps++; p.idleMs += g; } }
      lastAct = t;
      if (p.firstMarkMs == null) p.firstMarkMs = p.timeMs + (since != null ? t - since : 0);
      if (!firsts[part]) { firsts[part] = 1; order.push(part); }
    }
    ev.forEach(function (x) {
      var t = x[0], c = x[1], part = x[2], v = x[3];
      if (c === "o") { close(t); cur = part; since = paused ? null : t; lastAct = paused ? null : t; P(part).opens++; return; }
      if (c === "p") { if (!paused) { close(t); paused = true; pauseAt = t; pauses++; } return; }
      if (c === "r") { if (paused) { pausedMs += t - pauseAt; paused = false; pauseAt = null; if (cur != null) { since = t; lastAct = t; } } return; }
      if (c === "z") { if (paused && pauseAt != null) { pausedMs += t - pauseAt; paused = false; } close(t); endT = t; return; }
      if (!part) return;
      if (c === "s") { act(t, part); var p = P(part); p.strokes++; p.writeMs += Math.max(0, v || 0); lastAct = t + Math.max(0, v || 0); return; }
      if (c === "k") { act(t, part); P(part).keys += Math.max(1, v || 1); return; }
      if (c === "e") { act(t, part); P(part).erasures++; return; }
      if (c === "u") { act(t, part); P(part).undos++; return; }
      if (c === "f") { P(part).flagged = !!v; return; }
    });
    if (endT == null && ev.length) { var lastT = ev[ev.length - 1][0]; close(lastT); endT = lastT; }
    var budget = r.budget || 0;
    var list = r.parts.map(function (p) { return parts[p.id]; }).concat(Object.keys(parts).filter(function (k) {
      return !r.parts.some(function (p) { return p.id === k; });
    }).map(function (k) { return parts[k]; }));
    var marked = r.marks && Object.keys(r.marks).length > 0;
    list.forEach(function (p) {
      p.returns = Math.max(0, p.opens - 1);
      p.skipped = !p.strokes && !p.keys && !p.erasures;
      p.minPerMark = p.marks && p.timeMs ? Math.round(p.timeMs / 60000 / p.marks * 100) / 100 : null;
      p.budgetMs = budget && p.marks ? Math.round(budget * p.marks * 60000) : null;
      p.overBudget = p.budgetMs != null && p.timeMs > p.budgetMs * 1.25;
      p.underBudget = p.budgetMs != null && p.timeMs > 0 && p.timeMs < p.budgetMs * 0.5;
      p.got = marked && r.marks[p.id] != null ? +r.marks[p.id] : null;
      p.lost = p.got != null ? Math.max(0, p.marks - p.got) : null;
      p.hesitant = p.firstMarkMs != null && p.firstMarkMs > Math.max(60000, (p.budgetMs || 0) * 0.35);
      p.heavyErasing = p.erasures + p.undos >= Math.max(4, p.strokes * 0.3);
    });
    var totalActive = list.reduce(function (s, p) { return s + p.timeMs; }, 0);
    var maxMarks = r.parts.reduce(function (s, p) { return s + p.marks; }, 0);
    /* pacing: the marks of each part counted at the end of its first visit,
       against the ideal line (budget minutes a mark) */
    var pace = [], covered = 0, seen = {}, clock = 0, cp = null, cs = null, pz = false;
    ev.forEach(function (x) {
      var t = x[0], c = x[1];
      if (c === "p") { if (!pz && cp != null && cs != null) clock += t - cs; pz = true; cs = null; return; }
      if (c === "r") { pz = false; cs = t; return; }
      if (c === "o" || c === "z") {
        if (cp != null && cs != null && !pz) clock += t - cs;
        if (cp != null && !seen[cp] && parts[cp] && !parts[cp].skipped) { seen[cp] = 1; covered += parts[cp].marks; pace.push([Math.round(clock / 600) / 100, covered]); }
        cp = c === "o" ? x[2] : null; cs = pz ? null : t;
      }
    });
    var out = {
      uid: r.uid, budget: budget, maxMarks: maxMarks, parts: list, order: order,
      activeMs: totalActive, pausedMs: pausedMs, pauses: pauses, endMs: endT,
      timeLeftMs: r.allowedMs != null ? Math.max(0, r.allowedMs - totalActive) : null,
      overrunMs: r.allowedMs != null ? Math.max(0, totalActive - r.allowedMs) : null,
      minPerMark: maxMarks && totalActive ? Math.round(totalActive / 60000 / maxMarks * 100) / 100 : null,
      pace: pace, idealPerMark: budget || null,
      skipped: list.filter(function (p) { return p.skipped; }).map(function (p) { return p.id; }),
      flagged: list.filter(function (p) { return p.flagged; }).map(function (p) { return p.id; }),
      slowLowYield: [], byTopic: {}, byCommand: {}
    };
    if (marked) {
      out.got = list.reduce(function (s, p) { return s + (p.got || 0); }, 0);
      out.slowLowYield = list.filter(function (p) { return p.overBudget && p.marks && (p.got || 0) / p.marks < 0.5; }).map(function (p) { return p.id; });
    }
    list.forEach(function (p) {
      [["byTopic", p.topic], ["byCommand", p.command]].forEach(function (g) {
        if (!g[1]) return;
        var b = out[g[0]][g[1]] || (out[g[0]][g[1]] = { marks: 0, got: 0, timeMs: 0, parts: 0 });
        b.marks += p.marks; b.timeMs += p.timeMs; b.parts++;
        if (p.got != null) b.got += p.got;
      });
    });
    return out;
  }

  KOS.attempts = {
    available: available, begin: begin, resume: resume, log: log, open: openPart, keys: keys, flag: flag,
    pause: pause, resumeClock: resumeClock, end: end, bindDoc: bindDoc, unbindDoc: unbindDoc, current: current,
    isLive: function (uid) { return !!live[uid]; },
    get: get, list: list, put: put, remove: remove, setMarks: setMarks, addFeedback: addFeedback,
    count: count, exportAll: exportAll, importAll: importAll,
    figures: figures, normalise: normalise, IDLE_MS: IDLE_MS
  };
  if (available()) open(function () {});
})();
