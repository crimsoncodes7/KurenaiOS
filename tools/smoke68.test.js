/* Kurenai OS — smoke68.test.js
   Reports, phase 1 (roadmap 5.1, docs/reports-plan.md): the history the
   reports will need, collected from the day it ships.

   The claims:

     A · THE JOURNAL RECORDS WHAT MOVED. A local save that changes list
         state appends one event per kind; same-day steps collapse (three +1
         clicks are one 13→16 event, a step taken back cancels out); a save
         that moves nothing appends nothing; VN and Games journal the source
         that moved, never their derived progress; the cap holds.
     B · PULLS JOURNAL, INSERTS DO NOT. A bulkUpsert merge that moves list
         state appends; a no-op pull appends nothing and keeps updatedAt
         (invariant 36a); a first import is silent; enrichment never moves
         the journal.
     C · ANOTHER DEVICE'S HISTORY IS KEPT, NOT RE-DERIVED. A row arriving
         with events this store has never seen (a cloud pull) unions its
         history instead of appending a second account of the same change;
         folding two copies of a title unions both journals.
     D · PROVIDER FACTS. The AniList list and enrichment queries ask for
         tags, country and episode length and keep them in `extra`
         (aniTags: the strongest non-spoiler tags, apart from the personal
         `tags`); VNDB asks for the original language.
     E · EVERY SESSION CARRIES ITS AWARD. sessions.log() writes what the
         Governor paid on the entry itself, including a forfeited zero.
     F · THE ASSISTANT TALLY counts answered requests (a scheduled send
         apart) and the areas their tools touched, never the text.
     G · SNAPSHOTS. The state at the current week/month boundary is
         written once: topic band/status/mastery, the Governor, streaks and
         the Collection's status counts; a second call keeps the first.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke68.test.js                                            */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot, ROOT } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function p(fn) { return new Promise((res, rej) => fn((err, out) => err ? rej(err) : res(out))); }

/* ============ A · the journal ============ */
step("A · a local save journals what moved, collapsing same-day steps", async (app) => {
  const db = app.KOS.mediadb;
  const row = await p(cb => db.add({ module: "anime", title: "Frieren", status: "inProgress",
    progress: { current: 13, total: 28 }, externalIds: { anilistId: 154587 }, syncSource: "anilist" }, cb));
  assert(row.journal.length === 0, "an added row starts with an empty journal");
  let cur = row;
  for (let i = 14; i <= 16; i++) {
    cur = await p(cb => db.put(Object.assign({}, cur, { progress: Object.assign({}, cur.progress, { current: i }) }), cb));
  }
  const ev = cur.journal.filter(e => e[1] === "progress");
  assert(ev.length === 1 && ev[0][2] === 13 && ev[0][3] === 16, "three +1 steps are one 13→16 event, got " + JSON.stringify(cur.journal));
  cur = await p(cb => db.put(Object.assign({}, cur, { status: "completed", score: 9 }), cb));
  const kinds = cur.journal.map(e => e[1]).sort();
  assert(kinds.join() === "progress,score,status", "status and score each journal once, got " + kinds);
  const st = cur.journal.find(e => e[1] === "status");
  assert(st[2] === "inProgress" && st[3] === "completed", "the status event says from → to");
  const before = JSON.stringify(cur.journal);
  cur = await p(cb => db.put(Object.assign({}, cur, { notes: "a note is not list state" }), cb));
  assert(JSON.stringify(cur.journal) === before, "a save that moves no list state appends nothing");
  /* a step taken back the same day cancels out */
  cur = await p(cb => db.put(Object.assign({}, cur, { score: 0 }), cb));
  assert(!cur.journal.some(e => e[1] === "score"), "a score set and cleared the same day leaves no event");
});

step("A · VN and Games journal their source, never derived progress", async (app) => {
  const db = app.KOS.mediadb;
  let vn = await p(cb => db.add({ module: "vn", title: "Steins;Gate", status: "inProgress",
    routes: [{ name: "Kurisu", cleared: false }, { name: "Mayuri", cleared: false }] }, cb));
  vn = await p(cb => db.put(Object.assign({}, vn, { routes: [{ name: "Kurisu", cleared: true }, { name: "Mayuri", cleared: false }] }), cb));
  assert(vn.journal.length === 1 && vn.journal[0][1] === "route" && vn.journal[0][2] === 0 && vn.journal[0][3] === 1,
    "a cleared route is one route event, got " + JSON.stringify(vn.journal));
  let g = await p(cb => db.add({ module: "game", title: "Outer Wilds", status: "inProgress", playtimeHours: 4 }, cb));
  g = await p(cb => db.put(Object.assign({}, g, { playtimeHours: 7.25 }), cb));
  assert(g.journal.length === 1 && g.journal[0][1] === "hours" && g.journal[0][3] === 7.3, "playtime journals as hours (one decimal)");
  assert(!vn.journal.concat(g.journal).some(e => e[1] === "progress"), "no derived progress event");
});

step("A · the journal's pure rules: day collapse, cap, age", async (app) => {
  const db = app.KOS.mediadb, now = app.window.Date.now(), DAY = 864e5;
  let j = db.appendJournal([], [[now - 2 * DAY, "progress", 1, 2]]);
  j = db.appendJournal(j, [[now, "progress", 2, 3]]);
  assert(j.length === 2, "steps on two different days stay two events");
  const many = [];
  for (let i = 0; i < db.JOURNAL_CAP + 50; i++) many.push([now - (300 - i) * 60000, "progress", i, i + 1]);
  assert(db.normJournal(many).length === db.JOURNAL_CAP, "the journal is capped at " + db.JOURNAL_CAP);
  assert(db.normJournal([[now - 500 * DAY, "status", "planned", "inProgress"]]).length === 0, "events past 400 days fall off");
  assert(db.normJournal([[now, "rating", 1, 2], ["x", "status", 1, 2]]).length === 0, "unknown kinds and bad stamps are dropped");
});

/* ============ B · pulls ============ */
step("B · a pull journals what it moved; a no-op pull and an insert are silent", async (app) => {
  const db = app.KOS.mediadb;
  const pulled = (cur, status) => ({ module: "anime", title: "Dungeon Meshi", status: status || "inProgress",
    progress: { current: cur, total: 24 }, externalIds: { anilistId: 153518 }, syncSource: "anilist", lastSyncedAt: app.window.Date.now() });
  await p(cb => db.bulkUpsert([pulled(3)], {}, cb));
  let row = await p(cb => db.getByExternal("anilist", 153518, cb));
  assert(row && row.journal.length === 0, "a first import is silent");
  await p(cb => db.bulkUpsert([pulled(6)], {}, cb));
  row = await p(cb => db.getByExternal("anilist", 153518, cb));
  assert(row.journal.length === 1 && row.journal[0][2] === 3 && row.journal[0][3] === 6, "a pull that moved 3→6 journals it");
  const stamp = row.updatedAt, j = JSON.stringify(row.journal);
  await app.settle();
  await p(cb => db.bulkUpsert([pulled(6)], {}, cb));
  row = await p(cb => db.getByExternal("anilist", 153518, cb));
  assert(JSON.stringify(row.journal) === j, "a no-op pull appends nothing");
  assert(row.updatedAt === stamp, "a no-op pull keeps updatedAt (invariant 36a)");
  await p(cb => db.bulkUpsert([pulled(9, "completed")], { enrichOnly: true }, cb));
  row = await p(cb => db.getByExternal("anilist", 153518, cb));
  assert(JSON.stringify(row.journal) === j, "enrichment never moves the journal");
});

/* ============ C · cloud and folds ============ */
step("C · a row with another device's events unions them instead of re-deriving", async (app) => {
  const db = app.KOS.mediadb, now = app.window.Date.now();
  const row = await p(cb => db.add({ module: "anime", title: "Mushishi", status: "inProgress",
    progress: { current: 2, total: 26 }, externalIds: { anilistId: 457 }, syncSource: "anilist" }, cb));
  const remoteEv = [now - 3600e3, "progress", 2, 5];
  const remote = Object.assign({}, row, { progress: { current: 5, total: 26 }, journal: [remoteEv] });
  const saved = await p(cb => db.put(remote, cb));
  assert(saved.journal.length === 1 && saved.journal[0][0] === remoteEv[0], "the remote account is kept as is, not doubled: " + JSON.stringify(saved.journal));
  const a = Object.assign({}, saved, { journal: [[now - 9e6, "status", "planned", "inProgress"]] });
  const merged = app.KOS.media.mergeRows([saved, a]);
  assert(merged.journal.length === 2, "folding two copies unions both journals");
});

/* ============ D · provider facts ============ */
step("D · AniList asks for tags, country and length; VNDB for the language", async (app) => {
  const src = fs.readFileSync(path.join(ROOT, "js/core/anilist.js"), "utf8");
  const n = (src.match(/countryOfOrigin duration tags \{ name rank isMediaSpoiler \}/g) || []).length;
  assert(n === 2, "both the list and the enrichment query carry the new fields (" + n + ")");
  const vsrc = fs.readFileSync(path.join(ROOT, "js/core/vndb.js"), "utf8");
  assert(/VN_FIELDS = "id, title, alttitle, olang,/.test(vsrc) && /olang: vn\.olang/.test(vsrc), "VNDB asks for olang and keeps it");
  /* the mapper, through a stubbed pull */
  const KOS = app.KOS, w = app.window;
  const media = { id: 1, idMal: 2, title: { english: "Frieren" }, genres: ["Adventure"], format: "TV", episodes: 28,
    countryOfOrigin: "JP", duration: 24,
    tags: [{ name: "Travel", rank: 96, isMediaSpoiler: false }, { name: "Time Skip", rank: 82, isMediaSpoiler: true },
      { name: "Elf", rank: 91, isMediaSpoiler: false }, { name: "Rural", rank: 40, isMediaSpoiler: false }] };
  const realFetch = w.fetch;
  w.fetch = () => Promise.resolve({ ok: true, status: 200, headers: { get: () => null },
    json: () => Promise.resolve({ data: { MediaListCollection: { lists: [{ name: "Watching", status: "CURRENT", isCustomList: false,
      entries: [{ id: 9, status: "CURRENT", score: 0, progress: 3, media: media }] }] } } }) });
  const rows = await p(cb => KOS.anilist.syncList("t", 1, "anime", cb));
  w.fetch = realFetch;
  const x = rows[0].extra;
  assert(JSON.stringify(x.aniTags) === '["Travel","Elf"]', "aniTags: strongest non-spoiler, rank ≥ 60, got " + JSON.stringify(x.aniTags));
  assert(x.country === "JP" && x.duration === 24, "country and episode length ride in extra");
  assert(rows[0].tags == null || rows[0].tags.length === 0, "the personal tags are untouched");
});

/* ============ E · the award on the entry ============ */
step("E · every session entry carries what it paid", async (app) => {
  const KOS = app.KOS;
  const e1 = KOS.sessions.log({ type: "quiz", subject: "compsci", ref: "4.1.1.1", metrics: { correct: 9, total: 10, pct: 90 } });
  const paid = KOS.governor.lastAward();
  assert(e1.award && e1.award.xp === paid.xp && e1.award.gold === paid.gold && e1.award.xp > 0, "a quiz entry carries its award " + JSON.stringify(e1.award));
  const e2 = KOS.sessions.log({ type: "focus", subject: "compsci", dur: 300,
    metrics: { complete: false, rule: "blocks", mode: "custom", secs: 300, mins: 5 } });
  assert(e2.award && e2.award.xp === 0 && e2.award.gold === 0, "a session that paid nothing says so");
  const stored = KOS.store.state.sessions.find(e => e.id === e1.id);
  assert(stored.award && stored.award.xp === e1.award.xp, "the award is on the stored ledger entry");
});

/* ============ F · the Assistant tally ============ */
step("F · the tally counts requests and areas, never text", async (app) => {
  const KOS = app.KOS;
  const src = fs.readFileSync(path.join(ROOT, "js/core/aiorchestrator.js"), "utf8");
  assert(/if \(status === "complete"\) tallyRequest\(req\)/.test(src), "finish() tallies a completed request");
  /* drive tallyRequest through a stubbed provider turn */
  const toolName = "study_list_subjects";
  let turn = 0;
  const realChat = KOS.ai.chat;
  KOS.ai.chat = (cat, opts, cb) => {
    turn++;
    if (turn === 1) cb(null, { text: "", toolCalls: [{ id: "c1", name: toolName, args: {} }], provider: "stub", model: "stub" });
    else cb(null, { text: "Here is your study summary.", toolCalls: [], provider: "stub", model: "stub" });
  };
  await new Promise(res => KOS.ai.orchestrator.send({ userText: "How is my study going?", category: "complex" },
    { onDone: res, onError: res }));
  await app.settle();
  KOS.ai.chat = realChat;
  const day = KOS.srs.todayISO();
  const t = (KOS.store.state.assistant.tally || {})[day];
  assert(t && t.c === 1, "one answered chat is counted: " + JSON.stringify(t));
  assert(t.a && t.a.study === 1, "the study area is counted once");
  assert(!/How is my study/.test(JSON.stringify(KOS.store.state.assistant.tally)), "no text is kept");
});

/* ============ G · snapshots ============ */
step("G · the boundary snapshot is written once", async (app) => {
  const KOS = app.KOS, rs = KOS.reportStore;
  assert(rs.boundary(new app.window.Date(2026, 8, 24)) === "2026-09-21", "a Thursday's boundary is its Monday");
  assert(rs.boundary(new app.window.Date(2026, 9, 2)) === "2026-10-01", "early October's boundary is the 1st (later than Monday 28 Sep)");
  KOS.store.getProgress("compsci", "4.1.1.1").status = "started";
  KOS.store.save();
  const snap = await p(cb => rs.ensureSnapshot(cb));
  assert(snap && snap.id === rs.boundary(), "a snapshot is taken for the current boundary");
  assert(snap.topics["compsci:4.1.1.1"] && snap.topics["compsci:4.1.1.1"][1] === "started", "topic status is recorded");
  assert(snap.gov && typeof snap.gov.xp === "number" && snap.gov.level >= 1, "the Governor is recorded");
  assert(snap.media.anime && snap.media.anime.inProgress >= 1, "Collection status counts are recorded");
  assert(snap.streaks && "all" in snap.streaks, "streaks are recorded");
  const again = await p(cb => rs.ensureSnapshot(cb));
  assert(again === null, "a second call keeps the first snapshot");
  const all = await p(cb => rs.snapshots(cb));
  assert(all.length === 1 && all[0].takenAt === snap.takenAt, "one snapshot per boundary");
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
  console.log(fails ? "\nSMOKE68: " + fails + " failure(s)" : "\nSMOKE68: all " + steps.length + " steps passed");
  process.exit(fails ? 1 : 0);
})();
