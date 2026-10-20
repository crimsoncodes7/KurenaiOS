/* Kurenai OS — smoke87.test.js
   Money and Goals, the pages (roadmap 5.4, design 27a–27s).

   The claims:

     A · MONEY'S SIX VIEWS render under their own routes (`#/money/<view>`,
         Overview bare), each draws its own hook and none writes the state
         document by being drawn (invariant 56 / smoke56's rule).
     B · HIDE AMOUNTS is per device (`state.ui.moneyHidden`): every amount
         on the page masks and is read aloud as "amount hidden"; showing
         them again restores the figures.
     C · THE WISHLIST hands a purchase to Money (27n): its allowance button
         opens Money › Budgets; Mark purchased opens a dialog that says what
         it will do, and confirming it adds exactly one `wl:` Collection
         entry to Money.
     D · THE CALENDAR reads bills and goal ends by derivation (27p): a rule
         due today draws a derived chip; nothing is written as an event;
         the per-device toggle hides it.
     E · GOALS: the page and a goal's page draw without writing; Home's
         Upcoming card switches to Goals (`state.ui.homeUpcoming`).
     F · REPORTS (27o): the Money and Goals cards draw from saved facts,
         Money's figures mask with Hide amounts, and "What Kurenai sees"
         names what never leaves the device.
     G · NOTIFICATIONS: Goals and Money are filters of their own.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke87.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err) : res(out))); }
const tick = (ms) => new Promise(r => setTimeout(r, ms || 0));

let app, K, M, G, doc;
const main = () => doc.getElementById("main");
async function waitFor(test, timeout = 4000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) { const v = test(); if (v) return v; await tick(15); }
  return null;
}
/* the synced state, without the per-device ui and the volatile clock fields */
function stateSnap() {
  const s = JSON.parse(JSON.stringify(K.store.state));
  delete s.ui; delete s._savedAt; delete s.__seq;
  return JSON.stringify(s);
}

step("boot on Tuesday 20 October 2026 with a month of Money", async () => {
  app = await boot({ clock: "2026-10-20T10:00:00" });
  K = app.KOS; M = K.money; G = K.goals; doc = app.document;
  M.setBudget("food", 120);
  M.setBudget("collection", 75);
  const pot = M.addPot({ name: "Laptop", targetAmount: 900, by: "2027-01-31" });
  M.addRule({ name: "Allowance", amount: 120, kind: "in", cat: "allowance", start: "2026-10-01" });
  M.addRule({ name: "Gym", amount: 20, cat: "social", start: "2026-09-20" });
  M.addRule({ name: "Spotify", amount: 11.99, cat: "subscriptions", sub: true, start: "2026-06-02" });
  for (const [date, amount, payee] of [["2026-10-03", 18.4, "Tesco"], ["2026-10-09", 6.2, "Spar"], ["2026-10-14", 23.4, "Tesco"]]) {
    await p(cb => M.addTx({ date, amount, payee, cat: "food", kind: "out" }, cb));
  }
  await p(cb => M.addTx({ date: "2026-10-05", amount: 40, kind: "transfer", pot: pot.id }, cb));
  G.add({ title: "10 hours of study a week", type: "study-hours", target: 10, repeat: "week" });
  G.add({ title: "Save £900 for the laptop", type: "money-pot", target: 900, links: { pot: pot.id }, deadline: "2027-01-31" });
});

/* ---------------- A ---------------- */
step("A · the six views render under their routes, each with its own hook, writing nothing", async () => {
  const want = { overview: "money.overview", transactions: "money.tx-list", budgets: "money.bud-row", recurring: "money.rule-row", pots: "money.pot-hero", month: "money.cmp-row" };
  for (const view of Object.keys(want)) {
    K.show("money", view);
    await waitFor(() => main().querySelector("[data-ui~='" + want[view] + "']"));
    await tick(30);
    const before = stateSnap();
    K.rerender();
    await waitFor(() => main().querySelector("[data-ui~='" + want[view] + "']"));
    await tick(30);
    assert(main().querySelector("[data-ui~='money.page'][data-view='" + view + "']"), view + " did not render its page");
    assert(main().querySelector("[data-ui~='" + want[view] + "']"), view + " lacks " + want[view]);
    assert(stateSnap() === before, view + " wrote the state document by being drawn");
    const hash = app.window.location.hash;
    assert(view === "overview" ? hash === "#/money" : hash === "#/money/" + view, view + " route: " + hash);
  }
});
step("A · Transactions lists the entries; the Overview shows what is left with its evidence", async () => {
  K.show("money", "transactions");
  assert(await waitFor(() => main().querySelectorAll("[data-ui~='money.tx-row']").length >= 4), "transactions did not list the month");
  K.show("money");
  await waitFor(() => main().querySelector("[data-ui~='money.left']"));
  assert(/£/.test(main().querySelector("[data-ui~='money.left']").textContent), "Left to spend shows no amount");
});

/* ---------------- B ---------------- */
step("B · Hide amounts masks every amount on the page, per device", async () => {
  M.setHidden(true);
  K.show("money");
  await waitFor(() => main().querySelector("[data-ui~='money.left']"));
  const amounts = [...main().querySelectorAll("[data-ui~='money.amount']")];
  assert(amounts.length > 5, "too few amounts on the Overview: " + amounts.length);
  assert(amounts.every(a => K.ui.hasState(a, "hidden") && a.getAttribute("aria-label") === "amount hidden"), "an amount escaped Hide amounts");
  assert(K.store.state.ui.moneyHidden === true, "Hide amounts is not per device in state.ui");
  M.setHidden(false);
  K.rerender();
  await waitFor(() => main().querySelector("[data-ui~='money.left']"));
  assert(![...main().querySelectorAll("[data-ui~='money.amount']")].some(a => K.ui.hasState(a, "hidden")), "amounts stayed hidden");
});

/* ---------------- C ---------------- */
step("C · the Wishlist's allowance button opens Money › Budgets", async () => {
  K.show("wishlist");
  const go = await waitFor(() => main().querySelector("[data-ui~='plan.budget-edit']"));
  assert(/Money/.test(go.textContent), "the allowance button does not name Money");
  go.click();
  assert(await waitFor(() => main().querySelector("[data-ui~='money.page'][data-view='budgets']")), "did not open Budgets");
});
step("C · Mark purchased says what it will do, then adds one wl: entry to Money", async () => {
  const it = K.wishlist.add({ module: "game", title: "Smoke Quest", status: "wantToBuy", price: 12.5 });
  K.show("wishlist");
  await tick(40);
  const buy = await waitFor(() => [...main().querySelectorAll("button")].find(b => /Mark purchased|Buy/.test(b.textContent) && b.closest("[data-ui]") && main().contains(b)));
  assert(buy, "no Mark purchased button");
  buy.click();
  const dlg = await waitFor(() => doc.querySelector("[data-ui~='plan.buy-dialog']"));
  assert(dlg, "Mark purchased did not open its dialog");
  assert(/This will/.test(dlg.textContent) && /Money/.test(dlg.textContent), "the dialog does not say what it will do");
  const before = (await new Promise(r => M.list({ from: "2026-10-01", to: "2026-10-31", limit: 200 }, (e, rows) => r(rows || [])))).filter(t => /^wl:/.test(t.syncId)).length;
  dlg.querySelector("[data-ui~='plan.buy-go']").click();
  await tick(80);
  assert(K.wishlist.get(it.id).status === "purchased", "the item did not move to Purchased");
  const after = (await new Promise(r => M.list({ from: "2026-10-01", to: "2026-10-31", limit: 200 }, (e, rows) => r(rows || [])))).filter(t => /^wl:/.test(t.syncId));
  assert(after.length === before + 1, "expected one new wl: entry, got " + (after.length - before));
  assert(after.some(t => t.minor === 1250 && t.cat === "collection"), "the entry is not £12.50 in Collection");
});

/* ---------------- D ---------------- */
step("D · the Calendar draws a bill by derivation and writes no event; the toggle hides it", async () => {
  const events = JSON.stringify(K.store.state.calendar && K.store.state.calendar.events);
  K.show("calendar");
  await tick(40);
  assert(await waitFor(() => main().querySelector("[data-ui~='cal.derived']")), "no derived chip for today's bill");
  assert(JSON.stringify(K.store.state.calendar && K.store.state.calendar.events) === events, "a derived item was written as an event");
  const toggle = [...main().querySelectorAll("[data-ui~='cal.derived-toggle']")][0];
  assert(toggle, "the derived toggles are missing");
  toggle.checked = false;
  toggle.dispatchEvent(new app.window.Event("change"));
  await tick(40);
  assert(K.store.state.ui.calDerived && K.store.state.ui.calDerived.money === false, "the toggle is not per device");
  assert(![...main().querySelectorAll("[data-ui~='cal.derived'][data-kind='money']")].length, "Money chips still drawn after hiding them");
  K.store.state.ui.calDerived.money = true;
});

/* ---------------- E ---------------- */
step("E · Goals and a goal's page draw without writing", async () => {
  K.show("goals");
  await waitFor(() => main().querySelector("[data-ui~='goal.hero'], [data-ui~='goal.card']"));
  await tick(40);
  let before = stateSnap();
  K.rerender();
  await waitFor(() => main().querySelector("[data-ui~='goal.hero'], [data-ui~='goal.card']"));
  await tick(40);
  assert(stateSnap() === before, "Goals wrote the state document by being drawn");
  const g = G.all()[0];
  K.show("goals", { id: g.id });
  await waitFor(() => main().querySelector("[data-ui~='goal.detail']"));
  await tick(40);
  before = stateSnap();
  K.rerender();
  await waitFor(() => main().querySelector("[data-ui~='goal.detail']"));
  await tick(40);
  assert(stateSnap() === before, "a goal's page wrote the state document by being drawn");
  assert(app.window.location.hash === "#/goals/" + g.id, "goal route: " + app.window.location.hash);
});
step("E · Home's Upcoming card switches to Goals, per device", async () => {
  K.store.state.ui.homeUpcoming = "goals";
  K.show("home");
  assert(await waitFor(() => main().querySelector("[data-ui~='home.goals'] [data-ui~='home.goal-row']")), "Home's Goals list is missing");
  K.store.state.ui.homeUpcoming = "upcoming";
});

/* ---------------- F ---------------- */
step("F · Reports' Money and Goals cards draw from saved facts and mask with Hide amounts", () => {
  const rep = { period: "month", start: "2026-10-01", end: "2026-10-31", facts: {
    money: { outgoings: 4800, income: 12000, toPots: 4000, top: [{ cat: "food", name: "Food", spent: 4800 }], subs: 1199 },
    goals: { periodsMet: 2, rows: [{ id: 1, title: "10 hours of study a week", state: "met", repeat: "week", met: 2, of: 2 }] } } };
  const RK = K.reportsKit;
  const money = RK.moneyCard(rep), goals = RK.goalsCard(rep), sees = RK.kurenaiSees(rep);
  assert(money && /Food/.test(money.textContent) && /£48\.00/.test(money.textContent), "the Money card lost its figures");
  assert(goals && goals.querySelector("[data-ui~='reports.goal-row'] [data-ui~='goal.pace']"), "the Goals card lost its rows");
  assert(/Never payees, notes, tags or the titles you bought/.test(sees.textContent), "What Kurenai sees does not say what stays");
  M.setHidden(true);
  const masked = RK.moneyCard(rep);
  assert([...masked.querySelectorAll("[data-ui~='money.amount']")].every(a => K.ui.hasState(a, "hidden")), "a report amount escaped Hide amounts");
  assert(!/£11\.99/.test(masked.textContent), "the subscriptions total printed while hidden");
  M.setHidden(false);
  assert(RK.moneyCard({ facts: {} }) === null && RK.goalsCard({ facts: {} }) === null, "an empty fact drew a card");
});

/* ---------------- G ---------------- */
step("G · Goals and Money are notification filters of their own", async () => {
  K.notify.push({ id: "goal:1:soon", kind: "goal", title: "A week ends tomorrow" });
  K.notify.push({ id: "money:gym:due", kind: "money", title: "Gym due today" });
  K.notify.push({ id: "reports:week:x", kind: "reports", title: "Your week in review is ready" });
  for (const [filter, want] of [["goal", /week ends tomorrow/], ["money", /Gym due/]]) {
    K.show("notifications", filter);
    const rows = await waitFor(() => { const r = main().querySelectorAll("[data-ui~='notify.list'] [data-ui~='notify.row']"); return r.length ? r : null; });
    assert(rows && rows.length === 1 && want.test(rows[0].textContent), filter + " filter shows the wrong rows");
  }
});

step("no page error was thrown", () => {
  assert(!app.errors.length, "errors: " + app.errors.slice(0, 3).join(" | "));
});

/* ============ runner ============ */
(async () => {
  const errors = [];
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  if (errors.length) { console.log("\nSMOKE87 FAILURES (" + errors.length + "):\n  - " + errors.join("\n  - ")); process.exit(1); }
  console.log("\nSMOKE87 PASS — Money and Goals pages verified (" + steps.length + " steps).");
  process.exit(0);
})();
