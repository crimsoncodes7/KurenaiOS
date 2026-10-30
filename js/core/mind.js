/* Kurenai OS — core/mind.js (KOS.mind)
   The Mind model (roadmap 5.9, docs/mind-plan.md revision 2, design turn 32; invariants 137–141).

   WHAT IS STORED (state.mind, synced; every part a keyed map so the cloud merge folds two devices
   per key, invariant 33):
     cards[<concept>:<i>]  a concept card's memory on KOS.fsrs (s, d, ivl, due, last, reps, lapses, g)
     lessons[id]           { pages: {i: ts}, vote: {i, at}, check: {qi: {ok, at}}, startAt, doneAt, paidAt }
     explains[lesson]      { bullets, ticks: {i: true}, at }          the lesson's one explain-back
     positions[lesson]     { versions: {vid: {at, answer, conf, reason, objection, reply, changed}},
                             retiredAt, revisit: {stage, due}, kept: {at: 1} }   never overwritten (138)
     parked[lesson]        ts — the one prompt parked with "Later" (never counted as missed)
     checkpoints[unit]     { cards, apply: {qi: ok}, synth: {bullets, ticks}, map, doneAt, paidAt }
     tensions[id]          { at, state: "done" | "later" }
     bq[week]              { q, lines: {day: text}, synth, closedAt }   the Big Question's thread
     paths[path]           { paidAt }
   Per device (state.ui.mind): the reading mode and page, a dialogue's place, the Daily 15's place,
   the Ask Kurenai queue.

   WHAT IS DERIVED, never stored: a concept's ladder (Recall · Explain · Apply · Evaluate, invariant
   137), a lesson's four checks, the Daily 15 (computed from the date and the evidence), the
   milestones, every desk figure. A render writes nothing.

   WHAT PAYS (award(), the one definition the Governor calls, type "mind"):
     a review session          +1 XP for each card passed (Hard or better), at most 15 a day
     a lesson's first finish   12 XP, 2 gold, +2 HP — once (every page read and the check passed)
     a unit checkpoint         50 XP, 12 gold, +4 HP — once
     a path complete           120 XP, 30 gold, +8 HP — once
   The Daily 15 itself is a Focus session and pays under the Focus rule (invariant 4a). Writing —
   explain-backs, positions, the Journal, dialogues, Ask Kurenai — pays nothing. HP gates nothing.  */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;

  var SID = "mind";
  var REVIEW_XP = 1, REVIEW_CAP = 15, DAILY_CARDS = 15;
  var LESSON_PAY = { xp: 12, gold: 2, hp: 2 }, CHECK_PAY = { xp: 50, gold: 12, hp: 4 }, PATH_PAY = { xp: 120, gold: 30, hp: 8 };
  var EXPLAIN_SHARE = 0.6;              // key points ticked for Explain: 3 of 4, 2 of 3
  var REVISITS = [14, 60, 180];         // a position comes back: about 2 weeks, 2 months, 6 months (§5.3)
  var RUNGS = ["Recall", "Explain", "Apply", "Evaluate"];
  var CHECKS = ["Pages read", "Check passed", "Prompt done", "First retrieval passed"];

  function M() { return window.KOS_MIND || { HEADERS: [], PATHS: [], LESSONS: {}, CONCEPTS: {}, CHECKPOINTS: {}, TENSIONS: [], ORDER: [] }; }
  function today() { return KOS.srs.todayISO(); }
  function days(a, b) { return KOS.srs.daysBetween(a, b); }
  function addDays(d, n) { var x = new Date(d + "T12:00:00"); x.setDate(x.getDate() + n); return x.getFullYear() + "-" + ("0" + (x.getMonth() + 1)).slice(-2) + "-" + ("0" + x.getDate()).slice(-2); }
  function obj(v) { return v && typeof v === "object" && !Array.isArray(v) ? v : {}; }
  function rid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

  /* ---------------- the gate ---------------- */
  var PARTS = ["cards", "lessons", "explains", "positions", "parked", "checkpoints", "tensions", "bq", "paths"];
  function normalise(m) {
    m = obj(m);
    var out = { v: 1 };
    PARTS.forEach(function (k) { out[k] = obj(m[k]); });
    return out;
  }
  function S() {
    var st = store.state;
    if (!st.mind || st.mind.v !== 1 || PARTS.some(function (k) { return !st.mind[k] || typeof st.mind[k] !== "object"; })) st.mind = normalise(st.mind);
    return st.mind;
  }
  /* a read never writes: callers that only look use peek() */
  function peek() { var m = store.state.mind; return m && m.v === 1 && PARTS.every(function (k) { return m[k] && typeof m[k] === "object"; }) ? m : normalise(m); }
  function U() {
    var ui = store.state.ui;
    if (!ui.mind || typeof ui.mind !== "object") ui.mind = {};
    return ui.mind;
  }
  function peekU() { var ui = store.state.ui; return ui.mind && typeof ui.mind === "object" ? ui.mind : {}; }

  /* ---------------- the curriculum, read ---------------- */
  function concept(id) { return M().CONCEPTS[id] || null; }
  function lesson(id) { return M().LESSONS[id] || null; }
  function content(id) { return lesson(id); }
  function pathOf(unitId) { var out = null; M().PATHS.forEach(function (p) { p.units.forEach(function (u) { if (u.id === unitId) out = p; }); }); return out; }
  function unit(unitId) { var p = pathOf(unitId); return p ? p.units.filter(function (u) { return u.id === unitId; })[0] : null; }
  function unitLessons(unitId) { return M().released ? M().released(unitId).map(lesson) : []; }
  /* every released lesson, in path order */
  function lessons() {
    var out = [];
    M().PATHS.forEach(function (p) { p.units.forEach(function (u) { unitLessons(u.id).forEach(function (l) { out.push(l); }); }); });
    return out;
  }
  function concepts() { return Object.keys(M().CONCEPTS).map(concept); }
  function cardKeys(cid) { var c = concept(cid); return c && c.cards ? c.cards.map(function (_, i) { return cid + ":" + i; }) : []; }
  function cardOf(key) { var i = key.lastIndexOf(":"), c = concept(key.slice(0, i)); return c && c.cards ? { concept: c, q: c.cards[+key.slice(i + 1)][0], a: c.cards[+key.slice(i + 1)][1], kind: c.cards[+key.slice(i + 1)][2] || null } : null; }
  function pages(id) { var l = lesson(id); return l && l.pages ? l.pages : []; }
  function checkItems(id) { var l = lesson(id); return l && l.check ? l.check : []; }
  function hasPrompt(id) { var l = lesson(id); return !!(l && (l.kind === "explain" || l.kind === "contested") && l.prompt); }

  /* ---------------- evidence: reading, the vote, the check ---------------- */
  function rec(id) { var st = S(); return (st.lessons[id] = obj(st.lessons[id])); }
  function markPage(id, i) {
    var r = rec(id);
    r.pages = obj(r.pages);
    if (r.pages[i]) return false;
    r.pages[i] = Date.now();
    if (!r.startAt) r.startAt = Date.now();
    store.save(); syncChecks(id); maybeFinish(id);
    return true;
  }
  function setVote(id, i) {
    var r = rec(id);
    r.vote = { i: +i, at: Date.now() };
    if (!r.startAt) r.startAt = Date.now();
    store.save();
    return r.vote;
  }
  /* answerCheck(id, qi, choice) → { ok, why } — a wrong answer explains and carries no penalty;
     the check passes once every item has been answered right (invariant 137: from evidence only) */
  function answerCheck(id, qi, choice) {
    var item = checkItems(id)[qi]; if (!item) return null;
    var ok = +choice === item.a, r = rec(id);
    r.check = obj(r.check);
    var prev = r.check[qi];
    if (!prev || !prev.ok) r.check[qi] = { ok: ok, at: Date.now() };
    store.save(); syncChecks(id); maybeFinish(id);
    return { ok: ok, why: item.why || "" };
  }
  function checkPassed(id) {
    var items = checkItems(id), r = obj(peek().lessons[id]), c = obj(r.check);
    return items.length > 0 && items.every(function (_, qi) { return c[qi] && c[qi].ok; });
  }
  function pagesRead(id) {
    var n = pages(id).length, r = obj(peek().lessons[id]);
    return Object.keys(obj(r.pages)).filter(function (i) { return +i < n; }).length;
  }

  /* ---------------- the one written prompt (decision J) ---------------- */
  /* saveExplain(id, bullets, ticks) — the explain-back: the bullets and which key points the
     learner says they covered. The ticks are the evidence for Explain. */
  function saveExplain(id, bullets, ticks) {
    if (KOS.achievements) KOS.achievements.touch("mind");   // the Badge Wall (roadmap 5.16)
    var l = lesson(id); if (!l || l.kind !== "explain") return null;
    var st = S(), list = (bullets || []).map(function (b) { return String(b || "").trim().slice(0, 400); }).filter(Boolean).slice(0, 12);
    if (!list.length) return null;
    var tk = {};
    Object.keys(obj(ticks)).forEach(function (k) { if (ticks[k]) tk[k] = true; });
    var before = rung(l.main, "Explain");
    st.explains[id] = { bullets: list, ticks: tk, at: Date.now() };
    delete st.parked[id];
    store.save(); syncChecks(id);
    return { reached: !before && rung(l.main, "Explain"), ticked: Object.keys(tk).length, of: (concept(l.main) || {}).keyPoints ? concept(l.main).keyPoints.length : 0 };
  }
  /* takePosition(id, v) — a new version, never an overwrite (invariant 138). v = { answer, conf
     (50–99), reason, objection, reply, changed } */
  function takePosition(id, v) {
    if (KOS.achievements) KOS.achievements.touch("mind");   // the Badge Wall (roadmap 5.16)
    var l = lesson(id); if (!l || l.kind !== "contested" || !l.prompt) return null;
    v = obj(v);
    var opts = l.prompt.options || [], answer = +v.answer;
    if (!(answer >= 0 && answer < opts.length)) return null;
    var st = S(), p = st.positions[id] = obj(st.positions[id]);
    p.versions = obj(p.versions);
    var prev = latest(id), vid = rid(), t = today();
    var conf = Math.max(50, Math.min(99, Math.round(+v.conf) || 70));
    var ver = { at: Date.now(), day: t, answer: answer, conf: conf, reason: String(v.reason || "").trim().slice(0, 300),
      objection: String(v.objection || "").trim().slice(0, 400), reply: String(v.reply || "").trim().slice(0, 400) };
    if (prev) ver.changed = String(v.changed || "").trim().slice(0, 300);
    ver.n = versions(id).length + 1;
    p.versions[vid] = ver;
    delete p.retiredAt;
    p.revisit = { stage: 0, due: addDays(t, REVISITS[0]) };
    delete st.parked[id];
    store.save(); syncChecks(id);
    return { vid: vid, n: ver.n, changedAnswer: !!(prev && prev.answer !== answer) };
  }
  function versions(id) {
    var p = obj(peek().positions[id]), vs = obj(p.versions);
    return Object.keys(vs).map(function (k) { return Object.assign({ id: k }, vs[k]); }).sort(function (a, b) { return a.at - b.at; });
  }
  function latest(id) { var vs = versions(id); return vs.length ? vs[vs.length - 1] : null; }
  function position(id) {
    var l = lesson(id), vs = versions(id); if (!l || !vs.length) return null;
    var p = obj(peek().positions[id]);
    return { lesson: id, q: l.prompt.q, options: l.prompt.options, versions: vs, current: vs[vs.length - 1], retiredAt: p.retiredAt || null, revisit: p.revisit || null };
  }
  function positions() {
    return Object.keys(peek().positions).map(position).filter(Boolean).sort(function (a, b) { return b.current.at - a.current.at; });
  }
  /* a revisit answered: keep (the next stage), or retire (kept, struck, no more revisits) */
  function keepPosition(id) {
    var st = S(), p = st.positions[id]; if (!p || !latest(id)) return null;
    var t = today(), stage = ((p.revisit && p.revisit.stage) || 0) + 1;
    p.kept = obj(p.kept); p.kept[t] = 1;
    p.revisit = stage < REVISITS.length ? { stage: stage, due: addDays(t, REVISITS[stage] - REVISITS[stage - 1]) } : null;
    store.save();
    return p.revisit;
  }
  function retirePosition(id) {
    var st = S(), p = st.positions[id]; if (!p) return false;
    p.retiredAt = Date.now(); p.revisit = null; store.save(); return true;
  }
  function revisitsDue(t) {
    t = t || today();
    return positions().filter(function (p) { return !p.retiredAt && p.revisit && p.revisit.due && p.revisit.due <= t; });
  }
  function park(id) { if (!hasPrompt(id)) return false; var st = S(); if (!st.parked[id]) { st.parked[id] = Date.now(); store.save(); } return true; }
  function promptDone(id) {
    var l = lesson(id); if (!l) return false;
    if (l.kind === "explain") return !!peek().explains[id];
    if (l.kind === "contested") return versions(id).length > 0;
    return false;
  }
  function parkedList() {
    var p = peek().parked;
    return Object.keys(p).filter(function (id) { return lesson(id) && !promptDone(id); }).sort(function (a, b) { return p[a] - p[b]; });
  }

  /* ---------------- concept cards on FSRS (invariant 111) ---------------- */
  function r4(v) { return Math.round(v * 1e4) / 1e4; }
  /* introduce(cid, day) — a concept's cards join the schedule, due the next day */
  function introduce(cid, t) {
    var st = S(), added = 0;
    cardKeys(cid).forEach(function (k) {
      if (st.cards[k]) return;
      st.cards[k] = { due: addDays(t || today(), 1), reps: 0, lapses: 0, firstAt: t || today() };
      added++;
    });
    return added;
  }
  var GRADES = { again: 1, hard: 2, good: 3, easy: 4 };
  /* preview(key) → { again, hard, good, easy } days: exactly what each button would schedule */
  function preview(key) {
    var s = peek().cards[key] || { reps: 0 }, t = today(), out = {};
    Object.keys(GRADES).forEach(function (g) { out[g] = scheduleOf(s, GRADES[g], key, t).ivl; });
    return out;
  }
  function scheduleOf(s, g, key, t) {
    var before = s.reps || s.s ? KOS.fsrs.recordMemory(s, KOS.srs.weights()) : null;
    var el = s.last ? Math.max(0, days(s.last, t)) : 0;
    var nx = KOS.fsrs.schedule(before, g, el, { retention: KOS.srs.retention(), seed: "mind:" + key + "|" + t, w: KOS.srs.weights() });
    return { before: before, el: el, s: nx.s, d: nx.d, ivl: nx.ivl };
  }
  /* rateCard(key, grade 1–4) — one rating: the schedule moves, the review log gets one row */
  function rateCard(key, g) {
    g = Math.max(1, Math.min(4, Math.round(+g) || 3));
    var st = S(), s = st.cards[key]; if (!s || !cardOf(key)) return null;
    var t = today(), nx = scheduleOf(s, g, key, t);
    if (g === 1) { s.lapses = (s.lapses || 0) + 1; s.reps = 0; } else s.reps = (s.reps || 0) + 1;
    s.s = r4(nx.s); s.d = r4(nx.d); s.ivl = nx.ivl; s.g = g;
    s.last = t; s.fl = t; s.due = addDays(t, Math.max(1, nx.ivl));
    store.save();
    if (KOS.reviewLog && KOS.reviewLog.available && KOS.reviewLog.available()) {
      KOS.reviewLog.add({ key: "mind:" + key, ts: Date.now(), day: t, g: g, el: nx.el,
        s0: nx.before ? nx.before.s : null, d0: nx.before ? nx.before.d : null, s1: s.s, d1: s.d, ivl: s.ivl, src: "mind" });
    }
    syncConcept(cardOf(key).concept.id);
    return { key: key, grade: g, ivl: s.ivl, due: s.due };
  }
  /* due(t) → card keys due by t, oldest first, at most 15 (the Daily 15's cap, §5.2) */
  function due(t, all) {
    t = t || today();
    var c = peek().cards;
    var keys = Object.keys(c).filter(function (k) { return c[k].due && c[k].due <= t && cardOf(k); })
      .sort(function (a, b) { return c[a].due < c[b].due ? -1 : c[a].due > c[b].due ? 1 : a < b ? -1 : 1; });
    return all ? keys : keys.slice(0, DAILY_CARDS);
  }
  function paidToday() {
    var t = today();
    return KOS.sessions.all().reduce(function (n, e) {
      return n + (e.type === "mind" && e.date === t && e.metrics && e.metrics.kind === "reviews" && e.award ? (e.award.xp || 0) : 0);
    }, 0);
  }
  /* finishReviews(results [{key, grade}]) — a review block is ONE ledger entry (invariant 5) */
  function finishReviews(results) {
    var graded = (results || []).filter(function (r) { return r && r.grade; });
    if (!graded.length) return { passed: 0, paid: 0 };
    var passed = graded.filter(function (r) { return r.grade > 1; }).length;
    var room = Math.max(0, REVIEW_CAP - paidToday()), paid = Math.min(room, passed * REVIEW_XP);
    KOS.sessions.log({ type: "mind", subject: SID, ref: null, metrics: { kind: "reviews", cards: graded.length, passed: passed, pay: paid } });
    return { passed: passed, paid: paid, capped: paid < passed * REVIEW_XP };
  }

  /* ---------------- the ladder (invariant 137) ---------------- */
  /* evidence for one concept, read: each rung names what holds it */
  function ladder(cid) {
    var c = concept(cid), st = peek();
    if (!c) return null;
    var keys = cardKeys(cid), cards = keys.map(function (k) { return st.cards[k]; });
    var rated = cards.filter(function (s) { return s && s.reps > 0; }).length;
    var recall = keys.length > 0 && cards.every(function (s) { return s && s.last && s.g > 1; });
    /* Explain: an explain-back about this concept with enough key points ticked, or a checkpoint
       synthesis whose rubric rows for it are ticked */
    var explainFrom = null;
    Object.keys(st.explains).forEach(function (lid) {
      var l = lesson(lid), e = st.explains[lid];
      if (!l || l.main !== cid || !c.keyPoints) return;
      var n = Object.keys(obj(e.ticks)).filter(function (k) { return +k < c.keyPoints.length; }).length;
      if (n / c.keyPoints.length >= EXPLAIN_SHARE - 1e-9) explainFrom = { lesson: lid, ticked: n, of: c.keyPoints.length };
    });
    var applyN = 0, evaluate = null;
    Object.keys(st.lessons).forEach(function (lid) {
      var l = lesson(lid), r = st.lessons[lid]; if (!l || !l.check) return;
      l.check.forEach(function (it, qi) { if (it.apply && it.concept === cid && r.check && r.check[qi] && r.check[qi].ok) applyN++; });
    });
    Object.keys(st.checkpoints).forEach(function (u) {
      var cp = M().CHECKPOINTS[u], r = st.checkpoints[u]; if (!cp || !r) return;
      (cp.apply || []).forEach(function (it, qi) { if (it.concept === cid && r.apply && r.apply[qi]) applyN++; });
      ((cp.synthesis && cp.synthesis.rubric) || []).forEach(function (row, ri) {
        if (row.concept !== cid || !(r.synth && r.synth.ticks && r.synth.ticks[ri])) return;
        if (row.rung === "Evaluate") evaluate = evaluate || { checkpoint: u };
        else if (!explainFrom) explainFrom = { checkpoint: u };
      });
    });
    /* Evaluate: a position with an objection answered, on a lesson that teaches the concept */
    Object.keys(st.positions).forEach(function (lid) {
      var l = lesson(lid); if (!l || (l.concepts || []).indexOf(cid) < 0) return;
      var v = latest(lid);
      if (v && v.objection && v.reply) evaluate = { lesson: lid };
    });
    var rungs = [recall, !!explainFrom, applyN > 0, !!evaluate];
    var level = 0;
    rungs.forEach(function (on, i) { if (on) level = i + 1; });
    return { id: cid, level: level, rungs: rungs, cards: keys.length, rated: rated, explain: explainFrom, apply: applyN, evaluate: evaluate,
      started: rated > 0 || rungs.some(Boolean) };
  }
  function rung(cid, name) { var l = ladder(cid); return !!(l && l.rungs[RUNGS.indexOf(name)]); }
  /* the concepts a learner has met: in a lesson they started */
  function metConcepts() {
    var st = peek(), seen = {};
    Object.keys(st.lessons).forEach(function (lid) { var l = lesson(lid); if (l) (l.concepts || []).forEach(function (c) { if (concept(c)) seen[c] = 1; }); });
    return Object.keys(seen);
  }
  /* rungCounts(list) → how many of the concepts reach each rung (a ladder, never a percentage) */
  function rungCounts(list) {
    var out = [0, 0, 0, 0];
    (list || metConcepts()).forEach(function (cid) { var l = ladder(cid); if (l) l.rungs.forEach(function (on, i) { if (on) out[i]++; }); });
    return out;
  }

  /* ---------------- a lesson's four checks → the shared progress record ---------------- */
  function evidence(id) {
    var l = lesson(id), n = pages(id).length, read = pagesRead(id);
    var cps = l && l.kind === "checkpoint";
    var cpDone = cps && !!(peek().checkpoints[l.unit] && peek().checkpoints[l.unit].doneAt);
    var retrieval = !!l && (l.concepts || []).some(function (cid) {
      return cardKeys(cid).some(function (k) { var s = peek().cards[k]; return s && s.reps > 0 && s.g > 1; });
    });
    var checks = [n > 0 && read >= n, cps ? cpDone : checkPassed(id), hasPrompt(id) ? promptDone(id) : null, retrieval];
    return { checks: checks, read: read, pages: n, items: checkItems(id).length, right: checkItems(id).filter(function (_, qi) { var c = obj(obj(peek().lessons[id]).check)[qi]; return c && c.ok; }).length,
      prompt: hasPrompt(id), promptDone: promptDone(id), parked: !!peek().parked[id], retrieval: retrieval };
  }
  /* written through the shared store like Code's and Japanese's (invariant 107); a lesson without
     a prompt has three checks, and the fourth slot carries retrieval */
  function syncChecks(id) {
    if (!lesson(id) || !store.setCheck) return;
    /* a lesson with no written prompt has three checks: its fourth slot holds once the three do, so
       it can reach Completed like any lesson */
    var ev = evidence(id), three = ev.checks[2] == null;
    var want = [ev.checks[0], ev.checks[1], three ? ev.checks[3] : ev.checks[2], three ? !!(ev.checks[0] && ev.checks[1] && ev.checks[3]) : ev.checks[3]];
    var p = store.peekProgress ? store.peekProgress(SID, id) : null, cur = p && p.check ? p.check : [false, false, false, false];
    want.forEach(function (on, i) { if (!!cur[i] !== !!on) store.setCheck(SID, id, i, !!on); });
  }
  function syncConcept(cid) { lessons().forEach(function (l) { if ((l.concepts || []).indexOf(cid) >= 0) syncChecks(l.id); }); }

  /* ---------------- finishing, paying once ---------------- */
  function finished(id) { return !!obj(peek().lessons[id]).doneAt; }
  /* COMPLETED is the shared status every subject counts by (all of a lesson's checks, invariant 107):
     the desk, the spine and the unit cards print it; finishing (read + check) is what pays and moves on */
  function completed(id) { var p = store.peekProgress ? store.peekProgress(SID, id) : null; return !!(p && p.status === "done"); }
  /* maybeFinish(id): every page read and the check passed → the lesson's first finish pays once
     and its concepts' cards join the schedule (due tomorrow: "cards from tomorrow") */
  function maybeFinish(id) {
    var l = lesson(id); if (!l || l.kind === "checkpoint") return false;
    var ev = evidence(id);
    if (!ev.checks[0] || !ev.checks[1]) return false;
    var r = rec(id);
    if (r.doneAt) return false;
    r.doneAt = Date.now();
    (l.concepts || []).forEach(function (cid) { introduce(cid); });
    var first = !r.paidAt;
    if (first) r.paidAt = Date.now();
    store.save();
    if (first) KOS.sessions.log({ type: "mind", subject: SID, ref: id, metrics: { kind: "lesson", id: id, first: true } });
    syncChecks(id);
    maybePath(l.unit);
    return true;
  }
  /* recordCheckpoint(unit, { cards, apply: {qi: ok}, synth: {bullets, ticks}, map }) → { paid } */
  function recordCheckpoint(u, o) {
    if (KOS.achievements) KOS.achievements.touch("mind");   // the Badge Wall (roadmap 5.16)
    var cp = M().CHECKPOINTS[u]; if (!cp) return null;
    o = obj(o);
    var st = S(), r = st.checkpoints[u] = obj(st.checkpoints[u]);
    r.cards = Math.max(0, +o.cards || 0);
    r.apply = {}; Object.keys(obj(o.apply)).forEach(function (k) { if (o.apply[k]) r.apply[k] = true; });
    var sy = obj(o.synth);
    r.synth = { bullets: (sy.bullets || []).map(function (b) { return String(b || "").trim().slice(0, 400); }).filter(Boolean).slice(0, 12), ticks: {} };
    Object.keys(obj(sy.ticks)).forEach(function (k) { if (sy.ticks[k]) r.synth.ticks[k] = true; });
    if (o.map) r.map = o.map;
    r.doneAt = Date.now();
    var first = !r.paidAt;
    if (first) r.paidAt = Date.now();
    var l = lessons().filter(function (x) { return x.kind === "checkpoint" && x.unit === u; })[0];
    if (l) { var lr = rec(l.id); if (!lr.doneAt) lr.doneAt = Date.now(); }
    (cp.concepts || []).forEach(function (cid) { introduce(cid); });
    store.save();
    if (first) KOS.sessions.log({ type: "mind", subject: SID, ref: l ? l.id : u, metrics: { kind: "checkpoint", id: u, first: true } });
    if (l) syncChecks(l.id);
    maybePath(u);
    return { paid: first, rubric: Object.keys(r.synth.ticks).length, of: ((cp.synthesis && cp.synthesis.rubric) || []).length };
  }
  /* a path completes when every PLANNED lesson of every unit is done — never on released ones only */
  function maybePath(unitId) {
    var p = pathOf(unitId); if (!p || p.later) return false;
    var done = p.units.every(function (u) {
      var ls = unitLessons(u.id);
      return ls.length >= u.n && ls.every(function (l) { return finished(l.id); });
    });
    var st = S();
    if (!done || (st.paths[p.id] && st.paths[p.id].paidAt)) return false;
    st.paths[p.id] = { paidAt: Date.now() };
    store.save();
    KOS.sessions.log({ type: "mind", subject: SID, ref: p.id, metrics: { kind: "path", id: p.id, first: true } });
    return true;
  }
  /* award(metrics) — what a ledger entry pays (the Governor's one call) */
  function award(m) {
    m = m || {};
    if (m.kind === "reviews") return { xp: Math.max(0, m.pay || 0), gold: 0, hp: 0 };
    if (m.kind === "lesson" && m.first) return LESSON_PAY;
    if (m.kind === "checkpoint" && m.first) return CHECK_PAY;
    if (m.kind === "path" && m.first) return PATH_PAY;
    return { xp: 0, gold: 0, hp: 0 };
  }

  /* ---------------- the order, the desk's reads ---------------- */
  function started() { var m = peek(); return Object.keys(m.lessons).length > 0 || Object.keys(m.cards).length > 0; }
  function unitState(unitId) {
    var u = unit(unitId), ls = unitLessons(unitId);
    if (!u) return { state: "later", done: 0, total: 0, released: 0, next: null };
    var done = ls.filter(function (l) { return finished(l.id); }).length;
    var next = ls.filter(function (l) { return !finished(l.id); })[0] || null;
    var cur = currentUnit();
    var state = !ls.length ? "later" : done >= u.n ? "done" : cur && cur.id === unitId ? "current" : done ? "started" : "open";
    return { state: state, done: done, completed: ls.filter(function (l) { return completed(l.id); }).length, total: u.n, released: ls.length, next: next };
  }
  /* the next lesson: the first unfinished one in the agreed order, then anything released */
  function nextLesson() {
    var ls = lessons(), order = M().ORDER || [];
    var ranked = ls.slice().sort(function (a, b) {
      var pa = order.indexOf(pathOf(a.unit).id), pb = order.indexOf(pathOf(b.unit).id);
      return (pa < 0 ? 99 : pa) - (pb < 0 ? 99 : pb);
    });
    return ranked.filter(function (l) { return !finished(l.id); })[0] || null;
  }
  function currentUnit() { var n = nextLesson(); return n ? unit(n.unit) : null; }
  /* suggested next: the first unit of the agreed order with nothing finished, after the current */
  function suggestedNext() {
    var cur = currentUnit(), order = M().ORDER || [], out = null;
    order.forEach(function (pid) {
      if (out) return;
      var p = M().PATHS.filter(function (x) { return x.id === pid; })[0]; if (!p) return;
      p.units.forEach(function (u) {
        if (out || (cur && u.id === cur.id)) return;
        var ls = unitLessons(u.id);
        if (!ls.length || !ls.every(function (l) { return finished(l.id); })) {
          if (!ls.some(function (l) { return finished(l.id); })) out = { unit: u, path: p, released: ls.length > 0 };
        }
      });
    });
    return out;
  }
  function plannedLessons() { var n = 0; M().PATHS.forEach(function (p) { p.units.forEach(function (u) { n += u.n; }); }); return n; }
  function plannedUnits() { var n = 0; M().PATHS.forEach(function (p) { n += p.units.length; }); return n; }
  function focusMins(fromISO) {
    return Math.round(KOS.sessions.all().reduce(function (n, e) {
      if (e.type !== "focus" || e.date < fromISO) return n;
      return n + (KOS.sessions.parts ? KOS.sessions.parts(e) : [{ subject: e.subject, secs: (e.metrics || {}).secs }]).reduce(function (a, p) {
        return a + (p.subject === SID ? (p.secs != null ? p.secs / 60 : (p.mins || 0)) : 0);
      }, 0);
    }, 0));
  }
  function stats() {
    var st = peek(), ls = lessons(), done = ls.filter(function (l) { return completed(l.id); }).length;
    var met = metConcepts(), ps = positions();
    var changed = 0;
    ps.forEach(function (p) { p.versions.forEach(function (v, i) { if (i && v.answer !== p.versions[i - 1].answer) changed++; }); });
    var t = today(), dow = (new Date(t + "T12:00:00").getDay() + 6) % 7;
    /* mastery as every subject reads it: the mean of each released lesson's evidence checks
       (a lesson without a prompt has three) */
    var mastery = ls.length ? Math.round(ls.reduce(function (a, l) {
      var cs = evidence(l.id).checks.filter(function (c) { return c != null; });
      return a + 100 * cs.filter(Boolean).length / Math.max(1, cs.length);
    }, 0) / ls.length) : 0;
    return {
      mastery: mastery, concepts: met.length, conceptsAll: concepts().length, rungs: rungCounts(met),
      /* counts of what is released, as Japanese's desk counts "so far"; the path page names the plan */
      lessons: ls.length, planned: plannedLessons(), done: done,
      checkpoints: Object.keys(M().CHECKPOINTS).filter(function (u) { return M().released && M().released(u).length; }).length, passed: Object.keys(st.checkpoints).filter(function (u) { return st.checkpoints[u].doneAt; }).length,
      due: due(t, true).length, positions: ps.length, changed: changed, weekMins: focusMins(addDays(t, -dow))
    };
  }
  /* the furthest rung most concepts have reached (the hero's ring: a ladder, never a percentage) */
  function furthest() {
    var c = rungCounts(), met = metConcepts().length;
    if (!met) return null;
    var best = -1;
    c.forEach(function (n, i) { if (n * 2 >= met) best = i; });
    return best >= 0 ? RUNGS[best] : null;
  }

  /* ---------------- milestones (derived, never stored) ---------------- */
  function milestones() {
    var st = peek(), out = [], ps = positions();
    var mapped = null;
    Object.keys(st.checkpoints).forEach(function (u) { var r = st.checkpoints[u]; if (r.map && r.doneAt && (!mapped || r.doneAt < mapped)) mapped = r.doneAt; });
    out.push({ id: "mapped", title: "First argument mapped", at: mapped });
    var firstChange = null;
    ps.forEach(function (p) { p.versions.forEach(function (v, i) { if (i && v.answer !== p.versions[i - 1].answer && (!firstChange || v.at < firstChange)) firstChange = v.at; }); });
    out.push({ id: "changed", title: "First changed mind", at: firstChange });
    var explained = null;
    Object.keys(st.explains).forEach(function (l) { var e = st.explains[l]; if (!explained || e.at < explained) explained = e.at; });
    out.push({ id: "explained", title: "First explain-back", at: explained });
    var crossing = null;
    lessons().forEach(function (l) { var p = pathOf(l.unit); if (p && p.header === "crossings" && finished(l.id)) crossing = crossing || st.lessons[l.id].doneAt; });
    out.push({ id: "crossing", title: "First crossing unit", at: crossing });
    out.push({ id: "ten", title: "Ten positions taken", at: ps.length >= 10 ? ps.map(function (p) { return p.versions[0].at; }).sort()[9] : null, of: [ps.length, 10] });
    return out;
  }

  /* ---------------- tension pairs (invariant 138: authored, never inferred) ---------------- */
  function answerOf(side) {
    if (side.lesson && side.vote != null) { var r = obj(peek().lessons[side.lesson]); return r.vote ? r.vote.i : null; }
    var v = latest(side.lesson); return v ? v.answer : null;
  }
  /* tensionsDue() → the authored pairs whose two answers stand as written, not done or parked today */
  function tensionsDue() {
    var st = peek(), t = today();
    return (M().TENSIONS || []).filter(function (tn) {
      var rec = st.tensions[tn.id];
      if (rec && rec.state === "done") return false;
      if (rec && rec.state === "later" && rec.day === t) return false;
      return answerOf(tn.a) === tn.a.answer && answerOf(tn.b) === tn.b.answer;
    });
  }
  function setTension(id, state) { var st = S(); st.tensions[id] = { at: Date.now(), day: today(), state: state === "done" ? "done" : "later" }; store.save(); }

  /* ---------------- the Big Question of the week (§9.2) ---------------- */
  function weekOf(t) { t = t || today(); var dow = (new Date(t + "T12:00:00").getDay() + 6) % 7; return addDays(t, -dow); }
  function bq(t) { return peek().bq[weekOf(t)] || null; }
  function setBq(q, src) { var st = S(), w = weekOf(); st.bq[w] = Object.assign(obj(st.bq[w]), { q: String(q || "").trim().slice(0, 200), src: src || null, lines: obj(obj(st.bq[w]).lines) }); store.save(); return st.bq[w]; }
  function addBqLine(text) {
    var st = S(), w = weekOf(), b = st.bq[w]; if (!b || !b.q) return null;
    b.lines = obj(b.lines); b.lines[today()] = String(text || "").trim().slice(0, 300);
    if (!b.lines[today()]) delete b.lines[today()];
    store.save(); return b;
  }
  function closeBq(bullets) {
    var st = S(), w = weekOf(), b = st.bq[w]; if (!b || !b.q) return null;
    b.synth = (bullets || []).map(function (x) { return String(x || "").trim().slice(0, 300); }).filter(Boolean).slice(0, 8);
    if (!b.synth.length) return null;
    b.closedAt = Date.now(); store.save(); return b;
  }

  /* ---------------- the Daily 15 (computed from the date and the evidence, §5.1) ---------------- */
  function examSeason() {
    try { return !!(KOS.exams && KOS.exams.season && KOS.exams.season(today()).on); } catch (e) { return false; }
  }
  /* sittingOf(lesson) → { from, to } the pages the next sitting covers; a lesson is cut into
     sittings at its page breaks (l.sittings: the page index each sitting ends after) */
  function sittingOf(id) {
    var l = lesson(id), n = pages(id).length; if (!l || !n) return null;
    var r = obj(peek().lessons[id]), read = obj(r.pages);
    var first = 0; while (first < n && read[first]) first++;
    if (first >= n) {
      if (!checkPassed(id) && l.kind !== "checkpoint") { var ci = Math.max(0, pages(id).map(function (p) { return p.kind; }).indexOf("check")); return { from: ci, to: n - 1 }; }
      return null;
    }
    var breaks = (l.sittings || [Math.floor((n - 1) / 2)]).concat([n - 1]);
    var to = breaks.filter(function (b) { return b >= first; })[0];
    return { from: first, to: to == null ? n - 1 : to };
  }
  /* the question slot: a parked prompt, then a revisit, then a tension, then a Field Guide item,
     then the week's Big Question (32ab) */
  function fieldItem(t) {
    var pool = [];
    lessons().forEach(function (l) {
      if (!finished(l.id) || !l.field) return;
      l.field.forEach(function (f, i) { pool.push({ lesson: l.id, i: i, item: f }); });
    });
    if (!pool.length) return null;
    var h = 0, s = String(t || today()); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return pool[h % pool.length];
  }
  function question(t) {
    t = t || today();
    var pk = parkedList();
    if (pk.length) return { kind: "parked", lesson: pk[0] };
    var rv = revisitsDue(t);
    if (rv.length) return { kind: "revisit", lesson: rv[0].lesson };
    var tn = tensionsDue();
    if (tn.length) return { kind: "tension", id: tn[0].id };
    var day = new Date(t + "T12:00:00").getDay();
    var fi = fieldItem(t);
    if (fi && day % 2 === 1) return { kind: "field", lesson: fi.lesson, i: fi.i };
    var b = bq(t);
    if (b && b.q && !b.closedAt) return { kind: "bq", sunday: day === 0 };
    if (fi) return { kind: "field", lesson: fi.lesson, i: fi.i };
    return { kind: "bq", sunday: day === 0, empty: !(b && b.q) };
  }
  function planDay(t) {
    t = t || today();
    var exam = examSeason(), rv = due(t).length;
    var nl = nextLesson(), sit = !exam && nl ? sittingOf(nl.id) : null;
    var q = exam ? null : question(t);
    var reviews = { n: rv, min: rv ? (exam ? 5 : 4) : 0 };
    return { day: t, exam: exam, reviews: reviews, sitting: sit ? { lesson: nl.id, title: nl.title, from: sit.from, to: sit.to, min: 8 } : null,
      question: q ? { min: 3, q: q } : null, total: reviews.min + (sit ? 8 : 0) + (q ? 3 : 0) };
  }

  /* ---------------- per-device reads and writes ---------------- */
  function ui() { return U(); }
  function peekUi() { return peekU(); }

  KOS.mind = {
    SID: SID, RUNGS: RUNGS, CHECKS: CHECKS, REVISITS: REVISITS, REVIEW_CAP: REVIEW_CAP, DAILY_CARDS: DAILY_CARDS,
    LESSON_PAY: LESSON_PAY, CHECK_PAY: CHECK_PAY, PATH_PAY: PATH_PAY,
    normalise: normalise, peek: peek, ui: ui, peekUi: peekUi,
    concept: concept, concepts: concepts, lesson: lesson, content: content, lessons: lessons, unit: unit, pathOf: pathOf, unitLessons: unitLessons,
    cardKeys: cardKeys, cardOf: cardOf, pages: pages, checkItems: checkItems, hasPrompt: hasPrompt,
    markPage: markPage, setVote: setVote, answerCheck: answerCheck, checkPassed: checkPassed, pagesRead: pagesRead,
    saveExplain: saveExplain, takePosition: takePosition, versions: versions, latest: latest, position: position, positions: positions,
    keepPosition: keepPosition, retirePosition: retirePosition, revisitsDue: revisitsDue, park: park, promptDone: promptDone, parkedList: parkedList,
    introduce: introduce, preview: preview, rateCard: rateCard, due: due, finishReviews: finishReviews, paidToday: paidToday,
    ladder: ladder, rung: rung, metConcepts: metConcepts, rungCounts: rungCounts, furthest: furthest,
    evidence: evidence, syncChecks: syncChecks, finished: finished, completed: completed, maybeFinish: maybeFinish, recordCheckpoint: recordCheckpoint, award: award,
    started: started, unitState: unitState, nextLesson: nextLesson, currentUnit: currentUnit, suggestedNext: suggestedNext, stats: stats,
    milestones: milestones, tensionsDue: tensionsDue, setTension: setTension, answerOf: answerOf,
    weekOf: weekOf, bq: bq, setBq: setBq, addBqLine: addBqLine, closeBq: closeBq,
    examSeason: examSeason, sittingOf: sittingOf, fieldItem: fieldItem, question: question, planDay: planDay,
    plannedLessons: plannedLessons, plannedUnits: plannedUnits, focusMins: focusMins
  };
})();
