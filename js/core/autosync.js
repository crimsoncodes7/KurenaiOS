/* Kurenai OS — core/autosync.js
   Autonomous two-way sync (Build 3j). The user's real workflow: mal-sync
   updates AniList the moment an episode/chapter finishes, so the app must
   PULL those updates by itself — pressing "Sync now" by hand defeats the
   point. The push half already exists (mediapush debounces every local
   edit out automatically); this closes the loop in the other direction:

   - a paced pull cycle every INTERVAL minutes while the app is open
     (AniList anime + manga when connected, VNDB when connected — reads
     are verified working from file:// for both);
   - a cycle on the browser's `online` event, so coming back from offline
     reconciles everything: failed pushes are flushed FIRST (local edits
     are the newest truth — last-write-wins must favour them), THEN the
     pull runs;
   - a cycle when the tab becomes visible again after the interval lapsed
     (laptops sleep; timers don't fire while suspended).

   Contract with the rest of the system:
   - pulls run bulkUpsert in plain update-and-add mode — NEVER replace;
     the manual layer (routes, chapters, quotes, physical, …) survives by
     the same merge rules as a manual sync.
   - rewards ride the 3j watermark: what a pull discovers was done
     elsewhere logs ONE proportional session per module via
     KOS.media.logSyncRewards — echoes of our own pushes are silent.
   - failed-push retry only targets AniList entries: VNDB browser writes
     are blocked by VNDB's own CORS policy (verified 2026-07-03), and
     re-slamming a policy wall every quarter hour is noise, not sync.
   - auth failures pause the loop with one toast per session; network
     failures are silent (offline is a normal state, not an error).
   - the kill switch lives in the media kv store ("autosync.enabled",
     default ON) — surfaced as a toggle on Sync & Import.                 */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var INTERVAL = 15 * 60 * 1000;   // pull cycle while the app is open
  var BOOT_DELAY = 8000;           // after boot — clear of the 4 s dedupe pass
  var PULL_GAP = 2500;             // between AniList anime and manga pulls (30 req/min)
  var DRAIN_WAIT = 20000;          // max wait for retried pushes to leave the queue

  var running = false;
  var lastRun = 0;
  var timer = null;
  var bootTimer = null;
  var authToasted = { anilist: false, vndb: false };

  function enabled(cb) {
    KOS.mediadb.getKV("autosync.enabled", function (err, v) {
      cb(err, v !== false);   // null/undefined → default ON
    });
  }
  function setEnabled(v, cb) {
    KOS.mediadb.setKV("autosync.enabled", !!v, cb || function () {});
  }

  function online() { return typeof navigator === "undefined" || navigator.onLine !== false; }

  /* ---------------- failed-push retry ---------------- */
  /* Entries stranded with push:{state:"failed"} (offline edits that
     exhausted their retries) get one flush per cycle — AniList only, see
     the header. cb(retriedCount) once the queue drains or the wait caps. */
  function retryFailedPushes(cb) {
    var mods = ["anime", "books"], ids = [], mi = 0;
    (function scan() {
      if (mi >= mods.length) { flushAll(); return; }
      KOS.mediadb.query({ module: mods[mi++] }, function (err, rows) {
        if (!err) rows.forEach(function (e) {
          if (e.push && e.push.state === "failed" && KOS.mediapush.eligible(e) === "anilist") ids.push(e.id);
        });
        scan();
      });
    })();
    function flushAll() {
      if (!ids.length) { cb(0); return; }
      ids.forEach(function (id) { KOS.mediapush.flush(id); });
      var deadline = Date.now() + DRAIN_WAIT;
      (function drain() {
        var pending = ids.some(function (id) { return KOS.mediapush.isPending(id); });
        if (!pending || Date.now() > deadline) { cb(ids.length); return; }
        setTimeout(drain, 500);
      })();
    }
  }

  /* ---------------- the pulls ---------------- */
  function authFail(service, err) {
    if (err.kind !== "auth" || authToasted[service]) return;
    authToasted[service] = true;
    if (KOS.ui) KOS.ui.toast("Auto-sync paused for " + (service === "anilist" ? "AniList" : "VNDB") +
      ": " + err.message, true);
  }

  /* one AniList list pull → upsert → reward. cb(result|null) — errors
     resolve null so the cycle continues with the other pulls. */
  function pullAnilistModule(conn, module, report, cb) {
    KOS.anilist.syncList(conn.token, conn.viewer.id, module, function (err, mapped) {
      if (err) { authFail("anilist", err); report.errors.push("anilist/" + module + ": " + err.message); cb(null); return; }
      KOS.mediadb.bulkUpsert(mapped, {}, function (err2, res) {
        if (err2) { report.errors.push("anilist/" + module + " write: " + err2.message); cb(null); return; }
        KOS.mediadb.setKV("anilist.lastSync." + module, Date.now(), function () {});
        KOS.media.logSyncRewards(module, res.rewards);
        cb(res);
      });
    });
  }
  function pullAnilist(report, cb) {
    KOS.anilist.getConnection(function (err, conn) {
      if (err || !conn.token || !conn.viewer) { cb(); return; }
      pullAnilistModule(conn, "anime", report, function (resA) {
        report.anilist.anime = resA;
        setTimeout(function () {
          pullAnilistModule(conn, "books", report, function (resB) {
            report.anilist.books = resB;
            cb();
          });
        }, PULL_GAP);
      });
    });
  }
  function pullVndb(report, cb) {
    KOS.vndb.getConnection(function (err, conn) {
      if (err || !conn.token || !conn.user) { cb(); return; }
      KOS.vndb.syncList(conn.token, {}, function (err2, mapped) {
        if (err2) { authFail("vndb", err2); report.errors.push("vndb: " + err2.message); cb(); return; }
        KOS.mediadb.bulkUpsert(mapped, {}, function (err3, res) {
          if (err3) { report.errors.push("vndb write: " + err3.message); cb(); return; }
          KOS.mediadb.setKV("vndb.lastSync", Date.now(), function () {});
          KOS.media.logSyncRewards("vn", res.rewards);
          report.vndb = res;
          cb();
        });
      });
    });
  }

  /* ---------------- one full cycle ---------------- */
  /* push retries first (local edits are newest — they must win the
     last-write-wins race), then the pulls. cb(err, report). */
  function runOnce(cb) {
    cb = cb || function () {};
    if (running) { cb(null, null); return; }
    if (!online() || !KOS.mediadb.available()) { cb(null, null); return; }
    enabled(function (e0, on) {
      if (!on) { cb(null, null); return; }
      running = true;
      var report = { ts: Date.now(), pushesRetried: 0,
                     anilist: { anime: null, books: null }, vndb: null, errors: [] };
      retryFailedPushes(function (retried) {
        report.pushesRetried = retried;
        pullAnilist(report, function () {
          pullVndb(report, function () {
            running = false;
            lastRun = Date.now();
            KOS.mediadb.setKV("autosync.lastReport", report, function () {});
            var added = 0, rewarded = 0;
            [report.anilist.anime, report.anilist.books, report.vndb].forEach(function (r) {
              if (!r) return;
              added += r.added || 0;
              rewarded += (r.rewards || []).length;
            });
            /* quiet cycles stay quiet — only genuinely new ground toasts
               (the reward sessions already toasted their own take) */
            if ((added || rewarded) && KOS.ui) {
              KOS.ui.toast("Auto-sync: " + (added ? added + " new entr" + (added === 1 ? "y" : "ies") : "") +
                (added && rewarded ? ", " : "") +
                (rewarded ? rewarded + " advanced elsewhere" : "") + " — vault is current.");
            }
            cb(null, report);
          });
        });
      });
    });
  }

  /* ---------------- lifecycle ---------------- */
  function schedule() {
    if (timer) clearInterval(timer);
    timer = setInterval(function () { runOnce(); }, INTERVAL);
  }
  function start() {
    if (!KOS.mediadb.available()) return;
    bootTimer = setTimeout(function () { runOnce(); }, BOOT_DELAY);
    schedule();
    /* back online → reconcile: pushes flush first inside the cycle */
    window.addEventListener("online", function () {
      setTimeout(function () { runOnce(); }, 2000);
    });
    /* woken laptop / re-focused tab past the interval → catch up */
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible" && Date.now() - lastRun > INTERVAL) runOnce();
    });
  }

  /* kill the timers (the smoke suites call this right after load — a
     timer-driven pull firing mid-step would pollute their network logs) */
  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
    if (bootTimer) { clearTimeout(bootTimer); bootTimer = null; }
  }

  KOS.autosync = {
    INTERVAL: INTERVAL,
    enabled: enabled,
    setEnabled: setEnabled,
    runOnce: runOnce,
    start: start,
    stop: stop,
    lastRun: function () { return lastRun; },
    isRunning: function () { return running; },
    /* test seams — smoke12 shrinks the waits */
    _config: function (opts) {
      if (opts.interval != null) { INTERVAL = opts.interval; if (timer) schedule(); }
      if (opts.bootDelay != null) BOOT_DELAY = opts.bootDelay;
      if (opts.pullGap != null) PULL_GAP = opts.pullGap;
      if (opts.drainWait != null) DRAIN_WAIT = opts.drainWait;
    }
  };
})();
