/* Kurenai OS — modules/cardstats.js
   Flashcard statistics dashboard (FR-1.6): aggregate SM-2 data per subject
   or per topic, drawn with plain inline SVG — no charting library, matching
   how everything else in this app is built. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;
  var SUBJ = { compsci: "Computer Science", maths: "Mathematics", it: "IT" };
  var HEX = { compsci: "#45d6a8", maths: "#7b9ef8", it: "#c77bf2", all: "#ef4965" };

  /* the shared inline-SVG chart helpers live in core/charts.js */
  var barChart = KOS.charts.barChart, chartCard = KOS.charts.chartCard;

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

  /* ---------------- the view ---------------- */
  KOS.views.cardstats = function (main, arg) {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
    var sid = arg && arg.subject ? arg.subject : null;
    var ref = arg && arg.ref ? arg.ref : null;

    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", { text: "Flashcard Statistics" }),
      el("p", { class: "sub", text: "Everything the SM-2 engine knows about your cards — review volume, scheduling health, ease distribution and where the lapses live." })
    ]));

    /* scope pills: All / subject / (topic when drilled in) */
    var pills = el("div", { class: "study-tabs", role: "tablist" });
    [[null, "All subjects"], ["compsci", SUBJ.compsci], ["maths", SUBJ.maths], ["it", SUBJ.it]].forEach(function (p) {
      pills.appendChild(el("button", {
        class: "study-tab" + (sid === p[0] && !ref ? " active" : ""), role: "tab",
        "data-tab": p[0] || "all",
        onclick: function () { KOS.show("cardstats", p[0] ? { subject: p[0] } : undefined, { _nav: true }); }
      }, [p[1]]));
    });
    main.appendChild(pills);
    if (ref) {
      main.appendChild(el("div", { class: "crumbs", style: "margin-bottom:12px", html:
        "<b>" + esc(SUBJ[sid]) + "</b> · topic " + esc(ref) +
        ' — <a href="#" id="cs-up">back to the whole subject</a>' }));
      main.querySelector("#cs-up").addEventListener("click", function (e) {
        e.preventDefault();
        KOS.show("cardstats", { subject: sid }, { _nav: true });
      });
    }

    var cards = cardsInScope(sid, ref);
    var tracked = cards.filter(function (c) { return c.meta && c.meta.views; });
    var today = KOS.srs.todayISO();
    var due = 0, overdue = 0, lapses = 0, views = 0, efSum = 0;
    tracked.forEach(function (c) {
      views += c.meta.views; lapses += c.meta.lapses; efSum += c.meta.ef;
      if (c.meta.due && c.meta.due <= today) { due++; if (c.meta.due < today) overdue++; }
    });

    main.appendChild(el("div", { class: "stat-strip" }, [
      stat(cards.length, "Cards in scope"),
      stat(tracked.length, "In the schedule"),
      stat(views, "Total reviews"),
      stat(due, "Due now"),
      stat(overdue, "Overdue"),
      stat(tracked.length ? (efSum / tracked.length).toFixed(2) : "—", "Avg ease"),
      stat(views ? Math.round(100 * lapses / views) + "%" : "—", "Lapse rate")
    ]));
    function stat(v, k) {
      return el("div", { class: "stat-card" }, [
        el("div", { class: "v", text: String(v) }), el("div", { class: "k", text: k })]);
    }

    if (!tracked.length) {
      main.appendChild(el("p", { class: "fc-empty", text: "No review data in this scope yet — rate some cards on a topic's Flashcards tab and the charts fill in." }));
      return;
    }

    var color = HEX[sid || "all"];
    var grid = el("div", { class: "cs-grid" });

    /* reviews per day, last 14 days (from the session log) */
    var perDay = {};
    for (var i = 13; i >= 0; i--) perDay[KOS.srs.addDays(today, -i)] = 0;
    sessionsInScope(sid, ref).forEach(function (e) {
      if (perDay[e.date] !== undefined) perDay[e.date] += (e.metrics.cards || 0);
    });
    grid.appendChild(chartCard("Reviews per day", "cards rated, last 14 days",
      barChart(Object.keys(perDay).map(function (d) {
        return { label: d.slice(8), value: perDay[d], hint: d + ": " + perDay[d] + " cards" };
      }), { color: color })));

    /* due forecast, next 14 days (+ overdue bucket first) */
    var forecast = [{ label: "over", value: overdue, color: "#ef4965", hint: "Overdue: " + overdue }];
    for (var j = 0; j < 14; j++) {
      var d2 = KOS.srs.addDays(today, j);
      var n2 = tracked.filter(function (c) { return c.meta.due === d2; }).length;
      forecast.push({ label: j === 0 ? "today" : d2.slice(8), value: n2, hint: d2 + ": " + n2 + " due" });
    }
    grid.appendChild(chartCard("Due forecast", "cards falling due, next 14 days",
      barChart(forecast, { color: "#ecc15a" })));

    /* ease-factor distribution */
    var buckets = [["<1.7", 1.3, 1.7], ["1.7–2.1", 1.7, 2.1], ["2.1–2.5", 2.1, 2.5], ["2.5–2.9", 2.5, 2.9], ["≥2.9", 2.9, 99]];
    grid.appendChild(chartCard("Ease distribution", "low ease = the algorithm finds these hard",
      barChart(buckets.map(function (b) {
        return { label: b[0], value: tracked.filter(function (c) { return c.meta.ef >= b[1] && c.meta.ef < b[2]; }).length,
          color: b[1] < 2.1 ? "#ef4965" : b[1] < 2.5 ? "#ecc15a" : "#45d6a8" };
      }))));

    /* rating mix from the session log */
    var mix = { again: 0, hard: 0, good: 0, easy: 0 };
    sessionsInScope(sid, ref).forEach(function (e) {
      Object.keys(mix).forEach(function (k) { mix[k] += (e.metrics[k] || 0); });
    });
    grid.appendChild(chartCard("Rating mix", "every rating you've given in this scope",
      barChart([
        { label: "Again", value: mix.again, color: "#ef4965" },
        { label: "Hard", value: mix.hard, color: "#ecc15a" },
        { label: "Good", value: mix.good, color: "#45d6a8" },
        { label: "Easy", value: mix.easy, color: "#7b9ef8" }
      ])));
    main.appendChild(grid);

    /* per-topic breakdown (subject scope only) */
    if (sid && !ref) {
      var rows = [];
      KOS.hub.LEAVES[sid].forEach(function (leaf) {
        var cs = KOS.srs.cardsFor(sid, leaf.ref);
        var t = cs.map(function (c) { return KOS.srs.peek(c.key); }).filter(function (m) { return m && m.views; });
        if (!t.length) return;
        var l = 0, v = 0, ef = 0, dnow = 0;
        t.forEach(function (m) { l += m.lapses; v += m.views; ef += m.ef; if (m.due && m.due <= today) dnow++; });
        rows.push({ ref: leaf.ref, title: leaf.title, cards: cs.length, tracked: t.length,
          due: dnow, lapses: l, ef: ef / t.length });
      });
      rows.sort(function (a, b) { return b.lapses - a.lapses || b.due - a.due; });
      if (rows.length) {
        main.appendChild(el("h3", { class: "n-h", text: "Per-topic breakdown — sorted by lapses" }));
        var table = el("table", { class: "n-table cs-topics" });
        table.appendChild(el("thead", {}, [el("tr", {}, ["Topic", "Cards", "Tracked", "Due", "Lapses", "Avg ease", "RAG", ""].map(function (h) {
          return el("th", { text: h }); }))]));
        var tb = el("tbody", {});
        rows.slice(0, 20).forEach(function (r) {
          var eff = KOS.rag.effective(sid, r.ref);
          tb.appendChild(el("tr", {}, [
            el("td", {}, [el("b", { text: r.ref }), " " + r.title]),
            el("td", { text: String(r.cards) }),
            el("td", { text: String(r.tracked) }),
            el("td", { text: String(r.due) }),
            el("td", { text: String(r.lapses) }),
            el("td", { text: r.ef.toFixed(2) }),
            el("td", {}, [eff.band ? KOS.rag.dot(eff.band) : el("span", { class: "sub", text: "—" })]),
            el("td", {}, [el("button", { class: "mini-btn", text: "charts →", onclick: function () {
              KOS.show("cardstats", { subject: sid, ref: r.ref });
            } })])
          ]));
        });
        table.appendChild(tb);
        main.appendChild(el("div", { class: "n-tablewrap" }, [table]));
        if (rows.length > 20) main.appendChild(el("p", { class: "sub", text: "Showing the 20 topics with the most lapses (" + rows.length + " have data)." }));
      }
    }
  };

  function esc(s) { return KOS.hub.esc(s); }
})();
