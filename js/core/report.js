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
  /* the plan's terms: runs of teaching weeks split by 2+ consecutive break
     weeks. Named by the month they start in. */
  function terms() {
    if (!KOS.pacing || !KOS.pacing.weeks) return [];
    var ws = KOS.pacing.weeks(), out = [], cur = null, gap = 0;
    ws.forEach(function (w) {
      if (KOS.pacing.isBreak(w)) { gap++; if (gap >= 2 && cur) { out.push(cur); cur = null; } return; }
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
      topics: list, touched: list.length, toGreen: toGreen, moves: moves
    };
    if (max) { out.marks = marks; out.max = max; }
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

  /* ---------------- the story list ---------------- */
  /* README 25g: weekly = intro, study time, top topics, which day? (quiz),
     the titles (mosaic), highs and lows, Focus style, recap. A story with
     too little evidence is dropped; the week keeps at least four. */
  function stories(f) {
    if (f.period !== "week") return [];
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
    f.gov = governor(input, p);
    var ku = kurenai(input, p); if (ku) f.kurenai = ku;
    if (input.prev) f.prev = input.prev;
    f.stories = stories(f);
    return f;
  }
  /* the few totals a later report compares against (and the year/term
     roll-ups read): kept small, on every saved report */
  function totals(f) {
    if (!f) return null;
    return { mins: f.study.mins, days: f.study.days, sessions: f.study.sessions, reviews: f.study.reviews,
      recall: f.study.recall, touched: f.study.touched, toGreen: f.study.toGreen,
      blocks: f.focus.blocks, titles: f.collection ? f.collection.count : 0,
      ticked: f.plan ? f.plan.ticked : null, planned: f.plan ? f.plan.planned : null };
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
    snaps(function () {
      if (!KOS.mediadb || !KOS.mediadb.available()) { input.rows = []; cb(input); return; }
      KOS.mediadb.query({}, function (err, rows) { input.rows = err ? [] : rows; cb(input); });
    });
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
    SUBJECTS: SUBJECTS,
    MODULES: MODULES,
    week: week, month: month, term: term, terms: terms, year: year, of: of,
    previous: previous, readyAt: readyAt, isReady: isReady,
    addDays: addDays, monday: monday,
    compute: compute, totals: totals, gather: gather, build: build,
    estMins: estMins
  };
})();
