/* Kurenai OS — smoke196.test.js
   1A, the user's note on bk:study-core#5 (19 Nov 2026) and rm:due-subject.

     A · HOME'S FOCUS CARD measures a plan row by the time spent ON IT
         today: a CS Focus session no longer fills the bar under a Maths
         row ("Behind on the plan · Quadratics"); a session on that row's
         topics, or one started from the card (its objective), does. A
         clear board keeps the daily goal (invariant 53a).
     B · A MIXED DUE TODAY RUN counts its cards per subject
         (metrics.bySubject), kept across a pick-up, and a subject's
         "Review flashcards" goal counts its own share; a one-subject run
         is unchanged and carries no split.
     C · bk:study-core#1: Today so far (Reviewed, Accuracy) and Card stats'
         Rating mix read the review log, one row a rating.
     D · creatives#6: the Writing Desk writes a draft on pagehide and when
         you leave the page, not only after its 600 ms pause.

   Run: node tools/smoke196.test.js */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { const x = JSON.stringify(a), y = JSON.stringify(b); if (x !== y) throw new Error(m + ": got " + x + ", wanted " + y); }
const TODAY = "2026-11-19";
let app, K, D;
const q = (s, root) => (root || D).querySelector(s);

function blank() {
  K.views.__blank = function () {};
  K.show("__blank");
  const h = D.createElement("div");
  D.getElementById("main").appendChild(h);
  return h;
}
async function rate(holder, r) {
  q("[data-ui~='fc.card']", holder).click();
  q("[data-ui~='fc.r'][data-rate='" + r + "']", holder).click();
  await app.settle();
}
function focus(fields) {
  return K.sessions.log(Object.assign({ type: "focus", dur: 30 * 60, metrics: { complete: true, mins: 30, secs: 1800, rule: "blocks" } }, fields));
}

step("boot", async () => {
  app = await boot({ clock: TODAY + "T16:00:00" });
  K = app.KOS; D = app.document;
});

step("A · a plan row counts only the time spent on it", async () => {
  const wk = K.pacing.weekFor(TODAY);
  assert(wk, "the plan has this week");
  const prev = K.pacing.weekFor(K.srs.addDays(wk.wb, -7));
  assert(prev, "and last week");
  const row = K.pacing.addEntry({ source: "personal", subject: "maths", wb: prev.wb, title: "Quadratics", refs: ["2.3"] });
  assert(row, "a personal Maths row last week");
  /* clear the earlier rungs of the ladder (53a) so the card falls to the plan */
  const st = K.store.state;
  if (st.calendar && Array.isArray(st.calendar.events)) st.calendar.events = st.calendar.events.filter((ev) => ev.type !== "exam" && ev.type !== "study");
  (K.exams && K.exams.all ? K.exams.all() : []).slice().forEach((a) => K.exams.remove(a.id));
  if (st.assignments && Array.isArray(st.assignments.items)) st.assignments.items = [];
  K.store.save();
  const plan0 = K.homeFocusPlan(new Date(TODAY + "T16:00:00"));
  if (plan0.kicker !== "Behind on the plan") {
    /* an earlier rung of the ladder took the card in this account: the
       measure is still checked through the same rung's reader */
    throw new Error("the card should fall to the plan row; it shows " + plan0.kind + " · " + plan0.kicker);
  }
  /* the account's oldest carried row leads the card (the test's own row
     may sit behind it): measure whichever row the card shows */
  assert(plan0.refs && plan0.refs.length && plan0.subject, "the row names its topics");
  const other = plan0.subject === "maths" ? "compsci" : "maths";
  const otherRef = other === "maths" ? "2.3" : "4.1.1.1";
  eq(plan0.goal, null, "nothing on it yet: no bar, and not the day's total");
  focus({ subject: other, ref: otherRef, refs: [other + ":" + otherRef] });
  const plan1 = K.homeFocusPlan(new Date(TODAY + "T16:00:00"));
  eq(plan1.goal, null, "a session in another subject does not fill the row's bar (the user's report)");
  const r0 = plan0.refs[0], i = r0.indexOf(":");
  focus({ subject: r0.slice(0, i), ref: r0.slice(i + 1), refs: [r0] });
  const plan2 = K.homeFocusPlan(new Date(TODAY + "T16:00:00"));
  eq(plan2.goal && [plan2.goal.k, plan2.goal.v, plan2.goal.bar], ["Today", "30 min on this", undefined], "a session on its topic counts, with no bar to fill");
  focus({ subject: null, ref: null, refs: [], metrics: { complete: true, mins: 20, secs: 1200, rule: "blocks", objective: plan0.label }, dur: 20 * 60 });
  const plan3 = K.homeFocusPlan(new Date(TODAY + "T16:00:00"));
  eq(plan3.goal.v, "50 min on this", "a session started from the card (its objective) counts too");
  K.pacing.removeEntry ? K.pacing.removeEntry(row.id) : null;
});

step("A · a clear board keeps the daily goal", async () => {
  const plan = K.homeFocusPlan(new Date(TODAY + "T16:00:00"));
  if (plan.kicker === "Clear") assert(plan.goal && plan.goal.bar != null && /today$/.test(plan.goal.v), "the daily goal on a clear board");
});

step("B · a mixed Due today run counts its cards per subject", async () => {
  const withSid = (c) => Object.assign({}, c, { sid: c.sid || String(c.key).split(":")[0], ref: c.ref || String(c.key).split(":")[1] });
  const cs = K.srs.cardsFor("compsci", "4.1.1.1").slice(0, 2).map(withSid);
  const ma = K.srs.cardsFor("maths", "5.7").slice(0, 2).map(withSid);
  assert(cs.length === 2 && ma.length === 2, "two CS and two Maths cards");
  const cards = [cs[0], ma[0], cs[1], ma[1]];
  const goal = K.goals.add({ type: "cards-reviewed", title: "Maths cards", target: 50, links: { subject: "maths" }, repeat: "week" });
  const before = await new Promise((res) => K.goals.compute((e, rows) => res(rows.filter((r) => r.id === goal.id)[0])));
  const n0 = K.sessions.all().filter((e) => e.type === "due-review").length;
  let h = blank();
  K.flashcards.session(h, cards, { type: "due-review", refs: cards.map((c) => c.sid + ":" + c.ref), noTally: true, split: true, runKey: "due:mixed", showTopic: true });
  await rate(h, 2);                       /* CS, knew it */
  await rate(h, 0);                       /* Maths, again: back in the queue */
  h = blank();                            /* leave and come back: picked up */
  K.flashcards.session(h, cards, { type: "due-review", refs: cards.map((c) => c.sid + ":" + c.ref), noTally: true, split: true, runKey: "due:mixed", showTopic: true });
  for (let i = 0; i < 3; i++) await rate(h, 2);
  const runs = K.sessions.all().filter((e) => e.type === "due-review").slice(n0);
  eq(runs.length, 1, "one entry");
  const e = runs[0];
  eq(e.subject, null, "a mixed run names no subject");
  eq(e.metrics.bySubject, { compsci: { cards: 2, again: 0 }, maths: { cards: 2, again: 1 } }, "its cards per subject (the Again card came back and left), kept across the pick-up");
  const after = await new Promise((res) => K.goals.compute((err, rows) => res(rows.filter((r) => r.id === goal.id)[0])));
  const cur = (r) => (r && r._current) || 0;
  eq(cur(after) - cur(before), 2, "the Maths goal counts the two Maths cards, not the CS ones");
});

step("B · a one-subject run carries no split", async () => {
  const ma = K.srs.cardsFor("maths", "5.7").slice(2, 3).map((c) => Object.assign({}, c, { sid: "maths", ref: "5.7" }));
  assert(ma.length === 1, "a Maths card");
  const n0 = K.sessions.all().filter((e) => e.type === "due-review").length;
  const h = blank();
  K.flashcards.session(h, ma, { type: "due-review", sid: "maths", ref: "5.7", noTally: true, split: false, runKey: "due:one", showTopic: true });
  await rate(h, 2);
  const e = K.sessions.all().filter((x) => x.type === "due-review").slice(n0)[0];
  eq([e.subject, e.metrics.bySubject], ["maths", undefined], "the subject is the entry's own");
  assert(!app.errors.length, "no page errors: " + app.errors.slice(0, 3).join(" | "));
});

step("C · Today so far and Card stats read the review log (bk:study-core#1)", async () => {
  const today = K.srs.todayISO();
  const rows = await new Promise((res) => K.reviewLog.range(today, today, (e, r) => res(e ? [] : r)));
  const mine = rows.filter(K.reviewLog.isCard);
  assert(mine.length >= 6, "the ratings above are in the log (" + mine.length + ")");
  const keys = new Set(mine.map((r) => r.key)).size, ok = mine.filter((r) => r.g >= 3).length;
  K.show("review", { tab: "due" }, { _nav: true }); await app.settle();
  await new Promise((r) => setTimeout(r, 50)); await app.settle();
  eq(q("[data-ui~='review.today-n']").textContent, String(keys), "Reviewed is the cards rated today, from the log");
  eq(q("[data-ui~='review.today-acc']").textContent, Math.round(100 * ok / mine.length) + "%", "Accuracy is the log's");
  K.show("cardstats", { subject: "maths" }, { _nav: true }); await app.settle();
  await new Promise((r) => setTimeout(r, 50)); await app.settle();
  const mix = q("[data-ui~='review.rating-mix'] [role='img']");
  assert(mix, "the Rating mix is drawn");
  const all = await new Promise((res) => K.reviewLog.all((e, r) => res(e ? [] : r)));
  const maths = new Set(K.srs.allCards().filter((c) => c.sid === "maths").map((c) => c.key));
  const again = all.filter((r) => maths.has(r.key) && r.g === 1).length;
  assert(again >= 1 && new RegExp("Again " + again + "\\b").test(mix.getAttribute("aria-label")),
    "Again counts the log's Maths Again ratings (" + again + "): " + mix.getAttribute("aria-label"));
  assert(!app.errors.length, "no page errors: " + app.errors.slice(0, 3).join(" | "));
});

step("D · the Writing Desk saves a draft when the page hides or you leave (creatives#6)", async () => {
  const W = K.crWrite, CR = K.creatives;
  W.openStudy("W1.3", "b"); await app.settle(); await app.settle();
  const id = decodeURIComponent((/#\/creatives\/write\/([^/]+)/.exec(app.window.location.hash) || [])[1] || "");
  assert(id, "a draft is open: " + app.window.location.hash);
  const read = () => new Promise((res) => CR.files.get("doc:" + id, (e, d) => res(d)));
  const paper = q("[data-ui~='cr.paper']");
  paper.value = paper.value + " The page closed straight after this.";
  paper.dispatchEvent(new app.window.Event("input", { bubbles: true }));
  app.window.dispatchEvent(new app.window.Event("pagehide"));
  await app.settle(); await new Promise((r) => setTimeout(r, 30));
  assert(/closed straight after this/.test((await read()).text), "pagehide writes the draft at once, not 600 ms later");
  paper.value = paper.value + " Then I left the desk.";
  paper.dispatchEvent(new app.window.Event("input", { bubbles: true }));
  K.show("home"); await app.settle(); await new Promise((r) => setTimeout(r, 30));
  assert(/Then I left the desk/.test((await read()).text), "leaving the page writes it too");
  assert(!app.errors.length, "no page errors: " + app.errors.slice(0, 3).join(" | "));
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 6).join("\n       ")); }
  }
  console.log(failed ? `\nSMOKE196 FAIL — ${failed} of ${steps.length} step(s)` : `\nSMOKE196 OK — ${steps.length} steps`);
  process.exit(failed ? 1 : 0);
})();
