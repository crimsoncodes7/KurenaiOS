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
  /* how much an exam matters, and so how far ahead it takes over Home's
     Focus card from assignments and study blocks: a real exam a week out,
     a mock five days, an end-of-topic test three, a retrieval quiz the day
     before. `goalMins` is the day's revision goal while it leads. */
  var EXAM_LEVELS = [
    { v: "exam", label: "Real exam", short: "Exam", leadDays: 7, goalMins: 120 },
    { v: "mock", label: "Mock exam", short: "Mock", leadDays: 5, goalMins: 120 },
    { v: "topic", label: "End-of-topic test", short: "Topic test", leadDays: 3, goalMins: 60 },
    { v: "retrieval", label: "Retrieval test", short: "Retrieval test", leadDays: 1, goalMins: 30 }
  ];
  /* an exam saved before the kind existed (or added without one) reads
     its kind from its title — "Paper 2 mock", "Algebra topic test" — and
     is a real exam otherwise; choosing a kind always wins */
  function guessLevel(title) {
    var t = String(title || "");
    if (/\bmocks?\b/i.test(t)) return "mock";
    if (/\bretrieval\b|\bquiz\b/i.test(t)) return "retrieval";
    if (/end[- ]of[- ](the[- ])?(topic|unit)|\btopic test\b|\bunit test\b|\bprogress (test|exam|check)\b|\bclass test\b/i.test(t)) return "topic";
    return "exam";
  }
  function examLevel(ev) {
    var v = ev && ev.examLevel;
    return EXAM_LEVELS.filter(function (l) { return l.v === v; })[0] || EXAM_LEVELS[0];
  }
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
  /* roadmap 1.1: an event's topic links, whichever shape it is stored in —
     a pull or an old backup can still carry pre-1.1 `topics` pairs */
  function refsOf(ev) {
    if (!ev) return [];
    var list = Array.isArray(ev.refs) ? ev.refs : (Array.isArray(ev.topics) ? ev.topics : []);
    return KOS.spec.normaliseRefs(list, { subject: ev.subject || undefined, max: 20 });
  }
  /* boot pass: `topics` → `refs` on stored events, and a type or colour the
     schema gate does not know (an import's "other", an old seed) becomes
     the gate's own default, so every event has a hue (productivity#6). Only
     those fields move (a migration is not an edit, so updatedAt stays);
     idempotent. */
  function migrateRefs() {
    var c = cal(), changed = 0;
    c.events.forEach(function (ev) {
      if (!ev) return;
      if (!TYPE_LABEL[ev.type]) { ev.type = "personal"; changed++; }
      if (ev.colour && !COLOURS.some(function (x) { return x.v === ev.colour; })) { ev.colour = ""; changed++; }
      if (Array.isArray(ev.refs) && ev.topics === undefined) return;
      ev.refs = refsOf(ev);
      delete ev.topics;
      changed++;
    });
    if (changed) store.save();
    return changed;
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

    /* roadmap 1.1: related topics are "sid:ref" strings (KOS.spec), the
       same links assignments and papers carry. A pre-1.1 event's `topics`
       pairs (or bare refs) are read and rewritten here on its next write. */
    var refs = patch.refs !== undefined ? patch.refs
      : patch.topics !== undefined ? patch.topics
      : (Array.isArray(b.refs) ? b.refs : b.topics);
    refs = KOS.spec.normaliseRefs(Array.isArray(refs) ? refs : [],
      { subject: pick("subject", null) || undefined, max: 20 });
    /* a bare ref under the event's subject still resolves; a ref that is
       not in the specification is dropped rather than re-pointed */

    var dur = pick("durationMins", null);
    dur = dur == null || dur === "" ? null : (Math.max(0, Math.min(1440, Math.round(Number(dur) || 0))) || null);

    var pr = pick("priority", 0);
    pr = Math.max(0, Math.min(3, parseInt(pr, 10) || 0));

    var status = pick("status", "notStarted");
    if (!statuses().some(function (s) { return s.v === status; })) status = "notStarted";

    var assignmentId = pick("assignmentId", null);
    assignmentId = store.idOf(assignmentId);
    if (typeof assignmentId === "number" && isNaN(assignmentId)) assignmentId = null;

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
      examLevel: type === "exam" ? examLevel({ examLevel: pick("examLevel", guessLevel(pick("title", ""))) }).v : null,
      room: String(pick("room", "") || "").trim(),
      refs: refs,
      /* exam + study share ONE duration field rather than two that mean the
         same thing on different records */
      durationMins: dur,
      /* deadline-only */
      priority: pr,
      status: status,
      showInCountdown: showInCountdown,
      /* study-only: a LINK to the canonical assignment, never a copy of it */
      assignmentId: assignmentId,
      /* an exam moved into the Exams hub (roadmap 5.8, invariant 120): the
         event is kept, hidden, so a rollback finds it; the calendar draws
         the assessment instead */
      migratedTo: pick("migratedTo", null) || null,
      /* roadmap 5.15 (invariant 158): the identity a synced copy is named
         by, and the link to it ({g: {id, etag, base, skip, rx}}) — written
         by KOS.extGcal, kept whole through every edit here */
      uid: uidOf(pick("uid", null), b),
      ext: extOf(pick("ext", null)),
      created: b.created || Date.now(),
      updatedAt: Date.now()
    };
  }

  function uidOf(u, b) {
    if (KOS.ext ? KOS.ext.uidOk(u) : /^[0-9a-f]{32}$/.test(u || "")) return u;
    if (!KOS.ext) return null;
    return b && b.id != null && b.created ? KOS.ext.legacyUid("ev", b) : KOS.ext.newUid();
  }
  function extOf(x) { return x && typeof x === "object" && !Array.isArray(x) ? x : null; }
  /* tell the sync (roadmap 5.15); a write a pull makes is ignored there */
  function noteExt() { if (KOS.ext) KOS.ext.noteLocal("calendar"); }

  /* a real exam saved: cards scheduled past it come forward into the
     week or two before it (KOS.srs.examPass, FSRS phase 2) */
  function examSaved(ev) {
    if (ev && ev.type === "exam" && KOS.srs && KOS.srs.examPass) KOS.srs.examPass();
  }

  /* ---------------- CRUD ---------------- */
  function addEvent(ev) {
    var c = cal();
    var input = ev || {};
    if (input.alerts === undefined && COUNTDOWN_TYPES.indexOf(input.type) !== -1) {
      input = Object.assign({}, input, { alerts: [DEFAULT_LEAD] });
    }
    var rec = normalise(input);
    rec.id = store.newId("e");
    c.events.push(rec);
    store.save();
    examSaved(rec);
    noteExt();
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
    examSaved(next);
    noteExt();
    return next;
  }
  function deleteEvent(id) {
    var c = cal();
    var i = c.events.findIndex(function (e) { return e.id === id; });
    if (i !== -1) {
      var gone = c.events[i];
      /* a linked event's remote copy goes too: an explicit queue, never
         inferred from absence (invariant 158) */
      if (KOS.ext && gone.ext && gone.ext.g && gone.ext.g.id) KOS.ext.queueDelete("google", "gcal", { id: gone.ext.g.id });
      c.events.splice(i, 1);
      /* an event that no longer exists must not keep alert bookkeeping alive */
      Object.keys(c.notified).forEach(function (k) {
        if (k.split("|")[1] === String(id)) delete c.notified[k];
      });
      store.save();
    }
  }
  function getEvent(id) {
    if (typeof id === "string" && id.indexOf("x:") === 0) return assessmentViews().filter(function (e) { return e.id === id; })[0] || null;
    return cal().events.find(function (e) { return e.id === id; }) || null;
  }
  /* the stored events the calendar draws (an exam moved into the hub is
     not one of them) and the hub's assessments in an event's shape —
     derived on every read, never written here (invariants 44, 120) */
  function assessmentViews() { return KOS.exams && KOS.exams.eventViews ? KOS.exams.eventViews() : []; }
  function liveEvents() {
    return cal().events.filter(function (e) { return e && !e.migratedTo; }).concat(assessmentViews());
  }

  /* ---------------- recurrence ----------------
     Occurrences are COMPUTED, never materialised into extra records — a
     weekly lesson is one event, so editing it edits every showing of it. */
  function occursOn(ev, dateISO) {
    if (!ev || !ev.date || dateISO < ev.date) return false;
    if (ev.recurUntil && dateISO > ev.recurUntil) return false;
    /* a showing Google Calendar cancelled or moved (roadmap 5.15): the one
       record keeps the dates it skips; a moved one is drawn from Google */
    if (ev.ext && ev.ext.g && Array.isArray(ev.ext.g.skip) && ev.ext.g.skip.indexOf(dateISO) !== -1) return false;
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
    return liveEvents()
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
    var out = liveEvents()
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
          meta: (d.ev.type === "exam" ? examLevel(d.ev).short : TYPE_LABEL[d.ev.type]) + (d.ev.subject ? " · " + d.ev.subject : "") + " · " + prettyDate(d.date)
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
    /* the third canonical read: class milestones the weekly plan dates by
       week — a mock, an assessment, an NEA milestone (derived, never an event) */
    if (KOS.pacing && KOS.pacing.classMilestones) {
      KOS.pacing.classMilestones(sid).forEach(function (m) {
        rows.push({
          kind: "pacing", key: "pc" + m.entry.id, entry: m.entry,
          days: m.days, date: m.date, title: m.entry.title,
          meta: m.label + " in class" + (m.entry.subject ? " · " + m.entry.subject : "") +
            " · " + prettyDate(m.date)
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
      reminders: (KOS.reminders && KOS.reminders.forDate) ? KOS.reminders.forDate(dateISO) : [],
      derived: derivedOn(dateISO)
    };
  }
  /* 27p: bills, income and goal deadlines read onto the calendar by
     DERIVATION (invariants 44, 82b) — drawn from the Money rule or the goal
     each time, never written as events. Per device, each source can be
     hidden (state.ui.calDerived). */
  function shownHere(kind) { var d = KOS.store.state.ui.calDerived || {}; return d[kind] !== false; }
  var derivedShown = shownHere;
  var TONE_HUE = { sage: 1, sky: 1, iris: 1, slate: 1, plum: 1, jade: 1, brass: 1, clay: 1 };
  /* opts.all: every source whatever this device hides (the export to
     Google Calendar must not differ by device, roadmap 5.15) */
  function derivedOn(dateISO, opts) {
    var out = [], all = !!(opts && opts.all);
    function derivedShown(kind) { return all || shownHere(kind); }
    if (KOS.money && derivedShown("money")) {
      var M = KOS.money;
      M.rules().forEach(function (r) {
        var c = r.cat ? M.category(r.cat) : null, tone = r.kind === "transfer" ? "jade" : c ? c.tone : null;
        if (r.trialEnd === dateISO) out.push({ kind: "money", glyph: "円", title: r.name + " trial ends · cancel before", rule: r, date: dateISO, trial: true, tone: tone });
        M.occurrences(r, dateISO, dateISO).forEach(function (d) {
          var st = M.occurrenceState(r, d);
          if (r.trialEnd && d <= r.trialEnd) return;
          out.push({ kind: "money", glyph: "円", title: r.kind === "transfer" ? r.name : r.name, rule: r, date: d, minor: M.amountOn(r, d),
            income: r.kind === "in", state: st, tone: tone });
        });
      });
    }
    /* the Exams hub (roadmap 5.8, 29w): a start-by date, outlined so it
       never looks scheduled; read from the assessment each time */
    if (KOS.exams && derivedShown("exams")) {
      KOS.exams.upcoming(dateISO).forEach(function (a) {
        var st = KOS.exams.startState(a);
        if (!st || st.date !== dateISO || (st.state !== "future" && st.state !== "today")) return;
        out.push({ kind: "startby", glyph: "⚐", title: "Start by · " + a.title, assessment: a, date: dateISO });
      });
    }
    /* roadmap 5.10 (frame 33u): a routine's window and the three review
       marks, dashed so they never look like events; read each time */
    if (KOS.routines && KOS.routines.enabled() && derivedShown("routines")) {
      KOS.routines.all().forEach(function (r) {
        if (r.kind === "habit" || !KOS.routines.scheduledOn(r, dateISO)) return;
        var w = KOS.routines.windowOn(r, dateISO);
        if (!w) return;
        var st = KOS.routines.stateOn(r, dateISO);
        out.push({ kind: "routine", glyph: r.mark || "習", title: r.name, sub: w.from + "–" + w.to, routine: r, date: dateISO, time: w.from,
          state: st === "done" || st === "min" ? "done" : null });
      });
    }
    if (KOS.dayReview && KOS.dayReview.enabled() && derivedShown("reviews")) {
      var mk = { morning: "朝", afternoon: "昼", evening: "夜" };
      KOS.dayReview.slots(dateISO).forEach(function (sl) {
        out.push({ kind: "review", glyph: mk[sl.slot], title: KOS.dayReview.LABEL[sl.slot] + " · " + sl.time, slot: sl.slot, date: dateISO, time: sl.time,
          state: sl.state === "done" ? "done" : null });
      });
    }
    if (KOS.goals && derivedShown("goals")) {
      KOS.goals.all().forEach(function (g) {
        if (g.archived || g.status !== "active") return;
        var end = g.repeat ? KOS.goals.periodOf(g, dateISO).to : g.deadline;
        if (end !== dateISO) return;
        out.push({ kind: "goal", glyph: "標", title: (g.repeat ? (g.repeat === "week" ? "Week ends · " : "Month ends · ") : "Deadline · ") + g.title, goal: g, date: dateISO });
      });
    }
    /* roadmap 5.15: Google Calendar events this app can't hold as one
       record (a rule it has no word for, several days) — read from this
       device's copy, never written as events (invariants 43, 44). Never
       exported back (`all`). */
    if (!all && KOS.extGcal && derivedShown("google")) {
      KOS.extGcal.roOn(dateISO).forEach(function (x) {
        out.push({ kind: "google", glyph: "◷", title: x.title || "(No title)", sub: x.time ? x.time + (x.endTime ? "–" + x.endTime : "") : null,
          date: dateISO, time: x.time || null, gev: x });
      });
    }
    return out;
  }
  function openDerived(d) {
    if (d.kind === "startby") KOS.show("exams", d.assessment.id);
    else if (d.kind === "routine") KOS.show("routines", { edit: d.routine.id });
    else if (d.kind === "review") { var due = KOS.dayReview.due(); if (due && due.slot === d.slot && d.date === KOS.routines.routineDay()) KOS.reviewSheet.open(d.slot); else KOS.show("routines"); }
    else derivedPanel(d);
  }
  function derivedChip(d) {
    var M = KOS.money, hidden = M && M.isHidden();
    var fig = d.minor && !hidden ? (d.income ? "+" : "") + M.format(d.minor) : null;
    var chip = el("button", {
      class: "k-ev k-ev--derived", "data-ui": "cal.event cal.derived", "data-type": "derived", "data-kind": d.kind, type: "button",
      "data-state": d.state === "skip" ? "skipped" : d.state === "done" ? "confirmed" : null,
      "aria-label": d.title + (fig ? ", " + fig : "") + ", " + prettyDate(d.date) + ", " + (d.kind === "startby" ? "derived from Exams" : d.kind === "routine" || d.kind === "review" ? "from Routines" : "from " + (d.kind === "money" ? "Money" : d.kind === "google" ? "Google Calendar" : "Goals")),
      onclick: function (e) { e.stopPropagation(); openDerived(d); }
    }, [
      el("span", { class: "k-ev-glyph", lang: "ja", "aria-hidden": "true", text: d.state === "done" ? "✓" : d.glyph }),
      el("span", { class: "k-ev-t", "data-ui": "cal.ev-t", text: d.title + (fig ? " · " + fig : "") + (d.sub ? " · " + d.sub : "") })
    ]);
    if (d.tone && TONE_HUE[d.tone]) chip.style.setProperty("--ev-hue", "var(--cal-" + d.tone + ")");
    return chip;
  }
  function derivedPanel(d) {
    var M = KOS.money, overlay;
    var body = el("div", { class: "k-dialog-body" });
    if (d.kind === "money") {
      if (d.minor) body.appendChild(el("div", { class: "k-cal-derived-fig" }, [KOS.ui.amount(d.minor, { size: "20", plus: d.income, tone: d.income ? "in" : null }),
        el("span", { class: "k-muted", text: prettyDate(d.date) + " · " + (d.rule.sub ? "subscription" : d.rule.kind === "in" ? "income" : d.rule.kind === "transfer" ? "set-aside" : "a rule") })]));
      body.appendChild(el("p", { class: "k-muted", text: "A derived chip: it is read from the rule each time and is never written as an event. Editing happens in Money." }));
    } else if (d.kind === "google") {
      body.appendChild(el("p", { class: "k-muted", text: prettyDate(d.date) + (d.sub ? " · " + d.sub : "") + (d.gev.location ? " · " + d.gev.location : "") }));
      body.appendChild(el("p", { class: "k-muted", text: "From Google Calendar. It repeats or runs in a way this calendar can't hold as one event, so it's shown here and edited there." }));
    } else {
      body.appendChild(el("p", { class: "k-muted", text: "Read from the goal each time; never written as an event." }));
    }
    var acts = [el("span")];
    if (d.kind === "money" && !d.trial && d.state !== "done" && d.state !== "skip") acts.push(el("button", { type: "button", class: "k-btn", "data-ui": "cal.derived-skip", text: "Skip this one", onclick: function () {
      M.skip(d.rule.id, d.date, function () { overlay.close(); KOS.a11y.announce("Skipped · " + d.rule.name + ", " + prettyDate(d.date)); KOS.rerender(); });
    } }));
    if (d.kind === "google") acts.push(d.gev.link ? el("a", { class: "k-btn k-btn--primary", "data-ui": "cal.derived-open", href: d.gev.link, target: "_blank", rel: "noopener", text: "Open in Google Calendar" }) : null);
    else acts.push(el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "cal.derived-open", text: d.kind === "money" ? "Open in Money" : "Open goal", onclick: function () {
      overlay.close(); if (d.kind === "money") KOS.show("money", "recurring"); else KOS.show("goals", { id: d.goal.id });
    } }));
    acts = acts.filter(Boolean);
    overlay = dialog("cal.derived-panel", d.kind === "money" ? "From Money" : d.kind === "google" ? "From Google Calendar" : "From Goals", d.kind === "money" ? d.rule.name : d.kind === "google" ? d.title : d.goal.title, [body], foot(acts));
    KOS.ui.openDialog(overlay, { label: d.title });
  }
  /* what the calendar draws besides its own events: a menu beside Today
     (state.ui.calDerived, per device), never a card of its own */
  function derivedToggles(rerender) {
    function sw(kind, glyph, label) {
      var box = el("input", { type: "checkbox", class: "k-switch", "data-ui": "cal.derived-toggle", "aria-label": label });
      box.checked = derivedShown(kind);
      box.addEventListener("change", function () {
        var d = KOS.store.state.ui.calDerived = Object.assign({}, KOS.store.state.ui.calDerived || {});
        d[kind] = box.checked; KOS.store.save(); rerender && rerender();
      });
      return el("label", { class: "k-card-row k-cal-toggle" }, [el("span", { class: "k-kanji k-muted", "aria-hidden": "true", text: glyph }), el("span", { class: "k-cal-toggle-t", text: label }), box]);
    }
    return KOS.ui.menu({ label: "Show", hint: "What the calendar shows besides your events", className: "k-btn--sm", panelClass: "k-cal-show",
      render: function (panel) {
        panel.setAttribute("data-ui", "ui.menu-panel cal.derived-card");
        panel.appendChild(el("div", { class: "k-menu-heading", text: "Shown on the calendar" }));
        [sw("money", "円", "Bills and income from Money"), sw("goals", "標", "Goal deadlines and period ends"),
          KOS.exams ? sw("exams", "⚐", "Start-by dates from Exams") : null,
          KOS.routines && KOS.routines.enabled() ? sw("routines", "習", "Routines and their windows") : null,
          KOS.dayReview && KOS.dayReview.enabled() ? sw("reviews", "審", "Daily Review times") : null,
          KOS.extGcal && KOS.extGcal.hasRo() ? sw("google", "◷", "Google events shown read-only") : null].filter(Boolean).forEach(function (n) { panel.appendChild(n); });
      } });
  }

  /* ---------------- sample data ---------------- */
  /* decision B8 (design turn 41, 17 November 2026): a new device plants no
     SAMPLE events — Home says what is there, and only what you add is. The
     seeded flag is still set, and events planted before stay theirs. */
  function seedSamples() {
    var c = cal();
    if (c.seeded) return;
    c.seeded = true;
    var t = today();
    /* the test harness keeps them as its suites' fixtures; the app never sets it */
    if (!window.KOS_SAMPLE_EVENTS) return;
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
      /* an exam moved into the hub keeps the alert identity of the event it
         was (alertKey), so an alert that already fired never fires again */
      var aid = ev.alertKey != null ? ev.alertKey : ev.id;
      ev.alerts.forEach(function (m) {
        var key = t + "|" + aid + "|" + occ.date + "|" + m;
        if (c.notified[key]) return;
        var due = m >= 1440
          ? days <= Math.floor(m / 1440)
          : (now >= moment - m * 60000 && now <= moment + 30 * 60000);
        if (!due) return;
        c.notified[key] = true;
        fired.push({ ev: ev, aid: aid, date: occ.date, days: days, minutes: m });
      });
    });
    /* the log is a today-only ledger — yesterday's keys are noise */
    Object.keys(c.notified).forEach(function (k) {
      if (k.split("|")[0] !== t) delete c.notified[k];
    });
    store.save();
    fired.forEach(function (f) {
      var n = alertNotice(f.ev, f.aid, f.date, f.days, f.minutes);
      KOS.ui.toast("⏰ " + f.ev.title + " — " + n.when, f.days <= 1);
      /* the same fired alert lands in the notification centre, keyed by
         the ticker's own once-only key, so the two never disagree */
      if (KOS.notify) KOS.notify.push(n.item);
    });
    return fired;
  }
  function alertNotice(ev, aid, date, days, minutes) {
    var when = days === 0 ? "today" + (ev.time ? " at " + ev.time : "") :
      days + (days === 1 ? " day" : " days") + " away";
    return { when: when, item: { id: "cal:" + aid + ":" + date + ":" + minutes, kind: "calendar",
      title: ev.title, body: (ev.type === "exam" ? "Exam" : ev.type === "deadline" ? "Deadline" : "Event") + " · " + when,
      view: "calendar", arg: date } };
  }
  /* the alerts checkReminders WOULD fire in [from, to) (ms) — for a closed
     app's push (docs/server-runner-plan.md §3). A lead of a day or more is
     day-grained, so it lands on its first day in the window at `morning`
     ("HH:MM"); a shorter lead at the minute. Pure read. */
  function forecast(from, to, morning) {
    var out = [], t = today(), mh = String(morning || "08:00").split(":");
    var c = cal();
    occurrencesBetween(t, KOS.srs.addDays(t, 38)).forEach(function (occ) {
      var ev = occ.ev;
      if (!ev.alerts || !ev.alerts.length) return;
      if (ev.type === "deadline" && (ev.status === "complete" || ev.status === "submitted")) return;
      var moment = occurrenceMoment(ev, occ.date);
      var aid = ev.alertKey != null ? ev.alertKey : ev.id;
      ev.alerts.forEach(function (m) {
        var at, day;
        if (m >= 1440) {
          day = KOS.srs.addDays(occ.date, -Math.floor(m / 1440));
          var p = day.split("-");
          at = new Date(+p[0], +p[1] - 1, +p[2], +mh[0], +mh[1] || 0, 0, 0).getTime();
        } else {
          at = moment - m * 60000;
          var d = new Date(at);
          day = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
        }
        if (at < from || at >= to) return;
        if (c.notified && c.notified[day + "|" + aid + "|" + occ.date + "|" + m]) return;
        out.push(Object.assign(alertNotice(ev, aid, occ.date, KOS.srs.daysBetween(day, occ.date), m).item, { at: at }));
      });
    });
    return out;
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
  /* what the Focus page is opened with for an event (invariant 4e) */
  function focusArg(ev) {
    var a = { subject: ev.subject || "", ref: ev.ref || "" };
    if (Array.isArray(ev.refs) && ev.refs.length) a.refs = ev.refs.slice();
    if (ev.assignmentId != null) a.assignmentId = ev.assignmentId;
    if (ev.type === "study" && ev.durationMins > 0) a.mins = ev.durationMins;
    return a;
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
     the event chip — Graphite (frame 10e): a dot and a title on a wash
     of the event's hue. Every hue flows through --ev-hue (invariant 46):
     the chip carries its type and, when chosen, its colour, and the
     stylesheet turns those into the hue.
     ================================================================ */
  function hueAttrs(node, ev) {
    /* a type or colour the gate does not know draws as Personal's, never as no hue (productivity#6) */
    node.setAttribute("data-type", TYPE_LABEL[ev.type] ? ev.type : "personal");
    if (ev.colour && COLOURS.some(function (x) { return x.v === ev.colour; })) node.setAttribute("data-colour", ev.colour);
    return node;
  }
  function eventChip(ev, dateISO, onChanged, opts) {
    opts = opts || {};
    var recurring = (ev.recur || "none") !== "none";
    var bits = [el("span", { class: "k-ev-dot", "aria-hidden": "true" })];
    if (!ev.allDay && ev.time) bits.push(el("span", { class: "k-ev-time k-mono", text: ev.time }));
    bits.push(el("span", { class: "k-ev-t", "data-ui": "cal.ev-t", text: ev.title || "Untitled" }));
    if (recurring) bits.push(el("span", { class: "k-ev-mark", "data-ui": "cal.ev-re", "aria-hidden": "true", text: "↻" }));
    if (ev.type === "deadline" && ev.priority >= 2) {
      bits.push(el("span", { class: "k-ev-mark", "aria-hidden": "true", text: ev.priority === 3 ? "!!!" : "!!" }));
    }
    var label = (ev.allDay ? "All day" : (ev.time || "")) + " " + (ev.title || "Untitled") +
      " — " + TYPE_LABEL[ev.type] + (recurring ? ", " + describeRecur(ev).toLowerCase() : "");
    var chip = el("button", {
      class: "k-ev", "data-ui": "cal.event",
      "data-block": opts.block ? "" : null,
      type: "button",
      title: label + (ev.location ? " · " + ev.location : ""),
      "aria-label": label,
      onclick: function (e) { e.stopPropagation(); eventDetail(ev, dateISO, onChanged); }
    }, bits);
    if (ev.allDay || !ev.time) KOS.ui.state(chip, "allday", true);
    return hueAttrs(chip, ev);
  }
  /* an assignment's chip is DERIVED — clicking it goes to the assignment,
     never to a calendar record, because there is no calendar record */
  function assignmentChip(a, onChanged) {
    var chip = el("button", {
      class: "k-ev", "data-ui": "cal.event cal.asg", "data-type": "assignment",
      type: "button",
      title: "Assignment · " + a.title + " · " + KOS.assignments.statusLabel(a.status) +
        (a.dueTime ? " · " + a.dueTime : "") + " — manage in the tracker",
      "aria-label": "Assignment due: " + a.title,
      onclick: function (e) { e.stopPropagation(); openAssignment(a, onChanged); }
    }, [
      el("span", { class: "k-ev-dot", "aria-hidden": "true" }),
      el("span", { class: "k-ev-time k-mono", "aria-hidden": "true", text: a.dueTime || "課" }),
      el("span", { class: "k-ev-t", "data-ui": "cal.ev-t", text: a.title })
    ]);
    if (KOS.assignments.isOverdue(a)) KOS.ui.state(chip, "overdue", true);
    if (a.status === "submitted") KOS.ui.state(chip, "handed-in", true);
    return chip;
  }
  function reminderChip(r) {
    var chip = el("button", {
      class: "k-ev", "data-ui": "cal.event cal.rem", "data-type": "reminder", type: "button",
      title: "Reminder · " + r.title + (r.dueTime ? " · " + r.dueTime : "") + " — manage in Reminders",
      "aria-label": "Reminder: " + r.title,
      onclick: function (e) { e.stopPropagation(); KOS.show("reminders"); }
    }, [
      el("span", { class: "k-ev-dot", "aria-hidden": "true" }),
      r.dueTime ? el("span", { class: "k-ev-time k-mono", text: r.dueTime }) : null,
      el("span", { class: "k-ev-t", "data-ui": "cal.ev-t", text: r.title })
    ].filter(Boolean));
    if (KOS.reminders.isOverdue(r)) KOS.ui.state(chip, "overdue", true);
    return chip;
  }

  /* ================================================================
     dialogs — one shell for the day sheet, the detail and the editor
     ================================================================ */
  function dialog(hook, kicker, title, body, foot) {
    var overlay = el("div", { class: "k-dialog-overlay" });
    overlay.close = function () { overlay.remove(); };
    var box = el("div", { class: "k-dialog k-cal-dialog", "data-ui": "ui.dialog " + hook }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("div", { class: "k-cal-dialog-t" }, [
          kicker ? el("span", { class: "k-kicker", text: kicker }) : null,
          el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: title })
        ].filter(Boolean)),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✕", "aria-label": "Close", onclick: function () { overlay.close(); } })
      ])
    ].concat(body).concat(foot ? [foot] : []));
    overlay.appendChild(box);
    overlay.box = box;
    return overlay;
  }
  function foot(kids) {
    return el("div", { class: "k-dialog-foot k-cal-foot", "data-ui": "cal.modal-foot" }, kids.filter(Boolean));
  }


  /* the Calendar page, the day sheet, the event detail and the editor load
     on first use (js/modules/calpage.js, page-calendar, 1F): until then each
     is a forwarder that loads the bundle and then opens it */
  var later = {};
  function lazyCall(name) {
    return function () {
      var a = arguments;
      if (later[name]) return later[name].apply(null, a);
      if (KOS.lazy && KOS.lazy.need) KOS.lazy.need("page-calendar").then(function () { if (later[name]) later[name].apply(null, a); }, function () {
        KOS.ui.toast("The calendar couldn't load; try again online.", true);
      });
    };
  }
  var daySheet = lazyCall("daySheet"), eventDetail = lazyCall("eventDetail"), assignmentCard = lazyCall("assignmentCard"), eventModal = lazyCall("eventModal");

  /* ================================================================
     the countdown widget — Graphite (frame 10e): a mono day count
     beside the title and its date, the nearest first
     ================================================================ */
  /* what pressing a countdown row does, wherever the row is drawn: an
     assignment opens its dialog, a plan milestone its week, an event its
     detail — the one routing for the widget, Home and the subject desk */
  function openCountdown(row, done) {
    if (row.kind === "assignment") openAssignment(row.assignment, done || null);
    else if (row.kind === "pacing") KOS.show("pacing", { wb: row.entry.wb });
    else eventDetail(row.ev, row.date, done || null);
  }
  function countdownWidget(sid, limit) {
    var list = countdowns(sid, limit || 5);
    var wrap = el("section", { class: "k-card k-cal-cd", "data-ui": "cal.countdowns", "aria-label": "Countdowns" });
    wrap.appendChild(el("div", { class: "k-card-head", "data-ui": "cal.countdown-head" }, [
      el("h2", { class: "k-card-title", text: "Countdowns" }),
      el("span", { class: "k-card-meta", text: "The term ahead" })
    ]));
    if (!list.length) {
      wrap.appendChild(el("p", { class: "k-muted k-cal-cd-empty", text: "No upcoming exams, deadlines or major assignments. Anything you mark for the countdown appears here." }));
      return wrap;
    }
    list.forEach(function (row) {
      var item = el("button", {
        class: "k-cal-cd-row", "data-ui": "cal.countdown-item", type: "button", title: row.title + " — " + row.meta,
        "aria-label": row.title + ", " + (row.days === 0 ? "today" : "in " + row.days + (row.days === 1 ? " day" : " days")) + ", " + row.meta,
        onclick: function () { openCountdown(row); }
      }, [
        el("span", { class: "k-cal-cd-days k-mono", "aria-label": row.days + (row.days === 1 ? " day" : " days") }, [
          String(row.days), el("span", { "aria-hidden": "true", text: "d" })
        ]),
        el("span", { class: "k-cal-cd-body" }, [
          el("span", { class: "k-cal-row-t", text: row.title }),
          el("span", { class: "k-cal-row-m", text: row.days === 0 ? "Today" : prettyDate(row.date) })
        ])
      ]);
      if (row.days <= 3) KOS.ui.state(item, "hot", true);
      wrap.appendChild(item);
    });
    return wrap;
  }

  /* Today, from all three canonical stores: a hue bar, the title and when */
  function todayCard(onChanged) {
    var t = today(), d = parseISO(t);
    var items = dayItems(t);
    var card = el("section", { class: "k-card", "data-ui": "cal.today", "aria-label": "Today" }, [
      el("p", { class: "k-cal-today-date", text: DOW_LONG[(d.getDay() + 6) % 7] + " " + d.getDate() + " " + MONTHS[d.getMonth()] }),
      el("h2", { class: "k-card-title", text: "Today" })
    ]);
    function row(hue, title, meta, go) {
      return hueAttrs(el("button", { type: "button", class: "k-cal-row", onclick: go }, [
        el("span", { class: "k-cal-row-bar", "aria-hidden": "true" }),
        el("span", { class: "k-cal-row-body" }, [el("span", { class: "k-cal-row-t", text: title }), el("span", { class: "k-cal-row-m", text: meta })])
      ]), hue);
    }
    items.events.forEach(function (ev) {
      card.appendChild(row(ev, ev.title, [timeRange(ev), ev.location, ev.durationMins ? durationLabel(ev.durationMins) : "", ev.ref ? ev.ref : ""].filter(Boolean).join(" · "),
        function () { eventDetail(ev, t, onChanged); }));
    });
    items.assignments.forEach(function (a) {
      card.appendChild(row({ type: "assignment" }, a.title, (a.dueTime || "Due today") + " · Assignment", function () { openAssignment(a, onChanged); }));
    });
    items.reminders.forEach(function (r) {
      var ln = KOS.reminders.listName && r.listId != null ? KOS.reminders.listName(r.listId) : "";
      card.appendChild(row({ type: "reminder" }, r.title, [r.dueTime || "Any time", ln].filter(Boolean).join(" · "), function () { KOS.show("reminders"); }));
    });
    if (!items.events.length && !items.assignments.length && !items.reminders.length) {
      card.appendChild(el("p", { class: "k-muted k-cal-cd-empty", text: "Nothing scheduled today." }));
    }
    return card;
  }

  KOS.calendar = {
    refsOf: refsOf,
    migrateRefs: migrateRefs,
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
    derivedOn: derivedOn,
    seedSamples: seedSamples,
    checkReminders: checkReminders,
    forecast: forecast,
    countdownWidget: countdownWidget,
    openCountdown: openCountdown,
    eventModal: eventModal,
    eventDetail: eventDetail,
    daySheet: daySheet,
    alertLabel: alertLabel,
    TYPES: TYPES, TYPE_LABEL: TYPE_LABEL, COLOURS: COLOURS,
    RECUR: RECUR, ALERTS: ALERTS, PRIORITIES: PRIORITIES,
    COUNTDOWN_TYPES: COUNTDOWN_TYPES,
    EXAM_LEVELS: EXAM_LEVELS, examLevel: examLevel
  };
  /* what calpage.js reads, and where it puts what it defines */
  KOS.calendar._k = { TYPES: TYPES, TYPE_LABEL: TYPE_LABEL, COLOURS: COLOURS, RECUR: RECUR, ALERTS: ALERTS, PRIORITIES: PRIORITIES, statuses: statuses, statusLabel: statusLabel, COUNTDOWN_TYPES: COUNTDOWN_TYPES, EXAM_LEVELS: EXAM_LEVELS, examLevel: examLevel, DOW: DOW, DOW_LONG: DOW_LONG, MONTHS: MONTHS, MONTH_CHIPS: MONTH_CHIPS, iso: iso, isoOf: isoOf, parseISO: parseISO, isDate: isDate, mins: mins, hm: hm, today: today, nowMinutes: nowMinutes, daysInMonth: daysInMonth, cal: cal, refsOf: refsOf, normalise: normalise, addEvent: addEvent, updateEvent: updateEvent, deleteEvent: deleteEvent, getEvent: getEvent, occursOn: occursOn, nextOccurrence: nextOccurrence, describeRecur: describeRecur, deadlines: deadlines, countdowns: countdowns, dayItems: dayItems, openDerived: openDerived, derivedChip: derivedChip, derivedToggles: derivedToggles, prettyDate: prettyDate, timeRange: timeRange, focusArg: focusArg, durationLabel: durationLabel, topicLabel: topicLabel, subjectName: subjectName, alertLabel: alertLabel, openAssignment: openAssignment, hueAttrs: hueAttrs, eventChip: eventChip, assignmentChip: assignmentChip, reminderChip: reminderChip, dialog: dialog, foot: foot, countdownWidget: countdownWidget, todayCard: todayCard };
  KOS.calendar._later = later;
})();
