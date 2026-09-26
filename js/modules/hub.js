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
    if (KOS.shell.tree() === "none") return;
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

  /* The opener for a closed spine. It sits in the topic header, so nothing
     floats over the page (audit SUBJ-4); the layer shows it only while the
     spine is closed or an overlay drawer. */
  function treeOpenButton() {
    return el("button", { type: "button", class: "k-iconbtn k-spine-open", "data-ui": "study.spine-open",
      "aria-label": "Show the spec spine", title: "Show the spec spine",
      onclick: function () { setTreeClosed(false); } }, [el("span", { "aria-hidden": "true", text: "☰" })]);
  }

  /* ---------- the spec spine (Graphite frame 8b) ----------
     A subject switch, a filter, the board line with the subject's completion,
     then the sections: a section row is a disclosure (never a destination),
     a group row one level down, and the sub-topics are the entries — each
     with its mastery as a vertical bar and its RAG band as a dot. */
  var spineQuery = "";
  function renderTree(sid, activeRef) {
    var tree = document.getElementById("tree");
    KOS.shell.tree("open");
    applyTreeCollapsed();
    tree.innerHTML = "";
    var data = KOS_DATA[sid];
    var st = subjectStats(sid);
    tree.style.setProperty("--subj-c", SUBJ_HUE[sid]);
    var open = store.state.ui.openSections[sid] = store.state.ui.openSections[sid] || {};

    tree.appendChild(el("div", { class: "k-spine-top" }, [
      el("div", { class: "k-seg k-seg--fill k-spine-subjects", "data-ui": "study.spine-subjects", role: "group", "aria-label": "Subject" }, SUBJECTS.map(function (s) {
        return el("button", { type: "button", class: "k-seg-item", "data-ui": "study.spine-subject-pick",
          "aria-pressed": String(s === sid), "aria-label": KOS_DATA[s].name, text: SUBJ_SHORT[s],
          onclick: function () { KOS.show("subject", s); } });
      })),
      el("button", { type: "button", class: "k-iconbtn k-spine-collapse", "data-ui": "study.spine-collapse",
        "aria-label": "Collapse the spec spine", title: "Collapse the spec spine", text: "‹",
        onclick: function () { setTreeClosed(true); } })
    ]));
    var filter = el("input", { type: "search", class: "k-spine-filter", "data-ui": "study.spine-filter",
      placeholder: "Filter " + st.total + " topics", "aria-label": "Filter topics" });
    filter.value = spineQuery;
    tree.appendChild(el("label", { class: "k-spine-filter-wrap" }, [el("span", { "aria-hidden": "true", text: "⌕" }), filter]));
    tree.appendChild(el("div", { class: "k-spine-board", "data-ui": "study.spine-subject" }, [
      el("div", { class: "k-spine-board-row" }, [
        el("span", { text: data.board }),
        el("span", { class: "k-mono", text: ratioText(st.done, st.total) + " completed" })
      ]),
      el("span", { class: "k-bar", role: "img", "aria-label": st.pct + "% complete", style: "--p: " + st.pct + "%" }, [el("i")])
    ]));

    /* the section that owns the topic on screen opens itself, so the spine
       can always say where you are */
    var activeSection = null;
    if (activeRef) {
      var actLeaf = BYREF[sid] && BYREF[sid][activeRef];
      if (actLeaf && actLeaf.section) {
        activeSection = actLeaf.section.ref;
        open[activeSection] = true;
      }
    }

    var list = el("div", { class: "k-spine-list", "data-ui": "study.spine-list" });
    tree.appendChild(list);
    data.sections.forEach(function (sec) {
      var secEl = el("div", { class: "k-spine-sec", "data-ui": "part.section" });
      var sst = sectionStats(sid, sec);
      var head = el("button", { type: "button", class: "k-spine-head", "data-ui": "ui.section-head",
        "aria-expanded": open[sec.ref] ? "true" : "false",
        onclick: function () {
          open[sec.ref] = !open[sec.ref];
          KOS.ui.state(secEl, "open", !!open[sec.ref]);
          head.setAttribute("aria-expanded", String(!!open[sec.ref]));
          store.save();
        } }, [
        el("span", { class: "k-spine-ref", "data-ui": "part.ref", text: sec.ref }),
        el("span", { class: "k-spine-title", text: sec.title }),
        sst.total ? el("span", { class: "k-bar k-spine-bar", "data-ui": "ui.section-bar", "aria-hidden": "true", style: "--p: " + sst.pct + "%" },
          [el("i", { "data-ui": "study.bar-fill" })]) : null,
        sst.total ? el("span", { class: "k-spine-pc", "data-ui": "part.percent", text: ratioText(sst.done, sst.total) }) : null,
        el("span", { class: "k-spine-arr", "aria-hidden": "true" })
      ].filter(Boolean));
      KOS.ui.state(secEl, "open", !!open[sec.ref]);
      KOS.ui.state(secEl, "here", sec.ref === activeSection);
      secEl.appendChild(head);

      var kids = el("div", { class: "k-spine-kids" });
      if (sec.content && sec.content.length) appendLeaf(kids, sec);
      (sec.children || []).forEach(function (child) { appendNode(kids, child); });
      secEl.appendChild(kids);
      list.appendChild(secEl);

      function appendNode(parentEl, node) {
        var isLeaf = node.content && node.content.length;
        var hasKids = node.children && node.children.length;
        if (isLeaf && !hasKids) { appendLeaf(parentEl, node); return; }
        if (!hasKids) return;
        var gkey = "g:" + node.ref;
        if (open[gkey] === undefined) open[gkey] = true;
        var grpKids = el("div", { class: "k-spine-grpkids", hidden: open[gkey] ? null : "" });
        var gst = sectionStats(sid, node);
        var gbtn = el("button", { type: "button", class: "k-spine-grp", "data-ui": "study.spine-group", "aria-expanded": String(!!open[gkey]),
          onclick: function () {
            open[gkey] = !open[gkey];
            grpKids.hidden = !open[gkey];
            KOS.ui.state(gbtn, "closed", !open[gkey]);
            gbtn.setAttribute("aria-expanded", String(!!open[gkey]));
            store.save();
          } }, [
          el("span", { class: "k-spine-grp-arr", "aria-hidden": "true" }),
          el("span", { class: "k-spine-grp-t", text: node.ref + " · " + node.title }),
          gst.total ? el("span", { class: "k-mono", "data-ui": "study.spine-group-pct", text: ratioText(gst.done, gst.total) }) : null
        ].filter(Boolean));
        if (!open[gkey]) KOS.ui.state(gbtn, "closed", true);
        parentEl.appendChild(gbtn);
        if (isLeaf) appendLeaf(grpKids, node);
        node.children.forEach(function (c) { appendNode(grpKids, c); });
        parentEl.appendChild(grpKids);
      }
      function appendLeaf(parentEl, node) {
        var p = store.peekProgress(sid, node.ref);
        var status = (p && p.status) || "none";
        var band = KOS.rag.effective(sid, node.ref).band;
        var btn = el("button", { type: "button", class: "k-spine-leaf", "data-ui": "study.spine-leaf",
          "data-ref": node.ref, "aria-current": node.ref === activeRef ? "page" : null,
          onclick: function () { KOS.show("ref", { subject: sid, ref: node.ref }); } }, [
          el("span", { class: "k-spine-mastery", "aria-hidden": "true", style: "--p: " + leafPercent(sid, node.ref) + "%" }),
          el("span", { class: "k-spine-leaf-txt" }, [
            el("span", { class: "k-spine-leaf-t", "data-ui": "part.lead", text: node.title, title: node.title }),
            el("span", { class: "k-spine-leaf-ref" }, [
              node.ref,
              KOS.content.has(sid, node.ref) ? el("span", { class: "k-spine-deep", "data-ui": "study.spine-deep", title: "Revision notes on this topic", text: "◆" }) : null
            ].filter(Boolean))
          ]),
          el("span", { class: "k-spine-dot", "data-ui": "part.status", "data-status": status, "data-band": band || null,
            title: (band ? KOS.rag.BANDS[band].label + " · " : "") + (STATUS.filter(function (x) { return x[0] === status; })[0] || [status, status])[1] })
        ]);
        if (node.ref === activeRef) KOS.ui.state(btn, "active", true);
        parentEl.appendChild(btn);
      }
    });

    /* the filter narrows the entries in place: a section with a match opens,
       one without hides; clearing it restores the stored disclosure */
    function applyFilter() {
      var q = spineQuery.trim().toLowerCase();
      list.querySelectorAll("[data-ui~='part.section']").forEach(function (s) {
        var hits = 0;
        s.querySelectorAll("[data-ui~='study.spine-leaf']").forEach(function (lf) {
          var on = !q || lf.textContent.toLowerCase().indexOf(q) !== -1;
          lf.hidden = !on;
          if (on) hits++;
        });
        s.hidden = !!q && !hits;
        KOS.ui.state(s, "filtered", !!q);
      });
    }
    filter.addEventListener("input", function () { spineQuery = filter.value; applyFilter(); });
    if (spineQuery) applyFilter();

    if (activeRef) {
      var act = tree.querySelector("[data-ui~='study.spine-leaf'][data-state~='active']");
      /* "nearest": the spine scrolls only when the active leaf is off its
         own view; never touches #main */
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
    var mode = "overview", head = el("div", { class: "k-cmp-head" }), body = el("div", { class: "k-cmp-body" });

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
      return el("div", { class: "k-cmp-topic", "data-side": side }, [
        el("span", { class: "k-cmp-code", text: (side === "a" ? "A · " : "B · ") + d.code }), el("b", { class: "k-cmp-title", text: d.title }), el("span", { class: "k-cmp-sub", text: d.subject + " · " + d.section }),
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
      var attrs = { class: "k-cmp-row" };
      if (open !== false) attrs.open = true;
      var d = el("details", attrs, [el("summary", { text: title })]);
      var cells = el("div", { class: "k-cmp-cells" }, [render(a, "Topic A"), render(b, "Topic B")]);
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
      } else if (mode === "notes") {
        var pagesA = KOS.content.splitPages(a.content.notes), pagesB = KOS.content.splitPages(b.content.notes);
        for (var page = 0; page < Math.max(pagesA.length, pagesB.length); page++) (function (pa, pb, index) {
          var title = "Notes · " + (pa ? pa.title : "No matching section") + " / " + (pb ? pb.title : "No matching section");
          body.appendChild(details(title, pa, pb, function (p, label) {
            if (!p) return column(label, [], "This topic has no matching note section.");
            var art = el("article", { class: "k-prose k-notes k-cmp-notes", html: KOS.content.renderBlocks(p.blocks) });
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
      var ta = el("textarea", { class: "k-input k-cmp-note-in", rows: "6", "aria-label": "Comparison note", placeholder: "Capture the distinction, shared rule, or question to revisit…" });
      ta.value = notes[key] || "";
      noteOverlay.appendChild(el("div", { class: "k-dialog k-cmp-note", "data-ui": "ui.dialog" }, [
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

    overlay.appendChild(el("div", { class: "k-dialog k-cmp", "data-ui": "ui.dialog study.compare-dialog" }, [
      el("div", { class: "k-dialog-head k-cmp-top", "data-ui": "ui.dialog-head" }, [
        el("div", { class: "k-cmp-intro" }, [el("b", { class: "k-dialog-title", text: "Compare topics" }), el("span", { class: "k-cmp-sub", text: "Line up the syllabus, evidence and exam focus." })]),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", text: "✕", "aria-label": "Close", onclick: close })
      ]),
      el("div", { class: "k-cmp-picks" }, [selA, swap, selB]),
      head, modeBar, body,
      el("div", { class: "k-dialog-foot k-cmp-foot" }, [
        el("button", { type: "button", class: "k-btn", text: "Open Topic A", onclick: function () { var t = topic(selA.value); close(); KOS.show("ref", { subject: t.sid, ref: t.ref }); } }),
        el("button", { type: "button", class: "k-btn", text: "Open Topic B", onclick: function () { var t = topic(selB.value); close(); KOS.show("ref", { subject: t.sid, ref: t.ref }); } }),
        el("button", { type: "button", class: "k-btn", text: "◉ Focus Topic A", onclick: function () { var t = topic(selA.value); close(); KOS.show("focus", { subject: t.sid, ref: t.ref }); } }),
        el("button", { type: "button", class: "k-btn", text: "◉ Focus Topic B", onclick: function () { var t = topic(selB.value); close(); KOS.show("focus", { subject: t.sid, ref: t.ref }); } }),
        el("button", { type: "button", class: "k-btn", text: "✎ Comparison note", onclick: comparisonNote })
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

  /* ---------- the topic page (Graphite frame 8b) ----------
     Content first: the title with its ref, the path under it and the
     neighbouring topics beside it; one static study-nav (the tabs, the Edit
     control, and on a paged note the page control); the material; and the
     inspector as the page's single state surface (invariant 52). */
  KOS.views.ref = function (main, arg) {
    var sid = arg.subject, ref = arg.ref;
    var leaf = BYREF[sid][ref];
    if (!leaf) { KOS.show("subject", sid); return; }
    store.state.ui.lastRef[sid] = ref;
    store.save();
    KOS.shell.bleed(true);
    renderTree(sid, ref);
    var d = KOS_DATA[sid];
    main.style.setProperty("--subj-c", SUBJ_HUE[sid]);
    var content = KOS.content.get(sid, ref);

    /* ---------- the Topic Status component ----------
       Status, the four progress checks and the RAG confidence rating are one
       labelled component under a single live mastery readout, and it lives
       only in the inspector (audit REF-1, REF-3). */
    /* read without materialising a record: a topic page that has only been
       looked at writes nothing (§0.2.3); setStatus/setCheck/setNote create it */
    function prog() {
      return store.peekProgress(sid, ref) || { status: "none", check: [false, false, false, false], note: "" };
    }
    var p = prog();
    var masteryHooks = [];
    function syncMastery() { masteryHooks.forEach(function (f) { f(); }); }

    var ctl = el("section", { class: "k-ts", "data-ui": "topic.control-row topic.status", "aria-label": "Topic status" });
    var tsPct = el("strong", { class: "k-ts-pct", "data-ui": "topic.status-pct" });
    var tsChecks = el("span", { class: "k-ts-checks", "data-ui": "topic.checks" });
    var tsBar = el("span", { class: "k-bar k-bar--6", role: "img" }, [el("i")]);
    function paintStatus() {
      var t = topicStats(sid, ref);
      tsPct.textContent = pctText(t.mastery);
      tsChecks.textContent = t.checkText;
      tsBar.style.setProperty("--p", t.mastery + "%");
      tsBar.setAttribute("aria-label", pctText(t.mastery) + " mastery");
      ["low", "mid", "high"].forEach(function (w) { KOS.ui.state(ctl, w, false); });
      KOS.ui.state(ctl, tone(t.mastery), true);
    }
    masteryHooks.push(paintStatus);

    var statusSelects = [];
    function syncStatusControls() {
      var v = prog().status;
      statusSelects.forEach(function (s) { s.value = v; });
    }
    function statusSelect(id, label) {
      var s = el("select", { class: "k-ts-select", "data-ui": "ui.status-select", id: id, "aria-label": label,
        onchange: function () {
          store.setStatus(sid, ref, s.value);
          renderTree(sid, ref);
          KOS.refreshRailCounters();
          syncStatusControls();
          syncChecks();
          syncMastery();
        } }, STATUS.map(function (st) {
        return el("option", { value: st[0], text: STATUS_GLYPH[st[0]] + " " + st[1] });
      }));
      s.value = prog().status;
      statusSelects.push(s);
      return s;
    }

    /* ---------- the header: title and ref, the path, the neighbours ---------- */
    var prevLeaf = LEAVES[sid][leaf.idx - 1], nextLeaf = LEAVES[sid][leaf.idx + 1];
    function stepBtn(target, dir) {
      return el("button", { type: "button", class: "k-iconbtn", "data-ui": "topic.pager-button topic." + dir,
        "aria-label": (dir === "prev" ? "Previous topic: " : "Next topic: ") + (target ? target.ref + " " + target.title : "none"),
        title: target ? target.ref + " " + target.title : null, disabled: target ? null : "",
        text: dir === "prev" ? "‹" : "›",
        onclick: function () { if (target) KOS.show("ref", { subject: sid, ref: target.ref }); } });
    }
    var path = [d.name].concat(leaf.path);
    var pathLine = el("p", { class: "k-topic-path", "data-ui": "topic.head-meta" });
    path.forEach(function (bit, i) {
      if (i) pathLine.appendChild(el("span", { class: "k-topic-sep", "aria-hidden": "true", text: "/" }));
      pathLine.appendChild(document.createTextNode(bit));
    });
    if (leaf.section.paper) {
      var note = (PAPER_NOTE[sid] || {})[paperLabel(sid, leaf.section.paper)];
      pathLine.appendChild(el("span", { class: "k-topic-sep", "aria-hidden": "true", text: "·" }));
      pathLine.appendChild(document.createTextNode(note ? note[0] : paperLabel(sid, leaf.section.paper)));
    }
    var head = el("header", { class: "k-topic-head", "data-ui": "topic.head" }, [
      el("div", { class: "k-topic-titles" }, [
        el("div", { class: "k-topic-titlerow" }, [
          el("h1", { class: "k-topic-title", text: leaf.title }),
          el("span", { class: "k-topic-ref", "data-ui": "gov.seal", text: leaf.ref })
        ]),
        pathLine
      ]),
      el("div", { class: "k-topic-steps" }, [treeOpenButton(), stepBtn(prevLeaf, "prev"), stepBtn(nextLeaf, "next")])
    ]);

    /* the four checks; marking a topic Completed fills them in the store,
       so the boxes have to say so */
    var boxes = [];
    function syncChecks() {
      var cur = prog();
      boxes.forEach(function (cb, i) {
        cb.checked = !!cur.check[i];
        KOS.ui.state(cb.parentNode, "on", cb.checked);
      });
    }
    var checkGrid = el("div", { class: "k-ts-checkgrid", "data-ui": "topic.checkgrid" });
    CHECKS.forEach(function (label, i) {
      var cb = el("input", { type: "checkbox", class: "k-box", onchange: function () {
        store.setCheck(sid, ref, i, cb.checked);
        renderTree(sid, ref);
        KOS.refreshRailCounters();
        syncStatusControls();
        syncChecks();
        syncMastery();
      } });
      cb.checked = p.check[i];
      boxes.push(cb);
      var row = el("label", { class: "k-ts-check", "data-ui": "topic.check" }, [cb, el("span", { text: label })]);
      if (cb.checked) KOS.ui.state(row, "on", true);
      checkGrid.appendChild(row);
    });

    ctl.appendChild(el("div", { class: "k-ts-head", "data-ui": "topic.status-head" }, [
      el("span", { class: "k-kicker", "data-ui": "topic.status-k", text: "Topic status" }),
      tsChecks, tsPct
    ]));
    ctl.appendChild(tsBar);
    var rag = KOS.rag.picker(sid, ref);
    ctl.appendChild(el("div", { class: "k-ts-row" }, [
      el("div", { class: "k-ts-field", "data-ui": "topic.status-field topic.status-field-status" }, [
        el("label", { class: "sr-only", "data-ui": "topic.status-lbl", for: "ts-status", text: "Status" }),
        statusSelect("ts-status", "Topic status")
      ]),
      el("div", { class: "k-ts-field", "data-ui": "topic.status-field topic.status-field-conf" }, [
        el("span", { class: "sr-only", "data-ui": "topic.status-lbl", text: "Confidence" }), rag.node
      ])
    ]));
    ctl.appendChild(el("div", { class: "k-ts-field", "data-ui": "topic.status-field" }, [
      el("span", { class: "sr-only", "data-ui": "topic.status-lbl", text: "Progress checks" }), checkGrid
    ]));
    ctl.appendChild(rag.auto);
    paintStatus();
    syncStatusControls();

    /* ---------- the study tabs ---------- */
    var gens = content ? KOS.worked.byIds(content.gens) : [];
    (KOS.worked.forRef ? KOS.worked.forRef(sid, ref) : []).forEach(function (g) {
      if (!gens.some(function (x) { return x.id === g.id; })) gens.push(g);
    });
    var sims = (content ? (content.sims || []) : [])
      .map(function (id) { return KOS.sims.get(id); }).filter(Boolean);
    (KOS.sims.forRef ? KOS.sims.forRef(sid, ref) : []).forEach(function (sm) {
      if (!sims.some(function (x) { return x.id === sm.id; })) sims.push(sm);
    });
    var customQuizCount = KOS.srs.customQuizFor(sid, ref).length;
    /* ONE materials tally, printed once — on the tabs (audit REF-4) */
    var mats = {
      cards: KOS.srs.cardsFor(sid, ref).length,
      notes: content && content.notes && content.notes.length
        ? KOS.content.splitPages(content.notes).length : 0,
      quiz: (content && content.quiz ? content.quiz.length : 0) + customQuizCount,
      exam: content && content.exam ? content.exam.length : 0,
      worked: gens.length,
      sim: sims.length
    };
    /* the five editable kinds are always reachable — an empty tab is where
       the material is added; a count prints only when there is one
       (invariant 77) */
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

    var tabBar = el("div", { class: "k-topic-tabs", "data-ui": "ui.tabs topic.tabs", role: "tablist", "aria-label": "Study material" });
    var panel = el("div", { class: "k-topic-panel", "data-ui": "study.panel", role: "tabpanel" });
    var curTab = (content && content.notes && content.notes.length) ? "notes" : "spec";
    var EDIT_KIND = { spec: "spec", notes: "notes", cards: "flashcards", quiz: "quiz", exam: "exam" };
    var editing = store.state.ui.editing;
    if (editing && editing.sid === sid && editing.ref === ref && editing.tab && EDIT_KIND[editing.tab]) curTab = editing.tab;
    else editing = null;

    function selectTab(id) {
      curTab = id;
      paintTabs();
      openTab();
    }
    TABDEFS.forEach(function (t) {
      tabBar.appendChild(el("button", { type: "button", class: "k-topic-tab", "data-ui": "ui.tab", role: "tab",
        "data-tab": t[0], onclick: function () { selectTab(t[0]); } },
        [t[1], t[3] ? el("span", { class: "k-mono", "data-ui": "ui.tab-count", text: String(t[3]) }) : null].filter(Boolean)));
    });
    /* tabs that do not fit fold behind "+N ▾", last first — the open one
       always shows. With the inspector folded (the Files tab) there is room
       for them all (frame 8i). A layout-less document folds nothing. */
    var moreSlot = el("span", { class: "k-topic-more" });
    function paintTabs() {
      var btns = [].slice.call(tabBar.querySelectorAll("[data-ui~='ui.tab']"));
      btns.forEach(function (b) {
        var on = b.dataset.tab === curTab;
        KOS.ui.state(b, "active", on);
        b.setAttribute("aria-selected", String(on));
        b.setAttribute("tabindex", on ? "0" : "-1");
        b.hidden = false;
      });
      moreSlot.innerHTML = "";
      var hidden = [];
      if (tabBar.clientWidth > 0) {
        for (var i = btns.length - 1; i >= 0 && tabBar.scrollWidth > tabBar.clientWidth; i--) {
          if (btns[i].dataset.tab === curTab) continue;
          btns[i].hidden = true;
          hidden.unshift(btns[i]);
          if (i === btns.length - 1 && !moreSlot.children.length) moreSlot.appendChild(el("span", { class: "k-btn k-topic-more-probe", text: "+8" }));
        }
      }
      moreSlot.innerHTML = "";
      if (hidden.length) {
        moreSlot.appendChild(KOS.ui.menu({ label: "+" + hidden.length, className: "k-btn--quiet k-topic-more-btn", hint: "More study material",
          items: hidden.map(function (b) {
            var n = b.querySelector("[data-ui~='ui.tab-count']");
            return { label: b.firstChild.textContent + (n ? " · " + n.textContent : ""),
              onSelect: function () { selectTab(b.dataset.tab); } };
          }) }));
      }
    }
    if (typeof window.ResizeObserver === "function") {
      var lastW = 0;
      try { new window.ResizeObserver(function () { if (tabBar.clientWidth !== lastW) { lastW = tabBar.clientWidth; paintTabs(); } }).observe(tabBar); } catch (e) { /* no layout */ }
    }
    tabBar.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var ids = TABDEFS.map(function (t) { return t[0]; });
      var i = ids.indexOf(curTab) + (e.key === "ArrowRight" ? 1 : -1);
      if (i < 0 || i >= ids.length) return;
      e.preventDefault();
      selectTab(ids[i]);
      var b = tabBar.querySelector('[data-tab="' + ids[i] + '"]');
      if (b) b.focus();
    });

    /* the one Edit control: it edits whatever tab is open, and reads Done
       while the editor is up */
    var editBtn = el("button", { type: "button", class: "k-btn k-btn--sm k-topic-edit", "data-ui": "topic.edit-bar", "aria-pressed": "false",
      onclick: function () { editing ? closeEditor() : openEditor(); } }, [
      el("span", { "aria-hidden": "true", text: "✎" }), el("span", { "data-ui": "topic.edit", text: "Edit" })]);
    var pagerSlot = el("div", { class: "k-topic-pages" });
    var studyNav = el("div", { class: "k-topic-nav", "data-ui": "topic.nav" }, [
      el("div", { class: "k-topic-tabrow" }, [tabBar, moreSlot, editBtn]),
      pagerSlot
    ]);

    var studyGrid = el("div", { class: "k-topic", "data-ui": "study.grid" });
    if (store.state.ui.inspectorOpen === false) KOS.ui.state(studyGrid, "insp-closed", true);
    var studyCol = el("div", { class: "k-topic-col", "data-ui": "study.col" }, [head, studyNav, panel]);
    studyGrid.appendChild(studyCol);
    var asstStrip = KOS.assistant && KOS.assistant.contextActions
      ? KOS.assistant.contextActions("ref", { subject: sid, ref: ref, title: leaf.title })
      : null;
    var inspector = buildInspector(studyGrid, sid, ref, ctl, asstStrip);
    studyGrid.appendChild(inspector);
    var editorHost = el("div", { class: "k-topic-editor", hidden: "" });
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
    function card(label, body, attrs) {
      return el("section", Object.assign({ class: "k-card k-topic-card", "data-ui": "ui.colcard" }, attrs || {}), [
        el("h2", { class: "k-kicker", text: label }), body
      ]);
    }
    function writeBtn(text) {
      return editing ? null : el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: text, onclick: openEditor });
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
      KOS.ui.state(panel, "first-mount", firstMount);
      firstMount = false;
      var tabBtn = tabBar.querySelector('[data-tab="' + curTab + '"]');
      if (tabBtn) {
        if (!tabBtn.id) tabBtn.id = "k-tab-" + curTab;
        panel.setAttribute("aria-labelledby", tabBtn.id);
      }
      /* Build 6.3 — a document preview needs the width far more than the
         inspector does, so the Files tab folds it with the same state the
         toggle uses; ui.inspectorOpen is never rewritten */
      if (curTab === "files") {
        KOS.ui.state(studyGrid, "files-tab", true);
        KOS.ui.state(studyGrid, "insp-closed", true);
      } else if (KOS.ui.hasState(studyGrid, "files-tab")) {
        KOS.ui.state(studyGrid, "files-tab", false);
        KOS.ui.state(studyGrid, "insp-closed", store.state.ui.inspectorOpen === false);
      }
      /* the page control lives in the nav, outside the panel, so a tab
         change clears it too */
      pagerSlot.innerHTML = "";
      panel.innerHTML = "";
      if (curTab === "spec") {
        var specFork = KOS.edits.has(sid, ref, "spec") || editing ? KOS.edits.material(sid, ref, "spec") : null;
        var specL = el("div", { class: "k-prose k-spec", "data-ui": "topic.spec" + (specFork ? " topic.notes" : ""),
          html: specFork ? KOS.content.renderBlocks(specFork.content) : renderSpecContent(leaf.content) });
        var split = el("div", { class: "k-spec-split" }, [card(d.labelL, specL)]);
        var right = el("div", { class: "k-spec-side" });
        if (specFork ? specFork.info.length : leaf.info.length) {
          var specR = el("div", { class: "k-prose k-spec", "data-ui": specFork ? "topic.notes" : null,
            html: specFork ? KOS.content.renderBlocks(specFork.info) : renderSpecInfo(leaf.info) });
          right.appendChild(card(d.labelR, specR));
        }
        renderIntel(right);
        split.appendChild(right);
        panel.appendChild(split);
        if (specFork) { KOS.content.typeset(specL); KOS.content.typeset(split); }
        if (o.reveal) revealBlock(o.reveal);
        var ta = el("textarea", { class: "k-input k-topic-note", "data-ui": "ui.note-area",
          "aria-label": "Your notes on " + leaf.ref,
          placeholder: "Anything you want future-you to remember about " + leaf.ref + "…",
          oninput: debounce(function () { store.setNote(sid, ref, ta.value); }, 350) });
        ta.value = prog().note || "";
        panel.appendChild(card("Your notes on this spec point", ta));
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
            action: writeBtn("✎ Write notes")
          }));
        } else {
          var pages = KOS.content.splitPages(noteBlocks);
          var article = el("article", { class: "k-prose k-notes", "data-ui": "topic.notes" });
          var cur = Math.max(0, Math.min(pages.length - 1, o.keep ? notePage : 0));
          if (o.reveal) {
            pages.forEach(function (pg, i) { if (pg.blocks.some(function (b) { return b && b.id === o.reveal; })) cur = i; });
          }
          if (pages.length > 1) {
            /* one calm way through a note: previous / the named page /
               next, and where you are in the whole */
            var stepPrev = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "topic.reader-step",
              "aria-label": "Previous note page", text: "‹", onclick: function () { showPage(cur - 1, true); } });
            var pageSelect = el("select", { class: "k-topic-page-select", "data-ui": "topic.reader-page-select", "aria-label": "Choose note page",
              onchange: function () { showPage(Number(pageSelect.value), true); } });
            pages.forEach(function (pg, i) {
              pageSelect.appendChild(el("option", { value: String(i), text: "Page " + (i + 1) + " of " + pages.length + " — " + pg.title }));
            });
            var stepNext = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "topic.reader-step",
              "aria-label": "Next note page", text: "›", onclick: function () { showPage(cur + 1, true); } });
            var dots = el("span", { class: "k-topic-dots", "aria-hidden": "true" }, pages.map(function () { return el("span"); }));
            var foot = el("nav", { class: "k-note-foot", "data-ui": "topic.note-foot", "aria-label": "Note pages" });
            pagerSlot.appendChild(el("div", { class: "k-topic-reader", "data-ui": "topic.pager" }, [
              el("span", { class: "k-kicker", text: "Note pages" }), stepPrev, pageSelect, stepNext, dots
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
              [].forEach.call(dots.children, function (dt, j) { KOS.ui.state(dt, "on", j === cur); });
              foot.innerHTML = "";
              foot.appendChild(cur > 0 ? el("button", { type: "button", class: "k-note-step", "data-ui": "topic.page", onclick: function () { showPage(cur - 1, true); } }, [
                el("span", { class: "k-kicker", "data-ui": "part.detail", text: "‹ Previous page" }),
                el("span", { class: "k-note-step-t", text: pages[cur - 1].title })
              ]) : el("span"));
              foot.appendChild(el("span", { class: "k-mono k-muted", "data-ui": "topic.note-count", text: "Page " + (cur + 1) + " of " + pages.length }));
              foot.appendChild(cur < pages.length - 1 ? el("button", { type: "button", class: "k-note-step", "data-ui": "topic.page", "data-state": "next", onclick: function () { showPage(cur + 1, true); } }, [
                el("span", { class: "k-kicker", "data-ui": "part.detail", text: "Next page ›" }),
                el("span", { class: "k-note-step-t", text: pages[cur + 1].title })
              ]) : el("span"));
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
        var fcHolder = el("div", { class: "k-topic-engine", "data-ui": "fc.wrap" });
        panel.appendChild(fcHolder);
        KOS.flashcards.mount(fcHolder, sid, ref, { onEdit: openEditor, editing: !!editing });
      }
      else if (curTab === "quiz") {
        var customN = KOS.srs.customQuizFor(sid, ref).length;
        if (content && content.quiz && content.quiz.length) {
          var qHolder = el("div", { class: "k-topic-engine" });
          panel.appendChild(qHolder);
          KOS.quiz.mountMCQ(qHolder, sid, ref, content.quiz);
        } else if (!customN) {
          panel.appendChild(KOS.ui.emptyState({
            compact: true, mark: "問", title: "No quiz on this topic yet",
            body: "Write multiple-choice questions with an explanation for each — they score and schedule like the curriculum's.",
            action: writeBtn("✎ Write questions")
          }));
        }
        /* custom/AI questions render as their OWN labelled block, never
           mixed into the curriculum, each deletable */
        var customQ = KOS.srs.customQuizFor(sid, ref);
        if (customQ.length) {
          panel.appendChild(el("div", { class: "k-sectionhead" }, [
            el("h2", { text: customQ.length + " custom question" + (customQ.length === 1 ? "" : "s") }),
            el("span", { class: "k-sectionhead-sub", text: "from the assistant or added by you — separate from the curriculum quiz" })
          ]));
          var cqHolder = el("div", { class: "k-topic-engine", "data-ui": "topic.custom-quiz" });
          panel.appendChild(cqHolder);
          KOS.quiz.mountMCQ(cqHolder, sid, ref, customQ);
          var manage = el("div", { class: "k-card k-card--tight", "data-ui": "fc.manage topic.custom-quiz-manage" });
          customQ.forEach(function (cq) {
            manage.appendChild(el("div", { class: "k-card-row", "data-ui": "fc.row" }, [
              el("span", { class: "k-card-row-k k-ellipsis", html: KOS.content.inline(cq.q) }),
              el("span", { class: "k-chip", "data-ui": "fc.custom", "data-tone": cq.ai ? "bloom" : "muted", text: cq.ai ? "AI · Custom" : "Custom" }),
              el("button", { type: "button", class: "k-btn k-btn--sm k-btn--danger", "data-intent": "danger", text: "✕", "aria-label": "Delete question",
                onclick: function () { KOS.srs.deleteCustomQuiz(cq.id); openTab(); } })
            ]));
          });
          panel.appendChild(manage);
        }
      }
      else if (curTab === "exam") {
        if (content && content.exam && content.exam.length) {
          var eHolder = el("div", { class: "k-topic-engine" });
          panel.appendChild(eHolder);
          KOS.quiz.mountExam(eHolder, sid, ref, content.exam);
        } else {
          panel.appendChild(KOS.ui.emptyState({
            compact: true, mark: "試", title: "No exam questions on this topic yet",
            body: "Add exam-style questions with marks and a mark scheme — single or multi-part — and self-mark them like the past papers.",
            action: writeBtn("✎ Write questions")
          }));
        }
      }
      else if (curTab === "worked") {
        /* the first generator opens; the rest wait behind their titles and
           mount on first open (frame 8g) */
        gens.forEach(function (g, i) {
          if (!i) {
            var box = el("section", { class: "k-card k-topic-lab", "aria-label": g.title });
            panel.appendChild(box);
            KOS.worked.mount(box, g, { title: true });
            return;
          }
          var more = el("details", { class: "k-card k-topic-lab k-topic-fold" }, [
            el("summary", {}, [el("span", { class: "k-card-title", text: g.title }), el("span", { class: "k-card-meta", "aria-hidden": "true", text: "expand ▾" })])
          ]);
          more.addEventListener("toggle", function () {
            if (more.open && !more.dataset.mounted) { more.dataset.mounted = "1"; KOS.worked.mount(more, g, { title: false }); }
          });
          panel.appendChild(more);
        });
      }
      else if (curTab === "files") {
        KOS.attach.mountTab(panel, sid, ref);
      }
      else if (curTab === "sim") {
        sims.forEach(function (sm) {
          /* the enrichment layer gates here; the core tabs never do */
          var acc = KOS.governor.simAccess(sm.id);
          if (!acc.ok) { KOS.governor.lockPanel(panel, acc, null, { compact: true, title: sm.title }); return; }
          if (sm.mount) {
            var box = el("section", { class: "k-card k-topic-lab", "aria-label": sm.title }, [
              el("h2", { class: "k-card-title", text: sm.title }),
              el("p", { class: "k-card-meta", text: sm.desc })
            ]);
            panel.appendChild(box);
            sm.mount(box);
          } else {
            panel.appendChild(el("button", { type: "button", class: "k-card k-topic-simlink", onclick: function () { KOS.sims.open(sm.id); } }, [
              el("span", { class: "k-card-title", text: sm.title + " →" }),
              el("span", { class: "k-card-meta", text: sm.desc })
            ]));
          }
        });
      }
    }

    /* the examiner's guidance on this spec point, as the spec tab's callouts */
    function renderIntel(into) {
      var intel = KOS_DATA.intel[sid + ":" + ref];
      if (!intel) return;
      function callout(kind, mark, title, body, hook) {
        return el("aside", { class: "k-callout", "data-kind": kind, "data-ui": hook || null }, [
          el("div", { class: "k-callout-head" }, [el("span", { class: "k-callout-mark", "aria-hidden": "true", text: mark }), title]),
          body
        ]);
      }
      if (intel.defs && intel.defs.length) {
        var dl = el("dl", { class: "k-callout-dl" });
        intel.defs.forEach(function (kv) {
          dl.appendChild(el("dt", { text: kv[0] }));
          dl.appendChild(el("dd", { text: kv[1] }));
        });
        into.appendChild(callout("def", "❝", "Definition box — wording the board rewards", dl, "topic.intel-defs"));
      }
      if (intel.tips && intel.tips.length) {
        into.appendChild(callout("tip", "✦", "Chief examiner intel — how marks are won",
          el("ul", {}, intel.tips.map(function (t) { return el("li", { text: t }); })), "topic.intel-tips"));
      }
      if (intel.pitfalls && intel.pitfalls.length) {
        into.appendChild(callout("warn", "⚠", "Pitfalls — where marks routinely die",
          el("ul", {}, intel.pitfalls.map(function (t) { return el("li", { text: t }); })), "topic.intel-pit"));
      }
    }

    paintTabs();
    openTab();
    if (editing) openEditor();          // reopened after a redraw
  };

  /* ---------- the study inspector ----------
     The page's SINGLE state surface: the Topic Status component (status,
     the four checks, confidence, under the one live mastery readout), the
     recall record, the next review and the assistant's topic actions.
     Every figure comes from topicStats(), the call the status component
     makes, so nothing here can drift (invariant 26d). */
  function buildInspector(grid, sid, ref, statusComponent, asstStrip) {
    var body = el("div", { class: "k-insp-body", "data-ui": "topic.inspector-body" });
    if (statusComponent) body.appendChild(statusComponent);

    function li(k, v, empty) {
      return el("li", { "data-state": empty ? "na" : null }, [
        el("span", { text: k }), el("strong", { text: empty ? "—" : v })]);
    }
    function count(k, n) { return li(k, String(n), !n); }
    function sec(title, items) {
      return el("section", { class: "k-insp-sec", "aria-label": title }, [
        el("h2", { class: "k-kicker", text: title }),
        el("ul", { class: "k-insp-list", "data-ui": "topic.inspector-list" }, items)
      ]);
    }

    var t = topicStats(sid, ref);
    var qz = t.quiz;
    body.appendChild(sec("Recall record", [
      count("Card views", t.seen),
      li("Recall accuracy", t.accuracy == null ? "" : pctText(t.accuracy), t.accuracy == null),
      count("Lapses", t.lapses),
      li("Quiz best", qz && qz.best != null ? pctText(qz.best) : "", !(qz && qz.best != null)),
      count("Quiz attempts", qz ? qz.attempts || 0 : 0),
      count("Exam questions logged", t.examLogged)
    ]));
    var nextTxt = t.due ? t.due + " due now" : t.next ? t.next : t.reviewed ? "all scheduled" : "";
    body.appendChild(sec("Next review", [
      li("Review queue", nextTxt, !nextTxt),
      li("Cards scheduled", ratioText(t.reviewed, t.cards), !t.cards),
      li("Sessions here", t.sessions + (t.minutes ? " · " + t.minutes + " min" : ""), !t.sessions)
    ]));
    if (asstStrip) {
      body.appendChild(el("section", { class: "k-insp-sec k-insp-asst", "aria-label": "Ask Kurenai" }, [
        el("h2", { class: "k-kicker", text: "Ask Kurenai" }), asstStrip
      ]));
    }

    var toggle = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "topic.inspector-toggle",
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

    return el("aside", { class: "k-insp", "data-ui": "topic.inspector", "aria-label": "Study inspector" }, [
      el("div", { class: "k-insp-head" }, [
        el("span", { class: "k-insp-title", text: "Inspector" }),
        /* the collapsed panel keeps a readable spine so it can be found */
        el("span", { class: "k-insp-spine", "data-ui": "topic.inspector-spine", "aria-hidden": "true", text: "Inspector" }),
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

  /* ---------- Backup & Restore (Graphite step 8, frames 14a, 14a2) ----------
     "Keep it safe" — the last backup from THIS device and the three
     export/import actions — beside the Account & Cloud Sync card; what a
     backup covers, with the counts as they stand; and Reset everything as
     its own danger strip, which asks for the word RESET. Rendering reads
     only: the counts come from the stores that own them, the size from
     the browser's storage estimate. The one write here is the export
     noting when it ran (ui.lastBackupAt — per device, like all of ui). */
  function mb(bytes) {
    return bytes >= 1048576 ? (Math.round(bytes / 104857.6) / 10) + " MB" : Math.max(1, Math.round(bytes / 1024)) + " KB";
  }
  function agoWords(ts) {
    var days = Math.floor((Date.now() - ts) / 864e5);
    return days <= 0 ? "today" : days === 1 ? "yesterday" : days + " days ago";
  }
  function plural(n, one, many) { return KOS.ui.num(n) + " " + (n === 1 ? one : (many || one + "s")); }
  function arrLen(v) { return Array.isArray(v) ? v.length : v && typeof v === "object" && Array.isArray(v.items) ? v.items.length : 0; }

  KOS.views.data = function (main) {
    hideTree();
    var s = store.state;
    main.appendChild(KOS.ui.pageHeader({ kicker: "The archive · 蔵", title: "Backup & Restore",
      sub: "Everything KurenaiOS knows lives on this device first. Keep a copy, move it, or start again." }));

    /* ---- keep it safe ---- */
    var last = s.ui && s.ui.lastBackupAt;
    var sizeFact = el("b", { class: "k-bk-fact-v", text: "—" });
    var cloudFact = el("b", { class: "k-bk-fact-v", text: cloudWord() });
    function cloudWord() {
      if (!KOS.cloud || !KOS.cloud.configured || !KOS.cloud.configured()) return "not set up";
      if (!KOS.cloud.userId || !KOS.cloud.userId()) return "signed out";
      var st = KOS.cloudsync ? KOS.cloudsync.getStatus() : null;
      return st ? ({ synced: "on", syncing: "syncing…", pending: "changes pending", offline: "offline", error: "needs attention" }[st.state] || st.state) +
        (st.lastSyncAt ? " · " + agoWords(st.lastSyncAt).replace("today", clockOf(st.lastSyncAt)) : "") : "on";
    }
    function clockOf(ts) { return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); }
    /* the fact follows the engine while it is on screen (sync starts after boot) */
    if (KOS.cloudsync && KOS.cloudsync.onStatus) KOS.cloudsync.onStatus(function () { if (cloudFact.isConnected) cloudFact.textContent = cloudWord(); });
    if (navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then(function (e) { if (e && e.usage) sizeFact.textContent = mb(e.usage); else sizeFact.textContent = "unknown"; })
        .catch(function () { sizeFact.textContent = "unknown"; });
    } else sizeFact.textContent = "unknown";

    var exportBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Export full backup (.json)",
      onclick: function () {
        exportBtn.disabled = true;
        exportBtn.textContent = "Exporting…";
        store.exportFull(function (err) {
          exportBtn.disabled = false;
          exportBtn.textContent = "Export full backup (.json)";
          if (err) { KOS.ui.toast("Export error: " + err.message, true); return; }
          store.state.ui.lastBackupAt = Date.now();
          store.save();
          lastLine.textContent = "Last backup today";
          lastSub.textContent = new Date().toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + " · downloaded from this device";
        });
      }});
    var file = el("input", { type: "file", accept: ".json,application/json", hidden: "",
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
    var importBtn = el("button", { type: "button", class: "k-btn", text: "Import backup…", title: "A complete restore, not a merge: the file replaces what's here",
      onclick: function () { file.click(); } });
    var lastLine = el("h2", { class: "k-bk-last", text: last ? "Last backup " + agoWords(last) : "No backup from this device yet" });
    var lastSub = el("p", { class: "k-bk-last-sub", text: last
      ? new Date(last).toLocaleString("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) + " · downloaded from this device"
      : "One file with everything in it. Large attachments make a large file; that's expected." });
    var saved = Object.keys(s.progress).length;
    var hero = el("section", { class: "k-bk-hero", "data-ui": "archive.keep", "aria-label": "Keep it safe" }, [
      el("span", { class: "k-watermark k-bk-mark", lang: "ja", "aria-hidden": "true", text: "蔵" }),
      el("div", { class: "k-kicker k-bk-kicker", text: "Keep it safe" }),
      lastLine, lastSub,
      el("div", { class: "k-bk-facts" }, [
        el("div", {}, [el("span", { class: "k-bk-fact-k", text: "Cloud sync" }), cloudFact]),
        el("div", {}, [el("span", { class: "k-bk-fact-k", text: "Stored on this device" }), sizeFact]),
        saved ? el("div", {}, [el("span", { class: "k-bk-fact-k", text: "Keeping since" }), el("b", { class: "k-bk-fact-v", text: new Date(s.created).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) })]) : null
      ].filter(Boolean)),
      el("div", { class: "k-bk-actions", "data-ui": "archive.data-action" }, [
        exportBtn, importBtn,
        el("button", { type: "button", class: "k-btn", text: "Export revision summary (print / PDF)", title: "A printable table of every spec point, its status and your notes", onclick: exportSummary }),
        file
      ])
    ]);
    var top = el("div", { class: "k-bk-top" }, [hero]);
    if (KOS.cloudui) top.appendChild(KOS.cloudui.panel());
    main.appendChild(top);

    /* ---- what a backup covers, counted now ---- */
    var covers = el("section", { class: "k-card k-bk-covers", "aria-label": "What a backup covers" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "What a backup covers" }), el("span", { class: "k-card-meta", text: "counts right now" })])
    ]);
    function cover(mark, tone, text) {
      var count = el("span", { class: "k-bk-count" });
      covers.appendChild(el("div", { class: "k-bk-cover" }, [
        el("span", { class: "k-bk-tile", "data-tone": tone, lang: "ja", "aria-hidden": "true", text: mark }),
        el("span", { class: "k-bk-cover-t", text: text }), count
      ]));
      return count;
    }
    function facts(bits) { return bits.filter(Boolean).join(" · "); }
    var g = s.governor || {};
    var owned = KOS.governor ? KOS.governor.catalog().filter(function (c) { return KOS.governor.owns(c.id); }).length : 0;
    var edited = Object.keys((s.edits && s.edits.topics) || {}).length, cards = Object.keys(s.srs || {}).length;
    cover("学", "teal", "Study progress, notes, edited topics and flashcard scheduling").textContent = facts([
      saved ? plural(saved, "topic") + " with progress" : null, cards ? plural(cards, "scheduled card") : null, edited ? plural(edited, "edited topic") : null]);
    cover("整", "amber", "Calendar, reminders, assignments, habits and the weekly plan").textContent = facts([
      arrLen(s.calendar && s.calendar.events) ? plural(arrLen(s.calendar.events), "event") : null,
      arrLen(s.reminders) ? plural(arrLen(s.reminders), "reminder") : null,
      arrLen(s.assignments) ? plural(arrLen(s.assignments), "assignment") : null]);
    cover("守", "gold", "Governor state: HP, gold, XP and everything you own").textContent = facts([
      KOS.governor ? "Level " + KOS.governor.levelInfo(g.xp || 0).level : null, "◆ " + KOS.ui.num(g.gold || 0), owned ? plural(owned, "item") + " owned" : null]);
    var mediaCount = cover("蒐", "anime", "The whole media vault: anime, books, visual novels and games, with routes, quotes and physical volumes");
    if (KOS.mediadb && KOS.mediadb.available && KOS.mediadb.available()) KOS.mediadb.count(null, function (err, n) { if (!err && n) mediaCount.textContent = plural(n, "entry", "entries"); });
    var wl = s.wishlist || {};
    cover("円", "books", "The purchase planner and budget history").textContent = facts([
      arrLen(wl.items) ? plural(arrLen(wl.items), "item") : null,
      wl.budget && arrLen(wl.budget.history) ? plural(arrLen(wl.budget.history), "purchase") + " logged" : null]);
    var fileCount = cover("⎘", "muted", "Document attachments");
    if (KOS.attach && KOS.attach.available && KOS.attach.available() && KOS.attach.listMeta) KOS.attach.listMeta(function (err, rows) {
      if (err || !rows.length) return;
      fileCount.textContent = plural(rows.length, "file") + " · " + mb(rows.reduce(function (a, r) { return a + (r.size || 0); }, 0));
    });
    covers.appendChild(el("p", { class: "k-bk-note", text: "AniList and VNDB tokens and your cloud password are deliberately left out: a backup file can end up in less careful places than your browser. After a restore, reconnect from Sync & Import." }));
    main.appendChild(covers);

    /* ---- reset: its own strip, and a word to type ---- */
    main.appendChild(el("section", { class: "k-bk-danger", "aria-label": "Reset everything" }, [
      el("div", { class: "k-bk-danger-txt" }, [
        el("b", { text: "Reset everything" }),
        el("p", { text: "Clears this device back to a fresh install. Export a backup first; cloud data is not deleted, and a signed-in device syncs back down." })
      ]),
      el("button", { type: "button", class: "k-btn k-btn--danger", "data-intent": "danger", text: "Reset everything…", onclick: function () { resetDialog(exportBtn); } })
    ]));
  };

  function resetDialog(exportBtn) {
    var input = el("input", { type: "text", class: "k-input k-bk-type", autocomplete: "off", spellcheck: "false",
      "aria-label": "Type RESET to confirm", placeholder: "RESET" });
    var go = el("button", { type: "button", class: "k-btn k-btn--danger", "data-intent": "danger", text: "Reset", disabled: "" });
    var box = el("div", { class: "k-dialog k-bk-reset", "data-ui": "ui.dialog archive.reset", role: "alertdialog" }, [
      el("span", { class: "k-bk-reset-mark", lang: "ja", "aria-hidden": "true", text: "消" }),
      el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Reset everything?" }),
      el("p", { class: "k-bk-reset-p", text: "This removes study progress, notes, flashcard schedules, the Governor, the media vault, the planner and every attachment from this device. It cannot be undone here." }),
      el("label", { class: "k-field" }, [el("span", { class: "k-field-label" }, ["Type ", el("b", { class: "k-mono", text: "RESET" }), " to confirm"]), input]),
      el("div", { class: "k-bk-reset-btns" }, [
        el("button", { type: "button", class: "k-btn", text: "Export backup first", onclick: function () { overlay.remove(); exportBtn.click(); } }),
        el("button", { type: "button", class: "k-btn k-bk-cancel", text: "Cancel", onclick: function () { overlay.remove(); } }),
        go
      ])
    ]);
    var overlay = el("div", { class: "k-dialog-overlay", onclick: function (e) { if (e.target === overlay) overlay.remove(); } }, [box]);
    input.addEventListener("input", function () { go.disabled = input.value.trim() !== "RESET"; });
    /* Enter never confirms a danger dialog (invariant 49) */
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") e.preventDefault(); });
    go.addEventListener("click", function () {
      if (input.value.trim() !== "RESET") return;
      overlay.remove();
      store.reset(); KOS.refreshRailCounters(); KOS.ui.toast("Fresh start."); KOS.show("home");
    });
    /* headless harnesses confirm through the same hook KOS.ui.confirm honours */
    if (window.__kosAutoConfirm === true) { store.reset(); KOS.refreshRailCounters(); KOS.show("home"); return; }
    KOS.ui.openDialog(overlay, { initialFocus: input });
  }

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
      ".k-ref{font-family:monospace;white-space:nowrap}" +
      "[data-s=done]{color:#0a7a52;font-weight:700}[data-s=started]{color:#9a6d00}[data-s=paused]{color:#7a3fa0}[data-s=none]{color:#888}" +
      ".k-note{font-style:italic;color:#444}" +
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
            h += "<tr><td class='k-ref'>" + esc(n.ref) + "</td><td>" + esc(n.title) +
              "</td><td data-s='" + status + "'>" + STATUS_WORD[status] + "</td><td class='k-note'>" +
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
        flush(); out += '<p class="k-spec-h">' + esc(s.replace(/\s*To$/, "")) + "</p>"; return;
      }
      if (it.kind === "box") {                               // a □ heading if a sub-item follows
        var nx = items[idx + 1];
        if (nx && (nx.kind === "bullet" || nx.kind === "sub2")) { flush(); out += '<p class="k-spec-h">' + esc(s) + "</p>"; return; }
        buf.push("<li>" + esc(s) + "</li>"); return;
      }
      if (it.kind === "bullet") { buf.push("<li>" + esc(s) + "</li>"); return; }
      if (it.kind === "sub2") { buf.push('<li class="k-spec-sub">' + esc(s) + "</li>"); return; }
      if (/\so\s/.test(s)) {                                 // garbled "A o B" merge → split
        s.split(/\s+o\s+/).forEach(function (p) { p = p.trim(); if (p) buf.push("<li>" + esc(p) + "</li>"); }); return;
      }
      var nx2 = items[idx + 1];                              // ":"-lead-in introducing a list → highlighted
      if (/:\s*$/.test(s) && nx2 && (nx2.kind === "bullet" || nx2.kind === "sub2")) {   // header (parity w/ IT spec tabs)
        flush(); out += '<p class="k-spec-h">' + esc(s.replace(/:\s*$/, "")) + "</p>"; return;
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
        if (seg) html += '<p class="k-spec-h">' + markers[i].label + "</p>" + ul(seg);
      }
      return html || "<p>" + esc(text) + "</p>";
    }
    /* multi-line array: clean override (IT F201) or already-clean CS/Maths */
    var out = "", buf = [];
    function flush() { if (buf.length) { out += "<ul>" + buf.join("") + "</ul>"; buf = []; } }
    lines.forEach(function (raw) {
      var t = String(raw).trim();
      if (/^to include:?$/i.test(t)) { flush(); out += '<p class="k-spec-h">To include</p>'; return; }
      if (/^does not include:?$/i.test(t)) { flush(); out += '<p class="k-spec-h">Not included</p>'; return; }
      var it = specLine(raw);
      if (!it.text) return;
      if (it.kind === "none") { flush(); out += "<p>" + esc(it.text) + "</p>"; }
      else buf.push((it.kind === "sub2" ? '<li class="k-spec-sub">' : "<li>") + esc(it.text) + "</li>");
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
