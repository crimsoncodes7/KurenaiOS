/* Kurenai OS — modules/mindtopic.js (KOS.mindTopic)
   A Mind lesson on the shared topic page (design 32d–32f, built like Code's 26c and Japanese's
   28e). hub.js's KOS.views.ref stays the one topic page; for a Mind lesson it asks this module for
   what differs, through begin(ref):
     decoratePath   "Mind / Foundation / F1 · explain-back lesson" — the lesson's kind and its one prompt
     modeSwitch     Learn | Reference, and Ask Kurenai
     tabs           Lesson · Concepts · Cards · Sources · Journal · Files
     render         Lesson (one page at a time, the six named in the picker; Reference: every page),
                    Concepts (each with its ladder), Cards, Sources, Journal (this lesson's entries)
     status / inspectorBody   the four checks from evidence, the concepts' ladders, the evidence tags,
                    Talk it through, Ask Kurenai
     spine          the four headers (Foundation · Psychology · Philosophy · Crossings) over the units
   Reading evidence is written through KOS.mind (a page read after a dwell, the vote, the check);
   nothing else here writes. The mode and the page are per device (state.ui.mind).             */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var SID = "mind";
  var DWELL = 2500, LEAVE = 1500;
  function M() { return KOS.mind; }
  function UI() { return KOS.mindUI; }
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  function changed(ref) { document.dispatchEvent(new window.CustomEvent("kos:mind-evidence", { detail: { ref: ref } })); }

  /* ================= the spine: the four headers over the units ================= */
  function spine() {
    var H = (window.KOS_MIND && window.KOS_MIND.HEADERS) || [];
    return {
      tracks: false,
      stageHead: function (stage) {
        return el("div", { class: "k-spine-stage k-mind-spine-stage", "data-ui": "mind.spine-header", text: (H[stage] || {}).name || "" });
      }
    };
  }

  /* ================= page blocks (shared with the Daily 15's sitting) ================= */
  function block(b, ref, ctx) {
    ctx = ctx || {};
    if (b.story) return el("blockquote", { class: "k-mind-story k-mind-read", "data-ui": "mind.story" }, [b.story]);
    if (b.note) return el("p", { class: "k-mind-note", text: b.note });
    if (b.h) return el("h3", { class: "k-mind-h", text: b.h });
    if (b.p) return el("p", { class: "k-mind-p", text: b.p });
    if (b.list) return el("ul", { class: "k-mind-list" }, b.list.map(function (x) { return el("li", { text: x }); }));
    if (b.notes) return el("ol", { class: "k-mind-numnotes" }, b.notes.map(function (x) { return el("li", { text: x }); }));
    if (b.std) return UI().std(b.std);
    if (b.map) return el("figure", { class: "k-mind-fig" }, [UI().argmap({ rows: b.map.rows, caption: b.map.caption })]);
    if (b.evidence) return UI().finding(b.evidence);
    if (b.callout) return el("aside", { class: "k-mind-callout", "data-ui": "mind.callout" }, [el("b", { text: b.callout.t }), el("p", { text: b.callout.body })]);
    if (b.table) {
      var t = el("table", { class: "k-mind-table" }, [
        el("thead", {}, [el("tr", {}, b.table.head.map(function (h) { return el("th", { scope: "col", text: h }); }))]),
        el("tbody", {}, b.table.rows.map(function (r) { return el("tr", {}, r.map(function (c, ci) { return el(ci ? "td" : "th", ci ? { text: c } : { scope: "row", text: c }); })); }))
      ]);
      return KOS.ui.scroller(t, { label: "Table", tabWhenScrolls: true });
    }
    if (b.concepts) return el("p", { class: "k-mind-onpage" }, [el("span", { class: "k-muted", text: "Concepts on this page: " })].concat(b.concepts.map(function (cid) {
      var c = M().concept(cid); return c ? el("span", { class: "k-chip", text: c.name }) : null;
    }).filter(Boolean)));
    if (b.vote) return vote(b.vote, ref);
    return el("span");
  }
  function vote(v, ref) {
    var rec = (M().peek().lessons[ref] || {}).vote, pick = rec ? rec.i : null;
    var box = el("section", { class: "k-mind-vote", "data-ui": "mind.vote", "aria-label": "Quick vote" });
    function draw() {
      box.innerHTML = "";
      box.appendChild(el("h3", { class: "k-mind-vote-q", text: v.q }));
      if (v.note) box.appendChild(el("p", { class: "k-muted", text: v.note }));
      box.appendChild(el("div", { class: "k-mind-opts", role: "radiogroup", "aria-label": v.q }, v.options.map(function (op, i) {
        return el("button", { type: "button", class: "k-mind-opt", role: "radio", "aria-checked": String(pick === i), "data-ui": "mind.vote-option",
          onclick: function () { pick = i; draw(); var b = box.querySelectorAll(".k-mind-opt")[i]; if (b) b.focus(); } }, [op]);
      })));
      var kept = (M().peek().lessons[ref] || {}).vote;
      box.appendChild(el("div", { class: "k-mind-row" }, [
        el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "mind.vote-keep", disabled: pick == null ? "" : null,
          text: kept && kept.i === pick ? "✓ Kept" : "Keep my answer ›",
          onclick: function () { M().setVote(ref, pick); announce("Kept: " + v.options[pick] + "."); draw(); } })
      ]));
    }
    draw();
    return box;
  }
  /* the check (32f): one item at a time; wrong explains and carries no penalty */
  function check(ref, onPassed) {
    var items = M().checkItems(ref), box = el("section", { class: "k-mind-check", "data-ui": "mind.check", "aria-label": "Check" });
    var cur = 0;
    function rec() { return ((M().peek().lessons[ref] || {}).check) || {}; }
    function firstOpen() { var r = rec(); for (var i = 0; i < items.length; i++) if (!(r[i] && r[i].ok)) return i; return -1; }
    cur = Math.max(0, firstOpen());
    function draw(answer) {
      box.innerHTML = "";
      var r = rec(), right = items.filter(function (_, i) { return r[i] && r[i].ok; }).length;
      if (firstOpen() < 0 && answer == null) {
        box.appendChild(el("div", { class: "k-mind-done", "data-ui": "mind.check-passed" }, [el("span", { class: "k-mind-done-g", "aria-hidden": "true", text: "✓" }),
          el("div", {}, [el("b", { text: right + " of " + items.length + " · check passed" }), el("p", { class: "k-muted", text: "Close is next: the one prompt, your stories note and the dialogue." })])]));
        box.appendChild(el("button", { type: "button", class: "k-btn", text: "Go through them again", onclick: function () { cur = 0; draw(-1); } }));
        return;
      }
      var it = items[cur];
      box.appendChild(el("div", { class: "k-mind-check-h" }, [el("span", { class: "k-mono", text: (cur + 1) + " / " + items.length }), it.apply ? el("span", { class: "k-chip", text: "Apply scenario" }) : null].filter(Boolean)));
      box.appendChild(el("h3", { class: "k-mind-vote-q", text: it.q.replace(/^Apply · /, "") }));
      var res = answer != null && answer >= 0 ? { ok: answer === it.a } : null;
      box.appendChild(el("div", { class: "k-mind-opts", role: "group", "aria-label": "Answers" }, it.options.map(function (op, i) {
        var st = res ? (i === it.a ? "right" : i === answer ? "wrong" : null) : null;
        return el("button", { type: "button", class: "k-mind-opt", "data-ui": "mind.check-option", "data-state": st, disabled: res ? "" : null,
          onclick: function () { var o = M().answerCheck(ref, cur, i); changed(ref); announce(o.ok ? "Right." : "Not quite."); draw(i); if (M().checkPassed(ref) && onPassed) onPassed(); } },
          [el("span", { class: "k-mono", "aria-hidden": "true", text: "ABCD"[i] }), op, st === "right" ? el("span", { class: "k-mind-mark", text: " ✓ Right" }) : st === "wrong" ? el("span", { class: "k-mind-mark", text: " ✗ Not this" }) : null].filter(Boolean));
      })));
      if (res) {
        box.appendChild(el("p", { class: "k-mind-why", role: "status", text: (res.ok ? "Right. " : "Not quite. ") + it.why }));
        var nx = (function () { var r2 = rec(); for (var k = 1; k <= items.length; k++) { var j = (cur + k) % items.length; if (!(r2[j] && r2[j].ok)) return j; } return -1; })();
        box.appendChild(el("div", { class: "k-mind-row" }, [
          el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: nx < 0 ? "Finish the check ›" : res.ok ? "Next ›" : "Next, and come back to this ›",
            onclick: function () { if (nx < 0) { draw(); return; } cur = nx; draw(); } }),
          el("small", { class: "k-muted", text: right + " right so far" })
        ]));
      }
    }
    draw();
    return box;
  }
  /* Close (32f): the vote's return, the one prompt, For your stories, the dialogue, the reference */
  function close(ref, l) {
    var box = el("div", { class: "k-mind-close", "data-ui": "mind.close" });
    var v = (M().peek().lessons[ref] || {}).vote, hook = (l.pages[0].blocks.filter(function (b) { return b.vote; })[0] || {}).vote;
    if (v && hook) {
      var back = el("section", { class: "k-card k-mind-back", "data-ui": "mind.vote-back" }, [
        el("span", { class: "k-kicker", text: "On page 1 you said" }),
        el("p", { class: "k-mind-read", text: "\"" + hook.options[v.i] + "\"" }),
                el("div", { class: "k-mind-row" }, [el("button", { type: "button", class: "k-btn", text: "Keep it", onclick: function () { announce("Kept."); back.replaceWith(el("p", { class: "k-muted", text: "Kept: \"" + hook.options[v.i] + "\"." })); } }),
          el("button", { type: "button", class: "k-btn", text: "Change it", onclick: function () { back.replaceWith(vote(hook, ref)); } })])
      ]);
      box.appendChild(back);
    }
    if (M().hasPrompt(ref)) box.appendChild(promptCard(ref, l));
    if (l.stories) {
      var saved = KOS.mindJournal.list().some(function (e) { return e.src && e.src.kind === "stories" && e.lesson === ref; });
      box.appendChild(UI().stories(l.stories, { saved: saved, onSave: function (ok) {
        KOS.mindJournal.add({ kind: "insight", title: "For my stories: " + l.title, text: l.stories, concepts: (l.concepts || []).slice(0, 3), lesson: ref, src: { kind: "stories", ref: ref } }, function (err) { if (!err) ok(); });
      } }));
    }
    if (l.dialogue) {
      var dl = el("section", { class: "k-card k-mind-talk", "data-ui": "mind.talk" }, [
        UI().avatar("kurenai", "curious"),
        el("div", {}, [el("b", { text: "Talk it through with Kurenai" }), el("small", { class: "k-muted", text: l.dialogue.title })]),
        el("button", { type: "button", class: "k-btn", "data-ui": "mind.talk-open", text: "Open", onclick: function () { dl.replaceWith(KOS.mindRun.dialogue(ref)); } })
      ]);
      box.appendChild(dl);
      var ui = M().peekUi(); if (ui.tree && ui.tree[l.dialogue.id]) setTimeout(function () { if (dl.isConnected) dl.querySelector("button").click(); }, 0);
    }
    if (l.ref) box.appendChild(el("section", { class: "k-mind-qref", "data-ui": "mind.quick-ref" }, [el("span", { class: "k-kicker", text: "Quick reference" }), el("p", { text: l.ref })]));
    return box;
  }
  function promptCard(ref, l) {
    var ev = M().evidence(ref), contested = l.kind === "contested";
    var card = el("section", { class: "k-card k-mind-prompt", "data-ui": "mind.prompt", "data-state": ev.promptDone ? "done" : ev.parked ? "parked" : null }, [
      el("div", { class: "k-mind-prompt-h" }, [el("span", { class: "k-kicker", text: contested ? "Where you stand" : "Explain it back" })]),
      el("h3", { class: "k-mind-vote-q", text: l.prompt.q })
    ]);
    if (ev.promptDone) {
      if (contested) { var p = M().latest(ref); card.appendChild(el("p", {}, [UI().kind("position"), " " + l.prompt.options[p.answer] + " · " + p.conf + "% · v" + p.n])); }
      else card.appendChild(el("ul", { class: "k-mind-yours" }, M().peek().explains[ref].bullets.map(function (b) { return el("li", { text: b }); })));
      card.appendChild(el("button", { type: "button", class: "k-btn", text: contested ? "Revise" : "Write it again", onclick: open }));
      return card;
    }
    card.appendChild(el("p", { class: "k-muted", text: contested ? "Your answer, how sure you are, and one line of reason." : "Three bullets or three sentences." }));
    card.appendChild(el("div", { class: "k-mind-row" }, [
      el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "mind.prompt-open", text: contested ? "Take a position" : "Write it", onclick: open }),
      el("button", { type: "button", class: "k-btn", "data-ui": "mind.later", text: ev.parked ? "⏸ Parked" : "Later", disabled: ev.parked ? "" : null,
        onclick: function () { M().park(ref); changed(ref); announce("Parked for a coming Daily 15."); card.replaceWith(promptCard(ref, l)); } })
    ]));
    function open() {
      var done = function () { if (card.isConnected) card.replaceWith(promptCard(ref, l)); };
      if (contested) KOS.mindRun.position(ref, { revise: ev.promptDone, onDone: done });
      else KOS.mindRun.explain(ref, { onDone: done });
    }
    return card;
  }
  function pageBody(l, i, ref, o) {
    o = o || {};
    var pg = l.pages[i];
    if (pg.kind === "check") return el("div", { class: "k-mind-page" }, [check(ref, o.onPassed)]);
    if (pg.kind === "close") return el("div", { class: "k-mind-page" }, [close(ref, l)]);
    return el("div", { class: "k-mind-page" }, pg.blocks.map(function (b) { return block(b, ref); }));
  }

  /* ================= the topic page ================= */
  function begin(ref) {
    var l = M().lesson(ref);
    var pages = l && l.pages ? l.pages : [];
    var ui = M().ui();
    var refMode = function () { return ui.mode === "reference" && pages.length > 0 && l.kind !== "checkpoint"; };
    var ctx = {};
    ctx.decoratePath = function (pathLine) {
      pathLine.innerHTML = "";
      var u = l ? M().unit(l.unit) : null;
      ["Mind", u ? u.id + " " + u.title : ""].filter(Boolean).forEach(function (bit, i) {
        if (i) pathLine.appendChild(el("span", { class: "k-topic-sep", "aria-hidden": "true", text: "/" }));
        pathLine.appendChild(document.createTextNode(bit));
      });
    };
    ctx.modeSwitch = function () {
      var bits = [];
      if (pages.length && l.kind !== "checkpoint") {
        var mode = refMode() ? "reference" : "learn";
        bits.push(el("span", { class: "k-seg k-seg--quiet k-mind-readmode", "data-ui": "mind.mode", role: "group", "aria-label": "Reading mode" },
          [["learn", "Learn"], ["reference", "Reference"]].map(function (m) {
            return el("button", { type: "button", class: "k-seg-item", "aria-pressed": String(mode === m[0]), text: m[1],
              onclick: function () { if (mode === m[0]) return; ui.mode = m[0]; KOS.store.save(); KOS.rerender(); announce(m[1] + " mode."); } });
          })));
      }
      return el("span", { class: "k-mind-headtools" }, bits);
    };
    function sources() {
      var out = [];
      pages.forEach(function (pg) { (pg.blocks || []).forEach(function (b) { if (b.evidence && b.evidence.src) out.push({ t: b.evidence.t, src: b.evidence.src, tag: b.evidence.tag }); }); });
      return out;
    }
    function lessonEntries() { return KOS.mindJournal.list().filter(function (e) { return e.lesson === ref; }); }
    function cardKeys() { var ks = []; (l ? l.concepts || [] : []).forEach(function (c) { ks = ks.concat(M().cardKeys(c)); }); return ks; }
    ctx.tabs = function () {
      if (l && l.kind === "checkpoint") return [["lesson", "Checkpoint", true, null], ["files", "Files", true, null]];
      var nj = lessonEntries().length + (M().latest(ref) ? 1 : 0);
      return [
        ["lesson", "Lesson", true, pages.length || null],
        ["concepts", "Concepts", true, l ? (l.concepts || []).length || null : null],
        ["cards", "Cards", true, cardKeys().length || null],
        ["sources", "Sources", sources().length > 0, sources().length || null],
        ["journal", "Journal", true, nj || null],
        ["files", "Files", true, null]
      ].filter(function (t) { return t[2]; });
    };
    ctx.firstTab = function () { return "lesson"; };
    ctx.owns = function (tab) { return tab !== "files"; };
    ctx.reference = refMode;
    ctx.render = function (tab, panel, pagerSlot) {
      if (!l) return;
      if (l.kind === "checkpoint") return KOS.mindPages.checkpoint(panel, l);
      if (tab === "concepts") return renderConcepts(panel);
      if (tab === "cards") return renderCards(panel);
      if (tab === "sources") return renderSources(panel);
      if (tab === "journal") return renderJournal(panel);
      if (!pages.length) { panel.appendChild(KOS.ui.emptyState({ compact: true, body: "This lesson's pages arrive with its release." })); return; }
      if (refMode()) return renderReference(panel);
      return renderLearn(panel, pagerSlot);
    };

    function nextLesson() {
      var ls = M().lessons(), i = ls.indexOf(l), n = i >= 0 ? ls[i + 1] : null;
      if (!n) return el("span");
      return el("button", { type: "button", class: "k-note-step", "data-ui": "topic.page mind.next-lesson", "data-state": "next",
        onclick: function () { KOS.show("ref", { subject: SID, ref: n.id }); } }, [
        el("span", { class: "k-kicker", text: "Next lesson ›" }), el("span", { class: "k-note-step-t", text: n.id + " " + n.title })]);
    }
    /* your own notes on a lesson: the shared editor's notes fork (Edit), read as one last page,
       "Your notes", which is never a lesson page and never counts as read (invariant 107) */
    function yours() { var c = KOS.content.get(SID, ref); return c && c.notes ? c.notes.filter(function (b) { return b && !b.page; }) : []; }
    function renderLearn(panel, pagerSlot) {
      var mine = yours(), ed = KOS.store.state.ui.editing;
      var pages = l.pages.concat(mine.length || (ed && ed.ref === ref) ? [{ t: "Your notes", yours: true }] : []);
      var cur = ed && ed.ref === ref ? pages.length - 1 : Math.max(0, Math.min(pages.length - 1, (ui.page || {})[ref] || 0));
      var article = el("article", { class: "k-prose k-notes k-mind-notes", "data-ui": "topic.notes mind.lesson" });
      var pageSelect = el("select", { class: "k-topic-page-select", "data-ui": "topic.reader-page-select", "aria-label": "Choose a page", onchange: function () { show(Number(pageSelect.value), true); } });
      pages.forEach(function (pg, i) { pageSelect.appendChild(el("option", { value: String(i), text: "Page " + (i + 1) + " of " + pages.length + " — " + pg.t })); });
      var dots = el("span", { class: "k-topic-dots", "aria-hidden": "true" }, pages.map(function () { return el("span"); }));
      var foot = el("nav", { class: "k-note-foot", "data-ui": "topic.note-foot", "aria-label": "Lesson pages" });
      var stepPrev = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "topic.reader-step", "aria-label": "Previous page", text: "‹", onclick: function () { show(cur - 1, true); } });
      var stepNext = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "topic.reader-step", "aria-label": "Next page", text: "›", onclick: function () { show(cur + 1, true); } });
      /* the pager as Code's and Japanese's: ‹ the page list › and a dot a page, filled once read */
      pagerSlot.appendChild(el("div", { class: "k-topic-reader", "data-ui": "topic.pager" }, [el("span", { class: "k-kicker", text: "Lesson pages" }), stepPrev, pageSelect, stepNext, dots]));
      var dwell = null, shownAt = 0;
      function markRead(i) { if (!pages[i].yours && M().markPage(ref, i)) { paintPicker(); changed(ref); } }
      function paintPicker() {
        var rd = (M().peek().lessons[ref] || {}).pages || {};
        [].forEach.call(dots.children, function (dt, j) { KOS.ui.state(dt, "on", j === cur); KOS.ui.state(dt, "read", !!rd[j]); });
        pageSelect.value = String(cur);
      }
      function show(i, moved) {
        if (moved && i > cur && shownAt && Date.now() - shownAt >= LEAVE) markRead(cur);
        cur = Math.max(0, Math.min(pages.length - 1, i));
        shownAt = Date.now();
        if (moved && (ui.page || {})[ref] !== cur) { ui.page = ui.page || {}; ui.page[ref] = cur; KOS.store.save(); announce("Page " + (cur + 1) + " of " + pages.length + ", " + pages[cur].t + "."); }
        article.innerHTML = "";
        article.appendChild(el("h2", { class: "k-mind-page-t", text: pages[cur].t }));
        if (pages[cur].yours) {
          var box = el("div", { class: "k-mind-yours", "data-ui": "mind.your-notes" });
          box.innerHTML = mine.length ? KOS.content.renderBlocks(mine) : "";
          if (!mine.length) box.appendChild(el("p", { class: "k-muted", text: "Add a block in the editor and it shows here." }));
          KOS.content.typeset(box);
          article.appendChild(box);
        } else article.appendChild(pageBody(l, cur, ref, { onPassed: function () { markRead(cur); } }));
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
        paintPicker();
      }
      panel.appendChild(article);
      panel.appendChild(foot);
      show(cur);
    }
    function renderReference(panel) {
      var article = el("article", { class: "k-prose k-notes k-mind-notes", "data-ui": "topic.notes mind.reference" });
      pages.forEach(function (pg, i) {
        if (pg.kind === "check" || pg.kind === "close") return;
        article.appendChild(el("h2", { class: "k-mind-page-t", id: "mind-pg-" + i, text: (i + 1) + " · " + pg.t }));
        article.appendChild(pageBody(l, i, ref));
      });
      if (l.ref) article.appendChild(el("section", { class: "k-mind-qref" }, [el("span", { class: "k-kicker", text: "Quick reference" }), el("p", { text: l.ref })]));
      panel.appendChild(article);
    }
    function renderConcepts(panel) {
      panel.appendChild(el("div", { class: "k-mind-concepts", "data-ui": "mind.concepts" }, (l.concepts || []).map(function (cid) {
        var c = M().concept(cid), lad = M().ladder(cid);
        return el("section", { class: "k-card k-mind-concept", "data-ui": "mind.concept", "aria-label": c.name }, [
          el("div", { class: "k-mind-concept-h" }, [el("b", { text: c.name }), UI().ladder(lad)]),
          el("p", { class: "k-mind-read", text: c.gist }),
          el("ul", { class: "k-mind-list" }, c.keyPoints.map(function (k) { return el("li", { text: k }); })),
          UI().ladder(lad, { large: true }),
          c.links && c.links.length ? el("p", { class: "k-mind-links" }, [el("span", { class: "k-muted", text: "Neighbours: " })].concat(c.links.map(function (ln) {
            var to = M().concept(ln.to); return to ? el("span", { class: "k-chip", text: ln.type + " · " + to.name }) : null; }).filter(Boolean))) : null,
          el("button", { type: "button", class: "k-btn k-btn--sm", text: "Ask Kurenai about " + c.name.toLowerCase(), onclick: function () { KOS.mindRun.ask({ lesson: ref, concept: cid }); } })
        ].filter(Boolean));
      })));
    }
    function renderCards(panel) {
      var st = M().peek().cards, ks = cardKeys();
      if (!ks.length) { panel.appendChild(KOS.ui.emptyState({ compact: true, body: "This lesson has no cards." })); return; }
      panel.appendChild(el("p", { class: "k-muted", text: M().finished(ref) ? "These come back in your Daily 15 on their own schedule." : "These join your reviews the day after you finish the lesson." }));
      panel.appendChild(el("div", { class: "k-mind-cardlist", role: "list" }, ks.map(function (k) {
        var cd = M().cardOf(k), s = st[k];
        return el("div", { class: "k-mind-cardrow", role: "listitem" }, [
          el("div", {}, [el("b", { text: cd.q }), el("p", { class: "k-muted", text: cd.a })]),
          el("span", { class: "k-mono k-muted", text: s && s.due ? (s.reps ? "next " + s.due : "from " + s.due) : "—" })
        ]);
      })));
    }
    function renderSources(panel) {
      panel.appendChild(el("ul", { class: "k-mind-sources" }, sources().map(function (s) {
        return el("li", {}, [UI().evidenceTag(s.tag), el("b", { text: " " + s.t }), el("small", { class: "k-muted", text: " · " + s.src })]);
      })));
    }
    function renderJournal(panel) {
      var rows = lessonEntries(), p = M().position(ref);
      if (!rows.length && !p) {
        panel.appendChild(KOS.ui.emptyState({ compact: true, title: "Nothing from this lesson yet", body: "Save the stories note, a dialogue's summary or a capture, and it shows here." }));
      }
      if (p) panel.appendChild(KOS.mindPages.journalRow({ kind: "position", title: p.q, meta: "v" + p.current.n + " · " + p.current.conf + "%", go: function () { KOS.show("mind", { page: "positions" }); } }));
      rows.forEach(function (e) { panel.appendChild(KOS.mindPages.journalRow({ kind: e.kind, title: e.title, meta: KOS.mindPages.when(e.at), go: function () { KOS.show("mind", { page: "journal", id: e.id }); } })); });
      panel.appendChild(el("button", { type: "button", class: "k-btn", text: "+ Capture", onclick: function () { KOS.mindRun.capture({ lesson: ref, concepts: (l.concepts || []).slice(0, 1), onDone: function () { KOS.rerender(); } }); } }));
    }

    /* ---- the inspector ---- */
    ctx.status = function () {
      var ev = M().evidence(ref);
      var rows = [
        ["Pages read", ev.read + " of " + ev.pages, ev.checks[0]],
        [l && l.kind === "checkpoint" ? "Checkpoint finished" : "Check passed", l && l.kind === "checkpoint" ? "cards, apply, synthesis" : ev.right + " of " + ev.items, ev.checks[1]]
      ];
      if (ev.prompt) rows.push([l.kind === "contested" ? "Position taken" : "Explain-back done", ev.parked && !ev.promptDone ? "parked for a Daily 15" : "the lesson's one prompt", ev.checks[2]]);
      rows.push(["First retrieval passed", ev.retrieval ? "a card held" : "cards from tomorrow", ev.checks[3]]);
      var n = rows.filter(function (r) { return r[2]; }).length;
      var node = el("section", { class: "k-ts k-mind-ts", "data-ui": "topic.status mind.status", "aria-label": "Topic status" }, [
        el("div", { class: "k-ts-head", "data-ui": "topic.status-head" }, [el("span", { class: "k-kicker", text: "Status" }), el("span", { class: "k-ts-checks", text: n + " of " + rows.length + " checks" })]),
        el("div", { class: "k-ts-checkgrid", "data-ui": "topic.checkgrid mind.checks" }, rows.map(function (r) {
          var cb = el("input", { type: "checkbox", class: "k-box", "aria-readonly": "true", tabindex: "-1", onclick: function (e) { e.preventDefault(); } });
          cb.checked = !!r[2];
          return el("label", { class: "k-ts-check k-mind-check-row", "data-ui": "topic.check", "data-state": r[2] ? "on" : null, title: "Ticks itself from evidence" }, [cb,
            el("span", { class: "k-mind-check-t" }, [el("span", { text: r[0] }), el("small", { text: r[1] })])]);
        }))
      ]);
      function onEv(e) {
        if (!node.isConnected) { document.removeEventListener("kos:mind-evidence", onEv); return; }
        if (e.detail && e.detail.ref !== ref) return;
        document.removeEventListener("kos:mind-evidence", onEv);
        node.parentNode.replaceChild(ctx.status(), node);
      }
      document.addEventListener("kos:mind-evidence", onEv);
      return node;
    };
    if (l && l.kind !== "checkpoint") ctx.editKinds = { lesson: "notes" };   // Edit adds your own notes (the Your notes page)
    ctx.assistStrip = false;   // the inspector carries Ask Kurenai's four modes; the generic exam strip is not Mind's
    ctx.inspectorBody = function (outer) {
      var body = el("div", { class: "k-mind-insp-live" });
      outer.appendChild(body);
      fill(body);
      function onEv(e) {
        if (!body.isConnected) { document.removeEventListener("kos:mind-evidence", onEv); return; }
        if (e.detail && e.detail.ref !== ref) return;
        body.innerHTML = ""; fill(body);
      }
      document.addEventListener("kos:mind-evidence", onEv);
    };
    function fill(body) {
      if (!l) return;
      var cs = l.kind === "checkpoint" ? ((window.KOS_MIND.CHECKPOINTS[l.unit] || {}).concepts || []) : (l.concepts || []);
      if (cs.length) body.appendChild(el("section", { class: "k-insp-sec", "aria-label": "Concepts in this lesson" }, [
        el("h2", { class: "k-kicker", text: "Concepts in this lesson" }),
        el("ul", { class: "k-mind-insp-concepts" }, cs.slice(0, 8).map(function (cid) {
          var c = M().concept(cid); return c ? el("li", {}, [el("span", { text: c.name }), UI().ladder(M().ladder(cid))]) : null; }).filter(Boolean))
      ]));
      var ev = sources();
      if (ev.length) body.appendChild(el("section", { class: "k-insp-sec", "aria-label": "Evidence in this lesson" }, [
        el("h2", { class: "k-kicker", text: "Evidence in this lesson" }),
        el("ul", { class: "k-mind-insp-ev" }, ev.map(function (s) { return el("li", {}, [UI().evidenceTag(s.tag), el("span", { text: s.t })]); }))
      ]));
      if (l.dialogue) body.appendChild(el("section", { class: "k-insp-sec", "aria-label": "Talk it through" }, [
        el("h2", { class: "k-kicker", text: "Talk it through" }),
        el("button", { type: "button", class: "k-mind-talkrow", "data-ui": "mind.talk-insp", onclick: function () {
          ui.page = ui.page || {}; ui.page[ref] = pages.length - 1; KOS.store.save(); KOS.rerender();
          setTimeout(function () { var b = document.querySelector("[data-ui~='mind.talk-open']"); if (b) b.click(); }, 60);
        } }, [UI().avatar("kurenai", "curious"), el("b", { text: l.dialogue.title })])
      ]));
      if (l.main) body.appendChild(el("section", { class: "k-insp-sec", "aria-label": "Ask Kurenai" }, [
        el("h2", { class: "k-kicker", text: "Ask Kurenai" }),
        el("div", { class: "k-mind-askgrid" }, KOS.mindRun.MODES.map(function (m) {
          return el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "mind.ask-open", text: m[1], onclick: function () { KOS.mindRun.ask({ lesson: ref, mode: m[0] }); } });
        }))
      ]));
    }
    ctx.onThisPage = function (body) {
      body.appendChild(el("nav", { class: "k-insp-sec", "aria-label": "On this page" }, [
        el("h2", { class: "k-kicker", text: "On this page" }),
        el("ol", { class: "k-mind-toc" }, pages.map(function (pg, i) {
          if (pg.kind === "check" || pg.kind === "close") return null;
          return el("li", {}, [el("a", { href: "#mind-pg-" + i, class: "k-link", text: pg.t,
            onclick: function (e) { e.preventDefault(); var t = document.getElementById("mind-pg-" + i); if (t) t.scrollIntoView({ block: "start" }); } })]);
        }).filter(Boolean))
      ]));
    };
    return ctx;
  }

  KOS.mindTopic = { begin: begin, spine: spine, pageBody: pageBody, block: block, check: check };
})();
