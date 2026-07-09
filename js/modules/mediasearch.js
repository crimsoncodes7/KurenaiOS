/* Kurenai OS — modules/mediasearch.js
   Search-and-add (Build 3d): find something NEW in the external database
   — deliberately a different surface from the vault filter search, which
   only looks through what you already track. One shared modal, configured
   per module: Anime/Books query AniList's Media search, VN queries VNDB's
   /vn search filter (both query shapes verified live 2026-07-03).

   The add flow is create-then-mirror, NOT the debounced push mechanism:
   picking a status is one deliberate act, so it calls the write API once,
   and only a CONFIRMED remote create produces a local entry with
   syncSource set and lastSyncedAt = now. When the remote create can't
   happen (no connection, or VNDB's CORS wall blocking browser writes),
   the entry is still added LOCALLY with syncSource "manual" — the
   external id is kept, so a later pull sync matches it instead of
   duplicating — and the toast says exactly which of the two happened.

   Governor: a successful add logs through KOS.media.logActivity("added")
   like every other entry creation — same trickle, same rest streak,
   HP untouched.                                                          */
(function () {
  "use strict";
  var el = KOS.ui.el;

  var SEARCH_DEBOUNCE = 220;   // the vault views' search-input interval

  /* per-module wording for the status picker (shared status ids) */
  var STATUS_WORDS = {
    anime: { planned: "Plan to watch", inProgress: "Watching", onHold: "On hold", completed: "Completed", dropped: "Dropped" },
    books: { planned: "Plan to read", inProgress: "Reading", onHold: "On hold", completed: "Completed", dropped: "Dropped" },
    vn: { planned: "Wishlist", inProgress: "Playing", onHold: "Stalled", completed: "Finished", dropped: "Dropped" }
  };
  var STATUS_ORDER = ["planned", "inProgress", "completed", "onHold", "dropped"];

  /* ---------------- result → local entry mapping ---------------- */
  function localFromAniList(r, module, status) {
    var entry = {
      module: module, title: r.title, status: status,
      progress: { current: 0, total: r.total },
      score: 0, genres: r.genres || [],
      externalIds: { anilistId: r.anilistId, malId: r.malId },
      coverUrl: r.coverUrl,
      extra: { format: r.format, seasonYear: r.year, titleEnglish: r.titleEnglish, volumes: r.volumes }
    };
    if (module === "books") {
      entry.progress.totalVolumes = r.volumes || null;
      entry.format = KOS.anilist.bookFormat(r.format);
    }
    return entry;
  }
  function localFromVndb(r, status) {
    return {
      module: "vn", title: r.title, status: status,
      progress: { current: 0, total: null },
      score: 0, genres: r.genres || [],
      externalIds: { vndbId: r.vndbId },
      coverUrl: r.coverUrl, developer: r.developer || "",
      extra: r.extra || {}
    };
  }

  /* ---------------- the remote create (one deliberate act) ---------------- */
  /* cb(remoteOk, failureNote) — the entry is added locally either way. */
  function remoteCreate(module, result, status, cb) {
    if (module === "vn") {
      KOS.vndb.getConnection(function (err, conn) {
        if (err || !conn.token) { cb(false, "VNDB isn't connected — added locally only."); return; }
        KOS.vndb.setUlist(conn.token, result.vndbId, { status: status }, function (err2) {
          if (err2) { cb(false, err2.message); return; }
          cb(true, null);
        });
      });
    } else {
      KOS.anilist.getConnection(function (err, conn) {
        if (err || !conn.token) { cb(false, "AniList isn't connected — added locally only."); return; }
        KOS.anilist.saveListEntry(conn.token, { mediaId: result.anilistId, status: status }, function (err2) {
          if (err2) { cb(false, err2.message); return; }
          cb(true, null);
        });
      });
    }
  }

  /* ---------------- the add flow ---------------- */
  function addResult(module, result, status, statusNote, onAdded) {
    var idIndex = module === "vn" ? "vndb" : "anilist";
    var idValue = module === "vn" ? result.vndbId : result.anilistId;
    KOS.mediadb.getByExternal(idIndex, idValue, function (e0, existing) {
      if (existing) {
        KOS.ui.toast("“" + existing.title + "” is already in your vault (" + KOS.media.STATUS_LABEL[existing.status] + ").");
        return;
      }
      statusNote.textContent = "Creating on " + (module === "vn" ? "VNDB" : "AniList") + "…";
      remoteCreate(module, result, status, function (remoteOk, failNote) {
        var entry = module === "vn" ? localFromVndb(result, status) : localFromAniList(result, module, status);
        if (remoteOk) {
          entry.syncSource = module === "vn" ? "vndb" : "anilist";
          entry.lastSyncedAt = Date.now();
        } else {
          entry.syncSource = "manual";   // the kept external id lets a later pull sync claim it
        }
        KOS.mediadb.add(entry, function (err, rec) {
          if (err) { statusNote.textContent = "Local save failed: " + err.message; return; }
          KOS.media.logActivity(rec, "added");
          statusNote.textContent = "";
          KOS.ui.toast(remoteOk
            ? "“" + rec.title + "” added — created on " + (module === "vn" ? "VNDB" : "AniList") + " and mirrored here."
            : "“" + rec.title + "” added locally. " + (failNote || ""), !remoteOk);
          onAdded && onAdded(rec);
        });
      });
    });
  }

  /* ---------------- the modal ---------------- */
  function open(module, onAdded) {
    var mod = KOS.media.module(module);
    var serviceName = module === "vn" ? "VNDB" : "AniList";

    var overlay = el("div", { class: "modal-ov", onclick: function (ev) { if (ev.target === overlay) close(); } });
    function close() { overlay.remove(); }

    var input = el("input", { type: "search", class: "todo-in msch-in",
      placeholder: "Search all of " + serviceName + "…",
      "aria-label": "Search " + serviceName });
    var statusNote = el("p", { class: "sub msch-note" });
    var results = el("div", { class: "msch-results" });

    function render(list) {
      results.innerHTML = "";
      if (!list.length) {
        results.appendChild(el("p", { class: "fc-empty", text: input.value.trim()
          ? "No matches on " + serviceName + "." : "" }));
        return;
      }
      list.forEach(function (r) {
        var pickerHolder = el("div", { class: "msch-picker" });
        var addBtn = el("button", { class: "btn primary msch-add", text: "+ Add", onclick: function () {
          if (pickerHolder.childNodes.length) { pickerHolder.innerHTML = ""; return; }
          STATUS_ORDER.forEach(function (s) {
            pickerHolder.appendChild(el("button", { class: "btn msch-status",
              style: "--chip:" + KOS.media.STATUS_COLOR[s],
              text: STATUS_WORDS[module][s],
              onclick: function () {
                pickerHolder.innerHTML = "";
                addResult(module, r, s, statusNote, function (rec) {
                  row.classList.add("msch-added");
                  addBtn.textContent = "✓ In vault";
                  addBtn.disabled = true;
                  onAdded && onAdded(rec);
                });
              } }));
          });
        } });
        var metaBits = [];
        if (r.format) metaBits.push(r.format);
        if (r.year) metaBits.push(String(r.year));
        if (r.released) metaBits.push(r.released.slice(0, 4));
        if (r.total) metaBits.push(r.total + " " + mod.unit + (r.total === 1 ? "" : "s"));
        if (r.developer) metaBits.push(r.developer);
        var row = el("div", { class: "msch-row" }, [
          r.coverUrl
            ? el("img", { class: "msch-cover", src: r.coverUrl, alt: "", loading: "lazy" })
            : el("span", { class: "msch-cover med-cover-ph", "aria-hidden": "true", text: mod.kanji }),
          el("div", { class: "msch-body" }, [
            el("div", { class: "msch-title", text: r.title }),
            el("div", { class: "sub", text: metaBits.join(" · ") })
          ]),
          el("div", { class: "msch-act" }, [addBtn, pickerHolder])
        ]);
        results.appendChild(row);
      });
    }

    var seq = 0;
    function runSearch() {
      var term = input.value.trim();
      if (term.length < 2) { render([]); return; }
      var mySeq = ++seq;
      statusNote.textContent = "Searching " + serviceName + "…";
      function handle(err, list) {
        if (mySeq !== seq) return;   // a newer keystroke superseded this one
        statusNote.textContent = err ? err.message : "";
        render(err ? [] : list);
      }
      if (module === "vn") KOS.vndb.searchVN(term, handle);
      else KOS.anilist.searchMedia(term, module, handle);
    }
    input.addEventListener("input", KOS.ui.debounce(runSearch, SEARCH_DEBOUNCE));

    var box = el("div", { class: "modal med-modal msch-modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", {}, [el("span", { class: "kanji-inline", text: mod.kanji }), " Find new — " + serviceName]),
        el("span", { class: "sub", text: "searches the whole " + serviceName + " database, not your vault — picking a status creates the entry " +
          (module === "vn" ? "on VNDB (browser writes are currently blocked by VNDB's CORS policy — it will fall back to a local add)" : "on your AniList") + " and mirrors it here" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", "aria-label": "Close", onclick: close })
      ]),
      input,
      statusNote,
      results
    ]);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    input.focus();
  }

  KOS.mediaSearch = { open: open, STATUS_WORDS: STATUS_WORDS };
})();
