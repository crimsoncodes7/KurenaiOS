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

  /* ---------------- editor modal ---------------- */
  function editorModal(kind, existing, onSaved) {
    var overlay = el("div", { class: "modal-ov", onclick: function (e) { if (e.target === overlay) close(); } });
    function close() { overlay.remove(); document.removeEventListener("keydown", onEsc); }
    function onEsc(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onEsc);

    var topic = el("input", { type: "text", class: "cal-in", placeholder: "e.g. Quadratics / Data structures" });
    var paper = el("input", { type: "text", class: "cal-in", placeholder: "e.g. Paper 1 · June 2024" });
    var marks = el("input", { type: "number", min: 0, class: "cal-in fx-num", placeholder: "got" });
    var max = el("input", { type: "number", min: 1, class: "cal-in fx-num", placeholder: "out of" });
    var grade = el("input", { type: "text", class: "cal-in fx-num", placeholder: "e.g. B / 6" });
    var date = el("input", { type: "date", class: "cal-in" });
    var well = el("textarea", { class: "note-area", rows: 2, placeholder: "Areas that went well…" });
    var badly = el("textarea", { class: "note-area", rows: 2, placeholder: "Areas that didn't go well…" });
    var notes = el("textarea", { class: "note-area", rows: 2, placeholder: "Mistakes / notes for next time…" });
    var reviewed = el("input", { type: "checkbox" });
    var subjSel = el("select", { class: "status-sel", onchange: fillRefs }, [
      el("option", { value: "", text: "No subject" }),
      el("option", { value: "compsci", text: SUBJ.compsci }),
      el("option", { value: "maths", text: SUBJ.maths }),
      el("option", { value: "it", text: SUBJ.it })
    ]);
    var refSel = el("select", { class: "status-sel" });
    function fillRefs() {
      refSel.innerHTML = "";
      refSel.appendChild(el("option", { value: "", text: "No specific topic" }));
      if (!subjSel.value) { refSel.disabled = true; return; }
      refSel.disabled = false;
      KOS.hub.LEAVES[subjSel.value].forEach(function (l) {
        refSel.appendChild(el("option", { value: l.ref, text: l.ref + " — " + l.title }));
      });
    }
    if (existing) {
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

    function field(label, node) {
      return el("label", { class: "cal-field" }, [el("span", { text: label }), node]);
    }
    overlay.appendChild(el("div", { class: "modal cal-modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: (existing ? "Edit " : "Log ") + (kind === "paper" ? "practice paper" : "exam") }),
        el("button", { class: "btn", text: "✕ Close", style: "margin-left:auto", onclick: close })
      ]),
      el("div", { class: "cal-form" }, [
        field("Topic", topic), field("Paper", paper),
        field("Subject", subjSel), field("Spec point (feeds RAG)", refSel),
        el("div", { class: "cal-field" }, [el("span", { text: "Marks" }),
          el("div", { class: "trk-marks" }, [marks, el("span", { class: "trk-slash", text: "/" }), max])]),
        field("Grade", grade), field("Date completed", date)
      ]),
      el("div", { class: "trk-longfields" }, [
        field("Went well", well), field("Didn't go well", badly), field("Mistakes / notes", notes)
      ]),
      el("label", { class: "chk", style: "margin-top:10px" }, [reviewed, "I've reviewed this result properly"]),
      el("div", { class: "lab-controls", style: "margin-top:14px" }, [
        el("button", { class: "btn primary", text: existing ? "Save changes" : "Log it", onclick: function () {
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
        } }),
        existing ? el("button", { class: "btn danger", text: "Delete entry", onclick: function () {
          if (confirm("Delete this " + kind + " record?")) { remove(existing.id); close(); onSaved && onSaved(); }
        } }) : null
      ])
    ]));
    document.body.appendChild(overlay);
    topic.focus();
  }

  /* ---------------- the view ---------------- */
  KOS.views.tracker = function (main, openKind) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");

    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", { text: "Exams & Papers" }),
      el("p", { class: "sub", text: "Every exam, assessment and practice paper you've sat — marks, grades, what went well and what didn't, and whether you've actually reviewed it. Topic-linked results feed the RAG struggle flags." })
    ]));

    var kind = openKind === "paper" ? "paper" : "exam";
    var filterSubj = "";
    var sortAsc = false;

    var bar = el("div", { class: "study-tabs", role: "tablist" });
    Object.keys(KINDS).forEach(function (k) {
      bar.appendChild(el("button", { class: "study-tab" + (k === kind ? " active" : ""), role: "tab", "data-tab": k,
        onclick: function () {
          kind = k;
          bar.querySelectorAll(".study-tab").forEach(function (b) { b.classList.toggle("active", b.dataset.tab === kind); });
          render();
        } }, [KINDS[k]]));
    });
    main.appendChild(bar);

    var ctl = el("div", { class: "trk-ctl" });
    var subjSel = el("select", { class: "status-sel", onchange: function () { filterSubj = subjSel.value; render(); } }, [
      el("option", { value: "", text: "All subjects" }),
      el("option", { value: "compsci", text: SUBJ.compsci }),
      el("option", { value: "maths", text: SUBJ.maths }),
      el("option", { value: "it", text: SUBJ.it })
    ]);
    ctl.appendChild(subjSel);
    ctl.appendChild(el("button", { class: "btn", text: "Date ↕", title: "Toggle date sort",
      onclick: function () { sortAsc = !sortAsc; render(); } }));
    ctl.appendChild(el("button", { class: "btn primary", style: "margin-left:auto", text: "+ Log entry",
      onclick: function () { editorModal(kind, null, render); } }));
    main.appendChild(ctl);

    var holder = el("div", {});
    main.appendChild(holder);

    function render() {
      holder.innerHTML = "";
      var rows = T().entries
        .filter(function (e) { return e.kind === kind && (!filterSubj || e.subject === filterSubj); })
        .sort(function (a, b) { return sortAsc ? (a.date < b.date ? -1 : 1) : (a.date > b.date ? -1 : 1); });

      /* summary strip */
      var withPct = rows.filter(function (e) { return pct(e) != null; });
      var avg = withPct.length ? Math.round(withPct.reduce(function (a, e) { return a + pct(e); }, 0) / withPct.length) : null;
      var unreviewed = rows.filter(function (e) { return !e.reviewed; }).length;
      holder.appendChild(el("div", { class: "stat-strip" }, [
        stat(rows.length, kind === "exam" ? "Exams logged" : "Papers logged"),
        stat(avg != null ? avg + "%" : "—", "Average score"),
        stat(unreviewed, "Not yet reviewed"),
        stat(rows.filter(function (e) { return pct(e) != null && pct(e) < 60; }).length, "Below 60%")
      ]));
      function stat(v, k) {
        return el("div", { class: "stat-card" }, [
          el("div", { class: "v", text: String(v) }), el("div", { class: "k", text: k })]);
      }

      if (!rows.length) {
        holder.appendChild(el("p", { class: "fc-empty", text: "Nothing logged yet — “+ Log entry” after your next " + (kind === "exam" ? "assessment" : "paper") + "." }));
        return;
      }

      rows.forEach(function (e) {
        var p = pct(e);
        var tone = p == null ? "" : p >= 75 ? " good" : p >= 60 ? " mid" : " low";
        var row = el("div", { class: "trk-row" + (e.reviewed ? " reviewed" : "") });
        var detail = el("div", { class: "trk-detail", style: "display:none" });

        var revCb = el("input", { type: "checkbox", title: "Reviewed", onchange: function (ev) {
          ev.stopPropagation();
          update(e.id, { reviewed: revCb.checked });
          row.classList.toggle("reviewed", revCb.checked);
        }, onclick: function (ev) { ev.stopPropagation(); } });
        revCb.checked = e.reviewed;

        /* a div, not a <button> — it contains the reviewed checkbox and the
           edit control, and interactive content inside a button is invalid */
        var head = el("div", { class: "trk-head", role: "button", tabindex: "0",
          onkeydown: function (ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); head.click(); } },
          onclick: function () {
            detail.style.display = detail.style.display === "none" ? "" : "none";
          } }, [
          el("span", { class: "trk-date", text: e.date }),
          el("span", { class: "trk-topic" }, [
            el("b", { text: e.topic || e.paper || "(untitled)" }),
            el("span", { class: "trk-sub", text: [e.subject ? SUBJ[e.subject] : null, e.ref, e.topic && e.paper ? e.paper : null].filter(Boolean).join(" · ") })
          ]),
          el("span", { class: "trk-score" + tone, text: p != null ? e.marks + "/" + e.max + " · " + p + "%" : "—" }),
          el("span", { class: "trk-grade", text: e.grade || "" }),
          el("label", { class: "trk-rev", title: "Reviewed?", onclick: function (ev) { ev.stopPropagation(); } }, [revCb]),
          el("span", { class: "mini-btn", text: "✎", role: "button", "aria-label": "Edit", onclick: function (ev) {
            ev.stopPropagation(); editorModal(kind, e, render);
          } })
        ]);
        row.appendChild(head);

        function block(label, text) {
          if (!text) return null;
          return el("div", { class: "trk-block" }, [
            el("b", { text: label }), el("span", { text: text })]);
        }
        [block("Went well", e.well), block("Didn't go well", e.badly), block("Mistakes / notes", e.notes)]
          .forEach(function (b) { if (b) detail.appendChild(b); });
        if (!detail.children.length) detail.appendChild(el("p", { class: "sub", style: "margin:0", text: "No reflections written — edit the entry to add them." }));
        if (e.subject && e.ref) {
          detail.appendChild(el("button", { class: "btn", style: "margin-top:8px", text: "Open " + e.ref + " →",
            onclick: function () { KOS.show("ref", { subject: e.subject, ref: e.ref }); } }));
        }
        row.appendChild(detail);
        holder.appendChild(row);
      });
    }
    render();
  };

  KOS.tracker = { add: add, update: update, remove: remove, pct: pct, forRef: forRef, forSubject: forSubject };
})();
