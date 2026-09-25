/* Kurenai OS — modules/cardstats.js
   Flashcard statistics dashboard (FR-1.6): aggregate SM-2 data per subject
   or per topic, drawn with plain inline SVG — no charting library, matching
   how everything else in this app is built.

   Graphite (frame 9b): the scope sits in the page header beside the Review
   switcher; one strip of figures, then reviews per day beside the rating
   mix, the due forecast beside the ease distribution, and the per-topic
   breakdown. Colours are the theme's tokens. Invariant 76 holds: a chart
   needs at least three tracked cards and three reviews.                 */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var SHORT = { compsci: "CS", maths: "Maths", it: "IT" };
  var NAME = { compsci: "Computer Science", maths: "Mathematics", it: "IT" };
  var HUE = { compsci: "var(--cs)", maths: "var(--maths)", it: "var(--it)" };
  var SUBJECTS = ["compsci", "maths", "it"];

  var barChart = KOS.charts.barChart;

  /* ---------------- data aggregation ---------------- */
  function cardsInScope(sid, ref) {
    var cards = ref ? KOS.srs.cardsFor(sid, ref)
      : sid ? KOS.srs.allCards().filter(function (c) { return c.sid === sid; })
      : KOS.srs.allCards();
    cards.forEach(function (c) { c.meta = KOS.srs.peek(c.key); });
    return cards;
  }
  function sessionsInScope(sid, ref) {
    return KOS.sessions.all().filter(function (e) {
      if (e.type !== "flashcards" && e.type !== "due-review") return false;
      if (ref) return e.subject === sid && e.ref === ref;
      if (sid) return e.subject === sid || e.type === "due-review" && !e.subject;
      return true;
    });
  }
  function chart(title, sub, body, hooks) {
    return el("section", { class: "k-card k-cs-card", "data-ui": "chart.chart" + (hooks ? " " + hooks : ""), "aria-label": title }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: title }),
        sub ? el("span", { class: "k-card-meta", text: sub }) : null
      ].filter(Boolean)),
      body
    ]);
  }

  /* ---------------- the view ---------------- */
  KOS.review = KOS.review || {};
  KOS.review.renderStats = function (main, arg, opts) {
    opts = opts || {};
    KOS.shell.tree("none");
    var sid = arg && arg.subject ? arg.subject : null;
    var ref = arg && arg.ref ? arg.ref : null;

    /* the scope: All / a subject (a topic when drilled in) */
    var scope = KOS.ui.tabs([[null, "All", "All subjects"]].concat(SUBJECTS.map(function (s) { return [s, SHORT[s], NAME[s]]; })).map(function (p) {
      return { label: p[2], short: p[1], active: sid === p[0] && !ref,
        onSelect: function () { KOS.show("cardstats", p[0] ? { subject: p[0] } : undefined, { _nav: true }); } };
    }), { variant: "workspace", label: "Card statistics scope", className: "cardstats-scope-tabs" });
    var head = main.parentNode && main.parentNode.querySelector("[data-ui~='ui.page-actions']");
    if (head) head.insertBefore(scope, head.firstChild); else main.appendChild(scope);
    if (ref) {
      var leaf = KOS.hub.BYREF[sid] && KOS.hub.BYREF[sid][ref];
      main.appendChild(el("div", { class: "k-cs-crumb", "data-ui": "ui.crumbs" }, [
        el("span", { text: NAME[sid] + " · " + ref + (leaf ? " " + leaf.title : "") }),
        el("button", { type: "button", class: "k-link", text: "← the whole subject", onclick: function () { KOS.show("cardstats", { subject: sid }, { _nav: true }); } })
      ]));
    }

    var cards = cardsInScope(sid, ref);
    var tracked = cards.filter(function (c) { return c.meta && c.meta.views; });
    var today = KOS.srs.todayISO();
    var due = 0, overdue = 0, lapses = 0, views = 0, efSum = 0;
    tracked.forEach(function (c) {
      views += c.meta.views; lapses += c.meta.lapses; efSum += c.meta.ef;
      if (c.meta.due && c.meta.due <= today) { due++; if (c.meta.due < today) overdue++; }
    });

    if (!tracked.length) {
      var scopeTile = KOS.ui.statTile({ value: cards.length, label: "Cards in scope", suppressZero: true });
      if (scopeTile) main.appendChild(el("div", { class: "k-card k-cs-strip", "data-ui": "review.stats-strip ui.stat-strip" }, [scopeTile]));
      var empty = KOS.ui.emptyState({ compact: true, mark: "記", title: "No review history in this scope",
        body: "Rate some cards from a topic's Flashcards tab; the scheduling charts appear once there is enough evidence to read." });
      empty.setAttribute("data-ui", empty.getAttribute("data-ui") + " review.stats-empty");
      main.appendChild(empty);
      return;
    }

    var overdueTile = KOS.ui.statTile({ value: overdue, label: "Overdue", suppressZero: true, tone: overdue ? "low" : null });
    main.appendChild(el("div", { class: "k-card k-cs-strip", "data-ui": "review.stats-strip ui.stat-strip" }, [
      KOS.ui.statTile({ value: cards.length, label: "Cards in scope", suppressZero: true }),
      KOS.ui.statTile({ value: tracked.length, label: "In the schedule", suppressZero: true }),
      KOS.ui.statTile({ value: views, label: "Total reviews", suppressZero: true }),
      KOS.ui.statTile({ value: due, label: "Due now", suppressZero: true }),
      overdueTile,
      KOS.ui.statTile({ value: (efSum / tracked.length).toFixed(2), label: "Average ease" }),
      KOS.ui.statTile({ value: views ? Math.round(100 * lapses / views) + "%" : null, label: "Lapse rate", suppressZero: true })
    ].filter(Boolean)));

    if (tracked.length < 3 || views < 3) {
      var low = KOS.ui.emptyState({ compact: true, mark: "芽", title: "The trend is still taking shape",
        body: "Keep rating cards in this scope. Charts appear after at least three scheduled cards and three reviews, so a single result is never presented as a pattern." });
      low.setAttribute("data-ui", low.getAttribute("data-ui") + " review.stats-empty review.stats-lowdata");
      main.appendChild(low);
      return;
    }

    var color = sid ? HUE[sid] : "var(--teal)";
    var sessions = sessionsInScope(sid, ref);

    /* reviews per day, last 30 days (from the session log) */
    var perDay = {}, total30 = 0;
    for (var i = 29; i >= 0; i--) perDay[KOS.srs.addDays(today, -i)] = 0;
    sessions.forEach(function (e) {
      if (perDay[e.date] !== undefined) { perDay[e.date] += (e.metrics.cards || 0); total30 += (e.metrics.cards || 0); }
    });
    var perDayChart = chart("Reviews per day", "last 30 days · avg " + Math.round(total30 / 30),
      barChart(Object.keys(perDay).map(function (d, k, all) {
        return { label: k === 0 || k === 14 ? d.slice(8) + "/" + d.slice(5, 7) : k === all.length - 1 ? "today" : "", value: perDay[d], hint: d + ": " + perDay[d] + " cards" };
      }), { color: color, height: 170 }));

    /* rating mix, as the design's one stacked bar with its legend */
    var mix = { again: 0, hard: 0, good: 0, easy: 0 };
    sessions.forEach(function (e) { Object.keys(mix).forEach(function (k) { mix[k] += (e.metrics[k] || 0); }); });
    var mixTotal = mix.again + mix.hard + mix.good + mix.easy;
    var MIX = [["again", "Again", "var(--red-soft)"], ["hard", "Hard", "var(--amber)"], ["good", "Good", "var(--green)"], ["easy", "Easy", "var(--teal)"]];
    var mixCard = el("section", { class: "k-card k-cs-card", "data-ui": "review.rating-mix", "aria-label": "Rating mix" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Rating mix" })]),
      el("div", { class: "k-cs-mixbar", role: "img", "aria-label": MIX.map(function (m) { return m[1] + " " + mix[m[0]]; }).join(", ") },
        MIX.filter(function (m) { return mix[m[0]]; }).map(function (m) { return el("span", { style: "--f: " + mix[m[0]] + "; --c: " + m[2] }); })),
      el("ul", { class: "k-cs-legend" }, MIX.map(function (m) {
        return el("li", { style: "--c: " + m[2] }, [
          el("span", { class: "k-cs-dot", "aria-hidden": "true" }), el("span", { text: m[1] }),
          el("span", { class: "k-mono k-cs-legend-n", text: mix[m[0]] + (mixTotal ? " · " + Math.round(100 * mix[m[0]] / mixTotal) + "%" : "") })
        ]);
      }))
    ]);
    main.appendChild(el("div", { class: "k-cs-row" }, [perDayChart, mixCard]));

    /* due forecast, next 14 days, overdue first; ease distribution */
    var forecast = [{ label: "over", value: overdue, color: "var(--crimson)", hint: "Overdue: " + overdue }];
    for (var j = 0; j < 14; j++) {
      var d2 = KOS.srs.addDays(today, j);
      var n2 = tracked.filter(function (c) { return c.meta.due === d2; }).length;
      forecast.push({ label: j === 0 ? "today" : j % 3 === 0 ? d2.slice(8) : "", value: n2, hint: d2 + ": " + n2 + " due" });
    }
    var buckets = [["<1.7", 1.3, 1.7], ["1.7–2.1", 1.7, 2.1], ["2.1–2.5", 2.1, 2.5], ["2.5–2.9", 2.5, 2.9], ["≥2.9", 2.9, 99]];
    main.appendChild(el("div", { class: "k-cs-row k-cs-row--even" }, [
      chart("Due forecast", "next 14 days", barChart(forecast, { color: "var(--s3)", height: 150 })),
      chart("Ease distribution", "low ease: the algorithm finds these hard", barChart(buckets.map(function (b) {
        return { label: b[0], value: tracked.filter(function (c) { return c.meta.ef >= b[1] && c.meta.ef < b[2]; }).length,
          color: b[1] < 2.1 ? "var(--red-soft)" : b[1] < 2.5 ? "var(--amber)" : "var(--green)" };
      }), { height: 150 }))
    ]));

    /* the per-topic breakdown — every subject in scope, sorted by lapses */
    if (!ref) {
      var rows = [];
      (sid ? [sid] : SUBJECTS).forEach(function (s) {
        KOS.hub.LEAVES[s].forEach(function (leaf) {
          var cs = KOS.srs.cardsFor(s, leaf.ref);
          var t = cs.map(function (c) { return KOS.srs.peek(c.key); }).filter(function (m) { return m && m.views; });
          if (!t.length) return;
          var l = 0, ef = 0, dnow = 0;
          t.forEach(function (m) { l += m.lapses; ef += m.ef; if (m.due && m.due <= today) dnow++; });
          rows.push({ sid: s, ref: leaf.ref, title: leaf.title, cards: cs.length, tracked: t.length, due: dnow, lapses: l, ef: ef / t.length });
        });
      });
      rows.sort(function (a, b) { return b.lapses - a.lapses || b.due - a.due; });
      if (rows.length) {
        var table = el("table", { class: "k-cs-table", "data-ui": "chart.topics" });
        table.appendChild(el("thead", {}, [el("tr", {}, ["Ref", "Topic", "Cards", "Tracked", "Due", "Lapses", "Avg ease", "RAG", ""].map(function (h) {
          return el("th", { text: h }); }))]));
        var tb = el("tbody", {});
        rows.slice(0, 20).forEach(function (r) {
          var eff = KOS.rag.effective(r.sid, r.ref);
          tb.appendChild(el("tr", { style: "--c: " + HUE[r.sid] }, [
            el("td", { class: "k-mono k-cs-ref", text: r.ref }),
            el("td", { text: r.title }),
            el("td", { class: "k-mono", text: String(r.cards) }),
            el("td", { class: "k-mono", text: String(r.tracked) }),
            el("td", { class: "k-mono", text: String(r.due) }),
            el("td", { class: "k-mono", "data-state": r.lapses ? "hot" : null, text: String(r.lapses) }),
            el("td", { class: "k-mono", text: r.ef.toFixed(2) }),
            el("td", {}, [eff.band ? el("span", { class: "k-spine-dot", "data-band": eff.band, title: KOS.rag.BANDS[eff.band].label }) : el("span", { class: "k-muted", text: "—" })]),
            el("td", {}, [el("button", { type: "button", class: "k-link", text: "charts →", onclick: function () {
              KOS.show("cardstats", { subject: r.sid, ref: r.ref });
            } })])
          ]));
        });
        table.appendChild(tb);
        main.appendChild(el("section", { class: "k-card k-cs-card", "aria-label": "Per-topic breakdown" }, [
          el("div", { class: "k-card-head" }, [
            el("span", { class: "k-card-title", text: "Per-topic breakdown" }),
            el("span", { class: "k-card-meta", text: "sorted by lapses · " + (rows.length > 20 ? "top 20 of " + rows.length : rows.length + (rows.length === 1 ? " topic" : " topics")) })
          ]),
          el("div", { class: "k-cs-tablewrap" }, [table])
        ]));
      }
    }
  };
})();
