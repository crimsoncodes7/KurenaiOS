/* Kurenai OS — core/reportstore.js
   Reports (roadmap 5.1, docs/reports-plan.md): where saved reports and
   the facts they need from the past live.

   It keeps two things: the saved REPORTS (below, phase 2) and the
   SNAPSHOTS (phase 1). Some facts a report states are derived
   live and have no history of their own: a topic's RAG band, status and
   mastery ("Amber → Green", mastery by unit), the Governor's balance and
   level, and the Collection's status counts. So the state at each period
   boundary is written down the first time the app is open on or after it:
     { id: boundary "YYYY-MM-DD" (a Monday, or the 1st of a month),
       boundary, takenAt (ms — honest about a late first open),
       topics: { "sid:ref": [band|null, status, mastery%] } (non-empty only),
       gov: { xp, gold, hp, level }, streaks: { all, rest, best },
       media: { <module>: { <status>: n } } }
   A boundary the app never opened on keeps no snapshot; the report uses
   the nearest one and says how old it is. The snapshot taken the day this
   shipped is the baseline. Months, terms and years start on a Monday or a
   1st, so these two boundaries cover every period.

   Storage is its own IndexedDB, `kurenai-os-reports` (decision A): local
   first, replicated to the `kos_reports` table later (phase 7). It holds
   no credentials and is never the only copy of anything the user typed;
   every fact in it is derived from data that has its own home.          */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var DB_NAME = "kurenai-os-reports" + ((KOS.dataMode && KOS.dataMode.suffix) || ""), DB_VER = 1;
  var SNAPS = "snapshots", REPORTS = "reports";
  var db = null, timer = null, taking = false;

  function available() { return !!window.indexedDB; }
  function open(cb) {
    if (!available()) { cb(new Error("IndexedDB unavailable")); return; }
    if (db) { cb(null, db); return; }
    var rq = window.indexedDB.open(DB_NAME, DB_VER);
    rq.onupgradeneeded = function (e) {
      var d = e.target.result;
      if (!d.objectStoreNames.contains(SNAPS)) d.createObjectStore(SNAPS, { keyPath: "id" });
      if (!d.objectStoreNames.contains(REPORTS)) {
        var os = d.createObjectStore(REPORTS, { keyPath: "id" });
        os.createIndex("period", "period", { unique: false });
      }
    };
    rq.onsuccess = function () {
      db = rq.result;
      db.onversionchange = function () { db.close(); db = null; };
      cb(null, db);
    };
    rq.onerror = function () { cb(rq.error); };
  }
  function tx(name, mode, fn) {
    open(function (err, d) {
      if (err) { fn(err); return; }
      try { fn(null, d.transaction(name, mode).objectStore(name)); } catch (e) { fn(e); }
    });
  }

  /* ---------------- boundaries ---------------- */
  function iso(d) {
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function weekStart(d) {   // the Monday of d's week, local time
    var x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return x;
  }
  /* the latest boundary at or before `now`: this week's Monday or this
     month's 1st, whichever is later */
  function boundary(now) {
    now = now || new Date();
    var w = weekStart(now), m = new Date(now.getFullYear(), now.getMonth(), 1);
    return iso(w > m ? w : m);
  }

  /* ---------------- the snapshot ---------------- */
  var SUBJECTS = ["compsci", "maths", "it"];
  function topics() {
    var out = {};
    if (!KOS.hub || !KOS.hub.LEAVES) return out;
    SUBJECTS.forEach(function (sid) {
      (KOS.hub.LEAVES[sid] || []).forEach(function (leaf) {
        var p = KOS.store.peekProgress(sid, leaf.ref);
        var status = (p && p.status) || "none";
        var band = KOS.rag ? KOS.rag.effective(sid, leaf.ref).band : null;
        var pct = KOS.hub.leafPercent ? KOS.hub.leafPercent(sid, leaf.ref) : 0;
        if (band || status !== "none" || pct) out[sid + ":" + leaf.ref] = [band || null, status, pct || 0];
      });
    });
    return out;
  }
  function gov() {
    var g = KOS.store.state.governor || {};
    return { xp: g.xp || 0, gold: g.gold || 0, hp: g.hp != null ? g.hp : null,
      level: KOS.governor ? KOS.governor.levelInfo(g.xp || 0).level : null };
  }
  function streaks() {
    if (!KOS.sessions) return null;
    var s = KOS.sessions.streaks();
    return { all: s.all, rest: s.rest, best: s.best };
  }
  function media(cb) {
    if (!KOS.mediadb || !KOS.mediadb.available()) { cb({}); return; }
    KOS.mediadb.query({}, function (err, rows) {
      var out = {};
      (err ? [] : rows).forEach(function (e) {
        var m = out[e.module] = out[e.module] || {};
        m[e.status] = (m[e.status] || 0) + 1;
      });
      cb(out);
    });
  }
  /* build (without saving) the snapshot for `id` */
  function build(id, cb) {
    media(function (counts) {
      cb({ id: id, boundary: id, takenAt: Date.now(), topics: topics(), gov: gov(),
        streaks: streaks(), media: counts });
    });
  }
  function getSnapshot(id, cb) {
    tx(SNAPS, "readonly", function (err, os) {
      if (err) { cb(err, null); return; }
      var rq = os.get(id);
      rq.onsuccess = function () { cb(null, rq.result || null); };
      rq.onerror = function () { cb(rq.error, null); };
    });
  }
  function putSnapshot(snap, cb) {
    tx(SNAPS, "readwrite", function (err, os) {
      if (err) { cb && cb(err); return; }
      var rq = os.put(snap);
      rq.onsuccess = function () { cb && cb(null, snap); };
      rq.onerror = function () { cb && cb(rq.error); };
    });
  }
  function snapshots(cb) {
    tx(SNAPS, "readonly", function (err, os) {
      if (err) { cb(err, []); return; }
      var rq = os.getAll();
      rq.onsuccess = function () {
        cb(null, (rq.result || []).sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; }));
      };
      rq.onerror = function () { cb(rq.error, []); };
    });
  }
  /* take the current boundary's snapshot if it has none. A snapshot is
     written once and never refreshed: it is the state as first seen in
     the period, which is what "at the start of the week" can honestly
     mean on a device that was closed on Monday. cb(err, snap|null) —
     null when it already existed. */
  function ensure(cb, now) {
    if (taking || !available()) { cb && cb(null, null); return; }
    var id = boundary(now);
    taking = true;
    getSnapshot(id, function (err, have) {
      if (err || have) { taking = false; cb && cb(err || null, null); return; }
      build(id, function (snap) {
        putSnapshot(snap, function (e2) { taking = false; cb && cb(e2 || null, e2 ? null : snap); });
      });
    });
  }
  /* ---------------- saved reports (phase 2) ----------------
     { id: "week:2026-10-05", period, start, end, savedAt, rebuilt?,
       facts (KOS.report.compute — never recomputed once saved),
       words: { mode: "template"|"kurenai", headline, narrative,
                writtenAt, status: "idle"|"generating"|"failed" } }
     A report is written ONCE, when its period is ready (a week on the
     following Monday at 07:00, README rule 8); afterwards only `words`
     may change (setWords). */
  function getReport(id, cb) {
    tx(REPORTS, "readonly", function (err, os) {
      if (err) { cb(err, null); return; }
      var rq = os.get(id);
      rq.onsuccess = function () { cb(null, rq.result || null); };
      rq.onerror = function () { cb(rq.error, null); };
    });
  }
  function putReport(rep, cb) {
    tx(REPORTS, "readwrite", function (err, os) {
      if (err) { cb && cb(err); return; }
      var rq = os.put(rep);
      rq.onsuccess = function () { cb && cb(null, rep); };
      rq.onerror = function () { cb && cb(rq.error); };
    });
  }
  /* every saved report of a period, newest first. The last answer is
     kept in memory for search (a synchronous disclosure layer that may not
     wait on IndexedDB, invariant 71). */
  var cache = [];
  function list(period, cb) {
    tx(REPORTS, "readonly", function (err, os) {
      if (err) { cb(err, []); return; }
      var rq = period ? os.index("period").getAll(period) : os.getAll();
      rq.onsuccess = function () {
        var out = (rq.result || []).sort(function (a, b) { return a.start < b.start ? 1 : a.start > b.start ? -1 : 0; });
        if (period === "week") cache = out;
        cb(null, out);
      };
      rq.onerror = function () { cb(rq.error, []); };
    });
  }
  var WORDS_MODES = ["template", "kurenai"], WORDS_STATUS = ["idle", "generating", "failed"];
  /* the one mutation a saved report allows (README "State") */
  function setWords(id, words, cb) {
    getReport(id, function (err, rep) {
      if (err || !rep) { cb && cb(err || new Error("No such report")); return; }
      var w = words || {};
      rep.words = {
        mode: WORDS_MODES.indexOf(w.mode) !== -1 ? w.mode : "template",
        headline: w.headline ? String(w.headline).slice(0, 200) : null,
        narrative: w.narrative ? String(w.narrative).slice(0, 2000) : null,
        writtenAt: w.writtenAt || null,
        status: WORDS_STATUS.indexOf(w.status) !== -1 ? w.status : "idle"
      };
      putReport(rep, function (e2) { cb && cb(e2 || null, rep); });
    });
  }
  function record(p, facts) {
    var rep = { id: p.id, period: p.period, start: p.start, end: p.end, savedAt: Date.now(), facts: facts,
      words: { mode: "template", headline: null, narrative: null, writtenAt: null, status: "idle" } };
    if (facts.rebuilt) rep.rebuilt = true;
    return rep;
  }
  /* did anything happen? a rebuilt week with no trace is not saved */
  function hasContent(f) {
    return !!(f.study.mins || f.study.reviews || f.study.touched || f.focus.blocks ||
      (f.collection && f.collection.count) || f.plan || f.tasks);
  }

  /* The saving tick. Backfill first (oldest first, so each week can
     compare with the one before), then the week that has just become
     ready, which alone is announced. Backfill (decision B) reaches back to
     the start of the academic year; a week from before the first snapshot
     is marked "rebuilt from history". Months, terms and years roll up
     from these in phase 6. */
  var BACKFILL_WEEKS = 60, saving = false;
  function ensureReports(cb, nowArg) {
    if (saving || !available() || !KOS.report) { cb && cb(null, []); return; }
    saving = true;
    var R = KOS.report, now = nowArg || Date.now();
    var today = iso(new Date(now));
    var latest = R.week(R.addDays(R.monday(today), -7));
    var from = R.year(today).start;
    var ids = [], cur = R.week(from);
    while (cur.start <= latest.start && ids.length < BACKFILL_WEEKS) { ids.push(cur); cur = R.week(R.addDays(cur.start, 7)); }
    var saved = [];
    snapshots(function (e0, snaps) {
      var baseline = snaps && snaps.length ? snaps[0].id : null;
      var i = 0, prevFacts = null;
      (function next() {
        if (i >= ids.length) { saving = false; cb && cb(null, saved); return; }
        var p = ids[i++];
        var isLatest = p.id === latest.id;
        if (isLatest && !R.isReady(p, now)) { next(); return; }
        getReport(p.id, function (e1, have) {
          if (have) { prevFacts = have.facts; next(); return; }
          var rebuilt = !baseline || p.start < baseline;
          R.build(p, { rebuilt: rebuilt, prev: prevFacts }, function (facts) {
            if (!isLatest && rebuilt && !hasContent(facts)) { prevFacts = null; next(); return; }
            var rep = record(p, facts);
            putReport(rep, function (e2) {
              if (!e2) { saved.push(rep); prevFacts = facts; if (isLatest && !rebuilt) announce(rep); }
              next();
            });
          });
        });
      })();
    });
  }
  /* "Your week in review is ready" — one notification per report (its id
     is the report's, so two devices saving the same week never post two;
     the ledger syncs). A no-op until the bell knows the kind. */
  function announce(rep) {
    if (!KOS.notify || !KOS.notify.push || !KOS.reportWords) return;
    var w = KOS.reportWords.template(rep.facts);
    KOS.notify.push({ id: "reports:" + rep.id, kind: "reports",
      title: rep.period === "week" ? "Your week in review is ready" : "Your " + rep.period + " in review is ready",
      body: w.headline, view: "reports", arg: { period: rep.period, id: rep.id } });
  }

  /* once after boot (when the study modules and the vault are ready),
     then every 30 minutes, so a device left open over midnight on Sunday
     still writes Monday's — the snapshot first, then the reports */
  function tick() { ensure(function () { ensureReports(); }); }
  function start() {
    if (timer || !available()) return;
    setTimeout(tick, 8000);
    timer = setInterval(tick, 30 * 60 * 1000);
  }

  KOS.reportStore = {
    available: available,
    open: open,
    boundary: boundary,
    weekStart: function (d) { return iso(weekStart(d || new Date())); },
    buildSnapshot: build,
    getSnapshot: getSnapshot,
    putSnapshot: putSnapshot,
    snapshots: snapshots,
    ensureSnapshot: ensure,
    getReport: getReport,
    putReport: putReport,
    list: list,
    cached: function () { return cache.slice(0, 60); },
    setWords: setWords,
    ensureReports: ensureReports,
    start: start
  };
})();
