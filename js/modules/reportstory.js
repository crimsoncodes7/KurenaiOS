/* Kurenai OS — modules/reportstory.js
   Reports (roadmap 5.1): the story — a tap-through, Wrapped-style player
   over a saved report (the prototype `KurenaiOS Wrapped`, frame 25g).

   STAGE. 450 × 800, radius 30, scaled to fit the viewport; over a dimmed
   page on a desktop, full screen on a phone. Progress segments, a header
   (the period's seal, its label and range, a speed pill, pause, close)
   and a footer (KURENAIOS · n / N). It is a dialog (KOS.ui.openDialog):
   Escape closes and focus returns where it was.

   MOVING. A story advances itself after 7.2 s (scaled by the speed); the
   right 65% of the stage goes forward and the left 35% back; ← → and a
   swipe do the same; Space pauses; the chips under the stage jump to any
   story. A quiz waits for a guess, then shows every option's real value
   and resumes. Motion runs on elapsed time (CSS animations paused with
   the player, count-ups driven by the story's own clock); reduced motion
   shows each story finished.

   `slides(rep)` is PURE: it turns the saved facts into the story list the
   facts chose (`facts.stories`), so the player draws exactly the report
   that was saved. The weekly list: intro, study time, top topics, which
   day? (quiz), the titles (mosaic), highs and lows, Focus style, recap;
   a thin week swaps in its days. The speed is per device
   (state.ui.reportSpeed); a guess is never stored.                      */
(function () {
  "use strict";
  var el = KOS.ui.el, W = KOS.reportWords;

  var DUR = 7200;
  var SPEEDS = [1, 1.5, 2];
  var DOW = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  var DOW3 = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var MON3 = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var SUBJ_HUE = { compsci: "var(--cs)", maths: "var(--maths)", it: "var(--it)" };
  var MOD_HUE = { anime: "var(--anime)", books: "var(--books)", vn: "var(--vn)", game: "var(--games)" };
  var MOD_LABEL = { anime: "Anime", books: "Books", vn: "Visual novels", game: "Games" };
  var SEAL = { week: "週", month: "月", term: "期", year: "年" };
  var LABEL = { week: "Your week", month: "Your month", term: "Your term", year: "Your year" };

  function parse(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function rangeText(start, end) {
    var a = parse(start), b = parse(end);
    return a.getMonth() === b.getMonth()
      ? a.getDate() + " – " + b.getDate() + " " + MON3[b.getMonth()] + " " + b.getFullYear()
      : a.getDate() + " " + MON3[a.getMonth()] + " – " + b.getDate() + " " + MON3[b.getMonth()] + " " + b.getFullYear();
  }
  function longRange(start, end) {
    var a = parse(start), b = parse(end);
    return a.getMonth() === b.getMonth()
      ? a.getDate() + " – " + b.getDate() + " " + MONTHS[b.getMonth()]
      : a.getDate() + " " + MON3[a.getMonth()] + " – " + b.getDate() + " " + MON3[b.getMonth()];
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }
  function article(word) { return /^[AEIOU]/i.test(word) ? "an" : "a"; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  /* ================= the story list, from the saved facts ================= */
  function slides(rep) {
    var f = rep.facts, s = f.study, fo = f.focus || {}, c = f.collection, g = f.gov || {};
    var words = W.current(rep), out = [];
    var noun = f.period === "week" ? "week" : f.period;
    var thisN = noun === "week" ? "this week" : "this " + noun;
    var monthName = MONTHS[parse(f.start).getMonth()];
    var title = { week: "Your week, " + longRange(f.start, f.end), month: monthName + " " + parse(f.start).getFullYear(),
      term: f.label || "Your term", year: f.label ? "Your year · " + f.label : "Your year" }[f.period];
    var prevName = f.period === "month" ? MONTHS[(parse(f.start).getMonth() + 11) % 12] : "last " + noun;
    var studyLong = function (k) { return ({ compsci: "CS", maths: "Maths", it: "IT", cards: "Flashcards", quiz: "Quiz" })[k] || k; };
    var make = {
      intro: function () {
        var chips = [];
        if (f.period !== "week" && s.days) chips.push(W.plural(s.days, "study day"));
        if (s.sessions && f.period === "week") chips.push(W.plural(s.sessions, "session"));
        if (fo.blocks) chips.push(W.plural(fo.blocks, "Focus block"));
        if (c && c.count) chips.push(W.plural(c.count, "title"));
        var sub = { week: "Seven days of study, Focus, the plan and the Collection, from Monday to Sunday.",
          month: "Here is how the month went" + (f.prev ? ", compared with " + prevName + "." : "."),
          term: W.plural(Math.round((parse(f.end) - parse(f.start)) / (7 * 864e5)) + 1, "week") + " of study, the plan against class and the Collection.",
          year: "September to August: every hour, every paper, every title." }[f.period];
        return { t: "intro", hue: "var(--crimson)", hue2: { week: "var(--cs)", month: "var(--maths)", term: "var(--it)", year: "var(--gold)" }[f.period],
          ch: "Your " + noun, eyebrow: cap(noun) + " in review", title: title, kanji: SEAL[f.period] || "週", chips: chips, sub: sub };
      },
      study: function () {
        var keys = ["compsci", "maths", "it"].filter(function (k) { return s.bySubject[k]; });
        var foot = null;
        if (f.prev && f.prev.mins != null) {
          var d = s.mins - f.prev.mins;
          foot = d > 0 ? (f.prev.mins ? "Up " + W.hm(d) + " on " + prevName + "." : "New " + thisN + ": " + prevName + " had no timed study.")
            : d === 0 ? "The same as " + prevName + "." : "Down " + W.hm(-d) + " on " + prevName + ".";
        } else if (f.period !== "week" && s.days) foot = "That is about " + W.hm(s.mins / s.days) + " on every study day.";
        return { t: "big", hue: "var(--cs)", hue2: "var(--maths)", ch: "Study time", eyebrow: "Study",
          title: f.period === "week" ? "You studied for" : cap(thisN) + " you studied for",
          value: s.mins, fmt: "hm", unit: (s.sessions ? "across " + W.plural(s.sessions, "session") + ", " : "") + "on " + s.days + " of " + s.of + " days",
          segs: keys.map(function (k) { return { label: W.SUBJECT[k], value: s.bySubject[k], text: W.hm(s.bySubject[k]), hue: SUBJ_HUE[k] }; }),
          foot: foot };
      },
      topics: function () {
        var top = s.topics.slice(0, 5), max = Math.max.apply(null, top.map(function (t) { return t.mins || t.reviews || 1; }).concat([1]));
        var foot = W.plural(s.touched, "topic") + " touched" + (s.toGreen ? ", " + s.toGreen + " moved to Green" : "") + ".";
        return { t: "top", hue: "var(--maths)", hue2: "var(--cs)", ch: "Top topics", eyebrow: "Top topics",
          title: f.period === "week" ? "The topics you spent the week on" : f.period === "year" ? "Your topics of the year" : "Your five most-studied topics",
          items: top.map(function (t) {
            var meta = [t.mins ? W.hm(t.mins) : null, t.reviews ? W.plural(t.reviews, "review") : null].filter(Boolean).join(" · ") || "touched";
            return { name: t.ref + " " + t.title, meta: meta, pct: Math.round(100 * (t.mins || t.reviews || 1) / max), hue: SUBJ_HUE[t.sid] };
          }), foot: foot };
      },
      quiz: function () {
        var bd = (fo.byDay || []).map(function (m, i) { return { i: i, m: m }; }).filter(function (d) { return d.m > 0; });
        var best = bd.slice().sort(function (a, b) { return b.m - a.m; })[0];
        var opts = bd.slice().sort(function (a, b) { return b.m - a.m; }).slice(0, 4).sort(function (a, b) { return a.i - b.i; });
        var hourOf = function (i) {
          var row = (fo.heat || [])[i] || [], h = 0;
          row.forEach(function (v, j) { if (v > row[h]) h = j; });
          return 7 + h;
        };
        var ph = hourOf(best.i);
        return { t: "quiz", hue: "var(--teal)", hue2: "var(--amber)", ch: "Quiz", eyebrow: "Guess first", title: "Which day did you focus the most?",
          opts: opts.map(function (d) { return { label: DOW[d.i], value: d.m, text: W.hm(d.m) }; }),
          ans: opts.map(function (d) { return d.i; }).indexOf(best.i),
          reveal: DOW[best.i] + ": " + W.hm(best.m) + " of Focus, peaking " + pad2(ph) + ":00–" + pad2(ph + 1) + ":00." };
      },
      subjquiz: function () {
        var keys = ["compsci", "maths", "it"].filter(function (k) { return s.bySubject[k]; });
        var best = keys.slice().sort(function (a, b) { return s.bySubject[b] - s.bySubject[a]; })[0];
        var second = keys.slice().sort(function (a, b) { return s.bySubject[b] - s.bySubject[a]; })[1];
        return { t: "quiz", hue: "var(--teal)", hue2: "var(--maths)", ch: "Quiz", eyebrow: "Guess first", title: "Which subject got the most study time?",
          opts: keys.map(function (k) { return { label: W.SUBJECT[k], value: s.bySubject[k], text: W.hm(s.bySubject[k]) }; }),
          ans: keys.indexOf(best),
          reveal: W.SUBJECT[best] + ", with " + W.hm(s.bySubject[best]) + (second ? " against " + W.SUBJECT_SHORT[second] + " at " + W.hm(s.bySubject[second]) : "") + "." };
      },
      topicquiz: function () {
        var rev = s.topics.filter(function (t) { return t.reviews; }).sort(function (a, b) { return b.reviews - a.reviews; }).slice(0, 4);
        var order = rev.slice().sort(function (a, b) { return a.key < b.key ? -1 : 1; });
        return { t: "quiz", hue: "var(--cs)", hue2: "var(--teal)", ch: "Quiz", eyebrow: "Guess first", title: "Which topic did you review most?",
          opts: order.map(function (t) { return { label: t.ref + " " + t.title, value: t.reviews, text: W.num(t.reviews) }; }),
          ans: order.indexOf(rev[0]), reveal: rev[0].title + ": " + W.plural(rev[0].reviews, "review") + "." };
      },
      collection: function () {
        var mods = ["anime", "books", "vn", "game"].filter(function (m) { return c.byModule[m]; });
        var per = Math.max(1, Math.ceil(c.count / 60)), tiles = [];
        mods.forEach(function (m) { for (var i = 0; i < Math.ceil(c.byModule[m] / per); i++) tiles.push(MOD_HUE[m]); });
        var u = c.units || {}, unit = { anime: u.ep ? W.num(u.ep) + " eps" : null, books: u.ch ? W.num(u.ch) + " ch" : (u.vol ? W.plural(u.vol, "vol") : null),
          vn: u.route ? W.plural(u.route, "route") : null, game: u.hours ? W.hm(u.hours * 60) : null };
        var st = c.status || {}, bits = [];
        if (st.finished) bits.push(st.finished + " finished");
        if (st.started) bits.push(st.started + " started");
        if (st.dropped) bits.push(st.dropped + " dropped");
        return { t: "grid", hue: "var(--anime)", hue2: "var(--vn)", ch: W.plural(c.count, "title"), eyebrow: "Collection",
          title: W.plural(c.count, "title") + (f.period === "week" ? " in one week" : " " + thisN), value: c.count, fmt: "int", tiles: tiles,
          legend: mods.map(function (m) { return { label: MOD_LABEL[m], hue: MOD_HUE[m], text: c.byModule[m] + (unit[m] ? " · " + unit[m] : "") }; }),
          foot: (per > 1 ? "Each tile is about " + per + " titles" + (bits.length ? " · " : "") : "") + (bits.length ? W.list(bits) + "." : "") };
      },
      hilo: function () {
        var one = function (tag, t, hue) {
          return { tag: tag, name: t.title, meta: MOD_LABEL[t.module] + (t.status ? " · " + t.status : ""), value: t.score, unit: "/10", hue: hue, module: t.module };
        };
        var hiT = c.titles.filter(function (t) { return t.title === c.hi.title; })[0] || {}, loT = c.titles.filter(function (t) { return t.title === c.lo.title; })[0] || {};
        var hi = one("Highest score", c.hi, "var(--green)"), lo = one("Lowest score", c.lo, "var(--red)");
        hi.cover = hiT.cover || null; lo.cover = loT.cover || null;
        return { t: "hilo", hue: "var(--green)", hue2: "var(--red)", ch: "Highs & lows", eyebrow: "Highs and lows",
          title: f.period === "week" ? "Your best and toughest scores" : "Your highest and lowest scores",
          cards: [hi, lo], foot: c.scores ? W.plural(c.scores.n, "score") + " given · average " + c.scores.avg : null };
      },
      persona: function () {
        var p = fo.persona && (f.period === "week" || f.period === "term") ? fo.persona : (f.studyPersona || fo.persona);
        var study = p === f.studyPersona;
        return { t: "persona", hue: study ? "var(--maths)" : "var(--amber)", hue2: study ? "var(--teal)" : "var(--crimson)", ch: study ? "Study style" : "Focus style",
          eyebrow: study ? "Your study style" : "Your Focus style",
          title: (f.period === "week" ? "This week" : f.period === "month" ? "In " + monthName : f.period === "term" ? "This term" : "Across the year") + " you were " + article(p.name),
          name: p.name, fact: p.fact, stats: p.stats, kanji: p.kanji };
      },
      days: function () {
        var max = 0, hi = 0;
        s.dayMins.forEach(function (m, i) { if (m > max) { max = m; hi = i; } });
        var calls = [];
        if (max) calls.push({ label: "Busiest", value: DOW3[hi], text: W.hm(max), hue: "var(--maths)" });
        calls.push({ label: "Study days", value: s.days + " of " + s.of, text: W.hm(s.mins) + " in all", hue: "var(--teal)" });
        return { t: "bars", hue: "var(--maths)", hue2: "var(--cs)", ch: "Day by day", eyebrow: "Every day", title: "Your week, day by day",
          cols: s.dayMins.map(function (m, i) { return { label: DOW3[i].charAt(0), value: m, text: m ? W.hm(m) : "" }; }), hi: max ? hi : -1, calls: calls };
      },
      bars: function () {
        var max = 0, hi = 0;
        s.dayMins.forEach(function (m, i) { if (m > max) { max = m; hi = i; } });
        var bd = parse(f.start); bd.setDate(bd.getDate() + hi);
        var calls = [{ label: "Busiest", value: DOW3[(bd.getDay() + 6) % 7] + " " + bd.getDate(), text: W.hm(max), hue: "var(--maths)" }];
        if (fo.blocks && fo.peakHour != null) calls.push({ label: "Peak hour", value: pad2(fo.peakHour) + ":00", text: fo.peakShare + "% of Focus", hue: "var(--teal)" });
        return { t: "bars", hue: "var(--maths)", hue2: "var(--cs)", ch: "Day by day", eyebrow: "Every day", title: "Your " + monthName + ", day by day",
          cols: s.dayMins.map(function (m, i) { return { label: (i + 1) % 5 === 1 ? String(i + 1) : "", value: m, text: "" }; }), hi: hi, calls: calls, dense: true };
      },
      weeks: function () { return stripStory("Week by week", W.plural((f.strip || []).length, "week") + " of study", "w"); },
      months: function () { return stripStory("Month by month", "Your year, month by month", "m"); },
      compare: function () {
        var p = f.prev, rows = [];
        rows.push(cmpRow("Study time", p.mins, s.mins, W.hm, "var(--cs)", "mins"));
        if (p.days != null) rows.push(cmpRow("Study days", p.days, s.days, String, "var(--maths)", "days"));
        if (p.recall != null && s.recall != null) rows.push(cmpRow("Recall", p.recall, s.recall, function (v) { return v + "%"; }, "var(--teal)", "pts"));
        if (p.titles != null && c) rows.push(cmpRow("Collection", p.titles, c.count, String, "var(--anime)", "titles"));
        return { t: "compare", hue: "var(--cs)", hue2: "var(--teal)", ch: "vs " + prevName, eyebrow: "Against " + prevName,
          title: s.mins >= 2 * (p.mins || 0) && p.mins ? "More than double the study time" : s.mins > p.mins ? "More study than " + prevName : s.mins === p.mins ? "The same study time as " + prevName : "A lighter " + noun + " than " + prevName,
          rows: rows.filter(Boolean), foot: s.mins < p.mins ? "Down is not a warning." : null };
      },
      vsclass: function () {
        var POS = { ahead: "ahead", aligned: "aligned", behind: "behind" };
        return { t: "compare", hue: "var(--teal)", hue2: "var(--red)", ch: "vs class", eyebrow: "The plan against class", title: "Where you finished the term",
          rows: f.vsClass.rows.map(function (r) {
            var first = r.cells.filter(Boolean)[0] || "aligned";
            return { label: W.SUBJECT[r.sid], a: POS[first], b: r.end.n ? r.end.n + " " + POS[r.end.pos] : POS[r.end.pos], wa: 60, wb: r.end.pos === "ahead" ? 80 : r.end.pos === "behind" ? 35 : 60,
              hue: SUBJ_HUE[r.sid], d: cap(r.end.pos) + (r.end.n ? " · " + W.plural(r.end.n, "topic") : ""), dTone: r.end.pos === "behind" ? "var(--red)" : r.end.pos === "ahead" ? "var(--teal)" : "var(--rp-stage-muted)" };
          }), foot: "From the braid: start of term → end of term." };
      },
      thennow: function () {
        return { t: "compare", hue: "var(--teal)", hue2: "var(--cs)", ch: "Then and now", eyebrow: "Autumn you vs summer you", title: "How the year changed you",
          rows: f.thenNow.map(function (r) {
            var max = Math.max(r.va, r.vb) || 1;
            var d = W.compare(Math.round(r.vb), Math.round(r.va), "", r.unit === "pts" ? "pct" : r.unit === "mins" ? "mins" : null);
            return { label: r.label, a: r.a, b: r.b, wa: Math.round(100 * r.va / max), wb: Math.round(100 * r.vb / max), hue: "var(--teal)",
              d: d ? d.text.replace(/ on $/, "") : "", dTone: d && d.dir === "up" ? "var(--teal)" : "var(--rp-stage-muted)" };
          }), foot: "The first months of the year against the last." };
      },
      dna: function () {
        return { t: "dna", hue: "var(--vn)", hue2: "var(--anime)", ch: "Genre DNA", eyebrow: "Collection DNA", title: "The genres you kept coming back to",
          items: c.genres.map(function (gg, i) { return { name: gg.name, n: W.plural(gg.n, "title"), pct: gg.pct, hue: ["var(--vn)", "var(--books)", "var(--anime)", "var(--games)", "var(--amber)"][i] }; }),
          foot: W.plural(c.count, "title") + (c.tags && c.tags.length ? " · top tags: " + c.tags.slice(0, 3).map(function (t) { return t.name; }).join(" · ") : "") };
      },
      flow: function () {
        return { t: "flow", hue: "var(--teal)", hue2: "var(--maths)", ch: "Study flow", eyebrow: "Study flow", title: "What you studied next",
          items: s.flow.map(function (x) { return { from: studyLong(x.from), fromHue: SUBJ_HUE[x.from] || "var(--teal)", to: studyLong(x.to), toHue: SUBJ_HUE[x.to] || "var(--teal)", n: W.plural(x.n, "time") }; }),
          foot: null };
      },
      results: function () {
        var list = f.results.list.slice().sort(function (a, b) { return (b.pct || 0) - (a.pct || 0); });
        var card = function (tag, r, hue) { return { tag: tag, name: r.title, meta: (r.kind ? cap(r.kind) + " · " : "") + r.date + " · " + r.marks + " / " + r.max, value: r.pct, unit: "%", hue: hue, module: null }; };
        return { t: "hilo", hue: "var(--maths)", hue2: "var(--cs)", ch: "Results", eyebrow: "Results", title: f.period === "year" ? "Your highest and lowest marks" : "Your best and toughest papers",
          cards: [card("Best", list[0], "var(--teal)"), card("Toughest", list[list.length - 1], "var(--amber)")], foot: W.plural(list.length, "graded result") };
      },
      strongest: function () {
        return { t: "top", hue: "var(--green)", hue2: "var(--cs)", ch: "Strongest", eyebrow: "Strongest", title: "The topics you know best",
          items: f.strongest.map(function (t) { return { name: t.ref + " " + t.title, meta: t.recall + "% recall · " + W.plural(t.reviews, "review"), pct: t.recall, hue: SUBJ_HUE[t.sid] }; }),
          foot: "Topics with 20+ reviews " + thisN };
      },
      next: function () {
        return { t: "cards", hue: "var(--bloom)", hue2: "var(--it)", ch: "Next up", eyebrow: "Next up", title: "Next " + noun + " could start with",
          cards: s.next.map(function (t) { return { tag: "Lowest recall", name: t.ref + " " + t.title, meta: t.recall + "% recall", v: t.recall + "%", hue: SUBJ_HUE[t.sid] }; }),
          foot: "The three lowest-recall topics" };
      },
      firsts: function () {
        var a = s.firsts.first, b = s.firsts.last;
        var dd = function (ts) { var d = new Date(ts); return d.getDate() + " " + MON3[d.getMonth()]; };
        return { t: "hilo", hue: "var(--bloom)", hue2: "var(--cs)", ch: "Firsts & lasts", eyebrow: "Firsts and lasts", title: "Where the year started and ended",
          cards: [{ tag: "First session", name: a.label || "Study", meta: dd(a.ts) + " · " + W.hm(a.mins), value: new Date(a.ts).getDate(), unit: MON3[new Date(a.ts).getMonth()], hue: SUBJ_HUE[a.sid] || "var(--cs)" },
            { tag: "Last session", name: b.label || "Study", meta: dd(b.ts) + " · " + W.hm(b.mins), value: new Date(b.ts).getDate(), unit: MON3[new Date(b.ts).getMonth()], hue: SUBJ_HUE[b.sid] || "var(--it)" }],
          foot: "In between: " + W.plural(s.sessions, "session") + "." };
      },
      records: function () {
        var r = f.records, segs = [];
        if (r.longest) segs.push({ label: "Longest Focus · " + W.hm(r.longest.mins), value: r.longest.mins, text: "", hue: "var(--amber)" });
        if (r.recallWeek) segs.push({ label: "Best recall week · " + r.recallWeek.recall + "%", value: r.recallWeek.recall, text: "", hue: "var(--teal)" });
        if (r.day) segs.push({ label: "Most in a day · " + W.hm(r.day.mins), value: r.day.mins, text: "", hue: "var(--maths)" });
        var d = function (iso) { var x = parse(iso); return x.getDate() + " " + MON3[x.getMonth()]; };
        return { t: "big", hue: "var(--teal)", hue2: "var(--gold)", ch: "Records", eyebrow: "Records", title: "Your longest study streak",
          value: r.streak.days, fmt: "int", unit: "days in a row, " + d(r.streak.start) + " – " + d(r.streak.end), segs: segs, foot: null };
      },
      creators: function () {
        var cards = [];
        if (c.studio) cards.push({ tag: "Top studio", name: c.studio.name, meta: W.plural(c.studio.n, "anime", "anime") + " · " + c.studio.titles.join(", "), v: String(c.studio.n), hue: "var(--anime)" });
        if (c.author) cards.push({ tag: "Top author", name: c.author.name, meta: W.plural(c.author.n, "title") + " · " + c.author.titles.join(", "), v: String(c.author.n), hue: "var(--books)" });
        return { t: "cards", hue: "var(--anime)", hue2: "var(--books)", ch: "Creators", eyebrow: "The people behind it", title: "Your creators of the year", cards: cards, foot: "From the credits stored with each title" };
      },
      countries: function () {
        var NAMES = { JP: "Japan", KR: "South Korea", CN: "China", TW: "Taiwan", US: "United States", GB: "United Kingdom" };
        var total = c.countries.reduce(function (a, x) { return a + x.n; }, 0) || 1, max = c.countries[0].n;
        return { t: "top", hue: "var(--amber)", hue2: "var(--crimson)", ch: "Countries", eyebrow: "Around the world", title: "Where your Collection came from",
          items: c.countries.slice(0, 5).map(function (x, i) { return { name: NAMES[x.name] || x.name, meta: W.plural(x.n, "title") + " · " + (Math.round(1000 * x.n / total) / 10) + "%", pct: Math.round(100 * x.n / max), hue: ["var(--crimson)", "var(--cs)", "var(--anime)", "var(--amber)", "var(--vn)"][i] }; }),
          foot: W.plural(c.countries.length, "country", "countries") };
      },
      scores: function () { var h = make.hilo(); h.ch = "Scores"; return h; },
      finishing: function () {
        var st = c.status || {}, started = (st.finished || 0) + (st.started || 0) + (st.continued || 0) + (st.paused || 0) + (st.dropped || 0);
        var good = Math.round(100 * ((st.finished || 0) + (st.continued || 0) + (st.started || 0)) / (started || 1));
        return { t: "big", hue: "var(--green)", hue2: "var(--anime)", ch: "Completion", eyebrow: "Finishing", title: "You finished what you started",
          value: good, fmt: "pct", unit: "of titles completed or ongoing",
          segs: [["finished", "Completed", "var(--green)"], ["continued", "Watching or reading", "var(--cs)"], ["paused", "Paused", "var(--amber)"], ["dropped", "Dropped", "var(--red)"]]
            .filter(function (x) { return st[x[0]]; }).map(function (x) { return { label: x[1], value: st[x[0]], text: W.num(st[x[0]]), hue: x[2] }; }), foot: null };
      },
      level: function () {
        return { t: "big", hue: "var(--gold)", hue2: "var(--crimson)", ch: "Level", eyebrow: "Governor", title: "You went from Level " + g.levelFrom + " to",
          value: g.level, fmt: "int", unit: g.xp ? "+" + W.num(g.xp) + " XP earned" : "", segs: [], foot: g.gold ? "Earned " + thisN + ": +" + W.num(g.gold) + " ◆" : null };
      },
      recap: function () {
        var rows = [[W.hm(s.mins), "studied"]];
        if (s.recall != null) rows.push([s.recall + "%", "recall"]);
        if (c && c.count) rows.push([W.num(c.count), c.count === 1 ? "title" : "titles"]);
        if (fo.blocks) rows.push([String(fo.blocks), "Focus blocks"]);
        if (f.plan) rows.push([f.plan.ticked + "/" + f.plan.planned, "plan rows"]);
        if (f.period === "year" && f.records && f.records.streak) rows.push([String(f.records.streak.days), "day streak"]);
        else if (g.streak) rows.push([String(g.streak), "day streak"]);
        if (s.toGreen && rows.length < 6) rows.push([String(s.toGreen), "to Green"]);
        if (f.period === "year" && g.level && rows.length < 6) rows.push(["Lv " + g.level, "level"]);
        return { t: "summary", hue: "var(--gold)", hue2: "var(--crimson)", ch: "Recap", eyebrow: "That was your " + noun, title: words.headline,
          rows: rows.slice(0, 6), earned: g.xp ? "Earned +" + W.num(g.xp) + " XP" + (g.gold ? " · +" + W.num(g.gold) + " ◆" : "") : null };
      }
    };
    function cmpRow(label, a, b, fmt, hue, unit) {
      if (a == null || b == null) return null;
      var max = Math.max(a, b) || 1, d = W.compare(b, a, prevName, unit === "mins" ? "mins" : unit === "pts" ? "pct" : null);
      return { label: label, a: fmt(a), b: fmt(b), wa: Math.round(100 * a / max), wb: Math.round(100 * b / max), hue: hue,
        d: d ? d.text : "", dTone: d && (d.dir === "up" || d.dir === "new") ? "var(--teal)" : "var(--rp-stage-muted)" };
    }
    function stripStory(ch, ttl) {
      var cols = (f.strip || []), max = 0, hi = -1;
      cols.forEach(function (x, i) { var m = x.f ? x.f.mins : 0; if (m > max) { max = m; hi = i; } });
      var calls = [];
      if (hi >= 0) calls.push({ label: f.period === "year" ? "Busiest month" : "Busiest week", value: cols[hi].label, text: W.hm(max), hue: "var(--maths)" });
      var quiet = cols.filter(function (x) { return x.f; }).sort(function (a, b) { return a.f.mins - b.f.mins; })[0];
      if (quiet && quiet !== cols[hi]) calls.push({ label: f.period === "year" ? "Quietest" : "Quietest week", value: quiet.label, text: W.hm(quiet.f.mins), hue: "var(--teal)" });
      return { t: "bars", hue: "var(--maths)", hue2: "var(--cs)", ch: ch, eyebrow: ch, title: ttl,
        cols: cols.map(function (x) { return { label: x.label.replace(/^w/, ""), value: x.f ? x.f.mins : 0, text: "" }; }), hi: hi, calls: calls, dense: cols.length > 12 };
    }
    (f.stories || ["intro", "study", "recap"]).forEach(function (id) {
      var m = make[id];
      if (!m) return;
      try { var sl = m(); if (sl) { sl.id = id; out.push(sl); } } catch (e) { /* a story whose facts are missing is dropped */ }
    });
    return out;
  }

  /* ================= drawing one story ================= */
  function inn(node, d) { node.classList.add("k-rp-in"); node.style.setProperty("--d", d + "ms"); return node; }
  function counter(value, fmt) {
    return el("span", { "data-count": String(value), "data-fmt": fmt || "int", text: fmt === "hm" ? W.hm(value) : W.num(value) });
  }
  function stageCover(it, cls) {
    var mod = KOS.media && KOS.media.module ? KOS.media.module(it.module) || {} : {};
    return el("span", { class: "k-rp-st-cover" + (cls ? " " + cls : ""), style: "--c: " + (MOD_HUE[it.module] || "var(--text-2)") },
      [KOS.medview.cover({ title: it.name || it.title || "", coverUrl: it.cover || "" }, mod.kanji || "")]);
  }
  function draw(sl, api) {
    var body = el("div", { class: "k-rp-st-body", "data-layout": sl.t });
    body.appendChild(inn(el("div", { class: "k-rp-st-top" }, [
      el("div", { class: "k-rp-st-eyebrow", text: sl.eyebrow }),
      el("h2", { class: "k-rp-st-title", "data-ui": "reports.story-title", text: sl.title })
    ]), 0));
    var add = function (n, d) { body.appendChild(inn(n, d)); return n; };
    if (sl.t === "intro") {
      add(el("p", { class: "k-rp-st-sub", text: sl.sub }), 150);
      body.appendChild(el("span", { class: "k-rp-st-kanji", lang: "ja", "aria-hidden": "true", text: sl.kanji }));
      if (sl.chips.length) add(el("div", { class: "k-rp-st-chips" }, sl.chips.map(function (c) { return el("span", { class: "k-rp-st-chip", text: c }); })), 400);
    } else if (sl.t === "big") {
      add(el("div", { class: "k-rp-st-big" }, [counter(sl.value, sl.fmt)]), 120);
      add(el("div", { class: "k-rp-st-unit", text: sl.unit }), 160);
      if (sl.segs.length) {
        var total = sl.segs.reduce(function (a, g) { return a + g.value; }, 0) || 1;
        add(el("div", { class: "k-rp-st-split" }, sl.segs.map(function (g) { return el("span", { class: "k-rp-grow", style: "--w: " + (100 * g.value / total).toFixed(1) + "%; --c: " + g.hue }); })), 300);
        add(el("ul", { class: "k-rp-st-rows" }, sl.segs.map(function (g, i) {
          return inn(el("li", {}, [el("span", { class: "k-rp-st-dot", style: "--c: " + g.hue }), el("span", { text: g.label }), el("b", { class: "k-mono", text: g.text })]), 420 + i * 120);
        })), 0);
      }
      if (sl.foot) add(el("p", { class: "k-rp-st-foot", text: sl.foot }), 900);
    } else if (sl.t === "top") {
      add(el("ol", { class: "k-rp-st-top5" }, sl.items.map(function (it, i) {
        return inn(el("li", {}, [
          el("span", { class: "k-rp-st-rank", style: "--c: " + it.hue, text: String(i + 1) }),
          el("span", { class: "k-rp-st-swatch", style: "--c: " + it.hue, "aria-hidden": "true" }),
          el("span", { class: "k-rp-st-item" }, [el("b", { text: it.name }), el("span", { class: "k-mono", text: it.meta }),
            el("span", { class: "k-rp-st-track" }, [el("i", { class: "k-rp-grow", style: "--w: " + it.pct + "%; --c: " + it.hue })])])
        ]), 150 + i * 140);
      })), 0);
      add(el("p", { class: "k-rp-st-foot", text: sl.foot }), 1000);
    } else if (sl.t === "quiz") {
      var picked = api.pick(sl.id), max = Math.max.apply(null, sl.opts.map(function (o) { return o.value; }).concat([1]));
      var list = add(el("div", { class: "k-rp-st-quiz", role: "group", "aria-label": sl.title }), 150);
      sl.opts.forEach(function (o, i) {
        var state = picked == null ? null : i === sl.ans ? "right" : i === picked ? "wrong" : "other";
        list.appendChild(inn(el("button", { type: "button", class: "k-rp-st-opt", "data-ui": "reports.story-option", "data-state": state,
          disabled: picked != null ? "" : null, onclick: function () { api.choose(sl.id, i); } }, [
          el("span", { class: "k-rp-st-optfill", style: "--w: " + (picked == null ? 0 : (100 * o.value / max).toFixed(1)) + "%" }),
          el("span", { class: "k-rp-st-optl", text: o.label }),
          picked != null ? el("span", { class: "k-mono", text: o.text }) : null,
          state === "right" ? el("span", { class: "k-rp-st-mark", text: "✓" }) : state === "wrong" ? el("span", { class: "k-rp-st-mark", text: "✕" }) : null
        ].filter(Boolean)), 200 + i * 110));
      });
      add(el("p", { class: "k-rp-st-foot", "data-ui": "reports.story-reveal", role: "status",
        text: picked == null ? "Tap a day to guess." : (picked === sl.ans ? "Right. " : "Not quite. ") + sl.reveal }), 0);
    } else if (sl.t === "grid") {
      add(el("div", { class: "k-rp-st-big k-rp-st-big--grid" }, [counter(sl.value, "int")]), 120);
      add(el("div", { class: "k-rp-st-mosaic", "aria-hidden": "true" }, sl.tiles.map(function (h, i) {
        var t = el("span", { class: "k-rp-pop", style: "--c: " + h }); t.style.setProperty("--d", (250 + i * 28) + "ms"); return t;
      })), 0);
      add(el("ul", { class: "k-rp-st-legend" }, sl.legend.map(function (g) {
        return el("li", {}, [el("span", { class: "k-rp-st-dot k-rp-st-dot--sq", style: "--c: " + g.hue }), el("span", { text: g.label }), el("b", { class: "k-mono", text: g.text })]);
      })), 600);
      if (sl.foot) add(el("p", { class: "k-rp-st-foot", text: sl.foot }), 900);
    } else if (sl.t === "hilo") {
      add(el("div", { class: "k-rp-st-hilos" }, sl.cards.map(function (h, i) {
        return inn(el("div", { class: "k-rp-st-hilo", style: "--c: " + h.hue }, [
          h.module ? stageCover({ module: h.module, name: h.name, cover: h.cover }) : el("span", { class: "k-rp-st-swatch k-rp-st-swatch--tall", style: "--c: " + h.hue, "aria-hidden": "true" }),
          el("div", { class: "k-rp-st-hilo-t" }, [el("span", { class: "k-rp-st-eyebrow", text: h.tag }), el("b", { text: h.name }),
            el("span", { class: "k-rp-st-meta", text: h.meta }), el("span", { class: "k-rp-st-score" }, [el("b", { class: "k-mono", text: String(h.value) }), el("span", { class: "k-mono", text: h.unit || "/10" })])])
        ]), 150 + i * 200);
      })), 0);
      if (sl.foot) add(el("p", { class: "k-rp-st-foot k-rp-st-foot--c", text: sl.foot }), 700);
    } else if (sl.t === "persona") {
      add(el("div", { class: "k-rp-st-persona", text: sl.name }), 300);
      add(el("p", { class: "k-rp-st-sub", text: sl.fact }), 900);
      add(el("div", { class: "k-rp-st-stats" }, sl.stats.map(function (st, i) {
        return inn(el("div", { class: "k-rp-st-stat" }, [el("b", { class: "k-mono", text: st[0] }), el("span", { text: st[1] })]), 1200 + i * 140);
      })), 0);
      body.appendChild(el("span", { class: "k-rp-st-ghost", lang: "ja", "aria-hidden": "true", text: sl.kanji }));
    } else if (sl.t === "bars") {
      var bmax = Math.max.apply(null, sl.cols.map(function (c) { return c.value; }).concat([1]));
      add(el("div", { class: "k-rp-st-bars" + (sl.dense ? " k-rp-st-bars--dense" : ""), role: "img", "aria-label": sl.cols.map(function (c, i) { return (c.label || String(i + 1)) + " " + (c.text || W.hm(c.value)); }).join(", ") },
        sl.cols.map(function (c, i) {
          return el("span", { class: "k-rp-st-col", "data-state": i === sl.hi ? "hi" : null }, [
            el("span", { class: "k-mono k-rp-st-colv", text: c.text }),
            el("i", { class: "k-rp-grow k-rp-grow--y", style: "--h: " + (100 * c.value / bmax).toFixed(1) + "%" })
          ]);
        })), 150);
      add(el("div", { class: "k-rp-st-cols-l" + (sl.dense ? " k-rp-st-bars--dense" : ""), "aria-hidden": "true" }, sl.cols.map(function (c, i) { return el("span", { "data-state": i === sl.hi ? "hi" : null, text: c.label }); })), 150);
      add(el("div", { class: "k-rp-st-calls" }, sl.calls.map(function (k, i) {
        return inn(el("div", { class: "k-rp-st-call" }, [el("span", { class: "k-rp-st-eyebrow", style: "--c: " + k.hue, text: k.label }), el("b", { text: k.value }), el("span", { class: "k-mono", text: k.text })]), 700 + i * 150);
      })), 0);
    } else if (sl.t === "dna") {
      add(el("ol", { class: "k-rp-st-dna" }, sl.items.map(function (d, i) {
        return inn(el("li", { style: "--c: " + d.hue }, [
          el("span", { class: "k-rp-st-dna-h" }, [el("span", { class: "k-mono k-rp-st-dna-r", text: "#" + (i + 1) }), el("b", { text: d.name }), el("span", { class: "k-mono", text: d.n }), el("span", { class: "k-mono k-rp-st-dna-p", text: d.pct + "%" })]),
          el("span", { class: "k-rp-st-track" }, [el("i", { class: "k-rp-grow", style: "--w: " + d.pct + "%; --c: " + d.hue })])
        ]), 150 + i * 140);
      })), 0);
      if (sl.foot) add(el("p", { class: "k-rp-st-foot", text: sl.foot }), 1000);
    } else if (sl.t === "flow") {
      add(el("ol", { class: "k-rp-st-flow" }, sl.items.map(function (x, i) {
        return inn(el("li", {}, [el("span", { class: "k-mono k-rp-st-meta", text: "#" + (i + 1) }), el("span", { class: "k-rp-st-dot", style: "--c: " + x.fromHue }), el("b", { text: x.from }),
          el("span", { class: "k-rp-st-meta", "aria-label": "then", text: "→" }), el("span", { class: "k-rp-st-dot", style: "--c: " + x.toHue }), el("b", { text: x.to }), el("span", { class: "k-mono k-rp-st-flow-n", text: x.n })]), 150 + i * 160);
      })), 0);
      if (sl.foot) add(el("p", { class: "k-rp-st-foot", text: sl.foot }), 900);
    } else if (sl.t === "compare") {
      add(el("ul", { class: "k-rp-st-compare" }, sl.rows.map(function (r, i) {
        return inn(el("li", {}, [
          el("span", { class: "k-rp-st-compare-h" }, [el("span", { class: "k-rp-st-dot", style: "--c: " + r.hue }), el("b", { text: r.label }),
            el("span", { class: "k-mono k-rp-st-meta", text: r.a }), el("span", { class: "k-rp-st-meta", "aria-label": "to", text: "→" }), el("b", { class: "k-mono", text: r.b })]),
          el("span", { class: "k-rp-st-bar-a", style: "--w: " + r.wa + "%" }),
          el("i", { class: "k-rp-grow k-rp-st-bar-b", style: "--w: " + r.wb + "%; --c: " + r.hue }),
          r.d ? el("span", { class: "k-mono k-rp-st-delta", style: "--c: " + r.dTone, text: r.d }) : null
        ].filter(Boolean)), 150 + i * 150);
      })), 0);
      if (sl.foot) add(el("p", { class: "k-rp-st-foot", text: sl.foot }), 900);
    } else if (sl.t === "cards") {
      add(el("ul", { class: "k-rp-st-cards" }, sl.cards.map(function (k, i) {
        return inn(el("li", { style: "--c: " + k.hue }, [el("span", { class: "k-rp-st-swatch", "aria-hidden": "true" }),
          el("span", { class: "k-rp-st-item" }, [el("span", { class: "k-rp-st-eyebrow", text: k.tag }), el("b", { text: k.name }), el("span", { class: "k-rp-st-meta", text: k.meta })]),
          el("b", { class: "k-mono k-rp-st-cards-v", text: k.v })]), 150 + i * 150);
      })), 0);
      if (sl.foot) add(el("p", { class: "k-rp-st-foot", text: sl.foot }), 800);
    } else if (sl.t === "summary") {
      add(el("div", { class: "k-rp-st-rim" }, [el("div", { class: "k-rp-st-recap" }, [
        el("div", { class: "k-rp-st-recap-grid" }, sl.rows.map(function (r) { return el("div", {}, [el("b", { class: "k-mono", text: r[0] }), el("span", { text: r[1] })]); })),
        sl.earned ? el("p", { class: "k-rp-st-earned", text: sl.earned }) : null
      ].filter(Boolean))]), 150);
      add(el("div", { class: "k-rp-st-actions" }, [
        el("button", { type: "button", class: "k-btn k-btn--primary k-rp-st-share", "data-ui": "reports.story-share", text: "⇪ Share card", onclick: api.share }),
        el("button", { type: "button", class: "k-btn k-rp-st-ghostbtn", "data-ui": "reports.story-replay", text: "↺ Replay", onclick: api.replay })
      ]), 600);
      add(el("button", { type: "button", class: "k-link k-rp-st-open", "data-ui": "reports.story-open", text: "Open the full report →", onclick: api.openReport }), 700);
    }
    return body;
  }

  /* ================= the player ================= */
  function speedNow() {
    var v = (KOS.store.state.ui || {}).reportSpeed;
    return SPEEDS.indexOf(v) !== -1 ? v : 1;
  }
  function reduced() {
    try { return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches); } catch (e) { return false; }
  }
  function open(rep, startAt) {
    var list = slides(rep);
    if (!list.length) return null;
    var idx = Math.max(0, Math.min(list.length - 1, startAt || 0));
    var elapsed = 0, paused = false, picks = {}, raf = null, last = null, closed = false;
    var still = reduced();
    var f = rep.facts;

    var segs = el("div", { class: "k-rp-st-segs", "aria-hidden": "true" }, list.map(function () { return el("span", {}, [el("i")]); }));
    var speedBtn = el("button", { type: "button", class: "k-rp-st-pill", "data-ui": "reports.story-speed", onclick: function () {
      var i = SPEEDS.indexOf(speedNow());
      KOS.store.state.ui = KOS.store.state.ui || {};
      KOS.store.state.ui.reportSpeed = SPEEDS[(i + 1) % SPEEDS.length];
      KOS.store.save();
      paintChrome();
    } });
    var pauseBtn = el("button", { type: "button", class: "k-rp-st-round", "data-ui": "reports.story-pause", onclick: function () { setPaused(!paused); } });
    var closeBtn = el("button", { type: "button", class: "k-rp-st-round", "data-ui": "reports.story-close", "aria-label": "Close the story", onclick: close }, [KOS.ui.icon("close")]);
    var seal = el("span", { class: "k-rp-st-seal", lang: "ja", "aria-hidden": "true", text: SEAL[f.period] || "週" });
    var head = el("div", { class: "k-rp-st-head" }, [seal,
      el("span", { class: "k-rp-st-label" }, [el("b", { text: LABEL[f.period] || "Your week" }), el("span", { class: "k-mono", text: rangeText(f.start, f.end) })]),
      speedBtn, pauseBtn, closeBtn]);
    var counterEl = el("span", { class: "k-mono" });
    var foot = el("div", { class: "k-rp-st-foot-bar", "aria-hidden": "true" }, [el("span", { text: "KURENAIOS" }), counterEl]);
    var holder = el("div", { class: "k-rp-st-holder", "aria-live": "polite" });
    var prevZone = el("button", { type: "button", class: "k-rp-st-zone", "data-edge": "prev", tabindex: "-1", "aria-label": "Previous story", onclick: function () { go(-1); } });
    var nextZone = el("button", { type: "button", class: "k-rp-st-zone", "data-edge": "next", tabindex: "-1", "aria-label": "Next story", onclick: function () { go(1); } });
    var stage = el("div", { class: "k-rp-st-stage", "data-ui": "reports.story-stage", "data-state": still ? "still" : null },
      [prevZone, nextZone, segs, head, holder, foot]);
    var frame = el("div", { class: "k-rp-st-frame" }, [stage]);
    var chips = el("div", { class: "k-rp-st-chips-nav", role: "group", "aria-label": "Stories" }, list.map(function (sl, i) {
      return el("button", { type: "button", class: "k-rp-st-navchip", "data-ui": "reports.story-chip", onclick: function () { show(i); } },
        [el("span", { class: "k-mono", text: String(i + 1) }), el("span", { text: sl.ch })]);
    }));
    var box = el("div", { class: "k-rp-st", "data-ui": "ui.dialog reports.story", "aria-label": (LABEL[f.period] || "Your week") + " as a story" }, [
      el("button", { type: "button", class: "k-rp-st-arrow", "data-edge": "prev", "data-ui": "reports.story-prev", "aria-label": "Previous story", onclick: function () { go(-1); } }, [KOS.ui.icon("chev-left")]),
      frame,
      el("button", { type: "button", class: "k-rp-st-arrow", "data-edge": "next", "data-ui": "reports.story-next", "aria-label": "Next story", onclick: function () { go(1); } }, [KOS.ui.icon("chev-right")]),
      chips,
      el("p", { class: "k-rp-st-hint", text: "← → or tap the sides to move · Space pauses · a quiz waits for your guess" })
    ]);
    var overlay = el("div", { class: "k-dialog-overlay k-rp-st-overlay" }, [box]);

    var api = {
      pick: function (id) { return picks[id]; },
      choose: function (id, i) {
        if (picks[id] != null) return;
        picks[id] = i; elapsed = 0;
        render();
      },
      share: function () { if (KOS.reportShare) KOS.reportShare.dialog(rep, { format: "png" }); },
      replay: function () { picks = {}; show(0); },
      openReport: function () { close(); KOS.show("reports", { period: rep.period, start: rep.start }); }
    };
    function waiting() { var sl = list[idx]; return sl.t === "quiz" && picks[sl.id] == null; }
    function paintChrome() {
      speedBtn.textContent = speedNow() + "×";
      speedBtn.setAttribute("aria-label", "Speed " + speedNow() + "×");
      pauseBtn.textContent = "";
      pauseBtn.appendChild(KOS.ui.icon(paused ? "play" : "pause"));
      pauseBtn.setAttribute("aria-label", paused ? "Play" : "Pause");
      KOS.ui.state(stage, "paused", paused);
      counterEl.textContent = (idx + 1) + " / " + list.length;
      [].forEach.call(chips.children, function (c, i) { c.setAttribute("aria-current", i === idx ? "true" : "false"); KOS.ui.state(c, "on", i === idx); });
    }
    function render() {
      var sl = list[idx];
      stage.style.setProperty("--hue", sl.hue);
      stage.style.setProperty("--hue2", sl.hue2);
      holder.textContent = "";
      holder.appendChild(draw(sl, api));
      paintChrome();
      tick(true);
    }
    /* moving by hand resumes the story: a story jumped to while paused
       would otherwise sit at the first frame of its entrance, empty */
    function show(i) { idx = Math.max(0, Math.min(list.length - 1, i)); elapsed = 0; paused = false; render(); }
    function go(d) {
      if (d > 0 && idx === list.length - 1) return;
      if (d < 0 && idx === 0) { elapsed = 0; paused = false; render(); return; }
      show(idx + d);
    }
    function setPaused(p) { paused = p; paintChrome(); }
    /* the clock: segments, count-ups, and the advance */
    function tick(force) {
      var p = Math.min(1, elapsed / DUR);
      [].forEach.call(segs.children, function (s, i) { s.firstChild.style.setProperty("--p", (i < idx ? 1 : i > idx ? 0 : p).toFixed(3)); });
      var q = still ? 1 : 1 - Math.pow(1 - Math.min(1, elapsed / 1400), 3);
      [].forEach.call(holder.querySelectorAll("[data-count]"), function (n) {
        var v = Math.round(+n.getAttribute("data-count") * q);
        n.textContent = n.getAttribute("data-fmt") === "hm" ? W.hm(v) : W.num(v);
      });
    }
    function frameLoop(t) {
      if (closed) return;
      if (last == null) last = t;
      var dt = Math.max(0, Math.min(100, t - last));
      last = t;
      if (!paused) {
        elapsed += dt * speedNow();
        if (elapsed >= DUR && !waiting() && idx < list.length - 1) { show(idx + 1); }
        else tick();
      }
      raf = window.requestAnimationFrame(frameLoop);
    }
    function fit() {
      var vw = window.innerWidth || 1024, vh = window.innerHeight || 800;
      var phone = vw < 700;
      var s = phone ? Math.min(vw / 450, vh / 800) : Math.min(1, (vh - 120) / 800, (vw - 160) / 450);
      /* the phone is full screen (25g): the stage keeps the width's scale
         and grows taller to the screen's height instead of leaving black
         bands above and below it */
      if (phone && vh / (vw / 450) >= 800) { s = vw / 450; frame.style.setProperty("--rp-stage-h", Math.floor(vh / s) + "px"); }
      else frame.style.removeProperty("--rp-stage-h");
      frame.style.setProperty("--s", Math.max(0.4, s).toFixed(4));
    }
    /* swipes on a phone */
    var touchX = null;
    stage.addEventListener("touchstart", function (e) { touchX = e.touches && e.touches[0] ? e.touches[0].clientX : null; }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (touchX == null || !e.changedTouches || !e.changedTouches[0]) return;
      var dx = e.changedTouches[0].clientX - touchX;
      touchX = null;
      if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
    });
    function onKey(e) {
      if (closed || e.defaultPrevented) return;
      var t = e.target;
      if (t && t.closest && t.closest("input, select, textarea")) return;
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
      else if (e.key === " " || e.key === "Spacebar") {
        if (t && t.closest && t.closest("button") && !t.closest(".k-rp-st-zone")) return;   // Space on a button presses it
        e.preventDefault(); setPaused(!paused);
      }
    }
    function close() {
      if (closed) return;
      closed = true;
      if (raf && window.cancelAnimationFrame) window.cancelAnimationFrame(raf);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", fit);
      if (overlay.isConnected) overlay.remove();
    }
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", fit);
    fit();
    render();
    KOS.ui.openDialog(overlay, { label: (LABEL[f.period] || "Your week") + " as a story", initialFocus: pauseBtn,
      onClose: function () { if (!closed) { closed = true; if (raf && window.cancelAnimationFrame) window.cancelAnimationFrame(raf);
        document.removeEventListener("keydown", onKey); window.removeEventListener("resize", fit); } } });
    raf = window.requestAnimationFrame(frameLoop);
    return { close: close, index: function () { return idx; }, paused: function () { return paused; } };
  }

  KOS.reportStory = { slides: slides, open: open, DUR: DUR };
})();
