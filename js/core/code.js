/* Kurenai OS — core/code.js
   The Code model (roadmap 5.3, docs/code-plan.md §5, frames 26a–26i).

   WHAT IS STORED (state.code, synced; every part a keyed map so the cloud
   merge folds two devices per key, invariant 33):
     tasks[id]    { tries, hints, seen, passAt, paid, phonePaid, lastAt }
                  passAt is the first PROVEN pass (no answer opened);
                  paid/phonePaid say what was paid, so nothing pays twice
     lessons[ref] { pages: {i: ts}, listings: {id: ts} }   evidence only
     proven[c]    { at, by, id, grade }   the last proof of a concept
     cards[id]    { due, ivl, s, d, fl, reps, lapses, last, n, grade }   retrieval (FSRS;
                  ef only on a card from before the switch, read to convert)
     practice[k]  ts   a Practice item answered right (proves, never pays)
     later[id]    { kind, ref, at }   "Save for the computer"
   Per device (state.ui.code): the task panel collapsed, phone choices and
   unsaved drafts.

   WHAT IS DERIVED, never stored: a lesson's four checks (they are written
   to the shared progress record so every Study surface reads them, but
   only from evidence — invariant: status comes from evidence), the day's
   plan (seeded by the date, invariant: the computed plan), retrieval
   grades (from tries, hints and time, never self-reported), the skill
   map's bands, and every figure on the desk.

   WHAT PAYS (award(), the one definition the Governor calls):
     a task's first proven pass   warm-up 12 XP 1 gold · core 18/2 ·
                                  stretch 26/3, and +3 HP. On a phone,
                                  half the XP and gold and +1 HP; passing
                                  it later on a computer pays the rest.
     a retrieval proven           +4 XP, at most 10 a day; past the cap it
                                  still counts on the schedule.
   A re-run, a pass after "See the answer", a failed card and lesson
   practice pay nothing. HP gates nothing (invariant 2).                   */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;

  var SID = "code";
  var PAY = { "warm-up": { xp: 12, gold: 1 }, core: { xp: 18, gold: 2 }, stretch: { xp: 26, gold: 3 } };
  var TASK_HP = 3, PHONE_HP = 1, CARD_XP = 4, CARD_CAP = 10;
  var CHECKS = ["Read the notes", "Ran the listings", "Passed a task", "Proven in retrieval"];
  var DAY = 864e5;

  function K() { return window.KOS_CODE || { CONCEPTS: {}, TASKS: {}, CARDS: {}, STAGES: [], ERRORS: {} }; }
  function today() { return KOS.srs.todayISO(); }
  function addDays(iso, n) { return KOS.srs.addDays(iso, n); }
  function isoOf(ts) { var d = new Date(ts); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function daysBetween(aIso, bIso) { return Math.round((Date.parse(bIso + "T12:00:00") - Date.parse(aIso + "T12:00:00")) / DAY); }

  /* ---------------- the gate ---------------- */
  function obj(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
  function normalise(c) {
    c = obj(c);
    return {
      v: 1,
      tasks: obj(c.tasks), lessons: obj(c.lessons), proven: obj(c.proven),
      cards: obj(c.cards), practice: obj(c.practice), later: obj(c.later), capstones: obj(c.capstones),
      projects: obj(c.projects), katas: obj(c.katas), github: obj(c.github)
    };
  }
  function S() {
    var st = store.state;
    if (!st.code || st.code.v !== 1 || !st.code.tasks) st.code = normalise(st.code);
    if (!st.code.capstones) st.code.capstones = {};
    if (!st.code.projects) st.code.projects = {};
    if (!st.code.katas) st.code.katas = {};
    return st.code;
  }
  function U() {
    var ui = store.state.ui;
    if (!ui.code || typeof ui.code !== "object") ui.code = {};
    if (!ui.code.drafts || typeof ui.code.drafts !== "object") ui.code.drafts = {};
    return ui.code;
  }

  /* ---------------- the curriculum, read ---------------- */
  var LESSONS = null, BY = null;
  function index() {
    if (LESSONS) return;
    LESSONS = []; BY = {};
    var data = window.KOS_DATA && window.KOS_DATA.code;
    ((data && data.sections) || []).forEach(function (sec, ui) {
      (sec.children || []).forEach(function (l) {
        var row = { ref: l.ref, title: l.title, aim: (l.content || [])[0] || "", unit: sec.ref, unitIdx: ui,
          unitTitle: sec.title, stage: sec.stage, strands: sec.strands || [], where: sec.where, track: sec.track || null, db: sec.db || null, idx: LESSONS.length };
        LESSONS.push(row); BY[l.ref] = row;
      });
    });
  }
  function lessons() { index(); return LESSONS; }
  /* the core path only (units 1–12 and Bridge B): what the desk's units,
     the stage path and the lesson counts read; a track's parts are in the
     spine too (docs/code-plan.md §3.3), read by the Study spine, search,
     retrieval and the Daily 20 once covered */
  function coreLessons() { return lessons().filter(function (l) { return !l.track; }); }
  function lesson(ref) { index(); return BY[ref] || null; }
  /* which runner a lesson's code needs: the full .NET runtime for the
     "sandbox" units (7–9, 11, 12; decision A, and unit 12 since its lists, trees and graphs are classes), the in-app interpreter otherwise */
  function runnerFor(ref) {
    var l = lesson(ref) || (K().CAPSTONES[ref] ? { where: K().CAPSTONES[ref].where } : null);
    return l && l.where === "sandbox" ? "wasm" : l && l.where === "sql" ? "sql" : "interp";
  }
  /* an SQL lesson's dataset: the item's own db, else its part's */
  function datasetFor(ref, db) {
    var D = K().DATASETS || {}, l = lesson(ref);
    var name = db || (l && l.db) || null;
    return name && D[name] != null ? D[name] : "";
  }
  /* the file a learner's code is written in: query.sql for an SQL lesson */
  function fileFor(ref) { return runnerFor(ref) === "sql" ? "query.sql" : "Program.cs"; }
  /* a unit's or part's name in words: Unit 7 · Bridge B · T1 Databases */
  function unitName(ref) {
    var u = unit(ref);
    if (ref === "B") return "Bridge B";
    if (u && u.track) return u.track + " " + u.title;
    return "Unit " + String(ref).slice(1);
  }
  function units() { return ((window.KOS_DATA && window.KOS_DATA.code && window.KOS_DATA.code.sections) || []); }
  function coreUnits() { return units().filter(function (u) { return !u.track; }); }
  function unit(ref) { return units().filter(function (u) { return u.ref === ref; })[0] || null; }
  function content(ref) { return KOS.content.get(SID, ref); }
  function hasLesson(ref) { var c = content(ref); return !!(c && c.notes && c.notes.length); }
  function tasksOf(ref) {
    var T = K().TASKS;
    return Object.keys(T).map(function (id) { return T[id]; }).filter(function (t) { return t.lesson === ref; });
  }
  function task(id) { return K().TASKS[id] || null; }
  function card(id) { return K().CARDS[id] || null; }
  function concept(id) { return K().CONCEPTS[id] || null; }
  function conceptsOf(ref) {
    var C = K().CONCEPTS;
    return Object.keys(C).map(function (id) { return C[id]; }).filter(function (c) { return c.lesson === ref; });
  }
  function allTasks() { var T = K().TASKS; return Object.keys(T).map(function (id) { return T[id]; }); }
  function allCards() { var C = K().CARDS; return Object.keys(C).map(function (id) { return C[id]; }); }
  function practiceOf(ref) {
    var c = content(ref) || {};
    var p = c.practice || {};
    return { predict: p.predict || [], fill: p.fill || [], bug: p.bug || [] };
  }
  /* every runnable listing in a lesson's notes */
  function listingsOf(ref) {
    var c = shipped(ref);
    var out = [];
    (function walk(blocks) {
      (blocks || []).forEach(function (b) {
        if (!b || typeof b !== "object") return;
        if (b.run) out.push(b.run);
        if (b.callout && Array.isArray(b.callout.body)) walk(b.callout.body);
      });
    })(c && c.notes);
    return out;
  }

  /* ---------------- evidence → the four checks ---------------- */
  function lessonEv(ref) {
    var L = S().lessons;
    var e = L[ref] = obj(L[ref]);
    e.pages = obj(e.pages); e.listings = obj(e.listings);
    return e;
  }
  function peekEv(ref) { var e = S().lessons[ref]; return { pages: obj(e && e.pages), listings: obj(e && e.listings) }; }
  /* the SHIPPED lesson's pages: a quick note files a "Your notes" page into
     the user's fork, and that must never move the reading target (it made
     "8 of 10" become "8 of 11" and took a tick away) */
  function shipped(ref) { return (window.KOS_CONTENT || {})["code:" + ref] || null; }
  function pageCount(ref) {
    var c = shipped(ref);
    return c && c.notes ? KOS.content.splitPages(c.notes).length : 0;
  }
  function provenPass(t) { var s = S().tasks[t.id]; return !!(s && s.passAt); }
  function evidence(ref) {
    var ev = peekEv(ref);
    var pages = pageCount(ref), read = Object.keys(ev.pages).filter(function (i) { return +i < pages; }).length;
    var lst = listingsOf(ref), ran = lst.filter(function (l) { return ev.listings[l.id]; }).length;
    var ts = tasksOf(ref), passed = ts.filter(provenPass).length;
    /* a Rider lesson's work is a project milestone, proven by a report */
    var pm = projectMilestonesOf(ref), pmPassed = pm.filter(function (x) { return peekProj(x.project).passed[x.id]; }).length;
    passed += pmPassed;
    var cs = conceptsOf(ref);
    var byRetrieval = cs.filter(function (c) { var p = S().proven[c.id]; return p && p.by === "retrieval"; }).length;
    /* a tick means DONE: every page read, every listing run */
    var readOk = pages > 0 && read >= pages;
    var checks = [
      readOk,
      lst.length ? ran >= lst.length : readOk,
      passed > 0,
      byRetrieval > 0
    ];
    var pr = practiceOf(ref), pIds = pr.predict.concat(pr.fill, pr.bug).map(function (it) { return ref + ":" + it.id; });
    return { pages: pages, read: read, listings: lst.length, ran: ran, tasks: ts.length + pm.length, passed: passed,
      practice: pIds.length, practised: pIds.filter(function (k) { return S().practice[k]; }).length,
      concepts: cs.length, proven: cs.filter(function (c) { return S().proven[c.id]; }).length, checks: checks };
  }
  /* write the derived checks into the shared progress record, only when
     they changed — every Study surface (spine bars, rail %, the ring)
     then reads the same numbers (invariant 26d) */
  function syncChecks(ref) {
    if (!lesson(ref)) return;
    var want = evidence(ref).checks;
    var p = store.peekProgress(SID, ref);
    var have = p ? p.check : [false, false, false, false];
    for (var i = 0; i < 4; i++) if (!!have[i] !== !!want[i]) store.setCheck(SID, ref, i, want[i]);
    /* a lesson is under way once it has earned a check or a task has been
       tried — opening a page to look is not progress (16 October 2026) */
    var q = store.peekProgress(SID, ref);
    if ((!q || q.status === "none") && (want.some(Boolean) || tried(ref))) store.setStatus(SID, ref, "started");
  }
  function markPage(ref, i) {
    if (!lesson(ref)) return;
    var e = lessonEv(ref);
    if (e.pages[i]) return;
    e.pages[i] = Date.now();
    store.save();
    syncChecks(ref);
  }
  function markListing(ref, id) {
    if (!lesson(ref) || !id) return;
    var e = lessonEv(ref);
    if (e.listings[id]) return;
    e.listings[id] = Date.now();
    store.save();
    syncChecks(ref);
  }

  /* ---------------- concepts and the skill map ---------------- */
  function prove(ids, by, id, grade) {
    var now = Date.now(), st = S();
    (ids || []).forEach(function (c) {
      if (!concept(c)) return;
      var first = !st.proven[c];
      st.proven[c] = { at: now, by: by, id: id || null, grade: grade || null };
      /* a skill's retrieval schedule starts at its first proof */
      if (first) allCards().forEach(function (cd) {
        if ((cd.concepts || []).indexOf(c) === -1 || st.cards[cd.id]) return;
        st.cards[cd.id] = { due: addDays(today(), 2), ivl: 2, ef: 2.5, reps: 0, lapses: 0, last: null, n: 1, grade: null };
      });
    });
  }
  /* COVERED: the lesson's first two checks are earned (every page read,
     every listing run) or its work has passed. Only a covered lesson feeds
     the Daily 20, the frontier and the skill map's "not proven" — a page
     glanced at is not study (16 October 2026) */
  function studied(ref) {
    var ev = evidence(ref);
    return (ev.checks[0] && ev.checks[1]) || ev.passed > 0;
  }
  function tried(ref) {
    return tasksOf(ref).some(function (t) { var r = S().tasks[t.id]; return r && (r.tries || r.passAt); });
  }
  /* one pass per device: the rule above used to call any evidence "Started",
     so a lesson only looked at was marked under way. Put back the ones
     that earned no check and tried no task. */
  function repairStarted() {
    var ui = U();
    if (ui.startedRepair) return 0;
    var n = 0;
    lessons().forEach(function (l) {
      var p = store.peekProgress(SID, l.ref);
      if (!p || p.status !== "started") return;
      if (evidence(l.ref).checks.some(Boolean) || tried(l.ref)) return;
      store.setStatus(SID, l.ref, "none"); n++;
    });
    ui.startedRepair = Date.now();
    store.save();
    return n;
  }
  /* a concept's age band (frame 26·kit): ≤7 · 8–21 · 22–40 · 41+ ·
     studied but not proven · later (its lesson not started) */
  function band(days) { return days == null ? null : days <= 7 ? "b0" : days <= 21 ? "b1" : days <= 40 ? "b2" : "b3"; }
  function skill(id, memo) {
    var c = concept(id);
    if (!c) return null;
    var p = S().proven[id];
    var days = p ? Math.max(0, daysBetween(isoOf(p.at), today())) : null;
    return { id: id, name: c.name, lesson: c.lesson, unit: lesson(c.lesson) ? lesson(c.lesson).unit : null,
      strands: c.strands || (lesson(c.lesson) ? lesson(c.lesson).strands : []),
      proven: p || null, days: days,
      band: p ? band(days) : (memo ? (c.lesson in memo ? memo[c.lesson] : (memo[c.lesson] = studied(c.lesson))) : studied(c.lesson)) ? "np" : "later" };
  }
  function skills() {
    var C = K().CONCEPTS;
    var order = {};
    lessons().forEach(function (l, i) { order[l.ref] = i; });
    var memo = {};
    return Object.keys(C).map(function (id) { return skill(id, memo); }).filter(Boolean).sort(function (a, b) {
      return (order[a.lesson] || 0) - (order[b.lesson] || 0);
    });
  }
  /* what last proved a concept, newest first, from the session ledger */
  function proofsOf(id, n) {
    return KOS.sessions.all().filter(function (e) {
      return e.type === "code" && e.metrics && e.metrics.proved && e.metrics.proved.indexOf(id) !== -1;
    }).sort(function (a, b) { return b.ts - a.ts; }).slice(0, n || 3);
  }

  /* ---------------- tasks ---------------- */
  function taskState(id) {
    var s = S().tasks[id];
    return s ? { tries: s.tries || 0, hints: s.hints || 0, seen: s.seen || null, passAt: s.passAt || null,
      paid: !!s.paid, phonePaid: !!s.phonePaid, lastAt: s.lastAt || null, practisedAt: s.practisedAt || null }
      : { tries: 0, hints: 0, seen: null, passAt: null, paid: false, phonePaid: false, lastAt: null, practisedAt: null };
  }
  function taskRec(id) { var T = S().tasks; return T[id] = obj(T[id]); }
  function openHint(id) {
    var r = taskRec(id), t = task(id), max = t && t.hints ? t.hints.length : 3;
    r.hints = Math.min(max, (r.hints || 0) + 1);
    store.save();
    return r.hints;
  }
  function seeAnswer(id) {
    var r = taskRec(id);
    if (!r.seen) r.seen = Date.now();
    store.save();
  }
  /* the pay a task's pass is worth on this device now, before it happens:
     { pay: {xp, gold, hp}|null, why } — the same rule onSession pays by */
  function quote(id, phone) {
    var t = task(id), s = taskState(id);
    if (!t) return { pay: null, why: "not a task" };
    var full = PAY[t.tier] || PAY.core;
    if (s.paid) return { pay: null, why: "already passed", at: s.passAt };
    if (s.seen && !s.passAt) return { pay: null, why: "answer opened", at: s.seen };
    if (phone) {
      if (s.phonePaid) return { pay: null, why: "already passed on a phone", at: s.passAt };
      return { pay: { xp: Math.floor(full.xp / 2), gold: Math.floor(full.gold / 2), hp: PHONE_HP }, phone: true };
    }
    if (s.phonePaid) return { pay: { xp: full.xp - Math.floor(full.xp / 2), gold: full.gold - Math.floor(full.gold / 2), hp: TASK_HP - PHONE_HP }, topup: true };
    return { pay: { xp: full.xp, gold: full.gold, hp: TASK_HP } };
  }
  /* a Check finished: record it, prove, pay once. → { passed, paid, pay, why, at } */
  function recordCheck(id, result, opts) {
    opts = opts || {};
    var t = task(id);
    if (!t) return null;
    var r = taskRec(id);
    r.tries = (r.tries || 0) + 1;
    r.lastAt = Date.now();
    var out = { passed: !!result.passed, paid: false, pay: null, why: null, at: null };
    if (!result.passed) { store.save(); return out; }
    var q = quote(id, !!opts.phone);
    if (q.pay) {
      if (!r.passAt) r.passAt = Date.now();
      if (q.phone) r.phonePaid = true; else r.paid = true;
      prove(t.concepts, "task", id);
      KOS.sessions.log({ type: "code", subject: SID, ref: t.lesson, refs: [SID + ":" + t.lesson],
        metrics: { kind: "task", id: id, tier: t.tier, phone: !!q.phone, topup: !!q.topup, proved: (t.concepts || []).slice() } });
      out.paid = true; out.pay = q.pay; out.phone = !!q.phone;
      syncChecks(t.lesson);
      return out;
    }
    out.why = q.why; out.at = q.at;
    /* a pass with the answer opened is practice: logged once a day as
       activity, the skills read "studied, not proven" (frame 26f2 ⑨) */
    if (q.why === "answer opened" && (!r.practisedAt || isoOf(r.practisedAt) !== today())) {
      r.practisedAt = Date.now();
      KOS.sessions.log({ type: "code", subject: SID, ref: t.lesson, metrics: { kind: "task", id: id, seen: true } });
    }
    store.save();
    return out;
  }
  /* award(metrics) — what a ledger entry pays (the Governor's one call) */
  function award(m) {
    m = m || {};
    if (m.kind === "task" && !m.seen && task(m.id)) {
      var full = PAY[task(m.id).tier] || PAY.core;
      if (m.phone) return { xp: Math.floor(full.xp / 2), gold: Math.floor(full.gold / 2), hp: PHONE_HP };
      if (m.topup) return { xp: full.xp - Math.floor(full.xp / 2), gold: full.gold - Math.floor(full.gold / 2), hp: TASK_HP - PHONE_HP };
      return { xp: full.xp, gold: full.gold, hp: TASK_HP };
    }
    if (m.kind === "retrieval" && m.paid) return { xp: CARD_XP, gold: 0, hp: 0 };
    if (m.kind === "project" && m.first && project(m.id) && project(m.id).reward) {
      var pw = project(m.id).reward;
      return { xp: pw.xp || 0, gold: pw.gold || 0, hp: pw.hp || 0 };
    }
    if (m.kind === "capstone" && m.first && capstone(m.id) && capstone(m.id).reward) {
      var rw = capstone(m.id).reward;
      return { xp: rw.xp || 0, gold: rw.gold || 0, hp: rw.hp || 0 };
    }
    return { xp: 0, gold: 0, hp: 0 };
  }

  /* ---------------- capstones (frame 26l) ----------------
     Six steps, all open: quiz · brief & build · rubric · review ·
     write-up · result. The record (synced, keyed by capstone id) holds
     facts only — the quiz's answers, each milestone's last run, the
     self-marked rubric, the review, the write-up and the pass. The build's
     source is a per-device draft like a task's ("cap:<id>"). */
  /* the brief lives inside the build's workspace (review: no turning back
     and forth), so 26l's seven steps are six here */
  var CAP_STEPS = [["quiz", "Closed-book quiz"], ["build", "Brief & build"], ["rubric", "Rubric"],
    ["review", "Kurenai review"], ["writeup", "Write-up"], ["result", "Result"]];
  /* a written capstone: acceptance cases in the app (C1–C3), or a Rider
     project whose validator milestones are its build (C4, `project`) */
  function capstone(id) { var c = K().CAPSTONES[id]; return c && (c.milestones || (c.project && project(c.project))) ? c : null; }
  function capRec(id) { var C = S().capstones; return C[id] = obj(C[id]); }
  function peekCap(id) { return obj(S().capstones[id]); }
  function words(t) { return (String(t || "").match(/[A-Za-z0-9\u00C0-\u024F'’-]+/g) || []).length; }
  function capCases(id) { var c = capstone(id); return c && c.milestones ? c.milestones.reduce(function (a, m) { return a + m.cases.length; }, 0) : 0; }
  /* the quiz: answered once at a time (it can be retaken); under 3 of 5
     recommends the lessons of the first two misses and still opens */
  function answerQuiz(id, answers) {
    var c = capstone(id); if (!c) return null;
    var score = 0, missed = [];
    c.quiz.forEach(function (q, i) { if (answers[i] === q.ans) score++; else missed.push(i); });
    var r = capRec(id);
    r.quiz = { answers: answers.slice(0, c.quiz.length), score: score, at: Date.now() };
    store.save();
    return quizView(id);
  }
  function quizView(id) {
    var c = capstone(id), q = peekCap(id).quiz;
    if (!c || !q) return null;
    var missed = c.quiz.map(function (x, i) { return q.answers[i] === x.ans ? null : i; }).filter(function (i) { return i !== null; });
    var recommend = q.score < 3 ? missed.slice(0, 2).map(function (i) { return c.quiz[i].lesson; }) : [];
    return { score: q.score, total: c.quiz.length, answers: q.answers, missed: missed, recommend: recommend, at: q.at };
  }
  /* one milestone's acceptance run: its pass count, kept with the time */
  function recordMilestone(id, mid, pass, total) {
    var r = capRec(id);
    r.build = obj(r.build);
    r.build[mid] = { pass: pass, total: total, at: Date.now() };
    store.save();
  }
  function buildView(id) {
    var c = capstone(id), b = obj(peekCap(id).build);
    if (!c) return null;
    var pass = 0, total = 0, done = 0;
    if (c.project) {
      /* a Rider capstone: each validator milestone counts once, passed by an
         accepted report (recordReport), never by a click */
      var pv = projectView(c.project);
      var pms = pv.milestones.map(function (m) {
        if (m.passedAt) done++;
        return { id: m.id, title: m.title, pass: m.passedAt ? 1 : 0, total: 1, run: !!(m.passedAt || m.last), done: !!m.passedAt, at: m.passedAt, state: m.state };
      });
      return { milestones: pms, pass: done, total: pms.length, done: done, all: pms.length > 0 && done === pms.length, project: c.project };
    }
    var ms = c.milestones.map(function (m) {
      var x = b[m.id], t = m.cases.length, p = x && x.total === t ? x.pass : 0;
      pass += p; total += t; if (x && p === t) done++;
      return { id: m.id, title: m.title, pass: p, total: t, run: !!x, done: !!x && p === t, at: x ? x.at : null };
    });
    return { milestones: ms, pass: pass, total: total, done: done, all: done === ms.length };
  }
  function setRubric(id, row, n) {
    var c = capstone(id); if (!c) return;
    var rw = c.rubric.filter(function (x) { return x.id === row && !x.auto; })[0]; if (!rw) return;
    var r = capRec(id); r.rubric = obj(r.rubric);
    r.rubric[row] = Math.max(0, Math.min(rw.max, Math.round(n)));
    store.save();
  }
  function rubricView(id) {
    var c = capstone(id), b = buildView(id), marks = obj(peekCap(id).rubric);
    if (!c) return null;
    var total = 0, max = 0, marked = true;
    var rows = c.rubric.map(function (rw) {
      var v = rw.auto ? Math.round(rw.max * (b.total ? b.pass / b.total : 0)) : typeof marks[rw.id] === "number" ? marks[rw.id] : null;
      if (v === null) marked = false; else total += v;
      max += rw.max;
      return { id: rw.id, title: rw.title, auto: !!rw.auto, max: rw.max, value: v, guide: rw.guide || null };
    });
    return { rows: rows, total: total, max: max, marked: marked };
  }
  function setWriteup(id, text) {
    var r = capRec(id);
    r.writeup = { text: String(text || "").slice(0, 8000), at: Date.now() };
    store.save();
  }
  /* the review: not asked · received · skipped (sending is transient) */
  function setReview(id, o) {
    var r = capRec(id);
    r.review = { state: o.state === "received" ? "received" : "skipped", text: o.state === "received" ? String(o.text || "").slice(0, 6000) : "",
      sent: o.sent || null, at: Date.now() };
    store.save();
  }
  /* where a capstone stands, step by step; ready = the pass conditions */
  function capView(id) {
    var c = capstone(id); if (!c) return null;
    var rec = peekCap(id), b = buildView(id), rb = rubricView(id), q = quizView(id);
    var wu = rec.writeup ? rec.writeup.text : "", wn = words(wu);
    var done = {
      quiz: !!q, build: b.all, rubric: rb.marked && b.all,
      review: !!(rec.review && rec.review.state), writeup: wn >= (c.writeupMin || 40), result: !!rec.passAt
    };
    var missing = [];
    if (!b.all) missing.push({ step: "build", text: (b.milestones.length - b.done) + " of " + b.milestones.length + " milestones " + (c.project ? "still to pass in a validation report" : "still failing their acceptance tests") });
    if (!rb.marked) missing.push({ step: "rubric", text: "the rubric's self-marked rows" });
    if (wn < (c.writeupMin || 40)) missing.push({ step: "writeup", text: "a write-up of at least " + (c.writeupMin || 40) + " words (" + wn + " so far)" });
    return { id: id, spec: c, steps: CAP_STEPS.map(function (s) { return { id: s[0], title: s[1], done: done[s[0]] }; }),
      quiz: q, build: b, rubric: rb, review: rec.review || null, writeup: { text: wu, words: wn, at: rec.writeup ? rec.writeup.at : null },
      ready: !missing.length, missing: missing, passAt: rec.passAt || null, paid: !!rec.paid };
  }
  /* submit at the Result step: passes once the conditions hold, and pays
     once ever (a later resubmission records nothing new) */
  function submitCapstone(id) {
    var v = capView(id); if (!v) return null;
    if (v.passAt) return { passed: true, paid: false, why: "already passed", at: v.passAt };
    if (!v.ready) return { passed: false, missing: v.missing };
    var r = capRec(id);
    r.passAt = Date.now();
    var first = !r.paid;
    r.paid = true;
    var c = v.spec, refs = [];
    lessons().forEach(function (l) { if (l.stage === c.stage) refs.push(SID + ":" + l.ref); });
    KOS.sessions.log({ type: "code", subject: SID, ref: refs.length ? refs[refs.length - 1].slice(SID.length + 1) : null,
      metrics: { kind: "capstone", id: id, first: first, rubric: v.rubric.total, max: v.rubric.max } });
    return { passed: true, paid: first, pay: first ? award({ kind: "capstone", id: id, first: true }) : null, at: r.passAt };
  }
  /* a stage's capstone on the path: passed · next (its stage is where you
     are, or done) · later */
  function capStage(id) {
    var c = K().CAPSTONES[id], rec = peekCap(id);
    if (rec.passAt) return "passed";
    var stg = (K().STAGES || []).filter(function (x) { return x.capstone === id; })[0];
    if (!stg || !capstone(id)) return "later";
    var cur = stats().current;
    var started = stg.units.some(function (u) { return unitState(u).state !== "later"; });
    return started || (cur && cur.stage === stg.id) ? "next" : "later";
  }

  /* ---------------- Rider projects (docs/code-plan.md §9, frames 26m–26n) ----------------
     The record (synced, keyed by project id) holds facts only: when this
     device first exported it, every imported report's EVIDENCE (keyed by the
     report file's SHA-256, so the same report twice changes nothing), and
     each milestone's first pass. A report never writes progress directly:
     recordReport() is the one gate (normaliseEvidence), a practice-only
     report (shipped tests changed) marks nothing, a passed milestone stays
     passed, and the project pays its reward once, when every milestone has
     passed at any evidence level. */
  function project(id) { return (K().PROJECTS || {})[id] || null; }
  function projects() { var P = K().PROJECTS || {}; return Object.keys(P).map(function (k) { return P[k]; }); }
  function projRec(id) { var P = S().projects; var r = P[id] = obj(P[id]); r.reports = obj(r.reports); r.passed = obj(r.passed); return r; }
  function peekProj(id) { var r = obj(S().projects[id]); return { exportedAt: r.exportedAt || null, reports: obj(r.reports), passed: obj(r.passed), payAt: r.payAt || null }; }
  function projectMilestonesOf(ref) {
    var out = [];
    projects().forEach(function (p) { (p.milestones || []).forEach(function (m) { if ((m.lessons || []).indexOf(ref) >= 0) out.push({ project: p.id, id: m.id }); }); });
    return out;
  }
  function noteExport(id) { var r = projRec(id); if (!r.exportedAt) { r.exportedAt = Date.now(); store.save(); } return r.exportedAt; }
  var cap = function (s, n) { s = s == null ? "" : String(s); return s.length > n ? s.slice(0, n) + "…" : s; };
  /* a checked report (KOS.codeProject.check) → the evidence record stored */
  function normaliseEvidence(rep, o) {
    o = o || {};
    var st = function (id) { return (rep.steps || []).filter(function (x) { return x && x.id === id; })[0] || null; };
    var b = st("build"), t = st("test");
    return {
      sha: String(o.sha || ""), importedAt: o.at || Date.now(), finishedAt: Date.parse(rep.finishedAt) || null,
      level: o.level === "ci" ? "ci" : "self", practice: !!o.practice, mismatched: (o.mismatched || []).slice(0, 20).map(function (x) { return cap(x, 200); }),
      sdk: cap(rep.env && rep.env.sdk, 40), os: cap(rep.env && rep.env.os, 80), arch: cap(rep.env && rep.env.arch, 20),
      validator: cap(rep.validator && rep.validator.version, 20), scaffold: (rep.project && rep.project.scaffoldVersion) | 0,
      commit: rep.source && rep.source.gitCommit ? cap(rep.source.gitCommit, 64) : null, dirty: !!(rep.source && rep.source.dirty), tree: cap(rep.source && rep.source.treeSha256, 64),
      build: b ? { ran: !!b.ran, exit: b.exit == null ? null : b.exit | 0, errors: b.errors | 0, warnings: b.warnings | 0 } : null,
      tests: t ? { ran: !!t.ran, passed: t.passed | 0, failed: t.failed | 0 } : null,
      milestones: (rep.milestones || []).map(function (m) { return { id: cap(m.id, 20), ok: !!m.ok, checks: (m.checks || []).slice(0, 12).map(function (c) { return { type: cap(c.type, 20), ok: !!c.ok, note: cap(c.note, 200) }; }) }; }),
      failures: (rep.failures || []).slice(0, 10).map(function (f) { return { what: cap(f.test || f.build || f.run || "", 200), message: cap(f.message, 300) }; })
    };
  }
  function recordReport(id, rep, o) {
    var p = project(id);
    if (!p) return { ok: false, why: "unknown project" };
    var ev = normaliseEvidence(rep, o), r = projRec(id);
    if (!ev.sha || r.reports[ev.sha]) return { ok: false, duplicate: true, at: r.reports[ev.sha] && r.reports[ev.sha].importedAt };
    r.reports[ev.sha] = ev;
    /* the newest 30 reports are kept; passes are never taken back */
    var keys = Object.keys(r.reports);
    if (keys.length > 30) keys.sort(function (a, b) { return r.reports[a].importedAt - r.reports[b].importedAt; }).slice(0, keys.length - 30).forEach(function (k) { delete r.reports[k]; });
    var newly = [];
    if (!ev.practice) ev.milestones.forEach(function (m) {
      if (m.ok && !r.passed[m.id] && p.milestones.some(function (x) { return x.id === m.id; })) { r.passed[m.id] = ev.importedAt; newly.push(m.id); }
    });
    /* a milestone passed proves its lessons' concepts, which starts their
       retrieval schedules, as a task's pass does */
    newly.forEach(function (mid) {
      var m = p.milestones.filter(function (x) { return x.id === mid; })[0];
      (m.lessons || []).forEach(function (l) { prove(conceptsOf(l).map(function (c) { return c.id; }), "project", id + ":" + mid); });
    });
    store.save();
    var refs = [];
    p.milestones.forEach(function (m) { (m.lessons || []).forEach(function (l) { if (refs.indexOf(l) < 0) refs.push(l); }); });
    refs.forEach(syncChecks);
    var all = p.milestones.every(function (m) { return r.passed[m.id]; }), pay = null;
    /* a capstone's project pays nothing of its own: the capstone pays */
    if (all && !r.payAt && p.reward) {
      r.payAt = Date.now();
      store.save();
      KOS.sessions.log({ type: "code", subject: SID, ref: refs[refs.length - 1] || null, refs: refs.map(function (l) { return SID + ":" + l; }),
        metrics: { kind: "project", id: id, first: true, level: ev.level } });
      pay = award({ kind: "project", id: id, first: true });
    }
    return { ok: true, newly: newly, all: all, pay: pay, practice: ev.practice, evidence: ev };
  }
  /* the hub's facts: each milestone's state and the level that passed it */
  function projectView(id) {
    var p = project(id);
    if (!p) return null;
    var r = peekProj(id);
    var reps = Object.keys(r.reports).map(function (k) { return r.reports[k]; }).sort(function (a, b) { return b.importedAt - a.importedAt; });
    var last = reps[0] || null;
    var ms = p.milestones.map(function (m) {
      var by = r.passed[m.id] ? reps.filter(function (e) { return !e.practice && e.milestones.some(function (x) { return x.id === m.id && x.ok; }); }).pop() || null : null;
      var cur = last ? (last.milestones.filter(function (x) { return x.id === m.id; })[0] || null) : null;
      return { id: m.id, title: m.title, passedAt: r.passed[m.id] || null, level: by ? by.level : null, last: cur, state: r.passed[m.id] ? "passed" : cur ? (cur.ok ? "passed-practice" : "failing") : "open" };
    });
    return { spec: p, exportedAt: r.exportedAt, reports: reps, last: last, milestones: ms,
      done: ms.filter(function (m) { return m.passedAt; }).length, total: ms.length, payAt: r.payAt };
  }

  /* ---------------- drafts (per device) ---------------- */
  function draft(key) { var d = U().drafts[key]; return d && typeof d.src === "string" ? d.src : null; }
  function setDraft(key, src) {
    var d = U().drafts;
    if (src == null) delete d[key];
    else d[key] = { src: String(src).slice(0, 20000), at: Date.now() };
    /* the newest 80 drafts are kept */
    var keys = Object.keys(d);
    if (keys.length > 80) keys.sort(function (a, b) { return d[a].at - d[b].at; }).slice(0, keys.length - 80).forEach(function (k) { delete d[k]; });
    store.save();
  }

  /* ---------------- retrieval ---------------- */
  function hash(s) { var x = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); } return x >>> 0; }
  function rng(seed) { var st = seed || 1; return function (k) { st ^= st << 13; st >>>= 0; st ^= st >>> 17; st ^= st << 5; st >>>= 0; return k ? st % k : st / 4294967296; }; }
  function variation(cardId, n) {
    var cd = card(cardId);
    if (!cd || typeof cd.vary !== "function") return null;
    var v = cd.vary(rng(hash(cardId + ":" + n) || 7), n);
    return Object.assign({ n: n }, v);
  }
  function cardRow(id) {
    var cd = card(id), s = S().cards[id];
    if (!cd || !s) return null;
    var p = (cd.concepts || []).map(function (c) { return S().proven[c]; }).filter(Boolean)
      .sort(function (a, b) { return b.at - a.at; })[0];
    var days = p ? Math.max(0, daysBetween(isoOf(p.at), today())) : null;
    return { id: id, title: cd.title, unit: lesson(cd.lesson) ? lesson(cd.lesson).unit : null, lesson: cd.lesson,
      due: s.due, overdue: daysBetween(s.due, today()), days: days, lapses: s.lapses || 0, grade: s.grade,
      n: s.n || 1, ivl: s.ivl || 0, reps: s.reps || 0, kind: cd.kind || "write" };
  }
  /* due today, oldest proof first, then the ones you found hard */
  function dueCards(at) {
    var t = at || today();
    return Object.keys(S().cards).map(cardRow).filter(function (r) { return r && r.due <= t; })
      .sort(function (a, b) {
        var sa = (a.days || 0) * (1 + 0.5 * a.lapses) + (a.grade === "hard" ? 5 : 0);
        var sb = (b.days || 0) * (1 + 0.5 * b.lapses) + (b.grade === "hard" ? 5 : 0);
        return sb - sa || (a.id < b.id ? -1 : 1);
      });
  }
  function nextDue() {
    var t = today();
    return Object.keys(S().cards).map(function (id) { return S().cards[id].due; })
      .filter(function (d) { return d > t; }).sort()[0] || null;
  }
  function rewardsToday() {
    var t = today();
    return KOS.sessions.all().filter(function (e) {
      return e.date === t && e.type === "code" && e.metrics && e.metrics.kind === "retrieval" && e.metrics.paid;
    }).length;
  }
  /* derived, never self-reported (frame 26h): a hint grades it Hard;
     a first-try pass with no hint is Easy inside 3 minutes, Good after */
  function grade(o) {
    if (!o.passed) return "again";
    if (o.hint || o.tries >= 3) return "hard";
    if (o.tries === 1 && (o.secs || 0) <= 180) return "easy";
    return "good";
  }
  /* the schedule is FSRS (roadmap 5.6): the same core as the flashcards,
     the derived grade as its 1–4. An Again waits the forget interval
     rather than staying due today, because no session requeues a Code
     card. A card from before the switch converts from its ease and
     interval (KOS.fsrs.recordMemory), so its due date never moved. */
  var GRADE_NUM = { again: 1, hard: 2, good: 3, easy: 4 };
  function r4(v) { return Math.round(v * 1e4) / 1e4; }
  function schedule(s, g, id) {
    var t = today();
    var before = KOS.fsrs.recordMemory(s, KOS.srs.weights());
    var el = s.last ? Math.max(0, daysBetween(s.last, t)) : 0;
    var nx = KOS.fsrs.schedule(before, GRADE_NUM[g], el, { retention: KOS.srs.retention(), seed: "code:" + id + "|" + t, w: KOS.srs.weights() });
    if (g === "again") { s.lapses = (s.lapses || 0) + 1; s.reps = 0; }
    else s.reps = (s.reps || 0) + 1;
    s.s = r4(nx.s); s.d = r4(nx.d); s.ivl = nx.ivl;
    s.last = t; s.fl = t; s.due = addDays(t, nx.ivl); s.grade = g;
    s.n = (s.n || 1) + 1;
    if (KOS.reviewLog && KOS.reviewLog.available()) {
      KOS.reviewLog.add({ key: "code:" + id, ts: Date.now(), day: t, g: GRADE_NUM[g], el: el,
        s0: before ? before.s : null, d0: before ? before.d : null, s1: s.s, d1: s.d, ivl: s.ivl, src: "code" });
    }
    return s;
  }
  /* the switch, persisted at boot like the flashcards' (KOS.srs.migrate) */
  function migrateCards() {
    var cards = S().cards || {}, n = 0;
    Object.keys(cards).forEach(function (id) {
      var c = cards[id];
      if (!c || !c.last || (c.s > 0 && c.d > 0 && c.fl === c.last)) return;
      var mem = KOS.fsrs.recordMemory(c, KOS.srs.weights());
      if (!mem) return;
      c.s = r4(mem.s); c.d = r4(mem.d); c.fl = c.last;
      n++;
    });
    if (n) store.save();
    return n;
  }
  /* a card answered: o = { passed, tries, hint, secs } → outcome */
  function recordCard(id, o) {
    var cd = card(id), st = S();
    if (!cd) return null;
    var s = st.cards[id] = obj(st.cards[id]);
    if (!s.due) Object.assign(s, { due: today(), ivl: 2, ef: 2.5, reps: 0, lapses: 0, n: 1 });
    var g = grade(o);
    schedule(s, g, id);
    var paid = false, capped = false;
    if (g !== "again") {
      if (rewardsToday() < CARD_CAP) paid = true; else capped = true;
      prove(cd.concepts, "retrieval", id, g);
    }
    KOS.sessions.log({ type: "code", subject: SID, ref: cd.lesson, metrics: { kind: "retrieval", id: id, grade: g,
      paid: paid, proved: g !== "again" ? (cd.concepts || []).slice() : [] } });
    (cd.concepts || []).forEach(function (c) { var c0 = concept(c); if (c0) syncChecks(c0.lesson); });
    store.save();
    return { grade: g, next: s.due, ivl: s.ivl, paid: paid, capped: capped, pay: paid ? { xp: CARD_XP, gold: 0, hp: 0 } : null,
      today: rewardsToday(), cap: CARD_CAP };
  }

  /* ---------------- lesson practice (proves, never pays) ---------------- */
  function recordPractice(ref, key, concepts) {
    var st = S();
    var k = ref + ":" + key;
    var first = !st.practice[k];
    st.practice[k] = Date.now();
    prove(concepts && concepts.length ? concepts : conceptsOf(ref).map(function (c) { return c.id; }).slice(0, 2), "practice", k);
    if (first) KOS.sessions.log({ type: "code", subject: SID, ref: ref, metrics: { kind: "practice", id: k, proved: (concepts || []).slice() } });
    store.save();
    syncChecks(ref);
    if (typeof window.CustomEvent === "function") document.dispatchEvent(new window.CustomEvent("kos:code-evidence", { detail: { ref: ref } }));
  }

  /* ---------------- katas: five quick questions against the clock ----------------
     Drawn from the practice (predict, fill the gap, find the bug) of the
     lessons already COVERED, mixed across lessons and kinds, seeded by the
     date and how many were run today so each run differs. A kata proves
     what its questions prove (lesson practice) and pays nothing. */
  var KATA_N = 5;
  function kataPool() {
    var out = [];
    lessons().forEach(function (l) {
      if (!studied(l.ref)) return;
      var p = practiceOf(l.ref);
      ["predict", "fill", "bug"].forEach(function (k) { p[k].forEach(function (it) { if (it && it.id) out.push({ ref: l.ref, kind: k, item: it }); }); });
    });
    return out;
  }
  function katasOn(day) { var K2 = S().katas; return Object.keys(K2).filter(function (k) { return isoOf(K2[k].at) === day; }).length; }
  function kataDraw(day) {
    day = day || today();
    var pool = kataPool();
    if (!pool.length) return [];
    var r = rng(hash("kata:" + day + ":" + katasOn(day)) || 7);
    /* shuffle, then take one per lesson first so a run mixes lessons */
    for (var i = pool.length - 1; i > 0; i--) { var j = r(i + 1), t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
    var pick = [], seen = {};
    pool.forEach(function (x) { if (pick.length < KATA_N && !seen[x.ref]) { seen[x.ref] = 1; pick.push(x); } });
    pool.forEach(function (x) { if (pick.length < KATA_N && pick.indexOf(x) < 0) pick.push(x); });
    return pick;
  }
  function recordKata(res) {
    var id = "k" + Date.now().toString(36);
    S().katas[id] = { at: Date.now(), right: res.right | 0, total: res.total | 0, secs: Math.max(0, res.secs | 0), refs: (res.refs || []).slice(0, KATA_N) };
    KOS.sessions.log({ type: "code", subject: SID, ref: (res.refs || [])[0], dur: Math.max(0, res.secs | 0),
      metrics: { kind: "kata", id: id, right: res.right | 0, total: res.total | 0 } });
    store.save();
    return id;
  }
  function katas() {
    var K2 = S().katas;
    return Object.keys(K2).map(function (k) { return Object.assign({ id: k }, K2[k]); }).sort(function (a, b) { return b.at - a.at; });
  }

  /* ---------------- For the computer ---------------- */
  function saveLater(kind, id, ref) {
    S().later[kind + ":" + id] = { kind: kind, id: id, ref: ref || null, at: Date.now() };
    store.save();
  }
  function dropLater(key) { delete S().later[key]; store.save(); }
  function laterList() {
    var L = S().later;
    return Object.keys(L).map(function (k) { return Object.assign({ key: k }, L[k]); })
      .sort(function (a, b) { return b.at - a.at; });
  }
  function isLater(kind, id) { return !!S().later[kind + ":" + id]; }

  /* ---------------- the day's plan (computed, never stored) ---------------- */
  /* frontier = concepts of studied lessons not yet proven. A task is
     eligible when it was not passed BEFORE today (so the pick holds all
     day, and reads Done once passed), its lesson has content, and it
     practises something; it scores 3 per frontier concept, +2 for the
     wanted tier, +2 when it mixes an earlier unit. Ties break by a hash of
     the date, so the plan is the same on every device. */
  function planDay(at) {
    var day = at || today();
    var st = S();
    var passedBefore = function (t) { var s = st.tasks[t.id]; return !!(s && s.passAt && isoOf(s.passAt) < day); };
    var frontier = {};
    lessons().forEach(function (l) {
      if (!studied(l.ref)) return;
      conceptsOf(l.ref).forEach(function (c) { if (!st.proven[c.id] || isoOf(st.proven[c.id].at) >= day) frontier[c.id] = true; });
    });
    var recent = allTasks().filter(function (t) { var s = st.tasks[t.id]; return s && s.passAt; })
      .sort(function (a, b) { return st.tasks[b.id].passAt - st.tasks[a.id].passAt; }).slice(0, 3);
    var tierWant = recent.length >= 3 && recent.every(function (t) { return !st.tasks[t.id].hints; }) ? "stretch"
      : recent.length ? "core" : "warm-up";
    var order = {};
    lessons().forEach(function (l, i) { order[l.ref] = i; });
    var cands = allTasks().filter(function (t) { return lesson(t.lesson) && !passedBefore(t) && !t.retrievalOnly; });
    /* only what has been covered: a lesson read and run through, never one
       ahead of where the learner is */
    var pool = cands.filter(function (t) { return studied(t.lesson); });
    if (!pool.length) {
      var next = lessons().filter(function (l) { return !studied(l.ref) && hasLesson(l.ref); })[0] || null;
      return { task: null, lesson: next, done: false, review: false,
        why: next ? "The Daily 20 practises lessons you've covered. Read every page of " + next.ref + " and run its listings to unlock it." : "" };
    }
    var seed = hash(day);
    var best = pool.map(function (t) {
      var fr = (t.concepts || []).filter(function (c) { return frontier[c]; }).length;
      var unitIdx = lesson(t.lesson).unitIdx;
      var mixes = (t.requires || []).some(function (c) { var cc = concept(c); return cc && lesson(cc.lesson) && lesson(cc.lesson).unitIdx < unitIdx; });
      var score = 3 * fr + (t.tier === tierWant ? 2 : 0) + (mixes ? 2 : 0) - order[t.lesson] * 0.01;
      return { t: t, score: score, fr: fr, tie: hash(seed + ":" + t.id) };
    }).sort(function (a, b) { return b.score - a.score || a.tie - b.tie; })[0];
    var t = best.t, s = st.tasks[t.id];
    var why;
    var c0 = (t.concepts || []).map(concept).filter(Boolean)[0];
    if (best.fr) why = "You studied " + t.lesson + " and haven't proven " + (c0 ? c0.name : "it") + " in code yet.";
    else why = "Practice for " + t.lesson + ", the newest lesson you studied.";
    return { task: t, why: why, done: !!(s && s.passAt && isoOf(s.passAt) === day), tier: t.tier,
      minutes: t.minutes || 20, review: reviewWeek(day) };
  }
  /* every fourth week draws from earlier units — once there are units to
     review (three started) */
  function reviewWeek(day) {
    var started = {};
    lessons().forEach(function (l) { if (studied(l.ref)) started[l.unit] = true; });
    if (Object.keys(started).length < 3) return false;
    var d = new Date(day + "T12:00:00");
    var wk = Math.floor((d - new Date(d.getFullYear(), 0, 1)) / (7 * DAY));
    return wk % 4 === 3;
  }

  /* ---------------- the desk's figures ---------------- */
  function stats() {
    var ls = coreLessons();
    var done = 0, touched = 0;
    var strand = { L: [0, 0], E: [0, 0], S: [0, 0] };
    ls.forEach(function (l) {
      var p = store.peekProgress(SID, l.ref);
      var pct = !p ? 0 : p.status === "done" ? 100 : p.check.filter(Boolean).length * 25;
      if (p && p.status === "done") done++;
      if (p && p.status && p.status !== "none") touched++;
      (l.strands || []).forEach(function (k) { if (strand[k]) { strand[k][0] += pct; strand[k][1]++; } });
    });
    var st = S();
    var attempted = Object.keys(st.tasks).filter(function (id) { return task(id) && (st.tasks[id].tries || 0) > 0; });
    var passed = attempted.filter(function (id) { return st.tasks[id].passAt; });
    var current = ls.filter(function (l) { var p = store.peekProgress(SID, l.ref); return !p || p.status !== "done"; })[0] || ls[ls.length - 1];
    return {
      lessons: ls.length, done: done, touched: touched,
      strands: { L: strand.L[1] ? Math.round(strand.L[0] / strand.L[1]) : 0,
                 E: strand.E[1] ? Math.round(strand.E[0] / strand.E[1]) : 0,
                 S: strand.S[1] ? Math.round(strand.S[0] / strand.S[1]) : 0 },
      tasksPassed: passed.length, tasksTried: attempted.length,
      skillsProven: Object.keys(st.proven).filter(function (c) { return concept(c); }).length,
      due: dueCards().length,
      current: current || null,
      capstones: Object.keys(K().CAPSTONES || {}).filter(function (id) { return obj(st.capstones)[id] && st.capstones[id].passAt; }).length,
      capstonesTotal: Object.keys(K().CAPSTONES || {}).length
    };
  }
  /* a unit's stage-path state: done · current · later (dashed) */
  /* a unit is RELEASED once its lessons ship; the units after it are on
     the path but not written yet, and say so ("Coming later") */
  function released(ref) { return lessons().some(function (l) { return l.unit === ref && hasLesson(l.ref); }); }
  function unitState(ref) {
    var ls = lessons().filter(function (l) { return l.unit === ref; });
    if (!ls.length) return { state: "later", done: 0, total: 0, released: false };
    var done = ls.filter(function (l) { var p = store.peekProgress(SID, l.ref); return p && p.status === "done"; }).length;
    var any = ls.some(function (l) { return studied(l.ref); });
    var cur = stats().current;
    return { released: released(ref), state: done === ls.length ? "done" : cur && cur.unit === ref ? "current" : any ? "started" : "later",
      done: done, total: ls.length, next: ls.filter(function (l) { var p = store.peekProgress(SID, l.ref); return !p || p.status !== "done"; })[0] || null };
  }
  function firstVisit() {
    var st = S();
    return !Object.keys(st.lessons).length && !Object.keys(st.tasks).length && !Object.keys(st.proven).length;
  }

  /* phone: a phone-sized task in units 1–3 is a "phone task" at a reduced
     reward; anything else waits for a computer (docs/code-plan.md §8) */
  function isPhone() {
    return typeof window.matchMedia === "function" && window.matchMedia("(max-width: 700px)").matches;
  }
  function phoneFit(t) {
    var l = t && lesson(t.lesson);
    return !!(t && t.phone !== false && l && typeof l.stage === "number" && l.stage === 1 && U().phoneTasks !== false);
  }

  /* a COMMAND card (Bridge B): the typed answer, spaces collapsed, against
     the card's anchored patterns — checked, never self-marked */
  function commandMatches(v, text) {
    var t = String(text == null ? "" : text).replace(/\s+/g, " ").trim();
    if (!t || !v || !v.accept) return false;
    return v.accept.some(function (a) { try { return new RegExp(a, v.ci ? "i" : "").test(t); } catch (e) { return false; } });
  }
  KOS.code = {
    runnerFor: runnerFor, fileFor: fileFor, datasetFor: datasetFor, unitName: unitName, commandMatches: commandMatches,
    project: project, projects: projects, projectView: projectView, recordReport: recordReport,
    normaliseEvidence: normaliseEvidence, noteExport: noteExport, projectMilestonesOf: projectMilestonesOf,
    SID: SID, CHECKS: CHECKS, PAY: PAY, CARD_CAP: CARD_CAP,
    normalise: normalise, state: S, ui: U,
    lessons: lessons, coreLessons: coreLessons, lesson: lesson, units: units, coreUnits: coreUnits, unit: unit, unitState: unitState, released: released,
    content: content, hasLesson: hasLesson, tasksOf: tasksOf, task: task, card: card, concept: concept,
    conceptsOf: conceptsOf, allTasks: allTasks, allCards: allCards, practiceOf: practiceOf, listingsOf: listingsOf,
    evidence: evidence, syncChecks: syncChecks, markPage: markPage, markListing: markListing, studied: studied, tried: tried, repairStarted: repairStarted,
    prove: prove, skill: skill, skills: skills, proofsOf: proofsOf, band: band,
    taskState: taskState, openHint: openHint, seeAnswer: seeAnswer, quote: quote, recordCheck: recordCheck, award: award,
    draft: draft, setDraft: setDraft,
    variation: variation, cardRow: cardRow, dueCards: dueCards, nextDue: nextDue, rewardsToday: rewardsToday,
    grade: grade, recordCard: recordCard, migrateCards: migrateCards, recordPractice: recordPractice,
    saveLater: saveLater, dropLater: dropLater, laterList: laterList, isLater: isLater,
    kataPool: kataPool, kataDraw: kataDraw, recordKata: recordKata, katas: katas, KATA_N: KATA_N,
    planDay: planDay, reviewWeek: reviewWeek, stats: stats, firstVisit: firstVisit,
    isPhone: isPhone, phoneFit: phoneFit,
    CAP_STEPS: CAP_STEPS, capstone: capstone, capView: capView, capStage: capStage, answerQuiz: answerQuiz, quizView: quizView,
    recordMilestone: recordMilestone, buildView: buildView, setRubric: setRubric, rubricView: rubricView,
    setWriteup: setWriteup, setReview: setReview, submitCapstone: submitCapstone, words: words, capCases: capCases, hash: hash, rng: rng, isoOf: isoOf, daysBetween: daysBetween
  };
})();
