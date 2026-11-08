/* Kurenai OS — smoke120.test.js
   Daylight saving and the 04:00 routine day (quality programme W0, §A7).

   Europe/London's two transitions in 2026: clocks go BACK at 02:00 BST on
   Sunday 25 October (01:00–01:59 happens twice) and FORWARD at 01:00 GMT
   on Sunday 29 March (01:00–01:59 never happens). Every instant below is
   written in UTC so the wall time it lands on is exact.

   The claims:

     A · THE ROUTINE DAY (invariant 148): before 04:00 local is the day
         before, through the repeated and the missing hour; a tick in the
         repeated hour lands on the night before, and a routine's streak
         runs on across both weekends.
     B · ONE REVIEW, NEVER TWICE (invariant 145): an evening review closed
         in the first 01:xx is not offered again in the second; it stays
         on the chip (recent) until its 8 h hold, and the next morning's
         review is offered in its own day — on both transitions.
     C · THE STUDY STREAK (invariant 4) counts CALENDAR days: a session at
         00:30 BST on 25 October is dated the 25th (not the UTC 24th), and
         a run of days across each transition is unbroken.
     D · REPORTS' WEEK: Monday to Sunday across each transition; a week is
         ready at 07:00 local on the following Monday; monday() holds for
         every day of 2026.
     E · KOS.srs DAY ARITHMETIC: addDays and daysBetween are exact across
         both transitions and invert each other for every day of 2026;
         todayISO is the local calendar day.

   Run: node tools/smoke120.test.js */
"use strict";
process.env.TZ = "Europe/London";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const U = (y, mo, d, h, mi) => Date.UTC(y, mo - 1, d, h, mi || 0);
let app, K, W, T = U(2026, 10, 20, 11);
/* a clock the test sets: the harness's Date is replaced by one that reads T */
function setClock(t) { T = t; }
function wall(t) { const d = new W.Date(t); return d.toString(); }

step("boot (Europe/London)", async () => {
  app = await boot({ clock: "2026-10-20T12:00:00" });
  K = app.KOS; W = app.window;
  const Base = W.Date;
  class Clock extends Base {
    constructor(...a) { if (a.length) super(...a); else super(T); }
    static now() { return T; }
  }
  W.Date = Clock;
  setClock(U(2026, 10, 20, 11));
  eq(new W.Date().getTimezoneOffset(), -60, "20 October is BST (UTC+1)");
  eq(new W.Date(U(2026, 10, 26, 12)).getTimezoneOffset(), 0, "26 October is GMT");
  eq(new W.Date(U(2026, 3, 29, 3)).getTimezoneOffset(), -60, "29 March 03:00Z is BST");
  /* the repeated hour really is repeated in this runtime */
  eq(new W.Date(U(2026, 10, 25, 0, 30)).getHours(), 1, "00:30Z on 25 Oct is 01:30 BST");
  eq(new W.Date(U(2026, 10, 25, 1, 30)).getHours(), 1, "01:30Z on 25 Oct is 01:30 GMT");
  eq(new W.Date(U(2026, 3, 29, 0, 59)).getHours(), 0, "00:59Z on 29 Mar is 00:59 GMT");
  eq(new W.Date(U(2026, 3, 29, 1, 0)).getHours(), 2, "01:00Z on 29 Mar is 02:00 BST");
  assert(!app.errors.filter((e) => /LOAD FAIL/.test(e)).length, "scripts load: " + app.errors.join(" | "));
});

step("A · the 04:00 routine day across both transitions", async () => {
  const R = K.routines;
  eq(R.dayStart(), "04:00", "the default day start");
  const cases = [
    [U(2026, 10, 24, 23, 30), "2026-10-24", "00:30 BST on the 25th"],
    [U(2026, 10, 25, 0, 30), "2026-10-24", "01:30 BST, the first pass"],
    [U(2026, 10, 25, 1, 30), "2026-10-24", "01:30 GMT, the second pass"],
    [U(2026, 10, 25, 3, 59), "2026-10-24", "03:59 GMT"],
    [U(2026, 10, 25, 4, 0), "2026-10-25", "04:00 GMT starts the 25th"],
    [U(2026, 10, 26, 3, 59), "2026-10-25", "03:59 GMT on the 26th"],
    [U(2026, 10, 26, 4, 0), "2026-10-26", "04:00 GMT on the 26th"],
    [U(2026, 3, 28, 23, 30), "2026-03-28", "23:30 GMT on the 28th"],
    [U(2026, 3, 29, 0, 59), "2026-03-28", "00:59 GMT, the last minute before the jump"],
    [U(2026, 3, 29, 1, 0), "2026-03-28", "02:00 BST, the first minute after it"],
    [U(2026, 3, 29, 2, 59), "2026-03-28", "03:59 BST"],
    [U(2026, 3, 29, 3, 0), "2026-03-29", "04:00 BST starts the 29th"],
    [U(2026, 3, 30, 2, 59), "2026-03-29", "03:59 BST on the 30th"]
  ];
  cases.forEach(([t, want, why]) => eq(R.routineDay(t), want, "routine day at " + why + " (" + wall(t) + ")"));

  /* a habit ticked across the clocks-back weekend */
  setClock(U(2026, 10, 20, 11));
  const h = R.addHabit("Read ten pages");
  assert(h && h.id, "a habit");
  const tick = (t) => { setClock(t); return R.tick(h.id, h.steps[0].id, true, { now: t }); };
  assert(tick(U(2026, 10, 23, 19)).ok, "ticked on the 23rd");
  const r1 = tick(U(2026, 10, 25, 0, 30));
  assert(r1.ok, "ticked at 01:30 BST: " + r1.why);
  assert(R.entry(h.id, "2026-10-24") && R.entry(h.id, "2026-10-24").done, "the 01:30 BST tick kept the 24th");
  const r2 = tick(U(2026, 10, 25, 1, 30));
  assert(r2.ok, "the second 01:30 (GMT) is still the 24th's: " + r2.why);
  assert(!R.entry(h.id, "2026-10-25"), "nothing landed on the 25th from the repeated hour");
  assert(tick(U(2026, 10, 25, 4, 30)).ok, "04:30 GMT ticks the 25th");
  assert(R.entry(h.id, "2026-10-25") && R.entry(h.id, "2026-10-25").done, "the 25th kept");
  eq(R.streak(h.id, U(2026, 10, 26, 12)), 3, "the streak runs 23rd–25th unbroken on the 26th");
  /* and across the clocks-forward weekend */
  setClock(U(2026, 3, 20, 11));
  const m = R.addHabit("Stretch");
  const tickM = (t) => { setClock(t); return R.tick(m.id, m.steps[0].id, true, { now: t }); };
  assert(tickM(U(2026, 3, 27, 19)).ok, "the 27th");
  assert(tickM(U(2026, 3, 29, 1, 30)).ok, "02:30 BST on the 29th, the 28th's");
  assert(R.entry(m.id, "2026-03-28") && R.entry(m.id, "2026-03-28").done, "kept the 28th");
  assert(tickM(U(2026, 3, 29, 9)).ok, "the 29th");
  eq(R.streak(m.id, U(2026, 3, 30, 12)), 3, "the streak runs 27th–29th unbroken on the 30th");
});

step("B · a closed review is never offered again across the repeated or missing hour", async () => {
  const D = K.dayReview;
  /* Saturday 24 October: the weekend evening review is 22:30 */
  let t = U(2026, 10, 24, 22);                    // 23:00 BST
  setClock(t);
  let d = D.due(t);
  assert(d && d.slot === "evening" && d.day === "2026-10-24", "the evening review is due at 23:00 BST: " + JSON.stringify(d));
  t = U(2026, 10, 25, 0, 15);                     // 01:15 BST, first pass
  setClock(t);
  D.finish("evening", "done", t);
  eq(D.due(t), null, "closed at 01:15 BST");
  const second = U(2026, 10, 25, 1, 10);          // 01:10 GMT: an earlier wall time, a later instant
  setClock(second);
  eq(D.due(second), null, "not offered again at 01:10 GMT");
  const rc = D.recent(second);
  assert(rc && rc.slot === "evening" && rc.day === "2026-10-24" && rc.state === "done", "still on the chip: " + JSON.stringify(rc));
  const at4 = U(2026, 10, 25, 4);                 // 04:00 GMT: the 25th starts
  setClock(at4);
  eq(D.due(at4), null, "nothing due at the day's start");
  eq(D.recent(at4), null, "the 24th's review is not the 25th's chip");
  const late = U(2026, 10, 25, 9, 15);            // 8 h hold long past; the weekend morning is 09:00
  setClock(late);
  d = D.due(late);
  assert(d && d.slot === "morning" && d.day === "2026-10-25", "Sunday's morning review is due: " + JSON.stringify(d));
  eq(d.yesterday, false, "last night's closed review is not folded in");
  /* clocks forward: Saturday 28 March */
  t = U(2026, 3, 28, 22, 45);                     // 22:45 GMT
  setClock(t);
  d = D.due(t);
  assert(d && d.slot === "evening" && d.day === "2026-03-28", "the evening review is due: " + JSON.stringify(d));
  t = U(2026, 3, 29, 0, 50);                      // 00:50 GMT, just before the jump
  setClock(t);
  D.finish("evening", "skipped", t);
  const after = U(2026, 3, 29, 1, 5);             // 02:05 BST
  setClock(after);
  eq(D.due(after), null, "not offered again after the jump");
  const r2 = D.recent(after);
  assert(r2 && r2.day === "2026-03-28" && r2.state === "skipped", "on the chip after the jump: " + JSON.stringify(r2));
  const morning = U(2026, 3, 29, 8, 5);           // 09:05 BST
  setClock(morning);
  d = D.due(morning);
  assert(d && d.slot === "morning" && d.day === "2026-03-29" && !d.yesterday, "Sunday's morning review: " + JSON.stringify(d));
  /* the hold is real time: 8 h after the skip, not 8 wall hours */
  const hold = U(2026, 3, 29, 0, 50) + 8 * 3600e3 + 60e3;
  eq(D.recent(hold), null, "the chip clears 8 real hours after closing");
});

step("C · the study streak counts calendar days across both transitions", async () => {
  const S = K.store.state;
  S.sessions = S.sessions.filter((e) => e.type === "todo");     // keep only the routine ticks from A
  const log = (t) => { setClock(t); return K.sessions.log({ type: "flashcards", subject: "compsci", ref: "4.1.1.1", dur: 600, metrics: { cards: 10 } }); };
  const e1 = log(U(2026, 10, 24, 23, 30));        // 00:30 BST on the 25th
  eq(e1 && e1.date, "2026-10-25", "00:30 BST is the 25th, not the UTC 24th");
  log(U(2026, 10, 23, 20));
  log(U(2026, 10, 24, 12));
  log(U(2026, 10, 26, 18));
  setClock(U(2026, 10, 26, 20));
  eq(K.sessions.streak(null), 4, "23rd–26th is a run of four");
  eq(K.sessions.streaks().best, 4, "the best run agrees");
  /* the repeated hour adds no day and breaks nothing */
  const e2 = log(U(2026, 10, 25, 1, 30));         // 01:30 GMT
  eq(e2.date, "2026-10-25", "01:30 GMT is the 25th");
  setClock(U(2026, 10, 26, 20));
  eq(K.sessions.streak(null), 4, "still four");
  /* clocks forward */
  S.sessions = S.sessions.filter((e) => e.type === "todo");
  const f = [U(2026, 3, 27, 18), U(2026, 3, 28, 23, 30), U(2026, 3, 29, 1, 15), U(2026, 3, 30, 7)].map(log);
  eq(f.map((e) => e.date), ["2026-03-27", "2026-03-28", "2026-03-29", "2026-03-30"], "each session's calendar day");
  setClock(U(2026, 3, 30, 12));
  eq(K.sessions.streak(null), 4, "27th–30th is a run of four");
  /* a missed day is still a break, so the check is not vacuous */
  S.sessions = S.sessions.filter((e) => e.date !== "2026-03-29");
  eq(K.sessions.streak(null), 1, "with the 29th missing the run is one");
});

step("D · Reports' weeks start on Monday and are ready at 07:00 local", async () => {
  const R = K.report;
  eq(R.week("2026-10-25"), { period: "week", id: "week:2026-10-19", start: "2026-10-19", end: "2026-10-25" }, "the clocks-back Sunday ends its week");
  eq(R.week("2026-10-26").start, "2026-10-26", "the Monday after starts the next");
  eq(R.week("2026-03-29").start, "2026-03-23", "the clocks-forward Sunday ends its week");
  eq(R.week("2026-03-30").start, "2026-03-30", "and the Monday after starts the next");
  eq(R.readyAt(R.week("2026-10-25")), U(2026, 10, 26, 7), "ready Monday 26 Oct 07:00 GMT");
  eq(R.readyAt(R.week("2026-03-29")), U(2026, 3, 30, 6), "ready Monday 30 Mar 07:00 BST");
  assert(!R.isReady(R.week("2026-10-25"), U(2026, 10, 26, 6, 59)), "not before 07:00");
  assert(R.isReady(R.week("2026-10-25"), U(2026, 10, 26, 7)), "ready at 07:00");
  eq(R.addDays("2026-10-25", 1), "2026-10-26", "report addDays over clocks back");
  eq(R.addDays("2026-03-29", -1), "2026-03-28", "report addDays over clocks forward");
  /* every day of 2026 sits in a Monday-to-Sunday week that holds it */
  let d = "2026-01-01";
  for (let i = 0; i < 365; i++) {
    const w = R.week(d);
    const wd = new W.Date(+w.start.slice(0, 4), +w.start.slice(5, 7) - 1, +w.start.slice(8, 10)).getDay();
    if (wd !== 1 || !(w.start <= d && d <= w.end)) throw new Error("week of " + d + " is " + JSON.stringify(w));
    d = R.addDays(d, 1);
  }
  eq(d, "2027-01-01", "365 report days");
});

step("E · KOS.srs day arithmetic", async () => {
  const S = K.srs;
  eq(S.addDays("2026-10-24", 1), "2026-10-25", "+1 into clocks back");
  eq(S.addDays("2026-10-25", 1), "2026-10-26", "+1 out of clocks back");
  eq(S.addDays("2026-10-26", -1), "2026-10-25", "−1 into clocks back");
  eq(S.addDays("2026-03-28", 1), "2026-03-29", "+1 into clocks forward");
  eq(S.addDays("2026-03-29", 1), "2026-03-30", "+1 out of clocks forward");
  eq(S.addDays("2026-03-30", -1), "2026-03-29", "−1 into clocks forward");
  eq(S.addDays("2026-03-20", 14), "2026-04-03", "a fortnight over the jump");
  eq(S.addDays("2026-10-20", 7), "2026-10-27", "a week over the fall back");
  if (S.daysBetween) {
    eq(S.daysBetween("2026-03-28", "2026-03-30"), 2, "two days over the jump");
    eq(S.daysBetween("2026-10-24", "2026-10-26"), 2, "two days over the fall back");
  }
  let d = "2026-01-01";
  const seen = new Set();
  for (let i = 0; i < 365; i++) {
    const n = S.addDays(d, 1);
    if (S.addDays(n, -1) !== d) throw new Error("addDays does not invert at " + d);
    if (n <= d) throw new Error("addDays went backwards at " + d);
    seen.add(d); d = n;
  }
  eq(seen.size, 365, "365 distinct days");
  eq(d, "2027-01-01", "a year of +1 is a year");
  const today = [
    [U(2026, 10, 24, 23, 30), "2026-10-25"], [U(2026, 10, 25, 0, 30), "2026-10-25"], [U(2026, 10, 25, 1, 30), "2026-10-25"],
    [U(2026, 10, 25, 23, 59), "2026-10-25"], [U(2026, 3, 28, 23, 59), "2026-03-28"], [U(2026, 3, 29, 0, 0), "2026-03-29"],
    [U(2026, 3, 29, 1, 0), "2026-03-29"], [U(2026, 3, 29, 22, 59), "2026-03-29"], [U(2026, 3, 29, 23, 0), "2026-03-30"]
  ];
  today.forEach(([t, want]) => { setClock(t); eq(S.todayISO(), want, "todayISO at " + wall(t)); });
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  console.log(failed ? "smoke120: " + failed + " failed" : "smoke120: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
