/* Kurenai OS — smoke147.test.js
   W1's remaining P2/P3s on Opus (quality audit, 16 November 2026).

   The claims:

     A · A DRILL PAYS FOR WORK (CR-32). A batch where no control moved pays
         nothing and logs nothing; a batch with a moved control pays.
     B · A CHECK OPENS AS IT WAS ANSWERED (CR-15), says when, and names a
         pass turning into Not yet on its button.
     C · THE SHRINE'S FILTERED ORDER FILLS ITS OWN SLOTS (CL-17).
     D · A DELETED VAULT ENTRY CAN COME BACK (CL-25): restoreDeleted puts the
         row back under its own id and withdraws its pending deletion.
     E · A MONTHLY REPEAT KEEPS ITS DAY (PR-26): 31 Jan → 28 Feb → 31 Mar.
     F · A WEEK BEGINS ON A MONDAY (PR-28): a mid-week date is snapped, an
         overlapping one refused, a default label follows the date, and a
         note edit never moves a week.
     G · THE SEAT'S BANNER UPLOAD IS THE SHOP'S UNLOCK (SC-32).
     H · A FOLDED CS LEAF MERGES INTO THE KEPT ONE (CC-15): the further
         status, every check, the larger confidence, both notes.
     I · SAVED REPORTS RIDE THE BACKUP (AA-13, DI-09), and a pot's picture
         rides Money's.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke147.test.js                                           */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

let app, K, doc;
const $ = (s) => doc.querySelector(s);
const $$ = (s) => [...doc.querySelectorAll(s)];
function click(n) { assert(n, "nothing to click"); n.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true })); }
const p = (fn) => new Promise((res, rej) => fn((err, out) => err ? rej(err) : res(out)));

step("boot", async () => {
  app = await boot({ clock: "2026-11-16T10:00:00" });
  K = app.KOS; doc = app.document;
  eq(app.errors, [], "boot errors");
});

/* ---------------- A ---------------- */
function drillSessions() { return K.store.state.sessions.filter((e) => e.type === "creatives" && e.metrics && e.metrics.kind === "drill").length; }
async function runBatch(move) {
  for (let g = 0; g < 12; g++) {
    const btn = $("[data-ui~='cr.drill-check'], [data-ui~='cr.drill-next']");
    if (!btn) break;
    if (move && btn.matches("[data-ui~='cr.drill-check']")) {
      const ctl = $$(".k-crd-stage button").find((b) => !b.matches("[data-ui~='cr.drill-check'], [data-ui~='cr.drill-next']"));
      if (ctl) click(ctl);
    }
    click(btn); await app.settle();
  }
}
step("A · a drill batch with nothing moved pays nothing and logs nothing", async () => {
  K.show("creatives", { page: "drills", id: "pairing" }); await app.settle();
  const n0 = drillSessions();
  await runBatch(false);
  assert($("[data-ui~='cr.drill-summary']"), "the summary");
  assert(/nothing was changed/.test($("[data-ui~='cr.drill-pay']").textContent), "says why: " + $("[data-ui~='cr.drill-pay']").textContent);
  eq(drillSessions(), n0, "no session logged");
  eq(!!K.creatives.peek().paid["drill:pairing:2026-11-16"], false, "the day's pay not spent");
});
step("A · a batch with a moved control pays", async () => {
  K.show("home"); await app.settle();
  K.show("creatives", { page: "drills", id: "pairing" }); await app.settle();
  const n0 = drillSessions();
  await runBatch(true);
  eq(drillSessions(), n0 + 1, "one session");
  assert(/\+\d+ XP/.test($("[data-ui~='cr.drill-pay']").textContent), "paid: " + $("[data-ui~='cr.drill-pay']").textContent);
});

/* ---------------- B ---------------- */
step("B · a check opens as it was answered, and a pass turning into Not yet says so", async () => {
  const L = Object.keys(K_CR().LESSONS).map((id) => K_CR().LESSONS[id]).find((l) => l && l.check && l.check.rows && l.check.rows.length && (l.studies || []).length);
  assert(L, "a released lesson with a check");
  const wid = K.creatives.addWork({ kind: "text", title: "A study", lesson: L.id, study: L.studies[0].id });
  K.creatives.setCheck(wid, { rows: L.check.rows.map(() => true), note: "kept the hierarchy" });
  K.show("creatives", { page: "check", id: wid }); await app.settle();
  assert(/Checked .* · passed/.test(($("[data-ui~='cr.check-earlier']") || {}).textContent || ""), "when and how it was checked");
  const yes = $$("[data-ui~='cr.choice'][aria-pressed='true']");
  eq(yes.length, L.check.rows.length, "the earlier answers are filled in");
  eq($(".k-cr-checknote").value, "kept the hierarchy", "and the note");
  const notYet = $$("[data-ui~='cr.choice']").find((b) => /Not yet/.test(b.textContent));
  click(notYet); await app.settle();
  eq($("[data-ui~='cr.check-save']").textContent, "Change to Not yet", "the button names the change");
});
function K_CR() { return app.window.KOS_CR; }

/* ---------------- C ---------------- */
step("C · a filtered tie order fills only its own slots", () => {
  const merge = K.shrineMergeOrder;
  assert(typeof merge === "function", "the merge");
  eq(merge(["a", "x", "b", "y", "c"], ["c", "a", "b"]), ["c", "x", "a", "y", "b"], "the hidden titles keep their places");
  eq(merge([], ["b", "a"]), ["b", "a"], "a tier never ordered takes the new order");
  eq(merge(["a", "x"], ["n", "a"]), ["n", "x", "a"], "a title new to the order lands after");
});

/* ---------------- D ---------------- */
step("D · a deleted entry comes back under its own id, its deletion withdrawn", async () => {
  const rec = await p((cb) => K.mediadb.add({ module: "game", title: "Undo me", status: "planned", notes: "my notes" }, cb));
  const id = rec.id, sync = rec.syncId;
  await p((cb) => K.mediadb.remove(id, cb));
  let q = await p((cb) => K.mediadb.getKV("cloudsync.pendingDeletes", cb));
  assert((q || []).some((t) => t.syncId === sync), "the deletion is queued");
  await p((cb) => K.mediadb.restoreDeleted(rec, cb));
  const back = await p((cb) => K.mediadb.get(id, cb));
  assert(back && back.title === "Undo me" && back.notes === "my notes" && back.syncId === sync, "back, whole, under its id");
  q = await p((cb) => K.mediadb.getKV("cloudsync.pendingDeletes", cb));
  assert(!(q || []).some((t) => t.syncId === sync), "the deletion is withdrawn");
});

/* ---------------- E ---------------- */
step("E · a monthly repeat keeps the day it was set on", () => {
  const r = K.reminders.add({ title: "Rent", due: "2027-01-31", recur: "monthly" });
  eq(r.recurDay, 31, "the day is remembered");
  const feb = K.reminders.nextOccurrence(r);
  eq(feb, "2027-02-28", "clamped in February");
  eq(K.reminders.nextOccurrence(Object.assign({}, r, { due: feb })), "2027-03-31", "back to the 31st in March");
  const y = K.reminders.add({ title: "Leap", due: "2028-02-29", recur: "yearly" });
  const n1 = K.reminders.nextOccurrence(y), n4 = ["x", "x", "x"].reduce((d) => K.reminders.nextOccurrence(Object.assign({}, y, { due: d })), n1);
  eq([n1, n4], ["2029-02-28", "2032-02-29"], "a leap day comes back in a leap year");
});

/* ---------------- F ---------------- */
step("F · a week begins on a Monday and never overlaps another", () => {
  const P = K.pacing;
  const w = P.addWeek({ wb: "2027-06-09", label: "" });           /* a Wednesday */
  assert(w, "added");
  eq([w.wb, w.label], ["2027-06-07", "w/c 7 June"], "snapped to its Monday, the label follows");
  eq(P.addWeek({ wb: "2027-06-11" }), null, "a date inside it is refused");
  const w2 = P.addWeek({ wb: "2027-06-14" });
  eq(P.updateWeek(w2.wb, { wb: "2027-06-10" }), null, "moving into another week is refused");
  const moved = P.updateWeek(w2.wb, { wb: "2027-06-23", label: "w/c 14 June" });
  eq([moved.wb, moved.label], ["2027-06-21", "w/c 21 June"], "moved to a Monday; the default label follows");
  const noted = P.updateWeek(moved.wb, { wb: moved.wb, note: "mocks" });
  eq([noted.wb, noted.note], ["2027-06-21", "mocks"], "a note edit leaves the week where it is");
});

/* ---------------- G ---------------- */
step("G · the seat's banner upload needs the shop's unlock", async () => {
  K.show("governor", "edit"); await app.settle();
  const tab = $$("[data-ui~='ui.tab'], [role=tab]").find((b) => /Background/.test(b.textContent));
  assert(tab, "the Background tab");
  click(tab); await app.settle();
  assert($("[data-ui~='gov.bg-locked']") && !$("[data-ui~='gov.bg-upload']"), "locked without the unlock");
  K.store.state.governor.owned.push("upload-banner");
  K.show("home"); await app.settle();
  K.show("governor", "edit"); await app.settle();
  click($$("[data-ui~='ui.tab'], [role=tab]").find((b) => /Background/.test(b.textContent))); await app.settle();
  assert($("[data-ui~='gov.bg-upload']") && !$("[data-ui~='gov.bg-locked']"), "open with it");
  K.store.state.governor.owned = K.store.state.governor.owned.filter((x) => x !== "upload-banner");
  K.show("home"); await app.settle();
});

/* ---------------- H ---------------- */
step("H · a folded leaf's record is merged into the kept one", () => {
  const s = JSON.parse(JSON.stringify(K.store.state));
  s.progress = Object.assign({}, s.progress, {
    "compsci:4.5.1.1": { status: "started", conf: 1, check: [true, false, false, false], note: "" },
    "compsci:4.5.1.3": { status: "done", conf: 3, check: [true, true, true, true], note: "binary by hand" },
    "compsci:4.5.1.5": { status: "started", conf: 2, check: [false, true, false, false], note: "" }
  });
  K.store.replaceState(s);
  const kept = K.store.state.progress["compsci:4.5.1.1"];
  assert(!K.store.state.progress["compsci:4.5.1.3"] && !K.store.state.progress["compsci:4.5.1.5"], "the members folded away");
  eq([kept.status, kept.conf, kept.check], ["done", 3, [true, true, true, true]], "the further status, the higher confidence, every check");
  assert(/binary by hand/.test(kept.note), "the member's note kept: " + kept.note);
});

/* ---------------- I ---------------- */
step("I · saved reports and a pot's picture ride the backup", async () => {
  await p((cb) => K.reportStore.importAll({ reports: [{ id: "week:2026-11-02", kind: "week", start: "2026-11-02", facts: {} }], snapshots: [{ id: "2026-11-02", takenAt: 1 }] }, cb));
  const pot = K.money.addPot({ name: "Laptop", target: 900 });
  assert(pot && pot.id, "a pot");
  await new Promise((res) => K.money.setPic(pot.id, { src: "data:image/png;base64,AAAA", crop: null }, () => res()));
  const snap = await p((cb) => K.store.snapshotFull(cb));
  assert(snap.reports && snap.reports.reports.some((r) => r.id === "week:2026-11-02") && snap.reports.snapshots.length === 1, "reports in the file");
  assert(snap.money && snap.money.pics.some((x) => x.id === pot.id), "the pot's picture in the file");
  eq(K.stores.get("reports").backup, "reports", "the registry says the file carries them");
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack || e)); }
  }
  console.log(failed ? `\n${failed} of ${steps.length} step(s) failed` : `\nall ${steps.length} steps passed`);
  process.exit(failed ? 1 : 0);
})();
