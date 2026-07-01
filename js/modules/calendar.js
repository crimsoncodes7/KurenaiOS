/* Kurenai OS — modules/calendar.js
   Integrated calendar (FR-4.2) + deadline tracking (FR-3.6).

   Deadlines are NOT a separate store: they are calendar events tagged
   type "exam" or "deadline", read back out through KOS.calendar.deadlines().
   Reminders are in-app only — a toast + home banner when a deadline falls
   within the configurable threshold. No service worker, no push API.      */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var TYPES = [
    ["exam", "Exam"], ["deadline", "Deadline"], ["study", "Study block"],
    ["lesson", "Lesson"], ["personal", "Personal"]
  ];
  var TYPE_LABEL = {};
  TYPES.forEach(function (t) { TYPE_LABEL[t[0]] = t[1]; });
  var DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  function cal() { return store.state.calendar; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(y, m, d) { return y + "-" + pad(m + 1) + "-" + pad(d); }
  function parseISO(s) { var p = s.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function dowIdx(dateISO) { return (parseISO(dateISO).getDay() + 6) % 7; } // Mon=0

  /* ---------------- data ---------------- */
  function addEvent(ev) {
    var c = cal();
    ev.id = c.nextId++;
    ev.recur = ev.recur || "none";
    c.events.push(ev);
    store.save();
    return ev;
  }
  function updateEvent(id, patch) {
    var ev = cal().events.find(function (e) { return e.id === id; });
    if (!ev) return null;
    Object.keys(patch).forEach(function (k) { ev[k] = patch[k]; });
    store.save();
    return ev;
  }
  function deleteEvent(id) {
    var c = cal();
    var i = c.events.findIndex(function (e) { return e.id === id; });
    if (i !== -1) { c.events.splice(i, 1); store.save(); }
  }

  /* occurrences of every event on a given date (handles weekly recurrence) */
  function eventsOn(dateISO) {
    return cal().events.filter(function (e) {
      if (e.date === dateISO) return true;
      if (e.recur === "weekly" && e.date <= dateISO && dowIdx(e.date) === dowIdx(dateISO)) return true;
      return false;
    });
  }

  /* upcoming exams/deadlines with day counts, nearest first (FR-3.6) */
  function deadlines(limit) {
    var today = KOS.srs.todayISO();
    var out = cal().events
      .filter(function (e) { return (e.type === "exam" || e.type === "deadline") && e.date >= today; })
      .map(function (e) {
        return { ev: e, days: KOS.srs.daysBetween(today, e.date) };
      })
      .sort(function (a, b) { return a.days - b.days; });
    return limit ? out.slice(0, limit) : out;
  }

  /* ---------------- sample data (placeholders — replace with real dates) ---------------- */
  function seedSamples() {
    var c = cal();
    if (c.seeded) return;
    c.seeded = true;
    var t = KOS.srs.todayISO();
    [
      { title: "SAMPLE — Mock exam (edit me)", date: KOS.srs.addDays(t, 5), time: "09:00", type: "exam", subject: "maths", recur: "none" },
      { title: "SAMPLE — Coursework deadline (edit me)", date: KOS.srs.addDays(t, 12), time: null, type: "deadline", subject: "it", recur: "none" },
      { title: "SAMPLE — CS study block (edit me)", date: KOS.srs.addDays(t, 1), time: "16:30", type: "study", subject: "compsci", ref: "4.2.3.1", recur: "none" },
      { title: "SAMPLE — Weekly maths lesson (edit me)", date: KOS.srs.addDays(t, 2), time: "11:00", type: "lesson", subject: "maths", recur: "weekly" }
    ].forEach(addEvent);
  }

  /* ---------------- in-app reminders ---------------- */
  function checkReminders() {
    var c = cal(), today = KOS.srs.todayISO();
    var near = deadlines().filter(function (d) { return d.days <= c.notifyDays; });
    near.forEach(function (d) {
      var key = d.ev.id + "|" + today;
      if (c.notified[key]) return;
      c.notified[key] = true;
      KOS.ui.toast("⏰ " + d.ev.title + " — " + (d.days === 0 ? "TODAY" : d.days + (d.days === 1 ? " day" : " days") + " away"), d.days <= 1);
    });
    /* prune stale notified keys */
    Object.keys(c.notified).forEach(function (k) {
      if (k.split("|")[1] !== today) delete c.notified[k];
    });
    store.save();
    return near;
  }

  /* ---------------- countdown widget (home + subject dash) ---------------- */
  function countdownWidget(sid) {
    var list = deadlines().filter(function (d) { return !sid || d.ev.subject === sid || !d.ev.subject; }).slice(0, 3);
    var wrap = el("div", { class: "dl-widget" });
    wrap.appendChild(el("div", { class: "dl-h" }, [
      el("b", { text: "Countdowns" }),
      el("button", { class: "mini-btn", text: "Calendar →", onclick: function () { KOS.show("calendar"); } })
    ]));
    if (!list.length) {
      wrap.appendChild(el("p", { class: "sub", text: "No upcoming exams or deadlines. Add them in the calendar." }));
      return wrap;
    }
    list.forEach(function (d) {
      var tone = d.days <= 3 ? "hot" : d.days <= 7 ? "warm" : "cool";
      wrap.appendChild(el("div", { class: "dl-item " + tone }, [
        el("span", { class: "dl-days" }, [
          el("b", { text: String(d.days) }),
          el("span", { text: d.days === 1 ? "day" : "days" })
        ]),
        el("span", { class: "dl-body" }, [
          el("span", { class: "dl-title", text: d.ev.title }),
          el("span", { class: "dl-meta", text: TYPE_LABEL[d.ev.type] + (d.ev.subject ? " · " + d.ev.subject : "") + " · " + d.ev.date })
        ])
      ]));
    });
    return wrap;
  }

  /* ---------------- event editor modal ---------------- */
  function eventModal(existing, presetDate, onSaved) {
    var overlay = el("div", { class: "modal-ov", onclick: function (e) { if (e.target === overlay) close(); } });
    function close() { overlay.remove(); document.removeEventListener("keydown", onEsc); }
    function onEsc(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onEsc);

    var title = el("input", { type: "text", class: "cal-in", placeholder: "Event title" });
    var date = el("input", { type: "date", class: "cal-in" });
    var time = el("input", { type: "time", class: "cal-in" });
    var type = el("select", { class: "status-sel" }, TYPES.map(function (t) {
      return el("option", { value: t[0], text: t[1] });
    }));
    var subj = el("select", { class: "status-sel" }, [
      el("option", { value: "", text: "No subject" }),
      el("option", { value: "compsci", text: "Computer Science" }),
      el("option", { value: "maths", text: "Mathematics" }),
      el("option", { value: "it", text: "IT" })
    ]);
    var ref = el("input", { type: "text", class: "cal-in", placeholder: "Topic ref (optional, e.g. 4.2.3.1)" });
    var recur = el("select", { class: "status-sel" }, [
      el("option", { value: "none", text: "One-off" }),
      el("option", { value: "weekly", text: "Repeats weekly" })
    ]);
    if (existing) {
      title.value = existing.title; date.value = existing.date;
      time.value = existing.time || ""; type.value = existing.type;
      subj.value = existing.subject || ""; ref.value = existing.ref || "";
      recur.value = existing.recur || "none";
    } else {
      date.value = presetDate || KOS.srs.todayISO();
    }

    var box = el("div", { class: "modal cal-modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: existing ? "Edit event" : "New event" }),
        el("button", { class: "btn", text: "✕ Close", style: "margin-left:auto", onclick: close })
      ]),
      el("div", { class: "cal-form" }, [
        field("Title", title), field("Date", date), field("Time (optional)", time),
        field("Type", type), field("Subject", subj), field("Topic", ref), field("Repeats", recur)
      ]),
      el("div", { class: "lab-controls", style: "margin-top:14px" }, [
        el("button", { class: "btn primary", text: existing ? "Save changes" : "Add event", onclick: function () {
          if (!title.value.trim() || !date.value) { KOS.ui.toast("A title and a date are required.", true); return; }
          var data = { title: title.value.trim(), date: date.value, time: time.value || null,
            type: type.value, subject: subj.value || null, ref: ref.value.trim() || null, recur: recur.value };
          if (existing) updateEvent(existing.id, data);
          else addEvent(data);
          KOS.ui.toast(existing ? "Event updated." : "Event added.");
          close(); onSaved && onSaved();
        } }),
        existing ? el("button", { class: "btn danger", text: "Delete event", onclick: function () {
          if (confirm("Delete “" + existing.title + "”?")) {
            deleteEvent(existing.id);
            KOS.ui.toast("Event deleted.");
            close(); onSaved && onSaved();
          }
        } }) : null
      ])
    ]);
    function field(label, node) {
      return el("label", { class: "cal-field" }, [el("span", { text: label }), node]);
    }
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    title.focus();
  }

  /* ---------------- the calendar view ---------------- */
  KOS.views.calendar = function (main) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var ui = store.state.ui;
    var mode = ui.calMode || "month";
    var now = new Date();
    var focus = ui.calFocus ? parseISO(ui.calFocus) : now;
    var today = KOS.srs.todayISO();

    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", { text: "Calendar" }),
      el("p", { class: "sub", text: "Exams, deadlines, study blocks and fixtures in one grid. Exam/deadline events feed the countdown widgets and daily to-do automatically." })
    ]));

    var head = el("div", { class: "cal-head" });
    var grid = el("div", {});
    main.appendChild(head);

    /* reminder threshold control */
    var thresholdRow = el("div", { class: "cal-thresh" }, [
      el("span", { class: "sub", text: "Remind me about deadlines" }),
      (function () {
        var sel = el("select", { class: "status-sel", onchange: function () {
          cal().notifyDays = +sel.value; store.save();
          KOS.ui.toast("Reminder threshold: " + sel.value + " days out.");
        } }, [1, 2, 3, 5, 7, 14].map(function (n) {
          return el("option", { value: n, text: n + (n === 1 ? " day" : " days") + " out" });
        }));
        sel.value = String(cal().notifyDays);
        return sel;
      })()
    ]);
    main.appendChild(thresholdRow);
    main.appendChild(grid);

    function setFocus(d) {
      focus = d;
      ui.calFocus = iso(d.getFullYear(), d.getMonth(), d.getDate());
      store.save();
      render();
    }

    function render() {
      head.innerHTML = "";
      grid.innerHTML = "";
      var y = focus.getFullYear(), mo = focus.getMonth();

      head.appendChild(el("div", { class: "cal-nav" }, [
        el("button", { class: "btn", text: "‹", "aria-label": "Previous", onclick: function () {
          setFocus(mode === "month" ? new Date(y, mo - 1, 1) : new Date(y, mo, focus.getDate() - 7));
        } }),
        el("h2", { class: "cal-title", text: MONTHS[mo] + " " + y }),
        el("button", { class: "btn", text: "›", "aria-label": "Next", onclick: function () {
          setFocus(mode === "month" ? new Date(y, mo + 1, 1) : new Date(y, mo, focus.getDate() + 7));
        } }),
        el("button", { class: "btn", text: "Today", onclick: function () { setFocus(new Date()); } }),
        el("span", { style: "flex:1" }),
        el("button", { class: "btn" + (mode === "month" ? " primary" : ""), text: "Month", onclick: function () {
          mode = "month"; ui.calMode = mode; store.save(); render();
        } }),
        el("button", { class: "btn" + (mode === "week" ? " primary" : ""), text: "Week", onclick: function () {
          mode = "week"; ui.calMode = mode; store.save(); render();
        } }),
        el("button", { class: "btn gold", text: "+ New event", onclick: function () {
          eventModal(null, null, render);
        } })
      ]));

      var days = [];
      if (mode === "month") {
        var first = new Date(y, mo, 1);
        var start = new Date(y, mo, 1 - ((first.getDay() + 6) % 7));
        for (var i = 0; i < 42; i++) days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
      } else {
        var monday = new Date(focus.getFullYear(), focus.getMonth(), focus.getDate() - ((focus.getDay() + 6) % 7));
        for (var j = 0; j < 7; j++) days.push(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + j));
      }

      var g2 = el("div", { class: "cal-grid " + mode });
      DOW.forEach(function (d) { g2.appendChild(el("div", { class: "cal-dow", text: d })); });
      days.forEach(function (d) {
        var dISO = iso(d.getFullYear(), d.getMonth(), d.getDate());
        var evs = eventsOn(dISO).sort(function (a, b) { return (a.time || "99") < (b.time || "99") ? -1 : 1; });
        var cell = el("div", { class: "cal-cell" + (dISO === today ? " today" : "") + (d.getMonth() !== mo && mode === "month" ? " other" : ""),
          onclick: function (e) { if (e.target === cell || e.target.classList.contains("cal-daynum")) eventModal(null, dISO, render); } });
        cell.appendChild(el("span", { class: "cal-daynum", text: String(d.getDate()) }));
        evs.forEach(function (ev) {
          cell.appendChild(el("button", { class: "cal-ev t-" + ev.type + (ev.subject ? " s-" + ev.subject : ""),
            title: ev.title + (ev.time ? " · " + ev.time : "") + (ev.recur === "weekly" ? " · weekly" : ""),
            onclick: function (e) { e.stopPropagation(); eventModal(ev, null, render); } }, [
            (ev.time ? ev.time + " " : "") + ev.title + (ev.recur === "weekly" ? " ↻" : "")
          ]));
        });
        g2.appendChild(cell);
      });
      grid.appendChild(g2);

      /* legend + upcoming deadlines below the grid */
      var legend = el("div", { class: "cal-legend" });
      TYPES.forEach(function (t) {
        legend.appendChild(el("span", { class: "cal-key t-" + t[0], text: t[1] }));
      });
      grid.appendChild(legend);
      grid.appendChild(countdownWidget(null));
    }
    render();
  };

  KOS.calendar = {
    addEvent: addEvent,
    updateEvent: updateEvent,
    deleteEvent: deleteEvent,
    eventsOn: eventsOn,
    deadlines: deadlines,
    seedSamples: seedSamples,
    checkReminders: checkReminders,
    countdownWidget: countdownWidget,
    eventModal: eventModal,
    TYPE_LABEL: TYPE_LABEL
  };
})();
