/* Kurenai OS — core/today.js · KOS.today
   The day model (roadmap 5.10, docs/routines-plan.md §3, invariant 149):
   one shape for "what belongs to this day", read from every owner — the
   Calendar, the timetable (Pacing's lessons), reminders, assignments, the
   plan's rows, the Exams hub, pinned goals, routines, the ledger's Focus
   time — so the Daily Review, Home and the Assistant can never disagree.

   It COPIES nothing and WRITES nothing. Every row carries `ref: {kind, id}`
   so an action finds the record's owner; the owner makes the change.

     build(day, {now, goals}) → {date, isToday, isSchoolDay, holiday,
       timeline [{kind, start, end, title, subject, ref, done}],
       due      [{kind, ref, title, due, dueTime, overdue, priority,
                  estimateMins, subject, why}],
       warnings [{kind, ref, title, body, days}],
       goals    [{id, title, progress, pace, ends}]      (pinned goals),
       routines [KOS.routines.today rows],
       free     [{from, to, mins}],
       focus    {mins, sessions, bySubject},
       next     {kind, title, why, kicker, subject, ref, refs, assignmentId}|null}
     load(day, opts, cb)   the same, after the goals have been measured

   `next` is Home's Focus ladder (KOS.homeFocusPlan, invariant 53a), read,
   never re-derived, and only for today.                                   */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;
  var HM = /^([01]\d|2[0-3]):([0-5]\d)$/;
  var MIN_FREE = 15;                   // a gap shorter than this is not free time

  function safe(fn, d) { try { var v = fn(); return v == null ? d : v; } catch (e) { return d; } }
  function mins(hm) { var p = hm.split(":"); return +p[0] * 60 + +p[1]; }
  function hm(m) { m = Math.max(0, Math.min(24 * 60 - 1, m)); return (m < 600 ? "0" : "") + Math.floor(m / 60) + ":" + (m % 60 < 10 ? "0" : "") + (m % 60); }
  function addDays(d, n) { return KOS.srs.addDays(d, n); }
  function today(now) { return KOS.routines ? KOS.routines.routineDay(now) : KOS.srs.todayISO(); }
  function isoDow(day) { var p = day.split("-"); var d = new Date(+p[0], +p[1] - 1, +p[2], 12).getDay(); return d === 0 ? 7 : d; }

  function reviewCfg() { return store.state.dayReview || {}; }
  /* school hours on a day with lessons (the timetable has no times) */
  function schoolHours() {
    var s = reviewCfg().school;
    return s && HM.test(s.from) && HM.test(s.to) && s.from < s.to ? { from: s.from, to: s.to } : { from: "08:30", to: "15:30" };
  }
  function dayEnd(day) {
    var t = KOS.dayReview && KOS.dayReview.slotTime ? KOS.dayReview.slotTime("evening", day) : null;
    return t || "22:00";
  }

  /* ---------------- the timeline ---------------- */
  function endOf(e) {
    if (!e.time) return null;
    if (HM.test(e.endTime || "")) return e.endTime;
    return hm(mins(e.time) + (+e.durationMins || 60));
  }
  function eventKind(e) {
    if (e.type === "exam") return "exam";
    if (e.type === "study") return "study";
    if (e.type === "lesson") return "lesson";
    if (e.type === "deadline") return "deadline";
    return "event";
  }
  function timeline(day, now) {
    var out = [];
    safe(function () { return KOS.calendar.eventsOn(day); }, []).forEach(function (e) {
      out.push({ kind: eventKind(e), start: e.time || null, end: endOf(e), title: e.title, subject: e.subject || null,
        ref: e.assessmentId ? { kind: "assessment", id: e.assessmentId } : { kind: "event", id: e.id },
        assignmentId: e.assignmentId != null ? e.assignmentId : undefined, room: e.room || e.location || undefined });
    });
    safe(function () { return KOS.pacing.lessonsOn(day); }, []).forEach(function (l) {
      out.push({ kind: "lesson", start: null, end: null, title: l.lesson.text, subject: l.entry.subject,
        ref: { kind: "plan", id: l.entry.id, lesson: l.lesson.text }, done: !!l.sat, tone: l.lesson.tone });
    });
    if (KOS.routines && KOS.routines.enabled()) {
      safe(function () { return KOS.routines.today(now); }, []).forEach(function (r) {
        if (!r.window) return;
        out.push({ kind: "routine", start: r.window.from, end: r.window.to, title: r.name, ref: { kind: "routine", id: r.id },
          done: r.state === "done" || r.state === "min", left: r.left });
      });
    }
    if (KOS.dayReview && KOS.dayReview.enabled && KOS.dayReview.enabled()) {
      safe(function () { return KOS.dayReview.slots(day); }, []).forEach(function (s) {
        out.push({ kind: "review", start: s.time, end: null, title: s.label, ref: { kind: "review", id: s.slot }, done: s.state === "done" });
      });
    }
    return out.sort(function (a, b) {
      if (!a.start && !b.start) return 0;
      if (!a.start) return -1;
      if (!b.start) return 1;
      return a.start < b.start ? -1 : a.start > b.start ? 1 : 0;
    });
  }

  /* ---------------- what is due ---------------- */
  function due(day, isToday) {
    var out = [];
    /* reminders: dated this day, and overdue ones on today */
    var R = KOS.reminders;
    if (R) {
      var seen = {};
      safe(function () { return R.forDate(day); }, []).concat(isToday ? safe(function () { return R.all().filter(R.isOverdue); }, []) : [])
        .forEach(function (r) {
          if (seen[r.id] || r.done) return;
          seen[r.id] = true;
          out.push({ kind: "reminder", ref: { kind: "reminder", id: r.id }, title: r.title, due: r.due || null, dueTime: r.dueTime || null,
            overdue: isToday && R.isOverdue(r), priority: r.priority || 0 });
        });
    }
    /* assignments: overdue, due within 3 days, started, or a work-on day */
    var A = KOS.assignments;
    if (A) {
      safe(function () { return A.all(); }, []).forEach(function (a) {
        if (!A.isOpen(a)) return;
        var days = a.due ? KOS.srs.daysBetween(day, a.due) : null;
        var work = Array.isArray(a.workOn) && a.workOn.indexOf(day) !== -1;
        var over = isToday && A.isOverdue(a);
        if (!(over || work || (days != null && days >= 0 && days <= 3) || (a.status === "inProgress" && days != null && days <= 7))) return;
        out.push({ kind: "assignment", ref: { kind: "assignment", id: a.id }, title: a.title, due: a.due || null, dueTime: a.dueTime || null,
          overdue: over, priority: a.priority || 0, subject: a.subject || null,
          estimateMins: a.estimateMins ? Math.max(0, a.estimateMins - (a.actualMins || 0)) : null,
          why: work ? "workOn" : over ? "overdue" : a.status === "inProgress" && days > 3 ? "started" : "soon" });
      });
    }
    /* the plan: carried rows, and the week's own unticked rows */
    var P = KOS.pacing;
    if (P && isToday) {
      var wk = safe(function () { return P.dueThisWeek(); }, null);
      if (wk) {
        wk.carried.forEach(function (c) {
          out.push({ kind: "plan", ref: { kind: "plan", id: c.entry.id }, title: c.entry.title, subject: c.entry.subject,
            overdue: true, weeksLate: c.weeksLate, why: "carried" });
        });
        wk.rows.forEach(function (e) {
          out.push({ kind: "plan", ref: { kind: "plan", id: e.id }, title: e.title, subject: e.subject, overdue: false, why: "week" });
        });
      }
      safe(function () { return P.classMilestones(); }, []).forEach(function (m) {
        if (m.days > 3) return;
        out.push({ kind: "milestone", ref: { kind: "plan", id: m.entry.id }, title: m.entry.title, subject: m.entry.subject,
          due: m.date, overdue: false, why: m.label });
      });
    }
    return out.sort(function (a, b) {
      return (a.overdue ? 0 : 1) - (b.overdue ? 0 : 1) || (a.due || "9999").localeCompare(b.due || "9999") ||
        (b.priority || 0) - (a.priority || 0);
    });
  }

  /* ---------------- warnings ---------------- */
  function warnings(day) {
    var out = [];
    safe(function () { return KOS.exams.notices(day); }, []).forEach(function (n) {
      out.push({ kind: "exam", ref: n.arg ? { kind: "assessment", id: typeof n.arg === "string" ? n.arg : n.arg.id || n.arg } : null,
        title: n.title, body: n.body || "", id: n.id });
    });
    /* an exam inside its kind's lead time (invariant 53a's lead times) */
    safe(function () { return KOS.calendar.deadlines(); }, []).forEach(function (d) {
      if (d.ev.type !== "exam") return;
      var lv = safe(function () { return KOS.calendar.examLevel(d.ev); }, { leadDays: 7, short: "Exam" });
      var days = KOS.srs.daysBetween(day, d.date);
      if (days < 0 || days > lv.leadDays) return;
      out.push({ kind: "exam", ref: d.ev.assessmentId ? { kind: "assessment", id: d.ev.assessmentId } : { kind: "event", id: d.ev.id },
        title: d.ev.title, body: lv.short + (days === 0 ? " today" : days === 1 ? " tomorrow" : " in " + days + " days"), days: days });
    });
    var seen = {};
    return out.filter(function (w) { var k = w.title + "|" + w.body; if (seen[k]) return false; seen[k] = true; return true; });
  }

  /* ---------------- pinned goals ---------------- */
  function goals(rows) {
    if (!KOS.goals || !KOS.goals.pinned) return [];
    var byId = {};
    (rows || []).forEach(function (r) { byId[r.id] = r; });
    return KOS.goals.pinned().map(function (g) {
      var r = byId[g.id] || {};
      return { id: g.id, title: g.title, progress: r.progress != null ? r.progress : null, pace: r._pace || null,
        current: r._current != null ? r._current : null, target: r._target != null ? r._target : g.target,
        ends: (r._period && r._period.to) || r.deadline || g.deadline || null };
    });
  }

  /* ---------------- free time ---------------- */
  /* the gaps from `from` (now on today) to the evening review, between the
     day's timed items and, on a school day, school hours */
  function free(day, tl, isSchool, now) {
    var start = mins("08:00");
    if (day === today(now)) { var d = new Date(now); start = Math.max(start, d.getHours() * 60 + d.getMinutes()); }
    var end = mins(dayEnd(day));
    if (start >= end) return [];
    var busy = [];
    if (isSchool) { var sh = schoolHours(); busy.push([mins(sh.from), mins(sh.to)]); }
    tl.forEach(function (t) {
      if (!t.start || t.kind === "review" || t.kind === "routine" || t.kind === "deadline") return;
      busy.push([mins(t.start), t.end ? mins(t.end) : mins(t.start) + 60]);
    });
    busy.sort(function (a, b) { return a[0] - b[0]; });
    var out = [], cur = start;
    busy.forEach(function (b) {
      if (b[1] <= cur) return;
      if (b[0] - cur >= MIN_FREE && b[0] <= end) out.push({ from: hm(cur), to: hm(Math.min(b[0], end)), mins: Math.min(b[0], end) - cur });
      cur = Math.max(cur, b[1]);
    });
    if (end - cur >= MIN_FREE) out.push({ from: hm(cur), to: hm(end), mins: end - cur });
    return out;
  }

  /* ---------------- Focus so far ---------------- */
  function focus(day) {
    var total = 0, n = 0, by = {};
    (store.state.sessions || []).forEach(function (e) {
      if (e.date !== day || e.type !== "focus" || !e.dur) return;
      n++;
      total += e.dur;
      var parts = safe(function () { return KOS.sessions.parts(e); }, [{ subject: e.subject, secs: e.dur }]);
      parts.forEach(function (p) { var k = p.subject || "other"; by[k] = (by[k] || 0) + (p.secs || 0); });
    });
    Object.keys(by).forEach(function (k) { by[k] = Math.round(by[k] / 60); });
    return { mins: Math.round(total / 60), sessions: n, bySubject: by };
  }

  /* ---------------- the next action (Home's ladder, read) ---------------- */
  function next(now) {
    if (!KOS.homeFocusPlan) return null;
    var p = safe(function () { return KOS.homeFocusPlan(new Date(now)); }, null);
    if (!p) return null;
    return { kind: p.kind, kicker: p.kicker || "", title: p.label, why: p.why || "", subject: p.subject || null,
      ref: p.ref || null, refs: (p.refs || []).slice(0, 30), assignmentId: p.assignmentId != null ? p.assignmentId : null,
      mins: p.mins || null };
  }

  /* ---------------- the whole day ---------------- */
  function isHoliday(day) {
    var w = safe(function () { return KOS.pacing.weekFor(day); }, null);
    if (!w) return false;
    if (safe(function () { return KOS.pacing.isBreak(w); }, false)) return true;
    return !safe(function () { return KOS.pacing.entriesFor(w.wb, null, "school").length; }, 0);
  }
  function build(day, opts) {
    opts = opts || {};
    var now = opts.now || Date.now();
    day = day || today(now);
    var isToday = day === today(now);
    var tl = timeline(day, now);
    var lessons = tl.filter(function (t) { return t.kind === "lesson"; }).length;
    var holiday = isHoliday(day);
    var school = lessons > 0 && isoDow(day) <= 5 && !holiday;
    return {
      date: day, isToday: isToday, isSchoolDay: school, holiday: holiday,
      timeline: tl,
      due: due(day, isToday),
      warnings: warnings(day),
      goals: goals(opts.goals),
      routines: KOS.routines && KOS.routines.enabled() ? safe(function () { return KOS.routines.today(now); }, []) : [],
      free: free(day, tl, school, now),
      focus: focus(day),
      next: isToday ? next(now) : null
    };
  }
  function load(day, opts, cb) {
    opts = opts || {};
    if (!KOS.goals || !KOS.goals.compute) { cb(null, build(day, opts)); return; }
    try {
      KOS.goals.compute(function (err, rows) { cb(null, build(day, Object.assign({}, opts, { goals: err ? [] : rows }))); }, { archived: false });
    } catch (e) { cb(null, build(day, opts)); }
  }

  KOS.today = { build: build, load: load, free: free, schoolHours: schoolHours, isHoliday: isHoliday, day: today, MIN_FREE: MIN_FREE };
})();
