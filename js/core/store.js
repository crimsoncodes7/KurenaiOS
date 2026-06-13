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
    streak: { count: 0, lastDate: null },
    oop: { classes: [], links: [], nextId: 1 },
    worked: { last: null },
    trace: {}
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
