/* Kurenai OS — modules/creatives.js (KOS.crDesk, KOS.views.creatives)
   Creatives' pages (design turn 31): the desk (31a–31b) on the shared desk skeleton, and its own
   pages under #/creatives/<page>:
     tracks              the four tracks and every unit (released or outlined)
     write[/<draft>]     the Writing Desk (modules/crwrite.js)
     check/<work>        "Good for this unit" (31e): your work beside the expected beginner output
     log[/<work>]        the Practice Log (31j): private, raw, prunable, the promote dialog
     portfolio           the Portfolio (31k): only what you chose to show
     project/<unit>      a unit's project, milestone by milestone
     add/<lesson.study>  bring work in from a free app (a picture, a text or a link)
     settings            your days, minutes and the Exam Season pause
   Every page reads; only the buttons write, through KOS.creatives. The Practice Log is never drawn
   on the desk: one private link opens it (invariant 156).                                       */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var SID = "creatives";
  var DAYN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  function CR() { return KOS.creatives; }
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  function dayLabel(iso) { return new Date(iso + "T12:00:00").toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" }); }
  function dateShort(ts) { return new Date(ts).toLocaleDateString(undefined, { day: "numeric", month: "short" }); }
  function hm(mins) { mins = Math.round(mins || 0); var h = Math.floor(mins / 60), m = mins % 60; return h ? h + " h " + (m < 10 ? "0" : "") + m : m + " m"; }

  /* the space's pictures (art-source/creatives/manifest.json → assets/creatives/img/), drawn only
     once imported and listed in KOS_CR.ART: never a stand-in drawing */
  function art(id, alt, cls) {
    if (((window.KOS_CR || {}).ART || []).indexOf(id) < 0) return null;
    return el("img", { class: cls || "k-cr-art", src: "assets/creatives/img/" + id + ".webp", alt: alt || "", loading: "lazy", decoding: "async" });
  }
  KOS.crArt = art;
  function spotEmpty(id, o) {
    var pic = art(id, "", "k-cr-spot"), node = KOS.ui.emptyState(Object.assign({}, o, pic ? { mark: null } : {}));
    if (pic) node.insertBefore(pic, node.firstChild);
    return node;
  }

  KOS.crPages = [["tracks", "Tracks"], ["write", "Writing"], ["drills", "Drills"], ["refs", "References"], ["portfolio", "Portfolio"]];

  /* a dialog through the one modal route (invariant 49) */
  function dialog(o) {
    var title = el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: o.title });
    var closeBtn = el("button", { type: "button", class: "k-btn", "data-ui": "cr.dialog-close", text: o.closeLabel || "Close" });
    var box = el("div", { class: "k-dialog" + (o.wide ? " k-cr-dialog--wide" : ""), "data-ui": "cr.dialog" }, [
      el("div", { class: "k-dialog-mark", lang: "ja", "aria-hidden": "true", text: o.mark || "創" }), title, o.body,
      el("div", { class: "k-dialog-foot" }, [el("span")].concat(o.foot || []).concat([closeBtn]))
    ]);
    var overlay = el("div", { class: "k-dialog-overlay", onclick: function (e) { if (e.target === overlay) close(); } }, [box]);
    var closed = false;
    function close() { if (closed) return; closed = true; overlay.remove(); if (o.onClose) o.onClose(); }
    overlay.close = close;
    closeBtn.onclick = close;
    KOS.ui.openDialog(overlay, { labelledBy: title, initialFocus: o.focus || closeBtn });
    return { close: close };
  }
  KOS.crDialog = dialog;

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
  function settingsBtn(page) {
    return el("button", { type: "button", class: "k-iconbtn", "data-ui": "cr.settings-open", "aria-label": "Creatives settings", "aria-current": page === "settings" ? "page" : null, text: "⚙",
      onclick: function () { KOS.show("creatives", { page: "settings" }); } });
  }
  function startFocus(ref) { KOS.show("focus", { subject: SID, ref: ref || undefined }); }
  /* a lesson's or a track's mastery: the shared four-check percentage, as every subject's ring */
  function lessonPct(id) { return KOS.hub.leafPercent(SID, id); }
  function trackPct(tid) {
    var ls = CR().lessons(tid);
    return ls.length ? Math.round(ls.reduce(function (a, l) { return a + lessonPct(l.id); }, 0) / ls.length) : null;
  }
  function kindMark(w) { var t = CR().track(w.track); return t ? t.k : "創"; }

  /* ======================================================================
     31a · the desk, on Code's skeleton (26a): the ring, the track bars, the
     Daily Creative and Continue; analytics beside the Portfolio; the path
     ====================================================================== */
  KOS.crDesk = function (main) {
    var st = CR().stats(), first = !CR().started(), tid = CR().currentTrack();
    var mastery = Math.round(CR().lessons().reduce(function (a, l) { return a + lessonPct(l.id); }, 0) / Math.max(1, st.lessons));
    KOS.shell.actions([
      el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "cr.focus", text: "Start focus", onclick: function () { startFocus(); } }),
      settingsBtn()
    ]);
    var hero = el("section", { class: "k-subj-hero k-cr-hero", "data-ui": "study.subject-hero cr.hero", "aria-label": "Creatives" }, [
      el("span", { class: "k-subj-ring", role: "img", "aria-label": mastery + "% mastery", style: "--p: " + mastery + "%" }, [
        el("span", { class: "k-subj-ring-in" }, [el("b", { text: mastery + "%" }), el("small", { text: "mastery" })])
      ]),
      el("div", { class: "k-subj-id" }, [
        el("div", { class: "k-kicker", text: "Subject desk" }),
        el("h1", { class: "k-subj-name", text: "Creatives" }),
        el("div", { class: "k-subj-board" }, [el("span", { text: KOS_DATA.creatives.board })])   // no streak of its own (plan §6)
      ]),
      el("div", { class: "k-subj-papers", "data-ui": "cr.track-bars" }, CR().tracks().map(function (t) {
        var pct = trackPct(t.id);
        return el("div", { class: "k-subj-paper", "data-state": pct == null ? "later" : null }, [
          el("div", { class: "k-subj-paper-top" }, [el("b", { text: t.name }), el("span", { class: "k-subj-paper-note" }),
            el("span", { class: "k-mono", text: pct == null ? "later" : pct + "%" })]),
          el("span", { class: "k-bar k-bar--6", role: "img", "aria-label": t.name + ": " + (pct == null ? "not released yet" : pct + "%"), style: "--p: " + (pct || 0) + "%" }, [el("i")])
        ]);
      })),
      /* the track in view as a path across the hero, as Code's stage path */
      el("div", { class: "k-cr-hero-path" }, [heroPath(tid)])
    ]);
    var side = el("div", { class: "k-subj-side" }, first ? [welcomeCard()] : [dailyCard(CR().planDay()), continueCard()].filter(Boolean));
    main.appendChild(el("div", { class: "k-subj-row", "data-ui": "study.desk-top" }, [hero, side]));

    var analytics = el("section", { class: "k-card k-sa", "data-ui": "study.analytics cr.analytics", "aria-label": "Subject analytics" }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: "Subject analytics" }),
        el("span", { class: "k-card-meta", text: "this subject only" }),
        el("details", { class: "k-sa-help" }, [
          el("summary", { class: "k-link", text: "What do these mean?" }),
          el("div", { class: "k-sa-help-body" }, [
            el("p", { text: "Mastery averages each lesson's four evidence checks: notes read, its studies saved, their check passed and a theory card held. Reading alone never completes a lesson." })
          ])
        ])
      ]),
      el("div", { class: "k-sa-grid", "data-ui": "study.analytics-grid" }, [
        statTile({ k: "Mastery", v: mastery + "%", pct: mastery, c: "var(--subj-c)" }),
        statTile({ k: "Lessons", v: st.done + " / " + st.lessons, pct: Math.round(100 * st.done / Math.max(1, st.lessons)), c: "var(--green)" }),
        statTile({ k: "Projects", v: st.projectsDone + " / " + st.projects, empty: !st.projectsDone, pct: st.projectsDone ? Math.round(100 * st.projectsDone / st.projects) : null, c: "var(--green)" }),
        statTile({ k: "Cards due", v: String(st.due), empty: first }),
        statTile({ k: "Studies saved", v: String(st.studies), empty: !st.studies }),
        statTile({ k: "Checks passed", v: String(st.checks), empty: !st.checks }),
        statTile({ k: "Portfolio", v: String(st.portfolio), empty: !st.portfolio }),
        statTile({ k: "This week", v: hm(st.week), empty: !st.week })
      ])
    ]);
    main.appendChild(el("div", { class: "k-subj-row" }, [analytics, portfolioCard()]));
    main.appendChild(pathSection(tid));
  };

  /* the units of a track in its stages, one stop each, a line joining them */
  function heroPath(tid) {
    var T = CR().track(tid), place = CR().trackPlace(tid);
    var row = el("div", { class: "k-cr-hpath", "data-ui": "cr.hero-path", role: "group", "aria-label": T.name + " path", style: "--n: " + T.units.length });
    T.stages.forEach(function (sg) {
      var uids = T.units.slice(sg[1] - 1, sg[2]);
      row.appendChild(el("div", { class: "k-cr-hstage", style: "--span: " + uids.length }, [
        el("div", { class: "k-cr-hstage-h" }, [el("b", { text: sg[0] })]),
        el("div", { class: "k-cr-hstage-m" }, uids.map(function (uid) {
          var u = CR().unit(uid), us = CR().unitState(uid), now = place && place.unit === uid && !place.finished;
          var state = us.state === "done" ? "done" : now ? "current" : us.state === "outline" ? "later" : null;
          return el("span", { class: "k-cr-hnode", "data-state": uid === T.units[T.units.length - 1] ? "last" : null }, [
            el("button", { type: "button", class: "k-cr-hsq", "data-state": state, "data-ui": "cr.path-unit", disabled: state === "later" ? "" : null,
              "aria-label": "Unit " + u.n + " " + u.name + ": " + (state === "later" ? "coming later" : us.done + " of " + us.total + " done"), title: u.name,
              text: state === "done" ? "✓" : T.letter + u.n, onclick: function () { openUnit(uid); } })
          ]);
        }))
      ]));
    });
    return row;
  }

  /* the side column's card: one study (or a project) and the due cards */
  function dailyCard(p) {
    var box = el("section", { class: "k-card k-cr-daily", "data-ui": "cr.daily", "data-state": p.state, "aria-label": "Daily Creative" });
    var head = el("div", { class: "k-cr-daily-top" }, [el("span", { class: "k-kicker", text: "Daily Creative · today" })]);
    var t = null, why = null, go = null, alt = null;
    if (p.state === "paused") {
      t = "Paused for Exam Season";
      why = p.back ? "Back after " + dayLabel(p.back) + "." : null;
      if (p.cards) go = ["Cards · " + p.cardMin + " min", function () { KOS.show("due"); }];
    } else if (p.state === "rest") {
      t = "Next on " + ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][p.nextDay];
    } else if (p.state === "clear") {
      t = "Nothing waiting today";
    } else if (p.study) {
      t = p.study.lesson + "·" + p.study.study + " " + p.study.t;
      why = p.study.saved ? "Saved; its check is still to do." : p.cards ? "Then " + p.cards + (p.cards === 1 ? " card." : " cards.") : null;
      go = ["▶ Start", function () {
        var w = CR().studyWorks(p.study.lesson, p.study.study)[0];
        if (w) KOS.show("creatives", { page: "check", id: w.id }); else KOS.crStartStudy(p.study.lesson, p.study.study);
      }];
    } else if (p.project) {
      t = p.project.project.t;
      go = ["▶ Open", function () { KOS.show("creatives", { page: "project", id: CR().lesson(p.project.project.after).unit }); }];
    } else {
      t = p.cards + (p.cards === 1 ? " card due" : " cards due");
      go = ["▶ Start", function () { KOS.show("due"); }];
    }
    /* the phone (31s): reviews here, making on the iPad or a computer. A study made elsewhere puts
       the cards first and the lesson second; the Writing Desk works on a phone, so it keeps Start. */
    var phone = p.study && p.study.tool !== "desk" && p.state === "today" ? el("div", { class: "k-cr-daily-phone", "data-ui": "cr.daily-phone" }, [
      el("div", { class: "k-cr-daily-go" }, [
        p.cards ? el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "cr.daily-cards", text: "▶ Cards · " + p.cardMin + " min", onclick: function () { KOS.show("due"); } }) : null,
        el("button", { type: "button", class: p.cards ? "k-btn" : "k-btn k-btn--primary", "data-ui": "cr.daily-lesson", text: "Open the lesson", onclick: function () { KOS.show("ref", { subject: SID, ref: p.study.lesson }); } })
      ].filter(Boolean)),
      el("p", { class: "k-cr-daily-why", text: "The study is best on the iPad or a computer." + (p.cards ? " Cards work here." : "") })
    ]) : null;
    if (phone) box.setAttribute("data-phone", "split");
    box.appendChild(head);
    if (p.state === "rest" || p.state === "clear") { var spot = art("cr.spot.rest", "", "k-cr-spot"); if (spot) box.appendChild(spot); }
    box.appendChild(el("h2", { class: "k-cr-daily-t", text: t }));
    if (why) box.appendChild(el("p", { class: "k-cr-daily-why", text: why }));
    if (phone) box.appendChild(phone);
    if (go) box.appendChild(el("div", { class: "k-cr-daily-go k-cr-daily-main" }, [
      el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "cr.daily-start", text: go[0], onclick: go[1] }),
      p.total && p.state === "today" ? el("span", { class: "k-muted", text: "about " + p.total + " min" }) : null
    ].filter(Boolean)));
    return box;
  }
  function welcomeCard() {
    var L = CR().lessons()[0];
    return el("section", { class: "k-card k-cr-daily", "data-ui": "cr.welcome", "aria-label": "Start here" }, [
      el("span", { class: "k-kicker", text: "Start here" }),
      el("h2", { class: "k-cr-daily-t", text: "One small skill a lesson, about 20 minutes." }),
      L ? el("div", { class: "k-cr-daily-go" }, [el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "cr.begin", text: "Start " + L.id,
        onclick: function () { KOS.show("ref", { subject: SID, ref: L.id }); } })]) : null
    ].filter(Boolean));
  }
  function continueCard() {
    var ns = CR().nextStudy(CR().currentTrack());
    if (!ns) return null;
    var pct = lessonPct(ns.lesson.id);
    return el("button", { type: "button", class: "k-subj-next", "data-ui": "study.continue cr.continue", onclick: function () { KOS.show("ref", { subject: SID, ref: ns.lesson.id }); } }, [
      el("span", { class: "k-subj-next-txt" }, [
        el("span", { class: "k-kicker", text: "Continue" }),
        el("span", { class: "k-subj-next-t" }, [el("span", { class: "k-mono", text: ns.lesson.id }), ns.lesson.title]),
        el("span", { class: "k-bar", role: "img", "aria-label": pct + "% from evidence", style: "--p: " + pct + "%; --bar-c: var(--subj-c)" }, [el("i")])
      ]),
      el("span", { class: "k-subj-next-go", "data-state": "lit", "aria-hidden": "true", text: "→" })
    ]);
  }
  /* beside analytics, as Code's Retrieval due: what you chose to show, and the private log's link */
  function portfolioCard() {
    var list = CR().portfolio().slice(0, 4);
    return el("section", { class: "k-card k-cr-port", "data-ui": "cr.portfolio-side", "aria-label": "Portfolio" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Portfolio" }),
        el("button", { type: "button", class: "k-link", text: "Open →", onclick: function () { KOS.show("creatives", { page: "portfolio" }); } })]),
      list.length ? el("div", { class: "k-cr-portlist" }, list.map(function (w) {
        return el("button", { type: "button", class: "k-day-row k-cr-portrow", onclick: function () { openWork(w.id); } }, [
          el("span", { class: "k-cr-kind", lang: "ja", "aria-hidden": "true", text: kindMark(w) }),
          el("span", { class: "k-day-txt" }, [el("span", { class: "k-day-title", text: w.title }), el("span", { class: "k-day-sub", text: (CR().track(w.track) || {}).name + " · " + dateShort(w.portfolio) })])
        ]);
      })) : KOS.ui.emptyState({ compact: true, body: "Nothing promoted yet." }),
      el("button", { type: "button", class: "k-btn k-cr-loglink", "data-ui": "cr.log-link", text: "Practice Log", onclick: function () { KOS.show("creatives", { page: "log" }); } })
    ]);
  }
  /* the path: the track in view (‹ › moves between them), its unit cards as Code's */
  function pathSection(tid) {
    var T = CR().track(tid), ts = CR().tracks(), ti = ts.indexOf(T), place = CR().trackPlace(tid);
    function go(d) { var u = CR().ui(); u.track = ts[(ti + d + ts.length) % ts.length].id; KOS.store.save(); KOS.rerender(); announce(ts[(ti + d + ts.length) % ts.length].name + " path."); }
    var cards = el("div", { class: "k-units k-cr-units", "data-ui": "study.units cr.units" }, T.units.map(function (uid) { return unitCard(uid, place); }));
    return el("section", { class: "k-subj-units k-cr-path", "aria-labelledby": "k-cr-path-h" }, [
      el("div", { class: "k-sectionhead" }, [
        el("h2", { id: "k-cr-path-h", text: T.name + " path" }),
        el("span", { class: "k-sectionhead-sub", text: T.units.length + " units · " + T.stages.map(function (s) { return s[0]; }).join(" · ") }),
        el("div", { class: "k-sectionhead-actions" }, [
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "cr.track-prev", "aria-label": "Previous track", text: "‹", onclick: function () { go(-1); } }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "cr.track-next", "aria-label": "Next track", text: "›", onclick: function () { go(1); } })
        ])
      ]),
      KOS.ui.scroller(cards, { label: "Units", prevLabel: "Scroll to earlier units", nextLabel: "Scroll to later units" })
    ]);
  }
  function openUnit(uid) {
    var us = CR().unitState(uid), u = CR().unit(uid);
    if (us.state === "outline") return;
    KOS.show("ref", { subject: SID, ref: (us.next || CR().lesson(u.lessons[0])).id });
  }
  function unitCard(uid, place) {
    var u = CR().unit(uid), us = CR().unitState(uid), now = place && place.unit === uid && !place.finished, T = CR().track(u.track);
    var later = us.state === "outline";
    var card = el("button", { type: "button", class: "k-unit k-cr-unit", "data-ui": "study.unit cr.unit", "data-state": later ? "later" : now ? "current" : null,
      "aria-label": T.name + " unit " + u.n + ", " + u.name + ": " + (later ? "coming later" : us.done + " of " + us.total + " done"),
      disabled: later ? "" : null, onclick: function () { openUnit(uid); } }, [
      el("span", { class: "k-unit-ref", text: T.letter + u.n }),
      el("span", { class: "k-unit-title", text: u.name }),
      el("span", { class: "k-unit-segs", "aria-hidden": "true" }, (later ? [null] : u.lessons).map(function (id) {
        var p = id ? KOS.store.peekProgress(SID, id) : null;
        return el("span", { "data-state": p && p.status === "done" ? "done" : p && p.status && p.status !== "none" ? "started" : null });
      })),
      el("span", { class: "k-unit-foot", "data-ui": "study.unit-foot" }, later ? ["Coming later"]
        : [el("b", { text: us.done + " / " + us.total }), now && us.next ? " · " + us.next.id + " now" : " done"])
    ]);
    if (now) KOS.ui.state(card, "current", true);
    return card;
  }

  /* ======================================================================
     the pages
     ====================================================================== */
  function spaceHead(main, page, o) {
    KOS.shell.actions([el("button", { type: "button", class: "k-btn", "data-ui": "cr.focus", text: "Start focus", onclick: function () { startFocus(); } }), settingsBtn(page)]);
    main.appendChild(KOS.ui.pageHeader({ kicker: "Creatives", title: o.title, sub: o.sub }));
  }
  KOS.views.creatives = function (main, arg) {
    arg = arg || {};
    KOS.shell.tree("none");
    main.style.setProperty("--subj-c", "var(--cr)");
    var page = arg.page || "tracks";
    if (page === "write") { spaceHead(main, "write", { title: "Writing Desk", sub: null }); return arg.id ? KOS.crWrite.desk(main, arg.id) : KOS.crWrite.list(main); }
    if (page === "drills") { var dt = KOS.crDrills.type(String(arg.id || "").split("@")[0]); spaceHead(main, "drills", { title: dt ? dt.t : "Drills", sub: null }); return KOS.crDrills.page(main, arg.id); }
    if (page === "sketch") { var sk = String(arg.id || "").split("."), skl = CR().study(sk.slice(0, 2).join("."), sk[2]); spaceHead(main, "sketch", { title: skl ? skl.t : "Sketchbook", sub: null }); return KOS.crSketch.page(main, arg.id); }
    if (page === "refs") { spaceHead(main, "refs", { title: "References", sub: null }); return KOS.crRefsPage(main); }
    if (page === "check") { spaceHead(main, "check", { title: "The check", sub: null }); return checkPage(main, arg.id); }
    if (page === "log") { spaceHead(main, "log", { title: "Practice Log", sub: "Only you see this" }); return logPage(main, arg.id); }
    if (page === "portfolio") { spaceHead(main, "portfolio", { title: "Portfolio", sub: null }); return portfolioPage(main); }
    if (page === "project") { spaceHead(main, "project", { title: "Project", sub: null }); main.appendChild(projectView(arg.id)); return; }
    if (page === "add") { spaceHead(main, "add", { title: "Add your work", sub: null }); return addPage(main, arg.id); }
    if (page === "settings") { spaceHead(main, "settings", { title: "Creatives settings" }); return settingsPage(main); }
    spaceHead(main, "tracks", { title: "Tracks", sub: null });
    tracksPage(main, arg.id);
  };

  /* ---------------- tracks ---------------- */
  function tracksPage(main, focus) {
    main.appendChild(el("div", { class: "k-cr-trackgrid", "data-ui": "cr.tracks" }, CR().tracks().map(function (t) {
      var pct = trackPct(t.id);
      return el("section", { class: "k-card k-cr-trackcard", "data-ui": "cr.track", id: "cr-track-" + t.id, "data-state": focus === t.id ? "focus" : null, "aria-label": t.name }, [
        el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: t.name }), el("span", { class: "k-card-meta", text: t.units.length + " units" }),
          el("span", { class: "k-mono k-cr-trackpct", text: pct == null ? "later" : pct + "%" })]),
        el("span", { class: "k-bar k-bar--6", role: "img", "aria-label": t.name + ": " + (pct == null ? "not released yet" : pct + "%"), style: "--p: " + (pct || 0) + "%" }, [el("i")]),
        el("ol", { class: "k-cr-unitlist" }, t.units.map(function (uid) {
          var u = CR().unit(uid), us = CR().unitState(uid);
          return el("li", { "data-state": us.state }, [
            el("button", { type: "button", class: "k-cr-unitrow", disabled: us.state === "outline" ? "" : null, onclick: function () { openUnit(uid); } }, [
              el("span", { class: "k-mono k-muted", text: t.letter + u.n }),
              el("span", { class: "k-cr-unitrow-t", text: u.name }),
              el("span", { class: "k-mono k-muted", text: us.state === "outline" ? "later" : us.done + " / " + us.total })
            ])
          ]);
        }))
      ]);
    })));
  }

  /* ---------------- the check (31e) ---------------- */
  function checkPage(main, wid) {
    var w = CR().work(wid), L = w && w.lesson ? CR().lesson(w.lesson) : null, s = L ? CR().study(L.id, w.study) : null;
    if (!w || !L || !s) { main.appendChild(KOS.ui.emptyState({ mark: "創", title: "Nothing to check here", body: "A check belongs to a saved study." })); return; }
    var u = CR().unit(L.unit), T = CR().track(u.track);
    var mine = el("blockquote", { class: "k-cr-mine-text", "data-ui": "cr.mine" }, [el("p", { class: "k-muted", text: "Loading your work…" })]);
    CR().files.get(wid, function (err, f) {
      if (!mine.isConnected && !document.contains(mine)) return;
      mine.innerHTML = "";
      if (f && f.dataUrl) mine.appendChild(el("img", { class: "k-cr-mine-img", src: f.dataUrl, alt: w.title }));
      else if (f && f.text) f.text.split(/\n{2,}/).forEach(function (p) { mine.appendChild(el("p", { text: p })); });
      else if (w.url) mine.appendChild(el("p", {}, [el("a", { class: "k-link", href: w.url, target: "_blank", rel: "noopener", text: w.url })]));
      else mine.appendChild(el("p", { class: "k-muted", text: "The file is on another device." }));
    });
    var beginner = null;
    (CR().pagesOf(L.id) || []).forEach(function (pg) { pg.blocks.forEach(function (b) { if (b.beginner && !beginner) beginner = b.beginner; }); });
    var answers = L.check.rows.map(function () { return null; });
    var note = el("textarea", { class: "k-input k-cr-checknote", rows: "2", "aria-label": "One sentence about it (optional)", placeholder: "A note (optional)" });
    var saveBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "cr.check-save", text: "Save check", disabled: "" });
    var out = el("div", { class: "k-cr-checkout", "aria-live": "polite" });
    var rows = L.check.rows.map(function (q, i) {
      var yes = el("button", { type: "button", class: "k-cr-choice", "data-ui": "cr.choice", "aria-pressed": "false", text: "Yes, mostly" });
      var no = el("button", { type: "button", class: "k-cr-choice", "data-ui": "cr.choice", "aria-pressed": "false", text: "Not yet" });
      function pick(v) { answers[i] = v; yes.setAttribute("aria-pressed", String(v === true)); no.setAttribute("aria-pressed", String(v === false)); saveBtn.disabled = answers.some(function (a) { return a === null; }); }
      yes.onclick = function () { pick(true); }; no.onclick = function () { pick(false); };
      return el("div", { class: "k-cr-checkrow", role: "group", "aria-label": q }, [el("b", { text: q }), el("div", { class: "k-cr-choices" }, [yes, no])]);
    });
    saveBtn.onclick = function () {
      var r = CR().setCheck(wid, { rows: answers, note: note.value });
      out.innerHTML = "";
      if (r.pass) {
        var pay = r.paid ? KOS.governor && KOS.governor.lastAward ? KOS.governor.lastAward() : null : null;
        out.appendChild(el("section", { class: "k-cr-band", "data-tone": "done", "data-ui": "cr.check-pass" }, [
          el("b", { text: "✓ Passed" }),
          el("p", { class: "k-muted", text: r.paid ? (pay && pay.xp ? "+" + pay.xp + " XP · +" + pay.gold + " gold" : "Paid") : "No reward · paid on this study's first pass" }),
          el("div", { class: "k-cr-daily-go" }, [
            el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Back to the lesson", onclick: function () { KOS.show("ref", { subject: SID, ref: L.id }); } }),
            el("button", { type: "button", class: "k-btn", text: "Promote…", onclick: function () { promoteDialog(wid); } })
          ])
        ]));
        announce("Check saved: a pass.");
      } else {
        out.appendChild(el("section", { class: "k-cr-band", "data-tone": "next", "data-ui": "cr.check-notyet" }, [
          el("b", { text: "Not yet" }),
          el("p", { class: "k-muted", text: "Saved. One more short rep usually does it." }),
          el("div", { class: "k-cr-daily-go" }, [
            el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "One more rep", onclick: function () { KOS.crStartStudy(L.id, s.id); } }),
            el("button", { type: "button", class: "k-btn", text: "Back to the lesson", onclick: function () { KOS.show("ref", { subject: SID, ref: L.id }); } })
          ])
        ]));
        announce("Check saved: not yet.");
      }
    };
    main.appendChild(el("div", { class: "k-cr-check", "data-ui": "cr.check" }, [
      el("div", { class: "k-cr-checkcol" }, [
        el("section", { class: "k-card k-cr-checkcard", "aria-label": "Your work" }, [el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: w.title }), el("span", { class: "k-card-meta", text: L.id + "·" + s.id })]), mine,
          w.critique ? el("section", { class: "k-cr-kept", "data-ui": "cr.critique-kept" }, [el("span", { class: "k-kicker", text: "✦ Kurenai's critique" }), critiqueView(w.critique)]) : null,
          w.critique ? null : el("div", { class: "k-cr-checkcard-foot" }, [critiqueBtn(wid, { sm: true })])].filter(Boolean)),
        beginner ? el("section", { class: "k-card k-cr-checkcard", "data-ui": "cr.beginner", "aria-label": "Expected beginner output" }, [
          el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Expected beginner output" })]),
          el("blockquote", { class: "k-cr-beginner-text" }, beginner.text.split("\n").map(function (p) { return el("p", { text: p }); })), el("p", { class: "k-cr-beginner-note", text: beginner.note })]) : null
      ].filter(Boolean)),
      el("div", { class: "k-cr-checkcol" }, [
        el("section", { class: "k-card k-cr-calib", "data-ui": "cr.calibration", "aria-label": "Good for this unit" }, [
          el("span", { class: "k-kicker", text: "Good for " + T.name + " " + u.n }),
          el("h2", { class: "k-cr-calib-skill", text: L.check.skill }),
          el("p", { class: "k-cr-calib-text", text: L.check.good }),
          el("div", { class: "k-cr-ignore" }, [el("span", { class: "k-kicker", text: "Ignore for now" }), el("ul", {}, L.check.ignore.map(function (x) { return el("li", {}, [el("s", { text: x[0] })]); }))])
        ]),
        el("section", { class: "k-card k-cr-checkform", "data-ui": "cr.check-form", "aria-label": "The check" }, rows.concat([note, el("div", { class: "k-cr-daily-go" }, [saveBtn]), out]))
      ])
    ]));
  }

  /* ---------------- Ask Kurenai for a critique (31r, invariant 155) ----------------
     "What is sent" prints exactly KOS.creatives.critiqueRequest's sections (Cancel first and
     focused; Send is never the Enter default); one press sends one request. The reply is what
     worked and ONE thing to try, judged against this unit's bar; a reply that strays is refused.
     "Try it on the next rep" pins the tip to the study; "Keep with this rep" keeps it on the work.
     Nothing pays, rates or ticks. */
  var EMBLEM = "assets/assistant/logo/whispering-bloom-emblem-production.png";
  function online() { return typeof navigator === "undefined" || navigator.onLine !== false; }
  function geminiModel() {
    var r = KOS.ai.config && KOS.ai.config().routing && KOS.ai.config().routing.tutor;
    return r && r.provider === "gemini" ? r.model : KOS.ai.DEFAULT_MODEL.gemini;
  }
  function critiqueBtn(wid, o) {
    if (!CR().critiqueOf(wid)) return null;
    var off = !online();
    return el("button", { type: "button", class: "k-btn" + (o && o.sm ? " k-btn--sm" : ""), "data-ui": "cr.critique-open", disabled: off ? "" : null,
      text: off ? "Ask Kurenai · needs a connection" : "✦ Ask Kurenai for a critique", onclick: function () { if (o && o.before) o.before(); critique(wid); } });
  }
  function critiqueView(c) {
    return el("div", { class: "k-cr-crit", "data-ui": "cr.critique" }, [
      el("section", {}, [el("span", { class: "k-kicker", text: "What worked" }), el("p", { text: c.worked })]),
      c.next ? el("section", {}, [el("span", { class: "k-kicker", text: "One thing to try on the next rep" }), el("p", { text: c.next })]) : null
    ].filter(Boolean));
  }
  function critique(wid) {
    var c = CR().critiqueOf(wid); if (!c) return;
    var title = el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Ask Kurenai for a critique" });
    var body = el("div", { class: "k-cr-sent" }, [el("p", { class: "k-muted", text: "Loading your piece…" })]);
    var foot = el("div", { class: "k-dialog-foot" });
    var box = el("div", { class: "k-dialog k-cr-dialog--wide", "data-ui": "cr.critique-dialog" }, [
      el("div", { class: "k-dialog-mark", lang: "ja", "aria-hidden": "true", text: "評" }), title, body, foot]);
    var overlay = el("div", { class: "k-dialog-overlay" }, [box]);
    var closed = false, req = null, rq = null;
    function close() { if (closed) return; closed = true; if (req && KOS.ai && KOS.ai.cancel) KOS.ai.cancel(req); req = null; overlay.remove(); }
    overlay.close = close;
    function btn(t, cls, fn, hook) { return el("button", { type: "button", class: "k-btn" + (cls ? " " + cls : ""), "data-ui": hook || null, "data-intent": /primary/.test(cls || "") ? "primary" : null, text: t, onclick: fn }); }
    function setFoot(list) { foot.innerHTML = ""; foot.appendChild(el("span")); list.forEach(function (b) { if (b) foot.appendChild(b); }); }
    var cancel = btn("Cancel", "", close, "cr.critique-cancel");
    setFoot([cancel]);
    KOS.ui.openDialog(overlay, { labelledBy: title, initialFocus: cancel });
    CR().files.get(wid, function (err, f) {
      if (closed) return;
      rq = CR().critiqueRequest(wid, f);
      if (!rq) { body.innerHTML = ""; body.appendChild(el("p", { class: "k-muted", text: "This piece's text or picture is on another device, so there is nothing to send from here." })); return; }
      whatIsSent();
    });
    function whatIsSent() {
      body.innerHTML = "";
      title.textContent = "Ask Kurenai for a critique";
      body.appendChild(el("p", { text: "One request, metered like any Assistant message. This is all of it:" }));
      var piece = rq.imageUrl ? el("figure", { class: "k-cr-sent-piece" }, [el("img", { src: rq.imageUrl, alt: "The picture that is sent" })])
        : el("blockquote", { class: "k-cr-sent-piece k-cr-mine-text" }, rq.text.split(/\n{2,}/).map(function (p) { return el("p", { text: p }); }));
      body.appendChild(el("div", { class: "k-cr-sent-grid" }, [piece,
        el("dl", { class: "k-cr-sent-list", "data-ui": "cr.what-is-sent" }, rq.sections.map(function (x) { return el("div", {}, [el("dt", { text: x.h }), el("dd", { text: x.text })]); }))]));
      body.appendChild(el("p", { class: "k-muted", "data-ui": "cr.not-sent", text: "Not sent: " + rq.notSent }));
      var status = el("p", { class: "k-muted", "aria-live": "polite" });
      body.appendChild(status);
      var send = btn("Send", "k-btn--primary", function () { go(send, status); }, "cr.critique-send");
      setFoot([cancel, send]);
      cancel.focus();
    }
    function go(send, status) {
      if (!online()) { status.textContent = "Ask Kurenai needs a connection. Nothing is queued."; return; }
      if (!KOS.ai || !KOS.ai.chat) { status.textContent = "Set up Kurenai in the Assistant's settings to ask for a critique."; return; }
      send.disabled = true; status.textContent = "Kurenai is looking…"; announce("Sending one request.");
      var request = { category: "tutor", system: rq.system, temperature: 0.4, maxTokens: 1200, busyRetries: 3,
        onBusy: function (n, of) { status.textContent = "Kurenai is busy right now — trying again (" + n + " of " + of + ")…"; },
        messages: [rq.image ? { role: "user", content: rq.prompt, images: [{ mime: rq.mime, data: rq.image }] } : { role: "user", content: rq.prompt }] };
      var cb = function (err, res) {
        if (closed || !req) return;
        req = null;
        if (err || !res || !res.text) { send.disabled = false; status.textContent = "Kurenai couldn't answer" + (err && err.message ? " — " + err.message : "") + ". Nothing was saved."; return; }
        var json = KOS.inkAI && KOS.inkAI.readJson ? KOS.inkAI.readJson(res.text) : null;
        if (!json || !json.worked) { send.disabled = false; status.textContent = "Kurenai's reply couldn't be read. Send again?"; return; }
        reply({ worked: String(json.worked).trim(), next: String(json.next || "").trim() });
      };
      /* a picture needs a provider that reads images (Gemini); text goes by the tutor route */
      req = rq.image ? (KOS.ai.chatWith("gemini", geminiModel(), request, cb) || true) : (KOS.ai.chat("tutor", request, cb) || true);
    }
    function reply(r) {
      body.innerHTML = "";
      if (CR().stray(r, c.L.id)) {
        body.appendChild(el("p", { role: "alert", "data-ui": "cr.critique-stray", text: "Kurenai couldn't keep to this unit's bar. Try again?" }));
        setFoot([btn("Close", "", close), btn("Try again", "k-btn--primary", whatIsSent)]);
        announce("Kurenai couldn't keep to this unit's bar.");
        return;
      }
      title.textContent = "Kurenai, on " + c.L.check.skill.charAt(0).toLowerCase() + c.L.check.skill.slice(1);
      body.appendChild(el("div", { class: "k-cr-crit-head" }, [el("img", { class: "k-cr-crit-mark", src: EMBLEM, alt: "" }),
        el("span", { class: "k-muted", text: c.w.title + " · " + c.t.name + " " + c.u.n + "'s bar only" })]));
      body.appendChild(critiqueView(r));
      var note = el("p", { class: "k-muted", "aria-live": "polite", text: "A suggestion, not a mark. Your check stays yours." });
      body.appendChild(note);
      var pin = btn("Try it on the next rep", "", function () { CR().pinTip(c.L.id, c.s.id, r.next || r.worked); pin.disabled = true; note.textContent = "Pinned to " + c.L.id + "·" + c.s.id + "'s next rep."; },"cr.critique-pin");
      var keep = btn("Keep with this rep", "k-btn--primary", function () { CR().keepCritique(wid, r); keep.disabled = true; note.textContent = "Kept with this piece."; }, "cr.critique-keep");
      if (!r.next) pin = null;
      setFoot([btn("Close", "", function () { close(); KOS.rerender(); }), pin, keep]);
      announce("Kurenai replied.");
    }
  }
  KOS.crCritique = critique;
  KOS.crOpenWork = function (wid) { openWork(wid); };

  /* ---------------- the Practice Log (31j) and the Portfolio (31k) ---------------- */
  function workRow(w, o) {
    var L = w.lesson ? CR().lesson(w.lesson) : null;
    return el("article", { class: "k-cr-work", "data-ui": "cr.work", "data-state": o && o.open ? "open" : null }, [
      el("span", { class: "k-cr-kind", lang: "ja", "aria-hidden": "true", text: kindMark(w) }),
      el("div", { class: "k-cr-work-t" }, [el("b", { text: w.title }),
        el("small", { class: "k-muted", text: [(CR().track(w.track) || {}).name, L ? L.id + "·" + w.study : w.unit ? "project" : null, w.words ? w.words + " words" : null, dateShort(w.at)].filter(Boolean).join(" · ") })]),
      w.check ? el("span", { class: "k-cr-done", "data-tone": w.check.pass ? "done" : "now", text: w.check.pass ? "✓ check passed" : "not yet" }) : null,
      w.portfolio ? el("span", { class: "k-chip k-cr-chip", text: "In Portfolio" }) : null,
      el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "cr.work-open", text: "Open", onclick: function () { openWork(w.id); } })
    ].filter(Boolean));
  }
  function openWork(wid) {
    var w = CR().work(wid); if (!w) return;
    var body = el("div", { class: "k-cr-workview" }, [el("p", { class: "k-muted", text: "Loading…" })]);
    CR().files.get(wid, function (err, f) {
      body.innerHTML = "";
      if (f && f.dataUrl) body.appendChild(el("img", { class: "k-cr-mine-img", src: f.dataUrl, alt: w.title }));
      else if (f && f.text) body.appendChild(el("blockquote", { class: "k-cr-mine-text" }, f.text.split(/\n{2,}/).map(function (p) { return el("p", { text: p }); })));
      else if (w.url) body.appendChild(el("p", {}, [el("a", { class: "k-link", href: w.url, target: "_blank", rel: "noopener", text: w.url })]));
      else body.appendChild(el("p", { class: "k-muted", text: "The file is on another device; the record is here." }));
      if (w.check && w.check.note) body.appendChild(el("p", { class: "k-muted", text: "Your note: " + w.check.note }));
      if (w.critique) body.appendChild(el("section", { class: "k-cr-kept", "data-ui": "cr.critique-kept" }, [el("span", { class: "k-kicker", text: "✦ Kurenai's critique · " + dateShort(w.critique.at) }), critiqueView(w.critique)]));
    });
    var foot = [
      critiqueBtn(wid, { before: function () { d.close(); } }),
      w.lesson && w.study ? el("button", { type: "button", class: "k-btn", text: "Check", onclick: function () { d.close(); KOS.show("creatives", { page: "check", id: wid }); } }) : null,
      el("button", { type: "button", class: "k-btn", "data-ui": "cr.promote", text: w.portfolio ? "Take out of Portfolio" : "Promote…", onclick: function () { d.close(); if (w.portfolio) { CR().promote(wid, false); KOS.rerender(); } else promoteDialog(wid); } }),
      el("button", { type: "button", class: "k-btn k-btn--danger", "data-intent": "danger", "data-ui": "cr.work-delete", text: "Delete", onclick: function () {
        d.close();
        KOS.ui.confirm({ title: "Delete this from the Practice Log?", body: "The record and its file go. Nothing else changes, and nothing it paid is taken back.", danger: true }, function () { CR().removeWork(wid); KOS.rerender(); announce("Deleted."); });
      } })
    ].filter(Boolean);
    var d = dialog({ title: w.title, body: body, foot: foot, wide: true });
  }
  function promoteDialog(wid) {
    var w = CR().work(wid); if (!w) return;
    var title = el("input", { class: "k-input", "aria-label": "Title in the Portfolio", value: w.title });
    var made = el("input", { class: "k-input", "aria-label": "Made from (optional)", placeholder: "Made from: the show, book or VN it's for (optional)", value: w.madeFrom || "" });
    var yes = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "cr.promote-yes", text: "Promote" });
    var d = dialog({ title: "Promote to your Portfolio", mark: "選", body: el("div", { class: "k-cr-form" }, [
      
      el("label", { class: "k-cr-field" }, [el("span", { text: "Title" }), title]), el("label", { class: "k-cr-field" }, [el("span", { text: "Made from" }), made])
    ]), foot: [yes], closeLabel: "Cancel" });
    yes.onclick = function () { CR().editWork(wid, { title: title.value.trim() || w.title, madeFrom: made.value.trim() || null }); CR().promote(wid, true); d.close(); KOS.rerender(); announce("Promoted to your Portfolio."); };
  }
  function logPage(main, wid) {
    var all = CR().works();
    if (!all.length) { main.appendChild(spotEmpty("cr.spot.log", { mark: "◔", title: "Nothing here yet", body: "Every study you save lands here first, raw and private. Delete anything, any time." })); return; }
    main.appendChild(el("section", { class: "k-card k-cr-loglist", "data-ui": "cr.log", "aria-label": "Practice Log" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: all.length + (all.length === 1 ? " piece" : " pieces") }), el("span", { class: "k-card-meta", text: "newest first · prunable" })])
    ].concat(all.map(function (w) { return workRow(w, { open: w.id === wid }); }))));
    if (wid && CR().work(wid)) setTimeout(function () { openWork(wid); }, 0);
  }
  function portfolioPage(main) {
    var list = CR().portfolio();
    if (!list.length) { main.appendChild(spotEmpty("cr.spot.portfolio", { mark: "選", title: "Nothing promoted yet", body: "That's normal. When a piece makes you smile, open it in the Practice Log and choose “Promote”.",
      action: el("button", { type: "button", class: "k-btn", text: "Open the Practice Log", onclick: function () { KOS.show("creatives", { page: "log" }); } }) })); return; }
    main.appendChild(el("div", { class: "k-cr-portgrid", "data-ui": "cr.portfolio" }, list.map(function (w) {
      var thumb = el("div", { class: "k-cr-thumb", "aria-hidden": "true" }, [el("span", { lang: "ja", text: kindMark(w) })]);
      CR().files.get(w.id, function (err, f) {
        if (!f) return;
        thumb.innerHTML = "";
        if (f.dataUrl) thumb.appendChild(el("img", { src: f.dataUrl, alt: "" }));
        else if (f.text) thumb.appendChild(el("p", { class: "k-cr-thumb-text", text: f.text.slice(0, 220) }));
      });
      return el("button", { type: "button", class: "k-card k-cr-piece", "data-ui": "cr.piece", onclick: function () { openWork(w.id); } }, [thumb,
        el("b", { text: w.title }), el("small", { class: "k-muted", text: [(CR().track(w.track) || {}).name, w.madeFrom ? "from " + w.madeFrom : null, dateShort(w.portfolio)].filter(Boolean).join(" · ") })]);
    })));
  }

  /* ---------------- a unit's project ---------------- */
  function projectView(uid) {
    var ps = CR().projectState(uid), u = CR().unit(uid);
    if (!ps) return KOS.ui.emptyState({ mark: "創", title: "No project here", body: "This unit's project arrives with its release." });
    var T = CR().track(u.track);
    return el("section", { class: "k-card k-cr-project", "data-ui": "cr.project", "data-state": ps.offered ? "offered" : "after" }, [
      el("span", { class: "k-kicker", text: T.name + " " + u.n + " · project" }),
      el("h2", { class: "k-cr-project-t", text: ps.project.t }),
      el("p", { text: ps.project.brief }),
      ps.offered ? null : el("p", { class: "k-muted", text: "Best after " + ps.project.after + "'s studies." }),
      el("ol", { class: "k-cr-milestones", "data-ui": "cr.milestones" }, ps.project.milestones.map(function (m, i) {
        return el("li", { "data-state": ps.ms[i] ? "done" : null }, [
          el("span", { class: "k-cr-tick", "aria-hidden": "true", text: ps.ms[i] ? "✓" : String(i + 1) }),
          el("span", { class: "k-cr-ms-t", text: m }),
          ps.ms[i] ? el("small", { class: "k-cr-done", "data-tone": "done", text: "✓ done" }) :
            u.track === "write" && KOS.crWrite ? el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "cr.ms-write", text: "Write it", onclick: function () { KOS.crWrite.openMilestone(uid, i); } }) : null,
          el("button", { type: "button", class: "k-link", "data-ui": "cr.ms-mark", text: ps.ms[i] ? "Undo" : "Mark done", onclick: function () { CR().markMilestone(uid, i, ps.ms[i]); KOS.rerender(); } })
        ].filter(Boolean));
      })),
      el("p", { class: "k-muted", text: ps.done ? "✓ Every milestone reached" : "Pays 150 XP, 40 gold and +10 HP when every milestone is reached." })
    ].filter(Boolean));
  }
  KOS.crProject = projectView;

  /* ---------------- add work from a free app ---------------- */
  function addPage(main, key) {
    var bits = String(key || "").split("."), lid = bits.slice(0, 2).join("."), sid = bits[2] || null;
    var s = lid && sid ? CR().study(lid, sid) : null;
    var title = el("input", { class: "k-input", "aria-label": "Title", value: s ? lid + "·" + sid + " " + s.t : "" });
    var file = el("input", { type: "file", accept: "image/*,.txt,.md", class: "k-input", "aria-label": "A picture or a text file" });
    var link = el("input", { class: "k-input", type: "url", "aria-label": "Or a link (a video you exported)", placeholder: "https://…" });
    var go = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "cr.add-save", text: "Save to Practice Log" });
    go.onclick = function () {
      var f = file.files && file.files[0], rec = { title: title.value.trim() || "Untitled", lesson: s ? lid : null, study: s ? sid : null };
      function done(wid) { if (s) KOS.show("creatives", { page: "check", id: wid }); else KOS.show("creatives", { page: "log", id: wid }); }
      if (f && f.size > 15 * 1024 * 1024) { KOS.ui.toast("That file is over 15 MB. Export a smaller copy.", true); return; }
      if (f) {
        var rd = new FileReader();
        rd.onload = function () {
          if (/^image\//.test(f.type)) CR().addWork(Object.assign(rec, { kind: "image" }), { dataUrl: rd.result, name: f.name }, done);
          else CR().addWork(Object.assign(rec, { kind: "text", words: CR().words(rd.result) }), { text: rd.result, name: f.name }, done);
        };
        if (/^image\//.test(f.type)) rd.readAsDataURL(f); else rd.readAsText(f);
        return;
      }
      if (/^https?:\/\//.test(link.value.trim())) { CR().addWork(Object.assign(rec, { kind: "link", url: link.value.trim() }), null, done); return; }
      KOS.ui.toast("Choose a file or paste a link.", true);
    };
    main.appendChild(el("section", { class: "k-card k-cr-form k-cr-addform", "data-ui": "cr.add" }, [
      s ? el("p", {}, [el("b", { text: s.t }), " · " + s.vary]) : null,
      el("label", { class: "k-cr-field" }, [el("span", { text: "Title" }), title]),
      el("label", { class: "k-cr-field" }, [el("span", { text: "A picture or a text" }), file]),
      el("label", { class: "k-cr-field" }, [el("span", { text: "Or a link" }), link]),
      el("div", { class: "k-cr-daily-go" }, [go])
    ].filter(Boolean)));
  }

  /* ---------------- settings (31b) ---------------- */
  function settingsPage(main) {
    var p = CR().prefs();
    var days = el("div", { class: "k-cr-days", role: "group", "aria-label": "Your days" }, DAYN.map(function (d, i) {
      return el("button", { type: "button", class: "k-cr-day", "data-ui": "cr.day", "aria-pressed": String(p.days[i]), "aria-label": d, text: d.charAt(0),
        onclick: function () { var next = p.days.slice(); next[i] = !next[i]; if (!next.some(Boolean)) return; CR().setPrefs({ days: next }); KOS.rerender(); } });
    }));
    var mins = el("div", { class: "k-seg", role: "group", "aria-label": "Minutes a day" }, [10, 20, 30].map(function (m) {
      return el("button", { type: "button", class: "k-seg-item", "aria-pressed": String(p.minutes === m), text: m + " min", onclick: function () { CR().setPrefs({ minutes: m }); KOS.rerender(); } });
    }));
    var pause = el("input", { type: "checkbox", class: "k-box", "data-ui": "cr.exam-pause" });
    pause.checked = p.examPause;
    pause.onchange = function () { CR().setPrefs({ examPause: pause.checked }); };
    var strip = el("input", { type: "checkbox", class: "k-box", "data-ui": "cr.report-strip" });
    strip.checked = p.reportStrip;
    strip.onchange = function () { CR().setPrefs({ reportStrip: strip.checked }); };
    main.appendChild(el("section", { class: "k-card k-cr-settings", "data-ui": "cr.settings" }, [
      el("div", { class: "k-cr-setrow" }, [el("div", {}, [el("b", { text: "Your days" }), el("p", { class: "k-muted", text: "The Daily Creative shows on these days." })]), days]),
      el("div", { class: "k-cr-setrow" }, [el("div", {}, [el("b", { text: "Minutes" }), el("p", { class: "k-muted", text: "How long a day's study runs." })]), mins]),
      el("label", { class: "k-cr-setrow" }, [el("div", {}, [el("b", { text: "Pause in Exam Season" }), el("p", { class: "k-muted", text: "Rests while a real exam is close." })]), pause]),
      el("label", { class: "k-cr-setrow" }, [el("div", {}, [el("b", { text: "Portfolio in month reports" }), el("p", { class: "k-muted", text: "Shows pieces promoted that month. The Practice Log never appears." })]), strip]),
    ]));
  }
})();
