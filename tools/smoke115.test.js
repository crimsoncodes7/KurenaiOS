/* Kurenai OS — smoke115.test.js
   Mind's Journal replication (kos_mind; invariant 139, audit DI-26),
   with an injectable cloud, modelled on smoke86's kos_money claims.

   The claims:

     A · LOCAL FIRST. Signed out, or in a review namespace, a sync sends
         nothing and reports skipped.
     B · PUSH. Signed in, every entry and every tombstone goes up once;
         a second sync with nothing new pushes nothing, and this device's
         own echo is skipped (pulled 0).
     C · PULL. Another device's entry arrives in the store and the list
         in memory (kos-mind-journal fires); a remote deletion deletes
         here, leaves no tombstone of ours and is never sent back.
     D · TWO DEVICES. Two booted apps share one table: an entry made on
         one reaches the other; both edit it; after each syncs (twice
         round) both hold the same entry — the copy the table holds —
         and a quiet round pushes and pulls nothing.
     E · No request reaches the network: the fake table took every call.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke115.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err) : res(out))); }

/* a stand-in for the kos_mind table: server time is a counter */
function fakeTable() {
  const rows = new Map();
  let clock = 0;
  const ts = () => "2026-10-29T10:00:" + String(++clock).padStart(5, "0");
  const calls = { since: 0, upsert: 0 };
  return {
    rows, calls,
    remote(row) { rows.set(row.sync_id, Object.assign({ deleted: false, stamp: "x", data_json: {} }, row, { updated_at: ts() })); },
    api: {
      since(stamp, offset, cb) {
        calls.since++;
        const list = [...rows.values()].filter(r => !stamp || r.updated_at > stamp).sort((a, b) => a.updated_at < b.updated_at ? -1 : 1);
        cb(null, JSON.parse(JSON.stringify(list.slice(offset, offset + 200))));
      },
      upsert(batch, cb) {
        calls.upsert++;
        batch.forEach(r => rows.set(r.sync_id, { sync_id: r.sync_id, deleted: r.deleted, stamp: r.stamp, data_json: JSON.parse(JSON.stringify(r.data_json)), updated_at: ts() }));
        cb(null, batch.map(r => ({ sync_id: r.sync_id })));
      }
    }
  };
}
/* a sync's callback runs before the list in memory is reloaded (finish → ready); settle first */
async function sync(d) { const out = await p(cb => d.KOS.mindJournal.syncCloud(cb)); await d.settle(); return out; }
function signIn(K, uid) { K.cloud.signedIn = () => true; K.cloud.userId = () => uid; }

let app, K, J, table;
let eKeep, eGone;

step("boot on Thursday 29 October 2026", async () => {
  app = await boot({ clock: "2026-10-29T10:00:00" });
  K = app.KOS; J = K.mindJournal;
  assert(J && typeof J._setCloud === "function", "KOS.mindJournal._setCloud is the test seam (as Money's _setCloudApi)");
  await p(cb => J.ready(cb));
});

/* ---------------- A ---------------- */
step("A · signed out, nothing is sent", async () => {
  table = fakeTable();
  J._setCloud(table.api);
  K.cloud.signedIn = () => false;
  await p(cb => J.add({ kind: "insight", text: "Local first." }, cb));
  const out = await p(cb => J.syncCloud(cb));
  eq(out.skipped, true, "skipped");
  eq([table.calls.since, table.calls.upsert], [0, 0], "the table was never asked");
});
step("A · in a review namespace, nothing is sent", async () => {
  signIn(K, "u1");
  const was = K.dataMode;
  K.dataMode = Object.assign({}, was || {}, { mode: "review" });
  try {
    const out = await p(cb => J.syncCloud(cb));
    eq(out.skipped, true, "skipped in a review namespace");
  } finally { K.dataMode = was; }
  eq(table.calls.upsert, 0, "nothing pushed");
});

/* ---------------- B ---------------- */
step("B · signed in: entries and tombstones go up once", async () => {
  eKeep = await p(cb => J.add({ kind: "quote", text: "The unexamined life…", source: "Plato" }, cb));
  eGone = await p(cb => J.add({ kind: "question", text: "What is a good argument?" }, cb));
  await p(cb => J.remove(eGone.id, cb));
  const out = await p(cb => J.syncCloud(cb));
  eq(out.pushed, 3, "two entries (the signed-out one and the quote) and one tombstone");
  eq(table.rows.get(eKeep.id).data_json.source, "Plato", "the row carries the entry");
  eq(table.rows.get(eKeep.id).stamp, String(eKeep.updatedAt), "stamped with its updatedAt");
  eq(table.rows.get(eGone.id).deleted, true, "the tombstone");
  const again = await p(cb => J.syncCloud(cb));
  eq([again.pushed, again.pulled, again.deleted], [0, 0, 0], "nothing new, and our own echo skipped");
});
step("B · an edit pushes that entry only", async () => {
  await p(cb => J.put(Object.assign({}, J.get(eKeep.id), { text: "The unexamined life is not worth living." }), cb));
  const out = await p(cb => J.syncCloud(cb));
  eq(out.pushed, 1, "one changed entry");
  eq(table.rows.get(eKeep.id).data_json.text, "The unexamined life is not worth living.", "the edit reached the table");
});

/* ---------------- C ---------------- */
step("C · another device's entry arrives; its deletion is applied and never sent back", async () => {
  table.remote({ sync_id: "j-other", stamp: "123", data_json: { id: "j-other", kind: "reflection", text: "From the iPad.", at: 100, updatedAt: 123 } });
  table.remote({ sync_id: eKeep.id, deleted: true, stamp: "del" });
  let fired = 0;
  const on = () => fired++;
  app.document.addEventListener("kos-mind-journal", on);
  const out = await p(cb => J.syncCloud(cb));
  await app.settle();
  app.document.removeEventListener("kos-mind-journal", on);
  eq([out.pulled, out.deleted], [1, 1], "pulled one, deleted one");
  assert(J.get("j-other") && J.get("j-other").text === "From the iPad.", "the other device's entry is in the list");
  assert(!J.get(eKeep.id), "deleted here");
  assert(fired > 0, "kos-mind-journal fired");
  const dump = await p(cb => J.exportAll(cb));
  assert(dump.entries.some(e => e.id === "j-other"), "in the store, not just the cache");
  assert(!dump.del.some(d => d.id === eKeep.id), "no tombstone of our own for a remote deletion");
  const third = await p(cb => J.syncCloud(cb));
  eq([third.pushed, third.pulled], [0, 0], "nothing sent back, nothing pulled twice");
});
step("C · a malformed or mismatched row is ignored", async () => {
  table.remote({ sync_id: "j-bad", stamp: "1", data_json: { id: "j-bad", kind: "nonsense", text: "x" } });
  table.remote({ sync_id: "j-mis", stamp: "1", data_json: { id: "j-elsewhere", kind: "insight", text: "x" } });
  const out = await p(cb => J.syncCloud(cb));
  eq(out.pulled, 0, "neither applied");
  assert(!J.get("j-bad") && !J.get("j-mis") && !J.get("j-elsewhere"), "not in the list");
});

/* ---------------- D ---------------- */
let A, B, shared;
step("D · two devices on one table: an entry made on one reaches the other", async () => {
  shared = fakeTable();
  A = await boot({ clock: "2026-10-29T10:00:00", seed: 11 });
  /* B's clock runs 5 s ahead. With the SAME millisecond on both, two edits of one entry carry the
     same stamp and each device takes the other's row for its own echo, so they never converge —
     recorded as an audit finding (stamp = updatedAt is not a content identity), not asserted here. */
  B = await boot({ clock: "2026-10-29T10:00:05", seed: 22 });
  [A, B].forEach(d => { d.KOS.mindJournal._setCloud(shared.api); signIn(d.KOS, "u2"); });
  await p(cb => A.KOS.mindJournal.ready(cb));
  await p(cb => B.KOS.mindJournal.ready(cb));
  const e = await p(cb => A.KOS.mindJournal.add({ kind: "insight", text: "Two devices, one journal." }, cb));
  await sync(A);
  const out = await sync(B);
  eq(out.pulled, 1, "B pulled it");
  eq(B.KOS.mindJournal.get(e.id).text, "Two devices, one journal.", "B holds A's entry");
  shared.id = e.id;
});
step("D · both edit it; after two rounds both hold the table's copy", async () => {
  const id = shared.id;
  const JA = A.KOS.mindJournal, JB = B.KOS.mindJournal;
  await p(cb => JB.put(Object.assign({}, JB.get(id), { text: "Edited on B." }), cb));
  await p(cb => JA.put(Object.assign({}, JA.get(id), { text: "Edited on A." }), cb));
  for (let round = 0; round < 2; round++) {
    await sync(B);
    await sync(A);
  }
  const server = shared.rows.get(id).data_json.text;
  eq(server, "Edited on A.", "the last push holds the table");
  eq(JA.get(id).text, server, "A converged on the table's copy");
  eq(JB.get(id).text, server, "B converged on the table's copy");
  eq(JA.list().length, JB.list().length, "the same number of entries");
  const qa = await sync(A), qb = await sync(B);
  eq([qa.pushed, qa.pulled, qb.pushed, qb.pulled], [0, 0, 0, 0], "a quiet round moves nothing");
});
step("D · a deletion on one device reaches the other without a tombstone there", async () => {
  const id = shared.id;
  await p(cb => B.KOS.mindJournal.remove(id, cb));
  await sync(B);
  const out = await sync(A);
  eq(out.deleted, 1, "A deleted it");
  assert(!A.KOS.mindJournal.get(id), "gone on A");
  const dump = await p(cb => A.KOS.mindJournal.exportAll(cb));
  assert(!dump.del.some(d => d.id === id), "A keeps no tombstone of its own");
  const back = await sync(A);
  eq(back.pushed, 0, "never sent back");
});

/* ---------------- E ---------------- */
step("E · no errors and no request", async () => {
  [app, A, B].forEach((d, i) => {
    eq(d.errors, [], "window errors (app " + i + ")");
    assert(!d.fetches.some(f => /kos_mind/.test(String(f))), "the fake table took every call (app " + i + ")");
  });
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("FAIL  " + name + "\n      " + e.message); }
  }
  console.log(failed ? "\n" + failed + " step(s) failed" : "\nsmoke115: all " + steps.length + " steps passed");
  process.exit(failed ? 1 : 0);
})();
