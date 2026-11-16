/* Kurenai OS — smoke155.test.js
   Roadmap 5.19 item 4 (design turn 44): quiz and exam questions on the
   review schedule, their history, an unmarked iPad attempt carried on and
   the review analytics as one strip.

     A · keys and grades: a question's key survives a fork and a bank's
         place; marks grade Again / Hard / Good / Easy at 50, 80 and 100%.
     B · answering: the first answer schedules it, an answer before its day
         is history only, a miss waits for tomorrow, never a leech; the
         review log names it a question and the optimiser leaves it out.
     C · Due today's questions: capped per subject a day, an answer back
         counting against the cap, the cap set per subject, IT's archived
         units left out; reads write nothing.
     D · the quiz records each answer; its History is weakest first and
         "Quiz the weakest" asks those items under their own keys; the
         inspector's Quiz best opens it.
     E · an exam question logged keeps its marks and the points ticked; the
         card draws the line, "Again in N days" and the last answer.
     F · Due today: three kinds, the caps card, the questions run asks each
         and moves on.
     G · Maths' several-step cards moved to exam questions: out of the deck
         with every other card's key kept, in the exam items under "c<i>",
         their schedule copied once at boot; the list is current.
     H · the answer pad offers an unmarked attempt to carry on with its ink;
         a marked one is not offered.
     I · the subject desk's review strip: Cards → Questions → Papers.

   Run: node tools/smoke155.test.js */
"use strict";
const path = require("path");
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const ROOT = path.join(__dirname, "..");
let app, K, doc;
const $ = (s, r) => (r || doc).querySelector(s);
const $$ = (s, r) => [...(r || doc).querySelectorAll(s)];
const TODAY = "2026-11-16";

step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS; doc = app.document;
});

step("A · keys and grades", () => {
  const Q = K.questions;
  eq(Q.keyOf("quiz", "maths", "1.1", { q: "x" }, 3), "q:maths:1.1:3", "a shipped item by its place");
  eq(Q.keyOf("quiz", "maths", "1.1", { id: "s3" }, 0), "q:maths:1.1:3", "a fork's shipped row keeps it");
  eq(Q.keyOf("quiz", "maths", "1.1", { id: "ab12" }, 7), "q:maths:1.1:ab12", "a row added in the editor by its id");
  eq(Q.keyOf("exam", "maths", "1.1", { oi: 12 }, 2), "e:maths:1.1:12", "a bank item by its place");
  eq(Q.keyOf("exam", "maths", "1.1", { qk: "c9", oi: 40 }, 2), "e:maths:1.1:c9", "a moved card by its own key");
  eq(Q.parse("e:compsci:4.1.1:7"), { kind: "exam", sid: "compsci", ref: "4.1.1", id: "7" }, "parse");
  eq([[0, 4], [1, 4], [2, 4], [3, 4], [4, 5], [5, 5]].map((x) => Q.gradeOf(x[0], x[1])), [0, 0, 1, 1, 2, 3], "50 / 80 / 100");
});

step("B · answering", () => {
  const Q = K.questions, k = "e:maths:1.1:5";
  const r1 = Q.answer(k, { kind: "exam", got: 4, max: 4, pts: [[1, 1, 1, 1]] });
  assert(r1.rated && r1.grade === 3 && r1.due > TODAY, "the first answer schedules it: " + JSON.stringify(r1));
  const r2 = Q.answer(k, { kind: "exam", got: 1, max: 4 });
  assert(!r2.rated && r2.due === r1.due, "an answer before its day is history only");
  eq(Q.tries(k).map((t) => t.got), [4, 1], "both are history, oldest first");
  const m = "q:maths:1.1:0";
  const r3 = Q.answer(m, { kind: "quiz", ok: false });
  assert(r3.rated && r3.grade === 0, "a miss is Again");
  eq(K.srs.peek(m).due, K.srs.addDays(TODAY, 1), "and waits for tomorrow");
  K.srs.peek(m).lapses = 20; K.srs.peek(m).due = TODAY;
  Q.answer(m, { kind: "quiz", ok: false });
  assert(!K.srs.peek(m).leech, "a question is never set aside");
  assert(K.srs.peek(k).ivl >= 1, "it is an FSRS record");
  const src = require("fs").readFileSync(path.join(ROOT, "js/core/srs.js"), "utf8");
  assert(/\/\^\[qe\]:\/\.test\(key\) \? "question"/.test(src), "the review log names it a question");
  assert(/r\.src === "question"/.test(require("fs").readFileSync(path.join(ROOT, "js/core/fsrsopt.js"), "utf8")), "the optimiser leaves it out");
});

step("C · Due today's questions, capped per subject", () => {
  const Q = K.questions, S = K.store.state;
  Object.keys(S.srs).filter(Q.isKey).forEach((k) => delete S.srs[k]);
  S.questions.items = {};
  for (let i = 0; i < 14; i++) S.srs["q:maths:1.1:" + i] = { due: K.srs.addDays(TODAY, -(i % 3)), last: "2026-11-01", views: 1, reps: 1, lapses: 0, s: 3, d: 5, ivl: 3, lastRating: 2, fl: "2026-11-01" };
  S.srs["e:compsci:4.1.1.1:0"] = { due: TODAY, last: "2026-11-01", views: 1, reps: 1, lapses: 0, s: 3, d: 5, ivl: 3, lastRating: 2, fl: "2026-11-01" };
  const F200 = K.spec.leaves("it", "F200")[0].ref;
  S.srs["e:it:" + F200 + ":0"] = { due: TODAY, last: "2026-11-01", views: 1, reps: 1, lapses: 0, s: 3, d: 5, ivl: 3, lastRating: 2, fl: "2026-11-01" };
  const before = JSON.stringify(S);
  const d = Q.dueToday();
  eq(JSON.stringify(S), before, "a read writes nothing");
  eq([d.by.maths.due, d.by.maths.left, d.by.compsci.left, d.total, d.waiting], [14, 10, 1, 11, 4], "ten Maths, the rest wait");
  assert(!d.by.it, "an archived IT unit's question does not come back");
  eq(d.list[0].overdue, 2, "most overdue first");
  Q.answer(d.list[0].key, { kind: "quiz", ok: true, back: true });
  eq(Q.dueToday().by.maths, { due: 13, cap: 10, done: 1, left: 9 }, "an answer back counts against the cap");
  Q.setCap("maths", 3);
  eq(Q.dueToday().by.maths.left, 2, "the cap is per subject");
  Q.setCap("maths", 0);
  eq(Q.dueToday().by.maths.left, 0, "0 brings none back");
  Q.setCap("maths", 10);
});

step("D · the quiz's record and its history", async () => {
  const Q = K.questions, S = K.store.state;
  S.questions.items = {};
  K.show("ref", { subject: "maths", ref: "1.1" }, { _nav: true }); await app.settle();
  $("[data-tab='quiz']").click(); await app.settle();
  const items = K.content.get("maths", "1.1").quiz;
  const right = items[0].ans;
  $(`[data-ui~='quiz.option'][data-oi='${right}']`).click();
  eq(Q.tries("q:maths:1.1:0").map((t) => t.ok), [1], "an answer is recorded under its key");
  $("[data-ui~='quiz.next']").click();
  const wrong = (items[1].ans + 1) % items[1].opts.length;
  $(`[data-ui~='quiz.option'][data-oi='${wrong}']`).click();
  eq(Q.tries("q:maths:1.1:1").map((t) => t.ok), [0], "a miss too");
  $("[data-ui~='quiz.history-btn']").click();
  const rows = $$("[data-ui~='quiz.history-row']");
  eq(rows.length, items.length, "every item is listed");
  assert(/0%/.test(rows[0].textContent) && /100%/.test(rows[1].textContent) && /not seen/.test(rows[2].textContent), "weakest first, unseen last: " + rows.slice(0, 3).map((r) => r.textContent).join(" | "));
  $("[data-ui~='quiz.history-weakest']").click();
  assert(/Question 1 of 1/.test($("[data-ui~='quiz.counter']").textContent), "the weakest is asked alone");
  $(`[data-ui~='quiz.option'][data-oi='${items[1].ans}']`).click();
  eq(Q.tries("q:maths:1.1:1").map((t) => t.ok), [0, 1], "under its own key, not its place in the re-run");
  /* the inspector's Quiz best opens it */
  S.study.quiz["maths:1.1"] = { attempts: 2, best: 9, bestPct: 75, lastPct: 50 };
  K.show("ref", { subject: "maths", ref: "1.1" }, { _nav: true }); await app.settle();
  $("[data-ui~='topic.quiz-history']").click(); await app.settle();
  const hist = $("[data-ui~='quiz.history']");
  assert(hist && !hist.hidden && $("[data-tab='quiz'][aria-selected='true']"), "Quiz best opens the quiz's history");
});

step("E · an exam question's history", async () => {
  const Q = K.questions;
  K.show("ref", { subject: "maths", ref: "1.1" }, { _nav: true }); await app.settle();
  $("[data-tab='exam']").click(); await app.settle();
  assert(/No attempts yet/.test($("[data-ui~='quiz.qhistory']").textContent), "a question never tried is one line");
  $("[data-ui~='quiz.reveal']").click();
  const boxes = $$("[data-ui~='quiz.selfmark'] input[type=checkbox]");
  assert(boxes.length >= 2, "a scheme to tick");
  boxes[0].click();
  $("[data-ui~='quiz.log']").click();
  const item = K.content.get("maths", "1.1").exam[0], key = Q.keyOf("exam", "maths", "1.1", item, 0);
  const t = Q.tries(key);
  eq(t.length, 1, "the logged mark is recorded");
  eq(t[0].pts[0][0], 1, "with the points ticked");
  const h = $("[data-ui~='quiz.qhistory']");
  assert(h.querySelector("svg circle") && $("[data-ui~='quiz.again']", h) && $("[data-ui~='quiz.last-points'] li[data-state~='ok']", h),
    "the line, when it comes back and the last answer by mark point: " + h.textContent);
  eq(app.errors, [], "no page errors");
});

step("F · Due today: three kinds, the caps, the questions run", async () => {
  const Q = K.questions, S = K.store.state;
  Object.keys(S.srs).filter(Q.isKey).forEach((k) => delete S.srs[k]);
  S.questions.items = {};
  S.srs["q:maths:1.1:2"] = { due: TODAY, last: "2026-11-10", views: 1, reps: 1, lapses: 0, s: 3, d: 5, ivl: 3, lastRating: 2, fl: "2026-11-10" };
  S.srs["e:maths:1.1:0"] = { due: TODAY, last: "2026-11-10", views: 1, reps: 1, lapses: 0, s: 3, d: 5, ivl: 3, lastRating: 2, fl: "2026-11-10" };
  const data = () => JSON.stringify(Object.assign({}, S, { ui: null }));
  const before = data();
  K.show("review", { tab: "due" }, { _nav: true }); await app.settle();
  eq(data(), before, "the page writes nothing when drawn");
  eq($$("[data-ui~='review.kind']").length, 3, "three kinds");
  assert(/2/.test($("[data-ui~='review.kind-questions']").textContent), "two questions back");
  const maths = $("[data-ui~='review.cap'][data-sid='maths']");
  $("[data-ui~='review.cap-down']", maths).click();
  eq(Q.cap("maths"), 9, "− lowers the cap");
  Q.setCap("maths", 10);
  K.show("review", { tab: "due", run: "questions" }, { _nav: true }); await app.settle();
  assert(/2 questions back today/.test($("[data-ui~='review.q-what']").textContent), "the run names its count");
  const first = $("[data-ui~='review.q'] [data-ui~='quiz.card']");
  assert(first, "the first question is asked");
  if ($("[data-ui~='review.q'] [data-ui~='quiz.option']")) {
    const it = K.content.get("maths", "1.1").quiz[2];
    $(`[data-ui~='review.q'] [data-ui~='quiz.option'][data-oi='${it.ans}']`).click();
  } else {
    $("[data-ui~='review.q'] [data-ui~='quiz.reveal']").click();
    $("[data-ui~='review.q'] [data-ui~='quiz.log']").click();
  }
  assert($("[data-ui~='review.q-next']"), "Next once answered");
  eq(Q.dueToday().by.maths.done, 1, "it counted as back today");
  $("[data-ui~='review.q-next']").click();
  assert($("[data-ui~='review.q'] [data-ui~='quiz.card']"), "the second is asked");
  eq(app.errors, [], "no page errors");
});

step("G · Maths' several-step cards moved to exam questions", async () => {
  const M = app.window.KOS_MOVED_CARDS, topics = Object.keys(M);
  assert(topics.length && topics.every((t) => /^maths:/.test(t)), "a list of Maths topics");
  const t = topics[0], C = app.window.KOS_CONTENT[t];
  const keys = K.srs.cardsFor("maths", t.slice(6)).filter((c) => !c.custom && !c.redo).map((c) => c.key);
  M[t].forEach((i) => assert(keys.indexOf(t + ":" + i) < 0, "card " + i + " left the deck"));
  const want = []; for (let i = 0; i < C.flashcards.length + M[t].length; i++) if (M[t].indexOf(i) < 0) want.push(t + ":" + i);
  eq(keys, want, "every other card keeps its key (invariant 87)");
  const moved = C.exam.filter((e) => e.qk && /^c\d+$/.test(e.qk));
  eq(moved.map((e) => e.qk), M[t].map((i) => "c" + i), "they are the topic's exam questions");
  assert(moved.every((e) => e.marks >= 2 && e.ms.some((m) => /^\*\*Answer:\*\*/.test(m))), "each with marks and its model answer");
  /* the schedule goes with it, once */
  const S = K.store.state, from = t + ":" + M[t][0], to = K.questions.movedKey(t, M[t][0]);
  delete S.srs[to];
  S.srs[from] = { due: "2026-11-20", last: "2026-11-10", views: 3, reps: 2, lapses: 1, s: 9, d: 5, ivl: 10, lastRating: 2, fl: "2026-11-10" };
  eq(K.questions.migrate(), 1, "copied");
  eq(S.srs[to].due, "2026-11-20", "the question keeps the card's schedule");
  eq(K.questions.migrate(), 0, "once");
  const r = require("child_process").spawnSync(process.execPath, [path.join(ROOT, "tools/gen_moved_cards.mjs"), "--check"], { cwd: ROOT, encoding: "utf8" });
  assert(r.status === 0, "js/data/moved-cards.js is current: " + r.stdout + r.stderr);
});

step("H · an unmarked attempt is carried on; a marked one is not", async () => {
  const I = K.ink, item = "exam:maths:1.1:test:0";
  const pts = []; for (let i = 0; i < 10; i++) pts.push({ x: 80 + i * 20, y: 100, p: 0.5, t: i * 16 });
  const mk = (meta) => new Promise((res) => {
    const key = "answer:" + I.uid() + ":0";
    I.addPage(key, { items: [{ id: I.uid(), k: "pen", role: "ink", w: 1, p: I.geo.pack(pts) }], h: 320 }, () => I.setDocMeta(key, Object.assign({ item }, meta), () => res(key)));
  });
  const marked = await mk({ logged: Date.now() });
  await app.settle();
  let host = doc.createElement("div"); doc.body.appendChild(host);
  let a = K.inkPad.answer(host, { item, marks: 2 });
  assert(!$("[data-ui~='pad.draft']", host), "a marked attempt is not offered");
  a.destroy(); host.remove();
  const draft = await mk({});
  await app.settle();
  eq(K.inkPad.unmarked(item).key, draft, "the newest unmarked attempt");
  host = doc.createElement("div"); doc.body.appendChild(host);
  a = K.inkPad.answer(host, { item, marks: 2 });
  const offer = $("[data-ui~='pad.draft']", host);
  assert(offer && /not marked/.test(offer.textContent), "an unmarked attempt is offered");
  $("[data-ui~='pad.continue']", host).click();
  await app.settle();
  const pad = a.pad();
  assert(pad && pad.key === draft && pad.hasInk(), "Continue opens its own doc with its ink");
  assert(!marked || pad.key !== marked, "never the marked one");
  a.destroy(); host.remove();
});

step("I · the review strip on the subject desk", async () => {
  K.show("subject", "maths", { _nav: true }); await app.settle();
  const strip = $("#main [data-ui~='study.review-strip']");
  assert(strip, "one strip");
  eq($$("[data-ui~='study.review-part'] .k-kicker", strip).map((n) => n.textContent), ["Cards", "Questions", "Papers"], "Cards → Questions → Papers");
  assert(!/^—/.test($("[data-ui~='study.review-attempts'] .k-sa-fig-v", strip).textContent), "the questions answered are counted");
  K.tracker.add({ subject: "maths", paper: "P1 mock", marks: 50, max: 100, timed: true, date: "2026-11-01" });
  K.tracker.add({ subject: "maths", paper: "P2 mock", marks: 58, max: 100, timed: true, date: "2026-11-10" });
  K.show("subject", "maths", { _nav: true }); await app.settle();
  const papers = $("#main [data-ui~='study.review-papers']").textContent;
  assert(/2timed/.test(papers) && /58%/.test(papers) && /▲ 8%/.test(papers), "papers: timed, last and the change: " + papers);
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? `\nSMOKE155 FAIL — ${failed} of ${steps.length} step(s)` : `\nSMOKE155 OK — ${steps.length} steps`);
  process.exit(failed ? 1 : 0);
})();
