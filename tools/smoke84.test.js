/* Kurenai OS — smoke84.test.js
   Money, phase 1 (roadmap 5.4): the core, with no new screens.

   The claims:

     A · THE GATE. `state.money` is born with the default categories, the
         planner's currency and month start 1; a second pass changes
         nothing; a lost Collection category comes back; ids are strings.
     B · THE MIRROR. Every archived Budget Planner purchase is a Collection
         transaction with a derived id; a price edit follows, a reversal
         removes it, it cannot be edited or deleted from Money, and it is
         not in the backup (the state document already carries it). The
         Collection budget IS the planner's monthly limit.
     C · TRANSACTIONS. Add, update, delete with a tombstone; a split that
         does not add up is dropped; a refund lowers spend; a transfer to a
         pot is never spend, and pot balances are derived from transfers.
     D · THE MONTH. A payday month start moves the period; the summary's
         budgets, a one-month rollover and the over state; the claims about
         the rest of the month are null without the evidence (invariant 76).
     E · RECURRING. One rule, computed: the 31st clamps, weeks step, an end
         date ends; confirm writes one derived transaction (twice is still
         one), skip and unmark; deleting a confirmed transaction returns it
         to "due"; a price rise is recorded; subscriptions per month/year.
     F · LAZY LISTS. 130 rows come back as 60 + 60 + 10 on an exact cursor,
         with no row twice; filters apply.
     G · CSV. Quoted fields and a semicolon file; the header guess; UK
         dates; the preview marks duplicates (stored and within the file);
         import skips them; export writes a split as two lines.
     H · BACKUP. snapshotFull carries the typed transactions and importAll
         puts them back.
     I · OUTSIDE THE GOVERNOR. None of the above logs a session, moves XP,
         gold or HP, or makes a request (invariant 5a).
     J · TWO DEVICES. Categories, rules and pots added on two devices both
         survive the cloud merge, keyed by their string ids.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke84.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err) : res(out))); }
function pe(fn) { return new Promise((res) => fn((err, out) => res([err, out]))); }

let app, K, M, gov0, sessions0;

step("boot on 19 October 2026", async () => {
  app = await boot({ clock: "2026-10-19T10:00:00" });
  K = app.KOS; M = K.money;
  assert(M && M.available(), "KOS.money missing");
  gov0 = JSON.stringify({ xp: K.store.state.governor.xp, gold: K.store.state.governor.gold, hp: K.store.state.governor.hp });
  sessions0 = K.store.state.sessions.length;
});

/* ---------------- A ---------------- */
step("A · the gate makes the defaults once, and keeps the Collection category", () => {
  const m = M.data();
  eq(m.v, 1, "version");
  eq(m.monthStart, 1, "month start");
  eq(m.currency, "£", "currency from the planner");
  const ids = m.categories.map(c => c.id);
  ["food", "transport", "bills", "subscriptions", "education", "collection", "job", "allowance"].forEach(id =>
    assert(ids.includes(id), "missing default category " + id));
  assert(m.categories.every(c => typeof c.id === "string"), "ids are strings");
  const again = M.normalise(JSON.parse(JSON.stringify(m)));
  eq(again, m, "a second pass changes nothing");
  const lost = M.normalise(Object.assign({}, m, { categories: m.categories.filter(c => c.id !== "collection") }));
  const col = lost.categories.find(c => c.id === "collection");
  assert(col && col.budgetFrom === "wishlist", "the Collection category comes back, reading the planner");
});

/* ---------------- B ---------------- */
let wlA, wlB;
step("B · planner purchases are mirrored as Collection transactions", async () => {
  const W = K.wishlist;
  W.setBudget({ monthlyLimit: 75 });
  wlA = W.add({ module: "books", title: "Frieren vol. 12", price: 8.99 });
  wlB = W.add({ module: "game", title: "Hollow Knight: Silksong", price: 24.99 });
  W.markPurchased(wlA.id); W.markPurchased(wlB.id);
  const s = await p(cb => M.summary("2026-10", cb));
  const c = s.byCat.collection;
  eq(c.net, 899 + 2499, "Collection spend");
  eq(c.budget, 7500, "the Collection budget is the planner's limit");
  eq(c.modules, { books: 899, game: 2499 }, "per-module breakdown");
  const rows = await p(cb => M.range("2026-10-01", "2026-10-31", cb));
  const mine = rows.filter(r => r.src === "wishlist");
  eq(mine.length, 2, "two mirrored rows");
  assert(mine.every(r => /^wl:\d+:\d+$/.test(r.syncId)), "derived ids");
});
step("B · a price edit follows, a reversal removes, and Money cannot edit them", async () => {
  const W = K.wishlist;
  W.update(wlA.id, { price: 9.49 });
  let s = await p(cb => M.summary("2026-10", cb));
  eq(s.byCat.collection.net, 949 + 2499, "price edit followed");
  W.setStatus(wlB.id, "wantToBuy");
  s = await p(cb => M.summary("2026-10", cb));
  eq(s.byCat.collection.net, 949, "reversal removed");
  const rows = await p(cb => M.range("2026-10-01", "2026-10-31", cb));
  const r = rows.find(x => x.src === "wishlist");
  const [e1] = await pe(cb => M.updateTx(r.syncId, { minor: 1 }, cb));
  const [e2] = await pe(cb => M.deleteTx(r.syncId, cb));
  assert(e1 && /Budget Planner/.test(e1.message), "edit refused");
  assert(e2 && /Budget Planner/.test(e2.message), "delete refused");
  M.setBudget("collection", "60");
  eq(K.store.state.wishlist.budget.monthlyLimit, 60, "setting the Collection budget writes the planner's limit");
  M.setBudget("collection", "75");
});

/* ---------------- C ---------------- */
let tFood, potLaptop;
step("C · add, update and delete, with a tombstone", async () => {
  tFood = await p(cb => M.addTx({ date: "2026-10-03", amount: "£12.50", kind: "out", cat: "food", payee: "Tesco", tags: ["weekly", "weekly"] }, cb));
  eq(tFood.minor, 1250, "typed amount to pence");
  eq(tFood.tags, ["weekly"], "tags deduplicated");
  const up = await p(cb => M.updateTx(tFood.syncId, { minor: 1300 }, cb));
  eq(up.minor, 1300, "updated");
  const [bad] = await pe(cb => M.addTx({ date: "2026-10-03", amount: 0 }, cb));
  assert(bad, "a zero amount is refused");
  const gone = await p(cb => M.addTx({ date: "2026-10-04", amount: 3, cat: "food" }, cb));
  await p(cb => M.deleteTx(gone.syncId, cb));
  const dump = await p(cb => M.exportAll(cb));
  assert(dump.del.some(d => d.syncId === gone.syncId), "tombstone recorded");
  assert(!dump.tx.some(t => t.syncId === gone.syncId), "row gone");
});
step("C · splits, refunds and transfers", async () => {
  const bad = M.normaliseTx({ date: "2026-10-05", minor: 2340, kind: "out", splits: [{ cat: "food", minor: 1890 }, { cat: "social", minor: 100 }] });
  eq(bad.splits, null, "a split that does not add up is dropped");
  await p(cb => M.addTx({ date: "2026-10-05", minor: 2340, kind: "out", payee: "Tesco",
    splits: [{ cat: "food", minor: 1890 }, { cat: "social", minor: 450 }] }, cb));
  await p(cb => M.addTx({ date: "2026-10-06", amount: 7.99, kind: "refund", cat: "collection", payee: "Steam" }, cb));
  potLaptop = M.addPot({ name: "Laptop", targetAmount: 900, by: "2027-01-31" });
  await p(cb => M.addTx({ date: "2026-10-07", amount: 60, kind: "transfer", pot: potLaptop.id, dir: "in" }, cb));
  await p(cb => M.addTx({ date: "2026-10-08", amount: 10, kind: "transfer", pot: potLaptop.id, dir: "out" }, cb));
  const [noPot] = await pe(cb => M.addTx({ date: "2026-10-08", amount: 10, kind: "transfer", pot: "p-nope" }, cb));
  assert(noPot, "a transfer to a missing pot is refused");
  const s = await p(cb => M.summary("2026-10", cb));
  eq(s.byCat.food.net, 1300 + 1890, "food includes its split part");
  eq(s.byCat.social.net, 450, "social gets the other part");
  eq(s.byCat.collection.net, 949 - 799, "refund lowers spend");
  eq(s.outgoings, 1300 + 2340 + 949 - 799, "transfers are not spend");
  eq(s.toPots, 6000, "to pots"); eq(s.fromPots, 1000, "from pots");
  const bal = await p(cb => M.potBalances(cb));
  eq(bal[potLaptop.id], 5000, "pot balance from transfers");
  eq(M.setAside(potLaptop, 5000, "2026-10-19"), Math.ceil((90000 - 5000) / 4), "monthly set-aside to the target date");
});

/* ---------------- D ---------------- */
step("D · a payday month start moves the period", () => {
  eq(M.periodKey("2026-11-03", 28), "2026-10", "3 Nov is in October's payday month");
  eq(M.periodKey("2026-10-28", 28), "2026-10", "the 28th starts it");
  eq(M.periodRange("2026-10", 28), { key: "2026-10", from: "2026-10-28", to: "2026-11-27", days: 31 }, "range");
  eq(M.periodRange("2026-02", 1), { key: "2026-02", from: "2026-02-01", to: "2026-02-28", days: 28 }, "calendar month");
});
step("D · budgets, a one-month rollover, over budget, and honest insights", async () => {
  M.updateCategory("education", { budget: 6000, rollover: true });
  M.updateCategory("food", { budget: 12000 });
  await p(cb => M.addTx({ date: "2026-09-10", amount: 40, cat: "education" }, cb));
  await p(cb => M.addTx({ date: "2026-10-09", amount: 85, cat: "education" }, cb));
  const s = await p(cb => M.summary("2026-10", cb));
  const ed = s.byCat.education;
  eq(ed.rollover, 2000, "£20 rolled over from September");
  eq(ed.left, 6000 + 2000 - 8500, "left");
  eq(ed.over, true, "over budget");
  eq(s.byCat.food.over, false, "food within budget");
  const early = M.insights(Object.assign({}, s, { days: 6 }), "2026-10-19");
  eq([early.projection, early.safeToday], [null, null], "six days of entries make no claim");
  const late = M.insights(Object.assign({}, s, { days: 7 }), "2026-10-19");
  assert(late.projection > 0 && late.safeToday != null, "seven days of entries do");
});
step("D · the design's worked example: left £228.03, safe today £4.73 (27b)", () => {
  /* the hero's numbers with no rules in play: £640 planned (all received
     here), £351.97 spent, £60.00 moved to pots, £166.49 still to come */
  const s = { from: "2026-10-01", to: "2026-10-31", length: 31, income: 64000, outgoings: 35197,
    toPots: 6000, fromPots: 0, days: 15, byCat: {} };
  const ins = M.insights(s, "2026-10-19");
  eq([ins.planned, ins.outgoings, ins.left], [64000, 41197, 22803], "planned, outgoings, left");
  eq(ins.daysLeft, 13, "13 days left, today included");
  eq(Math.floor((ins.left - 16649) / 13), 473, "£4.73 a day after £166.49 to come");
  eq(ins.projection, Math.round(35197 / 19 * 31), "the projection is spend only, about £574");
});

/* ---------------- E ---------------- */
let rSpot;
step("E · occurrences are computed from one rule", () => {
  const r31 = M.normaliseRule({ id: "x", name: "Rent", minor: 100, start: "2026-01-31", every: { n: 1, unit: "month" } });
  eq(M.occurrences(r31, "2026-02-01", "2026-04-30"), ["2026-02-28", "2026-03-31", "2026-04-30"], "the 31st clamps");
  const wk = M.normaliseRule({ id: "y", name: "Bus", minor: 100, start: "2026-10-01", every: { n: 2, unit: "week" }, end: "2026-11-05" });
  eq(M.occurrences(wk, "2026-10-10", "2026-12-31"), ["2026-10-15", "2026-10-29"], "fortnightly with an end date");
  const yr = M.normaliseRule({ id: "z", name: "Domain", minor: 1400, start: "2025-03-14", every: { n: 1, unit: "year" } });
  eq(M.occurrences(yr, "2026-01-01", "2027-12-31"), ["2026-03-14", "2027-03-14"], "yearly");
  eq(M.perMonth(yr), 117, "£14 a year is £1.17 a month");
});
step("E · confirm, skip, leave; a price rise; subscriptions", async () => {
  rSpot = M.addRule({ name: "Spotify", amount: 10.99, start: "2026-08-12", cat: "subscriptions", sub: true });
  M.setPrice(rSpot.id, 11.99, "2026-09-12");
  eq(M.amountOn(M.rule(rSpot.id), "2026-08-12"), 1099, "August at the old price");
  eq(M.amountOn(M.rule(rSpot.id), "2026-10-12"), 1199, "October at the new price");
  eq(M.priceChange(M.rule(rSpot.id)), { from: "2026-09-12", was: 1099, now: 1199 }, "the rise is recorded");
  const up = M.upcoming("2026-08-01", "2026-11-30", "2026-10-19").filter(o => o.rule === rSpot.id);
  eq(up.map(o => o.state), ["due", "due", "due", "upcoming"], "past ones are due (left), the next upcoming");
  const t1 = await p(cb => M.confirm(rSpot.id, "2026-10-12", cb));
  await p(cb => M.confirm(rSpot.id, "2026-10-12", cb));
  eq(t1.syncId, "r:" + rSpot.id + ":2026-10-12", "derived id");
  const oct = (await p(cb => M.range("2026-10-12", "2026-10-12", cb))).filter(t => t.src === "rule");
  eq(oct.length, 1, "confirming twice is still one transaction");
  eq(oct[0].minor, 1199, "at the price in force");
  await p(cb => M.skip(rSpot.id, "2026-09-12", cb));
  eq(M.occurrenceState(M.rule(rSpot.id), "2026-09-12", "2026-10-19"), "skip", "skipped");
  await p(cb => M.unmark(rSpot.id, "2026-09-12", cb));
  eq(M.occurrenceState(M.rule(rSpot.id), "2026-09-12", "2026-10-19"), "due", "back to left");
  await p(cb => M.deleteTx(t1.syncId, cb));
  eq(M.occurrenceState(M.rule(rSpot.id), "2026-10-12", "2026-10-19"), "due", "deleting the transaction returns it to due");
  const [notOcc] = await pe(cb => M.confirm(rSpot.id, "2026-10-13", cb));
  assert(notOcc, "a date that is not an occurrence is refused");
  M.addRule({ name: "Domain", amount: 14, start: "2026-03-14", every: { unit: "year" }, sub: true });
  M.addRule({ name: "Job", amount: 520, start: "2026-10-28", kind: "in", cat: "job" });
  const subs = M.subscriptions();
  eq(subs.items.length, 2, "two subscriptions");
  eq(subs.perMonth, 1199 + 117, "per month");
  eq(subs.perYear, 1199 * 12 + 1400, "per year: the real yearly cost (twelve monthly, one yearly)");
});

/* ---------------- F ---------------- */
step("F · a lazy list in 60-row batches on an exact cursor", async () => {
  const rows = [];
  for (let i = 0; i < 130; i++) {
    const d = "2026-07-" + String(1 + (i % 28)).padStart(2, "0");
    rows.push(new Promise((res, rej) => M.addTx({ date: d, amount: 1 + i / 100, cat: i % 2 ? "food" : "transport", payee: "Shop " + i }, (e, t) => e ? rej(e) : res(t))));
  }
  await Promise.all(rows);
  const seen = new Set(); let cursor = null; const sizes = [];
  do {
    const out = await new Promise((res, rej) => M.list({ from: "2026-07-01", to: "2026-07-31", before: cursor }, (e, list, next) => e ? rej(e) : res([list, next])));
    sizes.push(out[0].length);
    out[0].forEach(t => { assert(!seen.has(t.syncId), "row twice: " + t.syncId); seen.add(t.syncId); });
    for (let i = 1; i < out[0].length; i++) assert(out[0][i - 1].date >= out[0][i].date, "newest first");
    cursor = out[1];
  } while (cursor);
  eq(sizes, [60, 60, 10], "batches");
  const food = await new Promise((res) => M.list({ from: "2026-07-01", to: "2026-07-31", cat: "food", limit: 200 }, (e, l) => res(l)));
  eq(food.length, 65, "category filter");
  const one = await new Promise((res) => M.list({ search: "shop 129" }, (e, l) => res(l)));
  eq(one.length, 1, "search");
});

/* ---------------- G ---------------- */
step("G · CSV: parse, guess, preview duplicates, import, export", async () => {
  const text = "Date,Description,Amount\n" +
    "03/10/2026,Tesco,-13.00\n" +
    '19/10/2026,"Café, Leeds",-4.20\n' +
    '19/10/2026,"Café, Leeds",-4.20\n' +
    "20/10/2026,Allowance,120\n" +
    "31/02/2026,Bad date,-1\n";
  const parsed = M.csv.parse(text);
  eq(parsed.header, ["Date", "Description", "Amount"], "header");
  eq(parsed.rows[1][1], "Café, Leeds", "quoted comma kept");
  const map = M.csv.guess(parsed.header);
  eq(map, { date: 0, payee: 1, amount: 2 }, "header guess");
  const semi = M.csv.parse("Date;Paid out;Paid in\n01/10/2026;3,50;\n");
  eq(semi.delimiter, ";", "semicolon file");
  eq(M.csv.guess(semi.header), { date: 0, out: 1, in: 2 }, "in/out columns");
  const prev = await p(cb => M.csv.preview(parsed, map, {}, cb));
  eq(prev.errors.map(e => e.line), [6], "the impossible date is reported");
  eq(prev.rows.map(r => r.duplicate), [true, false, true, false], "Tesco £13 on the 3rd is stored; the café repeats in the file");
  eq(prev.rows[3].kind, "in", "a positive amount is income");
  const res = await p(cb => M.csv.import(prev.rows, {}, cb));
  eq([res.added, res.skipped], [2, 2], "duplicates skipped");
  assert(/^b-/.test(res.batch), "one batch id for the import");
  const csv = await p(cb => M.csv.export("2026-10-05", "2026-10-05", cb));
  eq(csv.trim().split("\n").length, 3, "a split exports as two lines");
});

/* ---------------- H ---------------- */
step("H · the backup carries typed transactions and importAll restores them", async () => {
  const snap = await p(cb => K.store.snapshotFull(cb));
  assert(snap.money && snap.money.tx.length > 100, "money in the backup");
  assert(!snap.money.tx.some(t => t.src === "wishlist"), "the mirror is not in it");
  const n = snap.money.tx.length;
  await p(cb => M.importAll({ tx: [], del: [] }, cb));
  eq((await p(cb => M.exportAll(cb))).tx.length, 0, "cleared");
  const out = await p(cb => M.importAll(snap.money, cb));
  eq(out.tx, n, "restored");
  const s = await p(cb => M.summary("2026-10", cb));
  assert(s.byCat.collection && s.byCat.collection.net === 949 - 799, "the mirror is rebuilt after a restore");
});

/* ---------------- I ---------------- */
step("I · no session, no Governor movement, no request", async () => {
  await app.settle();
  eq(K.store.state.sessions.length, sessions0, "no session logged");
  eq(JSON.stringify({ xp: K.store.state.governor.xp, gold: K.store.state.governor.gold, hp: K.store.state.governor.hp }), gov0, "Governor untouched");
  assert(!app.fetches.some(f => /money/i.test(String(f.url || f))), "no money request");
});

/* ---------------- J ---------------- */
step("J · two devices' categories, rules and pots both survive the merge", () => {
  const base = JSON.parse(JSON.stringify(K.store.state));
  const a = JSON.parse(JSON.stringify(base)), b = JSON.parse(JSON.stringify(base));
  a.money.categories.push(M.normaliseCategory({ id: "c-aaaa", name: "Driving lessons", updatedAt: 1 }));
  b.money.categories.push(M.normaliseCategory({ id: "c-bbbb", name: "Concerts", updatedAt: 1 }));
  a.money.pots.push(M.normalisePot({ id: "p-aaaa", name: "Holiday" }));
  b.money.rules.push(M.normaliseRule({ id: "r-bbbb", name: "Crunchyroll", minor: 649, start: "2026-10-01" }));
  const out = K.cloudmerge.merge(base, a, b).doc;
  const cats = out.money.categories.map(c => c.id);
  assert(cats.includes("c-aaaa") && cats.includes("c-bbbb"), "both categories");
  assert(out.money.pots.some(x => x.id === "p-aaaa"), "pot");
  assert(out.money.rules.some(x => x.id === "r-bbbb"), "rule");
  eq(K.money.normalise(out.money).categories.length, out.money.categories.length, "the merged document passes the gate");
});

step("no errors", () => {
  eq(app.errors, [], "window errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("FAIL  " + name + "\n      " + e.message); }
  }
  console.log(failed ? "\n" + failed + " step(s) failed" : "\nsmoke84: all " + steps.length + " steps passed");
  process.exit(failed ? 1 : 0);
})();
