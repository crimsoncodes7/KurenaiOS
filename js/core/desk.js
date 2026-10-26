/* Kurenai OS — core/desk.js · KOS.desk
   The iPad as a study desk (roadmap 6.9):

   - KEEP THE SCREEN ON while a Focus session runs (the Screen Wake Lock
     API, which Safari has): per device, state.ui.focusWake, on by default.
     The lock is asked for only while the clock is RUNNING and the page is
     in front, and let go on a pause, the end or the page going away;
     browsers drop it on hide, so it is asked for again on return.
   - HOLD ⌘ (a Magic Keyboard) and the shortcuts are listed over the page,
     as iPad apps do; letting go hides them.

   Neither writes anything to the synced state.                           */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  function el() { return KOS.ui.el.apply(null, arguments); }

  /* ---------- the wake lock ---------- */
  var lock = null, asking = false;
  function wanted() {
    return KOS.store.state.ui.focusWake !== false && KOS.focus && KOS.focus.state && KOS.focus.state() === "running" &&
      document.visibilityState === "visible";
  }
  function sync() {
    if (!navigator.wakeLock || !navigator.wakeLock.request) return;
    if (wanted()) {
      if (lock || asking) return;
      asking = true;
      navigator.wakeLock.request("screen").then(function (l) {
        asking = false; lock = l;
        l.addEventListener("release", function () { if (lock === l) lock = null; });
      }, function () { asking = false; });
    } else if (lock) { var l = lock; lock = null; l.release().catch(function () {}); }
  }
  setInterval(sync, 4000);
  document.addEventListener("visibilitychange", sync);

  /* ---------- hold ⌘ for the shortcuts ---------- */
  var SHORTCUTS = [
    ["Anywhere", [["/", "Search"], ["⌥←  ⌥→", "Back and forward"]]],
    ["Ink", [["P · H · E", "Pen, highlighter, eraser"], ["L · S · R · T", "Lasso, shape, ruler, text"], ["⌘Z  ⇧⌘Z", "Undo, redo"], ["⌘V", "Paste a picture"]]],
    ["A PDF", [["Page Up / Down", "Turn the page"], ["Esc", "Close the viewer"]]],
    ["Flashcards", [["Space", "Flip"], ["1 – 4", "Again → Easy"]]]
  ];
  var keysEl = null, holdT = null;
  function show() {
    if (keysEl) return;
    /* a passive list while ⌘ is held, not a dialog: it takes no focus */
    keysEl = el("aside", { class: "k-desk-keys", "data-ui": "desk.shortcuts", role: "note", "aria-label": "Keyboard shortcuts" },
      SHORTCUTS.map(function (g) {
        return el("section", { class: "k-desk-keys-g" }, [el("h3", { class: "k-kicker", text: g[0] })].concat(g[1].map(function (k) {
          return el("div", { class: "k-desk-keys-row" }, [el("kbd", { class: "k-mono", text: k[0] }), el("span", { text: k[1] })]);
        })));
      }));
    document.body.appendChild(keysEl);
  }
  function hide() { clearTimeout(holdT); if (keysEl) { keysEl.remove(); keysEl = null; } }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Meta" && !e.repeat) { clearTimeout(holdT); holdT = setTimeout(show, 700); return; }
    hide();
  }, true);
  document.addEventListener("keyup", function (e) { if (e.key === "Meta") hide(); }, true);
  window.addEventListener("blur", hide);

  KOS.desk = { syncWake: sync, wakeHeld: function () { return !!lock; } };
})();
