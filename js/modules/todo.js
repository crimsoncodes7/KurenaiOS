/* Kurenai OS — modules/todo.js
   Auto-generated daily to-do (FR-4.1), rule-based, regenerated every day:
     1. cards due today from the review queue
     2. exams/deadlines/study blocks from the calendar in the next few days
     3. the user's own manual tasks (persist independently)
   Ticks feed XP/HP through the session log like every other governor action.
   Auto-item tick state is per-day (keyed date|autoKey); manual tasks keep a
   durable done flag.                                                        */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  function T() { return store.state.todo; }

  /* the generated list for today — pure derivation, no storage */
  function autoItems() {
    var out = [];
    var today = KOS.srs.todayISO();

    /* 1 — the review due queue */
    var due = KOS.srs.dueCards();
    if (due.length) {
      var overdue = due.filter(function (c) { return c.overdue > 0; }).length;
      out.push({
        key: "due", label: "Clear " + due.length + " due flashcard" + (due.length === 1 ? "" : "s") +
          (overdue ? " (" + overdue + " overdue)" : ""),
        reward: "+20 XP", go: function () { KOS.show("due"); }
      });
    }

    /* 2 — upcoming exams/deadlines (priority: nearest first), today's study blocks */
    KOS.calendar.deadlines().filter(function (d) { return d.days <= 5; }).slice(0, 4).forEach(function (d) {
      out.push({
        key: "ev" + d.ev.id,
        label: (d.ev.type === "exam" ? "Revise for: " : "Prepare: ") + d.ev.title +
          " — " + (d.days === 0 ? "today" : d.days + "d away"),
        reward: "+5 XP", go: function () { KOS.show("calendar"); }
      });
    });
    KOS.calendar.eventsOn(today).filter(function (e) { return e.type === "study" || e.type === "lesson"; })
      .forEach(function (e) {
        out.push({
          key: "blk" + e.id,
          label: (e.time ? e.time + " · " : "") + e.title,
          reward: "+5 XP",
          go: e.subject && e.ref ? function () { KOS.show("ref", { subject: e.subject, ref: e.ref }); }
            : function () { KOS.show("calendar"); }
        });
      });
    return out;
  }

  function isChecked(key) {
    return !!T().autoChecked[KOS.srs.todayISO() + "|" + key];
  }
  function setChecked(key, val, label) {
    var t = T(), today = KOS.srs.todayISO();
    /* prune yesterday's tick state while we're here — the list regenerates daily */
    Object.keys(t.autoChecked).forEach(function (k) {
      if (k.split("|")[0] !== today) delete t.autoChecked[k];
    });
    if (val) {
      t.autoChecked[today + "|" + key] = true;
      KOS.sessions.log({ type: "todo", metrics: { item: label } });   // XP/HP via governor
    } else {
      delete t.autoChecked[today + "|" + key];
      store.save();
    }
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
    if (val) KOS.sessions.log({ type: "todo", metrics: { item: label } });
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
      KOS.sessions.log({ type: "todo", metrics: { item: "Habit kept: " + h.text } });
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
    if (val) KOS.sessions.log({ type: "todo", metrics: { item: s.text } });
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
    /* seal or unseal a directive (Home's daily goal): the same path the
       panel's checkbox takes, so the reward flows through sessions.log */
    setChecked: setChecked,
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
