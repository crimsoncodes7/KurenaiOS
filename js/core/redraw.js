/* Kurenai OS — core/redraw.js
   The redraw policy, the change bus and the view lifecycle (quality
   programme W2; replaces the kos-redraw-1 stopgap in ui.js).

   THE PROBLEM. A page is drawn from the state. When the state moves behind
   the page — a cloud pull, another tab's write, a habit ticking itself, a
   picture loading — the old answer was to remount the page, which lost what
   the reader was in the middle of. The stopgap answered by never redrawing
   a study page at all, which left it stale without a word (SY-26) and let a
   stale editor write over what another device had added (SY-18).

   THE POLICY (decision B4, invariants 65 and 164–166):

   1. A background change says WHAT changed: the top-level keys of the
      state document that moved, and the stores outside it (`db:media`,
      `db:money`, `db:files`, `db:ink`, `db:mind`, `db:reports`,
      `db:reviews`, `art`, `ext:gcal`). KOS.changes.snapshot()/diff() work
      that out for the state document; a store's replicator names itself.
   2. A view DECLARES what it reads (KOS.viewReads, below). A change that
      touches nothing the page on screen reads redraws nothing.
   3. A change the page does read is applied at a SAFE POINT:
        - on a task page (work lives in the page itself: a topic, a review,
          a lesson, a vault) and while a page says it holds unsaved work
          (KOS.view.hold), never by itself — a chip in the page header says "Updated on
          another device · Refresh", and leaving the page draws the next
          one from the fresh state anyway;
        - elsewhere at once, unless you are typing, a dialog is open, a
          pointer is down or (for a pull) you touched the page in the last
          few seconds — then as soon as that ends.
   4. A redraw keeps the reader's place: the page scroll, every inner
      scroller, keyboard focus and the caret, and (a background redraw
      only) text typed into a field and not yet submitted.

   THE LIFECYCLE. Each render of a page gets a record. KOS.view.onDispose,
   signal() and token() let async work started for a page stop when that
   page is replaced; memo() keeps a page's own state (the notes page, a
   draft, a batch count) across redraws of one visit and keep() across
   visits; guard() asks before unsaved work is left. A real navigation
   closes the dialogs that were open over the page it leaves.            */
(function () {
  "use strict";
  var KOS = window.KOS;
  var el = KOS.ui.el;

  function navKey(viewId, arg) { return viewId + "::" + JSON.stringify(arg === undefined ? null : arg); }
  function mainEl() { return document.getElementById("main"); }

  /* ================= what each view reads =================
     Top-level keys of the state document, and the stores outside it.
     "*" reads everything. A view not listed reads everything, so a new
     view is correct before it is declared; smoke139 holds every list to
     what the page really reads while it draws. `ui` is per device and is
     never a reason to redraw. */
  var STUDY = ["progress", "srs", "srsCfg", "questions", "custom", "edits", "sessions", "tracker", "exams", "itUnits",
    "pacing", "assignments", "calendar", "resources", "errorLog"];
  var SPACES = ["code", "japanese", "mind", "creatives"];
  var VAULT = ["media", "db:media", "artSlots", "art"];
  var READS = {
    home: ["*"],
    subject: STUDY.concat(SPACES, ["governor", "goals", "routines", "db:ink", "db:files", "artSlots", "art"]),
    ref: STUDY.concat(SPACES, ["governor", "db:ink", "db:files", "db:mind"]),
    review: STUDY.concat(SPACES, ["db:reviews"]),
    due: STUDY.concat(SPACES, ["db:reviews"]),
    cardstats: STUDY.concat(["db:reviews"]),
    personaldeck: STUDY,
    assignments: ["assignments", "calendar", "sessions", "exams", "goals", "pacing", "db:files", "ext"],
    tracker: STUDY.concat(["db:files"]),
    exams: STUDY.concat(["goals", "governor", "db:files", "notify", "artSlots", "art"]),
    pacing: ["pacing", "progress", "assignments", "calendar", "reminders", "exams", "srs"],
    errorlog: ["errorLog", "custom", "srs"],
    code: ["code", "progress", "srs", "srsCfg", "sessions", "governor", "edits", "goals"],
    japanese: ["japanese", "progress", "srs", "srsCfg", "sessions", "governor", "edits"],
    mind: ["mind", "progress", "srs", "srsCfg", "sessions", "governor", "edits", "db:mind"],
    creatives: ["creatives", "progress", "srs", "srsCfg", "sessions", "governor", "edits", "exams"],
    focus: ["focus", "sessions", "assignments", "calendar", "governor", "progress", "exams", "routines", "todo",
      "media", "db:media", "artSlots", "art"],
    calendar: ["calendar", "assignments", "reminders", "exams", "pacing", "money", "goals", "routines", "dayReview", "ext",
      "ext:gcal", "itUnits", "db:money"],
    reminders: ["reminders", "pacing", "assignments", "ext", "todo", "routines"],
    routines: ["routines", "todo", "sessions", "governor", "dayReview", "focus", "goals", "code", "japanese", "srs",
      "pacing", "artSlots", "art"],
    tasks: ["routines", "todo", "sessions", "governor", "dayReview", "pacing"],
    money: ["money", "wishlist", "goals", "db:money", "db:media", "artSlots", "art"],
    goals: ["*"],
    matrix: VAULT.concat(["wishlist", "sessions", "governor", "goals"]),
    anime: VAULT, books: VAULT, vn: VAULT, game: VAULT, seasonal: VAULT, mangaka: VAULT, shrine: VAULT,
    wishlist: VAULT.concat(["wishlist", "money", "db:money"]),
    mediasync: ["media", "db:media", "sessions"],
    aniprofile: ["media", "db:media"], vndbprofile: ["media", "db:media"],
    governor: ["*"],
    achievements: ["*"],
    assistant: ["assistant", "governor"],
    notifications: ["notify", "notifyCloud", "exams"],
    reports: ["*"],
    data: ["*"], storage: ["*"],
    files: ["db:files", "db:ink", "assignments", "exams", "calendar", "goals"],
    pen: [], connections: ["ext", "reminders", "calendar"],
    help: [],
    sims: ["governor"], worked: ["governor", "worked"], trace: ["governor", "trace"], oop: ["governor", "oop"]
  };
  /* work lives in the page itself: a background change waits for the reader */
  var TASK = { ref: 1, due: 1, review: 1, personaldeck: 1, code: 1, japanese: 1, mind: 1, creatives: 1,
    exams: 1, tracker: 1, errorlog: 1, assistant: 1, worked: 1, trace: 1, oop: 1, sims: 1, files: 1,
    anime: 1, books: 1, vn: 1, game: 1, mangaka: 1, seasonal: 1, wishlist: 1, shrine: 1 };

  function readsOf(viewId, arg) {
    var r = READS[viewId];
    if (typeof r === "function") r = r(arg);
    return Array.isArray(r) ? r : ["*"];
  }
  function relevant(nav, changed) {
    if (!changed) return true;                      /* unknown: assume it matters */
    if (!changed.length) return false;
    var r = readsOf(nav.viewId, nav.arg);
    if (r.indexOf("*") !== -1) return true;
    for (var i = 0; i < changed.length; i++) if (changed[i] === "*" || r.indexOf(changed[i]) !== -1) return true;
    return false;
  }

  /* ================= the view lifecycle ================= */
  var render = null;                 /* the render on screen */
  var visitKey = null, visitMemo = {};
  var kept = {}, keptOrder = [];     /* per page load, per page */
  var navigating = false;

  function endRender(r, leaving) {
    if (!r || !r.alive) return;
    r.alive = false;
    if (r.ctl) { try { r.ctl.abort(); } catch (e) { /* an old browser */ } }
    r.disposers.splice(0).forEach(function (fn) {
      try { fn({ leaving: !!leaving }); } catch (e) { console.error("Kurenai OS: a view's clean-up failed", e); }
    });
  }
  function dirty() {
    if (!render) return null;
    for (var i = 0; i < render.guards.length; i++) {
      var g = null;
      try { g = render.guards[i](); } catch (e) { g = null; }
      if (g) return typeof g === "string" ? { body: g } : g === true ? {} : g;
    }
    return null;
  }
  function holding() {
    if (!render) return false;
    return render.holds.some(function (fn) { try { return !!fn(); } catch (e) { return false; } });
  }

  KOS.view = {
    /* ui.js KOS.show calls this first. false = the page on screen holds
       unsaved work and the reader was asked; nothing was drawn. */
    _enter: function (viewId, arg, same, opts) {
      opts = opts || {};
      var k = navKey(viewId, arg);
      if (!same && render && !opts._force) {
        var g = dirty();
        if (g) {
          KOS.ui.confirm({ title: g.title || "Leave without saving?",
            body: g.body || "The changes you made on this page have not been saved.",
            confirm: g.confirm || "Leave", cancel: g.cancel || "Stay", danger: true, mark: "留" },
          function () { KOS.show(viewId, arg, { _force: true }); });
          return false;
        }
      }
      endRender(render, !same);
      if (!same) {
        if (render) {
          navigating = true;
          try { if (KOS.ui.closeDialogs) KOS.ui.closeDialogs(); } finally { navigating = false; }
        }
        visitKey = k; visitMemo = {};
        clearFloor();
        clearPending();
      } else if (pending) {
        /* the same page drawn again: the chip goes back into its new header */
        setTimeout(function () { if (pending && (pending.why === "task" || pending.why === "work")) showChip(); }, 0);
      }
      var ctl = null;
      try { ctl = typeof AbortController === "function" ? new AbortController() : null; } catch (e) { ctl = null; }
      render = { key: k, viewId: viewId, alive: true, ctl: ctl, disposers: [], holds: [], guards: [] };
      return true;
    },
    /* runs when this render is replaced: a redraw or a navigation
       ({leaving: true}). Remove the listeners and timers a page set on
       anything that outlives #main. */
    onDispose: function (fn) { if (render && typeof fn === "function") render.disposers.push(fn); },
    /* an AbortSignal that fires when this render is replaced (null where
       the browser has no AbortController) */
    signal: function () { return render && render.ctl ? render.ctl.signal : null; },
    /* a function that answers "is the render I was made in still on
       screen?" — for async work that would otherwise act on another page */
    token: function () { var r = render; return function () { return !!r && r.alive; }; },
    /* the PAGE on screen is still the one this was made on (a redraw of the
       same page does not end it) */
    visitToken: function () { var k = visitKey; return function () { return visitKey === k; }; },
    /* SY-25: a redraw for later (a timer, a sync that resolves) that happens
       only if THIS page is still the one on screen — it never remounts the
       page the reader has moved on to */
    redrawIfStill: function () {
      var still = KOS.view.visitToken();
      return function () { if (still()) KOS.rerender(); };
    },
    /* a page's own state for this VISIT: it survives every redraw and is
       dropped when another page opens */
    memo: function (name, init) {
      if (!Object.prototype.hasOwnProperty.call(visitMemo, name)) {
        visitMemo[name] = typeof init === "function" ? init() : init === undefined ? {} : init;
      }
      return visitMemo[name];
    },
    setMemo: function (name, value) { visitMemo[name] = value; return value; },
    dropMemo: function (name) { delete visitMemo[name]; },
    /* the same, kept while the app stays loaded (Back to a topic finds its
       notes page); the 60 pages opened last */
    keep: function (name, init, key) {
      var k = key || visitKey || "?";
      if (!kept[k]) {
        kept[k] = {}; keptOrder.push(k);
        if (keptOrder.length > 60) delete kept[keptOrder.shift()];
      }
      if (!Object.prototype.hasOwnProperty.call(kept[k], name)) {
        kept[k][name] = typeof init === "function" ? init() : init === undefined ? {} : init;
      }
      return kept[k][name];
    },
    /* fn() is true while this page holds work a redraw would lose: a
       background change waits and the pill offers it */
    hold: function (fn) { if (render && typeof fn === "function") render.holds.push(fn); },
    /* AP-08: listen on something that outlives the page (window, document)
       for as long as `node` is on screen. The listener goes when the render
       that added it ends and `node` has left the page — a redraw or a
       navigation — not the next time the event happens to fire (a paste or
       an ink write that never came kept every visited page in memory). A
       node still on screen then (inside a dialog that outlived its page)
       keeps it until it leaves. Returns the remover. */
    listen: function (node, target, type, fn, opts) {
      var off = function () { target.removeEventListener(type, h, opts); };
      function h(e) { if (node && !node.isConnected) { off(); return; } fn(e); }
      target.addEventListener(type, h, opts);
      if (render) render.disposers.push(function () { setTimeout(function () { if (node && !node.isConnected) off(); }, 0); });
      return off;
    },
    /* fn() says (true, a sentence, or {title, body}) that leaving would
       lose unsaved work: navigation asks first */
    guard: function (fn) { if (render && typeof fn === "function") render.guards.push(fn); },
    dirty: dirty,
    /* forget what keep() holds (every page's, or one key's) and, for every
       page, this visit's memo too: a restore that replaces the data, and
       the suites that replay from a snapshot */
    forget: function (key) { if (key) delete kept[key]; else { kept = {}; keptOrder = []; visitMemo = {}; } },
    navigating: function () { return navigating; }
  };

  /* ================= keeping the reader's place ================= */
  function pathOf(node, root) {
    var p = [];
    while (node && node !== root) {
      var par = node.parentNode;
      if (!par) return null;
      p.unshift(Array.prototype.indexOf.call(par.children, node));
      node = par;
    }
    return node === root ? p : null;
  }
  function byPath(root, p) {
    var n = root;
    for (var i = 0; i < p.length && n; i++) n = n.children[p[i]];
    return n || null;
  }
  function sig(n) {
    return [n.tagName, n.getAttribute("type") || "", n.getAttribute("data-ui") || "", n.getAttribute("name") || "",
      n.getAttribute("aria-label") || "", n.getAttribute("placeholder") || ""].join("|");
  }
  function isField(n) {
    if (!n || !n.tagName) return false;
    if (n.tagName === "TEXTAREA") return true;
    return n.tagName === "INPUT" && !/^(checkbox|radio|button|submit|file|range|color|hidden|image|reset)$/.test(n.type || "text");
  }
  /* find the same control in the page as redrawn: by its place when the
     thing there still has its signature, else the one control that has it */
  function findAgain(root, rec) {
    var n = rec.path ? byPath(root, rec.path) : null;
    if (n && sig(n) === rec.sig) return n;
    var tag = rec.sig.split("|")[0].toLowerCase(), hits = [];
    [].forEach.call(root.querySelectorAll(tag), function (c) { if (sig(c) === rec.sig) hits.push(c); });
    if (rec.text) {
      var t = hits.filter(function (c) { return (c.textContent || "").trim() === rec.text; });
      if (t.length === 1) return t[0];
    }
    return hits.length === 1 ? hits[0] : null;
  }
  /* what a field held when the reader first touched it: typed text is put
     back only into a field the page still draws with that same value */
  var fieldInitial = typeof WeakMap === "function" ? new WeakMap() : null;
  function noteField(e) {
    var t = e.target, m = mainEl();
    if (!fieldInitial || !isField(t) || !m || !m.contains(t) || fieldInitial.has(t)) return;
    fieldInitial.set(t, t.value);
  }
  document.addEventListener("focus", noteField, true);
  document.addEventListener("beforeinput", noteField, true);

  function capture(preserveFields) {
    var m = mainEl(), out = { scrolls: [], focus: null, fields: [] };
    if (!m) return out;
    var all = m.querySelectorAll("*");
    for (var i = 0; i < all.length; i++) {
      var n = all[i];
      if (n.scrollLeft || n.scrollTop) out.scrolls.push({ path: pathOf(n, m), sig: sig(n), x: n.scrollLeft, y: n.scrollTop });
    }
    var a = document.activeElement;
    if (a && a !== m && m.contains(a)) {
      out.focus = { path: pathOf(a, m), sig: sig(a), text: a.tagName === "BUTTON" || a.tagName === "A" ? (a.textContent || "").trim() : null,
        value: isField(a) ? a.value : null, s: null, e: null };
      try { if (isField(a)) { out.focus.s = a.selectionStart; out.focus.e = a.selectionEnd; } } catch (e1) { /* a type with no selection */ }
    }
    if (preserveFields && fieldInitial) {
      [].forEach.call(m.querySelectorAll("input, textarea"), function (f) {
        if (!isField(f) || !fieldInitial.has(f)) return;
        var init = fieldInitial.get(f);
        if (f.value !== init) out.fields.push({ path: pathOf(f, m), sig: sig(f), init: init, value: f.value });
      });
    }
    return out;
  }
  function restore(cap) {
    var m = mainEl();
    if (!m) return;
    cap.fields.forEach(function (rec) {
      var f = findAgain(m, rec);
      /* only where the page drew the field as it was before the typing:
         a value another device changed, or one the page itself committed,
         stands */
      if (!f || !isField(f) || f.value !== rec.init) return;
      f.value = rec.value;
      if (fieldInitial) fieldInitial.set(f, rec.init);
    });
    cap.scrolls.forEach(function (rec) {
      var n = rec.path ? byPath(m, rec.path) : null;
      if (!n || sig(n) !== rec.sig) return;
      if (rec.x) n.scrollLeft = rec.x;
      if (rec.y) n.scrollTop = rec.y;
    });
    if (cap.focus && (!document.activeElement || document.activeElement === document.body || document.activeElement === m)) {
      var t = findAgain(m, cap.focus);
      if (t) {
        try { t.focus({ preventScroll: true }); } catch (e) { try { t.focus(); } catch (e2) { /* detached */ } }
        if (cap.focus.s != null && isField(t) && t.value === cap.focus.value) {
          try { t.setSelectionRange(cap.focus.s, cap.focus.e); } catch (e3) { /* no selection on this type */ }
        }
      }
    }
  }
  /* the element that actually scrolls the page: #stage on the desktop and
     tablet shell, the document on the phone shell, #main as a fallback */
  function scrollers() {
    return [document.getElementById("stage"), mainEl(), document.scrollingElement].filter(Boolean);
  }
  var redrawLater = null, floorTimer = null, lastRestoreAt = 0;
  function clearFloor() {
    clearTimeout(floorTimer); floorTimer = null;
    var m = mainEl();
    if (m && m.style.minBlockSize) m.style.minBlockSize = "";
  }
  function redrawNow(opts) {
    opts = opts || {};
    /* never under a pen: a redraw mid-stroke on the iPad. It waits for the
       pen to lift. */
    if (KOS.inkUI && KOS.inkUI.busy && KOS.inkUI.busy()) {
      clearTimeout(redrawLater);
      redrawLater = setTimeout(function () { redrawLater = null; redrawNow(opts); }, 1200);
      return true;
    }
    clearPending();
    var sc = scrollers(), tops = sc.map(function (e) { return e.scrollTop; });
    var cap = capture(!!opts.preserve);
    var mBefore = mainEl(), prevH = mBefore ? mBefore.scrollHeight : 0;
    /* Hold #main's previous height across the DOM rebuild so iPadOS WebKit
       cannot clamp #stage.scrollTop to 0 and paint at the top while sync or
       async content (such as Ink sheets from IndexedDB) mounts. */
    clearFloor();
    if (mBefore && prevH && tops.some(Boolean)) mBefore.style.minBlockSize = prevH + "px";
    if (!KOS.ui.redrawNow()) { clearFloor(); return false; }
    function put() {
      lastRestoreAt = Date.now();
      sc.forEach(function (e, i) { if (tops[i]) e.scrollTop = tops[i]; });
    }
    put();
    restore(cap);
    /* async content (a vault's rows from IndexedDB, images) lands later:
       the place is put back again as the page fills, until the reader
       moves it themselves */
    var at = Date.now();
    function again() {
      if (lastTouch > at || !render || !render.alive || render !== mine) return;
      put();
      var m = mainEl();
      cap.scrolls.forEach(function (rec) {
        var n = m && rec.path ? byPath(m, rec.path) : null;
        if (n && sig(n) === rec.sig) { if (rec.x) n.scrollLeft = rec.x; if (rec.y) n.scrollTop = rec.y; }
      });
    }
    var mine = render;
    var m0 = mainEl();
    if (m0 && m0.style.minBlockSize) {
      KOS.view.onDispose(clearFloor);
      floorTimer = setTimeout(function () { clearFloor(); again(); }, 600);
    }
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(again);
    /* as the page grows (rows arriving, pictures loading), until the reader
       scrolls or the render ends */
    if (m0 && typeof ResizeObserver === "function" && (tops.some(Boolean) || cap.scrolls.length)) {
      var ro = new ResizeObserver(function () {
        if (lastTouch > at || !mine || !mine.alive) { ro.disconnect(); return; }
        again();
      });
      ro.observe(m0);
      if (m0.firstElementChild) ro.observe(m0.firstElementChild);
      KOS.view.onDispose(function () { ro.disconnect(); });
    }
    return true;
  }

  /* ================= the safe point ================= */
  var RECENT = 4000, RETRY = 3000;
  var lastTouch = 0, pointerDown = false;
  ["pointerdown", "keydown", "wheel", "touchstart", "input"].forEach(function (ev) {
    document.addEventListener(ev, function () { lastTouch = Date.now(); }, { capture: true, passive: true });
  });
  document.addEventListener("scroll", function () {
    if (Date.now() - lastRestoreAt > 120) lastTouch = Date.now();
  }, { capture: true, passive: true });
  document.addEventListener("pointerdown", function () { pointerDown = true; }, { capture: true, passive: true });
  ["pointerup", "pointercancel"].forEach(function (ev) {
    document.addEventListener(ev, function () { pointerDown = false; }, { capture: true, passive: true });
  });
  function typing() {
    var a = document.activeElement;
    return !!a && (a.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName));
  }
  function holdReason(nav, source) {
    if (TASK[nav.viewId]) return "task";
    if (holding()) return "work";
    if (typing()) return "typing";
    if (KOS.ui.topDialog()) return "dialog";
    if (pointerDown) return "pointer";
    if (source !== "local" && Date.now() - lastTouch < RECENT) return "recent";
    return null;
  }

  /* ================= what is waiting: the chip (design turn 36) =================
     A change held back from the page is offered by ONE chip in the page
     header's action slot (beside a topic's ‹ ›; on the phone it rides the
     bar, [data-phone-action]): "Updated on another device · Refresh", or
     "3 updates" when more came. It opens the shared menu: one line an area,
     counts only — never a record's contents — then Refresh and Later. In a
     flashcard or quiz run the chip gives way to a line under the progress
     bar (an element marked [data-run-line]); nothing applies mid-run. The
     chip is never removed, only hidden and moved: the phone shell puts a
     moved node back on its next pass. */
  var pending = null, retryTimer = null, idleTimer = null, chip = null, chipOpts = null;
  var WORDS = { device: "Updated on another device", tab: "Updated in another window" };
  var WHERE = { device: "Another device", tab: "Another window on this device" };
  var AREAS = { progress: "Topic progress", srs: "Flashcards", srsCfg: "Card settings", questions: "Questions", custom: "Your cards and quizzes",
    edits: "Your edits", sessions: "Sessions", tracker: "Exams & Papers", exams: "Exams", itUnits: "IT units", pacing: "The plan",
    assignments: "Assignments", calendar: "Calendar", reminders: "Reminders", resources: "Resources", code: "Code", japanese: "Japanese",
    mind: "Mind", creatives: "Creatives", governor: "Rewards", goals: "Goals", routines: "Routines", dayReview: "Daily Review",
    money: "Money", media: "Collection", wishlist: "Wishlist", achievements: "Badges", notify: "Notifications", todo: "Tasks",
    focus: "Focus", ext: "Connections", "db:media": "Collection", "db:files": "Files", "db:money": "Money", "db:ink": "Handwriting",
    "db:mind": "Mind's Journal", "db:reports": "Reports", "db:reviews": "Reviews" };
  function areaName(k) { return AREAS[k] || String(k).replace(/^db:/, "").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, function (c) { return c.toUpperCase(); }); }
  function hhmm(t) { var d = new Date(t); return (d.getHours() < 10 ? "0" : "") + d.getHours() + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes(); }
  function words() {
    if (!pending) return "";
    return pending.count > 1 ? pending.count + " updates" : WORDS[pending.source] || WORDS.device;
  }
  function runSlot() { var m = mainEl(); return m ? m.querySelector("[data-run-line]") : null; }
  function phone() { return !!(window.matchMedia && window.matchMedia("(max-width: 700px)").matches); }
  function chipHost() {
    var m = mainEl();
    if (!m) return null;
    /* on the phone it rides the app's own header, beside the bell (36a) */
    if (phone()) { var end = document.querySelector("#topbar .k-topbar-end"); if (end) return end; }
    var acts = m.querySelector(":scope > .k-pagehead > .k-pagehead-actions") || m.querySelector(".k-topic-head .k-topic-steps") || m.querySelector(".k-pagehead-actions");
    return acts;
  }
  function makeChip() {
    chipOpts = { label: "", className: "k-held-chip", panelClass: "k-held-menu", items: [] };
    chip = KOS.ui.menu(chipOpts);
    chip.setAttribute("data-ui", chip.getAttribute("data-ui") + " shell.refresh");

    chip.insertBefore(el("span", { class: "k-held-dot", "aria-hidden": "true" }), chip.firstChild);
    chip.insertBefore(el("b", { class: "k-held-act", text: "Refresh" }), chip.querySelector(".k-btn-caret"));
    chip.querySelector("[data-ui~='ui.menu-label']").classList.add("k-held-label");
    chip.hidden = true;
  }
  function paintChip() {
    if (!chip) makeChip();
    var w = words(), src = pending.source;
    chip.querySelector("[data-ui~='ui.menu-label']").textContent = w;
    chip.setAttribute("aria-label", w + ". What changed, and Refresh");
    chip.setAttribute("data-state", pending.count > 1 ? "several" : "arrived");
    var rows = Object.keys(pending.areas).sort(function (a, b) { return pending.areas[b] - pending.areas[a]; }).slice(0, 6).map(function (k) {
      var n = pending.areas[k];
      return { heading: "● " + areaName(k) + (n > 1 ? " · " + n + " updates" : " · updated") };
    });
    if (!rows.length) rows.push({ heading: "● This page's data · updated" });
    chipOpts.label = w;
    chipOpts.items = [{ heading: (WHERE[src] || WHERE.device) + " · " + hhmm(pending.at) }].concat(rows, [{ sep: true },
      { label: "Refresh", hint: "Redraw this page now; your place is kept", onSelect: function () { KOS.changes.apply(); } },
      { label: "Later", hint: "Keep reading; it applies when you leave or finish", onSelect: function () {} }]);
  }
  /* the chip, or a run's line, where the page has room for it */
  function showChip() {
    if (!pending) return;
    var slot = runSlot();
    if (slot) {
      slot.textContent = words() + " · it applies when this run ends";
      slot.hidden = false;
      if (chip) chip.hidden = true;
      return;
    }
    paintChip();
    var host = chipHost();
    if (host) {
      U_state(chip, "float", false);
      U_state(chip, "bar", host.classList.contains("k-topbar-end"));
      if (chip.parentNode !== host) host.insertBefore(chip, host.firstChild);
    } else {
      U_state(chip, "float", true);
      var stage = document.getElementById("stage") || document.body;
      if (chip.parentNode !== stage) stage.appendChild(chip);
    }
    var was = chip.hidden === false && chip.getAttribute("data-said") === words();
    chip.hidden = false;
    chip.setAttribute("data-said", words());
    if (!was && KOS.a11y) KOS.a11y.announce(words() + ". Refresh is available.");
  }
  function U_state(n, w, on) { if (KOS.ui && KOS.ui.state) KOS.ui.state(n, w, on); }
  function hideChip() {
    if (chip) chip.hidden = true;
    var slot = runSlot();
    if (slot) { slot.hidden = true; slot.textContent = ""; }
  }
  function clearPending() {
    pending = null;
    clearTimeout(retryTimer); retryTimer = null;
    clearInterval(idleTimer); idleTimer = null;
    hideChip();
  }
  function pend(nav, why, source, changed, arrived) {
    /* the strongest source words it: another device, then another tab */
    var rank = { local: 0, tab: 1, device: 2 };
    var key = navKey(nav.viewId, nav.arg), same = pending && pending.key === key;
    if (same && rank[pending.source] > rank[source]) source = pending.source;
    var areas = same ? pending.areas : {}, count = same ? pending.count : 0;
    if (arrived) {
      count++;
      (changed || ["*"]).forEach(function (k) { if (k !== "*") areas[k] = (areas[k] || 0) + 1; });
    }
    pending = { key: key, source: source, why: why, areas: areas, count: Math.max(1, count), at: arrived || !same ? Date.now() : pending.at };
    clearTimeout(retryTimer); retryTimer = null;
    if (why === "task" || why === "work") {
      showChip();
      /* 2 minutes with nothing touched, no draft, no dialog: a safe moment */
      if (!idleTimer) idleTimer = setInterval(function () { if (Date.now() - lastTouch >= IDLE) safePoint("idle"); }, 30000);
    }
    else retryTimer = setTimeout(function () { retryTimer = null; retry(); }, RETRY);
  }
  var IDLE = 120000;
  function retry() {
    var nav = KOS.currentNav && KOS.currentNav();
    if (!pending || !nav || pending.key !== navKey(nav.viewId, nav.arg)) { clearPending(); return false; }
    var why = holdReason(nav, pending.source);
    if (why) { pend(nav, why, pending.source, null, false); return false; }
    return applyMarked();
  }
  /* typing ended, a dialog closed: do not wait for the timer */
  document.addEventListener("focusout", function () {
    if (pending && pending.why !== "task" && pending.why !== "work") setTimeout(function () { if (pending) retry(); }, 0);
  }, true);

  /* ================= the safe moment (36d) =================
     A held change is applied by itself only when nothing could be lost:
     a tab changed, a note page turned, or two minutes untouched — with no
     run on the page, no unsaved work (KOS.view.hold), no field in use and
     no dialog. Then only the values that changed take a short ring. */
  function safePoint(why) {
    var nav = KOS.currentNav && KOS.currentNav();
    if (!pending || !nav || pending.key !== navKey(nav.viewId, nav.arg)) return false;
    if (pending.why !== "task" && pending.why !== "work") return false;
    if (runSlot() || holding() || typing() || KOS.ui.topDialog() || pointerDown) return false;
    if (KOS.inkUI && KOS.inkUI.busy && KOS.inkUI.busy()) return false;
    return applyMarked(why);
  }
  document.addEventListener("click", function (e) {
    if (!pending) return;
    var t = e.target && e.target.closest ? e.target.closest("[role='tab'], [data-ui~='topic.page'], [data-ui~='topic.reader-step']") : null;
    var m = mainEl();
    if (t && m && m.contains(t)) setTimeout(function () { safePoint("turn"); }, 0);
  }, true);   /* capture: a page turn redraws its own button before the click would bubble here */
  /* the short values on the page, by hook and place, to ring what moved */
  function values() {
    var m = mainEl(), out = {}, seen = {};
    if (!m) return out;
    [].forEach.call(m.querySelectorAll("[data-ui]"), function (n) {
      if (n.closest("[data-run-line]") || n === chip || (chip && chip.contains(n))) return;
      var t = (n.textContent || "").replace(/\s+/g, " ").trim();
      if (!t || t.length > 48 || n.querySelector("[data-ui]")) return;
      var k = n.getAttribute("data-ui"), i = seen[k] = (seen[k] || 0) + 1;
      out[k + "#" + i] = { t: t, cls: n.className };
    });
    return out;
  }
  function ring(before) {
    var m = mainEl(), seen = {}, rung = [];
    if (!m) return rung;
    [].forEach.call(m.querySelectorAll("[data-ui]"), function (n) {
      var t = (n.textContent || "").replace(/\s+/g, " ").trim();
      if (!t || t.length > 48 || n.querySelector("[data-ui]")) return;
      var k = n.getAttribute("data-ui"), i = seen[k] = (seen[k] || 0) + 1, b = before[k + "#" + i];
      if (b && (b.t !== t || b.cls !== n.className)) { U_state(n, "changed", true); rung.push(n); }
    });
    if (rung.length) setTimeout(function () { rung.forEach(function (n) { U_state(n, "changed", false); }); }, 1000);
    return rung;
  }
  function applyMarked() {
    var before = values();
    var ok = redrawNow({ preserve: true });
    if (ok) ring(before);
    return ok;
  }

  /* ================= the entry points ================= */
  /* KOS.rerender()                         the reader asked: redraw now
     KOS.rerender({background, changed, source})
       background  "soft" (this device did it: a habit ticked itself, a
                   picture loaded) or "hard"/true (a pull, another tab)
       changed     the keys that moved (see the header); none = unknown
       source      "device" | "tab" | "local" — words the pill           */
  KOS.rerender = function (opts) {
    opts = opts || {};
    var nav = KOS.currentNav && KOS.currentNav();
    if (!nav || !KOS.views[nav.viewId]) return false;
    if (navigating) return false;                 /* a dialog closing as its page is left */
    if (!opts.background) return redrawNow({ preserve: !!opts.preserve });
    var source = opts.source || (opts.background === "soft" ? "local" : "device");
    listeners.forEach(function (fn) {
      try { fn(opts.changed || null, source); } catch (e) { console.error("Kurenai OS: a change listener failed", e); }
    });
    if (!relevant(nav, opts.changed || null)) return false;
    var why = holdReason(nav, source);
    /* what THIS device did behind a page with work in it (a habit ticking
       itself after a batch, a picture loading) is not news to its reader:
       no pill, and the page's own handlers keep it current (SY-12) */
    if ((why === "task" || why === "work") && source === "local") return false;
    if (why) { pend(nav, why, source, opts.changed || null, true); return true; }
    return redrawNow({ preserve: true });
  };
  var listeners = [];

  KOS.changes = {
    /* the state document by top-level key, to diff after a change lands
       (`ui` is this device's own and never a reason to redraw) */
    snapshot: function () {
      var s = KOS.store.state, out = {};
      Object.keys(s).forEach(function (k) { if (k !== "ui") out[k] = JSON.stringify(s[k]); });
      return out;
    },
    diff: function (snap) {
      var now = KOS.changes.snapshot(), out = [];
      Object.keys(now).forEach(function (k) { if (now[k] !== snap[k]) out.push(k); });
      Object.keys(snap).forEach(function (k) { if (!(k in now)) out.push(k); });
      return out;
    },
    /* a background change happened: keys, {source} */
    note: function (keys, opts) {
      opts = opts || {};
      var source = opts.source || "device";
      return KOS.rerender({ background: source === "local" ? "soft" : "hard", changed: keys || null, source: source });
    },
    /* fn(changedKeys | null, source) for every background change, whether
       or not the page on screen reads it — for what lives outside #main */
    on: function (fn) { if (typeof fn === "function") listeners.push(fn); },
    pending: function () { return pending ? { source: pending.source, why: pending.why } : null; },
    retry: retry,
    /* a page's safe moment (a run that ended, a page turned): apply what
       is held if nothing could be lost; place the chip again after a run */
    safePoint: safePoint,
    place: function () { if (pending && (pending.why === "task" || pending.why === "work")) showChip(); },
    held: function () { return pending ? { count: pending.count, areas: Object.assign({}, pending.areas), source: pending.source, at: pending.at } : null; },
    /* the chip's Refresh: redraw now, keeping the reader's place, and ring
       the values that changed */
    apply: function () {
      var had = !!pending;
      var ok = applyMarked();
      if (had) {
        var m = mainEl();
        if (m && (!document.activeElement || document.activeElement === document.body)) {
          try { m.focus({ preventScroll: true }); } catch (e) { /* jsdom */ }
        }
        if (KOS.a11y) KOS.a11y.announce("Page refreshed.");
      }
      return ok;
    },
    reads: readsOf,
    relevant: function (viewId, arg, changed) { return relevant({ viewId: viewId, arg: arg }, changed); },
    isTask: function (viewId) { return !!TASK[viewId]; },
    _views: READS
  };
})();
