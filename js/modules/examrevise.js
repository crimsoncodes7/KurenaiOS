/* Kurenai OS — modules/examrevise.js · KOS.examRevise
   Revise: the revision guide, paged (docs/exams-rework-plan.md §5, design
   46a–46e, 46g; replaces the Companion's six-section scroll, D3).

     #/exams/<id>/revise[/<chapter>]
       essentials         Exam essentials (46b), from js/data/exam-essentials.js
       t:<topic key>      one chapter per topic, weakest first (46c): key notes
                          through the notes renderer, must memorise and the
                          mnemonics as callouts, how it is asked (the full
                          Companion's shapes, ONE worked answer open), traps,
                          templates per command word, Practise this
       lose               Where you lose marks (46d), from your attempts and
                          imported feedback
       cheat              Cheat sheet (46e): every memorise, mnemonic and
                          definition in scope, nine short blocks, one A4 page
       night              The night before: the synced checklist beside the
                          morning routine
       drill              the card drill (46g): the flashcard run, timed

   Opening Revise folds the exam's sidebar to its marks (examshell); the
   chapter list takes its place. Reading progress is per device (§9.5):
   a chapter is read when its foot has been on screen for three seconds or
   by Mark as read — a click or the reader's own scroll, never a render.
   Content is READ from KOS.examCompanion.guide, KOS.content and
   KOS.examDeep; nothing here is retyped.                                 */
(function () {
  "use strict";
  var el = KOS.ui.el;
  function E() { return KOS.exams; }
  function S() { return KOS.examSession; }
  function U() { return KOS.examUI; }
  function SH() { return KOS.examShell; }
  function today() { return KOS.srs.todayISO(); }
  function inline(t) { return KOS.content && KOS.content.inline ? KOS.content.inline(String(t || "")) : KOS.ui.esc(String(t || "")); }
  function html(tag, cls, str, extra) { var n = el(tag, Object.assign({ class: cls }, extra || {})); n.innerHTML = str; return n; }
  function blocks(list) { return KOS.content && KOS.content.renderBlocks ? KOS.content.renderBlocks(list || []) : ""; }
  function typeset(node) { if (KOS.content && KOS.content.typeset) { try { KOS.content.typeset(node); } catch (e) { /* KaTeX not loaded */ } } return node; }
  function announce(t) { U().announce(t); }
  function btn(t, k, f, x) { return U().btn(t, k, f, x); }
  var RAG = { r: ["▲", "Red", "danger"], a: ["◐", "Amber", "amber"], g: ["●", "Green", "green"] };

  function guideOf(a) { return KOS.examCompanion ? KOS.examCompanion.guide(a) : null; }
  function essentialsOf(a) {
    var X = window.KOS_EXAMS, pr = a.preset ? E().preset(a.preset) : null;
    return X && X.essentialsFor ? X.essentialsFor(a.preset, pr ? pr.board : a.board) : null;
  }
  function order(a) { var o = KOS.store.state.ui.examReviseOrder; return o && o[a.id] === "spec" ? "spec" : "weak"; }

  function headActions(a) {
    return [btn("Card drill", "", function () { KOS.show("exams", { id: a.id, tab: "revise", sub: "drill" }); }, { "data-ui": "exams.drill-open" }),
      btn("⎙ Print the guide", "quiet", function () { printGuide(a); }, { "data-ui": "exams.print-guide" })];
  }

  /* ---------------- the page ---------------- */
  function page(content, a, sub) {
    var chs = S().chapters(a, order(a));
    if (sub === "drill") return drill(content, a);
    var cur = chs.filter(function (c) { return c.id === sub; })[0] || chs.filter(function (c) { return !c.read && !c.noRead; })[0] || chs[0];
    content.setAttribute("data-ui", content.getAttribute("data-ui") + " exams.revise");
    var grid = el("div", { class: "k-xr", "data-ui": "exams.revise-grid" });
    content.appendChild(grid);
    grid.appendChild(chapterList(a, chs, cur));
    var art = el("article", { class: "k-card k-xr-chapter", "data-ui": "exams.chapter", "data-chapter": cur.id, "aria-labelledby": "k-xs-h2" });
    grid.appendChild(art);
    var toc = el("aside", { class: "k-xr-toc", "data-ui": "exams.toc", "aria-label": "On this page" });
    grid.appendChild(toc);
    var heads = [];
    function sec(title, id) {
      var h = el("h3", { class: "k-xr-h3", id: "k-xr-" + id, tabindex: "-1", text: title });
      heads.push([id, title, h]);
      return h;
    }
    var g = guideOf(a);
    var B = { essentials: essentialsCh, topic: topicCh, lose: loseCh, cheat: cheatCh, night: nightCh }[cur.kind];
    B(art, a, cur, chs, g, sec);
    /* ‹ Previous · Next › */
    var i = chs.indexOf(cur), prev = chs[i - 1], next = chs[i + 1];
    var end = el("span", { class: "k-xr-end", "aria-hidden": "true" });
    art.appendChild(end);
    art.appendChild(el("nav", { class: "k-xr-prevnext", "aria-label": "Chapters" }, [
      prev ? el("button", { type: "button", class: "k-xr-pn", "data-ui": "exams.chapter-prev", onclick: function () { KOS.show("exams", { id: a.id, tab: "revise", sub: prev.id }); } },
        [el("span", { class: "k-ex-muted", text: "‹ Previous" }), el("b", { text: chName(prev) })]) : el("span"),
      next ? el("button", { type: "button", class: "k-xr-pn", "data-dir": "next", "data-ui": "exams.chapter-next", onclick: function () { KOS.show("exams", { id: a.id, tab: "revise", sub: next.id }); } },
        [el("span", { class: "k-ex-muted", text: "Next ›" }), el("b", { text: chName(next) })]) : el("span")]));
    /* On this page */
    toc.appendChild(el("div", { class: "k-xr-tochead", text: "On this page" }));
    var links = heads.map(function (h, j) {
      var b = el("button", { type: "button", class: "k-xr-toclink", "data-ui": "exams.toc-link", "aria-current": j === 0 ? "true" : null, text: h[1],
        onclick: function () { h[2].scrollIntoView({ behavior: "smooth", block: "start" }); h[2].focus({ preventScroll: true }); } });
      toc.appendChild(b);
      return b;
    });
    toc.appendChild(btn("⎙ Print", "quiet sm", function () { printChapter(a, art); }, { "data-ui": "exams.print-chapter" }));
    /* the chips under the title below 1240 */
    var chips = art.querySelector(".k-xr-chips");
    if (chips) heads.forEach(function (h) { chips.appendChild(el("button", { type: "button", class: "k-chip", onclick: function () { h[2].scrollIntoView({ block: "start" }); h[2].focus({ preventScroll: true }); }, text: h[1] })); });
    if (typeof IntersectionObserver === "function" && heads.length) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var j = heads.map(function (h) { return h[2]; }).indexOf(e.target);
          links.forEach(function (l, k) { if (k === j) l.setAttribute("aria-current", "true"); else l.removeAttribute("aria-current"); });
        });
      }, { rootMargin: "0px 0px -70% 0px" });
      heads.forEach(function (h) { io.observe(h[2]); });
    }
    if (!cur.noRead && !cur.read) watchEnd(a, cur, end, chs);
    typeset(art);
  }
  function chName(c) { return c.kind === "topic" ? (c.topic.short || c.ref) + " " + c.title : c.title; }
  /* a chapter's foot on screen for three seconds marks it read — the
     reader's own scroll, never a render */
  function watchEnd(a, cur, end, chs) {
    if (typeof IntersectionObserver !== "function") return;
    var timer = null;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && !timer) timer = setTimeout(function () {
          if (!end.isConnected || S().isRead(a.id, cur.id)) return;
          S().markRead(a.id, cur.id, true);
          io.disconnect();
          var n = S().chapters(a).filter(function (c) { return c.read; }).length;
          announce("Marked as read. " + n + " of " + chs.filter(function (c) { return !c.noRead; }).length + ".");
        }, 3000);
        else if (!e.isIntersecting && timer) { clearTimeout(timer); timer = null; }
      });
    });
    io.observe(end);
  }
  function readIcon(c, active) {
    return el("span", { class: "k-xr-read", "data-state": c.read ? "read" : active ? "active" : null, "aria-hidden": "true", text: c.read ? "✓" : "" });
  }
  function chapterList(a, chs, cur) {
    var w = E().paperWeights ? E().paperWeights(a) : null;
    function fig(c) {
      if (c.kind === "essentials") return a.marks ? String(a.marks) : "";
      if (c.kind === "night") { var n = E().checklist(a).filter(function (x) { return x.group === "night"; }); return n.length ? n.filter(function (x) { return x.done; }).length + "/" + n.length : ""; }
      if (c.kind === "topic" && w && w.leaves) {
        var m = c.topic.leaves.reduce(function (s, k) { return s + (w.leaves[k] ? w.leaves[k].mean || 0 : 0); }, 0);
        return m ? String(Math.round(m)) : "";
      }
      return "";
    }
    var nRead = chs.filter(function (c) { return c.read; }).length, of = chs.filter(function (c) { return !c.noRead; }).length;
    var box = el("nav", { class: "k-card k-xr-list", "data-ui": "exams.chapters", "aria-label": "Chapters" });
    /* on the iPad and phone the list folds to its head and the chapter you
       are on; the head opens the rest (46a: chapters as a sheet) */
    var headB = el("button", { type: "button", class: "k-xr-listhead", "aria-expanded": "false", "data-ui": "exams.chapters-toggle",
      onclick: function () { var o = box.hasAttribute("data-open"); if (o) box.removeAttribute("data-open"); else box.setAttribute("data-open", ""); headB.setAttribute("aria-expanded", String(!o)); } },
      [el("b", { text: "Chapters" }), el("span", { class: "k-mono k-ex-muted", text: nRead + " of " + of + " read" }), el("span", { class: "k-xr-fold", "aria-hidden": "true", text: "▾" })]);
    box.appendChild(headB);
    var shownTopics = 0, more = null, showAll = !!(KOS.store.state.ui.examReviseAll || {})[a.id];
    var groups = { essentials: "Essentials", topics: "Topics · " + (order(a) === "spec" ? "spec order" : "weakest first"), yours: "Yours" }, last = null;
    chs.forEach(function (c) {
      if (c.group !== last) {
        last = c.group;
        var gh = el("div", { class: "k-xr-group" }, [el("span", { text: groups[c.group] })]);
        if (c.group === "topics") gh.appendChild(el("button", { type: "button", class: "k-link k-xr-order", "data-ui": "exams.revise-order",
          text: order(a) === "spec" ? "Weakest first" : "Spec order", onclick: function () {
            var u = KOS.store.state.ui; u.examReviseOrder = u.examReviseOrder || {}; u.examReviseOrder[a.id] = order(a) === "spec" ? "weak" : "spec"; KOS.store.save(); KOS.rerender();
          } }));
        box.appendChild(gh);
      }
      if (c.kind === "topic") {
        shownTopics++;
        if (shownTopics > 8 && !showAll && c !== cur) {
          if (!more) {
            more = el("button", { type: "button", class: "k-link k-xr-more", "data-ui": "exams.chapters-more", onclick: function () {
              var u = KOS.store.state.ui; u.examReviseAll = u.examReviseAll || {}; u.examReviseAll[a.id] = true; KOS.store.save(); KOS.rerender();
            } });
            box.appendChild(more);
          }
          more.textContent = (shownTopics - 8) + " more topics ▾";
          return;
        }
      }
      var on = c === cur;
      box.appendChild(el("button", { type: "button", class: "k-xr-row", "data-ui": "exams.chapter-row", "data-chapter": c.id, "aria-current": on ? "page" : null,
        onclick: function () { if (!on) { KOS.show("exams", { id: a.id, tab: "revise", sub: c.id }); announce("Chapter " + c.n + ", " + c.title + "."); } } }, [
        c.noRead ? el("span", { class: "k-xr-read", "data-state": "none", "aria-hidden": "true" }) : readIcon(c, on),
        el("span", { class: "k-xr-rowt", text: c.kind === "topic" ? (c.topic.short || c.ref) + " " + c.title : c.title }),
        el("span", { class: "k-mono k-ex-muted", text: fig(c) })]));
    });
    if (w && w.leaves) box.appendChild(el("div", { class: "k-xr-listfoot", text: "Figures: marks a paper" }));
    return box;
  }
  function chHead(art, a, cur, chs, sub, right) {
    art.appendChild(el("div", { class: "k-xr-chtop" }, [
      el("span", { class: "k-mono k-ex-muted", text: "Chapter " + cur.n + " of " + chs.length + (sub ? " · " + sub : "") }), el("span", { class: "k-ex-grow" })].concat(right || []).filter(Boolean)));
  }
  function readBtn(a, cur) {
    if (cur.noRead) return null;
    if (cur.read) return el("button", { type: "button", class: "k-chip", "data-tone": "green", "data-ui": "exams.chapter-read", text: "✓ Read",
      onclick: function () { S().markRead(a.id, cur.id, false); KOS.rerender(); } });
    return btn("Mark as read", "sm", function () {
      S().markRead(a.id, cur.id, true);
      var n = S().chapters(a).filter(function (c) { return c.read; }).length;
      announce("Marked as read. " + n + " of " + S().chapters(a).filter(function (c) { return !c.noRead; }).length + ".");
      KOS.rerender();
    }, { "data-ui": "exams.chapter-read" });
  }
  function title(art, text, sub) {
    art.appendChild(el("h2", { class: "k-xr-title", id: "k-xs-h2", tabindex: "-1", text: text }));
    if (sub) art.appendChild(el("p", { class: "k-xr-sub", text: sub }));
    art.appendChild(el("div", { class: "k-xr-chips" }));
  }

  /* ---------------- Exam essentials (46b) ---------------- */
  function essentialsCh(art, a, cur, chs, g, sec) {
    var x = essentialsOf(a) || {}, pr = a.preset ? E().preset(a.preset) : null;
    chHead(art, a, cur, chs, pr ? pr.board + " " + pr.paper : null, [readBtn(a, cur)]);
    title(art, "Exam essentials", "Read once now, again the week before");
    var glance = (x.glance || []);
    var tiles = [];
    var mins = a.durationMins || (pr && pr.mins), marks = a.marks || (pr && pr.marks);
    if (mins) tiles.push([SH().hm(mins).replace(" 00", ""), "written"]);
    if (marks) tiles.push([String(marks), "marks"]);
    if (mins && marks) tiles.push([String(Math.round(mins / marks * 10) / 10), "min a mark"]);
    var ext = (x.structure || []).filter(function (s) { return s.levels; }).map(function (s) { return s.marks; });
    if (ext.length) tiles.push([ext.join(" + "), "extended"]);
    art.appendChild(sec("At a glance", "glance"));
    art.appendChild(el("div", { class: "k-xr-tiles" }, tiles.map(function (t) { return el("div", { class: "k-xr-tile" }, [el("b", { class: "k-mono", text: t[0] }), U().muted(t[1])]); })));
    var scen = glance.filter(function (r) { return /scenario|context|structure/i.test(r[0]); })[0];
    if (scen) art.appendChild(html("p", "k-xr-p", inline(scen[1])));
    if ((x.objectives || []).length) {
      art.appendChild(sec("Objectives", "objectives"));
      var wt = x.objectives.some(function (o) { return o.weight; });
      art.appendChild(table(["", "Asks you to", "Spot it in the stem"], x.objectives.map(function (o) { return [o.code + (wt && o.weight ? "\n" + o.weight : ""), o.what, o.spot]; })));
    }
    /* the marks each grade typically needs on this paper (asked for 18
       November 2026): the board's last three series, averaged */
    var tb = E().typicalBounds ? E().typicalBounds(a) : null;
    if (tb && tb.grades.length) {
      art.appendChild(sec("Grade boundaries", "bounds"));
      var heads = ["Grade", "Typical"].concat(tb.series.map(function (x) { return "June " + x.series.slice(0, 4); }));
      art.appendChild(el("div", { class: "k-xr-table k-xr-bounds", role: "table", "data-ui": "exams.bounds" }, [el("div", { class: "k-xr-tr k-xr-th", role: "row", style: "--n: " + heads.length }, heads.map(function (h) { return el("span", { role: "columnheader", text: h }); }))]
        .concat(tb.grades.map(function (g) {
          return el("div", { class: "k-xr-tr", role: "row", style: "--n: " + heads.length }, [el("b", { role: "cell", text: g.grade }), el("b", { class: "k-mono", role: "cell", text: g.marks + " / " + tb.max })]
            .concat(tb.series.map(function (x) { return el("span", { class: "k-mono k-ex-muted", role: "cell", text: x.marks[g.grade] != null ? String(x.marks[g.grade]) : "–" }); })));
        }))));
      art.appendChild(el("p", { class: "k-ex-muted k-ex-small", text: "An estimate: " + tb.from + (tb.series.length ? ", scaled to this paper's " + tb.max + " marks" : "") + ". Boundaries move every series; aim a grade above." }));
    }
    if (g && g.commands && g.commands.length) {
      art.appendChild(sec("Command words", "commands"));
      art.appendChild(table(["Word", "Earns the marks"], g.commands.map(function (c) { return [c.w, c.asks]; })));
    }
    if ((x.structure || []).length) {
      art.appendChild(sec(ext.length ? "Level grids" : "How the marks go", "levels"));
      art.appendChild(el("div", { class: "k-xr-grids" }, x.structure.map(function (s) {
        return el("div", { class: "k-xr-grid" }, [el("b", { class: "k-mono", text: s.marks + (s.marks === 1 ? " mark" : " marks") }),
          el("ol", { class: "k-xr-ol" }, s.how.map(function (h) { return html("li", "", inline(h)); }))]);
      })));
    }
    if ((x.templates || []).length) {
      art.appendChild(sec("Extended answers", "extended"));
      art.appendChild(table(["Command", "Shape"], x.templates.map(function (t) { return [t.w, t.frame + (t.eg ? "\n*e.g.* " + t.eg : "")]; })));
      art.appendChild(html("div", "k-xr-callout", blocks([{ callout: { t: "tip", h: "PEEL", body: ["**P**oint · **E**xplain · **E**vidence from the context · **L**ink back to the question — and a judgement to end a 9-marker."] } }])));
    }
    if (x.booklet) {
      art.appendChild(sec("The formula booklet", "booklet"));
      art.appendChild(el("div", { class: "k-xr-two" }, [
        el("div", {}, [el("b", { text: "Given" }), el("ul", { class: "k-xr-ul" }, x.booklet.given.map(function (t) { return html("li", "", inline(t)); }))]),
        el("div", {}, [el("b", { text: "Learn these" }), el("ul", { class: "k-xr-ul" }, x.booklet.learn.map(function (t) { return html("li", "", inline(t)); }))])]));
    }
    if ((x.notExaminable || []).length) {
      art.appendChild(sec("Not examinable", "notexam"));
      art.appendChild(el("ul", { class: "k-xr-ul" }, x.notExaminable.map(function (t) { return html("li", "", inline(t)); })));
    }
  }
  function table(head, rows) {
    return el("div", { class: "k-xr-table", role: "table" }, [el("div", { class: "k-xr-tr k-xr-th", role: "row", "data-n": String(head.length) }, head.map(function (h) { return el("span", { role: "columnheader", text: h }); }))]
      .concat(rows.map(function (r) {
        return el("div", { class: "k-xr-tr", role: "row", "data-n": String(head.length) }, r.map(function (c, i) { return html("span", i === 0 ? "k-xr-td0" : "", inline(c).replace(/\n/g, "<br>"), { role: "cell" }); }));
      })));
  }

  /* ---------------- a topic's chapter (46c) ---------------- */
  function shapesFor(a, t) {
    var D = KOS.examDeep;
    if (!D) return [];
    var pids = D.papersFor ? D.papersFor(a) : [D.paperOf(a)].filter(Boolean);
    var out = [];
    pids.forEach(function (pid) {
      var d = D.data(pid);
      if (!d) return;
      d.leaves.forEach(function (l) { if (t.leaves.indexOf(l.key) !== -1) l.archetypes.forEach(function (s) { out.push({ pid: pid, s: s, leaf: l }); }); });
    });
    return out;
  }
  function catalogued(a, t) {
    var C = KOS.examCompanion, pid = C && C.indexPaperOf ? C.indexPaperOf(a) : null, st = pid ? C.archetypes(pid) : null;
    if (!st) return [];
    var on = {};
    t.leaves.forEach(function (k) { on[k] = true; });
    return st.list.filter(function (x) { return !x.unique && x.leaves.some(function (k) { return on[k]; }); });
  }
  function refsFor(t) {
    var ix = window.KOS_EXAMS && KOS_EXAMS.index;
    if (!ix || !ix.questions) return [];
    var on = {};
    t.leaves.forEach(function (k) { on[k] = true; });
    return ix.questions.filter(function (q) { return (q[5] || []).some(function (k) { return on[k]; }); }).slice(-6).reverse();
  }
  function topicCh(art, a, cur, chs, g, sec) {
    var t = cur.topic, x = RAG[t.rag];
    chHead(art, a, cur, chs, t.short || t.ref, [x ? el("span", { class: "k-chip", "data-tone": x[2], text: x[0] + " " + x[1] }) : null, readBtn(a, cur)]);
    var weakest = S().weakest(S().topics(a))[0];
    title(art, t.title, [weakest && weakest.key === t.key ? "Weakest" : null, t.recall != null ? "Recall " + Math.round(100 * t.recall) + " %" : null, t.best ? "Best " + t.best.got + "/" + t.best.max : null,
      t.last ? "practised " + U().pretty(t.last, { dow: false }) : "never practised"].filter(Boolean).join(" · "));
    /* key notes, through the notes renderer */
    art.appendChild(sec("Key notes", "notes"));
    var any = false;
    t.leaves.forEach(function (k) {
      var p = KOS.spec.parse(k), c = p && KOS.content.get(p.subject, p.ref);
      var list = c && Array.isArray(c.notes) ? c.notes : null;
      if (t.leaves.length > 1) art.appendChild(el("h4", { class: "k-xr-h4", text: (KOS.spec.node(p.subject, p.ref) || {}).title || p.ref }));
      if (!list || !list.length) { art.appendChild(el("p", { class: "k-ex-muted", text: "No notes for " + p.ref + " yet." })); return; }
      any = true;
      art.appendChild(html("div", "k-xr-notes k-notes", blocks(list.filter(function (b, i) { return !(i === 0 && b && b.h && !b.callout); }))));
    });
    if (!any && t.leaves.length === 1) art.appendChild(btn("Open the topic", "sm", function () { var p = KOS.spec.parse(t.leaves[0]); KOS.show("ref", { subject: p.subject, ref: p.ref }); }));
    /* must memorise and the mnemonics, as callouts */
    var on = {};
    t.leaves.forEach(function (k) { on[k] = true; });
    var mem = g ? (g.memorise || []).filter(function (r) { return on[r.key]; }) : [];
    var mn = g ? (g.mnemonics || []).filter(function (r) { return on[r.key]; }) : [];
    if (mem.length || mn.length) {
      art.appendChild(sec("Must memorise", "memorise"));
      art.appendChild(el("div", { class: "k-xr-callouts" }, mem.map(function (r) { return html("div", "", blocks([{ callout: { t: "memorise", h: r.h || "Learn this", body: [r.text] } }])); })
        .concat(mn.map(function (r) { return html("div", "", blocks([{ callout: { t: "mnemonic", h: r.h || "Mnemonic", body: [r.text] } }])); }))));
    }
    /* how it is asked: the shapes, ONE worked answer open */
    var shapes = shapesFor(a, t);
    art.appendChild(sec("How it's asked", "asked"));
    if (shapes.length) {
      var open = 0;
      shapes.forEach(function (x2, i) { art.appendChild(shapeCard(a, x2, i, i === open)); });
    } else if (catalogued(a, t).length) {
      /* no full Companion for this paper: the catalogued shapes from the
         past-paper index, each with how often it came up and where */
      catalogued(a, t).slice(0, 6).forEach(function (sh) {
        var inst = sh.instances.filter(function (x) { return x.sitting !== "specimen" && x.sitting !== "sample"; }).slice(0, 3);
        art.appendChild(el("div", { class: "k-xr-shape", "data-ui": "exams.shape" }, [
          el("div", { class: "k-xr-shapehead" }, [el("b", { class: "k-ex-grow", text: sh.title }), el("span", { class: "k-chip", "data-tone": sh.appear / Math.max(1, sh.of) >= 0.75 ? "teal" : "muted", text: sh.appear + " of " + sh.of + " sittings" })]),
          el("div", { class: "k-xr-shapebody" }, [U().muted((sh.lo != null ? (sh.lo === sh.hi ? sh.lo : sh.lo + "–" + sh.hi) + " marks when it comes up · " : "") + inst.map(function (x) { return KOS.examCompanion.sittingName(x.sitting) + " " + x.q; }).join(" · "))])]));
      });
      art.appendChild(el("p", { class: "k-ex-muted k-ex-small", text: "Frequency is evidence, not prophecy: anything in the specification can appear." }));
    } else {
      var refs = refsFor(t);
      art.appendChild(el("p", { class: "k-ex-muted", text: refs.length ? "No question shapes written for this topic yet. On the past papers it came up as:" : "No question shapes written for this topic yet, and no past-paper question is indexed on it." }));
      if (refs.length) art.appendChild(el("ul", { class: "k-xr-ul" }, refs.map(function (q) {
        return el("li", { text: (KOS.examIndex && KOS.examIndex.sittingLabel ? KOS.examIndex.sittingLabel(q[1]) : q[1]) + " · " + q[3] + (q[4] ? " · " + q[4] + " marks" : "") });
      })));
    }
    /* traps: the board's and your own */
    var traps = [];
    shapes.forEach(function (x2) { (x2.s.traps || []).forEach(function (tr) { traps.push({ h: tr.h || null, text: tr.text || tr.t || "", from: tr.sitting ? "From the examiner's report · " + tr.sitting + " " + (tr.q || "") : null }); }); });
    (g ? g.traps || [] : []).filter(function (tr) { return on[tr.key]; }).forEach(function (tr) { traps.push({ h: tr.h, text: tr.text, from: null }); });
    E().attemptsFor(a).forEach(function (e) {
      (e.questions || []).forEach(function (q) {
        if (q.got == null || q.got >= q.max || !(q.refs || []).some(function (r) { return on[r] || on[(e.subject || a.subject) + ":" + r]; })) return;
        traps.push({ h: (q.tags && q.tags[0] ? KOS.tracker.tagShort(q.tags[0]) : "Marks dropped"), text: "Lost " + (q.max - q.got) + (q.max - q.got === 1 ? " mark" : " marks") + " on " + (e.paper || "a paper") + ", " + q.q + ".", own: true });
      });
    });
    if (traps.length) {
      art.appendChild(sec("Traps", "traps"));
      art.appendChild(el("ul", { class: "k-xr-traps" }, traps.slice(0, 8).map(function (tr) {
        return el("li", { class: "k-xr-trap", "data-own": tr.own ? "" : null }, [el("span", { class: "k-xr-trapmark", "aria-hidden": "true", text: "▲" }),
          html("span", "", (tr.h ? "<b>" + inline(String(tr.h).replace(/\*\*/g, "")) + "</b> · " : "") + inline(tr.text) + (tr.from ? " <span class=\"k-ex-muted\">" + KOS.ui.esc(tr.from) + "</span>" : ""))]);
      })));
    }
    /* templates per command word */
    var x3 = essentialsOf(a), qs = S().questions(a).filter(function (q) { return q.topic === t.key; });
    var cmds = {};
    qs.forEach(function (q) { if (q.command) cmds[q.command] = true; });
    var tpl = x3 && x3.templates ? x3.templates.filter(function (tp) { return cmds[tp.w] || Object.keys(cmds).some(function (c) { return tp.w.toLowerCase().indexOf(c.toLowerCase()) === 0; }); }) : [];
    if (!tpl.length && x3 && x3.templates) tpl = x3.templates.slice(0, 3);
    if (tpl.length) {
      art.appendChild(sec("Templates", "templates"));
      art.appendChild(table(["Command", "Shape"], tpl.map(function (tp) { return [tp.w, tp.frame]; })));
    }
    /* Practise this */
    var cards = t.cards;
    art.appendChild(sec("Practise this", "practise"));
    art.appendChild(el("div", { class: "k-xr-practise", "data-ui": "exams.practise" }, [
      el("div", {}, [el("b", { text: "Practise this" }), U().muted([qs.length ? Math.min(5, qs.length) + " questions" : null, cards ? cards + " cards" : null, "on " + (t.short || t.ref)].filter(Boolean).join(" · "))]),
      el("span", { class: "k-ex-grow" }),
      qs.length ? btn("問 " + Math.min(5, qs.length) + " questions", "primary sm", function () { KOS.show("exams", { id: a.id, tab: "questions", sub: "topic:" + t.key }); }, { "data-ui": "exams.practise-qs" }) : null,
      cards ? btn("↻ " + cards + " cards", "sm", function () { var p = KOS.spec.parse(t.leaves[0]); KOS.show("ref", { subject: p.subject, ref: t.leaves.length === 1 ? p.ref : t.ref, tab: "cards" }); }, { "data-ui": "exams.practise-cards" }) : null].filter(Boolean)));
  }
  function shapeCard(a, x, i, open) {
    var s = x.s, vs = s.variations || [];
    var lo = Math.min.apply(null, vs.map(function (v) { return v.m; })), hi = Math.max.apply(null, vs.map(function (v) { return v.m; }));
    var body = el("div", { class: "k-xr-shapebody", hidden: open ? null : "" });
    var shown = 0;
    function worked(v) {
      return el("div", { class: "k-xr-worked", "data-ui": "exams.worked" }, [
        html("div", "k-xr-wq", inline(v.q) + " <span class=\"k-mono k-ex-muted\">[" + v.m + "]</span>"),
        el("div", { class: "k-xr-wlabel", text: "One worked answer" }),
        el("ol", { class: "k-xr-steps" }, (v.steps || []).map(function (st) {
          return el("li", {}, [el("span", { class: "k-xr-stepn k-mono", text: String(st.value || 1) }), html("span", "", inline(st.text || st.m || ""))]);
        }))]);
    }
    if (vs.length) body.appendChild(worked(vs[0]));
    if (vs.length > 1) {
      var more = btn((vs.length - 1) + " more worked " + (vs.length - 1 === 1 ? "answer" : "answers"), "sm", function () {
        shown++;
        more.parentNode.insertBefore(worked(vs[shown]), more);
        typeset(more.parentNode);
        if (shown >= vs.length - 1) more.remove(); else more.textContent = (vs.length - 1 - shown) + " more";
      }, { "data-ui": "exams.worked-more" });
      body.appendChild(more);
    }
    if (KOS.examDeepView) body.appendChild(U().linkBtn("The whole shape ›", function () { KOS.show("exams", { id: a.id, tab: "deep", sub: s.id }); }));
    var head = el("button", { type: "button", class: "k-xr-shapehead", "aria-expanded": String(!!open), "data-ui": "exams.shape",
      onclick: function () {
        var o = body.hidden;
        body.hidden = !o; head.setAttribute("aria-expanded", String(o));
        if (o) { typeset(body); announce(s.title + ", open. One worked answer."); }
      } }, [el("span", { class: "k-mono k-ex-muted", text: "ABCDEFGHIJ".charAt(i) }), el("b", { class: "k-ex-grow", text: s.title }),
      el("span", { class: "k-mono k-ex-muted", text: vs.length ? (lo === hi ? String(lo) : lo + "–" + hi) : "" }), el("span", { "aria-hidden": "true", text: open ? "▾" : "›" })]);
    return el("div", { class: "k-xr-shape", "data-state": open ? "open" : null }, [head, body]);
  }

  /* ---------------- Where you lose marks (46d) ---------------- */
  function loseCh(art, a, cur, chs, g, sec) {
    var atts = E().attemptsFor(a).filter(function (e) { return (e.questions || []).some(function (q) { return q.got != null; }); });
    chHead(art, a, cur, chs, "yours", [btn("＋ Add feedback", "sm", function () { KOS.show("exams", { id: a.id, tab: "review" }); }, { "data-ui": "exams.lose-feedback" })]);
    var last = atts[atts.length - 1];
    title(art, "Where you lose marks", last ? [last.paper || "Last paper", U().pretty(last.date, { dow: false }), last.marks != null && last.max ? last.marks + "/" + last.max : null].filter(Boolean).join(" · ") : null);
    var host = el("div", { "data-ui": "exams.lose" });
    art.appendChild(host);
    var rows = [], lost = 0;
    var byTag = {};
    atts.forEach(function (e) {
      (e.questions || []).forEach(function (q) {
        if (q.got == null || q.got >= q.max) return;
        lost += q.max - q.got;
        var tags = q.tags && q.tags.length ? q.tags : ["untagged"];
        tags.forEach(function (tg) {
          var r = byTag[tg] = byTag[tg] || { what: tg === "untagged" ? "Marks dropped, not tagged" : KOS.tracker.tagLabel ? KOS.tracker.tagLabel(tg) : tg, kind: tg === "time" ? "timing" : tg === "command" ? "command word" : tg === "knowledge" || tg === "recall" ? "knowledge" : "technique", parts: [], cost: 0 };
          r.parts.push(q.q); r.cost += (q.max - q.got) / tags.length;
        });
      });
    });
    Object.keys(byTag).forEach(function (k) { rows.push(byTag[k]); });
    function draw(fb) {
      host.textContent = "";
      var all = rows.concat(fb).sort(function (x, y) { return (y.cost || 0) - (x.cost || 0); }).slice(0, 10);
      var targets = S().targets(a.id);
      if (!all.length) {
        host.appendChild(el("div", { class: "k-xr-empty", "data-ui": "exams.lose-empty" }, [
          el("p", { text: "This fills from your marked papers and from feedback you bring back from Claude or Gemini." }),
          el("div", { class: "k-ex-inline" }, [btn("Sit a paper", "primary sm", function () { KOS.show("exams", { id: a.id, tab: "papers" }); }), btn("Log a result", "sm", function () { KOS.trackerLog({ assessmentId: a.id }, function () { KOS.rerender(); }); })])]));
        return;
      }
      host.appendChild(el("div", { class: "k-xr-tiles" }, [
        el("div", { class: "k-xr-tile" }, [el("b", { class: "k-mono", text: String(Math.round(lost)) }), U().muted("marks lost")]),
        el("div", { class: "k-xr-tile" }, [el("b", { class: "k-mono", text: String(all.length) }), U().muted("explained below")]),
        el("div", { class: "k-xr-tile" }, [el("b", { class: "k-mono", text: String(targets.filter(function (x) { return x.state === "open"; }).length) }), U().muted("targets open")])]));
      var tbl = el("div", { class: "k-xr-lose", role: "table" }, [el("div", { class: "k-xr-loserow k-xr-th", role: "row" }, ["", "What", "Parts", "Cost", "Target"].map(function (h) { return el("span", { role: "columnheader", text: h }); }))]);
      all.forEach(function (r, i) {
        var tg = targets.filter(function (x) { return x.text === r.target || x.text === r.what; })[0];
        tbl.appendChild(el("div", { class: "k-xr-loserow", role: "row", "data-ui": "exams.lose-row" }, [
          el("span", { class: "k-xs-stepn", role: "cell", text: String(i + 1) }),
          el("span", { role: "cell", class: "k-xr-losewhat" }, [el("b", { text: r.what }), U().muted(r.kind)]),
          el("span", { role: "cell", class: "k-mono k-ex-small", text: r.parts.slice(0, 4).join(" · ") }),
          el("span", { role: "cell", class: "k-mono", "data-tone": r.cost ? "alarm" : null, text: r.cost ? "▼ " + Math.round(r.cost) + (Math.round(r.cost) === 1 ? " mark" : " marks") : "time" }),
          el("span", { role: "cell" }, [tg ? el("span", { class: "k-xr-target" }, [el("span", { "aria-hidden": "true", text: "◎ " }), tg.text, U().muted(" " + S().evidence(tg).met + " of 2")])
            : U().linkBtn("＋ Make a target", function () { S().addTarget(a.id, { text: r.target || r.what, kind: r.kind === "timing" ? "timing" : r.kind === "knowledge" ? "topic" : "technique", parts: r.parts }); announce("Target made."); KOS.rerender(); })])]));
      });
      host.appendChild(tbl);
      host.appendChild(el("div", { class: "k-xs-note k-card" }, [el("span", { "aria-hidden": "true", text: "▤" }), el("span", { text: "Each paper adds its evidence; a target closes after two papers meet it." })]));
    }
    draw([]);
    /* imported feedback findings (asynchronous: the attempts store) */
    if (KOS.attempts) KOS.attempts.list({ aid: a.id }, function (err, recs) {
      if (err || !host.isConnected) return;
      var fb = [];
      (recs || []).forEach(function (r) {
        Object.keys(r.feedback || {}).forEach(function (k) {
          var f = r.feedback[k];
          (f.findings || []).forEach(function (x) {
            fb.push({ what: x.what, kind: String(x.error_type || "").replace(/_/g, " "), parts: x.parts || [], cost: x.lost || 0, target: null });
          });
        });
      });
      if (fb.length) draw(fb);
    });
  }

  /* ---------------- Cheat sheet (46e) ---------------- */
  function cheatCh(art, a, cur, chs, g, sec) {
    chHead(art, a, cur, chs, "one page", [btn("⎙ Print one page", "sm", function () { printChapter(a, art); }, { "data-ui": "exams.cheat-print" })]);
    var pr = a.preset ? E().preset(a.preset) : null;
    title(art, "Cheat sheet", "Every mnemonic, definition and list in the " + (pr ? pr.paper : a.title) + " scope");
    var tops = S().topics(a), byTopic = {};
    function push(key, line) {
      var t = tops.filter(function (x) { return x.leaves.indexOf(key) !== -1; })[0];
      if (!t) return;
      var b = byTopic[t.key] = byTopic[t.key] || { t: t, lines: [] };
      if (b.lines.length < 6) b.lines.push(line);
    }
    if (g) {
      (g.mnemonics || []).forEach(function (r) { push(r.key, { h: r.h, text: r.text }); });
      (g.memorise || []).forEach(function (r) { push(r.key, { h: r.h, text: r.text }); });
      (g.defs || []).forEach(function (r) { push(r.key, { h: r.h, text: String(r.text || "").split(/(?<=\.)\s/)[0] }); });
    }
    var list = tops.map(function (t) { return byTopic[t.key]; }).filter(Boolean).slice(0, 9);
    var none = tops.filter(function (t) { return !byTopic[t.key]; });
    var grid = el("div", { class: "k-xr-cheat", "data-ui": "exams.cheat" }, list.map(function (b) {
      return el("section", { class: "k-xr-cheatblk" }, [el("h4", { class: "k-xr-cheath", text: b.t.title }),
        el("ul", { class: "k-xr-cheatul" }, b.lines.map(function (l) { return html("li", "", (l.h ? "<b>" + inline(String(l.h).replace(/\*\*/g, "")) + "</b> · " : "") + inline(String(l.text || "").slice(0, 160))); }))]);
    }));
    art.appendChild(grid);
    if (!list.length) art.appendChild(el("p", { class: "k-ex-muted", text: "No memorise or mnemonic callouts in this scope yet." }));
    else if (none.length) art.appendChild(el("p", { class: "k-ex-muted k-ex-small", text: none.length + (none.length === 1 ? " topic has" : " topics have") + " nothing to put here yet: " + none.slice(0, 4).map(function (t) { return t.title; }).join(", ") + (none.length > 4 ? "…" : "") + "." }));
  }

  /* ---------------- The night before (46e) ---------------- */
  function nightCh(art, a, cur, chs, g, sec) {
    var x = essentialsOf(a) || {};
    chHead(art, a, cur, chs, "yours", [readBtn(a, cur)]);
    title(art, "The night before", "Ticks sync; On the day reads them again");
    var items = E().checklist(a).filter(function (c) { return c.group === "night"; });
    var list = el("div", { class: "k-xr-night", "data-ui": "exams.night" }, items.map(function (c) {
      var id = "k-xr-n-" + c.id.replace(/[^a-z0-9]/gi, "");
      var input = el("input", { type: "checkbox", id: id, checked: c.done ? "" : null, onchange: function () {
        E().tickCheck(a.id, c.id, input.checked);
        var n = E().checklist(a).filter(function (z) { return z.group === "night" && z.done; }).length;
        announce(c.text + (input.checked ? ", done. " : ", not done. ") + n + " of " + items.length + ".");
        KOS.rerender();
      } });
      return el("label", { class: "k-xs-checkrow", for: id, "data-state": c.done ? "done" : null }, [input, el("span", { text: c.text })]);
    }));
    var routine = (x.routine || []).length ? el("div", { class: "k-xr-routine" }, [el("h4", { class: "k-xr-h4", text: "The morning" }),
      el("ol", { class: "k-xr-ol" }, x.routine.map(function (r) { return html("li", "", inline(r)); }))]) : null;
    art.appendChild(sec("The checklist", "checklist"));
    art.appendChild(el("div", { class: "k-xr-two" }, [list, routine].filter(Boolean)));
    if ((x.night || []).length) {
      art.appendChild(sec("Before you sleep", "sleep"));
      art.appendChild(el("ul", { class: "k-xr-ul" }, x.night.map(function (r) { return html("li", "", inline(r)); })));
    }
  }

  /* ---------------- the card drill (46g) ----------------
     The flashcard run (KOS.flashcards.session), timed: the scope's cards,
     weakest first, at most forty, five minutes. Its ratings are the run's
     own and schedule as ever. The end card reads the cards' records: what
     was rated in the drill and which were Again. */
  var DRILL_MS = 5 * 60 * 1000;
  function drillCards(a) {
    var out = [], seen = {};
    E().leaves(a).forEach(function (k) {
      var p = KOS.spec.parse(k);
      if (!p) return;
      KOS.srs.cardsFor(p.subject, p.ref).forEach(function (c) {
        if (seen[c.key] || c.redo) return;
        var m = KOS.srs.peek(c.key);
        if (m && m.leech) return;
        seen[c.key] = true;
        var mem = KOS.srs.memory(c.key);
        c.meta = m; c.overdue = 0; c.r = mem ? mem.r : -1;
        out.push(c);
      });
    });
    out.sort(function (x, y) { return x.r - y.r; });
    return out.slice(0, 40);
  }
  function drill(content, a) {
    SH().sectionHead(content, "Card drill", null, [U().linkBtn("‹ Revise", function () { KOS.show("exams", { id: a.id, tab: "revise" }); })]);
    var cards = drillCards(a);
    var before = {};
    cards.forEach(function (c) { var m = KOS.srs.peek(c.key); before[c.key] = m ? (m.views || 0) + "|" + (m.lastRating) + "|" + m.last : "new"; });
    var started = Date.now(), timer = null;
    var ring = el("div", { class: "k-xr-clock", "data-ui": "exams.drill-clock", role: "timer", "aria-label": "Time left" });
    var head = el("div", { class: "k-xr-drillhead" }, [el("div", {}, [U().eyebrow("Card drill · timed"), el("h3", { class: "k-xr-drilltitle", text: a.title + " must-memorise" }),
      U().muted(cards.length + (cards.length === 1 ? " card" : " cards") + " · weakest first, from every topic in scope")]), el("span", { class: "k-ex-grow" }),
      btn("End drill", "quiet sm", function () { finish(); }, { "data-ui": "exams.drill-end" }), ring]);
    content.appendChild(head);
    var holder = el("div", { class: "k-fc k-xr-drill", "data-ui": "fc.wrap exams.drill" });
    content.appendChild(holder);
    function paint() {
      var left = Math.max(0, DRILL_MS - (Date.now() - started)), s = Math.ceil(left / 1000);
      ring.textContent = "";
      var r = KOS.ui.ring({ p: left / DRILL_MS, size: 88, stroke: 6 }, [el("b", { class: "k-mono", text: Math.floor(s / 60) + ":" + ("0" + (s % 60)).slice(-2) }), U().muted("of 5:00")]);
      ring.appendChild(r);
      if (!left) finish();
    }
    function finish() {
      if (timer) { clearInterval(timer); timer = null; }
      if (!holder.isConnected) return;
      var rated = [], missed = [];
      cards.forEach(function (c) {
        var m = KOS.srs.peek(c.key), now = m ? (m.views || 0) + "|" + m.lastRating + "|" + m.last : "new";
        if (now !== before[c.key]) { rated.push(c); if (m && m.lastRating === 0) missed.push(c); }
      });
      var secs = Math.round((Date.now() - started) / 1000);
      holder.textContent = "";
      holder.appendChild(el("div", { class: "k-card k-xr-drillend", "data-ui": "exams.drill-done" }, [
        el("h3", { text: "Drill done" }),
        el("div", { class: "k-xr-tiles" }, [
          el("div", { class: "k-xr-tile" }, [el("b", { class: "k-mono", text: Math.floor(secs / 60) + ":" + ("0" + (secs % 60)).slice(-2) }), U().muted("time")]),
          el("div", { class: "k-xr-tile" }, [el("b", { class: "k-mono", text: (rated.length - missed.length) + "/" + rated.length }), U().muted("right")]),
          el("div", { class: "k-xr-tile" }, [el("b", { class: "k-mono", text: String(missed.length) }), U().muted("missed")])]),
        missed.length ? el("ul", { class: "k-xr-ul" }, missed.map(function (c) { return html("li", "", inline(c.q || c.front || "")); })) : null,
        el("div", { class: "k-ex-inline" }, [btn("Again", "primary sm", function () { KOS.rerender(); }), btn("Back to Revise", "sm", function () { KOS.show("exams", { id: a.id, tab: "revise" }); })])].filter(Boolean)));
      announce("Card drill " + (secs < 300 ? "under 5 minutes" : "timed out") + ", done. " + (rated.length - missed.length) + " of " + rated.length + ".");
    }
    if (!cards.length) { holder.appendChild(el("p", { class: "k-ex-muted", text: "No cards in this scope yet." })); ring.remove(); return; }
    KOS.flashcards.session(holder, cards, { type: "due-review", runKey: "drill:" + a.id, showTopic: true, onFinish: finish });
    paint();
    timer = setInterval(function () { if (!ring.isConnected) { clearInterval(timer); return; } paint(); }, 1000);
  }

  /* ---------------- print ---------------- */
  function printChapter(a, art) {
    var G = KOS.examGuide;
    if (!G) { window.print(); return; }
    var root = G.printRoot(false);
    var copy = art.cloneNode(true);
    copy.querySelectorAll("button, .k-xr-prevnext, .k-xr-chips").forEach(function (n) { n.remove(); });
    root.appendChild(el("h1", { text: a.title }));
    root.appendChild(copy);
    G.printNow(root);
  }
  function printGuide(a) {
    var G = KOS.examGuide;
    if (!G) { window.print(); return; }
    var root = G.printRoot(false), chs = S().chapters(a), g = guideOf(a);
    root.appendChild(el("h1", { text: a.title + " · revision guide" }));
    chs.forEach(function (c) {
      if (c.kind === "lose") return;
      var art = el("article", { class: "k-xr-chapter" });
      var B = { essentials: essentialsCh, topic: topicCh, cheat: cheatCh, night: nightCh }[c.kind];
      B(art, a, c, chs, g, function (t2) { return el("h3", { text: t2 }); });
      art.querySelectorAll("button, .k-xr-chips").forEach(function (n) { n.remove(); });
      art.querySelectorAll("[id]").forEach(function (n) { n.removeAttribute("id"); });
      root.appendChild(art);
    });
    G.printNow(root);
  }

  KOS.examRevise = { page: page, headActions: headActions, drillCards: drillCards };
})();
