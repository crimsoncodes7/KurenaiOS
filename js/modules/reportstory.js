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

  /* ================= the story list, from the saved facts ================= */
  function slides(rep) {
    var f = rep.facts, s = f.study, fo = f.focus || {}, c = f.collection, g = f.gov || {};
    var words = W.current(rep), out = [];
    var make = {
      intro: function () {
        var chips = [];
        if (s.sessions) chips.push(W.plural(s.sessions, "session"));
        if (fo.blocks) chips.push(W.plural(fo.blocks, "Focus block"));
        if (c && c.count) chips.push(W.plural(c.count, "title"));
        return { t: "intro", hue: "var(--crimson)", hue2: "var(--cs)", ch: "Your week", eyebrow: "Week in review",
          title: "Your week, " + longRange(f.start, f.end), kanji: SEAL[f.period] || "週", chips: chips,
          sub: "Seven days of study, Focus, the plan and the Collection, from Monday to Sunday." };
      },
      study: function () {
        var keys = ["compsci", "maths", "it"].filter(function (k) { return s.bySubject[k]; });
        var foot = null;
        if (f.prev && f.prev.mins != null) {
          var d = s.mins - f.prev.mins;
          foot = d > 0 ? (f.prev.mins ? "Up " + W.hm(d) + " on last week." : "New this week: last week had no timed study.")
            : d === 0 ? "The same as last week." : "Down " + W.hm(-d) + " on last week.";
        }
        return { t: "big", hue: "var(--cs)", hue2: "var(--maths)", ch: "Study time", eyebrow: "Study", title: "You studied for",
          value: s.mins, fmt: "hm", unit: (s.sessions ? "across " + W.plural(s.sessions, "session") + ", " : "") + "on " + s.days + " of " + s.of + " days",
          segs: keys.map(function (k) { return { label: W.SUBJECT[k], value: s.bySubject[k], text: W.hm(s.bySubject[k]), hue: SUBJ_HUE[k] }; }),
          foot: foot };
      },
      topics: function () {
        var top = s.topics.slice(0, 5), max = Math.max.apply(null, top.map(function (t) { return t.mins || t.reviews || 1; }).concat([1]));
        var foot = W.plural(s.touched, "topic") + " touched" + (s.toGreen ? ", " + s.toGreen + " moved to Green" : "") + ".";
        return { t: "top", hue: "var(--maths)", hue2: "var(--cs)", ch: "Top topics", eyebrow: "Top topics", title: "The topics you spent the week on",
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
          title: W.plural(c.count, "title") + " in one week", value: c.count, fmt: "int", tiles: tiles,
          legend: mods.map(function (m) { return { label: MOD_LABEL[m], hue: MOD_HUE[m], text: c.byModule[m] + (unit[m] ? " · " + unit[m] : "") }; }),
          foot: (per > 1 ? "Each tile is about " + per + " titles" + (bits.length ? " · " : "") : "") + (bits.length ? W.list(bits) + "." : "") };
      },
      hilo: function () {
        var one = function (tag, t, hue) {
          return { tag: tag, name: t.title, meta: MOD_LABEL[t.module] + (t.status ? " · " + t.status : ""), value: t.score, hue: hue, module: t.module };
        };
        var hiT = c.titles.filter(function (t) { return t.title === c.hi.title; })[0] || {}, loT = c.titles.filter(function (t) { return t.title === c.lo.title; })[0] || {};
        var hi = one("Highest score", c.hi, "var(--green)"), lo = one("Lowest score", c.lo, "var(--red)");
        hi.cover = hiT.cover || null; lo.cover = loT.cover || null;
        return { t: "hilo", hue: "var(--green)", hue2: "var(--red)", ch: "Highs & lows", eyebrow: "Highs and lows", title: "Your best and toughest scores",
          cards: [hi, lo], foot: c.scores ? W.plural(c.scores.n, "score") + " given · average " + c.scores.avg : null };
      },
      persona: function () {
        var p = fo.persona;
        return { t: "persona", hue: "var(--amber)", hue2: "var(--crimson)", ch: "Focus style", eyebrow: "Your Focus style",
          title: "This week you were " + article(p.name), name: p.name, fact: p.fact, stats: p.stats, kanji: p.kanji };
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
      recap: function () {
        var rows = [[W.hm(s.mins), "studied"]];
        if (s.recall != null) rows.push([s.recall + "%", "recall"]);
        if (c && c.count) rows.push([W.num(c.count), c.count === 1 ? "title" : "titles"]);
        if (fo.blocks) rows.push([String(fo.blocks), "Focus blocks"]);
        if (f.plan) rows.push([f.plan.ticked + "/" + f.plan.planned, "plan rows"]);
        if (g.streak) rows.push([String(g.streak), "day streak"]);
        if (s.toGreen && rows.length < 6) rows.push([String(s.toGreen), "to Green"]);
        return { t: "summary", hue: "var(--gold)", hue2: "var(--crimson)", ch: "Recap", eyebrow: "That was your week", title: words.headline,
          rows: rows.slice(0, 6), earned: g.xp ? "Earned +" + W.num(g.xp) + " XP" + (g.gold ? " · +" + W.num(g.gold) + " ◆" : "") : null };
      }
    };
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
          stageCover({ module: h.module, name: h.name, cover: h.cover }),
          el("div", { class: "k-rp-st-hilo-t" }, [el("span", { class: "k-rp-st-eyebrow", text: h.tag }), el("b", { text: h.name }),
            el("span", { class: "k-rp-st-meta", text: h.meta }), el("span", { class: "k-rp-st-score" }, [el("b", { class: "k-mono", text: String(h.value) }), el("span", { class: "k-mono", text: "/10" })])])
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
      add(el("div", { class: "k-rp-st-bars", role: "img", "aria-label": sl.cols.map(function (c, i) { return DOW3[i] + " " + (c.text || "0m"); }).join(", ") },
        sl.cols.map(function (c, i) {
          return el("span", { class: "k-rp-st-col", "data-state": i === sl.hi ? "hi" : null }, [
            el("span", { class: "k-mono k-rp-st-colv", text: c.text }),
            el("i", { class: "k-rp-grow k-rp-grow--y", style: "--h: " + (100 * c.value / bmax).toFixed(1) + "%" })
          ]);
        })), 150);
      add(el("div", { class: "k-rp-st-cols-l", "aria-hidden": "true" }, sl.cols.map(function (c, i) { return el("span", { "data-state": i === sl.hi ? "hi" : null, text: c.label }); })), 150);
      add(el("div", { class: "k-rp-st-calls" }, sl.calls.map(function (k, i) {
        return inn(el("div", { class: "k-rp-st-call" }, [el("span", { class: "k-rp-st-eyebrow", style: "--c: " + k.hue, text: k.label }), el("b", { text: k.value }), el("span", { class: "k-mono", text: k.text })]), 700 + i * 150);
      })), 0);
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
    var closeBtn = el("button", { type: "button", class: "k-rp-st-round", "data-ui": "reports.story-close", "aria-label": "Close the story", text: "✕", onclick: close });
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
      el("button", { type: "button", class: "k-rp-st-arrow", "data-edge": "prev", "data-ui": "reports.story-prev", "aria-label": "Previous story", text: "‹", onclick: function () { go(-1); } }),
      frame,
      el("button", { type: "button", class: "k-rp-st-arrow", "data-edge": "next", "data-ui": "reports.story-next", "aria-label": "Next story", text: "›", onclick: function () { go(1); } }),
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
      pauseBtn.textContent = paused ? "▶" : "❚❚";
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
