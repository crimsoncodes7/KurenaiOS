/* Kurenai OS — smoke105.test.js
   The rest of the iPad build (roadmap 6.1–6.9, design turn 30: 30b, 30f–30t)
   and the files plan's R0 (docs/files-plan.md revision 2).

   The claims:

     A · INK SYNC MERGES PER STROKE (30p, KOS.inkSync, pure): additions on
         both sides survive; a change on one side wins; a deletion on one
         side with no change on the other goes; the same stroke moved on
         both sides is a clash that keeps this device's and loses nothing;
         a page order keeps both sides' new pages.
     B · INK SYNC REPLICATES (a fake kos_ink): a page and its doc are pushed
         once (an unchanged second cycle pushes nothing); another device's
         page arrives; a clash keeps this device's page and offers the
         other, and "Keep both" makes it a page of its own; a doc kept
         "this device only" never leaves; a deletion travels as a tombstone.
     C · THE MODEL: a page of its own height; a doc's meta; docs by prefix;
         deleting a doc leaves tombstones; appendImage lands a picture under
         the last ink or on a new page.
     D · THE ANSWER PAD (30f): an exam question offers Type · Write · On
         paper; Write mounts a pad that writes nothing until the pen does
         (a strip up to 3 marks, a booklet page above); an A mark refuses
         to tick before its M; a fresh render starts blank and the earlier
         answer is a link (Earlier answers), never the page shown.
     E · FLASHCARDS (30o): Type · Write · Think; in Write, Show answer waits
         for ink and the card does not turn before an answer.
     F · WORKING BESIDE ANY TAB: a Working pane beside Flashcards opens on
         a blank page, closes on a tab change, and the Handwritten tab lists
         the working it kept.
     G · THE DRILLS (30l–30n): every authored drill model names real leaves
         and has a checklist; Write it out reveals only after ink and keeps
         the verdict as evidence on its own doc; a blurt's points come from
         the notes; none of it pays.
     H · PAPERS (30h, files R0): question labels are found at the margin
         (AQA's "0 7 . 1", a scheme's "07" "1", Edexcel's "7.") and run
         forward through the paper; the folder import reports every file
         and why — mocks added, non-PDFs and repeats skipped by name.
     I · SETTINGS (30s): Pen and ink renders the pen card, the device and
         Kurenai switches, and reading handwriting is off by default.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke105.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, I, $, $$;
const st = (id, x, y) => ({ id: id, k: "pen", role: "ink", w: 1, p: [x * 10, y * 10, 0, 0, (x + 50) * 10, y * 10, 0, 8] });
const cb = (fn) => new Promise((r) => fn((e, v) => r(v)));
async function settle(n) { for (let i = 0; i < (n || 4); i++) await app.settle(); }
function penOn(live, w, h) {
  live.getBoundingClientRect = () => ({ left: 0, top: 0, width: w, height: h, right: w, bottom: h });
  const ev = (t, x, y) => {
    const e = new app.window.MouseEvent(t, { bubbles: true, cancelable: true, clientX: x, clientY: y, button: 0, buttons: t === "pointerup" ? 0 : 1 });
    Object.defineProperty(e, "pointerType", { value: "pen" }); Object.defineProperty(e, "pointerId", { value: 1 });
    live.dispatchEvent(e);
  };
  ev("pointerdown", 100, 100);
  for (let i = 1; i < 10; i++) ev("pointermove", 100 + i * 20, 100 + (i % 2) * 6);
  ev("pointerup", 300, 100);
}

step("boot", async () => {
  app = await boot({ clock: "2026-10-26T10:00:00" });
  K = app.KOS; I = K.ink;
  $ = (s) => app.document.querySelector(s);
  $$ = (s) => [...app.document.querySelectorAll(s)];
  await app.settle();
  eq(app.errors, [], "boot errors");
  for (const n of ["inkSync", "inkExport", "inkPad", "inkAI", "inkDrills", "pdfView", "desk"]) assert(K[n], "KOS." + n + " is loaded");
});

step("A · ink sync merges per stroke", () => {
  const S = K.inkSync;
  const a = st("a", 10, 10), b = st("b", 10, 40), c = st("c", 10, 70);
  let m = S.mergeItems([a], [a, b], [a, c]);
  eq(m.items.map((x) => x.id).sort(), ["a", "b", "c"], "both sides' new strokes survive");
  eq(m.clash, [], "no clash");
  const a2 = st("a", 20, 10);
  m = S.mergeItems([a, b], [a, b], [a2, b]);
  eq([m.items.filter((x) => x.id === "a")[0].p[0], m.clash], [200, []], "a change on one side wins");
  m = S.mergeItems([a, b], [a], [a, b]);
  eq(m.items.map((x) => x.id), ["a"], "a deletion with no change on the other side goes");
  const a3 = st("a", 30, 10);
  m = S.mergeItems([a], [a2], [a3]);
  eq([m.items.length, m.items[0].p[0], m.clash], [1, 200, ["a"]], "moved on both: this device's kept, a clash named");
  m = S.mergeItems([a], [], [a2]);
  eq([m.items.length, m.clash], [1, ["a"]], "erased here, moved there: kept, a clash, nothing lost");
  eq(S.mergeOrder(["p1", "p2"], ["p1", "p2", "p3"], ["p1", "p4", "p2"]), ["p1", "p4", "p2", "p3"], "a page order keeps both sides' new pages");
  eq(S.mergeOrder(["p1", "p2"], ["p1", "p2"], ["p1"]), ["p1"], "a page removed on the other side goes");
});

step("B · ink sync replicates", async () => {
  const S = K.inkSync, rows = {};
  let seq = 0;
  const T = (n) => "2026-10-26T10:" + String(Math.floor(n / 60)).padStart(2, "0") + ":" + String(n % 60).padStart(2, "0") + "Z";
  S._setCloudApi({
    since(iso, offset, done) { done(null, Object.values(rows).filter((r) => !iso || r.updated_at > iso).sort((x, y) => (x.updated_at < y.updated_at ? -1 : 1))); },
    upsert(list, done) { list.forEach((r) => { rows[r.id] = Object.assign({}, r, { updated_at: T(++seq) }); }); done(null); }
  });
  const was = { s: K.cloud.signedIn, u: K.cloud.userId };
  K.cloud.signedIn = () => true; K.cloud.userId = () => "u1";
  const DOC = "topic:compsci:4.2.1.3";
  await cb((d) => I.addPage(DOC, { paper: "lined", items: [st("s1", 10, 10)] }, d));
  let out = await cb((d) => S.syncCloud(d));
  eq(out.pushed, 2, "the page and its doc are pushed");
  out = await cb((d) => S.syncCloud(d));
  eq(out.pushed, 0, "an unchanged cycle pushes nothing");
  const pid = I.doc(DOC).pages[0];
  const remote = JSON.parse(JSON.stringify(rows[pid].data_json));
  remote.items.push(st("r1", 10, 60));
  rows[pid] = Object.assign({}, rows[pid], { data_json: remote, updated_at: T(++seq) });
  await cb((d) => S.syncCloud(d));
  let page = await cb((d) => I.getPage(pid, d));
  eq(page.items.map((x) => x.id).sort(), ["r1", "s1"], "another device's stroke arrives");
  page.items = page.items.map((x) => (x.id === "s1" ? st("s1", 40, 10) : x));
  await cb((d) => I.savePage(page, d));
  const r2 = JSON.parse(JSON.stringify(rows[pid].data_json));
  r2.items = r2.items.map((x) => (x.id === "s1" ? st("s1", 70, 10) : x));
  rows[pid] = Object.assign({}, rows[pid], { data_json: r2, updated_at: T(++seq) });
  await cb((d) => S.syncCloud(d));
  page = await cb((d) => I.getPage(pid, d));
  eq(page.items.filter((x) => x.id === "s1")[0].p[0], 400, "a clash keeps this device's stroke");
  eq(S.conflicts(), [pid], "and offers the other copy");
  await cb((d) => S.resolve(pid, "both", d));
  eq(I.doc(DOC).pages.length, 2, "Keep both makes the other copy a page of its own");
  eq(S.conflicts(), [], "the clash is settled");
  await cb((d) => I.addPage("paper:pp1:a1", { paper: "none", items: [st("x", 10, 10)] }, d));
  await cb((d) => I.setDocMeta("paper:pp1:a1", { local: true }, d));
  await cb((d) => S.syncCloud(d));
  assert(!Object.values(rows).some((r) => r.doc === "paper:pp1:a1"), "a paper kept on this device never leaves");
  const second = I.doc(DOC).pages[1];
  await cb((d) => I.deletePage(DOC, second, d));
  await cb((d) => S.syncCloud(d));
  eq(rows[second] && rows[second].deleted, true, "a deletion travels as a tombstone");
  S._setCloudApi(null);
  K.cloud.signedIn = was.s; K.cloud.userId = was.u;
  eq(app.errors, [], "no errors");
});

step("C · the model", async () => {
  const p = I.blankPage("answer:t1:q1", "lined", 320);
  eq([p.h, I.pageH(p), I.pageH({})], [320, 320, I.H], "a page of its own height");
  await cb((d) => I.setDocMeta("work:compsci:4.2.1.3:quiz", { item: "work:compsci:4.2.1.3:quiz", title: "Working · Quiz" }, d));
  eq(I.doc("work:compsci:4.2.1.3:quiz").title, "Working · Quiz", "a doc's meta");
  eq(I.docsWith("work:compsci:").length, 1, "docs by prefix");
  await cb((d) => I.addPage("answer:t2:q1", { items: [st("y", 10, 10)] }, d));
  await cb((d) => I.deleteDoc("answer:t2:q1", d));
  const dump = await cb((d) => I.syncRead(d));
  assert(dump.dead.some((x) => x.id === "doc:answer:t2:q1"), "deleting a doc leaves its tombstone");
  const NB = "topic:maths:2.1";
  await cb((d) => I.appendImage(NB, { w: 400, h: 200, src: "data:image/png;base64,AA" }, d));
  await cb((d) => I.appendImage(NB, { w: 400, h: 200, src: "data:image/png;base64,AA" }, d));
  let pages = await cb((d) => I.listPages(NB, d));
  eq([pages.length, pages[0].items.length, pages[0].items[1].y > pages[0].items[0].y], [1, 2, true], "a picture lands under the last one");
  await cb((d) => I.appendImage(NB, { w: 400, h: 1200, src: "data:image/png;base64,AA" }, d));
  pages = await cb((d) => I.listPages(NB, d));
  eq(pages.length, 2, "one that does not fit makes a new page");
});

step("D · the answer pad", async () => {
  K.store.state.ui.answerMode = "type";
  K.show("ref", { subject: "compsci", ref: "4.4.2.1" });
  await settle();
  $("[data-tab='exam']").click();
  await settle();
  assert($("[data-ui~='pad.answer']"), "an exam question offers the answer modes");
  eq($$("[data-ui~='pad.answer'] [role=tab]").slice(0, 3).map((b) => b.textContent.trim()), ["Type", "Write", "On paper"], "Type · Write · On paper");
  $("[data-ui~='pad.mode-write']").click();
  await settle();
  const pad = $("[data-ui~='pad']");
  assert(pad, "Write mounts a pad");
  const marks = +(($("[data-ui~='quiz.exam-top'] .k-qz-marks") || {}).textContent || "0").replace(/\D/g, "");
  eq(pad.getAttribute("data-kind"), marks <= 3 ? "strip" : "page", "a strip up to 3 marks, a page above");
  eq(I.allDocs().filter((d) => /^answer:/.test(d.key) && d.pages.length).length, 0, "the pad writes nothing until the pen does");
  penOn(pad.querySelector(".k-ink-live"), 1000, marks <= 3 ? 320 : 1414);
  await settle(6);
  const docs = I.allDocs().filter((d) => /^answer:/.test(d.key) && d.pages.length);
  eq(docs.length, 1, "the first stroke makes the answer's doc");
  assert(/^exam:compsci:4\.4\.2\.1:/.test(docs[0].item || ""), "its item names the question: " + docs[0].item);
  const holder = app.document.createElement("div");
  app.document.body.appendChild(holder);
  K.quiz.mountExam(holder, "maths", "2.1", [{ q: "x", marks: 2, ms: ["M1 sets up", "A1 correct"] }]);
  holder.querySelector("[data-ui~='quiz.reveal']").click();
  const boxes = holder.querySelectorAll("[data-ui~='quiz.selfmark'] input[type=checkbox]");
  boxes[1].checked = true; boxes[1].dispatchEvent(new app.window.Event("change"));
  eq(boxes[1].checked, false, "an A mark refuses to tick before its M");
  boxes[0].checked = true; boxes[0].dispatchEvent(new app.window.Event("change"));
  boxes[1].checked = true; boxes[1].dispatchEvent(new app.window.Event("change"));
  eq([boxes[0].checked, boxes[1].checked], [true, true], "with its M it ticks");
  holder.remove();
  K.show("ref", { subject: "compsci", ref: "4.4.2.1" });
  await settle();
  $("[data-tab='exam']").click();
  await settle();
  const pad2 = $("[data-ui~='pad']");
  assert(pad2, "the pad again (Write is remembered on this device)");
  eq(I.allDocs().filter((d) => /^answer:/.test(d.key) && d.pages.length).length, 1, "a fresh render starts blank");
  assert(/Earlier answers · 1/.test(pad2.textContent), "the earlier answer is a link");
  eq(app.errors, [], "no errors");
});

step("E · flashcards: Type · Write · Think", async () => {
  K.store.state.ui.fcMode = "think";
  K.show("ref", { subject: "compsci", ref: "4.4.2.1" });
  await settle();
  $("[data-tab='cards']").click();
  await settle();
  eq($$("[data-ui~='fc.modes'] [role=tab]").map((b) => b.textContent.trim()), ["Type", "Write", "Think"], "three answer modes");
  $("[data-ui~='fc.mode-write']").click();
  await settle();
  const show = $("[data-ui~='fc.show']");
  assert(show && show.disabled, "Show answer waits for ink");
  $("[data-ui~='fc.card']").click();
  assert(!/flipped/.test($("[data-ui~='fc.card']").getAttribute("data-state") || ""), "the card does not turn before an answer");
  assert($("[data-ui~='fc.answer'] [data-ui~='pad']"), "a strip under the card");
  $("[data-ui~='fc.mode-think']").click();
  await settle();
  assert($("[data-ui~='fc.answer']").hidden, "Think is the flip as it was");
});

step("F · working beside any tab", async () => {
  K.show("ref", { subject: "compsci", ref: "4.4.2.1" });
  await settle();
  $("[data-tab='cards']").click();
  await settle();
  assert($("[data-ui~='topic.workpane']").hidden, "the Working pane is closed when a tab opens");
  $("[data-ui~='topic.work']").click();
  await settle();
  const pane = $("[data-ui~='topic.workpane']");
  assert(!pane.hidden && pane.querySelector("[data-ui~='pad']"), "Working opens a blank page beside the tab");
  penOn(pane.querySelector(".k-ink-live"), 1000, 1414);
  await settle(6);
  $("[data-tab='quiz']").click();
  await settle();
  assert($("[data-ui~='topic.workpane']").hidden, "a tab change closes it: a revision tool never opens on old working");
  $("[data-tab='ink']").click();
  await settle(6);
  assert(/Working and answers · /.test(($(".k-topic-inkmode") || {}).textContent || ""), "the Handwritten tab lists the working it kept");
  eq(app.errors, [], "no errors");
});

step("G · the drills", async () => {
  (app.window.KOS_INK_DRILLS || []).forEach((d) => {
    d.refs.forEach((r) => assert(K.spec.node(d.sid + ":" + r), d.id + " names a real leaf: " + r));
    assert(d.features.length >= 3 && /<g/.test(d.svg) && !/#[0-9a-f]{3,6}\b/i.test(d.svg), d.id + " has a checklist and a colourless model");
  });
  const xp = K.store.state.governor.xp;
  K.inkDrills.writeOut({ title: "t", given: "Given x", steps: [{ m: "line 1", mk: "M1" }, { m: "line 2", mk: "A1" }], item: "writeout:test" });
  await settle();
  assert($("[data-ui~='drill.reveal']").disabled, "Reveal waits for the line to be written");
  penOn($("[data-ui~='drill.writeout'] .k-ink-live"), 1000, 320);
  await settle(6);
  assert(!$("[data-ui~='drill.reveal']").disabled, "the first stroke enables Reveal");
  $("[data-ui~='drill.reveal']").click();
  $("[data-ui~='drill.verdict'][data-v='had']").click();
  await settle(6);
  eq($$("[data-ui~='drill.step'][data-state~='done']").length, 1, "step 1 is done");
  assert(I.allDocs().some((d) => d.item === "writeout:test:s0" && d.verdict === "had"), "the verdict is kept as evidence on its own doc");
  eq(K.store.state.governor.xp, xp, "a drill pays nothing");
  const ov = $("[data-ui~='drill.writeout']").closest(".k-dialog-overlay");
  if (ov.close) ov.close(); else ov.remove();
  assert(K.inkDrills.pointsOf("compsci", "4.4.2.1").length > 2, "a blurt's points come from the notes");
  eq(app.errors, [], "no errors");
});

step("H · papers: questions and the import report", async () => {
  const P = K.pdfView;
  const aqa = [[{ s: "0", x: 0.09, y: 700 }, { s: "6", x: 0.12, y: 700.3 }, { s: ".", x: 0.14, y: 699.8 }, { s: "1", x: 0.16, y: 700 }, { s: "Figure 7", x: 0.19, y: 700 }]];
  eq(P.findQuestion(aqa, "Q06.1"), 0, "AQA's boxed 0 6 . 1, a fraction of a point apart");
  eq(P.findQuestion([[{ s: "06", x: 0.09, y: 715 }, { s: "1", x: 0.14, y: 715 }, { s: "All marks AO2", x: 0.18, y: 715 }]], "Q06.1"), 0, "a scheme's Qu and Pt columns");
  const edx = [[{ s: "2", x: 0.14, y: 62 }], [{ s: "1.", x: 0.12, y: 800 }, { s: "Find", x: 0.15, y: 800 }], [{ s: "4", x: 0.14, y: 62 }], [{ s: "2.", x: 0.12, y: 800 }]];
  eq(P.mapQuestions(edx, ["Q1", "Q2"]), { Q1: 1, Q2: 3 }, "Edexcel's \"2.\", never the page number 2");
  eq(P.mapQuestions([[{ s: "02.1", x: 0.05, y: 700 }], [{ s: "01.1", x: 0.05, y: 700 }], [{ s: "02.1", x: 0.05, y: 700 }]], ["Q01.1", "Q02.1"]), { "Q01.1": 1, "Q02.1": 2 }, "questions run forward through the paper");
  const file = (name) => { const b = new app.window.Blob(["x"], { type: "application/pdf" }); Object.defineProperty(b, "name", { value: name }); return b; };
  const res = await cb((d) => K.examPapers.add([
    { file: file("2023-06 QP.pdf"), path: "Past Papers/Computer Science (AQA)/A-level/Paper 2/2023-06 QP.pdf" },
    { file: file("Computer Science mock 2024.pdf"), path: "School/Mocks/Computer Science mock 2024.pdf" },
    { file: file("notes.docx"), path: "Past Papers/Computer Science (AQA)/notes.docx" },
    { file: file("2023-06 QP.pdf"), path: "Past Papers/Computer Science (AQA)/A-level/Paper 2/2023-06 QP.pdf" }
  ], d));
  eq(res.report.map((r) => r.outcome), ["matched", "added", "skipped", "skipped"], "every file has an outcome");
  assert(/mock/.test(res.report[1].why), "a mock is added and offered: " + res.report[1].why);
  eq([res.report[2].why, res.report[3].why], ["not a PDF", "already in the library"], "and every skip says why");
});

step("I · settings: Pen and ink", async () => {
  K.show("pen");
  await settle();
  assert($("[data-ui~='pen.page']"), "the page");
  assert(/No pen yet|Working|Not seen/.test($("[data-ui~='pen.status']").textContent), "what the app saw of the pen");
  assert($("[data-ui~='pen.finger']") && $("[data-ui~='pen.wake']") && $("[data-ui~='pen.ai-read']"), "the switches");
  eq($("[data-ui~='pen.ai-read']").checked, false, "Kurenai reading handwriting is off by default");
  eq(K.inkAI.reads(), false, "and so is every request that would read it");
  eq(app.errors, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke105: " + failed + " failed" : "smoke105: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
