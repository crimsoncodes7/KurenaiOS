/* Kurenai OS — smoke191.test.js
   W7 of the quality audit (November 2026): Home, Reports and the Badge
   Wall, each finding held by its own step.

     A · HR-08 / HR-13: a week's Focus heat grid spans every hour the
         Focus touched (a 02:00 block is in it, `heatFrom`), the Night Owl
         line names the window it measured, the Focus overview's headline
         reads the same classifier ("late at night", never "before noon"
         beside Night Owl), and the timeline draws a 02:28 block at 02.
     B · HR-26: the week's words keep one measure a sentence ("Focus
         sessions", then "studied on N of 7 days"), and a day studied with
         no Focus time is marked on the chart, never a bare zero.
     C · HR-23: every subject's time is in the split — Reports' subject
         list and Home's Study hours bar (the study spaces and the
         unlinked rest), adding up to the total beside it.
     D · HR-22: a fresh account saves no report (no backfilled weeks from
         before it existed, no empty latest week); a week with Focus is
         saved, and Week by week hears it (AP-19).
     E · HR-24: an exam today whose time has passed leaves Home's Focus
         card and the directive list; a later one today stays.
     F · HR-29: an exam's revision time is counted by its id, so a rename
         keeps it and a namesake never shares it; Home's card hands the id
         to Focus and the session's entry carries it.
     G · AA-29: a fresh account's first notice is not a backdated
         carry-over of the shipped plan; an older account's is stamped no
         earlier than its record began.
     H · AG-19: the Session Log prints each entry's own recorded award,
         for every type, never re-priced; Code, Japanese, Mind and
         Creatives rows say what they were.
     I · AG-20: every Recovery row pays HP (no plan ticks), and an overdue
         reminder routes to Reminders.
     J · AG-07 / AG-14: "earned" is any tier everywhere (Wall, Seat,
         Governor card), "complete" said apart; the Seat's First day is
         the record's earliest evidence.
     K · AP-19: every badge owner is a known domain with a call site.
     L · no errors, no request.

   Run: node tools/smoke191.test.js */
"use strict";
const fs = require("fs");
const path = require("path");
const { boot } = require("./lib/app-harness");
const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }
let app, K, D;
const q = (s) => D.querySelector(s);
const qa = (s) => Array.from(D.querySelectorAll(s));
let nid = 0;
const nextId = () => 900000 + (++nid);   /* numeric, as the ledger's own ids are */
/* a focus entry ending at `date` `h`:`m` + mins */
function focusAt(date, h, m, mins, subject, extra) {
  const end = new Date(date + "T00:00:00").getTime() + (h * 60 + m + mins) * 60000;
  return Object.assign({ id: nextId(), type: "focus", date: date, ts: end, dur: mins * 60, subject: subject || null, ref: null, refs: [],
    metrics: { mode: "custom", rule: "blocks", complete: true, mins: mins } }, extra || {});
}
function build(p) { return new Promise((res) => K.report.build(p, { rebuilt: false, prev: null }, res)); }
function ensure(now) { return new Promise((res) => K.reportStore.ensureReports((e, saved) => res(saved || []), now)); }
function listAll() { return new Promise((res) => K.reportStore.list(null, (e, l) => res(l || []))); }

/* the audit's week of 28 Sep, moved to 14 Sep: 64% of Focus 04–12, 36% at 02:00 */
const WEEK = "2026-09-14";
let facts;

step("boot", async () => {
  app = await boot(); K = app.KOS; D = app.document; await app.settle();
});

step("D · HR-22: a fresh account saves no report", async () => {
  const saved = await ensure(Date.now());
  eq(saved.map((r) => r.id), [], "nothing saved on the first open");
  eq((await listAll()).length, 0, "no report stored");
  /* a week later: the week it was created in is the latest, and is empty */
  const saved2 = await ensure(Date.now() + 7 * 864e5);
  eq(saved2.map((r) => r.id), [], "the empty latest week is not saved either");
  assert(!(K.store.state.notify.items || []).some((n) => n.kind === "reports"), "nothing announced");
});

step("G · AA-29: no backdated carry-over notice on a fresh account", async () => {
  const carryN = () => (K.store.state.notify.items || []).filter((n) => /^pace:carry:/.test(n.id));
  const dropCarry = () => { K.store.state.notify.items = (K.store.state.notify.items || []).filter((n) => !/^pace:carry:/.test(n.id)); };
  const now = K.pacing.currentWeek().wb;   /* the harness's week of 21 Sep; created Thu 24 Sep */
  /* the shipped plan with a seed row left unticked two weeks ago: what a
     first open finds when the seed's weeks are already behind it */
  const seedRow = K.store.state.pacing.entries.filter((e) => e.source === "personal" && !e.done)[0];
  const seedWb = seedRow.wb;
  seedRow.wb = "2026-09-07"; K.store.save();
  assert(K.pacing.carriedInto(now).some((c) => c.entry.id === seedRow.id), "the seed row carries (the case is real)");
  K.pacing.noteRollover();
  eq(carryN().length, 0, "the shipped plan's earlier weeks are not this account's backlog");
  /* a row the user planned themselves in an earlier week is real backlog,
     and its notice is stamped no earlier than the record began (Thu, not Mon 08:00) */
  const own = K.pacing.addEntry({ wb: "2026-09-14", subject: "compsci", title: "My own row", source: "personal" });
  assert(own, "a personal row added");
  K.pacing.noteRollover();
  const c1 = carryN();
  eq(c1.length, 1, "the user's own row raises the notice");
  assert(/^1 plan topic/.test(c1[0].title), "only the user's row counts: " + c1[0].title);
  const began = K.sessions.since();
  assert(c1[0].ts >= began && c1[0].ts <= Date.now(), "stamped inside the record: " + new Date(c1[0].ts));
  dropCarry();
  /* an account whose record began on 1 September: the seed row from the
     week of 7 Sep is its own backlog */
  const keep = K.store.state.created;
  K.store.state.created = new Date("2026-09-01T12:00:00").getTime();
  K.pacing.noteRollover();
  const c2 = carryN();
  eq(c2.length, 1, "the notice is raised");
  assert(/^2 plan topics/.test(c2[0].title), "both rows carried: " + c2[0].title);
  dropCarry();
  K.store.state.created = keep;
  K.pacing.removeEntry(own.id);
  seedRow.wb = seedWb;
  K.store.save();
});

step("A · HR-08 / HR-13: the heat grid, the persona and the headline agree", async () => {
  const S = K.store.state.sessions;
  S.push(focusAt("2026-09-14", 8, 0, 33, "compsci"));
  S.push(focusAt("2026-09-15", 10, 0, 12, "maths"));
  S.push(focusAt("2026-09-16", 10, 0, 12, "code"));
  S.push({ id: nextId(), type: "flashcards", date: "2026-09-17", ts: new Date("2026-09-17T19:00:00").getTime(), subject: "compsci", ref: null, refs: [], metrics: { cards: 10, again: 1 } });
  S.push(focusAt("2026-09-18", 6, 0, 40, "it"));
  S.push(focusAt("2026-09-20", 2, 0, 55, "ja"));
  K.store.save();
  facts = await build(K.report.week(WEEK));
  const fo = facts.focus;
  eq(fo.blocks, 5, "five blocks");
  assert(fo.heatFrom <= 2, "the grid reaches back to 02:00: " + fo.heatFrom);
  const inGrid = fo.heat.reduce((a, r) => a + r.reduce((x, y) => x + y, 0), 0);
  eq(Math.round(inGrid), fo.mins, "every Focus minute is in the grid");
  eq(fo.heat[6][2 - fo.heatFrom], 55, "Sunday 02:00 holds its 55 minutes");
  eq(fo.persona && fo.persona.id, "nightOwl", "Night Owl");
  assert(/between 21:00 and 04:00/.test(fo.persona.fact), "the line names its window: " + fo.persona.fact);
  const head = K.reportWords.section(facts, "focus").headline;
  assert(/late at night/.test(head) && !/before noon/.test(head), "the headline agrees with the persona: " + head);
  /* the drawn grid: a cell titled 02:00, and the ribbon reaches 02 */
  const grid = K.reportsKit.heat(facts);
  assert(grid.querySelector("[title^='Sun 02:00']"), "the grid draws Sunday 02:00");
});

step("B · HR-26: one measure a sentence; an untimed study day is marked", async () => {
  const w = K.reportWords.template(facts);
  assert(!/sessions? on \d+ of/.test(w.narrative), "no sessions-on-days sentence: " + w.narrative);
  assert(/5 Focus sessions/.test(w.narrative), "the time is said over Focus sessions: " + w.narrative);
  assert(/You studied on 6 of 7 days\./.test(w.narrative), "the study days are said apart: " + w.narrative);
  eq(facts.study.untimed, [3], "Thursday: studied, no Focus time");
  const chart = K.reportsKit.periodChart
    ? K.reportsKit.periodChart({ period: "week", start: WEEK, facts: facts }, {})
    : null;
  if (chart) {
    D.body.appendChild(chart); await app.settle();
    const svg = chart.querySelector("svg");
    if (svg) {
      assert(svg.querySelector("[data-ui~='reports.untimed-day']"), "the chart marks Thursday");
      assert(/Thu studied, no Focus time/.test(svg.getAttribute("aria-label")), "and says so: " + svg.getAttribute("aria-label"));
    }
    chart.remove();
  }
});

step("C · HR-23: every subject is in the split", async () => {
  ["code", "ja", "mind", "creatives"].forEach((k) => assert(K.reportsKit.SUBJECTS.indexOf(k) !== -1, "Reports list " + k));
  assert(facts.study.bySubject.code === 12 && facts.study.bySubject.ja === 55, "the facts carry the spaces' time");
  const pay = K.reportWords.payload({ facts: facts });
  assert(pay.study_min.code === 12 && pay.study_min.japanese === 55, "the payload's minutes include them: " + JSON.stringify(pay.study_min));
  /* Home: this week (Mon 21 Sep), Code, Japanese, CS and an unlinked block */
  const S = K.store.state.sessions;
  S.push(focusAt("2026-09-22", 9, 0, 60, "code"));
  S.push(focusAt("2026-09-22", 11, 0, 60, "ja"));
  S.push(focusAt("2026-09-22", 13, 0, 30, "compsci"));
  S.push(focusAt("2026-09-22", 15, 0, 30, null));
  K.store.save();
  K.show("home"); await app.settle();
  const leg = qa("[data-ui~='home.split-legend'] [data-sid]");
  const sids = leg.map((x) => x.getAttribute("data-sid"));
  ["code", "ja", "compsci"].forEach((k) => assert(sids.indexOf(k) !== -1, "Home's split has " + k + ": " + sids));
  /* Study hours is study (the user, 19 Nov): Focus linked to nothing is in neither the split nor the total */
  assert(sids.indexOf("_none") === -1 && !/Unlinked/.test(q("[data-ui~='home.split-legend']").textContent), "no Unlinked segment: " + sids);
  const sum = leg.reduce((a, x) => a + parseFloat(x.textContent.replace(/^[^\d]*/, "")), 0);
  const big = parseFloat(q(".k-hours-n").textContent);
  assert(Math.abs(sum - big) <= 0.15, "the split, subjects only, adds up to the total, so the unlinked block is in neither: " + sum + " vs " + big);
});

step("D · HR-22 / AP-19: a week with Focus is saved, and Week by week hears it", async () => {
  const touched = [];
  const real = K.achievements.touch;
  K.achievements.touch = function (d) { touched.push(d); return real.apply(this, arguments); };
  const saved = await ensure(new Date("2026-09-30T10:00:00").getTime());
  K.achievements.touch = real;
  const ids = saved.map((r) => r.id);
  assert(ids.indexOf("week:2026-09-21") !== -1, "the week with Focus is saved: " + ids);
  assert(ids.indexOf("week:2026-09-14") !== -1, "and the week before, which has evidence older than the document: " + ids);
  assert(!ids.some((id) => /^week:/.test(id) && id < "week:2026-09-14"), "no week before the record began: " + ids);
  assert(touched.indexOf("reports") !== -1, "the save touched the reports domain");
});

step("E · HR-24: an exam already sat leaves the Focus card and the directives", async () => {
  const today = K.srs.todayISO();
  const sat = K.calendar.addEvent({ type: "exam", title: "Sat paper", date: today, time: "09:00", subject: "it" });
  const at = (hh) => new Date(today + "T" + hh + ":00");
  const before = K.homeFocusPlan(at("08:00"));
  eq([before.kind, before.label], ["exam", "Revise for Sat paper"], "before it starts, revise for it");
  const after = K.homeFocusPlan(at("10:00"));
  assert(after.label !== "Revise for Sat paper", "after it starts, not: " + after.label);
  assert(!K.todo.autoItems().some((it) => it.key === "ev" + sat.id), "nor in the directives");
  const later = K.calendar.addEvent({ type: "exam", title: "Later paper", date: today, time: "15:00", subject: "it" });
  eq(K.homeFocusPlan(at("10:00")).label, "Revise for Later paper", "a later exam today stays");
  assert(K.todo.autoItems().some((it) => it.key === "ev" + later.id), "and stays a directive");
  K.calendar.deleteEvent(sat.id); K.calendar.deleteEvent(later.id);
});

step("F · HR-29: revision time by the exam's id", async () => {
  const today = K.srs.todayISO();
  const a = K.calendar.addEvent({ type: "exam", title: "Mock", date: K.srs.addDays(today, 3), time: "09:00" });
  const b = K.calendar.addEvent({ type: "exam", title: "Mock", date: K.srs.addDays(today, 4), time: "09:00" });
  const S = K.store.state.sessions;
  S.push(focusAt(today, 7, 0, 30, null, { metrics: { mode: "custom", rule: "blocks", complete: true, mins: 30, objective: "Revise for Mock", eventId: a.id } }));
  S.push(focusAt(today, 8, 0, 20, null, { metrics: { mode: "custom", rule: "blocks", complete: true, mins: 20, objective: "Revise for Mock" } }));
  K.store.save();
  eq(K.todo.minsFor(K.calendar.getEvent(a.id), today), 50, "A: its own 30 and the old unlabelled-by-id 20");
  eq(K.todo.minsFor(K.calendar.getEvent(b.id), today), 20, "B: never A's 30");
  K.calendar.updateEvent(a.id, { title: "Mock (renamed)" });
  eq(K.todo.minsFor(K.calendar.getEvent(a.id), today), 30, "a rename keeps A's minutes");
  /* Home's card names the event; Focus carries it onto the session */
  const plan = K.homeFocusPlan();
  eq([plan.kind, plan.eventId], ["exam", a.id], "the card carries the event id");
  K.show("focus", { objective: plan.label, eventId: plan.eventId, subject: "compsci" }); await app.settle();
  q("[data-ui~='focus.start']").click(); await app.settle();
  const s = K.focus.session();
  assert(s && s.eventId === a.id, "the running session holds the id: " + (s && s.eventId));
  K.focus._debugAdvance(15 * 60);
  K.focus.endEarly({ confirmed: true, review: false }); await app.settle();
  const last = K.store.state.sessions.filter((e) => e.type === "focus").slice(-1)[0];
  eq(last.metrics.eventId, a.id, "the logged entry carries it");
  K.calendar.deleteEvent(a.id); K.calendar.deleteEvent(b.id);
  K.show("home"); await app.settle();
});

step("H · AG-19: the Session Log prints each entry's recorded award", async () => {
  const quiz = K.sessions.log({ type: "quiz", subject: "compsci", ref: null, metrics: { pct: 80, correct: 8, total: 10 } });
  const code = K.sessions.log({ type: "code", subject: "code", ref: "1.1", metrics: { kind: "kata", id: "k191", right: 4, total: 5 } });
  const ja = K.sessions.log({ type: "ja", subject: "ja", ref: null, metrics: { kind: "session", n: 12, passed: 10, paid: 0, capped: false, skills: {} } });
  const fx = focusAt(K.srs.todayISO(), 6, 0, 30, "maths");
  fx.metrics.pauses = 0;
  fx.award = { xp: 30, gold: 3 };
  K.store.state.sessions.push(fx);
  /* re-pricing would read these pauses (four extra: -60%); the record says 30 */
  fx.metrics.pauses = 5;
  K.store.save();
  assert(quiz.award && quiz.award.xp > 0, "the quiz was paid: " + JSON.stringify(quiz.award));
  K.show("governor", "history"); await app.settle();
  const row = (id) => q("[data-ui~='gov.log-event'][data-id='" + id + "']");
  const txt = (id, sel) => { const r = row(id); return r ? (r.querySelector(sel) || {}).textContent || "" : null; };
  assert(row(quiz.id), "the quiz row draws");
  eq(txt(quiz.id, ".k-gv-reward"), "+" + quiz.award.xp + " XP · +" + quiz.award.gold + " ◆" + (quiz.award.hp ? " · +" + quiz.award.hp + " HP" : ""), "the quiz's own award");
  eq(txt(fx.id, ".k-gv-reward"), "+30 XP · +3 ◆", "the focus row's recorded award, never re-priced");
  eq(txt(code.id, ".k-chip"), "Code", "a Code row says Code");
  eq(txt(code.id, ".k-gv-row-title"), "Kata round", "and what it was");
  assert(/4\/5 right/.test(txt(code.id, ".k-gv-row-sub")), "with its detail: " + txt(code.id, ".k-gv-row-sub"));
  eq(txt(ja.id, ".k-chip"), "Japanese", "a Japanese row says Japanese");
  eq(txt(ja.id, ".k-gv-row-title"), "Review session", "and what it was");
});

step("I · AG-20: every Recovery row pays HP", async () => {
  const tasks = K.governor.recoveryTasks();
  assert(!tasks.some((t) => /plan/i.test(t.label)), "no plan-tick row: " + tasks.map((t) => t.label));
  eq(tasks[1].cur, 1, "the quiz logged today counts as the review row");
  const r = K.reminders.add({ title: "Overdue thing", due: K.srs.addDays(K.srs.todayISO(), -2) });
  const shown = [];
  const realShow = K.show;
  K.show = function (v) { shown.push(v); };
  K.governor.recoveryTasks()[2].go();
  K.show = realShow;
  eq(shown, ["reminders"], "an overdue reminder opens Reminders");
  K.reminders.remove(r.id || r);
});

step("J · AG-07 / AG-14: earned means any tier; the first day is the earliest evidence", async () => {
  const A = K.achievements, defs = A.defs();
  const multi = defs.filter((d) => d.tiers.length >= 2 && !d.hidden).slice(0, 2);
  K.store.state.achievements.earned = {};
  K.store.state.achievements.earned[multi[0].id] = { tier: 1, at: Date.now(), t: { 1: Date.now() } };
  const full = {}; multi[1].tiers.forEach((x, i) => { full[i + 1] = Date.now(); });
  K.store.state.achievements.earned[multi[1].id] = { tier: multi[1].tiers.length, at: Date.now(), t: full };
  K.store.save();
  const c = A.counts();
  eq([c.earned, c.complete, c.owned], [2, 1, 2], "earned 2 (any tier), complete 1");
  K.show("achievements"); await app.settle();
  const tb = q("[data-ui~='ach.earned-count']");
  assert(tb && /Earned\s*2\s*\/\s*\d+\s*·\s*1 complete/.test(tb.textContent.replace(/\s+/g, " ")), "the Wall's count: " + (tb && tb.textContent));
  /* an entry from May: the record began then, not on the document's day */
  K.store.state.sessions.push({ id: nextId(), type: "quiz", date: "2026-05-04", ts: new Date("2026-05-04T18:00:00").getTime(), subject: "maths", ref: null, refs: [], metrics: { pct: 50 } });
  K.store.save();
  assert(K.sessions.since() <= new Date("2026-05-04T18:00:00").getTime(), "since() reads the ledger");
  K.show("governor"); await app.settle();
  const wall = q("[data-ui~='gov.wall']");
  assert(wall, "the Seat's wall glass draws");
  assert(/2\s*\/\s*\d+ badges earned/.test(wall.textContent), "the Seat says earned: " + wall.textContent.slice(0, 120));
  const recs = qa("[data-ui~='gov.wall'] .k-gv-rec").map((r) => r.textContent);
  const fd = recs.filter((t) => /First day/.test(t))[0] || "";
  assert(/4 May 2026/.test(fd), "First day is the earliest evidence: " + fd);
});

step("K · AP-19: every badge owner is a domain something touches", async () => {
  const A = K.achievements, D0 = A.DOMAINS;
  A.defs().forEach((d) => d.owners.forEach((o) => assert(D0.indexOf(o) !== -1, d.id + " names an unknown owner: " + o)));
  const src = ["js/core", "js/modules"].map((dir) => fs.readdirSync(path.join(__dirname, "..", dir)).filter((f) => /\.js$/.test(f))
    .map((f) => fs.readFileSync(path.join(__dirname, "..", dir, f), "utf8")).join("\n")).join("\n");
  const viaType = new Set([].concat(...Object.values(A.TYPE_DOMAINS)));
  const viaEvent = new Set(["ink", "files", "mind"]);   /* start(): kos-ink, kos-files-index, kos-mind-journal */
  D0.forEach((d) => {
    const direct = new RegExp("achievements\\.touch\\(\\s*\\[?\"" + d + "\"").test(src);
    assert(direct || viaType.has(d) || viaEvent.has(d), "the " + d + " domain has a call site");
  });
  assert(/achievements\.touch\("assistant"\)/.test(fs.readFileSync(path.join(__dirname, "..", "js/core/aiorchestrator.js"), "utf8")), "the tally touches the assistant domain");
});

step("L · no errors, no request", async () => {
  eq(app.errors, [], "no error");
  assert(!app.fetches.length, "no request: " + JSON.stringify(app.fetches.slice(0, 3)));
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 4).join("\n       ")); }
  }
  console.log(failed ? "smoke191: " + failed + " failed" : "smoke191: all " + steps.length + " passed");
  process.exit(failed ? 1 : 0);
})();
