/* Kurenai OS — core/mediadb.js
   The Collection Matrix storage layer (Build 3a).

   Media entries live in IndexedDB ("kurenai-os-media"), NOT localStorage —
   650 real anime entries exist today and this grows across four modules.
   Filters run against real indexes (module, status, genre, tag, and the
   [module,status] pair), not an in-memory scan of everything.

   The same DB carries a small key-value store for the AniList connection
   (client ID, bearer token, viewer identity). The token NEVER goes into
   localStorage — it would end up inside the exported backup JSON.

   Shared media schema (every module uses this one shape):
     { id, module: "anime"|"books"|"vn"|"game",
       title, status: "planned"|"inProgress"|"onHold"|"completed"|"dropped",
       progress: { current, total,            // total null = unknown/ongoing
                   volumes, totalVolumes },   // books only, null elsewhere
       ownership: "physical"|"digital"|"steam"|"unset",
       score: 0-10 (0 = unrated), tags: [], genres: [],
       dates: { started: "YYYY-MM-DD"|null, finished: null },
       externalIds: { anilistId, malId, steamAppId },   // null when absent
       coverUrl: null|url, coverCrop: null|{x,y,zoom},
       coverCropSource: null|url,       // source fingerprint paired to crop
       notes, favourite: bool,
       syncSource: "anilist"|"manual"|"import",
       lastSyncedAt: ms|null,                 // null for manual/imported
       createdAt, updatedAt,
       extra: { format, season, seasonYear, studio, titleEnglish },

       -- Build 3b, Books dual-tracking. The top-level list-state fields
          above ARE the digital half (status, progress, score, externalIds,
          syncSource); "physical" is the independent ownership half. One
          entry can carry both, either, or neither. --
       author:  "",          manual field, kept regardless of sync source
       format:  "manga"|"lightNovel"|"oneShot"|null (books only),
       mood:    [],          its own axis, separate from genre
       shelves: [],          user-defined shelf names
       dnf:     { isDnf, reason },   did-not-finish, orthogonal to status
       physical: null | { owned, volumes: [{ number,
                  condition: "mint"|"good"|"worn"|"damaged",
                  purchaseDate, price, coverUrl, coverCrop (per-volume override) }] },

       -- Build 3c, Visual Novels. VNDB sync populates the metadata half
          (title, developer, cover, tags-as-genres, length estimate); the
          route/CG/quote layer is MANUAL tracking the user builds up —
          VNDB has no clean structured route data to sync. --
       developer: "",        filled by VNDB sync, editable by hand
       contentWarnings: [],  manual axis — never auto-filled from tags
       routes:  [{ name, cleared: bool, completedAt: "YYYY-MM-DD"|null }],
       cgGallery: { totalKnown: n|null, unlockedCount: n },  counter only,
                  never actual CG artwork (copyright; VNDB doesn't expose it)
       quotes:  [{ text, context, loggedAt: ms }],
       externalIds.vndbId: "v123"|null
       For module:"vn" with routes, progress is DERIVED: current = routes
       cleared, total = routes.length — so the cross-media UI reads VNs
       with zero special-casing.

       -- Build 3e, Games. MANUAL-ENTRY ONLY, permanently by design: Steam's
          data API blocks browser CORS (no workaround), and Steam OpenID
          sign-in was tested live 2026-07-03 and abandoned — the
          check_authentication verification response carries no CORS
          headers, so a browser can never read is_valid (see mediasync.js).
          steamAppId is a hand-entered future-proofing id + store link. --
       publisher: "",
       completionTier: "notStarted"|"storyComplete"|"fullCompletion"|
                       "platinum"|"abandoned",
       platform: "pc"|"playstation"|"xbox"|"switch"|"other" (game only,
                 null elsewhere),
       playtimeHours: n|null (manual — nothing exists to pull it from),
       backlogPriority: "low"|"medium"|"high"|null,
       externalIds.steamAppId (schema day one, hand-entered)
       For module:"game", progress is DERIVED from playtimeHours
       (current = hours, total = null) — the cross-media UI reads games
       exactly like everything else, unit "hr".                              */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var DB_NAME = "kurenai-os-media", DB_VER = 8;
  var ENTRIES = "entries", KV = "kv";
  var db = null;

  var STATUSES = ["planned", "inProgress", "onHold", "completed", "dropped"];

  function available() { return !!window.indexedDB; }

  function open(cb) {
    if (!available()) { cb(new Error("IndexedDB unavailable")); return; }
    if (db) { cb(null, db); return; }
    var rq = window.indexedDB.open(DB_NAME, DB_VER);
    rq.onupgradeneeded = function (e) {
      var d = e.target.result;
      var os;
      if (!d.objectStoreNames.contains(ENTRIES)) {
        os = d.createObjectStore(ENTRIES, { keyPath: "id", autoIncrement: true });
        os.createIndex("module", "module", { unique: false });
        os.createIndex("status", "status", { unique: false });
        os.createIndex("mod_status", ["module", "status"], { unique: false });
        os.createIndex("genres", "genres", { unique: false, multiEntry: true });
        os.createIndex("tags", "tags", { unique: false, multiEntry: true });
        os.createIndex("anilist", "externalIds.anilistId", { unique: false });
      } else {
        os = e.target.transaction.objectStore(ENTRIES);
      }
      /* v2: XML exports carry MAL ids — a second identity index lets
         imports and authenticated syncs match the same show */
      if (!os.indexNames.contains("mal")) {
        os.createIndex("mal", "externalIds.malId", { unique: false });
      }
      /* v3 (Build 3b — Books): mood/shelf filter axes + author grouping */
      if (!os.indexNames.contains("mood")) {
        os.createIndex("mood", "mood", { unique: false, multiEntry: true });
      }
      if (!os.indexNames.contains("shelves")) {
        os.createIndex("shelves", "shelves", { unique: false, multiEntry: true });
      }
      if (!os.indexNames.contains("author")) {
        os.createIndex("author", "author", { unique: false });
      }
      /* v4 (Build 3c — Visual Novels): VNDB identity + developer grouping */
      if (!os.indexNames.contains("vndb")) {
        os.createIndex("vndb", "externalIds.vndbId", { unique: false });
      }
      if (!os.indexNames.contains("developer")) {
        os.createIndex("developer", "developer", { unique: false });
      }
      /* v5 (Build 3e — Games): platform filter axis + Steam identity
         (steamAppId is hand-entered; the index still makes lookups and a
         hypothetical future sync O(log n) instead of a scan) */
      if (!os.indexNames.contains("platform")) {
        os.createIndex("platform", "platform", { unique: false });
      }
      if (!os.indexNames.contains("steam")) {
        os.createIndex("steam", "externalIds.steamAppId", { unique: false });
      }
      /* v6 (Build 3k — custom lists): a manual (and, for AniList, synced)
         membership axis that ALL modules share — VN and games finally get
         lists too. multiEntry so an entry can sit on several lists. */
      if (!os.indexNames.contains("customLists")) {
        os.createIndex("customLists", "customLists", { unique: false, multiEntry: true });
      }
      /* v7: non-destructive cover positioning. `coverCrop` is companion
         display metadata rather than a filter axis, so it is normalised on
         every write but deliberately has no query index. Missing fields are
         the migration: old rows continue as centred cover-fit. */
      /* v8 (Build 4a — cloud sync): a device-independent identity. Local
         autoIncrement ids are per-device and never leave the device; syncId
         is the UUID the cloud rows key on. Indexed for the pull-merge
         lookup; backfilled below for pre-v8 rows. */
      if (!os.indexNames.contains("syncId")) {
        os.createIndex("syncId", "syncId", { unique: false });
      }
      if (!d.objectStoreNames.contains(KV)) {
        d.createObjectStore(KV, { keyPath: "key" });
      }
      /* data migrations — ONE cursor pass (two concurrent cursors would
         race each other's updates: whichever writes second resurrects the
         stale copy of the row it read first):
         v3 — the old "manga"/"ln" placeholder modules fold into the real
              "books" module, keeping what they were as `format`;
         v8 — every pre-cloud row gets its device-independent syncId. */
      if (e.oldVersion > 0 && e.oldVersion < 8) {
        var cur = os.openCursor();
        cur.onsuccess = function (ev) {
          var c = ev.target.result;
          if (!c) return;
          var v = c.value, dirty = false;
          if (e.oldVersion < 3 && (v.module === "manga" || v.module === "ln")) {
            v.format = v.format || (v.module === "ln" ? "lightNovel" : "manga");
            v.module = "books";
            dirty = true;
          }
          if (!v.syncId) {
            v.syncId = genSyncId();
            dirty = true;
          }
          if (dirty) c.update(v);
          c.continue();
        };
      }
    };
    rq.onsuccess = function () {
      db = rq.result;
      db.onclose = function () { db = null; };
      cb(null, db);
    };
    rq.onerror = function () { cb(rq.error || new Error("Could not open the media store")); };
  }
  function tx(store, mode, cb) {
    open(function (err, d) {
      if (err) { cb(err); return; }
      cb(null, d.transaction(store, mode).objectStore(store));
    });
  }

  /* ---------------- schema normalisation ---------------- */
  var CONDITIONS = ["mint", "good", "worn", "damaged"];
  var FORMATS = ["manga", "lightNovel", "oneShot"];
  /* Build 3e — Games enums. completionTier is finer-grained than the shared
     status on purpose: "completed" can mean credits-rolled or 100%'d, and
     games are the one module where that difference is the whole hobby. */
  var TIERS = ["notStarted", "storyComplete", "fullCompletion", "platinum", "abandoned"];
  var PLATFORMS = ["pc", "playstation", "xbox", "switch", "other"];
  var PRIORITIES = ["low", "medium", "high"];

  function normCrop(crop) {
    return KOS.imageCrop ? KOS.imageCrop.normalise(crop) : null;
  }

  /* Build 4a — nudge cloud sync after a local write (debounced + no-op when
     absent or signed out; dirtiness is DERIVED from updatedAt watermarks, so
     a missed nudge only delays the next cycle, never loses data) */
  function noteCloud() {
    if (window.KOS && KOS.cloudsync && KOS.cloudsync.noteChange) KOS.cloudsync.noteChange("media");
  }

  /* Build 4a — the device-independent identity a cloud row keys on.
     crypto.randomUUID everywhere modern; the fallback is the standard
     v4-shaped substitute for older engines. */
  function genSyncId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (ch) {
      var r = Math.random() * 16 | 0;
      return (ch === "x" ? r : (r & 3 | 8)).toString(16);
    });
  }

  /* one physical volume record (Build 3b) */
  function normVolume(v) {
    v = v || {};
    return {
      number: v.number != null ? v.number : 1,
      condition: CONDITIONS.indexOf(v.condition) !== -1 ? v.condition : "good",
      purchaseDate: v.purchaseDate || null,     // "YYYY-MM-DD"
      price: typeof v.price === "number" && !isNaN(v.price) ? v.price : null,
      coverUrl: v.coverUrl || null,             // per-volume override
      coverCrop: normCrop(v.coverCrop)
    };
  }

  /* one manual VN chapter/part record (Build 3j) — a user-defined layer
     PARALLEL to routes, never nested in them and never derived from VNDB
     (which has no structured chapter data). status reuses the shared enum;
     chapters do NOT drive progress — routes keep that job. */
  function normChapter(c) {
    c = c || {};
    return {
      name: String(c.name || "Chapter"),
      status: STATUSES.indexOf(c.status) !== -1 ? c.status : "planned",
      notes: String(c.notes || "")
    };
  }

  /* one manual VN route record (Build 3c) */
  function normRoute(r) {
    r = r || {};
    var cleared = !!r.cleared;
    return {
      name: String(r.name || "Route"),
      cleared: cleared,
      completedAt: cleared ? (r.completedAt || null) : null
    };
  }
  /* one logged VN quote (Build 3c) */
  function normQuote(q) {
    q = q || {};
    return {
      text: String(q.text || ""),
      context: String(q.context || ""),
      loggedAt: typeof q.loggedAt === "number" ? q.loggedAt : Date.now()
    };
  }
  /* VN progress is derived from the manual routes list — one shape the
     cross-media UI already understands */
  function vnProgress(routes) {
    return {
      current: routes.filter(function (r) { return r.cleared; }).length,
      total: routes.length || null,
      volumes: null, totalVolumes: null
    };
  }
  /* Game progress derives from playtimeHours the same way (Build 3e):
     hours are the one honest unit a manual-only module can log, and
     deriving keeps a single source of truth — there is no separate
     progress field to fall out of step */
  function gameProgress(hours) {
    return { current: hours || 0, total: null, volumes: null, totalVolumes: null };
  }

  /* ---------------- reward watermark (Build 3j) ----------------
     ONE mechanism rewards progress whichever direction it arrives from:
     each entry carries a watermark of the last progress/status state that
     was already accounted for. Local edits and successful pushes absorb it
     (put()/add() below do this on every local save, so a pull that merely
     echoes back a state this app produced can never reward it a second
     time); a pull sync compares the incoming state against it and emits a
     reward event only for genuinely NEW ground — progress above the
     watermark, or a status advance to a more-complete state. A watermark
     of null means "never initialised": it absorbs silently (a first sync
     of 650 entries mints nothing), and progress BELOW the watermark
     (rewatch, correction, drop-and-restart) just lowers it — no reward,
     no clawback. */
  var STATUS_RANK = { planned: 0, onHold: 1, dropped: 1, inProgress: 2, completed: 3 };
  function rewardSnapshot(e) {
    return {
      progress: (e.progress && e.progress.current) || 0,
      volumes: (e.progress && e.progress.volumes != null) ? e.progress.volumes : null,
      status: e.status
    };
  }
  /* incoming state vs the stored watermark → {units, statusAdvanced} or
     null when nothing rewards (uninitialised, unchanged, or regressed) */
  function rewardDelta(watermark, e) {
    if (!watermark) return null;   // uninitialised — absorb silently
    var units = 0;
    var cur = (e.progress && e.progress.current) || 0;
    if (watermark.progress != null && cur > watermark.progress) units += cur - watermark.progress;
    var vols = e.progress && e.progress.volumes;
    if (vols != null && watermark.volumes != null && vols > watermark.volumes) units += vols - watermark.volumes;
    var advanced = e.status !== "dropped" &&
      (STATUS_RANK[e.status] || 0) > (STATUS_RANK[watermark.status] || 0);
    if (!units && !advanced) return null;
    return { units: units, statusAdvanced: advanced };
  }

  function normalise(e) {
    e = e || {};
    var now = Date.now();
    var legacy = e.module === "manga" || e.module === "ln";   // pre-v3 rows
    var out = {
      /* Build 4a — cloud identity. Preserved verbatim once minted; a row
         only ever gets a fresh one when it has none (new entries, and the
         v8 backfill for old rows). Local numeric `id` stays device-local. */
      syncId: (typeof e.syncId === "string" && e.syncId) ? e.syncId : genSyncId(),
      module: legacy ? "books" : (e.module || "anime"),
      title: String(e.title || "Untitled"),
      status: STATUSES.indexOf(e.status) !== -1 ? e.status : "planned",
      progress: {
        current: (e.progress && e.progress.current) || 0,
        total: (e.progress && e.progress.total != null) ? e.progress.total : null,
        volumes: (e.progress && e.progress.volumes != null) ? e.progress.volumes : null,
        totalVolumes: (e.progress && e.progress.totalVolumes != null) ? e.progress.totalVolumes : null
      },
      ownership: e.ownership || (e.module === "anime" || !e.module ? "digital" : "unset"),
      score: typeof e.score === "number" ? Math.max(0, Math.min(10, e.score)) : 0,
      tags: Array.isArray(e.tags) ? e.tags.slice() : [],
      genres: Array.isArray(e.genres) ? e.genres.slice() : [],
      dates: {
        started: (e.dates && e.dates.started) || null,
        finished: (e.dates && e.dates.finished) || null
      },
      externalIds: {
        anilistId: (e.externalIds && e.externalIds.anilistId) || null,
        malId: (e.externalIds && e.externalIds.malId) || null,
        steamAppId: (e.externalIds && e.externalIds.steamAppId) || null,
        vndbId: (e.externalIds && e.externalIds.vndbId) || null,
        /* Build 3i — Books external lookup. Stored canonical (ISBN-13),
           reference-only like steamAppId: nothing syncs on it, no index —
           it just rides along so a scanned book keeps its identity. */
        isbn13: (e.externalIds && e.externalIds.isbn13) || null
      },
      coverUrl: e.coverUrl || null,
      coverCrop: normCrop(e.coverCrop),
      /* A positioned synced cover is local display intent. Pairing the crop
         to its source prevents a later pull applying those coordinates to
         different artwork; attribution remains in `extra` as before. */
      coverCropSource: e.coverCrop ? (e.coverCropSource || e.coverUrl || null) : null,
      notes: e.notes || "",
      favourite: !!e.favourite,
      syncSource: e.syncSource || "manual",
      lastSyncedAt: e.lastSyncedAt != null ? e.lastSyncedAt : null,
      createdAt: e.createdAt || now,
      updatedAt: now,
      extra: e.extra || {},
      /* Build 3b — Books dual-tracking axes (benign defaults elsewhere) */
      author: String(e.author || ""),
      format: FORMATS.indexOf(e.format) !== -1 ? e.format
        : legacy ? (e.module === "ln" ? "lightNovel" : "manga") : null,
      mood: Array.isArray(e.mood) ? e.mood.slice() : [],
      shelves: Array.isArray(e.shelves) ? e.shelves.slice() : [],
      /* Build 3k — custom lists (all modules). Deduped, trimmed, non-empty. */
      customLists: Array.isArray(e.customLists)
        ? e.customLists.map(function (s) { return String(s).trim(); })
            .filter(function (s, i, a) { return s && a.indexOf(s) === i; })
        : [],
      dnf: {
        isDnf: !!(e.dnf && e.dnf.isDnf),
        reason: (e.dnf && e.dnf.reason) || ""
      },
      physical: e.physical ? {
        owned: e.physical.owned !== false,
        volumes: (Array.isArray(e.physical.volumes) ? e.physical.volumes : [])
          .map(normVolume)
          .sort(function (a, b) { return a.number - b.number; })
      } : null,
      /* Build 3c — VN axes (benign defaults elsewhere) */
      developer: String(e.developer || ""),
      contentWarnings: Array.isArray(e.contentWarnings) ? e.contentWarnings.slice() : [],
      routes: (Array.isArray(e.routes) ? e.routes : []).map(normRoute),
      cgGallery: {
        totalKnown: (e.cgGallery && e.cgGallery.totalKnown != null && e.cgGallery.totalKnown >= 0)
          ? e.cgGallery.totalKnown : null,
        unlockedCount: (e.cgGallery && e.cgGallery.unlockedCount > 0)
          ? e.cgGallery.unlockedCount : 0
      },
      quotes: (Array.isArray(e.quotes) ? e.quotes : []).map(normQuote),
      /* Build 3j — user-defined VN chapters/parts, parallel to routes
         (benign [] elsewhere; never drives progress) */
      chapters: (Array.isArray(e.chapters) ? e.chapters : []).map(normChapter),
      /* Build 3j — the reward watermark. null = never initialised. */
      reward: (e.reward && typeof e.reward === "object") ? {
        progress: e.reward.progress != null ? e.reward.progress : 0,
        volumes: e.reward.volumes != null ? e.reward.volumes : null,
        status: STATUSES.indexOf(e.reward.status) !== -1 ? e.reward.status : "planned"
      } : null,
      /* Build 3e — Games axes (benign defaults elsewhere) */
      publisher: String(e.publisher || ""),
      completionTier: TIERS.indexOf(e.completionTier) !== -1 ? e.completionTier : "notStarted",
      platform: PLATFORMS.indexOf(e.platform) !== -1 ? e.platform
        : ((e.module === "game") ? "pc" : null),
      playtimeHours: (typeof e.playtimeHours === "number" && !isNaN(e.playtimeHours) && e.playtimeHours >= 0)
        ? e.playtimeHours : null,
      backlogPriority: PRIORITIES.indexOf(e.backlogPriority) !== -1 ? e.backlogPriority : null,
      /* Build 3d — write-back paper trail. state "failed" persists (the
         card shows a retry chip); in-flight "pending" is in-memory only
         (KOS.mediapush.isPending), so a reload never strands it. */
      push: (e.push && e.push.state === "failed")
        ? { state: "failed", error: String(e.push.error || ""), ts: e.push.ts || null }
        : null
    };
    if (out.module === "vn" && out.routes.length) out.progress = vnProgress(out.routes);
    if (out.module === "game") out.progress = gameProgress(out.playtimeHours);
    out.titleLower = out.title.toLowerCase();   // search key, derived
    if (e.id != null) out.id = e.id;
    return out;
  }

  /* ---------------- entry CRUD ---------------- */
  /* Every LOCAL save absorbs the reward watermark (Build 3j): editors,
     quick-edit, +1 buttons, the post-push re-put — all of them come
     through here, so the watermark always equals the last state this app
     itself produced or displayed. The one path that does NOT come through
     here is bulkUpsert (raw cursor writes), which is exactly the pull path
     that must compare against the watermark BEFORE absorbing it. */
  function add(entry, cb) {
    tx(ENTRIES, "readwrite", function (err, os) {
      if (err) { cb && cb(err); return; }
      var rec = normalise(entry);
      rec.reward = rewardSnapshot(rec);
      delete rec.id;                    // let autoIncrement assign
      var rq = os.add(rec);
      rq.onsuccess = function () { rec.id = rq.result; noteCloud(); cb && cb(null, rec); };
      rq.onerror = function () { cb && cb(rq.error); };
    });
  }
  function put(entry, cb) {
    if (entry.id == null) { add(entry, cb); return; }
    tx(ENTRIES, "readwrite", function (err, os) {
      if (err) { cb && cb(err); return; }
      var rec = normalise(entry);
      rec.reward = rewardSnapshot(rec);
      var rq = os.put(rec);
      rq.onsuccess = function () { noteCloud(); cb && cb(null, rec); };
      rq.onerror = function () { cb && cb(rq.error); };
    });
  }
  function get(id, cb) {
    tx(ENTRIES, "readonly", function (err, os) {
      if (err) { cb(err); return; }
      var rq = os.get(id);
      rq.onsuccess = function () { cb(null, rq.result || null); };
      rq.onerror = function () { cb(rq.error); };
    });
  }
  /* Build 4a — deletion tombstones. A deleted row's syncId is queued in the
     kv store so cloud sync can propagate the deletion to other devices; a
     bare "row missing" is indistinguishable from "never existed" under
     last-write-wins. Captured on EVERY delete path (remove below, the
     replace-pass in bulkUpsert, dedupeVault via remove) and drained by
     cloudsync after a confirmed remote tombstone. Capped: if cloud sync is
     never used this is just a small ring buffer. */
  var TOMBSTONE_KEY = "cloudsync.pendingDeletes", TOMBSTONE_CAP = 1000;
  function recordTombstones(list, cb) {
    if (!list || !list.length) { cb && cb(null); return; }
    getKV(TOMBSTONE_KEY, function (err, q) {
      if (err) { cb && cb(null); return; }   // tombstones are best-effort
      q = Array.isArray(q) ? q : [];
      list.forEach(function (t) { if (t && t.syncId) q.push(t); });
      if (q.length > TOMBSTONE_CAP) q = q.slice(q.length - TOMBSTONE_CAP);
      setKV(TOMBSTONE_KEY, q, function () { cb && cb(null); });
    });
  }

  function remove(id, cb, opts) {
    tx(ENTRIES, "readwrite", function (err, os) {
      if (err) { cb && cb(err); return; }
      var gq = os.get(id);
      gq.onsuccess = function () {
        var victim = gq.result || null;
        var rq = os.delete(id);
        rq.onsuccess = function () {
          if (victim && victim.syncId && !(opts && opts.skipTombstone)) {
            recordTombstones([{ syncId: victim.syncId, module: victim.module, ts: Date.now() }],
              function () { noteCloud(); cb && cb(null); });
          } else {
            cb && cb(null);
          }
        };
        rq.onerror = function () { cb && cb(rq.error); };
      };
      gq.onerror = function () { cb && cb(gq.error); };
    });
  }

  /* ---------------- indexed queries ----------------
     query(opts, cb): opts = {module, status, genre, tag, mood, shelf,
     author, format, owned, dnf, favourite, search,
     sort:"title"|"updated"|"score"|"progress"} → cb(err, entries[]).
     The cursor is narrowed by the best available index first; only the
     residual predicates (search text, favourite, …) run on that stream. */
  function pickIndex(os, opts) {
    if (opts.module && opts.status) return { rq: os.index("mod_status").openCursor(window.IDBKeyRange.only([opts.module, opts.status])), used: ["module", "status"] };
    if (opts.genre) return { rq: os.index("genres").openCursor(window.IDBKeyRange.only(opts.genre)), used: ["genre"] };
    if (opts.tag) return { rq: os.index("tags").openCursor(window.IDBKeyRange.only(opts.tag)), used: ["tag"] };
    if (opts.mood) return { rq: os.index("mood").openCursor(window.IDBKeyRange.only(opts.mood)), used: ["mood"] };
    if (opts.shelf) return { rq: os.index("shelves").openCursor(window.IDBKeyRange.only(opts.shelf)), used: ["shelf"] };
    if (opts.customList) return { rq: os.index("customLists").openCursor(window.IDBKeyRange.only(opts.customList)), used: ["customList"] };
    if (opts.author) return { rq: os.index("author").openCursor(window.IDBKeyRange.only(opts.author)), used: ["author"] };
    if (opts.developer) return { rq: os.index("developer").openCursor(window.IDBKeyRange.only(opts.developer)), used: ["developer"] };
    if (opts.platform) return { rq: os.index("platform").openCursor(window.IDBKeyRange.only(opts.platform)), used: ["platform"] };
    if (opts.module) return { rq: os.index("module").openCursor(window.IDBKeyRange.only(opts.module)), used: ["module"] };
    if (opts.status) return { rq: os.index("status").openCursor(window.IDBKeyRange.only(opts.status)), used: ["status"] };
    return { rq: os.openCursor(), used: [] };
  }
  var SORTS = {
    title: function (a, b) { return a.titleLower < b.titleLower ? -1 : a.titleLower > b.titleLower ? 1 : 0; },
    updated: function (a, b) { return b.updatedAt - a.updatedAt; },
    score: function (a, b) { return b.score - a.score || SORTS.title(a, b); },
    progress: function (a, b) { return (b.progress.current || 0) - (a.progress.current || 0); }
  };
  function query(opts, cb) {
    opts = opts || {};
    tx(ENTRIES, "readonly", function (err, os) {
      if (err) { cb(err, []); return; }
      var picked = pickIndex(os, opts);
      var used = picked.used;
      var needle = opts.search ? String(opts.search).toLowerCase() : null;
      var out = [];
      picked.rq.onsuccess = function (e) {
        var cur = e.target.result;
        if (!cur) {
          out.sort(SORTS[opts.sort] || SORTS.title);
          cb(null, out);
          return;
        }
        var v = cur.value, ok = true;
        if (used.indexOf("module") === -1 && opts.module && v.module !== opts.module) ok = false;
        if (ok && used.indexOf("status") === -1 && opts.status && v.status !== opts.status) ok = false;
        if (ok && used.indexOf("genre") === -1 && opts.genre && v.genres.indexOf(opts.genre) === -1) ok = false;
        if (ok && used.indexOf("tag") === -1 && opts.tag && v.tags.indexOf(opts.tag) === -1) ok = false;
        if (ok && used.indexOf("mood") === -1 && opts.mood && (!v.mood || v.mood.indexOf(opts.mood) === -1)) ok = false;
        if (ok && used.indexOf("shelf") === -1 && opts.shelf && (!v.shelves || v.shelves.indexOf(opts.shelf) === -1)) ok = false;
        if (ok && used.indexOf("customList") === -1 && opts.customList && (!v.customLists || v.customLists.indexOf(opts.customList) === -1)) ok = false;
        if (ok && used.indexOf("author") === -1 && opts.author && v.author !== opts.author) ok = false;
        if (ok && used.indexOf("developer") === -1 && opts.developer && v.developer !== opts.developer) ok = false;
        if (ok && used.indexOf("platform") === -1 && opts.platform && v.platform !== opts.platform) ok = false;
        if (ok && opts.tier && v.completionTier !== opts.tier) ok = false;
        if (ok && opts.priority && v.backlogPriority !== opts.priority) ok = false;
        if (ok && opts.format && v.format !== opts.format) ok = false;
        if (ok && opts.owned && !(v.physical && v.physical.volumes.length)) ok = false;
        if (ok && opts.dnf && !(v.dnf && v.dnf.isDnf)) ok = false;
        if (ok && opts.favourite && !v.favourite) ok = false;
        if (ok && needle && v.titleLower.indexOf(needle) === -1) ok = false;
        if (ok) out.push(v);
        cur.continue();
      };
      picked.rq.onerror = function () { cb(picked.rq.error, []); };
    });
  }
  /* one entry by external identity (3d search-and-add dedupe):
     indexName "anilist"|"mal"|"vndb". cb(err, entry|null). */
  function getByExternal(indexName, value, cb) {
    tx(ENTRIES, "readonly", function (err, os) {
      if (err) { cb(err, null); return; }
      var rq = os.index(indexName).get(window.IDBKeyRange.only(value));
      rq.onsuccess = function () { cb(null, rq.result || null); };
      rq.onerror = function () { cb(rq.error, null); };
    });
  }
  /* one entry by its cloud identity (Build 4a pull merge) */
  function getBySyncId(syncId, cb) { getByExternal("syncId", syncId, cb); }
  function count(module, cb) {
    tx(ENTRIES, "readonly", function (err, os) {
      if (err) { cb(err, 0); return; }
      var rq = module ? os.index("module").count(window.IDBKeyRange.only(module)) : os.count();
      rq.onsuccess = function () { cb(null, rq.result); };
      rq.onerror = function () { cb(rq.error, 0); };
    });
  }

  /* single-pass aggregate for the Matrix home: per-module status counts,
     genre tallies, score histogram — metadata only, no DOM implications */
  function stats(cb) {
    tx(ENTRIES, "readonly", function (err, os) {
      if (err) { cb(err, null); return; }
      var agg = { total: 0, modules: {}, genres: {}, scores: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], favourites: 0 };
      var rq = os.openCursor();
      rq.onsuccess = function (e) {
        var cur = e.target.result;
        if (!cur) { cb(null, agg); return; }
        var v = cur.value;
        agg.total++;
        var m = agg.modules[v.module] = agg.modules[v.module] ||
          { total: 0, planned: 0, inProgress: 0, onHold: 0, completed: 0, dropped: 0, episodes: 0, volumesOwned: 0, spent: 0 };
        m.total++;
        m[v.status] = (m[v.status] || 0) + 1;
        m.episodes += v.progress.current || 0;   // generic unit count: eps for anime, chapters for books, routes cleared for VN, hours for games
        if (v.quotes && v.quotes.length) m.quotes = (m.quotes || 0) + v.quotes.length;
        if (v.module === "game") {
          m.tiers = m.tiers || {};
          m.tiers[v.completionTier] = (m.tiers[v.completionTier] || 0) + 1;
        }
        if (v.physical && v.physical.volumes) {
          m.volumesOwned += v.physical.volumes.length;
          v.physical.volumes.forEach(function (vol) { if (vol.price) m.spent += vol.price; });
        }
        v.genres.forEach(function (g) { agg.genres[g] = (agg.genres[g] || 0) + 1; });
        if (v.score) agg.scores[Math.round(v.score)]++;
        if (v.favourite) agg.favourites++;
        cur.continue();
      };
      rq.onerror = function () { cb(rq.error, null); };
    });
  }

  /* distinct genre/tag values for the filter dropdowns, straight off the
     index key cursor (multiEntry indexes don't support "nextunique"
     everywhere, so dedupe happens in the map) */
  function distinct(indexName, cb) {
    tx(ENTRIES, "readonly", function (err, os) {
      if (err) { cb(err, []); return; }
      var vals = {}, rq = os.index(indexName).openKeyCursor();
      rq.onsuccess = function (e) {
        var cur = e.target.result;
        if (!cur) { cb(null, Object.keys(vals).sort()); return; }
        vals[cur.key] = true;
        cur.continue();
      };
      rq.onerror = function () { cb(rq.error, []); };
    });
  }

  /* does this entry carry anything the user built by hand — data no
     sync/import could ever resupply? Gates the replace-mode wipe (3h):
     an entry with any of this is never deleted by a source replace. */
  function hasLocalData(e) {
    return !!(
      (e.physical && ((e.physical.volumes && e.physical.volumes.length) || e.physical.owned)) ||
      (e.routes && e.routes.length) ||
      (e.chapters && e.chapters.length) ||
      (e.quotes && e.quotes.length) ||
      (e.cgGallery && (e.cgGallery.totalKnown != null || e.cgGallery.unlockedCount > 0)) ||
      (e.contentWarnings && e.contentWarnings.length) ||
      (e.notes && String(e.notes).trim()) ||
      (e.mood && e.mood.length) ||
      (e.shelves && e.shelves.length) ||
      (e.dnf && e.dnf.isDnf) ||
      (e.tags && e.tags.length) ||
      !!e.coverCrop ||
      e.favourite
    );
  }

  /* ---------------- bulk upsert (sync/import) ----------------
     Updates existing rows instead of duplicating: matched by VNDB id,
     then AniList id, then MAL id (XML imports only carry the latter until
     enrichment backfills the former). Sync wins on list-state fields;
     local-only fields (notes, tags, favourite, ownership) are preserved,
     and known external ids are never erased.

     VN title-claim fallback (3h): an incoming vn row whose vndbId finds
     no match may instead claim an existing vn row that has NO vndbId and
     the same title (case-insensitive) — backfilling the id. This is how
     rows damaged by the 3h bug (synced with vndbId null) and hand-made
     VN entries get adopted by a sync instead of duplicated. Never fires
     across modules or against a row that carries a different id.

     opts.replace = { module, source, protect: [entryIds] } switches to
     replace-from-source: before upserting, every row of that module with
     syncSource === source that is NOT part of the incoming list is
     deleted — UNLESS it carries hand-built data (hasLocalData) or its id
     is in protect (entries referenced by personal flashcards); those are
     kept and merely updated if the import still carries them.

     Reward events (Build 3j): every merge whose fresher list state clears
     the stored watermark lands one event in res.rewards
     ({entryId, title, module, units, statusAdvanced, status}); inserts and
     null watermarks initialise silently. bulkUpsert itself NEVER logs a
     session — the caller decides (syncs log ONE proportional session via
     KOS.media.logSyncRewards; XML imports deliberately ignore the list).

     cb(err, {added, updated, removed, kept, rewards}).                   */
  function bulkUpsert(list, opts, cb) {
    opts = opts || {};
    tx(ENTRIES, "readwrite", function (err, os) {
      if (err) { cb && cb(err); return; }
      var added = 0, updated = 0, removed = 0, kept = 0, i = 0;
      var rewards = [];
      var tombstones = [];   // replace-pass deletions, for cloud sync (4a)
      /* identity sets of the incoming list (raw, pre-normalise — only the
         fields the mappers emit), for the replace pass and title claims */
      var incVndb = {}, incAni = {}, incMal = {}, incTitle = {};
      var anyVn = false;
      (list || []).forEach(function (r) {
        if (!r) return;
        var x = r.externalIds || {};
        if (x.vndbId != null) incVndb[x.vndbId] = true;
        if (x.anilistId != null) incAni[x.anilistId] = true;
        if (x.malId != null) incMal[x.malId] = true;
        if (r.title) incTitle[String(r.title).toLowerCase()] = true;
        if (r.module === "vn") anyVn = true;
      });
      var claimByTitle = {};   // titleLower → existing vn row with no vndbId
      function insert(inc, next) {
        inc.reward = rewardSnapshot(inc);   // new row — initialise silently
        var rq = os.add(inc);
        rq.onsuccess = function () { added++; next(); };
        rq.onerror = function () { cb && cb(rq.error); };
      }
      /* insert — or, for a vn row with an id, adopt a same-title row that
         has none (each stored row can be claimed at most once) */
      function insertOrClaim(inc, next) {
        if (inc.module === "vn" && inc.externalIds.vndbId != null) {
          var orphan = claimByTitle[inc.titleLower];
          if (orphan) {
            delete claimByTitle[inc.titleLower];
            merge(inc, orphan, next);
            return;
          }
        }
        insert(inc, next);
      }
      function merge(inc, old, next) {
        inc.id = old.id;
        /* cloud identity survives every merge — a fresh normalise mints a
           new syncId for the incoming row, but the STORED row's identity
           is what the cloud copy is keyed on (Build 4a) */
        inc.syncId = old.syncId || inc.syncId;
        inc.createdAt = old.createdAt;
        inc.notes = old.notes || inc.notes;
        inc.tags = old.tags.length ? old.tags : inc.tags;
        inc.favourite = old.favourite || inc.favourite;
        /* A crop is local display intent and is meaningful only for the
           exact artwork it was chosen against. Once positioned, keep that
           source/crop pair together instead of applying old coordinates to
           a newly supplied remote cover. Remote attribution in `extra`
           still merges below. `old.coverUrl` is the legacy fingerprint. */
        var positionedCover = old.coverCropSource || (old.coverCrop && old.coverUrl);
        if (old.coverCrop && positionedCover) {
          inc.coverUrl = positionedCover;
          inc.coverCrop = old.coverCrop;
          inc.coverCropSource = positionedCover;
        }
        if (old.ownership !== "unset" && old.ownership !== "digital") inc.ownership = old.ownership;
        /* Books (3b): the physical vault + local axes are NEVER supplied by
           sync/import — they always survive a merge. Author/format prefer
           the richer value (sync fills them in; a manual entry keeps its own). */
        inc.physical = old.physical || inc.physical;
        inc.mood = (old.mood && old.mood.length) ? old.mood : inc.mood;
        inc.shelves = (old.shelves && old.shelves.length) ? old.shelves : inc.shelves;
        /* custom lists UNION (3k): a locally-added list and an AniList-synced
           list both survive — a pull never drops a membership you made. */
        inc.customLists = (old.customLists || []).concat(inc.customLists || [])
          .filter(function (s, i, a) { return s && a.indexOf(s) === i; });
        if (old.dnf && old.dnf.isDnf) inc.dnf = old.dnf;
        inc.author = inc.author || old.author || "";
        inc.format = inc.format || old.format || null;
        /* VN (3c): the manual tracking layer — routes, quotes, the CG
           counter, content warnings — is NEVER supplied by sync; it always
           survives a merge. Developer prefers the richer value (sync fills
           it; a manual entry keeps its own). Progress re-derives from the
           surviving routes so a sync can't zero a route count. */
        inc.routes = old.routes && old.routes.length ? old.routes : inc.routes;
        inc.chapters = old.chapters && old.chapters.length ? old.chapters : inc.chapters;
        inc.quotes = old.quotes && old.quotes.length ? old.quotes : inc.quotes;
        inc.contentWarnings = (old.contentWarnings && old.contentWarnings.length)
          ? old.contentWarnings : inc.contentWarnings;
        if (old.cgGallery && (old.cgGallery.totalKnown != null || old.cgGallery.unlockedCount > 0)) {
          inc.cgGallery = old.cgGallery;
        }
        inc.developer = inc.developer || old.developer || "";
        if (inc.module === "vn" && inc.routes.length) inc.progress = vnProgress(inc.routes);
        /* Games (3e): every axis is manual — no sync exists to supply them,
           so whatever the stored row holds always survives a merge (this
           only ever fires if a future source starts carrying steamAppIds) */
        if (inc.module === "game") {
          inc.publisher = inc.publisher || old.publisher || "";
          if (inc.completionTier === "notStarted" && old.completionTier) inc.completionTier = old.completionTier;
          inc.platform = old.platform || inc.platform;
          if (inc.playtimeHours == null) inc.playtimeHours = old.playtimeHours != null ? old.playtimeHours : null;
          inc.backlogPriority = inc.backlogPriority || old.backlogPriority || null;
          inc.progress = gameProgress(inc.playtimeHours);
        }
        /* extra accretes the same way (3f): an XML re-import carries an
           empty extra{} — without this merge it would wipe the season/
           seasonYear/studio that sync or enrichment already stored, and
           the Seasonal view would silently lose entries. Fresh non-null
           sync values win; a null never beats stored data (the sync
           mapper emits every key, null when AniList has no value). */
        (function () {
          var merged = Object.assign({}, old.extra || {});
          Object.keys(inc.extra || {}).forEach(function (k) {
            if (inc.extra[k] != null) merged[k] = inc.extra[k];
          });
          inc.extra = merged;
        })();
        /* identity accretes: an XML row learns its anilistId from a later
           sync, a synced row keeps a malId learned from enrichment */
        Object.keys(inc.externalIds).forEach(function (k) {
          if (inc.externalIds[k] == null) inc.externalIds[k] = old.externalIds[k];
        });
        if (opts.enrichOnly) {
          /* enrichment fills gaps only — list state stays as stored */
          inc.status = old.status; inc.progress = old.progress;
          inc.score = old.score; inc.dates = old.dates;
          inc.syncSource = old.syncSource; inc.lastSyncedAt = old.lastSyncedAt;
        }
        /* reward watermark (3j): compare the FINAL merged list state
           against the stored watermark, THEN absorb. enrichOnly can't move
           list state, so it can't reward either. */
        if (!opts.enrichOnly) {
          var d = rewardDelta(old.reward, inc);
          if (d) rewards.push({ entryId: inc.id, title: inc.title, module: inc.module,
                                units: d.units, statusAdvanced: d.statusAdvanced, status: inc.status });
        }
        inc.reward = rewardSnapshot(inc);
        var rq = os.put(inc);
        rq.onsuccess = function () { updated++; next(); };
        rq.onerror = function () { cb && cb(rq.error); };
      }
      function step() {
        if (i >= list.length) {
          recordTombstones(tombstones, function () {
            if (added || updated || removed) noteCloud();
            cb && cb(null, { added: added, updated: updated, removed: removed, kept: kept, rewards: rewards });
          });
          return;
        }
        var inc = normalise(list[i++]);
        delete inc.id;
        var alid = inc.externalIds.anilistId, mal = inc.externalIds.malId,
            vndb = inc.externalIds.vndbId;
        if (alid == null && mal == null && vndb == null) { insert(inc, step); return; }
        function tryMal() {
          if (mal == null) { insertOrClaim(inc, step); return; }
          var rqM = os.index("mal").get(window.IDBKeyRange.only(mal));
          rqM.onsuccess = function () {
            if (rqM.result) merge(inc, rqM.result, step);
            else insertOrClaim(inc, step);
          };
          rqM.onerror = function () { cb && cb(rqM.error); };
        }
        function tryAnilist() {
          if (alid == null) { tryMal(); return; }
          var rqA = os.index("anilist").get(window.IDBKeyRange.only(alid));
          rqA.onsuccess = function () {
            if (rqA.result) merge(inc, rqA.result, step);
            else tryMal();
          };
          rqA.onerror = function () { cb && cb(rqA.error); };
        }
        function tryVndb() {
          if (vndb == null) { tryAnilist(); return; }
          var rqV = os.index("vndb").get(window.IDBKeyRange.only(vndb));
          rqV.onsuccess = function () {
            if (rqV.result) merge(inc, rqV.result, step);
            else tryAnilist();
          };
          rqV.onerror = function () { cb && cb(rqV.error); };
        }
        tryVndb();
      }

      /* replace-from-source pass (before any upsert): sweep the module's
         rows from this source; delete the bare ones the import no longer
         carries, count the protected ones as kept */
      function replacePass(next) {
        var rp = opts.replace;
        if (!rp || !rp.module || !rp.source) { next(); return; }
        var protect = {};
        (rp.protect || []).forEach(function (id) { protect[id] = true; });
        var cur = os.index("module").openCursor(window.IDBKeyRange.only(rp.module));
        cur.onsuccess = function (e) {
          var c = e.target.result;
          if (!c) { next(); return; }
          var v = c.value;
          if (v.syncSource === rp.source) {
            var x = v.externalIds || {};
            var inIncoming = (x.vndbId != null && incVndb[x.vndbId]) ||
              (x.anilistId != null && incAni[x.anilistId]) ||
              (x.malId != null && incMal[x.malId]) ||
              /* an id-less row the import will claim by title stays */
              (rp.module === "vn" && x.vndbId == null && incTitle[v.titleLower]);
            if (!inIncoming) {
              if (hasLocalData(v) || protect[v.id]) kept++;
              else {
                if (v.syncId) tombstones.push({ syncId: v.syncId, module: v.module, ts: Date.now() });
                c.delete(); removed++;
              }
            }
          }
          c.continue();
        };
        cur.onerror = function () { cb && cb(cur.error); };
      }

      /* title-claim pass: collect the module's id-less vn rows (after the
         replace pass, so a just-deleted row can't be claimed) */
      function claimPass(next) {
        if (!anyVn) { next(); return; }
        var cur = os.index("module").openCursor(window.IDBKeyRange.only("vn"));
        cur.onsuccess = function (e) {
          var c = e.target.result;
          if (!c) { next(); return; }
          var v = c.value;
          if (v.externalIds.vndbId == null && !claimByTitle[v.titleLower]) {
            claimByTitle[v.titleLower] = v;
          }
          c.continue();
        };
        cur.onerror = function () { cb && cb(cur.error); };
      }

      replacePass(function () { claimPass(step); });
    });
  }

  /* every entry of a module that still has no cover/genres but carries an
     id we can look up publicly — the enrichment set. VN rows key off the
     VNDB id (and developer, which only VNDB supplies); anime/books off the
     AniList/MAL pair. */
  function needingEnrichment(module, cb) {
    query({ module: module }, function (err, all) {
      if (err) { cb(err, []); return; }
      cb(null, all.filter(function (e) {
        if (e.extra && e.extra.enrichedAt && e.coverUrl) return false;
        if (module === "vn") {
          return !!e.externalIds.vndbId && (!e.coverUrl || !e.developer || !e.genres.length);
        }
        return (e.externalIds.anilistId || e.externalIds.malId) &&
          (!e.coverUrl || !e.genres.length);
      }));
    });
  }

  /* ---------------- bulk export / import (R3 full-coverage backup) -------
     Token keys are deliberately excluded from export — a backup file may be
     stored or shared in less-secure locations; the user reconnects services
     the same way they did originally after a restore.                      */
  var TOKEN_KV_KEYS = {
    "anilist.clientId": 1, "anilist.token": 1, "anilist.viewer": 1,
    "vndb.token": 1, "vndb.user": 1
  };

  function exportAll(cb) {
    open(function (err, d) {
      if (err) { cb(err); return; }
      var t = d.transaction([ENTRIES, KV], "readonly");
      var entriesResult = [], kvResult = [], pending = 2, fired = false;
      function done(e) {
        if (fired) return;
        if (e) { fired = true; cb(e); return; }
        if (!--pending) { fired = true; cb(null, { entries: entriesResult, kv: kvResult }); }
      }
      var eRq = t.objectStore(ENTRIES).getAll();
      eRq.onsuccess = function () { entriesResult = eRq.result || []; done(null); };
      eRq.onerror = function () { done(eRq.error || new Error("entries read failed")); };
      var kRq = t.objectStore(KV).getAll();
      kRq.onsuccess = function () {
        /* cloudsync.* keys are device/account-local sync watermarks and
           queues — restoring them onto another device would poison its
           echo detection, so they never ride a backup (Build 4a) */
        kvResult = (kRq.result || []).filter(function (item) {
          return !TOKEN_KV_KEYS[item.key] && String(item.key).indexOf("cloudsync.") !== 0;
        });
        done(null);
      };
      kRq.onerror = function () { done(kRq.error || new Error("kv read failed")); };
    });
  }

  function importAll(data, cb) {
    open(function (err, d) {
      if (err) { cb(err); return; }
      var t = d.transaction([ENTRIES, KV], "readwrite");
      var cbCalled = false;
      t.oncomplete = function () { if (!cbCalled) { cbCalled = true; cb(null); } };
      t.onerror = function () { if (!cbCalled) { cbCalled = true; cb(t.error || new Error("Import failed")); } };
      t.onabort = function () { if (!cbCalled) { cbCalled = true; cb(t.error || new Error("Import aborted")); } };
      var es = t.objectStore(ENTRIES);
      var ks = t.objectStore(KV);
      es.clear();
      ks.clear();
      (data.entries || []).forEach(function (e) { es.put(e); });
      (data.kv || []).forEach(function (item) { ks.put(item); });
    });
  }

  /* ---------------- key-value store (AniList + VNDB connection) ---------- */
  function getKV(key, cb) {
    tx(KV, "readonly", function (err, os) {
      if (err) { cb(err); return; }
      var rq = os.get(key);
      rq.onsuccess = function () { cb(null, rq.result ? rq.result.value : null); };
      rq.onerror = function () { cb(rq.error); };
    });
  }
  function setKV(key, value, cb) {
    tx(KV, "readwrite", function (err, os) {
      if (err) { cb && cb(err); return; }
      var rq = os.put({ key: key, value: value });
      rq.onsuccess = function () { cb && cb(null); };
      rq.onerror = function () { cb && cb(rq.error); };
    });
  }
  function delKV(key, cb) {
    tx(KV, "readwrite", function (err, os) {
      if (err) { cb && cb(err); return; }
      var rq = os.delete(key);
      rq.onsuccess = function () { cb && cb(null); };
      rq.onerror = function () { cb && cb(rq.error); };
    });
  }

  KOS.mediadb = {
    available: available,
    open: open,
    STATUSES: STATUSES,
    CONDITIONS: CONDITIONS,
    FORMATS: FORMATS,
    TIERS: TIERS,
    PLATFORMS: PLATFORMS,
    PRIORITIES: PRIORITIES,
    normVolume: normVolume,
    normRoute: normRoute,
    normQuote: normQuote,
    normChapter: normChapter,
    vnProgress: vnProgress,
    gameProgress: gameProgress,
    STATUS_RANK: STATUS_RANK,
    rewardSnapshot: rewardSnapshot,
    rewardDelta: rewardDelta,
    normalise: normalise,
    add: add,
    put: put,
    get: get,
    remove: remove,
    query: query,
    getByExternal: getByExternal,
    getBySyncId: getBySyncId,
    genSyncId: genSyncId,
    recordTombstones: recordTombstones,
    count: count,
    stats: stats,
    distinct: distinct,
    bulkUpsert: bulkUpsert,
    hasLocalData: hasLocalData,
    needingEnrichment: needingEnrichment,
    exportAll: exportAll,
    importAll: importAll,
    getKV: getKV,
    setKV: setKV,
    delKV: delKV
  };
})();
