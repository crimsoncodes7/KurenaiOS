/* Kurenai OS — smoke149.test.js
   W4's import engine (quality programme; REMEDIATION_PLAN W4): MG-02, MG-03,
   MG-04, MG-05, MG-06, MG-07, MG-08 and MG-24, on Santander's own exports
   (tools/fixtures/money/).

     A · the gate: a document from before imports and payee rules reads
         cleanly and twice the same; imports and learned payees are capped;
         a rule's aliases and a transaction's bank words pass it.
     B · MG-02/03/04/06: all six exports read, map themselves and preview
         the right rows — midata with a comma and with a semicolon, Online
         Banking's CSV below its preamble, its text export in Windows-1252,
         QIF and OFX; a header this app cannot place asks for its columns
         and fails nothing; an unquoted £1,234.56 is one amount again; a
         row that cannot be made to fit is reported with its cell count.
     C · the same statement twice, and through another export.
     D · MG-08: merchants and categories, the bank's words kept, learned
         rules, a direct debit suggested as recurring, the balances.
     E · MG-07: a statement's row IS the recurring payment it pays.
     F · MG-05: an import is listed, filtered, undone exactly, replaced.
     G · MG-07 the other way: Confirm takes the bank's entry.
     H · MG-24: the app's own export reads back without loss.
     I · the dialog: an unknown header opens the Columns step; a text
         export previews its three entries.
     J · two devices' imports and learned payees both survive the merge.
     K · no Governor traffic, no session, no request, no error.

   Run: node tools/smoke149.test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");

const FIX = path.join(__dirname, "fixtures", "money");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
/* the same, whatever order a keyed map's keys come in */
function sorted(v) {
  if (Array.isArray(v)) return v.map(sorted);
  if (v && typeof v === "object") { const o = {}; Object.keys(v).sort().forEach((k) => { o[k] = sorted(v[k]); }); return o; }
  return v;
}
function same(a, b, m) { eq(sorted(a), sorted(b), m); }

let app, K, M, gov0, sessions0;
async function wait(promise) {
  let done = false, val, err;
  promise.then((v) => { done = true; val = v; }, (e) => { done = true; err = e; });
  for (let i = 0; i < 2000 && !done; i++) await app.settle();
  if (!done) throw new Error("a promise never settled");
  if (err) throw err;
  return val;
}
const cb = (fn) => wait(new Promise((res, rej) => fn((e, v) => e ? rej(e) : res(v))));
const bytes = (name) => new Uint8Array(fs.readFileSync(path.join(FIX, name)));
const read = (name) => M.csv.parse(M.csv.decode(bytes(name)), name);
const all = async () => (await cb((c) => M.exportAll(c))).tx;
const signed = (rows) => rows.map((r) => (r.kind === "in" ? 1 : -1) * r.minor);
/* an empty Money: no transaction, the shipped categories, no rule, pot, import or payee */
async function wipe() {
  await cb((c) => M.importAll({ tx: [], del: [] }, c));
  K.store.state.money = M.normalise({});
  K.store.save();
}
async function preview(parsed, mapping, opts) {
  return cb((c) => M.csv.preview(parsed, mapping || M.csv.guess(parsed.header), opts || {}, c));
}
async function importFile(name, opts) {
  const parsed = typeof name === "string" && !/\n/.test(name) ? read(name) : M.csv.parse(name, "typed.csv");
  const prev = await preview(parsed);
  const res = await cb((c) => M.csv.import(prev.rows, Object.assign({ file: parsed.fileName, format: parsed.format, closing: prev.closing }, opts || {}), c));
  return { parsed, prev, res };
}
const phone = () => M.addRule({ name: "Phone", kind: "out", cat: "bills", minor: 1000, every: { n: 1, unit: "month" }, start: "2026-09-25" });
const google = () => M.addRule({ name: "Google One", kind: "out", cat: "subscriptions", minor: 159, every: { n: 1, unit: "month" }, start: "2026-09-27" });

step("boot", async () => {
  app = await boot();
  K = app.KOS; M = K.money;
  await app.settle();
  const errs = app.errors.filter((e) => /LOAD FAIL/.test(e));
  assert(!errs.length, "scripts load: " + errs.join(" | "));
  assert(K.moneyImport && app.window.KOS_MONEY_MERCHANTS.length > 100, "the parser and the merchant table are loaded");
  const g = K.store.state.governor;
  gov0 = JSON.stringify({ xp: g.xp, gold: g.gold, hp: g.hp });
  sessions0 = K.store.state.sessions.length;
});

step("A · the gate", async () => {
  const old = M.normalise({ v: 1, categories: [{ id: "food", name: "Food" }], rules: [{ id: "r1", name: "Rent", minor: 100, start: "2026-10-01" }], pots: [] });
  eq([old.imports, old.payees, old.rules[0].aliases], [[], {}, []], "a document from before the fields has none");
  eq(M.normalise(old), old, "a second pass changes nothing");
  const many = [];
  for (let i = 0; i < 230; i++) many.push({ id: "b-" + i, file: "f" + i + ".csv", from: "2026-10-01", to: "2026-10-31", n: 3, at: i + 1 });
  many.push({ file: "no id" }, { id: "b-0", file: "a second b-0", at: 999 });
  const payees = {};
  for (let i = 0; i < 420; i++) payees["Shop " + i] = { name: "Shop " + i, cat: "food", at: i + 1 };
  payees["No Cat"] = { name: "No Cat" };
  const big = M.normalise({ v: 1, categories: old.categories, rules: [{ id: "r2", name: "Phone", minor: 1000, start: "2026-09-25",
    aliases: ["Vodafone Ltd", "vodafone ltd", "", "Tesco Mobile"] }], imports: many, payees });
  eq([big.imports.length, big.imports[0].id, big.imports[199].id], [200, "b-30", "b-229"], "the 200 newest imports, each id once");
  eq(Object.keys(big.payees).length, 400, "the 400 newest payees");
  assert(big.payees["shop 419"] && !big.payees["shop 0"] && !big.payees["no cat"], "keyed by the payee's key, a rule with no category dropped");
  eq(big.rules[0].aliases, ["vodafone ltd", "tesco mobile"], "aliases are payee keys, each once");
  eq(M.normalise(big), big, "idempotent at the caps");
  eq(M.normaliseImport({ id: "b-x", closing: { minor: -110942, date: "2026-10-25" }, n: "4" }).closing, { minor: -110942, date: "2026-10-25" }, "an overdrawn closing balance is kept");
  const t = M.normaliseTx({ date: "2026-10-29", minor: 345, bank: { text: "HERON FOODS HOYLAND", type: "DEB" }, adopt: "b-1" });
  eq([t.bank, t.adopt], [{ text: "HERON FOODS HOYLAND", type: "DEB" }, "b-1"], "the bank's words and an adoption pass the gate");
  eq([M.normaliseTx({ date: "2026-10-29", minor: 345 }).bank, M.normaliseTx({ date: "2026-10-29", minor: 345 }).adopt], [null, null], "and are null without");
  eq(M.payeeKey("  Heron-Foods  (Hoyland)!"), "heron foods hoyland", "a payee's key");
});

step("B · MG-02/03/04/06: every export reads, maps itself and previews", async () => {
  await wipe();
  /* midata, comma: the header is known, the split amounts are whole again, the overdraft line is a trailer */
  let p = read("midata-comma.csv"), map = M.csv.guess(p.header);
  eq(map, { date: 0, type: 1, payee: 2, amount: 3, balance: 4 }, "midata maps itself (MG-02)");
  eq([p.format, p.label, p.delimiter, p.skipped.before, p.skipped.after, p.rejoined, p.issues], ["csv", "Santander midata CSV", ",", 0, 1, [4, 5], []], "midata, comma, named back");
  let pv = await preview(p);
  eq([signed(pv.rows), pv.errors, pv.needs, pv.direction], [[-345, -159, 123456, -1000], [], [], "sign"], "four entries, Student Finance whole (MG-06)");
  eq(pv.rows.map((r) => r.line), [2, 3, 4, 5], "each row knows its line in the file");
  eq(pv.rows.map((r) => !!r.rejoined), [false, false, true, true], "the rows put back together say so");
  /* the same file in Windows-1252, as a text editor re-saves it */
  const cp = M.csv.parse(M.csv.decode(new Uint8Array(Buffer.from(fs.readFileSync(path.join(FIX, "midata-comma.csv"), "utf8"), "latin1"))), "cp1252.csv");
  eq(cp.rows, p.rows, "Windows-1252 reads the same as UTF-8");
  eq(M.csv.decode(new Uint8Array([0xEF, 0xBB, 0xBF, 0x44])), "D", "a byte-order mark is dropped");
  /* midata, semicolon, a blank first line, every line ending in ';' (MG-03) */
  p = read("midata-semicolon.csv");
  eq([p.delimiter, p.header.length, p.skipped.after, p.lines], [";", 5, 1, [3, 4, 5, 6]], "the delimiter is sniffed, the empty last column dropped");
  eq(signed((await preview(p)).rows), [-345, -159, 123456, -1000], "the same four entries");
  /* Online Banking's CSV: the header is found below the account preamble */
  p = read("santander-online-excel.csv"); map = M.csv.guess(p.header);
  eq(p.label, "Santander Online Banking CSV", "Online Banking's CSV is named back");
  eq([map, p.skipped.before, p.lines], [{ date: 0, payee: 1, in: 2, out: 3, balance: 4 }, 2, [5, 6, 7]], "the header is found (MG-03)");
  pv = await preview(p);
  eq([signed(pv.rows), pv.direction, pv.skipped.before], [[-345, -159, 123456], "columns", 2], "three entries from In and Out columns");
  /* the text export: Windows-1252, non-breaking spaces after each amount */
  p = read("santander-online.txt");
  eq([p.format, p.label, p.header, p.rows.map((r) => r[2]), p.skipped.before], ["santander-txt", "Santander text", ["Date", "Description", "Amount", "Balance"], ["-3.45", "-1.59", "1234.56"], 2], "Santander text (MG-04)");
  eq(signed((await preview(p)).rows), [-345, -159, 123456], "its three entries");
  /* QIF */
  p = read("santander.qif");
  eq([p.format, p.label, M.csv.guess(p.header)], ["qif", "QIF (Quicken)", { date: 0, amount: 1, payee: 2, note: 3, category: 5 }], "QIF (MG-04)");
  eq(signed((await preview(p)).rows), [-345, -159, 123456], "its three entries");
  /* OFX: the bank's own id is the identity, LEDGERBAL the closing balance */
  p = read("santander.ofx");
  eq([p.format, p.label, p.dateFormat, p.closing], ["ofx", "OFX (Microsoft Money)", "iso", { minor: 12010, date: "2026-10-31" }], "OFX (MG-04)");
  pv = await preview(p);
  eq([signed(pv.rows), pv.rows.map((r) => r.imp.fitid), pv.rows.map((r) => r.date)],
    [[-345, -159, 123456], ["202610290001", "202610280001", "202610270001"], ["2026-10-29", "2026-10-28", "2026-10-27"]], "its three entries, each with its FITID");
  eq([pv.closing, pv.reconcile.ok], [{ minor: 12010, date: "2026-10-31" }, null], "the ledger balance is the closing balance");
  assert(/HERON FOODS HO HOYLAND/.test(pv.rows[0].bank.text), "a name OFX cut short carries on from its memo");
  /* a header nobody could guess: the Columns step, never an error (MG-02) */
  p = M.csv.parse("My bank export\n\nWhen,What,How much\n01/10/2026,Shop,-1.00\n");
  eq([p.header, p.skipped.before, M.csv.guess(p.header)], [["When", "What", "How much"], 1, {}], "the header is found by what the row under it holds");
  pv = await preview(p);
  eq([pv.needs, pv.rows, pv.errors], [["date", "amount"], [], []], "it asks for the date and the amount");
  eq(signed((await preview(p, { date: 0, payee: 1, amount: 2 })).rows), [-100], "and previews once they are chosen");
  eq((await preview(p, { date: 0 })).needs, ["amount"], "one of the two still missing is named");
  /* MG-06: an unquoted thousands separator, and a row that cannot be made to fit */
  p = M.csv.parse("Date,Description,Amount,Balance\n27/10/2026,STUDENT FINANCE,£1,234.56,£1,500.00\n27/10/2026,A,B,C,1.00,2.00\n");
  eq([p.rows, p.rejoined, p.issues.map((i) => [i.line, i.cells, i.expected])],
    [[["27/10/2026", "STUDENT FINANCE", "£1,234.56", "£1,500.00"]], [2], [[3, 6, 4]]], "one row whole again, one reported");
  pv = await preview(p);
  eq([signed(pv.rows), pv.errors], [[123456], [{ line: 3, reason: "Has 6 cells where the header has 4", cells: 6, expected: 4 }]], "£1,234.56 is 123456, never £1.00");
  const res = await cb((c) => M.csv.import(pv.rows, {}, c));
  eq([res.added, (await all()).map((t) => [t.kind, t.minor])], [1, [["in", 123456]]], "and imports as that");
  /* what an ordinary file read before, it reads now */
  p = M.csv.parse('Date,Description,Amount\r\n01/10/2026,"A, B",-1.00\r\n02/10/2026,"He said ""hi""",2\r\n31/02/2026,Bad date,-1\r\n');
  eq([p.header, p.rows.length, p.rows[0][1], p.rows[1][1], p.skipped, p.dateFormat], [["Date", "Description", "Amount"], 3, "A, B", 'He said "hi"', { before: 0, after: 0, text: [] }, "dmy"], "quotes, CRLF and a bad date as a row");
  eq((await preview(p)).errors.map((e) => [e.line, e.reason]), [[4, "No date I can read"]], "an impossible date is reported, not skipped");
  eq(M.csv.parse("Date\tDescription\tAmount\n01/10/2026\tShop\t-1.00\n").delimiter, "\t", "a tab-delimited file");
  eq(M.csv.parse("").rows, [], "an empty file is no rows and no throw");
  /* an amount column with no minus anywhere takes its direction from the bank's Type */
  pv = await preview(M.csv.parse("Date,Type,Description,Amount\n01/10/2026,DEB,SHOP,3.45\n02/10/2026,FPI,WAGES,50.00\n03/10/2026,???,ODD,1.00\n"));
  eq([pv.direction, pv.rows.map((r) => r.kind)], ["type", ["out", "in", "in"]], "DEB is out, FPI in, an unknown type as the sign says");
});

step("C · the same statement twice, and through another export", async () => {
  await wipe();
  const a = await importFile("midata-comma.csv");
  eq([a.res.added, a.res.skipped], [4, 0], "four entries");
  let pv = await preview(read("midata-comma.csv"));
  eq([pv.duplicates, pv.seenStatement, pv.rows.every((r) => r.duplicate && !r.dupOf)], [4, true, true], "the same file again: every row is one you have, by identity");
  /* another export of the same month: the bank's words differ, the day, amount and merchant do not */
  pv = await preview(read("santander-online-excel.csv"));
  eq([pv.duplicates, pv.rows.map((r) => r.dupOf || null)], [3, ["similar", "similar", "similar"]], "the Online Banking CSV of the same month looks like entries you have");
  /* OFX cuts "GOOGLE *Google One" to "GOOGLE *Googl": that one row cannot be recognised, and says nothing false */
  pv = await preview(read("santander.ofx"));
  eq(pv.rows.map((r) => r.dupOf || null), ["similar", null, "similar"], "OFX: two recognised, the name the bank cut short is offered as new");
  /* only as many as are stored: a second payment of the same kind on the day is new */
  pv = await preview(M.csv.parse("Date,Description,Amount\n29/10/2026,HERON FOODS BARNSLEY,-3.45\n29/10/2026,HERON FOODS BARNSLEY,-3.45\n"));
  eq(pv.rows.map((r) => r.duplicate), [true, false], "one stored, so one of the two looks like it; the other is new");
});

step("D · MG-08: merchants, categories, learned rules, a suggested recurring payment, the balances", async () => {
  await wipe();
  const a = await importFile("midata-comma.csv");
  eq(a.prev.rows.map((r) => [r.payee, r.cat, r.catFrom]), [["Heron Foods", "food", "table"], ["Google One", "subscriptions", "table"],
    ["Student Finance", "grants", "table"], ["Vodafone", "bills", "table"]], "the merchant and its category, from the table");
  const tx = (await all()).sort((x, y) => x.date < y.date ? 1 : -1);
  eq(tx.map((t) => [t.payee, t.bank.type]), [["Heron Foods", "DEB"], ["Google One", "DEB"], ["Student Finance", "FPI"], ["Vodafone", "DD"]], "stored as that, with the bank's Type");
  eq(tx[0].bank.text, "HERON FOODS HOYLAND (VIA APPLE PAY), ON 29-10-2026", "and the bank's own words");
  assert(tx.every((t) => t.raw.join("|").indexOf("120.10") === -1 && !("bal" in t)), "no balance on a transaction");
  eq(a.res.suggest, [{ name: "Vodafone", minor: 1000, cat: "bills", type: "DD", date: "2026-10-25", kind: "out" }], "the direct debit is offered as a recurring payment");
  eq([a.prev.reconcile.ok, a.prev.reconcile.order, a.prev.closing, a.prev.reconcile.breaks], [true, "newest-first", { minor: 12010, date: "2026-10-29" }, []], "the bank's balances add up");
  eq(M.imports()[0].closing, { minor: 12010, date: "2026-10-29" }, "the closing balance is the import's, one figure");
  /* one wrong amount shows as a balance that does not follow */
  const bad = read("midata-comma.csv");
  bad.rows[1][3] = "-£1.99";
  eq([(await preview(bad)).reconcile.ok, (await preview(bad)).reconcile.breaks], [false, [3]], "a balance that does not follow names its row");
  /* an unknown merchant: cleaned, in Other; a learned rule moves the NEXT one */
  const bike = "Date,Description,Amount\n03/11/2026,\"CARD PAYMENT TO BOBS BIKE SHED BARNSLEY,12.00 GBP, RATE 1.00/GBP ON 03-11-2026\",-12.00\n";
  let pv = await preview(M.csv.parse(bike));
  eq([pv.rows[0].payee, pv.rows[0].cat, pv.rows[0].catFrom], ["Bobs Bike Shed Barnsley", "other", "default"], "cleaned and title-cased, in Other");
  eq(M.learnPayee("Bobs Bike Shed Barnsley", "no-such-category"), null, "a rule needs a real category");
  assert(M.learnPayee("Bobs Bike Shed Barnsley", "transport"), "learned");
  pv = await preview(M.csv.parse(bike));
  eq([pv.rows[0].cat, pv.rows[0].catFrom], ["transport", "learned"], "the next one goes to Transport");
  /* a learned rule beats the table, and may rename the merchant */
  M.learnPayee("Heron Foods", "social");
  K.store.state.money.payees[M.payeeKey("Heron Foods")].name = "Heron";
  pv = await preview(read("santander.qif"));
  eq([pv.rows[0].payee, pv.rows[0].cat, pv.rows[0].catFrom], ["Heron", "social", "learned"], "learned beats the table");
  same(M.normalise(K.store.state.money).payees, K.store.state.money.payees, "the rules pass the gate as they are");
  eq((await all()).filter((t) => t.payee === "Heron Foods").length, 1, "nothing stored was rewritten");
  /* a rule whose category is gone, or of the wrong direction, falls back */
  M.updateCategory("social", { archived: true });
  eq((await preview(read("santander.qif"))).rows[0].catFrom, "table", "an archived category is not used");
  M.learnPayee("Student Finance", "food");
  eq((await preview(read("santander.qif"))).rows[2].cat, "grants", "a spending category is never given to money in");
  assert(M.forgetPayee("Heron Foods") && !M.payeeRule("Heron Foods") && M.payees().length === 2, "a rule can be forgotten");
});

step("E · MG-07: a statement's row is the recurring payment it pays", async () => {
  /* the rule is due, the bank row arrives: ONE transaction, the occurrence done */
  await wipe();
  let g = google();
  let a = await importFile("midata-comma.csv");
  eq(a.prev.rows[1].match, { rule: g.id, date: "2026-10-27", name: "Google One", strength: "name", state: "open", tx: null }, "the row is matched by name, a day late");
  eq([a.res.added, a.res.linked], [4, 1], "four entries, one of them the occurrence");
  let tx = await all();
  const one = tx.filter((t) => t.minor === 159);
  eq([one.length, one[0].syncId, one[0].date, one[0].rule, one[0].cat, one[0].src], [1, "r:" + g.id + ":2026-10-27", "2026-10-28", { id: g.id, date: "2026-10-27" }, "subscriptions", "csv"],
    "one £1.59, under the occurrence's own id, on the bank's date");
  eq([M.rule(g.id).marks["2026-10-27"].s, M.rule(g.id).marks["2026-10-27"].tx], ["done", one[0].syncId], "the occurrence is done and points at it");
  const sum = await cb((c) => M.range("2026-10-01", "2026-10-31", c));
  eq(sum.filter((t) => t.kind === "out").reduce((n, t) => n + t.minor, 0), 345 + 159 + 1000, "October's spending counts it once");
  /* confirmed first, then the statement: nothing added, the entry takes the bank's identity */
  await wipe();
  g = google();
  await cb((c) => M.confirm(g.id, "2026-10-27", c));
  let pv = await preview(read("midata-comma.csv"));
  eq([pv.rows[1].duplicate, pv.rows[1].dupOf, pv.rows[1].match.state, pv.duplicates], [true, "rule", "done", 1], "the row is the payment already confirmed");
  a = { res: await cb((c) => M.csv.import(pv.rows, { file: "midata-comma.csv" }, c)) };
  eq([a.res.added, a.res.adopted, a.res.linked], [3, 1, 0], "three added, one adopted");
  tx = await all();
  const conf = tx.filter((t) => t.minor === 159);
  eq([conf.length, conf[0].date, conf[0].src, conf[0].payee, !!conf[0].imp, conf[0].adopt], [1, "2026-10-27", "rule", "Google One", true, a.res.batch], "still one, as it was confirmed, now with an identity");
  pv = await preview(read("midata-comma.csv"));
  eq([pv.duplicates, pv.rows[1].dupOf || null], [4, null], "a second import knows all four by identity");
  /* undoing that import leaves the confirmed entry, as it was before */
  eq(await cb((c) => M.undoBatch(a.res.batch, c)), 3, "three entries removed");
  tx = await all();
  eq([tx.length, tx[0].syncId, tx[0].imp, tx[0].adopt, tx[0].bank, M.rule(g.id).marks["2026-10-27"].s], [1, "r:" + g.id + ":2026-10-27", null, null, null, "done"], "the confirmed entry stays, without what the import gave it");
  /* by amount alone: only when it is the one candidate both ways; the bank's name is learned */
  await wipe();
  let ph = phone();
  a = await importFile("midata-comma.csv");
  eq([a.prev.rows[3].match.strength, a.prev.rows[3].match.rule, a.res.linked, a.res.suggest], ["amount", ph.id, 1, []], "Phone £10 and VODAFONE LTD £10: matched by amount, and not suggested again");
  eq([M.rule(ph.id).aliases, (await all()).find((t) => t.minor === 1000).payee], [["vodafone"], "Phone"], "the rule learns what the bank calls it");
  const next = "Date,Type,Merchant/Description,Debit/Credit\n25/11/2026,DD,VODAFONE LTD,-£10.00\n25/11/2026,DEB,SOME OTHER SHOP,-£10.00\n";
  pv = await preview(M.csv.parse(next));
  eq(pv.rows.map((r) => r.match ? r.match.strength : null), ["name", null], "next month it is matched by name, and another £10 that day is left alone");
  /* two rows that fit and no name between them: neither is taken */
  await wipe();
  ph = phone();
  pv = await preview(M.csv.parse("Date,Description,Amount\n25/10/2026,SHOP ONE,-10.00\n26/10/2026,SHOP TWO,-10.00\n"));
  eq(pv.rows.map((r) => r.match || null), [null, null], "two £10 rows and no name: neither is the payment");
  /* a skipped occurrence is never matched; a row the reader set apart imports as itself */
  await cb((c) => M.skip(ph.id, "2026-10-25", c));
  eq((await preview(read("midata-comma.csv"))).rows[3].match || null, null, "a skipped occurrence is left skipped");
  await wipe();
  ph = phone();
  pv = await preview(read("midata-comma.csv"));
  delete pv.rows[3].match;
  await cb((c) => M.csv.import(pv.rows, {}, c));
  const own = (await all()).find((t) => t.minor === 1000);
  eq([own.rule, /^r:/.test(own.syncId), own.payee, M.rule(ph.id).marks], [null, false, "Vodafone", {}], "set apart, it is its own entry and the occurrence stays open");
  /* an income rule and money in */
  await wipe();
  const sf = M.addRule({ name: "Student Finance", kind: "in", cat: "grants", minor: 123456, every: { n: 4, unit: "month" }, start: "2026-10-26" });
  a = await importFile("santander.qif");
  eq([a.res.linked, M.rule(sf.id).marks["2026-10-26"].s], [1, "done"], "money in pays its occurrence too");
});

step("F · MG-05: an import is listed, filtered, undone exactly and replaced", async () => {
  await wipe();
  const ph = phone();
  const first = await importFile("Date,Description,Amount\n01/09/2026,OLD SHOP,-2.00\n02/09/2026,OLD CAFE,-3.00\n");
  const a = await importFile("midata-comma.csv");
  const list = M.imports();
  eq(list.map((r) => [r.file, r.format, r.from, r.to, r.n]), [["midata-comma.csv", "csv", "2026-10-25", "2026-10-29", 4], ["typed.csv", "csv", "2026-09-01", "2026-09-02", 2]], "both imports, newest first");
  eq([list[0].id, list[0].closing, list[0].stmt], [a.res.batch, { minor: 12010, date: "2026-10-29" }, a.prev.statement], "the record is the batch, with its closing balance and fingerprint");
  same(await cb((c) => M.importCounts(c)), { [a.res.batch]: 4, [first.res.batch]: 2 }, "how many of each are still stored");
  const mine = await cb((c) => M.list({ batch: a.res.batch }, (e, rows) => c(e, rows)));
  eq([mine.length, (await cb((c) => M.list({ src: "csv" }, (e, rows) => c(e, rows)))).length], [4, 6], "Transactions can show one import, or everything imported");
  eq((await cb((c) => M.list({ search: "via apple pay" }, (e, rows) => c(e, rows)))).length, 1, "search reads the bank's words");
  /* deleting one row leaves the record, counting what is left */
  await cb((c) => M.deleteTx(mine.find((t) => t.minor === 345).syncId, c));
  eq((await cb((c) => M.importCounts(c)))[a.res.batch], 3, "three left");
  /* an overlapping file knows the import it would replace */
  const semi = await preview(read("midata-semicolon.csv"));
  eq([semi.seenStatement, semi.overlaps], [true, []], "the same statement with another delimiter is the same statement");
  eq((await preview(read("santander-online-excel.csv"))).overlaps.map((r) => r.id), [a.res.batch], "another file over the same days names the import it could replace");
  eq(M.rule(ph.id).marks["2026-10-25"].s, "done", "the import had marked the phone bill paid");
  /* an import that adds nothing never undoes the one it was to replace */
  let res = await cb((c) => M.csv.import([], { replaces: a.res.batch }, c));
  eq([res.added, M.imports().length, (await all()).length], [0, 2, 5], "nothing added, nothing replaced");
  /* replace: the new rows are written, then the old import goes */
  const pv = await preview(read("midata-semicolon.csv"));
  res = await cb((c) => M.csv.import(pv.rows, { includeDuplicates: true, file: "midata-semicolon.csv", format: "csv", replaces: a.res.batch }, c));
  eq([res.added, M.imports().map((r) => [r.file, r.replaced])], [4, [["midata-semicolon.csv", a.res.batch], ["typed.csv", null]]], "one import stands where the other stood");
  const now = await all();
  eq([now.length, now.filter((t) => t.batch === a.res.batch).length, now.filter((t) => t.batch === res.batch).length], [6, 0, 4], "exactly the old import's rows went");
  /* undo: exactly its rows and its record; the occurrence it paid is open again; the earlier import is untouched */
  eq(await cb((c) => M.undoBatch(res.batch, c)), 4, "four removed");
  eq([(await all()).map((t) => t.payee).sort(), M.imports().map((r) => r.id), M.rule(ph.id).marks], [["Old Cafe", "Old Shop"], [first.res.batch], {}], "the earlier import stands, the phone bill is due again");
  eq(await cb((c) => M.undoBatch("b-nothing", c)), 0, "undoing an import that is not there removes nothing");
});

step("G · MG-07 the other way: Confirm takes the bank's entry", async () => {
  await wipe();
  await importFile("midata-comma.csv");
  const ph = phone();
  const found = await cb((c) => M.bankMatches(ph.id, "2026-10-25", c));
  eq(found.map((t) => [t.payee, t.minor, t.date]), [["Vodafone", 1000, "2026-10-25"]], "the bank's £10 is offered for the phone bill");
  eq(await cb((c) => M.bankMatches(ph.id, "2026-10-24", c)), [], "a day that is no occurrence offers nothing");
  const linked = await cb((c) => M.confirmWith(ph.id, "2026-10-25", found[0].syncId, c));
  eq([(await all()).length, linked.syncId, linked.rule, M.rule(ph.id).marks["2026-10-25"].tx, M.rule(ph.id).aliases], [4, found[0].syncId, { id: ph.id, date: "2026-10-25" }, found[0].syncId, ["vodafone"]],
    "no new transaction: the entry is the occurrence, and the rule learns its name");
  let threw = "";
  try { await cb((c) => M.confirmWith(ph.id, "2026-10-25", found[0].syncId, c)); } catch (e) { threw = e.message; }
  eq(threw, "This one is already confirmed", "an occurrence is confirmed once");
  eq(await cb((c) => M.bankMatches(ph.id, "2026-10-25", c)), [], "an entry already linked is not offered again");
  threw = "";
  try { await cb((c) => M.confirm(ph.id, "2026-10-25", c)); } catch (e) { threw = e.message; }
  eq([threw, (await all()).length], ["This one is already counted from your statement", 4], "Confirm by hand never writes over, or beside, the bank's entry");
  /* un-marking never loses the bank's row */
  await cb((c) => M.unmark(ph.id, "2026-10-25", c));
  let tx = await all();
  eq([tx.length, tx.find((t) => t.minor === 1000).rule, M.rule(ph.id).marks], [4, null, {}], "back to due, the bank's entry still there, unlinked");
  /* a hand-confirmed occurrence still goes with its mark */
  await cb((c) => M.confirm(ph.id, "2026-10-25", c));
  eq((await all()).length, 5, "Confirm by hand adds its own entry");
  await cb((c) => M.unmark(ph.id, "2026-10-25", c));
  eq((await all()).length, 4, "and un-marking takes that one away");
  /* a row the IMPORT linked (stored under the occurrence's id) is kept under an id of its own */
  await wipe();
  const p2 = phone();
  await importFile("midata-comma.csv");
  await cb((c) => M.skip(p2.id, "2026-10-25", c));
  tx = await all();
  const kept = tx.find((t) => t.minor === 1000);
  eq([tx.length, /^r:/.test(kept.syncId), kept.rule, kept.payee, M.rule(p2.id).marks["2026-10-25"].s], [4, false, null, "Vodafone", "skip"], "skipped: the bank's row stays, under its own id and its own name");
  await cb((c) => M.unmark(p2.id, "2026-10-25", c));
  await cb((c) => M.confirm(p2.id, "2026-10-25", c));
  eq((await all()).filter((t) => t.minor === 1000).length, 2, "a later Confirm is a second entry, never written over the bank's");
});

step("H · MG-24: the app's own export reads back without loss", async () => {
  await wipe();
  const cat = M.addCategory({ name: "Driving lessons", kind: "out", group: "future" });
  const pot = M.addPot({ name: "Holiday" });
  const add = (f) => cb((c) => M.addTx(f, c));
  await add({ date: "2026-10-01", amount: "13.00", kind: "out", cat: "food", payee: "Tesco", note: "weekly, shop", tags: ["meal", "deal"] });
  await add({ date: "2026-10-02", amount: "120", kind: "in", cat: "job", payee: "Saturday job" });
  await add({ date: "2026-10-03", amount: "4.50", kind: "refund", cat: "clothing", payee: "Primark" });
  await add({ date: "2026-10-04", minor: 1200, kind: "out", payee: "Halfords", splits: [{ cat: "transport", minor: 500 }, { cat: cat.id, minor: 700 }] });
  await add({ date: "2026-10-05", amount: "30", kind: "transfer", pot: pot.id, dir: "in", note: "set aside" });
  await add({ date: "2026-10-06", amount: "10", kind: "transfer", pot: pot.id, dir: "out" });
  await add({ date: "2026-10-07", amount: "35", kind: "out", cat: cat.id, payee: "Lesson 4" });
  const names = () => { const n = {}; M.data().categories.forEach((c) => { n[c.id] = c.name; }); M.data().pots.forEach((p) => { n[p.id] = p.name; }); return n; };
  const shape = async () => {
    const n = names();
    return (await all()).sort((x, y) => x.date < y.date ? -1 : 1).map((t) => ({ date: t.date, kind: t.kind, minor: t.minor, cat: t.cat ? n[t.cat] : null,
      payee: t.payee, note: t.note, tags: t.tags, pot: t.pot ? n[t.pot] : null, dir: t.dir,
      splits: t.splits ? t.splits.map((s) => [n[s.cat], s.minor]) : null }));
  };
  const before = await shape();
  const text = await cb((c) => M.csv.export(null, null, c));
  eq(text.split("\n")[0], "Date,Type,Amount,Category,Payee,Note,Tags,Pot,Pot direction,Entry", "the export's header");
  eq(text.trim().split("\n").length, 9, "seven entries, the split as two lines");
  /* a new device, or after Reset everything: no transaction, no custom category, no pot */
  await wipe();
  assert(!M.data().pots.length && !M.data().categories.some((c) => c.name === "Driving lessons"), "the category and the pot are gone");
  const p = M.csv.parse(text, "kurenai-money.csv");
  eq([p.format, p.label], ["kurenai", "KurenaiOS export"], "recognised as the app's own");
  const pv = await preview(p);
  eq([pv.rows.length, pv.errors, pv.creates], [7, [], { cats: [{ name: "Driving lessons", kind: "out" }], pots: [{ name: "Holiday" }] }], "seven entries; the preview names what it will make");
  eq(pv.rows.map((r) => r.kind), ["out", "in", "refund", "out", "transfer", "transfer", "out"], "every kind from Type, none turned into income");
  const res = await cb((c) => M.csv.import(pv.rows, { file: p.fileName, format: p.format }, c));
  eq([res.added, res.created], [7, { cats: 1, pots: 1 }], "imported, one category and one pot made");
  eq(await shape(), before, "every entry is what it was: kind, amount, category, payee, note, tags, pot, direction and split");
  eq((await preview(M.csv.parse(text))).duplicates, 7, "the same export again adds nothing");
  /* an entry typed by hand is known to its own export by date, amount and payee */
  await wipe();
  await add({ date: "2026-10-01", amount: "13.00", kind: "out", cat: "food", payee: "Tesco" });
  const again = await preview(M.csv.parse(await cb((c) => M.csv.export(null, null, c))));
  eq([again.rows.length, again.duplicates], [1, 1], "exported and read straight back: already here");
  /* the export from before this release (eight columns): kinds and categories right, a split as its lines */
  await wipe();
  const old = text.trim().split("\n").map((l) => l.split(",").slice(0, -2).join(",")).join("\n") + "\n";
  const po = M.csv.parse(old);
  eq([po.format, po.header.length], ["kurenai", 8], "the eight-column export is the app's own too");
  const pvo = await preview(po);
  eq([pvo.rows.length, pvo.rows.map((r) => r.kind).sort().join(","), pvo.rows.filter((r) => r.splits).length], [8, "in,out,out,out,out,refund,transfer,transfer", 0], "eight lines, each its own entry, every kind right");
  assert(pvo.rows[0].cat === "food" && pvo.rows[1].cat === "job", "categories by name");
});

step("I · the dialog: an unknown header opens the Columns step; a text export previews", async () => {
  await wipe();
  const w = app.window, d = app.document;
  K.show("money", "transactions");
  await app.settle();
  async function choose(name, data) {
    K.moneyUI.importDialog();
    await app.settle();
    const input = d.querySelector('[data-ui~="money.import-dialog"] input[type="file"]');
    assert(input, "the dialog's file input");
    Object.defineProperty(input, "files", { configurable: true, value: [new w.File([data], name)] });
    input.dispatchEvent(new w.Event("change"));
    for (let i = 0; i < 40 && !d.querySelector('[data-ui="money.import-preview"]') && !d.querySelector('[data-ui~="money.import-dialog"] [role="alert"]'); i++) await app.settle();
    return d.querySelector('[data-ui~="money.import-dialog"]');
  }
  let dlg = await choose("mystery.csv", "My bank export\n\nWhen,What,How much\n01/10/2026,Shop,-1.00\n");
  assert(!dlg.querySelector('[role="alert"]'), "no \u201ccould not be read\u201d for a header it cannot place (MG-02)");
  const selects = dlg.querySelectorAll("select");
  eq(selects.length, 3, "one mapping control per column");
  assert(/Choose which column is the date and which the amount/.test(dlg.textContent), "it asks for the date and the amount");
  assert(dlg.querySelector('[data-ui="money.import-preview"]').disabled, "the preview waits for them");
  assert(Array.from(selects[0].options).some((o) => o.value === "type") && Array.from(selects[0].options).some((o) => o.value === "balance"), "Type and Balance can be mapped (MG-08)");
  K.ui.closeDialogs();
  await app.settle();
  dlg = await choose("santander-online.txt", bytes("santander-online.txt"));
  assert(!dlg.querySelector('[role="alert"]'), "the text export is read (MG-04)");
  assert(/Santander text/.test(dlg.textContent) && /2 lines above the header skipped/.test(dlg.textContent), "the File step names the format and what it skipped");
  dlg.querySelector('[data-ui="money.import-preview"]').click();
  for (let i = 0; i < 40 && !d.querySelector('[data-ui="money.import-go"]'); i++) await app.settle();
  assert(/Import 3 entries/.test(dlg.querySelector('[data-ui="money.import-go"]').textContent), "three entries to import");
  assert(/Heron Foods/.test(dlg.textContent) && /The bank's balances add up/.test(dlg.textContent), "merchants, and the balances checked");
  dlg.querySelector('[data-ui="money.import-go"]').click();
  for (let i = 0; i < 40 && !d.querySelector('[data-ui="money.import-undo"]'); i++) await app.settle();
  eq([(await all()).length, M.imports()[0].file, M.imports()[0].format], [3, "santander-online.txt", "santander-txt"], "imported, and the import is on record with its file");
  K.ui.closeDialogs();
  await app.settle();
  /* Recurring's Confirm offers the bank's entry instead of a second one (MG-07) */
  const now = new w.Date(); now.setDate(now.getDate() - 3);
  const pad = (n) => (n < 10 ? "0" : "") + n;
  const day = now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());
  await importFile("Date,Description,Amount\n" + day.split("-").reverse().join("/") + ",FASTER PAYMENTS RECEIPT FROM GRAN,50.00\n");
  const pm = M.addRule({ name: "Pocket money", kind: "in", cat: "allowance", minor: 5000, every: { n: 1, unit: "month" }, start: day });
  K.show("money", "recurring");
  await app.settle();
  const press = d.querySelector('[data-ui="money.occ-confirm"]');
  assert(press && /Received/.test(press.textContent), "the due income's Received button");
  press.click();
  for (let i = 0; i < 40 && !d.querySelector('[data-ui~="money.confirm-bank-dialog"]'); i++) await app.settle();
  const ask = d.querySelector('[data-ui~="money.confirm-bank-dialog"]');
  assert(ask && /FASTER PAYMENTS RECEIPT FROM GRAN/.test(ask.textContent), "it shows the bank's entry of that amount");
  ask.querySelector('[data-ui="money.confirm-bank"]').click();
  for (let i = 0; i < 40 && !M.rule(pm.id).marks[day]; i++) await app.settle();
  eq([(await all()).length, M.rule(pm.id).marks[day].s, M.rule(pm.id).aliases], [4, "done", ["gran"]], "used: still four entries, the occurrence done, the bank's name learned");
  K.ui.closeDialogs();
  await app.settle();
});

step("J · two devices' imports and learned payees both survive the merge", async () => {
  const base = JSON.parse(JSON.stringify(K.store.state));
  const a = JSON.parse(JSON.stringify(base)), b = JSON.parse(JSON.stringify(base));
  a.money.imports.push(M.normaliseImport({ id: "b-aaaa", file: "a.csv", from: "2026-08-01", to: "2026-08-31", n: 2, at: 5 }));
  b.money.imports.push(M.normaliseImport({ id: "b-bbbb", file: "b.ofx", format: "ofx", from: "2026-07-01", to: "2026-07-31", n: 9, at: 6 }));
  a.money.payees.greggs = { name: "Greggs", cat: "food", at: 5 };
  b.money.payees.stagecoach = { name: "Stagecoach", cat: "transport", at: 6 };
  const out = K.cloudmerge.merge(base, a, b).doc;
  const ids = out.money.imports.map((r) => r.id);
  assert(ids.includes("b-aaaa") && ids.includes("b-bbbb") && ids.length === base.money.imports.length + 2, "both imports, the shared one once");
  assert(out.money.payees.greggs && out.money.payees.stagecoach, "both learned payees");
  eq(M.normalise(out.money).imports.length, out.money.imports.length, "the merged document passes the gate");
  /* one device undid an import the other still lists: the deletion wins */
  const c = JSON.parse(JSON.stringify(base));
  c.money.imports = [];
  eq(K.cloudmerge.merge(base, c, JSON.parse(JSON.stringify(base))).doc.money.imports, [], "an import undone on one device is gone on both");
});

step("L · a statement row meets an entry you typed: \"Same as …\", and the Bookkeeper counts distinct entries (money-goals#2, #7)", async () => {
  await wipe();
  const typed = (date, amount, payee) => cb((c) => M.addTx({ date, amount, kind: "out", payee, cat: "other" }, c));
  await typed("2026-11-03", 12, "Bobs Bike Shed");   // two days before the bank's row, named
  await typed("2026-11-10", 7.5, "Latte");           // a day before, its one candidate by amount
  await typed("2026-11-12", 4, "Lunch");             // two typed £4.00 near one bank £4.00:
  await typed("2026-11-13", 4, "Snack");             //   by amount alone that is a guess, so no match
  const text = "Date,Description,Amount\n05/11/2026,CARD PAYMENT TO BOBS BIKE SHED,-12.00\n11/11/2026,COSTA COFFEE,-7.50\n" +
    "12/11/2026,TESCO STORES,-4.00\n20/11/2026,NEW SHOP,-9.99\n";
  const pv = await preview(M.csv.parse(text, "nov.csv"));
  eq(pv.rows.map((r) => [r.duplicate, r.dupOf || null, r.same ? [r.same.payee, r.same.date, r.same.strength] : null]), [
    [true, "typed", ["Bobs Bike Shed", "2026-11-03", "name"]],
    [true, "typed", ["Latte", "2026-11-10", "amount"]],
    [false, null, null], [false, null, null]], "the named row and the one-candidate row are the typed entries; the guess is left alone");
  eq(pv.duplicates, 2, "both are counted as already here");
  const res = await cb((c) => M.csv.import(pv.rows, { file: "nov.csv" }, c));
  eq([res.added, res.adopted], [2, 2], "two new entries; the two typed entries take the bank's identity");
  let rows = await all();
  const bobs = rows.find((t) => t.payee === "Bobs Bike Shed");
  eq([rows.length, !!(bobs.imp && bobs.imp.k), bobs.adopt, bobs.date, bobs.src], [6, true, res.batch, "2026-11-03", "manual"], "the typed entry keeps its date and payee, and gains the identity");
  const again = await preview(M.csv.parse(text, "nov.csv"));
  eq([again.duplicates, again.rows.filter((r) => r.same).length], [4, 0], "the same statement again: every row is known by its identity");
  /* the Bookkeeper: a row imported twice is one entry */
  const A = K.achievements, bk = () => cb((c) => A.measureOne(A.def("bookkeeper"), A.makeCtx(), (v) => c(null, v)));
  eq(await bk(), 6, "six entries");
  await cb((c) => M.csv.import(again.rows, { file: "nov.csv", includeDuplicates: true }, c));
  eq([(await all()).length, await bk()], [10, 6], "imported anyway: ten rows stored, still six distinct entries");
  /* Undo takes back what an import gave a typed entry */
  await cb((c) => M.undoBatch(res.batch, c));
  rows = await all();
  const b2 = rows.find((t) => t.payee === "Bobs Bike Shed" && t.src === "manual");
  eq([!!(b2.imp && b2.imp.k), b2.adopt || null], [false, null], "undone: the typed entry is as you typed it");
});

step("K · no Governor traffic, no session, no request, no error", async () => {
  const g = K.store.state.governor;
  eq(JSON.stringify({ xp: g.xp, gold: g.gold, hp: g.hp }), gov0, "Governor untouched");
  eq(K.store.state.sessions.length, sessions0, "no session logged");
  assert(!app.fetches.some((f) => /money/i.test(String(f.url || f))), "no money request");
  eq(app.errors, [], "no error");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 4).join("\n       ")); }
  }
  console.log(failed ? "smoke149: " + failed + " failed" : "smoke149: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
