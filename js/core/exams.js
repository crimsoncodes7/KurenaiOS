/* Kurenai OS — core/exams.js
   The Exams & Deadlines hub's record (roadmap 5.8, docs/exams-plan.md):
   ONE assessment record per exam, mock, test or deadline (invariant 120).

   An assessment is a classified event with a scope. The tier decides how
   much machinery it gets (plan §5):
     real_exam       a board paper you sit (AQA 7517 P1, Edexcel 9MA0 P3, F201)
     mock            a school mock; the Scope Builder decides what is in it
     topic_test      an end-of-topic or unit test
     retrieval_test  a class quiz or formula check
     deadline        an NEA milestone or coursework hand-in: no scope
                     readiness, but start-by dates and milestones

   THE SCOPE is stored as picked and resolved on read (invariant 121):
     scope = { include: ["sid:ref", …]   any level — a paper, a unit, a leaf
               exclude: ["sid:ref", …]   always wins
               pacing:  null | { upTo, frozen, seen } }
   leaves(a) = resolve(include) ∪ covered-in-Pacing − resolve(exclude).
   "Covered in Pacing so far" is a RULE (every leaf the plan covers in weeks
   ending on or before `upTo`, else the assessment's date) while the
   assessment is ahead; once its date has passed or its result is logged
   the rule FREEZES into `frozen` (a leaf list), so a past mock's scope
   never moves when Pacing is edited later (decision refinement 1).

   Storage: state.exams (synced) behind normalise(). Assessments are a
   keyed map by a random string id, so two devices fold per key and
   nothing is ever re-keyed (invariant 33a's lesson, as Money's records).
   Their checklist and milestones are id'd arrays (the merge keys nested
   record arrays on `id`, invariant 88). This file is data and pure reads;
   the pages are js/modules/exams.js. Zero Governor traffic (invariant
   129): an assessment pays nothing; an attempt logs its session in
   core/tracker.js exactly as it always has.                             */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;

  var TIERS = [
    { v: "real_exam", label: "Real exam", short: "Exam", level: "exam", leadDays: 7, goalMins: 120, weight: 1, base: 0.9, buffer: 14, maxWeeks: 20 },
    { v: "mock", label: "Mock", short: "Mock", level: "mock", leadDays: 5, goalMins: 120, weight: 0.8, base: 0.6, buffer: 7, maxWeeks: 8 },
    { v: "topic_test", label: "Topic test", short: "Topic test", level: "topic", leadDays: 3, goalMins: 60, weight: 0.5, base: 0.5, buffer: 3, maxWeeks: 3 },
    { v: "retrieval_test", label: "Retrieval test", short: "Retrieval", level: "retrieval", leadDays: 1, goalMins: 30, weight: 0.2, base: 0.15, buffer: 1, maxWeeks: 1 },
    { v: "deadline", label: "Deadline", short: "Deadline", level: null, leadDays: 7, goalMins: 60, weight: 0.6, base: 0, buffer: 7, maxWeeks: 12 }
  ];
  var LEVEL_TIER = { exam: "real_exam", mock: "mock", topic: "topic_test", retrieval: "retrieval_test" };
  var CALCULATORS = ["", "none", "allowed"];
  var DEFAULT_WEEKLY = 6;          // hours a week, when the ledger has nothing to say

  /* ---------------- small helpers ---------------- */
  function has(o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); }
  function isDate(s) { return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s); }
  function isTime(s) { return typeof s === "string" && /^\d{1,2}:\d{2}$/.test(s); }
  function str(v, max) { return String(v == null ? "" : v).trim().slice(0, max || 200); }
  function num(v, lo, hi) {
    if (v === null || v === undefined || v === "") return null;
    var n = Number(v);
    if (!isFinite(n)) return null;
    if (lo != null && n < lo) return null;
    if (hi != null && n > hi) return null;
    return n;
  }
  function today() { return KOS.srs.todayISO(); }
  function rid(n) {
    var a = "abcdefghijkmnpqrstuvwxyz23456789", s = "";
    for (var i = 0; i < (n || 8); i++) s += a.charAt(Math.floor(Math.random() * a.length));
    return s;
  }
  function tier(v) { return TIERS.filter(function (t) { return t.v === v; })[0] || TIERS[0]; }
  function presets() { return (window.KOS_EXAM_PRESETS && KOS_EXAM_PRESETS.papers) || []; }
  function preset(id) { return presets().filter(function (p) { return p.id === id; })[0] || null; }
  function examSubjects() { return KOS.subjects ? KOS.subjects.ids("exam") : ["compsci", "maths", "it"]; }

  /* ---------------- the store branch ---------------- */
  function X() {
    var x = store.state.exams;
    if (!x || typeof x !== "object") x = store.state.exams = { v: 1, assessments: {}, prefs: {} };
    if (!x.assessments || typeof x.assessments !== "object" || Array.isArray(x.assessments)) x.assessments = {};
    if (!x.prefs || typeof x.prefs !== "object") x.prefs = {};
    return x;
  }

  /* ---------------- the schema gate ---------------- */
  function cleanList(list, max, fn) {
    return (Array.isArray(list) ? list : []).map(fn).filter(Boolean).slice(0, max);
  }
  function normaliseScope(s, subject) {
    s = s && typeof s === "object" ? s : {};
    var opts = { subject: subject || undefined, max: 200 };
    var p = s.pacing && typeof s.pacing === "object" ? s.pacing : null;
    return {
      include: KOS.spec.normaliseRefs(Array.isArray(s.include) ? s.include : [], opts),
      exclude: KOS.spec.normaliseRefs(Array.isArray(s.exclude) ? s.exclude : [], opts),
      pacing: p ? {
        upTo: isDate(p.upTo) ? p.upTo : null,
        /* a frozen rule is a LEAF list (invariant 121): written once, when
           the assessment passes or its result is logged */
        frozen: Array.isArray(p.frozen) ? KOS.spec.normaliseRefs(p.frozen, { leavesOnly: true, max: 400 }) : null,
        frozenAt: isDate(p.frozenAt) ? p.frozenAt : null,
        /* how many leaves the rule gave when it was made, for the
           builder's "+3 leaves since you made this test" */
        seen: num(p.seen, 0, 9999)
      } : null
    };
  }
  function normalise(patch, base) {
    patch = patch || {};
    var b = base || {};
    function pick(k, d) { return has(patch, k) && patch[k] !== undefined ? patch[k] : (has(b, k) && b[k] !== undefined ? b[k] : d); }
    var t = tier(pick("tier", "real_exam")).v;
    var pr = preset(pick("preset", null));
    var subject = pick("subject", pr ? pr.subject : null);
    subject = examSubjects().indexOf(subject) !== -1 ? subject : null;
    var time = pick("time", null);
    time = isTime(time) ? ("0" + time).slice(-5) : null;
    var calc = pick("calculator", pr && pr.calculator ? pr.calculator : "");
    var res = pick("result", null);
    var links = pick("links", {}) || {};
    return {
      id: b.id || (typeof patch.id === "string" && patch.id ? patch.id : rid()),
      title: str(pick("title", ""), 120) || (pr ? pr.title : tier(t).label),
      tier: t,
      subject: subject,
      preset: pr ? pr.id : null,
      board: str(pick("board", pr ? pr.board : ""), 30),
      qual: str(pick("qual", pr ? pr.qual : ""), 20),
      paper: str(pick("paper", pr ? pr.paper : ""), 60),
      date: isDate(pick("date", null)) ? pick("date", null) : null,
      time: time,
      durationMins: num(pick("durationMins", pr ? pr.mins : null), 1, 600),
      location: str(pick("location", ""), 80),
      seat: str(pick("seat", ""), 20),
      provisional: !!pick("provisional", false),
      /* a new assessment from a board paper starts with the paper's scope */
      scope: normaliseScope(pick("scope", null) || (pr && !b.scope ? { include: pr.include.slice(), exclude: pr.excludeYear2 ? year2Only(pr.subject) : [] } : null), subject || (pr && pr.subject)),
      /* the FSRS cap (invariant 122): always for a real exam, opt-in for a
         mock (decision L), never for anything else */
      cap: t === "real_exam" ? true : t === "mock" ? !!pick("cap", false) : false,
      marks: num(pick("marks", pr ? pr.marks : null), 0, 1000),
      calculator: CALCULATORS.indexOf(calc) !== -1 ? calc : (pr && pr.calculator) || "",
      extraTime: Math.round(num(pick("extraTime", 0), 0, 100) || 0),
      startBy: isDate(pick("startBy", null)) ? pick("startBy", null) : null,
      checklist: cleanList(pick("checklist", []), 40, function (c) {
        if (!c || !str(c.text)) return null;
        return { id: str(c.id, 16) || rid(6), text: str(c.text, 160), done: !!c.done, at: c.done && isFinite(c.at) ? c.at : null };
      }),
      milestones: cleanList(pick("milestones", []), 40, function (m) {
        if (!m || !str(m.text)) return null;
        return { id: str(m.id, 16) || rid(6), text: str(m.text, 160), date: isDate(m.date) ? m.date : null, done: !!m.done };
      }),
      alerts: cleanList(pick("alerts", []), 4, function (x) { var n = parseInt(x, 10); return isFinite(n) && n >= 0 ? n : null; }),
      notes: String(pick("notes", "") || "").slice(0, 4000),
      result: res && typeof res === "object" ? {
        attempt: str(res.attempt, 20) || null,
        marks: num(res.marks, 0), max: num(res.max, 1), grade: str(res.grade, 20), at: isDate(res.at) ? res.at : null
      } : null,
      links: {
        itUnit: typeof links.itUnit === "string" && /^F\d{3}$/.test(links.itUnit) ? links.itUnit : null,
        calendarId: links.calendarId == null || links.calendarId === "" ? null : links.calendarId,
        assignmentId: links.assignmentId == null || links.assignmentId === "" ? null : links.assignmentId
      },
      archived: !!pick("archived", false),
      created: b.created || Date.now(),
      updatedAt: Date.now()
    };
  }

  /* ---------------- reads ---------------- */
  function all() {
    var a = X().assessments;
    return Object.keys(a).map(function (k) { return a[k]; }).filter(Boolean)
      .sort(function (x, y) { return (x.date || "9999") < (y.date || "9999") ? -1 : (x.date || "9999") > (y.date || "9999") ? 1 : (x.title || "").localeCompare(y.title || ""); });
  }
  function get(id) { return (id && X().assessments[id]) || null; }
  function upcoming(from) {
    var t = from || today();
    return all().filter(function (a) { return !a.archived && a.date && a.date >= t; });
  }
  function past(from) {
    var t = from || today();
    return all().filter(function (a) { return !a.archived && a.date && a.date < t; }).reverse();
  }
  function daysTo(a, from) { return a && a.date ? KOS.srs.daysBetween(from || today(), a.date) : null; }

  /* ---------------- the scope ---------------- */
  /* every leaf the plan covers in weeks ending on or before `upTo`, class
     or personal — read from the rows' own leaf links (invariant 82) */
  function pacingCovered(upTo, subject) {
    if (!KOS.pacing || !KOS.pacing.entries) return [];
    var seen = {}, out = [];
    KOS.pacing.entries().forEach(function (e) {
      if (!e || !e.wb || !e.subject || (subject && e.subject !== subject)) return;
      if (KOS.srs.addDays(e.wb, 6) > upTo) return;
      (e.refs || []).forEach(function (r) {
        var k = e.subject + ":" + r;
        if (!seen[k] && KOS.spec.parse(k)) { seen[k] = true; out.push(k); }
      });
    });
    return KOS.spec.resolve(out);
  }
  function ruleLeaves(a, from) {
    var p = a.scope && a.scope.pacing;
    if (!p) return [];
    if (p.frozen) return p.frozen.slice();
    return pacingCovered(p.upTo || a.date || from || today(), a.subject);
  }
  /* the resolved scope (invariant 121): union first, exclusions last */
  function leaves(a, from) {
    if (!a || !a.scope) return [];
    var seen = {}, out = [];
    KOS.spec.resolve(a.scope.include).concat(ruleLeaves(a, from)).forEach(function (k) {
      if (!seen[k]) { seen[k] = true; out.push(k); }
    });
    var gone = {};
    KOS.spec.resolve(a.scope.exclude).forEach(function (k) { gone[k] = true; });
    return out.filter(function (k) { return !gone[k]; });
  }
  function contains(a, sid, ref, from) { return leaves(a, from).indexOf(sid + ":" + ref) !== -1; }
  /* the excluded nodes as picked, collapsed to their highest whole node,
     for the "Excluded from this test" callout */
  function excluded(a) {
    if (!a || !a.scope) return [];
    var picks = a.scope.exclude.slice();
    return picks.filter(function (k) {
      return !picks.some(function (o) {
        return o !== k && KOS.spec.resolve([o]).length > KOS.spec.resolve([k]).length &&
          KOS.spec.resolve([k]).every(function (x) { return KOS.spec.resolve([o]).indexOf(x) !== -1; });
      });
    }).map(function (k) { var p = KOS.spec.parse(k); var n = p && KOS.spec.node(p.subject, p.ref); return n ? { key: k, ref: n.ref, title: n.title, level: n.level, leaves: n.leafCount } : null; })
      .filter(Boolean);
  }
  /* "+3 leaves since you made this test": the live rule against the count
     it gave when it was made (null when frozen or never counted) */
  function ruleGrowth(a, from) {
    var p = a && a.scope && a.scope.pacing;
    if (!p || p.frozen || p.seen == null) return null;
    return ruleLeaves(a, from).length - p.seen;
  }
  /* the A-level-only leaves (plan §6.4): generated from the boards'
     AS/A-level markings by tools/gen_exam_index.py */
  function year2Only(subject) {
    var ix = window.KOS_EXAMS && KOS_EXAMS.index;
    var list = (ix && ix.year2Only && ix.year2Only[subject]) || [];
    return list.slice();
  }

  /* ---------------- writes ---------------- */
  function add(data, opts) {
    var a = normalise(data || {});
    if (a.scope.pacing && a.scope.pacing.seen == null && !a.scope.pacing.frozen) a.scope.pacing.seen = ruleLeaves(a).length;
    X().assessments[a.id] = a;
    store.save();
    if (!(opts && opts.quiet)) after(a, null);
    return a;
  }
  function update(id, patch) {
    var cur = get(id);
    if (!cur) return null;
    var next = normalise(patch || {}, cur);
    next.id = cur.id;
    if (next.scope.pacing && !cur.scope.pacing && next.scope.pacing.seen == null) next.scope.pacing.seen = ruleLeaves(next).length;
    X().assessments[id] = next;
    store.save();
    after(next, cur);
    return next;
  }
  function remove(id) {
    var a = get(id);
    if (!a) return false;
    delete X().assessments[id];
    /* a calendar event it came from stays hidden — the record moved here
       and was deleted here; tracker attempts keep their link as history */
    store.save();
    return true;
  }
  /* what saving an assessment does elsewhere: an IT unit's sitting date
     follows its assessment, and the flashcard cap reruns (invariant 122) */
  function after(a, before) {
    if (a.links.itUnit && a.date && KOS.itUnits && (!before || before.date !== a.date)) {
      var u = KOS.itUnits.get(a.links.itUnit);
      if (u && u.date !== a.date && u.status === "sitting") KOS.itUnits.setUnit(a.links.itUnit, { date: a.date }, { fromExam: true });
    }
    if (a.cap && KOS.srs && KOS.srs.examPass) KOS.srs.examPass();
  }
  function setPrefs(patch) {
    var p = X().prefs;
    if (has(patch, "weeklyHours")) p.weeklyHours = num(patch.weeklyHours, 0, 100);
    if (has(patch, "seasonDays")) p.seasonDays = num(patch.seasonDays, 1, 120);
    store.save();
    return p;
  }

  /* ---------------- the freeze (refinement 1) ----------------
     A "Covered in Pacing so far" rule becomes a fixed leaf list once its
     assessment has passed or its real result is logged. Runs at boot and
     when a result is recorded; never from a render. */
  function freeze(a, on) {
    var p = a && a.scope && a.scope.pacing;
    if (!p || p.frozen) return false;
    p.frozen = pacingCovered(p.upTo || a.date || on || today(), a.subject);
    p.frozenAt = on || today();
    a.updatedAt = Date.now();
    return true;
  }
  function freezePass() {
    var t = today(), n = 0;
    all().forEach(function (a) {
      if (a.scope && a.scope.pacing && !a.scope.pacing.frozen && ((a.date && a.date < t) || a.result)) { if (freeze(a, t)) n++; }
    });
    if (n) store.save();
    return n;
  }

  /* ---------------- the real result (invariant 124) ----------------
     An attempt with role "result" fills its assessment's result — a LINK
     to the attempt, with its marks for reading — freezes the scope, and,
     for an IT unit, writes the raw mark through KOS.itUnits.setUnit, which
     stays the owner of unit marks (invariant 26f). */
  function recordResult(id, entry) {
    var a = get(id);
    if (!a || !entry) return null;
    a.result = { attempt: entry.uid || null, marks: entry.marks, max: entry.max, grade: entry.grade || "", at: entry.date || today() };
    freeze(a, today());
    a.updatedAt = Date.now();
    store.save();
    if (a.links.itUnit && KOS.itUnits && entry.marks != null) {
      var spec = window.KOS_IT_GRADES && KOS_IT_GRADES.units[a.links.itUnit];
      if (spec && (entry.max == null || entry.max === spec.rawMax)) KOS.itUnits.setUnit(a.links.itUnit, { raw: entry.marks, status: "done" }, { fromExam: true });
    }
    return a;
  }
  function clearResult(id, attemptUid) {
    var a = get(id);
    if (!a || !a.result || (attemptUid && a.result.attempt !== attemptUid)) return false;
    a.result = null;
    a.updatedAt = Date.now();
    store.save();
    return true;
  }

  /* ---------------- IT units (the sitting date's two homes) ----------------
     An IT unit still to sit, with a date, IS an assessment: F201 a real
     exam, an NEA unit a deadline. KOS.itUnits.setUnit calls this so the
     desk and the hub never disagree about the date. */
  function syncItUnit(code) {
    if (!KOS.itUnits) return null;
    var u = KOS.itUnits.get(code);
    var spec = window.KOS_IT_GRADES && KOS_IT_GRADES.units[code];
    if (!u || !spec) return null;
    var a = all().filter(function (x) { return x.links.itUnit === code; })[0] || null;
    if (u.status !== "sitting" || !u.date) return a;
    if (a) {
      if (a.date !== u.date) { a.date = u.date; a.updatedAt = Date.now(); store.save(); }
      return a;
    }
    var exam = spec.kind === "exam";
    var pr = presets().filter(function (p) { return p.itUnit === code; })[0];
    return add({
      title: pr ? pr.title : "OCR IT · " + code + (exam ? "" : " (NEA)"),
      tier: exam ? "real_exam" : "deadline", subject: "it", preset: pr ? pr.id : null,
      date: u.date, scope: { include: ["it:" + code] }, links: { itUnit: code }
    }, { quiet: true });
  }

  /* ---------------- migration (plan §3.4; once, at boot, idempotent) -------
     Every one-off calendar exam becomes an assessment and the event is kept,
     marked `migratedTo` and hidden, so a rollback finds it. A recurring
     exam (a weekly class quiz) stays an event: a real exam never recurs.
     IT units still to sit, with a date, become assessments too. */
  function fromEvent(ev) {
    var level = ev.examLevel || (KOS.calendar && KOS.calendar.examLevel ? KOS.calendar.examLevel(ev).v : "exam");
    var refs = KOS.calendar && KOS.calendar.refsOf ? KOS.calendar.refsOf(ev) : (ev.refs || []);
    var include = refs.length ? refs : ev.subject && KOS.spec ? KOS.spec.units(ev.subject).map(function (u) { return u.key; }) : [];
    var end = ev.time && ev.endTime ? (function () {
      var s = ev.time.split(":"), e = ev.endTime.split(":");
      return (+e[0] * 60 + +e[1]) - (+s[0] * 60 + +s[1]);
    })() : null;
    return {
      title: ev.title, tier: LEVEL_TIER[level] || "real_exam", subject: ev.subject || null,
      paper: ev.paper || "", date: ev.date, time: ev.allDay ? null : ev.time,
      durationMins: ev.durationMins || (end > 0 ? end : null),
      location: ev.room || ev.location || "", notes: ev.description || "",
      alerts: ev.alerts || [], scope: { include: include },
      links: { calendarId: ev.id != null ? ev.id : null }
    };
  }
  function migrate() {
    var n = 0;
    var cal = store.state.calendar;
    if (cal && Array.isArray(cal.events)) {
      cal.events.forEach(function (ev) {
        if (!ev || ev.type !== "exam" || ev.migratedTo || (ev.recur && ev.recur !== "none")) return;
        var a = add(fromEvent(ev), { quiet: true });
        ev.migratedTo = a.id;            // a migration is not an edit: updatedAt stays
        n++;
      });
    }
    var units = store.state.itUnits && store.state.itUnits.units;
    if (units) Object.keys(units).forEach(function (code) {
      var u = units[code];
      if (!u || u.status !== "sitting" || !u.date) return;
      if (all().some(function (a) { return a.links.itUnit === code; })) return;
      if (syncItUnit(code)) n++;
    });
    if (n) store.save();
    return n;
  }

  /* ---------------- the FSRS cap's list (invariant 122) ----------------
     Every assessment that may hold a flashcard back: a real exam, or a mock
     with its cap on, still ahead, with its resolved scope. KOS.srs.examFor
     takes the earliest whose scope holds the card's leaf. */
  function capList(from) {
    var t = from || today();
    return all().filter(function (a) { return !a.archived && a.cap && a.date && a.date > t; })
      .map(function (a) { return { id: a.id, date: a.date, leaves: leaves(a, t) }; });
  }

  /* ---------------- the calendar's view (invariant 44) ----------------
     The calendar draws assessments as derived entries in the shape of an
     event, so every reader of the calendar (the month, Home's ladder, the
     countdowns, alerts) sees them without a stored copy. `assessmentId`
     marks one; a click opens the hub, never the event editor. */
  function endTime(a) {
    if (!a.time || !a.durationMins) return null;
    var p = a.time.split(":"), m = (+p[0]) * 60 + (+p[1]) + a.durationMins;
    if (m >= 1440) return null;
    return ("0" + Math.floor(m / 60)).slice(-2) + ":" + ("0" + (m % 60)).slice(-2);
  }
  function eventViews() {
    return all().filter(function (a) { return !a.archived && a.date; }).map(function (a) {
      var t = tier(a.tier), first = KOS.spec.firstLeaf(a.scope.include);
      var done = a.tier === "deadline" && a.milestones.length && a.milestones.every(function (m) { return m.done; });
      return {
        id: "x:" + a.id, assessmentId: a.id, v: 2, derived: true,
        alertKey: a.links.calendarId != null ? a.links.calendarId : "x:" + a.id,
        type: a.tier === "deadline" ? "deadline" : "exam", examLevel: t.level,
        title: a.title, date: a.date, allDay: !a.time, time: a.time, endTime: endTime(a),
        subject: a.subject, ref: first && first.subject === a.subject ? first.ref : null,
        refs: a.scope.include.slice(), paper: a.paper, room: a.location, location: a.location,
        durationMins: a.durationMins, description: a.notes, colour: "", recur: "none", recurUntil: null,
        alerts: a.alerts.length ? a.alerts.slice() : [4320], showInCountdown: true,
        priority: 0, status: done || a.result ? "complete" : "notStarted", assignmentId: null,
        provisional: a.provisional, tier: a.tier
      };
    });
  }

  /* ---------------- start-by (plan §11) ----------------
     hoursNeeded = base(tier) × scope leaves × (1 − progress)
     startBy     = date − min(maxWeeks(tier), ceil(hoursNeeded ÷ this
                   assessment's share of the weekly hours)) weeks − buffer(tier)
     The share is by tier weight among the assessments of the next twelve
     weeks, never under a quarter of the week.
     Progress is the share of the scope's leaves already completed on their
     topic pages (the readiness signals refine it in phase 3). Advisory; an
     override (`startBy`) wins and says so. */
  function weeklyHours() {
    var p = X().prefs;
    if (p.weeklyHours > 0) return { hours: p.weeklyHours, from: "set" };
    var t = today(), from = KOS.srs.addDays(t, -28), secs = 0;
    (KOS.sessions && KOS.sessions.all ? KOS.sessions.all() : []).forEach(function (s) {
      if (!s || !s.date || s.date < from || s.date > t || s.type === "media" || s.type === "todo") return;
      secs += s.dur || 0;
    });
    var h = Math.round(secs / 3600 / 4 * 2) / 2;
    return h >= 1 ? { hours: h, from: "ledger" } : { hours: DEFAULT_WEEKLY, from: "default" };
  }
  function progress(a) {
    var ls = leaves(a);
    if (!ls.length) return 0;
    var done = ls.filter(function (k) {
      var p = KOS.spec.parse(k), pr = p && KOS.store.peekProgress ? KOS.store.peekProgress(p.subject, p.ref) : null;
      return pr && pr.status === "done";
    }).length;
    return done / ls.length;
  }
  function startBy(a, from) {
    if (!a || !a.date) return null;
    var t = tier(a.tier), now = from || today();
    if (a.startBy) return { date: a.startBy, override: true, passed: a.startBy <= now && a.date >= now };
    var weekly = weeklyHours();
    /* this assessment's share of the week, by tier weight, among those
       ahead in the next twelve weeks (at least its own) */
    var horizon = KOS.srs.addDays(now, 84);
    var peers = upcoming(now).filter(function (x) { return x.date <= horizon && x.tier !== "deadline"; });
    var sum = peers.reduce(function (s, x) { return s + tier(x.tier).weight; }, 0) || t.weight;
    /* never under a quarter of the week, so a small test beside a real
       exam is not given a sliver that stretches it over months */
    var share = weekly.hours * Math.max(0.25, a.tier === "deadline" ? 0 : t.weight / Math.max(sum, t.weight));
    var hoursNeeded;
    if (a.tier === "deadline") {
      var asg = a.links.assignmentId != null && KOS.assignments && KOS.assignments.get ? KOS.assignments.get(a.links.assignmentId) : null;
      hoursNeeded = asg && asg.estimateMins ? Math.max(0, asg.estimateMins - (asg.actualMins || 0)) / 60 : 0;
    } else {
      hoursNeeded = t.base * leaves(a, now).length * (1 - progress(a));
    }
    /* and never longer than the tier's longest run-up: a retrieval quiz
       starts within the week before it, a real exam within twenty */
    var weeks = share > 0 ? Math.min(t.maxWeeks, Math.ceil(hoursNeeded / share)) : 0;
    var date = KOS.srs.addDays(a.date, -(weeks * 7 + t.buffer));
    var nextMs = a.milestones.filter(function (m) { return !m.done && m.date; }).sort(function (x, y) { return x.date < y.date ? -1 : 1; })[0] || null;
    return {
      date: date, override: false, hours: Math.round(hoursNeeded * 10) / 10, weekly: weekly.hours, weeklyFrom: weekly.from,
      share: Math.round(share * 10) / 10, weeks: weeks, buffer: t.buffer, milestone: nextMs,
      passed: date <= now && a.date >= now,
      why: (t.buffer >= 7 ? Math.round(t.buffer / 7) + (t.buffer >= 14 ? " weeks" : " week") : t.buffer + (t.buffer === 1 ? " day" : " days")) + " of buffer" +
        (hoursNeeded > 0 ? " + " + (Math.round(hoursNeeded * 10) / 10) + " h at about " + (Math.round(share * 10) / 10) + " h a week for this" +
          (share > 0 && Math.ceil(hoursNeeded / share) > t.maxWeeks ? ", capped at " + t.maxWeeks + (t.maxWeeks === 1 ? " week" : " weeks") + " of run-up" : "") : "")
    };
  }

  /* ---------------- the past-paper index (plan §4.1) ----------------
     Reads js/data/exam-index.js (generated, references only). */
  var SIT_MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  function IX() { return window.KOS_EXAMS && KOS_EXAMS.index; }
  function sittingLabel(s) {
    if (s === "specimen" || s === "sample") return s.charAt(0).toUpperCase() + s.slice(1);
    var m = /^(\d{4})-(\d{2})$/.exec(String(s || ""));
    return m ? SIT_MONTH[+m[2] - 1] + " " + m[1] : String(s || "");
  }
  function questionsOf(paperId, sitting) {
    var ix = IX();
    if (!ix) return [];
    return ix.questions.filter(function (q) { return q[0] === paperId && (!sitting || q[1] === sitting); })
      .map(function (q) { return { paper: q[0], sitting: q[1], section: q[2], q: q[3], marks: q[4], refs: q[5].slice(), why: q[6] || "" }; });
  }
  /* a past paper picked in the log dialog: its title, marks and questions */
  function paperFill(paperId, sitting) {
    var ix = IX(), p = ix && ix.papers[paperId];
    if (!p || p.sittings.indexOf(sitting) === -1) return null;
    var qs = questionsOf(paperId, sitting);
    var pr = presets().filter(function (x) { return x.index === paperId; })[0];
    var sum = qs.reduce(function (s, q) { return s + q.marks; }, 0);
    var refs = [];
    qs.forEach(function (q) { q.refs.forEach(function (r) { if (refs.indexOf(r) === -1) refs.push(r); }); });
    /* a section the index does not cover (CS Paper 1's B–D) is written as
       one row for its marks, so the total still reaches the paper's */
    var rows = qs.map(function (q) {
      return { q: (q.section && q.section !== "A" ? q.section.charAt(0) + " " : "") + q.q, max: q.marks, got: null, refs: q.refs, tags: [], redo: false, note: "" };
    });
    var full = (pr && pr.marks) || p.marks;
    if (pr && pr.skeleton && full > sum) rows.push({ q: "B–D", max: full - sum, got: null, refs: [], tags: [], redo: false, note: "Sections B–D (programming and the Skeleton Program)" });
    return { title: p.title + " · " + sittingLabel(sitting), subject: p.subject, max: Math.max(full, sum), questions: rows,
      ref: paperId + ":" + sitting, refs: KOS.spec.normaliseRefs(refs, { max: 30 }) };
  }
  function packFill(id) {
    var ix = IX(), pk = ix && ix.packs.filter(function (x) { return x.id === id; })[0];
    if (!pk) return null;
    return { title: pk.sub + " · " + pk.level + (pk.source === "pmt" ? " (PMT)" : ""), subject: pk.subject, source: pk.source,
      ref: pk.id, refs: pk.refs.slice(), file: pk.file, units: pk.units };
  }
  KOS.examIndex = {
    available: function () { return !!IX(); },
    papers: function () { var ix = IX(); return ix ? ix.papers : {}; },
    packs: function () { var ix = IX(); return ix ? ix.packs : []; },
    sittingLabel: sittingLabel,
    questions: questionsOf,
    paperFill: paperFill,
    packFill: packFill
  };

  KOS.exams = {
    TIERS: TIERS,
    LEVEL_TIER: LEVEL_TIER,
    tier: tier,
    presets: presets,
    preset: preset,
    normalise: normalise,
    normaliseScope: normaliseScope,
    all: all,
    get: get,
    upcoming: upcoming,
    past: past,
    daysTo: daysTo,
    add: add,
    update: update,
    remove: remove,
    setPrefs: setPrefs,
    prefs: function () { return Object.assign({}, X().prefs); },
    leaves: leaves,
    contains: contains,
    excluded: excluded,
    pacingCovered: pacingCovered,
    ruleGrowth: ruleGrowth,
    year2Only: year2Only,
    freezePass: freezePass,
    recordResult: recordResult,
    clearResult: clearResult,
    syncItUnit: syncItUnit,
    fromEvent: fromEvent,
    migrate: migrate,
    capList: capList,
    eventViews: eventViews,
    startBy: startBy,
    weeklyHours: weeklyHours,
    progress: progress
  };
})();
