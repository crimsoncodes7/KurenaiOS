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

  /* ---------------- data API ---------------- */
  function add(data) {
    var t = T();
    var e = {
      id: t.nextId++,
      kind: data.kind === "paper" ? "paper" : "exam",
      subject: data.subject || null,
      ref: data.ref || null,
      topic: data.topic || "",
      paper: data.paper || "",
      marks: data.marks != null ? data.marks : null,
      max: data.max != null ? data.max : null,
      grade: data.grade || "",
      date: data.date || KOS.srs.todayISO(),
      well: data.well || "",
      badly: data.badly || "",
      notes: data.notes || "",
      reviewed: !!data.reviewed,
      added: Date.now()
    };
    t.entries.push(e);
    store.save();
    /* study evidence → session log (FR-3.2) */
    KOS.sessions.log({
      type: "tracker", subject: e.subject, ref: e.ref,
      metrics: { kind: e.kind, marks: e.marks, max: e.max,
        pct: pct(e), grade: e.grade, title: e.topic || e.paper }
    });
    return e;
  }
  function update(id, patch) {
    var e = T().entries.find(function (x) { return x.id === id; });
    if (!e) return null;
    Object.keys(patch).forEach(function (k) { e[k] = patch[k]; });
    store.save();
    return e;
  }
  function remove(id) {
    var t = T();
    var i = t.entries.findIndex(function (x) { return x.id === id; });
    if (i !== -1) { t.entries.splice(i, 1); store.save(); }
  }
  function pct(e) {
    return e.marks != null && e.max ? Math.round(100 * e.marks / e.max) : null;
  }
  /* topic-linked results for the RAG auto-score */
  function forRef(sid, ref) {
    return T().entries.filter(function (e) { return e.subject === sid && e.ref === ref; });
  }
  function forSubject(sid) {
    return T().entries.filter(function (e) { return e.subject === sid; });
  }

  var HUE = { compsci: "var(--cs)", maths: "var(--maths)", it: "var(--it)" };
  var SHORT = { compsci: "CS", maths: "Maths", it: "IT" };
  function tone(p) { return p == null ? null : p >= 75 ? "var(--green)" : p >= 60 ? "var(--amber)" : "var(--red-soft)"; }
  function shortDate(iso) {
    if (!iso) return "—";
    var p = iso.split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  /* ---------------- the log dialog (Graphite frame 9e) ----------------
     The kind is a switch in the dialog's own head; the percentage and what
     it will do to the topic's RAG band are previewed as the marks go in. */
  function editorModal(kind, existing, onSaved) {
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
    var subjSel = el("select", { class: "k-input", onchange: function () { fillRefs(); preview(); } }, [
      el("option", { value: "", text: "No subject" }),
      el("option", { value: "compsci", text: SUBJ.compsci }),
      el("option", { value: "maths", text: SUBJ.maths }),
      el("option", { value: "it", text: SUBJ.it })
    ]);
    var refSel = el("select", { class: "k-input", onchange: preview });
    function fillRefs() {
      refSel.innerHTML = "";
      refSel.appendChild(el("option", { value: "", text: "No specific topic" }));
      if (!subjSel.value) { refSel.disabled = true; return; }
      refSel.disabled = false;
      KOS.hub.LEAVES[subjSel.value].forEach(function (l) {
        refSel.appendChild(el("option", { value: l.ref, text: l.ref + " · " + l.title }));
      });
    }
    if (existing) {
      kind = existing.kind;
      topic.value = existing.topic; paper.value = existing.paper;
      if (existing.marks != null) marks.value = String(existing.marks);
      if (existing.max != null) max.value = String(existing.max);
      grade.value = existing.grade; date.value = existing.date;
      well.value = existing.well; badly.value = existing.badly; notes.value = existing.notes;
      reviewed.checked = existing.reviewed;
      subjSel.value = existing.subject || "";
      fillRefs();
      if (existing.ref) refSel.value = existing.ref;
    } else {
      date.value = KOS.srs.todayISO();
      fillRefs();
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
      pv.lastChild.textContent = "Logged results count as study evidence" + (subjSel.value && refSel.value ? " and push " + refSel.value + " towards " + band + "." : ".");
    }
    [marks, max].forEach(function (i) { i.addEventListener("input", preview); });
    preview();

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
        f("Topic", topic, "k-trk-half"), f("Spec point (feeds RAG)", refSel, "k-trk-half"),
        f("Marks awarded", marks), f("Marks available", max), f("Grade", grade), f("Date completed", date),
        pv,
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
            subject: subjSel.value || null, ref: subjSel.value && refSel.value ? refSel.value : null,
            marks: marks.value === "" ? null : Math.max(0, parseInt(marks.value, 10)),
            max: max.value === "" ? null : Math.max(1, parseInt(max.value, 10)),
            grade: grade.value.trim(), date: date.value || KOS.srs.todayISO(),
            well: well.value.trim(), badly: badly.value.trim(), notes: notes.value.trim(),
            reviewed: reviewed.checked
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
      actions: [el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "+ Log entry",
        onclick: function () { editorModal(kind, null, render); } })] }));

    var kinds = KOS.ui.tabs(Object.keys(KINDS).map(function (k) {
      return { label: KINDS[k], active: k === kind, onSelect: function () {
        kind = k;
        kinds.querySelectorAll("[data-ui~='ui.tab']").forEach(function (b) {
          var on = b.dataset.tab === kind; KOS.ui.state(b, "active", on); b.setAttribute("aria-selected", String(on));
        });
        render();
      } };
    }), { variant: "workspace", label: "Record type" });
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
            el("span", { role: "cell" }, [e.grade ? el("span", { class: "k-chip", "data-tone": "muted", text: e.grade }) : null].filter(Boolean)),
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

  KOS.tracker = { add: add, update: update, remove: remove, pct: pct, forRef: forRef, forSubject: forSubject };
})();
