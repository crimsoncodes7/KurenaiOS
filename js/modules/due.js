/* Kurenai OS — modules/due.js
   The global "Due Today" queue (FR-1.2): every card — curriculum and custom,
   across all three subjects and the personal bucket — whose due date
   has arrived, most-overdue first. Per-topic browsing stays on each topic's
   Flashcards tab; this view is the daily clearing house.

   Graphite (frame 9a): the overview is the queue as a hero (how many, how
   overdue, the subject split and the two ways in), the next seven days,
   the queue by topic (each one reviewable on its own), and a side column
   with the personal deck, the backlog warning and today so far. A run
   (opts.run) replaces the overview with the flashcard session.          */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var HUE = Object.assign(KOS.subjects.map("hue"), { personal: "var(--bloom)" });
  var SHORT = Object.assign(KOS.subjects.map("short"), { personal: "Personal" });
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  KOS.review = KOS.review || {};

  function cardsFor(run, due) {
    if (!run || run === "all") return due;
    if (run === "overdue") return due.filter(function (c) { return c.overdue > 0; });
    /* the three kinds (5.19 item 4, 44a): flashcards, and redo items apart */
    if (run === "cards") return due.filter(function (c) { return !c.redo; });
    if (run === "redo") return due.filter(function (c) { return c.redo; });
    if (run.indexOf("scope:") === 0) return scopeCards(run.slice(6), due);
    /* the rapid drill's misses (roadmap 5.8 phase 5): those cards, due or not */
    if (run.indexOf("cards:") === 0) return listedCards(run.slice(6).split("|"));
    var cut = run.indexOf(":"), sid = run.slice(0, cut), ref = run.slice(cut + 1);
    return due.filter(function (c) { return c.sid === sid && (ref === "*" || c.ref === ref); });
  }
  /* "Cram this scope" (roadmap 5.8, 29w): an assessment's due cards, then
     the cards on its weakest leaves whose recall today is under 75%,
     weakest first; the review itself is the ordinary review */
  /* UR-26: a cram is the scope's cards whatever their schedule — the button
     counts them (its due ones, else up to CRAM_MIN of all), and the run
     holds what it counted: due first, then the weakest (recall under 75%),
     then cards never rated, then the rest by lowest recall. It used to
     take only the due and the weak, so with the queue cleared and most
     cards unrated it opened "Queue clear. Nothing is due". */
  var CRAM_MIN = 40;
  function scopeCards(aid, due) {
    var a = KOS.exams && KOS.exams.get(aid);
    if (!a) return [];
    var ls = {}, seen = {}, out = [];
    KOS.exams.leaves(a).forEach(function (k) { ls[k] = true; });
    due.forEach(function (c) { if (ls[c.sid + ":" + c.ref]) { seen[c.key] = true; out.push(c); } });
    var weak = [], fresh = [], strong = [];
    Object.keys(ls).forEach(function (k) {
      var p = KOS.spec.parse(k);
      if (!p) return;
      KOS.srs.cardsFor(p.subject, p.ref).forEach(function (c) {
        if (seen[c.key]) return;
        seen[c.key] = true;
        var m = KOS.srs.peek(c.key), mem = KOS.srs.memory(c.key);
        if (m && m.leech) return;                        /* set aside: Rework, not a cram */
        c.meta = m; c.overdue = 0;
        if (!mem) { fresh.push(c); return; }
        c.r = mem.r;
        (mem.r < 0.75 ? weak : strong).push(c);
      });
    });
    weak.sort(function (x, y) { return x.r - y.r; });
    strong.sort(function (x, y) { return x.r - y.r; });
    return out.concat(weak, fresh, strong).slice(0, Math.max(CRAM_MIN, out.length));
  }
  function listedCards(keys) {
    var want = {}, out = [];
    keys.forEach(function (k) { if (k) want[k] = true; });
    Object.keys(want).forEach(function (k) {
      var m = /^([a-z]+):(.+):([^:]+)$/.exec(k);
      if (!m) return;
      KOS.srs.cardsFor(m[1], m[2]).forEach(function (c) { if (want[c.key] && !out.some(function (x) { return x.key === c.key; })) { c.meta = KOS.srs.peek(c.key); c.overdue = 0; out.push(c); } });
    });
    return out.slice(0, 40);
  }
  function topicTitle(sid, ref) {
    var leaf = KOS.hub && KOS.hub.BYREF[sid] && KOS.hub.BYREF[sid][ref];
    if (leaf) return leaf.title;
    if (ref === "*") return (KOS.subjects.meta(sid) || {}).name || sid;   /* a space's whole queue */
    return sid === KOS.srs.PERSONAL_SID ? (ref === "vn" ? "Visual novel quotes" : "Personal cards") : ref;
  }

  KOS.review.renderDue = function (main, opts) {
    opts = opts || {};
    KOS.shell.tree("none");
    var due = KOS.srs.dueCards();
    if (opts.run === "questions") { runQuestions(main); return; }
    if (opts.run) { runSession(main, opts.run, due); return; }

    var overdue = due.filter(function (c) { return c.overdue > 0; }).length;
    var bySubject = {};
    KOS.subjects.ids().concat(["personal"]).forEach(function (s) { bySubject[s] = 0; });
    due.forEach(function (c) { if (bySubject[c.sid] !== undefined) bySubject[c.sid]++; });
    var subjects = Object.keys(bySubject).filter(function (s) { return bySubject[s]; });

    /* ---- the queue ---- */
    var hero = el("section", { class: "k-rv-hero", "data-ui": "review.queue", "data-state": overdue ? "overdue" : null, "aria-label": "Cards due" }, [
      el("div", { class: "k-rv-hero-main" }, [
        el("div", { class: "k-rv-count" }, [
          el("span", { class: "k-rv-n", "data-ui": "review.due-count", text: KOS.ui.num(due.length) }),
          el("span", { class: "k-rv-u", text: due.length === 1 ? "card due" : "cards due" }),
          overdue ? el("span", { class: "k-rv-late", "data-ui": "review.overdue-count", text: overdue + " overdue" }) : null
        ].filter(Boolean)),
        due.length ? el("div", { class: "k-rv-split", "aria-hidden": "true" }, subjects.map(function (s) {
          return el("span", { style: "--f: " + bySubject[s] + "; --c: " + HUE[s] });
        })) : null,
        due.length ? el("div", { class: "k-rv-legend", "data-ui": "review.split" }, subjects.map(function (s) {
          return el("span", { style: "--c: " + HUE[s] }, [el("b", { text: SHORT[s] }), " " + bySubject[s]]);
        }).concat([el("span", { class: "k-muted", text: "about " + Math.max(1, Math.round(due.length * 0.5)) + " min" })])) : null,
        due.length ? null : el("div", { class: "k-rv-clear", "data-ui": "review.due-clear" }, [
          el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "澄" }),
          el("span", { text: KOS.questions && KOS.questions.dueToday().total
            ? "No cards due. Your questions back today are below."
            : "Queue clear. Rate cards on any topic's Flashcards tab and they are scheduled back here." })
        ])
      ].filter(Boolean)),
      due.length ? el("div", { class: "k-rv-go" }, [
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "review.start",
          text: "Start review · all " + due.length, onclick: function () { KOS.show("review", { tab: "due", run: "all" }); } }),
        overdue ? el("button", { type: "button", class: "k-btn", "data-ui": "review.overdue-first", text: "Overdue first",
          onclick: function () { KOS.show("review", { tab: "due", run: "overdue" }); } }) : null
      ].filter(Boolean)) : null
    ].filter(Boolean));

    /* ---- the next seven days ---- */
    var today = KOS.srs.todayISO(), days = [], scheduled = 0;
    for (var i = 0; i < 7; i++) days.push({ iso: KOS.srs.addDays(today, i), n: 0 });
    KOS.srs.allCards().forEach(function (c) {
      var m = KOS.srs.peek(c.key);
      if (!m || !m.due) return;
      var at = m.due <= today ? 0 : KOS.srs.daysBetween(today, m.due);
      if (at < 7) { days[at].n++; scheduled++; }
    });
    /* questions on the schedule too (5.19 item 4: all three kinds) */
    if (KOS.questions) KOS.questions.scheduled().forEach(function (q) {
      if (q.meta.due <= today) return;            /* today's are counted capped, below */
      var at = KOS.srs.daysBetween(today, q.meta.due);
      if (at < 7) { days[at].n++; scheduled++; }
    });
    if (KOS.questions) { var qt = KOS.questions.dueToday(today).total; days[0].n += qt; scheduled += qt; }
    var peak = Math.max(1, days.reduce(function (a, d) { return Math.max(a, d.n); }, 0));
    var week = el("section", { class: "k-card k-rv-week", "data-ui": "review.week", "aria-label": "Next 7 days" }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: "Next 7 days" }),
        el("span", { class: "k-card-meta k-spacer", text: scheduled ? scheduled + " scheduled · every kind" : "nothing scheduled" })
      ]),
      el("div", { class: "k-rv-chart", role: "img", "aria-label": days.map(function (d, j) {
        return (j ? DOW[new Date(d.iso + "T12:00:00").getDay()] : "Today") + " " + d.n; }).join(", ") }, days.map(function (d, j) {
        return el("div", { class: "k-rv-day", "data-state": j === 0 ? "today" : null }, [
          el("span", { class: "k-rv-day-n", text: d.n ? String(d.n) : "" }),
          el("span", { class: "k-rv-day-bar", style: "--h: " + Math.round(100 * d.n / peak) + "%" }),
          el("span", { class: "k-rv-day-l", text: DOW[new Date(d.iso + "T12:00:00").getDay()] })
        ]);
      }))
    ]);
    main.appendChild(el("div", { class: "k-rv-row" }, [hero, week]));
    var QB = KOS.questions ? KOS.questions.dueToday(today) : null;
    if (QB) main.appendChild(kindsStrip(due, QB));

    /* ---- by topic ---- */
    var groups = {};
    due.forEach(function (c) {
      var k = c.sid + ":" + c.ref;
      var g = groups[k] = groups[k] || { sid: c.sid, ref: c.ref, n: 0, late: 0, oldest: 0 };
      g.n++;
      if (c.overdue > 0) g.late++;
      g.oldest = Math.max(g.oldest, c.overdue);
    });
    /* topic memory (FSRS phase 2): each topic's recall today, a read */
    Object.keys(groups).forEach(function (k) { var g = groups[k]; g.recall = KOS.srs.topicMemory(g.sid, g.ref, today).recall; });
    var sort = KOS.review.topicSort || "overdue";
    var list = Object.keys(groups).map(function (k) { return groups[k]; }).sort(sort === "size"
      ? function (a, b) { return b.n - a.n || b.oldest - a.oldest; }
      : function (a, b) { return b.oldest - a.oldest || b.late - a.late || b.n - a.n; });
    var topics = el("section", { class: "k-card k-rv-topics", "data-ui": "review.topics", "aria-label": "By topic" }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: "By topic" }),
        el("span", { class: "k-card-meta", text: "review one topic at a time" }),
        list.length > 1 ? KOS.ui.menu({ label: sort === "size" ? "Sort: most due" : "Sort: most overdue", className: "k-btn--quiet k-btn--sm k-spacer",
          items: [
            { label: "Most overdue", onSelect: function () { KOS.review.topicSort = "overdue"; KOS.rerender(); } },
            { label: "Most due", onSelect: function () { KOS.review.topicSort = "size"; KOS.rerender(); } }
          ] }) : null
      ].filter(Boolean))
    ]);
    if (!list.length) topics.appendChild(KOS.ui.emptyState({ compact: true, body: "Nothing due in any topic today." }));
    list.forEach(function (g) {
      topics.appendChild(el("div", { class: "k-rv-topic", "data-ui": "review.topic", style: "--c: " + (HUE[g.sid] || "var(--muted)") }, [
        el("span", { class: "k-rv-topic-bar", "aria-hidden": "true" }),
        el("span", { class: "k-rv-topic-ref k-mono", text: g.ref }),
        el("span", { class: "k-rv-topic-t", text: topicTitle(g.sid, g.ref) }),
        g.late ? el("span", { class: "k-chip", "data-tone": "danger", text: g.late + " overdue" }) : null,
        g.recall != null ? el("span", { class: "k-chip", "data-tone": "muted", "data-ui": "review.topic-recall",
          title: "How much of this topic's deck you would recall today", text: "recall " + Math.round(g.recall * 100) + "%" }) : null,
        el("span", { class: "k-rv-topic-n k-mono" }, [String(g.n), el("span", { class: "k-muted", text: " due" })]),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm k-rv-topic-go", "data-ui": "review.topic-go",
          "aria-label": "Review " + g.n + " due in " + g.ref + " " + topicTitle(g.sid, g.ref), text: "▶",
          onclick: function () { KOS.show("review", { tab: "due", run: g.sid + ":" + g.ref }); } })
      ].filter(Boolean)));
    });

    /* ---- the side column ---- */
    var side = el("div", { class: "k-rv-side" });
    var pRefs = KOS.srs.personalRefs();
    var pTotal = pRefs.reduce(function (a, r) { return a + (r.count || 0); }, 0);
    side.appendChild(el("section", { class: "k-card", "data-ui": "review.personal", "aria-label": "Personal deck" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Personal deck" })]),
      el("p", { class: "k-rv-side-p", text: "Visual novel quotes and your own general cards. " +
        (pTotal ? pTotal + (pTotal === 1 ? " card, " : " cards, ") + (bySubject.personal ? bySubject.personal + " due." : "none due.") : "No cards yet.") }),
      el("button", { type: "button", class: "k-btn k-btn--sm", title: "Cards with no curriculum subject — VN quotes and your own general cards",
        text: "❝ Open personal deck", onclick: function () { KOS.show("personaldeck"); } })
    ]));
    /* Rework (FSRS phase 2): cards that lapsed too often to keep drilling.
       Each offers its topic's notes, and a way back into the schedule. */
    var leeches = KOS.srs.leeches();
    if (leeches.length) {
      var rw = el("section", { class: "k-card k-rv-rework", "data-ui": "review.rework", "aria-label": "Rework" }, [
        el("div", { class: "k-card-head" }, [
          el("span", { class: "k-card-title", text: "Rework" }),
          el("span", { class: "k-card-meta k-spacer", text: leeches.length + (leeches.length === 1 ? " card" : " cards") })
        ]),
        el("p", { class: "k-rv-side-p", text: "Lapsed " + KOS.srs.LEECH + " times or more, so they are out of the queue. Reread the notes, reword the card if it is the problem, then put it back." })
      ]);
      leeches.slice(0, 5).forEach(function (c) {
        var custom = c.custom || c.sid === KOS.srs.PERSONAL_SID;
        rw.appendChild(el("div", { class: "k-rv-leech", "data-ui": "review.leech" }, [
          el("div", { class: "k-rv-leech-q", html: KOS.content.inline(c.q) }),
          el("div", { class: "k-rv-leech-acts" }, [
            el("span", { class: "k-mono k-muted", text: (c.sid === KOS.srs.PERSONAL_SID ? "personal" : c.ref) + " · " + c.meta.lapses + " lapses" }),
            custom ? null : el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "review.leech-notes",
              text: "Notes", "aria-label": "Read the notes for " + topicTitle(c.sid, c.ref),
              onclick: function () { KOS.show("ref", { subject: c.sid, ref: c.ref }); } }),
            el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "review.leech-back", text: "Back in the schedule",
              onclick: function () { KOS.srs.unleech(c.key); KOS.ui.toast("Back in the schedule — due when its recall dips to your target."); KOS.rerender(); } })
          ].filter(Boolean))
        ]));
      });
      if (leeches.length > 5) rw.appendChild(el("p", { class: "k-muted k-rv-side-p", text: "and " + (leeches.length - 5) + " more" }));
      side.appendChild(rw);
    }
    if (KOS.srs.dueCount() > KOS.governor.BACKLOG_LIMIT) {
      side.appendChild(el("section", { class: "k-card k-rv-warn", "data-ui": "review.backlog", role: "note" }, [
        el("b", { text: "⚠ Backlog pressure" }),
        el("p", { text: "Over " + KOS.governor.BACKLOG_LIMIT + " due. The Governor adds a small HP penalty each day the queue stays above the limit." })
      ]));
    }
    if (QB) side.appendChild(capCard(QB));
    var reviewed = 0, graded = 0, good = 0, secs = 0;
    KOS.sessions.all().forEach(function (s) {
      if (s.date !== today || (s.type !== "flashcards" && s.type !== "due-review")) return;
      var m = s.metrics || {};
      reviewed += m.cards || 0;
      var n = (m.again || 0) + (m.hard || 0) + (m.good || 0) + (m.easy || 0);
      graded += n; good += (m.good || 0) + (m.easy || 0);
      secs += s.dur || m.secs || 0;
    });
    var reviewedV = el("span", { class: "k-card-row-v", "data-ui": "review.today-n", text: String(reviewed) });
    var accV = el("span", { class: "k-card-row-v", "data-ui": "review.today-acc", text: graded ? Math.round(100 * good / graded) + "%" : "—" });
    /* bk:study-core#1: the counts are the review log's (one row a rating,
       whichever page rated it); the session figures above stand in until
       it is read, and stay if it cannot be */
    if (KOS.reviewLog && KOS.reviewLog.available() && KOS.reviewLog.range) {
      KOS.reviewLog.range(today, today, function (err, rows) {
        if (err || !reviewedV.isConnected) return;
        var keys = {}, n = 0, ok = 0;
        rows.filter(KOS.reviewLog.isCard).forEach(function (r) { keys[r.key] = true; n++; if (r.g >= 3) ok++; });
        reviewedV.textContent = String(Object.keys(keys).length);
        accV.textContent = n ? Math.round(100 * ok / n) + "%" : "—";
      });
    }
    side.appendChild(el("section", { class: "k-card", "data-ui": "review.today", "aria-label": "Today so far" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Today so far" })]),
      el("div", { class: "k-card-row" }, [el("span", { class: "k-card-row-k", text: "Reviewed" }), reviewedV]),
      el("div", { class: "k-card-row" }, [el("span", { class: "k-card-row-k", text: "Accuracy" }), accV]),
      /* ST-37: the batches log their rating time (metrics.secs); a zero is not printed (77) */
      secs >= 60 ? el("div", { class: "k-card-row", "data-ui": "review.today-time" }, [el("span", { class: "k-card-row-k", text: "Time" }), el("span", { class: "k-card-row-v", text: Math.round(secs / 60) + " min" })]) : null
    ]));
    main.appendChild(el("div", { class: "k-rv-row" }, [topics, side]));
  };

  /* ---- the three kinds (5.19 item 4, design 44a) ----
     Flashcards, Questions back (quiz and exam items on their own schedule,
     capped per subject a day) and Redo items (never capped, invariant 124),
     each with its own Start. */
  function kindsStrip(due, QB) {
    var cards = due.filter(function (c) { return !c.redo; }).length, redo = due.length - cards;
    var capTxt = Object.keys(QB.by).length ? (function () {
      var caps = Object.keys(QB.by).map(function (s) { return QB.by[s].cap; });
      var same = caps.every(function (c) { return c === caps[0]; });
      return same ? "of a " + caps[0] + "-a-day cap" : "within each subject's cap";
    })() : "quiz and exam items you have answered";
    function kind(hook, n, unit, sub, run) {
      return el("div", { class: "k-rv-kind", "data-ui": "review.kind " + hook, "data-state": n ? null : "empty" }, [
        el("span", { class: "k-kicker", text: unit }),
        el("span", { class: "k-rv-kind-n" }, [el("b", { text: KOS.ui.num(n) }), el("span", { class: "k-muted", text: " " + sub })]),
        n ? el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": hook + "-start", text: "Start · " + n + " →",
          onclick: function () { KOS.show("review", { tab: "due", run: run }); } }) : el("span", { class: "k-muted k-rv-kind-none", text: "none today" })
      ]);
    }
    return el("section", { class: "k-card k-rv-kinds", "data-ui": "review.kinds", "aria-label": "What is due, by kind" }, [
      kind("review.kind-cards", cards, "Flashcards", cards === 1 ? "card" : "cards", "cards"),
      kind("review.kind-questions", QB.total, "Questions back", capTxt + (QB.waiting ? " · " + QB.waiting + " wait" : ""), "questions"),
      kind("review.kind-redo", redo, "Redo items", "from your papers", "redo")
    ]);
  }
  /* Questions back each day, per subject (44a): − and + move the cap */
  function capCard(QB) {
    var sids = KOS.subjects.ids("exam");
    var box = el("section", { class: "k-card k-rv-caps", "data-ui": "review.caps", "aria-label": "Questions back each day" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Questions back each day" }), el("span", { class: "k-card-meta k-spacer", text: "per subject" })])
    ]);
    sids.forEach(function (sid) {
      var b = QB.by[sid] || { cap: KOS.questions.cap(sid), done: 0, left: 0 };
      var n = el("b", { class: "k-mono", "data-ui": "review.cap-n", text: String(b.cap) });
      function step(d) {
        var v = KOS.questions.setCap(sid, KOS.questions.cap(sid) + d);
        n.textContent = String(v);
        KOS.a11y.announce(SHORT[sid] + ": " + v + " a day.");
        KOS.view.redrawIfStill()();
      }
      box.appendChild(el("div", { class: "k-rv-cap", "data-ui": "review.cap", "data-sid": sid, style: "--c: " + HUE[sid] }, [
        el("span", { class: "k-rv-cap-t" }, [el("b", { text: KOS.subjects.name ? KOS.subjects.name(sid) : SHORT[sid] }),
          el("span", { class: "k-muted", text: (b.done + b.left) + " today" })]),
        el("span", { class: "k-rv-cap-step", role: "group", "aria-label": "Questions back a day in " + SHORT[sid] }, [
          el("button", { type: "button", class: "k-qz-step", "data-ui": "review.cap-down", "aria-label": "One fewer a day", text: "−", onclick: function () { step(-1); } }),
          n,
          el("button", { type: "button", class: "k-qz-step", "data-ui": "review.cap-up", "aria-label": "One more a day", text: "+", onclick: function () { step(1); } })
        ])
      ]));
    });
    box.appendChild(el("p", { class: "k-rv-side-p k-muted", text: "Redo items are never capped." }));
    return box;
  }

  /* ---- the questions back today, one at a time ----
     Each is its own topic's quiz or exam item, answered and marked as on its
     tab; the mark rates it (KOS.questions.answer). A question whose item is
     gone from its topic is passed over. */
  function runQuestions(main) {
    var QS = KOS.questions, list = QS.dueToday().list.map(function (q) {
      var hit = QS.itemOf(q.key);
      return hit ? Object.assign(q, { hit: hit }) : null;
    }).filter(Boolean);
    var what = list.length ? list.length + (list.length === 1 ? " question back today" : " questions back today") : "Questions back today";
    main.appendChild(el("div", { class: "k-rv-runhead" }, [
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "review.back", text: "← Queue", onclick: function () { KOS.show("review", { tab: "due" }); } }),
      el("span", { class: "k-rv-runwhat", "data-ui": "review.q-what", text: what })
    ]));
    if (!list.length) {
      main.appendChild(el("div", { class: "k-rv-clear", "data-ui": "review.due-clear" }, [
        el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "澄" }),
        el("span", { text: "No questions back today. A quiz or exam question you answer comes back here when it is due." })
      ]));
      return;
    }
    var at = 0;
    var head = el("div", { class: "k-rv-qhead", "data-ui": "review.q-head" });
    var holder = el("div", { class: "k-topic-engine k-rv-q", "data-ui": "review.q" });
    var foot = el("div", { class: "k-qz-foot", "data-ui": "review.q-foot" });
    main.appendChild(head); main.appendChild(holder); main.appendChild(foot);
    function next() {
      foot.innerHTML = "";
      foot.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "review.q-next",
        text: at < list.length - 1 ? "Next question →" : "Finish", onclick: function () { at++; show(); } }));
    }
    function show() {
      head.innerHTML = ""; holder.innerHTML = ""; foot.innerHTML = "";
      if (at >= list.length) {
        holder.appendChild(el("div", { class: "k-rv-clear", "data-ui": "review.q-done" }, [
          el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "済" }),
          el("span", { text: "That's today's questions. Each comes back when its marks say it should." })
        ]));
        return;
      }
      var q = list[at], h = q.hit, id = q.key.split(":").pop();
      head.appendChild(el("span", { class: "k-mono k-muted", text: "Question " + (at + 1) + " of " + list.length }));
      head.appendChild(el("button", { type: "button", class: "k-link", "data-ui": "review.q-topic", style: "--c: " + (HUE[h.sid] || "var(--muted)"),
        text: h.ref + " · " + topicTitle(h.sid, h.ref), onclick: function () { KOS.show("ref", { subject: h.sid, ref: h.ref, tab: h.kind }); } }));
      head.appendChild(el("span", { class: "k-chip", "data-tone": "muted", text: h.kind === "quiz" ? "Quiz" : "Exam question" }));
      var item = Object.assign({}, h.item, { qk: id, oi: h.item.oi != null ? h.item.oi : h.i });
      if (h.kind === "quiz") {
        KOS.quiz.mountMCQ(holder, h.sid, h.ref, [item], { attempts: 0, bare: true, onFinish: function (picks, correct) {
          QS.answer(q.key, { kind: "quiz", ok: correct === 1, back: true });
          next();
        } });
      } else {
        KOS.quiz.mountExam(holder, h.sid, h.ref, [item], { back: true, onLog: next });
      }
    }
    show();
  }

  /* one review run over the queue (or part of it) */
  function runSession(main, run, due) {
    var cards = cardsFor(run, due);
    var sa = run.indexOf("scope:") === 0 && KOS.exams ? KOS.exams.get(run.slice(6)) : null;
    var what = run === "all" ? "the whole queue" : run === "overdue" ? "overdue cards first" : sa ? "cram: " + sa.title + ", weakest first" : run.indexOf("cards:") === 0 ? "the drill's misses" : topicTitle(run.split(":")[0], run.slice(run.indexOf(":") + 1));
    main.appendChild(el("div", { class: "k-rv-runhead" }, [
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "review.back", text: "← Queue", onclick: function () { KOS.show("review", { tab: "due" }); } }),
      el("span", { class: "k-rv-runwhat", text: cards.length ? cards.length + (cards.length === 1 ? " card · " : " cards · ") + what : what })
    ]));
    if (!cards.length) {
      main.appendChild(el("div", { class: "k-rv-clear", "data-ui": "review.due-clear" }, [
        el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "澄" }),
        el("span", { text: "Queue clear. Nothing is due — cards come back here when their recall dips to your target." })
      ]));
      return;
    }
    var holder = el("div", { class: "k-fc", "data-ui": "fc.wrap" });
    main.appendChild(holder);
    /* ST-30: the run names what it reviewed — a single subject (and topic) as the entry's own,
       a mixed run its topics as `refs` — so the subject's streak, a topic's sessions and
       per-subject time see the reviews (sessions.parts) */
    var sids = [], refs = [];
    cards.forEach(function (c) {
      if (!c.sid || !c.ref || (KOS.srs.PERSONAL_SID && c.sid === KOS.srs.PERSONAL_SID)) return;
      if (sids.indexOf(c.sid) < 0) sids.push(c.sid);
      var k = c.sid + ":" + c.ref; if (refs.indexOf(k) < 0) refs.push(k);
    });
    var oneSid = sids.length === 1 && cards.every(function (c) { return c.sid === sids[0]; }) ? sids[0] : null;
    KOS.flashcards.session(holder, cards, {
      type: "due-review",
      sid: oneSid, ref: oneSid && refs.length === 1 ? refs[0].slice(oneSid.length + 1) : null,
      refs: refs.length > 1 ? refs : null, noTally: true,
      /* a mixed run also counts its cards per subject (metrics.bySubject),
         so each subject's review goals see them (rm:due-subject) */
      split: !oneSid,
      runKey: "due:" + run,
      showTopic: true,
      onFinish: function () {
        setTimeout(function () { if (KOS.refreshHUD) KOS.refreshHUD(); }, 50);
      }
    });
  }

  /* ---------------- the Personal Deck (Build 3c) ----------------
     Cards in the reserved "personal" bucket — created from VN quotes (ref
     "vn") or by hand — with no curriculum subject forced onto them. The
     standard flashcards mount does everything (study + manage + metrics);
     this view just picks the sub-deck. */
  var REF_LABEL = { vn: "Visual novel quotes" };
  KOS.views.personaldeck = function (main) {
    KOS.shell.tree("none");
    main.appendChild(KOS.ui.pageHeader({ kicker: "句 · The commonplace book", title: "Personal Deck",
      sub: "Cards without a curriculum home — kept quotes and anything you add here.",
      actions: [
        el("button", { type: "button", class: "k-btn", text: "← Review", onclick: function () { KOS.show("review", { tab: "due" }); } }),
        el("button", { type: "button", class: "k-btn", text: "選 Visual Novels", onclick: function () { KOS.show("vn"); } })
      ] }));

    var refs = KOS.srs.personalRefs();
    if (!refs.length) refs = [{ ref: "vn", count: 0 }];   // the manage tab can still create the first card

    var body = el("div", {});
    if (refs.length > 1) {
      var decks = KOS.ui.tabs(refs.map(function (r, i) {
        return { label: (REF_LABEL[r.ref] || r.ref) + " (" + r.count + ")", active: i === 0, onSelect: function (ev) {
          decks.querySelectorAll("[data-ui~='ui.tab']").forEach(function (b) {
            var on = b === ev.currentTarget;
            KOS.ui.state(b, "active", on); b.setAttribute("aria-selected", String(on));
          });
          mountRef(r.ref);
        } };
      }), { variant: "workspace", label: "Personal decks" });
      main.appendChild(decks);
    }
    main.appendChild(body);
    function mountRef(ref) {
      body.innerHTML = "";
      var inner = el("div", { "data-ui": "fc.wrap" });
      body.appendChild(inner);
      KOS.flashcards.mount(inner, KOS.srs.PERSONAL_SID, ref);
    }
    mountRef(refs[0].ref);
  };
})();
