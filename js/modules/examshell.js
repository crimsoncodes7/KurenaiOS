/* Kurenai OS — modules/examshell.js · KOS.examShell
   Exams & Papers, reworked around one exam (docs/exams-rework-plan.md §3–§4,
   design turns 45–47; replaces the tool-organised hub of 29a–29ac).

     #/exams                         All exams (45a): the next exam with
                                     today's session, then every exam as a row
     #/exams/<tab>                   timetable · results · library · load
     #/exams/<id>[/<section>[/<sub>]]  one exam (45b): the header above a
                                     sidebar of eight sections
       today · plan · topics · revise[/<chapter>] · questions[/<set>]
       · papers · review[/<page>] · day
     Old routes redirect (D3): readiness → today, practice → review,
     guide and deep → revise; the hub's readiness, plan, season and
     practice → All exams.

   The sidebar is 216 px; at 1240 and below it lies flat as a strip under
   the header, at 860 and below it is one Sections button with a sheet,
   and on the phone (700) the exam is a list of its sections with one open
   at a time (45h, D5: Today, Topics, Revise, Cards and Review).

   Pages only READ (invariants 54, 129): a render writes nothing. A click
   writes through KOS.examSession, KOS.exams, KOS.rag or KOS.pacing.
   Kind and RAG are glyph and word; Behind and Red are the fixed --alarm
   with a mark and a word (invariant 26a).                               */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function E() { return KOS.exams; }
  function S() { return KOS.examSession; }
  function U() { return KOS.examUI; }
  function today() { return KOS.srs.todayISO(); }
  function announce(t) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(t); }
  function btn(t, k, f, x) { return U().btn(t, k, f, x); }
  function pct(v) { return Math.round(100 * v) + "%"; }
  var RAG = { r: ["▲", "Red", "danger"], a: ["◐", "Amber", "amber"], g: ["●", "Green", "green"] };
  var REDIRECT = { readiness: "today", overview: "today", practice: "review", guide: "revise", deep: "revise", trend: "review" };
  var PHONE = { today: 1, topics: 1, revise: 1, cards: 1, review: 1 };

  function mins(m) { return m ? U().mins(m) : ""; }
  function hm(m) { if (m == null) return ""; var h = Math.floor(m / 60), r = Math.round(m % 60); return h ? h + " h " + ("0" + r).slice(-2) : r + " min"; }

  /* ---------------- small parts ---------------- */
  function ragChip(t, onTap) {
    var x = RAG[t.rag];
    var b = el("button", { type: "button", class: "k-chip k-xs-rag", "data-ui": "exams.rag", "data-tone": x ? x[2] : "muted", "data-rag": t.rag || "none",
      "aria-label": "Confidence for " + t.title + ": " + (x ? x[1] : "not rated") + ". Change it.",
      onclick: function (e) { e.stopPropagation(); onTap(); } }, x ? [el("span", { "aria-hidden": "true", text: x[0] + " " }), x[1]] : [el("span", { "aria-hidden": "true", text: "○ " }), "Rate it"]);
    /* a long press clears (45d) */
    var timer = null;
    b.addEventListener("pointerdown", function () { timer = setTimeout(function () { timer = "fired"; S().clearRag(t); announce(t.title + " cleared."); KOS.rerender(); }, 650); });
    b.addEventListener("pointerup", function () { if (timer && timer !== "fired") clearTimeout(timer); });
    b.addEventListener("pointerleave", function () { if (timer && timer !== "fired") clearTimeout(timer); });
    b.addEventListener("click", function (e) { if (timer === "fired") { e.stopImmediatePropagation(); timer = null; } }, true);
    return b;
  }
  function bar(p, tone) {
    return el("span", { class: "k-xs-bar", "data-tone": tone || null, "aria-hidden": "true" }, [el("span", { style: "inline-size: " + Math.round(100 * Math.max(0, Math.min(1, p || 0))) + "%" })]);
  }
  /* a progress mark: a ring by fraction with its figure, ✓ done, a dash
     when there is no measure yet (45b) */
  function markEl(m) {
    if (!m) return el("span", { class: "k-xs-mark", "data-state": "none" }, [el("span", { class: "k-xs-markfig", text: "–" })]);
    if (m.of && m.n >= m.of) return el("span", { class: "k-xs-mark", "data-state": "done" }, [el("span", { class: "k-xs-markfig", text: m.n + "/" + m.of }), el("span", { class: "k-xs-tick", "aria-hidden": "true", text: "✓" })]);
    var p = m.of ? m.n / m.of : m.n ? 0.5 : 0;
    return el("span", { class: "k-xs-mark" }, [el("span", { class: "k-xs-markfig", text: m.fig || (m.of ? m.n + "/" + m.of : String(m.n)) }), tinyRing(p)]);
  }
  /* a 16 px ring by fraction: the track and the arc, nothing else */
  function tinyRing(p) {
    var NS = "http://www.w3.org/2000/svg", svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 16 16"); svg.setAttribute("aria-hidden", "true"); svg.setAttribute("class", "k-xs-ring");
    var c = 2 * Math.PI * 6;
    [["k-xs-ringtrack", null], ["k-xs-ringfill", p]].forEach(function (x) {
      if (x[1] === 0) return;
      var n = document.createElementNS(NS, "circle");
      n.setAttribute("class", x[0]); n.setAttribute("cx", "8"); n.setAttribute("cy", "8"); n.setAttribute("r", "6");
      if (x[1] != null) { n.setAttribute("stroke-dasharray", (c * Math.max(0.04, Math.min(1, x[1]))).toFixed(1) + " " + c.toFixed(1)); n.setAttribute("transform", "rotate(-90 8 8)"); }
      svg.appendChild(n);
    });
    return svg;
  }
  function markWords(m) { return !m ? "no measure yet" : m.of ? m.n + " of " + m.of : String(m.n); }
  function stateWord(a) {
    var X = E();
    if (a.tier !== "deadline" && !X.leaves(a).length) return ["Needs a scope", "amber", "!"];
    var rd = X.readiness(a);
    if (a.tier === "deadline") return rd && rd.milestones && rd.milestones.overdue.length ? ["Behind", "danger", "▼"] : rd && rd.milestones && rd.milestones.done ? ["Started", "muted", "◐"] : ["Not started", "muted", "○"];
    if (rd && rd.band && rd.band.band === "risk") return ["Behind", "danger", "▼"];
    if (rd && rd.band && (rd.band.band === "on" || rd.band.band === "ready")) return ["On track", "teal", "●"];
    var started = S().topics(a).some(function (t) { return t.last || t.rag; });
    return started ? ["Started", "muted", "◐"] : ["Not started", "muted", "○"];
  }
  function stateChip(a) { var w = stateWord(a); return el("span", { class: "k-chip", "data-ui": "exams.state", "data-tone": w[1] }, [el("span", { "aria-hidden": "true", text: w[2] + " " }), w[0]]); }
  function progressOf(a) {
    if (a.tier === "deadline") { var ms = a.milestones || []; return ms.length ? { n: ms.filter(function (m) { return m.done; }).length, of: ms.length, unit: "milestones" } : null; }
    var tops = S().topics(a);
    return tops.length ? { n: tops.filter(function (t) { return t.rag; }).length, of: tops.length, unit: a.subject === "maths" ? "chapters" : "topics" } : null;
  }

  /* ---------------- All exams (45a) ---------------- */
  var TABS = [["exams", "Exams"], ["timetable", "Timetable"], ["results", "Results"], ["library", "Library"], ["load", "Load"]];
  function hubHead(main, tab) {
    var acts = [
      btn("↓ Import timetable", "quiet", function () { U().importDialog(); }, { "data-ui": "exams.import" }),
      btn("＋ Log a result", "", function () { KOS.trackerLog({}, function () { KOS.rerender(); }); }, { "data-ui": "exams.log" }),
      btn("＋ New assessment", "primary", function () { KOS.examEditor(null, {}, function (a) { KOS.show("exams", { id: a.id, tab: "topics" }); }); }, { "data-ui": "exams.add" })];
    main.appendChild(KOS.ui.pageHeader({ kicker: "試 · Exams & Papers", title: "All exams", className: "k-ex-head", actions: acts }));
    var up = E().upcoming().filter(function (a) { return !a.archived; });
    var tabs = KOS.ui.tabs(TABS.map(function (t) {
      return { label: t[1], active: t[0] === tab, count: t[0] === "exams" ? up.length : null,
        onSelect: function () { if (t[0] !== tab) KOS.show("exams", t[0] === "exams" ? null : t[0]); } };
    }), { variant: "workspace", label: "Exams & Papers", edge: true });
    tabs.setAttribute("data-ui", (tabs.getAttribute("data-ui") || "") + " exams.tabs");
    main.appendChild(el("div", { class: "k-ex-tabsrow", "data-ui": "exams.tabsrow" }, [tabs]));
  }
  function stepRow(a, s, i, o) {
    o = o || {};
    var lead = s.done ? el("span", { class: "k-xs-stepn", "data-state": "done", "aria-hidden": "true", text: "✓" })
      : s.running ? el("span", { class: "k-xs-stepn", "data-state": "running", "aria-hidden": "true" })
      : el("span", { class: "k-xs-stepn", "aria-hidden": "true", text: String(i + 1) });
    var acts = s.done ? el("span", { class: "k-xs-done", text: "✓ Done" })
      : s.running && !o.compact ? el("span", { class: "k-xs-stepacts" }, [btn("Pause", "sm", function () { S().pause(a); announce("Paused."); KOS.rerender(); }, { "data-ui": "exams.step-pause" }),
        btn("Continue", "primary sm", function () { go(a, s); }, { "data-ui": "exams.step-continue" })])
      : btn("Start", (o.primary ? "primary " : "") + "sm", function () { S().start(a, s); go(a, s); }, { "data-ui": "exams.step-start", "aria-label": "Start: " + s.title });
    var row = el("div", { class: "k-xs-step", "data-ui": "exams.step", "data-kind": s.kind, "data-state": s.done ? "done" : s.running ? "running" : null }, [
      lead,
      el("div", { class: "k-xs-stepmain" }, [
        el("div", { class: "k-xs-steptitle" }, [el("span", { class: "k-xs-stepglyph", "aria-hidden": "true", text: s.glyph }), el("span", { text: s.title })]),
        el("div", { class: "k-xs-stepwhy", text: s.reason }),
        s.running && s.progress ? el("div", { class: "k-xs-stepprog" }, [el("span", { class: "k-mono", text: s.progress.n + " of " + s.progress.of }), s.progress.text ? el("span", { text: s.progress.text }) : null, bar(s.progress.n / s.progress.of, "crimson")].filter(Boolean)) : null
      ].filter(Boolean)),
      el("span", { class: "k-xs-stepmins k-mono", text: s.mins ? (s.mins >= 60 ? hm(s.mins) : s.mins + " min") : s.inPaper ? "in the paper" : "" }),
      acts]);
    return row;
  }
  /* a step opens where the work is done */
  function go(a, s) {
    var g = s.go || {};
    if (g.review) return KOS.show("review", { tab: "due", run: g.review });
    if (g.section) return KOS.show("exams", { id: a.id, tab: g.section, sub: g.sub || null });
  }
  function nextHero(a) {
    var td = S().today(a), days = E().daysTo(a), pg = progressOf(a), pr = a.preset ? E().preset(a.preset) : null;
    var steps = el("div", { class: "k-xs-steps", "data-ui": "exams.hero-steps" }, td.steps.map(function (s, i) { return stepRow(a, s, i, { compact: true }); }));
    return el("section", { class: "k-xs-hero", "data-ui": "exams.next", style: "--s: " + U().hueOf(a) }, [
      el("div", { class: "k-xs-herol" }, [
        el("span", { class: "k-ex-hero-mark", "aria-hidden": "true", lang: "ja", text: "試" }),
        el("div", { class: "k-ex-inline" }, [U().eyebrow("Next exam"), U().tierChip(a.tier, true)]),
        el("h2", { class: "k-xs-herotitle", text: a.title }),
        el("div", { class: "k-xs-herosub", text: [pr ? pr.board + " " + pr.paper : [a.board, a.paper].filter(Boolean).join(" "), KOS.spec.label ? null : null].filter(Boolean).join(" · ") + (a.subject && pr ? " · " + (KOS.spec.node(a.subject, (pr.include[0] || "").split(":")[1] || "") || {}).title : "").replace(/ · undefined$/, "") }),
        el("div", { class: "k-xs-herometa", text: [U().pretty(a.date), a.time, a.durationMins ? mins(a.durationMins) : null, a.marks ? a.marks + " marks" : null].filter(Boolean).join(" · ") }),
        el("span", { class: "k-ex-grow" }),
        el("div", { class: "k-xs-herodays" }, [el("b", { class: "k-mono", text: days === 0 ? "Today" : String(days) }), days ? U().muted(days === 1 ? "day left" : "days left") : null].filter(Boolean)),
        el("div", { class: "k-ex-inline" }, [stateChip(a), pg ? el("span", { class: "k-xs-prog" }, [el("span", {}, [el("b", { class: "k-mono", text: pg.n + " of " + pg.of }), " " + pg.unit]), bar(pg.n / pg.of)]) : null].filter(Boolean))
      ]),
      el("div", { class: "k-xs-heror" }, [
        el("div", { class: "k-xs-herohead" }, [el("b", { text: "Today's session" }),
          U().muted(td.steps.length ? td.steps.length + (td.steps.length === 1 ? " step" : " steps") + " · about " + hm(td.mins) : "nothing left"), el("span", { class: "k-ex-grow" }),
          td.paperDay ? U().muted("Paper day") : null].filter(Boolean)),
        td.steps.length ? steps : el("p", { class: "k-xs-quiet", text: E().leaves(a).length ? "Nothing left for today." : "Set the scope to plan today." }),
        el("div", { class: "k-ex-inline" }, [
          td.steps.length && td.done < td.steps.length ? btn("Start the session", "primary", function () {
            var s = td.steps.filter(function (x) { return !x.done; })[0]; S().start(a, s); go(a, s);
          }, { "data-ui": "exams.session-start" }) : null,
          btn("Open the exam", "quiet", function () { KOS.show("exams", a.id); }, { "data-ui": "exams.open" })].filter(Boolean))
      ])
    ]);
  }
  function upRow(a) {
    var days = E().daysTo(a), pg = progressOf(a), pr = a.preset ? E().preset(a.preset) : null;
    var meta = [a.subject ? U().SHORT[a.subject] : null, U().pretty(a.date), a.time, a.durationMins ? mins(a.durationMins) : null, a.marks ? a.marks + " marks" : null, a.location || null,
      a.tier === "deadline" ? "milestones" : null].filter(Boolean).join(" · ");
    var row = el("button", { type: "button", class: "k-xs-uprow", "data-ui": "exams.row", "data-id": a.id, style: "--s: " + U().hueOf(a),
      onclick: function () { KOS.show("exams", a.id); },
      onkeydown: function (e) {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        var rows = Array.prototype.slice.call(document.querySelectorAll("[data-ui~='exams.row']")), i = rows.indexOf(row);
        var nx = rows[i + (e.key === "ArrowDown" ? 1 : -1)];
        if (nx) { e.preventDefault(); nx.focus(); }
      } }, [
      U().dateBlock(a),
      el("span", { class: "k-ex-hbar", "aria-hidden": "true" }),
      el("span", { class: "k-xs-upmain" }, [
        el("span", { class: "k-ex-inline" }, [el("b", { class: "k-xs-uptitle", text: a.title }), U().tierChip(a.tier, true), a.provisional ? U().prov() : null].filter(Boolean)),
        el("span", { class: "k-ex-muted k-ex-ell", text: meta || (pr ? pr.title : "") })]),
      pg ? el("span", { class: "k-xs-upprog" }, [el("span", { class: "k-ex-muted" }, [el("b", { class: "k-mono", text: pg.n + " of " + pg.of }), " " + pg.unit]), bar(pg.n / pg.of)]) : el("span", { class: "k-xs-upprog" }),
      el("span", { class: "k-xs-upstate" }, [stateChip(a)]),
      U().daysLeftEl(days),
      el("span", { class: "k-xs-chev", "aria-hidden": "true", text: "›" })]);
    row.setAttribute("aria-label", a.title + ", " + U().TIER[a.tier][1] + (a.date ? ", " + U().pretty(a.date, { year: true }) + ", " + U().inDays(days) : "") + ", " + stateWord(a)[0]);
    return row;
  }
  function allExams(main) {
    hubHead(main, "exams");
    var up = E().upcoming().filter(function (a) { return !a.archived; });
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.all" });
    main.appendChild(wrap);
    if (!up.length) {
      wrap.appendChild(KOS.ui.emptyState({ mark: "試", title: "Add your first exam", body: "A mock, a real exam, a test or a deadline: each gets its own page with today's session.",
        action: el("div", { class: "k-ex-inline" }, [btn("＋ New assessment", "primary", function () { KOS.examEditor(null, {}, function (a) { KOS.show("exams", { id: a.id, tab: "topics" }); }); }),
          btn("↓ Import timetable", "", function () { U().importDialog(); })]) }));
      return;
    }
    var horizon = KOS.srs.addDays(today(), 60);
    var exam = up.filter(function (a) { return a.tier !== "deadline" && a.date <= horizon; })[0];
    if (exam) wrap.appendChild(nextHero(exam));
    var near = up.filter(function (a) { return a.date <= KOS.srs.addDays(today(), 120); }), far = up.slice(near.length);
    var box = el("section", { class: "k-card k-xs-upcoming", "data-ui": "exams.upcoming" }, [
      el("div", { class: "k-ex-chead" }, [el("span", { class: "k-ex-ctitle", text: "Upcoming" }), U().muted("in date order")])]);
    var month = null;
    near.forEach(function (a) {
      var m = a.date.slice(0, 7);
      if (m !== month) {
        month = m;
        var d = a.date.split("-"), label = U().MONTHS ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][+d[1] - 1] + (d[0] !== today().slice(0, 4) ? " " + d[0] : "") : m;
        var sub = near.filter(function (x) { return x.date.slice(0, 7) === m && x.tier === "mock"; }).length >= 2 ? "mock week" : "";
        box.appendChild(el("div", { class: "k-ex-month", "data-ui": "exams.month" }, [el("span", { class: "k-ex-monthname", text: label.toUpperCase() }), sub ? U().muted(sub) : null].filter(Boolean)));
      }
      box.appendChild(upRow(a));
    });
    if (far.length) {
      var shown = false, more = el("div", { class: "k-xs-far", hidden: true });
      far.forEach(function (a) { more.appendChild(upRow(a)); });
      var first = far[0], reals = far.filter(function (a) { return a.tier === "real_exam"; }).length;
      var t = btn("Show ›", "quiet sm", function () { shown = !shown; more.hidden = !shown; t.textContent = shown ? "Hide ‹" : "Show ›"; }, { "data-ui": "exams.far" });
      box.appendChild(el("div", { class: "k-xs-farrow" }, [el("span", { class: "k-mono k-ex-muted", text: U().pretty(first.date, { dow: false }).split(" ").slice(1).join(" ") }),
        el("span", { class: "k-ex-grow", text: far.length + (far.length === 1 ? " more" : " more") + (reals ? " · " + reals + " real " + (reals === 1 ? "exam" : "exams") : "") + (far.some(function (a) { return a.provisional; }) ? " · provisional" : "") }), t]));
      box.appendChild(more);
    }
    wrap.appendChild(box);
  }

  /* ---------------- one exam (45b) ---------------- */
  function head(main, a, o) {
    o = o || {};
    var days = E().daysTo(a), pr = a.preset ? E().preset(a.preset) : null;
    var pp = S().papersOf(a);
    var board = [pr ? pr.board + " " + pr.qual : [a.board, a.qual].filter(Boolean).join(" "),
      pp.length > 1 ? "Papers " + pp.map(function (p) { return S().paperShort(p).slice(1); }).join(" and ") : pr ? pr.paper : a.paper,
      a.subject === "it" && pr ? (KOS.spec.node("it", pr.itUnit || "") || {}).title : null,
      S().topics(a).length && pp.length > 1 ? S().topics(a).length + " topics" : null].filter(Boolean).join(" · ");
    var acts = o.actions || [
      a.tier !== "deadline" ? btn("Edit scope", "quiet", function () { KOS.examScopeSheet ? KOS.examScopeSheet(a) : KOS.show("exams", { id: a.id, tab: "scope" }); }, { "data-ui": "exams.scope-btn" }) : null,
      btn("＋ Log a result", "", function () { KOS.trackerLog({ assessmentId: a.id }, function () { KOS.rerender(); }); }, { "data-ui": "exams.log" })];
    main.appendChild(el("header", { class: "k-xs-head", "data-ui": "exams.ahead", style: "--s: " + U().hueOf(a) }, [
      el("div", { class: "k-xs-headl" }, [
        U().backLink("All exams", function () { KOS.show("exams"); }),
        el("div", { class: "k-xs-headmain" }, [
          el("div", { class: "k-ex-inline" }, [U().tierChip(a.tier, true), board ? U().muted(board) : null].filter(Boolean)),
          el("h1", { class: "k-xs-title", text: a.title }),
          el("div", { class: "k-xs-meta", text: [a.date ? U().pretty(a.date) : "No date yet", a.time, a.durationMins ? hm(a.durationMins).replace(" 00", "") : null,
            a.marks ? a.marks + " marks" : null, a.location || null].filter(Boolean).join(" · ") })])]),
      el("div", { class: "k-xs-headr" }, [el("div", { class: "k-ex-actions" }, acts.filter(Boolean)),
        days != null && days >= 0 ? el("div", { class: "k-xs-days" }, [el("b", { class: "k-mono", text: days === 0 ? "Today" : String(days) }), days ? U().muted(days === 1 ? "day left" : "days left") : null].filter(Boolean)) : null].filter(Boolean))
    ]));
  }
  function nav(a, cur, m, folded) {
    var list = el("nav", { class: "k-xs-nav", "data-ui": "exams.sections", "aria-label": "Sections of " + a.title, "data-folded": folded ? "" : null });
    S().SECTIONS.forEach(function (s) {
      var mk = m[s[0]];
      var b = el("button", { type: "button", class: "k-xs-navitem", "data-ui": "exams.section", "data-section": s[0], "data-phone": PHONE[s[0]] ? "" : null,
        "aria-current": cur === s[0] ? "page" : null, "aria-label": s[2] + ", " + markWords(mk),
        onclick: function () { if (cur !== s[0]) KOS.show("exams", { id: a.id, tab: s[0] }); },
        onkeydown: function (e) {
          if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          var items = Array.prototype.slice.call(list.querySelectorAll("[data-ui~='exams.section']")).filter(function (x) { return x.offsetParent !== null || !x.offsetParent; });
          var i = items.indexOf(b), nx = items[i + (e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1)];
          if (nx) { e.preventDefault(); nx.focus(); }
        } }, [
        el("span", { class: "k-xs-navglyph", lang: "ja", "aria-hidden": "true", text: s[1] }),
        el("span", { class: "k-xs-navlabel", text: s[2] }),
        markEl(mk)]);
      if (cur === s[0]) KOS.ui.state(b, "active", true);
      list.appendChild(b);
    });
    return list;
  }
  /* the portrait iPad's one Sections button and its sheet (45g) */
  function sectionsBtn(a, cur, m) {
    var s = S().SECTIONS.filter(function (x) { return x[0] === cur; })[0] || S().SECTIONS[0];
    return el("button", { type: "button", class: "k-btn k-xs-secbtn", "data-ui": "exams.sections-btn", "aria-haspopup": "dialog",
      onclick: function () {
        var body = el("div", { class: "k-xs-sheetlist" }, S().SECTIONS.map(function (x) {
          return el("button", { type: "button", class: "k-xs-sheetrow", "aria-current": x[0] === cur ? "page" : null, "data-ui": "exams.sheet-section",
            onclick: function () { KOS.ui.closeDialogs(); KOS.show("exams", { id: a.id, tab: x[0] }); announce(x[2] + "."); } }, [
            el("span", { class: "k-xs-navglyph", lang: "ja", "aria-hidden": "true", text: x[1] }), el("span", { class: "k-ex-grow", text: x[2] }), markEl(m[x[0]])]);
        }));
        KOS.examGuide.dialog(a.title, "項", [body], null, "exams.sheet", "sm");
        announce("Sections, 8. " + s[2] + ", current.");
      } }, [el("span", { class: "k-xs-navglyph", lang: "ja", "aria-hidden": "true", text: s[1] }), el("span", { text: s[2] }), markEl(m[s[0]]), el("span", { "aria-hidden": "true", text: " ▾" })]);
  }
  function examPage(main, id, tab, sub) {
    var a = E().get(id);
    if (!a) {
      main.appendChild(KOS.ui.pageHeader({ kicker: "Exams & Papers", title: "Not found" }));
      main.appendChild(KOS.ui.emptyState({ mark: "試", title: "That assessment is gone", body: "It may have been deleted on another device.",
        action: btn("Back to All exams", "", function () { KOS.show("exams"); }) }));
      return;
    }
    if (REDIRECT[tab]) {
      var to = REDIRECT[tab];
      var subTo = tab === "deep" && sub ? null : tab === "practice" && sub ? sub : null;
      if (tab === "deep" && sub && KOS.examDeepView) return KOS.examDeepView.page(main, a, sub);
      if (KOS.router && KOS.router.replaceArg) KOS.router.replaceArg("exams", { id: a.id, tab: to, sub: subTo });
      tab = to; sub = subTo;
    }
    if (tab === "room" && KOS.examRoom) return KOS.examRoom(main, a);
    if (tab === "scope") return KOS.examLegacyPage(main, id, "scope", sub);
    if (tab === "paper" && KOS.examGuide) return KOS.examGuide.page(main, a, "paper", sub);
    if (a.tier === "deadline" && !tab) return KOS.examLegacyPage(main, id, null, sub);
    var sec = tab || (E().leaves(a).length ? "today" : "topics");
    if (!S().SECTIONS.some(function (s) { return s[0] === sec; })) sec = "today";
    if (a.subject) main.style.setProperty("--accent", U().HUE[a.subject]);
    var m = S().marks(a);
    var folded = sec === "revise";
    head(main, a, sec === "revise" && KOS.examRevise ? { actions: KOS.examRevise.headActions(a) } : null);
    var body = el("div", { class: "k-xs-body", "data-ui": "exams.body", "data-section": sec, "data-folded": folded ? "" : null, style: "--s: " + U().hueOf(a) });
    main.appendChild(body);
    body.appendChild(sectionsBtn(a, sec, m));
    body.appendChild(nav(a, sec, m, folded));
    var content = el("section", { class: "k-xs-content", "data-ui": "exams.content exams.s-" + sec, "aria-labelledby": "k-xs-h2" });
    body.appendChild(content);
    /* the phone's own rows: Cards (a run over the scope) and the note
       that papers are sat on the iPad and Mac (45h, D5) */
    body.appendChild(el("button", { type: "button", class: "k-xs-navitem k-xs-phoneonly", "data-ui": "exams.cards-row", "data-section": "cards",
      onclick: function () { KOS.show("review", { tab: "due", run: "scope:" + a.id }); } }, [
      el("span", { class: "k-xs-navglyph", lang: "ja", "aria-hidden": "true", text: "札" }), el("span", { class: "k-xs-navlabel", text: "Cards" }),
      el("span", { class: "k-xs-markfig k-mono", text: (KOS.examPlan ? KOS.examPlan.dueInScope(a, today()) : 0) + " due" })]));
    body.appendChild(el("p", { class: "k-xs-phoneonly k-xs-phonenote", "data-section": "note" }, [el("span", { "aria-hidden": "true", text: "▤ " }), "Papers · on the iPad and Mac"]));
    var idx = S().SECTIONS.map(function (s) { return s[0]; }).indexOf(sec);
    content.style.setProperty("--k-xs-order", String(idx * 2 + 1));
    var F = SECTION[sec];
    F(content, a, sub);
  }

  function sectionHead(content, title, sub, right) {
    content.appendChild(el("div", { class: "k-xs-shead" }, [el("h2", { id: "k-xs-h2", class: "k-xs-h2", tabindex: "-1", text: title }), sub ? U().muted(sub) : null,
      el("span", { class: "k-ex-grow" })].concat(right || []).filter(Boolean)));
  }

  /* ---------------- Today (45c) ---------------- */
  function cell(label, main2, sub, action, go2) {
    var kids = [el("span", { class: "k-xs-celllabel", text: label })];
    if (action) kids.push(el("button", { type: "button", class: "k-link k-xs-cellact", text: action + " ›", onclick: go2 }));
    else kids.push(el("span", { class: "k-xs-cellfig" }, [el("b", { class: "k-mono", text: main2 }), sub ? el("span", { text: " " + sub }) : null].filter(Boolean)));
    return el("div", { class: "k-xs-cell", "data-ui": "exams.cell" }, kids);
  }
  function stripEl(a, st) {
    return el("div", { class: "k-xs-strip", "data-ui": "exams.strip" }, [
      cell("Coverage", st.coverage.n + "/" + st.coverage.of, "topics rated", null),
      st.recall.v != null ? cell("Recall", pct(st.recall.v), "target " + pct(st.recall.target)) : cell("Recall", null, null, st.recall.action, function () { KOS.show("review", { tab: "due", run: "scope:" + a.id }); }),
      st.practice.got != null ? cell("Practice", st.practice.got + "/" + st.practice.max, st.practice.sub) : cell("Practice", null, null, st.practice.action, function () { KOS.show("exams", { id: a.id, tab: "papers" }); }),
      st.calibration.v != null ? cell("Calibration", (st.calibration.v > 0 ? "+" : "") + st.calibration.v, st.calibration.sub) : cell("Calibration", null, null, st.calibration.action, function () { KOS.show("exams", { id: a.id, tab: "papers" }); })]);
  }
  function todaySec(content, a) {
    var td = S().today(a);
    var bits = [U().pretty(today()), td.paperDay ? "paper day" : null, td.steps.length ? td.done + " of " + td.steps.length + " done" : null].filter(Boolean).join(" · ");
    sectionHead(content, "Today", bits, [td.skipped ? btn("Undo skip", "quiet sm", function () { S().skip(a, false); KOS.rerender(); }, { "data-ui": "exams.skip" })
      : td.steps.length ? btn("Skip today", "quiet sm", function () { S().skip(a, true); announce("Today skipped for " + a.title + "."); KOS.rerender(); }, { "data-ui": "exams.skip" }) : null]);
    content.appendChild(stripEl(a, td.strip));
    if (!E().leaves(a).length) {
      content.appendChild(el("div", { class: "k-card k-xs-quietcard" }, [el("span", { text: "Set the scope to plan today." }),
        btn("Set the scope", "primary sm", function () { KOS.show("exams", { id: a.id, tab: "topics" }); })]));
      return;
    }
    if (td.skipped) { content.appendChild(el("div", { class: "k-card k-xs-quietcard", "data-ui": "exams.skipped" }, [el("span", { text: "Today is skipped. Tomorrow's session is computed afresh." })])); return; }
    if (!td.steps.length) {
      content.appendChild(el("div", { class: "k-card k-xs-quietcard", "data-ui": "exams.clear" }, [el("span", { text: "Nothing left for today." }),
        el("span", { class: "k-ex-grow" }), U().linkBtn("Questions", function () { KOS.show("exams", { id: a.id, tab: "questions" }); }),
        U().linkBtn("Papers", function () { KOS.show("exams", { id: a.id, tab: "papers" }); })]));
      return;
    }
    var firstOpen = td.steps.filter(function (s) { return !s.done && !s.running; })[0];
    var anyRun = td.steps.some(function (s) { return s.running; });
    content.appendChild(el("div", { class: "k-card k-xs-steps", "data-ui": "exams.steps" }, td.steps.map(function (s, i) { return stepRow(a, s, i, { primary: !anyRun && s === firstOpen }); })));
    /* the next three things, a line each (45c) */
    var cards = [];
    var rc = KOS.tracker && KOS.tracker.redoCards ? KOS.tracker.redoCards().filter(function (c) { return E().contains(a, c.sid, c.ref); }) : [];
    if (rc.length) cards.push(el("div", { class: "k-card k-xs-mini", "data-ui": "exams.mini" }, [el("div", { class: "k-ex-inline" }, [el("b", { text: "Redo item" }), U().muted(rc[0].q ? String(rc[0].q).slice(0, 12) : "")]),
      el("p", { class: "k-xs-minibody", text: String(rc[0].front || rc[0].prompt || "").slice(0, 140) || "From a marked paper" })]));
    var nxt = td.steps.filter(function (s) { return !s.done && !s.running; })[anyRun ? 0 : 1];
    if (nxt) cards.push(el("div", { class: "k-card k-xs-mini", "data-ui": "exams.mini" }, [el("div", { class: "k-ex-inline" }, [el("b", { text: "After this" }), U().muted("step " + (td.steps.indexOf(nxt) + 1))]),
      el("p", { class: "k-xs-minibody", text: nxt.title }), el("p", { class: "k-ex-muted", text: nxt.reason })]));
    var pp = S().papers(a), np = pp.board.filter(function (p) { return !p.last; })[0] || pp.built;
    var pd = td.paperDay ? today() : td.nextPaperDay;
    if (pd && np) cards.push(el("div", { class: "k-card k-xs-mini", "data-ui": "exams.mini" }, [el("div", { class: "k-ex-inline" }, [el("b", { text: "Paper " + np.n }), U().muted(pd === today() ? "today" : U().pretty(pd))]),
      el("p", { class: "k-xs-minibody", text: [np.org || np.title, np.marks ? np.marks + " marks" : null].filter(Boolean).join(" · ") }),
      el("p", { class: "k-ex-muted", text: "iPad or Mac, or print it" })]));
    if (cards.length) content.appendChild(el("div", { class: "k-xs-minis", "data-n": String(cards.length) }, cards));
  }

  /* ---------------- Topics (45d) ---------------- */
  function topicsSec(content, a) {
    var tops = S().topics(a), pp = S().papersOf(a), multi = pp.length > 1;
    var ui = KOS.store.state.ui, f = ui.examTopics && ui.examTopics[a.id] || {};
    var sort = f.sort || "weak", rag = f.rag || "all", paper = f.paper || "all";
    function setF(k, v) { var u = KOS.store.state.ui; u.examTopics = u.examTopics || {}; u.examTopics[a.id] = Object.assign({}, u.examTopics[a.id] || {}, (function () { var o = {}; o[k] = v; return o; })()); KOS.store.save(); KOS.rerender(); }
    var pr = a.preset ? E().preset(a.preset) : null;
    sectionHead(content, "Topics", tops.length ? tops.length + " in scope" + (pr ? " · " + pr.board + " " + pr.qual + (multi ? " Papers " + pp.map(function (p) { return S().paperShort(p).slice(1); }).join(" and ") : " " + pr.paper) : "") : "No scope yet",
      [btn("Edit scope", "quiet sm", function () { KOS.examScopeSheet ? KOS.examScopeSheet(a) : KOS.show("exams", { id: a.id, tab: "scope" }); }, { "data-ui": "exams.scope-edit" }),
        tops.length ? btn("Print the checklist", "quiet sm", function () { printChecklist(a, tops); }, { "data-ui": "exams.print-plc" }) : null]);
    if (!tops.length) {
      content.appendChild(el("div", { class: "k-card k-xs-quietcard" }, [el("span", { text: "Paste your topic list, or pick topics from the specification." }),
        btn("Paste your topic list", "primary sm", function () { KOS.examScopeSheet ? KOS.examScopeSheet(a, { mode: "paste" }) : KOS.show("exams", { id: a.id, tab: "scope" }); }, { "data-ui": "exams.scope-paste" })]));
      return;
    }
    var counts = { all: tops.length, r: 0, a: 0, g: 0, none: 0 };
    tops.forEach(function (t) { counts[t.rag || "none"]++; });
    var seg = function (items, label) { return KOS.ui.tabs(items, { variant: "card", label: label }); };
    content.appendChild(el("div", { class: "k-xs-filters", "data-ui": "exams.topic-filters" }, [
      seg([{ label: "Weakest first", active: sort === "weak", onSelect: function () { setF("sort", "weak"); announce("Sorted weakest first."); } },
        { label: "Spec order", active: sort === "spec", onSelect: function () { setF("sort", "spec"); announce("Sorted in specification order."); } }], "Sort"),
      seg([["all", "All"], ["r", "Red"], ["a", "Amber"], ["g", "Green"], ["none", "Unrated"]].filter(function (x) { return x[0] === "all" || counts[x[0]]; }).map(function (x) {
        return { label: x[1], count: counts[x[0]], active: rag === x[0], onSelect: function () { setF("rag", x[0]); } };
      }), "Confidence"),
      el("span", { class: "k-ex-grow" }),
      multi ? seg([{ label: "Both papers", active: paper === "all", onSelect: function () { setF("paper", "all"); } }].concat(pp.map(function (p) {
        return { label: S().paperShort(p), active: paper === p, onSelect: function () { setF("paper", p); } };
      })), "Paper") : null].filter(Boolean)));
    var rows = sort === "spec" ? tops.slice() : S().weakest(tops);
    rows = rows.filter(function (t) { return (rag === "all" || (t.rag || "none") === rag) && (paper === "all" || t.paper === paper); });
    var open = f.open || null;
    var table = el("div", { class: "k-card k-xs-plc", role: "table", "aria-label": "Topics", "data-ui": "exams.plc", "data-multi": multi ? "" : null }, [
      el("div", { class: "k-xs-plchead", role: "row" }, ["Topic", "", multi ? "Paper" : "", "Confidence", "Recall", "", "Best", "Practised"].map(function (h, i) { return el("span", { role: "columnheader", "data-col": String(i), text: h }); }))]);
    rows.forEach(function (t) {
      var isOpen = open === t.key;
      var r = el("div", { class: "k-xs-plcrow", role: "row", "data-ui": "exams.topic", "data-key": t.key, "data-state": isOpen ? "open" : null, tabindex: "0",
        "aria-expanded": String(isOpen),
        onclick: function () { setF("open", isOpen ? null : t.key); },
        onkeydown: function (e) {
          if (e.key === "Enter" || e.key === "ArrowRight") { e.preventDefault(); setF("open", isOpen ? null : t.key); }
          if (e.key === " ") { e.preventDefault(); var n = S().cycleRag(t); announce(t.title + " set to " + RAG[n][1] + "."); KOS.rerender(); }
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            var all = Array.prototype.slice.call(table.querySelectorAll("[data-ui~='exams.topic']")), i = all.indexOf(r), nx = all[i + (e.key === "ArrowDown" ? 1 : -1)];
            if (nx) { e.preventDefault(); nx.focus(); }
          }
        } }, [
        el("span", { class: "k-mono k-xs-plcref", role: "cell", text: t.short || t.ref }),
        el("span", { class: "k-xs-plcname", role: "cell", text: t.title }),
        el("span", { class: "k-mono k-ex-muted", role: "cell", text: multi ? S().paperShort(t.paper) || "" : "" }),
        el("span", { role: "cell" }, [ragChip(t, function () {
          var n = S().cycleRag(t);
          var c2 = { r: 0, a: 0, g: 0 }; S().topics(a).forEach(function (x) { if (x.rag) c2[x.rag]++; });
          announce(t.title + " set to " + RAG[n][1] + ". " + c2.r + " red, " + c2.a + " amber.");
          KOS.rerender();
        })]),
        el("span", { role: "cell", class: "k-xs-plcbar" }, [t.cards ? bar(t.recall || 0, t.rag === "r" ? "alarm" : t.rag === "a" ? "amber" : null) : U().muted("No cards")]),
        el("span", { role: "cell", class: "k-mono k-xs-plcpct", text: t.recall != null ? pct(t.recall) : "" }),
        el("span", { role: "cell", class: "k-mono", text: t.best ? t.best.got + "/" + t.best.max : "–" }),
        el("span", { role: "cell", class: "k-xs-plclast", "data-tone": t.last ? null : "alarm", text: t.last ? U().pretty(t.last, { dow: false }) : "Never" })]);
      table.appendChild(r);
      if (isOpen) {
        var qs = S().questions(a).filter(function (q) { return q.topic === t.key; });
        table.appendChild(el("div", { class: "k-xs-plcopen", "data-ui": "exams.topic-open" }, [
          btn("✎ Read the chapter", "sm", function () { KOS.show("exams", { id: a.id, tab: "revise", sub: "t:" + t.key }); }, { "data-ui": "exams.topic-read" }),
          qs.length ? btn("問 " + qs.length + (qs.length === 1 ? " question" : " questions") + " · " + t.tried + " tried", "sm", function () { KOS.show("exams", { id: a.id, tab: "questions", sub: "topic:" + t.key }); }, { "data-ui": "exams.topic-qs" }) : U().muted("No questions yet"),
          t.cards ? btn("↻ " + t.cards + " cards · " + t.due + " due", "sm", function () { KOS.show("ref", { subject: t.sid, ref: t.leaves.length === 1 ? KOS.spec.parse(t.leaves[0]).ref : t.ref, tab: "cards" }); }, { "data-ui": "exams.topic-cards" })
            : btn("Make cards", "sm", function () { KOS.show("ref", { subject: t.sid, ref: KOS.spec.parse(t.leaves[0]).ref, tab: "cards" }); }),
          el("span", { class: "k-ex-grow" }),
          t.best ? U().muted("Best " + t.best.got + "/" + t.best.max + (t.best.d ? ", " + U().pretty(t.best.d, { dow: false }) : "")) : null].filter(Boolean)));
      }
    });
    if (!rows.length) table.appendChild(el("p", { class: "k-xs-quiet", text: "No topics match these filters." }));
    content.appendChild(table);
  }
  /* the checklist as one A4 page, black on white (45d) */
  function printChecklist(a, tops) {
    var w = window.open("", "_blank");
    if (!w) { KOS.ui.toast("Allow pop-ups to print the checklist."); return; }
    var rows = tops.map(function (t) {
      return "<tr><td>" + KOS.ui.esc(t.ref) + "</td><td>" + KOS.ui.esc(t.title) + "</td><td>" + (t.rag === "r" ? "✓" : "") + "</td><td>" + (t.rag === "a" ? "✓" : "") + "</td><td>" + (t.rag === "g" ? "✓" : "") + "</td></tr>";
    }).join("");
    w.document.write("<!doctype html><meta charset='utf-8'><title>" + KOS.ui.esc(a.title) + " · checklist</title><style>body{font:12px system-ui;color:#000;margin:16mm}h1{font-size:16px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #000;padding:4px 6px;text-align:left}th:nth-child(n+3),td:nth-child(n+3){text-align:center;width:44px}@page{size:A4;margin:12mm}</style><h1>" +
      KOS.ui.esc(a.title) + " · Personal learning checklist</h1><table><tr><th>Ref</th><th>Topic</th><th>Red</th><th>Amber</th><th>Green</th></tr>" + rows + "</table>");
    w.document.close();
    w.focus();
    w.print();
  }

  /* ---------------- Plan (45f) ---------------- */
  function planSec(content, a) {
    var sch = S().schedule(a);
    var hours = sch.hours;
    var all = Math.round((E().weeklyHours().hours || 0) * 10) / 10;
    var field = el("select", { class: "k-input k-xs-hours", "data-ui": "exams.plan-hours", "aria-label": "Hours a week for " + a.title,
      onchange: function () { E().update(a.id, { planHours: Number(field.value) }); var s2 = S().schedule(E().get(a.id)); announce("Replanned: " + s2.sessions + " sessions, " + hm(s2.mins) + "."); KOS.rerender(); } },
      [1, 2, 3, 4, 5, 6, 8, 10, 12, 15].concat(hours && [1, 2, 3, 4, 5, 6, 8, 10, 12, 15].indexOf(hours) === -1 ? [hours] : []).sort(function (x, y) { return x - y; }).map(function (h) {
        return el("option", { value: String(h), selected: h === hours ? "" : null, text: h + " h a week" });
      }));
    sectionHead(content, "Plan", hours + " h a week for " + a.title + (all ? " · of your " + all + " h" : ""), [field,
      sch.sessions ? btn(sch.sent ? "Update the plan" : "Send to the plan", "primary sm", function () { send(a, sch); }, { "data-ui": "exams.plan-send" }) : null]);
    if (!a.date || !E().leaves(a).length) {
      content.appendChild(el("div", { class: "k-card k-xs-quietcard" }, [el("span", { text: a.date ? "Set the scope to plan." : "Give it a date to plan." }),
        btn(a.date ? "Set the scope" : "Edit", "primary sm", function () { a.date ? KOS.show("exams", { id: a.id, tab: "topics" }) : KOS.examEditor(a, {}, function () { KOS.rerender(); }); })]));
      return;
    }
    var n = sch.days.length - 1;
    var stripBox = el("div", { class: "k-card k-xs-planstrip", "data-ui": "exams.plan-strip" }, [
      el("div", { class: "k-ex-inline" }, [el("b", { text: n + (n === 1 ? " day" : " days") }), U().muted("to " + U().pretty(a.date) + " · " + sch.sessions + " sessions placed · " + sch.paperDays + (sch.paperDays === 1 ? " paper day" : " paper days")),
        el("span", { class: "k-ex-grow" }), U().muted("▤ Paper · ● Topic · ↻ Cards")])]);
    var grid = el("div", { class: "k-xs-daygrid", role: "grid", "aria-label": "The days to the exam", "data-short": n < 7 ? "" : null });
    sch.days.forEach(function (d, i) {
      var dt = new Date(d.date + "T00:00:00"), dow = dt.getDay();
      var marks2 = d.exam ? "試" : d.items.map(function (it) { return it.kind === "paper" ? "▤" : it.kind === "cards" ? "↻" : it.kind === "topic" ? "●" : "·"; }).join("");
      grid.appendChild(el("button", { type: "button", class: "k-xs-day", role: "gridcell", "data-ui": "exams.plan-day",
        "data-state": d.exam ? "exam" : i === 0 ? "today" : null, "data-weekend": dow === 0 || dow === 6 ? "" : null,
        title: d.items.map(function (it) { return it.title + " · " + it.mins + " min"; }).join("\n") || null,
        "aria-label": U().pretty(d.date) + (d.exam ? ", the exam" : d.items.length ? ", " + d.items.map(function (it) { return it.title; }).join(", ") : ", nothing placed"),
        onkeydown: function (e) {
          if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
          var all2 = Array.prototype.slice.call(grid.children), j = all2.indexOf(e.currentTarget), nx = all2[j + (e.key === "ArrowRight" ? 1 : -1)];
          if (nx) { e.preventDefault(); nx.focus(); }
        } }, [
        el("span", { class: "k-xs-dow", text: "SMTWTFS".charAt(dow) }), el("b", { class: "k-mono", text: String(dt.getDate()) }),
        el("span", { class: "k-xs-daymarks", "aria-hidden": "true", text: marks2 })]));
    });
    stripBox.appendChild(el("div", { class: "k-xs-dayscroll" }, [grid]));
    content.appendChild(stripBox);
    var weeks = el("div", { class: "k-xs-weeks", "data-ui": "exams.plan-weeks", "data-n": String(Math.min(4, sch.weeks.length)) });
    sch.weeks.forEach(function (w) {
      var items = [];
      w.days.forEach(function (d) { d.items.forEach(function (it) { items.push([d, it]); }); });
      if (!items.length) return;
      weeks.appendChild(el("div", { class: "k-card k-xs-week", "data-ui": "exams.plan-week" }, [
        el("div", { class: "k-ex-inline" }, [el("b", { text: "Week of " + U().pretty(w.wb, { dow: false }) }), el("span", { class: "k-ex-grow" }), el("span", { class: "k-mono k-ex-muted", text: hm(w.mins) })])]
        .concat(items.map(function (x) {
          var d = x[0], it = x[1];
          return el("button", { type: "button", class: "k-xs-weekrow", "data-today": d.date === today() ? "" : null, onclick: function () { go(a, it); } }, [
            el("span", { class: "k-mono k-xs-weekday", text: U().pretty(d.date, { dow: true }).split(" ").slice(0, 2).join(" ") }),
            el("span", { class: "k-xs-stepglyph", "aria-hidden": "true", text: it.glyph }),
            el("span", { class: "k-ex-ell k-ex-grow", text: it.title }),
            el("span", { class: "k-mono k-ex-muted", text: it.mins >= 60 ? hm(it.mins) : it.mins + " m" })]);
        }))));
    });
    content.appendChild(weeks);
    var st = sch.sent;
    content.appendChild(el("div", { class: "k-card k-xs-note", "data-ui": "exams.plan-state" }, [el("span", { "aria-hidden": "true", text: "→" }),
      el("span", { class: "k-ex-grow" }, st ? ["In your plan", st.at ? " · sent " + U().pretty(new Date(st.at).toISOString().slice(0, 10)) : "", " · " + st.n + " rows, " + st.done + " done"]
        : ["Not in your plan yet · ", el("b", { text: sch.sessions + " sessions, " + hm(sch.mins) }), " · weakest topics first, papers on " + ["Sundays", "Mondays", "Tuesdays", "Wednesdays", "Thursdays", "Fridays", "Saturdays"][a.date ? new Date(a.date + "T00:00:00").getDay() : 6]])]));
  }
  function send(a, sch) {
    var lines = sch.sessions + " sessions, " + hm(sch.mins) + ", go into your weekly plan as personal rows tagged with this exam. Nothing goes on the Calendar.";
    KOS.ui.confirmModal({ title: "Send to the plan?", body: lines, ok: "Send " + sch.sessions + " sessions" }, function (yes) {
      if (!yes) return;
      var r = S().sendSchedule(a, sch);
      announce(r.added + " sessions added to your plan." + (r.skipped ? " " + r.skipped + " fell outside your Pacing weeks." : ""));
      KOS.rerender();
    });
  }

  /* ---------------- Papers (47a) ---------------- */
  function paperRow(a, p, glyph, chip, last) {
    var lt = last ? (last.marks != null && last.max ? last.marks + "/" + last.max : "Sat") : null;
    return el("div", { class: "k-xs-paper", "data-ui": "exams.paper-row", "data-n": String(p.n) }, [
      el("span", { class: "k-xs-paperg", lang: "ja", "aria-hidden": "true", text: glyph }),
      el("div", { class: "k-xs-papermain" }, [el("b", { text: p.title }),
        el("div", { class: "k-ex-inline" }, [chip, p.kind === "board" ? U().muted("✎ by KurenaiOS") : null].filter(Boolean)),
        p.blurb ? U().muted(p.blurb) : null].filter(Boolean)),
      el("span", { class: "k-mono", text: p.marks ? String(p.marks) : "" }),
      el("span", { class: "k-mono", text: p.mins ? hm(p.mins).replace(" 00", "") : "" }),
      el("span", { class: "k-xs-paperlast" }, lt ? [el("b", { class: "k-mono", text: lt }), U().muted(U().pretty(last.date) + (last.timed ? " · timed" : " · untimed"))] : [U().muted("Not sat")]),
      el("span", { class: "k-ex-inline" }, [
        btn("Sit", "sm", function () { KOS.show("exams", { id: a.id, tab: "paper", sub: String(p.n) }); }, { "data-ui": "exams.paper-sit", "aria-label": "Sit " + p.title }),
        btn("Print", "quiet sm", function () { KOS.show("exams", { id: a.id, tab: "paper", sub: String(p.n) }); setTimeout(function () { window.print(); }, 400); }, { "data-ui": "exams.paper-print" }),
        btn("Log marks", "quiet sm", function () {
          /* a printed or teacher-marked sitting: the paper's own tally, mark
             point by mark point, logged as ONE attempt (invariant 124) */
          if (KOS.examPaperView && KOS.examPaper) KOS.examPaperView.tally(a, KOS.examPaper.build(a, p.n), { timed: false });
          else KOS.trackerLog({ assessmentId: a.id }, function () { KOS.rerender(); });
        }, { "data-ui": "exams.paper-log" })])]);
  }
  function papersSec(content, a) {
    var pp = S().papers(a), pr = a.preset ? E().preset(a.preset) : null;
    sectionHead(content, "Papers", pp.sat + " of " + (pp.board.length + 1) + " sat" + (a.durationMins ? " · " + hm(a.durationMins).replace(" 00", "") + " each" : ""));
    if (pp.board.length) content.appendChild(el("section", { class: "k-card k-xs-papers", "data-ui": "exams.papers-board" }, [
      el("div", { class: "k-ex-chead" }, [el("span", { class: "k-ex-ctitle", text: "Board style" }), U().muted([pr ? pr.board + " " + pr.paper : null, pp.board[0].format === "ocr-case" ? "one organisation a paper" : null].filter(Boolean).join(" · "))])]
      .concat(pp.board.map(function (p) { return paperRow(a, p, "紙", el("span", { class: "k-chip", "data-tone": "muted", text: (p.board || (pr && pr.board) || "Board") + " style" }), p.last); }))));
    content.appendChild(el("section", { class: "k-card k-xs-papers", "data-ui": "exams.papers-built" }, [
      el("div", { class: "k-ex-chead" }, [el("span", { class: "k-ex-ctitle", text: "From your scope" }), U().muted("the exam's time and topics")]),
      paperRow(a, Object.assign({}, pp.built, { blurb: "Weakest topics weighted · short to long · new each time" }), "組", el("span", { class: "k-chip", "data-tone": "muted", text: "Custom" }), pp.built.last)]));
    var past = KOS.examPapers && pr && pr.index ? null : null;
    if (pr && pr.index) content.appendChild(el("section", { class: "k-card k-xs-papers", "data-ui": "exams.papers-past" }, [
      el("div", { class: "k-ex-chead" }, [el("span", { class: "k-ex-ctitle", text: "Past papers" }), U().muted("from the Library"), el("span", { class: "k-ex-grow" }),
        U().linkBtn("Open the Library ›", function () { KOS.show("exams", "library"); })])].concat(past ? [] : [])));
  }

  /* ---------------- On the day ---------------- */
  function daySec(content, a) {
    var list = E().checklist(a);
    var night = list.filter(function (c) { return c.group === "night"; }), day = list.filter(function (c) { return c.group === "day"; });
    sectionHead(content, "On the day", [a.date ? U().pretty(a.date) : null, a.time, a.location, a.seat ? "seat " + a.seat : null].filter(Boolean).join(" · ") || "Add the room and time",
      [btn("Edit", "quiet sm", function () { KOS.examEditor(a, {}, function () { KOS.rerender(); }); }), btn("Open the Exam Room", "primary sm", function () { KOS.show("exams", { id: a.id, tab: "room" }); }, { "data-ui": "exams.room-btn" })]);
    function box(title, items, sub) {
      return el("section", { class: "k-card k-xs-check", "data-ui": "exams.check" }, [el("div", { class: "k-ex-chead" }, [el("span", { class: "k-ex-ctitle", text: title }),
        U().muted(items.filter(function (c) { return c.done; }).length + " of " + items.length + (sub ? " · " + sub : ""))])].concat(items.map(function (c) {
        var id = "k-xs-ck-" + c.id.replace(/[^a-z0-9]/gi, "");
        var input = el("input", { type: "checkbox", id: id, checked: c.done ? "" : null, disabled: c.auto ? "" : null,
          onchange: function () { E().tickCheck(a.id, c.id, input.checked); KOS.rerender(); } });
        return el("label", { class: "k-xs-checkrow", for: id, "data-state": c.done ? "done" : null, title: c.why || null }, [input, el("span", { text: c.text })]);
      })));
    }
    content.appendChild(el("div", { class: "k-xs-two" }, [night.length ? box("The night before", night, "ticks sync") : null, day.length ? box("Before you go in", day) : null].filter(Boolean)));
  }

  /* sections drawn elsewhere register themselves; until then each says
     where the work lives */
  function later(name, legacy) {
    return function (content, a) {
      sectionHead(content, name, null);
      content.appendChild(el("div", { class: "k-card k-xs-quietcard" }, [el("span", { text: name + " is on its way." }), legacy ? btn("Open the current page", "sm", function () { legacy(a); }) : null].filter(Boolean)));
    };
  }
  var SECTION = {
    today: todaySec, plan: planSec, topics: topicsSec, papers: papersSec, day: daySec,
    revise: function (c, a, sub) { return KOS.examRevise ? KOS.examRevise.page(c, a, sub) : later("Revise")(c, a); },
    questions: function (c, a, sub) { return KOS.examQuestions ? KOS.examQuestions.page(c, a, sub) : later("Questions")(c, a); },
    review: function (c, a, sub) { return KOS.examReview ? KOS.examReview.page(c, a, sub) : later("Review", function (x) { KOS.show("exams", { tab: "practice" }); })(c, a); }
  };

  KOS.examShell = {
    allExams: allExams, hubHead: hubHead, examPage: examPage, head: head, sectionHead: sectionHead, stepRow: stepRow, go: go,
    ragChip: ragChip, bar: bar, markEl: markEl, stateWord: stateWord, hm: hm, register: function (id, fn) { SECTION[id] = fn; }
  };
})();
