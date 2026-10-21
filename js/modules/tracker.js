/* Kurenai OS — modules/tracker.js
   Exam + practice-paper performance tracking (FR-3.4, FR-3.5).
   The two FRs specify identical columns, so this is ONE component with a
   kind discriminator ("exam" | "paper"). Entries are study evidence: adding
   one lands in the session log, and topic-linked results feed the RAG
   auto-score (js/modules/rag.js). */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var KINDS = { exam: "Exams & assessments", paper: "Practice papers & questions" };
  var SUBJ = { compsci: "Computer Science", maths: "Mathematics", it: "IT" };

  function T() { return store.state.tracker; }

  /* the record and its one normaliser live in core/tracker.js */
  var add = KOS.tracker.add, update = KOS.tracker.update, remove = KOS.tracker.remove, pct = KOS.tracker.pct;

  var HUE = { compsci: "var(--cs)", maths: "var(--maths)", it: "var(--it)" };
  var SHORT = { compsci: "CS", maths: "Maths", it: "IT" };
  function tone(p) { return p == null ? null : p >= 75 ? "var(--green)" : p >= 60 ? "var(--amber)" : "var(--red-soft)"; }
  /* the grade's own colour (review B): the letter, the 9–1 number or the
     IT Distinction/Merit/Pass scale read to a tier; anything else follows
     the score beside it */
  function gradeTier(g, p, subject) {
    var t = String(g || "").trim().toUpperCase().replace(/\s+/g, "");
    /* a bare D is Distinction on the IT scale and a D grade anywhere else */
    if (subject === "it" && t === "D") t = "DISTINCTION";
    if (subject === "it" && t === "D*") t = "DISTINCTION*";
    if (/^(A\*|DISTINCTION\*|DIST\*|9|8)$/.test(t)) return "top";
    if (/^(A|DIST|DISTINCTION|7)$/.test(t)) return "high";
    if (/^(B|M|MERIT|6|5)$/.test(t)) return "good";
    if (/^(C|P|PASS|4)$/.test(t)) return "mid";
    if (/^(D|3|2)$/.test(t)) return "low";
    if (/^(E|U|F|FAIL|NP|1)$/.test(t)) return "fail";
    return p == null ? "none" : p >= 80 ? "high" : p >= 70 ? "good" : p >= 60 ? "mid" : p >= 45 ? "low" : "fail";
  }
  function shortDate(iso) {
    if (!iso) return "—";
    var p = iso.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  /* ---------------- the log dialog (9e, redrawn as 29h) ----------------
     Quick mode, still one screen: Past paper · Topic pack · Other. A past
     paper from the index fills its title, marks, minutes and question list;
     "What do you think you got?" comes before the marks and locks once
     marks are typed (calibration stays honest); Timed with minutes; the
     assessment it prepares for (the nearest whose scope covers the paper,
     until chosen); "This IS the result of…" a past mock or real exam.
     Marks by question are a page of their own (29i), one tap away. The
     record and its one normaliser live in core/tracker.js (decision B). */
  function editorModal(kind, existing, onSaved, seed) {
    seed = seed || {};
    var X = KOS.exams, IXR = KOS.examIndex, IX = window.KOS_EXAMS && KOS_EXAMS.index;
    var overlay = el("div", { class: "k-dialog-overlay" });
    function close() { overlay.remove(); }
    overlay.close = close;
    function input(type, attrs) { return el("input", Object.assign({ type: type, class: "k-input" }, attrs || {})); }
    function f(label, control, cls, hint) {
      return el("label", { class: "k-field" + (cls ? " " + cls : "") }, [el("span", { class: "k-field-label", text: label }), control, hint ? el("span", { class: "k-trk-hint", text: hint }) : null].filter(Boolean));
    }
    var src = existing && existing.source ? Object.assign({}, existing.source) : null;
    var mode = src && src.kind === "past-paper" ? "paper" : src && (src.kind === "topic-pack" || src.kind === "pmt-pack") ? "pack" : existing ? "other" : (seed.pack ? "pack" : IX ? "paper" : "other");
    var qs = existing && existing.questions ? existing.questions.map(function (q) { return Object.assign({}, q, { tags: q.tags.slice(), refs: q.refs.slice() }); }) : [];
    var paper = input("text", { placeholder: "e.g. Paper 1 · June 2024", "aria-label": "Paper" });
    var topic = input("text", { placeholder: "e.g. Quadratics / Data structures", "aria-label": "Topic" });
    var predicted = input("number", { min: 0, "aria-label": "What do you think you got?", "data-ui": "tracker.predicted" });
    var marks = input("number", { min: 0, "aria-label": "Marks", "data-ui": "tracker.marks" });
    var max = input("number", { min: 1, "aria-label": "Out of", "data-ui": "tracker.max" });
    var grade = input("text", { placeholder: "e.g. B / 6", "aria-label": "Grade" });
    var date = input("date", { "aria-label": "Date" });
    var timed = el("input", { type: "checkbox", class: "k-switch", "data-ui": "tracker.timed", "aria-label": "Timed" });
    var tmins = input("number", { min: 1, max: 600, "aria-label": "Minutes taken", "data-ui": "tracker.mins" });
    var tminsOf = el("span", { class: "k-trk-of" });
    var cond = el("select", { class: "k-input", "aria-label": "Conditions" }, [["exam", "Exam conditions"], ["open-book", "Open book"], ["untimed", "Untimed"]].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    var isResult = el("input", { type: "checkbox", class: "k-box", "data-ui": "tracker.result" });
    var aidTouched = !!(existing && existing.assessmentId) || !!seed.assessmentId;
    var aidSel = el("select", { class: "k-input", "data-ui": "tracker.assessment", "aria-label": "Practice for", onchange: function () { aidTouched = true; syncNote(); } });
    function area(ph, label) { return el("textarea", { class: "k-input", rows: 2, placeholder: ph, "aria-label": label }); }
    var well = area("Areas that went well…", "Went well"), badly = area("Areas that didn't go well…", "Didn't go well"), notes = area("Mistakes / notes for next time…", "Mistakes / notes");
    var reviewed = el("input", { type: "checkbox", class: "k-box" });
    var subjSel = el("select", { class: "k-input", "aria-label": "Subject", onchange: function () { subjTouched = true; preview(); } },
      [el("option", { value: "", text: "No subject" })].concat(["compsci", "maths", "it"].map(function (k) { return el("option", { value: k, text: SUBJ[k] }); })));
    var subjTouched = !!(existing && existing.subject);
    var recType = el("select", { class: "k-input", "aria-label": "Record type" }, [el("option", { value: "paper", text: "Practice paper or questions" }), el("option", { value: "exam", text: "An exam or assessment" })]);
    recType.value = kind === "exam" ? "exam" : "paper";
    var refPick = KOS.topicPicker({ label: "Topics (feed RAG)", multi: true, value: existing ? KOS.tracker.refsOf(existing) : [],
      onChange: function (refs) { if (!subjTouched && refs.length) subjSel.value = KOS.spec.subjectsOf(refs)[0] || subjSel.value; preview(); guessAssessment(refs); } });

    function fillAssessments() {
      var cur = aidSel.value;
      aidSel.innerHTML = "";
      aidSel.appendChild(el("option", { value: "", text: "Nothing in particular" }));
      var t = KOS.srs.todayISO();
      (X ? X.all() : []).filter(function (a) {
        if (a.archived) return false;
        /* "This IS the result of…": past-dated mocks and real exams only */
        if (isResult.checked) return (a.tier === "mock" || a.tier === "real_exam") && a.date && a.date <= t;
        return a.tier !== "deadline";
      }).forEach(function (a) { aidSel.appendChild(el("option", { value: a.id, text: a.title + (a.date ? " · " + shortDate(a.date) : "") })); });
      aidSel.value = cur;
      if (aidSel.value !== cur) aidSel.value = "";
    }
    /* the nearest assessment whose scope covers the paper, until one is
       chosen by hand */
    function guessAssessment(refs) {
      if (aidTouched || !X || !refs || !refs.length || isResult.checked) return;
      var leaves = KOS.spec.resolve(refs);
      var hit = X.upcoming().filter(function (a) { var ls = X.leaves(a); return leaves.some(function (k) { return ls.indexOf(k) !== -1; }); })[0];
      if (hit) aidSel.value = hit.id;
    }
    /* the prediction locks once marks are typed (29h) */
    var predHint = el("span", { class: "k-trk-hint" });
    function syncPredict() {
      var locked = marks.value !== "" && (!existing || existing.predicted == null || predicted.value !== "" || existing.marks != null);
      predicted.readOnly = marks.value !== "";
      predHint.textContent = predicted.readOnly ? (predicted.value === "" ? "too late once marks are in" : "locked when you entered marks") : "before you mark it";
      return locked;
    }
    var pv = el("div", { class: "k-trk-preview", "data-ui": "tracker.preview", hidden: "" }, [el("b"), el("span")]);
    function preview() {
      var m = parseInt(marks.value, 10), x = parseInt(max.value, 10);
      syncPredict();
      if (!(x > 0) || isNaN(m)) { pv.hidden = true; return; }
      var p = Math.round(100 * Math.max(0, m) / x);
      pv.hidden = false;
      pv.style.setProperty("--c", tone(p));
      pv.firstChild.textContent = p + "%";
      var pr = parseInt(predicted.value, 10);
      if (!isNaN(pr)) pv.lastChild.textContent = "You predicted " + pr + ": " + Math.abs(m - pr) + (Math.abs(m - pr) === 1 ? " mark " : " marks ") + (m > pr ? "over" : m < pr ? "under" : "— spot on") + ". Calibration keeps the running gap.";
      else {
        var band = p >= 70 ? "green" : p >= 45 ? "amber" : "red", first = KOS.spec.firstLeaf(refPick.value());
        pv.lastChild.textContent = "Logged results count as study evidence" + (first ? " and push " + first.ref + " towards " + band + "." : ".");
      }
    }
    var ixField = el("button", { type: "button", class: "k-trk-ixfield", "data-ui": "tracker.ix-field", onclick: function () { if (mode === "pack") packPick(); else indexPick(); } });
    var ixHint = el("span", { class: "k-trk-hint" });
    function drawIx() {
      ixField.innerHTML = "";
      var label = src && src.ref ? (mode === "paper" && IXR ? (function () { var pp = IX.papers[String(src.ref).split(":")[0]]; return pp ? pp.title + " · " + IXR.sittingLabel(String(src.ref).split(":")[1]) : src.ref; })() : (paper.value || topic.value || src.ref)) : null;
      ixField.appendChild(el("span", { class: "k-trk-ixg", "aria-hidden": "true", text: mode === "pack" ? "束" : "▤" }));
      ixField.appendChild(el("span", { class: "k-trk-ixl", text: label || (mode === "pack" ? "Pick a topic pack" : "Pick board → paper → session") }));
      ixField.appendChild(el("span", { class: "k-trk-hint", text: label ? "Change" : "Open" }));
      ixHint.textContent = mode === "paper" && src && src.ref ? (max.value ? max.value + " marks · " : "") + (qs.length ? qs.length + " questions · topics per question filled in" : "") : mode === "pack" && src ? "Logged by reference; open your own copy." : "";
    }
    function applyPaper(pid, sit) {
      var fill = IXR && IXR.paperFill(pid, sit);
      if (!fill) return;
      paper.value = fill.title;
      if (!subjTouched) subjSel.value = fill.subject;
      max.value = String(fill.max);
      qs = fill.questions;
      src = { kind: "past-paper", ref: fill.ref };
      refPick.set(fill.refs);
      var pr = X && X.presets().filter(function (x) { return x.index === pid; })[0];
      if (pr && pr.mins) { tminsOf.textContent = "of " + pr.mins; if (!tmins.value) tmins.value = String(pr.mins); }
      guessAssessment(fill.refs);
      drawIx(); preview(); syncNote();
    }
    function applyPack(id) {
      var fill = IXR && IXR.packFill(id);
      if (!fill) return;
      topic.value = fill.title;
      if (!subjTouched) subjSel.value = fill.subject;
      refPick.set(fill.refs);
      src = { kind: fill.source === "pmt" ? "pmt-pack" : "topic-pack", ref: fill.ref };
      guessAssessment(fill.refs);
      drawIx(); preview(); syncNote();
    }
    /* the index, as a cascade: board → paper → session (29h) */
    function indexPick() {
      if (!IX) return;
      var o2 = el("div", { class: "k-dialog-overlay" });
      function c2() { o2.remove(); }
      o2.close = c2;
      var done = {};
      KOS.tracker.all().forEach(function (e) { if (e.source && e.source.kind === "past-paper") done[e.source.ref] = true; });
      var boards = {};
      Object.keys(IX.papers).forEach(function (k) { var p = IX.papers[k]; (boards[p.board] = boards[p.board] || []).push(k); });
      var curPid = src && src.kind === "past-paper" ? String(src.ref).split(":")[0] : Object.keys(IX.papers).filter(function (k) { return !subjSel.value || IX.papers[k].subject === subjSel.value; })[0];
      var curB = curPid ? IX.papers[curPid].board : Object.keys(boards)[0], curS = src && src.kind === "past-paper" ? String(src.ref).split(":")[1] : null;
      var search = el("input", { type: "text", class: "k-input", placeholder: "Search board, paper or session", "aria-label": "Search the index" });
      var grid = el("div", { class: "k-trk-casc", "data-ui": "tracker.cascade" });
      var info = el("div", { class: "k-trk-ixinfo" });
      var use = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Use this paper", onclick: function () { if (curPid && curS) { c2(); applyPaper(curPid, curS); marks.focus(); } } });
      function col(title, items) {
        return el("div", { class: "k-trk-cascol", role: "listbox", "aria-label": title }, [el("div", { class: "k-trk-cashead", text: title })].concat(items.map(function (it) {
          return el("button", { type: "button", role: "option", class: "k-trk-casrow", "aria-selected": String(!!it.on), onclick: it.go }, [el("span", { class: "k-trk-ell", text: it.t }), it.s ? el("span", { class: "k-trk-hint", text: it.s }) : null, it.on ? el("span", { "aria-hidden": "true", text: "›" }) : null].filter(Boolean));
        })));
      }
      function draw() {
        var q = search.value.trim().toLowerCase();
        grid.innerHTML = "";
        var bks = Object.keys(boards).filter(function (b) { return !q || boards[b].some(function (k) { return (IX.papers[k].title + " " + b).toLowerCase().indexOf(q) !== -1; }); });
        grid.appendChild(col("Board", bks.map(function (b) { return { t: b, s: IX.papers[boards[b][0]].qual, on: b === curB, go: function () { curB = b; curPid = boards[b][0]; curS = null; draw(); } }; })));
        var pids = (boards[curB] || []).filter(function (k) { return !q || IX.papers[k].title.toLowerCase().indexOf(q) !== -1 || curB.toLowerCase().indexOf(q) !== -1; });
        grid.appendChild(col("Paper", pids.map(function (k) { return { t: IX.papers[k].title.replace(/^(AQA|Edexcel|OCR) /, ""), on: k === curPid, go: function () { curPid = k; curS = null; draw(); } }; })));
        var sits = curPid ? IX.papers[curPid].sittings.slice().reverse() : [];
        grid.appendChild(col("Session", sits.map(function (s2) { return { t: IXR.sittingLabel(s2), s: done[curPid + ":" + s2] ? "✓ done" : "", on: s2 === curS, go: function () { curS = s2; draw(); } }; })));
        info.innerHTML = "";
        if (curPid && curS) {
          var fill = IXR.paperFill(curPid, curS), pr = X && X.presets().filter(function (x) { return x.index === curPid; })[0];
          info.appendChild(el("b", { text: fill.title }));
          info.appendChild(el("span", { text: "Fills: " + fill.max + " marks" + (pr && pr.mins ? ", " + pr.mins + " min" : "") + ", " + fill.questions.length + " questions with their marks and topics." }));
        }
        use.disabled = !(curPid && curS);
      }
      search.addEventListener("input", draw);
      draw();
      o2.appendChild(el("div", { class: "k-dialog k-trk-dialog", "data-ui": "ui.dialog tracker.index-dialog" }, [
        el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "紙" }), el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Pick from the index" })]),
        el("div", { class: "k-dialog-body k-trk-body" }, [search, grid, info, el("p", { class: "k-trk-hint", text: "References only: board · paper · session · question · marks · topic. No paper text or images are stored or shown." })]),
        el("div", { class: "k-dialog-foot" }, [el("button", { type: "button", class: "k-btn", text: "Back", onclick: c2 }), el("span", { class: "k-spacer" }), use])]));
      KOS.ui.openDialog(o2);
      search.focus();
    }
    function packPick() {
      if (!IX) return;
      var o2 = el("div", { class: "k-dialog-overlay" });
      function c2() { o2.remove(); }
      o2.close = c2;
      var done = {};
      KOS.tracker.all().forEach(function (e) { if (e.source && (e.source.kind === "topic-pack" || e.source.kind === "pmt-pack")) done[e.source.ref] = (done[e.source.ref] || 0) + 1; });
      var search = el("input", { type: "text", class: "k-input", placeholder: "Search topic packs", "aria-label": "Search topic packs" });
      var list = el("div", { class: "k-trk-packs" });
      function draw() {
        var q = search.value.trim().toLowerCase();
        list.innerHTML = "";
        IX.packs.filter(function (p) { return (!subjSel.value || p.subject === subjSel.value) && (!q || (p.sub + " " + p.topic + " " + p.area).toLowerCase().indexOf(q) !== -1); }).slice(0, 40).forEach(function (p) {
          list.appendChild(el("button", { type: "button", class: "k-trk-packrow", onclick: function () { c2(); applyPack(p.id); marks.focus(); } }, [
            el("span", { class: "k-trk-grow" }, [el("b", { class: "k-trk-ell", text: p.sub + " · " + p.level }), el("span", { class: "k-trk-hint", text: (p.source === "pmt" ? "PMT topic pack · reference only" : "KurenaiOS pack") + (p.units ? " · " + p.units + " questions" : "") })]),
            el("span", { class: "k-trk-hint", text: done[p.id] ? "✓ done" : "" })]));
        });
        if (!list.children.length) list.appendChild(el("p", { class: "k-trk-hint", text: "No pack matches." }));
      }
      search.addEventListener("input", draw);
      draw();
      o2.appendChild(el("div", { class: "k-dialog k-trk-dialog", "data-size": "sm", "data-ui": "ui.dialog tracker.pack-dialog" }, [
        el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "束" }), el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Topic pack" })]),
        el("div", { class: "k-dialog-body k-trk-body" }, [search, list, el("p", { class: "k-trk-hint", text: "A PMT pack is logged by reference; open your own copy." })]),
        el("div", { class: "k-dialog-foot" }, [el("span", { class: "k-spacer" }), el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: c2 })])]));
      KOS.ui.openDialog(o2);
      search.focus();
    }
    /* what saving will do, said before it does it */
    var note = el("p", { class: "k-trk-hint k-trk-note k-trk-span", "data-ui": "tracker.note" });
    function syncNote() {
      var m = timed.checked && tmins.value ? parseInt(tmins.value, 10) : null;
      var r = isResult.checked && aidSel.value ? X.get(aidSel.value) : null;
      note.textContent = r ? "Records this as " + r.title + "'s result, not as practice." + (r.links && r.links.itUnit ? " It fills " + r.links.itUnit + "'s raw mark." : "")
        : (m ? "Logs a " + m + "-minute study session today" : "Logs a study session today") + " and feeds RAG for the paper's topics.";
      saveBtn.textContent = r ? "Record result" : existing ? "Save changes" : "Log it";
    }
    timed.addEventListener("change", function () { tmins.parentNode.hidden = !timed.checked; syncNote(); });
    tmins.addEventListener("input", syncNote);
    isResult.addEventListener("change", function () { fillAssessments(); syncNote(); });
    [marks, max, predicted].forEach(function (i) { i.addEventListener("input", preview); });

    if (existing) {
      kind = existing.kind;
      topic.value = existing.topic; paper.value = existing.paper;
      if (existing.marks != null) marks.value = String(existing.marks);
      if (existing.max != null) max.value = String(existing.max);
      if (existing.predicted != null) predicted.value = String(existing.predicted);
      grade.value = existing.grade; date.value = existing.date;
      well.value = existing.well; badly.value = existing.badly; notes.value = existing.notes;
      reviewed.checked = existing.reviewed;
      subjSel.value = existing.subject || "";
      timed.checked = !!existing.timed;
      if (existing.mins) tmins.value = String(existing.mins);
      if (existing.conditions) cond.value = existing.conditions;
      isResult.checked = existing.role === "result";
    } else date.value = KOS.srs.todayISO();
    fillAssessments();
    aidSel.value = (existing && existing.assessmentId) || seed.assessmentId || "";
    if (!existing && seed.assessmentId && X) { var sa = X.get(seed.assessmentId); if (sa && sa.subject) subjSel.value = sa.subject; }

    var modeTabs = KOS.ui.tabs([["paper", "Past paper"], ["pack", "Topic pack"], ["other", "Other"]].filter(function (m) { return IX || m[0] === "other"; }).map(function (m) {
      return { label: m[1], active: m[0] === mode, onSelect: function (ev) {
        mode = m[0];
        modeTabs.querySelectorAll("[data-ui~='ui.tab']").forEach(function (b) { var on = b === ev.currentTarget; KOS.ui.state(b, "active", on); b.setAttribute("aria-selected", String(on)); });
        syncMode();
      } };
    }), { variant: "workspace", label: "What you are logging" });
    var ixWrap = el("div", { class: "k-field k-trk-span" }, [el("span", { class: "k-field-label", text: "From the index" }), ixField, ixHint]);
    var otherWrap = el("div", { class: "k-trk-span k-trk-grid2" }, [f("Paper", paper), f("Topic", topic), f("Subject", subjSel), f("Record type", recType)]);
    var topicsWrap = el("div", { class: "k-trk-span" }, [refPick.el]);
    var gradeWrap = f("Grade", grade);
    function syncMode() {
      ixWrap.hidden = mode === "other";
      otherWrap.hidden = mode !== "other";
      topicsWrap.hidden = mode !== "other";
      drawIx();
    }
    var minsWrap = el("span", { class: "k-trk-minsw" }, [el("span", { class: "k-trk-hint", text: "Minutes" }), tmins, tminsOf]);
    minsWrap.hidden = !timed.checked;
    var saveBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "tracker.save", text: existing ? "Save changes" : "Log it", onclick: function () { save(false); } });
    function save(perQ) {
      if (!topic.value.trim() && !paper.value.trim()) { KOS.ui.toast("Give it at least a topic or a paper name.", true); return; }
      var m = marks.value === "" ? null : Math.max(0, parseInt(marks.value, 10)), x = max.value === "" ? null : Math.max(1, parseInt(max.value, 10));
      if (m != null && x != null && m > x) { marks.setAttribute("aria-invalid", "true"); KOS.ui.toast("Marks are more than out of.", true); marks.focus(); return; }
      var res = isResult.checked && aidSel.value;
      var data = {
        kind: res ? "exam" : mode === "other" ? recType.value : "paper",
        topic: topic.value.trim(), paper: paper.value.trim(), subject: subjSel.value || null, refs: refPick.value(),
        marks: m, max: x, grade: grade.value.trim(), date: date.value || KOS.srs.todayISO(),
        well: well.value.trim(), badly: badly.value.trim(), notes: notes.value.trim(), reviewed: reviewed.checked,
        assessmentId: aidSel.value || null, role: res ? "result" : "practice", source: mode === "other" ? null : src,
        timed: timed.checked, mins: tmins.value === "" ? null : parseInt(tmins.value, 10), conditions: timed.checked ? cond.value : null,
        predicted: predicted.value === "" ? null : parseInt(predicted.value, 10), questions: qs.filter(function (q) { return q.q; })
      };
      var e;
      if (existing) { e = update(existing.id, data); KOS.ui.toast("Entry updated."); }
      else {
        e = add(data);
        var msg = "Logged " + (data.paper || data.topic) + (m != null && x ? ", " + Math.round(100 * m / x) + " percent" : "") + "." + (data.timed && data.mins ? " A " + data.mins + "-minute session added to today." : "");
        KOS.ui.toast(msg);
        if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(msg);
      }
      close();
      if (perQ && e && e.uid) { KOS.show("exams", { attempt: e.uid, page: "marks" }); return; }
      onSaved && onSaved(e);
    }
    var body = el("div", { class: "k-dialog-body k-trk-form k-trk-quick" }, [
      el("div", { class: "k-trk-span" }, [modeTabs]),
      ixWrap, otherWrap, topicsWrap,
      el("div", { class: "k-trk-span k-trk-grid3" }, [f("What do you think you got?", predicted, "", null), f("Marks", marks), f("Out of", max)]),
      el("div", { class: "k-trk-span" }, [predHint]),
      pv,
      el("div", { class: "k-trk-span k-trk-timed" }, [timed, el("span", { class: "k-trk-grow" }, [el("b", { text: "Timed" }), el("span", { class: "k-trk-hint", text: "Under exam conditions" })]), minsWrap]),
      el("div", { class: "k-trk-span k-trk-grid2" }, [f("Practice for", aidSel), f("Date", date)]),
      el("label", { class: "k-check k-trk-span" }, [isResult, el("span", {}, ["This IS the result of… ", el("span", { class: "k-trk-hint", text: "a mock or a real exam (records it as that assessment's result, not as practice)" })])]),
      el("details", { class: "k-trk-more k-trk-span", open: existing && (existing.well || existing.badly || existing.notes || existing.grade) ? "" : null }, [
        el("summary", { text: "Grade, reflections and conditions" }),
        el("div", { class: "k-trk-grid3" }, [gradeWrap, f("Conditions", cond), el("label", { class: "k-check" }, [reviewed, el("span", { text: "I've reviewed this result properly" })])]),
        el("div", { class: "k-trk-reflect" }, [f("Went well", well, "k-trk-well"), f("Didn't go well", badly, "k-trk-badly"), f("Mistakes / notes", notes, "k-trk-notes")])
      ]),
      note
    ]);
    overlay.appendChild(el("div", { class: "k-dialog k-trk-dialog", "data-ui": "ui.dialog tracker.dialog" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("span", { class: "k-kanji k-trk-mark", lang: "ja", "aria-hidden": "true", text: "試" }),
        el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: existing ? "Edit the record" : "Log a result" }),
        el("span", { class: "k-trk-hint", text: "Quick mode · one screen" })]),
      body,
      el("div", { class: "k-dialog-foot" }, [
        el("button", { type: "button", class: "k-btn k-btn--quiet", "data-ui": "tracker.perq", text: "Marks by question ›", onclick: function () { save(true); } }),
        existing ? el("button", { type: "button", class: "k-btn k-btn--danger", "data-intent": "danger", text: "Delete", onclick: function () {
          KOS.ui.confirm({ title: "Delete record?", body: "Delete this record? Its redo items go with it.", danger: true, confirm: "Delete" }, function () { remove(existing.id); close(); onSaved && onSaved(); });
        } }) : null,
        el("span", { class: "k-spacer" }),
        el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: close }),
        saveBtn
      ].filter(Boolean))
    ]));
    KOS.ui.openDialog(overlay);
    syncMode();
    preview();
    syncNote();
    if (seed.index && seed.index.paper) applyPaper(seed.index.paper, seed.index.sitting);
    else if (seed.pack) applyPack(seed.pack);
    (src || existing ? marks : mode === "other" ? paper : ixField).focus();
  }

  /* the log dialog from anywhere: the Exams hub opens it for an assessment
     (seed: {assessmentId, index: {paper, sitting}, pack}) */
  KOS.trackerLog = function (seed, onSaved) { editorModal((seed && seed.kind) || "paper", null, onSaved, seed || {}); };

  /* ---------------- the view (Graphite frame 9d) ----------------
     The kind switch with the filters on one row, four centred figures and
     the score trend, then the record as one table — a row opens its
     reflections beneath it. */
  /* #/tracker keeps resolving (29a): it is the hub's Practice tab now, on
     Attempts; #/tracker/paper opens it on practice papers */
  KOS.views.tracker = function (main, openKind) {
    if (KOS.views.exams) return KOS.views.exams(main, { tab: "practice", sub: openKind === "paper" ? "papers" : "attempts", kind: openKind });
    KOS.shell.tree("none");
    KOS.trackerRecord(main, openKind);
  };
  /* the record itself (9d): the kind switch with the filters, the figures
     and the score trend, then the table — a row opens its reflections and
     its links (marks by question, the post-mortem) beneath it */
  KOS.trackerRecord = function (main, openKind) {
    var openRow = null;       /* which record shows its reflections — per visit */
    var kind = openKind === "paper" ? "paper" : "exam";
    var filterSubj = "";
    var sortAsc = false;

    var kinds = KOS.ui.tabs(Object.keys(KINDS).map(function (k) {
      return { label: KINDS[k], active: k === kind, onSelect: function () {
        kind = k;
        kinds.querySelectorAll("[data-ui~='ui.tab']").forEach(function (b) {
          var on = b.dataset.tab === kind; KOS.ui.state(b, "active", on); b.setAttribute("aria-selected", String(on));
        });
        render();
      } };
    }), { variant: "workspace", label: "Record type", edge: true });
    [].forEach.call(kinds.querySelectorAll("[data-ui~='ui.tab']"), function (b, i) { b.dataset.tab = Object.keys(KINDS)[i]; });
    kinds.setAttribute("data-ui", kinds.getAttribute("data-ui") + " tracker.kinds");
    var subjSel = el("select", { class: "k-pill-select", "data-ui": "ui.status-select", "aria-label": "Filter by subject",
      onchange: function () { filterSubj = subjSel.value; render(); } }, [
      el("option", { value: "", text: "All subjects" }),
      el("option", { value: "compsci", text: SUBJ.compsci }),
      el("option", { value: "maths", text: SUBJ.maths }),
      el("option", { value: "it", text: SUBJ.it })
    ]);
    var sortBtn = el("button", { type: "button", class: "k-qz-pill", title: "Toggle date sort", "aria-pressed": "false",
      text: "Date ↓", onclick: function () { sortAsc = !sortAsc; sortBtn.textContent = sortAsc ? "Date ↑" : "Date ↓"; sortBtn.setAttribute("aria-pressed", String(sortAsc)); render(); } });
    main.appendChild(el("div", { class: "k-trk-tools", "data-ui": "tracker.tools" }, [kinds, el("span", { class: "k-spacer" }), subjSel, sortBtn]));

    var holder = el("div", { class: "k-trk" });
    main.appendChild(holder);

    function render() {
      holder.innerHTML = "";
      var rows = T().entries
        .filter(function (e) { return e.kind === kind && (!filterSubj || e.subject === filterSubj); })
        .sort(function (a, b) { return sortAsc ? (a.date < b.date ? -1 : 1) : (a.date > b.date ? -1 : 1); });
      if (!rows.length) {
        var empty = KOS.ui.emptyState({ compact: true, mark: kind === "exam" ? "試" : "紙", title: "Nothing logged yet",
          body: "Use “+ Log entry” after your next " + (kind === "exam" ? "assessment" : "practice paper") + "." });
        empty.setAttribute("data-ui", empty.getAttribute("data-ui") + " tracker.empty");
        holder.appendChild(empty);
        return;
      }
      /* the figures: a zero with nothing to say is suppressed (invariant 77) */
      var withPct = rows.filter(function (e) { return pct(e) != null; });
      var avg = withPct.length ? Math.round(withPct.reduce(function (a, e) { return a + pct(e); }, 0) / withPct.length) : null;
      var unreviewed = rows.filter(function (e) { return !e.reviewed; }).length;
      var below = rows.filter(function (e) { return pct(e) != null && pct(e) < 60; }).length;
      function fig(v, label, c) {
        return el("div", { class: "k-card k-trk-fig", "data-ui": "ui.stat" }, [
          el("div", { class: "k-trk-fig-v", "data-ui": "part.value", style: c ? "--c: " + c : null, text: String(v) }),
          el("div", { class: "k-trk-fig-l", "data-ui": "part.label", text: label })
        ]);
      }
      var trend = withPct.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; }).slice(-5);
      holder.appendChild(el("div", { class: "k-trk-figs", "data-ui": "tracker.strip ui.stat-strip" }, [
        fig(rows.length, kind === "exam" ? "Exams logged" : "Papers logged"),
        avg == null ? null : fig(avg + "%", "Average score", tone(avg)),
        unreviewed ? fig(unreviewed, "Not yet reviewed", "var(--crimson)") : null,
        below ? fig(below, "Below 60%", "var(--red-soft)") : null,
        trend.length >= 2 ? el("div", { class: "k-card k-trk-trend", "data-ui": "tracker.trend" }, [
          el("div", { class: "k-trk-trend-head" }, [el("span", { text: "Score trend" }), el("span", { class: "k-spacer", text: "last " + trend.length })]),
          el("div", { class: "k-trk-bars", role: "img", "aria-label": "Scores, oldest first: " + trend.map(function (e) { return pct(e) + "%"; }).join(", ") },
            trend.map(function (e) { return el("span", { style: "--h: " + pct(e) + "%; --c: " + tone(pct(e)) }); }))
        ]) : null
      ].filter(Boolean)));

      var table = el("div", { class: "k-card k-trk-table", role: "table", "aria-label": KINDS[kind] }, [
        el("div", { class: "k-trk-grid k-trk-headrow", role: "row" }, ["", "Date", "Paper · topic", "Score", "Marks", "Grade", "Rev", ""].map(function (h) {
          return el("span", { role: "columnheader", text: h });
        }))
      ]);
      rows.forEach(function (e) {
        var p = pct(e);
        var isOpen = openRow === e.id;
        var revCb = el("input", { type: "checkbox", class: "k-box", "aria-label": "Reviewed", onchange: function () {
          update(e.id, { reviewed: revCb.checked });
          KOS.ui.state(row, "reviewed", revCb.checked);
        } });
        revCb.checked = e.reviewed;
        var detail = el("div", { class: "k-trk-detail", "data-ui": "tracker.detail", hidden: isOpen ? null : "" });
        var toggle = el("button", { type: "button", class: "k-trk-title", "aria-expanded": String(isOpen), onclick: function () {
          openRow = openRow === e.id ? null : e.id;
          detail.hidden = openRow !== e.id;
          toggle.setAttribute("aria-expanded", String(openRow === e.id));
          KOS.ui.state(row, "open", openRow === e.id);
        } }, [
          el("span", { class: "k-trk-name", text: e.paper || e.topic || "(untitled)" }),
          el("span", { class: "k-trk-sub" }, [
            e.subject ? SHORT[e.subject] + " · " : "",
            e.ref ? el("span", { class: "k-mono", text: e.ref + " " }) : null,
            e.paper && e.topic ? e.topic : ""
          ].filter(Boolean))
        ]);
        var row = el("div", { class: "k-trk-row", "data-ui": "tracker.row", "data-state": [e.reviewed ? "reviewed" : null, isOpen ? "open" : null].filter(Boolean).join(" ") || null,
          style: "--s: " + (HUE[e.subject] || "var(--muted)") }, [
          el("div", { class: "k-trk-grid", role: "row" }, [
            el("span", { class: "k-trk-bar", "aria-hidden": "true" }),
            el("span", { class: "k-mono k-muted", role: "cell", text: shortDate(e.date) }),
            el("span", { role: "cell", class: "k-trk-cell" }, [toggle]),
            el("span", { role: "cell", class: "k-trk-score", style: p == null ? null : "--p: " + p + "%; --c: " + tone(p) }, p == null ? [el("span", { class: "k-muted", text: "—" })] : [
              el("span", { class: "k-trk-scorebar", "aria-hidden": "true" }, [el("i")]),
              el("b", { class: "k-mono", text: p + "%" })
            ]),
            el("span", { class: "k-mono", role: "cell", text: e.marks != null && e.max ? e.marks + " / " + e.max : "—" }),
            el("span", { role: "cell" }, [e.grade ? el("span", { class: "k-trk-grade", "data-ui": "tracker.grade", "data-tier": gradeTier(e.grade, p, e.subject), title: "Grade " + e.grade, text: e.grade }) : null].filter(Boolean)),
            el("span", { role: "cell" }, [revCb]),
            el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Edit this entry", text: "✎",
              onclick: function () { editorModal(kind, e, render); } })
          ]),
          detail
        ]);
        function block(label, text, cls) {
          if (!text) return null;
          return el("div", { class: "k-trk-block " + cls }, [el("b", { text: label }), el("p", { text: text })]);
        }
        [block("Went well", e.well, "k-trk-well"), block("Didn't go well", e.badly, "k-trk-badly"), block("Mistakes / notes", e.notes, "k-trk-notes")]
          .forEach(function (b) { if (b) detail.appendChild(b); });
        if (!detail.children.length) detail.appendChild(el("p", { class: "k-muted", text: "No reflections written — edit the entry to add them." }));
        var links = el("div", { class: "k-trk-links" }, [
          e.uid ? el("button", { type: "button", class: "k-link", "data-ui": "tracker.marks-link", text: (e.questions || []).length ? "Marks by question →" : "Add marks by question →",
            onclick: function () { KOS.show("exams", { attempt: e.uid, page: "marks" }); } }) : null,
          e.uid && (e.questions || []).some(function (q) { return q.got != null; }) ? el("button", { type: "button", class: "k-link", "data-ui": "tracker.pm-link", text: "Post-mortem →",
            onclick: function () { KOS.show("exams", { attempt: e.uid }); } }) : null,
          e.uid && KOS.examPractice ? el("button", { type: "button", class: "k-link", text: e.feedback ? "Teacher feedback ✓" : "Teacher feedback",
            onclick: function () { KOS.examPractice.feedbackDialog(e); } }) : null,
          e.subject && e.ref ? el("button", { type: "button", class: "k-link", text: "Open " + e.ref + " →",
            onclick: function () { KOS.show("ref", { subject: e.subject, ref: e.ref }); } }) : null
        ].filter(Boolean));
        if (links.children.length) detail.appendChild(links);
        table.appendChild(row);
      });
      holder.appendChild(table);
    }
    render();
  };

})();
