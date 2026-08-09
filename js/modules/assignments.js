/* Kurenai OS — modules/assignments.js
   課 The Assignment Tracker (Build 6.4) — the Study workspace page, its
   create/edit modal, and the read-only widgets the other surfaces mount.

   Every widget here READS KOS.assignments. None of them writes a copy, so
   the derived surfaces (calendar chip, countdown row, Home card, focus link)
   cannot drift from the record or outlive it.                              */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var A = function () { return KOS.assignments; };

  function prefs() {
    var u = KOS.store.state.ui;
    u.assignments = u.assignments || { subject: "", status: "", due: "", sort: "due" };
    return u.assignments;
  }
  function subjName(sid) {
    return (window.KOS_DATA && KOS_DATA[sid] && KOS_DATA[sid].name) || sid || "No subject";
  }
  function shortSubj(sid) {
    return subjName(sid).replace("Computer Science", "CS").replace("Mathematics", "Maths").replace("IT: Data Analytics", "IT");
  }
  function fmtDue(a) {
    if (!a.due) return "No deadline";
    var t = KOS.srs.todayISO();
    var lbl;
    if (a.due === t) lbl = "Today";
    else if (a.due === KOS.srs.addDays(t, 1)) lbl = "Tomorrow";
    else {
      var p = a.due.split("-");
      lbl = new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    }
    return lbl + (a.dueTime ? " · " + a.dueTime : "");
  }
  function fmtMins(m) {
    if (!m) return "—";
    var h = Math.floor(m / 60), r = m % 60;
    return h ? h + "h" + (r ? " " + r + "m" : "") : r + "m";
  }
  function statusPill(a) {
    var s = A().STATUSES.find(function (x) { return x.v === a.status; }) || A().STATUSES[0];
    return el("span", { class: "asg-status s-" + a.status, text: s.label });
  }
  function progressBar(a) {
    return el("span", { class: "asg-track", title: a.progress + "%" },
      [el("i", { style: "width:" + a.progress + "%" })]);
  }

  /* ================= the page ================= */
  KOS.views.assignments = function (main, arg) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var p = prefs();
    if (typeof arg === "string") p.subject = arg;
    else if (arg && arg.subject !== undefined) p.subject = arg.subject;

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "課 · The work queue" }),
        el("h1", { text: "Assignment Tracker" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "One record per assignment — the calendar, countdowns, Home and the focus timer all read it rather than keeping their own copy." })
        ])
      ]),
      el("div", { class: "dh-actions" }, [
        el("button", { class: "btn primary", text: "＋ New assignment", onclick: function () { editModal(null, refresh); } })
      ])
    ]));

    /* --- the stat band --- */
    var band = el("div", { class: "asg-band" });
    main.appendChild(band);

    /* --- filters --- */
    var subjSel = el("select", { class: "status-sel", "aria-label": "Filter by subject" },
      [el("option", { value: "", text: "All subjects" })].concat(
        Object.keys(window.KOS_DATA || {}).map(function (sid) {
          return el("option", { value: sid, text: subjName(sid) });
        })));
    subjSel.value = p.subject || "";
    var statusSel = el("select", { class: "status-sel", "aria-label": "Filter by status" },
      [el("option", { value: "", text: "Any status" })].concat(
        A().STATUSES.map(function (s) { return el("option", { value: s.v, text: s.label }); })));
    statusSel.value = p.status || "";
    var dueSel = el("select", { class: "status-sel", "aria-label": "Filter by deadline" },
      A().DUE_FILTERS.map(function (d) { return el("option", { value: d.v, text: d.label }); }));
    dueSel.value = p.due || "";
    var sortSel = el("select", { class: "status-sel", "aria-label": "Sort" },
      A().SORTS.map(function (s) { return el("option", { value: s.v, text: s.label }); }));
    sortSel.value = p.sort || "due";
    var searchIn = el("input", { type: "search", class: "todo-in asg-search", placeholder: "Search assignments…", "aria-label": "Search assignments" });

    [subjSel, statusSel, dueSel, sortSel].forEach(function (s) {
      s.addEventListener("change", function () {
        p.subject = subjSel.value; p.status = statusSel.value;
        p.due = dueSel.value; p.sort = sortSel.value;
        KOS.store.save(); refresh();
      });
    });
    searchIn.addEventListener("input", KOS.ui.debounce(function () { refresh(); }, 200));

    main.appendChild(el("div", { class: "asg-tools" }, [searchIn, subjSel, statusSel, dueSel, sortSel]));

    var countLine = el("p", { class: "sub asg-count" });
    var listEl = el("div", { class: "asg-list" });
    main.appendChild(countLine);
    main.appendChild(listEl);

    function refresh() {
      /* the band */
      band.innerHTML = "";
      var c = A().counts(p.subject || null);
      [["Open", c.open, ""], ["Overdue", c.overdue, c.overdue ? "bad" : ""],
       ["In progress", c.inProgress, ""], ["Submitted", c.submitted, ""], ["Complete", c.complete, ""]]
        .forEach(function (x) {
          band.appendChild(el("div", { class: "asg-stat " + x[2] }, [
            el("b", { text: String(x[1]) }), el("span", { text: x[0] })
          ]));
        });

      var rows = A().query({ subject: p.subject || null, status: p.status || null,
        due: p.due || null, search: searchIn.value, sort: p.sort });
      var filtered = !!(p.subject || p.status || p.due || searchIn.value.trim());
      countLine.textContent = rows.length + (rows.length === 1 ? " assignment" : " assignments") + (filtered ? " (filtered)" : "");

      listEl.innerHTML = "";
      if (!rows.length) {
        listEl.appendChild(KOS.medview.emptyState(
          filtered ? "Nothing matches these filters."
            : "No assignments yet. Add the next thing that's due and it appears on the calendar, in your countdowns and on Home.",
          filtered ? [] : [el("button", { class: "btn primary", text: "＋ New assignment", onclick: function () { editModal(null, refresh); } })]));
        return;
      }
      rows.forEach(function (a) { listEl.appendChild(row(a)); });
    }

    function row(a) {
      var overdue = A().isOverdue(a);
      var next = A().nextSubtask(a);
      /* Phase F: the row carries a status <select> and its own buttons,
         so it cannot be an ARIA button; the title is the control. */
      var node = el("div", { class: "asg-row" + (overdue ? " overdue" : "") + " st-" + a.status + " pr-" + a.priority,
        onclick: function (ev) { if (!ev.target.closest("button, select")) detailModal(a.id, refresh); } });

      node.appendChild(el("div", { class: "asg-row-main" }, [
        el("div", { class: "asg-row-top" }, [
          a.priority ? el("span", { class: "asg-prio", title: A().PRIORITIES[a.priority].label,
            text: A().PRIORITIES[a.priority].short }) : null,
          el("button", { type: "button", class: "asg-title", text: a.title, title: a.title,
            onclick: function (ev) { ev.stopPropagation(); detailModal(a.id, refresh); } }),
          statusPill(a)
        ].filter(Boolean)),
        el("div", { class: "asg-row-meta" }, [
          el("span", { class: "asg-chip subj", text: shortSubj(a.subject) }),
          el("span", { class: "asg-chip type", text: A().typeLabel(a.type) }),
          el("span", { class: "asg-chip due" + (overdue ? " overdue" : a.due === KOS.srs.todayISO() ? " today" : ""),
            text: overdue ? "Overdue · " + fmtDue(a) : fmtDue(a) }),
          a.showInCountdown ? el("span", { class: "asg-chip major", title: "Shows in Countdowns", text: "◈ major" }) : null,
          (a.subtasks || []).length ? el("span", { class: "asg-chip", text: (a.subtasks.filter(function (s) { return s.done; }).length) + "/" + a.subtasks.length + " subtasks" }) : null
        ].filter(Boolean)),
        next ? el("div", { class: "asg-next" }, [
          el("span", { class: "asg-next-k", text: "Next" }),
          el("span", { text: next.text })
        ]) : null
      ].filter(Boolean)));

      node.appendChild(el("div", { class: "asg-row-side" }, [
        el("div", { class: "asg-prog" }, [progressBar(a), el("span", { class: "asg-pct", text: a.progress + "%" })]),
        el("button", { class: "mini-btn", text: "Open", onclick: function () { detailModal(a.id, refresh); } })
      ]));
      return node;
    }

    refresh();
  };

  /* ================= create / edit modal ================= */
  function editModal(id, done) {
    var existing = id != null ? A().get(id) : null;
    var a = existing || A().normalise({});
    var overlay = KOS.medview.modalOverlay();
    var f = KOS.medview.field;

    var title = el("input", { type: "text", class: "todo-in", value: a.title || "", placeholder: "e.g. NEA writeup — analysis section" });
    var subj = el("select", { class: "status-sel" },
      [el("option", { value: "", text: "No subject" })].concat(
        Object.keys(window.KOS_DATA || {}).map(function (sid) { return el("option", { value: sid, text: subjName(sid) }); })));
    subj.value = a.subject || "";
    var type = el("select", { class: "status-sel" }, A().TYPES.map(function (t) { return el("option", { value: t.v, text: t.label }); }));
    type.value = a.type || "homework";
    var desc = el("textarea", { class: "todo-in", rows: "2", placeholder: "What is actually being asked for?" });
    desc.value = a.description || "";
    var assigned = el("input", { type: "date", class: "todo-in", value: a.assigned || KOS.srs.todayISO() });
    var due = el("input", { type: "date", class: "todo-in", value: a.due || "" });
    var dueTime = el("input", { type: "time", class: "todo-in", value: a.dueTime || "" });
    var status = el("select", { class: "status-sel" }, A().STATUSES.map(function (s) { return el("option", { value: s.v, text: s.label }); }));
    status.value = a.status || "notStarted";
    var priority = el("select", { class: "status-sel" }, A().PRIORITIES.map(function (x) { return el("option", { value: String(x.v), text: x.label }); }));
    priority.value = String(a.priority || 0);
    var progress = el("input", { type: "number", class: "todo-in", min: "0", max: "100", step: "5", value: String(a.progress || 0) });
    var estimate = el("input", { type: "number", class: "todo-in", min: "0", step: "15", value: String(a.estimateMins || 0), title: "Minutes" });
    var actual = el("input", { type: "number", class: "todo-in", min: "0", step: "15", value: String(a.actualMins || 0), title: "Minutes" });
    var notes = el("textarea", { class: "todo-in", rows: "3", placeholder: "Notes, feedback, what to fix…" });
    notes.value = a.notes || "";

    var inCal = el("input", { type: "checkbox" }); inCal.checked = a.showInCalendar !== false;
    var inCd = el("input", { type: "checkbox" }); inCd.checked = !!a.showInCountdown;

    var alertBox = el("div", { class: "asg-alerts" });
    var chosenAlerts = (a.alerts || []).slice();
    A().ALERTS.forEach(function (al) {
      var b = el("button", { type: "button", class: "asg-alert" + (chosenAlerts.indexOf(al.v) !== -1 ? " on" : ""), text: al.label,
        onclick: function () {
          var i = chosenAlerts.indexOf(al.v);
          if (i === -1) chosenAlerts.push(al.v); else chosenAlerts.splice(i, 1);
          b.classList.toggle("on", chosenAlerts.indexOf(al.v) !== -1);
        } });
      alertBox.appendChild(b);
    });

    /* related topics — free-form "sid:ref", validated against the spec tree */
    var chosenTopics = (a.topics || []).slice();
    var topicWrap = el("div", { class: "asg-topics" });
    var topicIn = el("input", { type: "text", class: "todo-in", "aria-label": "Link a spec topic", placeholder: "e.g. compsci 4.1.1.1 — Enter to add",
      onkeydown: function (e) { if (e.key === "Enter") { e.preventDefault(); addTopic(); } } });
    function addTopic() {
      var raw = topicIn.value.trim().replace(/\s+/g, " ");
      if (!raw) return;
      var parts = raw.split(/[ :]+/);
      var sid = parts[0], ref = parts.slice(1).join(" ");
      if (!window.KOS_DATA || !KOS_DATA[sid] || !ref) { KOS.ui.toast("Use “subject ref”, e.g. compsci 4.1.1.1.", true); return; }
      chosenTopics.push({ subject: sid, ref: ref });
      topicIn.value = "";
      paintTopics();
    }
    function paintTopics() {
      topicWrap.innerHTML = "";
      chosenTopics.forEach(function (t, i) {
        topicWrap.appendChild(el("span", { class: "asg-topic" }, [
          el("span", { text: shortSubj(t.subject) + " " + t.ref }),
          el("button", { type: "button", class: "xbtn", text: "✕", "aria-label": "Remove topic",
            onclick: function () { chosenTopics.splice(i, 1); paintTopics(); } })
        ]));
      });
    }
    paintTopics();

    function save() {
      if (!title.value.trim()) { KOS.ui.toast("An assignment needs a title.", true); return; }
      var patch = {
        title: title.value, subject: subj.value || null, type: type.value,
        description: desc.value, assigned: assigned.value || null,
        due: due.value || null, dueTime: dueTime.value || null,
        status: status.value, priority: priority.value, progress: progress.value,
        estimateMins: estimate.value, actualMins: actual.value,
        notes: notes.value, topics: chosenTopics, alerts: chosenAlerts,
        showInCalendar: inCal.checked, showInCountdown: inCd.checked
      };
      var rec;
      if (existing) {
        var wasStatus = existing.status;
        rec = A().update(existing.id, patch);
        /* route a status change through setStatus so the stamps and the
           one-time governor log stay in one place */
        if (rec && rec.status !== wasStatus) A().setStatus(rec.id, rec.status);
      } else {
        rec = A().add(patch);
        if (rec && rec.status === "complete") A().setStatus(rec.id, "complete");
      }
      if (!rec) { KOS.ui.toast("Could not save that assignment.", true); return; }
      overlay.close();
      KOS.ui.toast(existing ? "Assignment updated." : "Assignment added.");
      done && done();
    }

    overlay.appendChild(el("div", { class: "modal modal-lg asg-modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: existing ? "Edit assignment" : "New assignment" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", onclick: overlay.close })
      ]),
      el("div", { class: "med-form" }, [
        f("Title", title),
        el("div", { class: "med-form-row" }, [f("Subject", subj), f("Type", type)]),
        f("Description", desc),
        el("div", { class: "med-form-row" }, [f("Assigned", assigned), f("Due date", due), f("Due time", dueTime)]),
        el("div", { class: "med-form-row" }, [f("Status", status), f("Priority", priority), f("Progress %", progress)]),
        el("div", { class: "med-form-row" }, [f("Estimated effort (min)", estimate), f("Actual effort (min)", actual)]),
        el("div", { class: "asg-block" }, [el("h4", { text: "Related topics" }), topicWrap, topicIn]),
        el("div", { class: "asg-block" }, [el("h4", { text: "Alerts" }), alertBox]),
        el("div", { class: "asg-block" }, [
          el("h4", { text: "Where it shows" }),
          el("label", { class: "asg-check" }, [inCal, el("span", { text: "Show the deadline on the Calendar" })]),
          el("label", { class: "asg-check" }, [inCd, el("span", { text: "Treat as a major deadline (shows in Countdowns)" })])
        ]),
        f("Notes", notes)
      ]),
      el("div", { class: "lab-controls med-modal-foot" }, [
        existing ? el("button", { class: "btn danger", text: "Delete", onclick: function () {
          KOS.ui.confirm({ title: "Delete this assignment?", danger: true, confirm: "Delete",
            body: "“" + existing.title + "” and everything derived from it — its calendar entry, countdown and Home card — go with it." },
            function () {
              A().remove(existing.id, function () { overlay.close(); KOS.ui.toast("Assignment deleted."); done && done(); });
            });
        } }) : null,
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "Cancel", onclick: overlay.close }),
        el("button", { class: "btn primary", text: "Save", onclick: save })
      ].filter(Boolean))
    ]));
    KOS.ui.openDialog(overlay);
    title.focus();
    return overlay;
  }
  KOS.assignmentEditor = editModal;

  /* ================= the full detail view ================= */
  function detailModal(id, done) {
    var a = A().get(id);
    if (!a) return null;
    var overlay = KOS.medview.modalOverlay();
    var body = el("div", { class: "asg-detail" });

    function repaint() {
      a = A().get(id);
      if (!a) { overlay.close(); done && done(); return; }
      body.innerHTML = "";
      var overdue = A().isOverdue(a);

      body.appendChild(el("div", { class: "asg-d-head" }, [
        el("div", {}, [
          el("h3", { text: a.title }),
          el("div", { class: "asg-d-sub" }, [
            el("span", { text: shortSubj(a.subject) }), " · ",
            el("span", { text: A().typeLabel(a.type) }), " · ",
            el("span", { class: overdue ? "asg-late" : "", text: overdue ? "Overdue — " + fmtDue(a) : fmtDue(a) })
          ])
        ]),
        statusPill(a)
      ]));

      /* status transitions, spelled out rather than hidden in a dropdown */
      var actions = el("div", { class: "asg-d-actions" });
      A().STATUSES.forEach(function (s) {
        if (s.v === a.status) return;
        var label = s.v === "complete" ? "✓ Complete" : s.v === "submitted" ? "⇪ Submitted"
          : s.v === "notStarted" ? "↺ Reopen" : s.label;
        if ((a.status === "complete" || a.status === "submitted") && s.v === "inProgress") label = "↺ Reopen";
        actions.appendChild(el("button", { class: "btn" + (s.v === "complete" ? " primary" : ""), text: label,
          onclick: function () { A().setStatus(id, s.v); repaint(); done && done(); } }));
      });
      body.appendChild(actions);

      /* progress + effort */
      body.appendChild(el("div", { class: "asg-d-grid" }, [
        stat("Progress", a.progress + "%", progressBar(a)),
        stat("Priority", A().PRIORITIES[a.priority].label),
        stat("Estimated", fmtMins(a.estimateMins)),
        stat("Actual", fmtMins(a.actualMins)),
        stat("Assigned", a.assigned || "—"),
        stat("Deadline", fmtDue(a))
      ]));

      if (a.description) body.appendChild(block("Description", el("p", { class: "asg-d-text", text: a.description })));

      /* subtasks */
      var subWrap = el("div", { class: "asg-subs" });
      (a.subtasks || []).forEach(function (s) {
        subWrap.appendChild(el("div", { class: "asg-sub" + (s.done ? " done" : "") }, [
          el("button", { class: "rem-check sm" + (s.done ? " on" : ""), text: s.done ? "✓" : "",
            "aria-label": (s.done ? "Untick " : "Tick ") + s.text,
            onclick: function () { A().subToggle(id, s.id, !s.done); repaint(); done && done(); } }),
          el("span", { class: "asg-sub-t", text: s.text }),
          el("button", { class: "xbtn", text: "✕", "aria-label": "Delete subtask",
            onclick: function () { A().subRemove(id, s.id); repaint(); done && done(); } })
        ]));
      });
      var subIn = el("input", { type: "text", class: "todo-in", placeholder: "Add a subtask…",
        onkeydown: function (e) {
          if (e.key === "Enter" && subIn.value.trim()) { A().subAdd(id, subIn.value.trim()); repaint(); done && done(); }
        } });
      subWrap.appendChild(subIn);
      body.appendChild(block("Subtasks", subWrap));

      /* related topics — navigable */
      if ((a.topics || []).length) {
        var tw = el("div", { class: "asg-topics" });
        a.topics.forEach(function (t) {
          tw.appendChild(el("button", { class: "asg-topic link", text: shortSubj(t.subject) + " " + t.ref,
            onclick: function () { overlay.close(); KOS.show("ref", { subject: t.subject, ref: t.ref }); } }));
        });
        body.appendChild(block("Related topics", tw));
      }

      /* attachments — the existing store, under this assignment's ref */
      var attWrap = el("div", { class: "asg-att" });
      body.appendChild(block("Attachments", attWrap));
      if (KOS.attach && KOS.attach.available && KOS.attach.available()) {
        var fileIn = el("input", { type: "file", style: "display:none", onchange: function () {
          if (!fileIn.files[0]) return;
          KOS.attach.add(a.subject || "_", A().attachRef(a), fileIn.files[0], function (err) {
            if (err) KOS.ui.toast("Upload failed: " + err.message, true);
            else { KOS.ui.toast("Attached."); repaint(); }
            fileIn.value = "";
          });
        } });
        attWrap.appendChild(fileIn);
        A().attachmentsFor(a, function (err, rows) {
          (rows || []).forEach(function (r) {
            attWrap.appendChild(el("div", { class: "asg-att-row" }, [
              el("span", { text: r.name }),
              el("button", { class: "xbtn", text: "✕", "aria-label": "Remove attachment",
                onclick: function () { KOS.attach.remove(r.id, function () { repaint(); }); } })
            ]));
          });
          attWrap.appendChild(el("button", { class: "mini-btn", text: "⇪ Attach a file…", onclick: function () { fileIn.click(); } }));
        });
      } else {
        attWrap.appendChild(el("p", { class: "sub", text: "File attachments need IndexedDB, which this context doesn't provide." }));
      }

      if (a.notes) body.appendChild(block("Notes", el("p", { class: "asg-d-text", text: a.notes })));

      body.appendChild(el("div", { class: "lab-controls med-modal-foot" }, [
        a.subject ? el("button", { class: "btn", text: "◉ Focus on this", onclick: function () {
          overlay.close();
          KOS.show("focus", { assignmentId: id });
        } }) : null,
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "✎ Edit", onclick: function () { overlay.close(); editModal(id, done); } }),
        el("button", { class: "btn", text: "Close", onclick: overlay.close })
      ].filter(Boolean)));
    }
    function stat(k, v, extra) {
      return el("div", { class: "asg-d-stat" }, [
        el("span", { class: "k", text: k }), el("b", { text: v }), extra || null
      ].filter(Boolean));
    }
    function block(h, node) {
      return el("div", { class: "asg-block" }, [el("h4", { text: h }), node]);
    }

    overlay.appendChild(el("div", { class: "modal modal-lg asg-detail-modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: "課 Assignment" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", onclick: overlay.close })
      ]),
      body
    ]));
    KOS.ui.openDialog(overlay);
    repaint();
    return overlay;
  }
  KOS.assignmentDetail = detailModal;

  /* ================= the derived widgets =================
     Read-only views other surfaces mount. None of them writes. */

  /* Home: urgent work. */
  KOS.assignmentsUrgentCard = function () {
    var rows = A().urgent(4);
    if (!rows.length) return null;
    var wrap = el("div", { class: "asg-urgent" });
    wrap.appendChild(el("div", { class: "asg-urgent-h" }, [
      el("b", { text: "Assignments due" }),
      el("button", { class: "mini-btn", text: "Tracker →", onclick: function () { KOS.show("assignments"); } })
    ]));
    rows.forEach(function (a) {
      var overdue = A().isOverdue(a);
      wrap.appendChild(el("button", { class: "asg-urgent-row" + (overdue ? " overdue" : ""),
        onclick: function () { KOS.assignmentDetail(a.id, function () { KOS.show("home", undefined, { _nav: true }); }); } }, [
        el("span", { class: "au-t", text: a.title }),
        el("span", { class: "au-m", text: shortSubj(a.subject) + " · " + (overdue ? "overdue" : fmtDue(a)) }),
        el("span", { class: "asg-track sm" }, [el("i", { style: "width:" + a.progress + "%" })])
      ]));
    });
    return wrap;
  };

  /* the alert ticker — in-app only, same honesty as the calendar's */
  function tick() {
    if (!KOS.assignments) return;
    KOS.assignments.checkAlerts().forEach(function (f) {
      var when = f.minutes === 0 ? "due now" : (A().ALERTS.find(function (x) { return x.v === f.minutes; }) || {}).label || "due soon";
      KOS.ui.toast("課 " + f.assignment.title + " — " + when, f.minutes === 0);
    });
  }
  setTimeout(function () { tick(); setInterval(tick, 60000); }, 7000);
})();
