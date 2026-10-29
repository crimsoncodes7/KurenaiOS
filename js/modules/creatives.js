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

  KOS.crPages = [["tracks", "Tracks"], ["write", "Writing"], ["portfolio", "Portfolio"]];

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
  /* a track's units as a path: done, the current one, ahead (Moegi marks place, never pass) */
  function unitPath(tid, o) {
    o = o || {};
    var t = CR().track(tid), place = CR().trackPlace(tid);
    return el("span", { class: "k-cr-upath", "data-ui": "cr.unit-path", role: "img", "data-size": o.size || null,
      "aria-label": t.name + ": " + (place ? "unit " + (place.index + 1) + " of " + t.units.length : "not started") },
      t.units.map(function (uid, i) {
        var st = CR().unitState(uid).state;
        return el("i", { "data-state": st === "done" ? "done" : place && i === place.index && !place.finished ? "now" : null });
      }));
  }
  function trackBar(t) {
    var place = CR().trackPlace(t.id);
    return el("div", { class: "k-cr-trackbar", "data-ui": "cr.track-bar" }, [
      el("div", { class: "k-cr-trackbar-top" }, [
        el("span", { class: "k-cr-tile", lang: "ja", "aria-hidden": "true", text: t.k }),
        el("b", { text: t.name }),
        el("span", { class: "k-mono k-muted", text: place ? "Unit " + (place.index + 1) + " of " + t.units.length : "Not started" })
      ]),
      place ? unitPath(t.id) : el("span", { class: "k-cr-upath-none", "aria-hidden": "true" })
    ]);
  }
  function settingsBtn(page) {
    return el("button", { type: "button", class: "k-iconbtn", "data-ui": "cr.settings-open", "aria-label": "Creatives settings", "aria-current": page === "settings" ? "page" : null, text: "⚙",
      onclick: function () { KOS.show("creatives", { page: "settings" }); } });
  }
  function startFocus(ref) { KOS.show("focus", { subject: SID, ref: ref || undefined }); }

  /* ======================================================================
     31a · the desk
     ====================================================================== */
  KOS.crDesk = function (main) {
    var st = CR().stats(), first = !CR().started(), tid = CR().currentTrack(), T = CR().track(tid);
    var place = CR().trackPlace(tid), plan = CR().planDay();
    KOS.shell.actions([
      el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "cr.focus", text: "Start focus", onclick: function () { startFocus(); } }),
      settingsBtn()
    ]);
    var curUnit = place ? CR().unit(place.unit) : CR().unit(T.units[0]);
    var hero = el("section", { class: "k-subj-hero k-cr-hero", "data-ui": "study.subject-hero cr.hero", "aria-label": "Creatives" }, [
      el("span", { class: "k-cr-emblem-big", role: "img", "aria-label": "Now: " + T.name + ", unit " + curUnit.n + ", " + curUnit.name }, [
        el("span", { class: "k-cr-emblem-k", lang: "ja", "aria-hidden": "true", text: T.k }),
        el("small", { text: "this unit" }), el("b", { text: curUnit.skill || curUnit.name })
      ]),
      el("div", { class: "k-subj-id" }, [
        el("div", { class: "k-kicker", text: "Subject desk" }),
        el("h1", { class: "k-subj-name" }, ["Creatives ", el("span", { class: "k-cr-name-ja", lang: "ja", "aria-hidden": "true", text: "創" })]),
        el("div", { class: "k-subj-board" }, [el("span", { text: "Art, design, editing and writing · you against you only" })]),
        el("p", { class: "k-cr-hero-where", text: T.name + " · Unit " + curUnit.n + " " + curUnit.name + (st.done ? " · " + st.done + (st.done === 1 ? " lesson" : " lessons") + " done" : "") })
      ]),
      el("div", { class: "k-cr-trackbars", "data-ui": "cr.track-bars" }, CR().tracks().map(trackBar))
    ]);
    var side = el("div", { class: "k-subj-side k-cr-deskside" }, [first ? welcomeCard() : dailyCard(plan), first ? null : continueCard()].filter(Boolean));
    main.appendChild(el("div", { class: "k-subj-row", "data-ui": "study.desk-top" }, [hero, side]));

    var analytics = el("section", { class: "k-card k-sa", "data-ui": "study.analytics cr.analytics", "aria-label": "Subject analytics" }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: "Subject analytics" }),
        el("span", { class: "k-card-meta", text: "this subject only" }),
        el("details", { class: "k-sa-help" }, [
          el("summary", { class: "k-link", text: "What do these mean?" }),
          el("div", { class: "k-sa-help-body" }, [
            el("p", { text: "A lesson is done when its notes are read, its studies saved, their check passed and one theory card held. Reading alone never completes one." }),
            el("p", { text: "Nothing here counts words, strokes or reps: volume is never the point. Hours come from Focus." })
          ])
        ])
      ]),
      el("div", { class: "k-sa-grid", "data-ui": "study.analytics-grid" }, [
        statTile({ k: "Lessons", v: st.done + " / " + st.lessons, pct: Math.round(100 * st.done / Math.max(1, st.lessons)), c: "var(--green)" }),
        statTile({ k: "Checks passed", v: String(st.checks), empty: !st.checks }),
        statTile({ k: "Projects", v: st.projectsDone + " / " + st.projects, empty: !st.projects, pct: st.projects ? Math.round(100 * st.projectsDone / st.projects) : null, c: "var(--subj-c)" }),
        statTile({ k: "Cards due", v: String(st.due), empty: first }),
        statTile({ k: "Studies saved", v: String(st.studies), empty: !st.studies }),
        statTile({ k: "Portfolio", v: String(st.portfolio), empty: !st.portfolio }),
        statTile({ k: "Words written", v: KOS.ui.num(st.words), empty: !st.words, sub: "in saved work, never paid" }),
        statTile({ k: "This week", v: hm(st.week), empty: !st.week, pct: st.week ? Math.min(100, Math.round(100 * st.week / (CR().prefs().minutes * 3))) : null, c: "var(--green)" })
      ])
    ]);
    main.appendChild(el("div", { class: "k-subj-row" }, [analytics, portfolioCard()]));
    main.appendChild(pathSection(tid));
    main.appendChild(el("div", { class: "k-cr-close" }, [tracksCard(), firstsCard(), suggestCard(tid)].filter(Boolean)));
  };

  /* the side column's card: the Daily Creative in three parts (cards, one study, its check) */
  function dailyCard(p) {
    var box = el("section", { class: "k-card k-cr-daily", "data-ui": "cr.daily", "data-state": p.state, "aria-label": "Daily Creative" });
    function head(eye, chip) {
      return el("div", { class: "k-cr-daily-top" }, [el("span", { class: "k-kicker", text: eye }), chip ? el("span", { class: "k-chip k-cr-chip", "data-ui": "cr.daily-min", text: chip }) : null].filter(Boolean));
    }
    if (p.state === "paused") {
      [head("Daily Creative", "Paused"), el("h2", { class: "k-cr-daily-t", text: "Paused for Exam Season." }),
        el("p", { class: "k-muted", text: (p.back ? "Back after your last paper on " + dayLabel(p.back) + ". " : "") + "Cards stay open if you want them." }),
        p.cards ? el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "▶ Cards · " + p.cardMin + " min", onclick: function () { KOS.show("due"); } }) : null,
        el("small", { class: "k-muted", text: "Your study keeps its place. Every lesson still opens from the path." })].filter(Boolean).forEach(function (n) { box.appendChild(n); });
      return box;
    }
    if (p.state === "rest") {
      [head("Daily Creative", DAYN[p.nextDay]), el("h2", { class: "k-cr-daily-t", text: "Next one on " + ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][p.nextDay] + "." }),
        el("p", { class: "k-muted", text: "The desk stays open and nothing is waiting. Missing a day costs nothing." }),
        el("button", { type: "button", class: "k-btn", text: "Open a lesson anyway", onclick: function () { var ns = CR().nextStudy(CR().currentTrack()); if (ns) KOS.show("ref", { subject: SID, ref: ns.lesson.id }); else KOS.show("creatives", { page: "tracks" }); } })
      ].forEach(function (n) { box.appendChild(n); });
      return box;
    }
    if (p.state === "clear") {
      [head("Daily Creative · " + dayLabel(p.day)), el("h2", { class: "k-cr-daily-t", text: "Nothing waiting today." }),
        el("p", { class: "k-muted", text: "Every released study is passed. Try another track, or a redo when one comes back." }),
        el("button", { type: "button", class: "k-btn", text: "All tracks", onclick: function () { KOS.show("creatives", { page: "tracks" }); } })].forEach(function (n) { box.appendChild(n); });
      return box;
    }
    var sMin = p.study ? p.study.min : p.project ? 20 : 0, checkMin = p.study ? 3 : 0;
    var what = p.study ? (p.cards ? "Cards, then " : "") + p.study.lesson + "·" + p.study.study + " " + p.study.t : p.project ? (p.cards ? "Cards, then " : "") + p.project.project.t : "Cards";
    box.appendChild(head("Daily Creative · " + dayLabel(p.day), "≈ " + (p.cardMin + sMin + checkMin) + " min"));
    box.appendChild(el("h2", { class: "k-cr-daily-t", text: what }));
    if (p.study && p.study.saved) box.appendChild(el("p", { class: "k-muted", text: "Pick up here: it is saved, and its check is still to do." }));
    var parts = [["Cards", p.cardMin], ["Study", sMin], ["Check", checkMin]];
    box.appendChild(el("div", { class: "k-cr-blocks", role: "img", "aria-label": parts.map(function (b) { return b[0] + " " + b[1] + " minutes"; }).join(", ") },
      parts.map(function (b, i) { return b[1] ? el("span", { "data-block": String(i), style: "--w: " + b[1] }) : null; }).filter(Boolean)));
    box.appendChild(el("div", { class: "k-cr-blocks-l k-mono" }, parts.filter(function (b) { return b[1]; }).map(function (b) { return el("span", { text: b[0] + " " + b[1] }); })));
    box.appendChild(el("div", { class: "k-cr-daily-go" }, [
      el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "cr.daily-start", text: "▶ Start",
        onclick: function () {
          if (p.study) { var w = CR().studyWorks(p.study.lesson, p.study.study)[0]; if (w) KOS.show("creatives", { page: "check", id: w.id }); else KOS.crStartStudy(p.study.lesson, p.study.study); }
          else if (p.project) KOS.show("creatives", { page: "project", id: p.project.project.after ? CR().lesson(p.project.project.after).unit : null });
          else KOS.show("due");
        } }),
      p.cards && (p.study || p.project) ? el("button", { type: "button", class: "k-btn", text: "Just cards · " + p.cardMin + "′", onclick: function () { KOS.show("due"); } }) : null
    ].filter(Boolean)));
    return box;
  }
  function welcomeCard() {
    var ns = CR().nextStudy(CR().currentTrack()), L = ns ? ns.lesson : CR().lessons()[0], u = L ? CR().unit(L.unit) : null, T = u ? CR().track(u.track) : null;
    return el("section", { class: "k-card k-cr-welcome", "data-ui": "cr.welcome", "aria-label": "Welcome to Creatives" }, [
      el("span", { class: "k-kicker", text: "Welcome to Creatives" }),
      el("h2", { class: "k-cr-daily-t", text: "Start with ten minutes. Nobody sees it but you." }),
      el("p", { class: "k-muted", text: "Every lesson is one small skill with most of the work given. You compare yourself with you from last month, never with finished work." }),
      L ? el("div", { class: "k-cr-welcome-u" }, [el("span", { class: "k-mono k-cr-place", text: T.name + " " + u.n }), el("b", { text: u.name }), el("small", { class: "k-muted", text: u.lessons.length + " lessons · first study ≈ " + L.studies[0].min + " min" })]) : null,
      el("div", { class: "k-cr-daily-go" }, [
        L ? el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "cr.begin", text: "▶ Begin " + L.id, onclick: function () { KOS.show("ref", { subject: SID, ref: L.id }); } }) : null,
        el("button", { type: "button", class: "k-btn", text: "Look around first", onclick: function () { KOS.show("creatives", { page: "tracks" }); } })
      ].filter(Boolean))
    ].filter(Boolean));
  }
  function continueCard() {
    var ns = CR().nextStudy(CR().currentTrack());
    if (!ns) return null;
    var ev = CR().evidence(ns.lesson.id), pct = Math.round(25 * ev.checks.filter(Boolean).length);
    return el("button", { type: "button", class: "k-card k-cr-continue", "data-ui": "cr.continue", onclick: function () { KOS.show("ref", { subject: SID, ref: ns.lesson.id }); } }, [
      el("span", { class: "k-cr-continue-txt" }, [
        el("span", { class: "k-kicker", text: "Continue" }),
        el("span", { class: "k-cr-continue-t" }, [el("span", { class: "k-mono k-cr-place", text: ns.lesson.id }), " " + ns.lesson.title]),
        el("span", { class: "k-bar k-bar--3", "aria-hidden": "true", style: "--p: " + pct + "%; --bar-c: var(--cr)" }, [el("i")])
      ]),
      el("span", { class: "k-cr-go", "aria-hidden": "true", text: "→" })
    ]);
  }
  function kindMark(w) { var t = CR().track(w.track); return t ? t.k : "創"; }
  function portfolioCard() {
    var list = CR().portfolio().slice(0, 4);
    return el("section", { class: "k-card k-cr-port", "data-ui": "cr.portfolio-side", "aria-label": "Portfolio" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Portfolio" }), el("span", { class: "k-card-meta", text: "what you chose to show" }),
        el("button", { type: "button", class: "k-link", text: "Open →", onclick: function () { KOS.show("creatives", { page: "portfolio" }); } })]),
      list.length ? el("ul", { class: "k-cr-portlist" }, list.map(function (w) {
        return el("li", {}, [el("button", { type: "button", class: "k-cr-portrow", onclick: function () { KOS.show("creatives", { page: "log", id: w.id }); } }, [
          el("span", { class: "k-cr-kind", lang: "ja", "aria-hidden": "true", text: kindMark(w) }),
          el("span", { class: "k-cr-portrow-t" }, [el("span", { text: w.title }), el("small", { class: "k-muted", text: (CR().track(w.track) || {}).name + " · " + dateShort(w.portfolio) })])
        ])]);
      })) : el("p", { class: "k-cr-port-empty", text: "Nothing promoted yet, and that's normal. When a piece makes you smile, open it and choose “Promote”." }),
      el("button", { type: "button", class: "k-cr-privlink", "data-ui": "cr.log-link", onclick: function () { KOS.show("creatives", { page: "log" }); } }, [
        el("span", { "aria-hidden": "true", text: "◔" }), el("span", { text: "Practice Log · only you see it" }), el("span", { "aria-hidden": "true", text: "›" })])
    ]);
  }
  function pathSection(tid) {
    var T = CR().track(tid), ts = CR().tracks(), ti = ts.indexOf(T), place = CR().trackPlace(tid);
    function go(d) { var u = CR().ui(); u.track = ts[(ti + d + ts.length) % ts.length].id; KOS.store.save(); KOS.rerender(); announce(ts[(ti + d + ts.length) % ts.length].name + " path."); }
    var strip = el("div", { class: "k-cr-strip", "data-ui": "cr.stage-strip", role: "list", "aria-label": T.name + ", " + T.units.length + " units" }, T.stages.map(function (sg) {
      return el("div", { class: "k-cr-stage", role: "listitem" }, [el("span", { class: "k-kicker", text: sg[0] }),
        el("span", { class: "k-cr-chips" }, T.units.slice(sg[1] - 1, sg[2]).map(function (uid) {
          var us = CR().unitState(uid), u = CR().unit(uid), now = place && place.unit === uid && !place.finished;
          return el("button", { type: "button", class: "k-cr-uchip", "data-state": us.state === "done" ? "done" : now ? "now" : null, "aria-label": "Unit " + u.n + " " + u.name + (us.state === "done" ? ", done" : now ? ", current" : us.state === "outline" ? ", coming later" : ""),
            onclick: function () { openUnit(uid); } }, [(us.state === "done" ? "✓ " : "") + "U" + u.n]);
        }))]);
    }));
    var cards = el("div", { class: "k-units k-cr-units", "data-ui": "study.units cr.units" }, T.units.map(function (uid) { return unitCard(uid, place); }));
    return el("section", { class: "k-subj-units k-cr-path", "aria-labelledby": "k-cr-path-h" }, [
      el("div", { class: "k-sectionhead" }, [
        el("h2", { id: "k-cr-path-h", text: T.name + " path" }),
        el("span", { class: "k-sectionhead-sub", text: T.units.length + " units · nothing locked" }),
        el("div", { class: "k-sectionhead-actions" }, [
          el("button", { type: "button", class: "k-link", text: "All tracks ›", onclick: function () { KOS.show("creatives", { page: "tracks" }); } }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "cr.track-prev", "aria-label": "Previous track", text: "‹", onclick: function () { go(-1); } }),
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "cr.track-next", "aria-label": "Next track", text: "›", onclick: function () { go(1); } })
        ])
      ]),
      strip,
      KOS.ui.scroller(cards, { label: "Units", prevLabel: "Scroll to earlier units", nextLabel: "Scroll to later units" })
    ]);
  }
  function openUnit(uid) {
    var us = CR().unitState(uid), u = CR().unit(uid);
    if (us.state === "outline") { KOS.show("creatives", { page: "tracks", id: u.track }); return; }
    KOS.show("ref", { subject: SID, ref: (us.next || CR().lesson(u.lessons[0])).id });
  }
  function unitCard(uid, place) {
    var u = CR().unit(uid), us = CR().unitState(uid), now = place && place.unit === uid && !place.finished, T = CR().track(u.track);
    var foot = us.state === "outline" ? ["Coming in a later release"] : us.state === "done" ? [el("b", { text: us.done + " / " + us.total }), " done"]
      : now ? [el("b", { text: us.done + " / " + us.total }), us.next ? " · " + us.next.id + " now" : ""] : [el("b", { text: us.done + " / " + us.total }), " · open any time"];
    var card = el("button", { type: "button", class: "k-unit k-cr-unit", "data-ui": "study.unit cr.unit", "data-state": us.state === "outline" ? "later" : now ? "current" : us.state === "done" ? "done" : null,
      "aria-label": T.name + " unit " + u.n + ", " + u.name + ": " + (us.state === "outline" ? "coming later" : us.done + " of " + us.total + " done"),
      onclick: function () { openUnit(uid); } }, [
      el("span", { class: "k-cr-unit-top" }, [el("span", { class: "k-unit-ref", text: T.name.split(" ")[0] + " " + u.n }), el("small", { class: "k-muted", text: u.stage })]),
      el("span", { class: "k-unit-title", text: u.name }),
      us.total ? el("span", { class: "k-unit-segs", "aria-hidden": "true" }, u.lessons.map(function (id) {
        return el("span", { "data-state": CR().done(id) ? "done" : now && us.next && us.next.id === id ? "started" : null });
      })) : el("span", { class: "k-cr-unit-skill k-muted", text: "Teaches " + (u.skill || "") }),
      el("span", { class: "k-unit-foot", "data-ui": "study.unit-foot" }, foot)
    ]);
    if (now) KOS.ui.state(card, "current", true);
    return card;
  }
  function tracksCard() {
    return el("section", { class: "k-card k-cr-tracks", "data-ui": "cr.tracks-card", "aria-label": "The four tracks" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "The four tracks" }), el("button", { type: "button", class: "k-link", text: "Tracks →", onclick: function () { KOS.show("creatives", { page: "tracks" }); } })]),
      el("ul", { class: "k-cr-trackrows" }, CR().tracks().map(function (t) {
        var place = CR().trackPlace(t.id), released = CR().lessons(t.id).length;
        return el("li", {}, [
          el("span", { class: "k-cr-trackrow-t" }, [el("b", { text: t.name }), el("small", { class: "k-muted", text: place ? "Unit " + (place.index + 1) + " · " + t.app : released ? t.app : "Not released yet · " + t.app })]),
          place ? unitPath(t.id, { size: "sm" }) : released ? el("button", { type: "button", class: "k-link", text: "Begin", onclick: function () { KOS.show("ref", { subject: SID, ref: CR().lessons(t.id)[0].id }); } }) : el("span", { class: "k-muted k-cr-later", text: "Later" })
        ]);
      }))
    ]);
  }
  function firstsCard() {
    var f = CR().firsts();
    if (!f.length) return null;
    return el("section", { class: "k-card k-cr-firsts", "data-ui": "cr.firsts", "aria-label": "Firsts" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Firsts" }), el("span", { class: "k-card-meta", text: "kept, never counted" })]),
      el("ul", { class: "k-cr-firstlist" }, f.map(function (x) {
        return el("li", {}, [el("span", { class: "k-cr-tick", "aria-hidden": "true", text: "✓" }), el("span", { text: x.t }), el("span", { class: "k-mono k-muted", text: dateShort(x.at) })]);
      }))
    ]);
  }
  function suggestCard(tid) {
    var other = CR().tracks().filter(function (t) { return t.id !== tid && CR().lessons(t.id).length; }).map(function (t) { return CR().nextStudy(t.id); }).filter(Boolean)[0];
    var ns = other || CR().nextStudy(tid);
    if (!ns) return null;
    return el("section", { class: "k-card k-cr-suggest", "data-ui": "cr.suggest", "aria-label": "Suggested next" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Suggested next" }), el("span", { class: "k-card-meta", text: "one study" })]),
      el("div", { class: "k-cr-suggest-t" }, [el("span", { class: "k-mono k-muted", text: ns.lesson.id + "·" + ns.study.id }), el("b", { text: ns.study.t })]),
      el("p", { class: "k-muted", text: "≈ " + ns.study.min + " minutes. " + ns.study.give + "; you do one thing: " + ns.study.vary.charAt(0).toLowerCase() + ns.study.vary.slice(1) + "." }),
      el("button", { type: "button", class: "k-btn", text: "Preview", onclick: function () { KOS.show("ref", { subject: SID, ref: ns.lesson.id }); } })
    ]);
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
    if (page === "write") { spaceHead(main, "write", { title: "Writing Desk", sub: arg.id ? null : "Drafts, versions and sprints" }); return arg.id ? KOS.crWrite.desk(main, arg.id) : KOS.crWrite.list(main); }
    if (page === "check") { spaceHead(main, "check", { title: "Good for this unit", sub: "The check on one skill, at a beginner's level" }); return checkPage(main, arg.id); }
    if (page === "log") { spaceHead(main, "log", { title: "Practice Log", sub: "Private: only you see it, and nothing here is shown anywhere else" }); return logPage(main, arg.id); }
    if (page === "portfolio") { spaceHead(main, "portfolio", { title: "Portfolio", sub: "Only what you chose to show" }); return portfolioPage(main); }
    if (page === "project") { spaceHead(main, "project", { title: "Project", sub: null }); main.appendChild(projectView(arg.id)); return; }
    if (page === "add") { spaceHead(main, "add", { title: "Add your work", sub: "From a free app: a picture, a text or a link" }); return addPage(main, arg.id); }
    if (page === "settings") { spaceHead(main, "settings", { title: "Creatives settings" }); return settingsPage(main); }
    spaceHead(main, "tracks", { title: "Tracks", sub: "Four core paths of short units · nothing locked" });
    tracksPage(main, arg.id);
  };

  /* ---------------- tracks ---------------- */
  function tracksPage(main, focus) {
    main.appendChild(el("div", { class: "k-cr-trackgrid", "data-ui": "cr.tracks" }, CR().tracks().map(function (t) {
      var place = CR().trackPlace(t.id);
      return el("section", { class: "k-card k-cr-trackcard", "data-ui": "cr.track", id: "cr-track-" + t.id, "data-state": focus === t.id ? "focus" : null, "aria-label": t.name }, [
        el("div", { class: "k-cr-trackcard-h" }, [el("span", { class: "k-cr-tile k-cr-tile--lg", lang: "ja", "aria-hidden": "true", text: t.k }),
          el("div", {}, [el("h2", { text: t.name }), el("small", { class: "k-muted", text: t.app })])]),
        place ? unitPath(t.id) : null,
        el("ol", { class: "k-cr-unitlist" }, t.units.map(function (uid) {
          var u = CR().unit(uid), us = CR().unitState(uid);
          return el("li", { "data-state": us.state }, [
            el("button", { type: "button", class: "k-cr-unitrow", disabled: us.state === "outline" ? "" : null, onclick: function () { openUnit(uid); } }, [
              el("span", { class: "k-mono", text: String(u.n) }),
              el("span", { class: "k-cr-unitrow-t" }, [el("span", { text: u.name }), el("small", { class: "k-muted", text: u.skill || "" })]),
              el("small", { class: "k-mono k-muted", text: us.state === "outline" ? "later" : us.state === "done" ? "✓ done" : us.done + " / " + us.total })
            ])
          ]);
        }))
      ].filter(Boolean));
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
    var note = el("textarea", { class: "k-input k-cr-checknote", rows: "2", "aria-label": "One sentence about it (optional)", placeholder: "One sentence about it, if you like (optional)" });
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
          el("b", { text: "✓ A pass for " + T.name + " " + u.n + "." }),
          el("p", { text: r.paid ? "First pass on this study" + (pay && pay.xp ? ": +" + pay.xp + " XP, +" + pay.gold + " gold." : ".") : "No reward · this study's pass was paid before. Another rep is still worth it." }),
          el("div", { class: "k-cr-daily-go" }, [
            el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Back to the lesson", onclick: function () { KOS.show("ref", { subject: SID, ref: L.id }); } }),
            el("button", { type: "button", class: "k-btn", text: "Promote to Portfolio…", onclick: function () { promoteDialog(wid); } })
          ])
        ]));
        announce("Check saved: a pass.");
      } else {
        out.appendChild(el("section", { class: "k-cr-band", "data-tone": "next", "data-ui": "cr.check-notyet" }, [
          el("b", { text: "Not yet is a normal answer." }),
          el("p", { text: "Your work is saved either way. Next step, about five minutes: one more rep with only the one skill in mind." }),
          el("div", { class: "k-cr-daily-go" }, [
            el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "One more rep", onclick: function () { KOS.crStartStudy(L.id, s.id); } }),
            el("button", { type: "button", class: "k-btn", text: "Reread the lesson", onclick: function () { KOS.show("ref", { subject: SID, ref: L.id }); } }),
            el("button", { type: "button", class: "k-btn", text: "Keep it as it is", onclick: function () { KOS.show("creatives", { page: "log", id: wid }); } })
          ])
        ]));
        announce("Check saved: not yet.");
      }
    };
    main.appendChild(el("div", { class: "k-cr-check", "data-ui": "cr.check" }, [
      el("section", { class: "k-card k-cr-checkcol" }, [el("span", { class: "k-kicker", text: "Your work · " + w.title }), mine]),
      el("section", { class: "k-cr-calib", "data-ui": "cr.calibration", "aria-label": "Good for this unit" }, [
        el("span", { class: "k-kicker", text: T.name + " " + u.n + " · " + L.check.skill }),
        el("p", { class: "k-cr-calib-text", text: L.check.good }),
        el("div", { class: "k-cr-ignore" }, [el("span", { class: "k-kicker", text: "Ignore for now" }), el("ul", {}, L.check.ignore.map(function (x) { return el("li", {}, [el("s", { text: x[0] }), el("small", { class: "k-muted", text: " · " + x[1] })]); }))])
      ]),
      beginner ? el("section", { class: "k-card k-cr-checkcol" }, [el("span", { class: "k-kicker", text: "Expected beginner output" }),
        el("blockquote", { class: "k-cr-beginner-text" }, beginner.text.split("\n").map(function (p) { return el("p", { text: p }); })), el("small", { class: "k-muted", text: beginner.note })]) : null
    ].filter(Boolean)));
    main.appendChild(el("section", { class: "k-card k-cr-checkform", "data-ui": "cr.check-form", "aria-label": "The check" }, rows.concat([note,
      el("div", { class: "k-cr-daily-go" }, [saveBtn, el("small", { class: "k-muted", text: "Self-marked: the app never grades your work. Only a pass ticks the lesson's check." })]), out])));
  }

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
    });
    var foot = [
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
      el("p", { class: "k-muted", text: "The Portfolio is the only place a share or a report can ever show. Promoting pays nothing; it is just a choice." }),
      el("label", { class: "k-cr-field" }, [el("span", { text: "Title" }), title]), el("label", { class: "k-cr-field" }, [el("span", { text: "Made from" }), made])
    ]), foot: [yes], closeLabel: "Cancel" });
    yes.onclick = function () { CR().editWork(wid, { title: title.value.trim() || w.title, madeFrom: made.value.trim() || null }); CR().promote(wid, true); d.close(); KOS.rerender(); announce("Promoted to your Portfolio."); };
  }
  function logPage(main, wid) {
    var all = CR().works();
    if (!all.length) { main.appendChild(KOS.ui.emptyState({ mark: "◔", title: "Nothing here yet", body: "Every study you save lands here first, raw and private. Delete anything, any time." })); return; }
    main.appendChild(el("section", { class: "k-card k-cr-loglist", "data-ui": "cr.log", "aria-label": "Practice Log" }, [
      el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: all.length + (all.length === 1 ? " piece" : " pieces") }), el("span", { class: "k-card-meta", text: "newest first · prunable" })])
    ].concat(all.map(function (w) { return workRow(w, { open: w.id === wid }); }))));
    if (wid && CR().work(wid)) setTimeout(function () { openWork(wid); }, 0);
  }
  function portfolioPage(main) {
    var list = CR().portfolio();
    if (!list.length) { main.appendChild(KOS.ui.emptyState({ mark: "選", title: "Nothing promoted yet", body: "That's normal. When a piece makes you smile, open it in the Practice Log and choose “Promote”.",
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
      ps.offered ? null : el("p", { class: "k-cr-band", "data-tone": "next", text: "Offered after " + ps.project.after + "'s studies. Try it anyway: nothing is locked." }),
      el("ol", { class: "k-cr-milestones", "data-ui": "cr.milestones" }, ps.project.milestones.map(function (m, i) {
        return el("li", { "data-state": ps.ms[i] ? "done" : null }, [
          el("span", { class: "k-cr-tick", "aria-hidden": "true", text: ps.ms[i] ? "✓" : String(i + 1) }),
          el("span", { class: "k-cr-ms-t", text: m }),
          ps.ms[i] ? el("small", { class: "k-cr-done", "data-tone": "done", text: "✓ done" }) :
            u.track === "write" && KOS.crWrite ? el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "cr.ms-write", text: "Write it", onclick: function () { KOS.crWrite.openMilestone(uid, i); } }) : null,
          el("button", { type: "button", class: "k-link", "data-ui": "cr.ms-mark", text: ps.ms[i] ? "Undo" : "Mark done", onclick: function () { CR().markMilestone(uid, i, ps.ms[i]); KOS.rerender(); } })
        ].filter(Boolean));
      })),
      el("p", { class: "k-muted", text: ps.done ? "Every milestone reached. " + (CR().peek().paid["project:" + uid] ? "Paid once: 150 XP, 40 gold, +10 HP." : "") : "The project pays once, when every milestone is reached (150 XP, 40 gold, +10 HP)." })
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
      el("p", { class: "k-muted", text: "It stays on this device, in your private Practice Log, until you choose otherwise." }),
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
    main.appendChild(el("section", { class: "k-card k-cr-settings", "data-ui": "cr.settings" }, [
      el("div", { class: "k-cr-setrow" }, [el("div", {}, [el("b", { text: "Your days" }), el("p", { class: "k-muted", text: "The Daily Creative appears on these days only. Nothing counts against you on the others." })]), days]),
      el("div", { class: "k-cr-setrow" }, [el("div", {}, [el("b", { text: "Minutes" }), el("p", { class: "k-muted", text: "Roughly how long a day's study runs." })]), mins]),
      el("label", { class: "k-cr-setrow" }, [el("div", {}, [el("b", { text: "Pause in Exam Season" }), el("p", { class: "k-muted", text: "The Daily Creative rests while a real exam is close. Cards stay open." })]), pause]),
      el("p", { class: "k-muted", text: "On this device. Free apps first: no lesson ever needs a paid one." })
    ]));
  }
})();
