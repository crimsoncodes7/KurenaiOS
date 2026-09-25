/* Kurenai OS — modules/due.js
   The global "Due Today" queue (FR-1.2): every card — curriculum and custom,
   across all three subjects and the personal bucket — whose SM-2 due date
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
  var HUE = { compsci: "var(--cs)", maths: "var(--maths)", it: "var(--it)", personal: "var(--bloom)" };
  var SHORT = { compsci: "CS", maths: "Maths", it: "IT", personal: "Personal" };
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  KOS.review = KOS.review || {};

  function cardsFor(run, due) {
    if (!run || run === "all") return due;
    if (run === "overdue") return due.filter(function (c) { return c.overdue > 0; });
    var cut = run.indexOf(":"), sid = run.slice(0, cut), ref = run.slice(cut + 1);
    return due.filter(function (c) { return c.sid === sid && c.ref === ref; });
  }
  function topicTitle(sid, ref) {
    var leaf = KOS.hub && KOS.hub.BYREF[sid] && KOS.hub.BYREF[sid][ref];
    if (leaf) return leaf.title;
    return sid === KOS.srs.PERSONAL_SID ? (ref === "vn" ? "Visual novel quotes" : "Personal cards") : ref;
  }

  KOS.review.renderDue = function (main, opts) {
    opts = opts || {};
    KOS.shell.tree("none");
    var due = KOS.srs.dueCards();
    if (opts.run) { runSession(main, opts.run, due); return; }

    var overdue = due.filter(function (c) { return c.overdue > 0; }).length;
    var bySubject = { compsci: 0, maths: 0, it: 0, personal: 0 };
    due.forEach(function (c) { if (bySubject[c.sid] !== undefined) bySubject[c.sid]++; });
    var subjects = Object.keys(bySubject).filter(function (s) { return bySubject[s]; });

    /* ---- the queue ---- */
    var hero = el("section", { class: "k-rv-hero", "data-ui": "review.queue", "aria-label": "Cards due" }, [
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
          el("span", { text: "Queue clear. Rate cards on any topic's Flashcards tab and SM-2 schedules them back here." })
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
    var peak = Math.max(1, days.reduce(function (a, d) { return Math.max(a, d.n); }, 0));
    var week = el("section", { class: "k-card k-rv-week", "data-ui": "review.week", "aria-label": "Next 7 days" }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: "Next 7 days" }),
        el("span", { class: "k-card-meta k-spacer", text: scheduled ? scheduled + " scheduled" : "nothing scheduled" })
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

    /* ---- by topic ---- */
    var groups = {};
    due.forEach(function (c) {
      var k = c.sid + ":" + c.ref;
      var g = groups[k] = groups[k] || { sid: c.sid, ref: c.ref, n: 0, late: 0, oldest: 0 };
      g.n++;
      if (c.overdue > 0) g.late++;
      g.oldest = Math.max(g.oldest, c.overdue);
    });
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
        g.late ? el("span", { class: "k-chip", "data-tone": "crimson", text: g.late + " overdue" }) : null,
        el("span", { class: "k-rv-topic-n k-mono" }, [String(g.n), el("span", { class: "k-muted", text: " due" })]),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "review.topic-go",
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
    if (KOS.srs.dueCount() > KOS.governor.BACKLOG_LIMIT) {
      side.appendChild(el("section", { class: "k-card k-rv-warn", "data-ui": "review.backlog", role: "note" }, [
        el("b", { text: "⚠ Backlog pressure" }),
        el("p", { text: "Over " + KOS.governor.BACKLOG_LIMIT + " due. The Governor adds a small HP penalty each day the queue stays above the limit." })
      ]));
    }
    var reviewed = 0, graded = 0, good = 0, secs = 0;
    KOS.sessions.all().forEach(function (s) {
      if (s.date !== today || (s.type !== "flashcards" && s.type !== "due-review")) return;
      var m = s.metrics || {};
      reviewed += m.cards || 0;
      var n = (m.again || 0) + (m.hard || 0) + (m.good || 0) + (m.easy || 0);
      graded += n; good += (m.good || 0) + (m.easy || 0);
      secs += s.dur || 0;
    });
    side.appendChild(el("section", { class: "k-card", "data-ui": "review.today", "aria-label": "Today so far" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Today so far" })]),
      el("div", { class: "k-card-row" }, [el("span", { class: "k-card-row-k", text: "Reviewed" }), el("span", { class: "k-card-row-v", text: String(reviewed) })]),
      el("div", { class: "k-card-row" }, [el("span", { class: "k-card-row-k", text: "Accuracy" }), el("span", { class: "k-card-row-v", text: graded ? Math.round(100 * good / graded) + "%" : "—" })]),
      el("div", { class: "k-card-row" }, [el("span", { class: "k-card-row-k", text: "Time" }), el("span", { class: "k-card-row-v", text: Math.round(secs / 60) + " min" })])
    ]));
    main.appendChild(el("div", { class: "k-rv-row" }, [topics, side]));
  };

  /* one review run over the queue (or part of it) */
  function runSession(main, run, due) {
    var cards = cardsFor(run, due);
    var what = run === "all" ? "the whole queue" : run === "overdue" ? "overdue cards first" : topicTitle(run.split(":")[0], run.slice(run.indexOf(":") + 1));
    main.appendChild(el("div", { class: "k-rv-runhead" }, [
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "review.back", text: "← Queue", onclick: function () { KOS.show("review", { tab: "due" }); } }),
      el("span", { class: "k-rv-runwhat", text: cards.length ? cards.length + (cards.length === 1 ? " card · " : " cards · ") + what : what })
    ]));
    if (!cards.length) {
      main.appendChild(el("div", { class: "k-rv-clear", "data-ui": "review.due-clear" }, [
        el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "澄" }),
        el("span", { text: "Queue clear. Nothing is due — SM-2 brings cards back here at the right moment." })
      ]));
      return;
    }
    var holder = el("div", { class: "k-fc", "data-ui": "fc.wrap" });
    main.appendChild(holder);
    KOS.flashcards.session(holder, cards, {
      type: "due-review",
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
