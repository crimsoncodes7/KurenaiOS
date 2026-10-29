/* Kurenai OS — modules/mind.js
   Mind's own pages (roadmap 5.9, design turn 32):
     KOS.mindDesk(main)          32a  the subject desk, built like the Code and Japanese desks
     #/mind/path                 32c  Foundation · Psychology · Philosophy · Crossings, every path and unit
     #/mind/journal              32n  the Journal: five kinds, filters, the Big Question thread, export
     #/mind/positions            32k  every position and version, the belief timeline, revisits, tensions
     #/mind/daily                32z  the Daily 15: reviews · one sitting · one question (phone first)
     KOS.mindPages.checkpoint    32y  a unit's checkpoint, on its lesson's page
   The lesson is the shared topic page (hub.js + mindtopic.js). Pages read through KOS.mind and
   KOS.mindJournal; the only writes are the learner's own answers. A render writes nothing.     */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var SID = "mind";
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function M() { return KOS.mind; }
  function UI() { return KOS.mindUI; }
  function J() { return KOS.mindJournal; }
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  function today() { return KOS.srs.todayISO(); }
  function dayLabel(iso) { var d = new Date(iso + "T12:00:00"); return DOW[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()]; }
  function when(ts) {
    var d = new Date(ts), t = new Date(today() + "T12:00:00"), diff = Math.round((t - new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12)) / 864e5);
    return diff === 0 ? "Today" : diff === 1 ? "Yesterday" : diff < 7 ? DOW[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()] : d.getDate() + " " + MON[d.getMonth()];
  }
  function hm(mins) { mins = Math.round(mins || 0); var h = Math.floor(mins / 60), m = mins % 60; return h ? h + " h " + (m < 10 ? "0" : "") + m : m + " m"; }
  function capture(o) { KOS.mindRun.capture(Object.assign({ onDone: function () { KOS.rerender(); } }, o || {})); }
  function shellActions() {
    KOS.shell.actions([
      el("button", { type: "button", class: "k-btn", "data-ui": "mind.capture", text: "+ Capture", onclick: function () { capture(); } }),
      el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Start focus", onclick: function () { KOS.show("focus", { subject: SID }); } })
    ]);
  }
  function journalRow(o) {
    return el("button", { type: "button", class: "k-mind-jrow", "data-ui": "mind.journal-row", onclick: o.go }, [
      UI().kind(o.kind, { word: false }),
      el("span", { class: "k-mind-jrow-t" }, [el("b", { text: o.title }), el("small", { text: (KOS.mindJournal.LABEL[o.kind] || "") + (o.meta ? " · " + o.meta : "") })])
    ]);
  }
  /* every entry the Journal lists: the store's four kinds and the positions (state.mind) */
  function allEntries() {
    var out = J().list().map(function (e) { return { kind: e.kind, id: e.id, title: e.title, at: e.at, e: e }; });
    M().positions().forEach(function (p) { out.push({ kind: "position", id: "pos:" + p.lesson, title: p.q, at: p.current.at, p: p }); });
    return out.sort(function (a, b) { return b.at - a.at; });
  }

  /* ======================================================================
     32a · the subject desk
     ====================================================================== */
  KOS.mindDesk = function (main) {
    if (!J().loaded()) J().ready(function () { if (main.isConnected && KOS.store.state.ui.view === "subject") KOS.rerender(); });
    shellActions();
    var st = M().stats(), first = !M().started(), next = M().nextLesson();
    var met = M().metConcepts().length;
    /* the hero, as Code's: ring, name, the four rungs as bars, and the agreed order as its path row */
    var hero = el("section", { class: "k-subj-hero k-mind-hero", "data-ui": "study.subject-hero mind.hero", "aria-label": "Mind" }, [
      el("span", { class: "k-subj-ring", role: "img", "aria-label": st.mastery + "% mastery", style: "--p: " + st.mastery + "%" }, [
        el("span", { class: "k-subj-ring-in" }, [el("b", { text: st.mastery + "%" }), el("small", { text: "mastery" })])
      ]),
      el("div", { class: "k-subj-id" }, [
        el("div", { class: "k-kicker", text: "Subject desk" }),
        el("h1", { class: "k-subj-name", text: "Mind" }),
        el("div", { class: "k-subj-board" }, [el("span", { text: KOS_DATA.mind.board })])   // no streak of its own (decision C)
      ]),
      el("div", { class: "k-subj-papers", "data-ui": "mind.rung-bars" }, UI().RUNG.map(function (r, i) {
        var pct = met ? Math.round(100 * st.rungs[i] / met) : 0;
        return el("div", { class: "k-subj-paper" }, [
          el("div", { class: "k-subj-paper-top" }, [el("b", { text: r }), el("span", { class: "k-subj-paper-note" }), el("span", { class: "k-mono", text: pct + "%" })]),
          el("span", { class: "k-bar k-bar--6", role: "img", "aria-label": r + ": " + pct + "% of your concepts", style: "--p: " + pct + "%" }, [el("i")])
        ]);
      })),
      el("div", { class: "k-mind-hero-path" }, [orderPath()])
    ]);
    var side = el("div", { class: "k-subj-side k-mind-deskside" }, [first ? welcomeCard() : dailyCard(), !first && next ? continueCard(next) : null].filter(Boolean));
    main.appendChild(el("div", { class: "k-subj-row", "data-ui": "study.desk-top" }, [hero, side]));

    var analytics = el("section", { class: "k-card k-sa", "data-ui": "study.analytics mind.analytics", "aria-label": "Subject analytics" }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: "Subject analytics" }), el("span", { class: "k-card-meta", text: "this subject only" }),
        el("details", { class: "k-sa-help" }, [el("summary", { class: "k-link", text: "What do these mean?" }), el("div", { class: "k-sa-help-body" }, [
          el("p", { text: "Mastery averages each lesson's evidence checks: every page read, the check passed, its written prompt done and its cards held." }),
          el("p", { text: "A concept climbs a ladder: Recall (its cards hold), Explain (an explain-back covers its key points), Apply (a scenario answered right) and Evaluate (a position with an objection answered). Every rung comes from evidence, never from a box you tick." })])])
      ]),
      el("div", { class: "k-sa-grid", "data-ui": "study.analytics-grid" }, [
        tile("Mastery", st.mastery + "%", false, st.mastery, "var(--subj-c)"),
        tile("Lessons", st.done + " / " + st.lessons, false, Math.round(100 * st.done / Math.max(1, st.lessons)), "var(--green)"),
        tile("Checkpoints", st.passed + " / " + st.checkpoints, !st.passed, st.passed ? Math.round(100 * st.passed / st.checkpoints) : null, "var(--mind)"),
        tile("Reviews due", String(st.due), first),
        tile("Positions", String(st.positions), !st.positions),
        tile("Concepts", String(met), !met),
        tile("Changed minds", String(st.changed), !st.changed),
        tile("This week", hm(st.weekMins), !st.weekMins, Math.min(100, Math.round(100 * st.weekMins / 105)), "var(--green)")
      ])
    ]);
    main.appendChild(el("div", { class: "k-subj-row" }, [analytics, journalCard()]));
    main.appendChild(corePath());
    main.appendChild(milestonesCard());
  };
  function tile(k, v, empty, pct, c) {
    var bar = pct != null && !empty;
    return el("div", { class: "k-sa-tile", "data-ui": "study.analytics-tile", "data-state": empty ? "empty" : null }, [
      el("span", { class: "k-sa-k", "data-ui": "part.label", text: k }), el("strong", { class: "k-sa-v", "data-ui": "part.value", text: empty ? "—" : v }),
      el("span", { class: "k-bar", "aria-hidden": "true", "data-state": bar ? null : "na", style: bar ? "--p: " + pct + "%; --bar-c: " + c : null }, [el("i")])
    ]);
  }
  function welcomeCard() {
    var l = M().nextLesson();
    return el("section", { class: "k-card k-mind-welcome", "data-ui": "mind.welcome", "aria-label": "Welcome to Mind" }, [
      el("span", { class: "k-kicker", text: "Welcome to Mind" }),
      el("h2", { class: "k-mind-daily-t", text: "Start with how to tell a good argument from a bad one." }),
      el("p", { class: "k-muted", text: "Every path uses it, from memory research to free will. Fifteen minutes a day, mostly on your phone: a few cards, one short sitting, one question." }),
      l ? el("div", { class: "k-mind-unitline" }, [el("span", { class: "k-mono", text: l.unit }), el("span", {}, [el("b", { text: M().unit(l.unit).title }), el("small", { class: "k-muted", text: " · Foundation · " + M().unitLessons(l.unit).length + " lessons · first sitting ≈ 8 min" })])]) : null,
      el("div", { class: "k-mind-row" }, [l ? el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "mind.begin", text: "▶ Begin " + l.id, onclick: function () { KOS.show("ref", { subject: SID, ref: l.id }); } }) : null,
        el("button", { type: "button", class: "k-btn", text: "Look around first", onclick: function () { KOS.show("mind", { page: "path" }); } })].filter(Boolean))
    ].filter(Boolean));
  }
  function dailyState() { var d = M().peekUi().daily; return d && d.day === today() ? d : null; }
  function dailyCard() {
    var p = M().planDay(), d = dailyState(), doneToday = !!(d && d.doneAt);
    var what = p.exam ? "Reviews only until your exams end." : doneToday ? "Done · " + (d.mins || 15) + " min" :
      p.reviews.n && p.sitting ? "Reviews, then " + p.sitting.lesson + " " + M().lesson(p.sitting.lesson).pages[p.sitting.from].t.replace(/^The /, "the ") :
      p.sitting ? p.sitting.lesson + " · " + M().lesson(p.sitting.lesson).pages[p.sitting.from].t : p.reviews.n ? "Reviews, then one question" : "One question today";
    var resume = d && !d.doneAt && d.step && d.step !== "intro";
    var box = el("section", { class: "k-card k-mind-daily", "data-ui": "mind.daily", "aria-label": "Daily 15", "data-state": doneToday ? "done" : p.exam ? "exam" : null }, [
      el("div", { class: "k-mind-daily-top" }, [el("span", { class: "k-kicker", text: "Daily 15 · " + dayLabel(p.day) }),
        el("span", { class: "k-chip", style: "--chip-c: var(--mind)", text: p.exam ? "≈ 5 min" : "≈ 15 min" })]),
      el("h2", { class: "k-mind-daily-t", text: what }),
      UI().strip(p, { done: d && d.parts || {}, now: resume ? d.step : null }),
      p.exam ? el("p", { class: "k-muted", text: "Exam Season. Your sitting keeps its place." }) : null,
      el("div", { class: "k-mind-row" }, [
        doneToday && !p.reviews.n ? null : el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "mind.daily-start",
          text: doneToday ? "One more card set" : resume ? "▶ Resume" : p.exam ? "▶ Reviews · 5 min" : "▶ Start", onclick: function () { KOS.show("mind", { page: "daily", mode: doneToday ? "cards" : null }); } }),
        !p.exam && !doneToday && p.reviews.n ? el("button", { type: "button", class: "k-btn", "data-ui": "mind.daily-reviews", text: "Just reviews · 5′", onclick: function () { KOS.show("mind", { page: "daily", mode: "reviews" }); } }) : null
      ].filter(Boolean)),
      navigator.onLine === false ? el("p", { class: "k-mind-offline", text: "Offline. Lessons, cards and dialogues work; Ask Kurenai waits for a connection." }) : null
    ].filter(Boolean));
    return box;
  }
  function continueCard(l) {
    var ev = M().evidence(l.id);
    return el("button", { type: "button", class: "k-card k-subj-continue k-mind-continue", "data-ui": "mind.continue", onclick: function () { KOS.show("ref", { subject: SID, ref: l.id }); } }, [
      el("span", { class: "k-kicker", text: "Continue" }),
      el("span", { class: "k-mind-continue-t" }, [el("span", { class: "k-mono", text: l.id + " " }), el("b", { text: l.title })]),
      el("span", { class: "k-bar", "aria-hidden": "true", style: "--p: " + Math.round(100 * ev.read / Math.max(1, ev.pages)) + "%; --bar-c: var(--mind)" }, [el("i")]),
      el("span", { class: "k-mind-go", "aria-hidden": "true", text: "→" })
    ]);
  }
  function journalCard() {
    var rows = allEntries().slice(0, 4);
    return el("section", { class: "k-card k-mind-jcard", "data-ui": "mind.journal-card", "aria-label": "Journal" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Journal" }), el("span", { class: "k-card-meta", text: "titles only" }),
        el("button", { type: "button", class: "k-link", text: "Open →", onclick: function () { KOS.show("mind", { page: "journal" }); } })]),
      rows.length ? el("div", { class: "k-mind-jlist" }, rows.map(function (r) {
        return journalRow({ kind: r.kind, title: r.title, meta: r.p ? "v" + r.p.current.n + " · " + when(r.at) : when(r.at), go: function () { KOS.show("mind", { page: r.p ? "positions" : "journal" }); } });
      })) : el("p", { class: "k-muted", text: "Nothing yet. Save an insight from any lesson, or capture one." })
    ]);
  }
  /* the agreed order as the hero's path row (Code's stage path): one stop a path, the current one lit */
  function orderPath() {
    var paths = window.KOS_MIND.PATHS, cur = M().currentUnit(), curP = cur ? M().pathOf(cur.id) : null;
    return el("ol", { class: "k-mind-order", "aria-label": "Your order" }, window.KOS_MIND.ORDER.map(function (pid) {
      var p = paths.filter(function (x) { return x.id === pid; })[0];
      var done = p.units.every(function (u) { return M().unitState(u.id).state === "done"; });
      return el("li", { "data-state": done ? "done" : curP === p ? "current" : null }, [el("span", { class: "k-mind-order-id", text: pid }), el("span", { text: p.title })]);
    }));
  }
  /* the core path: the units of the agreed order as Code's unit cards (ref, title, lessons, foot) */
  function corePath() {
    var units = el("div", { class: "k-units k-mind-units", "data-ui": "study.units mind.units" });
    var cur = M().currentUnit(), n = 0;
    window.KOS_MIND.ORDER.forEach(function (pid) {
      var p = window.KOS_MIND.PATHS.filter(function (x) { return x.id === pid; })[0]; if (!p) return;
      p.units.forEach(function (u) {
        n++;
        var us = M().unitState(u.id), ls = M().unitLessons(u.id), isCur = cur && cur.id === u.id;
        var card = el("button", { type: "button", class: "k-unit k-mind-unit", "data-ui": "study.unit mind.unit", "data-state": !us.released ? "later" : isCur ? "current" : null,
          "aria-label": u.id + " " + u.title + ": " + (us.released ? us.completed + " of " + u.n + " completed" : "coming later"),
          onclick: function () { if (ls.length) KOS.show("ref", { subject: SID, ref: (us.next || ls[0]).id }); else KOS.show("mind", { page: "path" }); } }, [
          el("span", { class: "k-unit-ref", text: u.id }),
          el("span", { class: "k-unit-title", text: u.title }),
          el("span", { class: "k-unit-segs", "aria-hidden": "true" }, ls.map(function (l) { return el("span", { "data-state": M().completed(l.id) ? "done" : M().peek().lessons[l.id] ? "started" : null }); })),
          el("span", { class: "k-unit-foot", "data-ui": "study.unit-foot" }, !us.released ? ["Coming later"]
            : [el("b", { text: us.completed + " / " + u.n }), isCur && us.next ? " · " + us.next.id + " now" : " completed"])
        ]);
        if (isCur) KOS.ui.state(card, "current", true);
        units.appendChild(card);
      });
    });
    return el("section", { class: "k-subj-units k-mind-core", "aria-labelledby": "k-mind-core-h" }, [
      el("div", { class: "k-sectionhead" }, [el("h2", { id: "k-mind-core-h", text: "Core path" }), el("span", { class: "k-sectionhead-sub", text: window.KOS_MIND.ORDER.length + " paths · " + n + " units" }),
        el("div", { class: "k-sectionhead-actions" }, [el("button", { type: "button", class: "k-link", text: "All paths ›", onclick: function () { KOS.show("mind", { page: "path" }); } })])]),
      KOS.ui.scroller(units, { label: "Units", prevLabel: "Scroll to earlier units", nextLabel: "Scroll to later units" })
    ]);
  }

  function milestonesCard() {
    var ms = M().milestones();
    return el("section", { class: "k-card k-mind-miles", "data-ui": "mind.milestones", "aria-label": "Milestones" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Milestones" })]),
      el("ul", { class: "k-mind-mlist k-mind-mrow" }, ms.map(function (m) {
        return el("li", { "data-state": m.at ? "done" : null }, [el("span", { "aria-hidden": "true", text: m.at ? "✓" : "○" }), el("span", { text: m.title }),
          el("small", { class: "k-mono", text: m.at ? when(m.at) : m.of ? m.of[0] + " of " + m.of[1] : "" })]);
      }))
    ]);
  }



  /* ======================================================================
     the pages: #/mind/<page>
     ====================================================================== */
  KOS.views.mind = function (main, arg) {
    arg = arg || {};
    var page = arg.page || "path";
    if (!KOS_DATA.mind) { KOS.show("subject", "compsci"); return; }
    if (!J().loaded()) { J().ready(function () { if (main.isConnected) KOS.rerender(); }); }
    main.style.setProperty("--subj-c", "var(--mind)");
    KOS.shell.tree("none");   // the inner pages have no spine; a lesson page brings it back
    if (page === "daily") return daily(main, arg);
    shellActions();
    if (page === "journal") return journal(main, arg);
    if (page === "positions") return positionsPage(main);
    return pathPage(main);
  };

  /* ---------------- 32c · the path: every header, its paths as equal cards ---------------- */
  function pathPage(main) {
    main.appendChild(KOS.ui.pageHeader({ kicker: "Mind", title: "Path" }));
    var cur = M().currentUnit();
    function unitRow(u) {
      var us = M().unitState(u.id), ls = M().unitLessons(u.id), isCur = cur && cur.id === u.id;
      return el("button", { type: "button", class: "k-mind-urow", "data-ui": "mind.path-unit", "data-state": isCur ? "current" : us.state === "done" ? "done" : !ls.length ? "later" : null,
        onclick: function () { if (ls.length) KOS.show("ref", { subject: SID, ref: (us.next || ls[0]).id }); else KOS.ui.toast(u.id + " " + u.title + " comes in a later release."); } }, [
        el("span", { class: "k-mono", text: u.id }),
        el("b", { class: "k-mind-urow-t", text: u.title }),
        ls.length ? el("small", { class: "k-mono", text: us.completed + " / " + u.n }) : null
      ]);
    }
    function pathCard(p) {
      var crossing = p.header === "crossings", body = [];
      if (crossing) {
        var ls = M().unitLessons(p.units[0].id);
        body.push(el("p", { class: "k-mind-pgist", text: p.gist }));
        body.push(el("ul", { class: "k-mind-sides" }, (p.sides || []).map(function (sid) {
          var sp = window.KOS_MIND.PATHS.filter(function (x) { return x.id === sid; })[0];
          var done = sp ? sp.units.length && sp.units.every(function (u) { return M().unitState(u.id).state === "done"; }) : false;
          return el("li", { "data-state": done ? "done" : null }, [el("span", { "aria-hidden": "true", text: done ? "✓" : "○" }), sp ? sp.id + " " + sp.title : "CS Computer Science"]);
        })));
        if (ls.length) body.push(el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "mind.start-anyway", text: "Start anyway",
          onclick: function () { announce("Starting " + p.id + ". It builds on " + (p.sides || []).join(" and ") + "."); KOS.show("ref", { subject: SID, ref: ls[0].id }); } }));
      } else body = p.units.map(unitRow);
      return el("section", { class: "k-card k-mind-pcard", "data-ui": "mind.path-card", "aria-label": p.id + " " + p.title }, [
        el("div", { class: "k-mind-pcard-h" }, [el("span", { class: "k-mind-pid", text: p.id }), el("b", { text: p.title })])
      ].concat(body));
    }
    (window.KOS_MIND.HEADERS || []).forEach(function (h) {
      var all = window.KOS_MIND.PATHS.filter(function (p) { return p.header === h.id; });
      /* a path with no units written yet is named on the section line, not drawn as an empty card */
      var ps = all.filter(function (p) { return p.units.length; }), later = all.filter(function (p) { return !p.units.length; });
      main.appendChild(el("section", { class: "k-mind-hsec", "aria-labelledby": "mind-h-" + h.id }, [
        el("div", { class: "k-sectionhead" }, [el("h2", { id: "mind-h-" + h.id, text: h.name }), el("span", { class: "k-sectionhead-sub",
          text: all.length + (all.length === 1 ? " path" : " paths") + (later.length ? " · " + later.map(function (p) { return p.id + " " + p.title; }).join(", ") + " later" : "") })]),
        el("div", { class: "k-mind-pgrid" }, ps.map(pathCard))
      ]));
    });
    /* credits, as Japanese's licences page gives them */
    main.appendChild(el("p", { class: "k-mind-credits k-muted", "data-ui": "mind.credits" }, [el("b", { text: "Credits · " }),
      "Kurenai, Ren, the backgrounds and the philosopher cards are original to this app and AI-assisted: made with Gemini, and one card (Simone de Beauvoir) with ChatGPT."]));
  }

  /* ---------------- 32n · the Journal ---------------- */
  function journal(main, arg) {
    var ui = M().ui(), f = ui.jf = ui.jf && typeof ui.jf === "object" ? ui.jf : {};
    var q = f.q || "";
    main.appendChild(KOS.ui.pageHeader({ kicker: "Mind", title: "Journal" }));   // + Capture rides the header's actions
    var rows = allEntries(), counts = { all: rows.length };
    rows.forEach(function (r) { counts[r.kind] = (counts[r.kind] || 0) + 1; });
    var kinds = el("div", { class: "k-mind-kinds", role: "group", "aria-label": "Kind" }, [["all", "All"]].concat(Object.keys(UI().KINDS).map(function (k) { return [k, UI().KINDS[k][1]]; })).map(function (k) {
      return el("button", { type: "button", class: "k-mind-kindpick", "aria-pressed": String((f.kind || "all") === k[0]), onclick: function () { f.kind = k[0]; KOS.store.save(); KOS.rerender(); announce((counts[k[0]] || 0) + " entries, " + k[1] + "."); } },
        [k[0] === "all" ? "All" : UI().kind(k[0]), counts[k[0]] ? el("span", { class: "k-mono", text: " · " + counts[k[0]] }) : null].filter(Boolean));
    }));
    var concepts = M().metConcepts();
    var csel = el("select", { class: "k-mind-select", "aria-label": "Concept", onchange: function () { f.concept = csel.value || null; KOS.store.save(); KOS.rerender(); } },
      [el("option", { value: "", text: "Concept: any" })].concat(concepts.map(function (c) { return el("option", { value: c, text: M().concept(c).name }); })));
    csel.value = f.concept || "";
    var month = el("button", { type: "button", class: "k-btn k-btn--sm", "aria-pressed": String(!!f.month), text: "This month", onclick: function () { f.month = !f.month; KOS.store.save(); KOS.rerender(); } });
    var search = el("input", { type: "search", class: "k-mind-input", placeholder: "⌕ Search the Journal", "aria-label": "Search the Journal", value: q,
      oninput: KOS.ui.debounce(function () { f.q = search.value; KOS.store.save(); paintList(); }, 200) });
    main.appendChild(el("div", { class: "k-mind-jtools" }, [kinds, el("div", { class: "k-mind-row" }, [csel, month, search])]));
    var list = el("div", { class: "k-mind-jentries", "data-ui": "mind.journal-list" });
    function paintList() {
      var now = new Date(), m0 = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      var shown = rows.filter(function (r) {
        if (f.kind && f.kind !== "all" && r.kind !== f.kind) return false;
        if (f.month && r.at < m0) return false;
        if (f.concept) { var cs = r.e ? r.e.concepts : (M().lesson(r.p.lesson).concepts || []); if (cs.indexOf(f.concept) < 0) return false; }
        return true;
      });
      if (f.q) { var hits = J().search(f.q, shown.filter(function (r) { return r.e; }).map(function (r) { return r.e; })).map(function (e) { return e.id; });
        shown = shown.filter(function (r) { return r.e ? hits.indexOf(r.id) >= 0 : r.title.toLowerCase().indexOf(f.q.toLowerCase()) >= 0; }); }
      list.innerHTML = "";
      if (!rows.length) {
        list.appendChild(KOS.ui.emptyState({ mark: "✦", title: "Nothing here yet.", body: "Save an insight from any lesson, keep a quote, or capture a question on the bus. It is private: only you read it.",
          action: el("button", { type: "button", class: "k-btn", text: "+ New entry", onclick: function () { capture(); } }) }));
        return;
      }
      if (!shown.length) { list.appendChild(el("p", { class: "k-muted", text: "No entries match." })); return; }
      shown.forEach(function (r) { list.appendChild(entryCard(r)); });
    }
    paintList();
    var side = el("div", { class: "k-mind-jside" }, [bqCard(), exportCard()]);
    main.appendChild(el("div", { class: "k-mind-jgrid" }, [list, side]));
    if (arg.id) setTimeout(function () { var n = list.querySelector("[data-id='" + arg.id + "']"); if (n && n.scrollIntoView) { n.scrollIntoView({ block: "center" }); n.focus(); } }, 50);
  }
  function entryCard(r) {
    var C = function (id) { var c = M().concept(id); return c ? el("span", { class: "k-chip", text: c.name }) : null; };
    if (r.p) {
      var p = r.p, v = p.current;
      return el("article", { class: "k-card k-mind-entry", "data-id": r.id, tabindex: "-1", "data-kind": "position" }, [
        el("div", { class: "k-mind-entry-h" }, [UI().kind("position"), el("small", { class: "k-mono k-muted", text: "v" + v.n + " · " + v.conf + "% · " + when(v.at) })]),
        el("b", { class: "k-mind-entry-t", text: p.q }),
        el("p", { class: "k-mind-entry-x", text: p.options[v.answer] + (v.reason ? ": \"" + v.reason + "\"" : "") }),
        el("div", { class: "k-mind-row" }, [el("button", { type: "button", class: "k-btn k-btn--sm", text: "Versions", onclick: function () { KOS.show("mind", { page: "positions" }); } })])
      ]);
    }
    var e = r.e;
    return el("article", { class: "k-card k-mind-entry", "data-id": e.id, tabindex: "-1", "data-kind": e.kind }, [
      el("div", { class: "k-mind-entry-h" }, [UI().kind(e.kind), el("small", { class: "k-mono k-muted", text: when(e.at) + (e.src && e.src.kind === "stories" ? " · For your stories" : e.src && e.src.kind === "dialogue" ? " · a dialogue" : e.src && e.src.kind === "kurenai" ? " · Ask Kurenai" : "") })]),
      e.kind === "quote" ? el("blockquote", { class: "k-mind-read", text: e.text }) : el("b", { class: "k-mind-entry-t", text: e.title }),
      e.kind === "quote" && e.source ? el("small", { class: "k-muted", text: "— " + e.source }) : e.text && e.text !== e.title ? el("p", { class: "k-mind-entry-x", text: e.text }) : null,
      e.concepts.length || e.lesson ? el("div", { class: "k-mind-chips" }, e.concepts.map(C).filter(Boolean).concat(e.lesson ? [el("span", { class: "k-chip k-mono", text: e.lesson })] : [])) : null,
      el("div", { class: "k-mind-row" }, [
        e.kind === "question" ? el("button", { type: "button", class: "k-btn k-btn--sm", text: "Make it the Big Question", onclick: function () { M().setBq(e.title, e.id); announce("This week's Big Question is set."); KOS.rerender(); } }) : null,
        el("button", { type: "button", class: "k-btn k-btn--sm", text: "Ask Kurenai", onclick: function () { KOS.mindRun.ask({ concept: e.concepts[0], lesson: e.lesson, typed: e.title }); } }),
        el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", text: "Delete", onclick: function () {
          KOS.ui.confirm({ title: "Delete this entry?", body: "It leaves this device and your other devices. This can't be undone.", danger: true, confirm: "Delete" }, function () { J().remove(e.id, function () { KOS.rerender(); }); });
        } })
      ].filter(Boolean))
    ].filter(Boolean));
  }
  function bqCard() {
    var b = M().bq(), day = new Date(today() + "T12:00:00").getDay();
    var box = el("section", { class: "k-card k-mind-bq", "data-ui": "mind.big-question", "aria-label": "Big Question" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Big Question" }), el("span", { class: "k-card-meta", text: "this week" })])]);
    if (!b || !b.q) {
      var qs = J().list().filter(function (e) { return e.kind === "question"; });
      box.appendChild(el("p", { class: "k-muted", text: qs.length ? "Pick one of your Questions for the week." : "Capture a Question to start one." }));
      if (qs.length) box.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", text: "Use: " + qs[0].title.slice(0, 50), onclick: function () { M().setBq(qs[0].title, qs[0].id); KOS.rerender(); } }));
      return box;
    }
    box.appendChild(el("b", { class: "k-mind-entry-t", text: b.q }));
    var lines = b.lines || {};
    box.appendChild(el("ul", { class: "k-mind-bqlines" }, Object.keys(lines).sort().map(function (d) { return el("li", {}, [el("small", { class: "k-mono", text: DOW[new Date(d + "T12:00:00").getDay()] }), el("span", { text: "• " + lines[d] })]); })));
    if (b.closedAt) { box.appendChild(el("p", { class: "k-muted", text: "Closed: " + b.synth.join(" · ") })); return box; }
    if (day === 0) {
      box.appendChild(el("p", { class: "k-muted", text: "Sunday · close the thread: a few bullets on where you got to. About 3 minutes." }));
      box.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Close the thread", onclick: function () { closeBq(b); } }));
    } else {
      var inp = el("input", { type: "text", class: "k-mind-input", placeholder: "+ Add today's line", "aria-label": "Today's line", onkeydown: function (e) { if (e.key === "Enter" && inp.value.trim()) { M().addBqLine(inp.value); KOS.rerender(); } } });
      inp.value = lines[today()] || "";
      box.appendChild(inp);
    }
    return box;
  }
  function closeBq(b) {
    var val = [];
    var bb = UI().bullets({ label: "Your synthesis", onChange: function (v) { val = v; } });
    var sh = UI().sheet({ kicker: "Sunday synthesis", title: b.q, body: [el("p", { class: "k-muted", text: "Your lines are on the card. A few bullets: where did you get to?" }), bb.node],
      foot: [el("button", { type: "button", class: "k-btn", text: "Later", onclick: function () { sh.close(); } }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Close the thread", onclick: function () {
          var out = M().closeBq(bb.value()); if (!out) return;
          J().add({ kind: "reflection", title: "Big Question: " + b.q, text: Object.keys(b.lines || {}).sort().map(function (d) { return "• " + b.lines[d]; }).concat(["", "Where I got to:"]).concat(out.synth.map(function (s) { return "• " + s; })).join("\n"), src: { kind: "bq", ref: M().weekOf() } });
          sh.close(); announce("Thread closed and saved."); KOS.rerender(); } })] });
    setTimeout(bb.focus, 30);
  }
  function exportCard() {
    var concepts = M().metConcepts();
    var sel = el("select", { class: "k-mind-select", "aria-label": "What to export" }, [el("option", { value: "", text: "Everything" })]
      .concat(concepts.map(function (c) { return el("option", { value: c, text: M().concept(c).name }); })));
    return el("section", { class: "k-card k-mind-export", "data-ui": "mind.export", "aria-label": "Commonplace book" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Commonplace book" }), el("span", { class: "k-card-meta", text: "Markdown" })]),
      el("div", { class: "k-mind-exportrow" }, [sel,
        el("button", { type: "button", class: "k-btn k-btn--sm", text: "↓ Export", onclick: function () {
          download(sel.value ? J().markdown({ concept: sel.value }) : J().markdown(), sel.value ? "commonplace-" + sel.value + ".md" : "commonplace-book.md"); } })])
    ]);
  }
  function download(text, name) {
    var blob = new Blob([text], { type: "text/markdown" }), a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
  }

  /* ---------------- 32k–32l · positions ---------------- */
  function positionsPage(main) {
    main.appendChild(KOS.ui.pageHeader({ kicker: "Mind", title: "Positions" }));
    var ps = M().positions(), rv = M().revisitsDue(), tn = M().tensionsDue();
    var col = el("div", { class: "k-mind-poscol" });
    rv.forEach(function (p) { col.appendChild(KOS.mindRun.revisitCard(p.lesson, { onDone: function () { KOS.rerender(); } })); });
    tn.forEach(function (t) { col.appendChild(tensionCard(t)); });
    if (!ps.length) {
      var nx = M().lessons().filter(function (l) { return l.kind === "contested" && !M().promptDone(l.id); })[0];
      col.appendChild(KOS.ui.emptyState({ mark: "◆", title: "No positions yet", body: "Your positions appear here after a contested lesson." + (nx ? " " + nx.id + " is the next one." : ""),
        action: nx ? el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Open " + nx.id, onclick: function () { KOS.show("ref", { subject: SID, ref: nx.id }); } }) : null }));
      main.appendChild(col);
      return;
    }
    var days = {}; ps.forEach(function (p) { p.versions.forEach(function (v) { days[v.day] = 1; }); });
    if (Object.keys(days).length >= 2) col.appendChild(timeline(ps));   // a timeline needs time to show (invariant 76)
    ps.forEach(function (p) { col.appendChild(versionsCard(p)); });
    main.appendChild(col);
  }
  function versionsCard(p) {
    return el("section", { class: "k-card k-mind-versions", "data-ui": "mind.versions", "aria-label": p.q, "data-state": p.retiredAt ? "retired" : null }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: p.q }), el("span", { class: "k-card-meta k-mono", text: p.lesson }),
        el("button", { type: "button", class: "k-btn k-btn--sm", text: "Revise", onclick: function () { KOS.mindRun.position(p.lesson, { revise: true, onDone: function () { KOS.rerender(); } }); } })]),
      el("ol", { class: "k-mind-vlist", reversed: "" }, p.versions.slice().reverse().map(function (v, i) {
        return el("li", { "data-state": i === 0 ? (p.retiredAt ? "retired" : "current") : null }, [
          el("div", { class: "k-mind-vrow" }, [el("span", { class: "k-mono", text: "v" + v.n }), el("span", { class: "k-mono k-muted", text: when(v.at) }), el("b", { text: p.options[v.answer] }), el("span", { class: "k-mono", text: v.conf + "%" }),
            i === 0 ? el("small", { class: "k-chip", text: p.retiredAt ? "retired" : "current" }) : null].filter(Boolean)),
          v.reason ? el("p", { class: "k-mind-entry-x", text: v.reason }) : null,
          v.changed ? el("p", { class: "k-muted" }, [el("b", { text: "What changed my mind · " }), v.changed]) : null,
          v.objection ? el("p", { class: "k-muted" }, [el("b", { text: "Objection · " }), v.objection, v.reply ? el("span", {}, [el("br"), el("b", { text: "Reply · " }), v.reply]) : null].filter(Boolean)) : null
        ].filter(Boolean));
      }))
    ]);
  }
  /* the belief timeline: one lane a position, a dot a version (size = confidence), a hollow ring
     where the answer changed. The SVG is one image; the cards beneath are the real control. */
  function timeline(ps) {
    var NS = "http://www.w3.org/2000/svg";
    function s(tag, a) { var n = document.createElementNS(NS, tag); Object.keys(a || {}).forEach(function (k) { n.setAttribute(k, a[k]); }); return n; }
    var all = []; ps.forEach(function (p) { p.versions.forEach(function (v) { all.push(v.at); }); });
    var t0 = Math.min.apply(null, all), t1 = Math.max(Date.now(), Math.max.apply(null, all)), span = Math.max(1, t1 - t0);
    var W = 800, lane = 44, H = 30 + ps.length * lane, x0 = 220, x1 = W - 24;
    var svg = s("svg", { viewBox: "0 0 " + W + " " + H, class: "k-mind-tl-svg", role: "img", "aria-label": "Belief timeline: " + ps.length + " positions, " + all.length + " versions. The cards below list every version." });
    ps.forEach(function (p, i) {
      var y = 26 + i * lane;
      var label = s("text", { x: 8, y: y + 4, class: "k-mind-tl-label" }); label.textContent = p.q.length > 30 ? p.q.slice(0, 29) + "…" : p.q; svg.appendChild(label);
      svg.appendChild(s("line", { x1: x0, x2: x1, y1: y, y2: y, class: "k-mind-tl-lane" }));
      p.versions.forEach(function (v, j) {
        var x = x0 + (x1 - x0) * (v.at - t0) / span, r = 4 + (v.conf - 50) / 49 * 6;
        var changedAns = j > 0 && v.answer !== p.versions[j - 1].answer;
        svg.appendChild(s("circle", { cx: x.toFixed(1), cy: y, r: r.toFixed(1), class: changedAns ? "k-mind-tl-ring" : "k-mind-tl-dot" }));
      });
    });
    return el("section", { class: "k-card k-mind-tl", "data-ui": "mind.timeline", "aria-label": "Belief timeline" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Belief timeline" }), el("span", { class: "k-card-meta", text: "dot size is confidence · a ring is a changed answer" })]),
      KOS.ui.scroller(el("div", { class: "k-mind-tl-wrap" }, [svg]), { label: "Belief timeline", prevLabel: "Scroll to earlier versions", nextLabel: "Scroll to later versions" })
    ]);
  }
  function tensionCard(t) {
    var la = M().lesson(t.a.lesson), lb = M().lesson(t.b.lesson);
    var box = el("section", { class: "k-card k-mind-tension", "data-ui": "mind.tension", "aria-label": "A tension between two answers" }, [
      el("span", { class: "k-kicker", text: "A tension between two answers · authored pair · not a verdict" }),
      el("div", { class: "k-mind-tpair" }, [side(t.a, la), side(t.b, lb)]),
      el("b", { class: "k-mind-entry-t", text: t.q }),
      el("div", { class: "k-mind-row" }, [
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Open the dialogue", onclick: function () {
          box.replaceWith(KOS.mindRun.dialogue(t.a.lesson, { tree: t.tree, onEnd: function () { M().setTension(t.id, "done"); } })); } }),
        el("button", { type: "button", class: "k-btn", text: "Not now", onclick: function () { M().setTension(t.id, "later"); KOS.rerender(); } })
      ]),
      el("small", { class: "k-muted", text: "Many careful people answer this way. The dialogue asks what you think explains it; it does not say you are inconsistent." })
    ]);
    function side(sd, l) { return el("div", { class: "k-mind-tside" }, [el("b", { text: sd.label || (l ? l.title : sd.lesson) }), el("small", { text: sd.said || "" })]); }
    return box;
  }

  /* ---------------- 32y · a checkpoint, on its lesson's page ---------------- */
  function checkpoint(panel, l) {
    var cp = window.KOS_MIND.CHECKPOINTS[l.unit]; if (!cp) return;
    var ui = M().ui(); ui.cp = ui.cp && typeof ui.cp === "object" ? ui.cp : {};
    var run = ui.cp[l.unit] = ui.cp[l.unit] && typeof ui.cp[l.unit] === "object" ? ui.cp[l.unit] : { step: "intro" };
    var rec = M().peek().checkpoints[l.unit];
    var box = el("section", { class: "k-card k-mind-cp", "data-ui": "mind.checkpoint", "aria-label": cp.title });
    panel.appendChild(KOS.mindTopic.pageBody(l, 0, l.id));
    panel.appendChild(box);
    /* its one page counts as read after the same dwell as any lesson page (invariant 107's rule) */
    setTimeout(function () { if (box.isConnected && M().markPage(l.id, 0)) document.dispatchEvent(new window.CustomEvent("kos:mind-evidence", { detail: { ref: l.id } })); }, 2500);
    function save() { KOS.store.save(); }
    function stepStrip() {
      var steps = [["cards", "Cards · " + cp.cards.length], ["apply", "Apply · " + cp.apply.length], ["map", "Map"], ["synth", "Synthesis"]];
      var order = steps.map(function (s) { return s[0]; }), at = order.indexOf(run.step);
      return el("ol", { class: "k-mind-cpsteps", "aria-label": "Checkpoint steps" }, steps.map(function (s, i) { return el("li", { "data-state": at > i || run.step === "done" ? "done" : at === i ? "now" : null }, [at > i || run.step === "done" ? "✓ " : "", s[1]]); }));
    }
    function draw() {
      box.innerHTML = "";
      box.appendChild(stepStrip());
      if (run.step === "intro") {
        box.appendChild(el("p", { text: rec && rec.doneAt ? "Done: " + when(rec.doneAt) + " · " + Object.keys(rec.synth.ticks || {}).length + " of " + cp.synthesis.rubric.length + " rubric points." : "Cards, three scenarios, the map, then a short judgement." }));
        box.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "mind.cp-start", text: rec && rec.doneAt ? "Retake" : "Start the checkpoint",
          onclick: function () { run = ui.cp[l.unit] = { step: "cards", i: 0, cards: 0, apply: {}, map: null, synth: [], ticks: {} }; save(); draw(); } }));
        return;
      }
      if (run.step === "cards") return cardsStep();
      if (run.step === "apply") return applyStep();
      if (run.step === "map") return mapStep();
      if (run.step === "synth") return synthStep();
      if (run.step === "done") return doneStep();
    }
    function cardsStep() {
      var k = cp.cards[run.i], cd = M().cardOf(k), shown = false;
      var face = el("div", { class: "k-mind-flash", "data-ui": "mind.cp-card" }, [el("span", { class: "k-mono k-muted", text: "Card " + (run.i + 1) + " of " + cp.cards.length }), el("b", { class: "k-mind-flash-q", text: cd.q })]);
      var ans = el("p", { class: "k-mind-flash-a", hidden: "", text: cd.a });
      var btns = el("div", { class: "k-mind-row" });
      face.appendChild(ans);
      box.appendChild(face);
      box.appendChild(btns);
      function paint() {
        btns.innerHTML = "";
        if (!shown) { btns.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", text: "Show the answer", onclick: function () { shown = true; ans.hidden = false; paint(); } })); return; }
        [["Had it", 1], ["Not quite", 0]].forEach(function (g) {
          btns.appendChild(el("button", { type: "button", class: "k-btn", text: g[0], onclick: function () {
            run.cards += g[1]; run.i++; if (run.i >= cp.cards.length) { run.step = "apply"; run.i = 0; } save(); draw(); } }));
        });
        btns.appendChild(el("small", { class: "k-muted", text: "Self-marked: it moves no schedule." }));
      }
      paint();
    }
    function applyStep() {
      var it = cp.apply[run.i], ans = run.ans;
      box.appendChild(el("span", { class: "k-mono k-muted", text: "Scenario " + (run.i + 1) + " of " + cp.apply.length }));
      box.appendChild(el("h3", { class: "k-mind-vote-q", text: it.q }));
      box.appendChild(el("div", { class: "k-mind-opts", role: "group", "aria-label": "Answers" }, it.options.map(function (op, i) {
        var st = ans != null ? (i === it.a ? "right" : i === ans ? "wrong" : null) : null;
        return el("button", { type: "button", class: "k-mind-opt", "data-state": st, disabled: ans != null ? "" : null, onclick: function () {
          run.ans = i; if (i === it.a) run.apply[run.i] = true; save(); announce(i === it.a ? "Right." : "Not quite."); draw(); } },
          [el("span", { class: "k-mono", "aria-hidden": "true", text: "ABCD"[i] }), op, st === "right" ? el("span", { class: "k-mind-mark", text: " ✓ Right" }) : st === "wrong" ? el("span", { class: "k-mind-mark", text: " ✗ Not this" }) : null].filter(Boolean));
      })));
      if (ans != null) {
        box.appendChild(el("p", { class: "k-mind-why", role: "status", text: it.why }));
        box.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", text: "Next ›", onclick: function () {
          run.ans = null; run.i++; if (run.i >= cp.apply.length) { run.step = "map"; run.i = 0; } save(); draw(); } }));
      }
    }
    function mapStep() {
      var rows = run.map || cp.map.claims.map(function (t, i) { return { id: "c" + i, t: t, j: null, d: 0 }; });
      box.appendChild(el("p", { text: "Map the argument: put the conclusion at the top, then indent each claim under what it supports or answers, and set its joint." }));
      var mp = UI().argmap({ rows: rows, edit: true, caption: "Argument Mapper · " + l.id, onChange: function (r) { run.map = r; save(); } });
      box.appendChild(mp);
      box.appendChild(el("div", { class: "k-mind-row" }, [
        el("button", { type: "button", class: "k-btn", text: "Compare with a model map", onclick: function () {
          var model = cp.map.model.map(function (m) { return { t: cp.map.claims[m.t], j: m.j, d: m.d }; });
          var sh = UI().sheet({ title: "One good map", kicker: "Yours may differ and still be right", body: [UI().argmap({ rows: model })], foot: [el("span"), el("button", { type: "button", class: "k-btn k-btn--primary", text: "Close", onclick: function () { sh.close(); } })] });
        } }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Next · the synthesis ›", onclick: function () { run.map = mp.value(); run.step = "synth"; save(); draw(); } })
      ]));
    }
    function synthStep() {
      box.appendChild(el("p", { class: "k-mind-read", text: cp.synthesis.q }));
      var bb = UI().bullets({ value: run.synth, label: "Your judgement", onChange: function (v) { run.synth = v; save(); } });
      box.appendChild(bb.node);
      box.appendChild(el("h3", { class: "k-mind-sub", text: "Mark it against the rubric" }));
      box.appendChild(el("div", { class: "k-mind-ticks", role: "group", "aria-label": "Rubric" }, cp.synthesis.rubric.map(function (row, i) {
        var cb = el("input", { type: "checkbox", class: "k-box", onchange: function () { run.ticks[i] = cb.checked; save(); } });
        cb.checked = !!run.ticks[i];
        return el("label", { class: "k-mind-tick" }, [cb, el("span", { text: row.t })]);
      })));
      var msg = el("p", { class: "k-mind-err", role: "alert", hidden: "" });
      box.appendChild(msg);
      box.appendChild(el("div", { class: "k-mind-row" }, [
        el("button", { type: "button", class: "k-btn", text: "Ask Kurenai for a second look", onclick: function () { KOS.mindRun.ask({ mode: "differently", typed: bb.value().join("\n"), lesson: null }); } }),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "mind.cp-finish", text: "Finish checkpoint", onclick: function () {
          var v = bb.value(); if (!v.length) { msg.hidden = false; msg.textContent = "Add one bullet first."; return; }
          var out = M().recordCheckpoint(l.unit, { cards: run.cards, apply: run.apply, synth: { bullets: v, ticks: run.ticks }, map: run.map });
          run.step = "done"; run.result = out; save();
          announce("Checkpoint done. " + out.rubric + " of " + out.of + " rubric points.");
          document.dispatchEvent(new window.CustomEvent("kos:mind-evidence", { detail: { ref: l.id } }));
          draw();
        } })
      ]));
      setTimeout(bb.focus, 30);
    }
    function doneStep() {
      var r = run.result || {}, pay = KOS.mind.CHECK_PAY;
      box.appendChild(el("div", { class: "k-mind-done", "data-ui": "mind.cp-done" }, [el("span", { class: "k-mind-emblem", lang: "ja", "aria-hidden": "true", text: "心" }), el("div", {}, [
        el("b", { text: "Checkpoint done" }),
        el("ul", { class: "k-mind-list" }, [el("li", { text: "Cards · " + run.cards + " of " + cp.cards.length }), el("li", { text: "Apply scenarios · " + Object.keys(run.apply || {}).length + " of " + cp.apply.length }),
          el("li", { text: "Synthesis · " + (r.rubric || 0) + " of " + (r.of || cp.synthesis.rubric.length) + " rubric points" })]),
        el("p", { class: "k-muted", text: r.paid ? "◆ +" + pay.xp + " XP · +" + pay.gold + " gold · +" + pay.hp + " HP, paid once." : "Retaken: it never pays twice." })])]));
      box.appendChild(el("button", { type: "button", class: "k-btn", text: "Back to Mind", onclick: function () { ui.cp[l.unit] = { step: "intro" }; save(); KOS.show("subject", SID); } }));
    }
    draw();
  }

  /* ======================================================================
     32z–32ab · the Daily 15: reviews · one sitting · one question
     ====================================================================== */
  function daily(main, arg) {
    var ui = M().ui(), t = today();
    var d = ui.daily && ui.daily.day === t ? ui.daily : (ui.daily = { day: t, step: "intro", parts: {}, results: [] });
    var plan = M().planDay(t);
    if (arg.mode === "reviews" && d.step === "intro") { d.only = "reviews"; }
    if (arg.mode === "cards" && d.doneAt) { d.step = "reviews"; d.extra = true; d.results = []; }
    KOS.store.save();
    var frame = el("div", { class: "k-mind-run", "data-ui": "mind.daily-run" });
    main.appendChild(frame);
    var head = el("div", { class: "k-mind-run-h" }, [
      el("button", { type: "button", class: "k-iconbtn", "aria-label": "Leave the Daily 15 (it keeps its place)", text: "✕", onclick: function () { KOS.show("subject", SID); } }),
      el("span", { class: "k-kicker", text: "Daily 15 · Mind" }), el("span", { class: "k-mono k-muted", "data-ui": "mind.daily-clock" })
    ]);
    frame.appendChild(head);
    var stripSlot = el("div"), body = el("div", { class: "k-mind-run-b" });
    frame.appendChild(stripSlot); frame.appendChild(body);
    function save() { KOS.store.save(); }
    function paintStrip() { stripSlot.innerHTML = ""; stripSlot.appendChild(UI().strip(plan, { done: d.parts, now: d.step })); }
    function startFocus() {
      if (KOS.focus && KOS.focus.state && KOS.focus.state() === "idle" && KOS.focus.start) {
        KOS.focus.start({ mode: "stopwatch", subject: SID, objective: "Mind · Daily 15", limitMin: 60, minimised: true });
        d.focusId = KOS.focus.activeId && KOS.focus.activeId();
        save();
      }
    }
    function stopFocus() {
      if (d.focusId && KOS.focus && KOS.focus.activeId && KOS.focus.activeId() === d.focusId) {
        var secs = KOS.focus.workSeconds ? KOS.focus.workSeconds() : 0;
        d.mins = Math.max(1, Math.round(secs / 60));
        KOS.focus.endEarly({ confirmed: true, review: false });
      }
      d.focusId = null;
    }
    function go(step) { d.step = step; save(); draw(); }
    function nextAfter(part) {
      d.parts[part] = true;
      if (d.only === "reviews" || plan.exam || d.extra) return go("done");
      if (part === "reviews") return go(plan.sitting ? "sitting" : plan.question ? "question" : "done");
      if (part === "sitting") return go(plan.question ? "question" : "done");
      return go("done");
    }
    function draw() {
      paintStrip();
      body.innerHTML = "";
      if (d.step === "intro") return intro();
      if (d.step === "reviews") return reviews();
      if (d.step === "sitting") return sitting();
      if (d.step === "question") return questionPart();
      return done();
    }
    function intro() {
      var parts = plan.exam ? [["Reviews", plan.reviews.n ? plan.reviews.n + " cards due · capped at 15" : "No cards due", "~5′"]] : [
        ["Reviews", plan.reviews.n ? plan.reviews.n + (plan.reviews.n === 1 ? " card due" : " cards due") + " · capped at 15" : "No cards due", "~4′"],
        ["One sitting", plan.sitting ? plan.sitting.lesson + " " + plan.sitting.title + " · page " + (plan.sitting.from + 1) + " of " + M().pages(plan.sitting.lesson).length + " · " + M().pages(plan.sitting.lesson)[plan.sitting.from].t : "Nothing to read today", "~8′"],
        ["One question", plan.question ? qLabel(plan.question.q) : "—", "~3′"]];
      body.appendChild(el("span", { class: "k-kicker", text: "Mind · Daily 15" }));
      body.appendChild(el("h1", { class: "k-mind-run-t", text: plan.exam ? "Exam Season: reviews only" : "Fifteen minutes, in three parts" }));
      body.appendChild(el("ol", { class: "k-mind-parts" }, parts.map(function (p, i) { return el("li", {}, [el("span", { class: "k-mind-partn", text: String(i + 1) }), el("span", {}, [el("b", { text: p[0] }), el("small", { class: "k-muted", text: p[1] })]), el("span", { class: "k-mono k-muted", text: p[2] })]); })));
      if (plan.exam) body.appendChild(el("p", { class: "k-muted", text: "Your sitting keeps its place for after your exams." }));
      body.appendChild(el("div", { class: "k-mind-thumb" }, [
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "mind.daily-go", text: plan.exam ? "▶ Reviews · 5 min" : "▶ Start Daily 15", onclick: function () {
          startFocus(); go(plan.reviews.n ? "reviews" : plan.sitting && !plan.exam && d.only !== "reviews" ? "sitting" : plan.question && !plan.exam && d.only !== "reviews" ? "question" : "done"); } }),
        !plan.exam && d.only !== "reviews" && plan.reviews.n ? el("button", { type: "button", class: "k-btn", text: "Just reviews · 5 min", onclick: function () { d.only = "reviews"; startFocus(); go(plan.reviews.n ? "reviews" : "done"); } }) : null
      ].filter(Boolean)));
    }
    function qLabel(q) {
      return q.kind === "parked" ? "A parked prompt · " + q.lesson : q.kind === "revisit" ? "A revisit · your " + q.lesson + " position" : q.kind === "tension" ? "A tension between two answers"
        : q.kind === "field" ? "Field Guide · name it" : q.sunday ? "The Big Question · Sunday synthesis" : "The week's Big Question";
    }
    /* part 1 · reviews: one card at a time, self-graded on FSRS, logged as ONE entry */
    function reviews() {
      var queue = M().due(t).filter(function (k) { return !d.results.some(function (r) { return r.key === k; }); });
      if (!queue.length) {
        if (d.results.length && !d.logged) { var out = M().finishReviews(d.results); d.logged = true; d.paid = out.paid; save(); announce("Reviews done."); }
        return nextAfter("reviews");
      }
      var k = queue[0], cd = M().cardOf(k), n = d.results.length + 1, total = d.results.length + queue.length, shown = !!d.shown;
      var pv = M().preview(k);
      body.appendChild(el("div", { class: "k-mind-flash", "data-ui": "mind.daily-card" }, [
        el("span", { class: "k-mono k-muted", text: "Card " + n + " of " + total }),
        cd.kind === "distinction" ? el("span", { class: "k-kicker", text: "Key distinction" }) : null,
        el("b", { class: "k-mind-flash-q", text: cd.q }),
        shown ? el("p", { class: "k-mind-flash-a", text: cd.a }) : null,
        shown ? el("small", { class: "k-muted", text: cd.concept.name + (cd.concept.lesson ? " · " + cd.concept.lesson : "") }) : null
      ].filter(Boolean)));
      var g = el("div", { class: "k-mind-thumb k-mind-grades", role: "group", "aria-label": shown ? "How well did you recall it?" : "Answer" });
      if (!shown) g.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-ui": "mind.show-answer", text: "Show the answer", onclick: function () { d.shown = true; save(); draw(); } }));
      else [["Again", 1, "again"], ["Hard", 2, "hard"], ["Good", 3, "good"], ["Easy", 4, "easy"]].forEach(function (x) {
        g.appendChild(el("button", { type: "button", class: "k-mind-grade", "data-ui": "mind.grade", "data-grade": x[2], onclick: function () {
          var r = M().rateCard(k, x[1]); d.results.push({ key: k, grade: x[1] }); d.shown = false; save();
          announce(x[0] + ". Back in " + r.ivl + (r.ivl === 1 ? " day." : " days.")); draw(); } }, [el("b", { text: x[0] }), el("small", { class: "k-mono", text: pv[x[2]] + " d" })]));
      });
      body.appendChild(g);
    }
    /* part 2 · the sitting: the lesson's pages, from the first unread to the sitting's break */
    function sitting() {
      var s = plan.sitting; if (!s) return nextAfter("sitting");
      var l = M().lesson(s.lesson);
      if (d.sitPage == null || d.sitLesson !== s.lesson) { d.sitLesson = s.lesson; d.sitPage = s.from; save(); }
      if (d.resumeShown !== d.sitPage && d.left) {
        d.left = false; d.resumeShown = d.sitPage; save();
        body.appendChild(el("section", { class: "k-card k-mind-resume", "data-ui": "mind.resume" }, [el("span", { class: "k-kicker", text: "Welcome back" }),
          el("b", { text: "You were on page " + (d.sitPage + 1) + ", " + l.pages[d.sitPage].t + "." }),
          el("p", { class: "k-muted", text: "Nothing restarts. The sitting picks up where it stopped." }),
          el("div", { class: "k-mind-thumb" }, [el("button", { type: "button", class: "k-btn k-btn--primary", text: "▶ Resume the sitting", onclick: draw }),
            el("button", { type: "button", class: "k-btn", text: "Skip to the question", onclick: function () { nextAfter("sitting"); } })])]));
        announce("Resuming " + l.id + ", page " + (d.sitPage + 1) + ".");
        return;
      }
      var i = d.sitPage;
      if (navigator.onLine === false) body.appendChild(el("p", { class: "k-mind-offline", role: "status", text: "Offline. Everything here works. Answers sync later." }));
      body.appendChild(el("p", { class: "k-kicker", text: l.id + " · Page " + (i + 1) + " of " + l.pages.length + " · " + l.pages[i].t }));
      var at = Date.now();
      body.appendChild(KOS.mindTopic.pageBody(l, i, l.id, { onPassed: function () { M().markPage(l.id, i); } }));
      var dwell = setTimeout(function () { if (body.isConnected && d.sitPage === i) M().markPage(l.id, i); }, 2500);
      var last = i >= s.to || i >= l.pages.length - 1;
      body.appendChild(el("div", { class: "k-mind-thumb k-mind-sitnav" }, [
        i > s.from ? el("button", { type: "button", class: "k-btn", "aria-label": "Previous page", text: "‹", onclick: function () { clearTimeout(dwell); d.sitPage = i - 1; save(); draw(); } }) : el("span"),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "mind.sit-next", text: last ? "Sitting done ›" : "Next · " + l.pages[i + 1].t,
          onclick: function () { clearTimeout(dwell); if (Date.now() - at >= 1500) M().markPage(l.id, i); if (last) { announce("Sitting done. Next: one question."); d.sitPage = null; nextAfter("sitting"); } else { d.sitPage = i + 1; save(); draw(); } } })
      ]));
    }
    /* part 3 · one question */
    function questionPart() {
      var q = plan.question && plan.question.q; if (!q) return nextAfter("question");
      var fin = function () { if (body.isConnected) nextAfter("question"); };
      body.appendChild(el("span", { class: "k-kicker", text: "One question · " + qLabel(q).toLowerCase() }));
      if (q.kind === "revisit") { body.appendChild(KOS.mindRun.revisitCard(q.lesson, { onDone: function (r) { if (r !== "revised") fin(); else fin(); } })); return; }
      if (q.kind === "parked") {
        var l = M().lesson(q.lesson);
        body.appendChild(el("section", { class: "k-card k-mind-prompt" }, [el("span", { class: "k-kicker", text: l.id + " · the one prompt you parked" }), el("h3", { class: "k-mind-vote-q", text: l.prompt.q }),
          el("div", { class: "k-mind-thumb" }, [
            el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: l.kind === "contested" ? "Take a position" : "Write it", onclick: function () {
              var cb = function (r) { if (r === "saved") fin(); };
              if (l.kind === "contested") KOS.mindRun.position(l.id, { onDone: cb }); else KOS.mindRun.explain(l.id, { onDone: cb }); } }),
            el("button", { type: "button", class: "k-btn", text: "Later again", onclick: fin })]),
          el("small", { class: "k-muted", text: "A prompt parked twice stays parked; it is never counted as missed." })]));
        return;
      }
      if (q.kind === "tension") {
        var tn = (window.KOS_MIND.TENSIONS || []).filter(function (x) { return x.id === q.id; })[0];
        if (tn) { body.appendChild(tensionCard(tn)); body.appendChild(el("button", { type: "button", class: "k-btn", text: "Done ›", onclick: fin })); return; }
      }
      if (q.kind === "field") {
        var fl = M().lesson(q.lesson), it = fl.field[q.i], picked = null;
        var box = el("section", { class: "k-card k-mind-field-q", "data-ui": "mind.field-item" });
        var paint = function () {
          box.innerHTML = "";
          box.appendChild(el("b", { text: "Name it" }));
          box.appendChild(el("p", { class: "k-mind-read", text: it.line }));
          box.appendChild(el("div", { class: "k-mind-opts", role: "group", "aria-label": "Which fallacy?" }, it.options.map(function (c) {
            var st = picked ? (c === it.a ? "right" : c === picked ? "wrong" : null) : null;
            return el("button", { type: "button", class: "k-mind-opt", "data-state": st, disabled: picked ? "" : null, onclick: function () { picked = c; announce(M().concept(it.a).name + ". " + (c === it.a ? "Right." : "Not quite.")); paint(); } },
              [st === "right" ? "✓ " : st === "wrong" ? "✗ " : "", M().concept(c).name]);
          })));
          if (picked) {
            box.appendChild(el("p", { class: "k-mind-why", text: M().concept(it.a).name + ": " + M().concept(it.a).gist }));
            box.appendChild(el("div", { class: "k-mind-thumb" }, [el("button", { type: "button", class: "k-btn k-btn--primary", text: "Done ›", onclick: fin }),
              el("button", { type: "button", class: "k-btn", text: "Spotted one in the wild?", onclick: function () { KOS.mindRun.capture({ kind: "insight", concepts: [it.a] }); } })]));
          }
        };
        paint(); body.appendChild(box); return;
      }
      /* the Big Question */
      var b = M().bq();
      if (!b || !b.q) {
        var qs = J().list().filter(function (e) { return e.kind === "question"; });
        body.appendChild(el("section", { class: "k-card" }, [el("b", { text: "No Big Question this week yet" }),
          el("p", { class: "k-muted", text: qs.length ? "Make one of your Questions the week's Big Question, then add a line most days." : "Capture a question that's been on your mind; it can become this week's Big Question." }),
          el("div", { class: "k-mind-thumb" }, [qs.length ? el("button", { type: "button", class: "k-btn k-btn--primary", text: "Use: " + qs[0].title.slice(0, 40), onclick: function () { M().setBq(qs[0].title, qs[0].id); draw(); } })
            : el("button", { type: "button", class: "k-btn k-btn--primary", text: "+ Capture a question", onclick: function () { KOS.mindRun.capture({ kind: "question", onDone: fin }); } }),
            el("button", { type: "button", class: "k-btn", text: "Skip today", onclick: function () { d.qSkipped = true; fin(); } })])]));
        return;
      }
      if (q.sunday && !b.closedAt) { body.appendChild(bqCard()); body.appendChild(el("button", { type: "button", class: "k-btn", text: "Done ›", onclick: fin })); return; }
      var inp = el("textarea", { class: "k-mind-text", rows: "3", "aria-label": "Today's line", placeholder: "• one line on where you are with it" });
      inp.value = (b.lines || {})[t] || "";
      body.appendChild(el("section", { class: "k-card k-mind-bq" }, [el("b", { class: "k-mind-entry-t", text: b.q }), inp,
        el("div", { class: "k-mind-thumb" }, [el("button", { type: "button", class: "k-btn k-btn--primary", text: "Add today's line", onclick: function () { if (inp.value.trim()) M().addBqLine(inp.value); fin(); } }),
          el("button", { type: "button", class: "k-btn", text: "Skip today", onclick: function () { d.qSkipped = true; fin(); } })])]));
    }
    function done() {
      if (!d.doneAt) { stopFocus(); d.doneAt = Date.now(); save(); announce("Daily 15 done." + (d.mins >= 10 ? " One Focus block banked." : "")); }
      var bits = [];
      if (d.results.length) bits.push(d.results.length + (d.results.length === 1 ? " card" : " cards"));
      if (d.parts.sitting && d.sitLesson) bits.push("a sitting of " + d.sitLesson);
      if (d.parts.question && !d.qSkipped) bits.push("one question");
      var tm = new Date(t + "T12:00:00"); tm.setDate(tm.getDate() + 1); var next = M().planDay(tm.getFullYear() + "-" + ("0" + (tm.getMonth() + 1)).slice(-2) + "-" + ("0" + tm.getDate()).slice(-2));
      body.appendChild(el("div", { class: "k-mind-done", "data-ui": "mind.daily-done" }, [el("span", { class: "k-mind-emblem", lang: "ja", "aria-hidden": "true", text: "心" }), el("div", {}, [
        el("b", { text: "Done for today." }),
        el("p", { class: "k-mind-read", text: (d.mins ? d.mins + (d.mins === 1 ? " minute" : " minutes") : "Done") + (bits.length ? ": " + bits.join(", ") + "." : ".") })])]));
      var rows = [];
      if (next.sitting) rows.push(["Tomorrow", next.sitting.lesson + " " + M().lesson(next.sitting.lesson).pages[next.sitting.from].t]);
      if (d.mins >= 10) rows.push(["Banked", "one Focus block · study"]);
      if (d.paid) rows.push(["Reviews", "+" + d.paid + " XP"]);
      if (rows.length) body.appendChild(el("dl", { class: "k-mind-dl" }, rows.map(function (r) { return el("div", {}, [el("dt", { text: r[0] }), el("dd", { text: r[1] })]); })));
      body.appendChild(el("div", { class: "k-mind-thumb" }, [
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Back to Mind", onclick: function () { KOS.show("subject", SID); } }),
        M().due(t).length ? el("button", { type: "button", class: "k-btn", text: "One more card set", onclick: function () { d.step = "reviews"; d.extra = true; d.results = []; d.logged = false; save(); draw(); } }) : null
      ].filter(Boolean)));
    }
    /* leaving mid-sitting resumes with a welcome-back card */
    window.addEventListener("pagehide", function () { if (d.step === "sitting") { d.left = true; KOS.store.flush ? KOS.store.flush() : save(); } }, { once: true });
    draw();
  }

  KOS.mindPages = { checkpoint: checkpoint, journalRow: journalRow, when: when, allEntries: allEntries, tensionCard: tensionCard };
})();
