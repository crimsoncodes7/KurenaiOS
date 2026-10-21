/* Kurenai OS — modules/exampaperview.js
   A practice paper (roadmap 5.8 phase 5, frames 29t and 29u), from the
   paper engine (KOS.examPaper):
     #/exams/<id>/paper/<seed>   the viewer: cover, questions, mark scheme
                                 as A4 pages, beside the paper's blueprint
     timed mode                  a quiet stage: the navigator, the clock
                                 (extra time applied), the question, its
                                 budget at the paper's minutes a mark,
                                 pace, flags, Pause (a rest break stops
                                 the clock when the setting is on)
     the tally                   tick the mark points earned; a dM or an A
                                 needs its M; Log as an attempt makes ONE
                                 tracker attempt with marks by question
     print                       black on white, a page break between
                                 questions, every page labelled as ours
   The timed session is per device (state.ui.examPaperSess) so a reload
   comes back paused; nothing else is stored until the tally is logged.   */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function E() { return KOS.exams; }
  function U() { return KOS.examUI; }
  function P() { return KOS.examPaper; }
  function G() { return KOS.examGuide; }
  function html(tag, cls, str) { var n = el(tag, { class: cls }); n.innerHTML = str; return n; }
  function inline(t) { return KOS.content && KOS.content.inline ? KOS.content.inline(String(t || "")) : KOS.ui.esc(String(t || "")); }
  function typeset(n) { if (KOS.content && KOS.content.typeset) { try { KOS.content.typeset(n); } catch (e) { /* no KaTeX */ } } return n; }
  function hm(mins) { var m = Math.max(0, Math.round(mins)); return Math.floor(m / 60) ? Math.floor(m / 60) + " h" + (m % 60 ? " " + m % 60 + " min" : "") : m + " min"; }
  function clock(ms) {
    var s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    return h + ":" + (m < 10 ? "0" : "") + m + ":" + (x < 10 ? "0" : "") + x;
  }

  /* ---------------- the timed session (per device) ---------------- */
  function sessions() { var ui = KOS.store.state.ui; return ui.examPaperSess && typeof ui.examPaperSess === "object" ? ui.examPaperSess : null; }
  function sessFor(paper) { var s = sessions(); return s && s.aid === paper.aid && String(s.seed) === String(paper.seed) ? s : null; }
  function saveSess(s) { KOS.store.state.ui.examPaperSess = s; KOS.store.save(); }
  function clearSess() { delete KOS.store.state.ui.examPaperSess; KOS.store.save(); }
  function elapsed(s) { var now = Date.now(); return (s.paused ? s.paused : now) - s.started - (s.pausedMs || 0); }
  function used(s) {
    /* breaks only stop the clock when Rest breaks is on; otherwise a pause
       is logged and the paper's clock keeps running, as in the hall */
    return E().prefs().restBreaks ? elapsed(s) : Date.now() - s.started;
  }

  function page(main, a, seed) {
    seed = Math.max(1, parseInt(seed, 10) || 1);
    var paper = P().build(a, seed);
    var s = sessFor(paper);
    if (s && !s.ended) return timed(main, a, paper, s);
    viewer(main, a, paper);
  }

  /* ================= the viewer (29t, 29u) ================= */
  function viewer(main, a, paper) {
    var u = U(), bp = paper.blueprint, showMs = false;
    u.head(main, "guide", { right: u.btn("‹ Companion", "quiet sm", function () { KOS.show("exams", { tab: "guide", sub: a.id }); }) });
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.paper", style: "--s: " + u.hueOf(a) });
    main.appendChild(wrap);
    if (!paper.questions.length) {
      wrap.appendChild(KOS.ui.emptyState({ mark: "紙", title: "No items to build a paper from", body: "The scope's topics have no exam items with a mark scheme yet." }));
      return;
    }
    var pages = el("div", { class: "k-ex-pages", "data-ui": "exams.pages" });
    var msB = u.btn("Mark scheme", "sm", function () { showMs = !showMs; msB.setAttribute("aria-pressed", showMs ? "true" : "false"); draw(); }, { "aria-pressed": "false", "data-ui": "exams.ms-toggle" });
    var bar = el("div", { class: "k-ex-viewbar" }, [el("b", { text: paper.title + " · " + a.title }), el("span", { class: "k-ex-grow" }), msB,
      u.btn("⎙ Print", "sm", function () { printPaper(a, paper, showMs); }, { "data-ui": "exams.paper-print" }),
      u.btn("Mark an untimed attempt", "sm", function () { tally(a, paper, { timed: false }); }, { "data-ui": "exams.tally-open" }),
      u.btn("Start timed", "primary sm", function () { start(a, paper); }, { "data-ui": "exams.timed-start" })]);
    function draw() {
      pages.textContent = "";
      pageEls(a, paper, showMs).forEach(function (p) { pages.appendChild(p); });
      typeset(pages);
    }
    draw();
    var side = el("div", { class: "k-ex-side" }, [
      u.card([u.chead("This paper", "seed " + paper.seed),
        u.kv("Marks", String(paper.marks)), u.kv("Questions", String(paper.questions.length)),
        u.kv("Time", hm(paper.mins) + (bp.extra ? " · " + hm(paper.allowed) + " with " + bp.extra + "% extra" : "")),
        u.kv("Budget", (Math.round(bp.perMark * 10) / 10) + " min a mark"),
        bp.paper ? u.muted("Shaped like " + bp.title + ": " + bp.marks + " marks, about " + bp.questions + " questions a sitting, short to long.", "k-ex-small") : u.muted("Shaped to the assessment's marks.", "k-ex-small")], "", "exams.paper-bp"),
      u.card([u.chead("Where the questions come from", "")].concat([
        el("p", { class: "k-ex-small", text: "Written by KurenaiOS from the topic banks for this scope, weighted to the paper's high-yield topics. Not a board paper." }),
        el("p", { class: "k-ex-small k-ex-muted", text: paper.questions.filter(function (q) { return q.src; }).length + " of " + paper.questions.length + " items are modelled on a past paper, named in the mark scheme. Predicted papers, from the archetype bank, arrive with this paper's full Companion." })]), "", "exams.paper-src"),
      u.card([u.chead("Another paper", "the same scope, a different draw")].concat([1, 2, 3, 4].filter(function (n) { return n !== paper.seed; }).slice(0, 3).map(function (n) {
        return el("button", { type: "button", class: "k-ex-ptr k-link", "data-ui": "exams.paper-seed", onclick: function () { KOS.show("exams", { id: a.id, tab: "paper", sub: String(n) }); } }, ["Practice paper " + n, el("span", { class: "k-ex-grow" }), "›"]);
      }), [el("span", { class: "k-ex-grow" }), u.btn("Exams settings", "quiet sm", function () { G().settings(); })]), "k-ex-fill", "exams.paper-more")]);
    /* the paper is long: the side rides along with it (no dead column) */
    side.setAttribute("data-sticky", "");
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [el("div", { class: "k-ex-col" }, [bar, pages]), side]));
  }
  /* the pages: the cover, the questions (answer lines sized to the marks)
     and, when asked, the mark scheme — one component, screen and print */
  function pageEls(a, paper, withMs) {
    var bp = paper.blueprint, out = [];
    var foot = function (n) { return el("div", { class: "k-ex-ppage-f" }, [el("span", { text: "KurenaiOS · " + paper.title + " · written by KurenaiOS, not a board paper" }), el("span", { text: String(n) })]); };
    var pr = a.preset ? E().preset(a.preset) : null;
    out.push(el("section", { class: "k-ex-ppage k-ex-cover", "data-ui": "exams.ppage" }, [
      el("div", { class: "k-ex-cover-top" }, [el("b", { text: "WRITTEN BY KURENAIOS · NOT A BOARD PAPER" }), el("span", { text: (pr ? pr.board + " " + pr.qual + " style" : "Practice paper") })]),
      el("div", { class: "k-ex-cover-boxes" }, ["Candidate surname", "Other names", "Candidate number"].map(function (t) { return el("div", {}, [el("span", { text: t }), el("i")]); })),
      el("div", { class: "k-ex-cover-title" }, [el("div", { text: [pr ? pr.qual : null, U().SUBJ[a.subject] || null].filter(Boolean).join(" · ") }),
        el("h1", { text: paper.title + ": " + a.title }),
        el("div", { class: "k-ex-cover-meta" }, [el("span", { text: "Time: " + hm(paper.mins) + (bp.extra ? " (" + hm(paper.allowed) + " with extra time)" : "") }), el("span", { text: "Total marks: " + paper.marks })]),
        a.calculator ? el("div", { text: a.calculator === "allowed" ? "You may use a calculator." : "You may not use a calculator." }) : null].filter(Boolean)),
      el("div", { class: "k-ex-cover-sec" }, [el("b", { text: "Instructions" }), el("div", { text: "• Use black ink or ball-point pen." }), el("div", { text: "• Answer all questions in the spaces provided." }),
        el("div", { text: "• Show your working: answers without working may not gain full credit." }),
        bp.board === "Edexcel" ? el("div", { text: "• Give inexact answers to three significant figures unless the question says otherwise." }) : null].filter(Boolean)),
      el("div", { class: "k-ex-cover-sec" }, [el("b", { text: "Information" }), el("div", { text: "• There are " + paper.questions.length + " questions. The total mark is " + paper.marks + "." }),
        el("div", { text: "• The marks for each question are shown in brackets." }), el("div", { text: "• Questions get longer through the paper." })]),
      el("div", { class: "k-ex-cover-sec" }, [el("b", { text: "Advice" }), el("div", { text: "• Read each question carefully. Keep an eye on the time: about " + (Math.round(bp.perMark * 10) / 10) + " minutes a mark." })]),
      el("div", { class: "k-ex-cover-grid" }, paper.questions.slice(0, 24).map(function (q) { return el("span", { text: "Q" + q.n }); })),
      foot(1)]));
    paper.questions.forEach(function (q, i) {
      out.push(el("section", { class: "k-ex-ppage k-ex-pq", "data-ui": "exams.ppage" }, [
        el("div", { class: "k-ex-pq-q" }, [el("b", { class: "k-ex-pq-n", text: String(q.n) }), el("div", {}, [q.ctx ? html("p", "", inline(q.ctx)) : null].concat(q.parts.map(function (p) {
          return el("div", { class: "k-ex-pq-part" }, [el("span", { text: p.label }), html("span", "", inline(p.q)), el("b", { text: "(" + p.marks + ")" }), el("div", { class: "k-ex-lines", style: "--n: " + Math.min(18, p.marks * 2 + 2) })]);
        })).filter(Boolean))]),
        el("div", { class: "k-ex-pq-total", text: "(Total for Question " + q.n + " is " + q.marks + (q.marks === 1 ? " mark)" : " marks)") }),
        foot(i + 2)]));
    });
    if (withMs) {
      var B = window.KOS_EXAMS && KOS_EXAMS.playbook && KOS_EXAMS.playbook[bp.board];
      out.push(el("section", { class: "k-ex-ppage k-ex-ms-page", "data-ui": "exams.ms-page" }, [
        el("div", { class: "k-ex-cover-top" }, [el("b", { text: "Mark scheme · " + paper.title }), el("span", { text: "written by KurenaiOS" })]),
        B && B.notation ? el("div", { class: "k-ex-ms-key" }, B.notation.map(function (n) { return el("span", {}, [el("b", { text: n[0] }), " " + n[1]]); })) : null,
        el("table", { class: "k-ex-ms-table" }, [el("thead", {}, [el("tr", {}, ["Q", "Scheme", "Marks", "Notes"].map(function (t) { return el("th", { scope: "col", text: t }); }))]),
          el("tbody", {}, [].concat.apply([], paper.questions.map(function (q) {
            return q.parts.map(function (p, j) {
              return el("tr", {}, [el("td", { text: (j ? "" : String(q.n)) + p.label }), html("td", "", (p.ms || []).map(inline).join("<br>")),
                el("td", { text: p.chips.map(function (c) { return c.label === "✓" || /^\d+$/.test(c.label) ? "" : c.label; }).filter(Boolean).join(" ") || String(p.marks) }),
                el("td", { text: j === q.parts.length - 1 && q.src ? "Modelled on " + q.src : "" })]);
            });
          })))]),
        foot("MS")].filter(Boolean)));
    }
    return out;
  }
  function printPaper(a, paper, withMs) {
    var root = G().printRoot(!!E().prefs().largePrint);
    pageEls(a, paper, true).forEach(function (p) { if (withMs || !p.classList.contains("k-ex-ms-page")) root.appendChild(p); });
    if (!withMs) pageEls(a, paper, true).filter(function (p) { return p.classList.contains("k-ex-ms-page"); }).forEach(function (p) { root.appendChild(p); });
    G().printNow(root);
  }

  /* ================= timed mode (29t) ================= */
  function start(a, paper) {
    saveSess({ aid: a.id, seed: paper.seed, started: Date.now(), paused: null, pausedMs: 0, breaks: 0, cur: 1, flags: {}, spent: {}, enteredAt: Date.now() });
    U().announce("Timed. " + hm(paper.allowed) + ". Question 1 of " + paper.questions.length + ".");
    KOS.rerender();
  }
  function timed(main, a, paper, s) {
    var u = U(), bp = paper.blueprint, total = paper.allowed * 60000;
    if (!s.paused && !s.resumedHere) { s.paused = s.paused || null; }
    var q = paper.questions[Math.max(0, Math.min(paper.questions.length - 1, (s.cur || 1) - 1))];
    var clockEl = el("div", { class: "k-mono k-ex-tclock", "data-ui": "exams.tclock" });
    var leftEl = u.muted("");
    var spentEl = el("div", { class: "k-mono k-ex-tfig" });
    function tick() {
      if (!clockEl.isConnected) { clearInterval(iv); return; }
      var left = total - used(s);
      clockEl.textContent = s.paused ? "Paused" : clock(left);
      leftEl.textContent = "left of " + clock(total).replace(/:00$/, "");
      var sp = (s.spent[q.n] || 0) + (s.paused ? 0 : Date.now() - (s.enteredAt || Date.now()));
      spentEl.textContent = Math.floor(sp / 60000) + " m " + Math.floor(sp % 60000 / 1000) + " s";
      if (left <= 0 && !s.paused) { clearInterval(iv); u.announce("Time is up."); tally(a, paper, { timed: true, mins: Math.round(paper.allowed), sess: s }); }
    }
    var iv = setInterval(tick, 1000);
    function go(n) {
      var now = Date.now();
      if (!s.paused) s.spent[q.n] = (s.spent[q.n] || 0) + (now - (s.enteredAt || now));
      s.cur = n; s.enteredAt = now;
      saveSess(s);
      var nq = paper.questions[n - 1];
      u.announce("Question " + n + " of " + paper.questions.length + ", " + u.plural(nq.marks, "mark") + ", budget " + Math.round(bp.perMark * nq.marks) + " minutes.");
      KOS.rerender();
    }
    var nav = el("div", { class: "k-ex-tnav", role: "group", "aria-label": "Questions", "data-ui": "exams.tnav" }, paper.questions.map(function (x) {
      var st = x.n === q.n ? "cur" : s.flags[x.n] ? "flag" : s.spent[x.n] ? "done" : null;
      return el("button", { type: "button", class: "k-ex-tnav-b", "data-state": st, "aria-current": x.n === q.n ? "true" : null, "aria-label": "Question " + x.n + (s.flags[x.n] ? ", flagged" : ""), text: String(x.n), onclick: function () { if (x.n !== q.n) go(x.n); } });
    }));
    var pauseB = u.btn(s.paused ? "Resume" : "Pause", "sm", function () {
      var now = Date.now();
      if (s.paused) { s.pausedMs = (s.pausedMs || 0) + (now - s.paused); s.paused = null; s.enteredAt = now; u.announce("Resumed."); }
      else { s.spent[q.n] = (s.spent[q.n] || 0) + (now - (s.enteredAt || now)); s.paused = now; s.breaks = (s.breaks || 0) + 1; u.announce(E().prefs().restBreaks ? "Paused. The clock stops for your rest break." : "Paused. The pause is logged; the paper's clock keeps running."); }
      saveSess(s); KOS.rerender();
    }, { "data-ui": "exams.tpause" });
    var endB = u.btn("End and mark", "primary sm", function () {
      var now = Date.now();
      if (!s.paused) s.spent[q.n] = (s.spent[q.n] || 0) + (now - (s.enteredAt || now));
      saveSess(s);
      tally(a, paper, { timed: true, mins: Math.max(1, Math.round(used(s) / 60000)), sess: s });
    }, { "data-ui": "exams.tend" });
    var top = el("div", { class: "k-ex-tbar", "data-ui": "exams.tbar" }, [
      el("div", {}, [u.eyebrow(paper.title + " · timed"), u.muted("Written by KurenaiOS, not a board paper", "k-ex-small")]),
      el("span", { class: "k-ex-grow" }), KOS.ui.scroller ? KOS.ui.scroller(nav, { keepRole: true }) : nav,
      el("div", { class: "k-ex-tclockbox" }, [clockEl, leftEl]), pauseB, endB]);
    var habit = KOS.examCompanion.habitFor(bp.board, q.parts[0].q);
    var budget = bp.perMark * q.marks;
    var qcard = u.card([
      el("div", { class: "k-ex-inline" }, [el("b", { class: "k-mono k-ex-tq-n", text: String(q.n) }), u.muted(q.title + " · " + u.plural(q.marks, "mark")), el("span", { class: "k-ex-grow" }),
        u.btn(s.flags[q.n] ? "⚑ Flagged" : "⚑ Flag", "quiet sm", function () { if (s.flags[q.n]) delete s.flags[q.n]; else s.flags[q.n] = 1; saveSess(s); KOS.rerender(); }, { "aria-pressed": s.flags[q.n] ? "true" : "false", "data-ui": "exams.tflag" })]),
      q.ctx ? html("p", "k-ex-tq-ctx", inline(q.ctx)) : null,
      el("div", { class: "k-ex-tq-parts", "data-state": s.paused ? "paused" : null }, q.parts.map(function (p) {
        return el("div", { class: "k-ex-tq-part" }, [el("b", { text: p.label }), html("span", "", inline(p.q)), el("span", { class: "k-mono k-ex-muted", text: "(" + p.marks + ")" })]);
      })),
      el("div", { class: "k-ex-tq-ans" }, [u.muted("Your working stays on paper; mark it after with the tally.", "k-ex-small"), el("div", { class: "k-ex-lines", style: "--n: 10" })]),
      el("div", { class: "k-ex-inline" }, [q.n > 1 ? u.btn("‹ Question " + (q.n - 1), "sm", function () { go(q.n - 1); }) : null, el("span", { class: "k-ex-grow" }),
        q.n < paper.questions.length ? u.btn("Question " + (q.n + 1) + " ›", "primary sm", function () { go(q.n + 1); }, { "data-ui": "exams.tnext" }) : u.btn("End and mark", "primary sm", function () { endB.click(); })].filter(Boolean))
    ].filter(Boolean), "k-ex-fill", "exams.tq");
    var flagged = paper.questions.filter(function (x) { return s.flags[x.n]; });
    var done = paper.questions.filter(function (x) { return s.spent[x.n] && x.n !== q.n; });
    var spentAll = done.reduce(function (t, x) { return t + (s.spent[x.n] || 0); }, 0), marksDone = done.reduce(function (t, x) { return t + x.marks; }, 0);
    var side = el("div", { class: "k-ex-side" }, [
      u.card([u.chead("This question", ""), el("div", { class: "k-ex-grid-even" }, [el("div", {}, [u.eyebrow("Budget"), el("div", { class: "k-mono k-ex-tfig", text: Math.floor(budget) + " m " + Math.round(budget % 1 * 60) + " s" }), u.muted((Math.round(bp.perMark * 10) / 10) + " min a mark", "k-ex-small")]),
        el("div", {}, [u.eyebrow("Spent"), spentEl, u.muted("so far", "k-ex-small")])]),
        habit ? el("div", { class: "k-ex-habit" }, [el("b", { text: habit.type + ": " }), habit.steps.join(" ")]) : null].filter(Boolean)),
      u.card([u.chead("Pace", done.length ? "Q" + done.map(function (x) { return x.n; }).join(", ") + " seen" : ""),
        marksDone && spentAll >= 60000 ? el("div", { class: "k-ex-inline" }, [el("b", { class: "k-mono k-ex-tfig", text: String(Math.round(spentAll / 60000 / marksDone * 10) / 10) }), u.muted("min a mark against " + (Math.round(bp.perMark * 10) / 10))]) : u.muted("Pace shows after a minute on the paper."),
        s.breaks ? u.muted(u.plural(s.breaks, "pause") + " logged", "k-ex-small") : null].filter(Boolean)),
      u.card([u.chead("Flagged", flagged.length ? String(flagged.length) : "")].concat(flagged.length ? flagged.map(function (x) {
        return el("div", { class: "k-ex-ptr" }, [el("span", { class: "k-mono", text: "Q" + x.n }), u.muted(x.title), el("span", { class: "k-ex-grow" }), u.linkBtn("Go", function () { go(x.n); })]);
      }) : [u.muted("Flag a question to come back to it.")])),
      u.card([u.chead("Allowed", ""), u.kv("Calculator", a.calculator === "none" ? "Not allowed" : "Your own"),
        u.kv("Breaks", E().prefs().restBreaks ? "Rest breaks stop the clock" : "A pause is logged, not hidden"),
        el("span", { class: "k-ex-grow" }), bp.board ? u.btn("Open the playbook", "sm", function () { G().playbook(bp.board, a, "booklet"); }) : null].filter(Boolean), "k-ex-fill")]);
    var wrap = el("div", { class: "k-ex-page k-ex-timed", "data-ui": "exams.timed", style: "--s: " + u.hueOf(a) }, [top, el("div", { class: "k-ex-grid2" }, [el("div", { class: "k-ex-col" }, [qcard]), side])]);
    main.appendChild(wrap);
    tick();
    typeset(wrap);
  }

  /* ================= the tally (29t) ================= */
  function tally(a, paper, o) {
    o = o || {};
    var u = U(), ticks = {}, body = el("div", { class: "k-ex-tally", "data-ui": "exams.tally" });
    var totalEl = el("b", { class: "k-mono k-ex-fig" }), sumEl = u.muted("");
    var predIn = el("input", { type: "number", class: "k-input k-ex-tally-pred", min: "0", max: String(paper.marks), "aria-label": "What you predicted", placeholder: "—" });
    var timedBox = el("input", { type: "checkbox", class: "k-box", "aria-label": "Timed" }); timedBox.checked = !!o.timed;
    function score() {
      var t = 0, marked = 0;
      paper.questions.forEach(function (q) { q.parts.forEach(function (p, j) { if (ticks[q.n] && ticks[q.n][j]) { marked++; t += P().partScore(p, ticks[q.n][j]); } }); });
      totalEl.textContent = String(t);
      sumEl.textContent = "of " + paper.marks + (marked ? "" : " · nothing marked yet") + (predIn.value ? " · you predicted " + predIn.value : "");
      return t;
    }
    paper.questions.forEach(function (q) {
      q.parts.forEach(function (p, j) {
        var row = el("div", { class: "k-ex-tally-row", "data-ui": "exams.tally-row" });
        var gotEl = el("span", { class: "k-mono k-ex-tally-got", text: "—" });
        var chipsEl = el("div", { class: "k-ex-chips" });
        function drawChips() {
          chipsEl.textContent = "";
          var t = (ticks[q.n] && ticks[q.n][j]) || null;
          p.chips.forEach(function (c) {
            var on = !!(t && t[c.id]), blocked = !!(c.needs && !(t && t[c.needs]));
            chipsEl.appendChild(el("button", { type: "button", class: "k-ex-mchip", "aria-pressed": on ? "true" : "false", disabled: blocked && !on ? "" : null, "data-ui": "exams.mchip",
              "aria-label": q.n + p.label + " " + c.label + (on ? ", earned" : ""), onclick: function () {
                ticks[q.n] = ticks[q.n] || {};
                var m = ticks[q.n][j] = ticks[q.n][j] || {};
                if (m[c.id]) { delete m[c.id]; p.chips.forEach(function (d) { if (d.needs === c.id) delete m[d.id]; }); } else m[c.id] = true;
                drawChips();
                var sc = P().partScore(p, m), tt = score();
                u.announce("Q" + q.n + " " + p.label + ", " + sc + " of " + p.marks + ". Total " + tt + ".");
              } }, [on ? "✓ " : "○ ", c.label]));
          });
          chipsEl.appendChild(el("button", { type: "button", class: "k-ex-mchip", "data-zero": "", "aria-label": q.n + p.label + " no marks", onclick: function () { ticks[q.n] = ticks[q.n] || {}; ticks[q.n][j] = {}; drawChips(); score(); } }, ["0"]));
          gotEl.textContent = t ? P().partScore(p, t) + " / " + p.marks : "— / " + p.marks;
        }
        drawChips();
        row.appendChild(el("span", { class: "k-mono k-ex-tally-q", text: q.n + p.label }));
        row.appendChild(chipsEl);
        row.appendChild(gotEl);
        body.appendChild(row);
      });
    });
    var ov = G().dialog("Mark it yourself", "採", [
      u.muted(paper.title + " · tick each mark you earned; a dM or an A needs its M", "k-ex-small"), body,
      el("div", { class: "k-ex-tally-sum" }, [totalEl, sumEl, el("span", { class: "k-ex-grow" }),
        el("label", { class: "k-ex-inline k-ex-small" }, [el("span", { text: "You predicted" }), predIn]),
        el("label", { class: "k-ex-inline k-ex-small" }, [timedBox, el("span", { text: "Timed" + (o.mins ? " · " + hm(o.mins) : "") })])])],
      [u.btn("Mark schemes ›", "quiet", function () { ov.close(); KOS.show("exams", { id: a.id, tab: "paper", sub: String(paper.seed) }); }), el("span", { class: "k-ex-grow" }),
        u.btn("Cancel", "", function () { ov.close(); }),
        u.btn("Log as an attempt", "primary", function () {
          var fields = P().toAttempt(paper, ticks, { timed: timedBox.checked, mins: o.mins || null, predicted: predIn.value === "" ? null : +predIn.value, breaks: o.sess && o.sess.breaks ? o.sess.breaks : 0 });
          var e = KOS.tracker.add(fields);
          if (o.sess) clearSess();
          ov.close();
          u.announce("Logged: " + (fields.marks != null ? fields.marks + " of " + fields.max : "not marked") + ".");
          KOS.show("exams", { attempt: e.uid });
        }, { "data-ui": "exams.tally-log" })], "exams.tally-dialog");
    predIn.addEventListener("input", score);
    score();
    typeset(body);
    return ov;
  }

  KOS.examPaperView = { page: page, tally: tally, pageEls: pageEls };
})();
