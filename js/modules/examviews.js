/* Kurenai OS — modules/examviews.js
   Four of the Exams hub's tabs (roadmap 5.8, phase 3), drawn to design
   turn 29:
     Readiness (29g)  each signal opened, for one assessment at a time
     Planner (29l)    the week's guide, with Send to Pacing as its one write
     Season (29m)     the landing while exam season is on
     Results (29ab)   one calm page per summer series
   The shared pieces are KOS.examUI (modules/exams.js). Pages only read;
   Send, a rapid-recall rating, a results-day grade and the Quiet switch
   are clicks (invariant 129).                                            */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function E() { return KOS.exams; }
  function U() { return KOS.examUI; }
  function today() { return KOS.srs.todayISO(); }

  /* the assessments with a readiness model, still ahead (29g's picker) */
  function modelled() { return E().upcoming().filter(function (a) { return a.tier !== "deadline" && a.tier !== "retrieval_test"; }); }
  function picker(list, cur, go) {
    var u = U();
    var tabs = KOS.ui.tabs(list.map(function (a) {
      return { label: a.title, dot: u.hueOf(a), active: a.id === cur, onSelect: function () { if (a.id !== cur) go(a); } };
    }), { variant: "workspace", label: "Assessment", edge: true });
    tabs.setAttribute("data-ui", (tabs.getAttribute("data-ui") || "") + " exams.picker");
    return tabs;
  }

  /* ---------------- Readiness in depth (29g) ---------------- */
  function readiness(main, id) {
    var u = U(), X = E();
    var list = modelled();
    var a = (id && X.get(id)) || list[0] || null;
    if (a && list.indexOf(a) === -1 && a.tier !== "deadline" && a.tier !== "retrieval_test") list = [a].concat(list);
    u.head(main, "readiness", { right: list.length ? picker(list.slice(0, 8), a && a.id, function (x) {
      KOS.show("exams", { tab: "readiness", sub: x.id });
      var rd = X.readiness(x);
      u.announce("Readiness for " + x.title + ": " + (rd.band ? u.BAND[rd.band.band][0].slice(2) : "no band") + (rd.band && rd.band.limitName ? ", limiting " + rd.band.limitName : "") + ".");
    }) : null });
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.readiness" });
    main.appendChild(wrap);
    if (!a) { wrap.appendChild(KOS.ui.emptyState({ compact: true, mark: "試", title: "Add an assessment to see readiness", body: "A real exam, a mock or a topic test with a scope." })); return; }
    var rd = X.readiness(a), s = rd.signals, b = rd.band;
    if (a.subject) main.style.setProperty("--accent", u.HUE[a.subject]);
    wrap.appendChild(el("div", { class: "k-ex-bandline", "data-ui": "exams.bandline" }, [u.bandEl(b, { row: true, big: true }),
      el("span", { class: "k-ex-grow" }, [a.title + " · " + u.pretty(a.date) + " · " + u.plural(X.daysTo(a), "day") + ". ",
        b && b.limitName ? el("b", { text: b.limitName.charAt(0).toUpperCase() + b.limitName.slice(1) + " is holding it " + (b.band === "risk" ? "down" : "at " + u.BAND[b.band][0].slice(2)) + "." }) : (b ? b.why : "")]),
      u.btn("Plan the gap", "primary sm", function () { KOS.show("exams", "plan"); })]));
    /* limiter first when the cards stack (29g at 860) */
    var order = ["coverage", "rag", "recall", "practice"].filter(function (k) { return s[k]; });
    var cards = {};
    if (s.coverage) cards.coverage = coverageCard(a, s.coverage);
    if (s.rag) cards.rag = ragCard(a, s.rag);
    if (s.recall) cards.recall = recallCard(a, rd);
    if (s.practice) cards.practice = practiceCard(a, rd);
    var grid = el("div", { class: "k-ex-rgrid", "data-ui": "exams.rgrid" }, order.map(function (k) {
      var c = cards[k];
      if (b && b.limit === k) c.setAttribute("data-first", "");
      return c;
    }));
    wrap.appendChild(grid);
    var ex = u.excludedEl(a, "Readiness ignores it.");
    if (ex) wrap.appendChild(ex);
  }
  function rhead(n, name, fig, o) {
    var u = U();
    o = o || {};
    return el("div", { class: "k-ex-rhead" }, [el("span", { class: "k-ex-sig-n", text: String(n) }), el("span", { class: "k-ex-ctitle", text: name }),
      o.limit ? el("span", { class: "k-chip", "data-tone": "danger", text: "▲ Holding it down" }) : null, el("span", { class: "k-ex-grow" }), fig ? el("span", { class: "k-ex-fig k-ex-fig--22", text: fig }) : null].filter(Boolean));
  }
  function coverageCard(a, c) {
    var u = U();
    var k = u.card([rhead(1, "Coverage", c.thin ? null : u.pc(c.value))], "k-ex-flexcard", "exams.r-coverage");
    if (c.thin) { k.appendChild(u.quiet(c.why, c.sub)); return k; }
    k.appendChild(u.muted(c.met + " of " + c.of + " leaves in scope are covered in Pacing or started." + (c.unmet.length ? " Not yet:" : ""), "k-ex-block"));
    c.unmet.slice(0, 18).forEach(function (x) {
      var p = KOS.spec.parse(x.key);
      k.appendChild(el("button", { type: "button", class: "k-ex-rrow", onclick: function () { if (p) KOS.show("ref", { subject: p.subject, ref: p.ref }); } }, [
        el("span", { class: "k-mono k-ex-muted", text: x.ref }), el("span", { class: "k-ex-ell k-ex-grow", text: x.title }), u.muted(x.week ? "Pacing: week of " + u.pretty(x.week, { dow: false }) : "Not in Pacing yet", "k-ex-nowrap")]));
    });
    if (c.unmet.length > 18) k.appendChild(u.muted("and " + (c.unmet.length - 18) + " more", "k-ex-block"));
    return k;
  }
  function ragCard(a, r) {
    var u = U();
    var k = u.card([rhead(2, "RAG by unit", null)], "k-ex-flexcard", "exams.r-rag");
    if (r.thin) { k.appendChild(u.quiet(r.why, r.sub)); return k; }
    k.appendChild(u.muted("Green " + Math.round(100 * r.green) + " · Amber " + Math.round(100 * r.amber) + " · Red " + Math.round(100 * r.red) + " · Unrated " + Math.round(100 * r.unrated) + " %, mark-weighted", "k-ex-block"));
    k.appendChild(u.ragBar(r, { legend: false }));
    r.units.forEach(function (x) {
      k.appendChild(el("div", { class: "k-ex-ragrow" }, [el("span", { class: "k-mono k-ex-muted", text: x.ref }), el("span", { class: "k-ex-ell", text: x.title }),
        u.ragBar(x, { legend: false, thin: true }), el("span", { class: "k-ex-small", "data-tone": x.red >= 0.15 ? "danger" : null, text: x.red >= 0.15 ? "▲ " + u.pc(x.red) + " red" : x.red ? u.pc(x.red) + " red" : "" })]));
    });
    return k;
  }
  function recallCard(a, rd) {
    var u = U(), r = rd.signals.recall, lim = rd.band && rd.band.band === "risk" && rd.band.limit === "recall";
    var k = u.card([rhead(3, r.today ? "Recall today" : "Projected recall on " + u.pretty(a.date, { dow: false }), r.thin ? null : u.pc(r.value), { limit: lim })], "k-ex-flexcard", "exams.r-recall");
    if (r.thin) { k.appendChild(u.quiet(r.why, r.sub)); return k; }
    var tgt = Math.round(100 * rd.target);
    k.appendChild(u.muted("FSRS retrievability on the morning of the test, by leaf, weakest first. The tick is the " + tgt + "% target.", "k-ex-block"));
    r.weakest.slice(0, 14).forEach(function (x, i) {
      var p = KOS.spec.parse(x.key);
      k.appendChild(el("button", { type: "button", class: "k-ex-recrow", "data-weak": i < 3 ? "" : null, onclick: function () { if (p) KOS.show("ref", { subject: p.subject, ref: p.ref }); } }, [
        el("span", { class: "k-mono k-ex-muted", text: x.ref }), el("span", { class: "k-ex-ell", text: x.title }), u.tickBar(100 * x.r, tgt, i < 3 && x.r < rd.target ? "alarm" : null), el("span", { class: "k-mono", text: u.pc(x.r) })]));
    });
    if (r.noEvidence) k.appendChild(u.muted(u.plural(r.noEvidence, "leaf", "leaves") + " in scope with no rated card: not counted as 0.", "k-ex-block"));
    k.appendChild(el("div", { class: "k-ex-grow" }));
    k.appendChild(el("div", { class: "k-ex-actions" }, [u.btn("Cram this scope", "sm", function () { u.cramScope(a); }), u.muted(u.plural(r.cards, "card") + " in scope · " + u.plural(r.rated, "rated"))]));
    return k;
  }
  function practiceCard(a, rd) {
    var u = U(), p = rd.signals.practice, lim = rd.band && rd.band.band === "risk" && rd.band.limit === "practice";
    var pr = p.predicted;
    var k = u.card([rhead(4, "Timed practice", null, { limit: lim })], "k-ex-flexcard", "exams.r-practice");
    if (!p.thin && pr && !pr.thin) k.firstChild.appendChild(el("span", { class: "k-ex-small k-ex-muted" }, ["predicted ", el("b", { class: "k-ex-fig k-ex-fig--18", text: pr.lo === pr.hi ? pr.lo : pr.lo + "–" + pr.hi })]));
    if (p.thin) { k.appendChild(u.quiet(p.why, p.sub)); return k; }
    var cuts = pr && pr.cut ? pr.cut[0].pct : null;
    k.appendChild(u.muted(u.plural(p.n, "timed paper") + "." + (pr && !pr.thin ? " Shaded: the " + pr.lo + (pr.hi !== pr.lo ? "–" + pr.hi : "") + " range, from the " + pr.series.join(" and ") + " boundaries" + (pr.notional ? " (notional, per paper)" : "") + "." : pr && pr.noBounds ? " No boundaries for this paper yet." : " Three give a grade range."), "k-ex-block"));
    k.appendChild(trendChart(p.list, a, pr));
    p.list.slice(-5).reverse().forEach(function (x) {
      k.appendChild(el("div", { class: "k-ex-trow" }, [el("span", { class: "k-mono k-ex-muted", text: u.pretty(x.date, { dow: false }) }), el("span", { class: "k-ex-ell", text: x.label }),
        el("span", { class: "k-mono k-ex-muted", text: x.mins ? u.mins(x.mins) : "" }), el("b", { class: "k-mono", text: Math.round(x.pct) + "%" })]));
    });
    k.appendChild(el("div", { class: "k-ex-grow" }));
    k.appendChild(el("p", { class: "k-ex-foot", text: "A range, never a grade: it narrows with each timed paper and widens if they disagree." }));
    return k;
  }
  /* the timed trend against the shaded grade bands (29g) */
  function trendChart(list, a, pr) {
    var NS = "http://www.w3.org/2000/svg", W = 440, H = 170, L = 40, R = 24;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + H); svg.setAttribute("class", "k-ex-trend"); svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "Timed papers: " + list.map(function (x) { return x.label + " " + Math.round(x.pct) + "%"; }).join(", "));
    function y(v) { return H - 24 - (Math.max(30, Math.min(100, v)) - 30) / 70 * (H - 40); }
    var first = list[0].date, end = a.date && a.date > list[list.length - 1].date ? a.date : list[list.length - 1].date;
    var span = Math.max(1, KOS.srs.daysBetween(first, end));
    function x(d) { return L + KOS.srs.daysBetween(first, d) / span * (W - L - R); }
    function add(tag, at, txt) { var n = document.createElementNS(NS, tag); Object.keys(at).forEach(function (k) { n.setAttribute(k, at[k]); }); if (txt != null) n.textContent = txt; svg.appendChild(n); return n; }
    if (pr && !pr.thin && pr.cut) {
      var cut = pr.cut[0].pct, gs = ["A*", "A", "B", "C", "D", "E"];
      gs.forEach(function (g, i) {
        if (cut[g] == null) return;
        var hi = i === 0 ? 100 : cut[gs[i - 1]], lo = cut[g];
        var on = gs.indexOf(pr.lo) >= i && gs.indexOf(pr.hi) <= i;
        add("rect", { x: L, y: y(hi).toFixed(1), width: W - L - R, height: Math.max(0, y(lo) - y(hi)).toFixed(1), class: on ? "k-ex-trend-band" : "k-ex-trend-off" });
        add("line", { x1: L, x2: W - R, y1: y(lo).toFixed(1), y2: y(lo).toFixed(1), class: "k-ex-trend-grid" });
        add("text", { x: W - R + 6, y: (y((lo + hi) / 2) + 4).toFixed(1), class: "k-ex-trend-lab" }, g);
      });
    }
    add("text", { x: L - 6, y: (y(30) + 4).toFixed(1), class: "k-ex-trend-lab", "text-anchor": "end" }, "30");
    add("text", { x: L - 6, y: (y(100) + 4).toFixed(1), class: "k-ex-trend-lab", "text-anchor": "end" }, "100");
    if (list.length > 1) add("polyline", { points: list.map(function (p) { return x(p.date).toFixed(1) + "," + y(p.pct).toFixed(1); }).join(" "), class: "k-ex-trend-line" });
    list.forEach(function (p) {
      add("circle", { cx: x(p.date).toFixed(1), cy: y(p.pct).toFixed(1), r: 4, class: "k-ex-trend-pt" });
      add("text", { x: x(p.date).toFixed(1), y: (y(p.pct) - 10).toFixed(1), "text-anchor": "middle", class: "k-ex-trend-val" }, Math.round(p.pct) + "%");
    });
    if (a.date && a.date > list[list.length - 1].date) {
      add("line", { x1: x(a.date).toFixed(1), x2: x(a.date).toFixed(1), y1: 10, y2: H - 24, class: "k-ex-trend-day" });
      add("text", { x: (x(a.date) - 4).toFixed(1), y: 20, "text-anchor": "end", class: "k-ex-trend-lab" }, U().pretty(a.date, { dow: false }));
    }
    return svg;
  }

  /* ---------------- the Planner (29l) ---------------- */
  var planWeek = null, sentFlash = null;
  function planner(main) {
    var u = U(), P = KOS.examPlan;
    var wb = planWeek || P.mondayOf(today());
    var nowWb = P.mondayOf(today()), past = wb < nowWb;
    var nav = el("div", { class: "k-ex-weeknav", "data-ui": "exams.weeknav" }, [
      u.btn("‹", "quiet sm", function () { planWeek = KOS.srs.addDays(wb, -7); KOS.rerender(); }, { "aria-label": "Previous week" }),
      el("b", { text: "Week of " + u.pretty(wb) }),
      u.btn("›", "quiet sm", function () { planWeek = KOS.srs.addDays(wb, 7); KOS.rerender(); }, { "aria-label": "Next week" })]);
    u.head(main, "plan", { right: nav });
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.planner" });
    main.appendChild(wrap);
    var p = P.plan(wb);
    var sent = P.sentState(wb);
    if (past) {
      wrap.appendChild(u.card([u.chead("Week of " + u.pretty(wb), "history"), u.quiet(sent ? "Sent " + (sent.at ? u.pretty(new Date(sent.at).toISOString().slice(0, 10)) : "") + " · " + sent.done + " of " + sent.n + " done." : "Nothing was sent to Pacing that week.", "Past weeks are read-only; this week is worked out afresh from today's readiness.")], "", "exams.pastweek"));
      return;
    }
    if (p.empty === "nothing") { wrap.appendChild(KOS.ui.emptyState({ compact: true, mark: "送", title: "Nothing to plan for this week", body: "No assessment with a readiness model starts within three weeks. Reviews only: 30 minutes a day." })); return; }
    var left = el("div", { class: "k-ex-col" }), side = el("div", { class: "k-ex-side" });
    /* hours: the only input */
    var hrs = el("input", { type: "number", class: "k-input k-ex-hours", min: 0, max: 60, step: 0.5, value: String(p.hours.hours), "aria-label": "Hours available this week", "data-ui": "exams.hours" });
    hrs.addEventListener("change", function () {
      var v = Math.max(0, Math.min(60, Number(hrs.value) || 0));
      E().setPrefs({ weeklyHours: v });
      var np = P.plan(wb);
      u.announce(v + " hours: " + np.groups.map(function (g) { return g.a.title + " " + u.mins(g.mins); }).join(", ") + ".");
      KOS.rerender();
    });
    var hcard = u.card([el("div", { class: "k-ex-hoursrow" }, [el("div", {}, [u.eyebrow("Hours available"), el("div", { class: "k-ex-inline" }, [hrs, u.muted(p.hours.avgMins ? "your last 4 weeks averaged " + u.mins(p.hours.avgMins) : p.hours.from === "default" ? "a starting guess until your sessions say otherwise" : "")])]),
      el("span", { class: "k-ex-grow" }), el("p", { class: "k-ex-small k-ex-hourswhy", text: p.total ? "Split by nearness, risk and marks at stake." + (p.groups[0] && p.groups[0].risk ? " " + p.groups[0].a.title + " is At risk, so it gets the most." : "") : "" })])], "", "exams.hourscard");
    if (!p.total) { hcard.appendChild(u.quiet("Add some hours to get a plan.", "")); left.appendChild(hcard); }
    else {
      hcard.appendChild(allocBar(p));
      left.appendChild(hcard);
      p.groups.forEach(function (g) { left.appendChild(groupCard(g)); });
    }
    left.lastChild.classList.add("k-ex-fill");
    /* side: the one action */
    var items = P.sendList(p);
    var sendBtn = u.btn(sent ? "Send again (replaces)" : "Send this week's priorities to Pacing", "primary", function () { sendDialog(wb, items); }, { "data-ui": "exams.send", disabled: items.length ? null : "" });
    if (sentFlash && sentFlash.wb === wb && Date.now() - sentFlash.at < 8000) {
      sendBtn = u.btn("Sent · " + u.plural(sentFlash.n, "item") + " · Undo", "", function () { var n = P.undo(wb); sentFlash = null; KOS.ui.toast("Removed " + u.plural(n, "row") + " from Pacing."); KOS.rerender(); }, { "data-ui": "exams.undo" });
    }
    side.appendChild(u.card([u.eyebrow("This week"), el("div", { class: "k-ex-bigfig-row" }, [el("span", { class: "k-ex-fig k-ex-fig--40", text: String(p.sessions) }), u.muted("sessions of 25 min")]),
      u.muted([p.groups.some(function (g) { return g.paper && !g.paper.outside; }) ? "+ one timed paper" : null, p.reviews ? u.mins(p.reviews.mins) + " of reviews" : null].filter(Boolean).join(" · ")),
      el("div", { class: "k-ex-sendbox" }, [sendBtn, u.muted(sent && !sentFlash ? "Sent: " + sent.done + " of " + sent.n + " done. Sending again replaces this planner's own rows." : "Read-only until you send it. Never writes the Calendar.", "k-ex-center")])], "", "exams.thisweek"));
    if (p.cram) side.appendChild(u.card([u.chead("Cram deck", "for the next test"), el("div", { class: "k-ex-bigfig-row" }, [el("span", { class: "k-ex-fig k-ex-fig--26", text: String(p.cram.cards) }), u.muted("cards · " + p.cram.a.title + " · " + u.pretty(p.cram.a.date))]),
      el("div", { class: "k-ex-actions" }, [u.btn("Cram the deck", "sm", function () { u.cramScope(p.cram.a); })])], "", "exams.cram"));
    var nx = P.plan(KOS.srs.addDays(wb, 7));
    side.appendChild(u.card([u.chead("Next week", "a preview"), el("p", { class: "k-ex-body", text: nx.groups.length ? nx.groups.map(function (g) { return g.a.title + " " + u.mins(g.mins); }).join(" · ") + "." + (p.groups.filter(function (g) { return !nx.groups.some(function (n) { return n.a.id === g.a.id; }); }).map(function (g) { return " " + g.a.title + " leaves the plan."; }).join("")) : "Nothing planned yet: no start-by date falls within three weeks of it." })], "", "exams.nextweek"));
    side.appendChild(u.card([u.chead("Why this split", "tier × gap ÷ weeks left")].concat(p.groups.map(function (g) {
      var rk = g.band && g.band.band === "risk";
      return el("div", { class: "k-ex-whyrow" }, [el("div", { class: "k-ex-grow" }, [el("div", { class: "k-ex-strong k-ex-ell", text: g.a.title }),
        el("span", { class: "k-ex-small", "data-tone": rk ? "danger" : null, text: u.plural(E().daysTo(g.a), "day") + " · " + (rk ? "▲ At risk" : g.band ? u.BAND[g.band.band][0].slice(2) : "no band") })]),
        el("span", { class: "k-mono", text: Math.round(100 * g.share) + "%" })]);
    })).concat([el("div", { class: "k-ex-grow" }), el("p", { class: "k-ex-foot", text: "At most 40% of an assessment's time goes to one leaf, and overdue reviews in scope always get a slot." })]), "k-ex-fill", "exams.why-split"));
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [left, side]));
  }
  function allocBar(p) {
    var u = U(), segs = p.groups.map(function (g) { return { t: g.a.title, m: g.mins, c: u.hueOf(g.a), real: g.a.tier === "real_exam" }; });
    if (p.reviews) segs.push({ t: "Reviews", m: p.reviews.mins, c: "var(--text-2)" });
    return el("div", { class: "k-ex-alloc", "data-ui": "exams.alloc" }, [
      el("div", { class: "k-ex-allocbar", role: "img", "aria-label": segs.map(function (s) { return s.t + " " + u.mins(s.m); }).join(", ") }, segs.map(function (s) {
        var x = el("span", { "data-real": s.real ? "" : null }); x.style.setProperty("--g", String(s.m)); x.style.setProperty("--s", s.c); return x;
      })),
      el("div", { class: "k-ex-alloclegend", style: "--n: " + Math.min(4, segs.length) }, segs.map(function (s) {
        return el("div", {}, [el("span", { class: "k-ex-inline k-ex-small" }, [el("i", { class: "k-ex-dot", style: "--s: " + s.c }), el("span", { class: "k-ex-ell", text: s.t })]), el("b", { class: "k-mono", text: u.mins(s.m) })]);
      }))]);
  }
  function groupCard(g) {
    var u = U();
    var c = u.card([el("div", { class: "k-ex-ghead", style: "--s: " + u.hueOf(g.a) }, [el("span", { class: "k-ex-vbar", "aria-hidden": "true" }),
      el("button", { type: "button", class: "k-ex-ctitle k-ex-titlelink", text: g.a.title, onclick: function () { KOS.show("exams", g.a.id); } }), u.tierChip(g.a.tier, true),
      el("span", { class: "k-ex-grow" }), el("span", { class: "k-mono", text: u.mins(g.mins) })])], "", "exams.pgroup");
    g.rows.forEach(function (r) {
      c.appendChild(el("div", { class: "k-ex-prow" }, [el("div", { class: "k-ex-grow" }, [el("div", { class: "k-ex-strong k-ex-ell" }, [r.learn ? el("span", { class: "k-chip", "data-tone": "muted", text: "learn first" }) : null, el("span", { text: " " + r.title })].filter(Boolean)), u.muted(r.why)]),
        r.sessions ? el("span", { class: "k-ex-blocks", "aria-label": u.plural(r.sessions, "session") }, Array.apply(null, { length: r.sessions }).map(function () { return el("i"); })) : el("span"),
        el("span", { class: "k-mono k-ex-small", text: u.mins(r.mins) })]));
    });
    if (g.paper) c.appendChild(el("div", { class: "k-ex-prow" }, [el("div", { class: "k-ex-grow" }, [el("div", { class: "k-ex-strong k-ex-ell", text: "紙 " + g.paper.title }),
      u.muted(g.paper.outside ? "The week's practice paper · beyond this week's hours for it, so it is a suggestion" : "The week's practice paper · " + g.paper.done + " of " + g.paper.of + " sittings done")]), el("span"), el("span", { class: "k-mono k-ex-small", text: u.mins(g.paper.mins) })]));
    if (!g.rows.length && !g.paper) c.appendChild(u.quiet("No topic stands out yet.", "Add marks by question or rate topics, and this fills in."));
    return c;
  }
  function sendDialog(wb, items) {
    var u = U(), overlay = el("div", { class: "k-dialog-overlay" });
    function close() { overlay.remove(); }
    overlay.close = close;
    var picks = items.map(function () { return true; });
    var go = u.btn("Send " + u.plural(items.length, "item"), "primary", function () {
      var chosen = items.filter(function (_, i) { return picks[i]; });
      var res = KOS.examPlan.send(wb, chosen);
      close();
      if (!res.ok) { KOS.ui.toast(res.why, true); return; }
      sentFlash = { wb: wb, n: res.ids.length, at: Date.now() };
      u.announce(u.plural(res.ids.length, "priority", "priorities") + " sent to Pacing.");
      KOS.rerender();
      setTimeout(function () { if (sentFlash && Date.now() - sentFlash.at >= 8000) KOS.rerender(); }, 8100);
    }, { "data-ui": "exams.send-go" });
    var list = el("div", { class: "k-ex-sendlist" }, items.map(function (it, i) {
      var box = el("input", { type: "checkbox", class: "k-box", "aria-label": it.title, onchange: function () { picks[i] = box.checked; var n = picks.filter(Boolean).length; go.textContent = "Send " + u.plural(n, "item"); go.disabled = !n; } });
      box.checked = true;
      return el("label", { class: "k-ex-checkrow" }, [box, el("span", { class: "k-ex-grow", text: it.title }), u.muted(it.label)]);
    }));
    overlay.appendChild(el("div", { class: "k-dialog k-ex-dialog", "data-size": "sm", "data-ui": "ui.dialog exams.send-dialog" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "送" }), el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Send this week's priorities?" })]),
      el("div", { class: "k-dialog-body k-ex-dbody" }, [el("p", { text: "Adds exactly this. Nothing else changes, and nothing goes on the Calendar." }),
        el("div", { class: "k-ex-minihead", text: "To Pacing · week of " + u.pretty(wb, { dow: false }) + ", as personal rows" }), list,
        el("p", { class: "k-ex-small k-ex-muted", text: "They are ordinary personal Pacing rows tagged exam: edit or remove them in Pacing; Undo removes them all. Sending again replaces this planner's unticked rows for the week." })]),
      el("div", { class: "k-dialog-foot" }, [u.btn("Cancel", "", close), el("span", { class: "k-spacer" }), go])
    ]));
    KOS.ui.openDialog(overlay);
    var first = list.querySelector("input");
    if (first) first.focus();
  }

  /* ---------------- Exam Season (29m) ---------------- */
  var rapid = { i: 0, shown: false, keys: null };
  function season(main) {
    var u = U(), X = E(), sn = X.season();
    var quietBox = el("input", { type: "checkbox", class: "k-switch", "data-ui": "exams.quiet", "aria-label": "Quiet the rest", onchange: function () {
      X.setPrefs({ quiet: quietBox.checked });
      var n = KOS.notify && KOS.notify.held ? KOS.notify.held() : 0;
      u.announce(quietBox.checked ? "Quiet the rest on." + (n ? " " + u.plural(n, "notice") + " will wait." : "") : "Quiet the rest off.");
      KOS.rerender();
    } });
    quietBox.checked = !!X.prefs().quiet;
    var held = sn.quiet && KOS.notify && KOS.notify.held ? KOS.notify.held() : 0;
    u.head(main, "season", { right: el("label", { class: "k-ex-quietsw" }, [quietBox, el("span", { text: "Quiet the rest" }),
      u.muted(sn.last ? "Collection, Money and Goals notices wait until " + u.pretty(KOS.srs.addDays(sn.last.date, 1), { dow: false }) + (held ? " · " + held + " waiting" : "") : "while the season is on")]) });
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.season-view" });
    main.appendChild(wrap);
    var exams = sn.exams.length ? sn.exams : X.upcoming().filter(function (a) { return a.tier === "real_exam"; }).slice(0, 5);
    if (!exams.length) { wrap.appendChild(KOS.ui.emptyState({ compact: true, mark: "季", title: "No real exams ahead", body: "Exam season turns on by itself 28 days before a real exam." })); return; }
    wrap.appendChild(el("div", { class: "k-ex-tiles", "data-n": String(Math.min(5, exams.length)) }, exams.slice(0, 5).map(function (a, i) {
      var rd = X.readiness(a), d = X.daysTo(a), isToday = d === 0;
      return el("button", { type: "button", class: "k-ex-tile", "data-first": i === 0 ? "" : null, "data-today": isToday ? "" : null, style: "--s: " + u.hueOf(a),
        onclick: function () { KOS.show("exams", isToday ? { id: a.id, tab: "room" } : a.id); } }, [
        el("span", { class: "k-ex-inline" }, [el("span", { class: "k-ex-vbar", "aria-hidden": "true" }), u.muted(u.pretty(a.date) + (a.time ? " · " + a.time : ""))]),
        el("span", { class: "k-ex-tiletitle", text: a.title }),
        isToday ? el("span", { class: "k-ex-strong", text: "Today · " + (a.time || "") + " · Exam Room" }) : el("span", { class: "k-ex-bigfig-row" }, [el("b", { class: "k-mono k-ex-tilefig", text: String(d) }), u.muted(d === 1 ? "day" : "days")]),
        rd.band ? u.bandEl(rd.band) : null].filter(Boolean));
    })));
    var left = el("div", { class: "k-ex-col" }), right = el("div", { class: "k-ex-side" });
    /* the highest-risk leaves across every paper, weakest recall first */
    var risk = [];
    exams.forEach(function (a) {
      var rd = X.readiness(a), r = rd.signals.recall;
      if (r && !r.thin) r.weakest.slice(0, 4).forEach(function (w) { risk.push({ a: a, w: w, target: rd.target }); });
    });
    risk.sort(function (x, y) { return x.w.r - y.w.r; });
    var rc = u.card([u.chead("Highest-risk topics", "across " + (exams.length === 1 ? "the paper" : "all " + exams.length + " papers") + ", weakest projected recall first")], "", "exams.risk");
    if (!risk.length) rc.appendChild(u.quiet("Recall appears after 20 rated cards in a paper's scope.", ""));
    risk.slice(0, 5).forEach(function (x) {
      rc.appendChild(el("div", { class: "k-ex-riskrow" }, [el("div", { class: "k-ex-grow" }, [el("div", { class: "k-ex-strong k-ex-ell", text: x.w.title }), u.muted(x.a.title)]),
        u.tickBar(100 * x.w.r, 100 * x.target, x.w.r < 0.7 ? "alarm" : null), el("span", { class: "k-mono", text: u.pc(x.w.r) }), u.btn("Cram", "sm", function () { u.cramScope(x.a); })]));
    });
    left.appendChild(rc);
    left.appendChild(el("div", { class: "k-ex-pair" }, [dueCard(exams), rapidCard(exams)]));
    left.lastChild.classList.add("k-ex-fill");
    var lastPm = latestMarked();
    right.appendChild(lastPm ? postCard(lastPm) : u.card([u.chead("Latest post-mortem", ""), u.quiet("No marked paper yet.", ""), u.btn("Log a paper", "sm", function () { KOS.trackerLog({}, function () { KOS.rerender(); }); })], "", "exams.lastpm"));
    var chk = exams.slice(0, 2).map(function (a) { var items = X.checklist(a); return { a: a, n: items.length, d: items.filter(function (c) { return c.done; }).length, left: items.filter(function (c) { return !c.done && !c.auto; }) }; }).filter(function (x) { return x.n; });
    if (chk.length) right.appendChild(u.card([u.chead("Checklists", "the next " + (chk.length === 1 ? "one" : "two"))].concat(chk.map(function (x) {
      return el("div", { class: "k-ex-chkrow" }, [el("div", { class: "k-ex-inline" }, [el("span", { class: "k-ex-grow", text: x.a.title }), el("span", { class: "k-mono k-ex-muted", text: x.d + " of " + x.n })]), u.squares(x.n, x.d)]);
    })).concat(chk[0].left[0] ? [u.muted("Left for " + chk[0].a.title + ": " + chk[0].left.map(function (c) { return c.text.toLowerCase(); }).slice(0, 2).join(", "), "k-ex-block")] : []), "", "exams.checklists"));
    var nx = exams[0];
    right.appendChild(u.card([u.chead(X.daysTo(nx) === 0 ? "Today" : ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(nx.date + "T00:00:00").getDay()], nx.title),
      logistics(nx), el("div", { class: "k-ex-grow" }), u.btn(X.daysTo(nx) === 0 ? "Open the Exam Room" : "Open the Exam Room on the day", "sm", function () { KOS.show("exams", { id: nx.id, tab: "room" }); })], "k-ex-fill", "exams.logistics"));
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [left, right]));
  }
  function logistics(a) {
    var u = U(), dl = el("dl", { class: "k-ex-kvs" });
    function row(k, v) { if (!v) return; dl.appendChild(el("dt", { text: k })); dl.appendChild(el("dd", { text: v })); }
    row("Where", [a.location, a.seat ? "seat " + a.seat : ""].filter(Boolean).join(" · ") || "Add the room when you know it");
    row("Starts", a.time ? a.time + (a.durationMins ? " · " + u.mins(a.durationMins) : "") : "time not set");
    row("Calculator", a.calculator === "allowed" ? "Allowed · exam mode" : a.calculator === "none" ? "Not allowed" : "");
    var day = E().checklist(a).filter(function (c) { return c.group === "day"; });
    if (day.length) row("Bring", day.map(function (c) { return c.text; }).join(", "));
    return dl;
  }
  function dueCard(exams) {
    var u = U(), t = today(), per = exams.map(function (a) { return { a: a, n: KOS.examPlan.dueInScope(a, t) }; }).filter(function (x) { return x.n; });
    var total = 0, seen = {};
    exams.forEach(function (a) { E().leaves(a).forEach(function (k) { if (seen[k]) return; seen[k] = true; var p = KOS.spec.parse(k); if (p) KOS.srs.cardsFor(p.subject, p.ref).forEach(function (c) { var m = KOS.srs.peek(c.key); if (m && m.due && m.due <= t && !m.leech) total++; }); }); });
    var c = u.card([u.chead("Due reviews in scope", "today")], "k-ex-flexcard", "exams.due");
    if (!total) { c.appendChild(u.quiet("Nothing due in scope today.", "")); c.appendChild(u.btn("Cram the weakest instead", "sm", function () { u.cramScope(exams[0]); })); return c; }
    var max = Math.max.apply(null, per.map(function (x) { return x.n; }));
    c.appendChild(el("div", { class: "k-ex-bigfig-row" }, [el("span", { class: "k-ex-fig k-ex-fig--40", text: String(total) }), u.muted("cards · about " + Math.max(1, Math.round(total * 0.4)) + " min")]));
    per.slice(0, 3).forEach(function (x) { c.appendChild(el("div", { class: "k-ex-duerow" }, [el("span", { class: "k-ex-ell", text: x.a.title }), u.tickBar(100 * x.n / max, null, null), el("span", { class: "k-mono", text: String(x.n) })])); });
    c.appendChild(el("div", { class: "k-ex-grow" }));
    c.appendChild(u.btn("Start reviews", "primary sm", function () { KOS.show("due"); }));
    return c;
  }
  /* rapid recall: cards from the weakest leaves, one pass; a rating moves
     the card through FSRS and pays nothing (invariant 129) */
  function rapidCard(exams) {
    var u = U();
    var a = exams[0], rd = E().readiness(a), r = rd.signals.recall;
    var c = u.card([u.chead("Rapid recall", a.title + " · 10 quick ones")], "k-ex-flexcard", "exams.rapid");
    if (!rapid.keys || rapid.for !== a.id) {
      var pool = [];
      (r && !r.thin ? r.weakest : E().leaves(a).map(function (k) { return { key: k }; })).slice(0, 8).forEach(function (w) {
        var p = KOS.spec.parse(w.key);
        if (p) KOS.srs.cardsFor(p.subject, p.ref).filter(function (x) { return !x.redo; }).slice(0, 3).forEach(function (x) { pool.push(x); });
      });
      rapid = { for: a.id, keys: pool.slice(0, 10), i: 0, shown: false };
    }
    if (!rapid.keys.length) { c.appendChild(u.quiet("No flashcards in this scope yet.", "")); return c; }
    if (rapid.i >= rapid.keys.length) { c.appendChild(u.quiet("Done: " + rapid.keys.length + " of " + rapid.keys.length + ".", "")); c.appendChild(u.btn("Again", "sm", function () { rapid.keys = null; KOS.rerender(); })); return c; }
    var card = rapid.keys[rapid.i];
    var box = el("div", { class: "k-ex-rapid", "aria-live": "polite" }, [u.muted((rapid.i + 1) + " of " + rapid.keys.length), el("div", { class: "k-ex-rapidq", html: KOS.content.inline(card.q) }),
      rapid.shown ? el("div", { class: "k-ex-rapida", html: KOS.content.inline(card.a) }) : null,
      el("div", { class: "k-ex-actions" }, rapid.shown ? [u.btn("Got it", "sm", function () { KOS.srs.rate(card.key, 2); rapid.i++; rapid.shown = false; KOS.rerender(); }), u.btn("Not yet", "quiet sm", function () { KOS.srs.rate(card.key, 0); rapid.i++; rapid.shown = false; KOS.rerender(); })]
        : [u.btn("Show answer", "sm", function () { rapid.shown = true; KOS.rerender(); u.announce("Answer shown."); }), u.btn("Skip", "quiet sm", function () { rapid.i++; KOS.rerender(); })])].filter(Boolean));
    c.appendChild(box);
    if (KOS.content.typeset) KOS.content.typeset(box);
    c.appendChild(el("div", { class: "k-ex-grow" }));
    c.appendChild(el("p", { class: "k-ex-foot", text: "Your own flashcards from the weakest leaves. Never a past paper." }));
    return c;
  }
  function latestMarked() {
    var list = (KOS.tracker ? KOS.tracker.all() : []).filter(function (e) { return (e.questions || []).some(function (q) { return q.got != null; }); });
    return list.sort(function (x, y) { return x.date < y.date ? 1 : -1; })[0] || null;
  }
  function postCard(e) {
    var u = U(), pm = KOS.examStats.postMortem(e, E().nodeOf, null);
    return u.card([u.chead("Latest post-mortem", [e.paper || e.topic, u.pretty(e.date)].filter(Boolean).join(" · ")),
      el("div", { class: "k-ex-bigfig-row" }, [el("span", { class: "k-ex-fig k-ex-fig--32", text: String(e.marks != null ? e.marks : "—") }), u.muted("of " + (e.max || "?") + (e.predicted != null ? " · predicted " + e.predicted : ""))]),
      pm ? u.lossBars(pm.units.slice(0, 2).concat(pm.untagged ? [{ label: "untagged", marks: pm.untagged }] : []), Math.max(pm.untagged || 0, pm.units[0] ? pm.units[0].marks : 1)) : null,
      el("div", { class: "k-ex-grow" }),
      el("div", { class: "k-ex-actions" }, [u.btn("Open", "sm", function () { KOS.show("exams", { attempt: e.uid }); })])].filter(Boolean), "", "exams.lastpm");
  }

  /* ---------------- Results day (29ab) ---------------- */
  function results(main, series) {
    var u = U(), X = E();
    var reals = X.all().filter(function (a) { return a.tier === "real_exam" && a.date && a.date < today(); });
    var seriesList = [];
    reals.forEach(function (a) { var s = X.seriesOf(a); if (s && seriesList.indexOf(s) === -1) seriesList.push(s); });
    seriesList.sort().reverse();
    var cur = series && seriesList.indexOf(series) !== -1 ? series : seriesList[0];
    main.appendChild(KOS.ui.pageHeader({ kicker: "試 · Results", title: cur ? (cur.slice(5) === "06" ? "Summer " + cur.slice(0, 4) : u.MONTHS[+cur.slice(5) - 1] + " " + cur.slice(0, 4)) + " results" : "Results", className: "k-ex-head",
      sub: "One page for the series: the grade, what was predicted, and one line on why",
      actions: [u.btn("Log a result", "primary", function () { KOS.trackerLog({}, function () { KOS.rerender(); }); })] }));
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.results" });
    main.appendChild(wrap);
    if (!cur) { wrap.appendChild(KOS.ui.emptyState({ compact: true, mark: "試", title: "No series has been sat yet", body: "This page fills in after your real exams." })); return; }
    var mine = reals.filter(function (a) { return X.seriesOf(a) === cur; });
    var subs = {};
    mine.forEach(function (a) { var s = a.subject || "other"; (subs[s] = subs[s] || []).push(a); });
    var got = X.subjectResults(cur);
    var gc = u.card([u.chead("The grades", "against what the hub predicted before each paper")], "k-ex-flexcard", "exams.grades");
    ["maths", "compsci", "it"].filter(function (s) { return subs[s]; }).forEach(function (sid) {
      var list = subs[sid] || [];
      var preds = list.map(function (a) { return a.predictedAtExam; }).filter(Boolean);
      var G = KOS.examStats.GRADES;
      var lo = preds.length ? preds.reduce(function (m, p) { return G.indexOf(p.lo) > G.indexOf(m) ? p.lo : m; }, preds[0].lo) : null;
      var hi = preds.length ? preds.reduce(function (m, p) { return G.indexOf(p.hi) < G.indexOf(m) ? p.hi : m; }, preds[0].hi) : null;
      var res = got[sid];
      var papers = list.map(function (a) { return a.paper || a.title; }).filter(Boolean);
      var marksLine = list.filter(function (a) { return a.result && a.result.marks != null; }).map(function (a) { return (a.paper || a.title) + " " + a.result.marks; }).join(", ");
      var note = !res ? "Not entered." : lo ? (G.indexOf(res.grade) < G.indexOf(hi) ? "Above the range." : G.indexOf(res.grade) > G.indexOf(lo) ? "Below the range; a result, not a status." : "Inside the range.") + (marksLine ? " " + marksLine + "." : "") : marksLine ? marksLine + "." : "";
      var gradeSel = el("select", { class: "k-pill-select", "aria-label": "Grade for " + u.SUBJ[sid], "data-ui": "exams.grade-in", onchange: function () {
        X.setSubjectResult(cur, sid, gradeSel.value ? { grade: gradeSel.value } : null);
        u.announce(u.SUBJ[sid] + " " + (gradeSel.value || "cleared") + " logged." + (lo ? " Predicted " + lo + (hi !== lo ? " to " + hi : "") + "." : ""));
        KOS.rerender();
      } }, [el("option", { value: "", text: res ? "Clear" : "Log the grade" })].concat((sid === "it" ? ["D*", "D", "M", "P", "U"] : ["A*", "A", "B", "C", "D", "E", "U"]).map(function (g) { return el("option", { value: g, text: g }); })));
      gradeSel.value = res ? res.grade : "";
      gc.appendChild(el("div", { class: "k-ex-resrow", style: "--s: " + u.HUE[sid] }, [el("span", { class: "k-ex-vbar", "aria-hidden": "true" }),
        el("div", { class: "k-ex-grow" }, [el("div", { class: "k-ex-strong", text: u.SUBJ[sid] }), u.muted(papers.length ? u.plural(papers.length, "paper") : "")]),
        el("div", {}, [u.muted("predicted"), el("div", { class: "k-mono", text: lo ? lo + (hi !== lo ? "–" + hi : "") : "—" })]),
        res ? el("span", { class: "k-ex-fig k-ex-fig--34", text: res.grade }) : el("span"),
        el("div", { class: "k-ex-grow" }, [el("span", { class: "k-ex-small", text: note }), gradeSel])]));
    });
    var cal = KOS.examStats.calibration((KOS.tracker ? KOS.tracker.all() : []).map(function (e) { return { predicted: e.predicted, marks: e.marks, max: e.max, subject: e.subject }; }));
    gc.appendChild(el("div", { class: "k-ex-grow" }));
    gc.appendChild(el("div", { class: "k-ex-calline" }, [el("b", { text: "Calibration" }), el("span", { class: "k-ex-grow", text: cal.thin ? "Five predictions give a calibration line · " + cal.have + " so far." : "On your papers you " + (cal.gap > 1 ? "over-predict by about " + cal.gap + "%" : cal.gap < -1 ? "under-predict by about " + (-cal.gap) + "%" : "predict within a point") + "." }),
      u.linkBtn("Analytics →", function () { KOS.show("exams", { tab: "practice", sub: "analytics" }); })]));
    var side = el("div", { class: "k-ex-side" });
    /* IT: each unit's UMS from the slip and the aggregate, both from
       KOS.hub.it (invariant 26f) */
    var H = KOS.hub && KOS.hub.it ? KOS.hub.it : null;
    var rows = H ? H.units() : [], agg = H ? H.aggregate() : null;
    if (rows.length) {
      var c = u.card([u.chead("IT units · UMS", "from your results slip, else converted")], "k-ex-fill", "exams.itunits");
      rows.forEach(function (x) {
        c.appendChild(el("div", { class: "k-ex-unitum" }, [el("span", { class: "k-mono k-ex-muted", text: x.code }), el("span", { class: "k-ex-ell", text: x.title || "" }),
          el("span", { class: "k-mono", title: x.estimated ? "converted from the raw mark, an estimate" : null, text: x.ums != null ? x.ums + " / " + x.umsMax + (x.estimated ? " ≈" : "") : x.status === "sitting" ? "to sit" : "—" }),
          el("b", { text: x.grade || "" })]));
      });
      if (agg) {
        c.appendChild(el("div", { class: "k-ex-grow" }));
        c.appendChild(el("div", { class: "k-ex-aggrow" }, [el("b", { class: "k-ex-grow", text: "Aggregate · " + agg.name }), el("span", { class: "k-mono", text: agg.banked + " / " + agg.max }),
          agg.grade ? el("span", { class: "k-chip", "data-tone": "green", text: agg.grade }) : agg.soFar ? el("span", { class: "k-chip", "data-tone": "muted", text: agg.soFar + " so far" }) : null].filter(Boolean)));
        c.appendChild(u.muted("From the IT desk" + (agg.estimated ? "; a unit without a slip UMS is converted, an estimate" : "") + (agg.provisional ? "; boundaries provisional" : "") + ".", "k-ex-block"));
      }
      side.appendChild(c);
    } else side.appendChild(u.card([u.chead("IT units", ""), u.quiet("Unit marks live on the IT desk.", "")], "k-ex-fill"));
    wrap.appendChild(el("div", { class: "k-ex-grid2", "data-side": "wide" }, [gc, side]));
  }

  KOS.examViews = { readiness: readiness, planner: planner, season: season, results: results, trendChart: trendChart };
})();
