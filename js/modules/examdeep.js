/* Kurenai OS — modules/examdeep.js
   The Companion's exhaustive tier (roadmap 5.8 phase 6, frames 29p, 29q):
     #/exams/<id>/deep            the paper's full Companion: every shape in
                                  the scope by unit, the predicted papers,
                                  the recognition drill, the extended answers
     #/exams/<id>/deep/<shape>    one shape: the open variation worked step
                                  by step with its mark points (blind mode
                                  shows one step at a time), Method 1 against
                                  Method 2, the variations, the board's
                                  working rules, the shapes beside it, where
                                  the marks go (the examiner's reports),
                                  a sandbox, the practice set (and its
                                  five-question subtopic pack), the real
                                  questions with "Log this question"
   Everything is READ from KOS.examDeep; the only writes are clicks: the
   open variation and "worked", both per device.                          */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function E() { return KOS.exams; }
  function U() { return KOS.examUI; }
  function C() { return KOS.examCompanion; }
  function DD() { return KOS.examDeep; }
  function G() { return KOS.examGuide; }
  function html(tag, cls, str) { var n = el(tag, { class: cls }); n.innerHTML = str; return n; }
  function inline(t) { return KOS.content && KOS.content.inline ? KOS.content.inline(String(t || "")) : KOS.ui.esc(String(t || "")); }
  function typeset(n) { if (KOS.content && KOS.content.typeset) { try { KOS.content.typeset(n); } catch (e) { /* no KaTeX */ } } return n; }
  function chip(t, tone) { return el("span", { class: "k-ex-mk", "data-tone": tone || null, text: t }); }
  function chips(marks) { return el("span", { class: "k-ex-mks" }, DD().tokens(marks).map(function (t) { return chip(t); })); }
  function code(lines) {
    return el("div", { class: "k-ex-code", role: "group", "aria-label": "Code" }, lines.map(function (l, i) {
      return el("div", { class: "k-ex-code-l" }, [el("span", { class: "k-ex-code-n", "aria-hidden": "true", text: String(i + 1) }), el("span", { class: "k-ex-code-t", text: l })]);
    }));
  }
  function diff(d) { return el("span", { class: "k-ex-diff", role: "img", "aria-label": ["", "easy", "medium", "hard"][d] || "", text: ["", "●○○", "●●○", "●●●"][d] || "" }); }
  function freqText(f) {
    if (!f || !f.of) return "";
    if (!f.enough) return "too few sittings to count";
    return f.appear + " of " + f.of;
  }
  function marksText(f) { return f && f.lo != null ? (f.lo === f.hi ? String(f.lo) : f.lo + "–" + f.hi) : "—"; }
  function openVar(id) { var m = KOS.store.state.ui.examDeepVar; return m && typeof m === "object" ? m[id] || null : null; }
  function setOpenVar(id, v) { var ui = KOS.store.state.ui; ui.examDeepVar = ui.examDeepVar && typeof ui.examDeepVar === "object" ? ui.examDeepVar : {}; ui.examDeepVar[id] = v; KOS.store.save(); }
  function head(main, a) {
    U().head(main, "guide", { right: KOS.ui.tabs([
      { label: "Guide", active: false, onSelect: function () { KOS.show("exams", { tab: "guide", sub: a.id }); } },
      { label: "Full Companion", active: true, onSelect: function () { KOS.show("exams", { id: a.id, tab: "deep" }); } },
      { label: "Trend and likelihood", active: false, onSelect: function () { KOS.show("exams", { id: a.id, tab: "trend" }); } }], { variant: "workspace", label: "Companion view" }) });
  }

  function page(main, a, sub) {
    var pid = DD().paperOf(a);
    head(main, a);
    var wrap = el("div", { class: "k-ex-page k-ex-deep", "data-ui": "exams.deep", style: "--s: " + U().hueOf(a) });
    main.appendChild(wrap);
    if (!pid) {
      wrap.appendChild(KOS.ui.emptyState({ compact: true, mark: "深", title: "No full Companion for this paper yet", body: "The full Companion is written one board paper at a time. This assessment's guide is assembled from your notes in the meantime.",
        action: U().btn("Open the guide", "", function () { KOS.show("exams", { tab: "guide", sub: a.id }); }) }));
      return;
    }
    if (sub) {
      var x = DD().archetype(pid, sub);
      if (x) return shapePage(wrap, a, pid, x);
    }
    indexPage(wrap, a, pid);
  }

  /* ================= the paper's full Companion ================= */
  function indexPage(wrap, a, pid) {
    var u = U(), ix = DD().index(a), d = DD().data(pid);
    var board = d.board;
    wrap.appendChild(el("section", { class: "k-ex-ghero", "data-ui": "exams.deep-hero" }, [
      el("span", { class: "k-ex-hero-mark", "aria-hidden": "true", lang: "ja", text: "深" }),
      el("div", { class: "k-ex-ghero-mid" }, [
        el("div", { class: "k-ex-inline" }, [u.tierChip(a.tier, true), u.eyebrow(d.title + " · the full Companion")]),
        el("h1", { class: "k-ex-ghero-title", text: a.title + ": every shape, worked" }),
        el("p", { class: "k-ex-ghero-line", text: u.plural(ix.archetypes, "question shape") + " in your scope, " + u.plural(ix.variations, "worked variation") + " with " + board + "'s mark points, " +
          u.plural(ix.practice, "practice question") + " with mark schemes. Every question here is written by KurenaiOS; real ones are referenced, never shown." }),
        el("div", { class: "k-ex-actions" }, [
          u.btn("Predicted paper 1", "primary", function () { KOS.show("exams", { id: a.id, tab: "paper", sub: "1" }); }, { "data-ui": "exams.deep-predicted" }),
          u.btn("Recognition drill · 20", "", function () { G().drill(a, { recog: true }); }, { "data-ui": "exams.recog-start" }),
          ix.extended ? u.btn("Extended answers", "", function () { KOS.show("exams", { id: a.id, tab: "deep", sub: ix.extended.id }); }, { "data-ui": "exams.deep-extended" }) : null,
          board ? u.btn("Playbook · " + board, "quiet", function () { G().playbook(board, a); }) : null].filter(Boolean))]),
      el("div", { class: "k-ex-ghero-side" }, [el("div", { class: "k-ex-bigfig-row" }, [el("span", { class: "k-ex-fig", text: String(worked(ix)) }), u.muted("of " + ix.variations + " worked")]),
        u.muted("Worked is yours to mark, on this device.", "k-ex-small")])]));
    if (!ix.units.length) {
      wrap.appendChild(KOS.ui.emptyState({ compact: true, mark: "深", title: "Nothing of " + d.title + " is in this scope", body: "Widen the scope to bring its shapes in." }));
      return;
    }
    var host = el("div", { class: "k-ex-deep-units", "data-ui": "exams.deep-units" });
    ix.units.forEach(function (un) {
      host.appendChild(u.card([u.chead(un.unit + " " + un.title, u.plural(un.rows.length, "shape"))].concat(un.rows.map(function (r) {
        return el("button", { type: "button", class: "k-ex-arow", "data-ui": "exams.deep-shape", onclick: function () { KOS.show("exams", { id: a.id, tab: "deep", sub: r.id }); } }, [
          el("span", { class: "k-ex-arow-t" }, [el("b", { text: r.title }), u.muted(r.ref + " " + r.leaf, "k-ex-small")]),
          el("span", { class: "k-mono k-ex-arow-f", text: freqText(r.freq) || "not indexed" }),
          el("span", { class: "k-mono k-ex-arow-v", "data-done": r.worked && r.worked === r.variations ? "" : null, text: (r.worked ? r.worked + "/" : "") + r.variations })]);
      })), "", "exams.deep-unit"));
    });
    wrap.appendChild(host);
    wrap.appendChild(el("p", { class: "k-ex-foot", text: "Frequency is evidence, not prophecy: anything in the specification can appear. The last figure on each row is the variations you have worked of those written." }));
    typeset(wrap);
  }
  function worked(ix) { return ix.units.reduce(function (s, un) { return s + un.rows.reduce(function (t, r) { return t + r.worked; }, 0); }, 0); }

  /* ================= one shape (29p, 29q) ================= */
  function shapePage(wrap, a, pid, x) {
    var u = U(), A = x.a, d = x.d, board = d.board;
    var vs = A.variations, cur = vs.filter(function (v) { return v.v === openVar(A.id); })[0] || vs[0];
    var unit = x.leaf ? KOS.spec.node(d.sid, x.leaf.unit) : null;
    /* the breadcrumb */
    wrap.appendChild(el("div", { class: "k-ex-crumb", "data-ui": "exams.deep-crumb" }, [
      el("button", { type: "button", class: "k-link", text: d.title, onclick: function () { KOS.show("exams", { id: a.id, tab: "deep" }); } }),
      el("span", { "aria-hidden": "true", text: "›" }), unit ? el("span", { text: unit.ref + " " + unit.title }) : el("span", { text: "Extended answers" }),
      x.leaf ? el("span", { "aria-hidden": "true", text: "›" }) : null, x.leaf ? el("span", { text: x.leaf.ref + " " + x.leaf.title }) : null,
      el("span", { "aria-hidden": "true", text: "›" }), el("b", { text: A.title }), el("span", { class: "k-ex-grow" }),
      u.tierChip(a.tier, true),
      board ? u.btn("Playbook · " + board, "sm", function () { G().playbook(board, a); }) : null,
      x.leaf ? u.btn("Open " + x.leaf.ref + " notes", "quiet sm", function () { KOS.show("ref", { subject: d.sid, ref: x.leaf.ref }); }) : null].filter(Boolean)));
    var left = el("div", { class: "k-ex-col" }), side = el("div", { class: "k-ex-side" });
    if (cur) {
      left.appendChild(variationCard(a, pid, A, cur, vs, board));
      if (cur.methods.length) left.appendChild(el("div", { class: "k-ex-grid-even k-ex-methods" }, cur.methods.map(methodCard)));
    } else left.appendChild(u.card([u.quiet("No worked variations of this shape yet", "Its practice set is below.")]));
    if (x.leaf) left.appendChild(marksGoCard(x, cur));
    left.appendChild(variationsCard(a, pid, A, vs, cur));
    /* the side */
    side.appendChild(u.card([u.chead(board + " working rules", "for this shape")].concat(A.rules.map(function (t, i) {
      return el("div", { class: "k-ex-rule" }, [el("span", { class: "k-mono k-ex-muted", text: String(i + 1) }), html("span", "", inline(t))]);
    })), "", "exams.deep-rules"));
    if (x.leaf) { side.appendChild(siblingsCard(a, pid, x)); side.lastChild.classList.add("k-ex-fill"); }
    else {
      /* the extended answers: no shapes beside them, so the side carries the
         report's verdict and rides along with the long answer */
      side.appendChild(marksGoCard(x, cur));
      side.setAttribute("data-sticky", "");
    }
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [left, side]));
    /* the bottom row: sandbox, practice set, subtopic pack */
    var row = [];
    var lab = x.leaf && KOS.sims && KOS.sims.forRef ? KOS.sims.forRef(d.sid, x.leaf.ref)[0] : null;
    if (lab) row.push(sandboxCard(lab));
    if (x.practice.length) row.push(practiceCard(a, pid, x));
    row.push(el("div", { class: "k-ex-col" }, [realCard(a, pid, x), paperCard(a, x)]));
    if (row.length) wrap.appendChild(el("div", { class: "k-ex-deep-row", "data-n": String(row.length) }, row));
    typeset(wrap);
  }

  /* the open variation: question, steps with their mark points, the trap */
  function variationCard(a, pid, A, v, vs, board) {
    var u = U(), blind = false, shown = 0;
    var scoring = v.steps.length;
    var stepsEl = el("div", { class: "k-ex-steps", "data-ui": "exams.deep-steps" });
    var ctrl = el("div", { class: "k-ex-actions" });
    var done = DD().isWorked(pid, A.id, v.v);
    function draw() {
      stepsEl.textContent = "";
      if (v.levels) stepsEl.appendChild(levelsEl(v.levels));
      v.steps.forEach(function (s, i) {
        var hide = blind && i >= shown;
        stepsEl.appendChild(el("div", { class: "k-ex-step", "data-ui": "exams.deep-step", hidden: hide ? "" : null }, [
          html("div", "k-ex-step-t", inline(s.text)),
          el("div", { class: "k-ex-step-m" }, [s.marks ? chips(s.marks) : el("span", { class: "k-ex-muted k-ex-small", text: v.levels ? "a point to make" : "working" }), s.why ? html("span", "k-ex-muted k-ex-small", inline(s.why)) : null].filter(Boolean))]));
      });
      ctrl.textContent = "";
      if (blind && shown < scoring) {
        ctrl.appendChild(u.btn("Show the next step", "primary sm", function () { shown++; draw(); typeset(stepsEl); u.announce("Step " + shown + " of " + scoring + " shown."); if (shown >= scoring) finishBlind(); }, { "data-ui": "exams.deep-next-step" }));
        ctrl.appendChild(u.btn("Show all", "sm", function () { shown = scoring; draw(); typeset(stepsEl); finishBlind(); }));
      } else {
        ctrl.appendChild(u.btn("Try it blind first", "primary sm", function () { blind = true; shown = 0; draw(); u.announce("Blind: the steps are hidden. Work it, then show one step at a time."); }, { "data-ui": "exams.deep-blind" }));
      }
      /* 30l: the variation as a Write it out drill (not for levels of response) */
      if (KOS.inkDrills && !v.levels && v.steps.length > 1) ctrl.appendChild(u.btn("Write it out", "sm", function () {
        KOS.inkDrills.writeOut({ title: "Variation " + v.v + " · " + v.t, given: [(v.ctx ? v.ctx + " " : "") + v.q], result: null,
          badge: "Written by KurenaiOS, not a board paper",
          steps: v.steps.map(function (s) { return { m: s.text, mk: Array.isArray(s.marks) ? s.marks.join(" ") : s.marks || "", n: s.why || "" }; }),
          item: "writeout:" + pid + ":" + A.id + ":" + v.v, paper: board === "Edexcel" ? "squared" : "lined" });
      }, { "data-ui": "exams.deep-writeout" }));
      var i = vs.indexOf(v), nx = vs[i + 1];
      if (nx) ctrl.appendChild(u.btn("Next: Variation " + nx.v, "sm", function () { setOpenVar(A.id, nx.v); KOS.rerender(); }, { "data-ui": "exams.deep-next" }));
      ctrl.appendChild(u.btn(done ? "✓ Worked" : "Mark as worked", "quiet sm", function () { done = !done; DD().setWorked(pid, A.id, v.v, done); u.announce(done ? "Variation " + v.v + " marked worked." : "Variation " + v.v + " unmarked."); KOS.rerender(); }, { "aria-pressed": done ? "true" : "false", "data-ui": "exams.deep-worked" }));
      var w = vs.filter(function (y) { return DD().isWorked(pid, A.id, y.v); }).map(function (y) { return y.v; });
      ctrl.appendChild(el("span", { class: "k-ex-grow" }));
      ctrl.appendChild(u.muted(w.length ? "Variations " + w.join(", ") + " worked · " + v.v + " open" : "Variation " + v.v + " open", "k-ex-small"));
    }
    function finishBlind() { if (!done) { done = true; DD().setWorked(pid, A.id, v.v, true); u.announce("Variation " + v.v + " worked."); draw(); } }
    draw();
    var B = window.KOS_EXAMS && KOS_EXAMS.playbook && KOS_EXAMS.playbook[board];
    return u.card([
      el("div", { class: "k-ex-inline k-ex-vhead" }, [el("span", { class: "k-ex-vkey", "aria-hidden": "true", text: v.v }), el("h2", { class: "k-ex-vtitle", text: "Variation " + v.v + " · " + v.t }), el("span", { class: "k-ex-grow" }),
        u.muted(u.plural(v.m, "mark") + " · " + (v.levels ? "levels of response" : board === "AQA" ? "AQA mark points" : (board || "") + " conventions"))]),
      el("div", { class: "k-ex-vq" }, [v.ctx ? html("p", "", inline(v.ctx)) : null, v.code ? code(v.code) : null, html("p", "", inline(v.q) + " <span class=\"k-mono k-ex-muted\">(" + v.m + ")</span>")].filter(Boolean)),
      u.muted("Written by KurenaiOS · " + (B && B.title ? B.title + " conventions · " : "") + "not a board question", "k-ex-small"),
      stepsEl,
      v.trap ? el("div", { class: "k-ex-vtrap", "data-ui": "exams.deep-trap" }, [el("span", { class: "k-ex-trap-mark", "aria-hidden": "true", text: "!" }), html("span", "", "<b>The trap:</b> " + inline(v.trap))]) : null,
      ctrl], "", "exams.deep-var");
  }
  function levelsEl(levels) {
    return el("div", { class: "k-ex-levels" }, levels.map(function (l) {
      return el("div", { class: "k-ex-lvl" }, [el("b", { text: "Level " + l[0] }), U().muted(l[1]), el("span", { text: l[2] })]);
    }));
  }
  function methodCard(m) {
    var u = U();
    return u.card([el("div", { class: "k-ex-inline" }, [el("b", { text: m.name }), m.rec ? el("span", { class: "k-chip", "data-tone": "teal", text: "Recommended" }) : null, el("span", { class: "k-ex-grow" }), u.muted(u.plural(m.lines.length, "line"))].filter(Boolean)),
      html("p", "k-ex-small", inline(m.when)),
      el("div", { class: "k-ex-mlines" }, m.lines.map(function (l, i) {
        return el("div", { class: "k-ex-mline" }, [el("span", { class: "k-mono k-ex-muted", text: String(i + 1) }), html("span", "", inline(l.text)), l.marks ? chips(l.marks) : el("span")]);
      })),
      m.slip ? html("p", "k-ex-small", "<b>When it slips:</b> " + inline(m.slip)) : null].filter(Boolean), "k-ex-fill", "exams.deep-method");
  }
  function variationsCard(a, pid, A, vs, cur) {
    var u = U(), w = vs.filter(function (v) { return DD().isWorked(pid, A.id, v.v); }).length;
    return u.card([u.chead("Variations", (vs.length ? vs[0].v + "–" + vs[vs.length - 1].v : "") + (w ? " · " + w + " worked" : "")),
      el("div", { class: "k-ex-vgrid", role: "list" }, vs.map(function (v) {
        var on = cur && v.v === cur.v, ok = DD().isWorked(pid, A.id, v.v);
        return el("button", { type: "button", role: "listitem", class: "k-ex-vtile", "aria-current": on ? "true" : null, "data-ui": "exams.deep-vtile", onclick: function () { if (!on) { setOpenVar(A.id, v.v); KOS.rerender(); U().announce("Variation " + v.v + " open."); } } }, [
          el("span", { class: "k-ex-inline" }, [el("span", { class: "k-ex-vkey k-ex-vkey--sm", "aria-hidden": "true", text: v.v }), el("b", { class: "k-ex-ell", text: v.t })]),
          u.muted(u.plural(v.m, "mark") + " · " + u.plural(v.steps.length, "step"), "k-ex-small"),
          el("span", { class: "k-ex-small", "data-tone": ok ? "ok" : null, text: ok ? "✓ worked" : on ? "open now" : "not yet" })]);
      }))], "k-ex-fill", "exams.deep-vars");
  }
  function siblingsCard(a, pid, x) {
    var u = U(), grp = x.group, list = x.siblings, cur = list.indexOf(x.a), CAP = 8;
    /* at most eight rows, the open shape always among them */
    var show = list.length <= CAP ? list : list.slice(Math.max(0, Math.min(cur - 3, list.length - CAP)), Math.max(0, Math.min(cur - 3, list.length - CAP)) + CAP);
    return u.card([u.chead("Shapes in " + (grp ? grp.ref + " " + grp.title : "this paper"), x.freq.of ? "the last " + x.freq.of + " sittings" : "")].concat(show.map(function (s) {
      var inst = DD().instances(pid, s), f = DD().freq(pid, inst), on = s.id === x.a.id;
      return el("button", { type: "button", class: "k-ex-arow k-ex-arow--sm", "aria-current": on ? "true" : null, "data-ui": "exams.deep-sib", onclick: function () { if (!on) KOS.show("exams", { id: a.id, tab: "deep", sub: s.id }); } }, [
        el("span", { class: "k-ex-arow-t k-ex-ell", text: s.title }), el("span", { class: "k-mono k-ex-arow-f", text: freqText(f) || "—" }), el("span", { class: "k-mono k-ex-arow-v", text: marksText(f) })]);
    }), [list.length > show.length ? u.linkBtn("All " + list.length + " shapes in " + grp.ref + " ›", function () { KOS.show("exams", { id: a.id, tab: "deep" }); }) : null,
      u.muted("Frequency is evidence, not prophecy: anything in the specification can appear.", "k-ex-foot")].filter(Boolean)), "", "exams.deep-sibs");
  }
  function marksGoCard(x, cur) {
    var u = U(), rows = x.traps.filter(function (t) { return t.cite; }), own = x.traps.filter(function (t) { return !t.cite; });
    var kids = [u.chead("Where the marks go", rows.length ? "from the examiner's reports" : "from the mark schemes")];
    rows.concat(own).forEach(function (t) {
      kids.push(el("div", { class: "k-ex-trapline", "data-ui": "exams.deep-report" }, [html("div", "k-ex-small", inline(t.text)), t.cite ? u.muted("Examiner's report · " + t.cite, "k-ex-small") : null].filter(Boolean)));
    });
    if (!rows.length && !own.length) kids.push(html("div", "k-ex-small", cur && cur.trap ? inline(cur.trap) : "No examiner's report in your folder covers this shape yet; the open variation's steps say where each mark is earned."));
    return u.card(kids, "", "exams.deep-marks");
  }
  function realCard(a, pid, x) {
    var u = U(), inst = x.instances.filter(function (q) { return q.sitting !== "specimen" && q.sitting !== "sample"; });
    var uniq = [];
    if (x.leaf && C().tags) {
      var t = C().tags();
      (t ? t.unique : []).forEach(function (q) { if (q[0] === pid && (q[5] || [])[0] === x.leaf.key) uniq.push({ sitting: q[1], q: q[3], marks: q[4], title: q[6] }); });
    }
    var rows = inst.slice(0, 6).map(function (q) { return ptr(a, pid, q); });
    if (uniq.length) rows.push(u.muted("Also examined, as a one-off question:", "k-ex-small"));
    uniq.forEach(function (q) { rows.push(ptr(a, pid, q)); });
    if (!rows.length) rows.push(u.muted("Not examined as this shape in the indexed sittings. Anything in the specification can appear.", "k-ex-small"));
    if (inst.length > 6) rows.push(u.muted("＋ " + (inst.length - 6) + " earlier: " + inst.slice(6).map(function (q) { return C().sittingName(q.sitting).replace(/^(\w{3})\w*/, "$1") + " " + q.q; }).join(", "), "k-ex-small"));
    return u.card([u.chead("Real questions", "references only")].concat(rows, [el("span", { class: "k-ex-grow" }), u.muted("Open your own copy from the Paper library. No paper text is shown here.", "k-ex-foot")]), "k-ex-fill", "exams.deep-real");
  }
  /* where this shape goes next: as a paper, in the drill */
  function paperCard(a, x) {
    var u = U();
    return u.card([u.chead("Practise it as a paper", "written by KurenaiOS"),
      html("p", "k-ex-small", "A predicted paper draws on every shape in your scope, weighted to the paper's high-yield topics" + (x.leaf ? "; the subtopic pack is five questions from " + KOS.ui.esc(x.leaf.ref) + " alone." : ".")),
      el("div", { class: "k-ex-actions" }, [u.btn("Predicted paper 1", "sm", function () { KOS.show("exams", { id: a.id, tab: "paper", sub: "1" }); }),
        u.btn("Recognition drill · 20", "quiet sm", function () { G().drill(a, { recog: true }); })])], "", "exams.deep-paper");
  }
  function ptr(a, pid, q) {
    var u = U();
    return el("div", { class: "k-ex-ptr k-ex-ptr--2" }, [el("div", { class: "k-ex-grow" }, [el("div", { class: "k-mono k-ex-small", text: C().sittingName(q.sitting) + " · " + q.q + " · " + u.plural(q.marks, "mark") }), u.muted(q.title, "k-ex-small")]),
      u.btn("Log it", "sm", function () { KOS.trackerLog({ assessmentId: a.id, index: { paper: pid, sitting: q.sitting } }, function () { KOS.rerender(); }); }, { "data-ui": "exams.deep-log", "aria-label": "Log " + C().sittingName(q.sitting) + " " + q.q }) ]);
  }
  /* the leaf's own lab, mounted once the card is on the page */
  function sandboxCard(lab) {
    var u = U(), host = el("div", { class: "k-ex-sandbox", "data-ui": "exams.deep-sandbox" });
    requestAnimationFrame(function () {
      if (!host.isConnected) return;
      try { KOS.sims.embed(host, lab); } catch (e) { host.appendChild(u.muted("The lab could not start here; open it from Labs.")); }
    });
    return u.card([u.chead("Sandbox", lab.title || lab.id), host, el("span", { class: "k-ex-grow" }),
      el("div", { class: "k-ex-actions" }, [u.btn("Open in Labs", "quiet sm", function () { KOS.sims.open(lab.id); })])], "k-ex-fill", "exams.deep-lab");
  }
  function practiceCard(a, pid, x) {
    var u = U(), showMs = false, list = el("ol", { class: "k-ex-pset", "data-ui": "exams.deep-practice" });
    var mine = x.practice.filter(function (p) { return !p.arch || p.arch === x.a.id; }), rest = x.practice.filter(function (p) { return p.arch && p.arch !== x.a.id; });
    var all = mine.concat(rest);
    function draw() {
      list.textContent = "";
      all.forEach(function (p, i) {
        list.appendChild(el("li", { class: "k-ex-pq-row" }, [el("span", { class: "k-mono", text: String(i + 1) }),
          el("div", {}, [p.ctx ? html("p", "", inline(p.ctx)) : null, p.code ? code(p.code) : null, html("div", "", inline(p.q)), showMs ? html("div", "k-ex-ms", p.ms.map(inline).join("<br>")) : null].filter(Boolean)),
          el("span", { class: "k-ex-pq-meta" }, [diff(p.d), el("span", { class: "k-mono k-ex-muted", text: "(" + p.marks + ")" })])]));
      });
      typeset(list);
    }
    draw();
    var marks = all.reduce(function (s, p) { return s + p.marks; }, 0);
    var mins = Math.max(5, Math.round(marks * 1.2));
    var msB = u.btn("Mark schemes", "quiet sm", function () { showMs = !showMs; msB.setAttribute("aria-pressed", showMs ? "true" : "false"); draw(); }, { "aria-pressed": "false", "data-ui": "exams.deep-ms" });
    return u.card([u.chead("Practice set", u.plural(all.length, "question") + " · " + u.plural(marks, "mark") + " · schemes included"), list, el("span", { class: "k-ex-grow" }),
      el("div", { class: "k-ex-actions" }, [x.leaf ? u.btn("Start, timed · " + mins + " min", "primary sm", function () { KOS.show("exams", { id: a.id, tab: "paper", sub: "set-" + x.leaf.ref }); }, { "data-ui": "exams.deep-set" }) : null,
        x.leaf && all.length >= 5 ? u.btn("Subtopic pack · 5", "sm", function () { KOS.show("exams", { id: a.id, tab: "paper", sub: "pack-" + x.leaf.ref }); }, { "data-ui": "exams.deep-pack", title: "Five questions, easiest first, as a short paper to print or sit" }) : null, msB].filter(Boolean))], "k-ex-fill", "exams.deep-pset");
  }
  /* the guide's section: the full Companion's shapes in the scope */
  function guideSection(a) {
    var u = U(), ix = DD().index(a);
    if (!ix || !ix.units.length) return null;
    var rows = [];
    ix.units.forEach(function (un) { un.rows.forEach(function (r) { rows.push(r); }); });
    rows.sort(function (x, y) { return (y.freq.appear || 0) - (x.freq.appear || 0); });
    return el("div", { class: "k-ex-deep-g" }, [
      el("div", { class: "k-ex-shapes" }, rows.slice(0, 9).map(function (r) {
        return el("button", { type: "button", class: "k-ex-shape k-ex-shape--b", "data-ui": "exams.deep-gshape", onclick: function () { KOS.show("exams", { id: a.id, tab: "deep", sub: r.id }); } }, [
          el("div", { class: "k-ex-inline" }, [el("b", { class: "k-ex-grow", text: r.title }), el("span", { class: "k-chip", text: freqText(r.freq) || "not indexed" })]),
          u.muted(r.ref + " " + r.leaf + " · " + u.plural(r.variations, "variation") + (r.worked ? " · " + r.worked + " worked" : ""), "k-ex-small")]);
      })),
      el("div", { class: "k-ex-actions" }, [u.btn("All " + ix.archetypes + " shapes ›", "primary sm", function () { KOS.show("exams", { id: a.id, tab: "deep" }); }, { "data-ui": "exams.deep-open" }),
        u.btn("Recognition drill · 20", "sm", function () { G().drill(a, { recog: true }); }),
        el("span", { class: "k-ex-grow" }), u.muted(u.plural(ix.variations, "worked variation") + " · " + u.plural(ix.practice, "practice question"), "k-ex-small")])]);
  }

  KOS.examDeepView = { page: page, guideSection: guideSection };
})();
