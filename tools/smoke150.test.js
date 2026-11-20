/* Kurenai OS — smoke150.test.js
   The backup file written and read in pieces (W1, DI-09's second half).

     A · the file: one JSON document an older copy reads whole, laid out as
         its first line (everything but the files) and one line per stored
         file; every part as `snapshotFull` has it; each file's record as the
         one-document backup writes it.
     A2 · files byte for byte, across the slices they are read in, through
         write and restore (the test's IndexedDB keeps no real bytes, so the
         file store's two ends are given real ones here).
     B · no file is ever one string: base64 is made a slice at a time, and
         nothing JSON writes is the size of a file.
     C · restore: wipe, restore, every file and every part back; a backup
         with no files leaves the files here alone; the old one-document
         layout restores as it always did.
     D · a part that cannot be read is named in the file, in the export's
         answer and in the restore's report — never a backup that is not
         made; a file the browser cannot read rides by its record.
     E · a checkpoint is still all or nothing.
     F · Backup & Restore: the confirm reads only the first line, and the
         export names what it left out.
     G · no errors, no request.

   Run: node tools/smoke150.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const { seedAccount } = require("./lib/seed");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, w, F;
async function wait(promise) {
  let done = false, val, err;
  promise.then((v) => { done = true; val = v; }, (e) => { done = true; err = e; });
  for (let i = 0; i < 4000 && !done; i++) await app.settle();
  if (!done) throw new Error("a promise never settled");
  if (err) throw err;
  return val;
}
const cb = (fn) => wait(new Promise((res, rej) => fn((e, v) => e ? rej(e) : res(v))));
const text = (blob) => wait(blob.text ? blob.text() : new Promise((res) => { const r = new w.FileReader(); r.onload = () => res(r.result); r.readAsText(blob); }));
/* deterministic bytes: every value 0–255 appears, so base64's every symbol is used */
function pattern(n, seed) { const u = new Uint8Array(n); let x = seed || 7; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) >>> 0; u[i] = (x >>> 16) & 255; } return u; }
const SIZES = [{ name: "notes.pdf", n: 7 * 1024 * 1024 + 5, type: "application/pdf" }, { name: "scan.png", n: 3 * 1024 * 1024, type: "image/png" },
  { name: "tiny.txt", n: 1, type: "text/plain" }, { name: "empty.txt", n: 0, type: "text/plain" }];
const want = {};
const write = () => cb((c) => F.write(c));
const restore = (blob) => cb((c) => K.store.importFull(blob, c));
const stored = () => cb((c) => K.attach.exportAll(c));
const snap = (opts) => cb((c) => K.store.snapshotFull(c, opts));

step("boot, seed, store four files (one larger than two read slices)", async () => {
  app = await boot();
  K = app.KOS; w = app.window; F = K.backupFile;
  await seedAccount(app);
  await app.settle();
  assert(F && K.attach.exportEach && K.attach.importOne, "the writer and the file store's one-at-a-time calls");
  for (const f of SIZES) {
    const u = pattern(f.n, f.n + 3);
    want[f.name] = u;
    await cb((c) => K.attach.add("compsci", "4.1.1", new w.File([u], f.name, { type: f.type }), c));
  }
  eq((await stored()).length, 4, "four files stored");
  assert(F._sizes.SLICE < SIZES[0].n / 2, "the big file spans more than two slices");
});

let out, raw;
step("A · the file: one JSON document, a first line and a line per file", async () => {
  out = await write();
  eq([out.files, out.missing, out.unreadable], [4, [], []], "four files, nothing left out");
  raw = await text(out.blob);
  assert(raw.indexOf(F.PREFIX) === 0, "it starts with the layout's own prefix");
  const lines = raw.split("\n");
  eq(lines.length, 4 + 3, "the first line, four files, the close and a final newline");
  eq([lines[5], lines[6]], ["]}", ""], "it ends with the list's close");
  assert(lines.slice(2, 5).every((l) => l[0] === ","), "each later file line starts with its comma");
  const whole = JSON.parse(raw);
  const s = await snap();
  ["state", "mediaEntries", "mediaKV", "money", "reviews", "mind", "ink", "creatives", "reports"].forEach((p) =>
    eq(K.backup.canon(whole[p]), K.backup.canon(s[p]), "part " + p + " as snapshotFull has it"));
  eq(whole.attachments.map((a) => a.name).sort(), SIZES.map((f) => f.name).sort(), "every file is in it");
  const old = s.attachments.slice().sort((a, b) => a.id < b.id ? -1 : 1), mine = whole.attachments.slice().sort((a, b) => a.id < b.id ? -1 : 1);
  old.forEach((a, i) => {
    const b = mine[i];
    Object.keys(a).filter((k) => k !== "blobBase64" && k !== "unreadable").forEach((k) => eq(b[k], a[k], a.name + "'s " + k + " as the one-document backup writes it"));
  });
  eq(whole.kos_backup_version, 2, "still version 2");
});

/* the file store's two ends with real bytes: what the writer is handed and what the restore puts */
function realStore() {
  const ex = K.attach.exportEach, b = K.attach.importBegin, one = K.attach.importOne, put = [];
  K.attach.exportEach = (onItem, done) => ex((meta, blob, next) => onItem(meta, new w.Blob([want[meta.name]], { type: meta.mime }), next), done);
  K.attach.importBegin = (c) => { put.length = 0; c(null); };
  K.attach.importOne = (item, c) => { put.push(item); c(null); };
  return { put, undo() { K.attach.exportEach = ex; K.attach.importBegin = b; K.attach.importOne = one; } };
}
function decode(dataUrl) { const b = Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64"); return b; }

step("A2 · files byte for byte, through write and restore", async () => {
  const rs = realStore();
  try {
    const o = await write();
    const r = await restore(o.blob);
    assert(r.restoredSections.some((x) => /attachments \(4 files\)/.test(x)), "four files restored: " + r.restoredSections.join(" · "));
    eq(rs.put.map((i) => i.name).sort(), SIZES.map((f) => f.name).sort(), "every file reached the store, one at a time");
    rs.put.forEach((i) => {
      const f = SIZES.find((x) => x.name === i.name);
      assert(i.blobBase64.indexOf("data:" + f.type + ";base64,") === 0, i.name + " carries its type");
      assert(Buffer.compare(decode(i.blobBase64), Buffer.from(want[i.name])) === 0, i.name + " is byte for byte the same (" + f.n + " bytes)");
    });
    /* the same bytes as the one-document writer would make */
    const one = rs.put.find((i) => i.name === "tiny.txt");
    eq(one.blobBase64, "data:text/plain;base64," + Buffer.from(want["tiny.txt"]).toString("base64"), "one byte, exactly");
  } finally { rs.undo(); }
});

step("B · no file is ever one string", async () => {
  const bt = w.btoa, js = w.JSON.stringify;
  let maxIn = 0, maxJson = 0;
  w.btoa = (x) => { maxIn = Math.max(maxIn, x.length); return bt(x); };
  w.JSON.stringify = function () { const r = js.apply(this, arguments); if (typeof r === "string") maxJson = Math.max(maxJson, r.length); return r; };
  const rs = realStore();
  try { await write(); } finally { w.btoa = bt; w.JSON.stringify = js; rs.undo(); }
  assert(maxIn > 0 && maxIn <= 30000, "base64 is made 30,000 bytes at a time: " + maxIn);
  assert(maxJson < SIZES[0].n / 4, "nothing JSON writes is near a file's size: " + maxJson);
});

step("C · restore: every file and every part back", async () => {
  const before = await snap();
  /* wipe what a restore replaces */
  await cb((c) => K.attach.importAll([], c));
  await cb((c) => K.attach.importBegin(c));
  eq((await stored()).length, 0, "no files");
  K.store.state.sessions.splice(0, 5);
  const report = await restore(out.blob);
  assert(report.restoredSections.some((x) => /attachments \(4 files\)/.test(x)), "the report counts the files: " + report.restoredSections.join(" · "));
  eq(report.missingSections, [], "nothing missing");
  const back = await stored();
  eq(back.map((a) => [a.name, a.size, a.subject, a.ref]).sort(), SIZES.map((f) => [f.name, f.n, "compsci", "4.1.1"]).sort(), "every file's record is back");
  const after = await snap();
  ["mediaEntries", "money", "reviews", "ink", "creatives", "reports"].forEach((p) => eq(K.backup.canon(after[p]), K.backup.canon(before[p]), "part " + p + " back"));
  eq(K.store.state.sessions.length, before.state.sessions.length, "the state is the backup's");
  /* a backup that holds its files, even none, is the whole truth about
     them (DI-24, 18 November 2026: it used to leave this device's files) */
  const noFiles = new w.Blob([raw.split("\n")[0] + "\n]}\n"], { type: "application/json" });
  const r2 = await restore(noFiles);
  eq([(await stored()).length, r2.missingSections], [0, []], "a backup with no files replaces them: none");
  assert(r2.restoredSections.some((x) => /none in this backup/.test(x)), "and says so: " + r2.restoredSections.join(" · "));
  /* the old layout restores as it always did */
  const one = new w.Blob([JSON.stringify(before)], { type: "application/json" });
  await cb((c) => K.attach.importBegin(c));
  const r3 = await restore(one);
  assert(r3.restoredSections.some((x) => /attachments \(4 files\)/.test(x)), "the one-document file restores its files");
  eq((await stored()).length, 4, "four files again");
  const h = await cb((c) => F.head(one, (e, d, streamed) => c(e, { d, streamed })));
  eq([h.streamed, !!h.d.state, h.d.attachments.length], [false, true, 4], "head reads the old layout whole");
});

step("D · a part that cannot be read is named, never a backup not made", async () => {
  const ink = K.ink.exportAll;
  K.ink.exportAll = (c) => c(new Error("the disk said no"));
  let o;
  try { o = await write(); } finally { K.ink.exportAll = ink; }
  eq(o.missing, [{ part: "ink", reason: "the disk said no" }], "the export names it");
  const head = await cb((c) => F.head(o.blob, (e, d) => c(e, d)));
  eq([head.missing, "ink" in head], [[{ part: "ink", reason: "the disk said no" }], false], "the file says so in its first line");
  const r = await restore(o.blob);
  assert(r.missingSections.indexOf("ink (not in this backup: the disk said no)") !== -1, "the restore says so: " + r.missingSections.join(" · "));
  /* a file the browser can no longer read rides by its record */
  const ex = K.attach.exportEach;
  K.attach.exportEach = (onItem, done) => ex((meta, blob, next) => onItem(meta, meta.name === "scan.png" ? { size: 10, type: "image/png", slice: () => ({ arrayBuffer: () => Promise.reject(new Error("gone")) }) } : blob, next), done);
  try { o = await write(); } finally { K.attach.exportEach = ex; }
  eq([o.unreadable, o.files], [["scan.png"], 4], "named, and still in the backup");
  const scan = JSON.parse(await text(o.blob)).attachments.find((a) => a.name === "scan.png");
  eq([scan.blobBase64, scan.unreadable], [null, true], "by its record, marked");
});

step("E · a checkpoint is still all or nothing", async () => {
  const ink = K.ink.exportAll;
  K.ink.exportAll = (c) => c(new Error("the disk said no"));
  let cp;
  try { cp = await wait(K.backup.checkpoint("smoke150")); } finally { K.ink.exportAll = ink; }
  eq([cp.ok, /disk said no/.test(cp.reason)], [false, true], "a part it cannot read means no checkpoint");
  let err = null;
  try { await snap(); } catch (e) { err = e; }
  eq(err, null, "and with every part readable snapshotFull answers as before");
  const s = await snap({ files: false });
  eq(s.attachments, [], "files: false leaves the files to the writer");
});

step("F · Backup & Restore: the confirm reads the first line; the export names what it left out", async () => {
  const d = app.document;
  K.show("data");
  await app.settle();
  const input = d.querySelector('#main input[type="file"][accept*="json"]');
  assert(input, "the import input");
  const whole = JSON.parse(raw);
  Object.defineProperty(input, "files", { configurable: true, value: [new w.File([raw], "kurenai-os-full-backup.json", { type: "application/json" })] });
  const rt = w.FileReader.prototype.readAsText;
  let longest = 0;
  w.FileReader.prototype.readAsText = function (b) { longest = Math.max(longest, b.size || 0); return rt.apply(this, arguments); };
  try {
    input.dispatchEvent(new w.Event("change"));
    for (let i = 0; i < 200 && !d.querySelector('[role="dialog"],[role="alertdialog"]'); i++) await app.settle();
  } finally { w.FileReader.prototype.readAsText = rt; }
  const dlg = d.querySelector('[role="dialog"],[role="alertdialog"]');
  assert(dlg, "a confirm opened");
  assert(new RegExp(whole.state.sessions.length + " sessions").test(dlg.textContent), "the confirm counts the backup's sessions: " + dlg.textContent.replace(/\s+/g, " ").slice(0, 300));
  assert(longest < raw.length / 4, "no read was of the whole file: " + longest + " of " + raw.length);
  K.ui.closeDialogs();
  await app.settle();
  /* the export, with one part unreadable */
  const ink = K.ink.exportAll, toast = K.ui.toast, said = [];
  K.ink.exportAll = (c) => c(new Error("the disk said no"));
  K.ui.toast = (m, bad) => { said.push([m, !!bad]); };
  const btn = Array.from(d.querySelectorAll("#main button")).find((b) => /Export full backup/.test(b.textContent));
  assert(btn, "the export button");
  try {
    btn.click();
    for (let i = 0; i < 400 && !said.length; i++) await app.settle();
  } finally { K.ink.exportAll = ink; K.ui.toast = toast; }
  eq(said, [["Backup saved without: ink.", true]], "it names what it left out");
  /* and the export still records when it was made (smoke56 replays the button with one settle; this one waits for it) */
  delete K.store.state.ui.lastBackupAt;
  btn.click();
  for (let i = 0; i < 400 && !K.store.state.ui.lastBackupAt; i++) await app.settle();
  assert(K.store.state.ui.lastBackupAt > 0, "the export records lastBackupAt");
});

step("H · the restore says what came back, from when, and what this device kept (data-integrity#3, #6, assistant-archive#1)", async () => {
  const d = app.document;
  const b = await snap();
  delete b.reports;                                      /* a part the file does not carry */
  b.exportedAt = Date.parse("2026-11-12T10:00:00Z");
  K.store.state.sessions.splice(0, 3);
  const had = K.store.state.sessions.length, want = b.state.sessions.length;
  const r = await restore(new w.Blob([JSON.stringify(b)], { type: "application/json" }));
  assert(r.counts.indexOf(want + " sessions (this device had " + had + ")") !== -1, "counted per domain, before and after: " + r.counts.join(" · "));
  assert(r.kept.indexOf("saved reports") !== -1, "names the part the file did not carry: " + r.kept.join(", "));
  eq(r.from, b.exportedAt, "and the backup's date");
  const rep = K.store.state.ui.lastReport;
  eq([rep.kind, rep.from, rep.lines[0]], ["restore", b.exportedAt, r.counts[0]], "kept on this device for Backup & Restore");
  K.show("data");
  await app.settle();
  const card = d.querySelector('[data-ui~="archive.last-report"]');
  assert(card && /Last restore · .* · a backup from 12 Nov 2026/.test(card.textContent), "Backup & Restore shows it: " + (card && card.textContent.slice(0, 200)));
  assert(/this device's own were kept: .*saved reports/.test(card.textContent), "with what was kept: " + card.textContent.slice(0, 400));
  /* the page's own restore: the toast says it, with Details */
  const said = [], toast = K.ui.toast;
  K.ui.toast = (m, bad, act) => { said.push([m, !!bad, act && act.label]); };
  try {
    const input = d.querySelector('#main input[type="file"][accept*="json"]');
    Object.defineProperty(input, "files", { configurable: true, value: [new w.File([JSON.stringify(b)], "b.json", { type: "application/json" })] });
    input.dispatchEvent(new w.Event("change"));
    for (let i = 0; i < 200 && !d.querySelector('[role="dialog"],[role="alertdialog"]'); i++) await app.settle();
    const go = Array.from(d.querySelectorAll('[role="dialog"] button,[role="alertdialog"] button')).find((x) => /Replace with this backup/.test(x.textContent));
    assert(go, "the confirm");
    go.click();
    for (let i = 0; i < 600 && !said.some((x) => /^Restored a backup from 12 Nov 2026: /.test(x[0])); i++) await app.settle();
  } finally { K.ui.toast = toast; }
  const t = said.find((x) => /^Restored a backup/.test(x[0]));
  assert(t && new RegExp(want + " sessions").test(t[0]) && t[2] === "Details", "the toast counts what came back and offers Details: " + JSON.stringify(said));
});

step("G · no errors, no request", async () => {
  eq(app.errors, [], "no error");
  assert(!app.fetches.length, "no request: " + app.fetches.slice(0, 3).join(", "));
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 4).join("\n       ")); }
  }
  console.log(failed ? "smoke150: " + failed + " failed" : "smoke150: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
