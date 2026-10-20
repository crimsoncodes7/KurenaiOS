/* Kurenai OS — smoke89.test.js
   The Exams & Deadlines hub, phase 1 (roadmap 5.8, docs/exams-plan.md).

   The claims:

     A · ONE RECORD. An assessment is normalised by tier: the FSRS cap is
         forced on for a real exam, opt-in for a mock, never for a test or a
         deadline; a board paper preset fills its marks, time and scope;
         ids are random strings (the merge never re-keys them).
     B · THE MIGRATION. A one-off calendar exam becomes an assessment and
         its event is kept, hidden (`migratedTo`); a recurring exam stays an
         event; an IT unit still to sit becomes a real exam (F201) or a
         deadline (an NEA unit); a second pass moves nothing.
     C · THE SCOPE. include ∪ covered-in-Pacing − exclude, exclusions always
         winning; the Pacing rule grows with the plan while the assessment
         is ahead and FREEZES once its date has passed or its result is in,
         so a later Pacing edit never moves a past mock's scope.
     D · THE CAP BY SCOPE. A real exam caps only the cards its scope holds
         (a Pure paper never caps a statistics card); a mock caps nothing
         until its cap is turned on.
     E · ATTEMPTS. The tracker record carries the attempt's optional fields;
         typed question marks fill a blank total and never override a
         typed one; a "result" attempt fills its assessment's result and
         an IT unit's raw mark through KOS.itUnits.
     F · REDO ITEMS. A question marked redo is a review item due tomorrow,
         on its question's leaf, weighing its marks in topic memory;
         unmarking it or deleting the attempt removes its schedule.
     G · THE CALENDAR draws assessments as derived events (never stored),
         and an IT unit's date and its assessment's follow each other.
     H · START-BY is derived from tier, scope and weekly hours, and an
         override wins.
     I · RENDERS WRITE NOTHING. The timetable, an assessment's page, the
         Practice record and the editor draw without writing state.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke89.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-10-20";
function day(n) {
  const [y, m, d] = TODAY.split("-").map(Number);
  const x = new Date(y, m - 1, d + n);
  return x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
}

/* a returning user's calendar, written before the hub existed */
const LEGACY = {
  progress: {},
  calendar: { v: 2, nextId: 4, notified: {}, events: [
    { id: 1, v: 2, type: "exam", title: "CS Paper 2 mock", date: day(30), subject: "compsci", examLevel: "mock", refs: ["compsci:4.5"], room: "Hall", time: "09:00", durationMins: 150, alerts: [4320], recur: "none", allDay: false },
    { id: 2, v: 2, type: "exam", title: "Weekly vocab quiz", date: day(-7), subject: "maths", examLevel: "retrieval", refs: [], recur: "weekly", alerts: [], allDay: true },
    { id: 3, v: 2, type: "exam", title: "Maths Paper 1", date: day(60), subject: "maths", examLevel: "exam", refs: [], recur: "none", alerts: [], allDay: true }
  ] },
  itUnits: { v: 1, seeded: true, target: "Distinction*", year1: null, units: {
    F200: { status: "done", raw: 50, ums: null, series: "", year: 1, date: null },
    F201: { status: "sitting", raw: null, ums: null, series: "", year: 2, date: day(90) },
    F202: { status: "done", raw: 20, ums: null, series: "", year: 1, date: null },
    F204: { status: "sitting", raw: null, ums: null, series: "", year: 2, date: day(40) },
    F206: { status: "sitting", raw: null, ums: null, series: "", year: 2, date: null }
  } }
};

let app, K;
step("boot a returning user", async () => {
  app = await boot({ clock: TODAY + "T10:00:00", storage: { "kurenai-os-v1": JSON.stringify(LEGACY) } });
  K = app.KOS;
  eq(app.errors, [], "boot errors");
});

/* ---------------- A ---------------- */
step("A · tiers decide the cap; a preset fills the paper; ids are strings", () => {
  const X = K.exams;
  const real = X.normalise({ tier: "real_exam", cap: false, title: "x" });
  const mock = X.normalise({ tier: "mock", title: "x" });
  const mockOn = X.normalise({ tier: "mock", cap: true, title: "x" });
  const topic = X.normalise({ tier: "topic_test", cap: true, title: "x" });
  eq([real.cap, mock.cap, mockOn.cap, topic.cap], [true, false, true, false], "cap by tier");
  const p = X.normalise({ preset: "edexcel-9ma0-3" });
  eq([p.subject, p.marks, p.durationMins, p.calculator], ["maths", 100, 120, "allowed"], "preset facts");
  eq(p.scope.include, ["maths:Statistics", "maths:Mechanics"], "the paper's scope");
  assert(typeof p.id === "string" && p.id.length >= 6, "random string id");
  eq(X.normalise({ tier: "nonsense" }).tier, "real_exam", "an unknown tier reads as a real exam");
});

/* ---------------- B ---------------- */
step("B · calendar exams and IT units move into the hub once", () => {
  const all = K.exams.all();
  const mock = all.find((a) => a.title === "CS Paper 2 mock");
  assert(mock, "the one-off mock moved");
  eq([mock.tier, mock.date, mock.time, mock.durationMins, mock.location, mock.links.calendarId], ["mock", day(30), "09:00", 150, "Hall", 1], "its fields");
  eq(mock.scope.include, ["compsci:4.5"], "its topic links became its scope");
  const p1 = all.find((a) => a.title === "Maths Paper 1");
  assert(p1 && p1.tier === "real_exam" && p1.scope.include.length === 19, "a subject-only exam covers the whole subject's units: " + (p1 && p1.scope.include.length));
  const evs = K.store.state.calendar.events;
  assert(evs.find((e) => e.id === 1).migratedTo === mock.id, "the event is kept, marked");
  assert(!evs.find((e) => e.id === 2).migratedTo, "a recurring exam stays an event");
  const f201 = all.find((a) => a.links.itUnit === "F201"), f204 = all.find((a) => a.links.itUnit === "F204");
  eq([f201.tier, f201.date, f201.scope.include], ["real_exam", day(90), ["it:F201"]], "F201 is a real exam");
  eq([f204.tier, f204.date], ["deadline", day(40)], "an NEA unit is a deadline");
  assert(!all.find((a) => a.links.itUnit === "F206"), "a unit with no date waits");
  eq(K.exams.migrate(), 0, "a second pass moves nothing");
});

/* ---------------- C ---------------- */
step("C · include ∪ Pacing − exclude; exclusions win", () => {
  const X = K.exams;
  const a = X.add({ title: "Unit test", tier: "topic_test", subject: "compsci", date: day(10),
    scope: { include: ["compsci:4.2"], exclude: ["compsci:4.2.6.1", "compsci:4.2.7.1"] } });
  const ls = X.leaves(a);
  assert(ls.indexOf("compsci:4.2.3.1") !== -1, "a leaf in the unit is in");
  assert(ls.indexOf("compsci:4.2.6.1") === -1 && ls.indexOf("compsci:4.2.7.1") === -1, "excluded leaves are out");
  eq(X.excluded(a).map((x) => x.ref), ["4.2.6.1", "4.2.7.1"], "the callout lists them");
  const b = X.update(a.id, { scope: { include: ["compsci:4.2"], exclude: ["compsci:4.2"] } });
  eq(X.leaves(b), [], "excluding the whole unit empties it");
});

step("C · the Pacing rule grows while ahead and freezes once passed", () => {
  const X = K.exams, P = K.pacing;
  const wk = P.weeks().filter((w) => K.srs.addDays(w.wb, 6) <= day(20)).slice(-1)[0];
  assert(wk, "a plan week ending before the test");
  const a = X.add({ title: "Rolling mock", tier: "mock", subject: "compsci", date: day(20), scope: { pacing: { upTo: null } } });
  const before = X.leaves(a).length;
  eq(a.scope.pacing.seen, before, "the count it was made with");
  const row = P.addEntry({ source: "personal", subject: "compsci", wb: wk.wb, title: "Hash tables", refs: ["4.2.6.1"] });
  const grown = X.leaves(X.get(a.id));
  assert(grown.indexOf("compsci:4.2.6.1") !== -1, "a newly planned leaf joins the rule");
  assert(X.ruleGrowth(X.get(a.id)) >= (before === grown.length ? 0 : 1), "the builder can say how much it grew");
  /* the test is sat: its date passes */
  K.store.state.exams.assessments[a.id].date = day(-1);
  eq(X.freezePass(), 1, "frozen once");
  const frozen = X.get(a.id).scope.pacing.frozen.slice();
  P.removeEntry(row.id);
  eq(X.leaves(X.get(a.id)).length, frozen.length, "a later Pacing edit does not move a past scope");
  eq(X.freezePass(), 0, "a second pass freezes nothing");
});

/* ---------------- D ---------------- */
step("D · a real exam caps only its scope; a mock only when asked", () => {
  const X = K.exams, S = K.srs;
  K.store.state.calendar.events = [];
  Object.keys(K.store.state.exams.assessments).forEach((id) => X.remove(id));
  const pure = X.add({ preset: "edexcel-9ma0-1", date: day(40) });
  eq(S.examFor("maths:2.3:0", TODAY), day(40), "a Pure card is held for Paper 1");
  eq(S.examFor("maths:S2.3:0", TODAY), null, "a statistics card is not");
  const mock = X.add({ tier: "mock", subject: "compsci", date: day(15), scope: { include: ["compsci:4.2"] } });
  eq(S.examFor("compsci:4.2.3.1:0", TODAY), null, "a mock caps nothing by default");
  X.update(mock.id, { cap: true });
  eq(S.examFor("compsci:4.2.3.1:0", TODAY), day(15), "an opted-in mock caps its scope");
  X.update(pure.id, { scope: { include: ["maths:Pure"], exclude: ["maths:P2"] } });
  eq(S.examFor("maths:2.3:0", TODAY), null, "an excluded leaf is never held");
});

/* ---------------- E ---------------- */
step("E · the attempt's fields are optional and question marks never override a total", () => {
  const T = K.tracker;
  const quick = T.add({ kind: "paper", paper: "Quick", marks: 40, max: 60 });
  eq([quick.role, quick.timed, quick.questions, quick.assessmentId], ["practice", false, [], null], "a quick log is as it was");
  assert(typeof quick.uid === "string" && quick.uid.length >= 6, "a uid");
  const filled = T.add({ kind: "paper", paper: "Per question", max: 20, questions: [{ q: "1", max: 8, got: 5, tags: ["slip", "bogus"] }, { q: "2", max: 12, got: 7 }] });
  eq(filled.marks, 12, "a blank total is filled from the questions");
  eq(filled.questions[0].tags, ["slip"], "only known tags survive");
  const typed = T.add({ kind: "paper", paper: "Typed", marks: 15, max: 20, questions: [{ q: "1", max: 20, got: 12 }] });
  eq(typed.marks, 15, "the typed total wins");
});

step("E · a result fills its assessment and the IT unit", () => {
  const X = K.exams, T = K.tracker;
  const a = X.syncItUnit("F201") || X.add({ title: "F201", tier: "real_exam", subject: "it", date: day(5), scope: { include: ["it:F201"] }, links: { itUnit: "F201" } });
  const e = T.add({ kind: "exam", paper: "F201", subject: "it", marks: 49, max: 60, grade: "D", assessmentId: a.id, role: "result" });
  const back = X.get(a.id);
  eq([back.result.attempt, back.result.marks, back.result.max], [e.uid, 49, 60], "the result links the attempt");
  eq([K.itUnits.get("F201").raw, K.itUnits.get("F201").status], [49, "done"], "the IT unit's raw mark, through setUnit");
  T.remove(e.id);
  eq(X.get(a.id).result, null, "deleting the attempt clears the link");
});

/* ---------------- F ---------------- */
step("F · a redo item is due tomorrow on its question's leaf, and goes with its question", () => {
  const T = K.tracker, S = K.srs;
  const e = T.add({ kind: "paper", paper: "June 2019 P1", subject: "maths", max: 100,
    questions: [{ q: "8", max: 10, got: 3, refs: ["maths:8.3"], tags: ["method"], redo: true }, { q: "9", max: 6, got: 6 }] });
  const key = "x:" + e.uid + ":8";
  const m = S.peek(key);
  eq([m && m.due, m && m.last], [day(1), null], "due tomorrow, never rated");
  const card = S.allCards().find((c) => c.key === key);
  assert(card && card.redo && card.sid === "maths" && card.ref === "8.3", "a card on its leaf: " + JSON.stringify(card));
  assert(/Redo · June 2019 P1 · Q8 · 10 marks/.test(card.q), "it names the question: " + card.q);
  assert(S.cardsFor("maths", "8.3").some((c) => c.key === key), "the topic's deck includes it");
  eq(S.weightOf(card), 10, "it weighs its marks");
  const tm = S.topicMemory("maths", "8.3", TODAY);
  eq([tm.redo, tm.redoLapsed], [1, 1], "topic memory counts it and flags it until passed");
  T.update(e.id, { questions: [{ q: "8", max: 10, got: 3, refs: ["maths:8.3"], redo: false }] });
  eq(S.peek(key), null, "unmarked: its schedule goes");
  T.update(e.id, { questions: [{ q: "8", max: 10, got: 3, refs: ["maths:8.3"], redo: true }] });
  assert(S.peek(key), "marked again");
  T.remove(e.id);
  eq(S.peek(key), null, "deleting the attempt removes it");
});

/* ---------------- G ---------------- */
step("G · the calendar draws assessments without storing them", () => {
  const X = K.exams, C = K.calendar;
  const a = X.add({ title: "Networking quiz", tier: "retrieval_test", subject: "compsci", date: day(2), time: "10:00", durationMins: 20, scope: { include: ["compsci:4.9"] } });
  const evs = C.eventsOn(day(2));
  const v = evs.find((e) => e.assessmentId === a.id);
  assert(v && v.type === "exam" && v.examLevel === "retrieval" && v.endTime === "10:20", "drawn as an exam: " + JSON.stringify(v));
  assert(C.deadlines().some((d) => d.ev.assessmentId === a.id), "in the countdowns");
  assert(!K.store.state.calendar.events.some((e) => e.assessmentId), "never stored as an event");
  eq(C.getEvent("x:" + a.id).title, "Networking quiz", "found by its derived id");
  K.itUnits.setUnit("F204", { date: day(44) });
  const f204 = X.all().find((x) => x.links.itUnit === "F204");
  assert(f204, "a unit given a date on the desk is an assessment");
  K.itUnits.setUnit("F204", { date: day(45) });
  eq(X.get(f204.id).date, day(45), "the desk's date moves the assessment");
  X.update(f204.id, { date: day(50) });
  eq(K.itUnits.get("F204").date, day(50), "and the hub's moves the desk");
});

/* ---------------- H ---------------- */
step("H · start-by from tier, scope and hours; an override wins", () => {
  const X = K.exams;
  X.setPrefs({ weeklyHours: 10 });
  const a = X.add({ preset: "aqa-7517-2", date: day(200) });
  const sb = X.startBy(a, TODAY);
  const n = X.leaves(a).length;
  const others = X.upcoming(TODAY).filter((x) => x.tier !== "deadline" && x.date <= K.srs.addDays(TODAY, 84));
  assert(n > 50, "a whole paper's leaves");
  assert(sb.buffer === 14 && sb.hours > 0 && sb.weeks >= 1, "a real exam's buffer and hours: " + JSON.stringify(sb));
  eq(sb.date, K.srs.addDays(a.date, -(sb.weeks * 7 + 14)), "date − weeks − buffer");
  assert(others.length >= 0 && /2 weeks of buffer/.test(sb.why), "the reason is stated: " + sb.why);
  const o = X.update(a.id, { startBy: day(30) });
  eq([X.startBy(o, TODAY).date, X.startBy(o, TODAY).override], [day(30), true], "an override wins");
  X.setPrefs({ weeklyHours: null });
});

/* ---------------- I ---------------- */
step("I · the hub's pages draw without writing", async () => {
  const X = K.exams;
  const a = X.all().find((x) => x.tier !== "deadline") || X.add({ preset: "aqa-7517-1", date: day(20) });
  const d = X.all().find((x) => x.tier === "deadline");
  await app.settle();
  const before = JSON.stringify(K.store.state);
  K.show("exams"); await app.settle();
  assert(app.document.querySelectorAll("[data-ui~='exams.row']").length >= 2, "the timetable lists them");
  K.show("exams", a.id); await app.settle();
  assert(app.document.querySelector("[data-ui~='exams.scope']"), "an assessment's scope");
  assert(app.document.querySelector("[data-ui~='exams.start']"), "its start-by");
  if (d) { K.show("exams", d.id); await app.settle(); assert(app.document.querySelector("[data-ui~='exams.milestones']"), "a deadline's milestones"); }
  K.show("tracker"); await app.settle();
  assert(app.document.querySelector("[data-ui~='exams.tabs']"), "Practice carries the hub's switch");
  const strip = (s) => JSON.parse(s, (k, v) => (k === "view" || k === "updatedAt" ? undefined : v));
  eq(strip(JSON.stringify(K.store.state)).exams, strip(before).exams, "no assessment written");
  eq(strip(JSON.stringify(K.store.state)).tracker, strip(before).tracker, "no attempt written");
  const ov = K.examEditor(a, {}, () => {}); await app.settle();
  assert(app.document.querySelector("[data-ui~='exams.scope-builder']"), "the Scope Builder");
  ov.close();
  eq(app.errors, [], "no errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log(failed ? "smoke89: " + failed + " failed" : "smoke89: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
