/* Kurenai OS — modules/calendar.js
   The integrated calendar (FR-4.2) + deadline tracking (FR-3.6), rebuilt for
   Build 6.6.

   ONE RECORD PER THING. A calendar event is the canonical record of a thing
   that happens on a date. An assignment is the canonical record of work that
   is owed — it lives in KOS.assignments and is NEVER copied into this store.
   The grid and the Countdown rail READ assignments through
   KOS.assignments.forDate()/countdownItems(); they hold no shadow event, so
   deleting an assignment removes it from the calendar with nothing left
   behind. The same rule already governs reminders: dated reminders render
   here read-only and never enter deadlines().

   ALERTS ARE PER RECORD. The page used to carry one global "remind me about
   deadlines" threshold, which meant every deadline shouted on the same
   schedule regardless of what it was. That control is gone: each event
   carries its own alerts[] of minute offsets (the same vocabulary reminders
   and assignments use), so a mock exam can warn a week out while a homework
   deadline warns the night before. Legacy events carrying the old `notify`
   day count are migrated once, on first access.

   COUNTDOWNS ARE DERIVED. countdowns() composes upcoming exams/deadlines
   (this store) with assignments explicitly marked major (that store) and
   sorts the two together. Nothing is duplicated to make a countdown appear,
   and hiding one is a field on the record, not a second copy.

   THE ASSIGNMENT BOUNDARY (Build 6.4's model, honoured here):
     · assignment chips keep the class .cal-asg (plus .overdue/.handed-in)
       and the CSS that shipped with the tracker.
     · clicking an assignment anywhere here calls KOS.assignmentDetail(id, cb)
       when the tracker module is loaded, and falls back to a local read-only
       card when it is not — the calendar never gains a second editor over an
       assignment record.
     · KOS.assignments.forDate / countdownItems / linkable are the only
       assignment reads. A study block LINKS to an assignment by id; it never
       copies its title, deadline or status.                                 */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  /* ---------------- vocabulary ---------------- */
  var TYPES = [
    { v: "exam", label: "Exam" },
    { v: "deadline", label: "Deadline" },
    { v: "study", label: "Study block" },
    { v: "lesson", label: "Lesson" },
    { v: "personal", label: "Personal" }
  ];
  var TYPE_LABEL = {};
  TYPES.forEach(function (t) { TYPE_LABEL[t.v] = t.label; });

  /* category colours: an event inherits its type's hue unless the user picks
     one. The ids map to --ev-hue in CSS — never to a hard-coded value. */
  var COLOURS = [
    { v: "", label: "Match the type" },
    { v: "iris", label: "Iris" },
    { v: "brass", label: "Brass" },
    { v: "sage", label: "Sage" },
    { v: "clay", label: "Clay" },
    { v: "sky", label: "Sky" },
    { v: "plum", label: "Plum" },
    { v: "jade", label: "Jade" },
    { v: "slate", label: "Slate" }
  ];
  var RECUR = [
    { v: "none", label: "Does not repeat", short: "" },
    { v: "daily", label: "Every day", short: "daily" },
    { v: "weekly", label: "Every week", short: "weekly" },
    { v: "fortnightly", label: "Every two weeks", short: "fortnightly" },
    { v: "monthly", label: "Every month", short: "monthly" },
    { v: "yearly", label: "Every year", short: "yearly" }
  ];
  /* alert offsets in minutes before the event's moment (0 = at the time) —
     the same vocabulary as reminders and assignments, so "1 day before"
     means one thing across the whole app */
  var ALERTS = [
    { v: 0, label: "At the time" },
    { v: 15, label: "15 minutes before" },
    { v: 60, label: "1 hour before" },
    { v: 180, label: "3 hours before" },
    { v: 1440, label: "1 day before" },
    { v: 2880, label: "2 days before" },
    { v: 4320, label: "3 days before" },
    { v: 10080, label: "1 week before" },
    { v: 20160, label: "2 weeks before" }
  ];
  var PRIORITIES = [
    { v: 0, label: "None", short: "" },
    { v: 1, label: "Low", short: "!" },
    { v: 2, label: "Medium", short: "!!" },
    { v: 3, label: "High", short: "!!!" }
  ];
  /* deadline status speaks the assignment tracker's vocabulary so the two
     never drift; the fallback exists only for a load without that module */
  var FALLBACK_STATUSES = [
    { v: "notStarted", label: "Not started" },
    { v: "inProgress", label: "In progress" },
    { v: "blocked", label: "Blocked" },
    { v: "submitted", label: "Submitted" },
    { v: "complete", label: "Complete" }
  ];
  function statuses() {
    return (KOS.assignments && KOS.assignments.STATUSES) || FALLBACK_STATUSES;
  }
  function statusLabel(v) {
    var s = statuses().find(function (x) { return x.v === v; });
    return s ? s.label : "Not started";
  }
  /* which types default to appearing in the Countdown rail */
  var COUNTDOWN_TYPES = ["exam", "deadline"];
  /* the lead time a NEWLY created exam or deadline gets when the caller does
     not say otherwise — the same three days the retired global threshold
     defaulted to. It is applied at creation only: clearing every alert in
     the editor has to stick, so normalise() must never re-seed one. */
  var DEFAULT_LEAD = 4320;

  var DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var DOW_LONG = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var MONTHS = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  var MONTH_CHIPS = 3;            // chips a month cell shows before "+N more"
  var SCHEMA = 2;                  // calendar branch schema version

  /* ---------------- small date helpers ---------------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(y, m, d) { return y + "-" + pad(m + 1) + "-" + pad(d); }
  function isoOf(d) { return iso(d.getFullYear(), d.getMonth(), d.getDate()); }
  function parseISO(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function dowIdx(dateISO) { return (parseISO(dateISO).getDay() + 6) % 7; }   // Mon = 0
  function isDate(s) { return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s); }
  function isTime(s) { return !!s && /^\d{1,2}:\d{2}$/.test(s); }
  function mins(hmStr) { var p = String(hmStr).split(":"); return (+p[0]) * 60 + (+p[1]); }
  function hm(m) { return pad(Math.floor(m / 60) % 24) + ":" + pad(m % 60); }
  function today() { return KOS.srs.todayISO(); }
  function nowMinutes() { var d = new Date(); return d.getHours() * 60 + d.getMinutes(); }
  function daysInMonth(y, m) { return new Date(y, m + 1, 0).getDate(); }
  function addMonths(dateISO, n) {
    var d = parseISO(dateISO), y = d.getFullYear(), m = d.getMonth() + n, day = d.getDate();
    var ny = y + Math.floor(m / 12), nm = ((m % 12) + 12) % 12;
    return iso(ny, nm, Math.min(day, daysInMonth(ny, nm)));
  }

  /* ---------------- the store branch + one-time migration ---------------- */
  function cal() {
    var c = store.state.calendar;
    if (!c) { c = store.state.calendar = { nextId: 1, seeded: false, events: [], notified: {}, v: SCHEMA }; }
    if (!Array.isArray(c.events)) c.events = [];
    if (!c.notified || typeof c.notified !== "object") c.notified = {};
    if (typeof c.nextId !== "number") c.nextId = 1;
    if (c.v !== SCHEMA) migrate(c);
    return c;
  }
  /* v1 → v2: the global notifyDays threshold becomes per-event alerts, and
     every legacy event gains the fields the new editor writes. Idempotent,
     and cheap enough to run again after a restore from an old backup. */
  function migrate(c) {
    var globalDays = typeof c.notifyDays === "number" ? c.notifyDays : 3;
    c.events = c.events.map(function (e) {
      if (!e || e.v === SCHEMA) return e;
      var legacy = e.notify;
      var alerts;
      if (legacy === -1) alerts = [];
      else if (typeof legacy === "number" && legacy >= 0) alerts = [legacy * 1440];
      else if (COUNTDOWN_TYPES.indexOf(e.type) !== -1) alerts = [globalDays * 1440];
      else alerts = [];
      var next = normalise({ alerts: alerts }, e);
      next.id = e.id;
      delete next.notify;
      return next;
    });
    delete c.notifyDays;
    c.v = SCHEMA;
    return c;
  }

  /* ---------------- the single schema gate ----------------
     Every write goes through normalise(), so a field not listed here cannot
     enter the store and a field added here reaches every record. */
  function normalise(patch, base) {
    var b = base || {};
    function pick(k, d) { return patch[k] !== undefined ? patch[k] : (b[k] !== undefined ? b[k] : d); }

    var type = pick("type", "personal");
    if (!TYPES.some(function (t) { return t.v === type; })) type = "personal";

    var date = pick("date", null);
    date = isDate(date) ? date : today();

    var allDay = !!pick("allDay", false);
    /* `time` stays the start-time field name: the focus timer and the daily
       list have read it since Build 2a, and renaming it would buy nothing */
    var start = pick("time", null);
    start = isTime(start) ? pad(+String(start).split(":")[0]) + ":" + String(start).split(":")[1] : null;
    var end = pick("endTime", null);
    end = isTime(end) ? pad(+String(end).split(":")[0]) + ":" + String(end).split(":")[1] : null;
    if (!start) allDay = true;
    if (allDay) { start = null; end = null; }
    /* an end before its start is not a shorter event, it is a typo — drop it
       rather than render a negative block */
    if (end && start && mins(end) <= mins(start)) end = null;

    var recur = pick("recur", "none");
    if (!RECUR.some(function (r) { return r.v === recur; })) recur = "none";
    var until = pick("recurUntil", null);
    until = isDate(until) && until >= date ? until : null;
    if (recur === "none") until = null;

    var colour = pick("colour", "");
    if (!COLOURS.some(function (c) { return c.v === colour; })) colour = "";

    var alerts = pick("alerts", null);
    if (!Array.isArray(alerts)) alerts = [];
    alerts = alerts.map(function (x) { return parseInt(x, 10); })
      .filter(function (x) { return !isNaN(x) && x >= 0; })
      .filter(function (x, i, a) { return a.indexOf(x) === i; })
      .sort(function (x, y) { return x - y; }).slice(0, 4);

    var topics = pick("topics", null) || [];
    if (!Array.isArray(topics)) topics = [];
    topics = topics
      .map(function (t) { return t && t.ref ? { subject: t.subject ? String(t.subject) : null, ref: String(t.ref) } : null; })
      .filter(Boolean)
      .filter(function (t, i, a) {
        return a.findIndex(function (x) { return x.subject === t.subject && x.ref === t.ref; }) === i;
      })
      .slice(0, 20);

    var dur = pick("durationMins", null);
    dur = dur == null || dur === "" ? null : (Math.max(0, Math.min(1440, Math.round(Number(dur) || 0))) || null);

    var pr = pick("priority", 0);
    pr = Math.max(0, Math.min(3, parseInt(pr, 10) || 0));

    var status = pick("status", "notStarted");
    if (!statuses().some(function (s) { return s.v === status; })) status = "notStarted";

    var assignmentId = pick("assignmentId", null);
    assignmentId = assignmentId == null || assignmentId === "" ? null : parseInt(assignmentId, 10);
    if (isNaN(assignmentId)) assignmentId = null;

    var showInCountdown = patch.showInCountdown !== undefined ? !!patch.showInCountdown
      : (b.showInCountdown !== undefined ? !!b.showInCountdown : COUNTDOWN_TYPES.indexOf(type) !== -1);

    var refRaw = pick("ref", null);
    return {
      id: b.id,
      v: SCHEMA,
      title: String(pick("title", "")).trim(),
      date: date,
      allDay: allDay,
      time: start,
      endTime: end,
      type: type,
      subject: pick("subject", null) || null,
      ref: refRaw ? String(refRaw).trim() || null : null,
      description: String(pick("description", "") || ""),
      location: String(pick("location", "") || "").trim(),
      colour: colour,
      recur: recur,
      recurUntil: until,
      alerts: alerts,
      /* exam-only */
      paper: String(pick("paper", "") || "").trim(),
      room: String(pick("room", "") || "").trim(),
      topics: topics,
      /* exam + study share ONE duration field rather than two that mean the
         same thing on different records */
      durationMins: dur,
      /* deadline-only */
      priority: pr,
      status: status,
      showInCountdown: showInCountdown,
      /* study-only: a LINK to the canonical assignment, never a copy of it */
      assignmentId: assignmentId,
      created: b.created || Date.now(),
      updatedAt: Date.now()
    };
  }

  /* ---------------- CRUD ---------------- */
  function addEvent(ev) {
    var c = cal();
    var input = ev || {};
    if (input.alerts === undefined && COUNTDOWN_TYPES.indexOf(input.type) !== -1) {
      input = Object.assign({}, input, { alerts: [DEFAULT_LEAD] });
    }
    var rec = normalise(input);
    rec.id = c.nextId++;
    c.events.push(rec);
    store.save();
    return rec;
  }
  function updateEvent(id, patch) {
    var c = cal();
    var i = c.events.findIndex(function (e) { return e.id === id; });
    if (i === -1) return null;
    var next = normalise(patch || {}, c.events[i]);
    next.id = c.events[i].id;
    c.events[i] = next;
    store.save();
    return next;
  }
  function deleteEvent(id) {
    var c = cal();
    var i = c.events.findIndex(function (e) { return e.id === id; });
    if (i !== -1) {
      c.events.splice(i, 1);
      /* an event that no longer exists must not keep alert bookkeeping alive */
      Object.keys(c.notified).forEach(function (k) {
        if (k.split("|")[1] === String(id)) delete c.notified[k];
      });
      store.save();
    }
  }
  function getEvent(id) { return cal().events.find(function (e) { return e.id === id; }) || null; }

  /* ---------------- recurrence ----------------
     Occurrences are COMPUTED, never materialised into extra records — a
     weekly lesson is one event, so editing it edits every showing of it. */
  function occursOn(ev, dateISO) {
    if (!ev || !ev.date || dateISO < ev.date) return false;
    if (ev.recurUntil && dateISO > ev.recurUntil) return false;
    var r = ev.recur || "none";
    if (r === "none") return dateISO === ev.date;
    if (r === "daily") return true;
    if (r === "weekly") return dowIdx(ev.date) === dowIdx(dateISO);
    if (r === "fortnightly") {
      return dowIdx(ev.date) === dowIdx(dateISO) && KOS.srs.daysBetween(ev.date, dateISO) % 14 === 0;
    }
    if (r === "monthly") {
      var d = parseISO(dateISO), s = parseISO(ev.date);
      var last = daysInMonth(d.getFullYear(), d.getMonth());
      /* the 31st in a 30-day month lands on the last day rather than
         disappearing for that month */
      return d.getDate() === Math.min(s.getDate(), last);
    }
    if (r === "yearly") return ev.date.slice(5) === dateISO.slice(5);
    return false;
  }
  function nextOccurrence(ev, fromISO) {
    var from = fromISO || today();
    if (!ev || !ev.date) return null;
    if ((ev.recur || "none") === "none") return ev.date >= from ? ev.date : null;
    if (ev.date >= from) return ev.date;
    if (ev.recurUntil && ev.recurUntil < from) return null;
    var r = ev.recur;
    if (r === "daily") return from;
    if (r === "weekly" || r === "fortnightly") {
      var step = r === "weekly" ? 7 : 14;
      var gap = KOS.srs.daysBetween(ev.date, from);
      var next = KOS.srs.addDays(ev.date, Math.ceil(gap / step) * step);
      return ev.recurUntil && next > ev.recurUntil ? null : next;
    }
    if (r === "monthly" || r === "yearly") {
      var stepM = r === "monthly" ? 1 : 12, cur = ev.date, guard = 0;
      while (cur < from && guard++ < 400) cur = addMonths(cur, stepM);
      return ev.recurUntil && cur > ev.recurUntil ? null : (cur >= from ? cur : null);
    }
    return null;
  }
  function describeRecur(ev) {
    var r = RECUR.find(function (x) { return x.v === (ev.recur || "none"); });
    if (!r || !r.short) return "";
    var s = "Repeats " + r.short;
    if (ev.recurUntil) s += " until " + prettyDate(ev.recurUntil);
    return s;
  }

  /* every event showing on a date, ordered the way a day actually runs:
     all-day first, then by start time. Returns the events themselves (a
     recurring event is ONE record), which is what every caller since
     Build 2a has expected. */
  function eventsOn(dateISO) {
    return cal().events
      .filter(function (e) { return occursOn(e, dateISO); })
      .sort(function (a, b) {
        var ta = a.time || "", tb = b.time || "";
        if (!ta && !tb) return (a.title || "").localeCompare(b.title || "");
        if (!ta) return -1;
        if (!tb) return 1;
        return ta < tb ? -1 : ta > tb ? 1 : 0;
      });
  }
  function occurrencesBetween(fromISO, toISO) {
    var out = [], d = fromISO, guard = 0;
    while (d <= toISO && guard++ < 800) {
      eventsOn(d).forEach(function (e) { out.push({ ev: e, date: d }); });
      d = KOS.srs.addDays(d, 1);
    }
    return out;
  }

  /* ---------------- deadlines + the unified countdown ----------------
     deadlines() stays what it has always been: upcoming exam/deadline
     EVENTS. Assignments are NOT folded in here — they are canonical records
     of their own, and countdowns() is where the two meet. */
  function deadlines(limit) {
    var t = today();
    var out = cal().events
      .filter(function (e) { return COUNTDOWN_TYPES.indexOf(e.type) !== -1; })
      .map(function (e) {
        var when = nextOccurrence(e, t);
        return when ? { ev: e, date: when, days: KOS.srs.daysBetween(t, when) } : null;
      })
      .filter(Boolean)
      .sort(function (a, b) { return a.days - b.days || (a.ev.title || "").localeCompare(b.ev.title || ""); });
    return limit ? out.slice(0, limit) : out;
  }

  /* The Countdown rail, composed from the two canonical stores. Nothing is
     copied to appear here and nothing is copied to disappear: an event
     carries showInCountdown, an assignment carries showInCountdown, and this
     function reads both. */
  function countdowns(sid, limit) {
    var rows = deadlines()
      .filter(function (d) {
        if (d.ev.showInCountdown === false) return false;
        if (d.ev.type === "deadline" && (d.ev.status === "complete" || d.ev.status === "submitted")) return false;
        return !sid || d.ev.subject === sid || !d.ev.subject;
      })
      .map(function (d) {
        return {
          kind: "event", key: "ev" + d.ev.id, ev: d.ev, days: d.days, date: d.date,
          title: d.ev.title,
          meta: TYPE_LABEL[d.ev.type] + (d.ev.subject ? " · " + d.ev.subject : "") + " · " + prettyDate(d.date)
        };
      });
    if (KOS.assignments && KOS.assignments.countdownItems) {
      KOS.assignments.countdownItems(sid).forEach(function (a) {
        rows.push({
          kind: "assignment", key: "as" + a.assignment.id, assignment: a.assignment,
          days: a.days, date: a.assignment.due, title: a.assignment.title,
          meta: "Assignment" + (a.assignment.subject ? " · " + a.assignment.subject : "") + " · " + prettyDate(a.assignment.due)
        });
      });
    }
    rows.sort(function (a, b) { return a.days - b.days || a.title.localeCompare(b.title); });
    return limit ? rows.slice(0, limit) : rows;
  }

  /* everything a single day holds, from all three canonical stores */
  function dayItems(dateISO) {
    return {
      events: eventsOn(dateISO),
      assignments: (KOS.assignments && KOS.assignments.forDate) ? KOS.assignments.forDate(dateISO) : [],
      reminders: (KOS.reminders && KOS.reminders.forDate) ? KOS.reminders.forDate(dateISO) : []
    };
  }

  /* ---------------- sample data ---------------- */
  function seedSamples() {
    var c = cal();
    if (c.seeded) return;
    c.seeded = true;
    var t = today();
    [
      { title: "SAMPLE — Mock exam (edit me)", date: KOS.srs.addDays(t, 5), time: "09:00", endTime: "11:00",
        type: "exam", subject: "maths", paper: "Paper 1", durationMins: 120, room: "Hall", alerts: [10080, 1440] },
      { title: "SAMPLE — Coursework deadline (edit me)", date: KOS.srs.addDays(t, 12), allDay: true,
        type: "deadline", subject: "it", priority: 2, alerts: [4320] },
      { title: "SAMPLE — CS study block (edit me)", date: KOS.srs.addDays(t, 1), time: "16:30", endTime: "17:30",
        type: "study", subject: "compsci", ref: "4.2.3.1", durationMins: 60 },
      { title: "SAMPLE — Weekly maths lesson (edit me)", date: KOS.srs.addDays(t, 2), time: "11:00", endTime: "12:00",
        type: "lesson", subject: "maths", recur: "weekly" }
    ].forEach(addEvent);
  }

  /* ---------------- in-app alerts ----------------
     Per-record, per-occurrence, once a day. A lead time of a day or more is
     day-grained (a "3 days before" alert on a two-day-out exam still fires,
     because you are inside the window you asked to be warned in); a shorter
     lead time is minute-grained against the event's actual moment. Nothing
     is scheduled and nothing is pushed — this fires when the app is open,
     which is the honest limit of a local-first app.                        */
  function occurrenceMoment(ev, dateISO) {
    var p = dateISO.split("-");
    var t = ev.time || "09:00";
    var h = t.split(":");
    return new Date(+p[0], +p[1] - 1, +p[2], +h[0], +h[1], 0, 0).getTime();
  }
  function checkReminders() {
    var c = cal(), t = today(), now = Date.now(), fired = [];
    occurrencesBetween(t, KOS.srs.addDays(t, 31)).forEach(function (occ) {
      var ev = occ.ev;
      if (!ev.alerts || !ev.alerts.length) return;
      if (ev.type === "deadline" && (ev.status === "complete" || ev.status === "submitted")) return;
      var moment = occurrenceMoment(ev, occ.date);
      var days = KOS.srs.daysBetween(t, occ.date);
      ev.alerts.forEach(function (m) {
        var key = t + "|" + ev.id + "|" + occ.date + "|" + m;
        if (c.notified[key]) return;
        var due = m >= 1440
          ? days <= Math.floor(m / 1440)
          : (now >= moment - m * 60000 && now <= moment + 30 * 60000);
        if (!due) return;
        c.notified[key] = true;
        fired.push({ ev: ev, date: occ.date, days: days, minutes: m });
      });
    });
    /* the log is a today-only ledger — yesterday's keys are noise */
    Object.keys(c.notified).forEach(function (k) {
      if (k.split("|")[0] !== t) delete c.notified[k];
    });
    store.save();
    fired.forEach(function (f) {
      KOS.ui.toast("⏰ " + f.ev.title + " — " +
        (f.days === 0 ? "today" + (f.ev.time ? " at " + f.ev.time : "") :
          f.days + (f.days === 1 ? " day" : " days") + " away"), f.days <= 1);
    });
    return fired;
  }

  /* ---------------- formatting ---------------- */
  function prettyDate(dateISO) {
    if (!isDate(dateISO)) return "";
    var d = parseISO(dateISO);
    return DOW[(d.getDay() + 6) % 7] + " " + d.getDate() + " " + MONTHS[d.getMonth()].slice(0, 3) +
      (d.getFullYear() !== new Date().getFullYear() ? " " + d.getFullYear() : "");
  }
  function timeRange(ev) {
    if (ev.allDay || !ev.time) return "All day";
    return ev.time + (ev.endTime ? "–" + ev.endTime : "");
  }
  function hueClass(ev) {
    return "t-" + ev.type + (ev.colour ? " c-" + ev.colour : "");
  }
  function durationLabel(m) {
    if (!m) return "";
    var h = Math.floor(m / 60), r = m % 60;
    return (h ? h + "h" : "") + (r ? (h ? " " : "") + r + "m" : "");
  }
  function topicLabel(subject, ref) {
    var node = subject && KOS.hub && KOS.hub.findRef ? KOS.hub.findRef(subject, ref) : null;
    return node && node.title ? ref + " — " + node.title : ref;
  }
  function subjectName(sid) {
    var s = window.KOS_DATA && KOS_DATA[sid];
    return (s && (s.name || s.title)) || sid;
  }
  function alertLabel(m) {
    var a = ALERTS.find(function (x) { return x.v === m; });
    if (a) return a.label;
    if (m % 1440 === 0) return (m / 1440) + " day" + (m / 1440 === 1 ? "" : "s") + " before";
    return m + " minutes before";
  }

  /* the ONE way this module opens an assignment: the tracker's own modal
     when it is loaded, a read-only card otherwise. The calendar never edits
     an assignment record. */
  function openAssignment(a, onChanged) {
    if (KOS.assignmentDetail) { KOS.assignmentDetail(a.id, onChanged); return; }
    assignmentCard(a);
  }

  /* ================================================================
     the event chip
     ================================================================ */
  function eventChip(ev, dateISO, onChanged, opts) {
    opts = opts || {};
    var recurring = (ev.recur || "none") !== "none";
    var bits = [];
    if (!ev.allDay && ev.time) bits.push(el("span", { class: "cal-ev-time", text: ev.time }));
    bits.push(el("span", { class: "cal-ev-t", text: ev.title || "Untitled" }));
    if (recurring) bits.push(el("span", { class: "cal-ev-re", "aria-hidden": "true", text: "↻" }));
    if (ev.type === "deadline" && ev.priority >= 2) {
      bits.push(el("span", { class: "cal-ev-pri", "aria-hidden": "true", text: ev.priority === 3 ? "!!!" : "!!" }));
    }
    var label = (ev.allDay ? "All day" : (ev.time || "")) + " " + (ev.title || "Untitled") +
      " — " + TYPE_LABEL[ev.type] + (recurring ? ", " + describeRecur(ev).toLowerCase() : "");
    return el("button", {
      class: "cal-ev " + hueClass(ev) + (ev.allDay || !ev.time ? " allday" : "") + (opts.block ? " block" : ""),
      type: "button",
      title: label + (ev.location ? " · " + ev.location : ""),
      "aria-label": label,
      onclick: function (e) { e.stopPropagation(); eventDetail(ev, dateISO, onChanged); }
    }, bits);
  }
  /* an assignment's chip is DERIVED — clicking it goes to the assignment,
     never to a calendar record, because there is no calendar record */
  function assignmentChip(a, onChanged) {
    return el("button", {
      class: "cal-ev cal-asg" + (KOS.assignments.isOverdue(a) ? " overdue" : "") +
        (a.status === "submitted" ? " handed-in" : ""),
      type: "button",
      title: "Assignment · " + a.title + " · " + KOS.assignments.statusLabel(a.status) +
        (a.dueTime ? " · " + a.dueTime : "") + " — manage in the tracker",
      "aria-label": "Assignment due: " + a.title,
      onclick: function (e) { e.stopPropagation(); openAssignment(a, onChanged); }
    }, [
      el("span", { class: "cal-ev-time", "aria-hidden": "true", text: a.dueTime || "課" }),
      el("span", { class: "cal-ev-t", text: a.title })
    ]);
  }
  function reminderChip(r) {
    var overdue = KOS.reminders.isOverdue(r);
    return el("button", {
      class: "cal-ev cal-rem" + (overdue ? " overdue" : ""), type: "button",
      title: "Reminder · " + r.title + (r.dueTime ? " · " + r.dueTime : "") + " — manage in Reminders",
      "aria-label": "Reminder: " + r.title,
      onclick: function (e) { e.stopPropagation(); KOS.show("reminders"); }
    }, [
      el("span", { class: "cal-ev-time", text: r.dueTime || "◦" }),
      el("span", { class: "cal-ev-t", text: r.title })
    ]);
  }

  /* ================================================================
     the day sheet — the answer to day overflow
     ================================================================ */
  function modalOverlay(onClose) {
    if (KOS.medview && KOS.medview.modalOverlay) return KOS.medview.modalOverlay(onClose);
    function close() { if (onClose) onClose(); document.removeEventListener("keydown", onEsc); overlay.remove(); }
    function onEsc(e) { if (e.key === "Escape") close(); }
    var overlay = el("div", { class: "modal-ov", onclick: function (e) { if (e.target === overlay) close(); } });
    document.addEventListener("keydown", onEsc);
    overlay.close = close;
    return overlay;
  }

  function daySheet(dateISO, onChanged) {
    var overlay = modalOverlay();
    var body = el("div", { class: "cal-day-body" });
    function dayRow(cls, when, title, meta, go) {
      return el("button", { class: "cal-day-row " + cls, type: "button", onclick: go }, [
        el("span", { class: "cdr-when", text: when }),
        el("span", { class: "cdr-body" }, [
          el("span", { class: "cdr-t", text: title }),
          el("span", { class: "cdr-m", text: meta })
        ])
      ]);
    }
    function paint() {
      body.innerHTML = "";
      var d = dayItems(dateISO);
      if (!d.events.length && !d.assignments.length && !d.reminders.length) {
        body.appendChild(el("p", { class: "sub", text: "Nothing on this day yet." }));
      }
      d.events.forEach(function (ev) {
        body.appendChild(dayRow(hueClass(ev), timeRange(ev), ev.title,
          TYPE_LABEL[ev.type] + (ev.subject ? " · " + ev.subject : "") + (ev.location ? " · " + ev.location : "") +
          ((ev.recur || "none") !== "none" ? " · " + describeRecur(ev).toLowerCase() : ""),
          function () { overlay.close(); eventDetail(ev, dateISO, onChanged); }));
      });
      d.assignments.forEach(function (a) {
        body.appendChild(dayRow("cal-asg", a.dueTime || "課", a.title,
          "Assignment · " + KOS.assignments.statusLabel(a.status) + (a.subject ? " · " + a.subject : ""),
          function () { overlay.close(); openAssignment(a, onChanged); }));
      });
      d.reminders.forEach(function (r) {
        body.appendChild(dayRow("cal-rem", r.dueTime || "◦", r.title, "Reminder — manage in Reminders",
          function () { overlay.close(); KOS.show("reminders"); }));
      });
    }
    paint();
    var d = parseISO(dateISO);
    overlay.appendChild(el("div", { class: "modal cal-day-modal" }, [
      el("div", { class: "modal-h" }, [
        el("span", { class: "modal-kicker", text: DOW_LONG[(d.getDay() + 6) % 7] }),
        el("b", { text: d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear() }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", "aria-label": "Close", onclick: overlay.close })
      ]),
      body,
      el("div", { class: "cal-modal-foot" }, [
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "Close", onclick: overlay.close }),
        el("button", { class: "btn primary", text: "+ New event", onclick: function () {
          overlay.close();
          eventModal(null, dateISO, onChanged);
        } })
      ])
    ]));
    document.body.appendChild(overlay);
    return overlay;
  }

  /* ================================================================
     the event detail — reading is separate from editing
     ================================================================ */
  function detailRow(k, v, cls) {
    return el("div", { class: "cal-d-row" + (cls ? " " + cls : "") }, [
      el("span", { class: "cal-d-k", text: k }),
      typeof v === "string" ? el("span", { class: "cal-d-v", text: v }) : v
    ]);
  }

  function eventDetail(ev, dateISO, onChanged) {
    var overlay = modalOverlay();
    var when = dateISO && occursOn(ev, dateISO) ? dateISO : (nextOccurrence(ev, today()) || ev.date);
    var rows = el("div", { class: "cal-detail-body" });

    rows.appendChild(detailRow("When", prettyDate(when) + " · " + timeRange(ev)));
    if ((ev.recur || "none") !== "none") rows.appendChild(detailRow("Repeats", describeRecur(ev).replace(/^Repeats /, "")));
    if (ev.subject) rows.appendChild(detailRow("Subject", subjectName(ev.subject)));
    if (ev.ref) {
      rows.appendChild(detailRow("Topic", el("button", {
        class: "mini-btn", text: topicLabel(ev.subject, ev.ref),
        onclick: function () { overlay.close(); KOS.show("ref", { subject: ev.subject, ref: ev.ref }); }
      })));
    }
    if (ev.location) rows.appendChild(detailRow("Location", ev.location));

    if (ev.type === "exam") {
      if (ev.paper) rows.appendChild(detailRow("Paper", ev.paper));
      if (ev.durationMins) rows.appendChild(detailRow("Duration", durationLabel(ev.durationMins)));
      if (ev.room) rows.appendChild(detailRow("Room", ev.room));
      if (ev.topics.length) {
        rows.appendChild(detailRow("Related topics", el("span", { class: "cal-d-chips" }, ev.topics.map(function (t) {
          return el("button", { class: "mini-btn", text: t.ref, onclick: function () {
            overlay.close(); KOS.show("ref", { subject: t.subject || ev.subject, ref: t.ref });
          } });
        }))));
      }
    }
    if (ev.type === "deadline") {
      rows.appendChild(detailRow("Priority", (PRIORITIES.find(function (p) { return p.v === ev.priority; }) || PRIORITIES[0]).label));
      rows.appendChild(detailRow("Status", statusLabel(ev.status)));
      rows.appendChild(detailRow("Countdown", ev.showInCountdown ? "Shown on the Countdown rail" : "Hidden from the Countdown rail"));
    }
    if (ev.type === "study") {
      if (ev.durationMins) rows.appendChild(detailRow("Intended", durationLabel(ev.durationMins)));
      var linked = ev.assignmentId != null && KOS.assignments ? KOS.assignments.get(ev.assignmentId) : null;
      if (linked) {
        rows.appendChild(detailRow("Assignment", el("button", {
          class: "mini-btn", text: linked.title,
          onclick: function () { overlay.close(); openAssignment(linked, onChanged); }
        })));
      }
    }
    if (ev.alerts.length) rows.appendChild(detailRow("Alerts", ev.alerts.map(alertLabel).join(", ")));
    if (ev.description) rows.appendChild(el("p", { class: "cal-d-desc", text: ev.description }));

    var actions = el("div", { class: "cal-d-actions" });
    if (ev.type === "study" || ev.type === "lesson") {
      actions.appendChild(el("button", { class: "btn jade", text: "Start a focus session", onclick: function () {
        overlay.close();
        KOS.show("focus", { subject: ev.subject || "", ref: ev.ref || "" });
      } }));
    }

    overlay.appendChild(el("div", { class: "modal cal-detail-modal" }, [
      el("div", { class: "modal-h" }, [
        el("span", { class: "modal-kicker", text: TYPE_LABEL[ev.type] }),
        el("b", { text: ev.title || "Untitled" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", "aria-label": "Close", onclick: overlay.close })
      ]),
      el("span", { class: "cal-d-swatch " + hueClass(ev), "aria-hidden": "true" }),
      rows,
      actions.childNodes.length ? actions : null,
      el("div", { class: "cal-modal-foot" }, [
        el("button", { class: "btn danger cal-foot-del", text: "Delete", onclick: function () {
          confirmDelete(ev, function () { overlay.close(); onChanged && onChanged(); });
        } }),
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "Close", onclick: overlay.close }),
        el("button", { class: "btn primary", text: "Edit", onclick: function () {
          overlay.close();
          eventModal(ev, null, onChanged);
        } })
      ])
    ]));
    document.body.appendChild(overlay);
    return overlay;
  }

  /* the fallback read-only card, used only when the tracker module is absent */
  function assignmentCard(a) {
    var overlay = modalOverlay();
    var rows = el("div", { class: "cal-detail-body" });
    rows.appendChild(detailRow("Due", (a.due ? prettyDate(a.due) : "No deadline") + (a.dueTime ? " · " + a.dueTime : "")));
    rows.appendChild(detailRow("Status", KOS.assignments.statusLabel(a.status)));
    rows.appendChild(detailRow("Progress", a.progress + "%"));
    if (a.subject) rows.appendChild(detailRow("Subject", subjectName(a.subject)));
    if (a.description) rows.appendChild(el("p", { class: "cal-d-desc", text: a.description }));
    rows.appendChild(el("p", { class: "sub", text: "This is an assignment, not a calendar event — it shows here because it is due on this day." }));
    overlay.appendChild(el("div", { class: "modal cal-detail-modal" }, [
      el("div", { class: "modal-h" }, [
        el("span", { class: "modal-kicker", text: "Assignment" }),
        el("b", { text: a.title }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", "aria-label": "Close", onclick: overlay.close })
      ]),
      el("span", { class: "cal-d-swatch cal-asg", "aria-hidden": "true" }),
      rows,
      el("div", { class: "cal-modal-foot" }, [
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "Close", onclick: overlay.close })
      ])
    ]));
    document.body.appendChild(overlay);
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
    var overlay = modalOverlay();
    var field = (KOS.medview && KOS.medview.calField) ||
      function (label, input) { return el("label", { class: "cal-field" }, [el("span", { text: label }), input]); };

    /* the working copy: a normalised draft, never the stored record — a
       cancelled edit must leave nothing behind */
    var d = normalise(existing ? JSON.parse(JSON.stringify(existing)) : { date: presetDate || today() });
    if (existing) d.id = existing.id;

    /* ---- controls ---- */
    var title = el("input", { type: "text", class: "cal-in", placeholder: "What is it?", maxlength: 120 });
    var date = el("input", { type: "date", class: "cal-in" });
    var allDay = el("input", { type: "checkbox", class: "cal-check-in" });
    var start = el("input", { type: "time", class: "cal-in" });
    var end = el("input", { type: "time", class: "cal-in" });
    var type = el("select", { class: "status-sel" }, TYPES.map(function (t) {
      return el("option", { value: t.v, text: t.label });
    }));
    var subj = el("select", { class: "status-sel" }, [
      el("option", { value: "", text: "No subject" }),
      el("option", { value: "compsci", text: "Computer Science" }),
      el("option", { value: "maths", text: "Mathematics" }),
      el("option", { value: "it", text: "IT" })
    ]);
    var ref = el("input", { type: "text", class: "cal-in", placeholder: "e.g. 4.2.3.1" });
    var location = el("input", { type: "text", class: "cal-in", placeholder: "Room, building, or link", maxlength: 120 });
    var description = el("textarea", { class: "cal-in cal-area", rows: 3, placeholder: "Anything you want to remember about it" });
    var recur = el("select", { class: "status-sel" }, RECUR.map(function (r) {
      return el("option", { value: r.v, text: r.label });
    }));
    var until = el("input", { type: "date", class: "cal-in" });

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
    ref.value = d.ref || "";
    location.value = d.location;
    description.value = d.description;
    recur.value = d.recur;
    until.value = d.recurUntil || "";

    /* colour swatches — a category colour is a choice, not a hidden field */
    var colourRow = el("div", { class: "cal-swatches" }, COLOURS.map(function (c) {
      var b = el("button", {
        type: "button", class: "cal-sw" + (c.v ? " c-" + c.v : " sw-auto") + (d.colour === c.v ? " on" : ""),
        title: c.label, "aria-label": c.label, "aria-pressed": d.colour === c.v ? "true" : "false",
        onclick: function () {
          d.colour = c.v;
          colourRow.querySelectorAll(".cal-sw").forEach(function (x) { x.classList.remove("on"); x.setAttribute("aria-pressed", "false"); });
          b.classList.add("on"); b.setAttribute("aria-pressed", "true");
          syncTypeHue();
        }
      });
      return b;
    }));

    /* alerts — multi-select chips, because "alerts" is genuinely plural */
    var alertRow = el("div", { class: "cal-alerts" }, ALERTS.map(function (a) {
      var on = d.alerts.indexOf(a.v) !== -1;
      var b = el("button", {
        type: "button", class: "cal-alert" + (on ? " on" : ""), text: a.label,
        "aria-pressed": on ? "true" : "false",
        onclick: function () {
          var i = d.alerts.indexOf(a.v);
          if (i === -1) {
            if (d.alerts.length >= 4) { KOS.ui.toast("Four alerts is the sensible limit for one event.", true); return; }
            d.alerts.push(a.v);
          } else d.alerts.splice(i, 1);
          d.alerts.sort(function (x, y) { return x - y; });
          var nowOn = d.alerts.indexOf(a.v) !== -1;
          b.classList.toggle("on", nowOn);
          b.setAttribute("aria-pressed", nowOn ? "true" : "false");
        }
      });
      return b;
    }));
    var countdownBox = el("input", { type: "checkbox", class: "cal-check-in" });
    countdownBox.checked = d.showInCountdown;
    var countdownRow = el("label", { class: "cal-check cal-countdown-row" }, [countdownBox, el("span", { text: "Show on the Countdown rail" })]);

    /* ---- conditional: exam ---- */
    var paper = el("input", { type: "text", class: "cal-in", placeholder: "e.g. Paper 1", maxlength: 60 });
    var duration = el("input", { type: "number", class: "cal-in", min: 0, max: 1440, step: 5, placeholder: "minutes" });
    var room = el("input", { type: "text", class: "cal-in", placeholder: "e.g. Sports hall", maxlength: 60 });
    var topicsIn = el("input", { type: "text", class: "cal-in", placeholder: "Comma-separated refs, e.g. 4.2.3.1, 4.3.1" });
    paper.value = d.paper; room.value = d.room;
    duration.value = d.durationMins == null ? "" : String(d.durationMins);
    topicsIn.value = d.topics.map(function (t) { return t.ref; }).join(", ");

    /* ---- conditional: deadline ---- */
    var priority = el("select", { class: "status-sel" }, PRIORITIES.map(function (p) {
      return el("option", { value: String(p.v), text: p.label });
    }));
    var status = el("select", { class: "status-sel" }, statuses().map(function (s) {
      return el("option", { value: s.v, text: s.label });
    }));
    priority.value = String(d.priority);
    status.value = d.status;

    /* ---- conditional: study block ---- */
    var studyDur = el("input", { type: "number", class: "cal-in", min: 0, max: 1440, step: 5, placeholder: "minutes" });
    studyDur.value = d.durationMins == null ? "" : String(d.durationMins);
    var linkable = (KOS.assignments && KOS.assignments.linkable) ? KOS.assignments.linkable() : [];
    var assignSel = el("select", { class: "status-sel" },
      [el("option", { value: "", text: linkable.length ? "Not linked" : "No open assignments yet" })]
        .concat(linkable.map(function (a) {
          return el("option", { value: String(a.id), text: a.title + (a.due ? " · due " + prettyDate(a.due) : "") });
        })));
    if (!linkable.length) assignSel.disabled = true;
    assignSel.value = d.assignmentId == null ? "" : String(d.assignmentId);

    /* ---- validation surface ---- */
    var errBox = el("div", { class: "cal-errs", hidden: true, role: "alert" });
    function markBad(node, bad) { if (node) node.classList.toggle("bad", !!bad); }

    /* ---- progressive disclosure ---- */
    function disclosure(label, hint, content, open) {
      var body = el("div", { class: "cal-disc-body" }, [content]);
      var btn = el("button", {
        type: "button", class: "cal-disc-h", "aria-expanded": open ? "true" : "false",
        onclick: function () {
          var isOpen = wrap.classList.toggle("open");
          btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
        }
      }, [
        el("span", { class: "cal-disc-caret", "aria-hidden": "true", text: "›" }),
        el("b", { text: label }),
        el("span", { class: "cal-disc-hint", text: hint })
      ]);
      var wrap = el("div", { class: "cal-disc" + (open ? " open" : "") }, [btn, body]);
      return wrap;
    }

    var timeFields = el("div", { class: "cal-fgrid three" }, [
      field("Date", date), field("Start", start), field("End", end)
    ]);
    function syncAllDay() {
      var on = allDay.checked;
      start.disabled = on; end.disabled = on;
      timeFields.classList.toggle("allday", on);
      if (on) { start.value = ""; end.value = ""; }
    }
    allDay.onchange = syncAllDay;

    var basics = el("div", { class: "cal-sec" }, [
      el("div", { class: "cal-fgrid" }, [field("Title", title)]),
      el("label", { class: "cal-check" }, [allDay, el("span", { text: "All day" })]),
      timeFields,
      el("div", { class: "cal-fgrid two" }, [
        field("Type", type),
        el("label", { class: "cal-field" }, [el("span", { text: "Colour" }), colourRow])
      ])
    ]);

    var detailsSec = disclosure("Details", "Subject, topic, location, description",
      el("div", { class: "cal-fgrid two" }, [
        field("Subject", subj), field("Topic ref", ref),
        field("Location", location),
        (function () { var f = field("Description", description); f.classList.add("cal-span"); return f; })()
      ]),
      !!(existing && (existing.subject || existing.ref || existing.location || existing.description)));

    var repeatSec = disclosure("Repeat & alerts", "How often, and when to be warned",
      el("div", {}, [
        el("div", { class: "cal-fgrid two" }, [field("Repeats", recur), field("Until (optional)", until)]),
        el("label", { class: "cal-field cal-span" }, [el("span", { text: "Alerts" }), alertRow]),
        countdownRow,
        el("p", { class: "sub cal-note", text: "Alerts are set on this event, not globally — they fire while the app is open." })
      ]),
      !!(existing && ((existing.recur && existing.recur !== "none") || (existing.alerts || []).length)));

    /* the type-specific section is rebuilt whenever the type changes, so the
       modal only ever shows the fields that mean something for this event */
    var condHost = el("div", { class: "cal-cond" });
    function condSection() {
      condHost.innerHTML = "";
      var t = type.value;
      countdownRow.hidden = COUNTDOWN_TYPES.indexOf(t) === -1;
      if (t === "exam") {
        condHost.appendChild(disclosure("Exam details", "Paper, duration, room, related topics",
          el("div", { class: "cal-fgrid two" }, [
            field("Paper", paper), field("Duration (min)", duration), field("Room", room),
            (function () { var f = field("Related topics", topicsIn); f.classList.add("cal-span"); return f; })()
          ]),
          !!(existing && existing.type === "exam" &&
            (existing.paper || existing.room || existing.durationMins || (existing.topics || []).length))));
      } else if (t === "deadline") {
        condHost.appendChild(disclosure("Deadline details", "Priority, status, countdown",
          el("div", { class: "cal-fgrid two" }, [field("Priority", priority), field("Status", status)]),
          !!(existing && existing.type === "deadline")));
      } else if (t === "study") {
        var assignField = field("Linked assignment", assignSel);
        assignField.classList.add("cal-span");
        if (!linkable.length) {
          assignField.appendChild(el("span", { class: "cal-hint",
            text: "Nothing to link yet — open assignments appear here. The block links to the assignment; it never copies it." }));
        }
        condHost.appendChild(disclosure("Study block", "Intended length, linked work, focus",
          el("div", {}, [
            el("div", { class: "cal-fgrid two" }, [field("Intended duration (min)", studyDur)]),
            el("div", { class: "cal-fgrid" }, [assignField]),
            el("div", { class: "cal-shortcut" }, [
              el("button", { class: "btn jade", type: "button", text: "Save and start a focus session", onclick: function () {
                save(function (rec) { KOS.show("focus", { subject: rec.subject || "", ref: rec.ref || "" }); });
              } }),
              el("span", { class: "sub", text: "Saves the block first, then opens the timer with its subject and topic filled in." })
            ])
          ]),
          true));
      }
    }
    function syncTypeHue() {
      box.className = "modal cal-modal cal-ev-modal " + hueClass({ type: type.value, colour: d.colour });
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
        type: t, subject: subj.value || null, ref: ref.value.trim() || null,
        description: description.value, location: location.value.trim(),
        colour: d.colour, recur: recur.value, recurUntil: until.value || null,
        alerts: d.alerts.slice(),
        showInCountdown: COUNTDOWN_TYPES.indexOf(t) !== -1 ? countdownBox.checked : false
      };
      /* conditional data is written only for the type it belongs to, so
         switching a record's type cannot leave stale exam fields behind */
      if (t === "exam") {
        patch.paper = paper.value.trim();
        patch.room = room.value.trim();
        patch.durationMins = duration.value === "" ? null : Number(duration.value);
        patch.topics = topicsIn.value.split(",").map(function (s) { return s.trim(); }).filter(Boolean)
          .map(function (r) { return { subject: subj.value || null, ref: r }; });
      } else {
        patch.paper = ""; patch.room = ""; patch.topics = [];
      }
      if (t === "deadline") {
        patch.priority = parseInt(priority.value, 10) || 0;
        patch.status = status.value;
      } else { patch.priority = 0; patch.status = "notStarted"; }
      if (t === "study") {
        patch.durationMins = studyDur.value === "" ? null : Number(studyDur.value);
        patch.assignmentId = assignSel.value === "" ? null : parseInt(assignSel.value, 10);
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
      var rec = existing ? updateEvent(existing.id, collect()) : addEvent(collect());
      KOS.ui.toast(existing ? "Event updated." : "Event added.");
      overlay.close();
      onSaved && onSaved();
      then && then(rec);
    }

    var box = el("div", { class: "modal cal-modal cal-ev-modal" }, [
      el("div", { class: "modal-h" }, [
        el("span", { class: "modal-kicker", text: "Calendar" }),
        el("b", { text: existing ? "Edit event" : "New event" }),
        el("button", { class: "mini-btn", style: "margin-left:auto", text: "✕", "aria-label": "Close", onclick: overlay.close })
      ]),
      errBox,
      basics,
      condHost,
      detailsSec,
      repeatSec,
      el("div", { class: "cal-modal-foot" }, [
        existing ? el("button", { class: "btn danger cal-foot-del", text: "Delete", onclick: function () {
          confirmDelete(existing, function () { overlay.close(); onSaved && onSaved(); });
        } }) : null,
        el("span", { style: "flex:1" }),
        el("button", { class: "btn", text: "Cancel", onclick: overlay.close }),
        el("button", { class: "btn primary", text: existing ? "Save changes" : "Add event", onclick: function () { save(); } })
      ])
    ]);
    condSection();
    syncAllDay();
    syncTypeHue();
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    title.focus();
    return overlay;
  }

  /* ================================================================
     the countdown widget (home + subject dash)
     ================================================================ */
  function countdownWidget(sid) {
    var list = countdowns(sid, 4);
    var wrap = el("div", { class: "dl-widget" });
    wrap.appendChild(el("div", { class: "dl-h" }, [
      el("b", { text: "Countdowns" }),
      el("button", { class: "mini-btn", text: "Calendar →", onclick: function () { KOS.show("calendar"); } })
    ]));
    if (!list.length) {
      wrap.appendChild(el("p", { class: "sub", text: "No upcoming exams, deadlines or major assignments. Anything you mark for the countdown appears here." }));
      return wrap;
    }
    list.forEach(function (row) {
      var tone = row.days <= 3 ? "hot" : row.days <= 7 ? "warm" : "cool";
      wrap.appendChild(el("button", {
        class: "dl-item " + tone, type: "button", title: row.title + " — " + row.meta,
        onclick: function () {
          if (row.kind === "assignment") openAssignment(row.assignment, null);
          else eventDetail(row.ev, row.date, null);
        }
      }, [
        el("span", { class: "dl-days" }, [
          el("b", { text: String(row.days) }),
          el("span", { text: row.days === 1 ? "day" : "days" })
        ]),
        el("span", { class: "dl-body" }, [
          el("span", { class: "dl-title", text: row.title }),
          el("span", { class: "dl-meta", text: row.meta })
        ])
      ]));
    });
    return wrap;
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
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var ui = store.state.ui;
    var mode = ui.calMode === "week" ? "week" : "month";
    var focus = sessionFocus || new Date();

    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "The term ahead" }),
        el("h1", { text: "Calendar" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: "Exams and deadlines here feed the countdowns and the daily list by themselves. Alerts are set on each event." })
        ])
      ])
    ]));

    var head = el("div", { class: "cal-head" });
    var grid = el("div", { class: "cal-body" });
    main.appendChild(head);
    main.appendChild(grid);

    function setFocus(dt) { focus = sessionFocus = dt; render(); }
    function setMode(m) { mode = m; ui.calMode = m; store.save(); render(); }

    function render() {
      head.innerHTML = "";
      grid.innerHTML = "";
      var y = focus.getFullYear(), mo = focus.getMonth();
      var t = today();

      var weekStart = new Date(focus.getFullYear(), focus.getMonth(), focus.getDate() - ((focus.getDay() + 6) % 7));
      var weekEnd = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + 6);
      var titleText = mode === "month"
        ? MONTHS[mo] + " " + y
        : (weekStart.getMonth() === weekEnd.getMonth()
          ? weekStart.getDate() + "–" + weekEnd.getDate() + " " + MONTHS[weekStart.getMonth()] + " " + weekEnd.getFullYear()
          : weekStart.getDate() + " " + MONTHS[weekStart.getMonth()].slice(0, 3) + " – " +
            weekEnd.getDate() + " " + MONTHS[weekEnd.getMonth()].slice(0, 3) + " " + weekEnd.getFullYear());

      head.appendChild(el("div", { class: "cal-nav" }, [
        el("div", { class: "cal-step" }, [
          el("button", { class: "mini-btn", text: "‹", "aria-label": "Previous " + mode, onclick: function () {
            setFocus(mode === "month" ? new Date(y, mo - 1, 1) : new Date(y, mo, focus.getDate() - 7));
          } }),
          el("button", { class: "mini-btn", text: "›", "aria-label": "Next " + mode, onclick: function () {
            setFocus(mode === "month" ? new Date(y, mo + 1, 1) : new Date(y, mo, focus.getDate() + 7));
          } })
        ]),
        el("h2", { class: "cal-title", text: titleText }),
        el("button", { class: "btn subtle", text: "Today", onclick: function () { setFocus(new Date()); } }),
        el("span", { style: "flex:1" }),
        el("div", { class: "cal-modes", role: "group", "aria-label": "Calendar view" }, [
          el("button", { class: "cal-mode" + (mode === "month" ? " on" : ""), text: "Month",
            "aria-pressed": mode === "month" ? "true" : "false", onclick: function () { setMode("month"); } }),
          el("button", { class: "cal-mode" + (mode === "week" ? " on" : ""), text: "Week",
            "aria-pressed": mode === "week" ? "true" : "false", onclick: function () { setMode("week"); } })
        ]),
        el("button", { class: "btn gold", text: "+ New event", onclick: function () {
          eventModal(null, mode === "week" ? isoOf(weekStart) : null, render);
        } })
      ]));

      if (mode === "month") renderMonth(grid, y, mo, t, render);
      else renderWeek(grid, weekStart, t, render);

      grid.appendChild(legend());
      grid.appendChild(countdownWidget(null));
    }
    render();
  };

  /* ---------------- month grid ---------------- */
  function renderMonth(host, y, mo, t, onChanged) {
    var first = new Date(y, mo, 1);
    var startD = new Date(y, mo, 1 - ((first.getDay() + 6) % 7));
    var days = [];
    for (var i = 0; i < 42; i++) days.push(new Date(startD.getFullYear(), startD.getMonth(), startD.getDate() + i));
    /* six rows are only needed when the month actually spills into one */
    if (days[35].getMonth() !== mo) days = days.slice(0, 35);

    var g = el("div", { class: "cal-grid month" });
    DOW.forEach(function (d, i) {
      g.appendChild(el("div", { class: "cal-dow" + (i >= 5 ? " wknd" : ""), text: d }));
    });
    days.forEach(function (dt) {
      var dISO = isoOf(dt);
      var isToday = dISO === t;
      var wknd = ((dt.getDay() + 6) % 7) >= 5;
      var stack = el("div", { class: "cal-stack" });
      var cell = el("div", {
        class: "cal-cell" + (isToday ? " today" : "") + (wknd ? " wknd" : "") +
          (dt.getMonth() !== mo ? " other" : "") + (dISO < t ? " past" : ""),
        onclick: function (e) { if (e.target === cell || e.target === stack) eventModal(null, dISO, onChanged); }
      });
      cell.appendChild(el("div", { class: "cal-cell-h" }, [
        el("span", { class: "cal-daynum", text: String(dt.getDate()) }),
        isToday ? el("span", { class: "cal-todaytag", text: "Today" }) : null,
        el("button", { class: "cal-add", type: "button", text: "+", "aria-label": "New event on " + prettyDate(dISO),
          onclick: function (e) { e.stopPropagation(); eventModal(null, dISO, onChanged); } })
      ]));

      var items = dayItems(dISO);
      var chips = [];
      items.events.forEach(function (ev) { chips.push(eventChip(ev, dISO, onChanged)); });
      items.assignments.forEach(function (a) { chips.push(assignmentChip(a, onChanged)); });
      items.reminders.forEach(function (r) { chips.push(reminderChip(r)); });

      /* a "+1 more" costs exactly as much room as the chip it hides, so the
         cap only bites from the second hidden item onwards */
      var show = chips.length <= MONTH_CHIPS + 1 ? chips.length : MONTH_CHIPS;
      chips.slice(0, show).forEach(function (c) { stack.appendChild(c); });
      if (chips.length > show) {
        var extra = chips.length - show;
        stack.appendChild(el("button", {
          class: "cal-more", type: "button", text: "+" + extra + " more",
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
     rather than hiding each other. */
  function renderWeek(host, weekStart, t, onChanged) {
    var days = [];
    for (var i = 0; i < 7; i++) {
      var dt = new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + i);
      days.push({ dt: dt, iso: isoOf(dt), items: dayItems(isoOf(dt)) });
    }
    /* the visible hour window fits the week's actual events, never less than
       a normal working day */
    var lo = 8 * 60, hi = 18 * 60;
    days.forEach(function (d) {
      d.items.events.forEach(function (ev) {
        if (ev.allDay || !ev.time) return;
        var s = mins(ev.time), e = ev.endTime ? mins(ev.endTime) : s + 60;
        lo = Math.min(lo, Math.floor(s / 60) * 60);
        hi = Math.max(hi, Math.ceil(e / 60) * 60);
      });
    });
    hi = Math.min(24 * 60, Math.max(hi, lo + 240));
    var hours = [];
    for (var m = lo; m < hi; m += 60) hours.push(m);
    var PX = 52;    // pixels per hour

    var wrap = el("div", { class: "cal-week" });

    /* header row */
    var headRow = el("div", { class: "cw-head" });
    headRow.appendChild(el("div", { class: "cw-gutter-h" }));
    days.forEach(function (d) {
      headRow.appendChild(el("button", {
        class: "cw-day" + (d.iso === t ? " today" : "") + (((d.dt.getDay() + 6) % 7) >= 5 ? " wknd" : ""),
        type: "button", "aria-label": "Open " + prettyDate(d.iso),
        onclick: function () { daySheet(d.iso, onChanged); }
      }, [
        el("span", { class: "cw-dow", text: DOW[(d.dt.getDay() + 6) % 7] }),
        el("span", { class: "cw-num", text: String(d.dt.getDate()) })
      ]));
    });
    wrap.appendChild(headRow);

    /* all-day band — always present so the layout does not jump */
    var band = el("div", { class: "cw-band" });
    band.appendChild(el("div", { class: "cw-gutter-h", text: "all day" }));
    days.forEach(function (d) {
      var col = el("div", {
        class: "cw-band-col" + (d.iso === t ? " today" : ""),
        onclick: function (e) { if (e.target === col) eventModal(null, d.iso, onChanged); }
      });
      d.items.events.filter(function (ev) { return ev.allDay || !ev.time; })
        .forEach(function (ev) { col.appendChild(eventChip(ev, d.iso, onChanged)); });
      d.items.assignments.forEach(function (a) { col.appendChild(assignmentChip(a, onChanged)); });
      d.items.reminders.forEach(function (r) { col.appendChild(reminderChip(r)); });
      band.appendChild(col);
    });
    wrap.appendChild(band);

    /* the time grid */
    var body = el("div", { class: "cw-body" });
    var gutter = el("div", { class: "cw-gutter" });
    hours.forEach(function (h) {
      gutter.appendChild(el("div", { class: "cw-hour", style: "height:" + PX + "px" }, [el("span", { text: hm(h) })]));
    });
    body.appendChild(gutter);

    days.forEach(function (d) {
      var col = el("div", {
        class: "cw-col" + (d.iso === t ? " today" : "") + (((d.dt.getDay() + 6) % 7) >= 5 ? " wknd" : ""),
        style: "height:" + (hours.length * PX) + "px",
        onclick: function (e) {
          if (e.target !== col && !e.target.classList.contains("cw-slot")) return;
          /* clicking empty space opens the editor at that hour — the most
             common thing anyone wants from a week grid */
          var rect = col.getBoundingClientRect();
          var at = lo + Math.floor((e.clientY - rect.top) / PX) * 60;
          var pre = eventModal(null, d.iso, onChanged);
          var input = pre.querySelector('input[type="time"]');
          if (input) input.value = hm(Math.max(lo, Math.min(hi - 60, at)));
        }
      });
      hours.forEach(function (h, idx) {
        col.appendChild(el("div", { class: "cw-slot", style: "top:" + (idx * PX) + "px;height:" + PX + "px" }));
      });
      layoutTimed(d.items.events.filter(function (ev) { return !ev.allDay && ev.time; }))
        .forEach(function (p) {
          var chip = eventChip(p.ev, d.iso, onChanged, { block: true });
          chip.style.top = ((p.start - lo) / 60 * PX) + "px";
          chip.style.height = Math.max(18, (p.end - p.start) / 60 * PX - 2) + "px";
          chip.style.left = "calc(" + (p.col * (100 / p.cols)) + "% + 2px)";
          chip.style.width = "calc(" + (100 / p.cols) + "% - 4px)";
          col.appendChild(chip);
        });
      if (d.iso === t) {
        var nowM = nowMinutes();
        if (nowM >= lo && nowM <= hi) {
          col.appendChild(el("div", { class: "cw-now", style: "top:" + ((nowM - lo) / 60 * PX) + "px", "aria-hidden": "true" }));
        }
      }
      body.appendChild(col);
    });
    wrap.appendChild(body);
    host.appendChild(wrap);
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
    var wrap = el("div", { class: "cal-legend" });
    TYPES.forEach(function (t) {
      wrap.appendChild(el("span", { class: "cal-key t-" + t.v, text: t.label }));
    });
    wrap.appendChild(el("span", { class: "cal-key cal-asg", text: "Assignment" }));
    wrap.appendChild(el("span", { class: "cal-key cal-rem", text: "Reminder" }));
    return wrap;
  }

  KOS.calendar = {
    addEvent: addEvent,
    updateEvent: updateEvent,
    deleteEvent: deleteEvent,
    getEvent: getEvent,
    normalise: normalise,
    migrate: function () { return cal(); },
    eventsOn: eventsOn,
    occursOn: occursOn,
    nextOccurrence: nextOccurrence,
    occurrencesBetween: occurrencesBetween,
    describeRecur: describeRecur,
    deadlines: deadlines,
    countdowns: countdowns,
    dayItems: dayItems,
    seedSamples: seedSamples,
    checkReminders: checkReminders,
    countdownWidget: countdownWidget,
    eventModal: eventModal,
    eventDetail: eventDetail,
    daySheet: daySheet,
    alertLabel: alertLabel,
    TYPES: TYPES, TYPE_LABEL: TYPE_LABEL, COLOURS: COLOURS,
    RECUR: RECUR, ALERTS: ALERTS, PRIORITIES: PRIORITIES,
    COUNTDOWN_TYPES: COUNTDOWN_TYPES
  };
})();
