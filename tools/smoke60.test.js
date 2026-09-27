/* Kurenai OS — smoke60.test.js
   Roadmap 1.5: the Shrine — your order for titles that share a score.

   The claims:

     A · ONE STORE, SYNCED. The order for a score is a list of syncIds in
         state.media.shrine.order["<score>"] — the synced state document
         (only the Shrine's module/sort filters are per device). The gate
         de-duplicates, accepts entries or ids, and an empty list removes
         the tier's order; an unrated score has no tier.
     B · ONLY TIES MOVE. Ranking reads the order inside a run of EQUAL
         scores; listed titles come first in the stored order and a title
         that joined the tier later goes to its end. The score ranking
         itself never changes, and the read writes nothing.
     C · THE HALL FOLLOWS IT. The Shrine's podium and ranks read the order
         when sorted by score, and ignore it under another sort.
     D · THE MERGE takes an order list whole: a reorder on each device can
         never double or drop a title.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke60.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": " + JSON.stringify(a) + " vs " + JSON.stringify(b)); }
const p = fn => new Promise((res, rej) => fn((e, r) => e ? rej(e) : res(r)));

let app, KOS;
const O = () => KOS.media.shrineOrder;
const E = (id, score, title) => ({ id: id, syncId: "s-" + id, score: score, title: title || "T" + id });

/* ============ A · one store, synced ============ */
step("A · score keys, and the stored list per tier", () => {
  eq([O().scoreKey(10), O().scoreKey(9.5), O().scoreKey("9.55"), O().scoreKey(0), O().scoreKey(null)],
    ["10", "9.5", "9.6", null, null], "score keys");
  eq(O().set(10, ["s-3", E(1, 10), "s-3", "", null, "s-2"]), ["s-3", "s-1", "s-2"], "ids or entries, de-duplicated");
  eq(KOS.store.state.media.shrine.order, { "10": ["s-3", "s-1", "s-2"] }, "stored in the state document");
  eq(O().get(10), ["s-3", "s-1", "s-2"], "read back");
  eq(O().set(0, ["s-1"]), null, "an unrated score has no tier");
  O().set(10, []);
  eq(KOS.store.state.media.shrine.order, {}, "an empty list removes the tier's order");
});

step("A · the order syncs; only the Shrine's filters are per device", () => {
  O().set(9, ["s-7", "s-8"]);
  const doc = KOS.cloudsync._syncableState ? KOS.cloudsync._syncableState(KOS.store.state) : null;
  if (doc) {
    assert(doc.media && doc.media.shrine && doc.media.shrine.order && doc.media.shrine.order["9"], "the order is in the pushed document");
    assert(!("sort" in doc.media.shrine) && !("module" in doc.media.shrine), "the filters stay on the device");
  } else {
    const src = require("fs").readFileSync(require("path").join(__dirname, "..", "js", "core", "cloudsync.js"), "utf8");
    assert(/\["media", "shrine", "module"\], \["media", "shrine", "sort"\]/.test(src) && !/"shrine", "order"/.test(src),
      "only module/sort are device paths");
  }
  O().set(9, []);
});

/* ============ B · only ties move ============ */
step("B · a tier follows its stored order; a newcomer joins the end", () => {
  const ranked = [E(1, 10, "A"), E(2, 10, "B"), E(3, 10, "C"), E(4, 9.5), E(5, 9, "X"), E(6, 9, "Y"), E(7, 0)];
  O().set(10, ["s-3", "s-1"]);         // s-2 joined the tier after the order was set
  O().set(9, ["s-6", "s-5"]);
  const before = JSON.stringify(KOS.store.state);
  const out = O().apply(ranked);
  eq(out.map(e => e.id), [3, 1, 2, 4, 6, 5, 7], "ties reordered, newcomer last, scores intact");
  eq(JSON.stringify(KOS.store.state), before, "apply writes nothing");
  eq(out.map(e => e.score), ranked.map(e => e.score), "the score ranking never moves");
  eq(O().apply(ranked.slice(0, 1)).map(e => e.id), [1], "a lone title");
  O().set(10, ["s-99", "s-2"]);        // an id no longer in the hall is ignored
  eq(O().apply(ranked).slice(0, 3).map(e => e.id), [2, 1, 3], "unknown ids are skipped");
  eq(O().tiers(ranked).map(t => [t.key, t.entries.map(e => e.id)]), [["10", [2, 1, 3]], ["9", [6, 5]]], "tied tiers only");
  O().set(10, []); O().set(9, []);
});

/* ============ C · the hall follows it ============ */
step("C · the Shrine ranks tied favourites by the stored order under the score sort", async () => {
  const mk = (title, score) => p(cb => KOS.mediadb.add({ module: "anime", title: title, status: "completed", score: score, favourite: true }, cb));
  const a = await mk("Alpha", 10), b = await mk("Bravo", 10), c = await mk("Charlie", 10), d = await mk("Delta", 8);
  /* every leaf element naming one of the four titles, in document order:
     the feature (rank 1), the podium, then the ranked wall */
  const names = () => [...app.document.querySelectorAll("#main [data-ui~='shrine.hall'] *")]
    .filter(n => !n.children.length && !n.closest("[data-ui~='shrine.ledger']"))
    .map(n => n.textContent.trim()).filter(t => /^(Alpha|Bravo|Charlie|Delta)$/.test(t));
  const firstOrder = () => { const seen = []; names().forEach(n => { if (seen.indexOf(n) === -1) seen.push(n); }); return seen; };
  KOS.store.state.media.shrine = { module: "", sort: "score", description: "" };
  KOS.show("shrine");
  await app.settle();
  eq(firstOrder(), ["Alpha", "Bravo", "Charlie", "Delta"], "no order: the title tie-break");
  O().set(10, [c.syncId, a.syncId]);
  KOS.show("shrine", undefined, { _nav: true });
  await app.settle();
  eq(firstOrder(), ["Charlie", "Alpha", "Bravo", "Delta"], "the stored order leads, Bravo joins the end");
  KOS.store.state.media.shrine.sort = "title";
  KOS.show("shrine", undefined, { _nav: true });
  await app.settle();
  eq(firstOrder(), ["Alpha", "Bravo", "Charlie", "Delta"], "another sort ignores the tie order");
  KOS.store.state.media.shrine.sort = "score";
  O().set(10, []);
  void b; void d;
});

step("C · Set order (frame 23d): a tier's titles move with the keyboard and the order is stored", async () => {
  const mk = (title, score) => p(cb => KOS.mediadb.add({ module: "anime", title: title, status: "completed", score: score, favourite: true }, cb));
  const x = await mk("Xray", 9), y = await mk("Yankee", 9);
  KOS.store.state.media.shrine = { module: "", sort: "score", description: "" };
  KOS.show("shrine");
  await app.settle();
  const btn = app.document.querySelector("[data-ui~='shrine.set-order'][data-score='9']");
  assert(btn, "a tied score has no Set order control");
  btn.click();
  const dlg = app.document.querySelector("[data-ui~='shrine.order-dialog']");
  assert(dlg, "the order dialog did not open");
  const key = (el, k) => el.dispatchEvent(new app.window.KeyboardEvent("keydown", { key: k, bubbles: true, cancelable: true }));
  const first = dlg.querySelector("[data-reorder]");
  key(first, " ");
  key(first, "ArrowDown");
  key(first, " ");
  eq(O().get(9), [y.syncId, x.syncId], "the moved title is stored second");
  key(dlg.querySelector("[data-reorder]"), " ");
  key(dlg.querySelector("[data-reorder]"), "Escape");
  assert(app.document.querySelector("[data-ui~='shrine.order-dialog']"), "Escape on a lifted row closed the dialog");
  eq(O().get(9), [y.syncId, x.syncId], "Escape put the row back and stored nothing");
  [...dlg.querySelectorAll("button")].find(b => /Reset to date enshrined/.test(b.textContent)).click();
  eq(O().get(9), [], "reset clears the tier's order");
});

/* ============ D · the merge ============ */
step("D · two devices reordering one tier: the list is taken whole, never mixed", () => {
  const doc = list => ({ media: { shrine: { description: "", order: { "10": list } } } });
  const base = doc(["a", "b", "c"]);
  const out = KOS.cloudmerge.merge(base, doc(["b", "a", "c"]), doc(["a", "c", "b"])).doc.media.shrine.order["10"];
  eq(out.slice().sort(), ["a", "b", "c"], "no title doubled or lost: " + JSON.stringify(out));
  eq(out, ["b", "a", "c"], "a same-leaf conflict goes to the local side");
  const other = KOS.cloudmerge.merge(base, doc(["a", "b", "c"]), doc(["c", "b", "a"])).doc.media.shrine.order["10"];
  eq(other, ["c", "b", "a"], "a reorder made on one device only lands");
  const two = KOS.cloudmerge.merge({ media: { shrine: { order: {} } } },
    { media: { shrine: { order: { "10": ["a", "b"] } } } }, { media: { shrine: { order: { "9": ["x", "y"] } } } }).doc.media.shrine.order;
  eq(two, { "10": ["a", "b"], "9": ["x", "y"] }, "different tiers merge per score");
});

(async () => {
  app = await boot();
  KOS = app.KOS;
  let fails = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { fails++; console.log("FAIL  " + name + "\n      " + (e && e.stack ? e.stack.split("\n").slice(0, 2).join(" | ") : e)); }
  }
  const errs = app.errors.filter(e => !/env\.local\.js/.test(e));
  if (errs.length) { fails++; console.log("FAIL  runtime errors: " + errs.join(" / ")); }
  console.log(fails ? "\nSMOKE60: " + fails + " failure(s)" : "\nSMOKE60: all " + steps.length + " steps passed");
  process.exit(fails ? 1 : 0);
})();
