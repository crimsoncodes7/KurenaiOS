/* Kurenai OS — modules/hub.js
   The Revision Hub: subject dashboards, the spec spine tree, the
   split-screen reference view, progress tracking and global search. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var SUBJECTS = ["compsci", "maths", "it"];
  var COLORS = { compsci: "var(--c-compsci)", maths: "var(--c-maths)", it: "var(--c-it)" };
  var HEX = { compsci: "#45d6a8", maths: "#7b9ef8", it: "#c77bf2" };
  var STATUS = [
    ["none", "Not started"], ["started", "Started"],
    ["paused", "Paused"], ["done", "Completed"]
  ];
  var STATUS_GLYPH = { none: "○", started: "◐", paused: "◔", done: "●" };
  var CHECKS = ["Covered in class", "Studied it", "Done exam Qs", "Fully understood"];

  /* ---------- flatten data into ordered leaf lists & a search index ---------- */
  var LEAVES = {};       // subjectId -> [{ref,title,content,info,path:[..titles],section}]
  var BYREF = {};        // subjectId -> ref -> leaf
  var SEARCH_INDEX = []; // {subject, ref, title, text}

  function flatten() {
    SUBJECTS.forEach(function (sid) {
      var data = KOS_DATA[sid];
      LEAVES[sid] = []; BYREF[sid] = {};
      data.sections.forEach(function (sec) {
        walk(sec, [sec.title], sec);
      });
      function walk(node, path, section) {
        if (node.content && node.content.length) {
          /* clean hand-verified spec override (e.g. IT F201, whose generated
             content/info were garbled by PDF parsing) replaces content+info */
          var fix = window.KOS_SPEC_FIX && window.KOS_SPEC_FIX[sid + ":" + node.ref];
          var leaf = { ref: node.ref, title: node.title,
                       content: fix ? fix.content : node.content,
                       info: fix ? fix.info : (node.info || []), path: path.slice(0, -1), section: section };
          leaf.idx = LEAVES[sid].length;
          LEAVES[sid].push(leaf);
          BYREF[sid][node.ref] = leaf;
          var deep = window.KOS_CONTENT[sid + ":" + node.ref];
          SEARCH_INDEX.push({
            subject: sid, ref: node.ref, title: node.title,
            text: (node.title + " " + node.content.join(" ") + " " + (node.info || []).join(" ")).toLowerCase(),
            fctext: deep && deep.flashcards ? deep.flashcards.map(function (c) {
              return c[0] + " " + c[1]; }).join(" ").toLowerCase() : ""
          });
        }
        (node.children || []).forEach(function (c) { walk(c, path.concat(c.title), section); });
      }
    });
  }
  flatten();

  /* ---------- progress helpers ---------- */
  function leafPercent(sid, ref) {
    var p = store.peekProgress(sid, ref);
    if (!p) return 0;
    if (p.status === "done") return 100;
    return p.check.filter(Boolean).length * 25;
  }
  function subjectStats(sid) {
    var s = { none: 0, started: 0, paused: 0, done: 0, total: LEAVES[sid].length };
    LEAVES[sid].forEach(function (l) {
      var p = store.peekProgress(sid, l.ref);
      s[(p && p.status) || "none"]++;
    });
    s.pct = s.total ? Math.round(100 * s.done / s.total) : 0;
    return s;
  }
  function sectionStats(sid, sec) {
    var done = 0, total = 0;
    (function walk(n) {
      if (n.content && n.content.length) {
        total++;
        var p = store.peekProgress(sid, n.ref);
        if (p && p.status === "done") done++;
      }
      (n.children || []).forEach(walk);
    })(sec);
    return { done: done, total: total, pct: total ? Math.round(100 * done / total) : 0 };
  }
  function refreshRailCounters() {
    SUBJECTS.forEach(function (sid) {
      var n = document.getElementById("pc-" + sid);
      if (n) n.textContent = subjectStats(sid).pct + "%";
    });
    var total = SUBJECTS.reduce(function (a, s) { return a + LEAVES[s].length; }, 0);
    var nc = document.getElementById("node-count");
    if (nc) nc.textContent = total;
    var due = document.getElementById("pc-due");
    if (due && KOS.srs) {
      var n2 = KOS.srs.dueCount();
      due.textContent = n2 ? String(n2) : "";
      due.classList.toggle("hot", n2 > 0);
    }
  }
  KOS.refreshRailCounters = refreshRailCounters;

  /* ---------- tree ---------- */
  function renderTree(sid, activeRef) {
    var tree = document.getElementById("tree");
    tree.classList.remove("hidden");
    document.getElementById("cols").classList.remove("no-tree");
    tree.innerHTML = "";
    var data = KOS_DATA[sid];
    tree.style.setProperty("--accent", COLORS[sid]);
    tree.appendChild(el("div", { class: "tree-subject-h" }, [
      el("span", { class: "t", text: data.name, style: "color:" + COLORS[sid] }),
      el("span", { class: "b", text: data.board })
    ]));
    var open = store.state.ui.openSections[sid] = store.state.ui.openSections[sid] || {};

    data.sections.forEach(function (sec) {
      var secEl = el("div", { class: "sec" + (open[sec.ref] ? " open" : "") });
      var head = el("button", {
        class: "sec-head", style: "--accent:" + COLORS[sid],
        "aria-expanded": open[sec.ref] ? "true" : "false",
        onclick: function () {
          open[sec.ref] = !open[sec.ref];
          secEl.classList.toggle("open", open[sec.ref]);
          head.setAttribute("aria-expanded", open[sec.ref]);
          store.save();
        }
      }, [
        el("span", { class: "ref", text: sec.ref }),
        el("span", { text: sec.title }),
        el("span", { class: "arr", text: "▶" })
      ]);
      secEl.appendChild(head);

      var kids = el("div", { class: "sec-kids" });
      if (sec.content && sec.content.length) appendLeaf(kids, sec);
      (sec.children || []).forEach(function (child) { appendNode(kids, child); });
      secEl.appendChild(kids);
      tree.appendChild(secEl);

      function appendNode(parentEl, node) {
        var isLeaf = node.content && node.content.length;
        var hasKids = node.children && node.children.length;
        if (isLeaf && !hasKids) { appendLeaf(parentEl, node); return; }
        if (hasKids) {
          var gkey = "g:" + node.ref;
          if (open[gkey] === undefined) open[gkey] = true;
          var grpKids = el("div", { class: "grp-kids", style: open[gkey] ? "" : "display:none" });
          var gbtn = el("button", { class: "grp-h", "aria-expanded": String(!!open[gkey]),
            onclick: function () {
              open[gkey] = !open[gkey];
              grpKids.style.display = open[gkey] ? "" : "none";
              gbtn.classList.toggle("closed", !open[gkey]);
              gbtn.setAttribute("aria-expanded", String(!!open[gkey]));
              store.save();
            } }, [
            el("span", { class: "grp-arr", text: "▾" }),
            el("span", { text: node.ref + " · " + node.title })
          ]);
          if (!open[gkey]) gbtn.classList.add("closed");
          parentEl.appendChild(gbtn);
          if (isLeaf) appendLeaf(grpKids, node);
          node.children.forEach(function (c) { appendNode(grpKids, c); });
          parentEl.appendChild(grpKids);
        }
      }
      function appendLeaf(parentEl, node) {
        var p = store.peekProgress(sid, node.ref);
        var status = (p && p.status) || "none";
        var btn = el("button", {
          class: "leaf" + (node.ref === activeRef ? " active" : ""),
          style: "--accent:" + COLORS[sid],
          onclick: function () { KOS.show("ref", { subject: sid, ref: node.ref }); }
        }, [
          el("span", { class: "spine", style: "--p:" + leafPercent(sid, node.ref) }),
          el("span", { class: "body" }, [
            el("span", { class: "lref" }, [
              el("span", { text: node.ref }),
              KOS.content.has(sid, node.ref) ? el("span", { class: "deep", text: "◆ notes", title: "Deep revision content available" }) : null
            ]),
            el("span", { class: "lt", text: node.title, title: node.title })
          ]),
          el("span", { class: "st st-" + status, text: STATUS_GLYPH[status], "aria-label": status })
        ]);
        parentEl.appendChild(btn);
      }
    });
    if (activeRef) {
      var act = tree.querySelector(".leaf.active");
      if (act && act.scrollIntoView) act.scrollIntoView({ block: "center" });
    }
  }
  function hideTree() {
    document.getElementById("tree").classList.add("hidden");
    document.getElementById("cols").classList.add("no-tree");
  }

  /* ---------- views ---------- */
  function masteredCount() {
    var n = 0;
    SUBJECTS.forEach(function (sid) {
      LEAVES[sid].forEach(function (l) {
        var p = store.peekProgress(sid, l.ref);
        if (p && p.check && p.check.every(Boolean)) n++;
      });
    });
    return n;
  }

  KOS.views.home = function (main) {
    hideTree();
    var totals = { done: 0, total: 0 };
    SUBJECTS.forEach(function (sid) {
      var st = subjectStats(sid);
      totals.done += st.done; totals.total += st.total;
    });
    var pct = totals.total ? Math.round(100 * totals.done / totals.total) : 0;
    var study = store.state.study || {};
    var fcSeen = Object.keys(study.fc || {}).reduce(function (a, k) { return a + study.fc[k].seen; }, 0);
    var qAtt = Object.keys(study.quiz || {}).reduce(function (a, k) { return a + study.quiz[k].attempts; }, 0);
    var stks = KOS.sessions.streaks();
    var dueN = KOS.srs.dueCount();

    main.appendChild(el("div", { class: "home-hero" }, [
      el("h1", {}, [el("span", { class: "kanji-inline", text: "紅" }), " Kurenai OS"])
    ]));

    /* governor state banner — recovery nudge when HP is low */
    var hpS = KOS.governor.hpState();
    if (hpS !== "healthy") {
      main.appendChild(el("div", { class: "gov-banner " + (hpS === "critical" ? "bad" : "warn") }, [
        el("span", { html: hpS === "critical"
          ? "<b>HP Critical.</b> Recovery Mode is the fastest way back — clear a few due cards and tick today's list."
          : "<b>HP Strained.</b> Labs, sims and the shop are suspended until 60 HP. Core revision stays open." }),
        el("button", { class: "btn", text: hpS === "critical" ? "Open Recovery →" : "Governor →",
          onclick: function () { KOS.show("governor"); } })
      ]));
    }

    /* TOP — full-width stats bar */
    var ringWrap = el("div", { class: "home-ring" });
    var ringCv = el("canvas", { "aria-label": "Overall completion" });
    ringWrap.appendChild(ringCv);
    function hstat(v, k, onclick) {
      return el("div", { class: "hstat" + (onclick ? " click" : ""), onclick: onclick || function () {} }, [
        el("div", { class: "v", text: String(v) }),
        el("div", { class: "k", text: k })]);
    }
    main.appendChild(el("div", { class: "home-stats" }, [
      ringWrap,
      hstat(totals.done + "/" + totals.total, "Spec points"),
      hstat(masteredCount(), "Topics mastered"),
      hstat(fcSeen, "Flashcards reviewed"),
      hstat(qAtt, "Quiz attempts"),
      hstat(dueN, dueN === 1 ? "Card due today" : "Cards due today", function () { KOS.show("due"); }),
      hstat(stks.all + (stks.all === 1 ? " day" : " days"), "Study streak")
    ]));

    /* focus CTA — start (or return to) a timed session */
    var fxActive = KOS.focus && KOS.focus.state() !== "idle";
    main.appendChild(el("button", { class: "focus-cta" + (fxActive ? " live" : ""), onclick: function () {
      KOS.show("focus");
    } }, [
      el("span", { class: "k", "aria-hidden": "true", text: "集" }),
      el("span", { class: "t" }, [
        el("b", { text: fxActive ? "Focus session in progress" : "Start a focus session" }),
        el("span", { text: fxActive ? "The clock is running — return to the stage." : "Pomodoro or custom timer · what you study during it gets logged to the session." })
      ]),
      el("span", { class: "go", text: "→" })
    ]));

    /* TODAY — auto-generated to-do + deadline countdowns side by side */
    var todayRow = el("div", { class: "home-today" });
    todayRow.appendChild(KOS.todo.panel());
    todayRow.appendChild(KOS.calendar.countdownWidget(null));
    main.appendChild(todayRow);

    /* prescriptive analytics — struggling topics across all subjects (FR-3.3) */
    var ragPanel = KOS.rag.panel(null);
    if (ragPanel) main.appendChild(ragPanel);

    /* MIDDLE — subject cards with a slim completion progress bar */
    var cards = el("div", { class: "home-cards" });
    SUBJECTS.forEach(function (sid) {
      var d = KOS_DATA[sid], st = subjectStats(sid);
      var cov = KOS.content.coverage(sid, LEAVES[sid]);
      var card = el("div", {
        class: "subj-card", style: "--accent:" + COLORS[sid],
        role: "button", tabindex: "0",
        onclick: function () { KOS.show("subject", sid); },
        onkeydown: function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); KOS.show("subject", sid); } }
      }, [
        el("div", { class: "subj-card-top" }, [
          el("div", {}, [
            el("h3", { text: d.name }),
            el("span", { class: "b", text: d.board })
          ]),
          (function () { var c = el("canvas", { class: "mini-ring" }); setTimeout(function () {
            miniRing(c, st.pct, HEX[sid]); }, 0); return c; })()
        ]),
        el("div", { class: "m", text: st.done + "/" + st.total + " completed · " + cov + " deep-content topics" }),
        el("div", { class: "streak-chip" + (stks[sid] ? " lit" : ""),
          title: "Days in a row with a logged session in this subject" }, [
          el("span", { class: "fl", text: "炎" }),
          el("span", { text: stks[sid] + (stks[sid] === 1 ? " day streak" : " day streak") })
        ])
      ]);

      /* slim liquid-glass progress track — overall subject completion */
      card.appendChild(el("div", {
        class: "subj-track", "aria-label": st.pct + "% complete",
        title: st.done + "/" + st.total + " spec points completed"
      }, [el("span", { class: "subj-fill", style: "width:" + st.pct + "%" })]));

      var last = store.state.ui.lastRef[sid];
      if (last && BYREF[sid][last]) {
        card.appendChild(el("button", {
          class: "continue mini", style: "--accent:" + COLORS[sid],
          onclick: function (e) {
            e.stopPropagation();
            KOS.show("ref", { subject: sid, ref: last });
          }
        }, [
          el("span", { class: "d", text: "Continue" }),
          el("b", { text: last + " " + BYREF[sid][last].title })
        ]));
      }
      cards.appendChild(card);
    });
    main.appendChild(cards);

    /* BOTTOM — the Collection Matrix (live, Build 3a) + future builds */
    var soon = el("div", { class: "home-cards soon-row" });
    soon.appendChild(el("div", { class: "subj-card med-home-card", style: "--accent:#8C7CFF",
      role: "button", tabindex: "0",
      onclick: function () { KOS.show("matrix"); },
      onkeydown: function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); KOS.show("matrix"); } }
    }, [
      el("span", { class: "soon-tag live", text: "Live · Build 3d" }),
      el("h3", {}, [el("span", { class: "kanji-inline", text: "蒐" }), " Kurenai Collection Matrix"]),
      el("div", { class: "m", text: "Anime + Books + Visual Novels: two-way AniList sync & VNDB · search-to-add · physical volume shelf · routes & quote log · rest streak · the Shrine. Games plugs in next." })
    ]));
    [["Build 4", "Competitions & Music", "AniCord events, playlists, Ollama bridge"]
    ].forEach(function (t) {
      soon.appendChild(el("div", { class: "subj-card soon-card" }, [
        el("span", { class: "soon-tag", text: "Coming soon" }),
        el("h3", { text: t[0] + ": " + t[1] }),
        el("div", { class: "m", text: t[2] })
      ]));
    });
    main.appendChild(soon);

    bigRing(ringCv, pct);
  };

  function bigRing(canvas, pct) {
    var dpr = window.devicePixelRatio || 1, size = 112;
    canvas.width = size * dpr; canvas.height = size * dpr;
    canvas.style.width = size + "px"; canvas.style.height = size + "px";
    var ctx = canvas.getContext("2d");
    if (!ctx || !ctx.scale) return;
    ctx.scale(dpr, dpr);
    var cx = size / 2, cy = size / 2, r = 45;
    ctx.lineWidth = 9; ctx.lineCap = "round";
    ctx.strokeStyle = "#2c2240";
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    if (pct > 0) {
      var grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, "#8C7CFF"); grad.addColorStop(1, "#35D7FF");
      ctx.strokeStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct / 100); ctx.stroke();
    }
    ctx.fillStyle = "#ece7f4";
    ctx.font = "700 24px 'Avenir Next Condensed','Arial Narrow',sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(pct + "%", cx, cy - 5);
    ctx.fillStyle = "#6f6488"; ctx.font = "8px 'SF Mono',monospace";
    ctx.fillText("COVERED", cx, cy + 14);
  }
  function miniRing(canvas, pct, color) {
    var dpr = window.devicePixelRatio || 1, size = 54;
    canvas.width = size * dpr; canvas.height = size * dpr;
    canvas.style.width = size + "px"; canvas.style.height = size + "px";
    var ctx = canvas.getContext("2d");
    if (!ctx || !ctx.scale) return;
    ctx.scale(dpr, dpr);
    var cx = size / 2, cy = size / 2, r = 21;
    ctx.lineWidth = 5; ctx.lineCap = "round";
    ctx.strokeStyle = "#2c2240";
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    if (pct > 0) {
      ctx.strokeStyle = color;
      ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct / 100); ctx.stroke();
    }
    ctx.fillStyle = "#ece7f4"; ctx.font = "700 12px 'SF Mono',monospace";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(pct + "%", cx, cy);
  }

  /* labs reachable per subject now the rail entries are gone */
  var PRACTICE = {
    compsci: [
      ["Trace Lab", "Stacks, queues, lists & trees animated with trace tables", function () { KOS.show("trace"); }, { view: "trace" }],
      ["OOP Sandbox", "Drag class blocks, draw inheritance, read the C#", function () { KOS.show("oop"); }, { view: "oop" }],
      ["Logic Lab", "Boolean expressions with live truth tables", function () { KOS.sims.open("logic-lab"); }, { sim: "logic-lab" }],
      ["Sort Visualiser", "Bubble vs merge — watch the Big-O gap appear", function () { KOS.sims.open("sort-viz"); }, { sim: "sort-viz" }],
      ["FSM Lab", "Feed strings through acceptor state machines", function () { KOS.sims.open("fsm-lab"); }, { sim: "fsm-lab" }]
    ],
    maths: [
      ["Worked Examples", "Mark-scheme walkthroughs by paper, your numbers", function () { KOS.show("worked"); }, null],
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
    var deepLeaves = LEAVES[sid].filter(function (l) { return KOS.content.has(sid, l.ref); });
    if (deepLeaves.length < 2) { KOS.ui.toast("Need at least two deep-content topics to compare.", true); return; }
    var overlay = el("div", { class: "modal-ov", onclick: function (e) { if (e.target === overlay) close(); } });
    function close() { overlay.remove(); document.removeEventListener("keydown", onEsc); }
    function onEsc(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onEsc);

    function picker(defIdx) {
      return el("select", { class: "status-sel" }, deepLeaves.map(function (l, i) {
        var o = el("option", { value: l.ref, text: l.ref + " — " + l.title });
        if (i === defIdx) o.selected = true;
        return o;
      }));
    }
    var selA = picker(0), selB = picker(1);
    var grid = el("div", { class: "cmp-grid" });
    function renderSide(holder, ref) {
      holder.innerHTML = "";
      var leaf = BYREF[sid][ref], c = KOS.content.get(sid, ref);
      if (!leaf || !c) return;
      holder.appendChild(el("h3", { class: "n-h", style: "margin-top:0", text: ref + " " + leaf.title }));
      var art = el("article", { class: "notes-article", html: KOS.content.renderBlocks(c.notes) });
      holder.appendChild(art);
      KOS.content.typeset(art);
    }
    var colA = el("div", { class: "cmp-col" }), colB = el("div", { class: "cmp-col" });
    grid.appendChild(colA); grid.appendChild(colB);
    function update() { renderSide(colA, selA.value); renderSide(colB, selB.value); }
    selA.onchange = update; selB.onchange = update;

    overlay.appendChild(el("div", { class: "modal" }, [
      el("div", { class: "modal-h" }, [
        el("b", { text: "Compare topics — " + KOS_DATA[sid].name }),
        selA, el("span", { class: "cmp-vs", text: "vs" }), selB,
        el("button", { class: "btn", text: "✕ Close", style: "margin-left:auto", onclick: close })
      ]),
      grid
    ]));
    document.body.appendChild(overlay);
    update();
  }

  KOS.views.subject = function (main, sid) {
    renderTree(sid, null);
    var d = KOS_DATA[sid], s = subjectStats(sid);
    main.style.setProperty("--accent", COLORS[sid]);

    /* header: name + board + paper structure */
    var papers = [];
    d.sections.forEach(function (sec) {
      var lbl = sec.paper !== undefined ? paperLabel(sid, sec.paper) : null;
      if (lbl && papers.indexOf(lbl) === -1) papers.push(lbl);
    });
    main.appendChild(el("div", { class: "dash-head" }, [
      el("h1", { text: d.name }),
      el("div", {}, [
        el("span", { class: "board", text: d.board }),
        el("span", { class: "papers", text: papers.join("  ·  ") })
      ]),
      el("button", { class: "btn", style: "margin-left:auto", text: "⇆ Compare topics",
        onclick: function () { compareModal(sid); } })
    ]));

    /* stat strip */
    var cov = KOS.content.coverage(sid, LEAVES[sid]);
    var study = store.state.study || {};
    var fcSeen = 0, bestPct = 0;
    Object.keys(study.fc || {}).forEach(function (k) {
      if (k.indexOf(sid + ":") === 0) fcSeen += study.fc[k].seen;
    });
    Object.keys(study.quiz || {}).forEach(function (k) {
      if (k.indexOf(sid + ":") === 0) bestPct = Math.max(bestPct, study.quiz[k].lastPct || 0);
    });
    var subjStreak = KOS.sessions.streak(sid);
    main.appendChild(el("div", { class: "stat-strip" }, [
      stat(s.total, "Spec points"), stat(s.done, "Completed"),
      stat(s.started, "Started"), stat(s.paused, "Paused"),
      stat(cov, "Deep-content topics"),
      stat((s.total ? Math.round(100 * cov / s.total) : 0) + "%", "Deep-content %"),
      stat(fcSeen, "Flashcards reviewed"),
      stat(bestPct + "%", "Best quiz score"),
      stat(subjStreak + (subjStreak === 1 ? " day" : " days"), "Subject streak")
    ]));
    function stat(v, k) {
      return el("div", { class: "stat-card" }, [
        el("div", { class: "v", text: String(v) }), el("div", { class: "k", text: k })]);
    }

    /* deadline countdowns scoped to this subject (FR-3.6) */
    main.appendChild(KOS.calendar.countdownWidget(sid));

    /* struggling topics in this subject (FR-3.3) */
    var ragPanel = KOS.rag.panel(sid);
    if (ragPanel) { ragPanel.style.marginTop = "18px"; main.appendChild(ragPanel); }

    var last = store.state.ui.lastRef[sid];
    if (last && BYREF[sid][last]) {
      main.appendChild(el("button", {
        class: "continue", style: "margin-bottom:18px",
        onclick: function () { KOS.show("ref", { subject: sid, ref: last }); }
      }, [
        el("span", { text: "Continue where you left off →" }),
        el("b", { text: last + " " + BYREF[sid][last].title })
      ]));
    }

    /* section breakdown — grid of colour-coded cards, expandable */
    function tone(pct) { return pct < 20 ? "low" : pct <= 70 ? "mid" : "high"; }
    var secGrid = el("div", { class: "sec-grid" });
    d.sections.forEach(function (sec) {
      var st = sectionStats(sid, sec);
      if (!st.total) return;
      var card = el("div", { class: "sec-card " + tone(st.pct) });
      var sub = el("div", { class: "sec-sub", style: "display:none" });
      var head = el("button", {
        class: "sec-card-h", "aria-expanded": "false",
        onclick: function () {
          var open = sub.style.display === "none";
          sub.style.display = open ? "" : "none";
          head.setAttribute("aria-expanded", String(open));
          card.classList.toggle("open", open);
        }
      }, [
        el("span", { class: "ref", text: sec.ref }),
        el("span", { class: "ttl", text: sec.title }),
        el("span", { class: "pc", text: st.done + "/" + st.total })
      ]);
      card.appendChild(head);
      card.appendChild(el("div", { class: "bar-track" }, [
        el("div", { class: "bar-fill", style: "width:" + st.pct + "%" })]));

      /* subsection bars, revealed on expand */
      var subs = (sec.children || []).map(function (ch) {
        return { ch: ch, st: sectionStats(sid, ch) };
      }).filter(function (x) { return x.st.total > 0; });
      subs.forEach(function (x) {
        sub.appendChild(el("div", { class: "bar-row" }, [
          el("span", {
            class: "nm", text: x.ch.ref + " " + x.ch.title, title: "Open in tree",
            onclick: function () {
              store.state.ui.openSections[sid][sec.ref] = true;
              renderTree(sid, null); store.save();
            }
          }),
          el("div", { class: "bar-track" }, [
            el("div", { class: "bar-fill", style: "width:" + x.st.pct + "%" })]),
          el("span", { class: "pc", text: x.st.done + "/" + x.st.total })
        ]));
      });
      if (!subs.length) sub.appendChild(el("div", { class: "bar-row", style: "color:var(--faint);font-size:12px", text: "No subsections — open the topic tree to study the leaves directly." }));
      card.appendChild(sub);
      secGrid.appendChild(card);
    });
    main.appendChild(secGrid);

    /* practice zone — labs now live here */
    var labs = PRACTICE[sid] || [];
    if (labs.length) {
      main.appendChild(el("h3", { class: "n-h", style: "margin-top:26px", text: "Practice zone" }));
      var pz = el("div", { class: "practice-row" });
      labs.forEach(function (t) {
        var acc = practiceAccess(t[3]);
        pz.appendChild(el("button", { class: "practice-card" + (acc.ok ? "" : " gated"), onclick: t[2] }, [
          el("b", { text: t[0] }),
          el("span", { text: t[1] }),
          acc.ok ? null : el("span", { class: "practice-lock",
            text: acc.why === "hp" ? "朽 suspended — low HP" : "錠 locked · ◈ " + acc.item.price })
        ]));
      });
      main.appendChild(pz);
    }

    /* resource link table (FR-2.8) */
    main.appendChild(el("h3", { class: "n-h", style: "margin-top:26px", text: "Resources & reference sheets" }));
    var resHolder = el("div", {});
    main.appendChild(resHolder);
    renderResources(resHolder, sid);
  };

  /* ---------- FR-2.8: per-subject resource links ---------- */
  function renderResources(holder, sid) {
    holder.innerHTML = "";
    var R = store.state.resources;
    var items = R.items.filter(function (r) { return r.subject === sid; });
    var wrap = el("div", { class: "res-table" });
    items.forEach(function (r) {
      wrap.appendChild(el("div", { class: "res-row" }, [
        el("a", { class: "res-name", href: r.url, target: "_blank", rel: "noopener", text: r.name, title: r.url }),
        r.ref ? el("button", { class: "res-ref", text: r.ref, title: "Open the topic", onclick: function () {
          KOS.show("ref", { subject: sid, ref: r.ref }); } }) : el("span", { class: "res-ref dim", text: "subject-wide" }),
        el("span", { class: "res-url", text: r.url }),
        el("button", { class: "mini-btn danger", text: "✕", "aria-label": "Delete resource", onclick: function () {
          if (!confirm("Remove “" + r.name + "” from the resource table?")) return;
          R.items.splice(R.items.indexOf(r), 1);
          store.save();
          renderResources(holder, sid);
        } })
      ]));
    });
    if (!items.length) wrap.appendChild(el("p", { class: "sub", style: "margin:4px 0 10px", text: "No resources saved for this subject yet — textbook PDFs, PMT pages, reference sheets, video playlists…" }));

    var name = el("input", { type: "text", class: "todo-in", placeholder: "Resource name" });
    var url = el("input", { type: "text", class: "todo-in", placeholder: "https://… or file path" });
    var refIn = el("input", { type: "text", class: "todo-in res-refin", placeholder: "topic ref (optional)" });
    wrap.appendChild(el("div", { class: "res-add" }, [
      name, url, refIn,
      el("button", { class: "btn", text: "+ Add", onclick: function () {
        if (!name.value.trim() || !url.value.trim()) { KOS.ui.toast("A name and a link are both needed.", true); return; }
        var ref = refIn.value.trim();
        if (ref && !BYREF[sid][ref]) { KOS.ui.toast("“" + ref + "” isn't a spec point in this subject — leave it blank for subject-wide.", true); return; }
        R.items.push({ id: R.nextId++, subject: sid, ref: ref || null,
          name: name.value.trim(), url: url.value.trim() });
        store.save();
        renderResources(holder, sid);
      } })
    ]));
    holder.appendChild(wrap);
  }

  KOS.views.ref = function (main, arg) {
    var sid = arg.subject, ref = arg.ref;
    var leaf = BYREF[sid][ref];
    if (!leaf) { KOS.show("subject", sid); return; }
    store.state.ui.lastRef[sid] = ref;
    store.save();
    renderTree(sid, ref);
    var d = KOS_DATA[sid];
    main.style.setProperty("--accent", COLORS[sid]);
    var content = KOS.content.get(sid, ref);

    main.appendChild(el("div", { class: "crumbs", html:
      "<b>" + esc(d.name) + "</b> · " + leaf.path.map(esc).join(" · ") }));

    main.appendChild(el("div", { class: "page-h" }, [
      el("div", { class: "seal", text: leaf.ref }),
      el("div", {}, [
        el("h1", { text: leaf.title }),
        el("span", { class: "pap", text: d.board + (leaf.section.paper ? " · " + paperLabel(sid, leaf.section.paper) : "") +
          (content ? " · deep revision content" : "") })
      ])
    ]));

    /* status + checklist */
    var p = store.getProgress(sid, ref);
    var ctl = el("div", { class: "ctl-row" });
    var sel = el("select", {
      class: "status-sel", "aria-label": "Topic status",
      onchange: function () {
        store.setStatus(sid, ref, sel.value);
        renderTree(sid, ref);
        KOS.refreshRailCounters();
      }
    }, STATUS.map(function (st) {
      return el("option", { value: st[0], text: STATUS_GLYPH[st[0]] + "  " + st[1] });
    }));
    sel.value = p.status;
    ctl.appendChild(sel);
    ctl.appendChild(el("div", { class: "ctl-sep" }));
    CHECKS.forEach(function (label, i) {
      var cb = el("input", { type: "checkbox", onchange: function () {
        store.setCheck(sid, ref, i, cb.checked);
        sel.value = store.getProgress(sid, ref).status;
        renderTree(sid, ref);
        KOS.refreshRailCounters();
      }});
      cb.checked = p.check[i];
      ctl.appendChild(el("label", { class: "chk" }, [cb, label]));
    });
    /* RAG confidence (FR-3.3) — manual picker + what the data says */
    ctl.appendChild(el("div", { class: "ctl-sep" }));
    ctl.appendChild(KOS.rag.picker(sid, ref));
    main.appendChild(ctl);

    /* ---------- study tabs ---------- */
    /* gens & sims: each is the content entry's own list merged with anything
       wired to this ref in the labs (KOS.worked.forRef / KOS.sims.forRef), so
       generators and sims reach topics the content files haven't enriched yet */
    var gens = content ? KOS.worked.byIds(content.gens) : [];
    (KOS.worked.forRef ? KOS.worked.forRef(sid, ref) : []).forEach(function (g) {
      if (!gens.some(function (x) { return x.id === g.id; })) gens.push(g);
    });
    var sims = (content ? (content.sims || []) : [])
      .map(function (id) { return KOS.sims.get(id); }).filter(Boolean);
    (KOS.sims.forRef ? KOS.sims.forRef(sid, ref) : []).forEach(function (sm) {
      if (!sims.some(function (x) { return x.id === sm.id; })) sims.push(sm);
    });
    /* flashcards: curriculum + user-created custom cards for this topic — the
       tab shows whenever either exists so custom cards are reachable, and on
       enriched topics regardless so new ones can be added (FR-1.1) */
    var deckSize = KOS.srs.cardsFor(sid, ref).length;
    var TABDEFS = [
      ["spec", "Specification", true],
      ["notes", "Notes", content && content.notes && content.notes.length],
      ["cards", "Flashcards", deckSize || !!content],
      ["quiz", "Quiz", content && content.quiz && content.quiz.length],
      ["exam", "Exam Qs", content && content.exam && content.exam.length],
      ["worked", "Worked", gens.length],
      ["sim", "Simulate", sims.length],
      ["files", "Files", true]
    ].filter(function (t) { return t[2]; });

    var tabBar = el("div", { class: "study-tabs", role: "tablist" });
    var panel = el("div", { class: "study-panel" });
    var curTab = (content && content.notes && content.notes.length) ? "notes" : "spec";

    TABDEFS.forEach(function (t) {
      var counter = "";
      if (t[0] === "cards" && deckSize) counter = " " + deckSize;
      if (t[0] === "quiz") counter = " " + content.quiz.length;
      if (t[0] === "exam") counter = " " + content.exam.length;
      tabBar.appendChild(el("button", {
        class: "study-tab" + (t[0] === curTab ? " active" : ""), role: "tab",
        "data-tab": t[0],
        onclick: function () {
          curTab = t[0];
          tabBar.querySelectorAll(".study-tab").forEach(function (b) {
            b.classList.toggle("active", b.dataset.tab === curTab); });
          openTab();
        }
      }, [t[1] + counter]));
    });
    main.appendChild(tabBar);
    main.appendChild(panel);

    var firstMount = true;
    function openTab() {
      /* callout slide-in only on the first render of this page,
         not on every tab switch */
      panel.classList.toggle("first-mount", firstMount);
      firstMount = false;
      panel.innerHTML = "";
      if (curTab === "spec") {
        var split = el("div", { class: "split" });
        split.appendChild(el("div", { class: "colcard" }, [
          el("div", { class: "ch", text: d.labelL }),
          el("div", { class: "cb speccontent", html: renderSpecContent(leaf.content) })
        ]));
        var right = el("div", {});
        if (leaf.info.length) {
          right.appendChild(el("div", { class: "colcard" }, [
            el("div", { class: "ch", text: d.labelR }),
            el("div", { class: "cb guide", html: renderSpecInfo(leaf.info) })
          ]));
        }
        split.appendChild(right);
        panel.appendChild(split);
        renderIntel(panel);
        panel.appendChild(el("div", { class: "colcard", style: "margin-top:18px" }, [
          el("div", { class: "ch", text: "Your notes on this spec point" }),
          el("div", { class: "cb" }, [(function () {
            var ta = el("textarea", { class: "note-area",
              placeholder: "Anything you want future-you to remember about " + leaf.ref + "…",
              oninput: debounce(function () { store.setNote(sid, ref, ta.value); }, 350) });
            ta.value = store.getProgress(sid, ref).note || "";
            return ta;
          })()])
        ]));
      }
      else if (curTab === "notes") {
        var pages = KOS.content.splitPages(content.notes);
        if (pages.length > 1) {
          /* paginated notes: a pill row of section pages + prev/next, so a long
             exhaustive topic reads as clean sections instead of one scroll */
          var pager = el("div", { class: "note-pager", role: "tablist" });
          var article = el("article", { class: "notes-article" });
          var foot = el("div", { class: "note-pager-foot" });
          var cur = 0;
          var showPage = function (i) {
            cur = Math.max(0, Math.min(pages.length - 1, i));
            pager.querySelectorAll(".note-page-tab").forEach(function (b, j) {
              b.classList.toggle("active", j === cur); });
            article.innerHTML = KOS.content.renderBlocks(pages[cur].blocks);
            KOS.content.typeset(article);
            if (article.scrollIntoView) article.scrollIntoView({ block: "nearest" });
            foot.innerHTML = "";
            if (cur > 0) foot.appendChild(el("button", { class: "btn", text: "‹ " + pages[cur - 1].title,
              onclick: function () { showPage(cur - 1); } }));
            foot.appendChild(el("span", { class: "note-pager-count", text: (cur + 1) + " / " + pages.length }));
            if (cur < pages.length - 1) foot.appendChild(el("button", { class: "btn", text: pages[cur + 1].title + " ›",
              onclick: function () { showPage(cur + 1); } }));
          };
          pages.forEach(function (pg, i) {
            pager.appendChild(el("button", { class: "note-page-tab", role: "tab", "data-i": i,
              onclick: function () { showPage(i); } }, [(i + 1) + ". " + pg.title]));
          });
          panel.appendChild(pager);
          panel.appendChild(article);
          panel.appendChild(foot);
          showPage(0);
        } else {
          var n = el("article", { class: "notes-article", html: KOS.content.renderBlocks(content.notes) });
          panel.appendChild(n);
          KOS.content.typeset(n);
        }
      }
      else if (curTab === "cards") {
        var fcHolder = el("div", { class: "fc-wrap" });
        panel.appendChild(fcHolder);
        KOS.flashcards.mount(fcHolder, sid, ref);
      }
      else if (curTab === "quiz") {
        var qHolder = el("div", {});
        panel.appendChild(qHolder);
        KOS.quiz.mountMCQ(qHolder, sid, ref, content.quiz);
      }
      else if (curTab === "exam") {
        var eHolder = el("div", {});
        panel.appendChild(eHolder);
        KOS.quiz.mountExam(eHolder, sid, ref, content.exam);
      }
      else if (curTab === "worked") {
        gens.forEach(function (g, i) {
          var card = el("div", { class: "lab-panel", style: i ? "margin-top:16px" : "" });
          card.appendChild(el("h3", { class: "n-h", style: "margin-top:0", text: g.title }));
          panel.appendChild(card);
          KOS.worked.mount(card, g);
        });
      }
      else if (curTab === "files") {
        KOS.attach.mountTab(panel, sid, ref);
      }
      else if (curTab === "sim") {
        sims.forEach(function (sm, i) {
          /* the enrichment layer gates here; core tabs above never do */
          var acc = KOS.governor.simAccess(sm.id);
          if (!acc.ok) {
            var lockCard = el("div", { class: "lab-panel", style: i ? "margin-top:16px" : "" });
            KOS.governor.lockPanel(lockCard, acc);
            panel.appendChild(lockCard);
            return;
          }
          if (sm.mount) {
            var card = el("div", { class: "lab-panel", style: i ? "margin-top:16px" : "" });
            card.appendChild(el("h3", { class: "n-h", style: "margin-top:0", text: sm.title }));
            card.appendChild(el("p", { class: "sub", text: sm.desc }));
            panel.appendChild(card);
            sm.mount(card);
          } else {
            panel.appendChild(el("button", { class: "sim-launch", onclick: function () { KOS.sims.open(sm.id); } }, [
              el("b", { text: sm.title + " →" }),
              el("span", { text: sm.desc })
            ]));
          }
        });
      }
    }

    function renderIntel(into) {
      var intel = KOS_DATA.intel[sid + ":" + ref];
      if (!intel) return;
      var iw = el("div", { class: "intel" });
      if (intel.defs && intel.defs.length) {
        var dl = el("dl", { style: "margin:0" });
        intel.defs.forEach(function (kv) {
          dl.appendChild(el("dt", { text: kv[0] }));
          dl.appendChild(el("dd", { text: kv[1] }));
        });
        iw.appendChild(el("div", { class: "intel-card intel-defs" }, [
          el("div", { class: "ih", text: "Definition box — wording the board rewards" }),
          el("div", { class: "ib" }, [dl])
        ]));
      }
      if (intel.tips && intel.tips.length) {
        iw.appendChild(el("div", { class: "intel-card intel-tips" }, [
          el("div", { class: "ih", text: "Chief examiner intel — how marks are won" }),
          el("div", { class: "ib" }, [el("ul", {}, intel.tips.map(function (t) {
            return el("li", { text: t }); }))])
        ]));
      }
      if (intel.pitfalls && intel.pitfalls.length) {
        iw.appendChild(el("div", { class: "intel-card intel-pit" }, [
          el("div", { class: "ih", text: "Pitfalls — where marks routinely die" }),
          el("div", { class: "ib" }, [el("ul", {}, intel.pitfalls.map(function (t) {
            return el("li", { text: t }); }))])
        ]));
      }
      into.appendChild(iw);
    }

    openTab();

    /* prev / next */
    var prev = LEAVES[sid][leaf.idx - 1], next = LEAVES[sid][leaf.idx + 1];
    var nav = el("div", { class: "pn-row" }, [
      prev ? navBtn(prev, "← Previous") : el("span"),
      next ? navBtn(next, "Next →") : el("span")
    ]);
    function navBtn(target, label) {
      var tp = store.peekProgress(sid, target.ref);
      var tStatus = (tp && tp.status) || "none";
      return el("button", {
        class: "pn", onclick: function () { KOS.show("ref", { subject: sid, ref: target.ref }); }
      }, [
        el("span", { class: "d", text: label }),
        el("span", { class: "st st-" + tStatus, text: STATUS_GLYPH[tStatus] + " ",
          "aria-label": tStatus }),
        target.ref + " " + target.title
      ]);
    }
    main.appendChild(nav);
  };

  function paperLabel(sid, p) {
    if (sid === "compsci") return "Paper " + p;
    if (sid === "it") return p === "Exam" ? "Examined unit" : "NEA unit";
    return p;
  }

  /* ---------- backup view ---------- */
  KOS.views.data = function (main) {
    hideTree();
    main.appendChild(el("div", { class: "lab-h" }, [
      el("h1", { text: "Backup & Restore" }),
      el("p", { class: "sub", text: "Full export covers everything: study progress, governor state, the entire media vault (anime/books/VN/games, including routes, quotes, and physical volumes), and document attachments. A vault with many large attachments may produce a large file — that is expected. Import is a complete restore, not a merge." }),
      el("p", { class: "sub", text: "AniList and VNDB tokens are intentionally excluded from backups — a backup file may be stored or shared in less-secure places than your browser profile. After restoring, reconnect both services from Sync & Import the same way you did originally." })
    ]));
    var row = el("div", { class: "lab-controls", style: "margin-top:18px" });

    var exportBtn = el("button", { class: "btn primary", text: "Export full backup (.json)",
      onclick: function () {
        exportBtn.disabled = true;
        exportBtn.textContent = "Exporting…";
        store.exportFull(function (err) {
          exportBtn.disabled = false;
          exportBtn.textContent = "Export full backup (.json)";
          if (err) KOS.ui.toast("Export error: " + err.message, true);
        });
      }});
    row.appendChild(exportBtn);

    var file = el("input", { type: "file", accept: ".json,application/json", style: "display:none",
      onchange: function () {
        if (!file.files[0]) return;
        importBtn.disabled = true;
        importBtn.textContent = "Restoring…";
        store.importFull(file.files[0], function (err, report) {
          importBtn.disabled = false;
          importBtn.textContent = "Import backup…";
          file.value = "";
          if (err) { KOS.ui.toast("Import failed: " + err.message, true); return; }
          var msg = "Restored: " + report.restoredSections.join(", ") + ".";
          if (report.missingSections.length) {
            msg += " Note: " + report.missingSections.join("; ") + ".";
          }
          KOS.ui.toast(msg);
          KOS.refreshRailCounters();
          KOS.show("home");
        });
      }});
    row.appendChild(file);
    var importBtn = el("button", { class: "btn gold", text: "Import backup…",
      onclick: function () { file.click(); } });
    row.appendChild(importBtn);

    row.appendChild(el("button", { class: "btn jade", text: "Export revision summary (print / PDF)",
      onclick: exportSummary }));
    row.appendChild(el("button", { class: "btn danger", text: "Reset everything",
      onclick: function () {
        if (confirm("Wipe all progress, notes and sandbox work? Export first if unsure.")) {
          store.reset(); KOS.refreshRailCounters(); KOS.ui.toast("Fresh start."); KOS.show("home");
        }
      }}));
    main.appendChild(row);

    var s = store.state;
    var n = Object.keys(s.progress).length;
    main.appendChild(el("p", { style: "color:var(--mute);font-size:13px;margin-top:14px",
      text: n + " spec points carry saved progress. State object created " + new Date(s.created).toLocaleDateString("en-GB") + "." }));
  };

  /* ---------- printable revision summary ---------- */
  var STATUS_WORD = { none: "Not started", started: "Started", paused: "Paused", done: "Completed" };
  function exportSummary() {
    var h = "<!DOCTYPE html><html lang='en-GB'><head><meta charset='utf-8'>" +
      "<title>Kurenai OS — revision summary</title><style>" +
      "body{font:13px/1.5 Georgia,serif;color:#111;margin:32px;max-width:880px}" +
      "h1{font-size:22px;border-bottom:3px solid #b3243a;padding-bottom:6px}" +
      "h2{font-size:17px;margin:28px 0 4px;color:#b3243a}" +
      "h3{font-size:13px;margin:16px 0 4px;text-transform:uppercase;letter-spacing:.08em}" +
      "table{width:100%;border-collapse:collapse;margin:4px 0 12px}" +
      "th,td{border:1px solid #bbb;padding:4px 8px;text-align:left;vertical-align:top;font-size:12px}" +
      "th{background:#f2f2f2;font-size:10.5px;text-transform:uppercase;letter-spacing:.06em}" +
      ".ref{font-family:monospace;white-space:nowrap}" +
      ".s-done{color:#0a7a52;font-weight:700}.s-started{color:#9a6d00}.s-paused{color:#7a3fa0}.s-none{color:#888}" +
      ".note{font-style:italic;color:#444}" +
      "@media print{h2{page-break-after:avoid}table{page-break-inside:auto}tr{page-break-inside:avoid}}" +
      "</style></head><body><h1>紅 Kurenai OS — revision summary · " +
      new Date().toLocaleDateString("en-GB") + "</h1>" +
      "<p>Status of every spec point, with your personal notes. Print with Ctrl/Cmd-P.</p>";
    SUBJECTS.forEach(function (sid) {
      var d = KOS_DATA[sid], s = subjectStats(sid);
      h += "<h2>" + esc(d.name) + " — " + esc(d.board) + " (" + s.done + "/" + s.total + " completed)</h2>";
      d.sections.forEach(function (sec) {
        var st = sectionStats(sid, sec);
        if (!st.total) return;
        h += "<h3>" + esc(sec.ref + " " + sec.title) + " — " + st.done + "/" + st.total + "</h3>" +
          "<table><tr><th>Ref</th><th>Topic</th><th>Status</th><th>Your notes</th></tr>";
        (function walk(n) {
          if (n.content && n.content.length) {
            var p = store.peekProgress(sid, n.ref);
            var status = (p && p.status) || "none";
            h += "<tr><td class='ref'>" + esc(n.ref) + "</td><td>" + esc(n.title) +
              "</td><td class='s-" + status + "'>" + STATUS_WORD[status] + "</td><td class='note'>" +
              esc((p && p.note) || "") + "</td></tr>";
          }
          (n.children || []).forEach(walk);
        })(sec);
        h += "</table>";
      });
    });
    h += "</body></html>";
    var w = window.open("", "_blank");
    if (!w) { KOS.ui.toast("Pop-up blocked — allow pop-ups for this page to export.", true); return; }
    w.document.write(h);
    w.document.close();
  }

  /* ---------- search ---------- */
  var input = document.getElementById("search");
  var resultsEl = document.getElementById("search-results");
  var selIdx = -1;
  var matches = [];

  function runSearch(q) {
    q = q.trim().toLowerCase();
    resultsEl.innerHTML = "";
    selIdx = -1;
    if (q.length < 2) { resultsEl.classList.remove("open"); return; }
    var terms = q.split(/\s+/);
    var specHits = [], fcHits = [];
    SEARCH_INDEX.forEach(function (it) {
      it.fcHit = false;
      if (terms.every(function (t) { return it.text.indexOf(t) !== -1; })) {
        specHits.push(it);
      } else if (it.fctext && terms.every(function (t) {
        return (it.text + " " + it.fctext).indexOf(t) !== -1; })) {
        it.fcHit = true;
        fcHits.push(it);
      }
    });
    /* spec-wording matches outrank flashcard-only matches */
    matches = specHits.concat(fcHits).slice(0, 30);
    if (!matches.length) {
      resultsEl.appendChild(el("div", { class: "sr-empty",
        text: "No spec point matches \u201C" + q + "\u201D across the three subjects." }));
      resultsEl.classList.add("open");
      return;
    }
    matches.forEach(function (m, i) {
      var leaf = BYREF[m.subject][m.ref];
      var joined = m.fcHit ? m.fctext : leaf.content.join(" ");
      var pos = joined.toLowerCase().indexOf(terms[0]);
      var snip = pos >= 0
        ? "…" + joined.slice(Math.max(0, pos - 30), pos + 90) + "…"
        : leaf.content[0];
      resultsEl.appendChild(el("div", {
        class: "sr-item", role: "option", "data-i": i,
        onclick: function () { go(i); }
      }, [
        el("span", { class: "sr-ref", style: "color:" + HEX[m.subject], text: m.ref }),
        el("span", { text: m.title }),
        m.fcHit ? el("span", { class: "sr-fc", text: "Flashcard match" }) : null,
        el("span", { class: "sr-sub", text: KOS_DATA[m.subject].name }),
        el("span", { class: "sr-snip", text: snip })
      ]));
    });
    resultsEl.classList.add("open");
  }

  function go(i) {
    var m = matches[i];
    if (!m) return;
    resultsEl.classList.remove("open");
    input.value = "";
    KOS.show("ref", { subject: m.subject, ref: m.ref });
  }

  function moveSel(delta) {
    var items = resultsEl.querySelectorAll(".sr-item");
    if (!items.length) return;
    selIdx = (selIdx + delta + items.length) % items.length;
    items.forEach(function (it, i) { it.classList.toggle("sel", i === selIdx); });
    if (items[selIdx].scrollIntoView) items[selIdx].scrollIntoView({ block: "nearest" });
  }

  input.addEventListener("input", function () { runSearch(input.value); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); moveSel(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveSel(-1); }
    else if (e.key === "Enter" && selIdx >= 0) { e.preventDefault(); go(selIdx); }
    else if (e.key === "Escape") { resultsEl.classList.remove("open"); input.blur(); }
  });
  document.addEventListener("click", function (e) {
    if (!document.getElementById("searchbox").contains(e.target)) {
      resultsEl.classList.remove("open");
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "/" && document.activeElement !== input &&
        !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) {
      e.preventDefault();
      input.focus();
    }
  });

  /* ---------- shared helpers (canonical copies live in core/ui.js) ---------- */
  var esc = KOS.ui.esc;

  /* Turn extracted spec lines into paragraphs + bullet lists. */
  function listify(lines) {
    var html = "", inUl = false;
    lines.forEach(function (raw) {
      var line = esc(raw);
      var isBullet = /^(•|◦|▪|□|o\s|‣|-\s)/.test(raw);
      if (isBullet) {
        if (!inUl) { html += "<ul>"; inUl = true; }
        html += "<li>" + line.replace(/^(•|◦|▪|□|o|-)\s*/, "") + "</li>";
      } else {
        if (inUl) { html += "</ul>"; inUl = false; }
        html += "<p>" + line + "</p>";
      }
    });
    if (inUl) html += "</ul>";
    return html;
  }

  /* ---- specification cleanup ----
     The generated spec data is clean for CS/Maths but PDF-parsing left the IT
     unit littered with stray checkbox glyphs (□, lone "o"), empty lines, bled
     "… To" / "Does" fragments and a single run-on `info` string. These display
     helpers tidy it at render time — generated data is never hand-edited. */
  function cleanGlyphs(raw) {
    return String(raw)
      .replace(/□/g, " ")
      .replace(/\s+/g, " ")
      .replace(/^[•◦▪‣]\s*/, "")     // leading bullet glyph
      .replace(/^o\s+/, "")          // leading sub-sub marker
      .replace(/^-\s+/, "")
      .replace(/\s+o\s*$/, "")        // trailing checkbox "o"
      .replace(/\bDoes\b/g, " ")      // 'Does not include' fragment noise
      .replace(/\s+/g, " ")
      .trim();
  }
  /* classify a spec line by its leading glyph: □ main, • sub, "o " sub-sub */
  function specLine(raw) {
    var kind = /^\s*□/.test(raw) ? "box" : /^\s*o\s/.test(raw) ? "sub2"
             : /^\s*[•◦▪‣]/.test(raw) ? "bullet" : "none";
    return { kind: kind, text: cleanGlyphs(raw) };
  }
  function renderSpecContent(lines) {
    var items = (lines || []).map(specLine).filter(function (x) { return x.text && x.text !== "To"; });
    var out = "", buf = [];
    function flush() { if (buf.length) { out += "<ul>" + buf.join("") + "</ul>"; buf = []; } }
    items.forEach(function (it, idx) {
      var s = it.text;
      if (/\bTo$/.test(s)) {                                 // garbled "X To" fragment → header
        flush(); out += '<p class="spec-h">' + esc(s.replace(/\s*To$/, "")) + "</p>"; return;
      }
      if (it.kind === "box") {                               // a □ heading if a sub-item follows
        var nx = items[idx + 1];
        if (nx && (nx.kind === "bullet" || nx.kind === "sub2")) { flush(); out += '<p class="spec-h">' + esc(s) + "</p>"; return; }
        buf.push("<li>" + esc(s) + "</li>"); return;
      }
      if (it.kind === "bullet") { buf.push("<li>" + esc(s) + "</li>"); return; }
      if (it.kind === "sub2") { buf.push('<li class="spec-sub">' + esc(s) + "</li>"); return; }
      if (/\so\s/.test(s)) {                                 // garbled "A o B" merge → split
        s.split(/\s+o\s+/).forEach(function (p) { p = p.trim(); if (p) buf.push("<li>" + esc(p) + "</li>"); }); return;
      }
      var nx2 = items[idx + 1];                              // ":"-lead-in introducing a list → highlighted
      if (/:\s*$/.test(s) && nx2 && (nx2.kind === "bullet" || nx2.kind === "sub2")) {   // header (parity w/ IT spec tabs)
        flush(); out += '<p class="spec-h">' + esc(s.replace(/:\s*$/, "")) + "</p>"; return;
      }
      flush(); out += "<p>" + esc(s) + "</p>";               // plain intro line (CS/Maths)
    });
    flush();
    return out || listify(lines);
  }
  function splitPoints(seg) {
    /* break a run-on of spec points before strong sentence starters */
    return seg.replace(/\s+(The|When|Know|Understand|How|Use|Be|Students|Why|Link)\b/g, "@@SP@@$1")
      .split("@@SP@@").map(function (p) { return p.trim(); }).filter(Boolean);
  }
  function renderSpecInfo(lines) {
    lines = lines || [];
    if (lines.length === 1) {                               // single run-on string (garbled IT fallback)
      var text = cleanGlyphs(lines[0]);
      if (!text) return "";
      var re = /(not include:|include:)/gi, m, markers = [];
      while ((m = re.exec(text)) !== null) {
        markers.push({ idx: m.index, len: m[0].length, label: /not/i.test(m[0]) ? "Not included" : "To include" });
      }
      function ul(seg) { return "<ul>" + splitPoints(seg).map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>"; }
      if (!markers.length) { var pts = splitPoints(text); return pts.length > 1 ? ul(text) : "<p>" + esc(text) + "</p>"; }
      var html = "";
      for (var i = 0; i < markers.length; i++) {
        var seg = text.slice(markers[i].idx + markers[i].len, i + 1 < markers.length ? markers[i + 1].idx : text.length).trim();
        if (seg) html += '<p class="spec-h">' + markers[i].label + "</p>" + ul(seg);
      }
      return html || "<p>" + esc(text) + "</p>";
    }
    /* multi-line array: clean override (IT F201) or already-clean CS/Maths */
    var out = "", buf = [];
    function flush() { if (buf.length) { out += "<ul>" + buf.join("") + "</ul>"; buf = []; } }
    lines.forEach(function (raw) {
      var t = String(raw).trim();
      if (/^to include:?$/i.test(t)) { flush(); out += '<p class="spec-h">To include</p>'; return; }
      if (/^does not include:?$/i.test(t)) { flush(); out += '<p class="spec-h">Not included</p>'; return; }
      var it = specLine(raw);
      if (!it.text) return;
      if (it.kind === "none") { flush(); out += "<p>" + esc(it.text) + "</p>"; }
      else buf.push((it.kind === "sub2" ? '<li class="spec-sub">' : "<li>") + esc(it.text) + "</li>");
    });
    flush();
    return out;
  }

  var debounce = KOS.ui.debounce;

  KOS.hub = { LEAVES: LEAVES, BYREF: BYREF, COLORS: COLORS, HEX: HEX, esc: esc };
})();
