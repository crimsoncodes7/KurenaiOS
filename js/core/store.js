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
    notes: {},             // reserved
    ui: { subject: "compsci", view: "dash", openSections: {}, lastRef: {}, railOpen: true },
    streak: { count: 0, lastDate: null },   // legacy (pre-2a); streaks now derive from sessions
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
      avatar: { kind: "seal", id: "seal-ember", img: null, frame: null },
      shelfSkin: null,                 // Build 3j — Books Physical-tab shelf cosmetic
      shrineStyle: null,               // Build 3j — Shrine card border cosmetic
      lastTick: null,                  // "YYYY-MM-DD" of the last HP day-tick
      lastBacklogDrain: null           // "YYYY-MM-DD" the backlog penalty last applied
    },

    calendar: {
      nextId: 1, seeded: false,
      events: [],
      /* {id, title, date:"YYYY-MM-DD", time:"HH:MM"|null,
          type:"exam|deadline|study|lesson|personal",
          subject:null|sid, ref:null, recur:"none|weekly"} */
      notifyDays: 3,                   // deadline reminder threshold (days out)
      notified: {}                     // "eventId|date" -> true (reminder fired today)
    },

    todo: {
      nextId: 1,
      manual: [],                      // {id, text, done, created:"YYYY-MM-DD"} — persist independently
      autoChecked: {}                  // "YYYY-MM-DD|autoKey" -> true (per-day auto item ticks)
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
    media: { layout: "grid", sort: "updated" }
    /* progress entries additionally carry rag: null|"r"|"a"|"g" (manual
       confidence — separate concept from completion status) */
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

  var state;
  try {
    var raw = localStorage.getItem(KEY);
    state = raw ? deepMerge(JSON.parse(JSON.stringify(DEFAULTS)), JSON.parse(raw))
                : JSON.parse(JSON.stringify(DEFAULTS));
  } catch (e) {
    console.warn("Kurenai OS: stored state unreadable, starting fresh.", e);
    state = JSON.parse(JSON.stringify(DEFAULTS));
  }

  var saveTimer = null;
  function save() {
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

  KOS.store = {
    state: state,
    save: save,

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
          save();
          done && done(null);
        } catch (e) { done && done(e); }
      };
      reader.onerror = function () { done && done(new Error("Could not read file")); };
      reader.readAsText(file);
    },

    reset: function () {
      Object.keys(state).forEach(function (k) { delete state[k]; });
      Object.assign(state, JSON.parse(JSON.stringify(DEFAULTS)));
      save();
    }
  };
})();
