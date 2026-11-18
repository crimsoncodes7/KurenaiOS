/* Kurenai OS — modules/topic.js
   The topic page (Graphite frame 8b, invariant 52): the title and path, one static
   study-nav with the tabs, the material, and the inspector as the single state surface.
   Split out of hub.js (W8, the quality audit's AP-09); the shared
   derivations, the spine and the spec renderers stay in hub.js and
   reach this file through KOS.hub._. */
(function () {
  "use strict";
  var el = KOS.ui.el, store = KOS.store, H = KOS.hub._;
  var BYREF = H.BYREF, CHECKS = H.CHECKS, LEAVES = H.LEAVES, LESSONISH = H.LESSONISH, PAPER_NOTE = H.PAPER_NOTE, STATUS = H.STATUS,
    STATUS_GLYPH = H.STATUS_GLYPH, SUBJ_HUE = H.SUBJ_HUE, TYPESET_SPEC = H.TYPESET_SPEC, applyTreeCollapsed = H.applyTreeCollapsed, debounce = H.debounce, hm = H.hm,
    leafPercent = H.leafPercent, markFreshNote = H.markFreshNote, paperLabel = H.paperLabel, pctText = H.pctText, ratioText = H.ratioText, renderSpecContent = H.renderSpecContent,
    renderSpecInfo = H.renderSpecInfo, renderTree = H.renderTree, tone = H.tone, topicStats = H.topicStats, treeOpenButton = H.treeOpenButton;

  /* the topic tab on screen, kept in memory so a redraw reopens it */
  var openTabMemo = { key: null, tab: null };
  /* a tab asked for once, from inside the topic page itself (the
     inspector's Quiz best → the quiz's history): a show of the page on
     screen keeps its open tab, so the request rides beside it */
  var tabAsk = null;

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
    /* Code lessons (frames 26c–26e): the same page, with Learn | Reference,
       runnable listings, Practice and Tasks, and an evidence inspector */
    var cx = sid === "code" && KOS.codeTopic ? KOS.codeTopic.begin(ref)
      /* Japanese lessons (frame 28e): voiced examples, the page picker, evidence by skill */
      : sid === "ja" && KOS.jaTopic ? KOS.jaTopic.begin(ref)
      /* Creatives lessons (frames 31c–31e): micro-studies, "Good for this unit", the project */
      : sid === "creatives" && KOS.crTopic ? KOS.crTopic.begin(ref)
      /* Mind lessons (frames 32d–32f): six named pages, the one prompt, the dialogue, the ladder */
      : sid === "mind" && KOS.mindTopic ? KOS.mindTopic.begin(ref) : null;

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
    if (cx) cx.decoratePath(pathLine, leaf);
    if (leaf.section.paper) {
      var note = (PAPER_NOTE[sid] || {})[paperLabel(sid, leaf.section.paper)];
      pathLine.appendChild(el("span", { class: "k-topic-sep", "aria-hidden": "true", text: "·" }));
      pathLine.appendChild(document.createTextNode(note ? note[0] : paperLabel(sid, leaf.section.paper)));
    }
    /* 15d, the phone header: ☰ (the spine drawer), the parent unit on one
       line, and the status chip — the topic's RAG dot and mastery — which
       opens the inspector as a sheet; under the title, one mono line of
       reference, subject and paper instead of the full path */
    var band = KOS.rag.effective(sid, ref).band;
    var statusChip = el("button", { type: "button", class: "k-chip k-topic-pchip", "data-ui": "topic.status-chip", "aria-haspopup": "dialog",
      "aria-label": "Topic status: " + pctText(leafPercent(sid, ref)) + (band ? ", " + KOS.rag.BANDS[band].label + " confidence" : "") + ". Open the inspector",
      onclick: function () { openInspectorSheet(); } }, [
      el("span", { class: "k-topic-pdot", "data-band": band || null, "aria-hidden": "true" }),
      "◐ " + pctText(leafPercent(sid, ref))
    ]);
    var paperNote = leaf.section.paper ? ((PAPER_NOTE[sid] || {})[paperLabel(sid, leaf.section.paper)] || [paperLabel(sid, leaf.section.paper)])[0] : null;
    var head = el("header", { class: "k-topic-head", "data-ui": "topic.head" }, [
      el("div", { class: "k-topic-prow" }, [
        treeOpenButton(),
        el("span", { class: "k-topic-pparent", text: leaf.section.ref + " " + leaf.section.title }),
        statusChip
      ]),
      el("div", { class: "k-topic-titles" }, [
        el("div", { class: "k-topic-titlerow" }, [
          el("h1", { class: "k-topic-title", text: leaf.title }),
          el("span", { class: "k-topic-ref", "data-ui": "gov.seal", text: leaf.ref })
        ]),
        pathLine,
        el("p", { class: "k-topic-pmeta", text: [leaf.ref, d.name, paperNote].filter(Boolean).join(" · ") })
      ]),
      /* the ONE spine opener rides the phone row (a display:contents
         wrapper above the phone tier), so it is not repeated here */
      el("div", { class: "k-topic-steps" }, [stepBtn(prevLeaf, "prev"), stepBtn(nextLeaf, "next")])
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
      /* the one ink surface among the tabs (design turn 30c): always
         present, its count the pages with ink (invariant 77) */
      ["ink", "Handwritten", !!(KOS.ink && KOS.inkTab), inkCount()],
      ["worked", "Worked examples", mats.worked, mats.worked],
      ["sim", "Simulations", mats.sim, mats.sim],
      ["files", "Files", true, null]
    ].filter(function (t) { return t[2]; });
    if (cx) TABDEFS = cx.tabs(mats);

    function inkCount() { var w = KOS.ink && KOS.ink.written(KOS.ink.topicDoc(sid, ref)); return w ? w.n : null; }
    var tabBar = el("div", { class: "k-topic-tabs", "data-ui": "ui.tabs topic.tabs", role: "tablist", "aria-label": "Study material" });
    var panel = el("div", { class: "k-topic-panel", "data-ui": "study.panel", role: "tabpanel" });
    var curTab = cx ? cx.firstTab() : (content && content.notes && content.notes.length) ? "notes" : "spec";
    var EDIT_KIND = { spec: "spec", notes: "notes", cards: "flashcards", quiz: "quiz", exam: "exam" };
    /* a study space whose tabs are its own names one the editor can edit (Mind's Lesson: your notes) */
    if (cx && cx.editKinds) Object.keys(cx.editKinds).forEach(function (t) { EDIT_KIND[t] = cx.editKinds[t]; });
    var editing = store.state.ui.editing;
    if (editing && editing.sid === sid && editing.ref === ref && editing.tab && EDIT_KIND[editing.tab]) curTab = editing.tab;
    else editing = null;
    /* a file's "Where it's linked" opens the topic on its Files tab */
    if (!editing && arg && arg.tab === "files") curTab = "files";
    /* the inspector's Quiz best opens the quiz's history; Due's questions
       open the topic on their tab (5.19 item 4) */
    var quizView = !editing && arg && arg.tab === "quiz" && arg.view === "history" ? "history" : null;
    if (!editing && arg && (arg.tab === "quiz" || arg.tab === "exam") && TABDEFS.some(function (t) { return t[0] === arg.tab; })) curTab = arg.tab;
    /* a redraw (a cloud pull, a habit ticking itself) keeps the tab that
       was open; it used to drop the reader back on Notes mid-question */
    var topicKey = sid + ":" + ref;
    if (!editing && KOS.ui.redrawing && openTabMemo.key === topicKey && TABDEFS.some(function (t) { return t[0] === openTabMemo.tab; })) curTab = openTabMemo.tab;
    if (tabAsk && tabAsk.key === topicKey && !editing) { curTab = tabAsk.tab; if (tabAsk.view) quizView = tabAsk.view; }
    tabAsk = null;
    openTabMemo = { key: topicKey, tab: curTab };

    function selectTab(id) {
      curTab = id;
      openTabMemo = { key: topicKey, tab: id };
      paintTabs();
      openTab();
    }
    TABDEFS.forEach(function (t) {
      tabBar.appendChild(el("button", { type: "button", class: "k-topic-tab", "data-ui": "ui.tab", role: "tab",
        "data-tab": t[0], "data-label": t[1], onclick: function () { selectTab(t[0]); } },
        [t[0] === "ink" && KOS.inkUI ? KOS.inkUI.glyph("pen") : null, t[1],
          t[3] ? el("span", { class: "k-mono", "data-ui": "ui.tab-count", text: String(t[3]) }) : null].filter(Boolean)));
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
        /* the editor edits five kinds; while it is open the tabs it cannot
           edit (Worked, Simulate, Files) step aside instead of throwing the
           user out of it (review A) */
        b.hidden = !!editing && !EDIT_KIND[b.dataset.tab];
      });
      moreSlot.innerHTML = "";
      var hidden = [];
      /* on a phone all eight tabs ride one scroller instead (15d) */
      var phoneTier = window.matchMedia && window.matchMedia("(max-width: 700px)").matches;
      if (tabBar.clientWidth > 0 && !phoneTier) {
        /* the "+N" button takes room from the tabs (they share the row), so the fold is
           measured with a probe of its size in place from the first fold on */
        for (var i = btns.length - 1; i >= 0 && tabBar.scrollWidth > tabBar.clientWidth; i--) {
          if (btns[i].dataset.tab === curTab || btns[i].hidden) continue;
          if (!moreSlot.children.length) moreSlot.appendChild(el("span", { class: "k-btn k-btn--quiet k-topic-more-probe", text: "+8" }));
          btns[i].hidden = true;
          hidden.unshift(btns[i]);
        }
      }
      function moreMenu() {
        moreSlot.innerHTML = "";
        if (!hidden.length) return;
        moreSlot.appendChild(KOS.ui.menu({ label: "+" + hidden.length, className: "k-btn--quiet k-topic-more-btn", hint: "More study material", align: "start", panelClass: "k-topic-more-pop",
          items: hidden.map(function (b) {
            var n = b.querySelector("[data-ui~='ui.tab-count']");
            return { label: (b.getAttribute("data-label") || b.firstChild.textContent) + (n ? " · " + n.textContent : ""),
              onSelect: function () { selectTab(b.dataset.tab); } };
          }) }));
      }
      moreMenu();
      /* the real menu can be a few pixels wider than the probe: fold one more rather than
         leave a clipped tab and a scroll arrow beside it */
      if (hidden.length && tabBar.scrollWidth > tabBar.clientWidth) {
        var last = btns.filter(function (b) { return !b.hidden && b.dataset.tab !== curTab; }).pop();
        if (last) { last.hidden = true; hidden.unshift(last); moreMenu(); }
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
    /* WORKING BESIDE ANY TAB (asked for 26 October 2026): a page beside the
       flashcards, the quiz, an exam question or the notes, for the working a
       question needs. It is for this visit and this tab only: every tab
       opens without it and every opening is a blank page, so a revision tool
       started again never shows the working from last time. Earlier working
       is kept (its doc's item is "work:<sid>:<ref>:<tab>") and linked from
       the pane and from the Handwritten tab. */
    var workBtn = el("button", { type: "button", class: "k-btn k-btn--sm k-topic-work", "data-ui": "topic.work", "aria-pressed": "false",
      onclick: function () { setWork(!workPad); } }, [el("span", { "aria-hidden": "true", text: "✎" }), el("span", { text: "Working" })]);
    var workPane = el("aside", { class: "k-topic-workpane", "data-ui": "topic.workpane", "aria-label": "Your working", hidden: "" });
    var workPad = null;
    var TAB_NAME = {};
    function setWork(on) {
      if (workPad) { workPad.destroy(); workPad = null; }
      workPane.innerHTML = "";
      workPane.hidden = !on;
      workBtn.setAttribute("aria-pressed", String(!!on));
      KOS.ui.state(workBtn, "on", !!on);
      KOS.ui.state(studyCol, "work", !!on);
      if (on) {
        var item = "work:" + sid + ":" + ref + ":" + curTab, name = TAB_NAME[curTab] || "this tab";
        var early = KOS.inkPad.earlierLink(item, null, "Earlier working");
        workPane.appendChild(el("div", { class: "k-topic-workhead" }, [
          el("span", { class: "k-kicker", text: "Working · " + name }), early,
          el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "topic.work-close", "aria-label": "Close the working page", text: "✕", onclick: function () { setWork(false); } })
        ].filter(Boolean)));
        workPad = KOS.inkPad.mount(workPane, { kind: "page", prefix: "work", item: item, title: "Working · " + name, q: curTab,
          paper: sid === "maths" ? "squared" : "lined" });
        /* the question in view, for Check my working (30k): an exam
           question's part, a card's front, else the topic */
        var qNow = function () {
          var n = panel.querySelector("[data-ui~='quiz.exam'] .k-qz-part-t, [data-ui~='fc.front'] .k-fc-text, [data-ui~='quiz.card'] .k-qz-q");
          return n ? n.textContent.replace(/\s+/g, " ").trim() : leaf.ref + " " + leaf.title;
        };
        var tools = el("div", { class: "k-topic-worktools" });
        if (sid === "maths" && KOS.inkDrills) {
          var mp = null;
          tools.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "topic.work-maths", "aria-pressed": "false", text: "Calculator · booklet", onclick: function (e) {
            var b = e.currentTarget;
            if (mp) { mp.remove(); mp = null; b.setAttribute("aria-pressed", "false"); return; }
            mp = KOS.inkDrills.mathsPanel(sid, ref);
            workPane.insertBefore(mp, workPad.node);
            b.setAttribute("aria-pressed", "true");
          } }));
        }
        var chk = KOS.inkDrills ? KOS.inkDrills.checkButton(workPad, qNow, workPane) : null;
        if (chk) tools.appendChild(chk);
        if (tools.childNodes.length) workPane.insertBefore(tools, workPad.node);
        KOS.a11y.announce("A blank working page beside " + name + ".");
      }
      if (window.innerWidth > 1080) inkSide(!!on);
    }
    function paintWorkBtn() { workBtn.hidden = !KOS.inkPad || curTab === "ink" || curTab === "files" || !!editing; }
    /* the Handwritten tab's Page · All pages switch and its menus: a line
       of their own under the tabs (in the tab row they squeezed the tabs
       down to "Handwritten +7" on the iPad) */
    var inkSlot = el("div", { class: "k-topic-inkmode", "data-ui": "topic.inkmode" });
    var inkCtl = null;
    /* the tab's count follows the notebook (the first stroke makes it) */
    function onInk(e) {
      if (!tabBar.isConnected) { window.removeEventListener("kos-ink", onInk); return; }
      var doc = e.detail && e.detail.doc;
      if (doc && doc !== KOS.ink.topicDoc(sid, ref)) return;
      var b = tabBar.querySelector('[data-tab="ink"]');
      if (!b) return;
      var n = inkCount(), c = b.querySelector("[data-ui~='ui.tab-count']");
      if (!n) { if (c) c.remove(); return; }
      if (!c) { c = el("span", { class: "k-mono", "data-ui": "ui.tab-count" }); b.appendChild(c); }
      c.textContent = String(n);
    }
    if (KOS.ink) KOS.view.listen(tabBar, window, "kos-ink", onInk);
    var studyNav = el("div", { class: "k-topic-nav", "data-ui": "topic.nav" }, [
      el("div", { class: "k-topic-tabrow" }, [KOS.ui.scroller(tabBar, { keepRole: true, prevLabel: "Earlier material", nextLabel: "More material" }), moreSlot, workBtn, editBtn,
        cx ? cx.modeSwitch() : null]),
      inkSlot,
      pagerSlot
    ]);

    var studyGrid = el("div", { class: "k-topic", "data-ui": "study.grid" });
    if (store.state.ui.inspectorOpen === false) KOS.ui.state(studyGrid, "insp-closed", true);
    var studyCol = el("div", { class: "k-topic-col", "data-ui": "study.col" }, [head, studyNav, el("div", { class: "k-topic-workgrid", "data-ui": "topic.workgrid" }, [panel, workPane])]);
    TABDEFS.forEach(function (t) { TAB_NAME[t[0]] = t[1]; });
    studyGrid.appendChild(studyCol);
    /* a subject with its own Ask Kurenai in the inspector (Mind's four modes) opts out: cx.assistStrip === false */
    var asstStrip = KOS.assistant && KOS.assistant.contextActions && !(cx && cx.assistStrip === false)
      ? KOS.assistant.contextActions("ref", { subject: sid, ref: ref, title: leaf.title })
      : null;
    var inspector = buildInspector(studyGrid, sid, ref, cx ? cx.status() : ctl, asstStrip, cx);
    studyGrid.appendChild(inspector);
    /* the inspector as a phone sheet: the same aside, moved in and back */
    function openInspectorSheet() {
      var home = inspector.parentNode, next = inspector.nextSibling;
      var close = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "aria-label": "Close the inspector", text: "✕" });
      var box = el("section", { class: "k-dialog k-insp-sheet", "data-ui": "ui.dialog topic.inspector-sheet", "aria-label": "Inspector" }, [
        el("div", { class: "k-dialog-head", "data-ui": "ui.dialog-head" }, [
          el("div", {}, [el("h2", { class: "k-dialog-title", text: "Inspector" }), el("span", { class: "k-insp-sheet-sub", text: leaf.ref + " " + leaf.title })]),
          close]),
        inspector
      ]);
      var ov = el("div", { class: "k-dialog-overlay" }, [box]);
      ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
      close.addEventListener("click", function () { ov.remove(); });
      KOS.ui.openDialog(ov, { onClose: function () {
        if (home.isConnected) home.insertBefore(inspector, next && next.parentNode === home ? next : null);
      } });
    }
    var editorHost = el("div", { class: "k-topic-editor", hidden: "" });
    studyGrid.appendChild(editorHost);
    main.appendChild(studyGrid);
    /* iPad landscape with the rail and the tree open leaves the reading
       column a phone's width beside the inspector. Below FLOAT_AT the
       inspector folds to its spine and opens OVER the page instead (state
       insp-float); opening it there is for this visit only, so the saved
       preference never covers the notes on the next topic. */
    var FLOAT_AT = 844;
    function floatCheck() {
      if (!studyGrid.isConnected) { if (floatRO) floatRO.disconnect(); return; }
      var on = !editing && (KOS.ui.hasState(studyGrid, "ink-side") || (window.innerWidth > 1080 && studyGrid.clientWidth > 0 && studyGrid.clientWidth < FLOAT_AT));
      if (on === KOS.ui.hasState(studyGrid, "insp-float")) return;
      KOS.ui.state(studyGrid, "insp-float", on);
      KOS.ui.state(studyGrid, "insp-closed", on || KOS.ui.hasState(studyGrid, "files-tab") || store.state.ui.inspectorOpen === false);
      inspector.paintToggle(KOS.ui.hasState(studyGrid, "insp-closed"));
    }
    var floatRO = window.ResizeObserver ? new ResizeObserver(floatCheck) : null;
    if (floatRO) floatRO.observe(studyGrid);
    floatCheck();
    /* Handwritten's side by side (30e) takes the width: the spine folds to
       its strip and the inspector to its spine, opening over the panes —
       for the view only, so neither saved choice changes */
    function inkSide(on) {
      KOS.ui.state(studyGrid, "ink-side", on);
      if (on && KOS.shell.tree() === "open") KOS.shell.tree("closed");
      if (!on) applyTreeCollapsed();
      KOS.ui.state(studyGrid, "insp-float", false);
      floatCheck();
      if (!KOS.ui.hasState(studyGrid, "insp-float")) {
        KOS.ui.state(studyGrid, "insp-closed", KOS.ui.hasState(studyGrid, "files-tab") || store.state.ui.inspectorOpen === false);
        inspector.paintToggle(KOS.ui.hasState(studyGrid, "insp-closed"));
      }
    }
    studyCol.addEventListener("pointerdown", function () {
      if (!KOS.ui.hasState(studyGrid, "insp-float") || KOS.ui.hasState(studyGrid, "insp-closed")) return;
      KOS.ui.state(studyGrid, "insp-closed", true);
      inspector.paintToggle(true);
    });

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
      if (workPad) setWork(false);
      paintWorkBtn();
      store.save();
      KOS.ui.state(studyGrid, "editing", true);
      KOS.ui.state(studyGrid, "insp-float", false);
      KOS.ui.state(studyGrid, "insp-closed", false);
      paintTabs();
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
      if (cx && cx.editKinds) openTab({ keep: true });   // a study space shows the page being edited (Mind: Your notes)
      KOS.a11y && KOS.a11y.announce && KOS.a11y.announce("Editing " + KOS.editor.KIND_LABEL[kind] + ".");
    }
    function closeEditor() {
      editing = null;
      store.state.ui.editing = null;
      paintWorkBtn();
      store.save();
      if (editorCtl) editorCtl.destroy();
      editorCtl = null;
      editorHost.hidden = true;
      inspector.hidden = false;
      KOS.ui.state(studyGrid, "editing", false);
      KOS.ui.state(studyGrid, "insp-closed", KOS.ui.hasState(studyGrid, "insp-float") || store.state.ui.inspectorOpen === false);
      floatCheck();
      paintTabs();
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
    /* W2 (SY-02, ST-36, CC-18): the notes page being read is the topic's
       own, kept while the app stays loaded — a redraw, Back from a diagram
       and coming back to the topic all find it */
    var noteMemo = KOS.view ? KOS.view.keep("notePage", { n: 0 }, "topic:" + sid + ":" + ref) : { n: 0 };
    var KIND_WORD = { spec: "specification", notes: "notes", flashcards: "flashcards", quiz: "quiz", exam: "exam questions" };
    function staleNotice(kind) {
      var word = KIND_WORD[kind] || kind;
      function done(msg) { KOS.a11y.announce(msg); openTab({}); }
      return el("div", { class: "k-banner k-topic-stale", role: "status", "data-ui": "topic.stale" }, [
        el("p", { class: "k-banner-text", text: "The " + word + " for this topic were updated after you edited them. You are seeing your copy." }),
        el("div", { class: "k-banner-actions" }, [
          el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "topic.stale-merge", text: "New version + my additions",
            onclick: function () { KOS.edits.takeNew(sid, ref, kind, { withMine: true }); done("The new " + word + ", with the rows you added at the end."); } }),
          el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "topic.stale-new", text: "Use the new version",
            onclick: function () {
              KOS.ui.confirm({ danger: true, title: "Use the new " + word + "?", body: "Your edits to this topic's " + word + " are replaced by the current curriculum. Your flashcards keep their schedules.", confirm: "Use the new version" },
                function () { KOS.edits.takeNew(sid, ref, kind); done("Showing the new " + word + "."); });
            } }),
          el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "topic.stale-keep", text: "Keep mine",
            onclick: function () { KOS.edits.keepMine(sid, ref, kind); done("Kept your " + word + "."); } })
        ])
      ]);
    }
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
        KOS.ui.state(studyGrid, "insp-closed", KOS.ui.hasState(studyGrid, "insp-float") || store.state.ui.inspectorOpen === false);
      }
      /* the page control lives in the nav, outside the panel, so a tab
         change clears it too */
      pagerSlot.innerHTML = "";
      if (inkCtl) { inkCtl.destroy(); inkCtl = null; }
      if (workPad && !o.keep) setWork(false);
      paintWorkBtn();
      panel.innerHTML = "";
      /* CM-04: your edit hides a curriculum that has moved since */
      var staleKind = EDIT_KIND[curTab];
      if (staleKind && !editing && KOS.edits.stale && KOS.edits.stale(sid, ref, staleKind)) panel.appendChild(staleNotice(staleKind));
      if (curTab === "ink" && KOS.inkTab) {
        inkCtl = KOS.inkTab.mount(panel, sid, ref, { modeSlot: inkSlot, onSide: inkSide });
      }
      else if (curTab === "spec") {
        var specFork = KOS.edits.has(sid, ref, "spec") || editing ? KOS.edits.material(sid, ref, "spec") : null;
        /* frame 23c: a break moved by hand splits the reading order there;
           with none the lists keep their own columns */
        var cols = specFork ? KOS.edits.specColumns(sid, ref) : null;
        var leftBlocks = cols ? cols.left.content.concat(cols.left.info) : specFork ? specFork.content : null;
        var rightBlocks = cols ? cols.right.content.concat(cols.right.info) : specFork ? specFork.info : null;
        var specL = el("div", { class: "k-prose k-spec", "data-ui": "topic.spec" + (specFork ? " topic.notes" : ""),
          html: specFork ? KOS.content.renderBlocks(leftBlocks) : renderSpecContent(leaf.content) });
        var split = el("div", { class: "k-spec-split" }, [card(d.labelL, specL)]);
        var right = el("div", { class: "k-spec-side" });
        if (specFork ? rightBlocks.length : leaf.info.length) {
          var specR = el("div", { class: "k-prose k-spec", "data-ui": specFork ? "topic.notes" : null,
            html: specFork ? KOS.content.renderBlocks(rightBlocks) : renderSpecInfo(leaf.info, { typeset: TYPESET_SPEC[sid] }) });
          right.appendChild(card(d.labelR, specR));
          markFreshNote(specR, sid, ref);
        }
        renderIntel(right);
        split.appendChild(right);
        panel.appendChild(split);
        /* the Maths spec is typeset LaTeX (tools/maths_spec.py, CM-01) */
        if (specFork || TYPESET_SPEC[sid]) { KOS.content.typeset(specL); KOS.content.typeset(split); }
        if (o.reveal) revealBlock(o.reveal);
        var ta = el("textarea", { class: "k-input k-topic-note", "data-ui": "ui.note-area",
          "aria-label": "Your notes on " + leaf.ref,
          placeholder: "Anything you want future-you to remember about " + leaf.ref + "…",
          oninput: debounce(function () { store.setNote(sid, ref, ta.value); }, 350) });
        ta.value = prog().note || "";
        panel.appendChild(card("Your notes on this spec point", ta));
      }
      else if (cx && cx.owns(curTab, !!editing)) {
        cx.render(curTab, panel, pagerSlot, { reveal: o.reveal, keep: o.keep, writeBtn: writeBtn });
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
          var article = el("article", { class: "k-prose k-notes", "data-ui": "topic.notes", "data-topic": sid + ":" + ref });
          var cur = Math.max(0, Math.min(pages.length - 1, noteMemo.n || 0));
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
              noteMemo.n = cur;
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
            noteMemo.n = 0;
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
          KOS.quiz.mountMCQ(qHolder, sid, ref, content.quiz, { runKey: "quiz:" + sid + ":" + ref, afterLog: KOS.view.redrawIfStill(), view: quizView });
          quizView = null;
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
          KOS.quiz.mountMCQ(cqHolder, sid, ref, customQ, { runKey: "quizc:" + sid + ":" + ref, afterLog: KOS.view.redrawIfStill() });
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
          KOS.quiz.mountExam(eHolder, sid, ref, content.exam, { runKey: "exam:" + sid + ":" + ref });
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
          /* the enrichment layer gates here; the core tabs never do. A lab
             carries the shared header and, locked, keeps its shape (20a, 20i) */
          if (sm.mount) {
            KOS.sims.embed(panel, sm);
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
  /* "Pages written" (design turn 30d): pages with ink and when the last
     was written, printed only when there is one (invariant 77); writing is
     evidence of its own, never a status check */
  function inkRow(sid, ref) {
    if (!KOS.ink) return null;
    var key = KOS.ink.topicDoc(sid, ref);
    var val = el("strong", { "data-ui": "topic.pages-written" });
    var row = el("li", {}, [el("span", { text: "Pages written" }), val]);
    function paint() {
      var w = KOS.ink.written(key);
      row.hidden = !w;
      if (w) val.textContent = w.n + " · " + inkWhen(w.at);
    }
    function onInk(e) {
      if (!row.isConnected) { window.removeEventListener("kos-ink", onInk); return; }
      var doc = e.detail && e.detail.doc;
      if (!doc || doc === key) paint();
    }
    KOS.view.listen(row, window, "kos-ink", onInk);
    paint();
    return row;
  }
  function inkWhen(ts) {
    if (!ts) return "";
    var d = new Date(ts), hm = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    return d.toDateString() === new Date().toDateString() ? "today " + hm : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  function buildInspector(grid, sid, ref, statusComponent, asstStrip, cx) {
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
    var qzBest = qz ? (KOS.quiz && KOS.quiz.bestPct ? KOS.quiz.bestPct(sid, ref, qz) : qz.best) : null;
    /* a Code lesson's inspector reads evidence: concepts, proof in code and
       the next practice (frame 26c) — not the recall record */
    if (cx) cx.inspectorBody(body, t);
    else body.appendChild(sec("Recall record", [
      count("Card views", t.seen),
      li("Recall accuracy", t.accuracy == null ? "" : pctText(t.accuracy), t.accuracy == null),
      count("Lapses", t.lapses),
      li("Recall today", t.memory.recall == null ? "" : "≈ " + pctText(Math.round(100 * t.memory.recall)), t.memory.recall == null),
      t.memory.leeches ? count("In Rework", t.memory.leeches) : null,
      /* Quiz best opens the quiz's history, weakest first (5.19 item 4, 44c) */
      qzBest != null && KOS.questions ? el("li", {}, [el("span", { text: "Quiz best" }),
        el("button", { type: "button", class: "k-link k-insp-link", "data-ui": "topic.quiz-history", "aria-label": "Quiz best " + pctText(qzBest) + " — open the quiz's history",
          onclick: function () { tabAsk = { key: sid + ":" + ref, tab: "quiz", view: "history" }; KOS.show("ref", { subject: sid, ref: ref }); } }, [el("strong", { text: pctText(qzBest) }), " →"])])
        : li("Quiz best", qzBest != null ? pctText(qzBest) : "", qzBest == null),
      count("Quiz attempts", qz ? qz.attempts || 0 : 0),
      count("Exam questions logged", t.examLogged),
      inkRow(sid, ref)
    ].filter(Boolean)));
    var nextTxt = t.due ? t.due + " due now" : t.next ? t.next : t.reviewed ? "all scheduled" : "";
    if (!cx) body.appendChild(sec("Next review", [
      li("Review queue", nextTxt, !nextTxt),
      li("Cards scheduled", ratioText(t.reviewed, t.cards), !t.cards),
      t.memory.held ? count("Held for an exam", t.memory.held) : null,
      li("Sessions here", t.sessions + (t.minutes ? " · " + t.minutes + " min" : ""), !t.sessions)
    ].filter(Boolean)));
    /* frame 23a: the quick note — always open, no Save. What is typed is
       a draft for this device (KOS.edits.setDraft); leaving the topic files
       it as one dated block at the end of the Spec tab (invariant 89) */
    if (KOS.edits && KOS.spec && KOS.spec.level(sid, ref) === "leaf") {
      var qn = el("textarea", { class: "k-input k-insp-qn", "data-ui": "topic.quick-note", rows: "3", placeholder: "Quick note…",
        "aria-label": LESSONISH[sid] ? "Quick note. It files to the lesson's notes when you leave this lesson." : "Quick note. It files to the Specification tab when you leave this topic." });
      qn.value = KOS.edits.draft(sid, ref);
      var qnHint = el("p", { class: "k-insp-qn-hint", "data-ui": "topic.quick-note-hint" });
      var paintQn = function () {
        var n = qn.value.trim().length;
        var whereTo = LESSONISH[sid] ? "Notes when you leave this lesson." : "Spec when you leave this topic.";
        qnHint.textContent = n ? "Draft · " + n + (n === 1 ? " character" : " characters") + ". Files to " + whereTo : "Files to " + whereTo;
        KOS.ui.state(qn, "draft", n > 0);
      };
      qn.addEventListener("input", function () { KOS.edits.setDraft(sid, ref, qn.value); paintQn(); });
      paintQn();
      body.appendChild(el("section", { class: "k-insp-sec k-insp-qnsec", "aria-label": "Quick note" }, [
        el("h2", { class: "k-kicker", text: "Quick note" }), qn, qnHint
      ]));
    }
    if (asstStrip) {
      body.appendChild(el("section", { class: "k-insp-sec k-insp-asst", "aria-label": "Ask Kurenai" }, [
        el("h2", { class: "k-kicker", text: "Ask Kurenai" }), asstStrip
      ]));
    }

    var toggle = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "topic.inspector-toggle",
      onclick: function () {
        var closed = KOS.ui.state(grid, "insp-closed");
        if (!KOS.ui.hasState(grid, "insp-float")) {
          store.state.ui.inspectorOpen = !closed;
          store.save();
        }
        paintToggle(closed);
      } });
    function paintToggle(closed) {
      toggle.textContent = closed ? "‹" : "›";
      toggle.setAttribute("aria-expanded", String(!closed));
      toggle.setAttribute("aria-label", closed ? "Expand study inspector" : "Collapse study inspector");
    }
    paintToggle(grid.matches('[data-state~="insp-closed"]'));

    /* Reference mode: the inspector becomes "On this page" (frame 26d) */
    if (cx && cx.reference()) { body.innerHTML = ""; cx.onThisPage(body); }
    var aside = el("aside", { class: "k-insp", "data-ui": "topic.inspector", "aria-label": "Study inspector" }, [
      el("div", { class: "k-insp-head" }, [
        el("span", { class: "k-insp-title", text: "Inspector" }),
        /* the collapsed panel keeps a readable spine so it can be found */
        el("span", { class: "k-insp-spine", "data-ui": "topic.inspector-spine", "aria-hidden": "true", text: "Inspector" }),
        toggle
      ]),
      body
    ]);
    aside.paintToggle = paintToggle;
    return aside;
  }
})();
