/* Kurenai OS — smoke72.test.js
   Reports, phase 7 (roadmap 5.1): replication to `kos_reports`.

   The claims:

     A · LOCAL FIRST. Signed out, or in an Empty/Sample review namespace,
         nothing is sent (invariant 31).
     B · PUSH WHAT CHANGED. Every saved report and snapshot goes up once;
         a second cycle sends nothing; a change of words sends that report
         again.
     C · PULL WHAT IS MISSING. A report or snapshot another device saved
         arrives here, and is not echoed back.
     D · CONVERGE. The same report on two devices keeps the facts of the
         copy saved first and the words changed last; the merged copy goes
         back up when it differs from the cloud's. Snapshots keep the one
         taken first.
     E · THE MIGRATION is owner-only: RLS on, a policy per verb, the touch
         trigger, the (user_id, item_id) key.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke72.test.js                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot, ROOT } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err) : res(out))); }

/* a fake kos_reports: rows keyed by item_id, server-stamped updated_at */
function fakeTable() {
  let clock = 0;
  const rows = {};
  const sent = [];
  return {
    rows, sent,
    api: {
      since(iso, offset, cb) {
        const list = Object.values(rows).filter(r => !iso || r.updated_at > iso).sort((a, b) => a.updated_at < b.updated_at ? -1 : 1);
        setTimeout(() => cb(null, JSON.parse(JSON.stringify(list.slice(offset, offset + 200)))), 0);
      },
      upsert(list, cb) {
        list.forEach(r => { sent.push(r.item_id); rows[r.item_id] = Object.assign({}, JSON.parse(JSON.stringify(r)), { updated_at: "2026-10-12T10:00:" + String(++clock).padStart(2, "0") + "Z" }); });
        setTimeout(() => cb(null, list.map(r => ({ item_id: r.item_id }))), 0);
      }
    },
    remote(item_id, kind, data, stamp) { rows[item_id] = { item_id, kind, stamp, data_json: data, updated_at: "2026-10-12T11:00:" + String(++clock).padStart(2, "0") + "Z" }; }
  };
}
function report(id, savedAt, mins, words) {
  const [period, start] = id.split(":");
  return { id, period, start, end: start, savedAt, facts: { v: 1, period, start, study: { mins }, focus: {}, gov: {}, stories: [] },
    words: Object.assign({ mode: "template", headline: null, narrative: null, writtenAt: null, status: "idle", changedAt: 0 }, words || {}) };
}

step("A · signed out, or in a review namespace, nothing is sent", async (app) => {
  const KOS = app.KOS, t = fakeTable();
  KOS.reportStore._setCloudApi(t.api);
  await p(cb => KOS.reportStore.putReport(report("week:2026-09-07", 1000, 60), cb));
  let out = await p(cb => KOS.reportStore.syncCloud(cb));
  assert(out.skipped && !t.sent.length, "signed out: skipped");
  KOS.cloud.signedIn = () => true; KOS.cloud.userId = () => "u1";
  KOS.dataMode.mode = "sample";
  out = await p(cb => KOS.reportStore.syncCloud(cb));
  assert(out.skipped && !t.sent.length, "a review namespace: skipped");
  KOS.dataMode.mode = "";
});

step("B · push once; a words change goes again", async (app) => {
  const KOS = app.KOS, rs = KOS.reportStore, t = fakeTable();
  rs._setCloudApi(t.api);
  await p(cb => rs.putSnapshot({ id: "2026-09-07", boundary: "2026-09-07", takenAt: 500, topics: {}, gov: {}, media: {} }, cb));
  let out = await p(cb => rs.syncCloud(cb));
  assert(out.pushed === 2 && t.rows["week:2026-09-07"] && t.rows["snap:2026-09-07"], "the report and the snapshot go up: " + JSON.stringify(out));
  assert(t.rows["week:2026-09-07"].user_id === "u1" && t.rows["week:2026-09-07"].kind === "report", "owned rows, with their kind");
  out = await p(cb => rs.syncCloud(cb));
  assert(out.pushed === 0, "nothing changed, nothing sent (" + out.pushed + ")");
  await p(cb => rs.setWords("week:2026-09-07", { mode: "kurenai", headline: "Words.", narrative: "Some words for the week.", writtenAt: 2 }, cb));
  out = await p(cb => rs.syncCloud(cb));
  assert(out.pushed === 1 && t.rows["week:2026-09-07"].data_json.words.headline === "Words.", "the words change goes up");
});

step("C · pull what another device saved, without echoing it", async (app) => {
  const KOS = app.KOS, rs = KOS.reportStore, t = fakeTable();
  rs._setCloudApi(t.api);
  /* this table starts with everything this device already sent, as the real one would */
  const local = await p(cb => rs.getReport("week:2026-09-07", cb));
  t.remote("week:2026-09-07", "report", local, String(local.savedAt) + "|" + String(local.words.changedAt));
  const other = report("week:2026-09-14", 2000, 90);
  t.remote("week:2026-09-14", "report", other, "2000|0");
  t.remote("snap:2026-09-14", "snapshot", { id: "2026-09-14", boundary: "2026-09-14", takenAt: 700, topics: {}, gov: {}, media: {} }, "700");
  t.sent.length = 0;
  const out = await p(cb => rs.syncCloud(cb));
  const got = await p(cb => rs.getReport("week:2026-09-14", cb));
  assert(got && got.facts.study.mins === 90, "another device's week arrives");
  const sn = await p(cb => rs.getSnapshot("2026-09-14", cb));
  assert(sn && sn.takenAt === 700, "and its snapshot");
  assert(t.sent.indexOf("week:2026-09-14") === -1 && t.sent.indexOf("snap:2026-09-14") === -1, "nothing pulled is echoed back: " + t.sent);
  assert(out.pulled === 2, "two items pulled (" + out.pulled + ")");
});

step("D · converge: facts saved first, words changed last; snapshots taken first", async (app) => {
  const KOS = app.KOS, rs = KOS.reportStore, t = fakeTable();
  rs._setCloudApi(t.api);
  /* a fresh fake table restarts its clock: start this device's cursor over */
  await new Promise(r => KOS.mediadb.setKV("reports.sync.u1", null, r));
  /* this device saved the week LATER, but changed its words more recently */
  await p(cb => rs.putReport(report("week:2026-09-21", 5000, 40, { mode: "kurenai", headline: "Mine.", narrative: "x", changedAt: 9000 }), cb));
  t.remote("week:2026-09-21", "report", report("week:2026-09-21", 3000, 45, { mode: "template", changedAt: 4000 }), "3000|4000");
  await p(cb => rs.putSnapshot({ id: "2026-09-21", takenAt: 900, topics: {}, gov: {}, media: {} }, cb));
  t.remote("snap:2026-09-21", "snapshot", { id: "2026-09-21", takenAt: 800, topics: { "compsci:4.1.1.1": ["g", "done", 90] }, gov: {}, media: {} }, "800");
  t.sent.length = 0;
  await p(cb => rs.syncCloud(cb));
  const r = await p(cb => rs.getReport("week:2026-09-21", cb));
  assert(r.savedAt === 3000 && r.facts.study.mins === 45, "the facts of the copy saved first");
  assert(r.words.headline === "Mine." && r.words.changedAt === 9000, "the words changed last");
  assert(t.sent.indexOf("week:2026-09-21") !== -1 && t.rows["week:2026-09-21"].data_json.words.headline === "Mine." && t.rows["week:2026-09-21"].data_json.savedAt === 3000,
    "the merged copy goes back up");
  const sn = await p(cb => rs.getSnapshot("2026-09-21", cb));
  assert(sn.takenAt === 800 && sn.topics["compsci:4.1.1.1"], "the snapshot taken first wins");
  assert(t.sent.indexOf("snap:2026-09-21") === -1, "…and is not echoed");
  const m = rs.mergeReport(report("x:1", 10, 1, { changedAt: 5 }), report("x:1", 20, 2, { changedAt: 6, headline: "R" }));
  assert(m.savedAt === 10 && m.words.headline === "R", "mergeReport is the rule");
});

step("E · the migration: owner-only, touched, keyed", async () => {
  const sql = fs.readFileSync(path.join(ROOT, "supabase/migrations/20261012000001_kos_reports.sql"), "utf8");
  assert(/create table public\.kos_reports/.test(sql) && /primary key \(user_id, item_id\)/.test(sql), "the table and its key");
  assert(/enable row level security/.test(sql), "RLS on");
  ["select", "insert", "update", "delete"].forEach(v => assert(new RegExp("kos_reports_" + v + "_own[\\s\\S]*?auth\\.uid\\(\\) = user_id").test(sql), "an owner policy for " + v));
  assert(/kos_touch_updated_at/.test(sql), "server timestamps through the touch trigger");
  assert(/check \(kind in \('report', 'snapshot'\)\)/.test(sql), "the kinds");
});

(async () => {
  const app = await boot();
  let fails = 0;
  for (const [name, fn] of steps) {
    try { await fn(app); console.log("  ok  " + name); }
    catch (e) { fails++; console.log("FAIL  " + name + "\n      " + (e && e.message)); }
  }
  const errs = app.errors.filter(e => !/env\.local\.js/.test(e));
  if (errs.length) { fails++; console.log("FAIL  runtime errors: " + errs.join(" / ")); }
  console.log(fails ? "\nSMOKE72: " + fails + " failure(s)" : "\nSMOKE72: all " + steps.length + " steps passed");
  process.exit(fails ? 1 : 0);
})();
