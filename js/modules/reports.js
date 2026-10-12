/* Kurenai OS — modules/reports.js
   Reports (roadmap 5.1, design turns 24–25): the page under Home.

     #/reports                          the Reports page (24a): the chosen
                                        report on the left, Earlier
                                        reports on the right
     #/reports/week/<start>             one report (25a): the hero, eight
                                        tiles, Study · Focus · the plan,
                                        the Collection, Governor & Kurenai
     #/reports/week/<start>/<section>   its full overview, inside Reports
                                        (25b Collection, 25c Study,
                                        25d Focus and the plan)

   A report is READ, never built here: the facts were saved when the week
   ended (core/reportstore.js) and this page only draws them, so selecting
   a past report swaps the view and recomputes nothing (README rule 7). A
   render writes nothing (invariant 102, smoke56); the only writes are a
   click's — "Add to plan" adds a plan row.

   The README's rules were applied when the facts were built (a supporting
   zero is absent, evidence floors, comparisons as values); this file
   follows them by drawing what is there and leaving out what is not.  */
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
  var HEAT_FROM = 7;

  /* per-visit view state (never saved: a filter is not data) */
  var view = { selected: null, coll: { module: "all", layout: "covers", sort: "time", all: false } };

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
    return DOW[0] + " " + dm(start) + " – " + DOW[6] + " " + dm(end);
  }
  function weekOf(rep) { return "Week of " + dm(rep.start); }
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
  function cardHead(title, opts) {
    opts = opts || {};
    return el("div", { class: "k-card-head" }, [
      el("h2", { class: "k-card-title", text: title }),
      opts.meta ? el("span", { class: "k-card-meta", text: opts.meta }) : null,
      opts.go ? el("button", { type: "button", class: "k-link", "data-ui": "reports.overview-link", text: "Full overview ›",
        "aria-label": "Full overview: " + title, onclick: opts.go }) : null
    ].filter(Boolean));
  }
  function card(title, opts, children) {
    opts = opts || {};
    return el("section", { class: "k-card k-rp-card" + (opts.className ? " " + opts.className : ""), "data-ui": "reports.card" + (opts.hook ? " " + opts.hook : ""),
      "aria-label": title }, [cardHead(title, opts)].concat((children || []).filter(Boolean)));
  }
  function tile(label, value, sub, cmp) {
    if (value == null || value === "") return null;
    var t = KOS.ui.statTile({ label: label, value: value, sub: sub || null, className: "k-rp-tile" });
    if (cmp) t.appendChild(el("span", { class: "k-rp-cmp", "data-tone": cmp.dir === "up" || cmp.dir === "new" ? "up" : null, text: cmp.text }));
    return t;
  }
  function tiles(list) {
    return el("div", { class: "k-rp-tiles", "data-ui": "reports.tiles" }, list.filter(Boolean));
  }
  function crumbs(parts) {
    var nav = el("nav", { class: "k-rp-crumbs", "aria-label": "Breadcrumb" });
    parts.forEach(function (p, i) {
      if (i) nav.appendChild(el("span", { class: "k-rp-crumb-sep", "aria-hidden": "true", text: "›" }));
      nav.appendChild(p.go
        ? el("button", { type: "button", class: "k-link k-rp-crumb", "data-ui": "reports.crumb", text: p.label, onclick: p.go })
        : el("span", { class: "k-rp-crumb", "aria-current": "page", text: p.label }));
    });
    return nav;
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
      title: "Built after the week from the session history: status moves, title progress and some earnings were not recorded then.",
      text: "Rebuilt from history" }) : null;
  }

  /* ---------------- charts (hand-built SVG, invariant 27) ---------------- */
  var svgNode = function (t, a) { return KOS.charts.svgNode(t, a); };
  function paint(n, prop, v) { n.style[prop] = v; return n; }
  /* stacked columns: cols = [{label, parts: {key: value}}], order of keys,
     a hue per key; values are minutes printed as hours, or counts */
  function stacked(cols, keys, hues, opts) {
    opts = opts || {};
    var Wd = opts.width || 520, H = opts.height || 190, padL = 34, padR = 8, padT = 10, padB = 26;
    var s = KOS.charts.svgEl(Wd, H);
    s.setAttribute("class", "k-rp-chart");
    var hours = opts.unit === "mins";
    var totals = cols.map(function (c) { return keys.reduce(function (a, k) { return a + (c.parts[k] || 0); }, 0); });
    var maxV = Math.max(1, Math.max.apply(null, totals));
    var maxU = hours ? Math.max(1, Math.ceil(maxV / 60)) : maxV;
    var plotH = H - padT - padB, n = cols.length, gap = n > 14 ? 3 : 10;
    var bw = Math.max(4, (Wd - padL - padR - gap * (n - 1)) / n);
    KOS.charts.ticks(maxU).forEach(function (v) {
      var y = H - padB - plotH * v / maxU;
      var g = svgNode("line", { x1: padL, y1: y, x2: Wd - padR, y2: y, "stroke-width": "1", "stroke-dasharray": v ? "2 4" : "" });
      paint(g, "stroke", "var(--line)"); s.appendChild(g);
      var t = svgNode("text", { x: padL - 6, y: y + 3.5, "text-anchor": "end", "font-size": "11", text: hours ? v + " h" : String(v) });
      paint(t, "fill", "var(--muted)"); s.appendChild(t);
    });
    var hiI = opts.hi != null ? opts.hi : totals.indexOf(Math.max.apply(null, totals));
    cols.forEach(function (c, i) {
      var x = padL + i * (bw + gap), y0 = H - padB, g = svgNode("g", {});
      g.appendChild(svgNode("title", { text: c.label + ": " + (hours ? W.hm(totals[i]) : totals[i]) }));
      keys.forEach(function (k) {
        var v = c.parts[k] || 0;
        if (!v) return;
        var h = plotH * (hours ? v / 60 : v) / maxU;
        var r = svgNode("rect", { x: x, y: y0 - h, width: bw, height: Math.max(1, h - 1), rx: 3 });
        paint(r, "fill", hues[k]);
        r.setAttribute("opacity", i === hiI ? "1" : "0.72");
        g.appendChild(r);
        y0 -= h;
      });
      var lt = svgNode("text", { x: x + bw / 2, y: H - padB + 16, "text-anchor": "middle", "font-size": "11",
        "font-weight": i === hiI ? "600" : "400", text: c.label });
      paint(lt, "fill", i === hiI ? "var(--text)" : "var(--text-2)");
      g.appendChild(lt);
      s.appendChild(g);
    });
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
  function daySubjChart(f) {
    var s = f.study;
    if (!s.chartDays) return dayTiles(f, s.dayMins, W.hm);
    var keys = SUBJECTS.filter(function (k) { return s.bySubject[k]; });
    /* an early saved shape has day totals only: one neutral stack */
    var hues = SUBJ_HUE, cols = DOW.map(function (d, i) { return { label: d, parts: (s.daySubj || [])[i] || {} }; });
    if (!s.daySubj) { keys = ["all"]; hues = { all: "var(--teal)" }; cols = DOW.map(function (d, i) { return { label: d, parts: { all: s.dayMins[i] || 0 } }; }); }
    var chart = stacked(cols, keys, hues, { unit: "mins" });
    chart.setAttribute("role", "img");
    chart.setAttribute("aria-label", "Study time by day: " + DOW.map(function (d, i) { return d + " " + W.hm(s.dayMins[i]); }).join(", "));
    return el("div", { class: "k-rp-chartwrap" }, [chart, s.daySubj ? legend(keys.map(function (k) { return { hue: SUBJ_HUE[k], label: W.SUBJECT_SHORT[k] }; })) : null].filter(Boolean));
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
      parts.map(function (p) { return el("span", { class: "k-rp-split-seg", style: "--w: " + (100 * p.value / total).toFixed(2) + "%; --c: " + p.hue }); }));
  }
  /* ranked bars: rows = [{label, value, text, hue}] */
  function bars(rows, opts) {
    opts = opts || {};
    var max = Math.max.apply(null, rows.map(function (r) { return r.value; }).concat([1]));
    return el("ol", { class: "k-rp-bars" + (opts.ranked ? " k-rp-bars--ranked" : "") }, rows.map(function (r, i) {
      return el("li", { class: "k-rp-bar-row" }, [
        opts.ranked ? mono("#" + (i + 1), "k-rp-rank") : null,
        el("span", { class: "k-rp-bar-l", text: r.label }),
        el("span", { class: "k-rp-bar", "aria-hidden": "true", style: "--w: " + (100 * r.value / max).toFixed(1) + "%; --c: " + (r.hue || "var(--text-2)") }),
        mono(r.text, "k-rp-bar-v")
      ].filter(Boolean));
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
     report and the saved report keeps the latest words (setWords). */
  var writing = {};   // report id → the request in flight (one per report)
  function wordsBlock(rep, opts) {
    opts = opts || {};
    var box = el("div", { class: "k-rp-words", "data-ui": "reports.words" });
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
      ui.status = "generating"; ui.err = null; paint();
      token.req = W.write(rep, function (err, out) {
        if (writing[rep.id] !== token) return;      // cancelled, or a newer request
        delete writing[rep.id];
        if (err) {
          ui.status = "failed"; ui.err = err;
          if (box.isConnected) paint();
          KOS.a11y.announce("Kurenai couldn't write the words. The template words are showing.");
          return;
        }
        store({ mode: "kurenai", headline: out.headline, narrative: out.narrative, writtenAt: Date.now(), status: "idle" }, function () {
          ui.status = "idle";
          if (box.isConnected) paint();
          KOS.a11y.announce("Kurenai wrote the words for this report.");
        });
      });
    }
    function cancel() {
      var t = writing[rep.id];
      delete writing[rep.id];
      if (t && t.req && KOS.ai && KOS.ai.cancel) KOS.ai.cancel(t.req);
      ui.status = "idle"; paint();
    }
    function choose(mode) {
      var w = rep.words || {};
      if (mode === "template") {
        if (ui.status === "generating") { cancel(); return; }
        ui.status = "idle"; ui.err = null;
        if (w.mode === "kurenai") store(Object.assign({}, w, { mode: "template" }), paint); else paint();
        return;
      }
      if (w.headline) store(Object.assign({}, w, { mode: "kurenai" }), paint);   // already written: no new request
      else generate();
    }
    function paint() {
      box.textContent = "";
      var w = W.current(rep), gen = ui.status === "generating";
      var kurenai = gen || w.byKurenai;
      var sw = KOS.ui.tabs([
        { label: "Template", active: !kurenai, onSelect: function () { choose("template"); } },
        { label: "Kurenai", short: "✦ Kurenai", active: kurenai, onSelect: function () { if (!kurenai) choose("kurenai"); } }
      ], { variant: "workspace", label: "Words", className: "k-rp-words-switch" });
      box.appendChild(el("div", { class: "k-rp-words-bar" }, [el("span", { class: "k-rp-words-l", "aria-hidden": "true", text: "Words" }), sw]));
      if (gen) {
        box.setAttribute("aria-busy", "true");
        box.appendChild(el("div", { class: "k-rp-skel", "aria-hidden": "true" }, [
          el("span", { class: "k-rp-skel-line", "data-state": "head" }), el("span", { class: "k-rp-skel-line" }),
          el("span", { class: "k-rp-skel-line" }), el("span", { class: "k-rp-skel-line", "data-state": "short" })]));
        box.appendChild(el("p", { class: "k-rp-meta", role: "status" }, [
          el("span", { text: "Kurenai is writing from this " + rep.period + "'s totals…" }),
          el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "reports.words-cancel", text: "Cancel", onclick: cancel })]));
        return;
      }
      box.removeAttribute("aria-busy");
      if (ui.status === "failed") {
        box.appendChild(el("p", { class: "k-rp-fail", "data-ui": "reports.words-failed", role: "status" }, [
          el("span", { class: "k-rp-fail-dot", "aria-hidden": "true" }),
          el("span", { text: W.failNote(ui.err) }),
          el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "reports.words-retry", text: "Try again", onclick: generate })]));
      }
      box.appendChild(el("h2", { class: "k-rp-headline" + (opts.hero ? " k-rp-headline--hero" : ""), "data-ui": "reports.headline", text: w.headline }));
      if (w.narrative) box.appendChild(el("p", { class: "k-rp-narrative", "data-ui": "reports.narrative", text: w.narrative }));
      var meta = el("div", { class: "k-rp-meta" });
      if (w.byKurenai) {
        meta.appendChild(el("span", { class: "k-rp-bymark", text: "◎ Written by Kurenai" }));
        meta.appendChild(el("button", { type: "button", class: "k-link k-rp-regen", "data-ui": "reports.words-regenerate", text: "↻ regenerate", onclick: generate }));
      } else {
        meta.appendChild(el("span", { text: "Template words · built from the numbers" }));
      }
      meta.appendChild(el("button", { type: "button", class: "k-link", "data-ui": "reports.words-sent", text: "ⓘ What is sent",
        onclick: function () { whatIsSent(rep); } }));
      meta.appendChild(el("span", { text: saved(rep) }));
      var chip = rebuiltChip(rep);
      if (chip) meta.appendChild(chip);
      box.appendChild(meta);
    }
    paint();
    return box;
  }
  /* ⇪ Share and ↓ Export (24k): the share card and the export dialog */
  function shareActions(rep) {
    if (!KOS.reportShare) return [];
    return [
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "reports.share", text: "⇪ Share", onclick: function () { KOS.reportShare.dialog(rep, { format: "png" }); } }),
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "reports.export", text: "↓ Export", onclick: function () { KOS.reportShare.dialog(rep, { format: "pdf" }); } })
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

  /* ================= the Reports page (24a) ================= */
  function indexPage(holder, reps) {
    holder.appendChild(KOS.ui.pageHeader({ kicker: "Home", title: "Reports",
      sub: "Your weeks in review: study, Focus, the plan and the Collection, saved as they ended." }));
    if (!reps.length) {
      holder.appendChild(KOS.ui.emptyState({ mark: "録", title: "Your first weekly report arrives on Monday",
        body: "A week is written down when it ends: each Monday at 07:00, the week before becomes a report you can read here." }));
      return;
    }
    var chosen = reps.filter(function (r) { return r.id === view.selected; })[0] || reps[0];
    var left = el("div", { class: "k-rp-index-main" });
    var list = el("ol", { class: "k-rp-list", "data-ui": "reports.list" });
    function paintLeft() {
      left.textContent = "";
      left.appendChild(summary(chosen, reps, function () { paintRow(chosen); }));
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
        el("span", { class: "k-rp-row-top" }, [
          mono(range(r.start, r.end), "k-rp-row-range"),
          w.byKurenai ? el("span", { class: "k-rp-mark", title: "Written by Kurenai", text: "✦" }) : null,
          i === 0 ? el("span", { class: "k-rp-latest", text: "Latest" }) : null,
          r.rebuilt ? el("span", { class: "k-rp-row-note", text: "rebuilt" }) : null
        ].filter(Boolean)),
        el("span", { class: "k-rp-row-h", text: w.headline }),
        spark(weeks)
      ];
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
    var side = el("aside", { class: "k-card k-rp-earlier", "aria-label": "Earlier reports" }, [
      cardHead("Earlier reports"),
      list,
      el("p", { class: "k-rp-note", text: "Since " + dm(first.start) + " " + parse(first.start).getFullYear() + " · " + W.plural(reps.length, "weekly report") })
    ]);
    holder.appendChild(el("div", { class: "k-rp-index" }, [left, side]));
    paintLeft();
  }
  /* the left column: the chosen report, short (24a) */
  function summary(rep, reps, onWords) {
    var f = rep.facts, s = f.study;
    return el("section", { class: "k-card k-rp-sum", "data-ui": "reports.summary", "aria-label": "Report for " + weekOf(rep) }, [
      el("div", { class: "k-kicker", text: "Weekly report · " + longRange(rep.start, rep.end) + " " + parse(rep.end).getFullYear() }),
      wordsBlock(rep, { onChange: onWords }),
      tiles([
        tile("Studied", W.hm(s.mins), s.sessions ? W.plural(s.sessions, "session") : null),
        s.reviews ? tile("Flashcards", W.num(s.reviews), s.recall != null ? s.recall + "% recall" : "reviews") : null,
        f.gov.streak ? tile("Study streak", f.gov.streak, "days" + (f.gov.rest ? " · rest streak " + f.gov.rest : "")) : null
      ]),
      el("h3", { class: "k-rp-subhead", text: "Activity" }),
      daySubjChart(f),
      el("div", { class: "k-rp-actions" }, [el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "reports.open",
        text: "Open the full report ›", onclick: function () { open(rep); } })])
    ].filter(Boolean));
  }

  /* ================= one report (25a) ================= */
  function reportPage(holder, rep, reps) {
    var f = rep.facts;
    holder.appendChild(crumbs([{ label: "Reports", go: function () { KOS.show("reports"); } }, { label: weekOf(rep) }]));
    holder.appendChild(KOS.ui.pageHeader({ kicker: "Weekly report", title: longRange(rep.start, rep.end) + " " + parse(rep.end).getFullYear(),
      actions: shareActions(rep) }));
    var stories = KOS.reportStory ? KOS.reportStory.slides(rep) : [];
    holder.appendChild(el("section", { class: "k-rp-hero", "data-ui": "reports.hero", "aria-label": "The week in words" }, [
      el("div", { class: "k-rp-hero-grid" }, [
        el("div", { class: "k-rp-hero-main" }, [
          el("div", { class: "k-kicker", text: stories.length ? "Your week as a story · " + W.plural(stories.length, "story", "stories") + " · about " + Math.max(1, Math.round(stories.length * 7.2 / 60)) + " minute" + (Math.round(stories.length * 7.2 / 60) > 1 ? "s" : "") : "Your week in review" }),
          wordsBlock(rep, { hero: true }),
          stories.length ? el("div", { class: "k-rp-play" }, [el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "reports.play",
            text: "▶ Play your week", onclick: function () { KOS.reportStory.open(rep, 0); } })]) : null
        ].filter(Boolean)),
        stories.length ? el("ol", { class: "k-rp-thumbs", "aria-label": "The stories" }, stories.map(function (sl, i) {
          return el("li", {}, [el("button", { type: "button", class: "k-rp-thumb", "data-ui": "reports.thumb", style: "--hue: " + sl.hue,
            "aria-label": "Play from story " + (i + 1) + ": " + sl.ch, onclick: function () { KOS.reportStory.open(rep, i); } }, [el("span", { text: sl.ch })])]);
        })) : null
      ].filter(Boolean))
    ]));
    holder.appendChild(weekTiles(f));
    var grid = el("div", { class: "k-rp-grid", "data-ui": "reports.grid" }, [
      studyCard(rep), focusCard(rep), planCard(rep), collectionCard(rep), governorCard(rep)
    ].filter(Boolean));
    holder.appendChild(grid);
  }
  function weekTiles(f) {
    var s = f.study, fo = f.focus, c = f.collection, g = f.gov, prev = f.prev;
    var cmp = prev ? W.compare(s.mins, prev.mins, "last wk", "mins") : null;
    return tiles([
      tile("Studied", W.hm(s.mins), s.sessions ? W.plural(s.sessions, "session") : null, cmp),
      s.recall != null ? tile("Recall", s.recall + "%", W.plural(s.reviews, "review")) : null,
      s.touched ? tile("Topics", s.touched, s.toGreen ? s.toGreen + " to Green" : null) : null,
      fo.blocks ? tile("Focus", fo.blocks, "longest " + fo.longest + "m") : null,
      f.plan ? tile("Plan", f.plan.ticked + "/" + f.plan.planned, f.plan.carried ? f.plan.carried + " carried" : "all ticked") : null,
      c ? tile("Collection", c.count, "titles" + (c.estMins ? " · ≈ " + W.hm(c.estMins) : "")) : null,
      g.xp ? tile("Earned", "+" + W.num(g.xp), "XP" + (g.gold ? " · +" + W.num(g.gold) + " ◆" : "")) : null,
      g.streak ? tile("Streak", g.streak, "days" + (g.rest ? " · rest " + g.rest : "")) : null
    ]);
  }
  function statusText(t) {
    if (t.to === "g" && t.from !== "g") return { text: "→ Green", tone: "green" };
    if (t.from && t.to && t.from !== t.to) return { text: BAND[t.from] + " → " + BAND[t.to], tone: t.to === "r" ? "alarm" : null };
    if (t.band) return { text: BAND[t.band], tone: t.band === "r" ? "alarm" : null };
    return null;
  }
  function studyCard(rep) {
    var f = rep.facts, s = f.study;
    var keys = SUBJECTS.filter(function (k) { return s.bySubject[k]; });
    var parts = keys.map(function (k) { return { label: W.SUBJECT_SHORT[k], value: s.bySubject[k], text: W.hm(s.bySubject[k]), hue: SUBJ_HUE[k] }; });
    var top = s.topics.slice(0, 5);
    return card("Study", { go: function () { open(rep, "study"); }, className: "k-rp-card--study" }, [
      parts.length ? splitBar(parts) : null,
      parts.length ? legend(parts.map(function (p) { return { hue: p.hue, label: p.label, value: p.text }; })) : null,
      top.length ? el("h3", { class: "k-rp-subhead", text: "Top topics" }) : null,
      top.length ? el("ol", { class: "k-rp-topics" }, top.map(function (t, i) {
        var st = statusText(t);
        return el("li", {}, [el("button", { type: "button", class: "k-rp-topic", "data-ui": "reports.topic", onclick: function () { openTopic(t.key); } }, [
          mono(String(i + 1), "k-rp-rank"), dot(SUBJ_HUE[t.sid]),
          mono(t.ref, "k-rp-ref"), el("span", { class: "k-rp-topic-t", text: t.title }),
          t.mins ? mono(W.hm(t.mins), "k-rp-topic-m") : el("span", {}),
          t.reviews ? mono(t.reviews + "×", "k-rp-topic-r") : el("span", {}),
          st ? el("span", { class: "k-rp-topic-s", "data-tone": st.tone, text: st.text }) : el("span", {})
        ])]);
      })) : el("p", { class: "k-rp-note", text: "No topics touched this week." })
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
        grid.appendChild(el("span", { class: "k-rp-heat-c", style: "--a: " + (v ? (0.18 + 0.82 * v / max).toFixed(2) : "0"),
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
    return el("div", { class: "k-rp-persona-chip" }, [
      el("span", { class: "k-rp-persona-k", lang: "ja", "aria-hidden": "true", text: p.kanji }),
      el("b", { text: p.name }),
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
      el("span", { class: "k-rp-plan-t", text: r.title }),
      r.done ? (d ? mono(d, "k-rp-plan-w") : el("span", { class: "sr-only", text: "ticked" }))
        : mono("w/c " + dm(r.carriedTo), "k-rp-plan-w")
    ]);
  }
  function planCard(rep) {
    var f = rep.facts, pl = f.plan, tk = f.tasks;
    if (!pl) return null;
    var meta = [pl.ticked + " of " + pl.planned + " personal rows"];
    if (tk && tk.reminders) meta.push(W.plural(tk.reminders, "reminder"));
    if (tk && tk.habits) meta.push(W.plural(tk.habits.length, "habit"));
    return card("The plan", { meta: meta.join(" · "), go: function () { open(rep, "focus"); } }, [
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
  function hiLo(c) {
    if (!c.hi) return null;
    function one(label, t, tone) {
      return el("div", { class: "k-rp-hilo", "data-tone": tone }, [
        el("span", { class: "k-kicker", text: label }),
        el("span", { class: "k-rp-hilo-v" }, [mono(String(t.score), "k-rp-hilo-n"), mono("/10", "k-rp-hilo-of")]),
        el("span", { class: "k-rp-hilo-t", text: t.title })
      ]);
    }
    return el("div", { class: "k-rp-hilos" }, [one("Highest", c.hi, "green"), one("Lowest", c.lo, "alarm")]);
  }
  function collectionCard(rep) {
    var c = rep.facts.collection;
    if (!c) return null;
    var mods = MODULES.filter(function (m) { return c.byModule[m]; });
    var mosaic = el("ul", { class: "k-rp-mosaic", "data-ui": "reports.mosaic", "aria-label": W.plural(c.count, "title") },
      c.titles.slice().sort(function (a, b) { return MODULES.indexOf(a.module) - MODULES.indexOf(b.module); }).slice(0, 60).map(function (t) {
        return el("li", { title: t.title + (t.range ? " · " + t.range : "") }, [cover(t, "k-rp-cover--mini")]);
      }));
    return card("Collection · " + W.plural(c.count, "title"), { go: function () { open(rep, "collection"); }, className: "k-rp-card--wide" }, [
      el("div", { class: "k-rp-coll" }, [
        el("div", { class: "k-rp-coll-main" }, [mosaic,
          legend(mods.map(function (m) { return { hue: MOD_HUE[m], label: MOD_SHORT[m], value: unitText(c, m) }; }))]),
        el("div", { class: "k-rp-coll-side" }, [
          c.genres.length ? el("h3", { class: "k-rp-subhead", text: "Genre DNA" }) : null,
          c.genres.length ? bars(c.genres.map(function (g, i) { return { label: g.name, value: g.n, text: g.pct + "%", hue: GENRE_HUE[i] }; })) : null,
          hiLo(c)
        ].filter(Boolean))
      ])
    ]);
  }
  var GENRE_HUE = ["var(--vn)", "var(--books)", "var(--anime)", "var(--red)", "var(--games)"];
  function governorCard(rep) {
    var f = rep.facts, g = f.gov, k = f.kurenai;
    var rows = [];
    if (g.streak) rows.push(["Study streak", W.plural(g.streak, "day"), "teal"]);
    if (g.rest) rows.push(["Rest streak", W.plural(g.rest, "day")]);
    if (g.level) rows.push(["Level", g.level + (g.levelPct != null ? " · " + g.levelPct + "% to " + (g.level + 1) : "") + (g.levelFrom ? " · up from " + g.levelFrom : "")]);
    if (k) {
      var bits = [];
      if (k.chats) bits.push(W.plural(k.chats, "chat"));
      if (k.scheduled) bits.push(W.plural(k.scheduled, "scheduled send"));
      rows.push(["Kurenai", bits.join(" · ")]);
      var areas = Object.keys(k.areas || {}).sort(function (a, b) { return k.areas[b] - k.areas[a]; });
      if (areas.length) rows.push(["Asked about", areas.map(function (a) { return (AREA_LABEL[a] || a) + " " + k.areas[a]; }).join(" · ")]);
    }
    if (!rows.length && !g.xp) return null;
    return card("Governor and Kurenai", { className: "k-rp-card--gov" }, [
      g.xp ? el("div", { class: "k-rp-earned" }, [
        el("span", { class: "k-kicker", text: "Earned this week" }),
        el("span", { class: "k-rp-earned-v" }, [mono("+" + W.num(g.xp), "k-rp-xp"), el("span", { class: "k-rp-u", text: "XP" }),
          g.gold ? mono("+" + W.num(g.gold) + " ◆", "k-rp-gold") : null].filter(Boolean))
      ]) : null,
      el("dl", { class: "k-rp-kv" }, rows.reduce(function (a, r) {
        return a.concat([el("dt", { text: r[0] }), el("dd", { class: "k-mono", "data-tone": r[2] || null, text: r[1] })]);
      }, []))
    ].filter(Boolean));
  }

  /* ================= the full overviews (25b–25d) ================= */
  function overviewHead(holder, rep, section) {
    var words = W.section(rep.facts, section);
    holder.appendChild(crumbs([{ label: "Reports", go: function () { KOS.show("reports"); } },
      { label: weekOf(rep), go: function () { open(rep); } }, { label: SECTIONS[section] }]));
    holder.appendChild(KOS.ui.pageHeader({ kicker: SECTIONS[section] + " · " + longRange(rep.start, rep.end), title: words.headline, sub: words.sentence || null,
      actions: shareActions(rep) }));
    if (rep.rebuilt) holder.appendChild(el("div", { class: "k-rp-meta" }, [rebuiltChip(rep)]));
  }

  /* ---- 25c Study ---- */
  function studyOverview(holder, rep) {
    var f = rep.facts, s = f.study, prev = f.prev;
    overviewHead(holder, rep, "study");
    holder.appendChild(tiles([
      tile("Studied", W.hm(s.mins), s.sessions ? W.plural(s.sessions, "session") + " · " + W.plural(s.days, "day") : null, prev ? W.compare(s.mins, prev.mins, "last wk", "mins") : null),
      s.touched ? tile("Topics", s.touched, s.toGreen ? s.toGreen + " to Green" : null, prev ? W.compare(s.touched, prev.touched, "last wk") : null) : null,
      s.reviews ? tile("Reviews", W.num(s.reviews), null, prev ? W.compare(s.reviews, prev.reviews, "last wk") : null) : null,
      s.recall != null ? tile("Recall", s.recall + "%", null, prev && prev.recall != null ? W.compare(s.recall, prev.recall, "last wk", "pct") : null) : null,
      s.quizzes ? tile("Quizzes", s.quizzes, s.quizPct != null ? "average " + s.quizPct + "%" : null) : null,
      s.exams ? tile("Exam questions", s.exams, s.max ? s.marks + " / " + s.max + " marks" : null) : null
    ]));
    var main = el("div", { class: "k-rp-main" }), side = el("div", { class: "k-rp-side" });
    /* every topic */
    if (s.topics.length) {
      main.appendChild(card("All " + W.plural(s.topics.length, "topic"), { className: "k-rp-card--table" }, [
        tableScroll(el("div", { class: "k-rp-tablewrap" }, [el("table", { class: "k-rp-table", "data-ui": "reports.topics-table" }, [
          el("thead", {}, [el("tr", {}, ["#", "Topic", "Time", "Reviews", "Recall", "Status"].map(function (h) { return el("th", { scope: "col", text: h }); }))]),
          el("tbody", {}, s.topics.map(function (t, i) {
            var st = statusText(t);
            return el("tr", {}, [
              el("td", { class: "k-mono", text: String(i + 1) }),
              el("td", {}, [el("button", { type: "button", class: "k-rp-tlink", "data-ui": "reports.topic", onclick: function () { openTopic(t.key); } }, [
                dot(SUBJ_HUE[t.sid]), mono(t.ref, "k-rp-ref"), el("span", { text: t.title })])]),
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
      main.appendChild(card("Flashcards by deck", {}, [bars(s.decks.map(function (d) {
        return { label: W.SUBJECT_SHORT[d.sid] + " · " + d.title, value: d.reviews, text: d.reviews + (d.recall != null ? " · " + d.recall + "%" : ""), hue: SUBJ_HUE[d.sid] };
      }))]));
    }
    side.appendChild(card("Time by day", {}, [daySubjChart(f)]));
    var hl = [];
    if (s.bestRecall) hl.push(highRow("Best recall", s.bestRecall.title, s.bestRecall.recall + "% over " + s.bestRecall.reviews + " reviews", "green", s.bestRecall.key));
    if (s.lowRecall) hl.push(highRow("Lowest recall", s.lowRecall.title, s.lowRecall.recall + "% over " + s.lowRecall.reviews + " reviews", "alarm", s.lowRecall.key));
    if (s.bestQuiz) hl.push(highRow("Best quiz", s.bestQuiz.title || "Quiz", s.bestQuiz.correct + " / " + s.bestQuiz.total + " · " + DOW[(parse(s.bestQuiz.date).getDay() + 6) % 7], "teal", s.bestQuiz.key));
    if (hl.length) side.appendChild(card("Highs and lows", {}, [el("ul", { class: "k-rp-highs" }, hl)]));
    var fl = [];
    if (s.firsts) {
      fl.push(["First session", dayName(s.firsts.first.ts) + " " + clock(s.firsts.first.ts) + (s.firsts.first.label ? " · " + s.firsts.first.label : "")]);
      if (s.firsts.last.ts !== s.firsts.first.ts) fl.push(["Last session", dayName(s.firsts.last.ts) + " " + clock(s.firsts.last.ts) + (s.firsts.last.label ? " · " + s.firsts.last.label : "")]);
      fl.push(["Longest session", dayName(s.firsts.longest.ts) + " " + clock(s.firsts.longest.ts) + " · " + W.hm(s.firsts.longest.mins) + (s.firsts.longest.sid ? " · " + W.SUBJECT_SHORT[s.firsts.longest.sid] : "")]);
    }
    if (fl.length || s.flow) {
      side.appendChild(card("Firsts, lasts and flow", {}, [
        fl.length ? el("dl", { class: "k-rp-kv" }, fl.reduce(function (a, r) { return a.concat([el("dt", { text: r[0] }), el("dd", { class: "k-mono", text: r[1] })]); }, [])) : null,
        s.flow ? el("h3", { class: "k-rp-subhead", text: "What you studied next" }) : null,
        s.flow ? flowList(s.flow.map(function (x) { return { from: FLOW_LABEL[x.from] || x.from, fromHue: SUBJ_HUE[x.from] || "var(--teal)", to: FLOW_LABEL[x.to] || x.to, toHue: SUBJ_HUE[x.to] || "var(--teal)", n: x.n + "×" }; })) : null
      ].filter(Boolean)));
    }
    if (s.next) side.appendChild(nextUp(s.next));
    holder.appendChild(el("div", { class: "k-rp-two" }, [main, side]));
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
      el("span", { class: "k-kicker", text: kicker }),
      el("b", { text: title }),
      mono(meta, "k-rp-high-m")
    ])]);
  }
  function flowList(rows) {
    return el("ol", { class: "k-rp-flow" }, rows.map(function (r) {
      return el("li", {}, [dot(r.fromHue), el("span", { text: r.from }), el("span", { class: "k-rp-flow-arrow", "aria-label": "then", text: "→" }),
        dot(r.toHue), el("span", { text: r.to }), mono(r.n, "k-rp-flow-n")]);
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
      main.appendChild(card("Every Focus block", { className: "k-rp-card--timeline" }, [
        timeline(rep, fo.list),
        el("p", { class: "k-rp-note", text: [W.plural(fo.blocks, "block"), W.hm(fo.mins)].concat(modes).join(" · ") })
      ]));
    }
    if (pl) main.appendChild(card("The plan · " + pl.ticked + " of " + W.plural(pl.planned, "row"), {}, [el("ul", { class: "k-rp-plan" }, pl.rows.map(planRow))]));
    if (tk && tk.done) {
      main.appendChild(card("Reminders · " + tk.reminders + " done", {}, [el("ul", { class: "k-rp-done" }, tk.done.map(function (r) {
        return el("li", {}, [el("span", { class: "k-rp-plan-mark", "aria-hidden": "true", text: "✓" }), el("span", { text: r.title }), mono(dayName(r.at), "k-rp-plan-w")]);
      }))]));
    }
    if (fo.persona) {
      side.appendChild(el("section", { class: "k-card k-rp-persona", "data-ui": "reports.persona", "aria-label": "Your Focus style" }, [
        el("span", { class: "k-kicker", text: "Your Focus style this week" }),
        el("b", { class: "k-rp-persona-name", text: fo.persona.name }),
        el("p", { text: fo.persona.fact }),
        el("span", { class: "k-rp-persona-ghost", lang: "ja", "aria-hidden": "true", text: fo.persona.kanji })
      ]));
    }
    if (fo.lengths && fo.lengths.length >= 3) side.appendChild(card("How long", {}, [lengths(fo.lengths)]));
    if (tk && tk.habits) {
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
      holder.appendChild(KOS.ui.emptyState({ mark: "集", title: "No Focus blocks or plan rows this week", compact: true }));
      return;
    }
    holder.appendChild(el("div", { class: "k-rp-two" }, [main, side]));
  }
  /* every block where it happened: a row a day, 07–23 */
  function timeline(rep, list) {
    var from = HEAT_FROM * 60, to = 23 * 60, span = to - from;
    var rows = DOW.map(function (d, i) {
      var day = KOS.report.addDays(rep.start, i);
      var mine = list.filter(function (b) { return dateIso(new Date(b.ts)) === day; });
      return el("li", { class: "k-rp-tl-row" }, [el("span", { class: "k-rp-tl-d", text: d }), el("span", { class: "k-rp-tl-track" }, mine.map(function (b) {
        var st = new Date(b.ts), m = st.getHours() * 60 + st.getMinutes();
        var left = Math.max(0, Math.min(100, 100 * (m - from) / span)), w = Math.max(0.8, Math.min(100 - left, 100 * b.mins / span));
        return el("span", { class: "k-rp-tl-b", style: "--l: " + left.toFixed(2) + "%; --w: " + w.toFixed(2) + "%; --c: " + (SUBJ_HUE[b.sid] || "var(--teal)"),
          title: d + " " + clock(b.ts) + " · " + W.hm(b.mins) + (b.sid ? " · " + W.SUBJECT_SHORT[b.sid] : "") }, [b.mins >= 60 ? el("span", { class: "k-mono", text: b.mins + "m" }) : null].filter(Boolean));
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
    var max = Math.max.apply(null, b);
    var sorted = ls.slice().sort(function (x, y) { return x - y; }), med = sorted[sorted.length >> 1];
    return el("div", {}, [el("ol", { class: "k-rp-hist", role: "img", "aria-label": labels.map(function (l, i) { return l + " min: " + b[i]; }).join(", ") }, b.map(function (n, i) {
      return el("li", {}, [n ? mono(String(n), "k-rp-hist-n") : el("span", {}), el("span", { class: "k-rp-hist-bar", style: "--h: " + (100 * n / max).toFixed(1) + "%" }), mono(labels[i], "k-rp-hist-l")]);
    })), el("p", { class: "k-rp-note", text: "Minutes per block · median " + med })]);
  }

  /* ---- 25b Collection ---- */
  function collectionOverview(holder, rep) {
    var f = rep.facts, c = f.collection;
    overviewHead(holder, rep, "collection");
    if (!c) { holder.appendChild(KOS.ui.emptyState({ mark: "蒐", title: "Nothing in the Collection moved this week", compact: true })); return; }
    var u = c.units || {}, st = c.status || {};
    var vnGame = (c.byModule.vn || 0) + (c.byModule.game || 0);
    holder.appendChild(tiles([
      tile("Titles", c.count, MODULES.filter(function (m) { return c.byModule[m]; }).slice(0, 2).map(function (m) { return c.byModule[m] + " " + MOD_SHORT[m].toLowerCase(); }).join(" · ")),
      u.ep ? tile("Episodes", W.num(u.ep), null) : null,
      u.ch ? tile("Chapters", W.num(u.ch), u.vol ? "+ " + W.plural(u.vol, "volume") : null) : (u.vol ? tile("Volumes", W.num(u.vol), null) : null),
      vnGame && u.hours ? tile("VN and games", W.hm(u.hours * 60), u.route ? W.plural(u.route, "route") + " finished" : null) : null,
      st.finished ? tile("Finished", st.finished, st.started ? st.started + " started" : null) : (st.started ? tile("Started", st.started, null) : null),
      c.scores ? tile("Scored", c.scores.n, "average " + c.scores.avg) : null,
      c.busiest ? tile("Busiest day", DOW[(parse(c.busiest.date).getDay() + 6) % 7], W.plural(c.busiest.titles, "title") + (c.busiest.mins ? " · ≈ " + W.hm(c.busiest.mins) : "")) : null
    ]));
    var main = el("div", { class: "k-rp-main" }), side = el("div", { class: "k-rp-side" });
    main.appendChild(everyTitle(c));
    var pair = [];
    if (c.scores) pair.push(card("Scores", {}, [hiLo(c), scoreHist(c.scores)].filter(Boolean)));
    if (c.dayTitles) {
      var keys = MODULES.filter(function (m) { return c.byModule[m]; });
      var totals = c.dayTitles.map(function (d) { return Object.keys(d).reduce(function (a, k) { return a + d[k]; }, 0); });
      var wkShare = totals.reduce(function (a, b) { return a + b; }, 0) ? Math.round(100 * (totals[5] + totals[6]) / totals.reduce(function (a, b) { return a + b; }, 0)) : 0;
      var ch = stacked(DOW.map(function (d, i) { return { label: d, parts: c.dayTitles[i] }; }), keys, MOD_HUE, { height: 170 });
      ch.setAttribute("role", "img");
      ch.setAttribute("aria-label", "Titles touched per day: " + DOW.map(function (d, i) { return d + " " + totals[i]; }).join(", "));
      pair.push(card("Day by day", {}, [ch, legend(keys.map(function (m) { return { hue: MOD_HUE[m], label: MOD_SHORT[m] }; })),
        el("p", { class: "k-rp-note", text: "Titles touched per day" + (wkShare ? " · the weekend took " + wkShare + "%" : "") })]));
    }
    var statusRows = [["finished", "Finished", "var(--green)"], ["started", "Started", "var(--teal)"], ["continued", "Continued", "var(--text-2)"],
      ["paused", "Paused", "var(--amber)"], ["dropped", "Dropped", "var(--alarm)"]].filter(function (r) { return st[r[0]]; });
    if (statusRows.length) {
      pair.push(card("Status this week", {}, [
        splitBar(statusRows.map(function (r) { return { label: r[1], value: st[r[0]], text: String(st[r[0]]), hue: r[2] }; })),
        el("ul", { class: "k-rp-status" }, statusRows.map(function (r) { return el("li", {}, [dot(r[2]), el("span", { text: r[1] }), mono(String(st[r[0]]))]); }))
      ]));
    }
    if (c.countries.length || c.formats.length) {
      pair.push(card("Where it came from", {}, [
        c.countries.length ? bars(c.countries.map(function (x) { return { label: countryName(x.name), value: x.n, text: String(x.n), hue: "var(--crimson)" }; })) : null,
        c.formats.length ? el("h3", { class: "k-rp-subhead", text: "Formats" }) : null,
        c.formats.length ? bars(c.formats.map(function (x) { return { label: formatName(x.name), value: x.n, text: String(x.n), hue: "var(--anime)" }; })) : null
      ].filter(Boolean)));
    }
    if (pair.length) main.appendChild(el("div", { class: "k-rp-pairs" }, pair));
    if (c.flow) main.appendChild(card("Genre flow", { meta: "what you moved to next" }, [flowList(c.flow.map(function (x) {
      return { from: x.from, fromHue: "var(--vn)", to: x.to, toHue: "var(--books)", n: W.plural(x.n, "switch", "switches") };
    }))]));
    if (c.genres.length) {
      side.appendChild(card("Genre DNA", {}, [el("ol", { class: "k-rp-dna" }, c.genres.map(function (g, i) {
        var covers = c.titles.filter(function (t) { return (t.genres || []).indexOf(g.name) !== -1; }).slice(0, 3);
        return el("li", { class: "k-rp-dna-row", style: "--c: " + GENRE_HUE[i] }, [
          mono("#" + (i + 1), "k-rp-rank"),
          el("span", { class: "k-rp-dna-t" }, [el("b", { text: g.name }), el("span", { class: "k-rp-note", text: W.plural(g.n, "title") })]),
          mono(g.pct + "%", "k-rp-dna-p"),
          el("span", { class: "k-rp-bar", "aria-hidden": "true", style: "--w: " + g.pct + "%; --c: " + GENRE_HUE[i] }),
          el("span", { class: "k-rp-dna-covers", "aria-hidden": "true" }, covers.map(function (t) { return cover(t, "k-rp-cover--tiny"); }))
        ]);
      }))]));
    }
    if (c.tags.length) {
      side.appendChild(card("Tags and themes", {}, [el("ul", { class: "k-rp-tags" }, c.tags.map(function (t, i) {
        return el("li", { class: "k-chip", "data-tone": i < 3 ? "lead" : null }, [el("span", { text: t.name }), mono(String(t.n))]);
      }))]));
    }
    var cr = [];
    if (c.studio) cr.push(["Top studio", c.studio.name, W.plural(c.studio.n, "anime", "anime") + " · " + c.studio.titles.join(", ")]);
    if (c.author) cr.push(["Top author", c.author.name, W.plural(c.author.n, "title") + " · " + c.author.titles.join(", ")]);
    if (cr.length) side.appendChild(card("Creators", {}, [el("ul", { class: "k-rp-creators" }, cr.map(function (r) {
      return el("li", {}, [el("span", { class: "k-kicker", text: r[0] }), el("b", { text: r[1] }), el("span", { class: "k-rp-note", text: r[2] })]);
    }))]));
    holder.appendChild(el("div", { class: "k-rp-two" }, [main, side]));
  }
  var COUNTRY = { JP: "Japan", KR: "South Korea", CN: "China", TW: "Taiwan", US: "United States", GB: "United Kingdom", FR: "France" };
  function countryName(c) { return COUNTRY[c] || c; }
  var FORMAT = { TV: "TV", TV_SHORT: "TV short", MOVIE: "Film", SPECIAL: "Special", OVA: "OVA", ONA: "ONA", MUSIC: "Music",
    MANGA: "Manga", NOVEL: "Light novel", ONE_SHOT: "One-shot", lightNovel: "Light novel", manga: "Manga", oneShot: "One-shot" };
  function formatName(f) { return FORMAT[f] || f; }
  function scoreHist(sc) {
    var max = Math.max.apply(null, sc.hist.concat([1]));
    return el("div", {}, [el("ol", { class: "k-rp-hist k-rp-hist--scores", role: "img",
      "aria-label": "Scores given: " + sc.hist.map(function (n, i) { return n ? (i + 1) + ": " + n : null; }).filter(Boolean).join(", ") }, sc.hist.map(function (n, i) {
      var tone = i + 1 >= 8 ? "green" : i + 1 <= 4 ? "alarm" : null;
      return el("li", { "data-tone": tone }, [n ? mono(String(n), "k-rp-hist-n") : el("span", {}), el("span", { class: "k-rp-hist-bar", style: "--h: " + (100 * n / max).toFixed(1) + "%" }), mono(String(i + 1), "k-rp-hist-l")]);
    })), el("p", { class: "k-rp-note", text: W.plural(sc.n, "score") + " given" + (sc.range ? " · range " + W.plural(sc.range, "point") : "") + " · median " + sc.median })]);
  }
  function everyTitle(c) {
    var box = el("section", { class: "k-card k-rp-card k-rp-titles", "data-ui": "reports.card reports.titles", "aria-label": "Every title" });
    function paint() {
      box.textContent = "";
      var mods = MODULES.filter(function (m) { return c.byModule[m]; });
      var filter = KOS.ui.tabs([{ label: "All", count: c.count, active: view.coll.module === "all", onSelect: function () { view.coll.module = "all"; paint(); } }]
        .concat(mods.map(function (m) { return { label: MOD_SHORT[m], count: c.byModule[m], active: view.coll.module === m, onSelect: function () { view.coll.module = m; paint(); } }; })),
        { variant: "workspace", label: "Medium", className: "k-rp-filter", edge: true });
      var layout = KOS.ui.tabs([["covers", "Covers"], ["list", "List"]].map(function (x) {
        return { label: x[1], active: view.coll.layout === x[0], onSelect: function () { view.coll.layout = x[0]; paint(); } };
      }), { variant: "workspace", label: "Layout", className: "k-rp-layout" });
      var sort = el("select", { class: "k-input k-rp-sort", "data-ui": "reports.sort", "aria-label": "Sort titles",
        onchange: function () { view.coll.sort = sort.value; paint(); } },
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
          return el("li", {}, [dot(MOD_HUE[t.module]), el("span", { class: "k-rp-tlist-t", text: t.title }), mono(t.range || "", "k-rp-note"),
            t.status === "finished" ? el("span", { class: "k-chip", "data-tone": "green", text: "✓ finished" }) : t.status === "dropped" ? el("span", { class: "k-chip", "data-tone": "alarm", text: "dropped" }) : el("span", {}),
            t.score ? mono(String(t.score), "k-rp-score") : el("span", {})]);
        }));
      } else {
        grid = el("ul", { class: "k-rp-covers", "data-ui": "reports.cover-grid", "data-state": view.coll.all ? null : "collapsed" }, list.map(function (t) {
          return el("li", { class: "k-rp-cell" }, [
            el("span", { class: "k-rp-cell-art" }, [cover(t),
              t.score ? el("span", { class: "k-rp-badge", "data-tone": t.score >= 8 ? "green" : t.score <= 4 ? "alarm" : null, text: String(t.score) }) : null,
              t.status === "finished" ? el("span", { class: "k-rp-fin", title: "Finished", text: "✓" }) : t.status === "dropped" ? el("span", { class: "k-rp-drop", text: "dropped" }) : null
            ].filter(Boolean)),
            el("span", { class: "k-rp-cell-t", text: t.title }),
            t.range ? mono(t.range, "k-rp-cell-r") : null
          ].filter(Boolean));
        }));
      }
      box.appendChild(grid);
      if (view.coll.layout !== "list" && !view.coll.all && list.length > 9) {
        box.appendChild(el("button", { type: "button", class: "k-btn k-rp-showall", "data-ui": "reports.show-all", text: "Show all " + list.length,
          onclick: function () { view.coll.all = true; paint(); } }));
      }
    }
    paint();
    return box;
  }

  /* ================= the Home card (24h) =================
     The newest weekly report, for the week after it was saved: "New" with
     its headline, three facts and the week's chart until it has been read,
     then a quiet one-line row. Filled after the store answers; an empty
     slot (no report this week) stays hidden. Reading is a click, never a
     render: "Read the report" (and the bell) mark the report's
     notification read. */
  function homeCard() {
    var slot = el("section", { class: "k-card k-rp-home", "data-ui": "reports.home-card", "aria-label": "Your week in review", hidden: "" });
    if (!KOS.reportStore || !KOS.reportStore.available()) return slot;
    KOS.reportStore.list("week", function (err, reps) {
      var rep = !err && reps && reps[0];
      if (!rep || !slot.isConnected && !slot.parentNode) return;
      if (Date.now() - rep.savedAt > 7 * 864e5) return;
      var nid = "reports:" + rep.id;
      var isNew = KOS.notify && KOS.notify.isRead ? !KOS.notify.isRead({ id: nid }) : true;
      var w = W.current(rep), f = rep.facts, s = f.study;
      function read() { if (KOS.notify && KOS.notify.markRead) KOS.notify.markRead(nid); open(rep); }
      slot.removeAttribute("hidden");
      KOS.ui.state(slot, "new", isNew);
      if (!isNew) {
        slot.appendChild(el("button", { type: "button", class: "k-rp-home-row", "data-ui": "reports.home-open", onclick: read }, [
          el("span", { class: "k-rp-home-seal", lang: "ja", "aria-hidden": "true", text: "週" }),
          el("span", { class: "k-rp-home-row-t" }, [el("b", { text: weekOf(rep) }), el("span", { text: w.headline })]),
          el("span", { class: "k-link", text: "Read ›" })
        ]));
        return;
      }
      var facts = [[W.hm(s.mins), "studied"]];
      if (s.recall != null) facts.push([s.recall + "%", "recall"]);
      else if (s.reviews) facts.push([W.num(s.reviews), "reviews"]);
      if (f.collection && f.collection.count) facts.push([W.num(f.collection.count), "titles"]);
      else if (f.gov.streak) facts.push([String(f.gov.streak), "day streak"]);
      slot.appendChild(el("div", { class: "k-rp-home-top" }, [
        el("span", { class: "k-kicker", text: "Your week in review · " + range(rep.start, rep.end) }),
        el("span", { class: "k-rp-new", text: "New" })
      ]));
      slot.appendChild(el("h2", { class: "k-rp-home-h", text: w.headline }));
      slot.appendChild(el("div", { class: "k-rp-home-body" }, [
        el("dl", { class: "k-rp-home-facts" }, facts.slice(0, 3).reduce(function (a, x) { return a.concat([el("dd", { class: "k-mono", text: x[0] }), el("dt", { text: x[1] })]); }, [])),
        miniChart(s)
      ]));
      slot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary k-btn--sm", "data-ui": "reports.home-open", text: "→ Read the report", onclick: read }));
    });
    return slot;
  }
  function miniChart(s) {
    var max = Math.max.apply(null, s.dayMins.concat([1]));
    return el("ol", { class: "k-rp-mini", role: "img", "aria-label": "Study by day: " + DOW.map(function (d, i) { return d + " " + W.hm(s.dayMins[i]); }).join(", ") },
      DOW.map(function (d, i) {
        var parts = (s.daySubj || [])[i] || {}, tot = s.dayMins[i] || 0;
        return el("li", { style: "--h: " + (100 * tot / max).toFixed(1) + "%" }, SUBJECTS.filter(function (k) { return parts[k]; }).map(function (k) {
          return el("span", { style: "--c: " + SUBJ_HUE[k] + "; --f: " + (parts[k] / (tot || 1)).toFixed(3) });
        }));
      }));
  }
  KOS.reportsHomeCard = homeCard;

  /* ================= the view ================= */
  /* arg: {period, start, section} — or a notification's {period, id} */
  function normArg(arg) {
    arg = arg || {};
    var out = { period: arg.period === "week" ? "week" : "week", start: null, section: null };
    if (arg.start && /^\d{4}-\d{2}-\d{2}$/.test(arg.start)) out.start = arg.start;
    else if (typeof arg.id === "string" && /:\d{4}-\d{2}-\d{2}$/.test(arg.id)) out.start = arg.id.slice(arg.id.indexOf(":") + 1);
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
      if (!arg.start) { indexPage(holder, reps); return; }
      var rep = reps.filter(function (r) { return r.start === arg.start; })[0];
      if (!rep) {
        holder.appendChild(crumbs([{ label: "Reports", go: function () { KOS.show("reports"); } }, { label: "Week of " + dm(arg.start) }]));
        holder.appendChild(KOS.ui.emptyState({ mark: "録", title: "No report for the week of " + dm(arg.start),
          body: "A week is saved on the Monday after it ends. This one has not been written yet, or this device was not open for it." }));
        return;
      }
      if (arg.section === "study") studyOverview(holder, rep);
      else if (arg.section === "focus") focusOverview(holder, rep);
      else if (arg.section === "collection") collectionOverview(holder, rep);
      else reportPage(holder, rep, reps);
    });
  };
})();
