/* Kurenai OS — modules/assignments.js
   課 The Assignment Tracker (Build 6.4) — the Study workspace page, its
   create/edit dialog, and the detail the other surfaces open.

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
  function dueLine(a) {
    if (!a.due) return { text: "No deadline", late: false };
    var t = KOS.srs.todayISO(), d = KOS.srs.daysBetween(t, a.due);
    if (A().isOverdue(a)) { var n = Math.max(1, -d); return { text: "Overdue · " + n + (n === 1 ? " day" : " days"), late: true }; }
    if (d === 0) return { text: "Today" + (a.dueTime ? " · " + a.dueTime : ""), late: false, soon: true };
    if (d === 1) return { text: "Tomorrow" + (a.dueTime ? " · " + a.dueTime : ""), late: false, soon: true };
    if (d < 7) return { text: "in " + d + " days", late: false };
    return { text: fmtDue(a), late: false };
  }
  function statusChip(a) {
    var s = A().STATUSES.find(function (x) { return x.v === a.status; }) || A().STATUSES[0];
    var late = A().isOverdue(a);
    var tone = late ? "crimson" : a.status === "inProgress" ? "amber" : a.status === "blocked" ? "red" : (a.status === "complete" || a.status === "submitted") ? "green" : "muted";
    return el("span", { class: "k-chip", "data-ui": "asg.status", "data-tone": tone, text: late ? "Overdue" : s.label });
  }
  function progressBar(a) {
    return el("span", { class: "k-bar k-asg-track", "data-ui": "asg.track", role: "img", "aria-label": a.progress + "% done",
      style: "--p: " + a.progress + "%; --bar-c: " + HUE(a.subject) }, [el("i")]);
  }
  function HUE(sid) { return { compsci: "var(--cs)", maths: "var(--maths)", it: "var(--it)" }[sid] || "var(--muted)"; }

  /* ================= the page (Graphite frame 9c) =================
     The queue in groups — Overdue, This week, Later, No deadline, Done —
     with the filters as pills above it, and the selected assignment's
     detail in a panel beside the list rather than a dialog over it. */
  var selectedId = null;
  KOS.views.assignments = function (main, arg) {
    KOS.shell.tree("none");
    var p = prefs();
    if (typeof arg === "string") p.subject = arg;
    else if (arg && arg.subject !== undefined) p.subject = arg.subject;
    if (arg && arg.id != null) selectedId = arg.id;

    var sub = el("span");
    var head = KOS.ui.pageHeader({ kicker: "課 · The work queue", title: "Assignments", sub: " ",
      actions: [el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "＋ New assignment",
        onclick: function () { editModal(null, function (rec) { if (rec) selectedId = rec.id; refresh(); }); } })] });
    var subSlot = head.querySelector("[data-ui~='part.board']");
    if (subSlot) { subSlot.textContent = ""; subSlot.appendChild(sub); }

    function pillSelect(label, value, options, onchange) {
      var s = el("select", { class: "k-pill-select", "data-ui": "ui.status-select", "aria-label": label },
        options.map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
      s.value = value;
      s.addEventListener("change", function () { onchange(s.value); KOS.store.save(); refresh(); });
      return s;
    }
    var tools = el("div", { class: "k-asg-tools", "data-ui": "asg.tools" }, [
      pillSelect("Filter by subject", p.subject || "", [["", "All subjects"]].concat(Object.keys(window.KOS_DATA || {}).filter(function (k) { return KOS_DATA[k] && KOS_DATA[k].sections; }).map(function (sid) { return [sid, subjName(sid)]; })), function (v) { p.subject = v; }),
      pillSelect("Filter by status", p.status || "", [["", "Any status"]].concat(A().STATUSES.map(function (s) { return [s.v, s.label]; })), function (v) { p.status = v; }),
      pillSelect("Filter by deadline", p.due || "", A().DUE_FILTERS.map(function (d) { return [d.v, d.label]; }), function (v) { p.due = v; }),
      pillSelect("Sort", p.sort || "due", A().SORTS.map(function (s) { return [s.v, "Sort: " + s.label.toLowerCase()]; }), function (v) { p.sort = v; })
    ]);
    var listEl = el("div", { class: "k-asg-list", "data-ui": "asg.list" });
    var panel = el("aside", { class: "k-asg-panel", "data-ui": "asg.detail", "aria-label": "Assignment" });
    main.appendChild(el("div", { class: "k-asg" }, [
      el("div", { class: "k-asg-col" }, [head, tools, listEl]),
      panel
    ]));

    function refresh() {
      var c = A().counts(p.subject || null);
      var rowsAll = A().query({ subject: p.subject || null, sort: p.sort });
      var week = rowsAll.filter(function (a) { return A().OPEN_STATUSES.indexOf(a.status) !== -1 && a.due && !A().isOverdue(a) && KOS.srs.daysBetween(KOS.srs.todayISO(), a.due) < 7; }).length;
      sub.textContent = [c.overdue ? c.overdue + " overdue" : null, week ? week + " due in the next week" : null].filter(Boolean).join(", ") ||
        (c.open ? c.open + " open, none due this week." : "Nothing open.");
      if (sub.textContent.slice(-1) !== ".") sub.textContent += ".";

      var rows = A().query({ subject: p.subject || null, status: p.status || null, due: p.due || null, sort: p.sort });
      var filtered = !!(p.subject || p.status || p.due);
      listEl.innerHTML = "";
      if (!rows.length) {
        listEl.appendChild(KOS.ui.emptyState({ compact: true, mark: "課",
          body: filtered ? "Nothing matches these filters."
            : "No assignments yet. Add the next thing that's due and it appears on the calendar, in your countdowns and on Home.",
          action: filtered ? null : el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "＋ New assignment",
            onclick: function () { editModal(null, function (rec) { if (rec) selectedId = rec.id; refresh(); }); } }) }));
        selectedId = null;
        paintPanel();
        return;
      }
      var today = KOS.srs.todayISO();
      var groups = [["Overdue", []], ["This week", []], ["Later", []], ["No deadline", []], ["Done", []]];
      rows.forEach(function (a) {
        if (a.status === "complete" || a.status === "submitted") groups[4][1].push(a);
        else if (A().isOverdue(a)) groups[0][1].push(a);
        else if (!a.due) groups[3][1].push(a);
        else if (KOS.srs.daysBetween(today, a.due) < 7) groups[1][1].push(a);
        else groups[2][1].push(a);
      });
      if (selectedId == null || !rows.some(function (a) { return a.id === selectedId; })) {
        var first = groups.filter(function (g) { return g[1].length; })[0];
        selectedId = first ? first[1][0].id : null;
      }
      groups.forEach(function (g, gi) {
        if (!g[1].length) return;
        listEl.appendChild(el("h2", { class: "k-asg-group", "data-state": gi === 0 ? "late" : null, text: g[0] + " · " + g[1].length }));
        g[1].forEach(function (a) { listEl.appendChild(row(a)); });
      });
      paintPanel();
    }

    function row(a) {
      var d = dueLine(a);
      var next = A().nextSubtask(a);
      var done = a.status === "complete" || a.status === "submitted";
      var node = el("div", { class: "k-asg-row", "data-ui": "asg.row", style: "--c: " + HUE(a.subject),
        "data-state": [a.id === selectedId ? "selected" : null, done ? "done" : null].filter(Boolean).join(" ") || null,
        onclick: function (ev) { if (!ev.target.closest("button, select")) select(a.id); } }, [
        el("span", { class: "k-asg-bar", "aria-hidden": "true" }),
        el("div", { class: "k-asg-main" }, [
          el("div", { class: "k-asg-titlerow" }, [
            a.priority ? el("span", { class: "k-asg-prio", "data-ui": "asg.priority", title: A().PRIORITIES[a.priority].label + " priority",
              text: A().PRIORITIES[a.priority].short }) : null,
            el("button", { type: "button", class: "k-asg-title", "data-ui": "asg.title", text: a.title, title: a.title,
              "aria-pressed": String(a.id === selectedId), onclick: function () { select(a.id); } }),
            a.showInCountdown ? el("span", { class: "k-asg-major", title: "A major deadline — shows in Countdowns", text: "◈" }) : null
          ].filter(Boolean)),
          el("div", { class: "k-asg-sub" }, [shortSubj(a.subject) + " · " + A().typeLabel(a.type).replace(" / NEA", "") +
            (next ? " · Next: " + next.text : "")])
        ]),
        el("div", { class: "k-asg-prog" }, [progressBar(a), el("span", { class: "k-mono k-muted", text: a.progress + "%" })]),
        el("span", { class: "k-asg-due", "data-state": d.late ? "late" : d.soon ? "soon" : null, text: done ? A().STATUSES.find(function (x) { return x.v === a.status; }).label : d.text }),
        statusChip(a),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm k-asg-open", "aria-label": "Open", title: "Open " + a.title, text: "›",
          onclick: function () { select(a.id); } })
      ].filter(Boolean));
      return node;
    }
    function select(id) { selectedId = id; refresh(); }
    function paintPanel() {
      panel.innerHTML = "";
      if (selectedId == null || !A().get(selectedId)) {
        panel.appendChild(KOS.ui.emptyState({ compact: true, body: "Select an assignment to see its brief, subtasks and progress." }));
        return;
      }
      detailBody(panel, selectedId, { onChange: refresh, onClose: function () { selectedId = null; paintPanel(); refresh(); } });
    }

    refresh();
  };

  /* the one detail body — the page's panel and the dialog other surfaces
     open (Home, Calendar, search) render the same thing */
  function detailBody(host, id, o) {
    o = o || {};
    function repaint() {
      var a = A().get(id);
      host.innerHTML = "";
      if (!a) { if (o.onGone) o.onGone(); return; }
      var d = dueLine(a);
      host.appendChild(el("div", { class: "k-asg-dhead" }, [
        el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "課" }),
        el("span", { class: "k-kicker", text: "Assignment" }),
        el("span", { class: "k-spacer" }),
        el("button", { type: "button", class: "k-btn k-btn--sm", text: "✎ Edit", onclick: function () {
          if (o.beforeEdit) o.beforeEdit();
          editModal(id, function () { repaint(); o.onChange && o.onChange(); });
        } }),
        o.onClose ? el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Close", text: "✕", onclick: o.onClose }) : null
      ].filter(Boolean)));
      host.appendChild(el("div", {}, [
        el("h2", { class: "k-asg-dtitle", text: a.title }),
        el("div", { class: "k-asg-chips" }, [
          el("span", { class: "k-chip", style: "--chip-c: " + HUE(a.subject), text: subjName(a.subject) }),
          el("span", { class: "k-chip", "data-tone": "muted", text: A().typeLabel(a.type) }),
          a.priority ? el("span", { class: "k-chip", "data-tone": "amber", text: "Priority · " + A().PRIORITIES[a.priority].label }) : null,
          a.showInCountdown ? el("span", { class: "k-chip", "data-tone": "crimson", text: "◈ major" }) : null,
          el("span", { class: "k-chip", "data-tone": d.late ? "crimson" : "muted", title: "Deadline: " + fmtDue(a), text: d.late ? d.text : "Deadline · " + fmtDue(a) })
        ].filter(Boolean))
      ]));
      host.appendChild(el("div", { class: "k-asg-stats" }, [
        stat("Progress", a.progress + "%"),
        stat("Estimated", fmtMins(a.estimateMins)),
        stat("Actual", fmtMins(a.actualMins))
      ]));
      if (a.description) host.appendChild(block("Brief", el("p", { class: "k-asg-text", text: a.description })));

      /* subtasks: tick, delete, add */
      var subs = a.subtasks || [];
      var subWrap = el("div", { class: "k-asg-subs" });
      subs.forEach(function (s) {
        var cb = el("input", { type: "checkbox", class: "k-box", "aria-label": (s.done ? "Untick " : "Tick ") + s.text,
          onchange: function () { A().subToggle(id, s.id, cb.checked); repaint(); o.onChange && o.onChange(); } });
        cb.checked = !!s.done;
        subWrap.appendChild(el("div", { class: "k-asg-sub", "data-state": s.done ? "done" : null }, [
          cb, el("span", { class: "k-asg-sub-t", text: s.text }),
          el("button", { type: "button", class: "k-asg-x", "aria-label": "Delete subtask", text: "✕",
            onclick: function () { A().subRemove(id, s.id); repaint(); o.onChange && o.onChange(); } })
        ]));
      });
      var subIn = el("input", { type: "text", class: "k-asg-subin", "aria-label": "Add a subtask", placeholder: "+ Add a subtask…",
        onkeydown: function (e) {
          if (e.key === "Enter" && subIn.value.trim()) { A().subAdd(id, subIn.value.trim()); repaint(); o.onChange && o.onChange(); }
        } });
      subWrap.appendChild(subIn);
      host.appendChild(el("section", { class: "k-asg-block", "aria-label": "Subtasks" }, [
        el("div", { class: "k-asg-blockhead" }, [el("h3", { class: "k-kicker", text: "Subtasks" }),
          subs.length ? el("span", { class: "k-mono k-muted", text: subs.filter(function (s) { return s.done; }).length + " / " + subs.length }) : null].filter(Boolean)),
        subWrap
      ]));

      if ((a.topics || []).length) {
        host.appendChild(block("Related topics", el("div", { class: "k-asg-chips" }, a.topics.map(function (t) {
          return el("button", { type: "button", class: "k-chip", "data-ui": "asg.topic", style: "--chip-c: " + HUE(t.subject),
            text: shortSubj(t.subject) + " " + t.ref, onclick: function () { if (o.onLeave) o.onLeave(); KOS.show("ref", { subject: t.subject, ref: t.ref }); } });
        }))));
      }

      /* attachments — the existing store, under this assignment's ref */
      var attWrap = el("div", { class: "k-asg-att" });
      host.appendChild(block("Attachments", attWrap));
      if (KOS.attach && KOS.attach.available && KOS.attach.available()) {
        var fileIn = el("input", { type: "file", class: "sr-only", tabindex: "-1", "aria-hidden": "true", onchange: function () {
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
            attWrap.appendChild(el("div", { class: "k-asg-sub" }, [
              el("span", { class: "k-asg-sub-t", text: r.name }),
              el("button", { type: "button", class: "k-asg-x", "aria-label": "Remove attachment", text: "✕",
                onclick: function () { KOS.attach.remove(r.id, function () { repaint(); }); } })
            ]));
          });
          attWrap.appendChild(el("button", { type: "button", class: "k-link", text: "⇪ Attach a file…", onclick: function () { fileIn.click(); } }));
        });
      } else {
        attWrap.appendChild(el("p", { class: "k-muted", text: "File attachments need IndexedDB, which this context doesn't provide." }));
      }
      if (a.notes) host.appendChild(block("Notes", el("p", { class: "k-asg-text", text: a.notes })));

      /* the way forward: focus on it, and the status transitions spelled out */
      var actions = el("div", { class: "k-asg-actions", "data-ui": "asg.detail-actions" });
      A().STATUSES.forEach(function (s) {
        if (s.v === a.status) return;
        var label = s.v === "complete" ? "✓ Complete" : s.v === "submitted" ? "⇪ Submitted"
          : s.v === "notStarted" ? "↺ Reopen" : s.label;
        if ((a.status === "complete" || a.status === "submitted") && s.v === "inProgress") label = "↺ Reopen";
        actions.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", text: label,
          onclick: function () { A().setStatus(id, s.v); repaint(); o.onChange && o.onChange(); } }));
      });
      host.appendChild(el("div", { class: "k-asg-foot" }, [
        a.subject ? el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "◉ Focus on this", onclick: function () {
          if (o.onLeave) o.onLeave();
          KOS.show("focus", { assignmentId: id });
        } }) : null,
        actions
      ].filter(Boolean)));
    }
    function stat(k, v) {
      return el("div", { class: "k-asg-stat" }, [el("span", { text: k }), el("b", { text: v })]);
    }
    function block(h, node) {
      return el("section", { class: "k-asg-block", "aria-label": h }, [el("h3", { class: "k-kicker", text: h }), node]);
    }
    repaint();
    return { repaint: repaint };
  }

  /* ================= create / edit ================= */
  function editModal(id, done) {
    var existing = id != null ? A().get(id) : null;
    var a = existing || A().normalise({});
    var overlay = el("div", { class: "k-dialog-overlay" });
    overlay.close = function () { overlay.remove(); };
    function f(label, control, wide) {
      return el("label", { class: "k-field" + (wide ? " k-field--wide" : "") }, [el("span", { class: "k-field-label", text: label }), control]);
    }
    function input(type, value, attrs) {
      var i = el("input", Object.assign({ type: type, class: "k-input" }, attrs || {}));
      i.value = value == null ? "" : String(value);
      return i;
    }
    function select(options, value) {
      var s = el("select", { class: "k-input" }, options.map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
      s.value = value;
      return s;
    }

    var title = input("text", a.title || "", { placeholder: "e.g. NEA writeup — analysis section" });
    var subj = select([["", "No subject"]].concat(Object.keys(window.KOS_DATA || {}).filter(function (k) { return KOS_DATA[k] && KOS_DATA[k].sections; }).map(function (sid) { return [sid, subjName(sid)]; })), a.subject || "");
    var type = select(A().TYPES.map(function (t) { return [t.v, t.label]; }), a.type || "homework");
    var desc = el("textarea", { class: "k-input", rows: "2", placeholder: "What is actually being asked for?" });
    desc.value = a.description || "";
    var assigned = input("date", a.assigned || KOS.srs.todayISO());
    var due = input("date", a.due || "");
    var dueTime = input("time", a.dueTime || "");
    var status = select(A().STATUSES.map(function (s) { return [s.v, s.label]; }), a.status || "notStarted");
    var priority = select(A().PRIORITIES.map(function (x) { return [String(x.v), x.label]; }), String(a.priority || 0));
    var progress = input("number", a.progress || 0, { min: "0", max: "100", step: "5" });
    var estimate = input("number", a.estimateMins || 0, { min: "0", step: "15", title: "Minutes" });
    var actual = input("number", a.actualMins || 0, { min: "0", step: "15", title: "Minutes" });
    var notes = el("textarea", { class: "k-input", rows: "3", placeholder: "Notes, feedback, what to fix…" });
    notes.value = a.notes || "";
    var inCal = el("input", { type: "checkbox", class: "k-box" }); inCal.checked = a.showInCalendar !== false;
    var inCd = el("input", { type: "checkbox", class: "k-box" }); inCd.checked = !!a.showInCountdown;

    var alertBox = el("div", { class: "k-asg-chips", role: "group", "aria-label": "Alerts" });
    var chosenAlerts = (a.alerts || []).slice();
    A().ALERTS.forEach(function (al) {
      var b = el("button", { type: "button", class: "k-qz-pill", "aria-pressed": String(chosenAlerts.indexOf(al.v) !== -1), text: al.label,
        onclick: function () {
          var i = chosenAlerts.indexOf(al.v);
          if (i === -1) chosenAlerts.push(al.v); else chosenAlerts.splice(i, 1);
          b.setAttribute("aria-pressed", String(chosenAlerts.indexOf(al.v) !== -1));
        } });
      alertBox.appendChild(b);
    });

    /* related topics — "subject ref", validated against the spec tree */
    var chosenTopics = (a.topics || []).slice();
    var topicWrap = el("div", { class: "k-asg-chips" });
    var topicIn = input("text", "", { "aria-label": "Link a spec topic", placeholder: "e.g. compsci 4.1.1.1 — Enter to add",
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
        topicWrap.appendChild(el("span", { class: "k-chip", style: "--chip-c: " + HUE(t.subject) }, [
          shortSubj(t.subject) + " " + t.ref,
          el("button", { type: "button", class: "k-asg-x", "aria-label": "Remove topic", text: "✕",
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
      done && done(rec);
    }

    overlay.appendChild(el("div", { class: "k-dialog k-asg-form", "data-ui": "ui.dialog asg.modal" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: existing ? "Edit assignment" : "New assignment" }),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Close", text: "✕", onclick: overlay.close })
      ]),
      el("div", { class: "k-dialog-body k-asg-grid", "data-ui": "ui.form" }, [
        f("Title", title, true),
        f("Subject", subj), f("Type", type),
        f("Description", desc, true),
        f("Assigned", assigned), f("Due date", due), f("Due time", dueTime),
        f("Status", status), f("Priority", priority), f("Progress %", progress),
        f("Estimated effort (min)", estimate), f("Actual effort (min)", actual),
        el("div", { class: "k-field k-field--wide" }, [el("span", { class: "k-field-label", text: "Related topics" }), topicWrap, topicIn]),
        el("div", { class: "k-field k-field--wide" }, [el("span", { class: "k-field-label", text: "Alerts" }), alertBox]),
        el("div", { class: "k-field k-field--wide" }, [
          el("span", { class: "k-field-label", text: "Where it shows" }),
          el("label", { class: "k-check" }, [inCal, el("span", { text: "Show the deadline on the Calendar" })]),
          el("label", { class: "k-check" }, [inCd, el("span", { text: "Treat as a major deadline (shows in Countdowns)" })])
        ]),
        f("Notes", notes, true)
      ]),
      el("div", { class: "k-dialog-foot" }, [
        existing ? el("button", { type: "button", class: "k-btn k-btn--danger", "data-intent": "danger", text: "Delete", onclick: function () {
          KOS.ui.confirm({ title: "Delete this assignment?", danger: true, confirm: "Delete",
            body: "“" + existing.title + "” and everything derived from it — its calendar entry, countdown and Home card — go with it." },
            function () {
              A().remove(existing.id, function () { overlay.close(); KOS.ui.toast("Assignment deleted."); done && done(null); });
            });
        } }) : null,
        el("span", { class: "k-spacer" }),
        el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: overlay.close }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Save", onclick: save })
      ].filter(Boolean))
    ]));
    KOS.ui.openDialog(overlay);
    title.focus();
    return overlay;
  }
  KOS.assignmentEditor = editModal;

  /* ================= the detail as a dialog =================
     for the surfaces that are not the tracker: Home, Calendar, search */
  function detailModal(id, done) {
    if (!A().get(id)) return null;
    var overlay = el("div", { class: "k-dialog-overlay" });
    overlay.close = function () { overlay.remove(); };
    var box = el("div", { class: "k-dialog k-asg-dialog", "data-ui": "ui.dialog asg.detail-modal", "aria-label": "Assignment" });
    overlay.appendChild(box);
    KOS.ui.openDialog(overlay, { label: "Assignment" });
    detailBody(box, id, {
      onChange: function () { done && done(); },
      onClose: overlay.close,
      onLeave: overlay.close,
      beforeEdit: overlay.close,
      onGone: function () { overlay.close(); done && done(); }
    });
    return overlay;
  }
  KOS.assignmentDetail = detailModal;

  /* the alert ticker — in-app only, same honesty as the calendar's */
  function tick() {
    if (!KOS.assignments) return;
    KOS.assignments.checkAlerts().forEach(function (f) {
      var when = f.minutes === 0 ? "due now" : (A().ALERTS.find(function (x) { return x.v === f.minutes; }) || {}).label || "due soon";
      KOS.ui.toast("課 " + f.assignment.title + " — " + when, f.minutes === 0);
      if (KOS.notify) KOS.notify.push({ id: "asg:" + f.assignment.id + ":" + f.assignment.due + ":" + (f.assignment.dueTime || "") + ":" + f.minutes,
        kind: "assignment", title: f.assignment.title, body: "Assignment · " + when, view: "assignments" });
    });
  }
  setTimeout(function () { tick(); setInterval(tick, 60000); }, 7000);
})();
