/* Kurenai OS — modules/storage.js · KOS.views.storage
   Settings › Storage (files plan §7, R3): what this device holds and the
   choices about it.

     · On this device: the browser's own estimate, and whether it has
       agreed to keep the data (persistent storage, invariant 39: asked
       once a library passes 200 MB, or by your press; never promised);
     · the app's own record: the state document's size against
       localStorage's room, a warning at 60%, its biggest parts and the
       store's last save (KOS.store.health, when present) — RC5;
     · by store: files, past papers, ink, the text index;
     · the biggest files, duplicates (one content, several copies), files
       linked nowhere;
     · Free up space: removes the local copy of a file that is safe in
       your cloud. The record, its text index and its ink stay
       (invariant 150); it downloads again when opened;
     · automatic upload of attachments under 25 MB (per device,
       state.ui.filesAutoUpload, on by default).

   The page only READS when drawn; freeing and uploading are clicks.     */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  function el() { return KOS.ui.el.apply(null, arguments); }
  function size(b) { return b >= 1073741824 ? (b / 1073741824).toFixed(2) + " GB" : b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(0, Math.round((b || 0) / 1024)) + " KB"; }
  function F() { return KOS.files; }

  /* the state document's measure (pure): its size as saved (the JSON text's
     length, the figure the audit quotes; browsers count the ~5 MB room in
     characters or UTF-16 units, so this is the honest middle estimate) and
     its top-level parts, biggest first */
  var NAMES = { sessions: "Session ledger", srs: "Flashcard schedules", pacing: "Weekly plan", progress: "Topic progress",
    governor: "Governor and profile", edits: "Your edits to the curriculum", code: "Code", japanese: "Japanese",
    calendar: "Calendar", notify: "Notifications", ui: "This device's choices", media: "Collection settings",
    exams: "Exams", tracker: "Exams & Papers", goals: "Goals", money: "Money", routines: "Routines",
    achievements: "Badge Wall", assistant: "Assistant", creatives: "Creatives", mind: "Mind", todo: "Reminders" };
  KOS.storageMeter = {
    QUOTA: 5 * 1024 * 1024, WARN: 60,
    measure: function (st) {
      var text = "";
      try { text = JSON.stringify(st || {}); } catch (e) { text = ""; }
      var parts = Object.keys(st || {}).map(function (k) {
        var n = 0;
        try { n = (JSON.stringify(st[k]) || "").length; } catch (e) { n = 0; }
        return { key: k, bytes: n };
      }).sort(function (a, b) { return b.bytes - a.bytes; });
      return { bytes: text.length, quota: KOS.storageMeter.QUOTA, parts: parts };
    },
    label: function (k) { return NAMES[k] || k; }
  };

  KOS.views.storage = function (main) {
    main.appendChild(KOS.ui.pageHeader({ kicker: "Settings · 庫", title: "Storage", sub: "What this device keeps, what's safe in your cloud, and room to free." }));
    var grid = el("div", { class: "k-st-grid", "data-ui": "storage.page" });
    main.appendChild(grid);
    var uploaded = {}, signed = !!(KOS.cloud && KOS.cloud.signedIn && KOS.cloud.signedIn());

    function card(title, hook, kids) {
      return el("section", { class: "k-card k-st-card", "data-ui": "storage." + hook, "aria-label": title }, [el("div", { class: "k-card-title", text: title })].concat(kids || []));
    }
    function row(label, value, extra) {
      return el("div", { class: "k-st-row" }, [el("span", { class: "k-st-row-t", text: label }), el("span", { class: "k-mono", text: value })].concat(extra ? [extra] : []));
    }
    function fileRow(r, extra) {
      return el("li", { class: "k-st-file" }, [
        el("button", { type: "button", class: "k-st-file-open", onclick: function () { F().open(r); } }, [
          el("span", { class: "k-att-badge", "data-kind": F().badge(r), "aria-hidden": "true", text: F().badge(r) }),
          el("span", { class: "k-st-file-t" }, [el("span", { class: "k-files-name", text: r.name }), el("span", { class: "k-files-meta", text: size(r.size) + " · " + (F().KIND_NAME[r.kind] || "File") })])
        ])
      ].concat(extra || []));
    }

    /* COPIES KEPT FOR YOU: saved data the app could not read and set aside
       (KOS.store.quarantines), and this device as it was before it was first
       linked to your account (KOS.cloudsync.preLinked). Nothing uses them;
       each is the size of the whole record, so each can be downloaded and
       deleted here. The card is drawn only when there is one. */
    function saveText(text, name) {
      var blob = new Blob([text], { type: "application/json" });
      if (KOS.inkExport && KOS.inkExport.deliver) { KOS.inkExport.deliver(blob, name); return; }
      var url = URL.createObjectURL(blob), a = el("a", { href: url, download: name });
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    }
    function when(at) {
      return at > 1e11 ? new Date(at).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "date not recorded";
    }
    function stamp(at) { var d = at > 1e11 ? new Date(at) : new Date(); return d.toISOString().slice(0, 10); }
    function keptCard() {
      var list = el("ul", { class: "k-st-files" });
      var box = card("Copies kept for you", "kept", [
        el("p", { class: "k-st-note", text: "The app uses none of these: each is your data from before something replaced it. Download one to keep it; delete it to free its space." }),
        list
      ]);
      box.hidden = true;
      function item(hook, title, meta, onDownload, onDelete, what) {
        var li = el("li", { class: "k-st-file", "data-ui": "storage.kept-row " + hook }, [
          el("span", { class: "k-st-file-t" }, [el("span", { class: "k-files-name", text: title }), el("span", { class: "k-files-meta", text: meta })]),
          el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "storage.kept-download", text: "Download", onclick: onDownload }),
          el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "storage.kept-delete", "data-tone": "danger", text: "Delete", onclick: function () {
            KOS.ui.confirm({ title: "Delete this copy?", danger: true, confirm: "Delete the copy",
              body: what + " It cannot be brought back; download it first if you might want it." }, function () {
              onDelete(function () { li.remove(); if (!list.children.length) box.hidden = true; });
            });
          } })
        ]);
        list.appendChild(li);
        box.hidden = false;
      }
      if (KOS.store.quarantines) KOS.store.quarantines().then(function (qs) {
        (qs || []).forEach(function (q) {
          item("storage.kept-unreadable", "Saved data the app could not read", "Set aside " + when(q.at) + " · " + size(q.bytes), function () {
            KOS.store.quarantineRead(q.key).then(function (raw) {
              if (raw == null) { KOS.ui.toast("That copy could not be read.", true); return; }
              saveText(raw, "kurenai-os-unreadable-" + stamp(q.at) + ".txt");
            });
          }, function (done) {
            KOS.store.quarantineDrop(q.key).then(function (ok) { if (ok) done(); else KOS.ui.toast("That copy could not be deleted.", true); });
          }, "The unreadable copy set aside " + when(q.at) + " will be deleted.");
        });
      }, function () { /* no list: no rows */ });
      if (KOS.cloudsync && KOS.cloudsync.preLinked) KOS.cloudsync.preLinked(function (err, rec) {
        if (err || !rec) return;
        item("storage.kept-prelink", "This device before it was linked to your account", "Kept " + when(rec.at) + " · " + size(JSON.stringify(rec.state).length * 2), function () {
          /* a plain state document: Import backup reads it */
          saveText(JSON.stringify(rec.state), "kurenai-os-before-linking-" + stamp(rec.at) + ".json");
        }, function (done) {
          KOS.cloudsync.dropPreLinked(function () { done(); });
        }, "The copy of this device from before it was linked will be deleted.");
      });
      return box;
    }

    function paint() {
      grid.innerHTML = "";
      var all = F().all(), local = all.filter(function (r) { return r.hasBlob; });
      var filesB = 0, papersB = 0;
      local.forEach(function (r) { if (r.store === "papers") { if (!r.folder) papersB += r.size || 0; } else filesB += r.size || 0; });

      /* on this device */
      var dev = card("On this device", "device", [el("p", { class: "k-st-note", text: "Measuring…" })]);
      grid.appendChild(dev);
      var est = navigator.storage && navigator.storage.estimate ? navigator.storage.estimate() : Promise.resolve(null);
      var per = navigator.storage && navigator.storage.persisted ? navigator.storage.persisted() : Promise.resolve(null);
      Promise.all([est, per]).then(function (x) {
        var e = x[0], kept = x[1];
        dev.innerHTML = "";
        dev.appendChild(el("div", { class: "k-card-title", text: "On this device" }));
        if (e && e.quota) {
          var pct = Math.min(100, Math.round(100 * e.usage / e.quota));
          var bar = el("div", { class: "k-st-meter", role: "img", "aria-label": size(e.usage) + " used of about " + size(e.quota) }, [el("span", { class: "k-st-meter-fill" })]);
          bar.firstChild.style.setProperty("--st-pct", pct + "%");
          KOS.ui.state(bar, "full", pct >= 85);
          dev.appendChild(el("p", { class: "k-st-big" }, [el("b", { class: "k-mono", text: size(e.usage) }), el("span", { class: "k-muted", text: " used of about " + size(e.quota) + " the browser allows" })]));
          dev.appendChild(bar);
        } else dev.appendChild(el("p", { class: "k-st-note", text: "This browser doesn't say how much it allows." }));
        if (kept === true) dev.appendChild(el("p", { class: "k-st-note", "data-ui": "storage.persisted", text: "✓ The browser has agreed to keep this data rather than clear it when space runs low." }));
        else if (kept === false && navigator.storage.persist) dev.appendChild(el("div", { class: "k-st-actions" }, [
          el("p", { class: "k-st-note", text: "The browser may clear this data when the device runs low on space. Ask it to keep it:" }),
          el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "storage.persist", text: "Ask to keep this data", onclick: function () {
            navigator.storage.persist().then(function (ok) { KOS.store.state.ui.persistAsked = Date.now(); KOS.store.save(); KOS.ui.toast(ok ? "The browser will keep this data." : "The browser said no for now; it decides by how you use the app.", !ok); paint(); });
          } })]));
      });

      /* the app's own record: the state document in localStorage (RC5) */
      grid.appendChild(stateCard());
      grid.appendChild(keptCard());

      /* by store */
      var by = card("By kind of data", "stores", [
        row("Files (topics, assignments, Files)", size(filesB)),
        row("Past papers (this device only)", size(papersB)),
        el("div", { class: "k-st-row", "data-ui": "storage.ink" }, [el("span", { class: "k-st-row-t", text: "Your ink" }), el("span", { class: "k-mono", text: "…" })]),
        el("div", { class: "k-st-row", "data-ui": "storage.text" }, [el("span", { class: "k-st-row-t", text: "Text index (search inside files)" }), el("span", { class: "k-mono", text: "…" })])
      ]);
      grid.appendChild(by);
      if (KOS.ink && KOS.ink.exportAll) KOS.ink.exportAll(function (err, dump) { var c = by.querySelector("[data-ui~='storage.ink'] .k-mono"); if (c) c.textContent = err || !dump ? "—" : size(JSON.stringify(dump).length); });
      F().loadText(function (err, t) {
        var n = 0; Object.keys(t || {}).forEach(function (k) { (t[k] || []).forEach(function (p) { n += p.length; }); });
        var c = by.querySelector("[data-ui~='storage.text'] .k-mono"); if (c) c.textContent = size(n * 2);
      });

      /* free up space */
      var safe = local.filter(function (r) { return r.store === "files" && uploaded[r.fileId]; }).sort(function (a, b) { return b.size - a.size; });
      var freeB = safe.reduce(function (s, r) { return s + (r.size || 0); }, 0);
      var freeKids = [];
      if (!signed) freeKids.push(el("p", { class: "k-st-note", text: "Sign in to cloud sync and your files upload to your private storage; then their copies here can be freed." }));
      else if (!safe.length) freeKids.push(el("p", { class: "k-st-note", text: "Nothing to free yet: a file's copy here can go once it's safe in your cloud." }));
      else {
        freeKids.push(el("p", { class: "k-st-note", text: safe.length + (safe.length === 1 ? " file is" : " files are") + " safe in your cloud (" + size(freeB) + "). Freeing keeps each file's record, its searchable text and your writing on it; it downloads again when you open it." }));
        freeKids.push(el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "storage.free-all", text: "Free up " + size(freeB), onclick: function () {
          KOS.ui.confirm({ title: "Free up " + size(freeB) + "?", body: "The copies on this device of " + safe.length + (safe.length === 1 ? " file" : " files") + " go; they stay in your cloud, with their text and your writing here.", confirm: "Free up space" }, function () {
            var list = safe.slice();
            (function next() { var r = list.shift(); if (!r) { KOS.ui.toast("Freed " + size(freeB) + "."); F().refresh(paint); return; } KOS.attach.evict(r.fileId, next); })();
          });
        } }));
        freeKids.push(el("ul", { class: "k-st-files" }, safe.slice(0, 8).map(function (r) {
          return fileRow(r, [el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "storage.free", text: "Free", onclick: function () { KOS.filesUI.free(r, function () { F().refresh(paint); }); } })]);
        })));
      }
      grid.appendChild(card("Free up space", "free", freeKids));

      /* sync */
      var auto = KOS.store.state.ui.filesAutoUpload !== false;
      var sw = el("input", { type: "checkbox", role: "switch", class: "k-switch", "data-ui": "storage.auto", "aria-label": "Upload files automatically" });
      sw.checked = auto;
      sw.addEventListener("change", function () { KOS.store.state.ui.filesAutoUpload = sw.checked; KOS.store.save(); if (sw.checked && KOS.cloudsync && KOS.cloudsync.autoUpload) KOS.cloudsync.autoUpload(); });
      var waiting = local.filter(function (r) { return r.store === "files" && !r.local && !uploaded[r.fileId]; });
      grid.appendChild(card("Files in your cloud", "sync", [
        el("label", { class: "k-pen-row" }, [el("span", { class: "k-pen-row-t" }, [el("strong", { text: "Upload files automatically" }),
          el("span", { class: "k-pen-row-s", text: "Attachments under 25 MB go to your private storage a few at a time after each sync, so a file added on the Mac opens on the iPad. Past papers stay on the device that added them unless you keep one in your cloud." })]), sw]),
        signed ? row(waiting.length ? "Waiting to upload" : "Everything is uploaded", waiting.length ? waiting.length + " · " + size(waiting.reduce(function (s, r) { return s + r.size; }, 0)) : "✓",
          waiting.length && KOS.cloudsync && KOS.cloudsync.uploadBinaries ? el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "storage.sync-now", text: "Upload now", onclick: function (e) {
            var b = e.currentTarget; b.disabled = true; b.textContent = "Uploading…";
            KOS.cloudsync.uploadBinaries(function (err, rep) { KOS.ui.toast(err ? "Upload failed — " + err.message : rep.uploaded + " uploaded" + (rep.failed.length ? ", " + rep.failed.length + " failed" : "") + ".", !!err); refresh(); });
          } }) : null) : el("p", { class: "k-st-note", text: "Signed out: files live on this device and in the full backup." })
      ]));

      /* biggest, duplicates, unlinked */
      var big = local.slice().sort(function (a, b) { return b.size - a.size; }).slice(0, 8);
      grid.appendChild(card("The biggest files", "biggest", big.length ? [el("ul", { class: "k-st-files" }, big.map(function (r) { return fileRow(r); }))] : [el("p", { class: "k-st-note", text: "No files on this device yet." })]));
      var groups = {};
      all.forEach(function (r) { if (r.hash) (groups[r.hash] = groups[r.hash] || []).push(r); });
      var dups = Object.keys(groups).map(function (h) { return groups[h]; }).filter(function (g) { return g.length > 1; });
      grid.appendChild(card("Duplicates", "duplicates", dups.length ? [el("p", { class: "k-st-note", text: "The same content stored more than once (past papers added from two folders, say). Keep one; the others can go." }),
        el("ul", { class: "k-st-files" }, dups.slice(0, 10).map(function (g) { return fileRow(g[0], [el("span", { class: "k-chip", "data-tone": "amber", text: "×" + g.length })]); }))]
        : [el("p", { class: "k-st-note", text: "None: a file added twice is linked, not stored twice." })]));
      var loose = all.filter(function (r) { return r.store === "files" && !r.links.length; });
      grid.appendChild(card("Not linked anywhere", "unlinked", loose.length ? [el("p", { class: "k-st-note", text: "In Files only. Attach them to a topic, an assignment or an assessment, or delete what you don't need." }),
        el("ul", { class: "k-st-files" }, loose.slice(0, 10).map(function (r) { return fileRow(r, [el("button", { type: "button", class: "k-btn k-btn--sm", text: "Attach to…", onclick: function () { KOS.filesUI.attachTo(r.fileId, refresh); } })]); }))]
        : [el("p", { class: "k-st-note", text: "Every file is linked somewhere." })]));
    }
    /* the state document's size against localStorage's room (about 5 MB on
       every browser this app runs in), its biggest parts, and how the last
       save went when the store reports it (KOS.store.health). A read only. */
    function stateCard() {
      var M = KOS.storageMeter.measure(KOS.store.state);
      var pct = Math.min(100, Math.round(100 * M.bytes / M.quota));
      var warn = pct >= KOS.storageMeter.WARN;
      var bar = el("div", { class: "k-st-meter", "data-ui": "storage.state-meter", role: "img", "aria-label": size(M.bytes) + " of about " + size(M.quota) + " (" + pct + "%)" }, [el("span", { class: "k-st-meter-fill" })]);
      bar.firstChild.style.setProperty("--st-pct", pct + "%");
      KOS.ui.state(bar, "full", warn);
      var kids = [
        el("p", { class: "k-st-big" }, [el("b", { class: "k-mono", "data-ui": "storage.state-size", text: size(M.bytes) }), el("span", { class: "k-muted", text: " of about " + size(M.quota) + " the browser keeps for it · " + pct + "%" })]),
        bar
      ];
      if (warn) kids.push(el("p", { class: "k-st-note", "data-ui": "storage.state-warn", "data-tone": "danger", text: "Over " + KOS.storageMeter.WARN + "%: the browser refuses a save once this is full. Your files, ink and Collection are elsewhere and don't count here." }));
      M.parts.slice(0, 5).forEach(function (p) { kids.push(row(KOS.storageMeter.label(p.key), size(p.bytes))); });
      var H = KOS.store.health;
      var h = typeof H === "function" ? H() : H && typeof H === "object" ? H : null;
      if (h) {
        kids.push(row("Saved to", String(h.primary || "—")));
        if (h.lastSaveOk === false || h.lastError) kids.push(el("p", { class: "k-st-note", "data-ui": "storage.state-error", "data-tone": "danger", text: "The last save failed: " + String(h.lastError || "unknown error") }));
      }
      return card("The app's own record", "state", kids);
    }
    function refresh() { F().refresh(paint); }
    if (KOS.cloudsync && KOS.cloudsync.uploadedFiles) KOS.cloudsync.uploadedFiles(function (err, u) { uploaded = u || {}; F().ready(paint); });
    else F().ready(paint);
  };
})();
