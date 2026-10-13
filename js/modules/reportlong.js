/* Kurenai OS — modules/reportlong.js
   Reports (roadmap 5.1, phase 6): the month (24c), the term (24d) and the
   year (24e, 24j) — each a saved report drawn like the week (25a: the
   story hero with the headline, then the facts), with the sections only a
   longer period can support.

     month  tiles against the month before; the days as a stacked chart
            across the page with last month's daily average dashed and
            labelled at its end; then subject balance, mastery by unit,
            top topics, the Collection's completions and score spread,
            Kurenai, and the plan, tasks and Governor.
     term   adds the plan against class (a cell a week per subject, from
            the braid), results with grade chips and the units still to
            sit, weakest and strongest topics (20+ reviews), Focus habits
            across the page, the weeks of the term.
     year   a long read: the opening (the year in mono, the headline, six
            facts, the contents), then seven chapters — 一 Study, 二
            Results, 三 Focus, 四 The plan, 五 Collection, 六 Records, 七
            Milestones — each ending ↑ Contents / Next ↓; while scrolled a
            sticky chip names the chapter and opens a list of all seven.

   Cards of different heights flow as balanced columns (`flow`), so a
   short card never leaves a hole beside a tall one (review after
   release). Everything here READS the saved facts (invariant 102a); the
   README's rules were applied when they were built (one study day: no
   busiest day, peak hour, balance or mastery — 24g).                     */
(function () {
  "use strict";
  var K = function () { return KOS.reportsKit; };
  var W = KOS.reportWords;
  var KANJI = ["一", "二", "三", "四", "五", "六", "七"];

  function el() { return K().el.apply(null, arguments); }
  function prevName(rep) {
    if (rep.period === "month") { var d = K().parse(rep.start); d.setMonth(d.getMonth() - 1); return K().MONTHS[d.getMonth()]; }
    return "last " + rep.period;
  }
  function cmp(now, before, rep, kind) { return before == null ? null : W.compare(now, before, prevName(rep), kind); }
  function short(c) { return c ? { dir: c.dir, text: c.text.replace(/ on .*$/, "").replace(/^same as .*$/, "same") } : null; }
  /* balanced columns: as many as there are cards, up to three (two from
     1240, one from 860) — never an empty column */
  function flow(cards) { return K().masonry(cards, 3); }

  /* ---------------- charts ---------------- */
  /* the days of a month, stacked by subject, with last month's daily
     average dashed across and labelled at its end (24c) */
  function monthChart(rep, opts) {
    opts = opts || {};
    var k = K(), f = rep.facts, s = f.study;
    if (s.days <= 1) return oneDay(rep);
    var keys = k.SUBJECTS.filter(function (x) { return s.bySubject[x]; });
    var start = k.parse(rep.start);
    var hi = s.busiest ? Math.round((k.parse(s.busiest.date) - start) / 864e5) : null;
    var cols = s.dayMins.map(function (m, i) {
      var d = new Date(start); d.setDate(d.getDate() + i);
      return { label: String(d.getDate()), title: d.getDate() + " " + k.MONTHS[d.getMonth()], parts: (s.daySubj || [])[i] || {} };
    });
    var avg = f.prev && f.prev.dayAvg;
    var chart = k.fluid(function (w) {
      var c = k.stacked(cols, keys, k.SUBJ_HUE, { unit: "mins", width: w, height: opts.height || 220, hi: hi, every: w > 700 ? 2 : 4,
        avg: avg || null, avgLabel: avg ? [prevName(rep), W.hm(avg) + " / day"] : null });
      c.setAttribute("role", "img");
      c.setAttribute("aria-label", "Study by day across the " + rep.period + ": " + W.hm(s.mins) + " on " + s.days + " days" + (avg ? "; " + prevName(rep) + "'s daily average " + W.hm(avg) : ""));
      return c;
    }, 760);
    return opts.bare ? chart : el("div", { class: "k-rp-chartwrap" }, [chart, k.subjLegend(keys)]);
  }
  /* 24g: with one study day there is no pattern; the day itself is marked */
  function oneDay(rep) {
    var k = K(), s = rep.facts.study;
    var cells = el("ol", { class: "k-rp-cal", "data-ui": "reports.one-day", "aria-label": "The study days of the " + rep.period }, s.dayMins.map(function (m, i) {
      var d = k.parse(rep.start); d.setDate(d.getDate() + i);
      return el("li", { class: "k-rp-cal-d", "data-state": m ? "on" : null, title: d.getDate() + " " + k.MONTHS[d.getMonth()] + (m ? " · " + W.hm(m) : "") }, [el("span", { text: String(d.getDate()) })]);
    }));
    var note = s.busiest ? (function () { var d = k.parse(s.busiest.date); return k.DOW[(d.getDay() + 6) % 7] + " " + d.getDate() + " " + k.MONTHS[d.getMonth()] + " · " + W.hm(s.busiest.mins); })() : null;
    return el("div", { class: "k-rp-lowdata" }, [
      cells,
      el("p", { class: "k-rp-note", text: "One day isn't a pattern: the busiest day, peak hour and subject balance are left out." + (note ? " The day: " + note + "." : "") })
    ]);
  }
  /* a term's weeks or a year's months, stacked by subject */
  function stripChart(f, opts) {
    opts = opts || {};
    var k = K(), cols = f.strip || [];
    if (!cols.filter(function (c) { return c.f; }).length) return el("p", { class: "k-rp-note", text: "The " + (f.period === "year" ? "months" : "weeks") + " of this " + f.period + " have no saved reports to draw." });
    var keys = k.SUBJECTS.filter(function (x) { return f.study.bySubject[x]; });
    var chart = k.fluid(function (w) {
      var c = k.stacked(cols.map(function (c) { return { label: c.label, parts: c.f ? c.f.bySubject || {} : {} }; }), keys, k.SUBJ_HUE, { unit: "mins", width: w, height: opts.height || 210 });
      c.setAttribute("role", "img");
      c.setAttribute("aria-label", "Study by " + (f.period === "year" ? "month" : "week") + ": " + cols.map(function (c) { return c.label + " " + (c.f ? W.hm(c.f.mins) : "no report"); }).join(", "));
      return c;
    }, 760);
    return opts.bare ? chart : el("div", { class: "k-rp-chartwrap" }, [chart, k.subjLegend(keys)]);
  }

  /* ---------------- the sections ---------------- */
  function activityCard(rep, title) {
    var k = K(), keys = k.SUBJECTS.filter(function (x) { return rep.facts.study.bySubject[x]; });
    return k.card(title, { className: "k-rp-card--full", right: keys.length && rep.facts.study.days > 1 ? k.subjLegend(keys) : null },
      [rep.period === "month" ? monthChart(rep, { bare: true }) : stripChart(rep.facts, { bare: true })]);
  }
  function balance(rep) {
    var k = K(), f = rep.facts, s = f.study;
    if (s.days <= 1 || !s.mins) return null;
    var prev = f.prev && f.prev.bySubject, prevTot = prev ? Object.keys(prev).reduce(function (a, x) { return a + prev[x]; }, 0) : 0;
    var rows = k.SUBJECTS.filter(function (x) { return s.bySubject[x]; }).map(function (x) {
      var share = Math.round(100 * s.bySubject[x] / s.mins);
      var was = prevTot ? Math.round(100 * (prev[x] || 0) / prevTot) : null;
      var d = was == null ? null : short(W.compare(share, was, prevName(rep), "pct"));
      return el("li", { class: "k-rp-bal-row" }, [
        el("span", { class: "k-rp-bal-n" }, [k.dot(k.SUBJ_HUE[x]), el("span", { text: W.SUBJECT_SHORT[x] })]),
        el("span", { class: "k-rp-bar", "aria-hidden": "true", style: "--w: " + share + "%; --c: " + k.SUBJ_HUE[x] }),
        k.mono(W.hm(s.bySubject[x]), "k-rp-bal-h"), k.mono(share + "%", "k-rp-bal-share"),
        d ? el("span", { class: "k-rp-cmp", "data-tone": d.dir === "up" || d.dir === "new" ? "up" : null, text: d.text }) : null
      ].filter(Boolean));
    });
    return k.card("Subject balance", { go: function () { k.open(rep, "study"); } }, [
      el("p", { class: "k-rp-card-sub", text: "Share of study time" + (prevTot ? ", against " + prevName(rep) + "'s share" : "") }),
      el("ul", { class: "k-rp-bal" }, rows)]);
  }
  function mix(m) {
    var t = (m.r + m.a + m.g) || 1;
    return ["r", "a", "g"].filter(function (b) { return m[b]; }).map(function (b) {
      return el("span", { class: "k-rp-mix-seg", "data-band": b, style: "--f: " + (m[b] / t).toFixed(4) });
    });
  }
  function masteryCard(rep) {
    var k = K(), f = rep.facts;
    if (!f.mastery || f.study.days <= 1) return null;
    var key = el("ul", { class: "k-rp-legend k-rp-legend--tight" }, [["r", "Red"], ["a", "Amber"], ["g", "Green"]].map(function (b) {
      return el("li", {}, [el("span", { class: "k-rp-mix-key", "data-band": b[0], "aria-hidden": "true" }), el("span", { text: b[1] })]);
    }));
    return k.card("Mastery by unit", { right: key }, [
      el("p", { class: "k-rp-card-sub", text: "Topic status at the start (thin) and the end (thick)" }),
      el("ul", { class: "k-rp-mastery" }, f.mastery.map(function (u) {
        return el("li", {}, [
          el("span", { class: "k-rp-mastery-n" }, [k.dot(k.SUBJ_HUE[u.sid] || "var(--text-2)"), k.mono(u.ref, "k-rp-ref"), el("span", { class: "k-rp-mastery-t", title: u.title, text: u.title })]),
          el("span", { class: "k-rp-mixes" }, [
            el("span", { class: "k-rp-mix k-rp-mix--thin", role: "img", "aria-label": "Start: " + u.start.r + " red, " + u.start.a + " amber, " + u.start.g + " green" }, mix(u.start)),
            el("span", { class: "k-rp-mix", role: "img", "aria-label": "End: " + u.end.r + " red, " + u.end.a + " amber, " + u.end.g + " green" }, mix(u.end))]),
          k.mono(u.green ? (u.green > 0 ? "+" : "") + u.green + " Green" : "", "k-rp-mastery-g")]);
      }))
    ]);
  }
  function collectionCard(rep) {
    var k = K(), c = rep.facts.collection;
    if (!c) return null;
    var scored = c.titles.filter(function (t) { return t.score; });
    var stackAt = {};
    var dots = el("div", { class: "k-rp-dots", role: "img", "aria-label": "Scores given: " + scored.map(function (t) { return t.score; }).join(", ") }, [
      el("span", { class: "k-rp-dots-line", "aria-hidden": "true" })
    ].concat(scored.slice(0, 80).map(function (t) {
      var b = Math.round(t.score * 2); stackAt[b] = (stackAt[b] || 0) + 1;
      return el("span", { class: "k-rp-dots-d", title: t.title + " · " + t.score, style: "--x: " + ((t.score - 1) / 9 * 100).toFixed(1) + "%; --c: " + k.MOD_HUE[t.module] + "; --y: " + Math.min(5, stackAt[b] - 1) });
    })).concat([el("span", { class: "k-rp-dots-axis", "aria-hidden": "true" }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) { return el("span", { text: String(n) }); }))]));
    var done = (c.completed || []).slice(0, 5);
    return k.card("Collection · " + W.plural(c.count, "title"), { go: function () { k.open(rep, "collection"); } }, [
      done.length ? el("h3", { class: "k-rp-subhead", text: "Completed · " + (c.status.finished || done.length) }) : null,
      done.length ? el("ul", { class: "k-rp-done-titles" }, done.map(function (t) {
        var full = k.coverOf(c, t);
        return el("li", {}, [k.cover(full, "k-rp-cover--row"), el("span", { class: "k-rp-done-t" }, [
          el("b", { title: t.title }, [k.dot(k.MOD_HUE[t.module]), el("span", { text: t.title })]),
          el("span", { class: "k-rp-note", text: W.MEDIUM[t.module] + (full.range ? " · " + full.range : "") })]),
          t.score ? k.mono(String(t.score), "k-rp-done-s") : el("span", {})]);
      })) : null,
      !done.length && c.genres.length ? el("h3", { class: "k-rp-subhead", text: "Genre DNA" }) : null,
      !done.length && c.genres.length ? k.genreBars(c) : null,
      scored.length ? el("div", { class: "k-rp-subrow" }, [el("h3", { class: "k-rp-subhead", text: "Scores given · " + c.scores.n }), k.mono("median " + c.scores.median, "k-rp-note")]) : null,
      scored.length ? dots : null
    ].filter(Boolean));
  }
  function kurenaiCard(rep) {
    var k = K(), ku = rep.facts.kurenai, prev = rep.facts.prev;
    if (!ku) return null;
    var areas = Object.keys(ku.areas || {}).sort(function (a, b) { return ku.areas[b] - ku.areas[a]; });
    var c = ku.chats ? cmp(ku.chats, prev ? prev.chats : null, rep) : null;
    var rows = [];
    if (ku.scheduled) rows.push({ k: "Scheduled messages", v: "sent " + ku.scheduled + " time" + (ku.scheduled === 1 ? "" : "s"), hue: "var(--bloom)" });
    if (areas.length) rows.push({ k: "Asked about", v: areas.slice(0, 3).map(function (a) { return a.charAt(0).toUpperCase() + a.slice(1) + " " + ku.areas[a]; }).join(" · ") });
    return k.card("Kurenai", {}, [
      ku.chats ? el("div", { class: "k-rp-big" }, [k.mono(String(ku.chats), "k-rp-big-n"), el("span", { text: ku.chats === 1 ? "conversation" : "conversations" })]) : null,
      c ? el("span", { class: "k-rp-cmp", "data-tone": c.dir === "up" || c.dir === "new" ? "up" : null, text: c.text }) : null,
      rows.length ? k.kvRows(rows) : null
    ].filter(Boolean));
  }
  function planGovCard(rep) {
    var k = K(), f = rep.facts, rows = [], prev = f.prev;
    if (f.plan) rows.push({ k: "Plan rows ticked", v: f.plan.ticked + " / " + f.plan.planned + (f.plan.carried ? " · " + f.plan.carried + " carried" : "") });
    if (f.tasks && f.tasks.reminders) { var c = short(cmp(f.tasks.reminders, prev ? prev.reminders : null, rep)); rows.push({ k: "Reminders done", v: String(f.tasks.reminders), chip: c && c.dir !== "same" ? c : null }); }
    if (f.tasks && f.tasks.habits) rows.push({ k: "Habits kept", v: f.tasks.habits.length + (f.tasks.habitDays ? " · on " + f.tasks.habitDays + " of " + f.study.of + " days" : "") });
    if (f.gov.xp) rows.push({ k: "Earned", v: "+" + W.num(f.gov.xp) + " XP" + (f.gov.gold ? " · +" + W.num(f.gov.gold) + " ◆" : "") });
    if (f.gov.streak) rows.push({ k: "Study streak", v: W.plural(f.gov.streak, "day"), tone: "teal" });
    if (f.gov.level) rows.push({ k: "Level", v: (f.gov.levelFrom ? f.gov.levelFrom + " → " : "") + f.gov.level });
    if (!rows.length) return null;
    return k.card("Plan, tasks and Governor", {}, [k.kvRows(rows)]);
  }
  function vsClassCard(rep) {
    var k = K(), v = rep.facts.vsClass;
    if (!v) return null;
    var POS = { ahead: "Ahead", aligned: "Aligned", behind: "Behind" };
    var n = v.rows[0] ? v.rows[0].cells.length : 0;
    return k.card("The plan against class", { className: "k-rp-card--full" }, [
      n ? el("div", { class: "k-rp-vs-axis", "aria-hidden": "true" }, [el("span", {}), el("span", { class: "k-rp-vs-ticks" }, [
        k.mono("w1 · " + k.dm(rep.start)), n > 8 ? k.mono("w" + Math.ceil(n / 2)) : null, k.mono("w" + n + " · " + k.dm(rep.end))].filter(Boolean)), k.mono("at term end")]) : null,
      el("ul", { class: "k-rp-vs" }, v.rows.map(function (r) {
        return el("li", { class: "k-rp-vs-row" }, [
          el("span", { class: "k-rp-vs-name" }, [k.dot(k.SUBJ_HUE[r.sid]), el("span", { text: W.SUBJECT[r.sid] })]),
          el("span", { class: "k-rp-vs-cells", role: "img", "aria-label": W.SUBJECT[r.sid] + ": " + r.cells.map(function (c, i) { return "week " + (i + 1) + " " + (c || "no class rows"); }).join(", "), style: "--n: " + r.cells.length },
            r.cells.map(function (c) { return el("span", { class: "k-rp-vs-cell", "data-state": c || "none" }); })),
          el("span", { class: "k-rp-vs-end" }, [el("span", { class: "k-chip k-rp-vs-chip", "data-tone": r.end.pos === "behind" ? "danger" : r.end.pos === "ahead" ? "teal" : null,
            text: POS[r.end.pos] + (r.end.n ? " · " + W.plural(r.end.n, "topic") : "") })])
        ]);
      })),
      el("ul", { class: "k-rp-legend" }, [["ahead", "ahead of class that week"], ["aligned", "aligned"], ["behind", "behind"]].map(function (x) {
        return el("li", {}, [el("span", { class: "k-rp-vs-cell k-rp-vs-key", "data-state": x[0], "aria-hidden": "true" }), el("span", { text: x[1] })]);
      }))
    ]);
  }
  function resultsCard(rep, title) {
    var k = K(), r = rep.facts.results;
    if (!r) return null;
    return k.card(title || "Results", {}, [el("ul", { class: "k-rp-results" }, r.list.map(function (x) {
      var d = k.parse(x.date);
      return el("li", {}, [el("span", { class: "k-rp-results-t" }, [el("b", { text: x.title }), el("span", { class: "k-rp-note", text: (x.kind ? x.kind.charAt(0).toUpperCase() + x.kind.slice(1) + " · " : "") + d.getDate() + " " + k.MONTHS[d.getMonth()] })]),
        k.mono(x.marks + " / " + x.max, "k-rp-results-m"), k.mono(x.pct + "%", "k-rp-results-p"), x.grade ? el("span", { class: "k-chip k-rp-grade", text: x.grade }) : el("span", {})]);
    }).concat((r.pending || []).map(function (u) {
      return el("li", { "data-state": "pending" }, [el("span", { class: "k-rp-results-t" }, [el("b", { text: u.title }), el("span", { class: "k-rp-note", text: "still to sit" })]),
        el("span", { class: "k-rp-pending", text: u.date ? "Sitting · " + K().dm(u.date) : "Sitting" })]);
    })))]);
  }
  function weakStrong(rep) {
    var k = K(), f = rep.facts;
    if (!f.weakest && !f.strongest) return null;
    function list(rows, tone) {
      return el("ol", { class: "k-rp-ws" }, rows.map(function (t) {
        return el("li", {}, [el("button", { type: "button", class: "k-rp-tlink", "data-ui": "reports.topic", title: t.title, onclick: function () { k.openTopic(t.key); } },
          [k.dot(k.SUBJ_HUE[t.sid]), k.mono(t.ref, "k-rp-ref"), el("span", { class: "k-rp-tlink-t", text: t.title })]),
          el("span", { class: "k-rp-bar", "aria-hidden": "true", style: "--w: " + t.recall + "%; --c: " + k.SUBJ_HUE[t.sid] }),
          k.mono(t.recall + "%", "k-rp-ws-v"), el("span", { class: "sr-only", text: tone })]);
      }));
    }
    return k.card("Weakest and strongest", {}, [
      el("p", { class: "k-rp-card-sub", text: "By recall over the " + rep.period + ", topics with 20+ reviews" }),
      f.weakest ? el("h3", { class: "k-rp-subhead", text: "Weakest" }) : null, f.weakest ? list(f.weakest, "weakest") : null,
      f.strongest ? el("h3", { class: "k-rp-subhead", text: "Strongest" }) : null, f.strongest ? list(f.strongest, "strongest") : null
    ].filter(Boolean));
  }
  function focusFacts(fo) {
    var rows = [];
    if (fo.peakHour != null) rows.push({ k: "Strongest hour", v: (fo.peakHour < 10 ? "0" : "") + fo.peakHour + ":00 · " + fo.peakShare + "%" });
    if (fo.typical) rows.push({ k: "Typical block", v: fo.typical + " min · median" });
    rows.push({ k: "Longest", v: W.hm(fo.longest) });
    return rows;
  }
  /* 24d: heat · facts · lengths, across the page */
  function focusHabits(rep) {
    var k = K(), fo = rep.facts.focus;
    if (!fo.blocks) return null;
    return k.card("Focus habits", { go: rep.period === "week" ? function () { k.open(rep, "focus"); } : null, className: "k-rp-card--full",
      meta: W.plural(fo.blocks, "block") + " · " + W.hm(fo.mins) }, [
      el("div", { class: "k-rp-habits3" }, [
        fo.heat ? el("div", { class: "k-rp-habits3-heat" }, [el("p", { class: "k-rp-card-sub", text: "When you focus · share of Focus time by hour" }), k.heat(rep.facts)]) : null,
        el("div", { class: "k-rp-habits3-facts" }, [k.kvRows(focusFacts(fo)), fo.persona ? k.personaChip(fo.persona) : null].filter(Boolean)),
        fo.lengths && fo.lengths.length >= 3 ? el("div", { class: "k-rp-habits3-hist" }, [el("p", { class: "k-rp-card-sub", text: "How long · blocks by minutes" }), k.lengths(fo.lengths)]) : null
      ].filter(Boolean))
    ]);
  }
  function studyCard(rep) {
    var k = K(), s = rep.facts.study;
    var top = s.topics.slice(0, 6);
    if (!top.length) return null;
    return k.card("Study", { go: function () { k.open(rep, "study"); } }, [
      el("h3", { class: "k-rp-subhead", text: "Top topics" }),
      k.topicRows(top),
      s.flow ? el("h3", { class: "k-rp-subhead", text: "What you studied next" }) : null,
      s.flow ? k.flowList(s.flow.map(function (x) { var L = { compsci: "CS", maths: "Maths", it: "IT", cards: "Flashcards", quiz: "Quiz" };
        return { from: L[x.from] || x.from, fromHue: k.SUBJ_HUE[x.from] || "var(--teal)", to: L[x.to] || x.to, toHue: k.SUBJ_HUE[x.to] || "var(--teal)", n: x.n + "×" }; })) : null
    ].filter(Boolean));
  }
  function rolledNote(f, what) {
    return f.rolledUp ? el("p", { class: "k-rp-note k-rp-rolled", text: "Totals are rolled up from the saved " + what + ": the session history no longer reaches back to the start." }) : null;
  }

  /* ---------------- the month (24c) ---------------- */
  function monthTiles(rep) {
    var k = K(), f = rep.facts, s = f.study, fo = f.focus, prev = f.prev;
    var one = s.days <= 1;
    var bd = s.busiest ? k.parse(s.busiest.date) : null;
    return k.tiles([
      k.tile("Studied", W.hm(s.mins), s.sessions ? W.plural(s.sessions, "session") : null, prev ? cmp(s.mins, prev.mins, rep, "mins") : null),
      k.tile("Study days", s.days, s.of - s.days ? W.plural(s.of - s.days, "rest day") : null, prev ? cmp(s.days, prev.days, rep) : null, "/ " + s.of),
      !one && bd ? k.tile("Busiest day", k.DOW[(bd.getDay() + 6) % 7] + " " + bd.getDate(), W.hm(s.busiest.mins) + " studied",
        prev && prev.busiest ? cmp(s.busiest.mins, prev.busiest, rep, "mins") : null) : null,
      !one && fo.blocks && fo.peakHour != null ? k.tile("Peak hour", (fo.peakHour < 10 ? "0" : "") + fo.peakHour + ":00", fo.peakShare + "% of Focus time",
        prev && prev.peakHour != null ? (prev.peakHour === fo.peakHour ? { dir: "same", text: "same as " + prevName(rep) } : null) : null) : null,
      s.recall != null ? k.tile("Recall", s.recall + "%", W.plural(s.reviews, "review"), prev && prev.recall != null ? cmp(s.recall, prev.recall, rep, "pct") : null) : null,
      fo.blocks ? k.tile("Focus", fo.blocks, "longest " + fo.longest + " min", prev ? cmp(fo.blocks, prev.blocks, rep) : null, "blocks") : null,
      f.gov.xp ? k.tile("Earned", "+" + W.num(f.gov.xp), "XP" + (f.gov.gold ? " · +" + W.num(f.gov.gold) + " ◆" : "")) : null,
      f.gov.rest && one ? k.tile("Rest streak", f.gov.rest, null, null, "days") : null
    ]);
  }
  function monthPage(holder, rep) {
    var k = K();
    k.reportTop(holder, rep);
    holder.appendChild(monthTiles(rep));
    holder.appendChild(activityCard(rep, "Activity · by day"));
    holder.appendChild(flow([balance(rep), masteryCard(rep), studyCard(rep), collectionCard(rep), kurenaiCard(rep), planGovCard(rep)]));
  }

  /* ---------------- the term (24d) ---------------- */
  function longestGap(s) {
    /* the longest run of days without study BETWEEN two study days */
    var on = [];
    s.dayMins.forEach(function (m, i) { if (m > 0) on.push(i); });
    var gap = 0;
    for (var i = 1; i < on.length; i++) gap = Math.max(gap, on[i] - on[i - 1] - 1);
    return gap;
  }
  function termPage(holder, rep) {
    var k = K(), f = rep.facts, s = f.study, fo = f.focus;
    var weeks = Math.round((k.parse(rep.end) - k.parse(rep.start)) / (7 * 864e5)) + 1;
    k.reportTop(holder, rep);
    var gap = longestGap(s);
    holder.appendChild(k.tiles([
      k.tile("Studied", W.hm(s.mins), (s.sessions ? W.plural(s.sessions, "session") + " · " : "") + W.plural(weeks, "week")),
      k.tile("Study days", s.days, gap ? "longest gap " + W.plural(gap, "day") : null, null, "/ " + s.of),
      s.recall != null ? k.tile("Recall", s.recall + "%", W.plural(s.reviews, "review")) : null,
      s.touched ? k.tile("Topics", s.touched, "touched" + (s.toGreen ? " · " + s.toGreen + " to Green" : "")) : null,
      fo.blocks ? k.tile("Focus", fo.blocks, "longest " + W.hm(fo.longest), null, "blocks") : null,
      f.gov.xp ? k.tile("Earned", "+" + W.num(f.gov.xp), "XP" + (f.gov.gold ? " · +" + W.num(f.gov.gold) + " ◆" : "")) : null
    ]));
    var rolled = rolledNote(f, "weeks");
    if (rolled) holder.appendChild(rolled);
    var vs = vsClassCard(rep);
    if (vs) holder.appendChild(vs);
    holder.appendChild(flow([resultsCard(rep), weakStrong(rep)]));
    var fh = focusHabits(rep);
    if (fh) holder.appendChild(fh);
    holder.appendChild(activityCard(rep, "Week by week"));
    holder.appendChild(flow([balance(rep), masteryCard(rep), studyCard(rep), collectionCard(rep), kurenaiCard(rep), planGovCard(rep)]));
  }

  /* ---------------- the year (24e, 24j) ---------------- */
  var CHAPTERS = [
    ["study", "Study", "Study, month by month", "Each column is a month of the academic year. Study hours stack by subject."],
    ["results", "Results", "Results", "Every graded paper and the units still to sit."],
    ["focus", "Focus", "Focus", "When you focus, for how long, and your style across the year."],
    ["plan", "The plan", "The plan", "Rows ticked and carried, and where you stood against class."],
    ["collection", "Collection", "Collection", "What you watched, read and played."],
    ["records", "Records", "Records", "Each with its date, so the record can be found."],
    ["milestones", "Milestones", "Milestones", "Dated firsts across the year."]
  ];
  /* the month-by-month strip (24e): a column a month, hours stacked by
     subject in the head row, then recall, study days, results, completed */
  function yearTable(f) {
    var k = K(), cols = f.strip || [];
    var keys = k.SUBJECTS.filter(function (x) { return f.study.bySubject[x]; });
    var max = Math.max.apply(null, cols.map(function (c) { return c.f ? c.f.mins : 0; }).concat([1]));
    var busiest = cols.reduce(function (b, c, i) { return c.f && (b < 0 || c.f.mins > cols[b].f.mins) ? i : b; }, -1);
    var rows = [
      ["Recall", function (c) { return c.f && c.f.recall != null ? c.f.recall + "%" : ""; }],
      ["Study days", function (c) { return c.f && c.f.days ? String(c.f.days) : ""; }],
      ["Results", function (c) { return c.f && c.f.results ? String(c.f.results) : ""; }],
      ["Completed", function (c) { return c.f && c.f.completed ? String(c.f.completed) : ""; }]
    ].filter(function (r) { return cols.some(function (c) { return r[1](c); }); });
    var wrap = el("div", { class: "k-rp-tablewrap" }, [el("table", { class: "k-rp-table k-rp-year-table", "data-ui": "reports.year-table" }, [
      el("thead", {}, [el("tr", {}, [el("th", { scope: "col", class: "sr-only", text: "Row" })].concat(cols.map(function (c, i) { return el("th", { scope: "col", "data-state": i === busiest ? "hi" : null, text: c.label }); })))]),
      el("tbody", {}, [el("tr", { class: "k-rp-year-bars" }, [el("th", { scope: "row", text: "Study hours" })].concat(cols.map(function (c) {
        var bs = c.f ? c.f.bySubject || {} : {};
        return el("td", {}, c.f && c.f.mins ? [el("span", { class: "k-rp-ycol" }, [
          el("span", { class: "k-mono k-rp-ycol-v", text: String(Math.round(c.f.mins / 60)) }),
          el("span", { class: "k-rp-ycol-bar", style: "--hn: " + (c.f.mins / max).toFixed(3) }, keys.filter(function (x) { return bs[x]; }).map(function (x) {
            return el("span", { style: "--c: " + k.SUBJ_HUE[x] + "; --f: " + (bs[x] / c.f.mins).toFixed(3) });
          }))])] : []);
      })))].concat(rows.map(function (r) {
        return el("tr", {}, [el("th", { scope: "row", text: r[0] })].concat(cols.map(function (c) { return el("td", { class: "k-mono", text: r[1](c) }); })));
      })))
    ])]);
    return KOS.ui.scroller(wrap, { label: "Month by month", className: "k-rp-tablescroll", tabWhenScrolls: true, prevLabel: "Scroll the table left", nextLabel: "Scroll the table right" });
  }
  function monthCalls(f) {
    var have = (f.strip || []).filter(function (c) { return c.f && c.f.mins; });
    if (have.length < 2) return null;
    var busy = have.slice().sort(function (a, b) { return b.f.mins - a.f.mins; })[0], quiet = have.slice().sort(function (a, b) { return a.f.mins - b.f.mins; })[0];
    return el("div", { class: "k-rp-calls" }, [
      el("div", { class: "k-rp-call" }, [el("span", { class: "k-kicker", text: "Busiest month" }), el("b", { text: busy.label + " · " + W.hm(busy.f.mins) }), el("span", { class: "k-rp-note", text: W.plural(busy.f.days, "study day") })]),
      el("div", { class: "k-rp-call" }, [el("span", { class: "k-kicker", text: "Quietest month" }), el("b", { text: quiet.label + " · " + W.hm(quiet.f.mins) }), el("span", { class: "k-rp-note", text: W.plural(quiet.f.days, "study day") })])
    ]);
  }
  function recordsBlock(rep) {
    var k = K(), r = rep.facts.records, res = rep.facts.results;
    if (!r && !res) return el("p", { class: "k-rp-note", text: "No records yet." });
    var tiles = [];
    function d(iso) { var x = k.parse(iso); return x.getDate() + " " + k.MONTHS[x.getMonth()]; }
    if (r && r.streak) tiles.push(["Longest streak", W.plural(r.streak.days, "day"), d(r.streak.start) + " – " + d(r.streak.end)]);
    if (r && r.longest) tiles.push(["Longest Focus", W.hm(r.longest.mins), (function () { var x = new Date(r.longest.ts); return k.DOW[(x.getDay() + 6) % 7] + " " + x.getDate() + " " + k.MONTHS[x.getMonth()] + (r.longest.label ? " · " + r.longest.label : ""); })()]);
    if (r && r.recallWeek) tiles.push(["Best recall week", r.recallWeek.recall + "%", "w/c " + d(r.recallWeek.start) + " · " + W.num(r.recallWeek.reviews) + " reviews"]);
    if (r && r.day) tiles.push(["Most in a day", W.hm(r.day.mins), d(r.day.date)]);
    var marks = res ? res.list.slice().sort(function (a, b) { return (b.pct || 0) - (a.pct || 0); }).slice(0, 3) : [];
    return [
      tiles.length ? k.tiles(tiles.map(function (t) { return k.tile(t[0], t[1], t[2]); })) : null,
      marks.length ? resultsCard({ facts: { results: { list: marks } } }, "Highest marks") : null
    ].filter(Boolean);
  }
  function milestonesBlock(rep) {
    var k = K(), m = rep.facts.milestones;
    if (!m) return el("p", { class: "k-rp-note", text: "No milestones the history can date yet." });
    return k.card("Milestones · " + m.length, {}, [el("ol", { class: "k-rp-miles" }, m.map(function (x) {
      var d = k.parse(x.date);
      return el("li", {}, [k.mono(d.getDate() + " " + k.MONTHS[d.getMonth()], "k-rp-miles-d"), el("b", { text: x.what }), el("span", { class: "k-rp-note", text: x.area })]);
    }))]);
  }
  function chapterBody(rep, id) {
    var k = K(), f = rep.facts;
    if (id === "study") {
      var keys = k.SUBJECTS.filter(function (x) { return f.study.bySubject[x]; });
      return [k.card("Month by month", { className: "k-rp-card--full", right: k.legend(keys.map(function (x) { return { hue: k.SUBJ_HUE[x], label: W.SUBJECT_SHORT[x] + " · " + W.hm(f.study.bySubject[x]) }; })) },
        [(f.strip || []).some(function (c) { return c.f; }) ? yearTable(f) : el("p", { class: "k-rp-note", text: "The months of this year have no saved reports to draw." }), monthCalls(f)].filter(Boolean)),
        flow([balance(rep), masteryCard(rep), studyCard(rep)])].filter(Boolean);
    }
    if (id === "results") return [f.results ? flow([resultsCard(rep), weakStrong(rep)]) : el("p", { class: "k-rp-note", text: "No graded results this year." })];
    if (id === "focus") return [focusHabits(rep) || el("p", { class: "k-rp-note", text: "No Focus blocks this year." }), f.studyPersona ? k.personaCard("Your study style this year", f.studyPersona, "var(--teal)") : null].filter(Boolean);
    if (id === "plan") {
      var parts = [vsClassCard(rep), flow([planGovCard(rep), kurenaiCard(rep)])].filter(Boolean);
      return parts.length ? parts : [el("p", { class: "k-rp-note", text: "No plan rows this year." })];
    }
    if (id === "collection") {
      if (!f.collection) return [el("p", { class: "k-rp-note", text: "Nothing moved in the Collection this year." })];
      return [flow([collectionCard(rep), genreCard(rep)])];
    }
    if (id === "records") return [].concat(recordsBlock(rep));
    return [milestonesBlock(rep)];
  }
  /* scroll the page's own scroller, never the shell: scrollIntoView also
     scrolled the app frame and hid the top bar (the year's contents) */
  function scrollTo(target, gap) {
    var sc = target.parentElement;
    while (sc && sc !== document.body && !/(auto|scroll)/.test(getComputedStyle(sc).overflowY)) sc = sc.parentElement;
    if (!sc || sc === document.body) sc = document.scrollingElement;
    var y = target.getBoundingClientRect().top - (sc === document.scrollingElement ? 0 : sc.getBoundingClientRect().top) + sc.scrollTop - (gap == null ? 16 : gap);
    if (sc.scrollTo) sc.scrollTo({ top: Math.max(0, y), behavior: "smooth" }); else sc.scrollTop = Math.max(0, y);
  }
  /* the year's Genre DNA beside its Collection card, the style on top */
  function genreCard(rep) {
    var k = K(), c = rep.facts.collection, mp = rep.facts.mediaPersona;
    if (!c || (!c.genres.length && !mp)) return null;
    return k.card("Genre DNA", { go: function () { k.open(rep, "collection"); } }, [
      mp ? k.personaChip({ kanji: "", name: mp.name, fact: mp.fact }) : null,
      c.genres.length ? k.genreBars(c) : null,
      c.tags && c.tags.length ? el("h3", { class: "k-rp-subhead", text: "Tags and themes" }) : null,
      c.tags && c.tags.length ? el("ul", { class: "k-rp-tags" }, c.tags.slice(0, 8).map(function (t, i) {
        return el("li", { class: "k-rp-tag", "data-tone": i < 3 ? "lead" : null }, [el("span", { text: t.name }), k.mono(String(t.n))]);
      })) : null
    ].filter(Boolean));
  }
  function yearPage(holder, rep) {
    var k = K(), f = rep.facts, s = f.study;
    k.reportTop(holder, rep, { big: f.label || k.weekOf(rep) });
    holder.appendChild(k.tiles([
      k.tile("Studied", W.hm(s.mins), s.sessions ? W.plural(s.sessions, "session") : null),
      k.tile("Study days", s.days, s.of - s.days ? W.plural(s.of - s.days, "rest day") : null, null, "/ " + s.of),
      s.recall != null ? k.tile("Recall", s.recall + "%", W.plural(s.reviews, "review")) : null,
      f.results && f.results.list.length ? k.tile("Graded results", f.results.list.length, f.results.best ? "best: " + f.results.best.title + " " + f.results.best.pct + "%" : null) : null,
      f.collection && f.collection.status && f.collection.status.finished ? k.tile("Collection", f.collection.status.finished, "titles completed") : null,
      f.gov.level ? k.tile("Level", (f.gov.levelFrom ? f.gov.levelFrom + " → " : "") + f.gov.level, f.gov.xp ? "+" + W.num(f.gov.xp) + " XP" : null) : null
    ]));
    var rolled = rolledNote(f, "months");
    if (rolled) holder.appendChild(rolled);
    /* the contents, the sticky chapter chip, then seven chapters */
    var sections = [];
    var contents = el("nav", { class: "k-rp-contents", "aria-label": "In this report", id: "rp-contents" }, [el("span", { class: "k-rp-contents-l", text: "In this report" })].concat(CHAPTERS.map(function (c, i) {
      return el("button", { type: "button", class: "k-rp-contents-chip", "data-ui": "reports.chapter-link", onclick: function () { go(i); } },
        [el("span", { class: "k-rp-contents-k", lang: "ja", "aria-hidden": "true", text: KANJI[i] }), el("span", { text: c[1] })]);
    })));
    holder.appendChild(contents);
    var chipLabel = el("span", {});
    var chip = el("div", { class: "k-rp-chapterbar", "data-ui": "reports.chapter-bar", hidden: "" }, [
      el("span", { class: "k-rp-crumb-mini", text: "Reports › Yearly › " + (f.label || "") }),
      el("button", { type: "button", class: "k-rp-chapter-chip", "data-ui": "reports.chapter-chip", "aria-haspopup": "true", onclick: function () { chooser(); } }, [chipLabel, el("span", { class: "k-rp-chev", "aria-hidden": "true" }, [KOS.ui.icon("chev-right")])])
    ]);
    holder.appendChild(chip);
    function go(i) {
      var sec = sections[i];
      if (!sec) return;
      scrollTo(sec, 64);   // clear of the sticky chapter bar
      var h = sec.querySelector("h2");
      if (h) { h.setAttribute("tabindex", "-1"); try { h.focus({ preventScroll: true }); } catch (e) { h.focus(); } }
    }
    function chooser() {
      var overlay = el("div", { class: "k-dialog-overlay" });
      overlay.appendChild(el("div", { class: "k-dialog", "data-ui": "ui.dialog reports.chapters" }, [
        el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Chapters" })]),
        el("ol", { class: "k-rp-chapters" }, CHAPTERS.map(function (c, i) {
          return el("li", {}, [el("button", { type: "button", class: "k-rp-contents-chip", onclick: function () { overlay.remove(); go(i); } },
            [el("span", { class: "k-rp-contents-k", lang: "ja", "aria-hidden": "true", text: KANJI[i] }), el("span", { text: c[1] })])]);
        })),
        el("div", { class: "k-dialog-foot" }, [el("button", { type: "button", class: "k-btn", "data-ui": "ui.dialog-close", text: "Close", onclick: function () { overlay.remove(); } })])
      ]));
      KOS.ui.openDialog(overlay, { label: "Chapters" });
    }
    CHAPTERS.forEach(function (c, i) {
      var sec = el("section", { class: "k-rp-chapter", "data-ui": "reports.chapter", "data-chapter": c[0], "aria-labelledby": "rp-ch-" + c[0] }, [
        el("div", { class: "k-rp-chapter-head" }, [
          el("span", { class: "k-rp-chapter-k", lang: "ja", "aria-hidden": "true", text: KANJI[i] }),
          el("div", { class: "k-rp-chapter-tt" }, [el("span", { class: "k-kicker", text: "Chapter " + (i + 1) }), el("h2", { class: "k-rp-chapter-t", id: "rp-ch-" + c[0], text: c[2] })]),
          el("p", { class: "k-rp-chapter-d", text: c[3] })
        ])
      ].concat(chapterBody(rep, c[0])).concat([
        el("div", { class: "k-rp-chapter-foot" }, [
          el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "reports.chapter-up", text: "↑ Contents", onclick: function () { scrollTo(contents); } }),
          i < CHAPTERS.length - 1 ? el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "reports.chapter-next", text: "Next · " + KANJI[i + 1] + " " + CHAPTERS[i + 1][1] + " ↓", onclick: function () { go(i + 1); } }) : null
        ].filter(Boolean))
      ]));
      sections.push(sec);
      holder.appendChild(sec);
    });
    /* the sticky chip: shown once the contents have scrolled away, naming
       the chapter in view (24j) */
    if (window.IntersectionObserver) {
      var seen = {};
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { seen[e.target === contents ? "contents" : e.target.getAttribute("data-chapter")] = e.isIntersecting; });
        if (!holder.isConnected) { io.disconnect(); return; }
        if (seen.contents) { chip.setAttribute("hidden", ""); return; }
        var cur = -1;
        CHAPTERS.forEach(function (c, i) { if (seen[c[0]] && cur < 0) cur = i; });
        if (cur < 0) return;
        chip.removeAttribute("hidden");
        chipLabel.textContent = KANJI[cur] + " " + CHAPTERS[cur][1] + " · " + (cur + 1) + " of 7";
      }, { rootMargin: "-20% 0px -60% 0px" });
      io.observe(contents);
      sections.forEach(function (sec) { io.observe(sec); });
    }
  }

  function page(holder, rep, reps) {
    if (rep.period === "month") monthPage(holder, rep, reps);
    else if (rep.period === "term") termPage(holder, rep, reps);
    else yearPage(holder, rep, reps);
  }
  KOS.reportsLong = { page: page, stripChart: stripChart, monthChart: monthChart, CHAPTERS: CHAPTERS };
})();
