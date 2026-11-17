/* Kurenai OS — js/modules/welcome.js · the first open (design turn 41, decision B8)

   A new device that is pristine (no data of the user's, invariant 34's
   KOS.cloudsync.userData) and signed out, with cloud sync set up, opens on
   ONE screen: the mark, a line, "Sign in to bring your data" (the existing
   email and password sign-in, in place) and "Start fresh", with the theme
   swatches live underneath. Signing in shows the account's copy arriving
   ("Bringing your data") and opens Home once this page load holds it
   (KOS.cloudsync.settled); there is no choice to make, the device is empty
   (invariant 34). Start fresh answers it for this device: Home then shows
   three first steps where Routines and Reminders go later.

   The answer is per device (state.ui.welcomed). Until it is given the plan's
   carry-over notice waits (KOS.pacing's rollover reads `pending`). A device
   that has never synced and is signed out shows one quiet header chip,
   "Not synced · Sign in", which opens the same sign-in; it goes once a sync
   has run (state.ui.everSynced) or with Account & Cloud Sync's "Use this
   device only" (state.ui.localOnly). A review namespace never welcomes. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el, store = KOS.store;

  function ui() { return store.state.ui; }
  function cloudReady() { return !!(KOS.cloud && KOS.cloud.configured && KOS.cloud.configured() && KOS.cloud.available && KOS.cloud.available()); }
  function signedIn() { return !!(KOS.cloud && KOS.cloud.userId && KOS.cloud.userId()); }
  /* nothing of the user's on this device (invariant 34's one definition) —
     badges aside: a new device's first sweep can earn one from what the app
     derives by itself (the weekly reports backfilled from the shipped plan) */
  function pristine() {
    if (!(KOS.cloudsync && KOS.cloudsync.userData)) return false;
    /* and the theme chosen on this very screen is not the user's data either */
    var g = Object.assign({}, store.state.governor || {}, { theme: "kurenai", themeFollow: false });
    return !KOS.cloudsync.userData(Object.assign({}, store.state, { achievements: null, governor: g }));
  }
  function review() { return !!(KOS.dataMode && KOS.dataMode.mode); }

  /* the welcome is owed on this device (a read) */
  function pending() {
    return cloudReady() && !review() && !signedIn() && !ui().welcomed && !ui().localOnly && pristine();
  }
  /* Start fresh's Home: the three first steps, while the device is still
     pristine after that answer */
  function firstSteps() { return ui().welcomed === "fresh" && pristine(); }
  /* the header chip says "Not synced · Sign in" */
  function neverSynced() { return cloudReady() && !review() && !signedIn() && !ui().everSynced && !ui().localOnly; }

  function answer(how) {
    ui().welcomed = how;
    store.save();
    if (KOS.pacing && KOS.pacing.noteRollover) { try { KOS.pacing.noteRollover(); } catch (e) {} }
  }

  /* ---------------- the theme swatches: each draws its own theme ---------------- */
  var THEMES = [["atelier-dusk", "Graphite"], ["atelier-dawn", "Dawn"]];
  function themeRow(onChange) {
    var g = store.state.governor || {};
    var chosen = g.theme === "atelier-dawn" ? "atelier-dawn" : "atelier-dusk";
    var row = el("div", { class: "k-wel-themes", role: "group", "aria-label": "Theme" });
    THEMES.forEach(function (t) {
      var on = chosen === t[0];
      row.appendChild(el("button", { type: "button", class: "k-wel-theme", "data-ui": "welcome.theme", "data-theme-id": t[0], "aria-pressed": on ? "true" : "false",
        "aria-label": t[1] + (on ? " — chosen" : ""), onclick: function () { KOS.governor.setTheme(t[0]); onChange(); } }, [
        el("span", { class: "k-wel-theme-art", "data-theme": t[0], "aria-hidden": "true" }, [el("i"), el("b"), el("em")]),
        el("span", { class: "k-wel-theme-n" }, [t[1], on ? el("span", { "aria-hidden": "true", text: " ✓" }) : null].filter(Boolean))
      ]));
    });
    var follow = el("input", { type: "checkbox", class: "k-switch", "data-ui": "welcome.follow", "aria-label": "Follow the system" });
    follow.checked = !!(KOS.governor.themeFollow && KOS.governor.themeFollow());
    follow.addEventListener("change", function () { KOS.governor.setThemeFollow(follow.checked); onChange(); });
    row.appendChild(el("label", { class: "k-wel-follow" }, [follow, el("span", { text: "Follow the system" })]));
    return row;
  }

  /* ---------------- the screen ---------------- */
  var open_ = null;
  function open(mode) {
    if (open_) return open_;
    var overlay = el("div", { class: "k-dialog-overlay k-wel-overlay", "data-ui": "welcome.overlay" });
    var box = el("div", { class: "k-dialog k-wel", "data-ui": "welcome.screen", "data-dialog-box": "" });
    overlay.appendChild(box);
    var timer = null, closed = false;
    function close() {
      if (closed) return;
      closed = true; open_ = null;
      clearInterval(timer);
      overlay.remove();
    }
    overlay.close = close;

    var head = el("div", { class: "k-wel-head" }, [
      el("img", { class: "k-wel-mark", src: "assets/brand/kurenai-bloom.png", alt: "", width: "56", height: "56" }),
      el("h1", { class: "k-wel-name", "data-ui": "ui.dialog-title", text: "Kurenai" }),
      el("p", { class: "k-wel-line", text: "Study, routines and your collection, in one place." })
    ]);
    var acts = el("div", { class: "k-wel-acts" });
    var foot = el("div", { class: "k-wel-foot" });
    box.appendChild(head); box.appendChild(acts); box.appendChild(foot);

    function paintTheme() {
      foot.innerHTML = "";
      foot.appendChild(el("div", { class: "k-wel-foot-h" }, [el("span", { class: "k-kicker", text: "Theme" }), el("span", { class: "k-muted", text: "change it any time" })]));
      foot.appendChild(themeRow(paintTheme));
    }

    function choose() {
      acts.innerHTML = "";
      var signBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "welcome.sign-in", text: "Sign in to bring your data", onclick: signInForm });
      acts.appendChild(signBtn);
      acts.appendChild(el("button", { type: "button", class: "k-btn", "data-ui": "welcome.fresh", text: "Start fresh", onclick: function () {
        answer("fresh"); close(); KOS.show("home");
      } }));
      return signBtn;
    }

    /* the existing sign-in, in place of the two buttons */
    function signInForm() {
      acts.innerHTML = "";
      var email = el("input", { type: "email", class: "k-input", "data-ui": "welcome.email", "aria-label": "Email address", placeholder: "Email", autocomplete: "username" });
      var pw = el("input", { type: "password", class: "k-input", "data-ui": "welcome.password", "aria-label": "Password", placeholder: "Password", autocomplete: "current-password" });
      var msgId = "wel-msg-" + Date.now();
      var msg = el("p", { class: "k-wel-msg", id: msgId, role: "status", "data-ui": "welcome.msg" });
      email.setAttribute("aria-describedby", msgId); pw.setAttribute("aria-describedby", msgId);
      var go = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", "data-ui": "welcome.submit", text: "Sign in", onclick: submit });
      function submit() {
        var e = email.value.trim(), p = pw.value;
        if (!e || !p) {
          msg.textContent = "Enter both an email address and a password.";
          email.setAttribute("aria-invalid", String(!e)); pw.setAttribute("aria-invalid", String(!p));
          (!e ? email : pw).focus();
          return;
        }
        go.disabled = true; msg.textContent = "Signing in…";
        KOS.cloud.signIn(e, p, function (err) {
          go.disabled = false;
          if (err) { msg.textContent = err.message; return; }
          arriving(e);
        });
      }
      pw.addEventListener("keydown", function (ev) { if (ev.key === "Enter") submit(); });
      acts.appendChild(el("div", { class: "k-wel-form" }, [
        el("label", { class: "k-wel-field" }, [el("span", { text: "Email" }), email]),
        el("label", { class: "k-wel-field" }, [el("span", { text: "Password" }), pw]),
        msg,
        el("div", { class: "k-wel-form-acts" }, [go,
          mode === "signin" ? null : el("button", { type: "button", class: "k-btn k-btn--quiet", "data-ui": "welcome.back", text: "‹ Back", onclick: function () { choose().focus(); } })].filter(Boolean))
      ]));
      email.focus();
    }

    /* ---------------- the account's copy arriving (41b) ---------------- */
    function count(n, one, many) { return KOS.ui.num(n) + " " + (n === 1 ? one : many); }
    function arriving(email) {
      answer("signin");
      head.querySelector(".k-wel-name").textContent = "Bringing your data";
      head.querySelector(".k-wel-line").textContent = maskEmail(email) + " · this takes a moment once";
      acts.innerHTML = ""; foot.innerHTML = "";
      var list = el("ul", { class: "k-wel-steps", "data-ui": "welcome.arriving" });
      var note = el("p", { class: "k-wel-note", text: "Pictures and files keep arriving after Home opens." });
      acts.appendChild(list); acts.appendChild(note);
      var started = Date.now(), media = null;
      function paint() {
        var done = !!(KOS.cloudsync && KOS.cloudsync.settled && KOS.cloudsync.settled());
        var s = store.state, topics = Object.keys(s.progress || {}).length, cards = Object.keys(s.srs || {}).length;
        var rows = [
          ["Your study", done ? count(topics, "topic", "topics") + " · " + count(cards, "card", "cards") : "on its way"],
          ["Collection", media == null ? "on its way" : count(media, "title", "titles")],
          ["Sessions and routines", done ? count((s.sessions || []).length, "entry", "entries") : "on its way"]
        ];
        list.innerHTML = "";
        rows.forEach(function (r, i) {
          var ok = i === 1 ? media != null : done;
          list.appendChild(el("li", { class: "k-wel-step", "data-state": ok ? "done" : "busy" }, [
            el("span", { class: "k-wel-step-mark", "aria-hidden": "true", text: ok ? "✓" : "" }),
            el("b", { text: r[0] }), el("span", { class: "k-muted", text: r[1] })
          ]));
        });
        if (done && KOS.mediadb && KOS.mediadb.count && media == null) {
          try { KOS.mediadb.count(null, function (err, n) { media = err ? 0 : n || 0; paint(); }); } catch (e) { media = 0; }
        }
        if (done && media != null) {
          clearInterval(timer);
          setTimeout(function () { close(); KOS.show("home"); }, 700);
        } else if (Date.now() - started > 60000 && !box.querySelector("[data-ui~='welcome.home']")) {
          note.textContent = "Still bringing your data — Home can open now; the rest arrives in the background.";
          acts.appendChild(el("button", { type: "button", class: "k-btn", "data-ui": "welcome.home", text: "Go to Home", onclick: function () { close(); KOS.show("home"); } }));
        }
      }
      paint();
      timer = setInterval(paint, 500);
    }

    var first;
    if (mode === "signin") { paintTheme(); KOS.ui.openDialog(overlay, { label: "Sign in", escape: true, persist: true }); signInForm(); }
    else {
      first = choose(); paintTheme();
      /* Escape leaves it unanswered: it comes back on the next open. It is
         about the device, not a page: the boot's first page draw (a real
         navigation, invariant 166) must not close it */
      KOS.ui.openDialog(overlay, { label: "Welcome to Kurenai", initialFocus: first, persist: true });
    }
    open_ = overlay;
    return overlay;
  }
  function maskEmail(e) {
    var p = String(e || "").split("@");
    return p.length === 2 ? p[0].slice(0, Math.min(7, p[0].length)) + "…" : String(e || "");
  }

  /* opened at boot once this page load knows it is signed out (the session
     is restored asynchronously), never over a deep link's dialog */
  function maybeOpen() {
    /* js/env.local.js and the sync library load `defer`, after main.js:
       look once they are in (production's first look, made before, found
       cloud sync not even configured and gave up) */
    if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", maybeOpen, { once: true }); return; }
    var tries = 0;
    (function wait() {
      /* the session is restored a moment later: keep looking for 15 s
         while cloud sync is set up */
      if (!pending()) { if (++tries < 30 && !review() && KOS.cloud && KOS.cloud.configured && KOS.cloud.configured()) setTimeout(wait, 500); return; }
      if (KOS.cloudsync && KOS.cloudsync.settled && !KOS.cloudsync.settled() && ++tries < 20) { setTimeout(wait, 500); return; }
      if (KOS.ui.topDialog && KOS.ui.topDialog()) { if (++tries < 40) setTimeout(wait, 1000); return; }
      open();
    })();
  }

  KOS.welcome = { pending: pending, firstSteps: firstSteps, neverSynced: neverSynced, open: open, maybeOpen: maybeOpen, answer: answer };
})();
