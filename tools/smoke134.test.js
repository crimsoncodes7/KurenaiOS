/* Kurenai OS — smoke134.test.js
   Data out of the synced state document, and the Storage page's meter
   (quality W1, RC5; DI-10, DI-18, DI-25).

     A · THE MOVE: a state holding an avatar and a banner as data URLs →
         the automatic repair "profile-pictures-to-files" (a verified
         checkpoint first) leaves only references in the state, the file
         store holds the identical bytes under `profile:` origins, and the
         renderers draw the picture. The Files page does not list them.
     B · IDEMPOTENT: running the repair again changes nothing.
     C · A FAILED FILE WRITE leaves the state exactly as it was.
     D · A PULLED REFERENCE WITHOUT ITS FILE draws the painted default and
         keeps the reference.
     E · THE SESSION ARCHIVE: an entry trimmed past the 2,000 cap is kept in
         kurenai-os-ledger, and survives a full backup round trip; the merge
         cap's drops are found too.
     F · DI-18: Creatives' database takes the data namespace's suffix (the
         real account's name unchanged), and every indexedDB.open in js/
         carries the suffix.
     G · DI-25: mined Japanese lines move to this device's store and are
         never in the cloud-syncable document.
     H · THE STORAGE PAGE shows the state meter and its biggest parts, and
         drawing it writes nothing.

   Run: node tools/smoke134.test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot, ROOT } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, JBlob;
async function wait(promise) {
  let done = false, val, err;
  promise.then((v) => { done = true; val = v; }, (e) => { done = true; err = e; });
  for (let i = 0; i < 2000 && !done; i++) await app.settle();
  if (!done) throw new Error("a promise never settled");
  if (err) throw err;
  return val;
}
const cbp = (fn) => wait(new Promise((res, rej) => fn((e, v) => (e ? rej(e) : res(v)))));
const b64 = (bytes) => Buffer.from(bytes).toString("base64");
const AV_BYTES = [137, 80, 78, 71, 13, 10, 26, 10, 1, 2, 3, 4, 5];
const BN_BYTES = [255, 216, 255, 224, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
const AV = "data:image/png;base64," + b64(AV_BYTES);
const BN = "data:image/jpeg;base64," + b64(BN_BYTES);
const G = () => K.store.state.governor;
const profileRecs = async () => (await cbp((cb) => K.attach.listMeta(cb))).filter((m) => /^profile:/.test(m.origin || ""));
async function bytesOf(fileId) {
  const rec = await cbp((cb) => K.attach.getByFileId(fileId, cb));
  assert(rec && rec.blob, "a record with its picture for " + fileId);
  return Array.from(new Uint8Array(await rec.blob.arrayBuffer()));
}
const REPAIR = "profile-pictures-to-files";

step("boot", async () => {
  app = await boot();
  K = app.KOS;
  /* a Blob that survives fake-indexeddb's structured clone with its bytes
     (jsdom's does not), as a browser's does */
  JBlob = app.window.Blob;
  app.window.Blob = Blob;
  await app.settle();
  assert(K.profilePics && K.ledgerArchive && K.jaMined && K.repairs, "the RC5 modules load");
});

step("A · the move: references in the state, identical bytes in the file store, the picture drawn", async () => {
  const g = G();
  g.avatar = { kind: "custom", id: "seal-ember", img: AV, crop: { x: 40, y: 60, zoom: 1.2 }, frame: null };
  g.banner = "custom"; g.bannerImg = BN; g.bannerCrop = { x: 30, y: 50, zoom: 1 };
  K.store.save();
  const pv = await wait(K.repairs.preview(REPAIR));
  assert(pv.needed, "the move is due");
  eq(pv.summary.pictures, 2, "two pictures to move");
  const before = (await wait(K.backup.list())).length;
  const r = await wait(K.repairs.run(REPAIR));
  assert(r.ok, "the repair ran: " + JSON.stringify(r));
  assert((await wait(K.backup.list())).length === before + 1, "a verified checkpoint was taken first");
  eq(g.avatar.img, null, "no data URL left in the avatar");
  eq(g.bannerImg, null, "no data URL left in the banner");
  assert(typeof g.avatar.file === "string" && g.avatar.file, "the avatar's reference");
  assert(typeof g.bannerFile === "string" && g.bannerFile, "the banner's reference");
  eq(g.avatar.crop, { x: 40, y: 60, zoom: 1.2 }, "the crop kept");
  eq(JSON.stringify(K.store.state).indexOf("data:image"), -1, "no picture anywhere in the state");
  eq(await bytesOf(g.avatar.file), AV_BYTES, "the avatar's bytes");
  eq(await bytesOf(g.bannerFile), BN_BYTES, "the banner's bytes");
  const recs = await profileRecs();
  eq(recs.map((m) => m.origin).sort(), ["profile:avatar", "profile:banner"], "two profile records");
  /* the renderers */
  await wait(K.profilePics.load("avatar"));
  await wait(K.profilePics.load("banner"));
  const url = K.profilePics.src("avatar");
  assert(url && /^blob:/.test(url), "the avatar resolves to an object URL");
  const node = K.governor.avatarNode(64);
  assert(node.querySelector("img[src^='blob:']"), "the avatar draws the picture");
  assert(/url\("blob:/.test(K.governor.bannerCss() || ""), "the banner's CSS carries the picture");
  const host = app.document.createElement("div");
  assert(K.governor.applyBanner(host) !== false, "applyBanner hangs it");
  /* not library clutter */
  await wait(new Promise((res) => K.files.refresh(res)));
  assert(!K.files.all().some((f) => /^Profile (picture|banner)/.test(f.name || "")), "the Files page does not list them");
});

step("B · running the repair again changes nothing", async () => {
  const snap = JSON.stringify(G());
  const n = (await profileRecs()).length;
  const pv = await wait(K.repairs.preview(REPAIR));
  assert(!pv.needed, "nothing is due");
  const r = await wait(K.repairs.run(REPAIR));
  assert(r.ok && r.noop, "a no-op: " + JSON.stringify(r));
  eq(JSON.stringify(G()), snap, "the state unchanged");
  eq((await profileRecs()).length, n, "no new records");
});

step("C · a failed file write leaves the state unchanged", async () => {
  const g = G(), NEW = "data:image/png;base64," + b64([137, 80, 78, 71, 42, 42, 42]);
  g.avatar.img = NEW;   /* an older device's new upload, pulled */
  K.store.save();
  const snap = JSON.stringify(K.store.state.governor);
  const n = (await profileRecs()).length;
  const add = K.attach.add;
  K.attach.add = function (sid, ref, file, cb) { cb(new Error("disk full")); };
  let r;
  try { r = await wait(K.repairs.run(REPAIR)); } catch (e) { r = { ok: false, reason: e.message }; }
  K.attach.add = add;
  assert(!r.ok, "the run failed");
  eq(JSON.stringify(K.store.state.governor), snap, "the state is exactly as it was");
  eq((await profileRecs()).length, n, "nothing new left in the file store");
  /* and once the store works it moves (the newer picture wins; the old record goes) */
  const old = g.avatar.file;
  const r2 = await wait(K.repairs.run(REPAIR));
  assert(r2.ok, "moved on the next run");
  eq(g.avatar.img, null, "moved");
  assert(g.avatar.file !== old, "a new reference");
  eq(await bytesOf(g.avatar.file), [137, 80, 78, 71, 42, 42, 42], "the newer picture");
  eq((await profileRecs()).length, n, "the superseded record released");
});

step("D · a pulled reference without its file: the painted default, the reference kept", async () => {
  const g = G();
  g.avatar.file = "profile-avatar-not-here-yet"; g.bannerFile = "profile-banner-not-here-yet";
  const node = K.governor.avatarNode(64);
  await app.settle();
  assert(!node.querySelector("img"), "no broken image");
  assert(node.querySelector("svg"), "the seal stands in");
  eq(K.governor.bannerCss(), null, "no banner CSS");
  eq(K.governor.applyBanner(app.document.createElement("div")), false, "nothing hung");
  await wait(K.profilePics.load("avatar"));
  for (let i = 0; i < 5; i++) await app.settle();
  eq(g.avatar.file, "profile-avatar-not-here-yet", "the avatar's reference kept");
  eq(g.bannerFile, "profile-banner-not-here-yet", "the banner's reference kept");
  eq(g.avatar.kind, "custom", "still your own picture");
});

step("E · the session archive keeps what the cap trims, through a full backup", async () => {
  const st = K.store.state, base = Date.parse("2026-01-01T10:00:00");
  st.sessions = [];
  for (let i = 0; i < 2000; i++) st.sessions.push({ id: 50000 + i, ts: base + i * 60000, date: "2026-01-01", type: "todo", metrics: {}, award: { xp: 0, gold: 0 } });
  const oldest = st.sessions[0];
  K.sessions.log({ type: "todo", metrics: { item: "one more" } });
  for (let i = 0; i < 5; i++) await app.settle();
  eq(st.sessions.length, 2000, "the ledger keeps 2,000");
  assert(!st.sessions.some((e) => e.id === oldest.id), "the oldest left the ledger");
  let rows = await wait(K.ledgerArchive.all());
  assert(rows.some((e) => e.id === oldest.id && e.ts === oldest.ts), "... and is in the archive");
  /* the merge cap's drops */
  const gone = K.ledgerArchive.capped([{ id: 1, ts: 10 }, { id: 2, ts: 20 }, { id: 3, ts: 30 }], [{ id: 2, ts: 20 }, { id: 3, ts: 30 }]);
  eq(gone.map((e) => e.id), [1], "capped() finds the one the cap dropped");
  /* a full backup round trip */
  const snap = await cbp((cb) => K.store.snapshotFull(cb));
  assert(Array.isArray(snap.ledger) && snap.ledger.some((e) => e.id === oldest.id), "the backup carries the archive");
  await cbp((cb) => K.ledgerArchive.importAll([], cb));
  eq(await wait(K.ledgerArchive.count()), 0, "archive emptied");
  const file = new JBlob([JSON.stringify(snap)], { type: "application/json" });
  const rep = await cbp((cb) => K.store.importFull(file, cb));
  assert(rep.restoredSections.some((s) => /older sessions/.test(s)), "the restore names it: " + JSON.stringify(rep));
  rows = await wait(K.ledgerArchive.all());
  assert(rows.some((e) => e.id === oldest.id), "the archived entry is back");
  assert(K.backup.PARTS.indexOf("ledger") >= 0 && K.backup.PARTS.indexOf("jaMined") >= 0, "checkpoints verify the new parts");
});

step("F · DI-18: Creatives takes the suffix; every indexedDB.open in js/ carries it", async () => {
  eq(K.creatives.files.name, "kurenai-os-creatives", "the real account's name is unchanged");
  const empty = await boot({ storage: { "kurenai-os-data-mode": "empty" } });
  eq(empty.KOS.dataMode.suffix, "-empty", "the Empty namespace");
  eq(empty.KOS.creatives.files.name, "kurenai-os-creatives-empty", "Creatives in the Empty namespace");
  eq(empty.KOS.jaMined.name, "kurenai-os-ja-mined-empty", "the mined lines too");
  eq(empty.KOS.ledgerArchive.name, "kurenai-os-ledger-empty", "and the ledger archive");
  /* the static scan: the name every indexedDB.open uses is defined with the suffix */
  const EXCEPTIONS = {};   /* none: kurenai-os-backups is suffixed like the rest */
  const files = [];
  (function walk(d) {
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const p = path.join(d, e.name);
      if (e.isDirectory()) walk(p); else if (/\.js$/.test(e.name)) files.push(p);
    });
  })(path.join(ROOT, "js"));
  let opens = 0;
  files.forEach((f) => {
    const src = fs.readFileSync(f, "utf8"), rel = path.relative(ROOT, f);
    for (const m of src.matchAll(/indexedDB\.open\(\s*([A-Za-z_$][\w$]*)/g)) {
      opens++;
      const v = m[1];
      if (EXCEPTIONS[rel + ":" + v]) continue;
      const def = new RegExp("\\b" + v.replace(/\$/g, "\\$") + "\\s*=\\s*\"kurenai-os-[^\"]+\"\\s*\\+\\s*\\(\\(KOS\\.dataMode && KOS\\.dataMode\\.suffix\\) \\|\\| \"\"\\)");
      assert(def.test(src), rel + ": " + v + " is opened without the data namespace's suffix");
    }
    assert(!/indexedDB\.open\(\s*["']/.test(src), path.relative(ROOT, f) + " opens a literal database name");
  });
  assert(opens >= 12, "the scan found the stores (" + opens + ")");
});

step("G · DI-25: mined lines on this device only, never in the syncable state", async () => {
  const st = K.store.state;
  assert(!("mined" in st.japanese) || !Object.keys(st.japanese.mined || {}).length, "no mined map planted by the defaults");
  st.japanese.mined = { mabc: { text: "猫が好きです。", reading: "ねこがすきです。", en: "I like cats.", src: { kind: "anime", title: "A show" }, at: 1700000000000 } };
  K.store.save();
  let doc = K.cloudsync._syncableState(st);
  assert(!(doc.japanese && "mined" in doc.japanese), "an older copy's lines are not pushed");
  const r = await wait(K.repairs.run(K.jaMined.REPAIR));
  assert(r.ok, "the move ran: " + JSON.stringify(r));
  assert(!("mined" in st.japanese), "the state no longer holds them");
  const rows = await wait(K.jaMined.all());
  eq(rows.map((l) => [l.id, l.text, l.at]), [["mabc", "猫が好きです。", 1700000000000]], "the line in this device's store");
  const r2 = await wait(K.repairs.run(K.jaMined.REPAIR));
  assert(r2.ok && r2.noop, "a second run changes nothing");
  /* a new line goes to the store; its facet (no text) to the state */
  const id = K.ja.mine({ text: "犬もいい。", src: { kind: "manga" } });
  for (let i = 0; i < 5; i++) await app.settle();
  assert(K.jaMined.has(id), "kept on this device");
  doc = K.cloudsync._syncableState(st);
  const text = JSON.stringify(doc);
  assert(text.indexOf("犬もいい") < 0 && text.indexOf("猫が好き") < 0, "no mined text in the syncable state");
  assert(Object.keys(K.store.state.japanese.facets).some((f) => f.indexOf("x:" + id + "|") === 0), "its facet is in the state");
  const snap = await cbp((cb) => K.store.snapshotFull(cb));
  eq((snap.jaMined || []).length, 2, "both lines ride the full backup");
});

step("H · the Storage page: the state meter, its parts, and nothing written", async () => {
  K.show("storage");
  for (let i = 0; i < 10; i++) await app.settle();
  /* navigating records the view (state.ui); a REDRAW of the page must write nothing */
  const before = JSON.stringify(K.store.state);
  K.rerender();
  for (let i = 0; i < 10; i++) await app.settle();
  const card = app.document.querySelector("[data-ui~='storage.state']");
  assert(card, "the state card");
  assert(card.querySelector("[data-ui~='storage.state-meter'][role='img']"), "the meter");
  assert(/KB|MB/.test(card.querySelector("[data-ui~='storage.state-size']").textContent), "the size");
  assert(card.querySelectorAll(".k-st-row").length >= 3, "the biggest parts listed");
  eq(JSON.stringify(K.store.state), before, "drawing the page wrote nothing");
  const M = K.storageMeter.measure({ a: "x".repeat(10), b: "y".repeat(100) });
  eq(M.parts.map((p) => p.key), ["b", "a"], "parts biggest first");
  const big = K.storageMeter.measure({ s: "z".repeat(Math.ceil(K.storageMeter.QUOTA * 0.61)) });
  assert(100 * big.bytes / big.quota >= K.storageMeter.WARN, "a 61% document is over the warning line");
  eq(app.errors, [], "no page errors");
});

/* ---------------- RC5 review: the picture store's edges ---------------- */
const NEW2 = "data:image/png;base64," + b64([137, 80, 78, 71, 7, 7, 7, 7, 7]);
const avatarRecs = async () => (await profileRecs()).filter((m) => m.origin === "profile:avatar");
step("I · a fresh device: a record that arrived without its picture takes this device's bytes", async () => {
  app = await boot();
  K = app.KOS;
  app.window.Blob = Blob;
  await app.settle();
  const g = G();
  g.avatar = { kind: "custom", id: "seal-ember", img: AV, crop: null, frame: null };
  K.store.save();
  assert(K.profilePics._contentId, "the content id is exposed for tests");
  const fid = await wait(K.profilePics._contentId("avatar", AV));
  /* another device moved the same picture: its metadata is here, its binary is not */
  await cbp((cb) => K.attach.putRemoteMeta({ fileId: fid, subject: "_", ref: "_", name: "Profile picture.png", mime: "image/png", size: AV_BYTES.length, origin: "profile:avatar" }, cb));
  const before = (await wait(K.backup.list())).length;
  const r = await wait(K.repairs.run(REPAIR));
  assert(r.ok, "the move ran instead of refusing the id: " + JSON.stringify(r.reason || null));
  eq([g.avatar.img, g.avatar.file], [null, fid], "the reference is that record");
  eq(await bytesOf(fid), AV_BYTES, "which now holds the picture");
  eq((await avatarRecs()).length, 1, "one record, not two");
  eq((await wait(K.backup.list())).length, before + 1, "one checkpoint");
});

step("J · the file id is the picture's BYTES: two spellings of one data URL make one record", async () => {
  const spaced = AV.replace(/^(data:image\/png;base64,.{4})/, "$1\n");
  assert(spaced !== AV, "a second spelling");
  eq(await wait(K.profilePics._contentId("avatar", spaced)), await wait(K.profilePics._contentId("avatar", AV)), "the same id");
  assert((await wait(K.profilePics._contentId("avatar", BN))) !== (await wait(K.profilePics._contentId("avatar", AV))), "another picture, another id");
});

step("K · an upload that finishes after the state object was replaced still sets the reference", async () => {
  const g0 = K.store.state.governor, add = K.attach.add;
  /* a cloud pull or a tab merge lands while the file is being written */
  K.attach.add = function () { K.store.replaceState(JSON.parse(JSON.stringify(K.store.state))); return add.apply(this, arguments); };
  const out = await wait(K.profilePics.write("avatar", NEW2));
  K.attach.add = add;
  const g = K.store.state.governor;
  assert(g !== g0, "the governor object was replaced meanwhile");
  eq([g.avatar.img, g.avatar.file], [null, out.fileId], "the LIVE state holds the reference, no inline copy");
  eq(await bytesOf(g.avatar.file), [137, 80, 78, 71, 7, 7, 7, 7, 7], "the new picture");
  eq((await avatarRecs()).length, 1, "and the picture it replaced was released");
});

const DAY = 86400000;
async function orphan(fileId, daysOld, bytes) {
  await cbp((cb) => K.attach.add("_", "_", new Blob([new Uint8Array(bytes)], { type: "image/png" }), cb,
    { origin: "profile:avatar", kind: "photo", fresh: true, fileId, name: "Profile picture.png" }));
  await cbp((cb) => K.attach.updateFile(fileId, (rec) => { rec.added = app.window.Date.now() - daysOld * DAY; }, cb));
}
step("L · a profile record nothing references is released after a grace period; a recent one is left", async () => {
  await orphan("profile-avatar-lost-conflict", 10, [1, 2, 3]);
  await orphan("profile-avatar-just-made", 1, [4, 5, 6]);
  const cur = G().avatar.file;
  assert(K.profilePics.sweep, "KOS.profilePics.sweep exists");
  eq(await wait(K.profilePics.sweep()), 1, "one orphan released");
  eq((await avatarRecs()).map((m) => m.fileId).sort(), [cur, "profile-avatar-just-made"].sort(), "the old orphan went; the picture in use and the recent record stay");
});

step("M · a profile record another place links to is kept, and no list names profile records", async () => {
  const cur = G().avatar.file;
  eq((await cbp((cb) => K.attach.list("_", "_", cb))).length, 0, "KOS.attach.list never returns a profile record");
  /* an older-version device linked a topic onto the same bytes */
  await cbp((cb) => K.attach.addLink(cur, { kind: "topic", id: "compsci:4.1.1" }, cb));
  const g = G();
  g.avatar = { kind: "seal", id: "seal-ember", img: null, crop: null, frame: null };
  K.store.save();
  await wait(K.profilePics.release(cur));
  const rec = await cbp((cb) => K.attach.getByFileId(cur, cb));
  assert(rec && rec.blob, "the topic's file was not deleted with the avatar");
  assert(!K.profilePics.isProfile(rec.origin), "it is an ordinary file now: " + rec.origin);
  eq((await cbp((cb) => K.attach.list("compsci", "4.1.1", cb))).map((r) => r.fileId), [cur], "still on its topic");
});

step("N · a mined line that could not be stored leaves no facet; a line already here is never overwritten", async () => {
  const put = K.jaMined.put, toasts = [];
  const toast = K.ui.toast;
  K.ui.toast = (m) => { toasts.push(m); };
  K.jaMined.put = () => Promise.reject(new Error("QuotaExceededError"));
  const id = K.ja.mine({ text: "保存できない。", src: { kind: "anime" } });
  for (let i = 0; i < 8; i++) await app.settle();
  const facet = () => Object.keys(K.store.state.japanese.facets).some((f) => f.indexOf("x:" + id + "|") === 0);
  assert(!facet(), "no facet for a line that exists nowhere");
  assert(toasts.some((m) => /could not be saved/i.test(m)), "and the user is told: " + JSON.stringify(toasts));
  K.jaMined.put = put; K.ui.toast = toast;
  K.ja.mine({ text: "保存できない。", reading: "ほぞんできない。", src: { kind: "anime" } });
  for (let i = 0; i < 8; i++) await app.settle();
  assert(facet() && K.jaMined.has(id), "stored the second time, with its facet");
  const first = (await wait(K.jaMined.all())).filter((l) => l.id === id)[0];
  /* mined again in the first moments of a later start, before the store has loaded */
  await wait(K.jaMined.put({ id, text: "保存できない。", en: "It cannot be saved.", at: first.at + 99999 }));
  const again = (await wait(K.jaMined.all())).filter((l) => l.id === id)[0];
  eq([again.at, again.reading, again.en], [first.at, "ほぞんできない。", "It cannot be saved."], "its first date and reading stay; the translation it lacked is added");
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ✓ " + name); }
    catch (e) { failed++; console.log("  ✗ " + name + "\n      " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n      ") : e)); }
  }
  console.log(failed ? `\nsmoke134: ${failed} FAILED` : "\nsmoke134: all passed");
  process.exit(failed ? 1 : 0);
})();
