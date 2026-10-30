/* Kurenai OS — smoke113.test.js
   Achievements, the Badge Wall (roadmap 5.16–5.17, docs/achievements-plan.md;
   invariants 161–163).

   The claims:

     A · THE CATALOGUE: every badge has a set, a name, what counts, owners and
         ascending tiers; the 153 unit badges point at art that exists and is
         listed; every title names a real badge and tier (Scholar at IV,
         Timekeeper at II, Treasurer at IV, Architect at III); the plan's
         blocked badges are NOT registered.
     B · THE MATHS: a tier is the thresholds met in order; progress is
         (current − previous) / (next − previous), the same fraction the rim
         draws; a fully earned badge reads 1 whatever its evidence says now
         (new content never dims it); an unearned hidden badge reads 0.
     C · EVALUATION: the first sweep on a device is SILENT (earned, no ping);
         a new Focus session then earns In the zone through the ledger's
         owner event, and only the ledger's badges are re-measured.
     D · EARNED ONLY GOES UP: deleting the evidence takes no tier back; a
         grown "all" target never dims an earned badge.
     E · THE ROLLUP: past the ledger's 2,000-entry cap a lifetime count does
         not fall (months before this one are folded in, max per field).
     F · THE MERGE: earned tiers merge up (tier max, times earliest), and a
         month of the rollup by max — never back down.
     G · PINGS: every step for a target of 20 or fewer; quarter steps of the
         CURRENT tier interval above it; off is off; one per badge per 10 s.
     H · QUIET: no overlay while Focus runs or a dialog is open (it waits);
         no ping then either. A hidden badge never pings.
     I · THE PAGE READS ONLY: drawing the Wall, a set and the list writes
         nothing; hidden badges are masked and listed last, also when
         sorted by nearest to done.
     J · REPORTS: a term's facts carry the tiers earned in it and keep the
         "badges" story; the share card's showcase is off by default.
     K · ZERO GOVERNOR TRAFFIC: an evaluation that earns tiers moves no XP,
         gold or HP and logs no session.
     L · THE NOTIFICATION: a tier earned is ONE `achievement` item, id
         ach:<badge>:<tier>.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke113.test.js                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");
const { seedAccount } = require("./lib/seed");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const ROOT = path.join(__dirname, "..");

let app, K, A;
async function idle() {
  for (let i = 0; i < 600 && A._inflight().running; i++) await app.settle();
  await app.settle();
}
async function evaluate(domains) {
  await idle();
  let r;
  A.evaluate(domains, (x) => { r = x; });
  for (let i = 0; i < 600 && r === undefined; i++) await app.settle();
  return r;
}
async function views(opts) {
  let v;
  A.list((x) => { v = x; }, opts);
  for (let i = 0; i < 600 && !v; i++) await app.settle();
  return v;
}
function stateNoUi() { const s = JSON.parse(JSON.stringify(K.store.state)); delete s.ui; return JSON.stringify(s); }
function focus(mins, extra) {
  return K.sessions.log({ type: "focus", subject: "compsci", ref: "4.1.1.1", dur: mins * 60,
    metrics: Object.assign({ complete: true, secs: mins * 60, pauses: 0, mode: "custom", rule: "blocks" }, extra || {}) });
}

step("boot", async () => {
  app = await boot();
  await app.settle();
  K = app.KOS; A = K.achievements;
  assert(A && K.achUI, "the engine and the page load");
  A._started(true);
});

step("A · the catalogue", async () => {
  const defs = A.defs(), sets = A.sets();
  assert(defs.length >= 240, "the catalogue holds the unit sets and the wider badges: " + defs.length);
  assert(sets.length >= 20, "sets: " + sets.length);
  const setIds = {}; sets.forEach((s) => { setIds[s.id] = true; assert(s.hue && /^--/.test(s.hue) && s.glyph && s.name, "a set has a hue token, a glyph and a name: " + s.id); });
  defs.forEach((d) => {
    assert(setIds[d.set], "a badge's set exists: " + d.id);
    assert(d.name && d.what, "a badge says what counts: " + d.id);
    assert(Array.isArray(d.owners), "a badge names its owners: " + d.id);
    assert(d.tiers.length >= 1 && d.tiers.length <= 4, "one to four tiers: " + d.id);
    const nums = d.tiers.filter((t) => t !== "all");
    for (let i = 1; i < nums.length; i++) assert(nums[i] > nums[i - 1], "tiers ascend: " + d.id);
    if (d.tiers.indexOf("all") >= 0) { assert(d.tiers[d.tiers.length - 1] === "all", "'all' is the last tier: " + d.id); assert(typeof d.total === "function", "an 'all' tier has a total: " + d.id); }
    assert(!!d.measure !== !!d.v || d.soon, "a badge measures one way: " + d.id);
  });
  const ART = new Set(app.window.KOS_ACH_ART || []);
  const unitDefs = defs.filter((d) => /^app\.badge\./.test(d.art || ""));
  assert(unitDefs.length === 153, "the 153 unit badges carry art ids: " + unitDefs.length);
  unitDefs.forEach((d) => {
    assert(ART.has(d.art), "listed: " + d.art);
    assert(fs.existsSync(path.join(ROOT, "assets/app/img", d.art + ".webp")), "the picture exists: " + d.art);
  });
  const manifest = JSON.parse(fs.readFileSync(path.join(ROOT, "art-source/app/manifest.json"), "utf8"));
  const badgeArt = manifest.assets.filter((a) => a.id.startsWith("app.badge."));
  assert(badgeArt.every((a) => a.solid), "every badge in the manifest is keyed as a solid disc");
  const used = new Set(unitDefs.map((d) => d.art));
  badgeArt.forEach((a) => assert(used.has(a.id), "every badge made is on the Wall: " + a.id));
  /* every other badge and every set has its art brief waiting in the manifest (batches 26–27) */
  const briefs = new Set(manifest.assets.map((a) => a.id));
  defs.filter((d) => !/^app\.badge\./.test(d.art || "") && d.id !== "t-all").forEach((d) => assert(briefs.has("app.ach." + d.id), "an art brief for " + d.id));
  sets.forEach((s) => assert(briefs.has("app.ach.pano." + s.id), "a panorama brief for " + s.id));
  manifest.assets.filter((a) => /^app\.ach\./.test(a.id)).forEach((a) => {
    assert(/No text anywhere/.test(a.prompt), "a brief forbids text: " + a.id);
    if (a.kind === "spot") assert(a.solid && a.long === 384 && /#00FF00/.test(a.prompt), "a badge brief is a keyed solid disc: " + a.id);
  });
  const titles = A.titles();
  const want = { scholar: ["into-the-green", 4], timekeeper: ["ahead-of-time", 2], treasurer: ["under-budget", 4], architect: ["shipped", 3] };
  Object.keys(want).forEach((id) => {
    const t = titles.find((x) => x.id === id);
    assert(t && t.badge === want[id][0] && t.tier === want[id][1], "title " + id + " at " + want[id][0] + " " + want[id][1]);
  });
  titles.forEach((t) => { const d = A.def(t.badge); assert(d && t.tier <= d.tiers.length, "a title names a reachable tier: " + t.id); });
  ["every-room", "two-devices", "back-on-your-feet", "every-scene", "pushed", "dialogues", "scanned", "dress-up"].forEach((id) =>
    assert(!A.def(id), "a blocked badge is not registered: " + id));
  ["companion-complete", "tuned-to-you", "know-thyself", "bug-catcher", "daily-20", "voice", "sentence-miner", "in-step", "backlog-clearer", "write-it-out", "clipper"]
    .forEach((id) => assert(A.def(id), "the asked-for badge is registered: " + id));
});

step("B · tiers and interval-relative progress", async () => {
  const d = { id: "t", tiers: [10, 50, 100], hidden: false };
  eq([0, 9, 10, 49, 50, 100, 400].map((v) => A.tierOf(d.tiers, v)), [0, 0, 1, 1, 2, 3, 3], "tiers met in order");
  eq(A.tierOf([10, null, 100], 500), 1, "an unresolved 'all' stops the count");
  eq(A.progressOf(d, d.tiers, 5, 0), 0.5, "tier I: 5 of 10");
  eq(A.progressOf(d, d.tiers, 30, 1), 0.5, "tier II: (30 − 10) / (50 − 10)");
  eq(A.progressOf(d, d.tiers, 75, 2), 0.5, "tier III: (75 − 50) / (100 − 50)");
  eq(A.progressOf(d, d.tiers, 0, 3), 1, "fully earned is 1 whatever the evidence");
  eq(A.progressOf({ hidden: true }, [5], 4, 0), 0, "an unearned hidden badge is 0");
});

step("C · the first sweep is silent; an owner event re-measures only its badges", async () => {
  await seedAccount(app);
  const first = await evaluate(null);
  assert(first && first.silent, "a device's first sweep is silent");
  assert(first.pings.length === 0, "and pings nothing");
  assert(K.store.state.ui.achInit, "the device remembers its first sweep");
  assert(first.earned.length > 0, "the seeded history earns tiers at once");
  /* past the silent window */
  K.store.state.ui.achInit = Date.now() - 10 * 60 * 1000;
  const before = (A.peek().earned["in-the-zone"] || {}).tier || 0;
  const life = A.lifetime().focus;
  const need = [10, 100, 500, 1000][before] - life;
  for (let i = 0; i < need; i++) focus(25);
  await idle();
  const after = A.peek().earned["in-the-zone"];
  assert(after && after.tier === before + 1, "the owner event earned In the zone's next tier: " + JSON.stringify(after));
  /* only the domains asked for are measured */
  const seen = [];
  const wrap = A.defs().map((d) => { const m = d.measure, v = d.v; d.measure = (ctx, cb) => { seen.push(d.id); if (m) m(ctx, cb); else cb(v(ctx)); }; delete d.v; return [d, m, v]; });
  await evaluate(["code"]);
  wrap.forEach(([d, m, v]) => { if (m) d.measure = m; else { delete d.measure; d.v = v; } });
  assert(seen.length > 0, "the code badges were measured");
  seen.forEach((id) => assert(A.def(id).owners.indexOf("code") >= 0, "only a badge that reads Code was measured: " + id));
  assert(seen.indexOf("in-the-zone") === -1 && seen.indexOf("binge") === -1, "Focus and the vault were not read");
});

step("D · an earned tier is never taken back", async () => {
  const had = A.peek().earned["in-the-zone"].tier;
  const keep = K.store.state.sessions.slice();
  K.store.state.sessions = [];
  A._resetCache();
  K.store.state.achievements.months = {};
  await evaluate(null);
  eq(A.peek().earned["in-the-zone"].tier, had, "the tier stays after the evidence is gone");
  K.store.state.sessions = keep;
  A._resetCache();
  /* a grown "all" target never dims a badge earned in full */
  A.register({ id: "t-all", set: "study", name: "T", what: "t", owners: ["x"], tiers: ["all"], v: () => 3, total: () => K.__total });
  K.__total = 3;
  await evaluate(["x"]);
  eq(A.peek().earned["t-all"].tier, 1, "earned at 3 of 3");
  K.__total = 9;
  const v = (await views({ ids: ["t-all"] }))[0];
  assert(v.full && v.p === 1 && v.state === "earned", "new content (3 of 9 now) does not dim it: " + JSON.stringify({ p: v.p, s: v.state }));
});

step("E · the rollup: past the cap a lifetime count does not fall", async () => {
  const L = K.store.state.sessions;
  /* last month's focus sessions, then enough entries to push them off */
  const d = new app.window.Date(); d.setDate(1); d.setMonth(d.getMonth() - 1);
  const day = d.toISOString().slice(0, 10);
  let id = 900000;
  for (let i = 0; i < 40; i++) L.push({ id: id++, ts: d.getTime() + i, date: day, type: "focus", metrics: { complete: true, secs: 600 } });
  L.sort((a, b) => a.ts - b.ts);
  A._resetCache();
  await evaluate(null);
  const before = A.lifetime().focus;
  for (let i = 0; i < 2100; i++) K.sessions.log({ type: "todo", metrics: { item: "tick " + i } });
  assert(K.store.state.sessions.length <= 2000, "the ledger keeps its cap");
  assert(!K.store.state.sessions.some((e) => e.date === day && e.type === "focus"), "last month's sessions fell off the ledger");
  A._resetCache();
  assert(A.lifetime().focus >= before, "the lifetime count held: " + A.lifetime().focus + " ≥ " + before);
});

step("F · the merge only goes up", async () => {
  const M = K.cloudmerge;
  const base = { achievements: { v: 1, earned: { a: { tier: 1, at: 100, t: { 1: 100 } } }, months: { "2026-08": { focus: 4 } } } };
  const local = { achievements: { v: 1, earned: { a: { tier: 2, at: 100, t: { 1: 100, 2: 300 } } }, months: { "2026-08": { focus: 3 } } } };
  const remote = { achievements: { v: 1, earned: { a: { tier: 3, at: 90, t: { 1: 90, 2: 200, 3: 400 } } }, months: { "2026-08": { focus: 6 } } } };
  const out = M.merge(base, local, remote).doc.achievements;
  eq(out.earned.a.tier, 3, "tier: the higher");
  eq(out.earned.a.at, 90, "first earned: the earlier");
  eq(out.earned.a.t, { 1: 90, 2: 200, 3: 400 }, "each tier's time: the earlier");
  eq(out.months["2026-08"].focus, 6, "a month's count: the larger");
  const down = M.merge(base, { achievements: { v: 1, earned: { a: { tier: 1, at: 100, t: { 1: 100 } } }, months: {} } },
    { achievements: { v: 1, earned: { a: { tier: 2, at: 100, t: { 1: 100, 2: 300 } } }, months: {} } }).doc.achievements;
  eq(down.earned.a.tier, 2, "a device that never moved cannot take a tier back");
});

step("G · the ping rule", async () => {
  const pg = (prev, next, from, to) => ({ id: "g" + Math.random(), prev, next, from, to, p0: (from - prev) / (next - prev), p: (to - prev) / (next - prev) });
  assert(A.pingRule(pg(0, 10, 7, 8), "auto"), "a target of 10: every step");
  assert(!A.pingRule(pg(0, 100, 10, 12), "auto"), "100: 10 → 12 crosses no quarter");
  assert(A.pingRule(pg(0, 100, 24, 26), "auto"), "100: 24 → 26 crosses a quarter");
  assert(!A.pingRule(pg(100, 500, 120, 190), "auto"), "tier II 100–500: 120 → 190 is 5% → 22.5%, no quarter");
  assert(A.pingRule(pg(100, 500, 190, 210), "auto"), "tier II: 22.5% → 27.5% crosses its first quarter");
  assert(A.pingRule(pg(0, 100, 10, 12), "every"), "every: every step");
  assert(!A.pingRule(pg(0, 10, 7, 8), "off"), "off is off");
  const one = pg(0, 10, 1, 2); one.id = "same";
  K.store.state.ui.achPings = "every";
  assert(A.pingAllowed(one, 1000), "the first ping shows");
  assert(!A.pingAllowed(one, 5000), "a second inside 10 s does not");
  assert(A.pingAllowed(one, 12000), "after 10 s it may");
  delete K.store.state.ui.achPings;
});

step("H · quiet: no overlay or ping over Focus or a dialog; hidden never pings", async () => {
  const st = K.focus.state;
  K.focus.state = () => "running";
  assert(A.quiet(), "a running Focus session is quiet");
  K.achUI.celebrate([{ id: "regular", tier: 1, prevTier: 0 }]);
  for (let i = 0; i < 20; i++) await app.settle();
  assert(!app.document.querySelector("[data-ui~='ach.unlock']"), "no overlay over Focus");
  K.achUI.ping({ id: "regular", from: 1, to: 2, prev: 0, next: 7, p0: 0.1, p: 0.2 });
  assert(!app.document.querySelector("[data-ui~='ach.ping']"), "no ping over Focus");
  K.focus.state = st;
  /* a hidden badge reports no ping, even with its value moving */
  K.store.state.ui.achInit = Date.now() - 10 * 60 * 1000;
  K.store.state.ui.achSeen.witching = 0;
  const L = K.store.state.sessions;
  const t = new app.window.Date(); t.setHours(3, 10, 0, 0);
  L.push({ id: 990001, ts: t.getTime(), date: t.toISOString().slice(0, 10), type: "todo", metrics: {} });
  A._resetCache();
  const r = await evaluate(["ledger"]);
  assert(!r.pings.some((p) => p.id === "witching"), "the hidden badge did not ping");
});

step("I · the Wall only reads; hidden is masked and last", async () => {
  await idle();
  /* close anything the last step opened */
  app.document.querySelectorAll(".k-dialog-overlay").forEach((n) => n.remove());
  const before = stateNoUi();
  K.show("achievements");
  for (let i = 0; i < 600 && !app.document.querySelector("[data-ui~='ach.panel']"); i++) await app.settle();
  assert(app.document.querySelectorAll("[data-ui~='ach.panel']").length >= 20, "a panel per set");
  app.document.querySelector("[data-ui~='ach.panel']").click();
  for (let i = 0; i < 10; i++) await app.settle();
  assert(app.document.querySelector("[data-ui~='ach.set-dialog']"), "a set opens as its carousel");
  app.document.querySelectorAll(".k-dialog-overlay").forEach((n) => n.remove());
  K.store.state.ui.achView = { list: true, filter: "all", sort: "near" };
  K.show("achievements");
  for (let i = 0; i < 600 && !app.document.querySelector("[data-ui~='ach.list']"); i++) await app.settle();
  eq(stateNoUi(), before, "drawing the Wall, a set and the list wrote nothing");
  const rows = Array.from(app.document.querySelectorAll("[data-ui~='ach.row']"));
  const hiddenIdx = rows.map((r, i) => (r.getAttribute("data-state") === "hidden" ? i : -1)).filter((i) => i >= 0);
  assert(hiddenIdx.length >= 1, "an unearned hidden badge is listed");
  assert(hiddenIdx.every((i) => i >= rows.length - hiddenIdx.length), "hidden badges are last, even sorted by nearest to done");
  hiddenIdx.forEach((i) => {
    const txt = rows[i].textContent;
    assert(/Hidden badge/.test(txt) && !/First light|witching/i.test(txt), "a hidden badge's name and description are masked: " + txt);
  });
  const sorted = (await views()).filter((v) => v.masked);
  sorted.forEach((v) => eq(v.p, 0, "a masked badge carries p 0"));
  delete K.store.state.ui.achView;
});

step("J · Reports: a term's tiers and story; the share card's showcase is off", async () => {
  const d0 = new app.window.Date(), dd = d0.getFullYear() + "-" + String(d0.getMonth() + 1).padStart(2, "0") + "-" + String(d0.getDate()).padStart(2, "0");
  const got = A.earnedIn(dd, dd);
  assert(got.length > 0, "tiers earned today are in today's range");
  const input = { ledger: [], badges: got.map((r) => ({ id: r.id, tier: r.tier, tiers: A.def(r.id).tiers.length, name: A.def(r.id).name, set: A.def(r.id).set, at: r.at })) };
  const f = K.report.compute(input, { period: "term", id: "t", start: dd, end: dd });
  assert(f.badges && f.badges.n === got.length, "the term's facts count the tiers");
  assert(f.stories.indexOf("badges") >= 0, "and keep the badges story");
  const src = fs.readFileSync(path.join(ROOT, "js/modules/reportshare.js"), "utf8");
  assert(/badges: false/.test(src), "the share card's showcase is off by default");
});

step("K · zero Governor traffic", async () => {
  const g = JSON.stringify([K.store.state.governor.xp, K.store.state.governor.gold, K.store.state.governor.hp]);
  const n = K.store.state.sessions.length;
  K.store.state.achievements.earned = {};
  K.store.state.ui.achInit = Date.now() - 10 * 60 * 1000;
  const r = await evaluate(null);
  assert(r.earned.length > 0, "tiers were earned");
  eq(JSON.stringify([K.store.state.governor.xp, K.store.state.governor.gold, K.store.state.governor.hp]), g, "no XP, gold or HP moved");
  eq(K.store.state.sessions.length, n, "no session was logged");
});

step("L · the notification", async () => {
  assert(K.notify.KINDS.achievement, "the kind exists");
  A.notify({ id: "regular", tier: 1 });
  A.notify({ id: "regular", tier: 1 });
  const items = K.store.state.notify.items.filter((it) => it.id === "ach:regular:1");
  eq(items.length, 1, "one item per tier, by its id");
  eq(items[0].kind, "achievement", "of kind achievement");
  assert(app.errors.length === 0, "no app errors: " + app.errors.join(" | "));
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke113: " + failed + " failed" : "smoke113: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
