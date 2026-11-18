/* Kurenai OS — modules/examreview.js · KOS.examReview
   Review (docs/exams-rework-plan.md §7.4, §8; design 47e–47h): what
   happened in an attempt, measured the same way every time, and feedback
   from a model YOU choose, brought back in.

     #/exams/<id>/review                 the latest attempt
     #/exams/<id>/review/a:<uid>         one attempt (a tracker uid)
     #/exams/<id>/review/targets         the targets (47h)
     #/exams/<id>/review/feedback        every import, Claude and Gemini side by side

   The score, the estimated grade (IT units from js/data/it-grades.js
   through KOS.hub.it, invariant 26f; labelled an estimate), marks lost by
   topic, command word and objective, minutes per mark by part against the
   paper's budget, three named flags and the pacing line — from the logged
   attempt (KOS.tracker) and its recorded journal (KOS.attempts.figures).
   No chart without enough evidence (invariant 76); a paper sat on paper
   shows no timing.

   NOTHING IS SENT BY THE APP (§8.3, D2): "Get feedback" copies ONE text
   (KOS.reviewPack.build) and downloads the written pages; "Add feedback"
   reads ONE fenced JSON block from the pasted reply (KOS.reviewPack.parse)
   and stores it only when it fits. No in-app model judges anything.   */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function E() { return KOS.exams; }
  function S() { return KOS.examSession; }
  function U() { return KOS.examUI; }
  function SH() { return KOS.examShell; }
  function btn(t, k, f, x) { return U().btn(t, k, f, x); }
  function announce(t) { U().announce(t); }
  function inline(t) { return KOS.content && KOS.content.inline ? KOS.content.inline(String(t || "")) : KOS.ui.esc(String(t || "")); }
  var NS = "http://www.w3.org/2000/svg";
  /* OCR's performance objectives, read from the command word (the
     essentials chapter's "spot it in the stem"); labelled as read so */
  var PO = { State: "PO1", Identify: "PO1", Define: "PO1", Give: "PO1", Name: "PO1", Complete: "PO1", Describe: "PO1", Outline: "PO1",
    Explain: "PO2", Suggest: "PO2", Analyse: "PO3", Discuss: "PO3", Evaluate: "PO3", Justify: "PO3", Assess: "PO3", Compare: "PO3" };
  var PO_NAME = { PO1: "knowledge", PO2: "apply", PO3: "judge" };

  /* ---------------- the estimated grade ---------------- */
  function grade(a, got, max) {
    var pr = a.preset ? E().preset(a.preset) : null, unit = (a.links && a.links.itUnit) || (pr && pr.itUnit);
    var T = window.KOS_IT_GRADES, H = KOS.hub && KOS.hub.it;
    if (unit && T && H && T.units[unit] && max) {
      var sc = T.units[unit], ums = Math.floor(got * sc.umsMax / max);
      var g = H.gradeFor(ums, T.unitBoundaries);
      var up = T.unitBoundaries.slice().reverse().filter(function (b) { return b.ums > ums; })[0];
      return { grade: g || "Below Pass", next: up ? { grade: up.grade, need: Math.ceil(up.ums * max / sc.umsMax) - got } : null,
        from: "OCR's unit boundaries (Pass 24, Merit 36, Distinction 48 of 60), on a straight line" };
    }
    return null;
  }

  /* ---------------- the page ---------------- */
  function page(content, a, sub) {
    var att = E().attemptsFor(a).filter(function (e) { return e.marks != null || (e.questions || []).some(function (q) { return q.got != null; }); });
    var targets = S().targets(a.id);
    var view = sub === "targets" ? "targets" : sub === "feedback" ? "feedback" : "attempt";
    var cur = view === "attempt" ? (sub && sub.indexOf("a:") === 0 ? att.filter(function (e) { return e.uid === sub.slice(2); })[0] : null) || att[att.length - 1] : null;
    var tabs = KOS.ui.tabs([
      { label: "Attempts", count: att.length, active: view === "attempt", onSelect: function () { KOS.show("exams", { id: a.id, tab: "review" }); } },
      { label: "Targets", count: targets.length, active: view === "targets", onSelect: function () { KOS.show("exams", { id: a.id, tab: "review", sub: "targets" }); } },
      { label: "Feedback", active: view === "feedback", onSelect: function () { KOS.show("exams", { id: a.id, tab: "review", sub: "feedback" }); } }], { variant: "workspace", label: "Review" });
    tabs.setAttribute("data-ui", tabs.getAttribute("data-ui") + " exams.review-tabs");
    if (view === "targets") return targetsView(content, a, targets, tabs);
    if (view === "feedback") return feedbackView(content, a, tabs);
    if (!cur) {
      SH().sectionHead(content, "Review", "no attempt yet", [tabs]);
      content.appendChild(el("div", { class: "k-card k-xs-quietcard", "data-ui": "exams.review-empty" }, [el("span", { text: "Sit a paper, or log a teacher-marked one, to see what happened and where the marks went." }),
        el("span", { class: "k-ex-grow" }), btn("Papers", "primary sm", function () { KOS.show("exams", { id: a.id, tab: "papers" }); }), btn("Log a result", "sm", function () { KOS.trackerLog({ assessmentId: a.id }, function () { KOS.rerender(); }); })]));
      return;
    }
    attemptView(content, a, cur, att, tabs);
  }

  function attemptView(content, a, e, att, tabs) {
    var i = att.indexOf(e), prev = att.slice(0, i).reverse().filter(function (x) { return x.marks != null; })[0];
    var gotN = e.marks != null ? e.marks : (e.questions || []).reduce(function (s, q) { return s + (q.got || 0); }, 0);
    var max = e.max || (e.questions || []).reduce(function (s, q) { return s + (q.max || 0); }, 0) || a.marks || 0;
    var recBox = { rec: null, fig: null };
    var getB = btn("Get feedback on this attempt", "primary sm", function () { getFeedback(a, e, recBox); }, { "data-ui": "exams.get-feedback" });
    SH().sectionHead(content, "Review", [e.paper || "Attempt", U().pretty(e.date), e.timed ? "timed" : "untimed"].filter(Boolean).join(" · "),
      [btn("＋ Add feedback", "sm", function () { addFeedback(a, e, recBox); }, { "data-ui": "exams.add-feedback" }), getB]);
    content.appendChild(el("div", { class: "k-xv-tabsrow" }, [tabs, el("span", { class: "k-ex-grow" }),
      att.length > 1 ? attemptPicker(a, att, e) : null].filter(Boolean)));
    /* the score and where the marks went */
    var g = grade(a, gotN, max), ch = prev && prev.max === max ? gotN - prev.marks : null;
    var score = el("section", { class: "k-card k-xv-score", "data-ui": "exams.review-score" }, [
      el("div", { class: "k-xs-celllabel", text: "Score" }),
      el("div", { class: "k-xv-big" }, [el("b", { class: "k-mono", text: String(gotN) }), U().muted("of " + max)]),
      ch != null ? el("div", { class: "k-ex-inline" }, [el("span", { class: "k-chip", "data-tone": ch > 0 ? "teal" : ch < 0 ? "danger" : "muted", text: (ch > 0 ? "▲ +" : ch < 0 ? "▼ " : "") + ch + " on " + (prev.paper || "the last") }),
        U().muted(prev.marks + " → " + gotN)]) : null,
      g ? el("div", { class: "k-xv-grade", "data-ui": "exams.review-grade" }, [U().muted("Estimated grade"), el("b", { text: g.grade + (g.next ? ", " + g.next.need + " to " + g.next.grade : "") }), U().muted("from " + g.from)]) : null].filter(Boolean));
    var lost = lossCols(a, e);
    var lossCard = el("section", { class: "k-card k-xv-lost", "data-ui": "exams.review-lost" }, [
      el("div", { class: "k-ex-inline" }, [el("b", { text: "Marks lost" }), U().muted((max - gotN) + " of " + max + " · by where they went")]),
      el("div", { class: "k-xv-lostcols" }, lost.map(function (col) {
        var mx = col.rows.reduce(function (m, r) { return Math.max(m, r[1]); }, 1);
        return el("div", { class: "k-xv-lostcol" }, [el("div", { class: "k-xs-celllabel", text: col.title })].concat(col.rows.length ? col.rows.slice(0, 5).map(function (r) {
          return el("div", { class: "k-xv-lostrow" }, [el("span", { class: "k-ex-ell", html: r[0] }), SH().bar(r[1] / mx, "neutral"), el("span", { class: "k-mono", "data-tone": r[1] ? "alarm" : null, text: r[1] ? "-" + r[1] : "0" })]);
        }) : [U().muted(col.empty)]));
      }))]);
    content.appendChild(el("div", { class: "k-xv-top" }, [score, lossCard]));
    /* timing: from the recorded journal */
    var timing = el("div", { class: "k-xv-timing", "data-ui": "exams.review-timing" }, [el("div", { class: "k-card k-xs-quietcard" }, [U().muted("Reading the timing…")])]);
    content.appendChild(timing);
    findRec(a, e, function (rec) {
      recBox.rec = rec;
      timing.textContent = "";
      if (!rec) {
        timing.appendChild(el("div", { class: "k-card k-xs-quietcard", "data-ui": "exams.review-notiming" }, [el("span", { text: e.timed ? "This attempt has no recorded journal: it was logged, not sat in the app, so there is no timing to show." : "Sat on paper: no timing. Sit the next one in the app to see minutes per mark and pacing." })]));
        return;
      }
      var fig = recBox.fig = KOS.attempts.figures(rec);
      drawTiming(timing, a, rec, fig);
      /* targets measured by minutes a mark note what this attempt shows */
      S().targets(a.id).forEach(function (t) { if (t.state === "open" && t.rule && t.rule.type === "mpm") S().noteEvidence(t, rec.uid, fig); });
    });
  }
  function attemptPicker(a, att, e) {
    var sel = el("select", { class: "k-input k-xq-sel", "aria-label": "Attempt", "data-ui": "exams.review-pick", onchange: function () { KOS.show("exams", { id: a.id, tab: "review", sub: "a:" + sel.value }); } },
      att.slice().reverse().map(function (x) { return el("option", { value: x.uid, selected: x === e ? "" : null, text: (x.paper || "Attempt") + " · " + U().pretty(x.date, { dow: false }) + (x.marks != null ? " · " + x.marks + "/" + x.max : "") }); }));
    return sel;
  }
  /* marks lost by topic, command word and objective (or error tag) */
  function lossCols(a, e) {
    var tops = S().topics(a), byT = {}, byC = {}, byO = {}, byTag = {};
    var paper = paperFor(a, e);
    (e.questions || []).forEach(function (q) {
      if (q.got == null || q.max == null) return;
      var l = q.max - q.got;
      var refs = q.refs || [];
      var t = tops.filter(function (x) { return refs.some(function (r) { return x.leaves.indexOf(r) !== -1 || x.leaves.indexOf((e.subject || a.subject) + ":" + r) !== -1; }); })[0];
      var tk = t ? "<b>" + KOS.ui.esc(t.short || t.ref) + "</b> · " + KOS.ui.esc(t.title.split(" ").slice(0, 2).join(" ").toLowerCase()) : "Other";
      byT[tk] = (byT[tk] || 0) + l;
      var pq = paper ? paper.questions.filter(function (x) { return String(x.n) === String(q.q); })[0] : null;
      var cmd = pq && pq.parts && pq.parts[0] ? pq.parts[0].command || S().commandOf(pq.parts[0].q) : null;
      if (cmd) { byC[cmd] = (byC[cmd] || 0) + l; if (PO[cmd]) { var o = PO[cmd] + " · " + PO_NAME[PO[cmd]]; byO[o] = (byO[o] || 0) + l; } }
      (q.tags || []).forEach(function (tg) { var k = KOS.tracker.tagShort(tg); byTag[k] = (byTag[k] || 0) + l / q.tags.length; });
    });
    function rows(m) { return Object.keys(m).map(function (k) { return [k, Math.round(m[k])]; }).filter(function (r) { return r[1] > 0; }).sort(function (x, y) { return y[1] - x[1]; }); }
    var ocr = (a.board || "") === "OCR";
    return [{ title: "Topic", rows: rows(byT), empty: "Marked by question to see this" },
      { title: "Command word", rows: rows(byC).map(function (r) { return [KOS.ui.esc(r[0]), r[1]]; }), empty: "Board-style papers carry it" },
      ocr && Object.keys(byO).length ? { title: "Objective", rows: rows(byO).map(function (r) { return [KOS.ui.esc(r[0]), r[1]]; }), empty: "" }
        : { title: "Error type", rows: rows(byTag).map(function (r) { return [KOS.ui.esc(r[0]), r[1]]; }), empty: "Tag lost marks to see this" }];
  }
  function paperFor(a, e) {
    var ref = e.source && e.source.ref ? String(e.source.ref) : "";
    var m = /:(\d+)$/.exec(ref);
    if (!m || !KOS.examPaper) return null;
    try { var p = KOS.examPaper.build(a, +m[1]); return p && p.questions ? p : null; } catch (x) { return null; }
  }
  function findRec(a, e, cb) {
    if (!KOS.attempts) { cb(null); return; }
    KOS.attempts.list({ aid: a.id }, function (err, recs) {
      if (err) { cb(null); return; }
      cb((recs || []).filter(function (r) { return r.tracker === e.uid; })[0] || null);
    });
  }
  function svg(tag, attrs, kids) {
    var n = document.createElementNS(NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function drawTiming(host, a, rec, fig) {
    var parts = fig.parts.filter(function (p) { return p.marks && p.timeMs > 0; });
    var budget = fig.budget || (a.durationMins && a.marks ? a.durationMins / a.marks : 1.5);
    var left = el("section", { class: "k-card k-xv-mpm", "data-ui": "exams.review-mpm" }, [el("div", { class: "k-ex-inline" }, [el("b", { text: "Minutes per mark" }),
      U().muted("by part · budget " + (Math.round(budget * 10) / 10) + " · " + parts.length + " parts, " + Math.round(fig.activeMs / 60000) + " min")])]);
    if (parts.length < 3) left.appendChild(U().muted("Shows once three parts have been timed."));
    else {
      var W = 560, H = 150, pad = 24, mx = Math.max(3, budget * 2, parts.reduce(function (m, p) { return Math.max(m, p.timeMs / 60000 / p.marks); }, 0));
      var bw = (W - pad) / parts.length;
      var y = function (v) { return H - 18 - (H - 30) * Math.min(1, v / mx); };
      var bars = parts.map(function (p, j) {
        var v = p.timeMs / 60000 / p.marks;
        return svg("g", {}, [svg("rect", { x: pad + j * bw + bw * 0.15, y: y(v), width: bw * 0.7, height: H - 18 - y(v), rx: 2, class: v > 2 ? "k-xv-bar-over" : "k-xv-bar" }),
          (function () { var t = svg("text", { x: pad + j * bw + bw / 2, y: H - 4, "text-anchor": "middle", class: "k-xv-axis" }); t.textContent = p.label || p.id; return t; })()]);
      });
      var line = svg("line", { x1: pad, x2: W, y1: y(budget), y2: y(budget), class: "k-xv-budget" });
      var lab = svg("text", { x: 0, y: y(budget) + 4, class: "k-xv-axis" }); lab.textContent = String(Math.round(budget * 10) / 10);
      left.appendChild(svg("svg", { viewBox: "0 0 " + W + " " + H, class: "k-xv-chart", role: "img", "aria-label": parts.map(function (p) { return (p.label || p.id) + " " + (Math.round(p.timeMs / 600 / p.marks) / 100) + " min a mark"; }).join(", ") }, [line, lab].concat(bars)));
      left.appendChild(el("div", { class: "k-ex-inline k-ex-small" }, [el("span", { class: "k-xv-key", "data-tone": "alarm" }), U().muted("over 2 min a mark"), el("span", { class: "k-xv-key", "data-tone": "budget" }), U().muted("budget")]));
      /* three named flags, each with its evidence */
      var slow = parts.slice().sort(function (p, q) { return q.timeMs / q.marks - p.timeMs / p.marks; })[0];
      var hes = parts.filter(function (p) { return p.firstMarkMs != null; }).sort(function (p, q) { return q.firstMarkMs - p.firstMarkMs; })[0];
      var era = parts.slice().sort(function (p, q) { return (q.erasures + q.undos) - (p.erasures + p.undos); })[0];
      var flags = [];
      if (slow && slow.timeMs / 60000 / slow.marks > budget * 1.25) flags.push(["▲", (slow.label || slow.id) + ": " + Math.round(slow.timeMs / 60000) + " min for " + slow.marks + (slow.marks === 1 ? " mark" : " marks"), (slow.got != null ? "Got " + slow.got + " of " + slow.marks + " · " : "") + (Math.round(slow.timeMs / 6000 / slow.marks) / 10) + " min a mark"]);
      if (hes && hes.firstMarkMs > 60000) flags.push(["◷", (hes.label || hes.id) + ": " + Math.round(hes.firstMarkMs / 60000) + " min before the first mark", "Then " + Math.round(Math.max(0, hes.timeMs - hes.firstMarkMs) / 60000) + " min writing"]);
      if (era && era.erasures + era.undos >= 5) flags.push(["⌫", (era.label || era.id) + ": " + (era.erasures + era.undos) + " erasures", era.got != null ? era.got + " of " + era.marks : ""]);
      if (flags.length) left.appendChild(el("div", { class: "k-xv-flags", "data-ui": "exams.review-flags" }, flags.map(function (f) {
        return el("div", { class: "k-xv-flag" }, [el("span", { class: "k-xv-flagg", "aria-hidden": "true", text: f[0] }), el("div", {}, [el("b", { text: f[1] }), U().muted(f[2])])]);
      })));
    }
    /* the pacing line against the ideal */
    var right = el("section", { class: "k-card k-xv-pace", "data-ui": "exams.review-pace" }, [el("div", { class: "k-ex-inline" }, [el("b", { text: "Pacing" }), U().muted("marks gathered against time")])]);
    var pace = fig.pace || [];
    if (pace.length < 3) right.appendChild(U().muted("Shows once three parts are done."));
    else {
      var W2 = 300, H2 = 150, maxT = Math.max(pace[pace.length - 1][0], (rec.allowedMs || 0) / 60000), maxM = fig.maxMarks || pace[pace.length - 1][1];
      var px = function (t) { return 12 + (W2 - 20) * t / maxT; }, py = function (m) { return H2 - 14 - (H2 - 24) * m / maxM; };
      var you = svg("polyline", { points: [[0, 0]].concat(pace).map(function (q) { return px(q[0]) + "," + py(q[1]); }).join(" "), class: "k-xv-you" });
      var ideal = svg("line", { x1: px(0), y1: py(0), x2: px(Math.min(maxT, maxM * budget)), y2: py(Math.min(maxM, maxT / budget)), class: "k-xv-ideal" });
      right.appendChild(svg("svg", { viewBox: "0 0 " + W2 + " " + H2, class: "k-xv-chart", role: "img", "aria-label": "Marks covered against minutes: " + pace.map(function (q) { return q[1] + " by " + q[0] + " min"; }).join(", ") }, [ideal, you]));
      right.appendChild(el("div", { class: "k-ex-inline k-ex-small" }, [el("span", { class: "k-xv-key", "data-tone": "you" }), U().muted("you"), el("span", { class: "k-xv-key", "data-tone": "budget" }), U().muted("ideal")]));
      var over = fig.overrunMs ? Math.round(fig.overrunMs / 60000) : 0;
      right.appendChild(el("p", { class: "k-xv-pacesum", text: over ? "Finished " + over + " min over the time allowed." : fig.timeLeftMs != null ? Math.round(fig.timeLeftMs / 60000) + " min left at the end." : "" }));
    }
    host.appendChild(el("div", { class: "k-xv-two" }, [left, right]));
  }

  /* ---------------- Get feedback (47f) ---------------- */
  function packParts(a, e, rec) {
    var paper = paperFor(a, e);
    var T = (KOS.store.state.ui.examTyped || {})[rec.uid] || {};
    return (rec.parts || []).map(function (p) {
      var pq = paper ? paper.questions.filter(function (x) { return String(x.n) === String(p.id); })[0] : null;
      var typed = Object.keys(T).filter(function (k) { return k.split("|")[0] === String(p.id) && String(T[k]).trim(); }).map(function (k) { return k.split("|")[1] + " " + T[k]; }).join("\n");
      if (!pq) return { id: p.id, typed: typed || null };
      return { id: p.id, question: [pq.stem || pq.ctx || ""].concat(pq.parts.map(function (x) { return (x.label || "") + " " + x.q + " [" + x.marks + "]"; })).filter(Boolean).join("\n"),
        scheme: [].concat.apply([], pq.parts.map(function (x) { return (x.ms || []).map(function (l) { return (x.label || "") + " " + l; }); })),
        levels: [].concat.apply([], pq.parts.map(function (x) { return x.levels || []; })), typed: typed || null };
    });
  }
  function getFeedback(a, e, box) {
    var rec = box.rec;
    var body = el("div", { class: "k-xv-dlg", "data-ui": "exams.feedback-get" });
    if (!rec) {
      body.appendChild(el("p", { class: "k-ex-muted", text: "Feedback needs a recorded attempt: a paper sat in the app. This one was logged, so there are no timings or written pages to send." }));
    } else {
      var fig = box.fig || KOS.attempts.figures(rec), paper = paperFor(a, e);
      var text = KOS.reviewPack.build({ rec: rec, figures: fig, parts: packParts(a, e, rec), context: paper && paper.context ? (paper.org ? paper.org + ". " : "") + paper.context : "", date: e.date });
      var pre = el("pre", { class: "k-xv-pre", text: text.split("\n").slice(0, 7).join("\n") + "\n…" });
      var copyB = btn("Copy", "primary sm", function () {
        var done = function () { announce("Copied: the prompt, the paper, your marking and the timing."); copyB.textContent = "✓ Copied"; };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
        else { fallbackCopy(text); done(); }
      }, { "data-ui": "exams.feedback-copy" });
      body.appendChild(step(1, "Copy for Claude or Gemini", [pre, U().muted("One copy · the prompt, the paper, your marking, the timing · " + text.length.toLocaleString() + " characters"),
        el("div", { class: "k-ex-inline" }, [copyB, btn("Preview", "quiet sm", function () { pre.textContent = text; })])]));
      var pagesHost = el("div", { class: "k-xv-files" }, [U().muted("Finding the written pages…")]);
      body.appendChild(step(2, "Download pages", [pagesHost]));
      writtenPads(rec, function (pads) {
        pagesHost.textContent = "";
        if (!pads.length) { pagesHost.appendChild(U().muted("No written pages: the answers were typed or on paper.")); return; }
        var nPages = pads.reduce(function (s, p) { return s + p.pages.length; }, 0);
        var name = (a.preset || "paper").replace(/[^a-z0-9]+/gi, "-") + "-" + (e.date || "") + "-pages.pdf";
        pagesHost.appendChild(el("div", { class: "k-xv-file" }, [el("span", { class: "k-mono k-ex-muted", text: "PDF" }), el("div", { class: "k-ex-grow" }, [el("b", { class: "k-mono", text: name }),
          U().muted(pads.map(function (p) { return p.label; }).join(" · "))]), U().muted(nPages + (nPages === 1 ? " page" : " pages"))]));
        pagesHost.appendChild(U().muted("Whole pages in paper order; each page's header names its parts."));
        pagesHost.appendChild(btn("Download", "sm", function () {
          KOS.reviewPack.pagesPDF(pads, e.paper || a.title).then(function (blob) {
            var url = URL.createObjectURL(blob), link = el("a", { href: url, download: name });
            document.body.appendChild(link); link.click(); link.remove();
            setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
            announce("Downloaded " + name + ".");
          }, function () { KOS.ui.toast("The pages could not be made on this device."); });
        }, { "data-ui": "exams.feedback-pages" }));
      });
    }
    body.appendChild(el("p", { class: "k-xv-sent", text: "⊘ Nothing is sent by the app. The pages leave only by your copy or download." }));
    var ov = KOS.examGuide.dialog("Get feedback on this attempt", "省", [U().muted([e.paper, e.marks != null ? e.marks + "/" + e.max : null, U().pretty(e.date)].filter(Boolean).join(" · ")), body],
      [el("span", { class: "k-ex-grow" }), btn("Close", "", function () { ov.close(); }), btn("I have a reply · Add feedback ›", "", function () { ov.close(); addFeedback(a, e, box); })], "exams.feedback-dialog");
  }
  function fallbackCopy(text) {
    var ta = el("textarea", { style: "position:fixed;opacity:0" });
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (x) { /* nothing more to try */ }
    ta.remove();
  }
  function step(n, title, kids) {
    return el("section", { class: "k-xv-step" }, [el("span", { class: "k-xv-stepn", text: String(n) }), el("div", { class: "k-xv-stepbody" }, [el("b", { text: title })].concat(kids))]);
  }
  /* the attempt's ink: the pads its parts were written on, in paper order */
  function writtenPads(rec, cb) {
    var I = KOS.ink;
    if (!I || !I.allDocs) { cb([]); return; }
    var pre = "attempt:" + rec.uid + ":";
    var docs = I.allDocs().filter(function (d) { return String(d.item || "").indexOf(pre) === 0 && (d.pages || []).some(function (id) { return (d.inked || {})[id]; }); });
    var order = (rec.parts || []).map(function (p) { return String(p.id); });
    docs.sort(function (x, y) { return order.indexOf(String(x.item).slice(pre.length).split("|")[0]) - order.indexOf(String(y.item).slice(pre.length).split("|")[0]); });
    var out = [], n = docs.length;
    if (!n) { cb([]); return; }
    docs.forEach(function (d, i) {
      I.listPages(d.key, function (err, pages) {
        var part = String(d.item).slice(pre.length);
        out[i] = { part: part, label: d.title || part, pages: err ? [] : pages || [] };
        if (!--n) cb(out.filter(function (x) { return x && x.pages.length; }));
      });
    });
  }

  /* ---------------- Add feedback (47g) ---------------- */
  function addFeedback(a, e, box) {
    var from = "Claude", parsed = null;
    var ta = el("textarea", { class: "k-input k-xv-paste", rows: "7", "aria-label": "The whole reply", placeholder: "Paste the model's whole reply: its review and the ```json block.", "data-ui": "exams.feedback-paste" });
    var status = el("span", { class: "k-chip", "data-tone": "muted", "data-ui": "exams.feedback-status", text: "Waiting for a reply" });
    var found = el("div", { class: "k-xv-found", "data-ui": "exams.feedback-found" });
    var fromTabs = el("div");
    var storeB = btn("Store feedback", "primary", function () { store(); }, { "data-ui": "exams.feedback-store", disabled: "" });
    function paintFrom() {
      fromTabs.textContent = "";
      fromTabs.appendChild(KOS.ui.tabs(["Claude", "Gemini", "Other"].map(function (m) { return { label: m, active: from === m, onSelect: function () { from = m; paintFrom(); } }; }), { variant: "card", label: "From" }));
    }
    paintFrom();
    var made = {};
    function read() {
      var r = KOS.reviewPack.parse(ta.value, box.rec || { uid: e.uid });
      found.textContent = "";
      parsed = r.ok ? r.data : null;
      storeB.disabled = !parsed;
      if (!ta.value.trim()) { status.textContent = "Waiting for a reply"; status.setAttribute("data-tone", "muted"); return; }
      if (!r.ok) {
        status.textContent = "! Does not fit"; status.setAttribute("data-tone", "amber");
        found.appendChild(el("div", { class: "k-xv-bad", "data-ui": "exams.feedback-bad" }, [el("b", { text: "Nothing will be stored. What is wrong:" }),
          el("ul", { class: "k-xr-ul" }, r.errors.map(function (x) { return el("li", { text: x }); }))]));
        return;
      }
      status.textContent = "✓ Read · " + KOS.reviewPack.VERSION; status.setAttribute("data-tone", "green");
      var d = parsed;
      if (d.summary) found.appendChild(el("div", { class: "k-xv-summary" }, [el("b", { text: "Summary" }), el("span", { text: " · " + d.summary })]));
      var cols = el("div", { class: "k-xv-two" });
      cols.appendChild(el("div", {}, [el("div", { class: "k-xs-celllabel", text: "Re-marks" })].concat(d.remark.length ? d.remark.map(function (rm) {
        return el("div", { class: "k-xv-remark" }, [el("b", { class: "k-mono", text: rm.part + "  " + (rm.was != null ? rm.was : "?") + " → " + rm.should }), U().muted(rm.why || "")]);
      }) : [U().muted("None suggested")])));
      cols.appendChild(el("div", {}, [el("div", { class: "k-xs-celllabel", text: "Findings · " + d.findings.length })].concat(d.findings.slice(0, 8).map(function (f) {
        return el("div", { class: "k-xv-finding" }, [el("span", { class: "k-chip", "data-tone": "muted", text: String(f.error_type).replace(/_/g, " ") }), el("span", { class: "k-ex-grow", text: f.what }), el("span", { class: "k-mono k-ex-muted", text: (f.parts || []).join(" · ") })]);
      }))));
      found.appendChild(cols);
      if (d.actions.length) {
        found.appendChild(el("div", { class: "k-xs-celllabel", text: "Actions · " + d.actions.length + " of up to 6" }));
        d.actions.forEach(function (ac, i) {
          var mk = btn(made[i] ? "✓ Target" : "Make it a target", "sm", function () { made[i] = !made[i]; mk.textContent = made[i] ? "✓ Target" : "Make it a target"; }, { "aria-pressed": made[i] ? "true" : "false", "data-ui": "exams.feedback-target" });
          found.appendChild(el("div", { class: "k-xv-action" }, [el("span", { class: "k-mono k-ex-muted", text: String(i + 1) }), el("span", { class: "k-ex-grow", text: ac.text }), el("span", { class: "k-chip", "data-tone": "muted", text: ac.kind }), mk]));
        });
      }
    }
    ta.addEventListener("input", function () { read(); });
    function store() {
      if (!parsed) return;
      var d = Object.assign({}, parsed, { source: from, model: parsed.model || from, date: KOS.srs.todayISO() });
      var done = function () {
        var n = 0;
        d.actions.forEach(function (ac, i) {
          if (!made[i]) return;
          S().addTarget(a.id, { text: ac.text, kind: ac.kind, from: { attempt: e.uid, model: from, date: d.date } });
          n++;
        });
        ov.close();
        announce("Feedback stored" + (n ? ", " + n + (n === 1 ? " target" : " targets") + " made." : "."));
        KOS.rerender();
      };
      if (box.rec && KOS.attempts) KOS.attempts.addFeedback(box.rec.uid, d, function (err) { if (err) KOS.ui.toast("Could not store the feedback."); else done(); });
      else {
        /* a logged attempt with no journal keeps the import in the state's
           feedback list for its exam */
        var x = KOS.store.state.exams;
        x.feedback = x.feedback && typeof x.feedback === "object" ? x.feedback : {};
        var id = Date.now().toString(36);
        x.feedback[id] = Object.assign({ id: id, aid: a.id, attempt: e.uid, at: Date.now() }, d);
        KOS.store.save();
        done();
      }
    }
    var ov = KOS.examGuide.dialog("Add feedback", "省", [U().muted((e.paper || "Attempt") + " · " + U().pretty(e.date)),
      el("div", { class: "k-ex-inline" }, [U().muted("From"), fromTabs, el("span", { class: "k-ex-grow" }), status]),
      el("label", { class: "k-xv-label", text: "The whole reply" }), ta, found],
      [el("span", { class: "k-ex-grow" }), btn("Cancel", "", function () { ov.close(); }), storeB], "exams.feedback-add");
    setTimeout(function () { ta.focus(); }, 0);
  }

  /* ---------------- every import (Claude and Gemini side by side) ---------------- */
  function feedbackView(content, a, tabs) {
    SH().sectionHead(content, "Review", "Feedback you brought back", [tabs]);
    var host = el("div", { class: "k-xv-fbs", "data-ui": "exams.feedback-list" }, [U().muted("Reading…")]);
    content.appendChild(host);
    var rows = [];
    var x = KOS.store.state.exams.feedback || {};
    Object.keys(x).forEach(function (k) { if (x[k].aid === a.id) rows.push(x[k]); });
    function draw() {
      host.textContent = "";
      if (!rows.length) { host.appendChild(el("div", { class: "k-card k-xs-quietcard" }, [el("span", { text: "No feedback yet. Open an attempt and choose Get feedback, then bring the reply back with Add feedback." })])); return; }
      rows.sort(function (p, q) { return (q.at || 0) - (p.at || 0); }).forEach(function (f) {
        host.appendChild(el("section", { class: "k-card k-xv-fb", "data-ui": "exams.feedback-item" }, [
          el("div", { class: "k-ex-inline" }, [el("b", { text: f.model || f.source || "Model" }), U().muted([f.date ? U().pretty(f.date) : null, f.paper].filter(Boolean).join(" · "))]),
          f.summary ? el("p", { class: "k-xr-p", text: f.summary }) : null,
          el("div", { class: "k-ex-inline k-ex-small" }, [U().muted(f.findings.length + " findings · " + f.actions.length + " actions")])].filter(Boolean)));
      });
    }
    if (!KOS.attempts) { draw(); return; }
    KOS.attempts.list({ aid: a.id }, function (err, recs) {
      (recs || []).forEach(function (r) { Object.keys(r.feedback || {}).forEach(function (k) { rows.push(Object.assign({ paper: r.title }, r.feedback[k])); }); });
      if (host.isConnected) draw();
    });
  }

  /* ---------------- Targets (47h) ---------------- */
  function targetsView(content, a, targets, tabs) {
    var open = targets.filter(function (t) { return t.state === "open"; }).length;
    SH().sectionHead(content, "Review", "Targets · " + open + " open, " + (targets.length - open) + " closed", [tabs]);
    if (!targets.length) {
      content.appendChild(el("div", { class: "k-card k-xs-quietcard", "data-ui": "exams.targets-empty" }, [el("span", { text: "A target comes from feedback you import, or from a row in Where you lose marks." }),
        el("span", { class: "k-ex-grow" }), btn("Where you lose marks", "sm", function () { KOS.show("exams", { id: a.id, tab: "revise", sub: "lose" }); })]));
      return;
    }
    var box = el("section", { class: "k-card k-xv-targets", "data-ui": "exams.targets" });
    targets.forEach(function (t) {
      var ev = S().evidence(t), met = t.state !== "open";
      var practised = practisedBy(a, t);
      box.appendChild(el("div", { class: "k-xv-target", "data-ui": "exams.target", "data-state": t.state }, [
        el("span", { class: "k-xv-tmark", "data-state": met ? "met" : null, "aria-hidden": "true", text: met ? "✓" : "◎" }),
        el("div", { class: "k-xv-tmain" }, [el("b", { text: t.text }),
          el("div", { class: "k-ex-inline k-ex-small" }, [U().muted("Practised by")].concat(practised.map(function (p) { return el("button", { type: "button", class: "k-chip", onclick: p.go, text: p.label }); })))]),
        el("div", { class: "k-xv-tev" }, [U().muted(t.rule && t.rule.type === "mpm" ? "Min per mark" + (t.last != null ? " " + t.last : "") + " · at most " + t.rule.max : t.rule && t.rule.type === "manual" ? "You close it when it holds" : "Marks on the topic"),
          el("span", { class: "k-xv-pips", "aria-label": ev.met + " of 2 attempts" }, [el("i", { "data-on": ev.met >= 1 ? "" : null }), el("i", { "data-on": ev.met >= 2 ? "" : null })]),
          U().muted(ev.met + " of 2 attempts")]),
        met ? U().muted(t.closedBy === "evidence" ? "Met twice · " + U().pretty(t.closedAt, { dow: false }) : "Closed by you") :
          btn("Close", "quiet sm", function () { S().closeTarget(t.id, "hand"); announce("Closed: " + t.text + "."); KOS.rerender(); }, { "data-ui": "exams.target-close" })]));
    });
    content.appendChild(box);
    content.appendChild(el("div", { class: "k-card k-xs-note" }, [el("span", { "aria-hidden": "true", text: "◎" }), el("span", { text: "A target closes itself when two attempts meet it, or by hand." })]));
  }
  function practisedBy(a, t) {
    var out = [];
    var tops = S().topics(a);
    var hit = tops.filter(function (x) { return t.text.indexOf(x.short || x.ref) !== -1 || t.text.toLowerCase().indexOf(x.title.toLowerCase()) !== -1; })[0];
    if (hit) out.push({ label: "Chapter " + (hit.short || hit.ref), go: function () { KOS.show("exams", { id: a.id, tab: "revise", sub: "t:" + hit.key }); } });
    if (/9-mark|6-mark|six|conclusion|extended|discuss|analyse/i.test(t.text)) out.push({ label: "Q set: 5 six-markers", go: function () { KOS.show("exams", { id: a.id, tab: "questions", sub: "six" }); } });
    if (t.rule && t.rule.type === "mpm") out.push({ label: "A timed paper", go: function () { KOS.show("exams", { id: a.id, tab: "papers" }); } });
    if (!out.length) out.push({ label: "Essentials", go: function () { KOS.show("exams", { id: a.id, tab: "revise", sub: "essentials" }); } });
    return out;
  }

  KOS.examReview = { page: page, grade: grade, getFeedback: getFeedback, addFeedback: addFeedback };
})();
