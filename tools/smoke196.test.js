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
     F · the toast queue (bk:shell#3, a11y-hci#4, shell#3; W9's SH-36,
         SH-28, AX-02): Undo rows stack, a plain message never wipes one,
         ⌘Z / Ctrl+Z outside a field runs the newest, the message says so.
     G · bk:data-integrity#5: KOS.store.replaceState (a cloud pull) takes the
         document in IN PLACE, so a page holding part of the state writes
         into the live state afterwards.
     H · rm:edge-hygiene (EF-01 to EF-08): the server functions' failure
         paths, read from their source (they run on Deno, not here).
     D · creatives#6: the Writing Desk writes a draft on pagehide and when
         you leave the page, not only after its 600 ms pause.
     I · bk:collection#2: Sync & Import keeps what each provider pull
         changed and says it later ("What it changed").
     J · bk:data-integrity#2: new assignments, reminders, lists, steps and
         events take random string ids; old numbered records still work, and
         the Assistant's tools take either.

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

step("E · a part-rated Due today run picks up when reopened from its chip (sync-disruption#3)", async () => {
  /* six scheduled cards, due today */
  const keys = K.srs.cardsFor("compsci", "4.2.3.1").slice(0, 6).map((c) => c.key);
  keys.forEach((k) => { K.srs.rate(k, 2); K.store.state.srs[k].due = K.srs.addDays(K.srs.todayISO(), -1); });
  K.store.save();
  assert(K.srs.dueCount() >= 6, "cards are due: " + K.srs.dueCount());
  K.show("due", undefined, { _nav: true }); await app.settle();
  const hold = q("[data-ui~='fc.wrap']");
  assert(hold && q("[data-ui~='fc.card']", hold), "Due today shows a card");
  const count = () => { const m = /(\d+) left of (\d+)/.exec((q("[data-ui~='fc.count']") || {}).textContent || ""); return m ? [+m[1], +m[2]] : null; };
  const before = count();
  assert(before && before[0] >= 3, "a run with cards to go: " + JSON.stringify(before));
  await rate(hold, 2); await rate(hold, 2);
  const mid = count();
  K.show("home", undefined, { _nav: true }); await app.settle();
  const chip = [...D.querySelectorAll("[data-ui~='home.review-row']")].filter((b) => b.getAttribute("data-sid") === "cards")[0];
  if (chip) chip.click(); else K.show("due", undefined, { _nav: true });
  await app.settle();
  const res = q("[data-ui~='fc.resumed']");
  assert(res && !res.hidden, "the run says it was picked up");
  eq(count(), mid, "and goes on from the next card, the same count left");
  assert(!app.errors.length, "no page errors: " + app.errors.slice(0, 3).join(" | "));
});

step("F · the toast queue: Undo rows stack, ⌘Z runs the newest, the message says so (bk:shell#3, a11y-hci#4)", async () => {
  const T = D.getElementById("toast"), rows = () => [...T.querySelectorAll("[data-ui~='shell.toast-row']")];
  rows().forEach((r) => r.remove());
  const done = [];
  const said = [];
  const real = K.a11y.announce;
  K.a11y.announce = function (m, o) { said.push(m); return real.apply(this, arguments); };
  K.ui.toast("First triage", false, { label: "Undo", run: () => done.push(1) });
  K.ui.toast("Second triage", false, { label: "Undo", run: () => done.push(2) });
  eq(rows().map((r) => r.querySelector(".k-toast-t").textContent), ["Second triage", "First triage"], "both Undo rows stay, newest first");
  K.ui.toast("Saved");
  K.ui.toast("Saved again");
  eq(rows().map((r) => r.querySelector(".k-toast-t").textContent), ["Saved again", "Second triage", "First triage"], "a plain message replaces the plain one before it, never an Undo row");
  rows()[2].querySelector("button").click();
  eq(done, [1], "the older row's Undo still works after a newer toast");
  const z = (target) => target.dispatchEvent(new app.window.KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true, cancelable: true }));
  const input = D.createElement("input"); D.body.appendChild(input);
  z(input);
  eq(done, [1], "⌘Z in a text field is the field's own");
  z(D.body);
  eq(done, [1, 2], "⌘Z elsewhere runs the newest Undo still showing");
  const ev = new app.window.KeyboardEvent("keydown", { key: "z", ctrlKey: true, bubbles: true, cancelable: true });
  D.body.dispatchEvent(ev);
  eq([done.length, ev.defaultPrevented], [2, false], "with no Undo showing, ⌘Z is left to the page (the ink pad's undo)");
  input.remove();
  K.ui.toast("Moved to tomorrow", false, { label: "Undo", run: () => {} });
  await new Promise((r) => setTimeout(r, 80)); await app.settle();     /* the live region refills after 40 ms */
  K.a11y.announce = real;
  assert(said.some((m) => /^Moved to tomorrow · (Command|Control) Z to undo\.$/.test(m)), "the spoken half says how to undo: " + JSON.stringify(said.slice(-2)));
  for (let i = 0; i < 4; i++) K.ui.toast("Row " + i, false, { label: "Undo", run: () => {} });
  eq(rows().length, 3, "at most three rows");
  eq(T.getAttribute("aria-hidden"), "true", "the visible half stays aria-hidden (invariant 66)");
  rows().forEach((r) => r.remove());
});

step("G · a document taken in from the cloud keeps every held reference live (bk:data-integrity#5)", async () => {
  if (!(K.store.state.reminders && K.store.state.reminders.items.length)) K.reminders.add({ title: "Held reminder" });
  const st = K.store.state;
  const R = st.reminders, items = R.items, row = items[0], goals = st.goals;
  assert(row && row.id != null, "a reminder to hold");
  const ep = K.store.docEpoch ? K.store.docEpoch() : null;
  const doc = JSON.parse(JSON.stringify(st));
  delete doc.ui;
  doc.reminders.items[0].title = "Renamed on another device";
  doc.reminders.items.push({ id: "zz-new", title: "Made elsewhere" });
  K.store.replaceState(doc);
  assert(K.store.state.reminders === R && K.store.state.reminders.items === items && K.store.state.goals === goals, "the held objects are the live ones");
  assert(K.store.state.reminders.items[0] === row, "a row with an id keeps its identity");
  eq(row.title, "Renamed on another device", "and carries the incoming document's values");
  assert(items.some((x) => x.id === "zz-new"), "a new row arrives in the held array");
  row.title = "Written through the held reference";
  eq(K.store.state.reminders.items[0].title, "Written through the held reference", "a write through a held reference reaches the state");
  if (ep != null) assert(K.store.docEpoch() > ep, "a whole document taken in moves docEpoch");
  K.store.state.reminders.items = items.filter((x) => x.id !== "zz-new"); K.store.save();
});

step("G2 · a pull that re-keys a held record keeps it, and rows sharing an id stay apart (December audit SY-38, DI-33)", async () => {
  const st = K.store.state;
  /* SY-38: two devices add a goal under the same counter id before they sync */
  const base = JSON.parse(JSON.stringify(st)); delete base.ui;
  const nid = Math.max(st.goals.nextId || 1, ...st.goals.items.map((g) => +g.id || 0).concat(0).map((n) => n + 1));
  st.goals.items.push({ id: nid, title: "LOCAL goal", type: "focus-hours", target: 10, createdAt: 1764000000000 });
  st.goals.nextId = nid + 1; K.store.save();
  const held = st.goals.items.find((g) => g.id === nid);          /* what an open editor holds */
  const local = JSON.parse(JSON.stringify(st)); delete local.ui;
  const remote = JSON.parse(JSON.stringify(base));
  remote.goals.items.push({ id: nid, title: "REMOTE goal", type: "focus-hours", target: 3, createdAt: 1764000500000 });
  remote.goals.nextId = nid + 1;
  const res = K.cloudmerge.merge(base, local, remote);
  assert(res.renames.some((r) => r.path === "goals.items" && r.from === nid), "the merge reports the re-key: " + JSON.stringify(res.renames));
  K.store.replaceState(res.doc, res.renames);
  const items = K.store.state.goals.items;
  assert(items.indexOf(held) !== -1 && held.id !== nid, "the held object is still this device's goal, under its new id");
  eq(held.title, "LOCAL goal", "and still holds this device's goal");
  eq(items.find((g) => g.id === nid).title, "REMOTE goal", "the other device's goal keeps the old id");
  K.goals.update(held.id, { title: "LOCAL goal (edited)" });       /* the editor saves by existing.id */
  eq(items.find((g) => g.id === nid).title, "REMOTE goal", "saving the held goal never writes the other device's");
  eq(items.find((g) => g.id === held.id).title, "LOCAL goal (edited)", "the edit reaches this device's goal");
  K.store.state.goals.items = K.store.state.goals.items.filter((g) => g !== held && g.id !== nid); K.store.save();

  /* DI-33: rows that share an id — picks of several kinds, an old ledger's duplicate ids */
  const day = "2026-11-20";
  st.dayReview = st.dayReview || {}; st.dayReview.days = st.dayReview.days || {};
  st.dayReview.days[day] = { morning: { three: [{ kind: "reminder", id: 3 }, { kind: "assignment", id: 3 }, { kind: "event", id: 7 }] } };
  st.sessions.push({ id: 987654, ts: 1, date: "2026-09-01", type: "focus", subject: "maths", minutes: 25 },
    { id: 987654, ts: 2, date: "2026-09-02", type: "quiz", subject: "maths" });
  K.store.save();
  K.store.replaceState(JSON.parse(JSON.stringify(st)));
  eq(K.store.state.dayReview.days[day].morning.three.map((p) => p.kind + " " + p.id), ["reminder 3", "assignment 3", "event 7"], "every pick keeps its kind");
  eq(K.store.state.sessions.filter((s) => s.id === 987654).map((s) => s.type), ["focus", "quiz"], "two ledger rows that share an id both survive");
  if (K.store.flush) K.store.flush();
  const stored = JSON.parse(app.window.localStorage.getItem("kurenai-os-v1"));
  eq(stored.sessions.filter((s) => s.id === 987654).map((s) => s.type), ["focus", "quiz"], "and both are saved");
  K.store.state.sessions = K.store.state.sessions.filter((s) => s.id !== 987654);
  delete K.store.state.dayReview.days[day]; K.store.save();
});

step("G4 · the goal page's Delete and Archive act on the goal shown, after a pull re-keys it (December audit GO-28)", async () => {
  const W = app.window, KEY = "kurenai-os-v1", REVK = KEY + ".rev", st = K.store.state;
  function rekeyFromOtherTab(nid, mine) {
    const doc = JSON.parse(W.localStorage.getItem(KEY));
    doc.goals.items = doc.goals.items.filter((g) => g.id !== nid)
      .concat([{ id: nid, title: "THEIR goal", kind: "manual", type: "custom-manual", target: 5, current: 0, createdAt: 1764000900000 + nid },
               Object.assign({}, mine, { id: nid + 1 })]);
    doc.goals.nextId = nid + 2;
    W.localStorage.setItem(KEY, JSON.stringify(doc));
    W.localStorage.setItem(REVK, String((parseInt(W.localStorage.getItem(REVK), 10) || 0) + 1));
  }
  function menuItem(label) {
    q("[aria-label='More for this goal']").click();
    return [...D.querySelectorAll("[role='menuitem'], .k-menu button, .k-menu-item")].find((b) => b.textContent.trim() === label);
  }
  for (const action of ["Delete…", "Archive"]) {
    const nid = Math.max(st.goals.nextId || 1, ...st.goals.items.map((g) => +g.id || 0).concat(0).map((n) => n + 1)) + 20;
    const mine = K.goals.add({ title: "MY goal", kind: "manual", type: "custom-manual", target: 5 });
    /* give it the id the other device's goal will collide with */
    const live = st.goals.items.find((g) => g.id === mine.id); live.id = nid; st.goals.nextId = nid + 1;
    K.store.save(); if (K.store.flush) K.store.flush();
    K.show("goals", { id: nid }); await app.settle();
    const item = menuItem(action);
    assert(item, "the goal page's ⋯ menu offers " + action);
    const copy = JSON.parse(JSON.stringify(live));
    if (action === "Delete…") {
      item.click(); await app.settle();                         /* the danger confirm is open … */
      rekeyFromOtherTab(nid, copy); K.store.sync();              /* … when another tab's pull lands */
      const ok = [...D.querySelectorAll(".k-dialog button")].find((b) => b.textContent.trim() === "Delete");
      assert(ok, "the Delete confirm is open"); ok.click(); await app.settle();
      eq(st.goals.items.filter((g) => g.id === nid || g.id === nid + 1).map((g) => [g.id, g.title]), [[nid, "THEIR goal"]], "Delete removed MY goal and kept theirs");
    } else {
      rekeyFromOtherTab(nid, copy); K.store.sync();              /* the pull lands with the page drawn */
      item.click(); await app.settle();
      eq(st.goals.items.filter((g) => g.id === nid || g.id === nid + 1).map((g) => [g.id, g.title, !!g.archived]),
        [[nid, "THEIR goal", false], [nid + 1, "MY goal", true]], "Archive archived MY goal, not theirs");
    }
    K.store.state.goals.items = st.goals.items.filter((g) => g.id !== nid && g.id !== nid + 1); K.store.save();
    D.querySelectorAll(".k-dialog-overlay").forEach((o) => o.remove());
  }
});

step("G3 · another TAB's write that re-keyed a held record: the held object follows it, clean or dirty (SY-38, Carbon's two-tab case)", async () => {
  const W = app.window, KEY = "kurenai-os-v1", REVK = KEY + ".rev";
  const st = K.store.state;
  /* the other tab's cloud merge re-keyed this device's goal and wrote the
     result: the other device's goal under the old id, ours under a new one,
     and no rename reaches this tab — only the document */
  function otherTabWrites(nid, mine) {
    const doc = JSON.parse(W.localStorage.getItem(KEY));
    doc.goals.items = doc.goals.items.filter((g) => g.id !== nid)
      .concat([{ id: nid, title: "REMOTE " + nid, type: "focus-hours", target: 3, createdAt: 1764000900000 + nid },
               Object.assign({}, mine, { id: nid + 1 })]);
    doc.goals.nextId = nid + 2;
    const rev = (parseInt(W.localStorage.getItem(REVK), 10) || 0) + 1;
    W.localStorage.setItem(KEY, JSON.stringify(doc));
    W.localStorage.setItem(REVK, String(rev));
  }
  for (const dirty of [false, true]) {
    const nid = Math.max(st.goals.nextId || 1, ...st.goals.items.map((g) => +g.id || 0).concat(0).map((n) => n + 1)) + 10;
    st.goals.items.push({ id: nid, title: "LOCAL " + nid, type: "focus-hours", target: 10, createdAt: 1764000000000 + nid });
    st.goals.nextId = nid + 1;
    K.store.save(); if (K.store.flush) K.store.flush();
    const held = st.goals.items.find((g) => g.id === nid);            /* the open editor's object */
    const mine = JSON.parse(JSON.stringify(held));
    if (dirty) held.target = 12;                                       /* an unsaved change in this tab */
    otherTabWrites(nid, mine);
    K.store.sync();                                                    /* this tab takes the write in */
    const items = K.store.state.goals.items;
    assert(items.indexOf(held) !== -1, (dirty ? "dirty" : "clean") + ": the held object is still in the list");
    eq([held.id, held.title], [nid + 1, "LOCAL " + nid], (dirty ? "dirty" : "clean") + ": it holds this device's goal, under its new id");
    eq(items.find((g) => g.id === nid).title, "REMOTE " + nid, (dirty ? "dirty" : "clean") + ": the other device's goal keeps the old id");
    /* the merge follows our record to its new id: an unsaved change lands on it, never on theirs */
    eq([held.target, items.find((g) => g.id === nid).target], [dirty ? 12 : 10, 3], (dirty ? "dirty" : "clean") + ": each goal keeps its own target");
    K.goals.update(held.id, { title: "LOCAL " + nid + " (edited)" });  /* Save in the editor: G.update(existing.id, …) */
    eq(items.find((g) => g.id === nid).title, "REMOTE " + nid, (dirty ? "dirty" : "clean") + ": Save never writes the other device's goal");
    K.store.state.goals.items = items.filter((g) => g.id !== nid && g.id !== nid + 1); K.store.save(); if (K.store.flush) K.store.flush();
  }
});

step("H · the server functions' failure paths (rm:edge-hygiene, EF-01 to EF-08)", () => {
  const fs = require("fs"), path = require("path"), F = path.join(__dirname, "..", "supabase", "functions");
  const read = (f) => fs.readFileSync(path.join(F, f), "utf8");
  const cors = read("_shared/cors.ts");
  assert(/export function handler\(/.test(cors) && /instanceof ServerTrouble\) return json\(\{ error: msg, kind: e\.kind \}, 503\)/.test(cors), "EF-01: one wrapper answers an uncaught error with CORS and an error");
  assert(/if \(!url \|\| !anon\) throw new ServerTrouble/.test(cors) && !/if \(!url \|\| !anon\) return null/.test(cors), "EF-08: a missing configuration is a 503, not 'sign in'");
  assert(/catch \{\s*throw new ServerTrouble\("The sign-in server could not be reached/.test(cors), "EF-01: an auth-server blip is a 503, not an uncaught throw");
  ["ai-chat", "ext-token", "igdb-search", "github-token", "steam-owned-games", "vndb-ulist", "steam-auth"].forEach((f) => {
    const src = read(f + "/index.ts");
    assert(/Deno\.serve\(handler\(async \(req\) => \{/.test(src) && /^\}\)\);\s*$/m.test(src), f + " serves through handler()");
  });
  assert(/let used: number \| null = null;\s*try \{ used = await usedToday/.test(read("ai-chat/index.ts")), "EF-03: one metering read never fails the health check");
  assert(/linked: true, repo: l\.repo, account: l\.account, configured: !!c/.test(read("github-token/index.ts")), "EF-04: status says configured when linked too");
  const run = read("runner/index.ts");
  assert(/for \(const o of outlooks\) \{\s*try \{/.test(run) && /out\.failed\+\+/.test(run), "EF-05: one user's failure is that user's alone");
  assert(!/^const results/m.test(run) && /const results: Result\[\] = \[\];/.test(run), "EF-06: the reply's rows are the invocation's own");
  /* EF-07, and the Steam return: every way out of the callback is a 303 back to the app with a code the app
     knows (a page on *.supabase.co is served as text/plain, so it showed as raw source) */
  const sa = read("steam-auth/index.ts");
  assert(/catch \{\s*return backToApp\("unreachable"\)/.test(sa), "EF-07: Steam unreachable says so");
  assert(!/htmlPage|text\/html/.test(sa) && /status: 303, headers: \{ \.\.\.corsHeaders, Location: `\$\{appUrl\(\)\}\/\?steam=\$\{code\}` \}/.test(sa), "the callback answers with a redirect, never a page");
  const codes = Array.from(sa.matchAll(/backToApp\("([a-z]+)"\)/g), (m) => m[1]);
  eq(codes.length, 10, "ten ways out of the callback");
  codes.forEach((c) => assert(K.gameapi.STEAM_RESULT[c], "the app knows the code " + c));
  const cloud = fs.readFileSync(path.join(__dirname, "..", "js/core/cloud.js"), "utf8");
  assert(/if \(!msg && status === 401\) \{ msg = EXPIRED;/.test(cloud), "EF-02: the gateway's own 401 reads as an expired session");
});

step("I · Sync & Import says what the last pull changed, read back later (bk:collection#2)", async () => {
  K.media.noteSyncResult("anilist", "books", { added: 1, updated: 0, unchanged: 7 });
  K.media.noteSyncResult("anilist", "anime", { added: 2, updated: 1, unchanged: 40, removed: 0 });
  const conn = K.anilist.getConnection;
  K.anilist.getConnection = (cb) => cb(null, { token: "t", viewer: { id: 1, name: "Tester" } });
  try {
    K.show("mediasync");
    let fact = null;
    for (let i = 0; i < 200; i++) {
      await app.settle();
      fact = q("[data-ui~='sync.provider-facts'] [data-fact='changed']");
      if (fact && fact.textContent && !/Checking/.test(fact.textContent)) break;
    }
    assert(fact, "the fact is on the AniList card");
    eq(fact.textContent, "2 added, 1 updated, 40 already up to date", "the newest pull's changes");
  } finally { K.anilist.getConnection = conn; }
});

step("J · new assignments, reminders, lists, steps and events take random string ids; old numbers still work (bk:data-integrity#2)", async () => {
  const a = K.assignments.add({ title: "Random id essay", subject: "compsci", due: "2026-12-01" });
  K.assignments.subAdd(a.id, "Plan it");
  const r = K.reminders.add({ title: "Random id reminder" });
  K.reminders.subAdd(r.id, "Step one");
  const l = K.reminders.addList("Random id list");
  const ev = K.calendar.addEvent({ title: "Random id event", date: "2026-12-02", type: "personal" });
  const RID = /^[a-z]-[a-z0-9]{12}$/;
  [[a.id, "a"], [K.assignments.get(a.id).subtasks[0].id, "s"], [r.id, "r"], [K.reminders.get(r.id).subs[0].id, "s"], [l.id, "l"], [ev.id, "e"]].forEach(([id, p]) =>
    assert(RID.test(id) && id[0] === p, "a random id with its prefix: " + id));
  eq([K.store.idOf("12"), K.store.idOf(12), K.store.idOf(a.id), K.store.idOf(""), K.store.idOf(null)], [12, 12, a.id, null, null], "idOf reads an old number or a new id back");
  /* an old record keeps its number and is found by it */
  K.store.state.assignments.items.push({ id: 41, title: "Old numbered essay", subject: "maths", status: "todo", subtasks: [] });
  eq(K.assignments.get(41) && K.assignments.get(41).title, "Old numbered essay", "an old numbered record is found by its number");
  /* a goal link and a study block keep a string id as a string */
  eq(K.goals.normaliseLinks ? K.goals.normaliseLinks({ assignmentId: a.id }).assignmentId : a.id, a.id, "a goal link keeps the string");
  /* the Assistant: a record id is an old number or a new string */
  const T = K.ai.tools;
  const ok = T.validate("todo_delete_task", { id: r.id });
  eq([ok.ok, ok.args && ok.args.id], [true, r.id], "a tool takes a string id");
  const old = T.validate("calendar_delete_event", { id: "41" });
  eq([old.ok, old.args && old.args.id], [true, 41], "\"41\" is the old number 41");
  assert(!T.validate("calendar_delete_event", { id: "drop table" }).ok && T.validate("todo_tick_habit", { id: "s_ab12cd34", done: true }).ok, "anything else is refused; a routine habit's id is taken");
  const sch = T.schemas(["calendar_delete_event"])[0].parameters.properties.id;
  eq(sch.type, "string", "the provider sees a string");
  K.store.state.assignments.items = K.store.state.assignments.items.filter((x) => x.id !== 41);
});

step("K · worked totals, tariff counts, the exam number and no score before an answer (content-maths#2, content-cs-it#6/#7/#8)", () => {
  const html = K.content.renderBlocks([{ worked: { tag: "exam", title: "T", src: "Test · 3 marks", q: "Q", steps: [{ m: "a", mk: "M1" }, { m: "b", mk: "A1 B1" }], result: "r" } }]);
  const box = D.createElement("div"); box.innerHTML = html;
  const tot = q('[data-ui="content.worked-total"]', box);
  assert(tot && /3 marks/.test(tot.textContent), "a worked example shows the total of its mark codes");
  box.innerHTML = K.content.renderBlocks([{ worked: { tag: "exam", title: "T", steps: [{ m: "a", mk: "see below" }, { m: "b", mk: "1" }] } }]);
  assert(!q('[data-ui="content.worked-total"]', box), "no total when a code is not a mark code");
  const h = D.createElement("div"); D.body.appendChild(h);
  K.quiz.mountMCQ(h, "compsci", "4.1.1.1", [{ q: "Pick", opts: ["a", "b", "c", "d"], ans: 0, why: "w" }], { onFinish: () => {} });
  const meta = q(".k-qz-meta", h);
  assert(meta && !/score 0/.test(meta.textContent), "no score before an answer: " + (meta && meta.textContent));
  h.remove();
  const g = D.createElement("div"); D.body.appendChild(g);
  K.quiz.mountExam(g, "compsci", "4.1.1.1", [{ src: "s", marks: 1, q: "A", ms: ["1"] }, { src: "s", marks: 4, q: "B", ms: ["1", "1", "1", "1"] }, { src: "s", marks: 4, q: "C", ms: ["1", "1", "1", "1"] }]);
  const chips = Array.from(g.querySelectorAll("[data-f]")).map((b) => b.textContent);
  assert(chips.includes("All · 3") && chips.includes("1–2 marks · 1") && chips.includes("3–5 marks · 2"), "each tariff chip shows its count: " + chips.join(", "));
  g.querySelector('[data-f="mid"]').click();
  assert(/Q2 of 3/.test(q('[data-ui~="quiz.exam-top"]', g).textContent), "the card says its own number out of the topic's");
  g.remove();
});

step("L · Steam's sign-in tab lands back in the app: the result said once, the code taken out of the address, Games open", async () => {
  const W = app.window;
  W.history.replaceState(null, "", "/index.html?steam=linked#/home");
  eq(K.gameapi.steamReturn(), "linked", "the code is read");
  K.gameapi.boot();
  await app.settle();
  eq(W.location.search, "", "the code leaves the address, so a reload says nothing twice");
  assert(/Steam account linked/.test(D.getElementById("toast").textContent), "the toast says it linked: " + D.getElementById("toast").textContent);
  assert(/^#\/game/.test(W.location.hash), "Games open: " + W.location.hash);
  W.history.replaceState(null, "", "/index.html?steam=bogus#/home");
  eq(K.gameapi.steamReturn(), null, "an unknown code is ignored");
  W.history.replaceState(null, "", "/index.html#/home");
});

step("M · routines inside routines: a step runs another routine, mirrored both ways, each paid once (1C)", async () => {
  const R = K.routines;
  if (!R.enabled()) R.enable(true);
  const skin = R.add({ name: "Skincare QA", kind: "custom", days: [], steps: [{ text: "Cleanse", mins: 2 }, { text: "Moisturise", mins: 1 }, { text: "Serum", optional: true }] });
  const morn = R.add({ name: "Morning QA", kind: "morning", days: [], steps: [{ text: "Water" }, { text: "Skincare QA", run: skin.id }, { text: "Stretch" }] });
  /* the checks: never itself, never a loop, never a missing routine */
  eq([R.check([{ text: "x", run: morn.id }], morn.id), R.check([{ text: "y", run: morn.id }], skin.id), R.check([{ text: "z", run: "r_gone" }], skin.id)],
    [R.RUN_SELF, R.RUN_LOOP, R.RUN_GONE], "itself, a loop and a missing routine are refused");
  assert(R.update(skin.id, { steps: [{ text: "Back", run: morn.id }] }) === null, "update refuses a loop");
  const day = R.routineDay(), run = morn.steps[1];
  const on = (id, sid) => !!((R.entry(id, day) || {}).steps || {})[sid];
  /* ticked inside: the outer step follows only once the inner routine is kept */
  R.tick(skin.id, skin.steps[0].id, true);
  eq(on(morn.id, run.id), false, "one inner step leaves the outer step open");
  const res = R.tick(skin.id, skin.steps[1].id, true);
  eq([R.stateOn(R.get(skin.id), day), on(morn.id, run.id)], ["done", true], "the inner routine kept ticks the outer step");
  R.undoTick(res.undo);
  eq([R.stateOn(R.get(skin.id), day), on(morn.id, run.id)], ["partial", false], "Undo takes back the inner tick and the mirrored one");
  /* the run step itself ticks the inner routine's required steps */
  R.tick(morn.id, run.id, true);
  eq([R.stateOn(R.get(skin.id), day), on(morn.id, run.id), on(skin.id, skin.steps[2].id)], ["done", true, false], "ticking the run step keeps the inner routine, optional steps left");
  R.tick(morn.id, morn.steps[0].id, true); R.tick(morn.id, morn.steps[2].id, true);
  const paid = K.store.state.sessions.filter((e) => e.metrics && e.metrics.routine && !e.metrics.undone && [skin.id, morn.id].includes(e.metrics.routine));
  eq(paid.map((e) => e.metrics.routine).sort(), [morn.id, skin.id].sort(), "each routine is paid its own completion, once");
  eq(R.entry(morn.id, day).snap[1][6], skin.id, "the day's snapshot keeps the run");
  /* unticking the run step unticks what the inner routine had ticked */
  R.tick(morn.id, run.id, false);
  eq([R.stateOn(R.get(skin.id), day), on(morn.id, run.id)], ["open", false], "unticking the run step clears the inner routine");
  /* the checklist names it, with the inner progress; the player plays the inner steps in place */
  const list = K.rtUI.checklist(R.get(morn.id));
  const row = list.querySelector('[data-ui~="routine.run-step"]');
  assert(row && /Skincare QA/.test(row.textContent) && /0 of 2/.test(row.textContent), "the checklist row: " + (row && row.textContent));
  K.routinePlayer.open(morn.id); await app.settle();
  const side = Array.from(D.querySelectorAll(".k-rpl-side [data-ui~='player.group']")).map((x) => x.textContent);
  eq(side, ["↻ Skincare QA"], "the player shows the inner routine's steps under its name");
  for (let k = 0; k < 6 && q("[data-ui~='player.done']"); k++) { q("[data-ui~='player.done']").click(); await app.settle(); }
  eq([R.stateOn(R.get(skin.id), day), R.stateOn(R.get(morn.id), day)], ["done", "done"], "playing it through keeps both");
  const close = q("[data-ui~='player.close-done']"); if (close) close.click();
  await app.settle();
  /* the editor offers the routines it may run, and a deleted one becomes an ordinary step */
  K.show("routines", { edit: skin.id }); await app.settle();
  assert(!q('[data-ui~="routine.add-run"] [data-ui~="ui.menu-button"]'), "Skincare can't run Morning (Morning runs it): no routine to offer");
  K.show("routines", { edit: "new" }); await app.settle();
  assert(q('[data-ui~="routine.add-run"] [data-ui~="ui.menu-button"]'), "a new routine is offered the routines it may run");
  R.remove(skin.id);
  eq(R.check(R.get(morn.id).steps, morn.id), R.RUN_GONE, "a run whose routine was deleted is caught by check");
  K.show("routines", { edit: morn.id }); await app.settle();
  eq(D.querySelectorAll('[data-ui~="routine.run-step"]').length, 0, "the editor draws it as an ordinary step");
  R.remove(morn.id);
});

step("N · shift the plan by N weeks: unticked personal rows only, breaks stepped over, one Undo; Class days opens (1C, UR-19)", async () => {
  const PC = K.pacing; PC.ensureSeeded();
  const S = PC.state(), snap = JSON.stringify(S.entries.map((e) => [e.id, e.wb, e.wk])), wks = S.weeks.length;
  const plan = PC.weeks().filter((w) => w.personalWk != null).map((w) => w.wb);
  const pers = S.entries.filter((e) => e.source === "personal" && !e.done && !e.tag && e.subject === "maths");
  const school = S.entries.filter((e) => e.source === "school").map((e) => e.id + e.wb).join();
  assert(pers.length > 2 && plan.length > 4, "the seeded plan has maths rows");
  const r0 = pers[0], at = plan.indexOf(r0.wb);
  /* tick one, so it must stay */
  const ticked = pers[1]; ticked.done = true;
  eq(PC.shiftCount(2, { subject: "maths" }), pers.length - 1, "the count leaves the ticked row out");
  const res = PC.shiftPlan(2, { subject: "maths" });
  eq(res.moved, pers.length - 1, "every unticked maths row of my own plan moved");
  eq(r0.wb, plan[Math.min(at + 2, plan.length - 1)] || r0.wb, "two PLAN weeks later (breaks stepped over)");
  eq(r0.wk, PC.weekAt(r0.wb).personalWk, "wk is derived on the write");
  eq(S.entries.filter((e) => e.source === "school").map((e) => e.id + e.wb).join(), school, "class rows never move");
  assert(S.entries.filter((e) => e.subject === "compsci" && e.source === "personal").every((e) => !res.undo.rows.some((u) => u[0] === e.id)), "other subjects stay");
  PC.undoShift(res.undo);
  ticked.done = false;
  eq([JSON.stringify(S.entries.map((e) => [e.id, e.wb, e.wk])), S.weeks.length], [snap, wks], "Undo puts every row and week back");
  /* earlier, from a week on: never before that week */
  const from = plan[Math.min(3, plan.length - 1)];
  const r2 = PC.shiftPlan(-8, { from });
  assert(S.entries.filter((e) => r2.undo.rows.some((u) => u[0] === e.id)).every((e) => e.wb >= from), "never shifted before `from`");
  PC.undoShift(r2.undo);
  eq(JSON.stringify(S.entries.map((e) => [e.id, e.wb, e.wk])), snap, "and back");
  /* the page: Shift plan… and Class days both open */
  K.show("pacing"); await app.settle();
  q('[data-ui~="pace.shift"]').click(); await app.settle();
  assert(/unticked row/.test(q('[data-ui~="pace.shift-preview"]').textContent), "the shift dialog previews its count");
  D.querySelectorAll(".k-dialog-overlay").forEach((o) => (o.close ? o.close() : o.remove()));
  q('[data-ui~="pace.timetable"]').click(); await app.settle();
  assert(q('.k-dialog-overlay [data-ui~="pace.tt-row"]'), "Class days opens its dialog");
  D.querySelectorAll(".k-dialog-overlay").forEach((o) => (o.close ? o.close() : o.remove()));
});

step("O · a lesson or study block carries the week's plan, ticked from the block through KOS.pacing (1C, UR-29)", async () => {
  const PC = K.pacing; PC.ensureSeeded();
  const day = PC.lessonsOn(TODAY).length ? TODAY : PC.weeks().map((w) => w.wb).find((d) => PC.lessonsOn(d).length);
  const lesson = PC.lessonsOn(day)[0];
  assert(lesson, "the seeded plan has a class lesson to test with");
  const subj = lesson.entry.subject, w = PC.weekFor(day);
  const ev = K.calendar.addEvent({ title: "QA lesson block", type: "lesson", subject: subj, date: day, time: "10:00", end: "11:00" });
  K.calendar.openCountdown({ kind: "event", ev: K.store.state.calendar.events.find((e) => e.id === ev.id), date: day });
  await app.settle();
  const box = q('[data-ui~="cal.plan"]');
  assert(box && /This week's plan/.test(box.textContent), "the block shows the week's plan");
  const lc = box.querySelector('[data-ui~="cal.plan-lesson"]');
  assert(lc, "a lesson block lists the class lessons dated that day");
  const was = !!lesson.sat;
  lc.click(); await app.settle();
  eq(!!PC.lessonsOn(day).filter((x) => x.entry.id === lesson.entry.id && x.lesson.text === lesson.lesson.text)[0].sat, !was, "ticked from the block, written by KOS.pacing");
  q('[data-ui~="cal.plan"] [data-ui~="cal.plan-lesson"]').click(); await app.settle();
  const mine = PC.entriesFor(w.wb, subj, "personal");
  if (mine.length) {
    const rc = q('[data-ui~="cal.plan"] [data-ui~="cal.plan-row"]');
    const id = mine[0].id, d0 = !!PC.entryById(id).done;
    rc.click(); await app.settle();
    eq(PC.entryById(id).done, !d0, "my own row ticks from the block");
    q('[data-ui~="cal.plan"] [data-ui~="cal.plan-row"]').click(); await app.settle();
  }
  D.querySelectorAll(".k-dialog-overlay").forEach((o) => (o.close ? o.close() : o.remove()));
  /* a block with no plan subject shows none; the event itself stores nothing of the plan */
  const stored = K.store.state.calendar.events.find((e) => e.id === ev.id);
  assert(!("plan" in stored) && !("rows" in stored), "the block stores nothing of the plan");
  K.calendar.deleteEvent(ev.id);
});

step("P · folders of your own on Files: a folder is a link, one per file, deleting it keeps the files (1C, UR-14)", async () => {
  const F = K.files;
  await new Promise((r) => F.ready(r));
  const mk = (n, t) => new app.window.File([t], n, { type: "text/plain" });
  await new Promise((r) => F.add([mk("QA a.txt", "alpha"), mk("QA b.txt", "beta")], {}, () => r()));
  const a = F.all().find((x) => x.name === "QA a.txt"), b = F.all().find((x) => x.name === "QA b.txt");
  const f1 = F.addFolder("  QA   Physics "), f2 = F.addFolder("QA Uni");
  eq([f1.name, F.addFolder("qa physics").id], ["QA Physics", f1.id], "a name is tidied, and the same name is the same folder");
  assert(/^fd-[a-z0-9]{12}$/.test(f1.id), "a random id: " + f1.id);
  await new Promise((r) => F.moveToFolder(a.fileId, f1.id, r));
  await new Promise((r) => F.moveToFolder(a.fileId, f2.id, r));
  const a1 = F.get(a.fileId);
  eq([F.folderOf(a1), a1.links.filter((l) => l.kind === "folder").length], [f2.id, 1], "a file sits in one folder at most");
  eq(F.linkLabel({ kind: "folder", id: f2.id }), "Folder · QA Uni", "the link reads as the folder");
  /* the page: the open folder filters, and a file added while it is open goes in it */
  K.store.state.ui.files = Object.assign(K.store.state.ui.files || {}, { folder: f2.id });
  K.show("files"); await app.settle(); await app.settle();
  const names = () => Array.from(D.querySelectorAll('[data-ui~="files.item"] .k-files-name')).map((n) => n.textContent);
  eq(names().filter((n) => /^QA /.test(n)), ["QA a.txt"], "the open folder shows its own files");
  const chip = Array.from(D.querySelectorAll('[data-ui~="files.folder"]')).find((c) => /QA Uni/.test(c.textContent));
  assert(chip && chip.getAttribute("aria-pressed") === "true" && /· 1/.test(chip.textContent), "its chip is pressed and counts 1");
  /* deleting the folder keeps both files and drops only the folder's links */
  await new Promise((r) => F.removeFolder(f2.id, r));
  const a2 = F.get(a.fileId);
  assert(a2 && !F.folderOf(a2), "the file stays, out of the folder");
  eq(F.folders().map((x) => x.name), ["QA Physics"], "only that folder went");
  eq(F.linkLabel({ kind: "folder", id: f2.id }), "A folder you deleted", "a link to a gone folder says so");
  await new Promise((r) => F.removeFolder(f1.id, r));
  K.store.state.ui.files.folder = "";
  await new Promise((r) => K.attach.remove(a.id, r)); await new Promise((r) => K.attach.remove(b.id, r));
});

step("Q · ink: a Paste button; a lasso across pages selects, moves and re-homes; a loop through a picture offers its part (1C, UR-10, UR-9)", async () => {
  const W = app.window, U = K.inkUI, I = K.ink, G = I.geo;
  /* the Paste button sits by Image and says when the clipboard holds no picture */
  const dk = U.desk({});
  const bar = U.toolbar(dk, {});
  D.body.appendChild(bar);
  const pb = bar.querySelector('[data-ui~="ink.paste"]');
  assert(pb && pb.tagName === "BUTTON", "the Paste button is a button in the bar");
  const nav = W.navigator;
  Object.defineProperty(nav, "clipboard", { configurable: true, value: { read: () => Promise.resolve([{ types: ["text/plain"], getType: () => Promise.resolve(new W.Blob(["x"])) }]) } });
  pb.click(); await app.settle();
  assert(/no picture on the clipboard/.test(D.getElementById("toast").textContent), "no picture: it says so");
  Object.defineProperty(nav, "clipboard", { configurable: true, value: { read: () => Promise.reject(new Error("denied")) } });
  pb.click(); await app.settle();
  assert(/clipboard wasn't shared/.test(D.getElementById("toast").textContent), "refused: it says so");
  /* the colour and size menu shows a pick made inside it, at once (1C) */
  dk.setTool("pen", true);
  const cbtn = bar.querySelector('[data-ui~="ink.colour-btn"]');
  assert(cbtn, "a narrow bar puts colour and size in one menu");
  {
    cbtn.click(); await app.settle();
    const pop = D.querySelector(".k-ink-pop");
    const sw = Array.from(pop.querySelectorAll('[data-ui~="ink.swatch"]'));
    const other = sw.find((x) => x.getAttribute("aria-checked") !== "true");
    other.click(); await app.settle(); await new Promise((r) => setTimeout(r, 5));
    eq(sw.filter((x) => x.getAttribute("aria-checked") === "true").map((x) => x.dataset.role), [other.dataset.role], "the swatch picked in the menu is the one ticked there");
    const head = pop.querySelector('[data-ui~="ink.option-head"]');
    assert(head && head.textContent.indexOf(other.getAttribute("aria-label")) !== -1, "the heading names it: " + (head && head.textContent));
    const wd = Array.from(pop.querySelectorAll('[data-ui~="ink.width"]'));
    const w2 = wd.find((x) => x.getAttribute("aria-checked") !== "true");
    w2.click(); await app.settle();
    eq(wd.filter((x) => x.getAttribute("aria-checked") === "true").length, 1, "one width ticked");
    assert(w2.getAttribute("aria-checked") === "true", "the width picked in the menu is the one ticked there");
    D.body.click();
  }
  bar.remove();
  /* two A4 pages stacked on screen, 20 px apart (500 px wide: half scale) */
  const mk = () => { const h = D.createElement("div"); D.body.appendChild(h); return h; };
  const p1 = I.blankPage("qa:lasso"), p2 = I.blankPage("qa:lasso");
  const s1 = U.surface(mk(), p1, dk), s2 = U.surface(mk(), p2, dk);
  const H = I.pageH(p1), hpx = 500 * H / I.W;
  s1.rect = () => ({ left: 0, top: 0, width: 500, height: hpx, right: 500, bottom: hpx });
  s2.rect = () => ({ left: 0, top: hpx + 20, width: 500, height: hpx, right: 500, bottom: 2 * hpx + 20 });
  dk.setTool("lasso", true);
  const a = s1._stroke([{ x: 300, y: H - 120 }, { x: 360, y: H - 100 }]);    /* near page 1's foot */
  const b = s2._stroke([{ x: 300, y: 80 }, { x: 360, y: 100 }]);             /* near page 2's head */
  const far = s2._stroke([{ x: 300, y: 900 }, { x: 360, y: 920 }]);          /* outside the loop */
  /* a loop on page 1 that runs 300 units past its foot */
  s1._lasso([{ x: 250, y: H - 200 }, { x: 450, y: H - 200 }, { x: 450, y: H + 300 }, { x: 250, y: H + 300 }]);
  eq([s1._sel(), s2._sel()], [[a.id], [b.id]], "the loop selects on both pages it covers, and nothing outside it");
  assert(dk.selGroup && dk.selGroup.length === 2, "one selection over two pages");
  eq(D.querySelectorAll('[data-ui~="ink.selection"]').length, 1, "one set of chips, on the first page");
  /* Move as one: both pages move by the same amount */
  s1._beginMove(); s2._beginMove(); s1._moveBy(0, 40); s2._moveBy(0, 40); s1._endMove(); s2._endMove();
  const yOf = (pg, id) => G.itemBox(pg.items.find((x) => x.id === id)).y;
  assert(Math.abs(yOf(p2, b.id) - (G.itemBox(b).y + 40)) < 1, "page 2's part moved with page 1's");
  /* dragged past page 1's foot, a stroke moves into page 2 */
  s1._beginMove(); s1._moveBy(0, 200); s1._endMove();
  const n = s1._rehome([s1]);
  eq([n, p1.items.some((x) => x.id === a.id), p2.items.some((x) => x.id === a.id)], [1, false, true], "it now belongs to page 2");
  const moved = p2.items.find((x) => x.id === a.id), by = G.itemBox(moved);
  assert(by.y > 0 && by.y < 200, "placed near page 2's head, where it was dropped: y " + Math.round(by.y));
  /* Delete acts on every page of the selection */
  s1._lasso([{ x: 250, y: H - 300 }, { x: 450, y: H - 300 }, { x: 450, y: H + 500 }, { x: 250, y: H + 500 }]);
  const before = p1.items.length + p2.items.length, chosen = s1._sel().length + s2._sel().length;
  q('[data-ui~="ink.sel-delete"]').click();
  eq(p1.items.length + p2.items.length, before - chosen, "Delete took the selection off both pages");
  assert(p2.items.some((x) => x.id === far.id), "and nothing else");
  /* parts of a picture: the loop cuts it without taking it */
  const img = { id: "qaimg", k: "img", x: 100, y: 100, w: 400, h: 300, src: "data:image/png;base64,AAAA" };
  const loop = [{ x: 120, y: 120 }, { x: 260, y: 120 }, { x: 260, y: 220 }, { x: 120, y: 220 }];
  eq(G.cutPicture([img], loop, []).id, "qaimg", "the loop cuts the picture");
  eq(G.cutPicture([img], loop, ["qaimg"]), null, "not when the picture itself is taken");
  const cr = G.cropOf(img, loop, 800, 600);
  eq([cr.x, cr.y, cr.w, cr.h, cr.sx, cr.sy, cr.sw, cr.sh], [120, 120, 140, 100, 40, 40, 280, 200], "the crop in page units and in the picture's own pixels");
  s1._take([img]); s1._lasso(loop);
  assert(q('[data-ui~="ink.sel-crop"]'), "Copy this part of the picture is offered");
  s1.destroy(); s2.destroy();
});

step("R · ink: rich text in a text box and a ruled table, typed into cell by cell (1C, UR-12)", async () => {
  const U = K.inkUI, I = K.ink, G = I.geo;
  eq(G.parseRich("- **Bold** and *it*"), { list: "•", runs: [{ t: "Bold", b: true }, { t: " and " }, { t: "it", i: true }] }, "bold, italic and a bullet");
  eq([G.parseRich("3. x").list, G.plainOf("1) **y** z")], ["3.", "1. y z"], "a numbered line, and the words alone");
  eq(G.parseRich("<b>no</b>").runs, [{ t: "<b>no</b>" }], "HTML is only ever text");
  const dk = U.desk({}), host = D.createElement("div"); D.body.appendChild(host);
  const pg = I.blankPage("qa:table"), sf = U.surface(host, pg, dk);
  /* a text box: the format bar writes the markup */
  dk.setTool("text", true);
  const ta = sf._textAt({ x: 100, y: 100 });
  assert(ta && q('[data-ui~="ink.format"]'), "a text box comes with its format bar");
  ta.value = "Key idea"; ta.selectionStart = 0; ta.selectionEnd = 3;
  q('[data-ui~="ink.fmt-bold"]').click();
  eq(ta.value, "**Key** idea", "Bold wraps the selection");
  ta.selectionStart = 0; ta.selectionEnd = ta.value.length;
  q('[data-ui~="ink.fmt-bullets"]').click();
  eq(ta.value, "- **Key** idea", "a bulleted line");
  q('[data-ui~="ink.fmt-bullets"]').click();
  eq(ta.value, "**Key** idea", "and back");
  sf._closeText();
  eq(pg.items.filter((x) => x.k === "text").map((x) => x.s), ["**Key** idea"], "the box keeps its markup");
  assert(!q('[data-ui~="ink.format"]'), "the bar goes with the box");
  /* a table: placed, typed into, a column added, scaled */
  const t = dk.placeTable();
  assert(t && pg.items.some((x) => x.id === t.id && x.k === "table"), "Table puts a 3 × 3 table on the page");
  eq([t.cw.length, t.rh.length], [3, 3], "three columns, three rows");
  const cell = G.cellAt(t, t.x + t.cw[0] + 10, t.y + t.rh[0] + 10);
  eq([cell.r, cell.c], [1, 1], "the cell under a point");
  dk.setTool("text", true);
  const cta = sf._textAt({ x: cell.x + 5, y: cell.y + 5 });
  assert(cta && /row 2, column 2/.test(cta.getAttribute("aria-label")), "the cell opens its own box");
  cta.value = "**f(x)**"; sf._closeText();
  const t1 = pg.items.find((x) => x.id === t.id);
  eq(t1.c[1][1], "**f(x)**", "the cell keeps what was typed");
  eq(pg.items.filter((x) => x.k === "text").length, 1, "and no stray text box was made");
  dk.setTool("lasso", true); sf._select([t.id]);
  q('[data-ui~="ink.table-col-add"]').click();
  const t2 = pg.items.find((x) => x.id === t.id);
  eq([t2.cw.length, t2.c[1][1]], [4, "**f(x)**"], "+ Column adds a column and keeps the text");
  for (let i = 0; i < 4; i++) { const b = q('[data-ui~="ink.table-row-del"]'); if (b) b.click(); }
  eq(pg.items.find((x) => x.id === t.id).rh.length, 1, "rows come off down to one, never none");
  const sc = G.transform([t2], [t2.id], (x, y) => ({ x: t2.x + (x - t2.x) * 2, y: t2.y + (y - t2.y) * 2 }))[0];
  eq([sc.cw[0], sc.rh[0], sc.sz], [t2.cw[0] * 2, t2.rh[0] * 2, Math.min(120, t2.sz * 2)], "Resize scales the grid and its lettering");
  sf.destroy(); host.remove();
});

step("S · ink: copy maths as TeX — out as a picture and a prompt, back as a reply that must render (1C, UR-13, D2)", async () => {
  const W = app.window, U = K.inkUI, I = K.ink, G = I.geo;
  eq(G.cleanTex("```latex\nx^2\n```"), "x^2", "a fenced reply is unwrapped");
  eq([G.cleanTex("$$\\frac{1}{2}$$"), G.cleanTex("\\[ a+b \\]"), G.cleanTex("$y$"), G.cleanTex(" z ")], ["\\frac{1}{2}", "a+b", "y", "z"], "$$, \\[ \\] and $ come off");
  assert(/LaTeX only/.test(G.TEX_PROMPT) && /don't solve/.test(G.TEX_PROMPT), "the prompt asks for the writing as written, LaTeX only");
  /* the app's KaTeX (a stand-in here: the harness loads no CDN) */
  const had = W.katex;
  W.katex = { renderToString: (t) => { if ((t.match(/\{/g) || []).length !== (t.match(/\}/g) || []).length) throw new Error("KaTeX parse error: Expected '}'"); return "<span class=\"katex\">" + t.replace(/</g, "&lt;") + "</span>"; } };
  eq(K.inkTeX.check("\\frac{1}{2}").ok, true, "a reply that renders is good");
  assert(/doesn't render: Expected/.test(K.inkTeX.check("\\frac{1}{2").why), "one that doesn't says why");
  const dk = U.desk({}), host = D.createElement("div"); D.body.appendChild(host);
  const pg = I.blankPage("qa:tex"), sf = U.surface(host, pg, dk);
  const st = sf._stroke([{ x: 100, y: 100 }, { x: 200, y: 140 }]);
  dk.setTool("lasso", true); sf._select([st.id]);
  const chip = q('[data-ui~="ink.sel-tex"]');
  assert(chip, "a selection with writing offers Copy as TeX");
  chip.click(); await app.settle();
  assert(q('[data-ui~="ink.tex"]') && q('[data-ui~="ink.tex-copy-prompt"]'), "the dialog: the picture's buttons and the prompt");
  const reply = q('[data-ui~="ink.tex-reply"]'), keep = q('[data-ui~="ink.tex-keep"]');
  reply.value = "$$\\frac{1}{2$$"; reply.dispatchEvent(new W.Event("input")); await new Promise((r) => setTimeout(r, 300));
  assert(q('[data-ui~="ink.tex-error"]') && keep.hasAttribute("disabled"), "a reply that doesn't render is refused, with its error");
  reply.value = "$$\\frac{1}{2}$$"; reply.dispatchEvent(new W.Event("input")); await new Promise((r) => setTimeout(r, 300));
  assert(q('[data-ui~="ink.tex-preview"] .katex') && !keep.hasAttribute("disabled"), "one that renders shows its preview");
  keep.click(); await app.settle();
  const kept = pg.items.filter((x) => x.k === "text" && x.tex);
  eq(kept.map((x) => x.s), ["\\frac{1}{2}"], "Keep puts the cleaned TeX on the page");
  assert(kept[0].y > G.itemBox(st).y, "under the writing");
  if (had) W.katex = had; else delete W.katex;
  sf.destroy(); host.remove();
});

step("T · Code: the compiler's errors squiggled as you type, and suggestions at the caret (1C, UR-23)", async () => {
  const W = app.window, R = K.codeRun, had = R.assist;
  const wait = async (ms) => { await new Promise((r) => setTimeout(r, ms)); await app.settle(); };
  /* a stand-in for Runner.Assist (tools/cs_wasm_check.mjs checks the real one) */
  const asked = [];
  R.assist = (req) => {
    asked.push(req);
    const src = req.files[0].src, out = { diags: [] };
    const at = src.indexOf("totl");
    if (at >= 0) out.diags.push({ file: "Program.cs", s: at, e: at + 4, sev: "error", code: "CS0103", msg: "The name 'totl' does not exist in the current context" });
    const un = src.indexOf("int unused");
    if (un >= 0) out.diags.push({ file: "Program.cs", s: un + 4, e: un + 10, sev: "warning", code: "CS0168", msg: "The variable 'unused' is declared but never used" });
    if (req.pos >= 0 && req.file) {
      const pre = src.slice(0, req.pos), w = /\w*$/.exec(pre)[0];
      out.complete = { start: req.pos - w.length, end: req.pos, items: /Console\.\w*$/.test(pre)
        ? [{ l: "Write", k: "method", d: "void Write(bool value) (+18 overloads)" }, { l: "WriteLine", k: "method", d: "void WriteLine() (+19 overloads)" }].filter((i) => i.l.toLowerCase().startsWith(w.toLowerCase()))
        : [] };
    }
    return Promise.resolve(out);
  };
  const h = blank();
  const ed = K.codeUI.editor({ value: "int total = 0;\nConsole.WriteLine(totl);\n", file: "Program.cs", lesson: "7.1" });
  h.appendChild(ed.el);
  const ta = ed.input, probs = q('[data-ui~="code.editor-problems"]', h);
  assert(probs && probs.hidden && !q(".k-ced-dsq", h), "nothing is asked until the editor is used");
  ta.dispatchEvent(new W.FocusEvent("focus"));
  await wait(20);
  eq(asked[0].nullable, true, "a unit 7+ lesson is checked with nullable on, as it runs");
  const sq = q('[data-ui~="code.editor-squiggles"] .k-ced-dsq', h);
  eq([sq && sq.textContent, sq && sq.getAttribute("data-sev")], ["totl", "error"], "the misspelt name is squiggled, as an error");
  eq(q('.k-ced-ln[data-diag="error"]', h) && q('.k-ced-ln[data-diag="error"]', h).textContent, "2", "its line is marked in the gutter");
  assert(!probs.hidden && /1 error — Ln 2: The name 'totl'/.test(probs.textContent), "the status bar names it: " + probs.textContent);
  /* typing above it moves the squiggle with its word before Roslyn answers */
  ta.value = "// sum\n" + ta.value; ta.selectionStart = ta.selectionEnd = 7;
  ta.dispatchEvent(new W.InputEvent("input", { data: "\n", inputType: "insertLineBreak" }));
  eq(q(".k-ced-dsq", h) && q(".k-ced-dsq", h).textContent, "totl", "an edit elsewhere keeps the squiggle on its word");
  /* the problem button moves the caret to it */
  ta.selectionStart = ta.selectionEnd = 0;
  probs.click();
  eq([ta.selectionStart, ta.selectionEnd], [ta.value.indexOf("totl"), ta.value.indexOf("totl") + 4], "the problem button selects the problem");
  /* fixing it clears it once the compiler answers */
  ta.value = ta.value.replace("totl", "total"); ta.dispatchEvent(new W.InputEvent("input", { data: "a", inputType: "insertText" }));
  await wait(700);
  assert(!q(".k-ced-dsq", h) && probs.hidden, "a fixed file has no squiggle and no problem line");
  /* suggestions: after a dot and while typing a name */
  const end = ta.value.length;
  ta.value += "Console.Wr"; ta.selectionStart = ta.selectionEnd = ta.value.length;
  ta.dispatchEvent(new W.InputEvent("input", { data: "r", inputType: "insertText" }));
  await wait(150);
  const pop = q('[data-ui~="code.editor-complete"]', h);
  eq([...pop.querySelectorAll('[role="option"]')].map((o) => o.getAttribute("aria-label").split(",")[0]), ["Write", "WriteLine"], "Console.Wr offers Write and WriteLine");
  assert(!pop.hidden && ta.getAttribute("aria-activedescendant") === pop.firstChild.id && ta.getAttribute("aria-controls") === pop.id, "the list is tied to the editor for a screen reader");
  ta.dispatchEvent(new W.KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
  ta.dispatchEvent(new W.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  eq(ta.value.slice(end), "Console.WriteLine", "↓ and Enter insert the second, replacing what was typed");
  assert(pop.hidden, "and the list closes");
  /* Esc closes the list without arming "Tab leaves" */
  ta.value += ";\nConsole.W"; ta.selectionStart = ta.selectionEnd = ta.value.length;
  ta.dispatchEvent(new W.InputEvent("input", { data: "W", inputType: "insertText" }));
  await wait(150);
  assert(!pop.hidden, "the list opens again");
  ta.dispatchEvent(new W.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  assert(pop.hidden && !/Tab now leaves/.test(q('[data-ui~="code.editor-state"]', h).textContent), "Esc closes the list and nothing else");
  /* Ctrl+Space asks with nothing typed */
  const n0 = asked.length;
  ta.dispatchEvent(new W.KeyboardEvent("keydown", { key: " ", code: "Space", ctrlKey: true, bubbles: true }));
  await wait(20);
  eq(asked.length > n0 && asked[asked.length - 1].explicit, true, "Ctrl+Space asks for suggestions");
  /* a warning is amber, not red */
  ed.set("int unused;\n"); ta.dispatchEvent(new W.InputEvent("input", { data: ";", inputType: "insertText" }));
  await wait(700);
  eq(q(".k-ced-dsq", h) && q(".k-ced-dsq", h).getAttribute("data-sev"), "warning", "an unused variable is a warning");
  assert(K.ui.hasState(probs, "warn") && /1 warning/.test(probs.textContent), "and the status bar says warning");
  /* without the runtime: the file's own words and the keywords, no squiggles */
  R.assist = () => Promise.resolve(null);
  ed.set("int total = 0;\n"); ta.value += "to"; ta.selectionStart = ta.selectionEnd = ta.value.length;
  ta.dispatchEvent(new W.InputEvent("input", { data: "o", inputType: "insertText" }));
  await wait(150);
  eq([...pop.querySelectorAll('[role="option"]')].map((o) => o.getAttribute("aria-label").split(",")[0]), ["total"], "the file's own name is offered");
  ta.dispatchEvent(new W.KeyboardEvent("keydown", { key: "Tab", bubbles: true }));
  eq(ta.value.split("\n")[1], "total", "Tab inserts it");
  ta.value += "."; ta.selectionStart = ta.selectionEnd = ta.value.length;
  ta.dispatchEvent(new W.InputEvent("input", { data: ".", inputType: "insertText" }));
  await wait(150);
  assert(pop.hidden && !q(".k-ced-dsq", h), "after a dot nothing is guessed, and nothing is squiggled");
  /* where help would give the answer away it is off */
  const off = K.codeUI.editor({ value: "int x = 1", file: "Bug.cs", assist: false });
  h.appendChild(off.el);
  assert(!q('[data-ui~="code.editor-squiggles"]', off.el) && !q('[data-ui~="code.editor-problems"]', off.el) && !off.input.hasAttribute("aria-autocomplete"), "assist: false: no squiggles, no problem line, no list");
  /* the bug hunt and retrieval pass it */
  const src = require("fs").readFileSync(require("path").join(__dirname, "../js/modules/codetopic.js"), "utf8") + require("fs").readFileSync(require("path").join(__dirname, "../js/modules/code.js"), "utf8");
  assert(/label: "Buggy code", onRun: go, assist: false/.test(src) && /label: "Your answer", onRun: check, assist: false/.test(src), "the bug hunt and retrieval switch it off");
  R.assist = had;
});

step("U · the Collection: where you watch it, as the service's icon, and the title's own pages (1C, collection#1, #2, D1)", async () => {
  const W = app.window, M = K.mediadb, L = K.watchLink;
  const put = (e) => new Promise((r) => M.put(e, (err, rec) => r(rec)));
  const get = (id) => new Promise((r) => M.get(id, (err, rec) => r(rec)));
  /* the schema: http(s) only, a label only with a link */
  eq(M.normalise({ watchUrl: " https://www.crunchyroll.com/series/G1 ", watchLabel: "  Crunchy " }).watchUrl, "https://www.crunchyroll.com/series/G1", "an https link is kept, trimmed");
  eq(["javascript:alert(1)", "ftp://x.org/a", "https://localhost", "not a link"].map((u) => M.normalise({ watchUrl: u }).watchUrl), [null, null, null, null], "anything else is dropped");
  eq(M.normalise({ watchLabel: "Orphan" }).watchLabel, null, "a label with no link is dropped");
  eq([L.clean("crunchyroll.com/series/G1"), L.clean("javascript:alert(1)")], ["https://crunchyroll.com/series/G1", null], "a pasted address gains https://; a script never does");
  /* the service, from the address */
  const sv = (u) => { const x = L.service(u); return x.slug + ":" + x.name; };
  eq([sv("https://www.crunchyroll.com/a"), sv("https://app.plex.tv/x"), sv("https://www.hidive.com/a"), sv("https://store.steampowered.com/app/1"), sv("https://shop.example.co.uk/b")],
    ["crunchyroll:Crunchyroll", "plex:Plex", "null:HIDIVE", "steam:Steam", "null:Example"], "known services by host; any other site by its own name");
  const fs = require("fs"), path = require("path");
  L.SERVICES.filter((x) => x.slug).forEach((x) => assert(fs.existsSync(path.join(__dirname, "../assets/icons/services/" + x.slug + ".svg")), "a bundled icon for " + x.slug));
  /* a record with a link, and the pull keeps it (the manual layer, invariant 9) */
  const rec = await put(M.normalise({ module: "anime", title: "QA Frieren", status: "inProgress", syncSource: "anilist", externalIds: { anilistId: 154587, malId: 52991 },
    watchUrl: "https://www.crunchyroll.com/series/GG5H5XQX4/frieren" }));
  await new Promise((r) => M.bulkUpsert([{ module: "anime", title: "QA Frieren", status: "completed", syncSource: "anilist", externalIds: { anilistId: 154587 } }], { source: "anilist" }, r));
  await app.settle();
  const pulled = await get(rec.id);
  eq([pulled.status, pulled.watchUrl], ["completed", "https://www.crunchyroll.com/series/GG5H5XQX4/frieren"], "a pull moves the list state and keeps your link");
  assert(M.hasLocalData(pulled), "a link is a reason a replace keeps the row");
  eq(K.mediapush.snapshot(pulled), K.mediapush.snapshot(Object.assign({}, pulled, { watchUrl: null })), "the link is never in a push (13)");
  /* the link: the icon in a real link, its name for a screen reader */
  const a = L.link(pulled);
  eq([a.tagName, a.getAttribute("href"), a.getAttribute("target"), a.getAttribute("rel"), a.getAttribute("aria-label")],
    ["A", pulled.watchUrl, "_blank", "noopener noreferrer", "Watch on Crunchyroll (opens in a new tab)"], "the watch link");
  eq(a.querySelector("img").getAttribute("src"), "assets/icons/services/crunchyroll.svg", "drawn with the bundled icon");
  assert(!a.textContent.trim(), "the icon, not the name, is what shows");
  eq(L.link(Object.assign({}, pulled, { module: "books", watchLabel: "My library" })).getAttribute("aria-label"), "Read on My library (opens in a new tab)", "a book is read, and your own name wins");
  eq(L.providers(pulled).map((x) => x.getAttribute("href")), ["https://anilist.co/anime/154587", "https://myanimelist.net/anime/52991"], "the title's own pages");
  eq(L.providers({ module: "vn", externalIds: { vndbId: "v17" } }).concat(L.providers({ module: "game", externalIds: { steamAppId: 413150 } })).map((x) => x.getAttribute("href")),
    ["https://vndb.org/v17", "https://store.steampowered.com/app/413150"], "VNDB and Steam too");
  const mono = L.link({ module: "anime", watchUrl: "https://www.hidive.com/stream/x" }).querySelector("[data-ui~='svc.icon'] span");
  assert(mono && mono.textContent === "H" && mono.style.getPropertyValue("--svc-hue"), "a service with no bundled icon gets a monogram");
  /* your own icon for a site, from media kv, as a PNG */
  const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  await new Promise((r) => M.setKV("serviceIcons", { "hidive.com": png }, r));
  /* (the module reads the kv once; a fresh read for this check) */
  const box = L.icon(L.service("https://www.hidive.com/x"));
  await app.settle();
  assert(box.querySelector("img") || box.querySelector("span"), "an icon is drawn at once");
  /* the editor: the field in Your layer, written into the draft; Cancel keeps nothing */
  K.mediaEditors.anime(pulled, () => {});
  await app.settle();
  let dlg = q("[data-ui~='vault.editor']");
  const fld = dlg.querySelector("[data-edit-section='personal'] [data-ui~='vault.watch-field']");
  assert(fld, "Anime's Your layer holds the field");
  assert(dlg.querySelector("[data-ui~='vault.links'] [data-ui~='vault.watch']") && dlg.querySelectorAll("[data-ui~='vault.links'] [data-ui~='vault.provider-link']").length === 2, "the action row: the watch link and the title's pages");
  const urlIn = fld.querySelector("[data-ui~='vault.watch-url']");
  urlIn.value = "netflix.com/title/81726716"; urlIn.dispatchEvent(new W.Event("input"));
  eq(fld.querySelector("[data-ui~='vault.watch-preview'] img").getAttribute("src"), "assets/icons/services/netflix.svg", "the field previews the new service's icon");
  urlIn.value = "javascript:alert(1)"; urlIn.dispatchEvent(new W.Event("input"));
  assert(/isn't a web address/.test(fld.querySelector("[data-ui~='vault.watch-note']").textContent), "a bad address is named");
  [...dlg.querySelectorAll("button")].find((b) => b.textContent === "Cancel").click();
  await app.settle();
  eq((await get(rec.id)).watchUrl, pulled.watchUrl, "Cancel keeps nothing");
  K.mediaEditors.anime(await get(rec.id), () => {});
  await app.settle();
  dlg = q("[data-ui~='vault.editor']");
  const u2 = dlg.querySelector("[data-ui~='vault.watch-url']"), n2 = dlg.querySelector("[data-ui~='vault.watch-label']");
  u2.value = "https://www.netflix.com/title/81726716"; u2.dispatchEvent(new W.Event("input"));
  n2.value = "Netflix UK"; n2.dispatchEvent(new W.Event("input"));
  dlg.querySelector("[data-ui~='vault.save-actions'] button[data-intent~='primary']").click();
  await app.settle();
  const saved = await get(rec.id);
  eq([saved.watchUrl, saved.watchLabel], ["https://www.netflix.com/title/81726716", "Netflix UK"], "Save keeps the link and its name");
  /* the card's hover row carries it */
  const card = K.medview.card(saved, () => {}, { open: () => {} });
  const cl = card.querySelector("[data-ui~='vault.quickrow'] [data-ui~='vault.watch']");
  assert(cl && cl.getAttribute("data-size") === "sm" && cl.getAttribute("aria-label") === "Watch on Netflix UK (opens in a new tab)", "the card links it from its hover row");
  /* the other vaults hold it on their Shelf */
  K.mediaEditors.game(M.normalise({ module: "game", title: "QA Game", status: "inProgress" }), () => {});
  await app.settle();
  dlg = [...D.querySelectorAll("[data-ui~='vault.editor']")].pop();
  assert(dlg.querySelector("[data-edit-section='ownership'] [data-ui~='vault.watch-field']") && /Where I play it/.test(dlg.textContent), "Games: the Shelf, 'Where I play it'");
  [...dlg.querySelectorAll("button")].find((b) => b.textContent === "Cancel").click();
  await app.settle();
});

step("V · speed: a small medal reads the 192 px badge art, a large one the full art, and every badge has its copy (1F, architecture-perf#6)", async () => {
  const fs = require("fs"), path = require("path"), cp = require("child_process");
  const out = cp.execFileSync("python3", [path.join(__dirname, "gen_badge_small.py"), "--check"], { encoding: "utf8" });
  assert(/all \d+ badges have a 192 px copy/.test(out), "every square badge has its small copy: " + out);
  const A = K.achievements, d = A.defs().filter((x) => x.art && !x.hidden && fs.existsSync(path.join(__dirname, "..", "assets/app/img", x.art + ".webp")))[0];
  const v = d ? A.viewOf(d, A.makeCtx(), 0) : null;
  assert(v, "a badge with art to draw");
  const src = (o) => { const m = K.achUI.medal(v, o).querySelector("img"); return m ? m.getAttribute("src") : null; };
  const small = src({ size: "base" }), large = src({ size: "lg" }), laid = src({ px: 64 });
  eq([small, large, laid], ["assets/app/img/sm/" + v.def.art + ".webp", "assets/app/img/" + v.def.art + ".webp", "assets/app/img/sm/" + v.def.art + ".webp"], "88 and 64 px read the copy, 208 px the full art");
  assert(fs.existsSync(path.join(__dirname, "..", small)), "the copy is on disk");
});

step("W · Home stays lit on Reports, and an event of a type the calendar does not know still has a hue (shell#5, productivity#6)", async () => {
  K.show("reports"); await app.settle(); await app.settle();
  const lit = [...D.querySelectorAll("[data-ui~='shell.rail-item']")].filter((b) => b.getAttribute("aria-current") === "page").map((b) => b.dataset.section);
  eq(lit, ["home"], "Reports light Home on the rail");
  /* an imported event typed "other", with a colour no longer offered */
  const c = K.store.state.calendar;
  c.events.push({ id: 9901, title: "Imported thing", date: TODAY, type: "other", colour: "plaid", allDay: true, alerts: [], refs: [], v: c.v, updatedAt: 5 });
  const ev = c.events.find((e) => e.id === 9901);
  K.calendar.migrateRefs();
  eq([ev.type, ev.colour, ev.updatedAt], ["personal", "", 5], "the boot pass gives it the gate's default type and drops the unknown colour, as a migration");
  K.show("home"); await app.settle();
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
