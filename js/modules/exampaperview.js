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
   carries on, its clock still running as in the hall, and says so once
   (EX-42); nothing else is stored until the tally is logged.   */
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
  var seenThisLoad = {};
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
    seed = /^(pack|set)-/.test(String(seed || "")) ? String(seed) : Math.max(1, parseInt(seed, 10) || 1);
    var paper = P().build(a, seed);
    var s = sessFor(paper);
    if (s && s.marking) return markPage(main, a, paper, s);
    if (s && !s.ended) return timed(main, a, paper, s);
    viewer(main, a, paper);
  }

  /* ================= the viewer (29t, 29u) ================= */
  function viewer(main, a, paper) {
    var u = U(), bp = paper.blueprint, showMs = false;
    var leafRun = paper.kind === "pack" || paper.kind === "set";
    u.head(main, "guide", { right: u.btn("‹ " + (leafRun || paper.kind === "predicted" ? "Full Companion" : "Companion"), "quiet sm", function () { if (leafRun || paper.kind === "predicted") KOS.show("exams", { id: a.id, tab: "deep" }); else KOS.show("exams", { tab: "guide", sub: a.id }); }) });
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.paper", style: "--s: " + u.hueOf(a) });
    main.appendChild(wrap);
    if (!paper.questions.length) {
      wrap.appendChild(KOS.ui.emptyState({ mark: "紙", title: "No items to build a paper from", body: "The scope's topics have no exam items with a mark scheme yet." }));
      return;
    }
    var pages = el("div", { class: "k-ex-pages", "data-ui": "exams.pages" });
    var msB = u.btn("Mark scheme", "sm", function () { showMs = !showMs; msB.setAttribute("aria-pressed", showMs ? "true" : "false"); draw(); }, { "aria-pressed": "false", "data-ui": "exams.ms-toggle" });
    var bar = el("div", { class: "k-ex-viewbar" }, [el("b", { text: paper.title + " · " + (leafRun ? paper.for : a.title) }), el("span", { class: "k-ex-grow" }), msB,
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
      u.card([u.chead("Where the questions come from", "")].concat(paper.kind === "practice" ? [
        el("p", { class: "k-ex-small", text: "Written by KurenaiOS from the topic banks for this scope, weighted to the paper's high-yield topics. Not a board paper." }),
        el("p", { class: "k-ex-small k-ex-muted", text: paper.questions.filter(function (q) { return q.src; }).length + " of " + paper.questions.length + " items are modelled on a past paper, named in the mark scheme." })] : [
        el("p", { class: "k-ex-small", text: leafRun ? "The original practice questions of " + paper.title.replace(/^\S+ \S+ /, "") + " " + paper.for + ", easiest first, written by KurenaiOS. Not a board paper." :
          "Original questions written by KurenaiOS for this paper's question shapes, weighted to its high-yield topics and to the shapes due by their pattern. Not a board paper, and not a prediction of one." }),
        el("p", { class: "k-ex-small k-ex-muted", text: "The mark scheme names each question's shape." })]), "", "exams.paper-src"),
      u.card([u.chead("Another paper", leafRun ? "the whole scope" : "the same scope, a different draw")].concat([1, 2, 3, 4].filter(function (n) { return n !== paper.seed; }).slice(0, 3).map(function (n) {
        return el("button", { type: "button", class: "k-ex-ptr k-link", "data-ui": "exams.paper-seed", onclick: function () { KOS.show("exams", { id: a.id, tab: "paper", sub: String(n) }); } }, [(paper.kind === "practice" ? "Practice paper " : "Predicted paper ") + n, el("span", { class: "k-ex-grow" }), "›"]);
      }), [el("span", { class: "k-ex-grow" }), u.btn("Exams settings", "quiet sm", function () { G().settings(); })]), "k-ex-fill", "exams.paper-more")]);
    /* the paper is long: the side rides along with it (no dead column) */
    side.setAttribute("data-sticky", "");
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [el("div", { class: "k-ex-col" }, [bar, pages]), side]));
  }
  /* the pages: the cover, the questions (answer lines sized to the marks)
     and, when asked, the mark scheme — one component, screen and print */
  /* a part's question: its paragraphs, then a data table or a table to
     complete (authored papers, the rework §7.1) */
  function tableEl(t, blanks) {
    return el("div", { class: "k-scroll-x" }, [el("table", { class: "k-ex-ms-table k-ex-ptable" }, [
      el("thead", {}, [el("tr", {}, t.head.map(function (h) { return el("th", { scope: "col", text: h }); }))]),
      el("tbody", {}, t.rows.map(function (r) { return el("tr", {}, r.map(function (c) { return el("td", { text: c === "" && blanks ? " " : c, "data-blank": c === "" && blanks ? "" : null }); })); }))])]);
  }
  function partBody(p) {
    var paras = String(p.q || "").split(/\n\n+/);
    var out = [];
    if (p.code) out.push(el("pre", { class: "k-ex-pre k-mono", text: p.code.join("\n") }));
    /* a data table sits where the question says "the records above" */
    if (p.table && paras.length > 1) { out.push(html("p", "", inline(paras[0]))); out.push(tableEl(p.table)); paras = paras.slice(1); }
    paras.forEach(function (t) { out.push(html("p", "", inline(t).replace(/\n/g, "<br>"))); });
    if (p.table && !out.some(function (n) { return n.classList && n.classList.contains("k-scroll-x"); })) out.push(tableEl(p.table));
    if (p.fill) out.push(tableEl(p.fill, true));
    return el("div", { class: "k-ex-pbody" }, out);
  }
  function marksTag(paper, m) {
    if (paper.format === "ocr-case") return "[" + m + "]";
    if (paper.format === "aqa") return "[" + m + (m === 1 ? " mark]" : " marks]");
    return "(" + m + ")";
  }
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
      paper.format === "ocr-case" ? el("div", { class: "k-ex-cover-sec" }, [el("b", { text: "Instructions" }), el("div", { text: "• Use black ink." }),
        el("div", { text: "• Write your answer to each question in the space provided." }), el("div", { text: "• Answer all the questions." })]) :
      el("div", { class: "k-ex-cover-sec" }, [el("b", { text: "Instructions" }), el("div", { text: "• Use black ink or ball-point pen." }), el("div", { text: "• Answer all questions in the spaces provided." }),
        el("div", { text: "• Show your working: answers without working may not gain full credit." }),
        bp.board === "Edexcel" ? el("div", { text: "• Give inexact answers to three significant figures unless the question says otherwise." }) : null].filter(Boolean)),
      paper.format === "ocr-case" ? el("div", { class: "k-ex-cover-sec" }, [el("b", { text: "Information" }), el("div", { text: "• The total mark for this paper is " + paper.marks + "." }),
        el("div", { text: "• The marks for each question are shown in brackets [ ]." }), el("div", { text: "• Every question is about " + (paper.org || "one organisation") + "." })]) :
      el("div", { class: "k-ex-cover-sec" }, [el("b", { text: "Information" }), el("div", { text: "• There are " + paper.questions.length + " questions. The total mark is " + paper.marks + "." }),
        el("div", { text: "• The marks for each question are shown in brackets." }), el("div", { text: "• Questions get longer through the paper." })]),
      el("div", { class: "k-ex-cover-sec" }, [el("b", { text: "Advice" }), el("div", { text: "• Read each question carefully. Keep an eye on the time: about " + (Math.round(bp.perMark * 10) / 10) + " minutes a mark." })]),
      el("div", { class: "k-ex-cover-grid" }, paper.questions.slice(0, 24).map(function (q) { return el("span", { text: "Q" + q.n }); })),
      foot(1)]));
    paper.questions.forEach(function (q, i) {
      out.push(el("section", { class: "k-ex-ppage k-ex-pq", "data-ui": "exams.ppage" }, [
        i === 0 && paper.context ? el("p", { class: "k-ex-pcontext", "data-ui": "exams.pcontext", text: paper.context }) : null,
        el("div", { class: "k-ex-pq-q" }, [el("b", { class: "k-ex-pq-n", text: String(q.n) }), el("div", {}, [q.ctx ? html("p", "", inline(q.ctx)) : null].concat(q.parts.map(function (p) {
          return el("div", { class: "k-ex-pq-part" }, [el("span", { text: p.label }), partBody(p), el("b", { text: marksTag(paper, p.marks) }), el("div", { class: "k-ex-lines", style: "--n: " + Math.min(18, p.marks * 2 + 2) })]);
        })).filter(Boolean))]),
        paper.format === "ocr-case" || paper.format === "aqa" ? null : el("div", { class: "k-ex-pq-total", text: "(Total for Question " + q.n + " is " + q.marks + (q.marks === 1 ? " mark)" : " marks)") }),
        foot(i + 2)].filter(Boolean)));
    });
    if (withMs) {
      var B = window.KOS_EXAMS && KOS_EXAMS.playbook && KOS_EXAMS.playbook[bp.board];
      out.push(el("section", { class: "k-ex-ppage k-ex-ms-page", "data-ui": "exams.ms-page" }, [
        el("div", { class: "k-ex-cover-top" }, [el("b", { text: "Mark scheme · " + paper.title }), el("span", { text: "written by KurenaiOS" })]),
        B && B.notation ? el("div", { class: "k-ex-ms-key" }, B.notation.map(function (n) { return el("span", {}, [el("b", { text: n[0] }), " " + n[1]]); })) : null,
        el("table", { class: "k-ex-ms-table" }, [el("thead", {}, [el("tr", {}, ["Q", "Scheme", "Marks", "Notes"].map(function (t) { return el("th", { scope: "col", text: t }); }))]),
          el("tbody", {}, [].concat.apply([], paper.questions.map(function (q) {
            return q.parts.map(function (p, j) {
              return el("tr", {}, [el("td", { text: (j ? "" : String(q.n)) + p.label }), html("td", "", (p.ms || []).map(function (x) { return inline(KOS.content.aqaWords(x)); }).join("<br>")),
                el("td", { text: p.chips.map(function (c) { return c.label === "✓" || /^\d+$/.test(c.label) ? "" : c.label; }).filter(Boolean).join(" ") || String(p.marks) }),
                el("td", {}, [p.guide ? el("div", { text: p.guide }) : null,
                  p.levels ? el("div", { class: "k-ex-levels" }, p.levels.map(function (lv) { return el("div", { text: lv }); })) : null,
                  p.indicative ? el("div", { class: "k-ex-indic" }, [el("b", { text: "Indicative content" })].concat(p.indicative.map(function (t) { return el("div", { text: "• " + t }); }))) : null,
                  j === q.parts.length - 1 && q.src ? el("div", { text: "Modelled on " + q.src }) : null].filter(Boolean))]);
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
    var now = Date.now(), bp = paper.blueprint || {};
    /* the attempt is recorded part by part (KOS.attempts, rework plan §8.1):
       here a part is a question, the timed page's own step */
    var rec = KOS.attempts ? KOS.attempts.begin({ kind: "paper", aid: a.id, title: paper.title, board: bp.board || a.board, paper: a.preset,
      seed: paper.seed, started: now, allowedMs: Math.round(paper.allowed * 60000), budget: bp.perMark,
      parts: paper.questions.map(function (q) { return { id: String(q.n), label: "Q" + q.n, marks: q.marks, topic: (q.refs && q.refs[0]) || q.ref || "", command: "" }; }) }) : null;
    if (rec) KOS.attempts.open(rec, "1", now);
    saveSess({ aid: a.id, seed: paper.seed, started: now, paused: null, pausedMs: 0, breaks: 0, cur: 1, flags: {}, spent: {}, enteredAt: now, rec: rec });
    U().announce("Timed. " + hm(paper.allowed) + ". Question 1 of " + paper.questions.length + ".");
    KOS.rerender();
  }
  /* ================= sitting it, full screen (47b, 47c) =================
     A fixed stage over the app, as the Exam Room is: a bar with the
     paper's title, the clock (extra time applied), Pause and Finish; the
     context, collapsible to one line; the question with a pad under every
     part; a 44 px navigator of questions with ⚑ Come back along the foot
     (a side column on a wide screen). Pause hides the paper; with Rest
     breaks off the clock runs on and stays in view (EX-32); a reload comes
     back running and says so once (EX-42). Finish opens the marking. */
  function timed(main, a, paper, s) {
    var u = U(), bp = paper.blueprint, total = paper.allowed * 60000;
    if (!s.paused && !seenThisLoad[s.started]) {
      seenThisLoad[s.started] = true;
      if (s.loadedAt) setTimeout(function () { KOS.ui.toast("Still timed: the clock kept running while the page was away."); }, 0);
      s.loadedAt = Date.now(); saveSess(s);
    }
    var q = paper.questions[Math.max(0, Math.min(paper.questions.length - 1, (s.cur || 1) - 1))];
    var A = KOS.attempts, rec = s.rec || null;
    if (A && rec && !A.isLive(rec)) A.resume(rec);
    var rest = !!E().prefs().restBreaks, extra = bp.extra || 0;
    var clockEl = el("div", { class: "k-mono k-ex-tclock", "data-ui": "exams.tclock" });
    var leftEl = u.muted("");
    function finish(mins) {
      var now = Date.now();
      if (!s.paused) s.spent[q.n] = (s.spent[q.n] || 0) + (now - (s.enteredAt || now));
      if (A && rec) A.end(rec, now);
      s.marking = { at: 0, ticks: {}, timed: true, mins: mins };
      saveSess(s);
      u.announce("Finished. Mark it beside your answers, part by part.");
      KOS.rerender();
    }
    function tick() {
      if (!clockEl.isConnected) { clearInterval(iv); return; }
      var left = total - used(s);
      clockEl.textContent = s.paused && rest ? "Paused" : clock(left).replace(/^0:/, "") + (s.paused ? " · paused" : "");
      leftEl.textContent = "left" + (extra ? " · +" + extra + " % extra time" : " of " + clock(total).replace(/:00$/, ""));
      if (left <= 0 && (!s.paused || !rest)) { clearInterval(iv); u.announce("Time is up."); finish(Math.round(paper.allowed)); }
    }
    var iv = setInterval(tick, 1000);
    if (KOS.view && KOS.view.onDispose) KOS.view.onDispose(function () { clearInterval(iv); });
    function go(n) {
      var now = Date.now();
      if (!s.paused) s.spent[q.n] = (s.spent[q.n] || 0) + (now - (s.enteredAt || now));
      s.cur = n; s.enteredAt = now;
      if (A && rec) A.open(rec, String(n), now);
      saveSess(s);
      var nq = paper.questions[n - 1];
      u.announce("Question " + n + " of " + paper.questions.length + ", " + u.plural(nq.marks, "mark") + ", budget " + Math.round(bp.perMark * nq.marks) + " minutes.");
      KOS.rerender();
    }
    function flag() { if (s.flags[q.n]) delete s.flags[q.n]; else s.flags[q.n] = 1; if (A && rec) A.flag(rec, String(q.n), !!s.flags[q.n]); saveSess(s); KOS.rerender(); }
    var nav = el("div", { class: "k-ex-tnav", role: "group", "aria-label": "Questions", "data-ui": "exams.tnav" }, paper.questions.map(function (x) {
      var st = x.n === q.n ? "cur" : s.flags[x.n] ? "flag" : s.spent[x.n] ? "done" : null;
      var lab = paper.format === "aqa" ? ("0" + x.n).slice(-2) : String(x.n);
      return el("button", { type: "button", class: "k-ex-tnav-b", "data-state": st, "aria-current": x.n === q.n ? "true" : null, "aria-label": "Question " + x.n + (s.flags[x.n] ? ", flagged" : ""), text: lab, onclick: function () { if (x.n !== q.n) go(x.n); } });
    }));
    var pauseB = u.btn(s.paused ? "▶ Resume" : "Ⅱ Pause", "sm", function () {
      var now = Date.now();
      if (s.paused) { s.pausedMs = (s.pausedMs || 0) + (now - s.paused); s.paused = null; s.enteredAt = now; if (A && rec) A.resumeClock(rec, now); u.announce("Resumed."); }
      else { s.spent[q.n] = (s.spent[q.n] || 0) + (now - (s.enteredAt || now)); s.paused = now; s.breaks = (s.breaks || 0) + 1; if (A && rec) A.pause(rec, now); u.announce(E().prefs().restBreaks ? "Paused. The paper is hidden and the clock stops for your rest break." : "Paused. The paper is hidden; the pause is logged and the paper's clock keeps running."); }
      saveSess(s); KOS.rerender();
    }, { "data-ui": "exams.tpause" });
    var endB = u.btn("Finish", "quiet sm", function () {
      KOS.ui.confirm({ title: "Finish the paper?", body: "The clock stops and you mark it beside your answers.", confirm: "Finish" }, function () { finish(Math.max(1, Math.round(used(s) / 60000))); });
    }, { "data-ui": "exams.tend" });
    var bar = el("div", { class: "k-ex-sitbar", "data-ui": "exams.tbar" }, [
      el("div", { class: "k-ex-sittitle" }, [el("b", { text: paper.title + (paper.org ? " · " + paper.org : "") }), u.muted("Written by KurenaiOS, not a board paper", "k-ex-small")]),
      el("span", { class: "k-ex-grow" }),
      el("div", { class: "k-ex-tclockbox" }, [clockEl, leftEl]), pauseB, endB]);
    var body = el("div", { class: "k-ex-sitbody" });
    if (s.paused) {
      body.appendChild(el("div", { class: "k-ex-sitpaused", "data-ui": "exams.tpaused" }, [el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "休" }),
        el("b", { text: "Paused" }), u.muted(rest ? "The paper is hidden and the clock is stopped." : "The paper is hidden. The pause is logged; the paper's clock keeps running."),
        u.btn("▶ Resume", "primary", function () { pauseB.click(); })]));
    } else {
      var col = el("div", { class: "k-ex-sitcol", "data-ui": "exams.tq" });
      if (paper.context) {
        var det = el("details", { class: "k-ex-tq-case", "data-ui": "exams.tcontext" }, [el("summary", {}, [el("span", { class: "k-xs-celllabel", text: "The context " }), el("span", { text: paper.org || "The scenario" })]), el("p", { text: paper.context })]);
        if (paper.contextTable) det.appendChild(tableEl(paper.contextTable));
        col.appendChild(det);
      }
      var budget = bp.perMark * q.marks, spent = (s.spent[q.n] || 0) + (Date.now() - (s.enteredAt || Date.now()));
      col.appendChild(el("div", { class: "k-ex-inline k-ex-sitq" }, [el("b", { class: "k-mono k-ex-tq-n", text: paper.format === "aqa" ? ("0" + q.n).slice(-2) : String(q.n) }),
        u.muted(q.title + " · " + u.plural(q.marks, "mark") + " · budget " + Math.round(budget) + " min" + (spent > 60000 ? " · " + Math.floor(spent / 60000) + " min so far" : "")), el("span", { class: "k-ex-grow" }),
        u.btn(s.flags[q.n] ? "⚑ Flagged" : "⚑ Flag", "quiet sm", flag, { "aria-pressed": s.flags[q.n] ? "true" : "false", "data-ui": "exams.tflag" })]));
      if (q.ctx) col.appendChild(html("p", "k-ex-tq-ctx", inline(q.ctx)));
      if (q.table) col.appendChild(tableEl(q.table));
      col.appendChild(el("div", { class: "k-ex-tq-parts" }, q.parts.map(function (p, j) {
        return el("div", { class: "k-ex-tq-part", "data-ui": "exams.tpart" }, [partLabel(paper, q, p, j), partBody(p), el("span", { class: "k-mono k-ex-muted k-ex-tq-mk", text: marksTag(paper, p.marks) }),
          answerPad(a, paper, q, p, j, s)]);
      })));
      col.appendChild(el("div", { class: "k-ex-inline" }, [q.n > 1 ? u.btn("‹ Question " + (q.n - 1), "sm", function () { go(q.n - 1); }) : null, el("span", { class: "k-ex-grow" }),
        q.n < paper.questions.length ? u.btn("Question " + (q.n + 1) + " ›", "primary sm", function () { go(q.n + 1); }, { "data-ui": "exams.tnext" }) : u.btn("Finish", "primary sm", function () { endB.click(); })].filter(Boolean)));
      body.appendChild(col);
    }
    var seen = paper.questions.filter(function (x) { return s.spent[x.n] || x.n === q.n; }).length;
    var foot = el("div", { class: "k-ex-sitfoot" }, [u.muted(seen + " of " + paper.questions.length), KOS.ui.scroller ? KOS.ui.scroller(nav, { keepRole: true }) : nav, el("span", { class: "k-ex-grow" }),
      u.btn("⚑ Come back", "sm", flag, { "aria-pressed": s.flags[q.n] ? "true" : "false", "data-ui": "exams.tcomeback" })]);
    var stage = el("div", { class: "k-ex-page k-ex-sit", "data-ui": "exams.timed", role: "region", "aria-label": paper.title + ", timed", style: "--s: " + u.hueOf(a) }, [bar, body, foot]);
    main.appendChild(stage);
    tick();
    typeset(stage);
  }

  /* ================= marking beside the answer (47d) =================
     One part at a time: your answer on the left (what you typed, the pages
     you wrote, or "on paper"), the scheme on the right — each mark point a
     chip naming it, an A greyed with "needs M1" until its M is ticked, the
     part's total. A levels-of-response part is marked by choosing a level
     against its descriptor, then a mark inside it, with the indicative
     content as a list to tick (evidence, not a sum). Finish logs ONE
     attempt (invariant 124) and opens its Review. The marks in progress
     are per device, in the session, so a reload keeps them. */
  function flatParts(paper) {
    var out = [];
    paper.questions.forEach(function (q) { q.parts.forEach(function (p, j) { out.push({ q: q, p: p, j: j, key: q.n + "|" + (p.label || j) }); }); });
    return out;
  }
  /* a part's name as marking says it: AQA's labels already carry the
     question (01.1), the others are the question's number and a letter */
  function pname(q, p) { var l = String(p.label || ""); return /^\d/.test(l) ? l : q.n + l; }
  function levelsOf(p) {
    return (p.levels || []).map(function (t) {
      var m = /^(Level\s*\d+)\s*\((\d+)\s*[–-]\s*(\d+)\s*marks?\)\s*:?\s*(.*)$/i.exec(String(t));
      return m ? { name: m[1], lo: +m[2], hi: +m[3], text: m[4] } : null;
    }).filter(Boolean);
  }
  function markPage(main, a, paper, s) {
    var u = U(), M = s.marking, parts = flatParts(paper);
    M.ticks = M.ticks || {};
    var at = Math.max(0, Math.min(parts.length - 1, M.at || 0)), cur = parts[at], q = cur.q, p = cur.p, j = cur.j;
    function tk(qn, jj) { M.ticks[qn] = M.ticks[qn] || {}; return (M.ticks[qn][jj] = M.ticks[qn][jj] || {}); }
    function scoreAll() {
      var t = 0;
      parts.forEach(function (x) { var m = M.ticks[x.q.n] && M.ticks[x.q.n][x.j]; if (m) t += P().partScore(x.p, m); });
      return t;
    }
    function save() { saveSess(s); }
    function goPart(n) { M.at = n; save(); KOS.rerender(); }
    var predIn = el("input", { type: "number", class: "k-input k-ex-tally-pred", min: "0", max: String(paper.marks), "aria-label": "What you predicted before marking", placeholder: "—", value: M.predicted != null ? String(M.predicted) : "",
      oninput: function () { M.predicted = predIn.value === "" ? null : +predIn.value; save(); } });
    var logB = u.btn("Finish and log", "primary sm", function () { logIt(); }, { "data-ui": "exams.tally-log" });
    var bar = el("div", { class: "k-ex-sitbar", "data-ui": "exams.mbar" }, [
      el("div", { class: "k-ex-sittitle" }, [el("b", { text: "Marking · " + paper.title }), u.muted("Tick each mark you earned beside its line of the scheme", "k-ex-small")]),
      el("span", { class: "k-ex-grow" }),
      el("label", { class: "k-ex-inline k-ex-small" }, [el("span", { text: "You predicted" }), predIn]),
      el("div", { class: "k-ex-tclockbox" }, [el("b", { class: "k-mono k-ex-tclock", text: scoreAll() + "/" + paper.marks }), u.muted("so far · " + (at + 1) + " of " + parts.length)]),
      u.btn("Mark later", "quiet sm", function () { KOS.show("exams", { id: a.id, tab: "papers" }); }, { "data-ui": "exams.mark-later" }), logB]);
    /* the answer */
    var typed = (s.typed || {})[cur.key];
    var stem = q.ctx || null;
    var ans = el("div", { class: "k-ex-mans", "data-ui": "exams.mark-answer" }, [
      el("div", { class: "k-ex-inline" }, [el("b", { class: "k-mono", text: pname(q, p) }), html("span", "k-ex-muted k-ex-small", inline(String(p.q || "").slice(0, 160)) + " " + KOS.ui.esc(marksTag(paper, p.marks))), el("span", { class: "k-ex-grow" }), u.muted("Your answer")])]);
    if (stem) ans.appendChild(html("p", "k-ex-mstem", inline(String(stem))));
    var sheet = el("div", { class: "k-ex-msheet" });
    ans.appendChild(sheet);
    if (typed && String(typed).trim()) sheet.appendChild(el("pre", { class: "k-ex-mtyped", text: typed }));
    var I = KOS.ink, item = s.rec ? "attempt:" + s.rec + ":" + cur.key : null;
    var docs = I && I.allDocs && item ? I.allDocs().filter(function (d) { return d.item === item; }) : [];
    docs.forEach(function (d) {
      I.listPages(d.key, function (err, pages) {
        (pages || []).filter(function (pg) { return (pg.items || []).length; }).forEach(function (pg) {
          if (KOS.inkExport && KOS.inkExport.pageCanvas) KOS.inkExport.pageCanvas(pg, { px: 900 }, function (c) { if (c && sheet.isConnected) { c.className = "k-ex-mink"; sheet.appendChild(c); } });
        });
      });
    });
    if (!(typed && String(typed).trim()) && !docs.length) sheet.appendChild(u.muted("Nothing written here in the app: mark it from your paper."));
    /* the scheme */
    var t = tk(q.n, j);
    var scheme = el("div", { class: "k-ex-mscheme", "data-ui": "exams.tally exams.tally-row" });
    var lv = levelsOf(p);
    function chosenMark() { return P().partScore(p, t); }
    if (lv.length) {
      var m0 = chosenMark(), curL = lv.filter(function (L) { return m0 >= L.lo && m0 <= L.hi; })[0] || null;
      scheme.appendChild(el("div", { class: "k-ex-inline" }, [el("b", { text: "Choose the level" }), el("span", { class: "k-ex-grow" }), el("b", { class: "k-mono", text: m0 + " / " + p.marks })]));
      lv.forEach(function (L) {
        var on = curL === L;
        scheme.appendChild(el("button", { type: "button", class: "k-ex-mlevel", "aria-pressed": on ? "true" : "false", "data-ui": "exams.mark-level",
          onclick: function () { setMark(L.hi); } }, [el("b", { text: L.name + " · " + L.lo + "–" + L.hi }), el("span", { text: L.text })]));
        if (on) scheme.appendChild(el("div", { class: "k-ex-inline k-ex-mmarks" }, [u.muted("Then a mark inside it")].concat(range(L.lo, L.hi).map(function (m) {
          return el("button", { type: "button", class: "k-ex-mchip", "aria-pressed": m === m0 ? "true" : "false", "data-ui": "exams.mchip", "aria-label": "Mark " + m, text: String(m), onclick: function () { setMark(m); } });
        }))));
      });
      scheme.appendChild(el("button", { type: "button", class: "k-ex-mlevel", "aria-pressed": m0 === 0 ? "true" : "false", onclick: function () { setMark(0); } }, [el("b", { text: "0 marks" }), el("span", { text: "Nothing worthy of credit." })]));
      if ((p.indicative || []).length) {
        M.ind = M.ind || {};
        scheme.appendChild(el("div", { class: "k-xs-celllabel", text: "Indicative content · the ticks are evidence, not a sum" }));
        p.indicative.forEach(function (line, k) {
          var id = "k-ex-ind-" + q.n + "-" + j + "-" + k, kk = cur.key + "#" + k;
          var box = el("input", { type: "checkbox", id: id, checked: M.ind[kk] ? "" : null, onchange: function () { M.ind[kk] = box.checked ? 1 : 0; save(); } });
          scheme.appendChild(el("label", { class: "k-xs-checkrow", for: id }, [box, html("span", "", inline(line))]));
        });
      }
    } else {
      var got = chosenMark();
      scheme.appendChild(el("div", { class: "k-ex-inline" }, [el("b", { text: "The scheme" }), el("span", { class: "k-ex-grow" }), el("b", { class: "k-mono", "data-ui": "exams.mark-part-total", text: got + " / " + p.marks })]));
      var byLine = {}, loose = [];
      p.chips.forEach(function (c) { if (c.line == null) loose.push(c); else (byLine[c.line] = byLine[c.line] || []).push(c); });
      (p.ms || []).forEach(function (line, li) {
        scheme.appendChild(el("div", { class: "k-ex-markline", "data-ui": "exams.tally-line" }, [el("span", { class: "k-ex-chips" }, (byLine[li] || []).map(chipBtn)),
          html("span", "k-ex-tally-ms", KOS.content.inline(KOS.content.aqaWords(line)))]));
      });
      if (loose.length) scheme.appendChild(el("div", { class: "k-ex-chips" }, loose.map(chipBtn)));
      if (p.guide) scheme.appendChild(html("p", "k-ex-mguide", inline(p.guide)));
    }
    function chipBtn(c) {
      var on = !!t[c.id], blocked = !!(c.needs && !t[c.needs]);
      var need = blocked ? p.chips.filter(function (x) { return x.id === c.needs; })[0] : null;
      return el("button", { type: "button", class: "k-ex-mchip", "aria-pressed": on ? "true" : "false", disabled: blocked && !on ? "" : null, "data-ui": "exams.mchip",
        "aria-label": pname(q, p) + " " + c.label + (on ? ", earned" : "") + (need ? ", needs " + need.label : ""),
        onclick: function () {
          if (t[c.id]) { delete t[c.id]; p.chips.forEach(function (d) { if (d.needs === c.id) delete t[d.id]; }); } else t[c.id] = true;
          save(); KOS.rerender();
          u.announce(pname(q, p) + ", " + P().partScore(p, t) + " of " + p.marks + ".");
        } }, [on ? "✓ " : "○ ", c.label, need ? el("span", { class: "k-ex-mneed", text: " · needs " + need.label }) : null].filter(Boolean));
    }
    function range(lo, hi) { var r = []; for (var m = lo; m <= hi; m++) r.push(m); return r; }
    function setMark(m) {
      Object.keys(t).forEach(function (k) { delete t[k]; });
      for (var k = 0; k < m; k++) t["m" + k] = true;
      save(); KOS.rerender();
      u.announce(pname(q, p) + ", " + m + " of " + p.marks + ".");
    }
    var prev = parts[at - 1], next = parts[at + 1];
    var nav = el("div", { class: "k-ex-inline k-ex-mnav" }, [prev ? u.btn("‹ " + pname(prev.q, prev.p), "quiet sm", function () { goPart(at - 1); }, { "data-ui": "exams.mark-prev" }) : el("span"), el("span", { class: "k-ex-grow" }),
      next ? u.btn("Next part · " + pname(next.q, next.p) + " ›", "primary", function () { goPart(at + 1); }, { "data-ui": "exams.mark-next" }) : u.btn("Finish and log", "primary", function () { logIt(); })]);
    var right = el("div", { class: "k-ex-mright" }, [scheme, el("span", { class: "k-ex-grow" }), nav]);
    var stage = el("div", { class: "k-ex-page k-ex-sit k-ex-marking", "data-ui": "exams.marking", role: "region", "aria-label": "Marking " + paper.title }, [bar,
      el("div", { class: "k-ex-msplit" }, [ans, right])]);
    main.appendChild(stage);
    typeset(stage);
    function logIt() {
      var fields = P().toAttempt(paper, M.ticks, { timed: !!M.timed, mins: M.mins || null, predicted: M.predicted == null ? null : M.predicted, breaks: s.breaks || 0 });
      var e = KOS.tracker.add(fields);
      if (s.rec && KOS.attempts) {
        var byQ = {};
        paper.questions.forEach(function (qq) {
          var any = false, g = 0;
          qq.parts.forEach(function (pp, jj) { var m = M.ticks[qq.n] && M.ticks[qq.n][jj]; if (m && Object.keys(m).length) { any = true; g += P().partScore(pp, m); } });
          if (any) byQ[String(qq.n)] = g;
        });
        KOS.attempts.setMarks(s.rec, byQ, "self", e && e.uid);
      }
      if (s.rec && s.typed && Object.keys(s.typed).length) {
        var ui = KOS.store.state.ui, tm = ui.examTyped = ui.examTyped && typeof ui.examTyped === "object" ? ui.examTyped : {};
        tm[s.rec] = s.typed;
        Object.keys(tm).slice(0, Math.max(0, Object.keys(tm).length - 12)).forEach(function (k) { delete tm[k]; });
      }
      clearSess();
      u.announce("Logged: " + (fields.marks != null ? fields.marks + " of " + fields.max : "not marked") + ".");
      KOS.show("exams", { id: a.id, tab: "review", sub: "a:" + e.uid });
    }
  }

  /* the part's number as its board prints it (47c): AQA's boxed 0 4 . 1,
     else the letter after the question's number */
  function partLabel(paper, q, p, j) {
    var lab = String(p.label || "");
    if (paper.format === "aqa" && /^\d{2}\.\d$/.test(lab)) {
      return el("span", { class: "k-ex-aqanum", "aria-label": "Question " + lab }, lab.split("").map(function (ch) {
        return ch === "." ? el("i", { text: "." }) : el("b", { class: "k-mono", text: ch });
      }));
    }
    return el("b", { text: lab });
  }
  /* an answer pad under every part (47b; plan §7.3): Type · Write · On
     paper, through the study's pad (KOS.inkPad.answer). What is typed is
     kept per device with the session; a stroke or a key is an event in
     the attempt's journal (KOS.attempts), tied to this question. The ink
     doc names the attempt and the part, so the review pack finds it. */
  function answerPad(a, paper, q, p, j, s) {
    var host = el("div", { class: "k-ex-tq-pad", "data-ui": "exams.tpad" });
    if (!KOS.inkPad) return host;
    var key = q.n + "|" + (p.label || j);
    s.typed = s.typed || {};
    var ta = el("textarea", { class: "k-input k-ex-tq-ta", rows: String(Math.min(12, 2 + p.marks)), "aria-label": "Your answer to " + q.n + " " + (p.label || ""), placeholder: "Your answer…" });
    ta.value = s.typed[key] || "";
    var A = KOS.attempts, rec = s.rec || null, keep = null;
    ta.addEventListener("input", function () {
      s.typed[key] = ta.value;
      if (A && rec) A.keys(rec, String(q.n), 1);
      clearTimeout(keep); keep = setTimeout(function () { saveSess(s); }, 600);
    });
    var ans = KOS.inkPad.answer(host, { textarea: ta, marks: p.marks, item: rec ? "attempt:" + rec + ":" + key : null, title: "Q" + q.n + " " + (p.label || ""), q: key });
    /* the doc is tied to the question before its first stroke lands */
    host.addEventListener("pointerdown", function () { var pd = ans.pad(); if (pd && A && rec) A.bindDoc(rec, pd.key, String(q.n)); }, true);
    return host;
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
        /* EX-33: each scheme line is printed with its own chips beside it,
           under the question, so marking needs no trip to the scheme */
        var chipsEl = el("div", { class: "k-ex-tally-lines" });
        function chipBtn(c, t) {
          var on = !!(t && t[c.id]), blocked = !!(c.needs && !(t && t[c.needs]));
          return el("button", { type: "button", class: "k-ex-mchip", "aria-pressed": on ? "true" : "false", disabled: blocked && !on ? "" : null, "data-ui": "exams.mchip",
            "aria-label": q.n + p.label + " " + c.label + (on ? ", earned" : ""), onclick: function () {
              ticks[q.n] = ticks[q.n] || {};
              var m = ticks[q.n][j] = ticks[q.n][j] || {};
              if (m[c.id]) { delete m[c.id]; p.chips.forEach(function (d) { if (d.needs === c.id) delete m[d.id]; }); } else m[c.id] = true;
              drawChips();
              var sc = P().partScore(p, m), tt = score();
              u.announce("Q" + q.n + " " + p.label + ", " + sc + " of " + p.marks + ". Total " + tt + ".");
            } }, [on ? "✓ " : "○ ", c.label]);
        }
        function drawChips() {
          chipsEl.textContent = "";
          var t = (ticks[q.n] && ticks[q.n][j]) || null;
          var byLine = {}, loose = [];
          p.chips.forEach(function (c) { if (c.line == null) loose.push(c); else (byLine[c.line] = byLine[c.line] || []).push(c); });
          var zero = el("button", { type: "button", class: "k-ex-mchip", "data-zero": "", "aria-label": q.n + p.label + " no marks", onclick: function () { ticks[q.n] = ticks[q.n] || {}; ticks[q.n][j] = {}; drawChips(); score(); } }, ["0"]);
          var ms = p.ms || [];
          ms.forEach(function (line, li) {
            var mine = (byLine[li] || []).map(function (c) { return chipBtn(c, t); });
            /* the 0 chip rides the last line when every chip has a line */
            if (li === ms.length - 1 && !loose.length) mine.push(zero);
            chipsEl.appendChild(el("div", { class: "k-ex-tally-line", "data-ui": "exams.tally-line" }, [
              el("span", { class: "k-ex-tally-ms", html: KOS.content.inline(KOS.content.aqaWords(line)) }),
              el("span", { class: "k-ex-chips" }, mine)
            ]));
          });
          if (loose.length || !ms.length) {
            var tail = el("div", { class: "k-ex-chips k-ex-tally-tail" }, loose.map(function (c) { return chipBtn(c, t); }));
            tail.appendChild(zero);
            chipsEl.appendChild(tail);
          }
          gotEl.textContent = t ? P().partScore(p, t) + " / " + p.marks : "— / " + p.marks;
          typeset(chipsEl);
        }
        drawChips();
        row.appendChild(el("span", { class: "k-mono k-ex-tally-q", text: q.n + p.label }));
        row.appendChild(el("div", { class: "k-ex-tally-main" }, [
          p.q ? el("p", { class: "k-ex-tally-stem", html: KOS.content.inline(String(p.q)) }) : null,
          chipsEl
        ].filter(Boolean)));
        row.appendChild(gotEl);
        body.appendChild(row);
      });
    });
    var ov = G().dialog("Mark it yourself", "採", [
      u.muted(paper.title + " · tick each mark you earned beside its line of the scheme; a dM or an A needs its M", "k-ex-small"), body,
      el("div", { class: "k-ex-tally-sum" }, [totalEl, sumEl, el("span", { class: "k-ex-grow" }),
        el("label", { class: "k-ex-inline k-ex-small" }, [el("span", { text: "You predicted" }), predIn]),
        el("label", { class: "k-ex-inline k-ex-small" }, [timedBox, el("span", { text: "Timed" + (o.mins ? " · " + hm(o.mins) : "") })])])],
      [el("span", { class: "k-ex-grow" }),
        u.btn("Cancel", "", function () { ov.close(); }),
        u.btn("Log as an attempt", "primary", function () {
          var fields = P().toAttempt(paper, ticks, { timed: timedBox.checked, mins: o.mins || null, predicted: predIn.value === "" ? null : +predIn.value, breaks: o.sess && o.sess.breaks ? o.sess.breaks : 0 });
          var e = KOS.tracker.add(fields);
          if (o.sess && o.sess.rec && KOS.attempts) {
            var byQ = {};
            paper.questions.forEach(function (q) {
              var any = false, got = 0;
              q.parts.forEach(function (p, j) { if (ticks[q.n] && ticks[q.n][j]) { any = true; got += P().partScore(p, ticks[q.n][j]); } });
              if (any) byQ[String(q.n)] = got;
            });
            KOS.attempts.setMarks(o.sess.rec, byQ, "self", e && e.uid);
          }
          /* what was typed stays on this device with the attempt, for the
             review pack's <typed_answer> (plan §8.3) */
          if (o.sess && o.sess.rec && o.sess.typed && Object.keys(o.sess.typed).length) {
            var ui = KOS.store.state.ui, tm = ui.examTyped = ui.examTyped && typeof ui.examTyped === "object" ? ui.examTyped : {};
            tm[o.sess.rec] = o.sess.typed;
            Object.keys(tm).slice(0, Math.max(0, Object.keys(tm).length - 12)).forEach(function (k) { delete tm[k]; });
          }
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
