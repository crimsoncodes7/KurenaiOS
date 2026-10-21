/* Kurenai OS — core/exampaper.js
   The paper engine (roadmap 5.8 phase 5, docs/exams-plan.md §13.5, frames
   29t, 29u; invariant 127). A paper is DERIVED, never stored: the same
   assessment and seed always give the same paper.

     blueprint(a)      the board paper's shape from the index: marks a
                       sitting, questions, the ramp, the minutes, the
                       budget a mark (extra time applied)
     build(a, seed, o) a practice paper to the blueprint, drawn from the
                       scope's own exam items (the topic banks), weighted
                       to the paper's high-yield leaves, short to long
     chips(part)       a part's mark points as tally chips (M1 A1 B1 dM1,
                       or one chip a mark), with a dM's parent
     toAttempt(p, ticks, meta)  the tally → ONE tracker attempt with marks
                       by question (§8.1); its source is the paper's seed

   The predicted papers, drawn from the archetype bank's original
   questions, arrive with each paper's exhaustive Companion (phase 6);
   until then a paper says which past paper each item is modelled on.
   Zero Governor traffic: the attempt logs its tracker session as any
   attempt does (invariant 129).                                         */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  function E() { return KOS.exams; }
  function C() { return KOS.examCompanion; }
  function IX() { return window.KOS_EXAMS && KOS_EXAMS.index; }

  function topQ(q) { return String(q).replace(/^Q0*/, "").split(/[.(]/)[0]; }
  function blueprint(a) {
    var pr = a && a.preset ? E().preset(a.preset) : null;
    var pid = C().indexPaperOf(a), ix = IX(), out = { paper: pid, board: C().boardOf(a) };
    var mins = (a && a.durationMins) || (pr && pr.durationMins) || null;
    if (pid) {
      var p = ix.papers[pid], sits = p.sittings.filter(function (s) { return s !== "specimen" && s !== "sample"; });
      var per = {};
      ix.questions.forEach(function (q) {
        if (q[0] !== pid || sits.indexOf(q[1]) === -1) return;
        var s = per[q[1]] || (per[q[1]] = { marks: 0, qs: {}, sec: {} });
        s.marks += q[4]; s.qs[q[2] + topQ(q[3])] = true; s.sec[q[2]] = (s.sec[q[2]] || 0) + q[4];
      });
      var keys = Object.keys(per), n = keys.length || 1;
      out.marks = p.marks;
      out.indexed = Math.round(keys.reduce(function (t, k) { return t + per[k].marks; }, 0) / n);
      out.questions = Math.round(keys.reduce(function (t, k) { return t + Object.keys(per[k].qs).length; }, 0) / n);
      out.sittings = sits.length;
      out.title = p.title;
    } else {
      out.marks = (a && a.marks) || 60;
      out.questions = Math.max(6, Math.round(out.marks / 6));
      out.title = a ? a.title : "Practice paper";
    }
    out.mins = mins || Math.round(out.marks * (out.board === "AQA" ? 1.5 : 1.2));
    out.extra = E().extraTimeOf(a);
    out.allowed = Math.round(out.mins * (1 + out.extra / 100));
    out.perMark = Math.round(out.allowed / out.marks * 100) / 100;
    return out;
  }

  /* a practice paper: items drawn without replacement, weighted to the
     paper's leaf weights (a leaf's mean marks a sitting, else even), at
     most two from one leaf, until the marks reach the blueprint's (or
     o.marks); then short to long */
  function DD() { return KOS.examDeep; }
  /* a leaf's own short paper from the full Companion: "pack-<ref>" (its
     five-question subtopic pack) or "set-<ref>" (its whole practice set) */
  function leafPaper(a, seed) {
    var m = /^(pack|set)-(.+)$/.exec(String(seed)), pid = DD() ? DD().paperOf(a) : null;
    if (!m || !pid) return null;
    var d = DD().data(pid), l = d.byLeaf[m[2]];
    if (!l) return null;
    var items = m[1] === "pack" ? DD().pack(pid, l.ref).items : DD().bank(pid, [l.key]);
    if (m[1] === "set") items.sort(function (x, y) { return x.d - y.d || x.marks - y.marks; });
    var bp = blueprint(a);
    var qs = number(items), sum = items.reduce(function (s, it) { return s + it.marks; }, 0);
    return { aid: a.id, seed: String(seed), kind: m[1], title: (m[1] === "pack" ? "Subtopic pack " : "Practice set ") + l.ref, for: l.title, subject: a.subject, board: bp.board, blueprint: bp,
      questions: qs, marks: sum, mins: Math.round(bp.perMark * sum * 100 / (100 + bp.extra)), allowed: Math.round(bp.perMark * sum) };
  }
  function number(picked) {
    var LET = "abcdefghij";
    return picked.map(function (it, i) {
      return { n: i + 1, id: it.id, key: it.key, ref: it.ref, title: it.title, ctx: it.ctx, src: it.src, origin: it.origin || null, marks: it.marks,
        parts: it.parts.map(function (p, j) { return { label: it.parts.length > 1 ? "(" + LET.charAt(j) + ")" : "", q: p.q, code: p.code || null, marks: p.marks, ms: p.ms, chips: chips(p) }; }) };
    });
  }
  /* the shapes "due by pattern": in at least half the sittings, absent
     from the last two — a predicted paper leans on them a little */
  function dueShapes(pid) {
    var ix = IX(), p = ix.papers[pid], sits = p.sittings.filter(function (s) { return s !== "specimen" && s !== "sample"; }).sort();
    var last = sits.slice(-2), out = {};
    DD().data(pid).archs.forEach(function (x) {
      var f = DD().freq(pid, DD().instances(pid, x));
      var recent = DD().instances(pid, x).some(function (q) { return last.indexOf(q.sitting) !== -1; });
      if (f.enough && f.appear * 2 >= f.of && !recent) out[x.id] = true;
    });
    return out;
  }
  function build(a, seed, o) {
    o = o || {};
    if (!a) return null;
    var lp = leafPaper(a, seed);
    if (lp) return lp;
    seed = Math.max(1, parseInt(seed, 10) || 1);
    var bp = blueprint(a), target = o.marks || bp.marks, rand = C().rng(a.id + ":paper:" + seed);
    var w = E().paperWeights ? E().paperWeights(a) : null;
    var pool = [];
    var pid = DD() ? DD().paperOf(a) : null;
    /* PREDICTED: the full Companion's original questions, weighted to the
       paper's high-yield leaves and its shapes due by pattern; one extended
       answer, last */
    if (pid) {
      var due = dueShapes(pid), ext = null;
      DD().bank(pid, E().leaves(a)).forEach(function (it) {
        if (it.extended) { if (!ext || rand() < 0.5) ext = it; return; }
        var lw = w && w.leaves[it.key] ? w.leaves[it.key].mean : 0.5;
        pool.push({ it: it, w: (0.5 + lw) * (due[it.arch] ? 1.5 : 1) * (it.d === 3 ? 1.2 : 1), r: rand() });
      });
      var pr = pick(pool, ext ? target - ext.marks : target);
      if (ext) pr.picked.push(ext), pr.sum += ext.marks;
      return { aid: a.id, seed: seed, kind: "predicted", title: "Predicted paper " + seed, for: a.title, subject: a.subject, board: bp.board, blueprint: bp,
        questions: number(pr.picked), marks: pr.sum, mins: Math.round(bp.perMark * pr.sum * 100 / (100 + bp.extra)), allowed: Math.round(bp.perMark * pr.sum) };
    }
    E().leaves(a).forEach(function (k) {
      var info = C().leafInfo(k);
      C().itemsOf(info).forEach(function (it) {
        if (!it.marks || it.parts.some(function (p) { return !p.ms.length; })) return;
        var lw = w && w.leaves[k] ? w.leaves[k].mean : 1;
        pool.push({ it: it, w: 0.5 + lw, r: rand() });
      });
    });
    var pk = pick(pool, target), sum = pk.sum;
    var qs = number(pk.picked);
    return { aid: a.id, seed: seed, kind: "practice", title: "Practice paper " + seed, for: a.title, subject: a.subject, board: bp.board, blueprint: bp,
      questions: qs, marks: sum, mins: Math.round(bp.perMark * sum * 100 / (100 + bp.extra)), allowed: Math.round(bp.perMark * sum) };
  }

  /* weighted order (an exponential race, −ln r ÷ weight, stable by seed),
     at most two items a leaf, until the marks reach the target; then short
     to long */
  function pick(pool, target) {
    var picked = [], sum = 0, perLeaf = {};
    pool.sort(function (x, y) { return (-Math.log(x.r || 1e-9) / x.w) - (-Math.log(y.r || 1e-9) / y.w); });
    pool.forEach(function (c) {
      if (sum >= target - 1) return;
      if ((perLeaf[c.it.key] || 0) >= 2) return;
      if (sum + c.it.marks > target + 2) return;
      picked.push(c.it); sum += c.it.marks; perLeaf[c.it.key] = (perLeaf[c.it.key] || 0) + 1;
    });
    picked.sort(function (x, y) { return x.marks - y.marks || (x.id < y.id ? -1 : 1); });
    return { picked: picked, sum: sum };
  }
  /* mark points from a scheme's lines: "[M1 A1]", "M1", "(1)", "[2 marks]".
     When the lines do not add up to the part's marks, one chip a mark. */
  function chips(part) {
    var out = [], lastM = null;
    (part.ms || []).forEach(function (line, li) {
      var t = String(line);
      var codes = t.match(/\b(dM\d|M\d|A\d|B\d)\b/g);
      if (codes) {
        codes.forEach(function (c) {
          var v = +c.replace(/\D/g, "") || 1;
          var chip = { id: li + ":" + out.length, label: c, value: v, line: li };
          if (/^M/.test(c)) lastM = chip.id;
          if (/^dM/.test(c)) chip.needs = lastM;
          if (/^A/.test(c) && lastM) chip.needs = lastM;
          out.push(chip);
        });
        return;
      }
      /* a trailing "(n)" first, so a scheme line's own brackets (VARCHAR(20)) are not marks */
      var m = /\((\d+)\)\s*$/.exec(t) || /\[(\d+) marks?\]|\((\d+)\)/.exec(t);
      if (m && m.length === 2) m = [m[0], null, m[1]];
      var n = m ? +(m[1] || m[2]) : 0;
      for (var i = 0; i < n; i++) out.push({ id: li + ":" + out.length, label: "✓", value: 1, line: li });
    });
    var total = out.reduce(function (s, c) { return s + c.value; }, 0);
    if (total !== part.marks) {
      out = [];
      for (var k = 0; k < part.marks; k++) out.push({ id: "m" + k, label: String(k + 1), value: 1, line: null });
    }
    return out;
  }
  /* what a part scores from its ticked chips; a chip whose parent is not
     ticked scores nothing (a dM or an A needs its M) */
  function partScore(part, ticks) {
    var on = function (c) { return !!ticks[c.id]; };
    return part.chips.reduce(function (s, c) {
      if (!on(c)) return s;
      if (c.needs && !part.chips.some(function (p) { return p.id === c.needs && on(p); })) return s;
      return s + c.value;
    }, 0);
  }
  /* the tally: ticks[n][partIndex][chipId] → one attempt */
  function toAttempt(paper, ticks, meta) {
    meta = meta || {};
    var questions = [], total = 0, max = 0;
    paper.questions.forEach(function (q) {
      q.parts.forEach(function (p, j) {
        var t = (ticks[q.n] && ticks[q.n][j]) || {}, marked = !!(ticks[q.n] && ticks[q.n][j]);
        var got = marked ? partScore(p, t) : null;
        questions.push({ q: q.n + (p.label ? p.label : ""), max: p.marks, got: got, refs: [q.key] });
        if (got != null) total += got;
        max += p.marks;
      });
    });
    var marked = questions.filter(function (x) { return x.got != null; }).length;
    return {
      kind: "paper", paper: paper.title + " · " + paper.for, topic: paper.title, subject: paper.subject,
      marks: marked ? total : null, max: max, date: meta.date || KOS.srs.todayISO(),
      assessmentId: paper.aid, role: "practice", source: { kind: "custom-mock", ref: paper.aid + ":" + paper.seed },
      timed: !!meta.timed, mins: meta.mins || null, conditions: meta.timed ? "exam" : "untimed",
      predicted: meta.predicted != null ? meta.predicted : null,
      questions: questions, notes: meta.breaks ? "Rest breaks: " + meta.breaks : ""
    };
  }

  KOS.examPaper = { blueprint: blueprint, build: build, chips: chips, partScore: partScore, toAttempt: toAttempt };
})();
