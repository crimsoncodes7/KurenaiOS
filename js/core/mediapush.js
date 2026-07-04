/* Kurenai OS — core/mediapush.js
   The shared write-back utility (Build 3d). ONE mechanism serves both
   services: AniList (anime + books) via SaveMediaListEntry and VNDB (vn)
   via PATCH /ulist — no parallel implementations.

   Contract:
   - ELIGIBILITY — only entries whose syncSource names a live connection
     AND that carry the matching external id ever push. Manual/imported
     entries never attempt it; there is nothing to push to.
   - FIELD SCOPING — only remote-mapped state leaves the machine: status,
     progress (episodes/chapters + volumes for books), score. Everything
     local-only — physical vault, mood, shelves, notes, quotes, VN routes,
     CG counters, content warnings — never appears in a payload by
     construction (the payload builders below simply have no code path
     for them). VNDB's ulist additionally has NO progress concept, so a
     VN pushes status + vote only.
   - DEBOUNCE — per-entry, 350 ms (the notes-autosave interval from
     hub.js), so a burst of "+1 ep" clicks coalesces into one push of the
     final state. The queue also dedupes by entry id, and every job reads
     the LATEST entry from the DB at execution time, so even a mid-burst
     fire pushes current truth, never a stale snapshot.
   - PAPER TRAIL — every attempt lands in the kv write-activity log
     (capped at 200): entry, service, fields, outcome. On success
     lastSyncedAt updates; on final failure the entry carries a visible
     push:{state:"failed"} marker with a retry affordance on its card.
   - RETRY — reuses the same error-kind contract the read clients built:
     ratelimit waits Retry-After, transient errors back off, auth errors
     fail immediately with the client's specific wording (VNDB's names
     the listwrite permission). VNDB write network-failures are NOT
     retried: the known cause is VNDB's own CORS policy blocking PATCH
     from browsers (verified 2026-07-03) and a retry loop against a
     policy wall is noise.
   - LAST-WRITE-WINS, stated plainly: there is no conflict detection. An
     edit made on the AniList/VNDB site between local edits is simply
     overwritten by the next push (and vice versa via pull sync). This is
     a deliberate scope boundary for a single-user tool, documented in
     Help — not merge logic waiting to be written.                        */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var DEBOUNCE = 350;        // per-entry quiet period — the hub.js notes-autosave interval
  var MAX_RETRIES = 3;
  var RETRY_WAIT = 15000;    // transient-error backoff (429 uses Retry-After instead)
  var LOG_KEY = "push.log", LOG_CAP = 200;

  var timers = {};           // entryId -> debounce timeout
  var queued = {};           // entryId -> true (dedupe)
  var queue = [];            // FIFO of entry ids
  var running = false;
  var pending = {};          // entryId -> true while debouncing/queued/in-flight

  /* ---------------- eligibility + field scoping ---------------- */
  /* Which live service does this entry belong to? null = never push. */
  function eligible(e) {
    if (!e || !e.externalIds) return null;
    if ((e.module === "anime" || e.module === "books") &&
        e.syncSource === "anilist" && e.externalIds.anilistId) return "anilist";
    if (e.module === "vn" && e.syncSource === "vndb" && e.externalIds.vndbId) return "vndb";
    return null;
  }

  /* The remote-mapped state, as a comparable string — callers capture it
     before an edit and schedule a push only when it actually changed.
     VN entries compare status|score only: their progress derives from the
     local-only routes list, and VNDB's ulist has no progress field, so a
     route edit must never trigger a (doomed) push by itself. */
  function snapshot(e) {
    if (e.module === "vn") return [e.status, e.score || 0].join("|");
    return [e.status, e.progress.current || 0,
            e.progress.volumes != null ? e.progress.volumes : "",
            e.score || 0].join("|");
  }

  /* ---------------- the write-activity log ---------------- */
  function appendLog(rec, done) {
    KOS.mediadb.getKV(LOG_KEY, function (err, log) {
      log = Array.isArray(log) ? log : [];
      log.unshift(rec);
      if (log.length > LOG_CAP) log.length = LOG_CAP;
      KOS.mediadb.setKV(LOG_KEY, log, done || function () {});
    });
  }
  function getLog(cb) {
    KOS.mediadb.getKV(LOG_KEY, function (err, log) {
      cb(err, Array.isArray(log) ? log : []);
    });
  }

  /* ---------------- scheduling ---------------- */
  function schedule(entry) {
    if (!eligible(entry) || entry.id == null) return false;
    var id = entry.id;
    pending[id] = true;
    if (timers[id]) clearTimeout(timers[id]);
    timers[id] = setTimeout(function () {
      delete timers[id];
      enqueue(id);
    }, DEBOUNCE);
    return true;
  }
  /* immediate — the manual retry path (the ⚠ chip) and tests */
  function flush(id) {
    if (timers[id]) { clearTimeout(timers[id]); delete timers[id]; }
    pending[id] = true;
    enqueue(id);
  }
  function enqueue(id) {
    if (queued[id]) return;    // a queued job reads latest state anyway
    queued[id] = true;
    queue.push(id);
    if (!running) next();
  }
  function isPending(id) { return !!pending[id]; }

  /* ---------------- the queue processor (strictly sequential) ---------------- */
  function next() {
    var id = queue.shift();
    if (id == null) { running = false; return; }
    running = true;
    delete queued[id];
    KOS.mediadb.get(id, function (err, entry) {
      if (err || !entry) { delete pending[id]; next(); return; }
      var service = eligible(entry);
      if (!service) { delete pending[id]; next(); return; }
      attempt(entry, service, 0);
    });
  }

  function fieldsFor(entry, service) {
    if (service === "anilist") {
      var f = { mediaId: entry.externalIds.anilistId, status: entry.status,
                progress: entry.progress.current || 0, score: entry.score };
      if (entry.module === "books" && entry.progress.volumes != null) {
        f.progressVolumes = entry.progress.volumes;
      }
      return f;
    }
    /* vndb: status + score only — ulist has no progress field */
    return { status: entry.status, score: entry.score };
  }
  function fieldNames(entry, service) {
    var names = ["status"];
    if (service === "anilist") {
      names.push("progress");
      if (entry.module === "books" && entry.progress.volumes != null) names.push("volumes");
    }
    if (entry.score > 0) names.push("score");
    return names;
  }

  function attempt(entry, service, tries) {
    var fields = fieldsFor(entry, service);
    function done(err) {
      if (!err) { succeed(entry, service); return; }
      if (err.kind === "ratelimit" && tries < MAX_RETRIES) {
        setTimeout(function () { attempt(entry, service, tries + 1); }, (err.retryAfter + 1) * 1000);
        return;
      }
      /* VNDB write network errors are the CORS wall — one attempt is the
         honest number. Other transient failures get MAX_RETRIES. */
      var retriable = err.kind === "network" || err.kind === "http";
      if (service === "vndb" && err.kind === "network") retriable = false;
      if (retriable && tries < MAX_RETRIES) {
        setTimeout(function () { attempt(entry, service, tries + 1); }, RETRY_WAIT);
        return;
      }
      fail(entry, service, err);
    }
    if (service === "anilist") {
      KOS.anilist.getConnection(function (e1, conn) {
        if (e1 || !conn.token) { done({ kind: "auth", message: "AniList isn't connected — connect from Sync & Import to push changes." }); return; }
        KOS.anilist.saveListEntry(conn.token, fields, function (err) { done(err); });
      });
    } else {
      KOS.vndb.getConnection(function (e1, conn) {
        if (e1 || !conn.token) { done({ kind: "auth", message: "VNDB isn't connected — connect from Sync & Import to push changes." }); return; }
        KOS.vndb.setUlist(conn.token, entry.externalIds.vndbId, fields, done);
      });
    }
  }

  function succeed(entry, service) {
    var id = entry.id;
    /* re-read: the user may have edited again while the request flew */
    KOS.mediadb.get(id, function (err, fresh) {
      var e = fresh || entry;
      e.lastSyncedAt = Date.now();
      e.push = null;
      /* the put below also absorbs the reward watermark (3j) — a pull that
         echoes back exactly what was just pushed can never reward twice */
      KOS.mediadb.put(e, function () {
        appendLog({ ts: Date.now(), entryId: id, title: e.title, service: service,
                    fields: fieldNames(e, service), ok: true }, function () {
          delete pending[id];
          next();
        });
      });
    });
  }
  /* VNDB's CORS wall makes every browser write fail identically — the
     full toast fires once per session, later failures just set the chip */
  var vndbCorsToasted = false;
  function fail(entry, service, err) {
    var id = entry.id;
    KOS.mediadb.get(id, function (e2, fresh) {
      var e = fresh || entry;
      e.push = { state: "failed", error: err.message || "Push failed.", ts: Date.now() };
      KOS.mediadb.put(e, function () {
        appendLog({ ts: Date.now(), entryId: id, title: e.title, service: service,
                    fields: fieldNames(e, service), ok: false, error: err.message || "" }, function () {
          delete pending[id];
          var quiet = service === "vndb" && err.kind === "network" && vndbCorsToasted;
          if (service === "vndb" && err.kind === "network") vndbCorsToasted = true;
          if (!quiet && KOS.ui && KOS.ui.toast) {
            KOS.ui.toast("Couldn't sync “" + e.title + "” to " + (service === "anilist" ? "AniList" : "VNDB") +
              " — tap the ⚠ on its card to see why and retry.", true);
          }
          next();
        });
      });
    });
  }

  KOS.mediapush = {
    DEBOUNCE: DEBOUNCE,
    eligible: eligible,
    snapshot: snapshot,
    schedule: schedule,
    flush: flush,
    isPending: isPending,
    getLog: getLog,
    /* test seams — smoke7 shrinks the waits so backoff is observable */
    _config: function (opts) {
      if (opts.debounce != null) DEBOUNCE = opts.debounce;
      if (opts.retryWait != null) RETRY_WAIT = opts.retryWait;
    }
  };
})();
