/* Kurenai OS — smoke193.test.js
   The quality audit's W7 batch F (Collection, Money, Productivity and one
   Exams finding), audited before each fix and held here.

     A · CL-09  the Books rail counts the lens on screen (Digital: the
                AniList mirror; Physical: owned volumes), and recounts when
                the lens changes.
     B · CL-10  Hide amounts masks the Wishlist, the shelves and Mangaka;
                one money grammar (KOS.money.format) everywhere.
     C · CL-28  no "0 ch" for a series read by the volume; "1 of 1 route".
     D · CL-32  a re-import counts unchanged rows apart: "already up to date".
     E · MG-11  Month and year's In is what came in; expected is the sub-line.
     F · MG-19  Transactions' "This view" totals the whole view, not the
                rows loaded so far.
     G · PR-11  Reminders' Today holds what is overdue too.
     H · PR-20  tomorrow's first task offers today's carried and overdue
                work; an untimed timeline row prints no dash.
     I · PR-32  an auto-tracked Focus habit counts complete sessions only,
                by the routine day.
     J · PR-35  a routine kept after its window closed counts, as kept late.
     K · SH-30  a notice opens its record: a review, a routine, a goal; the
                closed-app tap carries the router's own address.
     L · EX-24  Analytics opens on the assessment with marked papers;
                Calibration says it reads all papers.
     M · JM-32  Voice, Immersion and Sentence miner, which nothing in the
                app can earn yet, are "Not released yet".
     Z · no errors, no request.

   Run: node tools/smoke193.test.js */
"use strict";
const path = require("path");
const fs = require("fs");
const { boot } = require("./lib/app-harness");
const ROOT = path.join(__dirname, "..");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const cbp = (fn) => new Promise((res, rej) => fn((e, v) => e ? rej(e) : res(v)));
let app, K, D;
const q = (s) => D.querySelector(s);
const qa = (s) => Array.from(D.querySelectorAll(s));
const click = (n) => n.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true }));
const at = (hm) => new Date("2026-09-24T" + hm + ":00").getTime();   // the harness clock's day, Europe/London

step("boot", async () => {
  app = await boot(); K = app.KOS; D = app.document; await app.settle();
});

step("A · CL-09 the Books rail counts the lens on screen", async () => {
  const put = (e) => cbp((cb) => K.mediadb.put(Object.assign({ module: "books", status: "inProgress" }, e), cb));
  await put({ title: "Mirror One", syncSource: "anilist", externalIds: { anilistId: 9101 } });
  await put({ title: "Mirror Two", syncSource: "anilist", externalIds: { anilistId: 9102 }, status: "completed" });
  await put({ title: "Shelf Only", syncSource: "manual", physical: { owned: true, volumes: [{ number: 1, condition: "new", price: 12.5 }] } });
  K.store.state.media = K.store.state.media || {};
  K.show("books", { tab: "digital" }); await app.settle(); await app.settle();
  const all = () => {
    const b = qa("[data-ui~='vault.filter-rail'] button")[0];
    return b ? Number((b.textContent.match(/(\d+)\s*$/) || [])[1]) : null;
  };
  const shown = () => Number((q("[data-ui~='vault.count']").textContent.match(/^(\d+)/) || [])[1]);
  eq(all(), shown(), "Digital: All counts what the grid shows");
  eq(all(), 2, "the two mirrored rows");
  const phys = qa("[data-ui~='books.lens']").filter((b) => /Physical/.test(b.textContent))[0] || qa("button").filter((b) => /Physical Vault/.test(b.textContent))[0];
  assert(phys, "the Physical lens");
  click(phys); await app.settle(); await app.settle();
  eq(all(), shown(), "Physical: All counts what the grid shows");
  eq(all(), 1, "the one shelf row");
});

step("B · CL-10 Hide amounts reaches the Collection; one money grammar", async () => {
  K.wishlist.add({ title: "A box set", module: "books", price: 60, status: "wantToBuy" });
  K.money.setHidden(false);
  K.show("wishlist"); await app.settle(); await app.settle();
  const txt = q("#main").textContent;
  assert(new RegExp(K.money.format(6000).replace(/[.$]/g, "\\$&")).test(txt), "the Wishlist prints Money's own form: " + K.money.format(6000));
  K.money.setHidden(true);
  K.show("wishlist"); await app.settle(); await app.settle();
  assert(!/60\.00/.test(q("#main").textContent), "hidden on the Wishlist");
  K.show("mangaka"); await app.settle(); await app.settle();
  assert(!/12\.50|£13 spent|£12 spent/.test(q("#main").textContent), "hidden on Mangaka");
  eq(K.money.formatShown(1250), K.money.format(1250, { private: true }), "formatShown masks while hidden");
  K.money.setHidden(false);
  eq(K.money.formatShown(1250), K.money.format(1250), "and shows it otherwise");
  eq(K.money.format(1250, { currency: "USD" }), "12.50 USD", "a currency of its own");
});

step("C · CL-28 no '0 ch'; '1 of 1 route'", async () => {
  await cbp((cb) => K.mediadb.put({ module: "books", title: "Volume Novel", status: "inProgress", syncSource: "anilist",
    externalIds: { anilistId: 9103 }, progress: { current: 0, volumes: 3, totalVolumes: 10 } }, cb));
  K.show("books", { tab: "digital" }); await app.settle(); await app.settle();
  const card = qa("[data-ui~='books.card']").filter((c) => /Volume Novel/.test(c.textContent))[0];
  assert(card, "the card");
  assert(!/0 ch/.test(card.textContent), "no '0 ch': " + card.textContent);
  assert(/3 \/ \d+ vol|3 vol/.test(card.textContent), "the volume half stays");
  eq(K.media.progressText({ module: "vn", progress: { current: 1, total: 1, unit: "route" } }, { long: true }), "1 of 1 route", "singular route");
  eq(K.media.progressText({ module: "vn", progress: { current: 2, total: 3, unit: "route" } }, { long: true }), "2 of 3 routes", "plural");
});

step("D · CL-32 a re-import says already up to date", async () => {
  const row = { module: "anime", title: "Same Show", status: "completed", syncSource: "anilist", externalIds: { anilistId: 9201, malId: 9201 }, progress: { current: 12, total: 12 } };
  const r1 = await cbp((cb) => K.mediadb.bulkUpsert([row], {}, cb));
  eq([r1.added, r1.updated], [1, 0], "first: added");
  const r2 = await cbp((cb) => K.mediadb.bulkUpsert([JSON.parse(JSON.stringify(row))], {}, cb));
  eq([r2.added, r2.updated, r2.unchanged], [0, 0, 1], "again: unchanged, not updated");
  const r3 = await cbp((cb) => K.mediadb.bulkUpsert([Object.assign({}, row, { status: "inProgress", progress: { current: 5, total: 12 } })], {}, cb));
  eq([r3.updated, r3.unchanged], [1, 0], "a real change is updated");
});

step("E · MG-11 In is what came in; expected rides below", async () => {
  K.money.addRule({ name: "Pay", kind: "in", minor: 45000, start: "2026-09-28", every: { unit: "month", n: 1 } });
  K.store.save();
  K.show("money", "month"); await app.settle(); await app.settle();
  const side = q("[data-ui~='money.month-side']");
  assert(side, "the month side card");
  const t = side.textContent.replace(/\s+/g, " ");
  assert(/still expected/.test(t), "expected is said: " + t);
  assert(!new RegExp("In\\s*" + K.money.format(45000).replace(/[.$]/g, "\\$&")).test(t), "In is not the expected sum: " + t);
});

step("F · MG-19 'This view' totals the whole view", async () => {
  for (let i = 0; i < 70; i++) {
    await cbp((cb) => K.money.addTx({ kind: "out", minor: 100, date: "2026-09-" + String(1 + (i % 20)).padStart(2, "0"), payee: "Shop " + i }, (e, r) => cb(null, r)));
  }
  await app.settle();
  const tot = await cbp((cb) => K.money.listTotals({ from: "2026-09-01", to: "2026-09-30" }, cb));
  assert(tot.count >= 70 && tot.out >= 7000, "listTotals reads every row: " + JSON.stringify(tot));
  K.show("money", "transactions");
  for (let i = 0; i < 20 && !q("[data-ui~='money.tx-view']"); i++) await app.settle();
  const card = q("[data-ui~='money.tx-view']");
  assert(card, "the This view card");
  assert(new RegExp("(^|\\D)" + tot.count + " entries").test(card.textContent), "every entry counted, not 60: " + card.textContent);
  assert(!/so far/.test(card.textContent), "no 'so far'");
  assert(qa("[data-ui~='money.tx-list'] [role='listitem'], [data-ui~='money.tx-list'] .k-mn-txrow").length <= 60, "while the list still loads 60");
});

step("G · PR-11 Today holds overdue reminders", async () => {
  const R = K.reminders;
  const late = R.add({ title: "Slipped yesterday", due: "2026-09-23" });
  const now = R.add({ title: "Due today", due: "2026-09-24" });
  const today = R.query({ section: "today" }).map((x) => x.id);
  assert(today.includes(late.id) && today.includes(now.id), "Today holds the overdue one too");
  K.store.state.ui.reminders = Object.assign({}, K.store.state.ui.reminders || {}, { section: "today", listId: null, tag: null, priority: "" });
  K.show("reminders"); await app.settle();
  const heads = qa("h3").map((h) => h.textContent);
  assert(heads.includes("Overdue") && heads.includes("Today"), "grouped Overdue, then Today: " + heads.join(", "));
  qa("[data-ui~='rem.plan-row']").forEach((r) => assert(!/↻ From your plan/.test(r.textContent), "no per-row plan chip"));
});

step("H · PR-20 tomorrow's first task; no bare dash", async () => {
  /* an overdue reminder exists (G): it is a candidate for tomorrow's first task */
  K.dayReview.enable(true);
  const c = K.dayReview.content("evening", { now: at("19:30") });
  const tm = c.steps.filter((s) => s.id === "tomorrow")[0];
  assert(tm, "the tomorrow step");
  assert(tm.suggestions.some((x) => x.title === "Slipped yesterday"), "today's overdue work is a candidate: " + tm.suggestions.map((x) => x.title).join(", "));
  const row = K.rtUI.tlRow({ kind: "lesson", title: "Maths", start: null });
  eq(row.querySelector(".k-rt-tl-time").textContent, "", "an untimed lesson prints no dash");
});

step("I · PR-32 auto Focus habits: complete sessions, by the routine day", async () => {
  const L = K.store.state.sessions;
  const base = L.length;
  const mk = (ts, secs, complete) => ({ id: "s193-" + ts, type: "focus", date: new Date(ts).toISOString().slice(0, 10), ts, dur: secs, subject: "maths", metrics: { complete } });
  L.push(mk(at("12:00"), 30 * 60, true));
  L.push(mk(at("13:00"), 9 * 60, false));          // stopped early: pays nothing, counts nothing
  L.push(mk(new Date("2026-09-25T00:30:00").getTime(), 20 * 60, true));   // after midnight: still the 24th's routine day
  const v = await new Promise((res) => K.routines.autoMeasure({ src: "focus", subject: "maths", n: 25 }, "2026-09-24", res));
  L.splice(base);
  eq(v, 50, "30 + 20 minutes; the 9-minute stop left out");
});

step("J · PR-35 kept after its window: counts, as kept late", async () => {
  const R = K.routines;
  R.enable(true);
  const r = R.fromTemplate("morning");
  assert(r && r.window, "a morning routine with a window");
  const day = "2026-09-24";
  if (!R.scheduledOn(r, day)) R.update(r.id, { days: [0, 1, 2, 3, 4, 5, 6] });
  assert(R.pastWindow(R.get(r.id), day, at("19:03")), "19:03 is past " + r.window.to);
  assert(!R.pastWindow(R.get(r.id), day, at(r.window.from)), "the window's start is not");
  R.get(r.id).steps.filter((s) => !s.checkMorning).forEach((s) => R.tick(r.id, s.id, true, { now: at("19:03"), day }));
  const e = R.entry(r.id, day);
  assert(e && (e.done || e.min), "kept");
  assert(e.late, "recorded as kept late");
  assert(e.paid, "and still paid");
});

step("K · SH-30 a notice opens its record", async () => {
  const rt = K.router;
  eq(rt.routeFor("routines", { review: "evening" }), "#/routines/review/evening", "a review has an address");
  eq(rt.parse("#/routines/review/evening").arg, { review: "evening" }, "and reads back");
  eq(rt.parse("#/routines/routine/abc").arg, { routine: "abc" }, "a routine too");
  eq(K.notify.hashOf({ view: "goals", arg: { id: 7 } }), "#/goals/7", "a goal notice's address");
  /* goal notices carry the goal */
  const fake = [{ id: 7, title: "Read", _status: "completed", completedAt: at("09:00") }];
  const ns = K.goals.notices(fake, "2026-09-24");
  assert(ns.length && ns[0].arg && ns[0].arg.id === 7, "a goal notice opens its goal: " + JSON.stringify(ns[0]));
  /* the routine notice lands on its routine */
  const r = K.routines.all().filter((x) => x.template === "morning")[0];
  K.show("routines", { routine: r.id }); await app.settle(); await app.settle();
  assert(q("[data-routine='" + r.id + "']"), "the routine is on the page");
  /* the review notice opens the review */
  K.show("routines", { review: "evening" }); await app.settle(); await app.settle();
  assert(K.reviewSheet && K.reviewSheet.isOpen(), "the review opened");
  eq(K.reviewSheet.slot(), "evening", "the evening one");
  K.reviewSheet.close(true); await app.settle();
  /* the closed-app path: the runner passes the hash on, the worker opens it */
  const Lg = await import(path.join(ROOT, "supabase/functions/runner/logic.ts"));
  eq(Lg.pushMessage({ id: "x", kind: "review", title: "t", body: "", view: "routines", arg: { review: "evening" }, hash: "#/routines/review/evening" }).hash, "#/routines/review/evening", "the push carries the address");
  eq(Lg.pushMessage({ id: "x", kind: "k", title: "t", body: "", view: "v", arg: null, hash: "https://evil.example/" }).hash, null, "only a #/ route");
  const sw = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
  assert(/data\.hash/.test(sw) && /hash: typeof m\.hash === "string"/.test(sw), "the worker opens the carried address");
});

step("L · EX-24 Analytics opens on the evidence; Calibration says all papers", async () => {
  const X = K.exams;
  const near = X.add ? X.add({ title: "Near topic test", tier: "topic_test", subject: "compsci", date: "2026-10-01" }) : null;
  const far = X.add ? X.add({ title: "Far mock", tier: "mock", subject: "maths", date: "2026-12-01" }) : null;
  if (!near || !far) { console.log("       (no KOS.exams.add — L checks the label only)"); }
  else {
    K.tracker.add({ kind: "paper", subject: "maths", paper: "Paper 1", date: "2026-09-20", marks: 40, max: 80, assessmentId: far.id,
      questions: [{ q: "1", got: 4, max: 5 }] });
  }
  K.show("exams", { tab: "practice", sub: "analytics" }); await app.settle(); await app.settle();
  const cal = q("[data-ui~='exams.a-cal']");
  assert(cal && /all your papers/.test(cal.textContent), "Calibration says it reads all papers");
  if (near && far) {
    const active = qa("[data-ui~='exams.analytics'] [aria-selected='true'], [data-ui~='exams.analytics'] [aria-current='true'], [data-ui~='exams.analytics'] [aria-pressed='true']").map((n) => n.textContent).join(" | ");
    assert(/Far mock/.test(active), "opens on the assessment with a marked paper: " + active);
  }
});

step("M · JM-32 badges nothing can earn yet are not released yet", async () => {
  const defs = K.achievements.defs();
  ["voice", "immersion", "sentence-miner"].forEach((id) => {
    const d = defs.filter((x) => x.id === id)[0];
    assert(d && d.soon, id + " is marked not released yet");
  });
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
  console.log("smoke193: all " + steps.length + " steps passed");
  process.exit(0);
})();
