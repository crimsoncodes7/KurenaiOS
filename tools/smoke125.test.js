/* Kurenai OS — smoke125.test.js
   The W1 P0s (quality programme; REMEDIATION_PLAN W1).

     A · JM-06: with Japanese's spine on Media, a lesson opens, draws its
         spine with the stage headings and stays on the lesson.
     B · ST-25: deleting an assignment keeps a file that is also linked to a
         topic (its topic link intact, the assignment link gone) and deletes
         only a file nothing else links; the confirm names that file.
     C · MG-01: re-importing a statement with a different payee column, or
         with its columns reordered, adds nothing; a bank id column (FITID)
         is the identity when present.
     D · MG-23: two identical same-day payments in one statement both
         import; re-importing it flags both; a statement with one more such
         payment imports only the surplus.
     E · SY-18: an editor's save merges by row id against what it loaded —
         a card another device added, and another device's edit of a card
         this editor did not touch, both survive; this editor's own edit and
         deletion win. The same for Spec's two lists.
     F · no errors.

   Run: node tools/smoke125.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const { seedAccount } = require("./lib/seed");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K;
async function wait(promise) {
  let done = false, val, err;
  promise.then((v) => { done = true; val = v; }, (e) => { done = true; err = e; });
  for (let i = 0; i < 2000 && !done; i++) await app.settle();
  if (!done) throw new Error("a promise never settled");
  if (err) throw err;
  return val;
}
const cb = (fn) => wait(new Promise((res, rej) => fn((e, v) => e ? rej(e) : res(v))));

step("boot and seed", async () => {
  app = await boot();
  K = app.KOS;
  await seedAccount(app);
  await app.settle();
  const errs = app.errors.filter((e) => /LOAD FAIL/.test(e));
  assert(!errs.length, "scripts load: " + errs.join(" | "));
});

step("A · JM-06: the Media spine keeps every lesson open", async () => {
  const lesson = Object.keys(window().KOS_CONTENT).find((k) => /^ja:/.test(k));
  assert(lesson, "a Japanese lesson exists");
  const ref = lesson.slice(3);
  K.store.state.ui.japanese = K.store.state.ui.japanese || {};
  K.store.state.ui.japanese.spine = "media";
  const before = app.errors.length;
  K.show("ref", { subject: "ja", ref });
  await app.settle();
  eq(app.errors.slice(before), [], "no error drawing the lesson");
  eq(K.store.state.ui.view, "ref", "still on the lesson");
  const doc = app.document;
  assert(doc.querySelector('[data-ui~="ja.spine-mode"] [aria-pressed="true"]').textContent === "Media", "the Media switch is on");
  assert(doc.querySelectorAll('[data-ui~="ja.spine-stage"]').length > 0, "the stage headings draw under Media");
  assert(doc.querySelectorAll('[data-ui~="part.section"]').length > 0, "the core lessons are listed");
  K.store.state.ui.japanese.spine = "core";
});
function window() { return app.window; }

step("B · ST-25: an assignment's delete keeps files linked elsewhere", async () => {
  const A = K.assignments, AT = K.attach;
  const a = A.add({ title: "Essay on sorting", subject: "compsci", due: "2026-10-01" });
  assert(a && a.id != null, "an assignment");
  const File = app.window.File;
  const sharedId = await cb((c) => AT.add("compsci", "4.1.1.1", new File(["topic notes pdf"], "sorting-notes.pdf", { type: "application/pdf" }), c));
  const shared = (await cb((c) => AT.list("compsci", "4.1.1.1", c))).find((r) => r.id === sharedId);
  assert(shared && shared.fileId, "the topic file is stored");
  await cb((c) => AT.addLink(shared.fileId, { kind: "assignment", id: String(a.id) }, c));
  const sole = await cb((c) => AT.add("compsci", A.attachRef(a), new File(["draft text"], "draft.docx", { type: "application/octet-stream" }), c));
  const going = await cb((c) => A.soleFiles(a.id, c));
  eq(going.map((r) => r.name), ["draft.docx"], "only the sole-link file is named for deletion");
  await cb((c) => A.remove(a.id, c));
  const topic = await cb((c) => AT.list("compsci", "4.1.1.1", c));
  const kept = topic.find((r) => r.fileId === shared.fileId);
  assert(kept, "the topic's file survives the assignment's delete");
  eq(AT.linksOf(kept).map((l) => l.kind + ":" + l.id), ["topic:compsci:4.1.1.1"], "its topic link intact, the assignment link gone");
  const left = await cb((c) => AT.list("compsci", A.attachRef(a), c));
  eq(left.length, 0, "the sole-link file is deleted");
  assert(sole != null, "(the sole file existed)");
});

const M = () => K.money;
async function importCSV(text, map, opts) {
  const parsed = M().csv.parse(text);
  const mapping = map || M().csv.guess(parsed.header);
  const prev = await cb((c) => M().csv.preview(parsed, mapping, opts || {}, c));
  const res = await cb((c) => M().csv.import(prev.rows, {}, c));
  return { prev, res };
}

step("C · MG-01: a re-import with another mapping, or reordered columns, adds nothing", async () => {
  const text = "Date,Description,Type,Amount\n" +
    "01/09/2026,PRET A MANGER 123,Card,-5.40\n" +
    "02/09/2026,TFL TRAVEL CH,Card,-2.80\n" +
    "03/09/2026,STUDENT LOAN CO,Credit,1200.00\n";
  const first = await importCSV(text);
  eq(first.res.added, 3, "three new rows");
  /* the same statement, with "Type" mapped as the payee this time */
  const parsed = M().csv.parse(text);
  const again = await cb((c) => M().csv.preview(parsed, { date: 0, payee: 2, amount: 3 }, {}, c));
  eq(again.rows.filter((r) => !r.duplicate).length, 0, "another payee column changes nothing: all known");
  assert(again.seenStatement, "the statement is recognised");
  /* the same rows, columns reordered */
  const reordered = "Amount,Type,Date,Description\n-5.40,Card,01/09/2026,PRET A MANGER 123\n-2.80,Card,02/09/2026,TFL TRAVEL CH\n1200.00,Credit,03/09/2026,STUDENT LOAN CO\n";
  const r2 = await cb((c) => M().csv.preview(M().csv.parse(reordered), M().csv.guess(M().csv.parse(reordered).header), {}, c));
  eq(r2.rows.filter((r) => !r.duplicate).length, 0, "reordered columns: all known");
  /* FITID: the bank's id is the identity, whatever the description says */
  const f1 = "Date,Transaction ID,Description,Amount\n05/09/2026,TX-1,COFFEE,-3.00\n05/09/2026,TX-2,COFFEE,-3.00\n";
  const fa = await importCSV(f1);
  eq(fa.res.added, 2, "two ids, two rows");
  const f2 = "Date,Transaction ID,Description,Amount\n05/09/2026,TX-1,COFFEE SHOP LTD,-3.00\n05/09/2026,TX-3,COFFEE,-3.00\n";
  const fb = await cb((c) => M().csv.preview(M().csv.parse(f2), M().csv.guess(M().csv.parse(f2).header), {}, c));
  eq(fb.rows.map((r) => r.duplicate), [true, false], "TX-1 known under a new description; TX-3 is new");
  const stored = await cb((c) => M().exportAll(c));
  const one = stored.tx.find((t) => t.imp && t.imp.fitid === "TX-1");
  assert(one && Array.isArray(one.raw) && one.raw.indexOf("TX-1") >= 0, "the source row is kept on the transaction");
});

step("D · MG-23: identical rows in one statement are separate payments", async () => {
  const twice = "Date,Description,Amount\n10/09/2026,CANTEEN,-2.50\n10/09/2026,CANTEEN,-2.50\n";
  const a = await importCSV(twice);
  eq(a.prev.rows.map((r) => r.duplicate), [false, false], "both are new");
  eq(a.res.added, 2, "both import");
  const b = await importCSV(twice);
  eq(b.prev.rows.map((r) => r.duplicate), [true, true], "re-import flags both");
  eq(b.res.added, 0, "nothing added");
  const thrice = twice + "10/09/2026,CANTEEN,-2.50\n";
  const c = await importCSV(thrice);
  eq(c.prev.rows.map((r) => r.duplicate), [true, true, false], "only the surplus third is new");
  eq(c.res.added, 1, "one added");
});

step("D2 · review fixes: a long row, bank row numbers, no account numbers kept", async () => {
  /* a row whose key is longer than any cap: it still matches itself */
  const long = "Date,Description,Extended Details,Appears As,Address,Amount\n" +
    "11/09/2026,AMAZON MKTPLACE," + "X".repeat(300) + ",AMZN MKTP UK," + "Y".repeat(200) + ",-19.99\n";
  const l1 = await importCSV(long);
  eq(l1.res.added, 1, "added once");
  const l2 = await importCSV(long);
  eq([l2.prev.duplicates, l2.res.added], [1, 0], "a 500-character row matches itself on re-import");
  /* an export whose "Transaction ID" restarts at 1: the id alone is not trusted */
  const e1 = "Date,Transaction ID,Description,Amount\n02/07/2026,1,RENT,-400.00\n03/07/2026,2,COFFEE,-2.50\n";
  await importCSV(e1);
  const e2 = "Date,Transaction ID,Description,Amount\n03/07/2026,1,COFFEE,-2.50\n04/07/2026,2,BOOKS,-12.00\n";
  const p2 = await cb((c) => M().csv.preview(M().csv.parse(e2), M().csv.guess(M().csv.parse(e2).header), {}, c));
  eq(p2.rows.map((r) => r.duplicate), [false, false], "a reused id on another day and amount is a new row");
  eq(M().csv.guess(["ID", "Date", "Description", "Amount"]).fitid, undefined, "a bare ID column is not guessed as the bank's id");
  /* account numbers, sort codes and balances are not kept */
  const acct = "Date,Description,Amount,Balance,Sort Code,Account Number\n12/09/2026,LIDL,-8.40,120.00,12-34-56,12345678\n";
  await importCSV(acct);
  const all = await cb((c) => M().exportAll(c));
  const lidl = all.tx.find((t) => t.payee === "LIDL");
  eq(lidl.raw, ["12/09/2026", "LIDL", "-8.40", "", "", ""], "the balance, sort code and account number are blanked");
});

step("E · SY-18: an editor's save keeps another device's rows", async () => {
  const E = K.edits, sid = "compsci", ref = "4.1.1.2";
  const base = E.material(sid, ref, "flashcards");
  assert(base.length >= 3, "a deck to edit");
  const mine = JSON.parse(JSON.stringify(base));
  /* another device's pull lands under the open editor: a new card, and an
     edit to card 2 */
  const remote = JSON.parse(JSON.stringify(base));
  remote.splice(1, 0, { id: "e-remote-1", k: sid + ":" + ref + ":e-remote-1", q: "Remote Q", a: "Remote A" });
  remote[3].q = "Edited on the iPad";
  E.set(sid, ref, "flashcards", remote);
  /* this editor changes card 0 and deletes the last card, then saves */
  mine[0].q = "Edited here";
  const lastId = mine[mine.length - 1].id;
  mine.pop();
  E.set(sid, ref, "flashcards", mine, { base });
  const now = E.material(sid, ref, "flashcards");
  assert(now.some((c) => c.id === "e-remote-1"), "the card the other device added survives");
  eq(now.findIndex((c) => c.id === "e-remote-1"), 1, "after its neighbour");
  eq(now.find((c) => c.id === base[2].id).q, "Edited on the iPad", "the other device's edit of an untouched card survives");
  eq(now[0].q, "Edited here", "this editor's edit wins");
  assert(!now.some((c) => c.id === lastId), "this editor's deletion wins");
  eq(now.length, base.length, "one added, one removed");
  /* without a base, set() still writes the list whole (other callers) */
  /* Spec: two lists */
  const sb = E.material(sid, ref, "spec");
  const sm = JSON.parse(JSON.stringify(sb)), sr = JSON.parse(JSON.stringify(sb));
  sr.info = (sr.info || []).concat([{ id: "e-remote-spec", md: "From the iPad" }]);
  E.set(sid, ref, "spec", sr);
  sm.content = (sm.content || []).concat([{ id: "e-local-spec", md: "From here" }]);
  E.set(sid, ref, "spec", sm, { base: sb });
  const sp = E.material(sid, ref, "spec");
  assert(sp.info.some((b) => b.id === "e-remote-spec") && sp.content.some((b) => b.id === "e-local-spec"), "both devices' Spec blocks survive");
  /* the column break another device set survives an unrelated save here */
  const b2 = E.material(sid, ref, "spec"), mine2 = JSON.parse(JSON.stringify(b2));
  E.setSpecBreak(sid, ref, b2.content[0].id);
  mine2.content[0].md = (mine2.content[0].md || "") + " (edited)";
  E.set(sid, ref, "spec", mine2, { base: b2 });
  eq(E.material(sid, ref, "spec").colBreak, String(b2.content[0].id), "the other device's column break survives");
  /* a card deleted on the other device stays deleted, even if edited here */
  const fb = E.material(sid, ref, "flashcards"), gone = fb[1].id;
  E.set(sid, ref, "flashcards", fb.filter((c) => c.id !== gone));
  const mine3 = JSON.parse(JSON.stringify(fb));
  mine3[1].q = "edited after the other device deleted it";
  E.set(sid, ref, "flashcards", mine3, { base: fb });
  assert(!E.material(sid, ref, "flashcards").some((c) => c.id === gone), "a deletion on either side wins (invariant 33)");
});

step("F · no errors", async () => {
  await app.settle();
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke125: " + failed + " failed" : "smoke125: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
