/* Kurenai OS — modules/cloudui.js
   The cloud-sync surface (Build 4a): the persistent topbar status chip and
   the Account & Cloud Sync card on the Archive (Backup & Restore) view.

   Authentication gates CLOUD SYNC ONLY — nothing here ever blocks the app.
   The chip is subtle and always present once sync is configured; it shows
   real sync state (dirty units, in-flight cycle, errors with retry), never
   bare network connectivity. Nothing here ever asks which copy to keep:
   two devices' edits merge (core/cloudmerge.js) and the card only reports. Unconfigured
   installs hide the chip entirely and the Archive card explains the setup
   instead.                                                                 */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var el = KOS.ui.el;

  var LABELS = {
    unconfigured: "—",
    signedOut: "Signed out",
    offline: "Offline",
    syncing: "Syncing…",
    pending: "Changes pending",
    error: "Error — tap to retry",
    synced: "Synced"
  };

  /* ---------------- the topbar chip ---------------- */
  function wireChip() {
    var chip = document.getElementById("sync-status");
    if (!chip || !KOS.cloudsync) return;
    chip.addEventListener("click", function () {
      var s = KOS.cloudsync.getStatus();
      if (s.state === "error") {
        KOS.ui.toast("Cloud sync: " + (KOS.cloudsync.lastError() || "unknown error") + " — retrying…", true);
        KOS.cloudsync.retry();
      } else if (s.state === "signedOut") {
        KOS.show("data");
      } else {
        KOS.cloudsync.syncNow();
      }
    });
    /* ---- what the chip is allowed to SAY (Phase F, audit U-21/G-25) ----
       The chip's label changes on every cycle. Announcing each change made
       a screen reader recite "Syncing… / Synced / Changes pending" over
       whatever the user was actually doing — the audit's "a status that
       always says pending says nothing", made audible.

       Only two kinds of transition are worth interrupting for: entering a
       state that needs the user (an error, a decision, a sign-out), and
       LEAVING one — because "it recovered" is the answer to the question
       the first announcement raised. Ordinary syncing→synced→pending churn
       is silent; the chip is on screen for anyone who wants to look. */
    var ATTENTION = { error: 1, signedOut: 1 };
    var lastAnnounced = null;
    function announceState(s) {
      var prev = lastAnnounced;
      if (s.state === prev) return;
      var wasAttention = prev != null && ATTENTION[prev];
      lastAnnounced = s.state;
      if (ATTENTION[s.state]) {
        KOS.a11y.announce("Cloud sync: " + (LABELS[s.state] || s.state) +
          (s.detail ? " — " + s.detail : ""), { assertive: s.state === "error" });
      } else if (wasAttention && s.state === "synced") {
        KOS.a11y.announce("Cloud sync recovered — synced.");
      }
    }

    KOS.cloudsync.onStatus(function (s) {
      var localSave = document.querySelector("[data-ui~='archive.cloud']");
      if (s.state === "unconfigured") {
        chip.hidden = true;
        if (localSave) localSave.hidden = false;
        return;
      }
      chip.hidden = false;
      announceState(s);
      /* One persistence indicator at a time: once cloud status is meaningful,
         it replaces the redundant local "saved" label beside it. */
      if (localSave) localSave.hidden = true;
      /* the design draws the chip as a status dot: teal synced, amber
         in flight, red on error, muted when signed out or offline */
      chip.setAttribute("data-sync", { synced: "ok", syncing: "busy", pending: "busy", error: "error" }[s.state] || "idle");
      chip.textContent = LABELS[s.state] || s.state;
      chip.title = "Cloud sync — " + (LABELS[s.state] || s.state) +
        (s.detail ? ": " + s.detail : "") +
        (s.lastSyncAt ? " · last synced " + new Date(s.lastSyncAt).toLocaleTimeString("en-GB") : "") +
        " (click for details)";
      /* the visible word is the STATE; the button's name has to describe
         what pressing it does, which is not the same sentence */
      chip.setAttribute("aria-label", "Cloud sync: " + (LABELS[s.state] || s.state) + ". " +
        (s.state === "error" ? "Activate to retry."
          : s.state === "signedOut" ? "Activate to open Account and Cloud Sync."
          : "Activate to sync now."));
    });
  }

  /* ---------------- the Archive card (Graphite frame 14a) ----------------
     One card beside "Keep it safe": the account state as a chip, the
     facts the sync engine actually knows (status, last sync, the last
     merge with another device), and its three actions. The long account of
     how merging works lives in Help & Guide → Cloud Sync. */
  function maskEmail(e) {
    var at = String(e || "").indexOf("@");
    return at > 2 ? e.slice(0, 2) + "•••••" + e.slice(at) : e;
  }
  function panel() {
    var card = el("section", { class: "k-card k-cloud", "data-ui": "archive.cloud-card", "aria-label": "Account & Cloud Sync" });
    var chip = el("span", { class: "k-chip" });
    card.appendChild(el("div", { class: "k-card-head" }, [el("span", { class: "k-card-title", text: "Account & Cloud Sync" }), el("span", { class: "k-cloud-chip" }, [chip])]));
    var body = el("div", { class: "k-cloud-body" });
    card.appendChild(body);
    function setChip(text, tone) { chip.textContent = text; chip.setAttribute("data-tone", tone); }
    function fact(k, v, tone) {
      return el("p", { class: "k-card-row" }, [el("span", { class: "k-card-row-k", text: k }), el("span", { class: "k-card-row-v", "data-tone": tone || null, text: v })]);
    }

    function render() {
      body.innerHTML = "";
      if (!KOS.cloud || !KOS.cloud.configured()) {
        setChip("Not set up", "muted");
        body.appendChild(el("p", { class: "k-cloud-p", text:
          "Cloud sync isn't configured on this device. Copy js/env.example.js to js/env.local.js, fill in your Supabase project URL and publishable key, then reload. The app works fully without it; sync only adds multi-device continuity." }));
        return;
      }
      if (!KOS.cloud.available()) {
        setChip("Unavailable", "amber");
        body.appendChild(el("p", { class: "k-cloud-p", text:
          "The sync library hasn't loaded (js/vendor/supabase.js). Check the file exists and reload; everything local keeps working meanwhile." }));
        return;
      }

      var s = KOS.cloudsync.getStatus();
      var signedIn = !!KOS.cloud.userId();

      if (!signedIn) {
        setChip("Signed out", "muted");
        body.appendChild(el("p", { class: "k-cloud-p", text:
          "Sign in to sync your study state, media vault and attachment list across devices. Signed out or offline, nothing is blocked: sync is a replication layer, not a gate." }));
        var email = el("input", { type: "email", class: "k-input", "aria-label": "Email address", placeholder: "email", autocomplete: "username" });
        var pw = el("input", { type: "password", class: "k-input", "aria-label": "Password", placeholder: "password (8+ characters)", autocomplete: "current-password" });
        /* Phase F: the form's one message line carries both progress and
           its validation failures. It is a status region so the failure is
           heard, and it is wired to both fields with aria-describedby so a
           screen reader reaching the field finds the reason there too. */
        var msgId = "cloud-msg-" + Date.now();
        var msg = el("p", { class: "k-cloud-msg", id: msgId, role: "status" });
        email.setAttribute("aria-describedby", msgId);
        pw.setAttribute("aria-describedby", msgId);
        email.required = true;
        pw.required = true;
        function busy(b, label) {
          inBtn.disabled = upBtn.disabled = b;
          msg.textContent = b ? label : "";
        }
        function submit(fn, verb) {
          var e = email.value.trim(), p = pw.value;
          if (!e || !p) {
            msg.textContent = "Enter both an email address and a password.";
            /* invalid state carried beyond colour, and focus put on the
               field that has to change */
            email.setAttribute("aria-invalid", String(!e));
            pw.setAttribute("aria-invalid", String(!p));
            (!e ? email : pw).focus();
            return;
          }
          email.removeAttribute("aria-invalid");
          pw.removeAttribute("aria-invalid");
          busy(true, verb + "…");
          fn(e, p, function (err) {
            busy(false, "");
            if (err) { msg.textContent = err.message; return; }
            KOS.ui.toast(verb + " complete.");
            render();
          });
        }
        var inBtn = el("button", { type: "button", class: "k-btn k-btn--primary", "data-intent": "primary", text: "Sign in", onclick: function () { submit(KOS.cloud.signIn, "Sign-in"); } });
        var upBtn = el("button", { type: "button", class: "k-btn", text: "Create account", onclick: function () { submit(KOS.cloud.signUp, "Sign-up"); } });
        pw.addEventListener("keydown", function (ev) { if (ev.key === "Enter") submit(KOS.cloud.signIn, "Sign-in"); });
        body.appendChild(el("div", { class: "k-cloud-form" }, [email, pw]));
        body.appendChild(msg);
        body.appendChild(el("div", { class: "k-cloud-btns" }, [inBtn, upBtn]));
        return;
      }

      setChip(s.state === "error" ? "● Needs attention" : "● Signed in", s.state === "error" ? "red" : "green");
      body.appendChild(el("p", { class: "k-cloud-p" }, ["Signed in as ", el("b", { text: maskEmail(KOS.cloud.userEmail()), title: KOS.cloud.userEmail() })]));
      var facts = el("div", { class: "k-cloud-facts" });
      facts.appendChild(fact("Status", (LABELS[s.state] || s.state) + (s.detail ? " · " + s.detail : ""),
        s.state === "error" ? "red" : s.state === "pending" || s.state === "syncing" ? "amber" : null));
      if (s.lastSyncAt) facts.appendChild(fact("Last synced", new Date(s.lastSyncAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })));
      /* the last time this device had to combine its own edits with
         another device's — evidence that nothing was lost, on request */
      var lm = KOS.cloudsync.lastMerge && KOS.cloudsync.lastMerge();
      if (lm && lm.stats && (lm.stats.added || lm.stats.deleted || lm.stats.conflicts)) {
        var st = lm.stats, bits = [];
        if (st.added) bits.push(st.added + " combined");
        if (st.deleted) bits.push(st.deleted + " removal" + (st.deleted === 1 ? "" : "s") + " honoured");
        if (st.conflicts) bits.push(st.conflicts + " same-field edit" + (st.conflicts === 1 ? "" : "s") + " settled");
        facts.appendChild(fact("Last merge with another device", new Date(lm.at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " · " + bits.join(", ")));
      }
      body.appendChild(facts);

      var syncBtn = el("button", { type: "button", class: "k-btn k-btn--sm", text: "Sync now", onclick: function () {
        syncBtn.disabled = true;
        KOS.cloudsync.syncNow(function (err) {
          syncBtn.disabled = false;
          if (err) KOS.ui.toast("Sync failed: " + err.message, true);
          render();
        });
      } });
      var filesBtn = el("button", { type: "button", class: "k-btn k-btn--sm", text: "Sync files now", title: "Attachment files upload only when you ask; their details sync on their own", onclick: function () {
        filesBtn.disabled = true;
        filesBtn.textContent = "Uploading files…";
        KOS.cloudsync.uploadBinaries(function (err, rep) {
          filesBtn.disabled = false;
          filesBtn.textContent = "Sync files now";
          if (err) { KOS.ui.toast("File upload failed: " + err.message, true); return; }
          var m = rep.uploaded + " uploaded, " + rep.skipped + " already in the cloud";
          if (rep.failed.length) m += ", " + rep.failed.length + " failed (" + rep.failed[0].name + ": " + rep.failed[0].error + ")";
          KOS.ui.toast("Attachment files: " + m + ".", rep.failed.length > 0);
          render();
        });
      } });
      var outBtn = el("button", { type: "button", class: "k-link k-cloud-out", text: "Sign out", onclick: function () {
        KOS.cloud.signOut(function () {
          KOS.ui.toast("Signed out. Everything keeps working locally.");
          render();
        });
      } });
      body.appendChild(el("p", { class: "k-cloud-p k-cloud-note", text: "Edits made on two devices merge, and nothing asks which copy to keep. Attachment files upload only with Sync files now." }));
      body.appendChild(el("div", { class: "k-cloud-btns" }, [syncBtn, filesBtn, outBtn]));
    }

    render();
    if (KOS.cloudsync) {
      var last = null;
      KOS.cloudsync.onStatus(function (s) {
        /* re-render only while the card is on screen and something moved */
        if (!card.isConnected) return;
        var key = s.state + "|" + s.detail;
        if (key === last) return;
        last = key;
        render();
      });
    }
    return card;
  }

  /* the chip exists in the static topbar — wire it once the DOM is ready */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireChip);
  } else {
    wireChip();
  }

  KOS.cloudui = { panel: panel };
})();
