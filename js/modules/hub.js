/* Kurenai OS — modules/hub.js
   The Revision Hub: subject dashboards, the spec spine tree, the
   split-screen reference view, progress tracking and global search. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  var SUBJECTS = ["compsci", "maths", "it"];
  var COLORS = { compsci: "var(--c-compsci)", maths: "var(--c-maths)", it: "var(--c-it)" };
  var HEX = { compsci: "#3D8E76", maths: "#4C6DB3", it: "#8A63A8" };
  var STATUS = [
    ["none", "Not started"], ["started", "Started"],
    ["paused", "Paused"], ["done", "Completed"]
  ];
  var STATUS_GLYPH = { none: "○", started: "◐", paused: "◔", done: "●" };
  var CHECKS = ["Covered in class", "Studied it", "Done exam questions", "Fully understood"];

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
    var s = { none: 0, started: 0, paused: 0, done: 0, total: LEAVES[sid].length, checkSum: 0 };
    LEAVES[sid].forEach(function (l) {
      var p = store.peekProgress(sid, l.ref);
      s[(p && p.status) || "none"]++;
      s.checkSum += leafPercent(sid, l.ref);
    });
    s.pct = pctOf(s.done, s.total);        // topics marked completed — "secure"
    s.touched = s.total - s.none;          // topics carrying any status at all
    s.mastery = s.total ? Math.round(s.checkSum / s.total) : 0;   // the four checks, averaged
    return s;
  }

  /* ---------- one derivation per statistic ----------
     The subject analytics grid, the Topic Status component, the study tab
     counts and the study inspector all read the functions below. Two
     surfaces that claim to show the same number cannot drift, because the
     number is only computed in one place.

     Formatting is standardised here too, and nowhere else: a percentage is
     always a whole number followed by "%", a part-of-whole is always
     "A / B", a bar always carries the SAME quantity as the value printed
     beside it, and a metric with nothing behind it yet renders an em dash
     plus one sentence saying why. */
  function pctOf(a, b) { return b ? Math.round(100 * a / b) : 0; }
  function pctText(n) { return Math.round(n) + "%"; }
  function ratioText(a, b) { return a + " / " + b; }
  /* the one performance ramp — the section ledger already colours its bars
     with these three class names, so every new bar reuses them rather than
     inventing a second set of thresholds */
  function tone(pct) { return pct < 20 ? "low" : pct <= 70 ? "mid" : "high"; }

  /* every flashcard in a subject, counted exactly the way the inspector
     counts one topic's cards — so "cards due" here and the inspector's
     review queue can never disagree */
  function subjectCardStats(sid) {
    var today = KOS.srs.todayISO();
    var out = { total: 0, reviewed: 0, due: 0 };
    LEAVES[sid].forEach(function (l) {
      KOS.srs.cardsFor(sid, l.ref).forEach(function (c) {
        out.total++;
        var m = KOS.srs.peek(c.key);
        if (!m || !m.due) return;
        out.reviewed++;
        if (m.due <= today) out.due++;
      });
    });
    return out;
  }
  /* the subject's quiz record. `best` is the best score ever recorded, which
     is what the inspector has always shown; the subject page used to read
     `lastPct` under a "Best quiz" label, so the two surfaces disagreed. */
  function subjectQuizStats(sid) {
    var q = (store.state.study || {}).quiz || {};
    var out = { best: null, attempts: 0, topics: 0 };
    Object.keys(q).forEach(function (k) {
      if (k.indexOf(sid + ":") !== 0) return;
      out.topics++;
      out.attempts += q[k].attempts || 0;
      if (q[k].best != null) out.best = Math.max(out.best == null ? 0 : out.best, q[k].best);
    });
    return out;
  }
  function subjectExamCount(sid) {
    return KOS.sessions.all().filter(function (e) {
      return e.type === "exam" && e.subject === sid;
    }).length;
  }

  /* the topic-level read. KOS.views.ref hands the SAME object to the tab bar
     and to the inspector, which is what keeps a tab count and the inspector
     line beneath it honest about each other. */
  function topicStats(sid, ref) {
    var key = sid + ":" + ref;
    var study = store.state.study || {};
    var fc = (study.fc || {})[key] || { seen: 0, right: 0, wrong: 0 };
    var cards = KOS.srs.cardsFor(sid, ref);
    var today = KOS.srs.todayISO();
    var p = store.peekProgress(sid, ref);
    var t = {
      cards: cards.length, reviewed: 0, due: 0, next: null, lapses: 0,
      seen: fc.seen, accuracy: null, quiz: (study.quiz || {})[key] || null,
      mastery: leafPercent(sid, ref),
      checks: p ? p.check.filter(Boolean).length : 0,
      completed: !!(p && p.status === "done")
    };
    /* A topic marked Completed is 100% by definition (leafPercent), which can
       outrun its checklist. Rather than fake the boxes — the assistant's undo
       path restores status and checks separately, so writing one from the
       other would lose data — the readout says WHY it reads 100. */
    t.checkText = t.completed && t.checks < CHECKS.length
      ? "marked completed" : ratioText(t.checks, CHECKS.length) + " checks";
    cards.forEach(function (c) {
      var m = KOS.srs.peek(c.key);
      if (!m || !m.due) return;
      t.reviewed++;
      t.lapses += m.lapses || 0;
      if (m.due <= today) t.due++;
      else if (!t.next || m.due < t.next) t.next = m.due;
    });
    if (fc.right + fc.wrong) t.accuracy = pctOf(fc.right, fc.right + fc.wrong);
    var sess = KOS.sessions.all().filter(function (e) { return e.subject === sid && e.ref === ref; });
    t.sessions = sess.length;
    t.minutes = Math.round(sess.reduce(function (a, e) { return a + (e.dur || 0); }, 0) / 60);
    t.examLogged = sess.filter(function (e) { return e.type === "exam"; }).length;
    return t;
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
  function applyTreeCollapsed() {
    /* Build 4b: with no saved preference, phones start with the tree
       CLOSED (it's a drawer over the content there); desktop keeps its
       open-by-default spine. An explicit choice wins on both. */
    var pref = store.state.ui.treeClosed;
    var closed = pref === true ||
      (pref == null && typeof window.matchMedia === "function" && window.matchMedia("(max-width: 700px)").matches);
    document.getElementById("cols").classList.toggle("tree-closed", closed);
  }
  function renderTree(sid, activeRef) {
    var tree = document.getElementById("tree");
    tree.classList.remove("hidden");
    document.getElementById("cols").classList.remove("no-tree");
    applyTreeCollapsed();
    tree.innerHTML = "";
    var data = KOS_DATA[sid];
    var st = subjectStats(sid);
    tree.style.setProperty("--accent", COLORS[sid]);

    /* the slim reopen rail, shown only when the tree is collapsed */
    tree.appendChild(el("button", { class: "tree-reopen", title: "Show the spec spine",
      onclick: function () { store.state.ui.treeClosed = false; store.save(); applyTreeCollapsed(); } }, [
      el("span", { class: "tr-arr", "aria-hidden": "true", text: "›" }),
      el("span", { class: "tr-lbl", text: "Spec spine" })
    ]));

    /* the header: subject, board, a live completion bar, and the collapse control */
    tree.appendChild(el("div", { class: "tree-subject-h" }, [
      el("div", { class: "tsh-txt" }, [
        el("span", { class: "t", text: data.name, style: "color:" + COLORS[sid] }),
        el("span", { class: "b", text: data.board + " · " + st.done + "/" + st.total + " secure" }),
        el("div", { class: "tree-progress", "aria-label": st.pct + "% complete" }, [
          el("i", { style: "width:" + st.pct + "%" })
        ])
      ]),
      el("button", { class: "tree-collapse", title: "Collapse the spec spine", "aria-label": "Collapse",
        onclick: function () { store.state.ui.treeClosed = true; store.save(); applyTreeCollapsed(); } }, ["‹"])
    ]));
    var open = store.state.ui.openSections[sid] = store.state.ui.openSections[sid] || {};

    data.sections.forEach(function (sec) {
      var secEl = el("div", { class: "sec" + (open[sec.ref] ? " open" : "") });
      var sst = sectionStats(sid, sec);
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
        el("span", { class: "sec-title", text: sec.title }),
        sst.total ? el("span", { class: "pc", text: sst.done + "/" + sst.total }) : null,
        el("span", { class: "arr", text: "▸" })
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

  /* rank ladder shared by the home profile band and the Governor's Seat */
  var RANKS = [[1, "Novice"], [3, "Apprentice"], [5, "Scholar"], [8, "Adept"],
               [12, "Sage"], [16, "Archivist"], [20, "Grandmaster"]];
  function rankName(level) {
    var r = RANKS[0][1];
    RANKS.forEach(function (x) { if (level >= x[0]) r = x[1]; });
    return r;
  }
  KOS.rankName = rankName;

  function greeting() {
    var h = new Date().getHours();
    return h < 5 ? "Working late." : h < 12 ? "Good morning." : h < 18 ? "Good afternoon." : "Good evening.";
  }
  function todayLine() {
    return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
  }

  KOS.views.home = function (main) {
    hideTree();
    var totals = { done: 0, total: 0 };
    SUBJECTS.forEach(function (sid) {
      var st = subjectStats(sid);
      totals.done += st.done; totals.total += st.total;
    });
    var pct = totals.total ? Math.round(100 * totals.done / totals.total) : 0;
    var stks = KOS.sessions.streaks();
    var dueN = KOS.srs.dueCount();
    var g = store.state.governor;
    var li = KOS.governor.levelInfo(g.xp);
    var hpInfo = KOS.governor.hpStateInfo();

    /* header — the day, not the brand (the topbar already carries the mark) */
    var fxActive = KOS.focus && KOS.focus.state() !== "idle";
    main.appendChild(el("div", { class: "home-hero" }, [
      el("div", {}, [
        el("span", { class: "hh-kicker", text: todayLine() }),
        el("h1", { text: greeting() })
      ]),
      el("button", { class: "btn primary hh-focus" + (fxActive ? " live" : ""), onclick: function () { KOS.show("focus"); } },
        [fxActive ? "◉ Return to the session" : "◉ Begin a focus session"])
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

    /* ---- the profile band: who you are today ---- */
    var banner = KOS.governor.bannerCss ? KOS.governor.bannerCss() : null;
    var band = el("section", { class: "home-id" + (banner ? " has-banner" : ""), "aria-label": "Profile" });
    if (banner) KOS.governor.applyBanner(band);
    var week = [];
    var activeDates = {};
    KOS.sessions.all().forEach(function (s) { if (s.type !== "media") activeDates[s.date] = true; });
    for (var i = 6; i >= 0; i--) {
      var d0 = new Date(Date.now() - i * 864e5);
      var iso = d0.getFullYear() + "-" + ("0" + (d0.getMonth() + 1)).slice(-2) + "-" + ("0" + d0.getDate()).slice(-2);
      week.push({ on: !!activeDates[iso], today: i === 0 });
    }
    /* the ONE identity record — the Governor's Seat and the topbar popover
       render from this same call, so the three surfaces can never drift */
    var prof = KOS.governor.profile();
    band.appendChild(el("div", { class: "hi-main" }, [
      KOS.governor.avatarNode(72),
      el("div", { class: "hi-txt" }, [
        el("span", { class: "rank", text: prof.rank }),
        el("h2", { text: "Level " + prof.level }),
        el("div", { class: "hi-state" }, [
          el("b", { text: hpInfo.label }),
          " · ◈ " + g.gold + " gold"
        ]),
        prof.status ? el("button", { class: "hi-status", title: "Edit your status and about",
          onclick: function () { KOS.governor.editProfileText(function (err, r) { if (!(r && r.cancelled)) KOS.show("home"); }); } }, [
          el("span", { class: "hi-status-dot", "aria-hidden": "true" }),
          el("span", { text: prof.status })
        ]) : null,
        el("div", { class: "lvl-row" }, [
          el("div", { class: "hud-bar hud-xp big lvl-bar" }, [
            el("span", { style: "width:" + Math.round(100 * li.into / li.need) + "%" })]),
          el("span", { class: "to-next", text: (li.need - li.into) + " XP to Lv " + (li.level + 1) })
        ]),
        el("div", { class: "hi-week" }, [
          el("span", { class: "week-dots" }, week.map(function (w) {
            return el("i", { class: (w.on ? "on" : "") + (w.today && !w.on ? " today" : "") });
          })),
          el("span", { class: "streak-chip" + (stks.all ? " lit" : ""), title: "Days in a row with a real study session" }, [
            el("span", { class: "fl", text: "炎" }),
            el("span", { text: stks.all + "-day study" })
          ]),
          el("span", { class: "streak-chip med-rest" + (stks.rest ? " lit" : ""), title: "Days in a row with a Collection log — rest, kept separately" }, [
            el("span", { class: "fl", text: "休" }),
            el("span", { text: (stks.rest || 0) + "-day rest" })
          ])
        ])
      ].filter(Boolean))
    ]));
    var ringWrap = el("div", { class: "home-ring" });
    var ringCv = el("canvas", { "aria-label": "Overall completion" });
    ringWrap.appendChild(ringCv);
    function bandStat(v, k, onclick) {
      return el("div", { class: "hstat" + (onclick ? " click" : "") , onclick: onclick || null }, [
        el("div", { class: "v", text: String(v) }),
        el("div", { class: "k", text: k })
      ]);
    }
    band.appendChild(el("div", { class: "hi-stats" }, [
      ringWrap,
      bandStat(totals.done + " / " + totals.total, "Spec points"),
      bandStat(masteredCount(), "Mastered"),
      bandStat(dueN, dueN === 1 ? "Card due" : "Cards due", function () { KOS.show("due"); })
    ]));
    main.appendChild(band);

    /* ---- today's path + the horizon ---- */
    var todayRow = el("div", { class: "home-today" });
    var pathCard = el("section", { class: "path-card" });
    pathCard.appendChild(KOS.todo.panel());
    todayRow.appendChild(pathCard);
    var side = el("div", { class: "home-side" });
    side.appendChild(KOS.calendar.countdownWidget(null));
    /* Build 6.4 — urgent assignments, DERIVED from the one record. The card
       is absent entirely when nothing is due, so Home stays quiet. */
    if (KOS.assignmentsUrgentCard) {
      var asgCard = KOS.assignmentsUrgentCard();
      if (asgCard) side.appendChild(asgCard);
    }
    todayRow.appendChild(side);
    main.appendChild(todayRow);

    /* ---- the desks: three subjects + the collection ---- */
    var cards = el("div", { class: "home-cards" });
    SUBJECTS.forEach(function (sid) {
      var d = KOS_DATA[sid], st = subjectStats(sid);
      var cov = KOS.content.coverage(sid, LEAVES[sid]);
      var last = store.state.ui.lastRef[sid];
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
        el("div", { class: "m", text: st.done + "/" + st.total + " completed · " + cov + " deep-content topics" +
          (stks[sid] ? " · 炎 " + stks[sid] + "-day streak" : "") })
      ]);
      card.appendChild(el("div", {
        class: "subj-track", "aria-label": st.pct + "% complete",
        title: st.done + "/" + st.total + " spec points completed"
      }, [el("span", { class: "subj-fill", style: "width:" + st.pct + "%" })]));
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
    /* the collection desk */
    cards.appendChild(el("div", { class: "subj-card med-home-card", style: "--accent:var(--accent)",
      role: "button", tabindex: "0",
      onclick: function () { KOS.show("matrix"); },
      onkeydown: function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); KOS.show("matrix"); } }
    }, [
      el("div", { class: "subj-card-top" }, [
        el("div", {}, [
          el("h3", {}, [el("span", { class: "kanji-inline", text: "蒐" }), " Collection"]),
          el("span", { class: "b", text: "The other half of the ledger" })
        ])
      ]),
      el("div", { class: "m", text: "Anime · books · visual novels · games — what you watch, read and play, with its own rest streak." })
    ]));
    main.appendChild(cards);

    /* struggling topics across all subjects (FR-3.3) */
    var ragPanel = KOS.rag.panel(null);
    if (ragPanel) { ragPanel.classList.add("home-rag"); main.appendChild(ragPanel); }

    bigRing(ringCv, pct);
  };

  /* canvas rings read their colours from the live theme tokens */
  function tokenColor(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }
  function bigRing(canvas, pct) {
    var dpr = window.devicePixelRatio || 1, size = 108;
    canvas.width = size * dpr; canvas.height = size * dpr;
    canvas.style.width = size + "px"; canvas.style.height = size + "px";
    var ctx = canvas.getContext("2d");
    if (!ctx || !ctx.scale) return;
    ctx.scale(dpr, dpr);
    var cx = size / 2, cy = size / 2, r = 44;
    ctx.lineWidth = 8; ctx.lineCap = "round";
    ctx.strokeStyle = tokenColor("--well", "#E7DFCC");
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    if (pct > 0) {
      var grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, tokenColor("--accent", "#5D6BA8"));
      grad.addColorStop(1, tokenColor("--accent2", "#A97F2F"));
      ctx.strokeStyle = grad;
      ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct / 100); ctx.stroke();
    }
    ctx.fillStyle = tokenColor("--text", "#332C20");
    ctx.font = "600 22px Fraunces, Georgia, serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(pct + "%", cx, cy - 5);
    ctx.fillStyle = tokenColor("--muted", "#97896D");
    ctx.font = "8px 'IBM Plex Mono', monospace";
    ctx.fillText("COVERED", cx, cy + 14);
  }
  function miniRing(canvas, pct, color) {
    var dpr = window.devicePixelRatio || 1, size = 52;
    canvas.width = size * dpr; canvas.height = size * dpr;
    canvas.style.width = size + "px"; canvas.style.height = size + "px";
    var ctx = canvas.getContext("2d");
    if (!ctx || !ctx.scale) return;
    ctx.scale(dpr, dpr);
    var cx = size / 2, cy = size / 2, r = 20;
    ctx.lineWidth = 4.5; ctx.lineCap = "round";
    ctx.strokeStyle = tokenColor("--well", "#E7DFCC");
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
    if (pct > 0) {
      ctx.strokeStyle = color;
      ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct / 100); ctx.stroke();
    }
    ctx.fillStyle = tokenColor("--text", "#332C20");
    ctx.font = "600 12px 'IBM Plex Mono', monospace";
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
    var deepLeaves = SUBJECTS.reduce(function (all, subject) {
      return all.concat(LEAVES[subject].filter(function (l) { return KOS.content.has(subject, l.ref); }).map(function (l) {
        return { sid: subject, ref: l.ref, title: l.title };
      }));
    }, []);
    if (deepLeaves.length < 2) { KOS.ui.toast("Need at least two deep-content topics to compare.", true); return; }
    var overlay = el("div", { class: "modal-ov", onclick: function (e) { if (e.target === overlay) close(); } });
    function close() { overlay.remove(); document.removeEventListener("keydown", onEsc); }
    function onEsc(e) { if (e.key === "Escape") close(); }
    document.addEventListener("keydown", onEsc);

    function picker(defIdx) {
      return el("select", { class: "status-sel" }, deepLeaves.map(function (l, i) {
        var o = el("option", { value: l.sid + ":" + l.ref, text: KOS_DATA[l.sid].name + " · " + l.ref + " — " + l.title });
        if (i === defIdx) o.selected = true;
        return o;
      }));
    }
    var first = deepLeaves.findIndex(function (l) { return l.sid === sid; });
    var selA = picker(first < 0 ? 0 : first), selB = picker((first < 0 ? 0 : first) + 1);
    if (selB.selectedIndex < 0) selB.selectedIndex = 1;
    var mode = "overview", head = el("div", { class: "cmp-sticky-head" }), body = el("div", { class: "cmp-body" });

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
      return el("div", { class: "cmp-topic cmp-" + side }, [
        el("span", { class: "cmp-code", text: d.code }), el("b", { text: d.title }), el("span", { class: "sub", text: d.subject + " · " + d.section }),
        el("div", { class: "cmp-metrics" }, [
          el("span", { text: d.status + " · " + d.pct + "% complete" }), el("span", { text: d.confidence + " confidence" }),
          el("span", { text: d.mastery + " mastery" }), el("span", { text: d.cards + " cards · " + d.questions + " questions" })
        ])
      ]);
    }
    function column(title, items, empty) {
      return el("div", { class: "cmp-cell" }, [el("span", { class: "cmp-cell-label", text: title })].concat(items && items.length ? items : [el("p", { class: "sub", text: empty || "No matching content." })]));
    }
    function details(title, a, b, render, open) {
      var attrs = { class: "cmp-row" };
      if (open !== false) attrs.open = true;
      var d = el("details", attrs, [el("summary", { text: title })]);
      var cells = el("div", { class: "cmp-row-cells" }, [render(a, "Topic A"), render(b, "Topic B")]);
      d.appendChild(cells); return d;
    }
    function renderRows(a, b) {
      body.innerHTML = "";
      var common = terms(a.content).map(function (p) { return p[0].toLowerCase(); }).filter(function (x) { return terms(b.content).some(function (p) { return p[0].toLowerCase() === x; }); });
      body.appendChild(el("div", { class: "cmp-signals" }, [
        el("span", { class: "cmp-signal", text: common.length ? common.length + " shared key term" + (common.length === 1 ? "" : "s") : "No identical key terms" }),
        el("span", { class: "cmp-signal", text: a.sid === b.sid ? "Same subject" : "Cross-subject comparison" }),
        el("span", { class: "cmp-signal", text: Math.abs(info(a).questions - info(b).questions) ? "Uneven question coverage" : "Comparable question coverage" })
      ]));
      if (mode === "overview") {
        body.appendChild(details("What each topic is about", a, b, function (t, label) { return column(label, overview(t.content).map(function (x) { return el("p", { text: x }); }), "No overview note."); }));
        body.appendChild(details("Where they overlap or diverge", a, b, function (t, label) {
          var own = terms(t.content).slice(0, 8).map(function (p) { return el("div", { class: "cmp-term" + (common.indexOf(p[0].toLowerCase()) !== -1 ? " shared" : "") }, [el("b", { text: p[0] }), el("span", { text: p[1] })]); });
          return column(label, own, "No named terms yet.");
        }));
      } else if (mode === "specification") {
        body.appendChild(details("Specification requirements", a, b, function (t, label) { return column(label, (t.leaf.content || []).map(function (x) { return el("p", { text: x }); }), "No specification bullets."); }));
        body.appendChild(details("Exam-board emphasis", a, b, function (t, label) { return column(label, (t.leaf.info || []).slice(0, 12).map(function (x) { return el("p", { text: x }); }), "No supplementary specification detail."); }));
      } else if (mode === "notes") {
        var pagesA = KOS.content.splitPages(a.content.notes), pagesB = KOS.content.splitPages(b.content.notes);
        for (var page = 0; page < Math.max(pagesA.length, pagesB.length); page++) (function (pa, pb, index) {
          var title = "Notes · " + (pa ? pa.title : "No matching section") + " / " + (pb ? pb.title : "No matching section");
          body.appendChild(details(title, pa, pb, function (p, label) {
            if (!p) return column(label, [], "This topic has no matching note section.");
            var art = el("article", { class: "notes-article cmp-notes", html: KOS.content.renderBlocks(p.blocks) });
            KOS.content.typeset(art); return column(label + " · " + p.title, [art], "No notes.");
          }, index === 0));
        })(pagesA[page], pagesB[page], page);
      } else if (mode === "terms") {
        body.appendChild(details("Key terms", a, b, function (t, label) { return column(label, terms(t.content).map(function (p) { return el("div", { class: "cmp-term" + (common.indexOf(p[0].toLowerCase()) !== -1 ? " shared" : "") }, [el("b", { text: p[0] }), el("span", { text: p[1] })]); }), "No key terms."); }));
      } else if (mode === "exam") {
        body.appendChild(details("Exam focus", a, b, function (t, label) { return column(label, (t.content.exam || []).map(function (q) { return el("div", { class: "cmp-question" }, [el("b", { text: q.marks + " marks" }), el("span", { text: q.q })]); }), "No exam questions available."); }));
        body.appendChild(details("Common confusions", a, b, function (t, label) { return column(label, callouts(t.content, "miscon").map(function (c) { return el("div", { class: "cmp-question" }, [el("b", { text: c.h || "Misconception" }), el("span", { text: textOf(c.body) })]); }), "No explicit misconception note."); }));
      } else {
        body.appendChild(details("Progress and confidence", a, b, function (t, label) { var d = info(t); return column(label, [el("div", { class: "cmp-progress" }, [el("b", { text: d.pct + "% complete" }), el("span", { text: d.status }), el("span", { text: d.confidence + " confidence · " + d.mastery + " mastery" }), el("span", { text: d.cards + " cards · " + d.questions + " questions" })])]); }));
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
      var noteOverlay = el("div", { class: "modal-ov", onclick: function (e) { if (e.target === noteOverlay) noteOverlay.remove(); } });
      var ta = el("textarea", { class: "note-area", placeholder: "Capture the distinction, shared rule, or question to revisit…" });
      ta.value = notes[key] || "";
      noteOverlay.appendChild(el("div", { class: "modal cmp-note-modal" }, [
        el("div", { class: "modal-h" }, [el("b", { text: "Comparison note" }), el("button", { class: "btn", text: "✕ Close", onclick: function () { noteOverlay.remove(); } })]),
        el("p", { class: "sub", text: "Saved with this pair of topics and included in the normal backup." }), ta,
        el("div", { class: "cmp-actions" }, [
          el("button", { class: "btn", text: "Cancel", onclick: function () { noteOverlay.remove(); } }),
          el("button", { class: "btn primary", text: "Save note", onclick: function () { notes[key] = ta.value.trim(); store.save(); noteOverlay.remove(); KOS.ui.toast(notes[key] ? "Comparison note saved." : "Comparison note cleared."); } })
        ])
      ]));
      document.body.appendChild(noteOverlay); ta.focus();
    }
    var swap = el("button", { class: "btn", text: "⇄ Swap", onclick: function () { var v = selA.value; selA.value = selB.value; selB.value = v; update(); } });
    var modes = [["overview", "Overview"], ["specification", "Specification"], ["notes", "Notes"], ["terms", "Key terms"], ["exam", "Exam focus"], ["progress", "Progress"]];
    var modeBar = el("div", { class: "study-tabs cmp-tabs", role: "tablist" }, modes.map(function (m) { return el("button", { class: "study-tab" + (m[0] === mode ? " active" : ""), text: m[1], onclick: function () { mode = m[0]; modeBar.querySelectorAll("button").forEach(function (b) { b.classList.toggle("active", b.textContent === m[1]); }); update(); } }); }));

    overlay.appendChild(el("div", { class: "modal cmp-modal" }, [
      el("div", { class: "modal-h" }, [
        el("div", {}, [el("b", { text: "Compare topics" }), el("span", { class: "sub", text: "Line up the syllabus, evidence and exam focus." })]),
        el("div", { class: "cmp-selectors" }, [selA, swap, selB]),
        el("button", { class: "btn", text: "✕ Close", style: "margin-left:auto", onclick: close })
      ]),
      head, modeBar, body,
      el("div", { class: "cmp-actions" }, [
        el("button", { class: "btn", text: "Open Topic A", onclick: function () { var t = topic(selA.value); close(); KOS.show("ref", { subject: t.sid, ref: t.ref }); } }),
        el("button", { class: "btn", text: "Open Topic B", onclick: function () { var t = topic(selB.value); close(); KOS.show("ref", { subject: t.sid, ref: t.ref }); } }),
        el("button", { class: "btn", text: "◉ Focus Topic A", onclick: function () { var t = topic(selA.value); close(); KOS.show("focus", { subject: t.sid, ref: t.ref }); } }),
        el("button", { class: "btn", text: "◉ Focus Topic B", onclick: function () { var t = topic(selB.value); close(); KOS.show("focus", { subject: t.sid, ref: t.ref }); } }),
        el("button", { class: "btn", text: "✎ Comparison note", onclick: comparisonNote })
      ])
    ]));
    document.body.appendChild(overlay);
    update();
  }

  KOS.views.subject = function (main, sid) {
    renderTree(sid, null);
    var d = KOS_DATA[sid], s = subjectStats(sid);
    main.style.setProperty("--accent", COLORS[sid]);

    /* header — the subject desk */
    var papers = [];
    d.sections.forEach(function (sec) {
      var lbl = sec.paper !== undefined ? paperLabel(sid, sec.paper) : null;
      if (lbl && papers.indexOf(lbl) === -1) papers.push(lbl);
    });
    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "Subject desk" }),
        el("h1", { text: d.name }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: d.board }),
          el("span", { class: "papers", text: papers.join("  ·  ") })
        ])
      ]),
      el("div", { class: "dh-actions" }, [
        el("button", { class: "btn", text: "⇆ Compare topics", onclick: function () { compareModal(sid); } }),
        el("button", { class: "btn primary", text: "◉ Start focus", onclick: function () { KOS.show("focus"); } })
      ])
    ]));

    /* The Overview/Assignments switcher is gone: the desk had a page-level
       tab strip whose only other page is already a first-class Study subnav
       entry, so the strip added a second navigation grammar for nothing.
       Assignments remains one click away in the Study subnav. */

    /* the desk band: board summary + one column per paper/unit (Sol) */
    var units = {};
    d.sections.forEach(function (sec) {
      var lbl = sec.paper !== undefined ? paperLabel(sid, sec.paper) : d.board;
      var st = sectionStats(sid, sec);
      if (!st.total) return;
      units[lbl] = units[lbl] || { done: 0, total: 0, secs: [] };
      units[lbl].done += st.done; units[lbl].total += st.total;
      units[lbl].secs.push(sec.title);
    });
    var unitKeys = Object.keys(units);
    var uwrap = el("div", { class: "subject-units", "aria-label": "Course units" });
    uwrap.appendChild(el("div", { class: "unit-lead" }, [
      el("span", { class: "ul-glyph", "aria-hidden": "true", text: d.name.slice(0, 1) }),
      el("div", { class: "ul-txt" }, [
        el("strong", { text: d.board }),
        el("span", { text: s.total + " spec points · " + s.touched + " started" }),
        /* the bar and the caption underneath it carry the same quantity —
           topics secure — so the band cannot read as two different figures */
        el("div", { class: "insp-track" }, [el("i", { style: "width:" + s.pct + "%" })]),
        el("small", { text: ratioText(s.done, s.total) + " secure · " + pctText(s.pct) })
      ])
    ]));
    unitKeys.forEach(function (lbl) {
      var u = units[lbl];
      var upct = pctOf(u.done, u.total);
      uwrap.appendChild(el("div", { class: "unit-stat" }, [
        el("span", { text: lbl }),
        el("strong", { text: u.secs.length === 1 ? u.secs[0] : u.secs.length + " sections" }),
        el("div", { class: "insp-track" }, [el("i", { style: "width:" + upct + "%" })]),
        el("small", { text: ratioText(u.done, u.total) + " secure · " + pctText(upct) })
      ]));
    });
    main.appendChild(uwrap);

    /* the two-column workspace: sections on the left, context on the right */
    var grid = el("div", { class: "subject-grid" });
    var colMain = el("div", { class: "subject-main" });
    var colSide = el("aside", { class: "subject-side" });
    grid.appendChild(colMain);
    grid.appendChild(colSide);
    main.appendChild(grid);

    /* --- left: the section ledger (accordion rows) --- */
    colMain.appendChild(el("h3", { class: "n-h", text: "Sections" }));
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
        el("span", { class: "sec-bar bar-track" }, [
          el("span", { class: "bar-fill", style: "width:" + st.pct + "%" })]),
        el("span", { class: "pc", text: st.done + "/" + st.total }),
        el("span", { class: "arr", "aria-hidden": "true", text: "▾" })
      ]);
      card.appendChild(head);

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
      if (!subs.length) sub.appendChild(el("div", { class: "bar-row dim", text: "No subsections — the topics live directly in the tree on the left." }));
      card.appendChild(sub);
      secGrid.appendChild(card);
    });
    colMain.appendChild(secGrid);

    /* practice zone — labs live here */
    var labs = PRACTICE[sid] || [];
    if (labs.length) {
      colMain.appendChild(el("h3", { class: "n-h", style: "margin-top:26px", text: "Practice zone" }));
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
      colMain.appendChild(pz);
    }

    /* resource link table (FR-2.8) */
    colMain.appendChild(el("h3", { class: "n-h", style: "margin-top:26px", text: "Resources & reference sheets" }));
    var resHolder = el("div", {});
    colMain.appendChild(resHolder);
    renderResources(resHolder, sid);

    /* --- right: the analytics block, then the action, then the dates ---
       Order is deliberate: the numbers first, the one thing to DO next
       immediately under them as a full-width action card, and only then a
       ruled break into the date-driven panels. Countdowns are not subject
       analytics and must not read as a ninth tile. Nothing here is sticky —
       the column scrolls with the page. */
    colSide.appendChild(subjectAnalytics(sid, s));
    var cont = continueCard(sid);
    if (cont) colSide.appendChild(cont);
    colSide.appendChild(el("div", { class: "side-div", role: "separator" }));
    colSide.appendChild(KOS.calendar.countdownWidget(sid));
    var ragPanel = KOS.rag.panel(sid);
    if (ragPanel) colSide.appendChild(ragPanel);
  };

  /* ---------- the subject analytics panel (right column) ----------
     Eight statistics genuinely exist for a subject, so the grid is the
     balanced 2 x 4 the brief allows for — no filler tile invented to fill a
     hole, and no hole left in the corner (the old strip was seven tiles in a
     two-column grid). Every tile is the same shape: label, value, one line
     of context, and a bar that is present only when it shows the same
     quantity as the value above it. */
  function statTile(o) {
    var empty = o.empty === true;
    var bar = o.pct != null && !empty;
    return el("div", { class: "sa-tile" + (empty ? " empty" : "") + (bar && o.tone ? " " + o.tone : "") +
                              (o.flag ? " " + o.flag : "") }, [
      el("span", { class: "k", text: o.k }),
      el("strong", { class: "v", text: empty ? "—" : o.v }),
      el("span", { class: "s", text: o.sub }),
      el("div", { class: "insp-track sa-track" + (bar ? "" : " na"), "aria-hidden": "true" },
        [el("i", { style: "width:" + (bar ? Math.max(0, Math.min(100, o.pct)) : 0) + "%" })])
    ]);
  }

  function subjectAnalytics(sid, s) {
    var cards = subjectCardStats(sid);
    var quiz = subjectQuizStats(sid);
    var exams = subjectExamCount(sid);
    var run = KOS.sessions.streak(sid);
    var deep = KOS.content.coverage(sid, LEAVES[sid]);
    var startedPct = pctOf(s.touched, s.total);
    var reviewedPct = pctOf(cards.reviewed, cards.total);

    return el("section", { class: "subj-analytics", "aria-label": "Subject analytics" }, [
      el("div", { class: "sa-h" }, [
        el("b", { text: "Subject analytics" }),
        el("span", { class: "sub", text: "this subject only" })
      ]),
      el("div", { class: "sa-grid" }, [
        statTile({ k: "Mastery", v: pctText(s.mastery), pct: s.mastery, tone: tone(s.mastery),
          sub: "progress checks across " + s.total + " topics" }),
        statTile({ k: "Topics secure", v: ratioText(s.done, s.total), pct: s.pct, tone: tone(s.pct),
          sub: pctText(s.pct) + " marked completed" }),
        statTile({ k: "Topics started", v: ratioText(s.touched, s.total), pct: startedPct,
          sub: s.paused ? pctText(startedPct) + " opened · " + s.paused + " paused"
                        : pctText(startedPct) + " opened at least once" }),
        statTile({ k: "Cards due", v: String(cards.due), empty: !cards.total,
          flag: cards.due ? "due" : null,
          sub: !cards.total ? "no flashcards in this subject yet"
             : cards.due ? "ready to review now" : "nothing due today" }),
        statTile({ k: "Cards reviewed", v: ratioText(cards.reviewed, cards.total),
          empty: !cards.total, pct: cards.total ? reviewedPct : null, tone: tone(reviewedPct),
          sub: cards.total ? pctText(reviewedPct) + " of the deck is in the schedule"
                           : "study a topic's cards to begin" }),
        statTile({ k: "Quiz best", v: quiz.best == null ? "" : pctText(quiz.best),
          empty: quiz.best == null, pct: quiz.best, tone: quiz.best == null ? null : tone(quiz.best),
          sub: quiz.best == null ? "no quiz attempts yet"
             : quiz.attempts + (quiz.attempts === 1 ? " attempt" : " attempts") + " across " +
               quiz.topics + (quiz.topics === 1 ? " topic" : " topics") }),
        statTile({ k: "Exam questions", v: String(exams), empty: !exams,
          sub: exams ? "self-marked and logged" : "none self-marked yet" }),
        statTile({ k: "Study streak", v: run + (run === 1 ? " day" : " days"), empty: !run,
          sub: run ? "consecutive days on this subject" : "study today to start one" })
      ]),
      /* the two ratios that look alike are explained rather than left to be
         read as a contradiction, and deep-content coverage keeps its place */
      el("p", { class: "sa-foot", text:
        "Mastery averages the four progress checks over every topic; secure counts only topics " +
        "you have marked completed. Deep revision content exists for " +
        (deep >= s.total ? "every one of the " + s.total + " topics."
                         : ratioText(deep, s.total) + " topics.") })
    ]);
  }

  /* the full-width action card under the stat grid — one card, one action,
     and a standardised empty state (a subject you have never opened still
     gets a card, pointed at the first unfinished topic) */
  function continueCard(sid) {
    var last = store.state.ui.lastRef[sid];
    var leaf = last && BYREF[sid][last];
    var kicker = "Continue where you left off";
    if (!leaf) {
      leaf = LEAVES[sid].filter(function (l) {
        var p = store.peekProgress(sid, l.ref);
        return !p || p.status !== "done";
      })[0] || LEAVES[sid][0];
      kicker = "Start here";
    }
    if (!leaf) return null;
    var pct = leafPercent(sid, leaf.ref);
    return el("button", {
      class: "continue continue-action",
      onclick: function () { KOS.show("ref", { subject: sid, ref: leaf.ref }); }
    }, [
      el("span", { class: "ca-txt" }, [
        el("span", { class: "d", text: kicker }),
        el("b", { text: leaf.ref + " " + leaf.title }),
        el("span", { class: "ca-meta", text: leaf.section.title }),
        el("span", { class: "ca-foot" }, [
          el("span", { class: "insp-track ca-track" }, [el("i", { style: "width:" + pct + "%" })]),
          el("span", { class: "ca-pct", text: pctText(pct) + " mastery" })
        ])
      ]),
      el("span", { class: "ca-go", "aria-hidden": "true", text: "→" })
    ]);
  }

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
          KOS.ui.confirm({ title: "Remove resource?", body: "“" + r.name + "” will be removed from the table.", danger: true, confirm: "Remove" }, function () {
            R.items.splice(R.items.indexOf(r), 1);
            store.save();
            renderResources(holder, sid);
          });
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

    /* ---------- the Topic Status component ----------
       Status, the four progress checks and the RAG confidence rating used to
       be three loose control groups sharing one flex row with hairline
       separators between them. They are one labelled component now, headed by
       a single live mastery readout that repaints the moment any of the three
       changes — and repaints the inspector's copy of the same figure with it,
       because both read topicStats(). */
    var p = store.getProgress(sid, ref);
    var masteryHooks = [];
    function syncMastery() { masteryHooks.forEach(function (f) { f(); }); }

    var ctl = el("section", { class: "ctl-row topic-status", "aria-label": "Topic status" });
    var tsPct = el("strong", { class: "ts-pct" });
    var tsChecks = el("span", { class: "ts-checks" });
    var tsBar = el("i");
    function paintStatus() {
      var t = topicStats(sid, ref);
      tsPct.textContent = pctText(t.mastery);
      tsChecks.textContent = t.checkText;
      tsBar.style.width = t.mastery + "%";
      ctl.classList.remove("low", "mid", "high");
      ctl.classList.add(tone(t.mastery));
    }
    masteryHooks.push(paintStatus);

    var sel = el("select", {
      class: "status-sel", id: "ts-status", "aria-label": "Topic status",
      onchange: function () {
        store.setStatus(sid, ref, sel.value);
        renderTree(sid, ref);
        KOS.refreshRailCounters();
        syncChecks();
        syncMastery();
      }
    }, STATUS.map(function (st) {
      return el("option", { value: st[0], text: STATUS_GLYPH[st[0]] + "  " + st[1] });
    }));
    sel.value = p.status;

    /* marking a topic Completed fills the checklist in the store; the boxes
       have to say so, or the component shows 4/4 mastery beside empty boxes */
    var boxes = [];
    function syncChecks() {
      var cur = store.getProgress(sid, ref);
      boxes.forEach(function (cb, i) {
        cb.checked = !!cur.check[i];
        cb.parentNode.classList.toggle("on", cb.checked);
      });
    }
    var checkGrid = el("div", { class: "ts-checkgrid" });
    CHECKS.forEach(function (label, i) {
      var cb = el("input", { type: "checkbox", onchange: function () {
        store.setCheck(sid, ref, i, cb.checked);
        sel.value = store.getProgress(sid, ref).status;
        renderTree(sid, ref);
        KOS.refreshRailCounters();
        syncChecks();
        syncMastery();
      }});
      cb.checked = p.check[i];
      boxes.push(cb);
      checkGrid.appendChild(el("label", { class: "chk ts-chk" + (cb.checked ? " on" : "") }, [cb, label]));
    });

    ctl.appendChild(el("div", { class: "ts-head" }, [
      el("span", { class: "ts-k", text: "Topic status" }),
      el("span", { class: "ts-mastery" }, [
        tsPct, tsChecks,
        el("span", { class: "insp-track ts-track" }, [tsBar])
      ])
    ]));
    ctl.appendChild(el("div", { class: "ts-body" }, [
      el("div", { class: "ts-field ts-field-status" }, [
        el("label", { class: "ts-lbl", for: "ts-status", text: "Status" }), sel
      ]),
      el("div", { class: "ts-field ts-field-checks" }, [
        el("span", { class: "ts-lbl", text: "Progress checks" }), checkGrid
      ]),
      /* RAG confidence (FR-3.3) — manual picker + what the data says */
      el("div", { class: "ts-field ts-field-conf" }, [
        el("span", { class: "ts-lbl", text: "Confidence" }), KOS.rag.picker(sid, ref)
      ])
    ]));
    paintStatus();
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
    var customQuizCount = KOS.srs.customQuizFor(sid, ref).length;
    /* ONE materials tally. The tab bar prints these numbers on its chips and
       the inspector prints the same object in its Materials section, so a
       badge and the panel beside it are incapable of disagreeing. */
    var mats = {
      cards: KOS.srs.cardsFor(sid, ref).length,
      notes: content && content.notes && content.notes.length
        ? KOS.content.splitPages(content.notes).length : 0,
      quiz: (content && content.quiz ? content.quiz.length : 0) + customQuizCount,
      exam: content && content.exam ? content.exam.length : 0,
      worked: gens.length,
      sim: sims.length
    };
    /* every label is the full noun the rest of the OS uses — the strip mixed
       full words ("Specification", "Flashcards") with clipped ones ("Exam Qs",
       "Simulate", "Worked") and read as two different families of control */
    var TABDEFS = [
      ["spec", "Specification", true, null],
      ["notes", "Notes", !!mats.notes, mats.notes > 1 ? mats.notes : null],
      ["cards", "Flashcards", mats.cards || !!content, mats.cards],
      ["quiz", "Quiz", mats.quiz, mats.quiz],
      ["exam", "Exam questions", mats.exam, mats.exam],
      ["worked", "Worked examples", mats.worked, mats.worked],
      ["sim", "Simulations", mats.sim, mats.sim],
      ["files", "Files", true, null]
    ].filter(function (t) { return t[2]; });

    var tabBar = el("div", { class: "study-tabs study-tabs-topic", role: "tablist" });
    var panel = el("div", { class: "study-panel" });
    var curTab = (content && content.notes && content.notes.length) ? "notes" : "spec";

    TABDEFS.forEach(function (t) {
      tabBar.appendChild(el("button", {
        class: "study-tab" + (t[0] === curTab ? " active" : ""), role: "tab",
        "aria-selected": String(t[0] === curTab),
        "data-tab": t[0],
        onclick: function () {
          curTab = t[0];
          tabBar.querySelectorAll(".study-tab").forEach(function (b) {
            var on = b.dataset.tab === curTab;
            b.classList.toggle("active", on);
            b.setAttribute("aria-selected", String(on));
          });
          openTab();
        }
      }, [t[1], t[3] ? el("span", { class: "tab-n", text: String(t[3]) }) : null].filter(Boolean)));
    });
    /* Build 4.0 — study workspace: content column + collapsible inspector.
       The inspector carries the topic's live stats (mastery, recall record,
       next review); its open state persists in ui.inspectorOpen. */
    var studyGrid = el("div", { class: "study-grid" + (store.state.ui.inspectorOpen === false ? " insp-closed" : "") });
    var studyCol = el("div", {});
    /* Category 6 — the assistant's contextual actions for this topic
       (shared submission path; nothing here calls a tool directly) */
    if (KOS.assistant && KOS.assistant.contextActions) {
      var asstStrip = KOS.assistant.contextActions("ref", { subject: sid, ref: ref, title: leaf.title });
      if (asstStrip) studyCol.appendChild(asstStrip);
    }
    studyCol.appendChild(tabBar);
    studyCol.appendChild(panel);
    studyGrid.appendChild(studyCol);
    studyGrid.appendChild(buildInspector(studyGrid, sid, ref, mats, masteryHooks));
    main.appendChild(studyGrid);

    var firstMount = true;
    function openTab() {
      /* callout slide-in only on the first render of this page,
         not on every tab switch */
      panel.classList.toggle("first-mount", firstMount);
      firstMount = false;
      /* Build 6.3 — a document preview needs width far more than the stats
         rail does, so the Files tab folds the inspector using the SAME
         insp-closed mechanism the toggle uses. ui.inspectorOpen is never
         rewritten, so the user's own preference returns with the tab. */
      if (curTab === "files") {
        studyGrid.classList.add("files-tab");
        studyGrid.classList.add("insp-closed");
      } else if (studyGrid.classList.contains("files-tab")) {
        studyGrid.classList.remove("files-tab");
        studyGrid.classList.toggle("insp-closed", store.state.ui.inspectorOpen === false);
      }
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
        if (content && content.quiz && content.quiz.length) {
          var qHolder = el("div", {});
          panel.appendChild(qHolder);
          KOS.quiz.mountMCQ(qHolder, sid, ref, content.quiz);
        }
        /* Category 6 — custom/AI questions render as their OWN clearly
           labelled block (never mixed into curriculum), each deletable */
        var customQ = KOS.srs.customQuizFor(sid, ref);
        if (customQ.length) {
          var head = el("div", { class: "fc-manage-h", style: "margin-top:18px" }, [
            el("b", { text: customQ.length + " custom question" + (customQ.length === 1 ? "" : "s") }),
            el("span", { class: "sub", text: "generated by the assistant or added by you — editable and deletable, separate from the curriculum quiz" })
          ]);
          panel.appendChild(head);
          var cqHolder = el("div", { class: "quiz-custom" });
          panel.appendChild(cqHolder);
          KOS.quiz.mountMCQ(cqHolder, sid, ref, customQ);
          var manage = el("div", { class: "fc-manage quiz-custom-manage" });
          customQ.forEach(function (cq) {
            manage.appendChild(el("div", { class: "fc-row custom" }, [
              el("div", { class: "fc-row-top" }, [
                el("span", { class: "fc-row-q", html: KOS.content.inline(cq.q) }),
                el("span", { class: "fc-custom", text: cq.ai ? "AI · Custom" : "Custom" }),
                el("button", { class: "mini-btn danger", text: "✕", "aria-label": "Delete question",
                  onclick: function () { KOS.srs.deleteCustomQuiz(cq.id); openTab(); } })
              ])
            ]));
          });
          panel.appendChild(manage);
        }
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

  /* ---------- the study inspector ----------
     Mastery, the materials tally, the recall record and the next review, in a
     panel that genuinely collapses (and says so when collapsed, instead of
     leaving a bare chevron floating in the gutter).

     It computes nothing of its own: `mats` is the very object the tab bar
     printed on its chips, and every other figure comes from topicStats(), the
     same call the Topic Status component makes. `hooks` lets the status
     component repaint the mastery block when a check is ticked, so the two
     mastery readouts on the page move together. */
  function buildInspector(grid, sid, ref, mats, hooks) {
    mats = mats || {};
    var body = el("div", { class: "insp-body" });

    /* --- mastery (live) --- */
    var mPct = el("strong", {});
    var mChecks = el("span", {});
    var mBar = el("i");
    function paintMastery() {
      var t = topicStats(sid, ref);
      mPct.textContent = pctText(t.mastery);
      mChecks.textContent = t.checkText;
      mBar.style.width = t.mastery + "%";
    }
    if (hooks) hooks.push(paintMastery);
    body.appendChild(el("div", { class: "insp-sec" }, [
      el("h5", { text: "Mastery" }),
      el("div", { class: "insp-mastery" }, [mPct, mChecks]),
      el("div", { class: "insp-track" }, [mBar])
    ]));

    function li(k, v, empty) {
      return el("li", { class: empty ? "na" : "" }, [
        el("span", { text: k }), el("strong", { text: empty ? "—" : v })]);
    }
    function count(k, n) { return li(k, String(n), !n); }

    /* --- materials: the tab counts, restated --- */
    body.appendChild(el("div", { class: "insp-sec" }, [
      el("h5", { text: "Materials" }),
      el("ul", { class: "insp-list" }, [
        count("Flashcards", mats.cards || 0),
        count("Quiz questions", mats.quiz || 0),
        count("Exam questions", mats.exam || 0),
        mats.worked ? count("Worked examples", mats.worked) : null,
        mats.sim ? count("Simulations", mats.sim) : null,
        mats.notes > 1 ? count("Note pages", mats.notes) : null
      ].filter(Boolean))
    ]));

    var t = topicStats(sid, ref);
    var qz = t.quiz;
    body.appendChild(el("div", { class: "insp-sec" }, [
      el("h5", { text: "Recall record" }),
      el("ul", { class: "insp-list" }, [
        count("Card views", t.seen),
        li("Recall accuracy", t.accuracy == null ? "" : pctText(t.accuracy), t.accuracy == null),
        count("Lapses", t.lapses),
        li("Quiz best", qz && qz.best != null ? pctText(qz.best) : "", !(qz && qz.best != null)),
        count("Quiz attempts", qz ? qz.attempts || 0 : 0),
        count("Exam questions logged", t.examLogged)
      ])
    ]));

    var nextTxt = t.due ? t.due + " due now"
      : t.next ? t.next
      : t.reviewed ? "all scheduled" : "";
    body.appendChild(el("div", { class: "insp-sec" }, [
      el("h5", { text: "Next review" }),
      el("ul", { class: "insp-list" }, [
        li("Review queue", nextTxt, !nextTxt),
        li("Cards scheduled", ratioText(t.reviewed, t.cards), !t.cards),
        li("Sessions here", t.sessions + (t.minutes ? " · " + t.minutes + " min" : ""), !t.sessions)
      ])
    ]));

    var toggle = el("button", { class: "insp-toggle",
      title: "Collapse / expand the study inspector",
      onclick: function () {
        var closed = grid.classList.toggle("insp-closed");
        store.state.ui.inspectorOpen = !closed;
        store.save();
        paintToggle(closed);
      } });
    function paintToggle(closed) {
      toggle.textContent = closed ? "‹" : "›";
      toggle.setAttribute("aria-expanded", String(!closed));
      toggle.setAttribute("aria-label", closed ? "Expand study inspector" : "Collapse study inspector");
    }
    paintToggle(grid.classList.contains("insp-closed"));

    paintMastery();
    return el("aside", { class: "study-inspector", "aria-label": "Study inspector" }, [
      el("div", { class: "insp-head" }, [
        el("b", { text: "Inspector" }),
        /* the collapsed panel keeps a readable spine so it can be found and
           re-opened without hunting for a naked chevron */
        el("span", { class: "insp-spine", "aria-hidden": "true", text: "Inspector" }),
        toggle
      ]),
      body
    ]);
  }

  function paperLabel(sid, p) {
    if (sid === "compsci") return "Paper " + p;
    if (sid === "it") return p === "Exam" ? "Examined unit" : "NEA unit";
    return p;
  }

  /* ---------- backup view ---------- */
  KOS.views.data = function (main) {
    hideTree();
    var s = store.state;
    var n = Object.keys(s.progress).length;
    main.appendChild(el("div", { class: "dash-head" }, [
      el("div", { class: "dh-txt" }, [
        el("span", { class: "dh-kicker", text: "The archive" }),
        el("h1", { text: "Backup & Restore" }),
        el("div", { class: "dh-sub" }, [
          el("span", { class: "board", text: n + " spec points with saved progress · since " + new Date(s.created).toLocaleDateString("en-GB") })
        ])
      ])
    ]));

    var grid = el("div", { class: "data-grid" });
    main.appendChild(grid);

    /* left — the actions, one per row with its own explanation */
    var actions = el("section", { class: "data-card" });
    actions.appendChild(el("h3", { text: "Keep it safe" }));
    function actionRow(btn, blurb) {
      return el("div", { class: "data-action" }, [btn, el("p", { class: "sub", text: blurb })]);
    }
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
    actions.appendChild(actionRow(exportBtn, "One file with everything in it. Large attachments make a large file — that's expected."));

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
    actions.appendChild(file);
    var importBtn = el("button", { class: "btn gold", text: "Import backup…",
      onclick: function () { file.click(); } });
    actions.appendChild(actionRow(importBtn, "A complete restore, not a merge — the file replaces what's here."));
    actions.appendChild(actionRow(
      el("button", { class: "btn jade", text: "Export revision summary (print / PDF)", onclick: exportSummary }),
      "A printable table of every spec point, its status and your notes."));
    actions.appendChild(actionRow(
      el("button", { class: "btn danger", text: "Reset everything", onclick: function () {
        KOS.ui.confirm({ title: "Reset everything?", body: "All progress, notes and sandbox work will be wiped. Export a backup first if you're unsure.", danger: true, confirm: "Wipe it all" }, function () {
          store.reset(); KOS.refreshRailCounters(); KOS.ui.toast("Fresh start."); KOS.show("home");
        });
      }}),
      "Back to a blank desk. Export first if there's any doubt."));
    grid.appendChild(actions);

    /* right — what a backup covers */
    var covers = el("section", { class: "data-card" });
    covers.appendChild(el("h3", { text: "What a backup covers" }));
    covers.appendChild(el("ul", { class: "data-list" }, [
      el("li", { text: "Study progress, notes and flashcard scheduling" }),
      el("li", { text: "Governor state — HP, gold, XP, everything you own" }),
      el("li", { text: "The whole media vault: anime, books, visual novels, games — routes, quotes, physical volumes included" }),
      el("li", { text: "The purchase planner and budget history" }),
      el("li", { text: "Document attachments" })
    ]));
    covers.appendChild(el("p", { class: "sub", text:
      "AniList and VNDB tokens are deliberately left out — a backup file can end up in less careful places than your browser. After a restore, reconnect both from Sync & Import." }));
    grid.appendChild(covers);

    /* Account & Cloud Sync (Build 4a) — rendered by cloudui when present */
    if (KOS.cloudui) grid.appendChild(KOS.cloudui.panel());
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

  /* The one shared spec-search: the topbar box and the assistant's
     search tool (Category 6) both call THIS, so ranking and snippets can
     never diverge. Returns [{subject, ref, title, fcHit, snippet}], spec
     -wording matches outranking flashcard-only matches, capped at 30.
     The snippet is display text, NOT canonical content — resolve the ref
     for the real thing. */
  function searchSpec(q) {
    q = String(q || "").trim().toLowerCase();
    if (q.length < 2) return [];
    var terms = q.split(/\s+/);
    var specHits = [], fcHits = [];
    SEARCH_INDEX.forEach(function (it) {
      var fcHit = false;
      if (terms.every(function (t) { return it.text.indexOf(t) !== -1; })) {
        fcHit = false;
      } else if (it.fctext && terms.every(function (t) {
        return (it.text + " " + it.fctext).indexOf(t) !== -1; })) {
        fcHit = true;
      } else {
        return;
      }
      var leaf = BYREF[it.subject][it.ref];
      var joined = fcHit ? it.fctext : leaf.content.join(" ");
      var pos = joined.toLowerCase().indexOf(terms[0]);
      var snip = pos >= 0
        ? "…" + joined.slice(Math.max(0, pos - 30), pos + 90) + "…"
        : leaf.content[0];
      (fcHit ? fcHits : specHits).push({
        subject: it.subject, ref: it.ref, title: it.title, fcHit: fcHit, snippet: snip
      });
    });
    return specHits.concat(fcHits).slice(0, 30);
  }

  function runSearch(q) {
    resultsEl.innerHTML = "";
    selIdx = -1;
    if (q.trim().length < 2) { resultsEl.classList.remove("open"); return; }
    matches = searchSpec(q);
    if (!matches.length) {
      resultsEl.appendChild(el("div", { class: "sr-empty",
        text: "No spec point matches \u201C" + q + "\u201D across the three subjects." }));
      resultsEl.classList.add("open");
      return;
    }
    matches.forEach(function (m, i) {
      resultsEl.appendChild(el("div", {
        class: "sr-item", role: "option", "data-i": i,
        onclick: function () { go(i); }
      }, [
        el("span", { class: "sr-ref", style: "color:" + HEX[m.subject], text: m.ref }),
        el("span", { text: m.title }),
        m.fcHit ? el("span", { class: "sr-fc", text: "Flashcard match" }) : null,
        el("span", { class: "sr-sub", text: KOS_DATA[m.subject].name }),
        el("span", { class: "sr-snip", text: m.snippet })
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

  KOS.hub = { LEAVES: LEAVES, BYREF: BYREF, COLORS: COLORS, HEX: HEX, esc: esc, search: searchSpec };
})();
