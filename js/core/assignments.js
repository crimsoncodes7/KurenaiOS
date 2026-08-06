/* Kurenai OS — core/assignments.js
   The Assignment Tracker's canonical model (Build 6.4).

   ONE RECORD, MANY SURFACES. This store is the single source of truth for an
   assignment. Study, Calendar, Countdown, Home and the Focus Timer all
   DERIVE their view of it from here — none of them keeps a copy, and none of
   them writes a shadow record. Two consequences that are deliberate:

     · a deadline is NOT a calendar event. The calendar grid asks
       forDate() what is due that day, so an assignment can never leave an
       orphaned event behind. Deleting the assignment deletes every derived
       surface with it, because there was never anything else to delete.
     · countdown visibility is a FIELD, not a side effect. Ordinary work
       stays out of the Countdown rail; only assignments explicitly marked
       major appear there (mirroring the reminders rule in invariant terms:
       routine items never become major countdowns).

   ATTACHMENTS ride the existing attachment store under a deterministic
   topic ref ("assignment:<id>"), so backup, restore and cloud sync already
   cover them and there is no second binary store to keep in step.

   GOVERNOR BOUNDARY. Completing an assignment pays the same sanctioned
   trickle every tick pays, through KOS.sessions.log({type:"todo"}) — never
   by touching HP/XP/gold directly (invariant #1). It pays ONCE per
   assignment: reopening and re-completing earns nothing further, so the
   status field cannot be farmed.                                           */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;

  var STATUSES = [
    { v: "notStarted", label: "Not started", tone: "idle" },
    { v: "inProgress", label: "In progress", tone: "live" },
    { v: "blocked", label: "Blocked", tone: "bad" },
    { v: "submitted", label: "Submitted", tone: "done" },
    { v: "complete", label: "Complete", tone: "done" }
  ];
  var OPEN_STATUSES = ["notStarted", "inProgress", "blocked"];
  var TYPES = [
    { v: "homework", label: "Homework" },
    { v: "essay", label: "Essay" },
    { v: "coursework", label: "Coursework / NEA" },
    { v: "practical", label: "Practical" },
    { v: "revision", label: "Revision task" },
    { v: "project", label: "Project" },
    { v: "other", label: "Other" }
  ];
  var PRIORITIES = [
    { v: 0, label: "None", short: "" },
    { v: 1, label: "Low", short: "!" },
    { v: 2, label: "Medium", short: "!!" },
    { v: 3, label: "High", short: "!!!" }
  ];
  var ALERTS = [
    { v: 0, label: "At the deadline" },
    { v: 60, label: "1 hour before" },
    { v: 1440, label: "1 day before" },
    { v: 4320, label: "3 days before" },
    { v: 10080, label: "1 week before" }
  ];
  /* an assignment is "urgent" for Home at or inside this many days */
  var URGENT_DAYS = 3;

  function A() {
    var s = store.state.assignments;
    if (!s) { s = store.state.assignments = { v: 1, nextId: 1, items: [] }; }
    if (!Array.isArray(s.items)) s.items = [];
    if (typeof s.nextId !== "number") s.nextId = 1;
    return s;
  }
  function today() { return KOS.srs.todayISO(); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function nowHM() { var d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function isDate(s) { return !!s && /^\d{4}-\d{2}-\d{2}$/.test(s); }

  /* ---------------- the single schema gate ----------------
     Every write goes through normalise(), so a field not listed here cannot
     enter the store and a field added here reaches every record. */
  function normalise(patch, base) {
    var b = base || {};
    var status = patch.status !== undefined ? patch.status : b.status;
    if (!STATUSES.some(function (s) { return s.v === status; })) status = "notStarted";

    var due = patch.due !== undefined ? patch.due : b.due;
    due = isDate(due) ? due : null;
    var dueTime = patch.dueTime !== undefined ? patch.dueTime : b.dueTime;
    dueTime = due && dueTime && /^\d{2}:\d{2}$/.test(dueTime) ? dueTime : null;
    var assigned = patch.assigned !== undefined ? patch.assigned : b.assigned;
    assigned = isDate(assigned) ? assigned : null;

    var prog = patch.progress != null ? patch.progress : b.progress;
    prog = Math.max(0, Math.min(100, Math.round(Number(prog) || 0)));
    /* the two terminal statuses ARE 100% by definition — a "complete"
       assignment sitting at 40% would make every derived surface lie */
    if (status === "complete" || status === "submitted") prog = 100;

    var topics = (patch.topics != null ? patch.topics : b.topics) || [];
    if (!Array.isArray(topics)) topics = [];
    topics = topics
      .map(function (t) { return t && t.subject && t.ref ? { subject: String(t.subject), ref: String(t.ref) } : null; })
      .filter(Boolean)
      .filter(function (t, i, a) {
        return a.findIndex(function (x) { return x.subject === t.subject && x.ref === t.ref; }) === i;
      })
      .slice(0, 20);

    var alerts = (patch.alerts != null ? patch.alerts : b.alerts) || [];
    if (!Array.isArray(alerts)) alerts = [];
    alerts = alerts.map(function (x) { return parseInt(x, 10); })
      .filter(function (x) { return !isNaN(x) && x >= 0; })
      .filter(function (x, i, arr) { return arr.indexOf(x) === i; })
      .sort(function (x, y) { return x - y; }).slice(0, 4);

    var subs = (patch.subtasks != null ? patch.subtasks : b.subtasks) || [];
    if (!Array.isArray(subs)) subs = [];

    var pr = patch.priority != null ? patch.priority : b.priority;
    pr = Math.max(0, Math.min(3, parseInt(pr, 10) || 0));

    function mins(v, fallback) {
      var n = v != null ? Math.round(Number(v)) : fallback;
      return isNaN(n) || n < 0 ? 0 : Math.min(n, 100000);
    }

    return {
      id: b.id,
      title: String(patch.title != null ? patch.title : b.title || "").trim(),
      subject: (patch.subject !== undefined ? patch.subject : b.subject) || null,
      type: TYPES.some(function (t) { return t.v === (patch.type !== undefined ? patch.type : b.type); })
        ? (patch.type !== undefined ? patch.type : b.type) : "homework",
      description: String(patch.description != null ? patch.description : b.description || ""),
      assigned: assigned,
      due: due,
      dueTime: dueTime,
      status: status,
      progress: prog,
      priority: pr,
      estimateMins: mins(patch.estimateMins, b.estimateMins || 0),
      actualMins: mins(patch.actualMins, b.actualMins || 0),
      subtasks: subs,
      notes: String(patch.notes != null ? patch.notes : b.notes || ""),
      topics: topics,
      alerts: alerts,
      alerted: b.alerted || {},
      showInCalendar: patch.showInCalendar !== undefined ? !!patch.showInCalendar
        : (b.showInCalendar !== undefined ? !!b.showInCalendar : true),
      showInCountdown: patch.showInCountdown !== undefined ? !!patch.showInCountdown
        : (b.showInCountdown !== undefined ? !!b.showInCountdown : false),
      rewarded: !!b.rewarded,
      created: b.created || Date.now(),
      updatedAt: Date.now(),
      submittedAt: patch.submittedAt !== undefined ? patch.submittedAt : (b.submittedAt || null),
      completedAt: patch.completedAt !== undefined ? patch.completedAt : (b.completedAt || null)
    };
  }

  /* ---------------- CRUD ---------------- */
  function all() { return A().items; }
  function get(id) { return A().items.find(function (x) { return x.id === id; }) || null; }
  function add(patch) {
    var s = A();
    var rec = normalise(patch || {});
    if (!rec.title) return null;
    rec.id = s.nextId++;
    if (!rec.assigned) rec.assigned = today();
    s.items.push(rec);
    store.save();
    return rec;
  }
  function update(id, patch) {
    var s = A(), rec = get(id);
    if (!rec) return null;
    var next = normalise(patch || {}, rec);
    next.id = rec.id;
    s.items[s.items.indexOf(rec)] = next;
    store.save();
    return next;
  }
  /* Deleting is a one-liner precisely BECAUSE nothing was duplicated: the
     calendar chip, the countdown row and the Home card were all derived, so
     they disappear with the record and leave nothing behind. Attachments
     filed under this assignment's ref go with it. */
  function remove(id, cb) {
    var s = A(), i = s.items.findIndex(function (x) { return x.id === id; });
    if (i === -1) { cb && cb(null, false); return false; }
    s.items.splice(i, 1);
    store.save();
    removeAttachments(id, function () { cb && cb(null, true); });
    return true;
  }

  /* ---------------- attachments (no second binary store) ----------------
     Files live in the existing attachment store under a deterministic ref,
     so backup/restore and cloud sync already carry them. */
  function attachRef(rec) { return "assignment:" + (rec && rec.id != null ? rec.id : rec); }
  function attachmentsFor(rec, cb) {
    if (!KOS.attach || !KOS.attach.available || !KOS.attach.available()) { cb(null, []); return; }
    KOS.attach.list(rec.subject || "_", attachRef(rec), cb);
  }
  function removeAttachments(id, cb) {
    if (!KOS.attach || !KOS.attach.available || !KOS.attach.available()) { cb && cb(null); return; }
    var pending = 0, done = false;
    ["compsci", "maths", "it", "_"].forEach(function (sid) {
      pending++;
      KOS.attach.list(sid, attachRef(id), function (err, rows) {
        (rows || []).forEach(function (r) { KOS.attach.remove(r.id, function () {}); });
        if (!--pending && !done) { done = true; cb && cb(null); }
      });
    });
    if (!pending && !done) cb && cb(null);
  }

  /* ---------------- status transitions ---------------- */
  function setStatus(id, status, opts) {
    var rec = get(id);
    if (!rec) return null;
    if (!STATUSES.some(function (s) { return s.v === status; })) return rec;
    var was = rec.status;
    rec.status = status;
    if (status === "submitted") {
      rec.submittedAt = rec.submittedAt || Date.now();
      rec.progress = 100;
    } else if (status === "complete") {
      rec.completedAt = Date.now();
      rec.submittedAt = rec.submittedAt || Date.now();
      rec.progress = 100;
    } else {
      /* reopening clears the terminal stamps so the record stops claiming to
         be finished, and drops progress back off 100 unless subtasks say
         otherwise — a reopened assignment showing 100% helps nobody */
      rec.completedAt = null;
      if (status !== "submitted") rec.submittedAt = null;
      if (was === "complete" || was === "submitted") {
        rec.progress = subtaskProgress(rec);
      }
    }
    rec.updatedAt = Date.now();

    /* the ONE governor path, and only ever once per assignment */
    if (status === "complete" && !rec.rewarded && !(opts && opts.silent)) {
      rec.rewarded = true;
      store.save();
      KOS.sessions.log({ type: "todo", subject: rec.subject || null,
        metrics: { item: "Assignment complete: " + rec.title, source: "assignment", assignmentId: rec.id } });
    } else {
      store.save();
    }
    return rec;
  }
  function subtaskProgress(rec) {
    var subs = rec.subtasks || [];
    if (!subs.length) return Math.min(rec.progress, 90);
    return Math.round(100 * subs.filter(function (s) { return s.done; }).length / subs.length);
  }

  /* ---------------- subtasks ---------------- */
  function subAdd(id, text) {
    var rec = get(id);
    if (!rec || !String(text).trim()) return null;
    var s = A();
    rec.subtasks = rec.subtasks || [];
    rec.subtasks.push({ id: s.nextId++, text: String(text).trim(), done: false });
    syncProgress(rec);
    return rec;
  }
  function subToggle(id, subId, val) {
    var rec = get(id);
    if (!rec) return null;
    var sub = (rec.subtasks || []).find(function (x) { return x.id === subId; });
    if (!sub) return null;
    sub.done = !!val;
    syncProgress(rec);
    return rec;
  }
  function subRemove(id, subId) {
    var rec = get(id);
    if (!rec) return null;
    var i = (rec.subtasks || []).findIndex(function (x) { return x.id === subId; });
    if (i !== -1) { rec.subtasks.splice(i, 1); syncProgress(rec); }
    return rec;
  }
  /* subtask ticks move progress, but never override a terminal status */
  function syncProgress(rec) {
    if (rec.status !== "complete" && rec.status !== "submitted") {
      rec.progress = subtaskProgress(rec);
      if (rec.progress > 0 && rec.status === "notStarted") rec.status = "inProgress";
    }
    rec.updatedAt = Date.now();
    store.save();
  }
  function nextSubtask(rec) {
    return (rec.subtasks || []).find(function (s) { return !s.done; }) || null;
  }

  /* ---------------- effort ----------------
     The Focus Timer calls this when a session linked to an assignment ends.
     Effort accumulates; it is never overwritten by a later session. */
  function addEffort(id, mins) {
    var rec = get(id);
    if (!rec) return null;
    var m = Math.max(0, Math.round(Number(mins) || 0));
    if (!m) return rec;
    rec.actualMins = (rec.actualMins || 0) + m;
    rec.updatedAt = Date.now();
    if (rec.status === "notStarted") rec.status = "inProgress";
    store.save();
    return rec;
  }

  /* ---------------- derived state ---------------- */
  function isOpen(rec) { return OPEN_STATUSES.indexOf(rec.status) !== -1; }
  function isOverdue(rec) {
    if (!isOpen(rec) || !rec.due) return false;
    var t = today();
    if (rec.due < t) return true;
    if (rec.due > t) return false;
    return !!(rec.dueTime && rec.dueTime < nowHM());
  }
  function daysLeft(rec) {
    if (!rec.due) return null;
    return KOS.srs.daysBetween(today(), rec.due);
  }
  function statusLabel(v) {
    var s = STATUSES.find(function (x) { return x.v === v; });
    return s ? s.label : v;
  }
  function typeLabel(v) {
    var t = TYPES.find(function (x) { return x.v === v; });
    return t ? t.label : v;
  }

  /* ---------------- query: filters + sorting ---------------- */
  var DUE_FILTERS = [
    { v: "", label: "Any deadline" },
    { v: "overdue", label: "Overdue" },
    { v: "today", label: "Due today" },
    { v: "week", label: "Next 7 days" },
    { v: "nodate", label: "No deadline" }
  ];
  var SORTS = [
    { v: "due", label: "Deadline" },
    { v: "priority", label: "Priority" },
    { v: "progress", label: "Progress" },
    { v: "title", label: "Title" }
  ];
  function dueKey(a) { return a.due ? a.due + "T" + (a.dueTime || "99:99") : "9999-99-99"; }
  function query(opts) {
    opts = opts || {};
    var rows = all().slice();
    if (opts.subject) rows = rows.filter(function (a) { return a.subject === opts.subject; });
    if (opts.status) rows = rows.filter(function (a) { return a.status === opts.status; });
    if (opts.openOnly) rows = rows.filter(isOpen);
    var t = today();
    if (opts.due === "overdue") rows = rows.filter(isOverdue);
    else if (opts.due === "today") rows = rows.filter(function (a) { return a.due === t; });
    else if (opts.due === "week") {
      var end = KOS.srs.addDays(t, 7);
      rows = rows.filter(function (a) { return a.due && a.due >= t && a.due <= end; });
    } else if (opts.due === "nodate") rows = rows.filter(function (a) { return !a.due; });
    var q = String(opts.search || "").trim().toLowerCase();
    if (q) {
      rows = rows.filter(function (a) {
        return a.title.toLowerCase().indexOf(q) !== -1 ||
          (a.description || "").toLowerCase().indexOf(q) !== -1 ||
          (a.notes || "").toLowerCase().indexOf(q) !== -1 ||
          (a.subtasks || []).some(function (s) { return s.text.toLowerCase().indexOf(q) !== -1; });
      });
    }
    var sort = opts.sort || "due";
    rows.sort(function (a, b) {
      if (sort === "priority") { if (b.priority !== a.priority) return b.priority - a.priority; }
      else if (sort === "progress") { if (a.progress !== b.progress) return a.progress - b.progress; }
      else if (sort === "title") return a.title.localeCompare(b.title);
      var ka = dueKey(a), kb = dueKey(b);
      if (ka !== kb) return ka < kb ? -1 : 1;
      return b.priority - a.priority;
    });
    return rows;
  }
  function counts(subject) {
    var rows = subject ? all().filter(function (a) { return a.subject === subject; }) : all();
    var out = { total: rows.length, overdue: rows.filter(isOverdue).length, open: rows.filter(isOpen).length };
    STATUSES.forEach(function (s) {
      out[s.v] = rows.filter(function (a) { return a.status === s.v; }).length;
    });
    return out;
  }

  /* ---------------- the derived surfaces ----------------
     Each of these is a READ over the same array. No surface stores anything,
     which is why deleting an assignment cleans all of them up at once. */

  /* Calendar grid: what is due on this day. */
  function forDate(dateISO) {
    return all().filter(function (a) {
      return a.showInCalendar && a.due === dateISO && a.status !== "complete";
    });
  }
  /* Countdown rail: only assignments explicitly marked major. */
  function countdownItems(subject) {
    var t = today();
    return all()
      .filter(function (a) {
        return a.showInCountdown && isOpen(a) && a.due && a.due >= t &&
          (!subject || a.subject === subject || !a.subject);
      })
      .map(function (a) { return { assignment: a, days: KOS.srs.daysBetween(t, a.due) }; })
      .sort(function (x, y) { return x.days - y.days; });
  }
  /* Home: what actually needs attention now. */
  function urgent(limit) {
    var t = today();
    return all()
      .filter(function (a) {
        if (!isOpen(a)) return false;
        if (isOverdue(a)) return true;
        if (!a.due) return false;
        var d = KOS.srs.daysBetween(t, a.due);
        return d >= 0 && d <= URGENT_DAYS;
      })
      .sort(function (a, b) {
        var oa = isOverdue(a) ? 0 : 1, ob = isOverdue(b) ? 0 : 1;
        if (oa !== ob) return oa - ob;
        var ka = dueKey(a), kb = dueKey(b);
        if (ka !== kb) return ka < kb ? -1 : 1;
        return b.priority - a.priority;
      })
      .slice(0, limit || 4);
  }
  /* Focus Timer: what a session can be linked to. */
  function linkable(subject) {
    return all()
      .filter(function (a) { return isOpen(a) && (!subject || a.subject === subject); })
      .sort(function (a, b) { return dueKey(a) < dueKey(b) ? -1 : 1; });
  }

  /* ---------------- alerts (in-app, same honesty as elsewhere) ---------- */
  function dueMoment(rec) {
    if (!rec.due) return null;
    var p = rec.due.split("-"), hm = (rec.dueTime || "09:00").split(":");
    return new Date(+p[0], +p[1] - 1, +p[2], +hm[0], +hm[1], 0, 0).getTime();
  }
  function checkAlerts() {
    var fired = [], now = Date.now();
    all().forEach(function (rec) {
      if (!isOpen(rec) || !rec.due || !(rec.alerts || []).length) return;
      var moment = dueMoment(rec);
      if (moment == null) return;
      rec.alerted = rec.alerted || {};
      rec.alerts.forEach(function (mins) {
        var at = moment - mins * 60000;
        if (now < at) return;
        if (now - at > 12 * 3600000) return;          // stale — don't shout on reopen
        var key = rec.due + "|" + (rec.dueTime || "") + "|" + mins;
        if (rec.alerted[key]) return;
        rec.alerted[key] = true;
        fired.push({ assignment: rec, minutes: mins });
      });
    });
    if (fired.length) store.save();
    return fired;
  }

  KOS.assignments = {
    all: all, get: get, add: add, update: update, remove: remove,
    setStatus: setStatus, addEffort: addEffort,
    subAdd: subAdd, subToggle: subToggle, subRemove: subRemove, nextSubtask: nextSubtask,
    query: query, counts: counts,
    isOpen: isOpen, isOverdue: isOverdue, daysLeft: daysLeft,
    statusLabel: statusLabel, typeLabel: typeLabel, subtaskProgress: subtaskProgress,
    forDate: forDate, countdownItems: countdownItems, urgent: urgent, linkable: linkable,
    attachRef: attachRef, attachmentsFor: attachmentsFor,
    checkAlerts: checkAlerts, dueMoment: dueMoment,
    normalise: normalise,
    STATUSES: STATUSES, OPEN_STATUSES: OPEN_STATUSES, TYPES: TYPES,
    PRIORITIES: PRIORITIES, ALERTS: ALERTS, DUE_FILTERS: DUE_FILTERS, SORTS: SORTS,
    URGENT_DAYS: URGENT_DAYS
  };
})();
