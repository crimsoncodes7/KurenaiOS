/* Kurenai OS — core/cloudsync.js
   The multi-device sync engine (Build 4a, merged in Category 8). Supabase
   is an ADDITIONAL replication layer: localStorage + IndexedDB remain the
   primary write path, every feature keeps working signed out, offline, or
   with no configuration at all. A failed sync never touches the
   successful local save.

   THE MODEL — three sync units mirroring the three local layers:
   - kos_state:  the whole KOS.store.state document, one row per user.
                 Reconciled by a THREE-WAY MERGE (core/cloudmerge.js)
                 against the last document this device and the cloud
                 agreed on, so edits made on two devices combine instead
                 of outvoting each other. The upload is a compare-and-set
                 on the document's sequence number: if the cloud moved
                 since we last saw it, we merge its copy into ours and try
                 again. No device ever asks which copy to keep.
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

   PROMPTNESS — a real local change schedules a cycle after a short quiet
   period; a successful push also broadcasts a one-line "changed" note on
   a Realtime channel for the account, and every other open device pulls
   within a couple of seconds of hearing it. The timers behind that are a
   safety net, not the sync path.

   REWARD NEUTRALITY — this engine NEVER calls KOS.sessions.log or
   KOS.media.logActivity and never schedules a mediapush. Pull-applies go
   through mediadb.put/add, which absorb the reward watermark, so progress
   rewarded on one device is silently absorbed on the others (single reward
   across the fleet). Deletions applied from remote use skipTombstone so a
   pulled deletion can't re-queue itself.

   FIRST LINK — the first sign-in of an account on a device needs no
   decision from the user. An empty device adopts the account; an empty
   account receives the device; when both hold data the media vault merges
   per entry (matched by external id or title, so the same show tracked on
   two devices becomes ONE row) and the state documents merge with no
   common ancestor. An empty remote can never replace non-empty local
   data.                                                                    */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  /* ---------------- tunables (test seams via _config) ---------------- */
  var PUSH_DEBOUNCE = 4000;        // quiet period after a local change
  /* The background cycle is a SAFETY NET, not the sync path: a real local
     change already schedules a cycle through noteChange (4 s debounce),
     and returning to the tab triggers one via focus/visibilitychange. Its
     only job is catching a change made on another device while this tab
     sits open and untouched, so it can be infrequent — at 5 minutes it
     was 288 no-op cycles a day per open tab, against a free-tier egress
     quota. Fifteen keeps an idle second device current without paying a
     copy of the account for the privilege. */
  var INTERVAL = 15 * 60 * 1000;   // background cycle while the app is open
  var MIN_PULL_GAP = 60 * 1000;    // focus/visibility cycles at most this often
  var BOOT_DELAY = 3000;           // after boot (env.local.js is deferred)
  var REALTIME_DEBOUNCE = 1500;    // quiet period after another device says "changed"
  var PAGE = 500;                  // pull page size
  var UPSERT_CHUNK = 50;           // media rows per upsert batch
  var QUIET = false;               // suppress toasts (tests)

  var BUCKET = "kos-attachments";
  var META_PREFIX = "cloudsync.meta.";            // + userId → the account's sync meta
  var BASE_PREFIX = "cloudsync.base.";            // + userId → the last document agreed with the cloud
  var RESTORE_FLAG = "cloudsync.restorePending";  // set by store.importFull
  var DELETES_KEY = "cloudsync.pendingDeletes";       // owned by mediadb
  var FILE_DELETES_KEY = "cloudsync.filesPendingDeletes"; // owned by attachments

  var running = false;
  var queuedCycle = false;
  var lastCycleEnd = 0;
  var debounceTimer = null;
  var intervalTimer = null;
  var pendingHint = false;
  var lastError = null;
  var lastSyncAt = null;
  var started = false;

  var _api = null;                 // injected fake api (tests)
  var _session = null;             // injected fake session (tests)

  /* ---------------- status model ---------------- */
  var statusListeners = [];
  var status = { state: "unconfigured", detail: "", lastSyncAt: null };
  function setStatus(state, detail) {
    status = { state: state, detail: detail || "", lastSyncAt: lastSyncAt };
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

  /* ---------------- per-device keys (never synced) ----------------
     state.ui and the Collection view preferences describe THIS DEVICE's
     window, not the account's data: which page is open, whether the spec
     tree is collapsed, grid-vs-list, which Books tab. Syncing them made a
     background pull yank the user off the page they were reading (the
     remote document's ui.view won), and — because KOS.show() ends in
     store.save() — made merely LOOKING at a page mark the whole state
     document dirty and push it, so whole-document LWW could overwrite a
     real edit made on another device with nothing but a page view.

     ONE list feeds both the pushed payload and the dirty hash, so the two
     can never disagree about what a change is. Backups are a separate
     path: store.exportFull/importFull still carry state.ui verbatim.

     media.shrine.description is the user's hall NOTE — content, not a view
     preference — so it keeps syncing; only shrine's module/sort filters
     are per-device.

     focus.active is the RUNNING TIMER of this device — the one thing in
     the document that is a live process rather than data. Syncing it made
     a second device wake up holding a paused copy of a session the first
     device was still running, and completing that copy would have paid
     the session twice.                                                   */
  var DEVICE_PATHS = [
    ["ui"],
    ["focus", "active"],
    ["media", "layout"], ["media", "sort"],
    ["media", "books"], ["media", "vn"], ["media", "game"],
    ["media", "wishlist"],
    ["media", "shrine", "module"], ["media", "shrine", "sort"]
  ];
  function pathGet(obj, path) {
    var cur = obj;
    for (var i = 0; i < path.length; i++) {
      if (!cur || typeof cur !== "object") return undefined;
      cur = cur[path[i]];
    }
    return cur;
  }
  /* delete path[last] from a plain-object clone, pruning nothing else */
  function pathDrop(obj, path) {
    var cur = obj;
    for (var i = 0; i < path.length - 1; i++) {
      if (!cur || typeof cur !== "object") return;
      cur = cur[path[i]];
    }
    if (cur && typeof cur === "object") delete cur[path[path.length - 1]];
  }
  /* the state document as the cloud sees it — a clone minus the
     per-device keys. Used for the push payload AND the dirty hash. */
  function syncableState(s) {
    var out = JSON.parse(JSON.stringify(s || {}));
    DEVICE_PATHS.forEach(function (p) { pathDrop(out, p); });
    /* an emptied container is noise in the hash — drop it too */
    if (out.media && typeof out.media === "object" && !Object.keys(out.media).length) delete out.media;
    if (out.media && out.media.shrine && !Object.keys(out.media.shrine).length) delete out.media.shrine;
    return out;
  }
  /* snapshot this device's values before a remote document lands */
  function deviceSnapshot(s) {
    return DEVICE_PATHS.map(function (p) { return [p, pathGet(s, p)]; });
  }
  /* put them back afterwards — the remote copy must never win */
  function restoreDevice(s, snap) {
    snap.forEach(function (pair) {
      var path = pair[0], val = pair[1], cur = s, i;
      /* nothing to restore and no branch to prune — don't conjure containers */
      if (val === undefined && pathGet(s, path) === undefined) return;
      for (i = 0; i < path.length - 1; i++) {
        if (!cur[path[i]] || typeof cur[path[i]] !== "object") cur[path[i]] = {};
        cur = cur[path[i]];
      }
      var leaf = path[path.length - 1];
      if (val === undefined) delete cur[leaf];
      else cur[leaf] = val;
    });
  }

  /* Boot LAZILY creates default progress records (status "none", empty
     checks) just by rendering views — those are furniture, not data. Only
     a record the user actually touched makes the state meaningful, else a
     brand-new device would classify as "data on both sides" instead of
     auto-adopting the account. */
  function progressMeaningful(p) {
    return Object.keys(p || {}).some(function (k) {
      var v = p[k] || {};
      return (v.status && v.status !== "none") ||
        (v.note && String(v.note).trim()) ||
        (Array.isArray(v.check) && v.check.some(Boolean)) ||
        !!v.rag;
    });
  }
  function stateMeaningful(s) {
    if (!s || typeof s !== "object") return false;
    return !!(progressMeaningful(s.progress) ||
      (s.sessions || []).length ||
      (s.custom && s.custom.cards && s.custom.cards.length) ||
      (s.wishlist && s.wishlist.items && s.wishlist.items.length) ||
      (s.tracker && s.tracker.entries && s.tracker.entries.length) ||
      (s.goals && s.goals.items && s.goals.items.length) ||
      /* the boot seeder plants SAMPLE events — only an event the user
         actually created (or renamed) counts as data */
      (s.calendar && (s.calendar.events || []).some(function (ev) {
        return String(ev.title || "").indexOf("SAMPLE") === -1;
      })) ||
      (s.governor && ((s.governor.xp || 0) > 0 || (s.governor.gold || 0) > 0 ||
        (s.governor.owned || []).length)));
  }

  /* ---------------- account-scoped sync meta ----------------
     One kv record per account: watermarks, echo fingerprints, pull cursors,
     the linked flag. cloudsync.* keys are excluded from backups (mediadb). */
  function blankMeta() {
    return {
      linked: false,
      state: { remoteTs: null, lastPushedHash: null, seq: 0 },
      media: {},     // syncId → {remoteTs, cleanLocal, deleted?}
      files: {},     // fileId → {remoteTs, cleanLocal, uploaded}
      cursor: { media: null, files: null }
    };
  }
  function loadMeta(cb) {
    KOS.mediadb.getKV(META_PREFIX + uid(), function (err, m) {
      if (err) { cb(err); return; }
      var meta = m && typeof m === "object" ? m : blankMeta();
      meta.state = meta.state || { remoteTs: null, lastPushedHash: null, seq: 0 };
      meta.media = meta.media || {};
      meta.files = meta.files || {};
      meta.cursor = meta.cursor || { media: null, files: null };
      cb(null, meta);
    });
  }
  function saveMeta(meta, cb) {
    KOS.mediadb.setKV(META_PREFIX + uid(), meta, function () { cb && cb(null); });
  }
  /* The merge base: the last state document this device and the cloud
     agreed on (what we last pushed, or what we last pulled), stored as the
     cloud sees it — no per-device keys, no __seq. Kept out of the meta
     record because it is by far the largest thing in the kv store and only
     changes when the cloud copy does. A missing base is not an error: the
     merge then runs without a common ancestor (cloudmerge's no-base rules)
     and the next successful push or pull writes one. */
  function loadBase(cb) {
    KOS.mediadb.getKV(BASE_PREFIX + uid(), function (err, b) {
      cb(!err && b && typeof b === "object" && "progress" in b ? b : null);
    });
  }
  function saveBase(doc, cb) {
    KOS.mediadb.setKV(BASE_PREFIX + uid(), doc, function () { cb && cb(null); });
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
      /* the two scalars the guard and the pull actually decide on, without
         the document hanging off them — see fetchStateHead */
      fetchStateMeta: function (cb) {
        /* explicit alias: the column comes back as `seq` rather than
           depending on how the backend names a json-path selection */
        run(c().from("kos_state").select("updated_at, seq:state_json->__seq").maybeSingle(), cb, "State probe");
      },
      /* Compare-and-set. `expected` is the __seq we believe the cloud
         document carries: 0 = "there is no document yet", a positive
         number = "it is at this sequence", null = "overwrite regardless"
         (an explicit user decision: a restore, or the first upload).
         cb(err, row) — row is NULL when the cloud has moved on (a
         concurrent write from another device), which is not an error:
         the caller merges the newer copy and tries again. The check is
         the database's own row filter, so two devices racing to push can
         never both win. */
      upsertState: function (json, expected, cb) {
        var t = c().from("kos_state");
        if (expected === null || expected === undefined) {
          run(t.upsert({ user_id: uid(), state_json: json }, { onConflict: "user_id" })
            .select("updated_at").single(), cb, "State push");
          return;
        }
        if (expected === 0) {
          t.insert({ user_id: uid(), state_json: json }).select("updated_at").single()
            .then(function (res) {
              if (res.error) {
                /* 23505 = unique_violation: the row exists after all */
                if (String(res.error.code) === "23505" || /duplicate key/i.test(String(res.error.message))) { cb(null, null); return; }
                cb(apiErr(res.error, "State push failed.")); return;
              }
              cb(null, res.data);
            }).catch(function (e) { cb(apiErr(e, "State push failed — network?")); });
          return;
        }
        run(t.update({ state_json: json })
          .eq("user_id", uid()).eq("state_json->>__seq", String(expected))
          .select("updated_at"),
          function (err, rows) {
            if (err) { cb(err); return; }
            cb(null, rows && rows.length ? rows[0] : null);
          }, "State push");
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
  /* The last hash we KNOW matches the cloud copy, or null for "unknown".
     Only used to answer "was that save a real change?" cheaply, so the
     status chip stops reporting a page view as pending work. meta stays
     the authority for whether a push actually happens. */
  var cleanStateHash = null;
  function syncableHash() { return hashStr(JSON.stringify(syncableState(KOS.store.state))); }
  function validDoc(doc) { return !!(doc && typeof doc === "object" && "progress" in doc); }

  /* ---------------- the sequence ----------------
     Every push stamps a monotonic __seq and every pull records the seq it
     received. The upload is conditional on the cloud still being at the
     seq we last saw (upsertState's compare-and-set), which is what makes
     a concurrent write from another device DETECTABLE instead of silently
     outvoted — the fault behind the 8 Aug 2026 incident, where a phone
     left unopened for weeks replaced a laptop's level 53 with its own
     stale snapshot. Detection used to end in a dialog; now it ends in a
     merge (cloudmerge.js) and a retry.

     __seq lives on the pushed document only. It never enters app state
     (replaceState would persist it and it would then feed the dirty
     hash), and it is not a clock — no client ever compares wall time. */
  /* set by the paths that have already DECIDED to overwrite the cloud (a
     restore, the first upload of a device onto an empty account). */
  var forceNextPush = false;
  /* set by every push phase that sent something; the cycle's end tells
     the other devices once, not once per table */
  var pushedThisCycle = false;
  function docSeq(doc) {
    var n = doc && doc.__seq;
    return typeof n === "number" && isFinite(n) && n > 0 ? n : 0;
  }

  /* ---------------- the cheap look at the cloud copy ----------------
     The state document is by far the largest thing this account stores
     (every session, every progress record, the whole planner), and the
     pull decides on a scalar: updated_at. Downloading the document to
     read one value cost this account a full copy on every cycle of every
     open tab — the single biggest source of egress in the app.

     So: ask for the scalars, and fetch the document only once they say
     it is worth having. cb(err, {updated_at, seq, row}) where `row` is
     the full record when we happened to read it anyway and null when we
     did not. Fails soft in both directions — an api without the probe
     (the smoke fakes) or a backend that rejects the JSON-path select
     falls back to the full read, so behaviour is identical and only the
     byte count changes. */
  var probeUnavailable = false;   // latched on first refusal, per session
  function fetchStateHead(cb) {
    var a = api();
    function full(cb2) {
      a.fetchState(function (err, row) {
        if (err) { cb2(err); return; }
        cb2(null, row ? { updated_at: row.updated_at, seq: docSeq(row.state_json), row: row } : null);
      });
    }
    if (probeUnavailable || typeof a.fetchStateMeta !== "function") { full(cb); return; }
    a.fetchStateMeta(function (err, row) {
      if (err) {
        /* latch, so a backend that will not serve the json path costs one
           wasted request per session rather than one per cycle */
        probeUnavailable = true;
        full(cb);
        return;
      }
      var n = row ? Number(row.seq != null ? row.seq : row.__seq) : 0;
      cb(null, row ? { updated_at: row.updated_at,
                       seq: isFinite(n) && n > 0 ? n : 0, row: null } : null);
    });
  }

  /* ---------------- the merge ----------------
     Reconcile a cloud document into this device: three-way against the
     stored base, this device's values restored for the per-device keys,
     the result written to the store and drawn. After this the local
     document is a DESCENDANT of the cloud copy and may be pushed over it.
     cb(mergedSyncable, stats). */
  function mergeRemoteIn(incoming, base, cb) {
    var mine = deviceSnapshot(KOS.store.state);
    var localSync = syncableState(KOS.store.state);
    var res = KOS.cloudmerge.merge(base, localSync, incoming);
    KOS.store.replaceState(res.doc);
    restoreDevice(KOS.store.state, mine);
    KOS.store.save();
    rerenderCurrent();
    cb(syncableState(KOS.store.state), res.stats);
  }
  var lastMerge = null;   // {at, stats} — the most recent reconciliation, for the UI
  function noteMerge(stats) {
    lastMerge = { at: Date.now(), stats: stats };
    if (stats && (stats.added || stats.conflicts)) {
      toast("Cloud sync: combined this device's changes with your other device's.");
    }
  }

  function pushState(meta, done, opts) {
    var s = JSON.stringify(syncableState(KOS.store.state));
    var h = hashStr(s);
    if (meta.state.lastPushedHash === h) { cleanStateHash = h; done(null); return; }
    var force = forceNextPush || !!(opts && opts.force);
    forceNextPush = false;
    var attempts = 0;

    function landed(doc, row) {
      meta.state.seq = doc.__seq;
      meta.state.lastPushedHash = h;
      cleanStateHash = h;
      meta.state.remoteTs = row && row.updated_at ? row.updated_at : meta.state.remoteTs;
      delete doc.__seq;
      pushedThisCycle = true;
      saveBase(doc, function () { done(null); });
    }
    function upload(expected, seq) {
      var doc = JSON.parse(s);
      doc.__seq = seq;
      api().upsertState(doc, expected, function (err, row) {
        if (err) { done(err); return; }
        if (!row) { conflict(); return; }
        landed(doc, row);
      });
    }
    /* the cloud moved under us: take its copy in, then try again */
    function conflict() {
      if (++attempts > 4) {
        done(new Error("The cloud copy kept changing while this device was syncing — it will retry."));
        return;
      }
      api().fetchState(function (err, row) {
        if (err) { done(err); return; }
        if (!row) { upload(0, (+meta.state.seq || 0) + 1); return; }
        var incoming = row.state_json;
        var remoteSeq = docSeq(incoming);
        if (!validDoc(incoming)) { upload(null, remoteSeq + 1); return; }
        if (!stateMeaningful(incoming) && stateMeaningful(KOS.store.state)) {
          /* an empty document is never worth merging INTO real data —
             the guard below applies on the pull side too */
          meta.state.seq = remoteSeq;
          upload(null, remoteSeq + 1);
          return;
        }
        if ("__seq" in incoming) delete incoming.__seq;
        loadBase(function (base) {
          mergeRemoteIn(incoming, base, function (mergedSync, stats) {
            noteMerge(stats);
            meta.state.seq = remoteSeq;
            meta.state.remoteTs = row.updated_at;
            s = JSON.stringify(mergedSync);
            h = hashStr(s);
            /* the cloud copy is now our common ancestor */
            saveBase(incoming, function () {
              upload(remoteSeq === 0 ? null : remoteSeq, remoteSeq + 1);
            });
          });
        });
      });
    }

    if (force) {
      /* an explicit decision still lands AFTER whatever the cloud holds,
         so the other device recognises it as newer */
      fetchStateHead(function (err, head) {
        if (err) { done(err); return; }
        var remoteSeq = head ? head.seq : 0;
        upload(null, Math.max(remoteSeq, +meta.state.seq || 0) + 1);
      });
      return;
    }
    var localSeq = +meta.state.seq || 0;
    upload(localSeq, localSeq + 1);
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
          pushedThisCycle = true;
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
        pushedThisCycle = true;
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
        pushedThisCycle = true;
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
        pushedThisCycle = true;
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
  /* Refresh what the user is LOOKING AT after a pull — never navigate.
     This used to route to state.ui.view, which after applyRemoteState was
     the REMOTE document's view: a background pull dragged the reader onto
     whatever page another signed-in device happened to be on, wiping any
     in-progress inline editing with it. state.ui is per-device now, so
     there is no remote view to obey; redraw in place and stay put. */
  function rerenderCurrent() {
    try {
      /* cosmetics ride the state document: a fresh device pulls the owned
         list and governor.theme but was left rendering the default theme
         until a manual reload. Guarded — the app runs with no cloud. */
      if (KOS.governor && KOS.governor.applyCosmetics) KOS.governor.applyCosmetics();
      if (KOS.refreshHUD) KOS.refreshHUD();
      if (KOS.refreshRailCounters) KOS.refreshRailCounters();
      if (KOS.rerender) KOS.rerender();
    } catch (e) { console.warn("cloudsync: rerender after remote apply failed", e); }
  }
  /* Take a cloud document in. done(err, applied, merged): `merged` is
     true when this device held unsynced changes of its own, which were
     three-way merged with the cloud copy rather than replaced by it — the
     caller then pushes the result. */
  function applyRemoteState(row, meta, done) {
    var incoming = row.state_json;
    if (!validDoc(incoming)) {
      done(new Error("The cloud copy of the app state looks invalid — not applied."));
      return;
    }
    /* an empty remote must never clobber meaningful local data */
    if (!stateMeaningful(incoming) && stateMeaningful(KOS.store.state)) {
      console.warn("cloudsync: remote state is empty while local has data — refusing to apply.");
      meta.state.remoteTs = row.updated_at;   // acknowledged, not applied; the next push overwrites it
      meta.state.lastPushedHash = null; cleanStateHash = null; forceNextPush = true;
      done(null, false, false);
      return;
    }
    /* __seq is the sync engine's own bookkeeping — record it, then keep it
       out of app state so it can never feed the dirty hash back to itself */
    var remoteSeq = docSeq(incoming);
    if ("__seq" in incoming) delete incoming.__seq;
    var localHash = syncableHash();
    /* dirty = this device holds edits the cloud has not seen. With no
       recorded hash (first link) the answer is "whatever is meaningful". */
    var dirty = meta.state.lastPushedHash != null
      ? meta.state.lastPushedHash !== localHash
      : stateMeaningful(KOS.store.state);
    loadBase(function (base) {
      if (!dirty) {
        /* per-device keys are this device's alone. New clients never push
           them, but a document written by an older client still carries
           them — take the local values back either way. */
        var mine = deviceSnapshot(KOS.store.state);
        KOS.store.replaceState(incoming);
        restoreDevice(KOS.store.state, mine);
        KOS.store.save();
        meta.state.seq = remoteSeq;
        meta.state.remoteTs = row.updated_at;
        meta.state.lastPushedHash = cleanStateHash = syncableHash();
        saveBase(incoming, function () {
          rerenderCurrent();
          done(null, true, false);
        });
        return;
      }
      mergeRemoteIn(incoming, base, function (mergedSync, stats) {
        noteMerge(stats);
        meta.state.seq = remoteSeq;
        meta.state.remoteTs = row.updated_at;
        /* the merged document descends from the cloud copy and is dirty
           against it — the push that follows uploads it */
        meta.state.lastPushedHash = null; cleanStateHash = null;
        saveBase(incoming, function () { done(null, true, true); });
      });
    });
  }
  function pullState(meta, done) {
    /* the common case by far: nothing new since our last pull, answered
       by a timestamp instead of by a copy of the whole document */
    fetchStateHead(function (err, head) {
      if (err) { done(err); return; }
      if (!head) { done(null, false, false); return; }
      if (tsMs(head.updated_at) <= tsMs(meta.state.remoteTs)) { done(null, false, false); return; }
      if (head.row) { applyRemoteState(head.row, meta, done); return; }
      api().fetchState(function (e2, row) {
        if (e2) { done(e2); return; }
        if (!row) { done(null, false, false); return; }
        if (tsMs(row.updated_at) <= tsMs(meta.state.remoteTs)) { done(null, false, false); return; }
        applyRemoteState(row, meta, done);
      });
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
      if (local) { rec.id = local.id; KOS.mediadb.put(rec, saved); return; }
      /* No row carries this syncId — but the same MEDIA may already be
         here under another one. Two devices that each pulled AniList (or
         VNDB) minted two syncIds for one title, and applying the remote
         row as an addition is exactly how the vault grew duplicates. Match
         by provider identity instead, fold the two into one row and keep
         the lexically smaller syncId — a tie-break every device computes
         the same way, so both converge on one cloud row; the loser is
         tombstoned so its cloud copy is deleted rather than re-pulled. */
      findByProviderId(rec, function (dup) {
        if (!dup) { delete rec.id; KOS.mediadb.add(rec, saved); return; }
        var remote = KOS.mediadb.normalise(rec);
        remote.updatedAt = rec.updatedAt || remote.updatedAt;
        var merged = KOS.media.mergeRows([dup, remote]);
        var winner = dup.syncId < row.entry_id ? dup.syncId : row.entry_id;
        var loser = winner === dup.syncId ? row.entry_id : dup.syncId;
        merged.id = dup.id;
        merged.syncId = winner;
        KOS.mediadb.put(merged, function (e3, recSaved) {
          if (e3 || !recSaved) { next(); return; }
          out.applied++;
          /* either way the merged row differs from what the cloud holds,
             so it is left DIRTY (no cleanLocal) and pushes next cycle; the
             losing remote row is remembered as deleted so its echo is
             ignored */
          meta.media[row.entry_id] = winner === row.entry_id
            ? { remoteTs: row.updated_at, cleanLocal: null }
            : { remoteTs: row.updated_at, deleted: true };
          KOS.mediadb.recordTombstones([{ syncId: loser, module: recSaved.module, ts: Date.now() }], function () { next(); });
        });
      });
    });
  }
  /* the provider identity a vault row is matched on across devices —
     the same order bulkUpsert uses (VNDB, AniList, MAL) */
  function findByProviderId(rec, cb) {
    var x = rec.externalIds || {};
    var tries = [];
    if (x.vndbId != null) tries.push(["vndb", x.vndbId]);
    if (x.anilistId != null) tries.push(["anilist", x.anilistId]);
    if (x.malId != null) tries.push(["mal", x.malId]);
    (function step() {
      var t = tries.shift();
      if (!t) { cb(null); return; }
      KOS.mediadb.getByExternal(t[0], t[1], function (err, hit) {
        if (!err && hit && hit.module === (rec.module === "manga" || rec.module === "ln" ? "books" : rec.module) &&
            hit.syncId && hit.syncId !== rec.syncId) { cb(hit); return; }
        step();
      });
    })();
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
     becomes ONE row, not two), files by fileId, and the state documents
     three-way merged with no common ancestor. The one place local client
     time meets server time is the newer-copy decision for a matched media
     pair — a one-time, first-link-only comparison, documented in Help. */
  function firstLinkMerge(stateRow, meta, done) {
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
          var incoming = stateRow && stateRow.state_json;
          if (validDoc(incoming) && stateMeaningful(incoming)) {
            if ("__seq" in incoming) delete incoming.__seq;
            /* no base: the two documents have never met */
            mergeRemoteIn(incoming, null, function (mergedSync, stats) {
              noteMerge(stats);
              meta.state.remoteTs = stateRow.updated_at;
              meta.state.lastPushedHash = null; cleanStateHash = null; forceNextPush = true;
              meta.linked = true;
              saveBase(incoming, function () { done(null); });
            });
            return;
          }
          /* nothing meaningful in the cloud document: this device's copy
             is the account's copy — leave the hash null so the push phase
             uploads it */
          meta.state.lastPushedHash = null; cleanStateHash = null; forceNextPush = true;
          if (stateRow) meta.state.remoteTs = stateRow.updated_at;
          meta.linked = true;
          done(null);
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
    meta.state = { remoteTs: null, lastPushedHash: null, seq: 0 };
    cleanStateHash = null;
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
    pushedThisCycle = false;
    setStatus("syncing");

    function finish(err, summary) {
      running = false;
      lastCycleEnd = Date.now();
      if (pushedThisCycle) { pushedThisCycle = false; rtAnnounce(); }
      if (err) {
        lastError = err;
        setStatus("error", err.message);
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
          /* A restore is the user declaring this backup authoritative for
             the account, so it is not merged — the restored document is
             allowed to land on top of a newer cloud copy unconditionally. */
          if (restorePending) forceNextPush = true;
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
                      pullState(meta, function (e6, applied, merged) {
                        if (e6) { saveMeta(meta, function () { finish(e6); }); return; }
                        /* a pull that had to merge leaves the merged document
                           dirty against the cloud — send it now, not next cycle */
                        function afterState(e6b) {
                          if (e6b) { saveMeta(meta, function () { finish(e6b); }); return; }
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
                        }
                        if (merged) pushState(meta, afterState);
                        else afterState(null);
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

      if (meta.linked) { main(); return; }

      /* first sign-in of this account on this device — every outcome is
         automatic, and none of them can lose data: adopting fills an
         empty device, uploading fills an empty account, and merging
         combines (media per entry, state three-way with no ancestor) */
      assessLink(meta, function (eA, res) {
        if (eA) { finish(eA); return; }
        if (res.kind === "fresh") {
          meta.linked = true;
          saveMeta(meta, function () { main(); });
        } else if (res.kind === "remoteOnly") {
          adoptRemote(meta, function (eB) {
            if (eB) { finish(eB); return; }
            saveMeta(meta, function () {
              toast("Cloud data downloaded — this device now mirrors your account.");
              rerenderCurrent();
              main();
            });
          });
        } else if (res.kind === "localOnly") {
          /* validate through the R3 serializer first — the same gate the
             backup export uses — then let the idempotent push do the rest */
          KOS.store.snapshotFull(function (eS, snapshot) {
            if (eS) { finish(eS); return; }
            if (!snapshot || !validDoc(snapshot.state)) {
              finish(new Error("The local data failed validation — nothing was uploaded."));
              return;
            }
            meta.linked = true;
            meta.state.lastPushedHash = null; cleanStateHash = null; forceNextPush = true;
            saveMeta(meta, function () {
              toast("Local data uploaded — this account now syncs across devices.");
              main();
            });
          });
        } else {
          firstLinkMerge(res.stateRow || null, meta, function (eM) {
            if (eM) { finish(eM); return; }
            saveMeta(meta, function () {
              toast("Merged with your cloud data — media combined per entry, study state combined.");
              main();
            });
          });
        }
      });
    });
  }

  /* ---------------- explicit user actions ---------------- */
  /* Kept for callers that predate automatic linking: there is no pending
     decision any more, so this is simply a cycle. */
  function migrateUp(cb) { cycle("migrate", function (err) { cb && cb(err || null, err ? null : {}); }); }

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
  /* Every KOS.show() ends in store.save(), so a plain page view nudges us.
     With ui/view prefs out of the synced document that nudge usually
     represents NOTHING to push — flipping the chip to "changes pending" for
     it made the chip pure noise. Media/file nudges are always real (their
     dirtiness is per-row and can't be checked from here). */
  var noteStateOnly = true;
  function noteChange(kind) {
    if (kind !== "state") noteStateOnly = false;
    if (!started || !uid()) { pendingHint = true; return; }
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      debounceTimer = null;
      var onlyState = noteStateOnly;
      noteStateOnly = true;
      if (onlyState && cleanStateHash && syncableHash() === cleanStateHash) return;
      pendingHint = true;
      if (status.state === "synced" || status.state === "pending") setStatus("pending");
      cycle("change");
    }, PUSH_DEBOUNCE);
  }
  function noteRestore() {
    if (!KOS.mediadb || !KOS.mediadb.available()) return;
    KOS.mediadb.setKV(RESTORE_FLAG, true, function () { noteChange("restore"); });
  }
  function syncNow(cb) { cycle("manual", cb); }
  function retry(cb) { lastError = null; cycle("retry", cb); }

  /* ---------------- the Realtime nudge ----------------
     One broadcast channel per account. A device that has just pushed
     sends a one-line "changed" note; every other device on the channel
     schedules a cycle, so a change made on the laptop is on the phone in
     a couple of seconds instead of at the next timer or tab focus. The
     note carries no data (a device id and a time), so a stranger who
     guessed the channel name would learn only that something synced —
     the tables behind it stay behind RLS. Everything here is guarded:
     without the channel API, or when the socket cannot connect, the
     timers and focus triggers carry on exactly as before. */
  var rtChannel = null;
  var rtTimer = null;
  var deviceId = Math.random().toString(36).slice(2, 12) + Date.now().toString(36);
  function rtSchedule() {
    if (rtTimer) clearTimeout(rtTimer);
    rtTimer = setTimeout(function () { rtTimer = null; cycle("realtime"); }, REALTIME_DEBOUNCE);
  }
  function rtStart() {
    if (rtChannel || _api || !uid()) return;
    var c = KOS.cloud && KOS.cloud.client && KOS.cloud.client();
    if (!c || typeof c.channel !== "function") return;
    try {
      var ch = c.channel("kos-sync-" + uid(), { config: { broadcast: { self: false } } });
      ch.on("broadcast", { event: "changed" }, function (msg) {
        var payload = msg && msg.payload;
        if (payload && payload.device === deviceId) return;
        rtSchedule();
      });
      ch.subscribe();
      rtChannel = ch;
    } catch (e) {
      rtChannel = null;
    }
  }
  function rtStop() {
    if (rtTimer) { clearTimeout(rtTimer); rtTimer = null; }
    if (!rtChannel) return;
    try {
      var c = KOS.cloud.client();
      if (c && typeof c.removeChannel === "function") c.removeChannel(rtChannel);
      else rtChannel.unsubscribe();
    } catch (e) { /* the socket is already gone */ }
    rtChannel = null;
  }
  function rtAnnounce() {
    if (!rtChannel) return;
    try {
      var r = rtChannel.send({ type: "broadcast", event: "changed", payload: { device: deviceId, at: Date.now() } });
      if (r && typeof r.catch === "function") r.catch(function () {});
    } catch (e) { /* best effort */ }
  }

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
          if (uid()) { rtStart(); cycle("auth"); }
        } else if (event === "SIGNED_OUT") {
          rtStop();
          cleanStateHash = null;   // next account's cleanliness is unknown
          setStatus("signedOut");
        }
      });
      KOS.cloud.init(function (e0, session) {
        if (session) { rtStart(); cycle("boot"); }
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
    rtStop();
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
    uploadBinaries: uploadBinaries,
    downloadFile: downloadFile,
    onStatus: onStatus,
    getStatus: function () { return status; },
    /* Linking is automatic now; nothing is ever pending. Kept so callers
       written against the decision-era API keep working. */
    linkStatus: function () { return null; },
    /* {at, stats:{added, deleted, conflicts}} for the last time this device
       had to combine its own changes with another device's, or null */
    lastMerge: function () { return lastMerge; },
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
