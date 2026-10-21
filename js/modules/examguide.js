/* Kurenai OS — modules/examguide.js
   The Exams hub's Companion tab (roadmap 5.8 phase 5), drawn to design
   turn 29:
     the guide (29o)            an assessment's scope as one long guide:
                                key notes, command words, booklet or
                                memorise, traps, labs, exam items, the
                                cram deck and the rapid drill; for a real
                                exam or a mock, the question shapes too
     trend and likelihood (29s) the board paper's evidence, caveat first
     the rapid drill (§13.1)    15 questions, self-marked
     the playbook drawer (29r)  per board, from any assessment
     the revision pack (29ac)   the Companion for a scope, on paper
     Exams settings (29ac)      extra time, large print, rest breaks
   Everything is READ from KOS.examCompanion; the only writes are clicks:
   the settings, and a section marked read (per device).                  */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function E() { return KOS.exams; }
  function U() { return KOS.examUI; }
  function C() { return KOS.examCompanion; }
  function today() { return KOS.srs.todayISO(); }
  function html(tag, cls, str) { var n = el(tag, { class: cls }); n.innerHTML = str; return n; }
  function inline(text) { return KOS.content && KOS.content.inline ? KOS.content.inline(String(text || "")) : KOS.ui.esc(String(text || "")); }
  function typeset(node) { if (KOS.content && KOS.content.typeset) { try { KOS.content.typeset(node); } catch (e) { /* KaTeX not loaded */ } } return node; }
  function blocks(list) { return KOS.content && KOS.content.renderBlocks ? KOS.content.renderBlocks(list || []) : ""; }

  /* the assessments a Companion is built for: ahead, not a deadline */
  function guided() { return E().upcoming().filter(function (a) { return a.tier !== "deadline"; }); }
  function picker(list, cur, go) {
    var u = U();
    var tabs = KOS.ui.tabs(list.map(function (a) {
      return { label: a.title, dot: u.hueOf(a), active: a.id === cur, onSelect: function () { if (a.id !== cur) go(a); } };
    }), { variant: "workspace", label: "Assessment", edge: true });
    tabs.setAttribute("data-ui", (tabs.getAttribute("data-ui") || "") + " exams.picker");
    return tabs;
  }
  /* sections read, per device (a section counts once its end has been
     on screen for 3 seconds; never by a render) */
  function readOf(aid) { var r = (KOS.store.state.ui.examGuideRead || {})[aid]; return r && typeof r === "object" ? r : {}; }
  function markRead(aid, sec) {
    var ui = KOS.store.state.ui, all = ui.examGuideRead = ui.examGuideRead || {};
    var r = all[aid] = all[aid] || {};
    if (r[sec]) return false;
    r[sec] = 1;
    KOS.store.save();
    return true;
  }

  /* ================= the hub tab ================= */
  function hub(main, sub) {
    var list = guided(), a = (sub && E().get(sub)) || list[0] || null;
    if (a && list.indexOf(a) === -1) list = [a].concat(list);
    U().head(main, "guide", { right: list.length ? picker(list.slice(0, 8), a && a.id, function (x) { KOS.show("exams", { tab: "guide", sub: x.id }); U().announce("Companion for " + x.title + "."); }) : null });
    if (!a) {
      main.appendChild(KOS.ui.emptyState({ mark: "導", title: "Add an assessment to build its Companion", body: "A real exam, a mock, a topic test or a quiz with a scope.",
        action: U().btn("＋ New assessment", "primary", function () { U().editor(null, {}, function (x) { KOS.show("exams", { tab: "guide", sub: x.id }); }); }) }));
      return;
    }
    guidePage(main, a);
  }
  /* an assessment's own Companion pages: guide, trend, paper */
  function page(main, a, tab, sub) {
    if (tab === "trend") return trendPage(main, a);
    if (tab === "paper" && KOS.examPaperView) return KOS.examPaperView.page(main, a, sub);
    hub(main, a.id);
  }

  /* ================= the guide (29o) ================= */
  function guidePage(main, a) {
    var u = U(), g = C().guide(a), rd = E().readiness(a), board = g.board;
    if (a.subject) main.style.setProperty("--accent", u.HUE[a.subject]);
    var wrap = el("div", { class: "k-ex-page k-ex-guide", "data-ui": "exams.guide", style: "--s: " + u.hueOf(a) });
    main.appendChild(wrap);
    var big = a.tier === "real_exam" || a.tier === "mock";
    var read = readOf(a.id), nRead = g.sections.filter(function (s) { return read[s.id]; }).length;
    var rc = rd && rd.signals && rd.signals.recall;
    var days = E().daysTo(a);
    var deep = KOS.examDeep && KOS.examDeep.paperOf(a) && KOS.examDeepView ? KOS.examDeepView.guideSection(a) : null;
    /* the hero */
    var acts = [
      u.btn("Start the rapid drill · 15", "primary", function () { drillDialog(a); }, { "data-ui": "exams.drill-start" }),
      g.cram && g.cram.cards ? u.btn("Cram " + (g.cram.due || Math.min(g.cram.cards, 40)) + " cards", "", function () { KOS.show("review", { tab: "due", run: "scope:" + a.id }); }, { "data-ui": "exams.cram" }) : null,
      deep ? u.btn("Full Companion", "", function () { KOS.show("exams", { id: a.id, tab: "deep" }); }, { "data-ui": "exams.deep-hero-open" }) : null,
      big ? u.btn(deep ? "Predicted paper" : "Practice paper", "", function () { KOS.show("exams", { id: a.id, tab: "paper", sub: "1" }); }, { "data-ui": "exams.paper-open" }) : null,
      board ? u.btn("Playbook · " + board, "quiet", function () { openPlaybook(board, a); }, { "data-ui": "exams.playbook-open" }) : null
    ].filter(Boolean);
    var dots = el("span", { class: "k-ex-readdots", "aria-hidden": "true" }, g.sections.map(function (s) { return el("i", { "data-on": read[s.id] ? "" : null }); }));
    var hero = el("section", { class: "k-ex-ghero", "data-ui": "exams.ghero" }, [
      el("span", { class: "k-ex-hero-mark", "aria-hidden": "true", lang: "ja", text: "導" }),
      el("div", { class: "k-ex-ghero-mid" }, [
        el("div", { class: "k-ex-inline" }, [u.tierChip(a.tier, true), u.eyebrow("The guide · " + (a.date ? u.pretty(a.date) : "no date") + (days != null && days >= 0 ? " · " + u.plural(days, "day") : ""))]),
        el("h1", { class: "k-ex-ghero-title", text: a.title + (big ? ": the Companion" : ": everything the test can ask") }),
        el("p", { class: "k-ex-ghero-line", text: "Assembled from the notes, cards and items of " + u.plural(g.leaves, "leaf", "leaves") +
          (g.commands.length ? ", " + u.plural(g.commands.length, "command word") : "") + (g.traps.length ? ", " + u.plural(Math.min(g.traps.length, 99), "trap") : "") +
          ". Read it top to bottom once, then use the drill and the cram deck." }),
        el("div", { class: "k-ex-actions" }, acts),
        el("div", { class: "k-ex-inline k-ex-small" }, [dots, u.muted(nRead + " of " + g.sections.length + " sections read")])
      ]),
      rc && !rc.thin ? u.ringEl(rc.value, 164, u.hueOf(a), [el("span", { class: "k-ex-ring-fig", text: Math.round(100 * rc.value) + "%" }), u.muted(rc.today ? "recall today" : "recall on " + u.pretty(rc.on, { dow: false }))], rd.target)
        : el("div", { class: "k-ex-ghero-side" }, [u.quiet(rc ? rc.why : "No recall signal at this tier", rc ? rc.sub : null)])
    ]);
    wrap.appendChild(hero);
    /* the section index (follows the scroll; a click jumps) */
    var heads = {};
    var index = el("nav", { class: "k-ex-gindex", "aria-label": "Sections", "data-ui": "exams.gindex" }, g.sections.map(function (s, i) {
      return el("button", { type: "button", class: "k-ex-gindex-b", "data-sec": s.id, onclick: function () {
        var h = heads[s.id];
        if (h) { h.scrollIntoView({ behavior: "smooth", block: "start" }); h.focus({ preventScroll: true }); u.announce("Section " + (i + 1) + ", " + s.title + "."); }
      } }, [el("span", { class: "k-mono", text: pad2(i + 1) }), s.title]);
    }));
    wrap.appendChild(KOS.ui.scroller ? KOS.ui.scroller(index, { keepRole: true }) : index);
    var n = 0;
    function section(id, title, sub, act, body, cls) {
      var h = el("h2", { class: "k-ex-gsec-title", tabindex: "-1", text: title });
      heads[id] = h;
      var end = el("span", { class: "k-ex-gsec-end", "aria-hidden": "true" });
      var c = el("section", { class: "k-card k-ex-card k-ex-gsec" + (cls ? " " + cls : ""), "data-ui": "exams.gsec", "data-sec": id }, [
        el("div", { class: "k-ex-gsec-head" }, [el("span", { class: "k-mono k-ex-muted", text: pad2(++n) }), h, sub ? u.muted(sub) : null, el("span", { class: "k-ex-grow" }), act || null].filter(Boolean)),
        body, end]);
      watchRead(a.id, id, end);
      return c;
    }
    g.sections.forEach(function (s) {
      if (s.id === "notes") wrap.appendChild(section("notes", "Key notes", u.plural(g.tiles.length, "leaf", "leaves") + " · from your notes", null, notesBody(g, big)));
      if (s.id === "commands") wrap.appendChild(section("commands", "Command words", "the " + (g.commands.length === 1 ? "one" : g.commands.length) + " that appear in this scope", board ? U().linkBtn("All of " + board + "'s ›", function () { openPlaybook(board, a, "commands"); }) : null, commandsBody(g)));
      if (s.id === "booklet") wrap.appendChild(bookletRow(g, section));
      if (s.id === "traps") wrap.appendChild(section("traps", "Traps", "from examiner's reports and your notes", null, trapsBody(g)));
      if (s.id === "labs") wrap.appendChild(section("labs", "Labs", u.plural(g.labs.length, "lab") + ", from the lab system", null, labsBody(g)));
      if (s.id === "items") {
        if (deep) wrap.appendChild(section("shapes", "Question shapes, worked", "the full Companion: every shape of this paper in your scope, most frequent first", U().linkBtn("Trend and likelihood ›", function () { KOS.show("exams", { id: a.id, tab: "trend" }); }), deep));
        else if (big) { var sh = shapesBody(a); if (sh) wrap.appendChild(section("shapes", "Question shapes", "the archetypes of this paper in your scope", U().linkBtn("Trend and likelihood ›", function () { KOS.show("exams", { id: a.id, tab: "trend" }); }), sh)); }
        wrap.appendChild(section("items", "Exam items", u.plural(g.items.length, "item") + " in the topic banks", big ? u.btn("Practise them as a paper", "sm", function () { KOS.show("exams", { id: a.id, tab: "paper", sub: "1" }); }) : null, itemsBody(g, board)));
      }
      if (s.id === "cram") wrap.appendChild(cramRow(a, g, section));
    });
    wrap.appendChild(el("div", { class: "k-ex-inline k-ex-gfoot" }, [
      u.btn("Export the revision pack", "", function () { packDialog(a); }, { "data-ui": "exams.pack-open" }),
      u.btn("Exams settings", "quiet", function () { settingsDialog(); }, { "data-ui": "exams.settings-open" }),
      el("span", { class: "k-ex-grow" }),
      u.muted(deep ? "The exam items are from the topic banks; the worked variations and practice sets are the full Companion's, written by KurenaiOS." : "Every question here is from the topic banks; nothing is new material.")]));
    typeset(wrap);
  }
  function pad2(i) { return (i < 10 ? "0" : "") + i; }
  function watchRead(aid, sec, end) {
    if (typeof IntersectionObserver !== "function") return;
    var timer = null;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) timer = setTimeout(function () { if (end.isConnected && markRead(aid, sec)) { io.disconnect(); } }, 3000);
        else if (timer) { clearTimeout(timer); timer = null; }
      });
    });
    io.observe(end);
  }
  /* 01 · key notes: a tile a leaf with its rule, a line and the taught flag */
  function notesBody(g, big) {
    var u = U(), cap = big ? 12 : 30, host = el("div", { class: "k-ex-notes" });
    function draw(all) {
      host.textContent = "";
      g.tiles.slice(0, all ? g.tiles.length : cap).forEach(function (t) {
        var p = KOS.spec.parse(t.key);
        host.appendChild(el("article", { class: "k-ex-ntile", "data-ui": "exams.note-tile" }, [
          el("div", { class: "k-ex-inline" }, [el("span", { class: "k-mono k-ex-muted k-ex-small", text: t.ref }), el("button", { type: "button", class: "k-link k-ex-ntile-t", text: t.title,
            onclick: function () { if (p) KOS.show("ref", { subject: p.subject, ref: p.ref }); } }), el("span", { class: "k-ex-grow" }),
            !t.taught && t.week ? el("span", { class: "k-chip", "data-tone": "muted", text: "In class w/c " + u.pretty(t.week, { dow: false }) }) : null].filter(Boolean)),
          t.rule ? html("div", "k-ex-ntile-rule", (t.rule.h ? "<b>" + inline(t.rule.h) + "</b> " : "") + inline(t.rule.text)) : el("div", { class: "k-ex-muted", text: t.has ? "Open the topic for its notes." : "No notes for " + t.ref + " yet." }),
          t.line ? html("div", "k-ex-ntile-line", inline(t.line)) : null,
          !t.has ? u.btn("Write one", "sm", function () { if (p) KOS.show("ref", { subject: p.subject, ref: p.ref }); }) : null
        ].filter(Boolean)));
      });
      if (!all && g.tiles.length > cap) host.appendChild(el("button", { type: "button", class: "k-ex-ntile k-ex-ntile--more", "data-ui": "exams.notes-more", onclick: function () { draw(true); typeset(host); } },
        [el("b", { text: "＋ " + (g.tiles.length - cap) + " more leaves" }), u.muted("Show every leaf in the scope")]));
    }
    draw(false);
    return host;
  }
  /* 02 · command words, as a table */
  function commandsBody(g) {
    var t = el("div", { class: "k-ex-cmds", role: "table", "aria-label": "Command words" }, [
      el("div", { class: "k-ex-cmd k-ex-cmd--head", role: "row" }, ["Word", "What it asks", "What loses the mark", "In scope"].map(function (x) { return el("span", { role: "columnheader", text: x }); }))]);
    g.commands.forEach(function (c) {
      t.appendChild(el("div", { class: "k-ex-cmd", role: "row", "data-ui": "exams.cmd" }, [
        el("b", { role: "cell", text: c.w }), html("span", "", inline(c.asks)), html("span", "", inline(c.loses)), el("span", { role: "cell", class: "k-mono k-ex-muted", text: c.n + (c.n === 1 ? " item" : " items") })]));
    });
    return t;
  }
  /* 03 · the booklet against must-memorise, side by side; a board with no
     booklet puts the exact definitions beside what to memorise */
  function bookletRow(g, section) {
    var u = U(), cap = 6;
    function list(rows, empty) {
      var host = el("div", { class: "k-ex-frows" });
      if (!rows.length) host.appendChild(u.muted(empty));
      rows.slice(0, cap).forEach(function (r) {
        host.appendChild(el("div", { class: "k-ex-frow" }, [html("div", "k-ex-frow-b", (r.h ? "<b>" + inline(r.h) + "</b><br>" : "") + blocks(r.body)), el("span", { class: "k-ex-muted k-ex-small k-mono", text: r.ref })]));
      });
      if (rows.length > cap) host.appendChild(u.muted("＋ " + (rows.length - cap) + " more in the playbook", "k-ex-small"));
      return host;
    }
    var edex = g.board === "Edexcel";
    var left = section("booklet", edex ? "In the formula booklet" : "Must memorise", edex ? "look it up; do not learn it" : "not given to you", null, list(edex ? g.booklet : g.memorise, "Nothing marked for the booklet in this scope."));
    var right = el("section", { class: "k-card k-ex-card k-ex-gsec", "data-ui": "exams.gsec" }, [
      el("div", { class: "k-ex-gsec-head" }, [el("h2", { class: "k-ex-gsec-title", text: edex ? "Must memorise" : "Definitions" }), U().muted(edex ? "not in the booklet" : "the exact wording")]),
      list(edex ? g.memorise : g.defs, edex ? "Nothing marked to memorise in this scope." : "No definitions in this scope.")]);
    return el("div", { class: "k-ex-grid-even" }, [left, right]);
  }
  /* 04 · traps: three a row, each with where it came from */
  function trapsBody(g) {
    var u = U(), host = el("div", { class: "k-ex-traps" });
    g.traps.slice(0, 9).forEach(function (t) {
      host.appendChild(el("article", { class: "k-ex-trap", "data-ui": "exams.trap", "data-from": t.from }, [
        el("div", { class: "k-ex-inline" }, [el("span", { class: "k-ex-trap-mark", "aria-hidden": "true", text: "!" }), el("b", { text: t.h ? t.h.replace(/\*\*/g, "") : t.title })]),
        html("div", "k-ex-trap-why", inline(t.text)),
        u.muted(t.from === "report" ? "From the examiner's report · " + t.cite : t.ref + " " + t.title, "k-ex-small")]));
    });
    if (g.traps.length > 9) host.appendChild(el("button", { type: "button", class: "k-ex-trap k-ex-ntile--more", onclick: function () { openPlaybook(g.board, g.a, "blacklist"); } },
      [el("b", { text: "＋ " + (g.traps.length - 9) + " more" }), u.muted("In the playbook's blacklist")]));
    return host;
  }
  /* 05 · labs, large */
  function labsBody(g) {
    var u = U();
    return el("div", { class: "k-ex-labs" }, g.labs.slice(0, 6).map(function (l) {
      return el("article", { class: "k-ex-lab", "data-ui": "exams.lab" }, [el("span", { class: "k-ex-lab-mark", "aria-hidden": "true", lang: "ja", text: "験" }),
        el("div", { class: "k-ex-lab-b" }, [el("b", { text: l.title }), l.desc ? u.muted(l.desc) : null, el("span", { class: "k-ex-grow" }),
          u.btn("Open the lab", "sm", function () { KOS.show("sims", l.id); })].filter(Boolean))]);
    }));
  }
  /* 06 · exam items, numbered, each with its scheme behind Try it */
  function itemsBody(g, board) {
    var u = U(), cap = 8, host = el("ol", { class: "k-ex-items" });
    function draw(all) {
      host.textContent = "";
      g.items.slice(0, all ? g.items.length : cap).forEach(function (it, i) {
        var ms = el("div", { class: "k-ex-item-ms", hidden: "" });
        it.parts.forEach(function (p, j) { ms.appendChild(html("div", "k-ex-ms", (it.parts.length > 1 ? "<b>(" + "abcdefgh".charAt(j) + ")</b> " : "") + (p.ms || []).map(inline).join("<br>"))); });
        var hb = C().habitFor(board, it.parts[0].q);
        var tryB = u.btn("Try it", "sm", function () { ms.hidden = !ms.hidden; tryB.textContent = ms.hidden ? "Try it" : "Hide the scheme"; if (!ms.hidden) typeset(ms); });
        host.appendChild(el("li", { class: "k-ex-item", "data-ui": "exams.item" }, [
          el("span", { class: "k-mono k-ex-item-n", text: String(i + 1) }),
          el("div", { class: "k-ex-item-q" }, [it.ctx ? html("p", "", inline(it.ctx)) : null].concat(it.parts.map(function (p, j) { return html("p", "", (it.parts.length > 1 ? "<b>(" + "abcdefgh".charAt(j) + ")</b> " : "") + inline(p.q) + " <span class=\"k-mono k-ex-muted\">(" + p.marks + ")</span>"); }),
            [hb ? el("div", { class: "k-ex-habit" }, [el("b", { text: hb.type + ": " }), hb.steps.join(" ")]) : null, ms, it.src ? u.muted("Modelled on " + it.src, "k-ex-small") : null]).filter(Boolean)),
          tryB]));
      });
      if (!all && g.items.length > cap) host.appendChild(el("li", { class: "k-ex-item k-ex-item--more" }, [el("button", { type: "button", class: "k-link", "data-ui": "exams.items-more", text: "Show all " + g.items.length + " items", onclick: function () { draw(true); typeset(host); } })]));
    }
    draw(false);
    return host;
  }
  /* the question shapes of the board paper inside this scope */
  function shapesBody(a) {
    var u = U(), pid = C().indexPaperOf(a), st = pid ? C().archetypes(pid) : null;
    if (!st) return null;
    var ls = {};
    E().leaves(a).forEach(function (k) { ls[k] = true; });
    var rows = st.list.filter(function (x) { return !x.unique && x.leaves.some(function (k) { return ls[k]; }); });
    if (!rows.length) return null;
    var host = el("div", { class: "k-ex-shapes" });
    rows.slice(0, 12).forEach(function (s) {
      var inst = s.instances.filter(function (x) { return x.sitting !== "specimen" && x.sitting !== "sample"; }).slice(0, 3);
      host.appendChild(el("article", { class: "k-ex-shape", "data-ui": "exams.shape" }, [
        el("div", { class: "k-ex-inline" }, [el("b", { class: "k-ex-grow", text: s.title }), el("span", { class: "k-chip", "data-tone": s.appear / Math.max(1, s.of) >= 0.75 ? "teal" : null, text: s.appear + " of " + s.of + " sittings" })]),
        u.muted((s.lo != null ? (s.lo === s.hi ? s.lo : s.lo + "–" + s.hi) + " marks when it comes up" : "") + " · about " + s.mean + " a paper", "k-ex-small"),
        el("div", { class: "k-ex-ptrs" }, inst.map(function (x) {
          return el("div", { class: "k-ex-ptr" }, [el("span", { class: "k-mono", text: C().sittingName(x.sitting) }), u.muted(x.q + " · " + u.plural(x.marks, "mark")),
            el("span", { class: "k-ex-grow" }), u.linkBtn("Log it", function () { KOS.trackerLog({ assessmentId: a.id, index: { paper: pid, sitting: x.sitting } }, function () { KOS.rerender(); }); })]);
        }))]));
    });
    host.appendChild(el("p", { class: "k-ex-foot k-ex-span", text: "Frequency is evidence, not prophecy: anything in the specification can appear. Worked variations for each shape arrive with this paper's full Companion." }));
    return host;
  }
  /* 07 · the cram deck and the rapid drill, side by side */
  function cramRow(a, g, section) {
    var u = U(), cards = [];
    E().leaves(a).forEach(function (k) { var p = KOS.spec.parse(k); if (p) KOS.srs.cardsFor(p.subject, p.ref).forEach(function (c) { if (cards.length < 6 && c.q) cards.push(c); }); });
    var left = section("cram", "Cram deck", u.plural(g.cram.cards, "card") + (g.cram.seenWeek ? " · " + g.cram.seenWeek + " seen this week" : ""),
      g.cram.cards ? u.btn("Cram " + (g.cram.due || Math.min(g.cram.cards, 40)), "primary sm", function () { KOS.show("review", { tab: "due", run: "scope:" + a.id }); }) : null,
      el("div", { class: "k-ex-flash" }, cards.map(function (c) {
        var m = KOS.srs.peek(c.key), seen = m && m.last && m.last >= KOS.srs.addDays(today(), -6);
        return el("div", { class: "k-ex-flashc", "data-state": seen ? "seen" : null }, [html("div", "", inline(c.q)), el("span", { class: "k-ex-grow" }), u.muted(seen ? "seen this week" : m && m.last ? "seen before" : "not seen yet", "k-ex-small")]);
      })));
    var dr = C().drill(a, 1);
    var right = el("section", { class: "k-card k-ex-card k-ex-gsec", "data-ui": "exams.gsec" }, [
      el("div", { class: "k-ex-gsec-head" }, [el("h2", { class: "k-ex-gsec-title", text: "Rapid drill" }), u.muted(u.plural(dr.items.length, "question") + " · about " + dr.mins + " min")]),
      dr.items[0] ? el("div", { class: "k-ex-drillprev" }, [u.muted("Question 1 of " + dr.items.length + " · " + dr.items[0].ref), html("div", "k-ex-drillprev-q", inline(dr.items[0].q))]) : u.quiet("Nothing to drill yet", "The scope has no flashcards or short items."),
      el("span", { class: "k-ex-grow" }),
      el("div", { class: "k-ex-inline" }, [u.btn("Start the drill", "primary sm", function () { drillDialog(a); }, { disabled: dr.items.length ? null : "" }), u.muted("misses go to a cram run")])]);
    return el("div", { class: "k-ex-grid-cram" }, [left, right]);
  }

  /* ================= trend and likelihood (29s) ================= */
  function trendPage(main, a) {
    var u = U(), L = C().likelihood(a);
    U().head(main, "guide", { right: KOS.ui.tabs([{ label: "Guide", active: false, onSelect: function () { KOS.show("exams", { tab: "guide", sub: a.id }); } },
      { label: "Trend and likelihood", active: true, onSelect: function () {} }], { variant: "workspace", label: "Companion view" }) });
    var wrap = el("div", { class: "k-ex-page k-ex-trend", "data-ui": "exams.trend", style: "--s: " + u.hueOf(a) });
    main.appendChild(wrap);
    if (!L) {
      wrap.appendChild(KOS.ui.emptyState({ compact: true, mark: "⚖", title: "No board paper for this assessment", body: "Trend and likelihood read a board paper's past sittings. Give it a preset to see them.",
        action: u.btn("Edit the assessment", "", function () { u.editor(a, {}, function () { KOS.rerender(); }); }) }));
      return;
    }
    wrap.appendChild(el("div", { class: "k-ex-caveat", "data-ui": "exams.caveat" }, [el("span", { "aria-hidden": "true", text: "⚖" }),
      el("span", { class: "k-ex-grow" }, [el("b", { text: "Evidence, not prophecy. " }), "These patterns come from " + u.plural(L.sittings.length, "past sitting") + " of " + L.title + ". Anything in the specification can appear, in any year, for any number of marks."]),
      el("span", { class: "k-chip", text: a.title })]));
    var left = el("div", { class: "k-ex-col" }), right = el("div", { class: "k-ex-side" });
    /* the heat table: topic × sitting, a declared scroller */
    var sit = L.sittings.map(function (s) { var p = s.split("-"); return ({ "06": "J", "10": "O", "11": "N", "01": "Ja" }[p[1]] || "") + p[0].slice(2); });
    var table = el("table", { class: "k-ex-heat", "data-ui": "exams.heat" }, [
      el("thead", {}, [el("tr", {}, [el("th", { scope: "col", text: "Topic" })].concat(sit.map(function (s, i) { return el("th", { scope: "col", class: "k-mono", title: C().sittingName(L.sittings[i]), text: s }); }), [el("th", { scope: "col", text: "in" }), el("th", { scope: "col", text: "mean" })]))]),
      el("tbody", {}, L.heat.rows.map(function (r) {
        return el("tr", {}, [el("th", { scope: "row", text: r.topic })].concat(r.cells.map(function (v, i) {
          var td = el("td", { class: "k-mono", "data-on": v ? "" : null, title: r.topic + ", " + C().sittingName(L.sittings[i]) + ", " + (v ? v + " marks" : "absent"), text: v ? String(v) : "—" });
          if (v) td.style.setProperty("--h", Math.min(1, v / 25).toFixed(2));
          return td;
        }), [el("td", { class: "k-mono", text: L.enough ? r.appear + " of " + r.of : "—" }), el("td", { class: "k-mono", text: L.enough ? r.mean + " mk" : "—" })]));
      }))]);
    left.appendChild(u.card([u.chead("Marks by topic and sitting", L.enough ? "a paper's marks each time · — means absent" : "too few sittings to say"),
      KOS.ui.scroller ? KOS.ui.scroller(table, { keepRole: true }) : table,
      el("p", { class: "k-ex-foot", text: "From the index: each question's marks shared across the leaves it maps to, grouped by unit." })], "", "exams.heat-card"));
    if (L.core) {
      left.appendChild(u.card([u.chead("The core half of the paper", u.plural(L.core.items.length, "question shape") + " make up about " + Math.round(100 * L.core.share) + "% of the marks, sitting after sitting"),
        el("div", { class: "k-ex-core" }, L.core.items.map(function (s, i) {
          return el("div", { class: "k-ex-coret" }, [el("div", { class: "k-ex-inline" }, [el("span", { class: "k-mono k-ex-muted", text: String(i + 1) }), el("span", { class: "k-ex-grow" }), el("span", { class: "k-mono k-ex-small", text: "~" + Math.round(s.mean) + " mk" })]),
            el("span", { class: "k-ex-coret-t", text: s.title })]);
        })),
        el("div", { class: "k-ex-inline" }, [u.tickBar(100 * L.core.share, null), el("b", { class: "k-mono", text: L.core.marks + " of " + Math.round(L.archetypes.marks) }), u.muted("on average")])], "", "exams.core"));
    }
    left.appendChild(u.card([u.chead("Your marks against the paper's weighting", "where the marks are, and where you drop them")].concat(
      L.you.length ? L.you.map(function (r) {
        var b = el("div", { class: "k-ex-wbar", "aria-hidden": "true" }, [el("i"), el("b")]);
        b.style.setProperty("--p", Math.min(100, r.paper / 15 * 100).toFixed(0) + "%"); b.style.setProperty("--k", Math.min(100, r.keep / 15 * 100).toFixed(0) + "%");
        return el("div", { class: "k-ex-wrow" }, [el("span", { class: "k-ex-ell", text: r.topic }), b, el("span", { class: "k-mono", "data-tone": r.drop >= 4 ? "danger" : null, text: (r.drop >= 4 ? "▲ " : "") + r.drop + " mk" })]);
      }) : [u.quiet("Mark a paper by question to see this", "Your marks by topic, against what a paper carries there.")]), "k-ex-fill", "exams.weighting"));
    /* the side: yield map, due by pattern, discriminators */
    var YW = { high: "▲ High", medium: "● Medium", low: "▽ Low", due: "◷ Due by pattern" };
    right.appendChild(u.card([u.chead("Yield map", L.enough ? "marks you can expect for the effort" : "too few sittings to say"),
      el("div", { class: "k-ex-yield" }, L.heat.rows.slice(0, 12).map(function (r) {
        return el("div", { class: "k-ex-ytile", "data-y": r.yield || "none", "data-ui": "exams.ytile" }, [el("span", { class: "k-ex-ylevel", text: r.yield ? YW[r.yield] : "—" }), el("b", { class: "k-ex-ell", text: r.topic }),
          u.muted(L.enough ? r.appear + " of " + r.of + " · mean " + r.mean + " mk" : "", "k-ex-small")]);
      })),
      el("p", { class: "k-ex-foot", text: "High, Medium and Low are words on every tile, not only shades. Due by pattern means absent lately, not certain." })], "", "exams.yield"));
    var due = L.heat.rows.filter(function (r) { return r.yield === "due"; });
    right.appendChild(u.card([u.chead("Due by its pattern", "absent lately, present before")].concat(due.length ? due.map(function (r) {
      return el("div", { class: "k-ex-due" }, [el("b", {}, ["◷ ", r.topic]), u.muted("absent from the last " + (r.gap === 1 ? "sitting" : r.gap + " sittings") + " · in " + (r.appear) + " of the " + (r.of - r.gap) + " before", "k-ex-small")]);
    }) : [u.muted("Nothing absent lately that was regular before.")], [el("p", { class: "k-ex-foot", text: "A gap is weak evidence. It nudges the Planner by one session at most." })]), "", "exams.due"));
    right.appendChild(u.card([u.chead("Discriminators", L.reports ? "the questions the reports say few got" : "waiting for the board's examiner reports")].concat(L.discriminators.map(function (d) {
      return el("div", { class: "k-ex-disc" }, [el("span", { class: "k-mono k-ex-small", text: C().sittingName(d.sitting).replace(/^(\w{3})\w*/, "$1") + " " + d.q }),
        el("div", {}, [el("b", { text: d.title }), d.why ? html("div", "k-ex-muted k-ex-small", inline(d.why)) : u.muted(u.plural(d.marks || 0, "mark") + " · one of the longest schemes", "k-ex-small")])]);
    }), [el("span", { class: "k-ex-grow" }), el("p", { class: "k-ex-foot", text: L.reports ? "Paraphrased from the examiner's reports, citing the series." : "Full-mark rates come from examiner reports; until they are added these are the longest schemes in the index." })]), "k-ex-fill", "exams.disc"));
    wrap.appendChild(el("div", { class: "k-ex-grid2" }, [left, right]));
  }

  /* ================= the rapid drill (§13.1) ================= */
  function dialog(title, mark, body, foot, hook, size) {
    var overlay = el("div", { class: "k-dialog-overlay" });
    var t = el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: title });
    var box = el("div", { class: "k-dialog k-ex-dialog", "data-size": size || null, "data-ui": "ui.dialog " + hook, role: "dialog" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: mark }), t,
        el("span", { class: "k-ex-grow" }), el("button", { type: "button", class: "k-iconbtn", "data-ui": "ui.dialog-close", "aria-label": "Close", text: "✕", onclick: function () { overlay.close(); } })]),
      el("div", { class: "k-dialog-body k-ex-dbody" }, body), foot ? el("div", { class: "k-dialog-foot" }, foot) : null].filter(Boolean));
    overlay.appendChild(box);
    overlay.close = function () { overlay.remove(); if (overlay.onclose) overlay.onclose(); };
    KOS.ui.openDialog(overlay, { labelledBy: t });
    return overlay;
  }
  function drillDialog(a, o) {
    o = o || {};
    var recog = !!(o.recog && KOS.examDeep);
    var u = U(), dr = recog ? KOS.examDeep.recognition(a, Date.now() % 100000, 20) : C().drill(a, Date.now() % 100000), i = 0, got = [], start = Date.now();
    if (!dr) return null;
    var body = el("div", { class: "k-ex-drill", "data-ui": "exams.drill" });
    var ov = dialog((recog ? "Recognition drill · " : "Rapid drill · ") + a.title, recog ? "識" : "速", [body], null, "exams.drill-dialog");
    function step() {
      body.textContent = "";
      if (i >= dr.items.length) return finish();
      var it = dr.items[i], shown = false;
      var ans = el("div", { class: "k-ex-drill-a", hidden: "" }, [html("div", "", it.kind === "card" || it.kind === "recog" ? inline(it.a) : (it.ms || []).map(inline).join("<br>"))]);
      var marks = el("div", { class: "k-ex-actions", hidden: "" }, [
        u.btn("✓ Got it", "primary", function () { got.push(true); i++; step(); }, { "data-ui": "exams.drill-got" }),
        u.btn("✕ Missed it", "", function () { got.push(false); i++; step(); }, { "data-ui": "exams.drill-miss" })]);
      var reveal = u.btn(it.kind === "recog" ? "Show the shape" : "Show the answer", "primary", function () { ans.hidden = false; marks.hidden = false; reveal.hidden = true; typeset(ans); marks.firstChild.focus(); }, { "data-ui": "exams.drill-show" });
      body.appendChild(el("div", { class: "k-ex-inline" }, [u.muted("Question " + (i + 1) + " of " + dr.items.length + " · " + it.ref + " " + it.title), el("span", { class: "k-ex-grow" }),
        u.squares(dr.items.length, i)]));
      if (it.ctx) body.appendChild(html("p", "", inline(it.ctx)));
      if (recog) body.appendChild(u.muted("Name the shape and your first move, then check.", "k-ex-small"));
      if (it.code) body.appendChild(el("pre", { class: "k-ex-pre", text: it.code.join("\n") }));
      body.appendChild(html("div", "k-ex-drill-q", inline(it.q) + (it.marks ? " <span class=\"k-mono k-ex-muted\">(" + it.marks + ")</span>" : "")));
      body.appendChild(ans); body.appendChild(reveal); body.appendChild(marks);
      typeset(body);
      reveal.focus();
      void shown;
    }
    function finish() {
      var right = got.filter(Boolean).length, missed = dr.items.filter(function (x, k) { return !got[k]; });
      var keys = missed.filter(function (x) { return x.kind === "card"; }).map(function (x) { return x.key; });
      var mins = Math.max(1, Math.round((Date.now() - start) / 60000));
      u.announce(right + " of " + dr.items.length + " right." + (keys.length ? " " + u.plural(keys.length, "card") + " to cram." : ""));
      body.appendChild(el("div", { class: "k-ex-drill-end", "data-ui": "exams.drill-end" }, [
        el("div", { class: "k-ex-bigfig-row" }, [el("span", { class: "k-ex-fig", text: right + " of " + dr.items.length }), u.muted("right · " + mins + " min")]),
        missed.length ? el("ul", { class: "k-ex-ul" }, missed.slice(0, 8).map(function (x) { return html("li", "", "<b>" + KOS.ui.esc(x.ref) + "</b> " + inline(x.q)); })) : u.muted("Nothing missed."),
        el("div", { class: "k-ex-actions" }, [keys.length ? u.btn("Cram the " + u.plural(keys.length, "card") + " you missed", "primary", function () { ov.close(); KOS.show("review", { tab: "due", run: "cards:" + keys.join("|") }); }, { "data-ui": "exams.drill-cram" }) : null,
          u.btn("Close", "", function () { ov.close(); })].filter(Boolean)),
        u.muted(recog ? "Recognising the shape is half the question. Open a missed shape from the full Companion to work its variations." : "A drill is self-marked: nothing is rated or rescheduled, and it pays nothing.", "k-ex-small")]));
      typeset(body);
    }
    step();
    return ov;
  }

  /* ================= the playbook drawer (29r) ================= */
  var BOARDS = ["AQA", "Edexcel", "OCR"];
  function openPlaybook(board, a, section) {
    var u = U(), cur = { board: board || "AQA", section: section || null };
    var host = el("div", { class: "k-ex-pb", "data-ui": "exams.playbook" });
    var overlay = el("div", { class: "k-dialog-overlay k-ex-drawer-ov" });
    var t = el("h2", { class: "k-dialog-title", "data-ui": "ui.dialog-title", text: "Playbook" });
    var head = el("div", { class: "k-ex-pb-head" });
    var box = el("div", { class: "k-dialog k-ex-drawer", "data-ui": "ui.dialog exams.drawer", role: "dialog" }, [
      el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [el("span", { class: "k-kanji", lang: "ja", "aria-hidden": "true", text: "策" }),
        el("div", { class: "k-ex-grow" }, [t, u.muted("the board's rules, in one drawer")]),
        el("button", { type: "button", class: "k-iconbtn", "data-ui": "ui.dialog-close", "aria-label": "Close", text: "✕", onclick: function () { overlay.close(); } })]),
      head, el("div", { class: "k-ex-pb-body" }, [host])]);
    overlay.appendChild(box);
    overlay.close = function () { overlay.remove(); };
    function draw() {
      var pb = C().playbook(cur.board, a && C().boardOf(a) === cur.board ? a : null);
      if (!cur.section || !pb.sections.some(function (s) { return s.id === cur.section; })) cur.section = pb.sections[0].id;
      head.textContent = "";
      head.appendChild(KOS.ui.tabs(BOARDS.map(function (b) { return { label: b, active: b === cur.board, onSelect: function () { cur.board = b; cur.section = null; draw(); u.announce(b + " playbook."); } }; }), { variant: "workspace", label: "Board", className: "k-seg--quiet" }));
      head.appendChild(el("div", { class: "k-ex-pb-chips", role: "group", "aria-label": "Sections" }, pb.sections.map(function (s) {
        return el("button", { type: "button", class: "k-ex-pb-chip", "aria-pressed": s.id === cur.section ? "true" : "false", "data-ui": "exams.pb-section", text: s.title, onclick: function () { cur.section = s.id; draw(); } });
      })));
      host.textContent = "";
      var s = pb.sections.filter(function (x) { return x.id === cur.section; })[0];
      host.appendChild(sectionBody(pb, s, a));
      typeset(host);
    }
    function dRow(a1, b1) { return el("div", { class: "k-ex-drow" }, [html("span", "", a1), b1 ? html("span", "k-ex-muted k-ex-small", b1) : el("span")]); }
    function sectionBody(pb, s, asm) {
      var out = el("div", { class: "k-ex-pb-sec" });
      function sub(t1, t2) { out.appendChild(el("div", { class: "k-ex-pb-sub" }, [el("b", { text: t1 }), t2 ? u.muted(t2) : null].filter(Boolean))); }
      if (s.id === "booklet") {
        if (s.booklet.length) { sub("In the booklet", pb.title + " · look it up"); s.booklet.slice(0, 40).forEach(function (r) { out.appendChild(dRow((r.h ? "<b>" + inline(r.h) + "</b> " : "") + blocks(r.body), KOS.ui.esc(r.ref))); }); }
        if (s.memorise.length) { sub("Must memorise", "not given to you"); s.memorise.slice(0, 60).forEach(function (r) { out.appendChild(dRow((r.h ? "<b>" + inline(r.h) + "</b> " : "") + blocks(r.body), KOS.ui.esc(r.ref))); }); }
        out.appendChild(u.muted(pb.scoped ? "Filtered to the scope of " + asm.title + "." : "The whole subject; open it from an assessment to filter to its scope.", "k-ex-small"));
      } else if (s.id === "commands") {
        sub("Command-word decoder", pb.title);
        s.rows.forEach(function (c) { out.appendChild(el("div", { class: "k-ex-pb-cmd", "data-ui": "exams.pb-cmd" }, [el("b", { text: c.w }), el("div", {}, [html("div", "", inline(c.asks)), html("div", "k-ex-muted k-ex-small", "Loses it: " + inline(c.loses)), c.eg ? html("div", "k-ex-small", "<i>e.g.</i> " + inline(c.eg)) : null].filter(Boolean))])); });
        sub("Answer habits", "a 30-second pre-flight per question type");
        s.habits.forEach(function (h) { out.appendChild(el("div", { class: "k-ex-pb-habit", "data-ui": "exams.pb-habit" }, [el("b", { text: h.type }), el("ol", { class: "k-ex-ol" }, h.steps.map(function (x) { return el("li", { text: x }); }))])); });
        if (pb.conventions && pb.conventions.length) { sub("Conventions", "as the board marks them"); pb.conventions.forEach(function (c) { out.appendChild(dRow("<span class=\"k-mono\">" + KOS.ui.esc(c[0]) + "</span>", KOS.ui.esc(c[1]))); }); if (pb.conventionsNote) out.appendChild(u.muted(pb.conventionsNote, "k-ex-small")); }
        if (pb.notation && pb.notation.length) { sub("Mark-scheme notation", "general marking terms"); out.appendChild(el("div", { class: "k-ex-pb-notation" }, pb.notation.map(function (n) { return el("span", {}, [el("b", { class: "k-mono", text: n[0] }), " " + n[1]]); }))); }
      } else if (s.id === "levels") {
        var L = s.levels;
        sub("Levels of response", L.title);
        L.rows.forEach(function (r) { out.appendChild(el("div", { class: "k-ex-lvl" }, [el("b", { text: "Level " + r[0] }), u.muted(r[1]), el("span", { text: r[2] })])); });
        sub("How examiners read it", "");
        L.read.forEach(function (x) { out.appendChild(dRow("— " + KOS.ui.esc(x), "")); });
        if (L.climb) { sub("Climb a band", "what moves you up"); L.climb.forEach(function (c) { out.appendChild(dRow("<b>" + KOS.ui.esc(c[0]) + "</b> " + KOS.ui.esc(c[1]), "")); }); }
        if (L.check) { sub("Checklist before you stop", "tick it in your head"); L.check.forEach(function (c) { out.appendChild(dRow("□ " + KOS.ui.esc(c), "")); }); }
        out.appendChild(u.muted(L.note, "k-ex-small"));
      } else if (s.id === "calculator") {
        var K = s.calculator;
        sub("Set up the " + K.title, "before every paper");
        K.setup.forEach(function (x, i) { out.appendChild(dRow("<span class=\"k-mono k-ex-muted\">" + (i + 1) + "</span> " + KOS.ui.esc(x), "")); });
        sub("Checking techniques", "use them, do not show them");
        K.checks.forEach(function (c) { var r = dRow("<b>" + KOS.ui.esc(c[0]) + "</b>", KOS.ui.esc(c[1])); r.classList.add("k-ex-drow--kv"); out.appendChild(r); });
        out.appendChild(u.muted(K.note + " " + K.source, "k-ex-small"));
      } else if (s.id === "mnemonics") {
        sub("Master mnemonics", "from your notes" + (pb.scoped ? ", in this scope" : ""));
        s.rows.slice(0, 40).forEach(function (r) { out.appendChild(dRow((r.h ? "<b>" + inline(r.h) + "</b> " : "") + inline(r.text), KOS.ui.esc(r.ref))); });
      } else if (s.id === "blacklist") {
        sub("Misconceptions Blacklist", pb.title);
        if (!s.rows.length) out.appendChild(u.muted("Nothing yet: your own tagged marks and the examiner's reports fill this."));
        s.rows.slice(0, 30).forEach(function (r) {
          out.appendChild(el("div", { class: "k-ex-black", "data-from": r.from, "data-ui": "exams.black" }, [
            el("div", { class: "k-ex-inline" }, [el("span", { class: "k-ex-black-x", "aria-hidden": "true", text: "✕" }), html("span", "k-ex-grow", inline(r.text)),
              el("span", { class: "k-chip", "data-tone": "muted", text: r.from === "yours" ? "yours" + (r.marks ? " · " + r.marks + " mk" : "") : r.from === "report" ? "examiner's report" : "your notes" })]),
            r.fix ? u.muted(r.fix, "k-ex-small") : r.cite ? u.muted(r.cite, "k-ex-small") : null].filter(Boolean)));
        });
      }
      return out;
    }
    draw();
    KOS.ui.openDialog(overlay, { labelledBy: t });
    u.announce("Playbook, " + cur.board + ".");
    return overlay;
  }

  /* ================= the revision pack (29ac) ================= */
  function packDialog(a) {
    var u = U(), list = guided(), cur = a, prefs = E().prefs(), large = !!prefs.largePrint, on = { notes: true, traps: true, cards: true, drill: false };
    var body = el("div", { class: "k-ex-pack" }), total = el("span", { class: "k-ex-muted" });
    var printB = u.btn("Print or save as PDF", "primary", function () { printPack(cur, on, large); }, { "data-ui": "exams.pack-print" });
    var ov = dialog("Export revision pack", "冊", [body], [el("span", { class: "k-ex-grow" }), u.btn("Cancel", "", function () { ov.close(); }), printB], "exams.pack-dialog", "sm");
    function draw() {
      body.textContent = "";
      var sel = el("select", { class: "k-input", "aria-label": "Scope" }, list.map(function (x) { var o = el("option", { value: x.id, text: x.title + " · " + u.plural(E().leaves(x).length, "leaf", "leaves") }); if (x.id === cur.id) o.selected = true; return o; }));
      sel.addEventListener("change", function () { cur = E().get(sel.value); draw(); });
      body.appendChild(el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Scope" }), sel]));
      var pk = C().pack(cur, { large: large });
      body.appendChild(el("div", { class: "k-ex-minihead", text: "Include" }));
      var pages = 0;
      pk.parts.forEach(function (p) {
        var box = el("input", { type: "checkbox", class: "k-box", "aria-label": p.title, disabled: p.available ? null : "" });
        box.checked = p.available && !!on[p.id];
        box.addEventListener("change", function () { on[p.id] = box.checked; draw(); });
        if (box.checked) pages += p.pages;
        body.appendChild(el("label", { class: "k-ex-checkrow", "data-ui": "exams.pack-part" }, [box, el("span", { class: "k-ex-grow" }, [p.title, p.why ? el("div", { class: "k-ex-muted k-ex-small", text: p.why }) : null].filter(Boolean)),
          u.muted(p.available ? u.plural(p.pages, "page") + (p.count ? " · " + p.count : "") : "")]));
      });
      var size = el("select", { class: "k-input", "aria-label": "Print size" }, [["normal", "Normal · 11 pt"], ["large", "Large print · 16 pt"]].map(function (x) { var o = el("option", { value: x[0], text: x[1] }); if ((x[0] === "large") === large) o.selected = true; return o; }));
      size.addEventListener("change", function () { large = size.value === "large"; draw(); });
      body.appendChild(el("div", { class: "k-ex-form" }, [el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Paper" }), el("select", { class: "k-input", disabled: "", "aria-label": "Paper" }, [el("option", { text: "A4" })])]),
        el("label", { class: "k-field" }, [el("span", { class: "k-field-label", text: "Print size" }), size, el("span", { class: "k-field-hint", text: prefs.largePrint ? "From Exams settings" : "Large print is set in Exams settings" })])]));
      total.textContent = u.plural(pages, "page") + " · black on white";
      body.appendChild(total);
      printB.disabled = !pages;
      u.announce(u.plural(pages, "page") + ".");
    }
    draw();
    return ov;
  }
  /* the print root: A4, black on white, no app chrome (the print stylesheet
     hides everything else while :root[data-printing="exams"]) */
  function printRoot(large) {
    var old = document.getElementById("k-ex-print");
    if (old) old.remove();
    var root = el("div", { id: "k-ex-print", class: "k-ex-print", "data-size": large ? "large" : null, "aria-hidden": "true" });
    document.body.appendChild(root);
    return root;
  }
  function printNow(root) {
    var r = document.documentElement;
    r.setAttribute("data-printing", "exams");
    var done = function () { r.removeAttribute("data-printing"); root.remove(); window.removeEventListener("afterprint", done); };
    window.addEventListener("afterprint", done);
    typeset(root);
    try { window.print(); } catch (e) { done(); }
    setTimeout(function () { if (r.getAttribute("data-printing") === "exams" && !window.matchMedia("print").matches) done(); }, 60000);
  }
  function printPack(a, on, large) {
    var pk = C().pack(a, { large: large }), g = pk.guide, root = printRoot(large);
    function page(title, kids) { root.appendChild(el("section", { class: "k-ex-ppage" }, [el("div", { class: "k-ex-ppage-k", text: "KurenaiOS revision pack · " + a.title }), el("h1", { text: title })].concat(kids, [el("div", { class: "k-ex-ppage-f", text: "Written by KurenaiOS from your notes · not a board document" })]))); }
    if (on.notes) page("Key notes", g.tiles.filter(function (t) { return t.has; }).map(function (t) {
      return el("div", { class: "k-ex-pnote" }, [el("h2", { text: t.ref + " " + t.title }), t.rule ? html("p", "", (t.rule.h ? "<b>" + inline(t.rule.h) + "</b> " : "") + inline(t.rule.text)) : null, t.line ? html("p", "", inline(t.line)) : null].filter(Boolean));
    }));
    if (on.variations && pk.variations.length) page("Worked variations", pk.variations.map(function (x) {
      return el("div", { class: "k-ex-pnote" }, [el("h2", { text: (x.leaf ? x.leaf.ref + " · " : "") + x.a.title })].concat(x.a.variations.map(function (v) {
        return el("div", {}, [html("p", "", "<b>" + v.v + " · " + KOS.ui.esc(v.t) + "</b> (" + v.m + ") " + inline(v.q)), v.code ? el("pre", { class: "k-ex-pre", text: v.code.join("\n") }) : null,
          el("ol", {}, v.steps.map(function (st) { return html("li", "", inline(st.text) + (st.marks ? " <b>[" + KOS.ui.esc(st.marks) + "]</b>" : "")); }))].filter(Boolean));
      })));
    }));
    if (on.packs && pk.packs.length) page("Subtopic packs", pk.packs.map(function (p) {
      return el("div", { class: "k-ex-pnote" }, [el("h2", { text: p.leaf.ref + " " + p.leaf.title + " · " + p.marks + " marks" }),
        el("ol", {}, p.items.map(function (it) { return html("li", "", inline(it.parts[0].q) + " (" + it.marks + ")"); })),
        el("p", {}, [el("b", { text: "Mark scheme" })]),
        el("ol", {}, p.items.map(function (it) { return html("li", "", it.parts[0].ms.map(inline).join("; ")); }))]);
    }));
    if (on.traps) page("Traps and conventions", g.commands.map(function (c) { return html("p", "", "<b>" + KOS.ui.esc(c.w) + "</b>: " + inline(c.asks) + " <i>Loses it:</i> " + inline(c.loses)); })
      .concat(g.traps.slice(0, 30).map(function (t) { return html("p", "", "✕ " + inline(t.text) + (t.cite ? " <i>(" + KOS.ui.esc(t.cite) + ")</i>" : "")); })));
    if (on.cards) page("Cram cards · fold on the line", [el("div", { class: "k-ex-pcards" }, pk.cards.map(function (c) { return el("div", { class: "k-ex-pcard" }, [html("div", "", inline(c.q)), html("div", "", inline(c.a))]); }))]);
    if (on.drill) page("The 15-question drill", [el("ol", {}, pk.drill.items.map(function (x) { return html("li", "", inline(x.q)); })), el("h2", { text: "Answers" }),
      el("ol", {}, pk.drill.items.map(function (x) { return html("li", "", x.kind === "card" ? inline(x.a) : (x.ms || []).map(inline).join("; ")); }))]);
    printNow(root);
  }

  /* ================= Exams settings: accessibility (29ac) ================= */
  function settingsDialog() {
    var u = U(), p = E().prefs();
    var body = el("div", { class: "k-ex-settings", "data-ui": "exams.settings" });
    function sw(key, title, sub, on, onChange) {
      var box = el("input", { type: "checkbox", class: "k-switch", "aria-label": title, "data-ui": "exams.set-" + key });
      box.checked = !!on;
      box.addEventListener("change", function () { onChange(box.checked); });
      return el("label", { class: "k-ex-swrow" }, [box, el("span", { class: "k-ex-grow" }, [el("b", { text: title }), el("div", { class: "k-ex-muted k-ex-small", text: sub })])]);
    }
    var extra = el("select", { class: "k-input", "aria-label": "Extra time", "data-ui": "exams.set-extra" }, [0, 10, 25, 50].map(function (v) { var o = el("option", { value: String(v), text: v ? v + "%" : "None" }); if ((p.extraTime || 0) === v) o.selected = true; return o; }));
    extra.addEventListener("change", function () {
      var v = +extra.value;
      E().setPrefs({ extraTime: v });
      u.announce(v ? "Extra time " + v + "% on. Timers and pace budgets updated." : "Extra time off.");
    });
    body.appendChild(el("label", { class: "k-ex-swrow" }, [extra, el("span", { class: "k-ex-grow" }, [el("b", { text: "Extra time" }), el("div", { class: "k-ex-muted k-ex-small", text: "Every timed paper, its pace budget and the Exam Room use it. An assessment's own allowance wins over this one." })])]));
    body.appendChild(sw("large", "Large print for printed papers", "Practice papers, mark schemes and revision packs print at 16 pt on A4.", p.largePrint, function (v) { E().setPrefs({ largePrint: v }); u.announce(v ? "Large print on." : "Large print off."); }));
    body.appendChild(sw("breaks", "Rest breaks", "Pausing a timed paper stops its clock while you are on a break; the attempt records the breaks.", p.restBreaks, function (v) { E().setPrefs({ restBreaks: v }); u.announce(v ? "Rest breaks on." : "Rest breaks off."); }));
    var ov = dialog("Exams settings", "設", [el("div", { class: "k-ex-minihead", text: "Accessibility" }), body], [el("span", { class: "k-ex-grow" }), u.btn("Done", "primary", function () { ov.close(); KOS.rerender(); })], "exams.settings-dialog", "sm");
    return ov;
  }

  KOS.examGuide = { hub: hub, page: page, drill: drillDialog, playbook: openPlaybook, pack: packDialog, settings: settingsDialog, printRoot: printRoot, printNow: printNow, dialog: dialog };
})();
