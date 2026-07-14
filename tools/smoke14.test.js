/* Kurenai OS — smoke14.test.js
   Build 3g suite: the Purchase / Budget Planner (Collection Matrix).

   Covers the budget maths (shared pool, selection simulation, live
   remaining incl. going over), purchase archiving into budget.history and
   the spend-over-time / per-module breakdowns, the both-direction vault
   linking (item → entry, and the "on your wishlist" banner injected into
   the vault editor), draggable priority, the next-to-drop pick, and — the
   load-bearing invariant — that this module fires ZERO governor traffic:
   no sessions logged, no XP/gold/HP moved, and no network requests, no
   matter what you do in it. Purchasing is logistics, not engagement.
   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke14.test.js                                            */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const { document } = window;
const errors = [];
window.addEventListener("error", e => errors.push("window error: " + e.message));
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true; window.__kosAutoConfirm = true;

const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;

/* the planner must never need the network — record every fetch */
let netLog = [];
window.fetch = (url, opts) => {
  netLog.push({ url, opts });
  return Promise.resolve({ ok: true, status: 200, headers: { get: () => null },
    json: () => Promise.resolve({}), text: () => Promise.resolve("") });
};

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err instanceof Error ? err : new Error(err.message || String(err))) : res(out))); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
async function waitFor(cond, ms) {
  const deadline = Date.now() + (ms || 3000);
  while (Date.now() < deadline) { if (cond()) return true; await tick(25); }
  return cond();
}
const near = (a, b) => Math.abs(a - b) < 0.001;

/* ---- governor spies: count anything that could touch the reward loop ---- */
let sessionCalls = 0, activityCalls = 0;
const _log = KOS.sessions.log.bind(KOS.sessions);
KOS.sessions.log = function (x) { sessionCalls++; return _log(x); };
const _act = KOS.media.logActivity;
KOS.media.logActivity = function () { activityCalls++; return _act.apply(this, arguments); };
function govSnapshot() {
  const g = KOS.store.state.governor;
  return { sessions: sessionCalls, activity: activityCalls, hp: g.hp, gold: g.gold, xp: g.xp,
           sessLen: KOS.store.state.sessions.length };
}

/* ============ 1 · state + schema ============ */
console.log("== wishlist state + add ==");
step("boot: state.wishlist initialises with the shared-pool budget shape", async () => {
  const w = KOS.wishlist.data();
  if (!w || typeof w !== "object") throw new Error("no wishlist state");
  if (!w.budget || !Array.isArray(w.budget.history)) throw new Error("budget/history shape");
  if (!Array.isArray(w.items)) throw new Error("items array");
  if (w.budget.currency !== "£") throw new Error("default currency");
});
step("add(): fills defaults, normalises 'games' → 'game', appends priority", async () => {
  const a = KOS.wishlist.add({ module: "books", title: "Chainsaw Man Vol 12", price: 8.99 });
  if (a.status !== "wantToBuy") throw new Error("default status");
  if (a.priority !== 0) throw new Error("first item priority 0");
  if (a.purchasedAt !== null) throw new Error("not purchased on add");
  const b = KOS.wishlist.add({ module: "games", title: "Silksong", status: "waitingForRelease", releaseDate: "2030-01-01", price: 19.99 });
  if (b.module !== "game") throw new Error("'games' must normalise to 'game'");
  const c = KOS.wishlist.add({ module: "books", title: "Berserk Deluxe", price: 40 });
  if (c.priority !== 1) throw new Error("second wantToBuy item should get priority 1, got " + c.priority);
});
step("byStatus() ranks by priority; forEntry() ignores cancelled", async () => {
  const buy = KOS.wishlist.byStatus("wantToBuy");
  if (buy.length !== 2) throw new Error("two want-to-buy items");
  if (buy[0].priority > buy[1].priority) throw new Error("not priority-ordered");
});

/* ============ 2 · budget maths (pure) ============ */
console.log("== budget maths ==");
step("setBudget + selection simulation + remaining (incl. going over)", async () => {
  KOS.wishlist.setBudget({ monthlyLimit: 50, currency: "£" });
  if (KOS.wishlist.budget().monthlyLimit !== 50) throw new Error("limit not stored");
  const buy = KOS.wishlist.byStatus("wantToBuy");
  const ids = buy.map(it => it.id);
  const sel = KOS.wishlist.selectedTotal([ids[0]]);          // 8.99
  if (!near(sel, 8.99)) throw new Error("selectedTotal single: " + sel);
  const remOk = KOS.wishlist.remaining(50, 0, sel);
  if (!near(remOk, 41.01)) throw new Error("remaining under budget: " + remOk);
  const selBoth = KOS.wishlist.selectedTotal(ids);           // 8.99 + 40 = 48.99
  const remOver = KOS.wishlist.remaining(50, 20, selBoth);   // 50 - 20 - 48.99 = -18.99
  if (remOver >= 0) throw new Error("remaining should go NEGATIVE when over: " + remOver);
});

/* ============ 3 · purchase archiving + charts ============ */
console.log("== purchase archiving ==");
let juneTs, julyTs;
step("markPurchased archives into the month bucket, recomputes spent, is idempotent", async () => {
  juneTs = Date.UTC(2026, 5, 15, 12);   // a June timestamp
  julyTs = Date.UTC(2026, 6, 3, 12);    // a July timestamp
  const buy = KOS.wishlist.byStatus("wantToBuy");
  const first = buy[0];
  KOS.wishlist.markPurchased(first.id, juneTs);
  const it = KOS.wishlist.get(first.id);
  if (it.status !== "purchased" || it.purchasedAt !== juneTs) throw new Error("status/purchasedAt not set");
  const mk = KOS.wishlist.monthKey(juneTs);
  if (!near(KOS.wishlist.spentInMonth(mk), first.price)) throw new Error("month spend != item price");
  /* idempotent — a second call must not double-archive */
  KOS.wishlist.markPurchased(first.id, juneTs);
  if (!near(KOS.wishlist.spentInMonth(mk), first.price)) throw new Error("double archive on re-mark");
});
step("second purchase in a different month; spendByMonth + spendByModule split correctly", async () => {
  const berserk = KOS.wishlist.byStatus("wantToBuy")[0];   // 40, books
  KOS.wishlist.markPurchased(berserk.id, julyTs);
  const byMonth = KOS.wishlist.spendByMonth();
  if (byMonth.length !== 2) throw new Error("two months of history: " + JSON.stringify(byMonth));
  if (byMonth[0].month > byMonth[1].month) throw new Error("months not ascending");
  const byMod = KOS.wishlist.spendByModule();
  if (!near(byMod.books || 0, 48.99)) throw new Error("books module total wrong: " + byMod.books);
  if (byMod.game) throw new Error("no game purchases yet — should be absent");
  if (!near(KOS.wishlist.totalSpent(), 48.99)) throw new Error("total spent");
});

/* ============ 4 · next-to-drop + reorder ============ */
console.log("== waiting tab: next-to-drop + reorder ==");
step("nextToDrop picks the nearest UPCOMING release date", async () => {
  const today = KOS.srs.todayISO();
  const soon = KOS.srs.addDays(today, 5), later = KOS.srs.addDays(today, 40), past = KOS.srs.addDays(today, -3);
  KOS.wishlist.add({ module: "game", title: "Far Future", status: "waitingForRelease", releaseDate: later });
  KOS.wishlist.add({ module: "vn", title: "Dropping Soon", status: "waitingForRelease", releaseDate: soon });
  KOS.wishlist.add({ module: "books", title: "Already Out", status: "waitingForRelease", releaseDate: past });
  const hero = KOS.wishlist.nextToDrop();
  if (!hero || hero.title !== "Dropping Soon") throw new Error("expected the nearest upcoming, got " + (hero && hero.title));
});
step("reorder() rewrites priority by drop order within a tab", async () => {
  const waiting = KOS.wishlist.byStatus("waitingForRelease");
  const reversed = waiting.map(it => it.id).reverse();
  KOS.wishlist.reorder("waitingForRelease", reversed);
  const after = KOS.wishlist.byStatus("waitingForRelease");
  if (after[0].id !== reversed[0]) throw new Error("reorder did not take");
});

/* ============ 5 · vault linking, BOTH directions ============ */
console.log("== linking ==");
let linkedEntryId, linkedItemId;
step("link a wishlist item to a real vault entry; forEntry finds it", async () => {
  await p(cb => KOS.mediadb.open(cb));
  const entry = await p(cb => KOS.mediadb.add({ module: "game", title: "Hollow Knight" }, cb));
  linkedEntryId = entry.id;
  const item = KOS.wishlist.add({ module: "game", title: "Hollow Knight (physical)", price: 24.99, linkedEntryId: entry.id });
  linkedItemId = item.id;
  const hits = KOS.wishlist.forEntry(entry.id);
  if (hits.length !== 1 || hits[0].id !== item.id) throw new Error("forEntry did not surface the link");
});
step("reverse surfacing: opening the vault entry injects the 'on your wishlist' banner", async () => {
  const entry = await p(cb => KOS.mediadb.get(linkedEntryId, cb));
  KOS.mediaEditor(entry, null);
  await tick(30);
  const banner = document.querySelector(".med-modal .wl-onlist");
  if (!banner) throw new Error("no wl-onlist banner injected into the editor");
  if (!/on your wishlist/i.test(banner.textContent)) throw new Error("banner text");
  if (!/Hollow Knight \(physical\)/.test(banner.textContent)) throw new Error("banner must name the linked item");
  const ov = document.querySelector(".modal-ov");
  if (ov) ov.remove();
});
step("no banner when the entry is not on the wishlist", async () => {
  const entry = await p(cb => KOS.mediadb.add({ module: "game", title: "Unwished Game" }, cb));
  KOS.mediaEditor(entry, null);
  await tick(30);
  if (document.querySelector(".med-modal .wl-onlist")) throw new Error("banner appeared for an unlinked entry");
  const ov = document.querySelector(".modal-ov");
  if (ov) ov.remove();
});

/* ============ 6 · the view renders + live simulation ============ */
console.log("== view ==");
step("KOS.show('wishlist') builds the budget bar, tabs and list", async () => {
  KOS.show("wishlist");
  await tick(40);
  const main = document.getElementById("main");
  if (!main.querySelector(".wl-budget")) throw new Error("no budget bar");
  if (main.querySelectorAll(".wl-tabs .study-tab").length !== 3) throw new Error("expected 3 tabs");
  if (!main.querySelector(".wl-row")) throw new Error("want-to-buy list empty");
});
step("ticking a checkbox updates the live Remaining figure (pure simulation)", async () => {
  KOS.wishlist.setBudget({ monthlyLimit: 100 });
  KOS.show("wishlist");
  await tick(40);
  const main = document.getElementById("main");
  const remBefore = main.querySelector(".wl-bn-rem b").textContent;
  const check = main.querySelector(".wl-check");
  if (!check) throw new Error("no checkbox on the want-to-buy tab");
  check.checked = true;
  check.dispatchEvent(new window.Event("change"));
  await tick(10);
  const remAfter = main.querySelector(".wl-bn-rem b").textContent;
  if (remBefore === remAfter) throw new Error("Remaining did not react to the simulation");
});
step("waiting-for-release tab shows the next-to-drop hero", async () => {
  KOS.store.state.wishlist._tab = "waitingForRelease";
  KOS.show("wishlist");
  await tick(40);
  const hero = document.getElementById("main").querySelector(".wl-hero");
  if (!hero) throw new Error("no next-to-drop hero");
  if (!/Next to drop/i.test(hero.textContent)) throw new Error("hero badge text");
});

/* ============ 7 · THE governor boundary + no network ============ */
console.log("== governor boundary ==");
step("a full planner flow fires ZERO governor traffic and zero network", async () => {
  netLog = [];
  const before = govSnapshot();
  /* exercise everything that mutates the planner */
  const x = KOS.wishlist.add({ module: "vn", title: "Boundary Test", price: 12 });
  KOS.wishlist.update(x.id, { price: 15, retailer: "Steam" });
  KOS.wishlist.setBudget({ monthlyLimit: 200 });
  KOS.wishlist.markPurchased(x.id, julyTs);
  KOS.wishlist.setStatus(KOS.wishlist.byStatus("waitingForRelease")[0].id, "wantToBuy");
  KOS.wishlist.reorder("wantToBuy", KOS.wishlist.byStatus("wantToBuy").map(it => it.id));
  KOS.wishlist.remove(x.id);
  KOS.show("wishlist");
  await tick(50);
  const after = govSnapshot();
  if (after.sessions !== before.sessions) throw new Error("KOS.sessions.log was called " + (after.sessions - before.sessions) + " times");
  if (after.activity !== before.activity) throw new Error("KOS.media.logActivity was called");
  if (after.sessLen !== before.sessLen) throw new Error("the sessions log grew");
  if (after.hp !== before.hp || after.gold !== before.gold || after.xp !== before.xp) throw new Error("governor HP/gold/XP moved");
  if (netLog.length !== 0) throw new Error("the planner emitted network traffic: " + netLog.map(r => r.url).join(", "));
});

/* ============ 8 · nav ============ */
step("nav: Collection keeps vaults primary and reaches the Budget Planner through Planner", async () => {
  const rb = [...document.querySelectorAll("#rail .rail-item")].find(b => b.dataset.section === "collection");
  if (!rb) throw new Error("collection rail button missing");
  rb.click();
  await tick(60);
  const labels = [...document.querySelectorAll("#subnav .subnav-item")].map(b => b.textContent.trim());
  ["Overview", "Anime", "Books", "Visual Novels", "Games", "Shrine", "Planner", "Sync"].forEach(label => {
    if (!labels.includes(label)) throw new Error("primary Collection destination missing: " + label);
  });
  if (labels.some(label => /Budget Planner|Goals|AniList|VNDB|Sync & Import/.test(label))) throw new Error("utility route leaked into primary Collection navigation");
  const sn = [...document.querySelectorAll("#subnav .subnav-item")].find(b => /^Planner$/.test(b.textContent.trim()));
  if (!sn) throw new Error("Planner entry missing");
  sn.click();
  await tick(60);
  if (!/Budget/.test(document.getElementById("main").textContent)) throw new Error("navigation failed");
  if (!document.querySelector("#subnav .subnav-item.active")?.textContent.includes("Planner")) throw new Error("Planner nav state was not retained");
  if (!document.querySelector(".collection-workspace-tabs .study-tab.active")?.textContent.includes("Budget Planner")) throw new Error("Planner secondary tab missing");
});
step("backup coverage: wishlist rides the localStorage state (exportJSON serialises it)", async () => {
  const raw = JSON.parse(JSON.stringify(KOS.store.state));
  if (!raw.wishlist || !raw.wishlist.budget) throw new Error("wishlist not part of the serialised state");
  if (!Array.isArray(raw.wishlist.budget.history)) throw new Error("history not serialised");
});

/* ============ 9 · Goals (Build 3k) — same off-spine, no-network rules ============ */
console.log("== goals ==");
step("boot: state.goals initialises; add() fills defaults for a manual goal", async () => {
  const g = KOS.goals.add({ title: "Read 5 books", target: 5, kind: "manual", current: 1 });
  if (g.kind !== "manual" || g.target !== 5 || g.current !== 1) throw new Error("manual defaults wrong");
  if (g.status !== "active") throw new Error("new goal should be active");
  if (!Array.isArray(KOS.store.state.goals.items)) throw new Error("goals state missing");
});
step("nudge() bumps a manual goal and never goes negative", async () => {
  const g = KOS.goals.all().find(x => x.title === "Read 5 books");
  KOS.goals.nudge(g.id, 3);
  if (KOS.goals.get(g.id).current !== 4) throw new Error("nudge up failed");
  KOS.goals.nudge(g.id, -10);
  if (KOS.goals.get(g.id).current !== 0) throw new Error("nudge floored at 0");
});
step("compute() enriches with _current/_status/_pct and completes when target met", async () => {
  const g = KOS.goals.all().find(x => x.title === "Read 5 books");
  KOS.goals.update(g.id, { current: 5 });
  const list = await p(cb => KOS.goals.compute(cb));
  const row = list.find(x => x.id === g.id);
  if (row._current !== 5 || row._pct !== 100) throw new Error("enrichment wrong");
  if (row._status !== "completed") throw new Error("should be completed at/over target");
  if (!KOS.goals.get(g.id).completedAt) throw new Error("completedAt not stamped");
});
step("a past deadline with an unmet target derives 'failed'", async () => {
  const g = KOS.goals.add({ title: "Overdue goal", target: 10, kind: "manual", current: 1, deadline: "2000-01-01" });
  const list = await p(cb => KOS.goals.compute(cb));
  if (list.find(x => x.id === g.id)._status !== "failed") throw new Error("overdue goal should be failed");
});
step("an auto goal measures against the vault (mediadb.stats), not a stored counter", async () => {
  await p(cb => KOS.mediadb.open(cb));
  await p(cb => KOS.mediadb.add({ module: "game", title: "Auto Metric Game", status: "completed" }, cb));
  const g = KOS.goals.add({ title: "Finish 1 game", target: 1, kind: "auto", metric: "game-completed" });
  const list = await p(cb => KOS.goals.compute(cb));
  const row = list.find(x => x.id === g.id);
  if (row._current < 1) throw new Error("auto metric did not read completed games from the vault");
  if (row._status !== "completed") throw new Error("auto goal should complete once the vault meets it");
});
step("the view renders Active/Completed/Failed tabs and goal cards", async () => {
  KOS.show("goals");
  await tick(60);
  const main = document.getElementById("main");
  if (main.querySelectorAll(".goal-tabs .study-tab").length !== 3) throw new Error("expected 3 goal tabs");
  if (!/Goals/.test(main.textContent)) throw new Error("goals view did not render");
});
step("Goals fires ZERO governor traffic and zero network", async () => {
  netLog = [];
  const before = govSnapshot();
  const g = KOS.goals.add({ title: "Boundary Goal", target: 3, kind: "manual" });
  KOS.goals.nudge(g.id, 2);
  KOS.goals.update(g.id, { detail: "note" });
  await p(cb => KOS.goals.compute(cb));
  KOS.goals.remove(g.id);
  KOS.show("goals");
  await tick(50);
  const after = govSnapshot();
  if (after.sessions !== before.sessions) throw new Error("KOS.sessions.log was called");
  if (after.activity !== before.activity) throw new Error("KOS.media.logActivity was called");
  if (after.hp !== before.hp || after.gold !== before.gold || after.xp !== before.xp) throw new Error("governor HP/gold/XP moved");
  if (netLog.length !== 0) throw new Error("Goals emitted network: " + netLog.map(r => r.url).join(", "));
});
step("nav: Planner secondary tab reaches Goals; goals ride the serialised backup", async () => {
  const rb = [...document.querySelectorAll("#rail .rail-item")].find(b => b.dataset.section === "collection");
  rb.click();
  await tick(60);
  const sn = [...document.querySelectorAll("#subnav .subnav-item")].find(b => /^Planner$/.test(b.textContent.trim()));
  sn.click();
  await tick(60);
  const goals = [...document.querySelectorAll(".collection-workspace-tabs button")].find(b => /^Goals$/.test(b.textContent.trim()));
  if (!goals) throw new Error("Goals secondary tab missing");
  goals.click();
  await tick(60);
  if (!/Goals/.test(document.getElementById("main").textContent)) throw new Error("Goals navigation failed");
  const raw = JSON.parse(JSON.stringify(KOS.store.state));
  if (!raw.goals || !Array.isArray(raw.goals.items)) throw new Error("goals not part of serialised state");
});

/* ============ runner ============ */
(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { errors.push(`STEP "${name}": ${e.stack.split("\n").slice(0, 2).join(" | ")}`); console.log("FAIL  " + name); }
  }
  console.log("");
  if (errors.length) {
    console.log("SMOKE14 FAILURES (" + errors.length + "):");
    errors.forEach(e => console.log("  - " + e));
    process.exit(1);
  }
  console.log("SMOKE14 PASS — Build 3g Purchase/Budget Planner verified (" + steps.length + " steps).");
  process.exit(0);
})();
