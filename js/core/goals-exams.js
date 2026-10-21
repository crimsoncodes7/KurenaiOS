/* Kurenai OS — core/goals-exams.js
   The Exams hub's five goal types (roadmap 5.8 phase 4, docs/exams-plan.md
   §14, frame 29v), registered in the Study domain. Each is linked to ONE
   assessment (`links.examId`) and measured by READING that assessment's
   own data (invariants 26d, 128): its attempts and the boundaries, the
   readiness model's projected recall, its resolved scope, its checklist.

     exam_grade         the result on the day (or the best timed paper) as
                        a % or against a grade's cut
     exam_recall        projected recall across the scope, held ON the date
     exam_topics_green  leaves of the scope Green (or covered in Pacing)
     exam_papers_done   timed, marked papers linked to it before the date
     exam_checklist     its checklist, ticked by you and by the app

   A linked goal ends on its exam's date (read live, so moving the exam
   moves it) unless an earlier "By" date was picked (`params.by`), and
   takes the exam's subject hue. Deleting the exam unlinks it and keeps it
   (KOS.goals.unlinkExam). Nothing here pays: completion is the engine's
   one activity-only receipt (invariant 5b), and zero Governor traffic
   (invariant 129).

   KOS.goalsExams.templates(a) are the 29c offers made when an assessment
   is created; add(a, picks) makes the ticked ones.                       */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var G = KOS.goals;
  if (!G) return;
  function E() { return KOS.exams; }
  function examOf(g) { return g.links && g.links.examId && E() ? E().get(g.links.examId) : null; }
  function deadlineOf(g) {
    var a = examOf(g);
    if (!a || !a.date) return null;
    return g.params && g.params.by && g.params.by < a.date ? g.params.by : a.date;
  }
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function pretty(iso) { var p = String(iso).split("-"), d = new Date(+p[0], +p[1] - 1, +p[2]); return DOW[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()]; }
  function gone(cb) { cb({ current: null, meta: "Link an exam to measure this" }); }
  function pct(e) { return KOS.tracker && KOS.tracker.pct ? KOS.tracker.pct(e) : null; }

  /* the % a grade needs on this paper: the highest cut among the series
     the boundaries table has (the cautious one), or null without them */
  function gradeCut(a, grade) {
    var rows = E().boundsFor(a);
    var cuts = rows.map(function (r) { return r.marks && r.marks[grade] != null && r.max ? 100 * r.marks[grade] / r.max : null; })
      .filter(function (v) { return v != null; });
    return cuts.length ? Math.round(Math.max.apply(null, cuts)) : null;
  }
  function grades(a) {
    return (KOS.examStats ? KOS.examStats.GRADES : []).filter(function (gr) { return gradeCut(a, gr) != null; });
  }
  function recallNow(a) {
    var rd = E().readiness(a), rc = rd && rd.signals && rd.signals.recall;
    if (!rc) return { value: null, meta: "This tier has no recall signal" };
    if (rc.thin) return { value: null, meta: rc.why + " " + rc.sub };
    return { value: Math.round(100 * rc.value), meta: rc.today ? "Recall today" : "Projected to the morning of the exam" };
  }
  function scopeCount(a, basis) {
    var ls = E().leaves(a), n = 0;
    ls.forEach(function (k) {
      var p = KOS.spec.parse(k);
      if (!p) return;
      if (basis === "covered" ? E().leafCovered(k) : KOS.rag && KOS.rag.effective(p.subject, p.ref).band === "g") n++;
    });
    return { n: n, of: ls.length };
  }

  /* judged on the date: met when it holds on the deadline (recall is a
     state, not a count — 85% on a Tuesday in March proves nothing) */
  function holdJudge(g, m, today) {
    if (!g.deadline || today < g.deadline) return "active";
    return m.current != null && m.current >= m.target ? "completed" : "failed";
  }
  /* the result arrives after the exam (results day), so a result goal is
     judged when the result is logged, not on the exam's date */
  function resultJudge(g, m, today) {
    if (g.params && g.params.basis === "best") {
      if (m.current != null && m.current >= m.target) return "completed";
      return g.deadline && g.deadline < today ? "failed" : "active";
    }
    if (m.current == null) return "active";
    return m.current >= m.target ? "completed" : "failed";
  }

  G.register({ id: "exam_grade", domain: "study", label: "Grade or score", icon: "点", unit: "%", exam: true, noPace: true,
    fields: { exam: true }, deadlineOf: deadlineOf, judge: resultJudge,
    blurb: "Your result on the day, once logged", tiers: ["real_exam", "mock", "topic_test"],
    measure: function (g, ctx, cb) {
      var a = examOf(g);
      if (!a) { gone(cb); return; }
      var atts = E().attemptsFor(a).filter(function (e) { return pct(e) != null; });
      var target = g.target, cutMeta = "";
      if (g.params.grade) {
        var cut = gradeCut(a, g.params.grade);
        if (cut == null) { cb({ current: null, meta: "No boundaries for this paper, so no grade to aim at" }); return; }
        target = cut; cutMeta = " · " + g.params.grade + " needs about " + cut + "%";
      }
      if (g.params.basis === "best") {
        var best = null;
        atts.forEach(function (e) { if (e.timed && e.role !== "result" && (best == null || pct(e) > best)) best = pct(e); });
        cb({ current: best, target: target, unit: "%", meta: (best == null ? "No timed paper yet" : "Best timed paper") + cutMeta });
        return;
      }
      var res = atts.filter(function (e) { return e.role === "result"; }).pop();
      var resPct = res ? pct(res) : a.result && a.result.marks != null && a.result.max ? Math.round(100 * a.result.marks / a.result.max) : null;
      var practice = atts.filter(function (e) { return e.timed && e.role !== "result"; }).pop();
      cb({ current: resPct, target: target, unit: "%",
        meta: (resPct != null ? "Your result" : "Measured once the result is logged" + (practice ? "; last timed paper " + pct(practice) + "%" : "")) + cutMeta });
    } });

  G.register({ id: "exam_recall", domain: "study", label: "Projected recall", icon: "憶", unit: "%", exam: true, fromBase: true,
    fields: { exam: true }, deadlineOf: deadlineOf, judge: holdJudge,
    blurb: "FSRS on the morning of the exam", tiers: ["real_exam", "mock", "topic_test", "retrieval_test"],
    onCreate: function (g) { var a = examOf(g), r = a ? recallNow(a) : null; g.params.baseline = r && r.value != null ? r.value : 0; },
    measure: function (g, ctx, cb) {
      var a = examOf(g);
      if (!a) { gone(cb); return; }
      var r = recallNow(a);
      cb({ current: r.value, unit: "%", meta: r.meta });
    } });

  G.register({ id: "exam_topics_green", domain: "study", label: "Topics green or covered", icon: "緑", unit: "topics", exam: true, fromBase: true,
    fields: { exam: true }, deadlineOf: deadlineOf,
    blurb: "Of the leaves in the exam's scope", tiers: ["real_exam", "mock", "topic_test"],
    onCreate: function (g) { var a = examOf(g); g.params.baseline = a ? scopeCount(a, g.params.basis).n : 0; },
    measure: function (g, ctx, cb) {
      var a = examOf(g);
      if (!a) { gone(cb); return; }
      var c = scopeCount(a, g.params.basis);
      if (!c.of) { cb({ current: null, meta: "The scope has no topics yet" }); return; }
      cb({ current: c.n, target: g.params.all ? c.of : Math.min(g.target, c.of), unit: "topics",
        meta: "of the " + c.of + " leaves in scope " + (g.params.basis === "covered" ? "covered" : "green") });
    } });

  G.register({ id: "exam_papers_done", domain: "study", label: "Papers done", icon: "紙", unit: "papers", exam: true,
    fields: { exam: true }, deadlineOf: deadlineOf,
    blurb: "Marked timed papers before the date", tiers: ["real_exam", "mock"],
    measure: function (g, ctx, cb) {
      var a = examOf(g);
      if (!a) { gone(cb); return; }
      var n = E().attemptsFor(a).filter(function (e) {
        return e.timed && e.marks != null && e.role !== "result" && e.date >= ctx.from && e.date <= ctx.to;
      }).length;
      cb({ current: n, unit: "papers" });
    } });

  G.register({ id: "exam_checklist", domain: "study", label: "Checklist", icon: "検", unit: "items", exam: true, noPace: true,
    fields: { exam: true }, deadlineOf: deadlineOf,
    blurb: "Every item ticked by the day", tiers: ["real_exam", "mock", "topic_test"],
    measure: function (g, ctx, cb) {
      var a = examOf(g);
      if (!a) { gone(cb); return; }
      var list = E().checklist(a);
      if (!list.length) { cb({ current: null, meta: "This assessment has no checklist" }); return; }
      var done = list.filter(function (c) { return c.done; }), byApp = done.filter(function (c) { return c.auto; }).length;
      cb({ current: done.length, target: list.length, unit: "items",
        meta: (done.length ? (byApp === done.length ? (done.length === 1 ? "Ticked by the app" : "All " + done.length + " ticked by the app") : byApp ? byApp + " of the " + done.length + " were ticked by the app" : "All ticked by you") : "Nothing ticked yet") });
    } });

  var TYPES = ["exam_grade", "exam_recall", "exam_topics_green", "exam_papers_done", "exam_checklist"];
  /* the types an assessment's tier offers (plan §5's table) */
  function typesFor(a) {
    return TYPES.filter(function (id) { var d = G.typeDef(id); return a && d.tiers.indexOf(a.tier) !== -1 && (id !== "exam_checklist" || E().checklist(a).length); });
  }

  /* ---------------- the 29c templates ----------------
     One row per type the tier offers, with a sensible value and a default
     tick; nothing is added unless ticked. */
  function templates(a) {
    if (!a) return [];
    var t = a.tier, ls = E().leaves(a).length, rd = E().readiness(a);
    var tp = rd && rd.targetPct ? rd.targetPct : 70;
    var rTarget = Math.round(100 * Math.min(0.95, Math.max(0.85, (KOS.srs.examTarget && KOS.srs.examTarget()) || 0.9)));
    var rows = [];
    typesFor(a).forEach(function (id) {
      if (id === "exam_grade") rows.push({ type: id, on: true, value: a.target && gradeCut(a, a.target) != null ? a.target : tp, grade: a.target && gradeCut(a, a.target) != null ? a.target : null,
        label: "Score or grade", sub: "Your result on the day, once logged", title: a.title + (a.target && gradeCut(a, a.target) != null ? " at " + a.target : " ≥ " + tp + "%") });
      if (id === "exam_recall") rows.push({ type: id, on: true, value: t === "retrieval_test" ? 85 : rTarget, label: "Projected recall",
        sub: t === "retrieval_test" ? "FSRS, on the day" : "FSRS, on the morning of " + (a.date ? pretty(a.date) : "the exam"), title: a.title + " recall ≥ " + (t === "retrieval_test" ? 85 : rTarget) + "%" });
      if (id === "exam_topics_green" && ls) rows.push({ type: id, on: false, value: Math.max(1, Math.round(ls * 0.8)), label: "Topics green or covered",
        sub: "Of the " + ls + " leaves in scope", title: Math.max(1, Math.round(ls * 0.8)) + " of " + ls + " topics Green for " + a.title });
      if (id === "exam_papers_done") rows.push({ type: id, on: true, value: t === "real_exam" ? 4 : 3, label: "Papers done",
        sub: "Marked timed papers before the " + (t === "mock" ? "mock" : "exam"), title: (t === "real_exam" ? 4 : 3) + " marked papers before " + a.title });
      if (id === "exam_checklist") rows.push({ type: id, on: false, value: null, label: "Pre-exam checklist", sub: "Every item ticked by the day", title: "Pre-exam checklist: " + a.title });
    });
    return rows;
  }
  /* the standard manual items a pre-exam checklist goal brings (§14) */
  function standardItems(a) {
    var out = [];
    if (a.calculator === "allowed") { out.push("Calculator packed"); out.push("Calculator in Degree mode"); }
    if (a.subject === "maths" || a.subject === "it") out.push("Formula booklet");
    out.push("ID and equipment");
    out.push("Room and arrival time");
    return out;
  }
  function make(a, row) {
    var params = {};
    var fields = { type: row.type, title: row.title, target: row.value || 1, links: { examId: a.id, subject: a.subject || undefined }, deadline: a.date || null, params: params };
    if (row.type === "exam_grade") { params.basis = "result"; if (row.grade) { params.grade = row.grade; fields.target = gradeCut(a, row.grade) || 1; } }
    if (row.type === "exam_topics_green") params.basis = row.basis === "covered" ? "covered" : "green";
    if (row.type === "exam_checklist") {
      var have = {};
      (a.checklist || []).forEach(function (c) { have[c.text.toLowerCase()] = true; });
      E().checklist(a).forEach(function (c) { have[c.text.toLowerCase()] = true; });
      standardItems(a).forEach(function (t) { if (!have[t.toLowerCase()]) E().addCheck(a.id, t, "day"); });
      fields.target = E().checklist(E().get(a.id)).length || 1;
    }
    if (row.by && a.date && row.by < a.date) { params.by = row.by; fields.deadline = row.by; }
    return G.add(fields);
  }
  function add(a, rows) {
    return (rows || []).filter(function (r) { return r.on; }).map(function (r) { return make(a, r); });
  }

  KOS.goalsExams = { TYPES: TYPES, typesFor: typesFor, templates: templates, add: add, make: make,
    examOf: examOf, gradeCut: gradeCut, grades: grades, standardItems: standardItems };
})();
