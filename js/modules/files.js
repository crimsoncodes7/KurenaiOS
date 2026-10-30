/* Kurenai OS — modules/files.js · KOS.views.files, KOS.filesUI
   The Files page (files plan §8, decision F: Archive › Files) and the
   shared file dialogs: "Attach to…" and "Where it's linked".

   Every file you have added, wherever it was added — a topic's Files tab,
   an assignment, the Paper library, a paste, a drop, a scan, a share —
   from ONE index (KOS.files), searched by name and by the text inside
   PDFs, filtered by subject, kind, where it's linked and "has my
   writing", recent first, as a grid or a list (per device,
   state.ui.files). Files dropped or pasted on the page are added
   unlinked; "Attach to…" links them (invariant 150).

   The page only READS when drawn (smoke56): adding, linking, freeing and
   deleting are clicks.                                                   */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  function el() { return KOS.ui.el.apply(null, arguments); }
  function F() { return KOS.files; }
  function size(b) { return b >= 1048576 ? (b / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round((b || 0) / 1024)) + " KB"; }
  function day(ts) { return ts ? new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : ""; }
  function prefs() {
    var ui = KOS.store.state.ui;
    if (!ui.files || typeof ui.files !== "object") ui.files = {};
    var p = ui.files;
    if (p.view !== "list" && p.view !== "grid") p.view = "grid";
    return p;
  }
  var SUBJ = { compsci: "CS", maths: "Maths", it: "IT", code: "Code", ja: "Japanese" };
  var LINKED = [["", "Linked anywhere"], ["none", "Not linked"], ["topic", "To a topic"], ["assignment", "To an assignment"], ["exam", "To an assessment"], ["paper", "Past papers"]];

  /* ---------------- "Attach to…" (invariant 150: a link, never a copy) ---------------- */
  function attachTo(fileId, after) {
    var r = F().get(fileId);
    if (!r || r.store !== "files") { KOS.ui.toast("Past papers stay in the Paper library; keep one in your cloud to link it elsewhere."); return; }
    KOS.inkUI.dialog({ title: "Attach “" + r.name + "” to…", className: "k-files-attachdlg", hook: "files.attach-to", render: function (body, close) {
      function link(l, label) {
        KOS.attach.addLink(r.fileId, l, function (err) {
          close();
          KOS.ui.toast(err ? "That didn't work — " + err.message : "Linked to " + label + ". It's one file in two places, not a copy.", !!err);
          if (after) after();
        });
      }
      body.appendChild(el("p", { class: "k-drill-p", text: "A link, not a copy: the file stays one file, and removing it from one place keeps it everywhere else." }));
      if (typeof KOS.topicPicker === "function") {
        var tp = KOS.topicPicker({ label: "A topic", multi: false, levels: ["leaf"], value: [], onChange: function (refs) {
          var k = (refs || [])[0];
          if (k) link({ kind: "topic", id: k }, F().linkLabel({ kind: "topic", id: k }));
        } });
        body.appendChild(tp.el);
      }
      var open = (KOS.assignments && KOS.assignments.all ? KOS.assignments.all() : []).filter(function (a) { return a.status !== "complete"; }).slice(0, 40);
      if (open.length) {
        var sa = el("select", { class: "k-select", "aria-label": "An assignment", "data-ui": "files.attach-asg" },
          [el("option", { value: "", text: "An assignment…" })].concat(open.map(function (a) { return el("option", { value: String(a.id), text: a.title + (a.due ? " · due " + a.due : "") }); })));
        sa.addEventListener("change", function () { if (sa.value) link({ kind: "assignment", id: sa.value }, "the assignment"); });
        body.appendChild(el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "An assignment" }), sa]));
      }
      var ex = (KOS.exams && KOS.exams.all ? KOS.exams.all() : []).slice(0, 60);
      if (ex.length) {
        var se = el("select", { class: "k-select", "aria-label": "An assessment", "data-ui": "files.attach-exam" },
          [el("option", { value: "", text: "An assessment…" })].concat(ex.map(function (a) { return el("option", { value: String(a.id), text: a.title + (a.date ? " · " + a.date : "") }); })));
        se.addEventListener("change", function () { if (se.value) link({ kind: "exam", id: se.value }, "the assessment"); });
        body.appendChild(el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "An assessment" }), se]));
      }
    } });
  }
  /* "Where it's linked": each place, with Open and, for a link, Remove */
  function where(r, after) {
    if (typeof r === "string") r = F().get(r);
    if (!r) return;
    KOS.inkUI.dialog({ title: "Where “" + r.name + "” is linked", className: "k-files-wheredlg", hook: "files.where", render: function (body, close, foot) {
      if (!r.links.length) body.appendChild(el("p", { class: "k-drill-p", text: "Nowhere yet: it's in Files only. Attach it to a topic, an assignment or an assessment." }));
      var ul = el("ul", { class: "k-files-where" });
      r.links.forEach(function (l) {
        ul.appendChild(el("li", {}, [
          el("span", { class: "k-files-where-t", text: F().linkLabel(l) }),
          el("button", { type: "button", class: "k-btn k-btn--sm", text: "Open", onclick: function () { close(); var pv = document.querySelector(".k-pv"); if (pv && pv.close) pv.close(); F().openLink(l); } }),
          r.store === "files" && l.kind !== "paper" ? el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "files.unlink", text: "Remove link", onclick: function () {
            KOS.attach.removeLink(r.fileId, l, function (err) { close(); KOS.ui.toast(err ? "That didn't work." : "Link removed; the file stays in Files.", !!err); if (after) after(); });
          } }) : null
        ].filter(Boolean)));
      });
      body.appendChild(ul);
      if (r.aliases && r.aliases.length) body.appendChild(el("p", { class: "k-muted", text: "Also added as: " + r.aliases.join(", ") }));
      if (r.store === "files") foot.appendChild(el("button", { type: "button", class: "k-btn", text: "Attach to…", onclick: function () { close(); attachTo(r.fileId, after); } }));
      foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", text: "Done", onclick: close }));
    } });
  }
  function setKind(r, after) {
    KOS.inkUI.dialog({ title: "What kind of file is it?", className: "k-files-kinddlg", hook: "files.kind", render: function (body, close) {
      F().KINDS.forEach(function (k) {
        body.appendChild(el("button", { type: "button", class: "k-btn k-files-kindbtn", "aria-pressed": String(r.kind === k), text: F().KIND_NAME[k], onclick: function () {
          KOS.attach.setKind(r.fileId, k, function () { close(); if (after) after(); });
        } }));
      });
    } });
  }
  function rename(r, after) {
    KOS.inkUI.dialog({ title: "Rename", className: "k-files-renamedlg", hook: "files.rename", render: function (body, close, foot) {
      var input = el("input", { type: "text", class: "k-input", "aria-label": "Filename" });
      input.value = r.name;
      body.appendChild(input);
      foot.appendChild(el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: close }));
      foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", text: "Save", onclick: function () {
        var v = input.value.trim();
        if (!v) { KOS.ui.toast("A file needs a name.", true); return; }
        KOS.attach.rename(r.id, v, function (err) { close(); if (err) KOS.ui.toast("Rename failed: " + err.message, true); else if (after) after(); });
      } }));
      setTimeout(function () { input.focus(); input.select(); }, 30);
    } });
  }
  function download(r) {
    F().blobOf(r, function (err, b) {
      if (err || !b) { if (r.store === "files" && !r.hasBlob) F().cloudOnly(r); else KOS.ui.toast("That file is not readable here.", true); return; }
      KOS.inkExport.deliver(b, r.name);
    });
  }
  function share(r) {
    F().blobOf(r, function (err, b) { if (b) KOS.attach.share({ blob: b, name: r.name, mime: r.mime }); });
  }
  function remove(r, after) {
    if (r.store === "papers") {
      KOS.ui.confirm({ title: "Remove “" + r.name + "” from the Paper library?", body: "The copy on this device goes. Your writing on it stays in your ink; attempts you logged stay in Exams & Papers.", danger: true, confirm: "Remove" },
        function () { KOS.examPapers.remove(r.id, function () { if (after) after(); }); });
      return;
    }
    KOS.ui.confirm({ title: "Delete “" + r.name + "” everywhere?", body: r.links.length ? "It is linked to " + r.links.length + (r.links.length === 1 ? " place" : " places") + "; deleting removes it from all of them, and from your cloud. Your writing on it stays in your ink." : "It's linked nowhere. Deleting removes it from this device and your cloud.", danger: true, confirm: "Delete" },
      function () { KOS.attach.remove(r.id, function (err) { KOS.ui.toast(err ? "Delete failed." : "File deleted.", !!err); if (after) after(); }); });
  }
  function free(r, after) {
    KOS.attach.evict(r.fileId, function (err) {
      KOS.ui.toast(err ? "That didn't work." : "Freed " + size(r.size) + ". It's safe in your cloud; your writing and its text stay here.", !!err);
      if (after) after();
    });
  }
  function keepInCloud(r, after) {
    KOS.ui.confirm({ title: "Keep this paper in your cloud?", body: "A copy goes to your private storage (never the app's public site), so it opens on your other devices. Its writing syncs either way unless you keep it on this device.", confirm: "Keep in my cloud" },
      function () { KOS.examPapers.keepInCloud(r.id, function (err) { KOS.ui.toast(err ? "That didn't work — " + err.message : "Kept in your cloud. It uploads with your next sync.", !!err); if (after) after(); }); });
  }
  function actions(r, after, uploaded) {
    var items = [{ label: "Open", onSelect: function () { F().open(r); } }, { label: "Where it's linked", onSelect: function () { where(r, after); } }];
    if (r.store === "files") {
      items.push({ label: "Attach to…", onSelect: function () { attachTo(r.fileId, after); } });
      items.push({ label: "Change its kind", onSelect: function () { setKind(r, after); } });
      items.push({ label: "Rename", onSelect: function () { rename(r, after); } });
    }
    items.push({ sep: true });
    items.push({ label: "Download", onSelect: function () { download(r); } });
    if (navigator.share) items.push({ label: "Share", onSelect: function () { share(r); } });
    if (r.store === "papers" && r.local && !r.folder) items.push({ label: "Keep in my cloud", onSelect: function () { keepInCloud(r, after); } });
    if (r.store === "files" && r.hasBlob && uploaded && uploaded[r.fileId]) items.push({ label: "Free up space on this device", onSelect: function () { free(r, after); } });
    items.push({ sep: true });
    items.push({ label: r.store === "papers" ? "Remove from the library" : "Delete everywhere", onSelect: function () { remove(r, after); } });
    return items;
  }

  /* ---------------- the page ---------------- */
  KOS.views.files = function (main) {
    var p = prefs(), q = "", subj = "", kind = "", linked = "", inkOnly = false, uploaded = {};
    var fileIn = el("input", { type: "file", multiple: "", class: "sr-only", tabindex: "-1", "aria-hidden": "true", "data-ui": "files.input", onchange: function () {
      var fs = [].slice.call(fileIn.files || []);
      fileIn.value = "";
      if (fs.length) F().add(fs, {}, function (err, res) { F().report(res); });
    } });
    var addBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "files.add", text: "⇪ Add files", onclick: function () { fileIn.click(); } });
    var scanBtn = KOS.fileScan ? el("button", { type: "button", class: "k-btn", "data-ui": "files.scan", text: "◫ Scan pages", onclick: function () {
      KOS.fileScan.open({ onDone: function (file) { F().add([file], { kind: "worksheet" }, function (err, res) { F().report(res); }); } });
    } }) : null;
    main.appendChild(KOS.ui.pageHeader({ kicker: "Archive · 紙", title: "Files", sub: "Every file you've added, in one place — search the names and the text inside them.", actions: [scanBtn, addBtn] }));
    main.appendChild(fileIn);

    var search = el("input", { type: "search", class: "k-input k-files-search", "data-ui": "files.search", placeholder: "Search names and the text inside PDFs…", "aria-label": "Search files" });
    var subjRow = el("div", { class: "k-cluster k-files-subj", role: "group", "aria-label": "Subject" });
    var kindSel = el("select", { class: "k-select", "aria-label": "Kind", "data-ui": "files.kind-filter" }, [el("option", { value: "", text: "Every kind" })].concat(F().KINDS.map(function (k) { return el("option", { value: k, text: F().KIND_NAME[k] }); })));
    var linkSel = el("select", { class: "k-select", "aria-label": "Where it's linked", "data-ui": "files.linked-filter" }, LINKED.map(function (x) { return el("option", { value: x[0], text: x[1] }); }));
    var inkBox = el("input", { type: "checkbox", class: "k-box", "data-ui": "files.ink-filter" });
    var viewSw = el("div", { class: "k-seg", role: "group", "aria-label": "View" }, ["grid", "list"].map(function (v) {
      return el("button", { type: "button", class: "k-seg-item", "data-ui": "files.view", "data-view": v, "aria-pressed": String(p.view === v), text: v === "grid" ? "Grid" : "List", onclick: function () {
        p.view = v; KOS.store.save(); [].forEach.call(viewSw.children, function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-view") === v)); }); paint();
      } });
    }));
    var bar = el("div", { class: "k-files-bar", "data-ui": "files.bar" }, [search, subjRow, kindSel, linkSel,
      el("label", { class: "k-files-inkf" }, [inkBox, el("span", { text: "Has my writing" })]), viewSw]);
    var listEl = el("div", { class: "k-files-list", "data-ui": "files.list", "aria-live": "polite" });
    var side = el("aside", { class: "k-files-side", "aria-label": "About your files" });
    var layout = el("div", { class: "k-files", "data-ui": "files.page" }, [el("div", { class: "k-files-main" }, [bar, listEl]), side]);
    main.appendChild(layout);

    function subjBtn(id, label) {
      return el("button", { type: "button", class: "k-chip k-files-chip", "aria-pressed": String(subj === id), "data-ui": "files.subject", text: label, onclick: function () { subj = id; paintSubj(); paint(); } });
    }
    function paintSubj() {
      subjRow.innerHTML = "";
      subjRow.appendChild(subjBtn("", "All"));
      var have = {};
      F().all().forEach(function (r) { if (r.subject) have[r.subject] = true; });
      Object.keys(SUBJ).forEach(function (s) { if (have[s]) subjRow.appendChild(subjBtn(s, SUBJ[s])); });
    }
    search.addEventListener("input", KOS.ui.debounce(function () { q = search.value; F().loadText(function () { paint(); }); paint(); }, 160));
    kindSel.addEventListener("change", function () { kind = kindSel.value; paint(); });
    linkSel.addEventListener("change", function () { linked = linkSel.value; paint(); });
    inkBox.addEventListener("change", function () { inkOnly = inkBox.checked; paint(); });

    function filtered() {
      var hits = q.trim() ? F().search(q) : F().all().map(function (r) { return { rec: r }; });
      return hits.filter(function (h) {
        var r = h.rec;
        if (subj && r.subject !== subj) return false;
        if (kind && r.kind !== kind) return false;
        if (linked === "none" && r.links.length) return false;
        if (linked && linked !== "none" && !r.links.some(function (l) { return l.kind === linked; })) return false;
        if (inkOnly && !F().writing(r)) return false;
        return true;
      });
    }
    function card(h) {
      var r = h.rec, w = F().writing(r), ts = F().textState(r);
      var chips = [
        w ? el("span", { class: "k-chip", "data-tone": "bloom", "data-ui": "files.has-ink", text: "✎ " + w + (w === 1 ? " page" : " pages") }) : null,
        r.store === "files" && !r.hasBlob ? el("span", { class: "k-chip", "data-tone": "muted", text: r.evicted ? "☁ freed · in your cloud" : "☁ on another device" }) : null,
        r.store === "papers" && r.local ? el("span", { class: "k-chip", "data-tone": "muted", title: "Past papers stay on this device unless you keep one in your cloud", text: "This device only" }) : null,
        ts === "queued" ? el("span", { class: "k-chip", "data-tone": "muted", "data-ui": "files.indexing", text: "Indexing…" }) : null
      ].filter(Boolean);
      var where = r.links.length ? r.links.slice(0, 2).map(F().linkLabel).join(" · ") + (r.links.length > 2 ? " +" + (r.links.length - 2) : "") : "Not linked";
      var node = el("article", { class: "k-files-item", "data-ui": "files.item", "data-kind": r.kind }, [
        el("button", { type: "button", class: "k-files-open", "data-ui": "files.open", "aria-label": "Open " + r.name, onclick: function () { F().open(r); } }, [
          el("span", { class: "k-att-badge k-files-badge", "data-kind": F().badge(r), "aria-hidden": "true", text: F().badge(r) }),
          el("span", { class: "k-files-txt" }, [
            el("span", { class: "k-files-name", text: r.name, title: r.name }),
            el("span", { class: "k-files-meta", text: [F().KIND_NAME[r.kind] || "File", size(r.size), day(r.added)].filter(Boolean).join(" · ") }),
            el("span", { class: "k-files-where-l", text: where }),
            h.where === "text" ? el("span", { class: "k-files-snip", "data-ui": "files.snippet" }, [el("b", { class: "k-mono", text: "p." + h.page + " " }), h.snippet]) : null
          ].filter(Boolean))
        ]),
        el("div", { class: "k-files-foot" }, [el("div", { class: "k-cluster" }, chips),
          KOS.ui.menu({ label: "⋯", className: "k-btn--sm k-btn--quiet", align: "end", hint: "More for " + r.name, items: actions(r, refresh, uploaded) })])
      ]);
      return node;
    }
    function paint() {
      listEl.innerHTML = "";
      listEl.setAttribute("data-view", p.view);
      var all = F().all();
      KOS.ui.state(layout, "empty", !all.length);
      if (!all.length) { listEl.appendChild(emptyPage()); return; }
      var rows = filtered();
      if (!rows.length) { listEl.appendChild(KOS.ui.emptyState({ compact: true, title: "Nothing matches", body: q ? "No name or text matches “" + q + "”." + (indexingLeft() ? " Some files are still being indexed." : "") : "Try another filter." })); return; }
      rows.slice(0, 300).forEach(function (h) { listEl.appendChild(card(h)); });
    }
    /* no files yet (frame 34c, built from the app's parts): the spot, then
       every way a file arrives as a card the width of the page — the ones
       that act are buttons, the rest say where to go */
    function emptyPage() {
      function way(mark, title, body, act, hook) {
        var kids = [el("span", { class: "k-files-way-mark", "aria-hidden": "true", text: mark }),
          el("span", { class: "k-files-way-t" }, [el("b", { text: title }), el("span", { class: "k-muted", text: body })])];
        return act ? el("button", { type: "button", class: "k-files-way", "data-ui": hook, onclick: act }, kids)
          : el("div", { class: "k-files-way", "data-ui": hook }, kids);
      }
      return el("div", { class: "k-files-empty", "data-ui": "files.empty" }, [
        el("div", { class: "k-files-empty-hero" }, [
          el("img", { class: "k-files-empty-art", src: "assets/app/img/app.empty.files.webp", alt: "", loading: "lazy", "aria-hidden": "true" }),
          el("div", {}, [el("h2", { class: "k-files-empty-title", text: "No files yet" }),
            el("p", { class: "k-soft", text: "Worksheets, handouts, mark schemes, notes and photos, in one place. Every file you add is searched by its name and the text inside it, and can be linked to a topic, an assignment or an exam." })])
        ]),
        el("div", { class: "k-files-ways" }, [
          way("⇪", "Add files", "Choose PDFs, pictures or documents from this device.", function () { fileIn.click(); }, "files.way-add"),
          KOS.fileScan ? way("◫", "Scan pages", "Use the camera: drag the four corners, and the pages are straightened into one PDF.", function () { scanBtn.click(); }, "files.way-scan") : null,
          way("⤓", "Drop here", "Drag files from anywhere onto this page.", null, "files.way-drop"),
          way("⌘", "Paste", "Paste a screenshot or a copied file (⌘V) while this page is open.", null, "files.way-paste"),
          way("❖", "A topic's Files tab", "Files dropped on a topic are linked to it and listed here too.", null, "files.way-topic"),
          way("✎", "An assignment", "Briefs and drafts attached to an assignment.", function () { KOS.show("assignments"); }, "files.way-assignment"),
          way("試", "Exams' Library", "Past papers and mark schemes, matched to their papers.", function () { KOS.show("exams", { tab: "practice", sub: "library" }); }, "files.way-library"),
          way("↗", "Share to KurenaiOS", "From another app's share sheet (Chrome on Android and desktop).", null, "files.way-share")
        ].filter(Boolean))
      ]);
    }
    function indexingLeft() { return F().all().filter(function (r) { return F().textState(r) === "queued"; }).length; }
    function paintSide() {
      side.innerHTML = "";
      var all = F().all(), bytes = 0, kinds = {};
      if (!all.length) return;     /* the empty page takes the width and shows every way in itself */
      all.forEach(function (r) { if (r.hasBlob) bytes += r.size || 0; kinds[r.kind] = (kinds[r.kind] || 0) + 1; });
      var inked = all.filter(function (r) { return F().writing(r); }).length, unlinked = all.filter(function (r) { return !r.links.length; }).length, left = indexingLeft();
      side.appendChild(el("section", { class: "k-card k-files-facts", "data-ui": "files.facts" }, [
        el("div", { class: "k-card-title", text: "Your files" }),
        el("dl", { class: "k-files-dl" }, [
          ["Files", String(all.length)], ["On this device", size(bytes)], inked ? ["With your writing", String(inked)] : null,
          unlinked ? ["Not linked anywhere", String(unlinked)] : null, left ? ["Still indexing", String(left)] : null
        ].filter(Boolean).reduce(function (a, x) { return a.concat([el("dt", { text: x[0] }), el("dd", { class: "k-mono", text: x[1] })]); }, [])),
        el("button", { type: "button", class: "k-link", "data-ui": "files.storage-link", text: "Storage and space ›", onclick: function () { KOS.show("storage"); } })
      ]));
      side.appendChild(el("section", { class: "k-card k-files-facts" }, [
        el("div", { class: "k-card-title", text: "Getting files in" }),
        el("ul", { class: "k-files-howto" }, [
          "Drop files anywhere on this page, a topic's Files tab, an assignment or an assessment.",
          "Paste a screenshot here (⌘V).",
          KOS.fileScan ? "Scan pages with the camera: drag the four corners, and it straightens them into one PDF." : null,
          "Share to KurenaiOS from other apps (Chrome on Android and desktop).",
          "Past papers come in through Exams & Papers › Library."
        ].filter(Boolean).map(function (t) { return el("li", { text: t }); }))
      ]));
    }
    function refresh() { F().refresh(function () { paintSubj(); paint(); paintSide(); }); }

    /* drop and paste (files plan §6): added unlinked */
    F().dropTarget(layout, null, function () { /* the index event repaints */ });
    function onPaste(e) {
      if (!layout.isConnected) { document.removeEventListener("paste", onPaste); return; }
      var t = e.target;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA)$/.test(t.tagName))) return;
      var fs = [].slice.call((e.clipboardData && e.clipboardData.files) || []);
      if (!fs.length) return;
      e.preventDefault();
      F().add(fs.map(function (f) { return F().named(f); }), {}, function (err, res) { F().report(res); });
    }
    document.addEventListener("paste", onPaste);
    function onIndex() { if (!layout.isConnected) { window.removeEventListener("kos-files-index", onIndex); return; } paintSubj(); paint(); paintSide(); }
    window.addEventListener("kos-files-index", onIndex);
    if (KOS.cloudsync && KOS.cloudsync.uploadedFiles) KOS.cloudsync.uploadedFiles(function (err, u) { uploaded = u || {}; });

    F().ready(function () { paintSubj(); paint(); paintSide(); });
    /* something shared to the app lands here (Web Share Target) */
    F().takeShared();
  };

  KOS.filesUI = { attachTo: attachTo, where: where, actions: actions, free: free, size: size };
})();
