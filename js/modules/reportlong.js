/* Kurenai OS — modules/reportlong.js
   Reports (roadmap 5.1, phase 6): the month (24c), the term (24d) and the
   year (24e, 24j) — each a saved report drawn like the week, with the
   sections only a longer period can support.

     month  tiles against the month before; the days as a stacked chart
            with last month's daily average dashed across it; subject
            balance against last month's shares; mastery by unit (start
            thin, end thick); the Collection's completions and score
            spread; Kurenai; the plan, tasks and Governor.
     term   adds the plan against class (a cell a week per subject, from
            the braid), results with grade chips and the units still to
            sit, weakest and strongest topics (20+ reviews), Focus habits,
            the weeks of the term.
     year   a long read: the opening (the year in mono, the words, six
            facts, the contents), then seven chapters — 一 Study, 二
            Results, 三 Focus, 四 The plan, 五 Collection, 六 Records, 七
            Milestones — each ending ↑ Contents / Next ↓; while scrolled a
            sticky chip names the chapter and opens a list of all seven.

   Everything here READS the saved facts (invariant 102a); the README's
   rules were applied when they were built (one study day: no busiest
   day, peak hour, balance or mastery — 24g).                            */
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
  function hrs(m) { return W.hm(m); }

  /* ---------------- the shared top: crumbs, header, hero ---------------- */
  function top(holder, rep, opts) {
    var k = K(), stories = KOS.reportStory ? KOS.reportStory.slides(rep) : [];
    holder.appendChild(k.crumbs([{ label: "Reports", go: function () { KOS.show("reports", { period: rep.period }); } }, { label: k.weekOf(rep) }]));
    /* the year's opening carries the year in mono, so its title is the span */
    var title = rep.period === "year" ? k.MONTH_LONG[k.parse(rep.start).getMonth()] + " " + k.parse(rep.start).getFullYear() + " – " + k.MONTH_LONG[k.parse(rep.end).getMonth()] + " " + k.parse(rep.end).getFullYear()
      : k.weekOf(rep) + (rep.period === "term" ? " · " + k.longRange(rep.start, rep.end) : "");
    holder.appendChild(KOS.ui.pageHeader({ kicker: k.PERIOD_KICKER[rep.period], title: title,
      actions: k.shareActions(rep) }));
    var hero = el("section", { class: "k-rp-hero", "data-ui": "reports.hero", "aria-label": "The " + rep.period + " in words" }, [
      opts && opts.year ? el("div", { class: "k-rp-year", "aria-hidden": "true", text: rep.facts.label || k.weekOf(rep) }) : null,
      el("div", { class: "k-kicker", text: stories.length ? "Your " + rep.period + " as a story · " + W.plural(stories.length, "story", "stories") : "Your " + rep.period + " in review" }),
      k.wordsBlock(rep, { hero: true }),
      stories.length ? el("div", { class: "k-rp-play" }, [el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "reports.play",
        text: "▶ Play your " + rep.period, onclick: function () { KOS.reportStory.open(rep, 0); } })]) : null
    ].filter(Boolean));
    holder.appendChild(hero);
  }

  /* ---------------- charts ---------------- */
  /* the days of a month, stacked by subject, with last month's daily
     average dashed across and labelled at its end (24c) */
  function monthChart(rep) {
    var k = K(), f = rep.facts, s = f.study;
    if (s.days <= 1) return oneDay(rep);
    var keys = k.SUBJECTS.filter(function (x) { return s.bySubject[x]; });
    var cols = s.dayMins.map(function (m, i) {
      var d = k.parse(k.range ? f.start : f.start); d.setDate(d.getDate() + i);
      return { label: (i % 2 === 0 ? String(d.getDate()) : ""), parts: (s.daySubj || [])[i] || {} };
    });
    var chart = k.stacked(cols, keys, k.SUBJ_HUE, { unit: "mins", width: 640, height: 210 });
    chart.setAttribute("role", "img");
    chart.setAttribute("aria-label", "Study by day across the " + rep.period + ": " + W.hm(s.mins) + " on " + s.days + " days");
    var avg = f.prev && f.prev.dayAvg;
    if (avg) addAverage(chart, avg, Math.max.apply(null, s.dayMins.concat([1])), prevName(rep) + " · " + W.hm(avg) + " / day");
    return el("div", { class: "k-rp-chartwrap" }, [chart, k.legend(keys.map(function (x) { return { hue: k.SUBJ_HUE[x], label: W.SUBJECT_SHORT[x] }; }))]);
  }
  /* the dashed line of the earlier period's daily average */
  function addAverage(svg, avgMins, maxMins, label) {
    var vb = svg.getAttribute("viewBox").split(" ").map(Number), Wd = vb[2], H = vb[3];
    var padT = 10, padB = 26, padL = 34, padR = 8, plotH = H - padT - padB;
    var maxU = Math.max(1, Math.ceil(maxMins / 60));
    var y = H - padB - plotH * (avgMins / 60) / maxU;
    if (y < padT) return;
    svg.appendChild(KOS.charts.svgNode("line", { class: "k-rp-avg-line", x1: padL, y1: y, x2: Wd - padR, y2: y, "stroke-width": "1.5", "stroke-dasharray": "5 4" }));
    svg.appendChild(KOS.charts.svgNode("text", { class: "k-rp-avg-label", x: Wd - padR, y: y - 5, "text-anchor": "end", "font-size": "11", text: label }));
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
      el("h3", { class: "k-rp-subhead", text: "One day isn't a pattern" }),
      el("p", { class: "k-rp-note", text: "With a single study day there's no busiest day, peak hour or subject balance to show, so those are left out. The day itself is marked." }),
      cells, note ? el("p", { class: "k-rp-note", text: note }) : null
    ].filter(Boolean));
  }
  /* a term's weeks or a year's months, stacked by subject */
  function stripChart(f) {
    var k = K(), cols = f.strip || [];
    if (!cols.filter(function (c) { return c.f; }).length) return el("p", { class: "k-rp-note", text: "The " + (f.period === "year" ? "months" : "weeks") + " of this " + f.period + " have no saved reports to draw." });
    var keys = k.SUBJECTS.filter(function (x) { return f.study.bySubject[x]; });
    var chart = k.stacked(cols.map(function (c) { return { label: c.label, parts: c.f ? c.f.bySubject || {} : {} }; }), keys, k.SUBJ_HUE, { unit: "mins", width: 640, height: 200 });
    chart.setAttribute("role", "img");
    chart.setAttribute("aria-label", "Study by " + (f.period === "year" ? "month" : "week") + ": " + cols.map(function (c) { return c.label + " " + (c.f ? W.hm(c.f.mins) : "no report"); }).join(", "));
    return el("div", { class: "k-rp-chartwrap" }, [chart, k.legend(keys.map(function (x) { return { hue: k.SUBJ_HUE[x], label: W.SUBJECT_SHORT[x] }; }))]);
  }

  /* ---------------- the sections ---------------- */
  function balance(rep) {
    var k = K(), f = rep.facts, s = f.study;
    if (s.days <= 1 || !s.mins) return null;
    var prev = f.prev && f.prev.bySubject, prevTot = prev ? Object.keys(prev).reduce(function (a, x) { return a + prev[x]; }, 0) : 0;
    var rows = k.SUBJECTS.filter(function (x) { return s.bySubject[x]; }).map(function (x) {
      var share = Math.round(100 * s.bySubject[x] / s.mins);
      var was = prevTot ? Math.round(100 * (prev[x] || 0) / prevTot) : null;
      var d = was == null ? null : W.compare(share, was, prevName(rep), "pct");
      return el("li", { class: "k-rp-bal-row" }, [k.dot(k.SUBJ_HUE[x]), el("span", { text: W.SUBJECT[x] }), k.mono(W.hm(s.bySubject[x])),
        k.mono(share + "%", "k-rp-bal-share"), d ? el("span", { class: "k-rp-cmp", "data-tone": d.dir === "up" ? "up" : null, text: d.text.replace(/ on .*$/, "") }) : el("span", {}),
        el("span", { class: "k-rp-bar", "aria-hidden": "true", style: "--w: " + share + "%; --c: " + k.SUBJ_HUE[x] })]);
    });
    return k.card("Subject balance", { meta: "share of study time" + (prevTot ? ", against " + prevName(rep) : "") }, [el("ul", { class: "k-rp-bal" }, rows)]);
  }
  function mix(m) {
    var t = (m.r + m.a + m.g) || 1;
    return ["r", "a", "g"].filter(function (b) { return m[b]; }).map(function (b) {
      return el("span", { class: "k-rp-mix-seg", "data-band": b, style: "--w: " + (100 * m[b] / t).toFixed(1) + "%" });
    });
  }
  function masteryCard(rep) {
    var k = K(), f = rep.facts;
    if (!f.mastery || f.study.days <= 1) return null;
    return k.card("Mastery by unit", { meta: "status at the start (thin) and the end (thick)" }, [
      el("ul", { class: "k-rp-mastery" }, f.mastery.map(function (u) {
        return el("li", {}, [k.mono(u.ref, "k-rp-ref"), el("span", { class: "k-rp-mastery-t", text: u.title }),
          el("span", { class: "k-rp-mix k-rp-mix--thin", role: "img", "aria-label": "Start: " + u.start.r + " red, " + u.start.a + " amber, " + u.start.g + " green" }, mix(u.start)),
          el("span", { class: "k-rp-mix", role: "img", "aria-label": "End: " + u.end.r + " red, " + u.end.a + " amber, " + u.end.g + " green" }, mix(u.end)),
          u.green ? el("span", { class: "k-rp-mastery-g", text: (u.green > 0 ? "+" : "") + u.green + " Green" }) : el("span", {})]);
      })),
      el("ul", { class: "k-rp-legend" }, [["r", "Red"], ["a", "Amber"], ["g", "Green"]].map(function (b) {
        return el("li", {}, [el("span", { class: "k-rp-mix-key", "data-band": b[0], "aria-hidden": "true" }), el("span", { text: b[1] })]);
      }))
    ]);
  }
  function collectionCard(rep) {
    var k = K(), c = rep.facts.collection;
    if (!c) return null;
    var dots = el("div", { class: "k-rp-dots", role: "img", "aria-label": "Scores given: " + c.titles.filter(function (t) { return t.score; }).map(function (t) { return t.score; }).join(", ") }, [
      el("span", { class: "k-rp-dots-line", "aria-hidden": "true" })
    ].concat(c.titles.filter(function (t) { return t.score; }).slice(0, 80).map(function (t, i) {
      return el("span", { class: "k-rp-dots-d", title: t.title + " · " + t.score, style: "--x: " + ((t.score - 1) / 9 * 100).toFixed(1) + "%; --c: " + k.MOD_HUE[t.module] + "; --y: " + (i % 4) });
    })).concat([el("span", { class: "k-rp-dots-axis", "aria-hidden": "true" }, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(function (n) { return el("span", { text: String(n) }); }))]));
    return k.card("Collection · " + W.plural(c.count, "title"), { go: function () { k.open(rep, "collection"); } }, [
      c.completed && c.completed.length ? el("h3", { class: "k-rp-subhead", text: "Completed · " + (c.status.finished || c.completed.length) }) : null,
      c.completed && c.completed.length ? el("ul", { class: "k-rp-done-titles" }, c.completed.slice(0, 5).map(function (t) {
        return el("li", {}, [k.cover(t, "k-rp-cover--tiny"), el("span", { class: "k-rp-done-t" }, [el("b", { text: t.title }), el("span", { class: "k-rp-note", text: W.MEDIUM[t.module] })]),
          t.score ? k.mono(String(t.score), "k-rp-score") : el("span", {})]);
      })) : null,
      c.scores ? el("h3", { class: "k-rp-subhead", text: "Scores given · " + c.scores.n + " · median " + c.scores.median }) : null,
      c.scores ? dots : null
    ].filter(Boolean));
  }
  function kurenaiCard(rep) {
    var k = K(), ku = rep.facts.kurenai, prev = rep.facts.prev;
    if (!ku) return null;
    var areas = Object.keys(ku.areas || {}).sort(function (a, b) { return ku.areas[b] - ku.areas[a]; });
    var c = ku.chats ? cmp(ku.chats, prev ? prev.chats : null, rep) : null;
    return k.card("Kurenai", {}, [
      ku.chats ? el("div", { class: "k-rp-big" }, [k.mono(String(ku.chats), "k-rp-big-n"), el("span", { text: ku.chats === 1 ? "conversation" : "conversations" }),
        c ? el("span", { class: "k-rp-cmp", "data-tone": c.dir === "up" || c.dir === "new" ? "up" : null, text: c.text }) : null].filter(Boolean)) : null,
      el("dl", { class: "k-rp-kv" }, [
        ku.scheduled ? el("dt", { text: "Scheduled messages" }) : null, ku.scheduled ? el("dd", { class: "k-mono", text: "sent " + ku.scheduled + " time" + (ku.scheduled === 1 ? "" : "s") }) : null,
        areas.length ? el("dt", { text: "Asked about" }) : null, areas.length ? el("dd", { class: "k-mono", text: areas.map(function (a) { return a.charAt(0).toUpperCase() + a.slice(1) + " " + ku.areas[a]; }).join(" · ") }) : null
      ].filter(Boolean))
    ].filter(Boolean));
  }
  function planGovCard(rep) {
    var k = K(), f = rep.facts, rows = [], prev = f.prev;
    if (f.plan) rows.push(["Plan rows ticked", f.plan.ticked + " / " + f.plan.planned + (f.plan.carried ? " · " + f.plan.carried + " carried" : "")]);
    if (f.tasks && f.tasks.reminders) { var c = cmp(f.tasks.reminders, prev ? prev.reminders : null, rep); rows.push(["Reminders done", f.tasks.reminders + (c && c.dir !== "same" ? " · " + c.text.replace(/ on .*$/, "") : "")]); }
    if (f.tasks && f.tasks.habits) rows.push(["Habits kept", f.tasks.habits.length + (f.tasks.habitDays ? " · on " + f.tasks.habitDays + " of " + f.study.of + " days" : "")]);
    if (f.gov.xp) rows.push(["Earned", "+" + W.num(f.gov.xp) + " XP" + (f.gov.gold ? " · +" + W.num(f.gov.gold) + " ◆" : "")]);
    if (f.gov.streak) rows.push(["Study streak", W.plural(f.gov.streak, "day")]);
    if (f.gov.level) rows.push(["Level", (f.gov.levelFrom ? f.gov.levelFrom + " → " : "") + f.gov.level]);
    if (!rows.length) return null;
    return k.card("Plan, tasks and Governor", {}, [el("dl", { class: "k-rp-kv" }, rows.reduce(function (a, r) { return a.concat([el("dt", { text: r[0] }), el("dd", { class: "k-mono", text: r[1] })]); }, []))]);
  }
  function vsClassCard(rep) {
    var k = K(), v = rep.facts.vsClass;
    if (!v) return null;
    var POS = { ahead: "Ahead", aligned: "Aligned", behind: "Behind" };
    return k.card("The plan against class", { meta: "a cell a week, from the braid" }, [
      el("ul", { class: "k-rp-vs" }, v.rows.map(function (r) {
        return el("li", { class: "k-rp-vs-row" }, [
          el("span", { class: "k-rp-vs-name" }, [k.dot(k.SUBJ_HUE[r.sid]), el("span", { text: W.SUBJECT[r.sid] })]),
          el("span", { class: "k-rp-vs-cells", role: "img", "aria-label": W.SUBJECT[r.sid] + ": " + r.cells.map(function (c, i) { return "week " + (i + 1) + " " + (c || "no class rows"); }).join(", "), style: "--n: " + r.cells.length },
            r.cells.map(function (c) { return el("span", { class: "k-rp-vs-cell", "data-state": c || "none" }); })),
          el("span", { class: "k-chip k-rp-vs-chip", "data-tone": r.end.pos === "behind" ? "alarm" : r.end.pos === "ahead" ? "teal" : null,
            text: POS[r.end.pos] + (r.end.n ? " · " + W.plural(r.end.n, "topic") : "") })
        ]);
      })),
      el("ul", { class: "k-rp-legend" }, [["ahead", "ahead of class that week"], ["aligned", "aligned"], ["behind", "behind"]].map(function (x) {
        return el("li", {}, [el("span", { class: "k-rp-vs-cell", "data-state": x[0], "aria-hidden": "true" }), el("span", { text: x[1] })]);
      }))
    ]);
  }
  function resultsCard(rep) {
    var k = K(), r = rep.facts.results;
    if (!r) return null;
    return k.card("Results", { go: null }, [el("ul", { class: "k-rp-results" }, r.list.map(function (x) {
      var d = k.parse(x.date);
      return el("li", {}, [el("span", { class: "k-rp-results-t" }, [el("b", { text: x.title }), el("span", { class: "k-rp-note", text: (x.kind ? x.kind.charAt(0).toUpperCase() + x.kind.slice(1) + " · " : "") + d.getDate() + " " + k.MONTHS[d.getMonth()] })]),
        k.mono(x.marks + " / " + x.max), k.mono(x.pct + "%"), x.grade ? el("span", { class: "k-chip k-rp-grade", text: x.grade }) : el("span", {})]);
    }).concat((r.pending || []).map(function (u) {
      return el("li", { "data-state": "pending" }, [el("span", { class: "k-rp-results-t" }, [el("b", { text: u.title }), el("span", { class: "k-rp-note", text: "still to sit" })]),
        el("span", {}), el("span", {}), u.date ? el("span", { class: "k-chip k-rp-pending", text: "Sitting · " + K().dm(u.date) }) : el("span", { class: "k-chip k-rp-pending", text: "Sitting" })]);
    })))]);
  }
  function weakStrong(rep) {
    var k = K(), f = rep.facts;
    if (!f.weakest && !f.strongest) return null;
    function list(rows, tone) {
      return el("ol", { class: "k-rp-ws" }, rows.map(function (t) {
        return el("li", {}, [el("button", { type: "button", class: "k-rp-tlink", "data-ui": "reports.topic", onclick: function () { k.openTopic(t.key); } },
          [k.dot(k.SUBJ_HUE[t.sid]), k.mono(t.ref, "k-rp-ref"), el("span", { text: t.title })]), k.mono(t.recall + "%", "k-rp-ws-v"), el("span", { class: "sr-only", text: tone })]);
      }));
    }
    return k.card("Weakest and strongest", { meta: "by recall, topics with 20+ reviews" }, [
      el("div", { class: "k-rp-ws-grid" }, [
        f.weakest ? el("div", {}, [el("h3", { class: "k-rp-subhead", text: "Weakest" }), list(f.weakest, "weakest")]) : null,
        f.strongest ? el("div", {}, [el("h3", { class: "k-rp-subhead", text: "Strongest" }), list(f.strongest, "strongest")]) : null
      ].filter(Boolean))
    ]);
  }
  function focusHabits(rep) {
    var k = K(), fo = rep.facts.focus;
    if (!fo.blocks) return null;
    var facts = [];
    var wkd = (fo.list || []);
    if (fo.peakHour != null) facts.push(["Peak hour", (fo.peakHour < 10 ? "0" : "") + fo.peakHour + ":00 · " + fo.peakShare + "% of Focus"]);
    facts.push(["Typical block", fo.typical + " min · median"]);
    facts.push(["Longest", W.hm(fo.longest)]);
    return k.card("Focus habits", { go: function () { k.open(rep, "focus"); } }, [
      el("div", { class: "k-rp-big" }, [k.mono(String(fo.blocks), "k-rp-big-n"), el("span", { text: "blocks · " + W.hm(fo.mins) })]),
      fo.heat ? k.heat(rep.facts) : null,
      el("dl", { class: "k-rp-kv" }, facts.reduce(function (a, r) { return a.concat([el("dt", { text: r[0] }), el("dd", { class: "k-mono", text: r[1] })]); }, [])),
      fo.lengths && fo.lengths.length >= 3 ? k.lengths(fo.lengths) : null,
      fo.persona ? k.personaChip(fo.persona) : null
    ].filter(Boolean));
  }
  function studyCard(rep) {
    var k = K(), s = rep.facts.study;
    var top = s.topics.slice(0, 6);
    return k.card("Study", { go: function () { k.open(rep, "study"); } }, [
      top.length ? el("h3", { class: "k-rp-subhead", text: "Top topics" }) : null,
      top.length ? el("ol", { class: "k-rp-topics" }, top.map(function (t, i) {
        var st = k.statusText(t);
        return el("li", {}, [el("button", { type: "button", class: "k-rp-topic", "data-ui": "reports.topic", onclick: function () { k.openTopic(t.key); } }, [
          k.mono(String(i + 1), "k-rp-rank"), k.dot(k.SUBJ_HUE[t.sid]), k.mono(t.ref, "k-rp-ref"), el("span", { class: "k-rp-topic-t", text: t.title }),
          t.mins ? k.mono(W.hm(t.mins), "k-rp-topic-m") : el("span", {}), t.reviews ? k.mono(t.reviews + "×", "k-rp-topic-r") : el("span", {}),
          st ? el("span", { class: "k-rp-topic-s", "data-tone": st.tone, text: st.text }) : el("span", {})])]);
      })) : el("p", { class: "k-rp-note", text: "No topics touched." }),
      s.flow ? el("h3", { class: "k-rp-subhead", text: "What you studied next" }) : null,
      s.flow ? k.flowList(s.flow.map(function (x) { var L = { compsci: "CS", maths: "Maths", it: "IT", cards: "Flashcards", quiz: "Quiz" };
        return { from: L[x.from] || x.from, fromHue: k.SUBJ_HUE[x.from] || "var(--teal)", to: L[x.to] || x.to, toHue: k.SUBJ_HUE[x.to] || "var(--teal)", n: x.n + "×" }; })) : null
    ].filter(Boolean));
  }

  /* ---------------- the month (24c) ---------------- */
  function monthTiles(rep) {
    var k = K(), f = rep.facts, s = f.study, fo = f.focus, prev = f.prev;
    var one = s.days <= 1;
    var bd = s.busiest ? k.parse(s.busiest.date) : null;
    return k.tiles([
      k.tile("Studied", W.hm(s.mins), s.sessions ? W.plural(s.sessions, "session") : null, prev ? cmp(s.mins, prev.mins, rep, "mins") : null),
      k.tile("Study days", s.days + " / " + s.of, s.of - s.days ? W.plural(s.of - s.days, "rest day") : null, prev ? cmp(s.days, prev.days, rep) : null),
      !one && bd ? k.tile("Busiest day", k.DOW[(bd.getDay() + 6) % 7] + " " + bd.getDate(), W.hm(s.busiest.mins) + " studied",
        prev && prev.busiest ? cmp(s.busiest.mins, prev.busiest, rep, "mins") : null) : null,
      !one && fo.blocks && fo.peakHour != null ? k.tile("Peak hour", (fo.peakHour < 10 ? "0" : "") + fo.peakHour + ":00", fo.peakShare + "% of Focus time",
        prev && prev.peakHour != null ? (prev.peakHour === fo.peakHour ? { dir: "same", text: "same as " + prevName(rep) } : null) : null) : null,
      s.recall != null ? k.tile("Recall", s.recall + "%", W.plural(s.reviews, "review"), prev && prev.recall != null ? cmp(s.recall, prev.recall, rep, "pct") : null) : null,
      fo.blocks ? k.tile("Focus", fo.blocks, "blocks · longest " + fo.longest + "m", prev ? cmp(fo.blocks, prev.blocks, rep) : null) : null,
      f.gov.xp ? k.tile("Earned", "+" + W.num(f.gov.xp), "XP" + (f.gov.gold ? " · +" + W.num(f.gov.gold) + " ◆" : "")) : null,
      f.gov.rest && s.days <= 1 ? k.tile("Rest streak", f.gov.rest, "days") : null
    ]);
  }
  function monthPage(holder, rep) {
    var k = K();
    top(holder, rep);
    holder.appendChild(monthTiles(rep));
    holder.appendChild(k.card("Activity · by day", { className: "k-rp-card--full" }, [monthChart(rep)]));
    holder.appendChild(el("div", { class: "k-rp-grid", "data-ui": "reports.grid" }, [
      balance(rep), masteryCard(rep), collectionCard(rep), studyCard(rep), kurenaiCard(rep), planGovCard(rep)
    ].filter(Boolean)));
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
    top(holder, rep);
    var gap = longestGap(s);
    holder.appendChild(k.tiles([
      k.tile("Studied", W.hm(s.mins), (s.sessions ? W.plural(s.sessions, "session") + " · " : "") + W.plural(weeks, "week")),
      k.tile("Study days", s.days + " / " + s.of, gap ? "longest gap " + W.plural(gap, "day") : null),
      s.recall != null ? k.tile("Recall", s.recall + "%", W.plural(s.reviews, "review")) : null,
      s.touched ? k.tile("Topics", s.touched, "touched" + (s.toGreen ? " · " + s.toGreen + " to Green" : "")) : null,
      fo.blocks ? k.tile("Focus", fo.blocks, "blocks · longest " + W.hm(fo.longest)) : null,
      f.gov.xp ? k.tile("Earned", "+" + W.num(f.gov.xp), "XP" + (f.gov.gold ? " · +" + W.num(f.gov.gold) + " ◆" : "")) : null
    ]));
    if (f.rolledUp) holder.appendChild(el("p", { class: "k-rp-note", text: "Totals are rolled up from the saved weeks: the session history no longer reaches back to the term's start." }));
    holder.appendChild(el("div", { class: "k-rp-grid k-rp-grid--two", "data-ui": "reports.grid" }, [
      vsClassCard(rep), resultsCard(rep),
      k.card("Week by week", { className: "k-rp-card--wide" }, [stripChart(f)]),
      weakStrong(rep), focusHabits(rep),
      balance(rep), masteryCard(rep), collectionCard(rep), kurenaiCard(rep), planGovCard(rep)
    ].filter(Boolean)));
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
  function yearTable(f) {
    var k = K(), cols = f.strip || [];
    var rows = [
      ["Study hours", function (c) { return c.f ? String(Math.round(c.f.mins / 60)) : ""; }],
      ["Recall", function (c) { return c.f && c.f.recall != null ? c.f.recall + "%" : ""; }],
      ["Study days", function (c) { return c.f && c.f.days ? String(c.f.days) : ""; }],
      ["Results", function (c) { return c.f && c.f.results ? String(c.f.results) : ""; }],
      ["Completed", function (c) { return c.f && c.f.completed ? String(c.f.completed) : ""; }]
    ];
    var wrap = el("div", { class: "k-rp-tablewrap" }, [el("table", { class: "k-rp-table k-rp-year-table", "data-ui": "reports.year-table" }, [
      el("thead", {}, [el("tr", {}, [el("th", { scope: "col", class: "sr-only", text: "Row" })].concat(cols.map(function (c) { return el("th", { scope: "col", text: c.label }); })))]),
      el("tbody", {}, rows.map(function (r) {
        return el("tr", {}, [el("th", { scope: "row", text: r[0] })].concat(cols.map(function (c) { return el("td", { class: "k-mono", text: r[1](c) }); })));
      }))
    ])]);
    return KOS.ui.scroller(wrap, { label: "Month by month", className: "k-rp-tablescroll", tabWhenScrolls: true, prevLabel: "Scroll the table left", nextLabel: "Scroll the table right" });
  }
  function monthCalls(f) {
    var k = K(), have = (f.strip || []).filter(function (c) { return c.f && c.f.mins; });
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
    return el("div", {}, [
      tiles.length ? el("div", { class: "k-rp-records" }, tiles.map(function (t) {
        return el("div", { class: "k-rp-record" }, [el("span", { class: "k-kicker", text: t[0] }), k.mono(t[1], "k-rp-record-v"), el("span", { class: "k-rp-note", text: t[2] })]);
      })) : null,
      marks.length ? el("h3", { class: "k-rp-subhead", text: "Highest marks" }) : null,
      marks.length ? el("ul", { class: "k-rp-results" }, marks.map(function (x) {
        return el("li", {}, [el("span", { class: "k-rp-results-t" }, [el("b", { text: x.title })]), k.mono(x.marks + " / " + x.max), k.mono(x.pct + "%"), x.grade ? el("span", { class: "k-chip k-rp-grade", text: x.grade }) : el("span", {})]);
      })) : null
    ].filter(Boolean));
  }
  function milestonesBlock(rep) {
    var k = K(), m = rep.facts.milestones;
    if (!m) return el("p", { class: "k-rp-note", text: "No milestones the history can date yet." });
    return el("ol", { class: "k-rp-miles" }, m.map(function (x) {
      var d = k.parse(x.date);
      return el("li", {}, [k.mono(d.getDate() + " " + k.MONTHS[d.getMonth()], "k-rp-miles-d"), el("b", { text: x.what }), el("span", { class: "k-rp-note", text: x.area })]);
    }));
  }
  function chapterBody(rep, id) {
    var k = K(), f = rep.facts, s = f.study;
    if (id === "study") return [stripChart(f), yearTable(f), monthCalls(f)].filter(Boolean);
    if (id === "results") return [f.results ? resultsCard(rep) : el("p", { class: "k-rp-note", text: "No graded results this year." })];
    if (id === "focus") return [focusHabits(rep) || el("p", { class: "k-rp-note", text: "No Focus blocks this year." }), f.studyPersona ? k.personaChip(f.studyPersona) : null].filter(Boolean);
    if (id === "plan") return [planGovCard(rep), vsClassCard(rep)].filter(Boolean).concat(f.plan || f.vsClass ? [] : [el("p", { class: "k-rp-note", text: "No plan rows this year." })]);
    if (id === "collection") {
      var c = f.collection;
      if (!c) return [el("p", { class: "k-rp-note", text: "Nothing moved in the Collection this year." })];
      return [collectionCard(rep), el("button", { type: "button", class: "k-btn", "data-ui": "reports.overview-link", text: "Open Year › Collection ›", onclick: function () { k.open(rep, "collection"); } })];
    }
    if (id === "records") return [recordsBlock(rep)];
    return [milestonesBlock(rep)];
  }
  function yearPage(holder, rep) {
    var k = K(), f = rep.facts, s = f.study;
    top(holder, rep, { year: true });
    holder.appendChild(k.tiles([
      k.tile("Studied", W.hm(s.mins), s.sessions ? W.plural(s.sessions, "session") : null),
      k.tile("Study days", s.days + " / " + s.of, s.of - s.days ? W.plural(s.of - s.days, "rest day") : null),
      s.recall != null ? k.tile("Recall", s.recall + "%", W.plural(s.reviews, "review")) : null,
      f.results && f.results.list.length ? k.tile("Graded results", f.results.list.length, f.results.best ? "best: " + f.results.best.title + " " + f.results.best.pct + "%" : null) : null,
      f.collection && f.collection.status && f.collection.status.finished ? k.tile("Collection", f.collection.status.finished, "titles completed") : null,
      f.gov.level ? k.tile("Level", (f.gov.levelFrom ? f.gov.levelFrom + " → " : "") + f.gov.level, f.gov.xp ? "+" + W.num(f.gov.xp) + " XP" : null) : null
    ]));
    if (f.rolledUp) holder.appendChild(el("p", { class: "k-rp-note", text: "Totals are rolled up from the saved months: the session history no longer reaches back to September." }));
    /* the contents, the sticky chapter chip, then seven chapters */
    var sections = [];
    var contents = el("nav", { class: "k-rp-contents", "aria-label": "In this report", id: "rp-contents" }, [el("span", { class: "k-kicker", text: "In this report" })].concat(CHAPTERS.map(function (c, i) {
      return el("button", { type: "button", class: "k-rp-contents-chip", "data-ui": "reports.chapter-link", onclick: function () { go(i); } },
        [el("span", { class: "k-rp-contents-k", lang: "ja", "aria-hidden": "true", text: KANJI[i] }), el("span", { text: c[1] })]);
    })));
    holder.appendChild(contents);
    var chipLabel = el("span", {});
    var chip = el("div", { class: "k-rp-chapterbar", "data-ui": "reports.chapter-bar", hidden: "" }, [
      el("span", { class: "k-rp-crumb-mini", text: "Reports › Yearly › " + (f.label || "") }),
      el("button", { type: "button", class: "k-rp-chapter-chip", "data-ui": "reports.chapter-chip", "aria-haspopup": "true", onclick: function () { chooser(); } }, [chipLabel, el("span", { "aria-hidden": "true", text: " ▾" })])
    ]);
    holder.appendChild(chip);
    function go(i) {
      var sec = sections[i];
      if (!sec) return;
      if (sec.scrollIntoView) sec.scrollIntoView({ block: "start", behavior: "smooth" });
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
          el("div", {}, [el("span", { class: "k-kicker", text: "Chapter " + (i + 1) }), el("h2", { class: "k-rp-chapter-t", id: "rp-ch-" + c[0], text: c[2] }), el("p", { class: "k-rp-note", text: c[3] })])
        ])
      ].concat(chapterBody(rep, c[0])).concat([
        el("div", { class: "k-rp-chapter-foot" }, [
          el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "reports.chapter-up", text: "↑ Contents", onclick: function () { contents.scrollIntoView && contents.scrollIntoView({ block: "start", behavior: "smooth" }); } }),
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
