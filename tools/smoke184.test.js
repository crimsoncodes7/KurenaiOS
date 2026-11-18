/* Kurenai OS — smoke184.test.js
   A PARTIAL full Companion (the Exams & Papers rework §9.2, §10;
   invariant 130 widened): a board paper's Companion written for some of
   its leaves — CS Paper 1's for the seven Paper 1 topics of the December
   pre-public exam.

     A · the contract, for every leaf a partial paper holds: at least one
         shape with working rules; three or more worked variations each,
         whose mark points add up to its marks; six or more practice
         questions at all three difficulties whose schemes add up; shape ids
         unique across every paper.
     B · the evidence: every indexed question on those leaves whose
         catalogued shape belongs to them is linked from a shape; a shape
         the examiner's reports speak about cites one of those notes.
     C · how it is read: a partial paper never makes a predicted paper (a
         real Paper 1 assessment's papers stay practice papers); a school's
         mock over both papers (the CS PPE) reads BOTH papers' guides, and
         a shape, a pack and a set of either open from it.
     D · no errors, no request.

   Run: node tools/smoke184.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
let app, K, DD, PARTIAL;

step("boot", async () => {
  app = await boot(); K = app.KOS; DD = K.examDeep; await app.settle();
  const D = app.window.KOS_EXAMS.deep;
  PARTIAL = Object.keys(D).filter((p) => D[p].partial);
  assert(PARTIAL.indexOf("aqa-7517-1") >= 0, "CS Paper 1's partial Companion is registered: " + PARTIAL.join(","));
});

step("A · every leaf a partial paper holds meets the contract", async () => {
  const bad = [], ids = [];
  Object.keys(app.window.KOS_EXAMS.deep).forEach((p) => { const d = DD.data(p); d.archs.forEach((a) => ids.push(a.id)); if (d.extended) ids.push(d.extended.id); });
  eq(ids.length, new Set(ids).size, "shape ids are unique across every paper");
  PARTIAL.forEach((pid) => {
    const d = DD.data(pid);
    assert(d.partial && d.leaves.length >= 1, pid + " is partial and holds leaves");
    d.leaves.forEach((l) => {
      assert(K.spec.node(d.sid, l.ref), pid + " " + l.ref + " is a real leaf");
      if (!l.archetypes.length) bad.push(l.ref + ": no shape");
      l.archetypes.forEach((a) => {
        if (a.variations.length < 3) bad.push(a.id + ": " + a.variations.length + " variations");
        if (!a.rules.length) bad.push(a.id + ": no working rules");
        a.variations.forEach((v) => {
          const sum = v.steps.reduce((s, x) => s + x.value, 0);
          if (sum !== v.m) bad.push(a.id + " " + v.v + ": mark points " + sum + " of " + v.m);
          if (!v.q || !v.t || !v.steps.length) bad.push(a.id + " " + v.v + ": incomplete");
        });
      });
      if (l.practice.length < 6) bad.push(l.ref + ": " + l.practice.length + " practice questions");
      if ([1, 2, 3].some((k) => !l.practice.some((p) => p.d === k))) bad.push(l.ref + ": not all three difficulties");
      l.practice.forEach((p) => {
        const ch = K.examPaper.chips({ marks: p.marks, ms: p.ms });
        if (!p.ms.length || ch.reduce((s, c) => s + c.value, 0) !== p.marks || ch.some((c) => /^\d+$/.test(c.label))) bad.push(l.ref + " practice " + (p.i + 1) + ": its scheme does not add up to " + p.marks);
        if (p.arch && !d.byArch[p.arch]) bad.push(l.ref + " practice " + (p.i + 1) + ": no shape " + p.arch);
      });
    });
  });
  eq(bad, [], "the contract");
});

step("B · the indexed questions are linked; the reports' shapes cite them", async () => {
  const ix = app.window.KOS_EXAMS.index, t = K.examCompanion.tags(), S = K.examStats, CAT = {};
  (app.window.KOS_EXAMS.archetypes || []).forEach((r) => { CAT[r[0]] = r[2]; });
  const bad = [];
  PARTIAL.forEach((pid) => {
    const d = DD.data(pid), held = new Set(d.leaves.map((l) => l.key)), refs = new Set(d.leaves.map((l) => l.ref));
    const linked = new Set();
    d.archs.forEach((a) => DD.instances(pid, a).forEach((q) => linked.add(q.sitting + "|" + q.q)));
    ix.questions.filter((q) => q[0] === pid && (q[5] || []).some((k) => held.has(k))).forEach((q) => {
      const tag = t.of[S.qkey(q)];
      /* a question whose catalogued shape lives on a leaf this paper holds must be linked */
      if (tag && CAT[tag] && String(CAT[tag]).split(" ").some((r) => refs.has(r)) && !linked.has(q[1] + "|" + q[3])) bad.push(q[1] + " " + q[3] + " (" + tag + ") is not linked");
    });
    const notes = (app.window.KOS_EXAMS.reports[pid] || {}).notes || [], have = new Set(notes.map((n) => n.sitting + "|" + n.q));
    d.archs.forEach((a) => {
      a.traps.filter((x) => x.sitting).forEach((x) => { if (!have.has(x.sitting + "|" + x.q)) bad.push(a.id + " cites a note that does not exist: " + x.sitting + " " + x.q); });
      const need = DD.reportNotes(pid, DD.instances(pid, a)).map((n) => n.sitting + "|" + n.q);
      if (need.length && !a.traps.some((x) => need.indexOf(x.sitting + "|" + x.q) !== -1)) bad.push(a.id + " needs a trap citing " + need.join(", "));
    });
  });
  eq(bad, [], "evidence");
});

step("C · never a predicted paper from a partial one; the PPE reads both", async () => {
  const p1 = K.exams.add({ preset: "aqa-7517-1", tier: "mock", title: "Paper 1 mock", date: "2026-12-15" }, { quiet: true });
  eq([DD.paperOf(p1), DD.paperOf(p1, true)], ["aqa-7517-1", null], "Paper 1's guide is its own; its papers are never predicted from a partial Companion");
  assert(K.examPaper.build(p1, 1).kind === "practice", "a practice paper");
  K.exams.remove(p1.id);
  const a = K.exams.add({ preset: "aqa-7517-ppe", tier: "mock", title: "PPE", date: "2026-12-15" }, { quiet: true });
  const pids = DD.papersFor(a);
  assert(pids.indexOf("aqa-7517-1") >= 0 && pids.indexOf("aqa-7517-2") >= 0, "the PPE reads both papers: " + pids.join(","));
  const ix = DD.index(a);
  const units = ix.units.map((u) => u.unit);
  assert(units.some((u) => /^4\.(1|2|3)/.test(u)) && units.some((u) => /^4\.(6|7|8|10)/.test(u)), "units from both papers: " + units.join(","));
  /* a Paper 1 shape, its pack and set open from the PPE */
  const d1 = DD.data("aqa-7517-1"), shape = d1.archs[0], leaf = d1.leaves[0];
  eq(DD.paperOfShape(a, shape.id), "aqa-7517-1", "the shape's paper");
  K.show("exams", { id: a.id, tab: "deep", sub: shape.id }); await app.settle();
  assert(app.document.querySelector("#main").textContent.indexOf(shape.title) >= 0, "the shape page opens");
  eq(K.examPaper.build(a, "set-" + leaf.ref).kind, "set", "a Paper 1 leaf's set");
  eq(K.examPaper.build(a, "pack-" + leaf.ref).kind, "pack", "a Paper 1 leaf's pack");
  assert(DD.recognition(a, 1).items.some((x) => d1.byArch[x.arch]), "the recognition drill draws Paper 1 shapes too");
  K.exams.remove(a.id);
});

step("D · no errors, no request", async () => {
  eq(app.errors, [], "no error");
  assert(!app.fetches.length, "no request");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 4).join("\n       ")); }
  }
  console.log(failed ? "smoke184: " + failed + " failed" : "smoke184: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
