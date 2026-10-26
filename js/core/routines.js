/* Kurenai OS — core/routines.js · KOS.routines
   Routines (roadmap 5.10, docs/routines-plan.md §4–5, invariants 142, 143,
   148). A routine is ordered steps — required or optional, an estimate
   each — with active days and a time window. A habit is a routine of one
   step, so Habits moves in whole (§5).

   THE RECORD. state.routines (synced):
     items  [{id (random string), name, kind, mark, steps [{id, text, mins,
            optional, minimum, checkMorning, note, link}], days ([] every
            day, [0..6] those days, null on demand), window {from, to}|null,
            weekend {days, window}|null, anchor, remind, archived, order,
            legacyHabit, createdAt, updatedAt}]
     log    {"<routine>|<routine day>": {steps {stepId: ts}, no {stepId: ts},
            done ts|null, min bool, rest bool, snap [[id, text, optional,
            minimum, checkMorning]], paid bool, startedAt, mins}}
   A keyed map, so the cloud merge folds two devices per key and per step.

   THE SNAPSHOT (invariant 142). The first write of a day freezes the
   routine's steps into `snap`; that day is judged against them for ever,
   so editing a routine changes the next day and never a past one.

   THE ROUTINE DAY (invariant 148). Days start at state.dayReview.dayStart
   (04:00): a step ticked at 00:40 belongs to the day before. Last night's
   EVENING routine stays open until the Morning Review closes or noon
   (decision F): a late tick, or a step checked in the morning, counts for
   that night. The session ledger keeps the calendar day (invariant 4).

   PAY ONCE (invariant 143). A day that becomes kept (every required step,
   or the minimum) logs ONE `todo` session carrying metrics.routine, priced
   by KOS.governor.routineAward; `paid` is never cleared, so untick and
   re-tick pays nothing. At most CAP rewarded completions a calendar day;
   past it the session still logs, as activity, and pays nothing. Steps,
   rest days and on-demand runs pay nothing. A completion is activity for
   the day, never study (sessions.studyEntry).

   OFF UNTIL ITS PAGE SHIPS. The Habits page still reads state.todo.habits.
   Until the Routines page is released, `enabled` is false: nothing here
   runs at boot, ticks or notifies, and habitsView() reads the habits as
   they are. The R1 release turns it on (enable(true)), and boot migrates.

   Reads (all, get, entry, stateOn, streak, history, habitsView, due …)
   write nothing.                                                          */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;

  var CAP = 8;                         // rewarded completions a calendar day
  var REST_EVERY = 7;                  // one planned rest day in any 7 (decision C)
  var COMPACT_DAYS = 60;               // older log entries keep the verdict only
  var LATE_UNTIL = "12:00";            // last night stays open until noon (decision F)
  var KINDS = ["morning", "evening", "study", "custom", "habit"];
  var ANCHORS = ["review:morning", "review:afternoon", "review:evening", "focus"];
  var HM = /^([01]\d|2[0-3]):([0-5]\d)$/;
  var enabled = false;

  /* ---------------- small helpers ---------------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function isoOf(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function hmOf(d) { return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function addDays(iso, n) { return KOS.srs.addDays(iso, n); }
  function dow(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2], 12).getDay(); }
  function rid(prefix) { return prefix + "_" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3); }
  function str(v, max) { return typeof v === "string" ? v.trim().slice(0, max || 200) : ""; }
  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }

  function dayStart() {
    var r = store.state.dayReview;
    return r && HM.test(r.dayStart) ? r.dayStart : "04:00";
  }
  /* the routine day a moment belongs to: before dayStart is the day before */
  function routineDay(ts) {
    var d = new Date(ts == null ? Date.now() : ts);
    return hmOf(d) < dayStart() ? isoOf(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1, 12)) : isoOf(d);
  }
  function weekendDays() {
    var r = store.state.dayReview;
    return r && Array.isArray(r.weekendDays) ? r.weekendDays : [0, 6];
  }

  /* ---------------- the store ---------------- */
  function peek() { return store.state.routines || null; }
  function R() {
    var s = store.state.routines;
    if (!s || typeof s !== "object") s = store.state.routines = { v: 1, items: [], log: {} };
    if (!Array.isArray(s.items)) s.items = [];
    if (!s.log || typeof s.log !== "object" || Array.isArray(s.log)) s.log = {};
    return s;
  }

  /* ---------------- the gate ---------------- */
  function normaliseWindow(w) {
    if (!w || !HM.test(w.from) || !HM.test(w.to)) return null;
    return { from: w.from, to: w.to };
  }
  function normaliseDays(d) {
    if (d === null) return null;
    if (!Array.isArray(d)) return [];
    var out = [];
    d.forEach(function (x) { x = +x; if (x >= 0 && x <= 6 && out.indexOf(x) === -1) out.push(x); });
    return out.length === 7 ? [] : out.sort();
  }
  function normaliseLink(l) {
    if (!l || typeof l !== "object") return null;
    var kind = ["view", "focus", "review", "url"].indexOf(l.kind) !== -1 ? l.kind : null;
    var to = str(l.to, 300);
    if (!kind || !to) return null;
    if (kind === "url" && !/^https:\/\//.test(to)) return null;
    return { kind: kind, to: to };
  }
  function normaliseStep(s, i) {
    s = s || {};
    var out = {
      id: typeof s.id === "string" && s.id ? s.id.slice(0, 40) : rid("s"),
      text: str(s.text, 160) || "Step " + (i + 1),
      mins: Math.max(0, Math.min(240, Math.round(+s.mins || 0)))
    };
    if (s.optional) out.optional = true;
    if (s.minimum) out.minimum = true;
    if (s.checkMorning) out.checkMorning = true;
    var note = str(s.note, 400); if (note) out.note = note;
    var link = normaliseLink(s.link); if (link) out.link = link;
    return out;
  }
  function normalise(rec, base) {
    rec = rec || {}; base = base || {};
    function pick(k) { return rec[k] !== undefined ? rec[k] : base[k]; }
    var steps = (Array.isArray(pick("steps")) ? pick("steps") : []).slice(0, 40).map(normaliseStep);
    /* one minimum step at most; a minimum is never optional */
    var seenMin = false;
    steps.forEach(function (s) {
      if (s.minimum && (seenMin || s.optional)) delete s.minimum;
      if (s.minimum) seenMin = true;
    });
    var ids = {};
    steps.forEach(function (s) { while (ids[s.id]) s.id = rid("s"); ids[s.id] = true; });
    var kind = KINDS.indexOf(pick("kind")) !== -1 ? pick("kind") : (steps.length <= 1 ? "habit" : "custom");
    var wk = pick("weekend");
    var out = {
      id: typeof pick("id") === "string" && pick("id") ? pick("id") : rid("r"),
      name: str(pick("name"), 80) || (steps[0] ? steps[0].text : "Routine"),
      kind: kind,
      mark: str(pick("mark"), 2) || "",
      steps: steps,
      days: normaliseDays(pick("days") === undefined ? [] : pick("days")),
      window: normaliseWindow(pick("window")),
      weekend: wk && typeof wk === "object" ? { days: normaliseDays(wk.days || []), window: normaliseWindow(wk.window) } : null,
      anchor: ANCHORS.indexOf(pick("anchor")) !== -1 ? pick("anchor") : null,
      remind: !!pick("remind"),
      archived: !!pick("archived"),
      order: isFinite(+pick("order")) ? +pick("order") : 0,
      createdAt: +pick("createdAt") || Date.now(),
      updatedAt: Date.now()
    };
    if (pick("legacyHabit") != null) out.legacyHabit = String(pick("legacyHabit"));
    if (typeof pick("template") === "string" && pick("template")) out.template = pick("template").slice(0, 30);
    if (out.weekend && !out.weekend.window && !out.weekend.days.length) out.weekend = null;
    return out;
  }

  /* ---------------- CRUD ---------------- */
  function all(opts) {
    var s = peek();
    var list = s && Array.isArray(s.items) ? s.items : [];
    if (!(opts && opts.archived)) list = list.filter(function (r) { return !r.archived; });
    if (opts && opts.kind) list = list.filter(function (r) { return r.kind === opts.kind; });
    return list.slice().sort(function (a, b) { return (a.order - b.order) || (a.createdAt - b.createdAt); });
  }
  function get(id) {
    var s = peek();
    return (s && Array.isArray(s.items) ? s.items : []).filter(function (r) { return r.id === id; })[0] || null;
  }
  function add(spec) {
    var s = R(), rec = normalise(spec || {});
    while (get(rec.id)) rec.id = rid("r");
    rec.order = s.items.length;
    s.items.push(rec);
    store.save();
    return rec;
  }
  function update(id, patch) {
    var s = R(), cur = get(id);
    if (!cur) return null;
    var next = normalise(Object.assign({}, patch || {}, { id: id, createdAt: cur.createdAt }), cur);
    s.items[s.items.indexOf(cur)] = next;
    store.save();
    return next;
  }
  /* deleting a routine keeps its log: history (Reports, a goal's streak)
     reads the snapshot, and a restore finds the days again */
  function remove(id) {
    var s = R(), i = s.items.findIndex(function (r) { return r.id === id; });
    if (i === -1) return false;
    s.items.splice(i, 1);
    store.save();
    return true;
  }
  function archive(id, on) { return update(id, { archived: on !== false }); }
  function addHabit(text) {
    text = str(text, 160);
    if (!text) return null;
    return add({ name: text, kind: "habit", steps: [{ text: text }], days: [] });
  }
  function templates() { return (window.KOS_ROUTINE_TEMPLATES || []).slice(); }
  function template(tid) { return templates().filter(function (t) { return t.id === tid; })[0] || null; }
  /* "Use this": a routine you own, fresh ids; the template never changes */
  function fromTemplate(tid, over) {
    var t = template(tid);
    if (!t) return null;
    var steps = t.steps.map(function (s) {
      var f = s[2] || "";
      return { text: s[0], mins: s[1], optional: f.indexOf("o") !== -1, minimum: f.indexOf("m") !== -1,
        checkMorning: f.indexOf("n") !== -1, link: s[3] || null };
    });
    return add(Object.assign({ name: t.name, kind: t.kind, mark: t.mark, anchor: t.anchor,
      days: clone(t.days), window: clone(t.window), steps: steps, remind: !!t.window, template: t.id }, over || {}));
  }

  /* ---------------- the schedule ---------------- */
  function scheduleOn(r, day) {
    if (!r || r.days === null) return null;
    var w = r.weekend && weekendDays().indexOf(dow(day)) !== -1 ? r.weekend : null;
    var days = w && w.days.length ? w.days : r.days;
    var on = !days.length || days.indexOf(dow(day)) !== -1;
    return on ? { window: (w && w.window) || r.window } : null;
  }
  function scheduledOn(r, day) { return !!scheduleOn(r, day); }
  function windowOn(r, day) { var s = scheduleOn(r, day); return s ? s.window : null; }

  /* ---------------- the log ---------------- */
  function key(id, day) { return id + "|" + day; }
  function entry(id, day) {
    var s = peek();
    return s && s.log ? s.log[key(id, day)] || null : null;
  }
  function snapOf(r) {
    return r.steps.map(function (s) { return [s.id, s.text, s.optional ? 1 : 0, s.minimum ? 1 : 0, s.checkMorning ? 1 : 0]; });
  }
  /* the steps a day is judged against: its snapshot, else the routine now */
  function stepsFor(r, e) {
    if (e && Array.isArray(e.snap)) return e.snap.map(function (x) { return { id: x[0], text: x[1], optional: !!x[2], minimum: !!x[3], checkMorning: !!x[4] }; });
    return r ? r.steps : [];
  }
  function required(steps) { return steps.filter(function (s) { return !s.optional; }); }
  /* the verdict on one log entry: kept in full, kept at its minimum, or not */
  function verdict(r, e) {
    if (!e) return { done: false, min: false, n: 0, of: required(stepsFor(r, null)).length };
    if (e.compact) return { done: !!e.done, min: !!e.min, n: e.n || 0, of: e.of || 0 };
    var steps = stepsFor(r, e), req = required(steps), ticked = e.steps || {};
    var n = req.filter(function (s) { return ticked[s.id]; }).length;
    var done = req.length > 0 && n === req.length;
    var min = !done && steps.some(function (s) { return s.minimum && ticked[s.id]; });
    return { done: done, min: min, n: n, of: req.length };
  }
  /* a day's state: done · min · partial · rest · open · missed · off */
  function stateOn(r, day, now) {
    var e = entry(r.id, day);
    /* a day before the routine existed was never scheduled */
    if (!e && r.createdAt && day < isoOf(new Date(r.createdAt))) return "off";
    if (e && e.rest) return "rest";
    var v = verdict(r, e);
    if (v.done) return "done";
    if (v.min) return "min";
    var any = e && (e.compact ? e.n > 0 : Object.keys(e.steps || {}).length > 0);
    var sched = r.days === null ? false : (e && e.snap ? true : scheduledOn(r, day));
    if (!sched) return any ? "partial" : "off";
    if (any) return "partial";
    return day < routineDay(now) ? "missed" : "open";
  }

  /* may a tick land on this routine day now? today always; last night's
     evening routine until the Morning Review closes or noon (decision F) */
  function canTick(r, day, now) {
    now = now == null ? Date.now() : now;
    var today = routineDay(now);
    if (day === today) return true;
    if (day !== addDays(today, -1) || !isEvening(r)) return false;
    if (hmOf(new Date(now)) >= LATE_UNTIL) return false;
    var rv = store.state.dayReview, d = rv && rv.days && rv.days[today];
    return !(d && d.morning && (d.morning.state === "done" || d.morning.state === "skipped"));
  }
  function isEvening(r) { return r && (r.kind === "evening" || r.anchor === "review:evening"); }

  function writeEntry(r, day) {
    var s = R(), k = key(r.id, day), e = s.log[k];
    if (!e) e = s.log[k] = { steps: {}, snap: snapOf(r), startedAt: Date.now() };
    if (!e.steps || typeof e.steps !== "object") e.steps = {};
    if (!Array.isArray(e.snap)) e.snap = snapOf(r);
    return e;
  }

  /* tick(id, stepId, on, {day, now, silent}) → {ok, why, state, award} */
  function tick(id, stepId, on, opts) {
    opts = opts || {};
    var r = get(id), now = opts.now || Date.now();
    if (!r) return { ok: false, why: "No routine with that id." };
    var day = opts.day || routineDay(now);
    if (!canTick(r, day, now)) return { ok: false, why: day < routineDay(now) ? "That day has closed." : "That day hasn't started." };
    var e0 = entry(id, day);
    var steps = stepsFor(r, e0);
    if (!steps.some(function (s) { return s.id === stepId; })) return { ok: false, why: "No such step on that day." };
    var e = writeEntry(r, day);
    if (on === false) delete e.steps[stepId];
    else { e.steps[stepId] = now; if (e.no) delete e.no[stepId]; }
    if (e.rest && on !== false) delete e.rest;
    var v = verdict(r, e);
    e.done = v.done ? (e.done || now) : null;
    e.min = !!v.min;
    var award = null;
    if ((v.done || v.min) && !e.paid && r.days !== null) award = pay(r, e, day, v, now);
    store.save();
    return { ok: true, state: v.done ? "done" : v.min ? "min" : "partial", award: award };
  }
  /* a step checked in the morning, answered No: recorded, never ticked */
  function answerNo(id, stepId, opts) {
    opts = opts || {};
    var r = get(id), now = opts.now || Date.now();
    if (!r) return { ok: false };
    var day = opts.day || addDays(routineDay(now), -1);
    if (!canTick(r, day, now)) return { ok: false, why: "That day has closed." };
    var e = writeEntry(r, day);
    e.no = e.no || {};
    e.no[stepId] = now;
    delete e.steps[stepId];
    var v = verdict(r, e);
    e.done = v.done ? (e.done || now) : null;
    store.save();
    return { ok: true };
  }
  function tickAll(id, opts) {
    var r = get(id);
    if (!r) return null;
    var res = null;
    r.steps.filter(function (s) { return !s.optional && !s.checkMorning; }).forEach(function (s) { res = tick(id, s.id, true, opts); });
    return res;
  }

  /* the player's clock (plan §4.4): minutes the run took, kept on the day */
  function setMins(id, m, opts) {
    opts = opts || {};
    var r = get(id), day = opts.day || routineDay(opts.now);
    if (!r || !canTick(r, day, opts.now)) return false;
    var e = writeEntry(r, day);
    e.mins = Math.max(0, Math.min(600, Math.round(+m || 0)));
    store.save();
    return true;
  }

  /* ---------------- pay once (invariant 143) ---------------- */
  function paidToday(now) {
    var today = KOS.srs.todayISO();
    return (store.state.sessions || []).filter(function (e) {
      return e.date === today && e.type === "todo" && e.metrics && e.metrics.routine && !e.metrics.capped;
    }).length;
  }
  function pay(r, e, day, v, now) {
    e.paid = true;
    var capped = paidToday(now) >= CAP;
    var m = { item: (r.kind === "habit" ? "Habit kept: " : "Routine kept: ") + r.name, routine: r.id, rday: day,
      req: v.of, min: !v.done && !!v.min, kind: r.kind };
    if (capped) m.capped = true;
    if (day !== routineDay(now)) m.late = true;
    var award = KOS.governor && KOS.governor.routineAward ? KOS.governor.routineAward(m) : { xp: 0, gold: 0, hp: 0 };
    KOS.sessions.log({ type: "todo", metrics: m });
    return award;
  }

  /* ---------------- rest days (decision C) ---------------- */
  function restAllowed(id, day) {
    for (var i = -(REST_EVERY - 1); i <= REST_EVERY - 1; i++) {
      if (!i) continue;
      var e = entry(id, addDays(day, i));
      if (e && e.rest && Math.abs(i) < REST_EVERY) return false;
    }
    return true;
  }
  function setRest(id, on, opts) {
    opts = opts || {};
    var r = get(id), now = opts.now || Date.now();
    if (!r) return { ok: false, why: "No routine with that id." };
    var day = opts.day || routineDay(now);
    if (day < routineDay(now)) return { ok: false, why: "A rest day is planned ahead, not after." };
    if (on !== false) {
      if (!scheduledOn(r, day)) return { ok: false, why: "Not scheduled that day." };
      var w = windowOn(r, day);
      if (day === routineDay(now) && w && hmOf(new Date(now)) >= w.to) return { ok: false, why: "Its window has closed for today." };
      var v = verdict(r, entry(id, day));
      if (v.done || v.min) return { ok: false, why: "Already kept today." };
      if (!restAllowed(id, day)) return { ok: false, why: "One rest day in any seven." };
      writeEntry(r, day).rest = true;
    } else {
      var e = entry(id, day);
      if (e) delete e.rest;
    }
    store.save();
    return { ok: true };
  }

  /* ---------------- streaks and history (reads) ---------------- */
  function kept(st) { return st === "done" || st === "min"; }
  function streak(id, now) {
    var r = get(id) || ghost(id);
    if (!r || r.days === null) return 0;
    var d = routineDay(now), n = 0, guard = 0;
    var st = stateOn(r, d, now);
    if (!kept(st)) d = addDays(d, -1);            // today never breaks it yet
    while (guard++ < 3660) {
      st = stateOn(r, d, now);
      if (kept(st)) n++;
      else if (st !== "rest" && st !== "off") break;
      d = addDays(d, -1);
      if (r.createdAt && d < isoOf(new Date(r.createdAt)) && !entry(r.id, d)) break;
    }
    return n;
  }
  function best(id, now) {
    var r = get(id) || ghost(id);
    if (!r) return 0;
    var days = loggedDays(r.id);
    if (!days.length) return 0;
    var d = days[0], end = routineDay(now), run = 0, top = 0, guard = 0;
    while (d <= end && guard++ < 3660) {
      var st = stateOn(r, d, now);
      if (kept(st)) { run++; if (run > top) top = run; }
      else if (st !== "rest" && st !== "off" && !(d === end && st === "open")) run = 0;
      d = addDays(d, 1);
    }
    return top;
  }
  function loggedDays(id) {
    var s = peek(), pre = id + "|";
    return s && s.log ? Object.keys(s.log).filter(function (k) { return k.indexOf(pre) === 0; })
      .map(function (k) { return k.slice(pre.length); }).sort() : [];
  }
  /* a deleted routine is still judged by its snapshots */
  function ghost(id) {
    return loggedDays(id).length ? { id: id, days: [], steps: [], createdAt: 0, ghost: true } : null;
  }
  /* history(id, from, to) → [{day, state}]; summary over a range */
  function history(id, from, to, now) {
    var r = get(id) || ghost(id), out = [];
    if (!r) return out;
    for (var d = from; d <= to; d = addDays(d, 1)) out.push({ day: d, state: stateOn(r, d, now) });
    return out;
  }
  function summary(id, from, to, now) {
    var h = history(id, from, to, now), s = { kept: 0, min: 0, scheduled: 0, rest: 0, partial: 0 };
    h.forEach(function (x) {
      if (x.state === "done") s.kept++;
      if (x.state === "min") { s.kept++; s.min++; }
      if (x.state === "rest") s.rest++;
      if (x.state === "partial") s.partial++;
      if (x.state !== "off" && x.state !== "rest" && !(x.state === "open" && x.day === routineDay(now))) s.scheduled++;
    });
    return s;
  }

  /* ---------------- what is due now (reads) ---------------- */
  /* routines scheduled today, with step progress; on-demand ones excluded */
  function today(now) {
    var day = routineDay(now);
    return all().filter(function (r) { return scheduledOn(r, day); }).map(function (r) {
      var e = entry(r.id, day), v = verdict(r, e), w = windowOn(r, day);
      var steps = stepsFor(r, e).filter(function (s) { return !s.checkMorning; });
      return { id: r.id, name: r.name, kind: r.kind, mark: r.mark, window: w, state: stateOn(r, day, now),
        steps: steps.map(function (s) { return { id: s.id, text: s.text, mins: s.mins || 0, optional: !!s.optional, minimum: !!s.minimum, done: !!(e && e.steps && e.steps[s.id]) }; }),
        left: steps.filter(function (s) { return !s.optional && !(e && e.steps && e.steps[s.id]); }).length,
        n: v.n, of: v.of };
    });
  }
  /* last night's evening routines still open for late ticks and the steps
     to check this morning (decision F) */
  function lastNight(now) {
    var day = addDays(routineDay(now), -1), out = [];
    all().filter(function (r) { return isEvening(r) && canTick(r, day, now); }).forEach(function (r) {
      var e = entry(r.id, day);
      if (!e && !scheduledOn(r, day)) return;
      var steps = stepsFor(r, e);
      var ticked = (e && e.steps) || {}, no = (e && e.no) || {};
      out.push({ id: r.id, name: r.name, day: day, state: stateOn(r, day, now),
        done: steps.filter(function (s) { return ticked[s.id] && !s.checkMorning; }).map(function (s) { return { id: s.id, text: s.text }; }),
        left: steps.filter(function (s) { return !ticked[s.id] && !s.checkMorning && !s.optional; }).map(function (s) { return { id: s.id, text: s.text }; }),
        check: steps.filter(function (s) { return s.checkMorning && !ticked[s.id] && !no[s.id]; }).map(function (s) { return { id: s.id, text: s.text }; }) });
    });
    return out;
  }

  /* ---------------- notifications (open app, closed app) ---------------- */
  function at(day, hm) { var p = day.split("-"), h = hm.split(":"); return new Date(+p[0], +p[1] - 1, +p[2], +h[0], +h[1]).getTime(); }
  function notice(r, day) {
    var w = windowOn(r, day);
    var steps = r.steps.filter(function (s) { return !s.optional && !s.checkMorning; });
    return { id: "routine:" + r.id + ":" + day, kind: "routine", title: r.name,
      body: steps.length + (steps.length === 1 ? " step" : " steps") + (w ? " · until " + w.to : ""), view: "routines", arg: { routine: r.id } };
  }
  /* a routine whose review opens within 15 minutes of its window lets the
     review bring it (§4.3) */
  function reviewNear(r, day) {
    if (!r.anchor || r.anchor.indexOf("review:") !== 0 || !KOS.dayReview || !KOS.dayReview.slotTime) return false;
    var w = windowOn(r, day), t = KOS.dayReview.slotTime(r.anchor.slice(7), day);
    return !!(w && t && Math.abs(at(day, w.from) - at(day, t)) <= 15 * 60000);
  }
  function forecast(from, to) {
    if (!enabled) return [];
    var out = [];
    for (var d = routineDay(from); at(d, "00:00") < to + 864e5; d = addDays(d, 1)) {
      all().forEach(function (r) {
        if (!r.remind || !scheduledOn(r, d) || reviewNear(r, d)) return;
        if (KOS.dayReview && KOS.dayReview.easy && KOS.dayReview.easy(d)) return;   // Easy week: no routine reminders
        var w = windowOn(r, d);
        if (!w) return;
        var when = at(d, w.from);
        if (when < from || when >= to) return;
        var v = verdict(r, entry(r.id, d)), e = entry(r.id, d);
        if (v.done || v.min || (e && e.rest)) return;
        out.push(Object.assign(notice(r, d), { at: when }));
      });
    }
    return out;
  }
  function checkAlerts(now) {
    if (!enabled || !KOS.notify || !KOS.notify.push) return;
    now = now || Date.now();
    forecast(now - 10 * 60000, now + 1).forEach(function (n) { KOS.notify.push(n); });
  }

  /* ---------------- compaction ---------------- */
  function compact(now) {
    var s = peek();
    if (!s || !s.log) return 0;
    var cut = addDays(routineDay(now), -COMPACT_DAYS), n = 0;
    Object.keys(s.log).forEach(function (k) {
      var e = s.log[k], day = k.split("|")[1];
      if (!e || e.compact || day >= cut) return;
      var r = get(k.split("|")[0]), v = verdict(r, e);
      var c = { compact: 1, n: v.n, of: v.of, paid: !!e.paid };
      if (v.done) c.done = e.done || 1;
      if (v.min) c.min = true;
      if (e.rest) c.rest = true;
      s.log[k] = c; n++;
    });
    if (n) store.save();
    return n;
  }

  /* ---------------- moving Habits in (plan §5) ---------------- */
  function migrate() {
    var t = store.state.todo, hs = t && Array.isArray(t.habits) ? t.habits : [];
    if (!hs.length) return 0;
    var s = R(), n = 0;
    hs.forEach(function (h, i) {
      if (!h || h.id == null) return;
      var id = "h:" + h.id;
      if (s.items.some(function (r) { return r.id === id || r.legacyHabit === String(h.id); })) return;
      var created = h.created ? new Date(h.created + "T12:00:00").getTime() : Date.now();
      var rec = normalise({ id: id, name: h.text, kind: "habit", steps: [{ id: "s1", text: h.text }], days: [],
        legacyHabit: h.id, createdAt: created, order: 100 + i });
      s.items.push(rec);
      Object.keys(h.days || {}).forEach(function (d) {
        if (!h.days[d]) return;
        var k = key(id, d);
        if (!s.log[k]) s.log[k] = { steps: { s1: 1 }, done: 1, snap: [["s1", h.text, 0, 0, 0]], paid: true, legacy: true };
      });
      n++;
    });
    if (!s.migratedAt) s.migratedAt = Date.now();
    t.habitsMovedTo = "routines";
    store.save();
    return n;
  }
  function migrated() { var s = peek(); return !!(s && s.migratedAt); }

  /* the habits as every older reader knows them ({id, text, days, created}):
     from routines once moved, else the habits as they are */
  function habitsView() {
    if (!migrated()) return ((store.state.todo && store.state.todo.habits) || []).slice();
    return all().filter(function (r) { return r.kind === "habit" || r.legacyHabit; }).map(function (r) {
      var days = {};
      loggedDays(r.id).forEach(function (d) { if (kept(stateOn(r, d))) days[d] = true; });
      var legacy = r.legacyHabit != null ? (/^\d+$/.test(r.legacyHabit) ? +r.legacyHabit : r.legacyHabit) : null;
      return { id: legacy != null ? legacy : r.id, routine: r.id, text: r.name, days: days, created: isoOf(new Date(r.createdAt || 0)) };
    });
  }
  /* a goal or tool names a habit by its old id or a routine by its own */
  function resolve(ref) {
    if (ref == null) return null;
    ref = String(ref);
    return get(ref) || get("h:" + ref) || all({ archived: true }).filter(function (r) { return r.legacyHabit === ref; })[0] || null;
  }

  /* ---------------- Goals (plan §10.6; registered when routines are on) ---------------- */
  function registerGoals() {
    var G = KOS.goals;
    if (!G || !G.register || G.typeDef("routine-days").id === "routine-days") return;
    function named(g) { return resolve((g.params || {}).routine || (g.params || {}).habit); }
    G.register({ id: "routine-days", domain: "productivity", label: "Keep a routine on N days", icon: "習", unit: "days",
      repeat: true,
      measure: function (g, ctx, cb) {
        var r = named(g);
        if (!r) { cb({ current: null, meta: (g.params || {}).routine ? "The linked routine was removed" : "No routine linked" }); return; }
        cb({ current: summary(r.id, ctx.from, ctx.to).kept, unit: "days", meta: r.name });
      } });
    G.register({ id: "routine-streak", domain: "productivity", label: "A routine's streak", icon: "続", unit: "days",
      measure: function (g, ctx, cb) {
        var r = named(g);
        if (!r) { cb({ current: null, meta: (g.params || {}).routine ? "The linked routine was removed" : "No routine linked" }); return; }
        cb({ current: streak(r.id), unit: "days", meta: r.name });
      } });
  }

  /* ---------------- the Assistant's tools (plan §10.8; registered when on) ---------------- */
  function registerTools() {
    var T = KOS.ai && KOS.ai.tools;
    if (!T || !T.define) return;
    function fail(m) { return new Error(m); }
    function brief(r, day) {
      var e = entry(r.id, day), v = verdict(r, e);
      return { id: r.id, name: r.name, kind: r.kind, days: r.days, window: windowOn(r, day) || r.window,
        state: stateOn(r, day), streak: r.days === null ? undefined : streak(r.id),
        steps: stepsFor(r, e).map(function (st) { return { id: st.id, text: st.text, mins: st.mins || 0, optional: !!st.optional || undefined,
          done: !!(e && e.steps && e.steps[st.id]) }; }), kept: v.done || v.min };
    }
    T.define("routines_list", {
      desc: "Routines and habits (a habit is a one-step routine): today's state, steps ticked, schedule and streak. Templates on request.",
      category: "planner", tier: "read", read: true,
      params: { templates: { type: "boolean", desc: "also list the templates a routine can be made from" } },
      run: function (args, cb) {
        var day = routineDay();
        var out = { day: day, routines: all().map(function (r) { return brief(r, day); }) };
        if (args.templates) out.templates = templates().map(function (t) { return { id: t.id, name: t.name, steps: t.steps.length }; });
        cb(null, out);
      } });
    T.define("routine_add", {
      desc: "Make a routine from a template id or from steps. days: 0 = Sunday … 6; omitted = every day.",
      category: "planner", tier: "reversible", read: false,
      params: {
        template: { type: "string", maxLen: 30 },
        name: { type: "string", maxLen: 80 },
        steps: { type: "array", maxLen: 40, items: { type: "string", maxLen: 160 } },
        days: { type: "array", maxLen: 7, items: { type: "integer", min: 0, max: 6 } },
        from: { type: "string", maxLen: 5, desc: "window start HH:MM" },
        to: { type: "string", maxLen: 5, desc: "window end HH:MM" }
      },
      run: function (args, cb) {
        var over = {};
        if (args.name) over.name = args.name;
        if (args.days) over.days = args.days;
        if (args.from && args.to) over.window = { from: args.from, to: args.to };
        var r = args.template ? fromTemplate(args.template, over)
          : (args.steps && args.steps.length ? add(Object.assign({ steps: args.steps.map(function (t) { return { text: t }; }) }, over)) : null);
        if (!r) { cb(fail(args.template ? "No template “" + args.template + "”." : "Give a template or at least one step.")); return; }
        cb(null, brief(r, routineDay()), { label: "undo: remove the routine", run: function (ucb) { remove(r.id); ucb(null); } });
      } });
    T.define("routine_tick_step", {
      desc: "Tick (or untick) one step of a routine for today; a habit has one step. Last night's evening routine can be ticked until the morning review closes or noon (day: \"last-night\").",
      category: "planner", tier: "reversible", read: false,
      params: {
        id: { type: "string", required: true, maxLen: 40 },
        step: { type: "string", maxLen: 40, desc: "the step id; omitted = the first step" },
        done: { type: "boolean", required: true },
        day: { type: "string", enum: ["today", "last-night"] }
      },
      run: function (args, cb) {
        var r = resolve(args.id);
        if (!r) { cb(fail("No routine “" + args.id + "”.")); return; }
        var stepId = args.step || (r.steps[0] && r.steps[0].id);
        var day = args.day === "last-night" ? addDays(routineDay(), -1) : routineDay();
        var res = tick(r.id, stepId, args.done, { day: day });
        if (!res.ok) { cb(fail(res.why)); return; }
        cb(null, Object.assign(brief(r, day), { award: res.award || undefined }),
          { label: "undo the tick", run: function (ucb) { tick(r.id, stepId, !args.done, { day: day }); ucb(null); } });
      } });
    T.define("routine_rest_day", {
      desc: "Plan (or cancel) a rest day for a routine today: it neither breaks nor adds to the streak; one in any seven days.",
      category: "planner", tier: "reversible", read: false,
      params: { id: { type: "string", required: true, maxLen: 40 }, rest: { type: "boolean", required: true } },
      run: function (args, cb) {
        var r = resolve(args.id);
        if (!r) { cb(fail("No routine “" + args.id + "”.")); return; }
        var res = setRest(r.id, args.rest);
        if (!res.ok) { cb(fail(res.why)); return; }
        cb(null, brief(r, routineDay()), { label: "undo the rest day", run: function (ucb) { setRest(r.id, !args.rest); ucb(null); } });
      } });
  }

  /* ---------------- boot ---------------- */
  function boot() {
    if (!enabled) return;
    migrate();
    compact();
  }
  /* the notification kind joins the bell, the feed and its filters only
     once routines are on (until then the filters would show a switch for
     nothing) */
  function enable(on) {
    enabled = on !== false;
    if (enabled) { registerGoals(); registerTools(); }
    if (enabled && KOS.notify && KOS.notify.KINDS && !KOS.notify.KINDS.routine) {
      KOS.notify.KINDS.routine = { label: "Routines", glyph: "習", section: "productivity", view: "routines" };
    }
  }
  function isEnabled() { return enabled; }

  KOS.routines = {
    CAP: CAP, REST_EVERY: REST_EVERY, KINDS: KINDS, ANCHORS: ANCHORS, LATE_UNTIL: LATE_UNTIL,
    enable: enable, enabled: isEnabled, boot: boot,
    normalise: normalise, all: all, get: get, add: add, update: update, remove: remove, archive: archive,
    addHabit: addHabit, templates: templates, template: template, fromTemplate: fromTemplate,
    dayStart: dayStart, routineDay: routineDay, scheduledOn: scheduledOn, windowOn: windowOn,
    entry: entry, verdict: verdict, stateOn: stateOn, canTick: canTick,
    tick: tick, tickAll: tickAll, answerNo: answerNo, setMins: setMins, setRest: setRest, restAllowed: restAllowed,
    streak: streak, best: best, history: history, summary: summary, today: today, lastNight: lastNight,
    notice: notice, forecast: forecast, checkAlerts: checkAlerts, compact: compact,
    migrate: migrate, migrated: migrated, habitsView: habitsView, resolve: resolve
  };
})();
