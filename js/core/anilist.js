/* Kurenai OS — core/anilist.js
   AniList API client (Build 3a): OAuth PIN connection, authenticated
   MediaListCollection sync, and public batch enrichment.

   Facts verified live during Build 3a (2026-07-02):
   - POST https://graphql.anilist.co answers requests carrying `Origin: null`
     with `access-control-allow-origin: *` → the public API works from a
     file:// page. Online is additive; every failure path degrades politely.
   - The API is in a documented degraded state: X-RateLimit-Limit is 30/min
     (docs' normal figure is 90). There is an additional undocumented burst
     limiter, so requests are paced ~2.4 s apart and 429s honour Retry-After.
   - The MediaListCollection query below ran verbatim against a real account:
     custom lists come back with status:null and DUPLICATE the entries of the
     status lists, so sync dedupes by entry id before mapping.

   Auth (docs.anilist.co/guide/auth — Implicit Grant + Auth Pin):
   - authorize URL: https://anilist.co/api/v2/oauth/authorize
       ?client_id={id}&response_type=token          (no secret, no scopes)
   - with the app's Redirect URL set to https://anilist.co/api/v2/oauth/pin,
     AniList shows the access token as copyable text after approval.
   - Tokens live 1 year; there are no refresh tokens — on 401 we clear the
     stored token and ask the user to reconnect.

   Build 3d — write-back. The read-only rule of 3a/3b is deliberately
   lifted for LIST STATE ONLY: saveListEntry() sends the SaveMediaListEntry
   mutation, whose argument names/types were verified against the live
   schema by introspection on 2026-07-03 (mediaId Int, status
   MediaListStatus, progress Int, progressVolumes Int, score Float,
   scoreRaw Int 0–100, …). scoreRaw is used instead of score so the push
   is independent of whatever scoring format the user picked on the site.
   Nothing else is ever mutated — no deletes, no favourites, no reviews.  */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var ENDPOINT = "https://graphql.anilist.co";
  var PIN_URL = "https://anilist.co/api/v2/oauth/pin";
  var REQUEST_GAP = 2400;        // ms between bulk requests — 30 req/min + burst headroom
  var MAX_RETRIES = 3;

  /* ---------------- transport ---------------- */
  /* cb(err, data). err = {kind:"network"|"auth"|"ratelimit"|"gql"|"http",
     message, retryAfter?} — the UI keys its wording off `kind`. */
  function gql(query, variables, token, cb) {
    var headers = { "Content-Type": "application/json", "Accept": "application/json" };
    if (token) headers["Authorization"] = "Bearer " + token;
    var ctl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var t = ctl && setTimeout(function () { ctl.abort(); }, 30000);
    fetch(ENDPOINT, {
      method: "POST", headers: headers,
      body: JSON.stringify({ query: query, variables: variables || {} }),
      signal: ctl ? ctl.signal : undefined
    }).then(function (res) {
      if (t) clearTimeout(t);
      return res.json().catch(function () { return {}; }).then(function (body) {
        if (res.status === 429) {
          var ra = parseInt(res.headers.get("Retry-After"), 10);
          cb({ kind: "ratelimit", retryAfter: isNaN(ra) ? 60 : ra,
               message: "Rate limited by AniList — resuming shortly." });
        } else if (res.status === 401 || res.status === 400 && hasInvalidToken(body)) {
          cb({ kind: "auth", message: "AniList rejected the token — it may have expired (they last 1 year). Reconnect from Sync & Import." });
        } else if (!res.ok) {
          cb({ kind: "http", message: "AniList returned HTTP " + res.status + "." });
        } else if (body.errors && body.errors.length) {
          cb({ kind: "gql", message: body.errors[0].message || "AniList query error." });
        } else {
          cb(null, body.data);
        }
      });
    }).catch(function (e) {
      if (t) clearTimeout(t);
      cb({ kind: "network",
           message: (e && e.name === "AbortError")
             ? "AniList request timed out — check your connection and retry."
             : "Could not reach AniList — you look offline. (The API does allow file:// pages, so a local server isn't the issue; everything keeps working offline, covers and genres just wait.)" });
    });
  }
  function hasInvalidToken(body) {
    return !!(body && body.errors && body.errors.some(function (e) {
      return /invalid.*token|unauthorized/i.test(e.message || "");
    }));
  }

  /* ---------------- OAuth PIN flow ---------------- */
  function authorizeUrl(clientId) {
    return "https://anilist.co/api/v2/oauth/authorize?client_id=" +
      encodeURIComponent(String(clientId).trim()) + "&response_type=token";
  }

  /* connection state lives in the media DB's kv store — never localStorage,
     never a committed file */
  function getConnection(cb) {
    KOS.mediadb.getKV("anilist.clientId", function (e1, clientId) {
      KOS.mediadb.getKV("anilist.token", function (e2, token) {
        KOS.mediadb.getKV("anilist.viewer", function (e3, viewer) {
          cb(e1 || e2 || e3 || null, {
            clientId: clientId || "", token: token || null, viewer: viewer || null
          });
        });
      });
    });
  }
  function setClientId(id, cb) { KOS.mediadb.setKV("anilist.clientId", String(id).trim(), cb); }
  function setToken(token, cb) { KOS.mediadb.setKV("anilist.token", String(token).trim(), cb); }
  function disconnect(cb) {
    KOS.mediadb.delKV("anilist.token", function () {
      KOS.mediadb.delKV("anilist.viewer", cb);
    });
  }

  /* who does this token belong to? Stores the viewer on success. */
  function fetchViewer(token, cb) {
    gql("query { Viewer { id name } }", {}, token, function (err, data) {
      if (err) { cb(err); return; }
      if (!data || !data.Viewer) { cb({ kind: "gql", message: "No viewer returned." }); return; }
      KOS.mediadb.setKV("anilist.viewer", data.Viewer, function () { cb(null, data.Viewer); });
    });
  }

  /* ---------------- mapping ---------------- */
  var STATUS_MAP = {
    CURRENT: "inProgress", REPEATING: "inProgress", PLANNING: "planned",
    COMPLETED: "completed", DROPPED: "dropped", PAUSED: "onHold"
  };
  /* the write direction (3d). REPEATING is never produced — a local
     "inProgress" pushes as CURRENT; if the entry was REPEATING on the
     site, last-write-wins applies like everywhere else. */
  var STATUS_TO_AL = {
    inProgress: "CURRENT", planned: "PLANNING", completed: "COMPLETED",
    dropped: "DROPPED", onHold: "PAUSED"
  };
  function fuzzyToISO(d) {
    if (!d || !d.year) return null;
    function p(n) { return (n < 10 ? "0" : "") + n; }
    return d.year + "-" + p(d.month || 1) + "-" + p(d.day || 1);
  }
  function mediaType(module) { return module === "anime" ? "ANIME" : "MANGA"; }

  /* AniList's MANGA-type format enum → the Books module's format axis
     (verified live 2026-07-02: MANGA / NOVEL / ONE_SHOT are what the API
     returns for type:MANGA media) */
  function bookFormat(alFormat) {
    return alFormat === "NOVEL" ? "lightNovel"
      : alFormat === "ONE_SHOT" ? "oneShot"
      : alFormat ? "manga" : null;
  }
  /* The staff connection carries everyone — translators, letterers,
     assistants (seen live on Berserk: "Translator (Spanish)" etc.). The
     author is the first Story/Art-role credit; fall back to the first
     edge only if no such role exists. */
  function pickAuthor(staff) {
    var edges = (staff && staff.edges) || [];
    var hit = edges.find(function (ed) {
      return ed && /story|art|author|original creator/i.test(ed.role || "") &&
        !/translat|assist|letter/i.test(ed.role || "");
    }) || edges[0];
    return (hit && hit.node && hit.node.name && hit.node.name.full) || "";
  }

  /* one authenticated list entry → the shared media schema */
  function mapListEntry(en, module) {
    var m = en.media || {};
    var out = {
      module: module,
      title: (m.title && (m.title.romaji || m.title.english)) || "Untitled",
      status: STATUS_MAP[en.status] || "planned",
      progress: {
        current: en.progress || 0,
        total: module === "anime" ? (m.episodes || null) : (m.chapters || null)
      },
      ownership: module === "anime" ? "digital" : "unset",
      score: typeof en.score === "number" ? Math.max(0, Math.min(10, en.score)) : 0,
      genres: m.genres || [],
      dates: { started: fuzzyToISO(en.startedAt), finished: fuzzyToISO(en.completedAt) },
      externalIds: { anilistId: m.id || null, malId: m.idMal || null },
      coverUrl: (m.coverImage && (m.coverImage.extraLarge || m.coverImage.large)) || null,
      syncSource: "anilist",
      lastSyncedAt: Date.now(),
      extra: {
        bannerImage: m.bannerImage || null,
        format: m.format || null, season: m.season || null,
        seasonYear: m.seasonYear || null,
        studio: (m.studios && m.studios.nodes && m.studios.nodes[0] && m.studios.nodes[0].name) || null,
        titleEnglish: (m.title && m.title.english) || null,
        volumes: m.volumes || null
      }
    };
    if (module !== "anime") {
      out.progress.volumes = en.progressVolumes != null ? en.progressVolumes : null;
      out.progress.totalVolumes = m.volumes || null;
      out.format = bookFormat(m.format);
      out.author = pickAuthor(m.staff);
    }
    return out;
  }

  /* ---------------- authenticated sync ---------------- */
  /* MANGA pulls additionally carry progressVolumes + the staff connection
     (for the author) — the query shape was validated live against the real
     endpoint (2026-07-02). Anime pulls skip staff to keep the 650-entry
     response lean. */
  function listQuery(module) {
    var isAnime = module === "anime";
    return "query ($userId: Int, $type: MediaType) {" +
      " MediaListCollection(userId: $userId, type: $type) {" +
      "  lists { name status entries {" +
      "   id status score(format: POINT_10_DECIMAL) progress" +
      (isAnime ? "" : " progressVolumes") +
      "   startedAt { year month day } completedAt { year month day }" +
      "   media { id idMal title { romaji english } coverImage { extraLarge large } bannerImage" +
      "    genres season seasonYear format episodes chapters volumes" +
      "    studios(isMain: true) { nodes { name } }" +
      (isAnime ? "" : " staff(perPage: 4) { edges { role node { name { full } } } }") +
      " } } } } }";
  }

  /* Pull the whole list for one media type. cb(err, mappedEntries[]).
     Custom lists duplicate entries (status:null lists) → dedupe by entry id. */
  function syncList(token, userId, module, cb) {
    gql(listQuery(module), { userId: userId, type: mediaType(module) }, token, function (err, data) {
      if (err) { cb(err); return; }
      var coll = data && data.MediaListCollection;
      if (!coll || !coll.lists) { cb({ kind: "gql", message: "Empty list response." }); return; }
      var seen = {}, mapped = [];
      coll.lists.forEach(function (list) {
        (list.entries || []).forEach(function (en) {
          if (!en || seen[en.id]) return;
          seen[en.id] = true;
          mapped.push(mapListEntry(en, module));
        });
      });
      cb(null, mapped);
    });
  }

  /* one public read-only lookup: the banner for a single media id.
     Used by the vault hero (Build 4.0) when a synced entry predates the
     bannerImage field in the list query. cb(err, urlOrNull). */
  function fetchBanner(anilistId, cb) {
    gql("query ($id: Int) { Media(id: $id) { bannerImage } }", { id: anilistId }, null, function (err, data) {
      if (err) { cb(err); return; }
      cb(null, (data && data.Media && data.Media.bannerImage) || null);
    });
  }

  /* ---------------- write-back (Build 3d) ---------------- */
  /* Push ONE entry's remote-mapped fields: status, progress (episodes/
     chapters), progressVolumes (books only), score. Local score 0 =
     unrated → scoreRaw is OMITTED so a remote rating is never cleared
     by an unrated local entry. cb(err, savedEntry). Mutation shape
     introspected against the live schema 2026-07-03. */
  function saveListEntry(token, fields, cb) {
    var vars = { mediaId: fields.mediaId };
    var args = ["$mediaId: Int"], sends = ["mediaId: $mediaId"];
    if (fields.status && STATUS_TO_AL[fields.status]) {
      vars.status = STATUS_TO_AL[fields.status];
      args.push("$status: MediaListStatus"); sends.push("status: $status");
    }
    if (typeof fields.progress === "number") {
      vars.progress = Math.max(0, Math.round(fields.progress));
      args.push("$progress: Int"); sends.push("progress: $progress");
    }
    if (typeof fields.progressVolumes === "number") {
      vars.progressVolumes = Math.max(0, Math.round(fields.progressVolumes));
      args.push("$progressVolumes: Int"); sends.push("progressVolumes: $progressVolumes");
    }
    if (typeof fields.score === "number" && fields.score > 0) {
      vars.scoreRaw = Math.max(1, Math.min(100, Math.round(fields.score * 10)));
      args.push("$scoreRaw: Int"); sends.push("scoreRaw: $scoreRaw");
    }
    var q = "mutation (" + args.join(", ") + ") {" +
      " SaveMediaListEntry(" + sends.join(", ") + ") { id status progress score } }";
    gql(q, vars, token, function (err, data) {
      if (err) { cb(err); return; }
      cb(null, data && data.SaveMediaListEntry || null);
    });
  }

  /* ---------------- public media search (Build 3d) ---------------- */
  /* Find-something-new, distinct from the vault filter. Query shape ran
     live 2026-07-03 (sort: SEARCH_MATCH). cb(err, results[]), result =
     {anilistId, malId, title, coverUrl, format, year, total, volumes,
      genres, titleEnglish}. */
  function searchMedia(term, module, cb) {
    var q = "query ($search: String, $type: MediaType) {" +
      " Page(page: 1, perPage: 10) {" +
      "  media(search: $search, type: $type, sort: SEARCH_MATCH) {" +
      "   id idMal title { romaji english } coverImage { large }" +
      "   format seasonYear startDate { year } episodes chapters volumes genres" +
      " } } }";
    gql(q, { search: String(term), type: mediaType(module) }, null, function (err, data) {
      if (err) { cb(err, []); return; }
      cb(null, (data && data.Page && data.Page.media || []).map(function (m) {
        return {
          anilistId: m.id, malId: m.idMal || null,
          title: (m.title && (m.title.romaji || m.title.english)) || "Untitled",
          titleEnglish: (m.title && m.title.english) || null,
          coverUrl: (m.coverImage && m.coverImage.large) || null,
          format: m.format || null,
          year: m.seasonYear || (m.startDate && m.startDate.year) || null,
          total: module === "anime" ? (m.episodes || null) : (m.chapters || null),
          volumes: m.volumes || null,
          genres: m.genres || []
        };
      }));
    });
  }

  /* ---------------- airing schedule (Build 3f) ----------------
     nextAiringEpisode verified live 2026-07-03: { id, airingAt (unix
     SECONDS), timeUntilAiring (seconds), episode }. Two surprises from the
     live data worth keeping in mind: airingAt can sit WEEKS out on a
     RELEASING show (mid-season breaks — One Piece 8 days vs Re:Zero S4 40
     days were both RELEASING), and nextAiringEpisode can be null on a
     RELEASING show (long hiatus). Public query, no token. This is live
     data — never persisted to the vault, cached in memory by the caller.
     cb(err, byId) where byId[anilistId] = { airingAt, timeUntilAiring,
     episode, mediaStatus }. */
  function fetchAiring(ids, cb) {
    ids = (ids || []).filter(Boolean);
    if (!ids.length) { cb(null, {}); return; }
    var chunks = [];
    ids.forEach(function (id, i) {
      if (i % 50 === 0) chunks.push([]);
      chunks[chunks.length - 1].push(id);
    });
    var byId = {}, ci = 0;
    (function next() {
      if (ci >= chunks.length) { cb(null, byId); return; }
      var q = "query ($ids: [Int]) { Page(page: 1, perPage: 50) {" +
        " media(id_in: $ids, type: ANIME) { id status" +
        "  nextAiringEpisode { airingAt timeUntilAiring episode } } } }";
      gql(q, { ids: chunks[ci] }, null, function (err, data) {
        if (err) { cb(err, byId); return; }
        ((data && data.Page && data.Page.media) || []).forEach(function (m) {
          if (m.nextAiringEpisode) {
            byId[m.id] = {
              airingAt: m.nextAiringEpisode.airingAt,
              timeUntilAiring: m.nextAiringEpisode.timeUntilAiring,
              episode: m.nextAiringEpisode.episode,
              mediaStatus: m.status || null
            };
          }
        });
        ci++;
        if (ci < chunks.length) setTimeout(next, REQUEST_GAP);
        else cb(null, byId);
      });
    })();
  }

  /* ---------------- profile bundle (Build 3f) ----------------
     The whole AniList profile in ONE request (aliased Pages verified live
     2026-07-03 on a real user): viewer identity + about + banner,
     anime/manga statistics, favourites (anime, manga, characters, staff,
     studios), followers/following with totals, the activity feed, and —
     token permitting — notifications + the unread count.
     Live-verified quirks: followers/following demand $userId as Int!
     (User(id:) accepts plain Int); ListActivity.status is a human string
     ("watched episode") and .progress a string range ("5 - 8"); meanScore
     is on the 0–100 site scale. notifications(resetNotificationCount:
     false) keeps this strictly read-only — the unread badge on the site
     is not consumed by looking here. cb(err, data) with the raw aliased
     shape; the profile view owns presentation. */
  function profileQuery() {
    return "query ($userId: Int!) {" +
      " Viewer { id name about(asHtml: false) avatar { large } bannerImage siteUrl createdAt unreadNotificationCount" +
      "  statistics {" +
      "   anime { count episodesWatched minutesWatched meanScore genres(limit: 8, sort: COUNT_DESC) { genre count } statuses { status count } }" +
      "   manga { count chaptersRead volumesRead meanScore genres(limit: 8, sort: COUNT_DESC) { genre count } } }" +
      "  favourites {" +
      "   anime(perPage: 12) { nodes { id title { romaji english } coverImage { large } } }" +
      "   manga(perPage: 12) { nodes { id title { romaji english } coverImage { large } } }" +
      "   characters(perPage: 12) { nodes { id name { full } image { large } } }" +
      "   staff(perPage: 12) { nodes { id name { full } image { large } } }" +
      "   studios(perPage: 12) { nodes { id name } } } }" +
      " followers: Page(perPage: 12) { pageInfo { total } followers(userId: $userId, sort: ID_DESC) { id name avatar { medium } } }" +
      " following: Page(perPage: 12) { pageInfo { total } following(userId: $userId, sort: ID_DESC) { id name avatar { medium } } }" +
      " activity: Page(perPage: 20) { activities(userId: $userId, sort: ID_DESC) { __typename" +
      "  ... on ListActivity { id status progress createdAt media { title { romaji } coverImage { medium } } }" +
      "  ... on TextActivity { id text(asHtml: false) createdAt }" +
      "  ... on MessageActivity { id message(asHtml: false) createdAt messenger { name } } } }" +
      " notifications: Page(perPage: 15) { notifications(resetNotificationCount: false) { __typename" +
      "  ... on AiringNotification { id episode contexts createdAt media { title { romaji } } }" +
      "  ... on FollowingNotification { id context createdAt user { name } }" +
      "  ... on ActivityLikeNotification { id context createdAt user { name } }" +
      "  ... on ActivityReplyNotification { id context createdAt user { name } }" +
      "  ... on ActivityMentionNotification { id context createdAt user { name } }" +
      "  ... on ActivityMessageNotification { id context createdAt user { name } }" +
      "  ... on ThreadCommentLikeNotification { id context createdAt user { name } }" +
      "  ... on RelatedMediaAdditionNotification { id context createdAt media { title { romaji } } } } } }";
  }
  function fetchProfileBundle(token, userId, cb) {
    gql(profileQuery(), { userId: userId }, token, function (err, data) {
      if (err) { cb(err); return; }
      if (!data || !data.Viewer) { cb({ kind: "gql", message: "No profile returned." }); return; }
      cb(null, data);
    });
  }

  /* ---------------- public batch enrichment ----------------
     For syncSource:"import" entries that never went through the
     authenticated pull — fills cover/genres/format/studio only, no token.

     ID SEMANTICS: XML imports carry MAL ids, synced/manual-linked entries
     carry AniList ids, so the id spec is {anilist:[...], mal:[...]} and MAL
     lookups go through idMal_in (verified live — id_in silently returns
     nothing for MAL-range ids above ~22k). Every record returns BOTH ids so
     the caller can backfill anilistId onto imported rows, which is what
     lets a later authenticated sync match them instead of duplicating.

     hooks = {onProgress(done,total,note)}; cb(err, records[]), record =
     {anilistId, malId, title, coverUrl, genres, total, extra}.            */
  function enrichQuery(idField, module) {
    return "query ($ids: [Int], $page: Int, $type: MediaType) {" +
      " Page(page: $page, perPage: 50) {" +
      "  pageInfo { hasNextPage }" +
      "  media(" + idField + ": $ids, type: $type) {" +
      "   id idMal title { romaji english } coverImage { extraLarge large }" +
      "   genres season seasonYear format episodes chapters volumes" +
      "   studios(isMain: true) { nodes { name } }" +
      (module === "anime" ? "" : " staff(perPage: 4) { edges { role node { name { full } } } }") +
      " } } }";
  }

  function enrich(idSpec, module, hooks, cb) {
    hooks = hooks || {};
    if (Array.isArray(idSpec)) idSpec = { anilist: idSpec };   // legacy shape
    var chunks = [];
    (idSpec.anilist || []).forEach(function (id, i) {
      if (i % 50 === 0) chunks.push({ field: "id_in", ids: [] });
      chunks[chunks.length - 1].ids.push(id);
    });
    (idSpec.mal || []).forEach(function (id, i) {
      if (i % 50 === 0) chunks.push({ field: "idMal_in", ids: [] });
      chunks[chunks.length - 1].ids.push(id);
    });
    var total = (idSpec.anilist || []).length + (idSpec.mal || []).length;
    var records = [], done = 0, ci = 0;

    function finish(err) { cb(err || null, records); }
    function nextChunk() {
      if (ci >= chunks.length) { finish(null); return; }
      runChunk(chunks[ci], 1, 0, function (err) {
        if (err) { finish(err); return; }
        done += chunks[ci].ids.length;
        ci++;
        if (hooks.onProgress) hooks.onProgress(Math.min(done, total), total, null);
        if (ci < chunks.length) setTimeout(nextChunk, REQUEST_GAP);
        else finish(null);
      });
    }
    function runChunk(chunk, page, attempt, next) {
      gql(enrichQuery(chunk.field, module), { ids: chunk.ids, page: page, type: mediaType(module) }, null, function (err, data) {
        if (err && err.kind === "ratelimit" && attempt < MAX_RETRIES) {
          var wait = (err.retryAfter + 1) * 1000;
          if (hooks.onProgress) hooks.onProgress(done, total,
            "Rate limited by AniList — resuming in " + err.retryAfter + " s…");
          setTimeout(function () { runChunk(chunk, page, attempt + 1, next); }, wait);
          return;
        }
        if (err) { next(err); return; }
        var pg = data && data.Page;
        (pg && pg.media || []).forEach(function (m) {
          var rec = {
            anilistId: m.id || null,
            malId: m.idMal || null,
            title: (m.title && (m.title.romaji || m.title.english)) || null,
            coverUrl: (m.coverImage && (m.coverImage.extraLarge || m.coverImage.large)) || null,
            genres: m.genres || [],
            total: module === "anime" ? (m.episodes || null) : (m.chapters || null),
            extra: {
              format: m.format || null, season: m.season || null,
              seasonYear: m.seasonYear || null,
              studio: (m.studios && m.studios.nodes && m.studios.nodes[0] && m.studios.nodes[0].name) || null,
              titleEnglish: (m.title && m.title.english) || null,
              volumes: m.volumes || null
            }
          };
          if (module !== "anime") {
            rec.author = pickAuthor(m.staff);
            rec.format = bookFormat(m.format);
            rec.totalVolumes = m.volumes || null;
          }
          records.push(rec);
        });
        if (pg && pg.pageInfo && pg.pageInfo.hasNextPage) {
          setTimeout(function () { runChunk(chunk, page + 1, 0, next); }, REQUEST_GAP);
        } else {
          next(null);
        }
      });
    }
    if (chunks.length) nextChunk(); else finish(null);
  }

  KOS.anilist = {
    fetchBanner: fetchBanner,
    ENDPOINT: ENDPOINT,
    PIN_URL: PIN_URL,
    gql: gql,
    authorizeUrl: authorizeUrl,
    getConnection: getConnection,
    setClientId: setClientId,
    setToken: setToken,
    disconnect: disconnect,
    fetchViewer: fetchViewer,
    mapListEntry: mapListEntry,
    fuzzyToISO: fuzzyToISO,
    STATUS_MAP: STATUS_MAP,
    STATUS_TO_AL: STATUS_TO_AL,
    saveListEntry: saveListEntry,
    searchMedia: searchMedia,
    fetchAiring: fetchAiring,
    fetchProfileBundle: fetchProfileBundle,
    bookFormat: bookFormat,
    pickAuthor: pickAuthor,
    syncList: syncList,
    enrich: enrich
  };
})();
