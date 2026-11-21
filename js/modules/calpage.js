/* Kurenai OS — modules/calpage.js
   The Calendar page (`#/calendar`), the day sheet, the event detail and
   the event editor (one modal: invariant 45), loaded on first use
   (page-calendar, 1F). The event store, its schema gate, recurrence, the
   countdowns, the chips and the countdown widget stay at boot in
   js/modules/calendar.js (KOS.calendar), whose forwarders open these. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store, K = KOS.calendar._k;
  var TYPES = K.TYPES, TYPE_LABEL = K.TYPE_LABEL, COLOURS = K.COLOURS, RECUR = K.RECUR, ALERTS = K.ALERTS, PRIORITIES = K.PRIORITIES, statuses = K.statuses, statusLabel = K.statusLabel, COUNTDOWN_TYPES = K.COUNTDOWN_TYPES, EXAM_LEVELS = K.EXAM_LEVELS, examLevel = K.examLevel, DOW = K.DOW, DOW_LONG = K.DOW_LONG, MONTHS = K.MONTHS, MONTH_CHIPS = K.MONTH_CHIPS, iso = K.iso, isoOf = K.isoOf, parseISO = K.parseISO, isDate = K.isDate, mins = K.mins, hm = K.hm, today = K.today, nowMinutes = K.nowMinutes, daysInMonth = K.daysInMonth, cal = K.cal, refsOf = K.refsOf, normalise = K.normalise, addEvent = K.addEvent, updateEvent = K.updateEvent, deleteEvent = K.deleteEvent, getEvent = K.getEvent, occursOn = K.occursOn, nextOccurrence = K.nextOccurrence, describeRecur = K.describeRecur, deadlines = K.deadlines, countdowns = K.countdowns, dayItems = K.dayItems, openDerived = K.openDerived, derivedChip = K.derivedChip, derivedToggles = K.derivedToggles, prettyDate = K.prettyDate, timeRange = K.timeRange, focusArg = K.focusArg, durationLabel = K.durationLabel, topicLabel = K.topicLabel, subjectName = K.subjectName, alertLabel = K.alertLabel, openAssignment = K.openAssignment, hueAttrs = K.hueAttrs, eventChip = K.eventChip, assignmentChip = K.assignmentChip, reminderChip = K.reminderChip, dialog = K.dialog, foot = K.foot, countdownWidget = K.countdownWidget, todayCard = K.todayCard;

  /* ================================================================
     the day sheet — the answer to day overflow
     ================================================================ */
  function daySheet(dateISO, onChanged) {
    var body = el("div", { class: "k-dialog-body k-cal-day-body" });
    var overlay;
    function dayRow(hue, when, title, meta, go) {
      var row = el("button", { class: "k-cal-row", "data-ui": "cal.day-row", type: "button", onclick: go }, [
        el("span", { class: "k-cal-row-bar", "aria-hidden": "true" }),
        el("span", { class: "k-cal-row-body" }, [
          el("span", { class: "k-cal-row-t", text: title }),
          el("span", { class: "k-cal-row-m", text: when + (meta ? " · " + meta : "") })
        ])
      ]);
      return hueAttrs(row, hue);
    }
    var d0 = dayItems(dateISO);
    if (!d0.events.length && !d0.assignments.length && !d0.reminders.length) {
      body.appendChild(el("p", { class: "k-muted", text: "Nothing on this day yet." }));
    }
    d0.events.forEach(function (ev) {
      body.appendChild(dayRow(ev, timeRange(ev), ev.title,
        TYPE_LABEL[ev.type] + (ev.subject ? " · " + ev.subject : "") + (ev.location ? " · " + ev.location : "") +
        ((ev.recur || "none") !== "none" ? " · " + describeRecur(ev).toLowerCase() : ""),
        function () { overlay.close(); eventDetail(ev, dateISO, onChanged); }));
    });
    d0.assignments.forEach(function (a) {
      body.appendChild(dayRow({ type: "assignment" }, a.dueTime || "Due", a.title,
        "Assignment · " + KOS.assignments.statusLabel(a.status) + (a.subject ? " · " + a.subject : ""),
        function () { overlay.close(); openAssignment(a, onChanged); }));
    });
    d0.reminders.forEach(function (r) {
      body.appendChild(dayRow({ type: "reminder" }, r.dueTime || "Any time", r.title, "Reminder — manage in Reminders",
        function () { overlay.close(); KOS.show("reminders"); }));
    });
    /* opened from the month grid, it lists what the cell's "+N more" counted */
    d0.derived.filter(function (d) { return d.kind !== "routine" && d.kind !== "review"; }).forEach(function (d) {
      body.appendChild(dayRow({ type: "reminder" }, d.time || "All day", d.title + (d.sub ? " · " + d.sub : ""),
        d.kind === "routine" || d.kind === "review" ? "From Routines" : d.kind === "startby" ? "From Exams" : d.kind === "money" ? "From Money" : "From Goals",
        function () { overlay.close(); openDerived(d); }));
    });
    var d = parseISO(dateISO);
    overlay = dialog("cal.day-modal", DOW_LONG[(d.getDay() + 6) % 7], d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear(),
      [body], foot([
        el("button", { type: "button", class: "k-btn k-spacer", text: "Close", onclick: function () { overlay.close(); } }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "+ New event", onclick: function () {
          overlay.close();
          eventModal(null, dateISO, onChanged);
        } })
      ]));
    KOS.ui.openDialog(overlay);
    return overlay;
  }

  /* ================================================================
     the event detail — reading is separate from editing
     ================================================================ */
  function detailRow(k, v) {
    return el("div", { class: "k-cal-kv" }, [
      el("dt", { text: k }),
      el("dd", {}, [typeof v === "string" ? document.createTextNode(v) : v])
    ]);
  }
  function linkBtn(text, go) {
    return el("button", { type: "button", class: "k-link", text: text, onclick: go });
  }

  /* the week's plan inside a lesson or study block (1C, UR-29): the class
     lessons dated that day (a lesson block), then my own rows for that week
     and the ones carried into it, each ticked here through KOS.pacing, the
     plan's owner (invariants 82b, 84); the block stores nothing of it */
  var PLAN_SUBJECTS = ["compsci", "maths", "it"];
  function planSection(ev, day, overlayOf) {
    var P = KOS.pacing;
    if (!P || !ev.subject || PLAN_SUBJECTS.indexOf(ev.subject) === -1 || (ev.type !== "lesson" && ev.type !== "study")) return null;
    var w = P.weekFor(day);
    if (!w || day < w.wb || day > P.weekEnd(w.wb)) return null;
    var box = el("section", { class: "k-cal-plan", "data-ui": "cal.plan", "aria-label": "This week's plan" });
    function row(label, on, sub, write, ui) {
      var cb = el("input", { type: "checkbox", "data-ui": ui, "aria-label": (on ? "Untick " : "Tick ") + label });
      cb.checked = on;
      cb.addEventListener("change", function () { write(cb.checked); paint(); if (KOS.rerender) KOS.rerender({ background: "soft", changed: ["pacing"] }); });
      var r = el("label", { class: "k-check k-cal-plan-row", "data-state": on ? "done" : null }, [cb,
        el("span", { class: "k-cal-plan-t" }, [el("span", { class: "k-ellipsis", text: label }), sub ? el("span", { class: "k-muted k-cal-plan-sub", text: sub }) : null].filter(Boolean))]);
      return r;
    }
    function paint() {
      box.innerHTML = "";
      var lessons = ev.type === "lesson" ? P.lessonsOn(day).filter(function (x) { return x.entry.subject === ev.subject; }) : [];
      var mine = P.entriesFor(w.wb, ev.subject, "personal").map(function (e) { return { entry: e, late: 0 }; })
        .concat(P.carriedInto(w.wb, ev.subject).map(function (c) { return { entry: c.entry, late: c.weeksLate }; }));
      if (!lessons.length && !mine.length) { box.appendChild(el("p", { class: "k-muted k-cal-plan-empty", text: "Nothing planned for " + subjectName(ev.subject) + " this week." })); return; }
      var left = mine.filter(function (x) { return !x.entry.done; }).length;
      box.appendChild(el("div", { class: "k-cal-plan-h" }, [
        el("b", { text: "This week's plan" }),
        el("span", { class: "k-muted", text: (w.label || w.wb) + (mine.length ? " · " + left + " of " + mine.length + " left" : "") }),
        el("span", { class: "k-cal-plan-fill" }),
        linkBtn("Open in Pacing", function () { var o = overlayOf(); if (o) o.close(); KOS.show("pacing", { wb: w.wb }); })
      ]));
      if (lessons.length) {
        box.appendChild(el("p", { class: "k-kicker k-cal-plan-k", text: "In class today" }));
        lessons.forEach(function (x) {
          box.appendChild(row(x.lesson.text, !!x.sat, x.entry.title !== x.lesson.text ? x.entry.title : null,
            function (on) { P.setLessonSat(x.entry.id, x.lesson.text, on); }, "cal.plan-lesson"));
        });
      }
      if (mine.length) {
        box.appendChild(el("p", { class: "k-kicker k-cal-plan-k", text: "My plan" }));
        var shown = mine.slice(0, 8);
        shown.forEach(function (x) {
          box.appendChild(row(x.entry.title, !!x.entry.done, x.late ? "carried over · " + x.late + (x.late === 1 ? " week" : " weeks") + " late" : null,
            function (on) { P.setDone(x.entry.id, on); }, "cal.plan-row"));
        });
        if (mine.length > shown.length) box.appendChild(el("p", { class: "k-muted k-cal-plan-more", text: "and " + (mine.length - shown.length) + " more in Pacing" }));
      }
    }
    paint();
    return box;
  }

  function eventDetail(ev, dateISO, onChanged) {
    /* an assessment is the hub's record: it opens there (invariant 120) */
    if (ev && ev.assessmentId) { KOS.show("exams", ev.assessmentId); return; }
    var overlay;
    var when = dateISO && occursOn(ev, dateISO) ? dateISO : (nextOccurrence(ev, today()) || ev.date);
    var rows = el("dl", { class: "k-cal-kvs" });

    rows.appendChild(detailRow("When", prettyDate(when) + " · " + timeRange(ev)));
    if ((ev.recur || "none") !== "none") rows.appendChild(detailRow("Repeats", describeRecur(ev).replace(/^Repeats /, "")));
    if (ev.subject) rows.appendChild(detailRow("Subject", subjectName(ev.subject)));
    if (ev.ref) {
      rows.appendChild(detailRow("Topic", linkBtn(topicLabel(ev.subject, ev.ref), function () {
        overlay.close(); KOS.show("ref", { subject: ev.subject, ref: ev.ref });
      })));
    }
    if (ev.location) rows.appendChild(detailRow("Location", ev.location));

    if (ev.type === "exam") {
      rows.appendChild(detailRow("Kind", examLevel(ev).label));
      if (ev.paper) rows.appendChild(detailRow("Paper", ev.paper));
      if (ev.durationMins) rows.appendChild(detailRow("Duration", durationLabel(ev.durationMins)));
      if (ev.room) rows.appendChild(detailRow("Room", ev.room));
      var linked = KOS.spec.pairs(refsOf(ev));
      if (linked.length) {
        rows.appendChild(detailRow("Related topics", el("span", { class: "k-cluster" }, linked.map(function (t) {
          return linkBtn(t.ref, function () { overlay.close(); KOS.show("ref", { subject: t.subject, ref: t.ref }); });
        }))));
      }
    }
    if (ev.type === "deadline") {
      rows.appendChild(detailRow("Priority", (PRIORITIES.find(function (p) { return p.v === ev.priority; }) || PRIORITIES[0]).label));
      rows.appendChild(detailRow("Status", statusLabel(ev.status)));
    }
    /* Pin and Unpin: the one manual choice about where it shows (frame 33u) */
    if (COUNTDOWN_TYPES.indexOf(ev.type) !== -1 && !ev.assessmentId && store.state.calendar.events.some(function (x) { return x.id === ev.id; })) {
      var onRail = ev.showInCountdown !== false;
      rows.appendChild(detailRow("Countdown", el("span", { class: "k-cluster" }, [
        el("span", { text: onRail ? "Counts down" : "Unpinned from countdowns" }),
        el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "cal.pin", text: onRail ? "Unpin" : "◆ Pin to countdowns", onclick: function () {
          updateEvent(ev.id, { showInCountdown: !onRail });
          KOS.a11y.announce(onRail ? "Unpinned from countdowns." : "Pinned to countdowns.");
          overlay.close(); KOS.rerender();
        } })
      ])));
    }
    if (ev.type === "study") {
      if (ev.durationMins) rows.appendChild(detailRow("Intended", durationLabel(ev.durationMins)));
      var linked = ev.assignmentId != null && KOS.assignments ? KOS.assignments.get(ev.assignmentId) : null;
      if (linked) {
        rows.appendChild(detailRow("Assignment", linkBtn(linked.title, function () { overlay.close(); openAssignment(linked, onChanged); })));
      }
    }
    if (ev.alerts.length) rows.appendChild(detailRow("Alerts", ev.alerts.map(alertLabel).join(", ")));

    var body = el("div", { class: "k-dialog-body k-cal-detail" }, [
      hueAttrs(el("span", { class: "k-cal-swatch-bar", "aria-hidden": "true" }), ev),
      rows,
      ev.description ? el("p", { class: "k-cal-desc", text: ev.description }) : null,
      planSection(ev, when, function () { return overlay; }),
      ev.type === "study" || ev.type === "lesson"
        ? el("div", { class: "k-cluster" }, [el("button", { type: "button", class: "k-btn", text: "Start a focus session", onclick: function () {
            overlay.close();
            /* the Focus page owns the set-up (invariant 4e): it opens filled
               with the block's link, its assignment and its own length */
            KOS.show("focus", focusArg(ev));
          } })])
        : null
    ].filter(Boolean));

    overlay = dialog("cal.detail-modal", TYPE_LABEL[ev.type], ev.title || "Untitled", [body], foot([
      el("button", { type: "button", class: "k-btn k-btn--danger", "data-ui": "cal.delete", "data-intent": "danger", text: "Delete", onclick: function () {
        confirmDelete(ev, function () { overlay.close(); onChanged && onChanged(); });
      } }),
      el("button", { type: "button", class: "k-btn k-spacer", text: "Close", onclick: function () { overlay.close(); } }),
      el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Edit", onclick: function () {
        overlay.close();
        eventModal(ev, null, onChanged);
      } })
    ]));
    KOS.ui.openDialog(overlay);
    return overlay;
  }

  /* the fallback read-only card, used only when the tracker module is absent */
  function assignmentCard(a) {
    var overlay;
    var rows = el("dl", { class: "k-cal-kvs" }, [
      detailRow("Due", (a.due ? prettyDate(a.due) : "No deadline") + (a.dueTime ? " · " + a.dueTime : "")),
      detailRow("Status", KOS.assignments.statusLabel(a.status)),
      detailRow("Progress", a.progress + "%"),
      a.subject ? detailRow("Subject", subjectName(a.subject)) : null
    ].filter(Boolean));
    overlay = dialog("cal.detail-modal", "Assignment", a.title, [el("div", { class: "k-dialog-body k-cal-detail" }, [
      rows,
      a.description ? el("p", { class: "k-cal-desc", text: a.description }) : null,
      el("p", { class: "k-muted", text: "This is an assignment, not a calendar event — it shows here because it is due on this day." })
    ].filter(Boolean))], foot([
      el("button", { type: "button", class: "k-btn k-spacer", text: "Close", onclick: function () { overlay.close(); } })
    ]));
    KOS.ui.openDialog(overlay);
    return overlay;
  }

  function confirmDelete(ev, done) {
    var repeats = (ev.recur || "none") !== "none";
    KOS.ui.confirm({
      title: "Delete event?",
      body: "Delete “" + ev.title + "”?" + (repeats ? " This removes every showing of it — it is one repeating event, not a copy per week." : ""),
      danger: true, confirm: "Delete"
    }, function () {
      deleteEvent(ev.id);
      KOS.ui.toast("Event deleted.");
      done && done();
    });
  }

  /* ================================================================
     the event editor — one modal, progressive disclosure, add and edit
     ================================================================ */
  function eventModal(existing, presetDate, onSaved) {
    if (existing && existing.assessmentId) { KOS.show("exams", existing.assessmentId); return null; }
    var overlay;
    function field(label, input, wide) {
      return el("label", { class: "k-field" + (wide ? " k-cal-span" : ""), "data-ui": "cal.field ui.field" }, [
        el("span", { class: "k-field-label", text: label }), input
      ]);
    }
    function input(type, attrs) { return el("input", Object.assign({ type: type, class: "k-input", "data-ui": "ui.input" }, attrs || {})); }
    function select(options) {
      return el("select", { class: "k-input" }, options.map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
    }
    function check(box, text) {
      return el("label", { class: "k-check", "data-ui": "cal.check" }, [box, el("span", { text: text })]);
    }
    /* the working copy: a normalised draft, never the stored record — a
       cancelled edit must leave nothing behind */
    var d = normalise(existing ? JSON.parse(JSON.stringify(existing)) : { date: presetDate || today() });
    if (existing) d.id = existing.id;

    /* ---- controls ---- */
    var title = input("text", { placeholder: "What is it?", maxlength: 120 });
    var date = input("date");
    var allDay = el("input", { type: "checkbox", class: "k-box" });
    var start = input("time");
    var end = input("time");
    var type = select(TYPES.map(function (t) { return [t.v, t.label]; }));
    var subj = select([["", "No subject"]].concat(KOS.subjects.ids().map(function (sid) { return [sid, sid === "it" ? "IT" : KOS.subjects.name(sid)]; })));
    /* frame 17: the event's topic is the shared picker, single-select and
       held to the subject; picking one under no subject takes its subject */
    var topicPick = KOS.topicPicker({ label: "Topic", multi: false, placeholder: "No topic",
      subject: function () { return subj.value || null; },
      value: d.subject && d.ref ? [d.subject + ":" + d.ref] : [],
      onChange: function (refs) {
        var s0 = refs.length ? KOS.spec.subjectsOf(refs)[0] : null;
        if (s0 && subj.value !== s0) subj.value = s0;
      } });
    topicPick.el.setAttribute("data-ui", topicPick.el.getAttribute("data-ui") + " cal.field");
    var location = input("text", { placeholder: "Room, building, or link", maxlength: 120 });
    var description = el("textarea", { class: "k-input", "data-ui": "ui.input", rows: 3, placeholder: "Anything you want to remember about it" });
    var recur = select(RECUR.map(function (r) { return [r.v, r.label]; }));
    var until = input("date");

    title.value = d.title;
    date.value = d.date;
    /* the store treats "no start time" AS all-day, which is right for
       rendering but wrong as an opening position: a NEW event must not
       arrive with the box already ticked and its time fields disabled.
       Saving it without a time still lands as all-day, via normalise(). */
    allDay.checked = existing ? d.allDay : false;
    start.value = d.time || "";
    end.value = d.endTime || "";
    type.value = d.type;
    subj.value = d.subject || "";
    subj.addEventListener("change", function () { topicPick.refresh(); });
    location.value = d.location;
    description.value = d.description;
    recur.value = d.recur;
    until.value = d.recurUntil || "";

    /* colour swatches — a category colour is a choice, not a hidden field */
    var colourRow = el("div", { class: "k-cluster k-cal-swatches", role: "group", "aria-label": "Colour" }, COLOURS.map(function (c) {
      var b = el("button", {
        type: "button", class: "k-cal-swatch", "data-ui": "cal.swatch", "data-colour": c.v || null,
        title: c.label, "aria-label": c.label, "aria-pressed": d.colour === c.v ? "true" : "false",
        onclick: function () {
          d.colour = c.v;
          colourRow.querySelectorAll("[data-ui~='cal.swatch']").forEach(function (x) { KOS.ui.state(x, "on", false); x.setAttribute("aria-pressed", "false"); });
          KOS.ui.state(b, "on", true); b.setAttribute("aria-pressed", "true");
          syncTypeHue();
        }
      });
      if (!c.v) KOS.ui.state(b, "auto", true);
      if (d.colour === c.v) KOS.ui.state(b, "on", true);
      return b;
    }));

    /* alerts — multi-select chips, because "alerts" is genuinely plural */
    var alertRow = el("div", { class: "k-cluster", role: "group", "aria-label": "Alerts" }, ALERTS.map(function (a) {
      var on = d.alerts.indexOf(a.v) !== -1;
      var b = el("button", {
        type: "button", class: "k-qz-pill", "data-ui": "cal.alert", text: a.label,
        "aria-pressed": on ? "true" : "false",
        onclick: function () {
          var i = d.alerts.indexOf(a.v);
          if (i === -1) {
            if (d.alerts.length >= 4) { KOS.ui.toast("Four alerts is the sensible limit for one event.", true); return; }
            d.alerts.push(a.v);
          } else d.alerts.splice(i, 1);
          d.alerts.sort(function (x, y) { return x - y; });
          var nowOn = d.alerts.indexOf(a.v) !== -1;
          KOS.ui.state(b, "on", nowOn);
          b.setAttribute("aria-pressed", nowOn ? "true" : "false");
        }
      });
      if (on) KOS.ui.state(b, "on", true);
      return b;
    }));
    /* where it shows is derived (roadmap 5.10, invariant 147): exams and
       deadlines count down; Pin and Unpin live on the event's detail */

    /* ---- conditional: exam ---- */
    var paper = input("text", { placeholder: "e.g. Paper 1", maxlength: 60 });
    var levelSel = select(EXAM_LEVELS.map(function (l) { return [l.v, l.label]; }));
    levelSel.value = examLevel(d).v;
    var duration = input("number", { min: 0, max: 1440, step: 5, placeholder: "minutes" });
    var room = input("text", { placeholder: "e.g. Sports hall", maxlength: 60 });
    var examPick = KOS.topicPicker({ label: "Related topics", multi: true, value: refsOf(d) });
    examPick.el.classList.add("k-cal-span");
    examPick.el.setAttribute("data-ui", examPick.el.getAttribute("data-ui") + " cal.field");
    paper.value = d.paper; room.value = d.room;
    duration.value = d.durationMins == null ? "" : String(d.durationMins);

    /* ---- conditional: deadline ---- */
    var priority = select(PRIORITIES.map(function (p) { return [String(p.v), p.label]; }));
    var status = select(statuses().map(function (s) { return [s.v, s.label]; }));
    priority.value = String(d.priority);
    status.value = d.status;

    /* ---- conditional: study block ---- */
    var studyDur = input("number", { min: 0, max: 1440, step: 5, placeholder: "minutes" });
    studyDur.value = d.durationMins == null ? "" : String(d.durationMins);
    var linkable = (KOS.assignments && KOS.assignments.linkable) ? KOS.assignments.linkable() : [];
    var assignSel = select([["", linkable.length ? "Not linked" : "No open assignments yet"]].concat(linkable.map(function (a) {
      return [String(a.id), a.title + (a.due ? " · due " + prettyDate(a.due) : "")];
    })));
    if (!linkable.length) assignSel.disabled = true;
    assignSel.value = d.assignmentId == null ? "" : String(d.assignmentId);

    /* ---- validation surface ---- */
    var errBox = el("div", { class: "k-cal-errs", "data-ui": "cal.errs", hidden: "", role: "alert" });
    function markBad(node, bad) {
      if (!node) return;
      KOS.ui.state(node, "bad", !!bad);
      if (bad) node.setAttribute("aria-invalid", "true"); else node.removeAttribute("aria-invalid");
    }

    /* ---- progressive disclosure ---- */
    function disclosure(label, hint, content, open) {
      var body = el("div", { class: "k-cal-disc-body" }, [content]);
      var btn = el("button", {
        type: "button", class: "k-cal-disc-h", "data-ui": "cal.disc-h", "aria-expanded": open ? "true" : "false",
        onclick: function () {
          var isOpen = KOS.ui.state(wrap, "open");
          btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        }
      }, [
        el("span", { class: "k-cal-disc-caret", "aria-hidden": "true", text: "›" }),
        el("b", { text: label }),
        el("span", { class: "k-cal-disc-hint", text: hint })
      ]);
      var wrap = el("section", { class: "k-cal-disc", "data-ui": "cal.disclosure" }, [btn, body]);
      if (open) KOS.ui.state(wrap, "open", true);
      return wrap;
    }

    var timeFields = el("div", { class: "k-cal-fgrid k-cal-fgrid--3" }, [
      field("Date", date), field("Start", start), field("End", end)
    ]);
    function syncAllDay() {
      var on = allDay.checked;
      start.disabled = on; end.disabled = on;
      KOS.ui.state(timeFields, "allday", on);
      if (on) { start.value = ""; end.value = ""; }
    }
    allDay.onchange = syncAllDay;

    var basics = el("div", { class: "k-cal-sec" }, [
      field("Title", title, true),
      check(allDay, "All day"),
      timeFields,
      el("div", { class: "k-cal-fgrid" }, [
        field("Type", type),
        el("div", { class: "k-field", "data-ui": "cal.field ui.field" }, [el("span", { class: "k-field-label", text: "Colour" }), colourRow])
      ])
    ]);

    var detailsSec = disclosure("Details", "Subject, topic, location, description",
      el("div", { class: "k-cal-fgrid" }, [
        field("Subject", subj), topicPick.el,
        field("Location", location),
        field("Description", description, true)
      ]),
      !!(existing && (existing.subject || existing.ref || existing.location || existing.description)));

    var repeatSec = disclosure("Repeat & alerts", "How often, and when to be warned",
      el("div", { class: "k-cal-sec" }, [
        el("div", { class: "k-cal-fgrid" }, [field("Repeats", recur), field("Until (optional)", until)]),
        el("div", { class: "k-field", "data-ui": "cal.field ui.field" }, [el("span", { class: "k-field-label", text: "Alerts" }), alertRow]),
        el("p", { class: "k-field-hint", text: "Alerts are set on this event, not globally — they fire while the app is open. Exams and deadlines count down by themselves." })
      ]),
      !!(existing && ((existing.recur && existing.recur !== "none") || (existing.alerts || []).length)));

    /* the type-specific section is rebuilt whenever the type changes, so the
       modal only ever shows the fields that mean something for this event */
    var condHost = el("div", { class: "k-cal-cond" });
    function condSection() {
      condHost.innerHTML = "";
      var t = type.value;
      if (t === "exam") {
        condHost.appendChild(disclosure("Exam details", "Kind, paper, duration, room, related topics",
          el("div", { class: "k-cal-fgrid" }, [
            field("Kind", levelSel), field("Paper", paper), field("Duration (min)", duration), field("Room", room),
            examPick.el
          ]),
          !(existing && existing.type === "exam") || !!(existing &&
            (existing.paper || existing.examLevel !== "exam" || existing.room || existing.durationMins || refsOf(existing).length))));
      } else if (t === "deadline") {
        condHost.appendChild(disclosure("Deadline details", "Priority, status, countdown",
          el("div", { class: "k-cal-fgrid" }, [field("Priority", priority), field("Status", status)]),
          !!(existing && existing.type === "deadline")));
      } else if (t === "study") {
        var assignField = field("Linked assignment", assignSel, true);
        if (!linkable.length) {
          assignField.appendChild(el("span", { class: "k-field-hint",
            text: "Nothing to link yet — open assignments appear here. The block links to the assignment; it never copies it." }));
        }
        condHost.appendChild(disclosure("Study block", "Intended length, linked work, focus",
          el("div", { class: "k-cal-sec" }, [
            el("div", { class: "k-cal-fgrid" }, [field("Intended duration (min)", studyDur), assignField]),
            el("div", { class: "k-cluster" }, [
              el("button", { class: "k-btn", type: "button", text: "Save and start a focus session", onclick: function () {
                save(function (rec) { KOS.show("focus", focusArg(rec)); });
              } }),
              el("span", { class: "k-field-hint", text: "Saves the block first, then opens the timer with its subject and topic filled in." })
            ])
          ]),
          true));
      }
    }
    function syncTypeHue() {
      overlay.box.setAttribute("data-type", type.value);
      if (d.colour) overlay.box.setAttribute("data-colour", d.colour); else overlay.box.removeAttribute("data-colour");
    }
    type.onchange = function () { condSection(); syncTypeHue(); };

    /* ---- validation ---- */
    function validate() {
      var errs = [];
      [title, date, start, end, until, duration, studyDur].forEach(function (n) { markBad(n, false); });
      if (!title.value.trim()) { errs.push("Give the event a title."); markBad(title, true); }
      if (!isDate(date.value)) { errs.push("Pick a valid date."); markBad(date, true); }
      if (!allDay.checked) {
        if (end.value && !start.value) { errs.push("An end time needs a start time — or mark the event all day."); markBad(start, true); }
        if (start.value && end.value && mins(end.value) <= mins(start.value)) {
          errs.push("The end time has to come after the start time."); markBad(end, true);
        }
      }
      if (until.value) {
        if (recur.value === "none") { errs.push("“Until” only applies to a repeating event."); markBad(until, true); }
        else if (isDate(date.value) && until.value < date.value) { errs.push("The repeat cannot end before it starts."); markBad(until, true); }
      }
      [duration, studyDur].forEach(function (n) {
        if (n.value !== "" && (isNaN(Number(n.value)) || Number(n.value) < 0 || Number(n.value) > 1440)) {
          errs.push("Duration has to be between 0 and 1440 minutes."); markBad(n, true);
        }
      });
      errBox.innerHTML = "";
      errBox.hidden = !errs.length;
      errs.forEach(function (m) { errBox.appendChild(el("p", { text: m })); });
      return !errs.length;
    }

    function collect() {
      var t = type.value;
      var patch = {
        title: title.value.trim(), date: date.value, allDay: allDay.checked,
        time: allDay.checked ? null : (start.value || null),
        endTime: allDay.checked ? null : (end.value || null),
        type: t, subject: subj.value || null, ref: (KOS.spec.parse(topicPick.value()[0] || "") || {}).ref || null,
        description: description.value, location: location.value.trim(),
        colour: d.colour, recur: recur.value, recurUntil: until.value || null,
        alerts: d.alerts.slice(),
        showInCountdown: COUNTDOWN_TYPES.indexOf(t) !== -1 ? d.showInCountdown !== false : false
      };
      /* conditional data is written only for the type it belongs to, so
         switching a record's type cannot leave stale exam fields behind */
      if (t === "exam") {
        patch.paper = paper.value.trim();
        patch.examLevel = levelSel.value;
        patch.room = room.value.trim();
        patch.durationMins = duration.value === "" ? null : Number(duration.value);
        patch.refs = examPick.value();
      } else {
        patch.paper = ""; patch.room = ""; patch.refs = [];
      }
      if (t === "deadline") {
        patch.priority = parseInt(priority.value, 10) || 0;
        patch.status = status.value;
      } else { patch.priority = 0; patch.status = "notStarted"; }
      if (t === "study") {
        patch.durationMins = studyDur.value === "" ? null : Number(studyDur.value);
        patch.assignmentId = store.idOf(assignSel.value);
      } else if (t !== "exam") {
        patch.durationMins = null;
      }
      if (t !== "study") patch.assignmentId = null;
      return patch;
    }

    function save(then) {
      if (!validate()) {
        if (errBox.scrollIntoView) errBox.scrollIntoView({ block: "nearest" });
        return;
      }
      var patch = collect(), rec;
      /* a NEW one-off exam is an assessment (roadmap 5.8, invariant 120):
         it goes to the Exams hub, which the calendar draws */
      if (!existing && patch.type === "exam" && patch.recur === "none" && KOS.exams) {
        var a = KOS.exams.add(KOS.exams.fromEvent(normalise(patch)));
        rec = a ? getEvent("x:" + a.id) : null;
        KOS.ui.toast("Added to Exams & Deadlines.");
        overlay.close();
        onSaved && onSaved();
        then && then(rec);
        return;
      }
      rec = existing ? updateEvent(existing.id, patch) : addEvent(patch);
      KOS.ui.toast(existing ? "Event updated." : "Event added.");
      overlay.close();
      onSaved && onSaved();
      then && then(rec);
    }

    overlay = dialog("cal.ev-modal", "Calendar", existing ? "Edit event" : "New event",
      [el("div", { class: "k-dialog-body k-cal-form" }, [errBox, basics, condHost, detailsSec, repeatSec])],
      foot([
        existing ? el("button", { type: "button", class: "k-btn k-btn--danger", "data-ui": "cal.delete", "data-intent": "danger", text: "Delete", onclick: function () {
          confirmDelete(existing, function () { overlay.close(); onSaved && onSaved(); });
        } }) : null,
        el("button", { type: "button", class: "k-btn k-spacer", text: "Cancel", onclick: function () { overlay.close(); } }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: existing ? "Save changes" : "Add event", onclick: function () { save(); } })
      ]));
    KOS.ui.state(overlay.box, "wide", true);
    condSection();
    syncAllDay();
    syncTypeHue();
    KOS.ui.openDialog(overlay);
    title.focus();
    return overlay;
  }

  /* ================================================================
     the calendar view
     ================================================================ */
  /* Which month/week is on screen is a SESSION position, not a saved
     preference: it was persisted as ui.calFocus, so opening the Calendar
     landed you on whatever week you last browsed — days or weeks in the
     past. It lives here for the life of the page instead, so paging around
     still works while you are in the view (and survives a redraw), and a
     fresh visit always starts on today.                                  */
  var sessionFocus = null;
  KOS.views.calendar = function (main) {
    KOS.shell.tree("none");
    var ui = store.state.ui;
    var mode = ui.calMode === "week" ? "week" : "month";
    var focus = sessionFocus || new Date();

    /* Graphite (frame 10e): the month itself is the page title */
    var head = el("div", { class: "k-cal-head" });
    var body = el("div", { class: "k-cal" });
    main.appendChild(head);
    main.appendChild(body);

    function setFocus(dt) { focus = sessionFocus = dt; render(); }
    function setMode(m) { mode = m; ui.calMode = m; store.save(); render(); }

    function render() {
      head.innerHTML = "";
      body.innerHTML = "";
      var y = focus.getFullYear(), mo = focus.getMonth();
      var t = today();
      var phoneLayout = window.matchMedia && window.matchMedia("(max-width: 700px)").matches;
      body.setAttribute("class", phoneLayout ? "k-cal-phone" : "k-cal");
      if (phoneLayout) { renderPhone(t); return; }

      var weekStart = new Date(focus.getFullYear(), focus.getMonth(), focus.getDate() - ((focus.getDay() + 6) % 7));
      var weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
      var titleText = mode === "month"
        ? MONTHS[mo] + " " + y
        : (weekStart.getMonth() === weekEnd.getMonth()
          ? weekStart.getDate() + "–" + weekEnd.getDate() + " " + MONTHS[weekStart.getMonth()] + " " + weekEnd.getFullYear()
          : weekStart.getDate() + " " + MONTHS[weekStart.getMonth()].slice(0, 3) + " – " +
            weekEnd.getDate() + " " + MONTHS[weekEnd.getMonth()].slice(0, 3) + " " + weekEnd.getFullYear());

      /* ‹ Month › — the arrows either side of what they step (review B) */
      head.appendChild(el("div", { class: "k-cluster k-cal-step" }, [
        el("button", { type: "button", class: "k-iconbtn", text: "‹", "aria-label": "Previous " + mode, onclick: function () {
          setFocus(mode === "month" ? new Date(y, mo - 1, 1) : new Date(y, mo, focus.getDate() - 7));
        } }),
        el("h1", { class: "k-cal-title", text: titleText }),
        el("button", { type: "button", class: "k-iconbtn", text: "›", "aria-label": "Next " + mode, onclick: function () {
          setFocus(mode === "month" ? new Date(y, mo + 1, 1) : new Date(y, mo, focus.getDate() + 7));
        } })
      ]));
      head.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", text: "Today", onclick: function () { setFocus(new Date()); } }));
      head.appendChild(derivedToggles(render));
      head.appendChild(el("div", { class: "k-seg k-seg--quiet k-spacer", role: "group", "aria-label": "Calendar view" }, [
        el("button", { type: "button", class: "k-seg-item", "data-ui": "cal.mode", text: "Month",
          "aria-pressed": mode === "month" ? "true" : "false", onclick: function () { setMode("month"); } }),
        el("button", { type: "button", class: "k-seg-item", "data-ui": "cal.mode", text: "Week",
          "aria-pressed": mode === "week" ? "true" : "false", onclick: function () { setMode("week"); } })
      ]));
      head.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "+ New event", onclick: function () {
        eventModal(null, mode === "week" ? isoOf(weekStart) : null, render);
      } }));

      var board = el("section", { class: "k-card k-cal-board", "aria-label": titleText });
      if (mode === "month") renderMonth(board, y, mo, t, render);
      else renderWeek(board, weekStart, t, render);
      board.appendChild(legend());

      body.appendChild(board);
      body.appendChild(el("div", { class: "k-cal-side" }, [todayCard(render), countdownWidget(null)]));
    }

    /* Frame 15g: the phone composition. Agenda (the stored "week" mode) is
       a week strip over the lists of the chosen day and the rest of its
       week; Month is a grid of dots, and the tapped day lists underneath.
       The day in focus IS the selection, and "+" (lent to the title bar)
       adds on it. Countdowns stay on the page under the lists. */
    function renderPhone(t) {
      var y = focus.getFullYear(), mo = focus.getMonth(), sel = isoOf(focus);
      var agenda = mode === "week";
      var weekStart = new Date(y, mo, focus.getDate() - ((focus.getDay() + 6) % 7));
      var weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
      head.appendChild(el("button", { type: "button", class: "k-iconbtn", "data-ui": "cal.new", "data-phone-action": "", text: "+",
        "aria-label": "New event on " + prettyDate(sel), onclick: function () { eventModal(null, isoOf(focus), render); } }));
      head.appendChild(el("div", { class: "k-seg k-seg--grid k-cal-modes", role: "group", "aria-label": "Calendar view" }, [["Agenda", "week"], ["Month", "month"]].map(function (m) {
        return el("button", { type: "button", class: "k-seg-item", "data-ui": "cal.mode", text: m[0],
          "aria-pressed": mode === m[1] ? "true" : "false", onclick: function () { setMode(m[1]); } });
      })));

      function step(n) {
        if (agenda) return new Date(y, mo, focus.getDate() + 7 * n);
        return new Date(y, mo + n, Math.min(focus.getDate(), daysInMonth(y, mo + n)));
      }
      var inView = agenda ? (t >= isoOf(weekStart) && t <= isoOf(weekEnd)) : t.slice(0, 7) === sel.slice(0, 7);
      var unit = agenda ? "week" : "month";
      body.appendChild(el("div", { class: "k-cal-period", "data-ui": "cal.period" }, [
        el("h2", { class: "k-cal-period-t", text: agenda
          ? (weekStart.getMonth() === weekEnd.getMonth()
            ? weekStart.getDate() + "–" + weekEnd.getDate() + " " + MONTHS[weekEnd.getMonth()]
            : weekStart.getDate() + " " + MONTHS[weekStart.getMonth()].slice(0, 3) + " – " + weekEnd.getDate() + " " + MONTHS[weekEnd.getMonth()].slice(0, 3))
          : MONTHS[mo] + " " + y }),
        inView ? null : el("button", { type: "button", class: "k-btn k-btn--sm", text: "Today", onclick: function () { setFocus(new Date()); } }),
        derivedToggles(render),
        el("button", { type: "button", class: "k-iconbtn", text: "‹", "aria-label": "Previous " + unit, onclick: function () { setFocus(step(-1)); } }),
        el("button", { type: "button", class: "k-iconbtn", text: "›", "aria-label": "Next " + unit, onclick: function () { setFocus(step(1)); } })
      ].filter(Boolean)));

      function pick(dt, dISO, n, kids, cls) {
        var b = el("button", { type: "button", class: cls, "data-ui": "cal.day-pick",
          "aria-pressed": dISO === sel ? "true" : "false",
          "aria-label": prettyDate(dISO) + (dISO === t ? ", today" : "") + (n ? ", " + n + (n === 1 ? " item" : " items") : ""),
          onclick: function () { setFocus(dt); } }, kids);
        if (dISO === t) KOS.ui.state(b, "today", true);
        return b;
      }
      if (agenda) {
        var strip = el("div", { class: "k-cal-strip", "data-ui": "cal.strip", role: "group", "aria-label": "Days of the week" });
        for (var i = 0; i < 7; i++) {
          var dt = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i), dISO = isoOf(dt);
          var hues = dayHues(dISO);
          strip.appendChild(pick(dt, dISO, hues.length, [
            el("span", { class: "k-cal-sday-dow", text: DOW[i] }),
            el("b", { class: "k-cal-sday-num k-mono", text: String(dt.getDate()) }),
            el("span", { class: "k-cal-dots", "aria-hidden": "true" }, hues.slice(0, 1).map(dotOf))
          ], "k-cal-sday"));
        }
        body.appendChild(strip);
      } else {
        var first = new Date(y, mo, 1);
        var startD = new Date(y, mo, 1 - ((first.getDay() + 6) % 7));
        var n = new Date(y, mo + 1, 0).getDate() + ((first.getDay() + 6) % 7) > 35 ? 42 : 35;
        var grid = el("div", { class: "k-cal-mgrid", "data-ui": "cal.phone-month" },
          DOW.map(function (d) { return el("span", { class: "k-cal-mgrid-dow", "aria-hidden": "true", text: d.charAt(0) }); }));
        for (var j = 0; j < n; j++) {
          var md = new Date(startD.getFullYear(), startD.getMonth(), startD.getDate() + j), mISO = isoOf(md);
          var mh = dayHues(mISO);
          var cell = pick(md, mISO, mh.length, [
            el("span", { class: "k-cal-mday-num k-mono", text: String(md.getDate()) }),
            el("span", { class: "k-cal-dots", "aria-hidden": "true" }, mh.slice(0, 3).map(dotOf))
          ], "k-cal-mday");
          if (md.getMonth() !== mo) KOS.ui.state(cell, "other", true);
          grid.appendChild(cell);
        }
        body.appendChild(grid);
        body.appendChild(legend());
      }

      var days = [];
      for (var k = 0; k < (agenda ? 7 : 1); k++) {
        var dk = new Date(y, mo, focus.getDate() + k);
        if (agenda && dk > weekEnd) break;
        days.push(isoOf(dk));
      }
      var list = el("div", { class: "k-cal-days", "data-ui": "cal.agenda" });
      days.forEach(function (dISO) {
        var rows = agendaRows(dISO, render);
        if (!rows.length && dISO !== sel) return;
        var dd = parseISO(dISO);
        var card = el("section", { class: "k-card k-cal-dcard", "data-ui": "cal.phone-day", "aria-label": prettyDate(dISO) }, [
          el("h3", { class: "k-cal-dcard-h" }, [
            DOW_LONG[(dd.getDay() + 6) % 7] + " " + dd.getDate() + " " + MONTHS[dd.getMonth()],
            dISO === t ? el("span", { class: "k-chip", "data-ui": "cal.today-chip", text: "Today" }) : null
          ].filter(Boolean))
        ]);
        if (rows.length) rows.forEach(function (r) { card.appendChild(r); });
        else card.appendChild(el("p", { class: "k-muted k-cal-cd-empty", text: "Nothing scheduled." }));
        list.appendChild(card);
      });
      body.appendChild(list);
      body.appendChild(countdownWidget(null));
    }
    render();
  };

  /* the hues of a day's items, in the order its lists print them */
  function dayHues(dISO) {
    var items = dayItems(dISO);
    return items.events.map(function (ev) { return { type: ev.type, colour: ev.colour }; })
      .concat(items.assignments.map(function () { return { type: "assignment" }; }))
      .concat(items.reminders.map(function () { return { type: "reminder" }; }))
      .concat(items.derived.filter(function (d) { return d.kind !== "routine" && d.kind !== "review"; }).map(function () { return { type: "reminder" }; }));
  }
  function dotOf(h) { return hueAttrs(el("i", { class: "k-cal-dot" }), h); }

  /* A phone agenda row: the time in a mono column, the hue bar, then the
     title over its facts. Same destinations as the chips. */
  function agendaRows(dISO, onChanged) {
    var items = dayItems(dISO);
    function row(hook, hue, when, title, meta, label, go) {
      return hueAttrs(el("button", { type: "button", class: "k-cal-arow", "data-ui": hook, "aria-label": label, onclick: go }, [
        el("span", { class: "k-cal-arow-when k-mono", text: when }),
        el("span", { class: "k-cal-row-bar", "aria-hidden": "true" }),
        el("span", { class: "k-cal-row-body" }, [
          el("span", { class: "k-cal-row-t", text: title }),
          meta ? el("span", { class: "k-cal-row-m", text: meta }) : null
        ].filter(Boolean))
      ]), hue);
    }
    var out = items.events.map(function (ev) {
      var span = ev.time && ev.endTime ? mins(ev.endTime) - mins(ev.time) : 0;
      var recurring = (ev.recur || "none") !== "none";
      var meta = [ev.location, span > 0 ? durationLabel(span) : (ev.durationMins ? durationLabel(ev.durationMins) : ""),
        ev.ref || "", recurring ? "↻" : ""].filter(Boolean).join(" · ");
      var label = (ev.allDay || !ev.time ? "All day" : ev.time) + " " + (ev.title || "Untitled") + " — " + TYPE_LABEL[ev.type] +
        (recurring ? ", " + describeRecur(ev).toLowerCase() : "");
      return row("cal.event", ev, ev.allDay || !ev.time ? "All day" : ev.time, ev.title || "Untitled", meta, label,
        function () { eventDetail(ev, dISO, onChanged); });
    });
    items.assignments.forEach(function (a) {
      var r = row("cal.event cal.asg", { type: "assignment" }, a.dueTime || "Due", a.title,
        "Assignment · " + KOS.assignments.statusLabel(a.status), "Assignment due: " + a.title, function () { openAssignment(a, onChanged); });
      if (KOS.assignments.isOverdue(a)) KOS.ui.state(r, "overdue", true);
      out.push(r);
    });
    items.reminders.forEach(function (r) {
      var ln = KOS.reminders.listName && r.listId != null ? KOS.reminders.listName(r.listId) : "";
      out.push(row("cal.event cal.rem", { type: "reminder" }, r.dueTime || "Any time", r.title, ln || "Reminder",
        "Reminder: " + r.title, function () { KOS.show("reminders"); }));
    });
    items.derived.forEach(function (d) {
      out.push(row("cal.event cal.derived", { type: "reminder" }, d.time || "All day", d.glyph + " " + d.title + (d.sub ? " · " + d.sub : ""),
        d.kind === "routine" || d.kind === "review" ? "From Routines" : d.kind === "startby" ? "From Exams" : d.kind === "money" ? "From Money" : "From Goals",
        d.title, function () { openDerived(d); }));
    });
    return out;
  }

  /* ---------------- month grid ---------------- */
  function renderMonth(host, y, mo, t, onChanged) {
    var first = new Date(y, mo, 1);
    var startD = new Date(y, mo, 1 - ((first.getDay() + 6) % 7));
    var days = [];
    for (var i = 0; i < 42; i++) days.push(new Date(startD.getFullYear(), startD.getMonth(), startD.getDate() + i));
    /* six rows are only needed when the month actually spills into one */
    if (days[35].getMonth() !== mo) days = days.slice(0, 35);

    host.appendChild(el("div", { class: "k-cal-dows", "aria-hidden": "true" }, DOW.map(function (d) {
      return el("span", { text: d });
    })));
    var g = el("div", { class: "k-cal-month", "data-ui": "cal.month" });
    g.style.setProperty("--weeks", String(days.length / 7));
    days.forEach(function (dt) {
      var dISO = isoOf(dt);
      var isToday = dISO === t;
      var stack = el("div", { class: "k-cal-stack" });
      var cell = el("div", {
        class: "k-cal-cell", "data-ui": "cal.cell",
        onclick: function (e) { if (e.target === cell || e.target === stack) eventModal(null, dISO, onChanged); }
      });
      if (isToday) KOS.ui.state(cell, "today", true);
      if (((dt.getDay() + 6) % 7) >= 5) KOS.ui.state(cell, "wknd", true);
      if (dt.getMonth() !== mo) KOS.ui.state(cell, "other", true);
      if (dISO < t) KOS.ui.state(cell, "past", true);
      cell.appendChild(el("div", { class: "k-cal-cell-h" }, [
        el("span", { class: "k-cal-daynum k-mono", "data-ui": "cal.daynum", text: String(dt.getDate()) }),
        isToday ? el("span", { class: "sr-only", text: "Today" }) : null,
        el("button", { class: "k-cal-add", type: "button", text: "+", "aria-label": "New event on " + prettyDate(dISO),
          onclick: function (e) { e.stopPropagation(); eventModal(null, dISO, onChanged); } })
      ].filter(Boolean)));

      var items = dayItems(dISO);
      var chips = [];
      items.events.forEach(function (ev) { chips.push(eventChip(ev, dISO, onChanged)); });
      items.assignments.forEach(function (a) { chips.push(assignmentChip(a, onChanged)); });
      items.reminders.forEach(function (r) { chips.push(reminderChip(r)); });
      /* routines and review marks belong to the week and the day, not the
         month grid, where they would push every real event under "+N more" */
      items.derived.filter(function (d) { return d.kind !== "routine" && d.kind !== "review"; }).forEach(function (d) { chips.push(derivedChip(d)); });

      /* a "+1 more" costs exactly as much room as the chip it hides, so the
         cap only bites from the second hidden item onwards */
      var show = chips.length <= MONTH_CHIPS + 1 ? chips.length : MONTH_CHIPS;
      chips.slice(0, show).forEach(function (c) { stack.appendChild(c); });
      if (chips.length > show) {
        var extra = chips.length - show;
        stack.appendChild(el("button", {
          class: "k-cal-more", "data-ui": "cal.more", type: "button", text: "+" + extra + " more",
          "aria-label": extra + " more on " + prettyDate(dISO),
          onclick: function (e) { e.stopPropagation(); daySheet(dISO, onChanged); }
        }));
      }
      cell.appendChild(stack);
      g.appendChild(cell);
    });
    host.appendChild(g);
  }

  /* ---------------- week grid ----------------
     A real time grid: an all-day band, then hour rows with timed events laid
     out by their actual start and end. Overlapping events share the column
     rather than hiding each other. Geometry rides custom properties in
     hours; the stylesheet owns the hour height (--cal-hour-h). */
  function renderWeek(host, weekStart, t, onChanged) {
    var days = [];
    for (var i = 0; i < 7; i++) {
      var dt = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
      days.push({ dt: dt, iso: isoOf(dt), items: dayItems(isoOf(dt)) });
    }
    /* the grid is the whole day; the body scrolls, and opens on the
       working day or the week's earliest event, whichever is earlier
       (review A: 8:00–17:00 was all there was) */
    var lo = 0, hi = 24 * 60, first = 8 * 60, earliest = null;
    days.forEach(function (d) {
      d.items.events.forEach(function (ev) {
        if (ev.allDay || !ev.time) return;
        var m0 = Math.floor(mins(ev.time) / 60) * 60;
        first = Math.min(first, m0);
        if (earliest == null || m0 < earliest) earliest = m0;
      });
    });
    var hours = [];
    for (var m = lo; m < hi; m += 60) hours.push(m);

    var wrap = el("div", { class: "k-cal-week", "data-ui": "cal.week" });
    wrap.style.setProperty("--hours", String(hours.length));

    /* header row */
    var headRow = el("div", { class: "k-cw-row" }, [el("div", { class: "k-cw-gutter" })]);
    days.forEach(function (d) {
      var b = el("button", {
        class: "k-cw-day", "data-ui": "cal.day",
        type: "button", "aria-label": "Open " + prettyDate(d.iso),
        onclick: function () { daySheet(d.iso, onChanged); }
      }, [
        el("span", { class: "k-cw-dow", text: DOW[(d.dt.getDay() + 6) % 7] }),
        el("span", { class: "k-cw-num k-mono", text: String(d.dt.getDate()) })
      ]);
      if (d.iso === t) KOS.ui.state(b, "today", true);
      headRow.appendChild(b);
    });
    wrap.appendChild(headRow);

    /* all-day band — always present so the layout does not jump */
    var band = el("div", { class: "k-cw-row k-cw-band" }, [el("div", { class: "k-cw-gutter", text: "all day" })]);
    days.forEach(function (d) {
      var col = el("div", {
        class: "k-cw-band-col", "data-ui": "cal.w-band-col",
        onclick: function (e) { if (e.target === col) eventModal(null, d.iso, onChanged); }
      });
      if (d.iso === t) KOS.ui.state(col, "today", true);
      d.items.events.filter(function (ev) { return ev.allDay || !ev.time; })
        .forEach(function (ev) { col.appendChild(eventChip(ev, d.iso, onChanged)); });
      d.items.assignments.forEach(function (a) { col.appendChild(assignmentChip(a, onChanged)); });
      d.items.reminders.forEach(function (r) { col.appendChild(reminderChip(r)); });
      d.items.derived.forEach(function (x) { col.appendChild(derivedChip(x)); });
      band.appendChild(col);
    });
    wrap.appendChild(band);

    /* the time grid */
    var grid = el("div", { class: "k-cw-row k-cw-body" });
    grid.appendChild(el("div", { class: "k-cw-gutter k-cw-hours" }, hours.map(function (h) {
      return el("div", { class: "k-cw-hour", "data-ui": "cal.w-hour" }, [el("span", { class: "k-mono", text: hm(h) })]);
    })));

    days.forEach(function (d) {
      var col = el("div", {
        class: "k-cw-col", "data-ui": "cal.w-col",
        onclick: function (e) {
          if (e.target !== col) return;
          /* clicking empty space opens the editor at that hour — the most
             common thing anyone wants from a week grid */
          var rect = col.getBoundingClientRect();
          var hourPx = rect.height / hours.length || 1;
          var at = lo + Math.floor((e.clientY - rect.top) / hourPx) * 60;
          var pre = eventModal(null, d.iso, onChanged);
          var input = pre.querySelector('input[type="time"]');
          if (input) input.value = hm(Math.max(lo, Math.min(hi - 60, at)));
        }
      });
      if (d.iso === t) KOS.ui.state(col, "today", true);
      if (((d.dt.getDay() + 6) % 7) >= 5) KOS.ui.state(col, "wknd", true);
      layoutTimed(d.items.events.filter(function (ev) { return !ev.allDay && ev.time; }))
        .forEach(function (p) {
          var chip = eventChip(p.ev, d.iso, onChanged, { block: true });
          chip.style.setProperty("--at", String((p.start - lo) / 60));
          chip.style.setProperty("--span", String(Math.max(0.35, (p.end - p.start) / 60)));
          chip.style.setProperty("--lane", String(p.col));
          chip.style.setProperty("--lanes", String(p.cols));
          col.appendChild(chip);
        });
      if (d.iso === t) {
        var nowM = nowMinutes();
        if (nowM >= lo && nowM <= hi) {
          var now = el("div", { class: "k-cw-now", "aria-hidden": "true" });
          now.style.setProperty("--at", String((nowM - lo) / 60));
          col.appendChild(now);
        }
      }
      grid.appendChild(col);
    });
    wrap.appendChild(grid);
    host.appendChild(wrap);
    /* a week holding today opens centred on NOW during working hours
       (07:00–22:00); outside working hours it opens on the first timed event
       or 07:00; any other week opens on its earliest event or the working day */
    var holdsToday = days.some(function (d) { return d.iso === t; });
    function openAt() {
      var hourPx = grid.scrollHeight / hours.length || 0;
      if (!hourPx) return;
      var nowM = nowMinutes(), inHours = nowM >= 7 * 60 && nowM < 22 * 60;
      grid.scrollTop = holdsToday && inHours
        ? Math.max(0, (nowM - lo) / 60 * hourPx - grid.clientHeight / 2)
        : Math.max(0, ((holdsToday ? (earliest != null ? earliest : 7 * 60) : first) - lo) / 60 * hourPx - hourPx / 2);
    }
    openAt();
    if (!grid.scrollTop && window.requestAnimationFrame) window.requestAnimationFrame(openAt);
  }

  /* column packing: events that overlap in time split the width between them */
  function layoutTimed(evs) {
    var placed = evs.map(function (ev) {
      var s = mins(ev.time);
      var e = ev.endTime ? mins(ev.endTime) : s + (ev.durationMins || 60);
      return { ev: ev, start: s, end: Math.min(24 * 60, Math.max(e, s + 20)), col: 0, cols: 1 };
    }).sort(function (a, b) { return a.start - b.start || a.end - b.end; });

    var cluster = [];
    function flush() {
      var n = cluster.reduce(function (mx, p) { return Math.max(mx, p.col + 1); }, 1);
      cluster.forEach(function (p) { p.cols = n; });
      cluster = [];
    }
    placed.forEach(function (p) {
      if (cluster.length && cluster.every(function (q) { return q.end <= p.start; })) flush();
      var used = cluster.filter(function (q) { return q.end > p.start; }).map(function (q) { return q.col; });
      var c = 0;
      while (used.indexOf(c) !== -1) c++;
      p.col = c;
      cluster.push(p);
    });
    flush();
    return placed;
  }

  /* ---------------- legend ---------------- */
  function legend() {
    var wrap = el("div", { class: "k-cal-legend", "aria-label": "Key" });
    TYPES.forEach(function (t) {
      wrap.appendChild(el("span", { class: "k-cal-key", "data-type": t.v, text: t.label }));
    });
    wrap.appendChild(el("span", { class: "k-cal-key", "data-type": "assignment", text: "Assignment" }));
    wrap.appendChild(el("span", { class: "k-cal-key", "data-type": "reminder", text: "Reminder" }));
    return wrap;
  }

  Object.assign(KOS.calendar._later, { daySheet: daySheet, eventDetail: eventDetail, assignmentCard: assignmentCard, eventModal: eventModal });
})();
