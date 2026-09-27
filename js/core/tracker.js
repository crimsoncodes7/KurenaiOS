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
   write and never edited on their own.                                   */
(function () {
  "use strict";
  window.KOS = window.KOS || {};
  var store = KOS.store;
  var SUBJECTS = ["compsci", "maths", "it"];
  var KINDS = ["exam", "paper"];

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
    return {
      id: b.id,
      kind: KINDS.indexOf(pick("kind", "exam")) !== -1 ? pick("kind", "exam") : "exam",
      subject: subject,
      refs: refs,
      ref: first ? first.ref : null,
      topic: String(pick("topic", "") || "").trim().slice(0, 200),
      paper: String(pick("paper", "") || "").trim().slice(0, 120),
      marks: num(pick("marks", null)),
      max: num(pick("max", null)),
      grade: String(pick("grade", "") || "").trim().slice(0, 20),
      date: isDate(date) ? date : KOS.srs.todayISO(),
      well: String(pick("well", "") || ""),
      badly: String(pick("badly", "") || ""),
      notes: String(pick("notes", "") || ""),
      reviewed: !!pick("reviewed", false),
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
    return next;
  }
  function remove(id) {
    var t = T();
    var i = t.entries.findIndex(function (x) { return x.id === id; });
    if (i !== -1) { t.entries.splice(i, 1); store.save(); }
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
