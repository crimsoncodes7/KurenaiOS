/* Kurenai OS — smoke63.test.js
   Roadmap Phase 4: Statistics S1–S5 at full depth, and the Mechanics
   refs renamed from S6–S9 to M6–M9 (Edexcel Paper 3 sections 6–9 keep
   their numbers and take "M"; decided 1 Oct 2026).

   The claims, in the order they matter:

     A · THE TREE. Maths reads P1–P10, S1–S5, M6–M9; no S6–S9 survives in
         the generated data, the content registry, the labs or the plan
         seed, and the lab index files every Mechanics lab under
         Mechanics.
     B · THE MIGRATION. A returning user's state keyed to the old refs is
         renamed at the store's gate on boot: "sid:ref" keys (progress,
         SRS card keys, forks, quick notes), "sid:ref" strings (refs
         lists), bare refs beside a subject (plan rows, the ledger,
         lastRef). Statistics and Pure are untouched; when both keys
         exist the new one wins; a second pass changes nothing.
     C · THE PULL. A document arriving through replaceState (cloud pull,
         restore) is renamed on the way in — a device that has not
         updated yet cannot reintroduce an old ref.
     D · ATTACHMENTS. A file filed under an old ref moves to the new one.
     E · THE NOTES. Every Statistics leaf is paged, carries worked
         examples with Edexcel marks, and derives self-marking exam items
         whose marks match their source.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke63.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": " + JSON.stringify(a) + " vs " + JSON.stringify(b)); }

let app, KOS;
const OLD = /^S[6-9](\.|$)/;
const STATS = ["S1.1", "S2.1", "S2.2", "S2.3", "S2.4", "S3.1", "S3.2", "S3.3", "S4.1", "S4.2", "S4.3", "S5.1", "S5.2", "S5.3"];

/* ============ A · the tree ============ */
step("A · Maths sections are P1–P10, S1–S5, M6–M9", () => {
  const secs = app.window.KOS_DATA.maths.sections.map(s => s.ref);
  eq(secs, ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "S1", "S2", "S3", "S4", "S5", "M6", "M7", "M8", "M9"], "section refs");
  const mech = app.window.KOS_DATA.maths.sections.filter(s => /^M/.test(s.ref));
  eq(mech.map(s => s.title), ["Quantities and units in mechanics", "Kinematics", "Forces and Newton’s laws", "Moments"], "Mechanics titles");
  mech.forEach(s => s.children.forEach(c => assert(c.ref.indexOf(s.ref + ".") === 0, c.ref + " sits under " + s.ref)));
  eq(KOS.spec.level("maths", "M7.3"), "leaf", "M7.3 is a leaf");
  eq(KOS.spec.level("maths", "S7.3"), null, "S7.3 no longer exists");
});

step("A · nothing still names an old ref", () => {
  const C = app.window.KOS_CONTENT;
  const stale = Object.keys(C).filter(k => /^maths:S[6-9]\./.test(k));
  eq(stale, [], "content keys");
  ["M6.1", "M7.1", "M7.3", "M7.5", "M8.4", "M8.6", "M9.1"].forEach(r => assert(KOS.content.has("maths", r), "content for " + r));
  const sims = KOS.sims.all().filter(s => s && s.subject === "maths");
  assert(sims.length > 5, "the maths labs are registered");
  sims.forEach(s => assert(!OLD.test(String(s.ref)), "sim " + s.id + " ref " + s.ref));
  eq(KOS.sims.forRef("maths", "M7.5").map(s => s.id).indexOf("projectile-lab") >= 0, true, "the projectile lab wires to M7.5");
  KOS.pacing.entries().filter(e => e.subject === "maths").forEach(e =>
    (e.refs || []).forEach(r => assert(!OLD.test(r), "plan row " + e.id + " ref " + r)));
});

step("A · the lab index files Mechanics labs under Mechanics, Statistics under Statistics", () => {
  const S = KOS.sims;
  eq(S.areaOf({ subject: "maths", ref: "M7.5" }).id, "mechanics", "projectile lab");
  eq(S.areaOf({ subject: "maths", ref: "M6.1" }).id, "mechanics", "quantities and units (was miscounted as Statistics)");
  eq(S.areaOf({ subject: "maths", ref: "S1.1" }).id, "statistics", "sampling lab");
  eq(S.areaOf({ subject: "maths", ref: "S5.3" }).id, "statistics", "normal test");
  eq(S.areaOf({ subject: "maths", ref: "4.1" }).id, "pure", "binomial expansion");
});

/* ============ B · the migration ============ */
step("B · a returning user's old Mechanics refs are renamed at boot", async () => {
  const legacy = {
    progress: { "maths:S7.3": { status: "done", check: [1, 1, 0, 0] }, "maths:S2.1": { status: "started" },
      "maths:S7.1": { status: "old" }, "maths:M7.1": { status: "new" }, "maths:4.1": { status: "done" } },
    srs: { "maths:S7.3:0": { ef: 2.5, due: "2026-10-01" }, "maths:S2.3:1": { ef: 2.1 } },
    edits: { v: 1, topics: { "maths:S8.6": { notes: { rows: [] } } } },
    sessions: [{ id: 1, kind: "focus", subject: "maths", ref: "S8.1", refs: ["maths:S8.1", "maths:S8.2"], mins: 25 },
      { id: 2, kind: "quiz", subject: "maths", ref: "S2.2", mins: 5 }],
    ui: { subject: "maths", lastRef: { maths: "S7.5", compsci: "4.1.1.1" }, quickNote: { "maths:S9.1": "moments draft" } },
    assignments: { v: 1, nextId: 2, items: [{ id: 1, title: "Kinematics sheet", subject: "maths", ref: "S7.4", refs: ["maths:S7.4"],
      status: "notStarted", progress: 0, priority: 0, subtasks: [], alerts: [], created: 1, updatedAt: 1 }] },
    pacing: { v: 1, seeded: true, importedOn: "2026-09-01", nextId: 2, offset: { schoolMinusPersonal: 1 },
      weeks: [{ wb: "2026-11-09", wk: 9 }], entries: [{ id: "p150", source: "personal", subject: "maths", wb: "2026-11-09",
        title: "SUVAT", refs: ["S7.3", "2.1"] }] }
  };
  const b = await boot({ storage: { "kurenai-os-v1": JSON.stringify(legacy) } });
  const st = b.KOS.store.state;
  eq(Object.keys(st.progress).sort(), ["maths:4.1", "maths:M7.1", "maths:M7.3", "maths:S2.1"], "progress keys");
  eq(st.progress["maths:M7.3"].status, "done", "the record moved with its key");
  eq(st.progress["maths:M7.1"].status, "new", "a collision keeps the already-renamed key");
  eq(Object.keys(st.srs).sort(), ["maths:M7.3:0", "maths:S2.3:1"], "SRS card keys");
  assert(st.edits.topics["maths:M8.6"] && !st.edits.topics["maths:S8.6"], "the fork moved");
  /* the first navigation after a reload files a quick-note draft into its
     topic's Spec fork (invariant 89) — under the renamed ref */
  const filed = JSON.stringify(st.edits.topics["maths:M9.1"] || null);
  assert(/moments draft/.test(filed) && !st.edits.topics["maths:S9.1"], "the quick-note draft filed under M9.1: " + filed);
  eq(st.ui.lastRef, { maths: "M7.5", compsci: "4.1.1.1" }, "lastRef");
  const s1 = st.sessions.find(e => e.id === 1), s2 = st.sessions.find(e => e.id === 2);
  eq([s1.ref, s1.refs], ["M8.1", ["maths:M8.1", "maths:M8.2"]], "ledger entry");
  eq(s2.ref, "S2.2", "a Statistics ledger entry is untouched");
  eq([st.assignments.items[0].ref, st.assignments.items[0].refs], ["M7.4", ["maths:M7.4"]], "assignment");
  eq(st.pacing.entries.find(e => e.id === "p150").refs, ["M7.3", "2.1"], "plan row bare refs");
  const persisted = JSON.parse(b.window.localStorage.getItem("kurenai-os-v1"));
  assert(persisted && persisted.progress["maths:M7.3"], "the renamed state is saved");
});

step("B · the rename table and idempotence", () => {
  const R = KOS.store.renamedRef;
  eq([R("maths", "S6.1"), R("maths", "S7.3"), R("maths", "S9"), R("maths", "S7.3:2")], ["M6.1", "M7.3", "M9", "M7.3:2"], "renamed");
  eq([R("maths", "S5.3"), R("maths", "S1.1"), R("maths", "7.3"), R("compsci", "S7.3"), R("maths", "M7.3")], [null, null, null, null, null], "left alone");
  const st = KOS.store.state, before = JSON.stringify(st);
  KOS.store.replaceState(JSON.parse(before));
  eq(JSON.stringify(st), before, "a second pass changes nothing");
});

step("B · an old bookmark opens the topic under its new ref", () => {
  eq(KOS.router.parse("#/ref/maths/S7.3"), { viewId: "ref", arg: { subject: "maths", ref: "M7.3" } }, "old Mechanics route");
  eq(KOS.router.parse("#/ref/maths/S2.1"), { viewId: "ref", arg: { subject: "maths", ref: "S2.1" } }, "a Statistics route is untouched");
});

/* ============ C · the pull ============ */
step("C · a document arriving through replaceState is renamed on the way in", () => {
  const st = KOS.store.state, keep = JSON.parse(JSON.stringify(st));
  const incoming = JSON.parse(JSON.stringify(st));
  incoming.progress = Object.assign({}, incoming.progress, { "maths:S8.3": { status: "done" } });
  incoming.sessions = (incoming.sessions || []).concat([{ id: 999, kind: "focus", subject: "maths", ref: "S8.3", refs: ["maths:S8.3"], mins: 10 }]);
  KOS.store.replaceState(incoming);
  assert(st.progress["maths:M8.3"] && !st.progress["maths:S8.3"], "progress key renamed");
  const e = st.sessions.find(x => x.id === 999);
  eq([e.ref, e.refs], ["M8.3", ["maths:M8.3"]], "ledger entry renamed");
  KOS.store.replaceState(keep);
});

/* ============ D · attachments ============ */
step("D · a file filed under an old ref moves to the new one", async () => {
  const A = KOS.attach;
  const blob = new app.window.Blob(["suvat"], { type: "text/plain" });
  blob.name = "suvat.txt";
  await new Promise((res, rej) => A.add("maths", "S7.3", blob, (e) => e ? rej(e) : res()));
  await new Promise((res, rej) => A.add("maths", "S2.1", blob, (e) => e ? rej(e) : res()));
  const moved = await new Promise((res, rej) => A.renameRefs((e, n) => e ? rej(e) : res(n)));
  eq(moved, 1, "one file moved");
  const now = await new Promise((res) => A.list("maths", "M7.3", (e, rows) => res(rows)));
  const old = await new Promise((res) => A.list("maths", "S7.3", (e, rows) => res(rows)));
  const stats = await new Promise((res) => A.list("maths", "S2.1", (e, rows) => res(rows)));
  eq([now.length, old.length, stats.length], [1, 0, 1], "listed under the new ref; Statistics untouched");
  eq(await new Promise((res) => A.renameRefs((e, n) => res(n))), 0, "idempotent");
});

/* ============ E · the notes ============ */
step("E · every Statistics leaf is paged, worked and examined", () => {
  STATS.forEach(ref => {
    const c = app.window.KOS_CONTENT["maths:" + ref];
    assert(c, "content for " + ref);
    const pages = c.notes.filter(b => b && b.page).length;
    const worked = c.notes.filter(b => b && b.worked);
    const marked = worked.filter(b => (b.worked.steps || []).some(s => s && s.mk));
    assert(pages >= 2, ref + " is paged (" + pages + ")");
    assert(worked.length >= 3, ref + " has worked examples (" + worked.length + ")");
    assert(marked.length >= 1, ref + " carries Edexcel marks");
    assert(c.notes.some(b => b && b.page === "Exam toolkit"), ref + " ends with an exam toolkit");
    assert((c.flashcards || []).length >= 8 && (c.quiz || []).length >= 4, ref + " flashcards and quiz");
    const derived = KOS.content.examFromWorked(c.notes);
    assert(derived.length >= 1, ref + " derives exam items");
    const qs = (c.exam || []).map(x => x.q);
    derived.forEach(x => {
      assert(qs.indexOf(x.q) >= 0, ref + " a derived item is registered");
      assert(typeof x.q === "string" && x.q.length > 20, ref + " item question");
      assert(Number.isInteger(x.marks) && x.marks > 0 && Array.isArray(x.ms) && x.ms.length, ref + " item marks and scheme");
      assert(!/\d+\s*marks?\s*$/.test(x.src), ref + " item src has the mark count stripped: " + x.src);
    });
  });
});

step("E · the old Statistics outline is gone from the base file", () => {
  const C = app.window.KOS_CONTENT;
  STATS.forEach(ref => {
    const first = C["maths:" + ref].notes[0];
    assert(first && /— the whole topic on one page$/.test(first.h || ""), ref + " opens on its overview, not the old outline: " + JSON.stringify(first));
  });
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
  console.log(fails ? "\nSMOKE63: " + fails + " failure(s)" : "\nSMOKE63: all " + steps.length + " steps passed");
  process.exit(fails ? 1 : 0);
})();
