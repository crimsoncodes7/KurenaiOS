/* Kurenai OS — main.js: wire the rail, boot to the last view. */
(function () {
  "use strict";
  document.querySelectorAll(".rail-item").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var v = btn.dataset.view;
      KOS.show(v, v === "subject" ? btn.dataset.subject : undefined);
    });
  });

  /* back/forward navigation — topbar buttons + Alt+←/→ / Backspace (outside inputs) */
  var backBtn = document.getElementById("nav-back");
  if (backBtn) backBtn.addEventListener("click", function () { KOS.back(); });
  var fwdBtn = document.getElementById("nav-fwd");
  if (fwdBtn) fwdBtn.addEventListener("click", function () { KOS.forward(); });
  document.addEventListener("keydown", function (e) {
    var t = e.target, tag = t && t.tagName;
    var typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable);
    if (typing) return;
    if ((e.altKey && e.key === "ArrowLeft") || (!e.altKey && !e.metaKey && !e.ctrlKey && e.key === "Backspace")) {
      if (KOS.canBack && KOS.canBack()) { e.preventDefault(); KOS.back(); }
    } else if (e.altKey && e.key === "ArrowRight") {
      if (KOS.canForward && KOS.canForward()) { e.preventDefault(); KOS.forward(); }
    }
  });

  /* collapsible rail — persisted in ui.railOpen */
  var railBtn = document.getElementById("rail-toggle");
  function applyRail() {
    var open = KOS.store.state.ui.railOpen !== false;
    document.getElementById("cols").classList.toggle("rail-closed", !open);
    if (railBtn) {
      railBtn.textContent = open ? "‹" : "›";
      railBtn.setAttribute("aria-label", open ? "Collapse sidebar" : "Expand sidebar");
    }
  }
  if (railBtn) {
    railBtn.addEventListener("click", function () {
      KOS.store.state.ui.railOpen = !(KOS.store.state.ui.railOpen !== false);
      KOS.store.save();
      applyRail();
    });
  }
  applyRail();

  KOS.refreshRailCounters();
  var ui = KOS.store.state.ui;
  var view = ui.view || "home";
  if (view === "ref") {
    var sid = ui.subject, ref = ui.lastRef && ui.lastRef[sid];
    if (sid && ref) KOS.show("ref", { subject: sid, ref: ref });
    else KOS.show("home");
  } else if (view === "subject") {
    KOS.show("subject", ui.subject || "compsci");
  } else if (KOS.views[view]) {
    KOS.show(view);
  } else {
    KOS.show("home");
  }
})();
