/* Kurenai OS — core/store.js
   Single-object state persisted to localStorage on every mutation. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};

  var KEY = "kurenai-os-v1";

  var DEFAULTS = {
    v: 1,
    created: Date.now(),
    progress: {},          // "subject:ref" -> {status, check:[c,s,q,u], note}
    ui: { subject: "compsci", view: "dash", openSections: {}, lastRef: {}, railOpen: true },
    oop: { classes: [], links: [], nextId: 1 },
    worked: { last: null },
    trace: {},

    /* ---- Build 2a: the Behavioural Governor ---- */
    custom: { nextId: 1, cards: [] },
    /* user-created flashcards: {id, sid, ref, q, a, created:"YYYY-MM-DD"} */

    srs: {},
    /* SM-2 metadata per card key ("sid:ref:i" curriculum, "u<id>" custom):
       {ef, ivl, reps, due:"YYYY-MM-DD", last:"YYYY-MM-DD", views, lapses, lastRating} */

    sessions: [],
    /* study session log — the data backbone streaks/HP/XP/RAG read from:
       {id, ts, date:"YYYY-MM-DD", type:"flashcards|due-review|quiz|exam|todo|focus",
        subject, ref, dur (seconds|null), metrics:{...}} */

    governor: {
      hp: 100, gold: 0, xp: 0,
      owned: [],                       // purchased catalog item ids
      theme: "kurenai",                // active OS theme variant
      seal: "kurenai",                 // active kanji seal variant
      avatar: { kind: "seal", id: "seal-ember", img: null, crop: null, frame: null },
      banner: null, bannerImg: null, bannerCrop: null,
      /* the one identity blurb (Build 6): a short status line and a few
         lines of "about". Every surface that shows who you are — the
         Governor hero, the Home profile band, the topbar popover — reads
         these two fields, so they can never drift apart. */
      status: "", about: "",
      shelfSkin: null,                 // Build 3j — Books Physical-tab shelf cosmetic
      shrineStyle: null,               // Build 3j — Shrine card border cosmetic
      lastTick: null,                  // "YYYY-MM-DD" of the last HP day-tick
      lastBacklogDrain: null           // "YYYY-MM-DD" the backlog penalty last applied
    },

    /* ---- Build 6.6: the calendar event, one record per thing ----
       There is NO global reminder threshold any more: alerts[] lives on each
       event, in the same minute-offset vocabulary reminders and assignments
       use. The v1 branch (a single `notifyDays` + a per-event `notify` day
       count) migrates once, on first access, in modules/calendar.js.
       Assignments are NEVER events — the grid reads them from
       state.assignments through KOS.assignments.forDate(). */
    /* `v` is deliberately absent here: DEFAULTS are deep-merged UNDER the
       stored state, so defaulting it to 2 would stamp a legacy branch as
       already-migrated and the one-time pass would never run. The migration
       writes it. */
    calendar: {
      nextId: 1, seeded: false,
      events: [],
      /* {id, v, title, date:"YYYY-MM-DD", allDay,
          time:"HH:MM"|null,            // start (kept as `time` since 2a)
          endTime:"HH:MM"|null,
          type:"exam|deadline|study|lesson|personal",
          subject:null|sid, ref:null, description, location,
          colour:""|palette id,         // "" = inherit the type's hue
          recur:"none|daily|weekly|fortnightly|monthly|yearly",
          recurUntil:null|"YYYY-MM-DD",
          alerts:[minutes before],
          paper, room, topics:[{subject,ref}],   // exam
          durationMins:null|int,                 // exam + study block
          priority:0-3, status, showInCountdown,  // deadline
          assignmentId:null|int,                 // study block → assignment LINK
          created, updatedAt} */
      notified: {}                     // "date|eventId|occurrence|mins" -> fired
    },

    todo: {
      nextId: 1,
      manual: [],                      // LEGACY: emptied by the 6.2 migration into state.reminders
      autoChecked: {}                  // "YYYY-MM-DD|autoKey" -> true (per-day auto item ticks)
    },

    /* ---- Build 6.4: the Assignment Tracker (core/assignments.js) ----
       The canonical assignment record. Calendar chips, Countdown rows, the
       Home urgent card and Focus-session links are all DERIVED from this
       array — nothing else stores an assignment, so deleting one removes
       every surface it appeared on. Rides the normal state export. */
    assignments: {
      v: 1,
      nextId: 1,
      items: []
      /* {id,title,subject,type,description,assigned,due,dueTime,status,
          progress,priority,estimateMins,actualMins,subtasks[{id,text,done}],
          notes,topics[{subject,ref}],alerts[minutes],alerted{},
          showInCalendar,showInCountdown,rewarded,created,updatedAt,
          submittedAt,completedAt} */
    },

    /* ---- Build 6.2: the Reminders store (core/reminders.js) ----
       Lists are containers (one per item); tags are cross-list labels (many).
       Smart sections are derived, never stored. Rides the normal state export
       so backup/restore carries every reminder, list and tag. */
    reminders: {
      v: 1,
      nextId: 1,
      items: [],
      /* {id,title,notes,done,completedAt,due,dueTime,priority,listId,tags[],
          subs[{id,text,done}],recur,alerts[minutes],alerted{},lastRewardedOn,
          created,updatedAt} */
      lists: [],                       // {id, name, colour}
      rewardLog: {},                   // "YYYY-MM-DD" -> rewarded completions (anti-farming cap)
      migrated: false                  // the one-time todo.manual → reminders move
    },

    focus: {
      active: null,                    // running-session snapshot (survives reload → restored paused)
      nextId: 1,
      lastConfig: { mode: "pomodoro", workMin: 25, breakMin: 5, subject: "", ref: "" }
    },

    /* ---- Build 2c: tracking completion ---- */
    tracker: {
      nextId: 1,
      entries: []
      /* exam/paper records (FR-3.4/3.5 share one shape, discriminated by kind):
         {id, kind:"exam"|"paper", subject, ref|null, topic, paper, marks, max,
          grade, date:"YYYY-MM-DD", well, badly, notes, reviewed:bool, added} */
    },

    resources: {
      nextId: 1,
      items: []                        // {id, subject, ref|null, name, url}
    },

    /* ---- Build 3a: Collection Matrix ----
       View preferences ONLY. Media entries live in IndexedDB
       ("kurenai-os-media"), never here — see js/core/mediadb.js. */
    media: { layout: "grid", sort: "updated" },
    /* progress entries additionally carry rag: null|"r"|"a"|"g" (manual
       confidence — separate concept from completion status) */

    /* ---- Build 3g: Purchase / Budget Planner (Collection Matrix) ----
       Wishlist items across Books, Games and Visual Novels, against ONE
       shared monthly budget pool (not per-module limits). This module is
       pure logistics — it DELIBERATELY never touches the Governor: no
       sessions, no XP/gold/HP. Buying things is not media engagement, so
       it stays outside the reward loop, consistent with HP never touching
       leisure. Release dates are entered by hand (no viable automated
       cross-media source exists). Lives in localStorage so it rides the
       standard backup (exportFull serialises the whole state object). */
    wishlist: {
      nextId: 1,
      budget: { monthlyLimit: 0, currency: "£", history: [] },
      /* history: [{ month:"YYYY-MM", spent,
                     items:[{id,title,module,price,currency,purchasedAt}] }] */
      items: []
      /* {id, module:"books"|"vn"|"game", title, coverUrl, coverCrop, price, currency,
          retailer, retailerUrl, priority, releaseDate:"YYYY-MM-DD"|null,
          status:"wantToBuy"|"waitingForRelease"|"purchased"|"cancelled",
          linkedEntryId:null|entryId, notes, addedAt, purchasedAt } */
    },

    /* ---- Collection Goals v2 ----
       Automatic goals derive from the local vault/wishlist; manual goals keep
       their own counter. Completion is recorded once but never creates a
       second Governor payout — the underlying Collection activity already
       paid through its canonical session. LocalStorage rides full backup. */
    goals: {
      v: 2,
      nextId: 1,
      items: [],
      completionLedger: {}
      /* {id,title,description,notes,type,target,current,module,linkedEntryId,
          filterKind,filterValue,startDate,deadline,
          status:"active"|"completed"|"failed",
          progress,lastCurrent,createdAt,updatedAt,completedAt,failedAt,
          completionRecordedAt}; completionLedger[id] is the anti-farming mark. */
    }
  };

  function deepMerge(base, extra) {
    if (extra === null || typeof extra !== "object" || Array.isArray(extra)) return extra;
    var out = Array.isArray(base) ? [] : Object.assign({}, base);
    Object.keys(extra).forEach(function (k) {
      if (base && typeof base[k] === "object" && base[k] !== null && !Array.isArray(base[k])) {
        out[k] = deepMerge(base[k], extra[k]);
      } else {
        out[k] = extra[k];
      }
    });
    return out;
  }

  /* fields older saves/backups may still carry but nothing reads:
     `streak` (streaks derive from the sessions log since 2a) and the
     never-used `notes` reserve. Scrubbed on load and on import so they
     stop riding into saves and backup files. */
  function scrubLegacy(s) {
    delete s.streak;
    delete s.notes;
  }

  var state;
  try {
    var raw = localStorage.getItem(KEY);
    state = raw ? deepMerge(JSON.parse(JSON.stringify(DEFAULTS)), JSON.parse(raw))
                : JSON.parse(JSON.stringify(DEFAULTS));
  } catch (e) {
    console.warn("Kurenai OS: stored state unreadable, starting fresh.", e);
    state = JSON.parse(JSON.stringify(DEFAULTS));
  }
  scrubLegacy(state);

  var saveTimer = null;
  function save() {
    /* Build 4a — nudge cloud sync (debounced + no-op when absent/signed
       out; dirtiness is DERIVED by hashing, so a missed nudge is only a
       missed shortcut, never lost data) */
    if (window.KOS && KOS.cloudsync && KOS.cloudsync.noteChange) KOS.cloudsync.noteChange("state");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(KEY, JSON.stringify(state));
        KOS.ui && KOS.ui.flashSaved();
      } catch (e) {
        console.error("Kurenai OS: save failed", e);
        KOS.ui && KOS.ui.toast("Save failed — storage may be full. Export your data.", true);
      }
    }, 120);
  }

  /* Build 6.5 — an IMMEDIATE, synchronous write. The 120 ms debounce above is
     a batching nicety, not a durability contract: at `pagehide` there is no
     later tick to run it in, so a refresh could drop the last fraction of a
     second of state. The Focus Timer calls this when the page is going away
     so a reload can never cost a running session the time it had banked. */
  function flush() {
    clearTimeout(saveTimer);
    saveTimer = null;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.error("Kurenai OS: flush failed", e);
    }
  }

  KOS.store = {
    state: state,
    save: save,
    flush: flush,

    progressKey: function (subjectId, ref) { return subjectId + ":" + ref; },

    getProgress: function (subjectId, ref) {
      var k = this.progressKey(subjectId, ref);
      if (!state.progress[k]) {
        state.progress[k] = { status: "none", check: [false, false, false, false], note: "" };
      }
      return state.progress[k];
    },

    peekProgress: function (subjectId, ref) {
      return state.progress[this.progressKey(subjectId, ref)] || null;
    },

    setStatus: function (subjectId, ref, status) {
      this.getProgress(subjectId, ref).status = status;
      save();
    },

    setCheck: function (subjectId, ref, i, val) {
      var p = this.getProgress(subjectId, ref);
      p.check[i] = !!val;
      // all four checks complete -> mark completed automatically
      if (p.check.every(Boolean)) p.status = "done";
      else if (p.status === "done") p.status = "started";
      // …and a topic carrying any check at all cannot still read "Not started":
      // the Topic Status component shows the status and the check-derived
      // mastery side by side, and the two must never contradict each other.
      else if (p.status === "none" && p.check.some(Boolean)) p.status = "started";
      save();
    },

    setNote: function (subjectId, ref, text) {
      this.getProgress(subjectId, ref).note = text;
      save();
    },

    exportJSON: function () {
      var blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "kurenai-os-backup-" + new Date().toISOString().slice(0, 10) + ".json";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
    },

    importJSON: function (file, done) {
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var incoming = JSON.parse(reader.result);
          if (!incoming || typeof incoming !== "object" || !("progress" in incoming)) {
            throw new Error("Not a Kurenai OS backup file");
          }
          Object.keys(state).forEach(function (k) { delete state[k]; });
          Object.assign(state, deepMerge(JSON.parse(JSON.stringify(DEFAULTS)), incoming));
          scrubLegacy(state);
          save();
          done && done(null);
        } catch (e) { done && done(e); }
      };
      reader.onerror = function () { done && done(new Error("Could not read file")); };
      reader.readAsText(file);
    },

    /* --- R3 fix: unified full-coverage backup/restore ---
       Combines localStorage state + the media vault (entries + non-token KV)
       + document attachments into one JSON file. AniList/VNDB tokens are
       deliberately excluded — a backup file may be copied, shared, or stored
       in less-secure locations than the browser itself; after a restore the
       user reconnects services the same way they did originally.            */
    /* Build the complete backup object WITHOUT downloading it — the R3
       serializer, shared by the backup export and the Build 4a first-time
       cloud migration so there is exactly one representation of "all of
       the user's data". cb(err, result). */
    snapshotFull: function (cb) {
      var result = {
        kos_backup_version: 2,
        exportedAt: Date.now(),
        state: JSON.parse(JSON.stringify(state)),
        mediaEntries: [],
        mediaKV: [],
        attachments: []
      };

      var steps = 0, completed = 0, hadError = false;
      function stepDone(err) {
        if (hadError) return;
        if (err) { hadError = true; cb(err); return; }
        if (++completed >= steps) cb(null, result);
      }

      if (window.KOS && KOS.mediadb && KOS.mediadb.available()) {
        steps++;
        KOS.mediadb.exportAll(function (err, data) {
          if (!err) { result.mediaEntries = data.entries; result.mediaKV = data.kv; }
          stepDone(err);
        });
      }
      if (window.KOS && KOS.attach && KOS.attach.available()) {
        steps++;
        KOS.attach.exportAll(function (err, items) {
          if (!err) result.attachments = items;
          stepDone(err);
        });
      }
      if (steps === 0) cb(null, result);
    },

    exportFull: function (done) {
      this.snapshotFull(function (err, result) {
        if (err) { done && done(err); return; }
        var blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
        var a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "kurenai-os-full-backup-" + new Date().toISOString().slice(0, 10) + ".json";
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 400);
        done && done(null);
      });
    },

    importFull: function (file, done) {
      var reader = new FileReader();
      reader.onload = function () {
        var backup, incoming;
        try {
          var parsed = JSON.parse(reader.result);
          if (parsed && typeof parsed === "object" && "state" in parsed) {
            backup = parsed;
            incoming = parsed.state;
          } else if (parsed && typeof parsed === "object" && "progress" in parsed) {
            /* legacy format: the whole file IS the state object */
            incoming = parsed;
            backup = { kos_backup_version: 1, state: incoming };
          } else {
            return done && done(new Error("Not a Kurenai OS backup file"));
          }
          if (!incoming || typeof incoming !== "object" || !("progress" in incoming)) {
            return done && done(new Error("Not a Kurenai OS backup file"));
          }
        } catch (e) { return done && done(e); }

        /* Restore localStorage state */
        KOS.store.replaceState(incoming);

        var version = backup.kos_backup_version || 1;
        var report = { restoredSections: ["study & governor data"], missingSections: [] };

        if (version < 2) {
          report.missingSections.push(
            "media vault (not in this backup — re-sync from AniList/VNDB to restore)",
            "attachments (not in this backup — attach files again manually)"
          );
          return done && done(null, report);
        }

        function restoreMedia(next) {
          if (!window.KOS || !KOS.mediadb || !KOS.mediadb.available()) {
            report.missingSections.push("media vault (IndexedDB unavailable)");
            return next();
          }
          var data = { entries: backup.mediaEntries || [], kv: backup.mediaKV || [] };
          KOS.mediadb.importAll(data, function (err) {
            if (err) report.missingSections.push("media vault (error: " + err.message + ")");
            else report.restoredSections.push("media vault (" + data.entries.length + " entries)");
            next();
          });
        }

        function restoreFiles(next) {
          var items = backup.attachments || [];
          if (!items.length) return next();
          if (!window.KOS || !KOS.attach || !KOS.attach.available()) {
            report.missingSections.push("attachments (IndexedDB unavailable)");
            return next();
          }
          KOS.attach.importAll(items, function (err) {
            if (err) report.missingSections.push("attachments (error: " + err.message + ")");
            else report.restoredSections.push("attachments (" + items.length + " files)");
            next();
          });
        }

        restoreMedia(function () { restoreFiles(function () {
          /* Build 4a — a restore is authoritative for this account: cloud
             sync must re-baseline (push everything, tombstone remote rows
             the backup no longer carries) instead of trusting stale
             watermarks. No-op when cloud sync is absent or signed out. */
          if (window.KOS && KOS.cloudsync && KOS.cloudsync.noteRestore) KOS.cloudsync.noteRestore();
          done && done(null, report);
        }); });
      };
      reader.onerror = function () { done && done(new Error("Could not read file")); };
      reader.readAsText(file);
    },

    /* Replace the whole state document in place (restore + Build 4a cloud
       pull share this path): defaults merged under, legacy fields scrubbed,
       every existing reference to KOS.store.state stays valid. */
    replaceState: function (incoming) {
      Object.keys(state).forEach(function (k) { delete state[k]; });
      Object.assign(state, deepMerge(JSON.parse(JSON.stringify(DEFAULTS)), incoming));
      scrubLegacy(state);
      save();
    },

    reset: function () {
      Object.keys(state).forEach(function (k) { delete state[k]; });
      Object.assign(state, JSON.parse(JSON.stringify(DEFAULTS)));
      save();
    }
  };
})();
