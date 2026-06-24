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

  KOS.ui = { el: el, toast: toast, flashSaved: flashSaved };

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
    /* exactly one rail item active: the subject button for subject/ref
       views, otherwise the button whose data-view matches. Labs have no
       rail entry any more, so they highlight nothing. */
    var sid = viewId === "subject" ? arg
            : viewId === "ref" && arg ? arg.subject : null;
    var target = null;
    document.querySelectorAll(".rail-item").forEach(function (b) {
      b.classList.remove("active");
      if (target) return;
      if (sid) {
        if (b.dataset.view === "subject" && b.dataset.subject === sid) target = b;
      } else if (b.dataset.view === viewId && !b.dataset.subject) {
        target = b;
      }
    });
    if (target) target.classList.add("active");
    if (KOS.views[viewId]) KOS.views[viewId](main, arg);
    KOS.store.state.ui.view = viewId;
    if (viewId === "subject") KOS.store.state.ui.subject = arg;
    KOS.store.save();
    updateNavBtns();
  };
})();
