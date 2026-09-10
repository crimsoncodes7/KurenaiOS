/* Kurenai OS — core/router.js
   Category 7 Phase F: real browser history (audit G-03 / U-06 / B-?? none).

   Before this, `KOS.show` kept a private navHist/navFwd pair and never
   touched the History API. Two consequences, both serious in an installed
   PWA: the OS Back gesture EXITED THE APP rather than navigating it, and
   nothing in KurenaiOS was linkable, bookmarkable or restorable — a
   refresh landed on whatever `state.ui.view` happened to say.

   Design decisions worth keeping:

   · HASH ROUTES, not path routes. `index.html` must keep working from
     `file://` (CLAUDE.md's first line) and the production host is a static
     Cloudflare Pages deployment with no rewrite rules — a path route would
     404 on refresh in one environment and throw a SecurityError in the
     other. `#/ref/compsci/4.1.1.1` works in both, in the installed PWA, and
     round-trips through the service worker's navigation fallback untouched.

   · THE BROWSER OWNS THE STACK. `KOS.back()`/`KOS.forward()` no longer walk
     a private array; they call `history.back()`/`history.forward()`, so the
     topbar arrows, Alt+←/→, the OS gesture and the browser chrome are all
     ONE history. Two stacks that can disagree is how the in-app arrows
     started lying after a cloud sync.

   · A REDRAW IS NOT A NAVIGATION. `KOS.rerender()` — the cloud-pull path —
     passes `_nav`, and a `_nav` render never pushes. This is the audit's
     "remote/cloud re-render must NOT create fake history entries": a
     background pull that repaints the page you are on leaves the history
     stack, the URL and your scroll position exactly as they were.

   · ARGS ARE REMEMBERED, NOT JUST ENCODED. A route carries the identity a
     link needs (`ref` needs subject+ref; `governor` needs its tab). Richer,
     non-linkable arguments — the Focus setup's `{assignmentId}`, a
     cardstats filter — are held in memory against their history index, so
     an in-session Back restores the FULL argument while a cold deep link
     still resolves to something sensible. Transient modal state is
     deliberately not encoded at all.                                     */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  /* ---- the route table ----
     Everything not listed here is `#/<viewId>` with no argument. Only the
     views whose argument is part of the page's IDENTITY appear. */
  var ENCODE = {
    ref: function (a) { return a && a.subject && a.ref ? [a.subject, a.ref] : null; },
    subject: function (a) { return typeof a === "string" && a ? [a] : null; },
    governor: function (a) { return typeof a === "string" && a ? [a] : null; },
    sims: function (a) { return typeof a === "string" && a ? [a] : null; },
    assistant: function (a) { return a && typeof a.tab === "string" && a.tab ? [a.tab] : null; },
    /* Pacing has two identities and they are mutually exclusive: a WEEK
       (`#/pacing/2026-12-14` — a link to "the week of the mocks" has to
       survive being sent, bookmarked and reopened) or a whole-term tab
       (`#/pacing/braid`, which spans every week and so carries none). They
       never collide because a week is always an ISO date. */
    pacing: function (a) {
      if (typeof a === "string" && a) return [a];
      if (!a) return null;
      if (a.tab && a.tab !== "week") return [a.tab];
      return a.wb ? [a.wb] : null;
    }
  };
  var DECODE = {
    ref: function (p) { return p.length >= 2 ? { subject: p[0], ref: p.slice(1).join("/") } : null; },
    subject: function (p) { return p[0] || null; },
    governor: function (p) { return p[0] || null; },
    sims: function (p) { return p[0] || null; },
    assistant: function (p) { return p[0] ? { tab: p[0] } : null; },
    pacing: function (p) {
      if (!p[0]) return null;
      return /^\d{4}-\d{2}-\d{2}$/.test(p[0]) ? { wb: p[0], tab: "week" } : { tab: p[0] };
    }
  };

  function routeFor(viewId, arg) {
    var enc = ENCODE[viewId];
    var parts = enc ? enc(arg) : null;
    return "#/" + [viewId].concat(parts || []).map(encodeURIComponent).join("/");
  }

  /* A hash back into (viewId, arg). Returns null for anything this build
     cannot render — an unknown view id, a subject that is not one of the
     three, a `ref` route missing half its identity. The caller falls back
     to Home rather than rendering a broken page. */
  function parse(hash) {
    var raw = String(hash || "").replace(/^#\/?/, "");
    if (!raw) return null;
    var parts = raw.split("/").filter(function (s) { return s !== ""; }).map(function (s) {
      try { return decodeURIComponent(s); } catch (e) { return s; }
    });
    if (!parts.length) return null;
    var viewId = parts[0];
    if (!KOS.views[viewId]) return null;
    var dec = DECODE[viewId];
    var arg;
    if (dec) {
      arg = dec(parts.slice(1));
      if (arg === null) arg = undefined;
    }
    if ((viewId === "subject" || viewId === "ref") && arg) {
      var sid = viewId === "subject" ? arg : arg.subject;
      if (!window.KOS_DATA || !window.KOS_DATA[sid]) return null;
    }
    if (viewId === "ref" && !arg) return null;      /* a ref without identity is not a page */
    return { viewId: viewId, arg: arg };
  }

  /* ---- history bookkeeping ----
     The browser will not tell us how deep we are, so we stamp every entry
     we create with our own index and mirror it. depth/maxDepth is what the
     topbar arrows read; it is honest about a cold deep link (nothing
     behind us, so Back is disabled and the browser's own Back correctly
     leaves the app). */
  var depth = 0, maxDepth = 0, booted = false;
  var argMemo = Object.create(null);               /* idx -> {route, arg} */
  var lastRendered = null;

  function pushEntry(route, arg) {
    depth += 1; maxDepth = depth;
    argMemo[depth] = { route: route, arg: arg };
    /* forward entries are gone the moment a fresh navigation happens */
    Object.keys(argMemo).forEach(function (k) { if (+k > depth) delete argMemo[k]; });
    try { history.pushState({ kos: 1, idx: depth }, "", route); }
    catch (e) { location.hash = route.replace(/^#/, ""); }
  }
  function replaceEntry(route, arg) {
    argMemo[depth] = { route: route, arg: arg };
    try { history.replaceState({ kos: 1, idx: depth }, "", route); }
    catch (e) { try { location.replace(route); } catch (e2) { /* file:// with no history API */ } }
  }

  function updateArrows() {
    var b = document.getElementById("nav-back");
    if (b) b.disabled = depth <= 0;
    var f = document.getElementById("nav-fwd");
    if (f) f.disabled = depth >= maxDepth;
  }

  /* ---- KOS.show, wrapped ----
     ui.js keeps rendering; the router only decides what happens to the URL
     and the history stack afterwards. Wrapping rather than editing keeps
     the rendering contract (rail state, subnav, scroll reset, menu close)
     in exactly one place. */
  var innerShow = KOS.show;
  var suspend = false;                             /* true while rendering a popstate */

  KOS.show = function (viewId, arg, opts) {
    opts = opts || {};
    innerShow(viewId, arg, opts);
    var route = routeFor(viewId, arg);
    if (!suspend && booted) {
      if (opts._nav) {
        /* an in-place redraw or a history traversal: never a new entry.
           The URL is corrected only if the redraw genuinely changed route. */
        if (route !== lastRendered) replaceEntry(route, arg);
      } else {
        pushEntry(route, arg);
      }
    }
    lastRendered = route;
    updateArrows();
    /* A real navigation moves focus into the new page and names it; a
       redraw (`_nav` with no route change) must not disturb the reader.
       KOS.rerender passes _nav, so a cloud pull is silent by construction. */
    if (!opts._quiet && (!opts._nav || opts._route) && KOS.a11y) KOS.a11y.focusView(viewId);
  };

  /* ---- the topbar arrows delegate to the browser ---- */
  KOS.back = function () { if (depth > 0) history.back(); };
  KOS.forward = function () { if (depth < maxDepth) history.forward(); };
  KOS.canBack = function () { return depth > 0; };
  KOS.canForward = function () { return depth < maxDepth; };

  function renderRoute(r, idx) {
    suspend = true;
    var arg = r.arg;
    /* prefer the remembered argument when this history entry is one of
       ours and still points at the same route — it carries the parts a URL
       deliberately does not (a Focus assignment link, a stats filter) */
    var memo = idx != null ? argMemo[idx] : null;
    var route = routeFor(r.viewId, r.arg);
    if (memo && memo.route === route && memo.arg !== undefined) arg = memo.arg;
    try {
      KOS.show(r.viewId, arg, { _nav: true, _route: true });
    } catch (e) {
      suspend = false;
      home("A page could not be opened.");
      return;
    }
    suspend = false;
    lastRendered = route;
    updateArrows();
  }

  function home(why) {
    suspend = true;
    try { KOS.show("home", undefined, { _nav: true, _route: true }); } catch (e) { /* nothing left to do */ }
    suspend = false;
    lastRendered = "#/home";
    replaceEntry("#/home", undefined);
    updateArrows();
    if (why && KOS.ui) KOS.ui.toast(why, true);
  }

  function onPop(e) {
    var st = e && e.state;
    var idx = st && st.kos ? st.idx : null;
    if (idx != null) depth = idx;
    else {
      /* an entry we did not create (a manual hash edit, or the entry the
         page was loaded on) — treat it as the floor rather than guessing */
      depth = Math.max(0, Math.min(depth, maxDepth));
    }
    var r = parse(location.hash);
    if (!r) { home(); return; }
    if (routeFor(r.viewId, r.arg) === lastRendered && idx != null) { updateArrows(); return; }
    renderRoute(r, idx);
  }

  window.addEventListener("popstate", onPop);
  /* hashchange is the belt to popstate's braces: a hand-edited address bar
     and the file:// fallback path above both arrive here and nowhere else */
  window.addEventListener("hashchange", function () {
    if (suspend) return;
    if (parse(location.hash) && routeFor(parse(location.hash).viewId, parse(location.hash).arg) === lastRendered) return;
    onPop({ state: history.state });
  });

  /* ---- boot ----
     A URL wins over the stored last view: a deep link, a bookmark, a
     refresh and a PWA launch all mean "open this". With no hash we keep
     the app's existing behaviour (restore where the user was) and stamp
     the resulting route onto the current entry so the first Back is
     already inside the app. */
  KOS.router = {
    routeFor: routeFor,
    parse: parse,
    depth: function () { return depth; },
    maxDepth: function () { return maxDepth; },
    boot: function () {
      booted = true;
      var r = parse(location.hash);
      if (!r) {
        var ui = KOS.store.state.ui;
        var view = ui.view || "home";
        if (view === "ref") {
          var sid = ui.subject, ref = ui.lastRef && ui.lastRef[sid];
          r = sid && ref && window.KOS_DATA[sid] ? { viewId: "ref", arg: { subject: sid, ref: ref } } : { viewId: "home" };
        } else if (view === "subject") {
          r = { viewId: "subject", arg: ui.subject || "compsci" };
        } else if (KOS.views[view]) {
          r = { viewId: view };
        } else {
          r = { viewId: "home" };
        }
      }
      suspend = true;
      try { KOS.show(r.viewId, r.arg, { _nav: true, _route: true, _quiet: true }); }
      catch (e) { KOS.show("home", undefined, { _nav: true, _quiet: true }); r = { viewId: "home" }; }
      suspend = false;
      lastRendered = routeFor(r.viewId, r.arg);
      replaceEntry(lastRendered, r.arg);
      updateArrows();
    }
  };
})();
