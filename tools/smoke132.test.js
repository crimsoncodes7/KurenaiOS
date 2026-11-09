/* Kurenai OS — smoke132.test.js
   Japanese lesson pay needs a pass (quality W1, RC21; JM-13).

   "Passed the practice" ticked, and the lesson paid 15 XP · 2 gold · +3 HP, even when every
   answer in the learn session was wrong. Now a learn session asks its misses again at the end
   and finishes the lesson only when every facet it asked was answered right (correct or
   accepted) at least once; otherwise it says "Not passed yet" and offers the misses again.

     A · every answer wrong (first try and the re-ask): "Not passed yet" — no lesson entry, no
         pay, no doneAt, no "Passed the practice" tick; the session is ONE entry paying nothing.
     B · "Try the misses again", answered right: the lesson passes and pays 15/2/+3 once; the
         session's entry is not logged again (a replay never pays twice).
     C · review pay counts passed facets only: a near or a wrong pays nothing, an accepted or a
         hinted correct pays (invariant 116).
     D · redoing a passed lesson pays nothing: a second pass, a failed redo and an empty redo
         session add no lesson pay.
     E · finishLesson without answers, or with a miss left, writes nothing.
     F · RC21 review P2. A learn session with a miss is logged and paid at the end of its first
         round, before the re-ask: leaving the re-ask loses nothing and logs nothing more.
     G · a re-ask finished right pays the lesson; the session stays ONE entry, its pay shown once.

   Run: node tools/smoke132.test.js */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-11-09";
let app, K, D;
const gov = () => K.store.state.governor;
const jaEntries = () => K.sessions.all().filter((e) => e.type === "ja");
const lessonEntries = () => jaEntries().filter((e) => e.metrics && e.metrics.kind === "lesson");
const q = (s) => D.querySelector(s);

/* answer whatever is on screen; right → the true reading, else a wrong one. Returns false when
   the session has ended. */
async function answerOne(right) {
  await app.settle();
  if (q('[data-ui~="ja.session-done"]')) return false;
  const typeInstead = q('[data-ui~="ja.type-instead"]');
  if (typeInstead) { typeInstead.click(); await app.settle(); }
  const inp = q('[data-ui~="ja.answer"]');
  if (inp) {
    const ch = inp.getAttribute("aria-label").replace("Type the reading of ", "");
    const it = K.ja.item("k:" + ch);
    assert(it, "a kana on screen: " + ch);
    inp.value = right ? it.r : "zzz";
    q('[data-ui~="ja.check"]').click();
  } else {
    const opts = [...D.querySelectorAll('[data-ui~="ja.option"]')];
    if (!opts.length) throw new Error("an exercise this test cannot answer: " + (q('[data-ui~="ja.exercise"]') || {}).outerHTML);
    /* a minimal pair: the right one is the one the verdict will name; try the first, it is right or wrong */
    opts[0].click();
  }
  await app.settle();
  const retry = q('[data-ui~="ja.retry"]');
  if (retry) { retry.click(); return answerOne(right); }
  const next = q('[data-ui~="ja.next"]');
  assert(next, "a Next button after the answer");
  next.click();
  return true;
}
async function answerAll(right) { let n = 0; while (await answerOne(right)) { if (++n > 200) throw new Error("runaway session"); } return n; }

step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS; D = app.document;
  await app.settle();
  eq(app.errors, [], "boot errors");
});

step("A · every answer wrong: Not passed yet — no pay, no doneAt, no tick", async () => {
  const x0 = gov().xp, g0 = gov().gold, n0 = jaEntries().length;
  K.show("japanese", { page: "session", id: "learn-H1" }); await app.settle();
  assert(q('[data-ui~="ja.runner"]'), "the learn session runs");
  const n = await answerAll(false);
  assert(n >= 2, "answered the session and its re-ask: " + n);
  const done = q('[data-ui~="ja.session-done"]');
  eq(done.getAttribute("data-state"), "not-passed", "the session ends not passed");
  assert(/Not passed yet/.test(done.textContent), "it says so: " + done.textContent);
  assert(q('[data-ui~="ja.retry-misses"]'), "and offers the misses again");
  eq(lessonEntries().length, 0, "no lesson entry");
  eq(jaEntries().length, n0 + 1, "ONE session entry");
  eq([gov().xp - x0, gov().gold - g0], [0, 0], "nothing paid");
  const rec = K.ja.peek().lessons.H1 || {};
  assert(!rec.doneAt && !rec.paidAt, "no doneAt, no paidAt");
  eq(K.ja.evidence("H1").checks[2], false, "Passed the practice is not ticked");
});

step("B · the misses again, right: the lesson passes and pays once", async () => {
  const x0 = gov().xp, g0 = gov().gold, n0 = jaEntries().length;
  q('[data-ui~="ja.retry-misses"]').click();
  await answerAll(true);
  const done = q('[data-ui~="ja.session-done"]');
  assert(done.getAttribute("data-state") !== "not-passed", "passed: " + done.textContent);
  eq(lessonEntries().length, 1, "one lesson entry");
  eq(jaEntries().length, n0 + 1, "the session was not logged again");
  eq([gov().xp - x0, gov().gold - g0], [15, 2], "15 XP and 2 gold");
  assert(K.ja.peek().lessons.H1.doneAt, "doneAt set");
  eq(K.ja.evidence("H1").checks[2], true, "Passed the practice ticks");
  eq(app.errors, [], "no page errors");
});

step("C · review pay: a near or a wrong pays nothing, accepted or hinted correct pays", async () => {
  K.ja.startLesson("H2");
  const keys = Object.keys(K.store.state.japanese.facets).filter((k) => !K.store.state.japanese.facets[k].reps).slice(0, 4);
  assert(keys.length === 4, "four new facets");
  const x0 = gov().xp;
  /* the shape the kana drill page sends: { key, grade } only — the verdict is the one record() saw */
  const near = keys.slice(0, 2).map((k) => ({ key: k, grade: K.ja.record(k, { verdict: k === keys[0] ? "near" : "wrong", ms: 2000 }).grade }));
  eq(K.ja.finishSession(near).paid, 0, "a near and a wrong pay nothing");
  const good = [{ key: keys[2], grade: K.ja.record(keys[2], { verdict: "accepted", ms: 2000 }).grade, verdict: "accepted" },
    { key: keys[3], grade: K.ja.record(keys[3], { verdict: "correct", hints: 1, ms: 2000 }).grade, verdict: "correct" }];
  eq(K.ja.finishSession(good).paid, 2, "accepted and hinted correct pay");
  eq(gov().xp - x0, 2, "2 XP in all");
});

step("D · redoing a passed lesson pays nothing", async () => {
  const x0 = gov().xp, g0 = gov().gold, L0 = lessonEntries().length;
  const keys = Object.keys(K.store.state.japanese.facets).filter((k) => /^k:(あ|い|う|え|お|か|き|く|け|こ)\|/.test(k));
  const right = K.ja.finishLesson("H1", keys.map((k) => ({ key: k, verdict: "correct" })));
  eq([right.paid, right.why], [false, "already finished"], "a second pass pays nothing");
  const wrong = K.ja.finishLesson("H1", keys.map((k) => ({ key: k, verdict: "wrong" })));
  eq(wrong.paid, false, "a failed redo pays nothing");
  assert(K.ja.peek().lessons.H1.doneAt, "and keeps the lesson done");
  K.show("japanese", { page: "session", id: "learn-H1" }); await app.settle();
  await answerAll(true);
  eq(lessonEntries().length, L0, "no new lesson entry");
  eq([gov().gold - g0], [0], "no gold");
  assert(gov().xp - x0 <= 0 + 30, "only review XP, if anything was due");
  eq(app.errors, [], "no page errors");
});

step("E · finishLesson without a pass pays and finishes nothing; it keeps the miss", async () => {
  K.ja.startLesson("H3");
  const before = JSON.stringify(K.store.state.japanese.lessons.H3), n0 = jaEntries().length;
  const a = K.ja.finishLesson("H3");
  eq([a.paid, a.passed], [false, false], "no answers: not passed");
  const b = K.ja.finishLesson("H3", [{ key: "k:さ|R", verdict: "correct" }, { key: "k:し|R", verdict: "near" }]);
  eq([b.paid, b.passed, b.misses], [false, false, ["k:し|R"]], "a near left: not passed");
  const after = JSON.parse(JSON.stringify(K.store.state.japanese.lessons.H3));
  eq(after.miss && Object.keys(after.miss), ["k:し|R"], "only the miss is recorded (so a later sitting cannot pass around it)");
  delete after.miss;
  eq(JSON.stringify(after), before, "nothing else: no doneAt, no paidAt");
  delete K.store.state.japanese.lessons.H3.miss;    /* step F starts H3 afresh */
  eq(jaEntries().length, n0, "no entry");
  eq(K.ja.lessonPass([{ key: "x", verdict: "wrong" }, { key: "x", verdict: "correct" }]).pass, true, "right once, after a miss, passes");
});

/* the label of what is on screen ("Again · …" in the re-ask round) */
const family = () => { const s = q(".k-ja-run-skill .k-muted"); return s ? s.textContent : ""; };
async function firstRoundWithOneMiss() {
  await app.settle();
  assert(await answerOne(false), "the first answer, wrong");
  let n = 0;
  while (!/^Again · /.test(family())) {
    assert(await answerOne(true), "the first round goes on to the re-ask");
    await app.settle();
    if (++n > 200) throw new Error("runaway session");
  }
}

step("F · leaving the re-ask round keeps the session logged and paid (RC21 review P2)", async () => {
  const x0 = gov().xp, n0 = jaEntries().length;
  K.show("japanese", { page: "session", id: "learn-H3" }); await app.settle();
  await firstRoundWithOneMiss();
  eq(jaEntries().length, n0 + 1, "the first round is logged before the re-ask");
  const e = jaEntries()[jaEntries().length - 1];
  assert(e.metrics.kind === "session" && e.metrics.lesson === "H3" && e.metrics.passed >= 1, "the session entry: " + JSON.stringify(e.metrics));
  assert(e.metrics.paid > 0, "under today's cap, so it pays: " + e.metrics.paid);
  eq(gov().xp - x0, e.metrics.paid, "its passed facets paid");
  K.show("home"); await app.settle();
  eq(jaEntries().length, n0 + 1, "leaving logs nothing more");
  assert(!(K.ja.peek().lessons.H3 || {}).doneAt, "the lesson is not finished");
  eq(app.errors, [], "no page errors");
});

step("G · a re-ask finished right pays the lesson; the session is ONE entry and its pay is shown once", async () => {
  const sessions = () => jaEntries().filter((e) => e.metrics && e.metrics.kind === "session").length;
  const s0 = sessions(), L0 = lessonEntries().length;
  K.show("japanese", { page: "session", id: "learn-H4" }); await app.settle();
  await firstRoundWithOneMiss();
  const paid = jaEntries()[jaEntries().length - 1].metrics.paid;
  await answerAll(true);
  const done = q('[data-ui~="ja.session-done"]');
  assert(done && done.getAttribute("data-state") !== "not-passed", "passed: " + (done && done.textContent));
  eq(sessions() - s0, 1, "ONE session entry");
  eq(lessonEntries().length, L0 + 1, "one lesson entry");
  const pay = q('[data-ui~="ja.pay"]');
  assert(pay && (!paid || pay.textContent.indexOf("+" + paid + " XP") >= 0) && /\+15 XP/.test(pay.textContent), "the end screen shows the pay: " + (pay && pay.textContent));
  eq(app.errors, [], "no page errors");
});

step("H · misses carry across sittings: a later sitting cannot pass around them (RC21 review)", async () => {
  const id = "H6";
  const L = K.ja.lesson(id);
  assert(L, "lesson " + id);
  const R = L.items.map((k) => k + "|R"), W = L.items.map((k) => k + "|W");
  const xp = K.store.state.governor.xp;
  /* sitting 1: every Reading facet wrong */
  const a = K.ja.finishLesson(id, R.map((k) => ({ key: k, verdict: "wrong" })));
  assert(!a.passed && !a.paid, "sitting 1 does not pass");
  eq(K.ja.lessonMisses(id).sort(), R.slice().sort(), "its misses are kept on the lesson");
  /* sitting 2, the same day: only the Writing facets come up, all right */
  const b = K.ja.finishLesson(id, W.map((k) => ({ key: k, verdict: "correct" })));
  assert(!b.passed && !b.paid, "a sitting that never answered the earlier misses does not pass: " + JSON.stringify(b));
  eq(K.store.state.governor.xp, xp, "nothing paid");
  /* sitting 3: the earlier misses answered right */
  const c = K.ja.finishLesson(id, R.map((k) => ({ key: k, verdict: "correct" })));
  assert(c.passed && c.paid, "passes once every miss is answered right: " + JSON.stringify(c));
  eq(K.ja.lessonMisses(id), [], "no misses left");
});

step("I · a second Check on the same question records nothing (found on staging, 9 Nov)", async () => {
  K.show("japanese", { page: "session", id: "learn-H5" }); await app.settle();
  const inp = q('[data-ui~="ja.answer"]');
  assert(inp, "a typed question");
  const ch = inp.getAttribute("aria-label").replace("Type the reading of ", "");
  const key = "k:" + ch + "|R";
  inp.value = "zzz";
  for (let n = 0; n < 5; n++) { const c = q('[data-ui~="ja.check"]'); if (c && !c.disabled) c.click(); else if (c) c.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true })); await app.settle(); }
  const f = K.ja.peek().facets[key];
  eq(f && f.reps, 1, "one answer recorded, however many times Check is pressed");
  eq(D.querySelectorAll('[data-ui~="ja.next"]').length, 1, "one Next button");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke132: " + failed + " failed" : "smoke132: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
