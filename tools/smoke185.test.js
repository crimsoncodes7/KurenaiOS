/* Kurenai OS — smoke185.test.js
   Exams & Papers, reworked around one exam (docs/exams-rework-plan.md
   §4–§8, design turns 45–47): the pages.

     A · All exams (45a): the next exam's hero with today's session, every
         exam as a row with ONE state word; the hub's tab row is Exams ·
         Timetable · Results · Library · Load; old addresses redirect
         (guide → Revise, readiness → Today).
     B · An exam (45b): eight sections in the sidebar, each with a mark;
         Today (45c) is computed, never stored — a render writes nothing;
         the strip names the action that fills an empty cell, never "Not
         enough evidence".
     C · Topics (45d): one row per topic, weakest first; a confidence chip
         cycles Red · Amber · Green through KOS.rag; a two-paper scope
         shows its paper.
     D · Plan (45f): the days to the exam with sessions placed; nothing is
         written until Send, which writes only this exam's personal Pacing
         rows (invariant 126).
     E · Revise (46a–46e, 46g): chapters in order, a chapter marked read
         per device, the cheat sheet and the night before; the card drill
         is the flashcard run with a clock.
     F · Questions (46f): three sets; ONE question at a time through
         KOS.quiz.mountExam.
     G · Papers and Review (47a, 47e–47h): a paper sat and marked logs ONE
         attempt; Review shows the score and the estimated grade from the
         IT unit boundaries; a reply that does not fit stores nothing; one
         that fits is stored and its actions become targets; a target
         measured by minutes a mark closes after two attempts meet it.
     H · no errors, no request.

   Run: node tools/smoke185.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
let app, K, D, F, C;
const day = (n) => K.srs.addDays(K.srs.todayISO(), n);
const q = (s) => D.querySelector(s);
const qa = (s) => Array.from(D.querySelectorAll(s));
const text = (s) => (q(s) || {}).textContent || "";
function snap() { return JSON.stringify(Object.assign({}, K.store.state, { ui: null })); }

step("boot", async () => {
  app = await boot(); K = app.KOS; D = app.document; await app.settle();
  F = K.exams.add({ preset: "ocr-f201", tier: "mock", title: "F201 mock", date: day(27), time: "09:00" }, { quiet: true });
  C = K.exams.add({ preset: "aqa-7517-ppe", tier: "mock", title: "CS PPE", date: day(28), time: "09:00" }, { quiet: true });
});

step("A · All exams: the hero, the rows, the tabs, the redirects", async () => {
  K.show("exams"); await app.settle();
  assert(q("[data-ui~='exams.all']"), "All exams draws");
  const tabs = qa("[data-ui~='exams.tabs'] [role='tab']").map((b) => b.getAttribute("aria-label") || b.textContent.replace(/\d+$/, "").trim());
  eq(tabs.map((t) => t.replace(/\s*\d+$/, "")), ["Exams", "Timetable", "Results", "Library", "Load"], "one tab row");
  assert(q("[data-ui~='exams.next'] [data-ui~='exams.hero-steps']"), "the next exam carries today's session");
  const rows = qa("[data-ui~='exams.row']");
  assert(rows.length >= 2, "every exam is a row");
  rows.forEach((r) => { const st = r.querySelector("[data-ui~='exams.state']"); assert(st && /On track|Behind|Started|Not started|Needs a scope/.test(st.textContent), "one state word: " + (st && st.textContent)); });
  assert(!/Not enough evidence/.test(text("#main")), "no 'Not enough evidence' anywhere");
  K.show("exams", { tab: "guide", sub: F.id }); await app.settle();
  assert(q("[data-ui~='exams.revise']"), "the old Companion address opens Revise (D3)");
  K.show("exams", { id: F.id, tab: "readiness" }); await app.settle();
  assert(q("[data-ui~='exams.s-today']"), "an exam's old Readiness opens Today");
  for (const t of ["timetable", "results", "library", "load"]) { K.show("exams", t); await app.settle(); assert(q("[data-ui~='exams.tabs']"), t + " keeps the tab row"); }
});

step("B · An exam: eight sections with marks; Today computed and read-only", async () => {
  const before = snap();
  K.show("exams", { id: F.id }); await app.settle();
  eq(qa("[data-ui~='exams.sections'] [data-ui~='exams.section']").map((b) => b.getAttribute("data-section")),
    ["today", "plan", "topics", "revise", "questions", "papers", "review", "day"], "the eight sections");
  assert(q("[data-ui~='exams.s-today']"), "an exam with a scope opens on Today");
  eq(qa("[data-ui~='exams.cell']").length, 4, "Coverage · Recall · Practice · Calibration");
  assert(/Do a timed paper to see this/.test(text("[data-ui~='exams.strip']")), "an empty cell names its action");
  const td = K.examSession.today(F);
  assert(td.steps.length >= 1 && td.steps.length <= 5, "three to five steps at most: " + td.steps.length);
  assert(td.steps.some((s) => s.kind === "topic"), "the weakest topic's next step");
  eq(snap(), before, "drawing Today writes nothing");
  /* a paper day places a paper (the exam's own weekday) */
  const pd = K.examSession.nextPaperDay(F, K.srs.todayISO());
  assert(pd && new Date(pd + "T00:00:00").getDay() === new Date(F.date + "T00:00:00").getDay(), "paper days fall on the exam's weekday");
});

step("C · Topics: rows weakest first; confidence cycles; two papers named", async () => {
  K.show("exams", { id: C.id, tab: "topics" }); await app.settle();
  const rows = qa("[data-ui~='exams.topic']");
  assert(rows.length === K.examSession.topics(C).length && rows.length >= 10, "one row per topic: " + rows.length);
  assert(q("[data-ui~='exams.plc'][data-multi]"), "the PPE's paper column shows");
  eq(K.examSession.papersOf(C).map(K.examSession.paperShort), ["P1", "P2"], "both papers");
  const t0 = K.examSession.topics(C)[3];
  const chip = q("[data-key='" + t0.key + "'] [data-ui~='exams.rag']");
  chip.click(); await app.settle();
  eq(K.rag.effective(t0.sid, t0.ref).band, "r", "a first tap is Red");
  q("[data-key='" + t0.key + "'] [data-ui~='exams.rag']").click(); await app.settle();
  eq(K.rag.effective(t0.sid, t0.ref).band, "a", "then Amber");
  eq(K.examSession.weakest(K.examSession.topics(C))[0].key, t0.key, "the only rated-down topic sorts first");
  q("[data-key='" + t0.key + "']").click(); await app.settle();
  assert(q("[data-ui~='exams.topic-open'] [data-ui~='exams.topic-read']"), "a row opens to Read the chapter");
  K.rag.setManual(t0.sid, t0.ref, null);
});

step("D · Plan: computed until Send; Send writes only this exam's rows", async () => {
  const sch = K.examSession.schedule(F, { hours: 4 });
  assert(sch.sessions > 4 && sch.days[sch.days.length - 1].exam, "sessions placed, the exam last: " + sch.sessions);
  assert(sch.days.some((d) => d.items.some((i) => i.kind === "paper")), "a paper day");
  assert(sch.days[sch.days.length - 2].items[0].kind === "night", "the night before, the day before");
  const rowsBefore = K.pacing.entries().length;
  K.show("exams", { id: F.id, tab: "plan" }); await app.settle();
  eq(K.pacing.entries().length, rowsBefore, "drawing the plan writes no Pacing row");
  const r = K.examSession.sendSchedule(F, sch);
  const mine = K.pacing.entries().filter((e) => e.tag === "exam:" + F.id);
  assert(r.added + r.skipped === sch.sessions && mine.length === r.added, "Send writes a row a session (or names the ones outside Pacing): " + JSON.stringify(r));
  assert(mine.every((e) => e.source === "personal"), "personal rows only");
  mine.forEach((e) => K.pacing.removeEntry(e.id));
});

step("E · Revise: chapters, read per device, the drill", async () => {
  const chs = K.examSession.chapters(F);
  eq(chs[0].kind, "essentials", "Exam essentials first");
  eq(chs.slice(-3).map((c) => c.kind), ["lose", "cheat", "night"], "yours last");
  K.show("exams", { id: F.id, tab: "revise", sub: chs[1].id }); await app.settle();
  assert(q("[data-ui~='exams.sections'][data-folded]"), "Revise folds the sidebar");
  assert(q("[data-ui~='exams.chapter'] .k-callout"), "key notes come through the notes renderer");
  assert(qa("[data-ui~='exams.toc'] [data-ui~='exams.toc-link']").length >= 3, "On this page");
  q("[data-ui~='exams.chapter-read']").click(); await app.settle();
  assert(K.examSession.isRead(F.id, chs[1].id), "Mark as read");
  assert(K.store.state.ui.examRead[F.id + "|" + chs[1].id], "kept per device (state.ui)");
  K.show("exams", { id: F.id, tab: "revise", sub: "cheat" }); await app.settle();
  assert(qa("[data-ui~='exams.cheat'] section").length >= 3 && qa("[data-ui~='exams.cheat'] section").length <= 9, "nine short blocks at most");
  K.show("exams", { id: F.id, tab: "revise", sub: "night" }); await app.settle();
  assert(qa("[data-ui~='exams.night'] input[type=checkbox]").length >= 4, "the night-before checklist");
  K.show("exams", { id: F.id, tab: "revise", sub: "drill" }); await app.settle();
  assert(q("[data-ui~='exams.drill'] [data-ui~='fc.wrap'], [data-ui~='exams.drill']") && q("[data-ui~='exams.drill-clock']"), "the drill is the card run with a clock");
  K.show("exams", { id: F.id }); await app.settle();
});

step("F · Questions: three sets, one question at a time", async () => {
  eq(K.examSession.sets(F).map((s) => s.id), ["weak", "six", "wrong"], "the three sets");
  K.show("exams", { id: F.id, tab: "questions", sub: "six" }); await app.settle();
  eq(qa("[data-ui~='exams.q-card']").length, 1, "one question on the page");
  assert(q("[data-ui~='exams.q-engine'] [data-ui~='pad.answer']") || q("[data-ui~='exams.q-engine'] textarea"), "with room to answer (the study engine)");
  assert(K.examSession.sets(F)[1].items.every((x) => x.marks >= 6), "six-markers are 6+");
});

step("G · Papers, the attempt, Review, feedback and targets", async () => {
  K.show("exams", { id: F.id, tab: "papers" }); await app.settle();
  assert(qa("[data-ui~='exams.paper-row']").length >= 2, "board style and from your scope");
  K.show("exams", { id: F.id, tab: "paper", sub: "1" }); await app.settle();
  q("[data-ui~='exams.timed-start']").click(); await app.settle();
  assert(qa("[data-ui~='exams.tpad']").length >= 1, "a pad under every part");
  q("[data-ui~='exams.tend']").click(); await app.settle();
  qa("[data-ui~='exams.mchip']").forEach((c, i) => { if (i % 2 === 0 && !c.disabled) c.click(); });
  const n0 = K.tracker.all().length;
  q("[data-ui~='exams.tally-log']").click(); await app.settle(); await new Promise((r) => setTimeout(r, 200)); await app.settle();
  eq(K.tracker.all().length, n0 + 1, "ONE attempt logged (invariant 124)");
  eq(K.examSession.papers(F).sat, 1, "paper 1 counts as sat");
  /* the estimated grade from the IT unit boundaries */
  const g = K.examReview.grade(F, 41, 60);
  eq([g.grade, g.next.grade, g.next.need], ["Merit", "Distinction", 7], "41 of 60 is Merit, 7 to Distinction");
  K.show("exams", { id: F.id, tab: "review" }); await app.settle(); await new Promise((r) => setTimeout(r, 200)); await app.settle();
  assert(q("[data-ui~='exams.review-score']") && q("[data-ui~='exams.review-grade']"), "the score and the estimated grade");
  assert(/estimate|straight line/i.test(text("[data-ui~='exams.review-grade']")), "labelled as an estimate");
  /* a reply that does not fit stores nothing */
  q("[data-ui~='exams.add-feedback']").click(); await app.settle();
  const ta = q("[data-ui~='exams.feedback-paste']");
  ta.value = "Great work! No JSON here."; ta.dispatchEvent(new app.window.Event("input")); await app.settle();
  assert(q("[data-ui~='exams.feedback-bad']") && q("[data-ui~='exams.feedback-store']").disabled, "a reply that does not fit is named and cannot be stored");
  ta.value = 'Review.\n```json\n{"kos":"exam-feedback/1","model":"Claude Opus","summary":"Apply it to the organisation.","remark":[],"findings":[{"parts":["6"],"error_type":"technique","what":"No weighed conclusion","lost":3}],"actions":[{"text":"Write a weighed conclusion on every 9-marker","kind":"technique"},{"text":"≤ 1.5 min a mark on 2-markers","kind":"timing"}]}\n```';
  ta.dispatchEvent(new app.window.Event("input")); await app.settle();
  qa("[data-ui~='exams.feedback-target']").forEach((b) => b.click());
  q("[data-ui~='exams.feedback-store']").click(); await new Promise((r) => setTimeout(r, 300)); await app.settle();
  const ts = K.examSession.targets(F.id);
  eq(ts.length, 2, "both actions became targets");
  const mpm = ts.filter((t) => t.rule.type === "mpm")[0];
  assert(mpm && mpm.rule.max === 1.5 && mpm.rule.lo === 2, "the timing target reads its rule: " + JSON.stringify(mpm && mpm.rule));
  /* two attempts meeting it close it */
  const fig = (uid) => ({ uid, parts: [{ id: "1", marks: 2, timeMs: 150000 }, { id: "2", marks: 2, timeMs: 160000 }] });
  K.examSession.noteEvidence(mpm, "u1", fig("u1"));
  eq(K.examSession.targets(F.id).filter((t) => t.id === mpm.id)[0].state, "open", "met once: still open");
  K.examSession.noteEvidence(K.examSession.targets(F.id).filter((t) => t.id === mpm.id)[0], "u2", fig("u2"));
  eq(K.examSession.targets(F.id).filter((t) => t.id === mpm.id)[0].state, "met", "met twice: closed by evidence");
  K.show("exams", { id: F.id, tab: "today" }); await app.settle();
  assert(K.examSession.today(F).steps.some((s) => s.kind === "target"), "an open target rides Today");
  K.show("exams", { id: F.id, tab: "review", sub: "targets" }); await app.settle();
  eq(qa("[data-ui~='exams.target']").length, 2, "Targets lists both");
});

step("I · Scope from a list (45e): every line matched, chosen or kept; nothing dropped", async () => {
  const r = K.examSession.matchList("Y1:\nLogic gates and Boolean algebra\nOOP\nStacks\nRecursion\nGraphs\nSorting and searching\nDatabases\nPractise past paper questions", "compsci");
  eq(r.skipped, ["Y1:"], "a year heading is skipped and listed");
  const by = {}; r.rows.forEach((x) => { by[x.line] = x; });
  eq(by["Logic gates and Boolean algebra"].matches.map((m) => m.ref), ["4.6.4", "4.6.5"], "a line joined by 'and' matches both");
  eq(by["OOP"].matches.map((m) => m.ref), ["4.1.2.3"], "an abbreviation is spelled out");
  eq(by["Stacks"].matches.map((m) => m.ref), ["4.2.3"], "a title that IS the line wins");
  eq(by["Recursion"].matches.map((m) => m.ref), ["4.1.1.16"], "recursion → recursive techniques");
  eq(by["Practise past paper questions"].state, "none", "no match stays visible");
  const x = K.exams.add({ tier: "mock", subject: "compsci", title: "Pasted", date: day(30) }, { quiet: true });
  K.show("exams", { id: x.id }); await app.settle();
  q("[data-ui~='exams.scope-paste']").click(); await app.settle();
  const ta = q("[data-ui~='exams.scope-paste-box']");
  ta.value = "OOP\nStacks\nDatabases\nRevise the lot";
  q("[data-ui~='exams.scope-read']").click(); await app.settle();
  assert(/Confirm 3 topics/.test(q("[data-ui~='exams.scope-confirm']").textContent), "Confirm counts what is saved");
  q("[data-ui~='exams.scope-confirm']").click(); await app.settle();
  const a = K.exams.get(x.id);
  eq(a.scope.include, ["compsci:4.1.2.3", "compsci:4.2.3", "compsci:4.10"], "the scope as matched");
  assert(/Revise the lot/.test(a.notes), "the unmatched line is kept in the notes, not dropped");
  K.exams.remove(x.id);
});

step("H · no errors, no request", async () => {
  eq(app.errors, [], "no error");
  assert(!app.fetches.length, "no request: " + JSON.stringify(app.fetches.slice(0, 3)));
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 4).join("\n       ")); }
  }
  console.log(failed ? "smoke185: " + failed + " failed" : "smoke185: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
