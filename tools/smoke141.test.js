/* Kurenai OS — smoke141.test.js
   The stores that replicate beside the state document (quality W1: DI-20
   and DI-11; W2's change bus): js/core/sidesync.js.

   The claims:

     A · THE OVERLAP. since(cursor) asks from two minutes before the last
         cursor; nothing for no cursor; a cursor it cannot read is passed
         on unchanged.
     B · WHAT HAPPENED IS RECORDED. A wrapped replicator's success is
         recorded with what it pulled and pushed; a failure with its
         words, and the last success is kept beside it; a run that did not
         happen (skipped) is not an outcome. Only a pull that brought
         something names its store to the change bus.
     C · MONEY, THROUGH THE REAL REPLICATOR. The pull asks from the
         cursor less two minutes; a row the server committed late, behind
         the cursor, arrives; reading the overlap again brings nothing and
         says nothing to the bus; this device's own echo is never counted.
     D · A FAILURE IS SHOWN AND CAN BE TRIED AGAIN. A cloud error is in
         KOS.sideSync.status() and failing(); Account & Cloud Sync lists
         the store with the error in words; the next good run clears it;
         the status is kept per device and per account in the media kv.
     E · EVERY SIDE STORE IS WRAPPED, under the key its pages read, and
         every pull by cursor overlaps (the media and file pulls and the
         server runs included).

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke141.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err) : res(out))); }
function q(fn) { return new Promise(res => fn((err, out) => res({ err, out }))); }
const tick = () => new Promise(r => setTimeout(r, 0));

let app, K, S, M, doc;
const noted = [];

/* a stand-in for kos_money whose clock is the server's: real ISO stamps,
   one second apart, and a row can be committed BEHIND the newest one */
function fakeTable() {
  const rows = new Map(), asked = [];
  let t = Date.parse("2026-11-14T10:00:00.000Z"), fail = null;
  const ts = () => new Date(t += 1000).toISOString();
  return {
    rows, asked,
    newest() { return new Date(t).toISOString(); },
    failWith(msg) { fail = msg; },
    remote(row, behindMs) {
      rows.set(row.sync_id, Object.assign({ deleted: false, stamp: "x", data_json: {} }, row,
        { updated_at: behindMs ? new Date(t - behindMs).toISOString() : ts() }));
    },
    api: {
      since(stamp, offset, cb) {
        asked.push(stamp);
        if (fail) { cb(new Error(fail)); return; }
        const list = [...rows.values()].filter(r => !stamp || r.updated_at > stamp).sort((a, b) => a.updated_at < b.updated_at ? -1 : 1);
        cb(null, list.slice(offset, offset + 200));
      },
      upsert(batch, cb) {
        if (fail) { cb(new Error(fail)); return; }
        batch.forEach(r => rows.set(r.sync_id, { sync_id: r.sync_id, deleted: r.deleted, stamp: r.stamp, data_json: r.data_json, updated_at: ts() }));
        cb(null, batch.map(r => ({ sync_id: r.sync_id })));
      }
    }
  };
}
function row(id) { return S.status().find(r => r.id === id); }

step("boot on Saturday 14 November 2026", async () => {
  app = await boot({ clock: "2026-11-14T10:00:00" });
  K = app.KOS; S = K.sideSync; M = K.money; doc = app.window.document;
  assert(S, "KOS.sideSync exists");
  K.changes.on((keys, source) => noted.push([keys, source]));
});

/* ---------------- A ---------------- */
step("A · a pull asks from two minutes before the cursor", () => {
  eq(S.since(null), null, "no cursor, no bound");
  eq(S.since(undefined), null, "nor for undefined");
  eq(S.since("2026-11-14T10:05:00.000Z"), "2026-11-14T10:03:00.000Z", "two minutes earlier");
  eq(S.since("2026-11-14T10:05:00.123456+00:00"), "2026-11-14T10:03:00.123Z", "the server's own spelling");
  eq(S.since("not-a-date"), "not-a-date", "an unreadable cursor is passed on");
  eq(S.OVERLAP_MS, 120000, "two minutes");
});

/* ---------------- B ---------------- */
let result = null, calls = 0;
step("B · a success is recorded, a skipped run is not", async () => {
  const run = S.wrap({ id: "t-store", label: "Test store", key: "db:test" }, cb => { calls++; cb(result.err, result.out); });
  result = { err: null, out: { pushed: 0, pulled: 0, skipped: true } };
  const sk = await p(run);
  eq(sk.skipped, true, "the caller still gets its answer");
  eq(row("t-store").at, undefined, "a run that did not happen is not an outcome");

  result = { err: null, out: { pushed: 2, pulled: 0 } };
  noted.length = 0;
  await p(run);
  const r = row("t-store");
  assert(r.ok && r.at === r.ok, "the success and its time");
  eq([r.err, r.pulled, r.pushed, r.label, r.key], [null, 0, 2, "Test store", "db:test"], "what it did");
  eq(noted, [], "a push alone says nothing to the bus");
  eq(S.failing(), [], "nothing failing");
  eq(calls, 2, "the replicator ran each time");
});
step("B · a pull that brought something names its store to the bus", async () => {
  const run = S.wrap({ id: "t-pull", label: "Pull store", key: "db:pull" }, cb => cb(result.err, result.out));
  result = { err: null, out: { pushed: 0, pulled: 3 } };
  noted.length = 0;
  await p(run);
  eq(noted, [[["db:pull"], "device"]], "its key, as another device's change");
  result = { err: null, out: { pushed: 0, pulled: 0, deleted: 1 } };
  noted.length = 0;
  await p(run);
  eq(noted, [[["db:pull"], "device"]], "a remote deletion too");
});
step("B · a failure is recorded with its words, beside the last success", async () => {
  const before = row("t-pull").ok;
  const run = S.wrap({ id: "t-fail", label: "Failing store", key: "db:fail" }, cb => cb(result.err, result.out));
  result = { err: new Error("permission denied for table kos_test"), out: { pushed: 0, pulled: 4 } };
  noted.length = 0;
  const got = await q(run);
  assert(got.err, "the caller still gets the error");
  const r = row("t-fail");
  eq(r.err.msg, "permission denied for table kos_test", "the words");
  eq(r.ok, undefined, "never succeeded");
  eq(noted, [], "a failed run says nothing to the bus");
  eq(S.failing(), ["t-fail"], "listed as failing");
  eq(row("t-pull").ok, before, "another store's record is untouched");
  result = { err: null, out: { pushed: 0, pulled: 0 } };
  await p(run);
  eq([row("t-fail").err, S.failing()], [null, []], "a good run clears it");
});

/* ---------------- C ---------------- */
let table, mine;
step("C · Money: the first pull has no bound, the next asks from the cursor less two minutes", async () => {
  table = fakeTable();
  M._setCloudApi(table.api);
  K.cloud.signedIn = () => true; K.cloud.userId = () => "u1";
  mine = await p(cb => M.addTx({ date: "2026-11-10", amount: 20, cat: "food", payee: "Tesco" }, cb));
  noted.length = 0;
  const first = await p(cb => M.syncCloud(cb));
  eq([first.pushed, first.pulled], [1, 0], "one row up, its echo not counted");
  eq(table.asked, [null], "no bound the first time");
  eq(noted, [], "our own echo is no news");
  const cursor = table.newest();
  await p(cb => M.syncCloud(cb));
  eq(table.asked[1], new Date(Date.parse(cursor) - 120000).toISOString(), "from two minutes before the cursor");
  assert(row("money").ok, "Money's run is recorded");
});
step("C · a row committed late, behind the cursor, still arrives", async () => {
  /* another device's transaction whose server stamp is 30 s OLDER than the
     cursor this device already holds: `updated_at > cursor` skipped it for ever */
  table.remote({ sync_id: "t-late", stamp: "77", data_json: { syncId: "t-late", date: "2026-11-11", minor: 1500, kind: "out", cat: "social", updatedAt: 77 } }, 30000);
  noted.length = 0;
  const out = await p(cb => M.syncCloud(cb));
  eq(out.pulled, 1, "pulled");
  const have = await p(cb => M.range("2026-11-01", "2026-11-30", cb));
  assert(have.some(t => t.syncId === "t-late"), "the late row is here");
  eq(noted, [[["db:money"], "device"]], "and Money's pages are told");
  eq(row("money").pulled, 1, "counted in the status");
});
step("C · reading the overlap again brings nothing and says nothing", async () => {
  noted.length = 0;
  const out = await p(cb => M.syncCloud(cb));
  eq([out.pushed, out.pulled, out.deleted], [0, 0, 0], "a row already held is ignored");
  eq(noted, [], "no news");
  const have = await p(cb => M.range("2026-11-01", "2026-11-30", cb));
  eq(have.filter(t => t.syncId === "t-late").length, 1, "one copy");
  eq(have.filter(t => t.syncId === mine.syncId).length, 1, "and one of ours");
});

/* ---------------- D ---------------- */
let card;
step("D · a cloud error is in the status and on Account & Cloud Sync", async () => {
  const okAt = row("money").ok;
  table.failWith("JWT expired");
  const got = await q(cb => M.syncCloud(cb));
  assert(got.err, "the run failed");
  const r = row("money");
  eq(r.err.msg, "JWT expired", "the error in words");
  eq(r.ok, okAt, "the last success is kept");
  assert(S.failing().includes("money"), "failing");

  K.cloud.configured = () => true; K.cloud.available = () => true;
  card = K.cloudui.panel();
  /* read before the page appends it: the card is drawn first, then placed */
  const line = card.querySelector("[data-ui~='cloud.side-row'][data-store='money']");
  assert(line, "Money has a line on the card");
  eq(line.getAttribute("data-state"), "error", "marked as an error");
  assert(/Failed .* · JWT expired/.test(line.textContent), "says what failed: " + line.textContent);
  assert(!card.querySelector("[data-ui~='cloud.side-row'][data-store='ink']"), "a store that has not run has no line");
  doc.body.appendChild(card);
});
step("D · the next good run clears it, on the card too", async () => {
  table.failWith(null);
  await p(cb => M.syncCloud(cb));
  await tick();
  eq(row("money").err, null, "cleared");
  const line = card.querySelector("[data-ui~='cloud.side-row'][data-store='money']");
  assert(line && !line.hasAttribute("data-state"), "no error state");
  assert(/^Money\s*Synced /.test(line.textContent), "says Synced: " + line.textContent);
});
step("D · Sync all runs every store, and the status is kept for this account", async () => {
  /* the other four stores answer from an empty table of their own */
  const empty = { since: (stamp, offset, cb) => cb(null, []), upsert: (batch, cb) => cb(null, []) };
  K.reviewLog._setCloudApi(empty); K.reportStore._setCloudApi(empty); K.inkSync._setCloudApi(empty); K.mindJournal._setCloud(empty);
  const seen = [];
  S.wrap({ id: "t-all", label: "All", key: "db:all" }, cb => { seen.push("ran"); cb(null, { pushed: 0, pulled: 0 }); });
  await new Promise(res => S.syncAll(res));
  eq(seen, ["ran"], "a registered store was run");
  await tick();
  const kv = await p(cb => K.mediadb.getKV("sidesync.status", cb));
  eq(kv.uid, "u1", "kept for this account");
  assert(kv.by.money && kv.by.money.ok, "Money's record is stored");
  assert(!JSON.stringify(kv).includes("Tesco"), "nothing of the data itself");
});

/* ---------------- E ---------------- */
step("E · every side store is wrapped under the key its pages read", () => {
  const by = {};
  S.status().forEach(r => { by[r.id] = r.key; });
  eq([by.money, by.mind, by.reports, by.reviews, by.ink], ["db:money", "db:mind", "db:reports", "db:reviews", "db:ink"], "the five stores");
  const fs = require("fs"), path = require("path");
  ["money", "mindjournal", "reportstore", "reviewlog", "inksync"].forEach(f => {
    const src = fs.readFileSync(path.join(__dirname, "..", "js", "core", f + ".js"), "utf8");
    assert(/KOS\.sideSync\.wrap\(/.test(src), f + ".js wraps its replicator");
    assert(/KOS\.sideSync\.since\(meta\.cursor\)/.test(src), f + ".js pulls with the overlap");
  });
  /* DI-11 named the main engine's media and file pulls and the server runs too */
  const cs = fs.readFileSync(path.join(__dirname, "..", "js", "core", "cloudsync.js"), "utf8");
  assert(/fetchMediaSince\(KOS\.sideSync \? KOS\.sideSync\.since\(since\)/.test(cs), "the media pull overlaps");
  assert(/fetchFilesSince\(KOS\.sideSync \? KOS\.sideSync\.since\(since\)/.test(cs), "the files pull overlaps");
  assert(/runsSince\(KOS\.sideSync \? KOS\.sideSync\.since\(cursor\)/.test(fs.readFileSync(path.join(__dirname, "..", "js", "core", "push.js"), "utf8")), "the server runs' pull overlaps");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack || e)); }
  }
  console.log(failed ? "\n" + failed + " of " + steps.length + " steps failed" : "\nsmoke141: all " + steps.length + " steps passed");
  if (app && app.close) try { app.close(); } catch (e) { /* closing */ }
  process.exit(failed ? 1 : 0);
})();
