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
        status: WORDS_STATUS.indexOf(w.status) !== -1 ? w.status : "idle",
        /* when the words last changed on any device: replication keeps
           the newest (a mode switch moves it too, unlike writtenAt) */
        changedAt: Date.now()
      };
      putReport(rep, function (e2) { cb && cb(e2 || null, rep); soonSync(); });
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
    var from = R.year(today).start;
    /* the groups, in an order where each can read the last: weeks (terms
       roll them up), months (a year rolls them up), terms, years */
    var groups = [];
    var weeks = [], cur = R.week(from), lastWeek = R.week(R.addDays(R.monday(today), -7));
    while (cur.start <= lastWeek.start && weeks.length < BACKFILL_WEEKS) { weeks.push(cur); cur = R.week(R.addDays(cur.start, 7)); }
    groups.push(weeks);
    var months = [], m = R.month(from), lastMonth = R.month(R.addDays(R.month(today).start, -1));
    while (m.start <= lastMonth.start) { months.push(m); m = R.month(R.addDays(m.end, 1)); }
    groups.push(months);
    groups.push(R.terms().filter(function (t) { return t.start >= from && t.end < today; }));
    /* a year is saved on 1 September; the one before the backfill window
       only if it has just ended */
    var lastYear = R.year(R.addDays(from, -1));
    groups.push(now >= R.readyAt(lastYear) && now - R.readyAt(lastYear) < 31 * 864e5 ? [lastYear] : []);
    var saved = [];
    snapshots(function (e0, snaps) {
      var baseline = snaps && snaps.length ? snaps[0].id : null;
      var gi = 0;
      (function group() {
        if (gi >= groups.length) { saving = false; cb && cb(null, saved); return; }
        var ids = groups[gi++], i = 0, prevFacts = null;
        var latest = ids.length ? ids[ids.length - 1] : null;
        (function next() {
          if (i >= ids.length) { group(); return; }
          var p = ids[i++];
          var isLatest = p === latest;
          if (!R.isReady(p, now)) { next(); return; }
          getReport(p.id, function (e1, have) {
            if (have) { prevFacts = have.facts; next(); return; }
            var rebuilt = !baseline || p.start < baseline;
            R.build(p, { rebuilt: rebuilt, prev: prevFacts }, function (facts) {
              if (!isLatest && rebuilt && !hasContent(facts)) { prevFacts = null; next(); return; }
              if (isLatest && rebuilt && p.period !== "week" && !hasContent(facts)) { next(); return; }
              var rep = record(p, facts);
              putReport(rep, function (e2) {
                if (!e2) { saved.push(rep); prevFacts = facts; if (isLatest && !rebuilt) announce(rep); }
                next();
              });
            });
          });
        })();
      })();
    });
  }
  /* "Your week in review is ready" — one notification per report (its id
     is the report's, so two devices saving the same week never post two;
     the ledger syncs). A no-op until the bell knows the kind. */
  var MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function announce(rep) {
    if (!KOS.notify || !KOS.notify.push || !KOS.reportWords) return;
    var w = KOS.reportWords.template(rep.facts);
    KOS.notify.push({ id: "reports:" + rep.id, kind: "reports",
      title: rep.period === "week" ? "Your week in review is ready"
        : rep.period === "month" ? MONTH_NAMES[+rep.start.slice(5, 7) - 1] + " in review is ready"
        : rep.period === "term" ? "Your term in review is ready" : "Your year in review is ready",
      body: w.headline, view: "reports", arg: { period: rep.period, id: rep.id } });
  }

  /* ---------------- replication (phase 7) ----------------
     The table `kos_reports` holds a copy of every saved report and
     snapshot, so a second device reads the weeks the first one saved.
     Local-first (invariant 31): signed out, or in an Empty/Sample review
     namespace, nothing is sent. Pull, merge, then push what changed since
     this device last pushed (a per-item stamp, kept in the media kv store
     like the main sync's meta). A report merges by its own rules: the
     facts of the copy saved FIRST (two devices converge on one), the words
     changed LAST. Snapshots keep the one taken first. */
  var cloudApi = null, syncing = false, syncTimer = null;
  var SYNC_PAGE = 200, PUSH_CHUNK = 50;
  function realCloud() {
    function c() { return KOS.cloud.client(); }
    function run(b, cb) {
      b.then(function (res) { res.error ? cb(new Error(res.error.message || "Reports sync failed.")) : cb(null, res.data); })
        .catch(function (e) { cb(new Error((e && e.message) || "Reports sync failed — network?")); });
    }
    return {
      since: function (iso, offset, cb) {
        var q = c().from("kos_reports").select("item_id, kind, stamp, data_json, updated_at");
        if (iso) q = q.gt("updated_at", iso);
        run(q.order("updated_at", { ascending: true }).range(offset, offset + SYNC_PAGE - 1), cb);
      },
      upsert: function (rows, cb) {
        run(c().from("kos_reports").upsert(rows, { onConflict: "user_id,item_id" }).select("item_id, updated_at"), cb);
      }
    };
  }
  function cloud() { return cloudApi || realCloud(); }
  function canSync() {
    return !!(KOS.cloud && KOS.cloud.signedIn && KOS.cloud.signedIn() && KOS.mediadb && KOS.mediadb.available() &&
      !(KOS.dataMode && KOS.dataMode.mode));
  }
  function stampOf(kind, rec) {
    return kind === "snapshot" ? String(rec.takenAt || 0) : String(rec.savedAt || 0) + "|" + String((rec.words && rec.words.changedAt) || 0);
  }
  function mergeReport(local, remote) {
    var base = (remote.savedAt || 0) < (local.savedAt || 0) ? remote : local;
    var out = JSON.parse(JSON.stringify(base));
    var lw = local.words || {}, rw = remote.words || {};
    out.words = JSON.parse(JSON.stringify((rw.changedAt || 0) > (lw.changedAt || 0) ? rw : lw));
    return out;
  }
  function allSnapshots(cb) { snapshots(function (e, l) { cb(e ? [] : l); }); }
  function allReports(cb) { list(null, function (e, l) { cb(e ? [] : l); }); }
  function syncCloud(cb) {
    if (syncing || !available() || !canSync()) { cb && cb(null, { pushed: 0, pulled: 0, skipped: true }); return; }
    syncing = true;
    var uid = KOS.cloud.userId(), key = "reports.sync." + uid, out = { pushed: 0, pulled: 0 };
    function finish(err) { syncing = false; cb && cb(err || null, out); }
    KOS.mediadb.getKV(key, function (e0, meta) {
      meta = meta && typeof meta === "object" ? meta : {};
      meta.pushed = meta.pushed || {};
      var offset = 0, maxTs = meta.cursor || null;
      (function page() {
        cloud().since(meta.cursor || null, offset, function (e1, rows) {
          if (e1) { finish(e1); return; }
          rows = rows || [];
          var i = 0;
          (function apply() {
            if (i >= rows.length) {
              if (rows.length === SYNC_PAGE) { offset += SYNC_PAGE; page(); return; }
              meta.cursor = maxTs;
              push();
              return;
            }
            var row = rows[i++], rec = row.data_json || {};
            if (!maxTs || row.updated_at > maxTs) maxTs = row.updated_at;
            if (row.kind === "snapshot") {
              var sid = String(row.item_id).replace(/^snap:/, "");
              getSnapshot(sid, function (e2, have) {
                if (!have || (rec.takenAt || 0) < (have.takenAt || 0)) {
                  putSnapshot(rec, function () { meta.pushed[row.item_id] = row.stamp; out.pulled++; apply(); });
                } else { if (have.takenAt === rec.takenAt) meta.pushed[row.item_id] = row.stamp; apply(); }
              });
              return;
            }
            getReport(row.item_id, function (e3, have) {
              var merged = have ? mergeReport(have, rec) : rec;
              var changed = !have || JSON.stringify(merged) !== JSON.stringify(have);
              var same = stampOf("report", merged) === row.stamp;
              function done() { if (same) meta.pushed[row.item_id] = row.stamp; apply(); }
              if (changed) putReport(merged, function () { out.pulled++; done(); }); else done();
            });
          })();
        });
      })();
      function push() {
        allReports(function (reps) {
          allSnapshots(function (snaps) {
            var rows = [];
            reps.forEach(function (r) { var st = stampOf("report", r); if (meta.pushed[r.id] !== st) rows.push({ user_id: uid, item_id: r.id, kind: "report", stamp: st, data_json: r }); });
            snaps.forEach(function (sn) { var id = "snap:" + sn.id, st = stampOf("snapshot", sn); if (meta.pushed[id] !== st) rows.push({ user_id: uid, item_id: id, kind: "snapshot", stamp: st, data_json: sn }); });
            var j = 0;
            (function chunk() {
              if (j >= rows.length) { KOS.mediadb.setKV(key, meta, function () { finish(null); }); return; }
              var slice = rows.slice(j, j + PUSH_CHUNK);
              j += PUSH_CHUNK;
              cloud().upsert(slice, function (e4) {
                if (e4) { KOS.mediadb.setKV(key, meta, function () { finish(e4); }); return; }
                slice.forEach(function (r) { meta.pushed[r.item_id] = r.stamp; });
                out.pushed += slice.length;
                chunk();
              });
            })();
          });
        });
      }
    });
  }
  /* a change worth sending soon (words written, a report saved) */
  function soonSync() {
    if (syncTimer) clearTimeout(syncTimer);
    syncTimer = setTimeout(function () { syncTimer = null; syncCloud(); }, 2000);
  }

  /* once after boot (when the study modules and the vault are ready),
     then every 30 minutes, so a device left open over midnight on Sunday
     still writes Monday's — the snapshot first, then the reports */
  function tick() { ensure(function () { ensureReports(function () { syncCloud(); }); }); }
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
    syncCloud: syncCloud,
    mergeReport: mergeReport,
    /* test seam: a fake kos_reports API (since, upsert) */
    _setCloudApi: function (a) { cloudApi = a || null; },
    start: start
  };
})();
