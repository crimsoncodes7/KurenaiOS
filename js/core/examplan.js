/* Kurenai OS — core/examplan.js
   The revision planner (roadmap 5.8, docs/exams-plan.md §10, frame 29l):
   a READ-ONLY weekly guide with exactly one action.

     1. hours available this week — prefs.weeklyHours, else the recent
        average from the session ledger (KOS.exams.weeklyHours)
     2. the split across assessments:
          share(a) ∝ tierWeight(a) × gap(a) ÷ max(1, weeksLeft(a))
        gap = 1 − readiness progress; an assessment joins once its start-by
        is three weeks away or nearer
     3. the split inside one assessment, by §9.4's expected gain an hour:
        at most 40% on one leaf, a slot for overdue reviews in scope, and
        leaves Pacing has not reached flagged "learn first"
     4. the week's practice paper (the next untried sitting of the most
        at-risk board paper) and the cram deck for the next test

   THE ONE ACTION (invariant 126): send() writes ordinary PERSONAL Pacing
   rows for that week, tagged `exam:<assessmentId>`, and only after the
   confirm dialog. Nothing goes on the Calendar. Sending again replaces
   this planner's own unticked rows for that week; Undo removes them. A
   disrupted week needs no clean-up: next week is computed afresh, and the
   sent rows carry over like any personal row (invariant 82a).
   Zero Governor traffic (invariant 129).                                  */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var BLOCK = 25;                                  // a session is 25 minutes

  function E() { return KOS.exams; }
  function today() { return KOS.srs.todayISO(); }
  function mondayOf(iso) {
    var p = iso.split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]);
    var back = (d.getDay() + 6) % 7;
    return KOS.srs.addDays(iso, -back);
  }
  function round10(n) { return Math.max(10, Math.round(n / 10) * 10); }

  /* how far along an assessment is, 0..1, from its signals (a thin one
     counts as a little: there is something to do) */
  function progress(rd) {
    if (!rd || !rd.signals) return 0;
    var s = rd.signals, parts = [];
    if (s.coverage) parts.push(s.coverage.thin ? 0.2 : Math.min(1, s.coverage.value / 0.95));
    if (s.rag) parts.push(s.rag.thin ? 0.2 : Math.max(0, 1 - s.rag.red * 2));
    if (s.recall) parts.push(s.recall.thin ? 0.2 : Math.min(1, s.recall.value / (rd.target || 0.9)));
    if (s.practice) parts.push(s.practice.thin ? 0.1 : Math.min(1, s.practice.last / (rd.targetPct || 70)));
    return parts.length ? parts.reduce(function (t, v) { return t + v; }, 0) / parts.length : 0;
  }
  function weeklyHours() {
    var w = E().weeklyHours();
    var avg = null;
    /* the recent average, said beside the field even when set by hand */
    var from = KOS.srs.addDays(today(), -28), secs = 0;
    (KOS.sessions && KOS.sessions.all ? KOS.sessions.all() : []).forEach(function (s) {
      if (!s || !s.date || s.date < from || s.type === "media" || s.type === "todo") return;
      secs += s.dur || 0;
    });
    if (secs) avg = Math.round(secs / 60 / 4);
    return { hours: w.hours, from: w.from, avgMins: avg };
  }
  /* the cards in an assessment's scope that are due by a day */
  function dueInScope(a, by) {
    var n = 0;
    E().leaves(a).forEach(function (k) {
      var p = KOS.spec.parse(k);
      if (!p) return;
      KOS.srs.cardsFor(p.subject, p.ref).forEach(function (c) {
        var m = KOS.srs.peek(c.key);
        if (m && m.due && m.due <= by && !m.leech) n++;
      });
    });
    return n;
  }
  function cardsInScope(a) {
    var n = 0;
    E().leaves(a).forEach(function (k) { var p = KOS.spec.parse(k); if (p) n += KOS.srs.cardsFor(p.subject, p.ref).length; });
    return n;
  }
  /* the next sitting of a board paper not yet tried, newest first */
  function nextPaper(a) {
    var pr = a.preset ? E().preset(a.preset) : null;
    var ix = window.KOS_EXAMS && KOS_EXAMS.index;
    if (!pr || !pr.index || !ix || !ix.papers[pr.index]) return null;
    var done = {};
    (KOS.tracker ? KOS.tracker.all() : []).forEach(function (e) { if (e.source && e.source.kind === "past-paper") done[e.source.ref] = true; });
    var sits = ix.papers[pr.index].sittings.slice().reverse().filter(function (s) { return s !== "specimen" && s !== "sample"; });
    var s = sits.filter(function (x) { return !done[pr.index + ":" + x]; })[0];
    if (!s) return null;
    var mins = Math.round((pr.mins || a.durationMins || 90) * (1 + (a.extraTime || 0) / 100));
    return { paper: pr.index, sitting: s, title: ix.papers[pr.index].title + " · " + KOS.examIndex.sittingLabel(s) + ", timed", mins: mins, done: Object.keys(done).filter(function (k) { return k.indexOf(pr.index + ":") === 0; }).length, of: sits.length };
  }

  /* the week's plan (frame 29l), computed afresh every time */
  function plan(wb) {
    var X = E(), now = today();
    wb = mondayOf(wb || now);
    var end = KOS.srs.addDays(wb, 6), from = wb > now ? wb : now;
    var hrs = weeklyHours();
    var total = Math.round(hrs.hours * 60);
    var cands = X.upcoming(from).filter(function (a) {
      if (a.tier === "deadline" || a.archived) return false;
      var sb = X.startBy(a, from);
      return sb && sb.date <= KOS.srs.addDays(end, 21);
    }).map(function (a) {
      var rd = X.readiness(a, from), t = X.tier(a.tier);
      var p = progress(rd), gap = Math.max(0.15, 1 - p);
      var weeksLeft = Math.max(1, Math.ceil(KOS.srs.daysBetween(wb, a.date) / 7));
      return { a: a, rd: rd, tier: t, progress: p, gap: gap, weeksLeft: weeksLeft, score: t.weight * gap / weeksLeft,
        risk: rd && rd.band && rd.band.band === "risk" };
    });
    if (!cands.length || total <= 0) return { wb: wb, end: end, hours: hrs, total: total, groups: [], reviews: null, cram: null, sessions: 0, empty: total <= 0 ? "hours" : "nothing" };
    var reviewsDue = 0;
    cands.forEach(function (c) { c.due = dueInScope(c.a, end); reviewsDue += c.due; });
    var reviews = reviewsDue ? Math.min(Math.round(total * 0.2), round10(total * 0.07)) : 0;
    var left = total - reviews;
    var sum = cands.reduce(function (s, c) { return s + c.score; }, 0) || 1;
    cands.forEach(function (c) { c.share = c.score / sum; c.mins = Math.max(BLOCK, Math.round(left * c.share / BLOCK) * BLOCK); });
    cands.sort(function (x, y) { return y.share - x.share; });
    /* the week's paper goes to the most at-risk board paper (else the
       nearest real exam or mock) */
    var papered = cands.filter(function (c) { return (c.a.tier === "real_exam" || c.a.tier === "mock") && nextPaper(c.a); });
    var paperFor = papered.filter(function (c) { return c.risk; })[0]
      || papered.slice().sort(function (x, y) { return x.a.date < y.a.date ? -1 : 1; })[0];
    var sessions = 0;
    var groups = cands.map(function (c) {
      var rows = [], budget = c.mins;
      var paper = c === paperFor ? nextPaper(c.a) : null;
      if (paper && paper.mins + BLOCK <= budget) budget -= paper.mins; else if (paper) paper.outside = true;
      var blocks = Math.max(1, Math.floor(budget / BLOCK));
      var cap = Math.max(1, Math.floor(blocks * 0.4));
      var nm = X.nextMarks(c.a, { n: 12 });
      var picks = nm && nm.items ? nm.items : [];
      if (!picks.length) {
        /* thin evidence: the leaves not met yet, then the weakest recall */
        var rd = c.rd, sig = rd && rd.signals;
        var unmet = sig && sig.coverage && sig.coverage.unmet ? sig.coverage.unmet : [];
        var weak = sig && sig.recall && sig.recall.weakest ? sig.recall.weakest : [];
        picks = unmet.slice(0, 4).map(function (u) { return { key: u.key, title: u.title, from: "learn", learn: true }; })
          .concat(weak.slice(0, 4).map(function (w) { return { key: w.key, title: w.title, from: "recall", recall: w.r }; }));
      }
      var given = 0;
      picks.forEach(function (p, i) {
        if (given >= blocks) return;
        var n = Math.min(cap, Math.max(1, Math.round(blocks * (i === 0 ? 0.4 : i === 1 ? 0.3 : 0.2))), blocks - given);
        if (n <= 0) return;
        var learn = p.learn || !X.leafCovered(p.key);
        var why = learn ? "Not yet in Pacing: learn it, then review"
          : p.from === "attempts" ? "You dropped " + p.lost + " of " + p.avail + " marks here"
          : p.recall != null ? "Projected " + Math.round(100 * p.recall) + "% on the day" + (i === 0 ? ", the weakest leaf" : "")
          : p.from === "rag" ? "Rated " + (p.rag === "r" ? "Red" : p.rag === "a" ? "Amber" : "Green") : "In scope";
        rows.push({ key: p.key, title: p.title, sessions: n, mins: n * BLOCK, why: why, learn: learn });
        given += n;
      });
      if (c.due) rows.push({ key: null, title: "Reviews in scope", sessions: 0, mins: 10, why: c.due + (c.due === 1 ? " card" : " cards") + " due before Sunday", reviews: true });
      sessions += given;
      return { a: c.a, tier: c.tier, mins: c.mins, share: c.share, weeksLeft: c.weeksLeft, risk: c.risk, band: c.rd && c.rd.band, rows: rows, paper: paper };
    });
    /* the cram deck: the next topic test or quiz within two weeks */
    var test = X.upcoming(from).filter(function (a) { return (a.tier === "topic_test" || a.tier === "retrieval_test") && KOS.srs.daysBetween(from, a.date) <= 14; })[0];
    var cram = test ? { a: test, cards: cardsInScope(test) } : null;
    if (cram && !cram.cards) cram = null;
    return { wb: wb, end: end, hours: hrs, total: total, groups: groups, reviews: reviews ? { mins: reviews, due: reviewsDue } : null,
      cram: cram, sessions: sessions };
  }

  /* what Send would add, row by row (the confirm dialog lists exactly
     this; nothing is written by computing it) */
  function sendList(p) {
    var out = [];
    (p.groups || []).forEach(function (g) {
      g.rows.forEach(function (r) {
        if (r.reviews || !r.key) return;
        var k = KOS.spec.parse(r.key);
        out.push({ aid: g.a.id, subject: k ? k.subject : g.a.subject, title: r.title, refs: k ? [k.ref] : [], detail: r.sessions + (r.sessions === 1 ? " session" : " sessions") + " · " + r.why, label: r.sessions + (r.sessions === 1 ? " session" : " sessions") });
      });
      if (g.paper && g.a.subject) out.push({ aid: g.a.id, subject: g.a.subject, title: g.paper.title, refs: [], detail: "The week's practice paper · " + Math.round(g.paper.mins) + " min", label: Math.round(g.paper.mins) + " min" });
    });
    if (p.cram && p.cram.a.subject) out.push({ aid: p.cram.a.id, subject: p.cram.a.subject, title: "Cram deck · " + p.cram.a.title, refs: [], detail: p.cram.cards + " cards before " + p.cram.a.date, label: p.cram.cards + " cards" });
    return out;
  }
  function sends() { var x = KOS.store.state.exams; return (x && x.sends) || {}; }
  /* the planner's rows in a week are found by their tag, not by stored
     ids: a cloud merge may re-key a Pacing row (invariant 33a) */
  function sentRows(wb) {
    return KOS.pacing ? KOS.pacing.entriesFor(wb, null, "personal").filter(function (e) { return e.tag && e.tag.indexOf("exam:") === 0; }) : [];
  }
  /* THE ONE WRITE (invariant 126): personal Pacing rows for the week,
     tagged exam:<id>, replacing this planner's own unticked rows there */
  function send(wb, items) {
    if (!KOS.pacing || !KOS.pacing.weekAt(wb)) return { ok: false, why: "That week is not in your Pacing plan." };
    var x = KOS.store.state.exams;
    if (!x.sends || typeof x.sends !== "object") x.sends = {};
    sentRows(wb).forEach(function (e) { if (!e.done) KOS.pacing.removeEntry(e.id); });
    var ids = [];
    (items || []).forEach(function (it) {
      var e = KOS.pacing.addEntry({ source: "personal", wb: wb, subject: it.subject, kind: "Exam", title: it.title, detail: it.detail || "",
        refs: it.refs || [], tag: "exam:" + it.aid });
      if (e) ids.push(e.id);
    });
    x.sends[wb] = { at: Date.now(), n: ids.length };
    KOS.store.save();
    return { ok: true, ids: ids };
  }
  function undo(wb) {
    var x = KOS.store.state.exams, n = 0;
    sentRows(wb).forEach(function (e) { if (!e.done) { KOS.pacing.removeEntry(e.id); n++; } });
    if (x && x.sends) delete x.sends[wb];
    KOS.store.save();
    return n;
  }
  /* a week's send, for "sent Tue 20 Oct · 9 of 13 done" */
  function sentState(wb) {
    var s = sends()[wb], rows = sentRows(wb);
    if (!s && !rows.length) return null;
    return { at: s ? s.at : null, n: rows.length, done: rows.filter(function (e) { return e.done; }).length };
  }

  KOS.examPlan = { BLOCK: BLOCK, sentRows: sentRows, mondayOf: mondayOf, plan: plan, sendList: sendList, send: send, undo: undo, sentState: sentState, nextPaper: nextPaper, progress: progress, cardsInScope: cardsInScope, dueInScope: dueInScope };
})();
