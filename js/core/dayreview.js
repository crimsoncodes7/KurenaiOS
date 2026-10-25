/* Kurenai OS — core/review.js · KOS.dayReview
   The Daily Review (roadmap 5.10, docs/routines-plan.md §6–9, invariants
   144–146): three check-ins a day — Morning, Afternoon, Evening — each one
   question answered from what the app already knows (KOS.today).

   THE RECORD. state.dayReview (synced):
     settings  dayStart, slots {morning|afternoon|evening: {on, weekday,
               weekend}}, weekendDays, holidays ("auto"|"off"), words
               ("kurenai"|"template"), autoOpen, portrait, school {from, to}
     days      {"<routine day>": {morning {state, seenAt, doneAt, three
               [{kind, id}], first {kind, id, action}}, afternoon {…},
               evening {…, note, mood, energy, tomorrow {first}, triaged
               {"<kind>:<id>": choice}}, words {<slot>: {text, line, at}}}}
   kept 60 days. A review stores ONLY its own state (invariant 144): every
   change it makes to a reminder, an assignment, a plan row or an event is
   made by that record's owner, at the moment of the choice; it keeps
   refs, never copies.

   ONE ON SCREEN (invariant 145). due(now) is pure and offers at most one
   review: the latest enabled slot whose time has passed this routine day,
   unless it is done or skipped. Earlier slots not done fold into it; a
   passed slot is never offered; yesterday's evening is never offered the
   next morning (its open items become "Yesterday, quickly").

   THE WORDS (invariant 146). The template's, at once; Kurenai's (the
   default, decision D) replace them when they arrive — one request with
   payload(), which holds titles, times and counts and never a note, card
   text, an amount, mood, energy or chat. Any failure keeps the template.

   ZERO GOVERNOR TRAFFIC: nothing here pays. OFF until its overlay ships
   (enable(true) at the R3 release): no ticker, no notices.

   Reads (cfg, slotTime, slots, due, content, dayFacts, words, payload,
   forecast) write nothing.                                               */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;

  var SLOTS = ["morning", "afternoon", "evening"];
  var LABEL = { morning: "Morning review", afternoon: "Afternoon review", evening: "Evening review" };
  var DEFAULTS = {
    dayStart: "04:00",
    slots: {
      morning: { on: true, weekday: "07:00", weekend: "09:00" },
      afternoon: { on: true, weekday: "16:30", weekend: "15:00" },
      evening: { on: true, weekday: "22:00", weekend: "22:30" }
    },
    weekendDays: [0, 6],
    holidays: "auto",
    words: "kurenai",
    autoOpen: true,
    portrait: true,
    school: { from: "08:30", to: "15:30" }
  };
  var KEEP_DAYS = 60;
  var TIMEOUT_MS = 8000;
  var CHOICES = ["tomorrow", "week", "someday", "done", "leave"];
  var HM = /^([01]\d|2[0-3]):([0-5]\d)$/;
  var enabled = false, timer = null, writing = {};

  /* ---------------- helpers ---------------- */
  function safe(fn, d) { try { var v = fn(); return v == null ? d : v; } catch (e) { return d; } }
  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hmNow(now) { var d = new Date(now == null ? Date.now() : now); return pad(d.getHours()) + ":" + pad(d.getMinutes()); }
  function mins(hm) { var p = hm.split(":"); return +p[0] * 60 + +p[1]; }
  function addDays(d, n) { return KOS.srs.addDays(d, n); }
  function rday(now) { return KOS.routines.routineDay(now); }
  function dow(day) { var p = day.split("-"); return new Date(+p[0], +p[1] - 1, +p[2], 12).getDay(); }
  function at(day, hm) { var p = day.split("-"), h = hm.split(":"); return new Date(+p[0], +p[1] - 1, +p[2], +h[0], +h[1]).getTime(); }
  function plural(n, w, ws) { return n + " " + (n === 1 ? w : ws || w + "s"); }
  function hmText(m) { m = Math.round(m || 0); var h = Math.floor(m / 60), r = m % 60; return h ? h + " h" + (r ? " " + pad(r) : "") : r + " min"; }

  /* ---------------- settings ---------------- */
  function normalise(raw) {
    raw = raw && typeof raw === "object" ? raw : {};
    var out = clone(DEFAULTS);
    if (HM.test(raw.dayStart) && raw.dayStart <= "06:00") out.dayStart = raw.dayStart;
    SLOTS.forEach(function (s) {
      var r = raw.slots && raw.slots[s];
      if (!r) return;
      if (r.on === false) out.slots[s].on = false;
      if (HM.test(r.weekday)) out.slots[s].weekday = r.weekday;
      if (HM.test(r.weekend)) out.slots[s].weekend = r.weekend;
    });
    if (Array.isArray(raw.weekendDays)) out.weekendDays = raw.weekendDays.map(Number).filter(function (d, i, a) { return d >= 0 && d <= 6 && a.indexOf(d) === i; }).sort();
    if (raw.holidays === "off") out.holidays = "off";
    if (raw.words === "template") out.words = "template";
    if (raw.autoOpen === false) out.autoOpen = false;
    if (raw.portrait === false) out.portrait = false;
    if (raw.school && HM.test(raw.school.from) && HM.test(raw.school.to) && raw.school.from < raw.school.to) out.school = { from: raw.school.from, to: raw.school.to };
    return out;
  }
  function cfg() { return normalise(store.state.dayReview); }
  function data() {
    var s = store.state.dayReview;
    if (!s || typeof s !== "object") s = store.state.dayReview = { v: 1, days: {} };
    if (!s.days || typeof s.days !== "object" || Array.isArray(s.days)) s.days = {};
    return s;
  }
  /* setConfig(patch): only the settings, through the gate */
  function setConfig(patch) {
    var s = data(), next = normalise(Object.assign({}, cfg(), patch || {}, {
      slots: Object.assign({}, cfg().slots, (patch && patch.slots) || {})
    }));
    Object.keys(next).forEach(function (k) { s[k] = next[k]; });
    store.save();
    return next;
  }

  /* ---------------- the slots ---------------- */
  function weekendLike(day) {
    var c = cfg();
    if (c.weekendDays.indexOf(dow(day)) !== -1) return true;
    return c.holidays === "auto" && !!(KOS.today && KOS.today.isHoliday && safe(function () { return KOS.today.isHoliday(day); }, false));
  }
  function slotTime(slot, day) {
    var s = cfg().slots[slot];
    if (!s || !s.on) return null;
    return weekendLike(day || rday()) ? s.weekend : s.weekday;
  }
  /* minutes since the day started, so 00:30 sorts after 22:00 */
  function offset(hm) { return (mins(hm) - mins(cfg().dayStart) + 1440) % 1440; }
  function dayRec(day) {
    var s = store.state.dayReview;
    return s && s.days && s.days[day] ? s.days[day] : {};
  }
  function slotState(day, slot) { var r = dayRec(day)[slot]; return r && r.state || null; }
  function closed(st) { return st === "done" || st === "skipped"; }
  function slots(day, now) {
    return SLOTS.filter(function (s) { return slotTime(s, day); }).map(function (s) {
      return { slot: s, label: LABEL[s], time: slotTime(s, day), state: slotState(day, s) };
    });
  }

  /* ---------------- consolidation (invariant 145) ---------------- */
  /* due(now) → {slot, day, folded [slots], yesterday bool} | null */
  function due(now) {
    now = now == null ? Date.now() : now;
    var day = rday(now), t = offset(hmNow(now)), cur = null;
    slots(day, now).forEach(function (s) { if (offset(s.time) <= t) cur = s; });
    if (!cur || closed(cur.state)) return null;
    var folded = slots(day, now).filter(function (s) {
      return SLOTS.indexOf(s.slot) < SLOTS.indexOf(cur.slot) && !closed(s.state);
    }).map(function (s) { return s.slot; });
    var prev = addDays(day, -1);
    var yesterday = cur.slot === "morning" && !!slotTime("evening", prev) && !closed(slotState(prev, "evening"));
    return { slot: cur.slot, day: day, label: LABEL[cur.slot], time: cur.time, folded: folded, yesterday: yesterday };
  }

  /* ---------------- its own state (the writes) ---------------- */
  function slotWrite(day, slot) {
    var s = data(), d = s.days[day] = s.days[day] || {};
    return d[slot] = d[slot] || {};
  }
  function prune(now) {
    var s = data(), cut = addDays(rday(now), -KEEP_DAYS);
    Object.keys(s.days).forEach(function (k) { if (k < cut) delete s.days[k]; });
  }
  /* shown: the review's seen time, and the earlier slots fold into it */
  function markShown(slot, now) {
    now = now || Date.now();
    var d = due(now), day = d ? d.day : rday(now);
    var r = slotWrite(day, slot);
    if (!r.seenAt) r.seenAt = now;
    (d && d.slot === slot ? d.folded : []).forEach(function (f) { var fr = slotWrite(day, f); if (!closed(fr.state)) fr.state = "folded"; });
    prune(now);
    store.save();
  }
  /* finish(slot, "done"|"skipped") — a skip never penalises (nothing reads it as one) */
  function finish(slot, how, now) {
    now = now || Date.now();
    var day = rday(now), r = slotWrite(day, slot);
    r.state = how === "skipped" ? "skipped" : "done";
    if (r.state === "done") r.doneAt = now;
    store.save();
    return r.state;
  }
  function setThree(refs, now) {
    var r = slotWrite(rday(now), "morning");
    r.three = (refs || []).filter(validRef).slice(0, 3).map(function (x) { return { kind: x.kind, id: x.id }; });
    store.save();
    return r.three;
  }
  /* the first task: set in the morning for today, in the evening for tomorrow */
  function setFirst(ref, action, now, forTomorrow) {
    var day = rday(now);
    var first = ref && validRef(ref) ? { kind: ref.kind, id: ref.id, action: String(action || "").trim().slice(0, 160) } : null;
    if (forTomorrow) { var e = slotWrite(day, "evening"); e.tomorrow = { first: first }; }
    else slotWrite(day, "morning").first = first;
    store.save();
    return first;
  }
  function firstFor(day) {
    var m = dayRec(day).morning, e = dayRec(addDays(day, -1)).evening;
    return (m && m.first) || (e && e.tomorrow && e.tomorrow.first) || null;
  }
  /* the wind-down: a private note and two optional taps (decision G) */
  function setWindDown(v, now) {
    var r = slotWrite(rday(now), "evening");
    if (v.note !== undefined) { var n = String(v.note || "").trim().slice(0, 280); if (n) r.note = n; else delete r.note; }
    ["mood", "energy"].forEach(function (k) {
      if (v[k] === undefined) return;
      var x = Math.round(+v[k]);
      if (x >= 1 && x <= 5) r[k] = x; else delete r[k];
    });
    store.save();
    return { note: r.note || "", mood: r.mood || null, energy: r.energy || null };
  }

  /* ---------------- refs: what a pick points at ---------------- */
  var KINDS = ["reminder", "assignment", "plan", "event", "assessment", "routine", "topic"];
  function validRef(r) { return !!r && KINDS.indexOf(r.kind) !== -1 && r.id != null && r.id !== ""; }
  /* resolve(ref) → {title, done, subject, due} | null (a read) */
  function resolve(ref) {
    if (!validRef(ref)) return null;
    switch (ref.kind) {
      case "reminder": var m = safe(function () { return KOS.reminders.get(ref.id); }, null);
        return m ? { title: m.title, done: !!m.done, due: m.due || null } : null;
      case "assignment": var a = safe(function () { return KOS.assignments.get(ref.id); }, null);
        return a ? { title: a.title, done: !KOS.assignments.isOpen(a), due: a.due || null, subject: a.subject || null } : null;
      case "plan": var p = safe(function () { return KOS.pacing.entryById(ref.id); }, null);
        return p ? { title: p.title, done: !!p.done, subject: p.subject || null } : null;
      case "event": var ev = safe(function () { return KOS.calendar.getEvent(ref.id); }, null);
        return ev ? { title: ev.title, done: false, due: ev.date || null, subject: ev.subject || null } : null;
      case "assessment": var x = safe(function () { return KOS.exams.get(ref.id); }, null);
        return x ? { title: x.title, done: false, due: x.date || null, subject: x.subject || null } : null;
      case "routine": var rt = KOS.routines.get(ref.id);
        return rt ? { title: rt.name, done: false } : null;
      case "topic": var i = String(ref.id).indexOf(":");
        return i > 0 ? { title: safe(function () { return KOS.spec.label(ref.id); }, ref.id), done: false, subject: String(ref.id).slice(0, i) } : null;
    }
    return null;
  }
  function picks(list) {
    return (list || []).map(function (r) { var x = resolve(r); return x ? Object.assign({ ref: { kind: r.kind, id: r.id } }, x, r.action ? { action: r.action } : {}) : null; }).filter(Boolean);
  }

  /* ---------------- triage, through the owners (invariant 144) ---------------- */
  /* triage(ref, choice, {day: a date for "week", now}) → {ok, why, undo()} */
  function triage(ref, choice, opts) {
    opts = opts || {};
    var now = opts.now || Date.now(), day = rday(now), tomorrow = addDays(day, 1);
    if (CHOICES.indexOf(choice) === -1) return { ok: false, why: "Unknown choice." };
    if (!validRef(ref)) return { ok: false, why: "Nothing to triage." };
    var when = choice === "tomorrow" ? tomorrow : choice === "week" ? opts.day : null;
    if (choice === "week" && !(typeof when === "string" && when > day)) return { ok: false, why: "Pick a day later this week." };
    var undo = null, res = { ok: true };
    if (choice !== "leave") {
      if (ref.kind === "reminder") {
        var m = KOS.reminders.get(ref.id);
        if (!m) return { ok: false, why: "That reminder has gone." };
        var prev = { due: m.due || null, dueTime: m.dueTime || null };
        if (choice === "done") { KOS.reminders.complete(ref.id, true); undo = function () { KOS.reminders.complete(ref.id, false); }; }
        else { KOS.reminders.update(ref.id, { due: when, dueTime: when ? m.dueTime || null : null }); undo = function () { KOS.reminders.update(ref.id, prev); }; }
      } else if (ref.kind === "assignment") {
        var a = KOS.assignments.get(ref.id);
        if (!a) return { ok: false, why: "That assignment has gone." };
        var wasStatus = a.status, wasWork = (a.workOn || []).slice();
        if (choice === "done") { KOS.assignments.setStatus(ref.id, "complete"); undo = function () { KOS.assignments.setStatus(ref.id, wasStatus); }; }
        else {
          /* its deadline is not yours to move: a work-on day is (plan §10.1) */
          var work = wasWork.filter(function (d) { return d > day; });
          if (when) work.push(when);
          KOS.assignments.update(ref.id, { workOn: work });
          undo = function () { KOS.assignments.update(ref.id, { workOn: wasWork }); };
        }
      } else if (ref.kind === "plan") {
        var e = KOS.pacing.entryById(ref.id);
        if (!e) return { ok: false, why: "That plan row has gone." };
        if (choice === "done") { KOS.pacing.setDone(ref.id, true); undo = function () { KOS.pacing.setDone(ref.id, false); }; }
        /* a plan row belongs to its week: moving it is the plan's own "→ here" */
        else res.note = "Plan rows stay in their week.";
      } else if (ref.kind === "event") {
        var ev = KOS.calendar.getEvent(ref.id);
        if (!ev || ev.recur && ev.recur !== "none") return { ok: false, why: "Only a one-off event can move." };
        var was = ev.date;
        if (when) { KOS.calendar.updateEvent(ref.id, { date: when }); undo = function () { KOS.calendar.updateEvent(ref.id, { date: was }); }; }
        else if (choice === "someday") return { ok: false, why: "An event needs a date." };
      } else return { ok: false, why: "That can't be triaged here." };
    }
    var ev2 = slotWrite(day, "evening");
    ev2.triaged = ev2.triaged || {};
    var key = ref.kind + ":" + ref.id, before = ev2.triaged[key];
    ev2.triaged[key] = choice;
    store.save();
    res.undo = function () {
      if (undo) undo();
      var r = slotWrite(day, "evening");
      if (before) r.triaged[key] = before; else if (r.triaged) delete r.triaged[key];
      store.save();
    };
    return res;
  }

  /* ---------------- the day in numbers (the evening's card) ---------------- */
  /* Reports' rules on one day of the ledger: focus by stretch, cards from
     metrics.cards, a zero is absent (invariant 77), a comparison only with
     a week behind it */
  function dayFacts(day) {
    var L = (store.state.sessions || []).filter(function (e) { return e.date === day; });
    var f = {}, t = safe(function () { return KOS.today.build(day).focus; }, { mins: 0, sessions: 0, bySubject: {} });
    if (t.mins) { f.focusMins = t.mins; f.sessions = t.sessions; f.bySubject = t.bySubject; }
    var cards = L.filter(function (e) { return e.type === "flashcards" || e.type === "due-review"; })
      .reduce(function (n, e) { return n + ((e.metrics && e.metrics.cards) || 0); }, 0);
    if (cards) f.cards = cards;
    var ticks = L.filter(function (e) { return e.type === "todo" && !(e.metrics && e.metrics.routine); }).length;
    if (ticks) f.ticks = ticks;
    var lessons = L.filter(function (e) { return (e.type === "code" || e.type === "ja") && e.metrics && (e.metrics.lesson || e.metrics.kind === "lesson"); }).length;
    if (lessons) f.lessons = lessons;
    var kept = 0, sched = 0;
    if (KOS.routines.enabled()) KOS.routines.all().forEach(function (r) {
      var st = KOS.routines.stateOn(r, day);
      if (st === "off" || st === "rest") return;
      sched++;
      if (st === "done" || st === "min") kept++;
    });
    if (kept) { f.routinesKept = kept; f.routinesOf = sched; }
    /* the week before, for one comparison (only with something to compare) */
    var week = 0, active = 0;
    for (var i = 1; i <= 7; i++) {
      var d = addDays(day, -i), m = (store.state.sessions || []).filter(function (e) { return e.date === d && e.type === "focus"; })
        .reduce(function (n, e) { return n + (e.dur || 0); }, 0);
      if (m) { active++; week += m; }
    }
    if (active >= 3 && f.focusMins) f.weekAvgMins = Math.round(week / 60 / active);
    return f;
  }

  /* ---------------- each review's steps (a read) ---------------- */
  /* content(slot, {now, goals}) → {slot, day, label, folded, steps [{id, …}]}
     A step with nothing to show is left out (invariant 77). */
  function content(slot, opts) {
    opts = opts || {};
    var now = opts.now || Date.now(), d = due(now);
    var day = rday(now), rec = dayRec(day), nowHm = hmNow(now);
    var folded = d && d.slot === slot ? d.folded : [];
    var T = KOS.today.build(day, { now: now, goals: opts.goals });
    var steps = [];
    function open(x) { return !x.done; }
    var three = picks(rec.morning && rec.morning.three);
    var first = picks(firstFor(day) ? [firstFor(day)] : [])[0] || null;
    function routinesFor(anchor) {
      return KOS.routines.enabled() ? T.routines.filter(function (r) {
        var full = KOS.routines.get(r.id);
        return full && full.anchor === anchor && r.state !== "done" && r.state !== "min" && r.state !== "rest" &&
          !(r.window && offset(r.window.to) <= offset(nowHm));
      }) : [];
    }

    if (slot === "morning") {
      var ln = KOS.routines.enabled() ? KOS.routines.lastNight(now) : [];
      var yesterday = [];
      if (d && d.yesterday) {
        var prevRec = dayRec(addDays(day, -1));
        yesterday = picks(prevRec.morning && prevRec.morning.three).filter(open);
      }
      var lnShow = ln.filter(function (r) { return r.done.length || r.left.length || r.check.length; });
      if (first || lnShow.length || yesterday.length) steps.push({ id: "lastNight", first: first, routines: lnShow, yesterday: yesterday });
      var mr = routinesFor("review:morning");
      if (mr.length) steps.push({ id: "routine", routines: mr });
      if (T.timeline.length || T.due.length || T.warnings.length || T.goals.length)
        steps.push({ id: "today", timeline: T.timeline, due: T.due, warnings: T.warnings, goals: T.goals, isSchoolDay: T.isSchoolDay });
      var sugg = suggestions(T, three);
      if (sugg.length || three.length) steps.push({ id: "three", picked: three, suggestions: sugg });
      steps.push({ id: "start", first: first || three.filter(open)[0] || null, next: T.next });
    } else if (slot === "afternoon") {
      var morningRoutine = T.routines.filter(function (r) { var f = KOS.routines.get(r.id); return f && f.anchor === "review:morning"; })[0] || null;
      steps.push({ id: "sofar", focus: T.focus, three: three, ticks: dayFacts(day).ticks || 0, morningRoutine: morningRoutine });
      var rest = T.timeline.filter(function (x) { return x.start && offset(x.start) >= offset(nowHm) && x.kind !== "review"; });
      var still = T.due.filter(function (x) { return x.overdue || !x.due || x.due <= addDays(day, 1); });
      var foldedMorning = folded.indexOf("morning") !== -1;
      if (rest.length || still.length || foldedMorning)
        steps.push({ id: "still", timeline: rest, due: still, folded: foldedMorning, three: foldedMorning ? suggestions(T, three) : null });
      if (T.free.length) steps.push({ id: "time", free: T.free, place: T.due.filter(function (x) { return x.kind === "assignment" || x.kind === "plan"; }).slice(0, 6) });
      steps.push({ id: "next", first: three.filter(open)[0] || first, next: T.next });
    } else if (slot === "evening") {
      var facts = dayFacts(day);
      if (Object.keys(facts).length) steps.push({ id: "numbers", facts: facts });
      var unfinished = unfinishedOf(T, three, day, now);
      if (unfinished.length) steps.push({ id: "unfinished", items: unfinished });
      var tomorrow = addDays(day, 1), TT = KOS.today.build(tomorrow, { now: now });
      var ev = rec.evening || {};
      steps.push({ id: "tomorrow", date: tomorrow, timeline: TT.timeline, isSchoolDay: TT.isSchoolDay,
        due: TT.due.filter(function (x) { return x.due && x.due <= addDays(tomorrow, 2); }), warnings: TT.warnings,
        first: picks(ev.tomorrow && ev.tomorrow.first ? [ev.tomorrow.first] : [])[0] || null,
        suggestions: suggestions(TT, []) });
      var pr = routinesFor("review:evening");
      if (pr.length) steps.push({ id: "prep", routines: pr });
      steps.push({ id: "winddown", note: ev.note || "", mood: ev.mood || null, energy: ev.energy || null });
    }
    return { slot: slot, day: day, label: LABEL[slot], folded: folded, steps: steps };
  }
  /* suggestions for today's three: the ladder's next, then what is due */
  function suggestions(T, picked) {
    var have = {}, out = [];
    (picked || []).forEach(function (p) { have[p.ref.kind + ":" + p.ref.id] = true; });
    function push(ref, title, why) {
      var k = ref.kind + ":" + ref.id;
      if (have[k] || out.length >= 6) return;
      have[k] = true;
      out.push({ ref: ref, title: title, why: why || "" });
    }
    var n = T.next;
    if (n && n.assignmentId != null) push({ kind: "assignment", id: n.assignmentId }, n.title, n.kicker);
    else if (n && n.subject && n.ref) push({ kind: "topic", id: n.subject + ":" + n.ref }, n.title, n.kicker);
    T.due.forEach(function (x) { if (x.ref) push(x.ref, x.title, x.overdue ? "overdue" : x.why || ""); });
    return out;
  }
  function unfinishedOf(T, three, day, now) {
    var out = [], seen = {};
    function push(ref, title, why) {
      var k = ref.kind + ":" + ref.id;
      if (seen[k]) return;
      seen[k] = true;
      out.push({ ref: ref, title: title, why: why, choice: ((dayRec(day).evening || {}).triaged || {})[k] || null });
    }
    three.filter(function (x) { return !x.done; }).forEach(function (x) { push(x.ref, x.title, "three"); });
    T.due.forEach(function (x) {
      if ((x.kind === "reminder" && (x.overdue || x.due === day)) || (x.kind === "assignment" && x.due && x.due <= addDays(day, 1)))
        push(x.ref, x.title, x.overdue ? "overdue" : "due");
    });
    /* a study block that has ended with no Focus on it: not ticked off,
       and no Focus session in its subject that day */
    var ticked = (store.state.todo && store.state.todo.autoChecked) || {};
    T.timeline.filter(function (x) { return x.kind === "study" && x.end && x.end <= hmNow(now) && x.ref.kind === "event"; }).forEach(function (x) {
      var ran = ticked[day + "|blk" + x.ref.id] || (store.state.sessions || []).some(function (e) {
        return e.date === day && e.type === "focus" && (!x.subject || e.subject === x.subject);
      });
      if (!ran) push(x.ref, x.title, "block");
    });
    return out;
  }

  /* ---------------- the words ---------------- */
  function firstLesson(tl) {
    var l = tl.filter(function (x) { return x.kind === "lesson" || (x.kind === "event" && x.start); })[0];
    return l ? l : null;
  }
  /* template(slot, c) → {line, text}: deterministic, no network */
  function template(slot, c) {
    var st = {};
    (c.steps || []).forEach(function (s) { st[s.id] = s; });
    var bits = [], line = "";
    if (slot === "morning") {
      var t = st.today || { timeline: [], due: [], warnings: [] };
      var lessons = t.timeline.filter(function (x) { return x.kind === "lesson"; }).length;
      var blocks = t.timeline.filter(function (x) { return x.kind === "study"; }).length;
      line = lessons ? plural(lessons, "lesson") + " today" : t.isSchoolDay === false ? "No lessons today" : "Good morning";
      if (lessons) bits.push(plural(lessons, "lesson") + " today" + (blocks ? " and " + plural(blocks, "study block") : "") + ".");
      else if (blocks) bits.push(plural(blocks, "study block") + " planned.");
      var late = t.due.filter(function (x) { return x.overdue; }).length;
      if (late) bits.push(plural(late, "thing is", "things are") + " overdue.");
      if (t.warnings.length) bits.push(t.warnings[0].title + ": " + t.warnings[0].body.toLowerCase() + ".");
      var f = st.start && (st.start.first || st.start.next);
      if (f) bits.push("A good first task: " + (f.title || "") + ".");
    } else if (slot === "afternoon") {
      var s = st.sofar || { focus: { mins: 0 }, three: [] };
      line = s.focus.mins ? hmText(s.focus.mins) + " of Focus so far" : "The afternoon";
      if (s.focus.mins) {
        var top = Object.keys(s.focus.bySubject || {}).sort(function (a, b) { return s.focus.bySubject[b] - s.focus.bySubject[a]; })[0];
        var name = top && top !== "other" ? safe(function () { return KOS.subjects.meta(top).short; }, null) : null;
        bits.push(hmText(s.focus.mins) + " of Focus so far" + (name ? ", mostly " + name : "") + ".");
      }
      if (s.three.length) bits.push(s.three.filter(function (x) { return x.done; }).length + " of your " + plural(s.three.length, "pick").replace(/^\d+ /, "") + " done.");
      var free = (st.time && st.time.free || []).reduce(function (n, b) { return n + b.mins; }, 0);
      if (free) bits.push(hmText(free) + " free before the evening.");
      if (!bits.length) bits.push("Here's what's left of today.");
    } else {
      var nf = (st.numbers && st.numbers.facts) || {};
      line = nf.focusMins ? hmText(nf.focusMins) + " of Focus today" : "The evening";
      if (nf.focusMins) bits.push(hmText(nf.focusMins) + " of Focus today across " + plural(nf.sessions, "session") +
        (nf.weekAvgMins ? (nf.focusMins > nf.weekAvgMins ? ", more than your usual " : nf.focusMins < nf.weekAvgMins ? ", under your usual " : ", your usual ") + hmText(nf.weekAvgMins) : "") + ".");
      if (nf.cards) bits.push(plural(nf.cards, "card") + " reviewed.");
      var un = st.unfinished ? st.unfinished.items.length : 0;
      if (un) bits.push(plural(un, "thing is", "things are") + " still open; nothing has to move.");
      var tm = st.tomorrow, fl = tm && firstLesson(tm.timeline);
      if (fl) bits.push("Tomorrow starts with " + (fl.start ? fl.title + " at " + fl.start : fl.title) + ".");
      if (!bits.length) bits.push("A quiet day. Set tomorrow up and wind down.");
    }
    return { line: line, text: bits.join(" ") };
  }
  /* payload(slot, c): what ✦ Kurenai is sent — titles, times and counts;
     never a note, card text, an amount, mood, energy or chat (invariant 146) */
  function payload(slot, c) {
    var st = {};
    (c.steps || []).forEach(function (s) { st[s.id] = s; });
    function item(x) { return { title: String(x.title || "").slice(0, 120), kind: x.kind || (x.ref && x.ref.kind) || undefined, due: x.due || undefined, overdue: x.overdue || undefined, done: x.done || undefined }; }
    var p = { review: slot, day: c.day, weekday: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dow(c.day)] };
    if (st.today) {
      p.timeline = st.today.timeline.slice(0, 16).map(function (x) { return { kind: x.kind, start: x.start || undefined, title: String(x.title || "").slice(0, 80) }; });
      p.due = st.today.due.slice(0, 12).map(item);
      p.warnings = st.today.warnings.slice(0, 6).map(function (w) { return w.title + ": " + w.body; });
      p.schoolDay = !!st.today.isSchoolDay;
    }
    if (st.lastNight) p.lastNight = { firstTask: st.lastNight.first ? st.lastNight.first.title : undefined,
      routineStepsDone: st.lastNight.routines.reduce(function (n, r) { return n + r.done.length; }, 0) || undefined };
    if (st.three) p.three = st.three.picked.map(item);
    if (st.start && (st.start.first || st.start.next)) p.firstTask = (st.start.first || st.start.next).title;
    if (st.sofar) p.sofar = { focusMins: st.sofar.focus.mins || undefined, three: st.sofar.three.map(item), ticks: st.sofar.ticks || undefined };
    if (st.still) p.still = { due: st.still.due.slice(0, 10).map(item), next: st.still.timeline.slice(0, 8).map(function (x) { return { start: x.start, title: x.title }; }) };
    if (st.time) p.freeMins = st.time.free.reduce(function (n, b) { return n + b.mins; }, 0);
    if (st.numbers) p.numbers = st.numbers.facts && { focusMins: st.numbers.facts.focusMins, sessions: st.numbers.facts.sessions,
      cards: st.numbers.facts.cards, ticks: st.numbers.facts.ticks, routinesKept: st.numbers.facts.routinesKept, weekAvgMins: st.numbers.facts.weekAvgMins };
    if (st.unfinished) p.unfinished = st.unfinished.items.slice(0, 10).map(item);
    if (st.tomorrow) p.tomorrow = { schoolDay: !!st.tomorrow.isSchoolDay,
      timeline: st.tomorrow.timeline.slice(0, 10).map(function (x) { return { kind: x.kind, start: x.start || undefined, title: String(x.title || "").slice(0, 80) }; }),
      due: st.tomorrow.due.slice(0, 8).map(item) };
    return JSON.parse(JSON.stringify(p));
  }
  var SYSTEM = "You are Kurenai, a calm, warm study companion inside KurenaiOS. You write the opening words of one of the user's three daily check-ins (morning, afternoon or evening) from the facts given. " +
    "Return JSON: {\"line\": a greeting of at most 8 words, \"text\": two or three short sentences}. British English. Describe and suggest; never decide, never guilt, never invent a fact, a time or a title that is not in the facts. No lists, no emoji.";
  var SCHEMA = { type: "object", properties: { line: { type: "string" }, text: { type: "string" } }, required: ["line", "text"], additionalProperties: false };
  function clean(s) { return typeof s === "string" ? s.replace(/\s+/g, " ").trim() : ""; }
  /* write(slot, c, cb): one request; cb(err, {line, text}) */
  function write(slot, c, cb) {
    if (!KOS.ai || !KOS.ai.chat) { cb({ kind: "config", message: "The Assistant is not available." }); return null; }
    var done = false, req = null;
    var timer2 = setTimeout(function () {
      if (done) return;
      done = true;
      if (req && KOS.ai.cancel) KOS.ai.cancel(req);
      cb({ kind: "timeout", message: "Kurenai took too long." });
    }, TIMEOUT_MS);
    req = KOS.ai.chat("generation", {
      system: SYSTEM,
      messages: [{ role: "user", content: "The " + slot + " check-in's facts:\n" + JSON.stringify(payload(slot, c)) }],
      structured: { schema: SCHEMA }, temperature: 0.7, maxTokens: 300
    }, function (err, res) {
      if (done) return;
      done = true;
      clearTimeout(timer2);
      if (err) { cb(err); return; }
      var raw = null;
      try { raw = JSON.parse(res.text); } catch (e) { raw = null; }
      var l = raw && clean(raw.line), t = raw && clean(raw.text);
      if (!l || !t || l.length > 80 || t.length < 20 || t.length > 600) { cb({ kind: "invalid", message: "The reply was not usable words." }); return; }
      cb(null, { line: l, text: t });
    });
    return req;
  }
  /* words(slot, c) → {line, text, byKurenai}: hers when written, else the template */
  function words(slot, c) {
    var w = (dayRec(c.day).words || {})[slot];
    if (cfg().words === "kurenai" && w && w.text) return { line: w.line, text: w.text, byKurenai: true };
    var t = template(slot, c);
    return { line: t.line, text: t.text, byKurenai: false };
  }
  /* ensureWords(slot, {now}, cb): write and keep Kurenai's words for this
     review once (never twice), unless the setting is the template */
  function ensureWords(slot, opts, cb) {
    opts = opts || {};
    cb = cb || function () {};
    var now = opts.now || Date.now(), day = rday(now);
    if (cfg().words !== "kurenai") { cb(null, null); return; }
    var have = (dayRec(day).words || {})[slot];
    if (have && have.text) { cb(null, have); return; }
    var k = day + "|" + slot;
    if (writing[k]) { cb(null, null); return; }
    writing[k] = true;
    var c = content(slot, { now: now });
    write(slot, c, function (err, out) {
      delete writing[k];
      if (err) { cb(err, null); return; }
      var s = data(), d = s.days[day] = s.days[day] || {};
      d.words = d.words || {};
      d.words[slot] = { line: out.line, text: out.text, at: Date.now() };
      store.save();
      cb(null, d.words[slot]);
    });
  }

  /* ---------------- notices (open app) and forecast (closed app) ---------------- */
  function notice(slot, day, now) {
    var body = LABEL[slot];
    if (day === rday(now)) body = safe(function () { return words(slot, content(slot, { now: at(day, slotTime(slot, day)) })).text; }, body);
    return { id: "review:" + slot + ":" + day, kind: "review", title: LABEL[slot], body: String(body).slice(0, 300), view: "routines", arg: { review: slot } };
  }
  function forecast(from, to) {
    if (!enabled) return [];
    var out = [];
    for (var d = rday(from); at(d, "00:00") < to + 864e5; d = addDays(d, 1)) {
      SLOTS.forEach(function (s) {
        var t = slotTime(s, d);
        if (!t || closed(slotState(d, s))) return;
        var when = at(d, t);
        if (mins(t) < mins(cfg().dayStart)) when += 864e5;    // after midnight: still that day's

        if (when < from || when >= to) return;
        out.push(Object.assign(notice(s, d, from), { at: when }));
      });
    }
    return out;
  }
  function tick(now) {
    if (!enabled) return;
    now = now || Date.now();
    var d = due(now);
    if (d && KOS.notify && KOS.notify.push) KOS.notify.push(notice(d.slot, d.day, now));
    if (d && cfg().words === "kurenai") ensureWords(d.slot, { now: now });
    if (KOS.routines) KOS.routines.checkAlerts(now);
  }
  function start() {
    if (!enabled || timer) return;
    setTimeout(function () { tick(); }, 7000);
    timer = setInterval(tick, 30000);
  }
  function enable(on) {
    enabled = on !== false;
    if (enabled && KOS.notify && KOS.notify.KINDS && !KOS.notify.KINDS.review) {
      KOS.notify.KINDS.review = { label: "Daily Review", glyph: "審", section: "productivity", view: "routines" };
    }
  }

  KOS.dayReview = {
    SLOTS: SLOTS, LABEL: LABEL, DEFAULTS: DEFAULTS, CHOICES: CHOICES,
    enable: enable, enabled: function () { return enabled; }, start: start, tick: tick,
    normalise: normalise, cfg: cfg, setConfig: setConfig,
    slotTime: slotTime, slots: slots, due: due, day: dayRec,
    markShown: markShown, finish: finish, setThree: setThree, setFirst: setFirst, firstFor: firstFor, setWindDown: setWindDown,
    resolve: resolve, triage: triage, dayFacts: dayFacts, content: content,
    template: template, payload: payload, write: write, words: words, ensureWords: ensureWords,
    notice: notice, forecast: forecast
  };
})();
