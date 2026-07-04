/* Kurenai OS — core/vndb.js
   VNDB API client (Build 3c): personal-token connection, authenticated
   ulist sync, and public batch enrichment against the Kana (v2) HTTP API.

   Facts verified live during Build 3c (2026-07-03), against the OFFICIAL
   endpoint — https://api.vndb.org/kana (community wrappers float a
   third-party proxy, api.vndbproxy.org; deliberately not used here):
   - OPTIONS preflight with `Origin: null` (what a file:// page sends)
     answers 204 with `access-control-allow-origin: null`, methods
     POST/GET/OPTIONS and allowed headers Content-Type + Authorization;
     the real POST answers `access-control-allow-origin: *` → the API
     works from a file:// page, no local server needed. Same happy
     outcome as AniList; every failure path degrades politely.
   - POST /vn and POST /ulist ran verbatim: response is {more, results},
     ulist rows carry vote 10–100, labels [{id,label}], started/finished
     dates and the nested vn record; GET /authinfo without a token gives
     a clean 401 (with CORS headers intact, so the browser sees it).
   - Documented rate limit: 200 requests / 5 min + 1 s execution time per
     minute; no per-response rate headers were observed. Bulk requests
     are paced ~1.6 s apart anyway, and 429s back off (Retry-After if
     present, a conservative default when not).

   Auth (api.vndb.org/kana docs — "User authentication"):
   - No OAuth: the user generates a personal token at vndb.org/u/tokens
     and pastes it in — closer to a password than AniList's PIN flow.
   - Header format: `Authorization: Token <token>`; GET /authinfo names
     the token's owner and permissions ("listread" for reads,
     "listwrite" additionally for the 3d write-back).
   - Tokens don't expire on a schedule but can be revoked; on 401 we
     clear the stored token and ask the user to reconnect.

   Write-back (Build 3d) — the documented endpoint is PATCH /ulist/<id>
   with {vote (10–100), labels/labels_set/labels_unset (virtual labels 0
   and 7 cannot be set; "Voted" follows the vote field automatically)},
   answering 204 No Content; needs a token with "listwrite". VERIFIED
   LIVE 2026-07-03: the endpoint is real (tokenless PATCH → clean 401),
   **but VNDB's CORS preflight only allows POST, GET, OPTIONS — even
   when asked for PATCH** — so browsers refuse to send the write from
   any web page, file:// included. setUlist() is implemented to the
   documented shape regardless (it starts working with zero changes if
   VNDB ever adds PATCH to access-control-allow-methods); the caller
   surfaces the specific explanation, never a generic "you're offline".
   Reads remain the only thing that currently works from the browser.  */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var ENDPOINT = "https://api.vndb.org/kana";
  var TOKEN_URL = "https://vndb.org/u/tokens";
  var REQUEST_GAP = 1600;   // ms between bulk requests — 200 req/5 min with headroom
  var MAX_RETRIES = 3;
  var PAGE_SIZE = 100;      // documented per-request maximum

  /* ---------------- transport ---------------- */
  /* cb(err, data). err = {kind:"network"|"auth"|"ratelimit"|"http",
     message, retryAfter?} — the UI keys its wording off `kind` (same
     contract as KOS.anilist.gql). body null → GET; `method` overrides
     (PATCH for the ulist write). 204 answers cb(null, null). */
  function api(path, body, token, cb, method) {
    var verb = method || (body ? "POST" : "GET");
    var isWrite = verb === "PATCH" || verb === "DELETE";
    var headers = { "Accept": "application/json" };
    if (body) headers["Content-Type"] = "application/json";
    if (token) headers["Authorization"] = "Token " + token;
    var ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var t = ctl && setTimeout(function () { ctl.abort(); }, 30000);
    fetch(ENDPOINT + path, {
      method: verb, headers: headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctl ? ctl.signal : undefined
    }).then(function (res) {
      if (t) clearTimeout(t);
      if (res.status === 429) {
        var ra = parseInt(res.headers.get("Retry-After"), 10);
        cb({ kind: "ratelimit", retryAfter: isNaN(ra) ? 30 : ra,
             message: "Rate limited by VNDB — resuming shortly." });
        return;
      }
      if (res.status === 401) {
        cb({ kind: "auth", message: isWrite
          ? "VNDB write access needs a token with write permission enabled — regenerate yours at vndb.org/u/tokens with “modify my list” ticked, then reconnect from Sync & Import."
          : "VNDB rejected the token — it may have been revoked. Generate a new one at vndb.org/u/tokens and reconnect from Sync & Import." });
        return;
      }
      if (res.status === 403) {
        cb({ kind: "auth", message: "That VNDB token isn't allowed to do this — for write-back it needs the listwrite permission. Regenerate it at vndb.org/u/tokens with “modify my list” ticked." });
        return;
      }
      if (res.status === 204) { cb(null, null); return; }   // PATCH/DELETE success
      if (!res.ok) {
        /* Kana returns error detail as plain text, not JSON */
        res.text().then(function (msg) {
          cb({ kind: "http", message: "VNDB returned HTTP " + res.status + (msg ? " — " + msg.slice(0, 200) : ".") });
        });
        return;
      }
      res.json().then(function (data) { cb(null, data); }, function () {
        cb({ kind: "http", message: "VNDB sent an unreadable response." });
      });
    }).catch(function (e) {
      if (t) clearTimeout(t);
      cb({ kind: "network",
           message: (e && e.name === "AbortError")
             ? "VNDB request timed out — check your connection and retry."
             : isWrite
             ? "VNDB blocked the write at the browser level: their CORS policy allows only POST/GET/OPTIONS (verified 2026-07-03), so browser pages can't send the PATCH their API requires — this is on VNDB's side, not your token or connection. Your change is saved locally and reads keep working; if VNDB opens up PATCH, pushes start working automatically."
             : "Could not reach VNDB — you look offline. (The API does allow file:// pages, so a local server isn't the issue; everything keeps working offline, covers and metadata just wait.)" });
    });
  }

  /* ---------------- connection (personal token) ---------------- */
  /* Token + verified identity live in the media DB's kv store — never
     localStorage, never the backup JSON export. */
  function getConnection(cb) {
    KOS.mediadb.getKV("vndb.token", function (e1, token) {
      KOS.mediadb.getKV("vndb.user", function (e2, user) {
        cb(e1 || e2 || null, { token: token || null, user: user || null });
      });
    });
  }
  function setToken(token, cb) { KOS.mediadb.setKV("vndb.token", String(token).trim(), cb); }
  function disconnect(cb) {
    KOS.mediadb.delKV("vndb.token", function () {
      KOS.mediadb.delKV("vndb.user", cb);
    });
  }

  /* who does this token belong to? Stores {id, username, permissions}. */
  function fetchAuthInfo(token, cb) {
    api("/authinfo", null, token, function (err, data) {
      if (err) { cb(err); return; }
      if (!data || !data.id) { cb({ kind: "http", message: "No user returned for that token." }); return; }
      if ((data.permissions || []).indexOf("listread") === -1) {
        cb({ kind: "auth", message: "That token can't read your list — regenerate it at vndb.org/u/tokens with “access to my list” ticked (write access is NOT needed and best left off)." });
        return;
      }
      KOS.mediadb.setKV("vndb.user", data, function () { cb(null, data); });
    });
  }

  /* ---------------- mapping ---------------- */
  /* Default ulist labels (ids < 10 per the Kana docs; 1/2/4/7 seen live).
     Precedence: an active playthrough outranks a Finished label (a replay
     reads as in progress), Blacklist entries are skipped entirely. */
  var LABEL_STATUS = {
    1: "inProgress",   // Playing
    2: "completed",    // Finished
    3: "onHold",       // Stalled
    4: "dropped",      // Dropped
    5: "planned"       // Wishlist
  };
  var LABEL_PRECEDENCE = [1, 2, 4, 3, 5];
  function statusFromLabels(labels) {
    var ids = (labels || []).map(function (l) { return l.id; });
    if (ids.indexOf(6) !== -1) return null;   // Blacklist → skip
    for (var i = 0; i < LABEL_PRECEDENCE.length; i++) {
      if (ids.indexOf(LABEL_PRECEDENCE[i]) !== -1) return LABEL_STATUS[LABEL_PRECEDENCE[i]];
    }
    return "planned";   // only custom/virtual labels → safest default
  }

  /* VNDB has no genre axis — its content tags (category "cont") are the
     nearest honest equivalent. Non-spoiler, decently-rated tags only,
     top 6 by rating, so the shared genre taxonomy isn't flooded. */
  function genresFromTags(tags) {
    return (tags || [])
      .filter(function (t) { return t.category === "cont" && t.spoiler === 0 && (t.rating || 0) >= 2; })
      .sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); })
      .slice(0, 6)
      .map(function (t) { return t.name; });
  }

  function firstDeveloper(devs) {
    return (devs && devs[0] && devs[0].name) || "";
  }

  /* shared vn.* field list — the same nested record serves sync and
     enrichment, so both map through vnRecord() */
  var VN_FIELDS = "id, title, alttitle, image.url, length, length_minutes, " +
    "developers.name, tags.name, tags.category, tags.rating, tags.spoiler";
  function vnRecord(vn) {
    vn = vn || {};
    return {
      vndbId: vn.id || null,
      title: vn.title || "Untitled",
      developer: firstDeveloper(vn.developers),
      coverUrl: (vn.image && vn.image.url) || null,
      genres: genresFromTags(vn.tags),
      extra: {
        titleAlt: vn.alttitle || null,
        length: vn.length || null,               // 1–5 very short → very long
        lengthMinutes: vn.length_minutes || null // crowd-sourced play time
      }
    };
  }

  /* one authenticated ulist row → the shared media schema.
     Returns null for blacklisted entries.
     NOTE: sync populates the METADATA half only — routes, the CG counter,
     quotes and content warnings are manual axes VNDB has no data for.
     IDENTITY (the Build 3h bug, verified live 2026-07-04): a /ulist row's
     TOP-LEVEL `id` IS the VN id — the nested vn record carries NO id
     field, even when "vn.id" is in the requested field list. Reading
     r.vn.id here produced vndbId null on every synced entry, so no
     re-sync could ever match and the whole list duplicated each pull. */
  function mapListEntry(r) {
    var status = statusFromLabels(r.labels);
    if (!status) return null;
    var rec = vnRecord(r.vn);
    rec.vndbId = r.id || rec.vndbId || null;
    return {
      module: "vn",
      title: rec.title,
      status: status,
      /* no routes known at sync time — progress stays empty until the
         user builds their manual route list */
      progress: { current: 0, total: null },
      ownership: "unset",
      score: typeof r.vote === "number" ? Math.max(0, Math.min(10, r.vote / 10)) : 0,
      genres: rec.genres,
      dates: { started: r.started || null, finished: r.finished || null },
      externalIds: { vndbId: rec.vndbId },
      coverUrl: rec.coverUrl,
      developer: rec.developer,
      notes: r.notes || "",
      syncSource: "vndb",
      lastSyncedAt: Date.now(),
      extra: rec.extra
    };
  }

  /* ---------------- write-back (Build 3d) ---------------- */
  /* shared status → default-label reverse of LABEL_STATUS */
  var STATUS_TO_LABEL = {
    inProgress: 1, completed: 2, onHold: 3, dropped: 4, planned: 5
  };
  var MANAGED_LABELS = [1, 2, 3, 4, 5];   // the only labels we ever touch

  /* Push ONE entry's remote-mapped fields to the user's list:
     status → labels_set/labels_unset (managed labels only — customs and
     the virtual Voted label are never touched), score → vote (10–100;
     score 0 = locally unrated → vote is OMITTED, never used to clear a
     remote rating). VNDB's ulist has NO progress concept, so progress/
     routes never appear here by construction. cb(err). */
  function setUlist(token, vndbId, fields, cb) {
    var body = {};
    if (fields.status && STATUS_TO_LABEL[fields.status]) {
      var target = STATUS_TO_LABEL[fields.status];
      body.labels_set = [target];
      body.labels_unset = MANAGED_LABELS.filter(function (l) { return l !== target; });
    }
    if (typeof fields.score === "number" && fields.score > 0) {
      body.vote = Math.max(10, Math.min(100, Math.round(fields.score * 10)));
    }
    if (!Object.keys(body).length) { cb(null); return; }
    api("/ulist/" + vndbId, body, token, function (err) { cb(err || null); }, "PATCH");
  }

  /* ---------------- profile-level reads (Build 3j) ----------------
     What the Kana API genuinely exposes at account level — all three
     verified live 2026-07-04 against api.vndb.org/kana:
     - GET /user?q=<uid>&fields=lengthvotes,lengthvotes_sum → keyed by the
       query ({"u2":{id,username,lengthvotes,lengthvotes_sum}});
     - GET /ulist_labels?user=<uid>&fields=count → every label INCLUDING
       user-defined customs, each with a live count;
     - GET /stats → site-wide database totals (vn/releases/producers/…).
     That is the WHOLE profile surface: VNDB's API has no favourites, no
     followers/following, no activity feed and no notifications — the
     profile view says so instead of faking parity with AniList. */
  function fetchUserStats(token, userId, cb) {
    api("/user?q=" + encodeURIComponent(userId) + "&fields=lengthvotes,lengthvotes_sum", null, token, function (err, data) {
      if (err) { cb(err); return; }
      cb(null, (data && data[userId]) || null);
    });
  }
  function fetchUlistLabels(token, userId, cb) {
    api("/ulist_labels?user=" + encodeURIComponent(userId) + "&fields=count", null, token, function (err, data) {
      if (err) { cb(err); return; }
      cb(null, (data && data.labels) || []);
    });
  }
  function fetchSiteStats(cb) {
    api("/stats", null, null, cb);
  }

  /* ---------------- public search (Build 3d) ---------------- */
  /* The documented ["search","=",term] filter — same algorithm as the
     site's own search (verified live 2026-07-03). cb(err, results[]),
     result = the vnRecord shape + {released}. */
  function searchVN(term, cb) {
    api("/vn", {
      filters: ["search", "=", String(term)],
      fields: VN_FIELDS + ", released",
      sort: "searchrank",
      results: 10
    }, null, function (err, data) {
      if (err) { cb(err, []); return; }
      cb(null, (data && data.results || []).map(function (vn) {
        var rec = vnRecord(vn);
        rec.released = vn.released || null;
        return rec;
      }));
    });
  }

  /* ---------------- authenticated sync ---------------- */
  /* Pull the whole ulist for the token's owner: pages of 100, paced,
     with rate-limit backoff. hooks = {onProgress(fetched, note)};
     cb(err, mappedEntries[]). */
  function syncList(token, hooks, cb) {
    hooks = hooks || {};
    var mapped = [], page = 1;
    function pull(attempt) {
      api("/ulist", {
        user: null,   // null = the authenticated user
        fields: "id, vote, notes, started, finished, labels.id, labels.label, " +
          VN_FIELDS.split(", ").map(function (f) { return "vn." + f; }).join(", "),
        sort: "id", results: PAGE_SIZE, page: page
      }, token, function (err, data) {
        if (err && err.kind === "ratelimit" && attempt < MAX_RETRIES) {
          if (hooks.onProgress) hooks.onProgress(mapped.length,
            "Rate limited by VNDB — resuming in " + err.retryAfter + " s…");
          setTimeout(function () { pull(attempt + 1); }, (err.retryAfter + 1) * 1000);
          return;
        }
        if (err) { cb(err); return; }
        (data.results || []).forEach(function (r) {
          var m = mapListEntry(r);
          if (m) mapped.push(m);
        });
        if (hooks.onProgress) hooks.onProgress(mapped.length, null);
        if (data.more) {
          page++;
          setTimeout(function () { pull(0); }, REQUEST_GAP);
        } else {
          cb(null, mapped);
        }
      });
    }
    pull(0);
  }

  /* ---------------- public batch enrichment ----------------
     For manually-linked entries (the user typed a VNDB id) that still miss
     cover/developer/genres — no token needed. Batches of 50 ids per
     request via an ["or", ["id","=",…]…] filter.
     hooks = {onProgress(done,total,note)}; cb(err, records[]), record =
     {vndbId, title, developer, coverUrl, genres, extra}. */
  function enrich(vndbIds, hooks, cb) {
    hooks = hooks || {};
    var chunks = [];
    (vndbIds || []).forEach(function (id, i) {
      if (i % 50 === 0) chunks.push([]);
      chunks[chunks.length - 1].push(id);
    });
    var total = (vndbIds || []).length;
    var records = [], done = 0, ci = 0;

    function finish(err) { cb(err || null, records); }
    function nextChunk() {
      if (ci >= chunks.length) { finish(null); return; }
      runChunk(chunks[ci], 1, 0, function (err) {
        if (err) { finish(err); return; }
        done += chunks[ci].length;
        ci++;
        if (hooks.onProgress) hooks.onProgress(Math.min(done, total), total, null);
        if (ci < chunks.length) setTimeout(nextChunk, REQUEST_GAP);
        else finish(null);
      });
    }
    function runChunk(ids, page, attempt, next) {
      var filter = ids.length === 1
        ? ["id", "=", ids[0]]
        : ["or"].concat(ids.map(function (id) { return ["id", "=", id]; }));
      api("/vn", { filters: filter, fields: VN_FIELDS, results: PAGE_SIZE, page: page }, null,
        function (err, data) {
          if (err && err.kind === "ratelimit" && attempt < MAX_RETRIES) {
            if (hooks.onProgress) hooks.onProgress(done, total,
              "Rate limited by VNDB — resuming in " + err.retryAfter + " s…");
            setTimeout(function () { runChunk(ids, page, attempt + 1, next); }, (err.retryAfter + 1) * 1000);
            return;
          }
          if (err) { next(err); return; }
          (data.results || []).forEach(function (vn) { records.push(vnRecord(vn)); });
          if (data.more) setTimeout(function () { runChunk(ids, page + 1, 0, next); }, REQUEST_GAP);
          else next(null);
        });
    }
    if (chunks.length) nextChunk(); else finish(null);
  }

  KOS.vndb = {
    ENDPOINT: ENDPOINT,
    TOKEN_URL: TOKEN_URL,
    api: api,
    getConnection: getConnection,
    setToken: setToken,
    disconnect: disconnect,
    fetchAuthInfo: fetchAuthInfo,
    fetchUserStats: fetchUserStats,
    fetchUlistLabels: fetchUlistLabels,
    fetchSiteStats: fetchSiteStats,
    LABEL_STATUS: LABEL_STATUS,
    STATUS_TO_LABEL: STATUS_TO_LABEL,
    statusFromLabels: statusFromLabels,
    setUlist: setUlist,
    searchVN: searchVN,
    genresFromTags: genresFromTags,
    mapListEntry: mapListEntry,
    vnRecord: vnRecord,
    syncList: syncList,
    enrich: enrich
  };
})();
