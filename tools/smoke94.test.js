/* Kurenai OS — smoke94.test.js
   The Exams & Deadlines hub, phase 6, CS Paper 2 (roadmap 5.8,
   docs/exams-plan.md §13.2, §13.5; frames 29p, 29q; invariant 130): the
   exhaustive Companion for AQA 7517 Paper 2.

   The claims:

     A · THE CONTENT CONTRACT, for every leaf of Paper 2 (4.5–4.12): at
         least one shape; every shape at least three worked variations;
         every scoring step annotated, and the steps' mark points add up to
         the variation's marks; at least six practice questions at all
         three difficulties, each scheme adding up to its marks (so the
         tally can mark it); a practice question's shape is a real one.
     B · THE EVIDENCE: every indexed Paper 2 question is linked from a
         shape (by the catalogue's tag or the shape's own pattern) or is
         a one-off; a shape the examiner's reports speak about carries a
         trap citing one of those notes; every cited note exists; shape
         ids are unique and a new one carries its pattern.
     C · THE EXTENDED ANSWERS: levels of response, at least three worked
         variations, practice essays tied to real leaves.
     D · PREDICTED PAPERS (§13.5): original questions only, to the
         blueprint's marks, one extended answer last, at most two items a
         leaf, reproducible from the seed; a narrower scope draws only
         from it; a leaf's subtopic pack is five questions, easiest
         first; its practice set is all of them; the recognition drill is
         twenty stems, at most two a shape, replayable.
     E · THE TALLY of a predicted paper logs ONE attempt, its source the
         seed (invariant 127); a scheme's own brackets (VARCHAR(20)) are
         never read as marks.
     F · WORKED is per device: marking a variation writes only
         state.ui.examWorked, and the index counts it.
     G · RENDERS WRITE NOTHING: the full Companion, every shape page, the
         extended answers, the guide's section, the predicted paper, a
         pack and a set draw without writing the state or erroring; every
         page says it is written by KurenaiOS; the revision pack offers
         the worked variations and the subtopic packs.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke94.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const TODAY = "2026-10-21", PID = "aqa-7517-2";

let app, K, X, DD, P, d, real;
step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS; X = K.exams; DD = K.examDeep; P = K.examPaper;
  K.store.state.calendar.events = [];
  Object.keys(K.store.state.exams.assessments).forEach((id) => X.remove(id));
  app.window.print = () => { app.window.__printed = (app.window.__printed || 0) + 1; };
  d = DD.data(PID);
  real = X.add({ preset: PID, tier: "real_exam", subject: "compsci", date: "2027-06-10", title: "CS Paper 2", scope: { include: ["compsci:Paper 2"] } });
  eq(app.errors, [], "boot errors");
});

/* ---------------- A · the contract ---------------- */
function paperLeaves() { return K.spec.resolve(["compsci:Paper 2"]).map((k) => k.slice(k.indexOf(":") + 1)); }
step("A · every Paper 2 leaf meets the content contract", () => {
  const leaves = paperLeaves();
  assert(leaves.length >= 60, "Paper 2's leaves: " + leaves.length);
  eq(leaves.filter((r) => !d.byLeaf[r]), [], "a Companion entry for every leaf");
  const bad = [];
  d.leaves.forEach((l) => {
    if (!l.archetypes.length) bad.push(l.ref + ": no shape");
    l.archetypes.forEach((a) => {
      if (a.variations.length < 3) bad.push(a.id + ": " + a.variations.length + " variations");
      if (!a.rules.length) bad.push(a.id + ": no working rules");
      a.variations.forEach((v) => {
        const sum = v.steps.reduce((s, x) => s + x.value, 0);
        if (sum !== v.m) bad.push(a.id + " " + v.v + ": mark points " + sum + " of " + v.m);
        if (!v.q || !v.t || !v.steps.length) bad.push(a.id + " " + v.v + ": incomplete");
        v.methods.forEach((m) => { if (!m.lines.length || !m.when) bad.push(a.id + " " + v.v + ": a method without lines"); });
      });
    });
    if (l.practice.length < 6) bad.push(l.ref + ": " + l.practice.length + " practice questions");
    if ([1, 2, 3].some((k) => !l.practice.some((p) => p.d === k))) bad.push(l.ref + ": not all three difficulties");
    l.practice.forEach((p) => {
      const ch = P.chips({ marks: p.marks, ms: p.ms });
      if (!p.ms.length || ch.reduce((s, c) => s + c.value, 0) !== p.marks || ch.some((c) => /^\d+$/.test(c.label))) bad.push(l.ref + " practice " + (p.i + 1) + ": its scheme does not add up to " + p.marks);
      if (p.arch && !d.byArch[p.arch]) bad.push(l.ref + " practice " + (p.i + 1) + ": no shape " + p.arch);
    });
  });
  eq(bad, [], "the contract");
  const nV = d.archs.reduce((s, a) => s + a.variations.length, 0), nP = d.leaves.reduce((s, l) => s + l.practice.length, 0);
  assert(d.archs.length >= 90 && nV >= 300 && nP >= 400, "the whole paper: " + d.archs.length + " shapes, " + nV + " variations, " + nP + " questions");
});

/* ---------------- B · the evidence ---------------- */
step("B · every real question is linked; the reports' shapes cite them", () => {
  const ix = app.window.KOS_EXAMS.index, t = K.examCompanion.tags(), S = K.examStats;
  const linked = new Set();
  d.archs.concat([d.extended]).forEach((a) => DD.instances(PID, a).forEach((q) => linked.add(q.sitting + "|" + q.q)));
  const uniq = new Set(t.unique.filter((q) => q[0] === PID).map((q) => q[1] + "|" + q[3]));
  const loose = ix.questions.filter((q) => q[0] === PID && !linked.has(q[1] + "|" + q[3]) && !uniq.has(q[1] + "|" + q[3]));
  eq(loose.map((q) => q[1] + " " + q[3] + " " + (t.of[S.qkey(q)] || "?")), [], "every indexed question linked or a one-off");
  const ids = d.archs.map((a) => a.id).concat([d.extended.id]);
  eq(ids.length, new Set(ids).size, "shape ids are unique");
  eq(d.archs.filter((a) => !a.catalogued && !a.match).map((a) => a.id), [], "a shape of its own carries its pattern");
  const notes = app.window.KOS_EXAMS.reports[PID].notes, have = new Set(notes.map((n) => n.sitting + "|" + n.q));
  const bad = [];
  d.archs.concat([d.extended]).forEach((a) => {
    a.traps.filter((x) => x.sitting).forEach((x) => { if (!have.has(x.sitting + "|" + x.q)) bad.push(a.id + " cites a note that does not exist: " + x.sitting + " " + x.q); });
    const need = DD.reportNotes(PID, DD.instances(PID, a)).map((n) => n.sitting + "|" + n.q);
    if (need.length && !a.traps.some((x) => need.indexOf(x.sitting + "|" + x.q) !== -1)) bad.push(a.id + " needs a trap citing " + need.join(", "));
  });
  eq(bad, [], "report-grounded traps");
});

/* ---------------- C · the extended answers ---------------- */
step("C · the extended answers: levels, worked, tied to leaves", () => {
  const e = d.extended;
  assert(e && e.variations.length >= 3 && e.variations.every((v) => v.levels && v.levels.length >= 3 && v.steps.length >= 3), "levels and worked content");
  assert(e.practice.length >= 3 && e.practice.every((p) => p.refs.length && p.refs.every((r) => d.byLeaf[r])), "practice essays tied to real leaves");
  const x = DD.archetype(PID, e.id);
  assert(x.freq.appear >= 6 && x.traps.some((t) => t.cite), "frequent, and the reports' verdict cited");
});

/* ---------------- D · predicted papers ---------------- */
let paper;
step("D · a predicted paper: original, to the blueprint, reproducible", () => {
  paper = P.build(real, 1);
  eq(paper.kind, "predicted", "predicted from the bank");
  eq(JSON.stringify(P.build(real, 1)), JSON.stringify(paper), "the same seed, the same paper");
  assert(JSON.stringify(P.build(real, 2).questions.map((q) => q.id)) !== JSON.stringify(paper.questions.map((q) => q.id)), "another seed, another paper");
  assert(Math.abs(paper.marks - P.blueprint(real).marks) <= 3, "to the marks: " + paper.marks);
  assert(paper.questions.every((q) => q.id.indexOf(PID + ":") === 0 && /KurenaiOS/.test(q.origin || "") && !q.src), "every question is ours, not modelled on a past paper");
  eq(paper.questions.filter((q) => /:extended:/.test(q.id)).length, 1, "one extended answer");
  assert(/:extended:/.test(paper.questions[paper.questions.length - 1].id), "and it is last");
  const per = {};
  paper.questions.forEach((q) => { if (!/:extended:/.test(q.id)) per[q.key] = (per[q.key] || 0) + 1; });
  assert(Object.values(per).every((n) => n <= 2), "at most two a leaf");
});
step("D · a narrower scope, a pack, a set and the recognition drill", () => {
  const mock = X.add({ preset: PID, tier: "mock", subject: "compsci", date: "2026-12-08", title: "Data representation mock", scope: { include: ["compsci:4.5"] } });
  const mp = P.build(mock, 1);
  assert(mp.questions.length && mp.questions.every((q) => /^4\.5\./.test(q.ref) || /:extended:/.test(q.id)), "only the mock's scope");
  const pk = P.build(real, "pack-4.5.4.4");
  eq([pk.kind, pk.questions.length], ["pack", 5], "a subtopic pack of five");
  const dOf = (q) => d.byLeaf["4.5.4.4"].practice.find((p) => p.id === q.id).d;
  assert(pk.questions.every((q, i) => !i || dOf(q) >= dOf(pk.questions[i - 1])) && new Set(pk.questions.map(dOf)).size === 3, "easiest first, every difficulty");
  const st = P.build(real, "set-4.10.4");
  eq([st.kind, st.questions.length], ["set", d.byLeaf["4.10.4"].practice.length], "the whole practice set");
  const r1 = DD.recognition(real, 5), r2 = DD.recognition(real, 5);
  eq(r1.items.length, 20, "twenty stems");
  eq(JSON.stringify(r1), JSON.stringify(r2), "replayable");
  const per = {};
  r1.items.forEach((x) => { per[x.arch] = (per[x.arch] || 0) + 1; });
  assert(Object.values(per).every((n) => n <= 2) && r1.items.every((x) => x.a && x.q), "at most two a shape, each with its answer");
  X.remove(mock.id);
});

/* ---------------- E · the tally ---------------- */
step("E · the tally logs one attempt; brackets in a scheme are not marks", () => {
  eq(P.chips({ marks: 1, ms: ["CREATE TABLE T (Name VARCHAR(20), (1)"] }).map((c) => c.label), ["✓"], "VARCHAR(20) is not twenty marks");
  const n = K.tracker.all().length, ticks = {};
  paper.questions.forEach((q) => { ticks[q.n] = {}; q.parts.forEach((p, j) => { ticks[q.n][j] = {}; p.chips.forEach((c, k) => { if (k % 2 === 0) ticks[q.n][j][c.id] = true; }); }); });
  const e = K.tracker.add(P.toAttempt(paper, ticks, { timed: true, mins: 140 }));
  eq(K.tracker.all().length - n, 1, "one attempt");
  eq([e.source.kind, e.source.ref, e.assessmentId], ["custom-mock", real.id + ":1", real.id], "its source is the seed");
  assert(e.questions.length === paper.questions.length && e.marks > 0 && e.marks < e.max, "marks by question");
});

/* ---------------- F · worked ---------------- */
step("F · worked is per device and counted", () => {
  const snap = () => { const s = JSON.parse(JSON.stringify(K.store.state)); delete s.ui; return JSON.stringify(s); };
  const before = snap(), w0 = DD.index(real).units.reduce((s, u) => s + u.rows.reduce((t, r) => t + r.worked, 0), 0);
  DD.setWorked(PID, "cs.dec-to-float", "C", true);
  eq(snap(), before, "only state.ui changes");
  assert(K.store.state.ui.examWorked[PID + "|cs.dec-to-float|C"], "kept per device");
  eq(DD.index(real).units.reduce((s, u) => s + u.rows.reduce((t, r) => t + r.worked, 0), 0), w0 + 1, "the index counts it");
  DD.setWorked(PID, "cs.dec-to-float", "C", false);
});

/* ---------------- G · the pages ---------------- */
step("G · the full Companion and every shape draw without writing", async () => {
  /* state.ui is the per-device view state every navigation moves */
  const snap = () => { const s = JSON.parse(JSON.stringify(K.store.state)); delete s.ui; return JSON.stringify(s); };
  const before = snap();
  K.show("exams", { id: real.id, tab: "deep" }); await app.settle();
  eq(app.document.querySelectorAll("[data-ui~='exams.deep-shape']").length, DD.index(real).archetypes, "a row for every shape in scope");
  for (const id of d.archs.map((a) => a.id).concat([d.extended.id])) {
    K.show("exams", { id: real.id, tab: "deep", sub: id }); await app.settle();
    const t = app.document.querySelector("#main").textContent;
    assert(app.document.querySelector("[data-ui~='exams.deep-var']") && /Written by KurenaiOS/.test(t) && /not a board question/.test(t), id + ": the open variation, labelled");
    assert(app.document.querySelectorAll("[data-ui~='exams.deep-step']").length >= 1 && app.document.querySelector("[data-ui~='exams.deep-vars']"), id + ": steps and variations");
  }
  K.show("exams", { tab: "guide", sub: real.id }); await app.settle();
  assert(app.document.querySelectorAll("[data-ui~='exams.deep-gshape']").length >= 6, "the guide's worked shapes");
  for (const s of ["1", "pack-4.6.5.1", "set-4.7.3.3"]) {
    K.show("exams", { id: real.id, tab: "paper", sub: s }); await app.settle();
    assert(/written by KurenaiOS, not a board paper/.test(app.document.querySelector("#main").textContent), "paper " + s + " labelled");
  }
  assert(snap() === before, "no page wrote the state");
  /* blind mode is a view, not a write; worked is the one click that writes */
  K.show("exams", { id: real.id, tab: "deep", sub: "cs.boolean-simplify" }); await app.settle();
  app.document.querySelector("[data-ui~='exams.deep-blind']").click(); await app.settle();
  assert([...app.document.querySelectorAll("[data-ui~='exams.deep-step']")].every((s) => s.hidden), "blind hides every step");
  app.document.querySelector("[data-ui~='exams.deep-next-step']").click(); await app.settle();
  eq([...app.document.querySelectorAll("[data-ui~='exams.deep-step']")].filter((s) => !s.hidden).length, 1, "one step at a time");
  K.examGuide.pack(real); await app.settle();
  const parts = [...app.document.querySelectorAll("[data-ui~='exams.pack-part']")].map((p) => [p.textContent, !p.querySelector("input").disabled]);
  assert(parts.some((p) => /Worked variations/.test(p[0]) && p[1]) && parts.some((p) => /Subtopic packs/.test(p[0]) && p[1]), "the pack offers variations and subtopic packs");
  app.document.querySelector("[data-ui~='exams.pack-dialog']").parentNode.close();
  K.examGuide.drill(real, { recog: true }); await app.settle();
  assert(/Recognition drill/.test(app.document.querySelector("[data-ui~='exams.drill-dialog']").textContent), "the recognition drill");
  app.document.querySelector("[data-ui~='exams.drill-dialog']").parentNode.close();
  eq(app.errors, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke94: " + failed + " failed" : "smoke94: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
