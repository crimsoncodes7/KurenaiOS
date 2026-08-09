/* Kurenai OS — core/a11y.js
   Category 7 Phase F: the announcement and interaction-semantics layer.

   Three things live here, and nothing else:

   1. LIVE REGIONS. The app had exactly one, `#toast`, which is also the
      visible toast — so a screen reader heard whatever the toast happened
      to say and nothing else. Saves, validation failures, sync transitions
      and destructive-action results were all silent. `announce()` is now
      the ONE way anything reaches a live region, so the noisy cases can be
      filtered at their source rather than by muting the region.

      The visible UI stays the source of truth; the region MIRRORS it. That
      is why `#toast` loses its own aria-live: two regions carrying the same
      sentence is a stutter, not redundancy.

   2. `activate(node, fn)`. Ten call sites wrote `role="button"` with an
      Enter-only keydown handler. `role="button"` promises Space as well —
      a keyboard user who presses Space on a card scrolled the page instead
      of opening it. One helper, both keys, and Space's default scroll
      suppressed.

   3. VIEW-CHANGE FOCUS. `KOS.show` does `main.innerHTML = ""`, which drops
      focus onto `<body>`: after any navigation the next Tab restarted from
      the top of the document, walking the whole chrome again. Focus now
      moves to `#main` on a real navigation — and deliberately NOT on a
      cloud-driven redraw, which must not move the reader at all.        */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  /* ---------------- live regions ---------------- */
  var politeEl = null, assertiveEl = null, clearTimer = null;
  var lastMsg = "", lastAt = 0;

  function region(id, live, roleName) {
    var n = document.getElementById(id);
    if (n) return n;
    n = document.createElement("div");
    n.id = id;
    n.className = "sr-only";
    n.setAttribute("aria-live", live);
    n.setAttribute("aria-atomic", "true");
    if (roleName) n.setAttribute("role", roleName);
    if (document.body) document.body.appendChild(n);
    return n;
  }

  function ensure() {
    if (!politeEl || !document.body.contains(politeEl)) politeEl = region("kos-live-polite", "polite", "status");
    if (!assertiveEl || !document.body.contains(assertiveEl)) assertiveEl = region("kos-live-assertive", "assertive", "alert");
  }

  /* Announce a state change. `assertive` interrupts — reserve it for
     something the user must act on (an error, a failed save), never for a
     confirmation. Identical text announced twice in a row is a genuine
     repeat (two saves, two failures), so the region is cleared first and
     refilled on the next frame; without that, setting the same string is a
     no-op and the second event is silent. */
  function announce(msg, opts) {
    msg = String(msg == null ? "" : msg).trim();
    if (!msg) return;
    opts = opts || {};
    /* the same sentence inside 400ms is one event reported twice (a toast
       plus its own caller), not two events */
    var now = Date.now();
    if (msg === lastMsg && now - lastAt < 400) return;
    lastMsg = msg; lastAt = now;
    ensure();
    var target = opts.assertive ? assertiveEl : politeEl;
    target.textContent = "";
    clearTimeout(clearTimer);
    clearTimer = setTimeout(function () { target.textContent = msg; }, 40);
  }

  /* ---------------- role="button" activation ----------------
     A native <button> is always preferable and F1 says so; these remain
     because the node is a CARD that legitimately contains other controls,
     where a real <button> would be invalid (a button may not contain a
     select). Where the node carries no interactive descendants it has been
     converted to a real button instead — see medview/anime/books/vn/games. */
  function activate(node, fn) {
    node.addEventListener("click", fn);
    node.addEventListener("keydown", function (e) {
      if (e.target !== node) return;               /* a nested control owns its own keys */
      if (e.key !== "Enter" && e.key !== " " && e.key !== "Spacebar") return;
      e.preventDefault();                          /* Space would scroll the page */
      fn(e);
    });
    return node;
  }

  /* ---------------- view-change focus ----------------
     Called by KOS.show for a real navigation only. Never fires for
     KOS.rerender (the cloud-pull redraw), which must leave the reader
     exactly where they were, and never while a dialog owns focus. */
  function focusView(viewId) {
    var main = document.getElementById("main");
    if (!main) return;
    if (KOS.ui && KOS.ui.topDialog && KOS.ui.topDialog()) return;
    try { main.focus({ preventScroll: true }); } catch (e) { try { main.focus(); } catch (e2) { /* jsdom */ } }
    /* the page's own <h1> is the honest name for it; the view id is a
       fallback so a view that has not been through pageHeader still says
       something rather than nothing */
    var h = main.querySelector("h1");
    var name = h && h.textContent.trim() ? h.textContent.trim() : String(viewId || "");
    if (name) announce(name, {});
  }

  KOS.a11y = {
    announce: announce,
    activate: activate,
    focusView: focusView,
    /* exposed for the smoke suite and for anything that needs to read back
       what was last said */
    _regions: function () { ensure(); return { polite: politeEl, assertive: assertiveEl }; }
  };

  if (document.body) ensure();
  else document.addEventListener("DOMContentLoaded", ensure);
})();
