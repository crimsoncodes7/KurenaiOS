/* Kurenai OS — smoke22.test.js
   Category 6 Phase C: the orchestrator (js/core/aiorchestrator.js) —
   bounded loops, duplicate/mutation guards, live-context revalidation,
   confirmation integrity, autonomy tiers, and the audit lifecycle.

   Run:
     npm install jsdom fake-indexeddb   (one-time)
     node tools/smoke22.test.js

   TESTED PROPERTIES:
   1. Loop bounds: provider-turn and tool-call ceilings stop a runaway
      model safely; only one request runs at a time; cancel works.
   2. Duplicate-mutation guard: an identical executed call is refused; a
      FAILED call may be retried exactly once; after any write executes,
      subsequent provider calls carry noRetry.
   3. Live context: a write proposed after the user changed screens fails
      safely with a re-read instruction; reads are unaffected.
   4. Autonomy tiers: read + reversible auto-run; a reversible tool the
      user tightened to "ask" pauses; consequential ALWAYS pauses and the
      target is untouched until the exact confirmation; setPermission
      refuses weakening the consequential floor; "never" disables a tool
      (excluded from schemas, refused if called anyway).
   5. Confirmation integrity: the STORED canonical args execute (mutating
      the surfaced copy changes nothing); expiry, rejection, context
      change, target change/disappearance and supersession all invalidate
      without executing; the model is told the action did NOT run.
   6. Audit lifecycle rows (injected api): proposed→executed (auto),
      proposed→awaiting_confirmation→confirmed→executed,
      →rejected, →failed; signed-out rows queue in kv and flush later;
      args are sanitized and results only summarised.
   7. Tool results returned to the model are sanitized (no coverUrl/reward
      bookkeeping) and serialized as tool-role messages.
   8. Migration source contracts: all four assistant tables RLS-enabled
      with owner-only policies; kos_assistant_audit has NO delete policy
      and a status check constraint. (Live RLS isolation runs in the
      Phase F integration script against the real project.)              */

const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const dom = new JSDOM(html, { url: "http://localhost/index.html", runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
const errors = [];
window.addEventListener("error", e => errors.push("window error: " + e.message));
const noop = () => {};
const ctxStub = new Proxy({}, { get: (t, k) => k === "measureText" ? () => ({ width: 10 }) : (typeof k === "string" ? noop : undefined), set: () => true });
window.HTMLCanvasElement.prototype.getContext = () => ctxStub;
window.requestAnimationFrame = cb => setTimeout(cb, 0);
window.confirm = () => true;

let netLog = [];
window.fetch = (url) => {
  netLog.push({ url: String(url) });
  return Promise.resolve({ ok: true, status: 200, headers: { get: () => null }, json: () => Promise.resolve({}), text: () => Promise.resolve("") });
};

const { indexedDB, IDBKeyRange } = require("fake-indexeddb");
window.indexedDB = indexedDB;
window.IDBKeyRange = IDBKeyRange;

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const src of scripts) {
  try { window.eval(fs.readFileSync(path.join(ROOT, src), "utf8")); }
  catch (e) { errors.push(`LOAD FAIL ${src}: ${e.message}`); }
}
const KOS = window.KOS;
if (KOS.autosync) KOS.autosync.stop();
if (KOS.cloudsync) KOS.cloudsync.stop();
const ORCH = KOS.ai.orchestrator;

const steps = [];
function step(name, fn) { steps.push([name, fn]); }
const tick = ms => new Promise(r => setTimeout(r, ms || 0));
function assert(cond, msg) { if (!cond) throw new Error(msg); }
const read = f => fs.readFileSync(path.join(ROOT, f), "utf8");

/* ---- scripted provider: each queue entry consumes one chat() call ---- */
let chatScript = [];
let chatLog = [];
KOS.ai.chat = function (category, request, cb) {
  chatLog.push({ category, request });
  const next = chatScript.shift();
  if (!next) { cb(null, { text: "…(script exhausted)", toolCalls: [], provider: "stub", model: "stub" }); return; }
  setTimeout(() => next(request, cb), 0);
};
const say = text => (req, cb) => cb(null, { text, toolCalls: [], provider: "stub", model: "stub" });
const callTools = (calls, text) => (req, cb) => cb(null, { text: text || "", toolCalls: calls, provider: "stub", model: "stub" });

/* ---- captured audit rows via the seam ---- */
let auditRows = [];   // inserted rows by id
let auditLog = [];    // every lifecycle event in order
function installAudit() {
  ORCH._config({ auditApi: {
    insert: (row, cb) => { auditRows.push(row); auditLog.push({ id: row.id, status: row.status, tool: row.tool }); cb(null); },
    update: (id, patch, cb) => { auditLog.push(Object.assign({ id }, patch)); cb(null); }
  } });
}
installAudit();

/* run one send() to completion (or pause) and gather events */
function run(opts) {
  return new Promise(resolve => {
    chatLog = [];   // per-request log — indexes below are within one run
    const ev = { texts: [], toolResults: [], confirmations: [], statuses: [], errors: [], done: null };
    const id = ORCH.send(opts, {
      onText: p => ev.texts.push(p.text),
      onToolResult: p => ev.toolResults.push(p),
      onConfirmationNeeded: p => { ev.confirmations.push(p); resolve(Object.assign(ev, { requestId: id, paused: true })); },
      onStatus: p => ev.statuses.push(p.state),
      onError: p => ev.errors.push(p.message),
      onDone: p => { ev.done = p; resolve(Object.assign(ev, { requestId: id, paused: false })); }
    });
    if (id === null) resolve(Object.assign(ev, { requestId: null, paused: false, rejectedSend: true }));
  });
}
/* continue a paused run to its end */
function untilDone(ev) {
  return new Promise(resolve => {
    const iv = setInterval(() => {
      if (!ORCH.isBusy()) { clearInterval(iv); resolve(); }
    }, 10);
  });
}

/* ============ 1 · plain conversation + bounds ============ */
console.log("== loop bounds + single request ==");

step("a text-only reply completes with no tools and no audit rows", async () => {
  assert(errors.length === 0, "load errors: " + errors.join(" | "));
  chatScript = [say("Hello — ready to help.")];
  const ev = await run({ userText: "hi" });
  assert(ev.done && ev.done.status === "complete", "should complete");
  assert(ev.texts[0] === "Hello — ready to help.", "text lost");
  assert(auditRows.length === 0, "no tools → no audit rows");
  assert(chatLog[0].request.tools.length >= 60, "tool schemas must ride the request");
  assert(/DATA/.test(chatLog[0].request.system), "the untrusted-content rule must be in the system prompt");
});

step("provider-turn ceiling stops a runaway loop safely", async () => {
  ORCH._config({ limits: { providerTurns: 3 } });
  chatScript = [1, 2, 3, 4, 5].map(() =>
    callTools([{ id: "t1", name: "study_get_due_summary", args: {} }]));
  const ev = await run({ userText: "loop forever" });
  assert(ev.done && ev.done.status === "error", "runaway must end in a safe error");
  assert(/turn limit/.test(ev.errors[0]), "the error must name the limit");
  assert(chatLog.length <= 4, "must stop calling the provider");
  ORCH._config({ limits: { providerTurns: 8 } });
});

step("tool-call budget refuses further calls but lets the model wrap up", async () => {
  ORCH._config({ limits: { toolCalls: 2 } });
  chatScript = [
    callTools([
      { id: "a", name: "study_get_due_summary", args: {} },
      { id: "b", name: "governor_get_status", args: {} },
      { id: "c", name: "todo_list", args: {} }
    ]),
    say("done")
  ];
  const ev = await run({ userText: "read everything" });
  assert(ev.done && ev.done.status === "complete", "should still complete");
  assert(ev.done.toolCalls === 2, "only 2 executions allowed, got " + ev.done.toolCalls);
  const refused = JSON.parse(chatLog[1].request.messages.filter(m => m.role === "tool")[2].content);
  assert(/budget/.test(refused.error), "the third call must be refused with the budget message");
  ORCH._config({ limits: { toolCalls: 12 } });
});

step("only one request at a time; explicit cancel frees it mid-flight", async () => {
  chatScript = [(req, cb) => setTimeout(() => cb(null, { text: "slow", toolCalls: [], provider: "stub", model: "stub" }), 300)];
  let doneStatus = null;
  chatLog = [];
  const reqId = ORCH.send({ userText: "slow one" }, {
    onDone: p => { doneStatus = p.status; },
    onError: () => {}
  });
  assert(typeof reqId === "string", "send must return the request id");
  await tick(20);
  const p2 = await run({ userText: "second" });
  assert(p2.rejectedSend && p2.errors.some(m => /already running/.test(m)), "second send must be refused");
  assert(ORCH.isBusy(), "first still busy");
  assert(ORCH.cancel(reqId) === true, "cancel must accept the live request id");
  assert(!ORCH.isBusy(), "cancel must free the orchestrator immediately");
  assert(doneStatus === "cancelled", "the request must finish as cancelled, got " + doneStatus);
  await tick(350);   // the slow provider reply lands into the dead request harmlessly
  assert(!ORCH.isBusy(), "a late provider reply must not resurrect the request");
});

/* ============ 2 · tiers ============ */
console.log("== autonomy tiers ==");

step("read + reversible auto-run; results are sanitized tool messages", async () => {
  // seed a vault entry to read
  const add = await new Promise(r => KOS.ai.tools.execute("collection_add_entry",
    { module: "anime", title: "Mushishi", status: "completed", score: 9 }, (e, res) => r(res)));
  chatScript = [
    callTools([{ id: "a", name: "collection_get_entry", args: { entryId: add.id } }]),
    callTools([{ id: "b", name: "study_set_topic_status", args: { subject: "compsci", ref: KOS.hub.LEAVES.compsci[0].ref, status: "started" } }]),
    say("done")
  ];
  const ev = await run({ userText: "check mushishi then mark first topic started" });
  assert(ev.done && ev.done.status === "complete", "should complete unconfirmed (read+reversible)");
  assert(ev.confirmations.length === 0, "no confirmation for read/reversible");
  const toolMsgs = chatLog[chatLog.length - 1].request.messages.filter(m => m.role === "tool");
  assert(toolMsgs.length === 2, "expected both tool results in the final turn, got " + toolMsgs.length);
  toolMsgs.forEach(m => assert(!/coverUrl|reward|cleanLocal|lastPushedHash/.test(m.content),
    "SANITIZATION: the model-facing result leaked internals: " + m.content.slice(0, 150)));
  assert(KOS.store.peekProgress("compsci", KOS.hub.LEAVES.compsci[0].ref).status === "started", "reversible write must have run");
});

step("consequential pauses; the target is untouched until confirmed", async () => {
  const add = await new Promise(r => KOS.ai.tools.execute("collection_add_entry",
    { module: "anime", title: "Doomed Show", status: "planned" }, (e, res) => r(res)));
  chatScript = [
    callTools([{ id: "a", name: "collection_delete_entry", args: { entryId: add.id } }]),
    say("Deleted it.")
  ];
  const ev = await run({ userText: "delete doomed show" });
  assert(ev.paused && ev.confirmations.length === 1, "must pause for confirmation");
  const card = ev.confirmations[0];
  assert(card.tool === "collection_delete_entry" && card.tier === "consequential", "card metadata wrong");
  assert(/Doomed Show/.test(card.target), "card must describe the resolved target");
  const still = await new Promise(r => KOS.mediadb.get(add.id, (e, x) => r(x)));
  assert(still, "TARGET MUST BE UNTOUCHED while awaiting confirmation");
  await new Promise(r => ORCH.confirm(card.confirmationId, r));
  await untilDone();
  const gone = await new Promise(r => KOS.mediadb.get(add.id, (e, x) => r(x)));
  assert(!gone, "confirmed delete must run");
});

step("rejection leaves the target intact and informs the model", async () => {
  const add = await new Promise(r => KOS.ai.tools.execute("collection_add_entry",
    { module: "anime", title: "Saved Show", status: "planned" }, (e, res) => r(res)));
  chatScript = [
    callTools([{ id: "a", name: "collection_delete_entry", args: { entryId: add.id } }]),
    say("Understood, leaving it alone.")
  ];
  const ev = await run({ userText: "delete saved show" });
  const card = ev.confirmations[0];
  await new Promise(r => ORCH.reject(card.confirmationId, r));
  await untilDone();
  const still = await new Promise(r => KOS.mediadb.get(add.id, (e, x) => r(x)));
  assert(still, "rejected action must not run");
  const toolMsg = JSON.parse(chatLog[chatLog.length - 1].request.messages.filter(m => m.role === "tool").pop().content);
  assert(/declined/.test(toolMsg.error), "the model must learn the user declined");
});

step("permissions: consequential floor unbreakable; reversible tightenable; never disables", async () => {
  const r1 = ORCH.setPermission("collection_delete_entry", "auto");
  assert(!r1.ok && /cannot be weakened/.test(r1.msg), "the consequential floor must hold");
  assert(ORCH.setPermission("study_set_topic_status", "ask").ok, "tightening must work");
  assert(ORCH.effectiveMode("study_set_topic_status") === "ask", "effective mode wrong");
  chatScript = [
    callTools([{ id: "a", name: "study_set_topic_status", args: { subject: "compsci", ref: KOS.hub.LEAVES.compsci[1].ref, status: "started" } }]),
    say("ok")
  ];
  const ev = await run({ userText: "mark topic 2" });
  assert(ev.paused && ev.confirmations.length === 1 && ev.confirmations[0].tier === "reversible",
    "a tightened reversible tool must ask");
  await new Promise(r => ORCH.reject(ev.confirmations[0].confirmationId, r));
  await untilDone();
  assert(ORCH.setPermission("study_set_topic_status", null).ok, "reset must work");

  assert(ORCH.setPermission("governor_buy_item", "never").ok, "never must be settable");
  assert(ORCH.allowedToolNames().indexOf("governor_buy_item") === -1, "never-tools must leave the schema list");
  chatScript = [callTools([{ id: "a", name: "governor_buy_item", args: { itemId: "seal-rai" } }]), say("ok")];
  const ev2 = await run({ userText: "buy it anyway" });
  assert(ev2.done && ev2.done.status === "complete", "run completes");
  const msg = JSON.parse(chatLog[chatLog.length - 1].request.messages.filter(m => m.role === "tool").pop().content);
  assert(/disabled/.test(msg.error), "a disabled tool must be refused even if called");
  ORCH.setPermission("governor_buy_item", null);
});

/* ============ 3 · duplicate + failure + retry rules ============ */
console.log("== duplicate/failure guards ==");

step("an identical executed call is refused; noRetry set after a write", async () => {
  const ref = KOS.hub.LEAVES.compsci[2].ref;
  chatScript = [
    callTools([{ id: "a", name: "study_set_topic_note", args: { subject: "compsci", ref, note: "n1" } }]),
    callTools([{ id: "b", name: "study_set_topic_note", args: { subject: "compsci", ref, note: "n1" } }]),
    say("done")
  ];
  const ev = await run({ userText: "note it twice" });
  assert(ev.done.status === "complete", "completes");
  assert(ev.done.toolCalls === 1, "the duplicate must NOT execute (1 execution, got " + ev.done.toolCalls + ")");
  const dupMsg = JSON.parse(chatLog[2].request.messages.filter(m => m.role === "tool").pop().content);
  assert(/duplicate-mutation guard/.test(dupMsg.error), "duplicate refusal must be explained");
  assert(chatLog[1].request.noRetry === true && chatLog[2].request.noRetry === true,
    "after a write executes, provider calls must carry noRetry");
  assert(chatLog[0].request.noRetry === false || chatLog[0].request.noRetry === undefined || chatLog[0].request.noRetry === false,
    "the first call may retry (nothing executed yet)");
});

step("a FAILED call may be retried once, then refused — no endless retry", async () => {
  const badCall = { name: "collection_update_entry", args: { entryId: 999999, changes: { score: 5 } } };
  chatScript = [
    callTools([{ id: "a", name: badCall.name, args: badCall.args }]),
    callTools([{ id: "b", name: badCall.name, args: badCall.args }]),
    callTools([{ id: "c", name: badCall.name, args: badCall.args }]),
    say("giving up")
  ];
  const ev = await run({ userText: "poke a missing entry" });
  assert(ev.done.status === "complete", "completes");
  const toolMsgs = chatLog[3].request.messages.filter(m => m.role === "tool").map(m => JSON.parse(m.content));
  assert(/No collection entry/.test(toolMsgs[0].error), "first failure surfaces");
  assert(/No collection entry/.test(toolMsgs[1].error), "one retry allowed");
  assert(/Stop retrying/.test(toolMsgs[2].error), "third attempt must be refused by the guard");
});

/* ============ 4 · live context ============ */
console.log("== live context ==");

step("a write proposed after the screen changed fails safely; reads don't care", async () => {
  KOS.show("home");
  await tick(30);
  chatScript = [
    (req, cb) => {   // the user navigates DURING the model turn
      KOS.show("calendar");
      cb(null, { text: "", provider: "stub", model: "stub", toolCalls: [
        { id: "a", name: "todo_add_task", args: { text: "stale write" } },
        { id: "b", name: "todo_list", args: {} }
      ] });
    },
    say("ok")
  ];
  const before = KOS.store.state.todo.manual.length;
  const ev = await run({ userText: "add a task" });
  assert(ev.done.status === "complete", "completes");
  assert(KOS.store.state.todo.manual.length === before, "STALE WRITE MUST NOT RUN");
  const msgs = chatLog[1].request.messages.filter(m => m.role === "tool").map(m => JSON.parse(m.content));
  assert(/Stale context/.test(msgs[0].error) && /app_get_context/.test(msgs[0].error),
    "stale failure must instruct a context re-read");
  assert(msgs[1].auto || msgs[1].manual, "the read tool must still work");
});

step("a context change invalidates a pending confirmation", async () => {
  const add = await new Promise(r => KOS.ai.tools.execute("collection_add_entry",
    { module: "anime", title: "Context Victim", status: "planned" }, (e, res) => r(res)));
  chatScript = [
    callTools([{ id: "a", name: "collection_delete_entry", args: { entryId: add.id } }]),
    say("noted")
  ];
  const ev = await run({ userText: "delete context victim" });
  const card = ev.confirmations[0];
  KOS.show("governor");
  await tick(30);
  const err = await new Promise(r => ORCH.confirm(card.confirmationId, e => r(e)));
  assert(err && /screen changed/.test(err.message), "context change must invalidate: " + (err && err.message));
  await untilDone();
  const still = await new Promise(r => KOS.mediadb.get(add.id, (e, x) => r(x)));
  assert(still, "the action must NOT have run");
  await new Promise(r => KOS.mediadb.remove(add.id, () => r()));
});

/* ============ 5 · confirmation integrity ============ */
console.log("== confirmation integrity ==");

step("mutating the surfaced args changes nothing — the STORED args execute", async () => {
  const add = await new Promise(r => KOS.ai.tools.execute("wishlist_add_item",
    { module: "game", title: "Integrity Test", price: 30 }, (e, res) => r(res)));
  chatScript = [
    callTools([{ id: "a", name: "wishlist_remove_item", args: { id: add.id } }]),
    say("removed")
  ];
  const ev = await run({ userText: "remove integrity test" });
  const card = ev.confirmations[0];
  card.args.id = 424242;                       // attacker mutates the surfaced copy
  const pend = ORCH.pendingConfirmation();
  pend.args.id = 424242;                       // and the getter's copy
  await new Promise(r => ORCH.confirm(card.confirmationId, r));
  await untilDone();
  assert(!KOS.wishlist.get(add.id), "the ORIGINAL stored target must be the one executed");
});

step("an expired confirmation refuses and reports not-run", async () => {
  ORCH._config({ limits: { confirmMs: 60 } });
  const add = await new Promise(r => KOS.ai.tools.execute("collection_add_entry",
    { module: "anime", title: "Expiry Show", status: "planned" }, (e, res) => r(res)));
  chatScript = [
    callTools([{ id: "a", name: "collection_delete_entry", args: { entryId: add.id } }]),
    say("noted")
  ];
  const ev = await run({ userText: "delete expiry show" });
  await tick(120);
  const err = await new Promise(r => ORCH.confirm(ev.confirmations[0].confirmationId, e => r(e)));
  assert(err && /expired/.test(err.message), "expiry must refuse");
  await untilDone();
  const still = await new Promise(r => KOS.mediadb.get(add.id, (e, x) => r(x)));
  assert(still, "expired action must not run");
  ORCH._config({ limits: { confirmMs: 120000 } });
  await new Promise(r => KOS.mediadb.remove(add.id, () => r()));
});

step("a vanished target invalidates the confirmation", async () => {
  const add = await new Promise(r => KOS.ai.tools.execute("collection_add_entry",
    { module: "anime", title: "Vanishing Show", status: "planned" }, (e, res) => r(res)));
  chatScript = [
    callTools([{ id: "a", name: "collection_delete_entry", args: { entryId: add.id } }]),
    say("noted")
  ];
  const ev = await run({ userText: "delete vanishing show" });
  await new Promise(r => KOS.mediadb.remove(add.id, () => r()));   // it vanishes first
  const err = await new Promise(r => ORCH.confirm(ev.confirmations[0].confirmationId, e => r(e)));
  assert(err && /target changed|disappeared|changed since/.test(err.message), "vanished target must invalidate: " + (err && err.message));
  await untilDone();
});

step("a stale confirmation id is refused after supersession", async () => {
  const a1 = await new Promise(r => KOS.ai.tools.execute("collection_add_entry",
    { module: "anime", title: "First Card", status: "planned" }, (e, res) => r(res)));
  chatScript = [callTools([{ id: "a", name: "collection_delete_entry", args: { entryId: a1.id } }]), say("x")];
  const ev1 = await run({ userText: "delete first card" });
  const staleCard = ev1.confirmations[0];
  ORCH.cancel(ev1.requestId);                       // supersede via cancel
  await untilDone();
  const err = await new Promise(r => ORCH.confirm(staleCard.confirmationId, e => r(e)));
  assert(err && /no longer active/.test(err.message), "stale card must be refused");
  const still = await new Promise(r => KOS.mediadb.get(a1.id, (e, x) => r(x)));
  assert(still, "superseded action must not run");
  await new Promise(r => KOS.mediadb.remove(a1.id, () => r()));
});

/* ============ 6 · audit ============ */
console.log("== audit lifecycle ==");

step("auto action: proposed → executed with sanitized args + result summary", async () => {
  auditRows = []; auditLog = [];
  chatScript = [
    callTools([{ id: "a", name: "todo_add_task", args: { text: "audit me " + "x".repeat(400) } }]),
    say("added")
  ];
  await run({ userText: "add a task" });
  const inserted = auditRows.find(r => r.tool === "todo_add_task");
  assert(inserted && inserted.status === "proposed" && inserted.tier === "reversible",
    "insert row wrong — rows: " + JSON.stringify(auditRows.map(r => ({ tool: r.tool, status: r.status, tier: r.tier }))));
  assert(inserted.args_json.text.length < 350, "audit args must be clipped");
  const exec = auditLog.find(l => l.id === inserted.id && l.status === "executed");
  assert(exec && exec.result_summary && exec.result_summary.length <= 310, "executed row must carry a short summary");
});

step("confirmed action: proposed → awaiting → confirmed → executed; rejected path too", async () => {
  auditRows = []; auditLog = [];
  const add = await new Promise(r => KOS.ai.tools.execute("collection_add_entry",
    { module: "anime", title: "Audit Show", status: "planned" }, (e, res) => r(res)));
  chatScript = [callTools([{ id: "a", name: "collection_delete_entry", args: { entryId: add.id } }]), say("x")];
  const ev = await run({ userText: "delete audit show" });
  await new Promise(r => ORCH.confirm(ev.confirmations[0].confirmationId, r));
  await untilDone();
  const row = auditRows.find(r => r.tool === "collection_delete_entry");
  const seq = auditLog.filter(l => l.id === row.id).map(l => l.status);
  assert(JSON.stringify(seq) === JSON.stringify(["proposed", "awaiting_confirmation", "confirmed", "executed"]),
    "confirmed lifecycle wrong: " + JSON.stringify(seq));
  assert(/Audit Show/.test(row.target), "the audit row must carry the target description");

  auditRows = []; auditLog = [];
  const add2 = await new Promise(r => KOS.ai.tools.execute("collection_add_entry",
    { module: "anime", title: "Audit Show 2", status: "planned" }, (e, res) => r(res)));
  chatScript = [callTools([{ id: "a", name: "collection_delete_entry", args: { entryId: add2.id } }]), say("x")];
  const ev2 = await run({ userText: "delete audit show 2" });
  await new Promise(r => ORCH.reject(ev2.confirmations[0].confirmationId, r));
  await untilDone();
  const row2 = auditRows[0];
  const seq2 = auditLog.filter(l => l.id === row2.id).map(l => l.status);
  assert(seq2.includes("rejected") && !seq2.includes("executed"), "rejected lifecycle wrong: " + JSON.stringify(seq2));
  await new Promise(r => KOS.mediadb.remove(add2.id, () => r()));
});

step("failed action lands a failed row with the error summary", async () => {
  auditRows = []; auditLog = [];
  chatScript = [callTools([{ id: "a", name: "goals_delete", args: { id: 999999 } }]), say("x")];
  const ev = await run({ userText: "delete a ghost goal" });
  // consequential → confirmation card even though the target is id-bound via generic `id`
  if (ev.paused) { await new Promise(r => ORCH.confirm(ev.confirmations[0].confirmationId, () => r())); await untilDone(); }
  const row = auditRows.find(r => r.tool === "goals_delete");
  const seq = auditLog.filter(l => l.id === row.id);
  const failed = seq.find(l => l.status === "failed");
  assert(failed && /No goal/.test(failed.error_summary), "failed row must carry the error: " + JSON.stringify(seq));
});

step("signed out, audit rows queue in kv and flush when a sink appears", async () => {
  ORCH._config({ auditApi: null });      // no sink, no session → queue
  chatScript = [callTools([{ id: "a", name: "todo_add_task", args: { text: "queued audit" } }]), say("x")];
  await run({ userText: "add" });
  await tick(80);
  const q = await new Promise(r => KOS.mediadb.getKV("assistant.auditQueue", (e, v) => r(v)));
  assert(Array.isArray(q) && q.length >= 2, "signed-out lifecycle must queue (insert+update), got " + (q && q.length));
  auditRows = []; auditLog = [];
  installAudit();
  const flushed = await new Promise(r => ORCH.flushAuditQueue((e, n) => r(n)));
  assert(flushed >= 2, "flush must drain the queue");
  const q2 = await new Promise(r => KOS.mediadb.getKV("assistant.auditQueue", (e, v) => r(v)));
  assert(!q2 || q2.length === 0, "queue must be empty after flush");
});

/* ============ 7 · migration source contracts ============ */
console.log("== migration contracts ==");

step("all four assistant tables: RLS + owner-only policies; audit undeletable", async () => {
  const sql = read("supabase/migrations/20260718000002_kos_assistant.sql");
  ["kos_assistant_conversations", "kos_assistant_messages", "kos_assistant_memory", "kos_assistant_audit"]
    .forEach(t => {
      assert(new RegExp(t + " enable row level security").test(sql), t + " RLS missing");
      assert(new RegExp(t + "_select_own").test(sql), t + " select policy missing");
      assert(new RegExp(t + "_insert_own").test(sql), t + " insert policy missing");
      assert(new RegExp("references auth\\.users \\(id\\) on delete cascade[\\s\\S]*").test(sql), "user fk missing");
    });
  assert(!/kos_assistant_audit_delete/.test(sql), "audit must have NO delete policy");
  assert(/status\s+text not null check \(status in/.test(sql), "audit status check constraint missing");
  assert(/kos_touch_updated_at/.test(sql), "touch triggers missing");
  assert(!/service_role/.test(sql), "assistant tables must be plain owner-RLS (no service-role paths)");
});

step("every registered tool has exactly one tier and the orchestrator resolves it", async () => {
  KOS.ai.tools.names().forEach(n => {
    const t = KOS.ai.tools.get(n);
    assert(["read", "reversible", "consequential"].indexOf(t.tier) !== -1, n + " tier invalid");
    const mode = ORCH.effectiveMode(n);
    assert(mode === "auto" || mode === "ask" || mode === "never", n + " unresolved mode");
    if (t.tier === "consequential") assert(mode !== "auto", n + " consequential must never be auto");
  });
});

/* ============ run ============ */
(async () => {
  let failed = 0;
  for (const [name, fn] of steps) {
    try {
      await Promise.race([fn(), new Promise((_, rej) =>
        setTimeout(() => rej(new Error("STEP TIMEOUT (15s) — a callback never fired")), 15000))]);
      console.log("  ok  " + name);
    }
    catch (e) { failed++; console.error("  FAIL " + name + "\n       " + (e && e.stack ? e.stack.split("\n").slice(0, 3).join("\n       ") : e)); }
  }
  if (errors.length) { failed++; console.error("page errors: " + errors.join(" | ")); }
  await tick(100);
  console.log("\n==============================");
  if (failed) { console.error("SMOKE22 FAILED — " + failed + " step(s)"); process.exit(1); }
  console.log("SMOKE22 PASS — Category 6 Phase C orchestrator verified (" + steps.length + " steps).");
  process.exit(0);
})();
