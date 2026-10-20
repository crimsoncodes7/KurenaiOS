/* Kurenai OS — core/report.js
   Reports (roadmap 5.1, docs/reports-plan.md): the periods and the facts.

   PERIODS. A week is Monday–Sunday; a month is a calendar month; a term
   is a run of plan weeks between breaks of two weeks or more (Christmas,
   Easter, summer — a one-week half term stays inside its term); a year is
   the academic year, 1 September to 31 August. Every period is
   {period, id, start, end} with ISO dates, both inclusive, local time.

   FACTS. `compute(input)` is PURE: it reads only what it is handed (the
   session ledger, the media rows, the boundary snapshots, plan and task
   records) and returns plain data, so a saved report is the facts as they
   stood and is never recomputed (README rule 7). `gather()` assembles the
   input from the single sources (invariant 26d); `build()` is both.

   The README's rules are applied HERE, at build, so a renderer never has
   to decide them: a supporting zero is simply absent (rule 1); recall
   needs 50 reviews, a day chart three active days and a persona five
   Focus blocks (rule 2); a comparison is a value, never a string, and the
   words decide "same as" / "new" (rule 5); earnings are past and only
   counted where the ledger recorded them (rule 6, invariant 100).

   A report rebuilt from history (before the snapshots and the journal
   existed) leaves out what history cannot support: status moves, title
   progress ranges and, where the awards were not recorded, earnings.   */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var SUBJECTS = ["compsci", "maths", "it"];
  var MODULES = ["anime", "books", "vn", "game"];
  var MIN_RECALL_REVIEWS = 50, MIN_CHART_DAYS = 3, MIN_PERSONA_BLOCKS = 5, MIN_STORIES = 4;
  var HEAT_FROM = 7, HEAT_TO = 23;   // the heat grid's hours, 07–23
  var DAY = 864e5;

  /* ---------------- dates ---------------- */
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function iso(d) { return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()); }
  function parse(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(s, n) { var d = parse(s); d.setDate(d.getDate() + n); return iso(d); }
  function days(a, b) { return Math.round((parse(b) - parse(a)) / DAY); }
  function monday(s) { var d = parse(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); }
  function ms(s) { return parse(s).getTime(); }

  /* ---------------- periods ---------------- */
  function week(dateISO) {
    var start = monday(dateISO);
    return { period: "week", id: "week:" + start, start: start, end: addDays(start, 6) };
  }
  function month(dateISO) {
    var d = parse(dateISO), s = new Date(d.getFullYear(), d.getMonth(), 1), e = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { period: "month", id: "month:" + iso(s).slice(0, 7), start: iso(s), end: iso(e) };
  }
  function year(dateISO) {
    var d = parse(dateISO), y = d.getMonth() >= 8 ? d.getFullYear() : d.getFullYear() - 1;
    return { period: "year", id: "year:" + y, start: y + "-09-01", end: (y + 1) + "-08-31",
      label: y + "–" + String(y + 1).slice(2) };
  }
  /* the plan's terms: runs of school weeks split by 2+ consecutive weeks
     without one. Named by the month they start in. */
  function terms() {
    if (!KOS.pacing || !KOS.pacing.weeks) return [];
    var ws = KOS.pacing.weeks(), out = [], cur = null, gap = 0;
    /* a term is SCHOOL weeks: a week the class plan does not teach is a
       break even when the personal plan studies through it (Christmas) */
    ws.forEach(function (w) {
      if (w.schoolWk == null) { gap++; if (gap >= 2 && cur) { out.push(cur); cur = null; } return; }
      gap = 0;
      if (!cur) cur = { start: w.wb, end: addDays(w.wb, 6) };
      else cur.end = addDays(w.wb, 6);
    });
    if (cur) out.push(cur);
    return out.map(function (t) {
      var m = parse(t.start).getMonth();
      var name = m >= 7 ? "Autumn term" : m <= 2 ? "Spring term" : "Summer term";
      return { period: "term", id: "term:" + t.start, start: t.start, end: t.end,
        label: name + " " + parse(t.start).getFullYear() };
    });
  }
  function term(dateISO) {
    return terms().filter(function (t) { return t.start <= dateISO && dateISO <= t.end; })[0] || null;
  }
  function of(period, dateISO) {
    return period === "week" ? week(dateISO) : period === "month" ? month(dateISO)
      : period === "year" ? year(dateISO) : period === "term" ? term(dateISO) : null;
  }
  /* the period before one (a term's predecessor is the previous term) */
  function previous(p) {
    if (p.period === "term") {
      var ts = terms().filter(function (t) { return t.end < p.start; });
      return ts.length ? ts[ts.length - 1] : null;
    }
    return of(p.period, addDays(p.start, -1));
  }
  /* has it ended — and is it READY: a week is ready on its following
     Monday at 07:00 (README rule 8), the others on their first morning */
  function readyAt(p) { return ms(addDays(p.end, 1)) + 7 * 3600e3; }
  function isReady(p, now) { return (now == null ? Date.now() : now) >= readyAt(p); }

  /* ---------------- small helpers ---------------- */
  function sum(a) { return a.reduce(function (x, y) { return x + y; }, 0); }
  function round(n) { return Math.round(n); }
  function median(a) {
    if (!a.length) return 0;
    var s = a.slice().sort(function (x, y) { return x - y; }), m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }
  function topN(map, n) {
    return Object.keys(map).map(function (k) { return { name: k, n: map[k] }; })
      .sort(function (a, b) { return b.n - a.n || (a.name < b.name ? -1 : 1); }).slice(0, n);
  }
  function inc(map, k, by) { map[k] = (map[k] || 0) + (by == null ? 1 : by); }
  /* a study entry, exactly as sessions.js counts one (invariant 4) */
  function isStudy(e) {
    return e.type !== "media" && e.type !== "todo" &&
      !(e.type === "focus" && e.metrics && e.metrics.complete === false);
  }
  function leavesOf(e) {
    var refs = e.refs && e.refs.length ? e.refs : (e.subject && e.ref ? [e.subject + ":" + e.ref] : []);
    if (!refs.length) return [];
    if (!KOS.spec || !KOS.spec.resolve) return refs;
    /* the ledger is history: a ref folded into another leaf since
       (store.js REF_ALIASES) is read under its kept name, and one the
       specification no longer has is not a topic at all */
    var named = refs.map(function (k) {
      var i = String(k).indexOf(":");
      var moved = i > 0 && KOS.store.renamedRef ? KOS.store.renamedRef(k.slice(0, i), k.slice(i + 1)) : null;
      return moved ? k.slice(0, i) + ":" + moved : k;
    });
    return KOS.spec.resolve(named);
  }
  function titleOf(key) {
    var n = KOS.spec && KOS.spec.node ? KOS.spec.node(key) : null;
    return n ? n.title : key.slice(key.indexOf(":") + 1);
  }
  /* streak ending on `end` from the ledger: consecutive days with a study
     entry, the same yesterday-grace as sessions.streak() */
  function streakAt(ledger, end, test) {
    var days = {};
    ledger.forEach(function (e) { if (test(e)) days[e.date] = true; });
    var d = days[end] ? end : addDays(end, -1), n = 0;
    while (days[d] && n < 3660) { n++; d = addDays(d, -1); }
    return n;
  }
  function bestStreak(ledger, end) {
    var ds = {};
    ledger.forEach(function (e) { if (e.date <= end && isStudy(e)) ds[e.date] = true; });
    var best = 0, run = 0, prev = null;
    Object.keys(ds).sort().forEach(function (d) {
      run = prev && addDays(prev, 1) === d ? run + 1 : 1;
      if (run > best) best = run;
      prev = d;
    });
    return best;
  }

  /* ---------------- study ---------------- */
  var MIN_TOPIC_RECALL = 10;   // a topic's own recall needs 10 reviews
  function unitOf(key) {
    var n = KOS.spec && KOS.spec.node ? KOS.spec.node(key) : null;
    if (!n || !n.unit) return null;
    var u = KOS.spec.node(n.subject, n.unit);
    return u ? { key: u.key, sid: n.subject, ref: u.ref, title: u.title } : null;
  }
  /* the label a study entry gets in "what you studied next" */
  function flowNode(e) {
    if (e.type === "flashcards" || e.type === "due-review") return "cards";
    if (e.type === "quiz") return "quiz";
    return e.subject || null;
  }
  function study(input, p) {
    var L = input.inRange, n = days(p.start, p.end) + 1;
    var bySubject = {}, dayMins = [], daySubj = [], studyDays = {}, topics = {}, decks = {};
    for (var i = 0; i < n; i++) { dayMins.push(0); daySubj.push({}); }
    var sessions = 0, mins = 0, reviews = 0, again = 0, quizzes = 0, quizPct = [], exams = 0, marks = 0, max = 0, results = 0;
    var bestQuiz = null, timed = [], seq = [];
    function topic(k) {
      return topics[k] = topics[k] || { key: k, sid: k.slice(0, k.indexOf(":")), ref: k.slice(k.indexOf(":") + 1),
        title: titleOf(k), mins: 0, reviews: 0, again: 0, quizzes: 0 };
    }
    L.slice().sort(function (x, y) { return x.ts - y.ts; }).forEach(function (e) {
      var m = e.metrics || {}, leaves = leavesOf(e);
      var focusE = e.type === "focus";
      if (!focusE && !isStudy(e)) return;
      if (isStudy(e)) { studyDays[e.date] = true; seq.push(e); }
      if (focusE) {
        var mm = (e.dur || 0) / 60;
        sessions++; mins += mm;
        if (e.subject) inc(bySubject, e.subject, mm);
        var di = days(p.start, e.date);
        if (di >= 0 && di < n) { dayMins[di] += mm; if (e.subject) inc(daySubj[di], e.subject, mm); }
        leaves.forEach(function (k) { topic(k).mins += mm / leaves.length; });
        if (mm > 0) timed.push({ ts: e.ts - (e.dur || 0) * 1000, mins: mm, sid: e.subject || null,
          label: leaves.length ? KOS.spec && KOS.spec.label ? KOS.spec.label(leaves[0]) : titleOf(leaves[0]) : null });
      } else if (e.type === "flashcards" || e.type === "due-review") {
        reviews += m.cards || 0; again += m.again || 0;
        leaves.forEach(function (k) {
          var t = topic(k); t.reviews += (m.cards || 0) / leaves.length; t.again += (m.again || 0) / leaves.length;
          var u = unitOf(k);
          if (u) {
            var d = decks[u.key] = decks[u.key] || { key: u.key, sid: u.sid, ref: u.ref, title: u.title, reviews: 0, again: 0 };
            d.reviews += (m.cards || 0) / leaves.length; d.again += (m.again || 0) / leaves.length;
          }
        });
      } else if (e.type === "quiz") {
        quizzes++; if (m.pct != null) quizPct.push(m.pct);
        leaves.forEach(function (k) { topic(k).quizzes++; });
        /* a "best" quiz has to be a good one: half marks or better */
        if (m.total && (m.pct || 0) >= 50 && (!bestQuiz || m.pct > bestQuiz.pct)) {
          bestQuiz = { key: leaves[0] || null, title: leaves[0] ? titleOf(leaves[0]) : null, correct: m.correct || 0, total: m.total, pct: m.pct || 0, date: e.date };
        }
      } else if (e.type === "exam") {
        exams++; marks += m.marks || 0; max += m.max || 0;
        leaves.forEach(function (k) { topic(k); });
      } else if (e.type === "tracker") {
        results++;
        leaves.forEach(function (k) { topic(k); });
      }
    });
    /* status moves, from the boundary snapshots */
    var s0 = input.snapStart, s1 = input.snapEnd, toGreen = null, moves = null;
    if (s0 && s1) {
      toGreen = 0; moves = [];
      Object.keys(s1.topics || {}).forEach(function (k) {
        var a = ((s0.topics || {})[k] || [])[0] || null, b = s1.topics[k][0] || null;
        if (a === b) return;
        moves.push({ key: k, from: a, to: b });
        if (b === "g") toGreen++;
        if (topics[k]) { topics[k].from = a; topics[k].to = b; }
      });
    }
    /* the band each touched topic ended on, for the "Green" / "Amber" column */
    if (s1) Object.keys(topics).forEach(function (k) { var b = ((s1.topics || {})[k] || [])[0]; if (b) topics[k].band = b; });
    var list = Object.keys(topics).map(function (k) {
      var t = topics[k];
      t.mins = round(t.mins); t.reviews = round(t.reviews);
      if (t.reviews >= MIN_TOPIC_RECALL) t.recall = round(100 * (t.reviews - t.again) / t.reviews);
      delete t.again;
      return t;
    }).sort(function (a, b) { return b.mins - a.mins || b.reviews - a.reviews || b.quizzes - a.quizzes || (a.key < b.key ? -1 : 1); });
    Object.keys(bySubject).forEach(function (k) { bySubject[k] = round(bySubject[k]); });
    var out = {
      mins: round(mins), sessions: sessions, days: Object.keys(studyDays).length, of: n,
      bySubject: bySubject, dayMins: dayMins.map(round),
      daySubj: daySubj.map(function (d) { var o = {}; Object.keys(d).forEach(function (k) { if (round(d[k])) o[k] = round(d[k]); }); return o; }),
      chartDays: Object.keys(studyDays).length >= MIN_CHART_DAYS,
      reviews: reviews,
      recall: reviews >= MIN_RECALL_REVIEWS ? round(100 * (reviews - again) / reviews) : null,
      quizzes: quizzes, quizPct: quizPct.length ? round(sum(quizPct) / quizPct.length) : null,
      exams: exams, results: results,
      topics: list, touched: list.length, toGreen: toGreen, moves: moves, again: again
    };
    if (max) { out.marks = marks; out.max = max; }
    /* the busiest day, for the longer periods (a week reads its chart) */
    var bi = -1;
    dayMins.forEach(function (m, i) { if (m > 0 && (bi < 0 || m > dayMins[bi])) bi = i; });
    if (bi >= 0) out.busiest = { date: addDays(p.start, bi), mins: round(dayMins[bi]) };
    var dk = Object.keys(decks).map(function (k) {
      var d = decks[k]; d.reviews = round(d.reviews);
      d.recall = d.reviews ? round(100 * (d.reviews - d.again) / d.reviews) : null;
      delete d.again; return d;
    }).filter(function (d) { return d.reviews; }).sort(function (a, b) { return b.reviews - a.reviews; });
    if (dk.length) out.decks = dk;
    /* highs and lows: recall over topics with enough reviews */
    var rated = list.filter(function (t) { return t.recall != null; });
    if (rated.length >= 2) {
      var byRecall = rated.slice().sort(function (a, b) { return b.recall - a.recall || b.reviews - a.reviews; });
      out.bestRecall = { key: byRecall[0].key, title: byRecall[0].title, recall: byRecall[0].recall, reviews: byRecall[0].reviews };
      var lo = byRecall[byRecall.length - 1];
      if (lo.recall < byRecall[0].recall) out.lowRecall = { key: lo.key, title: lo.title, recall: lo.recall, reviews: lo.reviews };
    }
    if (bestQuiz) out.bestQuiz = bestQuiz;
    /* firsts, lasts and the longest */
    if (timed.length) {
      var lng = timed.slice().sort(function (a, b) { return b.mins - a.mins; })[0];
      out.firsts = { first: timed[0], last: timed[timed.length - 1], longest: lng };
      ["first", "last", "longest"].forEach(function (k) { out.firsts[k] = Object.assign({}, out.firsts[k], { mins: round(out.firsts[k].mins) }); });
    }
    /* what came next: consecutive study entries on one day, a change of
       subject or of kind (cards, quiz) */
    var pairs = {};
    for (var j = 1; j < seq.length; j++) {
      if (seq[j].date !== seq[j - 1].date) continue;
      var x = flowNode(seq[j - 1]), y = flowNode(seq[j]);
      if (x && y && x !== y) inc(pairs, x + ">" + y);
    }
    var fl = topN(pairs, 3).filter(function (f) { return f.n >= 2; })
      .map(function (f) { var ab = f.name.split(">"); return { from: ab[0], to: ab[1], n: f.n }; });
    if (fl.length) out.flow = fl;
    /* next up, template rule: the three lowest-recall topics */
    var next = rated.filter(function (t) { return t.recall < 80; }).sort(function (a, b) { return a.recall - b.recall; }).slice(0, 3)
      .map(function (t) { return { key: t.key, sid: t.sid, ref: t.ref, title: t.title, recall: t.recall }; });
    if (next.length) out.next = next;
    return out;
  }

  /* ---------------- focus ---------------- */
  var PERSONAS = {
    nightOwl:  { name: "Night Owl", kanji: "梟" },
    evening:   { name: "Evening Sprinter", kanji: "夕" },
    early:     { name: "Early Riser", kanji: "朝" },
    deep:      { name: "Deep Diver", kanji: "深" },
    daylight:  { name: "Daylight Scholar", kanji: "昼" }
  };
  function hhmm(h) { return pad(h) + ":00"; }
  function focus(input, p) {
    var F = input.inRange.filter(function (e) { return e.type === "focus" && (e.dur || 0) > 0; });
    var n = days(p.start, p.end) + 1, heat = [], byDay = [], hourMins = [], modes = {}, lens = [], blocks = [];
    var wk = p.period === "week";
    for (var d = 0; d < 7; d++) { heat.push([]); for (var h = HEAT_FROM; h < HEAT_TO; h++) heat[d].push(0); }
    for (var i = 0; i < n; i++) byDay.push(0);
    for (var hh = 0; hh < 24; hh++) hourMins.push(0);
    F.forEach(function (e) {
      var start = e.ts - e.dur * 1000, mins = e.dur / 60;
      lens.push(mins);
      inc(modes, (e.metrics && e.metrics.mode) || "pomodoro");
      var di = days(p.start, e.date);
      if (di >= 0 && di < n) byDay[di] += mins;
      /* spread the minutes over the clock hours they covered */
      for (var t = start; t < e.ts; ) {
        var dt = new Date(t), next = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate(), dt.getHours() + 1).getTime();
        var seg = (Math.min(next, e.ts) - t) / 60000;
        hourMins[dt.getHours()] += seg;
        var wd = (dt.getDay() + 6) % 7, hr = dt.getHours();
        if (hr >= HEAT_FROM && hr < HEAT_TO) heat[wd][hr - HEAT_FROM] += seg;
        t = next;
      }
      if (wk) blocks.push({ ts: start, end: e.ts, mins: round(mins), sid: e.subject || null, mode: (e.metrics && e.metrics.mode) || null });
    });
    var total = sum(hourMins);
    var out = { blocks: F.length };
    if (!F.length) return out;
    var peak = 0;
    hourMins.forEach(function (m, h) { if (m > hourMins[peak]) peak = h; });
    out.mins = round(total);
    out.longest = round(Math.max.apply(null, lens));
    out.typical = round(median(lens));
    out.peakHour = peak;
    out.peakShare = total ? round(100 * hourMins[peak] / total) : 0;
    out.modes = modes;
    out.byDay = byDay.map(round);
    out.heat = heat.map(function (r) { return r.map(round); });
    out.hours = hourMins.map(round);
    if (wk) out.list = blocks;
    out.lengths = lens.map(round);
    /* the persona: a playful name over a factual line (README "Personas") */
    if (F.length >= MIN_PERSONA_BLOCKS && total > 0) {
      var share = function (a, b) { return sum(hourMins.slice(a, b)) / total; };
      var eve = share(18, 24), late = share(21, 24) + share(0, 4), morn = share(4, 12);
      var pct = function (x) { return round(100 * x); };
      var id, fact;
      if (late >= 0.35) { id = "nightOwl"; fact = pct(late) + "% of your Focus came after 21:00."; }
      else if (eve >= 0.5) { id = "evening"; fact = pct(eve) + "% of your Focus came after 18:00, in blocks of about " + out.typical + " minutes."; }
      else if (morn >= 0.5) { id = "early"; fact = pct(morn) + "% of your Focus came before noon."; }
      else if (out.typical >= 50) { id = "deep"; fact = "Your typical block ran " + out.typical + " minutes, the longest " + out.longest + "."; }
      else { id = "daylight"; fact = pct(share(12, 18)) + "% of your Focus came between 12:00 and 18:00."; }
      out.persona = { id: id, name: PERSONAS[id].name, kanji: PERSONAS[id].kanji, fact: fact,
        stats: [[hhmm(peak), "peak hour"], [out.longest + "m", "longest block"], [String(F.length), "blocks"]] };
    }
    return out;
  }

  /* ---------------- the plan, reminders and habits ---------------- */
  function plan(input, p) {
    var rows = (input.planRows || []).filter(function (r) { return r.source === "personal"; });
    if (!rows.length) return null;
    if (p.period !== "week") {
      var tk = rows.filter(function (r) { return r.done; }).length;
      var res2 = { planned: rows.length, ticked: tk };
      if (rows.length - tk) res2.carried = rows.length - tk;
      return res2;
    }
    var out = rows.map(function (r) {
      var row = { id: r.id, subject: r.subject || null, title: r.title || r.detail || "", done: !!r.done,
        refs: (r.refs || []).slice(0, 3) };
      if (r.done && r.doneAt) row.doneAt = r.doneAt;
      if (!r.done) row.carriedTo = addDays(input.planWb || p.start, 7);
      return row;
    });
    var ticked = out.filter(function (r) { return r.done; }).length;
    var res = { wb: input.planWb, rows: out, planned: out.length, ticked: ticked };
    if (out.length - ticked) res.carried = out.length - ticked;
    return res;
  }
  function tasks(input, p) {
    var a = ms(p.start), b = ms(addDays(p.end, 1));
    var done = (input.reminders || []).filter(function (r) { return r.done && r.completedAt >= a && r.completedAt < b; });
    var n = days(p.start, p.end) + 1;
    var habits = (input.habits || []).map(function (h) {
      var row = [];
      for (var i = 0; i < Math.min(n, 7); i++) row.push(!!(h.days && h.days[addDays(p.start, i)]));
      var kept = 0;
      for (var j = 0; j < n; j++) if (h.days && h.days[addDays(p.start, j)]) kept++;
      return { text: h.text, days: p.period === "week" ? row : undefined, kept: kept };
    }).filter(function (h) { return h.kept; });
    var out = {};
    if (done.length) { out.reminders = done.length; if (p.period === "week") out.done = done.sort(function (x, y) { return x.completedAt - y.completedAt; }).slice(0, 60).map(function (r) { return { title: r.title, at: r.completedAt }; }); }
    if (habits.length) out.habits = habits;
    if (habits.length && p.period !== "week") {
      var keptDays = 0;
      for (var k = 0; k < n; k++) {
        var dk = addDays(p.start, k);
        if ((input.habits || []).some(function (h) { return h.days && h.days[dk]; })) keptDays++;
      }
      out.habitDays = keptDays;
    }
    return Object.keys(out).length ? out : null;
  }

  /* ---------------- the Collection ---------------- */
  /* ≈ minutes for an amount of progress (decision D): an episode is its
     stored length (24 when unknown), a manga chapter 6, a light-novel
     chapter 20, a volume 45 (manga) or 240 (novel); VN/Games hours are
     the hours */
  function estMins(row, kind, amount) {
    if (kind === "hours") return amount * 60;
    var x = row.extra || {};
    if (kind === "progress" && row.module === "anime") return amount * (x.duration || 24);
    var novel = row.format === "lightNovel";
    if (kind === "progress") return amount * (novel ? 20 : 6);
    if (kind === "volumes") return amount * (novel ? 240 : 45);
    return 0;
  }
  var LANG_COUNTRY = { ja: "JP", ko: "KR", zh: "CN", "zh-Hans": "CN", "zh-Hant": "TW", en: "US" };
  function hoursText(h) {
    var m = round(h * 60), hh = Math.floor(m / 60), mm = m % 60;
    return hh ? (mm ? hh + "h " + mm + "m" : hh + "h") : mm + "m";
  }
  function collection(input, p) {
    var a = ms(p.start), b = ms(addDays(p.end, 1)), n = days(p.start, p.end) + 1;
    var wk = p.period === "week";
    var byId = {}, touched = {};
    (input.rows || []).forEach(function (r) { if (r.id != null) byId[r.id] = r; });
    function touch(r) { return touched[r.syncId || r.id] = touched[r.syncId || r.id] || { row: r, ev: [], days: {} }; }
    (input.rows || []).forEach(function (r) {
      (r.journal || []).forEach(function (ev) {
        if (ev[0] >= a && ev[0] < b) { var t = touch(r); t.ev.push(ev); t.days[iso(new Date(ev[0]))] = true; }
      });
      var ds = r.dates || {};
      if (ds.started && ds.started >= p.start && ds.started <= p.end) { touch(r).startedOn = ds.started; touch(r).days[ds.started] = true; }
      if (ds.finished && ds.finished >= p.start && ds.finished <= p.end) { touch(r).finishedOn = ds.finished; touch(r).days[ds.finished] = true; }
    });
    /* media sessions name the row they were about (by local id) */
    input.inRange.forEach(function (e) {
      if (e.type !== "media") return;
      var r = e.metrics && e.metrics.entryId != null ? byId[e.metrics.entryId] : null;
      if (r) touch(r).days[e.date] = true;
    });
    var keys = Object.keys(touched);
    if (!keys.length) return null;
    /* genre flow: after an event on one title, the next event on a
       DIFFERENT title — its leading genre against the first one's */
    var evs = [];
    keys.forEach(function (k) { touched[k].ev.forEach(function (ev) { evs.push({ ts: ev[0], k: k, g: (touched[k].row.genres || [])[0] || null }); }); });
    evs.sort(function (x, y) { return x.ts - y.ts; });
    var flows = {};
    for (var fi = 1; fi < evs.length; fi++) {
      if (evs[fi].k === evs[fi - 1].k || !evs[fi].g || !evs[fi - 1].g || evs[fi].g === evs[fi - 1].g) continue;
      inc(flows, evs[fi - 1].g + ">" + evs[fi].g);
    }
    var titles = [], byModule = {}, status = { finished: 0, started: 0, continued: 0, paused: 0, dropped: 0 };
    var genres = {}, tags = {}, countries = {}, formats = {}, studios = {}, authors = {}, dayTitles = [];
    var totalMins = 0, units = {}, scored = [], studioTitles = {}, authorTitles = {}, dayMinsC = [];
    for (var dm = 0; dm < n; dm++) dayMinsC.push(0);
    for (var i = 0; i < n; i++) dayTitles.push({});
    keys.forEach(function (k) {
      var t = touched[k], r = t.row, x = r.extra || {}, mins = 0, prog = {};
      var st = null;
      t.ev.forEach(function (ev) {
        var kind = ev[1];
        if (kind === "status") {
          if (ev[3] === "completed") st = "finished";
          else if (ev[3] === "dropped") st = st || "dropped";
          else if (ev[3] === "onHold") st = st || "paused";
          else if (ev[3] === "inProgress" && (ev[2] == null || ev[2] === "planned")) st = st || "started";
          return;
        }
        if (kind === "score") return;
        var from = typeof ev[2] === "number" ? ev[2] : 0, to = typeof ev[3] === "number" ? ev[3] : 0;
        var pr = prog[kind] = prog[kind] || { from: from, to: to };
        pr.to = to;
        if (to > from) {
          var em = estMins(r, kind, to - from), edi = days(p.start, iso(new Date(ev[0])));
          mins += em;
          if (edi >= 0 && edi < n) dayMinsC[edi] += em;
        }
      });
      if (!st && t.finishedOn) st = "finished";
      if (!st && t.startedOn) st = "started";
      st = st || "continued";
      status[st]++;
      var range = null;
      var unit = r.module === "anime" ? "ep" : "ch";
      if (prog.progress && prog.progress.to > prog.progress.from) {
        range = prog.progress.to - prog.progress.from === 1 ? unit + " " + prog.progress.to : unit + " " + (prog.progress.from + 1) + "–" + prog.progress.to;
        inc(units, unit, prog.progress.to - prog.progress.from);
      } else if (prog.volumes && prog.volumes.to > prog.volumes.from) {
        range = prog.volumes.to - prog.volumes.from === 1 ? "vol " + prog.volumes.to : "vol " + (prog.volumes.from + 1) + "–" + prog.volumes.to;
        inc(units, "vol", prog.volumes.to - prog.volumes.from);
      } else if (prog.route && prog.route.to > prog.route.from) {
        var nr = prog.route.to - prog.route.from;
        range = nr + " route" + (nr === 1 ? "" : "s");
        inc(units, "route", nr);
      } else if (prog.chapter && prog.chapter.to > prog.chapter.from) {
        var nc = prog.chapter.to - prog.chapter.from;
        range = nc + " part" + (nc === 1 ? "" : "s");
      }
      if (prog.hours && prog.hours.to > prog.hours.from) {
        var hrs = prog.hours.to - prog.hours.from;
        range = range ? range + " · " + hoursText(hrs) : hoursText(hrs);
        inc(units, "hours", hrs);
      }
      totalMins += mins;
      inc(byModule, r.module);
      (r.genres || []).forEach(function (g) { inc(genres, g); });
      (x.aniTags || []).forEach(function (g) { inc(tags, g); });
      var c = x.country || (x.olang ? LANG_COUNTRY[x.olang] || x.olang : null);
      if (c) inc(countries, c);
      var f = r.module === "vn" ? "Visual novel" : r.module === "game" ? "Game" : (x.format || r.format || null);
      if (f) inc(formats, f);
      if (r.module === "anime" && x.studio) { inc(studios, x.studio); (studioTitles[x.studio] = studioTitles[x.studio] || []).push(r.title); }
      if (r.module === "books" && r.author) { inc(authors, r.author); (authorTitles[r.author] = authorTitles[r.author] || []).push(r.title); }
      Object.keys(t.days).forEach(function (d) {
        var di = days(p.start, d);
        if (di >= 0 && di < n) inc(dayTitles[di], r.module);
      });
      if (r.score > 0) scored.push({ title: r.title, module: r.module, score: r.score, status: st, syncId: r.syncId || null });
      titles.push({ syncId: r.syncId || null, id: r.id, module: r.module, title: r.title, cover: r.coverUrl || null,
        status: st, score: r.score || 0, range: range, mins: round(mins) || undefined,
        genres: (r.genres || []).slice(0, 4), lastTs: Math.max.apply(null, t.ev.map(function (ev) { return ev[0]; }).concat([0])) });
    });
    Object.keys(status).forEach(function (k) { if (!status[k]) delete status[k]; });
    var gTotal = sum(Object.keys(genres).map(function (g) { return genres[g]; }));
    scored.sort(function (x, y) { return y.score - x.score || (x.title < y.title ? -1 : 1); });
    var out = {
      titles: titles.sort(function (x, y) { return (y.mins || 0) - (x.mins || 0) || y.lastTs - x.lastTs; }),
      count: titles.length, byModule: byModule, status: status,
      genres: topN(genres, 5).map(function (g) { return { name: g.name, n: g.n, pct: gTotal ? round(100 * g.n / titles.length) : 0 }; }),
      tags: topN(tags, 10), countries: topN(countries, 6), formats: topN(formats, 8),
      units: units
    };
    if (totalMins) out.estMins = round(totalMins);
    if (wk) out.dayTitles = dayTitles;
    var st0 = topN(studios, 1)[0], au0 = topN(authors, 1)[0];
    if (st0 && st0.n > 1) out.studio = { name: st0.name, n: st0.n, titles: studioTitles[st0.name].slice(0, 3) };
    if (au0 && au0.n > 1) out.author = { name: au0.name, n: au0.n, titles: authorTitles[au0.name].slice(0, 3) };
    var gf = topN(flows, 3).map(function (f) { var ab = f.name.split(">"); return { from: ab[0], to: ab[1], n: f.n }; });
    if (gf.length) out.flow = gf;
    /* the busiest day: the most titles touched */
    var busy = -1, busyN = 0;
    dayTitles.forEach(function (d, i) { var t = sum(Object.keys(d).map(function (k) { return d[k]; })); if (t > busyN) { busyN = t; busy = i; } });
    if (busy >= 0 && n > 1) out.busiest = { date: addDays(p.start, busy), titles: busyN, mins: round(dayMinsC[busy]) || undefined };
    if (scored.length >= 2 && scored[0].score !== scored[scored.length - 1].score) {
      out.hi = scored[0]; out.lo = scored[scored.length - 1];
    }
    if (scored.length) {
      var hist = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      scored.forEach(function (x2) { hist[Math.max(1, Math.min(10, Math.round(x2.score))) - 1]++; });
      out.scores = { n: scored.length, avg: Math.round(10 * sum(scored.map(function (x2) { return x2.score; })) / scored.length) / 10,
        median: median(scored.map(function (x2) { return x2.score; })), hist: hist,
        range: scored[0].score - scored[scored.length - 1].score };
    }
    return out;
  }

  /* ---------------- the Governor and Kurenai ---------------- */
  function governor(input, p) {
    var xp = 0, gold = 0, complete = true;
    input.inRange.forEach(function (e) {
      if (e.award) { xp += e.award.xp || 0; gold += e.award.gold || 0; }
      else complete = false;
    });
    var out = {
      streak: streakAt(input.ledger, p.end, function (e) { return e.date <= p.end && isStudy(e); }),
      rest: streakAt(input.ledger, p.end, function (e) { return e.date <= p.end && e.type === "media"; }),
      best: bestStreak(input.ledger, p.end)
    };
    if (complete && input.inRange.length) { out.xp = xp; out.gold = gold; }
    var s1 = input.snapEnd;
    if (s1 && s1.gov) {
      out.level = s1.gov.level;
      if (KOS.governor && KOS.governor.levelInfo && s1.gov.xp != null) {
        var li = KOS.governor.levelInfo(s1.gov.xp);
        out.levelPct = round(100 * li.into / li.need);
      }
    }
    var s0 = input.snapStart;
    if (s0 && s0.gov && s1 && s1.gov && s1.gov.level > s0.gov.level) out.levelFrom = s0.gov.level;
    return out;
  }
  /* Code (invariant 110's ledger): what was PROVEN in the period, from the
     code entries of the session ledger only — a task's first pass, the
     skills proven (task, retrieval, practice), retrievals and their grades,
     katas, capstones and Rider projects completed. Nothing here re-derives
     evidence from state.code: a saved report keeps what the ledger said. */
  function programming(input, p) {
    var es = input.inRange.filter(function (e) { return e.type === "code" && e.metrics; });
    if (!es.length) return null;
    var out = { tasks: 0, practice: 0, retrieval: 0, retrievalOk: 0, katas: 0, kataRight: 0, kataTotal: 0, capstones: 0, projects: 0, skills: 0, mins: 0 };
    var proved = {}, lessons = {}, days = {};
    es.forEach(function (e) {
      var m = e.metrics;
      days[e.date] = true;
      if (e.ref) lessons[e.ref] = (lessons[e.ref] || 0) + 1;
      if (e.dur) out.mins += e.dur / 60;
      if (m.kind === "task" && !m.seen && !m.topup) out.tasks++;
      else if (m.kind === "practice") out.practice++;
      else if (m.kind === "retrieval") { out.retrieval++; if (m.grade && m.grade !== "again") out.retrievalOk++; }
      else if (m.kind === "kata") { out.katas++; out.kataRight += m.right | 0; out.kataTotal += m.total | 0; }
      else if (m.kind === "capstone") out.capstones++;
      else if (m.kind === "project") out.projects++;
      (m.proved || []).forEach(function (c) { proved[c] = true; });
    });
    out.skills = Object.keys(proved).length;
    out.days = Object.keys(days).length;
    out.mins = round(out.mins);
    out.lessons = Object.keys(lessons).sort(function (a, b) { return lessons[b] - lessons[a] || (a < b ? -1 : 1); }).slice(0, 5)
      .map(function (ref) { var L = KOS.code && KOS.code.lesson ? KOS.code.lesson(ref) : null; return { ref: ref, title: L ? L.title : ref, n: lessons[ref] }; });
    /* zero-only facts are left out (invariant 77) */
    Object.keys(out).forEach(function (k) { if (out[k] === 0) delete out[k]; });
    return out;
  }
  /* Money (roadmap 5.4): the period's totals from the transactions gather()
     read, the three biggest categories, and — a month only, since budgets
     are monthly — the categories over budget. Category names are the
     user's own labels; payees and notes are never read here. */
  function moneyFacts(input, p) {
    var m = input.money;
    if (!m || !m.tx || !m.tx.length || !KOS.money) return null;
    var t = KOS.money.tally(m.tx), out = { currency: m.currency };
    out.income = t.income; out.outgoings = t.outgoings;
    out.toPots = t.toPots - t.fromPots;
    out.count = t.count; out.days = t.days;
    if (m.subs) out.subs = m.subs;
    var cats = Object.keys(t.byCat).filter(function (id) { return t.byCat[id].net > 0; })
      .sort(function (a, b) { return t.byCat[b].net - t.byCat[a].net || (a < b ? -1 : 1); });
    out.top = cats.slice(0, 3).map(function (id) { return { cat: id, name: m.names[id] || id, spent: t.byCat[id].net }; });
    if (p.period === "month") {
      out.over = cats.filter(function (id) { var b = m.budgets[id]; return b != null && t.byCat[id].net > b; })
        .map(function (id) { return { cat: id, name: m.names[id] || id, spent: t.byCat[id].net, budget: m.budgets[id] }; });
    }
    /* zero-only facts are left out (invariant 77) */
    Object.keys(out).forEach(function (k) { if (out[k] === 0 || (Array.isArray(out[k]) && !out[k].length)) delete out[k]; });
    return out.income || out.outgoings || out.toPots ? out : null;
  }
  /* Goals: repeating goals' periods judged inside this period, and one-off
     goals reached or missed in it. Reported, never paid (invariant 5b). */
  function goalFacts(input, p) {
    var gs = input.goals;
    if (!gs || !gs.length) return null;
    var from = new Date(p.start + "T00:00:00").getTime(), to = new Date(addDays(p.end, 1) + "T00:00:00").getTime();
    var out = { periodsMet: 0, periodsMissed: 0, reached: [], missed: [], metNames: [], missedNames: [], rows: [] };
    gs.forEach(function (g) {
      if (g.repeat) {
        var met = 0, missed = 0, last = null;
        Object.keys(g.outcomes || {}).sort().forEach(function (k) {
          var day = k.length === 7 ? k + "-01" : k;
          if (g.repeat === "month" && p.period === "week") return;
          if (day < p.start || day > p.end) return;
          if (g.outcomes[k].met) met++; else missed++;
          last = g.outcomes[k];
        });
        if (!met && !missed) return;
        out.periodsMet += met; out.periodsMissed += missed;
        (missed && !met ? out.missedNames : out.metNames).push(g.title);
        out.rows.push({ id: g.id, title: g.title, domain: g.domain, state: missed && !met ? "missed" : "met",
          repeat: g.repeat, met: met, of: met + missed, value: last ? last.value : null });
        return;
      }
      if (g.completedAt && g.completedAt >= from && g.completedAt < to) {
        out.reached.push({ id: g.id, title: g.title, domain: g.domain });
        out.rows.push({ id: g.id, title: g.title, domain: g.domain, state: "met", at: g.completedAt });
      } else if (g.status === "failed" && !g.failedManual && g.deadline && g.deadline >= p.start && g.deadline <= p.end) {
        out.missed.push({ id: g.id, title: g.title, domain: g.domain });
        out.rows.push({ id: g.id, title: g.title, domain: g.domain, state: "missed", deadline: g.deadline });
      }
    });
    Object.keys(out).forEach(function (k) { if (out[k] === 0 || (Array.isArray(out[k]) && !out[k].length)) delete out[k]; });
    return Object.keys(out).length ? out : null;
  }
  function kurenai(input, p) {
    var t = input.tally || {}, chats = 0, sched = 0, areas = {};
    Object.keys(t).forEach(function (d) {
      if (d < p.start || d > p.end) return;
      chats += t[d].c || 0; sched += t[d].s || 0;
      Object.keys(t[d].a || {}).forEach(function (k) { inc(areas, k, t[d].a[k]); });
    });
    if (!chats && !sched) return null;
    var out = { areas: areas };
    if (chats) out.chats = chats;
    if (sched) out.scheduled = sched;
    return out;
  }

  /* ================= the longer periods (24c–24e, 25e) ================= */
  /* mastery by unit: each unit's Red/Amber/Green mix at the start and at
     the end, from the two boundary snapshots; units that did not move are
     left out (24c "Units with no change are listed on Study › Review") */
  function mastery(input) {
    var s0 = input.snapStart, s1 = input.snapEnd;
    if (!s0 || !s1) return null;
    var units = {};
    function add(snap, side) {
      Object.keys(snap.topics || {}).forEach(function (k) {
        var band = snap.topics[k][0];
        if (!band) return;
        var u = unitOf(k);
        if (!u) return;
        var row = units[u.key] = units[u.key] || { key: u.key, sid: u.sid, ref: u.ref, title: u.title, start: { r: 0, a: 0, g: 0 }, end: { r: 0, a: 0, g: 0 } };
        row[side][band]++;
      });
    }
    add(s0, "start"); add(s1, "end");
    var out = Object.keys(units).map(function (k) { return units[k]; }).filter(function (u) {
      return u.start.r !== u.end.r || u.start.a !== u.end.a || u.start.g !== u.end.g;
    }).map(function (u) { u.green = u.end.g - u.start.g; return u; })
      .sort(function (a, b) { return b.green - a.green || (a.key < b.key ? -1 : 1); });
    return out.length ? out.slice(0, 12) : null;
  }
  /* results: graded papers dated in the period, and IT units still to sit */
  function results(input, p) {
    var out = (input.tracker || []).filter(function (e) { return e.date && e.date >= p.start && e.date <= p.end && e.max; })
      .map(function (e) {
        return { title: e.paper || e.topic || e.kind || "Result", kind: e.kind || null, date: e.date, subject: e.subject || null,
          marks: e.marks, max: e.max, pct: e.max ? round(100 * e.marks / e.max) : null, grade: e.grade || null };
      }).sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    var pending = (input.itUnits || []).filter(function (u) { return u.status === "sitting"; })
      .map(function (u) { return { title: u.code + (u.title ? " · " + u.title : ""), date: u.date || null }; });
    if (!out.length && !pending.length) return null;
    var res = { list: out };
    if (pending.length) res.pending = pending;
    if (out.length) res.best = out.slice().sort(function (a, b) { return (b.pct || 0) - (a.pct || 0); })[0];
    return res;
  }
  /* the plan against class, one cell a week per subject (24d), read from
     the braid's alignment of each plan week inside the period */
  function vsClass(p) {
    if (!KOS.pacing || !KOS.pacing.weeks || !KOS.pacing.alignment) return null;
    var ws = KOS.pacing.weeks().filter(function (w) { return w.wb >= p.start && w.wb <= p.end && !KOS.pacing.isBreak(w); });
    if (!ws.length) return null;
    var rows = SUBJECTS.map(function (sid) {
      var cells = ws.map(function (w) {
        var a = KOS.pacing.alignment(w.wb, sid);
        if (!a.evidence) return null;
        return a.behind > 0 && a.behind >= a.ahead ? "behind" : a.ahead > 0 ? "ahead" : "aligned";
      });
      var lastA = null;
      for (var i = ws.length - 1; i >= 0; i--) { var a2 = KOS.pacing.alignment(ws[i].wb, sid); if (a2.evidence) { lastA = a2; break; } }
      if (!lastA) return null;
      var end = lastA.behind > 0 && lastA.behind >= lastA.ahead ? { pos: "behind", n: lastA.behind }
        : lastA.ahead > 0 ? { pos: "ahead", n: lastA.ahead } : { pos: "aligned", n: 0 };
      return { sid: sid, cells: cells, end: end };
    }).filter(Boolean);
    return rows.length ? { weeks: ws.map(function (w) { return w.wb; }), rows: rows } : null;
  }
  /* the strip of constituent periods (a term's weeks, a year's months),
     from the saved reports where they exist */
  function strip(input, p) {
    if (p.period !== "term" && p.period !== "year") return null;
    var parts = input.parts || [];
    var cols = [];
    if (p.period === "year") {
      for (var m = 0; m < 12; m++) {
        var d = parse(p.start); d.setMonth(d.getMonth() + m);
        var id = "month:" + iso(d).slice(0, 7);
        var f = parts.filter(function (x) { return x.id === id; })[0];
        cols.push({ id: id, label: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"][m], start: iso(d), f: f ? stripCell(f) : null });
      }
    } else {
      for (var wb = monday(p.start); wb <= p.end; wb = addDays(wb, 7)) {
        var fw = parts.filter(function (x) { return x.id === "week:" + wb; })[0];
        cols.push({ id: "week:" + wb, label: "w" + (cols.length + 1), start: wb, f: fw ? stripCell(fw) : null });
      }
    }
    return cols;
  }
  function stripCell(f) {
    var c = { mins: f.study.mins, bySubject: f.study.bySubject, days: f.study.days, reviews: f.study.reviews,
      recall: f.study.recall, blocks: f.focus.blocks, titles: f.collection ? f.collection.count : 0,
      completed: f.collection && f.collection.status ? (f.collection.status.finished || 0) : 0,
      results: f.results ? f.results.list.length : 0, xp: f.gov && f.gov.xp != null ? f.gov.xp : null };
    if (f.study.again != null && f.study.reviews) c.again = f.study.again;
    return c;
  }
  /* when the ledger no longer reaches back to the period's start (it keeps
     2,000 entries), the headline totals come from the saved weeks or
     months instead, and the report says it is a roll-up */
  function rollUp(f, input, p, cols) {
    if (!cols) return;
    var first = (input.ledger || []).reduce(function (a, e) { return !a || e.date < a ? e.date : a; }, null);
    var capped = (input.ledger || []).length >= 1900;
    if (!(capped && first && first > p.start)) return;
    var have = cols.filter(function (c) { return c.f; });
    if (!have.length) return;
    var sm = {}, mins = 0, days = 0, reviews = 0, again = 0, rk = 0, blocks = 0;
    have.forEach(function (c) {
      mins += c.f.mins; days += c.f.days; reviews += c.f.reviews; blocks += c.f.blocks || 0;
      Object.keys(c.f.bySubject || {}).forEach(function (k) { inc(sm, k, c.f.bySubject[k]); });
      if (c.f.again != null) { again += c.f.again; rk += c.f.reviews; }
    });
    if (mins > f.study.mins) {
      f.study.mins = mins; f.study.bySubject = sm; f.study.days = Math.max(f.study.days, days);
      f.study.reviews = Math.max(f.study.reviews, reviews);
      if (rk >= MIN_RECALL_REVIEWS) f.study.recall = round(100 * (rk - again) / rk);
      f.focus.blocks = Math.max(f.focus.blocks, blocks);
      f.rolledUp = true;
    }
  }
  /* records of the year (24j): longest streak with its dates, the longest
     Focus block, the best recall week, the most studied in a day */
  function records(input, p, f) {
    var out = {};
    var ds = {};
    input.inRange.forEach(function (e) { if (isStudy(e)) ds[e.date] = true; });
    var run = 0, best = 0, bestEnd = null, prev = null;
    Object.keys(ds).sort().forEach(function (d) {
      run = prev && addDays(prev, 1) === d ? run + 1 : 1;
      if (run > best) { best = run; bestEnd = d; }
      prev = d;
    });
    if (best >= 2) out.streak = { days: best, start: addDays(bestEnd, -(best - 1)), end: bestEnd };
    if (f.study.firsts) out.longest = { mins: f.study.firsts.longest.mins, ts: f.study.firsts.longest.ts, label: f.study.firsts.longest.label || null };
    var weeks = (input.weekParts || []).filter(function (w) { return w.study.reviews >= MIN_RECALL_REVIEWS && w.study.recall != null && w.start >= p.start && w.start <= p.end; });
    if (weeks.length) {
      var bw = weeks.slice().sort(function (a, b) { return b.study.recall - a.study.recall || b.study.reviews - a.study.reviews; })[0];
      out.recallWeek = { start: bw.start, recall: bw.study.recall, reviews: bw.study.reviews };
    }
    if (f.study.busiest) out.day = f.study.busiest;
    return Object.keys(out).length ? out : null;
  }
  /* milestones (24j): dated firsts the ledger and the snapshots can prove */
  function milestones(input, p) {
    var out = [];
    var total = 0, next = 1000;
    input.inRange.slice().sort(function (a, b) { return a.ts - b.ts; }).forEach(function (e) {
      if (e.type !== "flashcards" && e.type !== "due-review") return;
      total += (e.metrics && e.metrics.cards) || 0;
      while (total >= next) { out.push({ date: e.date, what: "First " + next.toLocaleString("en-GB") + " reviews this year", area: "Flashcards" }); next += next < 5000 ? 1000 : 5000; }
    });
    (input.snaps || []).filter(function (sn) { return sn.id > p.start && sn.id <= addDays(p.end, 1); }).reduce(function (prevLv, sn) {
      var lv = sn.gov && sn.gov.level;
      if (prevLv && lv && lv > prevLv && Math.floor(lv / 10) > Math.floor(prevLv / 10)) out.push({ date: sn.id, what: "Level " + (Math.floor(lv / 10) * 10), area: "Governor" });
      return lv || prevLv;
    }, null);
    out.sort(function (a, b) { return a.date < b.date ? -1 : 1; });
    return out.length ? out.slice(0, 12) : null;
  }
  /* the study persona of a longer period (24c: "Steady Climber") */
  var STUDY_PERSONAS = {
    climber: { name: "Steady Climber", kanji: "登" },
    sprinter: { name: "Weekend Sprinter", kanji: "疾" },
    marathon: { name: "Long Hauler", kanji: "長" },
    returner: { name: "Comeback Kid", kanji: "帰" }
  };
  function studyPersona(f) {
    var s = f.study;
    if (s.days < 5 || !s.mins) return null;
    var share = s.days / s.of;
    var wk = 0;
    s.dayMins.forEach(function (m, i) { var dow = (parse(addDays(f.start, i)).getDay() + 6) % 7; if (dow >= 5) wk += m; });
    var id, fact;
    var maxDay = s.busiest ? s.busiest.mins : 0;
    if (share >= 0.8) { id = "climber"; fact = "You studied on " + s.days + " of " + s.of + " days, never more than " + hoursText(maxDay / 60) + " in one day."; }
    else if (wk / s.mins >= 0.45) { id = "sprinter"; fact = round(100 * wk / s.mins) + "% of your study came at weekends."; }
    else if (maxDay >= 240) { id = "marathon"; fact = "Your longest day ran " + hoursText(maxDay / 60) + ", on " + s.busiest.date + "."; }
    else { id = "returner"; fact = "You came back to it on " + s.days + " days, " + hoursText(s.mins / 60 / s.days) + " a study day."; }
    return { id: id, name: STUDY_PERSONAS[id].name, kanji: STUDY_PERSONAS[id].kanji, fact: fact,
      stats: [[String(s.days), "study days"], [hoursText(s.mins / 60 / Math.max(1, s.days)), "daily average"], [String(f.gov.streak || 0), "day streak"]] };
  }
  /* the Collection's persona for a year (25e: "Binge Captain") */
  function mediaPersona(c) {
    if (!c || c.count < 10) return null;
    var u = c.units || {};
    if ((u.ch || 0) >= 1000) return { name: "Binge Captain", fact: W_num(u.ch) + " chapters cleared", hue: "books" };
    if ((u.ep || 0) >= 300) return { name: "Season Sweeper", fact: W_num(u.ep) + " episodes watched", hue: "anime" };
    if ((u.route || 0) >= 10) return { name: "Route Runner", fact: W_num(u.route) + " routes cleared", hue: "vn" };
    if ((u.hours || 0) >= 100) return { name: "Long Player", fact: W_num(u.hours) + " hours played", hue: "game" };
    return { name: "Wide Reader", fact: c.count + " titles across " + Object.keys(c.byModule).length + " media", hue: Object.keys(c.byModule)[0] };
  }
  function W_num(n) { return Math.round(n).toLocaleString("en-GB"); }

  /* ---------------- the story list ---------------- */
  /* README 25g: weekly = intro, study time, top topics, which day? (quiz),
     the titles (mosaic), highs and lows, Focus style, recap. A story with
     too little evidence is dropped; the week keeps at least four. */
  /* README 25g: monthly 9, termly 11, yearly 20 — each story kept only
     when its facts can carry it */
  function longStories(f) {
    var s = f.study, c = f.collection, out = ["intro"];
    var keep = function (id, ok) { if (ok) out.push(id); };
    var cmp = !!(f.prev && f.prev.mins != null);
    if (f.period === "month") {
      keep("compare", cmp);
      keep("bars", s.chartDays);
      keep("topics", s.touched >= 2);
      keep("dna", c && c.genres && c.genres.length >= 3);
      keep("flow", s.flow && s.flow.length >= 2);
      keep("hilo", c && c.hi);
      keep("persona", !!f.studyPersona);
      if (out.length < 4) keep("study", true);
    } else if (f.period === "term") {
      keep("study", true);
      keep("vsclass", f.vsClass && f.vsClass.rows.length);
      keep("results", f.results && f.results.list.length >= 2);
      keep("strongest", f.strongest && f.strongest.length >= 3);
      keep("subjquiz", Object.keys(s.bySubject).filter(function (k) { return s.bySubject[k]; }).length >= 2);
      keep("weeks", f.strip && f.strip.filter(function (x) { return x.f; }).length >= 3);
      keep("next", s.next && s.next.length);
      keep("collection", c && c.count >= 3);
      keep("persona", !!f.focus.persona);
    } else if (f.period === "year") {
      keep("study", true);
      keep("months", f.strip && f.strip.filter(function (x) { return x.f; }).length >= 3);
      keep("topicquiz", s.topics.filter(function (t) { return t.reviews; }).length >= 3);
      keep("topics", s.touched >= 3);
      keep("results", f.results && f.results.list.length >= 2);
      keep("thennow", f.thenNow && f.thenNow.length >= 2);
      keep("firsts", !!s.firsts);
      keep("records", f.records && f.records.streak);
      keep("persona", !!(f.focus.persona || f.studyPersona));
      keep("flow", s.flow && s.flow.length >= 2);
      keep("collection", c && c.count >= 3);
      keep("dna", c && c.genres && c.genres.length >= 3);
      keep("creators", c && (c.studio || c.author));
      keep("countries", c && c.countries && c.countries.length >= 2);
      keep("scores", c && c.hi);
      keep("finishing", c && c.status && (c.status.finished || 0) >= 3);
      keep("level", f.gov.levelFrom && f.gov.level);
    }
    out.push("recap");
    return out;
  }
  function stories(f) {
    if (f.period !== "week") return longStories(f);
    var out = ["intro", "study"];
    if (f.study.touched >= 2) out.push("topics");
    var fdays = (f.focus.byDay || []).filter(function (m) { return m > 0; }).length;
    if (fdays >= 3) out.push("quiz");
    if (f.collection && f.collection.count >= 3) out.push("collection");
    if (f.collection && f.collection.hi) out.push("hilo");
    if (f.focus.persona) out.push("persona");
    if (out.length < MIN_STORIES - 1 && out.indexOf("topics") === -1 && f.study.touched >= 1) out.push("topics");
    if (out.length < MIN_STORIES - 1) out.push("days");
    out.push("recap");
    return out;
  }

  /* ---------------- compute: the pure core ---------------- */
  var VERSION = 1;
  function compute(input, p) {
    var a = p.start, b = p.end;
    input.inRange = (input.ledger || []).filter(function (e) { return e.date >= a && e.date <= b; });
    var f = { v: VERSION, period: p.period, id: p.id, start: a, end: b, label: p.label || null };
    if (input.rebuilt) f.rebuilt = true;
    f.study = study(input, p);
    f.focus = focus(input, p);
    var pl = plan(input, p); if (pl) f.plan = pl;
    var tk = tasks(input, p); if (tk) f.tasks = tk;
    var co = collection(input, p); if (co) f.collection = co;
    var pg = programming(input, p); if (pg) f.code = pg;
    f.gov = governor(input, p);
    var ku = kurenai(input, p); if (ku) f.kurenai = ku;
    var mo = moneyFacts(input, p); if (mo) f.money = mo;
    var go = goalFacts(input, p); if (go) f.goals = go;
    if (input.prev) f.prev = input.prev;
    if (p.period !== "week") {
      var ma = mastery(input); if (ma) f.mastery = ma;
      var re = results(input, p); if (re) f.results = re;
      var sp = studyPersona(f); if (sp) f.studyPersona = sp;
      if (p.period === "term" || p.period === "year") {
        var vc = vsClass(p); if (vc) f.vsClass = vc;
        var st = strip(input, p); if (st) { f.strip = st; rollUp(f, input, p, st); }
        var ranked = f.study.topics.filter(function (t) { return t.reviews >= 20 && t.recall != null; });
        if (ranked.length >= 2) {
          var byR = ranked.slice().sort(function (a, b) { return a.recall - b.recall; });
          f.weakest = byR.slice(0, 3).map(function (t) { return { key: t.key, sid: t.sid, ref: t.ref, title: t.title, recall: t.recall, reviews: t.reviews }; });
          f.strongest = byR.slice(-5).reverse().map(function (t) { return { key: t.key, sid: t.sid, ref: t.ref, title: t.title, recall: t.recall, reviews: t.reviews }; });
        }
      }
      if (p.period === "year") {
        var rc = records(input, p, f); if (rc) f.records = rc;
        var mi = milestones(input, p); if (mi) f.milestones = mi;
        var mp = mediaPersona(f.collection); if (mp) f.mediaPersona = mp;
        f.thenNow = thenNow(f);
      }
      if (f.collection) {
        var cs = f.collection;
        cs.completed = cs.titles.filter(function (t) { return t.status === "finished"; }).slice(0, 12)
          .map(function (t) { return { title: t.title, module: t.module, score: t.score || 0, cover: t.cover || null }; });
        cs.topRated = cs.titles.filter(function (t) { return t.score > 0; }).sort(function (a, b) { return b.score - a.score || (a.title < b.title ? -1 : 1); }).slice(0, 8)
          .map(function (t) { return { title: t.title, module: t.module, score: t.score, cover: t.cover || null }; });
        if (p.period === "year" || p.period === "term") cs.monthTitles = monthTitles(input, p);
      }
    }
    f.stories = stories(f);
    return f;
  }
  /* titles touched per month (25e), stacked by medium */
  function monthTitles(input, p) {
    var a = ms(p.start), b = ms(addDays(p.end, 1)), out = {};
    (input.rows || []).forEach(function (r) {
      var months = {};
      (r.journal || []).forEach(function (ev) { if (ev[0] >= a && ev[0] < b) months[iso(new Date(ev[0])).slice(0, 7)] = true; });
      var ds = r.dates || {};
      [ds.started, ds.finished].forEach(function (d) { if (d && d >= p.start && d <= p.end) months[d.slice(0, 7)] = true; });
      Object.keys(months).forEach(function (m) { var row = out[m] = out[m] || {}; row[r.module] = (row[r.module] || 0) + 1; });
    });
    return out;
  }
  /* then and now (the year story): the first term against the last, from
     the saved weeks */
  function thenNow(f) {
    var cols = (f.strip || []).filter(function (x) { return x.f; });
    if (cols.length < 6) return null;
    var half = Math.floor(cols.length / 3);
    var early = cols.slice(0, half), late = cols.slice(-half);
    function avg(list, key) { var v = list.map(function (c) { return c.f[key]; }).filter(function (x) { return x != null; }); return v.length ? sum(v) / v.length : null; }
    var rows = [];
    var r0 = avg(early, "recall"), r1 = avg(late, "recall");
    if (r0 != null && r1 != null) rows.push({ label: "Recall", a: round(r0) + "%", b: round(r1) + "%", va: r0, vb: r1, unit: "pts" });
    var m0 = avg(early, "mins"), m1 = avg(late, "mins");
    if (m0 != null && m1 != null) rows.push({ label: "Study a month", a: hoursText(m0 / 60), b: hoursText(m1 / 60), va: m0, vb: m1, unit: "mins" });
    var d0 = avg(early, "days"), d1 = avg(late, "days");
    if (d0 != null && d1 != null) rows.push({ label: "Study days a month", a: String(round(d0)), b: String(round(d1)), va: d0, vb: d1, unit: "n" });
    return rows;
  }
  /* the few totals a later report compares against (and the year/term
     roll-ups read): kept small, on every saved report */
  function totals(f) {
    if (!f) return null;
    return { mins: f.study.mins, days: f.study.days, sessions: f.study.sessions, reviews: f.study.reviews,
      recall: f.study.recall, touched: f.study.touched, toGreen: f.study.toGreen,
      blocks: f.focus.blocks, titles: f.collection ? f.collection.count : 0,
      ticked: f.plan ? f.plan.ticked : null, planned: f.plan ? f.plan.planned : null,
      bySubject: f.study.bySubject, busiest: f.study.busiest ? f.study.busiest.mins : null,
      peakHour: f.focus.peakHour != null ? f.focus.peakHour : null,
      reminders: f.tasks && f.tasks.reminders ? f.tasks.reminders : 0,
      chats: f.kurenai && f.kurenai.chats ? f.kurenai.chats : 0,
      codeTasks: f.code && f.code.tasks ? f.code.tasks : 0, codeSkills: f.code && f.code.skills ? f.code.skills : 0,
      completed: f.collection && f.collection.status ? (f.collection.status.finished || 0) : 0,
      moneyOut: f.money && f.money.outgoings ? f.money.outgoings : 0,
      moneyIn: f.money && f.money.income ? f.money.income : 0,
      dayAvg: f.study.of ? Math.round(f.study.mins / f.study.of) : null };
  }

  /* ---------------- gather: the single sources ---------------- */
  /* opts: {rebuilt, prev (a saved report's facts), now} */
  function gather(p, opts, cb) {
    opts = opts || {};
    var S = KOS.store.state;
    var input = {
      ledger: (S.sessions || []).slice(),
      tally: (S.assistant && S.assistant.tally) || {},
      reminders: ((S.reminders || {}).items || []).slice(),
      habits: ((S.todo || {}).habits || []).slice(),
      rebuilt: !!opts.rebuilt,
      prev: opts.prev ? totals(opts.prev) : null
    };
    if (p.period === "week" && KOS.pacing && KOS.pacing.weekAt) {
      var w = KOS.pacing.weekAt(p.start);
      if (w) { input.planWb = w.wb; input.planRows = KOS.pacing.entriesFor(w.wb, null, "personal"); }
    } else if (KOS.pacing && KOS.pacing.entries) {
      input.planRows = KOS.pacing.entries().filter(function (e) { return e.source === "personal" && e.wb >= p.start && e.wb <= p.end; });
    }
    if (p.period !== "week") {
      input.tracker = (KOS.tracker && KOS.tracker.all ? KOS.tracker.all() : ((S.tracker || {}).entries || [])).slice();
      input.itUnits = KOS.itUnits && KOS.itUnits.all ? KOS.itUnits.all() : [];
    }
    var rs = KOS.reportStore;
    function snaps(next) {
      if (!rs) { next(); return; }
      rs.getSnapshot(p.start, function (e1, s0) {
        rs.getSnapshot(addDays(p.end, 1), function (e2, s1) {
          input.snapStart = s0 || null;
          input.snapEnd = s1 || null;
          /* the period just ended and its closing snapshot is not written
             yet: the state now IS the closing state (the first open after
             the boundary) — unless this is a rebuild from history */
          if (!input.snapEnd && s0 && !opts.rebuilt && rs.buildSnapshot) {
            rs.buildSnapshot(addDays(p.end, 1), function (live) { input.snapEnd = live; next(); });
            return;
          }
          next();
        });
      });
    }
    /* a term or a year also reads the saved reports inside it (the strip,
       the roll-up, the best recall week) and every snapshot (milestones) */
    function parts(next) {
      if (!rs || p.period === "week" || p.period === "month") { next(); return; }
      rs.list(p.period === "year" ? "month" : "week", function (e1, list) {
        input.parts = (list || []).filter(function (r) { return r.start >= p.start && r.start <= p.end; }).map(function (r) { return r.facts; });
        rs.list("week", function (e2, weeks) {
          input.weekParts = (weeks || []).filter(function (r) { return r.start >= p.start && r.start <= p.end; }).map(function (r) { return r.facts; });
          rs.snapshots(function (e3, sn) { input.snaps = sn || []; next(); });
        });
      });
    }
    /* Money's transactions in the period, and the goals after a compute
       (which judges any period that has just ended) */
    function moneyAndGoals(next) {
      function goals() {
        if (!KOS.goals || !KOS.goals.compute) { next(); return; }
        KOS.goals.compute(function () {
          input.goals = JSON.parse(JSON.stringify(KOS.goals.all()));
          next();
        });
      }
      if (!KOS.money || !KOS.money.available()) { goals(); return; }
      KOS.money.range(p.start, p.end, function (err, tx) {
        var M = KOS.money, names = {}, budgets = {};
        M.categories({ archived: true }).forEach(function (c) { names[c.id] = c.name; var b = M.budgetOf(c); if (b != null) budgets[c.id] = b; });
        input.money = { tx: err ? [] : tx, names: names, budgets: budgets, currency: M.data().currency,
          subs: M.subscriptions(p.end).perMonth || 0 };
        goals();
      });
    }
    moneyAndGoals(function () { snaps(function () {
      parts(function () {
        if (!KOS.mediadb || !KOS.mediadb.available()) { input.rows = []; cb(input); return; }
        KOS.mediadb.query({}, function (err, rows) { input.rows = err ? [] : rows; cb(input); });
      });
    }); });
  }
  function build(p, opts, cb) {
    gather(p, opts, function (input) { cb(compute(input, p)); });
  }

  KOS.report = {
    VERSION: VERSION,
    MIN_RECALL_REVIEWS: MIN_RECALL_REVIEWS,
    MIN_CHART_DAYS: MIN_CHART_DAYS,
    MIN_PERSONA_BLOCKS: MIN_PERSONA_BLOCKS,
    PERSONAS: PERSONAS,
    STUDY_PERSONAS: STUDY_PERSONAS,
    SUBJECTS: SUBJECTS,
    MODULES: MODULES,
    week: week, month: month, term: term, terms: terms, year: year, of: of,
    previous: previous, readyAt: readyAt, isReady: isReady,
    addDays: addDays, monday: monday,
    compute: compute, totals: totals, gather: gather, build: build,
    estMins: estMins
  };
})();
