/* Kurenai OS — core/errorlog.js · KOS.errorLog
   Universal Error Log (user-authorised U7/U8): first-class, low-friction
   mistake tracking across all subjects and study spaces.
   - Synced in state.errorLog = { v: 1, items: [], settings: { autoLogQuiz } }
     with random string ids ("err_<...>"), merged by id in cloudmerge.js.
   - Zero Governor traffic, zero session logging (invariants 1–3).
   - Pure derived reads (all, openCount, insights) write nothing.
   - Heavy UI (Hub, Quick Error Drill, Capture Sheet) and the hub's own
     reads and edits live in lazy js/modules/errorlog.js (bundle
     "page-errorlog") to protect the boot budget; boot keeps capture. */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;

  var MISTAKE_TYPES = [
    { id: "concept", label: "Concept gap" },
    { id: "misread", label: "Misread question" },
    { id: "careless", label: "Careless / slip" },
    { id: "method", label: "Method / steps" },
    { id: "recall", label: "Recall slip" },
    { id: "time", label: "Time pressure" },
    { id: "edge", label: "Edge case" }
  ];
  var TYPE_MAP = {};
  MISTAKE_TYPES.forEach(function (t) { TYPE_MAP[t.id] = t.label; });

  var SOURCES = [
    { id: "quiz", label: "Quiz" },
    { id: "exam-q", label: "Exam Q" },
    { id: "paper", label: "Past paper" },
    { id: "ink", label: "Ink" },
    { id: "code", label: "Code" },
    { id: "ja", label: "Japanese" },
    { id: "manual", label: "Manual" }
  ];
  var SOURCE_MAP = {};
  SOURCES.forEach(function (s) { SOURCE_MAP[s.id] = s.label; });

  var SUBJECTS = [
    { id: "compsci", label: "Computer Science", short: "CS", hue: "var(--cs)", exam: true },
    { id: "maths", label: "Mathematics", short: "Maths", hue: "var(--maths)", exam: true },
    { id: "it", label: "IT · Data Analytics", short: "IT", hue: "var(--it)", exam: true },
    { id: "code", label: "Code", short: "Code", hue: "var(--code)", exam: false },
    { id: "ja", label: "Japanese", short: "Japanese", hue: "var(--ja)", exam: false },
    { id: "mind", label: "Mind", short: "Mind", hue: "var(--mind)", exam: false },
    { id: "creatives", label: "Creatives", short: "Creatives", hue: "var(--cr)", exam: false },
    { id: "general", label: "General", short: "General", hue: "var(--muted)", exam: false }
  ];
  var SUBJ_MAP = {};
  SUBJECTS.forEach(function (s) { SUBJ_MAP[s.id] = s; });

  var STATUSES = { open: 1, revisited: 1, resolved: 1 };

  function rid() { return "err_" + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4); }
  function str(v, max) { return typeof v === "string" ? v.trim().slice(0, max || 220) : ""; }
  function peek() { return store.state && store.state.errorLog ? store.state.errorLog : null; }
  function E() {
    var s = store.state.errorLog;
    if (!s || typeof s !== "object") s = store.state.errorLog = { v: 1, items: [], settings: {} };
    if (!Array.isArray(s.items)) s.items = [];
    if (!s.settings || typeof s.settings !== "object") s.settings = {};
    return s;
  }
  function cleanLink(l) {
    if (!l || typeof l !== "object" || typeof l.view !== "string" || !l.view) return null;
    var out = { view: l.view.slice(0, 40) };
    if (l.arg !== undefined) {
      try { out.arg = JSON.parse(JSON.stringify(l.arg)); } catch (e) {}
    }
    return out;
  }
  function normalise(rec, base) {
    rec = rec || {}; base = base || {};
    function pick(k) { return rec[k] !== undefined ? rec[k] : base[k]; }
    var subj = SUBJ_MAP[pick("subject")] ? pick("subject") : "general";
    var src = SOURCE_MAP[pick("source")] ? pick("source") : "manual";
    var st = STATUSES[pick("status")] ? pick("status") : "open";
    var rawTypes = Array.isArray(pick("mistakeTypes")) ? pick("mistakeTypes") : [];
    var types = [];
    rawTypes.forEach(function (t) { if (TYPE_MAP[t] && types.indexOf(t) === -1) types.push(t); });
    var now = Date.now();
    var out = {
      id: typeof pick("id") === "string" && pick("id") ? pick("id").slice(0, 48) : rid(),
      subject: subj,
      space: str(pick("space"), 24) || (SUBJ_MAP[subj].exam ? "study" : subj),
      topicRef: str(pick("topicRef"), 80) || null,
      topicTitle: str(pick("topicTitle"), 140),
      source: src,
      title: str(pick("title"), 220) || "Untitled mistake",
      context: str(pick("context"), 400),
      wrongNote: str(pick("wrongNote"), 600),
      ruleNote: str(pick("ruleNote"), 600),
      mistakeTypes: types,
      status: st,
      reviewCount: Math.max(0, Math.min(999, Math.round(+pick("reviewCount") || 0))),
      lastReviewedAt: +pick("lastReviewedAt") || null,
      resolvedAt: st === "resolved" ? (+pick("resolvedAt") || now) : null,
      cardId: pick("cardId") != null && isFinite(+pick("cardId")) ? +pick("cardId") : null,
      deepLink: cleanLink(pick("deepLink")),
      dedupeKey: str(pick("dedupeKey"), 160) || null,
      createdAt: +pick("createdAt") || now,
      updatedAt: now
    };
    return out;
  }

  /* ---------------- pure reads ---------------- */
  function rawItems() {
    var s = peek();
    return s && Array.isArray(s.items) ? s.items : [];
  }
  function get(id) {
    return rawItems().filter(function (x) { return x.id === id; })[0] || null;
  }
  function openCount(subject, topicRef) {
    return rawItems().filter(function (x) {
      if (x.status === "resolved") return false;
      if (subject && x.subject !== subject) return false;
      if (topicRef && x.topicRef !== topicRef) return false;
      return true;
    }).length;
  }
  function getSetting(k, dflt) {
    var s = peek();
    if (s && s.settings && s.settings[k] !== undefined) return s.settings[k];
    return dflt;
  }

  /* ---------------- writes (zero Governor traffic) ---------------- */
  function bumpCounters() { if (KOS.refreshRailCounters) KOS.refreshRailCounters(); }
  function add(spec) {
    var s = E();
    if (spec && spec.dedupeKey) {
      var dup = s.items.filter(function (x) { return x.dedupeKey === spec.dedupeKey && x.status !== "resolved"; })[0];
      if (dup) return dup;
    }
    var rec = normalise(spec);
    while (get(rec.id)) rec.id = rid();
    s.items.push(rec);
    store.save();
    bumpCounters();
    return rec;
  }
  function remove(id) {
    var s = E(), i = s.items.findIndex(function (x) { return x.id === id; });
    if (i === -1) return null;
    var snap = JSON.parse(JSON.stringify(s.items[i]));
    s.items.splice(i, 1);
    store.save();
    bumpCounters();
    return snap;
  }

  /* 1-tap non-blocking capture + lazy Quick Capture drawer */
  function quickLog(spec) {
    var existed = !!(spec && spec.dedupeKey && rawItems().some(function (x) { return x.dedupeKey === spec.dedupeKey && x.status !== "resolved"; }));
    var entry = add(spec);
    return { entry: entry, existed: existed };
  }
  function openCapture(specOrEntry, onSaved) {
    function openNow() {
      if (KOS.errorLogUI && KOS.errorLogUI.openDialog) KOS.errorLogUI.openDialog(specOrEntry, onSaved);
    }
    if (KOS.errorLogUI && KOS.errorLogUI.openDialog) { openNow(); return; }
    /* December audit ST-47/EX-57: KOS.lazy has need(), never ensure() */
    if (KOS.lazy && KOS.lazy.need) KOS.lazy.need(["page-errorlog"]).then(openNow, function (e) { console.error("Kurenai OS: " + (e && e.message)); });
  }
  function inlinePill(seedOrFn, opts) {
    opts = opts || {};
    var el = KOS.ui.el;
    var label = opts.label || "+ Log mistake";
    var hook = opts.hook || "errorlog.inline-add";
    var undoHook = opts.undoHook || "errorlog.inline-undo";
    function readSeed() { return typeof seedOrFn === "function" ? (seedOrFn() || {}) : (seedOrFn || {}); }
    var initSeed = readSeed();
    var entry = initSeed.dedupeKey ? rawItems().filter(function (x) { return x.dedupeKey === initSeed.dedupeKey && x.status !== "resolved"; })[0] || null : null;
    if (!entry && opts.auto) {
      entry = quickLog(initSeed).entry;
      if (KOS.refreshRailCounters) KOS.refreshRailCounters();
    }
    var box = el("span", { class: "k-el-inline", "data-ui": "errorlog.inline" });
    function paint(refocus) {
      box.innerHTML = "";
      var primary;
      if (entry && get(entry.id)) {
        primary = el("button", {
          type: "button", class: "k-el-inline-btn", "data-state": "logged", "data-ui": hook,
          text: "✓ Logged · Tag reason",
          onclick: function () { openCapture(get(entry.id) || entry, function () { paint(); }); }
        });
        box.appendChild(primary);
        box.appendChild(el("button", {
          type: "button", class: "k-el-inline-undo", "data-ui": undoHook,
          text: "Undo",
          onclick: function () {
            remove(entry.id);
            entry = null;
            if (KOS.refreshRailCounters) KOS.refreshRailCounters();
            paint(true);
          }
        }));
      } else {
        primary = el("button", {
          type: "button", class: "k-el-inline-btn", "data-ui": hook,
          text: label,
          onclick: function () {
            entry = quickLog(readSeed()).entry;
            if (KOS.refreshRailCounters) KOS.refreshRailCounters();
            paint(true);
          }
        });
        box.appendChild(primary);
      }
      if (refocus && primary && primary.focus) primary.focus();
    }
    paint();
    return box;
  }

  KOS.errorLog = {
    MISTAKE_TYPES: MISTAKE_TYPES, TYPE_MAP: TYPE_MAP,
    SOURCES: SOURCES, SOURCE_MAP: SOURCE_MAP,
    SUBJECTS: SUBJECTS, SUBJ_MAP: SUBJ_MAP,
    normalise: normalise, get: get, openCount: openCount, getSetting: getSetting,
    add: add, remove: remove,
    quickLog: quickLog, openCapture: openCapture, inlinePill: inlinePill,
    /* the hub's reads and edits (all, insights, setSetting, update, restore,
       setStatus, markRevisited, hasLinkedCard, toFlashcard) join from
       js/modules/errorlog.js (page-errorlog), with these */
    _k: { E: E, rawItems: rawItems, bumpCounters: bumpCounters, TYPE_MAP: TYPE_MAP, STATUSES: STATUSES, SUBJ_MAP: SUBJ_MAP }
  };
})();
