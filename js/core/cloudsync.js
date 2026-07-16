/* Kurenai OS — core/cloudsync.js
   The multi-device sync engine (Build 4a). Supabase is an ADDITIONAL
   replication layer: localStorage + IndexedDB remain the primary write path,
   every feature keeps working signed out, offline, or with no configuration
   at all. A failed sync never touches the successful local save.

   THE MODEL — three sync units mirroring the three local layers:
   - kos_state:  the whole KOS.store.state document, one row per user.
                 Document-level last-write-wins (mirrors the R3 export
                 architecture): concurrent edits to unrelated fields on two
                 devices can overwrite each other — a documented, deliberate
                 trade-off, stated in Help.
   - kos_media:  one row per vault entry, keyed by the entry's syncId
                 (mediadb v8). Per-entry last-write-wins.
   - kos_files:  attachment METADATA (auto-synced). Binary content uploads
                 only through the explicit "Sync files now" action, into the
                 private kos-attachments bucket under <uid>/<fileId>/<name>.

   TIMESTAMPS — all remote updated_at values are SERVER-generated (trigger);
   the client never supplies one and never compares its own clock against
   the server's. Dirtiness is derived locally instead:
   - a media entry is dirty iff entry.updatedAt !== meta.cleanLocal, where
     cleanLocal is the LOCAL updatedAt recorded at the last successful push
     or pull-apply of that entry (client clock vs itself — skew-proof);
   - the state doc is dirty iff hash(state) !== meta.lastPushedHash.
   Because dirtiness is derived, a missed change notification is only a
   missed shortcut — the next cycle still finds the work.

   ORDER — push first, then pull (autosync doctrine: local edits are the
   newest truth). Echo protection: applying a push records the returned
   updated_at, and the pull skips any row whose updated_at we recorded —
   our own writes can never boomerang into another push. Ties: a row with
   an updated_at equal to the recorded one is by construction the same
   write → no-op; a genuinely newer remote row simply applies.

   REWARD NEUTRALITY — this engine NEVER calls KOS.sessions.log or
   KOS.media.logActivity and never schedules a mediapush. Pull-applies go
   through mediadb.put/add, which absorb the reward watermark, so progress
   rewarded on one device is silently absorbed on the others (single reward
   across the fleet). Deletions applied from remote use skipTombstone so a
   pulled deletion can't re-queue itself.

   FIRST LINK — on the first sign-in of an account this engine classifies
   local/remote emptiness and NEVER auto-destroys either side: local-only
   data waits for an explicit upload confirmation; remote-only data adopts
   automatically (local side empty = nothing to lose); data on both sides
   merges media per-entry and asks explicitly which state document to keep.
   An empty remote can never silently replace non-empty local data.        */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  /* ---------------- tunables (test seams via _config) ---------------- */
  var PUSH_DEBOUNCE = 4000;        // quiet period after a local change
  var INTERVAL = 5 * 60 * 1000;    // background cycle while the app is open
  var MIN_PULL_GAP = 60 * 1000;    // focus/visibility cycles at most this often
  var BOOT_DELAY = 3000;           // after boot (env.local.js is deferred)
  var PAGE = 500;                  // pull page size
  var UPSERT_CHUNK = 50;           // media rows per upsert batch
  var QUIET = false;               // suppress toasts (tests)

  var BUCKET = "kos-attachments";
  var META_PREFIX = "cloudsync.meta.";            // + userId → the account's sync meta
  var RESTORE_FLAG = "cloudsync.restorePending";  // set by store.importFull
  var DELETES_KEY = "cloudsync.pendingDeletes";       // owned by mediadb
  var FILE_DELETES_KEY = "cloudsync.filesPendingDeletes"; // owned by attachments

  var running = false;
  var queuedCycle = false;
  var lastCycleEnd = 0;
  var debounceTimer = null;
  var intervalTimer = null;
  var pendingHint = false;
  var linkPending = null;          // {kind:"localOnly"|"both", remoteStateRow} while user input is needed
  var lastError = null;
  var lastSyncAt = null;
  var started = false;

  var _api = null;                 // injected fake api (tests)
  var _session = null;             // injected fake session (tests)

  /* ---------------- status model ---------------- */
  var statusListeners = [];
  var status = { state: "unconfigured", detail: "", lastSyncAt: null, pendingLink: null };
  function setStatus(state, detail) {
    status = { state: state, detail: detail || "", lastSyncAt: lastSyncAt,
               pendingLink: linkPending ? linkPending.kind : null };
    statusListeners.forEach(function (fn) {
      try { fn(status); } catch (e) { console.warn("cloudsync status listener failed", e); }
    });
  }
  function onStatus(fn) { if (typeof fn === "function") { statusListeners.push(fn); try { fn(status); } catch (e) {} } }

  /* ---------------- small utilities ---------------- */
  function online() { return typeof navigator === "undefined" || navigator.onLine !== false; }
  function uid() { return _session ? _session.userId : (KOS.cloud ? KOS.cloud.userId() : null); }
  function ready() {
    if (_api && _session) return true;
    return !!(KOS.cloud && KOS.cloud.available() && KOS.mediadb && KOS.mediadb.available());
  }
  function tsMs(v) {
    if (!v) return 0;
    var n = Date.parse(v);
    return isNaN(n) ? 0 : n;
  }
  /* FNV-1a + length — "did the document change", not cryptography */
  function hashStr(s) {
    var h = 0x811c9dc5;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h >>> 0) * 0x01000193 >>> 0;
    }
    return ("0000000" + h.toString(16)).slice(-8) + ":" + s.length;
  }
  function safeName(n) {
    n = String(n || "file").replace(/[^\w.\- ]+/g, "_").replace(/\s+/g, "_");
    if (n.length > 100) n = n.slice(-100);
    return n || "file";
  }
  function storagePath(fileId, name) { return uid() + "/" + fileId + "/" + safeName(name); }
  function toast(msg, bad) { if (!QUIET && KOS.ui && KOS.ui.toast) KOS.ui.toast(msg, bad); }

  function stateMeaningful(s) {
    if (!s || typeof s !== "object") return false;
    return !!(Object.keys(s.progress || {}).length ||
      (s.sessions || []).length ||
      (s.custom && s.custom.cards && s.custom.cards.length) ||
      (s.wishlist && s.wishlist.items && s.wishlist.items.length) ||
      (s.tracker && s.tracker.entries && s.tracker.entries.length) ||
      (s.goals && s.goals.items && s.goals.items.length) ||
      (s.calendar && s.calendar.events && s.calendar.events.length > 3) ||
      (s.governor && ((s.governor.xp || 0) > 0 || (s.governor.gold || 0) > 0 ||
        (s.governor.owned || []).length)));
  }

  /* ---------------- account-scoped sync meta ----------------
     One kv record per account: watermarks, echo fingerprints, pull cursors,
     the linked flag. cloudsync.* keys are excluded from backups (mediadb). */
  function blankMeta() {
    return {
      linked: false,
      state: { remoteTs: null, lastPushedHash: null },
      media: {},     // syncId → {remoteTs, cleanLocal, deleted?}
      files: {},     // fileId → {remoteTs, cleanLocal, uploaded}
      cursor: { media: null, files: null }
    };
  }
  function loadMeta(cb) {
    KOS.mediadb.getKV(META_PREFIX + uid(), function (err, m) {
      if (err) { cb(err); return; }
      var meta = m && typeof m === "object" ? m : blankMeta();
      meta.state = meta.state || { remoteTs: null, lastPushedHash: null };
      meta.media = meta.media || {};
      meta.files = meta.files || {};
      meta.cursor = meta.cursor || { media: null, files: null };
      cb(null, meta);
    });
  }
  function saveMeta(meta, cb) {
    KOS.mediadb.setKV(META_PREFIX + uid(), meta, function () { cb && cb(null); });
  }

  /* ---------------- the Supabase boundary ----------------
     Every remote call goes through this one object; tests replace it whole
     via _config({api}). Callbacks are (err, data); errors carry message
     only — no tokens, no raw response objects.                            */
  function apiErr(e, fallback) {
    var msg = (e && (e.message || e.error_description || e.details)) || fallback || "Cloud request failed.";
    return new Error(String(msg));
  }
  function realApi() {
    function c() { return KOS.cloud.client(); }
    function run(builder, cb, what) {
      builder.then(function (res) {
        if (res.error) { cb(apiErr(res.error, what + " failed.")); return; }
        cb(null, res.data, res.count);
      }).catch(function (e) { cb(apiErr(e, what + " failed — network?")); });
    }
    return {
      fetchState: function (cb) {
        run(c().from("kos_state").select("state_json, updated_at").maybeSingle(), cb, "State pull");
      },
      upsertState: function (json, cb) {
        run(c().from("kos_state")
          .upsert({ user_id: uid(), state_json: json }, { onConflict: "user_id" })
          .select("updated_at").single(), cb, "State push");
      },
      fetchMediaSince: function (sinceIso, offset, cb) {
        var q = c().from("kos_media").select("entry_id, module, data_json, deleted, updated_at");
        if (sinceIso) q = q.gt("updated_at", sinceIso);
        run(q.order("updated_at", { ascending: true }).range(offset, offset + PAGE - 1), cb, "Media pull");
      },
      upsertMedia: function (rows, cb) {
        run(c().from("kos_media")
          .upsert(rows, { onConflict: "user_id,entry_id" })
          .select("entry_id, updated_at"), cb, "Media push");
      },
      countMedia: function (cb) {
        run(c().from("kos_media").select("entry_id", { count: "exact", head: true }).eq("deleted", false),
          function (err, data, count) { cb(err, count || 0); }, "Media count");
      },
      listMediaIds: function (offset, cb) {
        run(c().from("kos_media").select("entry_id").eq("deleted", false)
          .order("entry_id", { ascending: true }).range(offset, offset + 999), cb, "Media inventory");
      },
      fetchFilesSince: function (sinceIso, offset, cb) {
        var q = c().from("kos_files").select("file_id, entry_id, name, mime_type, size, meta_json, binary_uploaded, deleted, updated_at");
        if (sinceIso) q = q.gt("updated_at", sinceIso);
        run(q.order("updated_at", { ascending: true }).range(offset, offset + PAGE - 1), cb, "File-metadata pull");
      },
      upsertFiles: function (rows, cb) {
        run(c().from("kos_files")
          .upsert(rows, { onConflict: "user_id,file_id" })
          .select("file_id, updated_at"), cb, "File-metadata push");
      },
      listFileIds: function (offset, cb) {
        run(c().from("kos_files").select("file_id").eq("deleted", false)
          .order("file_id", { ascending: true }).range(offset, offset + 999), cb, "File inventory");
      },
      markUploaded: function (fileId, cb) {
        run(c().from("kos_files").update({ binary_uploaded: true })
          .eq("user_id", uid()).eq("file_id", fileId).select("updated_at"), cb, "Upload flag");
      },
      uploadBinary: function (path, blob, mime, cb) {
        c().storage.from(BUCKET).upload(path, blob, { contentType: mime || "application/octet-stream", upsert: true })
          .then(function (res) { res.error ? cb(apiErr(res.error, "Upload failed.")) : cb(null, res.data); })
          .catch(function (e) { cb(apiErr(e, "Upload failed — network?")); });
      },
      downloadBinary: function (path, cb) {
        c().storage.from(BUCKET).download(path)
          .then(function (res) { res.error ? cb(apiErr(res.error, "Download failed.")) : cb(null, res.data); })
          .catch(function (e) { cb(apiErr(e, "Download failed — network?")); });
      },
      removeBinary: function (paths, cb) {
        c().storage.from(BUCKET).remove(paths)
          .then(function (res) { res.error ? cb(apiErr(res.error, "Remote file delete failed.")) : cb(null); })
          .catch(function (e) { cb(apiErr(e, "Remote file delete failed — network?")); });
      }
    };
  }
  function api() { return _api || realApi(); }

  /* ---------------- push: the state document ---------------- */
  function pushState(meta, done) {
    var s = JSON.stringify(KOS.store.state);
    var h = hashStr(s);
    if (meta.state.lastPushedHash === h) { done(null); return; }
    api().upsertState(JSON.parse(s), function (err, row) {
      if (err) { done(err); return; }
      meta.state.lastPushedHash = h;
      meta.state.remoteTs = row && row.updated_at ? row.updated_at : meta.state.remoteTs;
      done(null);
    });
  }

  /* ---------------- push: media entries ---------------- */
  function entryPayload(e) {
    var json = {};
    Object.keys(e).forEach(function (k) { if (k !== "id") json[k] = e[k]; });
    return { user_id: uid(), entry_id: e.syncId, module: e.module, data_json: json, deleted: false };
  }
  function pushMedia(meta, done) {
    KOS.mediadb.query({}, function (err, entries) {
      if (err) { done(err); return; }
      var byId = {};
      var dirty = entries.filter(function (e) {
        if (!e.syncId) return false;
        byId[e.syncId] = e;
        var m = meta.media[e.syncId];
        return !m || m.cleanLocal !== e.updatedAt;
      });
      if (!dirty.length) { done(null, 0); return; }
      var i = 0, pushed = 0;
      (function chunk() {
        if (i >= dirty.length) { done(null, pushed); return; }
        var slice = dirty.slice(i, i + UPSERT_CHUNK);
        i += UPSERT_CHUNK;
        api().upsertMedia(slice.map(entryPayload), function (err2, rows) {
          if (err2) { done(err2); return; }
          (rows || []).forEach(function (r) {
            var local = byId[r.entry_id];
            if (local) meta.media[r.entry_id] = { remoteTs: r.updated_at, cleanLocal: local.updatedAt };
          });
          pushed += slice.length;
          chunk();
        });
      })();
    });
  }

  /* ---------------- push: media deletions (tombstones) ---------------- */
  function pushMediaDeletes(meta, done) {
    KOS.mediadb.getKV(DELETES_KEY, function (err, q) {
      q = Array.isArray(q) ? q : [];
      if (err || !q.length) { done(null); return; }
      var rows = q.map(function (t) {
        return { user_id: uid(), entry_id: t.syncId, module: t.module || "anime", data_json: {}, deleted: true };
      });
      api().upsertMedia(rows, function (err2, res) {
        if (err2) { done(err2); return; }
        (res || []).forEach(function (r) {
          meta.media[r.entry_id] = { remoteTs: r.updated_at, deleted: true };
        });
        var pushedIds = {};
        q.forEach(function (t) { pushedIds[t.syncId] = true; });
        /* re-read: a delete may have queued while the request flew */
        KOS.mediadb.getKV(DELETES_KEY, function (e3, cur) {
          cur = Array.isArray(cur) ? cur : [];
          var remain = cur.filter(function (t) { return !pushedIds[t.syncId]; });
          KOS.mediadb.setKV(DELETES_KEY, remain, function () { done(null); });
        });
      });
    });
  }

  /* ---------------- push: attachment metadata + deletions ---------------- */
  function filePayload(m) {
    return {
      user_id: uid(), file_id: m.fileId,
      entry_id: m.subject + ":" + m.ref,
      name: m.name, mime_type: m.mime || null, size: m.size || 0,
      meta_json: { subject: m.subject, ref: m.ref, note: m.note || "", added: m.added || null },
      deleted: false
      /* binary_uploaded deliberately absent — metadata pushes must never
         reset another device's upload flag */
    };
  }
  function pushFiles(meta, done) {
    if (!KOS.attach || !KOS.attach.available()) { done(null); return; }
    KOS.attach.listMeta(function (err, items) {
      if (err) { done(err); return; }
      var byId = {};
      var dirty = items.filter(function (m) {
        if (!m.fileId) return false;
        byId[m.fileId] = m;
        var f = meta.files[m.fileId];
        return !f || f.cleanLocal !== m.updatedAt;
      });
      if (!dirty.length) { done(null); return; }
      api().upsertFiles(dirty.map(filePayload), function (err2, rows) {
        if (err2) { done(err2); return; }
        (rows || []).forEach(function (r) {
          var local = byId[r.file_id];
          var prev = meta.files[r.file_id] || {};
          if (local) meta.files[r.file_id] = { remoteTs: r.updated_at, cleanLocal: local.updatedAt, uploaded: !!prev.uploaded };
        });
        done(null);
      });
    });
  }
  function pushFileDeletes(meta, done) {
    KOS.mediadb.getKV(FILE_DELETES_KEY, function (err, q) {
      q = Array.isArray(q) ? q : [];
      if (err || !q.length) { done(null); return; }
      var rows = q.map(function (t) {
        return { user_id: uid(), file_id: t.fileId, entry_id: null, name: t.name || "(deleted)",
                 mime_type: null, size: 0, meta_json: {}, deleted: true };
      });
      api().upsertFiles(rows, function (err2, res) {
        if (err2) { done(err2); return; }
        (res || []).forEach(function (r) {
          meta.files[r.file_id] = { remoteTs: r.updated_at, deleted: true };
        });
        /* deliberate deletion semantics: a user deletion also removes the
           uploaded binary — best-effort; the tombstone row is the truth */
        var paths = q.filter(function (t) { return t.name; })
          .map(function (t) { return storagePath(t.fileId, t.name); });
        function clearQueue() {
          var pushedIds = {};
          q.forEach(function (t) { pushedIds[t.fileId] = true; });
          KOS.mediadb.getKV(FILE_DELETES_KEY, function (e3, cur) {
            cur = Array.isArray(cur) ? cur : [];
            var remain = cur.filter(function (t) { return !pushedIds[t.fileId]; });
            KOS.mediadb.setKV(FILE_DELETES_KEY, remain, function () { done(null); });
          });
        }
        if (paths.length) api().removeBinary(paths, function () { clearQueue(); });
        else clearQueue();
      });
    });
  }

  /* ---------------- pull: the state document ---------------- */
  function rerenderCurrent() {
    try {
      if (KOS.refreshHUD) KOS.refreshHUD();
      if (KOS.refreshRailCounters) KOS.refreshRailCounters();
      if (!KOS.views || !KOS.show) return;
      var ui = KOS.store.state.ui || {};
      var view = ui.view || "home";
      if (view === "ref") {
        var sid = ui.subject, ref = ui.lastRef && ui.lastRef[sid];
        if (sid && ref) KOS.show("ref", { subject: sid, ref: ref });
        else if (KOS.views.home) KOS.show("home");
      } else if (view === "subject" && KOS.views.subject) {
        KOS.show("subject", ui.subject || "compsci");
      } else if (KOS.views[view]) {
        KOS.show(view);
      }
    } catch (e) { console.warn("cloudsync: rerender after remote apply failed", e); }
  }
  function applyRemoteState(row, meta, done) {
    var incoming = row.state_json;
    if (!incoming || typeof incoming !== "object" || !("progress" in incoming)) {
      done(new Error("The cloud copy of the app state looks invalid — not applied."));
      return;
    }
    /* an empty remote must never clobber meaningful local data */
    if (!stateMeaningful(incoming) && stateMeaningful(KOS.store.state)) {
      console.warn("cloudsync: remote state is empty while local has data — refusing to apply.");
      meta.state.remoteTs = row.updated_at;   // acknowledged, not applied; the next push overwrites it
      meta.state.lastPushedHash = null;
      done(null, false);
      return;
    }
    KOS.store.replaceState(incoming);
    meta.state.remoteTs = row.updated_at;
    meta.state.lastPushedHash = hashStr(JSON.stringify(KOS.store.state));
    rerenderCurrent();
    done(null, true);
  }
  function pullState(meta, done) {
    api().fetchState(function (err, row) {
      if (err) { done(err); return; }
      if (!row) { done(null, false); return; }
      if (tsMs(row.updated_at) <= tsMs(meta.state.remoteTs)) { done(null, false); return; }
      applyRemoteState(row, meta, done);
    });
  }

  /* ---------------- pull: media entries ---------------- */
  function applyMediaRow(row, meta, out, next) {
    var m = meta.media[row.entry_id];
    /* echo of our own push, or nothing newer than we already recorded */
    if (m && tsMs(row.updated_at) <= tsMs(m.remoteTs)) { next(); return; }
    if (row.deleted) {
      KOS.mediadb.getBySyncId(row.entry_id, function (err, local) {
        function fin() {
          meta.media[row.entry_id] = { remoteTs: row.updated_at, deleted: true };
          out.deleted++;
          next();
        }
        if (err || !local) { fin(); return; }
        KOS.mediadb.remove(local.id, function () { fin(); }, { skipTombstone: true });
      });
      return;
    }
    var rec = row.data_json && typeof row.data_json === "object" ? row.data_json : {};
    rec.syncId = row.entry_id;
    KOS.mediadb.getBySyncId(row.entry_id, function (err, local) {
      if (err) { next(); return; }
      if (local && m && local.updatedAt !== m.cleanLocal) {
        /* the local copy changed since our last common state — local wins
           (it pushes next cycle and overwrites this remote row) */
        next();
        return;
      }
      function saved(e2, recSaved) {
        if (!e2 && recSaved) {
          meta.media[row.entry_id] = { remoteTs: row.updated_at, cleanLocal: recSaved.updatedAt };
          out.applied++;
        }
        next();
      }
      if (local) { rec.id = local.id; KOS.mediadb.put(rec, saved); }
      else { delete rec.id; KOS.mediadb.add(rec, saved); }
    });
  }
  function pullMedia(meta, done) {
    var out = { applied: 0, deleted: 0 };
    var since = meta.cursor.media;
    var offset = 0, maxTs = since;
    (function page() {
      api().fetchMediaSince(since, offset, function (err, rows) {
        if (err) { done(err, out); return; }
        rows = rows || [];
        var i = 0;
        (function step() {
          if (i >= rows.length) {
            if (rows.length === PAGE) { offset += PAGE; page(); }
            else { meta.cursor.media = maxTs; done(null, out); }
            return;
          }
          var row = rows[i++];
          if (!maxTs || tsMs(row.updated_at) > tsMs(maxTs)) maxTs = row.updated_at;
          applyMediaRow(row, meta, out, step);
        })();
      });
    })();
  }

  /* ---------------- pull: attachment metadata ---------------- */
  function applyFileRow(row, meta, out, next) {
    var f = meta.files[row.file_id];
    if (f && tsMs(row.updated_at) <= tsMs(f.remoteTs)) { next(); return; }
    if (!KOS.attach || !KOS.attach.available()) { next(); return; }
    if (row.deleted) {
      KOS.attach.getByFileId(row.file_id, function (err, local) {
        function fin() {
          meta.files[row.file_id] = { remoteTs: row.updated_at, deleted: true };
          out.deleted++;
          next();
        }
        if (err || !local) { fin(); return; }
        KOS.attach.remove(local.id, function () { fin(); }, { skipTombstone: true });
      });
      return;
    }
    var mj = row.meta_json || {};
    KOS.attach.putRemoteMeta({
      fileId: row.file_id,
      subject: mj.subject || (row.entry_id ? String(row.entry_id).split(":")[0] : ""),
      ref: mj.ref || (row.entry_id ? String(row.entry_id).split(":").slice(1).join(":") : ""),
      name: row.name, mime: row.mime_type, size: row.size,
      note: mj.note || "", added: mj.added || null,
      updatedAt: tsMs(row.updated_at)
    }, function (err, rec) {
      if (!err && rec) {
        meta.files[row.file_id] = { remoteTs: row.updated_at, cleanLocal: rec.updatedAt,
                                    uploaded: !!row.binary_uploaded };
        out.applied++;
      }
      next();
    });
  }
  function pullFiles(meta, done) {
    var out = { applied: 0, deleted: 0 };
    var since = meta.cursor.files;
    var offset = 0, maxTs = since;
    (function page() {
      api().fetchFilesSince(since, offset, function (err, rows) {
        if (err) { done(err, out); return; }
        rows = rows || [];
        var i = 0;
        (function step() {
          if (i >= rows.length) {
            if (rows.length === PAGE) { offset += PAGE; page(); }
            else { meta.cursor.files = maxTs; done(null, out); }
            return;
          }
          var row = rows[i++];
          if (!maxTs || tsMs(row.updated_at) > tsMs(maxTs)) maxTs = row.updated_at;
          applyFileRow(row, meta, out, step);
        })();
      });
    })();
  }

  /* ---------------- first link ---------------- */
  function assessLink(meta, done) {
    KOS.mediadb.count(null, function (e1, localMedia) {
      function withFiles(localFiles) {
        var localHas = stateMeaningful(KOS.store.state) || localMedia > 0 || localFiles > 0;
        api().fetchState(function (e2, stateRow) {
          if (e2) { done(e2); return; }
          api().countMedia(function (e3, remoteMedia) {
            if (e3) { done(e3); return; }
            var remoteHas = (stateRow && stateMeaningful(stateRow.state_json)) || remoteMedia > 0;
            if (!localHas && !remoteHas) done(null, { kind: "fresh" });
            else if (localHas && !remoteHas) done(null, { kind: "localOnly" });
            else if (!localHas && remoteHas) done(null, { kind: "remoteOnly", stateRow: stateRow });
            else done(null, { kind: "both", stateRow: stateRow });
          });
        });
      }
      if (KOS.attach && KOS.attach.available()) {
        KOS.attach.listMeta(function (e4, items) { withFiles((items || []).length); });
      } else withFiles(0);
    });
  }

  /* adopt everything remote onto an empty device */
  function adoptRemote(meta, done) {
    pullState(meta, function (e1) {
      if (e1) { done(e1); return; }
      pullMedia(meta, function (e2) {
        if (e2) { done(e2); return; }
        pullFiles(meta, function (e3) {
          if (e3) { done(e3); return; }
          meta.linked = true;
          done(null);
        });
      });
    });
  }

  /* the "both sides have data" merge: media per-entry (adopt-or-insert with
     external-id and title fallbacks so the same show tracked on two devices
     becomes ONE row, not two), files by fileId, state doc by explicit user
     choice. The one place local client time meets server time is the
     newer-copy decision for a matched pair — a one-time, first-link-only
     comparison, documented in Help. */
  function firstLinkMerge(stateChoice, meta, done) {
    KOS.mediadb.query({}, function (err, locals) {
      if (err) { done(err); return; }
      var bySync = {}, byExt = { anilist: {}, mal: {}, vndb: {} }, byTitleMod = {};
      locals.forEach(function (e) {
        if (e.syncId) bySync[e.syncId] = e;
        var x = e.externalIds || {};
        if (x.anilistId != null) byExt.anilist[e.module + "|" + x.anilistId] = e;
        if (x.malId != null) byExt.mal[e.module + "|" + x.malId] = e;
        if (x.vndbId != null) byExt.vndb[e.module + "|" + x.vndbId] = e;
        var tk = e.module + "|" + (e.titleLower || String(e.title || "").toLowerCase());
        if (!byTitleMod[tk]) byTitleMod[tk] = e;
      });
      var claimed = {};   // local id → already matched to a remote row
      function matchLocal(row) {
        var d = row.data_json || {};
        var cand = bySync[row.entry_id] || null;
        var x = d.externalIds || {};
        if (!cand && x.anilistId != null) cand = byExt.anilist[row.module + "|" + x.anilistId];
        if (!cand && x.malId != null) cand = byExt.mal[row.module + "|" + x.malId];
        if (!cand && x.vndbId != null) cand = byExt.vndb[row.module + "|" + x.vndbId];
        if (!cand && d.title) cand = byTitleMod[row.module + "|" + String(d.title).toLowerCase()];
        if (cand && claimed[cand.id]) return null;
        return cand || null;
      }
      var offset = 0, maxTs = null;
      (function page() {
        api().fetchMediaSince(null, offset, function (e2, rows) {
          if (e2) { done(e2); return; }
          rows = rows || [];
          var i = 0;
          (function step() {
            if (i >= rows.length) {
              if (rows.length === PAGE) { offset += PAGE; page(); return; }
              finishState();
              return;
            }
            var row = rows[i++];
            if (!maxTs || tsMs(row.updated_at) > tsMs(maxTs)) maxTs = row.updated_at;
            if (row.deleted) { meta.media[row.entry_id] = { remoteTs: row.updated_at, deleted: true }; step(); return; }
            var local = matchLocal(row);
            if (!local) {
              var rec = row.data_json && typeof row.data_json === "object" ? row.data_json : {};
              rec.syncId = row.entry_id;
              delete rec.id;
              KOS.mediadb.add(rec, function (e3, saved) {
                if (!e3 && saved) meta.media[row.entry_id] = { remoteTs: row.updated_at, cleanLocal: saved.updatedAt };
                step();
              });
              return;
            }
            claimed[local.id] = true;
            var remoteNewer = tsMs(row.updated_at) > (local.updatedAt || 0);
            if (remoteNewer) {
              var rec2 = row.data_json && typeof row.data_json === "object" ? row.data_json : {};
              rec2.syncId = row.entry_id;
              rec2.id = local.id;
              KOS.mediadb.put(rec2, function (e4, saved) {
                if (!e4 && saved) meta.media[row.entry_id] = { remoteTs: row.updated_at, cleanLocal: saved.updatedAt };
                step();
              });
            } else {
              /* keep the local copy, adopt the remote identity, leave it
                 dirty so the next push uploads local content over it */
              local.syncId = row.entry_id;
              KOS.mediadb.put(local, function (e5, saved) {
                if (!e5 && saved) meta.media[row.entry_id] = { remoteTs: row.updated_at, cleanLocal: null };
                step();
              });
            }
          })();
        });
      })();
      function finishState() {
        meta.cursor.media = maxTs;
        pullFiles(meta, function (e6) {
          if (e6) { done(e6); return; }
          if (stateChoice === "cloud" && linkPending && linkPending.stateRow) {
            applyRemoteState(linkPending.stateRow, meta, function (e7) {
              if (e7) { done(e7); return; }
              meta.linked = true;
              done(null);
            });
          } else {
            /* keep this device's state: leave the hash null so the push
               phase uploads it over the cloud copy */
            meta.state.lastPushedHash = null;
            if (linkPending && linkPending.stateRow) meta.state.remoteTs = linkPending.stateRow.updated_at;
            meta.linked = true;
            done(null);
          }
        });
      }
    });
  }

  /* ---------------- restore reconcile ----------------
     After importFull the local data is authoritative: every watermark is
     stale, and remote rows the backup no longer contains must be
     tombstoned — otherwise the next pull resurrects them.               */
  function restoreReconcile(meta, done) {
    meta.media = {};
    meta.files = {};
    meta.state = { remoteTs: null, lastPushedHash: null };
    KOS.mediadb.query({}, function (err, locals) {
      if (err) { done(err); return; }
      var have = {};
      locals.forEach(function (e) { if (e.syncId) have[e.syncId] = true; });
      var missing = [];
      var offset = 0;
      (function page() {
        api().listMediaIds(offset, function (e2, rows) {
          if (e2) { done(e2); return; }
          rows = rows || [];
          rows.forEach(function (r) { if (!have[r.entry_id]) missing.push(r.entry_id); });
          if (rows.length === 1000) { offset += 1000; page(); return; }
          filesPass();
        });
      })();
      function filesPass() {
        var haveF = {}, missingF = [];
        function finish() {
          var q = missing.map(function (id) { return { syncId: id, module: "anime", ts: Date.now() }; });
          KOS.mediadb.recordTombstones(q, function () {
            if (!missingF.length) { KOS.mediadb.setKV(RESTORE_FLAG, false, function () { done(null); }); return; }
            KOS.mediadb.getKV(FILE_DELETES_KEY, function (e5, cur) {
              cur = Array.isArray(cur) ? cur : [];
              missingF.forEach(function (id) { cur.push({ fileId: id, ts: Date.now() }); });
              KOS.mediadb.setKV(FILE_DELETES_KEY, cur, function () {
                KOS.mediadb.setKV(RESTORE_FLAG, false, function () { done(null); });
              });
            });
          });
        }
        if (!KOS.attach || !KOS.attach.available()) { finish(); return; }
        KOS.attach.listMeta(function (e3, items) {
          (items || []).forEach(function (m) { if (m.fileId) haveF[m.fileId] = true; });
          var offsetF = 0;
          (function pageF() {
            api().listFileIds(offsetF, function (e4, rows) {
              if (e4) { done(e4); return; }
              rows = rows || [];
              rows.forEach(function (r) { if (!haveF[r.file_id]) missingF.push(r.file_id); });
              if (rows.length === 1000) { offsetF += 1000; pageF(); return; }
              finish();
            });
          })();
        });
      }
    });
  }

  /* ---------------- one full cycle ---------------- */
  function cycle(reason, cb) {
    cb = cb || function () {};
    if (!ready()) { setStatus("unconfigured"); cb(null, null); return; }
    if (!uid()) { setStatus("signedOut"); cb(null, null); return; }
    if (!online()) { setStatus("offline", pendingHint ? "changes pending" : ""); cb(null, null); return; }
    if (running) { queuedCycle = true; cb(null, null); return; }
    running = true;
    lastError = null;
    setStatus("syncing");

    function finish(err, summary) {
      running = false;
      lastCycleEnd = Date.now();
      if (err) {
        lastError = err;
        setStatus("error", err.message);
      } else if (linkPending) {
        setStatus("attention", linkPending.kind === "localOnly"
          ? "Local data is ready to upload — confirm from Archive → Cloud Sync."
          : "Data exists locally AND in the cloud — choose how to merge from Archive → Cloud Sync.");
      } else {
        pendingHint = false;
        lastSyncAt = Date.now();
        setStatus("synced");
        if (summary && (summary.applied || summary.deleted)) {
          toast("Cloud sync: " + (summary.applied ? summary.applied + " item" + (summary.applied === 1 ? "" : "s") + " updated from your other device" : "") +
            (summary.applied && summary.deleted ? ", " : "") +
            (summary.deleted ? summary.deleted + " removed" : "") + ".");
        }
      }
      if (queuedCycle) { queuedCycle = false; setTimeout(function () { cycle("queued"); }, 250); }
      cb(err || null, summary || null);
    }

    loadMeta(function (e0, meta) {
      if (e0) { finish(e0); return; }

      function main() {
        KOS.mediadb.getKV(RESTORE_FLAG, function (eR, restorePending) {
          function afterReconcile(eRec) {
            if (eRec) { saveMeta(meta, function () { finish(eRec); }); return; }
            pushState(meta, function (e1) {
              if (e1) { saveMeta(meta, function () { finish(e1); }); return; }
              pushMediaDeletes(meta, function (e2) {
                if (e2) { saveMeta(meta, function () { finish(e2); }); return; }
                pushMedia(meta, function (e3) {
                  if (e3) { saveMeta(meta, function () { finish(e3); }); return; }
                  pushFileDeletes(meta, function (e4) {
                    if (e4) { saveMeta(meta, function () { finish(e4); }); return; }
                    pushFiles(meta, function (e5) {
                      if (e5) { saveMeta(meta, function () { finish(e5); }); return; }
                      pullState(meta, function (e6) {
                        if (e6) { saveMeta(meta, function () { finish(e6); }); return; }
                        pullMedia(meta, function (e7, mOut) {
                          if (e7) { saveMeta(meta, function () { finish(e7); }); return; }
                          pullFiles(meta, function (e8, fOut) {
                            var summary = {
                              applied: (mOut ? mOut.applied : 0) + (fOut ? fOut.applied : 0),
                              deleted: (mOut ? mOut.deleted : 0) + (fOut ? fOut.deleted : 0)
                            };
                            saveMeta(meta, function () { finish(e8 || null, summary); });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          }
          if (restorePending && meta.linked) restoreReconcile(meta, afterReconcile);
          else afterReconcile(null);
        });
      }

      if (meta.linked) { linkPending = null; main(); return; }

      /* first sign-in of this account on this device */
      assessLink(meta, function (eA, res) {
        if (eA) { finish(eA); return; }
        if (res.kind === "fresh") {
          linkPending = null;
          meta.linked = true;
          saveMeta(meta, function () { main(); });
        } else if (res.kind === "remoteOnly") {
          linkPending = null;
          adoptRemote(meta, function (eB) {
            if (eB) { finish(eB); return; }
            saveMeta(meta, function () {
              toast("Cloud data downloaded — this device now mirrors your account.");
              rerenderCurrent();
              main();
            });
          });
        } else {
          /* localOnly / both — explicit user action required; nothing is
             uploaded or overwritten until they choose */
          linkPending = { kind: res.kind, stateRow: res.stateRow || null };
          finish(null);
        }
      });
    });
  }

  /* ---------------- explicit user actions ---------------- */
  /* first-time migration: validate via the R3 serializer, then link and let
     the normal (idempotent) push machinery upload everything */
  function migrateUp(cb) {
    if (!linkPending || linkPending.kind !== "localOnly") { cb(new Error("No pending upload.")); return; }
    KOS.store.snapshotFull(function (err, snapshot) {
      if (err) { cb(err); return; }
      if (!snapshot || !snapshot.state || typeof snapshot.state !== "object" || !("progress" in snapshot.state)) {
        cb(new Error("The local data snapshot failed validation — nothing was uploaded."));
        return;
      }
      loadMeta(function (e0, meta) {
        if (e0) { cb(e0); return; }
        meta.linked = true;
        meta.state.lastPushedHash = null;   // force the state push
        linkPending = null;
        saveMeta(meta, function () {
          cycle("migrate", function (e1) {
            if (e1) { cb(e1); return; }
            toast("Local data uploaded — this account now syncs across devices.");
            cb(null, {
              entries: snapshot.mediaEntries.length,
              attachments: snapshot.attachments.length
            });
          });
        });
      });
    });
  }
  /* the "both sides have data" resolution; stateChoice "device"|"cloud" */
  function resolveBoth(stateChoice, cb) {
    if (!linkPending || linkPending.kind !== "both") { cb(new Error("No pending merge.")); return; }
    loadMeta(function (e0, meta) {
      if (e0) { cb(e0); return; }
      firstLinkMerge(stateChoice === "cloud" ? "cloud" : "device", meta, function (e1) {
        if (e1) { cb(e1); return; }
        linkPending = null;
        saveMeta(meta, function () {
          cycle("merge", function (e2) {
            if (e2) { cb(e2); return; }
            toast("Merged — media combined per entry, study state " +
              (stateChoice === "cloud" ? "taken from the cloud copy." : "kept from this device."));
            cb(null);
          });
        });
      });
    });
  }

  /* explicit binary upload — "Sync files now". cb(err, report). */
  function uploadBinaries(cb) {
    cb = cb || function () {};
    if (!uid()) { cb(new Error("Sign in first.")); return; }
    if (!KOS.attach || !KOS.attach.available()) { cb(new Error("The file store isn't available here.")); return; }
    /* metadata first, so every binary has a row to hang off */
    cycle("pre-upload", function () {
      loadMeta(function (e0, meta) {
        if (e0) { cb(e0); return; }
        KOS.attach.listMeta(function (err, items) {
          if (err) { cb(err); return; }
          var todo = (items || []).filter(function (m) {
            var f = meta.files[m.fileId];
            return m.fileId && m.hasBlob && !(f && f.uploaded);
          });
          var report = { uploaded: 0, skipped: (items || []).length - todo.length, failed: [] };
          var i = 0;
          setStatus("syncing", "uploading files");
          (function step() {
            if (i >= todo.length) {
              saveMeta(meta, function () {
                setStatus(lastError ? "error" : "synced");
                cb(null, report);
              });
              return;
            }
            var m = todo[i++];
            KOS.attach.getByFileId(m.fileId, function (e1, rec) {
              if (e1 || !rec || !rec.blob) {
                report.failed.push({ name: m.name, error: "local read failed" });
                step();
                return;
              }
              api().uploadBinary(storagePath(m.fileId, m.name), rec.blob, m.mime, function (e2) {
                if (e2) { report.failed.push({ name: m.name, error: e2.message }); step(); return; }
                api().markUploaded(m.fileId, function (e3, rows) {
                  if (!e3) {
                    var f = meta.files[m.fileId] || {};
                    f.uploaded = true;
                    if (rows && rows[0] && rows[0].updated_at) f.remoteTs = rows[0].updated_at;
                    meta.files[m.fileId] = f;
                    report.uploaded++;
                  } else {
                    report.failed.push({ name: m.name, error: e3.message });
                  }
                  step();
                });
              });
            });
          })();
        });
      });
    });
  }

  /* pull one binary down to this device (the ☁ Download action) */
  function downloadFile(fileId, cb) {
    cb = cb || function () {};
    if (!uid()) { cb(new Error("Sign in first.")); return; }
    KOS.attach.getByFileId(fileId, function (err, rec) {
      if (err || !rec) { cb(err || new Error("No local record for that file.")); return; }
      api().downloadBinary(storagePath(fileId, rec.name), function (e2, blob) {
        if (e2) { cb(e2); return; }
        KOS.attach.setBlob(fileId, blob, function (e3) { cb(e3 || null); });
      });
    });
  }

  /* ---------------- lifecycle ---------------- */
  function noteChange(kind) {
    pendingHint = true;
    if (!started || !uid()) return;
    if (status.state === "synced" || status.state === "pending") setStatus("pending");
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      debounceTimer = null;
      cycle("change");
    }, PUSH_DEBOUNCE);
  }
  function noteRestore() {
    if (!KOS.mediadb || !KOS.mediadb.available()) return;
    KOS.mediadb.setKV(RESTORE_FLAG, true, function () { noteChange("restore"); });
  }
  function syncNow(cb) { cycle("manual", cb); }
  function retry(cb) { lastError = null; cycle("retry", cb); }

  function start() {
    if (started) return;
    started = true;
    setTimeout(function () {
      if (!ready()) {
        setStatus(KOS.cloud && KOS.cloud.configured() ? "signedOut" : "unconfigured");
        return;
      }
      KOS.cloud.onAuth(function (event) {
        if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED" || event === "INITIAL_SESSION") {
          if (uid()) cycle("auth");
        } else if (event === "SIGNED_OUT") {
          linkPending = null;
          setStatus("signedOut");
        }
      });
      KOS.cloud.init(function (e0, session) {
        if (session) cycle("boot");
        else setStatus("signedOut");
      });
      intervalTimer = setInterval(function () { cycle("interval"); }, INTERVAL);
      window.addEventListener("online", function () {
        setTimeout(function () { cycle("online"); }, 2000);
      });
      window.addEventListener("offline", function () {
        if (uid()) setStatus("offline", pendingHint ? "changes pending" : "");
      });
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible" && Date.now() - lastCycleEnd > MIN_PULL_GAP) cycle("visible");
      });
      window.addEventListener("focus", function () {
        if (Date.now() - lastCycleEnd > MIN_PULL_GAP) cycle("focus");
      });
    }, BOOT_DELAY);
  }
  function stop() {
    if (intervalTimer) { clearInterval(intervalTimer); intervalTimer = null; }
    if (debounceTimer) { clearTimeout(debounceTimer); debounceTimer = null; }
    started = false;
  }

  KOS.cloudsync = {
    start: start,
    stop: stop,
    syncNow: syncNow,
    retry: retry,
    noteChange: noteChange,
    noteRestore: noteRestore,
    migrateUp: migrateUp,
    resolveBoth: resolveBoth,
    uploadBinaries: uploadBinaries,
    downloadFile: downloadFile,
    onStatus: onStatus,
    getStatus: function () { return status; },
    linkStatus: function () { return linkPending ? linkPending.kind : null; },
    lastError: function () { return lastError ? lastError.message : null; },
    lastSync: function () { return lastSyncAt; },
    isRunning: function () { return running; },
    /* test seams — smoke17 injects a fake api + session and shrinks waits */
    _config: function (opts) {
      opts = opts || {};
      if ("api" in opts) _api = opts.api;
      if ("session" in opts) { _session = opts.session; started = true; }
      if (opts.pushDebounce != null) PUSH_DEBOUNCE = opts.pushDebounce;
      if (opts.interval != null) INTERVAL = opts.interval;
      if (opts.minPullGap != null) MIN_PULL_GAP = opts.minPullGap;
      if (opts.bootDelay != null) BOOT_DELAY = opts.bootDelay;
      if (opts.page != null) PAGE = opts.page;
      if (opts.quiet != null) QUIET = !!opts.quiet;
    }
  };
})();
