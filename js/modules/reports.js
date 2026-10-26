/* Kurenai OS — modules/reports.js
   Reports (roadmap 5.1, design turns 24–25): the page under Home.

     #/reports[/<period>]               the Reports page (24a): the chosen
                                        report on the left (its words,
                                        three facts, the activity chart),
                                        Earlier reports on the right
     #/reports/week/<start>             one report (25a): the story hero
                                        (headline only — the narrative
                                        lives on the Reports page and in
                                        the story), eight facts in a row,
                                        Study · Focus · the plan, the
                                        Collection, Governor & Kurenai
     #/reports/week/<start>/<section>   its full overview, inside Reports
                                        (25b Collection, 25c Study,
                                        25d Focus and the plan)

   A report is READ, never built here: the facts were saved when the week
   ended (core/reportstore.js) and this page only draws them, so selecting
   a past report swaps the view and recomputes nothing (README rule 7). A
   render writes nothing (invariant 102, smoke56); the only writes are a
   click's — "Add to plan" adds a plan row.

   Layout rules (review after release): no empty column and no dead space.
   A grid row's last card widens to close the row (`pack`), charts are
   drawn at their container's width (`fluid`), and of two side-by-side
   columns the shorter one rides along while the longer scrolls
   (`rideAlong`). */
(function () {
  "use strict";
  var el = KOS.ui.el, W = KOS.reportWords;

  var SUBJ_HUE = { compsci: "var(--cs)", maths: "var(--maths)", it: "var(--it)" };
  var MOD_HUE = { anime: "var(--anime)", books: "var(--books)", vn: "var(--vn)", game: "var(--games)" };
  var MOD_SHORT = { anime: "Anime", books: "Books", vn: "VNs", game: "Games" };
  var MODULES = ["anime", "books", "vn", "game"];
  var SUBJECTS = ["compsci", "maths", "it"];
  var BAND = { r: "Red", a: "Amber", g: "Green" };
  var DOW = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var SECTIONS = { study: "Study", focus: "Focus and plan", collection: "Collection" };
  var FLOW_LABEL = { compsci: "CS", maths: "Maths", it: "IT", cards: "Flashcards", quiz: "Quiz" };
  var AREA_LABEL = { study: "Study", planner: "Plan", collection: "Collection", governor: "Governor", archive: "Archive" };
  var SEAL = { week: "週", month: "月", term: "期", year: "年" };
  var HEAT_FROM = 7;

  /* per-visit view state (never saved: a filter is not data) */
  var view = { selected: null, coll: { module: "all", layout: "covers", sort: "time", all: false }, activity: "time" };

  /* ---------------- dates ---------------- */
  function parse(s) { var p = String(s).split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function dm(s) { var d = parse(s); return d.getDate() + " " + MONTHS[d.getMonth()]; }
  function range(start, end, year) {
    var a = parse(start), b = parse(end);
    var y = year ? " " + b.getFullYear() : "";
    return a.getMonth() === b.getMonth()
      ? a.getDate() + " – " + b.getDate() + " " + MONTHS[b.getMonth()] + y
      : dm(start) + " – " + dm(end) + y;
  }
  function longRange(start, end) {
    var a = parse(start), b = parse(end);
    if (days(start, end) === 6) return DOW[0] + " " + a.getDate() + (a.getMonth() === b.getMonth() ? "" : " " + MONTHS[a.getMonth()]) + " – " + DOW[6] + " " + dm(end);
    return a.getDate() + " " + MONTHS[a.getMonth()] + (a.getFullYear() !== b.getFullYear() ? " " + a.getFullYear() : "") + " – " + b.getDate() + " " + MONTHS[b.getMonth()];
  }
  function days(a, b) { return Math.round((parse(b) - parse(a)) / 864e5); }
  var MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var PERIODS = [["week", "Weekly"], ["month", "Monthly"], ["term", "Termly"], ["year", "Yearly"]];
  var PERIOD_KICKER = { week: "Weekly report", month: "Monthly report", term: "Termly report", year: "Yearly report" };
  /* what a report is called: "Week of 5 Oct", "September 2026", the
     term's name, "2025–26" */
  function weekOf(rep) {
    if (rep.period === "month") { var d = parse(rep.start); return MONTH_LONG[d.getMonth()] + " " + d.getFullYear(); }
    if (rep.period === "term") return (rep.facts && rep.facts.label) || "Term from " + dm(rep.start);
    if (rep.period === "year") return (rep.facts && rep.facts.label) || parse(rep.start).getFullYear() + "–" + String(parse(rep.start).getFullYear() + 1).slice(2);
    return "Week of " + dm(rep.start);
  }
  /* the kicker's span: "Mon 5 – Sun 11 Oct 2026", "September 2026" */
  function spanOf(rep) {
    if (rep.period === "week") return longRange(rep.start, rep.end) + " " + parse(rep.end).getFullYear();
    if (rep.period === "term") return weekOf(rep) + " · " + longRange(rep.start, rep.end);
    if (rep.period === "year") return MONTHS[parse(rep.start).getMonth()] + " " + parse(rep.start).getFullYear() + " – " + MONTHS[parse(rep.end).getMonth()] + " " + parse(rep.end).getFullYear();
    return weekOf(rep);
  }
  function clock(ts) { var d = new Date(ts); return (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes(); }
  function dayName(ts) { var d = new Date(ts); return DOW[(d.getDay() + 6) % 7]; }
  function saved(rep) {
    var d = new Date(rep.savedAt);
    return "Saved " + dayName(rep.savedAt) + " " + d.getDate() + " " + MONTHS[d.getMonth()] + " · " + clock(rep.savedAt);
  }
  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------------- small parts ---------------- */
  function mono(text, cls) { return el("span", { class: "k-mono" + (cls ? " " + cls : ""), text: text }); }
  function dot(hue) { return el("span", { class: "k-rp-dot", "aria-hidden": "true", style: "--c: " + hue }); }
  function more(label, go, name) {
    return el("button", { type: "button", class: "k-rp-more", "data-ui": "reports.overview-link", text: label || "Full overview ›",
      "aria-label": name ? "Full overview: " + name : null, onclick: go });
  }
  function cardHead(title, opts) {
    opts = opts || {};
    return el("div", { class: "k-rp-card-head" }, [
      el("h2", { class: "k-rp-card-title", text: title }),
      opts.meta ? el("span", { class: "k-rp-card-meta", text: opts.meta }) : null,
      opts.right || null,
      opts.go ? more(null, opts.go, title) : null
    ].filter(Boolean));
  }
  function card(title, opts, children) {
    opts = opts || {};
    return el("section", { class: "k-rp-card" + (opts.className ? " " + opts.className : ""), "data-ui": "reports.card" + (opts.hook ? " " + opts.hook : ""),
      "aria-label": title }, [cardHead(title, opts)].concat((children || []).filter(Boolean)));
  }
  /* a stat tile: label, the value (an optional unit after it), a line,
     and a comparison chip (README rule 5) */
  function tile(label, value, sub, cmp, unit) {
    if (value == null || value === "") return null;
    return el("div", { class: "k-rp-tile", "data-ui": "ui.stat" }, [
      el("span", { class: "k-rp-tile-l", "data-ui": "part.label", text: label }),
      el("span", { class: "k-rp-tile-v" }, [mono(String(value), "k-rp-tile-n"), unit ? mono(unit, "k-rp-tile-u") : null].filter(Boolean)),
      sub ? el("span", { class: "k-rp-tile-s", text: sub }) : null,
      cmp ? el("span", { class: "k-rp-cmp", "data-tone": cmp.dir === "up" || cmp.dir === "new" ? "up" : null, text: cmp.text }) : null
    ].filter(Boolean));
  }
  function tiles(list) {
    return el("div", { class: "k-rp-tiles", "data-ui": "reports.tiles" }, list.filter(Boolean));
  }
  /* the breadcrumb row, with the page's actions at its end (25b) */
  function crumbs(parts, actions) {
    var nav = el("nav", { class: "k-rp-crumbs", "aria-label": "Breadcrumb" });
    parts.forEach(function (p, i) {
      if (i) nav.appendChild(el("span", { class: "k-rp-crumb-sep", "aria-hidden": "true", text: "›" }));
      nav.appendChild(p.go
        ? el("button", { type: "button", class: "k-rp-crumb", "data-ui": "reports.crumb", text: p.label, onclick: p.go })
        : el("span", { class: "k-rp-crumb", "aria-current": "page", text: p.label }));
    });
    return el("div", { class: "k-rp-crumbbar" }, [nav, actions && actions.length ? el("div", { class: "k-rp-actions" }, actions) : null].filter(Boolean));
  }
  function open(rep, section) {
    KOS.show("reports", { period: rep.period, start: rep.start, section: section || null });
  }
  function openTopic(key) {
    var i = key.indexOf(":");
    if (i > 0) KOS.show("ref", { subject: key.slice(0, i), ref: key.slice(i + 1) });
  }
  /* a rebuilt report says so wherever its words do */
  function rebuiltChip(rep) {
    return rep.rebuilt ? el("span", { class: "k-chip k-rp-rebuilt", "data-ui": "reports.rebuilt",
      title: "Built after the " + rep.period + " from the session history: status moves, title progress and some earnings were not recorded then.",
      text: "Rebuilt from history" }) : null;
  }

  /* ---------------- layout helpers ---------------- */
  /* a chart drawn at its container's width and redrawn when that changes,
     so an SVG never sits at half a card's width with its text scaled */
  function fluid(build, fallback) {
    var box = el("div", { class: "k-rp-fluid" }), drawn = 0;
    function draw(w) {
      w = Math.max(220, Math.round(w));
      if (Math.abs(w - drawn) < 6) return;
      drawn = w;
      box.textContent = "";
      box.appendChild(build(w));
    }
    draw(fallback || 560);
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function (entries) {
        if (!box.isConnected) { ro.disconnect(); return; }
        var w = entries[0].contentRect.width;
        if (w > 0) draw(w);
      });
      ro.observe(box);
    }
    return box;
  }
  /* close every grid row: an item that would not fit starts a new row and
     the row it leaves widens its last card over the gap. Spans for three
     columns (desktop) and two (from 1080), read by --span3 / --span2. */
  function pack(items) {
    function run(cols, prop) {
      var row = [], used = 0;
      function close() {
        if (row.length && used < cols) row[row.length - 1].s += cols - used;
        row.forEach(function (it) { it.node.style.setProperty(prop, String(Math.min(cols, it.s))); });
        row = []; used = 0;
      }
      items.forEach(function (it) {
        var s = Math.min(cols, it.span || 1);
        if (used + s > cols) close();
        row.push({ node: it.node, s: s }); used += s;
      });
      close();
    }
    items = items.filter(function (it) { return it && it.node; });
    run(3, "--span3"); run(2, "--span2");
    return items.map(function (it) { return it.node; });
  }
  /* two columns side by side: the shorter rides along (sticky) while the
     longer scrolls, so it never leaves a field of empty page under it. A
     column taller than the screen sticks by its bottom edge. */
  function rideAlong(a, b) {
    function fit() {
      if (!a.isConnected) { if (ro) ro.disconnect(); return; }
      [a, b].forEach(function (x) { KOS.ui.state(x, "ride", false); });
      if (Math.abs(a.offsetTop - b.offsetTop) > 4 || a.offsetLeft === b.offsetLeft) return;   // stacked
      var short = a.offsetHeight <= b.offsetHeight ? a : b, long = short === a ? b : a;
      if (long.offsetHeight - short.offsetHeight < 120) return;
      var stage = document.getElementById("stage");
      var vh = stage && stage.clientHeight ? stage.clientHeight : window.innerHeight;
      short.style.setProperty("--rp-ride", Math.min(16, vh - short.offsetHeight - 16) + "px");
      KOS.ui.state(short, "ride", true);
    }
    var ro = window.ResizeObserver ? new ResizeObserver(function () { fit(); }) : null;
    if (ro) { ro.observe(a); ro.observe(b); }
    else (window.requestAnimationFrame || setTimeout)(fit);
  }
  /* cards of uneven height in balanced columns: each card goes to the
     shortest column, in reading order, measured at the columns' width (a
     masonry; CSS columns left one column a card short). The count of
     columns is the stylesheet's --rp-flow-cols at this width, capped at the
     number of cards, so there is never an empty column. */
  function masonry(cards, max) {
    cards = cards.filter(Boolean);
    if (!cards.length) return null;
    var box = el("div", { class: "k-rp-masonry", "data-ui": "reports.grid", style: "--max: " + Math.min(max || 3, cards.length) });
    var laid = 0;
    function deal(n, hs) {
      var tot = [], at = [];
      for (var i = 0; i < n; i++) tot.push(0);
      hs.forEach(function (h) { var k = tot.indexOf(Math.min.apply(null, tot)); at.push(k); tot[k] += h; });
      var hi = Math.max.apply(null, tot);
      return { at: at, waste: tot.reduce(function (a, t) { return a + hi - t; }, 0) / (n * hi || 1) };
    }
    function lay() {
      var want = parseInt(getComputedStyle(box).getPropertyValue("--rp-flow-cols"), 10) || 1;
      var top = Math.max(1, Math.min(want, max || 3, cards.length));
      if (top === laid && box.children.length) return;
      laid = top;
      /* measure at the widest count, then take the count that leaves the
         least empty space at the foot of the columns (a short third card
         does better under one of two) */
      build(top, cards.map(function (c, i) { return i % top; }));
      KOS.ui.state(box, "measure", true);   // natural heights, nothing stretched
      var hs = cards.map(function (c) { return c.offsetHeight || 1; });
      KOS.ui.state(box, "measure", false);
      var best = null;
      for (var n = top; n >= Math.min(2, top); n--) {
        var d = deal(n, hs);
        if (!best || d.waste < best.d.waste - 0.06) best = { n: n, d: d };
      }
      build(best.n, best.d.at);
    }
    function build(n, at) {
      box.style.setProperty("--n", String(n));
      box.textContent = "";
      var cols = [];
      for (var i = 0; i < n; i++) { cols.push(el("div", { class: "k-rp-masonry-col" })); box.appendChild(cols[i]); }
      cards.forEach(function (c, i) { cols[at[i]].appendChild(c); });
    }
    /* before it is in the page there is nothing to measure: one column
       each, in order, until the first layout */
    box.style.setProperty("--n", String(Math.min(max || 3, cards.length)));
    cards.forEach(function (c) { box.appendChild(el("div", { class: "k-rp-masonry-col" }, [c])); });
    if (window.ResizeObserver) {
      var ro = new ResizeObserver(function () { if (!box.isConnected) { ro.disconnect(); return; } lay(); });
      ro.observe(box);
    }
    return box;
  }
  function two(main, side, cls) {
    var wrap = el("div", { class: "k-rp-two" + (cls ? " " + cls : "") }, [main, side]);
    rideAlong(main, side);
    return wrap;
  }

  /* ---------------- charts (hand-built SVG, invariant 27) ---------------- */
  var svgNode = function (t, a) { return KOS.charts.svgNode(t, a); };
  function paint(n, prop, v) { n.style[prop] = v; return n; }
  /* stacked columns: cols = [{label, parts: {key: value}}], order of keys,
     a hue per key; values are minutes printed as hours, or counts.
     opts.avg: a dashed reference line (minutes) labelled at its end. */
  function stacked(cols, keys, hues, opts) {
    opts = opts || {};
    var Wd = opts.width || 520, H = opts.height || 190, padL = 30, padR = opts.avg ? 72 : 6, padT = 12, padB = 24;
    var s = KOS.charts.svgEl(Wd, H);
    s.setAttribute("class", "k-rp-chart");
    var hours = opts.unit === "mins";
    var totals = cols.map(function (c) { return keys.reduce(function (a, k) { return a + (c.parts[k] || 0); }, 0); });
    var maxV = Math.max(1, Math.max.apply(null, totals), opts.avg || 0);
    var maxU = hours ? Math.max(1, Math.ceil(maxV / 60)) : maxV;
    /* the scale tops out on a round tick, so the axis never prints 6 h
       and 7 h on top of each other */
    var t0 = KOS.charts.ticks(maxU), step = t0.length > 1 ? t0[1] - t0[0] : 1, axis = [];
    maxU = Math.max(step, Math.ceil(maxU / step) * step);
    for (var tv = 0; tv <= maxU; tv += step) axis.push(tv);
    var plotH = H - padT - padB, n = cols.length, plotW = Wd - padL - padR;
    var gap = Math.max(2, Math.min(14, plotW / n * (n > 14 ? 0.22 : 0.3)));
    var bw = Math.max(3, Math.min(opts.maxBar || 44, (plotW - gap * (n - 1)) / n));
    var x0 = padL + (plotW - (bw * n + gap * (n - 1))) / 2;
    axis.forEach(function (v) {
      var y = H - padB - plotH * v / maxU;
      var g = svgNode("line", { x1: padL, y1: y, x2: Wd - padR, y2: y, "stroke-width": "1", "stroke-dasharray": v ? "2 4" : "" });
      paint(g, "stroke", "var(--line)"); s.appendChild(g);
      var t = svgNode("text", { x: padL - 6, y: y + 3.5, "text-anchor": "end", "font-size": "11", text: hours ? v + " h" : String(v) });
      paint(t, "fill", "var(--muted)"); s.appendChild(t);
    });
    var hiI = opts.hi != null ? opts.hi : totals.indexOf(Math.max.apply(null, totals));
    var every = opts.every || (n > 16 ? 2 : 1);
    cols.forEach(function (c, i) {
      var x = x0 + i * (bw + gap), y0 = H - padB, g = svgNode("g", {});
      g.appendChild(svgNode("title", { text: (c.title || c.label) + ": " + (hours ? W.hm(totals[i]) : totals[i]) }));
      var stack = keys.filter(function (k) { return c.parts[k]; });
      stack.forEach(function (k, si) {
        var v = c.parts[k];
        var h = plotH * (hours ? v / 60 : v) / maxU;
        var top = si === stack.length - 1;
        var r = svgNode("rect", { x: x, y: y0 - h, width: bw, height: Math.max(1, h - (top ? 0 : 1.5)), rx: top ? Math.min(4, bw / 3) : 1 });
        paint(r, "fill", hues[k]);
        r.setAttribute("opacity", i === hiI ? "1" : "0.78");
        g.appendChild(r);
        y0 -= h;
      });
      if (c.label && (i % every === 0 || i === hiI)) {
        var lt = svgNode("text", { x: x + bw / 2, y: H - padB + 15, "text-anchor": "middle", "font-size": "11",
          "font-weight": i === hiI ? "600" : "400", text: c.label });
        paint(lt, "fill", i === hiI ? "var(--text)" : "var(--muted)");
        g.appendChild(lt);
      }
      s.appendChild(g);
    });
    if (opts.avg) {
      var ya = H - padB - plotH * (hours ? opts.avg / 60 : opts.avg) / maxU;
      var ln = svgNode("line", { class: "k-rp-avg-line", x1: padL, y1: ya, x2: Wd - padR + 4, y2: ya, "stroke-width": "1.5", "stroke-dasharray": "5 4" });
      s.appendChild(ln);
      (opts.avgLabel || []).forEach(function (txt, li) {
        s.appendChild(svgNode("text", { class: "k-rp-avg-label", x: Wd - padR + 8, y: ya - 2 + li * 13, "font-size": "11", text: txt }));
      });
    }
    return s;
  }
  function legend(items) {
    return el("ul", { class: "k-rp-legend" }, items.map(function (it) {
      return el("li", {}, [dot(it.hue), el("span", { text: it.label }), it.value != null ? mono(it.value) : null].filter(Boolean));
    }));
  }
  /* below three active days a chart makes no claim: the week as seven
     day tiles, with the rule stated (README rule 2, frame 24g) */
  function dayTiles(f, values, fmt) {
    var list = el("ol", { class: "k-rp-daytiles", "data-ui": "reports.day-tiles" }, DOW.map(function (d, i) {
      var v = values[i] || 0;
      return el("li", { class: "k-rp-daytile", "data-state": v ? "on" : null }, [
        el("span", { class: "k-rp-daytile-d", text: d }),
        v ? mono(fmt(v), "k-rp-daytile-v") : null
      ].filter(Boolean));
    }));
    return el("div", { class: "k-rp-lowdata" }, [list,
      el("p", { class: "k-rp-note", text: "The chart starts once there are 3 active days in the week." })]);
  }
  /* the week's days, stacked by subject (or by sessions, from the blocks) */
  function daySubjChart(f, opts) {
    opts = opts || {};
    var s = f.study;
    if (!s.chartDays) return dayTiles(f, s.dayMins, W.hm);
    var keys = SUBJECTS.filter(function (k) { return s.bySubject[k]; });
    var hues = SUBJ_HUE, cols, unit = "mins";
    if (opts.sessions && f.focus && f.focus.list) {
      cols = DOW.map(function (d, i) {
        var day = KOS.report.addDays(f.start || "", i), parts = {};
        f.focus.list.forEach(function (b) { if (dateIso(new Date(b.ts)) === day) parts[b.sid || "compsci"] = (parts[b.sid || "compsci"] || 0) + 1; });
        return { label: d, parts: parts };
      });
      unit = "count";
    } else {
      cols = DOW.map(function (d, i) { return { label: d, parts: (s.daySubj || [])[i] || {} }; });
      /* an early saved shape has day totals only: one neutral stack */
      if (!s.daySubj) { keys = ["all"]; hues = { all: "var(--teal)" }; cols = DOW.map(function (d, i) { return { label: d, parts: { all: s.dayMins[i] || 0 } }; }); }
    }
    var chart = fluid(function (w) {
      var c = stacked(cols, keys, hues, { unit: unit, width: w, height: opts.height || 200 });
      c.setAttribute("role", "img");
      c.setAttribute("aria-label", "Study by day: " + DOW.map(function (d, i) { return d + " " + W.hm(s.dayMins[i]); }).join(", "));
      return c;
    });
    return opts.bare ? chart : el("div", { class: "k-rp-chartwrap" }, [chart, s.daySubj ? subjLegend(keys) : null].filter(Boolean));
  }
  function subjLegend(keys) { return legend(keys.map(function (k) { return { hue: SUBJ_HUE[k], label: W.SUBJECT_SHORT[k] }; })); }
  /* the chart a report's period reads by: its days (a week, a month) or
     its weeks / months (a term, a year) */
  function periodChart(rep, opts) {
    if (rep.period === "week" || !KOS.reportsLong) return daySubjChart(Object.assign({ start: rep.start }, rep.facts), opts);
    if (rep.period === "month") return KOS.reportsLong.monthChart(rep, opts);
    return KOS.reportsLong.stripChart(rep.facts, opts);
  }
  function prevLbl(rep) {
    if (rep.period === "month") { var d = parse(rep.start); d.setMonth(d.getMonth() - 1); return MONTHS[d.getMonth()]; }
    return rep.period === "week" ? "last wk" : "last " + rep.period;
  }
  function spark(values) {
    var Wd = 52, H = 26, s = KOS.charts.svgEl(Wd, H);
    s.setAttribute("class", "k-rp-spark");
    s.setAttribute("aria-hidden", "true");
    var max = Math.max(1, Math.max.apply(null, values)), n = values.length;
    var pts = values.map(function (v, i) { return (n === 1 ? Wd / 2 : 2 + i * (Wd - 4) / (n - 1)).toFixed(1) + "," + (H - 3 - (H - 6) * v / max).toFixed(1); });
    var line = svgNode("polyline", { points: pts.join(" "), fill: "none", "stroke-width": "1.6", "stroke-linejoin": "round", "stroke-linecap": "round" });
    paint(line, "stroke", "var(--teal)");
    s.appendChild(line);
    var last = pts[pts.length - 1].split(",");
    var c = svgNode("circle", { cx: last[0], cy: last[1], r: "2.2" });
    paint(c, "fill", "var(--teal)");
    s.appendChild(c);
    return s;
  }
  function splitBar(parts) {
    var total = parts.reduce(function (a, p) { return a + p.value; }, 0) || 1;
    return el("div", { class: "k-rp-split", role: "img", "aria-label": parts.map(function (p) { return p.label + " " + p.text; }).join(", ") },
      parts.map(function (p) { return el("span", { class: "k-rp-split-seg", style: "--f: " + (p.value / total).toFixed(4) + "; --c: " + p.hue }); }));
  }
  /* ranked bars: rows = [{label, value, text, hue}] */
  function bars(rows, opts) {
    opts = opts || {};
    var max = Math.max.apply(null, rows.map(function (r) { return r.value; }).concat([1]));
    return el("ol", { class: "k-rp-bars" + (opts.className ? " " + opts.className : "") }, rows.map(function (r) {
      return el("li", { class: "k-rp-bar-row" }, [
        el("span", { class: "k-rp-bar-l" }, [r.hue && opts.dots ? dot(r.hue) : null, el("span", { text: r.label })].filter(Boolean)),
        el("span", { class: "k-rp-bar", "aria-hidden": "true", style: "--w: " + (100 * r.value / max).toFixed(1) + "%; --c: " + (r.hue || "var(--text-2)") }),
        mono(r.text, "k-rp-bar-v"),
        r.extra != null ? mono(r.extra, "k-rp-bar-v") : null
      ].filter(Boolean));
    }));
  }
  /* a list of label · value rows, each with a line above (25a, 24c) */
  function kvRows(rows) {
    return el("ul", { class: "k-rp-kv" }, rows.map(function (r) {
      return el("li", {}, [r.hue ? dot(r.hue) : null, el("span", { class: "k-rp-kv-k", text: r.k }),
        r.chip ? el("span", { class: "k-rp-cmp", "data-tone": r.chip.dir === "up" || r.chip.dir === "new" ? "up" : null, text: r.chip.text }) : null,
        mono(r.v, "k-rp-kv-v" + (r.tone ? " k-rp-tone-" + r.tone : ""))].filter(Boolean));
    }));
  }

  /* ---------------- covers ---------------- */
  function cover(t, cls) {
    var mod = KOS.media && KOS.media.module ? KOS.media.module(t.module) || {} : {};
    return el("span", { class: "k-rp-cover" + (cls ? " " + cls : ""), style: "--c: " + MOD_HUE[t.module] },
      [KOS.medview.cover({ title: t.title, coverUrl: t.cover || "" }, mod.kanji || "")]);
  }

  /* ================= the words (24f) =================
     Template by default (offline, free); ✦ Kurenai writes the headline and
     narrative from the report's totals in ONE request. While it writes,
     the words become skeleton lines with Cancel and nothing else on the
     page moves; written, they carry "Written by Kurenai · ↻ regenerate";
     a failure falls back to the template words in place with a calm note
     and Try again, and the switch returns to Template. The choice is per
     report and the saved report keeps the latest words (setWords).

     Two shapes. The Reports page (24a) reads the words in full: headline,
     narrative, the switch and Share/Export in a column beside them. A
     report's own hero (25a) keeps the headline only, with ▶ Play and the
     words pill on one row. */
  var writing = {};   // report id → the request in flight (one per report)
  function wordsBlock(rep, opts) {
    opts = opts || {};
    var hero = !!opts.hero;
    var box = el("div", { class: "k-rp-words" + (hero ? " k-rp-words--hero" : ""), "data-ui": "reports.words" });
    var ui = { status: writing[rep.id] ? "generating" : "idle", err: null };
    function store(words, then) {
      KOS.reportStore.setWords(rep.id, words, function (err, saved) {
        if (!err && saved) rep.words = saved.words;
        then && then(err);
        if (opts.onChange) opts.onChange(rep);
      });
    }
    function generate() {
      var token = {};
      writing[rep.id] = token;
      ui.status = "generating"; ui.err = null; draw();
      token.req = W.write(rep, function (err, out) {
        if (writing[rep.id] !== token) return;      // cancelled, or a newer request
        delete writing[rep.id];
        if (err) {
          ui.status = "failed"; ui.err = err;
          if (box.isConnected) draw();
          KOS.a11y.announce("Kurenai couldn't write the words. The template words are showing.");
          return;
        }
        store({ mode: "kurenai", headline: out.headline, narrative: out.narrative, writtenAt: Date.now(), status: "idle" }, function () {
          ui.status = "idle";
          if (box.isConnected) draw();
          KOS.a11y.announce("Kurenai wrote the words for this report.");
        });
      });
    }
    function cancel() {
      var t = writing[rep.id];
      delete writing[rep.id];
      if (t && t.req && KOS.ai && KOS.ai.cancel) KOS.ai.cancel(t.req);
      ui.status = "idle"; draw();
    }
    function choose(mode) {
      var w = rep.words || {};
      if (mode === "template") {
        if (ui.status === "generating") { cancel(); return; }
        ui.status = "idle"; ui.err = null;
        if (w.mode === "kurenai") store(Object.assign({}, w, { mode: "template" }), draw); else draw();
        return;
      }
      if (w.headline) store(Object.assign({}, w, { mode: "kurenai" }), draw);   // already written: no new request
      else generate();
    }
    function sw(kurenai) {
      return KOS.ui.tabs([
        { label: "Template", short: hero ? "Template words" : "Template", active: !kurenai, onSelect: function () { choose("template"); } },
        { label: "Kurenai", short: "✦ Kurenai", active: kurenai, onSelect: function () { if (!kurenai) choose("kurenai"); } }
      ], { variant: "workspace", label: "Words", className: "k-rp-words-switch" + (hero ? " k-rp-words-switch--pill" : "") });
    }
    function sentLink() {
      return el("button", { type: "button", class: "k-rp-textbtn", "data-ui": "reports.words-sent", text: "ⓘ What is sent", onclick: function () { whatIsSent(rep); } });
    }
    function byLine(w) {
      return w.byKurenai ? el("span", { class: "k-rp-by" }, [
        el("span", { class: "k-rp-bymark", text: "◎ Written by Kurenai · " }),
        el("button", { type: "button", class: "k-rp-textbtn k-rp-regen", "data-ui": "reports.words-regenerate", text: "↻ regenerate", onclick: generate })
      ]) : el("span", { text: "Template words · built from the numbers" });
    }
    function failNote() {
      return el("p", { class: "k-rp-fail", "data-ui": "reports.words-failed", role: "status" }, [
        el("span", { class: "k-rp-fail-dot", "aria-hidden": "true" }),
        el("span", { text: W.failNote(ui.err) }),
        el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "reports.words-retry", text: "Try again", onclick: generate })]);
    }
    function skeleton(lines) {
      return el("div", { class: "k-rp-skel", "aria-hidden": "true" }, [el("span", { class: "k-rp-skel-line", "data-state": "head" })]
        .concat(lines ? [el("span", { class: "k-rp-skel-line" }), el("span", { class: "k-rp-skel-line" }), el("span", { class: "k-rp-skel-line", "data-state": "short" })] : []));
    }
    function writingLine() {
      return el("p", { class: "k-rp-writing", role: "status" }, [
        el("span", { text: "Kurenai is writing from this " + rep.period + "'s totals…" }),
        el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "reports.words-cancel", text: "Cancel", onclick: cancel })]);
    }
    function draw() {
      box.textContent = "";
      var w = W.current(rep), gen = ui.status === "generating";
      var kurenai = gen || w.byKurenai;
      if (gen) box.setAttribute("aria-busy", "true"); else box.removeAttribute("aria-busy");
      if (hero) {
        /* 25a: kicker, headline, then ▶ Play · words pill · saved */
        if (opts.kicker) box.appendChild(el("div", { class: "k-kicker", text: opts.kicker }));
        if (ui.status === "failed") box.appendChild(failNote());
        box.appendChild(gen ? skeleton(false) : el("h2", { class: "k-rp-headline k-rp-headline--hero", "data-ui": "reports.headline", text: w.headline }));
        if (gen) box.appendChild(writingLine());
        var meta = el("div", { class: "k-rp-hero-meta" }, [el("span", { text: saved(rep) })]);
        if (w.byKurenai && !gen) meta.appendChild(byLine(w));
        meta.appendChild(sentLink());
        var chip = rebuiltChip(rep);
        if (chip) meta.appendChild(chip);
        box.appendChild(el("div", { class: "k-rp-hero-row" }, [opts.lead || null, sw(kurenai)].filter(Boolean)));
        box.appendChild(meta);
        return;
      }
      /* 24a: the words in full, with their controls in a column beside */
      var text = el("div", { class: "k-rp-words-text" }, [
        opts.kicker ? el("div", { class: "k-kicker", text: opts.kicker }) : null,
        ui.status === "failed" ? failNote() : null,
        gen ? skeleton(true) : el("h2", { class: "k-rp-headline", "data-ui": "reports.headline", text: w.headline }),
        gen ? writingLine() : (w.narrative ? el("p", { class: "k-rp-narrative", "data-ui": "reports.narrative", text: w.narrative }) : null),
        gen ? null : el("div", { class: "k-rp-meta" }, [byLine(w), sentLink(), rebuiltChip(rep)].filter(Boolean))
      ].filter(Boolean));
      var side = el("div", { class: "k-rp-words-side" }, [
        el("div", { class: "k-rp-words-bar" }, [el("span", { class: "k-rp-words-l", "aria-hidden": "true", text: "Words" }), sw(kurenai)]),
        opts.actions && opts.actions.length ? el("div", { class: "k-rp-actions" }, opts.actions) : null,
        el("span", { class: "k-rp-saved", text: saved(rep) })
      ].filter(Boolean));
      box.appendChild(text);
      box.appendChild(side);
    }
    draw();
    return box;
  }
  /* ⇪ Share and ↓ Export (24k): the share card and the export dialog */
  function shareActions(rep) {
    if (!KOS.reportShare) return [];
    return [
      el("button", { type: "button", class: "k-rp-pillbtn", "data-ui": "reports.share", onclick: function () { KOS.reportShare.dialog(rep, { format: "png" }); } },
        [KOS.ui.icon("share"), el("span", { text: "Share" })]),
      el("button", { type: "button", class: "k-rp-pillbtn", "data-ui": "reports.export", onclick: function () { KOS.reportShare.dialog(rep, { format: "pdf" }); } },
        [KOS.ui.icon("download"), el("span", { text: "Export" })])
    ];
  }
  /* exactly the request Kurenai would be sent (24f ⓘ) */
  function whatIsSent(rep) {
    var overlay = el("div", { class: "k-dialog-overlay" });
    function close() { overlay.remove(); }
    overlay.appendChild(el("div", { class: "k-dialog k-rp-sent", "data-ui": "ui.dialog reports.sent" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "What Kurenai is sent" })]),
      el("div", { class: "k-dialog-body" }, [
        el("p", { class: "k-rp-note", text: "One request per report, made of the report's totals. No notes, card text, titles or conversation history." }),
        el("pre", { class: "k-rp-payload", "data-ui": "reports.payload" }, [el("code", { text: W.payloadLines(W.payload(rep)).join("\n") })])
      ]),
      el("div", { class: "k-dialog-foot" }, [el("button", { type: "button", class: "k-btn", "data-ui": "ui.dialog-close", text: "Close", onclick: close })])
    ]));
    KOS.ui.openDialog(overlay, { label: "What Kurenai is sent" });
  }

  /* ================= the story hero (25a, and the month, term, year) ===== */
  function hero(rep, opts) {
    opts = opts || {};
    var stories = KOS.reportStory ? KOS.reportStory.slides(rep) : [];
    var noun = rep.period;
    var mins = Math.max(1, Math.round(stories.length * 7.2 / 60));
    var kicker = stories.length ? "Your " + noun + " as a story · " + W.plural(stories.length, "story", "stories") + " · about " + W.plural(mins, "minute")
      : "Your " + noun + " in review";
    var play = stories.length ? el("button", { type: "button", class: "k-btn k-btn--primary k-rp-play", "data-ui": "reports.play",
      onclick: function () { KOS.reportStory.open(rep, 0); } }, [KOS.ui.icon("play"), el("span", { text: "Play your " + noun })]) : null;
    return el("section", { class: "k-rp-hero", "data-ui": "reports.hero", "aria-label": "The " + noun + " in words" }, [
      el("div", { class: "k-rp-hero-main" }, [
        opts.big ? el("div", { class: "k-rp-year", "aria-hidden": "true", text: opts.big }) : null,
        wordsBlock(rep, { hero: true, kicker: kicker, lead: play })
      ].filter(Boolean)),
      stories.length ? el("ol", { class: "k-rp-thumbs", "aria-label": "The stories" }, stories.map(function (sl, i) {
        return el("li", {}, [el("button", { type: "button", class: "k-rp-thumb", "data-ui": "reports.thumb", style: "--hue: " + sl.hue,
          "aria-label": "Play from story " + (i + 1) + ": " + sl.ch, onclick: function () { KOS.reportStory.open(rep, i); } }, [
          el("span", { class: "k-rp-thumb-segs", "aria-hidden": "true" }, stories.map(function (x, j) { return el("i", { "data-state": j <= i ? "on" : null }); })),
          el("span", { class: "k-rp-thumb-l", text: sl.ch })
        ])]);
      })) : null
    ].filter(Boolean));
  }
  /* the top of every saved report: the breadcrumb with Share / Export,
     a heading for assistive tech, the story hero */
  function reportTop(holder, rep, opts) {
    holder.appendChild(crumbs([{ label: "Reports", go: function () { KOS.show("reports", { period: rep.period }); } }, { label: weekOf(rep) }], shareActions(rep)));
    holder.appendChild(el("h1", { class: "sr-only", text: PERIOD_KICKER[rep.period] + ", " + spanOf(rep) }));
    holder.appendChild(hero(rep, opts));
  }

  /* ================= the Reports page (24a) ================= */
  var EMPTY = {
    week: ["Your first weekly report arrives on Monday", "A week is written down when it ends: each Monday at 07:00, the week before becomes a report you can read here."],
    month: ["Your first monthly report arrives on the 1st", "A month is written down on the first morning of the next one."],
    term: ["Your first termly report arrives when the term ends", "Terms come from the plan: a term ends at a break of two weeks or more."],
    year: ["Your first yearly report arrives on 1 September", "The academic year runs from September to August."]
  };
  function periodSwitch(current) {
    return KOS.ui.tabs(PERIODS.map(function (x) {
      return { label: x[1], active: current === x[0], onSelect: function () { if (current !== x[0]) { view.selected = null; KOS.show("reports", { period: x[0] }); } } };
    }), { variant: "workspace", label: "Period", className: "k-rp-periods" });
  }
  function indexPage(holder, reps, period) {
    period = period || "week";
    holder.appendChild(KOS.ui.pageHeader({ kicker: "Home", title: "Reports", actions: [periodSwitch(period)] }));
    if (!reps.length) {
      holder.appendChild(KOS.ui.emptyState({ mark: "録", title: EMPTY[period][0], body: EMPTY[period][1] }));
      return;
    }
    var chosen = reps.filter(function (r) { return r.id === view.selected; })[0] || reps[0];
    var left = el("div", { class: "k-rp-index-main" });
    var list = el("ol", { class: "k-rp-list", "data-ui": "reports.list" });
    function paintLeft() {
      left.textContent = "";
      left.appendChild(summary(chosen, function () { paintRow(chosen); }));
      list.querySelectorAll("[data-ui~='reports.row']").forEach(function (b) {
        var on = b.getAttribute("data-id") === chosen.id;
        b.setAttribute("aria-pressed", String(on));
        KOS.ui.state(b, "on", on);
      });
    }
    function rowBody(r, i) {
      var w = W.current(r);
      var weeks = reps.slice(i, i + 8).reverse().map(function (x) { return x.facts.study.mins / 60; });
      return [
        el("span", { class: "k-rp-row-txt" }, [
          el("span", { class: "k-rp-row-top" }, [
            mono(r.period === "week" ? range(r.start, r.end) : weekOf(r), "k-rp-row-range"),
            w.byKurenai ? el("span", { class: "k-rp-mark", title: "Written by Kurenai", text: "✦" }) : null,
            i === 0 ? el("span", { class: "k-rp-latest", text: "Latest" }) : null,
            r.rebuilt ? el("span", { class: "k-rp-row-note", text: "rebuilt" }) : null
          ].filter(Boolean)),
          el("span", { class: "k-rp-row-h", text: w.headline })
        ]),
        weeks.length > 1 ? spark(weeks) : null
      ].filter(Boolean);
    }
    /* the words changed on the left: the row says so too */
    function paintRow(r) {
      var b = list.querySelector("[data-id='" + r.id + "']");
      if (!b) return;
      b.textContent = "";
      rowBody(r, reps.indexOf(r)).forEach(function (n) { b.appendChild(n); });
    }
    reps.forEach(function (r, i) {
      list.appendChild(el("li", {}, [el("button", { type: "button", class: "k-rp-row", "data-ui": "reports.row", "data-id": r.id,
        "aria-pressed": "false", onclick: function () { chosen = r; view.selected = r.id; paintLeft(); } }, rowBody(r, i))]));
    });
    var first = reps[reps.length - 1];
    var side = el("aside", { class: "k-rp-earlier", "aria-label": "Earlier reports" }, [
      el("div", { class: "k-rp-card-head" }, [el("h2", { class: "k-rp-card-title", text: "Earlier reports" })]),
      list,
      el("p", { class: "k-rp-earlier-foot", text: "Since " + dm(first.start) + " " + parse(first.start).getFullYear() + " · " + W.plural(reps.length, PERIODS.filter(function (x) { return x[0] === period; })[0][1].toLowerCase() + " report") })
    ]);
    holder.appendChild(two(left, side, "k-rp-index"));
    paintLeft();
  }
  /* the left column: the chosen report, short (24a). Flat on the page —
     its tiles and its chart are the cards. */
  function summary(rep, onWords) {
    var f = rep.facts, s = f.study, g = f.gov;
    var activity = el("section", { class: "k-rp-card", "aria-label": "Activity" });
    function paintActivity() {
      activity.textContent = "";
      var canSessions = rep.period === "week" && f.focus && f.focus.list && f.focus.list.length && s.chartDays;
      var keys = SUBJECTS.filter(function (k) { return s.bySubject[k]; });
      activity.appendChild(cardHead(rep.period === "week" || rep.period === "month" ? "Activity" : rep.period === "year" ? "Activity · by month" : "Activity · by week", {
        meta: null,
        right: el("span", { class: "k-rp-head-tools" }, [
          canSessions ? KOS.ui.tabs([["time", "Time"], ["sessions", "Sessions"]].map(function (x) {
            return { label: x[1], active: view.activity === x[0], onSelect: function () { view.activity = x[0]; paintActivity(); } };
          }), { variant: "workspace", label: "Measure", className: "k-rp-mini-switch" }) : null,
          keys.length && (s.chartDays || rep.period !== "week") ? subjLegend(keys) : null
        ].filter(Boolean))
      }));
      activity.appendChild(periodChart(rep, { bare: true, sessions: canSessions && view.activity === "sessions" }));
    }
    paintActivity();
    var facts = [tile("Studied", W.hm(s.mins), s.sessions ? W.plural(s.sessions, "session") : null)];
    if (s.reviews) facts.push(tile("Flashcards", W.num(s.reviews), s.recall != null ? s.recall + "% recall" : "reviews"));
    else if (f.focus.blocks) facts.push(tile("Focus", f.focus.blocks, "longest " + f.focus.longest + "m", null, "blocks"));
    if (g.streak) facts.push(tile("Study streak", g.streak, g.rest ? "rest streak " + g.rest : null, null, "days"));
    else if (f.collection) facts.push(tile("Collection", f.collection.count, "titles"));
    return el("section", { class: "k-rp-sum", "data-ui": "reports.summary", "aria-label": "Report for " + weekOf(rep) }, [
      wordsBlock(rep, { onChange: onWords, kicker: PERIOD_KICKER[rep.period] + " · " + spanOf(rep), actions: shareActions(rep) }),
      el("div", { class: "k-rp-tiles k-rp-tiles--three", "data-ui": "reports.tiles" }, facts.filter(Boolean)),
      activity,
      el("p", { class: "k-rp-continue" }, [
        el("span", { text: (rep.period === "week" ? "Study, Focus, the plan, Collection and Governor" : "Every section of the " + rep.period) + " continue in the full report · " }),
        el("button", { type: "button", class: "k-rp-more", "data-ui": "reports.open", text: "Open the full report ›", onclick: function () { open(rep); } })
      ])
    ]);
  }

  /* ================= one report (25a) ================= */
  function reportPage(holder, rep) {
    var f = rep.facts;
    reportTop(holder, rep);
    holder.appendChild(weekTiles(f));
    /* 25a's order; a missing card's place in the first row goes to
       Governor and Kurenai, so Focus keeps its width and the Collection
       closes the second row */
    var plan = planCard(rep), gov = governorCard(rep);
    holder.appendChild(el("div", { class: "k-rp-grid", "data-ui": "reports.grid" }, pack([
      { node: studyCard(rep) }, { node: focusCard(rep) }, { node: plan || gov },
      { node: collectionCard(rep), span: 2 }, { node: plan ? gov : null }, { node: codeCard(rep) },
      { node: examsCard(rep) }, { node: moneyCard(rep) }, { node: goalsCard(rep) }, { node: kurenaiSees(rep) }
    ])));
  }
  function weekTiles(f) {
    var s = f.study, fo = f.focus, c = f.collection, g = f.gov, prev = f.prev;
    var cmp = prev ? W.compare(s.mins, prev.mins, "last wk", "mins") : null;
    return tiles([
      tile("Studied", W.hm(s.mins), s.sessions ? W.plural(s.sessions, "session") : null, cmp),
      s.recall != null ? tile("Recall", s.recall + "%", W.plural(s.reviews, "review")) : (s.reviews ? tile("Reviews", W.num(s.reviews), null) : null),
      s.touched ? tile("Topics", s.touched, s.toGreen ? s.toGreen + " to Green" : null) : null,
      fo.blocks ? tile("Focus", fo.blocks, "longest " + fo.longest + "m") : null,
      f.plan ? tile("Plan", f.plan.ticked + "/" + f.plan.planned, f.plan.carried ? f.plan.carried + " carried" : "all ticked") : null,
      f.code && (f.code.tasks || f.code.skills) ? tile("Code", W.num(f.code.tasks || 0), "tasks" + (f.code.skills ? " · " + W.plural(f.code.skills, "skill") : "")) : null,
      c ? tile("Collection", c.count, "titles" + (c.estMins ? " · ≈ " + W.hm(c.estMins) : "")) : null,
      g.xp ? tile("Earned", "+" + W.num(g.xp), "XP" + (g.gold ? " · +" + W.num(g.gold) + " ◆" : "")) : null,
      g.streak ? tile("Streak", g.streak, "days" + (g.rest ? " · rest " + g.rest : "")) : null
    ]);
  }
  function statusText(t) {
    if (t.to === "g" && t.from !== "g") return { text: "→ Green", tone: "green" };
    if (t.from && t.to && t.from !== t.to) return { text: BAND[t.from] + " → " + BAND[t.to], tone: t.to === "r" ? "alarm" : null };
    if (t.band) return { text: BAND[t.band], tone: t.band === "r" ? "alarm" : t.band === "g" ? "green" : "amber" };
    return null;
  }
  function topicRows(top) {
    return el("ol", { class: "k-rp-topics" }, top.map(function (t, i) {
      var st = statusText(t);
      return el("li", {}, [el("button", { type: "button", class: "k-rp-topic", "data-ui": "reports.topic", title: t.ref + " " + t.title, onclick: function () { openTopic(t.key); } }, [
        mono(String(i + 1), "k-rp-rank"),
        el("span", { class: "k-rp-topic-name" }, [dot(SUBJ_HUE[t.sid]), mono(t.ref, "k-rp-ref"), el("span", { class: "k-rp-topic-t", text: t.title })]),
        mono(t.mins ? W.hm(t.mins) : "", "k-rp-topic-m"),
        mono(t.reviews ? t.reviews + "×" : "", "k-rp-topic-r"),
        el("span", { class: "k-rp-topic-s", "data-tone": st && st.tone, text: st ? st.text : "" })
      ])]);
    }));
  }
  function studyCard(rep) {
    var f = rep.facts, s = f.study;
    var keys = SUBJECTS.filter(function (k) { return s.bySubject[k]; });
    var parts = keys.map(function (k) { return { label: W.SUBJECT_SHORT[k], value: s.bySubject[k], text: W.hm(s.bySubject[k]), hue: SUBJ_HUE[k] }; });
    var top = s.topics.slice(0, 5);
    if (!parts.length && !top.length) return null;   // nothing studied: the Studied tile says so
    return card("Study", { go: function () { open(rep, "study"); }, className: "k-rp-card--study" }, [
      parts.length ? splitBar(parts) : null,
      parts.length ? el("div", { class: "k-rp-split-legend" }, parts.map(function (p) { return el("span", { style: "--c: " + p.hue }, [el("b", { text: p.label }), " " + p.text]); })) : null,
      top.length ? el("h3", { class: "k-rp-subhead", text: "Top topics" }) : null,
      top.length ? topicRows(top) : el("p", { class: "k-rp-note", text: "No topics touched this " + rep.period + "." })
    ].filter(Boolean));
  }
  function heat(f) {
    var fo = f.focus;
    var activeDays = (fo.byDay || []).filter(function (m) { return m > 0; }).length;
    if (activeDays < 3) return dayTiles(f, fo.byDay || [], W.hm);
    var max = 1;
    fo.heat.forEach(function (r) { r.forEach(function (v) { if (v > max) max = v; }); });
    var cols = fo.heat[0].length;
    var grid = el("div", { class: "k-rp-heat", role: "img", style: "--cols: " + cols,
      "aria-label": "Focus by weekday and hour; the busiest hour " + pad2(fo.peakHour) + ":00" });
    fo.heat.forEach(function (row, d) {
      grid.appendChild(el("span", { class: "k-rp-heat-l", "aria-hidden": "true", text: "MTWTFSS".charAt(d) }));
      row.forEach(function (v, h) {
        grid.appendChild(el("span", { class: "k-rp-heat-c", style: "--a: " + (v ? (0.22 + 0.78 * v / max).toFixed(2) : "0"),
          title: DOW[d] + " " + pad2(HEAT_FROM + h) + ":00 · " + W.hm(v) }));
      });
    });
    grid.appendChild(el("span", { "aria-hidden": "true" }));
    for (var h = 0; h < cols; h++) {
      grid.appendChild(el("span", { class: "k-rp-heat-x", "aria-hidden": "true", text: h % 4 === 0 ? pad2(HEAT_FROM + h) : "" }));
    }
    return grid;
  }
  function personaChip(p) {
    return el("div", { class: "k-rp-persona-row" }, [
      el("span", { class: "k-rp-persona-chip" }, [
        p.kanji ? el("span", { class: "k-rp-persona-k", lang: "ja", "aria-hidden": "true", text: p.kanji }) : null,
        el("b", { text: p.name })
      ].filter(Boolean)),
      el("span", { class: "k-rp-persona-f", text: p.fact })
    ]);
  }
  function focusCard(rep) {
    var f = rep.facts, fo = f.focus;
    if (!fo.blocks) return null;
    return card("Focus", { go: function () { open(rep, "focus"); } }, [
      el("div", { class: "k-rp-big" }, [mono(String(fo.blocks), "k-rp-big-n"),
        el("span", { text: (fo.blocks === 1 ? "block" : "blocks") + " · " + W.hm(fo.mins) + " · longest " + fo.longest + "m" })]),
      heat(f),
      fo.persona ? personaChip(fo.persona) : null
    ].filter(Boolean));
  }
  function planRow(r) {
    var d = r.doneAt ? dayName(r.doneAt) : null;
    return el("li", { class: "k-rp-plan-row", "data-state": r.done ? "done" : "carried" }, [
      el("span", { class: "k-rp-plan-mark", "aria-hidden": "true", text: r.done ? "✓" : "→" }),
      r.subject ? dot(SUBJ_HUE[r.subject]) : el("span", {}),
      el("span", { class: "k-rp-plan-t", title: r.title, text: r.title }),
      r.done ? (d ? mono(d, "k-rp-plan-w") : el("span", { class: "sr-only", text: "ticked" }))
        : mono("→ w/c " + dm(r.carriedTo), "k-rp-plan-w")
    ]);
  }
  function planCard(rep) {
    var f = rep.facts, pl = f.plan, tk = f.tasks;
    if (!pl) return null;
    var meta = [pl.ticked + " of " + pl.planned + " personal rows"];
    if (tk && tk.reminders) meta.push(W.plural(tk.reminders, "reminder"));
    if (tk && tk.habits) meta.push(W.plural(tk.habits.length, "habit"));
    return card("The plan", { go: function () { open(rep, "focus"); } }, [
      el("p", { class: "k-rp-card-sub", text: meta.join(" · ") }),
      el("ul", { class: "k-rp-plan" }, pl.rows.map(planRow))
    ]);
  }
  function unitText(c, m) {
    var u = c.units || {}, n = c.byModule[m];
    if (m === "anime" && u.ep) return n + " · " + W.num(u.ep) + " eps";
    if (m === "books" && u.ch) return n + " · " + W.num(u.ch) + " ch";
    if (m === "vn" && u.route) return n + " · " + W.plural(u.route, "route");
    if (m === "game" && u.hours) return n + " · " + W.hm(u.hours * 60);
    return String(n);
  }
  function coverOf(c, x) {
    return c.titles.filter(function (t) { return (x.syncId && t.syncId === x.syncId) || t.title === x.title; })[0] || x;
  }
  function hiLo(c, opts) {
    if (!c.hi) return null;
    opts = opts || {};
    function one(label, t, tone) {
      var full = coverOf(c, t);
      return el("div", { class: "k-rp-hilo", "data-tone": tone }, [
        opts.covers ? cover(full, "k-rp-cover--hilo") : null,
        el("span", { class: "k-rp-hilo-txt" }, [
          el("span", { class: "k-rp-hilo-k", text: label }),
          el("span", { class: "k-rp-hilo-v" }, [mono(String(t.score), "k-rp-hilo-n"), mono("/10", "k-rp-hilo-of")]),
          el("span", { class: "k-rp-hilo-t", title: t.title, text: t.title + (opts.covers && full.range ? " · " + full.range : "") })
        ])
      ].filter(Boolean));
    }
    return el("div", { class: "k-rp-hilos" + (opts.covers ? " k-rp-hilos--covers" : "") }, [one("Highest", c.hi, "green"), one("Lowest", c.lo, "alarm")]);
  }
  var GENRE_HUE = ["var(--vn)", "var(--books)", "var(--anime)", "var(--red)", "var(--games)"];
  function genreBars(c) {
    return el("ol", { class: "k-rp-genres" }, c.genres.map(function (g, i) {
      return el("li", {}, [el("span", { class: "k-rp-genre-l", text: g.name }),
        el("span", { class: "k-rp-bar", "aria-hidden": "true", style: "--w: " + Math.min(100, g.pct * 3) + "%; --c: " + GENRE_HUE[i] }),
        mono(g.pct + "%", "k-rp-genre-p")]);
    }));
  }
  function collectionCard(rep) {
    var c = rep.facts.collection;
    if (!c) return null;
    var mods = MODULES.filter(function (m) { return c.byModule[m]; });
    var shown = c.titles.slice().sort(function (a, b) { return MODULES.indexOf(a.module) - MODULES.indexOf(b.module); }).slice(0, 60);
    var side = c.genres.length || c.hi;
    /* the mosaic's density follows the count and the room: sixty titles
       are 25a's 15-column wall, a dozen draw as real covers — sized so the
       rows come out full and about as tall as Genre DNA beside them */
    var mosaic = fluid(function (w) {
      var n = shown.length, target = side ? 230 : 150, best = null;
      for (var cc = 4; cc <= 15; cc++) {
        var cw = (w - 4 * (cc - 1)) / cc;
        if (cw < 24 || cw > 110) continue;
        var rows = Math.ceil(n / cc), h = rows * cw * 1.4 + 4 * (rows - 1);
        var score = Math.abs(h - target) + (rows * cc - n) * cw * 0.9 + (h > target * 1.35 ? h : 0);
        if (!best || score < best.s) best = { s: score, c: cc };
      }
      return el("ul", { class: "k-rp-mosaic", "data-ui": "reports.mosaic", style: "--cols: " + (best ? best.c : 15), "aria-label": W.plural(c.count, "title") },
        shown.map(function (t) { return el("li", { title: t.title + (t.range ? " · " + t.range : "") }, [cover(t, "k-rp-cover--mini")]); }));
    }, 440);
    return card("Collection · " + W.plural(c.count, "title"), { go: function () { open(rep, "collection"); }, className: "k-rp-card--coll" }, [
      el("div", { class: "k-rp-coll" }, [
        el("div", { class: "k-rp-coll-main" }, [mosaic,
          legend(mods.map(function (m) { return { hue: MOD_HUE[m], label: MOD_SHORT[m] + " " + unitText(c, m) }; }))]),
        side ? el("div", { class: "k-rp-coll-side" }, [
          c.genres.length ? el("h3", { class: "k-rp-subhead", text: "Genre DNA" }) : null,
          c.genres.length ? genreBars(c) : null,
          hiLo(c)
        ].filter(Boolean)) : null
      ].filter(Boolean))
    ]);
  }
  /* Code (f.code, from the ledger): what was proven, not time spent */
  function codeCard(rep) {
    var c = rep.facts.code;
    if (!c) return null;
    var rows = [];
    if (c.tasks) rows.push({ k: "Tasks passed", v: W.num(c.tasks), tone: "teal" });
    if (c.skills) rows.push({ k: "Skills proven", v: W.num(c.skills) });
    if (c.retrieval) rows.push({ k: "Retrieval", v: (c.retrievalOk || 0) + " of " + c.retrieval + " proven" });
    if (c.katas) rows.push({ k: "Katas", v: c.katas + (c.kataTotal ? " · " + (c.kataRight || 0) + "/" + c.kataTotal + " right" : "") });
    if (c.practice) rows.push({ k: "Practice right", v: W.num(c.practice) });
    if (c.capstones) rows.push({ k: "Capstones passed", v: W.num(c.capstones), tone: "teal" });
    if (c.projects) rows.push({ k: "Rider projects done", v: W.num(c.projects), tone: "teal" });
    if (!rows.length && !(c.lessons || []).length) return null;
    return card("Code", { className: "k-rp-card--code" }, [
      rows.length ? kvRows(rows) : null,
      (c.lessons || []).length ? el("h3", { class: "k-rp-subhead", text: "Lessons worked on" }) : null,
      (c.lessons || []).length ? el("ol", { class: "k-rp-topics" }, c.lessons.map(function (l, i) {
        return el("li", {}, [el("button", { type: "button", class: "k-rp-topic", "data-ui": "reports.code-lesson", title: l.ref + " " + l.title,
          onclick: function () { KOS.show("ref", { subject: "code", ref: l.ref }); } }, [
          mono(String(i + 1), "k-rp-rank"),
          el("span", { class: "k-rp-topic-name" }, [dot("var(--code)"), mono(l.ref, "k-rp-ref"), el("span", { class: "k-rp-topic-t", text: l.title })]),
          mono("", "k-rp-topic-m"), mono(l.n + "×", "k-rp-topic-r"), el("span", { class: "k-rp-topic-s" })
        ])]);
      })) : null
    ].filter(Boolean));
  }
  /* Money (f.money, 27o): totals, the three biggest categories, what went
     into pots, then one line of context. A balance is words, never a bar
     (invariant 78); a supporting zero is not printed (invariant 77). With
     Hide amounts on, the figures mask exactly as in Money. */
  function moneyCard(rep) {
    var m = rep.facts.money;
    if (!m) return null;
    var A = function (minor, o) { return KOS.ui.amount(minor, Object.assign({ size: "22" }, o || {})); };
    var figs = [
      m.outgoings ? el("div", { class: "k-rp-mfig" }, [el("span", { class: "k-kicker", text: "Spent" }), A(m.outgoings)]) : null,
      m.income ? el("div", { class: "k-rp-mfig" }, [el("span", { class: "k-kicker", text: "In" }), A(m.income, { tone: "in", plus: true })]) : null,
      m.toPots ? el("div", { class: "k-rp-mfig" }, [el("span", { class: "k-kicker", text: "To pots" }), A(m.toPots, { tone: "transfer" })]) : null
    ].filter(Boolean);
    var tone = function (id) { var c = KOS.money && KOS.money.category(id); return c ? c.tone : "muted"; };
    var context = [];
    if (m.over && m.over.length) context.push("Over budget: " + m.over.map(function (o) { return o.name; }).join(", ") + ".");
    if (m.subs) context.push("Subscriptions run at " + (KOS.money && !KOS.money.isHidden() ? KOS.money.format(m.subs) : "a set amount") + " a month.");
    return card("Money", { className: "k-rp-card--money" }, [
      figs.length ? el("div", { class: "k-rp-mfigs" }, figs) : null,
      (m.top || []).length ? el("h3", { class: "k-rp-subhead", text: "Biggest categories" }) : null,
      (m.top || []).length ? el("div", { class: "k-rp-mcats" }, m.top.map(function (c) {
        return el("button", { type: "button", class: "k-rp-mcat", "data-ui": "reports.money-cat", onclick: function () { KOS.show("money", "month"); } }, [
          el("span", { class: "k-mn-dot", "data-cat-tone": tone(c.cat), "aria-hidden": "true" }), el("span", { class: "k-rp-mcat-n", text: c.name }), A(c.spent, { size: "13" })]);
      })) : null,
      context.length ? el("p", { class: "k-rp-note", text: context.join(" ") }) : null
    ].filter(Boolean));
  }
  /* Goals (f.goals, 27o): how many periods ended met or missed, then the
     named goals with their ended state. Reported, never paid (5b). */
  function goalsCard(rep) {
    var g = rep.facts.goals;
    if (!g) return null;
    var met = (g.periodsMet || 0) + (g.reached ? g.reached.length : 0), missed = (g.periodsMissed || 0) + (g.missed ? g.missed.length : 0);
    return card("Goals", { className: "k-rp-card--goals" }, [
      el("div", { class: "k-rp-gcounts" }, [
        met ? el("div", { "data-k": "met" }, [el("b", { class: "k-mono", text: String(met) }), el("span", { class: "k-muted", text: "met" })]) : null,
        missed ? el("div", { "data-k": "missed" }, [el("b", { class: "k-mono", text: String(missed) }), el("span", { class: "k-muted", text: "missed" })]) : null].filter(Boolean)),
      el("div", { class: "k-rp-goals" }, (g.rows || []).slice(0, 6).map(function (r) {
        return el("button", { type: "button", class: "k-rp-goal", "data-ui": "reports.goal-row", onclick: function () { KOS.show("goals", { id: r.id }); } }, [
          el("span", { class: "k-rp-goal-t" }, [el("b", { text: r.title }),
            el("span", { class: "k-muted", text: r.repeat ? r.met + " of " + r.of + (r.repeat === "week" ? " weeks met" : " months met") : r.state === "met" ? "reached" : "missed by its deadline" })]),
          KOS.ui.paceChip(r.state)]);
      }))
    ]);
  }
  /* the Exams card (roadmap 5.8, 29w): timed papers, their average against
     the last report's, and calibration */
  function examsCard(rep) {
    var x = rep.facts.exams, prev = rep.facts.prev;
    if (!x || !(x.timed || x.marked)) return null;
    var by = x.bySubject || {};
    var subj = Object.keys(by).map(function (k) { return (SUBJ_SHORT_RP[k] || k) + " " + by[k]; }).join(", ");
    var cmp = x.avg != null && prev && prev.examAvg != null ? (x.avg > prev.examAvg ? "up from " : x.avg < prev.examAvg ? "down from " : "same as ") + prev.examAvg + "% last time" : null;
    var calTxt = x.calibration == null ? null : x.calibration > 2 ? "you over-predict a little" : x.calibration < -2 ? "you under-predict a little" : "your predictions are close";
    return card("Exams and papers", { className: "k-rp-card--exams", meta: rep.period === "week" ? "this week" : "this " + rep.period }, [
      el("div", { class: "k-rp-extiles" }, [
        x.timed ? el("div", {}, [el("span", { class: "k-muted", text: "Timed papers" }), mono(String(x.timed)), el("span", { class: "k-muted", text: subj })]) :
          el("div", {}, [el("span", { class: "k-muted", text: "Papers marked" }), mono(String(x.marked))]),
        x.avg != null ? el("div", {}, [el("span", { class: "k-muted", text: "Average" }), mono(x.avg + "%"), cmp ? el("span", { class: "k-muted", text: cmp }) : null].filter(Boolean)) : null,
        x.calibration != null ? el("div", {}, [el("span", { class: "k-muted", text: "Calibration" }), mono((x.calibration > 0 ? "+" : x.calibration < 0 ? "−" : "") + Math.abs(x.calibration)), el("span", { class: "k-muted", text: calTxt })]) : null
      ].filter(Boolean)),
      x.redo || x.results ? el("p", { class: "k-rp-note", text: [x.redo ? W.plural(x.redo, "redo item") + " made" : null, x.results ? W.plural(x.results, "real result") + " logged" : null].filter(Boolean).join(" · ") + "." }) : null,
      el("button", { type: "button", class: "k-link", "data-ui": "reports.exams-open", text: "Exams & Papers →", onclick: function () { KOS.show("exams", { tab: "practice", sub: "analytics" }); } })
    ].filter(Boolean));
  }
  var SUBJ_SHORT_RP = { compsci: "CS", maths: "Maths", it: "IT" };
  /* what Kurenai's words are written from (27o) */
  function kurenaiSees(rep) {
    if (!rep.facts.money && !rep.facts.goals && !rep.facts.exams) return null;
    return card("What Kurenai sees", { className: "k-rp-card--sees", meta: "for the words" }, [
      el("p", { class: "k-rp-note", text: "Totals in and out, the three biggest categories by amount, the subscriptions total, how many goals were met or missed with their names, and the count and average of timed papers, never their names. Never payees, notes, tags or the titles you bought." })]);
  }
  function governorCard(rep) {
    var f = rep.facts, g = f.gov, k = f.kurenai;
    var rows = [];
    if (g.streak) rows.push({ k: "Study streak", v: W.plural(g.streak, "day"), tone: "teal" });
    if (g.rest) rows.push({ k: "Rest streak", v: W.plural(g.rest, "day") });
    if (g.level) rows.push({ k: "Level", v: g.level + (g.levelPct != null ? " · " + g.levelPct + "% to " + (g.level + 1) : "") + (g.levelFrom ? " · up from " + g.levelFrom : "") });
    if (k) {
      var bits = [];
      if (k.chats) bits.push(W.plural(k.chats, "chat"));
      if (k.scheduled) bits.push("scheduled ×" + k.scheduled);
      if (bits.length) rows.push({ k: "Kurenai", v: bits.join(" · "), hue: "var(--bloom)" });
      var areas = Object.keys(k.areas || {}).sort(function (a, b) { return k.areas[b] - k.areas[a]; });
      if (areas.length) rows.push({ k: "Asked about", v: areas.slice(0, 3).map(function (a) { return (AREA_LABEL[a] || a) + " " + k.areas[a]; }).join(" · ") });
    }
    if (!rows.length && !g.xp) return null;
    return card("Governor and Kurenai", { className: "k-rp-card--gov" }, [
      g.xp ? el("div", { class: "k-rp-earned", "aria-label": "Earned this " + rep.period }, [
        el("span", { class: "k-rp-earned-xp" }, [mono("+" + W.num(g.xp)), el("span", { class: "k-rp-u", text: "XP" })]),
        g.gold ? mono("+" + W.num(g.gold) + " ◆", "k-rp-gold") : null].filter(Boolean)) : null,
      rows.length ? kvRows(rows) : null
    ].filter(Boolean));
  }

  /* ================= the full overviews (25b–25d) ================= */
  function overviewHead(holder, rep, section) {
    var words = W.section(rep.facts, section);
    holder.appendChild(crumbs([{ label: "Reports", go: function () { KOS.show("reports", { period: rep.period }); } },
      { label: weekOf(rep), go: function () { open(rep); } }, { label: SECTIONS[section] }], shareActions(rep)));
    holder.appendChild(el("header", { class: "k-rp-ohead" }, [
      el("div", { class: "k-kicker", text: SECTIONS[section] + " · " + spanOf(rep) }),
      el("h1", { class: "k-rp-ohead-t", text: words.headline }),
      words.sentence ? el("p", { class: "k-rp-ohead-s", text: words.sentence }) : null,
      rebuiltChip(rep)
    ].filter(Boolean)));
  }

  /* ---- 25c Study ---- */
  function studyOverview(holder, rep) {
    var f = rep.facts, s = f.study, prev = f.prev;
    overviewHead(holder, rep, "study");
    holder.appendChild(tiles([
      tile("Studied", W.hm(s.mins), s.sessions ? W.plural(s.sessions, "session") + " · " + W.plural(s.days, "day") : null, prev ? W.compare(s.mins, prev.mins, prevLbl(rep), "mins") : null),
      s.touched ? tile("Topics", s.touched, s.toGreen ? s.toGreen + " to Green" : null, prev ? W.compare(s.touched, prev.touched, prevLbl(rep)) : null) : null,
      s.reviews ? tile("Reviews", W.num(s.reviews), null, prev ? W.compare(s.reviews, prev.reviews, prevLbl(rep)) : null) : null,
      s.recall != null ? tile("Recall", s.recall + "%", null, prev && prev.recall != null ? W.compare(s.recall, prev.recall, prevLbl(rep), "pct") : null) : null,
      s.quizzes ? tile("Quizzes", s.quizzes, s.quizPct != null ? "average " + s.quizPct + "%" : null) : null,
      s.exams ? tile("Exam questions", s.exams, s.max ? s.marks + " / " + s.max + " marks" : null) : null
    ]));
    var main = el("div", { class: "k-rp-main" }), side = el("div", { class: "k-rp-side" });
    if (s.topics.length) {
      main.appendChild(card("All " + W.plural(s.topics.length, "topic"), { className: "k-rp-card--table" }, [
        tableScroll(el("div", { class: "k-rp-tablewrap" }, [el("table", { class: "k-rp-table", "data-ui": "reports.topics-table" }, [
          el("thead", {}, [el("tr", {}, ["#", "Topic", "Time", "Reviews", "Recall", "Status"].map(function (h) { return el("th", { scope: "col", text: h }); }))]),
          el("tbody", {}, s.topics.map(function (t, i) {
            var st = statusText(t);
            return el("tr", {}, [
              el("td", { class: "k-mono k-rp-muted", text: String(i + 1) }),
              el("td", {}, [el("button", { type: "button", class: "k-rp-tlink", "data-ui": "reports.topic", title: t.title, onclick: function () { openTopic(t.key); } }, [
                dot(SUBJ_HUE[t.sid]), mono(t.ref, "k-rp-ref"), el("span", { class: "k-rp-tlink-t", text: t.title })])]),
              el("td", { class: "k-mono", text: t.mins ? W.hm(t.mins) : "" }),
              el("td", { class: "k-mono", text: t.reviews ? String(t.reviews) : "" }),
              el("td", { class: "k-mono", "data-tone": t.recall != null && t.recall < 60 ? "alarm" : null, text: t.recall != null ? t.recall + "%" : "" }),
              el("td", { "data-tone": st && st.tone, text: st ? st.text : "" })
            ]);
          }))
        ])]))
      ]));
    }
    if (s.decks) {
      main.appendChild(card("Flashcards by deck", {}, [
        el("ol", { class: "k-rp-decks" }, s.decks.map(function (d) {
          var max = Math.max.apply(null, s.decks.map(function (x) { return x.reviews; }).concat([1]));
          return el("li", {}, [el("span", { class: "k-rp-deck-l" }, [dot(SUBJ_HUE[d.sid]), el("span", { text: W.SUBJECT_SHORT[d.sid] + " · " + d.title })]),
            el("span", { class: "k-rp-bar", "aria-hidden": "true", style: "--w: " + (100 * d.reviews / max).toFixed(1) + "%; --c: " + SUBJ_HUE[d.sid] }),
            mono(String(d.reviews), "k-rp-bar-v"), mono(d.recall != null ? d.recall + "%" : "", "k-rp-deck-p")]);
        })),
        el("p", { class: "k-rp-note", text: W.plural(s.reviews, "review") + (s.recall != null ? " · " + s.recall + "% recall" : "") })
      ]));
    }
    side.appendChild(card(rep.period === "week" || rep.period === "month" ? "Time by day" : rep.period === "year" ? "Time by month" : "Time by week", {}, [periodChart(rep, { height: 180 })]));
    var hl = [];
    if (s.bestRecall) hl.push(highRow("Best recall", s.bestRecall.ref ? s.bestRecall.ref + " " + s.bestRecall.title : s.bestRecall.title, s.bestRecall.recall + "% over " + s.bestRecall.reviews + " reviews", "green", s.bestRecall.key));
    if (s.lowRecall) hl.push(highRow("Lowest recall", s.lowRecall.ref ? s.lowRecall.ref + " " + s.lowRecall.title : s.lowRecall.title, s.lowRecall.recall + "% over " + s.lowRecall.reviews + " reviews", "alarm", s.lowRecall.key));
    if (s.bestQuiz) hl.push(highRow("Best quiz", s.bestQuiz.title || "Quiz", s.bestQuiz.correct + " / " + s.bestQuiz.total + " · " + DOW[(parse(s.bestQuiz.date).getDay() + 6) % 7], "teal", s.bestQuiz.key));
    if (hl.length) side.appendChild(card("Highs and lows", {}, [el("ul", { class: "k-rp-highs" }, hl)]));
    var fl = [];
    if (s.firsts) {
      fl.push({ k: "First session", v: dayName(s.firsts.first.ts) + " " + clock(s.firsts.first.ts) + (s.firsts.first.label ? " · " + s.firsts.first.label : "") });
      if (s.firsts.last.ts !== s.firsts.first.ts) fl.push({ k: "Last session", v: dayName(s.firsts.last.ts) + " " + clock(s.firsts.last.ts) + (s.firsts.last.label ? " · " + s.firsts.last.label : "") });
      fl.push({ k: "Longest session", v: dayName(s.firsts.longest.ts) + " " + clock(s.firsts.longest.ts) + " · " + W.hm(s.firsts.longest.mins) + (s.firsts.longest.sid ? " · " + W.SUBJECT_SHORT[s.firsts.longest.sid] : "") });
    }
    if (fl.length || s.flow) {
      side.appendChild(card("Firsts, lasts and flow", {}, [
        fl.length ? kvRows(fl) : null,
        s.flow ? el("h3", { class: "k-rp-subhead", text: "What you studied next" }) : null,
        s.flow ? flowList(s.flow.map(function (x) { return { from: FLOW_LABEL[x.from] || x.from, fromHue: SUBJ_HUE[x.from] || "var(--teal)", to: FLOW_LABEL[x.to] || x.to, toHue: SUBJ_HUE[x.to] || "var(--teal)", n: x.n + "×" }; })) : null
      ].filter(Boolean)));
    }
    if (s.next) side.appendChild(nextUp(s.next));
    holder.appendChild(two(main, side));
  }
  /* a wide table scrolls sideways only through the shared scroller, a
     tab stop only while it overflows (invariant 50) */
  function tableScroll(wrap) {
    return KOS.ui.scroller(wrap, { label: "Topics table", className: "k-rp-tablescroll", tabWhenScrolls: true,
      prevLabel: "Scroll the table left", nextLabel: "Scroll the table right" });
  }
  function highRow(kicker, title, meta, tone, key) {
    return el("li", {}, [el("button", { type: "button", class: "k-rp-high", "data-tone": tone, "data-ui": "reports.topic", disabled: key ? null : "",
      onclick: function () { if (key) openTopic(key); } }, [
      el("span", { class: "k-rp-high-dot", "aria-hidden": "true" }),
      el("span", { class: "k-rp-high-txt" }, [el("span", { class: "k-rp-high-k", text: kicker }), el("b", { text: title })]),
      mono(meta, "k-rp-high-m")
    ])]);
  }
  function flowList(rows) {
    return el("ol", { class: "k-rp-flow" }, rows.map(function (r, i) {
      return el("li", {}, [r.rank ? mono("#" + (i + 1), "k-rp-rank") : null, dot(r.fromHue), el("b", { text: r.from }), el("span", { class: "k-rp-flow-arrow", "aria-label": "then", text: "→" }),
        dot(r.toHue), el("b", { text: r.to }), mono(r.n, "k-rp-flow-n")].filter(Boolean));
    }));
  }
  function nextUp(list) {
    var wk = KOS.pacing && KOS.pacing.currentWeek ? KOS.pacing.currentWeek() : null;
    return card("Next up", { meta: "the three lowest-recall topics" }, [el("ul", { class: "k-rp-next" }, list.map(function (t) {
      var add = wk ? el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "reports.add-plan", text: "Add to plan",
        "aria-label": "Add " + t.title + " to this week's plan",
        onclick: function () {
          var row = KOS.pacing.addEntry({ source: "personal", subject: t.sid, wb: wk.wb, title: "Revise " + t.title, refs: [t.ref] });
          if (row) { add.disabled = true; add.textContent = "Added"; KOS.a11y.announce(t.title + " added to this week's plan."); }
          else KOS.ui.toast("That topic could not be added to the plan.");
        } }) : null;
      return el("li", { class: "k-rp-next-row" }, [dot(SUBJ_HUE[t.sid]),
        el("span", { class: "k-rp-next-t" }, [el("b", { text: t.ref + " " + t.title }), el("span", { class: "k-rp-note", text: t.recall + "% recall" })]),
        add].filter(Boolean));
    }))]);
  }

  /* ---- 25d Focus and the plan ---- */
  function focusOverview(holder, rep) {
    var f = rep.facts, fo = f.focus, pl = f.plan, tk = f.tasks;
    overviewHead(holder, rep, "focus");
    var main = el("div", { class: "k-rp-main" }), side = el("div", { class: "k-rp-side" });
    if (fo.blocks && fo.list) {
      var modes = Object.keys(fo.modes || {}).sort(function (a, b) { return fo.modes[b] - fo.modes[a]; })
        .map(function (m) { return m.charAt(0).toUpperCase() + m.slice(1) + " " + fo.modes[m]; });
      var sids = SUBJECTS.filter(function (k) { return fo.list.some(function (b) { return b.sid === k; }); });
      main.appendChild(card("Every Focus block", { className: "k-rp-card--timeline" }, [
        timeline(rep, fo.list),
        el("div", { class: "k-rp-tl-foot" }, [subjLegend(sids), el("span", { class: "k-rp-note", text: [W.plural(fo.blocks, "block"), W.hm(fo.mins)].concat(modes).join(" · ") })])
      ]));
    }
    var pair = [];
    if (pl) pair.push(card("The plan · " + pl.ticked + " of " + W.plural(pl.planned, "row"), {}, [el("ul", { class: "k-rp-plan" }, pl.rows.map(planRow))]));
    if (tk && tk.done) {
      pair.push(card("Reminders · " + tk.reminders + " done", {}, [el("ul", { class: "k-rp-done" + (tk.done.length > 8 ? " k-rp-done--two" : "") }, tk.done.map(function (r) {
        return el("li", {}, [el("span", { class: "k-rp-done-mark", "aria-hidden": "true", text: "✓" }), el("span", { class: "k-rp-plan-t", title: r.title, text: r.title }), mono(dayName(r.at), "k-rp-plan-w")]);
      }))]));
    }
    if (pair.length) main.appendChild(masonry(pair, 2));
    if (fo.persona) side.appendChild(personaCard("Your Focus style this " + rep.period, fo.persona, "var(--amber)"));
    if (fo.lengths && fo.lengths.length >= 3) side.appendChild(card("How long", {}, [lengths(fo.lengths)]));
    /* roadmap 5.10 (frame 33v): the Routines card, in place of the habit
       table for any report saved with routines; older reports keep theirs */
    var rtf = rep.facts.routines;
    if (rtf && (rtf.rows || rtf.reviews)) {
      var rtKids = (rtf.rows || []).map(function (r) {
        var pct = r.of ? Math.round(100 * r.kept / r.of) : 0;
        return el("div", { class: "k-rp-rt-row" }, [
          el("span", { class: "k-rt-tile k-rt-tile--sm", lang: "ja", "aria-hidden": "true", text: r.mark || "習" }),
          el("span", { class: "k-rp-rt-n" }, [el("b", { text: r.name }), r.rest || r.n ? el("span", { class: "k-muted k-rt-small", text: [r.n ? W.plural(r.n, "habit") : null, r.rest ? W.plural(r.rest, "rest day") : null].filter(Boolean).join(" · ") }) : null]),
          el("span", { class: "k-bar", role: "img", "aria-label": r.kept + " of " + r.of + " kept", style: "--p: " + pct + "%" }, [el("i")]),
          mono(r.kept + " of " + r.of, "k-rp-rt-v")
        ]);
      });
      var foot = [];
      if (rtf.reviews) foot.push(el("div", {}, [el("span", { class: "k-muted k-rt-small", text: "Reviews done" }), el("div", { text: "Morning " + rtf.reviews.morning + " · Afternoon " + rtf.reviews.afternoon + " · Evening " + rtf.reviews.evening })]));
      if (rtf.mood != null || rtf.energy != null) foot.push(el("div", {}, [el("span", { class: "k-muted k-rt-small", text: "Mood · energy, average" }),
        el("div", { text: (rtf.mood != null ? rtf.mood : "—") + " · " + (rtf.energy != null ? rtf.energy : "—") }), el("span", { class: "k-muted k-rt-small", text: "private · never in Kurenai's words" })]));
      if (foot.length) rtKids.push(el("div", { class: "k-rp-rt-foot" }, foot));
      side.appendChild(card("Routines" + (rtf.kept ? " · " + rtf.kept + " kept" : ""), { more: "History", go: function () { KOS.show("routines", "history"); } }, rtKids));
    } else if (tk && tk.habits) {
      side.appendChild(card("Habits · " + tk.habits.length + " kept", {}, [el("table", { class: "k-rp-habits" }, [
        el("thead", {}, [el("tr", {}, [el("th", { scope: "col", class: "sr-only", text: "Habit" })].concat(DOW.map(function (d) { return el("th", { scope: "col", "aria-label": d, text: d.charAt(0) }); })))]),
        el("tbody", {}, tk.habits.map(function (h) {
          return el("tr", {}, [el("th", { scope: "row", text: h.text })].concat((h.days || []).map(function (on, i) {
            return el("td", {}, [el("span", { class: "k-rp-habit", "data-state": on ? "on" : null, "aria-label": DOW[i] + ": " + (on ? "kept" : "not kept") })]);
          })));
        }))
      ])]));
    }
    if (!main.children.length && !side.children.length) {
      holder.appendChild(KOS.ui.emptyState({ mark: "集", title: "No Focus blocks or plan rows this " + rep.period, compact: true }));
      return;
    }
    if (!side.children.length) { holder.appendChild(main); return; }
    if (!main.children.length) { holder.appendChild(side); return; }
    holder.appendChild(two(main, side));
  }
  function personaCard(kicker, p, hue) {
    return el("section", { class: "k-rp-card k-rp-persona", "data-ui": "reports.persona", "aria-label": kicker, style: "--c: " + hue }, [
      el("span", { class: "k-kicker", text: kicker }),
      el("b", { class: "k-rp-persona-name", text: p.name }),
      el("p", { text: p.fact }),
      p.kanji ? el("span", { class: "k-rp-persona-ghost", lang: "ja", "aria-hidden": "true", text: p.kanji }) : null
    ].filter(Boolean));
  }
  /* every block where it happened: a row a day, 07–23 */
  function timeline(rep, list) {
    var from = HEAT_FROM * 60, to = 23 * 60, span = to - from;
    var busiest = -1, best = 0;
    var rows = DOW.map(function (d, i) {
      var day = KOS.report.addDays(rep.start, i);
      var mine = list.filter(function (b) { return dateIso(new Date(b.ts)) === day; });
      var tot = mine.reduce(function (a, b) { return a + b.mins; }, 0);
      if (tot > best) { best = tot; busiest = i; }
      return { d: d, mine: mine };
    }).map(function (r, i) {
      return el("li", { class: "k-rp-tl-row", "data-state": i === busiest ? "hi" : null }, [el("span", { class: "k-rp-tl-d", text: r.d }), el("span", { class: "k-rp-tl-track" }, r.mine.map(function (b) {
        var st = new Date(b.ts), m = st.getHours() * 60 + st.getMinutes();
        var left = Math.max(0, Math.min(100, 100 * (m - from) / span)), w = Math.max(1.4, Math.min(100 - left, 100 * b.mins / span));
        return el("span", { class: "k-rp-tl-b", style: "--l: " + left.toFixed(2) + "%; --w: " + w.toFixed(2) + "%; --c: " + (SUBJ_HUE[b.sid] || "var(--teal)"),
          title: r.d + " " + clock(b.ts) + " · " + W.hm(b.mins) + (b.sid ? " · " + W.SUBJECT_SHORT[b.sid] : "") }, [b.mins >= 60 ? el("span", { class: "k-mono", text: b.mins + "m" }) : null].filter(Boolean));
      }))]);
    });
    var axis = el("li", { class: "k-rp-tl-row k-rp-tl-axis", "aria-hidden": "true" }, [el("span", {}), el("span", { class: "k-rp-tl-track" },
      [7, 9, 11, 13, 15, 17, 19, 21, 23].map(function (h) { return el("span", { class: "k-rp-tl-x", style: "--l: " + (100 * (h * 60 - from) / span).toFixed(2) + "%", text: pad2(h) }); }))]);
    return el("ol", { class: "k-rp-tl", role: "img", "aria-label": W.plural(list.length, "Focus block") + " drawn by day and time of day" }, rows.concat([axis]));
  }
  function dateIso(d) { return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()); }
  function lengths(ls) {
    var b = [0, 0, 0, 0, 0], labels = ["≤15", "15–30", "30–45", "45–60", "60+"];
    ls.forEach(function (m) { b[m <= 15 ? 0 : m <= 30 ? 1 : m <= 45 ? 2 : m <= 60 ? 3 : 4]++; });
    var max = Math.max.apply(null, b), hi = b.indexOf(max);
    var sorted = ls.slice().sort(function (x, y) { return x - y; }), med = sorted[sorted.length >> 1];
    return el("div", { class: "k-rp-histwrap" }, [el("ol", { class: "k-rp-hist", role: "img", "aria-label": labels.map(function (l, i) { return l + " min: " + b[i]; }).join(", ") }, b.map(function (n, i) {
      return el("li", { "data-state": i === hi ? "hi" : null }, [histTrack(n, max), mono(labels[i], "k-rp-hist-l")]);
    })), el("p", { class: "k-rp-note", text: "Minutes per block · median " + med })]);
  }

  /* ---- 25b Collection ---- */
  function collectionOverview(holder, rep) {
    var f = rep.facts, c = f.collection;
    overviewHead(holder, rep, "collection");
    if (!c) {
      /* the headline says nothing moved; the page offers the way back
         rather than a screen of nothing */
      holder.appendChild(KOS.ui.emptyState({ mark: "蒐", compact: true,
        body: "Study, Focus and the plan for " + longRange(rep.start, rep.end) + " are in the report.",
        action: el("button", { type: "button", class: "k-btn", "data-ui": "reports.back", text: "Back to " + weekOf(rep), onclick: function () { open(rep); } }) }));
      return;
    }
    var u = c.units || {}, st = c.status || {};
    var vnGame = (c.byModule.vn || 0) + (c.byModule.game || 0);
    holder.appendChild(tiles([
      tile("Titles", c.count, MODULES.filter(function (m) { return c.byModule[m]; }).slice(0, 2).map(function (m) { return c.byModule[m] + " " + MOD_SHORT[m].toLowerCase(); }).join(" · ")),
      u.ep ? tile("Episodes", W.num(u.ep), c.byModule.anime && c.estMins ? null : null) : null,
      u.ch ? tile("Chapters", W.num(u.ch), u.vol ? "+ " + W.plural(u.vol, "volume") : null) : (u.vol ? tile("Volumes", W.num(u.vol), null) : null),
      vnGame && u.hours ? tile("VN and games", W.hm(u.hours * 60), u.route ? W.plural(u.route, "route") + " finished" : null) : null,
      st.finished ? tile("Finished", st.finished, st.started ? st.started + " started" : null) : (st.started ? tile("Started", st.started, null) : null),
      c.scores ? tile("Scored", c.scores.n, "average " + c.scores.avg) : null,
      c.busiest && rep.period === "week" ? tile("Busiest day", DOW[(parse(c.busiest.date).getDay() + 6) % 7], W.plural(c.busiest.titles, "title") + (c.busiest.mins ? " · ≈ " + W.hm(c.busiest.mins) : "")) : null
    ]));
    var main = el("div", { class: "k-rp-main" }), side = el("div", { class: "k-rp-side" });
    if (rep.facts.mediaPersona) side.appendChild(personaCard("Your Collection style", rep.facts.mediaPersona, MOD_HUE[rep.facts.mediaPersona.hue] || "var(--anime)"));
    if (c.monthTitles && Object.keys(c.monthTitles).length) {
      var mkeys = MODULES.filter(function (m) { return c.byModule[m]; });
      var months = [], d0 = parse(rep.start);
      for (var mi = 0; mi < 12; mi++) {
        var dm0 = new Date(d0.getFullYear(), d0.getMonth() + mi, 1);
        if (dm0 > parse(rep.end)) break;
        var key = dm0.getFullYear() + "-" + (dm0.getMonth() < 9 ? "0" : "") + (dm0.getMonth() + 1);
        months.push({ label: MONTHS[dm0.getMonth()], parts: c.monthTitles[key] || {} });
      }
      main.appendChild(card("Titles by month", { right: legend(mkeys.map(function (m) { return { hue: MOD_HUE[m], label: MOD_SHORT[m] + " " + c.byModule[m] }; })) }, [fluid(function (w) {
        var mc = stacked(months, mkeys, MOD_HUE, { height: 200, width: w });
        mc.setAttribute("role", "img");
        mc.setAttribute("aria-label", "Titles touched per month");
        return mc;
      })]));
    }
    main.appendChild(everyTitle(c));
    if (c.topRated && c.topRated.length >= 3 && rep.period !== "week") {
      main.appendChild(card("Top rated · " + W.plural(c.topRated.length, "title"), {}, [el("ol", { class: "k-rp-shelf" }, c.topRated.map(function (t) {
        return el("li", {}, [el("span", { class: "k-rp-cell-art" }, [cover(coverOf(c, t)), el("span", { class: "k-rp-badge", "data-tone": t.score >= 8 ? "green" : null, text: String(t.score) })]),
          el("span", { class: "k-rp-cell-t", text: t.title })]);
      }))]));
    }
    var pair = [];
    if (c.scores) pair.push(card("Scores", {}, [hiLo(c, { covers: true }), scoreHist(c.scores)].filter(Boolean)));
    if (c.dayTitles) {
      var keys = MODULES.filter(function (m) { return c.byModule[m]; });
      var totals = c.dayTitles.map(function (d) { return Object.keys(d).reduce(function (a, k) { return a + d[k]; }, 0); });
      var all = totals.reduce(function (a, b) { return a + b; }, 0);
      var wkShare = all ? Math.round(100 * (totals[5] + totals[6]) / all) : 0;
      pair.push(card("Day by day", {}, [fluid(function (w) {
        var ch = stacked(DOW.map(function (d, i) { return { label: d, parts: c.dayTitles[i] }; }), keys, MOD_HUE, { height: 170, width: w, maxBar: 34 });
        ch.setAttribute("role", "img");
        ch.setAttribute("aria-label", "Titles touched per day: " + DOW.map(function (d, i) { return d + " " + totals[i]; }).join(", "));
        return ch;
      }, 300), el("p", { class: "k-rp-note", text: "Titles touched per day" + (wkShare ? " · the weekend took " + wkShare + "%" : "") })]));
    }
    var statusRows = [["finished", "Finished", "var(--green)"], ["started", "Started", "var(--teal)"], ["continued", "Continued", "var(--text-2)"],
      ["paused", "Paused", "var(--amber)"], ["dropped", "Dropped", "var(--alarm)"]].filter(function (r) { return st[r[0]]; });
    if (statusRows.length) {
      pair.push(card("Status this " + rep.period, {}, [
        splitBar(statusRows.map(function (r) { return { label: r[1], value: st[r[0]], text: String(st[r[0]]), hue: r[2] }; })),
        kvRows(statusRows.map(function (r) { return { k: r[1], v: String(st[r[0]]), hue: r[2] }; }))
      ]));
    }
    if (c.countries.length || c.formats.length) {
      pair.push(card("Where it came from", {}, [
        c.countries.length ? bars(c.countries.map(function (x) { return { label: countryName(x.name), value: x.n, text: String(x.n), hue: "var(--crimson)" }; })) : null,
        c.formats.length ? el("h3", { class: "k-rp-subhead", text: "Formats" }) : null,
        c.formats.length ? bars(c.formats.map(function (x) { return { label: formatName(x.name), value: x.n, text: String(x.n), hue: formatHue(x.name) }; })) : null
      ].filter(Boolean)));
    }
    if (pair.length) main.appendChild(masonry(pair, 2));
    if (c.flow) main.appendChild(card("Genre flow", { meta: "what you started next, after finishing an episode or chapter" }, [flowList(c.flow.map(function (x, i) {
      return { rank: true, from: x.from, fromHue: GENRE_HUE[i % 5], to: x.to, toHue: GENRE_HUE[(i + 1) % 5], n: W.plural(x.n, "switch", "switches") };
    }))]));
    if (c.genres.length) {
      side.appendChild(card("Genre DNA", {}, [el("ol", { class: "k-rp-dna" }, c.genres.map(function (g, i) {
        var covers = c.titles.filter(function (t) { return (t.genres || []).indexOf(g.name) !== -1; }).slice(0, 3);
        return el("li", { class: "k-rp-dna-row", style: "--c: " + GENRE_HUE[i] }, [
          el("span", { class: "k-rp-dna-h" }, [mono("#" + (i + 1), "k-rp-dna-r"), el("b", { text: g.name }),
            el("span", { class: "k-rp-note", text: W.plural(g.n, "title") }), mono(g.pct + "%", "k-rp-dna-p")]),
          el("span", { class: "k-rp-dna-b" }, [
            el("span", { class: "k-rp-bar", "aria-hidden": "true", style: "--w: " + Math.min(100, g.pct * 1.6) + "%; --c: " + GENRE_HUE[i] }),
            el("span", { class: "k-rp-dna-covers", "aria-hidden": "true" }, covers.map(function (t) { return cover(t, "k-rp-cover--tiny"); }))
          ])
        ]);
      }))]));
    }
    if (c.tags.length) {
      side.appendChild(card("Tags and themes", {}, [el("ul", { class: "k-rp-tags" }, c.tags.map(function (t, i) {
        return el("li", { class: "k-rp-tag", "data-tone": i < 3 ? "lead" : null }, [el("span", { text: t.name }), mono(String(t.n))]);
      })), el("p", { class: "k-rp-note", text: W.plural(c.tags.length, "tag") + " this " + rep.period })]));
    }
    var cr = [];
    function firstCover(names) { var t = c.titles.filter(function (x) { return names.indexOf(x.title) !== -1; })[0]; return t || null; }
    if (c.studio) cr.push(["Top studio", c.studio.name, W.plural(c.studio.n, "anime", "anime") + " · " + c.studio.titles.join(", "), firstCover(c.studio.titles), "var(--anime)"]);
    if (c.author) cr.push(["Top author", c.author.name, W.plural(c.author.n, "title") + " · " + c.author.titles.join(", "), firstCover(c.author.titles), "var(--books)"]);
    if (cr.length) side.appendChild(card("Creators", {}, [el("ul", { class: "k-rp-creators" }, cr.map(function (r) {
      return el("li", { style: "--c: " + r[4] }, [r[3] ? cover(r[3], "k-rp-cover--creator") : el("span", {}),
        el("span", { class: "k-rp-creator-t" }, [el("span", { class: "k-rp-creator-k", text: r[0] }), el("b", { text: r[1] }), el("span", { class: "k-rp-note", text: r[2] })])]);
    }))]));
    holder.appendChild(side.children.length ? two(main, side) : main);
  }
  var COUNTRY = { JP: "Japan", KR: "South Korea", CN: "China", TW: "Taiwan", US: "United States", GB: "United Kingdom", FR: "France" };
  function countryName(c) { return COUNTRY[c] || c; }
  var FORMAT = { TV: "TV", TV_SHORT: "TV short", MOVIE: "Film", SPECIAL: "Special", OVA: "OVA", ONA: "ONA", MUSIC: "Music",
    MANGA: "Manga", NOVEL: "Light novel", ONE_SHOT: "One-shot", lightNovel: "Light novel", manga: "Manga", oneShot: "One-shot" };
  function formatName(f) { return FORMAT[f] || f; }
  function formatHue(f) {
    if (/^(TV|TV_SHORT|MOVIE|SPECIAL|OVA|ONA|MUSIC)$/.test(f)) return "var(--anime)";
    if (f === "Visual novel") return "var(--vn)";
    if (f === "Game") return "var(--games)";
    return "var(--books)";
  }
  /* one histogram column: the count sits on its bar */
  function histTrack(n, max) {
    return el("span", { class: "k-rp-hist-track" }, [n ? mono(String(n), "k-rp-hist-n") : null,
      el("span", { class: "k-rp-hist-bar", style: "--h: " + (n ? Math.max(4, 100 * n / max) : 0).toFixed(1) + "%" })].filter(Boolean));
  }
  function scoreHist(sc) {
    var max = Math.max.apply(null, sc.hist.concat([1]));
    return el("div", { class: "k-rp-histwrap" }, [el("ol", { class: "k-rp-hist k-rp-hist--scores", role: "img",
      "aria-label": "Scores given: " + sc.hist.map(function (n, i) { return n ? (i + 1) + ": " + n : null; }).filter(Boolean).join(", ") }, sc.hist.map(function (n, i) {
      var tone = i + 1 >= 8 ? "green" : i + 1 <= 4 ? "alarm" : null;
      return el("li", { "data-tone": tone }, [histTrack(n, max), mono(String(i + 1), "k-rp-hist-l")]);
    })), el("p", { class: "k-rp-note", text: W.plural(sc.n, "score") + " given" + (sc.range ? " · range " + W.plural(sc.range, "point") : "") + " · median " + sc.median })]);
  }
  function everyTitle(c) {
    var box = el("section", { class: "k-rp-card k-rp-titles", "data-ui": "reports.card reports.titles", "aria-label": "Every title" });
    function draw() {
      box.textContent = "";
      var mods = MODULES.filter(function (m) { return c.byModule[m]; });
      var filter = KOS.ui.tabs([{ label: "All", count: c.count, active: view.coll.module === "all", onSelect: function () { view.coll.module = "all"; draw(); } }]
        .concat(mods.map(function (m) { return { label: MOD_SHORT[m], count: c.byModule[m], active: view.coll.module === m, onSelect: function () { view.coll.module = m; draw(); } }; })),
        { variant: "workspace", label: "Medium", className: "k-rp-filter", edge: true });
      var layout = KOS.ui.tabs([["covers", "Covers"], ["list", "List"]].map(function (x) {
        return { label: x[1], active: view.coll.layout === x[0], onSelect: function () { view.coll.layout = x[0]; draw(); } };
      }), { variant: "workspace", label: "Layout", className: "k-rp-layout" });
      var sort = el("select", { class: "k-rp-sort", "data-ui": "reports.sort", "aria-label": "Sort titles",
        onchange: function () { view.coll.sort = sort.value; draw(); } },
        [["time", "Sort: most time"], ["newest", "Sort: newest"], ["score", "Sort: score"]].map(function (o) {
          return el("option", { value: o[0], text: o[1], selected: view.coll.sort === o[0] ? "" : null });
        }));
      sort.value = view.coll.sort;
      box.appendChild(el("div", { class: "k-rp-titles-bar" }, [filter, el("span", { class: "k-rp-titles-ctl" }, [layout, sort])]));
      var list = c.titles.filter(function (t) { return view.coll.module === "all" || t.module === view.coll.module; });
      list = list.slice().sort(view.coll.sort === "score" ? function (a, b) { return (b.score || 0) - (a.score || 0); }
        : view.coll.sort === "newest" ? function (a, b) { return (b.lastTs || 0) - (a.lastTs || 0); }
        : function (a, b) { return (b.mins || 0) - (a.mins || 0) || (b.lastTs || 0) - (a.lastTs || 0); });
      var grid;
      if (view.coll.layout === "list") {
        grid = el("ul", { class: "k-rp-tlist", "data-ui": "reports.title-list" }, list.map(function (t) {
          return el("li", {}, [cover(t, "k-rp-cover--row"), el("span", { class: "k-rp-tlist-t" }, [el("b", { text: t.title }), el("span", { class: "k-rp-note", text: MOD_SHORT[t.module] + (t.range ? " · " + t.range : "") })]),
            t.status === "finished" ? el("span", { class: "k-chip", "data-tone": "green", text: "✓ finished" }) : t.status === "dropped" ? el("span", { class: "k-chip", "data-tone": "danger", text: "dropped" }) : el("span", {}),
            t.score ? mono(String(t.score), "k-rp-score") : el("span", {})]);
        }));
      } else {
        grid = el("ul", { class: "k-rp-covers", "data-ui": "reports.cover-grid", "data-state": view.coll.all ? null : "collapsed" }, list.map(function (t) {
          return el("li", { class: "k-rp-cell" }, [
            el("span", { class: "k-rp-cell-art" }, [cover(t),
              t.score ? el("span", { class: "k-rp-badge", "data-tone": t.score >= 8 ? "green" : t.score <= 4 ? "alarm" : null, text: String(t.score) }) : null,
              t.status === "finished" ? el("span", { class: "k-rp-fin", title: "Finished", text: "✓" }) : t.status === "dropped" ? el("span", { class: "k-rp-drop", text: "dropped" }) : null
            ].filter(Boolean)),
            el("span", { class: "k-rp-cell-t", title: t.title, text: t.title }),
            t.range ? mono(t.range, "k-rp-cell-r") : null
          ].filter(Boolean));
        }));
      }
      box.appendChild(grid);
      if (view.coll.layout !== "list" && !view.coll.all && list.length > 9) {
        box.appendChild(el("button", { type: "button", class: "k-btn k-rp-showall", "data-ui": "reports.show-all", text: "Show all " + list.length,
          onclick: function () { view.coll.all = true; draw(); } }));
      }
    }
    draw();
    return box;
  }

  /* ================= the Home card (24h) =================
     The newest report, in Home's middle column between Study hours and the
     week's plan: its headline, three facts and the week's chart, and
     "Read the report". "New" until it has been read — and it stays the
     full card after reading (review: a one-line row left the column
     empty). Two or more unread from one morning list the others under it.
     Filled after the store answers; with no report at all the slot stays
     hidden and the plan takes the column. Reading is a click, never a
     render: "Read the report" (and the bell) mark the notification read. */
  function homeCard() {
    var slot = el("section", { class: "k-card k-rp-home", "data-ui": "reports.home-card", "aria-label": "Your latest report", hidden: "" });
    if (!KOS.reportStore || !KOS.reportStore.available()) return slot;
    KOS.reportStore.list(null, function (err, all) {
      if (err || !all || !all.length) return;
      var ORDER = { week: 0, month: 1, term: 2, year: 3 };
      function isRead(r) { return !!(KOS.notify && KOS.notify.isRead && KOS.notify.isRead({ id: "reports:" + r.id })); }
      /* the newest of each period, saved in the last 7 days */
      var fresh = [];
      ["week", "month", "term", "year"].forEach(function (pd) {
        var r = all.filter(function (x) { return x.period === pd; })[0];
        if (r && Date.now() - r.savedAt <= 7 * 864e5) fresh.push(r);
      });
      var unread = fresh.filter(function (r) { return !isRead(r); }).sort(function (a, b) { return ORDER[a.period] - ORDER[b.period]; });
      var weeks = all.filter(function (x) { return x.period === "week"; });
      var rep = unread[0] || weeks[0] || all[0];
      var others = unread.filter(function (r) { return r !== rep; });
      var nid = "reports:" + rep.id, isNew = !isRead(rep);
      var w = W.current(rep), f = rep.facts, s = f.study;
      function read(r) { return function () { if (KOS.notify && KOS.notify.markRead) KOS.notify.markRead("reports:" + r.id); open(r); }; }
      slot.removeAttribute("hidden");
      KOS.ui.state(slot, "new", isNew);
      var facts = [[W.hm(s.mins), "studied"]];
      if (s.recall != null) facts.push([s.recall + "%", "recall"]);
      else if (s.reviews) facts.push([W.num(s.reviews), "reviews"]);
      if (f.gov.streak) facts.push([W.plural(f.gov.streak, "day"), "streak"]);
      else if (f.collection && f.collection.count) facts.push([W.num(f.collection.count), "titles"]);
      slot.appendChild(el("div", { class: "k-rp-home-top" }, [
        el("span", { class: "k-kicker", text: rep.period === "week" ? "Week in review · " + range(rep.start, rep.end) : weekOf(rep) + " in review" }),
        isNew ? el("span", { class: "k-rp-new", text: others.length ? (others.length + 1) + " new" : "New" }) : null
      ].filter(Boolean)));
      slot.appendChild(el("h2", { class: "k-rp-home-h", text: w.headline }));
      slot.appendChild(el("dl", { class: "k-rp-home-facts" }, facts.slice(0, 3).map(function (x) {
        return el("div", {}, [el("dd", { class: "k-mono", text: x[0] }), el("dt", { text: x[1] })]);
      })));
      slot.appendChild(homeChart(rep));
      if (others.length) {
        slot.appendChild(el("ul", { class: "k-rp-home-multi" }, others.map(function (r) {
          return el("li", {}, [el("button", { type: "button", class: "k-rp-home-row", "data-ui": "reports.home-open", onclick: read(r) }, [
            el("span", { class: "k-rp-home-seal", lang: "ja", "aria-hidden": "true", text: SEAL[r.period] }),
            el("span", { class: "k-rp-home-row-t" }, [mono(weekOf(r)), el("span", { text: W.current(r).headline })]),
            el("span", { class: "k-rp-chev", "aria-hidden": "true" }, [KOS.ui.icon("chev-right")])])]);
        })));
      }
      slot.appendChild(el("button", { type: "button", class: "k-rp-home-go", "data-ui": "reports.home-open", onclick: read(rep) }, [
        el("span", { text: "Read the report" }),
        el("span", { class: "k-rp-home-arrow", "aria-hidden": "true" }, [KOS.ui.icon("arrow-right")])
      ]));
    });
    return slot;
  }
  /* the card's chart: the week's days (or the period's own chart),
     stacked by subject, filling whatever height the row gives it */
  function homeChart(rep) {
    var s = rep.facts.study;
    var vals = rep.period === "week" ? s.dayMins : (rep.facts.strip ? rep.facts.strip.map(function (c) { return c.f ? c.f.mins : 0; }) : s.dayMins);
    var parts = rep.period === "week" || !rep.facts.strip ? (s.daySubj || []) : rep.facts.strip.map(function (c) { return c.f ? c.f.bySubject || {} : {}; });
    var labels = rep.period === "week" ? DOW.map(function (d) { return d.charAt(0); }) : null;
    var max = Math.max.apply(null, vals.concat([1]));
    return el("ol", { class: "k-rp-home-chart", role: "img", style: "--n: " + vals.length,
      "aria-label": "Study by " + (rep.period === "week" ? "day" : rep.period === "month" ? "day" : rep.period === "year" ? "month" : "week") + ": " + W.hm(s.mins) + " in all" },
      vals.map(function (tot, i) {
        var p = parts[i] || {};
        return el("li", {}, [
          el("span", { class: "k-rp-home-track" }, [el("span", { class: "k-rp-home-col", style: "--h: " + (100 * (tot || 0) / max).toFixed(1) + "%" }, SUBJECTS.filter(function (k) { return p[k]; }).map(function (k) {
            return el("span", { style: "--c: " + SUBJ_HUE[k] + "; --f: " + (p[k] / (tot || 1)).toFixed(3) });
          }).concat(SUBJECTS.some(function (k) { return p[k]; }) || !tot ? [] : [el("span", { style: "--c: var(--teal); --f: 1" })]))]),
          labels ? el("span", { class: "k-rp-home-x", text: labels[i] }) : null
        ].filter(Boolean));
      }));
  }
  KOS.reportsHomeCard = homeCard;

  /* the parts the month, term and year pages share (reportlong.js) */
  KOS.reportsKit = {
    el: el, mono: mono, dot: dot, card: card, cardHead: cardHead, more: more, tile: tile, tiles: tiles, crumbs: crumbs,
    stacked: stacked, fluid: fluid, pack: pack, masonry: masonry, two: two, rideAlong: rideAlong, legend: legend, subjLegend: subjLegend,
    bars: bars, kvRows: kvRows, codeCard: codeCard, examsCard: examsCard, moneyCard: moneyCard, goalsCard: goalsCard, kurenaiSees: kurenaiSees, splitBar: splitBar, dayTiles: dayTiles, daySubjChart: daySubjChart,
    cover: cover, coverOf: coverOf, heat: heat, lengths: lengths, personaChip: personaChip, personaCard: personaCard, hiLo: hiLo,
    flowList: flowList, nextUp: nextUp, topicRows: topicRows, genreBars: genreBars,
    open: open, openTopic: openTopic, wordsBlock: wordsBlock, shareActions: shareActions, rebuiltChip: rebuiltChip, reportTop: reportTop,
    saved: saved, range: range, dm: dm, parse: parse, longRange: longRange, weekOf: weekOf, spanOf: spanOf, statusText: statusText,
    unitText: unitText, scoreHist: scoreHist, countryName: countryName, formatName: formatName,
    SUBJ_HUE: SUBJ_HUE, MOD_HUE: MOD_HUE, MOD_SHORT: MOD_SHORT, MODULES: MODULES, SUBJECTS: SUBJECTS, BAND: BAND, DOW: DOW,
    MONTHS: MONTHS, MONTH_LONG: MONTH_LONG, PERIOD_KICKER: PERIOD_KICKER, GENRE_HUE: GENRE_HUE, SEAL: SEAL, view: view
  };

  /* ================= the view ================= */
  /* arg: {period, start, section} — or a notification's {period, id} */
  function normArg(arg) {
    arg = arg || {};
    var out = { period: PERIODS.some(function (x) { return x[0] === arg.period; }) ? arg.period : "week", start: null, section: null };
    if (typeof arg.id === "string" && /^(week|month|term|year):/.test(arg.id) && !arg.period) out.period = arg.id.slice(0, arg.id.indexOf(":"));
    if (arg.start && /^\d{4}-\d{2}-\d{2}$/.test(arg.start)) out.start = arg.start;
    else if (typeof arg.id === "string" && /:\d{4}-\d{2}-\d{2}$/.test(arg.id)) out.start = arg.id.slice(arg.id.indexOf(":") + 1);
    else if (typeof arg.id === "string" && /^month:\d{4}-\d{2}$/.test(arg.id)) out.start = arg.id.slice(6) + "-01";
    else if (typeof arg.id === "string" && /^year:\d{4}$/.test(arg.id)) out.start = arg.id.slice(5) + "-09-01";
    if (out.start && SECTIONS[arg.section]) out.section = arg.section;
    return out;
  }
  KOS.views.reports = function (main, arg) {
    if (KOS.shell && KOS.shell.tree) KOS.shell.tree("none");
    arg = normArg(arg);
    var holder = el("div", { class: "k-rp", "data-ui": "reports.page" });
    main.appendChild(holder);
    if (!KOS.reportStore || !KOS.reportStore.available()) {
      holder.appendChild(KOS.ui.pageHeader({ kicker: "Home", title: "Reports" }));
      holder.appendChild(KOS.ui.emptyState({ mark: "録", title: "Reports need this browser's storage", body: "This browser does not offer IndexedDB, where saved reports are kept." }));
      return;
    }
    if (!arg.start) view.coll.all = false;
    KOS.reportStore.list(arg.period, function (err, reps) {
      if (!holder.isConnected) return;   // the page moved on while the store answered
      reps = err ? [] : reps;
      if (!arg.start) { indexPage(holder, reps, arg.period); return; }
      var rep = reps.filter(function (r) { return r.start === arg.start; })[0];
      if (!rep) {
        var what = arg.period === "week" ? "the week of " + dm(arg.start) : arg.period === "month" ? MONTH_LONG[parse(arg.start).getMonth()] + " " + parse(arg.start).getFullYear() : "this " + arg.period;
        holder.appendChild(crumbs([{ label: "Reports", go: function () { KOS.show("reports", { period: arg.period }); } }, { label: what.charAt(0).toUpperCase() + what.slice(1) }]));
        holder.appendChild(KOS.ui.emptyState({ mark: "録", title: "No report for " + what,
          body: "A report is saved when its period ends. This one has not been written yet, or this device was not open for it." }));
        return;
      }
      if (arg.section === "study") studyOverview(holder, rep);
      else if (arg.section === "focus") focusOverview(holder, rep);
      else if (arg.section === "collection") collectionOverview(holder, rep);
      else if (rep.period !== "week" && KOS.reportsLong) KOS.reportsLong.page(holder, rep, reps);
      else reportPage(holder, rep);
    });
  };
})();
