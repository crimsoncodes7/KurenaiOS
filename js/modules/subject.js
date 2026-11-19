/* Kurenai OS — modules/subject.js
   A subject's page: its units by paper, analytics, the review strip, Continue, Weakest,
   deadlines and resources, and the labs reachable per subject.
   Split out of hub.js (W8, the quality audit's AP-09); the shared
   derivations, the spine and the spec renderers stay in hub.js and
   reach this file through KOS.hub._. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store, H = KOS.hub._;
  var BYREF = H.BYREF, LEAVES = H.LEAVES, PAPER_NOTE = H.PAPER_NOTE, STATUS = H.STATUS, SUBJECTS = H.SUBJECTS, SUBJ_HUE = H.SUBJ_HUE,
    cardHead = H.cardHead, hideTree = H.hideTree, leafPercent = H.leafPercent, paperLabel = H.paperLabel, pctOf = H.pctOf, pctText = H.pctText,
    ratioText = H.ratioText, subjectCardStats = H.subjectCardStats, subjectPapers = H.subjectPapers, subjectStats = H.subjectStats;

  /* labs reachable per subject now the rail entries are gone */
  var PRACTICE = {
    compsci: [
      ["Simulations", "Turing machine, BNF, subnets, floating point, compression, ciphers and more", function () { KOS.store.state.ui.simSubj = "compsci"; KOS.store.state.ui.simArea = "all"; KOS.show("sims"); }, null],
      ["Worked Examples", "RPN conversion, file sizes, parity, subnetting and Big-O, your numbers", function () { KOS.store.state.worked.last = "rpn"; KOS.show("worked"); }, null],
      ["Trace Lab", "Stacks, queues, lists & trees animated with trace tables", function () { KOS.show("trace"); }, { view: "trace" }],
      ["OOP Sandbox", "Drag class blocks, draw inheritance, read the C#", function () { KOS.show("oop"); }, { view: "oop" }],
      ["Logic Lab", "Boolean expressions with live truth tables", function () { KOS.sims.open("logic-lab"); }, { sim: "logic-lab" }],
      ["Sort Visualiser", "Bubble vs merge — watch the Big-O gap appear", function () { KOS.sims.open("sort-viz"); }, { sim: "sort-viz" }],
      ["FSM Lab", "Feed strings through acceptor state machines", function () { KOS.sims.open("fsm-lab"); }, { sim: "fsm-lab" }]
    ],
    maths: [
      ["Worked Examples", "Mark-scheme walkthroughs by paper, your numbers", function () { KOS.show("worked"); }, null],
      ["Simulations", "Trapezium rule, cobweb diagrams, normal curves, projectiles, moments and more", function () { KOS.store.state.ui.simSubj = "maths"; KOS.store.state.ui.simArea = "all"; KOS.show("sims"); }, null],
      ["Function Transformer", "y = a·f(bx + c) + d with exam wording written for you", function () { KOS.sims.open("fn-transform"); }, { sim: "fn-transform" }]
    ],
    it: []
  };
  /* gate state for a practice tile: null = free, else governor verdict */
  function practiceAccess(gate) {
    if (!gate || !KOS.governor) return { ok: true };
    return gate.view ? KOS.governor.viewAccess(gate.view) : KOS.governor.simAccess(gate.sim);
  }

  function compareModal(sid) {
    var deepLeaves = SUBJECTS.reduce(function (all, subject) {
      return all.concat(LEAVES[subject].filter(function (l) { return KOS.content.has(subject, l.ref); }).map(function (l) {
        return { sid: subject, ref: l.ref, title: l.title };
      }));
    }, []);
    if (deepLeaves.length < 2) { KOS.ui.toast("Need at least two deep-content topics to compare.", true); return; }
    /* Graphite step 8 tidy-up: no frame draws this dialog, so it speaks the
       Study vocabulary (frames 8a–8e); KOS.ui.openDialog owns Escape */
    var overlay = el("div", { class: "k-dialog-overlay", onclick: function (e) { if (e.target === overlay) close(); } });
    function close() { overlay.remove(); }

    function picker(defIdx) {
      return el("select", { class: "k-input k-cmp-pick" }, deepLeaves.map(function (l, i) {
        var o = el("option", { value: l.sid + ":" + l.ref, text: KOS_DATA[l.sid].name + " · " + l.ref + " — " + l.title });
        if (i === defIdx) o.selected = true;
        return o;
      }));
    }
    var first = deepLeaves.findIndex(function (l) { return l.sid === sid; });
    var selA = picker(first < 0 ? 0 : first), selB = picker((first < 0 ? 0 : first) + 1);
    if (selB.selectedIndex < 0) selB.selectedIndex = 1;
    selA.setAttribute("aria-label", "Topic A"); selB.setAttribute("aria-label", "Topic B");
    var mode = "overview", head = el("div", { class: "k-cmp-head", "data-ui": "study.compare-sticky-head" }), body = el("div", { class: "k-cmp-body", "data-ui": "study.compare-body" });

    function topic(value) {
      var cut = value.indexOf(":"), tsid = value.slice(0, cut), ref = value.slice(cut + 1);
      return { sid: tsid, ref: ref, leaf: BYREF[tsid][ref], content: KOS.content.get(tsid, ref) };
    }
    function cleanText(value) { return String(value || "").replace(/[*`]/g, "").replace(/\s+/g, " ").trim(); }
    function textOf(value) {
      if (typeof value === "string") return cleanText(value);
      if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join(" ");
      if (!value || typeof value !== "object") return "";
      if (value.kv) return value.kv.map(function (p) { return cleanText(p[0]) + ": " + cleanText(p[1]); }).join(" ");
      if (value.callout) return textOf(value.callout.body);
      if (value.h) return cleanText(value.h);
      return "";
    }
    function callouts(c, kind) {
      var out = [];
      function visit(blocks) {
        (blocks || []).forEach(function (block) {
          if (!block || typeof block !== "object") return;
          if (block.callout) {
            if (!kind || block.callout.t === kind) out.push(block.callout);
            if (Array.isArray(block.callout.body)) visit(block.callout.body);
          }
        });
      }
      visit(c.notes); return out;
    }
    function overview(c) {
      var out = [];
      (c.notes || []).forEach(function (block) {
        var value = block && block.callout ? textOf(block.callout.body) : textOf(block);
        if (value.length > 45 && out.indexOf(value) === -1) out.push(value);
      });
      return out.slice(0, 4);
    }
    function terms(c) {
      var out = [];
      function visit(blocks) {
        (blocks || []).forEach(function (block) {
          if (!block || typeof block !== "object") return;
          if (block.kv) block.kv.forEach(function (p) { out.push([cleanText(p[0]), cleanText(p[1])]); });
          if (block.callout) {
            if (block.callout.h && (block.callout.t === "def" || block.callout.t === "memorise")) {
              out.push([cleanText(block.callout.h), textOf(block.callout.body)]);
            }
            if (Array.isArray(block.callout.body)) visit(block.callout.body);
          }
        });
      }
      visit(c.notes);
      return out.filter(function (p, i) { return p[0] && out.findIndex(function (other) { return other[0].toLowerCase() === p[0].toLowerCase(); }) === i; });
    }
    function sectionFor(tsid, ref) {
      var found = "";
      function walk(node, section) {
        if (node.ref === ref) { found = section.title; return true; }
        return (node.children || []).some(function (child) { return walk(child, section); });
      }
      (KOS_DATA[tsid].sections || []).some(function (section) { return walk(section, section); });
      return found || "Specification";
    }
    function info(t) {
      var p = store.peekProgress(t.sid, t.ref) || {}, e = KOS.rag.effective(t.sid, t.ref), c = t.content;
      var pct = p.status === "done" ? 100 : ((p.check || []).filter(Boolean).length * 25);
      var status = p.status || "none";
      return { code: t.ref, title: t.leaf.title, subject: KOS_DATA[t.sid].name, section: sectionFor(t.sid, t.ref), status: (STATUS.find(function (s) { return s[0] === status; }) || [status, status])[1], pct: pct,
        confidence: e.band ? KOS.rag.BANDS[e.band].label : "Unrated", mastery: e.auto ? e.auto.score + "%" : "No evidence",
        cards: (c.flashcards || []).length, questions: (c.quiz || []).length + (c.exam || []).length };
    }
    function summaryCard(t, side) {
      var d = info(t);
      return el("div", { class: "k-cmp-topic", "data-ui": "study.compare-topic", "data-side": side }, [
        el("span", { class: "k-cmp-code", text: (side === "a" ? "A · " : "B · ") + d.code }), el("b", { class: "k-cmp-title", text: d.title }), el("span", { class: "k-cmp-sub", "data-ui": "part.sub", text: d.subject + " · " + d.section }),
        el("div", { class: "k-cmp-metrics" }, [
          el("span", { text: d.status + " · " + d.pct + "% complete" }), el("span", { text: d.confidence + " confidence" }),
          el("span", { text: d.mastery + " mastery" }), el("span", { text: d.cards + " cards · " + d.questions + " questions" })
        ])
      ]);
    }
    function column(title, items, empty) {
      return el("div", { class: "k-cmp-cell" }, [el("span", { class: "k-kicker", text: title })].concat(items && items.length ? items : [el("p", { class: "k-cmp-empty", text: empty || "No matching content." })]));
    }
    function details(title, a, b, render, open) {
      var attrs = { class: "k-cmp-row", "data-ui": "study.compare-row" };
      if (open !== false) attrs.open = true;
      var d = el("details", attrs, [el("summary", { text: title })]);
      var cells = el("div", { class: "k-cmp-cells", "data-ui": "study.compare-row-cells" }, [render(a, "Topic A"), render(b, "Topic B")]);
      d.appendChild(cells); return d;
    }
    function renderRows(a, b) {
      body.innerHTML = "";
      var common = terms(a.content).map(function (p) { return p[0].toLowerCase(); }).filter(function (x) { return terms(b.content).some(function (p) { return p[0].toLowerCase() === x; }); });
      body.appendChild(el("div", { class: "k-cmp-signals" }, [
        el("span", { class: "k-chip", "data-tone": common.length ? "teal" : "muted", text: common.length ? common.length + " shared key term" + (common.length === 1 ? "" : "s") : "No identical key terms" }),
        el("span", { class: "k-chip", "data-tone": "muted", text: a.sid === b.sid ? "Same subject" : "Cross-subject comparison" }),
        el("span", { class: "k-chip", "data-tone": Math.abs(info(a).questions - info(b).questions) ? "amber" : "muted", text: Math.abs(info(a).questions - info(b).questions) ? "Uneven question coverage" : "Comparable question coverage" })
      ]));
      if (mode === "overview") {
        body.appendChild(details("What each topic is about", a, b, function (t, label) { return column(label, overview(t.content).map(function (x) { return el("p", { text: x }); }), "No overview note."); }));
        body.appendChild(details("Where they overlap or diverge", a, b, function (t, label) {
          var own = terms(t.content).slice(0, 8).map(function (p) { return el("div", { class: "k-cmp-term", "data-shared": common.indexOf(p[0].toLowerCase()) !== -1 ? "" : null }, [el("b", { text: p[0] }), el("span", { text: p[1] })]); });
          return column(label, own, "No named terms yet.");
        }));
      } else if (mode === "specification") {
        body.appendChild(details("Specification requirements", a, b, function (t, label) { return column(label, (t.leaf.content || []).map(function (x) { return el("p", { text: x }); }), "No specification bullets."); }));
        body.appendChild(details("Exam-board emphasis", a, b, function (t, label) { return column(label, (t.leaf.info || []).slice(0, 12).map(function (x) { return el("p", { text: x }); }), "No supplementary specification detail."); }));
        KOS.content.typeset(body);   // the Maths spec's $…$ (CM-01)
      } else if (mode === "notes") {
        var pagesA = KOS.content.splitPages(a.content.notes), pagesB = KOS.content.splitPages(b.content.notes);
        for (var page = 0; page < Math.max(pagesA.length, pagesB.length); page++) (function (pa, pb, index) {
          var title = "Notes · " + (pa ? pa.title : "No matching section") + " / " + (pb ? pb.title : "No matching section");
          body.appendChild(details(title, pa, pb, function (p, label) {
            if (!p) return column(label, [], "This topic has no matching note section.");
            var art = el("article", { class: "k-prose k-notes k-cmp-notes", "data-ui": "study.compare-notes", html: KOS.content.renderBlocks(p.blocks) });
            KOS.content.typeset(art); return column(label + " · " + p.title, [art], "No notes.");
          }, index === 0));
        })(pagesA[page], pagesB[page], page);
      } else if (mode === "terms") {
        body.appendChild(details("Key terms", a, b, function (t, label) { return column(label, terms(t.content).map(function (p) { return el("div", { class: "k-cmp-term", "data-shared": common.indexOf(p[0].toLowerCase()) !== -1 ? "" : null }, [el("b", { text: p[0] }), el("span", { text: p[1] })]); }), "No key terms."); }));
      } else if (mode === "exam") {
        body.appendChild(details("Exam focus", a, b, function (t, label) { return column(label, (t.content.exam || []).map(function (q) { return el("div", { class: "k-cmp-q" }, [el("b", { text: q.marks + " marks" }), el("span", { text: q.q })]); }), "No exam questions available."); }));
        body.appendChild(details("Common confusions", a, b, function (t, label) { return column(label, callouts(t.content, "miscon").map(function (c) { return el("div", { class: "k-cmp-q" }, [el("b", { text: c.h || "Misconception" }), el("span", { text: textOf(c.body) })]); }), "No explicit misconception note."); }));
      } else {
        body.appendChild(details("Progress and confidence", a, b, function (t, label) { var d = info(t); return column(label, [el("div", { class: "k-cmp-progress" }, [el("b", { text: d.pct + "% complete" }), el("span", { text: d.status }), el("span", { text: d.confidence + " confidence · " + d.mastery + " mastery" }), el("span", { text: d.cards + " cards · " + d.questions + " questions" })])]); }));
      }
    }
    function update(changed) {
      if (selA.value === selB.value) {
        var other = changed === "a" ? selB : selA;
        other.selectedIndex = (other.selectedIndex + 1) % other.options.length;
      }
      var a = topic(selA.value), b = topic(selB.value);
      head.innerHTML = ""; head.appendChild(summaryCard(a, "a")); head.appendChild(summaryCard(b, "b")); renderRows(a, b); body.scrollTop = 0;
    }
    selA.onchange = function () { update("a"); }; selB.onchange = function () { update("b"); };
    function comparisonNote() {
      var key = [selA.value, selB.value].sort().join("|");
      var study = store.state.study = store.state.study || {};
      var notes = study.compareNotes = study.compareNotes || {};
      var noteOverlay = el("div", { class: "k-dialog-overlay", onclick: function (e) { if (e.target === noteOverlay) noteOverlay.remove(); } });
      var ta = el("textarea", { class: "k-input k-cmp-note-in", "data-ui": "ui.note-area", rows: "6", "aria-label": "Comparison note", placeholder: "Capture the distinction, shared rule, or question to revisit…" });
      ta.value = notes[key] || "";
      noteOverlay.appendChild(el("div", { class: "k-dialog k-cmp-note", "data-ui": "ui.dialog study.compare-note-dialog" }, [
        el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("b", { class: "k-dialog-title", text: "Comparison note" }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✕", "aria-label": "Close", onclick: function () { noteOverlay.remove(); } })]),
        el("div", { class: "k-dialog-body" }, [el("p", { class: "k-cmp-empty", text: "Saved with this pair of topics and included in the normal backup." }), ta]),
        el("div", { class: "k-dialog-foot" }, [
          el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: function () { noteOverlay.remove(); } }),
          el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Save note", onclick: function () { notes[key] = ta.value.trim(); store.save(); noteOverlay.remove(); KOS.ui.toast(notes[key] ? "Comparison note saved." : "Comparison note cleared."); } })
        ])
      ]));
      KOS.ui.openDialog(noteOverlay); ta.focus();
    }
    var swap = el("button", { type: "button", class: "k-iconbtn", text: "⇄", "aria-label": "Swap topics", title: "Swap topics", onclick: function () { var v = selA.value; selA.value = selB.value; selB.value = v; update(); } });
    var modes = [["overview", "Overview"], ["specification", "Specification"], ["notes", "Notes"], ["terms", "Key terms"], ["exam", "Exam focus"], ["progress", "Progress"]];
    var modeBar = KOS.ui.tabs(modes.map(function (m) {
      return { label: m[1], active: m[0] === mode, onSelect: function () {
        mode = m[0];
        modeBar.querySelectorAll("[role='tab']").forEach(function (b) {
          var on = b.textContent === m[1];
          b.setAttribute("aria-selected", String(on)); KOS.ui.state(b, "active", on);
        });
        update();
      } };
    }), { variant: "workspace", label: "Compare by", className: "k-cmp-tabs" });
    modeBar.setAttribute("data-ui", modeBar.getAttribute("data-ui") + " study.compare-tabs");

    overlay.appendChild(el("div", { class: "k-dialog k-cmp", "data-ui": "ui.dialog study.compare-dialog" }, [
      el("div", { class: "k-dialog-head k-cmp-top", "data-ui": "ui.dialog-head" }, [
        el("div", { class: "k-cmp-intro" }, [el("b", { class: "k-dialog-title", text: "Compare topics" }), el("span", { class: "k-cmp-sub", text: "Line up the syllabus, evidence and exam focus." })]),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✕", "aria-label": "Close", onclick: close })
      ]),
      el("div", { class: "k-cmp-picks", "data-ui": "study.compare-selectors" }, [selA, swap, selB]),
      head, modeBar, body,
      el("div", { class: "k-dialog-foot k-cmp-foot", "data-ui": "study.compare-actions" }, [
        /* the note is the pair's own action, so it stands apart on the left
           (the shared footer rule); the four topic actions group on the right */
        el("button", { type: "button", class: "k-btn", text: "✎ Comparison note", onclick: comparisonNote }),
        el("button", { type: "button", class: "k-btn", text: "Open Topic A", onclick: function () { var t = topic(selA.value); close(); KOS.show("ref", { subject: t.sid, ref: t.ref }); } }),
        el("button", { type: "button", class: "k-btn", text: "Open Topic B", onclick: function () { var t = topic(selB.value); close(); KOS.show("ref", { subject: t.sid, ref: t.ref }); } }),
        el("button", { type: "button", class: "k-btn", text: "◉ Focus Topic A", onclick: function () { var t = topic(selA.value); close(); KOS.show("focus", { subject: t.sid, ref: t.ref }); } }),
        el("button", { type: "button", class: "k-btn", text: "◉ Focus Topic B", onclick: function () { var t = topic(selB.value); close(); KOS.show("focus", { subject: t.sid, ref: t.ref }); } })
      ])
    ]));
    KOS.ui.openDialog(overlay);
    update();
  }

  /* ---------- the subject desk (Graphite frame 8a) ----------
     Reads top to bottom as one sentence — what the course is and how far
     you are through it (the hero, beside where to go next), how you are
     doing (the analytics, beside the dates), the course itself (the units)
     and what you can do about it (practice, resources). The desk carries no
     spine: a unit card is the way into the topic pages, where the spine is
     the section list (invariant 51 as amended by the Graphite design). */
  function unitTitle(title) {
    var t = String(title).replace(/^Fundamentals of (the )?/i, "");
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function leavesOf(sid, sec) {
    return LEAVES[sid].filter(function (l) { return l.section === sec; });
  }

  KOS.views.subject = function (main, sid) {
    hideTree();
    /* Code's desk is built like this one, with its own content (frame 26a) */
    if (sid === "code" && KOS.codeDesk) {
      main.style.setProperty("--subj-c", SUBJ_HUE[sid]);
      KOS.codeDesk(main);
      return;
    }
    /* …and Mind's (frame 32a) */
    if (sid === "mind" && KOS.mindDesk) {
      main.style.setProperty("--subj-c", SUBJ_HUE[sid]);
      KOS.mindDesk(main);
      return;
    }
    /* …and so is Japanese's (frame 28a) */
    if (sid === "ja" && KOS.jaDesk) {
      main.style.setProperty("--subj-c", SUBJ_HUE[sid]);
      KOS.jaDesk(main);
      return;
    }
    /* …and Creatives' (frame 31a) */
    if (sid === "creatives" && KOS.crDesk) {
      main.style.setProperty("--subj-c", SUBJ_HUE[sid]);
      KOS.crDesk(main);
      return;
    }
    var d = KOS_DATA[sid], s = subjectStats(sid);
    main.style.setProperty("--subj-c", SUBJ_HUE[sid]);
    var today = KOS.srs.todayISO();

    KOS.shell.actions([
      /* on a phone it rides the title bar as an icon (15c) */
      el("button", { type: "button", class: "k-btn", "data-ui": "study.compare", "data-phone-action": "", "aria-label": "Compare topics",
        onclick: function () { compareModal(sid); } }, [el("span", { "aria-hidden": "true", text: "⇆" }), el("span", { class: "k-btn-label", text: " Compare" })]),
      el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Start focus",
        onclick: function () { KOS.show("focus"); } })
    ]);

    /* ================= the hero, and where to go next ================= */
    var papers = [];
    d.sections.forEach(function (sec) {
      var lbl = sec.paper !== undefined ? paperLabel(sid, sec.paper) : d.board;
      var p = papers.filter(function (x) { return x.lbl === lbl; })[0];
      if (!p) papers.push(p = { lbl: lbl, leaves: [] });
      p.leaves = p.leaves.concat(leavesOf(sid, sec));
    });
    var run = KOS.sessions.streak(sid);
    var hero = el("section", { class: "k-subj-hero", "data-ui": "study.subject-hero", "aria-label": d.name }, [
      el("span", { class: "k-subj-ring", role: "img", "aria-label": pctText(s.mastery) + " mastery", style: "--p: " + s.mastery + "%" }, [
        el("span", { class: "k-subj-ring-in" }, [
          el("b", { text: pctText(s.mastery) }),
          el("small", { text: "mastery" })
        ])
      ]),
      el("div", { class: "k-subj-id" }, [
        el("div", { class: "k-kicker", text: "Subject desk" }),
        el("h1", { class: "k-subj-name", text: d.name }),
        el("div", { class: "k-subj-board" }, [
          el("span", { text: d.board }),
          run ? el("span", { class: "k-chip", style: "--chip-c: var(--subj-c)", title: run + "-day study streak in this subject",
            text: "炎 " + run + "-day streak" }) : null
        ].filter(Boolean))
      ]),
      el("div", { class: "k-subj-papers", "data-ui": "study.units-papers" }, papers.filter(function (p) { return p.leaves.length; }).map(function (p) {
        var note = (PAPER_NOTE[sid] || {})[p.lbl] || [p.lbl, ""];
        var m = Math.round(p.leaves.reduce(function (a, l) { return a + leafPercent(sid, l.ref); }, 0) / p.leaves.length);
        return el("div", { class: "k-subj-paper", "data-ui": "study.paper" }, [
          el("div", { class: "k-subj-paper-top" }, [
            el("b", { text: note[0] }),
            el("span", { class: "k-subj-paper-note", text: note[1] }),
            el("span", { class: "k-mono", text: pctText(m) })
          ]),
          el("span", { class: "k-bar k-bar--6", role: "img", "aria-label": note[0] + ": " + pctText(m) + " mastery", style: "--p: " + m + "%" }, [el("i")])
        ]);
      }))
    ]);

    var side = el("div", { class: "k-subj-side" }, [continueCard(sid), weakestCard(sid)].filter(Boolean));
    if (KOS.art) KOS.art.layer(hero, "desk:" + sid, { eager: true });
    main.appendChild(el("div", { class: "k-subj-row", "data-ui": "study.desk-top" }, [hero, side]));

    /* ================= analytics, beside the dates ================= */
    var analytics = subjectAnalytics(sid, s);
    main.appendChild(el("div", { class: "k-subj-row" }, [analytics, deadlinesCard(sid, today)]));

    /* ================= the course units ================= */
    var lastRef = store.state.ui.lastRef[sid];
    var lastSec = lastRef && BYREF[sid][lastRef] ? BYREF[sid][lastRef].section : null;
    var units = el("div", { class: "k-units", "data-ui": "study.units" });
    var itU2 = sid === "it" && KOS.itUnits ? KOS.itUnits : null, itCur = itU2 ? itU2.current() : null;
    /* IT: the current unit first, the units done at school only with the switch */
    var deskSecs = !itU2 ? d.sections : d.sections.filter(function (sec) { return itU2.visible(sec.ref); })
      .sort(function (a, b) { return (a.ref === itCur ? -1 : 0) - (b.ref === itCur ? -1 : 0); });
    deskSecs.forEach(function (sec) {
      var ls = leavesOf(sid, sec);
      if (!ls.length) return;
      var done = 0, started = 0;
      var segs = ls.map(function (l) {
        var p = store.peekProgress(sid, l.ref);
        var st = p && p.status === "done" ? "done" : p && p.status && p.status !== "none" ? "started" : null;
        if (st === "done") done++; else if (st) started++;
        return el("span", { "data-state": st });
      });
      var target = (lastSec === sec && lastRef) ? lastRef
        : (ls.filter(function (l) { var p = store.peekProgress(sid, l.ref); return !p || p.status !== "done"; })[0] || ls[0]).ref;
      var card = el("button", { type: "button", class: "k-unit", "data-ui": "study.unit",
        "aria-label": sec.ref + " " + sec.title + ": " + done + " of " + ls.length + " completed",
        onclick: function () { KOS.show("ref", { subject: sid, ref: target }); } }, [
        el("span", { class: "k-unit-ref", text: sec.ref }),
        el("span", { class: "k-unit-title", text: unitTitle(sec.title) }),
        el("span", { class: "k-unit-segs", "aria-hidden": "true" }, segs),
        el("span", { class: "k-unit-foot", "data-ui": "study.unit-foot" }, [el("b", { text: ratioText(done, ls.length) }), " completed · " + started + " started"])
      ]);
      if (lastSec === sec) KOS.ui.state(card, "current", true);
      units.appendChild(card);
    });
    var paperNames = papers.filter(function (p) { return p.leaves.length; }).map(function (p) { return ((PAPER_NOTE[sid] || {})[p.lbl] || [p.lbl])[0]; });
    /* IT: the current unit beside its unit cards (5.19 item 2, design 44f;
       moved into the units' row on 16 November 2026) */
    var cu = sid === "it" && KOS.itDesk && KOS.itDesk.current ? KOS.itDesk.current({
      leaves: function (code) { var sec = d.sections.filter(function (x) { return x.ref === code; })[0]; return sec ? leavesOf(sid, sec) : []; },
      pct: function (ref) { return leafPercent(sid, ref); }, lastRef: store.state.ui.lastRef[sid] }) : null;
    var unitScroller = KOS.ui.scroller(units, { label: "Course units", prevLabel: "Scroll to earlier units", nextLabel: "Scroll to later units" });
    main.appendChild(el("section", { class: "k-subj-units", "aria-labelledby": "k-units-h" }, [
      el("div", { class: "k-sectionhead" }, [
        el("h2", { id: "k-units-h", text: "Course units" }),
        el("span", { class: "k-sectionhead-sub", text: units.children.length + " units · " +
          (paperNames.length > 1 ? paperNames.slice(0, -1).join(", ") + " and " + paperNames[paperNames.length - 1] : paperNames[0] || d.board) })
      ]),
      cu ? el("div", { class: "k-subj-units-row", "data-ui": "study.units-row" }, [unitScroller, cu]) : unitScroller
    ]));
    /* the IT desk's qualification and units (frames 18a–18c), after the
       rows every subject shares */
    if (sid === "it" && KOS.itDesk) KOS.itDesk.render(main);

    /* ================= practice, beside the resources ================= */
    var labs = PRACTICE[sid] || [];
    var bottom = el("div", { class: "k-subj-row k-subj-row--even" });
    if (labs.length) {
      bottom.appendChild(el("section", { class: "k-card", "data-ui": "study.practice", "aria-label": "Practice zone" }, [
        cardHead("Practice zone", "Labs and simulations for this subject"),
        el("div", { class: "k-practice" }, labs.map(function (t) {
          var acc = practiceAccess(t[3]);
          return el("button", { type: "button", class: "k-practice-row", "data-ui": "study.practice-item",
            title: acc.ok ? null : "Unlocks for ◈ " + (acc.item ? acc.item.price : "") + " in the Gold Shop", onclick: t[2] }, [
            el("span", { class: "k-practice-txt" }, [
              el("span", { class: "k-practice-name" }, [t[0], acc.ok ? null : el("span", { class: "k-chip", "data-tone": "amber", text: "◆ gated" })].filter(Boolean)),
              el("span", { class: "k-practice-desc", text: t[1] })
            ]),
            el("span", { class: "k-muted", "aria-hidden": "true", text: "→" })
          ]);
        }))
      ]));
    }
    /* 15c: on a phone the eight analytics tiles are one summary row that
       opens them in a sheet (the same card, moved in and back) */
    bottom.appendChild(analyticsRow(analytics));
    /* IT has no Resources card: a new specification with next to nothing
       published for it yet (asked for 16 November 2026) */
    if (sid !== "it") {
      var resHolder = el("section", { class: "k-card", "data-ui": "study.resources", "aria-label": "Resources" });
      bottom.appendChild(resHolder);
      renderResources(resHolder, sid);
    }
    main.appendChild(bottom);
  };

  /* ---------- the analytics card ----------
     Eight statistics genuinely exist for a subject: a balanced 4 × 2 with no
     filler tile. Each tile is a label, a value and a bar that is present
     only when it shows the same quantity as the value above it (invariant
     26d); its line of context rides the tile's tooltip, and the definitions
     sit behind "What do these mean?" (audit SUBJ-6). */
  function statTile(o) {
    var empty = o.empty === true;
    var bar = o.pct != null && !empty;
    return el("div", { class: "k-sa-tile", "data-ui": "study.analytics-tile", "data-state": empty ? "empty" : null, title: o.sub }, [
      el("span", { class: "k-sa-k", "data-ui": "part.label", text: o.k }),
      el("strong", { class: "k-sa-v", "data-ui": "part.value", text: empty ? "—" : o.v }),
      el("span", { class: "sr-only", "data-ui": "part.caption", text: o.sub }),
      el("span", { class: "k-bar", "data-ui": "study.analytics-track", "aria-hidden": "true",
        "data-state": bar ? null : "na", style: bar ? "--p: " + Math.max(0, Math.min(100, o.pct)) + "%" + (o.c ? "; --bar-c: " + o.c : "") : null }, [el("i")])
    ]);
  }

  function analyticsRow(card) {
    function tile(k) {
      var t = [].slice.call(card.querySelectorAll("[data-ui~='study.analytics-tile']")).find(function (n) {
        return n.querySelector("[data-ui~='part.label']").textContent === k;
      });
      return t && !t.matches("[data-state~='empty']") ? t.querySelector("[data-ui~='part.value']").textContent : null;
    }
    var strip = card.querySelector("[data-ui~='study.review-strip']");
    var due = strip ? +strip.getAttribute("data-due") : 0, avg = strip ? strip.getAttribute("data-avg") : "";
    var facts = [
      tile("Mastery") ? tile("Mastery") + " mastery" : null,
      due ? due + " cards due" : null,
      avg ? "questions " + avg + "%" : null
    ].filter(Boolean);
    return el("button", { type: "button", class: "k-card k-sa-row", "data-ui": "study.analytics-row", "aria-haspopup": "dialog",
      onclick: function () {
        var home = card.parentNode, next = card.nextSibling;
        var close = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Close", text: "✕" });
        var box = el("section", { class: "k-dialog", "data-ui": "ui.dialog study.analytics-sheet" }, [
          el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("h2", { class: "k-dialog-title", text: "Subject analytics" }), close]),
          card
        ]);
        var ov = el("div", { class: "k-dialog-overlay" }, [box]);
        ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
        close.addEventListener("click", function () { ov.remove(); });
        KOS.ui.openDialog(ov, { onClose: function () {
          if (home.isConnected) home.insertBefore(card, next && next.parentNode === home ? next : null);
        } });
      } }, [
      el("span", { class: "k-sa-row-txt" }, [
        el("span", { class: "k-sa-row-t", text: "Subject analytics" }),
        facts.length ? el("span", { class: "k-sa-row-sub", text: facts.join(" · ") }) : null
      ].filter(Boolean)),
      el("span", { class: "k-muted", "aria-hidden": "true", text: "›" })
    ]);
  }

  function subjectAnalytics(sid, s) {
    var cards = subjectCardStats(sid);
    var run = KOS.sessions.streak(sid);
    var deep = KOS.content.coverage(sid, LEAVES[sid]);
    var startedPct = pctOf(s.touched, s.total);
    var reviewedPct = pctOf(cards.reviewed, cards.total);
    var help = el("details", { class: "k-sa-help", "data-ui": "study.analytics-foot" }, [
      el("summary", { class: "k-link", text: "What do these mean?" }),
      el("div", { class: "k-sa-help-body" }, [
        el("p", { class: "k-sa-help-fact", "data-ui": "study.analytics-foot-fact", text: "Deep revision content: " +
          (deep >= s.total ? "all " + s.total + " topics" : ratioText(deep, s.total) + " topics") }),
        el("p", { text: "Mastery averages the four progress checks over every topic in the subject. " +
          "Completed counts only the topics you have marked completed, so it moves in whole " +
          "topics while mastery moves in quarters." })
      ])
    ]);
    return el("section", { class: "k-card k-sa", "data-ui": "study.analytics", "aria-label": "Subject analytics" }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: "Subject analytics" }),
        el("span", { class: "k-card-meta", text: "this subject only" }),
        help
      ]),
      el("div", { class: "k-sa-grid", "data-ui": "study.analytics-grid" }, [
        statTile({ k: "Mastery", v: pctText(s.mastery), pct: s.mastery, c: "var(--subj-c)",
          sub: "progress checks across " + s.total + " topics" }),
        statTile({ k: "Completed", v: ratioText(s.done, s.total), pct: s.pct, c: "var(--green)",
          sub: pctText(s.pct) + " marked completed" }),
        statTile({ k: "Started", v: ratioText(s.touched, s.total), pct: startedPct, c: "var(--amber)",
          /* ST-31: the figure is topics given a status (Started, Paused or Completed), not opened */
          sub: s.paused ? pctText(startedPct) + " given a status · " + s.paused + " paused"
                        : pctText(startedPct) + " marked started or further" }),
        statTile({ k: "Streak", v: run + (run === 1 ? " day" : " days"), empty: !run,
          sub: run ? "consecutive days on this subject" : "study today to start one" })
      ]),
      reviewStrip(sid, cards, reviewedPct)
    ]);
  }

  /* The review analytics as ONE strip (5.19 item 4, design 44e): Cards →
     Questions → Papers, three figures each, a missing figure an em dash.
     IT's units done at school are left out of all three (26f). */
  function reviewStrip(sid, cards, reviewedPct) {
    var Q = KOS.questions ? KOS.questions.subjectStats(sid) : { back: 0, avg: null, attempts: 0 };
    var papers = subjectPapers(sid), last = papers[papers.length - 1], prev = papers[papers.length - 2];
    var lastPct = last ? Math.round(100 * last.marks / last.max) : null, prevPct = prev ? Math.round(100 * prev.marks / prev.max) : null;
    var delta = lastPct != null && prevPct != null ? lastPct - prevPct : null;
    function fig(v, k, hook) {
      var none = v == null || v === "";
      return el("span", { class: "k-sa-fig", "data-ui": "study.review-fig" + (hook ? " " + hook : ""), "data-state": none ? "empty" : null }, [
        el("b", { class: "k-sa-fig-v", text: none ? "—" : String(v) }), el("span", { class: "k-sa-fig-k", text: k })]);
    }
    function part(name, hook, figs, empty) {
      return el("div", { class: "k-sa-part", "data-ui": "study.review-part " + hook, "data-state": empty ? "empty" : null }, [
        el("span", { class: "k-kicker", text: name }), el("div", { class: "k-sa-figs" }, figs)]);
    }
    return el("div", { class: "k-sa-review", "data-ui": "study.review-strip", "aria-label": "Review",
      "data-due": String(cards.due), "data-avg": Q.avg == null ? "" : String(Q.avg) }, [
      el("div", { class: "k-sa-review-head" }, [
        el("span", { class: "k-card-title", text: "Review" }),
        el("button", { type: "button", class: "k-link k-spacer", "data-ui": "study.review-due", text: "Due today →",
          onclick: function () { KOS.show("review", { tab: "due" }); } })
      ]),
      el("div", { class: "k-sa-parts" }, [
        part("Cards", "study.review-cards", [
          fig(cards.total ? KOS.ui.num(cards.due) : null, "due"),
          fig(cards.recall != null ? cards.recall + "%" : null, "recall"),
          fig(cards.total ? cards.reviewed + " / " + cards.total : null, "in the schedule")
        ], !cards.total),
        part("Questions", "study.review-questions", [
          fig(Q.attempts ? String(Q.back) : null, "back today"),
          fig(Q.avg != null ? Q.avg + "%" : null, "average mark"),
          fig(Q.attempts ? String(Q.attempts) : null, Q.attempts === 1 ? "attempt" : "attempts", "study.review-attempts")
        ], !Q.attempts),
        part("Papers", "study.review-papers", [
          fig(papers.length ? String(papers.length) : null, "timed"),
          fig(last ? (last.grade || lastPct + "%") : null, last ? "last · " + (last.paper || last.topic || "paper") : "last"),
          fig(delta != null ? (delta > 0 ? "▲ " : delta < 0 ? "▼ " : "") + Math.abs(delta) + "%" : null, "on the one before")
        ], !papers.length)
      ])
    ]);
  }

  /* where to go next — one card, one action, and an honest kicker for a
     subject you have never opened (pointed at the first unfinished topic) */
  function continueCard(sid) {
    var last = store.state.ui.lastRef[sid];
    /* IT: never into a unit done at school; the current unit first (5.19 item 2) */
    var IU = sid === "it" && KOS.itUnits ? KOS.itUnits : null;
    /* CC-21: never into a unit not being taken either (F203/F205) */
    var pool = IU ? LEAVES[sid].filter(function (l) { var c = IU.unitOf(l.ref), u = c && IU.get(c); return !IU.archived(c) && !(u && u.status === "not-taken"); }) : LEAVES[sid];
    if (IU) { var cu = IU.current(); pool = pool.filter(function (l) { return IU.unitOf(l.ref) === cu; }).concat(pool.filter(function (l) { return IU.unitOf(l.ref) !== cu; })); }
    var leaf = last && BYREF[sid][last] && (!IU || !IU.archived(IU.unitOf(last))) ? BYREF[sid][last] : null;
    var kicker = "Continue";
    if (!leaf) {
      leaf = pool.filter(function (l) {
        var p = store.peekProgress(sid, l.ref);
        return !p || p.status !== "done";
      })[0] || pool[0] || LEAVES[sid][0];
      kicker = "Start here";
    }
    if (!leaf) return null;
    var pct = leafPercent(sid, leaf.ref);
    return el("button", { type: "button", class: "k-subj-next", "data-ui": "study.continue",
      onclick: function () { KOS.show("ref", { subject: sid, ref: leaf.ref }); } }, [
      el("span", { class: "k-subj-next-txt" }, [
        el("span", { class: "k-kicker", "data-ui": "part.detail", text: kicker }),
        el("span", { class: "k-subj-next-t" }, [el("span", { class: "k-mono", text: leaf.ref }), leaf.title]),
        el("span", { class: "k-bar", role: "img", "aria-label": pctText(pct) + " mastery", style: "--p: " + pct + "%; --bar-c: var(--subj-c)" }, [el("i")])
      ]),
      el("span", { class: "k-subj-next-go", "data-state": "lit", "aria-hidden": "true", text: "→" })
    ]);
  }
  function weakestCard(sid) {
    var w = sid === "it" && KOS.itUnits
      ? (KOS.rag.worst(sid, 50) || []).filter(function (x) { return KOS.itUnits.inReview(x.ref); })[0]
      : (KOS.rag.worst(sid, 1) || [])[0];
    if (!w) {
      return el("div", { class: "k-subj-next", "data-ui": "study.weakest" }, [
        el("span", { class: "k-subj-next-txt" }, [
          el("span", { class: "k-kicker", text: "Weakest" }),
          el("span", { class: "k-subj-next-t k-muted", text: "Nothing flagged" }),
          el("span", { class: "k-subj-next-why", text: "Rate a topic or practise it and the weakest shows here." })
        ])
      ]);
    }
    return el("button", { type: "button", class: "k-subj-next", "data-ui": "study.weakest rag.item",
      onclick: function () { KOS.show("ref", { subject: sid, ref: w.ref }); } }, [
      el("span", { class: "k-subj-next-txt" }, [
        el("span", { class: "k-kicker", text: "Weakest" }),
        el("span", { class: "k-subj-next-t" }, [el("span", { class: "k-mono", "data-band": w.e.band, text: w.ref }), w.title]),
        el("span", { class: "k-subj-next-why", text: KOS.rag.why(w) })
      ]),
      el("span", { class: "k-subj-next-go", "aria-hidden": "true", text: "→" })
    ]);
  }

  /* the subject's dates: overdue work first, then the nearest countdowns —
     all read from their one canonical store (invariant 44) */
  function deadlinesCard(sid, today) {
    var overdue = (KOS.assignments && KOS.assignments.urgent ? KOS.assignments.urgent() : []).filter(function (a) {
      return a.subject === sid && KOS.assignments.isOverdue(a);
    });
    var counts = KOS.calendar.countdowns ? KOS.calendar.countdowns(sid, 4) : [];
    var card = el("section", { class: "k-card", "data-ui": "cal.countdowns", "aria-label": "Deadlines" }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: "Deadlines" }),
        overdue.length ? el("span", { class: "k-card-meta", "data-state": "late", text: overdue.length + " overdue" }) : null,
        el("button", { type: "button", class: "k-link", text: "Assignments →", onclick: function () { KOS.show("assignments"); } })
      ].filter(Boolean))
    ]);
    var redraw = function () { KOS.rerender(); };
    var rows = counts.slice(0, Math.max(2, 4 - overdue.length)).map(function (c) {
      return { dot: String(c.days), state: c.days === 0 ? "now" : null, title: c.title,
        sub: c.meta.replace(/ · (compsci|maths|it)\b/, "").replace(/ · this week$/, "") + (c.days === 0 ? " · today" : ""),
        go: function () { KOS.calendar.openCountdown(c, redraw); } };
    }).concat(overdue.slice(0, 2).map(function (a) {
      return { dot: "!", state: "late", title: a.title, sub: "Assignment · overdue",
        go: function () { if (KOS.assignmentDetail) KOS.assignmentDetail(a.id, redraw); } };
    }));
    if (!rows.length) {
      card.appendChild(KOS.ui.emptyState({ compact: true, body: "No exams, deadlines or assignments dated for this subject." }));
      return card;
    }
    rows.forEach(function (r) {
      card.appendChild(el("button", { type: "button", class: "k-day-row", "data-ui": "cal.countdown-item", onclick: r.go }, [
        el("span", { class: "k-days-dot", "data-state": r.state, text: r.dot }),
        el("span", { class: "k-day-txt" }, [
          el("span", { class: "k-day-title", text: r.title }),
          el("span", { class: "k-day-sub", text: r.sub })
        ])
      ]));
    });
    return card;
  }

  /* ---------- FR-2.8: per-subject resource links ---------- */
  function renderResources(holder, sid) {
    holder.innerHTML = "";
    var R = store.state.resources;
    var items = R.items.filter(function (r) { return r.subject === sid; });
    holder.appendChild(el("div", { class: "k-card-head" }, [
      el("span", { class: "k-card-title", text: "Resources" }),
      el("span", { class: "k-card-meta", text: "subject-wide" }),
      el("button", { type: "button", class: "k-link", "data-tone": "crimson", "data-ui": "study.resource-add", text: "+ Add",
        onclick: function () { addResource(sid, function () { renderResources(holder, sid); }); } })
    ]));
    if (!items.length) {
      holder.appendChild(KOS.ui.emptyState({ compact: true, body: "No resources saved yet — textbook PDFs, PMT pages, reference sheets, video playlists." }));
      return;
    }
    items.forEach(function (r) {
      var host = "";
      try { host = new URL(r.url).hostname.replace(/^www\./, ""); } catch (e) { host = r.url; }
      holder.appendChild(el("div", { class: "k-res-row", "data-ui": "study.resource-row" }, [
        el("a", { class: "k-res-name", href: r.url, target: "_blank", rel: "noopener", text: r.name, title: r.url }),
        r.ref ? el("button", { type: "button", class: "k-chip", title: "Open the topic", text: r.ref,
          onclick: function () { KOS.show("ref", { subject: sid, ref: r.ref }); } }) : null,
        el("span", { class: "k-res-host", text: host + " ↗" }),
        el("button", { type: "button", class: "k-res-del", "data-intent": "danger", "aria-label": "Delete resource " + r.name, text: "✕", onclick: function () {
          KOS.ui.confirm({ title: "Remove resource?", body: "“" + r.name + "” will be removed from the table.", danger: true, confirm: "Remove" }, function () {
            R.items.splice(R.items.indexOf(r), 1);
            store.save();
            renderResources(holder, sid);
          });
        } })
      ].filter(Boolean)));
    });
  }
  function addResource(sid, done) {
    var R = store.state.resources;
    var name = el("input", { type: "text", class: "k-input", "aria-label": "Resource name", placeholder: "Resource name" });
    var url = el("input", { type: "text", class: "k-input", "aria-label": "Resource link or file path", placeholder: "https://… or file path" });
    var refIn = el("input", { type: "text", class: "k-input", "aria-label": "Topic reference (optional)", placeholder: "Topic ref (optional)" });
    var overlay = el("div", { class: "k-dialog-overlay" });
    function close() { overlay.remove(); }
    overlay.appendChild(el("div", { class: "k-dialog", "data-ui": "ui.dialog" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Add a resource" })]),
      el("div", { class: "k-dialog-body k-stack" }, [name, url, refIn]),
      el("div", { class: "k-dialog-foot" }, [
        el("button", { type: "button", class: "k-btn", text: "Cancel", onclick: close }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Add", onclick: function () {
          if (!name.value.trim() || !url.value.trim()) { KOS.ui.toast("A name and a link are both needed.", true); return; }
          var ref = refIn.value.trim();
          if (ref && !BYREF[sid][ref]) { KOS.ui.toast("“" + ref + "” isn't a spec point in this subject — leave it blank for subject-wide.", true); return; }
          R.items.push({ id: R.nextId++, subject: sid, ref: ref || null, name: name.value.trim(), url: url.value.trim() });
          store.save();
          close();
          done();
        } })
      ])
    ]));
    KOS.ui.openDialog(overlay, { label: "Add a resource" });
    name.focus();
  }
})();
