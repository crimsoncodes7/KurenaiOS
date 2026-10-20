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

  /* ---------------- the log dialog (Graphite frame 9e) ----------------
     The kind is a switch in the dialog's own head; the percentage and what
     it will do to the topic's RAG band are previewed as the marks go in. */
  function editorModal(kind, existing, onSaved, seed) {
    seed = seed || {};
    var overlay = el("div", { class: "k-dialog-overlay" });
    function close() { overlay.remove(); }
    overlay.close = close;
    function input(type, attrs) { return el("input", Object.assign({ type: type, class: "k-input" }, attrs || {})); }
    function f(label, control, cls) {
      return el("label", { class: "k-field" + (cls ? " " + cls : "") }, [el("span", { class: "k-field-label", text: label }), control]);
    }
    var paper = input("text", { placeholder: "e.g. Paper 1 · June 2024" });
    var topic = input("text", { placeholder: "e.g. Quadratics / Data structures" });
    var marks = input("number", { min: 0, "aria-label": "Marks awarded", placeholder: "got" });
    var max = input("number", { min: 1, "aria-label": "Marks available", placeholder: "out of" });
    var grade = input("text", { placeholder: "e.g. B / 6" });
    var date = input("date");
    function area(ph, label) { return el("textarea", { class: "k-input", rows: 3, placeholder: ph, "aria-label": label }); }
    var well = area("Areas that went well…", "Went well");
    var badly = area("Areas that didn't go well…", "Didn't go well");
    var notes = area("Mistakes / notes for next time…", "Mistakes / notes");
    var reviewed = el("input", { type: "checkbox", class: "k-box" });

    /* ---- the attempt (roadmap 5.8, decision B): every field optional ---- */
    var X = KOS.exams;
    var aidTouched = !!(existing && existing.assessmentId) || !!seed.assessmentId;
    var aidSel = el("select", { class: "k-input", "data-ui": "tracker.assessment", onchange: function () { aidTouched = true; } }, [el("option", { value: "", text: "Nothing in particular" })]);
    (X ? X.all().filter(function (a) { return !a.archived; }) : []).forEach(function (a) {
      aidSel.appendChild(el("option", { value: a.id, text: a.title + (a.date ? " · " + shortDate(a.date) : "") }));
    });
    aidSel.value = (existing && existing.assessmentId) || seed.assessmentId || "";
    var isResult = el("input", { type: "checkbox", class: "k-box", "data-ui": "tracker.result" });
    isResult.checked = !!(existing && existing.role === "result");
    var timed = el("input", { type: "checkbox", class: "k-box", "data-ui": "tracker.timed" });
    var tmins = input("number", { min: 1, max: 600, placeholder: "minutes", "aria-label": "Minutes taken" });
    var cond = el("select", { class: "k-input", "aria-label": "Conditions" }, [["exam", "Exam conditions"], ["open-book", "Open book"], ["untimed", "Untimed"]].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    var predicted = input("number", { min: 0, placeholder: "before marking", "aria-label": "What you think you got" });
    var source = existing && existing.source ? Object.assign({}, existing.source) : null;
    var qs = existing && existing.questions ? existing.questions.map(function (q) { return Object.assign({}, q, { tags: q.tags.slice(), refs: q.refs.slice() }); }) : [];
    if (existing) {
      timed.checked = !!existing.timed;
      if (existing.mins) tmins.value = String(existing.mins);
      if (existing.conditions) cond.value = existing.conditions;
      if (existing.predicted != null) predicted.value = String(existing.predicted);
    }
    /* the nearest assessment whose scope covers the paper, until one is
       chosen by hand */
    function guessAssessment(refs) {
      if (aidTouched || !X || !refs.length) return;
      var leaves = KOS.spec.resolve(refs);
      var hit = X.upcoming().filter(function (a) { var ls = X.leaves(a); return leaves.some(function (k) { return ls.indexOf(k) !== -1; }); })[0];
      if (hit) aidSel.value = hit.id;
    }

    /* per question: got / max, error tags, redo (never required to sum) */
    var qHost = el("div", { class: "k-trk-qs", "data-ui": "tracker.questions" });
    var qNote = el("p", { class: "k-trk-qnote", "data-ui": "tracker.qnote", hidden: "" });
    function qSum() {
      var got = 0, mx = 0, any = false;
      qs.forEach(function (q) { if (q.got != null) { got += q.got; any = true; } if (q.max != null) mx += q.max; });
      return { got: got, max: mx, any: any };
    }
    function syncQNote() {
      var sm = qSum(), typed = marks.value === "" ? null : parseInt(marks.value, 10);
      if (sm.any && typed != null && typed !== sm.got) { qNote.hidden = false; qNote.textContent = "Questions add to " + sm.got + "; the total says " + typed + ". The total wins."; }
      else if (sm.any && typed == null) { qNote.hidden = false; qNote.textContent = "The total will be " + sm.got + (sm.max ? " / " + sm.max : "") + " from the questions."; }
      else qNote.hidden = true;
    }
    function drawQs() {
      qHost.innerHTML = "";
      if (qs.length) qHost.appendChild(el("div", { class: "k-trk-qrow k-trk-qhead", "aria-hidden": "true" }, ["Q", "Got", "Out of", "What went wrong", "Redo", ""].map(function (h) { return el("span", { text: h }); })));
      qs.forEach(function (q, i) {
        var lab = input("text", { value: q.q, "aria-label": "Question " + (i + 1) + " label", oninput: function () { q.q = lab.value.trim(); } });
        var got = input("number", { min: 0, value: q.got == null ? "" : q.got, "aria-label": "Marks got, question " + q.q,
          oninput: function () { q.got = got.value === "" ? null : Math.max(0, parseInt(got.value, 10)); syncQNote(); } });
        var mx = input("number", { min: 0, value: q.max == null ? "" : q.max, "aria-label": "Marks available, question " + q.q,
          oninput: function () { q.max = mx.value === "" ? null : Math.max(0, parseInt(mx.value, 10)); syncQNote(); } });
        var tags = el("details", { class: "k-trk-tags", "data-ui": "tracker.tags" }, [
          el("summary", { text: q.tags.length ? q.tags.map(KOS.tracker.tagLabel).join(", ") : "Tag…" }),
          el("div", { class: "k-trk-tagmenu" }, KOS.tracker.TAGS.map(function (tg) {
            var cb = el("input", { type: "checkbox", class: "k-box", onchange: function () {
              q.tags = cb.checked ? q.tags.concat(tg.v) : q.tags.filter(function (x) { return x !== tg.v; });
              tags.firstChild.textContent = q.tags.length ? q.tags.map(KOS.tracker.tagLabel).join(", ") : "Tag…";
            } });
            cb.checked = q.tags.indexOf(tg.v) !== -1;
            return el("label", { class: "k-check" }, [cb, el("span", { text: tg.label })]);
          }))
        ]);
        var redo = el("input", { type: "checkbox", class: "k-box", "aria-label": "Redo question " + q.q, onchange: function () { q.redo = redo.checked; } });
        redo.checked = !!q.redo;
        qHost.appendChild(el("div", { class: "k-trk-qrow", "data-ui": "tracker.qrow" }, [lab, got, mx, tags, redo,
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Remove question " + q.q, text: "✕", onclick: function () { qs.splice(i, 1); drawQs(); syncQNote(); } })]));
      });
      qHost.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "tracker.add-q", text: "+ Question", onclick: function () {
        qs.push({ q: String(qs.length + 1), max: null, got: null, refs: [], tags: [], redo: false, note: "" }); drawQs();
      } }));
    }

    /* pick from the index (phase 2): a past paper fills its title, marks
       and question list; a topic pack its topics */
    var IX = window.KOS_EXAMS && KOS_EXAMS.index;
    var ixPaper = el("select", { class: "k-input", "data-ui": "tracker.ix-paper", "aria-label": "Past paper" });
    var ixSit = el("select", { class: "k-input", "data-ui": "tracker.ix-sitting", "aria-label": "Sitting" });
    var ixPack = el("select", { class: "k-input", "data-ui": "tracker.ix-pack", "aria-label": "Topic pack" });
    function fillIndex() {
      if (!IX) return;
      var sid = subjSel.value;
      ixPaper.innerHTML = ""; ixPack.innerHTML = "";
      ixPaper.appendChild(el("option", { value: "", text: "Past paper…" }));
      Object.keys(IX.papers).filter(function (k) { return !sid || IX.papers[k].subject === sid; }).forEach(function (k) {
        ixPaper.appendChild(el("option", { value: k, text: IX.papers[k].title }));
      });
      ixPack.appendChild(el("option", { value: "", text: "Topic pack…" }));
      IX.packs.filter(function (pk) { return !sid || pk.subject === sid; }).forEach(function (pk) {
        ixPack.appendChild(el("option", { value: pk.id, text: pk.sub + " · " + pk.level + (pk.units ? " · " + pk.units + " q" : "") }));
      });
      fillSittings();
    }
    function fillSittings() {
      ixSit.innerHTML = "";
      ixSit.appendChild(el("option", { value: "", text: "Sitting…" }));
      var pp = IX && IX.papers[ixPaper.value];
      (pp ? pp.sittings : []).slice().reverse().forEach(function (st) { ixSit.appendChild(el("option", { value: st, text: KOS.examIndex ? KOS.examIndex.sittingLabel(st) : st })); });
    }
    ixPaper.addEventListener("change", fillSittings);
    ixSit.addEventListener("change", function () {
      if (!IX || !ixPaper.value || !ixSit.value || !KOS.examIndex) return;
      var fill = KOS.examIndex.paperFill(ixPaper.value, ixSit.value);
      if (!fill) return;
      paper.value = fill.title;
      if (!subjSel.value) subjSel.value = fill.subject;
      max.value = String(fill.max);
      qs = fill.questions;
      source = { kind: "past-paper", ref: fill.ref };
      refPick.set(fill.refs);
      if (kind !== "paper") { /* a past paper is practice unless said otherwise */ }
      drawQs(); syncQNote(); preview();
      guessAssessment(fill.refs);
    });
    ixPack.addEventListener("change", function () {
      if (!IX || !ixPack.value || !KOS.examIndex) return;
      var fill = KOS.examIndex.packFill(ixPack.value);
      if (!fill) return;
      topic.value = fill.title;
      if (!subjSel.value) subjSel.value = fill.subject;
      refPick.set(fill.refs);
      source = { kind: fill.source === "pmt" ? "pmt-pack" : "topic-pack", ref: fill.ref };
      preview();
      guessAssessment(fill.refs);
    });
    var more = el("details", { class: "k-trk-more", "data-ui": "tracker.more", open: existing && ((existing.questions || []).length || existing.assessmentId || existing.timed) ? "" : null }, [
      el("summary", { text: "More detail — per question, timing, which exam it's for" })
    ]);
    var subjSel = el("select", { class: "k-input", onchange: function () { subjTouched = true; preview(); if (typeof fillIndex === "function") fillIndex(); } }, [
      el("option", { value: "", text: "No subject" }),
      el("option", { value: "compsci", text: SUBJ.compsci }),
      el("option", { value: "maths", text: SUBJ.maths }),
      el("option", { value: "it", text: SUBJ.it })
    ]);
    /* frame 17: the spec points are the shared topic picker (multi); the
       subject follows the first topic while it has not been set by hand */
    var subjTouched = !!(existing && existing.subject);
    var refPick = KOS.topicPicker({ label: "Spec points (feed RAG)", multi: true,
      value: existing ? KOS.tracker.refsOf(existing) : [],
      onChange: function (refs) {
        if (!subjTouched && refs.length) subjSel.value = KOS.spec.subjectsOf(refs)[0] || subjSel.value;
        preview();
        if (typeof guessAssessment === "function") guessAssessment(refs);
      } });
    refPick.el.classList.add("k-trk-half");
    if (existing) {
      kind = existing.kind;
      topic.value = existing.topic; paper.value = existing.paper;
      if (existing.marks != null) marks.value = String(existing.marks);
      if (existing.max != null) max.value = String(existing.max);
      grade.value = existing.grade; date.value = existing.date;
      well.value = existing.well; badly.value = existing.badly; notes.value = existing.notes;
      reviewed.checked = existing.reviewed;
      subjSel.value = existing.subject || "";
    } else {
      date.value = KOS.srs.todayISO();
    }

    /* the live read-out: the percentage and what it tells the RAG flag */
    var pv = el("div", { class: "k-trk-preview", "data-ui": "tracker.preview", hidden: "" }, [el("b"), el("span")]);
    function preview() {
      var m = parseInt(marks.value, 10), x = parseInt(max.value, 10);
      if (!(x > 0) || isNaN(m)) { pv.hidden = true; return; }
      var p = Math.round(100 * Math.max(0, m) / x);
      pv.hidden = false;
      pv.style.setProperty("--c", tone(p));
      pv.firstChild.textContent = p + "%";
      var band = p >= 70 ? "green" : p >= 45 ? "amber" : "red";
      var first = KOS.spec.firstLeaf(refPick.value());
      pv.lastChild.textContent = "Logged results count as study evidence" + (first ? " and push " + first.ref + " towards " + band + "." : ".");
    }
    [marks, max].forEach(function (i) { i.addEventListener("input", preview); });
    marks.addEventListener("input", syncQNote);
    preview();
    if (!existing && seed.assessmentId && X) {
      var sa = X.get(seed.assessmentId);
      if (sa && sa.subject) subjSel.value = sa.subject;
    }
    fillIndex();
    drawQs();
    syncQNote();
    more.appendChild(el("div", { class: "k-trk-moregrid" }, [
      f("Preparing for", aidSel, "k-trk-half"),
      el("label", { class: "k-check k-trk-half" }, [isResult, el("span", { text: "This is the real result of that assessment" })]),
      IX ? el("div", { class: "k-trk-ix k-trk-full", "data-ui": "tracker.index" }, [el("span", { class: "k-field-label", text: "From your past-paper index" }), ixPaper, ixSit, ixPack]) : null,
      el("label", { class: "k-check" }, [timed, el("span", { text: "Timed" })]), f("Minutes taken", tmins), f("Conditions", cond),
      f("What you think you got", predicted),
      el("div", { class: "k-trk-full" }, [el("span", { class: "k-field-label", text: "Per question (optional — tags never have to add up)" }), qHost, qNote])
    ].filter(Boolean)));

    var kindTabs = KOS.ui.tabs([["exam", "Exam"], ["paper", "Practice paper"]].map(function (k) {
      return { label: k[1], active: k[0] === kind, onSelect: function (ev) {
        kind = k[0];
        kindTabs.querySelectorAll("[data-ui~='ui.tab']").forEach(function (b) {
          var on = b === ev.currentTarget; KOS.ui.state(b, "active", on); b.setAttribute("aria-selected", String(on));
        });
        title.textContent = (existing ? "Edit " : "Log ") + (kind === "paper" ? "practice paper" : "exam");
      } };
    }), { variant: "workspace", label: "Record type" });
    var title = el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: (existing ? "Edit " : "Log ") + (kind === "paper" ? "practice paper" : "exam") });

    overlay.appendChild(el("div", { class: "k-dialog k-trk-dialog", "data-ui": "ui.dialog tracker.dialog" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("span", { class: "k-kanji k-trk-mark", lang: "ja", "aria-hidden": "true", text: "試" }), title,
        el("span", { class: "k-spacer" }), kindTabs
      ]),
      el("div", { class: "k-dialog-body k-trk-form" }, [
        f("Paper", paper, "k-trk-half"), f("Subject", subjSel, "k-trk-half"),
        f("Topic", topic, "k-trk-half"), refPick.el,
        f("Marks awarded", marks), f("Marks available", max), f("Grade", grade), f("Date completed", date),
        pv,
        more,
        el("div", { class: "k-trk-reflect" }, [
          f("Went well", well, "k-trk-well"), f("Didn't go well", badly, "k-trk-badly"), f("Mistakes / notes", notes, "k-trk-notes")
        ])
      ]),
      el("div", { class: "k-dialog-foot" }, [
        el("label", { class: "k-check" }, [reviewed, el("span", { text: "I've reviewed this result properly" })]),
        el("span", { class: "k-spacer" }),
        existing ? el("button", { type: "button", class: "k-btn k-btn--danger", "data-intent": "danger", text: "Delete", onclick: function () {
          KOS.ui.confirm({ title: "Delete record?", body: "Delete this " + kind + " record?", danger: true, confirm: "Delete" }, function () { remove(existing.id); close(); onSaved && onSaved(); });
        } }) : null,
        el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: close }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: existing ? "Save changes" : "Log it", onclick: function () {
          if (!topic.value.trim() && !paper.value.trim()) { KOS.ui.toast("Give it at least a topic or a paper name.", true); return; }
          var data = {
            kind: kind, topic: topic.value.trim(), paper: paper.value.trim(),
            subject: subjSel.value || null, refs: refPick.value(),
            marks: marks.value === "" ? null : Math.max(0, parseInt(marks.value, 10)),
            max: max.value === "" ? null : Math.max(1, parseInt(max.value, 10)),
            grade: grade.value.trim(), date: date.value || KOS.srs.todayISO(),
            well: well.value.trim(), badly: badly.value.trim(), notes: notes.value.trim(),
            reviewed: reviewed.checked,
            assessmentId: aidSel.value || null,
            role: isResult.checked && aidSel.value ? "result" : "practice",
            source: source,
            timed: timed.checked, mins: tmins.value === "" ? null : parseInt(tmins.value, 10),
            conditions: timed.checked ? cond.value : null,
            predicted: predicted.value === "" ? null : parseInt(predicted.value, 10),
            questions: qs.filter(function (q) { return q.q; })
          };
          if (existing) { update(existing.id, data); KOS.ui.toast("Entry updated."); }
          else { add(data); KOS.ui.toast("Logged — it counts as study evidence and feeds the RAG flags."); }
          close(); onSaved && onSaved();
        } })
      ].filter(Boolean))
    ]));
    KOS.ui.openDialog(overlay);
    paper.focus();
  }

  /* the log dialog from anywhere: the Exams hub opens it for an assessment */
  KOS.trackerLog = function (seed, onSaved) { editorModal((seed && seed.kind) || "paper", null, onSaved, seed || {}); };

  /* ---------------- the view (Graphite frame 9d) ----------------
     The kind switch with the filters on one row, four centred figures and
     the score trend, then the record as one table — a row opens its
     reflections beneath it. */
  KOS.views.tracker = function (main, openKind) {
    KOS.shell.tree("none");
    var openRow = null;       /* which record shows its reflections — per visit */
    var kind = openKind === "paper" ? "paper" : "exam";
    var filterSubj = "";
    var sortAsc = false;

    main.appendChild(KOS.ui.pageHeader({ kicker: "The record", title: "Exams & Papers",
      sub: "Every paper you've sat: marks, what went well, and whether you've reviewed it.",
      actions: [KOS.examTabs ? KOS.examTabs("practice") : null, el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "+ Log entry",
        onclick: function () { editorModal(kind, null, render); } })] }));

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
        if (e.subject && e.ref) {
          detail.appendChild(el("button", { type: "button", class: "k-link", text: "Open " + e.ref + " →",
            onclick: function () { KOS.show("ref", { subject: e.subject, ref: e.ref }); } }));
        }
        table.appendChild(row);
      });
      holder.appendChild(table);
    }
    render();
  };

})();
