/* Kurenai OS — modules/cardstats.js
   Flashcard statistics dashboard (FR-1.6): aggregate schedule data per subject
   or per topic, drawn with plain inline SVG — no charting library, matching
   how everything else in this app is built.

   Graphite (frame 9b): the scope sits in the page header beside the Review
   switcher; one strip of figures, then reviews per day beside the rating
   mix, the due forecast beside recall today, the difficulty distribution
   beside the target retention (FSRS, roadmap 5.6), and the per-topic
   breakdown. Colours are the theme's tokens. Invariant 76 holds: a chart
   needs at least three tracked cards and three reviews.                 */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var SHORT = KOS.subjects.map("short");
  var NAME = Object.assign(KOS.subjects.map("name"), { it: "IT" });
  var HUE = KOS.subjects.map("hue");
  var SUBJECTS = KOS.subjects.ids();

  var barChart = KOS.charts.barChart;

  /* ---------------- data aggregation ---------------- */
  function cardsInScope(sid, ref) {
    var cards = ref ? KOS.srs.cardsFor(sid, ref)
      : sid ? KOS.srs.allCards().filter(function (c) { return c.sid === sid; })
      : KOS.srs.allCards();
    cards.forEach(function (c) { c.meta = KOS.srs.peek(c.key); c.mem = c.meta && c.meta.views ? KOS.srs.memory(c.key) : null; });
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
  /* a bar chart that fills its card (no fixed height leaving a gap under it) */
  function bars(data, opts, label) {
    return KOS.charts.fit(function (w, h) {
      return barChart(data, Object.assign({}, opts, w ? { width: w, height: h } : {}));
    }, label);
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

  /* ---------------- fitted to your reviews (FSRS phase 3) ----------------
     The optimiser (KOS.fsrsOpt) reads the review log and fits the
     parameters to this learner; nothing changes until "Use these" in the
     preview, which says what moves. The card draws from the log's count
     and writes nothing (the fit runs only on Optimise). */
  function pct(x) { return Math.round(x * 1000) / 10 + "%"; }
  function dayText(n) { return n == null ? "—" : n + (n === 1 ? " day" : " days"); }
  function fitCard(withMem, target, today) {
    var O = KOS.fsrsOpt, fit = KOS.srs.fitted();
    var status = el("p", { class: "k-muted", "data-ui": "review.fit-status", role: "status",
      text: fit ? "Fitted " + new Date(fit.at).toLocaleDateString(undefined, { day: "numeric", month: "short" }) + " to " +
        fit.reviews.toLocaleString() + " reviews · log loss " + fit.loss[0] + " → " + fit.loss[1]
        : "Using FSRS-6's defaults, learnt from millions of other people's reviews." });
    var run = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "review.fit-run", text: "Optimise", disabled: "" });
    var reset = fit ? el("button", { type: "button", class: "k-btn", "data-ui": "review.fit-reset", text: "Back to the defaults",
      onclick: function () {
        KOS.ui.confirm({ title: "Back to the defaults?", body: "Scheduling goes back to FSRS-6's default parameters from each card's next review. No due date moves.",
          confirm: "Use the defaults" }, function () { KOS.srs.resetFit(); KOS.a11y.announce("Back to the default parameters."); KOS.rerender(); });
      } }) : null;
    var count = el("span", { class: "k-card-meta", "data-ui": "review.fit-count", text: "" });
    if (KOS.reviewLog && KOS.reviewLog.available()) {
      KOS.reviewLog.count(function (err, n) {
        n = err ? 0 : n;
        count.textContent = n.toLocaleString() + " reviews logged";
        if (n >= O.MIN_REVIEWS) run.disabled = false;
        else if (!fit) status.textContent = "Fitting needs " + O.MIN_REVIEWS.toLocaleString() + " logged reviews — " +
          (O.MIN_REVIEWS - n).toLocaleString() + " to go. Until then the defaults are the better guess.";
      });
    }
    run.onclick = function () {
      run.disabled = true;
      KOS.reviewLog.all(function (err, rows) {
        if (err) { run.disabled = false; status.textContent = "The review log could not be read."; return; }
        var job = O.job(rows, { current: KOS.srs.weights() });
        (function slice() {
          var t0 = Date.now();
          while (!job.done && Date.now() - t0 < 40) job.tick();
          if (!job.done) { status.textContent = "Fitting… " + Math.round(100 * job.step / job.steps) + "%"; setTimeout(slice, 0); return; }
          run.disabled = false;
          var res = job.result;
          if (!res.ok) {
            status.textContent = res.why === "reviews" ? "Fitting needs " + res.need.toLocaleString() + " logged reviews."
              : res.why === "items" ? "Too few reviews a day or more apart to fit (" + res.items + " of " + res.need + ")."
              : "Your current parameters already predict your reviews as well as a new fit would. Nothing changed.";
            KOS.a11y.announce(status.textContent);
            return;
          }
          preview(res, withMem, target, today);
        })();
      });
    };
    return el("section", { class: "k-card k-cs-card", "data-ui": "review.fit", "aria-label": "Fitted to your reviews" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Fitted to your reviews" }), count]),
      el("div", { class: "k-cs-fit" }, [
        status,
        el("div", { class: "k-cluster" }, [run, reset].filter(Boolean))
      ])
    ]);
  }
  /* what a fit would change, before anything does */
  function preview(res, withMem, target, today) {
    var mems = withMem.map(function (c) {
      return { s: c.mem.s, d: c.mem.d, el: c.meta.last ? Math.max(0, KOS.srs.daysBetween(c.meta.last, today)) : 0 };
    });
    var ch = KOS.fsrsOpt.changes(mems, KOS.srs.weights(), res.w, target);
    var better = Math.round(1000 * (res.before.loss - res.after.loss) / res.before.loss) / 10;
    var rows = [
      ["How well it predicts your " + res.items.toLocaleString() + " spaced reviews", "log loss " + res.before.loss.toFixed(4) + " → " + res.after.loss.toFixed(4) + " (" + better + "% better)"],
      ["Recall it predicts against what happened", pct(res.after.predicted) + " predicted · " + pct(res.after.actual) + " actual"]
    ];
    if (ch.n) {
      rows.push(["Next interval after a Good, middle card", dayText(ch.medOld) + " → " + dayText(ch.medNew)]);
      rows.push(["Your " + ch.n + " cards' next Good", ch.longer + " longer · " + ch.shorter + " shorter · " + ch.same + " the same"]);
      rows.push(["Recall today, on average", pct(ch.rOld) + " → " + pct(ch.rNew)]);
    }
    var overlay = el("div", { class: "k-dialog-overlay" });
    overlay.close = function () { overlay.remove(); };
    overlay.appendChild(el("div", { class: "k-dialog", "data-ui": "ui.dialog review.fit-preview" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
        el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "What changes" }),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Close", text: "✕", onclick: function () { overlay.close(); } })
      ]),
      el("div", { class: "k-dialog-body" }, [
        el("dl", { class: "k-cs-fit-list" }, rows.map(function (r) {
          return el("div", {}, [el("dt", { text: r[0] }), el("dd", { class: "k-mono", text: r[1] })]);
        })),
        el("p", { class: "k-muted", text: "It applies from each card's next review. No due date moves, and Back to the defaults undoes it." })
      ]),
      el("div", { class: "k-dialog-foot" }, [
        el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: function () { overlay.close(); } }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "review.fit-use", text: "Use these parameters", onclick: function () {
          KOS.srs.setFit(res);
          overlay.close();
          KOS.a11y.announce("Scheduling now uses parameters fitted to your reviews.");
          KOS.rerender();
        } })
      ])
    ]));
    KOS.ui.openDialog(overlay);
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
    var due = 0, overdue = 0, lapses = 0, views = 0, rSum = 0, rN = 0;
    tracked.forEach(function (c) {
      views += c.meta.views; lapses += c.meta.lapses;
      if (c.mem) { rSum += c.mem.r; rN++; }
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
      rN ? KOS.ui.statTile({ value: Math.round(100 * rSum / rN) + "%", label: "Recall today" }) : null,
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
      bars(Object.keys(perDay).map(function (d, k, all) {
        return { label: k === 0 || k === 14 ? d.slice(8) + "/" + d.slice(5, 7) : k === all.length - 1 ? "today" : "", value: perDay[d], hint: d + ": " + perDay[d] + " cards" };
      }), { color: color }));

    /* rating mix, as the design's one stacked bar with its legend */
    var mix = { again: 0, hard: 0, good: 0, easy: 0 };
    sessions.forEach(function (e) { Object.keys(mix).forEach(function (k) { mix[k] += (e.metrics[k] || 0); }); });
    var mixTotal = mix.again + mix.hard + mix.good + mix.easy;
    var MIX = [["again", "Again", "var(--red-soft)"], ["hard", "Hard", "var(--amber)"], ["good", "Good", "var(--green)"], ["easy", "Easy", "var(--teal)"]];
    var mixCard = el("section", { class: "k-card k-cs-card", "data-ui": "review.rating-mix", "aria-label": "Rating mix" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Rating mix" })]),
      el("div", { class: "k-cs-mixbar", role: "img", "aria-label": MIX.map(function (m) { return m[1] + " " + mix[m[0]]; }).join(", ") },
        MIX.filter(function (m) { return mix[m[0]]; }).map(function (m) { return el("span", { style: "--f: " + mix[m[0]] + "; --c: " + m[2] }); })),
      el("ul", { class: "k-cs-legend k-cs-legend--fill" }, MIX.map(function (m) {
        return el("li", { style: "--c: " + m[2] }, [
          el("span", { class: "k-cs-dot", "aria-hidden": "true" }), el("span", { text: m[1] }),
          el("span", { class: "k-mono k-cs-legend-n", text: mix[m[0]] + (mixTotal ? " · " + Math.round(100 * mix[m[0]] / mixTotal) + "%" : "") })
        ]);
      }))
    ]);
    main.appendChild(el("div", { class: "k-cs-row" }, [perDayChart, mixCard]));

    /* due forecast, next 14 days, overdue first; recall today */
    var forecast = [{ label: "over", value: overdue, color: "var(--alarm)", hint: "Overdue: " + overdue }];
    for (var j = 0; j < 14; j++) {
      var d2 = KOS.srs.addDays(today, j);
      var n2 = tracked.filter(function (c) { return c.meta.due === d2; }).length;
      forecast.push({ label: j === 0 ? "today" : j % 3 === 0 ? d2.slice(8) : "", value: n2, hint: d2 + ": " + n2 + " due" });
    }
    var withMem = tracked.filter(function (c) { return c.mem; });
    function binned(bins, of) {
      return bins.map(function (b) {
        var n = withMem.filter(function (c) { var v = of(c.mem); return v >= b[1] && v < b[2]; }).length;
        return { label: b[0], value: n, color: b[3], hint: b[0] + ": " + n + (n === 1 ? " card" : " cards") };
      });
    }
    var RECALL = [["<70%", 0, 0.7, "var(--red-soft)"], ["70–80", 0.7, 0.8, "var(--amber)"], ["80–90", 0.8, 0.9, "var(--amber)"],
      ["90–95", 0.9, 0.95, "var(--green)"], ["≥95%", 0.95, 2, "var(--teal)"]];
    var DIFF = [["1–3", 0, 3, "var(--teal)"], ["3–5", 3, 5, "var(--green)"], ["5–7", 5, 7, "var(--amber)"],
      ["7–9", 7, 9, "var(--amber)"], ["9–10", 9, 11, "var(--red-soft)"]];
    main.appendChild(el("div", { class: "k-cs-row k-cs-row--even" }, [
      chart("Due forecast", "next 14 days", bars(forecast, { color: "var(--s3)" })),
      chart("Recall today", "the predicted chance you remember each card now", bars(binned(RECALL, function (m) { return m.r; }), {}), "review.recall")
    ]));

    /* difficulty, and the recall the schedule aims for (decision A). A new
       target applies from each card's next review; no due date moves. */
    var target = KOS.srs.retention();
    var TARGETS = [0.8, 0.85, 0.88, 0.9, 0.92, 0.95];
    /* the workload a target asks for at today's memory: each card comes
       round once per interval, so a day holds the sum of 1 / interval */
    function perDayAt(t) {
      var n = withMem.reduce(function (a, c) { return a + 1 / KOS.fsrs.interval(c.mem.s, t, KOS.srs.weights()); }, 0);
      return n < 10 ? Math.round(n * 10) / 10 : Math.round(n);
    }
    var pick = el("select", { class: "k-pill-select", "data-ui": "review.retention", "aria-label": "Target retention",
      onchange: function () { KOS.srs.setRetention(+pick.value); KOS.rerender(); } },
      TARGETS.map(function (t) { return el("option", { value: String(t), selected: t === target ? "" : null, text: Math.round(t * 100) + "%" }); }));
    /* the exam-day target (FSRS phase 2): before a real exam, a card whose
       recall on the day would fall short of it gets one review in the 7–14
       days before; one that will still be remembered is left alone */
    function examRow() {
      var et = KOS.srs.examTarget();
      var held = withMem.filter(function (c) { return c.meta.cap && c.meta.due < c.meta.cap && c.meta.cap > today; }).length;
      var examPick = el("select", { class: "k-pill-select", "data-ui": "review.exam-target", "aria-label": "Recall to aim for on a real exam's day",
        onchange: function () { KOS.srs.setExamTarget(+examPick.value); KOS.rerender(); } },
        [0, 0.92, 0.94, 0.95, 0.96, 0.97, 0.98].map(function (t) {
          return el("option", { value: String(t), selected: t === et ? "" : null, text: t ? Math.round(t * 100) + "%" : "Off" });
        }));
      return el("div", { class: "k-cs-exam", "data-ui": "review.exam" }, [
        el("label", { class: "k-cs-target" }, [el("span", { text: "On a real exam's day, aim for" }), examPick]),
        el("p", { class: "k-muted", text: et && et <= target ? "Set it above your everyday target, or it changes nothing."
          : held ? held + (held === 1 ? " card is" : " cards are") + " brought forward to the week or two before an exam."
          : "Cards that would fall short on the day get one review in the 7–14 days before it." })
      ]);
    }
    var lower = TARGETS[Math.max(0, TARGETS.indexOf(target) - 1)], higher = TARGETS[Math.min(TARGETS.length - 1, TARGETS.indexOf(target) + 1)];
    var targetCard = el("section", { class: "k-card k-cs-card", "data-ui": "review.target", "aria-label": "Target retention" }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: "Target retention" }),
        el("span", { class: "k-card-meta", text: "FSRS · applies from each card's next review" })
      ]),
      el("label", { class: "k-cs-target" }, [el("span", { text: "Bring a card back when its recall falls to" }), pick]),
      el("ul", { class: "k-cs-legend" }, [lower, target, higher].filter(function (t, i, a) { return a.indexOf(t) === i; }).map(function (t) {
        return el("li", { "data-state": t === target ? "current" : null }, [
          el("span", { class: "k-mono", text: Math.round(t * 100) + "%" }),
          el("span", { text: "≈ " + perDayAt(t) + " reviews a day at today's memory" })
        ]);
      })),
      el("p", { class: "k-muted", text: "Higher keeps more in memory and asks for more reviews; 90% is the usual balance." }),
      examRow()
    ]);
    main.appendChild(el("div", { class: "k-cs-row k-cs-row--even" }, [
      chart("Difficulty", "1 easy · 10 hard — how hard FSRS finds each card", bars(binned(DIFF, function (m) { return m.d; }), {}), "review.difficulty"),
      targetCard
    ]));

    if (!ref) main.appendChild(fitCard(withMem, target, today));

    /* the per-topic breakdown — every subject in scope, sorted by lapses */
    if (!ref) {
      var rows = [];
      (sid ? [sid] : SUBJECTS).forEach(function (s) {
        KOS.hub.LEAVES[s].forEach(function (leaf) {
          var cs = KOS.srs.cardsFor(s, leaf.ref);
          var t = cs.map(function (c) { return KOS.srs.peek(c.key); }).filter(function (m) { return m && m.views; });
          if (!t.length) return;
          var l = 0, rs = 0, rn = 0, dnow = 0;
          t.forEach(function (m) { l += m.lapses; if (m.due && m.due <= today) dnow++; });
          cs.forEach(function (c) { var mm = KOS.srs.memory(c.key, today); if (mm) { rs += mm.r; rn++; } });
          rows.push({ sid: s, ref: leaf.ref, title: leaf.title, cards: cs.length, tracked: t.length, due: dnow, lapses: l, recall: rn ? rs / rn : null });
        });
      });
      rows.sort(function (a, b) { return b.lapses - a.lapses || b.due - a.due; });
      if (rows.length) {
        var table = el("table", { class: "k-cs-table", "data-ui": "chart.topics" });
        table.appendChild(el("thead", {}, [el("tr", {}, ["Ref", "Topic", "Cards", "Tracked", "Due", "Lapses", "Recall", "RAG", ""].map(function (h) {
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
            el("td", { class: "k-mono", text: r.recall == null ? "—" : Math.round(100 * r.recall) + "%" }),
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
