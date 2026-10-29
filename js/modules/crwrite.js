/* Kurenai OS — modules/crwrite.js (KOS.crWrite)
   The Writing Desk (design 31m–31n): a distraction-free Markdown page with a word count, versions,
   the diff between two of them, and a sprint run in Focus (a word target and a timer).

   A DRAFT lives on this device only, in kurenai-os-creatives as "doc:<id>"
     { id, title, text, versions: [{at, text, words}], lesson, study, unit, ms, at }
   It is typed into freely and saved as you go (it writes only its own file). "Save to Practice Log"
   is the one step that makes a WORK (KOS.creatives.addWork, a synced record and a copy of the
   text), and from there the check; a project's draft saves as its milestone. Words written pay
   nothing by themselves (invariant 154).
   Pages: #/creatives/write (the drafts) and #/creatives/write/<id> (one draft).                 */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var SID = "creatives";
  function CR() { return KOS.creatives; }
  function F() { return KOS.creatives.files; }
  function rid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function words(t) { return CR().words(t); }
  function fmtDate(ts) { var d = new Date(ts); return d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) + " " + d.toTimeString().slice(0, 5); }

  /* ---------------- drafts ---------------- */
  function create(rec, cb) {
    var id = rid(), doc = Object.assign({ id: "doc:" + id, title: "Untitled", text: "", versions: [], at: Date.now() }, rec);
    if (!F().available()) { cb(null); return; }
    F().tx("readwrite", function (os) { os.put(doc); }, function () { cb(id); });
  }
  function load(id, cb) { F().get("doc:" + id, function (err, d) { cb(d || null); }); }
  function save(doc, cb) { doc.at = Date.now(); F().tx("readwrite", function (os) { os.put(doc); }, cb); }
  function list(cb) {
    if (!F().available()) { cb([]); return; }
    F().all(function (err, rows) { cb((rows || []).filter(function (r) { return String(r.id).indexOf("doc:") === 0; }).sort(function (a, b) { return b.at - a.at; })); });
  }
  function openStudy(lid, sid) {
    var s = CR().study(lid, sid); if (!s) return;
    create({ title: lid + "·" + sid + " " + s.t, text: s.setup || "", lesson: lid, study: sid }, function (id) {
      if (id) KOS.show("creatives", { page: "write", id: id });
    });
  }
  function openMilestone(uid, i) {
    var p = CR().project(uid); if (!p) return;
    create({ title: p.t + " · " + p.milestones[i], text: "", unit: uid, ms: i }, function (id) { if (id) KOS.show("creatives", { page: "write", id: id }); });
  }

  /* ---------------- the diff: words, longest common subsequence ---------------- */
  function diff(a, b) {
    var A = String(a || "").split(/(\s+)/), B = String(b || "").split(/(\s+)/);
    if (A.length * B.length > 4e6) return [{ op: "del", t: a }, { op: "ins", t: b }];
    var n = A.length, m = B.length, L = [];
    for (var i = 0; i <= n; i++) { L.push(new Uint16Array(m + 1)); }
    for (i = n - 1; i >= 0; i--) for (var j = m - 1; j >= 0; j--) L[i][j] = A[i] === B[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
    var out = [], push = function (op, t) { var last = out[out.length - 1]; if (last && last.op === op) last.t += t; else out.push({ op: op, t: t }); };
    i = 0; j = 0;
    while (i < n && j < m) {
      if (A[i] === B[j]) { push("same", A[i]); i++; j++; }
      else if (L[i + 1][j] >= L[i][j + 1]) { push("del", A[i]); i++; }
      else { push("ins", B[j]); j++; }
    }
    while (i < n) push("del", A[i++]);
    while (j < m) push("ins", B[j++]);
    return out;
  }
  function diffView(a, b) {
    return el("div", { class: "k-cr-diff", "data-ui": "cr.diff" }, diff(a, b).map(function (p) {
      if (p.op === "same") return document.createTextNode(p.t);
      return el(p.op === "ins" ? "ins" : "del", { class: "k-cr-diff-" + p.op, text: p.t });
    }));
  }

  /* ---------------- the drafts page ---------------- */
  function listPage(main) {
    var box = el("section", { class: "k-card k-cr-drafts", "data-ui": "cr.drafts", "aria-label": "Your drafts" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Drafts" }), el("span", { class: "k-card-meta", text: "on this device" })])
    ]);
    var rows = el("div", { class: "k-cr-draftlist", role: "list" });
    box.appendChild(rows);
    main.appendChild(el("div", { class: "k-cr-write-top" }, [
      el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "cr.draft-new", text: "＋ New draft",
        onclick: function () { create({ title: "Untitled" }, function (id) { if (id) KOS.show("creatives", { page: "write", id: id }); }); } }),
      el("p", { class: "k-muted", text: "Drafts stay on this device. Saving one to the Practice Log keeps a copy with its check." })
    ]));
    main.appendChild(box);
    list(function (docs) {
      if (!rows.isConnected) return;
      if (!docs.length) { rows.appendChild(KOS.ui.emptyState({ compact: true, mark: "文", title: "No drafts yet", body: "A study's Start opens one with its setup already written." })); return; }
      docs.forEach(function (d) {
        rows.appendChild(el("button", { type: "button", class: "k-cr-draftrow", role: "listitem", "data-ui": "cr.draft-row", onclick: function () { KOS.show("creatives", { page: "write", id: d.id.slice(4) }); } }, [
          el("span", { class: "k-cr-draftrow-t", text: d.title }),
          el("span", { class: "k-mono k-muted", text: words(d.text) + " words" }),
          el("span", { class: "k-mono k-muted", text: fmtDate(d.at) })
        ]));
      });
    });
  }

  /* ---------------- one draft ---------------- */
  function deskPage(main, id) {
    var holder = el("div", { class: "k-cr-write", "data-ui": "cr.writing-desk" });
    main.appendChild(holder);
    load(id, function (doc) {
      if (!holder.isConnected) return;
      if (!doc) { holder.appendChild(KOS.ui.emptyState({ mark: "文", title: "This draft is not on this device", body: "Drafts stay where they were written.", action: el("button", { type: "button", class: "k-btn", text: "All drafts", onclick: function () { KOS.show("creatives", { page: "write" }); } }) })); return; }
      build(holder, doc);
    });
  }
  function build(holder, doc) {
    var s = doc.lesson ? CR().study(doc.lesson, doc.study) : null, target = s && s.target ? s.target : 0;
    var proj = doc.unit != null ? CR().project(doc.unit) : null;
    var timer = null;
    var title = el("input", { class: "k-input k-cr-write-title", "data-ui": "cr.draft-title", "aria-label": "Title", value: doc.title,
      oninput: function () { doc.title = title.value.slice(0, 120) || "Untitled"; later(); } });
    var area = el("textarea", { class: "k-cr-paper", "data-ui": "cr.paper", "aria-label": "Your draft", spellcheck: "true",
      oninput: function () { doc.text = area.value; paintCount(); later(); } });
    area.value = doc.text || "";
    var count = el("span", { class: "k-cr-count k-mono", "aria-live": "off" });
    var bar = target ? el("span", { class: "k-bar k-bar--4", role: "img" }, [el("i")]) : null;
    var savedNote = el("span", { class: "k-muted k-cr-savednote", "aria-live": "polite" });
    function paintCount() {
      var n = words(area.value);
      count.textContent = n + (target ? " / " + target : "") + " words";
      if (bar) { bar.style.setProperty("--p", Math.min(100, Math.round(100 * n / target)) + "%"); bar.setAttribute("aria-label", n + " of " + target + " words"); }
    }
    function later() { clearTimeout(timer); savedNote.textContent = ""; timer = setTimeout(function () { save(doc, function () { savedNote.textContent = "Saved on this device"; }); }, 600); }
    paintCount();

    var side = el("aside", { class: "k-cr-write-side", "aria-label": "About this draft" });
    if (s) side.appendChild(el("section", { class: "k-card k-cr-brief", "data-ui": "cr.brief" }, [
      el("span", { class: "k-kicker", text: doc.lesson + "·" + doc.study + " · ≈ " + s.min + " min" }),
      el("b", { text: s.t }),
      el("dl", { class: "k-cr-study-dl" }, [el("div", {}, [el("dt", { text: "Given" }), el("dd", { text: s.give })]), el("div", {}, [el("dt", { text: "Your one variable" }), el("dd", { text: s.vary })])]),
      el("button", { type: "button", class: "k-link", text: "Open the lesson ›", onclick: function () { KOS.show("ref", { subject: SID, ref: doc.lesson }); } })
    ]));
    if (proj) side.appendChild(el("section", { class: "k-card k-cr-brief", "data-ui": "cr.brief" }, [
      el("span", { class: "k-kicker", text: "Project · milestone " + (doc.ms + 1) + " of " + proj.milestones.length }),
      el("b", { text: proj.milestones[doc.ms] }), el("p", { class: "k-muted", text: proj.brief })
    ]));
    side.appendChild(sprintCard(doc, area));
    side.appendChild(versionsCard(doc, area, later));

    var saveBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "cr.save-log",
      text: proj ? "Save as milestone " + (doc.ms + 1) : "Save to Practice Log",
      onclick: function () {
        if (!area.value.trim()) { KOS.ui.toast("Write something first: anything counts.", true); return; }
        clearTimeout(timer);
        save(doc, function () {
          var rec = { kind: "text", title: doc.title, words: words(area.value), lesson: doc.lesson || null, study: doc.study || null, track: "write", unit: doc.unit != null ? doc.unit : null, ms: doc.ms != null ? doc.ms : null };
          CR().addWork(rec, { text: area.value, doc: doc.id }, function (wid) {
            if (doc.lesson && doc.study) KOS.show("creatives", { page: "check", id: wid });
            else if (proj) { KOS.ui.toast("Milestone saved."); KOS.show("creatives", { page: "project", id: doc.unit }); }
            else { KOS.ui.toast("Saved to your Practice Log."); KOS.show("creatives", { page: "log", id: wid }); }
          });
        });
      } });
    holder.appendChild(el("div", { class: "k-cr-write-grid" }, [
      el("div", { class: "k-cr-write-main" }, [
        el("div", { class: "k-cr-write-head" }, [title]),
        area,
        el("div", { class: "k-cr-write-foot" }, [count, bar, savedNote, el("span", { class: "k-cr-grow" }), saveBtn].filter(Boolean))
      ]),
      side
    ]));
  }
  function sprintCard(doc, area) {
    var tgt = el("input", { class: "k-input k-cr-num", type: "number", min: "50", max: "3000", step: "50", value: "150", "aria-label": "Word target" });
    var mins = el("select", { class: "k-input", "aria-label": "Minutes" }, [10, 15, 20, 25].map(function (m) { return el("option", { value: String(m), text: m + " min" }); }));
    mins.value = "15";
    var running = KOS.focus && KOS.focus.state() !== "idle";
    return el("section", { class: "k-card k-cr-sprint", "data-ui": "cr.sprint" }, [
      el("span", { class: "k-kicker", text: "Sprint" }),
      el("p", { class: "k-muted", text: "A word target and a timer, run in Focus and linked to this lesson. Words pay nothing; the Focus time does." }),
      el("div", { class: "k-cr-sprint-row" }, [el("label", {}, ["Words ", tgt]), mins]),
      el("button", { type: "button", class: "k-btn", "data-ui": "cr.sprint-start", text: running ? "Focus is running" : "▶ Start a sprint", disabled: running ? "" : null,
        onclick: function () {
          if (!KOS.focus) return;
          KOS.focus.start({ mode: "custom", workMin: +mins.value, breakMin: 0, subject: SID, ref: doc.lesson || null,
            objective: "Sprint: " + (+tgt.value || 150) + " words · " + doc.title });
          KOS.rerender();
          area.focus();
        } })
    ]);
  }
  function versionsCard(doc, area, later) {
    var box = el("section", { class: "k-card k-cr-versions", "data-ui": "cr.versions" });
    function paint() {
      box.innerHTML = "";
      box.appendChild(el("div", { class: "k-cr-versions-h" }, [el("span", { class: "k-kicker", text: "Versions" }),
        el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "cr.version-save", text: "Keep this version", onclick: function () {
          var t = area.value; if (doc.versions.length && doc.versions[doc.versions.length - 1].text === t) { KOS.ui.toast("Nothing changed since the last version."); return; }
          doc.versions.push({ at: Date.now(), text: t, words: words(t) }); later(); paint(); KOS.a11y.announce("Version " + doc.versions.length + " kept.");
        } })]));
      if (!doc.versions.length) { box.appendChild(el("p", { class: "k-muted", text: "Keep a version before a rewrite, and the diff shows what the revision changed." })); return; }
      box.appendChild(el("ol", { class: "k-cr-verlist" }, doc.versions.map(function (v, i) {
        return el("li", {}, [el("span", { class: "k-mono", text: "v" + (i + 1) }), el("span", { class: "k-muted", text: fmtDate(v.at) + " · " + v.words + " words" }),
          el("button", { type: "button", class: "k-link", "data-ui": "cr.version-diff", text: "Compare with now", onclick: function () { openDiff(doc.versions[i].text, area.value, "v" + (i + 1), "now"); } })]);
      }).reverse()));
    }
    paint();
    return box;
  }
  function openDiff(a, b, la, lb) {
    var body = el("div", { class: "k-cr-diffwrap" }, [
      el("p", { class: "k-muted" }, [el("del", { class: "k-cr-diff-del", text: "struck" }), " is gone from " + la + ", ", el("ins", { class: "k-cr-diff-ins", text: "underlined" }), " is new in " + lb + "."]),
      diffView(a, b)
    ]);
    KOS.crDialog({ title: "What the revision changed · " + la + " → " + lb, body: body, wide: true });
  }

  KOS.crWrite = { list: listPage, desk: deskPage, openStudy: openStudy, openMilestone: openMilestone, diff: diff, diffView: diffView, load: load, create: create };
})();
