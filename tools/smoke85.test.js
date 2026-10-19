/* Kurenai OS — smoke85.test.js
   Goals, phase 3 (roadmap 5.4): the engine, with no new screens.

   The claims:

     A · THE MIGRATION. A returning user's v2 goals become v3 on first
         read: every one keeps its type, target and dates, gains the
         "collection" domain, links, params and milestones; legacy metric
         names still map; a second pass changes nothing.
     B · THE REGISTRY. Every domain registers types; a type id the engine
         does not know is KEPT, never turned into a manual goal.
     C · REPEATING GOALS. "10 hours a week" measures this week live and
         judges each ENDED week once from the ledger; the run of weeks met
         is read from those outcomes; editing the target keeps the past.
     D · PACE. The straight-line expectation gives ahead / on track /
         behind for a reach goal and for a spend-under goal; a
         display-only goal makes no claim; a projected finish needs three
         days and something done.
     E · MONEY GOALS read Money: spend under in one category, saving into
         a pot (a removed pot is said so), no-spend days.
     F · CODE AND THE GOVERNOR. Code tasks count first passes and never a
         seen answer; a streak goal completes with `payout: "none"`;
         measuring never logs a session or moves the Governor.
     G · NO CLAIM WITHOUT EVIDENCE. Recall says nothing under 50 reviews.
     H · BASELINES. "Topics to Green" counts topics turned green after the
         goal was made, not the ones already green.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke85.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err) : res(out))); }

let app, K, G;
let seq = 9000;
function at(date, h) { const [y, m, d] = date.split("-").map(Number); return new Date(y, m - 1, d, h || 18).getTime(); }
function focus(date, mins, sid) {
  return { id: seq++, ts: at(date), date, type: "focus", subject: sid || "compsci", ref: null, refs: [], dur: mins * 60,
    metrics: { complete: true, mode: "custom", rule: "blocks", blocks: Math.floor(mins / 10) }, award: { xp: 0, gold: 0 } };
}
function cards(date, n, again) {
  return { id: seq++, ts: at(date, 12), date, type: "flashcards", subject: "compsci", ref: null, refs: [],
    metrics: { cards: n, again: again, hard: 0, good: n - again, easy: 0 }, award: { xp: 0, gold: 0 } };
}
function code(date, kind, extra) {
  return { id: seq++, ts: at(date, 15), date, type: "code", subject: "code", ref: "1.1", metrics: Object.assign({ kind }, extra || {}), award: { xp: 0, gold: 0 } };
}
const rowOf = (rows, id) => rows.find(r => r.id === id);

const V2 = {
  progress: {},
  goals: {
    v: 2, nextId: 4, completionLedger: { "3": { recordedAt: 1, type: "custom-manual", payout: "activity-only" } },
    items: [
      { id: 1, title: "Finish three anime", type: "titles-completed", kind: "auto", metric: "titles-completed", module: "anime",
        target: 3, startDate: "2026-09-01", deadline: "2026-12-31", status: "active", createdAt: 1, updatedAt: 1 },
      { id: 2, title: "Old episodes goal", metric: "anime-episodes", target: 50, startDate: "2026-08-01", status: "active", createdAt: 1 },
      { id: 3, title: "Tidy the shelf", type: "custom-manual", kind: "manual", target: 4, current: 4, status: "completed",
        completedAt: 2, startDate: "2026-08-01", createdAt: 1 }
    ]
  }
};

step("boot a returning user on Monday 19 October 2026", async () => {
  app = await boot({ clock: "2026-10-19T10:00:00", storage: { "kurenai-os-v1": JSON.stringify(V2) } });
  K = app.KOS; G = K.goals;
});

/* ---------------- A ---------------- */
step("A · v2 goals become v3 on first read, losing nothing", () => {
  const items = G.all();
  eq(K.store.state.goals.v, 3, "version");
  eq(items.map(g => g.type), ["titles-completed", "episodes-watched", "custom-manual"], "types (a legacy metric still maps)");
  eq(items.map(g => g.domain), ["collection", "collection", "collection"], "domain");
  eq([items[0].module, items[0].target, items[0].deadline], ["anime", 3, "2026-12-31"], "fields kept");
  eq(items[1].module, "anime", "the legacy module");
  eq([items[2].status, items[2].current], ["completed", 4], "a finished manual goal stays finished");
  assert(items.every(g => g.links && g.params && Array.isArray(g.milestones) && g.repeat === null), "new fields");
  eq(K.store.state.goals.completionLedger["3"].payout, "activity-only", "the receipt kept");
  const again = items.map(g => G.normalise(JSON.parse(JSON.stringify(g))));
  eq(again, JSON.parse(JSON.stringify(items)), "a second pass changes nothing");
});

/* ---------------- B ---------------- */
step("B · every domain has types, and an unknown type is kept", () => {
  G.DOMAINS.forEach(d => assert(G.types({ domain: d }).length >= 1, "no types for " + d));
  ["study-hours", "cards-reviewed", "recall-rate", "topics-green", "focus-hours", "focus-blocks", "todos-done",
    "plan-ticked", "money-spend-under", "money-income", "money-no-spend", "money-save", "code-tasks",
    "code-retrievals", "code-capstone", "gov-streak", "gov-level"].forEach(id => eq(G.typeDef(id).id, id, "type " + id));
  const g = G.normalise({ id: 99, title: "From the future", type: "japanese-kana", target: 46 });
  eq([g.type, g.kind], ["japanese-kana", "auto"], "kept as it is");
  const noRepeat = G.normalise({ id: 98, type: "topics-green", repeat: "week" });
  eq(noRepeat.repeat, null, "a live type cannot repeat");
});

/* ---------------- C ---------------- */
let weekly;
step("C · a weekly goal judges each ended week once", async () => {
  const L = K.store.state.sessions;
  L.push(focus("2026-09-29", 300), focus("2026-10-01", 360));     // w/c 28 Sep: 11 h — met
  L.push(focus("2026-10-07", 360));                               // w/c 5 Oct: 6 h — missed
  L.push(focus("2026-10-13", 600));                               // w/c 12 Oct: 10 h — met
  L.push(focus("2026-10-19", 180), focus("2026-10-19", 60, "media")); // this week: 3 h of study
  weekly = G.add({ title: "10 hours a week", type: "study-hours", target: 10, repeat: "week", startDate: "2026-09-28" });
  eq(weekly.domain, "study", "domain from the type");
  const rows = await p(cb => G.compute(cb));
  const r = rowOf(rows, weekly.id);
  eq([r._current, r._status, r._run], [3, "active", 1], "this week live, run of 1");
  eq(r._period, { key: "2026-10-19", from: "2026-10-19", to: "2026-10-25" }, "the period");
  const o = G.get(weekly.id).outcomes;
  eq(Object.keys(o), ["2026-09-28", "2026-10-05", "2026-10-12"], "three ended weeks judged");
  eq([o["2026-09-28"].met, o["2026-10-05"].met, o["2026-10-12"].met], [true, false, true], "met, missed, met");
  eq(o["2026-10-05"].value, 6, "the figure kept");
  eq(r._pace, "ahead", "3 h on the Monday is ahead of the line");
  const stamp = o["2026-10-12"].at;
  G.update(weekly.id, { target: 12 });
  await p(cb => G.compute(cb));
  const o2 = G.get(weekly.id).outcomes;
  eq([o2["2026-10-12"].met, o2["2026-10-12"].target, o2["2026-10-12"].at], [true, 10, stamp], "the past is not re-judged");
});

/* ---------------- D ---------------- */
step("D · pace and the projected finish", () => {
  const reach = G.typeDef("study-hours"), under = G.typeDef("money-spend-under"), shown = G.typeDef("gov-streak");
  const g = {};
  const P = (def, cur, tgt) => G.pace(g, def, cur, tgt, "2026-10-01", "2026-10-30", "2026-10-15");
  eq([P(reach, 30, 100), P(reach, 48, 100), P(reach, 60, 100), P(reach, 100, 100)], ["behind", "on-track", "ahead", "ahead"], "reach");
  eq([P(under, 40, 75), P(under, 45, 75), P(under, 80, 75)], ["on-track", "behind", "behind"], "spend under");
  eq(P(shown, 5, 14), null, "display only");
  eq(G.pace(g, reach, 1, 10, "2026-10-20", "2026-10-30", "2026-10-15"), null, "not started");
  eq(G.projected(reach, 4, 10, "2026-10-10", "2026-10-19"), "2026-11-03", "projected from the rate");
  eq(G.projected(reach, 4, 10, "2026-10-18", "2026-10-19"), null, "two days is too few");
  eq(G.projected(reach, 0, 10, "2026-10-01", "2026-10-19"), null, "nothing done");
});

/* ---------------- E ---------------- */
let gFood, gPot, gNoSpend, laptop;
step("E · Money goals read Money", async () => {
  const M = K.money;
  laptop = M.addPot({ name: "Laptop", targetAmount: 900, by: "2027-01-31" });
  await p(cb => M.addTx({ date: "2026-10-03", amount: 96, cat: "food" }, cb));
  await p(cb => M.addTx({ date: "2026-10-14", amount: 30, cat: "social" }, cb));
  await p(cb => M.addTx({ date: "2026-10-16", amount: 420, kind: "transfer", pot: laptop.id }, cb));
  gFood = G.add({ title: "Food under £120", type: "money-spend-under", target: 120, repeat: "month", links: { category: "food" } });
  gPot = G.add({ title: "Laptop", type: "money-save", target: 900, deadline: "2027-01-31", links: { pot: laptop.id } });
  gNoSpend = G.add({ title: "No-spend days", type: "money-no-spend", target: 5, startDate: "2026-10-13", deadline: "2026-10-19" });
  const rows = await p(cb => G.compute(cb));
  const f = rowOf(rows, gFood.id), s = rowOf(rows, gPot.id), n = rowOf(rows, gNoSpend.id);
  eq([f._current, f._status, f._period.from], [96, "met", "2026-10-01"], "food spend this month, within £120");
  eq([s._current, s._target, s._meta], [420, 900, "Laptop"], "the pot's balance");
  eq(n._current, 6, "13–19 Oct with one spending day is six no-spend days");
  eq(n._status, "completed", "five reached");
  K.store.state.money.pots = K.store.state.money.pots.filter(x => x.id !== laptop.id);
  const again = rowOf(await p(cb => G.compute(cb)), gPot.id);
  eq(again._meta, "The linked pot was removed", "a removed pot is said so");
});

/* ---------------- F ---------------- */
step("F · Code counts first passes; a streak goal pays nothing; measuring logs nothing", async () => {
  const L = K.store.state.sessions;
  L.push(code("2026-10-14", "task"), code("2026-10-15", "task", { seen: true }), code("2026-10-16", "task"),
    code("2026-10-16", "retrieval", { grade: "good" }), code("2026-10-17", "retrieval", { grade: "again" }));
  const gTasks = G.add({ title: "Ten tasks", type: "code-tasks", target: 10, repeat: "month" });
  const gRet = G.add({ title: "Retrievals", type: "code-retrievals", target: 4, repeat: "week", startDate: "2026-10-12" });
  const gStreak = G.add({ title: "A streak", type: "gov-streak", target: 1 });
  const n0 = L.length, gov0 = JSON.stringify(K.store.state.governor);
  const rows = await p(cb => G.compute(cb));
  eq(rowOf(rows, gTasks.id)._current, 2, "the seen answer does not count");
  eq(G.get(gRet.id).outcomes["2026-10-12"].value, 1, "last week's proven retrieval");
  const st = rowOf(rows, gStreak.id);
  eq([st._status, st._displayOnly, st._pace], ["completed", true, null], "a display-only goal completes and makes no pace claim");
  eq(K.store.state.goals.completionLedger[String(gStreak.id)].payout, "none", "reading a value never pays");
  eq(L.length, n0, "no session logged");
  eq(JSON.stringify(K.store.state.governor), gov0, "the Governor did not move");
});

/* ---------------- G ---------------- */
step("G · recall makes no claim under 50 reviews", async () => {
  const L = K.store.state.sessions;
  L.push(cards("2026-10-19", 40, 4));
  const gr = G.add({ title: "Recall 85%", type: "recall-rate", target: 85, repeat: "week" });
  let r = rowOf(await p(cb => G.compute(cb)), gr.id);
  eq([r._current, r._pace], [null, null], "nothing to stand on");
  assert(/50 reviews/.test(r._meta), "says why");
  L.push(cards("2026-10-19", 20, 2));
  r = rowOf(await p(cb => G.compute(cb)), gr.id);
  eq(r._current, 90, "60 reviews, 6 again: 90%");
});

/* ---------------- H ---------------- */
step("H · topics to Green count from the goal's own start", async () => {
  const leaves = K.hub.LEAVES.maths.slice(0, 3);
  K.store.getProgress("maths", leaves[0].ref).rag = "g";
  const gg = G.add({ title: "Greens", type: "topics-green", target: 2, links: { subject: "maths" } });
  eq(G.get(gg.id).params.baseline, 1, "one green already");
  let r = rowOf(await p(cb => G.compute(cb)), gg.id);
  eq(r._current, 0, "nothing new yet");
  K.store.getProgress("maths", leaves[1].ref).rag = "g";
  K.store.getProgress("maths", leaves[2].ref).rag = "g";
  r = rowOf(await p(cb => G.compute(cb)), gg.id);
  eq([r._current, r._status], [2, "completed"], "two new greens");
});

step("the Planner's Goals page still draws every goal", async () => {
  K.store.state.media.goalsTab = "active";
  K.show("goals");
  await app.settle();
  const cards = app.document.querySelectorAll('[data-ui~="goal.card"]');
  const active = (await p(cb => G.compute(cb))).filter(g => g._status === "active" || g._status === "met").length;
  eq(cards.length, active, "every active goal drawn");
  eq(app.errors, [], "window errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("FAIL  " + name + "\n      " + e.message); }
  }
  console.log(failed ? "\n" + failed + " step(s) failed" : "\nsmoke85: all " + steps.length + " steps passed");
  process.exit(failed ? 1 : 0);
})();
