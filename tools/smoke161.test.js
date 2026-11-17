/* Kurenai OS — smoke161.test.js
   Money for imported statements, the pages (W4, design turn 39;
   js/modules/moneyimp.js on the engine smoke149 holds).

     A · the import, File: the format named back, the columns it read shown,
         no mapping asked for; a header it cannot place asks for its columns.
     B · Preview: each row's merchant, the bank's Type, its category and
         where that came from, the balance, the bank's words behind ▾, the
         counts, a duplicate skipped unless asked for, a recurring bill.
     C · a category set by hand offers a rule under the row: Always saves it
         and files the merchant's other rows in the file; Just this one does
         not.
     D · Done: what came in, Undo import, Categorise N → Transactions on that
         import and Other.
     E · Transactions › Imports: each file with See entries, Replace… and
         Undo…; the Source filter narrows the list; an overlapping file offers
         to replace the import of the same days.
     F · Money settings › Rules: your rules, a new one, delete; the merchant
         table searched.
     G · a merchant's page: its address, figures, months, entries, bank texts;
         the category there is a rule.
     H · the Overview: Balance, By merchant and By week with their evidence;
         Runway only with Student Finance and two weeks of spend.
     I · at 860 and below a row opens as a sheet, with the rule switch; above
         it fills the side panel.
     J · the empty Transactions page brings a statement in.
     K · drawing writes nothing, no Governor traffic, no request, no error.

   Run: node tools/smoke161.test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");

const FIX = path.join(__dirname, "fixtures", "money");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, M, d, w, gov0, sessions0;
async function wait(promise) {
  let done = false, val, err;
  promise.then((v) => { done = true; val = v; }, (e) => { done = true; err = e; });
  for (let i = 0; i < 2000 && !done; i++) await app.settle();
  if (!done) throw new Error("a promise never settled");
  if (err) throw err;
  return val;
}
const cb = (fn) => wait(new Promise((res, rej) => fn((e, v) => e ? rej(e) : res(v))));
const all = async () => (await cb((c) => M.exportAll(c))).tx;
const $ = (sel, root) => (root || d).querySelector(sel);
const $$ = (sel, root) => Array.from((root || d).querySelectorAll(sel));
const text = (n) => (n ? n.textContent.replace(/\s+/g, " ").trim() : "");
async function until(fn, n) { for (let i = 0; i < (n || 60) && !fn(); i++) await app.settle(); return fn(); }
async function wipe() {
  await cb((c) => M.importAll({ tx: [], del: [] }, c));
  K.store.state.money = M.normalise({});
  K.store.save();
  K.ui.closeDialogs();
  K.moneyUI.parts.visit.tx = { search: "", cat: "", range: "month", tag: "", kind: "", source: "", mode: "entries" };
}
function file(name, data) { return new w.File([data], name, { type: "text/plain" }); }
const fixture = (name) => file(name, new Uint8Array(fs.readFileSync(path.join(FIX, name))));
async function openWith(f) {
  K.moneyUI.importDialog({ file: f });
  await until(() => $('[data-ui="money.import-preview"]') || $('[data-ui~="money.import-dialog"] [role="alert"]'));
  return $('[data-ui~="money.import-dialog"]');
}
async function toPreview() {
  $('[data-ui="money.import-preview"]').click();
  await until(() => $('[data-ui="money.import-go"]'));
  return $('[data-ui~="money.import-dialog"]');
}
async function doImport() {
  $('[data-ui="money.import-go"]').click();
  await until(() => $('[data-ui="money.import-done"]'));
  return $('[data-ui~="money.import-dialog"]');
}
const rowOf = (dlg, name) => $$('[data-ui="money.import-row"]', dlg).find((r) => text($(".k-mn-pm > b", r)) === name);

step("boot on 30 October 2026", async () => {
  app = await boot({ clock: "2026-10-30T10:00:00" });
  K = app.KOS; M = K.money; d = app.document; w = app.window;
  await app.settle();
  assert(!app.errors.filter((e) => /LOAD FAIL/.test(e)).length, "scripts load");
  assert(K.moneyImp && K.moneyUI.parts, "the turn-39 pages are loaded");
  const g = K.store.state.governor;
  gov0 = JSON.stringify({ xp: g.xp, gold: g.gold, hp: g.hp });
  sessions0 = K.store.state.sessions.length;
});

step("A · File: the format named back, the columns read by themselves", async () => {
  await wipe();
  K.show("money", "transactions");
  await app.settle();
  let dlg = await openWith(fixture("midata-comma.csv"));
  eq(text($('[data-ui="money.import-format"] b', dlg)), "Santander midata CSV", "the format is named back");
  eq($$(".k-mn-rc", dlg).map((n) => text($(".k-kicker", n))), ["Date", "Description", "Amount", "Type", "Balance"], "the five columns it read are shown");
  eq($$("select", dlg).length, 0, "no column is asked for");
  assert(/1 line after the last entry left out/.test(text(dlg)), "the overdraft line is said to be left out");
  assert(/Preview 4 rows/.test(text($('[data-ui="money.import-preview"]'))), "Preview 4 rows");
  $('[data-ui="money.import-byhand"]').click(); await app.settle();
  eq($$('select.k-mn-mapsel', dlg).length, 5, "Match columns by hand shows one choice per column");
  K.ui.closeDialogs(); await app.settle();
  dlg = await openWith(file("mystery.csv", "Statement\n\nWhen,What,How much\n01/10/2026,Shop,-1.00\n"));
  assert(/Couldn't name this format/.test(text(dlg)) && /Choose which column is the date and which the amount/.test(text(dlg)), "a header it cannot place asks");
  assert($('[data-ui="money.import-preview"]').disabled, "the preview waits");
  const sels = $$('select.k-mn-mapsel', dlg);
  sels[0].value = "date"; sels[0].dispatchEvent(new w.Event("change")); await app.settle();
  const s2 = $$('select.k-mn-mapsel', $('[data-ui~="money.import-dialog"]'));
  s2[2].value = "amount"; s2[2].dispatchEvent(new w.Event("change")); await app.settle();
  assert(!$('[data-ui="money.import-preview"]').disabled, "once chosen, the preview opens");
  K.ui.closeDialogs(); await app.settle();
});

step("B · Preview: each row as it will be stored", async () => {
  await wipe();
  const ph = M.addRule({ name: "Phone", kind: "out", cat: "bills", minor: 1000, every: { n: 1, unit: "month" }, start: "2026-09-25" });
  const gpv = await cb((c2) => M.csv.preview(M.csv.parse("Date,Type,Merchant/Description,Debit/Credit,Balance\n28/10/2026,DEB,\"GOOGLE *Google One, ON 27-10-2026\",-£1.59,£123.55\n"), { date: 0, type: 1, payee: 2, amount: 3, balance: 4 }, {}, c2));
  await cb((c) => M.csv.import(gpv.rows, {}, c));
  let dlg = await openWith(fixture("midata-comma.csv"));
  dlg = await toPreview();
  eq(text($('[aria-current="step"]', dlg)), "2Preview", "step 2");
  const heron = rowOf(dlg, "Heron Foods");
  assert(heron, "the clean merchant, not the bank's line");
  eq(text($('[data-ui="money.bank-type"]', heron)), "DEB", "the bank's Type");
  eq([$('[data-ui="money.import-cat"]', heron).value, text($(".k-mn-src", heron))], ["food", "merchant table"], "its category and where that came from");
  assert($('.k-mn-pbal', heron) && /120\.10/.test(text($('.k-mn-pbal', heron))), "the balance");
  $('[data-ui="money.import-raw"]', heron).click(); await app.settle();
  dlg = $('[data-ui~="money.import-dialog"]');
  assert(/HERON FOODS HOYLAND \(VIA APPLE PAY\)/.test(text($(".k-mn-raw", rowOf(dlg, "Heron Foods")))), "▾ shows the bank's own words");
  const voda = rowOf(dlg, "Vodafone");
  assert(/Phone · 25 Oct/.test(text($('[data-ui="money.import-match"]', voda))), "the recurring bill it pays");
  const google = rowOf(dlg, "Google One");
  assert(/Already here · skipped/.test(text($('[data-ui="money.import-dup"]', google))), "a row already stored is skipped");
  const counts = text($('[data-ui="money.import-counts"]', dlg));
  assert(/3\s*new/.test(counts) && /1\s*already here/.test(counts) && /1\s*pays a recurring bill/.test(counts), "the counts: " + counts);
  assert(/Import 3 entries/.test(text($('[data-ui="money.import-go"]'))), "Import 3");
  $('[data-ui="money.import-dup"]', google).click(); await app.settle();
  assert(/Import 4 entries/.test(text($('[data-ui="money.import-go"]'))), "Import anyway takes it");
  $('[data-ui="money.import-dup"]', rowOf($('[data-ui~="money.import-dialog"]'), "Google One")).click(); await app.settle();
  $('[data-ui="money.import-match"]', rowOf($('[data-ui~="money.import-dialog"]'), "Vodafone")).click(); await app.settle();
  assert(!$('[data-ui="money.import-match"]', rowOf($('[data-ui~="money.import-dialog"]'), "Vodafone")), "a match can be turned down");
  assert(/The bank's balances add up/.test(text($('[data-ui="money.import-recon"]'))), "the balances checked");
  K.ui.closeDialogs(); await app.settle();
  assert(ph.id, "the rule stays");
});

step("C · a category set by hand offers a rule under the row", async () => {
  await wipe();
  const two = "Date,Type,Merchant/Description,Debit/Credit\n29/10/2026,DEB,BOBS BIKE SHED,-£12.00\n28/10/2026,DEB,BOBS BIKE SHED,-£8.00\n27/10/2026,DEB,CORNER CAFE,-£3.00\n";
  let dlg = await openWith(file("two.csv", two));
  dlg = await toPreview();
  let row = $$('[data-ui="money.import-row"]', dlg)[0];
  eq($('[data-ui="money.import-cat"]', row).getAttribute("data-state"), "choose", "an unknown merchant asks for its category");
  const sel = $('[data-ui="money.import-cat"]', row);
  sel.value = "transport"; sel.dispatchEvent(new w.Event("change")); await app.settle();
  dlg = $('[data-ui~="money.import-dialog"]');
  assert(/Always put Bobs Bike Shed in Transport\?/.test(text($('[data-ui="money.import-learn"]', dlg))), "the chip, under the row");
  $('[data-ui="money.import-learn-yes"]').click(); await app.settle();
  eq(M.payeeRule("Bobs Bike Shed").cat, "transport", "Always saves the rule");
  dlg = $('[data-ui~="money.import-dialog"]');
  const bikes = $$('[data-ui="money.import-row"]', dlg).filter((r) => /Bobs Bike Shed/.test(text(r)));
  eq(bikes.map((r) => [$('[data-ui="money.import-cat"]', r).value, text($(".k-mn-src", r))]), [["transport", ""], ["transport", "your rule"]], "the other row in the file follows it");
  const cafe = $$('[data-ui="money.import-row"]', dlg).find((r) => /Corner Cafe/.test(text(r)));
  const cs = $('[data-ui="money.import-cat"]', cafe); cs.value = "food"; cs.dispatchEvent(new w.Event("change")); await app.settle();
  $('[data-ui="money.import-learn-no"]').click(); await app.settle();
  eq(M.payeeRule("Corner Cafe"), null, "Just this one saves nothing");
  K.ui.closeDialogs(); await app.settle();
});

step("D · Done: Undo, and Categorise N →", async () => {
  await wipe();
  K.show("money", "transactions"); await app.settle();
  let dlg = await openWith(file("x.csv", "Date,Description,Amount\n29/10/2026,BOBS BIKE SHED,-12.00\n28/10/2026,TESCO STORES 2317,-3.00\n"));
  await toPreview();
  dlg = await doImport();
  assert(/Imported 2 entries/.test(text(dlg)) && /1\s*to categorise/.test(text(dlg)), "what came in: " + text(dlg).slice(0, 200));
  eq((await all()).length, 2, "two entries");
  $('[data-ui="money.import-categorise"]').click();
  await until(() => $('[data-ui="money.tx-row"]'));
  const batch = M.imports()[0].id;
  eq([K.moneyUI.parts.visit.tx.source, K.moneyUI.parts.visit.tx.cat], [batch, "other"], "Transactions on that import, in Other");
  eq($$('[data-ui="money.tx-row"]').map((r) => text($(".k-mn-txpayee .k-mn-strong", r))), ["Bobs Bike Shed"], "only the row to categorise");
  dlg = await openWith(file("y.csv", "Date,Description,Amount\n20/10/2026,GREGGS PLC,-2.10\n"));
  await toPreview(); dlg = await doImport();
  $('[data-ui="money.import-undo"]').click();
  await until(() => !$('[data-ui~="money.import-dialog"]'));
  eq([(await all()).length, M.imports().length], [2, 1], "Undo import removes it and its record");
});

step("E · Transactions › Imports, Source, Replace", async () => {
  await wipe();
  await cb((c) => M.addTx({ date: "2026-10-02", amount: "4.00", kind: "out", cat: "food", payee: "Typed by hand" }, c));
  K.moneyUI.parts.visit.tx = { search: "", cat: "", range: "all", tag: "", kind: "", source: "", mode: "entries" };
  K.show("money", "transactions"); await app.settle();
  let dlg = await openWith(fixture("midata-comma.csv"));
  await toPreview(); await doImport(); K.ui.closeDialogs(); await app.settle();
  K.rerender(); await app.settle();
  const src = $('[data-ui~="money.tx-source"]');
  assert(src && src.options.length === 2, "Source: All and each import");
  src.value = M.imports().find((b) => b.file === "midata-comma.csv").id; src.dispatchEvent(new w.Event("change")); await app.settle();
  await until(() => $$('[data-ui="money.tx-row"]').length === 4);
  eq($$('[data-ui="money.tx-row"]').length, 4, "the list narrows to that import");
  const tab = $$('[role="tab"]').find((t) => text(t) === "Imports");
  tab.click(); await app.settle();
  await until(() => $$('[data-ui="money.batch"]').length === 1);
  const rows = $$('[data-ui="money.batch"]');
  eq(rows.length, 1, "each import a row");
  assert(/midata-comma\.csv/.test(text(rows[0])) && /25 Oct – 29 Oct · 4 rows/.test(text(rows[0])), "its file, days and rows");
  /* an overlapping file offers to replace the import of the same days */
  dlg = await openWith(fixture("santander-online-excel.csv"));
  dlg = await toPreview();
  assert(/Covers the same days as midata-comma\.csv/.test(text($('[data-ui="money.import-overlap"]', dlg))), "the overlap is named");
  $('[data-ui="money.import-replace-offer"]').click(); await app.settle();
  assert(/Replaces midata-comma\.csv/.test(text($('[data-ui="money.import-replacing"]'))), "Replace it");
  $$('[data-ui="money.import-dup"]').forEach((b) => b.click()); await app.settle();
  dlg = await doImport();
  assert(/the earlier import replaced/.test(text(dlg)), "Done says so");
  eq(M.imports().map((b) => b.file), ["santander-online-excel.csv"], "the old import is gone");
  K.ui.closeDialogs(); await app.settle();
  /* Undo… asks first */
  K.rerender(); await app.settle();
  await until(() => $('[data-ui="money.batch-undo"]'));
  const before = M.imports().length;
  $('[data-ui="money.batch-undo"]').click(); await app.settle();
  const confirm = $('[role="alertdialog"]');
  assert(confirm && /Undo this import\?/.test(text(confirm)), "Undo asks");
  $$("button", confirm).find((b) => /Undo import/.test(text(b))).click();
  await until(() => M.imports().length === before - 1);
  eq(M.imports().length, before - 1, "and undoes");
});

step("F · Money settings › Rules", async () => {
  M.learnPayee("Bobs Bike Shed", "transport");
  K.show("money", "transactions"); await app.settle();
  $('[data-ui~="money.settings"]').click(); await app.settle();
  eq([w.location.hash, text($("#main h1"))], ["#/money/settings", "Money settings"], "⚙ opens Money settings");
  await until(() => $$('[data-ui="money.rule-row"]').length);
  assert($$('[data-ui="money.rule-row"]').some((r) => /Bobs Bike Shed/.test(text(r)) && /Transport/.test(text(r))), "your rules");
  const q = $('[data-ui~="money.table-search"]');
  q.value = "heron"; q.dispatchEvent(new w.Event("input"));
  for (let i = 0; i < 5; i++) await app.settle();
  eq($$('[data-ui~="money.table-list"] .k-mn-rulerow').map((r) => text($("b", r))), ["Heron Foods"], "the merchant table searched");
  $$('#main button').find((b) => /New rule/.test(text(b))).click(); await app.settle();
  const dlg = $('[data-ui~="money.rule-dialog"]');
  $("input", dlg).value = "Corner Cafe";
  $("select", dlg).value = "food";
  $('[data-ui="money.rule-save"]').click(); await app.settle();
  eq(M.payeeRule("corner cafe").cat, "food", "a new rule");
  await until(() => $$('[data-ui="money.rule-row"]').length === 2);
  $$('[data-ui="money.rule-row"]').find((r) => /Corner Cafe/.test(text(r))).querySelector('[data-ui="money.rule-delete"]').click(); await app.settle();
  eq(M.payeeRule("Corner Cafe"), null, "deleted");
});

step("G · a merchant's page", async () => {
  await wipe();
  let dlg = await openWith(fixture("midata-comma.csv"));
  await toPreview(); await doImport(); K.ui.closeDialogs(); await app.settle();
  K.moneyImp.openMerchant("Heron Foods"); await app.settle();
  await until(() => $('[data-ui~="money.merchant-stats"]'));
  eq([w.location.hash, text($("#main h1"))], ["#/money/merchant/heron%20foods", "Heron Foods"], "its address and name");
  assert(/This month/.test(text($('[data-ui~="money.merchant-stats"]'))) && /£3\.45/.test(text($('[data-ui~="money.merchant-stats"]'))), "its figures");
  eq($$('[data-ui~="money.merchant-months"] .k-mn-wk').length, 6, "six months");
  eq($$('[data-ui="money.merchant-row"]').length, 1, "its entries");
  assert(/HERON FOODS HOYLAND/.test(text($('[data-ui~="money.merchant-texts"]'))), "the bank's words seen");
  const sel = $('[data-ui~="money.merchant-cat"]');
  sel.value = "social"; sel.dispatchEvent(new w.Event("change")); await app.settle();
  eq(M.payeeRule("Heron Foods").cat, "social", "the category there is a rule");
  eq((await all()).find((t) => t.payee === "Heron Foods").cat, "food", "entries already stored keep theirs");
});

step("H · the Overview's cards, each with its evidence", async () => {
  await wipe();
  K.show("money", "overview"); await app.settle();
  ["money.balance", "money.runway", "money.by-merchant", "money.by-week"].forEach((h) => assert(!$('[data-ui~="' + h + '"]'), "no " + h + " without evidence"));
  let dlg = await openWith(fixture("midata-comma.csv"));
  await toPreview(); await doImport(); K.ui.closeDialogs(); await app.settle();
  K.show("money", "overview"); await app.settle();
  await until(() => $('[data-ui~="money.balance"]'));
  assert(/£120\.10/.test(text($('[data-ui~="money.balance"]'))) && /balances add up/.test(text($('[data-ui~="money.balance"]'))), "Balance from the import, reconciled");
  assert($$('[data-ui="money.merchant-bar"]').length >= 2, "By merchant");
  assert($('[data-ui~="money.by-week"]'), "By week (two weeks with spend)");
  assert(!$('[data-ui~="money.runway"]'), "no Runway without Student Finance");
  M.addRule({ name: "Student Finance", kind: "in", cat: "grants", minor: 142000, every: { n: 4, unit: "month" }, start: "2026-09-27" });
  K.rerender(); await app.settle();
  await until(() => $('[data-ui~="money.balance"]'));
  assert(!$('[data-ui~="money.runway"]'), "nor with under two weeks of spend");
  await cb((c) => M.addTx({ date: "2026-10-10", amount: "5.00", kind: "out", cat: "food", payee: "Greggs" }, c));
  K.rerender(); await app.settle();
  await until(() => $('[data-ui~="money.runway"]'));
  const rw = text($('[data-ui~="money.runway"]'));
  assert(/Student Finance/.test(rw) && /Next instalment/.test(rw) && /lasts (until|past)/.test(rw), "Runway: " + rw.slice(0, 120));
  $('[data-ui="money.merchant-bar"]').click(); await app.settle();
  assert(/^#\/money\/merchant\//.test(w.location.hash), "a merchant bar opens its page");
});

step("I · a row opens as a sheet at 860 and below", async () => {
  K.moneyUI.parts.visit.tx = { search: "", cat: "", range: "all", tag: "", kind: "", source: "", mode: "entries" };
  K.show("money", "transactions"); await app.settle();
  await until(() => $('[data-ui="money.tx-row"]'));
  $$('[data-ui="money.tx-row"]').find((r) => /Heron Foods/.test(text(r))).click(); await app.settle();
  assert(!$('[data-ui~="money.entry-sheet"]') && /HERON FOODS HOYLAND/.test(text($('[data-ui~="money.selected"]'))), "wide: the side panel, with the bank's words");
  const mm = w.matchMedia;
  w.matchMedia = (q) => ({ matches: /max-width: 860px/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
  try {
    $$('[data-ui="money.tx-row"]').find((r) => /Heron Foods/.test(text(r))).click(); await app.settle();
    const sheet = $('[data-ui~="money.entry-sheet"]');
    assert(sheet && /Heron Foods/.test(text(sheet)) && /DEB/.test(text(sheet)), "narrow: a sheet");
    const sw = $('[data-ui="money.sel-rule"]', sheet);
    assert(sw && !sw.checked, "the rule switch, off (no rule yet)");
    sw.checked = true; sw.dispatchEvent(new w.Event("change"));
    eq(M.payeeRule("Heron Foods").cat, (await all()).find((t) => t.payee === "Heron Foods").cat, "on: the entry's category becomes the rule");
    assert($('[data-ui="money.sheet-edit"]', sheet) && $('[data-ui="money.sheet-delete"]', sheet), "Edit and Delete in the sheet");
    K.ui.closeDialogs(); await app.settle();
  } finally { w.matchMedia = mm; }
});

step("J · the empty Transactions page brings a statement in", async () => {
  await wipe();
  K.moneyUI.parts.visit.tx = { search: "", cat: "", range: "month", tag: "", kind: "", source: "", mode: "entries" };
  K.show("money", "transactions"); await app.settle();
  await until(() => $('[data-ui~="money.tx-empty"]'));
  const empty = $('[data-ui~="money.tx-empty"]');
  assert(empty && /Bring in a statement/.test(text(empty)), "the empty page");
  const input = $('input[type="file"]', empty);
  Object.defineProperty(input, "files", { configurable: true, value: [fixture("santander.qif")] });
  input.dispatchEvent(new w.Event("change"));
  await until(() => $('[data-ui="money.import-preview"]'));
  eq(text($('[data-ui="money.import-format"] b')), "QIF (Quicken)", "the chosen file opens the import, read");
  K.ui.closeDialogs(); await app.settle();
});

step("K · drawing writes nothing; no Governor, no request, no error", async () => {
  const st = JSON.stringify(K.store.state.money);
  for (const v of ["overview", "transactions", "settings", "merchant:heron foods"]) { K.show("money", v); await app.settle(); await app.settle(); }
  eq(JSON.stringify(K.store.state.money), st, "the pages only read");
  const g = K.store.state.governor;
  eq(JSON.stringify({ xp: g.xp, gold: g.gold, hp: g.hp }), gov0, "Governor untouched");
  eq(K.store.state.sessions.length, sessions0, "no session");
  assert(!app.fetches.some((f) => /money/i.test(String(f))), "no money request");
  eq(app.errors.concat(app.consoleErrors || []), [], "no error");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 4).join("\n       ")); }
  }
  console.log(failed ? "smoke161: " + failed + " failed" : "smoke161: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
