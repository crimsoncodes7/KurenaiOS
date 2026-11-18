/* Kurenai OS — smoke188.test.js
   The rest of the quality audit's W1 and W7 (18 November 2026), audited
   finding by finding before any fix (the user's rule of that day).

     A · W1. A restore is the whole truth: handwriting (DI-24, AA-12) and
         files a backup does not hold are gone after it, as every other
         store's are; a backup whose files could not be read leaves them.
         One file size everywhere (EX-45, AA-27), and Storage measures every
         database the app keeps (DI-15).
     Z · no errors, no request.

   Run: node tools/smoke188.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const cbp = (fn) => new Promise((res, rej) => fn((e, v) => e ? rej(e) : res(v)));
let app, K, D;
const q = (s) => D.querySelector(s);
const qa = (s) => Array.from(D.querySelectorAll(s));

step("boot", async () => {
  app = await boot(); K = app.KOS; D = app.document; await app.settle();
});

step("A · a restore replaces handwriting and files; one file size; Storage measures every database", async () => {
  const B = K.backup;
  const before = await cbp((cb) => K.ink.exportAll(cb));
  const nPages = before.pages.length;
  const cp = await B.checkpoint("smoke188 before");
  assert(cp && cp.ok, "a checkpoint: " + JSON.stringify(cp));
  /* after it: a page of handwriting and a file */
  await cbp((cb) => K.ink.addPage("smoke188:notebook", { items: [] }, (e, p) => cb(e, p)));
  const after = await cbp((cb) => K.ink.exportAll(cb));
  eq(after.pages.length, nPages + 1, "a page was added");
  const file = new app.window.File(["sixteen bytes!!!"], "smoke188.txt", { type: "text/plain" });
  await cbp((cb) => K.files.add([file], { link: { kind: "exam", id: "smoke188" } }, (e, r) => cb(null, r)));
  await app.settle();
  const metaBefore = await cbp((cb) => K.attach.listMeta(cb));
  assert(metaBefore.some((r) => r.name === "smoke188.txt"), "a file was added");
  const report = await B.restore(cp.id);
  assert(report && report.restoredSections, "restored: " + JSON.stringify(report));
  await app.settle();
  const back = await cbp((cb) => K.ink.exportAll(cb));
  eq(back.pages.length, nPages, "the page the backup does not hold is gone (it used to survive: a merge)");
  assert(!back.docs.some((d) => d.key === "smoke188:notebook"), "and its notebook");
  const metaAfter = await cbp((cb) => K.attach.listMeta(cb));
  assert(!metaAfter.some((r) => r.name === "smoke188.txt"), "the file the backup does not hold is gone");
  /* one formatter */
  eq([0, 16, 1536, 52428, 3355443, 2147483648].map(K.ui.bytes), ["0 B", "16 B", "1.5 KB", "51 KB", "3.2 MB", "2.00 GB"], "one file size");
  /* Storage: every database, measured */
  const ids = K.stores.list().map((r) => r.id);
  const media = await cbp((cb) => K.stores.size("media", cb));
  assert(media > 0, "the Collection is measured: " + media);
  K.show("storage"); await app.settle(); await app.settle();
  const rows = qa("[data-ui~='storage.store']");
  eq(rows.map((r) => r.getAttribute("data-store")).sort(), ids.slice().sort(), "a row for every database the app keeps");
  assert(!/\b0 KB\b/.test(q("#main").textContent), "nothing reads 0 KB");
});

step("Z · no errors, no request", async () => {
  eq(app.errors, [], "no error");
  assert(!app.fetches.length, "no request: " + JSON.stringify(app.fetches.slice(0, 3)));
});

(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { console.error("  FAIL " + name + "\n       " + (e && e.stack || e)); process.exit(1); }
  }
  console.log("smoke188: all " + steps.length + " steps passed");
  process.exit(0);
})();
