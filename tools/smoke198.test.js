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

(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try { await fn(); console.log("  ok   " + name); }
    catch (e) { failed++; console.log("  FAIL " + name + "\n       " + String(e && e.stack || e).split("\n").slice(0, 6).join("\n       ")); }
  }
  console.log(failed ? `\nSMOKE198 FAIL — ${failed} of ${steps.length} step(s)` : `\nSMOKE198 OK — ${steps.length} steps`);
  process.exit(failed ? 1 : 0);
})();
