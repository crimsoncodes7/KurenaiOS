/* Kurenai OS — smoke57.test.js
   Roadmap 1.1: one topic picker's data — the specification as a queryable
   tree (js/core/spec.js) and topic links as one "sid:ref" list on every
   owner that stores them.

   The claims, in the order they matter:

     A · THE TREE. Unit → parent → leaf is read off the generated data, not
         re-typed: the leaves are exactly the hub's leaves, Maths has no
         parent level, a unit or parent resolves to the leaves beneath it,
         and nothing a caller does to a returned node reaches the index.
     B · SEARCH. By reference or title, exact ref first, limited by subject
         and level.
     C · THE GATE. normaliseRefs accepts every shape a record has carried
         (current keys, {subject, ref} pairs, bare refs under a subject),
         drops what the specification does not have and never re-points
         an ambiguous bare ref (invariant 81's rule, applied everywhere).
     D · THE OWNERS. Assignments, Exams & Papers, calendar events and Focus
         sessions store `refs`; a unit pick is stored as picked and read as
         its leaves; the older single `subject`/`ref` stay readable and a
         session still logs ONE subject (invariant 4a).
     E · THE MIGRATION. A returning user's pre-1.1 records are rewritten
         once at boot, before anything renders, without restamping them.
     F · THE MERGE. A `refs` field merges as a set against the base on
         both devices; re-keying a colliding record never touches it.
     G · PACING. The plan's leaf check and its picker read the same index.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke57.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": " + JSON.stringify(a) + " vs " + JSON.stringify(b)); }

let app, KOS;

/* ============ A · the tree ============ */
step("A · levels read off the generated data: unit, parent, leaf", () => {
  const S = KOS.spec;
  eq(S.level("compsci", "4.1"), "unit", "CS 4.1");
  eq(S.level("compsci", "4.1.1"), "parent", "CS 4.1.1");
  eq(S.level("compsci", "4.1.1.1"), "leaf", "CS 4.1.1.1");
  eq(S.level("it", "F200"), "unit", "IT F200");
  eq(S.level("it", "F200.TA1"), "parent", "IT F200.TA1");
  eq(S.level("it", "F200.1.1"), "leaf", "IT F200.1.1");
  eq(S.level("maths", "P1"), "unit", "Maths P1");
  eq(S.level("maths", "1.1"), "leaf", "Maths 1.1");
  eq(S.level("compsci", "9.9.9"), null, "an unknown ref");
  eq(S.levelNodes("maths", "parent").length, 0, "Maths has no parent level");
  const n = S.node("compsci:4.1.1.1");
  eq([n.unit, n.parent, n.level], ["4.1", "4.1.1", "leaf"], "node ancestry");
  assert(n.path[0] === S.node("compsci", "4.1").title, "path starts at the unit");
});

step("A · the leaves are exactly the hub's leaves, in spec order", () => {
  ["compsci", "maths", "it"].forEach(sid => {
    eq(KOS.spec.leaves(sid).map(l => l.ref), KOS.hub.LEAVES[sid].map(l => l.ref), sid + " leaves");
  });
});

step("A · a unit or a parent resolves to the leaves beneath it", () => {
  const S = KOS.spec;
  const unitLeaves = S.leaves("compsci", "4.1").map(l => "compsci:" + l.ref);
  assert(unitLeaves.length > 3, "4.1 has leaves");
  eq(S.resolve(["compsci:4.1"]), unitLeaves, "unit resolve");
  const parent = S.leaves("compsci", "4.1.1").map(l => "compsci:" + l.ref);
  assert(parent.every(k => unitLeaves.indexOf(k) !== -1) && parent.length < unitLeaves.length, "a parent is a subset of its unit");
  eq(S.resolve(["compsci:4.1.1", "compsci:4.1.1.1"]), parent, "an overlapping pick is resolved once");
  assert(S.covers(["compsci:4.1"], "compsci", "4.1.1.1"), "a unit pick covers its leaf");
  assert(!S.covers(["compsci:4.1.1"], "compsci", "4.2.1.1"), "a parent pick does not cover another unit");
  eq(S.firstLeaf(["compsci:4.1"]), { subject: "compsci", ref: unitLeaves[0].slice(8) }, "first leaf");
  const t = S.tree("maths");
  assert(t[0].level === "unit" && t[0].children[0].level === "leaf", "the Maths tree is unit → leaf");
});

step("A · a returned node is a copy: callers cannot corrupt the index", () => {
  const n = KOS.spec.node("compsci", "4.1");
  n.title = "hacked"; n.children.length = 0; n.path.push("x");
  const again = KOS.spec.node("compsci", "4.1");
  assert(again.title !== "hacked" && again.children.length && !again.path.length, "the index moved");
});

/* ============ B · search ============ */
step("B · search by reference or title, exact ref first", () => {
  const S = KOS.spec;
  const hits = S.search("4.1.1.1", { subject: "compsci" });
  eq(hits[0].ref, "4.1.1.1", "exact ref ranks first");
  const hash = S.search("hash", { level: "leaf" });
  assert(hash.length && hash.every(h => h.level === "leaf" && /hash/i.test(h.title + h.ref)), "title search, leaves only");
  const units = S.search("", { subject: "it", level: "unit" });
  eq(units.map(u => u.ref).slice(0, 2), ["F200", "F201"], "an empty query lists a level in spec order");
  assert(S.search("programming", { subject: "compsci", level: "parent" }).every(h => h.level === "parent"), "level filter");
  eq(S.search("zzzz-nothing").length, 0, "no match is empty");
  assert(S.search("a", { limit: 5 }).length === 5, "limit honoured");
});

/* ============ C · the gate ============ */
step("C · normaliseRefs: every stored shape in, current keys out", () => {
  const N = KOS.spec.normaliseRefs;
  eq(N(["compsci:4.1.1.1", { subject: "maths", ref: "1.1" }, "compsci:4.1.1.1"]),
    ["compsci:4.1.1.1", "maths:1.1"], "keys + pairs, de-duplicated");
  eq(N(["4.1.1.1"], { subject: "compsci" }), ["compsci:4.1.1.1"], "a bare ref under a subject");
  eq(N(["compsci:9.9.9", "nope", { subject: "compsci", ref: "x" }, null, 42]), [], "unknown refs are dropped");
  /* "4.1" is a CS unit AND a Maths leaf: with no subject it is ambiguous */
  eq(N(["4.1"]), [], "an ambiguous bare ref is never guessed");
  eq(N(["F200.1.1"]), ["it:F200.1.1"], "a bare ref only one subject has is accepted");
  eq(N(["compsci:4.1", "maths:1.1"], { subject: "compsci", oneSubject: true }), ["compsci:4.1"], "oneSubject");
  eq(N(["compsci:4.1.1"], { leavesOnly: true }), KOS.spec.resolve(["compsci:4.1.1"]), "leavesOnly expands");
  eq(N(["compsci:4.1", "compsci:4.2", "compsci:4.3"], { max: 2 }).length, 2, "max");
});

/* ============ D · the owners ============ */
step("D · assignments store refs; a unit pick stays a unit pick", () => {
  const A = KOS.assignments;
  const a = A.add({ title: "Unit revision", subject: "compsci", refs: ["compsci:4.1", "maths:1.1", "compsci:bogus"] });
  eq(a.refs, ["compsci:4.1", "maths:1.1"], "refs stored as picked, unknown dropped");
  assert(!("topics" in a), "no second link field");
  eq(A.topicsOf(a), [{ subject: "compsci", ref: "4.1" }, { subject: "maths", ref: "1.1" }], "pair form for older screens");
  const b = A.update(a.id, { title: "Unit revision 2" });
  eq(b.refs, a.refs, "an unrelated edit keeps the links");
  const c = A.add({ title: "old caller", topics: [{ subject: "compsci", ref: "4.1.1.1" }] });
  eq(c.refs, ["compsci:4.1.1.1"], "the pre-1.1 topics patch is accepted");
  eq(A.refsOf({ topics: [{ subject: "it", ref: "F200.1.1" }] }), ["it:F200.1.1"], "refsOf reads the old shape");
});

step("D · Exams & Papers: refs canonical, subject/ref readable, RAG reads leaves", () => {
  const T = KOS.tracker;
  const before = KOS.store.state.sessions.length;
  const e = T.add({ kind: "paper", paper: "Mock 1", refs: ["compsci:4.1"], marks: 40, max: 50 });
  eq(e.refs, ["compsci:4.1"], "unit pick stored as picked");
  eq(e.subject, "compsci", "subject derived from the first link");
  eq(e.ref, KOS.spec.leaves("compsci", "4.1")[0].ref, "ref is the first leaf it covers");
  const leaf = KOS.spec.leaves("compsci", "4.1")[2].ref;
  assert(T.forRef("compsci", leaf).some(x => x.id === e.id), "a unit-linked result counts for every leaf in it");
  assert(!T.forRef("compsci", KOS.spec.leaves("compsci", "4.2")[0].ref).some(x => x.id === e.id), "…and nowhere else");
  const s = KOS.store.state.sessions[KOS.store.state.sessions.length - 1];
  eq(KOS.store.state.sessions.length, before + 1, "one session");
  eq([s.type, s.subject, s.refs], ["tracker", "compsci", ["compsci:4.1"]], "the session carries one subject and the links");
  const legacy = T.add({ kind: "exam", subject: "maths", ref: "1.1", marks: 3, max: 5 });
  eq([legacy.refs, legacy.ref], [["maths:1.1"], "1.1"], "the old single-ref caller still works");
  const u = T.update(legacy.id, { ref: null });
  eq([u.refs, u.ref, u.subject], [[], null, "maths"], "clearing the topic keeps the subject");
  const bad = T.add({ kind: "exam", marks: "x", max: -3, date: "nope" });
  assert(bad.marks === null && bad.max === null && /^\d{4}-/.test(bad.date), "the gate cleans numbers and dates");
});

step("D · calendar events: topics become refs through KOS.calendar.normalise", () => {
  const C = KOS.calendar;
  const ev = C.addEvent({ title: "Paper 2", type: "exam", subject: "compsci",
    topics: [{ subject: "compsci", ref: "4.1.1.1" }, { ref: "4.2" }] });
  eq(ev.refs, ["compsci:4.1.1.1", "compsci:4.2"], "pairs and bare refs under the event's subject");
  assert(!("topics" in ev), "no second link field");
  const ev2 = C.updateEvent(ev.id, { refs: ["maths:1.1"] });
  eq(ev2.refs, ["maths:1.1"], "refs patch");
  eq(C.refsOf({ subject: "maths", topics: [{ ref: "1.1" }] }), ["maths:1.1"], "refsOf reads the old shape");
});

step("D · Focus: one subject per session, ref is the first leaf, the ledger gets refs", async () => {
  const F = KOS.focus;
  F.start({ mode: "custom", workMin: 25, breakMin: 0, subject: "compsci", refs: ["compsci:4.1", "maths:1.1"] });
  const S = F.session();
  eq(S.refs, ["compsci:4.1"], "links outside the session's subject are dropped");
  eq(S.ref, KOS.spec.leaves("compsci", "4.1")[0].ref, "ref = first leaf");
  eq(KOS.store.state.focus.lastConfig.refs, ["compsci:4.1"], "setup remembers the links");
  F.endEarly({ confirmed: true, review: false });
  await app.settle();
  const s = KOS.store.state.sessions.filter(x => x.type === "focus").pop();
  eq([s.subject, s.refs], ["compsci", ["compsci:4.1"]], "the focus session logs one subject and its links");
  F.start({ mode: "custom", workMin: 25, breakMin: 0, subject: "maths", ref: "1.1" });
  eq(F.session().refs, ["maths:1.1"], "the old single-ref setup still works");
  F.endEarly({ confirmed: true, review: false });
  await app.settle();
});

/* ============ E · the migration ============ */
step("E · a returning user's pre-1.1 records are rewritten once at boot", async () => {
  const stamp = 1700000000000;
  const legacy = {
    progress: {},
    assignments: { v: 1, nextId: 2, items: [{ id: 1, title: "Old", subject: "compsci", status: "notStarted",
      progress: 0, priority: 0, subtasks: [], topics: [{ subject: "compsci", ref: "4.1.1.1" }, { subject: "compsci", ref: "no.such" }],
      alerts: [], created: stamp, updatedAt: stamp }] },
    tracker: { nextId: 2, entries: [{ id: 1, kind: "exam", subject: "maths", ref: "1.1", topic: "Proof",
      paper: "", marks: 4, max: 5, grade: "", date: "2026-09-01", well: "", badly: "", notes: "", reviewed: false, added: stamp }] },
    calendar: { v: 2, nextId: 2, seeded: true, notified: {}, events: [{ id: 1, v: 2, title: "Exam", type: "exam",
      date: "2026-10-01", subject: "compsci", topics: [{ subject: "compsci", ref: "4.2" }], alerts: [], created: stamp, updatedAt: stamp }] }
  };
  const b = await boot({ storage: { "kurenai-os-v1": JSON.stringify(legacy) } });
  const st = b.KOS.store.state;
  const a = st.assignments.items[0], t = st.tracker.entries[0], ev = st.calendar.events.find(e => e.id === 1);
  eq(a.refs, ["compsci:4.1.1.1"], "assignment topics → refs (unknown dropped)");
  assert(!("topics" in a) && a.updatedAt === stamp, "no leftover field, not restamped");
  eq([t.refs, t.subject, t.ref], [["maths:1.1"], "maths", "1.1"], "tracker ref → refs");
  eq(t.updatedAt, stamp, "tracker migration keeps the record's own time");
  eq(ev.refs, ["compsci:4.2"], "calendar topics → refs");
  assert(!("topics" in ev) && ev.updatedAt === stamp, "calendar: no leftover field, not restamped");
  const again = JSON.stringify(st);
  eq([b.KOS.assignments.migrate(), b.KOS.tracker.migrate(), b.KOS.calendar.migrateRefs()], [0, 0, 0], "idempotent");
  eq(JSON.stringify(st), again, "a second pass writes nothing");
});

/* ============ F · the merge ============ */
step("F · a refs field merges as a set against the base", () => {
  const M = KOS.cloudmerge;
  const rec = refs => ({ id: 1, title: "x", refs: refs, updatedAt: 1 });
  const doc = (refs, stamp) => ({ assignments: { nextId: 2, items: [Object.assign(rec(refs), { updatedAt: stamp })] } });
  const base = doc(["compsci:4.1"], 1);
  const local = doc(["compsci:4.1", "compsci:4.2"], 2);        // added 4.2 here
  const remote = doc(["maths:1.1"], 3);                         // removed 4.1, added 1.1 there
  const out = M.merge(base, local, remote).doc.assignments.items[0].refs;
  eq(out.slice().sort(), ["compsci:4.2", "maths:1.1"], "both additions survive and the removal wins");
  const nobase = M.merge(null, doc(["compsci:4.1"], 2), doc(["maths:1.1"], 3)).doc.assignments.items[0].refs;
  eq(nobase.slice().sort(), ["compsci:4.1", "maths:1.1"], "no base: union");
});

step("F · re-keying a colliding record rewrites ids, never topic links", () => {
  const M = KOS.cloudmerge;
  const mk = (title, ts) => ({ id: 1, title: title, created: ts, refs: ["compsci:4.1"], updatedAt: ts });
  const local = { assignments: { nextId: 2, items: [mk("mine", 1700000000001)] } };
  const remote = { assignments: { nextId: 2, items: [mk("theirs", 1700000000002)] } };
  const r = M.merge({ assignments: { nextId: 1, items: [] } }, local, remote);
  eq(r.rekeyed, 1, "the collision was re-keyed");
  assert(r.doc.assignments.items.length === 2 && r.doc.assignments.items.every(i => i.refs.join() === "compsci:4.1"), "links untouched");
});

/* ============ G · pacing ============ */
step("G · Pacing reads the same index for its leaf check and its picker", () => {
  const P = KOS.pacing;
  const w = P.weeks()[0];
  const e = P.addEntry({ source: "personal", subject: "compsci", wb: w.wb, title: "Picker row",
    refs: ["4.1.1.1", "4.1", "9.9.9"] });
  eq(e.refs, ["4.1.1.1"], "leaves only: a unit and an unknown ref are dropped (invariant 81)");
  P.removeEntry(e.id);
});

(async () => {
  app = await boot();
  KOS = app.KOS;
  let fails = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { fails++; console.log("FAIL  " + name + "\n      " + (e && e.stack ? e.stack.split("\n").slice(0, 2).join(" | ") : e)); }
  }
  const errs = app.errors.filter(e => !/env\.local\.js/.test(e));
  if (errs.length) { fails++; console.log("FAIL  runtime errors: " + errs.join(" / ")); }
  console.log(fails ? "\nSMOKE57: " + fails + " failure(s)" : "\nSMOKE57: all " + steps.length + " steps passed");
  process.exit(fails ? 1 : 0);
})();
