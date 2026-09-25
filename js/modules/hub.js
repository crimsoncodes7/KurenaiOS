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
    var n2 = KOS.srs ? KOS.srs.dueCount() : 0;
    var due = document.getElementById("pc-due");
    if (due) {
      due.textContent = n2 ? String(n2) : "";
      KOS.ui.state(due, "hot", n2 > 0);
    }
    /* the sub-navigation's live counts (a zero prints nothing, invariant 77) */
    function count(id, n) { var c = document.getElementById(id); if (c) c.textContent = n ? String(n) : ""; }
    count("pc-review", n2);
    if (KOS.assignments && KOS.assignments.urgent) count("pc-assign", KOS.assignments.urgent().length);
    if (KOS.reminders && KOS.reminders.counts) {
      var rc = KOS.reminders.counts().sections || {};
      count("pc-rem", (rc.today || 0) + (rc.overdue || 0));
    }
    if (KOS.notify && KOS.notify.unread) count("pc-notify", KOS.notify.unread());
  }
  KOS.refreshRailCounters = refreshRailCounters;

  /* ---------- tree ----------
     Category 7 Phase C: the spine is now the ONLY section list in Study.
     The subject desk used to render an identical accordion of the same 14
     sections about 400px to its right (audit SUBJ-1); that ledger is gone,
     so everything it was doing — the completion bar per section, the
     per-group tally, and drilling into a subsection — has to happen here. */

  /* The tier at which the tree stops being a column and becomes an overlay
     is 860, not 700: `#tree` goes `position: fixed` at ≤860. Defaulting it
     open there meant that at 700–860 the spine simply covered the page it
     navigates, with no scrim and nothing to dismiss it. */
  var TREE_OVERLAY_Q = "(max-width: 860px)";
  function treeIsOverlay() {
    return typeof window.matchMedia === "function" && window.matchMedia(TREE_OVERLAY_Q).matches;
  }
  function applyTreeCollapsed() {
    /* Build 4b: with no saved preference, the overlay tiers start CLOSED
       (the tree is a drawer over the content there); wider viewports keep
       their open-by-default spine. An explicit choice wins on both. */
    var pref = store.state.ui.treeClosed;
    var closed = pref === true || (pref == null && treeIsOverlay());
    /* a view with no spine only remembers the preference; it never shows one */
    if (KOS.shell.tree() === "none") {
      document.getElementById("cols").classList.toggle("tree-closed", closed);
      return;
    }
    KOS.shell.tree(closed ? "closed" : "open");
  }
  function setTreeClosed(closed) {
    store.state.ui.treeClosed = !!closed;
    store.save();
    applyTreeCollapsed();
  }
  KOS.setTreeClosed = setTreeClosed;

  /* An open overlay drawer is dismissible: the scrim behind it and Escape
     both close it. On a real column (>860) neither fires — the scrim is
     not in the layout and the key is left alone. */
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" || !treeIsOverlay()) return;
    /* only an open spine can be closed: "none" and "closed" are left alone */
    if (KOS.shell.tree() !== "open") return;
    /* a modal is its own Escape owner — never steal the key from one */
    if (document.querySelector("[data-ui~='ui.dialog-overlay']")) return;
    setTreeClosed(true);
  });
  (function () {
    var scrim = document.getElementById("tree-scrim");
    if (scrim) scrim.addEventListener("click", function () { setTreeClosed(true); });
  })();

  /* The opener for the overlay tiers. The floating "Spec spine" pill it
     replaces was fixed over the page (audit SUBJ-4): giving #main bottom
     clearance stops it covering the LAST row, but a fixed pill still prints
     on top of whatever paragraph happens to be under it mid-scroll. An
     opener that sits in the page header cannot overlap anything, and it puts
     the control for the section list on the page the section list serves.
     CSS hides it above 860, where the spine is an ordinary column. */
  function treeOpenButton() {
    return el("button", { class: "btn tree-open-btn", type: "button",
      "aria-label": "Show the spec spine",
      onclick: function () { setTreeClosed(false); } }, [
      el("span", { "aria-hidden": "true", text: "☰" }), " Spec spine"
    ]);
  }
  function renderTree(sid, activeRef) {
    var tree = document.getElementById("tree");
    KOS.shell.tree("open");
    applyTreeCollapsed();
    tree.innerHTML = "";
    var data = KOS_DATA[sid];
    var st = subjectStats(sid);
    tree.style.setProperty("--accent", COLORS[sid]);

    /* the slim reopen rail, shown only when the tree is collapsed */
    tree.appendChild(el("button", { class: "tree-reopen", title: "Show the spec spine",
      onclick: function () { setTreeClosed(false); } }, [
      el("span", { class: "tr-arr", "aria-hidden": "true", text: "›" }),
      el("span", { class: "tr-lbl", text: "Spec spine" })
    ]));

    /* the header: subject, board, a live completion bar, and the collapse control */
    tree.appendChild(el("div", { class: "tree-subject-h" }, [
      el("div", { class: "tsh-txt" }, [
        el("span", { class: "t", text: data.name, style: "color:" + COLORS[sid] }),
        el("span", { class: "b", text: data.board + " · " + ratioText(st.done, st.total) + " secure" }),
        el("div", { class: "tree-progress", "aria-label": st.pct + "% complete" }, [
          el("i", { style: "width:" + st.pct + "%" })
        ])
      ]),
      el("button", { class: "tree-collapse", title: "Collapse the spec spine", "aria-label": "Collapse",
        onclick: function () { setTreeClosed(true); } }, ["‹"])
    ]));
    var open = store.state.ui.openSections[sid] = store.state.ui.openSections[sid] || {};

    /* the section that owns the topic on screen opens itself. Without this
       the active leaf sits inside a collapsed section, .leaf.active is
       display:none, and scrolling it into view below is a no-op — i.e. the
       spine could not show you where you were, which is disqualifying for
       the one control that now owns section navigation. */
    var activeSection = null;
    if (activeRef) {
      var actLeaf = BYREF[sid] && BYREF[sid][activeRef];
      if (actLeaf && actLeaf.section) {
        activeSection = actLeaf.section.ref;
        open[activeSection] = true;
      }
    }

    data.sections.forEach(function (sec) {
      var secEl = el("div", { class: "sec" + (open[sec.ref] ? " open" : "") +
        (sec.ref === activeSection ? " here" : "") });
      var sst = sectionStats(sid, sec);
      var head = el("button", {
        class: "sec-head", style: "--accent:" + COLORS[sid],
        "aria-expanded": open[sec.ref] ? "true" : "false",
        onclick: function () {
          open[sec.ref] = !open[sec.ref];
          KOS.ui.state(secEl, "open", open[sec.ref]);
          head.setAttribute("aria-expanded", open[sec.ref]);
          store.save();
        }
      }, [
        el("span", { class: "ref", text: sec.ref }),
        el("span", { class: "sec-title", text: sec.title }),
        /* the ledger's progress bar, inherited. Same tone() ramp, same
           .bar-track/.bar-fill class names the ledger used, so the one
           low/mid/high colour semantic is unchanged (invariant #26d). */
        sst.total ? el("span", { class: "sec-head-bar bar-track " + tone(sst.pct),
          "aria-hidden": "true" }, [el("span", { class: "bar-fill", style: "width:" + sst.pct + "%" })]) : null,
        sst.total ? el("span", { class: "pc", text: ratioText(sst.done, sst.total) }) : null,
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
          /* the retired ledger's one genuinely extra reading was the
             per-SUBSECTION tally it revealed on expand. It lives on the
             group row now, so nothing was lost by deleting the ledger. */
          var gst = sectionStats(sid, node);
          var gbtn = el("button", { class: "grp-h", "aria-expanded": String(!!open[gkey]),
            onclick: function () {
              open[gkey] = !open[gkey];
              grpKids.style.display = open[gkey] ? "" : "none";
              KOS.ui.state(gbtn, "closed", !open[gkey]);
              gbtn.setAttribute("aria-expanded", String(!!open[gkey]));
              store.save();
            } }, [
            el("span", { class: "grp-arr", text: "▾" }),
            el("span", { class: "grp-t", text: node.ref + " · " + node.title }),
            gst.total ? el("span", { class: "grp-pc", text: ratioText(gst.done, gst.total) }) : null
          ].filter(Boolean));
          if (!open[gkey]) KOS.ui.state(gbtn, "closed", true);
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
          el("span", { class: "st st-" + status, "data-status": status, text: STATUS_GLYPH[status], "aria-label": status })
        ]);
        parentEl.appendChild(btn);
      }
    });
    if (activeRef) {
      var act = tree.querySelector("[data-ui~='study.spine-leaf'][data-state~='active']");
      /* "nearest" — the spine only scrolls when the active leaf is actually
         off its own view. `center` yanked the list on every navigation even
         when the topic was already visible. Never touches #main. */
      if (act && act.scrollIntoView) act.scrollIntoView({ block: "nearest" });
    }
  }
  function hideTree() {
    KOS.shell.tree("none");
  }

  /* ---------- views ---------- */

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

  /* ---------- what the front page actually measures (Cat 7 Phase C) ----------
     Home led with `0% covered · 0/355 spec points · 0 mastered` for an account
     at Level 53 with 1,652 sessions and a 36-day streak (audit HOME-1/G-29).
     Every one of those figures was TRUE — all the progress records were
     `status:"none"` — and every one of them told the app's most active user
     they had done nothing, because they measure a checklist the user does not
     tick rather than the work the user actually does.

     These three measure the work. Coverage keeps its place on the subject
     cards, where it is a property of a subject rather than a headline. */
  function hoursThisWeek() {
    var cut = Date.now() - 7 * 864e5;
    var secs = KOS.sessions.all().reduce(function (a, s) {
      if (s.type === "media" || s.ts < cut) return a;      /* leisure is the rest streak's, not study's */
      return a + (s.dur || 0);
    }, 0);
    return secs / 3600;
  }
  function sessionsThisWeek() {
    var cut = Date.now() - 7 * 864e5;
    return KOS.sessions.all().filter(function (s) {
      return s.type !== "media" && s.ts >= cut;
    }).length;
  }

  /* ---------- "what should I do next" ----------
     The one statement the front page leads with. It reads the surfaces that
     already exist — the focus machine, the SM-2 queue, the merged countdowns,
     the generated directives, the last topic — and picks the first that has
     something to say. It creates nothing and writes nothing; every branch
     hands off to a view that already owns the work. */
  function nextAction(opts) {
    opts = opts || {};
    /* 1 — a session is already running. Nothing outranks finishing it. */
    if (KOS.focus && KOS.focus.state && KOS.focus.state() !== "idle") {
      return { kicker: "In progress", label: "You have a focus session running",
        why: "Pick it back up where you left it.",
        cta: "◉ Return to the session", go: function () { KOS.show("focus"); }, live: true };
    }
    /* 2 — the review queue. Overdue recall is the most perishable thing here. */
    var due = opts.skipDue ? 0 : KOS.srs.dueCount();
    if (due) {
      return { kicker: "Due today", label: KOS.ui.num(due) + " card" + (due === 1 ? "" : "s") + " ready for review",
        why: "Recall decays on a schedule — this is the queue SM-2 built for today.",
        cta: "Start reviewing →", go: function () { KOS.show("due"); } };
    }
    /* 3 — anything dated and close. countdowns() is the merged read over the
       calendar and the assignment tracker, so this cannot disagree with the
       Countdowns panel further down the page. */
    var soon = (KOS.calendar.countdowns ? KOS.calendar.countdowns(null, 1) : [])[0];
    if (soon && soon.days <= 7) {
      return { kicker: soon.days === 0 ? "Today" : soon.days === 1 ? "Tomorrow" : "In " + soon.days + " days",
        label: soon.title, why: soon.meta,
        cta: soon.kind === "pacing" ? "Open the week →" : "Open the calendar →",
        go: function () { if (soon.kind === "pacing") KOS.show("pacing", { wb: soon.entry.wb }); else KOS.show("calendar"); } };
    }
    /* 3b — the weekly plan is behind: unticked rows carried in from earlier
       weeks. Read from the plan; ticking them off happens on the card below
       or on the Pacing page. */
    if (KOS.pacing && KOS.pacing.dueThisWeek) {
      var owe = KOS.pacing.dueThisWeek();
      if (owe.carried.length) {
        return { kicker: "Behind on the plan", label: owe.carried.length + " topic" + (owe.carried.length === 1 ? "" : "s") + " carried over from earlier weeks",
          why: owe.carried.slice(0, 3).map(function (c) { return c.entry.title; }).join(" · "),
          cta: "Open the week →", go: function () { KOS.show("pacing", { wb: owe.week.wb }); } };
      }
    }
    /* 4 — the first directive still unsealed */
    var open = (KOS.todo.autoItems() || []).filter(function (a) { return !KOS.todo.isChecked(a.key); })[0];
    if (open) {
      return { kicker: "Today's directives", label: open.label,
        why: "First of today's generated list.", cta: "Go →", go: open.go };
    }
    /* 5 — carry on where the reading stopped */
    for (var i = 0; i < SUBJECTS.length; i++) {
      var sid = SUBJECTS[i], last = store.state.ui.lastRef[sid];
      if (last && BYREF[sid][last]) {
        return { kicker: "Where you left off", label: last + " " + BYREF[sid][last].title,
          why: KOS_DATA[sid].name, cta: "Continue →",
          go: (function (s, r) { return function () { KOS.show("ref", { subject: s, ref: r }); }; })(sid, last) };
      }
    }
    /* 6 — a genuinely clear board */
    return { kicker: "Clear", label: "Nothing is waiting",
      why: "No cards due, no deadlines inside a week, every directive sealed.",
      cta: "◉ Begin a focus session", go: function () { KOS.show("focus"); } };
  }
  KOS.homeNextAction = nextAction;

  /* ---------- Home (Graphite frame 7a/7b) ----------
     Reads only: every figure comes from a service that already owns it
     (sessions, SRS, the directive list, habits, reminders, the calendar,
     countdowns, the weekly plan, RAG, the media vault). The page writes
     nothing on render; the controls hand off to the view that owns the
     work, or tick through the owner's own API (a directive, a plan row). */
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var SUBJ_HUE = { compsci: "var(--cs)", maths: "var(--maths)", it: "var(--it)" };
  var SUBJ_SHORT = { compsci: "CS", maths: "Maths", it: "IT" };
  var homeMode = null;        /* the Up next switch, per page visit (UI-only state) */
  var homeMins = 25;          /* the Up next focus length (UI-only state) */

  function isoOf(d) {
    return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
  }
  function shortDay(iso) {
    var d = new Date(iso + "T12:00:00");
    return DOW[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()];
  }
  function hm(ts) { var d = new Date(ts); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
  function hoursOn(iso) {
    return KOS.sessions.all().reduce(function (a, s) {
      return s.type !== "media" && s.date === iso ? a + (s.dur || 0) : a;
    }, 0) / 3600;
  }
  function fmtH(h) { return h >= 10 ? String(Math.round(h)) : String(Math.round(h * 10) / 10); }
  function cardRow(k, v, bar) {
    return el("div", { class: "k-card-row" }, [
      el("span", { class: "k-kv-k", text: k }),
      el("span", { class: "k-kv-v", text: v }),
      bar == null ? null : el("span", { class: "k-bar k-kv-bar", style: "--p: " + Math.max(0, Math.min(100, bar)) + "%" }, [el("i")])
    ].filter(Boolean));
  }
  function cardHead(title, meta, link, go, attrs) {
    return el("div", Object.assign({ class: "k-card-head" }, attrs || {}), [
      el("span", { class: "k-card-title", text: title }),
      meta ? el("span", { class: "k-card-meta", text: meta }) : null,
      link ? el("button", { type: "button", class: "k-link", text: link, onclick: go }) : null
    ].filter(Boolean));
  }

  KOS.views.home = function (main) {
    hideTree();
    var stks = KOS.sessions.streaks();
    var g = store.state.governor;
    var li = KOS.governor.levelInfo(g.xp);
    var hpS = KOS.governor.hpState();
    var hpInfo = KOS.governor.hpStateInfo();
    var prof = KOS.governor.profile();
    var today = KOS.srs.todayISO();
    var dueCards = KOS.srs.dueCards();
    var dueN = dueCards.length;

    /* ================= the hero ================= */
    var band = el("section", { class: "k-home-hero", "data-ui": "home.hero home.id", "aria-label": "Today" });
    /* the banner is the user's; the scrim keeps the text legible whatever
       the artwork (audit HOME-2) */
    if (KOS.governor.bannerCss && KOS.governor.bannerCss()) KOS.governor.applyBanner(band, { scrim: "hero" });
    var ring = el("span", { class: "k-home-ring", "data-hp": hpS, style: "--hp: " + Math.max(0, Math.min(100, g.hp)) + "%" },
      [KOS.governor.avatarNode(94)]);
    var greet = el("h1", { class: "k-home-greet" }, [greeting() + " "]);
    if (stks.all) {
      greet.appendChild(el("span", { class: "k-home-streak", "data-ui": "home.streak", text: stks.all + "-day streak" }));
      greet.appendChild(document.createTextNode(", keep it going."));
    } else {
      greet.appendChild(document.createTextNode("Study today to start a streak."));
    }
    var heroTxt = el("div", { class: "k-home-hero-txt" }, [
      el("div", { class: "k-kicker", text: todayLine() }),
      greet,
      prof.status ? el("button", { type: "button", class: "k-home-quote", "data-ui": "home.status",
        title: "Edit your status and about",
        onclick: function () { KOS.governor.editProfileText(function (err, r) { if (!(r && r.cancelled)) KOS.rerender(); }); } },
        ["“" + prof.status + "”"]) : null,
      el("div", { class: "k-home-level" }, [
        el("b", { text: "Level " + li.level + " · " + prof.rank }),
        el("span", { class: "k-bar", role: "img", "aria-label": li.into + " of " + li.need + " XP to level " + (li.level + 1),
          style: "--p: " + Math.round(100 * li.into / li.need) + "%" }, [el("i")]),
        el("span", { class: "k-mono k-muted", text: (li.need - li.into) + " XP to " + (li.level + 1) }),
        el("span", { class: "k-muted", "aria-hidden": "true", text: "·" }),
        el("span", { class: "k-home-hp", "data-hp": hpS, text: "HP " + g.hp + " / 100 · " + hpInfo.label })
      ])
    ].filter(Boolean));

    /* the daily goal is today's directive list (KOS.todo); in Critical the
       same slot shows the recovery wins instead (invariant 2: nothing locks) */
    var goal = el("div", { class: "k-home-goal", "data-ui": "habit.panel" });
    if (hpS === "critical" && KOS.governor.recoveryTasks) {
      var tasks = KOS.governor.recoveryTasks();
      goal.appendChild(el("div", { class: "k-home-goal-head" }, [
        el("span", { class: "k-kicker", text: "Recovery wins" }),
        el("span", { class: "k-mono", text: tasks.filter(function (t) { return t.cur >= t.target; }).length + " / " + tasks.length })
      ]));
      tasks.forEach(function (t) {
        var done = t.cur >= t.target;
        goal.appendChild(el("button", { type: "button", class: "k-goal-item", "aria-pressed": String(done),
          onclick: t.go }, [
          el("span", { class: "k-goal-mark", "aria-hidden": "true", text: done ? "✓" : "" }),
          el("span", { class: "k-goal-text", text: t.label + (t.target > 1 ? " (" + t.cur + "/" + t.target + ")" : "") })
        ]));
      });
      goal.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary",
        text: "Open Recovery →", onclick: function () { KOS.show("governor"); } }));
    } else {
      var autos = (KOS.todo.autoItems() || []);
      var shown = autos.slice(0, 3);
      goal.appendChild(el("div", { class: "k-home-goal-head" }, [
        el("span", { class: "k-kicker", text: "Daily goal" }),
        autos.length ? el("span", { class: "k-mono", text: autos.filter(function (a) { return KOS.todo.isChecked(a.key); }).length + " / " + autos.length }) : null
      ].filter(Boolean)));
      if (!shown.length) goal.appendChild(el("p", { class: "k-home-goal-note", text: "Nothing generated today — no due cards or near deadlines." }));
      shown.forEach(function (a) {
        var on = KOS.todo.isChecked(a.key);
        goal.appendChild(el("button", { type: "button", class: "k-goal-item", "data-ui": "habit.tick", "aria-pressed": String(on),
          "aria-label": (on ? "Unseal directive: " : "Seal directive: ") + a.label,
          onclick: function () { KOS.todo.setChecked(a.key, !on, a.label); KOS.rerender(); } }, [
          el("span", { class: "k-goal-mark", "aria-hidden": "true", text: on ? "✓" : "" }),
          el("span", { class: "k-goal-text", text: a.label })
        ]));
      });
      goal.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary",
        text: "Start focus →", onclick: function () { KOS.show("focus"); } }));
    }
    band.appendChild(el("div", { class: "k-home-hero-body" }, [ring, heroTxt, goal]));
    main.appendChild(band);

    /* ================= Routines · Reminders ================= */
    /* a pure read: todo.habits() materialises the array, and a render
       never writes (smoke56 render purity) */
    var habits = (store.state.todo && store.state.todo.habits) || [];
    var weekStart = (function () { var d = new Date(today + "T12:00:00"); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return d; })();
    var weekIsos = []; for (var wi = 0; wi < 7; wi++) { var wd = new Date(weekStart); wd.setDate(weekStart.getDate() + wi); weekIsos.push(isoOf(wd)); }
    var routines = el("section", { class: "k-card", "data-ui": "home.routines", "aria-label": "Routines" }, [
      cardHead("Routines", habits.length ? habits.slice(0, 4).filter(function (h) { return h.days[today]; }).length + " of " + Math.min(4, habits.length) + " today" : null,
        "Habits →", function () { KOS.show("tasks"); })
    ]);
    if (!habits.length) {
      routines.appendChild(KOS.ui.emptyState({ compact: true, body: "No routines yet — a habit is anything you want to keep daily." }));
    } else {
      var rgrid = el("div", { class: "k-routines" });
      habits.slice(0, 4).forEach(function (h) {
        var kept = weekIsos.filter(function (d) { return h.days[d]; }).length;
        var row = el("div", { class: "k-check-row" }, [
          el("span", { class: "k-dotcheck", "aria-hidden": "true", text: h.days[today] ? "✓" : "" }),
          el("span", { class: "k-check-row-text", text: h.text }),
          el("span", { class: "k-check-row-meta", text: kept + " of 7" + (h.days[today] ? " this week" : "") })
        ]);
        if (h.days[today]) KOS.ui.state(row, "done", true);
        rgrid.appendChild(row);
      });
      routines.appendChild(rgrid);
    }
    /* Reminders: a read-only digest (Build 6.2) — management is its own page */
    var remOpen = ((store.state.reminders && store.state.reminders.items) || []).filter(function (r) { return !r.done; })
      .sort(function (a, b) { return (a.due || "9999") < (b.due || "9999") ? -1 : (a.due || "9999") > (b.due || "9999") ? 1 : 0; });
    var remLate = remOpen.filter(function (r) { return r.due && r.due < today; }).length;
    var reminders = el("section", { class: "k-card", "data-ui": "rem.sum", "aria-label": "Reminders" }, [
      cardHead("Reminders", remOpen.length ? Math.min(2, remOpen.length) + " of " + remOpen.length + (remLate ? " · " + remLate + " overdue" : "") : null,
        "All →", function () { KOS.show("reminders"); })
    ]);
    if (!remOpen.length) {
      reminders.appendChild(KOS.ui.emptyState({ compact: true, body: "Nothing on the list." }));
    } else {
      remOpen.slice(0, 2).forEach(function (r) {
        var when = !r.due ? "" : r.due === today ? "Today" : r.due === KOS.srs.addDays(today, 1) ? "Tomorrow" : r.due < today ? shortDay(r.due) : shortDay(r.due);
        var row = el("div", { class: "k-check-row" }, [
          el("span", { class: "k-boxcheck", "aria-hidden": "true" }),
          el("span", { class: "k-check-row-text", text: r.title }),
          when ? el("span", { class: "k-check-row-meta k-mono", text: when + (r.dueTime ? " " + r.dueTime : "") }) : null
        ].filter(Boolean));
        if (r.due && r.due < today) KOS.ui.state(row, "late", true);
        else if (r.due === today) KOS.ui.state(row, "soon", true);
        reminders.appendChild(row);
      });
    }
    main.appendChild(el("div", { class: "k-home-pair-top" }, [routines, reminders]));

    /* ================= Up next · Today/Upcoming · Study hours · plan ================= */
    var mid = el("div", { class: "k-home-mid" });
    var next = nextAction();
    var running = !!next.live;
    var mode = running ? "focus" : (homeMode || (dueN ? "review" : "focus"));
    var upnext = el("section", { class: "k-card k-upnext", "data-ui": "home.next", "aria-label": "What to do next" });
    if (running) KOS.ui.state(upnext, "live", true);
    function paintUpNext() {
      upnext.innerHTML = "";
      var n = mode === "review" ? null : (running ? next : nextAction({ skipDue: true }));
      var sw = KOS.ui.tabs([
        { label: "Focus", active: mode === "focus", onSelect: function () { homeMode = mode = "focus"; paintUpNext(); } },
        { label: "Review", active: mode === "review", onSelect: function () { homeMode = mode = "review"; paintUpNext(); } }
      ], { variant: "workspace", label: "Up next" });
      upnext.appendChild(el("div", { class: "k-upnext-head" }, [
        el("span", { class: "k-kicker", "data-ui": "home.next-kicker", text: mode === "review" ? "Due today" : n.kicker }),
        running ? null : sw
      ].filter(Boolean)));
      var go, cta;
      if (mode === "review") {
        var oldest = dueCards.length ? dueCards[0].overdue : 0;
        upnext.appendChild(el("h2", { class: "k-upnext-title", "data-ui": "home.next-label",
          text: dueN ? "Review " + KOS.ui.num(dueN) + " due card" + (dueN === 1 ? "" : "s") : "Nothing due to review" }));
        upnext.appendChild(el("p", { class: "k-upnext-why", "data-ui": "home.next-why",
          text: dueN ? "About " + Math.max(1, Math.round(dueN * 0.5)) + " minute" + (dueN > 2 ? "s" : "") + (oldest ? " · oldest is " + oldest + " day" + (oldest === 1 ? "" : "s") + " overdue" : " · all due today")
            : "The queue is clear — SM-2 has nothing scheduled for today." }));
        var bySid = {};
        dueCards.forEach(function (c) { var sid = String(c.key).split(":")[0]; (bySid[sid] = bySid[sid] || []).push(c); });
        SUBJECTS.forEach(function (sid) {
          var list = bySid[sid];
          if (!list) return;
          var refs = {}; list.forEach(function (c) { var r = String(c.key).split(":")[1]; refs[r] = true; });
          var topicNames = Object.keys(refs).slice(0, 2).map(function (r) { return BYREF[sid][r] ? r + " " + BYREF[sid][r].title : r; });
          upnext.appendChild(cardRow(SUBJ_SHORT[sid], list.length + " due · " + topicNames.join(", "), Math.round(100 * list.length / dueN)));
        });
        if (dueN) upnext.appendChild(cardRow("Order", "Most overdue first"));
        cta = "Start reviewing →"; go = function () { KOS.show("due"); };
      } else {
        upnext.appendChild(el("h2", { class: "k-upnext-title", "data-ui": "home.next-label", text: n.label }));
        if (n.why) upnext.appendChild(el("p", { class: "k-upnext-why", "data-ui": "home.next-why", text: n.why }));
        if (!running) {
          var todayH = hoursOn(today), goalH = 2;
          upnext.appendChild(cardRow("Session", homeMins + " min" + (homeMins === 25 ? " · 1 pomodoro" : homeMins === 50 ? " · 2 pomodoros" : " · deep work")));
          upnext.appendChild(cardRow("Goal", fmtH(todayH) + " of " + goalH + "h today", Math.round(100 * todayH / goalH)));
        }
        cta = n.cta; go = n.go;
      }
      var foot = el("div", { class: "k-upnext-foot" });
      if (mode === "focus" && !running) {
        foot.appendChild(el("div", { class: "k-durations", role: "group", "aria-label": "Session length" },
          [25, 50, 90].map(function (m) {
            return el("button", { type: "button", class: "k-btn", "aria-pressed": String(m === homeMins), text: m + "m",
              onclick: function () { homeMins = m; paintUpNext(); } });
          })));
      }
      foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "home.next-go",
        "data-intent": "primary", text: cta, onclick: go }));
      upnext.appendChild(foot);
    }
    paintUpNext();
    mid.appendChild(upnext);

    /* Today and Upcoming — one row; a pair with nothing in it collapses to
       one quiet line, and a lone populated card takes the full width */
    var todayItems = [];
    (KOS.calendar.eventsOn ? KOS.calendar.eventsOn(today) : []).forEach(function (e) {
      todayItems.push({ title: e.title, sub: (e.type ? e.type.charAt(0).toUpperCase() + e.type.slice(1) : "") + (e.subject ? " · " + SUBJ_SHORT[e.subject] : "") + (e.ref ? " · " + e.ref : ""),
        hue: SUBJ_HUE[e.subject] || "var(--muted)", when: e.time ? (e.time >= "18:00" ? "Tonight" : e.time) : "Today",
        now: e.type === "exam" || e.type === "deadline", go: function () { KOS.show("calendar"); } });
    });
    (KOS.assignments && KOS.assignments.forDate ? KOS.assignments.forDate(today) : []).forEach(function (a) {
      var as = a.assignment || a;
      todayItems.push({ title: as.title, sub: "Assignment" + (as.subject ? " · " + SUBJ_SHORT[as.subject] : ""),
        hue: SUBJ_HUE[as.subject] || "var(--muted)", when: as.dueTime || "Today", now: true,
        go: function () { openAssignment(as.id); } });
    });
    /* an assignment row opens the one Assignment dialog in place, as the
       tracker's own rows do; closing it redraws Home */
    function openAssignment(id) {
      if (KOS.assignmentDetail) KOS.assignmentDetail(id, function () { KOS.show("home", undefined, { _nav: true }); });
      else KOS.show("assignments");
    }
    var counts = KOS.calendar.countdowns ? KOS.calendar.countdowns(null, 4) : [];
    var urgent = (KOS.assignments && KOS.assignments.urgent ? KOS.assignments.urgent() : []).filter(function (a) { return KOS.assignments.isOverdue(a); });
    var hasToday = todayItems.length > 0, hasUp = counts.length > 0 || urgent.length > 0;
    if (!hasToday && !hasUp) {
      mid.appendChild(el("div", { class: "k-home-quiet", "data-ui": "home.quiet" }, [
        KOS.ui.emptyState({ compact: true, mark: "澄", title: "Nothing scheduled",
          body: "No events today, no countdowns, no assignments due. Add a deadline or start a session.",
          action: el("button", { type: "button", class: "k-btn", text: "Calendar →", onclick: function () { KOS.show("calendar"); } }) })
      ]));
    } else {
      var pair = el("div", { class: "k-home-pair", "data-ui": "home.today" });
      if (!(hasToday && hasUp)) KOS.ui.state(pair, "one-up", true);
      if (hasToday) {
        var tcard = el("section", { class: "k-card", "data-ui": "home.today-card", "aria-label": "Today" }, [
          cardHead("Today", null, "Calendar →", function () { KOS.show("calendar"); })
        ]);
        todayItems.slice(0, 4).forEach(function (t) {
          tcard.appendChild(el("button", { type: "button", class: "k-day-row", onclick: t.go }, [
            el("span", { class: "k-day-bar", style: "--row-c: " + t.hue, "aria-hidden": "true" }),
            el("span", { class: "k-day-txt" }, [
              el("span", { class: "k-day-title", text: t.title }),
              t.sub ? el("span", { class: "k-day-sub", text: t.sub }) : null
            ].filter(Boolean)),
            el("span", { class: "k-day-when", "data-state": t.now ? "now" : null, text: t.when })
          ]));
        });
        pair.appendChild(tcard);
      }
      if (hasUp) {
        var ucard = el("section", { class: "k-card", "data-ui": "cal.countdowns", "aria-label": "Upcoming" }, [
          cardHead("Upcoming", urgent.length ? urgent.length + " overdue" : "nothing overdue", "Tracker →", function () { KOS.show("assignments"); })
        ]);
        urgent.slice(0, 2).forEach(function (a) {
          var late = -KOS.assignments.daysLeft(a);
          ucard.appendChild(el("button", { type: "button", class: "k-day-row", "data-ui": "asg.urgent cal.countdown-item",
            onclick: function () { openAssignment(a.id); } }, [
            el("span", { class: "k-days-dot", "data-state": "late", text: String(late) }),
            el("span", { class: "k-day-txt" }, [
              el("span", { class: "k-day-title", text: a.title }),
              el("span", { class: "k-day-sub", text: late + " day" + (late === 1 ? "" : "s") + " overdue" + (a.subject ? " · " + a.subject : "") })
            ])
          ]));
        });
        counts.slice(0, Math.max(0, 3 - Math.min(2, urgent.length))).forEach(function (c) {
          ucard.appendChild(el("button", { type: "button", class: "k-day-row", "data-ui": "cal.countdown-item" + (c.kind === "assignment" ? " asg.urgent" : ""),
            onclick: function () { KOS.calendar.openCountdown(c, function () { KOS.show("home", undefined, { _nav: true }); }); } }, [
            el("span", { class: "k-days-dot", "data-state": c.days === 0 ? "now" : null, text: String(c.days) }),
            el("span", { class: "k-day-txt" }, [
              el("span", { class: "k-day-title", text: c.title }),
              el("span", { class: "k-day-sub", text: (c.days === 0 ? "today" : "in " + c.days + " day" + (c.days === 1 ? "" : "s")) + " · " + c.meta })
            ])
          ]));
        });
        pair.appendChild(ucard);
      }
      mid.appendChild(pair);
    }

    /* Study hours — this week, Monday to Sunday */
    var days = weekIsos.map(function (iso) { return { iso: iso, h: hoursOn(iso) }; });
    var weekH = days.reduce(function (a, d) { return a + d.h; }, 0);
    var lastWeekH = 0;
    for (var lw = 1; lw <= 7; lw++) { var ld = new Date(weekStart); ld.setDate(weekStart.getDate() - lw); lastWeekH += hoursOn(isoOf(ld)); }
    var weekSess = KOS.sessions.all().filter(function (s) { return s.type !== "media" && weekIsos.indexOf(s.date) !== -1; }).length;
    var peak = Math.max(2, days.reduce(function (a, d) { return Math.max(a, d.h); }, 0));
    var chart = el("div", { class: "k-hours-chart", "data-ui": "home.week", role: "img",
      "aria-label": "Study hours this week: " + days.filter(function (d) { return d.iso <= today; }).map(function (d) { return shortDay(d.iso) + " " + fmtH(d.h) + "h"; }).join(", ") }, [
      el("div", { class: "k-hours-goal", style: "--goal-y: " + Math.round(100 * 2 / peak) + "%" }, [el("span", { text: "goal 2h" })])
    ].concat(days.map(function (d, i) {
      var future = d.iso > today, isToday = d.iso === today;
      return el("div", { class: "k-hours-day", "data-ui": "home.week-day", title: d.iso, "data-state": future ? "future" : isToday ? "today" : null }, [
        future || !d.h ? null : el("span", { class: "k-hours-v", text: fmtH(d.h) }),
        el("div", { class: "k-hours-bar", style: future ? null : "--h: calc(" + Math.round(100 * d.h / peak) + "% - var(--sp-24))" }),
        el("span", { class: "k-hours-l", text: "MTWTFSS".charAt(i) })
      ].filter(Boolean));
    })));
    var bySubj = { compsci: 0, maths: 0, it: 0 };
    KOS.sessions.all().forEach(function (s) { if (s.type !== "media" && weekIsos.indexOf(s.date) !== -1 && bySubj[s.subject] != null) bySubj[s.subject] += (s.dur || 0) / 3600; });
    var learnt = 0;
    Object.keys(store.state.srs || {}).forEach(function (k) { var m = store.state.srs[k]; if (m && m.reps > 0) learnt++; });
    var delta = weekH - lastWeekH;
    function fact(v, label, cap, onclick) {
      return el(onclick ? "button" : "div", { class: "k-hours-fact", "data-ui": "home.fact", type: onclick ? "button" : null,
        "aria-label": onclick ? v + " " + cap.split(" · ")[0].toLowerCase() + " " + label : null, onclick: onclick || null }, [
        el("span", { class: "k-hours-fact-top" }, [
          el("span", { class: "k-hours-fact-v", "data-ui": "part.value", text: v }),
          el("span", { class: "k-hours-fact-u", "data-ui": "part.label", text: label })
        ]),
        el("span", { class: "k-hours-fact-c", "data-ui": "part.caption", text: cap })
      ]);
    }
    var hours = el("section", { class: "k-card k-hours", "aria-label": "Study hours" }, [
      cardHead("Study hours", null, null, null),
      el("div", { class: "k-hours-big" }, [
        el("span", { class: "k-hours-n", text: fmtH(weekH) }),
        el("span", { class: "k-hours-u", text: "hours" + (weekSess ? " · " + weekSess + " session" + (weekSess === 1 ? "" : "s") : " · no sessions yet") }),
        lastWeekH || weekH ? el("span", { class: "k-hours-d", "data-state": delta < 0 ? "down" : null, text: (delta >= 0 ? "+" : "−") + fmtH(Math.abs(delta)) }) : null
      ].filter(Boolean)),
      chart,
      el("div", { class: "k-hours-facts", "data-ui": "home.facts", "aria-label": "This week" }, [
        fact(String(stks.all), stks.all === 1 ? "day" : "days", stks.all ? "Streak · consecutive study days" : "Streak · study today to start one", null),
        fact(KOS.ui.num(dueN), "due", "Cards · " + KOS.ui.num(learnt) + " learnt", function () { KOS.show("due"); })
      ]),
      weekH ? el("div", {}, [
        el("div", { class: "k-split-bar", "aria-hidden": "true" }, SUBJECTS.filter(function (sid) { return bySubj[sid] > 0; }).map(function (sid) {
          return el("span", { style: "--f: " + bySubj[sid].toFixed(2) + "; --c: " + SUBJ_HUE[sid] });
        })),
        el("div", { class: "k-split-legend" }, SUBJECTS.filter(function (sid) { return bySubj[sid] > 0; }).map(function (sid) {
          return el("span", { style: "--c: " + SUBJ_HUE[sid] }, [el("b", { text: SUBJ_SHORT[sid] }), fmtH(bySubj[sid]) + "h"]);
        }))
      ]) : null
    ].filter(Boolean));
    mid.appendChild(hours);

    /* the week's plan, tickable in place (invariant 82b) */
    var planCard = KOS.pacingHomeCard ? KOS.pacingHomeCard() : null;
    if (planCard) mid.appendChild(planCard);
    main.appendChild(mid);

    /* ================= Continue: the four desks ================= */
    var cont = el("section", { "aria-labelledby": "k-home-continue" }, [
      el("div", { class: "k-continue-head" }, [
        el("h2", { id: "k-home-continue", text: "Continue" }),
        el("button", { type: "button", class: "k-link", text: "Study →", onclick: function () { KOS.show("subject", store.state.ui.subject || "compsci"); } })
      ])
    ]);
    var desks = el("div", { class: "k-desks" });
    SUBJECTS.forEach(function (sid) {
      var d = KOS_DATA[sid], st = subjectStats(sid);
      var last = store.state.ui.lastRef[sid];
      var lastLeaf = last && BYREF[sid][last] ? BYREF[sid][last] : null;
      var weak = (KOS.rag.worst(sid, 1) || [])[0];
      var target = lastLeaf ? { ref: last, title: lastLeaf.title } : (LEAVES[sid][0] ? { ref: LEAVES[sid][0].ref, title: LEAVES[sid][0].title } : null);
      desks.appendChild(el("article", { class: "k-desk", "data-ui": "home.desk", "data-sid": sid, style: "--desk-c: " + SUBJ_HUE[sid] }, [
        el("div", { class: "k-desk-top", "data-ui": "study.subject-card-top" }, [
          el("div", { class: "k-desk-name" }, [
            el("h3", {}, [el("button", { type: "button", class: "k-desk-open", "data-ui": "home.desk-open", text: d.name,
              onclick: function () { KOS.show("subject", sid); } })]),
            el("div", { class: "k-desk-board" }, [
              el("span", { text: d.board }),
              stks[sid] ? el("span", { class: "k-chip", "data-ui": "home.streak", title: stks[sid] + "-day study streak in this subject", text: "炎 " + stks[sid] }) : null
            ].filter(Boolean))
          ]),
          el("span", { class: "k-desk-ring", "data-ui": "home.ring", role: "img", "aria-label": st.pct + "% complete", style: "--p: " + st.pct + "%" },
            [el("span", { text: st.pct + "%" })])
        ]),
        el("div", { class: "k-bar", "data-ui": "media.bar", title: st.done + " of " + st.total + " spec points completed",
          style: "--p: " + Math.max(st.pct, st.done ? 1 : 0) + "%" }, [el("i", { "data-ui": "media.bar-fill" })]),
        el("div", { class: "k-desk-row" }, [el("span", { class: "k-desk-row-k", text: "Topics" }), el("span", { class: "k-desk-row-v", text: st.done + " / " + st.total })]),
        el("div", { class: "k-desk-row" }, [el("span", { class: "k-desk-row-k", text: "Weakest" }),
          weak ? el("button", { type: "button", class: "k-desk-row-v", "data-ui": "rag.item", text: weak.ref + " " + weak.title,
            onclick: function () { KOS.show("ref", { subject: sid, ref: weak.ref }); } })
            : el("span", { class: "k-desk-row-v k-muted", text: "Nothing flagged" })]),
        target ? el("div", { class: "k-desk-foot" }, [
          el("div", { class: "k-desk-foot-txt" }, [
            el("div", { class: "k-desk-foot-k", text: lastLeaf ? "Continue" : "Start" }),
            el("div", { class: "k-desk-foot-v", text: target.ref + " " + target.title })
          ]),
          el("button", { type: "button", class: "k-desk-go", "aria-label": (lastLeaf ? "Continue " : "Start ") + target.ref + " " + target.title,
            text: "→", onclick: function () { KOS.show("ref", { subject: sid, ref: target.ref }); } })
        ]) : null
      ].filter(Boolean)));
    });

    /* the Collection desk: the same component. Its figures come from a
       FULL-TABLE scan (mediadb.stats), so it fills in once the card is on
       screen rather than on Home's render pass (invariant 8) */
    var medMeta = el("span", { "data-ui": "part.meta", text: "Anime · books · visual novels · games" });
    var medRing = el("span", { class: "k-desk-ring", "data-ui": "home.ring", role: "img", "aria-label": "Library completion", style: "--p: 0%" }, [el("span", { text: "—" })]);
    var medBar = el("div", { class: "k-bar", "data-ui": "media.bar", style: "--p: 0%" }, [el("i", { "data-ui": "media.bar-fill" })]);
    var medRows = el("div", {});
    var medFoot = el("div", {});
    var medCard = el("article", { class: "k-desk", "data-ui": "home.desk home.collection-desk", style: "--desk-c: var(--collection-hue)" }, [
      el("div", { class: "k-desk-top", "data-ui": "study.subject-card-top" }, [
        el("div", { class: "k-desk-name" }, [
          el("h3", {}, [el("button", { type: "button", class: "k-desk-open", "data-ui": "home.desk-open", "aria-label": "Collection",
            onclick: function () { KOS.show("matrix"); } }, [el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "蒐" }), "Collection"])]),
          el("div", { class: "k-desk-board" }, [
            medMeta,
            stks.rest ? el("span", { class: "k-chip", "data-ui": "home.streak", title: stks.rest + "-day rest streak", text: "休 " + stks.rest }) : null
          ].filter(Boolean))
        ]),
        medRing
      ]),
      medBar, medRows, medFoot
    ]);
    /* the airing episodes the notification centre already remembers
       (invariant 96) — memory of the schedule, never written to the vault */
    var airing = Object.keys((store.state.notify && store.state.notify.airing) || {}).map(function (k) { return store.state.notify.airing[k]; })
      .filter(function (a) { return a && a.at * 1000 > Date.now(); }).sort(function (a, b) { return a.at - b.at; }).slice(0, 2);
    airing.forEach(function (a) {
      medRows.appendChild(el("div", { class: "k-desk-row" }, [
        el("span", { class: "k-desk-cover", "aria-hidden": "true" }, [a.cover ? el("img", { src: a.cover, alt: "", loading: "lazy" }) : null].filter(Boolean)),
        el("span", { class: "k-desk-row-v k-desk-row-v--start", text: a.title + " · Ep " + a.ep }),
        el("span", { class: "k-desk-when", text: DOW[new Date(a.at * 1000).getDay()] + " " + hm(a.at * 1000) })
      ]));
    });
    desks.appendChild(medCard);
    cont.appendChild(desks);
    main.appendChild(cont);

    function fillCollectionCard() {
      if (!KOS.mediadb || !KOS.mediadb.stats) return;
      KOS.mediadb.stats(function (err, agg) {
        if (err || !agg || !medCard.isConnected) return;
        var done = 0, going = 0;
        Object.keys(agg.modules).forEach(function (m) {
          done += agg.modules[m].completed || 0;
          going += agg.modules[m].inProgress || 0;
        });
        var pctDone = agg.total ? Math.round(100 * done / agg.total) : 0;
        medMeta.textContent = KOS.ui.num(done) + " / " + KOS.ui.num(agg.total);
        medRing.style.setProperty("--p", pctDone + "%");
        medRing.firstChild.textContent = pctDone + "%";
        medRing.setAttribute("aria-label", pctDone + "% of the library completed");
        medBar.style.setProperty("--p", pctDone + "%");
        var best = null;
        Object.keys(agg.modules).forEach(function (m) {
          if (!best || agg.modules[m].inProgress > agg.modules[best].inProgress) best = m;
        });
        if (!airing.length) {
          ["anime", "books"].forEach(function (m) {
            if (!agg.modules[m]) return;
            medRows.appendChild(el("div", { class: "k-desk-row" }, [
              el("span", { class: "k-desk-row-k", text: m === "anime" ? "Anime" : "Books" }),
              el("span", { class: "k-desk-row-v", text: (agg.modules[m].inProgress || 0) + " in progress" })
            ]));
          });
        }
        if (best && agg.modules[best].inProgress) {
          var NAMES = { anime: "Anime", books: "Books", vn: "Visual Novels", game: "Games" };
          var VERB = { anime: "watching", books: "reading", vn: "reading", game: "playing" };
          medFoot.appendChild(el("div", { class: "k-desk-foot" }, [
            el("div", { class: "k-desk-foot-txt" }, [
              el("div", { class: "k-desk-foot-k", text: "Continue " + VERB[best] }),
              el("div", { class: "k-desk-foot-v", text: NAMES[best] + " · " + agg.modules[best].inProgress + " in progress" })
            ]),
            el("button", { type: "button", class: "k-desk-go", "aria-label": "Open " + NAMES[best], text: "→",
              onclick: function () { KOS.show(best); } })
          ]));
        }
      });
    }
    if (typeof window.IntersectionObserver === "function") {
      var medObs = new window.IntersectionObserver(function (entries) {
        if (!entries.some(function (e) { return e.isIntersecting; })) return;
        medObs.disconnect();
        fillCollectionCard();
      /* a generous margin: the point is to get the scan OFF the render pass,
         not to make the reader scroll for a figure that is one row below the
         fold on most desktops */
      }, { root: document.getElementById("stage"), rootMargin: "900px" });
      medObs.observe(medCard);
    }
  };

  /* canvas rings read their colours from the live theme tokens */
  function tokenColor(name, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }
  /* bigRing is retired (Cat 7 Phase C · audit HOME-1/HOME-2). It painted
     "N% / COVERED" in 22px and 8px canvas text directly onto the profile
     banner: at 0% it was the front page's largest element telling an active
     user they had done nothing, and its label was routinely swallowed by the
     artwork behind it. Coverage now lives on the subject cards, where it is a
     property of a subject rather than a headline, and every hero figure sits
     on a real surface instead of on an image. miniRing stays — it is the
     subject cards' ring, and now the Collection card's. */
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
      ["Simulations", "Turing machine, BNF, subnets, floating point, compression, ciphers and more", function () { KOS.store.state.ui.simCat = "cs"; KOS.show("sims"); }, null],
      ["Worked Examples", "RPN conversion, file sizes, parity, subnetting and Big-O, your numbers", function () { KOS.store.state.worked.last = "rpn"; KOS.show("worked"); }, null],
      ["Trace Lab", "Stacks, queues, lists & trees animated with trace tables", function () { KOS.show("trace"); }, { view: "trace" }],
      ["OOP Sandbox", "Drag class blocks, draw inheritance, read the C#", function () { KOS.show("oop"); }, { view: "oop" }],
      ["Logic Lab", "Boolean expressions with live truth tables", function () { KOS.sims.open("logic-lab"); }, { sim: "logic-lab" }],
      ["Sort Visualiser", "Bubble vs merge — watch the Big-O gap appear", function () { KOS.sims.open("sort-viz"); }, { sim: "sort-viz" }],
      ["FSM Lab", "Feed strings through acceptor state machines", function () { KOS.sims.open("fsm-lab"); }, { sim: "fsm-lab" }]
    ],
    maths: [
      ["Worked Examples", "Mark-scheme walkthroughs by paper, your numbers", function () { KOS.show("worked"); }, null],
      ["Simulations", "Trapezium rule, cobweb diagrams, normal curves, projectiles, moments and more", function () { KOS.store.state.ui.simCat = "pure"; KOS.show("sims"); }, null],
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
      KOS.ui.openDialog(noteOverlay); ta.focus();
    }
    var swap = el("button", { class: "btn", text: "⇄ Swap", onclick: function () { var v = selA.value; selA.value = selB.value; selB.value = v; update(); } });
    var modes = [["overview", "Overview"], ["specification", "Specification"], ["notes", "Notes"], ["terms", "Key terms"], ["exam", "Exam focus"], ["progress", "Progress"]];
    var modeBar = el("div", { class: "study-tabs cmp-tabs", role: "tablist" }, modes.map(function (m) { return el("button", { class: "study-tab" + (m[0] === mode ? " active" : ""), text: m[1], onclick: function () { mode = m[0]; modeBar.querySelectorAll("button").forEach(function (b) { KOS.ui.state(b, "active", b.textContent === m[1]); }); update(); } }); }));

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
  var PAPER_NOTE = {
    compsci: { "Paper 1": ["Paper 1", "Programming paper"], "Paper 2": ["Paper 2", "Theory paper"], "Paper 3": ["NEA", "Non-exam assessment"] },
    maths: { "Pure (P1+P2)": ["Pure", "Papers 1 and 2"], "Paper 3": ["Paper 3", "Statistics and mechanics"] },
    it: { "Examined unit": ["Exam", "Examined units"], "NEA unit": ["NEA", "Non-exam assessment units"] }
  };
  function unitTitle(title) {
    var t = String(title).replace(/^Fundamentals of (the )?/i, "");
    return t.charAt(0).toUpperCase() + t.slice(1);
  }
  function leavesOf(sid, sec) {
    return LEAVES[sid].filter(function (l) { return l.section === sec; });
  }

  KOS.views.subject = function (main, sid) {
    hideTree();
    var d = KOS_DATA[sid], s = subjectStats(sid);
    main.style.setProperty("--subj-c", SUBJ_HUE[sid]);
    var today = KOS.srs.todayISO();

    KOS.shell.actions([
      el("button", { type: "button", class: "k-btn", "data-ui": "study.compare", text: "⇆ Compare",
        onclick: function () { compareModal(sid); } }),
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

    var side = el("div", { class: "k-subj-side" }, [continueCard(sid), weakestCard(sid)]);
    main.appendChild(el("div", { class: "k-subj-row", "data-ui": "study.desk-top" }, [hero, side]));

    /* ================= analytics, beside the dates ================= */
    main.appendChild(el("div", { class: "k-subj-row" }, [subjectAnalytics(sid, s), deadlinesCard(sid, today)]));

    /* ================= the course units ================= */
    var lastRef = store.state.ui.lastRef[sid];
    var lastSec = lastRef && BYREF[sid][lastRef] ? BYREF[sid][lastRef].section : null;
    var units = el("div", { class: "k-units", "data-ui": "study.units" });
    d.sections.forEach(function (sec) {
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
    main.appendChild(el("section", { class: "k-subj-units", "aria-labelledby": "k-units-h" }, [
      el("div", { class: "k-sectionhead" }, [
        el("h2", { id: "k-units-h", text: "Course units" }),
        el("span", { class: "k-sectionhead-sub", text: units.children.length + " units · " +
          (paperNames.length > 1 ? paperNames.slice(0, -1).join(", ") + " and " + paperNames[paperNames.length - 1] : paperNames[0] || d.board) })
      ]),
      KOS.ui.scroller(units, { label: "Course units", prevLabel: "Scroll to earlier units", nextLabel: "Scroll to later units" })
    ]));

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
    var resHolder = el("section", { class: "k-card", "data-ui": "study.resources", "aria-label": "Resources" });
    bottom.appendChild(resHolder);
    renderResources(resHolder, sid);
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

  function subjectAnalytics(sid, s) {
    var cards = subjectCardStats(sid);
    var quiz = subjectQuizStats(sid);
    var exams = subjectExamCount(sid);
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
          sub: s.paused ? pctText(startedPct) + " opened · " + s.paused + " paused"
                        : pctText(startedPct) + " opened at least once" }),
        statTile({ k: "Cards due", v: KOS.ui.num(cards.due), empty: !cards.total,
          sub: !cards.total ? "no flashcards in this subject yet"
             : cards.due ? "ready to review now" : "nothing due today" }),
        statTile({ k: "Reviewed", v: ratioText(cards.reviewed, cards.total),
          empty: !cards.total, pct: cards.total ? reviewedPct : null, c: "var(--subj-c)",
          sub: cards.total ? pctText(reviewedPct) + " of the deck is in the schedule"
                           : "study a topic's cards to begin" }),
        statTile({ k: "Quiz best", v: quiz.best == null ? "" : pctText(quiz.best),
          empty: quiz.best == null, pct: quiz.best, c: "var(--subj-c)",
          sub: quiz.best == null ? "no quiz attempts yet"
             : quiz.attempts + (quiz.attempts === 1 ? " attempt" : " attempts") + " across " +
               quiz.topics + (quiz.topics === 1 ? " topic" : " topics") }),
        statTile({ k: "Exam Qs", v: String(exams), empty: !exams,
          sub: exams ? "self-marked and logged" : "none self-marked yet" }),
        statTile({ k: "Streak", v: run + (run === 1 ? " day" : " days"), empty: !run,
          sub: run ? "consecutive days on this subject" : "study today to start one" })
      ])
    ]);
  }

  /* where to go next — one card, one action, and an honest kicker for a
     subject you have never opened (pointed at the first unfinished topic) */
  function continueCard(sid) {
    var last = store.state.ui.lastRef[sid];
    var leaf = last && BYREF[sid][last];
    var kicker = "Continue";
    if (!leaf) {
      leaf = LEAVES[sid].filter(function (l) {
        var p = store.peekProgress(sid, l.ref);
        return !p || p.status !== "done";
      })[0] || LEAVES[sid][0];
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
    var w = (KOS.rag.worst(sid, 1) || [])[0];
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

    /* ---------- the Topic Status component ----------
       Status, the four progress checks and the RAG confidence rating are one
       labelled component, headed by a single live mastery readout.

       Category 7 Phase C moves that whole component OFF the content path and
       into the inspector, which becomes the page's single state surface. It
       used to sit between the title and the tabs as a 170px band, and the
       inspector then printed the same mastery figure again 280px lower
       (audit REF-1, REF-3). The component is unchanged; only its address is.
       The Inspector is now the one place where topic state is read or changed,
       leaving the header free to identify the material being studied. */
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
      ["low", "mid", "high"].forEach(function (w) { KOS.ui.state(ctl, w, false); });
      KOS.ui.state(ctl, tone(t.mastery), true);
    }
    masteryHooks.push(paintStatus);

    /* Topic status lives only in the Inspector. Keeping this as a collection
       leaves the sync path robust if that control gains a second legitimate
       home later, without reintroducing a header-level duplicate. */
    var statusSelects = [];
    function syncStatusControls() {
      var v = store.getProgress(sid, ref).status;
      statusSelects.forEach(function (s) { s.value = v; });
    }
    function statusSelect(id, label) {
      var s = el("select", {
        class: "status-sel", id: id, "aria-label": label,
        onchange: function () {
          store.setStatus(sid, ref, s.value);
          renderTree(sid, ref);
          KOS.refreshRailCounters();
          syncStatusControls();
          syncChecks();
          syncMastery();
        }
      }, STATUS.map(function (st) {
        return el("option", { value: st[0], text: STATUS_GLYPH[st[0]] + "  " + st[1] });
      }));
      s.value = store.getProgress(sid, ref).status;
      statusSelects.push(s);
      return s;
    }

    /* ---------- one header row (audit REF-1) ----------
       Crumbs + seal + title + board line used to be three stacked
       blocks costing 138px before the status band even began. They are one
       row: the path the crumbs carried becomes the meta line's first clause,
       which is where a reader looks for it anyway. Topic state belongs wholly
       to the Inspector rather than duplicating a dot and dropdown here. */
    var metaBits = [d.name].concat(leaf.path).concat([d.board]);
    if (leaf.section.paper) metaBits.push(paperLabel(sid, leaf.section.paper));
    if (content) metaBits.push("deep revision content");
    main.appendChild(el("header", { class: "page-h topic-head" }, [
      el("div", { class: "seal", text: leaf.ref }),
      el("div", { class: "th-txt" }, [
        el("h1", { text: leaf.title }),
        el("p", { class: "pap th-meta", text: metaBits.join(" · ") })
      ]),
      el("div", { class: "th-ctl" }, [
        treeOpenButton()
      ])
    ]));

    /* marking a topic Completed fills the checklist in the store; the boxes
       have to say so, or the component shows 4/4 mastery beside empty boxes */
    var boxes = [];
    function syncChecks() {
      var cur = store.getProgress(sid, ref);
      boxes.forEach(function (cb, i) {
        cb.checked = !!cur.check[i];
        KOS.ui.state(cb.parentNode, "on", cb.checked);
      });
    }
    var checkGrid = el("div", { class: "ts-checkgrid" });
    CHECKS.forEach(function (label, i) {
      var cb = el("input", { type: "checkbox", onchange: function () {
        store.setCheck(sid, ref, i, cb.checked);
        renderTree(sid, ref);
        KOS.refreshRailCounters();
        syncStatusControls();
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
        el("label", { class: "ts-lbl", for: "ts-status", text: "Status" }),
        statusSelect("ts-status", "Topic status")
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
    syncStatusControls();

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
    /* ONE materials tally, printed ONCE — on the tab chips (audit REF-4).
       It used to be printed twice: here, and again as an inspector
       "Materials" list about 200px to the right, four identical numbers
       under a different heading. The chip is the right home, because the
       count is the thing that decides whether you press the tab. */
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
    /* the five editable kinds are always reachable — an empty tab is where
       you add the material (the study editor); counts print only when
       there is something to count (invariant 77) */
    var TABDEFS = [
      ["spec", "Specification", true, null],
      ["notes", "Notes", true, mats.notes > 1 ? mats.notes : null],
      ["cards", "Flashcards", true, mats.cards || null],
      ["quiz", "Quiz", true, mats.quiz || null],
      ["exam", "Exam questions", true, mats.exam || null],
      ["worked", "Worked examples", mats.worked, mats.worked],
      ["sim", "Simulations", mats.sim, mats.sim],
      ["files", "Files", true, null]
    ].filter(function (t) { return t[2]; });

    var tabBar = el("div", { class: "study-tabs study-tabs-topic", role: "tablist" });
    var panel = el("div", { class: "study-panel" });
    var curTab = (content && content.notes && content.notes.length) ? "notes" : "spec";
    /* the study editor (modules/editor.js) — the tab → editable kind map,
       and the per-device memory of an open editor so a redraw (a tab
       becoming available after its first block, a breakpoint change)
       reopens it on the same tab */
    var EDIT_KIND = { spec: "spec", notes: "notes", cards: "flashcards", quiz: "quiz", exam: "exam" };
    var editing = store.state.ui.editing;
    if (editing && editing.sid === sid && editing.ref === ref && editing.tab && EDIT_KIND[editing.tab]) curTab = editing.tab;
    else editing = null;

    TABDEFS.forEach(function (t) {
      tabBar.appendChild(el("button", {
        class: "study-tab" + (t[0] === curTab ? " active" : ""), role: "tab",
        "aria-selected": String(t[0] === curTab),
        "data-tab": t[0],
        onclick: function () {
          curTab = t[0];
          tabBar.querySelectorAll("[data-ui~='ui.tab']").forEach(function (b) {
            var on = b.dataset.tab === curTab;
            KOS.ui.state(b, "active", on);
            b.setAttribute("aria-selected", String(on));
          });
          openTab();
        }
      }, [t[1], t[3] ? el("span", { class: "tab-n", text: String(t[3]) }) : null].filter(Boolean)));
    });

    /* ---------- ONE study navigation layer (audit REF-6) ----------
       The page carried three: an assistant action strip, a tab strip that
       wrapped and orphaned "Files" on a row of its own, and a row of up to
       seven note-page pills that wrapped again. That is 3 levels of tab and
       ~240px of chrome for one decision.

       There is one bar now. It sticks to the top of the scroller so the tabs
       stay reachable however far down the topic you are, it is a DECLARED
       horizontal scroller (Phase B invariant #50 — an undeclared sideways
       scroll counts as unreachable content), and the note-page control lives
       inside it at the right-hand end rather than as a second row. */
    var navRow = el("div", { class: "study-nav-row" });
    var pagerSlot = el("div", { class: "study-nav-pages" });
    navRow.appendChild(KOS.ui.scroller(tabBar, { label: "Study material",
      prevLabel: "Scroll to earlier tabs", nextLabel: "Scroll to later tabs",
      className: "study-tabs-scroller" }));
    /* the one Edit control for the page: it edits whatever tab is open,
       and reads "Done" while the editor is up */
    var editBtn = el("button", { class: "btn study-edit", type: "button", "aria-pressed": "false",
      onclick: function () { editing ? closeEditor() : openEditor(); } }, [
      el("span", { class: "study-edit-i", "aria-hidden": "true", text: "✎" }), el("span", { class: "study-edit-t", text: "Edit" })]);
    navRow.appendChild(editBtn);
    var pagesSlot = el("div", { class: "study-nav-pagelist" }, [pagerSlot]);
    var studyNav = el("div", { class: "study-nav" }, [navRow, pagesSlot]);

    /* Build 4.0 — study workspace: content column + collapsible inspector.
       The inspector carries the topic's live state; its open state persists
       in ui.inspectorOpen. */
    var studyGrid = el("div", { class: "study-grid" + (store.state.ui.inspectorOpen === false ? " insp-closed" : "") });
    var studyCol = el("div", { class: "study-col" });
    studyCol.appendChild(studyNav);
    studyCol.appendChild(panel);
    studyGrid.appendChild(studyCol);
    /* Category 6 — the assistant's contextual actions for this topic
       (shared submission path; nothing here calls a tool directly). They
       were a strip directly above the tabs, i.e. on the path between the
       title and the first word of revision content; they belong with the
       page's other side-of-desk affordances. */
    var asstStrip = KOS.assistant && KOS.assistant.contextActions
      ? KOS.assistant.contextActions("ref", { subject: sid, ref: ref, title: leaf.title })
      : null;
    var inspector = buildInspector(studyGrid, sid, ref, ctl, asstStrip);
    studyGrid.appendChild(inspector);
    var editorHost = el("div", { class: "study-editor-host", hidden: true });
    studyGrid.appendChild(editorHost);
    main.appendChild(studyGrid);

    /* ---------- the study editor ---------- */
    var editorCtl = null;
    function paintEditBtn() {
      var kind = EDIT_KIND[curTab];
      editBtn.hidden = !kind;
      editBtn.setAttribute("aria-pressed", String(!!editing));
      KOS.ui.state(editBtn, "on", !!editing);
      editBtn.querySelector("[data-ui~='topic.edit']").textContent = editing ? "Done" : "Edit";
      KOS.ui.state(editBtn, "forked", !!(kind && KOS.edits.has(sid, ref, kind)));
      editBtn.title = editing ? "Close the editor" : (kind ? "Edit the " + KOS.editor.KIND_LABEL[kind].toLowerCase() + " on this topic" : "");
    }
    function openEditor() {
      var kind = EDIT_KIND[curTab];
      if (!kind || !KOS.editor) return;
      editing = { sid: sid, ref: ref, tab: curTab };
      store.state.ui.editing = editing;
      store.save();
      KOS.ui.state(studyGrid, "editing", true);
      KOS.ui.state(studyGrid, "insp-closed", false);
      inspector.hidden = true;
      editorHost.hidden = false;
      editorCtl = KOS.editor.mount(editorHost, {
        sid: sid, ref: ref, kind: kind,
        onChange: function (k, hint) {
          /* the page beside the editor IS the preview */
          if (hint && hint.focusOnly) {
            /* a selection: turn to the page that holds the block if the
               open page does not, then point at it */
            if (hint.id && !panel.querySelector('[data-ui~="topic.note-block"][data-bid="' + String(hint.id).replace(/"/g, "") + '"]')) openTab({ keep: true, reveal: hint.id });
            else revealBlock(hint.id);
            return;
          }
          content = KOS.content.get(sid, ref);
          openTab({ keep: true, reveal: hint && hint.id });
          paintEditBtn();
          KOS.refreshRailCounters && KOS.refreshRailCounters();
        },
        onClose: closeEditor
      });
      paintEditBtn();
      KOS.a11y && KOS.a11y.announce && KOS.a11y.announce("Editing " + KOS.editor.KIND_LABEL[kind] + ".");
    }
    function closeEditor() {
      editing = null;
      store.state.ui.editing = null;
      store.save();
      if (editorCtl) editorCtl.destroy();
      editorCtl = null;
      editorHost.hidden = true;
      inspector.hidden = false;
      KOS.ui.state(studyGrid, "editing", false);
      KOS.ui.state(studyGrid, "insp-closed", store.state.ui.inspectorOpen === false);
      paintEditBtn();
      editBtn.focus();
    }
    /* scroll the rendered block into view and mark it, so a selection in
       the editor points at the paragraph it edits */
    function revealBlock(id) {
      if (!id) return;
      panel.querySelectorAll("[data-state~='n-blk-sel']").forEach(function (n) { KOS.ui.state(n, "n-blk-sel", false); });
      var target = panel.querySelector('[data-ui~="topic.note-block"][data-bid="' + String(id).replace(/"/g, "") + '"]');
      if (!target) return;
      KOS.ui.state(target, "n-blk-sel", true);
      if (target.scrollIntoView) target.scrollIntoView({ block: "center", behavior: "smooth" });
    }

    var firstMount = true;
    var notePage = 0;                       // survives a re-render while editing
    function openTab(o) {
      o = o || {};
      content = KOS.content.get(sid, ref);
      if (editorCtl && !o.keep) editorCtl.setKind(EDIT_KIND[curTab] || editorCtl.kind());
      if (editing && !EDIT_KIND[curTab]) closeEditor();
      else if (editing) { editing.tab = curTab; store.state.ui.editing = editing; }
      paintEditBtn();
      /* callout slide-in only on the first render of this page,
         not on every tab switch */
      KOS.ui.state(panel, "first-mount", firstMount);
      firstMount = false;
      /* Build 6.3 — a document preview needs width far more than the stats
         rail does, so the Files tab folds the inspector using the SAME
         insp-closed mechanism the toggle uses. ui.inspectorOpen is never
         rewritten, so the user's own preference returns with the tab. */
      if (curTab === "files") {
        KOS.ui.state(studyGrid, "files-tab", true);
        KOS.ui.state(studyGrid, "insp-closed", true);
      } else if (KOS.ui.hasState(studyGrid, "files-tab")) {
        KOS.ui.state(studyGrid, "files-tab", false);
        KOS.ui.state(studyGrid, "insp-closed", store.state.ui.inspectorOpen === false);
      }
      /* the note-page control lives in the nav bar, outside `panel`, so it
         has to be cleared here too or it would survive a tab change */
      pagerSlot.innerHTML = "";
      panel.innerHTML = "";
      if (curTab === "spec") {
        var split = el("div", { class: "split" });
        var specFork = KOS.edits.has(sid, ref, "spec") || editing ? KOS.edits.material(sid, ref, "spec") : null;
        var specL = el("div", { class: "cb speccontent" + (specFork ? " notes-article" : ""),
          html: specFork ? KOS.content.renderBlocks(specFork.content) : renderSpecContent(leaf.content) });
        split.appendChild(el("div", { class: "colcard" }, [
          el("div", { class: "ch", text: d.labelL }), specL
        ]));
        var right = el("div", {});
        if (specFork ? specFork.info.length : leaf.info.length) {
          var specR = el("div", { class: "cb guide" + (specFork ? " notes-article" : ""),
            html: specFork ? KOS.content.renderBlocks(specFork.info) : renderSpecInfo(leaf.info) });
          right.appendChild(el("div", { class: "colcard" }, [
            el("div", { class: "ch", text: d.labelR }), specR
          ]));
        }
        split.appendChild(right);
        panel.appendChild(split);
        if (specFork) { KOS.content.typeset(specL); KOS.content.typeset(split); }
        if (o.reveal) revealBlock(o.reveal);
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
        /* while editing, render the editable shape (id-bearing blocks) even
           before the first change, so a selection can point at its block */
        var noteBlocks = editing && !KOS.edits.has(sid, ref, "notes")
          ? KOS.edits.material(sid, ref, "notes")
          : (content && content.notes ? content.notes : []);
        if (!noteBlocks.length) {
          panel.appendChild(KOS.ui.emptyState({
            compact: true, mark: "註", title: "No notes on this topic yet",
            body: "Write your own — paragraphs, Markdown, callouts, code, worked examples — and they stay with this topic on every device.",
            action: editing ? null : el("button", { class: "btn primary", type: "button", text: "✎ Write notes", onclick: openEditor })
          }));
        } else {
          var pages = KOS.content.splitPages(noteBlocks);
          var article = el("article", { class: "notes-article" });
          var cur = Math.max(0, Math.min(pages.length - 1, o.keep ? notePage : 0));
          if (o.reveal) {
            /* show the page that holds the block the editor is on */
            pages.forEach(function (pg, i) { if (pg.blocks.some(function (b) { return b && b.id === o.reveal; })) cur = i; });
          }
          if (pages.length > 1) {
            /* ---------- page navigation ----------
               A reader needs one calm, direct way to move through a note:
               previous / named current page / next. The previous wall of
               numbered pills repeated the article footer and made pages read
               like tabs competing with the material tabs above. */
            var stepPrev = el("button", { class: "reader-step reader-prev", type: "button",
              "aria-label": "Previous note page", onclick: function () { showPage(cur - 1, true); } }, [
              el("span", { class: "reader-step-arrow", "aria-hidden": "true", text: "‹" }),
              el("span", { class: "reader-step-text", text: "Previous" })
            ]);
            var pageSelect = el("select", { class: "reader-page-select", "aria-label": "Choose note page",
              onchange: function () { showPage(Number(pageSelect.value), true); } });
            pages.forEach(function (pg, i) {
              pageSelect.appendChild(el("option", { value: String(i), text: "Page " + (i + 1) + " — " + pg.title }));
            });
            var stepNext = el("button", { class: "reader-step reader-next", type: "button",
              "aria-label": "Next note page", onclick: function () { showPage(cur + 1, true); } }, [
              el("span", { class: "reader-step-text", text: "Next" }),
              el("span", { class: "reader-step-arrow", "aria-hidden": "true", text: "›" })
            ]);
            var foot = el("nav", { class: "note-foot", "aria-label": "Note pages" });
            pagerSlot.innerHTML = "";
            pagerSlot.appendChild(el("div", { class: "reader-nav" }, [
              el("span", { class: "reader-label", text: "Note pages" }),
              stepPrev,
              pageSelect,
              stepNext
            ]));
            var showPage = function (i, moved) {
              cur = Math.max(0, Math.min(pages.length - 1, i));
              notePage = cur;
              pageSelect.value = String(cur);
              article.innerHTML = KOS.content.renderBlocks(pages[cur].blocks);
              KOS.ui.hookify(article);
              KOS.content.typeset(article);
              if (moved && article.scrollIntoView) article.scrollIntoView({ block: "start", behavior: "smooth" });
              stepPrev.disabled = cur === 0;
              stepNext.disabled = cur === pages.length - 1;
              foot.innerHTML = "";
              foot.appendChild(cur > 0 ? el("button", { class: "pn pn-page", type: "button", onclick: function () { showPage(cur - 1, true); } }, [
                el("span", { class: "d", text: "‹ Previous page" }),
                el("span", { class: "pn-t", text: pages[cur - 1].title })
              ]) : el("span", { class: "pn-gap" }));
              foot.appendChild(el("span", { class: "note-foot-count", text: "Page " + (cur + 1) + " of " + pages.length }));
              foot.appendChild(cur < pages.length - 1 ? el("button", { class: "pn pn-page pn-next", type: "button", onclick: function () { showPage(cur + 1, true); } }, [
                el("span", { class: "d", text: "Next page ›" }),
                el("span", { class: "pn-t", text: pages[cur + 1].title })
              ]) : el("span", { class: "pn-gap" }));
            };
            panel.appendChild(article);
            panel.appendChild(foot);
            showPage(cur);
          } else {
            notePage = 0;
            article.innerHTML = KOS.content.renderBlocks(noteBlocks);
            KOS.ui.hookify(article);
            panel.appendChild(article);
            KOS.content.typeset(article);
          }
          if (o.reveal) revealBlock(o.reveal);
        }
      }
      else if (curTab === "cards") {
        var fcHolder = el("div", { class: "fc-wrap" });
        panel.appendChild(fcHolder);
        KOS.flashcards.mount(fcHolder, sid, ref, { onEdit: openEditor, editing: !!editing });
      }
      else if (curTab === "quiz") {
        var customN = KOS.srs.customQuizFor(sid, ref).length;
        if (content && content.quiz && content.quiz.length) {
          var qHolder = el("div", {});
          panel.appendChild(qHolder);
          KOS.quiz.mountMCQ(qHolder, sid, ref, content.quiz);
        } else if (!customN) {
          panel.appendChild(KOS.ui.emptyState({
            compact: true, mark: "問", title: "No quiz on this topic yet",
            body: "Write multiple-choice questions with an explanation for each — they score and schedule like the curriculum's.",
            action: editing ? null : el("button", { class: "btn primary", type: "button", text: "✎ Write questions", onclick: openEditor })
          }));
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
        if (content && content.exam && content.exam.length) {
          var eHolder = el("div", {});
          panel.appendChild(eHolder);
          KOS.quiz.mountExam(eHolder, sid, ref, content.exam);
        } else {
          panel.appendChild(KOS.ui.emptyState({
            compact: true, mark: "試", title: "No exam questions on this topic yet",
            body: "Add exam-style questions with marks and a mark scheme — single or multi-part — and self-mark them like the past papers.",
            action: editing ? null : el("button", { class: "btn primary", type: "button", text: "✎ Write questions", onclick: openEditor })
          }));
        }
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
    if (editing) openEditor();          // reopened after a redraw

    /* prev / next */
    var prev = LEAVES[sid][leaf.idx - 1], next = LEAVES[sid][leaf.idx + 1];
    var nav = el("nav", { class: "pn-row", "aria-label": "Neighbouring topics" }, [
      prev ? navBtn(prev, "‹ Previous topic") : el("span", { class: "pn-gap" }),
      next ? navBtn(next, "Next topic ›") : el("span", { class: "pn-gap" })
    ]);
    function navBtn(target, label) {
      var tp = store.peekProgress(sid, target.ref);
      var tStatus = (tp && tp.status) || "none";
      return el("button", {
        class: "pn pn-topic", type: "button", onclick: function () { KOS.show("ref", { subject: sid, ref: target.ref }); }
      }, [
        el("span", { class: "d", text: label }),
        el("span", { class: "pn-t" }, [
          el("span", { class: "st st-" + tStatus, "data-status": tStatus, text: STATUS_GLYPH[tStatus], "aria-label": tStatus, title: tStatus }),
          el("span", { class: "pn-ref", text: target.ref }),
          el("span", { class: "pn-title", text: target.title })
        ])
      ]);
    }
    main.appendChild(nav);
  };

  /* ---------- the study inspector ----------
     Category 7 Phase C: this is now the page's SINGLE state surface.

     Before, the page carried the same state twice — the Topic Status band
     above the content printed mastery, and the inspector printed it again
     280px to the right under its own heading (audit REF-3) — while the four
     material counts appeared both on the tab chips and in an inspector
     "Materials" list (REF-4). Both duplicates are gone. The inspector now
     owns: the Topic Status component itself (status · the four checks ·
     confidence, with the one live mastery readout in its head), the recall
     record, the next review, and the assistant's contextual actions.

     It still computes nothing of its own — every figure comes from
     topicStats(), the same call the status component makes, so a number here
     and a number in the header cannot drift (invariant #26d). */
  function buildInspector(grid, sid, ref, statusComponent, asstStrip) {
    var body = el("div", { class: "insp-body" });

    /* --- state: the Topic Status component, in its new home --- */
    if (statusComponent) body.appendChild(statusComponent);

    function li(k, v, empty) {
      return el("li", { class: empty ? "na" : "" }, [
        el("span", { text: k }), el("strong", { text: empty ? "—" : v })]);
    }
    function count(k, n) { return li(k, String(n), !n); }

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

    /* the assistant's topic actions — off the content path, but still one
       press away and still riding the one shared submission path */
    if (asstStrip) {
      body.appendChild(el("div", { class: "insp-sec insp-asst" }, [
        el("h5", { text: "Ask Kurenai" }), asstStrip
      ]));
    }

    var toggle = el("button", { class: "insp-toggle",
      title: "Collapse / expand the study inspector",
      onclick: function () {
        var closed = KOS.ui.state(grid, "insp-closed");
        store.state.ui.inspectorOpen = !closed;
        store.save();
        paintToggle(closed);
      } });
    function paintToggle(closed) {
      toggle.textContent = closed ? "‹" : "›";
      toggle.setAttribute("aria-expanded", String(!closed));
      toggle.setAttribute("aria-label", closed ? "Expand study inspector" : "Collapse study inspector");
    }
    paintToggle(grid.matches('[data-state~="insp-closed"]'));

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

  /* ---- the topbar listbox (Category 7 Phase F) ----
     The ranking and the domains live in core/search.js; this is only the
     control. It is a real combobox: the input owns `aria-expanded` and
     `aria-activedescendant`, every result is a `role="option"` with an id,
     and the domain headings are `role="group"` wrappers rather than fake
     options \u2014 so \u2193 walks results and never lands on a heading.

     `KOS.search.run` calls back TWICE (memory first, IndexedDB second), so
     every callback re-checks that the query it answers is still the one in
     the box; a slow vault read can never overwrite a newer keystroke. */
  var options = [];          // flat list of the rendered option nodes
  var seq = 0;               // guards against a stale async answer

  function setExpanded(on) {
    KOS.ui.state(resultsEl, "open", !!on);
    input.setAttribute("aria-expanded", String(!!on));
    if (!on) {
      input.removeAttribute("aria-activedescendant");
      selIdx = -1;
    }
  }

  function paint(groups, q, done) {
    resultsEl.innerHTML = "";
    options = [];
    selIdx = -1;
    input.removeAttribute("aria-activedescendant");
    var total = 0;
    groups.forEach(function (g) {
      var wrap = el("div", { class: "k-sr-group", role: "group", "aria-label": g.label });
      wrap.appendChild(el("div", { class: "k-sr-group-h", "aria-hidden": "true" }, [
        el("span", { text: g.label }),
        el("span", { class: "k-sr-group-n", text: String(g.items.length) })
      ]));
      g.items.forEach(function (it) {
        var id = "sr-opt-" + (++optSeq);
        var node = el("div", { class: "k-sr-item", "data-ui": "search.result", role: "option", id: id, "aria-selected": "false" }, [
          el("span", { class: "k-sr-main" }, [
            el("span", { class: "k-sr-title", text: it.title }),
            it.sub ? el("span", { class: "k-sr-sub", "data-ui": "search.result-sub", text: it.sub }) : null
          ].filter(Boolean)),
          it.meta ? el("span", { class: "k-sr-snip", text: it.meta }) : null
        ].filter(Boolean));
        node.addEventListener("click", function () { choose(node); });
        node._open = it.open;
        options.push(node);
        wrap.appendChild(node);
        total++;
      });
      resultsEl.appendChild(wrap);
    });
    if (!total) {
      resultsEl.appendChild(el("div", { class: "k-sr-empty", "data-ui": "search.empty" }, [
        el("b", { text: "Nothing matches \u201C" + q + "\u201D." }),
        el("span", { text: done
          ? "Searched the three specifications, your topic notes, the Collection, reminders, assignments, the calendar, the planner and your goals."
          : "Still searching the Collection\u2026" })
      ]));
    }
    setExpanded(true);
    /* announce the count, not the results \u2014 the list is right there, and
       reading eight titles over the user's typing helps nobody */
    if (done) {
      var counter = document.getElementById("search-count");
      if (counter) {
        counter.textContent = total
          ? total + " result" + (total === 1 ? "" : "s") + " in " + groups.length +
            " section" + (groups.length === 1 ? "" : "s") + ". Use the arrow keys to review."
          : "No results.";
      }
    }
  }
  var optSeq = 0;

  function runSearch(q) {
    var mine = ++seq;
    if (q.trim().length < (KOS.search ? KOS.search.MIN_LEN : 2)) {
      resultsEl.innerHTML = "";
      options = [];
      setExpanded(false);
      return;
    }
    KOS.search.run(q, function (groups, done) {
      if (mine !== seq) return;                 /* a newer keystroke owns the box */
      paint(groups, q, done);
    });
  }

  /* ---- the ONE dismissal path (Category 7 E+F integration) ----
     Phase E's phone presenter MOVES this same #searchbox into a bottom
     sheet and moves it back on close — there is no second search input,
     no second result list and no second controller. What it cannot do
     from outside is retract the controller's state, and hiding the panel
     with a class does not: `aria-expanded` would still say "true" over a
     list that is gone, `aria-activedescendant` would still name a removed
     option, and an in-flight `KOS.search.run` answer (the vault read is
     asynchronous) would repaint the panel after it had been dismissed.

     So dismissal lives here, once, and both presentations call it.
     `preserveQuery` is what the phone sheet wants: closing the sheet is
     not the same act as abandoning the search, so reopening it should
     find the query still there. */
  function dismissSearch(opts) {
    opts = opts || {};
    seq++;                                  /* any pending answer is now stale */
    options = [];
    resultsEl.innerHTML = "";
    setExpanded(false);                     /* clears aria-expanded + activedescendant + selIdx */
    if (!opts.preserveQuery) input.value = "";
    var counter = document.getElementById("search-count");
    if (counter) counter.textContent = "";
  }

  /* A presentation layer (Phase E's phone sheet) needs to know that a
     result was chosen, so it can dismiss itself before the route changes.
     It used to find that out by intercepting the click and the Enter key
     ahead of this controller — which raced it: whichever listener ran
     first won, and on Enter the sheet's close emptied `options` before
     this function could read it, so the sheet closed and nothing
     navigated. The controller announces the decision instead. */
  var chosenListeners = [];
  function onSearchChosen(fn) { if (typeof fn === "function") chosenListeners.push(fn); }

  function choose(node) {
    if (!node || typeof node._open !== "function") return;
    dismissSearch();                        /* a chosen result abandons the query */
    chosenListeners.forEach(function (fn) {
      try { fn(); } catch (e) { /* a presenter must not block navigation */ }
    });
    node._open();                           /* …and the route change is last */
  }

  function moveSel(delta) {
    if (!options.length) return;
    selIdx = (selIdx + delta + options.length) % options.length;
    options.forEach(function (n, i) {
      var on = i === selIdx;
      KOS.ui.state(n, "sel", on);
      n.setAttribute("aria-selected", String(on));
    });
    var cur = options[selIdx];
    input.setAttribute("aria-activedescendant", cur.id);
    if (cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" });
  }

  input.addEventListener("input", function () { runSearch(input.value); });
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") { e.preventDefault(); moveSel(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveSel(-1); }
    else if (e.key === "Home" && options.length) { e.preventDefault(); selIdx = -1; moveSel(1); }
    else if (e.key === "End" && options.length) { e.preventDefault(); selIdx = 0; moveSel(-1); }
    else if (e.key === "Enter" && selIdx >= 0) { e.preventDefault(); choose(options[selIdx]); }
    else if (e.key === "Escape") { e.preventDefault(); dismissSearch({ preserveQuery: true }); input.blur(); }
  });
  document.addEventListener("click", function (e) {
    if (!document.getElementById("searchbox").contains(e.target)) dismissSearch({ preserveQuery: true });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    var a = document.activeElement;
    if (a === input || !a) return;
    /* "/" is a character in a text field and a shortcut everywhere else —
       contenteditable counts as a text field (the assistant composer) */
    if (/INPUT|TEXTAREA|SELECT/.test(a.tagName) || a.isContentEditable) return;
    if (KOS.ui.topDialog && KOS.ui.topDialog()) return;   /* a modal owns the keyboard */
    e.preventDefault();
    input.focus();
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

  KOS.hub = { LEAVES: LEAVES, BYREF: BYREF, COLORS: COLORS, HEX: HEX, esc: esc, search: searchSpec,
    /* the two seams a search PRESENTER needs, and the only two it gets:
       dismissSearch retracts this controller's async and ARIA state,
       onSearchChosen says a result was picked (before the route changes) */
    dismissSearch: dismissSearch, onSearchChosen: onSearchChosen };
})();
