/* Kurenai OS — smoke198.test.js
   Neon's batch 6 (1E features): one failing-without-fix step per size M ticket.

   The claims:

     A · productivity#5   Reminders inspector: "Place in a free block" makes a
                          study block with Undo and shows "Placed HH:MM";
                          "Focus on this" opens Focus pre-filled without starting.
     B · productivity#9   Calendar: "Skip this showing" on a repeating local
                          event skips one date (single record, Undo restores,
                          skipped detail says so, not offered on Google-linked).
     C · mind#3           Mind desk shows "Review my Mind cards (N due)" only
                          when due; runs the due cards outside Daily 15 using
                          FSRS rating without touching ui.daily or Focus.
     D · bk:code-space#1  One per-runner status (booting, ready, busy, failed)
                          shared across Code's Run buttons; boot timeout never
                          reads as learner code being wrong; warm timeout still
                          reads as Did not finish.
     E · shop-cosmetics#2 "Save gold for X" goal type (gov-gold) measured from
                          gold balance against item price; Shop's sheet and pin
                          offer "Add to Goals"; reaching price marks Met with
                          payout "none" and never buys.
     F · bk:goals#2       "Make this a goal" on routine, Money pot, exam
                          readiness, Collection title, and Money budget opens
                          KOS.goalsUI.newGoal pre-filled via existing links.
     G · bk:money-goals#6 Recurring "Not yet confirmed" queue lists every past
                          unconfirmed occurrence (>14 days), offers inline bank
                          match via confirmWith only on press, and Confirm all /
                          Skip all ask first and support Undo.
     H · bk:ja-mind#4     Japanese leech recovery: KOS.jaSrs.unleech mirrors
                          KOS.srs.unleech with leechBase (+4 lapses), never
                          erases lapses; desk lists set-aside facets with
                          "Relearn from the lesson" and "Back in the schedule"
                          with Undo.
     I · bk:ja-mind#5     Logging Japanese immersion through Focus: optional
                          Watching/Reading/Listening choice on Focus for ja,
                          paid solely by KOS.governor.focusAward, read from the
                          ledger on Japanese desk using KOS.sessions.parts.

   Run: node tools/smoke198.test.js                                         */
"use strict";
const { boot } = require("./lib/app-harness");

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
function assert(c, m) { if (!c) throw new Error(m); }
function eq(a, b, m) { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(m + ": got " + JSON.stringify(a) + ", want " + JSON.stringify(b)); }

const TODAY = "2026-11-21";
let app, K, D;
const q = (s, r) => (r || D).querySelector(s);
const qa = (s, r) => [...(r || D).querySelectorAll(s)];
const click = (n) => { assert(n, "nothing to click"); n.dispatchEvent(new app.window.MouseEvent("click", { bubbles: true })); };

step("boot", async () => {
  app = await boot({ clock: TODAY + "T10:00:00" });
  K = app.KOS; D = app.document;
  await app.settle();
  eq(app.errors, [], "boot errors");
});

/* ---------------- A · productivity#5 ---------------- */
step("A · Reminders inspector offers Place in a free block (with Undo) and Focus on this (productivity#5)", async () => {
  const r = K.reminders.add({ title: "Revise sorting algorithms", due: TODAY });
  K.show("reminders", { id: r.id, section: "all" });
  await app.settle();

  const placeBtn = q("[data-ui~='rem.place']");
  const focusBtn = q("[data-ui~='rem.focus']");
  assert(placeBtn, "Place in a free block menu button is rendered");
  assert(focusBtn, "Focus on this button is rendered");

  /* Place in a free block -> creates study event, updates to Placed HH:MM, Undo removes it */
  const beforeCount = K.calendar.eventsOn(TODAY).filter((e) => e.type === "study" && e.title === r.title).length;
  eq(beforeCount, 0, "no study block yet");
  click(placeBtn); await app.settle();
  const menuItem = q("[data-ui~='ui.menu-panel'] [role='menuitem'], [role='menu'] [role='menuitem']");
  assert(menuItem, "a free-block menu item is offered");
  click(menuItem); await app.settle();

  const placed = K.calendar.eventsOn(TODAY).filter((e) => e.type === "study" && e.title === r.title);
  eq(placed.length, 1, "one study block created on today's calendar");
  const chip = q("[data-ui~='rem.placed']");
  assert(chip && chip.textContent === "Placed " + placed[0].time, "inspector shows Placed " + placed[0].time + ": " + (chip && chip.textContent));

  const undoBtn = qa("[data-ui~='shell.toast-row'] button").find((b) => /Undo/i.test(b.textContent));
  assert(undoBtn, "Undo toast action is shown");
  click(undoBtn); await app.settle();
  eq(K.calendar.eventsOn(TODAY).filter((e) => e.type === "study" && e.title === r.title).length, 0, "Undo removes the study block");
  assert(q("[data-ui~='rem.place']"), "Place button returns after Undo");

  /* Focus on this -> opens Focus pre-filled with title, never starts a session (invariant 4e) */
  click(q("[data-ui~='rem.focus']")); await app.settle();
  eq(K.currentNav().viewId, "focus", "navigated to Focus");
  const objIn = q("[data-ui~='focus.obj-in']");
  assert(objIn && objIn.value === r.title, "Focus objective pre-filled: " + (objIn && objIn.value));
  eq(K.focus.state(), "idle", "Focus did not auto-start (invariant 4e)");
  eq(app.errors, [], "no page errors");
});

/* ---------------- B · productivity#9 ---------------- */
step("B · Calendar: Skip this showing skips one date with Undo, shows skipped detail, and hides on Google-linked events (productivity#9)", async () => {
  /* 1. normalise keeps only valid ISO dates, sorted & unique; non-repeating clears skip */
  const n1 = K.calendar.normalise({ title: "Lab", date: TODAY, recur: "weekly", skip: ["2026-12-05", "bad", "2026-11-28", "2026-11-28"] });
  eq(n1.skip, ["2026-11-28", "2026-12-05"], "normalise keeps valid sorted unique ISO dates");
  const n2 = K.calendar.normalise({ title: "Once", date: TODAY, recur: "none", skip: ["2026-11-28"] });
  eq(n2.skip, [], "non-repeating clears skip");

  /* 2. repeating local event: Skip this showing removes only that date from one record, Undo restores */
  const nextWk = K.srs.addDays(TODAY, 7);
  const ev = K.calendar.addEvent({ title: "Weekly seminar", type: "lesson", date: TODAY, time: "14:00", durationMins: 60, recur: "weekly" });
  const beforeLen = K.store.state.calendar.events.length;
  eq(K.calendar.occursOn(ev, TODAY), true, "occurs on first date");
  eq(K.calendar.occursOn(ev, nextWk), true, "occurs next week");

  K.show("calendar"); await app.settle();
  K.calendar.eventDetail(ev, TODAY); await app.settle();
  const skipBtn = q("[data-ui~='cal.skip']");
  assert(skipBtn, "Skip this showing button is offered on local repeating event");
  click(skipBtn); await app.settle();

  const updated = K.calendar.getEvent(ev.id);
  eq(K.store.state.calendar.events.length, beforeLen, "still ONE record (invariant 43)");
  eq(updated.skip, [TODAY], "date recorded in skip");
  eq(K.calendar.occursOn(updated, TODAY), false, "skipped date no longer occurs");
  eq(K.calendar.occursOn(updated, nextWk), true, "next week still occurs");
  eq(K.calendar.eventsOn(TODAY).some((x) => x.id === ev.id), false, "absent from eventsOn(skippedDate)");

  /* 3. detail of the skipped date says so */
  K.calendar.eventDetail(updated, TODAY); await app.settle();
  const skipNote = q("[data-ui~='cal.skipped-note']");
  assert(skipNote && /Skipped/.test(skipNote.textContent), "detail of skipped date says so: " + (skipNote && skipNote.textContent));
  assert(!q("[data-ui~='cal.skip']"), "Skip button not shown when already skipped");
  qa(".k-dialog-overlay").forEach((o) => o.close ? o.close() : o.remove());

  /* Undo restores the showing */
  const undoBtn = qa("[data-ui~='shell.toast-row'] button").find((b) => /Undo/i.test(b.textContent));
  assert(undoBtn, "Undo toast action is shown");
  click(undoBtn); await app.settle();
  const restored = K.calendar.getEvent(ev.id);
  eq(restored.skip, [], "Undo clears skip");
  eq(K.calendar.occursOn(restored, TODAY), true, "showing occurs again after Undo");

  /* 4. Google-linked repeating event does NOT offer Skip this showing (invariant 159) */
  const gev = K.calendar.addEvent({ title: "Google weekly", type: "personal", date: TODAY, time: "16:00", recur: "weekly", ext: { g: { id: "gcal123" } } });
  K.calendar.eventDetail(gev, TODAY); await app.settle();
  assert(!q("[data-ui~='cal.skip']"), "Skip not offered on Google-linked event (invariant 159)");
  qa(".k-dialog-overlay").forEach((o) => o.close ? o.close() : o.remove());
  eq(app.errors, [], "no page errors");
});

/* ---------------- C · mind#3 ---------------- */
step("C · Mind desk offers Review my Mind cards (N due) only when due and runs them outside Daily 15 (mind#3)", async () => {
  K.store.state.mind = K.mind.normalise({});
  if (K.store.state.ui && K.store.state.ui.mind) delete K.store.state.ui.mind.daily;
  K.store.save();

  /* 0 due -> entry is absent */
  K.show("subject", "mind"); await app.settle();
  assert(!q("[data-ui~='mind.review-cards']"), "hidden when 0 Mind cards are due");

  /* Seed 2 due cards -> entry appears and desk draw writes nothing */
  const cid = K.mind.concepts()[0].id;
  K.mind.introduce(cid, K.srs.addDays(TODAY, -2));
  K.store.save();
  const dueBefore = K.mind.due(TODAY, true);
  assert(dueBefore.length >= 2, "seeded due cards: " + dueBefore.length);
  const snap = JSON.stringify(K.store.state.mind);
  K.show("subject", "mind"); await app.settle();
  eq(JSON.stringify(K.store.state.mind), snap, "drawing Mind desk writes nothing (invariant 137)");

  const btn = q("[data-ui~='mind.review-cards']");
  assert(btn && btn.textContent.includes("Review my Mind cards (" + dueBefore.length + " due)"), "desk shows Review my Mind cards (N due): " + (btn && btn.textContent));

  /* Open standalone card review -> ui.daily untouched, Focus idle */
  const sessBefore = K.sessions.all().filter((s) => s.type === "mind" && s.metrics && s.metrics.kind === "reviews").length;
  click(btn); await app.settle();
  eq(K.currentNav().viewId, "mind", "on mind view");
  eq(K.currentNav().arg, { page: "cards" }, "on #/mind/cards");
  assert(!(K.store.state.ui && K.store.state.ui.mind && K.store.state.ui.mind.daily), "ui.daily untouched");
  eq(K.focus.state(), "idle", "no Focus stopwatch started");

  /* Rate every due card through the shared FSRS stage */
  for (let i = 0; i < dueBefore.length; i++) {
    assert(q("[data-ui~='mind.review-card']"), "card " + (i + 1) + " rendered");
    click(q("[data-ui~='mind.show-answer']")); await app.settle();
    const good = q("[data-ui~='mind.grade'][data-grade='good']");
    assert(good, "Good rating button rendered");
    click(good); await app.settle();
  }
  assert(q("[data-ui~='mind.cards-done']"), "completion screen rendered");
  eq(K.mind.due(TODAY, true).length, 0, "all due cards rescheduled via FSRS");
  const sessAfter = K.sessions.all().filter((s) => s.type === "mind" && s.metrics && s.metrics.kind === "reviews").length;
  eq(sessAfter, sessBefore + 1, "one mind review ledger entry logged");
  assert(!(K.store.state.ui && K.store.state.ui.mind && K.store.state.ui.mind.daily), "ui.daily still untouched after finish");

  /* Returning to Mind desk hides the entry and does not double-log on dispose */
  K.show("subject", "mind"); await app.settle();
  assert(!q("[data-ui~='mind.review-cards']"), "hidden once all cards are reviewed");
  eq(K.sessions.all().filter((s) => s.type === "mind" && s.metrics && s.metrics.kind === "reviews").length, sessBefore + 1, "no double-log on dispose");
  eq(app.errors, [], "no page errors");
});

/* ---------------- D · bk:code-space#1 ---------------- */
step("D · Code: shared per-runner status and boot timeout never blames learner code (bk:code-space#1)", async () => {
  const W = app.window, R = K.codeRun;
  assert(typeof R.runnerStatus === "function" && typeof R.onStatus === "function", "runnerStatus and onStatus exported on KOS.codeRun");
  assert(typeof K.codeUI.bindRun === "function", "KOS.codeUI.bindRun exported");

  /* Fake Worker factory to control boot, ready, reply and hang deterministically */
  const origWorker = W.Worker, origSetTimeout = W.setTimeout, origClearTimeout = W.clearTimeout;
  const workers = [];
  const seenTimeouts = [];
  let fastTimers = false;
  W.setTimeout = function (fn, ms) {
    seenTimeouts.push(ms);
    if (fastTimers && ms >= 4000) return setTimeout(fn, 5);
    return origSetTimeout(fn, ms);
  };
  W.clearTimeout = function (id) {
    if (fastTimers && id && typeof id === "object") { clearTimeout(id); return; }
    return origClearTimeout(id);
  };
  W.Worker = function FakeWorker(url) {
    const inst = {
      url, posted: [], terminated: false, onmessage: null, onerror: null,
      postMessage(d) { this.posted.push(d); },
      terminate() { this.terminated = true; },
      emit(data) { if (this.onmessage) this.onmessage({ data }); },
      fail(msg) { if (this.onerror) this.onerror({ message: msg || "boom" }); }
    };
    workers.push(inst);
    return inst;
  };
  try {
    R._reset();
    /* 1. SQL boot lifecycle: ready -> booting -> busy -> ready, and bindRun tracks it */
    const seen = [];
    const off = R.onStatus((st) => { if (st.runner === "sql") seen.push(st.state); });
    const host = D.createElement("div");
    const btn = D.createElement("button");
    btn.type = "button"; btn.textContent = "▶ Run";
    const btn2 = D.createElement("button");
    btn2.type = "button"; btn2.textContent = "✓ Check";
    host.appendChild(btn); host.appendChild(btn2); D.body.appendChild(host);
    K.codeUI.bindRun(btn, { runner: "sql" });
    K.codeUI.bindRun(btn2, { runner: "sql", limit: false });

    eq(host.querySelectorAll("[data-ui~='code.run-limit']").length, 1, "at most one run-limit span per bar");
    const lim = host.querySelector("[data-ui~='code.run-limit']");
    assert(lim && lim.hidden, "run-limit hidden while idle");

    eq(R.runnerStatus("sql").state, "ready", "SQL starts ready before first run");
    eq(R.status("sql"), "ready", "status(sql) mirrors runnerStatus");
    const p1 = R.run({ lang: "sql", src: "SELECT 1;" });
    eq(R.runnerStatus("sql").state, "booting", "fresh SQL worker enters booting");
    assert(btn.disabled && btn.getAttribute("data-runner-state") === "booting", "bound button disables while booting");
    eq(btn.textContent, "Loading SQLite…", "Run shows Loading SQLite… while SQLite boots");
    assert(!lim.hidden && lim.textContent === "8 s limit", "SQLite boot shows 8 s limit beside Run: " + lim.textContent);

    const sqlw = workers[workers.length - 1];
    sqlw.emit({ type: "ready" });
    eq(R.runnerStatus("sql").state, "busy", "after ready with run in flight, SQL is busy");
    assert(btn.disabled && btn.getAttribute("data-runner-state") === "busy", "bound button stays disabled while busy");
    eq(btn.textContent, "▶ Run", "Run restores label once busy after boot");
    assert(!lim.hidden && lim.textContent === "4 s limit", "SQL busy shows 4 s limit beside Run: " + lim.textContent);

    const reqId = sqlw.posted[0].id;
    sqlw.emit({ id: reqId, res: { ok: true, stdout: "1", sets: [], ms: 2 } });
    const r1 = await p1;
    assert(r1.ok, "SQL run succeeded");
    eq(R.runnerStatus("sql").state, "ready", "SQL returns to ready");
    assert(!btn.disabled && btn.textContent === "▶ Run" && lim.hidden, "bound button re-enabled, label restored, limit hidden at idle");
    off();

    /* 2. Warm SQL timeout STILL reads as learner timeout (watchdog 4000 ms untouched) */
    fastTimers = true;
    seenTimeouts.length = 0;
    const warmTo = await R.run({ lang: "sql", src: "WITH RECURSIVE r(x) AS (SELECT 1 UNION ALL SELECT x+1 FROM r) SELECT * FROM r;" });
    assert(seenTimeouts.includes(4000), "warm SQL keeps 4000 ms watchdog: " + JSON.stringify(seenTimeouts));
    assert(!warmTo.ok && warmTo.error.kind === "timeout", "warm timeout keeps kind=timeout: " + JSON.stringify(warmTo.error));
    const warmCard = K.codeUI.errorCard(warmTo.error);
    assert(/Did not finish/.test(warmCard.textContent), "warm timeout card reads Did not finish");

    /* 3. Cold SQL boot timeout (fresh 8000 ms untouched) NEVER reads as learner code being wrong */
    R._reset();
    seenTimeouts.length = 0;
    const coldSqlCheck = await R.check({ mode: "program", lang: "sql", cases: [{ stdin: "", out: "1" }] }, [{ name: "q.sql", src: "SELECT 1;" }]);
    assert(seenTimeouts.includes(8000), "fresh SQL keeps 8000 ms boot watchdog: " + JSON.stringify(seenTimeouts));
    assert(!coldSqlCheck.passed && coldSqlCheck.runner && coldSqlCheck.runner.kind === "runner", "boot timeout sets c.runner: " + JSON.stringify(coldSqlCheck));
    assert(!coldSqlCheck.stopped && !coldSqlCheck.compile && coldSqlCheck.results.length === 0, "boot timeout does not fail case 1 or blame compile");
    eq(R.runnerStatus("sql").state, "failed", "SQL runner status becomes failed");
    assert(!btn.disabled && btn.textContent === "▶ Run", "failed state restores original label and re-enables for retry");
    const bootCard = K.codeUI.errorCard(coldSqlCheck.runner);
    assert(!/loop|Did not finish/i.test(bootCard.textContent), "boot timeout card never blames learner loop: " + bootCard.textContent);
    const resEl = K.codeUI.results(coldSqlCheck);
    assert(!/0 of 1 pass|Compile error/i.test(resEl.textContent), "results panel does not mark learner code wrong: " + resEl.textContent);

    /* 4. Cold WASM (.NET) boot timeout (60000 ms untouched) NEVER reads as learner code being wrong */
    R._reset();
    K.store.state.ui.code = K.store.state.ui.code || {};
    K.store.state.ui.code.runtime = true;
    const wHost = D.createElement("div");
    const wBtn = D.createElement("button");
    wBtn.type = "button"; wBtn.textContent = "▶ Run";
    wHost.appendChild(wBtn); D.body.appendChild(wHost);
    K.codeUI.bindRun(wBtn, { runner: "wasm" });
    const wLim = wHost.querySelector("[data-ui~='code.run-limit']");
    seenTimeouts.length = 0;
    const pWasm = R.run({ files: [{ name: "Program.cs", src: "Console.WriteLine(1);" }], lesson: "7.1" });
    eq(wBtn.textContent, "Starting .NET…", "Run shows Starting .NET… while .NET boots");
    assert(wLim && !wLim.hidden && wLim.textContent === "60 s limit", ".NET boot shows 60 s limit beside Run: " + (wLim && wLim.textContent));
    const coldWasm = await pWasm;
    assert(seenTimeouts.includes(60000), "cold WASM keeps 60000 ms boot watchdog: " + JSON.stringify(seenTimeouts));
    assert(!coldWasm.ok && coldWasm.error.kind === "runner", "cold WASM boot timeout is kind=runner: " + JSON.stringify(coldWasm.error));
    eq(R.runnerStatus("wasm").state, "failed", "WASM status becomes failed");
    assert(!wBtn.disabled && wBtn.textContent === "▶ Run" && wLim.hidden, "WASM failure restores Run label and hides limit");
    const wasmCard = K.codeUI.errorCard(coldWasm.error);
    assert(!/loop|Did not finish/i.test(wasmCard.textContent), "WASM boot timeout never blames learner loop: " + wasmCard.textContent);

    wHost.remove();
    host.remove();
  } finally {
    fastTimers = false;
    R._reset();
    W.Worker = origWorker;
    W.setTimeout = origSetTimeout;
    W.clearTimeout = origClearTimeout;
    if (K.store.state.ui && K.store.state.ui.code) delete K.store.state.ui.code.runtime;
  }
  eq(app.errors, [], "no page errors");
});

/* ---------------- E · shop-cosmetics#2 ---------------- */
step("E · Shop: Save gold for X as a goal, Add to Goals, met without buying or paying (shop-cosmetics#2)", async () => {
  const G = K.goals, gov = K.store.state.governor;
  const origGold = gov.gold;
  const origOwned = gov.owned.slice();
  const origPin = gov.shopPin;
  const sessBefore = K.sessions.all().length;
  eq(G.typeDef("gov-gold").id, "gov-gold", "gov-gold type registered");
  assert(G.typeDef("gov-gold").displayOnly, "gov-gold is displayOnly (payout: none)");

  /* Pick an unowned paid item and ensure gold < price */
  const item = K.governor.catalog().find((c) => c.price > 0 && !c.retired && !K.governor.owns(c.id));
  assert(item, "found an unowned paid shop item");
  gov.gold = Math.max(0, item.price - 20);
  K.store.save();

  K.show("governor", "shop");
  await app.settle();
  const moreBtn = q("[data-ui~='shop.more']");
  assert(moreBtn, "unaffordable item has shop.more button");
  click(moreBtn);
  await app.settle();

  const sheet = q("[data-ui~='shop.sheet']");
  assert(sheet, "shop preview sheet opened");
  const addBtn = q("[data-ui~='shop.add-goal']", sheet);
  assert(addBtn && /Add to Goals/.test(addBtn.textContent), "sheet offers Add to Goals alongside Pin as a goal");

  /* Click Add to Goals -> closes shop sheet, loads page-goals, opens pre-filled goal editor */
  click(addBtn);
  await app.settle();
  await app.settle();
  assert(!q("[data-ui~='shop.sheet']"), "shop sheet closed cleanly before goal editor");
  const ed = q("[data-ui~='goal.editor']");
  assert(ed, "pre-filled goal editor opened");
  const saveBtn = q("[data-ui~='goal.save']", ed);
  click(saveBtn);
  await app.settle();

  const saved = G.all().find((x) => x.type === "gov-gold");
  assert(saved && saved.params && saved.params.item, "gov-gold goal saved with params.item");
  const linkedItem = K.governor.item(saved.params.item);
  assert(linkedItem && linkedItem.price > 0, "params.item resolves in catalog");

  /* Below price -> active */
  gov.gold = Math.max(0, linkedItem.price - 10);
  let rows = await new Promise((r) => G.compute((_, xs) => r(xs)));
  let row = rows.find((x) => x.id === saved.id);
  eq([row._current, row._target, row._status], [gov.gold, linkedItem.price, "active"], "below price is active with live gold balance");

  /* At/above price -> completed, payout "none", zero sessions, item NOT auto-bought */
  gov.gold = linkedItem.price;
  rows = await new Promise((r) => G.compute((_, xs) => r(xs)));
  row = rows.find((x) => x.id === saved.id);
  eq([row._current, row._target, row._status], [linkedItem.price, linkedItem.price, "completed"], "reaching price marks goal completed");
  const receipt = K.store.state.goals.completionLedger[saved.id];
  eq(receipt && receipt.payout, "none", "Governor-value goal records payout: none (invariant 5b)");
  eq(K.sessions.all().length, sessBefore, "goal never logs a session or pays");
  assert(!K.governor.owns(linkedItem.id), "goal never auto-buys the item (W5 42d)");

  /* Action opens Gold Shop, never buys */
  const act = K.goalsUI.actionFor(row);
  assert(act && /Shop/i.test(act[0]), "goal action opens Shop: " + JSON.stringify(act && act[0]));

  /* Clean up */
  G.remove(saved.id);
  gov.gold = origGold;
  gov.owned = origOwned;
  gov.shopPin = origPin;
  K.store.save();
  eq(app.errors, [], "no page errors");
});

/* ---------------- F · bk:goals#2 ---------------- */
step("F · Make this a goal from routine, Money pot, exam readiness, Collection title, and Money budget (bk:goals#2)", async () => {
  const G = K.goals;
  const madeIds = [];
  const sessBefore = K.sessions.all().length;

  /* 1. Routine */
  const rt = K.routines.add({ name: "Evening wind-down", kind: "routine", days: [1, 2, 3, 4, 5], steps: [{ text: "Tidy desk" }, { text: "Pack bag" }] });
  K.show("routines", "routines"); await app.settle();
  const rtBtn = q("[data-ui~='routine.make-goal']");
  assert(rtBtn && /Make this a goal/.test(rtBtn.textContent), "routine card has Make this a goal");
  click(rtBtn); await app.settle(); await app.settle();
  let ed = q("[data-ui~='goal.editor']");
  assert(ed, "routine opened goal editor");
  click(q("[data-ui~='goal.save']", ed)); await app.settle();
  const gRt = G.all().find((x) => x.type === "routine-days" && x.params && x.params.routine === rt.id);
  assert(gRt, "routine goal linked via params.routine");
  madeIds.push(gRt.id);

  /* 2. Money pot */
  const pot = K.money.addPot({ name: "Japan flight", targetAmount: 650, by: "2027-06-01" });
  K.show("money", "pots"); await app.settle(); await app.settle();
  const potBtn = q("[data-ui~='money.pot-make-goal']");
  assert(potBtn && /Make this a goal/.test(potBtn.textContent), "Money pot hero has Make this a goal");
  click(potBtn); await app.settle(); await app.settle();
  ed = q("[data-ui~='goal.editor']");
  assert(ed, "Money pot opened goal editor");
  click(q("[data-ui~='goal.save']", ed)); await app.settle();
  const gPot = G.all().find((x) => x.type === "money-save" && x.links && x.links.pot === pot.id);
  assert(gPot && gPot.target === 650 && gPot.deadline === "2027-06-01", "pot goal linked via links.pot with major-unit target & deadline: " + JSON.stringify(gPot));
  madeIds.push(gPot.id);

  /* 3. Exam readiness */
  const ex = K.exams.add({ title: "CS Paper 1 Mock", subject: "compsci", tier: "mock", date: "2027-02-15", scope: { include: ["compsci:4.1"] } });
  K.show("exams", { id: ex.id, tab: "today" }); await app.settle(); await app.settle();
  const exBtn = q("[data-ui~='exams.make-goal']");
  assert(exBtn && /Make this a goal/.test(exBtn.textContent), "exam readiness view has Make this a goal");
  click(exBtn); await app.settle(); await app.settle();
  ed = q("[data-ui~='goal.editor']");
  assert(ed, "exam readiness opened goal editor");
  click(q("[data-ui~='goal.save']", ed)); await app.settle();
  const gEx = G.all().find((x) => x.links && x.links.examId === ex.id);
  assert(gEx && gEx.type === "exam_recall", "exam goal linked via links.examId (invariant 128): " + JSON.stringify(gEx));
  madeIds.push(gEx.id);

  /* 4. Collection title */
  const entry = await new Promise((res, rej) => K.mediadb.put({
    module: "anime", title: "Mushishi", status: "inProgress",
    progress: { current: 5, total: 26, unit: "episodes" }
  }, (err, rec) => (err ? rej(err) : res(rec))));
  await K.lazy.need("page-vaults");
  K.mediaEditor(entry, () => {}); await app.settle();
  const vBtn = q("[data-ui~='vault.make-goal']");
  assert(vBtn && /Make this a goal/.test(vBtn.textContent), "Collection title editor has Make this a goal");
  click(vBtn); await app.settle(); await app.settle();
  assert(!q("[data-ui~='vault.editor']"), "Collection editor closed cleanly before goal editor");
  ed = q("[data-ui~='goal.editor']");
  assert(ed, "Collection title opened goal editor");
  click(q("[data-ui~='goal.save']", ed)); await app.settle();
  const gCol = G.all().find((x) => x.linkedEntryId === entry.id);
  assert(gCol && gCol.type === "finish-series", "Collection goal linked via linkedEntryId: " + JSON.stringify(gCol));
  madeIds.push(gCol.id);

  /* 5. Money budget */
  K.money.setBudget("food", 180);
  K.show("money", "budgets"); await app.settle(); await app.settle();
  const budRow = qa("[data-ui~='money.bud-row']").find((r) => /Food/i.test(r.textContent));
  assert(budRow, "Food budget row rendered");
  click(q("[data-ui~='ui.menu-button']", budRow)); await app.settle();
  const budMenuItem = qa("[role='menuitem']").find((m) => /Make this a goal/.test(m.textContent));
  assert(budMenuItem, "Money budget row menu has Make this a goal");
  click(budMenuItem); await app.settle(); await app.settle();
  ed = q("[data-ui~='goal.editor']");
  assert(ed, "Money budget opened goal editor");
  click(q("[data-ui~='goal.save']", ed)); await app.settle();
  const gBud = G.all().find((x) => x.type === "money-spend-under" && x.links && x.links.category === "food");
  assert(gBud && gBud.target === 180 && gBud.repeat === "month", "budget goal linked via links.category with major-unit target: " + JSON.stringify(gBud));
  madeIds.push(gBud.id);

  eq(K.sessions.all().length, sessBefore, "creating goals logs no Governor sessions");
  madeIds.forEach((id) => G.remove(id));
  K.routines.remove(rt.id);
  K.exams.remove(ex.id);
  await new Promise((res) => K.mediadb.remove(entry.id, () => res()));
  eq(app.errors, [], "no page errors");
});

/* ---------------- G · bk:money-goals#6 ---------------- */
step("G · Recurring Not yet confirmed queue lists every past occurrence with match, Confirm all and Skip all Undo (bk:money-goals#6)", async () => {
  const M = K.money;
  const cb = (fn) => new Promise((res, rej) => fn((e, v) => (e ? rej(e) : res(v))));
  const allTx = async () => (await cb((c) => M.exportAll(c))).tx;
  const until = async (fn, n) => { for (let i = 0; i < (n || 60) && !fn(); i++) await app.settle(); return fn(); };
  const sessBefore = K.sessions.all().length;
  const govBefore = JSON.stringify({ xp: K.store.state.governor.xp, gold: K.store.state.governor.gold, hp: K.store.state.governor.hp });

  await cb((c) => M.importAll({ tx: [], del: [] }, c));
  K.store.state.money = M.normalise({});
  K.store.save();

  /* Import a bank row BEFORE adding the rules so it sits unlinked (for inline bankMatches) */
  const parsed = M.csv.parse("Date,Description,Amount\n19/11/2026,VODAFONE LTD,-10.00\n", "nov.csv");
  const pv = await cb((c) => M.csv.preview(parsed, M.csv.guess(parsed.header), {}, c));
  await cb((c) => M.csv.import(pv.rows, { file: "nov.csv", format: parsed.format }, c));
  eq((await allTx()).length, 1, "one imported bank row");

  /* Two monthly rules starting months ago -> 4 + 3 = 7 unconfirmed past occurrences */
  const ph = M.addRule({ name: "Phone", kind: "out", cat: "bills", minor: 1000, every: { n: 1, unit: "month" }, start: "2026-08-20" });
  const mu = M.addRule({ name: "Music", kind: "out", cat: "subscriptions", minor: 599, every: { n: 1, unit: "month" }, start: "2026-09-18" });

  K.show("money", "recurring"); await app.settle(); await app.settle();
  const snap = JSON.stringify(K.store.state.money);
  K.rerender(); await app.settle(); await app.settle();
  eq(JSON.stringify(K.store.state.money), snap, "rendering Recurring queue writes nothing");

  const queue = q("[data-ui~='money.unconfirmed']");
  assert(queue, "Not yet confirmed queue card is rendered");
  eq(qa("[data-ui='money.occ-row']", queue).length, 7, "all 7 past occurrences across >14 days are listed");

  /* Inline bank match appears WITHOUT auto-confirming */
  const useBtn = await until(() => q("[data-ui='money.occ-use-bank']", q("[data-ui~='money.unconfirmed']")));
  assert(useBtn, "inline suggested statement match button appears");
  assert(!M.rule(ph.id).marks["2026-11-20"], "bank match is NEVER confirmed automatically");

  /* Press Use statement entry -> confirmWith (no duplicate tx), Undo releases bank row intact */
  click(useBtn);
  await until(() => M.rule(ph.id).marks["2026-11-20"] && M.rule(ph.id).marks["2026-11-20"].s === "done");
  eq((await allTx()).length, 1, "confirmWith links the existing bank row without adding a second tx");
  const undoBank = q(".k-toast-act");
  assert(undoBank && /Undo/.test(undoBank.textContent), "confirmWith shows Undo toast");
  click(undoBank);
  await until(() => !M.rule(ph.id).marks["2026-11-20"]);
  eq((await allTx()).length, 1, "Undo after confirmWith keeps the bank row intact");

  /* Re-link the bank match, leaving 6 past occurrences in the queue */
  const useBtn2 = await until(() => q("[data-ui='money.occ-use-bank']", q("[data-ui~='money.unconfirmed']")));
  click(useBtn2);
  await until(() => M.rule(ph.id).marks["2026-11-20"] && M.rule(ph.id).marks["2026-11-20"].s === "done");
  await until(() => qa("[data-ui='money.occ-row']", q("[data-ui~='money.unconfirmed']")).length === 6);

  /* Skip all asks first, skips all 6, and Undo restores all 6 */
  click(q("[data-ui='money.occ-skip-all']")); await app.settle();
  const skipDlg = q("[role='alertdialog']");
  assert(skipDlg && /Skip/.test(skipDlg.textContent), "Skip all asks for confirmation first");
  click(q("[data-ui~='ui.confirm-yes']", skipDlg));
  await until(() => !q("[data-ui~='money.unconfirmed']"));
  eq(Object.keys(M.rule(mu.id).marks).length, 3, "all 3 Music occurrences marked skip");
  const undoSkip = q(".k-toast-act");
  assert(undoSkip && /Undo/.test(undoSkip.textContent), "Skip all offers Undo toast");
  click(undoSkip);
  await until(() => q("[data-ui~='money.unconfirmed']") && qa("[data-ui='money.occ-row']", q("[data-ui~='money.unconfirmed']")).length === 6);

  /* Confirm all asks first, confirms all 6, and Undo removes the 6 created transactions */
  click(q("[data-ui='money.occ-confirm-all']")); await app.settle();
  const confDlg = q("[role='alertdialog']");
  assert(confDlg && /Confirm/.test(confDlg.textContent), "Confirm all asks for confirmation first");
  click(q("[data-ui~='ui.confirm-yes']", confDlg));
  await until(() => !q("[data-ui~='money.unconfirmed']"));
  eq((await allTx()).length, 7, "Confirm all created 6 entries beside the 1 bank entry");
  const undoConf = q(".k-toast-act");
  assert(undoConf && /Undo/.test(undoConf.textContent), "Confirm all offers Undo toast");
  click(undoConf);
  await until(() => q("[data-ui~='money.unconfirmed']") && qa("[data-ui='money.occ-row']", q("[data-ui~='money.unconfirmed']")).length === 6);
  eq((await allTx()).length, 1, "Undo after Confirm all removes the 6 created entries and leaves the bank row");

  eq(K.sessions.all().length, sessBefore, "zero Governor sessions");
  eq(JSON.stringify({ xp: K.store.state.governor.xp, gold: K.store.state.governor.gold, hp: K.store.state.governor.hp }), govBefore, "Governor untouched");
  eq(app.errors, [], "no page errors");
});

/* ---------------- H · bk:ja-mind#4 ---------------- */
step("H · Japanese leech recovery: unleech with leechBase and desk actions with Undo (bk:ja-mind#4)", async () => {
  await K.lazy.need("page-ja");
  const J = K.ja, S = K.jaSrs;
  const sessBefore = K.sessions.all().length;
  J.startLesson("H1");
  const k = "k:あ|R";
  const f = K.store.state.japanese.facets[k];
  f.reps = 10; f.lapses = 8; f.s = 1.2; f.d = 8; f.due = TODAY; f.last = "2026-11-19"; f.firstAt = "2026-11-01";
  delete f.leechBase;
  if (K.store.state.japanese.facets["k:あ|W"]) K.store.state.japanese.facets["k:あ|W"].due = "2026-11-22";
  K.store.save();

  assert(S.leech(f), "8 lapses is a leech");
  assert(!J.due(TODAY).includes(k), "leech is out of due queue");
  assert(typeof S.unleech === "function", "KOS.jaSrs.unleech is exported");

  K.show("subject", "ja"); await app.settle(); await app.settle();
  const snap = JSON.stringify(K.store.state.japanese);
  K.rerender(); await app.settle();
  eq(JSON.stringify(K.store.state.japanese), snap, "rendering Japanese desk writes nothing");

  const leechRow = q("[data-ui~='ja.leech-row']");
  assert(leechRow, "desk lists set-aside facet");
  const relearnBtn = q("[data-ui~='ja.leech-lesson']", leechRow);
  const backBtn = q("[data-ui~='ja.leech-unleech']", leechRow);
  assert(relearnBtn && /Relearn from the lesson/.test(relearnBtn.textContent), "Relearn from the lesson button");
  assert(backBtn && /Back in the schedule/.test(backBtn.textContent), "Back in the schedule button");

  /* Relearn opens the owning lesson */
  click(relearnBtn); await app.settle();
  assert(/#\/ref\/ja\/H1/.test(app.window.location.hash), "Relearn navigates to H1: " + app.window.location.hash);

  /* Back in the schedule calls unleech, keeps lapses === 8, sets leechBase === 8, returns to due(), and Undo restores exact state */
  K.show("subject", "ja"); await app.settle(); await app.settle();
  const beforeJson = JSON.stringify(K.store.state.japanese.facets[k]);
  click(q("[data-ui~='ja.leech-unleech']")); await app.settle();
  const after = K.store.state.japanese.facets[k];
  eq([after.lapses, after.leechBase, S.leech(after)], [8, 8, false], "lapses kept, leechBase set, no longer leech");
  assert(J.due(TODAY).includes(k), "facet is back in due queue");

  /* Undo restores exact pre-unleech facet (no leechBase key left behind) */
  const undoBtn = q(".k-toast-act");
  assert(undoBtn && /Undo/.test(undoBtn.textContent), "Undo toast offered");
  click(undoBtn); await app.settle();
  eq(JSON.stringify(K.store.state.japanese.facets[k]), beforeJson, "Undo deletes leechBase and matches prior serialised state");
  assert(S.leech(K.store.state.japanese.facets[k]), "Undo puts facet back as set aside");

  /* Unleech again and check review() preserves leechBase and re-leeches only after +4 lapses (lapses === 12) */
  assert(S.unleech(k) === true, "unleech returns true");
  assert(S.unleech(k) === false, "unleech on non-leech returns false");
  let cur = K.store.state.japanese.facets[k];
  for (let i = 0; i < 3; i++) {
    cur = S.review(cur, 1, TODAY, { retention: 0.9 });
    eq(cur.leechBase, 8, "review preserves leechBase across lapses");
    assert(!S.leech(cur), "still not leech at " + cur.lapses + " lapses");
  }
  cur = S.review(cur, 1, TODAY, { retention: 0.9 });
  eq([cur.lapses, cur.leechBase, S.leech(cur)], [12, 8, true], "set aside again after 4 more lapses (12)");

  eq(K.sessions.all().length, sessBefore, "leech recovery logs zero Governor sessions");
  eq(app.errors, [], "no page errors");
});

/* ---------------- I · bk:ja-mind#5 ---------------- */
step("I · Logging Japanese immersion through Focus, paid by focusAward and read from ledger (bk:ja-mind#5)", async () => {
  await K.lazy.need("page-ja");
  /* Disable preflight on this device so Focus start runs straight through */
  K.store.state.ui.focusPreflight = false;
  /* Clear prior ja focus entries and input tallies for clean accounting */
  K.store.state.sessions = K.store.state.sessions.filter((e) => !(e.type === "focus" && e.subject === "ja"));
  if (K.store.state.japanese) K.store.state.japanese.input = {};
  K.store.save();

  /* 1. Japanese desk "Log immersion" opens Focus pre-filled without starting (invariant 4e) */
  K.show("subject", "ja"); await app.settle(); await app.settle();
  const logBtn = q("[data-ui~='ja.log-immersion']");
  assert(logBtn, "Japanese desk offers Log immersion");
  click(logBtn); await app.settle();
  assert(!K.focus.activeId(), "Log immersion never starts a session (invariant 4e)");
  const immSel = q("[data-ui~='focus.ja-immersion']");
  assert(immSel && !immSel.closest("[hidden]"), "Japanese immersion selector is visible on Focus when subject is ja");
  eq(immSel.value, "watch", "pre-filled to Watching");
  const optVals = [...immSel.options].map((o) => o.value);
  assert(optVals.includes("") && optVals.includes("watch") && optVals.includes("read") && optVals.includes("listen"), "offers Study, Watching, Reading, Listening: " + optVals.join(","));

  /* Switching away from ja hides the immersion selector */
  const subjSel = q("[data-ui~='focus.link-row'] select");
  subjSel.value = "compsci"; subjSel.dispatchEvent(new app.window.Event("change")); await app.settle();
  assert(!!immSel.closest("[hidden]"), "immersion selector hides for non-ja subject");
  subjSel.value = "ja"; subjSel.dispatchEvent(new app.window.Event("change")); await app.settle();
  assert(!immSel.closest("[hidden]"), "immersion selector reappears for ja");

  /* 2. Running a 30-min immersion session pays exact focusAward and logs metrics.immersion */
  const xp0 = K.store.state.governor.xp, gold0 = K.store.state.governor.gold;
  const jaLogsBefore = K.sessions.all().filter((e) => e.type === "ja").length;
  K.focus.start({ mode: "custom", workMin: 30, breakMin: 0, subject: "ja", immersion: "watch" });
  const act = K.focus.session();
  assert(act && act.immersion === "watch", "active focus session carries immersion");
  K.focus._debugAdvance(1800);
  K.focus.endEarly({ confirmed: true, review: false });
  await app.settle();

  const want = K.governor.focusAward({ rule: "blocks", secs: 1800, pauses: 0 });
  eq([K.store.state.governor.xp - xp0, K.store.state.governor.gold - gold0], [want.xp, want.gold], "paid solely by KOS.governor.focusAward (invariant 4a)");
  eq(K.sessions.all().filter((e) => e.type === "ja").length, jaLogsBefore, "no extra ja ledger entry");
  const logged = K.sessions.all().slice(-1)[0];
  eq([logged.type, logged.subject, logged.metrics.immersion], ["focus", "ja", "watch"], "logged ordinary focus entry tagged watch");

  /* Non-immersion session leaves metrics.immersion absent (clean) */
  K.focus.start({ mode: "custom", workMin: 10, breakMin: 0, subject: "ja" });
  K.focus._debugAdvance(600);
  K.focus.endEarly({ confirmed: true, review: false });
  await app.settle();
  const plain = K.sessions.all().slice(-1)[0];
  assert(!("immersion" in plain.metrics), "non-immersion session leaves metrics.immersion absent");

  /* 3. Multi-stretch session counts ONLY ja stretch; undone entry ignored */
  K.sessions.log({
    type: "focus", subject: "ja", dur: 1800,
    metrics: { complete: true, mode: "custom", rule: "blocks", secs: 1800, mins: 30, immersion: "read",
      segments: [{ subject: "ja", secs: 1200 }, { subject: "compsci", secs: 600 }] }
  });
  K.sessions.log({
    type: "focus", subject: "ja", dur: 1800,
    metrics: { complete: true, mode: "custom", rule: "blocks", secs: 1800, mins: 30, immersion: "listen", undone: true }
  });

  K.show("subject", "ja"); await app.settle(); await app.settle();
  const snap = JSON.stringify(K.store.state.japanese);
  K.rerender(); await app.settle();
  eq(JSON.stringify(K.store.state.japanese), snap, "Japanese desk render writes nothing");
  const card = q("[data-ui~='ja.input-week']");
  assert(card && /50 m/.test(card.textContent) && /Watching/.test(card.textContent) && /30 m/.test(card.textContent) && /Reading/.test(card.textContent) && /20 m/.test(card.textContent),
    "Input this week reads 30 m watch + 20 m ja-only read = 50 m: " + (card && card.textContent));
  assert(!/Listening/.test(card.textContent), "undone listening session is ignored");
  eq(app.errors, [], "no page errors");
});

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 6).join("\n       ")); }
  }
  console.log(failed ? `\nSMOKE198 FAIL — ${failed} of ${steps.length} step(s)` : `\nSMOKE198 OK — ${steps.length} steps`);
  process.exit(failed ? 1 : 0);
})();
