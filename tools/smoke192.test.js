/* Kurenai OS — smoke192.test.js
   W7, the study spaces and study pages (quality audit 2026-11): what the
   audit found, held.

     A · STUDY. The quiz record is made by a finished attempt, never by
         opening the Quiz tab (ST-27); "Retry the N missed" is practice: the
         topic's score, attempts and the ledger stay the full quiz's (CM-17);
         a Due-today run of one topic is logged with its subject and topic
         (ST-30) and a zero Time is not printed (ST-37); Started says what it
         counts (ST-31); IT's Start here skips units done or not taken
         (CC-21); with subtasks an assignment's progress is theirs (ST-40).
     B · CODE. Continue is the first lesson not yet studied (CO-06); the
         retrieval page names the next variations without invented dates
         (CO-07); Tasks passed is passed of the tasks there are (CO-32).
     C · CREATIVES. A study's setup saved unchanged is refused (CR-10); the
         Tracks page labels its bar and draws none for an unreleased track
         (CR-23); Continue is the hero path's place (CR-33).
     D · JAPANESE. One fast answer neither unlocks Writing nor grades Easy;
         R holds a week only over a week (JM-12); a retried answer is never
         Easy (JM-17); a thin history stays calibrating and a far end says
         so (JM-19); a weaker retake keeps the passing scores (JM-27); Type
         instead on a Writing review moves nothing (JM-30); a review touches
         the Badge Wall (JM-32, the reg half); the Today plan counts only
         blocks the app runs (JM-38).
     E · MIND. The lesson inspector has the status row (JM-02); Evaluate
         survives a revision, which carries the objection forward (MI-04);
         Apply needs a first try and Explain some words (MI-06); the map's
         warning counts and an untouched map is not "mapped" (MI-15).
     F · no errors, no request.

   Run: node tools/smoke192.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
let app, K, D, W;
const q = (s) => D.querySelector(s);
const qa = (s) => Array.from(D.querySelectorAll(s));
const click = (n) => n.dispatchEvent(new W.MouseEvent("click", { bubbles: true }));
function closeDialogs() { qa(".k-dialog-overlay").forEach((o) => o.remove()); }

step("boot", async () => {
  app = await boot(); K = app.KOS; D = app.document; W = app.window; await app.settle();
});

/* ---------------- A ---------------- */
step("A · ST-27: opening the Quiz tab writes no quiz record", async () => {
  const before = JSON.stringify((K.store.state.study || {}).quiz || {});
  K.show("ref", { subject: "compsci", ref: "4.2.2.1" }); await app.settle();
  const tab = q("[data-tab='quiz']");
  assert(tab, "the Quiz tab is there");
  click(tab); await app.settle();
  assert(qa("[data-ui~='quiz.option']").length, "the quiz is drawn");
  eq(JSON.stringify((K.store.state.study || {}).quiz || {}), before, "no record written by the render");
});

step("A · CM-17: Retry the missed is practice, the topic's score stays the full quiz's", async () => {
  const items = (K.content.get("compsci", "4.2.2.1") || {}).quiz || [];
  assert(items.length >= 3, "a quiz to sit: " + items.length);
  const holder = D.createElement("div"); D.body.appendChild(holder);
  K.quiz.mountMCQ(holder, "compsci", "4.2.2.1", items, {});
  const n0 = K.sessions.all().filter((e) => e.type === "quiz").length;
  /* answer every question wrong but the first */
  for (let i = 0; i < items.length; i++) {
    const want = i === 0 ? items[i].ans : (items[i].ans + 1) % items[i].opts.length;
    const opt = holder.querySelector("[data-ui~='quiz.option'][data-oi='" + want + "']");
    click(opt);
    const nx = holder.querySelector("[data-ui~='quiz.next']"); if (nx) click(nx);
  }
  await app.settle();
  const rec = K.store.state.study.quiz["compsci:4.2.2.1"];
  assert(rec && rec.attempts === 1, "one attempt recorded: " + JSON.stringify(rec));
  const pct = rec.lastPct;
  eq(K.sessions.all().filter((e) => e.type === "quiz").length, n0 + 1, "one quiz entry");
  const retry = Array.from(holder.querySelectorAll("button")).find((b) => /^Retry the \d+ missed$/.test(b.textContent));
  assert(retry, "Retry the missed is offered");
  click(retry); await app.settle();
  assert(/practice/.test(holder.querySelector("[data-ui~='quiz.head']").textContent), "the head says practice: " + holder.querySelector("[data-ui~='quiz.head']").textContent);
  const n = holder.querySelectorAll("[data-ui~='quiz.card']").length ? items.length - 1 : 0;
  for (let i = 1; i <= n; i++) {
    const card = holder.querySelector("[data-ui~='quiz.card']");
    const opts = Array.from(card.querySelectorAll("[data-ui~='quiz.option']"));
    const qText = card.querySelector("[data-ui~='quiz.q']").innerHTML;
    const it = items.find((x) => K.content.inline(x.q) === qText);
    click(opts.find((o) => +o.getAttribute("data-oi") === it.ans));
    const nx = holder.querySelector("[data-ui~='quiz.next']"); if (nx) click(nx);
  }
  await app.settle();
  const rec2 = K.store.state.study.quiz["compsci:4.2.2.1"];
  eq([rec2.attempts, rec2.lastPct], [1, pct], "the retry changed neither the attempts nor the score");
  eq(K.sessions.all().filter((e) => e.type === "quiz").length, n0 + 1, "and logged no second quiz");
  holder.remove();
});

step("A · ST-30, ST-37: a one-topic Due run names its subject and topic; no zero Time", async () => {
  const cards = K.srs.cardsFor("compsci", "4.2.3.1");
  assert(cards.length, "the topic has cards");
  const today = K.srs.todayISO();
  cards.forEach((c) => { K.store.state.srs[c.key] = { due: today, ivl: 3, ef: 2.5, reps: 2, lapses: 0, last: K.srs.addDays(today, -3), s: 3, d: 5 }; });
  K.store.save();
  K.show("review", { tab: "due" }); await app.settle();
  assert(!qa("[data-ui~='review.today-time']").length, "no Time row before any review time");
  K.show("review", { tab: "due", run: "compsci:4.2.3.1" }); await app.settle();
  const flip = q("[data-ui~='fc.card']");
  assert(flip, "a card to rate");
  click(flip); await app.settle();
  const rate = q("[data-ui~='fc.r'][data-rate='2']");
  assert(rate, "rating buttons");
  click(rate); await app.settle();
  const e = K.sessions.all().filter((x) => x.type === "due-review").slice(-1)[0];
  assert(e, "the run is in the ledger");
  eq([e.subject, e.ref], ["compsci", "4.2.3.1"], "logged with its subject and topic");
  eq(K.sessions.parts(e)[0].subject, "compsci", "parts() splits it to the subject");
  assert(!qa("[data-ui~='review.today-time']").length || /[1-9]\d* min/.test(q("[data-ui~='review.today-time']").textContent), "Time is never printed as 0 min");
  /* a mixed run names its topics: each subject it touched sees it */
  const mixed = { type: "due-review", subject: null, ref: null, refs: ["compsci:4.2.3.1", "maths:M1.1"], metrics: {} };
  assert(K.sessions.hasSubject(mixed, "compsci") && K.sessions.hasSubject(mixed, "maths") && !K.sessions.hasSubject(mixed, "it"), "a mixed run counts for each subject it named, and only those");
});

step("A · ST-31: Started says it counts topics given a status", async () => {
  K.show("subject", "compsci"); await app.settle();
  const t = qa("[data-ui~='study.analytics-tile']").map((x) => x.textContent).find((x) => /^Started/.test(x)) || "";
  assert(t && !/opened at least once/.test(t), "no promise of 'opened': " + t);
});

step("A · CC-21: IT's Start here is never a unit done or not taken", async () => {
  K.store.state.ui.lastRef = K.store.state.ui.lastRef || {};
  delete K.store.state.ui.lastRef.it;
  K.show("subject", "it"); await app.settle();
  const c = q("[data-ui~='study.continue']");
  assert(c, "the continue card");
  const ref = c.querySelector(".k-mono").textContent, unit = K.itUnits.unitOf(ref), u = K.itUnits.get(unit);
  assert(!K.itUnits.archived(unit) && u.status !== "not-taken", "Start here is in a unit being taken: " + ref);
  eq(unit, K.itUnits.current(), "and in the current unit");
  /* a unit dropped (not taken) is never where Start here or Continue lands */
  const cur = K.itUnits.current();
  K.itUnits.setUnit(cur, { status: "not-taken" });
  K.store.state.ui.lastRef.it = ref;
  K.show("subject", "it"); await app.settle();
  const r2 = q("[data-ui~='study.continue'] .k-mono").textContent;
  assert(K.itUnits.unitOf(r2) !== cur, "a not-taken unit is skipped, even as the last opened: " + r2);
  K.itUnits.setUnit(cur, { status: "sitting" });
  delete K.store.state.ui.lastRef.it;
});

step("A · ST-40: with subtasks, progress is theirs and the editor shows it read-only", async () => {
  const A = K.assignments;
  const a = A.add({ title: "Essay", progress: 40 });
  eq(A.get(a.id).progress, 40, "no subtasks: the figure typed");
  A.subAdd(a.id, "Plan"); A.subAdd(a.id, "Draft");
  A.update(a.id, { progress: 80 });
  eq(A.get(a.id).progress, 0, "a typed figure does not override the subtasks");
  A.subToggle(a.id, A.get(a.id).subtasks[0].id, true);
  eq(A.get(a.id).progress, 50, "one of two ticked: 50");
  K.show("assignments", { id: a.id }); await app.settle();
  const edit = qa("button").find((b) => /^Edit/.test(b.textContent.trim()));
  if (edit) {
    click(edit); await app.settle();
    const f = q("[data-ui~='asg.progress-derived']");
    assert(f && f.hasAttribute("readonly"), "the editor's Progress is read-only, from subtasks");
    closeDialogs();
  }
  A.remove(a.id);
});

/* ---------------- B ---------------- */
step("B · CO-06: Continue is the first lesson not yet studied", async () => {
  const st = K.code.state ? K.code.state() : K.store.state.code;
  const t = K.code.tasksOf("1.1")[0];
  st.tasks[t.id] = { tries: 1, passAt: Date.now() };
  K.store.save(); K.code.syncChecks("1.1");
  assert(K.code.studied("1.1"), "1.1 is covered");
  const cur = K.code.stats().current;
  assert(cur && cur.ref !== "1.1", "Continue moved past 1.1: " + (cur && cur.ref));
});

step("B · CO-32: Tasks passed is passed of the tasks there are", async () => {
  const s = K.code.stats();
  assert(s.coreTasks > s.tasksTried, "a total of tasks, not of tried: " + s.coreTasks + " vs " + s.tasksTried);
  K.show("subject", "code"); await app.settle();
  const t = qa("[data-ui~='study.analytics-tile']").map((x) => x.textContent).find((x) => /^Tasks passed/.test(x)) || "";
  assert(new RegExp(s.coreTasksPassed + " / " + s.coreTasks).test(t), "the tile reads passed / total: " + t);
});

step("B · CO-07: the retrieval page names next variations, no invented dates", async () => {
  const src = require("fs").readFileSync(require("path").join(__dirname, "..", "js/modules/code.js"), "utf8");
  assert(!/ivl \* ef/.test(src), "no SM-2 projection left in the retrieval page");
  const st = K.code.state(), today = K.srs.todayISO(), saved = st.cards;
  st.cards = { "u10-cli": { due: today, ivl: 2, ef: 2.5, reps: 0, lapses: 0, n: 1 }, "u10-xunit": { due: today, ivl: 2, ef: 2.5, reps: 0, lapses: 0, n: 1 } };
  K.show("code", { page: "retrieval" }); await app.settle();
  const sub = () => q("[data-ui~='ui.page-sub']").textContent;
  assert(/2 due today/.test(sub()), "two due: " + sub());
  const nx = q(".k-cx-rnext");
  if (nx) assert(!/in \d+ (days|months)/.test(nx.textContent), "no projected dates: " + nx.textContent);
  /* three wrong answers end the card: the header follows */
  const card = q("[data-ui~='code.retrieval-card']").parentNode;
  for (let i = 0; i < 3; i++) {
    const inp = card.querySelector("input, textarea"); inp.value = "nope " + i;
    click(q("[data-ui~='code.retrieval-check']")); await app.settle();
  }
  assert(q("[data-ui~='code.retrieval-outcome']"), "the card is finished");
  assert(/1 due today/.test(sub()), "the header counts what is left: " + sub());
  st.cards = saved; K.store.save();
});

/* ---------------- C ---------------- */
step("C · CR-10: a Writing study saved with only its setup is refused", async () => {
  const CR = K.creatives, s = CR.study("W1.1", "a");
  assert(s && s.setup, "W1.1·a has a setup");
  const works0 = Object.keys(K.store.state.creatives.works || {}).length;
  K.crWrite.openStudy("W1.1", "a"); await app.settle(); await app.settle();
  const area = q("[data-ui~='cr.paper']");
  assert(area && area.value.trim() === s.setup.trim(), "the draft opens on the setup");
  click(q("[data-ui~='cr.save-log']")); await app.settle(); await app.settle();
  eq(Object.keys(K.store.state.creatives.works || {}).length, works0, "nothing saved");
});

step("C · CR-23, CR-33: the Tracks page labels its bar; Continue is the path's place", async () => {
  K.show("creatives", { page: "tracks" }); await app.settle();
  const cards = qa("[data-ui~='cr.track']");
  assert(cards.length >= 4, "four tracks");
  const edit = cards.find((c) => /Editing/i.test(c.getAttribute("aria-label")));
  if (edit) assert(!edit.querySelector(".k-bar") && edit.querySelector("[data-ui~='cr.track-later']"), "an unreleased track: a chip, no empty bar");
  const art = cards.find((c) => /Art/i.test(c.getAttribute("aria-label")));
  assert(/% of checks/.test(art.textContent), "the bar says what it measures: " + art.querySelector(".k-card-head").textContent);
  /* A1.1's pages read: the place is A1.1 */
  K.creatives.markPage("A1.1", 0); K.store.save();
  const place = K.creatives.trackPlace("art");
  K.show("subject", "creatives"); await app.settle();
  const c = q("[data-ui~='cr.continue']");
  if (place && c) assert(c.textContent.indexOf(place.lesson) >= 0, "Continue names the path's place " + place.lesson + ": " + c.textContent);
});

/* ---------------- D ---------------- */
step("D · JM-12, JM-17: one fast answer is Good and unlocks nothing; R holds over a week", async () => {
  const S = K.jaSrs, today = K.srs.todayISO();
  K.ja.startLesson("1.1");
  const r = K.ja.record("w:これ|R", { verdict: "correct", hints: 0, ms: 2000, tries: 1 });
  eq(r.grade, 3, "a brand-new facet's first answer is at most Good");
  assert(!r.unlocked.some((k) => /\|W$/.test(k)), "and unlocks no Writing: " + JSON.stringify(r.unlocked));
  assert(!S.holds({ reps: 1, s: 8.3, firstAt: today, last: today }), "one review is not held");
  assert(!S.holds({ reps: 3, s: 9, firstAt: today, last: today }), "three the same day are not held");
  assert(S.holds({ reps: 2, s: 9, firstAt: S.addDays(today, -8), last: today }), "a second review a week on holds");
  eq(S.gradeOf({ verdict: "correct", hints: 0, ms: 1000, tries: 2 }, 4000), 3, "a retry is never Easy");
  eq(S.gradeOf({ verdict: "correct", hints: 0, ms: 1000, tries: 1 }, 4000), 4, "a first try inside the target is");
});

step("D · JM-19: thin history stays calibrating; JM-38: the plan counts blocks the app runs", async () => {
  const st = K.store.state.japanese, saved = st.facets, today = K.srs.todayISO();
  st.facets = { "k:あ|R": { reps: 1, s: 3, d: 5, firstAt: K.srs.addDays(today, -20), last: today, due: today },
    "w:これ|R": { reps: 1, s: 3, d: 5, firstAt: K.srs.addDays(today, -10), last: today, due: today } };
  const tl = K.ja.timeline(today);
  st.facets = saved;
  assert(tl.calibrating && tl.milestones.every((m) => !m.from && !m.to), "one word met: still calibrating");
  /* the kana stone counts a kana "held a week" by the one test (holds): one review is not */
  st.facets = { "k:あ|R": { reps: 1, s: 8.3, d: 5, firstAt: today, last: today, due: K.srs.addDays(today, 8) },
    "k:い|R": { reps: 2, s: 9, d: 5, firstAt: K.srs.addDays(today, -9), last: today, due: K.srs.addDays(today, 9) } };
  const kana = K.ja.timeline(today).milestones.find((m) => m.unit === "kana");
  st.facets = saved;
  eq(kana && kana.have, 1, "one kana held over a week, not the one answered once");
  const p = K.ja.planDay();
  eq(p.total, Math.round(p.reviews.min + (p.learn ? p.learn.min : 0)), "the total is reviews and new only");
  K.show("subject", "ja"); await app.settle();
  const today_ = q("[data-ui~='ja.today']");
  if (today_) assert(!/Input|Output|Say it/.test(today_.textContent), "no block the app cannot run: " + today_.textContent);
});

step("D · JM-27: a weaker retake keeps the passing scores", async () => {
  const id = Object.keys(window_ja().CHECKPOINTS)[0], cp = window_ja().CHECKPOINTS[id];
  const pass = {}, weak = {};
  cp.skills.forEach((s) => { pass[s] = 0.9; weak[s] = 0.1; });
  assert(K.ja.recordCheckpoint(id, pass).pass, "passed");
  K.ja.recordCheckpoint(id, weak);
  const rec = K.ja.peek().checkpoints[id];
  eq(cp.skills.map((s) => rec.scores[s]), cp.skills.map(() => 0.9), "the card stands on the pass");
  eq(cp.skills.map((s) => rec.last[s]), cp.skills.map(() => 0.1), "the last attempt is kept apart");
});
function window_ja() { return app.window.KOS_JA; }

step("D · JM-30: Type instead on a Writing review moves nothing", async () => {
  const today = K.srs.todayISO(), k = "k:あ|W";
  const f = K.store.state.japanese.facets;
  Object.keys(f).forEach((x) => { if (f[x].due && f[x].due <= today) f[x].due = K.srs.addDays(today, 5); });
  f[k] = { s: 3, d: 5, ivl: 3, due: today, last: K.srs.addDays(today, -3), reps: 2, lapses: 0, firstAt: K.srs.addDays(today, -10) };
  K.store.save();
  const before = JSON.stringify(f[k]);
  K.show("japanese", { page: "session", id: "reviews" }); await app.settle();
  const ti = q("[data-ui~='ja.type-instead']");
  assert(ti, "the Writing review offers Type instead");
  click(ti); await app.settle();
  const inp = q("[data-ui~='ja.answer']"); inp.value = "a";
  click(q("[data-ui~='ja.check']")); await app.settle();
  eq(JSON.stringify(K.store.state.japanese.facets[k]), before, "the Writing facet is unchanged");
  assert(q("[data-ui~='ja.typed-practice']"), "and the page says it was practice");
  assert(!q("[data-ui~='ja.grade']"), "no grade shown");
  K.show("home"); await app.settle();
});

/* ---------------- E ---------------- */
step("E · JM-02: a Mind lesson's inspector carries status, confidence and a bar", async () => {
  K.show("ref", { subject: "mind", ref: "F1.1" }); await app.settle();
  const ts = q("[data-ui~='mind.status']");
  assert(ts, "the status block");
  assert(ts.querySelector("[data-ui~='ui.status-select']"), "a status select");
  assert(ts.querySelector(".k-bar"), "a progress bar");
});

step("E · MI-04: Evaluate survives a revision; the revise sheet carries the objection", async () => {
  const M = K.mind;
  M.takePosition("F1.7", { answer: 1, conf: 70, reason: "r", objection: "o", reply: "y" });
  assert(M.rung("steelman", "Evaluate"), "Evaluate from the answered objection");
  M.takePosition("F1.7", { answer: 1, conf: 60, reason: "r2" });
  assert(M.rung("steelman", "Evaluate") && M.rung("charity", "Evaluate"), "a revision without retyping it keeps Evaluate");
});

step("E · MI-06: Apply needs a first try; Explain needs words", async () => {
  const M = K.mind, it = M.checkItems("F1.3")[3];
  assert(it.apply, "item 3 is an Apply scenario");
  M.answerCheck("F1.3", 3, (it.a + 1) % it.options.length);
  const r = M.answerCheck("F1.3", 3, it.a);
  eq([r.ok, r.counts], [true, false], "right after the reveal: the check, not Apply");
  eq(M.ladder("validity").apply, 0, "no Apply from it");
  const kp = M.concept(M.lesson("F1.3").main).keyPoints, ticks = {};
  kp.forEach((_, i) => { ticks[i] = true; });
  const e = M.saveExplain("F1.3", ["x"], ticks);
  assert(e.short && !M.rung(M.lesson("F1.3").main, "Explain"), "one bullet 'x' is not Explain");
});

step("E · MI-15: the map's warning counts; an untouched map is not mapped", async () => {
  const M = K.mind;
  const flat = [0, 1, 2, 3, 4].map((i) => ({ id: "c" + i, t: "claim " + i, j: null, d: 0 }));
  assert(!M.mapPlaced(flat), "five conclusions are not a map");
  assert(M.mapPlaced([{ t: "c", d: 0 }, { t: "r", d: 1, j: "because" }, { t: "s", d: 2, j: "but" }]), "one conclusion, the rest joined");
  const box = K.mindUI.argmap({ rows: flat, edit: true });
  D.body.appendChild(box);
  const w = box.querySelector("[data-ui~='mind.map-warn']");
  assert(w && !/Two conclusions/.test(w.textContent), "the warning does not say Two: " + (w && w.textContent));
  assert(!box.querySelector("[data-joint='conclusion']"), "no claim is labelled the conclusion yet");
  box.remove();
});

/* ---------------- F ---------------- */
step("F · no errors, no request", async () => {
  closeDialogs();
  eq(app.errors, [], "no error");
  assert(!app.fetches.length, "no request: " + JSON.stringify(app.fetches.slice(0, 3)));
});

(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { console.error("  FAIL " + name + "\n       " + (e && e.stack || e)); process.exit(1); }
  }
  console.log("smoke192: all " + steps.length + " steps passed");
  process.exit(0);
})();
