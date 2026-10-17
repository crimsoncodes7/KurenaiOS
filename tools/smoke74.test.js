/* Kurenai OS — smoke74.test.js
   Code (roadmap 5.3), part 2: the model and what it pays.

     A · PAY ONCE. A task's first pass pays its tier (+3 HP) through the
         session ledger; a re-run pays nothing; a pass after "See the
         answer" pays nothing and proves nothing; hints never reduce it.
     B · THE PHONE. A phone pass pays half the XP and gold and +1 HP; the
         same task passed later on a computer pays exactly the rest.
     C · RETRIEVAL. Grades are derived (first try → Easy, a hint → Hard,
         three misses → Again); at most 10 retrieval rewards a day, and
         past the cap a card still moves on the schedule.
     D · EVIDENCE. A lesson's four checks come from evidence only: pages
         read and listings run tick the first two, a proven task the third,
         a retrieval the fourth — reading alone never completes a lesson.
     E · RENDER PURITY. The desk, a lesson, the map, a task, the skill map,
         retrieval and settings write nothing to the store when drawn.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke74.test.js                                            */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
const PASS = { passed: true }, FAIL = { passed: false };

step("A · a task pays once, on its first proven pass", async (app) => {
  const K = app.KOS, g = K.store.state.governor;
  const xp0 = g.xp, gold0 = g.gold;
  g.hp = 50;
  assert(!K.code.recordCheck("1.1-box", FAIL).paid, "a failing check pays nothing");
  K.code.openHint("1.1-box");
  const o = K.code.recordCheck("1.1-box", PASS);
  assert(o.paid && o.pay.xp === 18 && o.pay.gold === 2 && o.pay.hp === 3, "a core task pays 18/2/3: " + JSON.stringify(o));
  assert(g.xp - xp0 === 18 && g.gold - gold0 === 2 && g.hp === 53, "the Governor paid it: xp +" + (g.xp - xp0) + " gold +" + (g.gold - gold0) + " hp " + g.hp);
  const e = K.sessions.all().slice(-1)[0];
  assert(e.type === "code" && e.metrics.kind === "task" && e.award.xp === 18, "one ledger entry with its award");
  const again = K.code.recordCheck("1.1-box", PASS);
  assert(!again.paid && again.why === "already passed" && g.xp - xp0 === 18, "a re-run pays nothing");
  assert(K.code.state().proven.writeline, "the pass proved its concepts");
});
step("A · after See the answer, a pass pays and proves nothing", async (app) => {
  const K = app.KOS, xp0 = K.store.state.governor.xp;
  K.code.seeAnswer("1.2-types");
  const o = K.code.recordCheck("1.2-types", PASS);
  assert(!o.paid && o.why === "answer opened", "no reward once the answer is open: " + JSON.stringify(o));
  assert(K.store.state.governor.xp === xp0, "nothing paid");
  assert(!K.code.state().proven["char-string"], "the skill stays studied, not proven");
  assert(!K.code.taskState("1.2-types").passAt, "no proven pass recorded");
});

step("B · a phone pass pays half; a computer pass later pays the rest", async (app) => {
  const K = app.KOS, g = K.store.state.governor;
  g.hp = 50; const xp0 = g.xp, gold0 = g.gold;
  const p = K.code.recordCheck("1.3-total", PASS, { phone: true });
  assert(p.paid && p.phone && p.pay.xp === 9 && p.pay.gold === 1 && p.pay.hp === 1, "phone: half XP and gold, +1 HP: " + JSON.stringify(p.pay));
  assert(!K.code.recordCheck("1.3-total", PASS, { phone: true }).paid, "a second phone pass pays nothing");
  const d = K.code.recordCheck("1.3-total", PASS);
  assert(d.paid && d.pay.xp === 9 && d.pay.gold === 1 && d.pay.hp === 2, "the computer pays the rest: " + JSON.stringify(d.pay));
  assert(g.xp - xp0 === 18 && g.gold - gold0 === 2 && g.hp === 53, "never more than one full reward in total");
  assert(!K.code.recordCheck("1.3-total", PASS).paid, "and nothing after that");
  assert(K.code.phoneFit(K.code.task("1.1-box")) && !K.code.phoneFit({ lesson: "4.3" }), "phone tasks are units 1–3 only");
});

step("C · retrieval grades are derived from what happened", (app) => {
  const g = app.KOS.code.grade;
  assert(g({ passed: true, tries: 1, secs: 40 }) === "easy", "first try, quick → Easy");
  assert(g({ passed: true, tries: 1, secs: 400 }) === "good", "first try, slow → Good");
  assert(g({ passed: true, tries: 2, secs: 40 }) === "good", "second try → Good");
  assert(g({ passed: true, tries: 1, hint: true }) === "hard", "a hint grades it Hard");
  assert(g({ passed: false, tries: 3 }) === "again", "three misses → Again");
});
step("C · at most 10 retrieval rewards a day; the schedule still moves", async (app) => {
  const K = app.KOS, today = K.srs.todayISO();
  const st = K.code.state();
  const xp0 = K.store.state.governor.xp;
  let paid = 0, capped = 0;
  for (let i = 0; i < 12; i++) {
    st.cards["u1-swap"] = { due: today, ivl: 2, ef: 2.5, reps: 0, lapses: 0, n: 1 };
    const r = K.code.recordCard("u1-swap", { passed: true, tries: 1, secs: 30 });
    if (r.paid) paid++; if (r.capped) capped++;
    assert(r.next > today, "a proven card moves on: " + r.next);
  }
  assert(paid === 10 && capped === 2, "paid " + paid + ", capped " + capped);
  assert(K.store.state.governor.xp - xp0 === 40, "10 × 4 XP");
  st.cards["u1-swap"] = { due: today, ivl: 9, ef: 2.5, reps: 3, lapses: 0, n: 4 };
  const again = K.code.recordCard("u1-swap", { passed: false, tries: 3 });
  assert(again.grade === "again" && again.ivl === 1 && st.cards["u1-swap"].lapses === 1 && !again.paid, "Again: back tomorrow, a lapse, no reward");
  assert(st.cards["u1-swap"].n === 5, "each review asks the next variation");
});
step("C · a first proof schedules the skill's card; variations differ", (app) => {
  const K = app.KOS;
  K.code.prove(["interpolation"], "task", "t");
  const c = K.code.state().cards["u1-interp"];
  assert(c && c.due > K.srs.todayISO(), "the card is scheduled after the proof");
  const a = K.code.variation("u1-swap", 1), b = K.code.variation("u1-swap", 2);
  assert(a && b && (a.starter !== b.starter || a.params.join() !== b.params.join()), "two variations differ");
  assert(JSON.stringify(K.code.variation("u1-swap", 3).params) === JSON.stringify(K.code.variation("u1-swap", 3).params), "a variation is deterministic");
});

step("D · four checks from evidence; reading alone never completes a lesson", async (app) => {
  const K = app.KOS, ref = "1.4";
  const ev0 = K.code.evidence(ref);
  assert(!ev0.checks.some(Boolean), "a fresh lesson has no ticks");
  for (let i = 0; i < ev0.pages; i++) K.code.markPage(ref, i);
  K.code.listingsOf(ref).forEach((l) => K.code.markListing(ref, l.id));
  let p = K.store.peekProgress("code", ref);
  assert(p.check[0] && p.check[1] && !p.check[2] && p.status !== "done", "read and ran: two ticks, not done");
  K.code.recordCheck("1.4-hours", PASS);
  K.code.state().cards["u1-intdiv"] = { due: K.srs.todayISO(), ivl: 2, ef: 2.5, reps: 0, lapses: 0, n: 1 };
  K.code.recordCard("u1-intdiv", { passed: true, tries: 1, secs: 20 });
  p = K.store.peekProgress("code", ref);
  assert(p.check.every(Boolean) && p.status === "done", "a proven task and a retrieval complete it: " + JSON.stringify(p));
});
step("D · a tick needs every page; a quick note never moves the count", async (app) => {
  const K = app.KOS, ref = "1.2";
  const pages = K.code.evidence(ref).pages;
  for (let i = 0; i < pages - 1; i++) K.code.markPage(ref, i);
  assert(!K.code.evidence(ref).checks[0], "one page short is not a tick");
  K.edits.appendSpec("code", ref, "my own note");
  const ev = K.code.evidence(ref);
  assert(ev.pages === pages && ev.read === pages - 1, "the filed note did not change the count: " + ev.read + " of " + ev.pages);
  K.code.markPage(ref, pages - 1);
  assert(K.code.evidence(ref).checks[0] && K.store.peekProgress("code", ref).check[0], "every page read ticks it");
});
step("D · the status follows the evidence and can still be set by hand", async (app) => {
  const K = app.KOS, ref = "3.2";
  assert(!K.store.peekProgress("code", ref), "a fresh lesson has no record");
  K.code.markPage(ref, 0);
  const p0 = K.store.peekProgress("code", ref);
  assert(!p0 || p0.status === "none", "a page glanced at is not progress: no status");
  assert(!K.code.studied(ref), "one page read does not cover a lesson");
  const pages = K.code.evidence(ref).pages;
  for (let i = 0; i < pages; i++) K.code.markPage(ref, i);
  assert(K.store.peekProgress("code", ref).status === "started", "every page read (a check) makes it Started");
  assert(!K.code.studied(ref) || !K.code.evidence(ref).listings, "reading without running the listings does not cover it");
  K.store.setStatus("code", ref, "paused");
  K.code.markListing(ref, (K.code.listingsOf(ref)[0] || {}).id);
  assert(K.store.peekProgress("code", ref).status === "paused", "a hand-set Paused survives more evidence");
  K.show("ref", { subject: "code", ref: ref }); await app.settle();
  const sel = app.document.querySelector('[data-ui~="code.status"] [data-ui="ui.status-select"]');
  assert(sel && sel.value === "paused", "the inspector's status menu shows it");
});
step("D · the Daily 20 draws only on covered lessons (notes read, listings run)", async (app) => {
  const K = app.KOS;
  /* a fresh device: only pages glanced at in a later unit */
  K.store.state.code = K.code.normalise({});
  K.code.markPage("2.1", 0);
  K.code.markListing("2.1", (K.code.listingsOf("2.1")[0] || {}).id);
  let plan = K.code.planDay();
  assert(plan && !plan.task && plan.lesson && plan.lesson.ref === "1.1", "nothing covered: the plan points at 1.1, not a task: " + JSON.stringify(plan && plan.lesson));
  assert(K.code.skill(K.code.conceptsOf("2.1")[0].id).band === "later", "a glanced lesson's skills read later, not 'not proven'");
  const ref = "1.1", n = K.code.evidence(ref).pages;
  for (let i = 0; i < n; i++) K.code.markPage(ref, i);
  K.code.listingsOf(ref).forEach(l => K.code.markListing(ref, l.id));
  assert(K.code.studied(ref), "1.1 read and run is covered");
  plan = K.code.planDay();
  assert(plan.task && plan.task.lesson === ref, "the pick comes from the covered lesson: " + (plan.task && plan.task.lesson));
  K.show("subject", "code"); await app.settle();
});
step("D · the day's plan is computed, stable through the day and reads Done", async (app) => {
  const K = app.KOS;
  const a = K.code.planDay(), b = K.code.planDay();
  assert(a && b && a.task.id === b.task.id, "the same pick twice");
  K.code.recordCheck(a.task.id, PASS);
  const c = K.code.planDay();
  assert(c.task.id === a.task.id && c.done, "after passing it, today's pick holds and reads Done");
  assert(!("plan" in K.code.state()), "the plan is never stored");
});

step("E · Code is a subject Focus and the topic picker offer", async (app) => {
  const K = app.KOS, d = app.document;
  K.show("focus"); await app.settle();
  const sel = d.querySelector('select[aria-label="Link to subject"]');
  assert(sel && [...sel.options].some(o => o.value === "code" && o.textContent === "Code"), "Focus offers no Code subject");
  sel.value = "code"; sel.dispatchEvent(new app.window.Event("change")); await app.settle();
  const tp = K.topicPicker({ label: "t", multi: false, value: ["code:1.1"] });
  d.body.appendChild(tp.el);
  const chip = tp.el.querySelector('[data-ui~="tp.chip"][data-subject="code"]');
  assert(chip, "the topic picker does not show a Code lesson");
  tp.el.remove();
});
step("E · katas draw from covered lessons, record a run and pay nothing", async (app) => {
  const K = app.KOS, g = K.store.state.governor;
  K.store.state.code = K.code.normalise({});
  assert(!K.code.kataDraw().length, "nothing covered: no kata");
  K.show("code", { page: "kata" }); await app.settle();
  assert(app.document.querySelector('#main .k-empty, #main [data-ui~="ui.empty"]'), "the empty kata page says why");
  ["1.1", "1.2"].forEach(r => { const n = K.code.evidence(r).pages; for (let i = 0; i < n; i++) K.code.markPage(r, i); K.code.listingsOf(r).forEach(l => K.code.markListing(r, l.id)); });
  const d = K.code.kataDraw();
  assert(d.length === K.code.KATA_N && d.every(x => x.ref === "1.1" || x.ref === "1.2"), "a kata of five from 1.1 and 1.2: " + d.map(x => x.ref).join(","));
  assert(JSON.stringify(K.code.kataDraw()) === JSON.stringify(d), "the draw is stable until a run is recorded");
  const xp0 = g.xp, gold0 = g.gold;
  K.code.recordKata({ right: 3, total: 5, secs: 200, refs: d.map(x => x.ref) });
  assert(g.xp === xp0 && g.gold === gold0, "a kata pays nothing");
  assert(K.code.katas().length === 1 && K.code.katas()[0].right === 3, "the run is recorded");
  K.show("code", { page: "kata" }); await app.settle();
  assert(app.document.querySelector('[data-ui~="code.kata-start"]'), "the kata page offers a start");
});
step("E · the Assistant's Code tools read progress and write nothing", async (app) => {
  const K = app.KOS;
  const ex = (name, args) => new Promise(res => K.ai.tools.execute(name, args, (err, result) => res({ err, result })));
  const before = JSON.stringify(K.store.state.code) + JSON.stringify(K.store.state.progress);
  const o = await ex("code_overview", {});
  assert(!o.err && o.result.lessons > 100 && o.result.units.some(u => u.unit === "U10" && !u.written) && o.result.units.some(u => u.unit === "U1" && u.written), "the overview: lessons and which units are written");
  const l = await ex("code_lesson", { ref: "1.1" });
  assert(!l.err && l.result.title && typeof l.result.checks.notesRead === "boolean" && l.result.tasks.length, "one lesson's checks and tasks");
  assert((await ex("code_lesson", { ref: "99.9" })).err, "an unknown lesson is an error");
  const sk = await ex("code_skills", { unit: "U1" });
  assert(!sk.err && typeof sk.result.counts.later === "number", "the skill map by band");
  assert(JSON.stringify(K.store.state.code) + JSON.stringify(K.store.state.progress) === before, "reading wrote nothing");
});
step("E · Code's pages write nothing when drawn", async (app) => {
  const K = app.KOS;
  K.show("subject", "compsci"); await app.settle();
  K.store.flush && K.store.flush();
  const pages = [["subject", "code"], ["ref", { subject: "code", ref: "1.3" }], ["code", { page: "map" }], ["code", { page: "task", id: "1.5-label" }],
    ["code", { page: "skills" }], ["code", { page: "kata" }], ["code", { page: "retrieval" }], ["code", { page: "settings" }], ["code", { page: "track", id: "T2" }]];
  for (const [v, a] of pages) {
    const before = JSON.stringify(K.store.state.code) + JSON.stringify(K.store.state.progress) + JSON.stringify(K.store.state.governor);
    K.show(v, a); await app.settle();
    const after = JSON.stringify(K.store.state.code) + JSON.stringify(K.store.state.progress) + JSON.stringify(K.store.state.governor);
    assert(before === after, v + " " + JSON.stringify(a) + " wrote to the store while drawing");
  }
  assert(app.errors.length === 0, "errors: " + app.errors.join(" | "));
});

(async () => {
  let failed = 0;
  const app = await boot();
  for (const [name, fn] of steps) {
    try { await fn(app); console.log("  ok  " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + e.message); }
  }
  console.log("\n" + "=".repeat(30));
  if (failed) { console.log("SMOKE74 FAIL — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE74 PASS — Code's model and rewards (" + steps.length + " steps).");
})();
