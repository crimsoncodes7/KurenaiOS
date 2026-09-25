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

  /* ---------------- the Archive card ---------------- */
  function panel() {
    var card = el("section", { class: "data-card cloud-card" });
    card.appendChild(el("h3", { text: "Account & Cloud Sync" }));
    var body = el("div", { class: "cloud-body" });
    card.appendChild(body);

    function statusLine(s) {
      var bits = [LABELS[s.state] || s.state];
      if (s.detail) bits.push(s.detail);
      if (s.lastSyncAt) bits.push("last synced " + new Date(s.lastSyncAt).toLocaleString("en-GB"));
      return bits.join(" · ");
    }

    function render() {
      body.innerHTML = "";
      if (!KOS.cloud || !KOS.cloud.configured()) {
        body.appendChild(el("p", { class: "sub", text:
          "Cloud sync isn't configured on this device. Copy js/env.example.js to js/env.local.js, fill in your Supabase project URL and publishable key, then reload. The app works fully without it — sync only adds multi-device continuity." }));
        return;
      }
      if (!KOS.cloud.available()) {
        body.appendChild(el("p", { class: "sub", text:
          "The sync library hasn't loaded (js/vendor/supabase.js). Check the file exists and reload — everything local keeps working meanwhile." }));
        return;
      }

      var s = KOS.cloudsync.getStatus();
      var signedIn = !!KOS.cloud.userId();

      if (!signedIn) {
        body.appendChild(el("p", { class: "sub", text:
          "Sign in to sync your study state, media vault and attachment list across devices. Signing out or staying offline never blocks the app — cloud sync is a replication layer, not a gate." }));
        var email = el("input", { type: "email", class: "todo-in cloud-in", "aria-label": "Email address", placeholder: "email", autocomplete: "username" });
        var pw = el("input", { type: "password", class: "todo-in cloud-in", "aria-label": "Password", placeholder: "password (8+ characters)", autocomplete: "current-password" });
        /* Phase F: the form's one message line carries both progress and
           its validation failures. It is a status region so the failure is
           heard, and it is wired to both fields with aria-describedby so a
           screen reader reaching the field finds the reason there too. */
        var msgId = "cloud-msg-" + Date.now();
        var msg = el("p", { class: "sub cloud-msg", id: msgId, role: "status" });
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
        var inBtn = el("button", { class: "btn primary", text: "Sign in", onclick: function () { submit(KOS.cloud.signIn, "Sign-in"); } });
        var upBtn = el("button", { class: "btn", text: "Create account", onclick: function () { submit(KOS.cloud.signUp, "Sign-up"); } });
        pw.addEventListener("keydown", function (ev) { if (ev.key === "Enter") submit(KOS.cloud.signIn, "Sign-in"); });
        body.appendChild(el("div", { class: "cloud-form" }, [email, pw, el("div", { class: "cloud-btns" }, [inBtn, upBtn])]));
        body.appendChild(msg);
        return;
      }

      body.appendChild(el("p", { class: "sub", text: "Signed in as " + KOS.cloud.userEmail() + " · " + statusLine(s) }));

      /* the last time this device had to combine its own edits with
         another device's — evidence that nothing was lost, on request */
      var lm = KOS.cloudsync.lastMerge && KOS.cloudsync.lastMerge();
      if (lm && lm.stats && (lm.stats.added || lm.stats.deleted || lm.stats.conflicts)) {
        var st = lm.stats, bits = [];
        if (st.added) bits.push(st.added + " item" + (st.added === 1 ? "" : "s") + " combined");
        if (st.deleted) bits.push(st.deleted + " removal" + (st.deleted === 1 ? "" : "s") + " honoured");
        if (st.conflicts) bits.push(st.conflicts + " same-field edit" + (st.conflicts === 1 ? "" : "s") + " settled");
        body.appendChild(el("p", { class: "sub cloud-merge", text:
          "Last merge with another device at " + new Date(lm.at).toLocaleTimeString("en-GB") + ": " + bits.join(", ") + "." }));
      }

      var row = el("div", { class: "cloud-btns" });
      var syncBtn = el("button", { class: "btn primary", text: "Sync now", onclick: function () {
        syncBtn.disabled = true;
        KOS.cloudsync.syncNow(function (err) {
          syncBtn.disabled = false;
          if (err) KOS.ui.toast("Sync failed: " + err.message, true);
          render();
        });
      } });
      var filesBtn = el("button", { class: "btn jade", text: "Sync files now", onclick: function () {
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
      var outBtn = el("button", { class: "btn", text: "Sign out", onclick: function () {
        KOS.cloud.signOut(function () {
          KOS.ui.toast("Signed out — everything keeps working locally.");
          render();
        });
      } });
      row.appendChild(syncBtn);
      row.appendChild(filesBtn);
      row.appendChild(outBtn);
      body.appendChild(row);

      body.appendChild(el("p", { class: "sub", text:
        "How it syncs: study/Governor state, the media vault and attachment DETAILS sync automatically and merge across devices — edits made on two devices combine (records by id, gold and XP by what each earned), a deletion on either device wins, and nothing ever asks you which copy to keep. Attachment FILES upload only via “Sync files now” — large files use bandwidth and storage, so that stays deliberate; files never uploaded remain on this device only. Cloud sync complements backups, it doesn't replace them." }));
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
