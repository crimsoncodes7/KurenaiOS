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

  /* ---- Behavioural Governor boot sequence (Build 2a) ----
     seed sample calendar, apply HP day-tick, wrap the gated lab views (they
     are all registered by now), paint the HUD, then fire deadline reminders */
  KOS.calendar.seedSamples();
  KOS.governor.tick();
  KOS.governor.applyCosmetics();
  KOS.governor.installGates();
  KOS.refreshHUD();
  setTimeout(function () { KOS.calendar.checkReminders(); }, 900);
  /* re-check reminders + HP drift every 30 min while the app stays open */
  setInterval(function () {
    KOS.governor.tick();
    KOS.calendar.checkReminders();
    KOS.refreshHUD();
    KOS.refreshRailCounters();
  }, 30 * 60 * 1000);

  /* ---- one-time vault repair (Build 3h) ----
     The VNDB duplication bug (vndbId was read from a field the live API
     never returns, so every re-sync inserted the whole list fresh) left
     real duplicates behind. Run the merge pass once per vault, flag-gated
     in the media kv store; the stored report shows on Sync & Import. The
     pass is conservative — only unambiguous same-id / same-title-one-id
     clusters merge, manual data is unioned — and re-runnable by hand. */
  if (KOS.mediadb.available()) {
    /* delayed so boot never contends with the app's own first DB open;
       gated on a VNDB sync ever having run — the only path that produced
       the damage. The Sync & Import button covers every module by hand. */
    setTimeout(function () {
      KOS.mediadb.getKV("vndb.lastSync", function (e0, everSynced) {
        if (e0 || !everSynced) return;
        KOS.mediadb.getKV("maint.dedupe3h", function (err, done) {
          if (err || done) return;
          KOS.media.dedupeVault("vn", function (e2, rep) {
            if (e2 || !rep) return;   // fails soft; the manual button remains
            KOS.mediadb.setKV("maint.dedupe3h", { ts: Date.now(), removed: rep.removed, titles: rep.titles }, function () {});
            if (rep.removed) {
              KOS.ui.toast("Vault repair: merged " + rep.titles.length + " duplicated VN title" + (rep.titles.length === 1 ? "" : "s") +
                " (" + rep.removed + " redundant row" + (rep.removed === 1 ? "" : "s") + " removed, manual data kept) — details on Sync & Import.");
            }
          });
        });
      });
    }, 4000);
  }

  /* ---- autonomous two-way sync (Build 3j) ----
     Pulls AniList/VNDB on a paced loop + on reconnect, so updates made
     elsewhere (mal-sync) land here by themselves; local edits already
     push automatically via mediapush. First cycle fires 8 s after boot,
     clear of the dedupe pass above. Toggle lives on Sync & Import. */
  if (KOS.autosync) KOS.autosync.start();

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
