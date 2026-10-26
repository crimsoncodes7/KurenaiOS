/* Kurenai OS — modules/inkset.js · KOS.views.pen
   Settings › Pen and ink (design 30s), under Archive (`#/pen`). It says
   what the app saw of the pen (✓ Working, ○ Not seen since…, — No pen
   yet) and keeps the choices that change behaviour: drawing with a
   finger, the toolbar docked or floating, Kurenai reading handwriting
   when asked (decision E, off), ink sync (30p) and the storage ink uses.

   Nothing about the pen is synced: it is per device (state.ui.ink,
   state.ui.inkRead), like state.ui. Storage is reported, never compressed
   or removed without a confirm (invariant 49).                          */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  function el() { return KOS.ui.el.apply(null, arguments); }
  function ago(ts) {
    if (!ts) return "";
    var m = Math.round((Date.now() - ts) / 60000);
    if (m < 2) return "just now";
    if (m < 60) return m + " minutes ago";
    var h = Math.round(m / 60);
    if (h < 36) return h + (h === 1 ? " hour ago" : " hours ago");
    return new Date(ts).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }
  function bytes(n) { return n >= 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }

  /* "Kurenai reads handwriting when asked" (decision E): per device, off.
     Mark with Kurenai, Check my working and Compare with Kurenai show only
     while it is on; each still asks per press and shows what is sent. */
  function readsHandwriting() { return KOS.store.state.ui.inkRead === true; }

  function switchRow(label, sub, on, hook, onChange, disabled) {
    var sw = el("input", { type: "checkbox", role: "switch", class: "k-switch", "data-ui": hook, "aria-label": label });
    sw.checked = !!on;
    sw.disabled = !!disabled;
    sw.addEventListener("change", function () { onChange(sw.checked); });
    return el("label", { class: "k-pen-row" }, [
      el("span", { class: "k-pen-row-t" }, [el("strong", { text: label }), sub ? el("span", { class: "k-pen-row-s", text: sub }) : null].filter(Boolean)), sw]);
  }

  KOS.views.pen = function (main) {
    main.appendChild(KOS.ui.pageHeader({ kicker: "Settings · 筆", title: "Pen and ink", sub: "What this device saw of your pen, and the choices that change how ink behaves." }));
    var p = KOS.inkUI.prefs();
    var grid = el("div", { class: "k-pen-grid", "data-ui": "pen.page" });
    main.appendChild(grid);

    /* the pen */
    var seen = p.penSeen, quiet = seen && Date.now() - seen > 3 * 864e5;
    var mark = !seen ? "—" : quiet ? "○" : "✓";
    var state = !seen ? "No pen yet" : quiet ? "Not seen since " + ago(seen) : "Working";
    var pen = el("section", { class: "k-card k-pen-card", "aria-label": "Your pen", "data-ui": "pen.card" }, [
      el("div", { class: "k-card-title", text: "Your pen" }),
      el("div", { class: "k-pen-status" }, [
        el("span", { class: "k-pen-mark", "data-tone": !seen ? null : quiet ? "warn" : "ok", "aria-hidden": "true", text: mark }),
        el("div", {}, [el("strong", { "data-ui": "pen.status", text: state }),
          el("p", { class: "k-pen-row-s", text: !seen ? "Write on any Handwritten tab to check it. The pen is found from its first stroke; there is no pairing step."
            : "Last stroke " + ago(seen) + ". " + (p.pressure ? "It reports pressure, so the width follows it." : "It reports no pressure, so the width follows your speed and tilt.") })])
      ]),
      switchRow("Draw with a finger", "Off: only the pen writes; a finger scrolls, two pinch, a two-finger tap undoes.", p.finger, "pen.finger", function (on) {
        p.finger = on; KOS.store.save(); KOS.a11y.announce(on ? "A finger draws." : "Only the pen draws.");
      }),
      switchRow("Floating tools", "Off: the toolbar docks on the page's top edge. Under 700 it always floats, in one row.", p.dock === "float", "pen.float", function (on) {
        p.dock = on ? "float" : "dock"; KOS.store.save();
      })
    ]);
    grid.appendChild(pen);

    /* the iPad as a desk (6.9) */
    grid.appendChild(el("section", { class: "k-card k-pen-card", "aria-label": "On this device", "data-ui": "pen.device" }, [
      el("div", { class: "k-card-title", text: "On this device" }),
      switchRow("Keep the screen on during Focus", "While a session's clock runs and Kurenai is in front. Paused or ended, the screen sleeps as usual.",
        KOS.store.state.ui.focusWake !== false, "pen.wake", function (on) { KOS.store.state.ui.focusWake = on; KOS.store.save(); if (KOS.desk) KOS.desk.syncWake(); }),
      el("p", { class: "k-pen-row-s", text: "With a keyboard attached, hold ⌘ to see the shortcuts." })
    ]));

    /* Kurenai and handwriting */
    grid.appendChild(el("section", { class: "k-card k-pen-card", "aria-label": "Kurenai and handwriting", "data-ui": "pen.ai" }, [
      el("div", { class: "k-card-title", text: "Kurenai and handwriting" }),
      switchRow("Kurenai reads handwriting when asked", "Shows Mark with Kurenai, Check my working and Compare with Kurenai. Each press shows exactly what is sent first and makes one request; Kurenai only suggests.",
        readsHandwriting(), "pen.ai-read", function (on) { KOS.store.state.ui.inkRead = on; KOS.store.save(); }),
      el("p", { class: "k-pen-row-s", text: "Handwriting is never read on its own, never searched in the background, and never used to rate a card." })
    ]));

    /* sync */
    var syncCard = el("section", { class: "k-card k-pen-card", "aria-label": "Ink sync", "data-ui": "pen.sync" }, [el("div", { class: "k-card-title", text: "Ink sync" })]);
    var signed = KOS.cloud && KOS.cloud.signedIn && KOS.cloud.signedIn();
    if (!signed) syncCard.appendChild(el("p", { class: "k-pen-row-s", text: "Signed out of cloud sync: ink lives on this device and in the full backup." }));
    else {
      syncCard.appendChild(el("p", { class: "k-pen-row-s", text: "Every page replicates a stroke at a time to your own account. Two devices writing on one page merge; only a real clash asks, and keeping both is always offered. Papers kept \"this device only\" never leave." }));
      var row = el("div", { class: "k-pen-actions" }, [KOS.inkSync.chip("")]);
      row.appendChild(el("button", { type: "button", class: "k-btn k-btn--sm", "data-ui": "pen.sync-now", text: "Sync now", onclick: function (e) {
        var b = e.currentTarget; b.disabled = true;
        KOS.inkSync.syncCloud(function (err, out) {
          b.disabled = false;
          KOS.ui.toast(err ? "Ink sync failed — " + err.message : out && out.skipped ? "Ink sync is busy; try again in a moment." : "Ink synced.", !!err);
        });
      } }));
      syncCard.appendChild(row);
    }
    grid.appendChild(syncCard);

    /* storage */
    var store = el("section", { class: "k-card k-pen-card", "aria-label": "Storage", "data-ui": "pen.storage" }, [el("div", { class: "k-card-title", text: "Storage" })]);
    var used = el("p", { class: "k-pen-row-s", text: "Measuring…" });
    store.appendChild(used);
    grid.appendChild(store);
    KOS.ink.ready(function () {
      KOS.ink.exportAll(function (err, dump) {
        if (err || !dump) { used.textContent = "Ink storage is not available in this browser."; return; }
        var n = JSON.stringify(dump).length, docs = (dump.docs || []).length, pages = (dump.pages || []).filter(function (x) { return (x.items || []).length; }).length;
        used.textContent = pages ? pages + (pages === 1 ? " page" : " pages") + " in " + docs + (docs === 1 ? " notebook" : " notebooks") + " · " + bytes(n) + " of ink on this device." : "Nothing written yet.";
        if (navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(function (e) {
          if (e && e.quota && e.usage / e.quota > 0.85) store.appendChild(el("p", { class: "k-pen-warn", "data-tone": "danger", text: "Storage is nearly full (" + Math.round(100 * e.usage / e.quota) + "%). Ink keeps saving while there is room; export a notebook to keep a copy." }));
        });
      });
    });
  };

  KOS.inkSettings = { readsHandwriting: readsHandwriting };
})();
