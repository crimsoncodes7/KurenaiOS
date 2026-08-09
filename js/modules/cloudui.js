/* Kurenai OS — modules/cloudui.js
   The cloud-sync surface (Build 4a): the persistent topbar status chip and
   the Account & Cloud Sync card on the Archive (Backup & Restore) view.

   Authentication gates CLOUD SYNC ONLY — nothing here ever blocks the app.
   The chip is subtle and always present once sync is configured; it shows
   real sync state (dirty units, in-flight cycle, link decisions pending,
   errors with retry), never bare network connectivity. Unconfigured
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
    attention: "Action needed",
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
      } else if (s.state === "attention" || s.state === "signedOut") {
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
    var ATTENTION = { error: 1, attention: 1, signedOut: 1 };
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
      var localSave = document.querySelector(".save-wrap");
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
      chip.className = "sync-chip sync-" + s.state;
      chip.textContent = LABELS[s.state] || s.state;
      chip.title = "Cloud sync — " + (LABELS[s.state] || s.state) +
        (s.detail ? ": " + s.detail : "") +
        (s.lastSyncAt ? " · last synced " + new Date(s.lastSyncAt).toLocaleTimeString("en-GB") : "") +
        " (click for details)";
      /* the visible word is the STATE; the button's name has to describe
         what pressing it does, which is not the same sentence */
      chip.setAttribute("aria-label", "Cloud sync: " + (LABELS[s.state] || s.state) + ". " +
        (s.state === "error" ? "Activate to retry."
          : s.state === "attention" || s.state === "signedOut" ? "Activate to open Account and Cloud Sync."
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

      var link = KOS.cloudsync.linkStatus();
      if (link === "localOnly") {
        var upWrap = el("div", { class: "cloud-link" });
        upWrap.appendChild(el("p", { class: "sub", text:
          "This device has data; your cloud account is empty. Upload your local data to sync it across devices — nothing is sent until you confirm." }));
        var migBtn = el("button", { class: "btn gold", text: "Upload local data to this account…", onclick: function () {
          KOS.ui.confirm({
            title: "Upload your local data?",
            body: "Everything local — study progress, Governor state, the media vault and your attachment list — will be uploaded to this account so other devices can sync it. Attachment FILES upload separately via “Sync files now”. Nothing local is changed or deleted.",
            confirm: "Upload"
          }, function () {
            migBtn.disabled = true;
            migBtn.textContent = "Uploading…";
            KOS.cloudsync.migrateUp(function (err, rep) {
              migBtn.disabled = false;
              migBtn.textContent = "Upload local data to this account…";
              if (err) KOS.ui.toast("Upload failed (local data is untouched — retry any time): " + err.message, true);
              render();
            });
          });
        } });
        upWrap.appendChild(migBtn);
        body.appendChild(upWrap);
      } else if (link === "both") {
        var bothWrap = el("div", { class: "cloud-link" });
        bothWrap.appendChild(el("p", { class: "sub", text:
          "This device AND your cloud account both hold data. Media entries merge automatically (matched per entry, newest copy wins, manual layers kept). The study/Governor state is one document, so choose which copy to keep:" }));
        function resolveBtn(choice, label, cls) {
          var b = el("button", { class: "btn " + cls, text: label, onclick: function () {
            KOS.ui.confirm({
              title: label + "?",
              body: choice === "cloud"
                ? "The cloud copy of study progress, Governor state, planner and settings replaces this device's copy. The media vault still merges — nothing in it is lost."
                : "This device's study progress, Governor state, planner and settings will overwrite the cloud copy. The media vault still merges — nothing in it is lost.",
              confirm: "Merge",
              danger: choice === "cloud"
            }, function () {
              b.disabled = true;
              KOS.cloudsync.resolveBoth(choice, function (err) {
                if (err) { b.disabled = false; KOS.ui.toast("Merge failed (nothing was lost — retry any time): " + err.message, true); }
                render();
              });
            });
          } });
          return b;
        }
        bothWrap.appendChild(el("div", { class: "cloud-btns" }, [
          resolveBtn("device", "Keep this device's state", "gold"),
          resolveBtn("cloud", "Use the cloud copy", "")
        ]));
        body.appendChild(bothWrap);
      }

      /* The staleness conflict: this device has been away long enough that
         its copy no longer descends from the cloud's, and it has edits of
         its own. Nothing has been overwritten — the engine stopped and is
         asking. Deliberately worded around what the user will LOSE. */
      var stale = KOS.cloudsync.staleStatus && KOS.cloudsync.staleStatus();
      if (stale) {
        var behind = Math.max(1, stale.remoteSeq - stale.localSeq);
        var staleWrap = el("div", { class: "cloud-link cloud-stale" });
        staleWrap.appendChild(el("p", { class: "sub", text:
          "This device is behind your cloud copy — another device has saved " + behind +
          " time" + (behind === 1 ? "" : "s") + " since this one last caught up, and this device has changes of its own. " +
          "Uploading now would replace the newer copy wholesale, so nothing has been sent. Choose which to keep:" }));
        function staleBtn(choice, label, cls) {
          var b = el("button", { class: "btn " + cls, text: label, onclick: function () {
            KOS.ui.confirm({
              title: label + "?",
              body: choice === "cloud"
                ? "The cloud copy replaces this device's study progress, Governor state, planner and settings. Anything changed on THIS device since it fell behind is discarded. The media vault is unaffected — it syncs per entry."
                : "This device's copy overwrites the newer cloud copy. Anything saved on your other device since this one fell behind is discarded. Export a backup first if you are unsure. The media vault is unaffected.",
              confirm: choice === "cloud" ? "Use the cloud copy" : "Overwrite the cloud",
              danger: true
            }, function () {
              b.disabled = true;
              KOS.cloudsync.resolveStale(choice, function (err) {
                if (err) { b.disabled = false; KOS.ui.toast("Could not resolve (nothing was overwritten — retry any time): " + err.message, true); }
                render();
              });
            });
          } });
          return b;
        }
        staleWrap.appendChild(el("div", { class: "cloud-btns" }, [
          staleBtn("cloud", "Use the cloud copy (recommended)", "gold"),
          staleBtn("device", "Keep this device's copy", "")
        ]));
        body.appendChild(staleWrap);
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
        "How it syncs: study/Governor state, the media vault and attachment DETAILS sync automatically (last write wins on the state document, with one guard: a device that has fallen behind will not overwrite a newer copy — it asks you instead). Attachment FILES upload only via “Sync files now” — large files use bandwidth and storage, so that stays deliberate; files never uploaded remain on this device only. Cloud sync complements backups, it doesn't replace them." }));
    }

    render();
    if (KOS.cloudsync) {
      var last = null;
      KOS.cloudsync.onStatus(function (s) {
        /* re-render only while the card is on screen and something moved */
        if (!card.isConnected) return;
        var key = s.state + "|" + s.detail + "|" + (s.pendingLink || "");
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
