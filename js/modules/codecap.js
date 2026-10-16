/* Kurenai OS — modules/codecap.js
   Code · a capstone checkpoint (roadmap 5.3, frames 26l and 26k):
   `#/code/capstone/<id>`.

   A stepper — Closed-book quiz · Brief & build · Rubric · Kurenai review ·
   Write-up · Result — every step open at any time (the quiz never locks
   the capstone; under 3 of 5 it recommends two lessons first).

   Brief & build is the in-app workspace of 26k: the editor in the centre
   with a docked tool window under it (Run · Tests · Problems), the
   Milestones window on the right (numbers, the current milestone's brief,
   examples and last result, Run and Next, and the whole brief one tab
   away), and a status bar. The code is a per-device draft saved as it is
   typed ("cap:<id>"), so leaving the step or the page loses nothing.

   The quiz is the study quiz engine (frame 8e) keeping the capstone's own
   record. The rubric's correctness row fills itself from the acceptance
   runs. The review sends only what is ticked in "What is sent", once, and
   can be skipped. The Result submits: it passes when every milestone
   passes, the rubric is marked and the write-up is long enough, and pays
   once ever (KOS.code.submitCapstone, invariant 106).

   Every step fills the page's width (a main column and a side panel, or a
   full-width table). Drawing writes nothing (smoke76); the step shown is
   per device (state.ui.code.capStep), written only by a click.            */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el;
  var SID = "code";
  /* what each stage may use, for the Kurenai review's brief */
  var STAGE_WORDS = { 1: "stage 1: variables, decisions, loops, methods, scope; no arrays or classes yet", 2: "stage 2: arrays, List, Dictionary, text, files and exceptions; no classes or LINQ yet" };
  function C() { return KOS.code; }
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  function plural(n, one, many) { return KOS.ui.num(n) + " " + (n === 1 ? one : (many || one + "s")); }
  function dateLabel(ts) { return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }
  function timeLabel(ts) { var d = new Date(ts); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
  function capNo(id) { return String(id).slice(1); }

  function page(main, id) {
    var v = C().capView(id);
    if (!v) { KOS.show("code", { page: "map" }); return; }
    var spec = v.spec, ui = C().ui();
    var ids = C().CAP_STEPS.map(function (s) { return s[0]; });
    var saved = ui.capStep && ui.capStep[id];
    if (saved === "brief") saved = "build";
    var stepNow = ids.indexOf(saved) >= 0 ? saved : (v.passAt ? "result" : v.quiz ? "build" : "quiz");
    var phone = C().isPhone();
    var stg = (window.KOS_CODE.STAGES || []).filter(function (s) { return s.capstone === id; })[0];
    var nextStage = stg ? window.KOS_CODE.STAGES[window.KOS_CODE.STAGES.indexOf(stg) + 1] : null;

    main.appendChild(KOS.ui.pageHeader({ kicker: "Code · Capstone " + capNo(id) + (stg ? " · end of stage " + stg.id : ""), title: spec.title, sub: spec.summary }));
    var wrap = el("div", { class: "k-cx-cap", "data-ui": "code.capstone" });
    main.appendChild(wrap);
    var live = el("p", { class: "sr-only", "aria-live": "polite", "data-ui": "code.cap-live" });
    var stepper = el("ol", { class: "k-cx-steps", "data-ui": "code.cap-steps", "data-scroller": "true", role: "tablist", "aria-label": "Capstone steps" });
    var body = el("section", { class: "k-cx-capbody", "data-ui": "code.cap-step", role: "tabpanel" });
    /* on a phone the page header gives way to the section title; the
       capstone keeps its name above the stepper */
    wrap.appendChild(el("p", { class: "k-cx-capmini", "aria-hidden": "true" }, [el("span", { class: "k-mono", text: "Capstone " + capNo(id) + " · " }), el("b", { text: spec.title })]));
    wrap.appendChild(stepper); wrap.appendChild(live); wrap.appendChild(body);
    function say(m) { live.textContent = m; announce(m); }

    /* ---- the stepper: one tab stop, ← → ---- */
    function drawSteps() {
      v = C().capView(id);
      stepper.innerHTML = "";
      v.steps.forEach(function (s, i) {
        var on = s.id === stepNow;
        var b = el("button", { type: "button", class: "k-cx-step", role: "tab", "data-step": s.id, "aria-selected": String(on),
          "aria-current": on ? "step" : null, tabindex: on ? "0" : "-1", "data-state": on ? "current" : s.done ? "done" : null,
          onclick: function () { go(s.id); } }, [
          el("span", { class: "k-cx-step-n", "aria-hidden": "true", text: s.done && !on ? "✓" : String(i + 1) }),
          el("span", { class: "k-cx-step-t", text: s.title }),
          s.done ? el("span", { class: "sr-only", text: " (done)" }) : null
        ].filter(Boolean));
        stepper.appendChild(el("li", { class: "k-cx-stepli" }, [b]));
      });
    }
    stepper.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var i = ids.indexOf(stepNow) + (e.key === "ArrowRight" ? 1 : -1);
      if (i < 0 || i >= ids.length) return;
      e.preventDefault(); go(ids[i]);
      var b = stepper.querySelector('[data-step="' + ids[i] + '"]'); if (b) b.focus();
    });
    function go(step) {
      stepNow = step;
      ui.capStep = ui.capStep && typeof ui.capStep === "object" ? ui.capStep : {};
      ui.capStep[id] = step;
      KOS.store.save();
      draw();
    }
    function draw() {
      drawSteps();
      body.innerHTML = "";
      body.setAttribute("data-step", stepNow);
      var title = (C().CAP_STEPS.filter(function (s) { return s[0] === stepNow; })[0] || [])[1];
      body.setAttribute("aria-label", title || "");
      ({ quiz: stepQuiz, build: stepBuild, rubric: stepRubric, review: stepReview, writeup: stepWriteup, result: stepResult }[stepNow] || stepQuiz)();
    }
    function nextBtn(step, text) {
      return el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.cap-next", text: text, onclick: function () { go(step); } });
    }
    function lessonLink(ref) {
      var L = C().lesson(ref);
      return el("button", { type: "button", class: "k-link", text: ref + (L ? " " + L.title : ""), onclick: function () { KOS.show("ref", { subject: SID, ref: ref }); } });
    }
    /* a step's two columns: the work, and a side panel that earns its width */
    function grid(mainCol, side) {
      return el("div", { class: "k-cx-capgrid" }, [el("div", { class: "k-cx-capmain" }, mainCol.filter(Boolean)), el("aside", { class: "k-cx-capside" }, side.filter(Boolean))]);
    }
    function sideCard(title, meta, kids) {
      return el("section", { class: "k-card k-cx-capcard" }, [el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: title }), meta ? el("span", { class: "k-card-meta", text: meta }) : null].filter(Boolean))].concat(kids.filter(Boolean)));
    }

    /* ① the closed-book quiz: the study quiz engine (8e) */
    function stepQuiz() {
      var q = v.quiz, holder = el("div", { class: "k-cx-capquiz", "data-ui": "code.cap-quiz" });
      var retake = body.getAttribute("data-retake") === "1";
      var mainCol = [];
      if (q && !retake) {
        mainCol.push(el("section", { class: "k-card k-qz-result k-cx-capqres", "data-ui": "code.cap-quiz-score" }, [
          el("div", { class: "k-qz-score" }, [el("b", { text: q.score + " / " + q.total }),
            el("span", { text: q.score === q.total ? "Full marks — you are ready." : q.recommend.length ? "Two lessons are worth a look first. The capstone stays open." : "Ready. Review the misses as you build." })]),
          q.missed.length ? el("ul", { class: "k-cx-capmiss" }, q.missed.map(function (i) {
            var qq = spec.quiz[i];
            return el("li", {}, [el("span", { text: "Missed: " + qq.why + " " }), lessonLink(qq.lesson)]);
          })) : null,
          el("div", { class: "k-qz-foot" }, [nextBtn("build", "Open the brief & build →"),
            el("button", { type: "button", class: "k-btn", "data-ui": "code.cap-retake", text: "Take it again", onclick: function () { body.setAttribute("data-retake", "1"); draw(); } })])
        ].filter(Boolean)));
      } else {
        mainCol.push(holder);
        KOS.quiz.mountMCQ(holder, SID, id, spec.quiz, { attempts: q ? 1 : 0, best: q ? q.score : 0, onFinish: function (picks) {
          body.removeAttribute("data-retake");
          var r = C().answerQuiz(id, picks);
          say("Quiz: " + r.score + " of " + r.total + ". The brief is open.");
          draw();
        } });
      }
      body.appendChild(grid(mainCol, [
        sideCard("What it covers", "stage " + spec.stage + " · closed book", [
          el("ol", { class: "k-cx-capcover" }, spec.quiz.map(function (qq, i) {
            var st = q ? (q.answers[i] === qq.ans ? "right" : "wrong") : null;
            return el("li", { "data-state": st }, [el("span", { class: "k-cx-capcover-m", "aria-hidden": "true", text: st === "right" ? "✓" : st === "wrong" ? "✗" : String(i + 1) }), lessonLink(qq.lesson)]);
          })),
          el("p", { class: "k-cx-note", text: "It checks you are ready; it never locks the capstone. Under 3 of 5 it recommends two lessons first." })
        ]),
        q && q.recommend.length ? sideCard("Recommended first", null, [el("p", { class: "k-cx-note" }, q.recommend.map(function (r, i) { return el("span", {}, [i ? " and " : "", lessonLink(r)]); }))]) : null,
        !q ? el("button", { type: "button", class: "k-btn", text: "Skip to the brief & build", onclick: function () { go("build"); } }) : null
      ]));
    }

    /* ② brief & build: the 26k workspace */
    var msPick = null;
    function stepBuild() {
      if (phone) {
        body.appendChild(grid([
          el("section", { class: "k-card k-cx-phonelater", "data-ui": "code.best-on-computer" }, [
            el("span", { class: "k-cx-chip", "data-tone": "amber", text: "Best on a computer" }),
            el("p", { class: "k-cx-note", text: "The build needs a wide editor. The quiz, rubric and result work here." })]),
          el("div", { class: "k-prose k-cx-capbrief", html: KOS.content.renderBlocks(spec.brief) })
        ], []));
        return;
      }
      var key = "cap:" + id;
      var b0 = C().buildView(id);
      if (msPick == null) { var firstOpen = b0.milestones.filter(function (m) { return !m.done; })[0]; msPick = firstOpen ? spec.milestones.map(function (m) { return m.id; }).indexOf(firstOpen.id) : 0; }
      var initial = C().draft(key);
      var savedAt = el("span", { class: "k-cx-ws-saved", "data-ui": "code.cap-saved", text: initial != null ? "Saved on this device" : "Starter code" });
      var save = KOS.ui.debounce(function (val) { C().setDraft(key, val === spec.starter ? null : val); savedAt.textContent = "Saved on this device · " + timeLabel(Date.now()); }, 400);
      var ed = KOS.codeUI.editor({ value: initial != null ? initial : spec.starter, file: "Program.cs", label: "Your capstone", minLines: 24,
        onRun: doRun, onChange: function (val) { savedAt.textContent = "● Saving…"; save(val); } });

      /* the toolbar */
      var runBtn = el("button", { type: "button", class: "k-btn", "data-ui": "code.run", text: "▶ Run", onclick: doRun });
      var allBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.cap-test-all",
        text: "✓ Run all tests", onclick: function () { testFrom(0); } });
      var count = el("span", { class: "k-cx-ws-count k-mono", "data-ui": "code.cap-count" });
      var toolbar = el("div", { class: "k-cx-ws-bar" }, [
        el("span", { class: "k-cx-ws-name" }, [el("b", { text: spec.title }), " ", KOS.codeUI.evidence("app")]),
        count, el("span", { class: "k-cx-ws-acts" }, [runBtn, allBtn])
      ]);

      /* the docked tool window: Run · Tests · Problems */
      var stdin = el("textarea", { class: "k-input k-cx-capstdin k-mono", "data-ui": "code.cap-stdin", rows: "5", spellcheck: "false", autocapitalize: "off",
        "aria-label": "Commands for Run, one per line" });
      stdin.value = (spec.milestones[msPick].cases[0] || {}).stdin || "";
      var out = el("div", { class: "k-cx-outbody", "data-ui": "code.cap-output" }, [el("p", { class: "k-cx-note", text: "Run plays your program with the commands on the left, one per line." })]);
      var runPane = el("div", { class: "k-cx-ws-pane k-cx-caprun", "data-pane": "run" }, [
        el("div", { class: "k-cx-caprun-in" }, [el("label", { class: "k-kicker", text: "Commands" }), stdin]),
        el("div", { class: "k-cx-caprun-out" }, [el("span", { class: "k-kicker", text: "Output" }), out])]);
      resPanel = el("div", { class: "k-cx-ws-pane", "data-pane": "tests", "data-ui": "code.cap-results", hidden: "" }, [el("p", { class: "k-cx-note", text: "Run a milestone's tests, or all of them, and the results appear here." })]);
      var probPane = el("div", { class: "k-cx-ws-pane", "data-pane": "problems", hidden: "" }, [el("p", { class: "k-cx-note", text: "No problems. A compile error appears here with its line." })]);
      var toolTabs = el("div", { class: "k-seg k-seg--quiet", role: "tablist", "aria-label": "Tool window" });
      [["run", "Run"], ["tests", "Tests"], ["problems", "Problems"]].forEach(function (t) {
        toolTabs.appendChild(el("button", { type: "button", class: "k-seg-item", role: "tab", "data-tab": t[0], "aria-selected": String(t[0] === "run"), onclick: function () { tool(t[0]); } }, [t[1]]));
      });
      function tool(name) {
        [].forEach.call(toolTabs.children, function (bt) { bt.setAttribute("aria-selected", String(bt.getAttribute("data-tab") === name)); });
        [runPane, resPanel, probPane].forEach(function (p) { p.hidden = p.getAttribute("data-pane") !== name; });
      }
      var toolwin = el("section", { class: "k-cx-ws-tool", "aria-label": "Run, tests and problems" }, [el("div", { class: "k-cx-ws-tool-h" }, [toolTabs]), runPane, resPanel, probPane]);

      /* the Milestones window */
      var msWin = el("aside", { class: "k-cx-ws-ms", "data-ui": "code.cap-milestones", "aria-label": "Milestones" });
      function drawMs() {
        var bv = C().buildView(id), m = spec.milestones[msPick], mv = bv.milestones[msPick];
        count.textContent = bv.pass + " / " + bv.total + " tests · " + bv.done + " / " + bv.milestones.length + " milestones";
        msWin.innerHTML = "";
        var nums = el("div", { class: "k-cx-ws-nums", role: "tablist", "aria-label": "Milestones" }, spec.milestones.map(function (x, i) {
          var xv = bv.milestones[i];
          return el("button", { type: "button", class: "k-cx-ws-num", role: "tab", "aria-selected": String(i === msPick), "data-ui": "code.cap-ms-num",
            "data-state": i === msPick ? "current" : xv.done ? "done" : xv.run ? "fail" : null, title: x.title,
            text: xv.done && i !== msPick ? "✓" : String(i + 1), onclick: function () { msPick = i; drawMs(); } });
        }));
        msWin.appendChild(el("div", { class: "k-cx-ws-ms-h" }, [el("span", { class: "k-kicker", text: "Milestones" }), nums]));
        /* the current milestone, its actions, then the whole brief below —
           one scrolling column, nothing to switch to */
        var scroll = el("div", { class: "k-cx-ws-ms-body", "data-ui": "code.cap-brief" });
        msWin.appendChild(scroll);
        scroll.appendChild(el("h3", { class: "k-cx-ws-mt" }, [el("span", { class: "k-mono", text: "M" + (msPick + 1) + " · " }), m.title]));
        scroll.appendChild(el("p", { class: "k-cx-note", text: m.about }));
        m.cases.filter(function (c) { return !c.hidden; }).forEach(function (ex) {
          scroll.appendChild(el("div", { class: "k-cx-ex k-cx-ws-ex" }, [
            el("div", {}, [el("span", { class: "k-cx-ex-k", text: "Input" }), el("pre", { class: "k-mono", text: ex.stdin || "(none)" })]),
            el("div", {}, [el("span", { class: "k-cx-ex-k", text: "Output" }), el("pre", { class: "k-mono", text: ex.out })])
          ]));
        });
        var hid = m.cases.filter(function (c) { return c.hidden; }).length;
        if (hid) scroll.appendChild(el("p", { class: "k-cx-note", text: "+ " + plural(hid, "hidden case") + " — the brief's rules decide them." }));
        scroll.appendChild(el("p", { class: "k-cx-ws-last", "data-state": mv.done ? "pass" : mv.run ? "fail" : null, "data-ui": "code.cap-m-badge",
          text: mv.done ? "✓ All " + mv.total + " pass · " + timeLabel(mv.at) : mv.run ? "✗ " + (mv.total - mv.pass) + " of " + mv.total + " failing · " + timeLabel(mv.at) : "Not run yet" }));
        var nx = spec.milestones[msPick + 1];
        scroll.appendChild(el("div", { class: "k-cx-ws-ms-f" }, [
          el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "code.cap-test", text: "Run M" + (msPick + 1) + " tests", onclick: function () { runMilestone(m, ed); } }),
          nx ? el("button", { type: "button", class: "k-btn", text: "Next: M" + (msPick + 2) + " ›", onclick: function () { msPick++; stdin.value = (nx.cases[0] || {}).stdin || ""; drawMs(); } })
            : bv.all ? nextBtn("rubric", "Rubric ›") : null
        ].filter(Boolean)));
        scroll.appendChild(el("h3", { class: "k-cx-ws-bt", text: "The brief" }));
        var files = KOS.codeUI.filesPanel(spec.fs);
        if (files) scroll.appendChild(files);
        scroll.appendChild(el("div", { class: "k-prose k-cx-capbrief", html: KOS.content.renderBlocks(spec.brief) }));
      }
      var status = el("div", { class: "k-cx-ws-status" }, [el("span", { text: "Program.cs" }), savedAt, el("span", { text: "in-app runner · stage " + spec.stage + " C#" })]);
      body.appendChild(el("div", { class: "k-cx-ws", "data-ui": "code.cap-workspace" }, [
        toolbar,
        el("div", { class: "k-cx-ws-centre" }, [ed.el, toolwin]),
        msWin,
        status
      ]));
      drawMs();

      function doRun() {
        runBtn.disabled = true; ed.running(true); tool("run");
        KOS.codeRun.run({ files: ed.files(), stdin: stdin.value, fs: spec.fs, lesson: id }).then(function (r) {
          runBtn.disabled = false; ed.running(false);
          out.innerHTML = "";
          if (r.stdout) out.appendChild(el("pre", { class: "k-cx-out-pre k-mono", "data-ui": "code.stdout", text: r.stdout.replace(/\n$/, "") }));
          var wrote = KOS.codeUI.writtenPanel(spec.fs, r.fs);
          if (wrote) out.appendChild(wrote);
          if (r.ok) { ed.state("ready", "Ran"); if (!r.stdout && !wrote) out.appendChild(el("p", { class: "k-cx-note", text: "(no output)" })); say("Ran. " + (KOS.codeRun.firstLine(r.stdout) || "No output") + "."); }
          else {
            ed.state(r.error.kind === "compile" ? "compile" : r.error.kind === "timeout" ? "timeout" : "exception");
            if (r.error.line) ed.mark(r.error.line, KOS.codeUI.quoted(r.error.msg));
            out.appendChild(KOS.codeUI.errorCard(r.error));
            if (r.error.kind === "compile") problem(r.error);
            say(r.error.kind === "compile" ? "Compile error " + r.error.code + " on line " + r.error.line + "." : "Stopped: " + r.error.code + ".");
          }
        });
      }
      function problem(e) {
        probPane.innerHTML = "";
        probPane.appendChild(el("ul", { class: "k-cx-problems" }, [el("li", { text: e.code + " · line " + e.line + " · " + e.msg })]));
      }
      var running = false, firstFail = null;
      /* every milestone in turn; the Tests window keeps the first that fails */
      function testFrom(i) {
        if (running && i === 0) return;
        if (i === 0) firstFail = null;
        var ms = spec.milestones;
        if (i >= ms.length) {
          running = false; allBtn.disabled = false; drawSteps();
          if (firstFail) { showResults(firstFail[0], firstFail[1]); msPick = ms.indexOf(firstFail[0]); ed.state("fail", "Milestone " + (msPick + 1) + " failing"); }
          else { ed.state("pass", "Every acceptance test passes"); say("Every acceptance test passes. The rubric is next."); }
          drawMs();
          return;
        }
        running = true; allBtn.disabled = true;
        runMilestone(ms[i], ed, true).then(function (c) {
          if (!c.passed && !firstFail) firstFail = [ms[i], c];
          if (c.compile) { running = false; allBtn.disabled = false; drawSteps(); drawMs(); return; }
          testFrom(i + 1);
        });
      }
      function runMilestone(m, edr, batch) {
        showResults(m, null); tool("tests");
        edr.running(true);
        return KOS.codeRun.check({ mode: "program", cases: m.cases, fs: m.fs || spec.fs, lesson: id }, edr.files()).then(function (c) {
          edr.running(false);
          C().recordMilestone(id, m.id, c.compile ? 0 : c.pass, c.total);
          showResults(m, c);
          if (c.compile) { edr.state("compile"); if (c.compile.line) edr.mark(c.compile.line, KOS.codeUI.quoted(c.compile.msg)); problem(c.compile); say("Compile error " + c.compile.code + " on line " + c.compile.line + "."); }
          else if (!batch) { edr.state(c.passed ? "pass" : "fail", "Milestone " + (spec.milestones.indexOf(m) + 1) + (c.passed ? " passes" : " · " + c.pass + " of " + c.total)); if (c.passed) edr.mark(0); say(m.title + ": " + c.pass + " of " + c.total + " pass."); }
          if (!batch) { drawSteps(); drawMs(); }
          return c;
        });
      }
    }
    var resPanel = null;
    function showResults(m, c) {
      if (!resPanel) return;
      var t = "M" + (spec.milestones.indexOf(m) + 1) + " · " + m.title;
      resPanel.innerHTML = "";
      resPanel.appendChild(c ? KOS.codeUI.results(c, { title: t }) : KOS.codeUI.results(null, { running: true, total: m.cases.length, cases: m.cases, title: t }));
    }

    /* ③ the rubric: a full-width table, the guide beside each mark */
    function stepRubric() {
      var rb = C().rubricView(id);
      var tbl = el("div", { class: "k-cx-rubric", role: "table", "aria-label": "Rubric", "data-ui": "code.cap-rubric" }, [
        el("div", { class: "k-cx-rubrow k-cx-rubrow--h", role: "row" }, ["Criterion", "How", "Mark", "What that mark means"].map(function (h) { return el("span", { role: "columnheader", text: h }); }))
      ]);
      rb.rows.forEach(function (r) {
        var cell;
        if (r.auto) cell = el("b", { class: "k-mono", "data-ui": "code.cap-rubric-auto", text: r.value + " / " + r.max });
        else {
          cell = el("div", { class: "k-seg k-seg--quiet k-cx-rubseg", role: "radiogroup", "aria-label": r.title });
          for (var n = 0; n <= r.max; n++) (function (n) {
            cell.appendChild(el("button", { type: "button", class: "k-seg-item", role: "radio", "aria-checked": String(r.value === n),
              title: r.guide ? r.guide[n] : null, text: String(n), onclick: function () { C().setRubric(id, r.id, n); say(r.title + ": " + n + " of " + r.max + "."); draw(); } }));
          })(n);
        }
        tbl.appendChild(el("div", { class: "k-cx-rubrow", role: "row" }, [
          el("span", { role: "cell", class: "k-cx-rub-t", text: r.title }),
          el("span", { role: "cell", class: "k-cx-rub-k", text: r.auto ? "Automatic" : "Self-marked" }),
          el("span", { role: "cell", class: "k-cx-rub-v" }, [cell]),
          el("span", { role: "cell", class: "k-cx-rub-g", text: r.auto ? (v.build.all ? "Every acceptance case passes." : v.build.pass + " of " + v.build.total + " acceptance cases pass; fills itself and cannot be edited.") : r.value == null ? "Not marked yet" : r.guide[r.value] })
        ]));
      });
      tbl.appendChild(el("div", { class: "k-cx-rubrow k-cx-rubrow--total", role: "row" }, [
        el("span", { role: "cell", class: "k-cx-rub-t", text: "Total" }), el("span", { role: "cell" }),
        el("span", { role: "cell", class: "k-cx-rub-v" }, [el("b", { class: "k-mono", "data-ui": "code.cap-rubric-total", text: rb.total + " / " + rb.max })]),
        el("span", { role: "cell", class: "k-cx-rub-g", text: rb.marked ? "Marked. It is for you; only the tests decide correctness." : "Mark every self-marked row." })
      ]));
      body.appendChild(tbl);
      body.appendChild(el("div", { class: "k-cx-capacts" }, [nextBtn("review", "Kurenai review →"),
        !v.build.all ? el("span", { class: "k-cx-note", text: "Acceptance tests still failing: correctness shows its score, and the build step stays open until they pass." }) : null].filter(Boolean)));
    }

    /* ④ the Kurenai review: What is sent, once; skippable */
    var reviewReq = null;
    function stepReview() {
      var r = v.review, mainCol = [];
      if (reviewReq) {
        mainCol.push(el("p", { class: "k-cx-capwait", role: "status", "data-ui": "code.cap-review-sending" }, [
          el("span", { text: "Kurenai is reading your capstone… " }),
          el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", text: "Cancel", onclick: function () { if (KOS.ai && KOS.ai.cancel) KOS.ai.cancel(reviewReq); reviewReq = null; draw(); } })]));
      } else if (r && r.state === "received") {
        mainCol.push(el("article", { class: "k-card k-cx-capreview", "data-ui": "code.cap-review" }, [
          el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "◎ Kurenai's review" }), el("span", { class: "k-card-meta", text: "read " + dateLabel(r.at) })]),
          el("div", { class: "k-prose", html: r.text.split(/\n{2,}/).map(function (p) { return "<p>" + KOS.content.inline(p.replace(/\n/g, " ")) + "</p>"; }).join("") })
        ]));
      } else {
        mainCol.push(el("section", { class: "k-card k-cx-capintro" }, [
          el("p", { class: "k-cx-capintro-h", text: r && r.state === "skipped" ? "Skipped — the result will say “no review”." : "A written review of your program against the brief." }),
          el("p", { class: "k-cx-note", text: "What works, two or three specific improvements, and one thing to try next. It never marks or grades, and it is optional: skipping changes nothing about passing." })
        ]));
      }
      if (body.getAttribute("data-err")) mainCol.push(el("p", { class: "k-cx-capfail", role: "status" }, [el("span", { text: body.getAttribute("data-err") })]));
      mainCol.push(el("div", { class: "k-cx-capacts" }, [
        el("button", { type: "button", class: r && r.state === "received" ? "k-btn" : "k-btn k-btn--primary", "data-ui": "code.cap-review-open",
          text: r && r.state === "received" ? "Ask again…" : "Choose what is sent…", onclick: whatIsSent }),
        !r ? el("button", { type: "button", class: "k-btn", "data-ui": "code.cap-review-skip", text: "Skip the review", onclick: function () { C().setReview(id, { state: "skipped" }); say("Review skipped."); go("writeup"); } }) : nextBtn("writeup", "Write-up →")
      ]));
      var src = C().draft("cap:" + id) || spec.starter;
      body.appendChild(grid(mainCol, [sideCard("What is sent", "you choose, each time", [
        el("ul", { class: "k-cx-sentlist k-cx-sentlist--quiet" }, [
          ["✓", "Program.cs · " + src.split("\n").length + " lines"], ["✓", "The rubric, as marked"], ["✓", "The brief"], ["○", "Your write-up, if you tick it"]
        ].map(function (x) { return el("li", {}, [el("span", { class: "k-cx-sent-m", "aria-hidden": "true", text: x[0] }), x[1]]); })),
        el("p", { class: "k-cx-note", text: "One Assistant request. Nothing else from the app is sent, and nothing is sent until you press Send." })
      ])]));
    }
    function whatIsSent() {
      var src = C().draft("cap:" + id) || spec.starter;
      var items = [
        { id: "code", label: "Program.cs", sub: src.split("\n").length + " lines", on: true },
        { id: "rubric", label: "The rubric, as marked", on: true },
        { id: "brief", label: "The brief", on: true },
        { id: "writeup", label: "Your write-up", on: false, off: !v.writeup.words }
      ];
      var overlay = el("div", { class: "k-dialog-overlay" });
      var sum = el("p", { class: "k-cx-note", "data-ui": "code.cap-sent-sum" });
      var send = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "code.cap-send", text: "Send for review", onclick: function () { overlay.remove(); requestReview(items, src); } });
      var cancel = el("button", { type: "button", class: "k-btn", "data-ui": "ui.dialog-close", text: "Cancel", onclick: function () { overlay.remove(); } });
      function summary() {
        var picked = items.filter(function (x) { return x.on && !x.off; });
        sum.textContent = (items[0].on ? "1 file · " + items[0].sub : "No code") + " · " + picked.length + " item" + (picked.length === 1 ? "" : "s") + " · 1 Assistant request. Nothing else from the app is sent.";
        send.disabled = !items[0].on;
      }
      overlay.appendChild(el("div", { class: "k-dialog k-cx-sent", "data-ui": "ui.dialog code.cap-sent" }, [
        el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "What is sent to Kurenai" })]),
        el("div", { class: "k-dialog-body" }, [
          el("p", { class: "k-cx-note", text: "Only what you tick, once, for a written review." }),
          el("ul", { class: "k-cx-sentlist" }, items.map(function (x) {
            var cb = el("input", { type: "checkbox", class: "k-box", disabled: x.off ? "" : null, onchange: function () { x.on = cb.checked; summary(); } });
            cb.checked = x.on && !x.off;
            return el("li", {}, [el("label", { class: "k-cx-sentitem" }, [cb, el("span", { text: x.label }), x.sub ? el("small", { class: "k-muted", text: " · " + x.sub }) : null].filter(Boolean))]);
          })),
          sum
        ]),
        el("div", { class: "k-dialog-foot" }, [cancel, send])
      ]));
      summary();
      KOS.ui.openDialog(overlay, { label: "What is sent to Kurenai", initialFocus: cancel });
    }
    function requestReview(items, src) {
      if (!KOS.ai || !KOS.ai.chat) { body.setAttribute("data-err", "Kurenai isn't connected, so the review can be skipped; the result will say “no review”."); draw(); return; }
      var on = {}; items.forEach(function (x) { on[x.id] = x.on && !x.off; });
      var parts = [];
      if (on.brief) parts.push("THE BRIEF\n" + briefText());
      if (on.code) parts.push("PROGRAM.CS\n" + src);
      if (on.rubric) parts.push("THE RUBRIC AS MARKED\n" + C().rubricView(id).rows.map(function (r) { return r.title + ": " + (r.value == null ? "not marked" : r.value + "/" + r.max); }).join("\n"));
      if (on.writeup) parts.push("THE WRITE-UP\n" + v.writeup.text);
      body.removeAttribute("data-err");
      var sentList = Object.keys(on).filter(function (k) { return on[k]; });
      reviewReq = KOS.ai.chat("tutor", {
        system: "You are Kurenai, the study companion in KurenaiOS, reviewing a student's C# capstone (" + (STAGE_WORDS[spec.stage] || "stage " + spec.stage) + "). " +
          "Write a short review in British English: what works, two or three specific improvements with line-level pointers, and one thing to try next. Plain prose in short paragraphs, no headings, no code longer than a line, no marks or grades.",
        messages: [{ role: "user", content: parts.join("\n\n") }],
        temperature: 0.4, maxTokens: 900
      }, function (err, res) {
        if (!reviewReq) return;            // cancelled: a late reply is ignored
        reviewReq = null;
        var text = !err && res && String(res.text || "").trim();
        if (!text) { body.setAttribute("data-err", "Kurenai couldn't review it this time. Try again, or skip the review."); v = C().capView(id); if (stepNow === "review") draw(); return; }
        C().setReview(id, { state: "received", text: text, sent: sentList });
        say("Kurenai's review is ready.");
        v = C().capView(id); if (stepNow === "review") draw(); else drawSteps();
      });
      draw();
    }
    function briefText() {
      var tmp = el("div", { html: KOS.content.renderBlocks(spec.brief) });
      return tmp.textContent.replace(/\s+\n/g, "\n").trim();
    }

    /* ⑤ the write-up: the text, and beside it the prompts and the facts */
    function stepWriteup() {
      var min = spec.writeupMin || 40;
      var ta = el("textarea", { class: "k-input k-cx-capwrite", "data-ui": "code.cap-writeup", rows: "10", "aria-label": "Your write-up", placeholder: "How you built it, what was hard, what you would change…" });
      ta.value = v.writeup.text;
      var count = el("p", { class: "k-cx-capwords", "data-ui": "code.cap-words", "aria-live": "polite" });
      function paint() { var n = C().words(ta.value); count.textContent = plural(n, "word") + (n < min ? " · " + (min - n) + " more to go" : " · enough"); KOS.ui.state(count, "enough", n >= min); }
      var save = KOS.ui.debounce(function () { C().setWriteup(id, ta.value); v = C().capView(id); drawSteps(); }, 500);
      ta.addEventListener("input", function () { paint(); save(); });
      paint();
      body.appendChild(grid([ta, el("div", { class: "k-cx-capacts" }, [count, nextBtn("result", "Result →")])], [
        sideCard("Prompts", "at least " + min + " words", [el("ul", { class: "k-cx-capprompts" }, (spec.writeupPrompts || []).map(function (p) { return el("li", { text: p }); }))]),
        sideCard("To mention", null, [el("dl", { class: "k-cx-capmini-facts" }, [
          ["Tests", v.build.pass + " / " + v.build.total], ["Milestones", v.build.done + " / " + v.build.milestones.length], ["Rubric", v.rubric.marked ? v.rubric.total + " / " + v.rubric.max : "not marked"]
        ].map(function (f) { return el("div", {}, [el("dt", { text: f[0] }), el("dd", { class: "k-mono", text: f[1] })]); }))])
      ]));
    }

    /* ⑥ the result */
    function stepResult() {
      v = C().capView(id);
      var rb = v.rubric;
      var head;
      if (v.passAt) {
        head = el("div", { class: "k-cx-capresult", "data-ui": "code.cap-passed", "data-state": "passed" }, [
          el("div", {}, [el("p", { class: "k-cx-capresult-h", text: "✓ Capstone passed" }),
            el("p", { class: "k-cx-note", text: (nextStage ? (nextStage.bridge ? "Bridge " + nextStage.id : "Stage " + nextStage.id) + " is now recommended. It was never locked." : "The core path is complete.") + " Passed " + dateLabel(v.passAt) + "." })]),
          v.paid && spec.reward ? el("p", { class: "k-cx-reward", "data-ui": "code.cap-reward", text: "◆ +" + spec.reward.xp + " XP · +" + spec.reward.gold + " gold · +" + spec.reward.hp + " HP · once only" }) : null
        ].filter(Boolean));
      } else {
        head = el("div", { class: "k-cx-capresult", "data-state": v.ready ? "ready" : "notyet" }, [
          el("div", {}, [el("p", { class: "k-cx-capresult-h", text: v.ready ? "Ready to submit" : "Not yet" }),
            v.missing.length ? el("ul", { class: "k-cx-capleft", "data-ui": "code.cap-missing" }, v.missing.map(function (m) {
              return el("li", {}, [el("button", { type: "button", class: "k-link", text: m.text.charAt(0).toUpperCase() + m.text.slice(1), onclick: function () { go(m.step); } })]);
            })) : el("p", { class: "k-cx-note", text: "Every milestone passes, the rubric is marked and the write-up is long enough." })]),
          el("div", { class: "k-cx-capresult-act" }, [
            el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.cap-submit", text: "Submit capstone",
              disabled: v.ready ? null : "", onclick: function () {
                var o = C().submitCapstone(id);
                if (!o || !o.passed) { say("Not yet."); draw(); return; }
                if (o.paid !== false && KOS.codeGit) KOS.codeGit.queueCapstone(id);
                say("Capstone passed." + (nextStage && !nextStage.bridge ? " Stage " + nextStage.id + " is now recommended." : ""));
                KOS.refreshRailCounters && KOS.refreshRailCounters();
                draw();
              } }),
            spec.reward ? el("span", { class: "k-cx-note", text: "Pays +" + spec.reward.xp + " XP · +" + spec.reward.gold + " gold · +" + spec.reward.hp + " HP, once." }) : null
          ].filter(Boolean))
        ]);
      }
      body.appendChild(head);
      body.appendChild(el("dl", { class: "k-cx-capfacts", "data-ui": "code.cap-facts" }, [
        ["Rubric", rb.marked ? rb.total + " / " + rb.max : "not marked yet"],
        ["Acceptance tests", v.build.pass + " / " + v.build.total],
        ["Evidence", "✓ In-app"],
        ["Kurenai review", v.review && v.review.state === "received" ? "read " + dateLabel(v.review.at) : "no review"],
        ["Write-up", plural(v.writeup.words, "word")],
        ["Quiz", v.quiz ? v.quiz.score + " / " + v.quiz.total : "not taken"]
      ].map(function (f) { return el("div", { class: "k-cx-capfact" }, [el("dt", { text: f[0] }), el("dd", { text: f[1] })]); })));
    }

    draw();
  }

  KOS.codeCapstone = { page: page };
})();
