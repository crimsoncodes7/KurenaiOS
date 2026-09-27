/* Kurenai OS — smoke58.test.js
   Roadmap 1.2: IT units — marks, grades and what is still needed.

   The claims:

     A · F203 AND F205 ARE GONE. The generated specification no longer has
         them (the generator's IT_NOT_TAKEN, never a hand edit), so the spine,
         search, statistics and content cannot count them; nothing authored
         still points at them.
     B · ONE STORE, SEEDED ONCE. state.itUnits carries the record as given
         on 27 September (F200 51 raw and F202 54 UMS done in Year 1, Year 1
         Distinction; F201, F204, F206 sitting). A second boot, a user's edit
         and a partial branch from a pull all survive the seed.
     C · ONE GATE. Statuses, raw and UMS ranges per unit scale, a mark on a
         sitting unit making it done, unknown units refused.
     D · ONE DERIVATION. Unit grade, the aggregate and marks needed come
         from hub.js and the one boundary table; a not-taken unit prints
         nothing and counts nothing (invariant 77); placeholder boundaries
         are reported as provisional.
     E · THE PRUNE. Study state keyed to a dropped unit leaves progress, the
         SM-2 schedule, tallies, forks and custom cards at boot; the session
         ledger (history) and every other subject are untouched.
     F · NO GOVERNOR TRAFFIC, and two devices' edits to different units
         both survive the merge.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke58.test.js                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot, ROOT } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": " + JSON.stringify(a) + " vs " + JSON.stringify(b)); }

let app, KOS;

/* ============ A · F203 and F205 are gone ============ */
step("A · the IT specification is the five units being taken", () => {
  eq(KOS.spec.units("it").map(u => u.ref), ["F200", "F201", "F202", "F204", "F206"], "IT units");
  eq(KOS_DATA().it.sections.map(s => s.ref), ["F200", "F201", "F202", "F204", "F206"], "generated data");
  eq(KOS.hub.LEAVES.it.length, KOS.spec.leaves("it").length, "hub and spec agree");
  assert(!KOS.hub.LEAVES.it.some(l => /^F20[35]/.test(l.ref)), "no dropped leaf in the hub");
  assert(!KOS.spec.search("F203").length && !KOS.spec.search("F205").length, "search cannot find them");
  assert(!KOS.spec.search("Relational database design").some(n => n.subject === "it"), "…by title either");
  const W = app.window;
  assert(!Object.keys(W.KOS_CONTENT).some(k => /^it:F20[35]/.test(k)), "no authored content for them");
  assert(!Object.keys(W.KOS_DATA.intel).some(k => /^it:F20[35]/.test(k)), "no examiner guidance for them");
});

step("A · the generator owns the rule (IT_NOT_TAKEN), not a hand edit", () => {
  const py = fs.readFileSync(path.join(ROOT, "tools", "gen_data.py"), "utf8");
  assert(/IT_NOT_TAKEN = \("F203", "F205"\)/.test(py), "the generator names the units");
  assert(/it = scope_it\(/.test(py), "a full regeneration applies the rule");
  assert(/--scope-it/.test(py), "the existing payload can be scoped without the extraction");
});

/* ============ B · one store, seeded once ============ */
step("B · the seed is the record as given", () => {
  const U = KOS.itUnits;
  const s = KOS.store.state.itUnits;
  assert(s.seeded, "seeded");
  eq([U.get("F200").status, U.get("F200").raw, U.get("F200").year], ["done", 51, 1], "F200 51 raw, Year 1");
  eq([U.get("F202").status, U.get("F202").ums, U.get("F202").year], ["done", 54, 1], "F202 54 UMS, Year 1");
  ["F201", "F204", "F206"].forEach(c => eq([U.get(c).status, U.get(c).year], ["sitting", 2], c));
  eq(U.year1(), { qualification: "H019", grade: "Distinction" }, "Year 1 grade");
  eq(U.target(), "Distinction*", "default target");
  eq(U.get("F203"), null, "no F203 unit");
});

step("B · a second seed, an edit and a pulled branch all survive", () => {
  const U = KOS.itUnits;
  U.setUnit("F201", { series: "June 2027" });
  eq(U.ensureSeeded(), false, "a second seed is a no-op");
  eq(U.get("F201").series, "June 2027", "the edit survived");
  /* a device that pulled a partial branch before it ever seeded */
  KOS.store.state.itUnits = { units: { F204: { status: "done", ums: 50 } } };
  eq(U.ensureSeeded(), true, "an unseeded branch seeds");
  eq([U.get("F204").ums, U.get("F200").raw], [50, 51], "the pulled unit wins, the rest is seeded");
});

/* ============ C · one gate ============ */
step("C · the normaliser: statuses, per-unit scales, sat when marked", () => {
  const U = KOS.itUnits;
  U.setUnit("F201", { series: "June 2027" });
  eq(U.setUnit("F202", { raw: 25 }).raw, null, "NEA raw is out of 24");
  eq(U.setUnit("F202", { raw: 20 }).raw, 20, "a valid NEA raw mark");
  eq(U.setUnit("F201", { ums: 61 }).ums, null, "UMS is out of 60");
  eq(U.setUnit("F201", { raw: 44.4 }).raw, 44, "whole marks only");
  eq(U.get("F201").status, "done", "a mark on a sitting unit makes it done");
  eq(U.clearResult("F201").status, "sitting", "clearing a result returns it to sitting");
  eq(U.get("F201").series, "June 2027", "…keeping its series");
  eq(U.setUnit("F201", { status: "nonsense" }).status, "sitting", "unknown status");
  eq(U.setUnit("F203", { raw: 10 }), null, "an unknown unit is refused");
  eq(U.setTarget("A*"), null, "an unknown target is refused");
  eq(U.setUnit("F204", { date: "2027-05-20", year: 7 }).year, null, "year is 1 or 2");
  const n = U.normalise({ units: { F999: {}, F200: { raw: "x" } }, target: "bad" });
  eq([Object.keys(n.units), n.units.F200.raw, n.target], [["F200"], null, "Distinction*"], "whole-branch gate");
});

/* ============ D · one derivation ============ */
function reseed() {
  KOS.store.state.itUnits = null;
  KOS.itUnits.ensureSeeded();
}
step("D · unit rows: UMS from raw on the unit's scale, grade from the one table", () => {
  reseed();
  const rows = KOS.hub.it.units();
  eq(rows.map(r => r.code), ["F200", "F201", "F202", "F204", "F206"], "table order");
  const f200 = rows[0], f202 = rows[2];
  eq([f200.ums, f200.estimated, f200.grade], [51, true, "Distinction"], "exam raw 1 : 1, flagged estimated");
  eq([f202.ums, f202.estimated, f202.grade], [54, false, "Distinction"], "a stored UMS is used as-is; a unit has no D*");
  assert(rows.every(r => r.provisional === false), "the specification's unit boundaries are confirmed");
  eq(KOS_DATA().grades.unitBoundaries.map(b => b.grade + " " + b.ums), ["Distinction 48", "Merit 36", "Pass 24"], "unit boundaries (spec p. 91)");
  eq(KOS_DATA().grades.qualifications.H119.boundaries.map(b => b.ums), [270, 240, 180, 120], "H119 boundaries");
  eq(KOS_DATA().grades.qualifications.H019.boundaries.map(b => b.ums), [108, 96, 72, 48], "H019 boundaries");
  KOS.itUnits.setUnit("F204", { raw: 21 });
  eq(KOS.hub.it.units()[3].ums, 52, "NEA raw × 2.5, rounded down");
  eq(KOS.hub.it.gradeFor(23, KOS_DATA().grades.unitBoundaries), null, "below Pass is null");
});

step("D · aggregate and marks needed on the seeded record", () => {
  reseed();
  const agg = KOS.hub.it.aggregate();
  eq([agg.id, agg.banked, agg.bankedMax, agg.max, agg.remaining, agg.grade], ["H119", 105, 120, 300, ["F201", "F204", "F206"], null],
    "H119 so far: no final grade while units remain");
  eq(KOS.hub.it.aggregate("H019").grade, "Distinction", "the Year 1 Certificate derives the recorded grade");
  const need = KOS.hub.it.needed("Distinction*");
  eq([need.threshold, need.confirmed, need.need, need.perUnit, need.secured, need.achievable], [270, true, 165, 55, false, true], "D* needs 165");
  eq(need.perPaper.map(p => p.code + ":" + p.raw + "/" + p.rawMax), ["F201:55/60", "F204:22/24", "F206:22/24"], "per paper, in raw marks");
  eq(KOS.hub.it.needed("Pass").secured, false, "Pass not yet secured at 105 / 120 of 300");
  eq(KOS.hub.it.needed("nonsense"), null, "an unknown target");
});

step("D · not-taken prints nothing and counts nothing; a finished set grades", () => {
  reseed();
  KOS.itUnits.setUnit("F206", { status: "not-taken" });
  assert(!KOS.hub.it.units().some(r => r.code === "F206"), "no row");
  const agg = KOS.hub.it.aggregate();
  eq([agg.max, agg.remaining], [240, ["F201", "F204"]], "out of the total and the remaining");
  KOS.itUnits.setUnit("F206", { status: "sitting" });
  ["F201", "F204", "F206"].forEach(c => KOS.itUnits.setUnit(c, { ums: 60 }));
  const done = KOS.hub.it.aggregate();
  eq([done.complete, done.banked, done.grade], [true, 285, "Distinction*"], "a complete record grades");
  const n = KOS.hub.it.needed("Distinction*");
  eq([n.secured, n.need, n.perUnit], [true, 0, null], "secured, nothing left to sit");
  reseed();
  KOS.itUnits.setUnit("F200", { raw: 0 });
  KOS.itUnits.setUnit("F202", { ums: 0 });
  eq(KOS.hub.it.needed("Distinction*").achievable, false, "even full marks cannot reach it");
});

/* ============ E · the prune ============ */
step("E · study state keyed to a dropped unit is removed at boot; nothing else is", async () => {
  const legacy = {
    progress: { "it:F203.1.1": { status: "done", check: [true, true, true, true], note: "" },
                "it:F200.1.1": { status: "started", check: [true, false, false, false], note: "" },
                "compsci:4.1.1.1": { status: "done", check: [true, true, true, true], note: "" } },
    srs: { "it:F205.2.1:0": { due: "2026-09-01" }, "it:F200.1.1:0": { due: "2026-09-01" } },
    study: { quiz: { "it:F203.1.1": { best: 90, attempts: 1 } }, fc: { "it:F205.2.1": { seen: 3, right: 2, wrong: 1 } } },
    edits: { v: 1, topics: { "it:F203.1.1": { notes: [{ id: "a", p: "x" }] }, "it:F200.1.1": { notes: [{ id: "b", p: "y" }] } } },
    custom: { nextId: 3, cards: [{ id: 1, sid: "it", ref: "F203.2.1", q: "q", a: "a" }, { id: 2, sid: "it", ref: "F200.1.1", q: "q", a: "a" }], quizzes: [] },
    sessions: [{ id: 1, ts: 1, date: "2026-09-01", type: "quiz", subject: "it", ref: "F203.1.1", dur: null, metrics: {} }],
    ui: { lastRef: { it: "F205.1.1", compsci: "4.1.1.1" } }
  };
  const b = await boot({ storage: { "kurenai-os-v1": JSON.stringify(legacy) } });
  const st = b.KOS.store.state;
  eq(Object.keys(st.progress).sort(), ["compsci:4.1.1.1", "it:F200.1.1"], "progress");
  eq(Object.keys(st.srs), ["it:F200.1.1:0"], "SM-2 schedules");
  eq([Object.keys(st.study.quiz), Object.keys(st.study.fc)], [[], []], "tallies");
  eq(Object.keys(st.edits.topics), ["it:F200.1.1"], "curriculum forks");
  eq(st.custom.cards.map(c => c.id), [2], "custom cards");
  eq(st.ui.lastRef, { compsci: "4.1.1.1" }, "a remembered topic that no longer exists");
  eq(st.sessions.length, 1, "the ledger is history and is left alone");
  eq(b.KOS.itUnits.pruneDropped(), 0, "idempotent");
});

/* ============ F · governor and merge ============ */
step("F · IT unit writes make no Governor traffic", () => {
  reseed();
  const g = JSON.stringify(KOS.store.state.governor), n = KOS.store.state.sessions.length;
  KOS.itUnits.setUnit("F201", { raw: 50 });
  KOS.itUnits.setTarget("Distinction");
  KOS.itUnits.clearResult("F201");
  eq([JSON.stringify(KOS.store.state.governor), KOS.store.state.sessions.length], [g, n], "no session, no XP/gold/HP");
});

step("F · two devices editing different units both survive the merge", () => {
  reseed();
  const base = JSON.parse(JSON.stringify({ itUnits: KOS.store.state.itUnits }));
  const local = JSON.parse(JSON.stringify(base)), remote = JSON.parse(JSON.stringify(base));
  local.itUnits.units.F201 = Object.assign({}, local.itUnits.units.F201, { raw: 48, status: "done" });
  remote.itUnits.units.F204 = Object.assign({}, remote.itUnits.units.F204, { raw: 20, status: "done" });
  remote.itUnits.target = "Distinction";
  const out = KOS.cloudmerge.merge(base, local, remote).doc.itUnits;
  eq([out.units.F201.raw, out.units.F204.raw, out.target], [48, 20, "Distinction"], "per unit, per field");
});

function KOS_DATA() { return { it: app.window.KOS_DATA.it, grades: app.window.KOS_IT_GRADES }; }

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
  console.log(fails ? "\nSMOKE58: " + fails + " failure(s)" : "\nSMOKE58: all " + steps.length + " steps passed");
  process.exit(fails ? 1 : 0);
})();
