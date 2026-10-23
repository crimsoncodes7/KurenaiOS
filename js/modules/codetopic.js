/* Kurenai OS — modules/codetopic.js
   A Code lesson on the shared topic page (frames 26c, 26d, 26e).

   hub.js's KOS.views.ref stays the one topic page; for a Code lesson it
   asks this module for the parts that differ, through begin(ref):
     decoratePath   the strands and the AQA cross-link in the breadcrumb,
                    and the Learn | Reference switch beside it
     tabs           Notes · Practice · Flashcards · Quiz · Tasks · Files
     render         Notes (Learn: one page at a time; Reference: every page
                    in one reading column with in-lesson search), Practice
                    (predict, fill the gap, find the bug — checked by
                    running) and Tasks
     status / inspectorBody / onThisPage   the inspector: four evidence
                    checks, concepts, proof in code and the next practice;
                    in Reference mode, "On this page" and the pinned quick
                    reference
     spine          Core | Tracks and the stage headings

   Reading evidence is written through KOS.code (a page shown, a listing
   run); nothing else here writes. The mode (Learn/Reference) and the
   spine's Core/Tracks are per device (state.ui.code).                    */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var SID = "code";
  var DWELL = 2500;   /* ms on a page before it counts as read */
  var LEAVE = 1500;   /* …or this long, then moving on with Next */

  function U() { return KOS.code.ui(); }
  function announce(msg) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(msg); }
  function plural(n, one, many) { return n + " " + (n === 1 ? one : (many || one + "s")); }
  function agoDays(ts) {
    if (!ts) return null;
    var d = KOS.code.daysBetween(KOS.code.isoOf(ts), KOS.srs.todayISO());
    return d <= 0 ? "today" : d === 1 ? "1 d ago" : d + " d ago";
  }

  /* ================= the spine ================= */
  function spine(tree, list, activeRef) {
    var ui = U();
    var mode = ui.spine === "tracks" ? "tracks" : "core";
    var seg = el("div", { class: "k-seg k-seg--fill k-cx-spineseg", "data-ui": "code.spine-mode", role: "group", "aria-label": "Curriculum" },
      [["core", "Core"], ["tracks", "Tracks"]].map(function (m) {
        return el("button", { type: "button", class: "k-seg-item", "aria-pressed": String(mode === m[0]), text: m[1],
          onclick: function () { ui.spine = m[0]; KOS.store.save(); KOS.rerender(); } });
      }));
    tree.insertBefore(seg, tree.querySelector(".k-spine-filter-wrap"));
    if (mode === "tracks") {
      var K = window.KOS_CODE;
      list.appendChild(el("div", { class: "k-spine-stage", text: "Tracks" }));
      K.TRACKS.forEach(function (t) { list.appendChild(trackRow(t)); });
      list.appendChild(el("div", { class: "k-spine-stage", text: "Deepening" }));
      K.DEEPENING.forEach(function (t) { list.appendChild(trackRow(t)); });
      return { tracks: true };
    }
    return {
      tracks: false,
      stageHead: function (stage) {
        var st = (window.KOS_CODE.STAGES || []).filter(function (x) { return x.id === stage; })[0];
        var tr = /^T\d/.test(String(stage)) ? (window.KOS_CODE.TRACKS || []).filter(function (x) { return x.id === stage; })[0] : null;
        return el("div", { class: "k-spine-stage", "data-ui": "code.spine-stage",
          text: stage === "B" ? "Bridge" : tr ? "Track " + tr.id + " · " + tr.title : "Stage " + stage + " · " + (st ? st.title : "") });
      }
    };
  }
  function trackRow(t) {
    return el("button", { type: "button", class: "k-spine-leaf k-cx-trackleaf", "data-ui": "study.spine-leaf code.track-leaf",
      onclick: function () { KOS.show("code", { page: "track", id: t.id }); } }, [
      el("span", { class: "k-spine-mastery", "aria-hidden": "true", style: "--p: 0%" }),
      el("span", { class: "k-spine-leaf-txt" }, [
        el("span", { class: "k-spine-leaf-t", text: t.title, title: t.title }),
        el("span", { class: "k-spine-leaf-ref", text: t.id + " · Coming later" })
      ])
    ]);
  }

  /* ================= the topic page ================= */
  function begin(ref) {
    var L = KOS.code.lesson(ref);
    var content = KOS.code.content(ref);
    var ui = U();
    var refMode = function () { return ui.mode === "reference" && !!(content && content.notes && content.notes.length); };
    var ctx = {};

    ctx.decoratePath = function (pathLine) {
      /* "Code / Stage 2 / U4 Collections · L S ↔ AQA 4.2.6" */
      pathLine.innerHTML = "";
      var stage = L ? (L.stage === "B" ? "Bridge B" : L.track ? "Track " + L.track : "Stage " + L.stage) : "";
      ["Code", stage, L ? L.unit + " " + L.unitTitle : ""].filter(Boolean).forEach(function (bit, i) {
        if (i) pathLine.appendChild(el("span", { class: "k-topic-sep", "aria-hidden": "true", text: "/" }));
        pathLine.appendChild(document.createTextNode(bit));
      });
      if (content && content.aqa) {
        pathLine.appendChild(el("span", { class: "k-topic-sep", "aria-hidden": "true", text: "·" }));
        pathLine.appendChild(el("button", { type: "button", class: "k-link k-cx-aqa", "data-ui": "code.aqa-link",
          title: "The AQA Computer Science topic this lesson connects to",
          text: "↔ AQA " + content.aqa,
          onclick: function () { if (KOS.hub.BYREF.compsci[content.aqa]) KOS.show("ref", { subject: "compsci", ref: content.aqa }); } }));
      }
    };
    /* Learn | Reference rides the right end of the tab row, beside Edit */
    ctx.modeSwitch = function () {
      if (content && content.notes && content.notes.length) {
        var mode = refMode() ? "reference" : "learn";
        return el("span", { class: "k-seg k-seg--quiet k-cx-mode", "data-ui": "code.mode", role: "group", "aria-label": "Reading mode" },
          [["learn", "Learn"], ["reference", "Reference"]].map(function (m) {
            return el("button", { type: "button", class: "k-seg-item", "aria-pressed": String(mode === m[0]), text: m[1],
              onclick: function () {
                if (mode === m[0]) return;
                ui.mode = m[0]; KOS.store.save();
                KOS.rerender();
                announce(m[1] + " mode.");
              } });
          }));
      }
      return null;
    };

    var practice = KOS.code.practiceOf(ref);
    var nPractice = practice.predict.length + practice.fill.length + practice.bug.length;
    var tasks = KOS.code.tasksOf(ref);
    ctx.tabs = function (mats) {
      return [
        ["notes", "Notes", true, mats.notes > 1 ? mats.notes : null],
        ["practice", "Practice", true, nPractice || null],
        ["cards", "Flashcards", true, mats.cards || null],
        ["quiz", "Quiz", true, mats.quiz || null],
        ["tasks", "Tasks", true, (tasks.length + KOS.code.projectMilestonesOf(ref).length) || null],
        ["files", "Files", true, null]
      ];
    };
    ctx.firstTab = function () { return "notes"; };
    ctx.owns = function (tab, editing) { return tab === "practice" || tab === "tasks" || (tab === "notes" && !editing); };
    ctx.reference = refMode;
    ctx.render = function (tab, panel, pagerSlot, o) {
      if (tab === "practice") return renderPractice(panel, ref, practice);
      if (tab === "tasks") return renderTasks(panel, ref, tasks);
      if (!content || !content.notes || !content.notes.length) return renderNoLesson(panel, ref, o);
      if (refMode()) return renderReference(panel, ref, content);
      return renderLearn(panel, pagerSlot, ref, content, o);
    };

    /* ---- the inspector ---- */
    ctx.status = function () {
      var ev = KOS.code.evidence(ref);
      var n = ev.checks.filter(Boolean).length, pct = n * 25;
      var tone = pct < 20 ? "low" : pct <= 70 ? "mid" : "high";
      var rag = KOS.rag.picker(SID, ref);
      var sub = [
        ev.pages ? ev.read + " of " + ev.pages + " pages" : "no notes yet",
        ev.listings ? ev.ran + " of " + ev.listings + " listings" : ev.pages ? "no listings · reading counts" : "—",
        ev.tasks ? ev.passed + " of " + ev.tasks + " tasks" : "no tasks yet",
        ev.proven ? "after the task" : "after the task"
      ];
      var plan = KOS.code.planDay();
      if (!ev.checks[2] && plan && plan.task && plan.task.lesson === ref) sub[2] = "Daily 20 today uses it";
      if (ev.checks[3]) sub[3] = "proven in retrieval";
      /* the subjects' own Topic status component (frame 8b): the same head,
         bar, status and confidence row and check grid. The checks come from
         evidence alone; the status follows them by itself (store.setCheck,
         KOS.code.syncChecks) and may still be set by hand, as in a subject */
      function statusSel() {
        var H = KOS.hub, cur = (KOS.store.peekProgress(SID, ref) || {}).status || "none";
        var s = el("select", { class: "k-ts-select", "data-ui": "ui.status-select", id: "ts-status", "aria-label": "Topic status",
          onchange: function () {
            KOS.store.setStatus(SID, ref, s.value);
            if (H.renderTree) H.renderTree(SID, ref);
            KOS.refreshRailCounters && KOS.refreshRailCounters();
          } }, H.STATUS.map(function (st) { return el("option", { value: st[0], text: H.STATUS_GLYPH[st[0]] + " " + st[1] }); }));
        s.value = cur;
        return s;
      }
      var node = el("section", { class: "k-ts k-cx-ts", "data-ui": "topic.status code.status", "data-state": tone, "aria-label": "Topic status" }, [
        el("div", { class: "k-ts-head", "data-ui": "topic.status-head" }, [
          el("span", { class: "k-kicker", "data-ui": "topic.status-k", text: "Topic status" }),
          el("span", { class: "k-ts-checks", text: n + " of 4 checks" }),
          el("strong", { class: "k-ts-pct", text: pct + "%" })
        ]),
        el("span", { class: "k-bar k-bar--6", role: "img", "aria-label": pct + "% from evidence", style: "--p: " + pct + "%" }, [el("i")]),
        el("div", { class: "k-ts-row" }, [
          el("div", { class: "k-ts-field", "data-ui": "topic.status-field topic.status-field-status" }, [
            el("label", { class: "sr-only", "data-ui": "topic.status-lbl", for: "ts-status", text: "Status" }), statusSel()]),
          el("div", { class: "k-ts-field", "data-ui": "topic.status-field topic.status-field-conf" }, [
            el("span", { class: "sr-only", "data-ui": "topic.status-lbl", text: "Confidence" }), rag.node])
        ]),
        el("div", { class: "k-ts-field", "data-ui": "topic.status-field" }, [
          el("span", { class: "sr-only", "data-ui": "topic.status-lbl", text: "Progress checks, from evidence" }),
          el("div", { class: "k-ts-checkgrid", "data-ui": "topic.checkgrid code.checks" }, KOS.code.CHECKS.map(function (label, i) {
            var cb = el("input", { type: "checkbox", class: "k-box", "aria-readonly": "true", tabindex: "-1",
              onclick: function (e) { e.preventDefault(); } });
            cb.checked = !!ev.checks[i];
            return el("label", { class: "k-ts-check k-cx-check", "data-ui": "topic.check", "data-state": ev.checks[i] ? "on" : null,
              title: "Ticks itself from evidence: " + sub[i] }, [cb,
              el("span", { class: "k-cx-check-t" }, [el("span", { text: label }), el("small", { text: sub[i] })])]);
          }))
        ]),
        el("p", { class: "k-cx-ts-note", text: "Ticks come from evidence: pages read, listings run, a task passed, a retrieval passed." }),
        rag.auto
      ]);
      /* repaint in place when evidence arrives (a listing run, a page read) */
      function onEv(e) {
        if (!node.isConnected) { document.removeEventListener("kos:code-evidence", onEv); return; }
        if (e.detail && e.detail.ref !== ref) return;
        document.removeEventListener("kos:code-evidence", onEv);
        node.parentNode.replaceChild(ctx.status(), node);
      }
      document.addEventListener("kos:code-evidence", onEv);
      return node;
    };
    /* the inspector's figures follow the evidence as it arrives */
    ctx.inspectorBody = function (outer, t) {
      var body = el("div", { class: "k-cx-insp-live" });
      outer.appendChild(body);
      fill(body, t);
      function onEv(e) {
        if (!body.isConnected) { document.removeEventListener("kos:code-evidence", onEv); return; }
        if (e.detail && e.detail.ref !== ref) return;
        body.innerHTML = "";
        fill(body, t);
      }
      document.addEventListener("kos:code-evidence", onEv);
    };
    function fill(body, t) {
      var cs = KOS.code.conceptsOf(ref);
      var proven = cs.filter(function (c) { return KOS.code.state().proven[c.id]; }).length;
      if (cs.length) {
        body.appendChild(el("section", { class: "k-insp-sec", "aria-label": "Concepts" }, [
          el("h2", { class: "k-kicker", text: "Concepts · " + proven + " of " + cs.length + " proven" }),
          el("ul", { class: "k-cx-concepts", "data-ui": "code.concepts" }, cs.map(function (c) {
            var sk = KOS.code.skill(c.id);
            return el("li", {}, [KOS.codeUI.dot(sk.band), el("span", { class: "k-mono", text: c.name }),
              el("small", { text: sk.proven ? "proven " + agoDays(sk.proven.at) : "not proven yet" })]);
          }))
        ]));
      }
      var st = KOS.code.state();
      var ts = KOS.code.tasksOf(ref);
      var passed = ts.filter(function (x) { return st.tasks[x.id] && st.tasks[x.id].passAt; }).length;
      var hints = ts.reduce(function (a, x) { return a + ((st.tasks[x.id] && st.tasks[x.id].hints) || 0); }, 0);
      var last = cs.map(function (c) { return st.proven[c.id]; }).filter(Boolean).sort(function (a, b) { return b.at - a.at; })[0];
      /* every kind of material in the lesson, and how far through it you
         are — the same figures the tabs and the checks read */
      var ev = KOS.code.evidence(ref);
      var qz = t.quiz;
      body.appendChild(sec("Study materials", [
        li("Pages read", ev.pages ? ev.read + " / " + ev.pages : "", !ev.pages),
        li("Listings run", ev.listings ? ev.ran + " / " + ev.listings : "", !ev.listings),
        li("Practice right", ev.practice ? ev.practised + " / " + ev.practice : "", !ev.practice),
        li("Flashcards reviewed", t.cards ? t.reviewed + " / " + t.cards : "", !t.cards),
        li("Quiz best", qz && qz.best != null ? Math.round(qz.best) + "%" : "", !(qz && qz.best != null)),
        li("Tasks passed", ev.tasks ? ev.passed + " / " + ev.tasks : "", !ev.tasks)
      ]));
      var plan = KOS.code.planDay();
      body.appendChild(sec("Next practice", [
        li("Daily 20", plan && plan.task && plan.task.lesson === ref ? "today" : "", !(plan && plan.task && plan.task.lesson === ref)),
        li("Cards due", t.due ? t.due + " now" : t.next ? KOS.code.daysBetween(KOS.srs.todayISO(), t.next) + " days" : "", !t.due && !t.next),
        li("Hints opened", hints ? String(hints) : "", !hints),
        li("Last proven", last ? agoDays(last.at) : "", !last),
        li("Sessions here", t.sessions + (t.minutes ? " · " + t.minutes + " min" : ""), !t.sessions)
      ]));
    }
    function sec(title, items) {
      return el("section", { class: "k-insp-sec", "aria-label": title }, [
        el("h2", { class: "k-kicker", text: title }),
        el("ul", { class: "k-insp-list", "data-ui": "topic.inspector-list" }, items)
      ]);
    }
    function li(k, v, empty) {
      return el("li", { "data-state": empty ? "na" : null }, [el("span", { text: k }), el("strong", { text: empty ? "—" : v })]);
    }

    /* Reference mode's inspector: On this page, with match counts while
       searching, and the pinned quick reference */
    ctx.onThisPage = function (body) {
      var pages = KOS.content.splitPages(content.notes);
      var nav = el("nav", { class: "k-cx-otp", "data-ui": "code.on-this-page", "aria-label": "On this page" }, [
        el("div", { class: "k-cx-otp-h" }, [el("h2", { class: "k-kicker", text: "On this page" }), el("small", { text: plural(pages.length, "page") })])
      ]);
      var ol = el("ol", { class: "k-cx-otp-list" });
      pages.forEach(function (pg, i) {
        ol.appendChild(el("li", {}, [el("button", { type: "button", class: "k-cx-otp-item", "data-ui": "code.otp-item", "data-page": String(i),
          onclick: function () {
            var t = document.getElementById("k-cx-pg-" + i);
            if (t && t.scrollIntoView) t.scrollIntoView({ block: "start", behavior: "smooth" });
            if (t) { t.setAttribute("tabindex", "-1"); t.focus({ preventScroll: true }); }
          } }, [
          el("span", { class: "k-mono", text: String(i + 1) }), el("span", { class: "k-cx-otp-t", text: pg.title }),
          el("span", { class: "k-cx-otp-n", "data-ui": "code.otp-count", hidden: "" })
        ])]));
      });
      nav.appendChild(ol);
      body.appendChild(nav);
      var qr = quickRef(content);
      if (qr) body.appendChild(qr);
    };
    return ctx;
  }

  /* the pinned quick reference: the last page's first listing and its rules */
  function quickRef(content) {
    var pages = KOS.content.splitPages(content.notes);
    var last = pages[pages.length - 1];
    if (!last || !/quick reference/i.test(last.title)) return null;
    var code = null, rules = null;
    last.blocks.forEach(function (b) {
      if (!code && b && b.run) code = b.run.src;
      if (!code && b && b.code) code = b.code.src;
      if (!rules && b && b.ul) rules = b.ul;
    });
    return el("section", { class: "k-cx-qr", "data-ui": "code.quick-ref", "aria-label": "Quick reference" }, [
      el("div", { class: "k-cx-qr-h" }, [el("span", { class: "k-kicker", text: "Pinned · Quick reference" })]),
      code ? el("pre", { class: "k-cx-qr-code k-mono", html: KOS.codeUI.highlight(code) }) : null,
      rules ? el("ul", { class: "k-cx-qr-rules" }, rules.slice(0, 5).map(function (r) { return el("li", { html: KOS.content.inline(r) }); })) : null
    ].filter(Boolean));
  }

  function renderNoLesson(panel, ref, o) {
    var L = KOS.code.lesson(ref);
    panel.appendChild(KOS.ui.emptyState({
      mark: "碼", title: "This lesson arrives with " + (L ? KOS.code.unitName(L.unit).replace(/^Unit /, "unit ") : "a later release"),
      body: "Lessons are released one unit at a time, each written in full. Its aim: " + (L ? L.aim : ""),
      action: el("button", { type: "button", class: "k-btn", text: "Open the curriculum map", onclick: function () { KOS.show("code", { page: "map" }); } })
    }));
  }

  /* ---------------- Learn: one page at a time ---------------- */
  function renderLearn(panel, pagerSlot, ref, content, o) {
    var pages = KOS.content.splitPages(content.notes);
    var ui = U();
    var cur = Math.max(0, Math.min(pages.length - 1, (ui.page || {})[ref] || 0));
    if (o && o.reveal) pages.forEach(function (pg, i) { if (pg.blocks.some(function (b) { return b && b.id === o.reveal; })) cur = i; });
    var article = el("article", { class: "k-prose k-notes k-cx-notes", "data-ui": "topic.notes" });
    var stepPrev = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "topic.reader-step", "aria-label": "Previous note page", text: "‹", onclick: function () { show(cur - 1, true); } });
    var pageSelect = el("select", { class: "k-topic-page-select", "data-ui": "topic.reader-page-select", "aria-label": "Choose note page", onchange: function () { show(Number(pageSelect.value), true); } });
    pages.forEach(function (pg, i) { pageSelect.appendChild(el("option", { value: String(i), text: "Page " + (i + 1) + " of " + pages.length + " — " + pg.title })); });
    var stepNext = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "topic.reader-step", "aria-label": "Next note page", text: "›", onclick: function () { show(cur + 1, true); } });
    var dots = el("span", { class: "k-topic-dots", "aria-hidden": "true" }, pages.map(function () { return el("span"); }));
    var foot = el("nav", { class: "k-note-foot", "data-ui": "topic.note-foot", "aria-label": "Note pages" });
    if (pages.length > 1) pagerSlot.appendChild(el("div", { class: "k-topic-reader", "data-ui": "topic.pager" }, [
      el("span", { class: "k-kicker", text: "Note pages" }), stepPrev, pageSelect, stepNext, dots
    ]));
    var dwell = null;
    function markRead(i) {
      var e = KOS.code.state().lessons[ref];
      if (e && e.pages && e.pages[i]) return;
      KOS.code.markPage(ref, i);
      paintDots();
      document.dispatchEvent(new window.CustomEvent("kos:code-evidence", { detail: { ref: ref } }));
    }
    function paintDots() {
      var ev = KOS.code.state().lessons[ref];
      [].forEach.call(dots.children, function (dt, j) {
        KOS.ui.state(dt, "on", j === cur);
        KOS.ui.state(dt, "read", !!(ev && ev.pages && ev.pages[j]));
      });
    }
    var shownAt = 0;
    function show(i, moved) {
      /* moving on after a real look counts the page you leave as read */
      if (moved && i > cur && shownAt && Date.now() - shownAt >= LEAVE) markRead(cur);
      cur = Math.max(0, Math.min(pages.length - 1, i));
      shownAt = Date.now();
      /* the page you are on is remembered per device — on a move, never by
         the render itself */
      if (moved && (ui.page || {})[ref] !== cur) { ui.page = ui.page || {}; ui.page[ref] = cur; KOS.store.save(); }
      pageSelect.value = String(cur);
      article.innerHTML = KOS.content.renderBlocks(pages[cur].blocks);
      KOS.content.typeset(article);
      KOS.codeUI.mountListings(article, ref);
      if (moved && article.scrollIntoView) article.scrollIntoView({ block: "start", behavior: "smooth" });
      stepPrev.disabled = cur === 0;
      stepNext.disabled = cur === pages.length - 1;
      foot.innerHTML = "";
      foot.appendChild(cur > 0 ? el("button", { type: "button", class: "k-note-step", "data-ui": "topic.page", onclick: function () { show(cur - 1, true); } }, [
        el("span", { class: "k-kicker", text: "‹ Previous page" }), el("span", { class: "k-note-step-t", text: pages[cur - 1].title })
      ]) : el("span"));
      foot.appendChild(el("span", { class: "k-mono k-muted", "data-ui": "topic.note-count", text: "Page " + (cur + 1) + " of " + pages.length }));
      foot.appendChild(cur < pages.length - 1 ? el("button", { type: "button", class: "k-note-step", "data-ui": "topic.page", "data-state": "next", onclick: function () { show(cur + 1, true); } }, [
        el("span", { class: "k-kicker", text: "Next page ›" }), el("span", { class: "k-note-step-t", text: pages[cur + 1].title })
      ]) : nextLesson(ref));
      /* a page stayed on for a few seconds is a page read — evidence,
         written after the dwell, never by the render */
      var at = cur;
      clearTimeout(dwell);
      dwell = setTimeout(function () { if (article.isConnected && cur === at) markRead(at); }, DWELL);
      paintDots();
    }
    panel.appendChild(article);
    panel.appendChild(foot);
    show(cur);
  }
  function nextLesson(ref) {
    var ls = KOS.code.lessons(), L = KOS.code.lesson(ref);
    var n = L ? ls[L.idx + 1] : null;
    if (!n) return el("span");
    return el("button", { type: "button", class: "k-note-step", "data-ui": "topic.page code.next-lesson", "data-state": "next",
      onclick: function () { KOS.show("ref", { subject: SID, ref: n.ref }); } }, [
      el("span", { class: "k-kicker", text: "Next lesson ›" }), el("span", { class: "k-note-step-t", text: n.ref + " " + n.title })
    ]);
  }

  /* ---------------- Reference: every page in one column ---------------- */
  function renderReference(panel, ref, content) {
    var pages = KOS.content.splitPages(content.notes);
    var input = el("input", { type: "search", class: "k-input k-cx-find-in", "data-ui": "code.find", placeholder: "Search this lesson", "aria-label": "Search this lesson" });
    var count = el("span", { class: "k-cx-find-n k-mono", "data-ui": "code.find-count", "aria-live": "off" });
    var up = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Previous match", text: "↑", onclick: function () { step(-1); } });
    var down = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Next match", text: "↓", onclick: function () { step(1); } });
    var clear = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Clear the search", text: "✕", onclick: function () { input.value = ""; find(); input.focus(); } });
    panel.appendChild(el("div", { class: "k-cx-find", role: "search" }, [el("span", { "aria-hidden": "true", text: "⌕" }), input, count, up, down, clear]));
    var col = el("article", { class: "k-prose k-notes k-cx-notes k-cx-refcol", "data-ui": "topic.notes code.reference" });
    pages.forEach(function (pg, i) {
      var secEl = el("section", { class: "k-cx-refsec", id: "k-cx-pg-" + i, "data-page": String(i), "aria-labelledby": "k-cx-pgh-" + i });
      secEl.appendChild(el("h2", { class: "k-cx-refh", id: "k-cx-pgh-" + i }, [el("span", { class: "k-mono", text: String(i + 1) }), " " + pg.title]));
      var bodyEl = el("div", { html: KOS.content.renderBlocks(pg.blocks) });
      secEl.appendChild(bodyEl);
      col.appendChild(secEl);
    });
    panel.appendChild(col);
    KOS.content.typeset(col);
    KOS.codeUI.mountListings(col, ref);
    /* reading in Reference marks the pages that scroll into view */
    if (typeof window.IntersectionObserver === "function") {
      try {
        /* a section is read once it has filled half the screen (or shown 40%
           of itself, for a short one) for the same dwell as Learn — a long
           section can never be 40% visible, which is why it never counted */
        var timers = {};
        var io = new window.IntersectionObserver(function (es) {
          es.forEach(function (e) {
            var i = Number(e.target.getAttribute("data-page"));
            var seen = e.isIntersecting && (e.intersectionRatio >= 0.4 || e.intersectionRect.height >= window.innerHeight * 0.5);
            clearTimeout(timers[i]);
            if (seen) timers[i] = setTimeout(function () {
              if (!col.isConnected) return;
              var ev = KOS.code.state().lessons[ref];
              if (ev && ev.pages && ev.pages[i]) return;
              KOS.code.markPage(ref, i);
              document.dispatchEvent(new window.CustomEvent("kos:code-evidence", { detail: { ref: ref } }));
            }, DWELL);
          });
        }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.75, 1] });
        [].forEach.call(col.querySelectorAll(".k-cx-refsec"), function (s) { io.observe(s); });
      } catch (e) { /* no observer */ }
    }
    var hits = [], at = -1;
    function clearMarks() {
      [].forEach.call(col.querySelectorAll("mark.k-cx-hit"), function (m) { m.parentNode.replaceChild(document.createTextNode(m.textContent), m); });
      col.normalize();
    }
    function find() {
      clearMarks();
      hits = []; at = -1;
      var q = input.value.trim();
      var otp = document.querySelectorAll("[data-ui~='code.otp-count']");
      [].forEach.call(otp, function (n) { n.hidden = true; n.textContent = ""; });
      if (!q) { count.textContent = ""; return; }
      var lower = q.toLowerCase();
      var walker = document.createTreeWalker(col, window.NodeFilter.SHOW_TEXT, {
        acceptNode: function (n) {
          var p = n.parentNode;
          if (!p || p.closest("textarea, .k-ced-gutter, button, select")) return window.NodeFilter.FILTER_REJECT;
          return n.nodeValue.toLowerCase().indexOf(lower) >= 0 ? window.NodeFilter.FILTER_ACCEPT : window.NodeFilter.FILTER_SKIP;
        } });
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (n) {
        var text = n.nodeValue, lo = text.toLowerCase(), i = 0, frag = document.createDocumentFragment(), j;
        while ((j = lo.indexOf(lower, i)) >= 0) {
          frag.appendChild(document.createTextNode(text.slice(i, j)));
          var m = el("mark", { class: "k-cx-hit", text: text.slice(j, j + q.length) });
          frag.appendChild(m); hits.push(m);
          i = j + q.length;
        }
        frag.appendChild(document.createTextNode(text.slice(i)));
        n.parentNode.replaceChild(frag, n);
      });
      var per = {};
      hits.forEach(function (m) { var s = m.closest(".k-cx-refsec"); var k = s ? s.getAttribute("data-page") : "?"; per[k] = (per[k] || 0) + 1; });
      [].forEach.call(document.querySelectorAll("[data-ui~='code.otp-item']"), function (b) {
        var n = b.querySelector("[data-ui~='code.otp-count']"), c = per[b.getAttribute("data-page")];
        if (n && c) { n.hidden = false; n.textContent = String(c); }
      });
      if (!hits.length) { count.textContent = "0"; announce("No match for " + q + " in this lesson."); return; }
      step(1, true);
      announce((at + 1) + " of " + hits.length + " matches for " + q + ".");
    }
    function step(d, quiet) {
      if (!hits.length) return;
      if (at >= 0) KOS.ui.state(hits[at], "current", false);
      at = (at + d + hits.length) % hits.length;
      KOS.ui.state(hits[at], "current", true);
      count.textContent = (at + 1) + " of " + hits.length;
      if (hits[at].scrollIntoView) hits[at].scrollIntoView({ block: "center" });
      if (!quiet) {
        var s = hits[at].closest(".k-cx-refsec"), i = s ? Number(s.getAttribute("data-page")) : 0;
        announce((at + 1) + " of " + hits.length + ", page " + (i + 1) + " " + pages[i].title + ".");
      }
    }
    input.addEventListener("input", KOS.ui.debounce(find, 200));
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); step(e.shiftKey ? -1 : 1); } });
  }

  /* ================= Practice (frame 26e) ================= */
  var KIND_LABEL = { predict: "Predict", fill: "Fill the gap", bug: "Find the bug" };
  var KIND_HINT = { predict: "checked by running it", fill: "any answer whose program works", bug: "fix it, then run" };
  function renderPractice(panel, ref, p) {
    var kinds = ["predict", "fill", "bug"].filter(function (k) { return p[k].length; });
    if (!kinds.length) {
      panel.appendChild(KOS.ui.emptyState({ compact: true, mark: "練", title: "No practice on this lesson yet",
        body: "Predict, fill-the-gap and find-the-bug questions arrive with the lesson's unit." }));
      return;
    }
    var ui = U();
    var kind = kinds.indexOf(ui.practiceKind) >= 0 ? ui.practiceKind : kinds[0];
    var idx = 0;
    var pills = el("div", { class: "k-seg k-seg--quiet k-cx-pills", role: "tablist", "aria-label": "Practice kinds" });
    var card = el("section", { class: "k-card k-cx-q", "data-ui": "code.practice" });
    kinds.forEach(function (k) {
      pills.appendChild(el("button", { type: "button", class: "k-seg-item", role: "tab", "data-kind": k,
        "aria-selected": String(k === kind), tabindex: k === kind ? "0" : "-1",
        onclick: function () { choose(k); } }, [KIND_LABEL[k] + " ", el("span", { class: "k-mono", text: String(p[k].length) })]));
    });
    pills.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var i = kinds.indexOf(kind) + (e.key === "ArrowRight" ? 1 : -1);
      if (i < 0 || i >= kinds.length) return;
      e.preventDefault(); choose(kinds[i]);
      var b = pills.querySelector('[data-kind="' + kinds[i] + '"]'); if (b) b.focus();
    });
    function choose(k) {
      kind = k; idx = 0; ui.practiceKind = k;
      [].forEach.call(pills.children, function (b) { var on = b.getAttribute("data-kind") === k; b.setAttribute("aria-selected", String(on)); b.setAttribute("tabindex", on ? "0" : "-1"); KOS.ui.state(b, "active", on); });
      draw();
    }
    function draw() {
      card.innerHTML = "";
      var list = p[kind], item = list[idx];
      card.appendChild(el("div", { class: "k-cx-q-head" }, [
        el("span", { class: "k-kicker", text: "Question " + (idx + 1) + " of " + list.length }),
        el("span", { class: "k-cx-q-how", text: KIND_HINT[kind] })
      ]));
      var done = function () {
        if (idx < list.length - 1) return el("button", { type: "button", class: "k-btn", "data-ui": "code.practice-next", text: "Next →", onclick: function () { idx++; draw(); } });
        return el("span", { class: "k-cx-q-end", text: "That's every " + KIND_LABEL[kind].toLowerCase() + " question here." });
      };
      if (kind === "predict") predictCard(card, ref, item, done);
      else if (kind === "fill") fillCard(card, ref, item, done);
      else bugCard(card, ref, item, done);
    }
    [].forEach.call(pills.children, function (b) { KOS.ui.state(b, "active", b.getAttribute("data-kind") === kind); });
    panel.appendChild(pills);
    panel.appendChild(card);
    draw();
  }
  function codeBlock(src, ref) {
    return el("pre", { class: "k-cx-q-code k-mono", html: KOS.codeUI.highlight(src, ref && KOS.code.runnerFor(ref) === "sql" ? "sql" : null) });
  }
  function verdict(ok, text) {
    return el("p", { class: "k-cx-verdict", "data-state": ok ? "right" : "wrong", role: "status" }, [el("b", { text: (ok ? "✓ " : "✗ ") + text })]);
  }
  function predictCard(card, ref, item, done) {
    card.appendChild(el("h3", { class: "k-cx-q-t", text: item.q || "What does this print?" }));
    if (item.fs) card.appendChild(KOS.codeUI.filesPanel(item.fs, { open: true }));
    var sqlQ = KOS.code.runnerFor(ref) === "sql";
    card.appendChild(codeBlock(item.src, ref));
    var ans = el("textarea", { class: "k-input k-cx-q-in", rows: "2", "aria-label": "What it prints", placeholder: sqlQ ? "Type the values it returns, one row a line" : "Type what it prints" });
    var out = el("div", { class: "k-cx-q-out" });
    var check = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.practice-check", text: "Check",
      onclick: function () {
        check.disabled = true;
        KOS.codeRun.run({ files: [{ name: KOS.code.fileFor(ref), src: item.src }], stdin: item.stdin || "", fs: item.fs, db: item.db, lesson: ref }).then(function (r) {
          check.disabled = false;
          out.innerHTML = "";
          var real = r.ok ? KOS.codeRun.norm(r.stdout) : null;
          var ok = r.ok && KOS.codeRun.sameAnswer(ans.value, r.stdout, sqlQ ? "sql" : null);
          if (!r.ok) { out.appendChild(KOS.codeUI.errorCard(r.error)); return; }
          out.appendChild(verdict(ok, ok ? "Right · prints " + KOS.codeRun.firstLine(real) : "Not yet · it prints " + KOS.codeRun.firstLine(real)));
          if (item.why) out.appendChild(el("p", { class: "k-cx-why" }, [el("b", { text: "Why · " }), el("span", { html: KOS.content.inline(item.why) })]));
          announce(ok ? "Right. Prints " + KOS.codeRun.firstLine(real) + "." : "Not yet. It prints " + KOS.codeRun.firstLine(real) + ".");
          if (ok) { KOS.code.recordPractice(ref, item.id, item.concepts); out.appendChild(done()); }
          else out.appendChild(el("button", { type: "button", class: "k-btn", text: "Try again", onclick: function () { out.innerHTML = ""; ans.focus(); } }));
        });
      } });
    card.appendChild(el("div", { class: "k-cx-q-row" }, [ans, check]));
    card.appendChild(out);
  }
  function fillCard(card, ref, item, done) {
    card.appendChild(el("h3", { class: "k-cx-q-t", text: item.q || "Fill the gaps so the program works." }));
    var parts = String(item.src).split("@@");
    var inputs = [];
    var pre = el("pre", { class: "k-cx-q-code k-cx-fill k-mono" });
    parts.forEach(function (part, i) {
      pre.appendChild(el("span", { html: KOS.codeUI.highlight(part, KOS.code.runnerFor(ref) === "sql" ? "sql" : null) }));
      if (i < parts.length - 1) {
        var inp = el("input", { type: "text", class: "k-cx-gap", "data-ui": "code.gap", spellcheck: "false", autocapitalize: "off",
          "aria-label": "Gap " + (i + 1), size: String(Math.max(4, (item.size && item.size[i]) || 8)) });
        inputs.push(inp); pre.appendChild(inp);
      }
    });
    card.appendChild(pre);
    var out = el("div", { class: "k-cx-q-out" });
    var check = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.practice-check", text: "Check",
      onclick: function () {
        var src = parts.map(function (part, i) { return part + (i < inputs.length ? inputs[i].value : ""); }).join("");
        check.disabled = true;
        var cases = item.cases || [{ stdin: item.stdin || "", out: item.out }];
        KOS.codeRun.check({ mode: "program", cases: cases, fs: item.fs, db: item.db, lesson: ref }, [{ name: KOS.code.fileFor(ref), src: src }]).then(function (c) {
          check.disabled = false;
          out.innerHTML = "";
          if (c.compile) { out.appendChild(KOS.codeUI.errorCard(c.compile)); announce("Compile error " + c.compile.code + "."); return; }
          var ok = c.passed;
          out.appendChild(verdict(ok, ok ? "Runs · " + c.pass + " of " + c.total + " cases" : c.pass + " of " + c.total + " cases pass"));
          if (ok && item.also) out.appendChild(el("p", { class: "k-cx-why", text: "Also accepted: " + item.also }));
          if (item.why && ok) out.appendChild(el("p", { class: "k-cx-why" }, [el("b", { text: "Why · " }), el("span", { html: KOS.content.inline(item.why) })]));
          if (!ok && c.results.length) out.appendChild(KOS.codeUI.results(c));
          announce(ok ? "Right. It runs." : "Not yet. " + c.pass + " of " + c.total + " cases pass.");
          if (ok) { KOS.code.recordPractice(ref, item.id, item.concepts); out.appendChild(done()); }
        });
      } });
    card.appendChild(el("div", { class: "k-cx-q-row" }, [check]));
    card.appendChild(out);
  }
  function bugCard(card, ref, item, done) {
    card.appendChild(el("h3", { class: "k-cx-q-t", text: item.q || "Find the bug, fix it, then run." }));
    if (item.expect) card.appendChild(el("p", { class: "k-cx-q-sub", text: item.expect }));
    var ed = KOS.codeUI.editor({ value: item.src, file: item.file || (KOS.code.runnerFor(ref) === "sql" ? "query.sql" : "Bug.cs"), compact: true, label: "Buggy code", onRun: go });
    card.appendChild(ed.el);
    var out = el("div", { class: "k-cx-q-out" });
    var run = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.practice-check", text: "▶ Run", onclick: go });
    card.appendChild(el("div", { class: "k-cx-q-row" }, [run, el("button", { type: "button", class: "k-btn k-btn--quiet", text: "Reset", onclick: function () { ed.set(item.src); out.innerHTML = ""; } })]));
    card.appendChild(out);
    function go() {
      run.disabled = true; ed.running(true);
      KOS.codeRun.check({ mode: "program", cases: item.cases || [{ stdin: item.stdin || "", out: item.out }], fs: item.fs, db: item.db, lesson: ref }, ed.files()).then(function (c) {
        run.disabled = false; ed.running(false);
        out.innerHTML = "";
        if (c.compile) { ed.state("compile", "1 compile error"); ed.mark(c.compile.line, KOS.codeUI.quoted(c.compile.msg)); out.appendChild(KOS.codeUI.errorCard(c.compile)); return; }
        var ok = c.passed;
        ed.state(ok ? "pass" : "fail", ok ? "Fixed" : "Not fixed yet");
        out.appendChild(verdict(ok, ok ? "Fixed · " + (item.fixedText || "the output is right") : "Not yet"));
        if (ok && item.why) out.appendChild(el("p", { class: "k-cx-why", text: item.why }));
        if (!ok) out.appendChild(KOS.codeUI.results(c));
        announce(ok ? "Fixed." : "Not fixed yet.");
        if (ok) { KOS.code.recordPractice(ref, item.id, item.concepts); out.appendChild(done()); }
      });
    }
  }

  /* ================= Tasks ================= */
  var TIER = { "warm-up": "Warm-up", core: "Core", stretch: "Stretch" };
  function renderTasks(panel, ref, tasks) {
    /* a Rider lesson's work: the milestones of its project, proven by a report */
    var pms = KOS.code.projectMilestonesOf(ref);
    if (pms.length) {
      var byProj = {};
      pms.forEach(function (x) { (byProj[x.project] = byProj[x.project] || []).push(x.id); });
      Object.keys(byProj).forEach(function (pid) {
        var v = KOS.code.projectView(pid);
        panel.appendChild(el("ul", { class: "k-cx-tasks", "data-ui": "code.project-milestones" }, v.milestones.filter(function (m) { return byProj[pid].indexOf(m.id) >= 0; }).map(function (m) {
          return el("li", { class: "k-cx-task", "data-state": m.passedAt ? "pass" : m.state === "failing" ? "tried" : null }, [
            el("div", { class: "k-cx-task-txt" }, [el("b", { text: m.id.toUpperCase() + " · " + m.title }),
              el("span", { class: "k-cx-task-meta" }, [el("span", { class: "k-cx-chip", text: "⌘ Rider" }), " " + v.spec.title])]),
            el("span", { class: "k-cx-task-st", text: m.passedAt ? "✓ Passed · " + (m.level === "ci" ? "◆ CI-verified" : "◐ Self-run") : m.state === "failing" ? "✗ Failing in the last report" : "Not validated" }),
            el("button", { type: "button", class: "k-btn k-btn--sm" + (m.passedAt ? "" : " k-btn--primary"), "data-ui": "code.project-open", text: "Open the project",
              onclick: function () { KOS.show("code", { page: "project", id: pid }); } })
          ]);
        })));
      });
      if (!tasks.length) return;
    }
    if (!tasks.length) {
      panel.appendChild(KOS.ui.emptyState({ compact: true, mark: "課", title: "No tasks on this lesson yet",
        body: "Tasks arrive with the lesson's unit. Each one is checked against hidden tests on this device." }));
      return;
    }
    var list = el("ul", { class: "k-cx-tasks", "data-ui": "code.task-list" });
    tasks.forEach(function (t) {
      var s = KOS.code.taskState(t.id);
      var status = s.passAt ? "✓ Passed " + new Date(s.passAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })
        : s.seen ? "Answer opened" : s.tries ? "Tried " + plural(s.tries, "time") : "Not started";
      list.appendChild(el("li", { class: "k-cx-task", "data-state": s.passAt ? "pass" : s.tries ? "tried" : null }, [
        el("div", { class: "k-cx-task-txt" }, [
          el("b", { text: t.title }),
          el("span", { class: "k-cx-task-meta" }, [
            el("span", { class: "k-cx-chip", text: TIER[t.tier] || "Core" }),
            " ", (t.concepts || []).map(function (c) { var cc = KOS.code.concept(c); return cc ? cc.name : c; }).join(" · ")
          ])
        ]),
        el("span", { class: "k-cx-task-st", text: status }),
        el("button", { type: "button", class: "k-btn k-btn--sm" + (s.passAt ? "" : " k-btn--primary"), "data-ui": "code.task-open",
          text: s.passAt ? "Open" : s.tries ? "Continue" : "Start",
          onclick: function () { KOS.show("code", { page: "task", id: t.id }); } })
      ]));
    });
    panel.appendChild(list);
  }

  /* one practice question in a card (the kata reuses the lesson's own) */
  function practiceCard(kind, card, ref, item, done) {
    if (kind === "predict") predictCard(card, ref, item, done);
    else if (kind === "fill") fillCard(card, ref, item, done);
    else bugCard(card, ref, item, done);
  }
  KOS.codeTopic = { begin: begin, spine: spine, quickRef: quickRef, practiceCard: practiceCard, KIND_LABEL: KIND_LABEL };
})();
