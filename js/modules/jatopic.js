/* Kurenai OS — modules/jatopic.js (KOS.jaTopic)
   A Japanese lesson on the shared topic page (design 28e, built like Code's 26c). hub.js's
   KOS.views.ref stays the one topic page; for a Japanese lesson it asks this module for what differs,
   through begin(ref):
     decoratePath   "Japanese / Stage 0 / H Hiragana · R W", the skills the lesson trains
     modeSwitch     Learn | Reference
     tabs           Notes · Practice · Reviews · Files
     render         Notes (Learn: one page at a time with the page picker; Reference: every page in
                    one column), Practice (the lesson's session) and Reviews (its facets' schedule)
     status / inspectorBody   the inspector: four checks from evidence, evidence by skill, the kana
                    or words, next practice
     spine          Core | Media, with each stage's emblem kanji
   Lesson content is KOS_CONTENT["ja:<ref>"] = { pages: [{ t, blocks }] }, blocks being
   { p } · { h } · { line: { who, ja, en } } · { kana: [chars] } · { pair: [a, b] } ·
   { callout: { t, body } } · { table: { head, rows } } · { panel: { img, balloons } }.
   Reading evidence is written through KOS.ja (a page read after a dwell, a line heard); nothing else
   here writes. The mode is per device (state.ui.japanese).                                       */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var SID = "ja";
  var DWELL = 2500, LEAVE = 1500;
  function U() { return KOS.ja.ui(); }
  function UI() { return KOS.jaUI; }
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  function evidenceChanged(ref) { document.dispatchEvent(new window.CustomEvent("kos:ja-evidence", { detail: { ref: ref } })); }

  /* ================= the spine ================= */
  function spine(tree, list) {
    var ui = U(), mode = ui.spine === "media" ? "media" : "core";
    var seg = el("div", { class: "k-seg k-seg--fill k-ja-spineseg", "data-ui": "ja.spine-mode", role: "group", "aria-label": "Curriculum" },
      [["core", "Core"], ["media", "Media"]].map(function (m) {
        return el("button", { type: "button", class: "k-seg-item", "aria-pressed": String(mode === m[0]), text: m[1],
          onclick: function () { ui.spine = m[0]; KOS.store.save(); KOS.rerender(); } });
      }));
    tree.insertBefore(seg, tree.querySelector(".k-spine-filter-wrap"));
    if (mode === "media") {
      list.appendChild(el("div", { class: "k-spine-stage", text: "Media" }));
      list.appendChild(el("p", { class: "k-ja-spine-note", text: "Manga, visual novels and your own videos arrive with the reader and media release." }));
      return { tracks: true };
    }
    var STAGES = (window.KOS_JA && window.KOS_JA.STAGES) || [];
    return {
      tracks: false,
      stageHead: function (stage) {
        var st = STAGES[stage] || {};
        return el("div", { class: "k-spine-stage k-ja-spine-stage", "data-ui": "ja.spine-stage" }, [
          el("span", { class: "k-ja-emblem", lang: "ja", "aria-hidden": "true", text: st.kanji || "" }),
          "Stage " + stage + " · " + (st.name || "")
        ]);
      }
    };
  }

  /* ================= the topic page ================= */
  function begin(ref) {
    var L = KOS.ja.lesson(ref);
    var content = KOS.ja.content(ref);
    var pages = content && content.pages ? content.pages : [];
    var ui = U();
    var refMode = function () { return ui.mode === "reference" && pages.length > 0; };
    var ctx = {};
    /* the skills the lesson trains: kana read and write; words and grammar read, listen, and write
       once held; a sound pair listens */
    var skills = !L ? [] : ["R", "W", "L"].filter(function (sk) {
      return L.items.some(function (k) { return sk === "L" ? /^[swg]:/.test(k) : sk === "W" ? /^(k:.$|g:)/.test(k) || (L.produce || []).length : /^[kwjg]:/.test(k); });
    });

    ctx.decoratePath = function (pathLine) {
      pathLine.innerHTML = "";
      var unit = null, stage = null;
      (window.KOS_JA.STAGES || []).forEach(function (st, i) { st.units.forEach(function (u) { if (L && u.id === L.unit) { unit = u; stage = i; } }); });
      ["Japanese", stage != null ? "Stage " + stage : "", unit ? unit.id + " " + unit.name : ""].filter(Boolean).forEach(function (bit, i) {
        if (i) pathLine.appendChild(el("span", { class: "k-topic-sep", "aria-hidden": "true", text: "/" }));
        pathLine.appendChild(document.createTextNode(bit));
      });
      if (skills.length) {
        pathLine.appendChild(el("span", { class: "k-topic-sep", "aria-hidden": "true", text: "·" }));
        pathLine.appendChild(el("span", { class: "k-ja-pathskills", "aria-label": "Skills: " + skills.map(function (s) { return UI().SKILL[s]; }).join(", ") },
          skills.map(function (s) { return UI().skill(s, { label: false }); })));
      }
    };
    ctx.modeSwitch = function () {
      if (!pages.length) return null;
      var mode = refMode() ? "reference" : "learn";
      return el("span", { class: "k-seg k-seg--quiet k-ja-mode", "data-ui": "ja.mode", role: "group", "aria-label": "Reading mode" },
        [["learn", "Learn"], ["reference", "Reference"]].map(function (m) {
          return el("button", { type: "button", class: "k-seg-item", "aria-pressed": String(mode === m[0]), text: m[1],
            onclick: function () { if (mode === m[0]) return; ui.mode = m[0]; KOS.store.save(); KOS.rerender(); announce(m[1] + " mode."); } });
        }));
    };
    var facetKeys = function () {
      var j = KOS.ja.peek(), mine = {};
      (L ? L.items : []).forEach(function (k) { mine[k] = 1; });
      return Object.keys(j.facets).filter(function (k) { return mine[KOS.jaSrs.split(k).item]; });
    };
    ctx.tabs = function () {
      var nf = facetKeys().length;
      return [
        ["notes", "Notes", true, pages.length > 1 ? pages.length : null],
        ["practice", "Practice", true, L ? L.items.length : null],
        ["reviews", "Reviews", true, nf || null],
        ["files", "Files", true, null]
      ];
    };
    ctx.firstTab = function () { return "notes"; };
    ctx.owns = function (tab, editing) { return tab === "practice" || tab === "reviews" || (tab === "notes" && !editing); };
    ctx.reference = refMode;
    ctx.render = function (tab, panel, pagerSlot) {
      if (tab === "practice") return renderPractice(panel);
      if (tab === "reviews") return renderReviews(panel);
      if (!pages.length) { panel.appendChild(KOS.ui.emptyState({ compact: true, body: "This lesson's notes arrive with its release." })); return; }
      if (refMode()) return renderReference(panel);
      return renderLearn(panel, pagerSlot);
    };

    /* ---- notes ---- */
    function known(word) { return KOS.ja.knows(word); }
    function block(b, i) {
      if (b.h) return el("h3", { class: "k-ja-h" }, [b.n ? el("span", { class: "k-mono", text: b.n + " " }) : null, UI().furi(b.h, { known: known })].filter(Boolean));
      if (b.p) return el("p", { class: "k-ja-p" }, [UI().furi(b.p, { known: known })]);
      if (b.line) {
        var row = UI().line({ who: b.line.who, ja: b.line.ja, en: b.line.en, known: known });
        [].forEach.call(row.querySelectorAll("[data-ui~='ja.hear'], [data-ui~='ja.slow']"), function (btn) {
          btn.addEventListener("click", function () { KOS.ja.markHeard(ref, b.line.ja); evidenceChanged(ref); });
        });
        return row;
      }
      if (b.kana) return el("div", { class: "k-ja-kanacards", "data-ui": "ja.kana-cards" }, b.kana.map(function (ch) {
        var it = KOS.ja.item("k:" + ch) || { w: ch, r: "" }, n = (KOS.jaStrokes[ch] || []).length;
        var hear = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "ja.hear", "aria-label": "Hear " + ch, text: "▶",
          onclick: function () { UI().say(ch, { node: hear }); KOS.ja.markHeard(ref, ch); evidenceChanged(ref); } });
        return el("div", { class: "k-ja-kanacard" }, [
          el("span", { class: "k-ja-kanacard-g", lang: "ja", "aria-hidden": "true", text: ch }),
          el("b", { text: it.r }),
          b.mnemo && b.mnemo[ch] ? el("small", { class: "k-ja-mnemo", text: b.mnemo[ch] }) : null,
          el("span", { class: "k-ja-kanacard-f" }, [hear, n ? el("small", { class: "k-mono k-muted", text: n + (n === 1 ? " stroke" : " strokes") }) : null].filter(Boolean))
        ].filter(Boolean));
      }));
      if (b.pair) return el("div", { class: "k-ja-pairs", "data-ui": "ja.pair" }, b.pair.map(function (w) {
        var btn = el("button", { type: "button", class: "k-ja-opt", lang: "ja", onclick: function () { UI().say(w, { node: btn }); KOS.ja.markHeard(ref, w); evidenceChanged(ref); } },
          [el("span", { text: "▶ " + w }), el("small", { class: "k-mono", text: KOS.jaKana.morae(w).length + " beats" })]);
        return btn;
      }));
      if (b.callout) return el("aside", { class: "k-ja-callout", "data-ui": "ja.callout" }, [el("span", { class: "k-ja-callout-m", "aria-hidden": "true", text: "❝" }),
        el("div", {}, [el("b", { text: b.callout.t }), el("p", {}, [UI().furi(b.callout.body, { known: known })])])]);
      if (b.table) {
        var t = el("table", { class: "k-ja-table" }, [
          el("thead", {}, [el("tr", {}, b.table.head.map(function (h) { return el("th", { scope: "col" }, [UI().furi(h)]); }))]),
          el("tbody", {}, b.table.rows.map(function (r) { return el("tr", {}, r.map(function (c, ci) { return el(ci ? "td" : "th", ci ? {} : { scope: "row" }, [UI().furi(c)]); })); }))
        ]);
        return KOS.ui.scroller(t, { label: "Table", tabWhenScrolls: true });
      }
      if (b.scene) return el("div", { class: "k-ja-media", "data-ui": "ja.media-moment" }, [el("span", { class: "k-kicker", text: "Media moment · " + (b.scene.title || "a scene") }), UI().scene(b.scene, { known: known })]);
      if (b.panel) return el("div", { class: "k-ja-media", "data-ui": "ja.media-moment" }, [el("span", { class: "k-kicker", text: "Media moment · a manga panel" }), UI().panel(b.panel, { known: known })]);
      /* a pattern: the formula, what it means, and one example said aloud */
      if (b.pattern) {
        var pt = b.pattern;
        var hp = el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "ja.hear", "aria-label": "Hear the example", text: "▶",
          onclick: function () { UI().say(pt.eg, { node: hp }); KOS.ja.markHeard(ref, pt.eg); evidenceChanged(ref); } });
        return el("div", { class: "k-ja-pattern", "data-ui": "ja.pattern" }, [
          el("div", { class: "k-ja-pattern-f" }, [UI().furi(pt.f, { mode: "all" })]),
          el("p", { class: "k-ja-pattern-en", text: pt.en }),
          el("div", { class: "k-ja-pattern-eg" }, [hp, UI().furi(pt.eg, { known: known }), el("small", { class: "k-muted", text: pt.egEn })])
        ]);
      }
      /* the graded passage (§2.5): read it first, English per line on request, one question */
      if (b.passage) {
        var ps = b.passage, qOut = el("p", { class: "k-ja-passage-v", "aria-live": "polite" });
        return el("section", { class: "k-ja-passage", "data-ui": "ja.passage", "aria-label": "Reading: " + ps.title }, [
          el("div", { class: "k-ja-passage-h" }, [el("span", { class: "k-kicker", text: "Read · " + ps.title }), el("small", { class: "k-muted", text: "Read it before you open the English" })]),
          el("div", { class: "k-ja-passage-lines" }, ps.lines.map(function (ln) { return UI().line({ who: ln.who, ja: ln.ja, en: ln.en, known: known, enHidden: true }); })),
          ps.q ? el("div", { class: "k-ja-passage-q" }, [el("b", { text: ps.q.q }), el("div", { class: "k-ja-opts", role: "group", "aria-label": ps.q.q }, ps.q.options.map(function (opt, oi) {
            return el("button", { type: "button", class: "k-ja-opt", "data-ui": "ja.option", onclick: function (e) {
              [].forEach.call(e.currentTarget.parentNode.children, function (x) { KOS.ui.state(x, "right", false); KOS.ui.state(x, "wrong", false); });
              KOS.ui.state(e.currentTarget, oi === ps.q.a ? "right" : "wrong", true);
              qOut.textContent = oi === ps.q.a ? "✓ Right. " + (ps.q.why || "") : "✗ Not quite — read it again.";
            } }, [opt]);
          })), qOut]) : null
        ].filter(Boolean));
      }
      /* the shadowing set: hear a line, say it with the voice. Self-paced, never graded (speech is
         a later release, §13) */
      if (b.shadow) return el("section", { class: "k-ja-shadow", "data-ui": "ja.shadow", "aria-label": "Shadowing" }, [
        el("div", { class: "k-ja-passage-h" }, [el("span", { class: "k-kicker", text: "Shadow · say it with the voice" }), el("small", { class: "k-muted", text: "Hear it, then say it along — slow first. Nothing is recorded." })])
      ].concat(b.shadow.map(function (ln) {
        var row = UI().line({ who: ln.who, ja: ln.ja, en: ln.en, known: known });
        [].forEach.call(row.querySelectorAll("[data-ui~='ja.hear'], [data-ui~='ja.slow']"), function (btn) {
          btn.addEventListener("click", function () { KOS.ja.markHeard(ref, ln.ja); evidenceChanged(ref); });
        });
        return row;
      })));
      if (b.go) return el("div", { class: "k-ja-go" }, [el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "ja.practice-start",
        text: "▶ Start the practice", onclick: function () { KOS.show("japanese", { page: "session", id: "learn-" + ref }); } }), el("small", { class: "k-muted", text: b.go })]);
      return el("span");
    }
    function pageBody(pg) { return el("div", { class: "k-ja-page" }, pg.blocks.map(block)); }
    function nextLesson() {
      var ls = KOS.ja.lessons(), i = ls.indexOf(L), n = i >= 0 ? ls[i + 1] : null;
      if (!n) return el("span");
      return el("button", { type: "button", class: "k-note-step", "data-ui": "topic.page ja.next-lesson", "data-state": "next",
        onclick: function () { KOS.show("ref", { subject: SID, ref: n.id }); } }, [
        el("span", { class: "k-kicker", text: "Next lesson ›" }), el("span", { class: "k-note-step-t", text: n.id + " " + n.title })]);
    }
    function renderLearn(panel, pagerSlot) {
      var cur = Math.max(0, Math.min(pages.length - 1, (ui.page || {})[ref] || 0));
      var article = el("article", { class: "k-prose k-notes k-ja-notes", "data-ui": "topic.notes" });
      var stepPrev = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "topic.reader-step", "aria-label": "Previous note page", text: "‹", onclick: function () { show(cur - 1, true); } });
      var pageSelect = el("select", { class: "k-topic-page-select", "data-ui": "topic.reader-page-select", "aria-label": "Choose note page", onchange: function () { show(Number(pageSelect.value), true); } });
      pages.forEach(function (pg, i) { pageSelect.appendChild(el("option", { value: String(i), text: "Page " + (i + 1) + " of " + pages.length + " — " + pg.t })); });
      var stepNext = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "topic.reader-step", "aria-label": "Next note page", text: "›", onclick: function () { show(cur + 1, true); } });
      var dots = el("span", { class: "k-topic-dots", "aria-hidden": "true" }, pages.map(function () { return el("span"); }));
      var foot = el("nav", { class: "k-note-foot", "data-ui": "topic.note-foot", "aria-label": "Note pages" });
      if (pages.length > 1) pagerSlot.appendChild(el("div", { class: "k-topic-reader", "data-ui": "topic.pager" }, [el("span", { class: "k-kicker", text: "Note pages" }), stepPrev, pageSelect, stepNext, dots]));
      var dwell = null, shownAt = 0;
      function markRead(i) {
        var rec = KOS.ja.peek().lessons[ref];
        if (rec && rec.pages && rec.pages[i]) return;
        KOS.ja.markPage(ref, i); paintDots(); evidenceChanged(ref);
      }
      function paintDots() {
        var rec = KOS.ja.peek().lessons[ref] || {};
        [].forEach.call(dots.children, function (dt, j) { KOS.ui.state(dt, "on", j === cur); KOS.ui.state(dt, "read", !!(rec.pages && rec.pages[j])); });
      }
      function show(i, moved) {
        if (moved && i > cur && shownAt && Date.now() - shownAt >= LEAVE) markRead(cur);
        cur = Math.max(0, Math.min(pages.length - 1, i));
        shownAt = Date.now();
        if (moved && (ui.page || {})[ref] !== cur) { ui.page = ui.page || {}; ui.page[ref] = cur; KOS.store.save(); announce("Page " + (cur + 1) + " of " + pages.length + ", " + pages[cur].t + "."); }
        pageSelect.value = String(cur);
        article.innerHTML = "";
        article.appendChild(el("h2", { class: "k-ja-page-t", text: pages[cur].t }));
        article.appendChild(pageBody(pages[cur]));
        if (moved && article.scrollIntoView) article.scrollIntoView({ block: "start", behavior: "smooth" });
        stepPrev.disabled = cur === 0; stepNext.disabled = cur === pages.length - 1;
        foot.innerHTML = "";
        foot.appendChild(cur > 0 ? el("button", { type: "button", class: "k-note-step", "data-ui": "topic.page", onclick: function () { show(cur - 1, true); } }, [
          el("span", { class: "k-kicker", text: "‹ Previous page" }), el("span", { class: "k-note-step-t", text: pages[cur - 1].t })]) : el("span"));
        foot.appendChild(el("span", { class: "k-mono k-muted", "data-ui": "topic.note-count", text: "Page " + (cur + 1) + " of " + pages.length }));
        foot.appendChild(cur < pages.length - 1 ? el("button", { type: "button", class: "k-note-step", "data-ui": "topic.page", "data-state": "next", onclick: function () { show(cur + 1, true); } }, [
          el("span", { class: "k-kicker", text: "Next page ›" }), el("span", { class: "k-note-step-t", text: pages[cur + 1].t })]) : nextLesson());
        var at = cur;
        clearTimeout(dwell);
        dwell = setTimeout(function () { if (article.isConnected && cur === at) markRead(at); }, DWELL);
        paintDots();
      }
      panel.appendChild(article);
      panel.appendChild(foot);
      show(cur);
    }
    function renderReference(panel) {
      var article = el("article", { class: "k-prose k-notes k-ja-notes", "data-ui": "topic.notes ja.reference" });
      pages.forEach(function (pg, i) {
        article.appendChild(el("h2", { class: "k-ja-page-t", id: "ja-pg-" + i, text: (i + 1) + " · " + pg.t }));
        article.appendChild(pageBody(pg));
      });
      panel.appendChild(article);
    }

    /* ---- practice and reviews ---- */
    function renderPractice(panel) {
      if (!L) return;
      var rec = KOS.ja.peek().lessons[ref] || {};
      var box = el("section", { class: "k-card k-ja-practice", "data-ui": "ja.practice" }, [
        el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Practice" }), el("span", { class: "k-card-meta", text: L.items.length + " items · reading, then writing and listening" })]),
        el("p", { class: "k-muted", text: rec.doneAt ? "Done. Its items now come back in Reviews on their own schedule; practise again any time." : "Each item is introduced, then checked: read it, write it, hear the difference. Your grade comes from your answers." }),
        el("div", { class: "k-ja-practice-items", lang: "ja" }, L.items.map(function (k) { var it = KOS.ja.item(k); return el("span", { class: "k-chip", text: it ? it.w : k }); })),
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "ja.practice-start",
          text: rec.doneAt ? "▶ Practise again" : "▶ Start the practice", onclick: function () { KOS.show("japanese", { page: "session", id: "learn-" + ref }); } })
      ]);
      panel.appendChild(box);
    }
    function renderReviews(panel) {
      var j = KOS.ja.peek(), keys = facetKeys();
      if (!keys.length) { panel.appendChild(KOS.ui.emptyState({ compact: true, body: "Its reviews start after the practice." })); return; }
      var list = el("div", { class: "k-ja-revlist", role: "table", "aria-label": "This lesson's reviews" }, [
        el("div", { class: "k-ja-revlist-r k-ja-revlist-h", role: "row" }, ["Item", "Skill", "Next", "Holds for"].map(function (h) { return el("span", { role: "columnheader", text: h }); }))
      ]);
      keys.sort().forEach(function (k) {
        var f = j.facets[k], p = KOS.jaSrs.split(k), it = KOS.ja.item(p.item);
        list.appendChild(el("div", { class: "k-ja-revlist-r", role: "row" }, [
          el("span", { role: "cell", lang: "ja", text: it ? it.w : p.item }),
          el("span", { role: "cell" }, [UI().skill(p.skill, { label: false })]),
          el("span", { role: "cell", class: "k-mono", text: f.due ? (f.due <= KOS.srs.todayISO() ? "due" : f.due) : "—" }),
          el("span", { role: "cell", class: "k-mono", text: f.reps ? Math.round(f.s) + " d" : "new" })
        ]));
      });
      panel.appendChild(list);
    }

    /* ---- the inspector ---- */
    ctx.status = function () {
      var ev = KOS.ja.evidence(ref), n = ev.checks.filter(Boolean).length, pct = n * 25;
      var tone = pct < 20 ? "low" : pct <= 70 ? "mid" : "high";
      var rag = KOS.rag.picker(SID, ref);
      var sub = [ev.pages ? ev.read + " of " + ev.pages + " pages" : "no notes yet", ev.lines ? ev.heard + " of " + ev.lines + " lines" : "the lesson's sounds",
        ev.practised ? "passed" : "0 of 1 sessions", ev.items ? ev.held + " of " + ev.items + " items held" : "after the practice"];
      function statusSel() {
        var H = KOS.hub, cur = (KOS.store.peekProgress(SID, ref) || {}).status || "none";
        var s = el("select", { class: "k-ts-select", "data-ui": "ui.status-select", id: "ts-status", "aria-label": "Topic status",
          onchange: function () { KOS.store.setStatus(SID, ref, s.value); if (H.renderTree) H.renderTree(SID, ref); } },
          H.STATUS.map(function (st) { return el("option", { value: st[0], text: H.STATUS_GLYPH[st[0]] + " " + st[1] }); }));
        s.value = cur; return s;
      }
      var node = el("section", { class: "k-ts k-ja-ts", "data-ui": "topic.status ja.status", "data-state": tone, "aria-label": "Topic status" }, [
        el("div", { class: "k-ts-head", "data-ui": "topic.status-head" }, [el("span", { class: "k-kicker", text: "Status" }), el("span", { class: "k-ts-checks", text: n + " of 4 checks" }), el("strong", { class: "k-ts-pct", text: pct + "%" })]),
        el("span", { class: "k-bar k-bar--6", role: "img", "aria-label": pct + "% from evidence", style: "--p: " + pct + "%" }, [el("i")]),
        el("div", { class: "k-ts-row" }, [
          el("div", { class: "k-ts-field" }, [el("label", { class: "sr-only", for: "ts-status", text: "Status" }), statusSel()]),
          el("div", { class: "k-ts-field" }, [el("span", { class: "sr-only", text: "Confidence" }), rag.node])
        ]),
        el("div", { class: "k-ts-checkgrid", "data-ui": "topic.checkgrid ja.checks" }, KOS.ja.CHECKS.map(function (label, i) {
          var cb = el("input", { type: "checkbox", class: "k-box", "aria-readonly": "true", tabindex: "-1", onclick: function (e) { e.preventDefault(); } });
          cb.checked = !!ev.checks[i];
          return el("label", { class: "k-ts-check k-ja-check", "data-ui": "topic.check", "data-state": ev.checks[i] ? "on" : null, title: "Ticks itself from evidence: " + sub[i] }, [cb,
            el("span", { class: "k-ja-check-t" }, [el("span", { text: label }), el("small", { text: sub[i] })])]);
        })),
        rag.auto
      ].filter(Boolean));
      function onEv(e) {
        if (!node.isConnected) { document.removeEventListener("kos:ja-evidence", onEv); return; }
        if (e.detail && e.detail.ref !== ref) return;
        document.removeEventListener("kos:ja-evidence", onEv);
        node.parentNode.replaceChild(ctx.status(), node);
      }
      document.addEventListener("kos:ja-evidence", onEv);
      return node;
    };
    ctx.inspectorBody = function (outer) {
      var body = el("div", { class: "k-ja-insp-live" });
      outer.appendChild(body);
      fill(body);
      function onEv(e) {
        if (!body.isConnected) { document.removeEventListener("kos:ja-evidence", onEv); return; }
        if (e.detail && e.detail.ref !== ref) return;
        body.innerHTML = ""; fill(body);
      }
      document.addEventListener("kos:ja-evidence", onEv);
    };
    function fill(body) {
      if (!L) return;
      var j = KOS.ja.peek(), by = {};
      L.items.forEach(function (k) {
        KOS.jaSrs.facetsFor(k, j.facets, { produces: KOS.ja.produces, speech: false }).forEach(function (s) {
          var f = j.facets[k + "|" + s], b = by[s] = by[s] || { n: 0, held: 0 };
          b.n++; if (f && f.reps && f.s >= KOS.jaSrs.HOLD) b.held++;
        });
      });
      body.appendChild(el("section", { class: "k-insp-sec", "aria-label": "Evidence by skill" }, [
        el("h2", { class: "k-kicker", text: "Evidence by skill" }),
        el("ul", { class: "k-ja-insp-skills" }, ["R", "L", "W", "S"].filter(function (s) { return by[s]; }).map(function (s) {
          return el("li", {}, [UI().skill(s, { label: false }), el("span", { text: by[s].held + " of " + by[s].n + " items hold" }), el("small", { class: "k-muted", text: "Validator" })]);
        }))
      ]));
      /* the lesson's own items: kana in Stage 0, words in Stage 1 (with their meaning) */
      var kana = L.items.filter(function (k) { return /^k:/.test(k); }), isKana = kana.length > 0;
      var shown = isKana ? kana : L.items.filter(function (k) { return /^w:/.test(k); });
      var held = shown.filter(function (k) { var f = j.facets[k + "|R"]; return f && f.reps && f.s >= KOS.jaSrs.STABLE; }).length;
      body.appendChild(el("section", { class: "k-insp-sec", "aria-label": isKana ? "Kana" : "Words" }, [
        el("h2", { class: "k-kicker", text: (isKana ? "Kana · " : "Words · ") + held + " of " + shown.length + " stable" }),
        el("ul", { class: "k-ja-insp-items", "data-state": isKana ? null : "words" }, shown.slice(0, 12).map(function (k) {
          var it = KOS.ja.item(k), f = j.facets[k + "|R"];
          var st = f && f.reps ? (f.s >= KOS.jaSrs.STABLE ? "stable" : "learning") : "new";
          return el("li", { "data-state": st }, [el("b", { lang: "ja", text: it.w }), el("span", { text: isKana ? it.r : it.en[0] }), el("small", { text: st })]);
        }))
      ]));
      var due = Object.keys(j.facets).filter(function (k) { var f = j.facets[k]; return L.items.indexOf(KOS.jaSrs.split(k).item) >= 0 && f.due && f.due <= KOS.srs.todayISO(); }).length;
      body.appendChild(el("section", { class: "k-insp-sec", "aria-label": "Next practice" }, [
        el("h2", { class: "k-kicker", text: "Next practice" }),
        el("dl", { class: "k-ja-dl" }, [["Practice", L.items.length + " items"], ["Due now", due ? String(due) : "—"]].map(function (r) { return el("div", {}, [el("dt", { text: r[0] }), el("dd", { text: r[1] })]); }))
      ]));
    }
    /* Reference mode: the inspector lists the pages ("On this page") */
    ctx.onThisPage = function (body) {
      body.appendChild(el("nav", { class: "k-insp-sec", "aria-label": "On this page" }, [
        el("h2", { class: "k-kicker", text: "On this page" }),
        el("ol", { class: "k-ja-toc" }, pages.map(function (pg, i) {
          return el("li", {}, [el("a", { href: "#ja-pg-" + i, class: "k-link", text: pg.t,
            onclick: function (e) { e.preventDefault(); var t = document.getElementById("ja-pg-" + i); if (t) t.scrollIntoView({ block: "start" }); } })]);
        }))
      ]));
    };
    return ctx;
  }

  KOS.jaTopic = { begin: begin, spine: spine };
})();
