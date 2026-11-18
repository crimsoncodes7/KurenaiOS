/* Kurenai OS — modules/hub.js
   The Revision Hub's shared core: the curriculum flattened into leaves, every
   study derivation (invariant 26d), IT grades, the rail counters, the spec spine,
   and the spec renderers. Its pages are their own files (W8, AP-09): home.js,
   subject.js, topic.js, dataview.js and searchui.js, each loaded right after it. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store;

  /* the subject list and hues come from the one registry (core/subjects.js) */
  var SUBJECTS = KOS.subjects.ids();
  /* the study spaces count lessons, the A-levels topics */
  var LESSONISH = { code: 1, ja: 1, mind: 1, creatives: 1 };
  var COLORS = KOS.subjects.map("hue");
  var HEX = KOS.subjects.map("hex");
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
  /* a topic's flashcard words, for search. A subject whose content has not
     loaded yet (js/core/lazy.js) has none until it does: the first search
     asks for every subject's content and the index fills in as it lands. */
  function cardText(sid, ref) {
    var deep = window.KOS_CONTENT[sid + ":" + ref];
    if (!deep || (KOS.lazy && KOS.lazy.isStub(deep)) || !deep.flashcards) return "";
    return deep.flashcards.map(function (c) { return c[0] + " " + c[1]; }).join(" ").toLowerCase();
  }
  var searchWarm = false;
  function warmSearch() {
    if (searchWarm || !KOS.lazy) return;
    searchWarm = true;
    var want = KOS.lazy.names().filter(function (n) { return /^content-/.test(n); });
    KOS.lazy.need(want).then(function () {
      /* the box still holds a query: ask it again, now with the cards */
      var box = document.getElementById("search");
      if (box && box.value && document.activeElement === box) box.dispatchEvent(new Event("input", { bubbles: true }));
    }, function () { searchWarm = false; });
  }
  if (KOS.lazy) KOS.lazy.on(function (name) {
    SEARCH_INDEX.forEach(function (it) {
      if (KOS.lazy.contentOf(it.subject) === name) it.fctext = cardText(it.subject, it.ref);
    });
  });

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
          SEARCH_INDEX.push({
            subject: sid, ref: node.ref, title: node.title,
            text: (node.title + " " + node.content.join(" ") + " " + (node.info || []).join(" ")).toLowerCase(),
            fctext: cardText(sid, node.ref)
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
  /* IT's review analytics leave the units done at school out (5.19 item 2) */
  function inReview(sid, ref) { return sid !== "it" || !KOS.itUnits || KOS.itUnits.inReview(ref); }
  function subjectCardStats(sid) {
    var today = KOS.srs.todayISO();
    var out = { total: 0, reviewed: 0, due: 0, recall: null }, rs = 0, rn = 0;
    LEAVES[sid].forEach(function (l) {
      if (!inReview(sid, l.ref)) return;
      KOS.srs.cardsFor(sid, l.ref).forEach(function (c) {
        out.total++;
        var m = KOS.srs.peek(c.key);
        if (!m || !m.due) return;
        out.reviewed++;
        if (m.due <= today) out.due++;
        /* recall today, the mean over rated cards (the review strip, 44e) */
        var mem = !c.redo && KOS.srs.memory(c.key, today);
        if (mem) { rs += mem.r; rn++; }
      });
    });
    if (rn) out.recall = Math.round(100 * rs / rn);
    return out;
  }
  /* the subject's timed papers, oldest first (the review strip's Papers) */
  function subjectPapers(sid) {
    if (!KOS.tracker || !KOS.tracker.all) return [];
    return KOS.tracker.all().filter(function (e) {
      return e.subject === sid && e.timed && e.max && e.marks != null && (!e.ref || inReview(sid, e.ref));
    }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
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
    /* a switched Focus session counts here for the stretch on this topic */
    var onTopic = function (p) { return p.subject === sid && p.ref === ref; };
    var sess = KOS.sessions.all().filter(function (e) { return KOS.sessions.parts(e).some(onTopic); });
    t.sessions = sess.length;
    t.minutes = Math.round(sess.reduce(function (a, e) {
      return a + KOS.sessions.parts(e).reduce(function (n, p) { return onTopic(p) ? n + p.secs : n; }, 0);
    }, 0) / 60);
    t.examLogged = sess.filter(function (e) { return e.type === "exam"; }).length;
    /* topic memory (FSRS phase 2): recall today, Rework, held for an exam */
    t.memory = KOS.srs.topicMemory(sid, ref, today);
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
  /* ---------- IT units: grades, aggregate, marks needed (roadmap 1.2) ----------
     Derived here and nowhere else (invariant 26d) from KOS.itUnits (the
     marks) and js/data/it-grades.js (the scales and boundaries). A unit
     marked not-taken is absent from every figure (invariant 77). A grade
     below Pass is null — the page decides how to say so. Boundaries that are
     not checked against OCR would be reported (`provisional`), never hidden. */
  function itTable() { return window.KOS_IT_GRADES || { grades: [], units: {}, qualifications: {}, unitBoundaries: [] }; }
  function itGradeFor(ums, boundaries) {
    if (ums == null) return null;
    for (var i = 0; i < boundaries.length; i++) if (ums >= boundaries[i].ums) return boundaries[i].grade;
    return null;
  }
  function itProvisional(boundaries) { return boundaries.some(function (b) { return !b.confirmed; }); }
  /* a unit's UMS: the stored UMS, else raw on the unit's linear scale
     (exam 1 : 1, NEA 1 : 2.5), rounded down and flagged as an estimate */
  function itUms(u) {
    var sc = itTable().units[u.code];
    if (!sc) return null;
    if (u.ums != null) return { ums: u.ums, estimated: false };
    if (u.raw != null) return { ums: Math.floor(u.raw * sc.umsMax / sc.rawMax), estimated: true };
    return null;
  }
  /* `preview` ({code: {raw} | {ums}}) reads a mark being typed as if it
     were saved — the page previews what a result would do; nothing is
     written (frame 18b) */
  function itUnitRows(preview) {
    if (!KOS.itUnits) return [];
    var T = itTable();
    return KOS.itUnits.all().filter(function (u) { return u.status !== "not-taken"; }).map(function (u) {
      if (preview && preview[u.code]) {
        var pv = preview[u.code];
        u = Object.assign({}, u, { status: "done", raw: pv.ums != null ? null : pv.raw, ums: pv.ums != null ? pv.ums : null });
      }
      var sc = T.units[u.code], node = KOS.spec ? KOS.spec.node("it", u.code) : null, m = itUms(u);
      return {
        code: u.code, title: node ? node.title : u.code, kind: sc.kind,
        status: u.status, year: u.year, series: u.series, date: u.date,
        raw: u.raw, rawMax: sc.rawMax,
        ums: m ? m.ums : null, umsMax: sc.umsMax, estimated: !!(m && m.estimated),
        pct: m ? pctOf(m.ums, sc.umsMax) : null,
        grade: m ? itGradeFor(m.ums, T.unitBoundaries) : null,
        provisional: itProvisional(T.unitBoundaries)
      };
    });
  }
  /* the qualification total over the units counted so far */
  function itAggregate(qualId, preview) {
    var T = itTable(), id = qualId || T.current, q = T.qualifications[id];
    if (!q) return null;
    var rows = {};
    itUnitRows(preview).forEach(function (r) { rows[r.code] = r; });
    var counted = q.units.filter(function (c) { return rows[c]; }).map(function (c) { return rows[c]; });
    var banked = 0, bankedMax = 0, max = 0, remaining = [], estimated = false;
    counted.forEach(function (r) {
      max += r.umsMax;
      if (r.ums == null) { remaining.push(r.code); return; }
      banked += r.ums; bankedMax += r.umsMax;
      if (r.estimated) estimated = true;
    });
    return {
      id: id, name: q.name, units: counted.map(function (r) { return r.code; }),
      banked: banked, bankedMax: bankedMax, max: max,
      remaining: remaining, remainingMax: max - bankedMax,
      complete: !remaining.length && counted.length > 0,
      /* a final grade needs every unit in; a running one is the share so far */
      grade: !remaining.length && counted.length ? itGradeFor(banked, q.boundaries) : null,
      /* the pace so far: the banked share read against the boundaries
         scaled to the units counted — "105 / 120 so far is a Distinction" */
      soFar: bankedMax ? itGradeFor(banked * max / bankedMax, q.boundaries) : null,
      pct: pctOf(banked, bankedMax),
      estimated: estimated,
      boundaries: q.boundaries.map(function (b) { return { grade: b.grade, ums: b.ums, confirmed: !!b.confirmed }; }),
      provisional: itProvisional(q.boundaries)
    };
  }
  /* "marks needed for <target>": the least UMS still to earn across the
     remaining units, spread evenly, and what that is in raw marks on each
     paper. `secured` when the banked total already reaches it; not
     `achievable` when even full marks would fall short. */
  function itNeeded(target, qualId, preview) {
    var agg = itAggregate(qualId, preview);
    if (!agg) return null;
    var grade = target || (KOS.itUnits ? KOS.itUnits.target() : null);
    var b = agg.boundaries.filter(function (x) { return x.grade === grade; })[0];
    if (!b) return null;
    var need = Math.max(0, b.ums - agg.banked);
    var n = agg.remaining.length;
    var perUnit = n ? Math.ceil(need / n) : null;
    var T = itTable();
    return {
      target: grade, threshold: b.ums, confirmed: b.confirmed,
      banked: agg.banked, need: need,
      remaining: agg.remaining, remainingMax: agg.remainingMax,
      secured: agg.banked >= b.ums,
      achievable: need <= agg.remainingMax,
      perUnit: perUnit,
      /* the same share as raw marks on each remaining paper */
      perPaper: agg.remaining.map(function (c) {
        var sc = T.units[c];
        return { code: c, ums: perUnit, raw: perUnit == null ? null : Math.min(sc.rawMax, Math.ceil(perUnit * sc.rawMax / sc.umsMax)), rawMax: sc.rawMax };
      })
    };
  }

  /* once every unit is in (frame 18c): how far over its line the final
     grade sits, how far the next grade up was, and the best and lowest unit */
  function itClose(qualId) {
    var agg = itAggregate(qualId);
    if (!agg || !agg.complete) return null;
    var bs = agg.boundaries, i = -1;
    for (var k = 0; k < bs.length; k++) if (bs[k].grade === agg.grade) { i = k; break; }
    var rows = itUnitRows().filter(function (r) { return agg.units.indexOf(r.code) !== -1 && r.ums != null; });
    rows.sort(function (a, b) { return b.ums - a.ums; });
    return {
      grade: agg.grade,
      over: i >= 0 ? agg.banked - bs[i].ums : null,
      next: i > 0 ? { grade: bs[i - 1].grade, gap: bs[i - 1].ums - agg.banked } : null,
      best: rows[0] || null,
      lowest: rows.length > 1 ? rows[rows.length - 1] : null
    };
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
    if (KOS.code && document.getElementById("pc-code-due")) count("pc-code-due", KOS.code.dueCards().length);
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
  /* The drawer (≤860: an iPad in portrait, a phone) is opened for one visit
     and never saved: the remembered choice belongs to the column, so turning
     an iPad from landscape to portrait never lays the drawer over the page.
     Navigating or crossing the tier closes it. */
  var drawerOpen = false;
  function applyTreeCollapsed() {
    var closed = treeIsOverlay() ? !drawerOpen : store.state.ui.treeClosed === true;
    /* a view with no spine only remembers the preference; it never shows one */
    if (KOS.shell.tree() === "none") return;
    KOS.shell.tree(closed ? "closed" : "open");
  }
  function setTreeClosed(closed) {
    if (treeIsOverlay()) drawerOpen = !closed;
    else {
      store.state.ui.treeClosed = !!closed;
      store.save();
    }
    applyTreeCollapsed();
  }
  window.addEventListener("hashchange", function () { drawerOpen = false; });
  if (typeof window.matchMedia === "function") {
    var treeMQ = window.matchMedia(TREE_OVERLAY_Q);
    var onTier = function () { drawerOpen = false; applyTreeCollapsed(); };
    if (treeMQ.addEventListener) treeMQ.addEventListener("change", onTier);
    else if (treeMQ.addListener) treeMQ.addListener(onTier);
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
    /* Code's spine shows one group at a time — the core path or the tracks —
       and the count, the filter and the list follow the group shown */
    var codeMode = sid === "code" && KOS.codeTopic ? KOS.codeTopic.spineMode(activeRef) : null;
    var sections = !codeMode ? data.sections : data.sections.filter(function (sec) { return codeMode === "tracks" ? !!sec.track : !sec.track; });
    /* IT (5.19 item 2): a unit done at school leaves the spine unless "Show
       completed units" is on; the open topic's own unit always stays */
    var itU = sid === "it" && KOS.itUnits ? KOS.itUnits : null;
    var itHidden = itU ? data.sections.filter(function (sec) { return itU.archived(sec.ref); }).length : 0;
    if (itU) sections = sections.filter(function (sec) { return itU.visible(sec.ref) || (activeRef && itU.unitOf(activeRef) === sec.ref); });
    if (codeMode) st = sections.reduce(function (a, sec) { var x = sectionStats(sid, sec); a.done += x.done; a.total += x.total; a.pct = a.total ? Math.round(100 * a.done / a.total) : 0; return a; }, { done: 0, total: 0, pct: 0 });
    tree.style.setProperty("--subj-c", SUBJ_HUE[sid]);
    var open = store.state.ui.openSections[sid] = store.state.ui.openSections[sid] || {};

    /* the closed spine's strip (review B): expand, and whose spine it is */
    tree.appendChild(el("div", { class: "k-spine-strip", "data-ui": "study.spine-strip" }, [
      el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "study.spine-expand",
        "aria-label": "Expand the spec spine", title: "Expand the spec spine", text: "›",
        onclick: function () { setTreeClosed(false); } }),
      el("span", { class: "k-spine-strip-l", "aria-hidden": "true", text: data.name })
    ]));
    tree.appendChild(el("div", { class: "k-spine-top" }, [
      el("div", { class: "k-seg k-seg--fill k-spine-subjects", "data-ui": "study.spine-subjects", role: "group", "aria-label": "Subject" }, KOS.subjects.group(sid).map(function (s) {
        return el("button", { type: "button", class: "k-seg-item", "data-ui": "study.spine-subject-pick",
          "aria-pressed": String(s === sid), "aria-label": KOS_DATA[s].name, text: SUBJ_SHORT[s],
          /* on a topic page the switch keeps you studying (review B): it
             opens the last topic of that subject; the subject page is the
             board's own link below */
          onclick: function () {
            var last = store.state.ui.lastRef[s];
            if (activeRef && last && BYREF[s][last]) KOS.show("ref", { subject: s, ref: last });
            else if (activeRef && LEAVES[s][0]) KOS.show("ref", { subject: s, ref: LEAVES[s][0].ref });
            else KOS.show("subject", s);
          } });
      })),
      el("button", { type: "button", class: "k-iconbtn k-spine-collapse", "data-ui": "study.spine-collapse",
        "aria-label": "Collapse the spec spine", title: "Collapse the spec spine", text: "‹",
        onclick: function () { setTreeClosed(true); } })
    ]));
    var filter = el("input", { type: "search", class: "k-spine-filter", "data-ui": "study.spine-filter",
      placeholder: "Filter " + st.total + (LESSONISH[sid] ? " lessons" : " topics"), "aria-label": LESSONISH[sid] ? "Filter lessons" : "Filter topics" });
    filter.value = spineQuery;
    tree.appendChild(el("label", { class: "k-spine-filter-wrap" }, [KOS.ui.icon("search"), filter]));
    tree.appendChild(el("div", { class: "k-spine-board", "data-ui": "study.spine-subject" }, [
      el("div", { class: "k-spine-board-row" }, [
        el("span", { text: codeMode === "tracks" ? "Tracks" : data.board }),
        el("span", { class: "k-mono", text: ratioText(st.done, st.total) + " completed" })
      ]),
      el("span", { class: "k-bar", role: "img", "aria-label": st.pct + "% complete", style: "--p: " + st.pct + "%" }, [el("i")]),
      activeRef ? el("button", { type: "button", class: "k-link k-spine-home", "data-ui": "study.spine-home",
        text: data.name + " overview →", onclick: function () { KOS.show("subject", sid); } }) : null
    ].filter(Boolean)));

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
    /* Code's spine (frame 26c): Core | Tracks, and stage headings above
       the units; Tracks lists the tracks and deepening modules instead */
    var codeSpine = sid === "code" && KOS.codeTopic ? KOS.codeTopic.spine(tree, list, activeRef, codeMode)
      /* Japanese (frame 28e): Core | Media, and stage headings with their emblem kanji */
      : sid === "ja" && KOS.jaTopic ? KOS.jaTopic.spine(tree, list, activeRef)
      /* Mind (frame 32d): the four headers over the units */
      : sid === "mind" && KOS.mindTopic ? KOS.mindTopic.spine(tree, list, activeRef)
      : sid === "creatives" && KOS.crTopic ? KOS.crTopic.spine(tree, list, activeRef) : null;
    tree.appendChild(list);
    var lastStage = null;
    sections.forEach(function (sec) {
      if (codeSpine && codeSpine.stageHead && sec.stage !== lastStage) {
        lastStage = sec.stage;
        list.appendChild(codeSpine.stageHead(sec.stage));
      }
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
        el("span", { class: "k-spine-arr", "data-ui": "part.arrow", "aria-hidden": "true" })
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
    /* Code's tracks: the ones with no part in the spine yet, then deepening */
    if (codeSpine && codeSpine.after) codeSpine.after(list);
    if (itHidden) {
      var sw = el("input", { type: "checkbox", class: "k-switch", "data-ui": "study.it-show-done", "aria-label": "Show completed units" });
      sw.checked = itU.showDone();
      sw.addEventListener("change", function () { itU.setShowDone(sw.checked); KOS.rerender(); });
      list.appendChild(el("label", { class: "k-spine-done" }, [sw, el("span", { text: "Show completed units" }), el("span", { class: "k-muted k-mono", text: String(itHidden) })]));
    }


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


  /* shared by Home, the subject page and the topic page (W8, AP-09: moved here when hub.js was split) */
  var SUBJ_HUE = KOS.subjects.map("hue");
  var SUBJ_SHORT = KOS.subjects.map("short");
  function hm(ts) { var d = new Date(ts); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
  function cardHead(title, meta, link, go, attrs) {
    return el("div", Object.assign({ class: "k-card-head" }, attrs || {}), [
      el("span", { class: "k-card-title", text: title }),
      meta ? el("span", { class: "k-card-meta", text: meta }) : null,
      link ? el("button", { type: "button", class: "k-link", text: link, onclick: go }) : null
    ].filter(Boolean));
  }
  var PAPER_NOTE = {
    compsci: { "Paper 1": ["Paper 1", "Programming paper"], "Paper 2": ["Paper 2", "Theory paper"], "Paper 3": ["NEA", "Non-exam assessment"] },
    maths: { "Pure (P1+P2)": ["Papers 1 & 2", "Pure"], "Paper 3": ["Paper 3", "Statistics and mechanics"] },
    it: { "Examined unit": ["Exam", "Examined units"], "NEA unit": ["NEA", "Non-exam assessment units"] }
  };
  function paperLabel(sid, p) {
    if (sid === "compsci") return "Paper " + p;
    if (sid === "it") return p === "Exam" ? "Examined unit" : "NEA unit";
    return p;
  }

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
  /* frame 23a: the newest quick note on a topic gets a faint amber mark the
     first time it is shown this session, when it is from today or
     yesterday. A read-only memory — rendering writes nothing. */
  var freshSeen = {}, freshNow = null;
  function markFreshNote(host, sid, ref) {
    var topic = sid + ":" + ref;
    /* a different topic on screen: what the last one showed is now seen */
    if (freshNow && freshNow.topic !== topic) {
      freshNow.keys.forEach(function (k) { freshSeen[k] = true; });
      freshNow = null;
    }
    var t = KOS.edits && KOS.edits.get(sid, ref);
    var info = t && t.spec && Array.isArray(t.spec.info) ? t.spec.info : [];
    var last = null;
    info.forEach(function (b) { if (b && b.src === "quick-note" && b.id != null) last = b; });
    if (!last || (last.date && last.date < KOS.srs.addDays(KOS.srs.todayISO(), -1))) return;
    var k = topic + ":" + last.id;
    if (freshSeen[k]) return;
    freshNow = freshNow || { topic: topic, keys: [] };
    if (freshNow.keys.indexOf(k) === -1) freshNow.keys.push(k);
    var node = [].filter.call(host.querySelectorAll("[data-bid]"), function (n) { return n.getAttribute("data-bid") === String(last.id); })[0];
    if (node) KOS.ui.state(node, "fresh", true);
  }
  /* subjects whose generated spec text is hand-typeset with $…$ maths:
     clean lines, never the garbled-IT run-on fallback */
  var TYPESET_SPEC = { maths: true };
  /* a search snippet is plain text: the typeset spec's LaTeX read aloud
     as near as text can (a/b, x^2, no $ or commands) */
  function plainSpec(s) {
    return String(s || "")
      .replace(/\\d?frac\{([^{}]*)\}\{([^{}]*)\}/g, "($1)/($2)")
      .replace(/\\(mathrm|mathbf|text|operatorname)\{([^{}]*)\}/g, "$2")
      .replace(/\\(left|right|displaystyle|dfrac|;|,)/g, "")
      .replace(/\\(theta|alpha|mu|sigma|pi|rho|delta)\b/g, function (m, g) { return { theta: "θ", alpha: "α", mu: "μ", sigma: "σ", pi: "π", rho: "ρ", delta: "δ" }[g]; })
      .replace(/\\([a-zA-Z]+)/g, "$1 ")
      .replace(/[{}$]/g, "")
      .replace(/\s+/g, " ").trim();
  }
  function renderSpecInfo(lines, opts) {
    lines = lines || [];
    if (lines.length === 1 && !(opts && opts.typeset)) {                               // single run-on string (garbled IT fallback)
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

  KOS.hub = { LEAVES: LEAVES, BYREF: BYREF, COLORS: COLORS, HEX: HEX, esc: esc,
    /* the status words and glyphs, and the spine's redraw (Code's inspector shares them) */
    STATUS: STATUS, STATUS_GLYPH: STATUS_GLYPH, renderTree: renderTree,
    /* a leaf's mastery, the one figure (Reports 5.1 snapshots read it too) */
    leafPercent: leafPercent,
    /* IT units (roadmap 1.2): the one derivation of every IT grade figure */
    it: { units: itUnitRows, aggregate: itAggregate, needed: itNeeded, close: itClose, gradeFor: itGradeFor },
    /* search, dismissSearch and onSearchChosen are added by searchui.js */
    /* hub's own page files only (home.js, subject.js, topic.js, dataview.js,
       searchui.js): the helpers they share with this core. Not an API. */
    _: {
      BYREF: BYREF, CHECKS: CHECKS, LEAVES: LEAVES, LESSONISH: LESSONISH, PAPER_NOTE: PAPER_NOTE,
      SEARCH_INDEX: SEARCH_INDEX, STATUS: STATUS, STATUS_GLYPH: STATUS_GLYPH, SUBJECTS: SUBJECTS, SUBJ_HUE: SUBJ_HUE,
      SUBJ_SHORT: SUBJ_SHORT, TYPESET_SPEC: TYPESET_SPEC, applyTreeCollapsed: applyTreeCollapsed, cardHead: cardHead, debounce: debounce,
      esc: esc, hideTree: hideTree, hm: hm, leafPercent: leafPercent, markFreshNote: markFreshNote,
      paperLabel: paperLabel, pctOf: pctOf, pctText: pctText, plainSpec: plainSpec, ratioText: ratioText,
      renderSpecContent: renderSpecContent, renderSpecInfo: renderSpecInfo, renderTree: renderTree, sectionStats: sectionStats, subjectCardStats: subjectCardStats,
      subjectPapers: subjectPapers, subjectStats: subjectStats, tone: tone, topicStats: topicStats, treeOpenButton: treeOpenButton,
      warmSearch: warmSearch
    } };
})();
