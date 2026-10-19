/* Kurenai OS — smoke86.test.js
   Money and Goals, the joins that need no design (roadmap 5.4 phase 5):
   replication, the Assistant's tools, Reports' facts and goal notices.

   The claims:

     A · REPLICATION (kos_money). Signed out nothing is sent. Signed in,
         typed transactions and tombstones are pushed, the planner's
         mirror never is; a second sync with nothing new pushes nothing;
         this device's own echo is skipped; another device's row arrives;
         a remote deletion deletes here, leaves no tombstone and is never
         sent back; a deleted confirmed occurrence goes back to "left".
     B · THE ASSISTANT. money_overview gives totals (no payees);
         money_transactions lists entries; every write is undoable and
         its undo works; a bill is confirmed and left again; goals_add
         takes any registered type, refuses a repeat on a live type, and
         goals_list reports domain, pace and the run of periods met.
     C · REPORTS. A week's facts carry Money's totals and its biggest
         categories and the goal periods judged in it; a month adds the
         categories over budget; the words' payload has totals and counts
         only — never a payee, category or goal title.
     D · NOTICES. A weekly goal ending tomorrow, a deadline tomorrow, a
         goal reached and one missed each make one `goal` notice; a
         display-only goal makes none; the ticker never repeats one.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke86.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err) : res(out))); }

let app, K, M, G;
let seq = 7000;
function focus(date, mins) {
  const [y, m, d] = date.split("-").map(Number);
  return { id: seq++, ts: new Date(y, m - 1, d, 18).getTime(), date, type: "focus", subject: "compsci", ref: null, refs: [],
    dur: mins * 60, metrics: { complete: true, mode: "custom", rule: "blocks" }, award: { xp: 0, gold: 0 } };
}
function tool(name, args) {
  return new Promise(res => K.ai.tools.execute(name, args, (err, result, undo) => res({ err, result, undo })));
}

/* a stand-in for the kos_money table: server time is a counter */
function fakeTable() {
  const rows = new Map();
  let clock = 0;
  const ts = () => "2026-10-19T10:00:" + String(++clock).padStart(5, "0");
  return {
    rows,
    remote(row) { rows.set(row.sync_id, Object.assign({ deleted: false, stamp: "x", data_json: {} }, row, { updated_at: ts() })); },
    api: {
      since(stamp, offset, cb) {
        const list = [...rows.values()].filter(r => !stamp || r.updated_at > stamp).sort((a, b) => a.updated_at < b.updated_at ? -1 : 1);
        cb(null, list.slice(offset, offset + 200));
      },
      upsert(batch, cb) {
        batch.forEach(r => rows.set(r.sync_id, { sync_id: r.sync_id, deleted: r.deleted, stamp: r.stamp, data_json: r.data_json, updated_at: ts() }));
        cb(null, batch.map(r => ({ sync_id: r.sync_id })));
      }
    }
  };
}

step("boot on Monday 19 October 2026", async () => {
  app = await boot({ clock: "2026-10-19T10:00:00" });
  K = app.KOS; M = K.money; G = K.goals;
});

/* ---------------- A ---------------- */
let table, tKeep, tGone, rBill;
step("A · signed out, nothing is sent", async () => {
  table = fakeTable();
  M._setCloudApi(table.api);
  K.cloud.signedIn = () => false;
  const out = await p(cb => M.syncCloud(cb));
  eq(out.skipped, true, "skipped");
});
step("A · signed in: typed rows and tombstones go up, the mirror never does", async () => {
  K.cloud.signedIn = () => true; K.cloud.userId = () => "u1";
  K.wishlist.markPurchased(K.wishlist.add({ module: "books", title: "Frieren 12", price: 9 }).id);
  tKeep = await p(cb => M.addTx({ date: "2026-10-05", amount: 20, cat: "food", payee: "Tesco" }, cb));
  tGone = await p(cb => M.addTx({ date: "2026-10-06", amount: 5, cat: "food" }, cb));
  await p(cb => M.deleteTx(tGone.syncId, cb));
  const out = await p(cb => M.syncCloud(cb));
  eq(out.pushed, 2, "one row and one tombstone");
  eq(table.rows.get(tKeep.syncId).data_json.minor, 2000, "the row");
  eq(table.rows.get(tGone.syncId).deleted, true, "the tombstone");
  assert(![...table.rows.keys()].some(k => /^wl:/.test(k)), "the mirror is never sent");
  const again = await p(cb => M.syncCloud(cb));
  eq([again.pushed, again.pulled], [0, 0], "nothing new, and our own echo skipped");
});
step("A · another device's row arrives; its deletion is applied and never sent back", async () => {
  table.remote({ sync_id: "t-other", stamp: "123", data_json: { syncId: "t-other", date: "2026-10-07", minor: 1500, kind: "out", cat: "social", updatedAt: 123 } });
  table.remote({ sync_id: tKeep.syncId, deleted: true, stamp: "del" });
  const out = await p(cb => M.syncCloud(cb));
  eq([out.pulled, out.deleted], [1, 1], "pulled one, deleted one");
  const have = await p(cb => M.range("2026-10-01", "2026-10-31", cb));
  assert(have.some(t => t.syncId === "t-other"), "the other device's row");
  assert(!have.some(t => t.syncId === tKeep.syncId), "deleted here");
  const dump = await p(cb => M.exportAll(cb));
  assert(!dump.del.some(d => d.syncId === tKeep.syncId), "no tombstone of our own for a remote deletion");
  const third = await p(cb => M.syncCloud(cb));
  eq(third.pushed, 0, "nothing sent back");
});
step("A · a confirmed occurrence deleted elsewhere goes back to left", async () => {
  rBill = M.addRule({ name: "Spotify", amount: 11.99, start: "2026-10-12", cat: "subscriptions", sub: true });
  await p(cb => M.confirm(rBill.id, "2026-10-12", cb));
  await p(cb => M.syncCloud(cb));
  table.remote({ sync_id: "r:" + rBill.id + ":2026-10-12", deleted: true, stamp: "del" });
  await p(cb => M.syncCloud(cb));
  eq(M.occurrenceState(M.rule(rBill.id), "2026-10-12", "2026-10-19"), "due", "back to left");
});

/* ---------------- B ---------------- */
step("B · money_overview gives totals and no payees", async () => {
  M.updateCategory("food", { budget: 12000 });
  const r = await tool("money_overview", {});
  assert(!r.err, r.err && r.err.message);
  eq(r.result.month, "2026-10", "month");
  const food = r.result.categories.find(c => c.id === "food");
  eq([food.spent, food.budget], [undefined, 120], "food: nothing spent (its rows were deleted), a £120 budget");
  assert(!JSON.stringify(r.result).includes("Tesco"), "no payee in the overview");
  eq(r.result.subscriptions.count, 1, "the subscription");
});
step("B · writes are undoable, and their undo works", async () => {
  const add = await tool("money_add_transaction", { date: "2026-10-18", amount: 12.5, kind: "out", category: "Transport", payee: "Bus" });
  assert(!add.err, add.err && add.err.message);
  eq(add.result.category, "Transport", "category by name");
  let list = await tool("money_transactions", { search: "bus" });
  eq(list.result.transactions.length, 1, "listed");
  await new Promise(res => add.undo.run(res));
  list = await tool("money_transactions", { search: "bus" });
  eq(list.result.transactions.length, 0, "undone");
  const bud = await tool("money_set_budget", { category: "social", amount: 80 });
  eq(M.budgetOf(M.category("social")), 8000, "budget set");
  await new Promise(res => bud.undo.run(res));
  eq(M.budgetOf(M.category("social")), null, "budget restored");
  const conf = await tool("money_confirm_bill", { rule: rBill.id, date: "2026-10-12" });
  assert(!conf.err, conf.err && conf.err.message);
  eq(M.occurrenceState(M.rule(rBill.id), "2026-10-12", "2026-10-19"), "done", "confirmed");
  await new Promise(res => conf.undo.run(res));
  eq(M.occurrenceState(M.rule(rBill.id), "2026-10-12", "2026-10-19"), "due", "left again");
  const pot = await tool("money_add_pot", { name: "Laptop", target: 900, by: "2027-01-31" });
  const tr = await tool("money_transfer", { pot: pot.result.id, amount: 60 });
  assert(!tr.err, tr.err && tr.err.message);
  const ov = await tool("money_overview", {});
  eq(ov.result.pots.find(x => x.id === pot.result.id).balance, 60, "pot balance");
  eq(ov.result.outgoings, 24, "a transfer is not spending (the other device's £15 and the planner's £9)");
});
step("B · goals_add takes any type; goals_list reports pace and the run", async () => {
  K.store.state.sessions.push(focus("2026-10-07", 660), focus("2026-10-14", 300), focus("2026-10-19", 120));
  const bad = await tool("goals_add", { title: "Greens weekly", type: "topics-green", target: 2, repeat: "week" });
  assert(bad.err && /cannot repeat/.test(bad.err.message), "a live type cannot repeat");
  const none = await tool("goals_add", { title: "Mystery", type: "no-such-type", target: 1 });
  assert(none.err, "an unknown type is refused");
  const add = await tool("goals_add", { title: "10 hours a week", type: "study-hours", target: 10, repeat: "week", startDate: "2026-10-05" });
  assert(!add.err, add.err && add.err.message);
  eq([add.result.domain, add.result.repeat], ["study", "week"], "domain and repeat");
  const old = await tool("goals_add", { title: "Manual", kind: "manual", target: 3 });
  eq(old.result.type, "custom-manual", "older callers still work");
  const list = await tool("goals_list", { domain: "study" });
  const g = list.result.goals.find(x => x.id === add.result.id);
  eq([g.current, g.runMet, g.recent.map(x => x.met)], [2, 0, [true, false]], "this week, the run, the recent weeks");
  eq(g.pace, "ahead", "2 h on a Monday is ahead");
  const types = await tool("goals_types", { domain: "money" });
  assert(types.result.types.some(t => t.id === "money-save" && t.links.includes("pot")), "types with their links");
});

/* ---------------- C ---------------- */
step("C · a week's and a month's facts carry Money and Goals; the payload carries totals only", async () => {
  await p(cb => M.addTx({ date: "2026-10-13", amount: 30, cat: "food", payee: "Secret Payee" }, cb));
  await p(cb => M.addTx({ date: "2026-10-14", amount: 520, kind: "in", cat: "job" }, cb));
  const reached = G.add({ title: "Private goal title", type: "custom-manual", target: 1, current: 1 });
  await p(cb => G.compute(cb));
  G.get(reached.id).completedAt = new Date(2026, 9, 15, 12).getTime();
  const R = K.report;
  const week = await new Promise(res => R.build({ period: "week", start: "2026-10-12", end: "2026-10-18" }, {}, res));
  eq(week.money.outgoings, 3000, "the week's outgoings");
  eq(week.money.income, 52000, "income");
  eq(week.money.top[0], { cat: "food", name: "Food", spent: 3000 }, "the biggest category");
  eq(week.money.over, undefined, "a week makes no budget claim");
  eq(week.goals.periodsMissed, 1, "w/c 12 Oct: 5 h of 10 — missed");
  eq(week.goals.reached.map(x => x.id), [reached.id], "the goal reached that week");
  const month = await new Promise(res => R.build({ period: "month", start: "2026-10-01", end: "2026-10-31" }, {}, res));
  eq(month.money.over, undefined, "food within its £120: no over-budget fact (invariant 77)");
  const pay = K.reportWords.payload({ facts: week });
  eq([pay.money_out, pay.money_in, pay.goals_met, pay.goals_missed], [30, 520, 1, 1], "totals and counts");
  const s = JSON.stringify(pay);
  ["Secret Payee", "Food", "Private goal title"].forEach(x => assert(!s.includes(x), "payload leaks " + x));
});

/* ---------------- D ---------------- */
step("D · goal notices, once each", async () => {
  const today = "2026-10-19";
  const rows = [
    { id: 1, title: "Weekly", repeat: "week", _period: { key: "2026-10-19", from: "2026-10-19", to: "2026-10-20" }, _status: "active", _current: 7.5, _target: 10, _unit: "hours" },
    { id: 2, title: "Due", deadline: "2026-10-20", _status: "active", _current: 3, _target: 5, _unit: "topics" },
    { id: 3, title: "Done", _status: "completed", _current: 4, _target: 4, _unit: "" },
    { id: 4, title: "Missed", deadline: "2026-10-18", _status: "failed", _current: 40, _target: 75, _unit: "£" },
    { id: 5, title: "Streak", _status: "completed", _displayOnly: true, _current: 14, _target: 14 },
    { id: 6, title: "Archived", archived: true, deadline: "2026-10-20", _status: "active", _current: 0, _target: 1 }
  ];
  const n = G.notices(rows, today);
  eq(n.map(x => x.id), ["goal:1:end:2026-10-19", "goal:2:due:2026-10-20", "goal:3:done", "goal:4:missed"], "one each, none for display-only or archived");
  eq(n[0].body, "7 h 30 m of 10 h", "hours read as hours");
  eq(n[3].body.slice(0, 11), "£40 of £75.", "money reads as money");
  assert(n.every(x => x.kind === "goal" && K.notify.KINDS.goal), "the goal kind");
  const g = G.add({ title: "Read tonight", type: "custom-manual", target: 2, deadline: "2026-10-20" });
  const first = await p(cb => G.tick(cb));
  assert(first.includes("goal:" + g.id + ":due:2026-10-20"), "posted");
  const second = await p(cb => G.tick(cb));
  eq(second.filter(id => id.startsWith("goal:" + g.id)), [], "never twice");
});

step("no errors, no session, no request", async () => {
  eq(app.errors, [], "window errors");
  assert(!app.fetches.some(f => /kos_money/.test(String(f.url || f))), "the fake table took every call");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("FAIL  " + name + "\n      " + e.message); }
  }
  console.log(failed ? "\n" + failed + " step(s) failed" : "\nsmoke86: all " + steps.length + " steps passed");
  process.exit(failed ? 1 : 0);
})();
