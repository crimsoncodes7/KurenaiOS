/* Kurenai OS — modules/code.js
   The Code space's own pages (roadmap 5.3, design turn 26):
     KOS.codeDesk(main)       26a  the subject desk, built like 8a
     #/code/map               26b  the curriculum map
     #/code/task/<id>         26f  the task editor (26f2 every result state)
     #/code/retrieval         26h  retrieval: the due list and one card
     #/code/skills            26i  the skill map
     #/code/settings          26r  runner, storage, phone, what is never sent
     #/code/track/<id>        26t  a track or deepening module
   The lesson itself is the shared topic page (hub.js + codetopic.js).

   Pages read through KOS.code (the model) and KOS.codeRun (the runner);
   the only writes are the learner's own actions: a check, a hint, the
   answer opened, a card answered, a draft, a per-device setting. A
   render writes nothing.                                                  */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var SID = "code";
  var TIER = { "warm-up": "Warm-up", core: "Core", stretch: "Stretch" };
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  function K() { return window.KOS_CODE; }
  function C() { return KOS.code; }
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  function plural(n, one, many) { return KOS.ui.num(n) + " " + (n === 1 ? one : (many || one + "s")); }
  function dayLabel(iso) { var d = new Date(iso + "T12:00:00"); return DOW[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()]; }
  /* what "Coming later" covers today, read from what has shipped:
     "units 10–12, capstones 3–4 and the tracks" */
  function comingLater() {
    function runs(ns) {
      var out = [];
      ns.forEach(function (n) {
        var last = out[out.length - 1];
        if (last && n === last[1] + 1) last[1] = n; else out.push([n, n]);
      });
      return out.map(function (r) { return r[0] === r[1] ? String(r[0]) : r[0] + "–" + r[1]; }).join(", ");
    }
    var us = C().units().filter(function (u) { return /^U\d+$/.test(u.ref) && !C().released(u.ref); })
      .map(function (u) { return parseInt(u.ref.slice(1), 10); });
    var cs = Object.keys(K().CAPSTONES || {}).filter(function (id) { return !C().capstone(id); })
      .map(function (id) { return parseInt(id.slice(1), 10); });
    var parts = [];
    if (us.length) parts.push((us.length === 1 ? "unit " : "units ") + runs(us));
    if (cs.length) parts.push((cs.length === 1 ? "capstone " : "capstones ") + runs(cs));
    parts.push("the tracks");
    return parts.length > 1 ? parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1] : parts[0];
  }
  function online() { return typeof navigator === "undefined" || navigator.onLine !== false; }
  function conceptChips(ids) {
    return el("span", { class: "k-cx-cchips" }, (ids || []).map(function (c) {
      var cc = C().concept(c);
      return cc ? el("span", { class: "k-cx-cchip k-mono", text: cc.lesson + " " + cc.name }) : null;
    }).filter(Boolean));
  }
  function cardHead(title, meta, link, go) {
    return el("div", { class: "k-card-head" }, [
      el("span", { class: "k-card-title", text: title }),
      meta ? el("span", { class: "k-card-meta", text: meta }) : null,
      link ? el("button", { type: "button", class: "k-link", text: link, onclick: go }) : null
    ].filter(Boolean));
  }
  function unitName(u) { return C().unitName(u); }
  function openUnit(u) {
    var us = C().unitState(u);
    var target = us.next || C().lessons().filter(function (l) { return l.unit === u; })[0];
    if (target) KOS.show("ref", { subject: SID, ref: target.ref });
  }

  /* ======================================================================
     26a · the subject desk
     ====================================================================== */
  function statTile(o) {
    var empty = o.empty === true, bar = o.pct != null && !empty;
    return el("div", { class: "k-sa-tile", "data-ui": "study.analytics-tile", "data-state": empty ? "empty" : null, title: o.sub || null }, [
      el("span", { class: "k-sa-k", "data-ui": "part.label", text: o.k }),
      el("strong", { class: "k-sa-v", "data-ui": "part.value", text: empty ? "—" : o.v }),
      o.sub ? el("span", { class: "sr-only", text: o.sub }) : null,
      el("span", { class: "k-bar", "aria-hidden": "true", "data-state": bar ? null : "na",
        style: bar ? "--p: " + Math.max(0, Math.min(100, o.pct)) + "%" + (o.c ? "; --bar-c: " + o.c : "") : null }, [el("i")])
    ].filter(Boolean));
  }

  KOS.codeDesk = function (main) {
    var st = C().stats(), d = KOS_DATA.code;
    var mastery = Math.round(C().coreLessons().reduce(function (a, l) { return a + KOS.hub.leafPercent(SID, l.ref); }, 0) / Math.max(1, st.lessons));
    var run = KOS.sessions.streak(SID);
    KOS.shell.actions([
      el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Start focus",
        onclick: function () { KOS.show("focus", { subject: SID }); } })
    ]);
    var first = C().firstVisit();
    var cur = st.current;

    /* ---- the hero: ring, name, and the three strand bars ---- */
    var hero = el("section", { class: "k-subj-hero k-cx-hero", "data-ui": "study.subject-hero code.hero", "aria-label": "Code" }, [
      el("span", { class: "k-subj-ring", role: "img", "aria-label": mastery + "% mastery", style: "--p: " + mastery + "%" }, [
        el("span", { class: "k-subj-ring-in" }, [el("b", { text: mastery + "%" }), el("small", { text: "mastery" })])
      ]),
      el("div", { class: "k-subj-id" }, [
        el("div", { class: "k-kicker", text: "Subject desk" }),
        el("h1", { class: "k-subj-name", text: d.name }),
        el("div", { class: "k-subj-board" }, [
          el("span", { text: d.board }),
          run ? el("span", { class: "k-chip", style: "--chip-c: var(--subj-c)", title: run + "-day study streak in Code", text: "炎 " + run + "-day streak" }) : null
        ].filter(Boolean))
      ]),
      el("div", { class: "k-subj-papers", "data-ui": "code.strands" }, ["L", "E", "S"].map(function (k) {
        var pct = st.strands[k];
        return el("div", { class: "k-subj-paper" }, [
          el("div", { class: "k-subj-paper-top" }, [
            el("b", { text: K().STRANDS[k].name }),
            el("span", { class: "k-subj-paper-note" }),
            el("span", { class: "k-mono", text: pct + "%" })
          ]),
          el("span", { class: "k-bar k-bar--6", role: "img", "aria-label": K().STRANDS[k].name + ": " + pct + "%", style: "--p: " + pct + "%" }, [el("i")])
        ]);
      })),
      /* the stage path lives in the hero, under the name, spread across its
         whole width with a line joining the stops */
      el("div", { class: "k-cx-hero-path" }, [KOS.codeUI.stagePath({ focusable: true, compact: true, spread: true, onUnit: openUnit })])
    ]);
    var side = el("div", { class: "k-subj-side" }, first ? [firstVisitCard()] : [daily20Card(), continueCard(cur)]);
    main.appendChild(el("div", { class: "k-subj-row", "data-ui": "study.desk-top" }, [hero, side]));

    /* ---- analytics, beside retrieval due ---- */
    var analytics = el("section", { class: "k-card k-sa", "data-ui": "study.analytics code.analytics", "aria-label": "Subject analytics" }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: "Subject analytics" }),
        el("span", { class: "k-card-meta", text: "this subject only" }),
        el("details", { class: "k-sa-help" }, [
          el("summary", { class: "k-link", text: "What do these mean?" }),
          el("div", { class: "k-sa-help-body" }, [
            el("p", { text: "Mastery averages each lesson's four evidence checks: pages read, listings run, a task passed and a retrieval passed. Reading alone never completes a lesson." }),
            el("p", { text: "A skill is proven when code that uses it passes on this device. Tasks passed counts first passes made without opening the answer." })
          ])
        ])
      ]),
      el("div", { class: "k-sa-grid", "data-ui": "study.analytics-grid" }, [
        statTile({ k: "Mastery", v: mastery + "%", pct: mastery, c: "var(--subj-c)" }),
        statTile({ k: "Lessons", v: st.done + " / " + st.lessons, pct: Math.round(100 * st.done / Math.max(1, st.lessons)), c: "var(--green)" }),
        statTile({ k: "Capstones", v: st.capstones + " / " + st.capstonesTotal, empty: !st.capstones && C().capStage("C1") !== "next",
          pct: st.capstones ? Math.round(100 * st.capstones / st.capstonesTotal) : null, c: "var(--green)", sub: "The first capstone comes at the end of stage 1." }),
        statTile({ k: "Retrieval due", v: String(st.due), empty: !Object.keys(C().state().cards).length, sub: "skills to prove again today" }),
        statTile({ k: "Skills proven", v: String(st.skillsProven), empty: !st.skillsProven }),
        statTile({ k: "Tasks passed", v: st.tasksPassed + " / " + st.tasksTried, empty: !st.tasksTried,
          pct: st.tasksTried ? Math.round(100 * st.tasksPassed / st.tasksTried) : null, c: "var(--green)" }),
        (function () {
          var ks = C().katas();
          return statTile({ k: "Katas", v: String(ks.length), empty: !ks.length, sub: ks.length ? "five quick questions, against the clock" : "Five quick questions from lessons you've covered." });
        })(),
        statTile({ k: "Streak", v: run + (run === 1 ? " day" : " days"), empty: !run })
      ])
    ]);
    main.appendChild(el("div", { class: "k-subj-row" }, [analytics, retrievalCard()]));

    /* ---- the core path: the stage path above the unit cards ---- */
    var units = el("div", { class: "k-units", "data-ui": "study.units code.units" });
    C().coreUnits().forEach(function (u) {
      var us = C().unitState(u.ref);
      var later = us.state === "later";
      var segs = C().lessons().filter(function (l) { return l.unit === u.ref; }).map(function (l) {
        var p = KOS.store.peekProgress(SID, l.ref);
        return el("span", { "data-state": p && p.status === "done" ? "done" : p && p.status !== "none" ? "started" : null });
      });
      var card = el("button", { type: "button", class: "k-unit k-cx-unit", "data-ui": "study.unit code.unit", "data-state": later ? "later" : us.state === "current" ? "current" : null,
        "aria-label": unitName(u.ref) + " " + u.title + ": " + (!us.released ? "coming later" : later ? "recommended later" : us.done + " of " + us.total + " done"),
        onclick: function () { openUnit(u.ref); } }, [
        el("span", { class: "k-unit-ref", text: u.ref === "B" ? "Bridge B" : u.ref }),
        el("span", { class: "k-unit-title", text: u.title }),
        /* every card has the same three rows — title, bar, foot — so the
           foot always sits on the same line */
        el("span", { class: "k-unit-segs", "aria-hidden": "true" }, segs),
        el("span", { class: "k-unit-foot", "data-ui": "study.unit-foot" }, !us.released ? ["Coming later"] : later ? ["Recommended later"]
          : [el("b", { text: us.done + " / " + us.total }), us.state === "current" && us.next ? " · " + us.next.ref + " now" : " done"])
      ].filter(Boolean));
      if (us.state === "current") KOS.ui.state(card, "current", true);
      units.appendChild(card);
    });
    main.appendChild(el("section", { class: "k-subj-units k-cx-core", "aria-labelledby": "k-cx-core-h" }, [
      el("div", { class: "k-sectionhead" }, [
        el("h2", { id: "k-cx-core-h", text: "Core path" }),
        el("span", { class: "k-sectionhead-sub", text: "12 units · 4 stages · Bridge B · 4 capstones" }),
        el("div", { class: "k-sectionhead-actions" }, [el("button", { type: "button", class: "k-link", text: "Curriculum map ›", onclick: function () { KOS.show("code", { page: "map" }); } })])
      ]),
      KOS.ui.scroller(units, { label: "Units", prevLabel: "Scroll to earlier units", nextLabel: "Scroll to later units" })
    ]));

    /* ---- the closing row: skill map · this weekend · for the computer ---- */
    main.appendChild(el("div", { class: "k-cx-close" }, [skillMapCard(), weekendCard(), laterCard()]));
    main.appendChild(statusLine());
  };

  function firstVisitCard() {
    return el("section", { class: "k-card k-cx-first", "data-ui": "code.first-visit" }, [
      el("span", { class: "k-kicker", text: "Start here" }),
      el("h2", { class: "k-cx-first-t", text: "C# first, one short lesson at a time." }),
      el("p", { text: "Every lesson runs on this device, offline." }),
      el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.start-unit1", text: "Start unit 1",
        onclick: function () { KOS.show("ref", { subject: SID, ref: "1.1" }); } })
    ]);
  }
  function daily20Card() {
    var plan = C().planDay();
    var box = el("section", { class: "k-card k-cx-d20", "data-ui": "code.daily20", "aria-label": "Daily 20" });
    if (!plan) {
      box.appendChild(el("span", { class: "k-kicker", text: "Daily 20 · today" }));
      box.appendChild(el("p", { class: "k-cx-d20-why", text: "No tasks yet. They arrive with each lesson's unit." }));
      return box;
    }
    /* nothing covered yet: the card points at the lesson to finish, never a
       task from a lesson not studied */
    if (!plan.task) {
      var L = plan.lesson;
      box.setAttribute("data-state", "locked");
      box.appendChild(el("div", { class: "k-cx-d20-top" }, [el("span", { class: "k-kicker", text: "Daily 20 · today" })]));
      box.appendChild(el("h2", { class: "k-cx-d20-t", text: L ? "Finish " + L.ref + " first" : "Nothing to practise yet" }));
      box.appendChild(el("p", { class: "k-cx-d20-why", "data-ui": "code.daily20-why", text: plan.why }));
      if (L) box.appendChild(el("div", { class: "k-cx-d20-go" }, [
        el("button", { type: "button", class: "k-btn", "data-ui": "code.daily20-lesson", text: "Open " + L.ref + " " + L.title,
          onclick: function () { KOS.show("ref", { subject: SID, ref: L.ref }); } })
      ]));
      return box;
    }
    var t = plan.task, q = C().quote(t.id, false);
    box.appendChild(el("div", { class: "k-cx-d20-top" }, [
      el("span", { class: "k-kicker", text: plan.review ? "Review week · Daily 20" : "Daily 20 · today" }),
      el("span", { class: "k-cx-tier", text: TIER[t.tier] || "Core" })
    ]));
    box.appendChild(el("h2", { class: "k-cx-d20-t", text: t.title }));
    box.appendChild(conceptChips(t.concepts));
    box.appendChild(el("p", { class: "k-cx-d20-why", text: plan.why }));
    if (plan.done) {
      var s = C().taskState(t.id);
      var paid = s.paid || s.phonePaid ? C().award({ kind: "task", id: t.id }) : null;
      box.appendChild(el("p", { class: "k-cx-d20-done", "data-ui": "code.daily20-done" }, [
        el("b", { text: "✓ Done today" }), paid ? " · " + KOS.codeUI.payText(paid) : ""
      ]));
    } else {
      box.appendChild(el("div", { class: "k-cx-d20-go" }, [
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.daily20-start", text: "▶ Start",
          onclick: function () { KOS.show("code", { page: "task", id: t.id, from: "daily" }); } }),
        el("span", { class: "k-muted", text: "about " + plan.minutes + " min" + (q.pay ? "" : " · no reward: " + q.why) })
      ]));
    }
    return box;
  }
  function continueCard(cur) {
    if (!cur) return null;
    var pct = KOS.hub.leafPercent(SID, cur.ref);
    return el("button", { type: "button", class: "k-subj-next", "data-ui": "study.continue", onclick: function () { KOS.show("ref", { subject: SID, ref: cur.ref }); } }, [
      el("span", { class: "k-subj-next-txt" }, [
        el("span", { class: "k-kicker", text: "Continue" }),
        el("span", { class: "k-subj-next-t" }, [el("span", { class: "k-mono", text: cur.ref }), cur.title]),
        el("span", { class: "k-bar", role: "img", "aria-label": pct + "% from evidence", style: "--p: " + pct + "%; --bar-c: var(--subj-c)" }, [el("i")])
      ]),
      el("span", { class: "k-subj-next-go", "data-state": "lit", "aria-hidden": "true", text: "→" })
    ]);
  }
  function freshChip(days, band) {
    return el("span", { class: "k-cx-age", "data-band": band || "b0", text: days == null ? "—" : days + "d" });
  }
  function retrievalCard() {
    var due = C().dueCards();
    var box = el("section", { class: "k-card k-cx-rdue", "data-ui": "code.retrieval-due", "aria-label": "Retrieval due" }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: "Retrieval due" }),
        due.length ? el("span", { class: "k-card-meta", "data-tone": "code", text: plural(due.length, "skill") }) : null,
        el("button", { type: "button", class: "k-link", text: "Skill map →", onclick: function () { KOS.show("code", { page: "skills" }); } })
      ].filter(Boolean))
    ]);
    if (!due.length) {
      var next = C().nextDue();
      box.appendChild(KOS.ui.emptyState({ compact: true, body: next ? "Nothing due — the next one is " + (C().daysBetween(KOS.srs.todayISO(), next) === 1 ? "tomorrow." : dayLabel(next) + ".")
        : "Nothing due. Prove a skill in a task and its first review is scheduled." }));
      return box;
    }
    due.slice(0, 4).forEach(function (r) {
      box.appendChild(el("button", { type: "button", class: "k-day-row k-cx-rrow", "data-ui": "code.retrieval-row",
        onclick: function () { KOS.show("code", { page: "retrieval", id: r.id }); } }, [
        freshChip(r.days, C().band(r.days)),
        el("span", { class: "k-day-txt" }, [
          el("span", { class: "k-day-title", text: r.title }),
          el("span", { class: "k-day-sub", text: (r.unit || "") + " · last proven " + (r.days == null ? "—" : r.days === 0 ? "today" : r.days + (r.days === 1 ? " day" : " days") + " ago") })
        ])
      ]));
    });
    box.appendChild(el("button", { type: "button", class: "k-btn", "data-ui": "code.retrieval-start", text: "Start retrieval",
      onclick: function () { KOS.show("code", { page: "retrieval" }); } }));
    return box;
  }
  function bandCounts() {
    var n = { b0: 0, b1: 0, b2: 0, b3: 0, np: 0, later: 0 };
    C().skills().forEach(function (s) { n[s.band]++; });
    return n;
  }
  function skillMapCard() {
    var n = bandCounts(), proven = n.b0 + n.b1 + n.b2 + n.b3;
    var total = Math.max(1, proven + n.np);
    var box = el("section", { class: "k-card k-cx-smcard", "data-ui": "code.skillmap-card", "aria-label": "Skill map" }, [
      cardHead("Skill map", "by days since last proven", "Open →", function () { KOS.show("code", { page: "skills" }); }),
      el("div", { class: "k-cx-bandbar", role: "img", "aria-label": proven + " proven, " + n.np + " covered but not proven" },
        ["b0", "b1", "b2", "b3", "np"].map(function (b) { return el("span", { "data-band": b, style: "--w: " + (100 * n[b] / total) + "%" }); })),
      el("div", { class: "k-cx-bands" }, [["b0", "≤7 days"], ["b1", "8–21 days"], ["b2", "22–40 days"], ["b3", "41+ days"]].map(function (b) {
        return el("div", { class: "k-cx-band" }, [el("b", { text: String(n[b[0]]) }), el("small", { text: b[1] })]);
      })),
      el("p", { class: "k-cx-note", text: proven ? proven + " proven · " + n.np + " covered, not proven" : "Concepts fill in as you prove them in code." })
    ]);
    return box;
  }
  function weekendCard() {
    /* the Rider projects (Bridge B, unit 10); in-app weekend projects are not built */
    var box = el("section", { class: "k-card k-cx-weekend", "data-ui": "code.weekend", "aria-label": "Projects" }, [cardHead("Projects", "in Rider")]);
    /* a capstone's project is reached from its capstone, not listed here */
    var ps = C().projects().filter(function (p) { return !p.capstone; });
    if (!ps.length) { box.appendChild(KOS.ui.emptyState({ compact: true, body: "No projects yet." })); return box; }
    /* a project is ready once its unit is begun (Bridge B also after unit 6) */
    var begun = function (u) { return C().lessons().some(function (l) { return l.unit === u && C().studied(l.ref); }); };
    ps.forEach(function (p) {
      var v = C().projectView(p.id), bridge = p.unit === "B";
      var track = /^T\d/.test(p.unit);
      var reached = begun(bridge ? "B" : p.unit) || (bridge ? C().unitState("U6").state === "done" : track ? C().unitState("B").state === "done" : C().unitState("U9").state === "done");
      var sub = v.payAt ? "✓ Complete" : v.done ? v.done + " of " + v.total + " milestones" : reached ? "Ready to start" : bridge ? "Starts at Bridge B, after unit 6" : "Starts with " + C().unitName(p.unit).replace(/^Unit /, "unit ");
      box.appendChild(el("button", { type: "button", class: "k-day-row", "data-ui": "code.project-row",
        onclick: function () { KOS.show("code", { page: "project", id: p.id }); } }, [
        el("span", { class: "k-day-bar", style: "--row-c: var(--code)", "aria-hidden": "true" }),
        el("span", { class: "k-day-txt" }, [el("span", { class: "k-day-title", text: p.title }), el("span", { class: "k-day-sub", text: sub })]),
        el("span", { class: "k-day-when", text: v.total ? v.done + "/" + v.total : "" })
      ]));
    });
    return box;
  }
  function laterCard() {
    var items = C().laterList();
    var box = el("section", { class: "k-card k-cx-later", "data-ui": "code.later", "aria-label": "For the computer" }, [
      cardHead("For the computer", "saved on the phone")
    ]);
    if (!items.length) {
      box.appendChild(KOS.ui.emptyState({ compact: true, body: "Nothing saved. On a phone, “Save for the computer” keeps a task here." }));
      return box;
    }
    items.slice(0, 4).forEach(function (it) {
      var t = it.kind === "task" ? C().task(it.id) : null;
      var L = it.ref ? C().lesson(it.ref) : null;
      var title = t ? t.title : L ? it.ref + " " + L.title : it.id;
      box.appendChild(el("div", { class: "k-cx-laterrow" }, [
        el("button", { type: "button", class: "k-day-row", "data-ui": "code.later-row",
          onclick: function () { if (t) KOS.show("code", { page: "task", id: t.id }); else if (L) KOS.show("ref", { subject: SID, ref: it.ref }); } }, [
          el("span", { class: "k-day-txt" }, [
            el("span", { class: "k-day-title", text: title }),
            el("span", { class: "k-day-sub", text: (it.kind === "task" ? "Task" : "Lesson") + " · " + DOW[new Date(it.at).getDay()] })
          ]),
          el("span", { class: "k-muted", "aria-hidden": "true", text: "→" })
        ]),
        el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Remove " + title + " from For the computer", text: "✕",
          onclick: function () { C().dropLater(it.key); KOS.rerender(); } })
      ]));
    });
    return box;
  }
  function statusLine() {
    return el("div", { class: "k-cx-status", "data-ui": "code.status-line" }, [
      el("span", {}, [el("span", { class: "k-cx-live", "aria-hidden": "true" }), " Runner ", el("b", { text: "In-app" }), " · " + (online() ? "works offline" : "offline")]),
      el("span", { text: "Full .NET runtime " + ({ ready: "ready", idle: "on this device", downloading: "downloading", failed: "stopped", offline: "offline", file: "needs http(s)" }[KOS.codeRun.runtime().state] || "not downloaded") }),
      el("span", { text: "GitHub not connected" }),
      el("button", { type: "button", class: "k-link", "data-ui": "code.settings-open", text: "Code settings ›", onclick: function () { KOS.show("code", { page: "settings" }); } })
    ]);
  }

  /* ======================================================================
     26b · the curriculum map
     ====================================================================== */
  function pageMap(main) {
    var ui = C().ui();
    var strand = ui.mapStrand || "all";
    main.appendChild(KOS.ui.pageHeader({ kicker: "Study · Code", title: "Curriculum map", sub: "Core path, deepening modules and tracks" }));
    var bar = el("div", { class: "k-cx-mapbar" });
    var seg = el("div", { class: "k-seg k-seg--quiet", "data-ui": "code.strand-filter", role: "radiogroup", "aria-label": "Strand" });
    [["all", "All"], ["L", "C#"], ["E", "Engineering"], ["S", "Computer science"]].forEach(function (o) {
      seg.appendChild(el("button", { type: "button", class: "k-seg-item", role: "radio", "aria-checked": String(strand === o[0]), "data-v": o[0],
        tabindex: strand === o[0] ? "0" : "-1", "data-state": strand === o[0] ? "active" : null, text: o[1],
        onclick: function () { pick(o[0]); } }));
    });
    seg.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var order = ["all", "L", "E", "S"], i = order.indexOf(strand) + (e.key === "ArrowRight" ? 1 : -1);
      if (i < 0 || i >= order.length) return;
      e.preventDefault(); pick(order[i]);
      var b = seg.querySelector('[data-v="' + order[i] + '"]'); if (b) b.focus();
    });
    bar.appendChild(seg);
    bar.appendChild(el("p", { class: "k-cx-banner", "data-tone": "info" }, [
      el("span", { "aria-hidden": "true", text: "↗ " }),
      "The order is a recommendation: every written unit opens now, and “Recommended later” only says what it builds on. “Coming later” is outlined but not written yet: " + comingLater() + "."
    ]));
    main.appendChild(bar);
    var grid = el("div", { class: "k-cx-map" });
    main.appendChild(grid);
    function has(list) { return strand === "all" || (list || []).indexOf(strand) >= 0; }
    function pick(v) {
      strand = v; ui.mapStrand = v; KOS.store.save();
      [].forEach.call(seg.children, function (b) { var on = b.getAttribute("data-v") === v; b.setAttribute("aria-checked", String(on)); b.setAttribute("tabindex", on ? "0" : "-1"); KOS.ui.state(b, "active", on); });
      draw();
      var n = grid.querySelectorAll("[data-ui~='code.map-row'], [data-ui~='code.branch']").length;
      announce(v === "all" ? "Showing every place." : "Showing " + n + " places in " + ({ L: "C#", E: "Engineering", S: "Computer science" })[v] + ".");
    }
    function draw() {
      grid.innerHTML = "";
      var core = el("section", { class: "k-card k-cx-mapcore", "aria-labelledby": "k-cx-map-core" }, [
        el("div", { class: "k-card-head" }, [el("h2", { class: "k-card-title", id: "k-cx-map-core", text: "Core path" }),
          el("span", { class: "k-card-meta", text: "4 stages · Bridge B · " + C().coreLessons().length + " lessons · 4 capstones" })])
      ]);
      var tbl = el("div", { class: "k-cx-maptbl", role: "table", "aria-label": "Core path" }, [
        el("div", { class: "k-cx-maprow k-cx-maprow--h", role: "row" }, ["Unit", "Lessons", "Strand", "Where it runs", "Status"].map(function (h) {
          return el("span", { role: "columnheader", text: h });
        }))
      ]);
      K().STAGES.forEach(function (stg) {
        var rows = stg.units.map(C().unit).filter(function (u) { return u && has(u.strands); });
        if (!rows.length && strand !== "all") { tbl.appendChild(el("div", { class: "k-cx-mapstage", role: "row" }, [el("span", { role: "cell", text: stg.bridge ? "Between stages 2 and 3 · Bridge B" : "Stage " + stg.id + " · " + stg.title })])); return; }
        tbl.appendChild(el("div", { class: "k-cx-mapstage", role: "row" }, [el("span", { role: "cell" }, stg.bridge
          ? ["Between stages 2 and 3 · ", el("b", { text: "Bridge B · Your real toolkit" })]
          : [el("span", { class: "k-mono", text: "Stage " + stg.id + " " }), el("b", { text: stg.title })])]));
        rows.forEach(function (u) {
          var us = C().unitState(u.ref);
          tbl.appendChild(el("button", { type: "button", class: "k-cx-maprow", role: "row", "data-ui": "code.map-row", "data-state": us.state,
            onclick: function () { openUnit(u.ref); } }, [
            el("span", { role: "cell", class: "k-cx-mapunit" }, [el("span", { class: "k-cx-sq", "data-state": us.state, "aria-hidden": "true", text: us.state === "done" ? "✓" : u.ref }), u.title]),
            el("span", { role: "cell", class: "k-mono", text: String(us.total) }),
            el("span", { role: "cell" }, [KOS.codeUI.strands(u.strands)]),
            el("span", { role: "cell" }, [KOS.codeUI.where(u.where)]),
            el("span", { role: "cell", class: "k-cx-mapst", text: us.state === "done" ? "✓ Done" : us.state === "current" || us.state === "started" ? us.done + " of " + us.total + (us.state === "current" ? " · now" : "") : us.released ? "Recommended later" : "Coming later" })
          ]));
        });
        if (stg.capstone && strand === "all") {
          var cap = K().CAPSTONES[stg.capstone], cst = C().capStage(stg.capstone), ready = !!C().capstone(stg.capstone);
          tbl.appendChild(el(ready ? "button" : "div", { type: ready ? "button" : null, class: "k-cx-maprow k-cx-mapcap", role: "row", "data-ui": ready ? "code.map-capstone" : null, "data-state": cst,
            onclick: ready ? (function (cid) { return function () { KOS.show("code", { page: "capstone", id: cid }); }; })(stg.capstone) : null }, [
            el("span", { role: "cell", class: "k-cx-mapunit" }, [el("span", { class: "k-cx-dia", "data-state": cst, "aria-hidden": "true" }), "Capstone " + stg.capstone.slice(1) + " · " + cap.title]),
            el("span", { role: "cell" }), el("span", { role: "cell" }), el("span", { role: "cell" }, [KOS.codeUI.where(cap.where)]),
            el("span", { role: "cell", class: "k-cx-mapst", text: cst === "passed" ? "✓ Passed" : cst === "next" ? "Next · open any time" : ready ? "Recommended later" : "Coming later" })
          ]));
        }
      });
      core.appendChild(tbl);
      grid.appendChild(core);
      var side = el("div", { class: "k-cx-mapside" });
      side.appendChild(branchGroup("Deepening", "optional modules that go further into a core unit", K().DEEPENING.filter(function (t) { return has(t.strands); })));
      side.appendChild(branchGroup("Tracks", "whole areas of programming; each has a taster and a capstone", K().TRACKS.filter(function (t) { return has(t.strands); })));
      grid.appendChild(side);
    }
    function branchGroup(title, sub, items) {
      var sec = el("section", { class: "k-cx-branches", "aria-label": title }, [
        el("div", { class: "k-sectionhead" }, [el("h2", { text: title }), el("span", { class: "k-sectionhead-sub", text: sub })])
      ]);
      if (!items.length) { sec.appendChild(el("p", { class: "k-cx-note", text: "No " + title.toLowerCase() + " in this strand yet." })); return sec; }
      sec.appendChild(el("div", { class: "k-cx-branchgrid" }, items.map(branchCard)));
      return sec;
    }
    draw();
  }
  function needMet(u) { var us = C().unitState(u); return us.state === "done"; }
  function branchCard(t) {
    var met = (t.needs || []).filter(needMet).length;
    return el("button", { type: "button", class: "k-cx-branch", "data-ui": "code.branch", "data-state": "later",
      onclick: function () { KOS.show("code", { page: "track", id: t.id }); } }, [
      el("span", { class: "k-cx-branch-h" }, [el("span", { class: "k-mono", text: t.id }), el("b", { text: t.title }), el("small", { text: "Coming later" })]),
      el("span", { class: "k-cx-needs" }, ["needs:"].concat((t.needs || []).map(function (u) {
        var ok = needMet(u);
        return el("span", { class: "k-cx-need", "data-state": ok ? "met" : null, text: (ok ? "✓ " : "") + unitName(u) });
      }))),
      el("span", { class: "k-cx-branch-f" }, [KOS.codeUI.strands(t.strands), KOS.codeUI.where(t.where), el("span", { text: t.lessons + " lessons" }),
        t.taster ? el("span", { class: "k-muted", text: "· taster: " + t.taster }) : null].filter(Boolean)),
      met === (t.needs || []).length && met ? el("span", { class: "sr-only", text: "Every need met." }) : null
    ].filter(Boolean));
  }

  /* ======================================================================
     26t · a track or deepening module
     ====================================================================== */
  function pageTrack(main, id) {
    var t = K().TRACKS.concat(K().DEEPENING).filter(function (x) { return x.id === id; })[0];
    if (!t) { pageMap(main); return; }
    var isTrack = id.charAt(0) === "T";
    /* a track whose parts are in the spine lists them, part by part */
    var parts = C().units().filter(function (u) { return u.track === id; });
    var written = parts.filter(function (u) { return C().released(u.ref); });
    main.appendChild(KOS.ui.pageHeader({ kicker: "Code · " + (isTrack ? "Tracks" : "Deepening"), title: t.id + " · " + t.title,
      sub: parts.length ? t.lessons + " lessons in " + parts.length + " parts · " + (written.length ? written.length + " of " + parts.length + " parts written" : "the parts are outlined; each is released whole")
        : t.lessons + " lessons · coming later: the outline is here, the lessons are not written yet" }));
    var met = (t.needs || []).filter(needMet).length;
    main.appendChild(el("div", { class: "k-cx-track" }, [
      el("section", { class: "k-card", "aria-label": "Overview" }, [
        el("span", { class: "k-kicker", text: "Overview" }),
        el("p", { class: "k-cx-track-about", text: t.about }),
        el("div", { class: "k-cx-branch-f" }, [KOS.codeUI.strands(t.strands), KOS.codeUI.where(t.where)]),
        el("p", { class: "k-cx-note", text: K().WHERE[t.where] ? K().WHERE[t.where].hint : "" })
      ]),
      el("section", { class: "k-card", "aria-label": "Builds on" }, [
        el("span", { class: "k-kicker", text: "Builds on" }),
        el("div", { class: "k-cx-needs" }, (t.needs || []).map(function (u) {
          var ok = needMet(u);
          return el("button", { type: "button", class: "k-cx-need", "data-state": ok ? "met" : null, text: (ok ? "✓ " : "○ ") + unitName(u),
            onclick: function () { openUnit(u); } });
        })),
        el("p", { class: "k-cx-note", text: met === (t.needs || []).length ? "Every need is met." : "Missing needs link to their units. The " + (isTrack ? "track" : "module") + " still opens." })
      ]),
      parts.length ? null : el("section", { class: "k-card", "aria-label": "Lessons" }, [
        el("span", { class: "k-kicker", text: "Lessons" }),
        KOS.ui.emptyState({ compact: true, title: "Arrives in its own release", body: "Tracks and deepening modules are released one at a time after the core path, each written to the same depth as the core lessons." + (t.taster ? " Its taster: " + t.taster + "." : "") })
      ])
    ].filter(Boolean)));
    if (parts.length) main.appendChild(el("section", { class: "k-cx-parts", "data-ui": "code.track-parts", "aria-label": "Parts" }, parts.map(function (u) {
      var us = C().unitState(u.ref), rel = us.released;
      return el("section", { class: "k-card k-cx-part", "data-state": rel ? null : "later", "aria-label": u.ref + " " + u.title }, [
        el("div", { class: "k-card-head" }, [
          el("span", { class: "k-card-title" }, [el("span", { class: "k-mono", text: u.ref + " · " }), u.title]),
          el("span", { class: "k-card-meta", text: rel ? us.done + " of " + us.total + " done" : "coming later" })
        ]),
        el("div", { class: "k-cx-branch-f" }, [KOS.codeUI.strands(u.strands), KOS.codeUI.where(u.where)]),
        u.project && rel ? (function () {
          /* the part's project: its clue tasks in order, the next one to do */
          var ts = u.project.tasks.map(function (id) { return C().task(id); }).filter(Boolean);
          var done = ts.filter(function (t) { return C().taskState(t.id).passAt; }).length;
          var next = ts.filter(function (t) { return !C().taskState(t.id).passAt; })[0] || ts[0];
          return el("div", { class: "k-cx-partproj", "data-ui": "code.track-project" }, [
            el("span", { class: "k-kicker", text: "Project" }),
            el("b", { text: u.project.title }),
            el("span", { class: "k-muted", text: u.project.about + " " + done + " of " + ts.length + " solved." }),
            next ? el("button", { type: "button", class: "k-btn k-btn--sm", text: done === ts.length ? "Look again ›" : done ? "Next clue ›" : "Start the case ›",
              onclick: function () { KOS.show("code", { page: "task", id: next.id }); } }) : null
          ].filter(Boolean));
        })() : null,
        /* a part built in Rider: its project's hub */
        (function () {
          var rp = rel && C().projects().filter(function (x) { return x.unit === u.ref; })[0];
          if (!rp) return null;
          var pv = C().projectView(rp.id);
          /* the track's capstone: its project is the capstone's build */
          if (rp.capstone && C().capstone(rp.capstone)) {
            var cv = C().capView(rp.capstone);
            return el("div", { class: "k-cx-partproj", "data-ui": "code.track-capstone" }, [
              el("span", { class: "k-kicker", text: "Capstone · in Rider" }),
              el("b", { text: cv.spec.title }),
              el("span", { class: "k-muted", text: cv.passAt ? "Passed." : pv.done + " of " + pv.total + " milestones passed." }),
              el("button", { type: "button", class: "k-btn k-btn--sm", text: "Open the capstone ›", onclick: function () { KOS.show("code", { page: "capstone", id: rp.capstone }); } })
            ]);
          }
          return el("div", { class: "k-cx-partproj", "data-ui": "code.track-project" }, [
            el("span", { class: "k-kicker", text: "Project · in Rider" }),
            el("b", { text: rp.title }),
            el("span", { class: "k-muted", text: pv.payAt ? "Complete." : pv.done + " of " + pv.total + " milestones passed." }),
            el("button", { type: "button", class: "k-btn k-btn--sm", text: "Open the project ›", onclick: function () { KOS.show("code", { page: "project", id: rp.id }); } })
          ]);
        })(),
        el("ol", { class: "k-cx-partlist" }, u.children.map(function (l) {
          var p = KOS.store.peekProgress(SID, l.ref);
          var st = p && p.status === "done" ? "done" : p && p.status && p.status !== "none" ? "started" : null;
          return el("li", {}, [rel ? el("button", { type: "button", class: "k-link k-cx-partlesson", "data-state": st, onclick: function () { KOS.show("ref", { subject: SID, ref: l.ref }); } },
            [el("span", { class: "k-mono", text: l.ref }), " " + l.title + (st === "done" ? " ✓" : "")])
            : el("span", { class: "k-cx-partlesson k-muted" }, [el("span", { class: "k-mono", text: l.ref }), " " + l.title])]);
        }))
      ]);
    })));
  }

  /* ======================================================================
     26f · the task editor
     ====================================================================== */
  var openTimers = [];
  function stopTimers() { openTimers.forEach(function (t) { clearInterval(t); }); openTimers = []; }
  function mmss(s) { return ("0" + Math.floor(s / 60)).slice(-2) + ":" + ("0" + (s % 60)).slice(-2); }

  function pageTask(main, arg) {
    var t = C().task(arg.id);
    if (!t) { KOS.show("subject", SID); return; }
    var L = C().lesson(t.lesson);
    var phone = C().isPhone();
    if (phone && !C().phoneFit(t)) { phoneLater(main, t); return; }
    KOS.shell.bleed(true);
    var ui = C().ui();
    var spec = { mode: t.mode || "program", method: t.method, cases: (t.examples || []).concat((t.hidden || []).map(function (c) { return Object.assign({ hidden: true }, c); })), rules: t.rules, fs: t.fs, db: t.db, lesson: t.lesson };
    var started = Date.now();
    var hintsOpen = C().taskState(t.id).hints;
    var answerShown = !!C().taskState(t.id).seen;
    var lastCheck = null, lastOutcome = null;

    var page = el("div", { class: "k-cx-taskpage", "data-ui": "code.task", "data-state": ui.taskCollapsed && !phone ? "collapsed" : null });
    main.appendChild(page);

    /* ---- the header: crumb, title, timer, Run and Check ---- */
    var timer = el("span", { class: "k-cx-timer k-mono", "aria-label": "Time on this task", text: "◷ 00:00" });
    var tick = setInterval(function () { if (!timer.isConnected) { clearInterval(tick); return; } timer.textContent = "◷ " + mmss(Math.round((Date.now() - started) / 1000)); }, 1000);
    openTimers.push(tick);
    var runBtn = el("button", { type: "button", class: "k-btn", "data-ui": "code.run", text: "▶ Run", onclick: doRun });
    var checkBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.check",
      text: "✓ Check · " + plural(spec.cases.length, "test"), onclick: doCheck });
    var crumb = el("nav", { class: "k-cx-crumb", "aria-label": "Breadcrumb" }, [
      el("button", { type: "button", class: "k-link", text: "Code", onclick: function () { KOS.show("subject", SID); } }), " › ",
      arg.from === "daily" ? "Daily 20 › " + dayLabel(KOS.srs.todayISO())
        : el("button", { type: "button", class: "k-link", text: t.lesson + " " + (L ? L.title : ""), onclick: function () { KOS.show("ref", { subject: SID, ref: t.lesson }); } })
    ]);
    var showTask = el("button", { type: "button", class: "k-btn k-cx-showtask", "data-ui": "code.task-show", text: "Show task ⇤", onclick: function () { setCollapsed(false); } });
    page.appendChild(el("header", { class: "k-cx-taskhead" }, [
      el("div", { class: "k-cx-taskhead-txt" }, [crumb, el("h1", { class: "k-cx-task-title" }, [t.title, " ", el("span", { class: "k-cx-tier", text: TIER[t.tier] || "Core" })]),
        phone ? el("span", { class: "k-cx-phonebadge", "data-ui": "code.phone-task", text: "Phone task · reduced reward" }) : null].filter(Boolean)),
      el("div", { class: "k-cx-taskhead-act" }, [timer, runBtn, checkBtn, showTask])
    ]));

    /* ---- the editor and its results panel ---- */
    var initial = C().draft(t.id);
    var ed = KOS.codeUI.editor({ value: initial != null ? initial : t.starter || "", file: t.file || C().fileFor(t.lesson), label: "Your code", minLines: 14,
      onRun: doRun, onToggle: function () { setCollapsed(!KOS.ui.hasState(page, "collapsed")); },
      onChange: KOS.ui.debounce(function (v) { C().setDraft(t.id, v === (t.starter || "") ? null : v); }, 400) });
    var stdin = el("input", { type: "text", class: "k-input k-cx-stdin k-mono", "data-ui": "code.stdin", "aria-label": "Input for Run",
      spellcheck: "false", autocapitalize: "off" });
    stdin.value = t.examples && t.examples[0] && t.examples[0].stdin != null ? t.examples[0].stdin.split("\n")[0] : "";
    var live = el("p", { class: "sr-only", "aria-live": "polite", "data-ui": "code.task-live" });
    var outPane = el("div", { class: "k-cx-pane", "data-ui": "code.output" });
    var testsPane = el("div", { class: "k-cx-pane", "data-ui": "code.tests", hidden: "" });
    var probPane = el("div", { class: "k-cx-pane", "data-ui": "code.problems", hidden: "" });
    var rewardSlot = el("div", { class: "k-cx-rewardslot" });
    var tabs = [["output", "Output", outPane], ["tests", "Tests", testsPane], ["problems", "Problems", probPane]];
    var tabBar = el("div", { class: "k-seg k-seg--quiet k-cx-restabs", role: "tablist", "aria-label": "Results" });
    var cur = "output";
    tabs.forEach(function (tb) {
      tabBar.appendChild(el("button", { type: "button", class: "k-seg-item", role: "tab", "data-tab": tb[0], "aria-selected": String(tb[0] === cur),
        tabindex: tb[0] === cur ? "0" : "-1", onclick: function () { selTab(tb[0]); } }, [tb[1] + " ", el("span", { class: "k-mono", "data-ui": "code.tab-count" })]));
    });
    tabBar.addEventListener("keydown", function (e) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      var ids = tabs.map(function (x) { return x[0]; }), i = ids.indexOf(cur) + (e.key === "ArrowRight" ? 1 : -1);
      if (i < 0 || i >= ids.length) return;
      e.preventDefault(); selTab(ids[i]); tabBar.querySelector('[data-tab="' + ids[i] + '"]').focus();
    });
    function selTab(id) {
      cur = id;
      tabs.forEach(function (tb) {
        var b = tabBar.querySelector('[data-tab="' + tb[0] + '"]');
        b.setAttribute("aria-selected", String(tb[0] === id)); b.setAttribute("tabindex", tb[0] === id ? "0" : "-1");
        KOS.ui.state(b, "active", tb[0] === id);
        tb[2].hidden = tb[0] !== id;
      });
    }
    function counts() {
      var tc = tabBar.querySelector('[data-tab="tests"] [data-ui~="code.tab-count"]'), pc = tabBar.querySelector('[data-tab="problems"] [data-ui~="code.tab-count"]');
      tc.textContent = String(spec.cases.length);
      pc.textContent = lastCheck && lastCheck.compile ? "1" : "0";
    }
    outPane.appendChild(el("div", { class: "k-cx-stdinrow" }, [el("label", { class: "k-cx-stdin-l", for: "k-cx-stdin", text: "stdin" }), stdin]));
    stdin.id = "k-cx-stdin";
    var outBody = el("div", { class: "k-cx-outbody" }, [
      el("p", { class: "k-cx-note", text: "Run tries your code with the input above." }),
      el("p", { class: "k-cx-note", text: "Check runs it against the " + plural((t.examples || []).length, "example") + ((t.hidden || []).length ? " and " + plural(t.hidden.length, "hidden case") : "") + "." })
    ]);
    outPane.appendChild(outBody);
    testsPane.appendChild(KOS.codeUI.results(null, { total: spec.cases.length, cases: spec.cases }));
    probPane.appendChild(el("p", { class: "k-cx-note", text: "No problems. Compile errors appear here, each a link to its line." }));
    var results = el("section", { class: "k-cx-respanel", "aria-label": "Output, tests and problems" }, [
      el("div", { class: "k-cx-respanel-h" }, [tabBar, live]), outPane, testsPane, probPane, rewardSlot
    ]);
    var notReady = KOS.codeRun.status() !== "ready";
    if (notReady) { checkBtn.disabled = true; checkBtn.title = "The in-app runner is getting ready"; }
    var codeCol = el("div", { class: "k-cx-codecol" }, [ed.el, results]);
    page.appendChild(el("div", { class: "k-cx-taskgrid" }, [codeCol, taskPanel()]));
    if (phone && C().ui().keybar !== false) page.appendChild(KOS.codeUI.keyBar(ed.input));
    selTab("output"); counts();
    paintReward();

    function say(m) { live.textContent = m; announce(m); }
    function doRun() {
      if (runBtn.disabled) return;
      runBtn.disabled = true; ed.running(true);
      selTab("output");
      var req = t.mode === "method" && t.examples && t.examples[0] ? { files: ed.files(), mode: "method", call: { name: t.method, args: t.examples[0].args }, lesson: t.lesson }
        : { files: ed.files(), stdin: stdin.value, fs: (t.examples && t.examples[0] && t.examples[0].fs) || t.fs, db: t.db, lesson: t.lesson };
      KOS.codeRun.run(req).then(function (r) {
        runBtn.disabled = false; ed.running(false);
        outBody.innerHTML = "";
        if (r.ok) {
          ed.state("ready", "Ran");
          outBody.appendChild(el("pre", { class: "k-cx-out-pre k-mono", "data-ui": "code.stdout", text: t.mode === "method" ? String(r.value) : (r.stdout || "(no output)").replace(/\n$/, "") }));
          say("Runs. Output: " + (KOS.codeRun.firstLine(t.mode === "method" ? r.value : r.stdout) || "nothing") + ".");
        } else {
          showError(r.error, outBody);
          if (r.stdout) outBody.insertBefore(el("pre", { class: "k-cx-out-pre k-mono", text: r.stdout.replace(/\n$/, "") }), outBody.firstChild);
        }
        var wp = KOS.codeUI.writtenPanel(req.fs, r.fs);
        if (wp) outBody.appendChild(wp);
        var wn = KOS.codeUI.warningsPanel(r.warnings);
        if (wn) outBody.appendChild(wn);
      });
    }
    function showError(e, into) {
      if (e.kind === "runtime") { ed.state("ready"); into.appendChild(KOS.codeUI.errorCard(e, { onReady: doRun })); say("This task needs the full C# runtime."); return; }
      ed.state(e.kind === "compile" ? "compile" : e.kind === "timeout" ? "timeout" : "exception",
        e.kind === "compile" ? "1 compile error" : e.kind === "timeout" ? "Did not finish" : "Stopped: exception");
      if (e.line) ed.mark(e.line, KOS.codeUI.quoted(e.msg));
      into.appendChild(KOS.codeUI.errorCard(e));
      if (e.kind === "compile") {
        probPane.innerHTML = "";
        probPane.appendChild(el("ul", { class: "k-cx-problems" }, [el("li", {}, [el("button", { type: "button", class: "k-link", "data-ui": "code.problem",
          text: e.code + " · line " + e.line + " · " + e.msg, onclick: function () { goLine(e.line); } })])]));
      }
      say(e.kind === "compile" ? "Compile error " + e.code + " on line " + e.line + "." : e.kind === "timeout" ? "Did not finish." : "Stopped: " + e.code + (e.line ? " on line " + e.line : "") + ".");
    }
    function goLine(n) {
      var lines = ed.value.split("\n"), pos = 0;
      for (var i = 0; i < n - 1 && i < lines.length; i++) pos += lines[i].length + 1;
      ed.input.focus(); ed.input.setSelectionRange(pos, pos);
    }
    function doCheck() {
      if (checkBtn.disabled) return;
      checkBtn.disabled = true; runBtn.disabled = true; ed.running(true);
      selTab("tests");
      testsPane.innerHTML = "";
      testsPane.appendChild(KOS.codeUI.results(null, { running: true, total: spec.cases.length, cases: spec.cases }));
      checkBtn.textContent = "Checking…";
      say("Running " + plural(spec.cases.length, "case") + ".");
      KOS.codeRun.check(spec, ed.files()).then(function (c) {
        lastCheck = c;
        checkBtn.disabled = false; runBtn.disabled = false; ed.running(false);
        checkBtn.textContent = "✓ Check · " + plural(spec.cases.length, "test");
        testsPane.innerHTML = "";
        probPane.innerHTML = "";
        testsPane.appendChild(KOS.codeUI.results(c, { method: t.mode === "method" ? t.method : null }));
        var outcome = C().recordCheck(t.id, c, { phone: phone });
        lastOutcome = outcome;
        /* a first pass goes to GitHub when it is connected (never on a re-run) */
        if (outcome && outcome.paid && KOS.codeGit) KOS.codeGit.queueTask(t, ed.files());
        if (c.compile) {
          showError(c.compile, el("div"));
          selTab("tests");
        } else if (c.stopped) {
          var e = c.stopped.error;
          ed.state(e.kind === "timeout" ? "timeout" : "exception", e.kind === "timeout" ? "Did not finish" : "Stopped: exception");
          if (e.line) ed.mark(e.line, KOS.codeUI.quoted(e.msg));
          say(e.kind === "timeout" ? "Did not finish in case " + (c.stopped.at + 1) + "." : "Stopped in case " + (c.stopped.at + 1) + ": " + e.code + ".");
        } else if (c.passed) {
          ed.state("pass");
          ed.mark(0);
        } else if (c.rule) {
          ed.state("fail", "Output right · rule failed");
          say("Not yet. The output matched but a rule failed: " + c.rule.msg);
        } else {
          var f = c.results.filter(function (r) { return !r.ok; })[0];
          ed.state("fail", (c.total - c.pass) + " of " + c.total + " failing");
          say(c.pass + " of " + c.total + " pass. Case " + (f.i + 1) + " fails.");
        }
        if (c.passed) {
          var conceptNames = (t.concepts || []).map(function (x) { var cc = C().concept(x); return cc ? cc.name : x; });
          if (outcome.pay) say("All " + c.total + " pass. " + KOS.codeUI.payText(outcome.pay).replace(/ · /g, ", ") + ".");
          else say("All " + c.total + " pass. No reward: " + (outcome.why || "practice") + ".");
          paintReward(outcome, conceptNames);
        } else paintReward();
        counts();
        KOS.refreshRailCounters && KOS.refreshRailCounters();
      });
    }
    function paintReward(outcome, names) {
      rewardSlot.innerHTML = "";
      if (!outcome) return;
      var line = KOS.codeUI.reward(outcome, names && outcome.pay ? "Proven: " + names.join(" · ") : null);
      rewardSlot.appendChild(line);
      if (outcome.why === "answer opened") rewardSlot.appendChild(el("p", { class: "k-cx-note", text: "The skills still move on the map, as “studied, not proven”. Tomorrow's retrieval asks for it again." }));
    }

    /* ---- the task panel: Task · Hints · Notes, collapsible ---- */
    function taskPanel() {
      var panel = el("aside", { class: "k-cx-taskpanel", "data-ui": "code.task-panel", "aria-label": "Task" });
      var strip = el("button", { type: "button", class: "k-cx-strip", "data-ui": "code.task-strip", "aria-label": "Show the task", onclick: function () { setCollapsed(false); } }, [
        el("span", { "aria-hidden": "true", text: "⇤" }), el("span", { class: "k-cx-strip-t", text: "Task · " + t.title }),
        el("span", { class: "k-cx-strip-h", text: hintsOpen ? "hint " + hintsOpen + " open" : "" })
      ]);
      var pick = ui.taskTab || "task";
      var bodyEl = el("div", { class: "k-cx-tp-body" });
      var tbar = el("div", { class: "k-seg k-seg--quiet", role: "tablist", "aria-label": "Task panel" });
      [["task", "Task"], ["hints", "Hints"], ["notes", "Notes"]].forEach(function (x) {
        tbar.appendChild(el("button", { type: "button", class: "k-seg-item", role: "tab", "data-tab": x[0], "aria-selected": String(pick === x[0]),
          onclick: function () { pick = x[0]; ui.taskTab = x[0]; draw(); } }, [x[1], x[0] === "hints" ? el("span", { class: "k-mono", "data-ui": "code.hint-count", text: " " + hintsOpen + "/" + (t.hints || []).length }) : null].filter(Boolean)));
      });
      var collapse = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "code.task-collapse", "aria-label": "Collapse the task", title: "Collapse the task (Ctrl+B)", text: "⇥",
        onclick: function () { setCollapsed(true); } });
      panel.appendChild(strip);
      panel.appendChild(el("div", { class: "k-cx-tp" }, [el("div", { class: "k-cx-tp-head" }, [tbar, phone ? null : collapse].filter(Boolean)), bodyEl]));
      function draw() {
        [].forEach.call(tbar.children, function (b) { var on = b.getAttribute("data-tab") === pick; b.setAttribute("aria-selected", String(on)); KOS.ui.state(b, "active", on); });
        var hc = tbar.querySelector("[data-ui~='code.hint-count']"); if (hc) hc.textContent = " " + hintsOpen + "/" + (t.hints || []).length;
        bodyEl.innerHTML = "";
        if (pick === "task") drawTask();
        else if (pick === "hints") drawHints();
        else drawNotes();
      }
      function drawTask() {
        bodyEl.appendChild(conceptChips(t.concepts));
        var stmt = el("div", { class: "k-prose k-cx-stmt", html: KOS.content.renderBlocks(t.statement || []) });
        bodyEl.appendChild(stmt);
        var seed = t.fs || ((t.examples || [])[0] || {}).fs;
        if (seed) bodyEl.appendChild(KOS.codeUI.filesPanel(seed, { open: true }));
        var ex = t.examples || [];
        if (ex.length) {
          bodyEl.appendChild(el("div", { class: "k-cx-exh" }, [el("span", { class: "k-kicker", text: "Examples" }),
            (t.hidden || []).length ? el("span", { class: "k-muted", text: "+ " + plural(t.hidden.length, "hidden case") }) : null].filter(Boolean)));
          ex.forEach(function (c) {
            bodyEl.appendChild(el("div", { class: "k-cx-ex" }, [
              el("div", {}, [el("span", { class: "k-cx-ex-k", text: t.mode === "method" ? "Call" : "Input" }),
                el("pre", { class: "k-mono", text: t.mode === "method" ? t.method + "(" + (c.args || []).map(function (a) { return JSON.stringify(a); }).join(", ") + ")" : (c.stdin || "(none)") })]),
              el("div", {}, [el("span", { class: "k-cx-ex-k", text: t.mode === "method" ? "Returns" : "Output" }), el("pre", { class: "k-mono", text: c.out })])
            ]));
          });
        }
        if (hintsOpen) {
          var h = t.hints[hintsOpen - 1];
          bodyEl.appendChild(el("aside", { class: "k-callout k-cx-hintcall", "data-kind": "tip" }, [
            el("div", { class: "k-callout-head" }, [el("span", { class: "k-callout-mark", "aria-hidden": "true", text: "→" }),
              ["Nudge", "Pointer", "Shape of the answer"][hintsOpen - 1] + " · hint " + hintsOpen + " of " + t.hints.length]),
            el("p", { text: h })
          ]));
        }
        bodyEl.appendChild(answerArea());
      }
      function drawHints() {
        bodyEl.appendChild(KOS.codeUI.hintLadder({ hints: t.hints || [], open: hintsOpen, onOpen: function () {
          hintsOpen = C().openHint(t.id);
          strip.querySelector(".k-cx-strip-h").textContent = "hint " + hintsOpen + " open";
          announce("Hint " + hintsOpen + " open.");
          draw();
        } }));
        bodyEl.appendChild(answerArea());
      }
      function drawNotes() {
        var c = C().content(t.lesson);
        var qr = c && c.notes ? KOS.codeTopic.quickRef(c) : null;
        bodyEl.appendChild(qr || KOS.ui.emptyState({ compact: true, body: "The lesson's quick reference appears here once the lesson is written." }));
        bodyEl.appendChild(el("button", { type: "button", class: "k-link", text: "Open lesson " + t.lesson + " →", onclick: function () { KOS.show("ref", { subject: SID, ref: t.lesson }); } }));
      }
      function answerArea() {
        var box = el("div", { class: "k-cx-answer" });
        if (hintsOpen < (t.hints || []).length && pick === "task") {
          box.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "code.hint-next", text: hintsOpen ? "Next hint" : "Show a hint",
            onclick: function () { hintsOpen = C().openHint(t.id); strip.querySelector(".k-cx-strip-h").textContent = "hint " + hintsOpen + " open"; announce("Hint " + hintsOpen + " open."); draw(); } }));
        }
        if (answerShown) {
          box.appendChild(el("div", { class: "k-cx-answer-pane", "data-ui": "code.answer" }, [
            el("span", { class: "k-kicker", text: "The answer" }),
            el("pre", { class: "k-cx-q-code k-mono", html: KOS.codeUI.highlight(t.answer || "") })
          ]));
        } else {
          box.appendChild(el("button", { type: "button", class: "k-link k-cx-see", "data-ui": "code.see-answer", text: "See the answer…", onclick: function (ev) { confirmAnswer(ev.currentTarget); } }));
        }
        box.appendChild(el("p", { class: "k-cx-note", text: "Hints never reduce the reward. Seeing the answer does." }));
        return box;
      }
      function confirmAnswer(back) {
        var q = C().quote(t.id, phone);
        KOS.ui.confirm({
          title: "See the answer?", danger: true, confirm: "See the answer",
          body: q.pay ? "The answer opens in this task. You can still finish it, but today's first pass will pay no reward. Hints you have opened are not affected."
                     : "The answer opens in this task. This task pays nothing now anyway (" + q.why + ")."
        }, function () {
          C().seeAnswer(t.id);
          answerShown = true;
          draw();
          announce("The answer is open. Passing now pays no reward.");
        }, function () { if (back && back.isConnected) back.focus(); });
      }
      draw();
      return panel;
    }
    function setCollapsed(on) {
      if (phone) return;
      KOS.ui.state(page, "collapsed", !!on);
      ui.taskCollapsed = !!on; KOS.store.save();
      say(on ? "Task collapsed." : "Task shown.");
    }
  }
  /* a task that wants a computer, on a phone (frame 26v) */
  function phoneLater(main, t) {
    var saved = C().isLater("task", t.id);
    var seed = t.fs || ((t.examples || [])[0] || {}).fs;
    main.appendChild(KOS.ui.pageHeader({ kicker: "Code · task", title: t.title }));
    var btn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.save-later",
      text: saved ? "Saved ✓" : "Save for the computer", disabled: saved ? "" : null,
      onclick: function () { C().saveLater("task", t.id, t.lesson); btn.textContent = "Saved ✓"; btn.disabled = true; announce("Saved for the computer."); } });
    main.appendChild(el("section", { class: "k-card k-cx-phonelater", "data-ui": "code.best-on-computer" }, [
      el("span", { class: "k-cx-chip", "data-tone": "amber", text: "Best on a computer" }),
      el("div", { class: "k-prose", html: KOS.content.renderBlocks(t.statement || []) }),
      seed ? KOS.codeUI.filesPanel(seed, { open: true }) : null,
      t.examples && t.examples[0] ? el("div", { class: "k-cx-ex" }, [el("div", {}, [el("span", { class: "k-cx-ex-k", text: "Example output" }), el("pre", { class: "k-mono", text: t.examples[0].out })])]) : null,
      el("p", { class: "k-cx-note", text: "This one needs a wide editor. Read it now, write it later." }),
      btn
    ].filter(Boolean)));
  }

  /* ======================================================================
     26h · retrieval
     ====================================================================== */
  function pageRetrieval(main, arg) {
    var due = C().dueCards();
    main.appendChild(KOS.ui.pageHeader({ kicker: "Code · Retrieval", title: "Retrieval",
      sub: due.length ? "Prove each skill again from memory · " + due.length + " due today" : "Prove each skill again from memory" }));
    if (!due.length) {
      var next = C().nextDue();
      main.appendChild(KOS.ui.emptyState({ mark: "復", title: next ? "Nothing due — the next one is " + (C().daysBetween(KOS.srs.todayISO(), next) === 1 ? "tomorrow." : dayLabel(next) + ".") : "Nothing due",
        body: next ? "Each skill comes back as a new variation when its review is due." : "A skill's first review is scheduled when you prove it in a task.",
        action: el("button", { type: "button", class: "k-btn", text: "Open the skill map", onclick: function () { KOS.show("code", { page: "skills" }); } }) }));
      return;
    }
    var pickId = arg && arg.id && due.some(function (r) { return r.id === arg.id; }) ? arg.id : due[0].id;
    var done = {};
    var grid = el("div", { class: "k-cx-rgrid" });
    var list = el("ol", { class: "k-cx-rlist", "data-ui": "code.due-list", role: "listbox", "aria-label": "Due, by priority", tabindex: "0" });
    var listCard = el("section", { class: "k-card k-cx-rlistcard", "aria-label": "Due" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Due" }), el("span", { class: "k-card-meta", text: due.length + " · by priority" }),
        el("span", { class: "k-cx-rpos k-mono", "data-ui": "code.due-pos" })]),
      list,
      el("p", { class: "k-cx-note", text: "Oldest proof first, then the ones you found hard." })
    ]);
    var stage = el("div", { class: "k-cx-rstage" });
    grid.appendChild(listCard); grid.appendChild(stage);
    main.appendChild(grid);
    function drawList() {
      list.innerHTML = "";
      due.forEach(function (r, i) {
        var on = r.id === pickId;
        var item = el("li", { class: "k-cx-ritem", role: "option", "aria-selected": String(on), "data-id": r.id, "data-state": done[r.id] ? "done" : on ? "current" : null,
          onclick: function () { pickId = r.id; drawList(); drawCard(); } }, [
          el("span", { class: "k-mono k-cx-ritem-n", text: done[r.id] ? "✓" : String(i + 1) }),
          el("span", { class: "k-cx-ritem-t" }, [el("b", { text: r.title }), el("small", { text: (r.unit || "") + " · " + (r.overdue > 3 ? "rusty" : "due") + (r.grade ? " · was " + r.grade.charAt(0).toUpperCase() + r.grade.slice(1) : "") })]),
          el("span", { class: "k-cx-ritem-d" }, [KOS.codeUI.dot(C().band(r.days)), " " + (r.days == null ? "—" : r.days + " d")])
        ]);
        list.appendChild(item);
      });
      listCard.querySelector("[data-ui~='code.due-pos']").textContent = (due.map(function (r) { return r.id; }).indexOf(pickId) + 1) + " / " + due.length;
    }
    list.addEventListener("keydown", function (e) {
      var ids = due.map(function (r) { return r.id; }), i = ids.indexOf(pickId);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); pickId = ids[Math.max(0, Math.min(ids.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)))]; drawList(); }
      else if (e.key === "Enter") { e.preventDefault(); drawCard(); var f = stage.querySelector("textarea, input"); if (f) f.focus(); }
    });
    function nextUndone() { return due.filter(function (r) { return !done[r.id]; })[0]; }
    function drawCard() {
      stage.innerHTML = "";
      var row = C().cardRow(pickId), cd = C().card(pickId);
      var v = C().variation(pickId, row.n);
      if (!v) { stage.appendChild(KOS.ui.emptyState({ compact: true, body: "This card has no variation yet." })); return; }
      if (done[pickId]) {
        stage.appendChild(KOS.ui.emptyState({ compact: true, title: "Done for today", body: "This skill is scheduled again on " + dayLabel(C().cardRow(pickId).due) + "." }));
        return;
      }
      var phone = C().isPhone();
      var kind = v.kind || cd.kind || "write";
      if (phone && kind === "write" && v.phoneAlt) { v = Object.assign({}, v, v.phoneAlt); kind = v.kind; }
      var started = Date.now(), tries = 0, hinted = false;
      var card = el("section", { class: "k-card k-cx-rcard", "data-ui": "code.retrieval-card", "aria-label": cd.title }, [
        el("div", { class: "k-cx-rcard-top" }, [
          el("span", { class: "k-kicker", text: "Retrieval · " + (row.unit || "") + " · " + cd.title }),
          el("span", { class: "k-cx-chip", "data-tone": "code", text: "Variation " + row.n })
        ]),
        el("h2", { class: "k-cx-rcard-t", text: v.prompt }),
        v.params && v.params.length ? el("div", { class: "k-cx-params" }, [el("span", { class: "k-muted", text: "this time:" })].concat(v.params.map(function (p) { return el("span", { class: "k-cx-chip k-mono", text: p }); }))) : null
      ].filter(Boolean));
      stage.appendChild(card);
      var out = el("div", { class: "k-cx-q-out", "data-ui": "code.retrieval-out" });
      var timer = el("span", { class: "k-cx-timer k-mono", text: "◷ 0:00" });
      var tk = setInterval(function () { if (!timer.isConnected) { clearInterval(tk); return; } var s = Math.round((Date.now() - started) / 1000); timer.textContent = "◷ " + Math.floor(s / 60) + ":" + ("0" + s % 60).slice(-2); }, 1000);
      openTimers.push(tk);
      var hintBtn = el("button", { type: "button", class: "k-btn", "data-ui": "code.retrieval-hint", text: "Hint", disabled: v.hint ? null : "",
        onclick: function () { hinted = true; hintBtn.disabled = true; out.insertBefore(el("p", { class: "k-cx-why", text: "Hint · " + v.hint }), out.firstChild); announce("Hint shown. This card will grade Hard."); } });
      var ed = null, ans = null, inputs = null, parts = null;
      if (kind === "predict") {
        card.appendChild(el("pre", { class: "k-cx-q-code k-mono", html: KOS.codeUI.highlight(v.src, C().runnerFor(cd.lesson) === "sql" ? "sql" : null) }));
        ans = el("textarea", { class: "k-input k-cx-q-in k-mono", rows: "2", spellcheck: "false", "aria-label": "What it prints, one line per line of output", placeholder: "What it prints" });
        card.appendChild(ans);
      } else if (kind === "command") {
        /* a Rider lesson's card: the command itself, checked against its forms */
        ans = el("input", { type: "text", class: "k-input k-cx-q-in k-mono", "data-ui": "code.retrieval-command", spellcheck: "false", autocomplete: "off", autocapitalize: "off", "aria-label": "Your answer", placeholder: v.ci ? "The name" : "The command",
          onkeydown: function (e) { if (e.key === "Enter") { e.preventDefault(); check(); } } });
        card.appendChild(ans);
      } else if (kind === "fill") {
        parts = String(v.src).split("@@"); inputs = [];
        var pre = el("pre", { class: "k-cx-q-code k-cx-fill k-mono" });
        parts.forEach(function (part, i) {
          pre.appendChild(el("span", { html: KOS.codeUI.highlight(part, C().runnerFor(cd.lesson) === "sql" ? "sql" : null) }));
          if (i < parts.length - 1) { var inp = el("input", { type: "text", class: "k-cx-gap", "aria-label": "Gap " + (i + 1), size: "10", spellcheck: "false" }); inputs.push(inp); pre.appendChild(inp); }
        });
        card.appendChild(pre);
      } else {
        ed = KOS.codeUI.editor({ value: v.starter || "", file: C().fileFor(cd.lesson), compact: true, label: "Your answer", onRun: check });
        card.appendChild(ed.el);
        if (phone && C().ui().keybar !== false) card.appendChild(KOS.codeUI.keyBar(ed.input));
      }
      var go = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.retrieval-check", text: kind === "write" ? "✓ Run and check" : "Check", onclick: check });
      card.appendChild(el("div", { class: "k-cx-q-row" }, [go, hintBtn, el("span", { class: "k-muted", text: "a hint grades it Hard" }), timer]));
      card.appendChild(out);
      /* when each comes back if it goes well (Good each time) */
      var ivl = Math.max(3, row.ivl || 2), ef = 2.5, at = 0;
      var nextRows = [1, 2, 3].map(function (k) {
        var nv = C().variation(pickId, row.n + k);
        if (k > 1) ivl = Math.round(ivl * ef);
        at += ivl;
        var when = at < 60 ? "in " + at + " days" : "in " + Math.round(at / 30) + " months";
        return nv ? [when, "Variation " + (row.n + k), nv.label || nv.prompt] : null;
      }).filter(Boolean);
      if (nextRows.length) {
        stage.appendChild(el("section", { class: "k-card k-cx-rnext", "aria-label": "Next reviews" }, [
          el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Next reviews will ask…" }), el("span", { class: "k-card-meta", text: "a different variation each time" })]),
          el("ul", { class: "k-cx-rnext-l" }, nextRows.map(function (r) { return el("li", {}, [el("span", { class: "k-mono", text: r[0] }), el("b", { text: r[1] }), el("span", { text: r[2] })]); }))
        ]));
      }
      function finish(passed) {
        var res = C().recordCard(pickId, { passed: passed, tries: tries, hint: hinted, secs: Math.round((Date.now() - started) / 1000) });
        done[pickId] = true;
        go.disabled = true; hintBtn.disabled = true;
        if (ed) ed.readOnly(true);
        var g = res.grade.charAt(0).toUpperCase() + res.grade.slice(1);
        var box = el("div", { class: "k-cx-outcome", "data-ui": "code.retrieval-outcome", "data-state": passed ? "proven" : "again" });
        if (passed) {
          box.appendChild(el("p", {}, [el("b", { text: "✓ Proven" }), " ", el("span", { class: "k-cx-chip", "data-tone": "pass", text: g }), " next in " + plural(res.ivl, "day")]));
          box.appendChild(el("p", { class: "k-cx-note", text: "Derived, not self-reported: " + (tries === 1 ? "first try" : plural(tries, "try", "tries")) + (hinted ? ", a hint" : ", no hint") + ", " + Math.round((Date.now() - started) / 1000) + " s." }));
          box.appendChild(KOS.codeUI.reward(res.pay ? res : { capped: true }));
          if (res.pay) box.appendChild(el("p", { class: "k-cx-note", text: "Retrieval rewards today: " + res.today + " of " + res.cap }));
          else box.appendChild(el("p", { class: "k-cx-note", text: "It still counts on the schedule and the skill map." }));
          announce("Proven. " + g + ". Next in " + plural(res.ivl, "day") + "." + (res.pay ? " +4 XP." : " No reward: today's retrieval rewards are used."));
        } else {
          box.appendChild(el("p", {}, [el("b", { text: "✗ Again" }), " · back tomorrow"]));
          var lesson = cd.lesson ? C().lesson(cd.lesson) : null;
          box.appendChild(el("p", { class: "k-cx-note", text: "3 tries without a pass." + (lesson ? " Lesson " + lesson.ref + " is linked for a reread." : "") }));
          box.appendChild(KOS.codeUI.reward({ why: "not proven this time" }));
          if (lesson) box.appendChild(el("button", { type: "button", class: "k-link", text: "Reread " + lesson.ref + " " + lesson.title + " →", onclick: function () { KOS.show("ref", { subject: SID, ref: lesson.ref }); } }));
          announce("Again. Back tomorrow.");
        }
        var nx = nextUndone();
        box.appendChild(nx ? el("button", { type: "button", class: "k-btn", "data-ui": "code.retrieval-next", text: "Next →", onclick: function () { pickId = nx.id; drawList(); drawCard(); } })
          : el("p", { class: "k-cx-note", text: "That was the last one due today." }));
        out.appendChild(box);
        drawList();
        KOS.refreshRailCounters && KOS.refreshRailCounters();
      }
      function check() {
        if (go.disabled) return;
        tries++;
        out.querySelectorAll("[data-ui~='code.retrieval-try']").forEach(function (n) { n.remove(); });
        if (kind === "command") {
          if (C().commandMatches(v, ans.value)) return finish(true);
          tryAgain("Not yet. " + (tries >= 3 ? "It was: " + v.answer : "Try again."));
          return;
        }
        if (kind === "predict") {
          go.disabled = true;
          KOS.codeRun.run({ files: [{ name: C().fileFor(cd.lesson), src: v.src }], stdin: v.stdin || "", fs: v.fs, db: v.db, lesson: cd.lesson }).then(function (r) {
            go.disabled = false;
            var real = r.ok ? KOS.codeRun.norm(r.stdout) : "";
            if (r.ok && KOS.codeRun.sameAnswer(ans.value, r.stdout, C().runnerFor(cd.lesson) === "sql" ? "sql" : null)) return finish(true);
            tryAgain("Not yet. " + (tries >= 3 ? "" : "Try again."));
          });
          return;
        }
        var files = kind === "fill"
          ? [{ name: C().fileFor(cd.lesson), src: parts.map(function (p, i) { return p + (i < inputs.length ? inputs[i].value : ""); }).join("") }]
          : ed.files();
        go.disabled = true;
        if (ed) ed.running(true);
        KOS.codeRun.check({ mode: v.mode || "program", method: v.method, cases: v.cases, rules: v.rules, fs: v.fs, db: v.db, answer: v.answer, lesson: cd.lesson }, files).then(function (c) {
          go.disabled = false;
          if (ed) ed.running(false);
          if (c.passed) return finish(true);
          if (c.compile) { if (ed) { ed.state("compile", "1 compile error"); ed.mark(c.compile.line, KOS.codeUI.quoted(c.compile.msg)); } tryAgain(null, KOS.codeUI.errorCard(c.compile)); return; }
          if (c.rule) { tryAgain("✗ Not yet · output matched · rule failed. " + c.rule.msg); return; }
          tryAgain(null, KOS.codeUI.results(c));
        });
      }
      function tryAgain(msg, node) {
        if (tries >= 3) return finish(false);
        var box = el("div", { class: "k-cx-try", "data-ui": "code.retrieval-try" }, [msg ? el("p", { class: "k-cx-verdict", "data-state": "wrong", text: msg }) : null, node || null,
          el("p", { class: "k-cx-note", text: "Try " + tries + " of 3." })].filter(Boolean));
        out.appendChild(box);
        announce((msg || "Not yet.") + " Try " + tries + " of 3.");
      }
    }
    drawList(); drawCard();
  }

  /* ======================================================================
     26i · the skill map
     ====================================================================== */
  function pageSkills(main, arg) {
    var ui = C().ui();
    var strand = ui.skillStrand || "all", bandF = null, selected = arg && arg.id || null;
    var all = C().skills();
    var n = bandCounts(), proven = n.b0 + n.b1 + n.b2 + n.b3;
    var head = KOS.ui.pageHeader({ kicker: "Code · Skill map", title: "Skill map",
      sub: proven + " proven · " + n.np + " covered, not proven · " + n.later + " recommended later" });
    main.appendChild(head);
    var seg = el("div", { class: "k-seg k-seg--quiet", role: "radiogroup", "aria-label": "Strand", "data-ui": "code.skill-strand" });
    ["all", "L", "E", "S"].forEach(function (k) {
      seg.appendChild(el("button", { type: "button", class: "k-seg-item", role: "radio", "aria-checked": String(strand === k), "data-state": strand === k ? "active" : null,
        "data-v": k, text: ({ all: "All", L: "C#", E: "Engineering", S: "Computer science" })[k], onclick: function () { strand = k; ui.skillStrand = k; KOS.store.save(); draw(); } }));
    });
    var hdActs = head.querySelector(".k-pagehead-actions");
    if (!hdActs) { hdActs = el("div", { class: "k-pagehead-actions" }); head.appendChild(hdActs); }
    hdActs.appendChild(seg);
    /* the bands are the side column's first card: a legend that filters */
    var BANDS = [["b0", "≤ 7 days"], ["b1", "8–21 days"], ["b2", "22–40 days"], ["b3", "41+ days"], ["np", "Not proven"], ["later", "Later"]];
    var tiles = el("div", { class: "k-cx-bandlist", "data-ui": "code.band-tiles", role: "group", "aria-label": "Filter by band" });
    BANDS.forEach(function (b) {
      tiles.appendChild(el("button", { type: "button", class: "k-cx-bandrow", "data-band": b[0], "aria-pressed": "false",
        onclick: function () { bandF = bandF === b[0] ? null : b[0]; draw(); } }, [
        KOS.codeUI.dot(b[0]), el("span", { text: b[1] }), el("b", { class: "k-mono", text: String(n[b[0]]) })
      ]));
    });
    var summary = el("section", { class: "k-card k-cx-sksum", "aria-label": "Bands" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "By days since proven" }), el("span", { class: "k-card-meta", text: "tap to filter" })]),
      el("div", { class: "k-cx-bandbar", "aria-hidden": "true" }, ["b0", "b1", "b2", "b3", "np"].map(function (b) {
        return el("span", { "data-band": b, style: "--w: " + (100 * n[b] / Math.max(1, proven + n.np)) + "%" });
      })),
      tiles
    ]);
    var grid = el("div", { class: "k-cx-skills" });
    var lists = el("div", { class: "k-cx-units", "data-ui": "code.skill-units" });
    var aside = el("div", { class: "k-cx-skside" });
    grid.appendChild(lists); grid.appendChild(aside);
    main.appendChild(grid);
    /* which unit cards are open is per device; until it is set, a unit with
       anything covered or proven opens and the rest stay folded */
    function isOpen(u, rows) {
      if (bandF) return true;
      var o = ui.skillOpen && ui.skillOpen[u];
      if (typeof o === "boolean") return o;
      return rows.some(function (s) { return s.band !== "later"; });
    }
    function setOpen(u, v) {
      if (!ui.skillOpen || typeof ui.skillOpen !== "object") ui.skillOpen = {};
      ui.skillOpen[u] = v; KOS.store.save();
    }
    var PILL = { np: ["○", "Not proven"], later: ["◷", "Later"] };
    function pill(s) {
      var p = s.proven ? ["✓", s.band === "b3" ? "Rusty" : "Proven"] : PILL[s.band] || PILL.later;
      return el("span", { class: "k-cx-spill", "data-band": s.band }, [el("span", { "aria-hidden": "true", text: p[0] }), p[1]]);
    }
    function draw() {
      var act = document.activeElement, keep = act && lists.contains(act) ? (act.getAttribute("data-id") ? '[data-id="' + act.getAttribute("data-id") + '"]' : act.getAttribute("data-unit") ? '[data-unit="' + act.getAttribute("data-unit") + '"]' : null) : null;
      [].forEach.call(seg.children, function (b) { var on = b.getAttribute("data-v") === strand; b.setAttribute("aria-checked", String(on)); KOS.ui.state(b, "active", on); });
      [].forEach.call(tiles.children, function (b) { var on = b.getAttribute("data-band") === bandF; b.setAttribute("aria-pressed", String(on)); KOS.ui.state(b, "active", on); });
      lists.innerHTML = "";
      var byUnit = {};
      all.forEach(function (s) { (byUnit[s.unit] = byUnit[s.unit] || []).push(s); });
      var shown = 0;
      C().units().forEach(function (u) {
        var rows = (byUnit[u.ref] || []).filter(function (s) { return (strand === "all" || (s.strands || []).indexOf(strand) >= 0) && (!bandF || s.band === bandF); });
        if (!rows.length) return;
        shown += rows.length;
        var pr = rows.filter(function (s) { return s.proven; }).length;
        var pct = Math.round(100 * pr / rows.length);
        var open = isOpen(u.ref, rows);
        var listId = "k-cx-skl-" + u.ref;
        var ul = el("ul", { class: "k-cx-skl", id: listId, "aria-label": u.title, hidden: open ? null : "" });
        if (open) rows.forEach(function (s) {
          var L = C().lesson(s.lesson);
          ul.appendChild(el("li", {}, [el("button", { type: "button", class: "k-cx-skrow", "data-id": s.id, "aria-pressed": String(selected === s.id), "data-state": selected === s.id ? "selected" : null,
            "aria-label": s.name + ", " + (s.proven ? "proven " + s.days + " days ago" : s.band === "np" ? "not proven" : "later") + ", lesson " + s.lesson,
            onclick: function () { selected = selected === s.id ? null : s.id; draw(); if (selected) { var sk = C().skill(s.id); announce(sk.name + (sk.proven ? ", proven " + sk.days + " days ago by " + byWord(sk.proven.by) + "." : ", not proven yet.")); } } }, [
            KOS.codeUI.dot(s.band),
            el("span", { class: "k-mono k-cx-skrow-n", text: s.name }),
            el("span", { class: "k-cx-skrow-l" }, [el("span", { class: "k-mono", text: s.lesson }), L ? " " + L.title : ""]),
            pill(s),
            el("span", { class: "k-cx-skrow-d k-mono", "data-band": s.band, text: s.proven ? s.days + " d" : "—" }),
            el("span", { class: "k-cx-skrow-go", "aria-hidden": "true", text: "›" })
          ])]));
        });
        var head = el("button", { type: "button", class: "k-cx-acc-h", "data-unit": u.ref, "aria-expanded": String(open), "aria-controls": listId,
          onclick: function () { setOpen(u.ref, !open); draw(); } }, [
          el("span", { class: "k-mono k-cx-acc-ref", text: u.ref === "B" ? "B" : u.ref }),
          el("span", { class: "k-cx-acc-t", text: u.title }),
          el("span", { class: "k-cx-bandbar k-cx-bandbar--thin k-cx-acc-bar", "aria-hidden": "true" }, ["b0", "b1", "b2", "b3", "np"].map(function (b) {
            return el("span", { "data-band": b, style: "--w: " + (100 * rows.filter(function (s) { return s.band === b; }).length / rows.length) + "%" });
          })),
          el("span", { class: "k-cx-acc-ring", style: "--p: " + pct + "%", "aria-hidden": "true" }, [el("span")]),
          el("span", { class: "k-cx-acc-n" }, [el("b", { class: "k-mono", text: pr + " / " + rows.length }), el("small", { text: "proven" })]),
          el("span", { class: "k-cx-acc-chev", "aria-hidden": "true", text: "⌄" })
        ]);
        lists.appendChild(el("section", { class: "k-card k-cx-unitcard", "data-state": open ? "open" : null, "aria-label": u.title }, [head, ul]));
      });
      var withConcepts = Object.keys(byUnit);
      var rest = C().coreUnits().filter(function (u) { return withConcepts.indexOf(u.ref) < 0; });
      if (rest.length && !bandF) {
        lists.appendChild(el("button", { type: "button", class: "k-card k-cx-unitcard k-cx-later-units", "data-state": "later", onclick: function () { KOS.show("code", { page: "map" }); } }, [
          el("span", { class: "k-mono k-cx-acc-ref", text: rest[0].ref + "+" }),
          el("span", { class: "k-cx-acc-t", text: rest[0].ref === rest[rest.length - 1].ref ? rest[0].title : "Units " + rest.map(function (u) { return u.ref; }).filter(function (r) { return r !== "B"; }).map(function (r) { return r.slice(1); }).filter(function (r, i, a) { return i === 0 || i === a.length - 1; }).join("–") + (rest.some(function (u) { return u.ref === "B"; }) ? " and Bridge B" : "") }),
          el("span", { class: "k-muted", text: "their concepts arrive with their lessons ›" })
        ]));
      }
      if (!shown) lists.insertBefore(KOS.ui.emptyState({ compact: true, body: strand !== "all" ? "No concepts in this strand yet." : "Nothing in this band." }), lists.firstChild);
      drawAside();
      if (keep) { var back = lists.querySelector(keep); if (back) back.focus(); }
    }
    function byWord(b) { return b === "task" ? "Task" : b === "retrieval" ? "Retrieval" : b === "practice" ? "Practice" : b === "kata" ? "Kata" : b === "project" ? "Project" : b; }
    function drawAside() {
      aside.innerHTML = "";
      aside.appendChild(summary);
      if (selected) {
        var s = C().skill(selected);
        if (s) {
          var cc = C().concept(selected), L = C().lesson(s.lesson);
          var proofs = C().proofsOf(selected, 3);
          var cards = C().allCards().filter(function (cd) { return (cd.concepts || []).indexOf(selected) >= 0; });
          aside.appendChild(el("section", { class: "k-card k-cx-concept", "data-ui": "code.concept-panel", "aria-label": "Concept " + s.name }, [
            el("div", { class: "k-cx-concept-h" }, [el("span", { class: "k-kicker", text: "Concept" }),
              el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Close the concept", text: "✕", onclick: function () { selected = null; draw(); } })]),
            el("h2", { class: "k-mono k-cx-concept-n", text: s.name }),
            el("p", { class: "k-muted", text: (cc.about ? cc.about + " · " : "") + (s.unit || "") + " · lesson " + s.lesson }),
            el("p", { class: "k-cx-concept-days" }, s.proven ? [el("b", { text: String(s.days) }), " days since last proven"] : [s.band === "later" ? "Recommended later" : "Not proven yet"]),
            proofs.length ? el("div", {}, [el("span", { class: "k-kicker", text: "Proven by" }), el("ul", { class: "k-insp-list" }, proofs.map(function (e) {
              var m = e.metrics || {};
              var what = m.kind === "task" ? "Task · " + ((C().task(m.id) || {}).title || m.id) : m.kind === "retrieval" ? "Retrieval · " + (m.grade ? m.grade.charAt(0).toUpperCase() + m.grade.slice(1) : "") : "Practice · " + (L ? L.ref : "");
              return el("li", {}, [el("span", { text: dayLabel(e.date) }), el("strong", { text: what })]);
            }))]) : null,
            cards.length ? el("div", {}, [el("span", { class: "k-kicker", text: "Skill cards" }), el("ul", { class: "k-insp-list" }, cards.map(function (cd) {
              var r = C().cardRow(cd.id);
              return el("li", {}, [el("span", { text: cd.title }), el("strong", { text: r ? (r.due <= KOS.srs.todayISO() ? "due now" : "in " + C().daysBetween(KOS.srs.todayISO(), r.due) + " days") : "after a proof" })]);
            }))]) : null,
            el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.prove-now", text: "Prove it now",
              onclick: function () {
                var c0 = cards.filter(function (cd) { return C().cardRow(cd.id); })[0];
                var t0 = C().tasksOf(s.lesson).filter(function (t) { return (t.concepts || []).indexOf(selected) >= 0; })[0];
                if (c0 && C().cardRow(c0.id).due <= KOS.srs.todayISO()) KOS.show("code", { page: "retrieval", id: c0.id });
                else if (t0) KOS.show("code", { page: "task", id: t0.id });
                else KOS.show("ref", { subject: SID, ref: s.lesson });
              } })
          ].filter(Boolean)));
        }
      }
      var rusty = all.filter(function (s) { return s.band === "b3"; }).sort(function (a, b) { return b.days - a.days; }).slice(0, 5);
      aside.appendChild(el("section", { class: "k-card k-cx-rusty", "aria-label": "Getting rusty" }, [
        el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Getting rusty" }), el("span", { class: "k-card-meta", text: "41+ days" })]),
        rusty.length ? el("ul", { class: "k-cx-rusty-l" }, rusty.map(function (s) {
          return el("li", {}, [KOS.codeUI.dot("b3"), el("span", { class: "k-mono", text: s.name }), el("span", { class: "k-mono", "data-band": "b3", text: s.days + " d" }),
            el("button", { type: "button", class: "k-link", text: "Prove ›", onclick: function () { selected = s.id; draw(); } })]);
        })) : el("p", { class: "k-cx-note", text: "Nothing is older than 40 days." })
      ]));
      if (!proven) aside.appendChild(el("section", { class: "k-card" }, [
        el("p", { class: "k-cx-note", text: "Concepts fill in as you prove them in code." }),
        el("button", { type: "button", class: "k-btn", text: "Start unit 1", onclick: function () { KOS.show("ref", { subject: SID, ref: "1.1" }); } })
      ]));
    }
    draw();
  }

  /* ======================================================================
     26r · Code settings
     ====================================================================== */
  /* the full runtime's card in settings (26r): its state and what to do */
  function runtimeState() {
    var R = KOS.codeRun, box = el("div", { class: "k-cx-runstate", "data-ui": "code.runtime-state" });
    function draw() {
      var rt = R.runtime();
      box.innerHTML = "";
      box.setAttribute("data-state", rt.state === "ready" ? "on" : rt.state);
      var words = {
        absent: ["Not downloaded", "Units 7–9, 11 and 12 run on it: real .NET and the C# compiler, downloaded once."],
        idle: ["On this device", "Starts when a lesson needs it; works offline."],
        downloading: ["Downloading · " + (rt.total ? Math.round(100 * rt.loaded / rt.total) : 0) + "%", "Units 1–6 still run meanwhile."],
        ready: ["● Ready · works offline", "Started in " + (rt.ms / 1000).toFixed(1) + " s; compiles a program in about a second."],
        failed: ["Download stopped", rt.error || "Try again; what arrived is kept."],
        offline: ["Offline", "It downloads when you're back online."],
        file: ["Needs http(s)", "Open the app from its address, not as a file, to use it."]
      }[rt.state] || ["", ""];
      box.appendChild(el("span", { class: "k-kicker", text: "Full .NET runtime" }));
      box.appendChild(el("b", { text: words[0] }));
      box.appendChild(el("small", { text: words[1] }));
      var acts = [];
      if (rt.state === "absent" || rt.state === "failed") acts.push(el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "code.runtime-offer", text: rt.state === "failed" ? "Try again" : "Download…", onclick: function () { KOS.codeUI.runtimeOffer(); } }));
      if (rt.wanted && rt.state !== "file") acts.push(el("button", { type: "button", class: "k-btn k-btn--sm k-btn--quiet", "data-ui": "code.runtime-remove", text: "Remove from this device",
        onclick: function () { KOS.ui.confirm({ title: "Remove the full runtime?", body: "Its files leave this device; units 7–9, 11 and 12 offer the download again. Your code and progress are not affected.", danger: true, confirm: "Remove" }, function () { R.removeRuntime().then(function () { announce("Full runtime removed."); KOS.rerender(); }); }); } }));
      if (acts.length) box.appendChild(el("div", { class: "k-cx-runstate-acts" }, acts));
    }
    var off = KOS.codeRun.onRuntime(function () { if (!box.isConnected) { off(); return; } draw(); });
    draw();
    return box;
  }
  function runtimeStorage() {
    var out = el("strong", { text: "—" });
    if (KOS.codeRun.runtime().wanted) KOS.codeRun.runtimeSize().then(function (sz) { if (sz) out.textContent = (sz.bytes / 1e6).toFixed(0) + " MB"; });
    return out;
  }
  /* GitHub (docs/code-plan.md §10). v2 (docs/github-app-plan.md): your
     installation of the KurenaiOS GitHub App, so no device holds a token;
     v1, under "Use a token instead": a fine-grained token typed by you,
     kept on this device and never shown again. */
  function githubCard() {
    var G = KOS.codeGit;
    var box = el("section", { class: "k-card k-cx-gh", "data-ui": "code.github", "aria-label": "GitHub" });
    if (!G) return box;
    var drawn = false;
    function draw() {
      G.status().then(function (st) {
        if (!box.isConnected && drawn) return;
        drawn = true;
        box.innerHTML = "";
        box.appendChild(el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "GitHub" }),
          el("span", { class: "k-card-meta", text: st.connected ? st.cfg.repo : "not connected on this device" })]));
        if (!st.connected) return form(st);
        connected(st);
      });
    }
    function form(st) {
      /* the App first, when this app has one and you are signed in */
      if (st.app !== "unconfigured") {
        var appMsg = el("p", { class: "k-cx-note", role: "status" });
        var viaApp = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.github-app",
          text: "Connect with GitHub", disabled: st.app ? "" : null,
          onclick: function () {
            viaApp.disabled = true;
            G.connectApp().then(function (r) { if (!r.ok) { viaApp.disabled = false; appMsg.textContent = r.why; announce(r.why); } });
          } });
        box.appendChild(el("p", { class: "k-cx-note", text: "Your passed tasks, capstones and Rider reports, committed to your own repository. Install the KurenaiOS GitHub App on that one repository: no token to make, and every signed-in device can push." }));
        box.appendChild(el("div", { class: "k-cx-gh-act" }, [viaApp]));
        if (st.app === "signed-out") appMsg.textContent = "Sign in to cloud sync first.";
        box.appendChild(appMsg);
        var more = el("details", { class: "k-cx-gh-token", "data-ui": "code.github-token-way" }, [el("summary", { text: "Use a token instead" })]);
        box.appendChild(more);
        return tokenForm(st, more);
      }
      return tokenForm(st, box);
    }
    function tokenForm(st, into) {
      var repo = el("input", { type: "text", class: "k-input", "data-ui": "code.github-repo", placeholder: "owner/kurenai-programming", value: st.cfg.repo || "",
        autocapitalize: "off", spellcheck: "false", "aria-label": "Repository" });
      var token = el("input", { type: "password", class: "k-input", "data-ui": "code.github-token", placeholder: "github_pat_…", autocomplete: "off", "aria-label": "Fine-grained token" });
      var msg = el("p", { class: "k-cx-note", role: "status" });
      var go = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.github-connect", text: "Connect",
        onclick: function () {
          go.disabled = true; msg.textContent = "Checking the repository…";
          G.connect(repo.value, token.value).then(function (r) {
            go.disabled = false; token.value = "";
            if (!r.ok) { msg.textContent = r.why; announce(r.why); return; }
            announce("Connected to " + r.repo + "."); draw();
          });
        } });
      if (into === box) into.appendChild(el("p", { class: "k-cx-note", text: "Your passed tasks, capstones and Rider reports, committed to your own private repository. Create the repository on GitHub first; the app never creates one." }));
      into.appendChild(el("ol", { class: "k-cx-gh-steps" }, [
        el("li", { text: "Create a private repository, e.g. kurenai-programming." }),
        el("li", {}, ["Make a fine-grained token at ", el("span", { class: "k-mono", text: "github.com/settings/personal-access-tokens" }), ": only that repository, Contents read and write, an expiry."]),
        el("li", { text: "Paste both here. The token stays on this device, never in a backup or the synced state." })
      ]));
      into.appendChild(el("div", { class: "k-cx-gh-form" }, [
        el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Repository" }), repo]),
        el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Token" }), token])
      ]));
      into.appendChild(el("div", { class: "k-cx-gh-act" }, [go]));
      into.appendChild(msg);
    }
    function connected(st) {
      var c = st.cfg;
      var mode = el("select", { class: "k-input", "data-ui": "code.github-mode", "aria-label": "When to push",
        onchange: function () { G.setMode(mode.value); announce("GitHub: " + mode.options[mode.selectedIndex].text + "."); } },
        [["off", "Off: nothing is queued"], ["checkpoint", "Checkpoints: push when I press Push"], ["auto", "Automatic: push soon after a pass"]].map(function (o) { return el("option", { value: o[0], text: o[1] }); }));
      mode.value = c.mode;
      var last = st.last;
      var lastText = !last ? "Nothing pushed from this device yet." : last.ok ? "Pushed " + dayLabel(new Date(last.at).toISOString().slice(0, 10)) + " " + hmText(last.at) + " · " + last.message
        : (last.blocked ? "Blocked: " : "Last try failed: ") + last.why;
      var msgIn = el("input", { type: "text", class: "k-input", "data-ui": "code.github-message", placeholder: "Checkpoint message (optional)", "aria-label": "Commit message" });
      var push = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.github-push", text: "Push now",
        onclick: function () {
          push.disabled = true; push.textContent = "Pushing…";
          G.push(msgIn.value.trim() || null).then(function (r) { announce(r.ok ? "Pushed " + r.files + " files." : r.why); draw(); });
        } });
      box.appendChild(el("ul", { class: "k-insp-list" }, [
        el("li", {}, [el("span", { text: "Repository" }), el("strong", { class: "k-mono", text: c.repo + " · " + c.branch })]),
        el("li", {}, [el("span", { text: "Connected" }), el("strong", { "data-ui": "code.github-via", text: c.via === "app" ? "Through the GitHub App" : "With a token on this device" })]),
        el("li", {}, [el("span", { text: "Waiting on this device" }), el("strong", { text: st.waiting ? st.waiting + " file" + (st.waiting === 1 ? "" : "s") : "nothing" })])
      ]));
      box.appendChild(el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "When to push" }), mode]));
      box.appendChild(el("p", { class: "k-cx-note", "data-ui": "code.github-last", "data-tone": last && !last.ok ? "warn" : null, text: lastText }));
      box.appendChild(el("div", { class: "k-cx-gh-act" }, [msgIn, push]));
      box.appendChild(c.via === "app"
        ? el("button", { type: "button", class: "k-link", "data-ui": "code.github-disconnect", text: "Disconnect the GitHub App…",
            onclick: function () {
              KOS.ui.confirm({ title: "Disconnect the GitHub App?", confirm: "Disconnect",
                body: "No device pushes through it any more. To remove its access to the repository entirely, uninstall it on GitHub too." },
                function () { G.disconnectApp().then(function () { announce("The GitHub App is disconnected."); draw(); }); });
            } })
        : el("button", { type: "button", class: "k-link", "data-ui": "code.github-disconnect", text: "Disconnect this device",
            onclick: function () { G.disconnect().then(function () { announce("GitHub disconnected on this device."); draw(); }); } }));
    }
    function hmText(ts) { var d = new Date(ts); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); }
    box.appendChild(el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "GitHub" })]));
    draw();
    /* the App's slug lives in the deferred js/env.local.js: a first draw
       during boot runs before it, so draw again once it has loaded */
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { if (box.isConnected) draw(); }, { once: true });
    return box;
  }
  function pageSettings(main) {
    var ui = C().ui();
    main.appendChild(KOS.ui.pageHeader({ kicker: "Settings", title: "Code", sub: "Runner, storage, practice and GitHub" }));
    function toggle(key, label, def) {
      var on = ui[key] !== undefined ? ui[key] !== false : def !== false;
      var cb = el("input", { type: "checkbox", class: "k-switch", role: "switch", "aria-checked": String(on), "data-ui": "code.setting-" + key,
        onchange: function () { ui[key] = cb.checked; cb.setAttribute("aria-checked", String(cb.checked)); KOS.store.save(); announce(label + (cb.checked ? " on." : " off.")); } });
      cb.checked = on;
      return el("label", { class: "k-cx-toggle" }, [el("span", { text: label }), cb]);
    }
    var draftKB = Math.max(1, Math.round(JSON.stringify(ui.drafts || {}).length / 1024));
    main.appendChild(el("div", { class: "k-cx-settings" }, [
      el("section", { class: "k-card k-cx-set-wide", "aria-label": "Runner and full .NET runtime" }, [
        el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Runner and full .NET runtime" })]),
        el("div", { class: "k-cx-runstates" }, [
          el("div", { class: "k-cx-runstate", "data-state": "on" }, [el("span", { class: "k-kicker", text: "In-app runner" }), el("b", { text: "● Ready · works offline" }),
            el("small", { text: "Units 1–6 · time limit 2 seconds a run" })]),
          runtimeState()
        ]),
        el("p", { class: "k-cx-note", text: "Your code runs only on this device, in a worker with no network and no access to the rest of the app." })
      ]),
      el("section", { class: "k-card", "aria-label": "Storage used by Code" }, [
        el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Storage used by Code" })]),
        el("ul", { class: "k-insp-list" }, [
          el("li", {}, [el("span", { text: "Unsaved drafts on this device" }), el("strong", { text: draftKB + " KB" })]),
          el("li", {}, [el("span", { text: "Full runtime" }), runtimeStorage()])
        ]),
        el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "code.clear-drafts", text: "Clear drafts",
          onclick: function () { KOS.ui.confirm({ title: "Clear every draft?", body: "Unsaved code in tasks on this device goes back to each task's starter. Passed tasks and your progress are not affected.", danger: true, confirm: "Clear drafts" }, function () { ui.drafts = {}; KOS.store.save(); announce("Drafts cleared."); KOS.rerender(); }); } })
      ]),
      el("section", { class: "k-card", "aria-label": "Practice focus" }, [
        el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Practice focus" })]),
        el("p", { class: "k-cx-note", text: "What the Daily 20 draws from once a track is started." }),
        el("input", { type: "range", class: "k-cx-range", min: "0", max: "50", step: "10", value: "0", disabled: "", "aria-label": "Track share of the Daily 20", "aria-describedby": "k-cx-pf-why" }),
        el("p", { class: "k-cx-note", id: "k-cx-pf-why", text: "Start a track to mix it in. Core only for now." })
      ]),
      el("section", { class: "k-card", "aria-label": "Phone" }, [
        el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Phone" }), el("span", { class: "k-card-meta", text: "this device" })]),
        toggle("phoneTasks", "Phone tasks · reduced reward (units 1–3)"),
        toggle("keybar", "Symbol key bar"),
        el("p", { class: "k-cx-note", text: "Later tasks show “Best on a computer” and can be saved to For the computer." })
      ]),
      githubCard(),
      el("section", { class: "k-card", "aria-label": "What is never sent" }, [
        el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "What is never sent" })]),
        el("ul", { class: "k-cx-never" }, [
          "Your code runs on this device. It is not uploaded to run.",
          "Kurenai sees code only when you send it, after What is sent.",
          "GitHub receives only the paths you agree to.",
          "Tokens stay on this device."
        ].map(function (t) { return el("li", {}, [el("span", { "aria-hidden": "true", text: "✓ " }), t]); }))
      ])
    ]));
  }

  /* ======================================================================
     katas: five quick questions from covered lessons, against the clock.
     Each question is the lesson's own practice card; a run proves what its
     questions prove and pays nothing.
     ====================================================================== */
  function pageKata(main) {
    var head = KOS.ui.pageHeader({ kicker: "Code · Katas", title: "Katas", sub: "Five quick questions from lessons you've covered, against the clock" });
    main.appendChild(head);
    var body = el("div", { class: "k-cx-kata" });
    main.appendChild(body);
    var past = C().katas();
    function intro() {
      stopTimers();
      body.innerHTML = "";
      var draw = C().kataDraw();
      if (!draw.length) {
        var next = C().planDay(), L = next && next.lesson;
        body.appendChild(KOS.ui.emptyState({ mark: "型", title: "Nothing to drill yet",
          body: "Katas draw from lessons you've covered: every page read and every listing run." + (L ? " Finish " + L.ref + " " + L.title + " first." : ""),
          action: L ? el("button", { type: "button", class: "k-btn", text: "Open " + L.ref, onclick: function () { KOS.show("ref", { subject: SID, ref: L.ref }); } }) : null }));
        return;
      }
      var kinds = {}, refs = {};
      draw.forEach(function (x) { kinds[x.kind] = (kinds[x.kind] || 0) + 1; refs[x.ref] = 1; });
      var start = el("section", { class: "k-card k-cx-kata-start", "aria-label": "This kata" }, [
        el("span", { class: "k-kicker", text: "Today's kata" }),
        el("h2", { class: "k-cx-kata-t", text: draw.length + " questions · about " + (draw.length * 2) + " min" }),
        el("p", { class: "k-cx-note", text: Object.keys(kinds).map(function (k) { return kinds[k] + " " + KOS.codeTopic.KIND_LABEL[k].toLowerCase(); }).join(" · ") +
          " · from " + Object.keys(refs).sort().join(", ") }),
        el("div", { class: "k-cx-kata-go" }, [
          el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.kata-start", text: "▶ Start", onclick: function () { run(draw); } }),
          el("span", { class: "k-muted", text: "No reward · practice. Right answers still prove their skills." })
        ])
      ]);
      var hist = el("section", { class: "k-card k-cx-kata-hist", "aria-label": "Past katas" }, [
        el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Past katas" }), past.length ? el("span", { class: "k-card-meta", text: String(past.length) }) : null].filter(Boolean)),
        past.length ? el("ul", { class: "k-insp-list" }, past.slice(0, 8).map(function (k) {
          var d = new Date(k.at);
          return el("li", {}, [el("span", { text: DOW[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()] }),
            el("strong", { class: "k-mono", text: k.right + " / " + k.total + " · " + mmss(k.secs) })]);
        })) : el("p", { class: "k-cx-note", text: "Your runs appear here: how many right, and how long it took." })
      ]);
      body.appendChild(el("div", { class: "k-cx-kata-grid" }, [start, hist]));
    }
    function run(draw) {
      body.innerHTML = "";
      var i = 0, right = 0, t0 = Date.now(), results = [];
      var pos = el("span", { class: "k-kicker", "data-ui": "code.kata-pos" });
      var clock = el("span", { class: "k-mono k-cx-kata-clock", role: "timer", "aria-label": "Time" });
      var skip = el("button", { type: "button", class: "k-btn k-btn--quiet", "data-ui": "code.kata-skip", text: "Skip", onclick: function () { next(false); } });
      var bar = el("div", { class: "k-cx-kata-bar" }, [pos, clock, skip]);
      var card = el("section", { class: "k-card k-cx-q", "data-ui": "code.kata-card" });
      body.appendChild(bar); body.appendChild(card);
      var tick = setInterval(function () { if (!clock.isConnected) { clearInterval(tick); return; } clock.textContent = "◷ " + mmss(Math.round((Date.now() - t0) / 1000)); }, 1000);
      openTimers.push(tick);
      clock.textContent = "◷ 00:00";
      function show() {
        var x = draw[i];
        pos.textContent = "Question " + (i + 1) + " of " + draw.length + " · " + KOS.codeTopic.KIND_LABEL[x.kind] + " · " + x.ref;
        card.innerHTML = "";
        KOS.codeTopic.practiceCard(x.kind, card, x.ref, x.item, function () {
          if (!results[i]) { results[i] = true; right++; }
          skip.hidden = true;
          return el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "code.kata-next",
            text: i < draw.length - 1 ? "Next →" : "Finish", onclick: function () { next(true); } });
        });
        skip.hidden = false;
      }
      function next(ok) {
        if (!ok) results[i] = false;
        i++;
        if (i < draw.length) { show(); return; }
        clearInterval(tick);
        var secs = Math.round((Date.now() - t0) / 1000);
        C().recordKata({ right: right, total: draw.length, secs: secs, refs: draw.map(function (x) { return x.ref; }) });
        past = C().katas();
        body.innerHTML = "";
        body.appendChild(el("section", { class: "k-card k-cx-kata-end", "data-ui": "code.kata-end", role: "status" }, [
          el("span", { class: "k-kicker", text: "Kata done" }),
          el("h2", { class: "k-cx-kata-t", text: right + " of " + draw.length + " right · " + mmss(secs) }),
          el("ul", { class: "k-insp-list" }, draw.map(function (x, j) {
            return el("li", {}, [el("span", { text: KOS.codeTopic.KIND_LABEL[x.kind] + " · " + x.ref }), el("strong", { text: results[j] ? "✓ right" : "skipped" })]);
          })),
          el("div", { class: "k-cx-kata-go" }, [
            el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Another kata", onclick: intro }),
            el("button", { type: "button", class: "k-btn", text: "Back to Code", onclick: function () { KOS.show("subject", SID); } })
          ])
        ]));
        announce("Kata done. " + right + " of " + draw.length + " right in " + mmss(secs) + ".");
      }
      show();
    }
    intro();
  }

  /* ======================================================================
     the route: #/code/<page>[/<id>]
     ====================================================================== */
  KOS.views.code = function (main, arg) {
    stopTimers();
    KOS.shell.tree("none");
    arg = arg || { page: "map" };
    main.style.setProperty("--subj-c", "var(--code)");
    var page = arg.page || "map";
    if (page === "task") return pageTask(main, arg);
    if (page === "retrieval") return pageRetrieval(main, arg);
    if (page === "kata") return pageKata(main);
    if (page === "skills") return pageSkills(main, arg);
    if (page === "settings") return pageSettings(main);
    if (page === "track") return pageTrack(main, arg.id);
    if (page === "capstone" && KOS.codeCapstone) return KOS.codeCapstone.page(main, arg.id || "C1");
    if (page === "project" && KOS.codeRider) return KOS.codeRider.page(main, arg.id || "rp-bridge-hello", arg);
    return pageMap(main);
  };
})();
