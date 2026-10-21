/* Kurenai OS — modules/examroom.js
   The Exam Room (roadmap 5.8, docs/exams-plan.md §12.2, frame 29n): a calm
   surface for the last hour, on the Focus stage's composition (10b) —
   the glow, a top bar, three columns — turned to an exam.

     centre  the ring IS the breathing guide (fills over 4 s in, holds,
             empties over 4 s out, holds) with the countdown inside it,
             changing once a minute, never per second; at 0 it reads
             "Good luck." and the ring stops
     left    five things to have ready: your own flashcards from the
             scope's weakest leaves, one pass
     right   your blacklist: your three most frequent error tags and their
             fix (general ones, labelled, before any post-mortem)
     bottom  Before you go in: the assessment's own day checklist

   No rail, no strip, no bell, no new material, no Governor numbers. Teal,
   not the accent: this is calm, not a warning. Reduced motion: the ring
   stays full and only the label steps. One announcement on entry, then at
   15 and 5 minutes only. Escape leaves. The screen is kept awake where the
   browser allows (a Wake Lock, released on leaving).                     */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function E() { return KOS.exams; }
  function U() { return KOS.examUI; }
  var PHASES = ["Breathe in · 4", "Hold · 4", "Breathe out · 4", "Hold · 4"];
  var GENERAL = {
    AQA: [["Read the command word", "Describe, explain and compare each want something different; answer the one asked."], ["Name the thing, then say why", "A definition or a reason scores; a vague restatement of the question does not."], ["Show the working", "A wrong answer with the right working still earns method marks."]],
    Edexcel: [["Write every step in \"show that\"", "The answer is given; the marks are for the lines that reach it."], ["Exact unless it says otherwise", "Leave surds, π and ln; read the accuracy asked for."], ["Move on after 90 seconds", "Stuck past 90 s, mark it and come back; take the easy marks first."]],
    OCR: [["Use the scenario", "Every point tied to the context in the question; generic points cap the level."], ["Plan the long answer", "A line of points first, then write them in order with a conclusion."], ["Watch the clock", "About a minute a mark; leave time for the extended question."]]
  };

  function minutesTo(a, now) {
    if (!a.date || !a.time) return null;
    var p = a.time.split(":"), at = new Date(a.date + "T00:00:00");
    at.setHours(+p[0], +p[1], 0, 0);
    return Math.ceil((at.getTime() - now.getTime()) / 60000);
  }
  function countText(m, a) {
    if (m == null) { var d = E().daysTo(a); return d > 1 ? d + " days" : d === 1 ? "Tomorrow" : d === 0 ? "Today" : "Done"; }
    if (m <= 0) return "Good luck.";
    if (m < 60) return m + " min";
    if (m < 24 * 60) return Math.floor(m / 60) + " h " + ("0" + (m % 60)).slice(-2);
    var dd = Math.round(m / 1440);
    return dd === 1 ? "Tomorrow" : dd + " days";
  }
  /* five facts from the weakest leaves: your own cards, never a past paper */
  function things(a) {
    var rd = E().readiness(a), r = rd.signals.recall, out = [];
    var leaves = r && !r.thin ? r.weakest.map(function (w) { return w.key; }) : E().leaves(a);
    leaves.some(function (k) {
      var p = KOS.spec.parse(k);
      if (!p) return false;
      KOS.srs.cardsFor(p.subject, p.ref).filter(function (c) { return !c.redo && c.a; }).slice(0, 2).forEach(function (c) { if (out.length < 5) out.push(c); });
      return out.length >= 5;
    });
    return out;
  }
  /* your three most frequent error tags (by marks lost), else general */
  function blacklist(a) {
    var by = {}, marks = {};
    var atts = E().attemptsFor(a);
    if (!atts.length && a.subject) atts = KOS.tracker.all().filter(function (e) { return e.subject === a.subject; });
    atts.forEach(function (e) {
      (e.questions || []).forEach(function (q) {
        if (q.max == null || q.got == null || q.got >= q.max || !(q.tags || []).length) return;
        q.tags.forEach(function (t) { by[t] = (by[t] || 0) + 1; marks[t] = (marks[t] || 0) + (q.max - q.got) / q.tags.length; });
      });
    });
    var top = Object.keys(by).sort(function (x, y) { return marks[y] - marks[x]; }).slice(0, 3);
    var F = KOS.examStats.TAG_FIX;
    if (top.length) return { own: true, rows: top.map(function (t) { return [F[t] ? F[t][0] : KOS.tracker.tagShort(t), (F[t] ? F[t][1] + " " : "") + Math.round(marks[t]) + " marks lost to it in your papers."]; }) };
    var pr = a.preset ? E().preset(a.preset) : null, board = pr ? pr.board : a.board;
    return { own: false, rows: GENERAL[board] || GENERAL.AQA, board: board || "the boards" };
  }
  function planLine(a) {
    var pr = a.preset ? E().preset(a.preset) : null;
    var m = a.durationMins || (pr && pr.mins), mk = a.marks || (pr && pr.marks);
    if (!m || !mk) return "Move on after 90 seconds on any one part.";
    var total = Math.round(m * (1 + (a.extraTime || 0) / 100)), per = Math.round(10 * total / mk) / 10;
    var half = null;
    if (a.time) { var p = a.time.split(":"), t = +p[0] * 60 + +p[1] + Math.round(total / 2); half = Math.floor(t / 60) + ":" + ("0" + (t % 60)).slice(-2); }
    return "About " + per + " min a mark" + (half ? " · half the marks by " + half : "") + " · move on after 90 seconds";
  }

  KOS.examRoom = function (main, a) {
    var u = U(), X = E();
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var room = el("div", { class: "k-exr", "data-ui": "exams.room", "data-reduced": reduced ? "" : null, role: "region", "aria-label": "Exam Room" });
    var lock = null;
    function leave() { if (lock && lock.release) { try { lock.release(); } catch (e) { /* already gone */ } } KOS.show("exams", a.id); }
    room.addEventListener("keydown", function (e) { if (e.key === "Escape") { e.preventDefault(); leave(); } });
    var m0 = minutesTo(a, new Date());
    var where = [a.location, a.seat ? "seat " + a.seat : ""].filter(Boolean).join(" · ");
    /* the ring: an SVG circle whose fill the breathing animation drives */
    var NS = "http://www.w3.org/2000/svg", S = 400, SW = 14, R = (S - SW) / 2, C = 2 * Math.PI * R;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + S + " " + S); svg.setAttribute("class", "k-exr-svg"); svg.setAttribute("aria-hidden", "true");
    var track = document.createElementNS(NS, "circle"), fill = document.createElementNS(NS, "circle");
    [track, fill].forEach(function (c) { c.setAttribute("cx", S / 2); c.setAttribute("cy", S / 2); c.setAttribute("r", R); c.setAttribute("stroke-width", SW); });
    track.setAttribute("class", "k-exr-track"); fill.setAttribute("class", "k-exr-fill");
    fill.setAttribute("stroke-dasharray", C.toFixed(1) + " " + C.toFixed(1));
    fill.setAttribute("transform", "rotate(-90 " + S / 2 + " " + S / 2 + ")");
    fill.style.setProperty("--c", C.toFixed(1));
    svg.appendChild(track); svg.appendChild(fill);
    var phase = el("div", { class: "k-exr-phase", "aria-hidden": "true", text: PHASES[0] });
    var clock = el("div", { class: "k-exr-clock k-mono", text: countText(m0, a) });
    var until = el("div", { class: "k-exr-until", text: a.time ? "until " + a.time : a.date ? U().pretty(a.date) : "" });
    var ring = el("div", { class: "k-exr-ring", "data-done": m0 != null && m0 <= 0 ? "" : null }, [svg, el("div", { class: "k-exr-well" }, [phase, clock, until])]);
    var th = things(a), bl = blacklist(a), day = X.checklist(a).filter(function (c) { return c.group === "day" || c.id === "d:calc"; });
    room.appendChild(el("div", { class: "k-exr-top" }, [el("img", { src: "assets/brand/kurenai-bloom.png", alt: "", class: "k-exr-logo" }),
      el("span", { class: "k-exr-name", text: "Exam Room · " + a.title + (a.date ? " · " + u.pretty(a.date) : "") }), el("span", { class: "k-ex-grow" }),
      el("button", { type: "button", class: "k-btn k-btn--quiet", "data-ui": "exams.room-leave", text: "Leave the Exam Room", onclick: leave })]));
    room.appendChild(el("div", { class: "k-exr-body" }, [
      el("div", { class: "k-exr-left" }, [el("div", { class: "k-ex-eyebrow", text: "Rapid recall · one pass · " + th.length + (th.length === 1 ? " thing" : " things") }),
        th.length ? el("ol", { class: "k-exr-things" }, th.map(function (c, i) {
          return el("li", { class: "k-exr-thing" }, [el("span", { class: "k-mono k-ex-muted", text: String(i + 1) }), el("div", { class: "k-ex-grow" }, [el("div", { class: "k-exr-fact", html: KOS.content.inline(String(c.a)) }), el("div", { class: "k-ex-small k-ex-muted", html: KOS.content.inline(String(c.q)) })])]);
        })) : el("p", { class: "k-ex-muted", text: "No flashcards in this scope yet." })]),
      el("div", { class: "k-exr-centre" }, [ring, el("div", { class: "k-exr-meta" }, [where ? el("div", { class: "k-exr-where", text: where }) : null, el("div", { class: "k-ex-small k-ex-muted", text: "The plan: " + planLine(a) })].filter(Boolean))]),
      el("div", { class: "k-exr-right" }, [el("div", { class: "k-ex-eyebrow", text: bl.own ? "Your blacklist · three most frequent tags" : "Three steps · general, from " + bl.board + " examiner reports" }),
        el("ol", { class: "k-exr-steps" }, bl.rows.map(function (r, i) {
          return el("li", { class: "k-exr-step" }, [el("span", { class: "k-exr-stepn k-mono", text: String(i + 1) }), el("div", { class: "k-ex-grow" }, [el("div", { class: "k-exr-steptitle", text: r[0] }), el("div", { class: "k-ex-small k-ex-muted", text: r[1] })])]);
        }))])
    ]));
    if (day.length) room.appendChild(el("div", { class: "k-exr-bottom" }, [el("div", { class: "k-ex-eyebrow", text: "Before you go in" }),
      el("div", { class: "k-exr-ticks" }, day.map(function (it) {
        var box = el("input", { type: "checkbox", class: "k-box", "aria-label": it.text, "data-ui": "exams.room-check", onchange: function () { X.tickCheck(a.id, it.id, box.checked); lab.setAttribute("data-state", box.checked ? "done" : ""); } });
        box.checked = it.done;
        var lab = el("label", { class: "k-exr-tick", "data-state": it.done ? "done" : null }, [box, el("span", { text: it.text })]);
        return lab;
      }))]));
    main.appendChild(room);
    if (KOS.content.typeset) KOS.content.typeset(room);
    room.setAttribute("tabindex", "-1");
    room.focus();
    /* the breathing label steps every 4 s; the ring's motion is CSS */
    var step = 0;
    var breath = setInterval(function () {
      if (!document.body.contains(room)) { clearInterval(breath); return; }
      if (ring.hasAttribute("data-done")) return;
      step = (step + 1) % 4; phase.textContent = PHASES[step];
    }, 4000);
    /* the countdown changes once a minute; announcements at 15 and 5 */
    var said = {};
    u.announce("Exam Room. " + (m0 != null && m0 > 0 ? m0 + " minutes until " + a.time : a.time ? "" : "") + (where ? ", " + where : "") + ".");
    var tick = setInterval(function () {
      if (!document.body.contains(room)) { clearInterval(tick); if (lock && lock.release) { try { lock.release(); } catch (e) { /* gone */ } } return; }
      var m = minutesTo(a, new Date());
      clock.textContent = countText(m, a);
      if (m != null && m <= 0) ring.setAttribute("data-done", "");
      [15, 5].forEach(function (n) { if (m === n && !said[n]) { said[n] = true; u.announce(n + " minutes."); } });
    }, 60000);
    if (navigator.wakeLock && navigator.wakeLock.request) navigator.wakeLock.request("screen").then(function (l) { lock = l; }, function () { /* not allowed here */ });
  };
})();
