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
  var GRADE_LIST = ["A*", "A", "B", "C", "D", "E", "D*", "M", "P"];
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
  /* route words an id must never spell (#/exams/<tab> beside #/exams/<id>) */
  var RESERVED = { timetable: 1, readiness: 1, plan: 1, practice: 1, season: 1, results: 1, attempt: 1, past: 1, load: 1 };
  function rid(n) {
    var a = "abcdefghijkmnpqrstuvwxyz23456789", s = "";
    for (var i = 0; i < (n || 8); i++) s += a.charAt(Math.floor(Math.random() * a.length));
    return RESERVED[s] ? rid(n) : s;
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
        /* `group`: prep (the overview's checklist) or day (On the day, and
           the Exam Room's "Before you go in"); a default item's id is
           "d:<key>" so ticking it once stores it (phase 3) */
        return { id: str(c.id, 16) || rid(6), text: str(c.text, 160), done: !!c.done, at: c.done && isFinite(c.at) ? c.at : null,
          group: c.group === "day" ? "day" : "prep" };
      }),
      milestones: cleanList(pick("milestones", []), 40, function (m) {
        if (!m || !str(m.text)) return null;
        return { id: str(m.id, 16) || rid(6), text: str(m.text, 160), date: isDate(m.date) ? m.date : null, done: !!m.done };
      }),
      alerts: cleanList(pick("alerts", []), 4, function (x) { var n = parseInt(x, 10); return isFinite(n) && n >= 0 ? n : null; }),
      notes: String(pick("notes", "") || "").slice(0, 4000),
      /* the grade aimed for (phase 3): readiness's "last timed paper at or
         above target" and the target gap read it; blank is 70% */
      target: GRADE_LIST.indexOf(pick("target", "")) !== -1 ? pick("target", "") : "",
      /* the predicted range as it stood just before the exam (written at
         boot, never by a render), for results day's "predicted in May" */
      predictedAtExam: (function (p) {
        p = p && typeof p === "object" ? p : null;
        return p && str(p.lo, 3) && str(p.hi, 3) ? { lo: str(p.lo, 3), hi: str(p.hi, 3), series: str(p.series, 12), at: isDate(p.at) ? p.at : null } : null;
      })(pick("predictedAtExam", null)),
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
  /* the live rule stays inside the board paper's own scope when the
     assessment has one (a Paper 2 mock grows by Paper 2 leaves only) */
  function ruleLeaves(a, from) {
    var p = a.scope && a.scope.pacing;
    if (!p) return [];
    if (p.frozen) return p.frozen.slice();
    return withinPreset(a, pacingCovered(p.upTo || a.date || from || today(), a.subject));
  }
  function withinPreset(a, list) {
    var pr = a && a.preset ? preset(a.preset) : null;
    if (!pr || !pr.include || !pr.include.length) return list;
    var ok = {};
    KOS.spec.resolve(pr.include).forEach(function (k) { ok[k] = true; });
    return list.filter(function (k) { return ok[k]; });
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
    /* the Exam season switch (decision K): an override of the automatic
       state, keyed to the season it was set in so it lapses with it */
    if (has(patch, "season")) p.season = patch.season && (patch.season.mode === "on" || patch.season.mode === "off")
      ? { mode: patch.season.mode, key: str(patch.season.key, 20) || "none" } : null;
    if (has(patch, "quiet")) p.quiet = !!patch.quiet;
    if (has(patch, "resultsDay")) p.resultsDay = isDate(patch.resultsDay) ? patch.resultsDay : null;
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
    p.frozen = withinPreset(a, pacingCovered(p.upTo || a.date || on || today(), a.subject));
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

  /* ================================================================
     PHASE 3 — readiness and decisions (plan §7–§12, §16). Pure reads of
     the state; the arithmetic is KOS.examStats (core/examstats.js). A
     render calls these and writes nothing (invariant 129, smoke91).
     ================================================================ */
  function S() { return KOS.examStats; }
  /* a leaf's node, with its unit's title for the breakdowns (29j) */
  function nodeOf(k) {
    var p = KOS.spec.parse(k), n = p ? KOS.spec.node(p.subject, p.ref) : null;
    if (!n) return null;
    var u = n.unit ? KOS.spec.node(p.subject, n.unit) : null;
    n.unitTitle = u ? u.title.replace(/^Fundamentals of (the )?/i, "").replace(/^./, function (c) { return c.toUpperCase(); }) : n.unit;
    return n;
  }
  function presetOf(a) { return a && a.preset ? preset(a.preset) : null; }
  function paperWeights(a) {
    var pr = presetOf(a), ix = IX();
    return pr && pr.index && ix && S() ? S().weights(pr.index, ix) : null;
  }
  /* the attempts that are practice for an assessment: linked to it, or a
     past paper of its board paper (decision B's `source.ref`) */
  function attemptsFor(a) {
    if (!a || !KOS.tracker) return [];
    var pr = presetOf(a), px = pr && pr.index ? pr.index + ":" : null;
    return KOS.tracker.all().filter(function (e) {
      return e.assessmentId === a.id || (px && e.source && e.source.kind === "past-paper" && String(e.source.ref || "").indexOf(px) === 0);
    }).sort(function (x, y) { return x.date < y.date ? -1 : x.date > y.date ? 1 : 0; });
  }
  function leafCovered(k) {
    var p = KOS.spec.parse(k);
    if (!p) return false;
    var pr = KOS.store.peekProgress ? KOS.store.peekProgress(p.subject, p.ref) : null;
    if (pr && (pr.status === "started" || pr.status === "done")) return true;
    return !!(KOS.pacing && KOS.pacing.entries().some(function (e) {
      return e.done && e.subject === p.subject && (e.refs || []).indexOf(p.ref) !== -1;
    }));
  }
  /* the first plan week still to come that reaches a leaf */
  function nextInPacing(k, from) {
    var p = KOS.spec.parse(k);
    if (!p || !KOS.pacing) return null;
    var wk = null;
    KOS.pacing.entries().forEach(function (e) {
      if (e.subject !== p.subject || (e.refs || []).indexOf(p.ref) === -1 || KOS.srs.addDays(e.wb, 6) < from) return;
      if (!wk || e.wb < wk) wk = e.wb;
    });
    return wk;
  }
  function targetPct(a, rows) {
    if (a && a.target && rows && rows.length) {
      var cuts = rows.map(function (r) { return r.marks[a.target] != null ? 100 * r.marks[a.target] / r.max : null; }).filter(function (v) { return v != null; });
      if (cuts.length) return Math.round(Math.max.apply(null, cuts));
    }
    return 70;
  }
  function boundsFor(a) {
    var pr = presetOf(a);
    return pr && S() ? S().boundaryRows(window.KOS_BOUNDARIES, pr.board, pr.qual, pr.paper) : [];
  }
  /* how far through the run-up we are: 0 at the start-by date, 1 at the
     start of the 7–14 day window (a straight line to Ready, decision E) */
  function runUp(a, now) {
    var sb = startBy(a, now), t = tier(a.tier);
    if (!sb || !a.date) return 1;
    var end = KOS.srs.addDays(a.date, -Math.max(1, t.buffer));
    var len = KOS.srs.daysBetween(sb.date, end);
    if (len <= 0) return now >= end ? 1 : 0;
    return Math.max(0, Math.min(1, KOS.srs.daysBetween(sb.date, now) / len));
  }
  /* which signals a tier reads (plan §7 "scaling by tier", frame 29f) */
  function signalsOf(t) {
    return t === "real_exam" || t === "mock" ? ["coverage", "rag", "recall", "practice"]
      : t === "topic_test" ? ["coverage", "rag", "recall"]
      : t === "retrieval_test" ? ["recall"] : [];
  }

  /* READINESS (invariant 123): four signals over the resolved scope, each
     mark-weighted by the leaf's weight for the paper (uniform without an
     index), each silent below its evidence, and the band with the one
     signal holding it down. A retrieval quiz reads recall TODAY; every
     other tier projects to the exam date through FSRS. */
  function readiness(a, from) {
    if (!a) return null;
    var now = from || today(), t = a.tier, X = S();
    if (t === "deadline") return deadlineBand(a, now);
    var on = t === "retrieval_test" ? now : (a.date && a.date > now ? a.date : now);
    var ls = leaves(a, now), w = paperWeights(a);
    var wt = function (k) { return X.weightOf(w, k); };
    var want = signalsOf(t), sig = {}, detail = { leaves: ls.length, on: on, weights: w };
    var totalW = ls.reduce(function (s, k) { return s + wt(k); }, 0);

    /* 1 · coverage: Pacing ticked, or the topic Started or Completed */
    if (want.indexOf("coverage") !== -1) {
      if (!ls.length) sig.coverage = { thin: true, why: "This scope has no leaves yet.", sub: "Pick a preset or include a topic" };
      else {
        var covW = 0, unmet = [];
        ls.forEach(function (k) { if (leafCovered(k)) covW += wt(k); else unmet.push(k); });
        sig.coverage = { value: totalW ? covW / totalW : 0, unmet: unmet.map(function (k) {
          var n = nodeOf(k), wk = nextInPacing(k, now);
          return { key: k, ref: n ? n.ref : k, title: n ? n.title : k, week: wk };
        }), met: ls.length - unmet.length, of: ls.length };
      }
    }
    /* 2 · RAG: the effective band, mark-weighted; unrated apart */
    if (want.indexOf("rag") !== -1) {
      var g = 0, am = 0, r = 0, u = 0, rated = 0, byUnit = {}, units = [];
      ls.forEach(function (k) {
        var p = KOS.spec.parse(k), n = nodeOf(k), b = KOS.rag && p ? KOS.rag.effective(p.subject, p.ref).band : null, x = wt(k);
        if (b === "g") g += x; else if (b === "a") am += x; else if (b === "r") r += x; else u += x;
        if (b) rated++;
        var uk = n ? p.subject + ":" + n.unit : "?";
        if (!byUnit[uk]) { byUnit[uk] = { key: uk, g: 0, a: 0, r: 0, u: 0 }; units.push(uk); }
        byUnit[uk][b || "u"] += x;
      });
      if (rated < X.NEED.ragLeaves) sig.rag = { thin: true, why: "Fewer than 3 leaves rated.", sub: rated ? rated + " rated so far · rate topics as you study them" : "Rate topics as you study them", rated: rated };
      else {
        var tw = g + am + r + u || 1;
        sig.rag = { green: g / tw, amber: am / tw, red: r / tw, unrated: u / tw, rated: rated, units: units.map(function (uk) {
          var o = byUnit[uk], s2 = o.g + o.a + o.r + o.u || 1, pu = KOS.spec.parse(uk), n2 = pu ? KOS.spec.node(pu.subject, pu.ref) : null;
          return { key: uk, ref: pu ? pu.ref : uk, title: n2 ? n2.title : uk, green: o.g / s2, amber: o.a / s2, red: o.r / s2, unrated: o.u / s2 };
        }) };
      }
    }
    /* 3 · recall on the day: R(on − last, s) per rated card (redo items
       weigh their marks), averaged per leaf, then mark-weighted */
    var perLeaf = {};
    if (want.indexOf("recall") !== -1) {
      var cards = 0, ratedCards = 0, sumR = 0, sumW = 0;
      ls.forEach(function (k) {
        var p = KOS.spec.parse(k);
        if (!p) return;
        var ls2 = 0, lw = 0, n = 0;
        KOS.srs.cardsFor(p.subject, p.ref).forEach(function (c) {
          cards++;
          var m = KOS.srs.peek(c.key), mem = KOS.fsrs.recordMemory(m);
          if (!mem || !m.last) return;
          ratedCards++;
          var rr = KOS.fsrs.retrievability(Math.max(0, KOS.srs.daysBetween(m.last, on)), mem.s), cw = KOS.srs.weightOf(c);
          ls2 += rr * cw; lw += cw; n++;
        });
        if (lw) { perLeaf[k] = { r: ls2 / lw, n: n }; sumR += perLeaf[k].r * wt(k); sumW += wt(k); }
      });
      if (ratedCards < X.NEED.recallCards) sig.recall = { thin: true, why: "Appears after 20 rated cards in scope.", sub: ratedCards + " rated so far · " + cards + " cards in scope", rated: ratedCards, cards: cards };
      else sig.recall = { value: sumR / sumW, rated: ratedCards, cards: cards, on: on, today: on === now,
        weakest: Object.keys(perLeaf).sort(function (x, y) { return perLeaf[x].r - perLeaf[y].r; }).map(function (k) {
          var n = nodeOf(k); return { key: k, ref: n ? n.ref : k, title: n ? n.title : k, r: perLeaf[k].r, n: perLeaf[k].n };
        }),
        noEvidence: ls.filter(function (k) { return !perLeaf[k]; }).length };
    }
    /* 4 · timed practice: linked attempts or the board paper's sittings */
    var rows = boundsFor(a), tPct = targetPct(a, rows), atts = attemptsFor(a);
    if (want.indexOf("practice") !== -1) {
      var timed = atts.filter(function (e) { return e.timed && e.role !== "result" && KOS.tracker.pct(e) != null; });
      if (!timed.length) sig.practice = { thin: true, why: "No timed paper yet.", sub: "The first one sets the baseline" };
      else {
        var list = timed.map(function (e) { return { pct: KOS.tracker.pct(e), date: e.date, label: e.paper || e.topic || "", mins: e.mins, uid: e.uid }; });
        sig.practice = { n: list.length, last: list[list.length - 1].pct, list: list, predicted: X.predicted(list, rows), targetPct: tPct };
      }
    }
    var f = runUp(a, now);
    var target = KOS.srs.examTarget() || 0.9;
    var b = t === "retrieval_test" ? null : X.band(sig, { target: target, targetPct: tPct, f: f });
    return { tier: t, signals: sig, band: b, f: f, target: target, targetPct: tPct, perLeaf: perLeaf, attempts: atts, bounds: rows, detail: detail };
  }
  /* a deadline has no readiness model: At risk comes from an overdue
     milestone, or from more estimated work than days left (§11) */
  function deadlineBand(a, now) {
    var ms = a.milestones || [];
    var over = ms.filter(function (m) { return !m.done && m.date && m.date < now; });
    var done = ms.filter(function (m) { return m.done; }).length;
    var asg = a.links.assignmentId != null && KOS.assignments && KOS.assignments.get ? KOS.assignments.get(a.links.assignmentId) : null;
    var left = asg && asg.estimateMins ? Math.max(0, asg.estimateMins - (asg.actualMins || 0)) : 0;
    var days = a.date ? KOS.srs.daysBetween(now, a.date) : null;
    var tight = left && days != null && left / 60 > Math.max(0, days) * 1.5;
    var b = !ms.length && !left ? null : over.length || tight
      ? { band: "risk", limit: "milestones", limitName: over.length ? "milestones" : "time left", why: over.length ? "A milestone is overdue." : "More work is estimated than the days left allow." }
      : { band: "on", limit: null, why: "Every milestone is on its date." };
    return { tier: "deadline", signals: {}, band: b, milestones: { done: done, of: ms.length, overdue: over }, left: left };
  }

  /* where the next ten marks come from (§9.4), for an assessment */
  function nextMarks(a, opts) {
    var rd = readiness(a);
    if (!rd || a.tier === "deadline") return null;
    var w = paperWeights(a), ls = leaves(a);
    var lost = {}, marked = 0, reviews = 0;
    rd.attempts.forEach(function (e) {
      var any = false;
      (e.questions || []).forEach(function (q) {
        if (q.max == null || q.got == null) return;
        any = true;
        var share = q.refs && q.refs.length ? 1 / q.refs.length : 0;
        (q.refs || []).forEach(function (k) {
          var r = lost[k] || (lost[k] = { lost: 0, avail: 0, tags: {}, qs: [] });
          r.lost += (q.max - q.got) * share; r.avail += q.max * share;
          (q.tags || []).forEach(function (t2) { r.tags[t2] = (r.tags[t2] || 0) + 1; });
          if (q.got < q.max) r.qs.push({ q: q.q, sitting: e.source && e.source.ref ? String(e.source.ref).split(":")[1] : null, lost: q.max - q.got, max: q.max });
        });
      });
      if (any) marked++;
    });
    if (rd.signals.recall && !rd.signals.recall.thin) reviews = rd.signals.recall.rated;
    if (!marked && reviews < S().NEED.nextReviews) return { thin: true, marked: marked, reviews: reviews,
      why: "Needs one marked paper or 50 rated reviews in scope." };
    var items = ls.map(function (k) {
      var p = KOS.spec.parse(k), n = nodeOf(k), lw = w && w.leaves[k], lo = lost[k];
      return { key: k, title: n ? n.title : k, ref: n ? n.ref : k, weight: lw ? lw.mean : null, rate: lw ? lw.rate : null,
        appear: lw ? lw.appear : null, of: lw ? lw.of : null, due: lw ? lw.due : false,
        recall: rd.perLeaf[k] ? rd.perLeaf[k].r : null, rag: KOS.rag && p ? KOS.rag.effective(p.subject, p.ref).band : null,
        lost: lo ? Math.round(lo.lost) : 0, avail: lo ? Math.round(lo.avail) : 0, tags: lo ? lo.tags : {}, questions: lo ? lo.qs : [] };
    });
    return { items: S().nextMarks(items, opts), marked: marked, reviews: reviews, sittings: w ? w.sittings.length : 0 };
  }

  /* ---------------- Exam Season (§12.1, decision K) ----------------
     On by itself while a real exam is within `seasonDays` (28) and until
     the series' last one has passed; the switch overrides it, keyed to
     the season it was set in (the series' last date, or "none") so an
     override lapses with its season. */
  function season(from) {
    var now = from || today(), days = X().prefs.seasonDays || 28;
    var reals = upcoming(now).filter(function (a) { return a.tier === "real_exam"; });
    var start = reals.filter(function (a) { return KOS.srs.daysBetween(now, a.date) <= days; })[0] || null;
    var series = [];
    if (start) {
      series.push(start);
      reals.slice(reals.indexOf(start) + 1).forEach(function (a) {
        if (KOS.srs.daysBetween(series[series.length - 1].date, a.date) <= days) series.push(a);
      });
    }
    var auto = !!start, key = auto ? series[series.length - 1].date : "none";
    var o = X().prefs.season;
    var override = o && o.key === key ? o.mode : null;
    var on = override ? override === "on" : auto;
    return { on: on, auto: auto, override: override, key: key, exams: series, next: series[0] || reals[0] || null,
      last: series.length ? series[series.length - 1] : null, quiet: !!(on && X().prefs.quiet) };
  }
  function setSeason(on) {
    var s = season();
    setPrefs({ season: on === s.auto ? null : { mode: on ? "on" : "off", key: s.key } });
    return season();
  }
  /* "Quiet the rest" (§12.1): while the season is on, notices from
     outside study wait; exam, reminder and study notices never do */
  var QUIET_KINDS = { airing: 1, wishlist: 1, money: 1, goal: 1, reports: 1, assistant: 1 };
  function quieted(kind) { return !!QUIET_KINDS[kind] && season().quiet; }

  /* ---------------- the checklist (29e, 29n) ----------------
     Auto items tick themselves from the evidence and cannot be unticked by
     hand; default items are offered by tier and stored once ticked; the
     user's own items are stored. `day` items are On the day's and the
     Exam Room's "Before you go in". */
  function checklist(a) {
    if (!a || a.tier === "deadline" || a.tier === "retrieval_test") return [];
    var stored = {};
    (a.checklist || []).forEach(function (c) { stored[c.id] = c; });
    var atts = attemptsFor(a);
    var out = [];
    function auto(id, text, done, why) { out.push({ id: id, text: text, done: !!done, auto: true, group: "prep", why: why }); }
    function def(id, text, group) { var s = stored[id]; out.push({ id: id, text: text, done: !!(s && s.done), auto: false, group: group, def: true }); }
    auto("a:scope", "Scope set", leaves(a).length > 0, "Ticks when the scope has at least one topic");
    if (a.tier === "real_exam" || a.tier === "mock") {
      if (a.subject === "maths") def("d:booklet", "Formula booklet read once", "prep");
      auto("a:timed1", "First timed paper", atts.some(function (e) { return e.timed; }), "Ticks with your first timed paper");
      if (a.tier === "real_exam") auto("a:marked4", "Four marked papers", atts.filter(function (e) { return e.marks != null; }).length >= 4, "Ticks with four marked papers");
      if (a.calculator === "allowed") def("d:calc", "Calculator in exam mode", "prep");
      def("d:memorise", "Must-memorise list drilled", "prep");
      if (a.tier === "real_exam") auto("a:confirmed", "Timetable confirmed by the board", !!a.date && !a.provisional, "Ticks when the date is no longer provisional");
      def("d:pens", "Black pens", "day");
      def("d:pencil", "Pencil and ruler", "day");
      if (a.tier === "real_exam") def("d:cand", "Candidate number", "day");
      def("d:water", "Water, label off", "day");
      def("d:phone", "Phone off and away", "day");
    } else if (a.tier === "topic_test") {
      def("d:notes", "Notes read once", "prep");
      def("d:cram", "Cram deck done", "prep");
    }
    (a.checklist || []).forEach(function (c) { if (c.id.indexOf("d:") !== 0) out.push({ id: c.id, text: c.text, done: c.done, auto: false, group: c.group || "prep" }); });
    return out;
  }
  /* a click on a checklist box (never a render): stores a default the
     first time; an auto item refuses */
  function tickCheck(id, itemId, done) {
    var a = get(id);
    if (!a || itemId.indexOf("a:") === 0) return null;
    var items = checklist(a).filter(function (c) { return c.id === itemId; })[0];
    if (!items) return null;
    var list = (a.checklist || []).map(function (c) { return Object.assign({}, c); });
    var cur = list.filter(function (c) { return c.id === itemId; })[0];
    if (cur) { cur.done = !!done; cur.at = done ? Date.now() : null; }
    else list.push({ id: itemId, text: items.text, done: !!done, at: done ? Date.now() : null, group: items.group });
    return update(id, { checklist: list });
  }
  function addCheck(id, text, group) {
    var a = get(id);
    if (!a || !str(text)) return null;
    return update(id, { checklist: (a.checklist || []).concat([{ id: rid(6), text: str(text, 160), done: false, group: group === "day" ? "day" : "prep" }]) });
  }

  /* ---------------- the timetable importer (§16.1, frame 29y) ----------------
     Each pasted or .ics paper is matched to a board preset and to an
     assessment you already have: same, moves date (both dates), new, or
     not yours. Import never deletes; a date stays provisional until the
     board confirms. */
  function presetFor(p) {
    var list = presets().filter(function (x) { return x.qual === p.qual && (p.unit ? x.itUnit === p.unit : String(parseInt(String(x.paper).replace(/\D/g, ""), 10)) === p.paper); });
    return list[0] || null;
  }
  function importMatch(parsed, from) {
    var now = from || today();
    return (parsed || []).map(function (p, i) {
      var pr = presetFor(p);
      var mine = all().filter(function (a) {
        return !a.archived && !a.result && ((pr && a.preset === pr.id) || (p.unit && a.links.itUnit === p.unit)) && (!a.date || a.date >= KOS.srs.addDays(now, -1));
      })[0] || null;
      var status, why;
      var taking = pr && (pr.level !== "AS" || all().some(function (a) { return a.preset && preset(a.preset) && preset(a.preset).level === "AS"; }));
      if (p.unit && KOS.itUnits) { var u = KOS.itUnits.get(p.unit); taking = !!(u && u.status === "sitting"); }
      if (mine) { status = mine.date === p.date ? "same" : "moves"; why = mine.date === p.date ? "already in your timetable" : "matches your " + mine.title; }
      else if (pr && taking) { status = "new"; why = "a new assessment from the board's paper"; }
      else { status = "notyours"; why = pr ? (pr.level === "AS" ? "an AS paper; you take the A-level" : "not one of your units") : "not a paper you take"; }
      return { i: i, parsed: p, preset: pr ? pr.id : null, assessment: mine ? mine.id : null, from: mine ? mine.date : null,
        status: status, why: why, pick: status !== "notyours" && status !== "same", title: pr ? pr.title : p.title };
    });
  }
  function importApply(rows) {
    var added = 0, moved = 0;
    (rows || []).forEach(function (r) {
      if (!r.pick) return;
      var p = r.parsed, time = p.time || (p.session === "pm" ? "13:30" : p.session === "am" ? "09:00" : null);
      if (r.status === "moves" && r.assessment) { update(r.assessment, { date: p.date, time: time || undefined, provisional: true }); moved++; }
      else if (r.status === "new" && r.preset) {
        var pr = preset(r.preset);
        add({ preset: pr.id, tier: "real_exam", date: p.date, time: time, durationMins: p.mins || pr.mins || null, provisional: true,
          links: pr.itUnit ? { itUnit: pr.itUnit } : {} });
        added++;
      }
    });
    return { added: added, moved: moved };
  }

  /* ---------------- the load view (§16.2) ----------------
     Real exams, mocks and deadlines over the season (or the next eight
     weeks), through KOS.examStats.load. */
  function loadView(from) {
    var now = from || today(), sn = season(now);
    var end = sn.on && sn.last ? sn.last.date : KOS.srs.addDays(now, 56);
    var items = upcoming(now).filter(function (a) { return (a.tier === "real_exam" || a.tier === "mock" || a.tier === "deadline") && a.date <= end; })
      .map(function (a) { return { id: a.id, date: a.date, title: a.title, subject: a.subject, tier: a.tier, time: a.time }; });
    return S().load(items);
  }

  /* ---------------- results (§8.4, §16.9) ----------------
     The predicted range at the last moment before each real exam, kept so
     results day can set the grade beside it; written at boot. */
  function predictPass() {
    var now = today(), n = 0;
    all().forEach(function (a) {
      if (a.tier !== "real_exam" || !a.date) return;
      var d = KOS.srs.daysBetween(now, a.date);
      if (d > 14 || (d < 0 && a.predictedAtExam)) return;
      var rd = readiness(a), pr = rd && rd.signals.practice && rd.signals.practice.predicted;
      if (!pr || pr.thin) return;
      var next = { lo: pr.lo, hi: pr.hi, series: pr.seriesText || "", at: now };
      var cur = a.predictedAtExam;
      if (cur && cur.lo === next.lo && cur.hi === next.hi) return;
      a.predictedAtExam = next; a.updatedAt = Date.now(); n++;
    });
    if (n) store.save();
    return n;
  }
  /* a subject's grade on results day (the board issues one per subject) */
  function setSubjectResult(series, subject, patch) {
    var x = X();
    if (!x.results || typeof x.results !== "object") x.results = {};
    var s = x.results[series] = x.results[series] || {};
    if (patch == null) delete s[subject];
    else s[subject] = { grade: str(patch.grade, 4), remark: !!patch.remark, at: isDate(patch.at) ? patch.at : today() };
    store.save();
    return s[subject] || null;
  }
  function subjectResults(series) { var r = X().results; return (r && r[series]) || {}; }
  /* the summer series: real exams dated May–July of a year */
  function seriesOf(a) { return a && a.date && /-0[5-7]-/.test(a.date) ? a.date.slice(0, 4) + "-06" : a && a.date ? a.date.slice(0, 7) : null; }

  /* the first study session on the scope since the assessment was made:
     the start-by marker reads "Started Mon 19 Oct" once there is one, and
     a passed start-by goes away (29-primitives) */
  function startedOn(a) {
    if (!a || !KOS.sessions || !KOS.sessions.all) return null;
    var ls = {}, since = new Date(a.created || 0).toISOString().slice(0, 10), first = null;
    leaves(a).forEach(function (k) { ls[k] = true; });
    if (!Object.keys(ls).length) return null;
    KOS.sessions.all().forEach(function (s) {
      if (!s || !s.date || s.date < since || s.type === "media" || s.type === "todo") return;
      var keys = KOS.spec.resolve(s.refs && s.refs.length ? s.refs : s.ref && s.subject ? [s.subject + ":" + s.ref] : []);
      if (keys.some(function (k) { return ls[k]; }) && (!first || s.date < first)) first = s.date;
    });
    return first;
  }
  /* the start-by marker's state: future ⚐, today, met ✓ (studied), or
     passed ▼ (and not yet studied) — null past the date or with none */
  function startState(a, from) {
    var now = from || today();
    if (!a || !a.date || a.date < now || a.result) return null;
    var sb = startBy(a, now);
    if (!sb) return null;
    var st = startedOn(a);
    if (st && st <= now && sb.date <= now) return { state: "met", date: st, sb: sb };
    if (sb.date === now) return { state: "today", date: sb.date, sb: sb };
    if (sb.date < now) return { state: "passed", date: sb.date, sb: sb, ago: KOS.srs.daysBetween(sb.date, now) };
    return { state: "future", date: sb.date, sb: sb, in: KOS.srs.daysBetween(now, sb.date), started: st };
  }
  /* the Scope Builder's Freeze (29d): the live rule fixed at today, by
     hand; Unfreeze lets it grow again while the assessment is ahead */
  function freezeNow(id) {
    var a = get(id);
    if (!a || !a.scope.pacing || a.scope.pacing.frozen) return null;
    freeze(a, today());
    store.save();
    return a;
  }
  function unfreeze(id) {
    var a = get(id);
    if (!a || !a.scope.pacing || !a.scope.pacing.frozen || (a.date && a.date < today()) || a.result) return null;
    a.scope.pacing.frozen = null; a.scope.pacing.frozenAt = null; a.updatedAt = Date.now();
    store.save();
    return a;
  }
  /* "4.5–4.9, 4.11" — a list of unit refs with consecutive runs folded */
  function unitRuns(refs) {
    var out = [], run = [];
    function key(r) { return /^([A-Z]?)(\d+)\.(\d+)$/.exec(r) || /^([A-Z]?)(\d+)$/.exec(r); }
    function flush() { if (run.length) out.push(run.length > 2 ? run[0].r + "–" + run[run.length - 1].r : run.map(function (x) { return x.r; }).join(", ")); run = []; }
    refs.forEach(function (r) {
      var m = key(r);
      if (!m) { flush(); out.push(r); return; }
      var x = { r: r, m: m }, prev = run[run.length - 1];
      var n = +(m[3] || m[2]), pn = prev ? +(prev.m[3] || prev.m[2]) : null;
      if (prev && prev.m[1] === m[1] && (m[3] ? prev.m[2] === m[2] : !prev.m[3]) && n === pn + 1) run.push(x);
      else { flush(); run.push(x); }
    });
    flush();
    return out.join(", ");
  }
  /* the scope summary a row and a hero print (29b): the rule or the picks,
     by unit, with what is excluded */
  function scopeSummary(a) {
    if (!a || a.tier === "deadline") return a && a.paper ? a.paper : "";
    var ls = leaves(a), units = {}, order = [];
    ls.forEach(function (k) { var p = KOS.spec.parse(k), n = p && KOS.spec.node(p.subject, p.ref); if (n && !units[n.unit]) { units[n.unit] = true; order.push(n.unit); } });
    var all2 = {};
    if (a.subject) KOS.spec.units(a.subject).forEach(function (u, i) { all2[u.ref] = i; });
    order.sort(function (x, y) { return (all2[x] || 0) - (all2[y] || 0); });
    var ex = excluded(a).map(function (x) { return x.ref; });
    var head = a.scope.pacing ? (a.scope.pacing.frozen ? "Covered in Pacing (fixed)" : "Covered in Pacing so far") : null;
    var pr = presetOf(a), named = !head && pr && a.scope.include.length === pr.include.length && a.scope.include.every(function (k) { return pr.include.indexOf(k) !== -1; })
      ? (pr.include.map(function (k) { return k.split(":")[1]; }).join(", ")) : null;
    var parts = [head || named, order.length ? unitRuns(order) : null].filter(Boolean);
    if (named && order.length) parts = [named + " · " + unitRuns(order)];
    return (parts.join(" · ") || "No topics yet") + (ls.length ? " · " + ls.length + (ls.length === 1 ? " leaf" : " leaves") : "") + (ex.length ? " · excl. " + ex.join(", ") : "");
  }

  /* ---------------- notices (29w: the bell's Exams filter) ----------------
     Pure: what should be announced now, one notice each by id (the
     ledger refuses a repeat). A start-by that is today, a milestone that
     has gone overdue, a topic test or quiz tomorrow, and exam season
     turning on. tick() hands them to KOS.notify.push. */
  function notices(from) {
    var now = from || today(), out = [];
    upcoming(now).forEach(function (a) {
      var sb = startBy(a, now);
      if (sb && sb.date === now && a.tier !== "retrieval_test") out.push({ id: "exam:" + a.id + ":startby:" + now, kind: "exam",
        title: "Start today: " + a.title, body: sb.override ? "Your start-by date is today." : "Its suggested start-by date is today.", view: "exams", arg: a.id });
      (a.milestones || []).forEach(function (m) {
        if (m.done || !m.date || m.date >= now || KOS.srs.daysBetween(m.date, now) > 7) return;
        out.push({ id: "exam:" + a.id + ":ms:" + m.id, kind: "exam", title: a.title + ": " + m.text + " is overdue",
          body: "It was due " + m.date + ".", view: "exams", arg: a.id });
      });
      if ((a.tier === "topic_test" || a.tier === "retrieval_test") && KOS.srs.daysBetween(now, a.date) === 1) {
        var rd = readiness(a), rc = rd && rd.signals.recall;
        out.push({ id: "exam:" + a.id + ":eve", kind: "exam", title: a.title + " tomorrow",
          body: rc && !rc.thin ? "Recall " + Math.round(100 * rc.value) + "% " + (a.tier === "retrieval_test" ? "today" : "on the day") + (rc.weakest[0] ? "; " + rc.weakest[0].title + " is the weak one." : ".") : "Tomorrow" + (a.time ? " at " + a.time : "") + ".",
          view: "exams", arg: a.id });
      }
    });
    var sn = season(now);
    if (sn.on && sn.auto && sn.next) out.push({ id: "exam:season:" + sn.key, kind: "exam", title: "Exam season is on",
      body: sn.next.title + " is " + KOS.srs.daysBetween(now, sn.next.date) + " days away.", view: "exams", arg: "season" });
    return out;
  }
  function tick() {
    if (!KOS.notify || !KOS.notify.push) return 0;
    var n = 0;
    notices().forEach(function (it) { if (KOS.notify.push(it)) n++; });
    return n;
  }

  /* ---------------- the previous attempt (§16.8) ----------------
     For an attempt with marks by question: the latest earlier one of the
     same subject whose questions share the most leaves. */
  function previousAttempt(entry) {
    if (!entry || !KOS.tracker) return null;
    var mine = {};
    (entry.questions || []).forEach(function (q) { (q.refs || []).forEach(function (k) { mine[k] = true; }); });
    var best = null, bestN = 0;
    KOS.tracker.all().forEach(function (e) {
      if (e.uid === entry.uid || e.subject !== entry.subject || !(e.date < entry.date || (e.date === entry.date && e.id < entry.id))) return;
      var n = 0;
      (e.questions || []).forEach(function (q) { if (q.got != null) (q.refs || []).forEach(function (k) { if (mine[k]) n++; }); });
      if (n > bestN || (n === bestN && n > 0 && best && e.date > best.date)) { best = e; bestN = n; }
    });
    return bestN ? best : null;
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
    progress: progress,
    /* phase 3 */
    attemptsFor: attemptsFor,
    paperWeights: paperWeights,
    boundsFor: boundsFor,
    readiness: readiness,
    signalsOf: signalsOf,
    nextMarks: nextMarks,
    leafCovered: leafCovered,
    nextInPacing: nextInPacing,
    season: season,
    setSeason: setSeason,
    quieted: quieted,
    checklist: checklist,
    tickCheck: tickCheck,
    addCheck: addCheck,
    importMatch: importMatch,
    importApply: importApply,
    loadView: loadView,
    predictPass: predictPass,
    setSubjectResult: setSubjectResult,
    subjectResults: subjectResults,
    seriesOf: seriesOf,
    previousAttempt: previousAttempt,
    notices: notices,
    tick: tick,
    startedOn: startedOn,
    startState: startState,
    freezeNow: freezeNow,
    unfreeze: unfreeze,
    unitRuns: unitRuns,
    scopeSummary: scopeSummary,
    nodeOf: nodeOf
  };
})();
