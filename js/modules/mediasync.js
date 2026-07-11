/* Kurenai OS — modules/mediasync.js
   Sync & Import (Build 3a + 3c): the AniList connection (OAuth PIN flow),
   the VNDB connection (personal token — Build 3c), the MAL-format XML
   import (fallback), and public enrichment for imported/linked entries.

   Everything here is read-only against BOTH services — no mutation is
   ever sent. Tokens live in the media DB's kv store, never in
   localStorage (they must not ride along in the backup JSON export).      */
(function () {
  "use strict";
  var el = KOS.ui.el;

  function panel(title, kanji, children) {
    return el("div", { class: "colcard med-panel" }, [
      el("h3", {}, [el("span", { class: "kanji-inline", text: kanji }), " " + title])
    ].concat(children));
  }

  /* ---------------- import mode (Build 3h) ----------------
     An explicit choice shown before every sync/import: update-and-add
     (the default — match by external id, update, add what's new, touch
     nothing else) vs replace-from-source (remove this source's entries
     the import no longer carries — except any entry holding your own
     data: physical volumes, routes, quotes, CG counts, warnings, notes,
     moods, shelves, tags, favourites, or a personal flashcard pointing
     at it. Those are kept and just updated). */
  var pickerSeq = 0;
  function modePicker() {
    var name = "med-impmode-" + (++pickerSeq);
    function radio(value, label, hint, checked) {
      var r = el("input", { type: "radio", name: name, value: value });
      r.checked = !!checked;
      return el("label", { class: "med-impmode-opt", title: hint }, [r, " " + label]);
    }
    var root = el("div", { class: "med-impmode" }, [
      el("span", { class: "sub", text: "Import mode:" }),
      radio("update", "Update & add", "Match existing entries by their external id, update them, add anything new — nothing else is touched.", true),
      radio("replace", "Replace everything from this source", "Entries from this source that the import no longer carries are removed — unless they hold data you added yourself (routes, quotes, physical volumes, notes, …); those are kept and updated instead.")
    ]);
    return {
      root: root,
      value: function () {
        var hit = root.querySelector("input:checked");
        return hit ? hit.value : "update";
      }
    };
  }
  function replaceOpts(mode, module, source) {
    if (mode !== "replace") return {};
    return { replace: { module: module, source: source, protect: KOS.media.protectedCardIds(module) } };
  }
  function confirmReplace(mode, sourceName) {
    if (mode !== "replace") return true;
    return window.confirm("Replace mode: entries previously synced/imported from " + sourceName +
      " that this import no longer carries will be REMOVED (anything holding your own data — routes, quotes, physical volumes, notes… — is kept and just updated). Continue?");
  }
  function doneWording(res) {
    var bits = [res.added + " added", res.updated + " updated"];
    if (res.removed) bits.push(res.removed + " removed");
    if (res.kept) bits.push(res.kept + " kept because they have your own data attached");
    return bits.join(", ");
  }

  KOS.views.mediasync = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "The bridge" }),
        el("h1", { text: "Sync & Import" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "Connect AniList and VNDB, or import an XML export. Local edits push back on their own; pushes are last-write-wins." })
        ])
      ])
    ]));

    if (KOS.medview.unavailable(main)) return;

    /* ================= 1 · AniList connection (primary) ================= */
    var connBody = el("div", {});
    main.appendChild(panel("AniList — live connection", "接", [
      el("p", { class: "sub", text: "One-time setup: register an API client at anilist.co/settings/developer, set its Redirect URL to EXACTLY " + KOS.anilist.PIN_URL + ", and paste the Client ID below (no secret is needed). Tokens last 1 year; when one expires you just reconnect the same way." }),
      connBody
    ]));

    function renderConn() {
      connBody.innerHTML = "";
      KOS.anilist.getConnection(function (err, conn) {
        if (err) { connBody.appendChild(el("p", { class: "sub", text: "Could not read the connection store: " + err.message })); return; }

        var idIn = el("input", { type: "text", class: "todo-in", placeholder: "AniList Client ID (a short number)", value: conn.clientId || "" });
        var connectBtn = el("button", { class: "btn primary", text: "1 · Connect AniList ↗", onclick: function () {
          var id = idIn.value.trim();
          if (!id) { KOS.ui.toast("Paste your Client ID first — from anilist.co/settings/developer.", true); return; }
          KOS.anilist.setClientId(id, function () {
            window.open(KOS.anilist.authorizeUrl(id), "_blank");
            KOS.ui.toast("Approve on AniList, then copy the token it shows into the field below.");
          });
        } });
        idIn.addEventListener("change", function () { KOS.anilist.setClientId(idIn.value, function () {}); });

        var tokIn = el("input", { type: "password", class: "todo-in", placeholder: "2 · Paste the access token AniList showed you" });
        var verifyBtn = el("button", { class: "btn", text: "Save & verify", onclick: function () {
          var tok = tokIn.value.trim();
          if (!tok) { KOS.ui.toast("Paste the token first.", true); return; }
          verifyBtn.disabled = true;
          verifyBtn.textContent = "Checking…";
          KOS.anilist.setToken(tok, function () {
            KOS.anilist.fetchViewer(tok, function (err2, viewer) {
              verifyBtn.disabled = false;
              verifyBtn.textContent = "Save & verify";
              if (err2) { KOS.ui.toast(err2.message, true); return; }
              KOS.ui.toast("Connected as " + viewer.name + ".");
              renderConn();
            });
          });
        } });

        if (conn.token && conn.viewer) {
          connBody.appendChild(el("div", { class: "med-conn-ok" }, [
            el("span", { class: "med-chip", style: "--chip:#45d6a8", text: "Connected" }),
            el("b", { text: conn.viewer.name }),
            el("span", { class: "sub", text: " · AniList user #" + conn.viewer.id + " · read-only by design" })
          ]));
          var syncStatus = el("p", { class: "sub med-sync-status" });
          var aniMode = modePicker();
          /* one button per media type — same query pattern, type: ANIME vs
             MANGA; manga rows land in the Books module with author/format/
             volume data mapped from the richer MANGA response */
          function syncButton(label, module, noun) {
            var btn = el("button", { class: "btn primary", text: "⇅ Sync now — " + label, onclick: function () {
              var mode = aniMode.value();
              if (!confirmReplace(mode, "AniList (" + noun + ")")) return;
              btn.disabled = true;
              syncStatus.textContent = "Pulling your " + noun + " list (one call — status, progress, scores, covers, genres)…";
              KOS.anilist.syncList(conn.token, conn.viewer.id, module, function (err3, mapped) {
                if (err3) {
                  btn.disabled = false;
                  syncStatus.textContent = err3.message;
                  if (err3.kind === "auth") { KOS.anilist.disconnect(function () { renderConn(); }); }
                  return;
                }
                syncStatus.textContent = "Mapped " + mapped.length + " entries — writing to the vault…";
                KOS.mediadb.bulkUpsert(mapped, replaceOpts(mode, module, "anilist"), function (err4, res) {
                  btn.disabled = false;
                  if (err4) { syncStatus.textContent = "Write failed: " + err4.message; return; }
                  KOS.mediadb.setKV("anilist.lastSync." + module, Date.now(), function () {});
                  /* 3j: progress made elsewhere (mal-sync, site edits) that
                     this pull discovered → ONE proportional reward session */
                  KOS.media.logSyncRewards(module, res.rewards);
                  syncStatus.textContent = "Done — " + doneWording(res) +
                    (res.rewards && res.rewards.length ? ", " + res.rewards.length + " advanced elsewhere (rewarded)" : "") +
                    " (matched by AniList id, no duplicates" +
                    (module === "books" ? "; physical vault records untouched" : "") + ").";
                  KOS.ui.toast("AniList " + noun + " sync complete: " + (res.added + res.updated) + " entries.");
                  renderEnrich();
                });
              });
            } });
            return btn;
          }
          connBody.appendChild(aniMode.root);
          connBody.appendChild(el("div", { class: "lab-controls" }, [
            syncButton("Anime", "anime", "anime"),
            syncButton("Manga (Books)", "books", "manga"),
            el("button", { class: "btn", text: "Disconnect", onclick: function () {
              KOS.anilist.disconnect(function () { KOS.ui.toast("Token removed."); renderConn(); });
            } })
          ]));
          KOS.mediadb.getKV("anilist.lastSync.anime", function (e5, ts) {
            KOS.mediadb.getKV("anilist.lastSync.books", function (e6, ts2) {
              var bits = [];
              if (ts) bits.push("anime " + new Date(ts).toLocaleString());
              if (ts2) bits.push("manga " + new Date(ts2).toLocaleString());
              if (bits.length) syncStatus.textContent = "Last synced: " + bits.join(" · ") + ".";
            });
          });
          connBody.appendChild(syncStatus);
        } else {
          connBody.appendChild(el("div", { class: "med-form" }, [
            el("div", { class: "med-form-row" }, [
              el("label", { class: "med-field", style: "flex:2" }, [el("span", { class: "k", text: "Client ID" }), idIn]),
              el("label", { class: "med-field" }, [el("span", { class: "k", text: " " }), connectBtn])
            ]),
            el("div", { class: "med-form-row" }, [
              el("label", { class: "med-field", style: "flex:2" }, [el("span", { class: "k", text: "Access token (shown on AniList's PIN page)" }), tokIn]),
              el("label", { class: "med-field" }, [el("span", { class: "k", text: " " }), verifyBtn])
            ])
          ]));
          if (conn.token && !conn.viewer) {
            connBody.appendChild(el("p", { class: "sub", text: "A token is stored but unverified — paste it again or hit Save & verify." }));
          }
        }
      });
    }
    renderConn();

    /* ================= 2 · VNDB connection (Build 3c) ================= */
    var vndbBody = el("div", {});
    main.appendChild(panel("VNDB — visual novels", "選", [
      el("p", { class: "sub", text: "One-time setup, simpler than AniList: generate a personal token at " + KOS.vndb.TOKEN_URL.replace("https://", "") + " (tick “access to my list”; for write-back also tick “modify my list”) and paste it below. Treat the token like a password; it lives in the media store here, never in the backup JSON. Reads verified working from file://; pushes are currently blocked by VNDB's own CORS policy regardless of token permissions — see Write activity below." }),
      vndbBody
    ]));

    function renderVndb() {
      vndbBody.innerHTML = "";
      KOS.vndb.getConnection(function (err, conn) {
        if (err) { vndbBody.appendChild(el("p", { class: "sub", text: "Could not read the connection store: " + err.message })); return; }

        if (conn.token && conn.user) {
          vndbBody.appendChild(el("div", { class: "med-conn-ok" }, [
            el("span", { class: "med-chip", style: "--chip:#45d6a8", text: "Connected" }),
            el("b", { text: conn.user.username }),
            el("span", { class: "sub", text: " · VNDB " + conn.user.id + " · read-only by design" })
          ]));
          var vnStatus = el("p", { class: "sub med-sync-status" });
          var vnMode = modePicker();
          var syncBtn = el("button", { class: "btn primary", text: "⇅ Sync now — Visual Novels", onclick: function () {
            var mode = vnMode.value();
            if (!confirmReplace(mode, "VNDB")) return;
            syncBtn.disabled = true;
            vnStatus.textContent = "Pulling your VNDB list (pages of 100 — status, votes, covers, developers, tags)…";
            KOS.vndb.syncList(conn.token, {
              onProgress: function (n, msg) { vnStatus.textContent = msg || ("Fetched " + n + " entries…"); }
            }, function (err3, mapped) {
              if (err3) {
                syncBtn.disabled = false;
                vnStatus.textContent = err3.message;
                if (err3.kind === "auth") { KOS.vndb.disconnect(function () { renderVndb(); }); }
                return;
              }
              vnStatus.textContent = "Mapped " + mapped.length + " entries — writing to the vault…";
              KOS.mediadb.bulkUpsert(mapped, replaceOpts(mode, "vn", "vndb"), function (err4, res) {
                syncBtn.disabled = false;
                if (err4) { vnStatus.textContent = "Write failed: " + err4.message; return; }
                KOS.mediadb.setKV("vndb.lastSync", Date.now(), function () {});
                KOS.media.logSyncRewards("vn", res.rewards);
                vnStatus.textContent = "Done — " + doneWording(res) +
                  (res.rewards && res.rewards.length ? ", " + res.rewards.length + " advanced elsewhere (rewarded)" : "") +
                  " (matched by VNDB id; routes, chapters, quotes, CG counts and warnings untouched).";
                KOS.ui.toast("VNDB sync complete: " + (res.added + res.updated) + " entries.");
                renderEnrich();
              });
            });
          } });
          vndbBody.appendChild(vnMode.root);
          vndbBody.appendChild(el("div", { class: "lab-controls" }, [
            syncBtn,
            el("button", { class: "btn", text: "Disconnect", onclick: function () {
              KOS.vndb.disconnect(function () { KOS.ui.toast("Token removed."); renderVndb(); });
            } })
          ]));
          KOS.mediadb.getKV("vndb.lastSync", function (e5, ts) {
            if (ts) vnStatus.textContent = "Last synced: " + new Date(ts).toLocaleString() + ".";
          });
          vndbBody.appendChild(vnStatus);
        } else {
          var tokIn = el("input", { type: "password", class: "todo-in", placeholder: "Paste your VNDB token (from vndb.org/u/tokens)" });
          var verifyBtn = el("button", { class: "btn primary", text: "Save & verify", onclick: function () {
            var tok = tokIn.value.trim();
            if (!tok) { KOS.ui.toast("Paste the token first — generate one at vndb.org/u/tokens.", true); return; }
            verifyBtn.disabled = true;
            verifyBtn.textContent = "Checking…";
            KOS.vndb.setToken(tok, function () {
              KOS.vndb.fetchAuthInfo(tok, function (err2, user) {
                verifyBtn.disabled = false;
                verifyBtn.textContent = "Save & verify";
                if (err2) { KOS.ui.toast(err2.message, true); return; }
                KOS.ui.toast("Connected as " + user.username + ".");
                renderVndb();
              });
            });
          } });
          vndbBody.appendChild(el("div", { class: "med-form" }, [
            el("div", { class: "med-form-row" }, [
              el("label", { class: "med-field", style: "flex:2" }, [el("span", { class: "k", text: "Personal token" }), tokIn]),
              el("label", { class: "med-field" }, [el("span", { class: "k", text: " " }), verifyBtn])
            ]),
            el("div", { class: "lab-controls" }, [
              el("button", { class: "btn", text: "Open vndb.org/u/tokens ↗", onclick: function () { window.open(KOS.vndb.TOKEN_URL, "_blank"); } })
            ])
          ]));
          if (conn.token && !conn.user) {
            vndbBody.appendChild(el("p", { class: "sub", text: "A token is stored but unverified — paste it again or hit Save & verify." }));
          }
        }
      });
    }
    renderVndb();

    /* ================= 2½ · autonomous sync (Build 3j) ================= */
    var autoBody = el("div", {});
    main.appendChild(panel("Autonomous sync — hands-free, both directions", "環", [
      el("p", { class: "sub", text: "Once connected, nothing here needs pressing: local edits push out by themselves (debounced, since 3d), and the app PULLS your AniList (anime + manga) and VNDB lists every 15 minutes, on coming back online, and when the tab wakes past the interval — so updates made elsewhere (mal-sync marking an episode watched, edits on the sites) appear here on their own. Progress a pull discovers was made elsewhere earns the normal XP/gold trickle, sized to what actually advanced — echoes of this app's own pushes are recognised by a per-entry watermark and never rewarded twice. Pulls are plain update-and-add: replace mode stays a manual-only choice. Still last-write-wins: whichever side wrote most recently overwrites the other." }),
      autoBody
    ]));
    function renderAuto() {
      autoBody.innerHTML = "";
      KOS.autosync.enabled(function (e0, on) {
        var toggle = el("input", { type: "checkbox" });
        toggle.checked = on;
        toggle.addEventListener("change", function () {
          KOS.autosync.setEnabled(toggle.checked, function () {
            KOS.ui.toast(toggle.checked ? "Autonomous sync on — pulls every 15 minutes and on reconnect." : "Autonomous sync off — pulls only when you press Sync now.");
            renderAuto();
          });
        });
        var runBtn = el("button", { class: "btn", text: "⟳ Run a cycle now", onclick: function () {
          runBtn.disabled = true;
          runBtn.textContent = "⟳ Syncing…";
          KOS.autosync.runOnce(function (err, report) {
            runBtn.disabled = false;
            runBtn.textContent = "⟳ Run a cycle now";
            if (!report) { KOS.ui.toast("Nothing to do — autosync is off, offline, or already running."); return; }
            renderAuto();
          });
        } });
        var statusLine = el("p", { class: "sub med-sync-status" });
        KOS.mediadb.getKV("autosync.lastReport", function (e1, rep) {
          if (!rep) { statusLine.textContent = on ? "No automatic cycle has run yet this session — the first fires shortly after boot." : ""; return; }
          var bits = [];
          [["anime", rep.anilist && rep.anilist.anime], ["manga", rep.anilist && rep.anilist.books], ["vn", rep.vndb]].forEach(function (x) {
            if (x[1]) bits.push(x[0] + " " + (x[1].added + x[1].updated) + " touched" +
              ((x[1].rewards || []).length ? ", " + x[1].rewards.length + " rewarded" : ""));
          });
          if (rep.pushesRetried) bits.push(rep.pushesRetried + " stranded push" + (rep.pushesRetried === 1 ? "" : "es") + " retried");
          statusLine.textContent = "Last cycle " + new Date(rep.ts).toLocaleString() +
            (bits.length ? " — " + bits.join(" · ") : " — nothing to reconcile") +
            (rep.errors && rep.errors.length ? " · " + rep.errors.length + " issue" + (rep.errors.length === 1 ? "" : "s") + ": " + rep.errors[0] : "") + ".";
        });
        autoBody.appendChild(el("div", { class: "lab-controls" }, [
          el("label", { class: "med-impmode-opt" }, [toggle, " Autonomous sync " + (on ? "(on)" : "(off)")]),
          runBtn
        ]));
        autoBody.appendChild(statusLine);
      });
    }
    renderAuto();

    /* ================= 3 · XML import (fallback) ================= */
    var xmlStatus = el("p", { class: "sub" });
    var xmlMode = modePicker();
    var file = el("input", { type: "file", accept: ".xml,text/xml", style: "display:none", onchange: function () {
      var f = file.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        var parsed = KOS.media.parseXML(reader.result);
        if (parsed.error) { xmlStatus.textContent = parsed.error; return; }
        var mode = xmlMode.value();
        if (!confirmReplace(mode, "XML imports (" + parsed.module + ")")) { xmlStatus.textContent = "Import cancelled."; return; }
        xmlStatus.textContent = "Parsed " + parsed.entries.length + " " + parsed.module + " entries" +
          (parsed.userName ? " (" + parsed.userName + "'s export)" : "") + " — importing…";
        KOS.mediadb.bulkUpsert(parsed.entries, replaceOpts(mode, parsed.module, "import"), function (err, res) {
          if (err) { xmlStatus.textContent = "Import failed: " + err.message; return; }
          xmlStatus.textContent = "Imported: " + doneWording(res) + ". Skeleton data only — run the enrichment below to fill covers and genres.";
          KOS.ui.toast("XML import complete.");
          renderEnrich();
        });
      };
      reader.readAsText(f);
      file.value = "";
    } });
    main.appendChild(panel("XML import — zero-setup fallback", "紙", [
      el("p", { class: "sub", text: "AniList → Settings → Apps → Export gives a MAL-format XML file (anime or manga — manga lands in Books). No login or token needed. The ids inside are MAL ids; enrichment below backfills the AniList ids so later syncs match these rows instead of duplicating. Imports carry no covers or genres — enrichment fills those too. Replace mode only sweeps entries that themselves arrived by XML import — synced and hand-made entries are out of its reach." }),
      file,
      xmlMode.root,
      el("div", { class: "lab-controls" }, [
        el("button", { class: "btn", text: "⇪ Import an XML export…", onclick: function () { file.click(); } })
      ]),
      xmlStatus
    ]));

    /* ================= 3½ · vault maintenance (Build 3h) ================= */
    var dedupStatus = el("p", { class: "sub" });
    var dedupBtn = el("button", { class: "btn", text: "⧉ Find & merge duplicates", onclick: function () {
      dedupBtn.disabled = true;
      var mods = ["vn", "anime", "books", "game"];
      var reports = [], mi = 0;
      (function next(err) {
        if (err) { dedupBtn.disabled = false; dedupStatus.textContent = "Dedup failed: " + err.message; return; }
        if (mi >= mods.length) {
          dedupBtn.disabled = false;
          var removed = reports.reduce(function (n, r) { return n + r.removed; }, 0);
          var titles = reports.reduce(function (a, r) { return a.concat(r.titles); }, []);
          dedupStatus.textContent = removed
            ? "Merged " + titles.length + " duplicated title" + (titles.length === 1 ? "" : "s") + ", removed " + removed +
              " redundant row" + (removed === 1 ? "" : "s") + " — manual data (routes, quotes, notes, volumes…) was unioned, never discarded. " + titles.join(" · ")
            : "No duplicates found — every entry is unique by id and title.";
          KOS.ui.toast(removed ? "Duplicates merged." : "No duplicates found.");
          return;
        }
        var m = mods[mi++];
        dedupStatus.textContent = "Scanning " + m + "…";
        KOS.media.dedupeVault(m, function (e2, rep) {
          if (rep) reports.push(rep);
          next(e2);
        });
      })(null);
    } });
    main.appendChild(panel("Vault maintenance — duplicate repair", "掃", [
      el("p", { class: "sub", text: "A one-time repair for the Build 3h VNDB bug (synced entries landed without their VNDB id, so every re-sync duplicated the whole list), safe to run any time: entries sharing an external id — or sharing a title where one copy is missing its id — are merged into one, keeping the union of everything you added yourself across the copies. Ambiguous cases (same title, different ids) are left untouched. It also runs by itself once, on the first app start after the fix." }),
      dedupStatus,
      el("div", { class: "lab-controls" }, [dedupBtn])
    ]));
    KOS.mediadb.getKV("maint.dedupe3h", function (e0, rep) {
      if (!rep || dedupStatus.textContent) return;
      dedupStatus.textContent = "One-time repair ran " + new Date(rep.ts).toLocaleString() + ": " +
        (rep.removed
          ? "merged " + rep.titles.length + " duplicated title" + (rep.titles.length === 1 ? "" : "s") +
            ", removed " + rep.removed + " redundant row" + (rep.removed === 1 ? "" : "s") + " — " + rep.titles.join(" · ")
          : "no duplicates found.");
    });

    /* ================= 4 · public enrichment ================= */
    var enrichBody = el("div", {});
    main.appendChild(panel("Enrichment — covers & metadata, no login", "彩", [
      el("p", { class: "sub", text: "For entries that arrived via XML, were linked by hand, or lost their art: public batched queries — 50 ids a call, paced to each API's limits (AniList 30 req/min; VNDB 200 req/5 min), with automatic backoff if they say slow down. Both verified working from file://." }),
      enrichBody
    ]));

    /* one enrichment block per real module — same public batch query, but a
       Books pass additionally backfills author (staff), format and volume
       counts, which the anime query doesn't carry */
    function enrichBlock(module, label) {
      var body = el("div", { class: "med-enrich-block" });
      KOS.mediadb.needingEnrichment(module, function (err, needy) {
        if (err) { body.appendChild(el("p", { class: "sub", text: "Could not scan the vault: " + err.message })); return; }
        if (!needy.length) {
          body.appendChild(el("p", { class: "sub", text: label + ": nothing needs enrichment — every entry with an id already has its cover and genres." }));
          return;
        }
        var bar = el("div", { class: "subj-track med-enrich-track" }, [el("span", { class: "subj-fill", style: "width:0%" })]);
        var note = el("p", { class: "sub", text: label + ": " + needy.length + " entries are missing covers/genres (~" + Math.ceil(needy.length / 50) + " requests)." });
        var run = el("button", { class: "btn primary", text: "✦ " + label + " — fill covers & genres (" + needy.length + ")", onclick: function () {
          run.disabled = true;
          /* partition by which identity we hold: synced rows carry AniList
             ids, XML rows carry MAL ids (queried via idMal_in) */
          var spec = { anilist: [], mal: [] };
          needy.forEach(function (e) {
            if (e.externalIds.anilistId) spec.anilist.push(e.externalIds.anilistId);
            else spec.mal.push(e.externalIds.malId);
          });
          KOS.anilist.enrich(spec, module, {
            onProgress: function (done, total, msg) {
              bar.firstChild.style.width = Math.round(100 * done / total) + "%";
              note.textContent = msg || ("Enriched " + done + " / " + total + "…");
            }
          }, function (err2, records) {
            var got = records.length;
            var byAni = {}, byMal = {};
            records.forEach(function (r) {
              if (r.anilistId) byAni[r.anilistId] = r;
              if (r.malId) byMal[r.malId] = r;
            });
            /* apply whatever arrived, even on a mid-run failure — and
               backfill BOTH ids so future syncs match these rows */
            var updated = needy.map(function (e) {
                var en = (e.externalIds.anilistId && byAni[e.externalIds.anilistId]) ||
                         (e.externalIds.malId && byMal[e.externalIds.malId]);
                if (!en) return null;
                e.coverUrl = e.coverUrl || en.coverUrl;
                e.genres = e.genres.length ? e.genres : en.genres;
                if (e.progress.total == null && en.total) e.progress.total = en.total;
                e.extra = Object.assign({}, en.extra, e.extra);
                e.externalIds.anilistId = e.externalIds.anilistId || en.anilistId;
                e.externalIds.malId = e.externalIds.malId || en.malId;
                if (module === "books") {
                  e.author = e.author || en.author || "";
                  e.format = e.format || en.format || null;
                  if (e.progress.totalVolumes == null && en.totalVolumes) e.progress.totalVolumes = en.totalVolumes;
                }
                e.extra.enrichedAt = Date.now();   // some titles legitimately have no genres — don't re-offer forever
                return e;
              }).filter(Boolean);
            var i = 0;
            (function step() {
              if (i >= updated.length) {
                run.disabled = false;
                note.textContent = err2
                  ? err2.message + " — " + got + " entries were still enriched; run again for the rest."
                  : "Done — " + got + " entries enriched.";
                if (!err2) KOS.ui.toast("Enrichment complete.");
                renderEnrich();
                return;
              }
              KOS.mediadb.put(updated[i++], step);
            })();
          });
        } });
        body.appendChild(note);
        body.appendChild(bar);
        body.appendChild(el("div", { class: "lab-controls" }, [run]));
      });
      return body;
    }
    /* VN enrichment goes to VNDB, not AniList: fills cover, developer and
       tag-derived genres for entries the user linked by typing a VNDB id */
    function vnEnrichBlock() {
      var body = el("div", { class: "med-enrich-block" });
      KOS.mediadb.needingEnrichment("vn", function (err, needy) {
        if (err) { body.appendChild(el("p", { class: "sub", text: "Could not scan the vault: " + err.message })); return; }
        if (!needy.length) {
          body.appendChild(el("p", { class: "sub", text: "Visual Novels: nothing needs enrichment — every linked entry already has its cover and developer." }));
          return;
        }
        var bar = el("div", { class: "subj-track med-enrich-track" }, [el("span", { class: "subj-fill", style: "width:0%" })]);
        var note = el("p", { class: "sub", text: "Visual Novels: " + needy.length + " linked entries are missing cover/developer/tags (~" + Math.ceil(needy.length / 50) + " requests to VNDB)." });
        var run = el("button", { class: "btn primary", text: "✦ Visual Novels — fill covers & metadata (" + needy.length + ")", onclick: function () {
          run.disabled = true;
          var ids = needy.map(function (e) { return e.externalIds.vndbId; });
          KOS.vndb.enrich(ids, {
            onProgress: function (done, total, msg) {
              bar.firstChild.style.width = Math.round(100 * done / total) + "%";
              note.textContent = msg || ("Enriched " + done + " / " + total + "…");
            }
          }, function (err2, records) {
            var got = records.length;
            var byId = {};
            records.forEach(function (r) { if (r.vndbId) byId[r.vndbId] = r; });
            var updated = needy.map(function (e) {
                var en = byId[e.externalIds.vndbId];
                if (!en) return null;
                e.coverUrl = e.coverUrl || en.coverUrl;
                e.developer = e.developer || en.developer || "";
                e.genres = e.genres.length ? e.genres : en.genres;
                e.extra = Object.assign({}, en.extra, e.extra);
                e.extra.enrichedAt = Date.now();
                return e;
              }).filter(Boolean);
            var i = 0;
            (function step() {
              if (i >= updated.length) {
                run.disabled = false;
                note.textContent = err2
                  ? err2.message + " — " + got + " entries were still enriched; run again for the rest."
                  : "Done — " + got + " entries enriched.";
                if (!err2) KOS.ui.toast("VN enrichment complete.");
                renderEnrich();
                return;
              }
              KOS.mediadb.put(updated[i++], step);
            })();
          });
        } });
        body.appendChild(note);
        body.appendChild(bar);
        body.appendChild(el("div", { class: "lab-controls" }, [run]));
      });
      return body;
    }
    function renderEnrich() {
      enrichBody.innerHTML = "";
      enrichBody.appendChild(enrichBlock("anime", "Anime"));
      enrichBody.appendChild(enrichBlock("books", "Books"));
      enrichBody.appendChild(vnEnrichBlock());
    }
    renderEnrich();

    /* ================= 5 · Games — why there is no connection (3e) ================= */
    main.appendChild(panel("Games — manual by design", "遊", [
      el("p", { class: "sub", text: "There is nothing to connect here, and that's a verified conclusion, not a gap. Steam's data API (library, playtime) blocks browser CORS with no client-side workaround. Steam SIGN-IN (OpenID 2.0, identity only) was attempted and tested live on 2026-07-03 and abandoned: the verification round-trip that makes a sign-in trustworthy (check_authentication) returns its answer without CORS headers, so a browser page can send it but can never read the result — verifying would require a server, which this app deliberately doesn't have. And even unverified, Steam only returns a bare SteamID64 number; the display name sits behind the Web API, which is CORS-blocked too. GOG, PSN, Xbox and Nintendo offer no public per-user API a browser may use either." }),
      el("p", { class: "sub", text: "What \"manual-entry only\" means in practice: the ▤ Bulk add tool in the Games vault turns a pasted list (Steam's library page copy-pastes cleanly, one title per line) into draft entries in one go; playtime, tiers and platforms are then filled per game. A hand-entered Steam App ID gives each entry a working store link — that's the whole Steam integration, honestly." }),
      el("div", { class: "lab-controls" }, [
        el("button", { class: "btn primary", text: "遊 Open the Games vault", onclick: function () { KOS.show("game"); } })
      ])
    ]));

    /* ================= 6 · write activity (Build 3d) ================= */
    var wlogBody = el("div", {});
    main.appendChild(panel("Write activity — the push paper trail", "跡", [
      el("p", { class: "sub", text: "Every automatic push of status/progress/score to AniList or VNDB lands here (newest first, last 200). Writes are last-write-wins with no conflict detection — an edit made on the site between local edits is simply overwritten by the next push, and a pull sync overwrites local list state the same way. Note: VNDB pushes currently fail from the browser — VNDB's CORS policy only allows POST/GET/OPTIONS, so the PATCH their API requires never leaves the page (verified 2026-07-03; not a token problem)." }),
      wlogBody
    ]));
    function renderWriteLog() {
      wlogBody.innerHTML = "";
      KOS.mediapush.getLog(function (err, log) {
        if (err) { wlogBody.appendChild(el("p", { class: "sub", text: "Could not read the log: " + err.message })); return; }
        if (!log.length) {
          wlogBody.appendChild(el("p", { class: "sub", text: "No pushes yet — edit a synced entry's status, progress or score and it will appear here." }));
          return;
        }
        var list = el("div", { class: "med-wlog" });
        log.slice(0, 30).forEach(function (r) {
          list.appendChild(el("div", { class: "med-wlog-row" + (r.ok ? "" : " bad") }, [
            el("span", { class: "med-chip", style: "--chip:" + (r.ok ? "#45d6a8" : "#FF2E44"), text: r.ok ? "✓" : "✕" }),
            el("b", { class: "med-wlog-t", text: r.title || ("entry #" + r.entryId) }),
            el("span", { class: "sub", text: (r.service === "vndb" ? "VNDB" : "AniList") + " · " + (r.fields || []).join(", ") +
              " · " + new Date(r.ts).toLocaleString() + (r.ok ? "" : " — " + (r.error || "failed")) })
          ]));
        });
        wlogBody.appendChild(list);
        if (log.length > 30) wlogBody.appendChild(el("p", { class: "sub", text: "Showing the 30 most recent of " + log.length + " logged pushes." }));
      });
    }
    renderWriteLog();

    /* footer nav */
    main.appendChild(el("div", { class: "lab-controls", style: "margin-top:14px" }, [
      el("button", { class: "btn", text: "← Collection Matrix", onclick: function () { KOS.show("matrix"); } }),
      el("button", { class: "btn", text: "映 Anime vault", onclick: function () { KOS.show("anime"); } }),
      el("button", { class: "btn", text: "本 Books vault", onclick: function () { KOS.show("books"); } }),
      el("button", { class: "btn", text: "選 Visual Novels", onclick: function () { KOS.show("vn"); } })
    ]));
  };
})();
