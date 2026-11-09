/* Kurenai OS — modules/todo.js
   Auto-generated daily to-do (FR-4.1), rule-based, regenerated every day:
     1. cards due today from the review queue
     2. exams/deadlines/study blocks from the calendar in the next few days
     3. the user's own manual tasks (persist independently)
   The generated items are sealed by EVIDENCE only and pay nothing (HR-18);
   a hand tick (manual tasks, sub-tasks, the old habits) pays once a day per
   item through the session log — a receipt (`paidOn`) makes an untick and
   re-tick the same day pay nothing (RC21).                                  */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  function T() { return store.state.todo; }

  /* ---------- the directives tick from EVIDENCE (HR-18, decision B2) ----------
     A directive is sealed only by the work it names: the due cards
     cleared, the exam's revision time met, the deadline submitted or
     worked on, the study block's Focus done. There is no hand tick, and a
     directive pays NOTHING — the work behind it already paid (a review, a
     Focus session), so sealing it again would pay twice. */
  var PREP_MINS = 25;                        // a deadline: one block of work today
  function minsFor(ev, day) {
    day = day || KOS.srs.todayISO();
    var labels = ["Revise for " + ev.title, "Revise for: " + ev.title, "Prepare: " + ev.title];
    var leaves = KOS.spec && KOS.calendar.refsOf ? KOS.spec.resolve(KOS.calendar.refsOf(ev)) : [];
    var asg = ev.assignmentId != null ? ev.assignmentId : null;
    return Math.round((store.state.sessions || []).reduce(function (sum, x) {
      if (x.date !== day || x.type === "media" || x.type === "todo" || x.type === "correction" || !x.dur) return sum;
      if (x.metrics && labels.indexOf(x.metrics.objective) !== -1) return sum + x.dur;
      /* by stretch: a switched session counts only its time on this */
      return sum + KOS.sessions.parts(x).reduce(function (n, p) {
        if (asg != null && p.assignmentId === asg) return n + p.secs;
        if (!leaves.length) return n;
        var mine = KOS.spec.resolve(p.refs || []);
        return mine.some(function (k) { return leaves.indexOf(k) !== -1; }) ? n + p.secs : n;
      }, 0);
    }, 0) / 60);
  }
  function goalMinsFor(ev) {
    if (ev.type === "exam") return KOS.calendar.examLevel ? KOS.calendar.examLevel(ev).goalMins || 120 : 120;
    return PREP_MINS;
  }
  function hm(t) { var p = String(t || "").split(":"); return +p[0] * 60 + +p[1]; }
  /* is the evidence in for this directive today? (a pure read) */
  function evidence(it) {
    var today = KOS.srs.todayISO();
    if (it.kind === "due") return it.cleared;
    if (it.kind === "ev") {
      var ev = it.ev;
      if (ev.type === "deadline" && (ev.status === "complete" || ev.status === "submitted")) return true;
      if (ev.assignmentId != null && KOS.assignments && KOS.assignments.get) {
        var a = KOS.assignments.get(ev.assignmentId);
        if (a && (a.status === "complete" || a.status === "submitted")) return true;
      }
      return minsFor(ev, today) >= goalMinsFor(ev);
    }
    if (it.kind === "blk") {
      var e = it.ev;
      if (e.type === "lesson") {
        /* a lesson is sat in class: it is done once its time has passed */
        if (!e.time) return false;
        var now = new Date(), nowM = now.getHours() * 60 + now.getMinutes();
        return nowM >= (e.endTime ? hm(e.endTime) : hm(e.time) + (e.durationMins || 60));
      }
      /* Focus marks the block it was for (focus.js), or a Focus session
         today in its subject (and topic, when both name one) */
      if (T().autoChecked[today + "|blk" + e.id]) return true;
      return (store.state.sessions || []).some(function (x) {
        return x.date === today && x.type === "focus" && KOS.sessions.parts(x).some(function (p) {
          if (e.assignmentId != null && p.assignmentId === e.assignmentId) return true;
          return (!e.subject || p.subject === e.subject) && (!e.ref || !p.ref || p.ref === e.ref);
        });
      });
    }
    return false;
  }

  /* the generated list for today — pure derivation, no storage; each item
     carries `done`, read from the evidence */
  function autoItems() {
    var out = [];
    var today = KOS.srs.todayISO();

    /* 1 — the review due queue; once cleared today it stays, sealed */
    var due = KOS.srs.dueCards();
    if (due.length) {
      var overdue = due.filter(function (c) { return c.overdue > 0; }).length;
      out.push({
        key: "due", kind: "due", label: "Clear " + due.length + " due flashcard" + (due.length === 1 ? "" : "s") +
          (overdue ? " (" + overdue + " overdue)" : ""),
        go: function () { KOS.show("due"); }
      });
    } else if ((store.state.sessions || []).some(function (x) { return x.date === today && (x.type === "due-review" || x.type === "flashcards"); })) {
      out.push({ key: "due", kind: "due", cleared: true, label: "Clear the due flashcards", go: function () { KOS.show("due"); } });
    }

    /* 2 — upcoming exams/deadlines (priority: nearest first), today's study blocks */
    KOS.calendar.deadlines().filter(function (d) { return d.days <= 5; }).slice(0, 4).forEach(function (d) {
      out.push({
        key: "ev" + d.ev.id, kind: "ev", ev: d.ev,
        label: (d.ev.type === "exam" ? "Revise for: " : "Prepare: ") + d.ev.title +
          " — " + (d.days === 0 ? "today" : d.days + "d away"),
        go: function () { KOS.show("calendar"); }
      });
    });
    KOS.calendar.eventsOn(today).filter(function (e) { return e.type === "study" || e.type === "lesson"; })
      .forEach(function (e) {
        out.push({
          key: "blk" + e.id, kind: "blk", ev: e,
          label: (e.time ? e.time + " · " : "") + e.title,
          go: e.subject && e.ref ? function () { KOS.show("ref", { subject: e.subject, ref: e.ref }); }
            : function () { KOS.show("calendar"); }
        });
      });
    out.forEach(function (it) { it.done = !!evidence(it); it.text = it.label; });
    return out;
  }

  function isChecked(key) {
    var it = autoItems().filter(function (a) { return a.key === key; })[0];
    return !!(it && it.done);
  }

  /* manual tasks — CRUD, persist independently of the generated list.
     opts (Apple-Reminders style): { date, category } — both optional. */
  function addManual(text, opts) {
    opts = opts || {};
    var t = T();
    t.manual.push({ id: t.nextId++, text: text, done: false, created: KOS.srs.todayISO(),
      date: opts.date || null, category: opts.category || null });
    store.save();
  }
  function updateManual(id, patch) {
    var m = T().manual.find(function (x) { return x.id === id; });
    if (!m) return;
    Object.keys(patch).forEach(function (k) { m[k] = patch[k]; });
    store.save();
  }
  /* every distinct category the user has used — powers the picker */
  function categories() {
    var seen = {};
    T().manual.forEach(function (m) { if (m.category) seen[m.category] = true; });
    return Object.keys(seen);
  }
  function toggleManual(id, val, label) {
    var m = T().manual.find(function (x) { return x.id === id; });
    if (!m) return;
    m.done = val;
    if (val && m.paidOn !== KOS.srs.todayISO()) { m.paidOn = KOS.srs.todayISO(); KOS.sessions.log({ type: "todo", metrics: { item: label } }); }
    else store.save();
  }
  function deleteManual(id) {
    var t = T();
    var i = t.manual.findIndex(function (x) { return x.id === id; });
    if (i !== -1) { t.manual.splice(i, 1); store.save(); }
  }

  /* ================= Tasks & Habits (the full page) =================
     Reminders with checkable sub-tasks, plus daily habit trackers.
     Rewards flow ONLY through the existing sessions.log "todo" path —
     the same sanctioned trickle every tick has always used. */
  /* once Habits has moved into Routines (roadmap 5.10, plan §5) these
     are shims over KOS.routines, so every older caller keeps working */
  function moved() { return !!(KOS.routines && KOS.routines.migrated()); }
  function habits() {
    if (moved()) return KOS.routines.habitsView();
    var t = T();
    t.habits = t.habits || [];
    return t.habits;
  }
  function addHabit(text) {
    if (moved()) { KOS.routines.addHabit(text); return; }
    var t = T();
    t.habits = t.habits || [];
    t.habits.push({ id: t.nextId++, text: text, days: {}, created: KOS.srs.todayISO() });
    store.save();
  }
  function deleteHabit(id) {
    if (moved()) { var r = KOS.routines.resolve(id); if (r) KOS.routines.remove(r.id); return; }
    var hs = habits();
    var i = hs.findIndex(function (h) { return h.id === id; });
    if (i !== -1) { hs.splice(i, 1); store.save(); }
  }
  function tickHabit(id, val) {
    if (moved()) {
      var r = KOS.routines.resolve(id);
      if (r && r.steps[0]) KOS.routines.tick(r.id, r.steps[0].id, !!val);
      return;
    }
    var h = habits().find(function (x) { return x.id === id; });
    if (!h) return;
    var today = KOS.srs.todayISO();
    if (val) {
      h.days[today] = true;
      if (h.paidOn !== today) { h.paidOn = today; KOS.sessions.log({ type: "todo", metrics: { item: "Habit kept: " + h.text } }); }
      else store.save();
    } else {
      delete h.days[today];
      store.save();
    }
  }
  function habitStreak(h) {
    if (moved() && h && h.routine) return KOS.routines.streak(h.routine);
    var d = KOS.srs.todayISO(), n = 0;
    if (!h.days[d]) d = KOS.srs.addDays(d, -1);   // an unticked today doesn't break it yet
    while (h.days[d]) { n++; d = KOS.srs.addDays(d, -1); }
    return n;
  }

  /* sub-tasks on manual reminders (lazily added to existing items) */
  function addSub(item, text) {
    var t = T();
    item.subs = item.subs || [];
    item.subs.push({ id: t.nextId++, text: text, done: false });
    store.save();
  }
  function tickSub(item, subId, val) {
    var s = (item.subs || []).find(function (x) { return x.id === subId; });
    if (!s) return;
    s.done = val;
    if (val && s.paidOn !== KOS.srs.todayISO()) { s.paidOn = KOS.srs.todayISO(); KOS.sessions.log({ type: "todo", metrics: { item: s.text } }); }
    else store.save();
  }
  function deleteSub(item, subId) {
    var i = (item.subs || []).findIndex(function (x) { return x.id === subId; });
    if (i !== -1) { item.subs.splice(i, 1); store.save(); }
  }

  /* the longest run of kept days a habit has ever had */
  function habitBest(h) {
    if (moved() && h && h.routine) return KOS.routines.best(h.routine);
    var keys = Object.keys(h.days || {}).filter(function (k) { return h.days[k]; }).sort();
    var best = 0, run = 0, prev = null;
    keys.forEach(function (d) {
      run = prev && KOS.srs.addDays(prev, 1) === d ? run + 1 : 1;
      if (run > best) best = run;
      prev = d;
    });
    return best;
  }
  /* The Habits page (frame 10d) was replaced by Routines (roadmap 5.10,
     js/modules/routines.js), which also answers the old #/tasks route. */

  KOS.todo = {
    autoItems: autoItems,
    /* Home's "what next" reads the same tick state the panel renders, so the
       front page can never offer a directive the list already shows sealed */
    isChecked: isChecked,
    /* the time today that was FOR an exam or deadline (Home's Focus card
       reads the same figure) */
    minsFor: minsFor,
    goalMinsFor: goalMinsFor,
    addManual: addManual,
    toggleManual: toggleManual,
    deleteManual: deleteManual,
    habits: habits,
    addHabit: addHabit,
    tickHabit: tickHabit,
    habitStreak: habitStreak,
    addSub: addSub,
    tickSub: tickSub,
    habitBest: habitBest
  };
})();
