/* Kurenai OS — core/code.js
   The Code model (roadmap 5.3, docs/code-plan.md §5, frames 26a–26i).

   WHAT IS STORED (state.code, synced; every part a keyed map so the cloud
   merge folds two devices per key, invariant 33):
     tasks[id]    { tries, hints, seen, passAt, paid, phonePaid, lastAt }
                  passAt is the first PROVEN pass (no answer opened);
                  paid/phonePaid say what was paid, so nothing pays twice
     lessons[ref] { pages: {i: ts}, listings: {id: ts} }   evidence only
     proven[c]    { at, by, id, grade }   the last proof of a concept
     cards[id]    { due, ivl, ef, reps, lapses, last, n, grade }   retrieval
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
      cards: obj(c.cards), practice: obj(c.practice), later: obj(c.later)
    };
  }
  function S() {
    var st = store.state;
    if (!st.code || st.code.v !== 1 || !st.code.tasks) st.code = normalise(st.code);
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
          unitTitle: sec.title, stage: sec.stage, strands: sec.strands || [], where: sec.where, idx: LESSONS.length };
        LESSONS.push(row); BY[l.ref] = row;
      });
    });
  }
  function lessons() { index(); return LESSONS; }
  function lesson(ref) { index(); return BY[ref] || null; }
  function units() { return ((window.KOS_DATA && window.KOS_DATA.code && window.KOS_DATA.code.sections) || []); }
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
    return { pages: pages, read: read, listings: lst.length, ran: ran, tasks: ts.length, passed: passed,
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
    /* any evidence at all means the lesson is under way */
    var q = store.peekProgress(SID, ref);
    if ((!q || q.status === "none") && studied(ref)) store.setStatus(SID, ref, "started");
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
  function studied(ref) {
    var ev = peekEv(ref);
    return Object.keys(ev.pages).length > 0 || Object.keys(ev.listings).length > 0 ||
      tasksOf(ref).some(function (t) { return S().tasks[t.id]; });
  }
  /* a concept's age band (frame 26·kit): ≤7 · 8–21 · 22–40 · 41+ ·
     studied but not proven · later (its lesson not started) */
  function band(days) { return days == null ? null : days <= 7 ? "b0" : days <= 21 ? "b1" : days <= 40 ? "b2" : "b3"; }
  function skill(id) {
    var c = concept(id);
    if (!c) return null;
    var p = S().proven[id];
    var days = p ? Math.max(0, daysBetween(isoOf(p.at), today())) : null;
    return { id: id, name: c.name, lesson: c.lesson, unit: lesson(c.lesson) ? lesson(c.lesson).unit : null,
      strands: c.strands || (lesson(c.lesson) ? lesson(c.lesson).strands : []),
      proven: p || null, days: days,
      band: p ? band(days) : studied(c.lesson) ? "np" : "later" };
  }
  function skills() {
    var C = K().CONCEPTS;
    var order = {};
    lessons().forEach(function (l, i) { order[l.ref] = i; });
    return Object.keys(C).map(skill).filter(Boolean).sort(function (a, b) {
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
    return { xp: 0, gold: 0, hp: 0 };
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
  function schedule(s, g) {
    var ef = s.ef || 2.5, ivl = s.ivl || 2, reps = s.reps || 0;
    if (g === "again") { ivl = 1; ef = Math.max(1.3, ef - 0.2); s.lapses = (s.lapses || 0) + 1; reps = 0; }
    else if (g === "hard") { ivl = Math.max(1, Math.round(ivl * 1.2)); ef = Math.max(1.3, ef - 0.15); reps++; }
    else if (g === "good") { ivl = reps ? Math.round(ivl * ef) : Math.max(3, ivl + 1); reps++; }
    else { ivl = Math.round((reps ? ivl * ef : Math.max(4, ivl + 2)) * 1.3); ef = ef + 0.15; reps++; }
    s.ef = Math.round(ef * 100) / 100; s.ivl = ivl; s.reps = reps;
    s.last = today(); s.due = addDays(today(), ivl); s.grade = g;
    s.n = (s.n || 1) + 1;
    return s;
  }
  /* a card answered: o = { passed, tries, hint, secs } → outcome */
  function recordCard(id, o) {
    var cd = card(id), st = S();
    if (!cd) return null;
    var s = st.cards[id] = obj(st.cards[id]);
    if (!s.due) Object.assign(s, { due: today(), ivl: 2, ef: 2.5, reps: 0, lapses: 0, n: 1 });
    var g = grade(o);
    schedule(s, g);
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
    var studiedC = cands.filter(function (t) { return studied(t.lesson); });
    var pool = studiedC.length ? studiedC : cands;
    if (!pool.length) return null;
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
    if (!studiedC.length) why = "Next in the course. Read lesson " + t.lesson + " first, then try it.";
    else if (best.fr) why = "You studied " + t.lesson + " and haven't proven " + (c0 ? c0.name : "it") + " in code yet.";
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
    var ls = lessons();
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
      capstones: 0
    };
  }
  /* a unit's stage-path state: done · current · later (dashed) */
  function unitState(ref) {
    var ls = lessons().filter(function (l) { return l.unit === ref; });
    if (!ls.length) return { state: "later", done: 0, total: 0 };
    var done = ls.filter(function (l) { var p = store.peekProgress(SID, l.ref); return p && p.status === "done"; }).length;
    var any = ls.some(function (l) { return studied(l.ref); });
    var cur = stats().current;
    return { state: done === ls.length ? "done" : cur && cur.unit === ref ? "current" : any ? "started" : "later",
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

  KOS.code = {
    SID: SID, CHECKS: CHECKS, PAY: PAY, CARD_CAP: CARD_CAP,
    normalise: normalise, state: S, ui: U,
    lessons: lessons, lesson: lesson, units: units, unit: unit, unitState: unitState,
    content: content, hasLesson: hasLesson, tasksOf: tasksOf, task: task, card: card, concept: concept,
    conceptsOf: conceptsOf, allTasks: allTasks, allCards: allCards, practiceOf: practiceOf, listingsOf: listingsOf,
    evidence: evidence, syncChecks: syncChecks, markPage: markPage, markListing: markListing, studied: studied,
    prove: prove, skill: skill, skills: skills, proofsOf: proofsOf, band: band,
    taskState: taskState, openHint: openHint, seeAnswer: seeAnswer, quote: quote, recordCheck: recordCheck, award: award,
    draft: draft, setDraft: setDraft,
    variation: variation, cardRow: cardRow, dueCards: dueCards, nextDue: nextDue, rewardsToday: rewardsToday,
    grade: grade, recordCard: recordCard, recordPractice: recordPractice,
    saveLater: saveLater, dropLater: dropLater, laterList: laterList, isLater: isLater,
    planDay: planDay, reviewWeek: reviewWeek, stats: stats, firstVisit: firstVisit,
    isPhone: isPhone, phoneFit: phoneFit, hash: hash, rng: rng, isoOf: isoOf, daysBetween: daysBetween
  };
})();
