/* Kurenai OS — core/examstats.js
   The Exams & Deadlines hub's numbers (roadmap 5.8, docs/exams-plan.md
   §7 and §9, phase 3): readiness's band, mark weights and likelihood from
   the past-paper index, the predicted grade, where the next ten marks come
   from, error patterns, pace, calibration, the post-mortem, "what changed
   since the mock", the clash and load view and the timetable importer's
   parser.

   PURE: every function takes what it reads as arguments and writes
   nothing, so it runs the same in the page and in Node (smoke91). The
   gatherers that read the state live in core/exams.js (KOS.exams.readiness
   and friends); the pages only draw what these return.

   Every figure states its evidence and stays silent below its threshold
   (invariants 76, 77, 123): a function returns null, or a `thin` reason,
   rather than a zero that would read as a measurement.                   */
(function (root) {
  "use strict";

  var GRADES = ["A*", "A", "B", "C", "D", "E"];
  /* the thresholds the frames and the plan name (29g, 29k) */
  var NEED = { ragLeaves: 3, recallCards: 20, trendPapers: 1, rangePapers: 3, calibration: 5, patterns: 10, nextReviews: 50 };
  /* §9.4: hours to fix a lost mark, by the tag that lost it */
  var FIX_HOURS = { recall: 0.5, slip: 0.5, notation: 0.5, misread: 0.75, command: 0.75, working: 0.75, time: 0.75, incomplete: 1, knowledge: 1.5, method: 1.5 };
  /* §8.3 → §9.4: what each tag prescribes, in one line (the error-pattern
     cards and the Exam Room's blacklist) */
  var TAG_FIX = {
    knowledge: ["Knowledge: learn it, then test it", "Read the leaf's notes once and add its flashcards to Review."],
    recall: ["Recall: knew it, could not bring it back", "A redo item and the cram deck; little and often beats one long session."],
    method: ["Method: write the plan before the algebra", "Work the question type's variations, then redo the question from your copy."],
    slip: ["Slip: check as you go", "Re-read each line once; check a calculator answer by estimating it."],
    misread: ["Misread: underline the ask", "Underline the command word and the form the answer must take."],
    command: ["Command word: answer the word asked", "Describe, explain, compare and evaluate each want something different."],
    working: ["Working: show every step you want marked", "In \"show that\", write the line where the given result appears."],
    notation: ["Notation: units, accuracy, conventions", "Units, significant figures and the board's own notation, every time."],
    time: ["Ran out of time: move on after 90 seconds", "Stuck past 90 s, mark it and come back; check the clock at each quarter."],
    incomplete: ["Incomplete: take the marks that are there", "Write the first step of a long question even if you cannot finish it."]
  };

  function round(n, d) { var p = Math.pow(10, d || 0); return Math.round(n * p) / p; }
  function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }
  function real(s) { return s !== "specimen" && s !== "sample"; }
  function pct(got, max) { return max > 0 && got != null ? 100 * got / max : null; }
  function isoDays(a, b) {
    var pa = a.split("-"), pb = b.split("-");
    return Math.round((Date.UTC(+pb[0], +pb[1] - 1, +pb[2]) - Date.UTC(+pa[0], +pa[1] - 1, +pa[2])) / 86400000);
  }
  function addDays(iso, n) {
    var p = iso.split("-"), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2] + n));
    return d.toISOString().slice(0, 10);
  }

  /* ---------------- §9.1–9.2: mark weight and likelihood ----------------
     For one paper in the index: each leaf's mean marks a sitting (a
     question's marks shared evenly across the leaves it maps to), the share
     of the paper, the sittings it appeared in, the marks when it does, the
     gap since it last appeared, the trend, the yield and the "due" marker.
     Specimens and samples are not sittings. */
  function weights(paperId, ix) {
    var p = ix && ix.papers && ix.papers[paperId];
    if (!p) return null;
    var sits = p.sittings.filter(real);
    if (!sits.length) return null;
    var per = {}, total = 0;
    ix.questions.forEach(function (q) {
      if (q[0] !== paperId || !real(q[1]) || sits.indexOf(q[1]) === -1) return;
      var ls = q[5] && q[5].length ? q[5] : [];
      total += q[4];
      ls.forEach(function (k) {
        var r = per[k] || (per[k] = { marks: 0, sits: {} });
        var share = q[4] / ls.length;
        r.marks += share;
        r.sits[q[1]] = (r.sits[q[1]] || 0) + share;
      });
    });
    var n = sits.length, half = Math.floor(n / 2);
    var out = {};
    Object.keys(per).forEach(function (k) {
      var r = per[k], seen = sits.filter(function (s) { return r.sits[s]; });
      var last = -1;
      sits.forEach(function (s, i) { if (r.sits[s]) last = i; });
      var rate = seen.length / n;
      var first = sits.slice(0, half).filter(function (s) { return r.sits[s]; }).length / Math.max(1, half);
      var second = sits.slice(half).filter(function (s) { return r.sits[s]; }).length / Math.max(1, n - half);
      var mean = r.marks / n;
      out[k] = {
        mean: round(mean, 2), pct: total ? round(100 * r.marks / total, 1) : 0,
        appear: seen.length, of: n, rate: round(rate, 3),
        whenMarks: seen.length ? round(r.marks / seen.length, 1) : 0,
        gap: last === -1 ? n : n - 1 - last,
        trend: second - first > 0.2 ? "rising" : first - second > 0.2 ? "falling" : "steady",
        yield: rate >= 0.6 || mean >= 6 ? "high" : rate >= 0.3 ? "medium" : "low",
        due: rate >= 0.6 && n - 1 - last >= 2
      };
    });
    return { paper: paperId, sittings: sits, marks: total / n, leaves: out };
  }
  /* a leaf's weight for a scope: the paper's mean marks, else 1 (uniform
     where there is no index: IT, or a custom scope across papers) */
  function weightOf(w, key) { return w && w.leaves[key] ? Math.max(0.25, w.leaves[key].mean) : 1; }

  /* ---------------- §9.3: the predicted grade ----------------
     bounds: rows from js/data/boundaries.js for this paper — a component
     row (raw marks out of its max) or the subject row read as a percentage.
     A grade is ALWAYS a range: the lowest grade any series gives the lowest
     recent percentage, to the highest any series gives the highest. */
  function boundaryRows(B, board, qual, paper) {
    if (!B || !B.rows) return [];
    var comp = B.rows.filter(function (r) { return r.board === board && r.qual === qual && r.component === paper; });
    var rows = comp.length ? comp : B.rows.filter(function (r) { return r.board === board && r.qual === qual && r.component === "subject"; });
    return rows.slice().sort(function (a, b) { return a.series < b.series ? 1 : -1; }).slice(0, 3);
  }
  function gradeAt(p, row) {
    for (var i = 0; i < GRADES.length; i++) {
      var g = GRADES[i], m = row.marks[g];
      if (m != null && p >= 100 * m / row.max) return g;
    }
    return "U";
  }
  function gradeIndex(g) { var i = GRADES.indexOf(g); return i === -1 ? GRADES.length : i; }
  /* attempts: [{pct, date}] timed, on this paper, newest last */
  function predicted(attempts, rows) {
    var list = (attempts || []).filter(function (a) { return a.pct != null; });
    if (list.length < NEED.rangePapers) return { thin: true, have: list.length, need: NEED.rangePapers };
    if (!rows || !rows.length) return { thin: true, noBounds: true, have: list.length, need: NEED.rangePapers };
    var recent = list.slice(-Math.max(3, Math.min(5, list.length)));
    var ps = recent.map(function (a) { return a.pct; });
    var lo, hi;
    if (ps.length >= 5) {
      var mean = ps.reduce(function (s, v) { return s + v; }, 0) / ps.length;
      var sd = Math.sqrt(ps.reduce(function (s, v) { return s + (v - mean) * (v - mean); }, 0) / ps.length);
      lo = mean - sd; hi = mean + sd;
    } else { lo = Math.min.apply(null, ps); hi = Math.max.apply(null, ps); }
    var gLo = null, gHi = null;
    rows.forEach(function (r) {
      var a = gradeAt(lo, r), b = gradeAt(hi, r);
      if (gLo == null || gradeIndex(a) > gradeIndex(gLo)) gLo = a;
      if (gHi == null || gradeIndex(b) < gradeIndex(gHi)) gHi = b;
    });
    var series = rows.map(function (r) { return r.series.slice(0, 4); }).sort();
    return { lo: gLo, hi: gHi, pctLo: round(lo), pctHi: round(hi), papers: recent.length,
      series: series, seriesText: series.length > 1 ? series[0] + "–" + series[series.length - 1].slice(2) : series[0],
      confirmed: rows.every(function (r) { return r.confirmed; }), notional: rows.some(function (r) { return r.notional; }),
      cut: rows.map(function (r) { var o = {}; GRADES.forEach(function (g) { if (r.marks[g] != null) o[g] = round(100 * r.marks[g] / r.max); }); return { series: r.series, pct: o }; }) };
  }
  /* "Target A* (≥ 77% in recent series): you need about +8 marks a paper" */
  function targetGap(grade, rows, lastPct, marks) {
    if (!grade || !rows || !rows.length || lastPct == null) return null;
    var cuts = rows.map(function (r) { return r.marks[grade] != null ? 100 * r.marks[grade] / r.max : null; }).filter(function (v) { return v != null; });
    if (!cuts.length) return null;
    var need = Math.max.apply(null, cuts);
    return { grade: grade, needPct: round(need), marks: Math.max(0, Math.ceil((need - lastPct) / 100 * (marks || 100))) };
  }

  /* ---------------- §7: the readiness band (decision E) ----------------
     signals: { coverage: {value 0..1} | {thin}, rag: {red, green, amber,
     unrated} | {thin}, recall: {value 0..1} | {thin}, practice: {last
     (pct)} | {thin} } — only the tier's own signals are passed. opts:
     { target (exam-day recall, 0..1), targetPct, f (0..1: how far through
     the run-up we are, from the start-by date to the start of the 7–14 day
     window) }. Returns { band, limit, ready, behind, silent, why }. */
  var NAMES = { coverage: "coverage", rag: "RAG", recall: "projected recall", practice: "timed practice" };
  function band(signals, opts) {
    opts = opts || {};
    var keys = Object.keys(signals);
    var silent = keys.filter(function (k) { return !signals[k] || signals[k].thin; });
    var f = clamp(opts.f == null ? 1 : opts.f, 0, 1);
    var target = opts.target || 0.9, tPct = opts.targetPct || 70;
    /* each signal's ratio to where a straight line to Ready says it should
       be by now (1 = exactly on the line) */
    var ratio = {}, readyOk = {};
    keys.forEach(function (k) {
      var s = signals[k];
      if (!s || s.thin) return;
      if (k === "coverage") { readyOk[k] = s.value >= 0.95; ratio[k] = f <= 0 ? 2 : s.value / (0.95 * f); }
      else if (k === "rag") {
        readyOk[k] = !s.red;
        var allowed = 0.25 * (1 - f);
        ratio[k] = s.red <= allowed ? 2 - s.red : allowed > 0 ? allowed / s.red : 0.5 / Math.max(0.01, s.red);
      }
      else if (k === "recall") { readyOk[k] = s.value >= target; ratio[k] = f <= 0 ? 2 : s.value / Math.max(0.01, target * f); }
      else if (k === "practice") { readyOk[k] = s.last != null && s.last >= tPct; ratio[k] = s.last == null ? 0 : f <= 0 ? 2 : s.last / Math.max(1, tPct * f); }
    });
    var have = Object.keys(ratio);
    if (silent.length >= 2 || !have.length) {
      return { band: "thin", limit: silent[0] || null, limitName: silent[0] ? NAMES[silent[0]] : null, silent: silent, ratio: ratio,
        why: "Two or more signals have no evidence yet." };
    }
    var lowest = have.slice().sort(function (a, b) { return ratio[a] - ratio[b]; })[0];
    var behind = have.filter(function (k) { return ratio[k] < 1; });
    if (behind.length) {
      return { band: "risk", limit: lowest, limitName: NAMES[lowest], behind: behind, silent: silent, ratio: ratio,
        why: NAMES[lowest] + " is behind where a straight line to Ready says it should be by now." };
    }
    if (!silent.length && have.every(function (k) { return readyOk[k]; })) {
      return { band: "ready", limit: null, silent: silent, ratio: ratio, why: "Every signal is at its target." };
    }
    /* On track names a limiter only when one signal is clearly the weak one:
       the one with no evidence, or the closest to the line */
    var lim = silent.length === 1 ? silent[0] : ratio[lowest] < 1.15 ? lowest : null;
    return { band: "on", limit: lim, limitName: lim ? NAMES[lim] : null, silent: silent, ratio: ratio,
      why: "Every signal with evidence is on the straight line to Ready." };
  }

  /* ---------------- §9.4: where the next ten marks come from ----------------
     leaves: [{key, title, weight, rate, appear, of, recall (0..1|null),
     rag ("g"|"a"|"r"|null), lost, avail, tags {tag: n}, questions: [label]}]
     Returns the top items, each with its expected gain an hour and the
     words of its evidence. */
  function nextMarks(leaves, opts) {
    opts = opts || {};
    var out = (leaves || []).map(function (l) {
      var loss, from;
      if (l.avail > 0) { loss = l.lost / l.avail; from = "attempts"; }
      else if (l.recall != null) { loss = 1 - l.recall; from = "recall"; }
      else if (l.rag) { loss = l.rag === "r" ? 0.5 : l.rag === "a" ? 0.3 : 0.1; from = "rag"; }
      else return null;
      if (!(loss > 0)) return null;
      var top = Object.keys(l.tags || {}).sort(function (a, b) { return l.tags[b] - l.tags[a]; })[0];
      var fix = top ? FIX_HOURS[top] || 1 : 1;
      var weight = l.weight || 1, rate = l.rate == null ? 1 : l.rate;
      return { key: l.key, title: l.title, gain: weight * rate * loss / fix, weight: l.weight == null ? null : l.weight, rate: l.rate == null ? null : l.rate, loss: loss, from: from,
        appear: l.appear, of: l.of, lost: l.lost, avail: l.avail, tags: l.tags || {}, top: top || null, fix: fix,
        questions: l.questions || [], due: !!l.due, recall: l.recall };
    }).filter(Boolean).sort(function (a, b) { return b.gain - a.gain; });
    return out.slice(0, opts.n || 3);
  }

  /* ---------------- §9.4 error patterns ----------------
     questions: every question row of the attempts read, [{tags, max, got}].
     Fewer than ten tagged questions give EARLY NOTES, labelled so. */
  function patterns(questions) {
    var tagged = 0, lost = 0, by = {}, qs = {};
    (questions || []).forEach(function (q) {
      if (q.max == null || q.got == null) return;
      var l = Math.max(0, q.max - q.got);
      if (!l) return;
      lost += l;
      if (!q.tags || !q.tags.length) return;
      tagged++;
      q.tags.forEach(function (t) {
        by[t] = (by[t] || 0) + l / q.tags.length;
        (qs[t] = qs[t] || []).push(q.label || q.q);
      });
    });
    var list = Object.keys(by).map(function (t) { return { tag: t, marks: round(by[t], 1), share: lost ? round(by[t] / lost, 2) : 0, questions: qs[t] || [], fix: TAG_FIX[t] || null }; })
      .sort(function (a, b) { return b.marks - a.marks; });
    return { tagged: tagged, lost: lost, early: tagged < NEED.patterns, need: NEED.patterns, list: list };
  }

  /* ---------------- §9.5 pace ----------------
     Minutes per mark on a timed attempt against the paper's own budget
     (its minutes ÷ its marks), extra time included. */
  function pace(attempt, budgetMins, budgetMarks, extraPct) {
    if (!attempt || !attempt.timed || !attempt.mins || !attempt.max) return null;
    var per = attempt.mins / attempt.max;
    var budget = budgetMins && budgetMarks ? budgetMins * (1 + (extraPct || 0) / 100) / budgetMarks : null;
    var ran = (attempt.questions || []).filter(function (q) { return (q.tags || []).indexOf("time") !== -1; }).map(function (q) { return q.q; });
    return { perMark: round(per, 2), budget: budget ? round(budget, 2) : null, over: budget ? per > budget * 1.05 : false, ranOut: ran };
  }

  /* ---------------- §9.6 calibration ----------------
     attempts: [{predicted, marks, max, subject, date, label}] */
  function calibration(attempts) {
    var pts = (attempts || []).filter(function (a) { return a.predicted != null && a.marks != null && a.max > 0; })
      .map(function (a) { return { p: round(100 * a.predicted / a.max, 1), a: round(100 * a.marks / a.max, 1), subject: a.subject, date: a.date, label: a.label || "" }; });
    if (pts.length < NEED.calibration) return { thin: true, have: pts.length, need: NEED.calibration, points: pts };
    var by = {};
    pts.forEach(function (x) { var s = x.subject || "other"; (by[s] = by[s] || []).push(x.p - x.a); });
    var gaps = {};
    Object.keys(by).forEach(function (s) { gaps[s] = round(by[s].reduce(function (t, v) { return t + v; }, 0) / by[s].length, 1); });
    var all = pts.map(function (x) { return x.p - x.a; });
    return { points: pts, gap: round(all.reduce(function (t, v) { return t + v; }, 0) / all.length, 1), bySubject: gaps, n: pts.length };
  }

  /* ---------------- §8.2: the post-mortem ----------------
     entry: a tracker attempt with questions. nodeOf(key) → {unit, unitTitle,
     title} for a leaf. Lost marks by unit, by what the question asked (the
     index's `why`), by tag (untagged apart), and the three costliest. */
  function postMortem(entry, nodeOf, whyOf) {
    var qs = (entry && entry.questions) || [];
    var rows = qs.filter(function (q) { return q.max != null && q.got != null; });
    if (!rows.length) return null;
    var lost = 0, byUnit = {}, byWhy = {}, byTag = {}, untagged = 0, full = {};
    rows.forEach(function (q) {
      var l = Math.max(0, q.max - q.got);
      var units = {};
      (q.refs || []).forEach(function (k) { var n = nodeOf ? nodeOf(k) : null; if (n) units[n.unitTitle || n.unit] = true; });
      var uk = Object.keys(units);
      if (!l) { uk.forEach(function (u) { full[u] = true; }); return; }
      lost += l;
      uk.forEach(function (u) { byUnit[u] = (byUnit[u] || 0) + l / uk.length; });
      var w = whyOf ? whyOf(q) : null;
      if (w) byWhy[w] = (byWhy[w] || 0) + l;
      if (q.tags && q.tags.length) q.tags.forEach(function (t) { byTag[t] = (byTag[t] || 0) + l / q.tags.length; });
      else untagged += l;
    });
    function list(o) { return Object.keys(o).map(function (k) { return { label: k, marks: round(o[k], 1) }; }).sort(function (a, b) { return b.marks - a.marks; }); }
    var units = list(byUnit);
    Object.keys(full).forEach(function (u) { if (byUnit[u]) delete full[u]; });
    var costly = rows.filter(function (q) { return q.max > q.got; }).slice()
      .sort(function (a, b) { return (b.max - b.got) - (a.max - a.got) || b.max - a.max; }).slice(0, 3)
      .map(function (q) { return { q: q.q, lost: q.max - q.got, max: q.max, got: q.got, tags: q.tags || [], refs: q.refs || [], redo: !!q.redo, why: whyOf ? whyOf(q) : null }; });
    var top3 = units.slice(0, 3).reduce(function (s, u) { return s + u.marks; }, 0);
    return { lost: lost, units: units, whys: list(byWhy), tags: list(byTag), untagged: untagged, costly: costly,
      fullMarks: Object.keys(full), topThree: round(top3), anyTags: Object.keys(byTag).length > 0 };
  }

  /* ---------------- §16.8: what changed since the mock ----------------
     Two marked attempts with per-question rows on overlapping scope: marks
     lost by leaf then and now. A leaf in only one of the two says so. */
  function compare(then, now) {
    function lostBy(e) {
      var o = {}, any = false;
      ((e && e.questions) || []).forEach(function (q) {
        if (q.max == null || q.got == null || !(q.refs || []).length) return;
        any = true;
        var l = Math.max(0, q.max - q.got), share = 1 / q.refs.length;
        q.refs.forEach(function (k) { var r = o[k] || (o[k] = { lost: 0, avail: 0 }); r.lost += l * share; r.avail += q.max * share; });
      });
      return any ? o : null;
    }
    var a = lostBy(then), b = lostBy(now);
    if (!a || !b) return null;
    var keys = Object.keys(a).filter(function (k) { return b[k]; });
    if (!keys.length) return { overlap: 0, rows: [] };
    var rows = keys.map(function (k) { return { key: k, then: round(a[k].lost, 1), now: round(b[k].lost, 1), change: round(a[k].lost - b[k].lost, 1) }; })
      .sort(function (x, y) { return Math.abs(y.change) - Math.abs(x.change) || y.then - x.then; });
    var tThen = rows.reduce(function (s, r) { return s + r.then; }, 0), tNow = rows.reduce(function (s, r) { return s + r.now; }, 0);
    return { overlap: keys.length, rows: rows, then: round(tThen, 1), now: round(tNow, 1), change: round(tThen - tNow, 1),
      onlyThen: Object.keys(a).filter(function (k) { return !b[k]; }), onlyNow: Object.keys(b).filter(function (k) { return !a[k]; }),
      worse: rows.filter(function (r) { return r.change < 0; }) };
  }

  /* ---------------- §16.2: clash and load ----------------
     items: [{id, date, title, subject, tier}] (real exams, mocks and
     deadlines the user sits or hands in). Two on one day, or three in any
     48 hours, is a clash; the two days after a run of three are recovery
     days. Returns the days between the first and the last, and the runs. */
  function load(items, opts) {
    opts = opts || {};
    var list = (items || []).filter(function (x) { return x && x.date; }).slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    if (!list.length) return null;
    var byDay = {};
    list.forEach(function (x) { (byDay[x.date] = byDay[x.date] || []).push(x); });
    var days = Object.keys(byDay).sort();
    var runs = [], flag = {}, rest = {};
    days.forEach(function (d) {
      if (byDay[d].length >= 2) {
        runs.push({ kind: "day", from: d, to: d, items: byDay[d].slice() });
        flag[d] = "two";
      }
    });
    /* three within 48 hours: a window of three consecutive calendar days */
    days.forEach(function (d) {
      var win = [d, addDays(d, 1), addDays(d, 2)];
      var inWin = [];
      win.forEach(function (w) { (byDay[w] || []).forEach(function (x) { inWin.push(x); }); });
      if (inWin.length < 3) return;
      var last = win.filter(function (w) { return byDay[w]; }).pop();
      if (isoDays(d, last) > 2) return;
      if (runs.some(function (r) { return r.kind === "48h" && r.from <= d && r.to >= d; })) return;
      runs.push({ kind: "48h", from: d, to: last, items: inWin });
      win.forEach(function (w) { if (byDay[w] && !flag[w]) flag[w] = "48h"; });
      [1, 2].forEach(function (n) { var r = addDays(last, n); if (!byDay[r]) rest[r] = true; });
    });
    runs.sort(function (a, b) { return a.from < b.from ? -1 : 1; });
    var first = days[0], last = days[days.length - 1];
    var span = [], d = first, guard = 0;
    while (d <= last && guard++ < 400) {
      span.push({ date: d, items: byDay[d] || [], flag: flag[d] || null, rest: !!rest[d] });
      d = addDays(d, 1);
    }
    /* the strip shows exam days, flagged days and recovery days, and the
       quiet days only while the window is short (the frame's 12 cells) */
    var cells = span.length <= (opts.max || 14) ? span : span.filter(function (c) { return c.items.length || c.flag || c.rest; });
    return { from: first, to: last, cells: cells, runs: runs, count: list.length, days: span.length };
  }

  /* ---------------- §16.1: the timetable importer's parser ----------------
     Pasted board text ("9MA0 01 Pure Mathematics 1  Wed 03 Jun 2027 am
     2h") or an .ics (VEVENT SUMMARY + DTSTART). Returns the papers found,
     each with the board code it names, so the importer can match it. */
  var MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  function two(n) { return ("0" + n).slice(-2); }
  function parseDuration(s) {
    var m = /(\d+)\s*h(?:ours?)?\s*(\d+)?\s*(?:m(?:in(?:ute)?s?)?)?/i.exec(s || "");
    if (m) return (+m[1]) * 60 + (m[2] ? +m[2] : 0);
    var mm = /(\d+)\s*m(?:in(?:ute)?s?)\b/i.exec(s || "");
    return mm ? +mm[1] : null;
  }
  function codeOf(s) {
    var m = /\b(9MA0|8MA0|9FM0|8FM0|7517|7516|H119|H019|F2\d{2})\s*[\/\-\s]?\s*(\d{1,2}|[A-Z]{1,2}\d?)?\b/i.exec(s || "");
    if (!m) return null;
    var qual = m[1].toUpperCase();
    var paper = m[2] && /^\d+$/.test(m[2]) ? String(parseInt(m[2], 10)) : null;
    return { qual: qual, paper: qual.charAt(0) === "F" ? null : paper };
  }
  function parseText(text) {
    var out = [];
    String(text || "").split(/\r?\n/).forEach(function (line) {
      var raw = line.replace(/&nbsp;/g, " ").trim();
      if (!raw) return;
      var dm = /(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]{3,9})\.?\s+(\d{4})/.exec(raw) || null;
      var iso = /(\d{4})-(\d{2})-(\d{2})/.exec(raw);
      var date = null;
      if (iso) date = iso[1] + "-" + iso[2] + "-" + iso[3];
      else if (dm && MONTHS[dm[2].slice(0, 3).toLowerCase()]) date = dm[3] + "-" + two(MONTHS[dm[2].slice(0, 3).toLowerCase()]) + "-" + two(+dm[1]);
      var code = codeOf(raw);
      if (!date || !code) return;
      var session = /\b(am|morning)\b/i.test(raw) ? "am" : /\b(pm|afternoon)\b/i.test(raw) ? "pm" : null;
      var title = raw.replace(/\b(Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\b.*$/i, "").replace(/\s{2,}/g, " ").trim() || raw;
      out.push({ qual: code.qual, paper: code.paper, unit: code.qual.charAt(0) === "F" ? code.qual : null, date: date, session: session,
        mins: parseDuration(raw.slice(raw.indexOf(date.slice(0, 4)) + 4)), title: title, line: raw });
    });
    return out;
  }
  function parseICS(text) {
    var out = [];
    String(text || "").replace(/\r?\n[ \t]/g, "").split(/BEGIN:VEVENT/).slice(1).forEach(function (blk) {
      var sum = /SUMMARY[^:]*:(.*)/.exec(blk), st = /DTSTART[^:]*:(\d{8})(?:T(\d{2})(\d{2}))?/.exec(blk), en = /DTEND[^:]*:(\d{8})(?:T(\d{2})(\d{2}))?/.exec(blk);
      if (!sum || !st) return;
      var title = sum[1].replace(/\\,/g, ",").trim(), code = codeOf(title);
      if (!code) return;
      var date = st[1].slice(0, 4) + "-" + st[1].slice(4, 6) + "-" + st[1].slice(6, 8);
      var time = st[2] ? st[2] + ":" + st[3] : null;
      var mins = st[2] && en && en[2] && en[1] === st[1] ? (+en[2] * 60 + +en[3]) - (+st[2] * 60 + +st[3]) : null;
      out.push({ qual: code.qual, paper: code.paper, unit: code.qual.charAt(0) === "F" ? code.qual : null, date: date, time: time,
        session: time ? (+st[2] < 12 ? "am" : "pm") : null, mins: mins > 0 ? mins : null, title: title, line: title });
    });
    return out;
  }
  function parseTimetable(text) {
    return /BEGIN:VCALENDAR|BEGIN:VEVENT/.test(text || "") ? parseICS(text) : parseText(text);
  }

  var api = {
    GRADES: GRADES, NEED: NEED, FIX_HOURS: FIX_HOURS, TAG_FIX: TAG_FIX, NAMES: NAMES,
    weights: weights, weightOf: weightOf,
    boundaryRows: boundaryRows, gradeAt: gradeAt, predicted: predicted, targetGap: targetGap,
    band: band, nextMarks: nextMarks, patterns: patterns, pace: pace, calibration: calibration,
    postMortem: postMortem, compare: compare, load: load,
    parseTimetable: parseTimetable, parseText: parseText, parseICS: parseICS, codeOf: codeOf,
    addDays: addDays, isoDays: isoDays, pct: pct
  };
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) { root.KOS = root.KOS || {}; root.KOS.examStats = api; }
})(typeof window !== "undefined" ? window : null);
