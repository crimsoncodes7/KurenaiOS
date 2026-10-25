/* Kurenai OS — modules/inktab.js
   A topic's Handwritten tab (roadmap 6.2, design turn 30: 30c the empty
   tab, 30d a notebook of A4 pages and "All pages"). The tab is always
   present (invariant 89) and the empty tab IS the page: there is no
   "create a notebook" step, the first pen stroke makes page 1, and the tab
   writes nothing until the pen does. Its doc key is "topic:<sid>:<ref>".

   Pages are fixed A4 sheets scrolled like a document (decision C). Only
   the pages near the view are drawn; the rest are outlines with their
   number (30s). "Pages written" is a count, printed only when there is
   one (invariant 77), and moves no status, RAG, XP, gold or HP.        */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var I = KOS.ink;
  function el() { return KOS.ui.el.apply(null, arguments); }
  function announce(t) { if (KOS.a11y && KOS.a11y.announce) KOS.a11y.announce(t); }
  function paperName(id) { return (I.PAPERS.filter(function (p) { return p[0] === id; })[0] || I.PAPERS[1])[1]; }
  function when(ts) {
    if (!ts) return "";
    var d = new Date(ts), today = new Date();
    var hm = String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    if (d.toDateString() === today.toDateString()) return "today " + hm;
    return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }) + " · " + hm;
  }

  /* the page as a sheet: its paper, its canvases (only near the view), and
     the quiet gap that names it */
  function sheet(page, n) {
    var paper = el("div", { class: "k-ink-page", "data-ui": "ink.page", "data-paper": page.paper || "lined", "data-page": page.id,
      role: "img", "aria-label": "Page " + n });
    var wrap = el("div", { class: "k-ink-sheet", "data-ui": "ink.sheet" }, [
      n > 1 ? el("div", { class: "k-ink-gap", "aria-hidden": "true", text: String(n) }) : null,
      paper
    ].filter(Boolean));
    return { wrap: wrap, paper: paper, page: page, surface: null };
  }

  function mount(panel, sid, ref, opts) {
    opts = opts || {};
    var key = I.topicDoc(sid, ref);
    var ui = KOS.store.state.ui;
    var view = ui.inkView === "all" ? "all" : "page";
    var root = el("div", { class: "k-ink-tab", "data-ui": "ink.tab" });
    panel.appendChild(root);
    var dk = KOS.inkUI.desk();
    var sheets = [], io = null, unkey = null, destroyed = false;

    function written() { return I.written(key); }
    function docPaper() { var d = I.doc(key); return (d && d.paper) || ui.inkPaper || "lined"; }

    /* ---------- the view switch (Page · All pages), in the tab row ---------- */
    function paintMode() {
      if (!opts.modeSlot) return;
      opts.modeSlot.innerHTML = "";
      if (!written()) return;
      opts.modeSlot.appendChild(KOS.ui.tabs([
        { label: "Page", active: view === "page", hook: "ink.view-page", onSelect: function () { setView("page"); } },
        { label: "All pages", active: view === "all", hook: "ink.view-all", onSelect: function () { setView("all"); } }
      ], { variant: "workspace", label: "Handwritten view", className: "k-ink-mode" }));
    }
    function setView(v, focusPage) {
      if (view === v) return;
      view = v;
      ui.inkView = v;
      KOS.store.save();
      paint(focusPage);
    }

    /* ---------- Page: the toolbar, the band and the sheets ---------- */
    function band(blank) {
      var touch = (navigator.maxTouchPoints || 0) > 1;
      var penLine = null;
      if (touch && !dk.prefs.penSeen) {
        var sw = el("input", { type: "checkbox", role: "switch", class: "k-switch", "data-ui": "ink.finger", "aria-label": "Draw with a finger" });
        sw.checked = dk.prefs.finger;
        sw.addEventListener("change", function () { dk.setFinger(sw.checked); });
        penLine = el("label", { class: "k-ink-band-pen", "data-ui": "ink.no-pen" }, [
          el("span", { text: "No pen yet. Write with yours, or draw with a finger" }), sw]);
      }
      return el("section", { class: "k-card k-ink-band", "data-ui": "ink.band", "aria-label": "Nothing written yet" }, [
        el("span", { class: "k-ink-band-mark", lang: "ja", "aria-hidden": "true", text: "書" }),
        el("div", { class: "k-ink-band-body" }, [
          el("h2", { class: "k-ink-band-title", text: "Nothing written for this topic yet" }),
          el("p", { class: "k-ink-band-p", text: "Write anywhere on the page below with your pen. Pages belong to " + ref + " and stay on this device." }),
          KOS.inkUI.papersPicker(blank.paper, function (p) {
            blank.paper = p; ui.inkPaper = p; KOS.store.save();
            I.setDocPaper(key, p);
            paint();
          }),
          penLine
        ].filter(Boolean))
      ]);
    }
    function nearEnd(s) {
      var last = sheets[sheets.length - 1];
      if (!last || last.page.id !== s.page.id || adding) return;
      addPage(false);
    }
    var adding = false;
    function addPage(scroll) {
      adding = true;
      I.addPage(key, { paper: docPaper() }, function (err, page) {
        adding = false;
        if (err || destroyed) return;
        if (view !== "page") { paint(); return; }
        var sh = sheet(page, sheets.length + 1);
        sheets.push(sh);
        list.appendChild(sh.wrap);
        observe(sh);
        if (scroll && sh.wrap.scrollIntoView) sh.wrap.scrollIntoView({ block: "start", behavior: "smooth" });
        announce("Page " + sheets.length + " added.");
        updatePill();
      });
    }
    var list = null, pill = null, pillT = null;
    function mountSurface(sh) {
      if (sh.surface) return;
      var load = function (page) {
        if (destroyed || sh.surface || !sh.paper.isConnected) return;
        sh.page = page;
        sh.surface = KOS.inkUI.surface(sh.paper, page, dk, { nearEnd: nearEnd, onEdit: function () { dk.changed(); } });
      };
      if (sh.page.created) I.getPage(sh.page.id, function (err, p) { load(p || sh.page); });
      else load(sh.page);
    }
    function unmountSurface(sh) {
      if (!sh.surface) return;
      sh.surface.destroy();
      sh.surface = null;
    }
    function observe(sh) {
      /* the first pages draw at once; the observer keeps the rest lazy */
      if (!io || sheets.indexOf(sh) < 2) mountSurface(sh);
      if (io) io.observe(sh.paper);
    }
    function updatePill() {
      if (!pill) return;
      var n = sheets.length;
      if (n < 2) { pill.hidden = true; return; }
      var at = 0, best = -Infinity;
      sheets.forEach(function (sh, i) {
        var r = sh.paper.getBoundingClientRect(), vis = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
        if (vis > best) { best = vis; at = i; }
      });
      var txt = (at + 1) + " / " + n;
      if (pill.textContent !== txt) {
        pill.textContent = txt;
        clearTimeout(announceT);
        announceT = setTimeout(function () { announce("Page " + (at + 1) + " of " + n + "."); }, 700);
      }
      pill.hidden = false;
      KOS.ui.state(pill, "shown", true);
      clearTimeout(pillT);
      pillT = setTimeout(function () { KOS.ui.state(pill, "shown", false); }, 1500);
    }
    var announceT = null;
    function onScroll() { if (view === "page") updatePill(); }

    function paintPage(focusPage) {
      var w = written();
      var bar = KOS.inkUI.toolbar(dk, {
        paper: {
          get: function () { var s = dk.active || (sheets[0] && sheets[0].surface); return (s && s.page.paper) || docPaper(); },
          set: function (p) {
            var s = dk.active || (sheets[0] && sheets[0].surface);
            ui.inkPaper = p; KOS.store.save();
            I.setDocPaper(key, p);
            if (s) { s.page.paper = p; s.host.setAttribute("data-paper", p); if (s.page.created || s.page.items.length) I.savePage(s.page); }
            announce(paperName(p) + " paper.");
          }
        },
        onImage: function (src, iw, ih) {
          var s = dk.active || (sheets[0] && sheets[0].surface);
          if (!s) return;
          var wdt = Math.min(600, iw), hgt = wdt * ih / Math.max(1, iw);
          var y = Math.min(I.H - hgt - 40, Math.max(60, s.lastInkBottom() + 30));
          s.addItems([{ id: I.uid(), k: "img", x: 80, y: y, w: wdt, h: hgt, src: src }]);
        }
      });
      root.appendChild(KOS.ui.scroller(bar, { keepRole: true, className: "k-ink-barwrap", prevLabel: "Earlier tools", nextLabel: "More tools" }));
      list = el("div", { class: "k-ink-pages", "data-ui": "ink.pages" });
      pill = el("div", { class: "k-ink-pill", "data-ui": "ink.page-pill", "aria-hidden": "true", hidden: true });
      if (!w) {
        var blank = I.blankPage(key, ui.inkPaper);
        root.appendChild(band(blank));
        var sh = sheet(blank, 1);
        sh.paper.appendChild(el("div", { class: "k-ink-start", "aria-hidden": "true" }, [
          KOS.inkUI.glyph("pen"), el("span", { class: "k-ink-start-t", text: "Start writing" }), el("span", { class: "k-ink-start-s", text: "Page 1 is made by your first stroke" })]));
        sheets = [sh];
        list.appendChild(sh.wrap);
        root.appendChild(list);
        mountSurface(sh);
        /* the first stroke folds the band away and gives the tab its count */
        dk.onChange(function () {
          if (written() || !sh.page.items.length) return;
          var startNote = sh.paper.querySelector(".k-ink-start");
          if (startNote) startNote.remove();
        });
        return;
      }
      root.appendChild(list);
      root.appendChild(pill);
      I.listPages(key, function (err, pages) {
        if (destroyed || err) return;
        if (!pages.length) pages = [I.blankPage(key)];
        sheets = pages.map(function (p, i) { return sheet(p, i + 1); });
        sheets.forEach(function (s) { list.appendChild(s.wrap); observe(s); });
        if (focusPage != null && sheets[focusPage] && sheets[focusPage].wrap.scrollIntoView) sheets[focusPage].wrap.scrollIntoView({ block: "start" });
      });
    }

    /* ---------- All pages (30d) ---------- */
    function paintAll() {
      var d = I.doc(key), w = written();
      var head = el("div", { class: "k-ink-all-head" }, [
        el("h2", { class: "k-ink-all-title" }, [el("span", { text: "Notebook · " }), el("span", { class: "k-mono", text: ref })]),
        el("span", { class: "k-ink-all-meta", text: (d ? d.pages.length : 0) + (d && d.pages.length === 1 ? " page" : " pages") + " · A4 · " + paperName(docPaper()).toLowerCase() }),
        el("button", { type: "button", class: "k-btn k-btn--primary k-btn--sm k-spacer", "data-ui": "ink.add-page", text: "＋ Page",
          onclick: function () { I.addPage(key, { paper: docPaper() }, function () { paint(); announce("Page added."); }); } })
      ]);
      root.appendChild(head);
      var grid = el("ol", { class: "k-ink-grid", "data-ui": "ink.overview", "aria-label": "Pages" });
      root.appendChild(grid);
      I.listPages(key, function (err, pages) {
        if (destroyed || err) return;
        pages.forEach(function (p, i) {
          var c = el("canvas", { class: "k-ink-thumb-ink", "aria-hidden": "true" });
          var thumb = el("button", { type: "button", class: "k-ink-thumb", "data-paper": p.paper || "lined", "data-ui": "ink.thumb",
            "aria-label": "Open page " + (i + 1), onclick: function () { setView("page", i); } }, [c]);
          var menu = KOS.ui.menu({ label: "⋯", className: "k-btn--quiet k-btn--sm k-ink-thumb-menu", hint: "Page " + (i + 1),
            items: [
              { label: "Duplicate", onSelect: function () { I.duplicatePage(key, p.id, function () { paint(); announce("Page " + (i + 1) + " duplicated."); }); } },
              { label: "Delete", className: "k-menu-item--danger", onSelect: function () {
                KOS.ui.confirm({ danger: true, title: "Delete page " + (i + 1) + "?", body: "Its ink is removed from this device. This cannot be undone." },
                  function () { I.deletePage(key, p.id, function () { paint(); announce("Page " + (i + 1) + " deleted."); }); });
              } }
            ] });
          menu.setAttribute("aria-label", "More for page " + (i + 1));
          var row = el("li", { class: "k-ink-tile", "data-rid": p.id, "data-ui": "ink.tile" }, [
            thumb,
            el("div", { class: "k-ink-tile-foot" }, [
              el("button", { type: "button", class: "k-ink-handle", "data-reorder": "", "aria-label": "Move page " + (i + 1), text: "⠿" }),
              el("div", { class: "k-ink-tile-t" }, [el("strong", { text: "Page " + (i + 1) }), el("span", { text: when(p.at || p.created) })]),
              menu
            ])
          ]);
          grid.appendChild(row);
          drawThumb(c, thumb, p);
        });
        grid.appendChild(el("li", { class: "k-ink-tile k-ink-tile--new" }, [
          el("button", { type: "button", class: "k-ink-newpage", "data-ui": "ink.new-tile",
            onclick: function () { I.addPage(key, { paper: docPaper() }, function () { paint(); announce("Page added."); }); } }, [
            el("span", { class: "k-ink-plus", "aria-hidden": "true", text: "＋" }), el("span", { text: "New page" }), el("span", { class: "k-muted", text: paperName(docPaper()) })])
        ]));
        KOS.ui.reorder(grid, { rows: "[data-rid]", label: function (r) { return "Page " + (pages.map(function (p) { return p.id; }).indexOf(r.getAttribute("data-rid")) + 1); },
          onDrop: function (row) {
            var from = pages.map(function (p) { return p.id; }).indexOf(row.getAttribute("data-rid"));
            var to = [].indexOf.call(grid.querySelectorAll("[data-rid]"), row);
            I.movePage(key, from, to, function () { paint(); announce("Page " + (from + 1) + " moved to position " + (to + 1) + "."); });
          } });
      });
      root.appendChild(el("p", { class: "k-ink-hint", text: "Drag ⠿ to reorder, or focus it and use Space and the arrows. ⋯ duplicates or deletes a page." }));
      void w;
    }
    function drawThumb(c, box, page) {
      var paint1 = function () {
        var wd = box.clientWidth || 160, dpr = Math.min(2, window.devicePixelRatio || 1);
        c.width = Math.round(wd * dpr); c.height = Math.round(wd * I.H / I.W * dpr);
        var ctx = c.getContext ? c.getContext("2d") : null;
        if (!ctx) return;
        var k = wd / I.W * dpr;
        ctx.setTransform(k, 0, 0, k, 0, 0);
        ctx.__inkScale = k / dpr;
        KOS.inkUI.drawItems(ctx, page.items || [], KOS.inkUI.palette(box), paint1);
      };
      (window.requestAnimationFrame || setTimeout)(paint1);
    }

    function paint(focusPage) {
      sheets.forEach(unmountSurface);
      sheets = [];
      if (io) io.disconnect();
      root.innerHTML = "";
      KOS.ui.state(root, "all", view === "all");
      paintMode();
      if (view === "all" && written()) paintAll();
      else paintPage(focusPage);
    }

    /* surfaces only near the view (30s: 200 pages scroll like 3) */
    if (typeof window.IntersectionObserver === "function") {
      io = new window.IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var sh = sheets.filter(function (s) { return s.paper === en.target; })[0];
          if (!sh) return;
          if (en.isIntersecting) mountSurface(sh); else unmountSurface(sh);
        });
      }, { rootMargin: "1200px 0px" });
    }
    function onInk(e) {
      if (!root.isConnected) { window.removeEventListener("kos-ink", onInk); return; }
      var doc = e.detail && e.detail.doc;
      if (doc && doc !== key) return;
      if (!doc) { paint(); return; }
      /* the first page with ink: the band folds away and the view switch
         comes, without redrawing the page under the pen */
      var b = root.querySelector("[data-ui~='ink.band']");
      if (written() && b) { b.remove(); if (pill && !pill.isConnected) root.appendChild(pill); }
      paintMode();
    }
    window.addEventListener("kos-ink", onInk);
    window.addEventListener("scroll", onScroll, true);
    unkey = KOS.inkUI.shortcuts(dk, root);
    I.ready(function () { if (!destroyed) paint(); });

    return {
      destroy: function () {
        destroyed = true;
        sheets.forEach(unmountSurface);
        if (io) io.disconnect();
        if (unkey) unkey();
        window.removeEventListener("kos-ink", onInk);
        window.removeEventListener("scroll", onScroll, true);
        dk.destroy();
        if (opts.modeSlot) opts.modeSlot.innerHTML = "";
      },
      desk: dk
    };
  }

  KOS.inkTab = { mount: mount };
})();
