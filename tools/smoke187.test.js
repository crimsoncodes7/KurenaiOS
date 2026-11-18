/* Kurenai OS — smoke187.test.js
   The Exams & Papers audit of 18 November 2026 (docs/exams-audit-2026-11-18.md):
   what the user found and what the audit found, held.

     A · A4 SHEETS (U1). A paper is laid out on fixed sheets: the cover its
         own, the questions flowing (more than one on a sheet), every sheet
         with its footer and number; the mark scheme flows its rows over
         sheets with the head repeated; Print prints the paper alone, the
         paper and its scheme, or the scheme alone, never the app; the Papers
         row's Print is a menu, not a navigation; the page rule rides each
         print (margin 0 for sheets).
     B · OCR IN THE INDEX (U7). F201's SAM is a paper and a sitting with 23
         parts and 60 marks; OCR's file names match by unit name, with
         underscores; the annotated SAM is its scheme; the F201 preset reads
         it; its blueprint still has questions (specimen-only paper).
     C · THE PAPERS SECTION (U2, U8, A1, A2). One count for the sidebar and
         the section; the scope's paper shows marks and time on a topic
         test; past papers are listed in the section for a preset exam and
         for a school mock reading two papers.
     D · LOG A RESULT (U4, U5, U6). Grade is the subject's scale (A*–U; IT
         Distinction*–U) with Not graded; a grade logged before is kept; the
         prediction line says plainly how far off; a past topic test can
         take its result.
     E · ATTEMPTS AND EXAMS (U10, U11). An attempt deletes with Undo, which
         puts it back; Review's ⋯ edits and deletes; an exam's header and its
         row carry ⋯ with Edit, Archive and Delete; an archived exam stays
         reachable under All exams.
     F · THE VIEWER'S QUESTIONS (U9). OCR's "1(a)", "(b)", "(ii)" and a bare
         "5" are found on their pages; AQA and Edexcel still are.
     G · SMALLER (U3, A5). Exams settings: the words before the control;
         Today's weakest topic says whose rating it is; no "After this".
     H · no errors, no request.

   Run: node tools/smoke187.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
let app, K, D, F, C, T, M;
const day = (n) => K.srs.addDays(K.srs.todayISO(), n);
const q = (s) => D.querySelector(s);
const qa = (s) => Array.from(D.querySelectorAll(s));
function closeDialogs() { qa(".k-dialog-overlay").forEach((o) => o.remove()); }

step("boot", async () => {
  app = await boot(); K = app.KOS; D = app.document; await app.settle();
  F = K.exams.add({ preset: "ocr-f201", tier: "mock", title: "F201 mock", date: day(27), time: "09:00" }, { quiet: true });
  C = K.exams.add({ preset: "aqa-7517-ppe", tier: "mock", title: "CS PPE", date: day(28), time: "09:00" }, { quiet: true });
  M = K.exams.add({ preset: "edexcel-9ma0-pure-mock", tier: "mock", title: "Pure mock", date: day(30), time: "09:00" }, { quiet: true });
  T = K.exams.add({ tier: "topic_test", subject: "compsci", title: "DB test", date: day(-2), scope: { include: ["compsci:4.10"], exclude: [] } }, { quiet: true });
});

step("A · A4 sheets: flowing questions, footers, the scheme over sheets, Print without the app", async () => {
  const paper = K.examPaper.build(F, 1);
  const sheets = K.examPaperView.pageEls(F, paper, true);
  const qs = sheets.filter((s) => s.classList.contains("k-ex-pq")), ms = sheets.filter((s) => s.classList.contains("k-ex-ms-page"));
  assert(sheets[0].classList.contains("k-ex-cover") && sheets.every((s) => s.classList.contains("k-ex-sheet")), "every page is a sheet, the cover first");
  /* questions flow: a sheet carries the end of one question and the start
     of the next (it used to be one question a page, however short) */
  assert(qs.length >= 2, "the questions take sheets: " + qs.length);
  assert(qs.some((s) => s.querySelectorAll(".k-ex-pq-n").length && Array.from(s.querySelectorAll(".k-ex-pq-n")).filter((n) => n.textContent).length >= 2), "a sheet holds two questions' starts");
  assert(qs.some((s) => s.querySelectorAll(".k-ex-su").length > 1), "a sheet holds more than one part");
  sheets.forEach((s, i) => { const f = s.querySelector(".k-ex-ppage-f"); assert(f && /written by KurenaiOS, not a board paper/.test(f.textContent), "sheet " + (i + 1) + " has its footer"); });
  assert(/Turn over/.test(sheets[0].querySelector(".k-ex-ppage-f").textContent), "a page before more questions says Turn over");
  assert(ms.length >= 1 && ms.every((s) => s.querySelector("thead")), "the scheme's head on each of its sheets");
  assert(/Level 3/.test(ms.map((s) => s.textContent).join(" ")), "the scheme's levels are there");
  /* the three prints, never the app */
  K.examGuide.printNow = ((orig) => function (root, o) { app.window.__printed = { kids: Array.from(root.children).map((x) => x.className), sheets: !!(o && o.sheets) }; root.remove(); })(K.examGuide.printNow);
  K.examPaperView.print(F, paper, "paper");
  let pr = app.window.__printed;
  assert(pr.sheets && pr.kids.length && pr.kids.every((c) => !/k-ex-ms-page/.test(c)), "The paper: the paper's sheets only, as sheets");
  K.examPaperView.print(F, paper, "scheme");
  pr = app.window.__printed;
  assert(pr.kids.length && pr.kids.every((c) => /k-ex-ms-page/.test(c)), "The mark scheme: the scheme alone");
  K.examPaperView.print(F, paper, "both");
  assert(app.window.__printed.kids.length === sheets.length, "both: every sheet");
  /* the Papers row's Print is a menu (it used to open the page and print the app) */
  K.show("exams", { id: F.id, tab: "papers" }); await app.settle();
  const pb = q("[data-ui~='exams.papers-board'] [data-ui~='exams.paper-print']");
  assert(pb && pb.getAttribute("aria-haspopup") === "menu", "Print on a row is a menu");
  const before = JSON.stringify(app.window.location.hash);
  pb.click(); await app.settle();
  const items = qa("[role='menuitem']").map((b) => b.textContent);
  eq(items, ["The paper", "The paper and its mark scheme", "The mark scheme"], "the three prints");
  qa("[role='menuitem']")[0].click(); await app.settle();
  eq(JSON.stringify(app.window.location.hash), before, "printing does not navigate");
  /* the page rule: sheets print edge to edge, a pack keeps its margin */
  const css = require("fs").readFileSync(require("path").join(__dirname, "..", "css/views/exams.css"), "utf8");
  assert(!/^\s*@page\s*\{/m.test(css), "no global @page: each print sets its own");
  assert(/k-ex-ppage\.k-ex-sheet \{ zoom: 1\.333;/.test(css) && /data-printing="exams"\], :root\[data-printing="exams"\] body \{ background: var\(--ex-paper\)/.test(css), "a sheet scales to A4 on white paper");
});

step("B · OCR's F201 in the index; its file names match; the preset reads it", () => {
  const ix = app.window.KOS_EXAMS.index;
  assert(ix.papers["ocr-f201"] && ix.papers["ocr-f201"].subject === "it", "F201 is an index paper");
  const rows = ix.questions.filter((r) => r[0] === "ocr-f201" && r[1] === "specimen");
  eq([rows.length, rows.reduce((s, r) => s + r[4], 0)], [23, 60], "23 parts, 60 marks");
  const m1 = K.examPapers.match("OCR_Big_Data_and_Machine_Learning.pdf"), m2 = K.examPapers.match("OCR_Big_Data_and_Machine_Learning_Annotated.pdf");
  eq([m1.paper, m1.sitting, m1.kind], ["ocr-f201", "specimen", "qp"], "the SAM matches as the paper");
  eq([m2.paper, m2.sitting, m2.kind], ["ocr-f201", "specimen", "ms"], "the annotated SAM as its scheme");
  eq(K.examPapers.match("Downloads/OCR F201 SAM.pdf").paper, "ocr-f201", "by unit number too");
  assert(!K.examPapers.match("OCR_IT_Data_Analytics_Specification.pdf").paper, "the specification is not a paper");
  eq(K.examCompanion.indexPaperOf(F), "ocr-f201", "the F201 preset reads its index paper");
  const bp = K.examPaper.blueprint(F);
  assert(bp.marks === 60 && bp.questions >= 6, "a specimen-only paper still has a blueprint: " + bp.marks + " marks, " + bp.questions + " questions");
});

step("C · the Papers section: one count, the scope's paper sized, past papers in place", async () => {
  const pp = K.examSession.papers(F);
  eq(pp.of, pp.board.length + 1, "the count includes the scope's paper");
  K.show("exams", { id: F.id, tab: "papers" }); await app.settle();
  assert(new RegExp("0 of " + pp.of + " sat").test(q("#main").textContent), "the section says the same count");
  const tp = K.examSession.papers(T);
  assert(tp.built.marks && tp.built.mins, "a topic test's paper has marks and time: " + tp.built.marks + ", " + tp.built.mins);
  eq(K.examSession.pastPapers(F).map((p) => p.pid), ["ocr-f201"], "F201's past paper");
  const ppe = K.examSession.pastPapers(C).map((p) => p.pid);
  assert(ppe.indexOf("aqa-7517-1") !== -1 && ppe.indexOf("aqa-7517-2") !== -1, "the PPE reads both papers: " + ppe);
  assert(q("[data-ui~='exams.papers-past']"), "past papers are in the section, not behind the Library");
});

step("D · Log a result: the grade's scale, the prediction said plainly, any tier's result", async () => {
  K.trackerLog({ assessmentId: F.id }, () => {}); await app.settle();
  const g = q("[data-ui~='tracker.grade']");
  assert(g && g.tagName === "SELECT", "Grade is a dropdown");
  eq(Array.from(g.options).map((o) => o.value), ["", "Distinction*", "Distinction", "Merit", "Pass", "U"], "IT's scale for an IT exam");
  const p = q("[data-ui~='tracker.predicted']"), m = q("[data-ui~='tracker.marks']"), x = q("[data-ui~='tracker.max']");
  p.value = "34"; m.value = "34"; x.value = "38";
  [p, m, x].forEach((i) => i.dispatchEvent(new app.window.Event("input", { bubbles: true })));
  assert(/Spot on: you predicted 34 and got 34/.test(q("[data-ui~='tracker.preview']").textContent), "spot on, said plainly");
  m.value = "31"; m.dispatchEvent(new app.window.Event("input", { bubbles: true }));
  assert(/You got 3 marks fewer than you predicted \(34\)/.test(q("[data-ui~='tracker.preview']").textContent), "the gap, said plainly");
  assert(!/0 marks/.test(q("[data-ui~='tracker.preview']").textContent), "no '0 marks'");
  const r = q("[data-ui~='tracker.result']"); r.checked = true; r.dispatchEvent(new app.window.Event("change", { bubbles: true }));
  const opts = Array.from(q("[data-ui~='tracker.assessment']").options).map((o) => o.value);
  assert(opts.indexOf(T.id) !== -1, "a past topic test can take its result");
  closeDialogs();
  /* A-level scale, and an old typed grade kept */
  const e = K.tracker.add({ kind: "paper", subject: "compsci", paper: "Old", marks: 50, max: 75, grade: "B / 6", date: day(-3) });
  K.trackerEdit(e, () => {}); await app.settle();
  const g2 = q("[data-ui~='tracker.grade']");
  eq(Array.from(g2.options).slice(0, 8).map((o) => o.value), ["", "A*", "A", "B", "C", "D", "E", "U"], "A-level scale");
  eq(g2.value, "B / 6", "a grade typed before is kept");
  closeDialogs();
  K.tracker.remove(e.id);
});

step("E · attempts delete with Undo; exams carry Edit, Archive and Delete", async () => {
  const e = K.tracker.add({ kind: "paper", subject: "it", paper: "Audit attempt", marks: 41, max: 60, date: day(0), assessmentId: F.id });
  K.show("exams", { id: F.id, tab: "review" }); await app.settle();
  const more = q("[data-ui~='exams.attempt-more']");
  assert(more, "Review's attempt has ⋯");
  more.click(); await app.settle();
  eq(qa("[role='menuitem']").map((b) => b.textContent), ["Edit this attempt", "Marks by question", "Delete this attempt"], "edit, marks, delete");
  qa("[role='menuitem']")[2].click(); await app.settle();
  q("[data-ui~='ui.confirm-yes']").click(); await app.settle();
  assert(!K.tracker.all().some((x) => x.id === e.id), "deleted");
  const undo = q(".k-toast-act");
  assert(undo && /Undo/.test(undo.textContent), "with Undo");
  undo.click(); await app.settle();
  assert(K.tracker.all().some((x) => x.id === e.id), "Undo puts it back");
  K.tracker.remove(e.id);
  /* the exam's own ⋯ */
  K.show("exams", { id: M.id, tab: "today" }); await app.settle();
  const em = q("[data-ui~='exams.exam-more']");
  assert(em, "the exam's header has ⋯");
  em.click(); await app.settle();
  eq(qa("[role='menuitem']").map((b) => b.textContent), ["Edit details", "Archive", "Delete…"], "edit, archive, delete");
  qa("[role='menuitem']")[1].click(); await app.settle();
  assert(K.exams.get(M.id).archived, "archived");
  K.show("exams"); await app.settle();
  assert(q("[data-ui~='exams.archived']") && q("[data-ui~='exams.archived'] [data-id='" + M.id + "']"), "an archived exam stays reachable");
  assert(qa("[data-ui~='exams.row']").length && q(".k-xs-uprowwrap [data-ui~='exams.exam-more']"), "every row has ⋯ beside it");
  assert(!q("[data-ui~='exams.row'] [data-ui~='exams.exam-more']"), "never inside the row's button");
  K.exams.update(M.id, { archived: false });
  assert(typeof K.examDelete === "function", "Delete is one function, from the page, the row and the editor");
});

step("F · the viewer finds OCR's questions as well as AQA's and Edexcel's", () => {
  const L = (s, x, y) => ({ s, x, y });
  const text = [
    [L("Cover", 0.1, 700)],
    [L("1", 0.08, 700), L("(a)", 0.12, 700), L("State…", 0.2, 700), L("(b)", 0.12, 500)],
    [L("(c)", 0.12, 700), L("2", 0.08, 400), L("(a)", 0.12, 400)],
    [L("(b)", 0.12, 700), L("(i)", 0.16, 650), L("(ii)", 0.16, 300)],
    [L("5", 0.08, 700), L("When customers…", 0.2, 700)]];
  const m = K.pdfView.mapQuestions(text, ["1(a)", "1(b)", "1(c)", "2(a)", "2(b)(i)", "2(b)(ii)", "5"]);
  eq(m, { "1(a)": 1, "1(b)": 1, "1(c)": 2, "2(a)": 2, "2(b)(i)": 3, "2(b)(ii)": 3, "5": 4 }, "OCR's parts on their pages");
  const aqa = K.pdfView.mapQuestions([[L("0", 0.06, 700), L("1", 0.08, 700), L(".", 0.1, 700), L("1", 0.11, 700)], [L("0", 0.06, 600), L("2", 0.08, 600)]], ["Q01.1", "Q02"]);
  eq(aqa, { "Q01.1": 0, "Q02": 1 }, "AQA's boxed numbers still");
  const edx = K.pdfView.mapQuestions([[L("3.", 0.06, 700)], [L("4.", 0.06, 600)]], ["Q3", "Q4"]);
  eq(edx, { Q3: 0, Q4: 1 }, "Edexcel's numbered questions still");
});

step("G · Exams settings and Today read clearly", async () => {
  K.examGuide.settings(); await app.settle();
  const row = q("[data-ui~='exams.set-extra']").closest(".k-ex-swrow");
  assert(row.firstElementChild.tagName === "SPAN" && row.lastElementChild === q("[data-ui~='exams.set-extra']"), "the words first, the control beside them");
  closeDialogs();
  const td = K.examSession.today(T, K.srs.todayISO());
  const weak = td.steps.filter((s) => s.kind === "topic")[0];
  if (weak && /Red|Amber/i.test(weak.reason)) assert(/you rated it (Red|Amber)/.test(weak.reason), "the rating is yours: " + weak.reason);
  K.show("exams", { id: T.id, tab: "today" }); await app.settle();
  assert(!/After this/.test(q("#main").textContent), "no After this repeating a step");
});

step("H · no errors, no request", async () => {
  [F, C, M, T].forEach((a) => K.exams.remove(a.id));
  eq(app.errors, [], "no error");
  assert(!app.fetches.length, "no request: " + JSON.stringify(app.fetches.slice(0, 3)));
});

(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { console.error("  FAIL " + name + "\n       " + (e && e.stack || e)); process.exit(1); }
  }
  console.log("smoke187: all " + steps.length + " steps passed");
  process.exit(0);
})();
