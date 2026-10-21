/* Kurenai OS — modules/exams.js
   The Exams & Deadlines hub (roadmap 5.8, docs/exams-plan.md), drawn to
   design turn 29 (frames 29a–29ab). This file is the hub's frame and its
   shared pieces, the Timetable (29b) with its Load view and importer
   (29y), an assessment's overview at every tier (29e, 29f), the editor
   (29c) and the Scope Builder (29d). Readiness, the Planner, Season and
   Results are js/modules/examviews.js; Practice, the post-mortem, marks
   by question, what changed and the library are js/modules/examprac.js;
   the Exam Room is js/modules/examroom.js.

     #/exams                      the landing: Season while exam season is
                                  on, else the Timetable
     #/exams/<tab>[/<sub>]        timetable[/load|past] · readiness[/<id>]
                                  · plan · practice[/analytics|library]
                                  · season · results
     #/exams/<id>[/<page>]        an assessment: overview · scope · room
     #/exams/attempt/<uid>[/marks|changed]   one attempt

   Pages only READ (invariants 54, 129; smoke56, smoke91): a render writes
   nothing. A click may write, always through KOS.exams, KOS.tracker or
   KOS.examPlan. Tier is glyph and word, never colour; At risk, Red and a
   passed start-by are the fixed --alarm with ▲/▼ and a word (invariant
   26a); a subject's hue only on bars, dots and washes (invariant 103).  */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function E() { return KOS.exams; }
  var SUBJ = { compsci: "Computer Science", maths: "Mathematics", it: "IT" };
  var SHORT = { compsci: "CS", maths: "Maths", it: "IT" };
  var HUE = { compsci: "var(--cs)", maths: "var(--maths)", it: "var(--it)" };
  var TIER = { real_exam: ["◆", "Real exam"], mock: ["◈", "Mock"], topic_test: ["▤", "Topic test"], retrieval_test: ["↻", "Retrieval quiz"], deadline: ["⚑", "Deadline"] };
  var TIER_LINE = {
    real_exam: "The full set: four signals, the planner, practice and its analytics",
    mock: "The full set; a cap and a custom scope if your school sets one",
    topic_test: "Coverage, RAG and recall, and a topic pack shelf",
    retrieval_test: "One card: recall on the day and a cram deck",
    deadline: "Milestones and a start-by date; no readiness model"
  };
  var BAND = { ready: ["✓ Ready", "green"], on: ["● On track", "teal"], risk: ["▲ At risk", "danger"], thin: ["○ Not enough evidence", "muted"] };
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var TABS = [["season", "Season"], ["timetable", "Timetable"], ["readiness", "Readiness"], ["plan", "Planner"], ["practice", "Practice"]];

  /* ---------------- words ---------------- */
  function today() { return KOS.srs.todayISO(); }
  function parse(iso) { var p = iso.split("-"); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function pretty(iso, o) {
    if (!iso) return "";
    o = o || {};
    var d = parse(iso);
    return (o.dow === false ? "" : DOW[d.getDay()] + " ") + d.getDate() + " " + MONTHS[d.getMonth()] +
      (o.year || d.getFullYear() !== new Date().getFullYear() ? " " + d.getFullYear() : "");
  }
  function inDays(n) {
    if (n == null) return "";
    if (n === 0) return "today";
    if (n === 1) return "tomorrow";
    if (n === -1) return "yesterday";
    return n > 0 ? "in " + n + " days" : Math.abs(n) + " days ago";
  }
  function mins(m) {
    if (!m) return "";
    var h = Math.floor(m / 60), r = Math.round(m % 60);
    return (h ? h + " h" : "") + (r ? (h ? " " : "") + r + (h ? "" : " min") : "");
  }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : many || one + "s"); }
  function pc(v) { return Math.round(100 * v) + "%"; }
  function hueOf(a) { return a && HUE[a.subject] ? HUE[a.subject] : "var(--muted)"; }
  function announce(t) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(t); }
  function btn(text, kind, onclick, extra) {
    var cls = "k-btn" + (kind && kind.indexOf("primary") !== -1 ? " k-btn--primary" : "") + (kind && kind.indexOf("quiet") !== -1 ? " k-btn--quiet" : "") +
      (kind && kind.indexOf("sm") !== -1 ? " k-btn--sm" : "") + (kind && kind.indexOf("danger") !== -1 ? " k-btn--danger" : "");
    return el("button", Object.assign({ type: "button", class: cls, "data-intent": kind && kind.indexOf("primary") !== -1 ? "primary" : kind && kind.indexOf("danger") !== -1 ? "danger" : null, text: text, onclick: onclick }, extra || {}));
  }
  function card(kids, cls, hook) { return el("div", { class: "k-card k-ex-card" + (cls ? " " + cls : ""), "data-ui": hook || null }, kids.filter(Boolean)); }
  function chead(title, meta, link) {
    return el("div", { class: "k-ex-chead" }, [el("span", { class: "k-ex-ctitle", text: title }),
      meta ? el("span", { class: "k-ex-cmeta", text: meta }) : el("span", { class: "k-ex-cmeta" }), link || null].filter(Boolean));
  }
  function linkBtn(text, onclick, hook) { return el("button", { type: "button", class: "k-link k-ex-clink", "data-ui": hook || null, text: text, onclick: onclick }); }
  function eyebrow(t) { return el("div", { class: "k-ex-eyebrow", text: t }); }
  function muted(t, cls) { return el("span", { class: "k-ex-muted" + (cls ? " " + cls : ""), text: t }); }

  /* ---------------- the shared components (29-primitives 1–2) ---------------- */
  /* TIER: glyph + word, the weight stepping with the tier (filled, outlined
     bold, outlined) so it survives greyscale and every theme */
  function tierChip(t, sm) {
    var x = TIER[t] || TIER.real_exam;
    return el("span", { class: "k-ex-tier", "data-ui": "exams.tier", "data-tier": t, "data-size": sm ? "sm" : null }, [
      el("span", { class: "k-ex-tier-g", "aria-hidden": "true", text: x[0] }), el("span", { text: x[1] })]);
  }
  /* THE BAND: the verdict and the one signal holding it down — printed for
     At risk always, for On track only with one weak signal, never Ready */
  function bandEl(b, o) {
    if (!b) return null;
    o = o || {};
    var x = BAND[b.band];
    var lim = b.band === "ready" ? null : b.limitName;
    return el("div", { class: "k-ex-band", "data-ui": "exams.band", "data-band": b.band, "data-row": o.row ? "" : null, "data-size": o.big ? "big" : null, title: b.why || null }, [
      el("span", { class: "k-chip", "data-tone": x[1], text: x[0] }),
      lim ? el("span", { class: "k-ex-limit" }, ["limiting: ", el("span", { text: lim })]) : null
    ].filter(Boolean));
  }
  function prov() { return el("span", { class: "k-ex-prov", "data-ui": "exams.prov", text: "◌ Provisional" }); }
  function startByEl(a, o) {
    var s = E().startState(a);
    if (!s) return null;
    o = o || {};
    var text = s.state === "met" ? "Started " + pretty(s.date) : s.state === "today" ? "Start today" : s.state === "passed" ? "Start-by passed · " + plural(s.ago, "day") + " ago"
      : "Start by " + pretty(s.date) + (o.inDays ? " · in " + plural(s.in, "day") : "") + (o.why && !s.sb.override ? " · " + s.sb.why : "");
    return el("span", { class: "k-ex-sb", "data-ui": "exams.startby", "data-state": s.state, title: s.sb.override ? "Your start-by date" : s.sb.why }, [
      el("span", { "aria-hidden": "true", text: s.state === "passed" ? "▼" : s.state === "met" ? "✓" : "⚐" }), el("span", { text: text })]);
  }
  function scopeLine(a) {
    var t = E().scopeSummary(a);
    if (!t) return null;
    return el("span", { class: "k-ex-scope", "data-ui": "exams.scope-line" }, [el("span", { class: "k-ex-scope-g", "aria-hidden": "true", text: "▣" }), el("span", { class: "k-ex-ell", text: t })]);
  }
  function excludedEl(a, why) {
    var ex = E().excluded(a);
    if (!ex.length) return null;
    return el("div", { class: "k-ex-excl", "data-ui": "exams.excluded", role: "note" }, [
      el("span", { class: "k-ex-excl-g", "aria-hidden": "true", text: "⊘" }),
      el("div", { class: "k-ex-grow" }, [el("b", { text: "Excluded from this test" }),
        el("div", { text: ex.map(function (x) { return x.ref + " " + x.title + (x.leaves > 1 ? " · " + x.leaves + " leaves" : ""); }).join(" · ") }),
        why ? el("div", { class: "k-ex-small k-ex-muted", text: why }) : null].filter(Boolean))]);
  }
  /* THE SIGNAL CARD: normal · limiting (alarm inset + "▲ Holding it down")
     · low evidence (no figure, no zero, one line on when it appears) */
  function sigCard(n, name, body, o) {
    o = o || {};
    return el("div", { class: "k-ex-sig", "data-ui": "exams.signal", "data-signal": o.key || null, "data-state": o.limit ? "limit" : o.thin ? "thin" : null,
      role: o.onOpen ? "link" : null, tabindex: o.onOpen ? "0" : null, onclick: o.onOpen || null,
      onkeydown: o.onOpen ? function (e) { if (e.key === "Enter") o.onOpen(); } : null }, [
      el("div", { class: "k-ex-sig-head" }, [el("span", { class: "k-ex-sig-n", text: String(n) }), el("span", { class: "k-ex-sig-name", text: name }), el("span", { class: "k-ex-grow" }),
        o.limit ? el("span", { class: "k-chip", "data-tone": "danger", text: "▲ Holding it down" }) : o.meta ? muted(o.meta, "k-ex-nowrap") : null].filter(Boolean))
    ].concat(body).concat(o.foot ? [el("div", { class: "k-ex-grow" }), o.foot] : []).filter(Boolean));
  }
  function quiet(t, sub) { return el("div", { class: "k-ex-quiet", "data-ui": "exams.thin" }, [el("div", { text: t }), sub ? muted(sub) : null].filter(Boolean)); }
  function bigFig(v, unit, sub) {
    return el("div", { class: "k-ex-bigfig" }, [el("div", { class: "k-ex-bigfig-row" }, [el("span", { class: "k-ex-fig", text: v }), unit ? muted(unit) : null].filter(Boolean)),
      sub ? el("div", { class: "k-ex-small k-ex-muted" }, [].concat(sub)) : null].filter(Boolean));
  }
  function tickBar(p, tgt, tone) {
    var b = el("div", { class: "k-ex-tick", "data-tone": tone || null, "aria-hidden": "true" }, [el("i")]);
    b.style.setProperty("--p", Math.max(0, Math.min(100, p)).toFixed(1) + "%");
    if (tgt != null) { b.appendChild(el("b")); b.style.setProperty("--t", tgt.toFixed(1) + "%"); }
    return b;
  }
  /* THE RAG BAR: unrated hatched, never grey alone */
  function ragBar(s, o) {
    o = o || {};
    var bar = el("div", { class: "k-ex-rag", "data-size": o.thin ? "thin" : null, role: "img",
      "aria-label": "Green " + pc(s.green) + ", amber " + pc(s.amber) + ", red " + pc(s.red) + ", unrated " + pc(s.unrated) }, ["g", "a", "r", "u"].map(function (k) {
      var v = { g: s.green, a: s.amber, r: s.red, u: s.unrated }[k];
      var seg = el("span", { "data-k": k });
      seg.style.setProperty("--g", String(Math.max(0, v)));
      return seg;
    }));
    if (o.legend === false) return bar;
    return el("div", { class: "k-ex-ragwrap" }, [bar, el("div", { class: "k-ex-raglegend", "data-cols": o.cols || 2 }, [["●", "Green", s.green, "g"], ["◐", "Amber", s.amber, "a"], ["▲", "Red", s.red, "r"], ["○", "Unrated", s.unrated, "u"]].map(function (x) {
      return el("span", { "data-k": x[3] }, [el("span", { class: "k-ex-ragg", "aria-hidden": "true", text: x[0] }), x[1], el("b", { class: "k-mono", text: pc(x[2]) })]);
    }))]);
  }
  /* THE GRADE RANGE: always a range, with the boundary series named */
  function gradesEl(lo, hi, list) {
    list = list || ["E", "D", "C", "B", "A", "A*"];
    var i0 = list.indexOf(lo), i1 = list.indexOf(hi);
    return el("div", { class: "k-ex-grades", role: "img", "aria-label": "Predicted " + lo + (hi !== lo ? " to " + hi : "") },
      list.map(function (g, i) { return el("span", { "data-on": i >= Math.min(i0, i1) && i <= Math.max(i0, i1) ? "" : null, "data-edge": i === Math.min(i0, i1) ? "lo" : i === Math.max(i0, i1) ? "hi" : null, text: g }); }));
  }
  function ringEl(p, size, hue, inner, tick) {
    var r = KOS.ui.ring({ p: p, size: size, tick: tick, stroke: size >= 140 ? 14 : 9 }, inner);
    r.classList.add("k-ex-ring");
    if (hue) r.style.setProperty("--ring-c", hue);
    return r;
  }
  function weakList(rows) {
    return el("div", { class: "k-ex-weak" }, rows.map(function (x) {
      return el("div", { class: "k-ex-weakrow" }, [el("span", { class: "k-ex-ell", text: x.title }), tickBar(100 * x.r, null, x.r < 0.7 ? "amber" : null), el("span", { class: "k-mono", text: pc(x.r) })]);
    }));
  }
  function miniList(title, rows) {
    return el("div", { class: "k-ex-mini" }, [el("div", { class: "k-ex-minihead", text: title })].concat(rows.map(function (r) {
      return el("div", { class: "k-ex-minirow" }, [el("span", { class: "k-mono", text: r[0] }), el("span", { class: "k-ex-ell", text: r[1] }),
        el("span", { "data-tone": String(r[2] || "").indexOf("▲") === 0 ? "danger" : null, text: r[2] || "" })]);
    })));
  }
  function dateBlock(a, o) {
    o = o || {};
    if (!a.date) return el("span", { class: "k-ex-dateblk", "data-state": "none", "aria-hidden": "true" }, [el("span", { text: "No" }), el("b", { text: "—" }), el("span", { text: "date" })]);
    var d = parse(a.date);
    return el("span", { class: "k-ex-dateblk", "data-state": a.provisional ? "prov" : null, "aria-hidden": "true" }, [
      el("span", { text: DOW[d.getDay()] }), el("b", { class: "k-mono", text: String(d.getDate()) }), el("span", { text: o.days != null ? o.days + " d" : MONTHS[d.getMonth()] })]);
  }
  function daysLeftEl(n) {
    if (n == null || n < 0) return el("span", { class: "k-ex-days" });
    return el("span", { class: "k-ex-days", "data-near": n < 10 ? "" : null }, [el("b", { class: "k-mono", text: n === 0 ? "Today" : String(n) }), n === 0 ? null : el("span", { text: n === 1 ? "day" : "days" })].filter(Boolean));
  }

  /* the four signals, from KOS.exams.readiness (29e) */
  function signals(a, rd, o) {
    o = o || {};
    var s = rd.signals, b = rd.band, out = [];
    var lim = b && b.band === "risk" ? b.limit : null;
    function open(k) { return o.noLink ? null : function () { KOS.show("exams", { tab: "readiness", sub: a.id }); }; }
    if (s.coverage) out.push(sigCard(1, "Coverage", s.coverage.thin ? [quiet(s.coverage.why, s.coverage.sub)] : [
      bigFig(pc(s.coverage.value), "covered", s.coverage.unmet.length ? plural(s.coverage.unmet.length, "leaf", "leaves") + " not yet met" : "every leaf met"),
      tickBar(100 * s.coverage.value, null)], { key: "coverage", thin: s.coverage.thin, limit: lim === "coverage", onOpen: open("coverage"),
      foot: o.full && !s.coverage.thin && s.coverage.unmet.length ? miniList("Not yet met", s.coverage.unmet.slice(0, 5).map(function (u) { return [u.ref, u.title, u.week ? "w/c " + pretty(u.week, { dow: false }) : "not in Pacing"]; })) : null }));
    if (s.rag) out.push(sigCard(2, "RAG", s.rag.thin ? [quiet(s.rag.why, s.rag.sub)] : [ragBar(s.rag, { cols: o.cols1 ? 1 : 2 })],
      { key: "rag", thin: s.rag.thin, limit: lim === "rag", onOpen: open("rag"),
        foot: o.full && !s.rag.thin ? miniList("Most red, by unit", s.rag.units.slice().sort(function (x, y) { return y.red - x.red; }).slice(0, 5).map(function (u) {
          return [u.ref, u.title, u.red >= 0.15 ? "▲ " + pc(u.red) + " red" : u.red ? pc(u.red) + " red" : ""];
        })) : null }));
    if (s.recall) {
      var tgt = Math.round(100 * rd.target);
      out.push(sigCard(3, s.recall.today ? "Recall today" : "Projected recall", s.recall.thin ? [quiet(s.recall.why, s.recall.sub)] : [
        bigFig(pc(s.recall.value), s.recall.today ? "today" : "on " + pretty(s.recall.on, { dow: false }), ["target ", el("span", { class: "k-mono", text: tgt + "%" }), " · from FSRS"]),
        tickBar(100 * s.recall.value, tgt, lim === "recall" ? "alarm" : null),
        s.recall.weakest.length ? el("div", {}, [el("div", { class: "k-ex-minihead", text: s.recall.today ? "Weakest today" : "Weakest on the day" }), weakList(s.recall.weakest.slice(0, o.full ? 5 : 3))]) : null
      ], { key: "recall", thin: s.recall.thin, limit: lim === "recall", onOpen: open("recall"),
        foot: o.full && !s.recall.thin ? el("div", { class: "k-ex-sigfoot", text: plural(s.recall.cards, "card") + " in scope · " + plural(s.recall.rated, "rated card") }) : null }));
    }
    if (s.practice) {
      var p = s.practice, pr = p.predicted;
      out.push(sigCard(4, "Timed practice", p.thin ? [quiet(p.why, p.sub)] : [
        el("div", { class: "k-ex-pracrow" }, [bigFig(String(p.n), p.n === 1 ? "timed paper" : "timed papers", p.list.slice(-3).map(function (x) { return Math.round(x.pct) + "%"; }).join(" → ")),
          p.list.length >= 2 ? spark(p.list.slice(-5).map(function (x) { return x.pct; })) : null].filter(Boolean)),
        pr && !pr.thin ? el("div", { class: "k-ex-predrow" }, [el("div", { class: "k-ex-small k-ex-muted" }, ["Predicted ", el("b", { text: pr.lo === pr.hi ? pr.lo : pr.lo + "–" + pr.hi }), " · " + pr.seriesText + " boundaries" + (pr.confirmed ? "" : " (provisional)")]), gradesEl(pr.lo, pr.hi)])
          : pr && pr.noBounds ? muted("No grade boundaries for this paper yet")
          : muted(plural(Math.max(0, (pr ? pr.need : 3) - p.n), "more timed paper") + " give" + ((pr ? pr.need : 3) - p.n === 1 ? "s" : "") + " a grade range · " + p.n + " so far")
      ], { key: "practice", thin: p.thin, limit: lim === "practice", onOpen: open("practice"), foot: o.practiceFoot || null }));
    }
    return out;
  }
  function spark(vals) {
    var NS = "http://www.w3.org/2000/svg", w = 96, h = 34, mn = 30, mx = 100;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h); svg.setAttribute("class", "k-ex-spark"); svg.setAttribute("aria-hidden", "true");
    var pts = vals.map(function (v, i) { return [6 + i * (w - 12) / Math.max(1, vals.length - 1), h - 4 - (Math.max(mn, Math.min(mx, v)) - mn) / (mx - mn) * (h - 8)]; });
    var pl = document.createElementNS(NS, "polyline");
    pl.setAttribute("points", pts.map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" "));
    svg.appendChild(pl);
    pts.forEach(function (p, i) { var c = document.createElementNS(NS, "circle"); c.setAttribute("cx", p[0].toFixed(1)); c.setAttribute("cy", p[1].toFixed(1)); c.setAttribute("r", i === pts.length - 1 ? 4 : 3); if (i === pts.length - 1) c.setAttribute("data-last", ""); svg.appendChild(c); });
    return svg;
  }

  /* ---------------- the hub's frame (29a) ---------------- */
  function hubTabs(tab, season) {
    var items = TABS.filter(function (t) { return t[0] !== "season" || season; }).map(function (t) {
      return { label: t[1], active: t[0] === tab, onSelect: function () { if (t[0] !== tab) KOS.show("exams", t[0]); } };
    });
    var tabs = KOS.ui.tabs(items, { variant: "workspace", label: "Exams & Papers", edge: true });
    tabs.setAttribute("data-ui", (tabs.getAttribute("data-ui") || "") + " exams.tabs");
    return tabs;
  }
  /* kept for any caller that wants the switcher alone */
  function examTabs(active) { return hubTabs(active === "practice" ? "practice" : active || "timetable", E().season().on); }
  function seasonSwitch() {
    var sn = E().season();
    var box = el("input", { type: "checkbox", class: "k-switch", "data-ui": "exams.season", "aria-label": "Exam season",
      onchange: function () {
        E().setSeason(box.checked);
        announce(box.checked ? "Exam season on. Season view is now the landing page." : "Exam season off.");
        KOS.show("exams", box.checked ? "season" : "timetable");
      } });
    box.checked = sn.on;
    return el("label", { class: "k-ex-seasonsw", title: sn.override ? "Set by you; it lapses with this season" : "Automatic: on 28 days before a real exam, off after the series' last" }, [box, el("span", { text: "Exam season" })]);
  }
  function nextWhen(a) {
    if (!a || !a.date) return "";
    var d = E().daysTo(a);
    return d === 0 ? "today" : d === 1 ? "tomorrow" : d < 7 ? "on " + ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][parse(a.date).getDay()] : "on " + pretty(a.date, { dow: false });
  }
  /* the exam within the next hour, which makes the Exam Room the only
     primary button on the page (29a) */
  function roomNow() {
    var now = new Date(), t = today();
    return E().upcoming(t).filter(function (a) {
      if (a.date !== t || a.tier !== "real_exam" && a.tier !== "mock" || !a.time) return false;
      var p = a.time.split(":"), at = +p[0] * 60 + +p[1], m = now.getHours() * 60 + now.getMinutes();
      return at - m <= 60 && at - m >= -10;
    })[0] || null;
  }
  function head(main, tab, o) {
    o = o || {};
    var sn = E().season(), up = E().upcoming(), next = up[0];
    var room = roomNow();
    var sub = o.sub || (sn.on && sn.exams.length ? plural(sn.exams.length, "exam") + " in this season · the next is " + sn.exams[0].title + " " + nextWhen(sn.exams[0])
      : up.length ? plural(up.length, "assessment") + " ahead · the next is " + next.title + " " + nextWhen(next) : "Every exam, mock, test and deadline in one place");
    var primary = room || (sn.on && sn.next && sn.next.date === today())
      ? btn("Exam Room", "primary", function () { KOS.show("exams", { id: (room || sn.next).id, tab: "room" }); }, { "data-ui": "exams.room-btn" })
      : btn("＋ New assessment", "primary", function () { editor(null, {}, function (a) { KOS.show("exams", a.id); }); }, { "data-ui": "exams.add" });
    main.appendChild(KOS.ui.pageHeader({ kicker: sn.on ? "試 · Exam season" : "試 · The record", title: "Exams & Papers", sub: sub, className: "k-ex-head",
      actions: [seasonSwitch(), btn("＋ Log a result", "", function () { KOS.trackerLog({}, function () { KOS.rerender(); }); }, { "data-ui": "exams.log" }), primary] }));
    main.appendChild(el("div", { class: "k-ex-tabsrow", "data-ui": "exams.tabsrow" }, [hubTabs(tab, sn.on), el("span", { class: "k-ex-grow" }), o.right || null].filter(Boolean)));
  }

  /* ---------------- the Timetable (29b) ---------------- */
  function timetable(main, sub) {
    var X = E(), t = today();
    var mode = sub === "load" ? "load" : "list";
    var sw = KOS.ui.tabs([{ label: "List", active: mode === "list", onSelect: function () { if (mode !== "list") KOS.show("exams", "timetable"); } },
      { label: "Load", active: mode === "load", onSelect: function () { if (mode !== "load") KOS.show("exams", { tab: "timetable", sub: "load" }); } }], { variant: "workspace", label: "Timetable view" });
    sw.setAttribute("data-ui", sw.getAttribute("data-ui") + " exams.ttview");
    head(main, "timetable", { right: sw });
    var all = X.all().filter(function (a) { return !a.archived; });
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.hub exams.timetable" });
    main.appendChild(wrap);
    if (!all.length) {
      wrap.appendChild(KOS.ui.emptyState({ mark: "試", title: "Add your first assessment",
        body: "A real exam, a mock, a topic test or a deadline. Exams on your calendar move here by themselves.",
        action: el("div", { class: "k-ex-actions" }, [btn("＋ New assessment", "primary", function () { editor(null, {}, function (a) { KOS.show("exams", a.id); }); }),
          btn("⇣ Import timetable", "", importDialog)]) }));
      return;
    }
    if (mode === "load") return loadView(wrap);
    var up = X.upcoming(t), past = X.past(t), undated = all.filter(function (a) { return !a.date; });
    var next = up.filter(function (a) { return a.tier !== "deadline"; })[0] || up[0];
    if (next) wrap.appendChild(nextHero(next, up));
    /* filters, per visit */
    var fSubj = "", fTier = "", showPast = sub === "past";
    var listHost = el("div", { class: "k-ex-ttlist-host" });
    function counts(sid) { return all.filter(function (a) { return !sid || a.subject === sid; }).length; }
    var subjTabs = KOS.ui.tabs([["", "All"], ["compsci", "CS"], ["maths", "Maths"], ["it", "IT"]].filter(function (x) { return !x[0] || counts(x[0]); }).map(function (x) {
      return { label: x[0] ? SUBJ[x[0]] : "All", short: x[1], dot: x[0] ? HUE[x[0]] : null, count: counts(x[0]), active: x[0] === fSubj, onSelect: function (ev) {
        fSubj = x[0];
        subjTabs.querySelectorAll("[data-ui~='ui.tab']").forEach(function (b) { var on = b === ev.currentTarget; KOS.ui.state(b, "active", on); b.setAttribute("aria-selected", String(on)); });
        drawList();
        var n = rowsFor(up).length;
        announce("Showing " + plural(n, (x[0] ? SUBJ[x[0]] + " " : "") + "assessment") + ".");
      } };
    }), { variant: "workspace", label: "Subject" });
    var tierSel = el("select", { class: "k-pill-select", "data-ui": "exams.tierfilter", "aria-label": "Filter by tier", onchange: function () { fTier = tierSel.value; drawList(); } },
      [el("option", { value: "", text: "Every tier" })].concat(Object.keys(TIER).map(function (k) { return el("option", { value: k, text: TIER[k][0] + " " + TIER[k][1] }); })));
    wrap.appendChild(el("div", { class: "k-ex-filters", "data-ui": "exams.filters" }, [subjTabs, tierSel, el("span", { class: "k-ex-grow" }),
      btn("⇣ Import timetable", "quiet", importDialog, { "data-ui": "exams.import" })]));
    function rowsFor(list) { return list.filter(function (a) { return (!fSubj || a.subject === fSubj) && (!fTier || a.tier === fTier); }); }
    function drawList() {
      listHost.innerHTML = "";
      var rows = rowsFor(up), groups = [], by = {};
      rows.forEach(function (a) {
        var k = a.date.slice(0, 7);
        if (!by[k]) { by[k] = []; groups.push(k); }
        by[k].push(a);
      });
      var c = el("div", { class: "k-card k-ex-ttlist", "data-ui": "exams.list" });
      if (!rows.length && !rowsFor(undated).length) {
        c.appendChild(el("div", { class: "k-ex-nomatch", "data-ui": "exams.nomatch" }, [
          el("span", { text: "No " + (fTier ? TIER[fTier][1].toLowerCase() + "s" : "assessments") + (fSubj ? " for " + SHORT[fSubj] : "") + " ahead." }),
          btn("Clear", "quiet sm", function () { fSubj = ""; fTier = ""; tierSel.value = ""; KOS.rerender(); })]));
      }
      groups.forEach(function (k) {
        var list = by[k], y = +k.slice(0, 4), m = +k.slice(5, 7) - 1;
        var mocks = list.filter(function (a) { return a.tier === "mock"; }).length;
        var allProv = list.every(function (a) { return a.provisional; });
        c.appendChild(monthHead(MONTH_LONG[m] + (y !== new Date().getFullYear() ? " " + y : ""), allProv ? "provisional until the boards publish the final timetable" : mocks >= 2 ? plural(mocks, "mock") : ""));
        list.forEach(function (a, i) { c.appendChild(ttRow(a, i === 0)); });
      });
      var und = rowsFor(undated);
      if (und.length) { c.appendChild(monthHead("No date yet", "")); und.forEach(function (a, i) { c.appendChild(ttRow(a, i === 0)); }); }
      var pst = rowsFor(past);
      if (pst.length) {
        if (showPast) { c.appendChild(monthHead("Past", "newest first")); pst.forEach(function (a, i) { c.appendChild(ttRow(a, i === 0)); }); }
        c.appendChild(el("div", { class: "k-ex-pastrow" }, [linkBtn(showPast ? "Hide past assessments" : "Show " + plural(pst.length, "past assessment") + " →", function () { showPast = !showPast; drawList(); }, "exams.past"),
          pst.some(function (a) { return a.tier === "real_exam"; }) ? linkBtn("Results day →", function () { KOS.show("exams", "results"); }, "exams.results-link") : null].filter(Boolean)));
      }
      listHost.appendChild(c);
    }
    drawList();
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [listHost, ttSide(up, all)]));
  }
  function monthHead(t, sub) {
    return el("div", { class: "k-ex-month", "data-ui": "exams.month" }, [el("span", { class: "k-ex-monthname", text: t }), sub ? muted(sub) : null].filter(Boolean));
  }
  function ttRow(a, first) {
    var days = E().daysTo(a), rd = E().readiness(a);
    var meta = a.tier === "deadline"
      ? [a.subject ? SHORT[a.subject] : null, a.location || null, a.milestones.length ? "milestones " + a.milestones.filter(function (m) { return m.done; }).length + " of " + a.milestones.length : null].filter(Boolean).join(" · ")
      : [a.subject ? SHORT[a.subject] : null, [a.board, a.qual].filter(Boolean).join(" ") || null, a.time || (a.date && a.provisional ? "time not set" : null),
        a.durationMins ? mins(a.durationMins) : null, a.location || null].filter(Boolean).join(" · ");
    var row = el("button", { type: "button", class: "k-ex-ttrow", "data-ui": "exams.row", "data-id": a.id, "data-first": first ? "" : null,
      "data-state": [a.result ? "done" : null, days != null && days < 0 ? "past" : null].filter(Boolean).join(" ") || null,
      style: "--s: " + hueOf(a), onclick: function () { KOS.show("exams", a.id); },
      onkeydown: function (e) {
        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        var rows = Array.prototype.slice.call(document.querySelectorAll("[data-ui~='exams.row']")), i = rows.indexOf(row);
        var nx = rows[i + (e.key === "ArrowDown" ? 1 : -1)];
        if (nx) { e.preventDefault(); nx.focus(); }
      } }, [
      dateBlock(a),
      el("span", { class: "k-ex-hbar", "aria-hidden": "true" }),
      el("span", { class: "k-ex-ttmain" }, [
        el("span", { class: "k-ex-ttline" }, [el("span", { class: "k-ex-tttitle", text: a.title }), tierChip(a.tier, true), a.provisional ? prov() : null].filter(Boolean)),
        meta ? el("span", { class: "k-ex-ttmeta k-ex-ell", text: meta }) : null,
        el("span", { class: "k-ex-ttfoot" }, [scopeLine(a), a.result ? el("span", { class: "k-chip", "data-tone": "green", text: "Result in · " + resultText(a.result) }) : startByEl(a)].filter(Boolean))
      ].filter(Boolean)),
      el("span", { class: "k-ex-ttband" }, [rd && rd.band ? bandEl(rd.band) : a.tier === "retrieval_test" && rd && rd.signals.recall && !rd.signals.recall.thin ? muted("recall " + pc(rd.signals.recall.value) + " today") : null].filter(Boolean)),
      daysLeftEl(days)
    ]);
    row.setAttribute("aria-label", a.title + ", " + TIER[a.tier][1] + (a.date ? ", " + pretty(a.date, { year: true }) + (days >= 0 ? ", " + inDays(days) : "") : ", no date") + (rd && rd.band ? ", " + BAND[rd.band.band][0].slice(2) : ""));
    return row;
  }
  function resultText(r) {
    if (!r) return "";
    var p = r.marks != null && r.max ? Math.round(100 * r.marks / r.max) + "%" : null;
    return [r.grade, p].filter(Boolean).join(" · ") || "logged";
  }
  /* the next assessment, large (29b's hero) */
  function nextHero(a, up) {
    var days = E().daysTo(a), rd = E().readiness(a), rc = rd && rd.signals.recall;
    var hasRing = rc && !rc.thin;
    var weak = hasRing && rc.weakest[0];
    var after = up.filter(function (x) { return x.id !== a.id; }).slice(0, 3);
    var lead = a.tier === "deadline" ? null : rc && rc.thin ? rc.sub : weak ? null : "";
    var line = a.tier === "deadline" ? (rd.milestones.overdue.length ? rd.milestones.overdue[0].text + " is overdue." : rd.milestones.of ? rd.milestones.done + " of " + rd.milestones.of + " milestones done." : "Add milestones to get a start-by date.")
      : weak ? [el("b", { text: weak.title }), " is the weak leaf at " + pc(weak.r) + (rc.today ? " today." : " on the day.")]
      : lead;
    var cram = a.tier !== "deadline" && E().leaves(a).length ? btn(a.tier === "real_exam" || a.tier === "mock" ? "＋ Log a paper" : "Cram this scope", "primary",
      a.tier === "real_exam" || a.tier === "mock" ? function () { KOS.trackerLog({ assessmentId: a.id }, function () { KOS.rerender(); }); } : function () { cramScope(a); }) : null;
    return el("section", { class: "k-ex-hero", "data-ui": "exams.next", style: "--s: " + hueOf(a) }, [
      el("span", { class: "k-ex-hero-mark", "aria-hidden": "true", lang: "ja", text: "試" }),
      hasRing ? ringEl(rc.value, 164, hueOf(a), [el("span", { class: "k-ex-ringfig", text: pc(rc.value) }), muted(rc.today ? "recall today" : "on the day")], rd.target)
        : el("div", { class: "k-ex-hero-days" }, [el("b", { class: "k-mono", text: days === 0 ? "Today" : String(days) }), days ? muted(days === 1 ? "day" : "days") : null].filter(Boolean)),
      el("div", { class: "k-ex-hero-mid" }, [
        el("div", { class: "k-ex-inline" }, [eyebrow("Next up · " + inDays(days)), tierChip(a.tier, true), a.provisional ? prov() : null].filter(Boolean)),
        el("h2", { class: "k-ex-hero-title", text: a.title }),
        el("div", { class: "k-ex-hero-meta", text: [pretty(a.date), a.time, a.durationMins ? mins(a.durationMins) : null, E().leaves(a).length ? plural(E().leaves(a).length, "leaf", "leaves") : null].filter(Boolean).join(" · ") }),
        line ? el("p", { class: "k-ex-hero-line" }, [].concat(line)) : null,
        el("div", { class: "k-ex-actions" }, [cram, a.tier === "real_exam" || a.tier === "mock" ? btn("Cram this scope", "", function () { cramScope(a); }) : null, btn("Open", "quiet", function () { KOS.show("exams", a.id); })].filter(Boolean))
      ].filter(Boolean)),
      after.length ? el("div", { class: "k-ex-hero-after" }, [eyebrow("After that")].concat(after.map(function (x) {
        var rx = E().readiness(x);
        return el("button", { type: "button", class: "k-ex-afterrow", style: "--s: " + hueOf(x), onclick: function () { KOS.show("exams", x.id); } }, [
          el("span", { class: "k-ex-hbar", "aria-hidden": "true" }),
          el("span", { class: "k-ex-aftermain" }, [el("span", { class: "k-ex-ell k-ex-strong", text: x.title }),
            el("span", { class: "k-ex-inline" }, [tierChip(x.tier, true), rx && rx.band && rx.band.band === "risk" ? el("span", { class: "k-chip", "data-tone": "danger", text: "▲ At risk" }) : null].filter(Boolean))]),
          daysLeftEl(E().daysTo(x))]);
      }))) : null
    ].filter(Boolean));
  }
  function ttSide(up, all) {
    var t = today(), side = el("div", { class: "k-ex-side", "data-ui": "exams.side" });
    /* Needs attention: an overdue milestone, or a start-by passed and not
       begun */
    var att = [];
    up.forEach(function (a) {
      var over = (a.milestones || []).filter(function (m) { return !m.done && m.date && m.date < t; });
      if (over.length) att.push({ a: a, kind: "ms", m: over[0] });
      else { var s = E().startState(a); if (s && s.state === "passed") att.push({ a: a, kind: "sb", s: s }); }
    });
    if (att.length) side.appendChild(card([chead("Needs attention", String(att.length))].concat(att.slice(0, 3).map(function (x) {
      var a = x.a;
      return el("div", { class: "k-ex-attn", style: "--s: " + hueOf(a) }, [el("span", { class: "k-ex-vbar", "aria-hidden": "true" }), el("div", { class: "k-ex-grow" }, [
        el("div", { class: "k-ex-strong", text: a.title }),
        el("span", { class: "k-chip", "data-tone": "danger", text: x.kind === "ms" ? "▲ Milestone overdue · " + plural(KOS.srs.daysBetween(x.m.date, t), "day") : "▼ Start-by passed · " + plural(x.s.ago, "day") + " ago" }),
        el("div", { class: "k-ex-small k-ex-muted", text: x.kind === "ms" ? x.m.text + " was due " + pretty(x.m.date) + ". " + (a.date ? "The hand-in is " + pretty(a.date) + "." : "") : "Any study on its topics counts as starting." }),
        el("div", { class: "k-ex-actions" }, x.kind === "ms" ? [btn("Mark done", "sm", function () { msDone(a, x.m.id, true); }), btn("Move the date", "quiet sm", function () { editor(a, {}, function () { KOS.rerender(); }); })]
          : [btn("Open", "sm", function () { KOS.show("exams", a.id); })])])]);
    })), "", "exams.attention"));
    var sbs = up.map(function (a) { return { a: a, s: E().startState(a) }; }).filter(function (x) { return x.s && (x.s.state === "future" || x.s.state === "today") && KOS.srs.daysBetween(t, x.s.date) <= 21; })
      .sort(function (x, y) { return x.s.date < y.s.date ? -1 : 1; });
    if (sbs.length) side.appendChild(card([chead("Start by", "advisory · the next three weeks")].concat(sbs.slice(0, 4).map(function (x) {
      return el("button", { type: "button", class: "k-ex-sbrow", onclick: function () { KOS.show("exams", x.a.id); } }, [startByEl(x.a), el("span", { class: "k-ex-grow k-ex-ell", text: x.a.title }), muted(x.s.state === "today" ? "today" : "in " + plural(x.s.in, "day"))]);
    })).concat([el("p", { class: "k-ex-foot", text: "From the hours each scope needs and your recent weekly hours. Change it on the assessment." })]), "", "exams.startbys"));
    side.appendChild(card([chead("Tiers", "how much of the hub each one gets")].concat(Object.keys(TIER).map(function (k) {
      return el("div", { class: "k-ex-legendrow" }, [tierChip(k, true), el("span", { class: "k-ex-small", text: TIER_LINE[k] })]);
    })), "", "exams.legend"));
    /* the year at a glance, by month and tier */
    var months = {}, order = [];
    up.forEach(function (a) { var k = a.date.slice(0, 7); if (!months[k]) { months[k] = {}; order.push(k); } months[k][a.tier] = (months[k][a.tier] || 0) + 1; });
    if (order.length) side.appendChild(card([chead("The year at a glance", "by tier")].concat(order.slice(0, 8).map(function (k) {
      var m = months[k], n = Object.keys(m).reduce(function (s, x) { return s + m[x]; }, 0);
      return el("div", { class: "k-ex-yearrow" }, [muted(MONTHS[+k.slice(5) - 1]), el("span", { class: "k-ex-inline" }, Object.keys(TIER).filter(function (x) { return m[x]; }).map(function (x) {
        return el("span", { class: "k-ex-inline" }, [tierChip(x, true), m[x] > 1 ? muted("× " + m[x]) : null].filter(Boolean));
      })), el("span", { class: "k-mono", text: String(n) })]);
    })).concat(up.some(function (a) { return a.provisional; }) ? [el("div", { class: "k-ex-grow" }), el("p", { class: "k-ex-foot", text: "Provisional dates stay so until the board publishes the final timetable." })] : []), "k-ex-fill", "exams.year"));
    else side.lastChild.classList.add("k-ex-fill");
    return side;
  }
  function msDone(a, mid, done) {
    var list = a.milestones.map(function (x) { return x.id === mid ? Object.assign({}, x, { done: done }) : x; });
    var next = E().update(a.id, { milestones: list });
    var m = a.milestones.filter(function (x) { return x.id === mid; })[0];
    var rd = E().readiness(next);
    announce((m ? m.text : "Milestone") + (done ? " done. " : " reopened. ") + list.filter(function (x) { return x.done; }).length + " of " + list.length + "." +
      (done && rd.band && rd.band.band !== "risk" ? " " + a.title + " is no longer at risk." : ""));
    KOS.rerender();
  }
  /* Review's cram run for a scope (29w): the Due page, filtered to it */
  function cramScope(a) { KOS.show("review", { tab: "due", run: "scope:" + a.id }); }

  /* ---------------- the Load view (29y) ---------------- */
  function loadView(wrap) {
    var lv = E().loadView();
    if (!lv) { wrap.appendChild(KOS.ui.emptyState({ compact: true, mark: "試", title: "Nothing to lay out yet", body: "Real exams, mocks and deadlines in the season, or the next eight weeks, appear here." })); return; }
    var strip = el("div", { class: "k-ex-load", "data-ui": "exams.load", style: "--n: " + Math.min(12, lv.cells.length) }, lv.cells.map(function (c) {
      var d = parse(c.date);
      return el("button", { type: "button", class: "k-ex-loadday", "data-ui": "exams.loadday", "data-flag": c.flag || null, "data-rest": c.rest ? "" : null,
        "aria-label": pretty(c.date) + (c.items.length ? ", " + c.items.map(function (x) { return x.title; }).join(", ") : ", nothing") + (c.flag ? (c.flag === "two" ? ", two on one day" : ", three in 48 hours") : "") + (c.rest ? ", recovery day" : ""),
        onclick: c.items.length ? function () { KOS.show("exams", c.items[0].id); } : null }, [
        el("span", { class: "k-ex-loadhead" }, [el("span", { text: DOW[d.getDay()] }), el("b", { class: "k-mono", text: String(d.getDate()) })]),
        el("span", { class: "k-ex-loaditems" }, c.items.map(function (x) { return el("span", { class: "k-ex-loaditem", style: "--s: " + (HUE[x.subject] || "var(--muted)") }, [el("i", { "aria-hidden": "true" }), el("span", { text: x.title + (x.time ? " · " + (+x.time.split(":")[0] < 12 ? "am" : "pm") : "") })]); })),
        c.flag ? el("span", { class: "k-ex-loadflag", text: "▲ " + (c.flag === "two" ? "Two on one day" : "3 in 48 h") }) : c.rest ? el("span", { class: "k-ex-loadrest", text: "◌ Recovery day" }) : null
      ].filter(Boolean));
    }));
    wrap.appendChild(card([chead("Load · " + pretty(lv.from, { dow: false }) + " – " + pretty(lv.to, { dow: false }), "two exams on one day, or three in 48 hours, is flagged"), strip], "", "exams.loadcard"));
    var runs = lv.runs;
    var cards = runs.map(function (r) {
      var titles = r.items.map(function (x) { return x.title; }).join(", ");
      var dl = r.items.filter(function (x) { return x.tier === "deadline"; })[0];
      return card([chead(r.kind === "day" ? pretty(r.from) + " · two on one day" : pretty(r.from, { dow: false }) + "–" + pretty(r.to, { dow: false }) + " · three in 48 hours", ""),
        el("span", { class: "k-ex-warn", text: "▲ " + titles }),
        el("p", { class: "k-ex-body", text: dl ? "One of these is a hand-in. If it can go in a day earlier, the exam has the day to itself." : r.kind === "day" ? "Two papers on one day: keep the evening before for the cram deck of the first, and eat between them." : "The planner gives these papers more of the weeks before. Keep the evenings between them for the cram deck, not new papers." }),
        el("div", { class: "k-ex-grow" }),
        el("div", { class: "k-ex-actions" }, [dl ? btn("Move the hand-in", "sm", function () { editor(E().get(dl.id), {}, function () { KOS.rerender(); }); }) : btn("See the planner", "sm", function () { KOS.show("exams", "plan"); }),
          btn("Open " + r.items[0].title, "quiet sm", function () { KOS.show("exams", r.items[0].id); })])], "k-ex-flexcard", "exams.run");
    });
    var rest = lv.cells.filter(function (c) { return c.rest; });
    if (rest.length || runs.length) {
      var big = runs.filter(function (r) { return r.kind === "48h"; })[0];
      cards.push(card([chead("Recovery days", "after a run"),
        el("p", { class: "k-ex-body", text: rest.length ? rest.map(function (c) { return pretty(c.date); }).join(" and ") + " follow three papers in 48 hours. Keep them to reviews, about 30 minutes each." : "No run of three in 48 hours, so no recovery days are needed." }),
        el("div", { class: "k-ex-grow" }),
        big ? kv("Papers in the run", String(big.items.length)) : null,
        kv("Exams and deadlines", String(lv.count)), kv("Days from first to last", String(lv.days))].filter(Boolean), "k-ex-flexcard", "exams.recovery"));
    }
    if (!runs.length) cards.unshift(card([el("p", { class: "k-ex-body", text: "No day has two exams and no 48 hours has three." })], "", "exams.noclash"));
    wrap.appendChild(el("div", { class: "k-ex-runs", "data-count": String(cards.length) }, cards));
  }
  function kv(k, v) { return el("div", { class: "k-ex-kv" }, [el("span", { class: "k-ex-ell", text: k }), el("b", { class: "k-mono", text: v })]); }

  /* ---------------- the importer (29y) ---------------- */
  function importDialog() {
    var X = E(), overlay = el("div", { class: "k-dialog-overlay" }), rows = [];
    function close() { overlay.remove(); }
    overlay.close = close;
    var area = el("textarea", { class: "k-input k-ex-paste", rows: 5, "data-ui": "exams.import-text", "aria-label": "The board's timetable", placeholder: "9MA0 01 Pure Mathematics 1   Wed 03 Jun 2027 am 2h" });
    var file = el("input", { type: "file", accept: ".ics,text/calendar", class: "k-ex-file", "aria-label": "An .ics file", onchange: function () {
      var f = file.files && file.files[0];
      if (!f) return;
      var r = new FileReader(); r.onload = function () { area.value = String(r.result || ""); run(); }; r.readAsText(f);
    } });
    var host = el("div", { class: "k-ex-improws", "data-ui": "exams.import-rows" });
    var go = btn("Import", "primary", apply, { "data-ui": "exams.import-go", disabled: "" });
    function run() {
      rows = X.importMatch(KOS.examStats.parseTimetable(area.value));
      host.innerHTML = "";
      if (!area.value.trim()) { go.disabled = true; return; }
      if (!rows.length) { host.appendChild(el("p", { class: "k-ex-small k-ex-muted", "data-ui": "exams.import-none", text: "No papers found in that text. Paste the board's timetable lines or drop an .ics." })); go.disabled = true; return; }
      var moves = rows.filter(function (r) { return r.status === "moves"; }).length;
      host.appendChild(el("div", { class: "k-ex-inline" }, [el("b", { text: "Found " + plural(rows.length, "paper") }), muted("pick yours · dates stay provisional until the board confirms")]));
      rows.forEach(function (r) {
        var box = el("input", { type: "checkbox", class: "k-box", "aria-label": r.title, onchange: function () { r.pick = box.checked; label(); } });
        box.checked = r.pick; box.disabled = r.status === "same";
        host.appendChild(el("label", { class: "k-ex-improw", "data-ui": "exams.import-row", "data-status": r.status }, [box,
          el("span", { class: "k-mono k-ex-small", text: pretty(r.parsed.date) }),
          el("span", { class: "k-ex-grow" }, [el("span", { class: "k-ex-strong k-ex-ell", text: r.title }), muted([r.parsed.session, r.parsed.mins ? mins(r.parsed.mins) : null, r.why].filter(Boolean).join(" · "))]),
          r.status === "same" ? el("span", { class: "k-ex-ok", text: "✓ same" }) : r.status === "moves" ? el("span", { class: "k-chip", "data-tone": "amber", text: "Moves " + pretty(r.from, { dow: false }) + " → " + pretty(r.parsed.date, { dow: false }) })
            : r.status === "new" ? el("span", { class: "k-chip", text: "New" }) : muted("not yours")]));
      });
      if (moves) host.appendChild(el("div", { class: "k-ex-note" }, [el("span", { "aria-hidden": "true", text: "ⓘ" }), el("span", { text: plural(moves, "date") + " move. Scope, goals and planner rows follow the assessment, not the date." })]));
      label();
    }
    function label() {
      var add = rows.filter(function (r) { return r.pick && r.status === "new"; }).length, upd = rows.filter(function (r) { return r.pick && r.status === "moves"; }).length;
      go.textContent = add || upd ? "Import " + add + (upd ? " · update " + upd : "") : "Nothing to import";
      go.disabled = !(add || upd);
    }
    function apply() {
      var res = X.importApply(rows), left = rows.filter(function (r) { return !r.pick && r.status !== "same"; }).length;
      var msg = "Imported " + plural(res.added, "paper") + ", updated " + plural(res.moved, "date") + (left ? ", " + left + " left out" : "") + ".";
      close(); KOS.ui.toast(msg); announce(msg); KOS.rerender();
    }
    area.addEventListener("input", run);
    overlay.appendChild(el("div", { class: "k-dialog k-ex-dialog", "data-ui": "ui.dialog exams.import-dialog" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "試" }),
        el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Import timetable" })]),
      el("div", { class: "k-dialog-body k-ex-dbody" }, [
        el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Paste the board's timetable, or choose an .ics" }), area]), file, host]),
      el("div", { class: "k-dialog-foot" }, [el("span", { class: "k-spacer" }), btn("Cancel", "", close), go])
    ]));
    KOS.ui.openDialog(overlay);
    area.focus();
  }

  /* ---------------- one assessment (29e, 29f) ---------------- */
  function page(main, id, tab) {
    var a = E().get(id);
    if (!a) {
      main.appendChild(KOS.ui.pageHeader({ kicker: "Exams & Papers", title: "Not found" }));
      main.appendChild(KOS.ui.emptyState({ mark: "試", title: "That assessment is gone", body: "It may have been deleted on another device.",
        action: btn("Back to the timetable", "", function () { KOS.show("exams", "timetable"); }) }));
      return;
    }
    if (tab === "scope") return scopeBuilder(main, a);
    if (tab === "room" && KOS.examRoom) return KOS.examRoom(main, a);
    if (tab === "readiness" && KOS.examViews) return KOS.examViews.readiness(main, a.id);
    overview(main, a);
  }
  function backLink(text, go) { return el("button", { type: "button", class: "k-ex-back", "data-ui": "exams.back", onclick: go }, [el("span", { "aria-hidden": "true", text: "‹ " }), text]); }
  function examHero(a, rd, o) {
    o = o || {};
    var days = E().daysTo(a);
    var pr = a.preset ? E().preset(a.preset) : null;
    var eyebrowTxt = [a.subject ? SUBJ[a.subject] : null, pr ? pr.board + " " + pr.qual + " · " + pr.paper : [a.board, a.qual, a.paper].filter(Boolean).join(" ") || null].filter(Boolean).join(" · ");
    var meta = [a.date ? pretty(a.date, { year: true }) : "No date yet", a.time, a.durationMins ? mins(a.durationMins) + (a.extraTime ? " + " + a.extraTime + "%" : "") : null,
      a.marks ? a.marks + " marks" : null, a.calculator === "allowed" ? "calculator allowed" : a.calculator === "none" ? "no calculator" : null, a.location || null].filter(Boolean).join(" · ");
    return el("section", { class: "k-ex-ahero", "data-ui": "exams.ahero", "data-size": o.mini ? "mini" : null, style: "--s: " + hueOf(a) }, [
      el("span", { class: "k-ex-hero-mark", "aria-hidden": "true", lang: "ja", text: "試" }),
      el("div", { class: "k-ex-ahero-mid" }, [
        el("div", { class: "k-ex-inline" }, [tierChip(a.tier), a.provisional ? prov() : null, eyebrowTxt ? muted(eyebrowTxt) : null].filter(Boolean)),
        el("h1", { class: "k-ex-ahero-title", text: o.title || a.title }),
        el("div", { class: "k-ex-ahero-meta", text: o.meta || meta }),
        el("div", { class: "k-ex-inline k-ex-ahero-band" }, [rd && rd.band ? bandEl(rd.band, { row: true, big: !o.mini }) : null, startByEl(a, { why: !o.mini })].filter(Boolean)),
        o.line ? el("p", { class: "k-ex-ahero-line", text: o.line }) : null
      ].filter(Boolean)),
      el("div", { class: "k-ex-ahero-right" }, [
        days != null && days >= 0 ? el("div", { class: "k-ex-ahero-days" }, [el("b", { class: "k-mono", text: days === 0 ? "Today" : String(days) }), days ? muted(days === 1 ? "day left" : "days left") : null].filter(Boolean))
          : a.result ? el("div", { class: "k-ex-ahero-days" }, [el("b", { class: "k-mono", text: resultText(a.result) }), muted("result")]) : null,
        o.actions ? el("div", { class: "k-ex-actions" }, o.actions) : null
      ].filter(Boolean))
    ]);
  }
  function overview(main, a) {
    var X = E(), rd = X.readiness(a), t = a.tier;
    if (a.subject) main.style.setProperty("--accent", HUE[a.subject]);
    main.appendChild(backLink("Timetable", function () { KOS.show("exams", "timetable"); }));
    var room = roomNow();
    var acts = [btn("Edit", "quiet", function () { editor(a, {}, function () { KOS.rerender(); }); }, { "data-ui": "exams.edit" }),
      t !== "deadline" ? btn("Scope", "", function () { KOS.show("exams", { id: a.id, tab: "scope" }); }, { "data-ui": "exams.scope-btn" }) : null,
      room && room.id === a.id ? btn("Exam Room", "primary", function () { KOS.show("exams", { id: a.id, tab: "room" }); }, { "data-ui": "exams.room-btn" })
        : t === "real_exam" || t === "mock" || t === "topic_test" ? btn("Log a paper", "primary", function () { KOS.trackerLog({ assessmentId: a.id }, function () { KOS.rerender(); }); }, { "data-ui": "exams.log" }) : null
    ].filter(Boolean);
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.page", "data-tier": t, style: "--s: " + hueOf(a) });
    main.appendChild(wrap);
    wrap.appendChild(examHero(a, rd, { actions: acts }));
    if (t === "deadline") return deadlinePage(wrap, a, rd);
    if (t === "retrieval_test") return quizPage(wrap, a, rd);
    var sigs = signals(a, rd, { full: true, cols1: t === "topic_test", practiceFoot: t !== "topic_test" ? practiceFoot(a, rd) : null });
    wrap.appendChild(el("div", { class: "k-ex-sigs", "data-n": String(sigs.length), "data-ui": "exams.signals" }, sigs));
    var ex = excludedEl(a, a.scope.pacing ? "Scope: " + E().scopeSummary(a) : "Readiness, the planner and the cram deck ignore it.");
    if (rd.band) wrap.appendChild(el("div", { class: "k-ex-bandline", "data-ui": "exams.bandline" }, [bandEl(rd.band, { row: true }),
      el("span", { class: "k-ex-grow", text: bandSentence(a, rd) }), btn("Why these bands", "quiet sm", function () { whyBands(a, rd); }, { "data-ui": "exams.why" })]));
    if (ex) wrap.appendChild(ex);
    if (t === "topic_test") wrap.appendChild(el("p", { class: "k-ex-foot", text: "No timed-practice signal and no grade range at this tier: a topic test is marked by your teacher's own scheme. Log the result and it feeds RAG." }));
    var left = el("div", { class: "k-ex-col" }), right = el("div", { class: "k-ex-side" });
    left.appendChild(nextTenCard(a));
    var wk = weekCard(a);
    if (wk) left.appendChild(wk);
    var lp = latestPaper(a, rd);
    if (lp) left.appendChild(lp);
    else if (t === "topic_test") left.appendChild(packShelf(a));
    left.lastChild.classList.add("k-ex-fill");
    var chk = checklistCard(a, "prep");
    if (chk) right.appendChild(chk);
    right.appendChild(dayCard(a));
    if (a.notes) right.appendChild(card([chead("Notes", ""), el("p", { class: "k-ex-pre", text: a.notes })], "", "exams.notes"));
    right.lastChild.classList.add("k-ex-fill");
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [left, right]));
  }
  function practiceFoot(a, rd) {
    var pr = a.preset ? E().preset(a.preset) : null, ix = window.KOS_EXAMS && KOS_EXAMS.index;
    if (!pr || !pr.index || !ix || !ix.papers[pr.index] || !KOS.examPlan) return null;
    var np = KOS.examPlan.nextPaper(a);
    var sits = ix.papers[pr.index].sittings.filter(function (s) { return s !== "specimen" && s !== "sample"; }).length;
    var done = np ? np.done : sits;
    return el("div", { class: "k-ex-sigfoot" }, [el("div", { class: "k-ex-minihead", text: ix.papers[pr.index].title + " in the index" }),
      el("div", { class: "k-ex-inline" }, [squares(sits, done), muted(done + " of " + sits + " done")]),
      np ? el("div", { class: "k-ex-small" }, ["Next: ", el("b", { text: KOS.examIndex.sittingLabel(np.sitting) + ", timed" }), "."]) : null,
      np ? btn("Log it when done", "sm", function () { KOS.trackerLog({ assessmentId: a.id, index: { paper: np.paper, sitting: np.sitting } }, function () { KOS.rerender(); }); }) : null].filter(Boolean));
  }
  function squares(n, f, cls) {
    return el("span", { class: "k-ex-squares" + (cls ? " " + cls : ""), role: "img", "aria-label": f + " of " + n }, Array.apply(null, { length: Math.min(n, 40) }).map(function (_, i) { return el("i", { "data-on": i < f ? "" : null }); }));
  }
  function bandSentence(a, rd) {
    var b = rd.band;
    if (!b) return "";
    if (b.band === "ready") return "Every signal is at its target.";
    if (b.band === "thin") return "Two or more signals have no evidence yet" + (b.limitName ? "; start with " + b.limitName + "." : ".");
    if (b.band === "risk") return b.limitName.charAt(0).toUpperCase() + b.limitName.slice(1) + " is holding it down: it is behind where a straight line to Ready says it should be by now.";
    return b.limitName ? "On the line to Ready. " + b.limitName.charAt(0).toUpperCase() + b.limitName.slice(1) + " is holding the band at On track." : "Every signal with evidence is on the line to Ready.";
  }
  function whyBands(a, rd) {
    var overlay = el("div", { class: "k-dialog-overlay" });
    function close() { overlay.remove(); }
    overlay.close = close;
    var tp = rd.targetPct, tg = Math.round(100 * rd.target);
    overlay.appendChild(el("div", { class: "k-dialog k-ex-dialog", "data-size": "sm", "data-ui": "ui.dialog exams.why-dialog" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "試" }), el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Why these bands" })]),
      el("div", { class: "k-dialog-body k-ex-dbody" }, [
        el("p", { text: "Four signals, never one number. The band reads them together:" }),
        el("ul", { class: "k-ex-ul" }, [
          el("li", {}, [el("b", { text: "✓ Ready" }), " — coverage at least 95%, no Red, projected recall at least " + tg + "%, and the last timed paper at least " + tp + "%" + (a.target ? " (your target " + a.target + ")" : "") + "."]),
          el("li", {}, [el("b", { text: "● On track" }), " — every signal with evidence is on a straight line from your start-by date to Ready at the start of the 7–14 day window (" + Math.round(100 * rd.f) + "% of that run-up has gone)."]),
          el("li", {}, [el("b", { text: "▲ At risk" }), " — a signal is behind that line; the band names it."]),
          el("li", {}, [el("b", { text: "○ Not enough evidence" }), " — two or more signals are silent."])
        ]),
        el("p", { class: "k-ex-small k-ex-muted", text: "Each signal stays silent below its evidence: coverage needs a scope, RAG 3 rated leaves, recall 20 rated cards, practice 1 timed paper (3 for a grade range)." })
      ]),
      el("div", { class: "k-dialog-foot" }, [el("span", { class: "k-spacer" }), btn("Close", "primary", close)])
    ]));
    KOS.ui.openDialog(overlay);
  }
  /* where the next ten marks come from (29e, §9.4) */
  function nextTenCard(a) {
    var nm = E().nextMarks(a);
    var c = card([chead("Where the next ten marks come from", nm && !nm.thin ? evidenceLine(nm) : "", linkBtn("Analytics →", function () { KOS.show("exams", { tab: "practice", sub: "analytics" }); }))], "", "exams.nextten");
    if (!nm || nm.thin) { c.appendChild(quiet(nm ? nm.why : "Needs a scope.", nm ? (nm.marked ? "" : plural(nm.reviews, "rated review") + " in scope so far") : "")); return c; }
    if (!nm.items.length) { c.appendChild(quiet("Nothing in scope is losing marks right now.", "")); return c; }
    c.appendChild(nextList(nm.items, a));
    c.appendChild(el("p", { class: "k-ex-foot", text: "Likelihood is evidence, not prophecy: anything in the specification can appear." }));
    return c;
  }
  function evidenceLine(nm) {
    return [nm.marked ? plural(nm.marked, "marked paper") : null, nm.reviews ? plural(nm.reviews, "rated card") : null, nm.sittings ? nm.sittings + " past sittings" : null].filter(Boolean).join(", ");
  }
  function nextList(items, a) {
    return el("ol", { class: "k-ex-nextlist", "data-ui": "exams.nextlist" }, items.map(function (x, i) {
      var tagWords = Object.keys(x.tags).sort(function (p, q) { return x.tags[q] - x.tags[p]; }).map(function (k) { return KOS.tracker.tagShort(k).toLowerCase() + " × " + x.tags[k]; }).join(", ");
      var ev = [x.weight != null && x.of ? "About " + Math.max(1, Math.round(x.weight)) + (Math.max(1, Math.round(x.weight)) === 1 ? " mark" : " marks") + " a paper, on " + x.appear + " of the last " + x.of + " papers." : null,
        x.avail ? "You dropped " + x.lost + " of " + x.avail + " here" + (tagWords ? " (" + tagWords + ")" : "") + "." : x.recall != null ? "Projected recall " + pc(x.recall) + "." : null,
        x.due ? "Due by its pattern: absent from the last two sittings." : null].filter(Boolean).join(" ");
      var q = x.questions && x.questions[0];
      var act = x.top === "recall" ? "then a redo item" : x.top === "method" ? "work its variations, then redo the question" : x.top ? "then redo the question" : "";
      return el("li", { class: "k-ex-nextrow" }, [el("span", { class: "k-ex-nextn k-mono", text: String(i + 1) }), el("div", { class: "k-ex-grow" }, [
        el("div", {}, [el("b", { text: x.title }), ": " + (x.from === "attempts" ? "a session on it" + (act ? ", " + act : "") + (q && q.sitting ? " — " + KOS.examIndex.sittingLabel(q.sitting) + " " + q.q : "") + "." : "one session to lift it before the day.")]),
        ev ? el("div", { class: "k-ex-small k-ex-muted", text: ev }) : null].filter(Boolean)),
        btn("Plan it", "sm", function () { KOS.show("exams", "plan"); })]);
    }));
  }
  /* this week's rows for one assessment, from the Planner (29e) */
  function weekCard(a) {
    if (!KOS.examPlan) return null;
    var p = KOS.examPlan.plan(today()), g = (p.groups || []).filter(function (x) { return x.a.id === a.id; })[0];
    if (!g) return null;
    return card([chead("Week of " + pretty(p.wb, { dow: false }), mins(g.mins) + " of your " + mins(p.total) + " goes to this", linkBtn("Planner →", function () { KOS.show("exams", "plan"); }))]
      .concat(g.rows.map(function (r) {
        return el("div", { class: "k-ex-wkrow", style: "--s: " + hueOf(a) }, [el("span", { class: "k-ex-vbar", "aria-hidden": "true" }),
          el("div", { class: "k-ex-grow" }, [el("div", { class: "k-ex-strong k-ex-ell", text: r.title }), muted(r.why)]), el("span", { class: "k-mono k-ex-small", text: mins(r.mins) })]);
      })).concat(g.paper ? [el("div", { class: "k-ex-wkrow", style: "--s: " + hueOf(a) }, [el("span", { class: "k-ex-vbar", "aria-hidden": "true" }),
        el("div", { class: "k-ex-grow" }, [el("div", { class: "k-ex-strong k-ex-ell", text: "紙 " + g.paper.title }), muted("The week's practice paper")]), el("span", { class: "k-mono k-ex-small", text: mins(g.paper.mins) })])] : []), "", "exams.week");
  }
  function latestPaper(a, rd) {
    var atts = rd.attempts.filter(function (e) { return e.marks != null && e.max; });
    var e = atts[atts.length - 1];
    if (!e) return null;
    var pm = KOS.examStats.postMortem(e, E().nodeOf, null);
    return card([chead("Latest paper", [e.paper || e.topic, e.timed && e.mins ? "timed " + e.mins + " min" : null, pretty(e.date)].filter(Boolean).join(" · "),
      e.questions && e.questions.length ? linkBtn("Post-mortem →", function () { KOS.show("exams", { attempt: e.uid }); }) : linkBtn("Marks by question →", function () { KOS.show("exams", { attempt: e.uid, page: "marks" }); })),
      el("div", { class: "k-ex-latest" }, [
        el("div", {}, [el("div", { class: "k-ex-fig k-ex-fig--40", text: String(e.marks) }), muted("of " + e.max + (e.predicted != null ? " · you predicted " + e.predicted : ""))]),
        pm && pm.units.length ? el("div", { class: "k-ex-grow" }, [muted("Marks lost, top three topics"), lossBars(pm.units.slice(0, 3), pm.units[0].marks)])
          : el("p", { class: "k-ex-small k-ex-muted", text: "Add marks by question to see where they went." })
      ])], "", "exams.latest");
  }
  function lossBars(rows, max) {
    return el("div", { class: "k-ex-loss" }, rows.map(function (r) {
      var b = el("div", { class: "k-ex-lossbar", "data-k": r.label === "untagged" ? "untagged" : r.label === "time" || r.label === "◷ Ran out of time" ? "time" : null }, [el("i")]);
      b.style.setProperty("--p", (100 * r.marks / (max || 1)).toFixed(1) + "%");
      return el("div", { class: "k-ex-lossrow" }, [el("span", { class: "k-ex-ell", text: r.label }), b, el("span", { class: "k-mono", text: String(Math.round(r.marks)) })]);
    }));
  }
  KOS.examLossBars = lossBars;
  function packShelf(a) {
    var ix = window.KOS_EXAMS && KOS_EXAMS.index, ls = {};
    E().leaves(a).forEach(function (k) { ls[k] = true; });
    var packs = ix ? ix.packs.filter(function (p) { return p.refs.some(function (r) { return ls[r]; }); }) : [];
    var done = {};
    (KOS.tracker ? KOS.tracker.all() : []).forEach(function (e) { if (e.source && (e.source.kind === "topic-pack" || e.source.kind === "pmt-pack")) done[e.source.ref] = true; });
    var c = card([chead("Topic packs for this test", packs.length ? packs.filter(function (p) { return done[p.id]; }).length + " of " + packs.length + " done" : "")], "", "exams.packs");
    if (!packs.length) { c.appendChild(quiet("No topic pack in your index covers this scope.", "")); return c; }
    packs.slice(0, 6).forEach(function (p) {
      c.appendChild(el("div", { class: "k-ex-packrow" }, [el("div", { class: "k-ex-grow" }, [el("div", { class: "k-ex-strong k-ex-ell", text: p.sub + " · " + p.level }), muted(p.source === "pmt" ? "PMT topic pack · reference only" : "KurenaiOS pack")]),
        done[p.id] ? el("span", { class: "k-ex-ok", text: "✓ done" }) : btn("Log it", "sm", function () { KOS.trackerLog({ assessmentId: a.id, pack: p.id }, function () { KOS.rerender(); }); })]));
    });
    return c;
  }
  /* the checklist (29e): auto items cannot be ticked by hand */
  function checklistCard(a, group) {
    var items = E().checklist(a).filter(function (c) { return c.group === group; });
    if (!items.length) return null;
    var done = items.filter(function (c) { return c.done; }).length;
    var c = card([chead("Checklist", done + " of " + items.length)], "", "exams.checklist");
    items.forEach(function (it) { c.appendChild(checkRow(a, it, items)); });
    c.appendChild(addCheckRow(a, group));
    return c;
  }
  function checkRow(a, it, items) {
    var box = el("input", { type: "checkbox", class: "k-box", "data-ui": "exams.check", "aria-label": it.text, disabled: it.auto ? "" : null, title: it.auto ? it.why : null,
      onchange: function () {
        E().tickCheck(a.id, it.id, box.checked);
        var list = E().checklist(E().get(a.id)).filter(function (c) { return c.group === it.group; });
        announce(it.text + (box.checked ? ", done. " : ", not done. ") + list.filter(function (c) { return c.done; }).length + " of " + list.length + ".");
        KOS.rerender();
      } });
    box.checked = it.done;
    return el("label", { class: "k-ex-checkrow", "data-state": it.done ? "done" : null }, [box, el("span", { class: "k-ex-grow", text: it.text }), it.auto ? muted("auto") : null].filter(Boolean));
  }
  function addCheckRow(a, group) {
    var inp = el("input", { type: "text", class: "k-input k-ex-addcheck", "aria-label": "Add an item", placeholder: "＋ Add an item" });
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter" && inp.value.trim()) { E().addCheck(a.id, inp.value.trim(), group); KOS.rerender(); } });
    return inp;
  }
  function dayCard(a) {
    var items = E().checklist(a).filter(function (c) { return c.group === "day"; });
    var c = card([chead("On the day", "", linkBtn("Edit", function () { editor(a, {}, function () { KOS.rerender(); }); }))], "", "exams.day");
    var dl = el("dl", { class: "k-ex-kvs" });
    function row(k, v) { dl.appendChild(el("dt", { text: k })); dl.appendChild(el("dd", {}, [v])); }
    row("When", document.createTextNode(a.date ? pretty(a.date, { year: true }) + (a.time ? " · " + a.time : a.provisional ? " · time not set" : "") : "No date yet"));
    row("Room", a.location ? document.createTextNode(a.location + (a.provisional ? " · provisional" : "")) : muted("Add when you know it"));
    row("Seat", a.seat ? document.createTextNode(a.seat) : muted("Add when you know it"));
    if (a.durationMins) row("Length", document.createTextNode(mins(a.durationMins) + (a.extraTime ? " + " + a.extraTime + "% = " + mins(Math.round(a.durationMins * (1 + a.extraTime / 100))) : "")));
    if (a.calculator) row("Calculator", document.createTextNode(a.calculator === "allowed" ? "Allowed" : "Not allowed"));
    c.appendChild(dl);
    if (items.length) {
      c.appendChild(el("div", { class: "k-ex-minihead", text: "Before you go in · " + items.filter(function (x) { return x.done; }).length + " of " + items.length }));
      items.forEach(function (it) { c.appendChild(checkRow(a, it, items)); });
    }
    return c;
  }
  /* RETRIEVAL QUIZ: the whole page is one card (29f) */
  function quizPage(wrap, a, rd) {
    var rc = rd.signals.recall;
    var c = card([el("div", { class: "k-ex-inline" }, [tierChip(a.tier, true), muted([a.subject ? SHORT[a.subject] : null, plural(E().leaves(a).length, "leaf", "leaves")].filter(Boolean).join(" · "))])], "k-ex-quiz", "exams.quiz");
    if (rc.thin) c.appendChild(quiet("Recall appears after 20 rated cards on these " + plural(E().leaves(a).length, "leaf", "leaves") + ".", rc.rated + " so far"));
    else c.appendChild(el("div", { class: "k-ex-quizrow" }, [ringEl(rc.value, 96, hueOf(a), [el("span", { class: "k-ex-ringfig k-ex-ringfig--sm", text: pc(rc.value) }), muted("recall today")], rd.target),
      el("div", { class: "k-ex-grow" }, [weakList(rc.weakest.slice(0, 3))])]));
    c.appendChild(el("div", { class: "k-ex-grow" }));
    var due = KOS.examPlan ? KOS.examPlan.dueInScope(a, KOS.srs.addDays(today(), 1)) : 0;
    c.appendChild(el("div", { class: "k-ex-cardfoot" }, [btn("Cram " + plural(KOS.examPlan ? KOS.examPlan.cardsInScope(a) : 0, "card"), "primary sm", function () { cramScope(a); }),
      due ? muted(plural(due, "card") + " due by tomorrow") : null].filter(Boolean)));
    c.classList.add("k-ex-fill");
    var side = el("div", { class: "k-ex-side" }, [dayCard(a)]);
    side.lastChild.classList.add("k-ex-fill");
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [el("div", { class: "k-ex-col" }, [c, scopeCardMini(a)]), side]));
  }
  /* what a quiz covers, by unit (a quiz's page has no signals to read) */
  function scopeCardMini(a) {
    var ls = E().leaves(a), by = {}, order = [];
    ls.forEach(function (k) { var n = E().nodeOf(k); if (!n) return; if (!by[n.unit]) { by[n.unit] = { title: n.unitTitle, n: 0 }; order.push(n.unit); } by[n.unit].n++; });
    return card([chead("What it covers", plural(ls.length, "leaf", "leaves"), linkBtn("Scope →", function () { KOS.show("exams", { id: a.id, tab: "scope" }); }))].concat(order.map(function (u) {
      return el("div", { class: "k-ex-kv" }, [el("span", { class: "k-ex-ell", text: u + " " + by[u].title }), el("b", { class: "k-mono", text: String(by[u].n) })]);
    })), "", "exams.quiz-scope");
  }
  /* DEADLINE: milestones and a start-by; no readiness model (29f) */
  function deadlinePage(wrap, a, rd) {
    var t = today(), ms = a.milestones.slice().sort(function (x, y) { return (x.date || "9") < (y.date || "9") ? -1 : 1; });
    var c = card([chead("Milestones", ms.length ? ms.filter(function (m) { return m.done; }).length + " of " + ms.length : "")], "", "exams.milestones");
    if (!ms.length) c.appendChild(quiet("Add milestones to get a start-by date.", "Edit the deadline to add the steps before the hand-in."));
    ms.forEach(function (m) {
      var late = !m.done && m.date && m.date < t;
      var box = el("input", { type: "checkbox", class: "k-box", "data-ui": "exams.ms", "aria-label": "Done: " + m.text, onchange: function () { msDone(a, m.id, box.checked); } });
      box.checked = m.done;
      c.appendChild(el("label", { class: "k-ex-msrow", "data-state": m.done ? "done" : late ? "late" : null }, [box, el("span", { class: "k-ex-grow", text: m.text }),
        late ? el("span", { class: "k-chip", "data-tone": "danger", text: "▲ Overdue · " + plural(KOS.srs.daysBetween(m.date, t), "day") }) : m.date ? muted(pretty(m.date)) : null].filter(Boolean)));
    });
    var over = ms.filter(function (m) { return !m.done && m.date && m.date < t; })[0];
    if (over) c.appendChild(el("div", { class: "k-ex-actions" }, [btn("Mark " + over.text.toLowerCase() + " done", "sm", function () { msDone(a, over.id, true); }), btn("Move its date", "quiet sm", function () { editor(a, {}, function () { KOS.rerender(); }); })]));
    var side = el("div", { class: "k-ex-side" }, [dayCard(a)]);
    if (a.notes) side.appendChild(card([chead("Notes", ""), el("p", { class: "k-ex-pre", text: a.notes })], "", "exams.notes"));
    side.lastChild.classList.add("k-ex-fill");
    c.classList.add("k-ex-fill");
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [el("div", { class: "k-ex-col" }, [c, el("p", { class: "k-ex-foot", text: "No readiness signals at this tier. At risk comes from an overdue milestone alone and clears when it is marked done or moved." })]), side]));
  }

  /* ---------------- the editor (29c) ---------------- */
  function editor(existing, seed, onSaved) {
    var X = E();
    var d = existing ? JSON.parse(JSON.stringify(existing)) : X.normalise(Object.assign({ tier: "real_exam" }, seed || {}));
    var overlay = el("div", { class: "k-dialog-overlay" });
    function close() { overlay.remove(); }
    overlay.close = close;
    function field(label, control, cls, hint) {
      return el("label", { class: "k-field" + (cls ? " " + cls : ""), "data-ui": "ui.field" }, [el("span", { class: "k-field-label", text: label }), control, hint ? el("span", { class: "k-ex-hint", text: hint }) : null].filter(Boolean));
    }
    function input(type, attrs) { return el("input", Object.assign({ type: type, class: "k-input" }, attrs || {})); }
    function select(opts, value, attrs) {
      var s = el("select", Object.assign({ class: "k-input" }, attrs || {}), opts.map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
      s.value = value == null ? "" : value;
      return s;
    }
    var tierV = d.tier;
    /* the tier first: it decides what the rest of the form asks */
    var tierGroup = el("div", { class: "k-ex-tiers", role: "radiogroup", "aria-label": "Tier", "data-ui": "exams.tiers" });
    var LINES = { real_exam: "Board exam: the full readiness model and the planner", mock: "School mock: the full set, with your own scope", topic_test: "One topic: three signals and the cram deck",
      retrieval_test: "Quick check: recall on the day", deadline: "Coursework or NEA: milestones and a start-by" };
    Object.keys(TIER).forEach(function (k) {
      var b = el("button", { type: "button", class: "k-ex-tiercard", role: "radio", "aria-checked": String(k === tierV), "data-tier": k, tabindex: k === tierV ? "0" : "-1",
        onclick: function () { setTier(k); }, onkeydown: function (e) {
          var keys = Object.keys(TIER), i = keys.indexOf(tierV);
          if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); setTier(keys[(i + 1) % keys.length]); tierGroup.querySelector("[aria-checked='true']").focus(); }
          if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); setTier(keys[(i + keys.length - 1) % keys.length]); tierGroup.querySelector("[aria-checked='true']").focus(); }
        } }, [tierChip(k, true), el("span", { class: "k-ex-small", text: LINES[k] })]);
      tierGroup.appendChild(b);
    });
    function setTier(k) {
      tierV = k;
      tierGroup.querySelectorAll("[role='radio']").forEach(function (b) { var on = b.getAttribute("data-tier") === k; b.setAttribute("aria-checked", String(on)); b.setAttribute("tabindex", on ? "0" : "-1"); });
      sync();
    }
    var title = input("text", { value: d.title, placeholder: "e.g. Maths Pure mock", "data-ui": "exams.title" });
    /* the preset: a select grouped by board (29c) */
    var presetSel = el("select", { class: "k-input", "aria-label": "Paper preset", "data-ui": "exams.preset" }, [el("option", { value: "", text: "No preset · set it by hand" })]);
    var groups = {};
    X.presets().forEach(function (p) {
      var g = p.board + " " + p.qual + " · " + (SUBJ[p.subject] || p.subject) + (p.level === "AS" ? " (AS)" : "");
      if (!groups[g]) { groups[g] = el("optgroup", { label: g }); presetSel.appendChild(groups[g]); }
      groups[g].appendChild(el("option", { value: p.id, text: p.paper + " · " + p.title.split("·").pop().trim() + (p.mins ? " · " + mins(p.mins) : "") }));
    });
    presetSel.value = d.preset || "";
    var presetHint = el("span", { class: "k-ex-hint" });
    var subjSel = select([["", "Several or none"], ["compsci", SUBJ.compsci], ["maths", SUBJ.maths], ["it", SUBJ.it]], d.subject || "", { "aria-label": "Subject" });
    var date = input("date", { value: d.date || "", "data-ui": "exams.date" });
    var time = input("time", { value: d.time || "" });
    var dur = input("number", { min: 1, max: 600, value: d.durationMins || "", placeholder: "minutes" });
    var loc = input("text", { value: d.location, placeholder: "e.g. Sports hall" });
    var seat = input("text", { value: d.seat, placeholder: "Seat number" });
    var extra = select([["0", "None"], ["10", "10%"], ["25", "25%"], ["50", "50%"]], String(d.extraTime || 0));
    var marks = input("number", { min: 0, value: d.marks == null ? "" : d.marks });
    var calc = select([["", "—"], ["allowed", "Allowed"], ["none", "Not allowed"]], d.calculator || "");
    var target = select([["", "No target"], ["A*", "A*"], ["A", "A"], ["B", "B"], ["C", "C"], ["D", "D"], ["E", "E"]], d.target || "", { "aria-label": "Target grade" });
    var provBox = el("input", { type: "checkbox", class: "k-box" }); provBox.checked = !!d.provisional;
    var startBy = input("date", { value: d.startBy || "" });
    var notes = el("textarea", { class: "k-input", rows: 2, placeholder: "Equipment, travel, anything to remember" });
    notes.value = d.notes || "";
    var cap = el("input", { type: "checkbox", class: "k-switch", "data-ui": "exams.cap", "aria-label": "Fit reviews to this date" });
    cap.checked = !!d.cap;
    var capRow = el("label", { class: "k-ex-swrow", "data-ui": "exams.caprow" }, [cap, el("span", { class: "k-ex-grow" }, [el("b", { text: "Fit reviews to this date" }),
      el("span", { class: "k-ex-hint", text: "Mock only. Card intervals in this scope are capped so every card comes round before the mock. Real exams always do this; on a mock it adds reviews now, so it is your call." })])]);
    function applyPreset() {
      var p = X.preset(presetSel.value);
      presetHint.textContent = p ? "Fills the subject, duration, marks, calculator and the scope (" + p.include.map(function (k) { return k.split(":")[1]; }).join(", ") + "). You can narrow the scope next." : "";
      if (!p) return;
      var old = d.preset && X.preset(d.preset);
      if (!title.value.trim() || (old && title.value === old.title)) title.value = p.title;
      subjSel.value = p.subject;
      if (p.mins) dur.value = p.mins;
      if (p.marks) marks.value = p.marks;
      if (p.calculator) calc.value = p.calculator;
      announce(p.title + " preset: " + mins(p.mins) + ", " + p.marks + " marks, " + (p.calculator === "allowed" ? "calculator allowed" : "no calculator") + ".");
    }
    presetSel.addEventListener("change", function () { applyPreset(); d.preset = presetSel.value || null; });
    applyPreset();
    var msHost = el("div", { class: "k-ex-mslist", "data-ui": "exams.ms-edit" });
    var ms = d.milestones.map(function (m) { return Object.assign({}, m); });
    function drawMs() {
      msHost.innerHTML = "";
      ms.forEach(function (m, i) {
        var tx = input("text", { value: m.text, "aria-label": "Milestone " + (i + 1), oninput: function () { m.text = tx.value; } });
        var dt = input("date", { value: m.date || "", "aria-label": "Milestone date", oninput: function () { m.date = dt.value || null; } });
        msHost.appendChild(el("div", { class: "k-ex-msedit" }, [tx, dt, el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Remove milestone", text: "✕", onclick: function () { ms.splice(i, 1); drawMs(); } })]));
      });
      msHost.appendChild(btn("＋ Milestone", "sm", function () { ms.push({ text: "", date: null, done: false }); drawMs(); }));
    }
    drawMs();
    var errBox = el("div", { class: "k-field-error", role: "alert", hidden: "" });
    var fPreset = el("div", { class: "k-field k-ex-span" }, [el("span", { class: "k-field-label", text: "Paper preset" }), presetSel, presetHint]);
    var fLog = el("div", { class: "k-ex-form3 k-ex-span" }, [field("Room", loc), field("Seat", seat), field("Extra time", extra)]);
    var fCalc = el("div", { class: "k-ex-form3 k-ex-span" }, [field("Calculator", calc), field("Marks", marks), field("Target grade", target)]);
    var fMs = el("div", { class: "k-field k-ex-span" }, [el("span", { class: "k-field-label", text: "Milestones" }), msHost]);
    function sync() {
      var dl = tierV === "deadline";
      fPreset.hidden = dl; fLog.hidden = dl; fCalc.hidden = dl; fMs.hidden = !dl;
      capRow.hidden = tierV !== "mock";
      nextBtn.hidden = dl;
    }
    function collect() {
      return {
        title: title.value.trim(), tier: tierV, subject: subjSel.value || null, preset: tierV === "deadline" ? null : presetSel.value || null,
        date: date.value || null, time: time.value || null, durationMins: dur.value === "" ? null : Number(dur.value),
        location: loc.value, seat: seat.value, marks: marks.value === "" ? null : Number(marks.value),
        calculator: calc.value, extraTime: Number(extra.value) || 0, provisional: provBox.checked, target: target.value,
        cap: cap.checked, startBy: startBy.value || null, notes: notes.value,
        milestones: ms.filter(function (m) { return String(m.text || "").trim(); })
      };
    }
    function save(then) {
      if (!title.value.trim()) { errBox.hidden = false; errBox.textContent = "Give it a name."; title.focus(); announce("Give it a name."); return; }
      if (!date.value && tierV !== "deadline") {
        errBox.hidden = false; errBox.textContent = "Add a date."; date.setAttribute("aria-invalid", "true"); date.focus(); announce("Add a date."); return;
      }
      var patch = collect();
      if (!existing && X.preset(patch.preset)) patch.scope = undefined;
      var a = existing ? X.update(existing.id, patch) : X.add(patch);
      var days = X.daysTo(a);
      var msg = existing ? "Saved." : a.title + " added" + (days != null && days >= 0 ? ", " + plural(days, "day") + " away." : ".");
      KOS.ui.toast(msg); announce(msg);
      close();
      if (then) then(a); else if (onSaved) onSaved(a);
    }
    var nextBtn = btn("Next: scope ›", "quiet", function () { save(function (a) { KOS.show("exams", { id: a.id, tab: "scope" }); }); }, { "data-ui": "exams.next-scope" });
    var body = el("div", { class: "k-dialog-body k-ex-dbody" }, [
      errBox,
      el("div", {}, [el("div", { class: "k-ex-minihead", text: "Tier" }), tierGroup]),
      el("div", { class: "k-ex-form" }, [
        fPreset,
        field("Title", title, "k-ex-span"),
        el("div", { class: "k-ex-form3 k-ex-span" }, [field("Date", date), field("Start", time), field("Duration (min)", dur)]),
        fLog, fCalc,
        el("div", { class: "k-ex-form3 k-ex-span" }, [field("Subject", subjSel), field("Start by (blank = suggested)", startBy),
          el("label", { class: "k-check k-ex-checkfield" }, [provBox, el("span", { text: "The date is provisional" })])]),
        el("div", { class: "k-ex-span" }, [capRow]),
        fMs,
        field("Notes", notes, "k-ex-span")
      ])
    ]);
    overlay.appendChild(el("div", { class: "k-dialog k-ex-dialog", "data-ui": "ui.dialog exams.editor" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "試" }),
        el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: existing ? "Edit assessment" : "New assessment" }),
        existing ? el("span", { class: "k-ex-muted k-ex-small", text: existing.title }) : null].filter(Boolean)),
      body,
      el("div", { class: "k-dialog-foot" }, [
        existing ? btn("Delete assessment", "danger", function () {
          KOS.ui.confirm({ title: "Delete this assessment?", body: "Its practice papers stay in the record; goals linked to it are unlinked, not deleted.", danger: true, confirm: "Delete" }, function () {
            X.remove(existing.id); close(); KOS.show("exams", "timetable");
          });
        }) : null,
        el("span", { class: "k-spacer" }),
        btn("Cancel", "", close),
        existing ? null : nextBtn,
        btn(existing ? "Save changes" : "Save", "primary", function () { save(); }, { "data-ui": "exams.save" })
      ].filter(Boolean))
    ]));
    KOS.ui.openDialog(overlay);
    sync();
    (existing ? title : tierGroup.querySelector("[aria-checked='true']")).focus();
    return overlay;
  }

  /* ---------------- the Scope Builder (29d) ---------------- */
  function scopeBuilder(main, a) {
    var X = E();
    var draft = JSON.parse(JSON.stringify(a.scope));
    var sid = a.subject;
    main.appendChild(backLink(a.title, function () { KOS.show("exams", a.id); }));
    var saveBtn = btn("Save scope", "primary", save, { "data-ui": "exams.scope-save" });
    main.appendChild(KOS.ui.pageHeader({ kicker: TIER[a.tier][0] + " " + TIER[a.tier][1] + (a.date ? " · " + pretty(a.date) : ""), title: "Scope", className: "k-ex-head",
      sub: "What this test covers. Readiness, the planner and the cram deck read only this.",
      actions: [btn("Cancel", "", function () { KOS.show("exams", a.id); }), saveBtn] }));
    var errBox = el("div", { class: "k-field-error", role: "alert", hidden: "" });
    main.appendChild(errBox);
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.scope-builder" });
    main.appendChild(wrap);
    var mode = "include";
    function probe(sc) { return X.normalise({ subject: sid, preset: a.preset, date: a.date, tier: a.tier, scope: sc || draft }); }
    /* presets: the subject's papers, the live rule, the whole subject */
    var papers = sid ? KOS.spec.papers(sid) : [];
    var PRE = papers.map(function (p) { return { id: p.key, t: p.ref, s: (p.title || p.ref) + " · " + KOS.spec.resolve([p.key]).length + " leaves", scope: { include: [p.key], exclude: [], pacing: null } }; });
    PRE.push({ id: "pacing", t: "Covered in Pacing so far", s: "a live rule · grows", scope: { include: [], exclude: draft.exclude, pacing: { upTo: null, frozen: null, seen: null } } });
    if (sid) PRE.push({ id: "all", t: "Whole specification", s: KOS.spec.resolve(KOS.spec.units(sid).map(function (u) { return u.key; })).length + " leaves", scope: { include: KOS.spec.units(sid).map(function (u) { return u.key; }), exclude: [], pacing: null } });
    function activePreset() {
      if (draft.pacing && !draft.include.length) return "pacing";
      return (PRE.filter(function (p) { return p.id !== "pacing" && p.scope.include.length === draft.include.length && p.scope.include.every(function (k) { return draft.include.indexOf(k) !== -1; }); })[0] || {}).id || null;
    }
    var presetRow = el("div", { class: "k-ex-presets", role: "radiogroup", "aria-label": "Start from" });
    function drawPresets() {
      presetRow.innerHTML = "";
      var on = activePreset();
      PRE.forEach(function (p) {
        presetRow.appendChild(el("button", { type: "button", class: "k-ex-preset", role: "radio", "aria-checked": String(on === p.id), "data-ui": "exams.scope-preset",
          onclick: function () {
            draft.include = p.scope.include.slice(); draft.pacing = p.scope.pacing ? Object.assign({}, p.scope.pacing) : null;
            if (p.id !== "pacing") draft.exclude = draft.exclude.slice();
            inc.set(draft.include); redraw();
          } }, [el("b", { class: "k-ex-ell", text: p.t }), muted(p.s, "k-ex-ell")]));
      });
    }
    var ruleHost = el("div");
    function drawRule() {
      ruleHost.innerHTML = "";
      var p = draft.pacing;
      if (!p) return;
      var cur = X.get(a.id), growth = cur && cur.scope.pacing && !cur.scope.pacing.frozen ? X.ruleGrowth(cur) : null;
      var since = cur && cur.created ? new Date(cur.created).toISOString().slice(0, 10) : null;
      var frozen = p.frozen;
      var c = card([el("div", { class: "k-ex-inline" }, [el("span", { class: "k-ex-ctitle", text: "Covered in Pacing so far" }),
          frozen ? el("span", { class: "k-chip", "data-tone": "muted", text: "❄ Frozen " + (p.frozenAt ? pretty(p.frozenAt) : "") }) : el("span", { class: "k-chip", "data-tone": "teal", text: "● Live rule" }),
          el("span", { class: "k-ex-grow" }),
          frozen ? (a.date && a.date >= today() && !a.result ? btn("Unfreeze", "sm", function () { X.unfreeze(a.id); draft = JSON.parse(JSON.stringify(X.get(a.id).scope)); redraw(); }) : null)
            : btn("❄ Freeze at today", "sm", function () { if (!X.get(a.id).scope.pacing) { X.update(a.id, { scope: draft }); } X.freezeNow(a.id); draft = JSON.parse(JSON.stringify(X.get(a.id).scope)); announce("Scope frozen at " + plural(X.leaves(X.get(a.id)).length, "leaf", "leaves") + "."); redraw(); }, { "data-ui": "exams.freeze" })].filter(Boolean)),
        el("p", { class: "k-ex-body", text: frozen ? "Fixed at the leaves Pacing had reached on " + pretty(p.frozenAt) + ". It no longer grows." : "Includes every leaf your Pacing plan has reached, and keeps growing until the test or until you freeze it. Exclusions below always win. It freezes by itself once the date passes or a result is logged." }),
        growth > 0 ? el("div", { class: "k-ex-growth", "data-ui": "exams.growth" }, [el("b", { text: "＋" + growth }), el("span", { class: "k-ex-grow", text: (growth === 1 ? "leaf" : "leaves") + " since you made this test" + (since ? " (" + pretty(since) + ")" : "") + "." })]) : null
      ].filter(Boolean), "", "exams.rule");
      ruleHost.appendChild(c);
    }
    var inc = KOS.topicPicker({ label: "Include", multi: true, value: draft.include, subject: sid || undefined, onChange: function (refs) { draft.include = refs; redraw(true); } });
    var exc = KOS.topicPicker({ label: "Exclude (always wins)", multi: true, value: draft.exclude, subject: sid || undefined, onChange: function (refs) {
      var before = draft.exclude.length; draft.exclude = refs; redraw(true);
      if (refs.length > before) { var k = refs[refs.length - 1], n = X.nodeOf(k); announce((n ? n.ref + " " + n.title : k) + " excluded. " + plural(X.leaves(probe()).length, "leaf", "leaves") + " in scope."); }
    } });
    var modeTabs = KOS.ui.tabs([{ label: "Include", active: true, onSelect: function () { setMode("include"); } }, { label: "Exclude", active: false, countId: null, onSelect: function () { setMode("exclude"); } }], { variant: "workspace", label: "Scope mode" });
    function setMode(m) {
      mode = m;
      modeTabs.querySelectorAll("[data-ui~='ui.tab']").forEach(function (b, i) { var on = (i === 0) === (m === "include"); KOS.ui.state(b, "active", on); b.setAttribute("aria-selected", String(on)); });
      inc.el.hidden = m !== "include"; exc.el.hidden = m !== "exclude";
      modeNote.textContent = m === "include" ? "Include mode: a pick puts a paper, a unit or a single leaf IN. The topic picker, the same tree and keys." : "Exclude mode: a pick takes a topic OUT, down to a single leaf. An exclusion always wins.";
    }
    var modeNote = el("p", { class: "k-ex-small k-ex-muted" });
    var y2list = sid ? X.year2Only(sid) : [];
    var y2 = el("input", { type: "checkbox", class: "k-switch", "aria-label": "Exclude Year 2 content", "data-ui": "exams.year2", disabled: y2list.length ? null : "",
      onchange: function () {
        draft.exclude = y2.checked ? KOS.spec.normaliseRefs(draft.exclude.concat(y2list)) : draft.exclude.filter(function (k) { return y2list.indexOf(k) === -1; });
        exc.set(draft.exclude); redraw(true);
      } });
    y2.checked = y2list.length > 0 && y2list.every(function (k) { return draft.exclude.indexOf(k) !== -1; });
    var unitsHost = el("div", { class: "k-ex-unitlist", "data-ui": "exams.scope-units" });
    var side = el("div", { class: "k-ex-side" });
    function redraw(noPicker) {
      if (!noPicker) { inc.set(draft.include); exc.set(draft.exclude); }
      drawPresets(); drawRule(); drawUnits(); drawSide();
      errBox.hidden = true;
    }
    function drawUnits() {
      unitsHost.innerHTML = "";
      if (!sid) { unitsHost.appendChild(quiet("Pick the assessment's subject (Edit) to see its units here.", "")); return; }
      var ls = {}, ex = {};
      X.leaves(probe()).forEach(function (k) { ls[k] = true; });
      KOS.spec.resolve(draft.exclude).forEach(function (k) { ex[k] = true; });
      KOS.spec.units(sid).forEach(function (u) {
        var all = KOS.spec.resolve([u.key]), n = all.filter(function (k) { return ls[k]; }).length, x = all.filter(function (k) { return ex[k]; }).length;
        var st = x === all.length ? "out" : n === all.length ? "in" : n ? "part" : "none";
        unitsHost.appendChild(el("div", { class: "k-ex-unitrow", "data-state": st }, [
          el("span", { class: "k-ex-tri", "data-state": st, "aria-hidden": "true", text: st === "in" ? "✓" : st === "part" ? "–" : st === "out" ? "⊘" : "" }),
          el("span", { class: "k-mono k-ex-muted", text: u.ref }), el("span", { class: "k-ex-ell k-ex-grow", text: u.title }),
          el("span", { class: "k-mono k-ex-small", "data-state": st, text: st === "out" ? "excluded" : st === "none" ? "—" : n + " of " + all.length })]));
      });
    }
    function drawSide() {
      side.innerHTML = "";
      var pr = probe(), n = X.leaves(pr).length;
      var fromRule = draft.pacing ? X.leaves(probe({ include: [], exclude: [], pacing: draft.pacing })).length : 0;
      var picked = KOS.spec.resolve(draft.include).length, exN = KOS.spec.resolve(draft.exclude).length;
      var of = sid ? KOS.spec.resolve(KOS.spec.units(sid).map(function (u) { return u.key; })).length : null;
      side.appendChild(card([eyebrow("Resolved"), el("div", { class: "k-ex-bigfig-row" }, [el("span", { class: "k-ex-fig k-ex-fig--44", text: String(n) }), muted(n === 1 ? "leaf" : "leaves")]),
        of ? muted("of the " + of + " in " + SUBJ[sid]) : null,
        draft.pacing ? kv("From the live rule", String(fromRule)) : null, picked ? kv("Picked", String(picked)) : null, exN ? kv("Excluded by you", "−" + exN) : null, kv("This test", String(n))].filter(Boolean), "", "exams.resolved"));
      var ex = excludedEl(pr, "Readiness, the planner and the cram deck ignore it.");
      if (ex) side.appendChild(el("div", { class: "k-ex-col" }, [el("div", { class: "k-ex-minihead", text: "As it appears on the assessment" }), ex]));
      side.appendChild(card([chead("Year 2 content", y2.checked ? "excluded" : "included"), el("p", { class: "k-ex-body", text: y2list.length ? "The switch removes every leaf the board marks as A-level only (" + y2list.length + " in " + SUBJ[sid] + "), for a Year 12 mock." : "Nothing in this subject is marked as A-level only." })], "", "exams.y2"));
      side.lastChild.classList.add("k-ex-fill");
    }
    function save() {
      var n = X.leaves(probe()).length;
      if (!n) { errBox.hidden = false; errBox.textContent = "This scope has no topics. Pick a preset or include a topic."; announce("This scope has no topics. Pick a preset or include a topic."); return; }
      X.update(a.id, { scope: draft });
      KOS.ui.toast("Scope saved · " + plural(n, "leaf", "leaves") + ".");
      KOS.show("exams", a.id);
    }
    var left = el("div", { class: "k-ex-col" }, [
      card([chead("Start from", "one tap; you can still change topics below"), presetRow], "", "exams.scope-presets"),
      ruleHost,
      card([el("div", { class: "k-ex-inline" }, [el("span", { class: "k-ex-ctitle", text: "Topics" }), modeTabs, el("span", { class: "k-ex-grow" }),
        el("label", { class: "k-ex-inline k-ex-small" }, [y2, el("span", { text: "Exclude Year 2 content" })])]), modeNote, inc.el, exc.el, unitsHost], "k-ex-fill", "exams.topics")
    ]);
    setMode("include");
    redraw(true);
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [left, side]));
  }

  /* ---------------- the view ---------------- */
  var HUBTABS = { timetable: 1, readiness: 1, plan: 1, practice: 1, season: 1, results: 1 };
  KOS.views.exams = function (main, arg) {
    KOS.shell.tree("none");
    var V = KOS.examViews || {}, P = KOS.examPractice || {};
    if (arg && typeof arg === "object") {
      if (arg.attempt) return P.attempt ? P.attempt(main, arg.attempt, arg.page) : null;
      if (arg.id) return page(main, arg.id, arg.tab);
      if (arg.tab) return hub(main, arg.tab, arg.sub);
    }
    if (typeof arg === "string" && arg) {
      if (arg === "past") return hub(main, "timetable", "past");
      if (HUBTABS[arg]) return hub(main, arg, null);
      return page(main, arg);
    }
    hub(main, E().season().on ? "season" : "timetable", null);
  };
  function hub(main, tab, sub) {
    var V = KOS.examViews || {}, P = KOS.examPractice || {};
    if (tab === "readiness" && V.readiness) return V.readiness(main, sub);
    if (tab === "plan" && V.planner) return V.planner(main);
    if (tab === "season" && V.season) return V.season(main);
    if (tab === "results" && V.results) return V.results(main, sub);
    if (tab === "practice" && P.practice) return P.practice(main, sub);
    timetable(main, sub);
  }

  KOS.examTabs = examTabs;
  KOS.examEditor = editor;
  KOS.examUI = {
    TIER: TIER, BAND: BAND, SUBJ: SUBJ, SHORT: SHORT, HUE: HUE, MONTHS: MONTHS, DOW: DOW,
    pretty: pretty, inDays: inDays, mins: mins, plural: plural, pc: pc, hueOf: hueOf, announce: announce,
    btn: btn, card: card, chead: chead, linkBtn: linkBtn, eyebrow: eyebrow, muted: muted, kv: kv,
    tierChip: tierChip, bandEl: bandEl, prov: prov, startByEl: startByEl, scopeLine: scopeLine, excludedEl: excludedEl,
    sigCard: sigCard, quiet: quiet, bigFig: bigFig, tickBar: tickBar, ragBar: ragBar, gradesEl: gradesEl, ringEl: ringEl,
    weakList: weakList, miniList: miniList, dateBlock: dateBlock, daysLeftEl: daysLeftEl, signals: signals, spark: spark,
    head: head, backLink: backLink, examHero: examHero, nextList: nextList, evidenceLine: evidenceLine, lossBars: lossBars,
    squares: squares, checkRow: checkRow, cramScope: cramScope, resultText: resultText, editor: editor, importDialog: importDialog
  };
})();
