/* Kurenai OS — modules/codecap.js
   Code · a capstone checkpoint (roadmap 5.3, frame 26l): `#/code/capstone/<id>`.

   A seven-step stepper — Closed-book quiz · Brief · Build · Rubric ·
   Kurenai review · Write-up · Result — every step open at any time (the
   quiz never locks the capstone; under 3 of 5 it recommends two lessons
   first). The Build is the editor against the milestones' acceptance
   tests; the rubric's correctness row fills itself from them. The review
   sends only what is ticked in "What is sent", once, and can be skipped.
   The Result submits: it passes when every milestone passes, the rubric
   is marked and the write-up is long enough, and pays once ever
   (KOS.code.submitCapstone, invariant 106).

   Drawing writes nothing (smoke76); the step shown is per device
   (state.ui.code.capStep), written only by a click.                      */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el;
  var SID = "code";
  function C() { return KOS.code; }
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  function plural(n, one, many) { return KOS.ui.num(n) + " " + (n === 1 ? one : (many || one + "s")); }
  function dateLabel(ts) { return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" }); }
  function capNo(id) { return String(id).slice(1); }

  function page(main, id) {
    var v = C().capView(id);
    if (!v) { KOS.show("code", { page: "map" }); return; }
    var spec = v.spec, ui = C().ui();
    var stepNow = (ui.capStep && ui.capStep[id]) || (v.passAt ? "result" : v.quiz ? "brief" : "quiz");
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
      var ids = C().CAP_STEPS.map(function (s) { return s[0]; }), i = ids.indexOf(stepNow) + (e.key === "ArrowRight" ? 1 : -1);
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
      var title = (C().CAP_STEPS.filter(function (s) { return s[0] === stepNow; })[0] || [])[1];
      body.setAttribute("aria-label", title || "");
      ({ quiz: stepQuiz, brief: stepBrief, build: stepBuild, rubric: stepRubric, review: stepReview, writeup: stepWriteup, result: stepResult }[stepNow] || stepQuiz)();
    }
    function nextBtn(step, text) {
      return el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.cap-next", text: text, onclick: function () { go(step); } });
    }
    function head(h, sub) { return el("div", { class: "k-cx-caphead" }, [el("h2", { class: "k-cx-caph", text: h }), sub ? el("p", { class: "k-cx-note", text: sub }) : null].filter(Boolean)); }
    function lessonLink(ref) {
      var L = C().lesson(ref);
      return el("button", { type: "button", class: "k-link", text: "Lesson " + ref + (L ? " " + L.title : ""), onclick: function () { KOS.show("ref", { subject: SID, ref: ref }); } });
    }

    /* ① the closed-book quiz */
    function stepQuiz() {
      var q = v.quiz, retake = !q || body.getAttribute("data-retake") === "1";
      body.appendChild(head("Closed-book quiz", "Five questions from stage 1, without the notes. It checks you are ready; it never locks the capstone."));
      if (q && !retake) {
        body.appendChild(el("p", { class: "k-cx-capscore", "data-ui": "code.cap-quiz-score" }, [el("b", { class: "k-mono", text: q.score + " / " + q.total }), " · the brief is open"]));
        if (q.missed.length) body.appendChild(el("ul", { class: "k-cx-capmiss" }, q.missed.map(function (i) {
          var qq = spec.quiz[i];
          return el("li", {}, [el("span", { text: "Missed: " + qq.why + " " }), lessonLink(qq.lesson)]);
        })));
        if (q.recommend.length) body.appendChild(el("aside", { class: "k-callout", "data-kind": "tip", "data-ui": "code.cap-recommend" }, [
          el("div", { class: "k-callout-head" }, ["Recommended first"]),
          el("p", {}, ["Under 3 of 5: ", el("span", {}, q.recommend.map(function (r, i) { return el("span", {}, [i ? " and " : "", lessonLink(r)]); })), " first. The capstone stays open."])
        ]));
        body.appendChild(el("div", { class: "k-cx-capacts" }, [nextBtn("brief", "Open the brief →"),
          el("button", { type: "button", class: "k-btn", "data-ui": "code.cap-retake", text: "Take it again", onclick: function () { body.innerHTML = ""; body.setAttribute("data-retake", "1"); stepQuiz(); } })]));
        return;
      }
      var picks = [];
      var form = el("form", { class: "k-cx-capquiz", "data-ui": "code.cap-quiz", onsubmit: function (e) {
        e.preventDefault();
        if (picks.filter(function (x) { return x != null; }).length < spec.quiz.length) { say("Answer all " + spec.quiz.length + " questions first."); return; }
        body.removeAttribute("data-retake");
        var r = C().answerQuiz(id, picks);
        say("Quiz: " + r.score + " of " + r.total + ". The brief is open.");
        draw();
      } });
      spec.quiz.forEach(function (qq, i) {
        var fs = el("fieldset", { class: "k-cx-capq" }, [el("legend", { class: "k-cx-capq-l", html: (i + 1) + ". " + KOS.content.inline(qq.q) })]);
        qq.opts.forEach(function (o, j) {
          var inp = el("input", { type: "radio", class: "k-radio", name: "cap-q" + i, value: String(j), onchange: function () { picks[i] = j; } });
          fs.appendChild(el("label", { class: "k-cx-capopt" }, [inp, el("span", { html: KOS.content.inline(o) })]));
        });
        form.appendChild(fs);
      });
      form.appendChild(el("div", { class: "k-cx-capacts" }, [
        el("button", { type: "submit", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.cap-quiz-check", text: "Check my answers" }),
        el("button", { type: "button", class: "k-btn", text: "Skip to the brief", onclick: function () { go("brief"); } })
      ]));
      body.appendChild(form);
    }

    /* ② the brief */
    function stepBrief() {
      body.appendChild(head("Brief", "What to build, in " + plural(spec.milestones.length, "milestone") + ". About " + Math.round(spec.minutes / 60) + " hours, over as many sittings as you like."));
      body.appendChild(el("div", { class: "k-prose k-cx-capbrief", "data-ui": "code.cap-brief", html: KOS.content.renderBlocks(spec.brief) }));
      body.appendChild(el("h3", { class: "k-cx-caph3", text: "Milestones" }));
      body.appendChild(el("ol", { class: "k-cx-capms" }, spec.milestones.map(function (m) {
        var ex = m.cases.filter(function (c) { return !c.hidden; })[0], hid = m.cases.filter(function (c) { return c.hidden; }).length;
        return el("li", { class: "k-cx-capm" }, [
          el("b", { text: m.title }), el("span", { class: "k-muted", text: " · " + m.about }),
          ex ? el("div", { class: "k-cx-ex" }, [
            el("div", {}, [el("span", { class: "k-cx-ex-k", text: "Input" }), el("pre", { class: "k-mono", text: ex.stdin || "(none)" })]),
            el("div", {}, [el("span", { class: "k-cx-ex-k", text: "Output" }), el("pre", { class: "k-mono", text: ex.out })])
          ]) : null,
          hid ? el("span", { class: "k-cx-note", text: "+ " + plural(hid, "hidden case") }) : null
        ].filter(Boolean));
      })));
      body.appendChild(el("div", { class: "k-cx-capacts" }, [nextBtn("build", "Start building →")]));
    }

    /* ③ the build: the editor against the acceptance tests */
    function stepBuild() {
      var b = v.build;
      body.appendChild(head("Build", b.done + " of " + b.milestones.length + " milestones pass · " + b.pass + " of " + b.total + " acceptance cases"));
      if (phone) {
        body.appendChild(el("section", { class: "k-card k-cx-phonelater", "data-ui": "code.best-on-computer" }, [
          el("span", { class: "k-cx-chip", "data-tone": "amber", text: "Best on a computer" }),
          el("p", { class: "k-cx-note", text: "The build needs a wide editor. The quiz, rubric and result work here." })]));
        body.appendChild(msList(null));
        return;
      }
      var key = "cap:" + id;
      var initial = C().draft(key);
      var ed = KOS.codeUI.editor({ value: initial != null ? initial : spec.starter, file: "Program.cs", label: "Your capstone", minLines: 22,
        onRun: doRun, onChange: KOS.ui.debounce(function (val) { C().setDraft(key, val === spec.starter ? null : val); }, 400) });
      var stdin = el("textarea", { class: "k-input k-cx-capstdin k-mono", "data-ui": "code.cap-stdin", rows: "4", spellcheck: "false", autocapitalize: "off",
        "aria-label": "Commands for Run, one per line" });
      stdin.value = (spec.milestones[0].cases[0] || {}).stdin || "";
      var out = el("div", { class: "k-cx-outbody", "data-ui": "code.cap-output" }, [el("p", { class: "k-cx-note", text: "Run plays your program with the commands on the left, one per line." })]);
      var runBtn = el("button", { type: "button", class: "k-btn", "data-ui": "code.run", text: "▶ Run", onclick: doRun });
      var allBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.cap-test-all",
        text: "✓ Run every acceptance test", onclick: function () { testFrom(0); } });
      resPanel = el("div", { class: "k-cx-capres", "data-ui": "code.cap-results" }, [el("p", { class: "k-cx-note", text: "Acceptance results appear here: run one milestone, or all of them." })]);
      body.appendChild(el("div", { class: "k-cx-capbuild" }, [
        el("div", { class: "k-cx-capcode" }, [ed.el,
          el("div", { class: "k-cx-caprun" }, [el("div", { class: "k-cx-caprun-in" }, [el("label", { class: "k-kicker", text: "Commands" }), stdin, runBtn]),
            el("div", { class: "k-cx-caprun-out" }, [el("span", { class: "k-kicker", text: "Output" }), out])]),
          resPanel]),
        el("div", { class: "k-cx-capside" }, [el("div", { class: "k-cx-capside-h" }, [el("span", { class: "k-kicker", text: "Acceptance tests" }), allBtn]), msList(ed)])
      ]));
      function doRun() {
        runBtn.disabled = true; ed.running(true);
        KOS.codeRun.run({ files: ed.files(), stdin: stdin.value }).then(function (r) {
          runBtn.disabled = false; ed.running(false);
          out.innerHTML = "";
          if (r.stdout) out.appendChild(el("pre", { class: "k-cx-out-pre k-mono", "data-ui": "code.stdout", text: r.stdout.replace(/\n$/, "") }));
          if (r.ok) { ed.state("ready", "Ran"); if (!r.stdout) out.appendChild(el("p", { class: "k-cx-note", text: "(no output)" })); say("Ran. " + (KOS.codeRun.firstLine(r.stdout) || "No output") + "."); }
          else {
            ed.state(r.error.kind === "compile" ? "compile" : r.error.kind === "timeout" ? "timeout" : "exception");
            if (r.error.line) ed.mark(r.error.line, KOS.codeUI.quoted(r.error.msg));
            out.appendChild(KOS.codeUI.errorCard(r.error));
            say(r.error.kind === "compile" ? "Compile error " + r.error.code + " on line " + r.error.line + "." : "Stopped: " + r.error.code + ".");
          }
        });
      }
      var running = false;
      /* every milestone in turn; the panel keeps the first that fails */
      var firstFail = null;
      function testFrom(i) {
        if (running && i === 0) return;
        if (i === 0) firstFail = null;
        var ms = spec.milestones;
        if (i >= ms.length) {
          running = false; allBtn.disabled = false; v = C().capView(id); drawSteps(); refreshHead();
          if (firstFail) { showResults(firstFail[0], firstFail[1]); ed.state("fail", "Milestone " + (ms.indexOf(firstFail[0]) + 1) + " failing"); }
          else ed.state("pass", "Every acceptance test passes");
          return;
        }
        running = true; allBtn.disabled = true;
        runMilestone(ms[i], ed).then(function (c) {
          if (!c.passed && !firstFail) firstFail = [ms[i], c];
          if (c.compile) { running = false; allBtn.disabled = false; drawSteps(); refreshHead(); return; }
          testFrom(i + 1);
        });
      }
      function refreshHead() {
        var bb = C().buildView(id), h = body.querySelector(".k-cx-caphead .k-cx-note");
        if (h) h.textContent = bb.done + " of " + bb.milestones.length + " milestones pass · " + bb.pass + " of " + bb.total + " acceptance cases";
        if (bb.all) say("Every acceptance test passes. The rubric is next.");
      }
    }
    var resPanel = null;
    function showResults(m, c) {
      if (!resPanel) return;
      var t = "Milestone " + (spec.milestones.indexOf(m) + 1) + " · " + m.title;
      resPanel.innerHTML = "";
      resPanel.appendChild(c ? KOS.codeUI.results(c, { title: t }) : KOS.codeUI.results(null, { running: true, total: m.cases.length, cases: m.cases, title: t }));
    }
    /* the milestones, each with its last result and its own Run tests */
    function msList(ed) {
      var b = C().buildView(id);
      var list = el("ol", { class: "k-cx-capms", "data-ui": "code.cap-milestones" });
      spec.milestones.forEach(function (m, i) {
        var mv = b.milestones[i];
        var badge = el("span", { class: "k-cx-pill", "data-ui": "code.cap-m-badge", "data-tone": mv.done ? "pass" : mv.run ? "fail" : "muted",
          text: mv.done ? "✓ " + mv.pass + " / " + mv.total : mv.run ? mv.pass + " / " + mv.total : "Not run" });
        var btn = ed ? el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "code.cap-test", text: "Run tests", onclick: function () { runMilestone(m, ed); } }) : null;
        list.appendChild(el("li", { class: "k-cx-capm", "data-mid": m.id, "data-state": mv.done ? "pass" : mv.run ? "fail" : null }, [
          el("div", { class: "k-cx-capm-h" }, [el("span", { class: "k-mono k-cx-capm-n", text: String(i + 1) }), el("b", { text: m.title }), badge, btn].filter(Boolean)),
          el("p", { class: "k-cx-note", text: m.about })
        ]));
      });
      return list;
    }
    function runMilestone(m, ed) {
      var li = body.querySelector('[data-mid="' + m.id + '"]');
      var badge = li && li.querySelector("[data-ui~='code.cap-m-badge']");
      var spec1 = { mode: "program", cases: m.cases };
      showResults(m, null);
      ed.running(true);
      return KOS.codeRun.check(spec1, ed.files()).then(function (c) {
        ed.running(false);
        C().recordMilestone(id, m.id, c.compile ? 0 : c.pass, c.total);
        showResults(m, c);
        var ok = c.passed;
        if (badge) { badge.textContent = ok ? "✓ " + c.pass + " / " + c.total : (c.compile ? 0 : c.pass) + " / " + c.total; badge.setAttribute("data-tone", ok ? "pass" : "fail"); }
        if (li) li.setAttribute("data-state", ok ? "pass" : "fail");
        if (c.compile) { ed.state("compile"); if (c.compile.line) ed.mark(c.compile.line, KOS.codeUI.quoted(c.compile.msg)); say("Compile error " + c.compile.code + " on line " + c.compile.line + "."); }
        else { ed.state(ok ? "pass" : "fail", "Milestone " + (spec.milestones.indexOf(m) + 1) + (ok ? " passes" : " · " + c.pass + " of " + c.total)); if (ok) ed.mark(0); say(m.title + ": " + c.pass + " of " + c.total + " pass."); }
        v = C().capView(id); drawSteps();
        return c;
      });
    }

    /* ④ the rubric */
    function stepRubric() {
      var rb = C().rubricView(id);
      body.appendChild(head("Rubric", "Correctness fills itself from the acceptance tests and cannot be edited. Mark the rest honestly; it is for you."));
      var tbl = el("div", { class: "k-cx-rubric", role: "table", "aria-label": "Rubric", "data-ui": "code.cap-rubric" });
      rb.rows.forEach(function (r) {
        var cell;
        if (r.auto) cell = el("b", { class: "k-mono", "data-ui": "code.cap-rubric-auto", text: r.value + " / " + r.max });
        else {
          var grp = el("div", { class: "k-seg k-seg--quiet k-cx-rubseg", role: "radiogroup", "aria-label": r.title });
          for (var n = 0; n <= r.max; n++) (function (n) {
            var on = r.value === n;
            grp.appendChild(el("button", { type: "button", class: "k-seg-item", role: "radio", "aria-checked": String(on), "data-state": on ? "active" : null,
              title: r.guide ? r.guide[n] : null, text: String(n), onclick: function () { C().setRubric(id, r.id, n); say(r.title + ": " + n + " of " + r.max + "."); v = C().capView(id); draw(); } }));
          })(n);
          cell = el("div", { class: "k-cx-rubcell" }, [grp, r.value != null && r.guide ? el("small", { class: "k-muted", text: r.guide[r.value] }) : null].filter(Boolean));
        }
        tbl.appendChild(el("div", { class: "k-cx-rubrow", role: "row" }, [
          el("span", { role: "cell", class: "k-cx-rub-t", text: r.title }),
          el("span", { role: "cell", class: "k-cx-rub-k", text: r.auto ? "Automatic" : "Self-marked" }),
          el("span", { role: "cell", class: "k-cx-rub-v" }, [cell])
        ]));
      });
      tbl.appendChild(el("div", { class: "k-cx-rubrow k-cx-rubrow--total", role: "row" }, [
        el("span", { role: "cell", class: "k-cx-rub-t", text: "Total" }), el("span", { role: "cell" }),
        el("span", { role: "cell", class: "k-cx-rub-v" }, [el("b", { class: "k-mono", "data-ui": "code.cap-rubric-total", text: rb.total + " / " + rb.max })])
      ]));
      body.appendChild(tbl);
      if (!v.build.all) body.appendChild(el("p", { class: "k-cx-note", text: "Acceptance tests still failing: correctness shows its score, and the step stays open until they pass." }));
      body.appendChild(el("div", { class: "k-cx-capacts" }, [nextBtn("review", "Kurenai review →")]));
    }

    /* ⑤ the Kurenai review: What is sent, once; skippable */
    var reviewReq = null;
    function stepReview() {
      var r = v.review;
      body.appendChild(head("Kurenai review", "Optional. A written review of your program against the brief, sent only after you choose what goes."));
      if (reviewReq) {
        body.appendChild(el("p", { class: "k-cx-capwait", role: "status", "data-ui": "code.cap-review-sending" }, [
          el("span", { text: "Kurenai is reading your capstone… " }),
          el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", text: "Cancel", onclick: function () { if (KOS.ai && KOS.ai.cancel) KOS.ai.cancel(reviewReq); reviewReq = null; draw(); } })]));
        return;
      }
      if (r && r.state === "received") {
        body.appendChild(el("article", { class: "k-card k-cx-capreview", "data-ui": "code.cap-review" }, [
          el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "◎ Kurenai's review" }), el("span", { class: "k-card-meta", text: "read " + dateLabel(r.at) })]),
          el("div", { class: "k-prose", html: r.text.split(/\n{2,}/).map(function (p) { return "<p>" + KOS.content.inline(p.replace(/\n/g, " ")) + "</p>"; }).join("") })
        ]));
      } else if (r && r.state === "skipped") {
        body.appendChild(el("p", { class: "k-cx-note", "data-ui": "code.cap-review-skipped", text: "Skipped — the result will say “no review”. You can still ask." }));
      }
      if (body.getAttribute("data-err")) body.appendChild(el("p", { class: "k-cx-capfail", role: "status" }, [el("span", { text: body.getAttribute("data-err") })]));
      body.appendChild(el("div", { class: "k-cx-capacts" }, [
        el("button", { type: "button", class: r && r.state === "received" ? "k-btn" : "k-btn k-btn--primary", "data-ui": "code.cap-review-open",
          text: r && r.state === "received" ? "Ask again…" : "Choose what is sent…", onclick: whatIsSent }),
        !r ? el("button", { type: "button", class: "k-btn", "data-ui": "code.cap-review-skip", text: "Skip the review", onclick: function () { C().setReview(id, { state: "skipped" }); say("Review skipped."); go("writeup"); } }) : nextBtn("writeup", "Write-up →")
      ]));
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
      function summary() {
        var picked = items.filter(function (x) { return x.on && !x.off; });
        sum.textContent = (items[0].on ? "1 file · " + items[0].sub : "No code") + " · " + picked.length + " item" + (picked.length === 1 ? "" : "s") + " · 1 Assistant request. Nothing else from the app is sent.";
        send.disabled = !items[0].on;
      }
      var send = el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "code.cap-send", text: "Send for review", onclick: function () { overlay.remove(); requestReview(items, src); } });
      var cancel = el("button", { type: "button", class: "k-btn", "data-ui": "ui.dialog-close", text: "Cancel", onclick: function () { overlay.remove(); } });
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
        system: "You are Kurenai, the study companion in KurenaiOS, reviewing a student's C# capstone (stage 1: variables, decisions, loops, methods, scope; no arrays or classes yet). " +
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

    /* ⑥ the write-up */
    function stepWriteup() {
      var min = spec.writeupMin || 40;
      body.appendChild(head("Write-up", "A few paragraphs for your future self. At least " + min + " words."));
      body.appendChild(el("ul", { class: "k-cx-capprompts" }, (spec.writeupPrompts || []).map(function (p) { return el("li", { text: p }); })));
      var ta = el("textarea", { class: "k-input k-cx-capwrite", "data-ui": "code.cap-writeup", rows: "10", "aria-label": "Your write-up" });
      ta.value = v.writeup.text;
      var count = el("p", { class: "k-cx-note", "data-ui": "code.cap-words", "aria-live": "polite" });
      function paint() { var n = C().words(ta.value); count.textContent = plural(n, "word") + (n < min ? " · " + (min - n) + " more to go" : " · enough"); }
      var save = KOS.ui.debounce(function () { C().setWriteup(id, ta.value); v = C().capView(id); drawSteps(); }, 500);
      ta.addEventListener("input", function () { paint(); save(); });
      paint();
      body.appendChild(ta); body.appendChild(count);
      body.appendChild(el("div", { class: "k-cx-capacts" }, [nextBtn("result", "Result →")]));
    }

    /* ⑦ the result */
    function stepResult() {
      v = C().capView(id);
      var rb = v.rubric;
      if (v.passAt) {
        body.appendChild(el("div", { class: "k-cx-capresult", "data-ui": "code.cap-passed", "data-state": "passed" }, [
          el("p", { class: "k-cx-capresult-h", text: "✓ Capstone passed" }),
          el("p", { class: "k-cx-note", text: nextStage ? (nextStage.bridge ? "Bridge " + nextStage.id : "Stage " + nextStage.id) + " is now recommended. It was never locked." : "The core path is complete." }),
          v.paid && spec.reward ? el("p", { class: "k-cx-reward", "data-ui": "code.cap-reward", text: "◆ +" + spec.reward.xp + " XP · +" + spec.reward.gold + " gold · +" + spec.reward.hp + " HP · once only" }) : null
        ].filter(Boolean)));
      } else {
        body.appendChild(head("Result", v.ready ? "Everything is in place. Submit when you are happy with it." : "Not yet. What is left:"));
        if (v.missing.length) body.appendChild(el("ul", { class: "k-cx-capleft", "data-ui": "code.cap-missing" }, v.missing.map(function (m) {
          return el("li", {}, [el("button", { type: "button", class: "k-link", text: m.text.charAt(0).toUpperCase() + m.text.slice(1), onclick: function () { go(m.step); } })]);
        })));
      }
      body.appendChild(el("dl", { class: "k-cx-capfacts", "data-ui": "code.cap-facts" }, [
        ["Rubric", rb.marked ? rb.total + " / " + rb.max : "not marked yet"],
        ["Acceptance tests", v.build.pass + " / " + v.build.total],
        ["Evidence", "✓ In-app"],
        ["Kurenai review", v.review && v.review.state === "received" ? "read " + dateLabel(v.review.at) : "no review"],
        ["Write-up", plural(v.writeup.words, "word")],
        ["Quiz", v.quiz ? v.quiz.score + " / " + v.quiz.total : "not taken"]
      ].map(function (f) { return el("div", { class: "k-cx-capfact" }, [el("dt", { text: f[0] }), el("dd", { text: f[1] })]); })));
      if (!v.passAt) {
        var sub = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.cap-submit", text: "Submit capstone",
          disabled: v.ready ? null : "", onclick: function () {
            var o = C().submitCapstone(id);
            if (!o || !o.passed) { say("Not yet."); draw(); return; }
            say("Capstone passed." + (nextStage && !nextStage.bridge ? " Stage " + nextStage.id + " is now recommended." : ""));
            KOS.refreshRailCounters && KOS.refreshRailCounters();
            draw();
          } });
        body.appendChild(el("div", { class: "k-cx-capacts" }, [sub, el("span", { class: "k-cx-note", text: spec.reward ? "Pays +" + spec.reward.xp + " XP · +" + spec.reward.gold + " gold · +" + spec.reward.hp + " HP, once." : "" })]));
      }
    }

    draw();
  }

  KOS.codeCapstone = { page: page };
})();
