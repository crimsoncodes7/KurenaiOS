/* Kurenai OS — smoke189.test.js
   The quality audit's Goals batch (W7, docs/audit/2026-11 on
   audit/quality-2026-11): what the audit found, held.

     A · GO-03  a repeating goal counts only from its start: the first
                period, begun before it, is measured from the start day and
                marked part; short of its target it is not a miss.
     B · GO-04  a change of the period grid (the repeat, or the day the
                week runs from) drops the old periods and re-reads the
                history on the new grid: never overlapping weeks.
     C · GO-05  an edit of the target or a manual count is a new
                judgement; the one receipt stays; the goal page counts −1.
     D · GO-08  a live stay-under goal records its breach inside the range
                and stays missed; one never breached is kept at the
                deadline whatever comes after; the start day is grace.
     E · GO-10  a breach early in the month still says "Goal missed" when
                the deadline passes; notices are keyed by their event.
     F · GO-09  Reports take a period by its END, so a Wed–Tue week lands
                once, in the report after it.
     G · GO-11  reviews from Japanese, Mind and Code count.
     H · GO-18, MG-30  Money goals judge nothing without Money records;
                no-spend days count only days Money can speak for, and the
                Overview's chip reads the same rule.
     I · GO-19  the hero's counts are the tab's goals, labelled by tab.
     J · GO-24  a Move-to-Green goal re-baselines when its subject changes.
     K · GO-26  a met goal leaves the morning's pins and offers no Pin.
     L · GO-27  a projected-recall goal with too little data has no line,
                says why, and carries its action.
     M · MG-37  Hide amounts masks a money goal's figures in place.
     N · no errors, no request.

   Run: node tools/smoke189.test.js */
"use strict";
const { boot } = require("./lib/app-harness");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
const p = (fn) => new Promise((res, rej) => fn((err, v) => (err ? rej(err) : res(v))));
let app, K, D, G, M;
const q = (s) => D.querySelector(s);
const qa = (s) => Array.from(D.querySelectorAll(s));
let nextSid = 89000;
function entry(date, type, subject, metrics) {
  K.store.state.sessions.push({ id: nextSid++, ts: Date.parse(date + "T12:00:00"), date, type, subject: subject || null, ref: null, dur: null, metrics: metrics || {}, award: { xp: 0, gold: 0 } });
}
async function rows() { return p((cb) => G.compute(cb)); }
async function row(id) { return (await rows()).find((r) => r.id === id); }
let overdue = 0, origCounts = null;

step("boot on Wednesday 18 November 2026", async () => {
  app = await boot({ clock: "2026-11-18T10:00:00" });
  K = app.KOS; D = app.document; G = K.goals; M = K.money;
  await app.settle();
  assert(K.assignments && K.assignments.counts, "the assignments' counts");
  origCounts = K.assignments.counts;
  K.assignments.counts = () => ({ overdue });
});

step("A · GO-03: the first period counts from the goal's start, and short of it is not a miss", async () => {
  entry("2026-11-03", "todo"); entry("2026-11-03", "todo"); // the day before the goal existed
  entry("2026-11-05", "todo");
  entry("2026-11-10", "todo"); entry("2026-11-11", "todo");
  const w = G.add({ title: "Two ticks a week", type: "todos-done", target: 2, repeat: "week", startDate: "2026-11-04" });
  const r = await row(w.id);
  const o = G.get(w.id).outcomes;
  eq(Object.keys(o).sort(), ["2026-11-02", "2026-11-09"], "two ended weeks");
  eq([o["2026-11-02"].value, o["2026-11-02"].met, o["2026-11-02"].partial], [1, false, true], "the first week counts from Wed 4 Nov: 1, part, not met");
  eq([o["2026-11-09"].value, o["2026-11-09"].met, !!o["2026-11-09"].partial], [2, true, false], "a whole week after it");
  eq(r._run, 1, "the part week neither counts nor breaks the run");
  assert(!G.isMiss(o["2026-11-02"]), "not a miss");
  eq(r._from, "2026-11-16", "the live week reads from its own Monday");
  entry("2026-10-05", "todo"); entry("2026-10-05", "todo"); entry("2026-10-25", "todo");
  const m = G.add({ title: "Two a month", type: "todos-done", target: 2, repeat: "month", startDate: "2026-10-20" });
  await rows();
  const om = G.get(m.id).outcomes["2026-10"];
  eq([om.value, om.met, om.partial], [1, false, true], "October from the 20th: 1, not the 3 of the whole month");
  /* the strip shows it as a part period, not ✕ */
  K.show("goals", { id: w.id }); await app.settle();
  const bars = qa("[data-ui~='goal.history'] .k-gl-histbar");
  eq(bars[0].getAttribute("data-state"), "none", "the part week is drawn as none");
  assert(/part week, not judged/.test(bars[0].getAttribute("aria-label")), "and read as such");
  G.remove(w.id); G.remove(m.id);
});

step("B · GO-04: a new period grid re-reads the history; weeks never overlap", async () => {
  const g = G.add({ title: "Ticks weekly", type: "todos-done", target: 1, repeat: "week", startDate: "2026-10-28" });
  await rows();
  eq(Object.keys(G.get(g.id).outcomes).sort(), ["2026-10-26", "2026-11-02", "2026-11-09"], "Monday weeks");
  G.update(g.id, { weekFrom: "start" });
  eq(Object.keys(G.get(g.id).outcomes), [], "the Monday weeks go");
  await rows();
  eq(Object.keys(G.get(g.id).outcomes).sort(), ["2026-10-28", "2026-11-04", "2026-11-11"], "judged again on Wednesday weeks, three for three");
  G.update(g.id, { repeat: "month" });
  await rows();
  eq(Object.keys(G.get(g.id).outcomes), ["2026-10"], "a month goal holds only months");
  /* the editor says so */
  K.goalsUI.goalDialog(G.get(g.id));
  await app.settle();
  qa("[data-ui~='goal.editor'] button").find((b) => b.textContent === "Every week").click();
  await app.settle();
  assert(q("[data-ui~='goal.grid-note']"), "the history-restarts note");
  qa(".k-dialog-overlay").forEach((o) => o.remove());
  G.remove(g.id);
});

step("C · GO-05: an edit is a new judgement; the receipt stays; −1 on the page", async () => {
  const g = G.add({ title: "Three letters", type: "custom-manual", target: 3, current: 0 });
  G.nudge(g.id, 3);
  eq((await row(g.id))._status, "completed", "reached");
  const receipt = JSON.stringify(G.get(g.id) && K.store.state.goals.completionLedger[g.id]);
  G.nudge(g.id, -2);
  eq(G.get(g.id).status, "active", "a count lowered reopens it");
  eq((await row(g.id))._status, "active", "1 of 3 is not Met");
  G.nudge(g.id, 2);
  eq((await row(g.id))._status, "completed", "reached again");
  G.update(g.id, { target: 10 });
  const r = await row(g.id);
  eq([r._status, r._pct], ["active", 30], "a raised target: 3 of 10, active");
  eq(JSON.stringify(K.store.state.goals.completionLedger[g.id]), receipt, "the one receipt, unchanged");
  G.update(g.id, { pinned: true });
  eq(G.get(g.id).status, "active", "pinning is not an edit of the goal");
  G.update(g.id, { pinned: false });
  K.show("goals", { id: g.id }); await app.settle();
  assert(q("[data-ui~='goal.minus']") && q("[data-ui~='goal.plus']"), "−1 and +1 on the goal page");
  q("[data-ui~='goal.minus']").click(); await app.settle();
  eq(G.get(g.id).current, 2, "−1 takes one back");
  G.remove(g.id);
});

step("D · GO-08: a live stay-under goal is judged over its range", async () => {
  overdue = 3;
  const g = G.add({ title: "No overdue in November", type: "no-overdue", target: 0, startDate: "2026-11-01", deadline: "2026-11-30" });
  let r = await row(g.id);
  eq(r._status, "failed", "over the line on a day inside the range");
  eq(G.get(g.id).params.breach, { at: "2026-11-18", value: 3 }, "the breach recorded");
  overdue = 0;
  r = await row(g.id);
  eq(r._status, "failed", "clearing it later does not undo the breach");
  /* the day it is made is grace */
  overdue = 2;
  const today = G.add({ title: "Clear it", type: "no-overdue", target: 0, deadline: "2026-11-30" });
  r = await row(today.id);
  eq([r._status, r._pace, G.get(today.id).params.breach], ["active", "over", undefined], "made today, over: active and Over, no breach");
  /* never breached by the deadline: kept, whatever comes after */
  overdue = 0;
  const past = G.add({ title: "Kept", type: "no-overdue", target: 0, startDate: "2026-11-01", deadline: "2026-11-17" });
  eq((await row(past.id))._status, "completed", "kept to the deadline");
  overdue = 4;
  eq((await row(past.id))._status, "completed", "and stays kept");
  eq(G.get(past.id).params.breach, undefined, "nothing recorded after the deadline");
  /* a restart is a fresh judgement */
  overdue = 0;
  G.restart(g.id, { deadline: "2026-12-17" });
  eq(G.get(g.id).params.breach, undefined, "restart clears the breach");
  eq((await row(g.id))._status, "active", "active again");
  [g, today, past].forEach((x) => G.remove(x.id));
});

step("E · GO-10: an early breach still says Goal missed at the deadline", async () => {
  overdue = 0;
  const g = G.add({ title: "October overdue", type: "no-overdue", target: 0, startDate: "2026-10-01", deadline: "2026-11-17" });
  const rec = G.get(g.id);
  rec.params.breach = { at: "2026-10-05", value: 2 };
  rec.status = "failed"; rec.failedAt = Date.parse("2026-10-05T12:00:00");
  const sent = await p((cb) => G.tick(cb));
  assert(sent.includes("goal:" + g.id + ":missed:2026-11-17"), "posted, keyed by its deadline: " + JSON.stringify(sent));
  const again = await p((cb) => G.tick(cb));
  assert(!again.some((id) => id.indexOf("goal:" + g.id + ":") === 0), "never twice");
  const n = G.notices([{ id: 7, title: "Done", _status: "completed", completedAt: Date.parse("2026-11-16T09:00:00"), _current: 1, _target: 1, _unit: "" }], "2026-11-18");
  eq(n[0].id, "goal:7:done:2026-11-16", "reached is keyed by its day");
  G.remove(g.id);
});

step("F · GO-09: a report takes a period by its end", async () => {
  const g = G.add({ title: "Wed weeks", type: "todos-done", target: 1, repeat: "week", weekFrom: "start", startDate: "2026-11-04" });
  await rows();
  assert(G.get(g.id).outcomes["2026-11-04"], "the week of Wed 4 Nov (to Tue 10) is judged");
  eq(G.periodEnd(G.get(g.id), "2026-11-04"), "2026-11-10", "its end");
  const R = K.report;
  const w1 = await new Promise((res) => R.build({ period: "week", start: "2026-11-02", end: "2026-11-08" }, {}, res));
  const w2 = await new Promise((res) => R.build({ period: "week", start: "2026-11-09", end: "2026-11-15" }, {}, res));
  const has = (f) => !!(f.goals && (f.goals.rows || []).some((x) => x.id === g.id));
  eq([has(w1), has(w2)], [false, true], "in the week it ended in, once");
  eq(w2.goals.rows.find((x) => x.id === g.id).of, 1, "one period");
  G.remove(g.id);
});

step("G · GO-11: Japanese, Mind and Code reviews count", async () => {
  entry("2026-11-18", "ja", "ja", { kind: "session", n: 60, passed: 54 });
  entry("2026-11-18", "mind", "mind", { kind: "reviews", cards: 10, passed: 9 });
  entry("2026-11-18", "code", "code", { kind: "retrieval", id: "x", grade: "good" });
  entry("2026-11-18", "code", "code", { kind: "retrieval", id: "y", grade: "again" });
  const subs = K.subjects.ids();
  const all = G.add({ title: "Reviews", type: "cards-reviewed", target: 100, repeat: "week" });
  const made = [all];
  const r = await row(all.id);
  assert(r._current >= 72, "every owner's reviews: " + r._current);
  if (subs.includes("ja")) {
    const ja = G.add({ title: "JA", type: "cards-reviewed", target: 100, repeat: "week", links: { subject: "ja" } });
    const rr = G.add({ title: "JA recall", type: "recall-rate", target: 85, repeat: "week", links: { subject: "ja" } });
    made.push(ja, rr);
    eq((await row(ja.id))._current, 60, "Japanese reviews");
    eq((await row(rr.id))._current, 90, "Japanese recall: 54 of 60");
  }
  if (subs.includes("mind")) {
    const mi = G.add({ title: "Mind", type: "cards-reviewed", target: 100, repeat: "week", links: { subject: "mind" } });
    made.push(mi);
    eq((await row(mi.id))._current, 10, "Mind reviews");
  }
  const co = G.add({ title: "Code", type: "cards-reviewed", target: 100, repeat: "week", links: { subject: "code" } });
  made.push(co);
  eq((await row(co.id))._current, 2, "Code retrievals");
  made.forEach((x) => G.remove(x.id));
});

step("H · GO-18, MG-30: Money goals judge nothing without records", async () => {
  const under = G.add({ title: "Eat out under £60", type: "money-spend-under", target: 60, repeat: "month", startDate: "2026-09-01" });
  const none = G.add({ title: "No-spend days", type: "money-no-spend", target: 5, repeat: "week" });
  let r = await rows();
  eq(Object.keys(G.get(under.id).outcomes), [], "no month judged without a record");
  const ru = r.find((x) => x.id === under.id), rn = r.find((x) => x.id === none.id);
  eq([ru._current, ru._meta], [null, "No spending recorded"], "the live month says so");
  eq(rn._current, null, "no no-spend days on an empty account");
  K.show("goals", { id: under.id }); await app.settle();
  assert(/No spending recorded/.test(q("[data-ui~='goal.fig-sub']").textContent), "the page says why");
  G.remove(none.id);
  await p((cb) => M.addTx({ date: "2026-11-16", amount: 12, cat: "food", payee: "Cafe" }, cb));
  await p((cb) => M.addTx({ date: "2026-11-17", amount: 100, kind: "in", cat: "job" }, cb));
  const ns = G.add({ title: "No-spend this week", type: "money-no-spend", target: 3, repeat: "week", startDate: "2026-11-16" });
  r = await rows();
  eq(r.find((x) => x.id === ns.id)._current, 1, "Tue 17 only: Mon spent, today has no record yet");
  eq(r.find((x) => x.id === under.id)._current, 12, "with a record, the month reads");
  eq(M.evidence("2026-11-01", "2026-11-30", [{ date: "2026-11-16" }, { date: "2026-11-17" }]), { from: "2026-11-16", to: "2026-11-17" }, "the evidence span");
  K.show("money"); await app.settle();
  const chip = qa(".k-chip").map((c) => c.textContent).find((t) => /no-spend day/.test(t));
  eq(chip, "● 1 no-spend day", "the Overview reads the same rule");
  G.remove(ns.id);
  this_under = under.id;
});
let this_under = null;

step("I · GO-19: the hero counts the tab's goals", async () => {
  G.add({ title: "Week ticks", type: "todos-done", target: 50, repeat: "week" });
  G.add({ title: "Far away", type: "todos-done", target: 50, startDate: "2026-11-01", deadline: "2026-12-31" });
  G.add({ title: "A level", type: "gov-level", target: 99 });
  K.show("goals", "week"); await app.settle();
  const sum = qa("[data-ui~='goal.run'] .k-gl-runcounts b").reduce((n, b) => n + Number(b.textContent), 0);
  const tabCount = Number(q("[data-ui~='goal.domain'] .k-gl-count").textContent);
  assert(sum <= tabCount, "counts " + sum + " within the tab's " + tabCount);
  assert(/this week$/.test(q("[data-ui~='goal.run'] .k-gl-runcounts span").textContent), "labelled this week");
  K.show("goals", "all"); await app.settle();
  assert(/ now$/.test(q("[data-ui~='goal.run'] .k-gl-runcounts span").textContent), "labelled now on All");
  G.all().slice().forEach((g) => { if (g.id !== this_under) G.remove(g.id); });
});

step("J · GO-24: changing the subject takes a new baseline", async () => {
  const orig = K.rag.effective;
  const leaves = (K.hub.LEAVES.maths || []).slice(0, 5).map((l) => l.ref);
  assert(leaves.length === 5, "five Maths leaves");
  K.rag.effective = (sid, ref) => ({ band: sid === "maths" && leaves.includes(ref) ? "g" : null });
  try {
    const g = G.add({ title: "Greens", type: "topics-green", target: 3, links: { subject: "it" } });
    eq(G.get(g.id).params.baseline, 0, "IT: none green");
    G.update(g.id, { links: { subject: "maths" } });
    eq(G.get(g.id).params.baseline, 5, "Maths: the five green now are the start");
    const r = await row(g.id);
    eq([r._current, r._status], [0, "active"], "not met on the spot");
    G.update(g.id, { target: 4 });
    eq(G.get(g.id).params.baseline, 5, "a target edit keeps the baseline");
    G.remove(g.id);
  } finally { K.rag.effective = orig; }
});

step("K · GO-26: a met goal leaves the morning's pins", async () => {
  const g = G.add({ title: "Pinned and done", type: "custom-manual", target: 1 });
  eq(G.pin(g.id, true).ok, true, "pinned");
  eq(G.pinned().map((x) => x.id), [g.id], "in the pins");
  G.nudge(g.id, 1); await rows();
  eq(G.pinned().map((x) => x.id), [], "met: out of the pins (its flag kept)");
  assert(G.get(g.id).pinned, "the flag kept");
  const day = await p((cb) => K.today.load(K.srs.todayISO(), {}, cb));
  assert(!day.goals.some((x) => x.id === g.id), "not on the morning's day");
  const other = G.add({ title: "Another", type: "custom-manual", target: 2 });
  G.update(other.id, { status: "completed", completedAt: Date.now() });
  eq(G.pin(other.id, true).ok, false, "a finished goal can't be pinned");
  K.show("goals", { id: g.id }); await app.settle();
  assert(!q("[data-ui~='goal.pin']"), "no Pin on a met goal");
  G.remove(g.id); G.remove(other.id);
});

step("L · GO-27: projected recall with too little data has no line and says why", async () => {
  const a = K.exams.add({ preset: "edexcel-9ma0-pure-mock", tier: "mock", title: "Pure mock", date: K.srs.addDays(K.srs.todayISO(), 30), time: "09:00" }, { quiet: true });
  const g = G.add({ type: "exam_recall", title: "Pure recall ≥ 95%", target: 95, links: { examId: a.id, subject: "maths" }, deadline: a.date });
  eq(G.get(g.id).params.baseline, null, "thin: the baseline is unknown, not 0");
  const r = await row(g.id);
  eq([r._current, r._expected, r._pace], [null, null, null], "no figure, no line, no pace");
  K.show("goals", { id: g.id }); await app.settle();
  const sub = q("[data-ui~='goal.fig-sub']").textContent;
  assert(sub && sub === r._meta, "the reason under the dash: " + sub);
  assert(!/The line says/.test(q("#main").textContent), "no line");
  assert(q("[data-ui~='goal.detail-action']"), "the type's action on the page");
  G.remove(g.id); K.exams.remove(a.id);
});

step("M · MG-37: Hide amounts masks a money goal's figures in place", async () => {
  M.setHidden(true);
  try {
    K.show("goals", { id: this_under }); await app.settle();
    const fig = q(".k-gl-fig");
    assert(fig.querySelector(".k-gl-big [data-ui~='money.amount']"), "the figure is a masked amount");
    const sub = fig.querySelector("[data-ui~='goal.fig-sub']");
    const amt = sub.querySelector("[data-ui~='money.amount']");
    assert(amt && amt.getAttribute("data-state") === "hidden" || amt && amt.getAttribute("aria-label") === "amount hidden", "the target too, masked");
    assert(/^of \S+ · \d+ of \d+ days gone$/.test(sub.textContent), "the amount keeps its place: " + sub.textContent);
    assert(fig.querySelector(".k-gl-big").textContent !== "–", "no dash for a hidden figure");
  } finally { M.setHidden(false); }
  G.remove(this_under);
});

step("N · no errors, no request", async () => {
  K.assignments.counts = origCounts;
  await app.settle();
  eq(app.errors, [], "no error");
  assert(!app.fetches.length, "no request: " + JSON.stringify(app.fetches.slice(0, 3)));
});

(async () => {
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { console.error("  FAIL " + name + "\n       " + (e && e.stack || e)); process.exit(1); }
  }
  console.log("smoke189: all " + steps.length + " steps passed");
  process.exit(0);
})();
