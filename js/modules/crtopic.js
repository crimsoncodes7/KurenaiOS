/* Kurenai OS — modules/crtopic.js (KOS.crTopic)
   A Creatives lesson on the shared topic page (design 31c–31d, built like Japanese's 28e). hub.js's
   KOS.views.ref stays the one topic page; for a Creatives lesson it asks this module what differs,
   through begin(ref):
     decoratePath   "Creatives / Writing / Unit 1 The sentence and the paragraph"
     tabs           Notes · Micro-studies · Theory cards · Project (no Quiz or Exam: nothing here is
                    examined); Theory cards are the shared flashcards engine, retitled
     render         Notes (one page at a time, read after a dwell), Micro-studies (31d), Project
     status / inspectorBody   four checks from evidence (invariant 154), the studies, the cards
     spine          the tracks, each released unit under its track's emblem
   Reading evidence is written through KOS.creatives.markPage; nothing else here writes.        */
(function () {
  "use strict";
  var el = KOS.ui.el;
  var SID = "creatives";
  var DWELL = 2500, LEAVE = 1500;
  function CR() { return KOS.creatives; }
  function announce(m) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(m); }
  function evidenceChanged(ref) { document.dispatchEvent(new window.CustomEvent("kos:cr-evidence", { detail: { ref: ref } })); }

  /* ================= the spine ================= */
  function spine() {
    var T = CR().tracks();
    return {
      tracks: false,
      stageHead: function (stage) {
        var t = T[stage] || {};
        return el("div", { class: "k-spine-stage k-cr-spine-stage", "data-ui": "cr.spine-stage" }, [
          el("span", { class: "k-cr-emblem", lang: "ja", "aria-hidden": "true", text: t.k || "" }), t.name || ""
        ]);
      }
    };
  }

  /* ================= shared pieces ================= */
  /* startStudy(lesson, study): open where the study is made; the Writing Desk starts a draft with
     the study's setup already written (the 80% given) */
  function startStudy(lid, sid) {
    var s = CR().study(lid, sid); if (!s) return;
    if (s.tool === "desk" && KOS.crWrite) { KOS.crWrite.openStudy(lid, sid); return; }
    if (s.tool && s.tool.indexOf("drill:") === 0) { KOS.show("creatives", { page: "drills", id: s.tool.slice(6) + "@" + lid + "." + sid }); return; }
    KOS.show("creatives", { page: "add", id: lid + "." + sid });
  }
  function studyCard(L, s, o) {
    o = o || {};
    var works = CR().studyWorks(L.id, s.id), passed = CR().studyPassed(L.id, s.id), last = works[0];
    var state = passed ? "passed" : works.length ? "saved" : null;
    return el("article", { class: "k-cr-study", "data-ui": "cr.study", "data-state": state || (o.next ? "next" : null) }, [
      el("div", { class: "k-cr-study-top" }, [
        el("span", { class: "k-mono k-cr-study-id", text: L.id + "·" + s.id }),
        el("h3", { class: "k-cr-study-t", text: s.t }),
        el("span", { class: "k-cr-study-min k-mono", text: "≈ " + s.min + " min" })
      ]),
      el("dl", { class: "k-cr-study-dl" }, [
        el("div", {}, [el("dt", { text: "Given" }), el("dd", { text: s.give })]),
        el("div", {}, [el("dt", { text: "Your one variable" }), el("dd", { text: s.vary })])
      ]),
      el("div", { class: "k-cr-study-foot" }, [
        state ? el("span", { class: "k-cr-done", "data-tone": passed ? "done" : "now" }, [passed ? "✓ Check passed" : "✓ Saved · check to do"]) : null,
        el("span", { class: "k-cr-grow" }),
        last && !passed ? el("button", { type: "button", class: "k-btn", "data-ui": "cr.check-open", text: "Do the check", onclick: function () { KOS.show("creatives", { page: "check", id: last.id }); } }) : null,
        last ? el("button", { type: "button", class: "k-btn", "data-ui": "cr.log-open", text: "Open in Practice Log", onclick: function () { KOS.show("creatives", { page: "log", id: last.id }); } }) : null,
        el("button", { type: "button", class: !works.length && o.next ? "k-btn k-btn--primary" : "k-btn", "data-intent": !works.length && o.next ? "primary" : null, "data-ui": "cr.study-start",
          text: works.length ? "Another rep" : "▶ Start", onclick: function () { startStudy(L.id, s.id); } })
      ].filter(Boolean))
    ]);
  }
  KOS.crStudyCard = studyCard;
  KOS.crStartStudy = startStudy;

  /* ================= the topic page ================= */
  function begin(ref) {
    var L = CR().lesson(ref), pages = CR().pagesOf(ref), u = L ? CR().unit(L.unit) : null, T = u ? CR().track(u.track) : null;
    var ui = CR().ui(), ctx = {};
    ctx.decoratePath = function (pathLine) {
      pathLine.innerHTML = "";
      ["Creatives", T ? T.name : "", u ? "Unit " + u.n + " " + u.name : ""].filter(Boolean).forEach(function (bit, i) {
        if (i) pathLine.appendChild(el("span", { class: "k-topic-sep", "aria-hidden": "true", text: "/" }));
        pathLine.appendChild(document.createTextNode(bit));
      });
    };
    ctx.modeSwitch = function () { return null; };
    /* no quiz or exam here, so the generic Ask Kurenai strip (quiz, test me) stays off; the
       critique is asked for on a study (invariant 155) */
    ctx.assistStrip = false;
    ctx.tabs = function () {
      var nc = CR().cardKeys(ref).length;
      return [
        ["notes", "Notes", true, pages.length > 1 ? pages.length : null],
        ["studies", "Micro-studies", true, L && L.studies.length ? L.studies.length : null],
        ["cards", "Theory cards", true, nc || null],
        ["project", "Project", !!(u && u.project), null]
      ].filter(function (t) { return t[2]; });
    };
    ctx.firstTab = function () { return "notes"; };
    ctx.owns = function (tab, editing) { return tab === "studies" || tab === "project" || (tab === "notes" && !editing); };
    ctx.reference = function () { return false; };
    ctx.render = function (tab, panel, pagerSlot) {
      if (tab === "studies") return renderStudies(panel);
      if (tab === "project") return renderProject(panel);
      if (!pages.length) { panel.appendChild(KOS.ui.emptyState({ compact: true, body: "This lesson's notes arrive with its release." })); return; }
      return renderLearn(panel, pagerSlot);
    };

    /* ---- notes ---- */
    function block(b) {
      if (b.h) return el("h3", { class: "k-cr-h", text: b.h });
      if (b.p) return el("p", { class: "k-cr-p", text: b.p });
      if (b.list) return el("ul", { class: "k-cr-list" }, b.list.map(function (x) { return el("li", { text: x }); }));
      if (b.steps) return el("ol", { class: "k-cr-steps", "data-ui": "cr.steps" }, b.steps.map(function (x, i) {
        return el("li", {}, [el("span", { class: "k-cr-step-n k-mono", "aria-hidden": "true", text: String(i + 1) }), el("span", { text: x })]);
      }));
      if (b.callout) return el("aside", { class: "k-cr-callout", "data-ui": "cr.callout" }, [el("b", { text: b.callout.t }), el("p", { text: b.callout.body })]);
      if (b.pair) return el("figure", { class: "k-cr-pair", "data-ui": "cr.pair" }, [
        el("div", { class: "k-cr-pair-row", "data-state": "before" }, [el("span", { class: "k-kicker", text: "Before" }), el("p", { text: b.pair.before })]),
        el("div", { class: "k-cr-pair-row", "data-state": "after" }, [el("span", { class: "k-kicker", text: "After" }), el("p", { text: b.pair.after })]),
        b.pair.why ? el("figcaption", { class: "k-cr-pair-why", text: b.pair.why }) : null
      ].filter(Boolean));
      if (b.ex) return el("figure", { class: "k-cr-ex", "data-ui": "cr.example" }, [
        el("span", { class: "k-kicker", text: b.ex.label }), el("blockquote", { class: "k-cr-ex-text" }, b.ex.text.split("\n\n").map(function (p) { return el("p", { text: p }); })),
        b.ex.note ? el("figcaption", { class: "k-cr-ex-note", text: b.ex.note }) : null
      ].filter(Boolean));
      if (b.beginner) return el("figure", { class: "k-cr-beginner", "data-ui": "cr.beginner" }, [
        el("div", { class: "k-cr-beginner-h" }, [el("span", { class: "k-kicker", text: "Expected beginner output" }), el("span", { class: "k-chip", text: "A rough first pass, on purpose" })]),
        el("blockquote", { class: "k-cr-beginner-text" }, b.beginner.text.split("\n").map(function (p) { return el("p", { text: p }); })),
        el("figcaption", { class: "k-cr-beginner-note", text: b.beginner.note })
      ]);
      return el("span");
    }
    function nextLesson() {
      var ls = CR().lessons(u ? u.track : null), i = ls.indexOf(L), n = i >= 0 ? ls[i + 1] : null;
      if (!n) return el("span");
      return el("button", { type: "button", class: "k-note-step", "data-ui": "topic.page cr.next-lesson", "data-state": "next",
        onclick: function () { KOS.show("ref", { subject: SID, ref: n.id }); } }, [
        el("span", { class: "k-kicker", text: "Next lesson ›" }), el("span", { class: "k-note-step-t", text: n.id + " " + n.title })]);
    }
    function renderLearn(panel, pagerSlot) {
      var cur = Math.max(0, Math.min(pages.length - 1, (ui.page || {})[ref] || 0));
      var article = el("article", { class: "k-prose k-notes k-cr-notes", "data-ui": "topic.notes" });
      var stepPrev = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "topic.reader-step", "aria-label": "Previous note page", text: "‹", onclick: function () { show(cur - 1, true); } });
      var pageSelect = el("select", { class: "k-topic-page-select", "data-ui": "topic.reader-page-select", "aria-label": "Choose note page", onchange: function () { show(Number(pageSelect.value), true); } });
      pages.forEach(function (pg, i) { pageSelect.appendChild(el("option", { value: String(i), text: "Page " + (i + 1) + " of " + pages.length + " — " + pg.t })); });
      var stepNext = el("button", { type: "button", class: "k-iconbtn k-iconbtn--sm", "data-ui": "topic.reader-step", "aria-label": "Next note page", text: "›", onclick: function () { show(cur + 1, true); } });
      var dots = el("span", { class: "k-topic-dots", "aria-hidden": "true" }, pages.map(function () { return el("span"); }));
      var foot = el("nav", { class: "k-note-foot", "data-ui": "topic.note-foot", "aria-label": "Note pages" });
      if (pages.length > 1) pagerSlot.appendChild(el("div", { class: "k-topic-reader", "data-ui": "topic.pager" }, [el("span", { class: "k-kicker", text: "Note pages" }), stepPrev, pageSelect, stepNext, dots]));
      var dwell = null, shownAt = 0;
      function isRead(i) { var rec = CR().peek().lessons[ref]; return !!(rec && rec.pages && rec.pages[i]); }
      function markRead(i) { if (isRead(i)) return; CR().markPage(ref, i); paintDots(); evidenceChanged(ref); }
      function paintDots() { [].forEach.call(dots.children, function (dt, j) { KOS.ui.state(dt, "on", j === cur); KOS.ui.state(dt, "read", isRead(j)); }); }
      function show(i, moved) {
        if (moved && i > cur && shownAt && Date.now() - shownAt >= LEAVE) markRead(cur);
        cur = Math.max(0, Math.min(pages.length - 1, i));
        shownAt = Date.now();
        if (moved && (ui.page || {})[ref] !== cur) { ui.page = ui.page || {}; ui.page[ref] = cur; KOS.store.save(); announce("Page " + (cur + 1) + " of " + pages.length + ", " + pages[cur].t + "."); }
        pageSelect.value = String(cur);
        article.innerHTML = "";
        article.appendChild(el("h2", { class: "k-cr-page-t", text: pages[cur].t }));
        article.appendChild(el("div", { class: "k-cr-page" }, pages[cur].blocks.map(block)));
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

    /* ---- micro-studies, then the project (31d) ---- */
    function renderStudies(panel) {
      if (!L) return;
      var ns = CR().nextStudy(u.track), nextKey = ns && ns.lesson.id === L.id ? ns.study.id : null;
      panel.appendChild(el("div", { class: "k-cr-studies", "data-ui": "cr.studies" }, L.studies.map(function (s) { return studyCard(L, s, { next: s.id === nextKey }); })));
      if (u.project && u.project.after === L.id) panel.appendChild(projectTeaser());
    }
    function projectTeaser() {
      var ps = CR().projectState(u.id);
      return el("section", { class: "k-cr-projteaser", "data-ui": "cr.project-teaser", "data-state": ps.offered ? "offered" : "after" }, [
        el("span", { class: "k-kicker", text: "Unit " + u.n + " project" }),
        el("b", { text: u.project.t }),
        ps.offered ? null : el("p", { class: "k-muted", text: "After " + u.project.after + "'s studies" }),
        el("button", { type: "button", class: ps.offered ? "k-btn k-btn--primary" : "k-link", "data-ui": "cr.project-open",
          text: ps.offered ? "Open the project" : "Try it anyway", onclick: function () { KOS.show("creatives", { page: "project", id: u.id }); } })
      ].filter(Boolean));
    }
    function renderProject(panel) {
      if (!u || !u.project) return;
      panel.appendChild(KOS.crProject ? KOS.crProject(u.id) : projectTeaser());
    }

    /* ---- the inspector ---- */
    ctx.status = function () {
      var ev = CR().evidence(ref), n = ev.checks.filter(Boolean).length, pct = n * 25;
      var tone = pct < 20 ? "low" : pct <= 70 ? "mid" : "high";
      var rag = KOS.rag.picker(SID, ref);
      var sub = [ev.pages ? ev.read + " of " + ev.pages + " pages" : "no notes yet", ev.studies ? ev.saved + " of " + ev.studies + " studies" : "no studies",
        ev.studies ? ev.passed + " of " + ev.studies + " checks" : "after a study", ev.cards ? (ev.held ? ev.held + " held" : "rate one card") : "no cards yet"];
      function statusSel() {
        var H = KOS.hub, cur = (KOS.store.peekProgress(SID, ref) || {}).status || "none";
        var s = el("select", { class: "k-ts-select", "data-ui": "ui.status-select", id: "ts-status", "aria-label": "Topic status",
          onchange: function () { KOS.store.setStatus(SID, ref, s.value); if (H.renderTree) H.renderTree(SID, ref); } },
          H.STATUS.map(function (st) { return el("option", { value: st[0], text: H.STATUS_GLYPH[st[0]] + " " + st[1] }); }));
        s.value = cur; return s;
      }
      var node = el("section", { class: "k-ts k-cr-ts", "data-ui": "topic.status cr.status", "data-state": tone, "aria-label": "Topic status" }, [
        el("div", { class: "k-ts-head", "data-ui": "topic.status-head" }, [el("span", { class: "k-kicker", text: "Status" }), el("span", { class: "k-ts-checks", text: n + " of 4 checks" }), el("strong", { class: "k-ts-pct", text: pct + "%" })]),
        el("span", { class: "k-bar k-bar--6", role: "img", "aria-label": pct + "% from evidence", style: "--p: " + pct + "%" }, [el("i")]),
        el("div", { class: "k-ts-row" }, [
          el("div", { class: "k-ts-field" }, [el("label", { class: "sr-only", for: "ts-status", text: "Status" }), statusSel()]),
          el("div", { class: "k-ts-field" }, [el("span", { class: "sr-only", text: "Confidence" }), rag.node])
        ]),
        el("div", { class: "k-ts-checkgrid", "data-ui": "topic.checkgrid cr.checks" }, CR().CHECKS.map(function (label, i) {
          var cb = el("input", { type: "checkbox", class: "k-box", "aria-readonly": "true", tabindex: "-1", onclick: function (e) { e.preventDefault(); } });
          cb.checked = !!ev.checks[i];
          return el("label", { class: "k-ts-check k-cr-check", "data-ui": "topic.check", "data-state": ev.checks[i] ? "on" : null, title: "Ticks itself from evidence: " + sub[i] }, [cb,
            el("span", { class: "k-cr-check-t" }, [el("span", { text: label }), el("small", { text: sub[i] })])]);
        })),
        rag.auto
      ].filter(Boolean));
      function onEv(e) {
        if (!node.isConnected) { document.removeEventListener("kos:cr-evidence", onEv); return; }
        if (e.detail && e.detail.ref !== ref) return;
        document.removeEventListener("kos:cr-evidence", onEv);
        node.parentNode.replaceChild(ctx.status(), node);
      }
      document.addEventListener("kos:cr-evidence", onEv);
      return node;
    };
    ctx.inspectorBody = function (outer) {
      if (!L) return;
      outer.appendChild(el("section", { class: "k-insp-sec", "aria-label": "The one skill" }, [
        el("h2", { class: "k-kicker", text: "The one skill" }),
        el("p", { class: "k-cr-insp-skill", text: L.check.skill })
      ]));
    };
    ctx.onThisPage = function () {};
    return ctx;
  }

  KOS.crTopic = { begin: begin, spine: spine };
})();
