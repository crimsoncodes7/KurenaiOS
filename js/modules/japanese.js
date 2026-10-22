/* Kurenai OS — modules/japanese.js
   The Japanese space's own pages (roadmap 5.5, design turn 28):
     KOS.jaDesk(main)            28a  the subject desk, built like the Code desk (26a)
     #/japanese/path             28b  the media path: stones, requirements, ranges
     #/japanese/skills           28c  the skill map: units by skill, the radar, Rework, fluency
     #/japanese/kana             28d  kana: the day's set (write it, read it), the chart below
     #/japanese/reviews          28g  the review block (KOS.jaRun)
     #/japanese/session/<kind>   28f  a session: today, or learn a lesson
     #/japanese/checkpoints      28j  checkpoints: per-skill results, the 80% line, the seal
     #/japanese/settings         28m  furigana, daily minutes, voices, speech, Licences & credits
   The lesson is the shared topic page (hub.js + jatopic.js). Pages read through KOS.ja; the only
   writes are the learner's own answers and settings. A render writes nothing.                  */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var SID = "ja";
  var DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function J() { return KOS.ja; }
  function UI() { return KOS.jaUI; }
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  function plural(n, one, many) { return KOS.ui.num(n) + " " + (n === 1 ? one : (many || one + "s")); }
  function today() { return KOS.srs.todayISO(); }
  function isoOf(ts) { var d = new Date(ts); return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2); }
  function dayLabel(iso) { var d = new Date(iso + "T12:00:00"); return DOW[d.getDay()] + " " + d.getDate() + " " + MON[d.getMonth()]; }
  function cardHead(title, meta, link, go) {
    return el("div", { class: "k-card-head" }, [
      el("span", { class: "k-card-title", text: title }),
      meta ? el("span", { class: "k-card-meta", text: meta }) : null,
      link ? el("button", { type: "button", class: "k-link", text: link, onclick: go }) : null
    ].filter(Boolean));
  }
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
  function openUnit(uid) {
    var us = J().unitState(uid);
    var target = us.next || (J().lessons().filter(function (l) { return l.unit === uid; })[0]);
    if (target) KOS.show("ref", { subject: SID, ref: target.id });
  }
  function hmText(mins) { mins = Math.round(mins || 0); var h = Math.floor(mins / 60), m = mins % 60; return h ? h + " h " + (m < 10 ? "0" : "") + m : m + " m"; }
  function weekInput() {
    var j = J().peek(), out = { read: 0, listen: 0, raw: 0, jpSub: 0 };
    for (var i = 0; i < 7; i++) { var d = KOS.jaSrs.addDays(today(), -i), r = j.input[d] || {}; Object.keys(out).forEach(function (k) { out[k] += r[k] || 0; }); }
    out.total = out.read + out.listen + out.raw + out.jpSub;
    return out;
  }

  /* skill percentages for the bars and the radar: stable facets of that skill as a share of the
     next milestone's need (28·kit: "each axis is stable words for that skill as a share of the next
     milestone's words"; in Stage 0 the kana stand in for words) */
  function skillPcts() {
    var j = J().peek(), tl = J().timeline(), next = tl.milestones.filter(function (m) { return !m.done; })[0];
    var need = next ? next.need : 1, stable = { R: 0, L: 0, W: 0, S: 0 };
    Object.keys(j.facets).forEach(function (k) {
      var f = j.facets[k], p = KOS.jaSrs.split(k);
      if (f.reps && f.s >= KOS.jaSrs.HOLD && stable[p.skill] != null) stable[p.skill]++;
    });
    var out = {};
    Object.keys(stable).forEach(function (s) { out[s] = Math.min(100, Math.round(100 * stable[s] / Math.max(1, need))); });
    return { pct: out, stable: stable, need: need };
  }

  /* ---------------- an inner page's head: the pages are the top bar's pills (Reviews, Kana,
     Skills, Path, Checkpoints; the desk is the subject pill), so the page adds only its header
     and the actions every Japanese page shares, Focus and settings ---------------- */
  function spaceHead(main, page, o) {
    o = o || {};
    KOS.shell.actions([
      el("button", { type: "button", class: "k-btn", "data-ui": "ja.focus", text: "Start focus", onclick: function () { KOS.show("focus", { subject: SID }); } }),
      el("button", { type: "button", class: "k-iconbtn", "data-ui": "ja.settings-open", "aria-label": "Japanese settings", "aria-current": page === "settings" ? "page" : null, text: "⚙",
        onclick: function () { KOS.show("japanese", { page: "settings" }); } })
    ]);
    main.appendChild(KOS.ui.pageHeader({ kicker: "Japanese", title: o.title, sub: o.sub }));
  }

  /* ======================================================================
     28a · the subject desk
     ====================================================================== */
  KOS.jaDesk = function (main) {
    var st = J().stats(), run = KOS.sessions.streak(SID), sp = skillPcts();
    var first = !J().started();
    KOS.shell.actions([
      el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Start focus",
        onclick: function () { KOS.show("focus", { subject: SID }); } }),
      el("button", { type: "button", class: "k-iconbtn", "data-ui": "ja.settings-open", "aria-label": "Japanese settings", text: "⚙",
        onclick: function () { KOS.show("japanese", { page: "settings" }); } })
    ]);
    var next = J().nextLesson(), stage = next ? stageOf(next.unit) : null;
    var hero = el("section", { class: "k-subj-hero k-ja-hero", "data-ui": "study.subject-hero ja.hero", "aria-label": "Japanese" }, [
      el("span", { class: "k-subj-ring", role: "img", "aria-label": st.mastery + "% mastery", style: "--p: " + st.mastery + "%" }, [
        el("span", { class: "k-subj-ring-in" }, [el("b", { text: st.mastery + "%" }), el("small", { text: "mastery" })])
      ]),
      el("div", { class: "k-subj-id" }, [
        el("div", { class: "k-kicker", text: "Subject desk" }),
        el("h1", { class: "k-subj-name" }, ["Japanese ", el("span", { class: "k-ja-name-ja", lang: "ja", text: "日本語" })]),
        el("div", { class: "k-subj-board" }, [
          el("span", { text: KOS_DATA.ja.board }),
          run ? el("span", { class: "k-chip", style: "--chip-c: var(--subj-c)", title: run + "-day study streak in Japanese", text: "炎 " + run + "-day streak" }) : null
        ].filter(Boolean)),
        el("p", { class: "k-ja-hero-where" }, stage ? [stage.name === "Kana" ? "Stage 0 · " : "Stage " + stage.index + " · ",
          el("span", { lang: "ja", text: stage.kanji }), " " + stage.name + " · " + st.done + " of " + st.lessons + " lessons"] : [st.done + " of " + st.lessons + " lessons"])
      ]),
      el("div", { class: "k-subj-papers k-ja-skills", "data-ui": "ja.skill-bars" }, ["R", "L", "W", "S"].map(function (s) {
        var pct = sp.pct[s], off = s === "S" && !J().peek().settings.speech;
        return el("div", { class: "k-subj-paper" }, [
          el("div", { class: "k-subj-paper-top" }, [UI().skill(s), el("span", { class: "k-subj-paper-note" }),
            el("span", { class: "k-mono", text: off ? "off" : pct + "%" })]),
          el("span", { class: "k-bar k-bar--6", role: "img", "aria-label": UI().SKILL[s] + ": " + (off ? "speaking is off" : pct + "%"), style: "--p: " + (off ? 0 : pct) + "%" }, [el("i")])
        ]);
      })),
      /* the core path lives in the hero, under the name, across its whole width (as Code's, 26a) */
      el("div", { class: "k-ja-hero-path" }, [UI().stagePath({ onUnit: openUnit, onCheckpoint: function () { KOS.show("japanese", { page: "checkpoints" }); } })])
    ]);
    var side = el("div", { class: "k-subj-side k-ja-deskside" }, [first ? firstDayCard() : todayCard(), continueCard(next)].filter(Boolean));
    main.appendChild(el("div", { class: "k-subj-row", "data-ui": "study.desk-top" }, [hero, side]));

    var fl = J().fluency(), wi = weekInput();
    var analytics = el("section", { class: "k-card k-sa", "data-ui": "study.analytics ja.analytics", "aria-label": "Subject analytics" }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: "Subject analytics" }),
        el("span", { class: "k-card-meta", text: "this subject only" }),
        el("details", { class: "k-sa-help" }, [
          el("summary", { class: "k-link", text: "What do these mean?" }),
          el("div", { class: "k-sa-help-body" }, [
            el("p", { text: "Mastery averages each lesson's four evidence checks: notes read, every example heard, the practice passed, and held in reviews." }),
            el("p", { text: "Stable means a review that holds for three weeks or more. Every number comes from your answers, never from a box you tick." })
          ])
        ])
      ]),
      el("div", { class: "k-sa-grid", "data-ui": "study.analytics-grid" }, [
        statTile({ k: "Mastery", v: st.mastery + "%", pct: st.mastery, c: "var(--subj-c)" }),
        statTile({ k: "Lessons", v: st.done + " / " + st.lessons, pct: Math.round(100 * st.done / Math.max(1, st.lessons)), c: "var(--green)" }),
        statTile({ k: "Checkpoints", v: st.passed + " / " + st.checkpoints, empty: !st.passed, pct: st.passed ? Math.round(100 * st.passed / st.checkpoints) : null, c: "var(--subj-c)", sub: "one after each unit" }),
        statTile({ k: "Reviews due", v: String(st.due), empty: first }),
        statTile({ k: "Kana read", v: st.kanaRead + " / 92", empty: !st.kanaRead, pct: Math.round(100 * st.kanaRead / 92), c: "var(--subj-c)", sub: "basic kana whose reading holds three weeks" }),
        statTile({ k: "Words stable", v: String(st.wordsStable), empty: !st.wordsStable, sub: "words arrive in Stage 1" }),
        statTile({ k: "Recognition", v: fl.kanaMs ? (fl.kanaMs / 1000).toFixed(1) + " s / kana" : "", empty: !fl.kanaMs, sub: "median of the kana drill's reading times" }),
        statTile({ k: "Input this week", v: hmText(wi.total), empty: !wi.total, pct: Math.min(100, Math.round(100 * wi.total / 300)), c: "var(--green)" })
      ])
    ]);
    main.appendChild(el("div", { class: "k-subj-row" }, [analytics, reworkCard()]));

    var units = el("div", { class: "k-units k-ja-units", "data-ui": "study.units ja.units" });
    (window.KOS_JA.STAGES || []).forEach(function (stg) {
      stg.units.forEach(function (u) {
        var us = J().unitState(u.id), later = us.state === "later";
        var card = el("button", { type: "button", class: "k-unit k-ja-unit", "data-ui": "study.unit ja.unit", "data-state": later ? "later" : us.state === "current" ? "current" : null,
          "aria-label": u.name + ": " + (later ? "recommended later" : us.done + " of " + us.total + " done"),
          onclick: function () { openUnit(u.id); } }, [
          el("span", { class: "k-ja-unit-top" }, [el("span", { class: "k-unit-ref", text: u.id }), el("span", { class: "k-ja-unit-sk" },
            (u.id === "H" || u.id === "K" ? ["R", "W"] : ["R", "L", "W", "S"]).map(function (s) { return el("b", { text: s }); }))]),
          el("span", { class: "k-unit-title", text: u.name }),
          el("span", { class: "k-unit-segs", "aria-hidden": "true" }, u.lessons.map(function (id) {
            var p = KOS.store.peekProgress(SID, id);
            return el("span", { "data-state": p && p.status === "done" ? "done" : p && p.status && p.status !== "none" ? "started" : null });
          })),
          el("span", { class: "k-unit-foot", "data-ui": "study.unit-foot" }, later ? ["Recommended later"]
            : [el("b", { text: us.done + " / " + us.total }), us.state === "current" && us.next ? " · " + us.next.id + " now" : " done"])
        ]);
        if (us.state === "current") KOS.ui.state(card, "current", true);
        units.appendChild(card);
      });
    });
    main.appendChild(el("section", { class: "k-subj-units k-ja-core", "aria-labelledby": "k-ja-core-h" }, [
      el("div", { class: "k-sectionhead" }, [
        el("h2", { id: "k-ja-core-h", text: "Core path" }),
        el("span", { class: "k-sectionhead-sub", text: "6 stages · " + st.lessons + " lessons so far · a checkpoint per unit" }),
        el("div", { class: "k-sectionhead-actions" }, [el("button", { type: "button", class: "k-link", text: "Skill map ›", onclick: function () { KOS.show("japanese", { page: "skills" }); } })])
      ]),
      KOS.ui.scroller(units, { label: "Units", prevLabel: "Scroll to earlier units", nextLabel: "Scroll to later units" })
    ]));

    main.appendChild(el("div", { class: "k-ja-close" }, [nextStoneCard(), inputCard(wi)]));
  };

  function stageOf(uid) {
    var out = null;
    (window.KOS_JA.STAGES || []).forEach(function (st, i) { if (st.units.some(function (u) { return u.id === uid; })) out = { index: i, kanji: st.kanji, name: st.name }; });
    return out;
  }

  /* Today (28a): the four computed blocks as one bar with one Start */
  function todayCard() {
    var p = J().planDay(), blocks = [["Reviews", p.reviews.min], ["New", p.learn ? p.learn.min : 0], ["Input", p.input.min], ["Output", p.output.min]];
    var what = p.reviews.n && p.learn ? "Reviews, then " + p.learn.lesson + " " + p.learn.title : p.learn ? p.learn.lesson + " " + p.learn.title : p.reviews.n ? "Reviews" : "All caught up";
    var box = el("section", { class: "k-card k-ja-today", "data-ui": "ja.today", "aria-label": "Today" }, [
      el("div", { class: "k-ja-today-top" }, [
        el("span", { class: "k-kicker", text: "Today · " + dayLabel(p.day) }),
        el("span", { class: "k-chip", "data-ui": "ja.today-min", style: "--chip-c: var(--subj-c)", text: "≈ " + p.total + " min" })
      ]),
      el("h2", { class: "k-ja-today-t", text: what }),
      el("div", { class: "k-ja-blocks", role: "img", "aria-label": blocks.map(function (b) { return b[0] + " " + b[1] + " minutes"; }).join(", ") },
        blocks.map(function (b, i) { return el("span", { "data-block": String(i), style: "--w: " + Math.max(1, b[1]) }); })),
      el("div", { class: "k-ja-blocks-l k-mono" }, blocks.map(function (b) { return el("span", { text: b[0] + " " + b[1] }); })),
      p.learn && p.learn.heavy && p.reviews.n ? el("p", { class: "k-ja-today-note", text: "A heavy review day: New shrinks; input stays." }) : null,
      el("div", { class: "k-ja-today-go" }, [
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "ja.start", text: "▶ Start",
          disabled: !p.reviews.n && !p.learn ? "" : null,
          onclick: function () { KOS.show("japanese", { page: "session", id: p.reviews.n ? "reviews" : "learn-" + p.learn.lesson }); } }),
        p.reviews.n ? el("span", { class: "k-muted", text: plural(p.reviews.n, "review") + " due" }) : null
      ].filter(Boolean))
    ].filter(Boolean));
    return box;
  }
  /* the first day (28a, state): three short blocks, nothing calibrated */
  function firstDayCard() {
    var L = J().lessons()[0];
    return el("section", { class: "k-card k-ja-today", "data-ui": "ja.today ja.first-day", "data-state": "first" }, [
      el("div", { class: "k-ja-today-top" }, [el("span", { class: "k-kicker", text: "Today · first session" }), el("span", { class: "k-chip", style: "--chip-c: var(--subj-c)", title: "The plan settles in about two weeks.", text: "≈ 15 min" })]),
      el("ol", { class: "k-ja-firstlist" }, [
        ["Kana", "あ い う え お", "8"], ["Listen", "your first sounds", "5"], ["Say it", "optional", "2"]
      ].map(function (r) { return el("li", {}, [el("b", { text: r[0] }), el("span", { lang: /[ぁ-ん]/.test(r[1]) ? "ja" : null, text: r[1] }), el("small", { class: "k-mono", text: "≈ " + r[2] + " min" })]); })),
      el("div", { class: "k-ja-today-go" }, [
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "ja.start", text: "▶ Start",
          onclick: function () { KOS.show("ref", { subject: SID, ref: L.id }); } }),
        el("span", { class: "k-muted", text: "Skip any block inside" })
      ])
    ]);
  }
  function continueCard(next) {
    if (!next) return null;
    var pct = KOS.hub.leafPercent(SID, next.id);
    return el("button", { type: "button", class: "k-subj-next", "data-ui": "study.continue", onclick: function () { KOS.show("ref", { subject: SID, ref: next.id }); } }, [
      el("span", { class: "k-subj-next-txt" }, [
        el("span", { class: "k-kicker", text: "Continue" }),
        el("span", { class: "k-subj-next-t" }, [el("span", { class: "k-mono", text: next.id }), next.title]),
        el("span", { class: "k-bar", role: "img", "aria-label": pct + "% from evidence", style: "--p: " + pct + "%; --bar-c: var(--subj-c)" }, [el("i")])
      ]),
      el("span", { class: "k-subj-next-go", "data-state": "lit", "aria-hidden": "true", text: "→" })
    ]);
  }
  function reworkRows(list, limit) {
    return list.slice(0, limit || list.length).map(function (r) {
      return el("div", { class: "k-day-row k-ja-rework-row", "data-ui": "ja.rework-row" }, [
        el("span", { class: "k-ja-lapses", text: r.lapses + "×" }),
        el("span", { class: "k-day-txt" }, [
          el("span", { class: "k-day-title", lang: "ja", text: r.item.w }),
          el("span", { class: "k-day-sub" }, [UI().skill(r.skill, { label: false }), " " + (r.item.r || "")])
        ])
      ]);
    });
  }
  function reworkCard() {
    var list = J().rework();
    var box = el("section", { class: "k-card k-ja-rework", "data-ui": "ja.rework", "aria-label": "Rework" }, [
      el("div", { class: "k-card-head" }, [
        el("span", { class: "k-card-title", text: "Rework" }),
        list.length ? el("span", { class: "k-card-meta", "data-tone": "ja", text: list.length + " slipping" }) : null,
        el("button", { type: "button", class: "k-link", text: "Skill map →", onclick: function () { KOS.show("japanese", { page: "skills" }); } })
      ].filter(Boolean))
    ]);
    if (!list.length) { box.appendChild(KOS.ui.emptyState({ compact: true, body: "Nothing keeps slipping right now." })); return box; }
    reworkRows(list, 4).forEach(function (r) { box.appendChild(r); });
    return box;
  }
  function nextStoneCard() {
    var tl = J().timeline(), next = tl.milestones.filter(function (m) { return !m.done; })[0];
    var box = el("section", { class: "k-card k-ja-stonecard", "data-ui": "ja.next-stone" }, [cardHead("Media path", "next stone", "Open →", function () { KOS.show("japanese", { page: "path" }); })]);
    if (!next) return box;
    box.appendChild(el("div", { class: "k-ja-stonecard-t" }, [el("b", { text: next.title }), el("span", { class: "k-mono", text: tl.calibrating ? "Calibrating" : next.unit === "kana" ? "" : UI().range(next.from, next.to) })]));
    requirementMeters(next).forEach(function (m) { box.appendChild(m); });
    return box;
  }
  function requirementMeters(m) {
    if (m.unit === "kana") {
      var j = J().peek(), hira = 0, kata = 0;
      Object.keys(j.facets).forEach(function (k) {
        var f = j.facets[k], p = KOS.jaSrs.split(k), ch = p.item.slice(2);
        if (p.kind !== "k" || p.skill !== "R" || ch.length !== 1 || !(f.reps && f.s >= KOS.jaSrs.HOLD)) return;
        if (/[\u3041-\u3096]/.test(ch)) hira++; else kata++;
      });
      return [UI().meter({ label: "Hiragana stable", value: Math.min(46, hira), target: 46 }), UI().meter({ label: "Katakana stable", value: Math.min(46, kata), target: 46 })];
    }
    return [UI().meter({ label: "Words", value: m.have, target: m.need })];
  }
  function inputCard(wi) {
    var box = el("section", { class: "k-card k-ja-input-card", "data-ui": "ja.input-week" }, [cardHead("Input this week", null, null)]);
    if (!wi.total) {
      box.appendChild(KOS.ui.emptyState({ compact: true, body: "Watching and reading in Japanese counts here, through Focus." }));
      return box;
    }
    box.appendChild(el("strong", { class: "k-ja-input-v", text: hmText(wi.total) }));
    [["Raw", wi.raw], ["JP subtitles", wi.jpSub], ["Reader", wi.read], ["Listening", wi.listen]].forEach(function (r) {
      if (r[1]) box.appendChild(el("div", { class: "k-ja-input-row" }, [el("span", { text: r[0] }), el("span", { class: "k-mono", text: hmText(r[1]) })]));
    });
    return box;
  }

  /* ======================================================================
     the space's pages: #/japanese/<page>
     ====================================================================== */
  KOS.views.japanese = function (main, arg) {
    arg = arg || {};
    KOS.shell.tree("none");   // the inner pages have no spine; a lesson page brings it back
    main.style.setProperty("--subj-c", "var(--ja)");
    var page = arg.page || "path";
    if (page === "session") {
      var id = arg.id || "reviews";
      KOS.jaRun.run(main, id.indexOf("learn-") === 0 ? { kind: "learn", lesson: id.slice(6) } : { kind: "reviews" });
      return;
    }
    if (page === "reviews") { spaceHead(main, "reviews", { title: "Reviews", sub: "Facets interleaved; each card names the skill it trains" }); reviewsPage(main); return; }
    if (page === "kana") { spaceHead(main, "kana", { title: "Kana", sub: "The day's set first: write it and read it, the chart below" }); kanaPage(main); return; }
    if (page === "skills") { spaceHead(main, "skills", { title: "Skill map", sub: "Reading, Listening, Writing and Speaking, tracked apart" }); skillsPage(main); return; }
    if (page === "checkpoints") { spaceHead(main, "checkpoints", { title: "Checkpoints", sub: "Four skill sections; each skill needs 80" }); checkpointsPage(main, arg.id); return; }
    if (page === "settings") { spaceHead(main, "settings", { title: "Japanese settings" }); settingsPage(main); return; }
    if (page === "licences") { spaceHead(main, "settings", { title: "Licences & credits" }); licencesPage(main); return; }
    spaceHead(main, "path", { title: "Media path", sub: "Milestones as stepping stones, each with what it needs and when it is likely" });
    pathPage(main, arg.id);
  };

  /* ---------------- 28g · reviews ---------------- */
  function reviewsPage(main) {
    var due = J().due();
    if (!due.length) {
      main.appendChild(KOS.ui.emptyState({ mark: "語", title: "Nothing due right now", body: "Reviews come back on their own schedule. Learn the next lesson, or drill kana." ,
        action: el("button", { type: "button", class: "k-btn", text: "Kana drill", onclick: function () { KOS.show("japanese", { page: "kana" }); } }) }));
      return;
    }
    var by = { R: 0, L: 0, W: 0, S: 0 };
    due.forEach(function (k) { var s = KOS.jaSrs.split(k).skill; if (by[s] != null) by[s]++; });
    main.appendChild(el("section", { class: "k-card k-ja-revstart", "data-ui": "ja.reviews-start" }, [
      el("div", { class: "k-ja-revstart-n" }, [el("strong", { text: String(due.length) }), el("span", { text: " due · ≈ " + Math.max(1, Math.round(J().planDay().reviews.min)) + " min" })]),
      el("div", { class: "k-ja-revstart-sk" }, Object.keys(by).filter(function (s) { return by[s]; }).map(function (s) { return el("span", {}, [UI().skill(s), " " + by[s]]); })),
      el("p", { class: "k-muted", text: "Two facets of one word never fall on the same day; the grade comes from your answer and the time taken." }),
      el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "ja.reviews-go", text: "▶ Start reviews",
        onclick: function () { KOS.show("japanese", { page: "session", id: "reviews" }); } })
    ]));
    main.appendChild(el("section", { class: "k-card k-ja-rules", "data-ui": "ja.grade-rules" }, [
      cardHead("How grades are derived", null, null),
      el("dl", { class: "k-ja-rules-dl" }, [["Correct, quick", "Easy"], ["Correct or Accepted", "Good"], ["Near, or a hint", "Hard"], ["Wrong", "Again · back tomorrow"]].map(function (r) {
        return el("div", {}, [el("dt", { text: r[0] }), el("dd", { text: r[1] })]);
      })),
      el("p", { class: "k-muted", text: "There are no grade buttons. Quick means inside the time for that kind of card." })
    ]));
  }

  /* ---------------- 28d · kana ---------------- */
  var ROWS = [["あ", "a"], ["か", "ka"], ["さ", "sa"], ["た", "ta"], ["な", "na"], ["は", "ha"], ["ま", "ma"], ["や", "ya"], ["ら", "ra"], ["わ", "wa"], ["ん", "n"]];
  var HIRA_COLS = ["あいうえお", "かきくけこ", "さしすせそ", "たちつてと", "なにぬねの", "はひふへほ", "まみむめも", "や ゆ よ", "らりるれろ", "わ   を", "ん"];
  function kanaState(ch) {
    var j = J().peek(), r = j.facets["k:" + ch + "|R"], w = j.facets["k:" + ch + "|W"];
    if (r && r.reps && r.s >= KOS.jaSrs.STABLE && w && w.reps && w.s >= KOS.jaSrs.STABLE) return "stable";
    if (r && r.reps && r.s >= KOS.jaSrs.STABLE) return "writing";
    if (r && r.reps) return "learning";
    return null;
  }
  function kanaSet() {
    /* the day's set: due kana facets, then the weakest learned ones — 30 at most, mixed */
    var j = J().peek(), due = J().due().filter(function (k) { return /^k:/.test(k); });
    var learned = Object.keys(j.facets).filter(function (k) { return /^k:/.test(k) && j.facets[k].reps && due.indexOf(k) < 0; })
      .sort(function (a, b) { return (j.facets[a].s || 0) - (j.facets[b].s || 0); });
    return due.concat(learned).slice(0, 30);
  }
  function kanaPage(main) {
    var ui = J().ui(), mode = ui.kanaMode || "mixed", set = kanaSet();
    var keys = set.filter(function (k) { var s = KOS.jaSrs.split(k).skill; return mode === "mixed" || (mode === "read" ? s === "R" : s === "W"); });
    var writeKeys = keys.filter(function (k) { return KOS.jaSrs.split(k).skill === "W"; }), readKeys = keys.filter(function (k) { return KOS.jaSrs.split(k).skill === "R"; });
    var results = [], last = [];
    var bar = el("section", { class: "k-card k-ja-setbar", "data-ui": "ja.kana-set" });
    var prog = el("span", { class: "k-mono" });
    function paintBar() { prog.textContent = results.length + " of " + keys.length; }
    bar.appendChild(el("div", { class: "k-ja-setbar-t" }, [el("span", { class: "k-kicker", text: "Kana set · today" }), el("b", { text: "Weak and slow kana, mixed" }), prog]));
    bar.appendChild(el("div", { class: "k-seg", role: "group", "aria-label": "Drill" }, [["mixed", "Mixed"], ["read", "Read"], ["write", "Write"]].map(function (m) {
      return el("button", { type: "button", class: "k-seg-item", "aria-pressed": String(mode === m[0]), text: m[1], onclick: function () { ui.kanaMode = m[0]; KOS.store.save(); KOS.rerender(); } });
    })));
    bar.appendChild(el("button", { type: "button", class: "k-btn", "data-ui": "ja.kana-end", text: "End set", onclick: endSet }));
    main.appendChild(bar);
    paintBar();
    function endSet() {
      if (!results.length) { KOS.rerender(); return; }
      var fin = J().finishSession(results);
      announce("Set done. " + results.length + " answered." + (fin.paid ? " +" + fin.paid + " XP." : ""));
      results = []; KOS.rerender();
    }
    var grid = el("div", { class: "k-ja-drills" });
    var wHost = el("div"), rHost = el("div");
    var wCard = el("section", { class: "k-card k-ja-drill", "data-ui": "ja.kana-write", "aria-label": "Write it" }, [el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Write it" }), UI().skill("W")]), wHost]);
    var rCard = el("section", { class: "k-card k-ja-drill", "data-ui": "ja.kana-read", "aria-label": "Read it" }, [el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Read it" }), UI().skill("R")]), rHost]);
    if (mode !== "read") grid.appendChild(wCard);
    if (mode !== "write") grid.appendChild(rCard);
    main.appendChild(grid);
    var wi = 0, ri = 0;
    function nextWrite() {
      wHost.innerHTML = "";
      if (wi >= writeKeys.length) { wHost.appendChild(KOS.ui.emptyState({ compact: true, body: writeKeys.length ? "Writing done for this set." : "No kana to write yet: learn a kana lesson first." })); return; }
      var ex = KOS.jaRun.exercise(writeKeys[wi]);
      KOS.jaRun.mount(wHost, ex, function (res) {
        var rec = J().record(ex.key, res); results.push({ key: ex.key, grade: rec.grade }); paintBar();
        wHost.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Next ›", onclick: function () { wi++; nextWrite(); } }));
      });
    }
    function lastSix() {
      var box = el("div", { class: "k-ja-last6", "data-ui": "ja.last-six" }, [el("span", { class: "k-kicker", text: "Last six" })]);
      last.slice(-6).forEach(function (r) { box.appendChild(el("span", { class: "k-ja-last6-i", "data-state": r.ok ? "ok" : "miss" }, [el("b", { lang: "ja", text: r.ch }), el("small", { class: "k-mono", text: r.ok ? (r.ms / 1000).toFixed(1) + " s" : "✗ " + r.r })])); });
      return box;
    }
    function nextRead() {
      rHost.innerHTML = "";
      if (ri >= readKeys.length) { rHost.appendChild(KOS.ui.emptyState({ compact: true, body: readKeys.length ? "Reading done for this set." : "No kana to read yet: learn a kana lesson first." })); if (last.length) rHost.appendChild(lastSix()); return; }
      var ex = KOS.jaRun.exercise(readKeys[ri]);
      KOS.jaRun.mount(rHost, ex, function (res) {
        var rec = J().record(ex.key, res); results.push({ key: ex.key, grade: rec.grade }); paintBar();
        var ok = res.verdict === "correct";
        if (ok) J().noteSpeed("kana", res.ms);
        last.push({ ch: ex.item.w, r: ex.item.r, ok: ok, ms: res.ms });
        announce(ex.item.w + ". " + (ok ? "Correct, " + (res.ms / 1000).toFixed(1) + " seconds." : "It reads " + ex.item.r + "."));
        rHost.appendChild(lastSix());
        rHost.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Next ›", onclick: function () { ri++; nextRead(); } }));
      });
    }
    if (mode !== "read") nextWrite();
    if (mode !== "write") nextRead();
    main.appendChild(kanaChart());
  }
  function kanaChart() {
    var ui = J().ui(), script = ui.kanaChart === "kata" ? "kata" : "hira";
    var conv = function (c) { return script === "kata" ? c.replace(/[\u3041-\u3096]/g, function (x) { return String.fromCharCode(x.charCodeAt(0) + 0x60); }) : c; };
    var counts = { stable: 0, writing: 0, learning: 0 };
    var cols = el("div", { class: "k-ja-chart-cols", role: "grid", "aria-label": (script === "kata" ? "Katakana" : "Hiragana") + " chart, columns read from the right" });
    HIRA_COLS.forEach(function (col) {
      var c = el("div", { class: "k-ja-chart-col", role: "row" });
      col.split("").forEach(function (ch) {
        if (ch === " ") { c.appendChild(el("span", { class: "k-ja-chart-cell", "data-state": "blank", "aria-hidden": "true" })); return; }
        var k = conv(ch), it = J().item("k:" + k), s = kanaState(k);
        if (s) counts[s]++;
        c.appendChild(el("span", { class: "k-ja-chart-cell", role: "gridcell", "data-state": s || "new", "aria-label": k + " " + (it ? it.r : "") + ": " + ({ stable: "stable", writing: "writing settling", learning: "learning" }[s] || "not started") },
          [el("b", { lang: "ja", text: k }), el("small", { text: it ? it.r : "" })]));
      });
      cols.appendChild(c);
    });
    var fl = J().fluency();
    return el("div", { class: "k-ja-chartrow" }, [
      el("section", { class: "k-card k-ja-chart", "data-ui": "ja.kana-chart" }, [
        el("div", { class: "k-card-head" }, [
          el("span", { class: "k-card-title", text: "Chart" }),
          el("span", { class: "k-seg k-seg--quiet", role: "group", "aria-label": "Script" }, [["hira", "Hiragana"], ["kata", "Katakana"]].map(function (m) {
            return el("button", { type: "button", class: "k-seg-item", "aria-pressed": String(script === m[0]), text: m[1], onclick: function () { ui.kanaChart = m[0]; KOS.store.save(); KOS.rerender(); } });
          })),
          el("span", { class: "k-ja-legend" }, [["stable", "stable"], ["writing", "writing settling"], ["learning", "learning"]].map(function (l) {
            return el("span", { "data-state": l[0] }, [el("i", { "aria-hidden": "true" }), l[1]]);
          }))
        ]),
        cols,
        el("p", { class: "k-muted", text: "Columns read from the right, あ-row first. A dash is a sound modern Japanese doesn't use (yi, ye, wu…), so the gaps are part of the chart." })
      ]),
      el("section", { class: "k-card k-ja-chartcounts", "data-ui": "ja.kana-counts" }, [
        cardHead(script === "kata" ? "Katakana" : "Hiragana", null, null),
        el("dl", { class: "k-ja-dl" }, [
          ["Stable", counts.stable + " of 46"], ["Writing settling", String(counts.writing)], ["Learning", String(counts.learning)],
          ["Recognition", fl.kanaMs ? (fl.kanaMs / 1000).toFixed(1) + " s median" : "—"],
          ["Look-alikes", script === "kata" ? "シ/ツ · ソ/ン · ク/ケ" : "ぬ/め · ね/れ/わ · さ/ち"]
        ].map(function (r) { return el("div", {}, [el("dt", { text: r[0] }), el("dd", { lang: "ja", text: r[1] })]); }))
      ])
    ]);
  }

  /* ---------------- 28c · the skill map ---------------- */
  function skillsPage(main) {
    var j = J().peek(), sp = skillPcts();
    var table = el("div", { class: "k-ja-skilltab", role: "table", "aria-label": "Units by skill" }, [
      el("div", { class: "k-ja-skilltab-r k-ja-skilltab-h", role: "row" }, ["Unit", "Reading", "Listening", "Writing", "Speaking"].map(function (h) { return el("span", { role: "columnheader", text: h }); }))
    ]);
    (window.KOS_JA.STAGES || []).forEach(function (stg) {
      stg.units.forEach(function (u) {
        var us = J().unitState(u.id), items = [];
        u.lessons.forEach(function (id) { items = items.concat(J().lesson(id).items); });
        function pct(s) {
          var have = items.filter(function (k) { return KOS.jaSrs.facetsFor(k, j.facets).indexOf(s) >= 0; });
          if (!have.length) return null;
          var st = have.filter(function (k) { var f = j.facets[k + "|" + s]; return f && f.reps && f.s >= KOS.jaSrs.STABLE; }).length;
          return Math.round(100 * st / have.length);
        }
        table.appendChild(el("div", { class: "k-ja-skilltab-r", role: "row", "data-state": us.state }, [
          el("span", { role: "cell", class: "k-ja-skilltab-u" }, [el("b", { class: "k-mono", text: u.id }), " " + u.name, el("small", { text: stg.name === "Kana" ? "Stage 0" : us.state === "later" ? "Recommended later" : us.done + " of " + us.total + " lessons" })])
        ].concat(["R", "L", "W", "S"].map(function (s) {
          var v = pct(s);
          return el("span", { role: "cell", class: "k-ja-skilltab-c" }, v == null ? [el("span", { class: "k-muted", text: "—" })]
            : [UI().skill(s, { label: false }), el("span", { class: "k-bar", role: "img", "aria-label": UI().SKILL[s] + " " + v + "%", style: "--p: " + v + "%; --bar-c: var(--subj-c)" }, [el("i")]), el("span", { class: "k-mono", text: String(v) })]);
        }))));
      });
    });
    var fl = J().fluency(), tl = J().timeline();
    var left = el("div", { class: "k-ja-col" }, [
      el("section", { class: "k-card", "data-ui": "ja.skill-units" }, [cardHead("By unit", "% of the unit's items stable in that skill; 80 is the checkpoint line", null), table,
        el("p", { class: "k-muted", text: "Kana have no Listening or Speaking facet of their own." })]),
      (function () {
        var list = J().rework();
        var box = el("section", { class: "k-card k-ja-rework", "data-ui": "ja.rework" }, [cardHead("Rework", list.length ? "items that keep slipping · " + list.length : null, null)]);
        if (!list.length) box.appendChild(KOS.ui.emptyState({ compact: true, body: "Nothing keeps slipping right now." }));
        else reworkRows(list).forEach(function (r) { box.appendChild(r); });
        box.appendChild(el("p", { class: "k-muted", text: "Rework teaches the item again from its own lesson. It is not a penalty and has no reward." }));
        return box;
      })()
    ]);
    var side = el("div", { class: "k-ja-side" }, [
      el("section", { class: "k-card k-ja-shape", "data-ui": "ja.radar-card" }, [cardHead("Shape", tl.calibrating ? "calibrating" : "now", null),
        UI().radar({ values: sp.pct, calibrating: tl.calibrating }),
        tl.calibrating ? el("p", { class: "k-muted", text: "The shape appears once each skill has a week of results." }) : null].filter(Boolean)),
      el("section", { class: "k-card", "data-ui": "ja.fluency" }, [cardHead("Fluency", null, null),
        el("dl", { class: "k-ja-dl" }, [
          ["Recognition", fl.kanaMs ? (fl.kanaMs / 1000).toFixed(1) + " s / kana · kana drill, median" : "Drill kana to time it"],
          ["Reading speed", "Time a reading in the reader (Stage 1)"]
        ].map(function (r) { return el("div", {}, [el("dt", { text: r[0] }), el("dd", { text: r[1] })]); }))])

    ]);
    main.appendChild(el("div", { class: "k-ja-twocol" }, [left, side]));
  }

  /* ---------------- 28b · the media path ---------------- */
  function pathPage(main, sel) {
    var tl = J().timeline(), next = tl.milestones.filter(function (m) { return !m.done; })[0];
    var chosen = tl.milestones.filter(function (m) { return m.id === sel; })[0] || next || tl.milestones[0];
    main.appendChild(el("section", { class: "k-card k-ja-pathbig" }, [UI().mediaPath(tl, { large: true, selected: chosen.id,
      onSelect: function (id) { KOS.show("japanese", { page: "path", id: id }); var m = tl.milestones.filter(function (x) { return x.id === id; })[0];
        if (m) announce(m.title + ". " + Math.round(100 * m.have / m.need) + "% there." + (tl.calibrating ? "" : m.from ? " Projected " + UI().range(m.from, m.to) + "." : "")); } })]));
    var pct = Math.min(100, Math.round(100 * chosen.have / Math.max(1, chosen.need)));
    var detail = el("section", { class: "k-card k-ja-stonedetail", "data-ui": "ja.stone-detail" }, [
      el("div", { class: "k-ja-stonedetail-h" }, [el("span", { class: "k-kicker", text: chosen.done ? "Reached" : chosen === next ? "Next stone" : "Later stone" }),
        el("span", { class: "k-chip", style: "--chip-c: var(--subj-c)", text: chosen.done ? "Done" : tl.calibrating ? "Calibrating" : pct + "% there" })]),
      el("h2", { text: chosen.title }),
      tl.calibrating && !chosen.done ? el("p", { class: "k-muted", text: "A date appears after two weeks of sessions. Until then, the requirements show what it needs." })
        : !chosen.done && chosen.unit !== "kana" ? el("p", { class: "k-ja-range" }, [el("b", { class: "k-mono", text: UI().range(chosen.from, chosen.to) }), el("small", { text: " projected · a range from your pace, never one date" })]) : null
    ].filter(Boolean));
    requirementMeters(chosen).forEach(function (m) { detail.appendChild(m); });
    var levers = el("section", { class: "k-card k-ja-levers", "data-ui": "ja.levers" }, [cardHead("What moves this date most", null, null)]);
    if (tl.calibrating) levers.appendChild(KOS.ui.emptyState({ compact: true, body: "Levers appear with a date." }));
    else {
      [["+10 min a day", "more new words each week"], ["Reviews on time", "keeps new words flowing"], ["Watching in Japanese", "words met outside the app count"]].forEach(function (l) {
        levers.appendChild(el("div", { class: "k-ja-lever" }, [el("b", { text: l[0] }), el("span", { class: "k-muted", text: l[1] })]));
      });
      levers.appendChild(el("p", { class: "k-muted", text: "Nothing here changes your plan unless you choose it in Settings › Daily minutes." }));
    }
    main.appendChild(el("div", { class: "k-ja-twocol" }, [el("div", { class: "k-ja-col" }, [detail]), el("div", { class: "k-ja-side" }, [levers])]));
    main.appendChild(el("section", { class: "k-card", "data-ui": "ja.stones-all" }, [cardHead("All stones", tl.perWeek ? "about " + tl.perWeek.mid + " new words a week" : null, null),
      el("ul", { class: "k-ja-stonelist" }, [el("li", { class: "k-ja-stonelist-h", "aria-hidden": "true" }, [el("span", { text: "Stone" }), el("span", { text: "Requirements met" }), el("span", { text: "Likely" })])]
        .concat(tl.milestones.map(function (m) {
        var pct = Math.min(100, Math.round(100 * m.have / Math.max(1, m.need)));
        return el("li", { "data-state": m.done ? "done" : null }, [el("span", { text: (m.done ? "✓ " : "") + m.title }),
          el("span", { class: "k-ja-stonelist-p" }, [el("span", { class: "k-bar", role: "img", "aria-label": pct + "% of the requirements", style: "--p: " + pct + "%; --bar-c: var(--subj-c)" }, [el("i")]),
            el("span", { class: "k-mono", text: pct + "%" })]),
          el("span", { class: "k-mono", text: m.done ? "Done" : tl.calibrating ? "Calibrating" : UI().range(m.from, m.to) })]);
      })))]));
  }

  /* ---------------- 28j · checkpoints ---------------- */
  function checkpointsPage(main, run) {
    if (run) { checkpointRun(main, run); return; }
    var cps = window.KOS_JA.CHECKPOINTS || {};
    var list = el("div", { class: "k-ja-cplist" });
    Object.keys(cps).forEach(function (id) {
      var cp = cps[id], state = J().checkpointState(id), rec = J().peek().checkpoints[id] || {}, isNext = state === "next";
      list.appendChild(el("section", { class: "k-card k-ja-cp-card", "data-ui": "ja.checkpoint", "data-state": state }, [
        el("div", { class: "k-ja-cp-h" }, [
          el("div", {}, [el("span", { class: "k-kicker", text: "Stage 0 checkpoint" }), el("h2", { text: cp.title })]),
          state === "passed" ? UI().seal({ label: cp.title + " passed" }) : null
        ].filter(Boolean)),
        rec.scores ? el("div", { class: "k-ja-cp-rows" }, cp.skills.map(function (s) { return skillRow(s, rec.scores[s] || 0); })) : el("p", { class: "k-muted", text: cp.skills.map(function (s) { return UI().SKILL[s]; }).join(", ") + " · about 10 minutes" }),
        state === "passed" && rec.passAt ? el("p", { class: "k-ja-pay", text: "Passed on " + dayLabel(isoOf(rec.passAt)) + (rec.paidAt ? " · ◆ paid once" : "") }) : null,
        el("button", { type: "button", class: isNext ? "k-btn k-btn--primary" : "k-btn", "data-intent": isNext ? "primary" : null, "data-ui": "ja.checkpoint-start",
          text: state === "passed" ? "Take it again" : state === "next" ? "▶ Start the checkpoint" : "Open (recommended later)",
          onclick: function () { KOS.show("japanese", { page: "checkpoints", id: id }); } })
      ].filter(Boolean)));
    });
    main.appendChild(list);
    main.appendChild(el("section", { class: "k-card k-ja-pathcard" }, [UI().stagePath({ compact: true, onUnit: openUnit })]));
  }
  function skillRow(s, v) {
    var pct = Math.round(100 * v), pass = v >= J().PASS;
    return el("div", { class: "k-ja-cp-row", "data-ui": "ja.skill-row", "aria-label": UI().SKILL[s] + ", " + pct + " percent, " + (pass ? "pass" : "not yet") + ", line at 80" }, [
      UI().skill(s),
      el("span", { class: "k-ja-cp-bar" }, [el("span", { class: "k-bar", "aria-hidden": "true", style: "--p: " + pct + "%; --bar-c: var(--subj-c)" }, [el("i")]), el("i", { class: "k-ja-cp-line", "aria-hidden": "true" })]),
      el("span", { class: "k-mono", text: pct + "%" }),
      el("span", { class: "k-ja-cp-v", "data-tone": pass ? "pass" : "fail", text: pass ? "✓ Pass" : "✗ Not yet" })
    ]);
  }
  /* a checkpoint: sections in order, each a short set; scored, then recorded once (pays once) */
  function checkpointRun(main, id) {
    var cp = (window.KOS_JA.CHECKPOINTS || {})[id]; if (!cp) { KOS.show("japanese", { page: "checkpoints" }); return; }
    var unit = null; (window.KOS_JA.STAGES || []).forEach(function (st) { st.units.forEach(function (u) { if (u.id === cp.unit) unit = u; }); });
    var items = []; unit.lessons.forEach(function (l) { items = items.concat(J().lesson(l).items); });
    var single = items.filter(function (k) { return k.length === 3; }), sounds = items.filter(function (k) { return /^s:/.test(k); });
    function pick(list, n, seed) { var a = list.slice(); for (var i = a.length - 1; i > 0; i--) { var j = (seed * (i + 7)) % (i + 1); var t = a[i]; a[i] = a[j]; a[j] = t; } return a.slice(0, n); }
    var seed = Date.parse(today()) / 864e5 | 0;
    var sections = [];
    if (cp.skills.indexOf("R") >= 0) sections.push({ s: "R", keys: pick(single, 12, seed).map(function (k) { return k + "|R"; }) });
    if (cp.skills.indexOf("W") >= 0) sections.push({ s: "W", keys: pick(single, 8, seed + 3).map(function (k) { return k + "|W"; }) });
    if (cp.skills.indexOf("L") >= 0) sections.push({ s: "L", keys: (sounds.length ? sounds.concat(sounds) : pick(["s:long", "s:sokuon", "s:voicing"], 3, seed)).slice(0, 6).map(function (k) { return k + "|L"; }) });
    var scores = {}, si = 0, qi = 0, right = 0;
    var box = el("section", { class: "k-card k-ja-run", "data-ui": "ja.checkpoint-run", "aria-label": cp.title });
    var head = el("div", { class: "k-ja-run-head" }, [el("button", { type: "button", class: "k-iconbtn", "aria-label": "Leave the checkpoint", text: "✕", onclick: function () { KOS.show("japanese", { page: "checkpoints" }); } }),
      el("span", { class: "k-ja-run-t", text: cp.title }), el("span", { class: "k-mono k-ja-run-n" })]);
    var stage = el("div", { class: "k-ja-run-stage" });
    box.appendChild(head); box.appendChild(stage); main.appendChild(box);
    function step() {
      var sec = sections[si];
      if (!sec) return result();
      if (qi >= sec.keys.length) { scores[sec.s] = right / Math.max(1, sec.keys.length); si++; qi = 0; right = 0; return step(); }
      head.lastChild.textContent = UI().SKILL[sec.s] + " · " + (qi + 1) + " / " + sec.keys.length;
      stage.innerHTML = "";
      var host = el("div", { class: "k-ja-run-host" });
      stage.appendChild(host);
      var ex = KOS.jaRun.exercise(sec.keys[qi]);
      if (!ex) { qi++; return step(); }
      KOS.jaRun.mount(host, ex, function (res) {
        if (res.verdict === "correct" || res.verdict === "accepted") right++;
        host.appendChild(el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Next ›", onclick: function () { qi++; step(); } }));
      });
    }
    function result() {
      var out = J().recordCheckpoint(id, scores);
      stage.innerHTML = ""; head.lastChild.textContent = "";
      var weak = out.weak.map(function (s) { return UI().SKILL[s]; });
      stage.appendChild(el("div", { class: "k-ja-cp-result", "data-ui": "ja.checkpoint-result" }, [
        el("h2", { text: out.pass ? "Passed." : weak.join(" and ") + " not yet at 80." }),
        el("div", { class: "k-ja-cp-rows" }, cp.skills.map(function (s) { return skillRow(s, scores[s] || 0); })),
        out.pass ? UI().seal({ label: cp.title + " passed" }) : el("p", { class: "k-muted", text: "Each skill needs 80. Practise " + weak.join(" and ") + " in Kana, then take this again. Nothing else waits on it." }),
        out.paid ? el("p", { class: "k-ja-pay", "data-ui": "ja.pay", text: "◆ +" + out.pay.xp + " XP · +" + out.pay.gold + " gold · +" + out.pay.hp + " HP · paid once" }) : null,
        el("button", { type: "button", class: "k-btn", text: "Back to checkpoints", onclick: function () { KOS.show("japanese", { page: "checkpoints" }); } })
      ].filter(Boolean)));
      announce("Checkpoint result. " + cp.skills.map(function (s) { return UI().SKILL[s] + " " + Math.round(100 * (scores[s] || 0)) + ", " + ((scores[s] || 0) >= J().PASS ? "pass" : "not yet"); }).join(". ") + ".");
    }
    step();
  }

  /* ---------------- 28m · settings and 28k · the speech opt-in ---------------- */
  function settingsPage(main) {
    var st = J().peek().settings, saved = el("span", { class: "k-muted", "aria-live": "off" });
    function savedNote() { saved.textContent = "Saved"; announce("Saved."); setTimeout(function () { saved.textContent = ""; }, 2000); }
    var furi = el("div", { class: "k-seg", role: "radiogroup", "aria-label": "Furigana" }, [["all", "All"], ["unknown", "Unknown only"], ["none", "None"]].map(function (m) {
      return el("button", { type: "button", role: "radio", class: "k-seg-item", "aria-checked": String(st.furigana === m[0]), "aria-pressed": String(st.furigana === m[0]), text: m[1],
        onclick: function () { J().setSettings({ furigana: m[0] }); savedNote(); KOS.rerender(); } });
    }));
    var minutes = el("input", { type: "range", min: "20", max: "90", step: "5", class: "k-range", "data-ui": "ja.daily-min", "aria-label": "Daily minutes" });
    minutes.value = String(st.dailyMin);
    var minOut = el("b", { class: "k-mono", text: st.dailyMin + " min" });
    minutes.addEventListener("input", function () { minOut.textContent = minutes.value + " min"; });
    minutes.addEventListener("change", function () { J().setSettings({ dailyMin: +minutes.value }); savedNote(); });
    var speech = el("button", { type: "button", class: "k-switch", role: "switch", "aria-checked": String(st.speech), "data-ui": "ja.speech-switch", "aria-label": "Speaking practice",
      onclick: function () { if (st.speech) { J().setSettings({ speech: false }); announce("Speaking turned off."); KOS.rerender(); } else speechOptIn(function () { KOS.rerender(); }); } }, [el("span")]);
    function row(label, sub, ctl) { return el("div", { class: "k-ja-set-row" }, [el("div", {}, [el("b", { text: label }), sub ? el("small", { text: sub }) : null].filter(Boolean)), ctl]); }
    var left = el("section", { class: "k-card k-ja-settings", "data-ui": "ja.settings" }, [
      cardHead("Japanese settings", null, null), saved,
      row("Furigana", "by Reading mastery", furi),
      row("Daily minutes", "the session is computed to this, 20–90", el("span", { class: "k-ja-range" }, [minutes, minOut])),
      row("Voices", "one voice per character", el("ul", { class: "k-ja-voices" }, ["akari", "yota", "narrator"].map(function (w) {
        var c = UI().CAST[w];
        return el("li", {}, [el("span", { class: "k-ja-who-i", lang: "ja", "aria-hidden": "true", text: c.initial }), c.name + " · " + (window.KOS_JA_AUDIO ? "pre-rendered" : "browser voice until the audio packs arrive")]);
      }))),
      row("Speech", "Chrome's recogniser · sends each take to Google", el("span", { class: "k-ja-speech" }, [speech,
        el("button", { type: "button", class: "k-link", text: "What is sent", onclick: function () { speechOptIn(null, true); } })]))
    ]);
    var right = el("section", { class: "k-card", "data-ui": "ja.licences-card" }, [cardHead("Licences & credits", null, "Open →", function () { KOS.show("japanese", { page: "licences" }); }),
      el("p", { class: "k-muted", text: "Stroke order data, voices and art: who made them and under what licence." })]);
    main.appendChild(el("div", { class: "k-ja-twocol" }, [el("div", { class: "k-ja-col" }, [left]), el("div", { class: "k-ja-side" }, [right])]));
  }
  function licencesPage(main) {
    var rows = [
      ["KanjiVG", "CC BY-SA 3.0", "Stroke order data for kanji and kana. Ulrich Apel. Used unchanged for the stroke checks and the stroke-order animation."],
      ["JMdict", "CC BY-SA 4.0", "Japanese–English dictionary. Electronic Dictionary Research and Development Group. Arrives with Stage 1's words."],
      ["KANJIDIC2", "CC BY-SA 4.0", "Kanji readings and meanings. Electronic Dictionary Research and Development Group. Arrives with Stage 1."],
      ["Tatoeba", "CC BY 2.0 FR", "Example sentences and their translations, with sentence numbers kept. Arrives with Stage 1."],
      ["Tadoku graded readers", "as each book states", "Free readers by NPO Tadoku Supporters, shown unchanged. Arrive with the reader."]
    ];
    main.appendChild(el("section", { class: "k-card k-ja-credits", "data-ui": "ja.licences" }, [
      el("dl", { class: "k-ja-credit-dl" }, rows.map(function (r) { return el("div", {}, [el("dt", {}, [el("b", { text: r[0] }), el("span", { class: "k-chip", text: r[1] })]), el("dd", { text: r[2] })]); })),
      el("h2", { class: "k-kicker", text: "Voices" }),
      el("dl", { class: "k-ja-credit-dl" }, [["Shiraishi Akari 白石 灯", "ElevenLabs · a voice designed for the character"], ["Asahi Yōta 朝日 陽太", "ElevenLabs · a voice designed for the character"], ["Narrator", "VOICEVOX · its speaker's credit line, as VOICEVOX requires"]].map(function (r) {
        return el("div", {}, [el("dt", { lang: "ja", text: r[0] }), el("dd", { text: r[1] })]);
      })),
      el("p", { class: "k-muted", text: "Until the audio packs are on this device, lines are read by the browser's own Japanese voice and marked synthetic voice." }),
      el("h2", { class: "k-kicker", text: "Art" }),
      el("p", { text: "Character sprites, backgrounds and manga panels were made with AI image tools. Balloon text, lettering and layout are set live by the app." })
    ]));
  }
  /* 28k: the opt-in — says plainly what goes to Google; focus starts on Not now */
  function speechOptIn(onDone, readOnly) {
    var notNow = el("button", { type: "button", class: "k-btn", text: readOnly ? "Close" : "Not now" });
    var on = readOnly ? null : el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Turn on speaking" });
    var title = el("h2", { class: "k-dialog-title", text: readOnly ? "What is sent" : "Turn on speaking practice?" });
    var box = el("div", { class: "k-dialog k-ja-optin", "data-ui": "ja.speech-optin" }, [
      el("div", { class: "k-dialog-mark", lang: "ja", "aria-hidden": "true", text: "声" }), title,
      el("p", { text: "Speaking is optional. Everything else works without it. To check a spoken sentence, KurenaiOS uses Chrome's speech recogniser, which sends the recording to Google to turn it into text." }),
      el("div", { class: "k-ja-sent" }, [
        el("div", {}, [el("span", { class: "k-kicker", text: "What is sent, and when" }), el("ul", {}, [el("li", { text: "The audio of one take, only while the red Recording state shows" }), el("li", { text: "The language code ja-JP" })])]),
        el("div", {}, [el("span", { class: "k-kicker", text: "What is not sent" }), el("ul", {}, [el("li", { text: "Your name, account or progress" }), el("li", { text: "Any other recording, text or screen" })])])
      ]),
      el("p", { class: "k-muted", text: "The text that comes back is kept here. Your recordings stay on this device. Speaking checks only whether a sentence would be understood: long vowels, small っ and voicing are trained in dictation, minimal pairs and shadowing." }),
      el("div", { class: "k-dialog-foot" }, [el("span"), notNow, on].filter(Boolean))
    ]);
    var overlay = el("div", { class: "k-dialog-overlay" }, [box]);
    var closed = false;
    function close() { if (closed) return; closed = true; overlay.remove(); if (onDone) onDone(); }
    overlay.close = close;            /* Escape = Not now (openDialog calls it) */
    notNow.onclick = close;
    if (on) on.onclick = function () { J().setSettings({ speech: true }); announce("Speaking turned on."); close(); };
    KOS.ui.openDialog(overlay, { labelledBy: title, initialFocus: notNow });
  }

  KOS.jaPages = { speechOptIn: speechOptIn, skillPcts: skillPcts };
})();
