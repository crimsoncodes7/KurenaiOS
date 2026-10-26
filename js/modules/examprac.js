/* Kurenai OS — modules/examprac.js
   Practice in the Exams hub (roadmap 5.8, phase 3), drawn to design turn
   29:
     Practice (29k, 29z)  Attempts (the record, 9d) · Analytics · Library
     an attempt           the post-mortem (29j), marks by question (29i),
                          what changed since the mock (29aa)
     teacher feedback     a photo and a note on an attempt (29z, §16.6)

   Every figure states its evidence and stays silent below its threshold
   (invariants 76, 77). Tags never have to add up to the marks lost (your
   rule, decision M). A redo item pays nothing (invariant 129). Papers are
   your own copies on this device only (invariant 125).                   */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function E() { return KOS.exams; }
  function U() { return KOS.examUI; }
  function T() { return KOS.tracker; }
  function today() { return KOS.srs.todayISO(); }
  var TAG_KEYS = ["knowledge", "recall", "method", "slip", "misread", "command", "working", "notation", "time", "incomplete"];
  function tagLabel(t) { return T().tagShort(t); }
  function byUid(uid) { return T().all().filter(function (e) { return e.uid === uid; })[0] || null; }

  /* ---------------- Practice (the hub tab) ---------------- */
  var SUBS = [["attempts", "Attempts"], ["analytics", "Analytics"], ["library", "Library"]];
  function practice(main, sub) {
    var u = U(), recKind = sub === "papers" ? "paper" : null;
    sub = sub === "papers" ? "attempts" : SUBS.some(function (s) { return s[0] === sub; }) ? sub : "attempts";
    var sw = KOS.ui.tabs(SUBS.map(function (s) {
      return { label: s[1], active: s[0] === sub, onSelect: function () { if (s[0] !== sub) KOS.show("exams", s[0] === "attempts" ? "practice" : { tab: "practice", sub: s[0] }); } };
    }), { variant: "workspace", label: "Practice views" });
    sw.setAttribute("data-ui", sw.getAttribute("data-ui") + " exams.pracviews");
    u.head(main, "practice", { right: sw });
    if (sub === "analytics") return analytics(main);
    if (sub === "library") return library(main);
    if (KOS.trackerRecord) KOS.trackerRecord(main, recKind);
  }

  /* ---------------- Analytics (29k) ---------------- */
  var anaFor = null;
  function analytics(main) {
    var u = U(), X = E();
    var list = X.upcoming().filter(function (a) { return a.tier === "real_exam" || a.tier === "mock" || a.tier === "topic_test"; });
    var a = (anaFor && X.get(anaFor)) || list[0] || null;
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.analytics" });
    main.appendChild(wrap);
    if (!a) { wrap.appendChild(KOS.ui.emptyState({ compact: true, mark: "紙", title: "Add an assessment to see analytics", body: "A real exam, a mock or a topic test, then log a paper against it." })); return; }
    var rd = X.readiness(a), nm = X.nextMarks(a);
    var atts = rd.attempts;
    var tabs = KOS.ui.tabs(list.slice(0, 8).map(function (x) {
      return { label: x.title, dot: u.hueOf(x), active: x.id === a.id, onSelect: function () { anaFor = x.id; KOS.rerender(); } };
    }), { variant: "workspace", label: "Assessment", edge: true });
    var marked = atts.filter(function (e) { return (e.questions || []).some(function (q) { return q.got != null; }); }).length;
    wrap.appendChild(el("div", { class: "k-ex-filters" }, [tabs, el("span", { class: "k-ex-grow" }),
      u.muted(["from " + u.plural(marked, "marked paper"), rd.signals.recall && !rd.signals.recall.thin ? u.plural(rd.signals.recall.rated, "rated card") : null, nm && nm.sittings ? nm.sittings + " past sittings in the index" : null].filter(Boolean).join(", "))]));
    var left = el("div", { class: "k-ex-col" }), right = el("div", { class: "k-ex-side" });
    var nc = u.card([u.chead("Where the next ten marks come from", "plain sentences, each with its evidence")], "", "exams.a-next");
    if (!nm || nm.thin) nc.appendChild(u.quiet(nm ? nm.why : "Needs a scope.", nm ? u.plural(nm.marked, "marked paper") + ", " + u.plural(nm.reviews, "rated card") + " so far" : ""));
    else { nc.appendChild(u.nextList(nm.items, a)); nc.appendChild(el("p", { class: "k-ex-foot", text: "Likelihood is evidence, not prophecy: anything in the specification can appear." })); }
    left.appendChild(nc);
    left.appendChild(paceCard(a, atts));
    left.lastChild.classList.add("k-ex-fill");
    var pr = rd.signals.practice;
    var pc = u.card([u.chead("Predicted grade", a.title)], "", "exams.a-pred");
    if (!pr || pr.thin || !pr.predicted || pr.predicted.thin) {
      var have = pr && !pr.thin ? pr.n : 0;
      pc.appendChild(u.quiet(pr && pr.predicted && pr.predicted.noBounds ? "No grade boundaries for this paper yet." : u.plural(Math.max(1, 3 - have), "more timed paper") + " give" + (3 - have === 1 ? "s" : "") + " a prediction.", have ? have + " so far · " + Math.round(pr.last) + "% last" : "None timed yet"));
    } else {
      var p = pr.predicted;
      pc.appendChild(el("div", { class: "k-ex-inline" }, [el("span", { class: "k-ex-fig k-ex-fig--26", text: p.lo === p.hi ? p.lo : p.lo + "–" + p.hi }), u.muted("from the " + p.series.join(" and ") + " boundaries" + (p.confirmed ? "" : " (provisional)"))]));
      pc.appendChild(u.gradesEl(p.lo, p.hi));
      pc.appendChild(u.muted("From your last " + u.plural(p.papers, "timed paper") + ": " + p.pctLo + "–" + p.pctHi + "%.", "k-ex-block"));
      if (a.target) {
        var tg = KOS.examStats.targetGap(a.target, rd.bounds, pr.last, a.marks || 100);
        if (tg) pc.appendChild(u.muted("Target " + tg.grade + " (≥ " + tg.needPct + "% in recent series): " + (tg.marks ? "about +" + tg.marks + " marks a paper." : "you are there."), "k-ex-block"));
      }
    }
    right.appendChild(pc);
    right.appendChild(calibrationCard());
    right.lastChild.classList.add("k-ex-fill");
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [left, right]));
    /* error patterns: early notes under ten tagged questions */
    var qs = [];
    atts.forEach(function (e) { (e.questions || []).forEach(function (q) { qs.push({ q: q.q, label: (e.paper || "") + " " + q.q, tags: q.tags, max: q.max, got: q.got }); }); });
    var pat = KOS.examStats.patterns(qs);
    if (pat.list.length) {
      wrap.appendChild(el("div", { class: "k-ex-minihead", text: pat.early ? "Error patterns · early notes from " + u.plural(pat.tagged, "tagged question") + "; prescriptions start at " + pat.need : "Error patterns · from " + u.plural(pat.tagged, "tagged question") }));
      wrap.appendChild(el("div", { class: "k-ex-presc", style: "--n: " + Math.min(3, pat.list.length) }, pat.list.slice(0, 3).map(function (x) {
        return el("div", { class: "k-ex-presccard" }, [tagChip(x.tag, true), el("div", { class: "k-ex-strong", text: (x.fix ? x.fix[0].split(":")[0] : tagLabel(x.tag)) + ": " + x.marks + " marks on " + u.plural(x.questions.length, "question") + "." }),
          u.muted(x.questions.slice(0, 4).join(", ") + (pat.early ? ". One paper is not yet a pattern." : ".")), el("div", { class: "k-ex-presc-fix", text: x.fix ? x.fix[1] : "" })]);
      })));
    } else if (atts.length) wrap.appendChild(el("p", { class: "k-ex-foot", text: "Tag the questions where marks went (marks by question) and error patterns appear here: early notes at first, prescriptions from 10 tagged questions." }));
  }
  function tagChip(t, on, o) {
    o = o || {};
    var i = TAG_KEYS.indexOf(t);
    return el("span", { class: "k-ex-tag", "data-on": on ? "" : null, "data-k": t === "time" ? "time" : null }, [o.key ? el("span", { class: "k-mono k-ex-tagkey", text: String((i + 1) % 10) }) : null,
      el("span", { text: (t === "time" && on ? "◷ " : "") + tagLabel(t) })].filter(Boolean));
  }
  function paceCard(a, atts) {
    var u = U();
    var e = atts.filter(function (x) { return x.timed && (x.questions || []).some(function (q) { return q.got != null && q.max; }); }).slice(-1)[0]
      || atts.filter(function (x) { return x.timed; }).slice(-1)[0];
    var pr = a.preset ? E().preset(a.preset) : null;
    var budgetMins = pr ? pr.mins : a.durationMins, budgetMarks = pr ? pr.marks : a.marks;
    var c = u.card([u.chead("Pace", e ? (e.paper || e.topic || "") + (budgetMins && budgetMarks ? " · minutes a mark against the paper's " + (Math.round(100 * budgetMins * (1 + (a.extraTime || 0) / 100) / budgetMarks) / 100) : "") : "")], "k-ex-flexcard", "exams.a-pace");
    var p = e ? KOS.examStats.pace(e, budgetMins, budgetMarks, a.extraTime) : null;
    if (!p) { c.appendChild(u.quiet("Pace needs one timed paper with its minutes.", "Tick Timed and give the minutes when you log it")); return c; }
    var qs = (e.questions || []).filter(function (q) { return q.max; });
    if (qs.length) c.appendChild(ramp(qs));
    c.appendChild(el("div", { class: "k-ex-ramplegend" }, [el("span", { class: "k-ex-inline" }, [el("i", { class: "k-ex-sw", "data-k": "got" }), "marks got"]), el("span", { class: "k-ex-inline" }, [el("i", { class: "k-ex-sw" }), "marks available"]),
      el("span", { "data-tone": "danger", text: "◷ ran out" })]));
    c.appendChild(el("div", { class: "k-ex-grow" }));
    c.appendChild(el("div", { class: "k-ex-pacefigs" }, [
      el("div", {}, [u.muted("This paper"), el("span", { class: "k-ex-fig k-ex-fig--20", text: p.perMark + " min/mk" }), u.muted(e.mins + " min for " + e.max + " marks")]),
      p.budget ? el("div", {}, [u.muted("The budget"), el("span", { class: "k-ex-fig k-ex-fig--20", text: p.budget + " min/mk" }), el("span", { class: "k-ex-small", "data-tone": p.over ? "danger" : null, text: p.over ? "▲ over the budget" : "within it" })]) : null,
      el("div", {}, [u.muted("Ran out"), el("span", { class: "k-ex-fig k-ex-fig--20", text: p.ranOut.length ? p.ranOut.join(", ") : "—" }), u.muted(p.ranOut.length ? "tagged ◷" : "no question tagged ◷")])].filter(Boolean)));
    return c;
  }
  /* the question ramp: bar height = marks available, fill = marks got,
     ◷ where time ran out (29-primitives-2) */
  function ramp(qs) {
    var NS = "http://www.w3.org/2000/svg", n = qs.length, W = Math.max(320, n * 32 + 20), H = 140;
    var mx = Math.max.apply(null, qs.map(function (q) { return q.max; })) || 1;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + (H + 22)); svg.setAttribute("class", "k-ex-ramp"); svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", qs.map(function (q) { return "Question " + q.q + ", " + (q.got == null ? "not marked" : q.got + " of " + q.max) + ((q.tags || []).indexOf("time") !== -1 ? ", ran out of time" : ""); }).join("; "));
    var bw = (W - 20) / n;
    qs.forEach(function (q, i) {
      var x = 10 + i * bw, hh = q.max / mx * (H - 24), hg = (q.got || 0) / mx * (H - 24);
      function r(cls, y, h) { var n2 = document.createElementNS(NS, "rect"); n2.setAttribute("x", (x + 3).toFixed(1)); n2.setAttribute("y", y.toFixed(1)); n2.setAttribute("width", Math.max(2, bw - 6).toFixed(1)); n2.setAttribute("height", Math.max(0, h).toFixed(1)); n2.setAttribute("rx", "4"); n2.setAttribute("class", cls); svg.appendChild(n2); }
      r("k-ex-ramp-av", H - hh, hh);
      if (q.got != null) r("k-ex-ramp-got", H - hg, hg);
      function t(cls, y, s) { var n3 = document.createElementNS(NS, "text"); n3.setAttribute("x", (x + bw / 2).toFixed(1)); n3.setAttribute("y", y.toFixed(1)); n3.setAttribute("text-anchor", "middle"); n3.setAttribute("class", cls); n3.textContent = s; svg.appendChild(n3); }
      if ((q.tags || []).indexOf("time") !== -1) t("k-ex-ramp-out", H - hh - 6, "◷");
      var step = n > 40 ? 4 : n > 24 ? 2 : 1;
      if (i % step === 0) t("k-ex-ramp-lab", H + 16, String(q.q).replace(/^Q/, "").replace(/^0/, ""));
    });
    return svg;
  }
  function calibrationCard() {
    var u = U();
    var cal = KOS.examStats.calibration(T().all().map(function (e) { return { predicted: e.predicted, marks: e.marks, max: e.max, subject: e.subject, date: e.date, label: e.paper || e.topic }; }));
    var c = u.card([u.chead("Calibration", "predicted vs actual" + (cal.points.length ? " · " + u.plural(cal.points.length, "paper") : ""))], "k-ex-flexcard", "exams.a-cal");
    if (cal.thin) {
      c.appendChild(u.quiet("A calibration chart appears after 5 predictions.", cal.have + " so far · say what you think you got before you mark it"));
      cal.points.slice(-4).forEach(function (p) { c.appendChild(el("div", { class: "k-ex-calrow" }, [el("span", { class: "k-ex-ell", text: p.label }), el("span", { class: "k-mono", text: Math.round(p.p) + "% → " + Math.round(p.a) + "%" })])); });
      return c;
    }
    var NS = "http://www.w3.org/2000/svg", W = 300;
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 " + W + " " + W); svg.setAttribute("class", "k-ex-calib"); svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", cal.points.map(function (p) { return p.label + ": predicted " + Math.round(p.p) + "%, got " + Math.round(p.a) + "%"; }).join("; "));
    function s(v) { return 20 + (Math.max(20, Math.min(100, v)) - 20) / 80 * (W - 40); }
    function add(tag, at, txt) { var n = document.createElementNS(NS, tag); Object.keys(at).forEach(function (k) { n.setAttribute(k, at[k]); }); if (txt != null) n.textContent = txt; svg.appendChild(n); }
    add("rect", { x: 20, y: 20, width: W - 40, height: W - 40, class: "k-ex-calframe" });
    add("line", { x1: 20, y1: W - 20, x2: W - 20, y2: 20, class: "k-ex-caldiag" });
    add("text", { x: W - 24, y: 34, "text-anchor": "end", class: "k-ex-trend-lab" }, "spot on");
    cal.points.forEach(function (p) { add("circle", { cx: s(p.p).toFixed(1), cy: (W - s(p.a)).toFixed(1), r: 6, class: "k-ex-calpt", "data-s": p.subject || "" }); });
    add("text", { x: W / 2, y: W - 4, "text-anchor": "middle", class: "k-ex-trend-lab" }, "what you predicted (%)");
    c.appendChild(svg);
    var bits = Object.keys(cal.bySubject).map(function (k) { var g = cal.bySubject[k]; return (g > 1 ? "over-predict by about " + g : g < -1 ? "under-predict by about " + (-g) : "are within a point") + "% on " + (U().SHORT[k] || k); });
    c.appendChild(el("p", { class: "k-ex-body", text: "You " + bits.join(", and ") + "." }));
    return c;
  }

  /* ---------------- the Library (29z) ---------------- */
  function library(main) {
    var u = U(), P = KOS.examPapers, ix = window.KOS_EXAMS && KOS_EXAMS.index;
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.library" });
    main.appendChild(wrap);
    if (!P || !P.available()) { wrap.appendChild(KOS.ui.emptyState({ compact: true, mark: "紙", title: "This browser cannot keep files", body: "The library needs IndexedDB." })); return; }
    var listCard = u.card([u.chead("Your copies", "loading…")], "k-ex-flexcard", "exams.lib-list");
    var side = el("div", { class: "k-ex-side" });
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [listCard, side]));
    var fSubj = "";
    var picker = el("input", { type: "file", accept: "application/pdf,.pdf", multiple: "", class: "k-ex-file", "aria-label": "Add PDFs", onchange: function () { addFiles(picker.files); picker.value = ""; } });
    var folderIn = el("input", { type: "file", multiple: "", class: "k-ex-file", "aria-label": "Add a folder", webkitdirectory: "", onchange: function () { addFiles(folderIn.files); folderIn.value = ""; } });
    function addFiles(files) {
      /* every file goes to the report, a non-PDF as "skipped: not a PDF" */
      var items = Array.prototype.slice.call(files || []).filter(function (f) { return !/^\./.test(f.name); }).map(function (f) { return { file: f, path: f.webkitRelativePath || f.name }; });
      if (!items.length) { KOS.ui.toast("No files in that pick.", true); return; }
      P.add(items, function (err, res) {
        if (err) { KOS.ui.toast("Could not add those files.", true); return; }
        importReport(res, "Added " + u.plural(res.added, "file") + ", " + res.matched + " matched" + (res.skipped ? ", " + res.skipped + " skipped" : ""));
      });
    }
    function attemptFor(paper, sitting) {
      return T().all().filter(function (e) { return e.source && e.source.kind === "past-paper" && e.source.ref === paper + ":" + sitting; }).slice(-1)[0] || null;
    }
    function open(id) {
      P.get(id, function (err, blob) {
        if (err || !blob) { KOS.ui.toast(err && err.message === "permission" ? "The browser needs your permission to read that folder again." : "That file is not readable here.", true); return; }
        var url = URL.createObjectURL(blob);
        window.open(url, "_blank", "noopener");
        setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
      });
    }
    P.list(function (err, rows) {
      listCard.innerHTML = "";
      var by = P.bySitting(rows), un = rows.filter(function (r) { return !P.matched(r); });
      var keys = Object.keys(by);
      var tabs = KOS.ui.tabs([["", "All"], ["compsci", "CS"], ["maths", "Maths"], ["it", "IT"]].map(function (x) {
        return { label: x[0] ? u.SUBJ[x[0]] : "All", short: x[1], dot: x[0] ? u.HUE[x[0]] : null, active: fSubj === x[0], onSelect: function () { fSubj = x[0]; KOS.rerender(); } };
      }), { variant: "workspace", label: "Subject" });
      listCard.appendChild(el("div", { class: "k-ex-inline" }, [el("span", { class: "k-ex-ctitle", text: "Your copies" }),
        u.muted(rows.length ? u.plural(rows.length, "file") + " matched to " + u.plural(keys.length, "sitting") : "none yet"), el("span", { class: "k-ex-grow" }), tabs,
        el("label", { class: "k-btn k-btn--primary k-btn--sm k-ex-filebtn" }, ["＋ Add PDFs", picker])]));
      if (!rows.length) {
        listCard.appendChild(KOS.ui.emptyState({ compact: true, mark: "紙", title: "Add your own past papers to open them beside your attempts",
          body: "The app cannot ship board papers (they are copyright, and the site is public), so the library holds your copies, on this device only." }));
        return;
      }
      var papers = ix ? ix.papers : {};
      var listKeys = keys.filter(function (k) { var pid = k.split(":")[0]; var pp = papers[pid]; var sid = pp ? pp.subject : pid.indexOf("ocr") === 0 ? "it" : null; return !fSubj || sid === fSubj; })
        .sort(function (x, y) { var a = x.split(":"), b = y.split(":"); return a[0] === b[0] ? (a[1] < b[1] ? 1 : -1) : a[0] < b[0] ? -1 : 1; });
      listCard.appendChild(el("div", { class: "k-ex-libhead", "aria-hidden": "true" }, [el("span"), el("span", { text: "Sitting" }), el("span", { text: "Paper" }), el("span", { text: "Scheme" }), el("span")]));
      listKeys.forEach(function (k) {
        var pid = k.split(":")[0], sit = k.split(":")[1], o = by[k], pp = papers[pid];
        var sid = pp ? pp.subject : "it";
        var att = attemptFor(pid, sit);
        var title = (pp ? pp.title : pid.toUpperCase()) + " · " + KOS.examIndex.sittingLabel(sit);
        listCard.appendChild(el("div", { class: "k-ex-librow", style: "--s: " + (u.HUE[sid] || "var(--muted)") }, [el("span", { class: "k-ex-vbar", "aria-hidden": "true" }),
          el("span", { class: "k-ex-ell k-ex-strong", text: title }),
          o.qp ? el("button", { type: "button", class: "k-ex-ok k-ex-okbtn", "data-ui": "exams.lib-paper", text: "✓ Paper", onclick: function () { openPaper(pid, sit, o); } }) : u.muted("— paper"),
          o.ms ? el("button", { type: "button", class: "k-ex-ok k-ex-okbtn", text: "✓ Mark scheme", onclick: function () { openScheme(pid, sit, o.ms); } }) : u.muted("— scheme"),
          att ? u.btn("Open beside attempt", "quiet sm", function () { KOS.show("exams", { attempt: att.uid, page: "marks" }); if (o.qp) setTimeout(function () { openPaper(pid, sit, o); }, 0); })
            : o.qp ? u.btn("Log it", "quiet sm", function () { KOS.trackerLog({ index: { paper: pid, sitting: sit } }, function () { KOS.rerender(); }); }) : u.muted("not attempted")]));
      });
      if (un.length) {
        listCard.appendChild(el("div", { class: "k-ex-grow" }));
        listCard.appendChild(el("div", { class: "k-ex-unmatched" }, [u.muted(u.plural(un.length, "file") + " did not match a sitting by name."),
          u.linkBtn("Match them →", function () { matchDialog(un); }, "exams.lib-match")]));
      }
    });
    P.usage(function (e2, us) {
      side.appendChild(u.card([u.chead("Kept on this device", ""),
        el("p", { class: "k-ex-body", text: "Your PDFs live in this browser's own store. They never sync, are never in a backup, and are never uploaded." }),
        el("div", { class: "k-ex-grow" }), u.kv("Files", String(us ? us.files : 0)), u.kv("On this device", us ? (us.bytes / 1048576).toFixed(0) + " MB" : "—"),
        us && us.linked ? u.kv("Read from a connected folder", String(us.linked)) : null, u.kv("Synced", "none")].filter(Boolean), "k-ex-flexcard k-ex-fill", "exams.lib-device"));
      var con = u.card([u.chead("Add a folder", "every PDF under it, matched by its path"),
        el("p", { class: "k-ex-body", text: "Pick the folder you keep papers in (Past Papers/…/Question Papers/2023-06 QP.pdf matches by itself). Files are copied into this browser." }),
        el("div", { class: "k-ex-actions" }, [el("label", { class: "k-btn k-btn--sm k-ex-filebtn" }, ["Choose folder", folderIn]),
          P.canConnect() ? u.btn("Connect instead", "quiet sm", function () {
            P.connect(function (err, res) { if (err) { KOS.ui.toast("Could not read that folder.", true); return; } if (!res) return; importReport(res, "Connected " + res.folder + ": " + u.plural(res.added, "file") + ", " + res.matched + " matched"); });
          }, { title: "Chrome and Edge: read the folder in place, no copy" }) : null].filter(Boolean))], "", "exams.lib-folder");
      side.appendChild(con);
    });
  }
  /* the import, file by file (files plan R0): what each became, and why */
  function importReport(res, headline) {
    var rep = res.report || [];
    U().announce(headline + ".");
    if (!rep.length) { KOS.ui.toast(headline + "."); KOS.rerender(); return; }
    var groups = [["matched", "Matched to a sitting"], ["added", "Added · match by hand"], ["skipped", "Skipped"]];
    KOS.inkUI.dialog({ title: headline, className: "k-ex-report", wide: true, hook: "exams.import-report", onClose: function () { KOS.rerender(); }, render: function (body, close, foot) {
      groups.forEach(function (g) {
        var rows = rep.filter(function (r) { return r.outcome === g[0]; });
        if (!rows.length) return;
        body.appendChild(el("h3", { class: "k-kicker", text: g[1] + " · " + rows.length }));
        body.appendChild(el("ul", { class: "k-ex-replist" }, rows.slice(0, 200).map(function (r) {
          return el("li", { class: "k-ex-reprow", "data-outcome": r.outcome }, [el("span", { class: "k-ex-ell k-ex-small", text: r.path, title: r.path }), el("span", { class: "k-ex-muted k-ex-small", text: r.why })]);
        })));
      });
      foot.appendChild(el("span"));
      foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", text: "Done", onclick: close }));
    } });
  }
  function matchDialog(rows) {
    var u = U(), ix = window.KOS_EXAMS && KOS_EXAMS.index, overlay = el("div", { class: "k-dialog-overlay" });
    function close() { overlay.remove(); }
    overlay.close = close;
    var body = el("div", { class: "k-dialog-body k-ex-dbody" });
    rows.slice(0, 30).forEach(function (r) {
      var paper = el("select", { class: "k-input", "aria-label": "Paper for " + r.name }, [el("option", { value: "", text: "Paper…" })].concat(Object.keys(ix ? ix.papers : {}).map(function (k) { return el("option", { value: k, text: ix.papers[k].title }); })));
      var sit = el("select", { class: "k-input", "aria-label": "Sitting for " + r.name }, [el("option", { value: "", text: "Sitting…" })]);
      var kind = el("select", { class: "k-input", "aria-label": "Kind" }, [el("option", { value: "qp", text: "Question paper" }), el("option", { value: "ms", text: "Mark scheme" })]);
      if (r.kind === "ms") kind.value = "ms";
      paper.addEventListener("change", function () {
        sit.innerHTML = ""; sit.appendChild(el("option", { value: "", text: "Sitting…" }));
        (ix && ix.papers[paper.value] ? ix.papers[paper.value].sittings : []).slice().reverse().forEach(function (s) { sit.appendChild(el("option", { value: s, text: KOS.examIndex.sittingLabel(s) })); });
      });
      body.appendChild(el("div", { class: "k-ex-matchrow" }, [el("span", { class: "k-ex-ell k-ex-small", text: r.path }), paper, sit, kind,
        u.btn("Match", "sm", function () { if (!paper.value || !sit.value) return; KOS.examPapers.setMatch(r.id, { paper: paper.value, sitting: sit.value, kind: kind.value }, function () { KOS.ui.toast("Matched."); }); }),
        u.btn("Remove", "quiet sm", function () { KOS.examPapers.remove(r.id, function () { KOS.ui.toast("Removed from this device."); }); })]));
    });
    overlay.appendChild(el("div", { class: "k-dialog k-ex-dialog", "data-ui": "ui.dialog exams.match-dialog" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "紙" }), el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Match your files" })]),
      body, el("div", { class: "k-dialog-foot" }, [el("span", { class: "k-spacer" }), u.btn("Done", "primary", function () { close(); KOS.rerender(); })])]));
    KOS.ui.openDialog(overlay);
  }

  /* ---------------- one attempt ---------------- */
  function attempt(main, uid, pageName) {
    var u = U(), e = byUid(uid);
    if (!e) {
      main.appendChild(KOS.ui.pageHeader({ kicker: "Exams & Papers", title: "Not found" }));
      main.appendChild(KOS.ui.emptyState({ mark: "紙", title: "That attempt is gone", body: "It may have been deleted on another device.", action: u.btn("Practice", "", function () { KOS.show("exams", "practice"); }) }));
      return;
    }
    if (e.subject) main.style.setProperty("--accent", u.HUE[e.subject]);
    if (pageName === "marks") return marks(main, e);
    if (pageName === "changed") return changed(main, e);
    postMortem(main, e);
  }
  function whyOf(q) {
    var ix = window.KOS_EXAMS && KOS_EXAMS.index;
    if (!ix || !q._src) return null;
    return q._why || null;
  }
  /* the index's "what the question asked" for each row of a past paper */
  function withWhy(e) {
    var ix = window.KOS_EXAMS && KOS_EXAMS.index;
    var src = e.source && e.source.kind === "past-paper" ? String(e.source.ref).split(":") : null;
    if (!ix || !src) return e;
    var map = {};
    ix.questions.forEach(function (q) { if (q[0] === src[0] && q[1] === src[1]) map[q[3]] = q[6]; });
    return Object.assign({}, e, { questions: (e.questions || []).map(function (q) { var k = String(q.q).replace(/^[A-D] /, ""); return Object.assign({}, q, { _why: map[k] || null, _src: true }); }) });
  }

  /* THE POST-MORTEM (29j): a sentence, three breakdowns, three questions,
     one row of actions */
  function postMortem(main, e0) {
    var u = U(), X = E(), e = withWhy(e0);
    var pm = KOS.examStats.postMortem(e, X.nodeOf, whyOf);
    main.appendChild(u.backLink("Practice", function () { KOS.show("exams", "practice"); }));
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.postmortem", style: "--s: " + (u.HUE[e.subject] || "var(--crimson)") });
    main.appendChild(wrap);
    var title = pm ? pm.lost + " marks lost." + (pm.units.length >= 3 ? " " + Math.round(pm.topThree) + " of them in three topics." : "") : e.marks != null ? e.marks + " of " + e.max + "." : "No marks yet.";
    var line = pm ? [pm.units.slice(0, 3).map(function (x) { return x.label; }).join(", "), pm.tags[0] ? tagLabel(pm.tags[0].label) + " lost the most" : null, pm.untagged ? (Math.round(pm.untagged) === 1 ? "1 mark is" : Math.round(pm.untagged) + " marks are") + " untagged" : null].filter(Boolean).join(". ") + "." : "Add marks by question to see where they went.";
    wrap.appendChild(el("section", { class: "k-ex-pmhero" }, [
      el("div", { class: "k-ex-grow" }, [el("div", { class: "k-ex-inline" }, [u.eyebrow("Post-mortem"), u.muted([e.paper || e.topic, e.timed && e.mins ? "timed " + e.mins + " min" : null, u.pretty(e.date)].filter(Boolean).join(" · "))]),
        el("h1", { class: "k-ex-pmtitle", text: title }), el("p", { class: "k-ex-hero-line", text: line })]),
      el("div", { class: "k-ex-pmfigs" }, [e.marks != null ? el("div", {}, [el("div", { class: "k-ex-fig k-ex-fig--44", text: String(e.marks) }), u.muted("of " + e.max + (e.max ? " · " + Math.round(100 * e.marks / e.max) + "%" : ""))]) : null,
        e.predicted != null ? el("div", {}, [el("div", { class: "k-ex-fig k-ex-fig--22 k-ex-muted2", text: String(e.predicted) }), u.muted("you predicted")]) : null].filter(Boolean))]));
    if (!pm) {
      wrap.appendChild(u.card([u.quiet("Add marks by question to see topics, what was asked and error tags.", ""), u.btn("Marks by question", "primary sm", function () { KOS.show("exams", { attempt: e.uid, page: "marks" }); })], "", "exams.pm-empty"));
      return;
    }
    var max = Math.max.apply(null, [1].concat(pm.units.map(function (x) { return x.marks; }), pm.whys.map(function (x) { return x.marks; }), pm.tags.map(function (x) { return x.marks; }), [pm.untagged]));
    var tagRows = pm.tags.map(function (x) { return { label: x.label === "time" ? "◷ Ran out of time" : tagLabel(x.label), marks: x.marks }; });
    if (pm.untagged) tagRows.push({ label: "untagged", marks: pm.untagged });
    wrap.appendChild(el("div", { class: "k-ex-three" }, [
      u.card([u.chead("By topic", pm.lost + " marks"), u.lossBars(pm.units.slice(0, 7), max), pm.fullMarks.length ? el("div", { class: "k-ex-grow" }) : null,
        pm.fullMarks.length ? el("p", { class: "k-ex-foot", text: "Full marks on " + pm.fullMarks.slice(0, 6).join(", ") + "." }) : null].filter(Boolean), "k-ex-flexcard", "exams.pm-topic"),
      u.card([u.chead("By what was asked", "from the index, per question"), pm.whys.length ? u.lossBars(pm.whys.slice(0, 8), max) : u.quiet("Not from the index, so no question types.", "")], "k-ex-flexcard", "exams.pm-why"),
      u.card([u.chead("By error tag", "tags need not add up"), pm.anyTags ? u.lossBars(tagRows, max) : u.quiet("Add tags in marks by question to see why marks went.", "")], "k-ex-flexcard", "exams.pm-tag")]));
    wrap.appendChild(el("div", { class: "k-ex-minihead", text: "The three costliest questions" }));
    wrap.appendChild(el("div", { class: "k-ex-three" }, pm.costly.map(function (q) {
      var src = e.source && e.source.kind === "past-paper" ? KOS.examIndex.sittingLabel(String(e.source.ref).split(":")[1]) : null;
      var nodes = q.refs.map(function (k) { return X.nodeOf(k); }).filter(Boolean);
      return u.card([el("div", { class: "k-ex-inline" }, [el("b", { class: "k-mono", text: q.q }), el("span", { class: "k-ex-grow" }), el("span", { class: "k-mono k-ex-muted", text: q.got + " / " + q.max })]),
        el("div", { class: "k-ex-ctitle", text: q.why || (nodes[0] ? nodes[0].title : "Question " + q.q) }),
        u.muted([nodes[0] ? nodes[0].ref + " " + nodes[0].title : null, q.max + " marks", src].filter(Boolean).join(" · ")),
        el("div", { class: "k-ex-bigfig-row" }, [el("span", { class: "k-ex-fig k-ex-fig--28", text: "−" + q.lost }), u.muted("marks")]),
        el("div", { class: "k-ex-inline" }, q.tags.length ? q.tags.map(function (t) { return tagChip(t, true); }) : [u.muted("untagged", "k-ex-italic")]),
        el("div", { class: "k-ex-grow" }),
        el("div", { class: "k-ex-cardfoot" }, [q.redo ? el("span", { class: "k-ex-ok", text: "✓ Redo item made" }) : u.btn("＋ Redo item", "sm", function () { setRedo(e0, [q.q], true); }),
          nodes[0] ? u.btn("Open the topic", "quiet sm", function () { KOS.show("ref", { subject: nodes[0].subject, ref: nodes[0].ref }); }) : null].filter(Boolean))], "k-ex-flexcard", "exams.pm-costly");
    })));
    var notRedo = pm.costly.filter(function (q) { return !q.redo; });
    var made = (e0.questions || []).filter(function (q) { return q.redo; });
    var prev = X.previousAttempt(e0);
    wrap.appendChild(el("div", { class: "k-ex-whatnext", "data-ui": "exams.pm-next" }, [el("b", { text: "What next" }),
      notRedo.length ? u.btn("＋ Make redo items · " + notRedo.map(function (q) { return q.q; }).join(", "), "primary", function () { setRedo(e0, notRedo.map(function (q) { return q.q; }), true); }) : null,
      u.btn("Add " + pm.units.slice(0, 2).map(function (x) { return x.label; }).join(" and ") + " to this week's priorities", "", function () { KOS.show("exams", "plan"); u.announce("The Planner. Review before sending."); }),
      prev ? u.btn("What changed since " + (prev.paper || u.pretty(prev.date)), "", function () { KOS.show("exams", { attempt: e0.uid, page: "changed" }); }) : null,
      u.btn("Marks by question", "quiet", function () { KOS.show("exams", { attempt: e0.uid, page: "marks" }); }),
      u.btn(e0.feedback ? "Teacher feedback ✓" : "Teacher feedback", "quiet", function () { feedbackDialog(e0); }),
      el("span", { class: "k-ex-grow" }), made.length ? u.muted(u.plural(made.length, "redo item") + " made · " + made.map(function (q) { return q.q; }).join(", ")) : null].filter(Boolean)));
    if (e0.feedback && e0.feedback.note) wrap.appendChild(u.card([u.chead("Teacher feedback", e0.feedback.qs.length ? "on " + e0.feedback.qs.join(", ") : ""), el("p", { class: "k-ex-pre", text: e0.feedback.note })], "", "exams.pm-feedback"));
  }
  /* a redo item is a click (decision G): due tomorrow, self-marked, pays
     nothing; through KOS.tracker so the schedule follows */
  function setRedo(e, qs, on) {
    var list = (e.questions || []).map(function (q) { return qs.indexOf(q.q) !== -1 ? Object.assign({}, q, { redo: on }) : q; });
    T().update(e.id, { questions: list });
    var tom = KOS.srs.addDays(today(), 1);
    U().announce((qs.length === 1 ? "Redo item made for " + qs[0] : U().plural(qs.length, "redo item") + " made") + ", due " + U().pretty(tom) + ".");
    KOS.rerender();
  }

  /* MARKS BY QUESTION (29i): all of it optional; all of it keyboard */
  function marks(main, e) {
    var u = U(), X = E();
    var rows = (e.questions || []).map(function (q) { return Object.assign({}, q, { tags: (q.tags || []).slice(), refs: (q.refs || []).slice() }); });
    var cur = 0, totalTyped = e.marks;
    main.appendChild(u.backLink("Practice", function () { KOS.show("exams", "practice"); }));
    var saveBtn = u.btn("Save and see the post-mortem", "primary", save, { "data-ui": "exams.marks-save" });
    main.appendChild(KOS.ui.pageHeader({ kicker: "紙 · " + (e.paper || e.topic || "Attempt"), title: "Marks by question", className: "k-ex-head",
      sub: [e.timed && e.mins ? "Timed · " + e.mins + " min" : null, e.predicted != null ? "predicted " + e.predicted : null, "optional: skip any of it"].filter(Boolean).join(" · "),
      actions: [u.btn("Skip for now", "quiet", function () { KOS.show("exams", "practice"); }), saveBtn] }));
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.marks" });
    main.appendChild(wrap);
    var table = el("div", { class: "k-card k-ex-qtable", role: "grid", "aria-label": "Marks by question" });
    var side = el("div", { class: "k-ex-side" });
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [table, side]));
    var totalCard = u.card([], "", "exams.marks-total"), lostCard = u.card([], "k-ex-fill", "exams.marks-lost");
    side.appendChild(totalCard);
    side.appendChild(u.card([u.chead("Keys", "no mouse needed"), el("div", { class: "k-ex-keys" }, [["Tab", "Got → next question"], ["1 – 0", "Toggle a tag (Alt+1–0 from Got)"], ["R", "Redo on or off"], ["↑ ↓", "Previous or next question"], ["Enter", "Save"]].reduce(function (a, k) {
      return a.concat([el("kbd", { class: "k-mono", text: k[0] }), el("span", { text: k[1] })]);
    }, []))], "", "exams.marks-keys"));
    side.appendChild(lostCard);
    if (KOS.examPapers && e.source && e.source.kind === "past-paper") {
      KOS.examPapers.list(function (err, files) {
        var o = KOS.examPapers.bySitting(files)[e.source.ref];
        if (o && (o.qp || o.ms)) side.insertBefore(u.card([u.chead("Your copy", "on this device"), el("div", { class: "k-ex-actions" }, [o.qp ? u.btn("Open the paper", "sm", function () { var src = String(e.source.ref).split(":"); openPaper(src[0], src[1], o); }) : null, o.ms ? u.btn("Open the mark scheme", "quiet sm", function () { var src = String(e.source.ref).split(":"); openScheme(src[0], src[1], o.ms); }) : null].filter(Boolean))], "", "exams.marks-copy"), side.children[1]);
      });
    }
    function addRow() { rows.push({ q: "Q" + (rows.length + 1), max: null, got: null, refs: [], tags: [], redo: false, note: "" }); draw(); }
    function draw() {
      table.innerHTML = "";
      table.appendChild(el("div", { class: "k-ex-qrow k-ex-qhead", role: "row" }, ["Q", "Topic", "Got", "", "Max", "Why marks went", "Redo"].map(function (h) { return el("span", { role: "columnheader", text: h }); })));
      if (!rows.length) table.appendChild(el("div", { class: "k-ex-qempty" }, [u.muted("No questions from the index. Add them one by one; nothing is required."), u.btn("＋ Question", "sm", addRow)]));
      rows.forEach(function (q, i) {
        var node = q.refs[0] ? X.nodeOf(q.refs[0]) : null;
        var full = q.got != null && q.max != null && q.got >= q.max;
        var got = el("input", { type: "number", class: "k-input k-ex-gotin", min: 0, max: q.max == null ? null : q.max, value: q.got == null ? "" : q.got, "aria-label": "Got, question " + q.q, "data-ui": "exams.got" });
        got.addEventListener("focus", function () { if (cur !== i) { cur = i; draw(); table.querySelectorAll("[data-ui~='exams.got']")[i].focus(); } });
        got.addEventListener("input", function () {
          var v = got.value === "" ? null : Math.max(0, parseInt(got.value, 10));
          if (v != null && q.max != null && v > q.max) { got.setAttribute("aria-invalid", "true"); u.announce(q.q + " got " + v + " is more than " + q.max + ": too high."); return; }
          got.removeAttribute("aria-invalid"); q.got = v; side_();
        });
        got.addEventListener("change", function () { draw(); var g = table.querySelectorAll("[data-ui~='exams.got']")[i]; if (g) g.focus(); });
        var tagsCell = full ? u.muted("full marks") : i === cur ? el("div", { class: "k-ex-tagset" }, TAG_KEYS.map(function (t) {
          var b = el("button", { type: "button", class: "k-ex-tag", "data-on": q.tags.indexOf(t) !== -1 ? "" : null, "data-k": t === "time" ? "time" : null, "aria-pressed": String(q.tags.indexOf(t) !== -1),
            onclick: function () { toggle(i, t); } }, [el("span", { class: "k-mono k-ex-tagkey", text: String((TAG_KEYS.indexOf(t) + 1) % 10) }), el("span", { text: (t === "time" && q.tags.indexOf(t) !== -1 ? "◷ " : "") + tagLabel(t) })]);
          return b;
        })) : q.tags.length ? el("div", { class: "k-ex-tagset" }, q.tags.map(function (t) { return tagChip(t, true); })) : q.got != null && q.max != null && q.got < q.max ? u.muted("untagged · " + (q.max - q.got), "k-ex-italic") : el("span");
        var redo = full ? el("span") : el("label", { class: "k-ex-redo", "data-on": q.redo ? "" : null }, [el("input", { type: "checkbox", class: "k-box", "aria-label": "Redo question " + q.q, onchange: function (ev) { q.redo = ev.target.checked; u.announce(q.q + (q.redo ? " marked for redo." : " no longer for redo.")); draw(); } }), "Redo"]);
        if (!full) redo.querySelector("input").checked = !!q.redo;
        table.appendChild(el("div", { class: "k-ex-qrow", role: "row", "data-cur": i === cur ? "" : null, "data-full": full ? "" : null }, [
          el("b", { class: "k-mono", text: q.q }), el("span", { class: "k-ex-ell k-ex-muted2", text: node ? node.title : "" }), got, el("span", { class: "k-ex-muted", text: "/" }),
          el("span", { class: "k-mono k-ex-muted", text: q.max == null ? "—" : String(q.max) }), tagsCell, redo]));
      });
      if (rows.length) table.appendChild(el("div", { class: "k-ex-qadd" }, [u.btn("＋ Question", "quiet sm", addRow)]));
      side_();
    }
    function toggle(i, t) {
      var q = rows[i];
      q.tags = q.tags.indexOf(t) !== -1 ? q.tags.filter(function (x) { return x !== t; }) : q.tags.concat(t);
      u.announce(q.q + ", " + tagLabel(t) + (q.tags.indexOf(t) !== -1 ? " on. " : " off. ") + q.tags.map(tagLabel).join(", "));
      var focusTag = document.activeElement && document.activeElement.classList.contains("k-ex-tag");
      draw();
      var g = focusTag ? table.querySelectorAll(".k-ex-qrow[data-cur] .k-ex-tag")[TAG_KEYS.indexOf(t)] : table.querySelectorAll("[data-ui~='exams.got']")[i];
      if (g) g.focus();
    }
    function sum() { var got = 0, mx = 0, any = false; rows.forEach(function (q) { if (q.got != null) { got += q.got; any = true; } if (q.max != null) mx += q.max; }); return { got: got, max: mx, any: any }; }
    function side_() {
      var s = sum();
      totalCard.innerHTML = "";
      totalCard.appendChild(u.eyebrow("Total"));
      totalCard.appendChild(el("div", { class: "k-ex-bigfig-row" }, [el("span", { class: "k-ex-fig k-ex-fig--40", text: String(totalTyped != null ? totalTyped : s.got) }), u.muted("/ " + (e.max || s.max) + (totalTyped != null ? " as logged" : " from the questions"))]));
      if (s.any && totalTyped != null && s.got !== totalTyped) {
        totalCard.appendChild(el("div", { class: "k-ex-note" }, [el("span", { "aria-hidden": "true", text: "ⓘ" }), el("span", {}, ["The questions add to ", el("b", { text: String(s.got) }), ", the total says ", el("b", { text: String(totalTyped) }), ". Not an error: a question may be missing or marked later. ",
          el("button", { type: "button", class: "k-link", text: "Use " + s.got, onclick: function () { totalTyped = s.got; side_(); } }), " · ",
          el("button", { type: "button", class: "k-link", text: "Keep " + totalTyped, onclick: function () { side_(); } })])]));
      }
      var lost = {}, untagged = 0, all = 0;
      rows.forEach(function (q) {
        if (q.got == null || q.max == null || q.got >= q.max) return;
        var l = q.max - q.got; all += l;
        if (!q.tags.length) untagged += l; else q.tags.forEach(function (t) { lost[t] = (lost[t] || 0) + l / q.tags.length; });
      });
      lostCard.innerHTML = "";
      lostCard.appendChild(u.chead("Lost so far", all ? u.plural(all, "mark") : ""));
      Object.keys(lost).sort(function (a, b) { return lost[b] - lost[a]; }).forEach(function (t) {
        lostCard.appendChild(el("div", { class: "k-ex-lostrow", "data-k": t === "time" ? "time" : null }, [el("span", { class: "k-ex-grow", text: (t === "time" ? "◷ " : "") + tagLabel(t) }), el("span", { class: "k-mono", text: String(Math.round(lost[t] * 10) / 10) })]));
      });
      if (untagged) lostCard.appendChild(el("div", { class: "k-ex-lostrow", "data-k": "untagged" }, [el("span", { class: "k-ex-grow", text: "untagged" }), el("span", { class: "k-mono", text: String(untagged) })]));
      lostCard.appendChild(el("div", { class: "k-ex-grow" }));
      lostCard.appendChild(el("p", { class: "k-ex-foot", text: "Tags never have to add up to the marks lost." }));
    }
    function save() {
      var s = sum();
      var patch = { questions: rows.filter(function (q) { return q.q; }).map(function (q) { var o = Object.assign({}, q); delete o._why; delete o._src; return o; }) };
      if (totalTyped != null && totalTyped !== e.marks) patch.marks = totalTyped;
      else if (e.marks == null && s.any) patch.marks = s.got;
      if (e.max == null && s.max) patch.max = s.max;
      T().update(e.id, patch);
      KOS.ui.toast("Saved.");
      KOS.show("exams", { attempt: e.uid });
    }
    wrap.addEventListener("keydown", function (ev) {
      if (ev.target && ev.target.tagName === "TEXTAREA") return;
      if (/^[0-9]$/.test(ev.key) && ev.target && ev.target.type !== "number") {
        ev.preventDefault(); var k = ev.key === "0" ? 9 : +ev.key - 1; if (rows[cur]) toggle(cur, TAG_KEYS[k]); return;
      }
      if (/^[0-9]$/.test(ev.key) && ev.altKey) { ev.preventDefault(); var k2 = ev.key === "0" ? 9 : +ev.key - 1; if (rows[cur]) toggle(cur, TAG_KEYS[k2]); return; }
      if ((ev.key === "r" || ev.key === "R") && ev.target.type !== "text") { ev.preventDefault(); if (rows[cur]) { rows[cur].redo = !rows[cur].redo; u.announce(rows[cur].q + (rows[cur].redo ? " marked for redo." : " no longer for redo.")); draw(); var g0 = table.querySelectorAll("[data-ui~='exams.got']")[cur]; if (g0) g0.focus(); } return; }
      if (ev.key === "ArrowDown" || ev.key === "ArrowUp") {
        ev.preventDefault(); cur = Math.max(0, Math.min(rows.length - 1, cur + (ev.key === "ArrowDown" ? 1 : -1))); draw();
        var g = table.querySelectorAll("[data-ui~='exams.got']")[cur]; if (g) g.focus(); return;
      }
      if (ev.key === "Enter" && ev.target && ev.target.tagName === "INPUT" && ev.target.type === "number") { ev.preventDefault(); save(); }
    });
    draw();
    var first = table.querySelector("[data-ui~='exams.got']");
    if (first) first.focus();
  }
  /* a past paper in the app's own viewer (roadmap 6.4, 30h): ink per
     attempt, the clock, the scheme beside it, marking that logs one
     attempt. The browser's own viewer stays the fallback. */
  function paperTitle(pid, sit) {
    var ix = window.KOS_EXAMS && KOS_EXAMS.index, pp = ix && ix.papers[pid];
    return (pp ? pp.title : pid.toUpperCase()) + " · " + KOS.examIndex.sittingLabel(sit);
  }
  function openPaper(pid, sit, o) {
    if (!KOS.pdfView) { openFile(o.qp); return; }
    var ix = window.KOS_EXAMS && KOS_EXAMS.index, pp = ix && ix.papers[pid];
    KOS.pdfView.open({ title: paperTitle(pid, sit), kind: "paper", fileId: o.qp,
      getBlob: function (cb) { KOS.examPapers.get(o.qp, cb); },
      paper: { pid: pid, sitting: sit, subject: pp ? pp.subject : null, title: pp ? pp.title : pid.toUpperCase() },
      scheme: o.ms ? { title: "Mark scheme · " + KOS.examIndex.sittingLabel(sit), getBlob: function (cb) { KOS.examPapers.get(o.ms, cb); } } : null });
  }
  function openScheme(pid, sit, id) {
    if (!KOS.pdfView) { openFile(id); return; }
    KOS.pdfView.open({ title: "Mark scheme · " + paperTitle(pid, sit), kind: "scheme", fileId: id, getBlob: function (cb) { KOS.examPapers.get(id, cb); } });
  }
  function openFile(id) {
    KOS.examPapers.get(id, function (err, blob) {
      if (err || !blob) { KOS.ui.toast("That file is not readable here.", true); return; }
      var url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    });
  }

  /* WHAT CHANGED SINCE THE MOCK (29aa): marks lost then and now, by leaf */
  function changed(main, e) {
    var u = U(), X = E(), prev = X.previousAttempt(e);
    main.appendChild(u.backLink("Post-mortem", function () { KOS.show("exams", { attempt: e.uid }); }));
    var wrap = el("div", { class: "k-ex-page", "data-ui": "exams.changed", style: "--s: " + (u.HUE[e.subject] || "var(--crimson)") });
    main.appendChild(wrap);
    var cmp = prev ? KOS.examStats.compare(prev, e) : null;
    wrap.appendChild(el("section", { class: "k-ex-pmhero" }, [el("div", { class: "k-ex-grow" }, [u.eyebrow((u.SUBJ[e.subject] || "") + " · a re-test"), el("h1", { class: "k-ex-pmtitle", text: "What changed since " + (prev ? prev.paper || u.pretty(prev.date) : "the last paper") }),
      el("p", { class: "k-ex-hero-line", text: prev ? (prev.paper || "") + " " + (prev.marks != null ? prev.marks + " / " + prev.max : "") + " → " + (e.paper || "") + " " + (e.marks != null ? e.marks + " / " + e.max : "") + (cmp ? " · " + u.plural(cmp.overlap, "leaf", "leaves") + " in both" : "") : "" })]),
      el("div", { class: "k-ex-actions" }, [u.btn("Post-mortem", "", function () { KOS.show("exams", { attempt: e.uid }); }), u.btn("Plan the rest", "primary", function () { KOS.show("exams", "plan"); })])]));
    if (!prev || !cmp) { wrap.appendChild(u.card([u.quiet("Needs two marked attempts with marks by question on overlapping topics.", "After your next paper on these topics, see what changed.")], "", "exams.ch-empty")); return; }
    if (!cmp.overlap) { wrap.appendChild(u.card([u.quiet("The two papers share no topics, so there is nothing to compare leaf by leaf.", "")], "", "exams.ch-none")); return; }
    u.announce(Math.abs(cmp.change) + " marks " + (cmp.change >= 0 ? "gained" : "lost") + " since the last paper across " + u.plural(cmp.overlap, "leaf", "leaves") + ". " + u.plural(cmp.worse.length, "leaf", "leaves") + " lost more.");
    var mx = Math.max.apply(null, [1].concat(cmp.rows.map(function (r) { return Math.max(r.then, r.now); })));
    var t = u.card([el("div", { class: "k-ex-chrow k-ex-chhead", "aria-hidden": "true" }, ["Leaf", "Topic", "Lost then", "Lost now", "Change"].map(function (h, i) { return el("span", { "data-r": i === 4 ? "" : null, text: h }); }))], "k-ex-flexcard", "exams.ch-table");
    cmp.rows.slice(0, 14).forEach(function (r) {
      var n = X.nodeOf(r.key);
      t.appendChild(el("div", { class: "k-ex-chrow" }, [el("span", { class: "k-mono k-ex-muted", text: n ? n.ref : r.key }), el("span", { class: "k-ex-ell k-ex-strong", text: n ? n.title : r.key }),
        el("span", { class: "k-ex-chbar" }, [u.tickBar(100 * r.then / mx, null, "muted"), el("span", { class: "k-mono k-ex-muted", text: r.then ? "−" + r.then : "0" })]),
        el("span", { class: "k-ex-chbar" }, [u.tickBar(100 * r.now / mx, null, r.change < 0 ? "alarm" : null), el("span", { class: "k-mono", text: r.now ? "−" + r.now : "0" })]),
        el("b", { class: "k-mono", "data-r": "", "data-tone": r.change > 0 ? "green" : r.change < 0 ? "danger" : null, text: r.change > 0 ? "▲ " + r.change : r.change < 0 ? "▼ " + (-r.change) : "—" })]));
    });
    t.appendChild(el("div", { class: "k-ex-grow" }));
    t.appendChild(el("div", { class: "k-ex-chrow k-ex-chtotal" }, [el("span"), el("span", { text: "All leaves in both" }), el("span", { class: "k-mono k-ex-muted", text: "−" + cmp.then }), el("span", { class: "k-mono", text: "−" + cmp.now }),
      el("b", { class: "k-mono", "data-r": "", "data-tone": cmp.change > 0 ? "green" : cmp.change < 0 ? "danger" : null, text: cmp.change > 0 ? "▲ " + cmp.change : cmp.change < 0 ? "▼ " + (-cmp.change) : "—" })]));
    /* the gain against what was planned: Pacing rows the planner sent on
       these leaves between the two attempts */
    var planned = {};
    if (KOS.pacing) KOS.pacing.entries().forEach(function (p) { if (p.tag && p.wb >= prev.date && p.wb <= e.date) (p.refs || []).forEach(function (r) { planned[p.subject + ":" + r] = true; }); });
    var gPlan = 0, gOther = 0;
    cmp.rows.forEach(function (r) { if (planned[r.key]) gPlan += r.change; else gOther += r.change; });
    var worst = cmp.worse.slice().sort(function (a, b) { return a.change - b.change; })[0];
    var side = el("div", { class: "k-ex-side" }, [
      u.card([u.chead("Where it came from", ""), el("p", { class: "k-ex-body", text: Object.keys(planned).length ? "Leaves the planner sent to Pacing between the two papers gave back " + Math.round(gPlan * 10) / 10 + " marks; the rest moved " + Math.round(gOther * 10) / 10 + "." : "Nothing was sent from the planner between the two papers, so the change is not tied to a plan." }),
        el("div", { class: "k-ex-grow" }), u.kv("Planned leaves", (gPlan >= 0 ? "+" : "") + Math.round(gPlan * 10) / 10), u.kv("Not planned", (gOther >= 0 ? "+" : "") + Math.round(gOther * 10) / 10)], "k-ex-flexcard k-ex-fill", "exams.ch-from"),
      worst ? (function () { var n = X.nodeOf(worst.key); return u.card([u.chead("Went the wrong way", ""), el("span", { class: "k-ex-warn", text: "▲ " + (n ? n.title : worst.key) + " · lost " + worst.now + ", was " + worst.then }),
        el("div", { class: "k-ex-grow" }), u.btn("Plan it this week", "sm", function () { KOS.show("exams", "plan"); })], "k-ex-flexcard", "exams.ch-worse"); })() : null
    ].filter(Boolean));
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [t, side]));
  }

  /* TEACHER FEEDBACK (29z, §16.6): the note syncs as text; the photo stays
     on this device (kurenai-os-papers), never uploaded */
  function feedbackDialog(e) {
    var u = U(), overlay = el("div", { class: "k-dialog-overlay" });
    function close() { overlay.remove(); }
    overlay.close = close;
    var fb = e.feedback || { note: "", qs: [], photo: null };
    var qs = fb.qs.slice(), photo = fb.photo;
    var note = el("textarea", { class: "k-input", rows: 6, "aria-label": "Note", placeholder: "What your teacher said, in your words" });
    note.value = fb.note || "";
    var slot = el("div", { class: "k-ex-photo", "data-ui": "exams.fb-photo" });
    function drawPhoto() {
      slot.innerHTML = "";
      if (photo && KOS.examPapers) {
        KOS.examPapers.getPhoto(photo, function (err, blob) {
          if (err || !blob) { slot.appendChild(u.muted("Kept on another device")); return; }
          var url = URL.createObjectURL(blob);
          slot.appendChild(el("img", { src: url, alt: "Teacher feedback photo", class: "k-ex-photoimg" }));
          slot.appendChild(u.btn("Remove", "quiet sm", function () { photo = null; drawPhoto(); }));
        });
      } else {
        var inp = el("input", { type: "file", accept: "image/*", capture: "environment", class: "k-ex-file", "aria-label": "Add photo", onchange: function () {
          var f = inp.files && inp.files[0];
          if (!f || !KOS.examPapers) return;
          KOS.examPapers.putPhoto(e.uid, f, function (err, id) { if (!err) { photo = id; drawPhoto(); } else KOS.ui.toast("That photo is too big.", true); });
        } });
        slot.appendChild(el("label", { class: "k-btn k-btn--sm k-ex-filebtn" }, ["◫ Add photo", inp]));
        slot.appendChild(u.muted("Kept on this device · not uploaded"));
      }
    }
    drawPhoto();
    var chips = el("div", { class: "k-ex-inline" }, (e.questions || []).map(function (q) {
      var b = el("button", { type: "button", class: "k-ex-qchip", "aria-pressed": String(qs.indexOf(q.q) !== -1), text: q.q, onclick: function () {
        var on = qs.indexOf(q.q) === -1; qs = on ? qs.concat(q.q) : qs.filter(function (x) { return x !== q.q; }); b.setAttribute("aria-pressed", String(on));
      } });
      return b;
    }));
    overlay.appendChild(el("div", { class: "k-dialog k-ex-dialog", "data-ui": "ui.dialog exams.fb-dialog" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "師" }), el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Teacher feedback" })]),
      el("div", { class: "k-dialog-body k-ex-dbody" }, [u.muted([e.paper || e.topic, u.pretty(e.date), e.marks != null ? e.marks + " / " + e.max : null].filter(Boolean).join(" · ")),
        el("div", { class: "k-ex-fbgrid" }, [el("div", { class: "k-ex-col" }, [el("div", { class: "k-ex-minihead", text: "Photo" }), slot]), el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Note" }), note])]),
        (e.questions || []).length ? el("div", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Link to questions" }), chips, el("span", { class: "k-ex-hint", text: "The note appears on those rows in the post-mortem." })]) : null].filter(Boolean)),
      el("div", { class: "k-dialog-foot" }, [el("span", { class: "k-spacer" }), u.btn("Cancel", "", close), u.btn("Save feedback", "primary", function () {
        T().update(e.id, { feedback: { note: note.value.trim(), qs: qs, photo: photo, at: Date.now() } });
        var msg = "Feedback saved on " + (e.paper || e.topic || "the attempt") + (qs.length ? ", linked to " + u.plural(qs.length, "question") : "") + ".";
        close(); KOS.ui.toast(msg); u.announce(msg); KOS.rerender();
      }, { "data-ui": "exams.fb-save" })])
    ]));
    KOS.ui.openDialog(overlay);
    note.focus();
  }

  KOS.examPractice = { practice: practice, attempt: attempt, feedbackDialog: feedbackDialog, tagChip: tagChip, ramp: ramp };
})();
