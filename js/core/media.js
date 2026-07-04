/* Kurenai OS — core/media.js
   Collection Matrix domain layer (Build 3a): the module registry, the
   MAL-format XML import (fallback path), activity logging and the rest
   streak.

   Governor contract for this whole module:
   - logging consumption feeds a small XP/gold trickle via the normal
     sessions pipeline (type "media");
   - HP is NEVER touched in either direction — media sessions are excluded
     from the HP day-drain's activity check and award 0 HP;
   - media activity keeps its own "rest streak", fully independent of the
     study streak (sessions.js owns both derivations).
   Bulk sync/import NEVER logs sessions — only deliberate user actions do,
   otherwise importing 650 shows would flood the log and mint gold.        */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  /* ---------------- module registry ----------------
     Anime (3a), Books (3b — manga, light novels, one-shots in one module),
     Visual Novels (3c — VNDB-synced metadata + manual routes/CG/quotes) and
     Games (3e — manual-entry by design: Steam's data API blocks browser
     CORS, and Steam OpenID sign-in was tested live and abandoned; the bulk
     paste-in tool is the quick-start path instead). All four are real. */
  var MODULES = [
    { id: "anime", label: "Anime", kanji: "映", unit: "ep",
      unitName: "episodes", real: true, accent: "#ef4965",
      desc: "Watching, planned, completed — synced from AniList or tracked by hand." },
    { id: "books", label: "Books", kanji: "本", unit: "ch",
      unitName: "chapters", real: true, accent: "#ecc15a",
      desc: "Manga & light novels — digital tracking and the physical vault on one entry: what you read via AniList, what you own volume by volume." },
    { id: "vn", label: "Visual Novels", kanji: "選", unit: "route",
      unitName: "routes", real: true, accent: "#c77bf2",
      desc: "VNDB-synced metadata; routes, CG counter, content warnings and the quote log are yours to build." },
    { id: "game", label: "Games", kanji: "遊", unit: "hr",
      unitName: "hours", real: true, accent: "#66c0f4",
      desc: "Manual-first, permanently: completion tiers, platforms, playtime, backlog priority — pasted in bulk or added one by one; no API exists that a browser may use." }
  ];
  function module_(id) {
    if (id === "manga" || id === "ln") id = "books";   // pre-v3 rows
    return MODULES.find(function (m) { return m.id === id; }) || MODULES[0];
  }
  var FORMAT_LABEL = { manga: "Manga", lightNovel: "Light Novel", oneShot: "One-shot" };
  var CONDITION_LABEL = { mint: "Mint", good: "Good", worn: "Worn", damaged: "Damaged" };
  var CONDITION_COLOR = { mint: "#45d6a8", good: "#7b9ef8", worn: "#ecc15a", damaged: "#ef4965" };
  var STATUS_LABEL = {
    planned: "Planned", inProgress: "In progress", onHold: "On hold",
    completed: "Completed", dropped: "Dropped"
  };
  var STATUS_COLOR = {
    planned: "#7b9ef8", inProgress: "#45d6a8", onHold: "#ecc15a",
    completed: "#c77bf2", dropped: "#6f6488"
  };
  /* Build 3e — Games label maps (enums live in mediadb) */
  var TIER_LABEL = {
    notStarted: "Not started", storyComplete: "Story complete",
    fullCompletion: "Full completion", platinum: "Platinum / 100%",
    abandoned: "Abandoned"
  };
  var TIER_COLOR = {
    notStarted: "#6f6488", storyComplete: "#45d6a8",
    fullCompletion: "#7b9ef8", platinum: "#ecc15a", abandoned: "#ef4965"
  };
  var PLATFORM_LABEL = {
    pc: "PC", playstation: "PlayStation", xbox: "Xbox", switch: "Switch", other: "Other"
  };
  var PRIORITY_LABEL = { low: "Low", medium: "Medium", high: "High" };
  var PRIORITY_COLOR = { low: "#6f6488", medium: "#ecc15a", high: "#ef4965" };

  /* ---------------- XML import (fallback path) ----------------
     AniList's MAL-compatible export. Structure confirmed from a real file:
     <myanimelist><anime>…</anime></myanimelist> (or <manga> — same pattern
     with chapter/volume fields).

     ID SEMANTICS (verified live, 2026-07-02): series_animedb_id is the MAL
     id. It merely LOOKS like an AniList id on old titles because the two
     sites share ids below ~22000 (e.g. CLANNAD AS = 4181 on both); modern
     entries diverge completely ([Oshi no Ko] = MAL 52034 / AniList 150672),
     and the export's own comments show entries with no MAL mapping are
     skipped. So imports store malId; enrichment queries idMal_in and
     backfills the AniList id from the response, which is what lets a later
     authenticated sync match these rows instead of duplicating them.
     Gives skeleton data only — no cover, no genres; enrichment fills those. */
  var XML_STATUS = {
    "watching": "inProgress", "reading": "inProgress",
    "completed": "completed",
    "on-hold": "onHold", "onhold": "onHold",
    "dropped": "dropped",
    "plan to watch": "planned", "plan to read": "planned", "planning": "planned"
  };
  function xmlDate(s) {
    /* 0000-00-00 is the export's unset-date sentinel */
    if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s) || s === "0000-00-00") return null;
    return s;
  }
  function textOf(node, tag) {
    var n = node.getElementsByTagName(tag)[0];
    return n ? (n.textContent || "").trim() : "";   // textContent unwraps CDATA
  }
  function parseXML(text) {
    var doc = new DOMParser().parseFromString(text, "text/xml");
    if (doc.getElementsByTagName("parsererror").length) {
      return { error: "That file isn't readable XML — export it again from AniList (Settings → Apps → Export)." };
    }
    var root = doc.getElementsByTagName("myanimelist")[0];
    if (!root) return { error: "No <myanimelist> root — this doesn't look like an AniList/MAL export." };

    /* <manga> tags land in the Books module (3b). Their field pattern
       (series_mangadb_id / series_chapters / my_read_chapters + the volume
       twins) follows the MAL export format by analogy with the verified
       anime shape — it has NOT yet been checked against a real AniList
       manga export file; the volume/series_type reads are defensive so an
       absent tag costs nothing. The MAL-id semantics ARE applied from the
       start (same discovery as anime — see the block comment above). */
    var kinds = [["anime", "anime"], ["manga", "books"]];
    var entries = [], module = null;
    kinds.forEach(function (k) {
      var nodes = root.getElementsByTagName(k[0]);
      if (!nodes.length) return;
      module = module || k[1];
      Array.prototype.forEach.call(nodes, function (n) {
        var isAnime = k[1] === "anime";
        var id = parseInt(textOf(n, isAnime ? "series_animedb_id" : "series_mangadb_id"), 10);
        var total = parseInt(textOf(n, isAnime ? "series_episodes" : "series_chapters"), 10);
        var cur = parseInt(textOf(n, isAnime ? "my_watched_episodes" : "my_read_chapters"), 10);
        var score = parseFloat(textOf(n, "my_score"));
        var status = XML_STATUS[textOf(n, "my_status").toLowerCase()] || "planned";
        var entry = {
          module: k[1],
          title: textOf(n, "series_title") || "Untitled",
          status: status,
          progress: { current: isNaN(cur) ? 0 : cur, total: !total ? null : total },
          score: isNaN(score) ? 0 : score,
          dates: { started: xmlDate(textOf(n, "my_start_date")),
                   finished: xmlDate(textOf(n, "my_finish_date")) },
          externalIds: { malId: isNaN(id) ? null : id },
          notes: textOf(n, "my_comments"),
          syncSource: "import",
          lastSyncedAt: null
        };
        if (!isAnime) {
          var volsRead = parseInt(textOf(n, "my_read_volumes"), 10);
          var volsTotal = parseInt(textOf(n, "series_volumes"), 10);
          entry.progress.volumes = isNaN(volsRead) ? null : volsRead;
          entry.progress.totalVolumes = !volsTotal ? null : volsTotal;
          var st = textOf(n, "series_type").toLowerCase();
          entry.format = /light.?novel|novel/.test(st) ? "lightNovel"
            : /one.?shot/.test(st) ? "oneShot" : "manga";
        }
        entries.push(entry);
      });
    });
    if (!entries.length) return { error: "The file parsed but held no <anime>/<manga> entries." };
    return { module: module, entries: entries, userName: textOf(root, "user_name") || null };
  }

  /* ---------------- activity logging (governor trickle) ----------------
     One session entry per deliberate act of tracking: +1 episode, a status
     change, a manual add, a score. subject/ref stay null — this is rest,
     not study, and the RAG/streak/HP machinery must never see it as study. */
  function logActivity(entry, action) {
    return KOS.sessions.log({
      type: "media",
      subject: null, ref: null, dur: null,
      metrics: {
        module: entry.module, entryId: entry.id || null,
        title: entry.title, action: action
      }
    });
  }

  /* Reward-on-sync (Build 3j): a pull that discovered progress made
     elsewhere (mal-sync bumping AniList, edits on the sites) logs exactly
     ONE session per sync, proportional to what was discovered — the same
     one-deliberate-act shape as the games bulk paste-in, so a sync can
     never flood the log. bulkUpsert supplies the events (already filtered
     through the per-entry watermark); this just turns them into the
     session the governor prices. Returns the session or null. */
  function logSyncRewards(module, events) {
    if (!events || !events.length) return null;
    var units = events.reduce(function (a, ev) { return a + (ev.units || 0); }, 0);
    var advances = events.filter(function (ev) { return ev.statusAdvanced; }).length;
    return KOS.sessions.log({
      type: "media", subject: null, ref: null, dur: null,
      metrics: {
        module: module, action: "sync-reward",
        entries: events.length, units: units, advances: advances,
        titles: events.slice(0, 5).map(function (ev) { return ev.title; })
      }
    });
  }

  /* ---------------- inline quick-edit (Build 3d) ----------------
     status + score editable straight on a vault card — the low-friction
     editing that makes automatic push worth having. One implementation,
     used by all three module views. Status changes log a session
     ("status", same as the editors); score-only changes just save+push
     (the editors don't log those either). */
  function quickEdit(e, rerender) {
    var el = KOS.ui.el;
    var before = KOS.mediapush.snapshot(e);
    function saved(action) {
      KOS.mediadb.put(e, function (err, rec) {
        if (err) { KOS.ui.toast("Save failed: " + err.message, true); return; }
        if (action) logActivity(rec, action);
        if (KOS.mediapush.snapshot(rec) !== before) KOS.mediapush.schedule(rec);
        rerender && rerender(rec);
      });
    }
    var sel = el("select", { class: "status-sel med-qsel", "aria-label": "Status",
      title: "Change status — " + (e.module === "game"
        ? "saved locally (games have no live sync)"
        : "pushes to " + (e.module === "vn" ? "VNDB" : "AniList") + " when this entry is synced") },
      Object.keys(STATUS_LABEL).map(function (s) {
        return el("option", { value: s, text: STATUS_LABEL[s] });
      }));
    sel.value = e.status;
    sel.addEventListener("click", function (ev) { ev.stopPropagation(); });
    sel.addEventListener("change", function (ev) {
      ev.stopPropagation();
      e.status = sel.value;
      var today = KOS.srs.todayISO();
      if (e.status === "inProgress" && !e.dates.started) e.dates.started = today;
      if (e.status === "completed" && !e.dates.finished) e.dates.finished = today;
      saved("status");
    });
    var score = el("input", { type: "number", class: "todo-in med-qscore", min: "0", max: "10",
      step: "0.5", value: e.score ? String(e.score) : "", placeholder: "★",
      "aria-label": "Score out of 10" });
    score.addEventListener("click", function (ev) { ev.stopPropagation(); });
    score.addEventListener("keydown", function (ev) { ev.stopPropagation(); });
    score.addEventListener("change", function (ev) {
      ev.stopPropagation();
      e.score = Math.max(0, Math.min(10, parseFloat(score.value) || 0));
      saved(null);
    });
    return el("span", { class: "med-quick" }, [sel, score]);
  }

  /* ---------------- vault dedup (Build 3h) ----------------
     One-time repair for the VNDB duplication bug (synced rows landed with
     vndbId null, so every re-sync inserted the list fresh), kept around
     because it is safe to re-run: it only ever merges rows that are
     unambiguously the same thing.

     Clustering, per module: rows sharing the module's primary external id
     merge; a row with NO id joins a cluster only when exactly ONE
     id-bearing cluster shares its title (case-insensitive) — with zero it
     merges with same-title id-less rows, with several it is left alone.
     Merging keeps the UNION of the manual layer across all copies
     (routes by name, quotes by text, CG counter maxima, warnings/tags/
     genres/mood/shelves, notes concatenated, favourite, physical,
     external ids) and takes list state from the most recently synced/
     edited copy. cb(err, {merged, removed, titles}).                     */
  function dedupKey(e) {
    var x = e.externalIds || {};
    if (e.module === "vn") return x.vndbId != null ? "v:" + x.vndbId : null;
    if (e.module === "game") return x.steamAppId != null ? "s:" + x.steamAppId : null;
    return x.anilistId != null ? "a:" + x.anilistId
      : x.malId != null ? "m:" + x.malId : null;
  }
  function mergeCluster(rows) {
    rows = rows.slice().sort(function (a, b) { return (a.createdAt || 0) - (b.createdAt || 0); });
    var keeper = rows.find(function (e) { return dedupKey(e) != null; }) || rows[0];
    var freshest = rows.slice().sort(function (a, b) {
      return (b.lastSyncedAt || b.updatedAt || 0) - (a.lastSyncedAt || a.updatedAt || 0);
    })[0];
    var out = JSON.parse(JSON.stringify(keeper));
    rows.forEach(function (r) {
      if (r === keeper) return;
      Object.keys(r.externalIds || {}).forEach(function (k) {
        if (out.externalIds[k] == null && r.externalIds[k] != null) out.externalIds[k] = r.externalIds[k];
      });
      (r.routes || []).forEach(function (rt) {
        var hit = (out.routes || []).find(function (x) { return x.name.toLowerCase() === rt.name.toLowerCase(); });
        if (!hit) out.routes.push(rt);
        else if (rt.cleared && !hit.cleared) { hit.cleared = true; hit.completedAt = rt.completedAt || null; }
      });
      (r.chapters || []).forEach(function (ch) {
        var hitC = (out.chapters || []).find(function (x) { return x.name.toLowerCase() === ch.name.toLowerCase(); });
        if (!hitC) out.chapters.push(ch);
        else if ((KOS.mediadb.STATUS_RANK[ch.status] || 0) > (KOS.mediadb.STATUS_RANK[hitC.status] || 0)) hitC.status = ch.status;
      });
      (r.quotes || []).forEach(function (q) {
        if (!(out.quotes || []).some(function (x) { return x.text === q.text; })) out.quotes.push(q);
      });
      ["contentWarnings", "tags", "genres", "mood", "shelves"].forEach(function (k) {
        (r[k] || []).forEach(function (v) { if (out[k].indexOf(v) === -1) out[k].push(v); });
      });
      if (r.cgGallery) {
        if (r.cgGallery.totalKnown != null &&
            (out.cgGallery.totalKnown == null || r.cgGallery.totalKnown > out.cgGallery.totalKnown)) {
          out.cgGallery.totalKnown = r.cgGallery.totalKnown;
        }
        if ((r.cgGallery.unlockedCount || 0) > (out.cgGallery.unlockedCount || 0)) {
          out.cgGallery.unlockedCount = r.cgGallery.unlockedCount;
        }
      }
      if (r.notes && String(r.notes).trim() && out.notes.indexOf(r.notes) === -1) {
        out.notes = out.notes ? out.notes + "\n\n" + r.notes : r.notes;
      }
      out.favourite = out.favourite || !!r.favourite;
      if (!out.physical && r.physical) out.physical = r.physical;
      else if (out.physical && r.physical &&
               (r.physical.volumes || []).length > (out.physical.volumes || []).length) out.physical = r.physical;
      if (r.dnf && r.dnf.isDnf && !(out.dnf && out.dnf.isDnf)) out.dnf = r.dnf;
      ["developer", "author", "publisher"].forEach(function (k) { if (!out[k] && r[k]) out[k] = r[k]; });
      if (!out.coverUrl && r.coverUrl) out.coverUrl = r.coverUrl;
      Object.keys(r.extra || {}).forEach(function (k) {
        if (out.extra[k] == null && r.extra[k] != null) out.extra[k] = r.extra[k];
      });
      out.createdAt = Math.min(out.createdAt || Date.now(), r.createdAt || Date.now());
    });
    /* list state follows the freshest copy; an unrated freshest never
       erases a rating another copy holds (same rule as the push payload) */
    out.status = freshest.status;
    out.score = freshest.score || Math.max.apply(null, rows.map(function (r) { return r.score || 0; }));
    out.dates = freshest.dates;
    out.syncSource = freshest.syncSource;
    out.lastSyncedAt = freshest.lastSyncedAt;
    out.progress = freshest.progress;   // vn/game re-derive in normalise anyway
    return out;
  }
  function dedupeVault(module, cb) {
    KOS.mediadb.query({ module: module }, function (err, all) {
      if (err) { cb(err); return; }
      var clusters = [], byId = {}, byTitleNull = {}, titleClusters = {};
      all.forEach(function (e) {
        var key = dedupKey(e);
        if (key == null) return;   // id-less rows placed in the 2nd pass
        if (byId[key] != null) { clusters[byId[key]].push(e); return; }
        byId[key] = clusters.length;
        (titleClusters[e.titleLower] = titleClusters[e.titleLower] || []).push(clusters.length);
        clusters.push([e]);
      });
      all.forEach(function (e) {
        if (dedupKey(e) != null) return;
        var hits = titleClusters[e.titleLower] || [];
        if (hits.length === 1) { clusters[hits[0]].push(e); return; }
        if (hits.length > 1) return;   // ambiguous — leave the row alone
        if (byTitleNull[e.titleLower] != null) { clusters[byTitleNull[e.titleLower]].push(e); return; }
        byTitleNull[e.titleLower] = clusters.length;
        clusters.push([e]);
      });
      var dupes = clusters.filter(function (c) { return c.length > 1; });
      var report = { merged: dupes.length, removed: 0, titles: [] };
      var ci = 0;
      (function next(err2) {
        if (err2) { cb(err2, report); return; }
        if (ci >= dupes.length) { cb(null, report); return; }
        var rows = dupes[ci++];
        var merged = mergeCluster(rows);
        report.titles.push(merged.title + " (×" + rows.length + ")");
        KOS.mediadb.put(merged, function (err3) {
          if (err3) { next(err3); return; }
          var losers = rows.filter(function (r) { return r.id !== merged.id; });
          var li = 0;
          (function del(err4) {
            if (err4) { next(err4); return; }
            if (li >= losers.length) { next(null); return; }
            report.removed++;
            KOS.mediadb.remove(losers[li++].id, del);
          })(null);
        });
      })(null);
    });
  }

  /* entry ids referenced by personal flashcards (quote→card, 3c) — the
     replace-mode wipe must never delete an entry a card points back to */
  function protectedCardIds(module) {
    var out = [];
    ((KOS.store.state.custom || {}).cards || []).forEach(function (c) {
      if (c.src && c.src.module === module && c.src.entryId != null) out.push(c.src.entryId);
    });
    return out;
  }

  /* the pending/failed push indicator + manual retry, per card */
  function pushChip(e, rerender) {
    var el = KOS.ui.el;
    if (e.push && e.push.state === "failed") {
      return el("button", { class: "med-chip med-push-fail", text: "⚠ sync",
        title: (e.push.error || "Push failed.") + " — click to retry",
        "aria-label": "Sync failed — retry", onclick: function (ev) {
          ev.stopPropagation();
          KOS.ui.toast("Retrying the push…");
          KOS.mediapush.flush(e.id);
          setTimeout(function () { rerender && rerender(); }, 400);
        } });
    }
    if (KOS.mediapush.isPending(e.id)) {
      return el("span", { class: "med-chip med-push-pending", title: "Syncing to " +
        (e.module === "vn" ? "VNDB" : "AniList") + "…", text: "⇅" });
    }
    return null;
  }

  KOS.media = {
    MODULES: MODULES,
    module: module_,
    quickEdit: quickEdit,
    pushChip: pushChip,
    STATUS_LABEL: STATUS_LABEL,
    STATUS_COLOR: STATUS_COLOR,
    TIER_LABEL: TIER_LABEL,
    TIER_COLOR: TIER_COLOR,
    PLATFORM_LABEL: PLATFORM_LABEL,
    PRIORITY_LABEL: PRIORITY_LABEL,
    PRIORITY_COLOR: PRIORITY_COLOR,
    FORMAT_LABEL: FORMAT_LABEL,
    CONDITION_LABEL: CONDITION_LABEL,
    CONDITION_COLOR: CONDITION_COLOR,
    parseXML: parseXML,
    logActivity: logActivity,
    logSyncRewards: logSyncRewards,
    dedupeVault: dedupeVault,
    protectedCardIds: protectedCardIds
  };
})();
