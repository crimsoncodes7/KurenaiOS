/* Kurenai OS — core/errorlog.js · KOS.errorLog
   Universal Error Log (user-authorised U7/U8): first-class, low-friction
   mistake tracking across all subjects and study spaces.
   - Synced in state.errorLog = { v: 1, items: [], settings: { autoLogQuiz } }
     with random string ids ("err_<...>"), merged by id in cloudmerge.js.
   - Zero Governor traffic, zero session logging (invariants 1–3).
   - Pure derived reads (all, openCount, insights) write nothing.
   - Heavy UI (Hub, Quick Error Drill, Capture Sheet) lives in lazy
     js/modules/errorlog.js (bundle "page-errorlog") to protect boot budget. */
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
  function all(filter) {
    filter = filter || {};
    var q = filter.q ? String(filter.q).trim().toLowerCase() : "";
    return rawItems().filter(function (x) {
      if (filter.status === "open" && x.status === "resolved") return false;
      if (filter.status === "resolved" && x.status !== "resolved") return false;
      if (filter.subject && x.subject !== filter.subject) return false;
      if (filter.topicRef && x.topicRef !== filter.topicRef) return false;
      if (filter.source && x.source !== filter.source) return false;
      if (filter.mistakeType && (!x.mistakeTypes || x.mistakeTypes.indexOf(filter.mistakeType) === -1)) return false;
      if (q) {
        var hay = (x.title + " " + x.context + " " + x.wrongNote + " " + x.ruleNote + " " + x.topicTitle + " " + (x.topicRef || "")).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    }).sort(function (a, b) { return (b.createdAt || 0) - (a.createdAt || 0); });
  }
  function openCount(subject, topicRef) {
    return rawItems().filter(function (x) {
      if (x.status === "resolved") return false;
      if (subject && x.subject !== subject) return false;
      if (topicRef && x.topicRef !== topicRef) return false;
      return true;
    }).length;
  }
  function insights(list) {
    var items = Array.isArray(list) ? list : rawItems();
    var total = items.length;
    if (total < 2) return { total: total, open: 0, byType: [], byTopic: [] };
    var open = 0, typeCounts = {}, topicMap = {};
    items.forEach(function (x) {
      var isOpen = x.status !== "resolved";
      if (isOpen) open++;
      (x.mistakeTypes || []).forEach(function (t) { typeCounts[t] = (typeCounts[t] || 0) + 1; });
      if (x.topicRef || x.topicTitle) {
        var tk = x.subject + "|" + (x.topicRef || x.topicTitle);
        if (!topicMap[tk]) topicMap[tk] = { subject: x.subject, topicRef: x.topicRef, topicTitle: x.topicTitle || x.topicRef, open: 0, total: 0 };
        topicMap[tk].total++;
        if (isOpen) topicMap[tk].open++;
      }
    });
    var byType = Object.keys(typeCounts).map(function (id) {
      var c = typeCounts[id];
      return { id: id, label: TYPE_MAP[id] || id, count: c, pct: Math.round(100 * c / total) };
    }).sort(function (a, b) { return b.count - a.count || a.label.localeCompare(b.label); }).slice(0, 5);
    var byTopic = Object.keys(topicMap).map(function (k) { return topicMap[k]; })
      .sort(function (a, b) { return b.open - a.open || b.total - a.total; }).slice(0, 4);
    return { total: total, open: open, byType: byType, byTopic: byTopic };
  }
  function getSetting(k, dflt) {
    var s = peek();
    if (s && s.settings && s.settings[k] !== undefined) return s.settings[k];
    return dflt;
  }
  function setSetting(k, v) {
    var s = E();
    s.settings[k] = v;
    store.save();
    return v;
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
  function update(id, patch) {
    var s = E(), i = s.items.findIndex(function (x) { return x.id === id; });
    if (i === -1) return null;
    var next = normalise(Object.assign({}, patch || {}, { id: id, createdAt: s.items[i].createdAt }), s.items[i]);
    s.items[i] = next;
    store.save();
    bumpCounters();
    return next;
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
  function restore(snap) {
    if (!snap || !snap.id) return null;
    var s = E();
    if (get(snap.id)) return get(snap.id);
    var rec = normalise(snap, snap);
    rec.createdAt = snap.createdAt || rec.createdAt;
    s.items.push(rec);
    store.save();
    bumpCounters();
    return rec;
  }
  function setStatus(id, status) {
    if (!STATUSES[status]) return null;
    return update(id, { status: status, resolvedAt: status === "resolved" ? Date.now() : null });
  }
  function markRevisited(id) {
    var cur = get(id);
    if (!cur) return null;
    return update(id, {
      status: cur.status === "resolved" ? "resolved" : "revisited",
      reviewCount: (cur.reviewCount || 0) + 1,
      lastReviewedAt: Date.now()
    });
  }

  /* 1-click Flashcard push into canonical FSRS deck (deduped) */
  function hasLinkedCard(entry) {
    if (!entry || entry.cardId == null) return false;
    var cards = (store.state.custom && store.state.custom.cards) || [];
    return cards.some(function (c) { return c.id === entry.cardId; });
  }
  function toFlashcard(id) {
    var cur = get(id);
    if (!cur || !KOS.srs || !KOS.srs.addCustom) return { ok: false, why: "Flashcard store unavailable." };
    if (hasLinkedCard(cur)) return { ok: true, already: true, cardId: cur.cardId };
    var meta = SUBJ_MAP[cur.subject] || SUBJ_MAP.general;
    var sid = meta.exam && cur.topicRef ? cur.subject : (KOS.srs.PERSONAL_SID || "personal");
    var ref = meta.exam && cur.topicRef ? cur.topicRef : (cur.topicRef ? cur.subject + ":" + cur.topicRef : cur.subject);
    var q = cur.title + (cur.context ? "\n" + cur.context : "");
    var aParts = [];
    if (cur.ruleNote) aParts.push("Rule: " + cur.ruleNote);
    if (cur.wrongNote) aParts.push("Avoid: " + cur.wrongNote);
    var a = aParts.length ? aParts.join("\n") : (cur.context || "Review this mistake carefully.");
    var card = KOS.srs.addCustom(sid, ref, q, a, { src: { module: "errorlog", entryId: cur.id, title: cur.title } });
    update(cur.id, { cardId: card.id });
    return { ok: true, already: false, card: card, cardId: card.id };
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
    if (KOS.lazy && KOS.lazy.ensure) KOS.lazy.ensure(["page-errorlog"], openNow);
  }

  KOS.errorLog = {
    MISTAKE_TYPES: MISTAKE_TYPES, TYPE_MAP: TYPE_MAP,
    SOURCES: SOURCES, SOURCE_MAP: SOURCE_MAP,
    SUBJECTS: SUBJECTS, SUBJ_MAP: SUBJ_MAP,
    normalise: normalise, get: get, all: all, openCount: openCount, insights: insights,
    getSetting: getSetting, setSetting: setSetting,
    add: add, update: update, remove: remove, restore: restore,
    setStatus: setStatus, markRevisited: markRevisited,
    hasLinkedCard: hasLinkedCard, toFlashcard: toFlashcard,
    quickLog: quickLog, openCapture: openCapture
  };
})();
