/* Kurenai OS — core/tracker.js
   Exams & Papers: the canonical exam/practice-paper record (FR-3.4, FR-3.5).

   The two FRs specify identical columns, so this is ONE record with a kind
   discriminator ("exam" | "paper"). Entries are study evidence: adding one
   lands in the session log, and topic-linked results feed the RAG
   auto-score (js/modules/rag.js). The page is js/modules/tracker.js; this
   file is the data it draws, split out (roadmap 1.1) so every write passes
   one normaliser and the topic picker has a store to write to.

   TOPIC LINKS. `refs` is the canonical field: "sid:ref" strings through
   KOS.spec.normaliseRefs, so a result can name a unit, a parent topic or
   several leaves. `subject` and `ref` stay on the record as READABLE
   derivations for older readers (the session ledger, the table, backups):
   `subject` is the chosen subject (or the first link's), `ref` the first
   leaf the links cover inside that subject. They are rewritten on every
   write and never edited on their own.

   THE ATTEMPT (roadmap 5.8, decision B, invariant 124). The same record is
   the Exams hub's attempt, widened with optional fields — a quick log is
   exactly as quick as it was:
     uid            a random string, the attempt's identity across devices
                    (ids are per-device counters the merge may re-key);
                    redo items and a result link are keyed on it
     assessmentId   the assessment it prepares for, or IS (role "result")
     role           "practice" | "result"
     source         {kind, ref}: a past paper from the index, a topic pack,
                    a predicted paper, a class paper …
     timed, mins, conditions, predicted (the guess before marking)
     questions      [{q, max, got, refs, tags, redo, note}] — per-question
                    marks and error tags, never validated to sum (your
                    rule): typed questions fill `marks` only when no total
                    was typed
   A question marked `redo` is a review item on FSRS (decision G), keyed
   "x:<uid>:<q>", due the day after it is logged, self-marked, paying
   nothing; unmarking it or deleting the attempt removes its schedule.   */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;
  var SUBJECTS = ["compsci", "maths", "it"];
  var KINDS = ["exam", "paper"];
  var ROLES = ["practice", "result"];
  var SOURCES = ["past-paper", "topic-pack", "pmt-pack", "predicted", "custom-mock", "class", "other"];
  var CONDITIONS = ["exam", "open-book", "untimed"];
  /* the error tags (decision M): a fixed vocabulary, optional, many per
     question, never required to explain every lost mark */
  var TAGS = [
    { v: "knowledge", label: "Didn't know it" },
    { v: "recall", label: "Knew it, couldn't recall" },
    { v: "method", label: "Wrong method" },
    { v: "slip", label: "Slip" },
    { v: "misread", label: "Misread the question" },
    { v: "command", label: "Missed the command word" },
    { v: "working", label: "Working not shown" },
    { v: "notation", label: "Units, accuracy or notation" },
    { v: "time", label: "Ran out of time" },
    { v: "incomplete", label: "Stopped part-way" }
  ];
  var TAG_IDS = TAGS.map(function (t) { return t.v; });
  function rid(n) {
    var a = "abcdefghijkmnpqrstuvwxyz23456789", s = "";
    for (var i = 0; i < (n || 8); i++) s += a.charAt(Math.floor(Math.random() * a.length));
    return s;
  }

  function T() {
    var t = store.state.tracker;
    if (!t || typeof t !== "object") t = store.state.tracker = { nextId: 1, entries: [] };
    if (!Array.isArray(t.entries)) t.entries = [];
    if (typeof t.nextId !== "number") t.nextId = 1;
    return t;
  }
  function isDate(s) { return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s); }
  function num(v) {
    if (v === null || v === undefined || v === "") return null;
    var n = Number(v);
    return isFinite(n) && n >= 0 ? n : null;
  }
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }

  /* the links a record carries — the current `refs`, else the pre-1.1
     single `ref` read under its subject. Pure: used by readers on records
     a pull or an old backup may still carry in the old shape. */
  function refsOf(e) {
    if (!e) return [];
    if (Array.isArray(e.refs)) return KOS.spec.normaliseRefs(e.refs, { subject: e.subject || undefined });
    return e.ref ? KOS.spec.normaliseRefs([e.ref], { subject: e.subject || undefined }) : [];
  }

  /* ---------------- the single schema gate ---------------- */
  function normalise(patch, base) {
    patch = patch || {};
    var b = base || {};
    function pick(k, d) { return has(patch, k) && patch[k] !== undefined ? patch[k] : (has(b, k) && b[k] !== undefined ? b[k] : d); }

    var subject = pick("subject", null);
    subject = SUBJECTS.indexOf(subject) !== -1 ? subject : null;

    var refs;
    if (has(patch, "refs")) refs = KOS.spec.normaliseRefs(patch.refs, { subject: subject || undefined, max: 30 });
    else if (has(patch, "ref")) refs = patch.ref ? KOS.spec.normaliseRefs([patch.ref], { subject: subject || undefined }) : [];
    else refs = refsOf(b);
    if (!subject && refs.length) subject = KOS.spec.subjectsOf(refs)[0];

    var first = null;
    if (subject) {
      var inSubject = refs.filter(function (k) { return k.indexOf(subject + ":") === 0; });
      first = KOS.spec.firstLeaf(inSubject);
    }
    var date = pick("date", null);
    var src = pick("source", null);
    var questions = (Array.isArray(pick("questions", [])) ? pick("questions", []) : []).map(function (q) {
      if (!q || typeof q !== "object") return null;
      var label = String(q.q == null ? "" : q.q).trim().slice(0, 16);
      if (!label) return null;
      return {
        q: label,
        max: num(q.max),
        got: num(q.got),
        refs: KOS.spec.normaliseRefs(Array.isArray(q.refs) ? q.refs : [], { subject: subject || undefined, max: 6 }),
        tags: (Array.isArray(q.tags) ? q.tags : []).filter(function (t, i, a) { return TAG_IDS.indexOf(t) !== -1 && a.indexOf(t) === i; }),
        redo: !!q.redo,
        note: String(q.note || "").slice(0, 300)
      };
    }).filter(Boolean).filter(function (q, i, a) {
      return a.findIndex(function (o) { return o.q === q.q; }) === i;   // one row per question label
    }).slice(0, 80);
    var marks = num(pick("marks", null));
    /* typed question marks fill the total only when none was typed */
    if (marks == null && questions.some(function (q) { return q.got != null; })) {
      marks = questions.reduce(function (s, q) { return s + (q.got || 0); }, 0);
    }
    var aid = pick("assessmentId", null);
    var mins = num(pick("mins", null));
    return {
      id: b.id,
      uid: typeof b.uid === "string" && b.uid ? b.uid : (typeof patch.uid === "string" && patch.uid ? patch.uid.slice(0, 20) : rid()),
      kind: KINDS.indexOf(pick("kind", "exam")) !== -1 ? pick("kind", "exam") : "exam",
      subject: subject,
      refs: refs,
      ref: first ? first.ref : null,
      topic: String(pick("topic", "") || "").trim().slice(0, 200),
      paper: String(pick("paper", "") || "").trim().slice(0, 120),
      marks: marks,
      max: num(pick("max", null)),
      grade: String(pick("grade", "") || "").trim().slice(0, 20),
      date: isDate(date) ? date : KOS.srs.todayISO(),
      well: String(pick("well", "") || ""),
      badly: String(pick("badly", "") || ""),
      notes: String(pick("notes", "") || ""),
      reviewed: !!pick("reviewed", false),
      assessmentId: typeof aid === "string" && aid ? aid.slice(0, 20) : null,
      role: ROLES.indexOf(pick("role", "practice")) !== -1 ? pick("role", "practice") : "practice",
      source: src && typeof src === "object" && SOURCES.indexOf(src.kind) !== -1
        ? { kind: src.kind, ref: src.ref ? String(src.ref).slice(0, 80) : null } : null,
      timed: !!pick("timed", false),
      mins: mins != null && mins > 0 && mins <= 600 ? Math.round(mins) : null,
      conditions: CONDITIONS.indexOf(pick("conditions", null)) !== -1 ? pick("conditions", null) : null,
      predicted: num(pick("predicted", null)),
      questions: questions,
      added: b.added || Date.now(),
      updatedAt: Date.now()
    };
  }

  /* ---------------- CRUD ---------------- */
  function all() { return T().entries; }
  function get(id) { return T().entries.find(function (x) { return x.id === id; }) || null; }
  function add(data) {
    var t = T();
    var e = normalise(data || {});
    e.id = t.nextId++;
    t.entries.push(e);
    store.save();
    syncRedo(e, null);
    afterResult(e, null);
    /* study evidence → session log (FR-3.2): one entry, one subject */
    KOS.sessions.log({
      type: "tracker", subject: e.subject, ref: e.ref, refs: e.refs,
      metrics: { kind: e.kind, marks: e.marks, max: e.max,
        pct: pct(e), grade: e.grade, title: e.topic || e.paper }
    });
    return e;
  }
  function update(id, patch) {
    var t = T(), e = get(id);
    if (!e) return null;
    var next = normalise(patch || {}, e);
    next.id = e.id;
    t.entries[t.entries.indexOf(e)] = next;
    store.save();
    syncRedo(next, e);
    afterResult(next, e);
    return next;
  }
  function remove(id) {
    var t = T();
    var i = t.entries.findIndex(function (x) { return x.id === id; });
    if (i === -1) return;
    var e = t.entries[i];
    t.entries.splice(i, 1);
    store.save();
    syncRedo(null, e);
    if (e.role === "result" && e.assessmentId && KOS.exams) KOS.exams.clearResult(e.assessmentId, e.uid);
  }

  /* ---------------- redo items (decision G) ---------------- */
  function redoKey(e, q) { return "x:" + e.uid + ":" + q.q; }
  function syncRedo(next, prev) {
    if (!KOS.srs || !KOS.srs.seedRedo) return;
    var want = {}, had = {};
    if (next) next.questions.forEach(function (q) { if (q.redo) want[redoKey(next, q)] = true; });
    if (prev) (prev.questions || []).forEach(function (q) { if (q.redo) had["x:" + prev.uid + ":" + q.q] = true; });
    Object.keys(want).forEach(function (k) { if (!had[k]) KOS.srs.seedRedo(k); });
    Object.keys(had).forEach(function (k) { if (!want[k]) KOS.srs.dropRedo(k); });
  }
  /* every redo item that exists, as a card the review queue can show */
  function redoCards() {
    var out = [];
    T().entries.forEach(function (e) {
      if (!e.uid) return;
      (e.questions || []).forEach(function (q) {
        if (!q.redo) return;
        var first = KOS.spec.firstLeaf(q.refs && q.refs.length ? q.refs : refsOf(e));
        out.push({
          key: redoKey(e, q), sid: first ? first.subject : e.subject || "personal", ref: first ? first.ref : "redo",
          q: "Redo · " + (e.paper || e.topic || "Paper") + " · Q" + q.q + (q.max ? " · " + q.max + (q.max === 1 ? " mark" : " marks") : ""),
          a: "Answer it again from cold, then mark it against the mark scheme." +
            (q.got != null && q.max ? " Last time: " + q.got + " / " + q.max + "." : "") +
            (q.tags.length ? " Tagged: " + q.tags.map(tagLabel).join(", ") + "." : "") +
            (q.note ? " Note: " + q.note : ""),
          redo: true, marks: q.max || null, entryId: e.id, custom: false
        });
      });
    });
    return out;
  }
  function redoTopic(key) {
    var c = redoCards().filter(function (x) { return x.key === key; })[0];
    return c && c.ref !== "redo" ? { sid: c.sid, ref: c.ref } : null;
  }
  function tagLabel(v) { var t = TAGS.filter(function (x) { return x.v === v; })[0]; return t ? t.label.toLowerCase() : v; }

  /* a real result fills its assessment (invariant 124) */
  function afterResult(next, prev) {
    if (!KOS.exams) return;
    if (prev && prev.role === "result" && prev.assessmentId && (next.role !== "result" || next.assessmentId !== prev.assessmentId)) {
      KOS.exams.clearResult(prev.assessmentId, prev.uid);
    }
    if (next.role === "result" && next.assessmentId) KOS.exams.recordResult(next.assessmentId, next);
  }
  function forAssessment(aid) {
    return T().entries.filter(function (e) { return e.assessmentId === aid; });
  }
  function pct(e) {
    return e.marks != null && e.max ? Math.round(100 * e.marks / e.max) : null;
  }

  /* topic-linked results for the RAG auto-score: a result linked to a unit
     or a parent topic counts for every leaf beneath it */
  function forRef(sid, ref) {
    var k = sid + ":" + ref;
    return T().entries.filter(function (e) { return KOS.spec.resolve(refsOf(e)).indexOf(k) !== -1; });
  }
  function forSubject(sid) {
    return T().entries.filter(function (e) {
      return e.subject === sid || KOS.spec.subjectsOf(refsOf(e)).indexOf(sid) !== -1;
    });
  }

  /* one-time pass (boot): rewrite pre-1.1 records into the current shape.
     Idempotent — a record already carrying `refs` is left alone. */
  function migrate() {
    var t = T(), changed = 0;
    t.entries.forEach(function (e, i) {
      /* roadmap 5.8: every attempt carries a uid (redo items and result
         links are keyed on it); a migration is not an edit */
      if (Array.isArray(e.refs) && !e.uid) { e.uid = rid(); changed++; return; }
      if (Array.isArray(e.refs)) return;
      var next = normalise({}, e);
      next.id = e.id;
      next.updatedAt = e.updatedAt || e.added || next.updatedAt;   // a migration is not an edit
      t.entries[i] = next;
      changed++;
    });
    if (changed) store.save();
    return changed;
  }

  KOS.tracker = {
    KINDS: KINDS.slice(),
    ROLES: ROLES.slice(),
    SOURCES: SOURCES.slice(),
    CONDITIONS: CONDITIONS.slice(),
    TAGS: TAGS,
    tagLabel: tagLabel,
    redoCards: redoCards,
    redoTopic: redoTopic,
    forAssessment: forAssessment,
    normalise: normalise,
    refsOf: refsOf,
    all: all,
    get: get,
    add: add,
    update: update,
    remove: remove,
    pct: pct,
    forRef: forRef,
    forSubject: forSubject,
    migrate: migrate
  };
})();
