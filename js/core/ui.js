/* Kurenai OS — core/ui.js */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "class") node.className = attrs[k];
        else if (k === "text") node.textContent = attrs[k];
        else if (k === "html") node.innerHTML = attrs[k];
        else if (k.slice(0, 2) === "on") node.addEventListener(k.slice(2), attrs[k]);
        else if (k === "style") node.style.cssText = attrs[k];
        else node.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  var toastTimer = null;
  function toast(msg, bad) {
    var t = document.getElementById("toast");
    t.textContent = msg;
    t.className = "toast show" + (bad ? " bad" : "");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.className = "toast"; }, 2600);
  }

  var savedTimer = null;
  function flashSaved() {
    var s = document.getElementById("save-dot");
    if (!s) return;
    s.classList.add("pulse");
    clearTimeout(savedTimer);
    savedTimer = setTimeout(function () { s.classList.remove("pulse"); }, 900);
  }

  /* the canonical HTML escaper — every hand-built HTML string goes through
     this one (content.js, hub.js and the labs alias it; do not redefine) */
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  /* the canonical trailing-edge debounce — search boxes, autosaving inputs */
  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, ms);
    };
  }

  KOS.ui = { el: el, toast: toast, flashSaved: flashSaved, esc: esc, debounce: debounce };

  // ---- view registry: each module registers render functions ----
  KOS.views = {};

  /* ---- navigation history: Back/Forward like a browser ---- */
  var navHist = [];   // pages behind the current one
  var navFwd = [];    // pages we've stepped Back from (cleared on a fresh nav)
  var navCur = null;  // the view currently on screen
  function navKey(v) { return v.viewId + "::" + JSON.stringify(v.arg === undefined ? null : v.arg); }
  function updateNavBtns() {
    var b = document.getElementById("nav-back");
    if (b) b.disabled = navHist.length === 0;
    var f = document.getElementById("nav-fwd");
    if (f) f.disabled = navFwd.length === 0;
  }
  KOS.canBack = function () { return navHist.length > 0; };
  KOS.canForward = function () { return navFwd.length > 0; };
  KOS.back = function () {
    if (!navHist.length) return;
    navFwd.push(navCur);
    var prev = navHist.pop();
    KOS.show(prev.viewId, prev.arg, { _nav: true });
  };
  KOS.forward = function () {
    if (!navFwd.length) return;
    navHist.push(navCur);
    var next = navFwd.pop();
    KOS.show(next.viewId, next.arg, { _nav: true });
  };

  /* ---- sections: five rail entries, each owning a family of views.
     The rail carries the section; the subnav (in-page, above #main)
     carries the views inside it. ---- */
  var SECTION_OF = {
    home: "home",
    subject: "study", ref: "study", due: "study", cardstats: "study",
    tracker: "study", focus: "study", calendar: "study", personaldeck: "study",
    worked: "study", trace: "study", oop: "study", sims: "study",
    matrix: "collection", anime: "collection", books: "collection",
    vn: "collection", game: "collection", seasonal: "collection",
    mangaka: "collection", wishlist: "collection", shrine: "collection",
    aniprofile: "collection", vndbprofile: "collection", mediasync: "collection",
    governor: "governor",
    data: "system", help: "system"
  };
  /* subnav entries per section: [label, viewId, arg, pcId] — null = divider */
  var SUBNAV = {
    study: [
      ["Computer Science", "subject", "compsci", "pc-compsci"],
      ["Mathematics", "subject", "maths", "pc-maths"],
      ["IT · Data Analytics", "subject", "it", "pc-it"],
      null,
      ["Due Today", "due"],
      ["Focus Timer", "focus"],
      ["Calendar", "calendar"],
      ["Exams & Papers", "tracker"],
      ["Card Stats", "cardstats"]
    ],
    collection: [
      ["Overview", "matrix"],
      ["Anime", "anime"],
      ["Books", "books"],
      ["Visual Novels", "vn"],
      ["Games", "game"],
      ["Budget Planner", "wishlist"],
      ["Shrine", "shrine"],
      null,
      ["AniList", "aniprofile"],
      ["VNDB", "vndbprofile"],
      ["Sync & Import", "mediasync"]
    ],
    system: [
      ["Backup & Restore", "data"],
      ["Help & Guide", "help"]
    ]
  };
  KOS.sectionOf = function (viewId) { return SECTION_OF[viewId] || null; };
  /* the landing view when a rail section button is pressed */
  KOS.sectionLanding = function (sec) {
    if (sec === "study") return ["subject", KOS.store.state.ui.subject || "compsci"];
    return [{ home: "home", collection: "matrix", governor: "governor", system: "data" }[sec] || "home", undefined];
  };

  function renderSubnav(sec, viewId, arg) {
    var nav = document.getElementById("subnav");
    if (!nav) return;
    var items = SUBNAV[sec];
    nav.innerHTML = "";
    if (!items) { nav.classList.add("hidden"); return; }
    nav.classList.remove("hidden");
    /* which entry is lit: the view itself, or the owning subject for ref pages */
    var activeView = viewId, activeArg = arg;
    if (viewId === "ref" && arg) { activeView = "subject"; activeArg = arg.subject; }
    if (viewId === "seasonal" || viewId === "mangaka") activeView = "anime";
    items.forEach(function (it) {
      if (!it) { nav.appendChild(el("span", { class: "subnav-sep", "aria-hidden": "true" })); return; }
      var on = it[1] === activeView && (it[2] === undefined || it[2] === activeArg);
      var btn = el("button", { class: "subnav-item" + (on ? " active" : ""),
        onclick: function () { KOS.show(it[1], it[2]); } }, [
        el("span", { class: "lbl", text: it[0] }),
        it[3] ? el("span", { class: "pc", id: it[3] }) : null
      ]);
      nav.appendChild(btn);
    });
    if (KOS.refreshRailCounters) KOS.refreshRailCounters();
  }

  KOS.show = function (viewId, arg, opts) {
    opts = opts || {};
    /* a fresh navigation (not Back/Forward) records history and abandons any
       forward trail — exactly like a browser address bar */
    if (navCur && !opts._nav) {
      if (navKey(navCur) !== navKey({ viewId: viewId, arg: arg })) {
        navHist.push(navCur);
        if (navHist.length > 60) navHist.shift();
      }
      navFwd = [];
    }
    navCur = { viewId: viewId, arg: arg };

    var main = document.getElementById("main");
    main.innerHTML = "";
    main.scrollTop = 0;
    /* subject views set a per-subject --accent on #main; without this reset
       it leaks into every later view (vault bars picked up the last subject
       hue). Views that want an accent set it themselves. */
    main.style.removeProperty("--accent");
    /* exactly one rail section lit: the one owning this view. Views outside
       any section (none today) highlight nothing. */
    var sec = SECTION_OF[viewId] || null;
    document.querySelectorAll(".rail-item").forEach(function (b) {
      b.classList.toggle("active", !!sec && b.dataset.section === sec);
    });
    renderSubnav(sec, viewId, arg);
    if (KOS.views[viewId]) KOS.views[viewId](main, arg);
    KOS.store.state.ui.view = viewId;
    if (viewId === "subject") KOS.store.state.ui.subject = arg;
    KOS.store.save();
    updateNavBtns();
  };
})();
