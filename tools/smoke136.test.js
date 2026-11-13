/* Kurenai OS — smoke136.test.js
   Honest numbers (quality W7): the figures you read every day say what they
   measure, and a lesson can reach Completed by the work that completes it.

     A · JM-07: a Japanese REVIEW that holds the last of a lesson's items
         ticks its fourth check ("Held in reviews") in the shared progress
         record; and the boot pass repairs a lesson already stuck.
     B · MI-01: Mind's checkpoint lesson (F1.8), with its page read, the
         checkpoint passed and its checkpoint's concepts' cards held,
         reaches Completed (its retrieval read the lesson's own concepts,
         and a checkpoint lesson has none).
     C · CR-25: rating a Creatives theory card ticks its lesson's fourth
         check (nothing synced the lesson after a rating).
     D · ST-03: Quiz best is a percent of a full run — 6 of 11 reads 55%,
         not 6% — in the inspector and on the subject; a re-run of the
         missed questions alone never sets it; an older record that
         stored a percent still reads as one.
     E · HR-17: a week Code led is worded with Code's name, never
         "undefined took the largest share".
     F · HR-05: Home's Study hours count Focus time, as Reports and Goals
         do — a flashcard or quiz session's minutes are not study hours.
     G · GO-06, GO-07: a routine or habit goal names WHICH one: the editor
         lists Routines' own records (a habit made in Routines included)
         and the saved goal measures it.
     H · HR-01: Home's Continue desks put the subject studied most
         recently first (Mind and Creatives were columns 6 and 7 of a row
         showing four).
     I · HR-02: signed in, the report backfill waits for the first sync;
         a week saved with no study while its days now hold Focus time is
         rebuilt ONCE (`fix.empty`, a higher `factsRev`), never again.
     J · GO-02: Collection goals measure their own period from the journal:
         a "finish two titles" goal made today is not met by January's
         completions; a title finished today counts; episodes are the
         steps watched since, not the vault's total.
     K · GO-02: the repair `goal-getter-whole-vault` voids the receipts of
         whole-vault goals that do not hold by the new rule (and those of
         deleted goals), keeps every other goal's, lowers Goal getter to
         what remains (off the showcase when gone), and runs once.
     L · GO-23: a 0% quiz is Red (it was Green: a capped penalty off 100);
         a perfect quiz alone is Amber, "not enough evidence"; three cards
         held and the quiz make Green.

   Run: node tools/smoke136.test.js */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, doc;
const $ = (s, r) => (r || doc).querySelector(s);
const $$ = (s, r) => Array.from((r || doc).querySelectorAll(s));
const prog = (sid, id) => (K.store.peekProgress(sid, id) || { check: [] });

step("boot", async () => {
  app = await boot();
  K = app.KOS; doc = app.document;
  await app.settle();
  K.store.state.sessions = []; K.store.save();
});

step("A · JM-07: a review that holds the lesson's last item ticks Held in reviews", async () => {
  const L = K.ja.lessons().find((l) => l.items && l.items.length >= 2);
  assert(L, "a Japanese lesson with items");
  const j = K.store.state.japanese, t = K.srs.todayISO(), y = K.srs.addDays(t, -10);
  /* every item held but the first, which a review is about to hold */
  L.items.forEach((k, i) => { j.facets[k + "|R"] = { reps: i ? 3 : 2, s: i ? 30 : 12, d: 5, last: y, due: t, ivl: i ? 30 : 10, lapses: 0 }; });
  j.facets[L.items[0] + "|R"].s = 3;                       /* not held yet */
  K.store.save();
  eq(!!prog("ja", L.id).check[3], false, "not held before");
  j.facets[L.items[0] + "|R"].s = 12;                      /* the review below lands on a held facet */
  K.ja.record(L.items[0] + "|R", { verdict: "correct", ms: 2000 });
  eq(K.ja.evidence(L.id).checks[3], true, "the evidence holds");
  eq(!!prog("ja", L.id).check[3], true, "and the review wrote it to the progress record");
  /* a lesson already stuck (held by facets written without a review) is repaired at boot */
  const L2 = K.ja.lessons().find((l) => l !== L && l.items && l.items.length && !l.items.some((k) => L.items.indexOf(k) !== -1));
  L2.items.forEach((k) => { j.facets[k + "|R"] = { reps: 3, s: 30, d: 5, last: y, due: t, ivl: 30, lapses: 0 }; });
  K.store.save();
  eq(!!prog("ja", L2.id).check[3], false, "stuck");
  K.ja.syncAll();
  eq(!!prog("ja", L2.id).check[3], true, "the boot pass wrote it");
});

step("B · MI-01: the checkpoint lesson reaches Completed", async () => {
  const M = K.mind, id = "F1.8", l = K.mind.lesson ? K.mind.lesson(id) : window_lesson();
  function window_lesson() { return app.window.KOS_MIND.LESSONS[id]; }
  assert((l || window_lesson()), "F1.8 exists");
  M.pages(id).forEach((_, i) => M.markPage(id, i));
  M.recordCheckpoint("F1", { cards: 8, apply: { 0: true, 1: true }, synth: { bullets: ["fine"], ticks: { 0: true, 1: true } } });
  const cp = app.window.KOS_MIND.CHECKPOINTS.F1;
  cp.concepts.forEach((cid) => { M.introduce(cid); });
  const st = K.store.state.mind;
  Object.keys(st.cards).filter((k) => cp.concepts.some((c) => k.indexOf(c + ":") === 0)).forEach((k) => M.rateCard(k, 3));
  M.syncChecks(id);
  const ev = M.evidence(id);
  assert(ev.checks[0] && ev.checks[1] && ev.checks[3], "read, passed and retrieved: " + JSON.stringify(ev.checks));
  eq(prog("mind", id).status, "done", "F1.8 is Completed");
});

step("C · CR-25: rating a Creatives theory card ticks the lesson's fourth check", async () => {
  const keys = K.creatives.cardKeys ? K.creatives.cardKeys("W1.1") : ["creatives:W1.1:0"];
  assert(keys.length, "W1.1 has theory cards");
  eq(!!prog("creatives", "W1.1").check[3], false, "not held before");
  K.srs.rate(keys[0], 3);
  eq(K.creatives.evidence("W1.1").checks[3], true, "the card is held");
  eq(!!prog("creatives", "W1.1").check[3], true, "and the rating ticked the lesson's check");
});

step("D · ST-03: Quiz best is a percent of a full run", async () => {
  const sid = "compsci";
  const leaf = K.hub.LEAVES.compsci.find((x) => { const c = K.content.get(sid, x.ref); return c && c.quiz && c.quiz.length >= 8; });
  assert(leaf, "a topic with a quiz");
  const n = K.content.get(sid, leaf.ref).quiz.length;
  K.store.state.study = K.store.state.study || {};
  K.store.state.study.quiz = K.store.state.study.quiz || {};
  K.store.state.study.quiz[sid + ":" + leaf.ref] = { attempts: 1, best: 6, lastPct: Math.round(600 / n) };
  K.store.save();
  eq(K.quiz.bestPct(sid, leaf.ref), Math.round(600 / n), "a stored count reads as the percent of the deck");
  K.show("ref", { subject: sid, ref: leaf.ref }); await app.settle();
  const row = $$("[data-ui~='topic.inspector-list'] li").find((li) => /Quiz best/.test(li.textContent));
  assert(row, "the inspector's Quiz best");
  assert(row.textContent.indexOf(Math.round(600 / n) + "%") !== -1 && !/\b6%/.test(row.textContent), "reads " + Math.round(600 / n) + "%, not 6%: " + row.textContent);
  /* a record from a version that stored a percent */
  K.store.state.study.quiz[sid + ":" + leaf.ref] = { attempts: 2, best: 57, lastPct: 57 };
  eq(K.quiz.bestPct(sid, leaf.ref), 57, "an older percent stays a percent");
  /* the engine: a full run sets it; a re-run of only some questions does not */
  delete K.store.state.study.quiz[sid + ":" + leaf.ref];
  const items = K.content.get(sid, leaf.ref).quiz;
  const textOf = (html) => { const d = doc.createElement("div"); d.innerHTML = html; return d.textContent; };
  async function run(list, right) {
    const holder = doc.createElement("div"); doc.body.appendChild(holder);
    K.quiz.mountMCQ(holder, sid, leaf.ref, list);
    for (let i = 0; i < list.length; i++) {
      await app.settle();
      const shown = $("[data-ui~='quiz.q']", holder).textContent;
      const it = list.find((x) => textOf(K.content.inline(x.q)) === shown) || list[i];
      const opts = $$("[data-ui~='quiz.option']", holder);
      const want = right-- > 0 ? it.ans : (it.ans + 1) % opts.length;   /* the AUTHORED index (options are shuffled) */
      opts.find((b) => +b.getAttribute("data-oi") === want).click(); await app.settle();
      const nx = $("[data-ui~='quiz.next']", holder);
      if (nx) { nx.click(); await app.settle(); }
    }
    holder.remove();
  }
  await run(items, Math.ceil(n / 2));
  const after = K.quiz.bestPct(sid, leaf.ref);
  eq(after, Math.round(100 * Math.ceil(n / 2) / n), "a full run sets the best as its percent");
  await run(items.slice(0, 3), 3);
  eq(K.quiz.bestPct(sid, leaf.ref), after, "three of three on a re-run of three is not 'best 100%'");
});

step("E · HR-17: a week Code led names Code", async () => {
  const today = K.srs.todayISO();
  K.sessions.log({ type: "focus", subject: "code", dur: 5 * 3600, metrics: { complete: true, mode: "custom", rule: "blocks" } });
  K.sessions.log({ type: "focus", subject: "maths", dur: 49 * 60, metrics: { complete: true, mode: "custom", rule: "blocks" } });
  const p = K.report.week(today);
  let f; K.report.build(p, {}, (x) => { f = x; });
  for (let i = 0; i < 200 && !f; i++) await app.settle();
  assert(f && f.study && f.study.bySubject && f.study.bySubject.code > 0, "the facts carry Code's minutes");
  const w = K.reportWords.template(f);
  const text = JSON.stringify(w);
  assert(text.indexOf("undefined") === -1, "no 'undefined' in the words: " + text.slice(0, 300));
  assert(/Code/.test(text), "Code is named: " + text.slice(0, 300));
  K.store.state.sessions = []; K.store.save();
});

step("F · HR-05: Home's Study hours count Focus time only", async () => {
  K.store.state.sessions = []; K.store.save();
  K.sessions.log({ type: "flashcards", subject: "compsci", ref: "4.1.1.1", dur: 3 * 3600, metrics: { cards: 50 } });
  K.sessions.log({ type: "quiz", subject: "maths", ref: "P1.1", dur: 3600, metrics: { correct: 5, total: 10, pct: 50 } });
  K.sessions.log({ type: "focus", subject: "compsci", dur: 1800, metrics: { complete: true, mode: "custom", rule: "blocks" } });
  K.show("home"); await app.settle();
  const n = $(".k-hours-n");
  assert(n, "the Study hours card");
  eq(n.textContent, "0.5", "half an hour of Focus, not four and a half of everything");
  assert(/1 session\b/.test($(".k-hours-u").textContent), "one Focus session: " + $(".k-hours-u").textContent);
  K.store.state.sessions = []; K.store.save();
});

step("G · GO-06, GO-07: routine and habit goals name which one", async () => {
  const R = K.routines;
  if (!R.migrated()) R.migrate();
  R.addHabit("Stretch");
  const habit = R.all().find((r) => r.name === "Stretch");
  assert(habit, "a habit made in Routines");
  for (const type of ["habit-streak", "routine-days"]) {
    K.goalsUI.goalDialog(null, { type }); await app.settle();
    const pick = $("[data-ui~='goals.routine-pick']");
    assert(pick, type + ": the editor has a picker");
    const opt = [...pick.options].find((o) => /Stretch/.test(o.textContent));
    assert(opt, type + ": the habit made in Routines is listed: " + [...pick.options].map((o) => o.textContent).join(", "));
    pick.value = opt.value;
    $("[data-ui~='goal.save']").click(); await app.settle();
    const g = K.store.state.goals.items.filter((x) => x.type === type).slice(-1)[0];
    assert(g && g.params && g.params.routine === habit.id, type + ": saved with the routine: " + JSON.stringify(g && g.params));
    let rows = null; K.goals.compute((e, x) => { rows = x; });
    for (let i = 0; i < 50 && !rows; i++) await app.settle();
    const r = (rows || []).find((x) => x.id === g.id);
    assert(r && r._current != null, type + ": it measures the routine: " + JSON.stringify(r && { c: r._current, m: r._meta }));
  }
  eq(app.errors, [], "no page errors");
});

step("H · HR-01: the most recently studied desk comes first on Home", async () => {
  /* start every space, then study Creatives last */
  K.store.state.mind.lessons["F1.1"] = { pages: { 0: Date.now() } };
  K.store.state.creatives.lessons["W1.1"] = { pages: { 0: Date.now() } };
  K.sessions.log({ type: "focus", subject: "compsci", dur: 600, metrics: { complete: true } });
  K.sessions.log({ type: "focus", subject: "creatives", dur: 600, metrics: { complete: true } });
  const L = K.store.state.sessions; L[L.length - 1].ts += 60000;   /* a minute after the CS one */
  K.store.save();
  K.show("home"); await app.settle();
  const sids = $$("[data-ui~='home.desk']").map((d) => d.getAttribute("data-sid"));
  assert(sids.indexOf("creatives") !== -1, "Creatives has a desk: " + sids.join(","));
  eq(sids[0], "creatives", "the subject studied last leads: " + sids.join(","));
  eq(app.errors, [], "no page errors");
});

step("I · HR-02: a week saved before the history arrived is rebuilt once; nothing is saved before the first sync", async () => {
  async function wait(pr) {
    let done = false, v, er; pr.then((x) => { done = true; v = x; }, (x) => { done = true; er = x; });
    for (let i = 0; i < 3000 && !done; i++) await app.settle();
    if (er) throw er; return v;
  }
  const cbp = (fn) => wait(new Promise((res, rej) => fn((e, v) => (e ? rej(e) : res(v)))));
  const RS = K.reportStore, R = K.report;
  const today = K.srs.todayISO(), wk = R.week(R.addDays(R.monday(today), -7));
  /* before the first sync is settled, the backfill saves nothing */
  const realSettled = K.cloudsync.settled, realUid = K.cloud.userId;
  K.cloudsync.settled = () => false; K.cloud.userId = () => "u-test";   /* signed in, pull not landed */
  K.store.state.sessions = []; K.store.save();
  eq((await cbp((c) => RS.ensureReports(c))).length, 0, "nothing saved while the account's copy is on its way");
  K.cloudsync.settled = realSettled; K.cloud.userId = realUid;
  /* saved empty, as on a new device before its pull */
  await cbp((c) => RS.ensureReports(c));
  const before = await cbp((c) => RS.getReport(wk.id, c));
  assert(before && !before.facts.study.mins, "last week saved with no study");
  /* the history arrives: Focus on a day of that week */
  K.sessions.log({ type: "focus", subject: "compsci", dur: 3600, metrics: { complete: true, mode: "custom", rule: "blocks" } });
  const L = K.store.state.sessions, e = L[L.length - 1];
  e.date = wk.start; e.ts = Date.parse(wk.start + "T10:00:00"); K.store.save();
  await cbp((c) => RS.ensureReports(c));
  const after = await cbp((c) => RS.getReport(wk.id, c));
  assert(after.facts.study.mins >= 60, "rebuilt with the hour: " + after.facts.study.mins);
  assert(after.fix && after.fix.empty && after.factsRev >= 1, "marked as the one rebuild, and wins the merge");
  /* once: a later run leaves it */
  const rev = after.factsRev;
  await cbp((c) => RS.ensureReports(c));
  eq((await cbp((c) => RS.getReport(wk.id, c))).factsRev, rev, "not rebuilt again");
  K.store.state.sessions = []; K.store.save();
});

/* ---------------- GO-02: Collection goals measure their own period ---------------- */
async function waitP(pr) {
  let done = false, v, er; pr.then((x) => { done = true; v = x; }, (x) => { done = true; er = x; });
  for (let i = 0; i < 3000 && !done; i++) await app.settle();
  if (er) throw er; return v;
}
const cbP = (fn) => waitP(new Promise((res, rej) => fn((e, v) => (e ? rej(e) : res(v)))));
async function goalRow(id) {
  let rows = null; K.goals.compute((e, x) => { rows = x; });
  for (let i = 0; i < 300 && !rows; i++) await app.settle();
  return (rows || []).find((x) => x.id === id);
}

step("J · GO-02: a goal made today is not met by the vault's history; a title finished in its period counts", async () => {
  const old = Date.parse("2026-01-10T10:00:00");
  for (let i = 0; i < 5; i++) {
    await cbP((c) => K.mediadb.add({ module: "anime", title: "Old done " + i, status: "completed", syncSource: "manual", progress: { current: 12, total: 12 }, createdAt: old }, c));
  }
  await cbP((c) => K.mediadb.add({ module: "anime", title: "Watching now", status: "inProgress", syncSource: "manual", progress: { current: 3, total: 12 }, createdAt: old }, c));
  const g = K.goals.add({ type: "titles-completed", title: "Finish two", target: 2, startDate: K.srs.todayISO() });
  let r = await goalRow(g.id);
  eq(r._current, 0, "five titles completed in January are not this goal's");
  eq(r._status, "active", "so it is not met on the day it was made");
  const now = (await cbP((c) => K.mediadb.query({ module: "anime" }, c))).find((x) => x.title === "Watching now");
  now.status = "completed"; now.progress.current = 12;
  await cbP((c) => K.mediadb.put(now, c));
  r = await goalRow(g.id);
  eq(r._current, 1, "the title finished today counts");
  const eps = K.goals.add({ type: "episodes-watched", title: "Watch", target: 100, startDate: K.srs.todayISO() });
  eq((await goalRow(eps.id))._current, 9, "episodes: the nine watched today, not the vault's 69");
  K.goals.remove(g.id); K.goals.remove(eps.id);
});

step("K · GO-02: the repair takes back Goal getter tiers earned by goals met by the whole vault", async () => {
  const ID = K.repairGoals.ID, st = K.store.state;
  /* as the old rule left it: a goal met on the day it was made, a deleted
     goal's receipt, a genuine study goal's receipt, and Goal getter I */
  const bogus = K.goals.add({ type: "titles-completed", title: "Ten titles", target: 10, startDate: K.srs.todayISO() });
  bogus.status = "completed"; bogus.completedAt = Date.now();
  const L = st.goals.completionLedger;
  L[bogus.id] = { recordedAt: Date.now(), type: "titles-completed", payout: "activity-only" };
  L[9001] = { recordedAt: Date.now(), type: "library-size", payout: "activity-only" };
  L[9002] = { recordedAt: Date.now(), type: "study-hours", payout: "activity-only" };
  st.achievements.earned["goal-getter"] = { tier: 1, at: Date.now(), t: { 1: Date.now() } };
  K.store.save();
  const pv = await waitP(K.repairGoals.plan());
  eq(pv.needed, true, "planned");
  eq(pv.items.map((x) => String(x.id)).sort(), [String(bogus.id), "9001"].sort(), "the two whole-vault receipts, not the study goal's");
  const res = await waitP(K.repairs.run(ID));
  assert(res.ok, "it ran: " + JSON.stringify(res));
  assert(!L[bogus.id] && !L[9001] && L[9002], "the two voided, the study goal's kept");
  eq(st.achievements.earned["goal-getter"].tier, 1, "one genuine receipt still reaches tier I");
  eq(K.goals.get(bogus.id).status, "active", "the goal is open again");
  /* with no genuine receipt left, the badge goes */
  delete st.repairs[ID]; delete L[9002];
  L[9003] = { recordedAt: Date.now(), type: "favourites", payout: "activity-only" };
  st.achievements.earned["goal-getter"] = { tier: 1, at: Date.now(), t: { 1: Date.now() } };
  st.achievements.showcase = ["goal-getter"];
  K.store.save();
  await waitP(K.repairs.run(ID));
  assert(!st.achievements.earned["goal-getter"], "Goal getter is taken back");
  eq(st.achievements.showcase, [], "and leaves the showcase");
  const again = await waitP(K.repairs.run(ID));
  assert(again.already, "it runs once");
  K.goals.remove(bogus.id);
  eq(app.errors, [], "no page errors");
});

step("L · GO-23: a 0% quiz is Red, not Green; Green needs recall AND practice", async () => {
  const leaves = K.hub.LEAVES.maths.filter((l) => K.srs.cardsFor("maths", l.ref).length >= 3 && !K.rag.manual("maths", l.ref) && !K.rag.auto("maths", l.ref)).slice(0, 6);
  eq(leaves.length, 6, "six untouched Maths leaves with cards");
  const five = leaves.slice(0, 5);
  K.store.state.study = K.store.state.study || {}; K.store.state.study.quiz = K.store.state.study.quiz || {};
  const g = K.goals.add({ type: "topics-green", title: "Five to Green", target: 5, startDate: K.srs.todayISO(), links: { refs: five.map((l) => "maths:" + l.ref) } });
  five.forEach((l) => { K.store.state.study.quiz["maths:" + l.ref] = { attempts: 1, best: 0, bestPct: 0, lastPct: 0 }; });
  K.store.save();
  five.forEach((l) => eq(K.rag.effective("maths", l.ref).band, "r", l.ref + ": a 0% quiz is Red"));
  const r = await goalRow(g.id);
  eq([r._current, r._status], [0, "active"], "the goal is not met by failing quizzes");
  /* a perfect quiz alone is Amber, said to be thin */
  const L6 = leaves[5].ref;
  K.store.state.study.quiz["maths:" + L6] = { attempts: 1, best: 10, bestPct: 100, lastPct: 100 };
  const a1 = K.rag.auto("maths", L6);
  eq([a1.band, a1.thin], ["a", true], "100% on one quiz, no cards rated: Amber, not enough evidence");
  assert(/not enough evidence/.test(a1.reasons.join(" ")), "it says why");
  /* and the cards held: Green */
  K.srs.cardsFor("maths", L6).slice(0, 3).forEach((c) => K.srs.rate(c.key, 2));
  const a2 = K.rag.auto("maths", L6);
  eq([a2.band, a2.thin], ["g", false], "recall from three cards and a quiz: Green");
  K.goals.remove(g.id);
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke136: " + failed + " failed" : "smoke136: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
