/* Kurenai OS — modules/inktab.js
   A topic's Handwritten tab (roadmap 6.2, design turn 30: 30c the empty
   tab, 30d a notebook of A4 pages and "All pages"). The tab is always
   present (invariant 89) and the empty tab IS the page: there is no
   "create a notebook" step, the first pen stroke makes page 1, and the tab
   writes nothing until the pen does. Its doc key is "topic:<sid>:<ref>".

   Side by side (30e) is a third view, offered in landscape (above 1080):
   the topic's notes on the left, exactly as the Notes tab renders them
   and read-only, the notebook on the right, each scrolling on its own.
   A tap on a figure, a formula, a table, a worked step or a callout offers
   "Clip to page": the block is copied as a PICTURE onto the page in view
   (an image item), never as text into the curriculum (invariant 86).

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

  /* side by side needs the width of a landscape iPad or a desktop */
  var SIDE_Q = "(min-width: 1081px)";
  function sideOK() { return !!(window.matchMedia && window.matchMedia(SIDE_Q).matches); }

  /* the blocks a tap can clip, and what each is called in the announcement */
  var CLIPS = [[".k-n-fig", "figure"], [".k-n-diagram", "diagram"], [".k-n-math", "formula"], [".k-n-kv", "table"],
    [".k-n-tablewrap", "table"], [".k-n-worked", "worked example"], [".k-n-step", "worked step"], [".k-callout", "callout"], [".k-n-code", "code"]];
  var CLIP_SEL = CLIPS.map(function (c) { return c[0]; }).join(", ");
  function clipName(node) {
    var c = CLIPS.filter(function (x) { return node.matches(x[0]); })[0];
    var cap = node.querySelector("figcaption, .k-n-worked-title, .k-callout-head, .k-n-code-cap");
    var t = cap ? cap.textContent.replace(/\s+/g, " ").replace(/^[^0-9A-Za-z(]+/, "").trim() : "";
    return t ? t.slice(0, 60) : "the " + (c ? c[1] : "block");
  }
  /* the styles a picture of a block needs: an image is its own document,
     so the theme's variables and classes do not reach it */
  var PROPS = ["display", "box-sizing", "width", "flex-direction", "flex-wrap", "align-items", "justify-content", "gap",
    "grid-template-columns", "grid-column", "padding-top", "padding-right", "padding-bottom", "padding-left",
    "margin-top", "margin-right", "margin-bottom", "margin-left", "border-top", "border-right", "border-bottom", "border-left",
    "border-radius", "background-color", "background-image", "color", "font-family", "font-size", "font-weight", "font-style",
    "line-height", "letter-spacing", "text-align", "text-transform", "white-space", "list-style-type", "vertical-align",
    "border-collapse", "border-spacing", "opacity", "fill", "stroke", "stroke-width", "stroke-dasharray", "stroke-linecap",
    "stroke-linejoin", "fill-opacity", "stroke-opacity", "text-anchor", "dominant-baseline", "font-variant-numeric"];
  function picture(node, cb) {
    var r = node.getBoundingClientRect(), w = Math.ceil(r.width), h = Math.ceil(r.height);
    var clone = node.cloneNode(true);
    var from = [node].concat([].slice.call(node.querySelectorAll("*"))), to = [clone].concat([].slice.call(clone.querySelectorAll("*")));
    from.forEach(function (n, i) {
      var cs = getComputedStyle(n), st = "";
      PROPS.forEach(function (pr) { var v = cs.getPropertyValue(pr); if (v) st += pr + ":" + v + ";"; });
      if (cs.display === "none") st = "display:none;";
      /* the picture's own root: no outer margin, the width it had */
      if (!i) st += "margin:0;width:" + w + "px;";
      to[i].setAttribute("style", st);
      to[i].removeAttribute("class");
    });
    [].forEach.call(clone.querySelectorAll("button, .k-n-copy, [data-ui~='ink.clip-chips']"), function (b) { b.remove(); });
    var xml = new XMLSerializer().serializeToString(clone);
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '"><foreignObject x="0" y="0" width="100%" height="100%">' +
      '<div xmlns="http://www.w3.org/1999/xhtml">' + xml + "</div></foreignObject></svg>";
    var src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
    /* a PNG where the browser allows reading the picture back; Safari
       taints a canvas that drew a foreignObject, so there it stays SVG */
    var im = new Image();
    im.onload = function () {
      try {
        var k = Math.min(2, 1400 / Math.max(w, h)), c = document.createElement("canvas");
        c.width = Math.round(w * k); c.height = Math.round(h * k);
        var x = c.getContext("2d");
        x.drawImage(im, 0, 0, c.width, c.height);
        cb(c.toDataURL("image/png"), w, h);
      } catch (e) { cb(src, w, h); }
    };
    im.onerror = function () { cb(null); };
    im.src = src;
  }

  function mount(panel, sid, ref, opts) {
    opts = opts || {};
    var key = I.topicDoc(sid, ref);
    var ui = KOS.store.state.ui;
    var view = ui.inkView === "all" || ui.inkView === "side" ? ui.inkView : "page";
    var sideOn = false;
    var root = el("div", { class: "k-ink-tab", "data-ui": "ink.tab" });
    panel.appendChild(root);
    /* a picture (pasted, dropped, picked or clipped) lands under the last
       ink of the page in use, or on the next page when it does not fit */
    var dk = KOS.inkUI.desk({ placeImage: function (sf, src, iw, ih, extra) { placeOn(sf, src, iw, ih, extra, "the picture"); return true; } });
    var sheets = [], io = null, unkey = null, destroyed = false;

    function written() { return I.written(key); }
    function related() {
      var pre = [":" + sid + ":" + ref + ":"];
      return I.allDocs().filter(function (d) {
        var it = String(d.item || "");
        return /^(work|exam|card):/.test(it) && it.indexOf(pre[0]) === it.indexOf(":") && (d.pages || []).some(function (id) { return (d.inked || {})[id]; });
      }).sort(function (a, b) { return (b.at || 0) - (a.at || 0); });
    }
    function docPaper() { var d = I.doc(key); return (d && d.paper) || ui.inkPaper || "lined"; }

    /* ---------- the view switch (Page · All pages) and the tab's menus,
       on their own line under the tab row ---------- */
    function paintMode() {
      if (!opts.modeSlot) return;
      opts.modeSlot.innerHTML = "";
      var shown = shownView(), w = written();
      if (w || sideOK()) opts.modeSlot.appendChild(KOS.ui.tabs([
        { label: "Page", active: shown === "page", hook: "ink.view-page", onSelect: function () { setView("page"); } },
        sideOK() ? { label: "Side by side", active: shown === "side", hook: "ink.view-side", onSelect: function () { setView("side"); } } : null,
        w ? { label: "All pages", active: shown === "all", hook: "ink.view-all", onSelect: function () { setView("all"); } } : null
      ].filter(Boolean), { variant: "workspace", label: "Handwritten view", className: "k-ink-mode" }));
      var side = el("div", { class: "k-topic-inkmenus" });
      if (w && KOS.inkSync) side.appendChild(KOS.inkSync.chip(key));
      /* this topic's working and answers, written beside its other tabs */
      var rel = related();
      if (rel.length) side.appendChild(KOS.ui.menu({ label: "Working and answers · " + rel.length, className: "k-btn--quiet k-btn--sm", align: "end",
        hint: "Written beside Flashcards, the Quiz and Exam questions", items: rel.slice(0, 20).map(function (d) {
          return { label: (d.title || "Working") + " · " + when(d.at), onSelect: function () { KOS.inkPad.viewDoc(d.key, (d.title || "Working") + " · " + when(d.at)); } };
        }) }));
      if (KOS.inkDrills) side.appendChild(KOS.ui.menu({ label: "Drills", className: "k-btn--quiet k-btn--sm", align: "end", hint: "Blurt, diagram drills and Write it out", items: KOS.inkDrills.menuItems(sid, ref, KOS.spec.node ? ((KOS.spec.node(sid + ":" + ref) || {}).title || ref) : ref) }));
      if (side.childNodes.length) opts.modeSlot.appendChild(side);
    }
    /* the view on screen: side by side folds to Page in portrait, and All
       pages to Page while nothing is written; the choice itself is kept */
    function shownView() {
      if (view === "side") return sideOK() ? "side" : "page";
      if (view === "all") return written() ? "all" : "page";
      return "page";
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

    function paintPage(focusPage, host) {
      host = host || root;
      var w = written();
      var barWrap = KOS.inkUI.dockable(dk, {
        paper: {
          get: function () { var s = dk.active || (sheets[0] && sheets[0].surface); return (s && s.page.paper) || docPaper(); },
          set: function (p) {
            var s = dk.active || (sheets[0] && sheets[0].surface);
            ui.inkPaper = p; KOS.store.save();
            I.setDocPaper(key, p);
            if (s) { s.page.paper = p; s.host.setAttribute("data-paper", p); if (s.page.created || s.page.items.length) I.savePage(s.page); }
            announce(paperName(p) + " paper.");
          }
        }
      });
      host.appendChild(barWrap);
      list = el("div", { class: "k-ink-pages", "data-ui": "ink.pages" });
      dk.dropOn(list);
      pill = el("div", { class: "k-ink-pill", "data-ui": "ink.page-pill", "aria-hidden": "true", hidden: true });
      if (!w) {
        var blank = I.blankPage(key, ui.inkPaper);
        host.appendChild(band(blank));
        var sh = sheet(blank, 1);
        sh.paper.appendChild(el("div", { class: "k-ink-start", "aria-hidden": "true" }, [
          KOS.inkUI.glyph("pen"), el("span", { class: "k-ink-start-t", text: "Start writing" }), el("span", { class: "k-ink-start-s", text: "Page 1 is made by your first stroke" })]));
        sheets = [sh];
        list.appendChild(sh.wrap);
        host.appendChild(list);
        mountSurface(sh);
        /* the first stroke folds the band away and gives the tab its count */
        dk.onChange(function () {
          if (written() || !sh.page.items.length) return;
          var startNote = sh.paper.querySelector(".k-ink-start");
          if (startNote) startNote.remove();
        });
        return;
      }
      host.appendChild(list);
      host.appendChild(pill);
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
        el("button", { type: "button", class: "k-btn k-btn--sm k-spacer", "data-ui": "ink.export-pdf", text: "Export as PDF",
          onclick: function (e) {
            var b = e.currentTarget; b.disabled = true;
            KOS.inkExport.exportDoc(key, "Notebook " + ref).then(function () { b.disabled = false; announce("Notebook exported."); },
              function (err) { b.disabled = false; KOS.ui.toast("The PDF could not be made — " + err.message, true); });
          } }),
        el("button", { type: "button", class: "k-btn k-btn--primary k-btn--sm", "data-ui": "ink.add-page", text: "＋ Page",
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
              { label: "Export as PNG", onSelect: function () { KOS.inkExport.exportPNG(p, ref + " page " + (i + 1)).catch(function (err) { KOS.ui.toast("The picture could not be made — " + err.message, true); }); } },
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

    /* ---------- Side by side (30e) ---------- */
    var clipSel = null;
    function unclip() {
      if (!clipSel) return;
      KOS.ui.state(clipSel, "clip-sel", false);
      var chips = clipSel.querySelector("[data-ui~='ink.clip-chips']");
      if (chips) chips.remove();
      clipSel = null;
    }
    function targetSurface() {
      if (dk.active && dk.active.host.isConnected) return dk.active;
      /* the page most in view of the right pane */
      var best = null, most = -Infinity;
      sheets.forEach(function (sh) {
        if (!sh.surface) return;
        var r = sh.paper.getBoundingClientRect(), vis = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
        if (vis > most) { most = vis; best = sh.surface; }
      });
      return best;
    }
    function clip(block) {
      var name = clipName(block);
      unclip();
      picture(block, function (src, w, h) {
        var s = targetSurface();
        if (!src || !s || destroyed) { announce("That block could not be clipped."); return; }
        /* the picture lands at the size it had on screen, page units for pixels */
        var k = I.W / (s.host.clientWidth || I.W);
        placeOn(s, src, w * k, h * k, { clip: { sid: sid, ref: ref } }, name, true);
      });
    }
    /* a picture under the last ink of `s`, else on the next page (made
       when there is none); `exact` keeps its size, else it fits 600 wide */
    function placeOn(s, src, iw, ih, extra, name, exact) {
      var wdt = exact ? Math.min(I.W * 0.86, iw) : Math.min(600, iw), hgt = wdt * ih / Math.max(1, iw);
      if (hgt > I.H * 0.6) { hgt = I.H * 0.6; wdt = hgt * iw / Math.max(1, ih); }
      (function () {
        var place = function (sf) {
          var y = Math.max(60, sf.lastInkBottom() + 30);
          sf.addItems([Object.assign({ id: I.uid(), k: "img", x: 60, y: Math.round(y), w: Math.round(wdt), h: Math.round(hgt), src: src }, extra || {})]);
          dk.active = sf;
          var n = sheets.map(function (sh) { return sh.surface; }).indexOf(sf) + 1;
          announce((exact ? "Clipped " : "Added ") + name + " to page " + (n || 1) + ".");
        };
        if (s.lastInkBottom() + 30 + hgt <= I.H - 40) { place(s); return; }
        /* no room under the last ink: the next page, made if there is none */
        var at = sheets.map(function (sh) { return sh.surface; }).indexOf(s);
        var next = sheets[at + 1];
        var land = function (sh) {
          var tries = 0;
          (function wait() {
            if (destroyed) return;
            if (sh.surface) { if (sh.wrap.scrollIntoView) sh.wrap.scrollIntoView({ block: "nearest" }); place(sh.surface); return; }
            if (++tries > 40) { announce("That block could not be clipped."); return; }
            mountSurface(sh);
            setTimeout(wait, 50);
          })();
        };
        if (next) { land(next); return; }
        var count = sheets.length;
        addPage(false);
        (function waitPage(tries) {
          if (destroyed) return;
          if (sheets.length > count) { land(sheets[sheets.length - 1]); return; }
          if (tries < 40) setTimeout(function () { waitPage(tries + 1); }, 50);
        })(0);
      })();
    }
    function notesPane() {
      var c = KOS.content.get(sid, ref), blocks = (c && c.notes) || [];
      var pane = el("section", { class: "k-ink-side-notes", "data-ui": "ink.side-notes", "aria-label": "Notes", tabindex: "0" }, [
        el("div", { class: "k-ink-side-head" }, [el("span", { class: "k-kicker", text: "Notes" }), el("span", { class: "k-ink-side-hint", text: "tap a figure, formula or step to clip it" })])
      ]);
      if (!blocks.length) {
        pane.appendChild(KOS.ui.emptyState({ compact: true, mark: "註", title: "No notes for this topic", body: "The Spec tab has what the board asks for." }));
        return pane;
      }
      var art = el("article", { class: "k-prose k-notes", "data-ui": "ink.side-article", "data-topic": sid + ":" + ref });
      art.innerHTML = KOS.content.renderBlocks(blocks);
      if (KOS.ui.hookify) KOS.ui.hookify(art);
      pane.appendChild(art);
      KOS.content.typeset(art);
      art.addEventListener("click", function (e) {
        if (e.target.closest("[data-ui~='ink.clip-chips']")) return;
        if (e.target.closest("a, button, input, select, textarea, summary")) return;
        var b = e.target.closest(CLIP_SEL);
        if (!b || !art.contains(b)) { unclip(); return; }
        if (b === clipSel) { unclip(); return; }
        unclip();
        clipSel = b;
        KOS.ui.state(b, "clip-sel", true);
        b.appendChild(el("div", { class: "k-ink-clip-chips", "data-ui": "ink.clip-chips" }, [
          el("button", { type: "button", class: "k-btn k-btn--primary k-btn--sm", "data-ui": "ink.clip", onclick: function (ev) { ev.stopPropagation(); clip(b); } }, [
            KOS.inkUI.glyph("image"), el("span", { text: "Clip to page" })])
        ]));
      });
      return pane;
    }
    function paintSide(focusPage) {
      var grid = el("div", { class: "k-ink-side", "data-ui": "ink.side" });
      var right = el("section", { class: "k-ink-side-page", "data-ui": "ink.side-page", "aria-label": "Your pages" });
      grid.appendChild(notesPane());
      grid.appendChild(right);
      root.appendChild(grid);
      paintPage(focusPage, right);
    }
    function setSide(on) {
      if (on === sideOn) return;
      sideOn = on;
      if (opts.onSide) opts.onSide(on);
    }

    function paint(focusPage) {
      sheets.forEach(unmountSurface);
      sheets = [];
      if (io) io.disconnect();
      clipSel = null;
      root.innerHTML = "";
      var shown = shownView();
      KOS.ui.state(root, "all", shown === "all");
      KOS.ui.state(root, "side", shown === "side");
      setSide(shown === "side");
      paintMode();
      if (shown === "all") paintAll();
      else if (shown === "side") paintSide(focusPage);
      else paintPage(focusPage);
    }
    /* turning the iPad: side by side comes and goes with landscape */
    var sideMQ = window.matchMedia ? window.matchMedia(SIDE_Q) : null;
    function onTurn() { if (!destroyed && view === "side") paint(); else paintMode(); }
    if (sideMQ) { if (sideMQ.addEventListener) sideMQ.addEventListener("change", onTurn); else if (sideMQ.addListener) sideMQ.addListener(onTurn); }

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
        setSide(false);
        if (sideMQ) { if (sideMQ.removeEventListener) sideMQ.removeEventListener("change", onTurn); else if (sideMQ.removeListener) sideMQ.removeListener(onTurn); }
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
