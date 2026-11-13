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
          (KOS.view.hold), never by itself — a quiet pill says "Updated on
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
  var STUDY = ["progress", "srs", "srsCfg", "custom", "edits", "sessions", "tracker", "exams", "itUnits",
    "pacing", "assignments", "calendar", "resources"];
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
    exams: 1, tracker: 1, assistant: 1, worked: 1, trace: 1, oop: 1, sims: 1, files: 1,
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
        clearPending();
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
    /* fn() says (true, a sentence, or {title, body}) that leaving would
       lose unsaved work: navigation asks first */
    guard: function (fn) { if (render && typeof fn === "function") render.guards.push(fn); },
    dirty: dirty,
    /* forget what keep() holds (every page's, or one key's): a restore
       that replaces the data, and the suites that replay from a snapshot */
    forget: function (key) { if (key) delete kept[key]; else { kept = {}; keptOrder = []; } },
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
  var redrawLater = null;
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
    if (!KOS.ui.redrawNow()) return false;
    function put() { sc.forEach(function (e, i) { if (tops[i]) e.scrollTop = tops[i]; }); }
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
    if (typeof requestAnimationFrame === "function") requestAnimationFrame(again);
    /* as the page grows (rows arriving, pictures loading), until the reader
       scrolls or the render ends */
    var m0 = mainEl();
    if (m0 && typeof ResizeObserver === "function" && (tops.some(Boolean) || cap.scrolls.length)) {
      var ro = new ResizeObserver(function () {
        if (lastTouch > at || !mine || !mine.alive) { ro.disconnect(); return; }
        again();
      });
      ro.observe(m0);
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

  /* ================= what is waiting ================= */
  var pending = null, retryTimer = null, pill = null;
  var WORDS = { device: "Updated on another device", tab: "Updated in another tab" };
  function showPill(source) {
    var words = WORDS[source] || WORDS.device;
    if (!pill) {
      pill = el("button", { type: "button", class: "k-refresh-pill", "data-ui": "shell.refresh",
        onclick: function () { KOS.changes.apply(); } }, [
        el("span", { class: "k-refresh-pill-text", "data-ui": "shell.refresh-text" }),
        el("b", { class: "k-refresh-pill-act", text: "Refresh" })
      ]);
      (document.getElementById("stage") || document.body).appendChild(pill);
    }
    var was = pill.hidden === false && pill.firstChild.textContent === words;
    pill.firstChild.textContent = words;
    pill.hidden = false;
    if (!was && KOS.a11y) KOS.a11y.announce(words + ". Refresh is available.");
  }
  function hidePill() { if (pill) pill.hidden = true; }
  function clearPending() {
    pending = null;
    clearTimeout(retryTimer); retryTimer = null;
    hidePill();
  }
  function pend(nav, why, source) {
    /* the strongest source words it: another device, then another tab */
    var rank = { local: 0, tab: 1, device: 2 };
    if (pending && pending.key === navKey(nav.viewId, nav.arg) && rank[pending.source] > rank[source]) source = pending.source;
    pending = { key: navKey(nav.viewId, nav.arg), source: source, why: why };
    clearTimeout(retryTimer); retryTimer = null;
    if (why === "task" || why === "work") showPill(source);
    else retryTimer = setTimeout(function () { retryTimer = null; retry(); }, RETRY);
  }
  function retry() {
    var nav = KOS.currentNav && KOS.currentNav();
    if (!pending || !nav || pending.key !== navKey(nav.viewId, nav.arg)) { clearPending(); return false; }
    var why = holdReason(nav, pending.source);
    if (why) { pend(nav, why, pending.source); return false; }
    return redrawNow({ preserve: true });
  }
  /* typing ended, a dialog closed: do not wait for the timer */
  document.addEventListener("focusout", function () {
    if (pending && pending.why !== "task" && pending.why !== "work") setTimeout(function () { if (pending) retry(); }, 0);
  }, true);

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
    if (why) { pend(nav, why, source); return true; }
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
    /* the pill's Refresh: redraw now, keeping the reader's place */
    apply: function () {
      var had = !!pending;
      var ok = redrawNow({ preserve: true });
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
