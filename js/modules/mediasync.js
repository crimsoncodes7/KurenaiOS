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
      return el("label", { class: "k-sy-mode-opt", title: hint }, [r, el("span", { text: label })]);
    }
    var root = el("div", { class: "k-sy-mode", "data-ui": "sync.mode", role: "radiogroup", "aria-label": "Import mode" }, [
      el("span", { class: "k-muted", text: "Import mode" }),
      radio("update", "Update & add", "Match existing entries by their external id, update them, add anything new — nothing else is touched.", true),
      radio("replace", "Replace from this source", "Entries from this source that the import no longer carries are removed — unless they hold data you added yourself (routes, quotes, physical volumes, notes, …); those are kept and updated instead.")
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
  /* the AniList contract: Anime and the digital half of Books MIRROR the
     AniList list, every pull — manual "Sync now" and the autosync cycle
     alike. There is no mode to pick (KOS.media.mirrorOpts). */
  var mirrorOpts = KOS.media.mirrorOpts;
  function confirmReplace(mode, sourceName, proceed) {
    if (mode !== "replace") { proceed(); return; }
    KOS.ui.confirm({ title: "Replace from " + sourceName + "?", danger: true, confirm: "Replace",
      body: "Entries previously synced or imported from " + sourceName + " that this import no longer carries will be removed. Anything holding your own data — routes, quotes, physical volumes, notes — is kept and just updated." }, proceed);
  }
  function doneWording(res) {
    var bits = [res.added + " added", res.updated + " updated"];
    if (res.removed) bits.push(res.removed + " removed");
    if (res.kept) bits.push(res.kept + " kept because they have your own data attached");
    return bits.join(", ");
  }
  function syncNote(node, text, isError) {
    node.textContent = text;
    KOS.ui.state(node, "is-error", !!isError);
  }

  /* ---------------- the ONE sync runner (Category 6 extraction) ----------
     The pull flow was inline in each provider button; the assistant's sync
     tool and both buttons now share this: connection check → provider
     syncList → bulkUpsert (replace opts only when asked) → lastSync kv →
     the single reward session (invariant #5). cb(err, res) where res =
     bulkUpsert's {added, updated, removed, kept, rewards}; err.kind
     "auth" passes through so the UI can drop a dead token.
     source: "anilist" (module anime|books) | "vndb" (module vn).
     opts: { mode: "update"|"replace", onProgress(msg) }.                  */
  function runSync(source, module, opts, cb) {
    opts = opts || {};
    var mode = opts.mode === "replace" ? "replace" : "update";
    var progress = opts.onProgress || function () {};
    function finish(err4, res) {
      if (err4) { cb(err4); return; }
      KOS.mediadb.setKV(source === "vndb" ? "vndb.lastSync" : "anilist.lastSync." + module,
        Date.now(), function () {});
      KOS.media.logSyncRewards(module, res.rewards);
      cb(null, res);
    }
    if (source === "anilist") {
      if (module !== "anime" && module !== "books") { cb(new Error("AniList syncs the anime or books module.")); return; }
      /* the loading state shows IMMEDIATELY on the deliberate action —
         before the async connection read (smoke4-asserted UX) */
      progress("Pulling your " + (module === "books" ? "manga" : "anime") + " list…");
      KOS.anilist.getConnection(function (err, conn) {
        if (err || !conn.token || !conn.viewer) { cb(new Error("AniList isn't connected — set it up in Sync & Import.")); return; }
        KOS.anilist.syncList(conn.token, conn.viewer.id, module, function (err3, mapped, listNames) {
          if (err3) { cb(err3); return; }
          progress("Mapped " + mapped.length + " entries — mirroring into the vault…");
          KOS.mediadb.bulkUpsert(mapped, mirrorOpts(module, listNames), finish);
        });
      });
      return;
    }
    if (source === "vndb") {
      if (module !== "vn") { cb(new Error("VNDB syncs the visual novels module.")); return; }
      progress("Pulling your VNDB list…");
      KOS.vndb.getConnection(function (err, conn) {
        if (err || !conn.token || !conn.user) { cb(new Error("VNDB isn't connected — set it up in Sync & Import.")); return; }
        KOS.vndb.syncList(conn.token, {
          onProgress: function (n, msg) { progress(msg || ("Fetched " + n + " entries…")); }
        }, function (err3, mapped) {
          if (err3) { cb(err3); return; }
          progress("Mapped " + mapped.length + " entries — writing to the vault…");
          KOS.mediadb.bulkUpsert(mapped, replaceOpts(mode, "vn", "vndb"), finish);
        });
      });
      return;
    }
    cb(new Error("Unknown sync source: " + source));
  }
  KOS.mediasync = { run: runSync };

  KOS.views.mediasync = function (main) {
    KOS.shell.tree("none");

    /* "How this works" (frame 11i) reveals every card's note at once; the
       notes stay beside the controls they explain */
    var page = el("div", { class: "k-sy", "data-ui": "sync.page" });
    var howBtn = el("button", { type: "button", class: "k-btn", "data-ui": "sync.how", "aria-expanded": "false",
      text: "How this works", onclick: function () {
        var open = KOS.ui.state(page, "notes");
        howBtn.setAttribute("aria-expanded", open ? "true" : "false");
      } });
    main.appendChild(KOS.ui.pageHeader({
      kicker: "The bridge",
      title: "Sync & Import",
      sub: "Where the vault gets its data: AniList mirrors anime and manga, VNDB feeds visual novels, games stay by hand.",
      actions: [KOS.collectionWorkspaceTabs("sync", "mediasync"), howBtn]
    }));

    if (KOS.medview.unavailable(main)) return;
    main.appendChild(page);

    var providerGrid = el("div", { class: "k-sy-providers" });
    var middle = el("div", { class: "k-sy-row" });
    page.appendChild(providerGrid);
    page.appendChild(middle);

    function facts(items) {
      return el("dl", { class: "k-sy-facts", "data-ui": "sync.provider-facts" }, items.map(function (item) {
        return el("div", { class: "k-sy-fact" }, [el("dt", { text: item[0] }), el("dd", { "data-fact": item[2] || null, text: item[1] })]);
      }));
    }
    function stampFacts(node, keys, modules, source) {
      KOS.mediadb.getKV(keys[0], function (_e1, first) {
        KOS.mediadb.getKV(keys[1], function (_e2, second) {
          var stamps = [first, second].filter(Boolean);
          node.querySelector("[data-fact='last']").textContent = stamps.length
            ? new Date(Math.max.apply(null, stamps)).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Not yet";
        });
      });
      var total = 0, index = 0;
      (function countImported() {
        if (index >= modules.length) { node.querySelector("[data-fact='count']").textContent = total.toLocaleString(); return; }
        KOS.mediadb.query({ module: modules[index++] }, function (_err, rows) {
          total += (rows || []).filter(function (row) { return row.syncSource === source; }).length;
          countImported();
        });
      })();
    }
    function formRow(label, input, button) {
      return el("div", { class: "k-sy-formrow" }, [
        el("label", { class: "k-field", "data-ui": "ui.field" }, [el("span", { class: "k-field-label", text: label }), input]),
        button
      ]);
    }

    /* ================= 1 · AniList (primary) ================= */
    var connBody = el("div", { class: "k-sy-body" });
    var aniPill = el("span", { class: "k-sy-pill", "data-ui": "sync.pill" });
    providerGrid.appendChild(card({
      title: "AniList", tag: "Anime & manga (Books)", badge: "An", accent: "var(--anime)", pill: aniPill, provider: true,
      note: "One-time setup: register an API client at anilist.co/settings/developer, set its Redirect URL to EXACTLY " + KOS.anilist.PIN_URL + ", and paste the Client ID below (no secret is needed). Tokens last 1 year; when one expires you just reconnect the same way. Anime and the digital half of Books are a 1:1 mirror of your AniList lists: a title removed there is removed here on the next pull, duplicates fold into one row, and only physical volumes stay outside AniList's reach."
    }, [connBody]));

    function renderConn() {
      connBody.innerHTML = "";
      KOS.anilist.getConnection(function (err, conn) {
        if (err) { connBody.appendChild(el("p", { class: "k-muted", text: "Could not read the connection store: " + err.message })); return; }
        var connected = !!(conn.token && conn.viewer);
        setPill(aniPill, connected);

        if (connected) {
          var meta = facts([["Account", conn.viewer.name], ["Sync mode", "Mirror · 1:1"], ["Last successful sync", "Checking…", "last"], ["Items imported", "Checking…", "count"]]);
          connBody.appendChild(meta);
          stampFacts(meta, ["anilist.lastSync.anime", "anilist.lastSync.books"], ["anime", "books"], "anilist");
          var syncStatus = el("p", { class: "k-sy-status", "data-ui": "sync.status", "aria-live": "polite" });
          /* one button per media type — same query pattern, type: ANIME vs
             MANGA; manga rows land in the Books module with author/format/
             volume data mapped from the richer MANGA response */
          function syncButton(label, module, noun, primary) {
            var btn = el("button", { type: "button", class: "k-btn" + (primary ? " k-btn--primary" : ""), "data-ui": "sync.run", text: "⇅ Sync now — " + label, onclick: function () {
              btn.disabled = true;
              runSync("anilist", module, {
                onProgress: function (msg) { syncNote(syncStatus, msg); }
              }, function (err3, res) {
                btn.disabled = false;
                if (err3) {
                  syncNote(syncStatus, err3.message, true);
                  if (err3.kind === "auth") { KOS.anilist.disconnect(function () { renderConn(); }); }
                  return;
                }
                syncNote(syncStatus, "Done — " + doneWording(res) +
                  (res.rewards && res.rewards.length ? ", " + res.rewards.length + " advanced elsewhere (rewarded)" : "") +
                  " (mirrored 1:1 by AniList id" +
                  (module === "books" ? "; the physical shelf is untouched" : "") + ").");
                KOS.ui.toast("AniList " + noun + " sync complete: " + (res.added + res.updated) + " entries.");
                renderEnrich();
              });
            } });
            return btn;
          }
          KOS.mediadb.getKV("anilist.lastSync.anime", function (e5, ts) {
            KOS.mediadb.getKV("anilist.lastSync.books", function (e6, ts2) {
              var bits = [];
              if (ts) bits.push("anime " + new Date(ts).toLocaleString());
              if (ts2) bits.push("manga " + new Date(ts2).toLocaleString());
              if (bits.length && !syncStatus.textContent) syncNote(syncStatus, "Last synced: " + bits.join(" · ") + ".");
            });
          });
          connBody.appendChild(syncStatus);
          connBody.appendChild(el("div", { class: "k-sy-actions" }, [
            syncButton("Anime", "anime", "anime", true),
            syncButton("Manga (Books)", "books", "manga"),
            el("button", { type: "button", class: "k-btn k-btn--quiet k-sy-end", text: "Disconnect", onclick: function () {
              KOS.anilist.disconnect(function () { KOS.ui.toast("Token removed."); renderConn(); });
            } })
          ]));
          return;
        }

        connBody.appendChild(facts([["Account", "Connect AniList to begin"], ["Sync mode", "Mirror · 1:1"], ["Last successful sync", "—"], ["Items imported", "—"]]));
        var idIn = el("input", { type: "text", class: "k-input", "aria-label": "AniList Client ID", placeholder: "A short number", value: conn.clientId || "" });
        idIn.addEventListener("change", function () { KOS.anilist.setClientId(idIn.value, function () {}); });
        var connectBtn = el("button", { type: "button", class: "k-btn k-btn--primary", text: "1 · Connect AniList ↗", onclick: function () {
          var id = idIn.value.trim();
          if (!id) { KOS.ui.toast("Paste your Client ID first — from anilist.co/settings/developer.", true); return; }
          KOS.anilist.setClientId(id, function () {
            window.open(KOS.anilist.authorizeUrl(id), "_blank");
            KOS.ui.toast("Approve on AniList, then copy the token it shows into the field below.");
          });
        } });
        var tokIn = el("input", { type: "password", class: "k-input", "aria-label": "AniList access token", placeholder: "The token AniList showed you" });
        var verifyBtn = el("button", { type: "button", class: "k-btn", text: "Save & verify", onclick: function () {
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
        connBody.appendChild(formRow("Client ID", idIn, connectBtn));
        connBody.appendChild(formRow("2 · Access token (shown on AniList's PIN page)", tokIn, verifyBtn));
        if (conn.token && !conn.viewer) {
          connBody.appendChild(el("p", { class: "k-muted k-sy-small", text: "A token is stored but unverified — paste it again or hit Save & verify." }));
        }
      });
    }
    renderConn();

    /* ================= 2 · VNDB ================= */
    var vndbBody = el("div", { class: "k-sy-body" });
    var vnPill = el("span", { class: "k-sy-pill", "data-ui": "sync.pill" });
    providerGrid.appendChild(card({
      title: "VNDB", tag: "Visual novels", badge: "VN", accent: "var(--vn)", pill: vnPill, provider: true,
      note: "One-time setup, simpler than AniList: generate a personal token at " + KOS.vndb.TOKEN_URL.replace("https://", "") + " (tick “access to my list” and, for write-back, “modify my list”) and paste it below. Treat the token like a password; it lives in the media store here, never in the backup JSON. Reads work straight from the page; pushes need you signed in to cloud sync, because VNDB's CORS policy blocks browser writes and the server relays them instead — see Recent activity below."
    }, [vndbBody]));

    function renderVndb() {
      vndbBody.innerHTML = "";
      KOS.vndb.getConnection(function (err, conn) {
        if (err) { vndbBody.appendChild(el("p", { class: "k-muted", text: "Could not read the connection store: " + err.message })); return; }
        var connected = !!(conn.token && conn.user);
        setPill(vnPill, connected);

        if (connected) {
          var canWrite = (conn.user.permissions || []).indexOf("listwrite") !== -1;
          var vnMeta = facts([["Account", conn.user.username + " · " + conn.user.id], ["Access", canWrite ? "Read & write" : "Read-only token"],
            ["Last successful sync", "Checking…", "last"], ["Items imported", "Checking…", "count"]]);
          vndbBody.appendChild(vnMeta);
          stampFacts(vnMeta, ["vndb.lastSync", "vndb.lastSync"], ["vn"], "vndb");
          var vnStatus = el("p", { class: "k-sy-status", "data-ui": "sync.status", "aria-live": "polite" });
          var vnMode = modePicker();
          var syncBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "sync.run", text: "⇅ Sync now — Visual Novels", onclick: function () {
            var mode = vnMode.value();
            confirmReplace(mode, "VNDB", function () {
              syncBtn.disabled = true;
              runSync("vndb", "vn", {
                mode: mode,
                onProgress: function (msg) { syncNote(vnStatus, msg); }
              }, function (err3, res) {
                syncBtn.disabled = false;
                if (err3) {
                  syncNote(vnStatus, err3.message, true);
                  if (err3.kind === "auth") { KOS.vndb.disconnect(function () { renderVndb(); }); }
                  return;
                }
                syncNote(vnStatus, "Done — " + doneWording(res) +
                  (res.rewards && res.rewards.length ? ", " + res.rewards.length + " advanced elsewhere (rewarded)" : "") +
                  " (matched by VNDB id; routes, chapters, quotes, CG counts and warnings untouched).");
                KOS.ui.toast("VNDB sync complete: " + (res.added + res.updated) + " entries.");
                renderEnrich();
              });
            });
          } });
          KOS.mediadb.getKV("vndb.lastSync", function (e5, ts) {
            if (ts && !vnStatus.textContent) syncNote(vnStatus, "Last synced: " + new Date(ts).toLocaleString() + ".");
          });
          vndbBody.appendChild(vnMode.root);
          vndbBody.appendChild(vnStatus);
          vndbBody.appendChild(el("div", { class: "k-sy-actions" }, [
            syncBtn,
            el("button", { type: "button", class: "k-btn k-btn--quiet k-sy-end", text: "Disconnect", onclick: function () {
              KOS.vndb.disconnect(function () { KOS.ui.toast("Token removed."); renderVndb(); });
            } })
          ]));
          return;
        }

        vndbBody.appendChild(facts([["Account", "Connect VNDB to begin"], ["Import mode", "Update & add"], ["Last successful sync", "—"], ["Items imported", "—"]]));
        var tokIn = el("input", { type: "password", class: "k-input", "aria-label": "VNDB personal token", placeholder: "From vndb.org/u/tokens" });
        var verifyBtn = el("button", { type: "button", class: "k-btn k-btn--primary", text: "Save & verify", onclick: function () {
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
        vndbBody.appendChild(formRow("Personal token", tokIn, verifyBtn));
        vndbBody.appendChild(el("div", { class: "k-sy-actions" }, [
          el("button", { type: "button", class: "k-btn k-btn--quiet", text: "Open vndb.org/u/tokens ↗", onclick: function () { window.open(KOS.vndb.TOKEN_URL, "_blank"); } })
        ]));
        if (conn.token && !conn.user) {
          vndbBody.appendChild(el("p", { class: "k-muted k-sy-small", text: "A token is stored but unverified — paste it again or hit Save & verify." }));
        }
      });
    }
    renderVndb();

    /* ================= 3 · Games: manual baseline + verified Steam ================= */
    providerGrid.appendChild(card({
      title: "Games", tag: "Manual baseline + verified Steam", badge: "St", accent: "var(--games)",
      note: "Manual entry remains the permanent baseline — ▤ Bulk add still turns any pasted list into draft entries with zero setup. Since Build 4c, signing in to cloud sync additionally unlocks two server-assisted paths, both living in the Games vault and both strictly on-demand: ⊕ Find new searches IGDB (title, cover, release date, genres, publisher — added locally, fully editable), and ◆ Steam links your Steam account through a SERVER-verified OpenID sign-in and imports your owned library behind a review/selection stage. The Build 3e conclusion still stands for the browser alone: Steam's check_authentication response is unreadable cross-origin, which is exactly why the verification now happens in a Supabase Edge Function — the browser never supplies a SteamID, and a Steam import only fills gaps (it never overwrites values you edited by hand). With no cloud sign-in, or either upstream service down, the vault works exactly as before."
    }, [
      el("div", { class: "k-sy-body" }, [
        facts([["Baseline", "Manual entry · ▤ Bulk add"], ["Steam library", "Imported in the Games vault"], ["Verification", "Server-side, behind a review"], ["Needs", "Cloud sign-in for Steam"]]),
        el("div", { class: "k-sy-actions" }, [
          el("button", { type: "button", class: "k-btn k-btn--primary", text: "遊 Open the Games vault", onclick: function () { KOS.show("game"); } })
        ])
      ])
    ]));

    /* ================= 4 · autonomous sync ================= */
    var autoBody = el("div", { class: "k-sy-auto" });
    middle.appendChild(card({
      title: "Autonomous sync", tag: "Hands-free · both directions", className: "k-sy-card--auto",
      note: "Once connected, nothing here needs pressing: local edits push out by themselves (debounced, since 3d), and the app PULLS your AniList (anime + manga) and VNDB lists every 15 minutes, on coming back online, and when the tab wakes past the interval — so updates made elsewhere (mal-sync marking an episode watched, edits on the sites) appear here on their own. Progress a pull discovers was made elsewhere earns the normal XP/gold trickle, sized to what actually advanced — echoes of this app's own pushes are recognised by a per-entry watermark and never rewarded twice. AniList pulls mirror the list 1:1 (what AniList no longer carries is removed; the physical shelf survives); VNDB pulls are plain update-and-add. Still last-write-wins: whichever side wrote most recently overwrites the other."
    }, [autoBody]));
    function renderAuto() {
      autoBody.innerHTML = "";
      KOS.autosync.enabled(function (e0, on) {
        var toggle = el("input", { type: "checkbox", role: "switch", class: "k-switch", "data-ui": "sync.auto-toggle", "aria-label": "Autonomous sync every 15 minutes" });
        toggle.checked = on;
        toggle.addEventListener("change", function () {
          KOS.autosync.setEnabled(toggle.checked, function () {
            KOS.ui.toast(toggle.checked ? "Autonomous sync on — pulls every 15 minutes and on reconnect." : "Autonomous sync off — pulls only when you press Sync now.");
            renderAuto();
          });
        });
        var runBtn = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "sync.auto-run", text: "⟳ Run a cycle now", onclick: function () {
          runBtn.disabled = true;
          runBtn.textContent = "⟳ Syncing…";
          KOS.autosync.runOnce(function (err, report) {
            runBtn.disabled = false;
            runBtn.textContent = "⟳ Run a cycle now";
            if (!report) { KOS.ui.toast("Nothing to do — autosync is off, offline, or already running."); return; }
            renderAuto();
          });
        } });
        var last = el("b", { class: "k-mono", text: "—" });
        var statusLine = el("p", { class: "k-sy-status", "data-ui": "sync.status" });
        KOS.mediadb.getKV("autosync.lastReport", function (e1, rep) {
          if (!rep) { statusLine.textContent = on ? "No automatic cycle has run yet this session — the first fires shortly after boot." : ""; return; }
          last.textContent = new Date(rep.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
        autoBody.appendChild(el("div", { class: "k-sy-auto-row" }, [
          toggle,
          el("div", { class: "k-sy-auto-copy" }, [
            el("b", { text: on ? "On" : "Off" }),
            el("span", { class: "k-muted", text: on ? "Pulls every 15 minutes and on reconnect." : "Pulls only when you press Sync now." })
          ]),
          el("div", { class: "k-sy-auto-last" }, [el("span", { class: "k-muted", text: "Last cycle" }), last])
        ]));
        autoBody.appendChild(statusLine);
        autoBody.appendChild(el("div", { class: "k-sy-actions" }, [runBtn]));
      });
    }
    renderAuto();

    /* ================= 5 · zero-setup fallback: XML + duplicate repair ================= */
    var xmlStatus = el("p", { class: "k-sy-status", "data-ui": "sync.xml-status" });
    var xmlMode = modePicker();
    var file = el("input", { type: "file", accept: ".xml,text/xml", hidden: "", "data-ui": "sync.xml-file", onchange: function () {
      var f = file.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        var parsed = KOS.media.parseXML(reader.result);
        if (parsed.error) { xmlStatus.textContent = parsed.error; return; }
        var mode = xmlMode.value();
        confirmReplace(mode, "XML imports (" + parsed.module + ")", function () {
          xmlStatus.textContent = "Parsed " + parsed.entries.length + " " + parsed.module + " entries" +
            (parsed.userName ? " (" + parsed.userName + "'s export)" : "") + " — importing…";
          KOS.mediadb.bulkUpsert(parsed.entries, replaceOpts(mode, parsed.module, "import"), function (err, res) {
            if (err) { xmlStatus.textContent = "Import failed: " + err.message; return; }
            xmlStatus.textContent = "Imported: " + doneWording(res) + ". Skeleton data only — run the enrichment below to fill covers and genres.";
            KOS.ui.toast("XML import complete.");
            renderEnrich();
          });
        });
      };
      reader.readAsText(f);
      file.value = "";
    } });
    var dedupStatus = el("p", { class: "k-sy-status", "data-ui": "sync.dedupe-status" });
    var dedupBtn = el("button", { type: "button", class: "k-btn", text: "Scan for duplicates", onclick: function () {
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
    middle.appendChild(card({
      title: "Zero-setup fallback", tag: "Import a MAL or AniList XML export, or merge duplicates.",
      note: "AniList → Settings → Apps → Export gives a MAL-format XML file (anime or manga — manga lands in Books). No login or token needed. The ids inside are MAL ids; enrichment below backfills the AniList ids so later syncs match these rows instead of duplicating. Imports carry no covers or genres — enrichment fills those too. Replace mode only sweeps entries that themselves arrived by XML import — synced and hand-made entries are out of its reach. Scan for duplicates merges entries sharing an external id — or sharing a title where one copy is missing its id — into one, keeping the union of everything you added yourself; ambiguous cases (same title, different ids) are left untouched."
    }, [
      el("div", { class: "k-sy-body" }, [
        file,
        xmlMode.root,
        el("div", { class: "k-sy-actions" }, [
          el("button", { type: "button", class: "k-btn", "data-ui": "sync.xml-import", text: "⇪ XML import", onclick: function () { file.click(); } }),
          dedupBtn
        ]),
        xmlStatus,
        dedupStatus
      ])
    ]));
    KOS.mediadb.getKV("maint.dedupe3h", function (e0, rep) {
      if (!rep || dedupStatus.textContent) return;
      dedupStatus.textContent = "One-time repair ran " + new Date(rep.ts).toLocaleString() + ": " +
        (rep.removed
          ? "merged " + rep.titles.length + " duplicated title" + (rep.titles.length === 1 ? "" : "s") +
            ", removed " + rep.removed + " redundant row" + (rep.removed === 1 ? "" : "s") + " — " + rep.titles.join(" · ")
          : "no duplicates found.");
    });

    /* ================= 6 · public enrichment ================= */
    var enrichBody = el("div", { class: "k-sy-enrich" });
    page.appendChild(card({
      title: "Enrichment", tag: "Covers & metadata · no login",
      note: "For entries that arrived via XML, were linked by hand, or lost their art: public batched queries — 50 ids a call, paced to each API's limits (AniList 30 req/min; VNDB 200 req/5 min), with automatic backoff if they say slow down."
    }, [enrichBody]));

    function enrichShell(label) {
      var body = el("div", { class: "k-sy-enrich-block", "data-ui": "sync.enrich" }, [el("b", { class: "k-sy-enrich-h", text: label })]);
      return body;
    }
    function enrichRun(body, label, needy, noun, runner) {
      var bar = el("div", { class: "k-bar", "data-ui": "sync.enrich-bar", role: "img", "aria-label": "Enrichment progress" }, [el("i")]);
      var note = el("p", { class: "k-muted k-sy-small", text: needy.length + " entries are missing " + noun + " (~" + Math.ceil(needy.length / 50) + " requests)." });
      var run = el("button", { type: "button", class: "k-btn k-btn--sm", text: "✦ Fill " + needy.length, "aria-label": "✦ " + label + " — fill " + noun + " (" + needy.length + ")", onclick: function () {
        run.disabled = true;
        runner({
          onProgress: function (done, total, msg) {
            bar.style.setProperty("--p", Math.round(100 * done / total) + "%");
            note.textContent = msg || ("Enriched " + done + " / " + total + "…");
          }
        }, function (err2, got, message) {
          run.disabled = false;
          note.textContent = err2
            ? err2.message + " — " + got + " entries were still enriched; run again for the rest."
            : "Done — " + got + " entries enriched.";
          if (!err2) KOS.ui.toast(message);
          renderEnrich();
        });
      } });
      body.appendChild(note);
      body.appendChild(bar);
      body.appendChild(run);
    }
    function putAll(updated, done) {
      var i = 0;
      (function step() {
        if (i >= updated.length) { done(); return; }
        KOS.mediadb.put(updated[i++], step);
      })();
    }
    /* one block per real module — the same public batch query, but a Books
       pass additionally backfills author (staff), format and volume counts,
       which the anime query doesn't carry */
    function enrichBlock(module, label) {
      var body = enrichShell(label);
      KOS.mediadb.needingEnrichment(module, function (err, needy) {
        if (err) { body.appendChild(el("p", { class: "k-muted k-sy-small", text: "Could not scan the vault: " + err.message })); return; }
        if (!needy.length) {
          body.appendChild(el("p", { class: "k-muted k-sy-small", text: "Nothing needs enrichment — every entry with an id has its cover and genres." }));
          return;
        }
        enrichRun(body, label, needy, "covers & genres", function (hooks, done) {
          /* partition by which identity we hold: synced rows carry AniList
             ids, XML rows carry MAL ids (queried via idMal_in) */
          var spec = { anilist: [], mal: [] };
          needy.forEach(function (e) {
            if (e.externalIds.anilistId) spec.anilist.push(e.externalIds.anilistId);
            else spec.mal.push(e.externalIds.malId);
          });
          KOS.anilist.enrich(spec, module, hooks, function (err2, records) {
            var byAni = {}, byMal = {};
            records.forEach(function (r) {
              if (r.anilistId) byAni[r.anilistId] = r;
              if (r.malId) byMal[r.malId] = r;
            });
            /* apply whatever arrived, even on a mid-run failure — and
               backfill BOTH ids so future syncs match these rows */
            putAll(needy.map(function (e) {
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
            }).filter(Boolean), function () { done(err2, records.length, "Enrichment complete."); });
          });
        });
      });
      return body;
    }
    /* VN enrichment goes to VNDB, not AniList: fills cover, developer and
       tag-derived genres for entries the user linked by typing a VNDB id */
    function vnEnrichBlock() {
      var body = enrichShell("Visual Novels");
      KOS.mediadb.needingEnrichment("vn", function (err, needy) {
        if (err) { body.appendChild(el("p", { class: "k-muted k-sy-small", text: "Could not scan the vault: " + err.message })); return; }
        if (!needy.length) {
          body.appendChild(el("p", { class: "k-muted k-sy-small", text: "Nothing needs enrichment — every linked entry has its cover and developer." }));
          return;
        }
        enrichRun(body, "Visual Novels", needy, "cover, developer & tags", function (hooks, done) {
          KOS.vndb.enrich(needy.map(function (e) { return e.externalIds.vndbId; }), hooks, function (err2, records) {
            var byId = {};
            records.forEach(function (r) { if (r.vndbId) byId[r.vndbId] = r; });
            putAll(needy.map(function (e) {
              var en = byId[e.externalIds.vndbId];
              if (!en) return null;
              e.coverUrl = e.coverUrl || en.coverUrl;
              e.developer = e.developer || en.developer || "";
              e.genres = e.genres.length ? e.genres : en.genres;
              e.extra = Object.assign({}, en.extra, e.extra);
              e.extra.enrichedAt = Date.now();
              return e;
            }).filter(Boolean), function () { done(err2, records.length, "VN enrichment complete."); });
          });
        });
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

    /* ================= 7 · recent activity: the push paper trail ================= */
    var wlogBody = el("div", { class: "k-sy-log" });
    page.appendChild(card({
      title: "Recent activity", tag: "Write activity · every push to AniList and VNDB",
      note: "Every automatic push of status/progress/score to AniList or VNDB lands here (newest first, last 200). Writes are last-write-wins with no conflict detection — an edit made on the site between local edits is simply overwritten by the next push, and a pull sync overwrites local list state the same way. Note: VNDB's CORS policy only allows POST/GET/OPTIONS, so the PATCH their API requires can never leave a browser page (verified 2026-07-03, again 2026-09-20) — VNDB pushes therefore go through the server relay, which needs you signed in to cloud sync and a token with “modify my list” ticked."
    }, [wlogBody]));
    function logRow(r) {
      var d = new Date(r.ts);
      var when = d.toDateString() === new Date().toDateString()
        ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : d.toLocaleDateString(undefined, { day: "numeric", month: "short" });
      var row = el("div", { class: "k-sy-log-row", "data-ui": "sync.log-row" }, [
        el("span", { class: "k-mono k-muted", title: d.toLocaleString(), text: when }),
        el("b", { text: r.service === "vndb" ? "VNDB" : "AniList" }),
        el("span", { class: "k-sy-log-what" }, [
          el("span", { text: (r.title || ("entry #" + r.entryId)) + " · " + (r.fields || []).join(", ") }),
          r.ok ? null : el("span", { class: "k-sy-log-err", text: " — " + (r.error || "failed") })
        ].filter(Boolean)),
        el("span", { class: "k-sy-log-mark", "aria-label": r.ok ? "Pushed" : "Failed", text: r.ok ? "✓" : "✕" })
      ]);
      if (!r.ok) KOS.ui.state(row, "failed", true);
      return row;
    }
    function renderWriteLog() {
      wlogBody.innerHTML = "";
      KOS.mediapush.getLog(function (err, log) {
        if (err) { wlogBody.appendChild(el("p", { class: "k-muted", text: "Could not read the log: " + err.message })); return; }
        if (!log.length) {
          wlogBody.appendChild(el("p", { class: "k-muted k-sy-small", text: "No pushes yet — edit a synced entry's status, progress or score and it will appear here." }));
          return;
        }
        log.slice(0, 8).forEach(function (r) { wlogBody.appendChild(logRow(r)); });
        if (log.length > 8) {
          wlogBody.appendChild(el("details", { class: "k-sy-history", "data-ui": "sync.history" }, [
            el("summary", { text: "Older pushes · " + (Math.min(log.length, 30) - 8) }),
            el("div", {}, log.slice(8, 30).map(logRow)),
            log.length > 30 ? el("p", { class: "k-muted k-sy-small", text: "Showing the 30 most recent of " + log.length + " logged pushes." }) : null
          ].filter(Boolean)));
        }
      });
    }
    renderWriteLog();
  };

  /* one Sync card (frame 11i): badge, title, tag and status pill over the
     body, with its note revealed by the page's "How this works" */
  function card(o, children) {
    var badge = o.badge ? el("span", { class: "k-sy-badge", "aria-hidden": "true", text: o.badge }) : null;
    if (badge && o.accent) badge.style.setProperty("--vh-accent", o.accent);
    return el("section", { class: "k-sy-card" + (o.className ? " " + o.className : ""),
      "data-ui": "sync.panel" + (o.provider ? " sync.provider" : ""), "aria-label": o.title }, [
      el("div", { class: "k-sy-head" }, [
        badge,
        el("div", { class: "k-sy-titles" }, [
          el("h2", { class: "k-sy-title", text: o.title }),
          o.tag ? el("span", { class: "k-sy-tag", text: o.tag }) : null
        ].filter(Boolean)),
        o.pill || null
      ].filter(Boolean)),
      o.note ? el("p", { class: "k-sy-note", "data-ui": "sync.info", text: o.note }) : null
    ].filter(Boolean).concat(children));
  }
  function setPill(pill, connected) {
    pill.textContent = connected ? "● Connected" : "Not connected";
    pill.setAttribute("data-tone", connected ? "ok" : "off");
  }
})();
