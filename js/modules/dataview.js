/* Kurenai OS — modules/dataview.js
   Backup & Restore (Graphite step 8, frames 14a, 14a2): Keep it safe, what a backup
   covers, the checkpoints, and Reset everything (KOS.resetEverything).
   Split out of hub.js (W8, the quality audit's AP-09); the shared
   derivations, the spine and the spec renderers stay in hub.js and
   reach this file through KOS.hub._. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store, H = KOS.hub._;
  var SUBJECTS = H.SUBJECTS, esc = H.esc, hideTree = H.hideTree, sectionStats = H.sectionStats, subjectStats = H.subjectStats, tone = H.tone;

  /* ---------- Backup & Restore (Graphite step 8, frames 14a, 14a2) ----------
     "Keep it safe" — the last backup from THIS device and the three
     export/import actions — beside the Account & Cloud Sync card; what a
     backup covers, with the counts as they stand; and Reset everything as
     its own danger strip, which asks for the word RESET. Rendering reads
     only: the counts come from the stores that own them, the size from
     the browser's storage estimate. The one write here is the export
     noting when it ran (ui.lastBackupAt — per device, like all of ui). */
  function mb(bytes) { return KOS.ui.bytes(bytes); }
  function agoWords(ts) {
    var days = Math.floor((Date.now() - ts) / 864e5);
    return days <= 0 ? "today" : days === 1 ? "yesterday" : days + " days ago";
  }
  function plural(n, one, many) { return KOS.ui.num(n) + " " + (n === 1 ? one : (many || one + "s")); }
  function arrLen(v) { return Array.isArray(v) ? v.length : v && typeof v === "object" && Array.isArray(v.items) ? v.items.length : 0; }

  KOS.views.data = function (main) {
    hideTree();
    var s = store.state;
    main.appendChild(KOS.ui.pageHeader({ kicker: "The archive · 蔵", title: "Backup & Restore",
      sub: "Everything KurenaiOS knows lives on this device first. Keep a copy, move it, or start again." }));

    /* ---- keep it safe ---- */
    var last = s.ui && s.ui.lastBackupAt;
    var sizeFact = el("b", { class: "k-bk-fact-v", text: "—" });
    var cloudFact = el("b", { class: "k-bk-fact-v", text: cloudWord() });
    function cloudWord() {
      if (!KOS.cloud || !KOS.cloud.configured || !KOS.cloud.configured()) return "not set up";
      if (!KOS.cloud.userId || !KOS.cloud.userId()) return "signed out";
      var st = KOS.cloudsync ? KOS.cloudsync.getStatus() : null;
      return st ? ({ synced: "on", syncing: "syncing…", pending: "changes pending", offline: "offline", error: "needs attention" }[st.state] || st.state) +
        (st.lastSyncAt ? " · " + agoWords(st.lastSyncAt).replace("today", clockOf(st.lastSyncAt)) : "") : "on";
    }
    function clockOf(ts) { return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); }
    /* the fact follows the engine while it is on screen (sync starts after boot) */
    if (KOS.cloudsync && KOS.cloudsync.onStatus) KOS.cloudsync.onStatus(function () { if (cloudFact.isConnected) cloudFact.textContent = cloudWord(); });
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(function (e) { if (e && e.usage) sizeFact.textContent = mb(e.usage); else sizeFact.textContent = "unknown"; })
        .catch(function () { sizeFact.textContent = "unknown"; });
    } else sizeFact.textContent = "unknown";

    var exportBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Export full backup (.json)",
      onclick: function () {
        exportBtn.disabled = true;
        exportBtn.textContent = "Exporting…";
        store.exportFull(function (err, info) {
          exportBtn.disabled = false;
          exportBtn.textContent = "Export full backup (.json)";
          if (err) { KOS.ui.toast("Export error: " + err.message, true); return; }
          /* DI-09: a part that could not be read is named, never dropped in silence */
          var left = ((info && info.missing) || []).map(function (m) { return m.part; })
            .concat(((info && info.unreadable) || []).length ? [info.unreadable.length + (info.unreadable.length === 1 ? " file" : " files") + " this browser could not read"] : []);
          if (left.length) KOS.ui.toast("Backup saved without: " + left.join(", ") + ".", true);
          store.state.ui.lastBackupAt = Date.now();
          store.save();
          lastLine.textContent = "Last backup today";
          lastSub.textContent = new Date().toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + " · downloaded from this device";
        });
      }});
    var file = el("input", { type: "file", accept: ".json,application/json", hidden: "",
      onchange: function () {
        var picked = file.files[0];
        if (!picked) return;
        /* AA-11, DI-22 (quality W1): read and describe the file first, ask
           before replacing anything, and take a VERIFIED copy of this device
           before the restore runs — no verified copy, no restore */
        /* only the backup's first line is read to ask (DI-09): its files
           stay on disk until the restore takes them one at a time */
        function described(data) {
          /* a full backup carries `state`; an old v1 file IS the state */
          var stOf = data && typeof data === "object" ? (data.state || ("progress" in data ? data : null)) : null;
          if (!stOf) { file.value = ""; KOS.ui.toast("That file is not a KurenaiOS backup.", true); return; }
          var when = data.exportedAt ? new Date(data.exportedAt).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "an unknown date";
          var n = function (st) { return st && Array.isArray(st.sessions) ? st.sessions.length : 0; };
          var titles = function (x) { return Array.isArray(x) ? x.length : 0; };
          KOS.ui.confirm({ danger: true, title: "Replace everything on this device?", confirm: "Replace with this backup", mark: "替",
            body: "The backup is from " + when + ": " + n(stOf) + " sessions and " + titles(data.mediaEntries) + " Collection titles. " +
              "This device has " + n(store.state) + " sessions now. A copy of this device is saved and checked first, " +
              "and if cloud sync is on, the restored data replaces the cloud's on the next sync." },
            function () { restoreNow(picked); },
            function () { file.value = ""; });
        }
        if (KOS.backupFile) {
          KOS.backupFile.head(picked, function (err, data) { described(err ? null : data); });
          return;
        }
        var rd = new FileReader();
        rd.onerror = function () { file.value = ""; KOS.ui.toast("Could not read that file.", true); };
        rd.onload = function () { var data = null; try { data = JSON.parse(rd.result); } catch (e) {} described(data); };
        rd.readAsText(picked);
      }});
    function restoreNow(picked) {
        importBtn.disabled = true;
        importBtn.textContent = "Saving a copy first…";
        var safe = KOS.backup ? KOS.backup.checkpoint("before-import") : Promise.resolve({ ok: false, reason: "the backup store is not loaded" });
        safe.then(function (cp) {
          if (!cp.ok) {
            importBtn.disabled = false;
            importBtn.textContent = "Import backup…";
            file.value = "";
            KOS.ui.toast("Nothing was restored: a copy of this device could not be saved and checked (" + cp.reason + "). Export a backup first.", true);
            return;
          }
          importBtn.textContent = "Restoring…";
          doImport(picked);
        });
    }
    function doImport(picked) {
        store.importFull(picked, function (err, report) {
          importBtn.disabled = false;
          importBtn.textContent = "Import backup…";
          file.value = "";
          if (err) { KOS.ui.toast("Import failed: " + err.message, true); return; }
          afterRestore();
          reportToast(report);
        });
    }
    var importBtn = el("button", { type: "button", class: "k-btn", text: "Import backup…", title: "A complete restore, not a merge: the file replaces what's here",
      onclick: function () { file.click(); } });
    var lastLine = el("h2", { class: "k-bk-last", text: last ? "Last backup " + agoWords(last) : "No backup from this device yet" });
    var lastSub = el("p", { class: "k-bk-last-sub", text: last
      ? new Date(last).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + " · downloaded from this device"
      : "One file with everything in it. Large attachments make a large file; that's expected." });
    var saved = Object.keys(s.progress).length;
    var hero = el("section", { class: "k-bk-hero", "data-ui": "archive.keep", "aria-label": "Keep it safe" }, [
      el("span", { class: "k-watermark k-bk-mark", lang: "ja", "aria-hidden": "true", text: "蔵" }),
      el("div", { class: "k-kicker k-bk-kicker", text: "Keep it safe" }),
      lastLine, lastSub,
      s.ui && s.ui.lastReport ? lastReport(s.ui.lastReport) : null,
      el("div", { class: "k-bk-facts" }, [
        el("div", {}, [el("span", { class: "k-bk-fact-k", text: "Cloud sync" }), cloudFact]),
        el("div", {}, [el("span", { class: "k-bk-fact-k", text: "Stored on this device" }), sizeFact]),
        saved ? el("div", {}, [el("span", { class: "k-bk-fact-k", text: "Keeping since" }), el("b", { class: "k-bk-fact-v", text: new Date(s.created).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) })]) : null
      ].filter(Boolean)),
      el("div", { class: "k-bk-actions", "data-ui": "archive.data-action" }, [
        exportBtn, importBtn,
        el("button", { type: "button", class: "k-btn", text: "Export revision summary (print / PDF)", title: "A printable table of every spec point, its status and your notes", onclick: exportSummary }),
        file
      ])
    ]);
    var top = el("div", { class: "k-bk-top" }, [hero]);
    if (KOS.cloudui) top.appendChild(KOS.cloudui.panel());
    main.appendChild(top);

    /* ---- what a backup covers, counted now ---- */
    var covers = el("section", { class: "k-card k-bk-covers", "aria-label": "What a backup covers" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "What a backup covers" }), el("span", { class: "k-card-meta", text: "counts right now" })])
    ]);
    var coverList = el("div", { class: "k-bk-list" });
    covers.appendChild(coverList);
    function cover(mark, tone, text) {
      var count = el("span", { class: "k-bk-count" });
      coverList.appendChild(el("div", { class: "k-bk-cover" }, [
        el("span", { class: "k-bk-tile", "data-tone": tone, lang: "ja", "aria-hidden": "true", text: mark }),
        el("span", { class: "k-bk-cover-t", text: text }), count
      ]));
      return count;
    }
    function facts(bits) { return bits.filter(Boolean).join(" · "); }
    var g = s.governor || {};
    var owned = KOS.governor ? KOS.governor.catalog().filter(function (c) { return KOS.governor.owns(c.id); }).length : 0;
    var edited = Object.keys((s.edits && s.edits.topics) || {}).length, cards = Object.keys(s.srs || {}).length;
    cover("学", "teal", "Study progress, notes, edited topics and flashcard scheduling").textContent = facts([
      saved ? plural(saved, "topic") + " with progress" : null, cards ? plural(cards, "scheduled card") : null, edited ? plural(edited, "edited topic") : null]);
    cover("整", "amber", "Calendar, reminders, assignments, habits and the weekly plan").textContent = facts([
      arrLen(s.calendar && s.calendar.events) ? plural(arrLen(s.calendar.events), "event") : null,
      arrLen(s.reminders) ? plural(arrLen(s.reminders), "reminder") : null,
      arrLen(s.assignments) ? plural(arrLen(s.assignments), "assignment") : null]);
    cover("守", "gold", "Governor state: HP, gold, XP and everything you own").textContent = facts([
      KOS.governor ? "Level " + KOS.governor.levelInfo(g.xp || 0).level : null, "◆ " + KOS.ui.num(g.gold || 0), owned ? plural(owned, "item") + " owned" : null]);
    var wl = s.wishlist || {};
    cover("買", "books", "The Wishlist, its budget and purchase history").textContent = facts([
      arrLen(wl.items) ? plural(arrLen(wl.items), "item") : null,
      wl.budget && arrLen(wl.budget.history) ? plural(arrLen(wl.budget.history), "purchase") + " logged" : null]);
    cover("習", "muted", "Every study space's progress: Code, Japanese, Mind, Creatives, Exams, goals and routines");
    /* every other database the file carries, from the store registry (RC4,
       DI-14, AA-26): one row each with its count as it stands, so the list
       can never fall behind what the backup holds */
    var REG = KOS.stores ? KOS.stores.list() : [];
    REG.filter(function (r) { return r.backup; }).forEach(function (r) {
      var c = cover(r.mark, r.tone, r.label);
      c.setAttribute("data-store", r.id);
      KOS.stores.count(r.id, function (err, n) { if (!err && n) c.textContent = plural(n, r.unit[0], r.unit[1]); });
    });
    var out = REG.filter(function (r) { return !r.backup && !r.state; });
    if (out.length) covers.appendChild(el("p", { class: "k-bk-note", "data-ui": "archive.not-in-file", text: "Not in the file: " +
      out.map(function (r) { return r.label.charAt(0).toLowerCase() + r.label.slice(1) + " (" + r.why + ")"; }).join("; ") + "." }));
    covers.appendChild(el("p", { class: "k-bk-note", text: "Your sign-ins are deliberately left out (AniList, VNDB, GitHub, Google, Todoist and the cloud password): a backup file can end up in less careful places than your browser. After a restore, reconnect from Sync & Import and Connections." }));
    main.appendChild(covers);
    main.appendChild(checkpointsCard());

    /* ---- reset: its own strip, and a word to type ---- */
    main.appendChild(el("section", { class: "k-bk-danger", "aria-label": "Reset everything" }, [
      el("div", { class: "k-bk-danger-txt" }, [
        el("b", { text: "Reset everything" }),
        el("p", { text: "Clears this device back to a fresh install. Export a backup first; cloud data is not deleted, and a signed-in device syncs back down." })
      ]),
      el("button", { type: "button", class: "k-btn k-btn--danger", "data-intent": "danger", text: "Reset everything…", onclick: function () { resetDialog(exportBtn); } })
    ]));
  };

  /* ---- the checkpoints on this device (RC4) ----
     KOS.backup keeps the last five VERIFIED copies of this device, taken
     before every repair, import, restore, reset and first link. They had
     no place in the app; each row now offers Download and Restore (a
     danger confirm; a copy of the device as it is now is taken first). */
  function checkpointWords(label) {
    var l = String(label || "");
    if (l === "before-import") return "Before importing a backup";
    if (l === "before-reset") return "Before Reset everything";
    if (l === "before-restore") return "Before restoring a checkpoint";
    if (l.indexOf("repair:") === 0) {
      var id = l.slice(7), r = KOS.repairs && KOS.repairs.list ? KOS.repairs.list().filter(function (x) { return x.id === id; })[0] : null;
      return "Before the repair: " + (r ? r.title : id);
    }
    return l || "A checkpoint";
  }
  function checkpointsCard() {
    var card = el("section", { class: "k-card k-bk-checks", "data-ui": "archive.checkpoints", "aria-label": "Checkpoints on this device" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Checkpoints on this device" }), el("span", { class: "k-card-meta", text: "the last " + ((KOS.backup && KOS.backup.KEEP) || 5) })])
    ]);
    var body = el("div", { class: "k-bk-list" }, [el("p", { class: "k-bk-note", text: "Reading…" })]);
    card.appendChild(body);
    card.appendChild(el("p", { class: "k-bk-note", text: "Taken by themselves before anything replaces your data: a repair, an import, a restore, Reset everything or linking to the cloud. Each was checked against what it was taken from. They stay on this device and are not in a backup file." }));
    if (!KOS.backup || !KOS.backup.available()) { body.textContent = ""; body.appendChild(el("p", { class: "k-bk-note", text: "This browser cannot keep checkpoints." })); return card; }
    KOS.backup.list().then(function (rows) {
      body.textContent = "";
      if (!rows.length) { body.appendChild(el("p", { class: "k-bk-note", text: "None yet. One is taken by itself before anything replaces your data." })); return; }
      rows.forEach(function (r) {
        var words = checkpointWords(r.label);
        var when = new Date(r.at).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
        var sub = when + " · " + mb(r.bytes || 0);
        body.appendChild(el("div", { class: "k-bk-cover k-bk-check", "data-ui": "archive.checkpoint" }, [
          el("span", { class: "k-bk-tile", "data-tone": "teal", lang: "ja", "aria-hidden": "true", text: "控" }),
          el("span", {}, [el("span", { class: "k-bk-cover-t", text: words }), el("span", { class: "k-bk-check-sub", text: sub })]),
          el("span", { class: "k-bk-check-btns" }, [
            el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "archive.checkpoint-download", text: "Download", "aria-label": "Download: " + words + ", " + when,
              onclick: function () { KOS.backup.download(r.id).catch(function (e) { KOS.ui.toast(e.message, true); }); } }),
            el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "archive.checkpoint-restore", "data-tone": "danger", text: "Restore", "aria-label": "Restore: " + words + ", " + when,
              onclick: function () { restoreCheckpoint(r, words, when); } })
          ])
        ]));
      });
    }).catch(function (e) { body.textContent = ""; body.appendChild(el("p", { class: "k-bk-note", text: "The checkpoints could not be read (" + ((e && e.message) || e) + ")." })); });
    return card;
  }
  function restoreCheckpoint(r, words, when) {
    KOS.ui.confirm({ danger: true, mark: "戻", title: "Restore this device to " + when + "?", confirm: "Restore this checkpoint",
      body: words + ". Everything on this device is replaced by that copy. A checked copy of the device as it is now is saved first, so this can be undone the same way; if cloud sync is on, the restored data replaces the cloud's on the next sync." },
      function () {
        KOS.ui.toast("Saving a copy of this device first…");
        /* importFull re-baselines the cloud itself (noteRestore) */
        KOS.backup.restoreSafe(r.id).then(function () {
          afterRestore();
          KOS.ui.toast("Restored the checkpoint from " + when + ".", false, { label: "Details", run: function () { KOS.show("data"); } });
        }).catch(function (e) { KOS.ui.toast((e && e.message) || String(e), true); });
      });
  }

  /* data-integrity#3, assistant-archive#1: the restore says what came back,
     counted, from a backup of what date; the whole report stays on Backup &
     Restore (state.ui.lastReport, per device) */
  function dayWords(ts) { return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }); }
  function reportToast(report) {
    var head = report.from ? "Restored a backup from " + dayWords(report.from) : "Restored the backup";
    var counts = (report.counts || []).map(function (l) { return l.replace(/ \(this device had [^)]*\)/, ""); });
    KOS.ui.toast(head + (counts.length ? ": " + counts.slice(0, 3).join(", ") + (counts.length > 3 ? " and more" : "") : "") + ".", false,
      { label: "Details", run: function () { KOS.show("data"); } });
    if (report.missingSections && report.missingSections.length) KOS.ui.toast("Not restored: " + report.missingSections.join("; ") + ".", true);
  }
  function lastReport(r) {
    var when = new Date(r.at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    var title = r.kind === "link" ? "Linked to your account · " + when : "Last restore · " + when + (r.from ? " · a backup from " + dayWords(r.from) : "");
    var list = el("ul", { class: "k-bk-report-list" }, (r.lines || []).map(function (l) { return el("li", { text: l }); }));
    return el("details", { class: "k-bk-report", "data-ui": "archive.last-report", "data-kind": r.kind }, [
      el("summary", { class: "k-bk-last-sub", text: title + " — what changed" }), list,
      (r.kept || []).length ? el("p", { class: "k-bk-note", text: "Not in the file, so this device's own were kept: " + r.kept.join(", ") + "." }) : null,
      (r.missing || []).length ? el("p", { class: "k-bk-note", "data-tone": "danger", text: "Not restored: " + r.missing.join("; ") + "." }) : null,
      r.kind === "restore" ? el("p", { class: "k-bk-note", text: "If cloud sync is on, this restore became your account's copy at the next sync." }) : null
    ].filter(Boolean));
  }
  /* AA-17: a restore replaced the state and the stores in place. What this
     page load holds in memory follows before Home is drawn: the rail's
     profile card, the theme and cosmetics, the Files index, the ink index
     and every page's kept place. */
  function afterRestore() {
    try { if (KOS.governor && KOS.governor.applyCosmetics) KOS.governor.applyCosmetics(); } catch (e) { /* cosmetic */ }
    if (KOS.refreshHUD) KOS.refreshHUD();
    if (KOS.refreshRailCounters) KOS.refreshRailCounters();
    if (KOS.files && KOS.files.refresh) KOS.files.refresh(function () {});
    if (KOS.ink && KOS.ink._reset) KOS.ink._reset();
    if (KOS.view && KOS.view.forget) KOS.view.forget();
    KOS.show("home");
  }
  function resetDialog(exportBtn) {
    var input = el("input", { type: "text", class: "k-input k-bk-type", autocomplete: "off", spellcheck: "false",
      "aria-label": "Type RESET to confirm", placeholder: "RESET" });
    var go = el("button", { type: "button", class: "k-btn k-btn--danger", "data-intent": "danger", text: "Reset", disabled: "" });
    var box = el("div", { class: "k-dialog k-bk-reset", "data-ui": "ui.dialog archive.reset", role: "alertdialog" }, [
      el("span", { class: "k-bk-reset-mark", lang: "ja", "aria-hidden": "true", text: "消" }),
      el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Reset everything?" }),
      el("p", { class: "k-bk-reset-p", text: "This removes everything KurenaiOS keeps on this device: study progress, notes and schedules, the Governor, the Collection, files, Money, handwriting, Mind's Journal, Creatives' work, saved Reports and the Paper library. A checked copy of this device is saved first and kept (Archive › Storage), and your sign-ins stay. A signed-in device then takes your account's copy back down." }),
      el("label", { class: "k-field" }, [el("span", { class: "k-field-label" }, ["Type ", el("b", { class: "k-mono", text: "RESET" }), " to confirm"]), input]),
      el("div", { class: "k-bk-reset-btns" }, [
        el("button", { type: "button", class: "k-btn", text: "Export backup first", onclick: function () { overlay.close(); exportBtn.click(); } }),
        el("button", { type: "button", class: "k-btn k-bk-cancel", text: "Cancel", onclick: function () { overlay.close(); } }),
        go
      ])
    ]);
    var overlay = el("div", { class: "k-dialog-overlay", onclick: function (e) { if (e.target === overlay) overlay.close(); } }, [box]);
    overlay.close = function () { overlay.remove(); };
    input.addEventListener("input", function () { go.disabled = input.value.trim() !== "RESET"; });
    /* Enter never confirms a danger dialog (invariant 49) */
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") e.preventDefault(); });
    go.addEventListener("click", function () {
      if (input.value.trim() !== "RESET") return;
      overlay.close();
      resetEverything();
    });
    /* headless harnesses confirm through the same hook KOS.ui.confirm honours */
    if (window.__kosAutoConfirm === true) { resetEverything(); return; }
    KOS.ui.openDialog(overlay, { initialFocus: input });
  }
  /* DI-21 (RC4): Reset everything clears EVERY store of this namespace from
     the registry, not only the state document (the vault, files, Money and
     ink used to survive it and sync back up). A verified checkpoint first —
     no checkpoint, no reset — then every database but the checkpoints, the
     state, and a reload so no module keeps a cache of what went. Clearing
     the media kv's sync records (the cloud base among them) makes a
     signed-in device link again as a fresh one: it takes the account's copy
     rather than pushing an empty device's "deletions" over it. */
  function resetEverything() {
    KOS.ui.toast("Saving a copy of this device first…");
    var safe = KOS.backup ? KOS.backup.checkpoint("before-reset") : Promise.resolve({ ok: false, reason: "the backup store is not loaded" });
    return safe.then(function (cp) {
      if (!cp.ok) { KOS.ui.toast("Nothing was reset: a copy of this device could not be saved and checked (" + cp.reason + "). Export a backup first.", true); return false; }
      return new Promise(function (res) {
        (KOS.stores ? KOS.stores.clearAll : function (cb) { cb(null, []); })(function (err) {
          if (err) { KOS.ui.toast("Reset stopped part-way (" + err.message + "). Your copy is in Archive › Storage.", true); res(false); return; }
          store.reset();
          KOS.ui.toast("Fresh start.");
          if (KOS.pwa && KOS.pwa.reloadPage) KOS.pwa.reloadPage(); else window.location.reload();
          res(true);
        });
      });
    });
  }
  KOS.resetEverything = resetEverything;

  /* ---------- printable revision summary ---------- */
  var STATUS_WORD = { none: "Not started", started: "Started", paused: "Paused", done: "Completed" };
  function exportSummary() {
    var h = "<!DOCTYPE html><html lang='en-GB'><head><meta charset='utf-8'>" +
      "<title>Kurenai OS — revision summary</title><style>" +
      "body{font:13px/1.5 Georgia,serif;color:#111;margin:32px;max-width:880px}" +
      "h1{font-size:22px;border-bottom:3px solid #b3243a;padding-bottom:6px}" +
      "h2{font-size:17px;margin:28px 0 4px;color:#b3243a}" +
      "h3{font-size:13px;margin:16px 0 4px;text-transform:uppercase;letter-spacing:.08em}" +
      "table{width:100%;border-collapse:collapse;margin:4px 0 12px}" +
      "th,td{border:1px solid #bbb;padding:4px 8px;text-align:left;vertical-align:top;font-size:12px}" +
      "th{background:#f2f2f2;font-size:10.5px;text-transform:uppercase;letter-spacing:.06em}" +
      ".k-ref{font-family:monospace;white-space:nowrap}" +
      "[data-s=done]{color:#0a7a52;font-weight:700}[data-s=started]{color:#9a6d00}[data-s=paused]{color:#7a3fa0}[data-s=none]{color:#888}" +
      ".k-note{font-style:italic;color:#444}" +
      "@media print{h2{page-break-after:avoid}table{page-break-inside:auto}tr{page-break-inside:avoid}}" +
      "</style></head><body><h1>紅 Kurenai OS — revision summary · " +
      new Date().toLocaleDateString("en-GB") + "</h1>" +
      "<p>Status of every spec point, with your personal notes. Print with Ctrl/Cmd-P.</p>";
    SUBJECTS.forEach(function (sid) {
      var d = KOS_DATA[sid], s = subjectStats(sid);
      h += "<h2>" + esc(d.name) + " — " + esc(d.board) + " (" + s.done + "/" + s.total + " completed)</h2>";
      d.sections.forEach(function (sec) {
        var st = sectionStats(sid, sec);
        if (!st.total) return;
        h += "<h3>" + esc(sec.ref + " " + sec.title) + " — " + st.done + "/" + st.total + "</h3>" +
          "<table><tr><th>Ref</th><th>Topic</th><th>Status</th><th>Your notes</th></tr>";
        (function walk(n) {
          if (n.content && n.content.length) {
            var p = store.peekProgress(sid, n.ref);
            var status = (p && p.status) || "none";
            h += "<tr><td class='k-ref'>" + esc(n.ref) + "</td><td>" + esc(n.title) +
              "</td><td data-s='" + status + "'>" + STATUS_WORD[status] + "</td><td class='k-note'>" +
              esc((p && p.note) || "") + "</td></tr>";
          }
          (n.children || []).forEach(walk);
        })(sec);
        h += "</table>";
      });
    });
    h += "</body></html>";
    var w = window.open("", "_blank");
    if (!w) { KOS.ui.toast("Pop-up blocked — allow pop-ups for this page to export.", true); return; }
    w.document.write(h);
    w.document.close();
  }
})();
