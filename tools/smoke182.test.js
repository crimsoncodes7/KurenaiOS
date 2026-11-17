/* Kurenai OS — smoke182.test.js
   Two of the user's asks (18 November 2026):

     A · THE RUN-UP (invariant 111a widened): while a real exam (or a capped
         mock) a card counts for is 60 days away or less, no interval runs
         longer than a third of the days left (3 to 21) — pure, and at a
         rating; further than 60 days, nothing; the exam-day switch at 0
         turns it off; a subject with no exam is never touched.
     B · the exam pass brings in a card scheduled past the run-up, spread
         over the allowed days by its key, never later than it was; a
         second pass changes nothing.
     C · INK TRAVELS WITH A FILE (invariant 151 widened): a Download or
         Share of a file with writing gives a copy with the writing (the
         newest layer's inked pages, by page number) named "(with my
         writing).pdf"; the original when asked, when there is no writing,
         or when "Downloads include my writing" is off; Files' menu offers
         both; Pen and ink has the switch.
     D · no errors, no request.

   Run: node tools/smoke182.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
let app, K, F;
async function wait(promise) {
  let done = false, val, err;
  promise.then((v) => { done = true; val = v; }, (e) => { done = true; err = e; });
  for (let i = 0; i < 4000 && !done; i++) await app.settle();
  if (!done) throw new Error("a promise never settled");
  if (err) throw err;
  return val;
}
const cb = (fn) => wait(new Promise((res, rej) => fn((e, v) => e ? rej(e) : res(v))));
function plusDays(n) { const d = new Date(K.srs.todayISO() + "T12:00:00"); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
function days(a, b) { return Math.round((new Date(b + "T12:00:00") - new Date(a + "T12:00:00")) / 86400000); }

step("boot", async () => { app = await boot(); K = app.KOS; F = K.fsrs; await app.settle(); });

step("A · the run-up: pure, at a rating, only near an exam, and switchable", async () => {
  eq([F.runUpMax(61), F.runUpMax(60), F.runUpMax(45), F.runUpMax(12), F.runUpMax(4)], [null, 20, 15, 4, 3], "a third of the days left, 3 to 21, none past 60");
  eq(F.runUpMax(66), null, "two months and more away: nothing");
  eq(F.runUp(40, 45), { ivl: 15, capped: true }, "a long interval is cut");
  eq(F.runUp(9, 45), { ivl: 9, capped: false }, "a short one is left alone");
  /* a real F201 exam 45 days away; a mature card rated Easy */
  const a = K.exams.add({ preset: "ocr-f201", tier: "real_exam", title: "F201", date: plusDays(45), time: "09:00" }, { quiet: true });
  const key = "it:F201.1.1:0";
  K.store.state.srs[key] = { s: 120, d: 3, last: plusDays(-60), due: plusDays(0), views: 6, lapses: 0, lastRating: 2, ivl: 60, fl: plusDays(-60) };
  K.srs.rate(key, 3);
  const m = K.store.state.srs[key];
  assert(days(K.srs.todayISO(), m.due) <= 15, "Easy on a mature card lands within 15 days (" + m.due + ")");
  eq(m.cap, a.date, "the cap names the exam");
  /* a Code card has no exam: untouched */
  const ck = "code:1.1:0";
  K.store.state.srs[ck] = { s: 120, d: 3, last: plusDays(-60), due: plusDays(0), views: 6, lapses: 0, lastRating: 2, ivl: 60, fl: plusDays(-60) };
  K.srs.rate(ck, 3);
  assert(days(K.srs.todayISO(), K.store.state.srs[ck].due) > 21, "a card with no exam is not capped");
  /* the exam-day switch at 0 turns the run-up off too */
  K.srs.setExamTarget(0);
  K.store.state.srs[key] = { s: 120, d: 3, last: plusDays(-60), due: plusDays(0), views: 6, lapses: 0, lastRating: 2, ivl: 60, fl: plusDays(-60) };
  K.srs.rate(key, 3);
  assert(days(K.srs.todayISO(), K.store.state.srs[key].due) > 21, "off: the interval is FSRS's own");
  K.srs.setExamTarget(0.95);
  /* 90 days away: nothing */
  K.exams.update(a.id, { date: plusDays(90) });
  K.store.state.srs[key] = { s: 120, d: 3, last: plusDays(-60), due: plusDays(0), views: 6, lapses: 0, lastRating: 2, ivl: 60, fl: plusDays(-60) };
  K.srs.rate(key, 3);
  assert(days(K.srs.todayISO(), K.store.state.srs[key].due) > 21, "three months away: no run-up");
  K.exams.remove(a.id);
});

step("B · the exam pass brings far cards in, spread, once", async () => {
  const a = K.exams.add({ preset: "ocr-f201", tier: "real_exam", title: "F201", date: plusDays(54), time: "09:00" }, { quiet: true });
  const keys = [];
  for (let i = 0; i < 40; i++) {
    const k = "it:F201.2.2:" + (100 + i); keys.push(k);
    K.store.state.srs[k] = { s: 200, d: 3, last: plusDays(-5), due: plusDays(70 + i), views: 5, lapses: 0, lastRating: 2, ivl: 75, fl: plusDays(-5) };
  }
  const near = "it:F201.2.2:999";
  K.store.state.srs[near] = { s: 20, d: 3, last: plusDays(-5), due: plusDays(10), views: 5, lapses: 0, lastRating: 2, ivl: 15, fl: plusDays(-5) };
  K.srs.examPass();
  const dues = keys.map((k) => days(K.srs.todayISO(), K.store.state.srs[k].due));
  assert(dues.every((d) => d >= 1 && d <= 18), "every far card within the run-up (18 days): " + dues.join(","));
  assert(new Set(dues).size >= 8, "spread over the days, not piled on one (" + new Set(dues).size + " distinct)");
  eq(days(K.srs.todayISO(), K.store.state.srs[near].due), 10, "a card already inside the run-up is left alone");
  const snap = JSON.stringify(keys.map((k) => K.store.state.srs[k].due));
  K.srs.examPass();
  eq(JSON.stringify(keys.map((k) => K.store.state.srs[k].due)), snap, "a second pass changes nothing");
  K.exams.remove(a.id);
  keys.concat([near, "it:F201.1.1:0", "code:1.1:0"]).forEach((k) => delete K.store.state.srs[k]);
});

step("C · ink travels with a file", async () => {
  const Fl = K.files;
  const r = { fileId: "f182", name: "Homework.pdf", mime: "application/pdf", store: "files" };
  const blob = new app.window.Blob(["%PDF-1.4 test"], { type: "application/pdf" });
  /* no writing: the original */
  let x = await wait(Fl.withWriting(r, blob));
  eq([x.ink, x.name], [false, "Homework.pdf"], "no writing: the original");
  /* write on page 2 of its default layer */
  await cb((c) => K.ink.savePage({ id: K.ink.uid(), doc: "file:f182:default", n: 1, paper: "blank", items: [{ id: "s1", k: "pen", role: "ink", w: 1, p: [100, 100, 0, 0, 200, 200, 0, 16] }] }, c));
  assert(Fl.writing(r) > 0, "the file has writing");
  const seen = [];
  const real = K.inkExport.flattenPDF;
  K.inkExport.flattenPDF = (bytes, pages) => { seen.push(Object.keys(pages)); return Promise.resolve(new Uint8Array([37, 80, 68, 70])); };
  try {
    x = await wait(Fl.withWriting(r, blob));
    eq([x.ink, x.name, x.blob.type], [true, "Homework (with my writing).pdf", "application/pdf"], "with the writing");
    eq(seen, [["1"]], "the inked page, by its page number");
    x = await wait(Fl.withWriting(r, blob, { original: true }));
    eq(x.ink, false, "the original when asked");
    K.store.state.ui.exportInk = false;
    x = await wait(Fl.withWriting(r, blob));
    eq(x.ink, false, "the switch off: the original");
    delete K.store.state.ui.exportInk;
  } finally { K.inkExport.flattenPDF = real; }
  /* Pen and ink has the switch */
  K.show("pen"); await app.settle();
  assert(app.document.querySelector("[data-ui~='pen.export-ink']"), "Pen and ink: Downloads include my writing");
});

step("D · no errors, no request", async () => {
  eq(app.errors, [], "no error");
  assert(!app.fetches.length, "no request");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 4).join("\n       ")); }
  }
  console.log(failed ? "smoke182: " + failed + " failed" : "smoke182: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
