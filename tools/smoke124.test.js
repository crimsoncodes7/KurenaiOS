/* Kurenai OS — smoke124.test.js
   Repairs run safely, and a backup import asks first (quality programme
   W1; js/core/repairs.js; AA-11, DI-22; the execution safeguards).

   The claims:

     A · DRY RUN: preview() describes the change, with a hash, and writes
         nothing (the state, the ledger and the backups are as they were).
     B · CONSENT: a consent repair refuses to run without the approved hash,
         and refuses a stale approval when the data moved after the preview.
     C · CHECKPOINT FIRST: an approved run takes a verified checkpoint, then
         applies, re-plans to `needed: false`, records a receipt and an audit
         record naming the checkpoint.
     D · IDEMPOTENT: a second run is a no-op (the receipt), and a repair whose
         data is already right records `noop` without a checkpoint.
     E · NO VERIFIED BACKUP, NO CHANGE: when the checkpoint cannot verify,
         apply never runs and no receipt is written.
     F · IMPORT ASKS FIRST: picking a backup file opens a danger dialog with
         Cancel focused; Cancel changes nothing; confirming saves a verified
         copy of this device BEFORE the restore, then restores.

   Run: node tools/smoke124.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const { seedAccount } = require("./lib/seed");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, R, B;
async function wait(promise) {
  let done = false, val, err;
  promise.then((v) => { done = true; val = v; }, (e) => { done = true; err = e; });
  for (let i = 0; i < 2000 && !done; i++) await app.settle();
  if (!done) throw new Error("a promise never settled");
  if (err) throw err;
  return val;
}
const backups = async () => (await wait(B.list())).length;

/* a test repair: every custom card asked "BAD …" is renamed "GOOD …" */
let applied = 0;
function badOnes() { return K.store.state.custom.cards.filter((r) => /^BAD /.test(r.q)); }
function planRename() {
  const items = badOnes().map((r) => ({ id: r.id, from: r.q, to: r.q.replace(/^BAD /, "GOOD ") }));
  return Promise.resolve({
    needed: items.length > 0,
    summary: { renamed: items.length },
    items,
    apply: () => { applied++; items.forEach((it) => { const r = K.store.state.custom.cards.find((x) => x.id === it.id); if (r) r.q = it.to; }); K.store.save(); return { renamed: items.length }; }
  });
}

step("boot and seed", async () => {
  app = await boot();
  K = app.KOS; R = K.repairs; B = K.backup;
  assert(R && B, "KOS.repairs and KOS.backup load");
  await seedAccount(app);
  await app.settle();
  K.store.state.custom.cards.push({ id: 9001, sid: "compsci", ref: "4.1.1.1", q: "BAD one", a: "x" }, { id: 9002, sid: "compsci", ref: "4.1.1.1", q: "BAD two", a: "x" });
  K.store.save(); await app.settle();
  R.register("test-rename", { title: "Rename the bad cards", consent: true, plan: planRename });
  R.register("test-clean", { title: "Already clean", plan: () => Promise.resolve({ needed: false, summary: { n: 0 }, items: [], apply: () => { throw new Error("must not run"); } }) });
});

let preview;
step("A · preview is a dry run with a hash", async () => {
  const before = JSON.stringify(K.store.state), nb = await backups();
  preview = await wait(R.preview("test-rename"));
  assert(preview.needed && preview.items.length === 2 && /^[0-9a-f]{64}$/.test(preview.hash), "the preview lists both and carries a hash: " + JSON.stringify(preview));
  eq(preview.summary, { renamed: 2 }, "the reconciliation");
  eq(JSON.stringify(K.store.state), before, "the preview wrote nothing");
  eq(await backups(), nb, "no checkpoint for a preview");
  eq(applied, 0, "apply did not run");
});

step("B · consent: no approval, or a stale one, changes nothing", async () => {
  let r = await wait(R.run("test-rename"));
  assert(!r.ok && /approval/.test(r.reason), "refused without approval: " + JSON.stringify(r));
  K.store.state.custom.cards.push({ id: 9003, sid: "compsci", ref: "4.1.1.1", q: "BAD three", a: "x" });
  r = await wait(R.run("test-rename", { approved: preview.hash }));
  assert(!r.ok && /changed since the preview/.test(r.reason), "a stale approval is refused: " + JSON.stringify(r));
  eq(applied, 0, "apply did not run");
  eq(badOnes().length, 3, "nothing renamed");
  assert(!R.receipt("test-rename"), "no receipt");
});

step("C · an approved run: checkpoint, apply, settle, receipt, audit", async () => {
  preview = await wait(R.preview("test-rename"));
  const nb = await backups();
  const r = await wait(R.run("test-rename", { approved: preview.hash }));
  assert(r.ok, "ran: " + JSON.stringify(r));
  eq(applied, 1, "apply ran once");
  eq(badOnes().length, 0, "every bad one renamed");
  eq(await backups(), nb + 1, "one verified checkpoint was taken");
  const list = await wait(B.list());
  assert(/^repair:test-rename/.test(list[0].label), "the checkpoint names the repair: " + list[0].label);
  const rc = R.receipt("test-rename");
  assert(rc && rc.hash === preview.hash && rc.checkpoint === list[0].id, "the receipt names the hash and checkpoint: " + JSON.stringify(rc));
  const audit = await wait(R.audit("test-rename"));
  assert(audit && audit.ok && audit.settled && audit.items.length === 3 && audit.checkpoint.id === list[0].id, "the audit record: " + JSON.stringify(audit));
});

step("D · idempotent: a second run, and an already-clean repair, change nothing", async () => {
  K.store.state.custom.cards.push({ id: 9004, sid: "compsci", ref: "4.1.1.1", q: "BAD four", a: "x" });
  const nb = await backups();
  const r = await wait(R.run("test-rename", { approved: "anything" }));
  assert(r.ok && r.already, "the receipt makes it a no-op: " + JSON.stringify(r));
  eq(applied, 1, "apply did not run again");
  const c = await wait(R.runAuto());
  assert(c["test-clean"] && c["test-clean"].ok && c["test-clean"].noop, "an already-right repair records noop: " + JSON.stringify(c));
  assert(!("test-rename" in c), "a consent repair never runs automatically");
  eq(await backups(), nb, "no checkpoint for a no-op");
  K.store.state.custom.cards = K.store.state.custom.cards.filter((x) => x.id !== 9004);
});

step("E · no verified backup, no change", async () => {
  R.register("test-blocked", { title: "Blocked", plan: () => Promise.resolve({ needed: true, summary: { n: 1 }, items: [1], apply: () => { applied += 100; } }) });
  B._seam.afterRead = (text) => text.replace(/"governor"/, '"gorvernor"');
  const r = await wait(R.run("test-blocked"));
  B._seam.afterRead = null;
  assert(!r.ok && /No verified backup/.test(r.reason), "refused: " + JSON.stringify(r));
  eq(applied, 1, "apply never ran");
  assert(!R.receipt("test-blocked"), "no receipt");
});

step("F · import asks first, Cancel changes nothing, confirm saves a copy then restores", async () => {
  const { window } = app, document = window.document;
  /* a backup of this account, then a change the restore should undo */
  const snap = await wait(new Promise((res, rej) => K.store.snapshotFull((e, v) => e ? rej(e) : res(v))));
  K.store.state.custom.cards.push({ id: 9100, sid: "compsci", ref: "4.1.1.1", q: "made after the backup", a: "x" });
  K.store.save(); await app.settle();
  const data = () => { const c = JSON.parse(JSON.stringify(K.store.state)); delete c.ui; return JSON.stringify(c); };
  K.show("data"); await app.settle();
  const before = data(); await app.settle();
  const input = document.querySelector('input[type="file"][accept*="json"]');
  assert(input, "the backup page has its file input");
  const pick = () => {
    const f = new window.File([JSON.stringify(snap)], "kos-backup.json", { type: "application/json" });
    Object.defineProperty(input, "files", { value: [f], configurable: true });
    input.dispatchEvent(new window.Event("change"));
  };
  pick();
  for (let i = 0; i < 50 && !document.querySelector('[data-ui~="ui.confirm"]'); i++) await app.settle();
  const dlg = document.querySelector('[data-ui~="ui.confirm"]');
  assert(dlg && dlg.getAttribute("data-intent") === "danger", "a danger dialog opens");
  assert(/Replace everything/.test(dlg.textContent) && /sessions/.test(dlg.textContent), "it names what is replaced: " + dlg.textContent);
  const no = dlg.querySelector('[data-ui="ui.confirm-no"]');
  assert(document.activeElement === no, "Cancel is focused");
  no.click(); await app.settle();
  eq(data(), before, "Cancel changed nothing (the state, the page's own ui aside)");

  const nb = await backups();
  pick();
  for (let i = 0; i < 50 && !document.querySelector('[data-ui~="ui.confirm"]'); i++) await app.settle();
  document.querySelector('[data-ui="ui.confirm-yes"]').click();
  for (let i = 0; i < 400 && K.store.state.custom.cards.some((x) => x.id === 9100); i++) await app.settle();
  eq(await backups(), nb + 1, "a verified copy of this device was saved first");
  const list = await wait(B.list());
  eq(list[0].label, "before-import", "labelled before-import");
  assert(!K.store.state.custom.cards.some((x) => x.id === 9100), "the restore replaced the state");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke124: " + failed + " failed" : "smoke124: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
