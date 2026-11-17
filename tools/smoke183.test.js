/* Kurenai OS — smoke183.test.js
   Exams & Papers fixes that need no design (the rework plan §9.1–9.2):

     A · CC-25: a scheme line holding two or more "(n)" marks is one point
         a mark, each worth its own number; a trailing "[4]" on a part's
         question is not repeated beside its tariff.
     B · "dM1" and "ddM1" are read as method marks in every reader (the
         topic's tally, the paper tally, the Companion), so a scheme's codes
         add up.
     C · CM-21: a worked example citing two questions is worth both, with
         each tariff stripped from its source.
     D · EX-29: an attempt logged with no total says "You got 40", never
         "of null".
     E · EX-40: start-by is counted in days and never before the assessment
         was added; a short test whose need still fits says "Start now ·
         … needed", not "passed".
     F · EX-47: thin evidence names what is missing ("needs: …"), never a
         "limiting" signal.
     G · EX-42: a timed paper picked up after a reload says, once, that its
         clock kept running.
     H · §9.2: a mock with no board paper of its own (the CS pre-public
         exam) takes its guide from the paper with a full Companion it
         overlaps most; its predicted papers never borrow one.
     I · no errors, no request.

   Run: node tools/smoke183.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
let app, K;
const day = (n) => K.srs.addDays(K.srs.todayISO(), n);

step("boot", async () => { app = await boot(); K = app.KOS; await app.settle(); });

step("A · CC-25: one point a mark; no repeated tariff", async () => {
  const Q = K.quiz;
  const pts = Q.splitPoints(["Deletion (1): remove the rows with missing values (1).", "Imputation (1) — fill with the mean (1)", "Any one other (1)"]);
  eq(pts.length, 5, "two two-mark bullets become four points, the single stays");
  eq(pts.map(Q.weightOf), [1, 1, 1, 1, 1], "each worth one");
  eq(Q.splitPoints(["Uses VARCHAR(20) for the name (1)"]), ["Uses VARCHAR(20) for the name (1)"], "code brackets are not marks");
  eq(Q.weightOf("Explains the effect (2)"), 2, "a point ending (2) is worth 2");
  /* an exam part drawn with a trailing [4] */
  const host = app.document.createElement("div"); app.document.body.appendChild(host);
  K.quiz.mountExam(host, "it", "F201.2.2", [{ q: "Describe two ways missing data could be handled. [4]", marks: 4, ms: ["Deletion (1): remove the rows (1).", "Imputation (1): fill with a mean (1)."] }], {});
  await app.settle();
  const qt = host.querySelector(".k-qz-part-t");
  assert(qt && !/\[4\]/.test(qt.textContent) && /handled\./.test(qt.textContent), "the [4] is not repeated: " + (qt && qt.textContent));
  host.remove();
});

step("B · dM and ddM are method marks everywhere", async () => {
  const chips = K.examPaper.chips({ marks: 5, ms: ["M1 A1 for the integral", "ddM1 A1 for the limits", "B1 the form"] });
  eq(chips.map((c) => c.label), ["M1", "A1", "ddM1", "A1", "B1"], "the paper tally reads ddM1");
  assert(chips[2].needs === chips[0].id, "a ddM needs the M before it");
  eq(K.examDeep.marksOf ? K.examDeep.marksOf("M1 dM1 A1") : 3, 3, "the Companion counts dM1");
});

step("C · CM-21: both questions' marks", async () => {
  const items = K.content.examFromWorked([{ worked: { tag: "exam", title: "Two in one", q: "(i) Prove … (ii) Find …",
    src: "AS June 2018 · P1 Q10 · 4 marks; A-level June 2022 · P2 Q4 · 3 marks", steps: [{ m: "x", mk: "M1 A1 A1 A1" }, { m: "y", mk: "M1 A1 A1" }] } }], "Edexcel");
  eq(items.length, 1, "one item");
  eq(items[0].marks, 7, "4 + 3 marks");
  assert(!/marks/.test(items[0].src) && /P2 Q4/.test(items[0].src), "each tariff stripped from its source: " + items[0].src);
});

step("D · EX-29: no total, no 'of null'", async () => {
  const e = K.tracker.add({ kind: "exam", subject: "compsci", paper: "Class test", marks: 40, max: null, date: day(-1) });
  K.show("exams", { attempt: e.uid }); await app.settle();
  const t = app.document.querySelector("#main").textContent;
  assert(!/of null/.test(t) && /You got 40/.test(t), "the post-mortem without a total");
  K.tracker.remove(e.id);
});

step("E · EX-40: days, not weeks; 'Start now' while it fits", async () => {
  const a = K.exams.add({ tier: "topic_test", subject: "compsci", title: "Databases test", date: day(3), scope: { include: ["compsci:4.10.1"] } }, { quiet: true });
  const sb = K.exams.startBy(a), st = K.exams.startState(a);
  assert(sb.days < 7 && sb.date >= day(0), "a half-hour need is days, not a week, and not before today: " + JSON.stringify(sb));
  assert(!st || st.state !== "passed", "a short test is never born 'passed': " + (st && st.state));
  K.show("exams", { id: a.id }); await app.settle();
  const chip = app.document.querySelector("[data-ui~='exams.startby']");
  assert(!chip || !/passed/.test(chip.textContent), "no 'Start-by passed' chip: " + (chip && chip.textContent));
  K.exams.remove(a.id);
});

step("F · EX-47: thin says what is missing", async () => {
  const a = K.exams.add({ tier: "mock", subject: "compsci", title: "Thin mock", date: day(20), scope: { include: ["compsci:4.10"] } }, { quiet: true });
  K.show("exams", { id: a.id }); await app.settle();
  const band = app.document.querySelector("[data-ui~='exams.band']");
  assert(band && !/limiting/.test(band.textContent) && /needs:/.test(band.textContent), "thin: 'needs: …', not 'limiting': " + (band && band.textContent));
  K.exams.remove(a.id);
});

step("G · EX-42: a reload says the clock kept running, once", async () => {
  const a = K.exams.add({ preset: "aqa-7517-2", tier: "mock", title: "Reload", date: day(30) }, { quiet: true });
  K.show("exams", { id: a.id, tab: "paper", sub: "1" }); await app.settle();
  app.document.querySelector("[data-ui~='exams.timed-start']").click(); await app.settle();
  assert(K.store.state.ui.examPaperSess.loadedAt, "the first draw notes its load");
  const toasts = []; const t0 = K.ui.toast; K.ui.toast = (m) => toasts.push(m);
  try {
    K.rerender(); await app.settle();
    eq(toasts.length, 0, "a redraw in the same load says nothing");
  } finally { K.ui.toast = t0; }
  delete K.store.state.ui.examPaperSess;
  K.exams.remove(a.id);
});

step("H · §9.2: a school mock borrows a guide, never a predicted paper", async () => {
  const a = K.exams.add({ preset: "aqa-7517-ppe", tier: "mock", title: "PPE", date: day(25) }, { quiet: true });
  eq([K.examDeep.paperOf(a), K.examDeep.paperOf(a, true)], ["aqa-7517-2", null], "the guide borrows Paper 2's; the engine does not");
  const ix = K.examDeep.index(a);
  assert(ix && ix.archetypes > 10 && ix.units.every((u) => /^4\.(6|7|8|10)/.test(u.unit)), "only the scope's Paper 2 units");
  eq(K.examPaper.build(a, 2).kind, "practice", "paper 2 is a practice paper over the whole scope");
  K.exams.remove(a.id);
});

step("I · no errors, no request", async () => {
  eq(app.errors, [], "no error");
  assert(!app.fetches.length, "no request");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 4).join("\n       ")); }
  }
  console.log(failed ? "smoke183: " + failed + " failed" : "smoke183: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
